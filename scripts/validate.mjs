import { access, readFile } from 'node:fs/promises';

const requiredFiles = [
  'index.html',
  'src/main.js',
  'src/styles.css',
  'docs/mvp-plan.md',
  'docs/scope.md',
  'docs/taxonomy.md',
  'db/schema.sql',
  'data/seed-cafes.csv',
];
for (const file of requiredFiles) await access(file);

const html = await readFile('index.html', 'utf8');
const js = await readFile('src/main.js', 'utf8');
const css = await readFile('src/styles.css', 'utf8');
const scope = await readFile('docs/scope.md', 'utf8');
const schema = await readFile('db/schema.sql', 'utf8');
const seed = await readFile('data/seed-cafes.csv', 'utf8');

const checks = [
  ['HTML has Korean language metadata', html.includes('lang="ko"')],
  ['HTML states the MVP mission', html.includes('마시고 싶은 커피가 있는 카페를 찾는 지도')],
  ['JavaScript defines MVP coffee capabilities', js.includes('filter_coffee') && js.includes('bean_sales')],
  ['JavaScript avoids review/rating data model', !js.includes('rating')],
  ['CSS defines responsive layout', css.includes('@media (max-width: 900px)')],
  ['Scope includes required Admin work', scope.includes('관리자 페이지') && scope.includes('CSV Import')],
  ['Schema includes core tables', ['cafes', 'coffee_capabilities', 'cafe_capabilities', 'reports', 'admin_logs'].every((table) => schema.includes(`create table ${table}`))],
  ['Seed CSV includes Seongsu and Yeonnam rows', seed.includes('seongsu') && seed.includes('yeonnam')],
];

const failed = checks.filter(([, ok]) => !ok);
checks.forEach(([name, ok]) => console.log(`${ok ? '✓' : '✗'} ${name}`));

if (failed.length) process.exit(1);
