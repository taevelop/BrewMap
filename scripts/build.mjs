import { cp, mkdir, rm } from 'node:fs/promises';

await rm('dist', { recursive: true, force: true });
await mkdir('dist/src', { recursive: true });
await mkdir('dist/data', { recursive: true });
await cp('index.html', 'dist/index.html');
await cp('favicon.svg', 'dist/favicon.svg');
await cp('apple-touch-icon.png', 'dist/apple-touch-icon.png');
await cp('manifest.webmanifest', 'dist/manifest.webmanifest');
await cp('service-worker.js', 'dist/service-worker.js');
await cp('src/styles.css', 'dist/src/styles.css');
await cp('src/main.js', 'dist/src/main.js');
await cp('src/map-services.js', 'dist/src/map-services.js');
await cp('data/seed-cafes.csv', 'dist/data/seed-cafes.csv');
console.log('Built static BrewMap prototype to dist/');
