const capabilityCatalog = [
  { key: 'filter_coffee', label: '필터커피', group: '커피 종류', isMvpFilter: true },
  { key: 'cold_brew', label: '콜드브루', group: '커피 종류', isMvpFilter: true },
  { key: 'decaf', label: '디카페인', group: '커피 종류', isMvpFilter: true },
  { key: 'flat_white', label: '플랫화이트', group: '커피 종류', isMvpFilter: true },
  { key: 'einspanner', label: '아인슈페너', group: '커피 종류', isMvpFilter: false },
  { key: 'single_origin', label: '싱글오리진', group: '원두', isMvpFilter: true },
  { key: 'house_blend', label: '하우스 블렌드', group: '원두', isMvpFilter: false },
  { key: 'decaf_bean', label: '디카페인 원두', group: '원두', isMvpFilter: false },
  { key: 'hand_drip', label: '핸드드립', group: '추출', isMvpFilter: false },
  { key: 'batch_brew', label: '배치브루', group: '추출', isMvpFilter: false },
  { key: 'espresso_machine', label: '에스프레소 머신', group: '추출', isMvpFilter: false },
  { key: 'bean_sales', label: '원두구매', group: '구매', isMvpFilter: true },
  { key: 'dripbag_sales', label: '드립백 판매', group: '구매', isMvpFilter: false },
  { key: 'roastery', label: '로스터리', group: '매장', isMvpFilter: false },
  { key: 'specialty_coffee', label: '스페셜티 커피', group: '매장', isMvpFilter: false },
  { key: 'pet_friendly', label: '애견 동반', group: '옵션', isMvpFilter: false },
  { key: 'kids_zone', label: '키즈존', group: '옵션', isMvpFilter: false },
  { key: 'no_kids_zone', label: '노키즈존', group: '옵션', isMvpFilter: false },
  { key: 'outdoor_seating', label: '야외 좌석', group: '옵션', isMvpFilter: false },
  { key: 'discount_available', label: '할인 가능', group: '옵션', isMvpFilter: false },
  { key: 'rewards_available', label: '적립 가능', group: '옵션', isMvpFilter: false },
];

const searchAliases = {
  filter_coffee: ['필터', '브루잉', '드립커피', '핸드드립'],
  decaf: ['디카페인커피', 'decaf'],
  cold_brew: ['콜드브루커피', 'coldbrew'],
  flat_white: ['플랫 화이트', 'flatwhite', 'flat white'],
  einspanner: ['아인슈페너', 'einspanner'],
  single_origin: ['싱글 오리진', 'singleorigin', 'single origin'],
  house_blend: ['하우스블렌드', '블렌드', 'house blend'],
  decaf_bean: ['디카페인 원두', '디카프 원두'],
  bean_sales: ['원두', '원두 판매', '원두구매', 'bean sales'],
  dripbag_sales: ['드립백', 'dripbag', 'drip bag'],
  hand_drip: ['핸드 드립', 'handdrip', 'hand drip'],
  batch_brew: ['배치브루', 'batchbrew', 'batch brew'],
  espresso_machine: ['에스프레소머신', 'espresso machine'],
  roastery: ['로스팅', '로스터리카페', 'roastery'],
  specialty_coffee: ['스페셜티', 'specialty'],
  pet_friendly: ['애견동반', '반려견', '펫프렌들리'],
  kids_zone: ['키즈존', '아이 동반', '유아 동반'],
  no_kids_zone: ['노키즈', '노키즈존'],
  outdoor_seating: ['야외좌석', '야외테이블', '테라스'],
  discount_available: ['할인', '쿠폰'],
  rewards_available: ['적립', '포인트', '멤버십'],
};

const reportTypeLabels = {
  add: '추가',
  update: '수정',
  delete: '삭제',
  closed: '폐업',
  menu_change: '메뉴 변경',
};

const cityLabels = { busan: '부산', seoul: '서울' };
const cityCodes = { 부산: 'busan', 서울: 'seoul' };
const areaLabels = { jeonpo: '전포', gwangan: '광안리', haeundae: '해운대' };
const areaCodes = { 전포: 'jeonpo', 광안리: 'gwangan', 해운대: 'haeundae' };
const statusLabels = { active: '운영중', closed: '폐업', hidden: '숨김' };
const confidenceLevels = ['A', 'B', 'C', 'D', 'X'];
const verificationSources = ['owner_verified', 'admin_verified', 'user_report', 'menu_photo'];
const csvRequiredColumns = ['id', 'name', 'city', 'area', 'address', 'latitude', 'longitude', 'capabilities', 'confidence', 'verification_source'];
const csvOptionalColumns = ['verified_at', 'naver_map_url', 'kakao_map_url', 'google_map_url'];
const savedStorageKey = 'brewmap.savedCafes.v1';

function mapLinksFor(address, name) {
  const query = encodeURIComponent(`${address} ${name}`);
  return {
    naver: `https://map.naver.com/v5/search/${query}`,
    kakao: `https://map.kakao.com/link/search/${query}`,
    google: `https://www.google.com/maps/search/?api=1&query=${query}`,
  };
}

let cafes = [
  {
    id: 'jeonpo-archive',
    name: 'Archive Beans',
    city: '부산',
    area: '전포',
    address: '부산 부산진구 전포대로 209',
    latitude: 35.1549,
    longitude: 129.0632,
    capabilities: ['filter_coffee', 'single_origin', 'bean_sales'],
    confidence: 'A',
    verifiedAt: '2026-06-01',
    source: 'admin_verified',
    status: 'active',
    links: mapLinksFor('부산 부산진구 전포대로 209', 'Archive Beans'),
  },
  {
    id: 'gwangan-drip',
    name: 'Drip Station',
    city: '부산',
    area: '광안리',
    address: '부산 수영구 광남로 125',
    latitude: 35.1534,
    longitude: 129.1139,
    capabilities: ['filter_coffee', 'hand_drip', 'decaf'],
    confidence: 'B',
    verifiedAt: '2026-05-24',
    source: 'user_report',
    status: 'active',
    links: mapLinksFor('부산 수영구 광남로 125', 'Drip Station'),
  },
  {
    id: 'haeundae-cold',
    name: 'Cold Lab Roastery',
    city: '부산',
    area: '해운대',
    address: '부산 해운대구 해운대로 620',
    latitude: 35.1629,
    longitude: 129.1635,
    capabilities: ['cold_brew', 'flat_white', 'roastery'],
    confidence: 'B',
    verifiedAt: '2026-05-18',
    source: 'menu_photo',
    status: 'active',
    links: mapLinksFor('부산 해운대구 해운대로 620', 'Cold Lab Roastery'),
  },
  {
    id: 'haeundae-tenpercent-centum-design',
    name: '텐퍼센트커피 부산센텀디자인진흥원점',
    city: '부산',
    area: '해운대',
    address: '부산 해운대구 센텀6로 21',
    latitude: 35.1735161,
    longitude: 129.1292664,
    capabilities: ['espresso_machine', 'cold_brew', 'flat_white', 'einspanner'],
    confidence: 'A',
    verifiedAt: '2026-06-16',
    source: 'admin_verified',
    status: 'active',
    links: {
      naver: 'https://map.naver.com/p/entry/place/2018324444?lng=129.1292664&lat=35.1735161&placePath=%2Fhome&entry=plt&searchType=place',
      kakao: 'https://map.kakao.com/link/search/%ED%85%90%ED%8D%BC%EC%84%BC%ED%8A%B8%EC%BB%A4%ED%94%BC%20%EB%B6%80%EC%82%B0%EC%84%BC%ED%85%80%EB%94%94%EC%9E%90%EC%9D%B8%EC%A7%84%ED%9D%A5%EC%9B%90%EC%A0%90',
      google: 'https://www.google.com/maps/search/?api=1&query=%ED%85%90%ED%8D%BC%EC%84%BC%ED%8A%B8%EC%BB%A4%ED%94%BC%20%EB%B6%80%EC%82%B0%EC%84%BC%ED%85%80%EB%94%94%EC%9E%90%EC%9D%B8%EC%A7%84%ED%9D%A5%EC%9B%90%EC%A0%90',
    },
  },
];

const adminQueue = [
  { id: 'report-seed-1', typeCode: 'update', type: '수정', cafeId: 'gwangan-drip', cafe: 'Drip Station', request: '디카페인 가능 여부 확인 요청', status: '검수 대기' },
  { id: 'report-seed-2', typeCode: 'add', type: '추가', cafeId: '', cafe: 'New Brew Bar', request: '전포 신규 카페 등록 제보', status: '근거 필요' },
  { id: 'report-seed-3', typeCode: 'closed', type: '폐업', cafeId: '', cafe: 'Old Beans', request: '폐업 신고', status: '확인 필요' },
];

const adminLogs = [
  { id: 'log-seed-1', action: 'seed', targetTable: 'cafes', targetId: 'busan-mvp', summary: '부산 MVP 샘플 데이터 준비', at: '2026. 6. 15.' },
];

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
const adminPendingCount = document.querySelector('[data-admin-pending-count]');
const adminCafeCount = document.querySelector('[data-admin-cafe-count]');
const adminTagCount = document.querySelector('[data-admin-tag-count]');
const adminCafeForm = document.querySelector('[data-admin-cafe-form]');
const adminCafeCapabilities = document.querySelector('[data-admin-cafe-capabilities]');
const adminCafeList = document.querySelector('[data-admin-cafe-list]');
const adminCafeNew = document.querySelector('[data-admin-cafe-new]');
const adminCafeDelete = document.querySelector('[data-admin-cafe-delete]');
const adminCafeStatusText = document.querySelector('[data-admin-cafe-status-text]');
const adminTagForm = document.querySelector('[data-admin-tag-form]');
const adminTagList = document.querySelector('[data-admin-tag-list]');
const adminTagNew = document.querySelector('[data-admin-tag-new]');
const adminTagStatus = document.querySelector('[data-admin-tag-status]');
const csvInput = document.querySelector('[data-csv-input]');
const csvSample = document.querySelector('[data-csv-sample]');
const csvValidate = document.querySelector('[data-csv-validate]');
const csvImport = document.querySelector('[data-csv-import]');
const csvSummary = document.querySelector('[data-csv-summary]');
const csvErrors = document.querySelector('[data-csv-errors]');
const adminLogList = document.querySelector('[data-admin-log-list]');

const adminCafeFields = {
  id: document.querySelector('[data-admin-cafe-id]'),
  name: document.querySelector('[data-admin-cafe-name]'),
  city: document.querySelector('[data-admin-cafe-city]'),
  area: document.querySelector('[data-admin-cafe-area]'),
  address: document.querySelector('[data-admin-cafe-address]'),
  latitude: document.querySelector('[data-admin-cafe-latitude]'),
  longitude: document.querySelector('[data-admin-cafe-longitude]'),
  confidence: document.querySelector('[data-admin-cafe-confidence]'),
  source: document.querySelector('[data-admin-cafe-source]'),
  verifiedAt: document.querySelector('[data-admin-cafe-verified-at]'),
  status: document.querySelector('[data-admin-cafe-status]'),
  naver: document.querySelector('[data-admin-cafe-naver]'),
  kakao: document.querySelector('[data-admin-cafe-kakao]'),
  google: document.querySelector('[data-admin-cafe-google]'),
};

const adminTagFields = {
  key: document.querySelector('[data-admin-tag-key]'),
  label: document.querySelector('[data-admin-tag-label]'),
  group: document.querySelector('[data-admin-tag-group]'),
  isMvp: document.querySelector('[data-admin-tag-mvp]'),
};

const selectedFilters = new Set();
let savedCafeIds = new Set();
let searchQuery = '';
let selectedAdminCafeId = '';
let selectedAdminTagKey = '';
let lastCsvValidation = null;
let lastCsvSource = '';

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
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

function normalize(value) {
  return String(value).toLowerCase().replace(/\s+/g, '');
}

function safeUrl(value) {
  const url = String(value || '#').trim();
  if (url === '#' || /^https?:\/\//i.test(url)) return url;
  return '#';
}

function tagLabel(tag) {
  return capabilityCatalog.find((capability) => capability.key === tag)?.label || tag;
}

function mvpCapabilities() {
  return capabilityCatalog.filter((capability) => capability.isMvpFilter);
}

function cafeById(id) {
  return cafes.find((cafe) => cafe.id === id);
}

function activeCafes() {
  return cafes.filter((cafe) => cafe.status === 'active');
}

function positionForCoordinates(latitude, longitude) {
  const lat = Number(latitude);
  const lon = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return { top: '50%', left: '50%' };

  const top = clamp(82 - ((lat - 35.05) / 0.18) * 64, 12, 82);
  const left = clamp(12 + ((lon - 129) / 0.22) * 76, 12, 84);
  return { top: `${top.toFixed(0)}%`, left: `${left.toFixed(0)}%` };
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

function addAdminLog(action, targetTable, targetId, summary) {
  adminLogs.unshift({
    id: `log-${Date.now()}-${adminLogs.length}`,
    action,
    targetTable,
    targetId,
    summary,
    at: new Date().toLocaleString('ko-KR'),
  });
}

function searchTokens() {
  return searchQuery.trim().split(/\s+/).map(normalize).filter(Boolean);
}

function searchIndex(cafe) {
  const capabilityTerms = cafe.capabilities.flatMap((tag) => [tagLabel(tag), tag, ...(searchAliases[tag] || [])]);
  return normalize([cafe.name, cafe.city, cafe.area, cafe.address, ...capabilityTerms].join(' '));
}

function matchesSearch(cafe) {
  const tokens = searchTokens();
  if (!tokens.length) return true;
  const index = searchIndex(cafe);
  return tokens.every((token) => index.includes(token));
}

function tagsMarkup(cafe) {
  return cafe.capabilities.map((tag) => `<span class="tag">${escapeHtml(tagLabel(tag))}</span>`).join('');
}

function mapLinksMarkup(cafe) {
  return [
    ['naver', '네이버지도'],
    ['kakao', '카카오맵'],
    ['google', 'Google Maps'],
  ].map(([key, label]) => `<a href="${escapeHtml(safeUrl(cafe.links[key]))}" target="_blank" rel="noreferrer">${label}</a>`).join('');
}

function setReportStatus(message) {
  reportStatus.textContent = message;
}

function setAdminCafeStatus(message) {
  adminCafeStatusText.textContent = message;
}

function setAdminTagStatus(message) {
  adminTagStatus.textContent = message;
}

function renderFilters() {
  filterRow.replaceChildren(...mvpCapabilities().map((capability) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = selectedFilters.has(capability.key) ? 'is-active' : '';
    button.textContent = capability.label;
    button.addEventListener('click', () => {
      if (selectedFilters.has(capability.key)) selectedFilters.delete(capability.key);
      else selectedFilters.add(capability.key);
      renderFilters();
      renderCafeResults();
    });
    return button;
  }));
}

function filteredCafes() {
  return activeCafes().filter((cafe) => {
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
    <div class="cafe-card-topline"><span>${escapeHtml(cafe.city)} · ${escapeHtml(cafe.area)}</span><strong>신뢰도 ${escapeHtml(cafe.confidence)}</strong></div>
    <h3>${escapeHtml(cafe.name)}</h3>
    <p>${escapeHtml(cafe.address)}</p>
    <dl class="metadata"><div><dt>검증</dt><dd>${escapeHtml(cafe.source)}</dd></div><div><dt>최근 확인</dt><dd>${escapeHtml(cafe.verifiedAt || '-')}</dd></div></dl>
    <div>${tagsMarkup(cafe)}</div>
    <div class="card-actions"><button type="button" data-detail-action>상세</button><button type="button" class="${isSaved ? 'is-saved' : ''}" aria-pressed="${isSaved}" data-save-action>${isSaved ? '저장됨' : '저장'}</button><button type="button" data-report-action>정보 제보</button>${mapLinksMarkup(cafe)}</div>
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
    const position = positionForCoordinates(cafe.latitude, cafe.longitude);
    pin.className = `map-pin confidence-${cafe.confidence.toLowerCase()}`;
    pin.type = 'button';
    pin.style.top = position.top;
    pin.style.left = position.left;
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
  const savedItems = cafes.filter((cafe) => cafe.status !== 'hidden' && savedCafeIds.has(cafe.id));
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

function isReportReviewable(report) {
  return report.status !== '승인됨' && report.status !== '반려됨';
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

    if (isReportReviewable(report)) {
      const actions = document.createElement('div');
      const approve = document.createElement('button');
      const reject = document.createElement('button');
      actions.className = 'queue-actions';
      approve.type = 'button';
      approve.textContent = '승인';
      reject.type = 'button';
      reject.textContent = '반려';
      reject.className = 'secondary-button';
      approve.addEventListener('click', () => approveReport(report.id));
      reject.addEventListener('click', () => rejectReport(report.id));
      actions.append(approve, reject);
      item.append(actions);
    }

    return item;
  }));
}


function renderReportOptions() {
  const selectedValue = reportCafeSelect.value;
  const options = cafes.filter((cafe) => cafe.status !== 'hidden').map((cafe) => {
    const option = document.createElement('option');
    option.value = cafe.id;
    option.textContent = `${cafe.name} (${cafe.area})`;
    return option;
  });

  const newCafeOption = document.createElement('option');
  newCafeOption.value = 'new-cafe';
  newCafeOption.textContent = '새 카페 / 기타';
  reportCafeSelect.replaceChildren(...options, newCafeOption);
  if ([...reportCafeSelect.options].some((option) => option.value === selectedValue)) reportCafeSelect.value = selectedValue;
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
  const typeCode = reportTypeSelect.value;
  const type = reportTypeLabels[typeCode] || '수정';
  const detail = reportDetailInput.value.trim();

  if (!detail) {
    setReportStatus('검증할 내용을 입력해 주세요.');
    reportDetailInput.focus();
    return;
  }

  const report = {
    id: `report-${Date.now()}`,
    typeCode,
    type,
    cafeId: cafe ? cafe.id : '',
    cafe: cafe ? cafe.name : '새 카페 / 기타',
    request: detail,
    status: typeCode === 'add' ? '근거 필요' : '검수 대기',
  };

  adminQueue.unshift(report);
  reportDetailInput.value = '';
  setReportStatus(`${report.cafe} 제보가 Admin 검증 큐에 추가되었습니다.`);
  addAdminLog('create_report', 'reports', report.id, `${report.cafe} ${report.type} 제보 접수`);
  renderAdminQueue();
  renderAdminCounts();
  renderAdminLogs();
}

function applyReportSideEffect(report) {
  const cafe = cafeById(report.cafeId);
  if (!cafe) return;

  if (report.typeCode === 'closed') cafe.status = 'closed';
  if (report.typeCode === 'delete') cafe.status = 'hidden';
}

function approveReport(reportId) {
  const report = adminQueue.find((item) => item.id === reportId);
  if (!report) return;

  report.status = '승인됨';
  applyReportSideEffect(report);
  addAdminLog('approve_report', 'reports', report.id, `${report.cafe} ${report.type} 제보 승인`);
  renderApp();
}

function rejectReport(reportId) {
  const report = adminQueue.find((item) => item.id === reportId);
  if (!report) return;

  report.status = '반려됨';
  addAdminLog('reject_report', 'reports', report.id, `${report.cafe} ${report.type} 제보 반려`);
  renderApp();
}

function renderDetail(cafe) {
  if (!cafe) return;

  const isSaved = savedCafeIds.has(cafe.id);
  detailBody.className = 'detail-body';
  detailBody.innerHTML = `
    <p class="eyebrow">${escapeHtml(cafe.city)} · ${escapeHtml(cafe.area)}</p>
    <h2>${escapeHtml(cafe.name)}</h2>
    <p>${escapeHtml(cafe.address)}</p>
    <dl class="metadata"><div><dt>검증 출처</dt><dd>${escapeHtml(cafe.source)}</dd></div><div><dt>최근 확인</dt><dd>${escapeHtml(cafe.verifiedAt || '-')}</dd></div><div><dt>신뢰도</dt><dd>${escapeHtml(cafe.confidence)}</dd></div><div><dt>저장 상태</dt><dd>${isSaved ? '저장됨' : '미저장'}</dd></div></dl>
    <div>${tagsMarkup(cafe)}</div>
    <div class="modal-actions"><button type="button" class="${isSaved ? 'is-saved' : ''}" aria-pressed="${isSaved}" data-modal-save>${isSaved ? '저장됨' : '저장'}</button><button type="button" data-modal-report>정보 제보</button>${mapLinksMarkup(cafe)}</div>
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
  if (typeof detailDialog.showModal === 'function' && !detailDialog.open) detailDialog.showModal();
  else detailDialog.setAttribute('open', '');
}

function closeDetail() {
  if (typeof detailDialog.close === 'function') detailDialog.close();
  else detailDialog.removeAttribute('open');
}

function readSelectedCapabilities() {
  return new Set([...adminCafeCapabilities.querySelectorAll('input:checked')].map((input) => input.value));
}

function renderAdminCapabilityControls(selected = readSelectedCapabilities()) {
  const selectedSet = selected instanceof Set ? selected : new Set(selected);
  adminCafeCapabilities.replaceChildren(...capabilityCatalog.map((capability) => {
    const label = document.createElement('label');
    const input = document.createElement('input');
    const span = document.createElement('span');
    label.className = 'check-line';
    input.type = 'checkbox';
    input.value = capability.key;
    input.checked = selectedSet.has(capability.key);
    span.textContent = `${capability.label} · ${capability.group}`;
    label.append(input, span);
    return label;
  }));
}

function renderAdminCafeList() {
  const rows = cafes.map((cafe) => {
    const row = document.createElement('div');
    const info = document.createElement('div');
    const meta = document.createElement('span');
    const edit = document.createElement('button');
    row.className = `admin-row status-${cafe.status}`;
    info.className = 'admin-row-info';
    info.innerHTML = `<strong>${escapeHtml(cafe.name)}</strong>`;
    meta.textContent = `${cafe.city} · ${cafe.area} · ${statusLabels[cafe.status] || cafe.status} · 태그 ${cafe.capabilities.length}개`;
    edit.type = 'button';
    edit.textContent = '편집';
    edit.addEventListener('click', () => selectCafeForEdit(cafe.id));
    info.append(meta);
    row.append(info, edit);
    return row;
  });

  if (!rows.length) {
    const empty = document.createElement('p');
    empty.className = 'form-status';
    empty.textContent = '등록된 카페가 없습니다.';
    adminCafeList.replaceChildren(empty);
    return;
  }

  adminCafeList.replaceChildren(...rows);
}

function renderAdminCounts() {
  adminPendingCount.textContent = `${adminQueue.filter(isReportReviewable).length}건`;
  adminCafeCount.textContent = `${cafes.length}개`;
  adminTagCount.textContent = `${capabilityCatalog.length}개`;
}

function renderTagList() {
  adminTagList.replaceChildren(...capabilityCatalog.map((capability) => {
    const item = document.createElement('div');
    const info = document.createElement('div');
    const edit = document.createElement('button');
    item.className = 'tag-admin-item';
    info.innerHTML = `<strong>${escapeHtml(capability.label)}</strong><span>${escapeHtml(capability.key)} · ${escapeHtml(capability.group)}${capability.isMvpFilter ? ' · MVP' : ''}</span>`;
    edit.type = 'button';
    edit.textContent = '편집';
    edit.addEventListener('click', () => selectTagForEdit(capability.key));
    item.append(info, edit);
    return item;
  }));
}

function renderAdminLogs() {
  adminLogList.replaceChildren(...adminLogs.slice(0, 8).map((log) => {
    const item = document.createElement('li');
    const title = document.createElement('strong');
    const summary = document.createElement('span');
    title.textContent = `${log.action} · ${log.targetTable}:${log.targetId}`;
    summary.textContent = `${log.summary} · ${log.at}`;
    item.append(title, summary);
    return item;
  }));
}

function selectCafeForEdit(cafeId) {
  const cafe = cafeById(cafeId);
  if (!cafe) return;

  selectedAdminCafeId = cafe.id;
  adminCafeFields.id.value = cafe.id;
  adminCafeFields.id.readOnly = true;
  adminCafeFields.name.value = cafe.name;
  adminCafeFields.city.value = cafe.city;
  adminCafeFields.area.value = cafe.area;
  adminCafeFields.address.value = cafe.address;
  adminCafeFields.latitude.value = cafe.latitude;
  adminCafeFields.longitude.value = cafe.longitude;
  adminCafeFields.confidence.value = cafe.confidence;
  adminCafeFields.source.value = cafe.source;
  adminCafeFields.verifiedAt.value = cafe.verifiedAt || '';
  adminCafeFields.status.value = cafe.status;
  adminCafeFields.naver.value = cafe.links.naver;
  adminCafeFields.kakao.value = cafe.links.kakao;
  adminCafeFields.google.value = cafe.links.google;
  renderAdminCapabilityControls(new Set(cafe.capabilities));
  setAdminCafeStatus(`${cafe.name} 편집 중`);
}

function resetCafeForm() {
  selectedAdminCafeId = '';
  adminCafeForm.reset();
  adminCafeFields.id.readOnly = false;
  adminCafeFields.city.value = '부산';
  adminCafeFields.status.value = 'active';
  adminCafeFields.confidence.value = 'B';
  adminCafeFields.source.value = 'admin_verified';
  renderAdminCapabilityControls(new Set());
  setAdminCafeStatus('');
}

function cafeDataFromAdminForm() {
  const id = adminCafeFields.id.value.trim();
  const latitude = Number(adminCafeFields.latitude.value);
  const longitude = Number(adminCafeFields.longitude.value);
  const capabilities = [...readSelectedCapabilities()];

  if (!/^[a-z0-9-]+$/.test(id)) return { error: 'ID는 소문자 영문, 숫자, hyphen만 사용할 수 있습니다.' };
  if (!adminCafeFields.name.value.trim()) return { error: '카페명을 입력해 주세요.' };
  if (!adminCafeFields.area.value.trim()) return { error: '권역을 입력해 주세요.' };
  if (!adminCafeFields.address.value.trim()) return { error: '주소를 입력해 주세요.' };
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return { error: '위도와 경도를 숫자로 입력해 주세요.' };
  if (!capabilities.length) return { error: '커피 태그를 1개 이상 선택해 주세요.' };
  if (capabilities.includes('kids_zone') && capabilities.includes('no_kids_zone')) return { error: '키즈존과 노키즈존은 동시에 선택할 수 없습니다.' };
  if (![adminCafeFields.naver.value, adminCafeFields.kakao.value, adminCafeFields.google.value].every((url) => isValidExternalLink(url.trim()))) {
    return { error: '지도 링크는 http(s) URL 또는 #만 사용할 수 있습니다.' };
  }

  return {
    cafe: {
      id,
      name: adminCafeFields.name.value.trim(),
      city: adminCafeFields.city.value,
      area: adminCafeFields.area.value.trim(),
      address: adminCafeFields.address.value.trim(),
      latitude,
      longitude,
      capabilities,
      confidence: adminCafeFields.confidence.value,
      verifiedAt: adminCafeFields.verifiedAt.value,
      source: adminCafeFields.source.value,
      status: adminCafeFields.status.value,
      links: {
        naver: adminCafeFields.naver.value.trim() || '#',
        kakao: adminCafeFields.kakao.value.trim() || '#',
        google: adminCafeFields.google.value.trim() || '#',
      },
    },
  };
}

function saveCafeFromAdmin(event) {
  event.preventDefault();
  const result = cafeDataFromAdminForm();
  if (result.error) {
    setAdminCafeStatus(result.error);
    return;
  }

  const { cafe } = result;
  const existingIndex = cafes.findIndex((item) => item.id === cafe.id);

  if (!selectedAdminCafeId && existingIndex >= 0) {
    setAdminCafeStatus('이미 존재하는 ID입니다.');
    return;
  }

  if (selectedAdminCafeId) {
    const selectedIndex = cafes.findIndex((item) => item.id === selectedAdminCafeId);
    if (selectedIndex < 0) return;
    cafes[selectedIndex] = cafe;
    addAdminLog('update_cafe', 'cafes', cafe.id, `${cafe.name} 수정`);
  } else {
    cafes.push(cafe);
    selectedAdminCafeId = cafe.id;
    adminCafeFields.id.readOnly = true;
    addAdminLog('create_cafe', 'cafes', cafe.id, `${cafe.name} 등록`);
  }

  renderApp();
  selectCafeForEdit(cafe.id);
  setAdminCafeStatus(`${cafe.name} 저장 완료`);
}

function deleteSelectedCafe() {
  if (!selectedAdminCafeId) {
    setAdminCafeStatus('삭제할 카페를 먼저 선택해 주세요.');
    return;
  }

  const index = cafes.findIndex((cafe) => cafe.id === selectedAdminCafeId);
  if (index < 0) return;
  const [removed] = cafes.splice(index, 1);
  savedCafeIds.delete(removed.id);
  persistSavedCafeIds();
  adminQueue.forEach((report) => {
    if (report.cafeId === removed.id) report.cafeId = '';
  });
  addAdminLog('delete_cafe', 'cafes', removed.id, `${removed.name} 삭제`);
  resetCafeForm();
  renderApp();
}

function selectTagForEdit(key) {
  const tag = capabilityCatalog.find((capability) => capability.key === key);
  if (!tag) return;

  selectedAdminTagKey = tag.key;
  adminTagFields.key.value = tag.key;
  adminTagFields.key.readOnly = true;
  adminTagFields.label.value = tag.label;
  adminTagFields.group.value = tag.group;
  adminTagFields.isMvp.checked = tag.isMvpFilter;
  setAdminTagStatus(`${tag.label} 편집 중`);
}

function resetTagForm() {
  selectedAdminTagKey = '';
  adminTagForm.reset();
  adminTagFields.key.readOnly = false;
  setAdminTagStatus('');
}

function saveTagFromAdmin(event) {
  event.preventDefault();
  const key = adminTagFields.key.value.trim();
  const label = adminTagFields.label.value.trim();
  const group = adminTagFields.group.value.trim();

  if (!/^[a-z0-9_]+$/.test(key)) {
    setAdminTagStatus('태그 ID는 소문자 영문, 숫자, underscore만 사용할 수 있습니다.');
    return;
  }

  if (!label || !group) {
    setAdminTagStatus('라벨과 그룹을 입력해 주세요.');
    return;
  }

  const payload = { key, label, group, isMvpFilter: adminTagFields.isMvp.checked };
  const existingIndex = capabilityCatalog.findIndex((capability) => capability.key === key);

  if (existingIndex >= 0) {
    capabilityCatalog[existingIndex] = payload;
    addAdminLog('update_tag', 'coffee_capabilities', key, `${label} 태그 수정`);
  } else {
    capabilityCatalog.push(payload);
    selectedAdminTagKey = key;
    adminTagFields.key.readOnly = true;
    addAdminLog('create_tag', 'coffee_capabilities', key, `${label} 태그 등록`);
  }

  selectedFilters.forEach((filter) => {
    if (!capabilityCatalog.some((capability) => capability.key === filter && capability.isMvpFilter)) selectedFilters.delete(filter);
  });
  renderApp();
  selectTagForEdit(key);
  setAdminTagStatus(`${label} 저장 완료`);
}

function parseCsvRows(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"') {
      if (inQuotes && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(cell);
      cell = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && text[index + 1] === '\n') index += 1;
      row.push(cell);
      if (row.some((value) => value.trim().length)) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  if (inQuotes) throw new Error('따옴표가 닫히지 않은 CSV입니다.');
  row.push(cell);
  if (row.some((value) => value.trim().length)) rows.push(row);
  return rows;
}

function isValidExternalLink(value) {
  return !value || value === '#' || /^https?:\/\//i.test(value);
}

function validateCsvImportText(text) {
  const errors = [];
  const validRows = [];

  if (!text.trim()) return { rowCount: 0, validRows, errors: ['CSV 내용을 입력해 주세요.'] };

  let rows;
  try {
    rows = parseCsvRows(text);
  } catch (error) {
    return { rowCount: 0, validRows, errors: [error.message] };
  }

  if (rows.length < 2) return { rowCount: 0, validRows, errors: ['헤더와 데이터 행이 필요합니다.'] };

  const headers = rows[0].map((header, index) => (index === 0 ? header.replace(/^\uFEFF/, '') : header).trim());
  const headerSet = new Set(headers);
  const duplicateHeaders = headers.filter((header, index) => headers.indexOf(header) !== index);
  const missingHeaders = csvRequiredColumns.filter((column) => !headerSet.has(column));
  const allowedHeaders = new Set([...csvRequiredColumns, ...csvOptionalColumns]);
  const unknownHeaders = headers.filter((header) => !allowedHeaders.has(header));

  duplicateHeaders.forEach((header) => errors.push(`중복 헤더: ${header}`));
  missingHeaders.forEach((header) => errors.push(`필수 헤더 누락: ${header}`));
  unknownHeaders.forEach((header) => errors.push(`알 수 없는 헤더: ${header}`));
  if (missingHeaders.length || duplicateHeaders.length || unknownHeaders.length) {
    return { rowCount: rows.length - 1, validRows, errors };
  }

  const seenIds = new Set();
  rows.slice(1).forEach((row, rowIndex) => {
    const rowNumber = rowIndex + 2;
    const rowErrorsStart = errors.length;
    const record = Object.fromEntries(headers.map((header, index) => [header, (row[index] || '').trim()]));

    csvRequiredColumns.forEach((column) => {
      if (!record[column]) errors.push(`${rowNumber}행: ${column} 값이 필요합니다.`);
    });

    if (record.id && !/^[a-z0-9-]+$/.test(record.id)) errors.push(`${rowNumber}행: id 형식이 올바르지 않습니다.`);
    if (seenIds.has(record.id)) errors.push(`${rowNumber}행: CSV 안에서 중복된 id입니다.`);
    seenIds.add(record.id);

    if (record.city && !cityLabels[record.city]) errors.push(`${rowNumber}행: city는 busan 또는 seoul이어야 합니다.`);
    if (record.city === 'busan' && record.area && !areaLabels[record.area]) errors.push(`${rowNumber}행: 부산 MVP 권역은 jeonpo, gwangan, haeundae만 허용합니다.`);

    const latitude = Number(record.latitude);
    const longitude = Number(record.longitude);
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) errors.push(`${rowNumber}행: latitude가 올바르지 않습니다.`);
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) errors.push(`${rowNumber}행: longitude가 올바르지 않습니다.`);

    const rowCapabilities = record.capabilities.split('|').map((tag) => tag.trim()).filter(Boolean);
    if (!rowCapabilities.length) errors.push(`${rowNumber}행: capabilities가 비어 있습니다.`);
    if (rowCapabilities.includes('kids_zone') && rowCapabilities.includes('no_kids_zone')) errors.push(`${rowNumber}행: kids_zone과 no_kids_zone은 동시에 사용할 수 없습니다.`);
    rowCapabilities.forEach((tag) => {
      if (!capabilityCatalog.some((capability) => capability.key === tag)) errors.push(`${rowNumber}행: 알 수 없는 capability ${tag}`);
    });

    if (record.confidence && !confidenceLevels.includes(record.confidence)) errors.push(`${rowNumber}행: confidence는 A, B, C, D, X 중 하나여야 합니다.`);
    if (record.verification_source && !verificationSources.includes(record.verification_source)) errors.push(`${rowNumber}행: verification_source가 허용 값이 아닙니다.`);
    if (record.verified_at && !/^\d{4}-\d{2}-\d{2}$/.test(record.verified_at)) errors.push(`${rowNumber}행: verified_at은 YYYY-MM-DD 형식이어야 합니다.`);
    ['naver_map_url', 'kakao_map_url', 'google_map_url'].forEach((column) => {
      if (!isValidExternalLink(record[column])) errors.push(`${rowNumber}행: ${column}은 http(s) URL 또는 #이어야 합니다.`);
    });

    if (errors.length === rowErrorsStart) validRows.push(record);
  });

  return { rowCount: rows.length - 1, validRows, errors };
}

function renderCsvValidation(result) {
  csvSummary.textContent = `${result.rowCount}행 중 ${result.validRows.length}행 통과, 오류 ${result.errors.length}건`;
  csvImport.disabled = result.errors.length > 0 || result.validRows.length === 0;

  if (!result.errors.length) {
    csvErrors.replaceChildren();
    return;
  }

  csvErrors.replaceChildren(...result.errors.map((error) => {
    const item = document.createElement('li');
    item.textContent = error;
    return item;
  }));
}

function validateCsvFromAdmin() {
  lastCsvSource = csvInput.value;
  lastCsvValidation = validateCsvImportText(lastCsvSource);
  renderCsvValidation(lastCsvValidation);
}

function csvRecordToCafe(record) {
  return {
    id: record.id,
    name: record.name,
    city: cityLabels[record.city],
    area: areaLabels[record.area] || record.area,
    address: record.address,
    latitude: Number(record.latitude),
    longitude: Number(record.longitude),
    capabilities: record.capabilities.split('|').map((tag) => tag.trim()).filter(Boolean),
    confidence: record.confidence,
    verifiedAt: record.verified_at || '',
    source: record.verification_source,
    status: 'active',
    links: {
      naver: record.naver_map_url || '#',
      kakao: record.kakao_map_url || '#',
      google: record.google_map_url || '#',
    },
  };
}

async function loadSeedCafes() {
  if (typeof fetch !== 'function') return;

  try {
    const response = await fetch('./data/seed-cafes.csv', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Seed CSV request failed with ${response.status}`);

    const validation = validateCsvImportText(await response.text());
    if (validation.errors.length) throw new Error(validation.errors.join('; '));

    cafes = validation.validRows.map(csvRecordToCafe);
  } catch (error) {
    console.warn(`Using bundled cafe fallback data. ${error.message}`);
  }
}

function importCsvRows() {
  if (!lastCsvValidation || lastCsvSource !== csvInput.value) validateCsvFromAdmin();
  if (!lastCsvValidation || lastCsvValidation.errors.length) return;

  let created = 0;
  let updated = 0;
  lastCsvValidation.validRows.forEach((record) => {
    const cafe = csvRecordToCafe(record);
    const existingIndex = cafes.findIndex((item) => item.id === cafe.id);
    if (existingIndex >= 0) {
      cafes[existingIndex] = { ...cafes[existingIndex], ...cafe };
      updated += 1;
    } else {
      cafes.push(cafe);
      created += 1;
    }
  });

  addAdminLog('csv_import', 'cafes', 'csv', `CSV 반영 신규 ${created}개, 수정 ${updated}개`);
  renderApp();
  csvSummary.textContent = `CSV 반영 완료: 신규 ${created}개, 수정 ${updated}개`;
  csvImport.disabled = true;
}

function csvEscape(value) {
  const text = String(value ?? '');
  if (/[",\r\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function cafeToCsvRecord(cafe) {
  return [
    cafe.id,
    cafe.name,
    cityCodes[cafe.city] || normalize(cafe.city),
    areaCodes[cafe.area] || normalize(cafe.area),
    cafe.address,
    Number(cafe.latitude).toFixed(7),
    Number(cafe.longitude).toFixed(7),
    cafe.capabilities.join('|'),
    cafe.confidence,
    cafe.source,
    cafe.verifiedAt,
    cafe.links.naver,
    cafe.links.kakao,
    cafe.links.google,
  ].map(csvEscape).join(',');
}

function loadCsvSample() {
  const header = [...csvRequiredColumns, ...csvOptionalColumns].join(',');
  csvInput.value = [header, ...cafes.slice(0, 3).map(cafeToCsvRecord)].join('\n');
  validateCsvFromAdmin();
}

function renderPublic() {
  renderFilters();
  renderCafeResults();
  renderSavedList();
  renderReportOptions();
}

function renderAdmin() {
  renderAdminQueue();
  renderAdminCafeList();
  renderAdminCounts();
  renderTagList();
  renderAdminLogs();
  renderAdminCapabilityControls();
}

function renderApp() {
  renderPublic();
  renderAdmin();
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
adminCafeForm.addEventListener('submit', saveCafeFromAdmin);
adminCafeNew.addEventListener('click', resetCafeForm);
adminCafeDelete.addEventListener('click', deleteSelectedCafe);
adminTagForm.addEventListener('submit', saveTagFromAdmin);
adminTagNew.addEventListener('click', resetTagForm);
csvSample.addEventListener('click', loadCsvSample);
csvValidate.addEventListener('click', validateCsvFromAdmin);
csvImport.addEventListener('click', importCsvRows);

await loadSeedCafes();
savedCafeIds = readSavedCafeIds();
resetCafeForm();
resetTagForm();
renderApp();
