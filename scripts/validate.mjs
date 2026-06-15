import { access, readFile } from 'node:fs/promises';

const requiredFiles = ['index.html', 'src/main.js', 'src/styles.css'];
for (const file of requiredFiles) await access(file);

const html = await readFile('index.html', 'utf8');
const js = await readFile('src/main.js', 'utf8');
const css = await readFile('src/styles.css', 'utf8');

const checks = [
  ['HTML has Korean language metadata', html.includes('lang="ko"')],
  ['HTML loads the BrewMap script', html.includes('./src/main.js')],
  ['JavaScript defines cafe data', js.includes('const cafes = [')],
  ['CSS defines responsive layout', css.includes('@media (max-width: 900px)')],
];

const failed = checks.filter(([, ok]) => !ok);
checks.forEach(([name, ok]) => console.log(`${ok ? '✓' : '✗'} ${name}`));

if (failed.length) process.exit(1);
