import { access, readFile } from 'node:fs/promises';

const requiredFiles = [
  'index.html',
  'favicon.svg',
  'manifest.webmanifest',
  'service-worker.js',
  'src/main.js',
  'src/map-services.js',
  'src/styles.css',
  'docs/mvp-plan.md',
  'docs/scope.md',
  'docs/taxonomy.md',
  'docs/csv-format.md',
  'db/schema.sql',
  'data/seed-cafes.csv',
  'scripts/check-seed-data.mjs',
  'scripts/build.mjs',
];
for (const file of requiredFiles) await access(file);

const packageJson = await readFile('package.json', 'utf8');
const buildScript = await readFile('scripts/build.mjs', 'utf8');
const serveScript = await readFile('scripts/serve.mjs', 'utf8');
const html = await readFile('index.html', 'utf8');
const js = await readFile('src/main.js', 'utf8');
const mapServices = await readFile('src/map-services.js', 'utf8');
const css = await readFile('src/styles.css', 'utf8');
const manifest = await readFile('manifest.webmanifest', 'utf8');
const serviceWorker = await readFile('service-worker.js', 'utf8');
const scope = await readFile('docs/scope.md', 'utf8');
const csvFormat = await readFile('docs/csv-format.md', 'utf8');
const schema = await readFile('db/schema.sql', 'utf8');
const seedCheck = await readFile('scripts/check-seed-data.mjs', 'utf8');
const seedBytes = await readFile('data/seed-cafes.csv');
const seed = seedBytes.toString('utf8');

const checks = [
  ['HTML has Korean language metadata', html.includes('lang="ko"')],
  ['HTML links BrewMap favicon', html.includes('rel="icon"') && html.includes('favicon.svg')],
  ['HTML links web app manifest', html.includes('rel="manifest"') && html.includes('manifest.webmanifest')],
  ['HTML defines PWA theme color', html.includes('name="theme-color"') && html.includes('#173f35')],
  ['HTML states the MVP mission', html.includes('마시고 싶은 커피를 찾을지도')],
  ['HTML links brand to home section', html.includes('id="home"') && html.includes('href="#home"') && html.includes('브루맵')],
  ['Manifest defines standalone BrewMap app', manifest.includes('"display": "standalone"') && manifest.includes('"start_url": "./"') && manifest.includes('"theme_color": "#173f35"')],
  ['JavaScript defines MVP coffee capabilities', js.includes('filter_coffee') && js.includes('bean_sales')],
  ['JavaScript registers service worker', js.includes('registerServiceWorker') && js.includes('serviceWorker') && js.includes('./service-worker.js')],
  ['JavaScript wires cafe search', js.includes('data-search-form') && js.includes('matchesSearch')],
  ['JavaScript wires saved cafes', js.includes('data-saved-list') && js.includes('toggleSaved')],
  ['JavaScript wires report queue', js.includes('data-report-form') && js.includes('submitReport')],
  ['JavaScript wires cafe detail modal', js.includes('data-detail-dialog') && js.includes('openDetail')],
  ['HTML defines Admin MVP workspace', html.includes('data-admin-cafe-form') && html.includes('data-admin-tag-form') && html.includes('data-csv-input')],
  ['JavaScript wires Admin cafe CRUD', js.includes('saveCafeFromAdmin') && js.includes('deleteSelectedCafe') && js.includes('renderAdminCafeList')],
  ['JavaScript wires Admin report review', js.includes('approveReport') && js.includes('rejectReport')],
  ['JavaScript wires Admin tag management', js.includes('saveTagFromAdmin') && js.includes('renderTagList')],
  ['JavaScript wires CSV validation and import', js.includes('validateCsvImportText') && js.includes('importCsvRows')],
  ['JavaScript loads Seed CSV as cafe data source', js.includes('loadSeedCafes') && js.includes('./data/seed-cafes.csv')],
  ['JavaScript labels internal status values for display', js.includes('verificationSourceLabel') && js.includes('adminActionLabel') && js.includes('관리자 확인')],
  ['HTML labels Admin source choices for display', html.includes('관리자 확인') && html.includes('사용자 제보') && !html.includes('>admin_verified<')],
  ['JavaScript exposes all required map link outs', js.includes('mapLinksMarkup') && ['naver', 'kakao', 'google'].every((provider) => js.includes(provider))],
  ['HTML defines real map layers', html.includes('data-map-base-layer') && html.includes('data-map-marker-layer') && html.includes('data-location-action')],
  ['HTML defines map viewport controls', html.includes('data-map-zoom-in') && html.includes('data-map-zoom-out') && html.includes('tabindex="0"')],
  ['JavaScript renders map through provider adapter', js.includes('getMapProvider') && js.includes('activeMapProvider') && js.includes('renderMapBaseLayer')],
  ['JavaScript keeps OpenStreetMap details outside app flow', !js.includes('tile.openstreetmap.org') && !js.includes('OpenStreetMap')],
  ['Map services define provider registry and OSM adapter', mapServices.includes('mapProviders') && mapServices.includes('openStreetMap') && mapServices.includes('renderBaseLayer') && mapServices.includes('tile.openstreetmap.org')],
  ['Map services allow cafe-level OpenStreetMap zoom', mapServices.includes('zoomRange: { min: 9, max: 19 }')],
  ['JavaScript wires geolocation map recentering', js.includes('requestUserLocation') && js.includes('navigator.geolocation')],
  ['JavaScript clusters dense map markers', js.includes('clusterMapItems') && js.includes('map-cluster')],
  ['JavaScript keeps labels only on clustered map markers', js.includes('clusterButton.textContent = cluster.items.length') && js.includes("pin.textContent = ''") && !js.includes('pin.innerHTML = `<span>${escapeHtml(cafe.confidence)}</span>`')],
  ['JavaScript wires map pan and zoom controls', js.includes('bindMapInteractions') && js.includes('pointerdown') && js.includes('wheel') && js.includes('panMapByPixels') && js.includes('zoomMapBy')],
  ['JavaScript isolates map provider attribution', js.includes('data-map-attribution') && js.includes('renderMapAttribution')],
  ['CSS styles map tile and marker layers', css.includes('.map-base-layer') && css.includes('.map-tile') && css.includes('.map-marker-layer') && css.includes('.map-attribution') && css.includes('.map-cluster')],
  ['CSS styles map interaction controls', css.includes('.map-controls') && css.includes('cursor: grab') && css.includes('touch-action: none')],
  ['JavaScript avoids review/rating data model', !js.includes('rating')],
  ['CSS defines responsive layout', css.includes('@media (max-width: 900px)')],
  ['CSS keeps Korean words together', css.includes('word-break: keep-all') && css.includes('overflow-wrap: break-word')],
  ['CSS styles Admin MVP workspace', css.includes('.admin-workspace') && css.includes('.admin-grid')],
  ['Service worker caches static app shell', serviceWorker.includes('APP_SHELL') && serviceWorker.includes('manifest.webmanifest') && serviceWorker.includes('src/map-services.js') && serviceWorker.includes('data/seed-cafes.csv')],
  ['Dev server serves web app manifest MIME type', serveScript.includes('.webmanifest') && serveScript.includes('application/manifest+json')],
  ['Scope includes required Admin work', scope.includes('관리자 페이지') && scope.includes('CSV Import')],
  ['Schema includes core tables', ['cafes', 'coffee_capabilities', 'cafe_capabilities', 'reports', 'admin_logs'].every((table) => schema.includes(`create table ${table}`))],
  ['Seed CSV is UTF-8 BOM for Excel', seedBytes[0] === 0xef && seedBytes[1] === 0xbb && seedBytes[2] === 0xbf],
  ['Seed CSV includes Busan MVP area rows', seed.includes('city,area') && ['busan', 'jeonpo', 'gwangan', 'haeundae'].every((area) => seed.includes(area))],
  ['Package exposes seed data QA command', packageJson.includes('"data:check"') && packageJson.includes('scripts/check-seed-data.mjs')],
  ['Build includes favicon file', buildScript.includes('favicon.svg') && buildScript.includes('dist/favicon.svg')],
  ['Build includes PWA assets', buildScript.includes('manifest.webmanifest') && buildScript.includes('service-worker.js')],
  ['Build includes map service module', buildScript.includes('src/map-services.js') && buildScript.includes('dist/src/map-services.js')],
  ['Build includes seed CSV data file', buildScript.includes('dist/data') && buildScript.includes('data/seed-cafes.csv')],
  ['Seed data QA covers MVP readiness targets', seedCheck.includes('150') && seedCheck.includes('averageCoffeeCapabilities') && seedCheck.includes('mvpCapabilities')],
  ['CSV docs explain seed data QA', csvFormat.includes('npm run data:check') && csvFormat.includes('Seed 데이터 QA')],
];

const failed = checks.filter(([, ok]) => !ok);
checks.forEach(([name, ok]) => console.log(`${ok ? '✓' : '✗'} ${name}`));

if (failed.length) process.exit(1);
