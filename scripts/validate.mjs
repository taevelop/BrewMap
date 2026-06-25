import { access, readFile } from 'node:fs/promises';

const requiredFiles = [
  'app/layout.jsx',
  'app/page.jsx',
  'app/admin/page.jsx',
  'app/retro/page.jsx',
  'app/components/BrewMapRuntime.jsx',
  'app/api/admin/session/route.js',
  'proxy.js',
  'next.config.mjs',
  'package.json',
  'scripts/sync-public.mjs',
  'scripts/build.mjs',
  'scripts/serve.mjs',
  'scripts/clean.mjs',
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
  'src/retro-desktop.css',
  'src/retro-desktop.js',
  'src/styles.css',
  'docs/mvp-plan.md',
  'docs/scope.md',
  'docs/taxonomy.md',
  'docs/csv-format.md',
  'docs/retro-ux-checklist.md',
  'docs/retro-ui-ux-checklist.md',
  'db/schema.sql',
  'data/seed-cafes.csv',
  'scripts/check-seed-data.mjs',
];

for (const file of requiredFiles) await access(file);

const packageJson = await readFile('package.json', 'utf8');
const layout = await readFile('app/layout.jsx', 'utf8');
const publicPage = await readFile('app/page.jsx', 'utf8');
const adminPage = await readFile('app/admin/page.jsx', 'utf8');
const retroPage = await readFile('app/retro/page.jsx', 'utf8');
const runtime = await readFile('app/components/BrewMapRuntime.jsx', 'utf8');
const adminSessionRoute = await readFile('app/api/admin/session/route.js', 'utf8');
const proxy = await readFile('proxy.js', 'utf8');
const nextConfig = await readFile('next.config.mjs', 'utf8');
const syncPublic = await readFile('scripts/sync-public.mjs', 'utf8');
const buildScript = await readFile('scripts/build.mjs', 'utf8');
const serveScript = await readFile('scripts/serve.mjs', 'utf8');
const cleanScript = await readFile('scripts/clean.mjs', 'utf8');
const js = await readFile('src/main.js', 'utf8');
const mapServices = await readFile('src/map-services.js', 'utf8');
const retroDesktopCss = await readFile('src/retro-desktop.css', 'utf8');
const retroDesktopJs = await readFile('src/retro-desktop.js', 'utf8');
const css = await readFile('src/styles.css', 'utf8');
const manifest = await readFile('manifest.webmanifest', 'utf8');
const serviceWorker = await readFile('service-worker.js', 'utf8');
const ci = await readFile('.github/workflows/ci.yml', 'utf8');
const scope = await readFile('docs/scope.md', 'utf8');
const csvFormat = await readFile('docs/csv-format.md', 'utf8');
const schema = await readFile('db/schema.sql', 'utf8');
const seedCheck = await readFile('scripts/check-seed-data.mjs', 'utf8');
const seedBytes = await readFile('data/seed-cafes.csv');
const seed = seedBytes.toString('utf8');

const checks = [
  ['Package uses Next.js dev/build/start scripts', packageJson.includes('"dev": "next dev"') && packageJson.includes('"build": "next build"') && packageJson.includes('"start": "next start"')],
  ['Package syncs public assets before dev/build/start', ['"predev"', '"prebuild"', '"prestart"'].every((script) => packageJson.includes(script)) && packageJson.includes('scripts/sync-public.mjs')],
  ['Package declares Next and React dependencies', ['"next"', '"react"', '"react-dom"'].every((dependency) => packageJson.includes(dependency))],
  ['Root layout imports existing BrewMap CSS', layout.includes("import '../src/styles.css'") && layout.includes("import '../src/retro-desktop.css'")],
  ['Root layout defines Korean metadata and PWA assets', layout.includes('<html lang="ko">') && layout.includes('manifest:') && layout.includes('/manifest.webmanifest') && layout.includes('/favicon.ico') && layout.includes('/apple-touch-icon.png') && layout.includes("themeColor: '#2D1B12'")],
  ['Public page preserves search/map/saved/report DOM contract', ['data-search-form', 'data-filter-row', 'data-cafe-grid', 'data-map-surface', 'data-saved-list', 'data-report-form', 'data-detail-dialog'].every((selector) => publicPage.includes(selector))],
  ['Next pages preserve Korean interface copy', layout.includes('\uBE0C\uB8E8\uB9F5') && publicPage.includes('\uB9C8\uC2DC\uACE0 \uC2F6\uC740') && adminPage.includes('\uC6B4\uC601 \uB3C4\uAD6C') && retroPage.includes('\uAC80\uC0C9 \uC911\uC2EC')],
  ['Public page points brand assets at Next public root', publicPage.includes('/assets/brewmap-brand-icon.svg') && !publicPage.includes('./assets/brewmap-brand-icon.svg')],
  ['Public page omits Admin workspace controls', !publicPage.includes('data-admin-cafe-form') && !publicPage.includes('data-csv-input')],
  ['Admin page preserves operations DOM contract', ['data-admin-auth-status', 'data-admin-cafe-form', 'data-admin-cafe-list', 'data-admin-tag-form', 'data-csv-input', 'data-admin-log-list'].every((selector) => adminPage.includes(selector))],
  ['Admin page links back to the public Next route', adminPage.includes('/#home') && !adminPage.includes('index.html#home')],
  ['Retro page preserves standalone retro route contract', retroPage.includes('data-retro-desktop') && retroPage.includes('retro-main-shell') && retroPage.includes('/#home')],
  ['Runtime starts the legacy DOM engine only on the client', runtime.includes("'use client'") && runtime.includes('useEffect') && runtime.includes("import('../../src/main.js')")],
  ['Proxy protects Admin routes with Basic Auth env vars', proxy.includes('BREWMAP_ADMIN_PASSWORD') && proxy.includes('BREWMAP_ADMIN_USER') && proxy.includes('www-authenticate') && proxy.includes('export function proxy') && proxy.includes("'/admin'") && proxy.includes("'/api/admin/:path*'")],
  ['Admin session route exposes guarded admin session JSON', adminSessionRoute.includes("role: 'admin'") && adminSessionRoute.includes('cache-control') && adminSessionRoute.includes('force-dynamic')],
  ['Next config keeps old HTML URLs redirected', nextConfig.includes('/index.html') && nextConfig.includes('/admin.html') && nextConfig.includes('/retro.html')],
  ['Public sync copies Vercel-served static assets', ['manifest.webmanifest', 'service-worker.js', 'data/seed-cafes.csv', 'assets/brewmap-brand-icon.svg', 'assets/brewmap-cafe-marker.svg', 'assets/brewmap-cafe-marker-selected.svg'].every((file) => syncPublic.includes(file))],
  ['Build and serve wrappers invoke Next.js after public sync', buildScript.includes("import('./sync-public.mjs')") && buildScript.includes("['build']") && serveScript.includes("import('./sync-public.mjs')") && serveScript.includes("'dev'")],
  ['Clean script removes only generated Next outputs', ['.next', 'out', 'dist', 'public'].every((directory) => cleanScript.includes(`'${directory}'`)) && cleanScript.includes('assertGeneratedPath')],
  ['Main runtime fetches data and service worker from root paths', js.includes("fetch('/data/seed-cafes.csv'") && js.includes("register('/service-worker.js'")],
  ['Main runtime avoids top-level await for Next client bundling', js.includes('async function startBrewMap()') && js.includes('startBrewMap().catch') && js.includes("import('./retro-desktop.js')") && !js.includes("await import('./retro-desktop.js?v=" )],
  ['JavaScript defines launch coffee capabilities', js.includes('filter_coffee') && js.includes('bean_sales')],
  ['JavaScript syncs filters to URL state', js.includes('syncSearchStateFromUrl') && js.includes('writeSearchStateToUrl') && js.includes('URLSearchParams')],
  ['JavaScript renders cafe primary tags with known label helper', js.includes('map(tagLabel)') && !js.includes('capabilityLabel')],
  ['JavaScript wires public saved/report/detail flows', js.includes('data-saved-list') && js.includes('toggleSaved') && js.includes('data-report-form') && js.includes('submitReport') && js.includes('data-detail-dialog') && js.includes('openDetail')],
  ['JavaScript wires Admin operations and session check', js.includes('verifyAdminSession') && js.includes('/api/admin/session') && js.includes('saveCafeFromAdmin') && js.includes('saveTagFromAdmin') && js.includes('validateCsvImportText')],
  ['JavaScript renders map through provider adapter', js.includes('getMapProvider') && js.includes('activeMapProvider') && js.includes('renderMapBaseLayer')],
  ['Map services define provider registry and OSM adapter', mapServices.includes('mapProviders') && mapServices.includes('openStreetMap') && mapServices.includes('renderBaseLayer') && mapServices.includes('tile.openstreetmap.org')],
  ['Manifest uses root-relative Vercel/PWA paths', manifest.includes('"start_url": "/"') && manifest.includes('"scope": "/"') && manifest.includes('"src": "/apple-touch-icon.png"') && manifest.includes('"src": "/android-chrome-512x512.png"')],
  ['Service worker caches public app shell only', serviceWorker.includes("'/'") && serviceWorker.includes("'/retro'") && serviceWorker.includes("'/manifest.webmanifest'") && serviceWorker.includes("'/data/seed-cafes.csv'") && !serviceWorker.includes("'./index.html'") && !serviceWorker.includes("'./admin.html'")],
  ['Service worker excludes Admin and API requests', serviceWorker.includes("requestUrl.pathname === '/admin'") && serviceWorker.includes("requestUrl.pathname.startsWith('/api/admin/')")],
  ['Service worker falls back navigations to Next root route', serviceWorker.includes("networkFirst(request, '/')")],
  ['CSS applies v4 brand palette tokens', css.includes('--brewmap-espresso: #2d1b12') && css.includes('--brewmap-cream: #f8ebd2') && css.includes('--brewmap-orange: #d96b2b')],
  ['CSS styles map and Admin surfaces', css.includes('.map-base-layer') && css.includes('.map-marker-layer') && css.includes('.admin-workspace') && css.includes('.admin-grid')],
  ['CSS keeps responsive and accessible layout basics', css.includes('@media (max-width: 900px)') && css.includes('word-break: keep-all') && css.includes('button:focus-visible') && css.includes('.map-surface:focus-visible')],
  ['Retro desktop supports standalone route and compact mobile menu', retroDesktopJs.includes('is-retro-main') && retroDesktopJs.includes("id: 'nearby-map'") && retroDesktopJs.includes('NEARBY_MAP.EXE') && retroDesktopCss.includes('body.is-retro-main')],
  ['CI installs dependencies before validation', ci.includes('npm ci') && ci.includes('npm run lint') && ci.includes('npm run data:check') && ci.includes('npm run build')],
  ['Scope includes required Admin work', scope.includes('CSV Import')],
  ['Schema includes core tables', ['cafes', 'coffee_capabilities', 'cafe_capabilities', 'reports', 'admin_logs'].every((table) => schema.includes(`create table ${table}`))],
  ['Seed CSV is UTF-8 BOM for Excel', seedBytes[0] === 0xef && seedBytes[1] === 0xbb && seedBytes[2] === 0xbf],
  ['Seed CSV includes Busan launch area rows', seed.includes('city,area') && ['busan', 'jeonpo', 'gwangan', 'haeundae'].every((area) => seed.includes(area))],
  ['Seed data QA covers launch readiness targets', seedCheck.includes('150') && seedCheck.includes('averageCoffeeCapabilities') && seedCheck.includes('mvpCapabilities')],
  ['CSV docs explain seed data QA', csvFormat.includes('npm run data:check')],
];

const failed = checks.filter(([, ok]) => !ok);
checks.forEach(([name, ok]) => console.log(`${ok ? '✓' : '✗'} ${name}`));

if (failed.length) process.exit(1);
