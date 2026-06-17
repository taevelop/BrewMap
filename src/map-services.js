const webMercatorLatitudeRange = { min: -85.05112878, max: 85.05112878 };
const defaultMapProviderId = 'openStreetMap';

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function wrapLongitude(longitude) {
  return ((((longitude + 180) % 360) + 360) % 360) - 180;
}

function normalizeViewport(viewport, zoomRange) {
  return {
    latitude: clamp(Number(viewport.latitude), webMercatorLatitudeRange.min, webMercatorLatitudeRange.max),
    longitude: wrapLongitude(Number(viewport.longitude)),
    zoom: clamp(Math.round(Number(viewport.zoom)), zoomRange.min, zoomRange.max),
  };
}

function projectWebMercator(latitude, longitude, zoom, tileSize) {
  const lat = clamp(Number(latitude), webMercatorLatitudeRange.min, webMercatorLatitudeRange.max);
  const lon = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  const scale = tileSize * (2 ** zoom);
  const sinLatitude = Math.sin((lat * Math.PI) / 180);
  return {
    x: ((lon + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (4 * Math.PI)) * scale,
  };
}

function unprojectWebMercator(point, zoom, tileSize) {
  const scale = tileSize * (2 ** zoom);
  const x = Number(point.x);
  const y = clamp(Number(point.y), 0, scale);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

  const longitude = wrapLongitude((x / scale - 0.5) * 360);
  const latitude = (180 / Math.PI) * Math.atan(Math.sinh(Math.PI * (1 - 2 * y / scale)));
  return { latitude, longitude, zoom };
}

function createRasterTileElement({ url, left, top, referrerPolicy }) {
  const image = document.createElement('img');
  image.className = 'map-tile';
  image.alt = '';
  image.decoding = 'async';
  image.loading = 'lazy';
  if (referrerPolicy) image.referrerPolicy = referrerPolicy;
  image.src = url;
  image.style.left = `${Math.round(left)}px`;
  image.style.top = `${Math.round(top)}px`;
  return image;
}

function createXyzRasterMapProvider(config) {
  const provider = {
    id: config.id,
    label: config.label,
    kind: 'xyz-raster',
    tileSize: config.tileSize ?? 256,
    zoomRange: config.zoomRange,
    defaultViewport: normalizeViewport(config.defaultViewport, config.zoomRange),
    attribution: config.attribution ?? null,
    normalizeViewport(viewport) {
      return normalizeViewport(viewport, this.zoomRange);
    },
    project(latitude, longitude, zoom) {
      return projectWebMercator(latitude, longitude, zoom, this.tileSize);
    },
    unproject(point, zoom) {
      return unprojectWebMercator(point, zoom, this.tileSize);
    },
    createTileElement(tile) {
      return createRasterTileElement({
        url: config.tileUrl(tile),
        left: tile.left,
        top: tile.top,
        referrerPolicy: config.referrerPolicy,
      });
    },
    renderBaseLayer({ container, viewport, surfaceSize }) {
      if (!container) return;

      const { width, height } = surfaceSize;
      const center = this.project(viewport.latitude, viewport.longitude, viewport.zoom);
      if (!center) return;

      const startX = center.x - (width / 2);
      const startY = center.y - (height / 2);
      const minTileX = Math.floor(startX / this.tileSize);
      const maxTileX = Math.floor((center.x + (width / 2)) / this.tileSize);
      const minTileY = Math.floor(startY / this.tileSize);
      const maxTileY = Math.floor((center.y + (height / 2)) / this.tileSize);
      const tileLimit = 2 ** viewport.zoom;
      const tiles = [];

      for (let tileX = minTileX; tileX <= maxTileX; tileX += 1) {
        for (let tileY = minTileY; tileY <= maxTileY; tileY += 1) {
          if (tileY < 0 || tileY >= tileLimit) continue;

          const wrappedX = ((tileX % tileLimit) + tileLimit) % tileLimit;
          const tile = this.createTileElement({
            zoom: viewport.zoom,
            x: wrappedX,
            y: tileY,
            left: (tileX * this.tileSize) - startX,
            top: (tileY * this.tileSize) - startY,
          });
          if (tile) tiles.push(tile);
        }
      }

      container.replaceChildren(...tiles);
    },
  };

  return provider;
}

export const mapProviders = {
  openStreetMap: createXyzRasterMapProvider({
    id: 'openstreetmap',
    label: 'OpenStreetMap',
    zoomRange: { min: 9, max: 19 },
    defaultViewport: { latitude: 35.17, longitude: 129.08, zoom: 10 },
    attribution: {
      label: '\u00a9 OpenStreetMap',
      url: 'https://www.openstreetmap.org/copyright',
    },
    referrerPolicy: 'origin',
    tileUrl: ({ zoom, x, y }) => `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`,
  }),
};

export function getMapProvider(providerId = defaultMapProviderId) {
  return mapProviders[providerId] ?? mapProviders[defaultMapProviderId];
}
