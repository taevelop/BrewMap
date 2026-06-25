import { getMapProvider } from './map-services.js';

const retroMapProvider = getMapProvider();
const retroMapZoomRange = retroMapProvider.zoomRange;
const retroNeighborhoodMapZoom = 16;
const retroClusterBreakoutZoom = 16;

const programDefinitions = [
  {
    id: 'local-zine',
    label: '오늘의 발견',
    mobileLabel: '발견',
    file: 'LOCAL_ZINE',
    title: 'LOCAL_ZINE.EXE',
    menu: ['파일', '이번 호', '동네', '보기'],
    defaultRect: { x: 220, y: 46, width: 620, height: 680 },
  },
  {
    id: 'cafe-index',
    label: '카페 인덱스',
    mobileLabel: '인덱스',
    file: 'CAFE_INDEX',
    title: 'CAFE_INDEX.EXE',
    menu: ['파일', '검색', '필터', '지도', '보기'],
    defaultRect: { x: 360, y: 96, width: 980, height: 620 },
  },
  {
    id: 'brewmap-map',
    label: '지도',
    mobileLabel: '지도',
    file: 'BREWMAP',
    title: 'BREWMAP.EXE',
    menu: ['파일', '카페', '경로', '보기'],
    defaultRect: { x: 560, y: 138, width: 760, height: 560 },
  },
  {
    id: 'nearby-map',
    label: '주변 지도',
    mobileLabel: '주변',
    file: 'NEARBY_MAP',
    title: 'NEARBY_MAP.EXE',
    menu: ['파일', '지도', '위치', '보기'],
    defaultRect: { x: 320, y: 118, width: 920, height: 640 },
  },
  {
    id: 'brew-log',
    label: '나의 단골 장부',
    mobileLabel: '장부',
    file: 'BREW_LOG',
    title: 'BREW_LOG.EXE',
    menu: ['파일', '폴더', '도장', '내보내기', '보기'],
    defaultRect: { x: 420, y: 160, width: 760, height: 600 },
  },
];

const visitStorageKey = 'brewmap.retroDesktop.visits.v1';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function readJsonStorage(key, fallback) {
  if (typeof localStorage === 'undefined') return fallback;

  try {
    const parsed = JSON.parse(localStorage.getItem(key) || 'null');
    return parsed && typeof parsed === 'object' ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function writeJsonStorage(key, value) {
  if (typeof localStorage === 'undefined') return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can fail in private browsing or restricted environments.
  }
}

function defaultWindowState(definition) {
  return {
    isOpen: definition.id === 'local-zine',
    mode: 'normal',
    position: { x: definition.defaultRect.x, y: definition.defaultRect.y },
    size: { width: definition.defaultRect.width, height: definition.defaultRect.height },
    restorePosition: { x: definition.defaultRect.x, y: definition.defaultRect.y },
    restoreSize: { width: definition.defaultRect.width, height: definition.defaultRect.height },
  };
}

function primaryTags(cafe, labelFor) {
  return (cafe?.capabilities || []).slice(0, 3).map(labelFor).join(' · ') || '커피 태그 확인 중';
}

function safeMapLink(cafe) {
  return cafe?.links?.naver || cafe?.links?.kakao || cafe?.links?.google || '#map';
}

function cafePosition(cafe, cafes) {
  const coordinates = cafes
    .map((item) => ({ latitude: Number(item.latitude), longitude: Number(item.longitude) }))
    .filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude));

  if (!coordinates.length) return { left: 50, top: 50 };

  const latitudes = coordinates.map((item) => item.latitude);
  const longitudes = coordinates.map((item) => item.longitude);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const latitudeSpan = Math.max(maxLatitude - minLatitude, 0.01);
  const longitudeSpan = Math.max(maxLongitude - minLongitude, 0.01);
  const latitude = Number(cafe.latitude);
  const longitude = Number(cafe.longitude);

  return {
    left: clamp(8 + ((longitude - minLongitude) / longitudeSpan) * 84, 8, 92),
    top: clamp(92 - ((latitude - minLatitude) / latitudeSpan) * 84, 8, 92),
  };
}

function deriveFilters(cafes, fallbackFilters, labelFor) {
  if (fallbackFilters.length) return fallbackFilters.slice(0, 10);

  const tags = new Map();
  cafes.forEach((cafe) => {
    (cafe.capabilities || []).forEach((key) => {
      if (!tags.has(key)) tags.set(key, { key, label: labelFor(key) });
    });
  });
  return [...tags.values()].slice(0, 10);
}

export function createRetroDesktop({
  root,
  standardRoots = [],
  getCafes,
  getSavedCafeIds,
  getFilters,
  toggleSaved,
  tagLabel,
  confidenceLabel,
  verificationSourceLabel,
}) {
  if (!root) return { render() {}, syncRoute() {} };

  const windows = Object.fromEntries(programDefinitions.map((definition) => [definition.id, defaultWindowState(definition)]));
  const state = {
    windows,
    zOrder: ['local-zine'],
    activeProgramId: 'local-zine',
    selectedCafeId: null,
    storyIndex: 0,
    activeFilters: new Set(),
    taskbarBadges: { 'brew-log': 0 },
    visits: readJsonStorage(visitStorageKey, {}),
    visitDraftCafeId: null,
    clock: new Date(),
    mapViewport: { ...retroMapProvider.defaultViewport },
    userLocation: null,
    locationStatus: '현재 위치를 설정하면 주변 카페 지도가 열립니다.',
  };
  let routeActive = true;
  let clockTimer = null;
  let dragState = null;
  let mapDragState = null;

  function cafes() {
    return (getCafes?.() || []).filter((cafe) => cafe.status !== 'hidden');
  }

  function activeCafes() {
    return cafes().filter((cafe) => cafe.status === 'active');
  }

  function savedCafeIds() {
    return getSavedCafeIds?.() || new Set();
  }

  function selectedCafe() {
    const items = activeCafes();
    if (!items.length) return null;
    const selected = items.find((cafe) => cafe.id === state.selectedCafeId);
    return selected || items[clamp(state.storyIndex, 0, items.length - 1)] || items[0];
  }

  function filteredIndexCafes() {
    const filters = [...state.activeFilters];
    return activeCafes().filter((cafe) => filters.every((filter) => cafe.capabilities.includes(filter)));
  }

  function focusProgram(programId) {
    const windowState = state.windows[programId];
    if (!windowState) return;

    windowState.isOpen = true;
    if (windowState.mode === 'minimized') windowState.mode = 'normal';
    state.zOrder = [...state.zOrder.filter((id) => id !== programId), programId];
    state.activeProgramId = programId;
    if (programId === 'brew-log') state.taskbarBadges['brew-log'] = 0;
  }

  function openProgram(programId) {
    focusProgram(programId);
    render();
  }

  function closeProgram(programId) {
    const windowState = state.windows[programId];
    if (!windowState) return;

    windowState.isOpen = false;
    windowState.mode = 'normal';
    state.zOrder = state.zOrder.filter((id) => id !== programId);
    state.activeProgramId = state.zOrder.at(-1) || null;
    render();
  }

  function minimizeProgram(programId) {
    const windowState = state.windows[programId];
    if (!windowState) return;

    windowState.mode = 'minimized';
    state.activeProgramId = state.zOrder.filter((id) => state.windows[id]?.mode !== 'minimized').at(-1) || null;
    render();
  }

  function toggleMaximizeProgram(programId) {
    const windowState = state.windows[programId];
    if (!windowState) return;

    focusProgram(programId);
    if (windowState.mode === 'maximized') {
      windowState.mode = 'normal';
      windowState.position = { ...windowState.restorePosition };
      windowState.size = { ...windowState.restoreSize };
    } else {
      windowState.restorePosition = { ...windowState.position };
      windowState.restoreSize = { ...windowState.size };
      windowState.mode = 'maximized';
    }
    render();
  }

  function resetLayout() {
    programDefinitions.forEach((definition) => {
      state.windows[definition.id] = defaultWindowState(definition);
    });
    state.zOrder = ['local-zine'];
    state.activeProgramId = 'local-zine';
    state.taskbarBadges = { 'brew-log': 0 };
    state.visitDraftCafeId = null;
    render();
  }

  function selectCafe(cafeId) {
    const items = activeCafes();
    const nextIndex = items.findIndex((cafe) => cafe.id === cafeId);
    state.selectedCafeId = cafeId;
    if (nextIndex >= 0) state.storyIndex = nextIndex;
  }

  function saveCafe(cafeId) {
    const wasSaved = savedCafeIds().has(cafeId);
    toggleSaved?.(cafeId);
    if (!wasSaved) state.taskbarBadges['brew-log'] = (state.taskbarBadges['brew-log'] || 0) + 1;
    render();
  }

  function openVisitForm(cafeId) {
    selectCafe(cafeId);
    state.visitDraftCafeId = cafeId;
    focusProgram('brew-log');
    render();
  }

  function closeVisitForm() {
    state.visitDraftCafeId = null;
    render();
  }

  function stampVisit(cafeId, payload = {}) {
    const today = payload.visitedAt || new Date().toISOString().slice(0, 10);
    const current = state.visits[cafeId] || { count: 0, lastVisitedAt: '' };
    state.visits[cafeId] = {
      count: Number(current.count || 0) + 1,
      lastVisitedAt: today,
      lastVisitType: payload.visitType || current.lastVisitType || '방문',
      favoriteMenu: payload.favoriteMenu || current.favoriteMenu || '',
      memo: payload.memo || current.memo || '',
    };
    writeJsonStorage(visitStorageKey, state.visits);
    state.taskbarBadges['brew-log'] = 0;
    state.visitDraftCafeId = null;
    render();
  }


  function mapSurfaceSize() {
    const surface = root.querySelector('[data-retro-map-surface]');
    const rect = surface?.getBoundingClientRect();
    return {
      width: rect?.width || surface?.clientWidth || 560,
      height: rect?.height || surface?.clientHeight || 430,
    };
  }

  function projectMap(latitude, longitude, zoom = state.mapViewport.zoom) {
    return retroMapProvider.project(latitude, longitude, zoom)
      || retroMapProvider.project(retroMapProvider.defaultViewport.latitude, retroMapProvider.defaultViewport.longitude, zoom);
  }

  function unprojectMap(point, zoom = state.mapViewport.zoom) {
    return retroMapProvider.unproject(point, zoom) || { ...retroMapProvider.defaultViewport, zoom };
  }

  function setRetroMapViewportFromCenterPoint(centerPoint, zoom = state.mapViewport.zoom) {
    const nextZoom = clamp(Math.round(zoom), retroMapZoomRange.min, retroMapZoomRange.max);
    const nextCenter = unprojectMap(centerPoint, nextZoom);
    state.mapViewport = retroMapProvider.normalizeViewport({ ...nextCenter, zoom: nextZoom });
  }

  function screenPositionForCafeInViewport(cafe, viewport, surfaceSize) {
    const { width, height } = surfaceSize;
    const center = projectMap(viewport.latitude, viewport.longitude, viewport.zoom);
    const point = projectMap(cafe.latitude, cafe.longitude, viewport.zoom);
    return {
      left: width / 2 + point.x - center.x,
      top: height / 2 + point.y - center.y,
    };
  }

  function screenPositionForCafe(cafe) {
    return screenPositionForCafeInViewport(cafe, state.mapViewport, mapSurfaceSize());
  }

  function fitRetroMapToItems(items) {
    const coordinates = items.map((cafe) => ({ latitude: Number(cafe.latitude), longitude: Number(cafe.longitude) }))
      .filter((coordinate) => Number.isFinite(coordinate.latitude) && Number.isFinite(coordinate.longitude));
    if (!coordinates.length) {
      state.mapViewport = { ...retroMapProvider.defaultViewport };
      return;
    }

    const bounds = coordinates.reduce((accumulator, coordinate) => ({
      minLatitude: Math.min(accumulator.minLatitude, coordinate.latitude),
      maxLatitude: Math.max(accumulator.maxLatitude, coordinate.latitude),
      minLongitude: Math.min(accumulator.minLongitude, coordinate.longitude),
      maxLongitude: Math.max(accumulator.maxLongitude, coordinate.longitude),
    }), {
      minLatitude: coordinates[0].latitude,
      maxLatitude: coordinates[0].latitude,
      minLongitude: coordinates[0].longitude,
      maxLongitude: coordinates[0].longitude,
    });
    const center = {
      latitude: (bounds.minLatitude + bounds.maxLatitude) / 2,
      longitude: (bounds.minLongitude + bounds.maxLongitude) / 2,
    };
    state.mapViewport = retroMapProvider.normalizeViewport({ ...center, zoom: coordinates.length === 1 ? retroNeighborhoodMapZoom : 12 });
  }

  function zoomRetroMapBy(delta) {
    const zoom = clamp(state.mapViewport.zoom + delta, retroMapZoomRange.min, retroMapZoomRange.max);
    if (zoom === state.mapViewport.zoom) return;
    state.mapViewport = retroMapProvider.normalizeViewport({ ...state.mapViewport, zoom });
    render();
  }

  function clusterRetroMapItems(items) {
    if (state.mapViewport.zoom >= retroClusterBreakoutZoom) {
      return items.map((cafe) => ({ items: [cafe], ...screenPositionForCafe(cafe) }));
    }

    const cellSize = state.mapViewport.zoom >= 13 ? 44 : 64;
    const clusters = new Map();
    items.forEach((cafe) => {
      const position = screenPositionForCafe(cafe);
      const key = `${Math.floor(position.left / cellSize)}:${Math.floor(position.top / cellSize)}`;
      const cluster = clusters.get(key) || { items: [], left: 0, top: 0, latitude: 0, longitude: 0 };
      cluster.items.push(cafe);
      cluster.left += position.left;
      cluster.top += position.top;
      cluster.latitude += Number(cafe.latitude);
      cluster.longitude += Number(cafe.longitude);
      clusters.set(key, cluster);
    });

    return [...clusters.values()].map((cluster) => ({
      items: cluster.items,
      left: cluster.left / cluster.items.length,
      top: cluster.top / cluster.items.length,
      latitude: cluster.latitude / cluster.items.length,
      longitude: cluster.longitude / cluster.items.length,
    }));
  }

  function hydrateRetroMap() {
    const surface = root.querySelector('[data-retro-map-surface]');
    const baseLayer = root.querySelector('[data-retro-map-base]');
    const markerLayer = root.querySelector('[data-retro-map-markers]');
    if (!surface || !baseLayer || !markerLayer) return;

    retroMapProvider.renderBaseLayer({ container: baseLayer, viewport: state.mapViewport, surfaceSize: mapSurfaceSize() });
    const cafePins = clusterRetroMapItems(activeCafes()).map((cluster) => {
      if (cluster.items.length > 1) {
        const clusterButton = document.createElement('button');
        clusterButton.type = 'button';
        clusterButton.className = 'retro-map-cluster';
        clusterButton.style.left = `${cluster.left.toFixed(1)}px`;
        clusterButton.style.top = `${cluster.top.toFixed(1)}px`;
        clusterButton.textContent = cluster.items.length;
        clusterButton.title = cluster.items.slice(0, 3).map((cafe) => cafe.name).join(', ');
        clusterButton.setAttribute('aria-label', `${cluster.items.length}개 카페 지도 묶음`);
        clusterButton.addEventListener('click', () => {
          state.mapViewport = retroMapProvider.normalizeViewport({
            latitude: cluster.latitude,
            longitude: cluster.longitude,
            zoom: Math.min(retroMapZoomRange.max, state.mapViewport.zoom + 2),
          });
          render();
        });
        return clusterButton;
      }

      const [cafe] = cluster.items;
      const pin = document.createElement('button');
      pin.type = 'button';
      pin.className = `retro-map-pin ${state.selectedCafeId === cafe.id ? 'is-active' : ''}`;
      pin.style.left = `${cluster.left.toFixed(1)}px`;
      pin.style.top = `${cluster.top.toFixed(1)}px`;
      pin.title = cafe.name;
      pin.setAttribute('aria-label', `${cafe.name} 지도 핀`);
      pin.dataset.retroSelectCafe = cafe.id;
      return pin;
    });
    if (state.userLocation) {
      const position = screenPositionForCafe(state.userLocation);
      const userPin = document.createElement('span');
      userPin.className = 'retro-user-pin';
      userPin.style.left = `${position.left.toFixed(1)}px`;
      userPin.style.top = `${position.top.toFixed(1)}px`;
      userPin.setAttribute('aria-label', '내 위치');
      cafePins.push(userPin);
    }
    markerLayer.replaceChildren(...cafePins);
  }


  function hydrateCafeOsmMaps() {
    root.querySelectorAll('[data-cafe-osm-map]').forEach((surface) => {
      const selected = selectedCafe();
      const baseLayer = surface.querySelector('[data-cafe-osm-base]');
      const markerLayer = surface.querySelector('[data-cafe-osm-markers]');
      if (!selected || !baseLayer || !markerLayer) return;

      const items = [selected, ...activeCafes()
        .filter((cafe) => cafe.id !== selected.id && cafe.area === selected.area)
        .slice(0, 4)];
      const viewport = retroMapProvider.normalizeViewport({
        latitude: selected.latitude,
        longitude: selected.longitude,
        zoom: retroNeighborhoodMapZoom,
      });
      const rect = surface.getBoundingClientRect();
      const surfaceSize = { width: rect.width || surface.clientWidth || 560, height: rect.height || surface.clientHeight || 360 };
      retroMapProvider.renderBaseLayer({ container: baseLayer, viewport, surfaceSize });
      const pins = items.map((cafe, index) => {
        const position = screenPositionForCafeInViewport(cafe, viewport, surfaceSize);
        const pin = document.createElement('button');
        pin.type = 'button';
        pin.className = `retro-map-pin cafe-osm-pin ${cafe.id === selected.id ? 'is-active' : ''}`;
        pin.style.left = `${position.left.toFixed(1)}px`;
        pin.style.top = `${position.top.toFixed(1)}px`;
        pin.title = cafe.name;
        pin.setAttribute('aria-label', `${cafe.name} OSM 지도 핀`);
        pin.dataset.retroSelectCafe = cafe.id;
        pin.textContent = cafe.id === selected.id ? '★' : String(index).padStart(2, '0');
        return pin;
      });
      markerLayer.replaceChildren(...pins);
    });
  }

  function programStatus(programId) {
    const items = activeCafes();
    const selected = selectedCafe();
    const savedCount = savedCafeIds().size;

    if (programId === 'local-zine') return `${items.length ? state.storyIndex + 1 : 0} / ${items.length}개 이야기 · 부산`;
    if (programId === 'cafe-index') return `${filteredIndexCafes().length}개 결과 · ${items.length}개 운영 중 · 정보 확인`;
    if (programId === 'brewmap-map') return selected ? `${selected.name} · ${selected.area} · 카페 지도` : '선택한 카페 없음';
    if (programId === 'nearby-map') return `${items.length}개 카페 · ${state.userLocation ? '내 위치 사용' : '부산 기본 위치'} · 지도 준비`;
    return `${savedCount}개 저장 · ${Object.values(state.visits).reduce((sum, visit) => sum + Number(visit.count || 0), 0)}회 방문`;
  }

  function renderDesktopShortcut(definition) {
    const windowState = state.windows[definition.id];
    const isOpen = windowState.isOpen && windowState.mode !== 'minimized';
    return `
      <button class="retro-shortcut ${isOpen ? 'is-open' : ''}" type="button" data-open-program="${definition.id}">
        <span class="retro-shortcut-icon"><img src="./assets/brewmap-brand-icon.svg" alt="" width="28" height="28" /></span>
        <span>${escapeHtml(definition.label)}</span>
        <small>${escapeHtml(definition.file)}</small>
      </button>
    `;
  }

  function renderWindow(definition) {
    const windowState = state.windows[definition.id];
    if (!windowState.isOpen || windowState.mode === 'minimized') return '';

    const zIndex = 20 + state.zOrder.indexOf(definition.id);
    const isActive = state.activeProgramId === definition.id;
    const rectStyle = windowState.mode === 'maximized'
      ? `z-index: ${zIndex};`
      : `left: ${windowState.position.x}px; top: ${windowState.position.y}px; width: ${windowState.size.width}px; height: ${windowState.size.height}px; z-index: ${zIndex};`;
    const menu = definition.menu.map((item) => `<button type="button">${escapeHtml(item)}</button>`).join('');

    return `
      <article
        class="retro-window"
        style="${rectStyle}"
        data-program-window="${definition.id}"
        data-active="${isActive}"
        data-mode="${windowState.mode}"
        aria-label="${escapeHtml(definition.title)}"
      >
        <header class="retro-titlebar" data-retro-titlebar="${definition.id}">
          <span>${escapeHtml(definition.title)}</span>
          <div class="retro-window-controls" aria-label="${escapeHtml(definition.title)} 창 제어">
            <button type="button" aria-label="${escapeHtml(definition.label)} 최소화" data-window-action="minimize" data-program-id="${definition.id}">_</button>
            <button type="button" aria-label="${escapeHtml(definition.label)} 최대화 또는 복원" data-window-action="maximize" data-program-id="${definition.id}">□</button>
            <button type="button" aria-label="${escapeHtml(definition.label)} 닫기" data-window-action="close" data-program-id="${definition.id}">×</button>
          </div>
        </header>
        <nav class="retro-menubar" aria-label="${escapeHtml(definition.title)} 메뉴">${menu}</nav>
        <div class="retro-program-body">${renderProgramContent(definition.id)}</div>
        <footer class="retro-statusbar">${escapeHtml(programStatus(definition.id))}</footer>
      </article>
    `;
  }

  function renderLocalZineProgram() {
    const items = activeCafes();
    if (!items.length) {
      return `
        <div class="retro-empty">
          <h2>이번 호를 준비 중입니다.</h2>
          <p>카페 데이터가 로드되면 로컬 매거진이 열립니다.</p>
          <button type="button" data-open-program="cafe-index">카페 인덱스 열기</button>
        </div>
      `;
    }

    const cafe = selectedCafe();
    const isSaved = savedCafeIds().has(cafe.id);
    return `
      <section class="local-zine-program">
        <p class="retro-kicker">ISSUE ${String(state.storyIndex + 1).padStart(2, '0')} · ${escapeHtml(cafe.area)}</p>
        <div class="zine-cover" aria-label="${escapeHtml(cafe.name)} 대표 이미지 대체 그래픽">
          <img src="./assets/brewmap-brand-icon.svg" alt="" width="72" height="72" />
          <span>${escapeHtml(cafe.city)} · ${escapeHtml(cafe.area)}</span>
        </div>
        <h2>${escapeHtml(cafe.name)}에서 마실 수 있는 커피</h2>
        <p>${escapeHtml(cafe.address)}</p>
        <p class="zine-summary">${escapeHtml(primaryTags(cafe, tagLabel))} 중심으로 확인된 로컬 카페입니다. 별점 대신 검증 출처와 최근 확인 정보를 먼저 봅니다.</p>
        <div class="retro-action-row">
          <button type="button" data-open-program="cafe-index" data-retro-select-cafe="${escapeHtml(cafe.id)}">이야기 읽기</button>
          <button type="button" data-retro-open-map="${escapeHtml(cafe.id)}">지도에서 열기</button>
          <button type="button" class="${isSaved ? 'is-saved' : ''}" aria-pressed="${isSaved}" data-retro-save="${escapeHtml(cafe.id)}">${isSaved ? '스크랩됨' : '스크랩'}</button>
        </div>
        <div class="story-controls">
          <button type="button" data-retro-story="previous">이전</button>
          <button type="button" data-retro-story="next">다음</button>
        </div>
      </section>
    `;
  }

  function renderCafeIndexProgram() {
    const allCafes = activeCafes();
    const filters = deriveFilters(allCafes, getFilters?.() || [], tagLabel);
    const items = filteredIndexCafes();
    const selected = items.find((cafe) => cafe.id === state.selectedCafeId) || items[0] || selectedCafe();

    if (selected) state.selectedCafeId = selected.id;

    const filterButtons = filters.map((filter) => `
      <button type="button" class="${state.activeFilters.has(filter.key) ? 'is-active' : ''}" aria-pressed="${state.activeFilters.has(filter.key)}" data-retro-filter="${escapeHtml(filter.key)}">
        ${escapeHtml(filter.label)}
      </button>
    `).join('');
    const records = items.length ? items.map((cafe, index) => `
      <button type="button" class="cafe-record ${selected?.id === cafe.id ? 'is-active' : ''}" data-retro-select-cafe="${escapeHtml(cafe.id)}">
        <strong>${String(index + 1).padStart(2, '0')} ${escapeHtml(cafe.name)}</strong>
        <span>${escapeHtml(primaryTags(cafe, tagLabel))}</span>
        <small>${escapeHtml(cafe.verifiedAt || '확인일 없음')} · ${escapeHtml(cafe.area)}</small>
      </button>
    `).join('') : '<div class="retro-empty"><h3>조건에 맞는 카페가 없습니다</h3><p>선택한 조건에 맞는 카페가 없습니다.</p><button type="button" data-retro-clear-filters>필터 초기화</button></div>';

    return `
      <section class="cafe-index-program">
        <aside class="index-filter-panel">
          <h3>검색 조건</h3>
          <div>${filterButtons}</div>
          <button type="button" class="retro-secondary-action" data-retro-clear-filters>필터 초기화</button>
        </aside>
        <div class="index-record-list">
          <h3>카페 결과</h3>
          ${records}
        </div>
        <aside class="index-detail-panel">
          ${selected ? renderIndexDetail(selected) : '<div class="retro-empty"><h3>선택한 카페 없음</h3><p>카페를 선택하면 상세 레코드가 표시됩니다.</p></div>'}
        </aside>
      </section>
    `;
  }

  function renderIndexDetail(cafe) {
    const isSaved = savedCafeIds().has(cafe.id);
    return `
      <p class="retro-kicker">RECORD ${escapeHtml(cafe.confidence || 'X')}</p>
      <div class="record-photo" aria-hidden="true">${escapeHtml(cafe.area)}</div>
      <h3>${escapeHtml(cafe.name)}</h3>
      <p>${escapeHtml(cafe.address)}</p>
      <dl class="retro-data-grid">
        <div><dt>커피</dt><dd>${escapeHtml(primaryTags(cafe, tagLabel))}</dd></div>
        <div><dt>확인 근거</dt><dd>${escapeHtml(verificationSourceLabel(cafe.source))}</dd></div>
        <div><dt>최근 확인</dt><dd>${escapeHtml(cafe.verifiedAt || '-')}</dd></div>
        <div><dt>신뢰도</dt><dd>${escapeHtml(confidenceLabel(cafe.confidence))}</dd></div>
      </dl>
      <div class="retro-action-row">
        <button type="button" data-retro-open-map="${escapeHtml(cafe.id)}">지도에서 보기</button>
        <button type="button" class="${isSaved ? 'is-saved' : ''}" aria-pressed="${isSaved}" data-retro-save="${escapeHtml(cafe.id)}">${isSaved ? '저장됨' : '장부에 저장'}</button>
        <a href="${escapeHtml(safeMapLink(cafe))}" target="_blank" rel="noreferrer">외부 지도</a>
      </div>
    `;
  }

  function renderMapProgram() {
    const items = activeCafes();
    const selected = selectedCafe();
    const isSaved = selected ? savedCafeIds().has(selected.id) : false;
    const nearbyItems = selected
      ? items.filter((cafe) => cafe.id !== selected.id && cafe.area === selected.area).slice(0, 4)
      : [];

    return `
      <section class="cafe-sketch-program">
        <div class="cafe-sketch-panel">
          <div class="cafe-sketch-toolbar">
            <span>카페 위치 지도</span>
            <button type="button" data-open-program="nearby-map">주변 일반 지도 열기</button>
          </div>
          <div class="cafe-sketch-surface cafe-osm-surface" role="img" aria-label="OpenStreetMap 배경으로 표시한 선택 카페 주변 지도" data-cafe-osm-map>
            <div class="retro-map-base" data-cafe-osm-base aria-hidden="true"></div>
            <div class="retro-map-markers" data-cafe-osm-markers></div>
            <a class="retro-map-attribution" href="${escapeHtml(retroMapProvider.attribution?.url || '#')}" target="_blank" rel="noreferrer">${escapeHtml(retroMapProvider.attribution?.label || '지도 데이터')}</a>
          </div>
          <p class="cafe-sketch-caption">BREWMAP.EXE는 선택한 카페를 중심으로 OpenStreetMap 배경을 표시합니다. 핀치 줌과 드래그 탐색은 NEARBY_MAP.EXE에서 사용할 수 있습니다.</p>
        </div>
        <aside class="map-record">
          ${selected ? `
            <p class="retro-kicker">카페 위치</p>
            <h3>${escapeHtml(selected.name)}</h3>
            <p>${escapeHtml(selected.city)} · ${escapeHtml(selected.area)}</p>
            <p>${escapeHtml(selected.address)}</p>
            <dl class="retro-data-grid">
              <div><dt>커피</dt><dd>${escapeHtml(primaryTags(selected, tagLabel))}</dd></div>
              <div><dt>확인 근거</dt><dd>${escapeHtml(verificationSourceLabel(selected.source))}</dd></div>
              <div><dt>주변 카페</dt><dd>${nearbyItems.length ? nearbyItems.map((cafe) => cafe.name).join(' · ') : '같은 권역 주변 카페 준비 중'}</dd></div>
            </dl>
            <div class="retro-action-row">
              <button type="button" data-open-program="cafe-index" data-retro-select-cafe="${escapeHtml(selected.id)}">인덱스 열기</button>
              <button type="button" class="${isSaved ? 'is-saved' : ''}" aria-pressed="${isSaved}" data-retro-save="${escapeHtml(selected.id)}">${isSaved ? '저장됨' : '장부에 저장'}</button>
            </div>
          ` : '<div class="retro-empty"><h3>선택한 핀 없음</h3><p>지도 핀을 선택하면 카페 정보가 표시됩니다.</p></div>'}
        </aside>
      </section>
    `;
  }

  function renderNearbyMapProgram() {
    const items = activeCafes();
    const selected = selectedCafe();
    const providerLabel = retroMapProvider.attribution?.label || '지도 데이터';
    const providerUrl = retroMapProvider.attribution?.url || '#';

    return `
      <section class="retro-map-shell">
        <div class="retro-map-toolbar" aria-label="주변 지도 도구">
          <span>주변 지도 · Z${escapeHtml(state.mapViewport.zoom)}</span>
          <button type="button" data-retro-request-location>내 위치</button>
          <button type="button" data-retro-fit-map>전체 보기</button>
          <button type="button" data-retro-map-zoom="1" aria-label="주변 지도 확대">+</button>
          <button type="button" data-retro-map-zoom="-1" aria-label="주변 지도 축소">-</button>
        </div>
        <div class="retro-map-surface" data-retro-map-surface tabindex="0" role="application" aria-label="주변 카페 지도. 드래그하거나 휠, 더하기, 빼기 키로 이동할 수 있습니다.">
          <div class="retro-map-base" data-retro-map-base aria-hidden="true"></div>
          <div class="retro-map-markers" data-retro-map-markers></div>
          <a class="retro-map-attribution" href="${escapeHtml(providerUrl)}" target="_blank" rel="noreferrer">${escapeHtml(providerLabel)}</a>
          <p class="nearby-status" aria-live="polite">
            ${escapeHtml(items.length)}개 카페 · ${selected ? escapeHtml(selected.area) : '부산'} · ${escapeHtml(state.locationStatus)}
          </p>
        </div>
      </section>
    `;
  }

  function renderBrewLogProgram() {
    const savedItems = cafes().filter((cafe) => savedCafeIds().has(cafe.id));
    const selected = savedItems.find((cafe) => cafe.id === state.selectedCafeId) || savedItems[0] || selectedCafe();

    const savedRecords = savedItems.length ? savedItems.map((cafe, index) => `
      <button type="button" class="saved-record ${selected?.id === cafe.id ? 'is-active' : ''}" data-retro-select-cafe="${escapeHtml(cafe.id)}">
        <strong>[${String(index + 1).padStart(2, '0')}] ${escapeHtml(cafe.name)}</strong>
        <span>${escapeHtml(cafe.area)} · 방문 ${Number(state.visits[cafe.id]?.count || 0)}회</span>
      </button>
    `).join('') : '<p class="empty-note">아직 저장한 카페가 없습니다.</p>';

    return `
      <section class="brew-log-program">
        <aside class="folder-tree">
          <h3>내 폴더</h3>
          <button type="button">▣ 스크랩</button>
          <button type="button">▣ 가고 싶은 곳</button>
          <button type="button">▣ 방문한 곳</button>
          <button type="button">▣ 단골이 된 곳</button>
          <button type="button">▣ 내 메모</button>
        </aside>
        <div class="saved-record-list">
          <h3>저장한 카페</h3>
          ${savedRecords}
        </div>
        <aside class="log-detail">
          ${selected ? renderLogDetail(selected) : '<div class="retro-empty"><h3>내 로컬 기록</h3><p>저장 후 장부에서 방문 기록을 남길 수 있습니다.</p></div>'}
        </aside>
      </section>
    `;
  }

  function renderLogDetail(cafe) {
    const visit = state.visits[cafe.id] || { count: 0, lastVisitedAt: '' };
    const isSaved = savedCafeIds().has(cafe.id);
    const favoriteMenu = visit.favoriteMenu || primaryTags(cafe, tagLabel);
    const memo = visit.memo || `${cafe.area}에서 다시 확인할 로컬 커피 기록`;
    const visitType = visit.lastVisitType || '-';

    return `
      <p class="retro-kicker">CAFE_${escapeHtml(cafe.confidence || 'X')}.LOG</p>
      <h3>${escapeHtml(cafe.name)}</h3>
      ${state.visitDraftCafeId === cafe.id ? renderVisitStampForm(cafe, visit) : ''}
      <dl class="retro-data-grid">
        <div><dt>저장 상태</dt><dd>${isSaved ? '저장됨' : '미저장'}</dd></div>
        <div><dt>방문</dt><dd>${Number(visit.count || 0)}회</dd></div>
        <div><dt>마지막 방문</dt><dd>${escapeHtml(visit.lastVisitedAt || '-')}</dd></div>
        <div><dt>방문 형태</dt><dd>${escapeHtml(visitType)}</dd></div>
        <div><dt>기억할 커피</dt><dd>${escapeHtml(favoriteMenu)}</dd></div>
      </dl>
      <p class="log-note">"${escapeHtml(memo)}"</p>
      <div class="retro-action-row">
        ${state.visitDraftCafeId === cafe.id ? '' : `<button type="button" data-retro-stamp="${escapeHtml(cafe.id)}">방문 도장</button>`}
        <button type="button" data-retro-open-map="${escapeHtml(cafe.id)}">지도에서 보기</button>
      </div>
    `;
  }

  function renderVisitStampForm(cafe, visit) {
    const today = new Date().toISOString().slice(0, 10);
    const visitedAt = visit.lastVisitedAt || today;
    const favoriteMenu = visit.favoriteMenu || primaryTags(cafe, tagLabel);
    const visitType = visit.lastVisitType || '혼자 방문';
    const memo = visit.memo || '';
    const option = (value, label) => `<option value="${escapeHtml(value)}" ${visitType === value ? 'selected' : ''}>${escapeHtml(label)}</option>`;

    return `
      <form class="visit-stamp-form" data-retro-visit-form data-cafe-id="${escapeHtml(cafe.id)}">
        <h4>방문 도장</h4>
        <label>방문일<input type="date" name="visitedAt" value="${escapeHtml(visitedAt)}" required /></label>
        <label>방문 형태<select name="visitType">
          ${option('혼자 방문', '혼자 방문')}
          ${option('대화', '대화')}
          ${option('작업', '작업')}
          ${option('테이크아웃', '테이크아웃')}
        </select></label>
        <label>기억할 메뉴<input name="favoriteMenu" value="${escapeHtml(favoriteMenu)}" placeholder="예: 필터커피" /></label>
        <label>한 줄 메모<textarea name="memo" rows="2" placeholder="다시 떠올릴 방문 메모">${escapeHtml(memo)}</textarea></label>
        <div class="retro-action-row">
          <button type="submit">도장 저장</button>
          <button type="button" data-retro-cancel-stamp>취소</button>
        </div>
      </form>
    `;
  }

  function renderProgramContent(programId) {
    if (programId === 'local-zine') return renderLocalZineProgram();
    if (programId === 'cafe-index') return renderCafeIndexProgram();
    if (programId === 'brewmap-map') return renderMapProgram();
    if (programId === 'nearby-map') return renderNearbyMapProgram();
    return renderBrewLogProgram();
  }

  function renderTaskbarButton(definition) {
    const windowState = state.windows[definition.id];
    const isOpen = windowState.isOpen;
    const isActive = state.activeProgramId === definition.id && windowState.mode !== 'minimized';
    const badge = state.taskbarBadges[definition.id] || 0;

    return `
      <button type="button" class="${isActive ? 'is-active' : ''}" data-open-program="${definition.id}" aria-pressed="${isActive}">
        <span class="taskbar-file-label">${escapeHtml(definition.file)}</span>
        <span class="taskbar-mobile-label">${escapeHtml(definition.mobileLabel || definition.label)}</span>
        ${isOpen && windowState.mode === 'minimized' ? '<span>MIN</span>' : ''}
        ${badge ? `<strong aria-label="${badge}개 새 알림">${badge}</strong>` : ''}
      </button>
    `;
  }

  function render() {
    const items = activeCafes();
    if (!state.selectedCafeId && items[0]) state.selectedCafeId = items[0].id;
    if (items.length) state.storyIndex = clamp(state.storyIndex, 0, items.length - 1);

    const shortcuts = programDefinitions.map(renderDesktopShortcut).join('');
    const windowsMarkup = programDefinitions.map(renderWindow).join('');
    const taskbar = programDefinitions.map(renderTaskbarButton).join('');
    const time = new Intl.DateTimeFormat('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }).format(state.clock);

    clampWindowsToCanvas();
    root.innerHTML = `
      <div class="retro-desktop" data-retro-shell>
        <header class="retro-desktop-topbar">
          <strong class="retro-brand"><img src="./assets/brewmap-brand-icon.svg" alt="" width="24" height="24" />BREWMAP</strong>
          <nav aria-label="Retro desktop 메뉴">
            <button type="button">파일</button>
            <button type="button" data-open-program="local-zine">발견</button>
            <button type="button" data-open-program="cafe-index">인덱스</button>
            <button type="button" data-open-program="brewmap-map">지도</button>
            <button type="button" data-open-program="nearby-map">주변</button>
            <button type="button" data-open-program="brew-log">장부</button>
            <button type="button" data-retro-scroll-target="#workspace">기본 화면</button>
          </nav>
          <span>부산&nbsp;&nbsp;${escapeHtml(time)}</span>
        </header>
        <div class="retro-desktop-canvas" data-retro-canvas>
          <div class="retro-shortcuts" aria-label="프로그램 바로가기">${shortcuts}</div>
          ${windowsMarkup}
        </div>
        <footer class="retro-taskbar">
          <div>${taskbar}</div>
          <button type="button" data-retro-reset>Reset Layout</button>
          <time>${escapeHtml(time)}</time>
        </footer>
      </div>
    `;
    hydrateRetroMap();
    hydrateCafeOsmMaps();
  }

  function clampWindowsToCanvas() {
    programDefinitions.forEach((definition) => {
      const windowState = state.windows[definition.id];
      if (!windowState || windowState.mode !== 'normal') return;
      moveWindow(definition.id, windowState.position.x, windowState.position.y);
    });
  }

  function boundsForWindow(windowState) {
    const canvas = root.querySelector('[data-retro-canvas]');
    const width = canvas?.clientWidth || window.innerWidth;
    const height = canvas?.clientHeight || Math.max(window.innerHeight - 82, 480);
    return {
      maxX: Math.max(12, width - windowState.size.width - 12),
      maxY: Math.max(12, height - windowState.size.height - 12),
    };
  }

  function moveWindow(programId, x, y) {
    const windowState = state.windows[programId];
    if (!windowState || windowState.mode !== 'normal') return;
    const bounds = boundsForWindow(windowState);
    windowState.position = {
      x: clamp(x, 12, bounds.maxX),
      y: clamp(y, 12, bounds.maxY),
    };
  }


  function requestRetroUserLocation() {
    if (!navigator.geolocation) {
      state.locationStatus = '현재 위치를 확인할 수 없습니다.';
      render();
      return;
    }

    state.locationStatus = '현재 위치 확인 중...';
    render();
    navigator.geolocation.getCurrentPosition((position) => {
      state.userLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      state.mapViewport = retroMapProvider.normalizeViewport({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        zoom: Math.min(retroMapZoomRange.max, 15),
      });
      state.locationStatus = '현재 위치 기준으로 주변 카페를 표시합니다.';
      openProgram('nearby-map');
    }, () => {
      state.locationStatus = '현재 위치 권한을 확인할 수 없습니다. 부산 기본 지도로 표시합니다.';
      render();
    }, { enableHighAccuracy: false, maximumAge: 300000, timeout: 6000 });
  }

  function handleClick(event) {
    const scrollAction = event.target.closest('[data-retro-scroll-target]');
    if (scrollAction) {
      event.preventDefault();
      const target = document.querySelector(scrollAction.dataset.retroScrollTarget);
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    const windowAction = event.target.closest('[data-window-action]');
    if (windowAction) {
      const programId = windowAction.dataset.programId;
      const action = windowAction.dataset.windowAction;
      if (action === 'minimize') minimizeProgram(programId);
      if (action === 'maximize') toggleMaximizeProgram(programId);
      if (action === 'close') closeProgram(programId);
      return;
    }

    const windowEl = event.target.closest('[data-program-window]');
    if (windowEl) focusProgram(windowEl.dataset.programWindow);

    const reset = event.target.closest('[data-retro-reset]');
    if (reset) {
      resetLayout();
      return;
    }

    const open = event.target.closest('[data-open-program]');
    if (open) {
      const cafeId = open.dataset.retroSelectCafe;
      if (cafeId) selectCafe(cafeId);
      openProgram(open.dataset.openProgram);
      return;
    }

    const mapZoom = event.target.closest('[data-retro-map-zoom]');
    if (mapZoom) {
      zoomRetroMapBy(Number(mapZoom.dataset.retroMapZoom || 0));
      return;
    }

    const mapFit = event.target.closest('[data-retro-fit-map]');
    if (mapFit) {
      fitRetroMapToItems(activeCafes());
      render();
      return;
    }

    const requestLocation = event.target.closest('[data-retro-request-location]');
    if (requestLocation) {
      requestRetroUserLocation();
      return;
    }

    const select = event.target.closest('[data-retro-select-cafe]');
    if (select) {
      selectCafe(select.dataset.retroSelectCafe);
      render();
      return;
    }

    const mapOpen = event.target.closest('[data-retro-open-map]');
    if (mapOpen) {
      selectCafe(mapOpen.dataset.retroOpenMap);
      openProgram('brewmap-map');
      return;
    }

    const save = event.target.closest('[data-retro-save]');
    if (save) {
      selectCafe(save.dataset.retroSave);
      saveCafe(save.dataset.retroSave);
      return;
    }

    const story = event.target.closest('[data-retro-story]');
    if (story) {
      const items = activeCafes();
      if (items.length) {
        state.storyIndex = story.dataset.retroStory === 'next'
          ? (state.storyIndex + 1) % items.length
          : (state.storyIndex - 1 + items.length) % items.length;
        state.selectedCafeId = items[state.storyIndex].id;
      }
      render();
      return;
    }

    const filter = event.target.closest('[data-retro-filter]');
    if (filter) {
      const key = filter.dataset.retroFilter;
      if (state.activeFilters.has(key)) state.activeFilters.delete(key);
      else state.activeFilters.add(key);
      render();
      return;
    }

    const clearFilters = event.target.closest('[data-retro-clear-filters]');
    if (clearFilters) {
      state.activeFilters.clear();
      render();
      return;
    }

    const stamp = event.target.closest('[data-retro-stamp]');
    if (stamp) {
      openVisitForm(stamp.dataset.retroStamp);
      return;
    }

    const cancelStamp = event.target.closest('[data-retro-cancel-stamp]');
    if (cancelStamp) {
      closeVisitForm();
      return;
    }

    render();
  }

  function handleSubmit(event) {
    const form = event.target.closest('[data-retro-visit-form]');
    if (!form) return;

    event.preventDefault();
    const formData = new FormData(form);
    stampVisit(form.dataset.cafeId, {
      visitedAt: String(formData.get('visitedAt') || '').trim(),
      visitType: String(formData.get('visitType') || '').trim(),
      favoriteMenu: String(formData.get('favoriteMenu') || '').trim(),
      memo: String(formData.get('memo') || '').trim(),
    });
  }

  function startDrag(event) {
    const titlebar = event.target.closest('[data-retro-titlebar]');
    if (!titlebar || event.target.closest('button')) return;

    const programId = titlebar.dataset.retroTitlebar;
    const windowState = state.windows[programId];
    if (!windowState || windowState.mode !== 'normal') return;

    focusProgram(programId);
    dragState = {
      programId,
      startX: event.clientX,
      startY: event.clientY,
      originX: windowState.position.x,
      originY: windowState.position.y,
    };
    event.preventDefault();
  }

  function continueDrag(event) {
    if (!dragState) return;

    moveWindow(
      dragState.programId,
      dragState.originX + event.clientX - dragState.startX,
      dragState.originY + event.clientY - dragState.startY,
    );
    render();
  }

  function stopDrag() {
    dragState = null;
  }

  function syncRoute() {
    routeActive = true;
    root.hidden = false;
    const legacyMount = root.parentElement?.querySelector('.legacy-app-mounts');
    if (legacyMount) {
      legacyMount.hidden = false;
      legacyMount.removeAttribute('aria-hidden');
    }
    standardRoots.forEach((element) => {
      element.hidden = false;
      element.removeAttribute('aria-hidden');
    });
    document.body.classList.remove('is-retro-main');
    document.body.classList.add('is-retro-hybrid');

    if (!clockTimer) {
      clockTimer = window.setInterval(() => {
        state.clock = new Date();
        render();
      }, 30000);
    }
    render();
  }


  function activeTouchPoints() {
    return [...(mapDragState?.points?.values() || [])];
  }

  function midpoint(points) {
    return { x: (points[0].clientX + points[1].clientX) / 2, y: (points[0].clientY + points[1].clientY) / 2 };
  }

  function distance(points) {
    return Math.hypot(points[0].clientX - points[1].clientX, points[0].clientY - points[1].clientY);
  }

  function handleMapPointerDown(event) {
    const surface = event.target.closest('[data-retro-map-surface]');
    if (!surface || event.target.closest('button, a')) return;
    surface.setPointerCapture?.(event.pointerId);
    const center = projectMap(state.mapViewport.latitude, state.mapViewport.longitude);
    if (!mapDragState) mapDragState = { surface, points: new Map(), originCenter: center, originZoom: state.mapViewport.zoom };
    mapDragState.points.set(event.pointerId, { clientX: event.clientX, clientY: event.clientY });
    mapDragState.originCenter = center;
    mapDragState.originZoom = state.mapViewport.zoom;
    const points = activeTouchPoints();
    if (points.length >= 2) {
      mapDragState.originDistance = distance(points);
      mapDragState.originMidpoint = midpoint(points);
    } else {
      mapDragState.startX = event.clientX;
      mapDragState.startY = event.clientY;
    }
    surface.classList.add('is-dragging');
    event.preventDefault();
  }

  function handleMapPointerMove(event) {
    if (!mapDragState?.points?.has(event.pointerId)) return;
    mapDragState.points.set(event.pointerId, { clientX: event.clientX, clientY: event.clientY });
    const points = activeTouchPoints();
    if (points.length >= 2 && mapDragState.originDistance) {
      const scale = distance(points) / mapDragState.originDistance;
      const nextZoom = clamp(Math.round(mapDragState.originZoom + Math.log2(scale)), retroMapZoomRange.min, retroMapZoomRange.max);
      const currentMidpoint = midpoint(points);
      const zoomScale = 2 ** (nextZoom - mapDragState.originZoom);
      setRetroMapViewportFromCenterPoint({
        x: mapDragState.originCenter.x * zoomScale - (currentMidpoint.x - mapDragState.originMidpoint.x),
        y: mapDragState.originCenter.y * zoomScale - (currentMidpoint.y - mapDragState.originMidpoint.y),
      }, nextZoom);
    } else {
      setRetroMapViewportFromCenterPoint({
        x: mapDragState.originCenter.x - (event.clientX - mapDragState.startX),
        y: mapDragState.originCenter.y - (event.clientY - mapDragState.startY),
      });
    }
    render();
    event.preventDefault();
  }

  function stopMapDrag(event) {
    if (!mapDragState) return;
    if (event?.pointerId != null) mapDragState.points.delete(event.pointerId);
    if (mapDragState.points.size) return;
    mapDragState.surface?.classList.remove('is-dragging');
    mapDragState = null;
  }

  function handleMapWheel(event) {
    if (!event.target.closest('[data-retro-map-surface]')) return;
    event.preventDefault();
    zoomRetroMapBy(event.deltaY < 0 ? 1 : -1, event.clientX, event.clientY);
  }

  function handleMapKeydown(event) {
    if (!event.target.closest('[data-retro-map-surface]')) return;
    const actions = {
      '+': () => zoomRetroMapBy(1),
      '=': () => zoomRetroMapBy(1),
      '-': () => zoomRetroMapBy(-1),
    };
    const action = actions[event.key];
    if (!action) return;
    event.preventDefault();
    action();
  }

  root.addEventListener('click', handleClick);
  root.addEventListener('submit', handleSubmit);
  root.addEventListener('pointerdown', startDrag);
  root.addEventListener('pointerdown', handleMapPointerDown);
  root.addEventListener('wheel', handleMapWheel, { passive: false });
  root.addEventListener('keydown', handleMapKeydown);
  window.addEventListener('pointermove', continueDrag);
  window.addEventListener('pointermove', handleMapPointerMove);
  window.addEventListener('pointerup', stopDrag);
  window.addEventListener('pointerup', stopMapDrag);
  window.addEventListener('pointercancel', stopDrag);
  window.addEventListener('pointercancel', stopMapDrag);
  window.addEventListener('resize', () => {
    if (routeActive) render();
  });

  syncRoute();

  return { render, syncRoute };
}
