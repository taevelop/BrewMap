import { getMapProvider } from './map-services.js';

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
const areaLabels = {
  jeonpo: '전포',
  gwangan: '광안리',
  haeundae: '해운대',
  jung: '중구',
  yeongdo: '영도',
  dongnae: '동래',
  saha: '사하',
  gangseo: '강서',
  yeonje: '연제',
  geumjeong: '금정',
  buk: '북구',
  dong: '동구',
  nam: '남구',
  gijang: '기장',
  sasang: '사상',
};
const areaCodes = Object.fromEntries(Object.entries(areaLabels).map(([code, label]) => [label, code]));
const statusLabels = { active: '운영중', closed: '폐업', hidden: '숨김' };
const confidenceLabels = {
  A: 'A 등급',
  B: 'B 등급',
  C: 'C 등급',
  D: 'D 등급',
  X: '검증 필요',
};
const verificationSourceLabels = {
  owner_verified: '사장님 확인',
  admin_verified: '관리자 확인',
  user_report: '사용자 제보',
  menu_photo: '메뉴 사진',
};
const adminActionLabels = {
  seed: '초기 데이터',
  create_report: '제보 접수',
  approve_report: '제보 승인',
  reject_report: '제보 반려',
  create_cafe: '카페 등록',
  update_cafe: '카페 수정',
  delete_cafe: '카페 삭제',
  update_tag: '태그 수정',
  create_tag: '태그 등록',
  csv_import: 'CSV 반영',
};
const adminTargetLabels = {
  cafes: '카페',
  reports: '제보',
  coffee_capabilities: '커피 태그',
};
const confidenceLevels = ['A', 'B', 'C', 'D', 'X'];
const verificationSources = ['owner_verified', 'admin_verified', 'user_report', 'menu_photo'];
const csvRequiredColumns = ['id', 'name', 'city', 'area', 'address', 'latitude', 'longitude', 'capabilities', 'confidence', 'verification_source'];
const csvOptionalColumns = ['verified_at', 'naver_map_url', 'kakao_map_url', 'google_map_url'];
const savedStorageKey = 'brewmap.savedCafes.v1';
const neighborhoodMapZoom = 16;
const clusterBreakoutZoom = 16;
const activeMapProvider = getMapProvider();
const defaultMapViewport = activeMapProvider.defaultViewport;
const mapZoomRange = activeMapProvider.zoomRange;
let mapViewport = { ...defaultMapViewport };

function mapLinksFor(address, name) {
  const query = encodeURIComponent(`${address} ${name}`);
  return {
    naver: `https://map.naver.com/v5/search/${query}`,
    kakao: `https://map.kakao.com/link/search/${query}`,
    google: `https://www.google.com/maps/search/?api=1&query=${query}`,
  };
}

let cafes = [];
let cafeLoadState = 'loading';
let cafeLoadErrorMessage = '';

const adminQueue = [];

const adminLogs = [
  { id: 'log-seed-1', action: 'seed', targetTable: 'cafes', targetId: 'busan-coffee', summary: '네이버 저장 목록 기반 실제 카페 seed 데이터 반영', at: '2026. 6. 16.' },
];

const searchForm = document.querySelector('[data-search-form]');
const searchInput = document.querySelector('[data-search-input]');
const locationInput = document.querySelector('[data-location-input]');
const topLayer = document.querySelector('.top-layer');
const filterRow = document.querySelector('[data-filter-row]');
const locationPresetActions = document.querySelectorAll('[data-location-preset]');
const retroDesktopRoot = document.querySelector('[data-retro-desktop]');
const mapSurface = document.querySelector('[data-map-surface]');
const mapBaseLayer = document.querySelector('[data-map-base-layer]');
const mapMarkerLayer = document.querySelector('[data-map-marker-layer]');
const locationAction = document.querySelector('[data-location-action]');
const mapZoomInAction = document.querySelector('[data-map-zoom-in]');
const mapZoomOutAction = document.querySelector('[data-map-zoom-out]');
const mapAttribution = document.querySelector('[data-map-attribution]');
const mapStatus = document.querySelector('[data-map-status]');
const cafeGrid = document.querySelector('[data-cafe-grid]');
const adminQueueEl = document.querySelector('[data-admin-queue]');
const resultCount = document.querySelector('[data-result-count]');
const savedCount = document.querySelector('[data-saved-count]');
const savedList = document.querySelector('[data-saved-list]');
const savedStatus = document.querySelector('[data-saved-status]');
const loginAction = document.querySelector('[data-login-action]');
const loginLaterAction = document.querySelector('[data-login-later]');
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
const adminAuthStatus = document.querySelector('[data-admin-auth-status]');

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
let selectedCafeId = '';
let selectedAdminCafeId = '';
let selectedAdminTagKey = '';
let lastCsvValidation = null;
let lastCsvSource = '';
let retroDesktop = null;

const hasPublicSurface = Boolean(searchForm && filterRow && cafeGrid && resultCount);
const hasMapSurface = Boolean(mapSurface && mapBaseLayer && mapMarkerLayer);
const hasSavedSurface = Boolean(savedCount && savedList);
const hasReportSurface = Boolean(reportForm && reportCafeSelect && reportTypeSelect && reportDetailInput);
const hasDetailSurface = Boolean(detailDialog && detailBody && detailClose);
const hasAdminSurface = Boolean(adminCafeForm && adminTagForm && csvInput);
let adminAuthorized = !hasAdminSurface;

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

function confidenceLabel(confidence) {
  return confidenceLabels[confidence] || confidence;
}

function verificationSourceLabel(source) {
  return verificationSourceLabels[source] || source;
}

function adminActionLabel(action) {
  return adminActionLabels[action] || action;
}

function adminTargetLabel(targetTable) {
  return adminTargetLabels[targetTable] || targetTable;
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

function mapSurfaceSize() {
  const rect = mapSurface.getBoundingClientRect();
  return {
    width: rect.width || mapSurface.clientWidth || 420,
    height: rect.height || mapSurface.clientHeight || 470,
  };
}

function projectCoordinates(latitude, longitude, zoom) {
  return activeMapProvider.project(latitude, longitude, zoom)
    || activeMapProvider.project(defaultMapViewport.latitude, defaultMapViewport.longitude, zoom);
}

function unprojectCoordinates(point, zoom) {
  return activeMapProvider.unproject(point, zoom) || { ...defaultMapViewport, zoom };
}

function setMapViewportFromCenterPoint(centerPoint, zoom = mapViewport.zoom) {
  const nextZoom = clamp(Math.round(zoom), mapZoomRange.min, mapZoomRange.max);
  const nextCenter = unprojectCoordinates(centerPoint, nextZoom);
  mapViewport = activeMapProvider.normalizeViewport({ ...nextCenter, zoom: nextZoom });
}

function rerenderCurrentMap() {
  if (!hasMapSurface) return;
  renderMapPins(filteredCafes(), { keepViewport: true });
}

function updateMapZoomControlState() {
  if (!mapZoomInAction || !mapZoomOutAction) return;
  mapZoomInAction.disabled = mapViewport.zoom >= mapZoomRange.max;
  mapZoomOutAction.disabled = mapViewport.zoom <= mapZoomRange.min;
}

function renderMapAttribution() {
  if (!hasMapSurface || !mapAttribution) return;
  const attribution = activeMapProvider.attribution;
  mapAttribution.hidden = !attribution;
  if (!attribution) return;

  mapAttribution.textContent = attribution.label;
  mapAttribution.href = attribution.url;
}

function zoomForBounds(bounds, size) {
  const usableWidth = Math.max(size.width - 92, 180);
  const usableHeight = Math.max(size.height - 92, 180);

  for (let zoom = mapZoomRange.max; zoom >= mapZoomRange.min; zoom -= 1) {
    const northwest = projectCoordinates(bounds.maxLatitude, bounds.minLongitude, zoom);
    const southeast = projectCoordinates(bounds.minLatitude, bounds.maxLongitude, zoom);
    const spanWidth = Math.abs(southeast.x - northwest.x);
    const spanHeight = Math.abs(southeast.y - northwest.y);
    if (spanWidth <= usableWidth && spanHeight <= usableHeight) return zoom;
  }

  return mapZoomRange.min;
}

function fitMapToItems(items) {
  if (!items.length) {
    mapViewport = { ...defaultMapViewport };
    return;
  }

  const coordinates = items.map((cafe) => ({
    latitude: Number(cafe.latitude),
    longitude: Number(cafe.longitude),
  })).filter((coordinate) => Number.isFinite(coordinate.latitude) && Number.isFinite(coordinate.longitude));

  if (!coordinates.length) {
    mapViewport = { ...defaultMapViewport };
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

  const centerLatitude = (bounds.minLatitude + bounds.maxLatitude) / 2;
  const centerLongitude = (bounds.minLongitude + bounds.maxLongitude) / 2;
  const zoom = coordinates.length === 1 ? neighborhoodMapZoom : Math.min(neighborhoodMapZoom, zoomForBounds(bounds, mapSurfaceSize()));
  mapViewport = activeMapProvider.normalizeViewport({ latitude: centerLatitude, longitude: centerLongitude, zoom });
}

function renderMapBaseLayer() {
  if (!hasMapSurface) return;
  renderMapAttribution();
  activeMapProvider.renderBaseLayer({
    container: mapBaseLayer,
    viewport: mapViewport,
    surfaceSize: mapSurfaceSize(),
  });
  updateMapZoomControlState();
}

function screenPositionForCoordinates(latitude, longitude) {
  const { width, height } = mapSurfaceSize();
  const center = projectCoordinates(mapViewport.latitude, mapViewport.longitude, mapViewport.zoom);
  const point = projectCoordinates(latitude, longitude, mapViewport.zoom);
  return {
    left: width / 2 + point.x - center.x,
    top: height / 2 + point.y - center.y,
  };
}

function setMapStatus(message) {
  if (mapStatus) mapStatus.textContent = message;
}

function zoomMapTo(nextZoom) {
  const zoom = clamp(Math.round(nextZoom), mapZoomRange.min, mapZoomRange.max);
  if (zoom === mapViewport.zoom) return;

  mapViewport = activeMapProvider.normalizeViewport({ ...mapViewport, zoom });
  rerenderCurrentMap();
}

function zoomMapBy(delta, clientX, clientY) {
  zoomMapTo(mapViewport.zoom + delta, clientX, clientY);
}

function requestUserLocation() {
  if (!navigator.geolocation) {
    setMapStatus('현재 위치를 확인할 수 없습니다.');
    return;
  }

  setMapStatus('현재 위치 확인 중');
  navigator.geolocation.getCurrentPosition((position) => {
    mapViewport = activeMapProvider.normalizeViewport({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      zoom: neighborhoodMapZoom,
    });
    renderMapPins(filteredCafes(), { keepViewport: true });
    setMapStatus('현재 위치 기준으로 지도를 이동했습니다.');
  }, () => {
    setMapStatus('현재 위치를 확인할 수 없습니다.');
  }, { enableHighAccuracy: false, maximumAge: 300000, timeout: 6000 });
}

function clusterMapItems(items) {
  if (mapViewport.zoom >= clusterBreakoutZoom) {
    return items.map((cafe) => ({
      items: [cafe],
      ...screenPositionForCoordinates(cafe.latitude, cafe.longitude),
      latitude: Number(cafe.latitude),
      longitude: Number(cafe.longitude),
    }));
  }

  const cellSize = mapViewport.zoom >= 13 ? 44 : 64;
  const clusters = new Map();

  items.forEach((cafe) => {
    const position = screenPositionForCoordinates(cafe.latitude, cafe.longitude);
    const key = `${Math.floor(position.left / cellSize)}:${Math.floor(position.top / cellSize)}`;
    const cluster = clusters.get(key) || {
      items: [],
      left: 0,
      top: 0,
      latitude: 0,
      longitude: 0,
    };

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

function readSearchQuery() {
  return [searchInput?.value, locationInput?.value].filter(Boolean).join(' ').trim();
}

function syncSearchStateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const query = params.get('q') || '';
  const location = params.get('area') || '';
  const filters = params.get('coffee') || '';

  if (searchInput) searchInput.value = query;
  if (locationInput) locationInput.value = location;
  selectedFilters.clear();
  filters.split(',').map((value) => value.trim()).filter(Boolean).forEach((filter) => selectedFilters.add(filter));
  searchQuery = readSearchQuery();
}

function writeSearchStateToUrl() {
  if (!hasPublicSurface || !window.history?.replaceState) return;

  const params = new URLSearchParams(window.location.search);
  const query = searchInput?.value.trim() || '';
  const location = locationInput?.value.trim() || '';
  const filters = [...selectedFilters].sort();

  if (query) params.set('q', query);
  else params.delete('q');
  if (location) params.set('area', location);
  else params.delete('area');
  if (filters.length) params.set('coffee', filters.join(','));
  else params.delete('coffee');

  const nextUrl = `${window.location.pathname}${params.toString() ? `?${params}` : ''}${window.location.hash}`;
  window.history.replaceState({}, '', nextUrl);
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
  if (reportStatus) reportStatus.textContent = message;
}

function setSavedStatus(message) {
  if (savedStatus) savedStatus.textContent = message;
}

function setAdminCafeStatus(message) {
  if (adminCafeStatusText) adminCafeStatusText.textContent = message;
}

function setAdminTagStatus(message) {
  if (adminTagStatus) adminTagStatus.textContent = message;
}

function setAdminAuthStatus(message, state = '') {
  if (!adminAuthStatus) return;
  adminAuthStatus.textContent = message;
  adminAuthStatus.dataset.state = state;
}

function setAdminControlsEnabled(isEnabled) {
  if (!hasAdminSurface) return;
  document.querySelectorAll('[data-admin-cafe-form] input, [data-admin-cafe-form] select, [data-admin-cafe-form] button, [data-admin-tag-form] input, [data-admin-tag-form] button, [data-csv-input], [data-csv-sample], [data-csv-validate], [data-csv-import], [data-admin-queue] button').forEach((control) => {
    control.disabled = !isEnabled;
  });
}

function requireAdminAccess() {
  if (!hasAdminSurface || adminAuthorized) return true;
  setAdminAuthStatus('Admin session is required before changing operational data.', 'error');
  setAdminCafeStatus('Admin session is required.');
  setAdminTagStatus('Admin session is required.');
  return false;
}

async function verifyAdminSession() {
  if (!hasAdminSurface) return;
  adminAuthorized = false;
  setAdminControlsEnabled(false);
  setAdminAuthStatus('Checking admin session...', 'pending');

  try {
    const response = await fetch('/api/admin/session', { cache: 'no-store', credentials: 'same-origin' });
    if (!response.ok) throw new Error('Admin session check failed with ' + response.status);
    const session = await response.json();
    adminAuthorized = session.role === 'admin';
  } catch {
    adminAuthorized = false;
  }

  setAdminControlsEnabled(adminAuthorized);
  setAdminAuthStatus(adminAuthorized ? 'Admin session verified.' : 'Admin session required. Open this page through the protected /admin route.', adminAuthorized ? 'ok' : 'error');
}

function updateTopLayerOffset() {
  if (!topLayer) return;

  const height = Math.ceil(topLayer.getBoundingClientRect().height);
  if (height > 0) document.documentElement.style.setProperty('--top-layer-height', `${height}px`);
}

function renderFilters() {
  if (!filterRow) return;
  filterRow.replaceChildren(...mvpCapabilities().map((capability) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = selectedFilters.has(capability.key) ? 'is-active' : '';
    button.textContent = capability.label;
    button.addEventListener('click', () => {
      if (selectedFilters.has(capability.key)) selectedFilters.delete(capability.key);
      else selectedFilters.add(capability.key);
      writeSearchStateToUrl();
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
  const cafe = cafeById(cafeId);
  const shouldSave = !savedCafeIds.has(cafeId);
  if (shouldSave) savedCafeIds.add(cafeId);
  else savedCafeIds.delete(cafeId);

  setSavedStatus(shouldSave
    ? `${cafe?.name || '카페'}를 저장했습니다. 로그인하면 다른 기기에서도 볼 수 있어요.`
    : `${cafe?.name || '카페'} 저장을 해제했습니다.`);
  persistSavedCafeIds();
  renderCafeResults();
  renderSavedList();
  retroDesktop?.render();
  if (detailDialog?.open) renderDetail(cafeById(cafeId));
}

function selectCafe(cafeId, options = {}) {
  if (!cafeById(cafeId)) return;
  selectedCafeId = cafeId;
  renderCafeResults();

  if (options.scrollList) {
    document.querySelector(`[data-cafe-card="${cafeId}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  if (options.openDetail) openDetail(cafeId);
}

function renderCafe(cafe, index = 0) {
  const isSaved = savedCafeIds.has(cafe.id);
  const isSelected = selectedCafeId === cafe.id;
  const primaryTags = cafe.capabilities.slice(0, 3).map(tagLabel).join(' · ');
  const card = document.createElement('article');
  card.className = `cafe-card ${isSelected ? 'is-selected' : ''}`.trim();
  card.dataset.cafeCard = cafe.id;
  if (isSelected) card.setAttribute('aria-current', 'true');
  card.innerHTML = `
    <div class="result-rank" aria-hidden="true">${String(index + 1).padStart(2, '0')}</div>
    <div class="cafe-card-body">
      <div class="cafe-card-topline"><span>${escapeHtml(cafe.city)} · ${escapeHtml(cafe.area)}</span><strong>${escapeHtml(cafe.verifiedAt || '확인일 준비 중')} 확인</strong></div>
      <h3>${escapeHtml(cafe.name)}</h3>
      <p class="coffee-match">${escapeHtml(primaryTags || '커피 태그 확인 중')}</p>
      <p class="cafe-address">${escapeHtml(cafe.address)}</p>
      <dl class="metadata"><div><dt>제공 커피</dt><dd>${escapeHtml(primaryTags || '확인 중')}</dd></div><div><dt>확인 근거</dt><dd>${escapeHtml(verificationSourceLabel(cafe.source))}</dd></div><div><dt>신뢰도</dt><dd>${escapeHtml(confidenceLabel(cafe.confidence))}</dd></div></dl>
      <div class="tag-list">${tagsMarkup(cafe)}</div>
      <div class="card-actions"><button type="button" data-focus-map-action>지도에서 보기</button><button type="button" data-detail-action>상세</button><button type="button" class="${isSaved ? 'is-saved' : ''}" aria-pressed="${isSaved}" data-save-action>${isSaved ? '저장됨' : '저장'}</button><button type="button" data-report-action>정보 제보</button>${mapLinksMarkup(cafe)}</div>
    </div>
  `;
  card.querySelector('[data-focus-map-action]').addEventListener('click', () => selectCafe(cafe.id));
  card.querySelector('[data-detail-action]').addEventListener('click', () => selectCafe(cafe.id, { openDetail: true }));
  card.querySelector('[data-save-action]').addEventListener('click', () => toggleSaved(cafe.id));
  card.querySelector('[data-report-action]').addEventListener('click', () => startReport(cafe.id));
  return card;
}

function renderLoadingState() {
  const card = document.createElement('article');
  card.className = 'empty-state loading-state';
  card.innerHTML = '<h3>카페 정보를 불러오고 있습니다</h3><p>최근 확인된 부산 카페와 지도 마커를 준비하는 중입니다.</p>';
  return card;
}

function renderErrorState() {
  const card = document.createElement('article');
  card.className = 'empty-state error-state';
  card.innerHTML = `<h3>카페 정보를 불러오지 못했습니다</h3><p>${escapeHtml(cafeLoadErrorMessage || '잠시 후 다시 시도해 주세요.')}</p><button type="button" data-retry-load>다시 시도</button>`;
  card.querySelector('[data-retry-load]').addEventListener('click', async () => {
    cafeLoadState = 'loading';
    renderCafeResults();
    await loadSeedCafes();
    renderApp();
  });
  return card;
}

function renderEmptyState() {
  const hasActiveCriteria = Boolean(searchQuery || selectedFilters.size);
  const card = document.createElement('article');
  card.className = 'empty-state';
  card.innerHTML = hasActiveCriteria
    ? '<h3>조건에 맞는 카페를 찾지 못했습니다</h3><p>지역이나 커피 조건을 하나 줄여보세요.</p><div class="empty-actions"><button type="button" data-clear-empty-filters>전체 초기화</button><button type="button" data-empty-report>정보 제보</button></div>'
    : '<h3>최근 확인된 부산 카페를 준비 중입니다</h3><p>조건을 선택하거나 검색어를 입력하면 카페 목록이 이곳에 표시됩니다.</p>';

  card.querySelector('[data-clear-empty-filters]')?.addEventListener('click', () => {
    selectedFilters.clear();
    searchQuery = '';
    if (searchInput) searchInput.value = '';
    if (locationInput) locationInput.value = '';
    writeSearchStateToUrl();
    renderFilters();
    renderCafeResults();
  });
  card.querySelector('[data-empty-report]')?.addEventListener('click', () => {
    document.querySelector('#report')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    reportDetailInput?.focus();
  });
  return card;
}


function renderCafeNeighborhoodMap(cafe) {
  const mapEl = detailBody.querySelector('[data-cafe-neighborhood-map]');
  if (!mapEl) return;

  const baseLayer = mapEl.querySelector('[data-cafe-neighborhood-base]');
  const markerLayer = mapEl.querySelector('[data-cafe-neighborhood-marker]');
  const size = { width: mapEl.clientWidth || 520, height: mapEl.clientHeight || 240 };
  const viewport = activeMapProvider.normalizeViewport({
    latitude: Number(cafe.latitude),
    longitude: Number(cafe.longitude),
    zoom: neighborhoodMapZoom,
  });

  activeMapProvider.renderBaseLayer({ container: baseLayer, viewport, surfaceSize: size });
  const pin = document.createElement('span');
  pin.className = `map-pin cafe-neighborhood-pin confidence-${cafe.confidence.toLowerCase()}`;
  pin.setAttribute('aria-hidden', 'true');
  pin.style.left = '50%';
  pin.style.top = '50%';
  markerLayer.replaceChildren(pin);
}

function renderMapPins(items, options = {}) {
  if (!hasMapSurface) return;
  if (!options.keepViewport) fitMapToItems(items);
  renderMapBaseLayer();
  mapMarkerLayer.replaceChildren();

  clusterMapItems(items).forEach((cluster) => {
    if (cluster.items.length > 1) {
      const clusterButton = document.createElement('button');
      const previewNames = cluster.items.slice(0, 3).map((cafe) => cafe.name).join(', ');
      clusterButton.className = 'map-cluster';
      clusterButton.type = 'button';
      clusterButton.style.left = `${cluster.left.toFixed(1)}px`;
      clusterButton.style.top = `${cluster.top.toFixed(1)}px`;
      clusterButton.textContent = cluster.items.length;
      clusterButton.title = previewNames;
      clusterButton.setAttribute('aria-label', `${cluster.items.length}개 카페 지도 묶음`);
      clusterButton.addEventListener('click', () => {
        if (mapViewport.zoom >= mapZoomRange.max) {
          openDetail(cluster.items[0].id);
          return;
        }

        mapViewport = activeMapProvider.normalizeViewport({
          latitude: cluster.latitude,
          longitude: cluster.longitude,
          zoom: Math.min(mapZoomRange.max, mapViewport.zoom + 2),
        });
        setMapStatus(`${cluster.items.length}개 카페 권역으로 확대했습니다.`);
        renderMapPins(items, { keepViewport: true });
      });
      mapMarkerLayer.append(clusterButton);
      return;
    }

    const [cafe] = cluster.items;
    const pin = document.createElement('button');
    pin.className = `map-pin confidence-${cafe.confidence.toLowerCase()} ${selectedCafeId === cafe.id ? 'is-selected' : ''}`.trim();
    pin.type = 'button';
    pin.style.top = `${cluster.top.toFixed(1)}px`;
    pin.style.left = `${cluster.left.toFixed(1)}px`;
    pin.setAttribute('aria-label', `${cafe.name} 지도 핀`);
    pin.title = cafe.name;
    pin.textContent = '';
    pin.addEventListener('click', () => selectCafe(cafe.id, { scrollList: true, openDetail: true }));
    mapMarkerLayer.append(pin);
  });
}

function bindMapInteractions() {
  if (!hasMapSurface || !mapZoomInAction || !mapZoomOutAction) return;
  mapZoomInAction.addEventListener('click', () => zoomMapBy(1));
  mapZoomOutAction.addEventListener('click', () => zoomMapBy(-1));

  mapSurface.addEventListener('wheel', (event) => {
    event.preventDefault();
    zoomMapBy(event.deltaY < 0 ? 1 : -1, event.clientX, event.clientY);
  }, { passive: false });

  mapSurface.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || event.target.closest('button, a')) return;
    setMapStatus('브루맵 지도는 선택한 카페 주변만 보이도록 고정되어 있습니다.');
  });

  mapSurface.addEventListener('keydown', (event) => {
    const keyActions = {
      '+': () => zoomMapBy(1),
      '=': () => zoomMapBy(1),
      '-': () => zoomMapBy(-1),
      _: () => zoomMapBy(-1),
    };

    const action = keyActions[event.key];
    if (!action) return;
    event.preventDefault();
    action();
  });
}

function renderCafeResults() {
  if (!hasPublicSurface) return;

  if (cafeLoadState === 'loading') {
    resultCount.textContent = '불러오는 중';
    cafeGrid.replaceChildren(renderLoadingState());
    renderMapPins([]);
    return;
  }

  if (cafeLoadState === 'error') {
    resultCount.textContent = '불러오기 실패';
    cafeGrid.replaceChildren(renderErrorState());
    renderMapPins([]);
    return;
  }

  const items = filteredCafes();
  if (selectedCafeId && !items.some((cafe) => cafe.id === selectedCafeId)) selectedCafeId = '';
  resultCount.textContent = `${items.length}개 카페`;
  cafeGrid.replaceChildren(...(items.length ? items.map(renderCafe) : [renderEmptyState()]));
  renderMapPins(items);
}

function renderSavedList() {
  if (!hasSavedSurface) return;
  const savedItems = cafes.filter((cafe) => cafe.status !== 'hidden' && savedCafeIds.has(cafe.id));
  savedCount.textContent = `${savedItems.length}개`;

  if (!savedItems.length) {
    const empty = document.createElement('li');
    empty.textContent = '아직 저장한 카페가 없습니다. 마음에 드는 카페에서 저장을 눌러보세요.';
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
  if (!adminQueueEl) return;
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
  if (!reportCafeSelect) return;
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
  if (!hasReportSurface) return;
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
  setReportStatus(`${report.cafe} 제보가 운영 검토 대기열에 추가되었습니다.`);
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
  if (!requireAdminAccess()) return;
  const report = adminQueue.find((item) => item.id === reportId);
  if (!report) return;

  report.status = '승인됨';
  applyReportSideEffect(report);
  addAdminLog('approve_report', 'reports', report.id, `${report.cafe} ${report.type} 제보 승인`);
  renderApp();
}

function rejectReport(reportId) {
  if (!requireAdminAccess()) return;
  const report = adminQueue.find((item) => item.id === reportId);
  if (!report) return;

  report.status = '반려됨';
  addAdminLog('reject_report', 'reports', report.id, `${report.cafe} ${report.type} 제보 반려`);
  renderApp();
}

function renderDetail(cafe) {
  if (!hasDetailSurface) return;
  if (!cafe) return;

  const isSaved = savedCafeIds.has(cafe.id);
  detailBody.className = 'detail-body';
  detailBody.innerHTML = `
    <p class="eyebrow">${escapeHtml(cafe.city)} · ${escapeHtml(cafe.area)}</p>
    <h2>${escapeHtml(cafe.name)}</h2>
    <p>${escapeHtml(cafe.address)}</p>
    <dl class="metadata"><div><dt>검증 출처</dt><dd>${escapeHtml(verificationSourceLabel(cafe.source))}</dd></div><div><dt>최근 확인</dt><dd>${escapeHtml(cafe.verifiedAt || '-')}</dd></div><div><dt>신뢰도</dt><dd>${escapeHtml(confidenceLabel(cafe.confidence))}</dd></div><div><dt>저장 상태</dt><dd>${isSaved ? '저장됨' : '미저장'}</dd></div></dl>
    <div>${tagsMarkup(cafe)}</div>
    <div class="detail-neighborhood-map map-surface" data-cafe-neighborhood-map aria-label="${escapeHtml(cafe.name)} 주변 고정 동네 지도">
      <div class="map-base-layer" data-cafe-neighborhood-base aria-hidden="true"></div>
      <div class="map-marker-layer" data-cafe-neighborhood-marker></div>
      <span class="map-status">주변 동네 고정 지도</span>
      <a class="map-attribution" href="${escapeHtml(activeMapProvider.attribution?.url || '#')}" target="_blank" rel="noreferrer">${escapeHtml(activeMapProvider.attribution?.label || '지도 데이터')}</a>
    </div>
    <div class="modal-actions"><button type="button" class="${isSaved ? 'is-saved' : ''}" aria-pressed="${isSaved}" data-modal-save>${isSaved ? '저장됨' : '저장'}</button><button type="button" data-modal-report>정보 제보</button>${mapLinksMarkup(cafe)}</div>
  `;
  renderCafeNeighborhoodMap(cafe);
  detailBody.querySelector('[data-modal-save]').addEventListener('click', () => toggleSaved(cafe.id));
  detailBody.querySelector('[data-modal-report]').addEventListener('click', () => {
    closeDetail();
    startReport(cafe.id);
  });
}

function openDetail(cafeId) {
  if (!hasDetailSurface) return;
  const cafe = cafeById(cafeId);
  if (!cafe) return;

  renderDetail(cafe);
  if (typeof detailDialog.showModal === 'function' && !detailDialog.open) detailDialog.showModal();
  else detailDialog.setAttribute('open', '');
}

function closeDetail() {
  if (!detailDialog) return;
  if (typeof detailDialog.close === 'function') detailDialog.close();
  else detailDialog.removeAttribute('open');
}

function readSelectedCapabilities() {
  if (!adminCafeCapabilities) return new Set();
  return new Set([...adminCafeCapabilities.querySelectorAll('input:checked')].map((input) => input.value));
}

function renderAdminCapabilityControls(selected = readSelectedCapabilities()) {
  if (!adminCafeCapabilities) return;
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
  if (!adminCafeList) return;
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
  if (!adminPendingCount || !adminCafeCount || !adminTagCount) return;
  adminPendingCount.textContent = `${adminQueue.filter(isReportReviewable).length}건`;
  adminCafeCount.textContent = `${cafes.length}개`;
  adminTagCount.textContent = `${capabilityCatalog.length}개`;
}

function renderTagList() {
  if (!adminTagList) return;
  adminTagList.replaceChildren(...capabilityCatalog.map((capability) => {
    const item = document.createElement('div');
    const info = document.createElement('div');
    const edit = document.createElement('button');
    item.className = 'tag-admin-item';
    info.innerHTML = `<strong>${escapeHtml(capability.label)}</strong><span>${escapeHtml(capability.key)} · ${escapeHtml(capability.group)}${capability.isMvpFilter ? ' · 공개 필터' : ''}</span>`;
    edit.type = 'button';
    edit.textContent = '편집';
    edit.addEventListener('click', () => selectTagForEdit(capability.key));
    item.append(info, edit);
    return item;
  }));
}

function renderAdminLogs() {
  if (!adminLogList) return;
  adminLogList.replaceChildren(...adminLogs.slice(0, 8).map((log) => {
    const item = document.createElement('li');
    const title = document.createElement('strong');
    const summary = document.createElement('span');
    title.textContent = `${adminActionLabel(log.action)} · ${adminTargetLabel(log.targetTable)}:${log.targetId}`;
    summary.textContent = `${log.summary} · ${log.at}`;
    item.append(title, summary);
    return item;
  }));
}

function selectCafeForEdit(cafeId) {
  if (!hasAdminSurface) return;
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
  if (!hasAdminSurface) return;
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
  if (!hasAdminSurface) return { error: '관리자 화면을 찾을 수 없습니다.' };
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
  if (!requireAdminAccess()) return;
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
  if (!hasAdminSurface) return;
  if (!requireAdminAccess()) return;
  if (!selectedAdminCafeId) {
    setAdminCafeStatus('삭제할 카페를 먼저 선택해 주세요.');
    return;
  }

  const index = cafes.findIndex((cafe) => cafe.id === selectedAdminCafeId);
  if (index < 0) return;
  const targetCafe = cafes[index];
  if (!window.confirm(`${targetCafe.name}을 삭제할까요? 이 작업은 되돌릴 수 없습니다.`)) return;
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
  if (!hasAdminSurface) return;
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
  if (!hasAdminSurface) return;
  selectedAdminTagKey = '';
  adminTagForm.reset();
  adminTagFields.key.readOnly = false;
  setAdminTagStatus('');
}

function saveTagFromAdmin(event) {
  event.preventDefault();
  if (!requireAdminAccess()) return;
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
    if (record.city === 'busan' && record.area && !areaLabels[record.area]) errors.push(`${rowNumber}행: 지원하지 않는 부산 권역 코드입니다.`);

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
  if (!csvSummary || !csvImport || !csvErrors) return;
  csvSummary.textContent = `변경 미리보기: ${result.rowCount}행 중 ${result.validRows.length}행 통과, 오류 ${result.errors.length}건`;
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
  if (!csvInput) return;
  if (!requireAdminAccess()) return;
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
  cafeLoadState = 'loading';
  cafeLoadErrorMessage = '';

  if (typeof fetch !== 'function') {
    cafeLoadState = 'error';
    cafeLoadErrorMessage = '현재 환경에서 데이터를 요청할 수 없습니다.';
    return;
  }

  try {
    const response = await fetch('./data/seed-cafes.csv', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Seed CSV request failed with ${response.status}`);

    const validation = validateCsvImportText(await response.text());
    if (validation.errors.length) throw new Error(validation.errors.join('; '));

    cafes = validation.validRows.map(csvRecordToCafe);
    cafeLoadState = 'success';
  } catch (error) {
    cafeLoadState = 'error';
    cafeLoadErrorMessage = error.message;
    console.warn(`Using bundled cafe fallback data. ${error.message}`);
  }
}

function importCsvRows() {
  if (!csvInput || !csvSummary || !csvImport) return;
  if (!requireAdminAccess()) return;
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

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  const register = () => {
    navigator.serviceWorker.register('./service-worker.js').catch((error) => {
      console.warn(`Service worker registration failed. ${error.message}`);
    });
  };

  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register, { once: true });
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
  if (!csvInput) return;
  if (!requireAdminAccess()) return;
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
  retroDesktop?.render();
}

searchForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  searchQuery = readSearchQuery();
  writeSearchStateToUrl();
  renderCafeResults();
});

searchInput?.addEventListener('input', () => {
  searchQuery = readSearchQuery();
  writeSearchStateToUrl();
  renderCafeResults();
});

locationInput?.addEventListener('input', () => {
  searchQuery = readSearchQuery();
  writeSearchStateToUrl();
  renderCafeResults();
});

locationPresetActions.forEach((button) => {
  button.addEventListener('click', () => {
    if (!locationInput) return;
    locationInput.value = button.dataset.locationPreset || '';
    searchQuery = readSearchQuery();
    writeSearchStateToUrl();
    renderCafeResults();
  });
});

reportForm?.addEventListener('submit', submitReport);
locationAction?.addEventListener('click', requestUserLocation);
bindMapInteractions();
detailClose?.addEventListener('click', closeDetail);
detailDialog?.addEventListener('click', (event) => {
  if (event.target === detailDialog) closeDetail();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && detailDialog?.open) closeDetail();
});
if (topLayer && typeof ResizeObserver !== 'undefined') {
  const topLayerResizeObserver = new ResizeObserver(updateTopLayerOffset);
  topLayerResizeObserver.observe(topLayer);
}
window.addEventListener('resize', () => {
  updateTopLayerOffset();
  renderMapPins(filteredCafes());
});
adminCafeForm?.addEventListener('submit', saveCafeFromAdmin);
adminCafeNew?.addEventListener('click', resetCafeForm);
adminCafeDelete?.addEventListener('click', deleteSelectedCafe);
adminTagForm?.addEventListener('submit', saveTagFromAdmin);
adminTagNew?.addEventListener('click', resetTagForm);
csvSample?.addEventListener('click', loadCsvSample);
csvValidate?.addEventListener('click', validateCsvFromAdmin);
csvImport?.addEventListener('click', importCsvRows);
loginAction?.addEventListener('click', () => setSavedStatus('로그인 기능은 서버 계정 연결 단계에서 제공됩니다. 지금은 이 기기에 임시 저장됩니다.'));
loginLaterAction?.addEventListener('click', () => setSavedStatus('둘러보기를 계속합니다. 저장한 카페는 현재 기기에 남아 있습니다.'));

updateTopLayerOffset();
syncSearchStateFromUrl();
registerServiceWorker();
await loadSeedCafes();
savedCafeIds = readSavedCafeIds();
if (retroDesktopRoot) {
  const { createRetroDesktop } = await import('./retro-desktop.js?v=20260624-2');
  retroDesktop = createRetroDesktop({
    root: retroDesktopRoot,
    standardRoots: document.querySelectorAll('.search-shell, .ops-grid'),
    getCafes: () => cafes,
    getSavedCafeIds: () => savedCafeIds,
    getFilters: () => mvpCapabilities(),
    toggleSaved,
    tagLabel,
    confidenceLabel,
    verificationSourceLabel,
  });
}
resetCafeForm();
resetTagForm();
renderApp();
await verifyAdminSession();
