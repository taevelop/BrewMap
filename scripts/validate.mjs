import { access, readFile } from 'node:fs/promises';

const requiredFiles = [
  'index.html',
  'favicon.ico',
  'favicon.svg',
  'favicon-16x16.png',
  'favicon-32x32.png',
  'apple-touch-icon.png',
  'android-chrome-192x192.png',
  'android-chrome-512x512.png',
  'assets/brewmap-brand-icon.svg',
  'assets/brewmap-cafe-marker.svg',
  'assets/brewmap-cafe-marker-selected.svg',
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
  ['HTML links BrewMap favicon ICO, SVG, and PNGs', html.includes('rel="icon"') && html.includes('favicon.ico') && html.includes('favicon.svg') && html.includes('favicon-32x32.png') && html.includes('favicon-16x16.png')],
  ['HTML links Apple touch icon PNG', html.includes('rel="apple-touch-icon"') && html.includes('apple-touch-icon.png') && html.includes('sizes="180x180"')],
  ['HTML uses v4 brand icon for brand mark', html.includes('class="brand-mark"') && html.includes('src="./assets/brewmap-brand-icon.svg"')],
  ['HTML links web app manifest', html.includes('rel="manifest"') && html.includes('manifest.webmanifest')],
  ['HTML defines v4 PWA theme color', html.includes('name="theme-color"') && html.includes('#2D1B12')],
  ['HTML states the MVP mission', html.includes('마시고 싶은 커피를 찾을지도')],
  ['HTML links brand to home section', html.includes('id="home"') && html.includes('href="#home"') && html.includes('브루맵')],
  ['Manifest defines standalone BrewMap app with v4 theme', manifest.includes('"display": "standalone"') && manifest.includes('"start_url": "./"') && manifest.includes('"theme_color": "#2D1B12"') && manifest.includes('"background_color": "#2D1B12"')],
  ['Manifest includes Apple touch icon PNG', manifest.includes('"src": "./apple-touch-icon.png"') && manifest.includes('"sizes": "180x180"') && manifest.includes('"type": "image/png"')],
  ['Manifest includes Android home screen PNG icons', manifest.includes('"src": "./android-chrome-192x192.png"') && manifest.includes('"sizes": "192x192"') && manifest.includes('"src": "./android-chrome-512x512.png"') && manifest.includes('"sizes": "512x512"')],
  ['JavaScript defines MVP coffee capabilities', js.includes('filter_coffee') && js.includes('bean_sales')],
  ['JavaScript registers service worker', js.includes('registerServiceWorker') && js.includes('serviceWorker') && js.includes('./service-worker.js')],
  ['JavaScript wires cafe search', js.includes('data-search-form') && js.includes('matchesSearch')],
  ['JavaScript renders cafe primary tags with known label helper', js.includes('map(tagLabel)') && !js.includes('capabilityLabel')],
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
  ['CSS applies v4 brand palette tokens', css.includes('--brewmap-espresso: #2d1b12') && css.includes('--brewmap-cream: #f8ebd2') && css.includes('--brewmap-orange: #d96b2b')],
  ['CSS uses v4 SVG cafe marker assets', css.includes('../assets/brewmap-cafe-marker.svg') && css.includes('../assets/brewmap-cafe-marker-selected.svg')],
  ['CSS styles map interaction controls', css.includes('.map-controls') && css.includes('cursor: grab') && css.includes('touch-action: none')],
  ['JavaScript avoids review/rating data model', !js.includes('rating')],
  ['CSS defines responsive layout', css.includes('@media (max-width: 900px)')],
  ['CSS keeps Korean words together', css.includes('word-break: keep-all') && css.includes('overflow-wrap: break-word')],
  ['CSS styles Admin MVP workspace', css.includes('.admin-workspace') && css.includes('.admin-grid')],
  ['Service worker caches static app shell', serviceWorker.includes('APP_SHELL') && serviceWorker.includes('manifest.webmanifest') && serviceWorker.includes('favicon.ico') && serviceWorker.includes('favicon.svg') && serviceWorker.includes('favicon-32x32.png') && serviceWorker.includes('apple-touch-icon.png') && serviceWorker.includes('android-chrome-192x192.png') && serviceWorker.includes('android-chrome-512x512.png') && serviceWorker.includes('assets/brewmap-brand-icon.svg') && serviceWorker.includes('assets/brewmap-cafe-marker.svg') && serviceWorker.includes('src/map-services.js') && serviceWorker.includes('data/seed-cafes.csv')],
  ['Dev server serves web app manifest MIME type', serveScript.includes('.webmanifest') && serveScript.includes('application/manifest+json')],
  ['Scope includes required Admin work', scope.includes('관리자 페이지') && scope.includes('CSV Import')],
  ['Schema includes core tables', ['cafes', 'coffee_capabilities', 'cafe_capabilities', 'reports', 'admin_logs'].every((table) => schema.includes(`create table ${table}`))],
  ['Seed CSV is UTF-8 BOM for Excel', seedBytes[0] === 0xef && seedBytes[1] === 0xbb && seedBytes[2] === 0xbf],
  ['Seed CSV includes Busan MVP area rows', seed.includes('city,area') && ['busan', 'jeonpo', 'gwangan', 'haeundae'].every((area) => seed.includes(area))],
  ['Package exposes seed data QA command', packageJson.includes('"data:check"') && packageJson.includes('scripts/check-seed-data.mjs')],
  ['Build includes favicon files', buildScript.includes('favicon.ico') && buildScript.includes('dist/favicon.ico') && buildScript.includes('favicon.svg') && buildScript.includes('dist/favicon.svg') && buildScript.includes('favicon-16x16.png') && buildScript.includes('favicon-32x32.png')],
  ['Build includes Apple touch icon file', buildScript.includes('apple-touch-icon.png') && buildScript.includes('dist/apple-touch-icon.png')],
  ['Build includes Android home screen icon files', buildScript.includes('android-chrome-192x192.png') && buildScript.includes('dist/android-chrome-192x192.png') && buildScript.includes('android-chrome-512x512.png') && buildScript.includes('dist/android-chrome-512x512.png')],
  ['Build includes v4 brand SVG assets', buildScript.includes('assets/brewmap-brand-icon.svg') && buildScript.includes('dist/assets/brewmap-brand-icon.svg') && buildScript.includes('assets/brewmap-cafe-marker.svg') && buildScript.includes('dist/assets/brewmap-cafe-marker.svg') && buildScript.includes('assets/brewmap-cafe-marker-selected.svg')],
  ['Build includes PWA assets', buildScript.includes('manifest.webmanifest') && buildScript.includes('service-worker.js')],
  ['Build includes map service module', buildScript.includes('src/map-services.js') && buildScript.includes('dist/src/map-services.js')],
  ['Build includes seed CSV data file', buildScript.includes('dist/data') && buildScript.includes('data/seed-cafes.csv')],
  ['Seed data QA covers MVP readiness targets', seedCheck.includes('150') && seedCheck.includes('averageCoffeeCapabilities') && seedCheck.includes('mvpCapabilities')],
  ['CSV docs explain seed data QA', csvFormat.includes('npm run data:check') && csvFormat.includes('Seed 데이터 QA')],
];

const failed = checks.filter(([, ok]) => !ok);
checks.forEach(([name, ok]) => console.log(`${ok ? '✓' : '✗'} ${name}`));

if (failed.length) process.exit(1);
