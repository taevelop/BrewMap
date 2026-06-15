const capabilities = [
  { key: 'filter_coffee', label: '필터커피' },
  { key: 'decaf', label: '디카페인' },
  { key: 'cold_brew', label: '콜드브루' },
  { key: 'flat_white', label: '플랫화이트' },
  { key: 'single_origin', label: '싱글오리진' },
  { key: 'bean_sales', label: '원두구매' },
];

const cafes = [
  {
    id: 'seongsu-archive',
    name: 'Archive Beans',
    area: '성수',
    address: '서울 성동구 성수이로 12',
    capabilities: ['filter_coffee', 'single_origin', 'bean_sales'],
    confidence: 'A',
    verifiedAt: '2026-06-01',
    source: 'admin_verified',
    position: { top: '25%', left: '63%' },
    links: { naver: '#', kakao: '#', google: '#' },
  },
  {
    id: 'yeonnam-drip',
    name: 'Drip Station',
    area: '연남',
    address: '서울 마포구 동교로 41',
    capabilities: ['filter_coffee', 'hand_drip', 'decaf'],
    confidence: 'B',
    verifiedAt: '2026-05-24',
    source: 'user_report',
    position: { top: '43%', left: '38%' },
    links: { naver: '#', kakao: '#', google: '#' },
  },
  {
    id: 'seongsu-cold',
    name: 'Cold Lab Roastery',
    area: '성수',
    address: '서울 성동구 연무장길 7',
    capabilities: ['cold_brew', 'flat_white', 'roastery'],
    confidence: 'B',
    verifiedAt: '2026-05-18',
    source: 'menu_photo',
    position: { top: '58%', left: '70%' },
    links: { naver: '#', kakao: '#', google: '#' },
  },
];

const adminQueue = [
  { type: '수정', cafe: 'Drip Station', request: '디카페인 가능 여부 확인 요청', status: '검수 대기' },
  { type: '추가', cafe: 'New Brew Bar', request: '성수 신규 카페 등록 제보', status: '근거 필요' },
  { type: '폐업', cafe: 'Old Beans', request: '폐업 신고', status: '확인 필요' },
];

const byKey = Object.fromEntries(capabilities.map((capability) => [capability.key, capability.label]));
const filterRow = document.querySelector('[data-filter-row]');
const mapSurface = document.querySelector('[data-map-surface]');
const cafeGrid = document.querySelector('[data-cafe-grid]');
const adminQueueEl = document.querySelector('[data-admin-queue]');
const resultCount = document.querySelector('[data-result-count]');
const selectedFilters = new Set();

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
  if (!selectedFilters.size) return cafes;
  return cafes.filter((cafe) => [...selectedFilters].every((filter) => cafe.capabilities.includes(filter)));
}

function renderCafe(cafe) {
  const card = document.createElement('article');
  card.className = 'cafe-card';
  card.innerHTML = `
    <div class="cafe-card-topline"><span>${cafe.area}</span><strong>신뢰도 ${cafe.confidence}</strong></div>
    <h3>${cafe.name}</h3>
    <p>${cafe.address}</p>
    <dl class="metadata"><div><dt>검증</dt><dd>${cafe.source}</dd></div><div><dt>최근 확인</dt><dd>${cafe.verifiedAt}</dd></div></dl>
    <div>${cafe.capabilities.map((tag) => `<span class="tag">${byKey[tag] || tag}</span>`).join('')}</div>
    <div class="card-actions"><button type="button">저장</button><button type="button">정보 제보</button><a href="${cafe.links.naver}">외부 지도</a></div>
  `;
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
    mapSurface.append(pin);
  });
}

function renderAdminQueue() {
  adminQueueEl.replaceChildren(...adminQueue.map((report) => {
    const item = document.createElement('li');
    item.innerHTML = `<strong>[${report.type}] ${report.cafe}</strong><span>${report.request}</span><em>${report.status}</em>`;
    return item;
  }));
}

function render() {
  renderFilters();
  const items = filteredCafes();
  resultCount.textContent = `${items.length}개 카페`;
  cafeGrid.replaceChildren(...items.map(renderCafe));
  renderMapPins(items);
  renderAdminQueue();
}

render();
