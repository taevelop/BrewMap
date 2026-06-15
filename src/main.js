const capabilities = [
  { key: 'filter_coffee', label: '필터커피' },
  { key: 'decaf', label: '디카페인' },
  { key: 'cold_brew', label: '콜드브루' },
  { key: 'flat_white', label: '플랫화이트' },
  { key: 'single_origin', label: '싱글오리진' },
  { key: 'bean_sales', label: '원두구매' },
];

const tagLabels = {
  filter_coffee: '필터커피',
  decaf: '디카페인',
  cold_brew: '콜드브루',
  flat_white: '플랫화이트',
  single_origin: '싱글오리진',
  bean_sales: '원두구매',
  hand_drip: '핸드드립',
  roastery: '로스터리',
};

const searchAliases = {
  filter_coffee: ['필터', '브루잉', '드립커피', '핸드드립'],
  decaf: ['디카페인커피', 'decaf'],
  cold_brew: ['콜드브루커피', 'coldbrew'],
  flat_white: ['플랫 화이트', 'flatwhite', 'flat white'],
  single_origin: ['싱글 오리진', 'singleorigin', 'single origin'],
  bean_sales: ['원두', '원두 판매', '원두구매', 'bean sales'],
  hand_drip: ['핸드 드립', 'handdrip', 'hand drip'],
  roastery: ['로스팅', '로스터리카페', 'roastery'],
};

const reportTypeLabels = {
  add: '추가',
  update: '수정',
  delete: '삭제',
  closed: '폐업',
  menu_change: '메뉴 변경',
};

const savedStorageKey = 'brewmap.savedCafes.v1';

const cafes = [
  {
    id: 'jeonpo-archive',
    name: 'Archive Beans',
    city: '부산',
    area: '전포',
    address: '부산 부산진구 전포대로 209',
    capabilities: ['filter_coffee', 'single_origin', 'bean_sales'],
    confidence: 'A',
    verifiedAt: '2026-06-01',
    source: 'admin_verified',
    position: { top: '32%', left: '48%' },
    links: { naver: '#', kakao: '#', google: '#' },
  },
  {
    id: 'gwangan-drip',
    name: 'Drip Station',
    city: '부산',
    area: '광안리',
    address: '부산 수영구 광남로 125',
    capabilities: ['filter_coffee', 'hand_drip', 'decaf'],
    confidence: 'B',
    verifiedAt: '2026-05-24',
    source: 'user_report',
    position: { top: '48%', left: '67%' },
    links: { naver: '#', kakao: '#', google: '#' },
  },
  {
    id: 'haeundae-cold',
    name: 'Cold Lab Roastery',
    city: '부산',
    area: '해운대',
    address: '부산 해운대구 해운대로 620',
    capabilities: ['cold_brew', 'flat_white', 'roastery'],
    confidence: 'B',
    verifiedAt: '2026-05-18',
    source: 'menu_photo',
    position: { top: '36%', left: '78%' },
    links: { naver: '#', kakao: '#', google: '#' },
  },
];

const adminQueue = [
  { id: 'report-seed-1', type: '수정', cafe: 'Drip Station', request: '디카페인 가능 여부 확인 요청', status: '검수 대기' },
  { id: 'report-seed-2', type: '추가', cafe: 'New Brew Bar', request: '전포 신규 카페 등록 제보', status: '근거 필요' },
  { id: 'report-seed-3', type: '폐업', cafe: 'Old Beans', request: '폐업 신고', status: '확인 필요' },
];

const byKey = { ...tagLabels };
const searchForm = document.querySelector('[data-search-form]');
const searchInput = document.querySelector('[data-search-input]');
const filterRow = document.querySelector('[data-filter-row]');
const mapSurface = document.querySelector('[data-map-surface]');
const cafeGrid = document.querySelector('[data-cafe-grid]');
const adminQueueEl = document.querySelector('[data-admin-queue]');
const resultCount = document.querySelector('[data-result-count]');
const savedCount = document.querySelector('[data-saved-count]');
const savedList = document.querySelector('[data-saved-list]');
const reportForm = document.querySelector('[data-report-form]');
const reportCafeSelect = document.querySelector('[data-report-cafe]');
const reportTypeSelect = document.querySelector('[data-report-type]');
const reportDetailInput = document.querySelector('[data-report-detail]');
const reportStatus = document.querySelector('[data-report-status]');
const detailDialog = document.querySelector('[data-detail-dialog]');
const detailClose = document.querySelector('[data-detail-close]');
const detailBody = document.querySelector('[data-detail-body]');
const selectedFilters = new Set();
const savedCafeIds = readSavedCafeIds();
let searchQuery = '';

function cafeById(id) {
  return cafes.find((cafe) => cafe.id === id);
}

function readSavedCafeIds() {
  if (typeof localStorage === 'undefined') return new Set();

  try {
    const savedIds = JSON.parse(localStorage.getItem(savedStorageKey) || '[]');
    if (!Array.isArray(savedIds)) return new Set();
    return new Set(savedIds.filter((id) => cafes.some((cafe) => cafe.id === id)));
  } catch {
    return new Set();
  }
}

function persistSavedCafeIds() {
  if (typeof localStorage === 'undefined') return;

  try {
    localStorage.setItem(savedStorageKey, JSON.stringify([...savedCafeIds]));
  } catch {
    // Storage can fail in private browsing or restricted environments.
  }
}

function normalize(value) {
  return String(value).toLowerCase().replace(/\s+/g, '');
}

function searchTokens() {
  return searchQuery.trim().split(/\s+/).map(normalize).filter(Boolean);
}

function searchIndex(cafe) {
  const capabilityTerms = cafe.capabilities.flatMap((tag) => [byKey[tag] || tag, tag, ...(searchAliases[tag] || [])]);
  return normalize([cafe.name, cafe.city, cafe.area, cafe.address, ...capabilityTerms].join(' '));
}

function matchesSearch(cafe) {
  const tokens = searchTokens();
  if (!tokens.length) return true;
  const index = searchIndex(cafe);
  return tokens.every((token) => index.includes(token));
}

function tagsMarkup(cafe) {
  return cafe.capabilities.map((tag) => `<span class="tag">${byKey[tag] || tag}</span>`).join('');
}

function setReportStatus(message) {
  reportStatus.textContent = message;
}

function renderFilters() {
  filterRow.replaceChildren(...capabilities.map((capability) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = selectedFilters.has(capability.key) ? 'is-active' : '';
    button.textContent = capability.label;
    button.addEventListener('click', () => {
      if (selectedFilters.has(capability.key)) selectedFilters.delete(capability.key);
      else selectedFilters.add(capability.key);
      render();
    });
    return button;
  }));
}

function filteredCafes() {
  return cafes.filter((cafe) => {
    const matchesFilters = [...selectedFilters].every((filter) => cafe.capabilities.includes(filter));
    return matchesFilters && matchesSearch(cafe);
  });
}

function toggleSaved(cafeId) {
  if (savedCafeIds.has(cafeId)) savedCafeIds.delete(cafeId);
  else savedCafeIds.add(cafeId);

  persistSavedCafeIds();
  renderCafeResults();
  renderSavedList();
  if (detailDialog.open) renderDetail(cafeById(cafeId));
}

function renderCafe(cafe) {
  const isSaved = savedCafeIds.has(cafe.id);
  const card = document.createElement('article');
  card.className = 'cafe-card';
  card.innerHTML = `
    <div class="cafe-card-topline"><span>${cafe.city} · ${cafe.area}</span><strong>신뢰도 ${cafe.confidence}</strong></div>
    <h3>${cafe.name}</h3>
    <p>${cafe.address}</p>
    <dl class="metadata"><div><dt>검증</dt><dd>${cafe.source}</dd></div><div><dt>최근 확인</dt><dd>${cafe.verifiedAt}</dd></div></dl>
    <div>${tagsMarkup(cafe)}</div>
    <div class="card-actions"><button type="button" data-detail-action>상세</button><button type="button" class="${isSaved ? 'is-saved' : ''}" aria-pressed="${isSaved}" data-save-action>${isSaved ? '저장됨' : '저장'}</button><button type="button" data-report-action>정보 제보</button><a href="${cafe.links.naver}">외부 지도</a></div>
  `;
  card.querySelector('[data-detail-action]').addEventListener('click', () => openDetail(cafe.id));
  card.querySelector('[data-save-action]').addEventListener('click', () => toggleSaved(cafe.id));
  card.querySelector('[data-report-action]').addEventListener('click', () => startReport(cafe.id));
  return card;
}

function renderEmptyState() {
  const card = document.createElement('article');
  card.className = 'empty-state';
  card.innerHTML = '<h3>조건에 맞는 카페가 없습니다</h3><p>검색어를 줄이거나 선택한 커피 필터를 해제해 보세요.</p>';
  return card;
}

function renderMapPins(items) {
  mapSurface.querySelectorAll('.map-pin').forEach((pin) => pin.remove());
  items.forEach((cafe) => {
    const pin = document.createElement('button');
    pin.className = `map-pin confidence-${cafe.confidence.toLowerCase()}`;
    pin.type = 'button';
    pin.style.top = cafe.position.top;
    pin.style.left = cafe.position.left;
    pin.setAttribute('aria-label', `${cafe.name} 지도 핀`);
    pin.textContent = cafe.confidence;
    pin.addEventListener('click', () => openDetail(cafe.id));
    mapSurface.append(pin);
  });
}

function renderCafeResults() {
  const items = filteredCafes();
  resultCount.textContent = `${items.length}개 카페`;
  cafeGrid.replaceChildren(...(items.length ? items.map(renderCafe) : [renderEmptyState()]));
  renderMapPins(items);
}

function renderSavedList() {
  const savedItems = cafes.filter((cafe) => savedCafeIds.has(cafe.id));
  savedCount.textContent = `${savedItems.length}개`;

  if (!savedItems.length) {
    const empty = document.createElement('li');
    empty.textContent = '아직 저장한 카페가 없습니다.';
    savedList.replaceChildren(empty);
    return;
  }

  savedList.replaceChildren(...savedItems.map((cafe) => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    const span = document.createElement('span');
    button.type = 'button';
    button.textContent = cafe.name;
    button.addEventListener('click', () => openDetail(cafe.id));
    span.textContent = `${cafe.city} · ${cafe.area}`;
    item.append(button, span);
    return item;
  }));
}

function renderAdminQueue() {
  adminQueueEl.replaceChildren(...adminQueue.map((report) => {
    const item = document.createElement('li');
    const title = document.createElement('strong');
    const request = document.createElement('span');
    const status = document.createElement('em');
    title.textContent = `[${report.type}] ${report.cafe}`;
    request.textContent = report.request;
    status.textContent = report.status;
    item.append(title, request, status);
    return item;
  }));
}

function renderReportOptions() {
  const options = cafes.map((cafe) => {
    const option = document.createElement('option');
    option.value = cafe.id;
    option.textContent = `${cafe.name} (${cafe.area})`;
    return option;
  });

  const newCafeOption = document.createElement('option');
  newCafeOption.value = 'new-cafe';
  newCafeOption.textContent = '새 카페 / 기타';
  reportCafeSelect.replaceChildren(...options, newCafeOption);
}

function startReport(cafeId) {
  const cafe = cafeById(cafeId);
  if (!cafe) return;

  reportCafeSelect.value = cafe.id;
  reportTypeSelect.value = 'update';
  reportDetailInput.placeholder = `${cafe.name}의 커피 가능 여부, 주소, 폐업 여부 등을 적어주세요.`;
  setReportStatus(`${cafe.name} 제보를 작성 중입니다.`);
  document.querySelector('#report')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  reportDetailInput.focus();
}

function submitReport(event) {
  event.preventDefault();
  const cafe = cafeById(reportCafeSelect.value);
  const type = reportTypeLabels[reportTypeSelect.value] || '수정';
  const detail = reportDetailInput.value.trim();

  if (!detail) {
    setReportStatus('검증할 내용을 입력해 주세요.');
    reportDetailInput.focus();
    return;
  }

  const report = {
    id: `report-${Date.now()}`,
    type,
    cafe: cafe ? cafe.name : '새 카페 / 기타',
    request: detail,
    status: type === '추가' ? '근거 필요' : '검수 대기',
  };

  adminQueue.unshift(report);
  reportDetailInput.value = '';
  setReportStatus(`${report.cafe} 제보가 Admin 검증 큐에 추가되었습니다.`);
  renderAdminQueue();
}

function renderDetail(cafe) {
  if (!cafe) return;

  const isSaved = savedCafeIds.has(cafe.id);
  detailBody.className = 'detail-body';
  detailBody.innerHTML = `
    <p class="eyebrow">${cafe.city} · ${cafe.area}</p>
    <h2>${cafe.name}</h2>
    <p>${cafe.address}</p>
    <dl class="metadata"><div><dt>검증 출처</dt><dd>${cafe.source}</dd></div><div><dt>최근 확인</dt><dd>${cafe.verifiedAt}</dd></div><div><dt>신뢰도</dt><dd>${cafe.confidence}</dd></div><div><dt>저장 상태</dt><dd>${isSaved ? '저장됨' : '미저장'}</dd></div></dl>
    <div>${tagsMarkup(cafe)}</div>
    <div class="modal-actions"><button type="button" class="${isSaved ? 'is-saved' : ''}" aria-pressed="${isSaved}" data-modal-save>${isSaved ? '저장됨' : '저장'}</button><button type="button" data-modal-report>정보 제보</button><a href="${cafe.links.naver}">외부 지도</a></div>
  `;
  detailBody.querySelector('[data-modal-save]').addEventListener('click', () => toggleSaved(cafe.id));
  detailBody.querySelector('[data-modal-report]').addEventListener('click', () => {
    closeDetail();
    startReport(cafe.id);
  });
}

function openDetail(cafeId) {
  const cafe = cafeById(cafeId);
  if (!cafe) return;

  renderDetail(cafe);
  if (typeof detailDialog.showModal === 'function') detailDialog.showModal();
  else detailDialog.setAttribute('open', '');
}

function closeDetail() {
  if (typeof detailDialog.close === 'function') detailDialog.close();
  else detailDialog.removeAttribute('open');
}

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  searchQuery = searchInput.value;
  renderCafeResults();
});

searchInput.addEventListener('input', () => {
  searchQuery = searchInput.value;
  renderCafeResults();
});

reportForm.addEventListener('submit', submitReport);
detailClose.addEventListener('click', closeDetail);
detailDialog.addEventListener('click', (event) => {
  if (event.target === detailDialog) closeDetail();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && detailDialog.open) closeDetail();
});

function render() {
  renderFilters();
  renderCafeResults();
  renderSavedList();
  renderAdminQueue();
}

renderReportOptions();
render();
