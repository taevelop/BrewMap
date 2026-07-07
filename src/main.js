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
  update_content: '콘텐츠 수정',
  publish_content: '콘텐츠 게시',
  create_content_block: '콘텐츠 블록 등록',
  update_content_block: '콘텐츠 블록 수정',
};
const adminTargetLabels = {
  cafes: '카페',
  reports: '제보',
  coffee_capabilities: '커피 태그',
  site_pages: '페이지',
  content_blocks: '콘텐츠 블록',
};
const contentStatusLabels = {
  draft: '초안',
  published: '게시됨',
  archived: '보관됨',
};
const contentBlockTypeLabels = {
  hero: 'Hero',
  notice: '공지',
  curation_card: '큐레이션 카드',
  text: '본문',
  cta: 'CTA',
};
const confidenceLevels = ['A', 'B', 'C', 'D', 'X'];
const verificationSources = ['owner_verified', 'admin_verified', 'user_report', 'menu_photo'];
const csvRequiredColumns = ['id', 'name', 'city', 'area', 'address', 'latitude', 'longitude', 'capabilities', 'confidence', 'verification_source'];
const csvOptionalColumns = ['verified_at', 'naver_map_url', 'kakao_map_url', 'google_map_url'];
const curationAssets = {
  jeonpo: '/assets/curation/jeonpo-local-espresso.png',
  haeundae: '/assets/curation/haeundae-seaside-cafe.png',
  detail: '/assets/curation/handdrip-detail-tools.png',
};
const areaCuration = {
  전포: {
    image: curationAssets.jeonpo,
    label: '전포 골목 에스프레소 바',
    summary: '낮은 조도의 바 자리와 작은 골목의 질감이 먼저 느껴지는 로컬 무드입니다.',
  },
  해운대: {
    image: curationAssets.haeundae,
    label: '해운대 바다 앞 조용한 카페',
    summary: '큰 창 너머 바다와 나무 테이블의 결이 차분하게 이어지는 무드입니다.',
  },
};
const defaultCuration = {
  image: curationAssets.detail,
  label: '손때 묻은 핸드드립 도구',
  summary: '도구, 원두, 나무 바의 촉감이 카페의 성격을 조용하게 보여주는 무드입니다.',
};
const savedStorageKey = 'brewmap.savedCafes.v1';
const authSessionStorageKey = 'brewmap.authSession.v1';
const authPendingEmailStorageKey = 'brewmap.authPendingEmail.v1';
const authPendingActionStorageKey = 'brewmap.authPendingAction.v1';
const supabaseProjectUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '');
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
const appleLoginEnabled = process.env.NEXT_PUBLIC_ENABLE_APPLE_LOGIN === 'true';
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
const defaultAdminContentPages = [
  {
    id: 'home',
    slug: 'home',
    title: 'BrewMap Home',
    description: '브루맵 공개 홈 콘텐츠',
    seoTitle: '브루맵 | 부산에서 원하는 커피를 찾는 지도',
    seoDescription: '메뉴와 최근 확인 정보를 기준으로 부산에서 원하는 커피를 판매하는 카페를 찾아보세요.',
    status: 'published',
    publishedAt: '2026-07-06T00:00:00.000Z',
    updatedAt: '2026-07-06T00:00:00.000Z',
    blocks: [
      {
        id: 'home-hero',
        pageId: 'home',
        blockKey: 'home-hero',
        blockType: 'hero',
        position: 1,
        isVisible: true,
        updatedAt: '2026-07-06T00:00:00.000Z',
        content: {
          headline: '마시고 싶은 커피가 있는 로컬 지도',
          body: '당신이 찾고 싶은 커피 지도',
          primaryCtaLabel: '부산 카페 찾기',
          primaryCtaHref: '#cafes',
        },
      },
      {
        id: 'home-notice',
        pageId: 'home',
        blockKey: 'home-notice',
        blockType: 'notice',
        position: 2,
        isVisible: true,
        updatedAt: '2026-07-06T00:00:00.000Z',
        content: {
          title: '부산 베타 데이터 보강 중',
          body: '전포, 해운대, 광안리 중심으로 커피 가능 여부와 최근 확인일을 계속 업데이트합니다.',
          severity: 'info',
        },
      },
      {
        id: 'home-curation-jeonpo',
        pageId: 'home',
        blockKey: 'home-curation-jeonpo',
        blockType: 'curation_card',
        position: 3,
        isVisible: true,
        updatedAt: '2026-07-06T00:00:00.000Z',
        content: {
          title: '부산 - 전포',
          body: '골목 에스프레소',
          imageUrl: '/assets/curation/jeonpo-local-espresso.png',
          linkedArea: '전포',
          linkedFilter: 'espresso_machine',
        },
      },
    ],
  },
];

const searchForm = document.querySelector('[data-search-form]');
const searchInput = document.querySelector('[data-search-input]');
const locationInput = document.querySelector('[data-location-input]');
const topLayer = document.querySelector('.top-layer');
const authNavLinks = document.querySelectorAll('[data-auth-nav]');
const loginNavLinks = document.querySelectorAll('[data-login-nav]');
const loginSection = document.querySelector('[data-login-section]');
const authWorkspace = document.querySelector('[data-auth-workspace]');
const filterRow = document.querySelector('[data-filter-row]');
const areaRail = document.querySelector('[data-area-rail]');
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
const savedStatusEls = document.querySelectorAll('[data-saved-status]');
const savedScope = document.querySelector('[data-saved-scope]');
const savedAuthStateLabel = document.querySelector('[data-saved-auth-state]');
const savedAuthNote = document.querySelector('[data-saved-auth-note]');
const loginForm = document.querySelector('[data-login-form]');
const loginEmailInput = document.querySelector('[data-login-email]');
const loginAction = document.querySelector('[data-login-action]');
const loginGoogleAction = document.querySelector('[data-login-google]');
const loginAppleAction = document.querySelector('[data-login-apple]');
const logoutActions = document.querySelectorAll('[data-logout-action]');
const reportForm = document.querySelector('[data-report-form]');
const reportCafeSelect = document.querySelector('[data-report-cafe]');
const reportTypeSelect = document.querySelector('[data-report-type]');
const reportDetailInput = document.querySelector('[data-report-detail]');
const reportStatus = document.querySelector('[data-report-status]');
const detailDialog = document.querySelector('[data-detail-dialog]');
const detailClose = document.querySelector('[data-detail-close]');
const detailBody = document.querySelector('[data-detail-body]');
const discoverPresetActions = document.querySelectorAll('[data-discover-preset]');
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
const adminContentPageCount = document.querySelector('[data-admin-content-page-count]');
const adminContentDraftCount = document.querySelector('[data-admin-content-draft-count]');
const adminContentPublishedAt = document.querySelector('[data-admin-content-published-at]');
const adminContentPageList = document.querySelector('[data-admin-content-page-list]');
const adminContentForm = document.querySelector('[data-admin-content-form]');
const adminContentNew = document.querySelector('[data-admin-content-new]');
const adminContentPreviewAction = document.querySelector('[data-admin-content-preview-action]');
const adminContentPublish = document.querySelector('[data-admin-content-publish]');
const adminContentStatus = document.querySelector('[data-admin-content-status]');
const adminContentBlockForm = document.querySelector('[data-admin-content-block-form]');
const adminContentBlockList = document.querySelector('[data-admin-content-block-list]');
const adminContentBlockNew = document.querySelector('[data-admin-content-block-new]');
const adminContentPreview = document.querySelector('[data-admin-content-preview]');

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
const adminContentFields = {
  slug: document.querySelector('[data-admin-content-slug]'),
  status: document.querySelector('[data-admin-content-status-select]'),
  title: document.querySelector('[data-admin-content-title]'),
  description: document.querySelector('[data-admin-content-description]'),
  seoTitle: document.querySelector('[data-admin-content-seo-title]'),
  seoDescription: document.querySelector('[data-admin-content-seo-description]'),
};

const adminContentBlockFields = {
  key: document.querySelector('[data-admin-content-block-key]'),
  type: document.querySelector('[data-admin-content-block-type]'),
  position: document.querySelector('[data-admin-content-block-position]'),
  visible: document.querySelector('[data-admin-content-block-visible]'),
  headline: document.querySelector('[data-admin-content-block-headline]'),
  body: document.querySelector('[data-admin-content-block-body]'),
  ctaLabel: document.querySelector('[data-admin-content-block-cta-label]'),
  ctaHref: document.querySelector('[data-admin-content-block-cta-href]'),
  imageUrl: document.querySelector('[data-admin-content-block-image-url]'),
  linkedArea: document.querySelector('[data-admin-content-block-linked-area]'),
  linkedFilter: document.querySelector('[data-admin-content-block-linked-filter]'),
};

const selectedFilters = new Set();
let savedCafeIds = new Set();
let authState = 'checking';
let authSession = null;
let authRecoveryFailed = false;
let authSyncMessage = '';
let searchQuery = '';
let selectedCafeId = '';
let selectedAdminCafeId = '';
let selectedAdminTagKey = '';
let adminContentPages = cloneContentPages(defaultAdminContentPages);
let selectedAdminContentPageId = 'home';
let selectedAdminContentBlockKey = 'home-hero';
let adminContentReadOnly = false;
let lastCsvValidation = null;
let lastCsvSource = '';
let retroDesktop = null;
const initialCafeResultLimit = 12;
const cafeResultPageSize = 12;
let visibleCafeResultCount = initialCafeResultLimit;

const hasPublicSurface = Boolean(searchForm && filterRow && cafeGrid && resultCount);
const hasMapSurface = Boolean(mapSurface && mapBaseLayer && mapMarkerLayer);
const hasLoginSurface = Boolean(loginForm);
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

function contentStatusLabel(status) {
  return contentStatusLabels[status] || status || '초안';
}

function blockTypeLabel(type) {
  return contentBlockTypeLabels[type] || type || '본문';
}

function cloneContentPages(pages) {
  return (Array.isArray(pages) ? pages : []).map((page) => ({
    id: page.id || page.slug || `page-${Date.now()}`,
    slug: page.slug || '',
    title: page.title || '',
    description: page.description || '',
    seoTitle: page.seoTitle || page.seo_title || '',
    seoDescription: page.seoDescription || page.seo_description || '',
    status: page.status || 'draft',
    publishedAt: page.publishedAt || page.published_at || '',
    updatedAt: page.updatedAt || page.updated_at || '',
    blocks: (Array.isArray(page.blocks) ? page.blocks : []).map((block) => ({
      id: block.id || block.blockKey || block.block_key || `block-${Date.now()}`,
      pageId: block.pageId || block.page_id || page.id || page.slug || '',
      blockKey: block.blockKey || block.block_key || '',
      blockType: block.blockType || block.block_type || 'text',
      position: Number(block.position || 0),
      content: { ...(block.content || {}) },
      isVisible: block.isVisible !== false && block.is_visible !== false,
      updatedAt: block.updatedAt || block.updated_at || '',
    })),
  }));
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

function panMapBy(deltaX, deltaY, startViewport = mapViewport) {
  const center = projectCoordinates(startViewport.latitude, startViewport.longitude, startViewport.zoom);
  setMapViewportFromCenterPoint({
    x: center.x - deltaX,
    y: center.y - deltaY,
  }, startViewport.zoom);
  rerenderCurrentMap();
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

function readJsonStorageValue(key, fallback) {
  if (typeof localStorage === 'undefined') return fallback;

  try {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : fallback;
  } catch {
    return fallback;
  }
}

function writeJsonStorageValue(key, value) {
  if (typeof localStorage === 'undefined') return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can fail in private browsing or restricted environments.
  }
}

function removeStorageValue(key) {
  if (typeof localStorage === 'undefined') return;

  try {
    localStorage.removeItem(key);
  } catch {
    // Storage can fail in private browsing or restricted environments.
  }
}

function supabaseAuthEnabled() {
  return Boolean(supabaseProjectUrl && supabasePublishableKey);
}

function authRedirectUrl() {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/`;
}

function isStandaloneLoginPage() {
  if (typeof window === 'undefined') return false;
  return window.location.pathname.replace(/\/$/, '') === '/login';
}

function loginPageUrl() {
  return '/login';
}

function publicAuthTargetUrl() {
  return `/${pendingAuthTargetHash()}`;
}

function authenticatedSessionReady() {
  return authState === 'authenticated' && Boolean(authSession);
}

function pendingAuthTargetHash() {
  const action = readJsonStorageValue(authPendingActionStorageKey, null);
  if (action?.type === 'report') return '#report';
  if (action?.type === 'save') return '#saved';
  return '#saved';
}
function normalizeSavedCafeIds(ids) {
  const values = ids instanceof Set ? [...ids] : Array.isArray(ids) ? ids : [];
  return new Set(values.filter((id) => typeof id === 'string' && cafeById(id)));
}

function authSessionExpired(session) {
  return Boolean(session?.expiresAt && Date.now() > Number(session.expiresAt));
}

function authSessionExpiresAt(expiresIn = 3600) {
  const seconds = Number(expiresIn || 3600);
  return Date.now() + Math.max(seconds - 60, 60) * 1000;
}

function authEmailFromAccessToken(accessToken) {
  if (typeof atob === 'undefined') return '';

  try {
    const payload = String(accessToken).split('.')[1];
    if (!payload) return '';
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='));
    return JSON.parse(decoded).email || '';
  } catch {
    return '';
  }
}

function authSessionFromPayload(payload, fallback = {}) {
  const accessToken = payload.access_token || payload.accessToken || '';
  if (!accessToken) return null;

  const expiresAt = payload.expires_at
    ? Number(payload.expires_at) * 1000
    : authSessionExpiresAt(payload.expires_in || payload.expiresIn);

  return {
    accessToken,
    refreshToken: payload.refresh_token || payload.refreshToken || fallback.refreshToken || '',
    tokenType: payload.token_type || payload.tokenType || fallback.tokenType || 'bearer',
    expiresAt,
    email: payload.user?.email || authEmailFromAccessToken(accessToken) || fallback.email,
  };
}
function readAuthSessionFromStorage() {
  const session = readJsonStorageValue(authSessionStorageKey, null);
  if (!session?.accessToken && !session?.refreshToken) return null;

  if (authSessionExpired(session) && !session.refreshToken) {
    removeStorageValue(authSessionStorageKey);
    return null;
  }

  return session;
}

function writeAuthSession(session) {
  authRecoveryFailed = false;
  authSession = session;
  writeJsonStorageValue(authSessionStorageKey, session);
}

function clearAuthSession() {
  authRecoveryFailed = false;
  authSession = null;
  removeStorageValue(authSessionStorageKey);
  removeStorageValue(authPendingEmailStorageKey);
}

function authSessionFromUrl() {
  if (typeof window === 'undefined' || !window.location.hash.includes('access_token')) return null;

  const params = new URLSearchParams(window.location.hash.slice(1));
  const pendingEmail = readJsonStorageValue(authPendingEmailStorageKey, '');

  return authSessionFromPayload({
    access_token: params.get('access_token'),
    refresh_token: params.get('refresh_token'),
    token_type: params.get('token_type'),
    expires_in: params.get('expires_in'),
    expires_at: params.get('expires_at'),
  }, { email: pendingEmail });
}

function authErrorFromUrl() {
  if (typeof window === 'undefined') return '';

  const paramsList = [
    new URLSearchParams(window.location.hash.startsWith('#') ? window.location.hash.slice(1) : ''),
    new URLSearchParams(window.location.search),
  ];

  for (const params of paramsList) {
    const message = params.get('error_description') || params.get('error_code') || params.get('error');
    if (message) return message;
  }

  return '';
}
function clearAuthCallbackFromUrl() {
  if (typeof window === 'undefined') return;

  const hasAuthHash = window.location.hash.includes('access_token') || window.location.hash.includes('error');
  const searchParams = new URLSearchParams(window.location.search);
  const hasAuthSearch = searchParams.has('error') || searchParams.has('error_code') || searchParams.has('error_description');
  if (!hasAuthHash && !hasAuthSearch) return;

  searchParams.delete('error');
  searchParams.delete('error_code');
  searchParams.delete('error_description');
  const search = searchParams.toString();
  const pathname = isStandaloneLoginPage() ? '/' : window.location.pathname;
  window.history.replaceState({}, '', `${pathname}${search ? `?${search}` : ''}${pendingAuthTargetHash()}`);
}
function bootstrapAuthSession() {
  const callbackSession = authSessionFromUrl();

  if (callbackSession) {
    writeAuthSession(callbackSession);
    clearAuthCallbackFromUrl();
    return { session: callbackSession, fromCallback: true, error: '' };
  }

  const callbackError = authErrorFromUrl();
  if (callbackError) {
    clearAuthCallbackFromUrl();
    return { session: null, fromCallback: true, error: callbackError };
  }

  authSession = readAuthSessionFromStorage();
  return { session: authSession, fromCallback: false, error: '' };
}

async function refreshAuthSession() {
  if (!authSession?.refreshToken || !supabaseAuthEnabled()) {
    clearAuthSession();
    return null;
  }

  try {
    const response = await fetch(`${supabaseProjectUrl}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: {
        apikey: supabasePublishableKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: authSession.refreshToken }),
    });

    if (!response.ok) throw new Error(`Supabase token refresh failed with ${response.status}.`);

    const refreshedSession = authSessionFromPayload(await response.json(), authSession);
    if (!refreshedSession) throw new Error('Supabase token refresh response is invalid.');

    writeAuthSession(refreshedSession);
    return refreshedSession;
  } catch {
    clearAuthSession();
    authRecoveryFailed = true;
    return null;
  }
}

async function ensureAuthSession() {
  if (!authSession) authSession = readAuthSessionFromStorage();
  if (!authSession) return null;
  if (authSession.accessToken && !authSessionExpired(authSession)) return authSession;
  return refreshAuthSession();
}

async function currentAccessToken() {
  const session = await ensureAuthSession();
  return session?.accessToken || '';
}

function setAuthState(nextState, message = '') {
  authState = nextState;
  authSyncMessage = message;
  renderSavedAuthUi();
  if (nextState === 'link_sent') setSavedStatus('');
  else if (message) setSavedStatus(message);
}

function savedScopeText() {
  if (!supabaseAuthEnabled()) return '이 기기 저장';
  if (authState === 'authenticated') return '계정 저장';
  if (authState === 'checking' || authState === 'syncing' || authState === 'pending') return '동기화 확인 중';
  return savedCafeIds.size ? '이 기기 저장' : '저장됨';
}

function savedAuthStateText() {
  if (!supabaseAuthEnabled()) return '이 기기 저장';
  if (authState === 'authenticated') return '로그인됨';
  if (authState === 'checking') return '로그인 확인 중';
  if (authState === 'syncing') return '동기화 중';
  if (authState === 'pending') return '요청 중';
  if (authState === 'link_sent') return '링크 발송됨';
  if (authState === 'offline') return '임시 저장 유지';
  if (authState === 'expired') return '다시 로그인 필요';
  return savedCafeIds.size ? '이 기기 저장' : '비로그인 저장';
}

function savedAuthNoteText() {
  if (!supabaseAuthEnabled()) return '현재 기기 기준으로 임시 저장합니다.';
  if (authState === 'authenticated') return authSession?.email ? `${authSession.email} 계정에 저장됩니다.` : '로그인 계정에 저장됩니다.';
  if (authState === 'checking') return '저장된 로그인 상태를 확인하고 있습니다.';
  if (authState === 'syncing' || authState === 'pending') return '계정 저장 목록과 동기화하고 있습니다.';
  if (authState === 'link_sent') {
    const pendingEmail = readJsonStorageValue(authPendingEmailStorageKey, '') || loginEmailInput?.value.trim() || '입력한 이메일';
    return `${pendingEmail}로 로그인 링크를 보냈습니다. 메일에서 링크를 열어 주세요.`;
  }
  if (authState === 'offline') return '계정 동기화에 실패해 이 기기 저장을 유지합니다. 다시 동기화하려면 Google, Apple 또는 로그인 링크를 사용해 주세요.';
  if (authState === 'expired') return '로그인 세션이 만료되었습니다. 다시 로그인하면 이 기기 저장 목록을 계정에 합칠 수 있습니다.';
  if (savedCafeIds.size) return '이 기기에 저장된 카페입니다. 로그인하면 계정 저장 목록에 합쳐집니다.';
  return '저장한 카페를 여러 기기에서 확인하려면 Google, Apple 또는 이메일로 로그인하세요.';
}

function renderAuthGatedUi() {
  const authenticated = authenticatedSessionReady();

  authNavLinks.forEach((link) => { link.hidden = !authenticated; });
  loginNavLinks.forEach((link) => { link.hidden = authenticated; });
  if (authWorkspace) authWorkspace.hidden = !authenticated;
  if (loginSection) loginSection.hidden = !isStandaloneLoginPage();
}
function renderSavedAuthUi() {
  renderAuthGatedUi();

  if (loginForm) loginForm.dataset.state = authState;
  if (savedScope) savedScope.textContent = savedScopeText();
  if (savedAuthStateLabel) {
    savedAuthStateLabel.dataset.state = authState;
    savedAuthStateLabel.textContent = savedAuthStateText();
  }

  const busy = authState === 'checking' || authState === 'syncing' || authState === 'pending';
  const authenticated = authState === 'authenticated';
  if (loginEmailInput) loginEmailInput.disabled = busy || authenticated;
  if (loginGoogleAction) loginGoogleAction.disabled = busy || authenticated || !supabaseAuthEnabled();
  if (loginAppleAction) {
    loginAppleAction.disabled = busy || authenticated || !supabaseAuthEnabled() || !appleLoginEnabled;
    loginAppleAction.title = appleLoginEnabled ? '' : 'Apple Provider 설정 후 활성화됩니다.';
  }
  if (loginAction) {
    loginAction.disabled = busy || authenticated || !supabaseAuthEnabled();
    loginAction.textContent = authState === 'link_sent' ? '이메일 다시 받기' : '이메일로 계속하기';
  }
  logoutActions.forEach((button) => { button.hidden = !authenticated; });
  if (savedAuthNote) savedAuthNote.textContent = savedAuthNoteText();
}

async function requestSavedCafeApi(method, cafeId = '') {
  const token = await currentAccessToken();
  if (!token) throw new Error('Supabase access token is required.');

  const headers = { authorization: `Bearer ${token}` };
  const options = { method, headers, cache: 'no-store' };

  if (method !== 'GET') {
    headers['content-type'] = 'application/json';
    options.body = JSON.stringify({ cafeId });
  }

  const response = await fetch('/api/saved-cafes', options);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthSession();
      authRecoveryFailed = true;
      authState = 'expired';
    }
    throw new Error(payload.message || `Saved cafes API failed with ${response.status}.`);
  }

  return normalizeSavedCafeIds(payload.savedCafeIds || []);
}

function refreshSavedSurfaces(options = {}) {
  renderCafeResults({ keepMapViewport: Boolean(options.keepMapViewport) });
  renderSavedList();
  retroDesktop?.render();

  if (detailDialog?.open) {
    const detailCafe = options.detailCafeId ? cafeById(options.detailCafeId) : cafeById(selectedCafeId);
    if (detailCafe) renderDetail(detailCafe);
  }
}

async function syncSavedCafesFromServer(options = {}) {
  const { mergeLocal = false, showSuccess = false } = options;
  const localSavedCafeIds = readSavedCafeIds();
  if (!(await currentAccessToken())) {
    setAuthState(authRecoveryFailed ? 'expired' : 'guest');
    return false;
  }

  setAuthState('syncing', '저장 목록을 계정과 동기화하고 있습니다.');

  try {
    let serverSavedCafeIds = await requestSavedCafeApi('GET');

    if (mergeLocal) {
      for (const cafeId of localSavedCafeIds) {
        if (!serverSavedCafeIds.has(cafeId)) serverSavedCafeIds = await requestSavedCafeApi('POST', cafeId);
      }
    }

    savedCafeIds = serverSavedCafeIds;
    persistSavedCafeIds();
    setAuthState('authenticated', showSuccess || mergeLocal ? '계정 저장 목록과 동기화했습니다.' : '계정 저장 목록을 불러왔습니다.');
    refreshSavedSurfaces({ keepMapViewport: true });
    return true;
  } catch (error) {
    savedCafeIds = localSavedCafeIds;
    persistSavedCafeIds();
    if (authRecoveryFailed) setAuthState('expired', '로그인 세션이 만료되었습니다. 다시 로그인해 주세요.');
    else if (authState !== 'guest') setAuthState('offline', `저장 동기화에 실패했습니다. 현재 기기 저장을 유지합니다. ${error.message}`);
    refreshSavedSurfaces({ keepMapViewport: true });
    return false;
  }
}

function queueAuthAction(action, message) {
  if (action?.type) writeJsonStorageValue(authPendingActionStorageKey, action);
  setAuthState('guest', message || '로그인이 필요한 기능입니다. 먼저 로그인해 주세요.');

  if (typeof window !== 'undefined') {
    if (!isStandaloneLoginPage()) {
      window.location.assign(loginPageUrl());
      return;
    }
    loginSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

async function consumePendingAuthAction() {
  const action = readJsonStorageValue(authPendingActionStorageKey, null);
  if (!authenticatedSessionReady() || !action?.type) return;

  removeStorageValue(authPendingActionStorageKey);

  if (action.type === 'save' && action.cafeId) {
    const cafe = cafeById(action.cafeId);
    if (!cafe) return;
    if (savedCafeIds.has(action.cafeId)) {
      setSavedStatus(`${cafe.name}는 이미 계정에 저장되어 있습니다.`);
      document.querySelector('#saved')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    await toggleSaved(action.cafeId);
    document.querySelector('#saved')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  if (action.type === 'report') {
    startReport(action.cafeId || '');
    if (action.submit) {
      submitReportDraft(action);
    }
  }
}

function requestOAuthLogin(provider, event) {
  event?.preventDefault();
  if (!hasLoginSurface) return;

  const providerLabel = provider === 'apple' ? 'Apple' : 'Google';
  if (!supabaseAuthEnabled()) {
    setAuthState('offline', `Supabase 환경 변수가 없어 ${providerLabel} 로그인 요청을 보낼 수 없습니다.`);
    return;
  }

  removeStorageValue(authPendingEmailStorageKey);
  setAuthState('pending', `${providerLabel} 로그인으로 이동합니다.`);

  const params = new URLSearchParams({
    provider,
    redirect_to: authRedirectUrl(),
  });
  window.location.assign(`${supabaseProjectUrl}/auth/v1/authorize?${params.toString()}`);
}

function requestGoogleLogin(event) {
  requestOAuthLogin('google', event);
}

function requestAppleLogin(event) {
  if (!appleLoginEnabled) {
    event?.preventDefault();
    setAuthState('offline', 'Apple 로그인은 Provider 설정 후 활성화됩니다.');
    return;
  }
  requestOAuthLogin('apple', event);
}

async function requestEmailLogin(event) {
  event?.preventDefault();
  if (!hasLoginSurface) return;

  const email = loginEmailInput?.value.trim() || '';
  if (!email) {
    setSavedStatus('로그인 링크를 받을 이메일을 입력해 주세요.');
    loginEmailInput?.focus();
    return;
  }

  if (!supabaseAuthEnabled()) {
    setAuthState('offline', 'Supabase 환경 변수가 없어 로그인 요청을 보낼 수 없습니다.');
    return;
  }

  setAuthState('pending', '로그인 링크를 요청하고 있습니다.');

  try {
    const response = await fetch(`${supabaseProjectUrl}/auth/v1/otp?redirect_to=${encodeURIComponent(authRedirectUrl())}`, {
      method: 'POST',
      headers: {
        apikey: supabasePublishableKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email,
        type: 'magiclink',
        create_user: true,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(body.slice(0, 160) || `Supabase Auth failed with ${response.status}.`);
    }

    writeJsonStorageValue(authPendingEmailStorageKey, email);
    setAuthState('link_sent', `${email}로 로그인 링크를 보냈습니다. 메일에서 링크를 열면 저장 목록을 계정과 동기화합니다.`);
  } catch (error) {
    setAuthState('offline', `로그인 링크 요청에 실패했습니다. ${error.message}`);
  }
}

async function logoutSavedAccount() {
  const token = await currentAccessToken();

  if (token && supabaseAuthEnabled()) {
    await fetch(`${supabaseProjectUrl}/auth/v1/logout`, {
      method: 'POST',
      headers: {
        apikey: supabasePublishableKey,
        authorization: `Bearer ${token}`,
      },
    }).catch(() => {});
  }

  clearAuthSession();
  savedCafeIds = readSavedCafeIds();
  setAuthState('guest', '로그아웃했습니다. 저장 목록은 현재 기기 임시 저장으로 유지됩니다.');
  refreshSavedSurfaces({ keepMapViewport: true });
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

function curationForCafe(cafe) {
  return areaCuration[cafe.area] || defaultCuration;
}

function setReportStatus(message) {
  if (reportStatus) reportStatus.textContent = message;
}

function setSavedStatus(message) {
  savedStatusEls.forEach((status) => {
    status.textContent = message;
  });
}

function setAdminCafeStatus(message) {
  if (adminCafeStatusText) adminCafeStatusText.textContent = message;
}

function setAdminTagStatus(message) {
  if (adminTagStatus) adminTagStatus.textContent = message;
}

function setAdminContentStatus(message) {
  if (adminContentStatus) adminContentStatus.textContent = message;
}

function setAdminAuthStatus(message, state = '') {
  if (!adminAuthStatus) return;
  adminAuthStatus.textContent = message;
  adminAuthStatus.dataset.state = state;
}

function setAdminControlsEnabled(isEnabled) {
  if (!hasAdminSurface) return;
  document.querySelectorAll('[data-admin-cafe-form] input, [data-admin-cafe-form] select, [data-admin-cafe-form] button, [data-admin-tag-form] input, [data-admin-tag-form] button, [data-admin-content-form] input, [data-admin-content-form] select, [data-admin-content-form] textarea, [data-admin-content-form] button, [data-admin-content-block-form] input, [data-admin-content-block-form] select, [data-admin-content-block-form] textarea, [data-admin-content-block-form] button, [data-csv-input], [data-csv-sample], [data-csv-validate], [data-csv-import], [data-admin-queue] button').forEach((control) => {
    control.disabled = !isEnabled;
  });
}

function requireAdminAccess() {
  if (!hasAdminSurface || adminAuthorized) return true;
  setAdminAuthStatus('Admin session is required before changing operational data.', 'error');
  setAdminCafeStatus('Admin session is required.');
  setAdminTagStatus('Admin session is required.');
  setAdminContentStatus('Admin content session is required.');
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

function preferredAreaOrder(label) {
  const preferred = ['전포', '광안리', '해운대', '영도', '동래', '교대', '부산대', '남산', '중구', '연제', '금정', '남구', '동구', '북구', '사하', '강서', '기장', '사상'];
  const index = preferred.indexOf(label);
  return index === -1 ? preferred.length : index;
}

function renderAreaRail() {
  if (!areaRail) return;
  const currentLocation = locationInput?.value.trim() || '';
  const areaCounts = activeCafes().reduce((counts, cafe) => {
    if (cafe.city !== '부산' || !cafe.area) return counts;
    counts.set(cafe.area, (counts.get(cafe.area) || 0) + 1);
    return counts;
  }, new Map());
  const areas = [...areaCounts.keys()].sort((a, b) => preferredAreaOrder(a) - preferredAreaOrder(b) || a.localeCompare(b, 'ko'));
  const controls = [
    { label: '부산 전체', value: '부산', count: activeCafes().filter((cafe) => cafe.city === '부산').length },
    ...areas.map((area) => ({ label: area, value: area, count: areaCounts.get(area) })),
  ];
  const label = document.createElement('span');
  label.textContent = '부산 권역';
  areaRail.replaceChildren(label, ...controls.map((control) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.locationPreset = control.value;
    button.className = currentLocation === control.value ? 'is-active' : '';
    button.setAttribute('aria-pressed', String(currentLocation === control.value));
    button.innerHTML = `${escapeHtml(control.label)} <small>${control.count}</small>`;
    button.addEventListener('click', () => applyLocationPreset(control.value));
    return button;
  }));
}

function resetCafeResultLimit() {
  visibleCafeResultCount = initialCafeResultLimit;
}

function applyLocationPreset(value) {
  if (!locationInput) return;
  locationInput.value = value;
  searchQuery = readSearchQuery();
  resetCafeResultLimit();
  writeSearchStateToUrl();
  renderCafeResults();
  renderAreaRail();
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
      resetCafeResultLimit();
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

async function toggleSaved(cafeId) {
  const cafe = cafeById(cafeId);

  if (!authenticatedSessionReady()) {
    queueAuthAction(
      { type: 'save', cafeId },
      `${cafe?.name || '카페'} 저장은 로그인 후 사용할 수 있습니다.`
    );
    return;
  }

  const shouldSave = !savedCafeIds.has(cafeId);
  if (shouldSave) savedCafeIds.add(cafeId);
  else savedCafeIds.delete(cafeId);

  setSavedStatus(shouldSave
    ? `${cafe?.name || '카페'}를 저장했습니다.`
    : `${cafe?.name || '카페'} 저장을 해제했습니다.`);
  persistSavedCafeIds();
  refreshSavedSurfaces({ keepMapViewport: true, detailCafeId: cafeId });

  try {
    savedCafeIds = await requestSavedCafeApi(shouldSave ? 'POST' : 'DELETE', cafeId);
    persistSavedCafeIds();
    setAuthState('authenticated', shouldSave
      ? `${cafe?.name || '카페'}를 계정에 저장했습니다.`
      : `${cafe?.name || '카페'} 계정 저장을 해제했습니다.`);
  } catch (error) {
    setAuthState(authRecoveryFailed ? 'expired' : 'offline', authRecoveryFailed
      ? '로그인 세션이 만료되었습니다. 다시 로그인해 주세요.'
      : `서버 저장 동기화에 실패했습니다. 현재 기기 저장은 유지됩니다. ${error.message}`);
  }

  refreshSavedSurfaces({ keepMapViewport: true, detailCafeId: cafeId });
}
function focusMapOnCafe(cafe) {
  if (!hasMapSurface || !cafe) return;
  const latitude = Number(cafe.latitude);
  const longitude = Number(cafe.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;

  mapViewport = activeMapProvider.normalizeViewport({
    latitude,
    longitude,
    zoom: neighborhoodMapZoom,
  });
  setMapStatus(`${cafe.name} 주변 지도로 이동했습니다.`);
}

function scrollMapIntoView() {
  const mapSection = document.querySelector('#map');
  if (!mapSection) return;
  if (window.location.hash !== '#map') window.location.hash = 'map';
  mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function selectCafe(cafeId, options = {}) {
  const cafe = cafeById(cafeId);
  if (!cafe) return;
  selectedCafeId = cafeId;
  if (options.focusMap) focusMapOnCafe(cafe);
  renderCafeResults({ keepMapViewport: Boolean(options.keepMapViewport || options.focusMap) });

  if (options.scrollList) {
    document.querySelector(`[data-cafe-card="${cafeId}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  if (options.scrollMap) requestAnimationFrame(scrollMapIntoView);
  if (options.openDetail) openDetail(cafeId);
}

function renderCafe(cafe, index = 0) {
  const isSelected = selectedCafeId === cafe.id;
  const primaryTags = cafe.capabilities.slice(0, 3).map(tagLabel).join(' · ');
  const card = document.createElement('article');
  card.className = `cafe-card ${isSelected ? 'is-selected' : ''}`.trim();
  card.dataset.cafeCard = cafe.id;
  if (isSelected) card.setAttribute('aria-current', 'true');
  card.innerHTML = `
    <div class="result-rank" aria-hidden="true">${String(index + 1).padStart(2, '0')}</div>
    <div class="cafe-card-body">
      <div class="cafe-card-title-row"><h3>${escapeHtml(cafe.name)}</h3><span class="cafe-area-badge">${escapeHtml(`${cafe.city} \u00b7 ${cafe.area}`)}</span></div>
      <p class="coffee-match">${escapeHtml(primaryTags || '커피 태그 확인 중')}</p>
      <div class="tag-list">${tagsMarkup(cafe)}</div>
      <div class="card-actions"><button type="button" data-focus-map-action>지도에서 보기</button><button type="button" data-detail-action>상세</button></div>
    </div>
  `;
  card.querySelector('[data-focus-map-action]').addEventListener('click', () => selectCafe(cafe.id, { focusMap: true, scrollMap: true }));
  card.querySelector('[data-detail-action]').addEventListener('click', () => selectCafe(cafe.id, { openDetail: true }));
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
    await loadCafes();
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
    startReport('');
  });
  return card;
}


function renderCafeNeighborhoodMap(cafe) {
  const mapEl = detailBody.querySelector('[data-cafe-neighborhood-map]');
  if (!mapEl) return;

  const baseLayer = mapEl.querySelector('[data-cafe-neighborhood-base]');
  const markerLayer = mapEl.querySelector('[data-cafe-neighborhood-marker]');
  const rect = mapEl.getBoundingClientRect();
  const size = {
    width: Math.max(Math.round(rect.width || mapEl.clientWidth || 520), 280),
    height: Math.max(Math.round(rect.height || mapEl.clientHeight || 240), 220),
  };
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
    pin.addEventListener('click', () => selectCafe(cafe.id, { keepMapViewport: true, scrollList: true, openDetail: true }));
    mapMarkerLayer.append(pin);
  });
}

function bindMapInteractions() {
  if (!hasMapSurface || !mapZoomInAction || !mapZoomOutAction) return;
  let dragState = null;
  mapZoomInAction.addEventListener('click', () => zoomMapBy(1));
  mapZoomOutAction.addEventListener('click', () => zoomMapBy(-1));

  mapSurface.addEventListener('wheel', (event) => {
    event.preventDefault();
    zoomMapBy(event.deltaY < 0 ? 1 : -1, event.clientX, event.clientY);
  }, { passive: false });

  mapSurface.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || event.target.closest('button, a')) return;
    event.preventDefault();
    dragState = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startViewport: { ...mapViewport },
    };
    mapSurface.classList.add('is-dragging');
    mapSurface.setPointerCapture?.(event.pointerId);
  });

  mapSurface.addEventListener('pointermove', (event) => {
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    event.preventDefault();
    panMapBy(event.clientX - dragState.startX, event.clientY - dragState.startY, dragState.startViewport);
  });

  const endDrag = (event) => {
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    mapSurface.classList.remove('is-dragging');
    mapSurface.releasePointerCapture?.(event.pointerId);
    dragState = null;
  };

  mapSurface.addEventListener('pointerup', endDrag);
  mapSurface.addEventListener('pointercancel', endDrag);
  mapSurface.addEventListener('lostpointercapture', () => {
    mapSurface.classList.remove('is-dragging');
    dragState = null;
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

function renderResultPager(items) {
  const pager = document.createElement('div');
  pager.className = 'result-pager';
  const hiddenCount = Math.max(0, items.length - visibleCafeResultCount);
  if (!hiddenCount) {
    pager.innerHTML = `<p>현재 조건의 ${items.length}개 카페를 모두 표시했습니다.</p>`;
    return pager;
  }
  const nextCount = Math.min(cafeResultPageSize, hiddenCount);
  pager.innerHTML = `<p>${items.length}개 중 ${Math.min(visibleCafeResultCount, items.length)}개만 먼저 표시 중입니다. 지도를 함께 보며 필요한 만큼 더 불러오세요.</p><button type="button">${nextCount}개 더 보기</button>`;
  pager.querySelector('button').addEventListener('click', () => {
    visibleCafeResultCount += cafeResultPageSize;
    renderCafeResults({ keepMapViewport: true });
  });
  return pager;
}

function renderCafeResults(options = {}) {
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
  const visibleItems = items.slice(0, visibleCafeResultCount);
  cafeGrid.replaceChildren(...(items.length ? [...visibleItems.map(renderCafe), renderResultPager(items)] : [renderEmptyState()]));
  renderMapPins(items, { keepViewport: Boolean(options.keepMapViewport) });
  renderAreaRail();
}

function renderSavedList() {
  if (!hasSavedSurface) return;
  renderSavedAuthUi();
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

function startReport(cafeId = '') {
  if (!hasReportSurface) return;

  const cafe = cafeById(cafeId);
  if (!authenticatedSessionReady()) {
    queueAuthAction(
      { type: 'report', cafeId: cafe?.id || '' },
      cafe ? `${cafe.name} 제보는 로그인 후 작성할 수 있습니다.` : '정보 제보는 로그인 후 작성할 수 있습니다.'
    );
    return;
  }

  if (cafe) {
    reportCafeSelect.value = cafe.id;
    reportTypeSelect.value = 'update';
    reportDetailInput.placeholder = `${cafe.name}의 커피 가능 여부, 주소, 폐업 여부 등을 적어주세요.`;
    setReportStatus(`${cafe.name} 제보를 작성 중입니다.`);
  } else {
    reportCafeSelect.value = 'new-cafe';
    reportTypeSelect.value = 'add';
    reportDetailInput.placeholder = '새 카페나 수정할 정보를 적어주세요.';
    setReportStatus('새 정보 제보를 작성 중입니다.');
  }

  document.querySelector('#report')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  reportDetailInput.focus();
}
function reportDraftFromForm() {
  return {
    type: 'report',
    submit: true,
    cafeId: reportCafeSelect?.value || 'new-cafe',
    typeCode: reportTypeSelect?.value || 'update',
    detail: reportDetailInput?.value.trim() || '',
  };
}

function restoreReportDraft(draft) {
  if (!hasReportSurface || !draft) return;
  if (draft.cafeId && [...reportCafeSelect.options].some((option) => option.value === draft.cafeId)) {
    reportCafeSelect.value = draft.cafeId;
  }
  if (draft.typeCode && [...reportTypeSelect.options].some((option) => option.value === draft.typeCode)) {
    reportTypeSelect.value = draft.typeCode;
  }
  if (typeof draft.detail === 'string') reportDetailInput.value = draft.detail;
}

function submitReportDraft(draft) {
  if (!hasReportSurface) return false;
  restoreReportDraft(draft);

  const cafe = cafeById(reportCafeSelect.value);
  const typeCode = reportTypeSelect.value;
  const type = reportTypeLabels[typeCode] || '수정';
  const detail = reportDetailInput.value.trim();

  if (!detail) {
    setReportStatus('검증할 내용을 입력해 주세요.');
    reportDetailInput.focus();
    return false;
  }

  const report = {
    id: `report-${Date.now()}`,
    typeCode,
    type,
    cafeId: cafe ? cafe.id : '',
    cafe: cafe ? cafe.name : '새 카페 / 기타',
    request: detail,
    status: typeCode === 'add' ? '근거 필요' : '검토 대기',
  };

  adminQueue.unshift(report);
  reportDetailInput.value = '';
  setReportStatus(`${report.cafe} 제보가 운영 검토 대기열에 추가되었습니다.`);
  addAdminLog('create_report', 'reports', report.id, `${report.cafe} ${report.type} 제보 접수`);
  renderAdminQueue();
  renderAdminCounts();
  renderAdminLogs();
  document.querySelector('#report')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return true;
}

function submitReport(event) {
  event.preventDefault();
  const draft = reportDraftFromForm();

  if (!draft.detail) {
    setReportStatus('검증할 내용을 입력해 주세요.');
    reportDetailInput.focus();
    return;
  }

  if (!authenticatedSessionReady()) {
    queueAuthAction(draft, '정보 제보는 로그인 후 제출할 수 있습니다. 로그인 후 이어서 접수합니다.');
    return;
  }

  submitReportDraft(draft);
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
  const curation = curationForCafe(cafe);
  const primaryTags = cafe.capabilities.slice(0, 3).map(tagLabel).join(' · ');
  detailBody.className = 'detail-body is-curation-detail';
  detailBody.innerHTML = `
    <section class="detail-visual" aria-label="${escapeHtml(cafe.name)} 분위기 큐레이션">
      <img src="${escapeHtml(curation.image)}" alt="${escapeHtml(cafe.area)} ${escapeHtml(curation.label)} 분위기" decoding="async" />
      <div class="detail-visual-copy">
        <p class="eyebrow">${escapeHtml(cafe.city)} · ${escapeHtml(cafe.area)}</p>
        <h2>${escapeHtml(cafe.name)}</h2>
        <p>${escapeHtml(curation.summary)}</p>
      </div>
    </section>
    <div class="detail-curation-grid">
      <section class="detail-curation-copy">
        <p class="detail-mood-label">${escapeHtml(curation.label)}</p>
        <p>${escapeHtml(primaryTags || '커피 태그 확인 중')}</p>
        <div class="tag-list">${tagsMarkup(cafe)}</div>
        <dl class="metadata detail-metadata"><div><dt>검증 출처</dt><dd>${escapeHtml(verificationSourceLabel(cafe.source))}</dd></div><div><dt>최근 확인</dt><dd>${escapeHtml(cafe.verifiedAt || '-')}</dd></div><div><dt>신뢰도</dt><dd>${escapeHtml(confidenceLabel(cafe.confidence))}</dd></div><div><dt>저장 상태</dt><dd>${isSaved ? '저장됨' : '미저장'}</dd></div></dl>
        <p class="detail-address">${escapeHtml(cafe.address)}</p>
        <div class="modal-actions"><button type="button" class="${isSaved ? 'is-saved' : ''}" aria-pressed="${isSaved}" data-modal-save>${isSaved ? '저장됨' : '저장'}</button><button type="button" data-modal-report>정보 제보</button>${mapLinksMarkup(cafe)}</div>
      </section>
      <div class="detail-neighborhood-map map-surface" data-cafe-neighborhood-map aria-label="${escapeHtml(cafe.name)} 주변 고정 동네 지도">
        <div class="map-base-layer" data-cafe-neighborhood-base aria-hidden="true"></div>
        <div class="map-marker-layer" data-cafe-neighborhood-marker></div>
        <span class="map-status">주변 동네 고정 지도</span>
        <a class="map-attribution" href="${escapeHtml(activeMapProvider.attribution?.url || '#')}" target="_blank" rel="noreferrer">${escapeHtml(activeMapProvider.attribution?.label || '지도 데이터')}</a>
      </div>
    </div>
  `;
  requestAnimationFrame(() => renderCafeNeighborhoodMap(cafe));
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

function normalizeCafePayload(cafe) {
  const links = cafe.links || {};
  return {
    id: String(cafe.id || ''),
    name: String(cafe.name || ''),
    city: cityLabels[cafe.city] || cafe.city || '',
    area: areaLabels[cafe.area] || cafe.area || '',
    address: cafe.address || '',
    latitude: Number(cafe.latitude),
    longitude: Number(cafe.longitude),
    capabilities: Array.isArray(cafe.capabilities) ? cafe.capabilities.filter(Boolean) : [],
    confidence: cafe.confidence || 'X',
    verifiedAt: cafe.verifiedAt || '',
    source: cafe.source || 'admin_verified',
    status: cafe.status || 'active',
    links: {
      naver: links.naver || '#',
      kakao: links.kakao || '#',
      google: links.google || '#',
    },
  };
}

function responseContentType(response) {
  return response.headers.get('content-type')?.toLowerCase() || '';
}

function htmlTitleFromText(text) {
  return text.match(/<title>(.*?)<\/title>/i)?.[1]?.trim() || '';
}

function isLikelyHtml(text) {
  return /^\s*<!doctype html/i.test(text) || /^\s*<html[\s>]/i.test(text);
}

async function assertExpectedResponse(response, label, expectedTypes) {
  if (!response.ok) throw new Error(`${label} request failed with ${response.status}`);

  const contentType = responseContentType(response);
  if (contentType.includes('text/html')) {
    const title = htmlTitleFromText(await response.clone().text().catch(() => ''));
    const page = title ? ` (${title})` : '';
    throw new Error(`${label} returned an HTML page${page}. Vercel Deployment Protection or domain routing may be blocking app data.`);
  }

  if (expectedTypes.length && contentType && !expectedTypes.some((type) => contentType.includes(type))) {
    throw new Error(`${label} returned ${contentType} instead of ${expectedTypes.join(' or ')}.`);
  }
}

async function loadSupabaseCafes() {
  const response = await fetch('/api/cafes', { cache: 'no-store' });
  await assertExpectedResponse(response, 'Cafe API', ['application/json']);

  const payload = await response.json().catch(() => {
    throw new Error('Cafe API response is not valid JSON.');
  });
  if (!Array.isArray(payload.cafes)) throw new Error('Cafe API response is invalid.');

  cafes = payload.cafes.map(normalizeCafePayload);
  cafeLoadState = 'success';
}

async function loadSeedCafeFallback(cause) {
  try {
    const response = await fetch('/data/seed-cafes.csv', { cache: 'no-store' });
    await assertExpectedResponse(response, 'Seed CSV', ['text/csv', 'text/plain', 'application/octet-stream', 'application/vnd.ms-excel']);

    const csvText = await response.text();
    if (isLikelyHtml(csvText)) {
      const title = htmlTitleFromText(csvText);
      const page = title ? ` (${title})` : '';
      throw new Error(`Seed CSV returned an HTML page${page}. Vercel Deployment Protection or cached routing may be blocking fallback data.`);
    }

    const validation = validateCsvImportText(csvText);
    if (validation.errors.length) throw new Error(validation.errors.join('; '));

    cafes = validation.validRows.map(csvRecordToCafe);
    cafeLoadState = 'success';
    cafeLoadErrorMessage = cause ? `Supabase fallback active: ${cause.message}` : '';
  } catch (fallbackError) {
    cafeLoadState = 'error';
    cafeLoadErrorMessage = cause
      ? `Supabase: ${cause.message}; CSV fallback: ${fallbackError.message}`
      : fallbackError.message;
  }
}

async function loadCafes() {
  cafeLoadState = 'loading';
  cafeLoadErrorMessage = '';

  if (typeof fetch !== 'function') {
    cafeLoadState = 'error';
    cafeLoadErrorMessage = '현재 환경에서 데이터를 요청할 수 없습니다.';
    return;
  }

  try {
    await loadSupabaseCafes();
  } catch (error) {
    console.warn(`Using CSV cafe fallback data. ${error.message}`);
    await loadSeedCafeFallback(error);
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
    navigator.serviceWorker.register('/service-worker.js').catch((error) => {
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


function sortedContentBlocks(page) {
  return [...(page?.blocks || [])].sort((a, b) => a.position - b.position);
}

function selectedAdminContentPage() {
  return adminContentPages.find((page) => page.id === selectedAdminContentPageId) || null;
}

function currentAdminContentPage() {
  return selectedAdminContentPage()
    || adminContentPages[0]
    || null;
}

function currentAdminContentBlock() {
  const page = currentAdminContentPage();
  return sortedContentBlocks(page).find((block) => block.blockKey === selectedAdminContentBlockKey)
    || sortedContentBlocks(page)[0]
    || null;
}

function renderAdminContentSummary() {
  if (!adminContentPageCount || !adminContentDraftCount || !adminContentPublishedAt) return;
  const publishedPages = adminContentPages.filter((page) => page.status === 'published');
  const latestPublishedAt = publishedPages.map((page) => page.publishedAt).filter(Boolean).sort().at(-1);
  adminContentPageCount.textContent = `${adminContentPages.length}개`;
  adminContentDraftCount.textContent = `${adminContentPages.filter((page) => page.status === 'draft').length}개`;
  adminContentPublishedAt.textContent = latestPublishedAt ? new Date(latestPublishedAt).toLocaleString('ko-KR') : '-';
}

function renderAdminContentPageList() {
  if (!adminContentPageList) return;
  const rows = adminContentPages.map((page) => {
    const row = document.createElement('div');
    const info = document.createElement('div');
    const meta = document.createElement('span');
    const edit = document.createElement('button');
    row.className = `admin-row content-status-${page.status}`;
    info.className = 'admin-row-info';
    info.innerHTML = `<strong>${escapeHtml(page.title)}</strong>`;
    meta.textContent = `${page.slug} · ${contentStatusLabel(page.status)} · 블록 ${page.blocks.length}개`;
    edit.type = 'button';
    edit.textContent = '편집';
    edit.addEventListener('click', () => selectContentPage(page.id));
    info.append(meta);
    row.append(info, edit);
    return row;
  });

  if (!rows.length) {
    const empty = document.createElement('p');
    empty.className = 'form-status';
    empty.textContent = '등록된 페이지가 없습니다.';
    adminContentPageList.replaceChildren(empty);
    return;
  }

  adminContentPageList.replaceChildren(...rows);
}

function renderAdminContentForm() {
  if (!adminContentForm) return;
  const page = currentAdminContentPage();
  if (!page) return;
  selectedAdminContentPageId = page.id;
  adminContentFields.slug.value = page.slug;
  adminContentFields.status.value = page.status;
  adminContentFields.title.value = page.title;
  adminContentFields.description.value = page.description || '';
  adminContentFields.seoTitle.value = page.seoTitle || '';
  adminContentFields.seoDescription.value = page.seoDescription || '';
}

function renderAdminContentBlockList() {
  if (!adminContentBlockList) return;
  const page = currentAdminContentPage();
  const rows = sortedContentBlocks(page).map((block) => {
    const row = document.createElement('div');
    const info = document.createElement('div');
    const meta = document.createElement('span');
    const edit = document.createElement('button');
    row.className = `admin-row content-block-row ${block.isVisible ? '' : 'is-hidden'}`.trim();
    info.className = 'admin-row-info';
    info.innerHTML = `<strong>${escapeHtml(block.content.headline || block.content.title || block.content.label || block.blockKey)}</strong>`;
    meta.textContent = `${block.blockKey} · ${blockTypeLabel(block.blockType)} · ${block.isVisible ? '공개' : '숨김'} · ${block.position}`;
    edit.type = 'button';
    edit.textContent = '편집';
    edit.addEventListener('click', () => selectContentBlock(block.blockKey));
    info.append(meta);
    row.append(info, edit);
    return row;
  });

  if (!rows.length) {
    const empty = document.createElement('p');
    empty.className = 'form-status';
    empty.textContent = '등록된 콘텐츠 블록이 없습니다.';
    adminContentBlockList.replaceChildren(empty);
    return;
  }

  adminContentBlockList.replaceChildren(...rows);
}

function renderAdminContentBlockForm() {
  if (!adminContentBlockForm) return;
  const block = currentAdminContentBlock();
  if (!block) {
    resetContentBlockForm();
    return;
  }

  selectedAdminContentBlockKey = block.blockKey;
  adminContentBlockFields.key.value = block.blockKey;
  adminContentBlockFields.type.value = block.blockType;
  adminContentBlockFields.position.value = String(block.position);
  adminContentBlockFields.visible.checked = block.isVisible;
  adminContentBlockFields.headline.value = block.content.headline || block.content.title || block.content.label || '';
  adminContentBlockFields.body.value = block.content.body || '';
  adminContentBlockFields.ctaLabel.value = block.content.primaryCtaLabel || block.content.label || '';
  adminContentBlockFields.ctaHref.value = block.content.primaryCtaHref || block.content.href || '';
  adminContentBlockFields.imageUrl.value = block.content.imageUrl || '';
  adminContentBlockFields.linkedArea.value = block.content.linkedArea || '';
  adminContentBlockFields.linkedFilter.value = block.content.linkedFilter || '';
}

function renderAdminContentPreview() {
  if (!adminContentPreview) return;
  const page = currentAdminContentPage();
  if (!page) return;
  const visibleBlocks = sortedContentBlocks(page).filter((block) => block.isVisible);
  const blockMarkup = visibleBlocks.map((block) => {
    const title = block.content.headline || block.content.title || block.content.label || block.blockKey;
    const body = block.content.body || block.content.primaryCtaHref || block.content.imageUrl || '';
    return `<li><strong>${escapeHtml(title)}</strong><span>${escapeHtml(blockTypeLabel(block.blockType))} · ${escapeHtml(body)}</span></li>`;
  }).join('');

  adminContentPreview.innerHTML = `
    <div class="content-preview-page">
      <p class="eyebrow">${escapeHtml(contentStatusLabel(page.status))}</p>
      <h3>${escapeHtml(page.title)}</h3>
      <p>${escapeHtml(page.description || page.seoDescription || '설명 없음')}</p>
      <ul>${blockMarkup || '<li><strong>빈 페이지</strong><span>공개 블록이 없습니다.</span></li>'}</ul>
    </div>
  `;
}

function renderAdminContent() {
  renderAdminContentSummary();
  renderAdminContentPageList();
  renderAdminContentForm();
  renderAdminContentBlockList();
  renderAdminContentBlockForm();
  renderAdminContentPreview();
}

function selectContentPage(pageId) {
  const page = adminContentPages.find((item) => item.id === pageId);
  if (!page) return;
  selectedAdminContentPageId = page.id;
  selectedAdminContentBlockKey = sortedContentBlocks(page)[0]?.blockKey || '';
  setAdminContentStatus(`${page.title} 편집 중`);
  renderAdminContent();
}

function selectContentBlock(blockKey) {
  const block = sortedContentBlocks(currentAdminContentPage()).find((item) => item.blockKey === blockKey);
  if (!block) return;
  selectedAdminContentBlockKey = block.blockKey;
  setAdminContentStatus(`${block.blockKey} 블록 편집 중`);
  renderAdminContentBlockForm();
}

function resetContentPageForm() {
  const draftPage = {
    id: `local-page-${Date.now()}`,
    slug: '',
    title: '',
    description: '',
    seoTitle: '',
    seoDescription: '',
    status: 'draft',
    publishedAt: '',
    updatedAt: new Date().toISOString(),
    blocks: [],
  };
  adminContentPages = adminContentPages.filter((page) => !String(page.id).startsWith('local-page-'));
  adminContentPages.unshift(draftPage);
  selectedAdminContentPageId = draftPage.id;
  selectedAdminContentBlockKey = '';
  adminContentFields.slug.value = '';
  adminContentFields.status.value = 'draft';
  adminContentFields.title.value = '';
  adminContentFields.description.value = '';
  adminContentFields.seoTitle.value = '';
  adminContentFields.seoDescription.value = '';
  resetContentBlockForm();
  renderAdminContentSummary();
  renderAdminContentPageList();
  renderAdminContentBlockList();
  renderAdminContentPreview();
  setAdminContentStatus('새 페이지를 작성 중입니다.');
}

function resetContentBlockForm() {
  selectedAdminContentBlockKey = '';
  adminContentBlockFields.key.value = '';
  adminContentBlockFields.type.value = 'text';
  adminContentBlockFields.position.value = String((currentAdminContentPage()?.blocks.length || 0) + 1);
  adminContentBlockFields.visible.checked = true;
  adminContentBlockFields.headline.value = '';
  adminContentBlockFields.body.value = '';
  adminContentBlockFields.ctaLabel.value = '';
  adminContentBlockFields.ctaHref.value = '';
  adminContentBlockFields.imageUrl.value = '';
  adminContentBlockFields.linkedArea.value = '';
  adminContentBlockFields.linkedFilter.value = '';
}

function contentPageFromAdminForm() {
  const slug = adminContentFields.slug.value.trim();
  const title = adminContentFields.title.value.trim();
  const existingPage = selectedAdminContentPage();
  if (!/^[a-z0-9][a-z0-9-]{1,80}$/.test(slug)) return { error: 'Slug는 소문자 영문, 숫자, hyphen만 사용할 수 있습니다.' };
  if (!title) return { error: '운영 제목을 입력해 주세요.' };
  return {
    page: {
      id: selectedAdminContentPageId || `local-page-${Date.now()}`,
      slug,
      title,
      description: adminContentFields.description.value.trim(),
      seoTitle: adminContentFields.seoTitle.value.trim(),
      seoDescription: adminContentFields.seoDescription.value.trim(),
      status: adminContentFields.status.value,
      publishedAt: existingPage?.publishedAt || '',
      updatedAt: new Date().toISOString(),
      blocks: existingPage?.blocks || [],
    },
  };
}

function contentBlockFromAdminForm() {
  const blockKey = adminContentBlockFields.key.value.trim();
  const position = Number(adminContentBlockFields.position.value || 0);
  if (!/^[a-z0-9][a-z0-9-]{1,120}$/.test(blockKey)) return { error: 'Block key는 소문자 영문, 숫자, hyphen만 사용할 수 있습니다.' };
  if (!Number.isInteger(position) || position < 0) return { error: '순서를 0 이상의 정수로 입력해 주세요.' };

  const blockType = adminContentBlockFields.type.value;
  const headline = adminContentBlockFields.headline.value.trim();
  const body = adminContentBlockFields.body.value.trim();
  const ctaLabel = adminContentBlockFields.ctaLabel.value.trim();
  const ctaHref = adminContentBlockFields.ctaHref.value.trim();
  const imageUrl = adminContentBlockFields.imageUrl.value.trim();
  const linkedArea = adminContentBlockFields.linkedArea.value.trim();
  const linkedFilter = adminContentBlockFields.linkedFilter.value.trim();
  const content = {};

  if (blockType === 'hero') {
    content.headline = headline;
    content.body = body;
    content.primaryCtaLabel = ctaLabel;
    content.primaryCtaHref = ctaHref;
  } else if (blockType === 'notice') {
    content.title = headline;
    content.body = body;
    content.severity = 'info';
  } else if (blockType === 'curation_card') {
    content.title = headline;
    content.body = body;
    content.imageUrl = imageUrl;
    content.linkedArea = linkedArea;
    content.linkedFilter = linkedFilter;
  } else if (blockType === 'cta') {
    content.label = ctaLabel || headline;
    content.href = ctaHref;
    content.body = body;
  } else {
    content.title = headline;
    content.body = body;
  }

  return {
    block: {
      id: selectedAdminContentBlockKey || `local-block-${Date.now()}`,
      pageId: currentAdminContentPage()?.id || selectedAdminContentPageId,
      blockKey,
      blockType,
      position,
      content,
      isVisible: adminContentBlockFields.visible.checked,
      updatedAt: new Date().toISOString(),
    },
  };
}

function upsertLocalContentPage(page) {
  const index = adminContentPages.findIndex((item) => item.id === page.id || item.slug === page.slug);
  if (index >= 0) adminContentPages[index] = page;
  else adminContentPages.push(page);
  selectedAdminContentPageId = page.id;
}

function upsertLocalContentBlock(block) {
  const page = currentAdminContentPage();
  if (!page) return;
  const index = page.blocks.findIndex((item) => item.blockKey === block.blockKey || item.blockKey === selectedAdminContentBlockKey);
  if (index >= 0) page.blocks[index] = block;
  else page.blocks.push(block);
  selectedAdminContentBlockKey = block.blockKey;
  page.updatedAt = new Date().toISOString();
}

async function persistContentPage(page) {
  if (adminContentReadOnly) throw new Error('Supabase Admin content API is in fallback read-only mode.');
  const isLocal = String(page.id).startsWith('local-') || page.id === page.slug;
  const endpoint = isLocal ? '/api/admin/content/pages' : `/api/admin/content/pages/${encodeURIComponent(page.id)}`;
  const response = await fetch(endpoint, {
    method: isLocal ? 'POST' : 'PATCH',
    headers: { 'content-type': 'application/json' },
    credentials: 'same-origin',
    cache: 'no-store',
    body: JSON.stringify(page),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || `Content API failed with ${response.status}`);
  return payload.page;
}

async function saveContentPageFromAdmin(event) {
  event.preventDefault();
  if (!requireAdminAccess()) return;
  const result = contentPageFromAdminForm();
  if (result.error) {
    setAdminContentStatus(result.error);
    return;
  }

  const page = result.page;
  upsertLocalContentPage(page);
  addAdminLog('update_content', 'site_pages', page.slug, `${page.title} 저장`);
  renderAdminContent();

  try {
    const savedPage = await persistContentPage(page);
    if (savedPage) upsertLocalContentPage(savedPage);
    setAdminContentStatus(`${page.title} 저장 완료`);
  } catch (error) {
    setAdminContentStatus(`${page.title} 로컬 저장 완료. 서버 반영은 보류됨: ${error.message}`);
  }
  renderAdminContent();
  renderAdminLogs();
}

async function saveContentBlockFromAdmin(event) {
  event.preventDefault();
  if (!requireAdminAccess()) return;
  const result = contentBlockFromAdminForm();
  if (result.error) {
    setAdminContentStatus(result.error);
    return;
  }

  const block = result.block;
  const action = currentAdminContentPage()?.blocks.some((item) => item.blockKey === block.blockKey) ? 'update_content_block' : 'create_content_block';
  upsertLocalContentBlock(block);
  addAdminLog(action, 'content_blocks', block.blockKey, `${block.blockKey} 블록 저장`);
  renderAdminContent();

  try {
    const savedPage = await persistContentPage(currentAdminContentPage());
    if (savedPage) upsertLocalContentPage(savedPage);
    setAdminContentStatus(`${block.blockKey} 블록 저장 완료`);
  } catch (error) {
    setAdminContentStatus(`${block.blockKey} 로컬 저장 완료. 서버 반영은 보류됨: ${error.message}`);
  }
  renderAdminContent();
  renderAdminLogs();
}

async function publishContentPageFromAdmin() {
  if (!requireAdminAccess()) return;
  const page = currentAdminContentPage();
  if (!page) return;
  page.status = 'published';
  page.publishedAt = new Date().toISOString();
  page.updatedAt = page.publishedAt;
  addAdminLog('publish_content', 'site_pages', page.slug, `${page.title} 게시`);
  renderAdminContent();

  try {
    if (String(page.id).startsWith('local-') || page.id === page.slug) await persistContentPage(page);
    else {
      const response = await fetch(`/api/admin/content/pages/${encodeURIComponent(page.id)}/publish`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        cache: 'no-store',
        body: JSON.stringify({ changeNote: `${page.title} 게시` }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || `Publish API failed with ${response.status}`);
      if (payload.page) upsertLocalContentPage(payload.page);
    }
    setAdminContentStatus(`${page.title} 게시 완료`);
  } catch (error) {
    setAdminContentStatus(`${page.title} 로컬 게시 완료. 서버 반영은 보류됨: ${error.message}`);
  }
  renderAdminContent();
  renderAdminLogs();
}

function previewContentPageFromAdmin() {
  const result = contentPageFromAdminForm();
  if (!result.error) upsertLocalContentPage(result.page);
  renderAdminContentPreview();
  setAdminContentStatus(result.error || '현재 입력값으로 미리보기를 갱신했습니다.');
}

async function loadAdminContentPages() {
  if (!adminContentPageList || !adminAuthorized) return;
  try {
    const response = await fetch('/api/admin/content/pages', { cache: 'no-store', credentials: 'same-origin' });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.message || `Content API failed with ${response.status}`);
    if (Array.isArray(payload.pages) && payload.pages.length) {
      adminContentPages = cloneContentPages(payload.pages);
      adminContentReadOnly = Boolean(payload.readOnly);
      selectedAdminContentPageId = adminContentPages[0].id;
      selectedAdminContentBlockKey = sortedContentBlocks(adminContentPages[0])[0]?.blockKey || '';
    }
    setAdminContentStatus(payload.readOnly ? `Fallback content loaded. ${payload.warning || ''}`.trim() : '콘텐츠 데이터를 불러왔습니다.');
  } catch (error) {
    adminContentPages = cloneContentPages(defaultAdminContentPages);
    adminContentReadOnly = true;
    setAdminContentStatus(`기본 콘텐츠로 시작합니다. ${error.message}`);
  }
  renderAdminContent();
}
function renderAdmin() {
  renderAdminQueue();
  renderAdminCafeList();
  renderAdminCounts();
  renderTagList();
  renderAdminLogs();
  renderAdminCapabilityControls();
  renderAdminContent();
}

function renderApp() {
  renderPublic();
  renderAreaRail();
  renderAdmin();
  retroDesktop?.render();
}

searchForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  searchQuery = readSearchQuery();
  resetCafeResultLimit();
  writeSearchStateToUrl();
  renderCafeResults();
});

searchInput?.addEventListener('input', () => {
  searchQuery = readSearchQuery();
  resetCafeResultLimit();
  writeSearchStateToUrl();
  renderCafeResults();
});

locationInput?.addEventListener('input', () => {
  searchQuery = readSearchQuery();
  resetCafeResultLimit();
  writeSearchStateToUrl();
  renderCafeResults();
  renderAreaRail();
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
adminContentForm?.addEventListener('submit', saveContentPageFromAdmin);
adminContentNew?.addEventListener('click', resetContentPageForm);
adminContentPreviewAction?.addEventListener('click', previewContentPageFromAdmin);
adminContentPublish?.addEventListener('click', publishContentPageFromAdmin);
adminContentBlockForm?.addEventListener('submit', saveContentBlockFromAdmin);
adminContentBlockNew?.addEventListener('click', resetContentBlockForm);
csvSample?.addEventListener('click', loadCsvSample);
csvValidate?.addEventListener('click', validateCsvFromAdmin);
csvImport?.addEventListener('click', importCsvRows);
loginForm?.addEventListener('submit', requestEmailLogin);
loginGoogleAction?.addEventListener('click', requestGoogleLogin);
loginAppleAction?.addEventListener('click', requestAppleLogin);
logoutActions.forEach((button) => {
  button.addEventListener('click', logoutSavedAccount);
});
discoverPresetActions.forEach((button) => {
  button.addEventListener('click', () => {
    const preset = button.dataset.discoverPreset;
    if (!preset) return;
    applyLocationPreset(preset);
    document.querySelector('#cafes')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

async function startBrewMap() {
  updateTopLayerOffset();
  const startedOnStandaloneLoginPage = isStandaloneLoginPage();
  syncSearchStateFromUrl();
  registerServiceWorker();
  await loadCafes();
  savedCafeIds = readSavedCafeIds();
  const authBootstrap = bootstrapAuthSession();
  if (authBootstrap.session) {
    setAuthState(authBootstrap.fromCallback ? 'syncing' : 'checking', authBootstrap.fromCallback
      ? '로그인을 확인했습니다. 계정 저장 목록과 동기화하고 있습니다.'
      : '저장된 로그인 상태를 확인하고 있습니다.');
    await syncSavedCafesFromServer({ mergeLocal: authBootstrap.fromCallback, showSuccess: authBootstrap.fromCallback });
  } else if (authBootstrap.error) {
    setAuthState('offline', `로그인에 실패했습니다. ${authBootstrap.error}`);
  } else {
    setAuthState('guest');
  }
  if (retroDesktopRoot) {
    const { createRetroDesktop } = await import('./retro-desktop.js');
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
  if (startedOnStandaloneLoginPage && authenticatedSessionReady() && readJsonStorageValue(authPendingActionStorageKey, null)?.type) {
    window.location.replace(publicAuthTargetUrl());
    return;
  }
  resetCafeForm();
  resetTagForm();
  renderApp();
  await consumePendingAuthAction();
  await verifyAdminSession();
  await loadAdminContentPages();
}

startBrewMap().catch((error) => {
  console.error(`BrewMap failed to start. ${error.message}`);
});
