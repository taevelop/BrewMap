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
    label: '지도',
    file: 'BREWMAP',
    title: 'BREWMAP.EXE',
    menu: ['FILE', 'MAP', 'LOCATION', 'VIEW'],
    defaultRect: { x: 560, y: 138, width: 820, height: 620 },
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
  };
  let routeActive = true;
  let clockTimer = null;
  let dragState = null;

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

  function programStatus(programId) {
    const items = activeCafes();
    const selected = selectedCafe();
    const savedCount = savedCafeIds().size;

    if (programId === 'local-zine') return `${items.length ? state.storyIndex + 1 : 0} / ${items.length} STORIES · BUSAN`;
    if (programId === 'cafe-index') return `${filteredIndexCafes().length} RECORDS · ${items.length} ACTIVE · INFORMATION VERIFIED`;
    if (programId === 'brewmap-map') return selected ? `${selected.name} · ${selected.area} · MAP READY` : 'NO LOCATION SELECTED';
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
    const pins = items.map((cafe) => {
      const position = cafePosition(cafe, items);
      return `
        <button
          type="button"
          class="retro-map-pin ${selected?.id === cafe.id ? 'is-active' : ''}"
          style="left: ${position.left.toFixed(2)}%; top: ${position.top.toFixed(2)}%;"
          title="${escapeHtml(cafe.name)}"
          aria-label="${escapeHtml(cafe.name)} 지도 핀"
          data-retro-select-cafe="${escapeHtml(cafe.id)}"
        ></button>
      `;
    }).join('');

    return `
      <section class="brewmap-program">
        <div class="retro-map-surface" role="img" aria-label="부산 카페 위치 미니맵">
          <div class="retro-map-grid" aria-hidden="true"></div>
          ${pins}
        </div>
        <aside class="map-record">
          ${selected ? `
            <p class="retro-kicker">PIN SELECTED</p>
            <h3>${escapeHtml(selected.name)}</h3>
            <p>${escapeHtml(selected.city)} · ${escapeHtml(selected.area)}</p>
            <p>${escapeHtml(selected.address)}</p>
            <div class="retro-action-row">
              <button type="button" data-open-program="cafe-index" data-retro-select-cafe="${escapeHtml(selected.id)}">인덱스 열기</button>
              <button type="button" class="${savedCafeIds().has(selected.id) ? 'is-saved' : ''}" aria-pressed="${savedCafeIds().has(selected.id)}" data-retro-save="${escapeHtml(selected.id)}">${savedCafeIds().has(selected.id) ? '저장됨' : '장부에 저장'}</button>
              <a href="${escapeHtml(safeMapLink(selected))}" target="_blank" rel="noreferrer">외부 지도</a>
            </div>
          ` : '<div class="retro-empty"><h3>NO LOCATION</h3><p>카페를 선택하면 지도 핀이 강조됩니다.</p></div>'}
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

    root.innerHTML = `
      <div class="retro-desktop" data-retro-shell>
        <header class="retro-desktop-topbar">
          <strong class="retro-brand"><img src="./assets/brewmap-brand-icon.svg" alt="" width="24" height="24" />BREWMAP</strong>
          <nav aria-label="Retro desktop 메뉴">
            <button type="button">FILE</button>
            <button type="button" data-open-program="cafe-index">SEARCH</button>
            <button type="button" data-open-program="brewmap-map">MAP</button>
            <button type="button" data-open-program="brew-log">SAVED</button>
            <button type="button" data-open-program="local-zine">TODAY</button>
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

  function handleClick(event) {
    const scrollAction = event.target.closest('[data-retro-scroll-target]');
    if (scrollAction) {
      event.preventDefault();
      const target = document.querySelector(scrollAction.dataset.retroScrollTarget);
      if (target && !target.closest('.legacy-app-mounts[hidden]')) target.scrollIntoView({ behavior: 'auto', block: 'start' });
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
      openProgram('cafe-index');
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

  root.addEventListener('click', handleClick);
  root.addEventListener('pointerdown', startDrag);
  window.addEventListener('pointermove', continueDrag);
  window.addEventListener('pointerup', stopDrag);
  window.addEventListener('pointercancel', stopDrag);
  window.addEventListener('resize', () => {
    if (routeActive) render();
  });

  syncRoute();

  return { render, syncRoute };
}
