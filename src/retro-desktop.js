import { getMapProvider } from './map-services.js';

const retroMapProvider = getMapProvider();
const retroMapZoomRange = retroMapProvider.zoomRange;
const retroMapPanStep = 96;

const programDefinitions = [
  {
    id: 'local-zine',
    label: '오늘의 발견',
    file: 'LOCAL_ZINE',
    title: 'LOCAL_ZINE.EXE',
    menu: ['FILE', 'ISSUE', 'NEIGHBORHOOD', 'VIEW'],
    defaultRect: { x: 220, y: 46, width: 620, height: 680 },
  },
  {
    id: 'cafe-index',
    label: '카페 인덱스',
    file: 'CAFE_INDEX',
    title: 'CAFE_INDEX.EXE',
    menu: ['FILE', 'SEARCH', 'FILTER', 'MAP', 'VIEW'],
    defaultRect: { x: 360, y: 96, width: 980, height: 620 },
  },
  {
    id: 'brewmap-map',
    label: '카페 약도',
    file: 'BREWMAP',
    title: 'BREWMAP.EXE',
    menu: ['FILE', 'CAFE', 'ROUTE', 'VIEW'],
    defaultRect: { x: 560, y: 138, width: 760, height: 560 },
  },
  {
    id: 'nearby-map',
    label: '주변 지도',
    file: 'NEARBY_MAP',
    title: 'NEARBY_MAP.EXE',
    menu: ['FILE', 'MAP', 'LOCATION', 'VIEW'],
    defaultRect: { x: 320, y: 118, width: 920, height: 640 },
  },
  {
    id: 'brew-log',
    label: '나의 단골 장부',
    file: 'BREW_LOG',
    title: 'BREW_LOG.EXE',
    menu: ['FILE', 'FOLDER', 'STAMP', 'EXPORT', 'VIEW'],
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
    isOpen: definition.id === 'local-zine' || definition.id === 'cafe-index',
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
    zOrder: ['local-zine', 'cafe-index'],
    activeProgramId: 'cafe-index',
    selectedCafeId: null,
    storyIndex: 0,
    activeFilters: new Set(),
    taskbarBadges: { 'brew-log': 0 },
    visits: readJsonStorage(visitStorageKey, {}),
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
    state.zOrder = ['local-zine', 'cafe-index'];
    state.activeProgramId = 'cafe-index';
    state.taskbarBadges = { 'brew-log': 0 };
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

  function stampVisit(cafeId) {
    const today = new Date().toISOString().slice(0, 10);
    const current = state.visits[cafeId] || { count: 0, lastVisitedAt: '' };
    state.visits[cafeId] = { count: current.count + 1, lastVisitedAt: today };
    writeJsonStorage(visitStorageKey, state.visits);
    state.taskbarBadges['brew-log'] = 0;
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

  function screenPositionForCafe(cafe) {
    const { width, height } = mapSurfaceSize();
    const center = projectMap(state.mapViewport.latitude, state.mapViewport.longitude);
    const point = projectMap(cafe.latitude, cafe.longitude);
    return {
      left: width / 2 + point.x - center.x,
      top: height / 2 + point.y - center.y,
    };
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
    state.mapViewport = retroMapProvider.normalizeViewport({ ...center, zoom: coordinates.length === 1 ? retroMapZoomRange.max : 12 });
  }

  function zoomRetroMapBy(delta, clientX, clientY) {
    const zoom = clamp(state.mapViewport.zoom + delta, retroMapZoomRange.min, retroMapZoomRange.max);
    if (zoom === state.mapViewport.zoom) return;
    const { width, height } = mapSurfaceSize();
    const rect = root.querySelector('[data-retro-map-surface]')?.getBoundingClientRect();
    const offsetX = rect && Number.isFinite(clientX) ? clientX - rect.left - (width / 2) : 0;
    const offsetY = rect && Number.isFinite(clientY) ? clientY - rect.top - (height / 2) : 0;
    const center = projectMap(state.mapViewport.latitude, state.mapViewport.longitude);
    const anchor = unprojectMap({ x: center.x + offsetX, y: center.y + offsetY });
    const nextAnchor = projectMap(anchor.latitude, anchor.longitude, zoom);
    setRetroMapViewportFromCenterPoint({ x: nextAnchor.x - offsetX, y: nextAnchor.y - offsetY }, zoom);
    render();
  }

  function panRetroMapBy(deltaX, deltaY) {
    const center = projectMap(state.mapViewport.latitude, state.mapViewport.longitude);
    setRetroMapViewportFromCenterPoint({ x: center.x + deltaX, y: center.y + deltaY });
    render();
  }

  function hydrateRetroMap() {
    const surface = root.querySelector('[data-retro-map-surface]');
    const baseLayer = root.querySelector('[data-retro-map-base]');
    const markerLayer = root.querySelector('[data-retro-map-markers]');
    if (!surface || !baseLayer || !markerLayer) return;

    retroMapProvider.renderBaseLayer({ container: baseLayer, viewport: state.mapViewport, surfaceSize: mapSurfaceSize() });
    const cafePins = activeCafes().map((cafe) => {
      const position = screenPositionForCafe(cafe);
      const pin = document.createElement('button');
      pin.type = 'button';
      pin.className = `retro-map-pin ${state.selectedCafeId === cafe.id ? 'is-active' : ''}`;
      pin.style.left = `${position.left.toFixed(1)}px`;
      pin.style.top = `${position.top.toFixed(1)}px`;
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

  function programStatus(programId) {
    const items = activeCafes();
    const selected = selectedCafe();
    const savedCount = savedCafeIds().size;

    if (programId === 'local-zine') return `${items.length ? state.storyIndex + 1 : 0} / ${items.length} STORIES · BUSAN`;
    if (programId === 'cafe-index') return `${filteredIndexCafes().length} RECORDS · ${items.length} ACTIVE · INFORMATION VERIFIED`;
    if (programId === 'brewmap-map') return selected ? `${selected.name} · ${selected.area} · CAFE SKETCH` : 'NO CAFE SELECTED';
    if (programId === 'nearby-map') return `${items.length} CAFES · ${state.userLocation ? 'MY LOCATION ON' : 'BUSAN DEFAULT'} · MAP READY`;
    return `${savedCount} SAVED · ${Object.values(state.visits).reduce((sum, visit) => sum + Number(visit.count || 0), 0)} VISITS`;
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
    `).join('') : '<div class="retro-empty"><h3>CAFE RECORDS NOT FOUND</h3><p>선택한 조건에 맞는 카페가 없습니다.</p><button type="button" data-retro-clear-filters>필터 초기화</button></div>';

    return `
      <section class="cafe-index-program">
        <aside class="index-filter-panel">
          <h3>FIND BY</h3>
          <div>${filterButtons}</div>
          <button type="button" class="retro-secondary-action" data-retro-clear-filters>필터 초기화</button>
        </aside>
        <div class="index-record-list">
          <h3>CAFE RECORDS</h3>
          ${records}
        </div>
        <aside class="index-detail-panel">
          ${selected ? renderIndexDetail(selected) : '<div class="retro-empty"><h3>NO SELECTION</h3><p>카페를 선택하면 상세 레코드가 표시됩니다.</p></div>'}
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
        <div><dt>COFFEE</dt><dd>${escapeHtml(primaryTags(cafe, tagLabel))}</dd></div>
        <div><dt>VERIFY</dt><dd>${escapeHtml(verificationSourceLabel(cafe.source))}</dd></div>
        <div><dt>RECENT</dt><dd>${escapeHtml(cafe.verifiedAt || '-')}</dd></div>
        <div><dt>TRUST</dt><dd>${escapeHtml(confidenceLabel(cafe.confidence))}</dd></div>
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
    const nearbyItems = selected ? items
      .filter((cafe) => cafe.id !== selected.id && cafe.area === selected.area)
      .slice(0, 4) : [];
    const guidePins = selected ? [selected, ...nearbyItems].map((cafe, index) => {
      const isSelected = cafe.id === selected.id;
      const position = isSelected ? { left: 50, top: 48 } : cafePosition(cafe, [selected, ...nearbyItems]);
      return `
        <button
          type="button"
          class="cafe-sketch-pin ${isSelected ? 'is-active' : ''}"
          style="left: ${position.left.toFixed(2)}%; top: ${position.top.toFixed(2)}%;"
          title="${escapeHtml(cafe.name)}"
          aria-label="${escapeHtml(cafe.name)} 약도 핀"
          data-retro-select-cafe="${escapeHtml(cafe.id)}"
        >${isSelected ? '★' : String(index).padStart(2, '0')}</button>
      `;
    }).join('') : '';

    return `
      <section class="cafe-sketch-program">
        <div class="cafe-sketch-panel">
          <div class="cafe-sketch-toolbar">
            <span>CAFE GUIDE MAP</span>
            <button type="button" data-open-program="nearby-map">주변 일반 지도 열기</button>
          </div>
          <div class="cafe-sketch-surface" role="img" aria-label="선택한 카페 주변 약도">
            <div class="cafe-sketch-road cafe-sketch-road-main" aria-hidden="true"></div>
            <div class="cafe-sketch-road cafe-sketch-road-sub" aria-hidden="true"></div>
            <div class="cafe-sketch-block block-a" aria-hidden="true">ROASTERY</div>
            <div class="cafe-sketch-block block-b" aria-hidden="true">STATION</div>
            <div class="cafe-sketch-block block-c" aria-hidden="true">MARKET</div>
            ${guidePins}
          </div>
          <p class="cafe-sketch-caption">BREWMAP.EXE는 선택한 카페를 중심으로 빠르게 위치감을 잡는 약도입니다. 내 위치 기준 탐색은 NEARBY_MAP.EXE에서 확인합니다.</p>
        </div>
        <aside class="map-record">
          ${selected ? `
            <p class="retro-kicker">CAFE SKETCH</p>
            <h3>${escapeHtml(selected.name)}</h3>
            <p>${escapeHtml(selected.city)} · ${escapeHtml(selected.area)}</p>
            <p>${escapeHtml(selected.address)}</p>
            <dl class="retro-data-grid">
              <div><dt>COFFEE</dt><dd>${escapeHtml(primaryTags(selected, tagLabel))}</dd></div>
              <div><dt>VERIFY</dt><dd>${escapeHtml(verificationSourceLabel(selected.source))}</dd></div>
              <div><dt>NEARBY</dt><dd>${nearbyItems.length ? nearbyItems.map((cafe) => cafe.name).join(' · ') : '같은 권역 주변 카페 준비 중'}</dd></div>
            </dl>
            <div class="retro-action-row">
              <button type="button" data-open-program="cafe-index" data-retro-select-cafe="${escapeHtml(selected.id)}">인덱스 열기</button>
              <button type="button" data-open-program="nearby-map" data-retro-select-cafe="${escapeHtml(selected.id)}">일반 지도에서 보기</button>
              <button type="button" class="${isSaved ? 'is-saved' : ''}" aria-pressed="${isSaved}" data-retro-save="${escapeHtml(selected.id)}">${isSaved ? '저장됨' : '장부에 저장'}</button>
              <a href="${escapeHtml(safeMapLink(selected))}" target="_blank" rel="noreferrer">외부 지도</a>
            </div>
          ` : `<div class="retro-empty"><h3>NO CAFE</h3><p>${items.length}개 카페 중 하나를 선택하면 약도가 열립니다.</p></div>`}
        </aside>
      </section>
    `;
  }

  function renderNearbyMapProgram() {
    const items = activeCafes();
    const selected = selectedCafe();
    const isSaved = selected ? savedCafeIds().has(selected.id) : false;

    return `
      <section class="brewmap-program nearby-map-program">
        <div class="retro-map-shell">
          <div class="retro-map-surface" role="application" tabindex="0" aria-label="내 주변 카페 지도. 드래그하거나 방향키로 이동할 수 있습니다." data-retro-map-surface>
            <div class="retro-map-base" data-retro-map-base aria-hidden="true"></div>
            <div class="retro-map-markers" data-retro-map-markers></div>
            <div class="retro-map-toolbar" aria-label="주변 지도 제어">
              <button type="button" data-retro-map-locate>내 위치</button>
              <button type="button" data-retro-map-fit>전체 보기</button>
              <button type="button" data-retro-map-zoom="in" aria-label="지도 확대">+</button>
              <button type="button" data-retro-map-zoom="out" aria-label="지도 축소">-</button>
              <span>ZOOM ${escapeHtml(state.mapViewport.zoom)}</span>
            </div>
          </div>
          <a class="retro-map-attribution" href="${escapeHtml(retroMapProvider.attribution?.url || '#')}" target="_blank" rel="noreferrer">${escapeHtml(retroMapProvider.attribution?.label || '지도 데이터')}</a>
        </div>
        <aside class="map-record">
          <p class="retro-kicker">NEARBY MAP</p>
          <h3>내 주변 카페 지도</h3>
          <p class="nearby-status">${escapeHtml(state.locationStatus)}</p>
          ${selected ? `
            <dl class="retro-data-grid">
              <div><dt>SELECTED</dt><dd>${escapeHtml(selected.name)}</dd></div>
              <div><dt>AREA</dt><dd>${escapeHtml(selected.city)} · ${escapeHtml(selected.area)}</dd></div>
              <div><dt>COFFEE</dt><dd>${escapeHtml(primaryTags(selected, tagLabel))}</dd></div>
            </dl>
            <div class="retro-action-row">
              <button type="button" data-retro-open-map="${escapeHtml(selected.id)}">카페 약도 열기</button>
              <button type="button" class="${isSaved ? 'is-saved' : ''}" aria-pressed="${isSaved}" data-retro-save="${escapeHtml(selected.id)}">${isSaved ? '저장됨' : '장부에 저장'}</button>
              <a href="${escapeHtml(safeMapLink(selected))}" target="_blank" rel="noreferrer">외부 지도</a>
            </div>
          ` : '<div class="retro-empty"><h3>NO PIN</h3><p>지도 핀을 선택하면 카페 정보가 표시됩니다.</p></div>'}
        </aside>
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
          <h3>MY FOLDERS</h3>
          <button type="button">▣ 스크랩</button>
          <button type="button">▣ 가고 싶은 곳</button>
          <button type="button">▣ 방문한 곳</button>
          <button type="button">▣ 단골이 된 곳</button>
          <button type="button">▣ 내 메모</button>
        </aside>
        <div class="saved-record-list">
          <h3>SAVED CAFES</h3>
          ${savedRecords}
        </div>
        <aside class="log-detail">
          ${selected ? renderLogDetail(selected) : '<div class="retro-empty"><h3>MY LOCAL FILES</h3><p>저장 후 장부에서 방문 기록을 남길 수 있습니다.</p></div>'}
        </aside>
      </section>
    `;
  }

  function renderLogDetail(cafe) {
    const visit = state.visits[cafe.id] || { count: 0, lastVisitedAt: '' };
    const isSaved = savedCafeIds().has(cafe.id);

    return `
      <p class="retro-kicker">CAFE_${escapeHtml(cafe.confidence || 'X')}.LOG</p>
      <h3>${escapeHtml(cafe.name)}</h3>
      <dl class="retro-data-grid">
        <div><dt>저장 상태</dt><dd>${isSaved ? '저장됨' : '미저장'}</dd></div>
        <div><dt>방문</dt><dd>${Number(visit.count || 0)}회</dd></div>
        <div><dt>마지막 방문</dt><dd>${escapeHtml(visit.lastVisitedAt || '-')}</dd></div>
        <div><dt>기억할 커피</dt><dd>${escapeHtml(primaryTags(cafe, tagLabel))}</dd></div>
      </dl>
      <p class="log-note">"${escapeHtml(cafe.area)}에서 다시 확인할 로컬 커피 기록"</p>
      <div class="retro-action-row">
        <button type="button" data-retro-stamp="${escapeHtml(cafe.id)}">방문 도장</button>
        <button type="button" data-retro-open-map="${escapeHtml(cafe.id)}">지도에서 보기</button>
      </div>
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
        ${escapeHtml(definition.file)}
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
            <button type="button" data-open-program="local-zine">FILE</button>
            <button type="button" data-open-program="cafe-index">SEARCH</button>
            <button type="button" data-open-program="nearby-map">NEARBY</button>
            <button type="button" data-open-program="brewmap-map">CAFE MAP</button>
            <button type="button" data-open-program="brew-log">SAVED</button>
          </nav>
          <span>BUSAN&nbsp;&nbsp;${escapeHtml(time)}</span>
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
      if (target && !target.closest('.legacy-app-mounts[hidden]')) target.scrollIntoView({ behavior: 'auto', block: 'start' });
      return;
    }

    const mapLocate = event.target.closest('[data-retro-map-locate]');
    if (mapLocate) {
      requestRetroUserLocation();
      return;
    }

    const mapFit = event.target.closest('[data-retro-map-fit]');
    if (mapFit) {
      fitRetroMapToItems(activeCafes());
      render();
      return;
    }

    const mapZoom = event.target.closest('[data-retro-map-zoom]');
    if (mapZoom) {
      zoomRetroMapBy(mapZoom.dataset.retroMapZoom === 'in' ? 1 : -1);
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
      stampVisit(stamp.dataset.retroStamp);
      return;
    }

    render();
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
      legacyMount.hidden = true;
      legacyMount.setAttribute('aria-hidden', 'true');
    }
    standardRoots.forEach((element) => {
      element.hidden = true;
    });
    document.body.classList.add('is-retro-main');

    if (!clockTimer) {
      clockTimer = window.setInterval(() => {
        state.clock = new Date();
        render();
      }, 30000);
    }
    render();
  }


  function handleMapPointerDown(event) {
    const surface = event.target.closest('[data-retro-map-surface]');
    if (!surface || event.button !== 0 || event.target.closest('button, a')) return;
    const center = projectMap(state.mapViewport.latitude, state.mapViewport.longitude);
    mapDragState = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, center };
    surface.classList.add('is-dragging');
    surface.setPointerCapture(event.pointerId);
  }

  function handleMapPointerMove(event) {
    if (!mapDragState || mapDragState.pointerId !== event.pointerId) return;
    setRetroMapViewportFromCenterPoint({
      x: mapDragState.center.x - (event.clientX - mapDragState.startX),
      y: mapDragState.center.y - (event.clientY - mapDragState.startY),
    });
    render();
  }

  function stopMapDrag(event) {
    if (!mapDragState || (event?.pointerId && mapDragState.pointerId !== event.pointerId)) return;
    const surface = root.querySelector('[data-retro-map-surface]');
    surface?.classList.remove('is-dragging');
    if (event && surface?.hasPointerCapture(event.pointerId)) surface.releasePointerCapture(event.pointerId);
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
      ArrowUp: () => panRetroMapBy(0, -retroMapPanStep),
      ArrowDown: () => panRetroMapBy(0, retroMapPanStep),
      ArrowLeft: () => panRetroMapBy(-retroMapPanStep, 0),
      ArrowRight: () => panRetroMapBy(retroMapPanStep, 0),
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
