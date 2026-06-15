const cafes = [
  { name: 'Archive Beans', neighborhood: '성수동', tags: ['필터커피', '로스터리', '노트북'], rating: 4.8, roast: 'Light Roast', distance: '도보 6분', position: { top: '24%', left: '63%' } },
  { name: 'Mellow Cup', neighborhood: '망원동', tags: ['디저트', '반려동물', '브런치'], rating: 4.6, roast: 'Medium Roast', distance: '도보 11분', position: { top: '56%', left: '28%' } },
  { name: 'Drip Station', neighborhood: '연남동', tags: ['핸드드립', '조용함', '원두판매'], rating: 4.9, roast: 'Single Origin', distance: '도보 14분', position: { top: '37%', left: '42%' } },
];

const filters = ['스페셜티', '핸드드립', '작업하기 좋은', '디저트 맛집', '늦게까지'];

const filterRow = document.querySelector('[data-filter-row]');
const mapSurface = document.querySelector('[data-map-surface]');
const cafeGrid = document.querySelector('[data-cafe-grid]');

filters.forEach((filter) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = `☰ ${filter}`;
  filterRow?.append(button);
});

cafes.forEach((cafe) => {
  const pin = document.createElement('button');
  pin.className = 'map-pin';
  pin.type = 'button';
  pin.style.top = cafe.position.top;
  pin.style.left = cafe.position.left;
  pin.setAttribute('aria-label', `${cafe.name} 지도 핀`);
  pin.textContent = '⌖';
  mapSurface?.append(pin);

  const card = document.createElement('article');
  card.className = 'cafe-card';
  card.innerHTML = `
    <div class="cafe-card-topline"><span>${cafe.neighborhood}</span><strong>★ ${cafe.rating}</strong></div>
    <h3>${cafe.name}</h3>
    <p>${cafe.roast} · ${cafe.distance}</p>
    <div>${cafe.tags.map((tag) => `<span class="tag">${tag}</span>`).join('')}</div>
  `;
  cafeGrid?.append(card);
});
