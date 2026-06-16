import { access, readFile } from 'node:fs/promises';

const requiredFiles = [
  'index.html',
  'favicon.svg',
  'src/main.js',
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
const html = await readFile('index.html', 'utf8');
const js = await readFile('src/main.js', 'utf8');
const css = await readFile('src/styles.css', 'utf8');
const scope = await readFile('docs/scope.md', 'utf8');
const csvFormat = await readFile('docs/csv-format.md', 'utf8');
const schema = await readFile('db/schema.sql', 'utf8');
const seedCheck = await readFile('scripts/check-seed-data.mjs', 'utf8');
const seedBytes = await readFile('data/seed-cafes.csv');
const seed = seedBytes.toString('utf8');

const checks = [
  ['HTML has Korean language metadata', html.includes('lang="ko"')],
  ['HTML links BrewMap favicon', html.includes('rel="icon"') && html.includes('favicon.svg')],
  ['HTML states the MVP mission', html.includes('마시고 싶은 커피가 있는 카페를 찾는 지도')],
  ['JavaScript defines MVP coffee capabilities', js.includes('filter_coffee') && js.includes('bean_sales')],
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
  ['JavaScript avoids review/rating data model', !js.includes('rating')],
  ['CSS defines responsive layout', css.includes('@media (max-width: 900px)')],
  ['CSS styles Admin MVP workspace', css.includes('.admin-workspace') && css.includes('.admin-grid')],
  ['Scope includes required Admin work', scope.includes('관리자 페이지') && scope.includes('CSV Import')],
  ['Schema includes core tables', ['cafes', 'coffee_capabilities', 'cafe_capabilities', 'reports', 'admin_logs'].every((table) => schema.includes(`create table ${table}`))],
  ['Seed CSV is UTF-8 BOM for Excel', seedBytes[0] === 0xef && seedBytes[1] === 0xbb && seedBytes[2] === 0xbf],
  ['Seed CSV includes Busan MVP area rows', seed.includes('city,area') && ['busan', 'jeonpo', 'gwangan', 'haeundae'].every((area) => seed.includes(area))],
  ['Package exposes seed data QA command', packageJson.includes('"data:check"') && packageJson.includes('scripts/check-seed-data.mjs')],
  ['Build includes favicon file', buildScript.includes('favicon.svg') && buildScript.includes('dist/favicon.svg')],
  ['Build includes seed CSV data file', buildScript.includes('dist/data') && buildScript.includes('data/seed-cafes.csv')],
  ['Seed data QA covers MVP readiness targets', seedCheck.includes('150') && seedCheck.includes('averageCoffeeCapabilities') && seedCheck.includes('mvpCapabilities')],
  ['CSV docs explain seed data QA', csvFormat.includes('npm run data:check') && csvFormat.includes('Seed 데이터 QA')],
];

const failed = checks.filter(([, ok]) => !ok);
checks.forEach(([name, ok]) => console.log(`${ok ? '✓' : '✗'} ${name}`));

if (failed.length) process.exit(1);
