import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const publicRoot = join(repoRoot, 'public');

const fileCopies = [
  ['favicon.ico', 'favicon.ico'],
  ['favicon.svg', 'favicon.svg'],
  ['favicon-16x16.png', 'favicon-16x16.png'],
  ['favicon-32x32.png', 'favicon-32x32.png'],
  ['apple-touch-icon.png', 'apple-touch-icon.png'],
  ['android-chrome-192x192.png', 'android-chrome-192x192.png'],
  ['android-chrome-512x512.png', 'android-chrome-512x512.png'],
  ['manifest.webmanifest', 'manifest.webmanifest'],
  ['service-worker.js', 'service-worker.js'],
  ['data/seed-cafes.csv', 'data/seed-cafes.csv'],
  ['assets/brewmap-brand-icon.svg', 'assets/brewmap-brand-icon.svg'],
  ['assets/brewmap-cafe-marker.svg', 'assets/brewmap-cafe-marker.svg'],
  ['assets/brewmap-cafe-marker-selected.svg', 'assets/brewmap-cafe-marker-selected.svg'],
];

async function copyFileToPublic([source, target]) {
  const targetPath = join(publicRoot, target);
  await mkdir(dirname(targetPath), { recursive: true });
  await cp(join(repoRoot, source), targetPath);
}

await rm(publicRoot, { recursive: true, force: true });
await mkdir(publicRoot, { recursive: true });
await Promise.all(fileCopies.map(copyFileToPublic));

console.log('Synced BrewMap public assets for Next.js.');
