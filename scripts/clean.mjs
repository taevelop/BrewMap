import { rm } from 'node:fs/promises';
import { basename, dirname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distPath = resolve(repoRoot, 'dist');

const relativeDistPath = relative(repoRoot, distPath);

if (basename(distPath) !== 'dist' || relativeDistPath.startsWith('..') || isAbsolute(relativeDistPath)) {
  throw new Error(`Refusing to clean unexpected path: ${distPath}`);
}

await rm(distPath, { recursive: true, force: true });
console.log('Removed generated dist/ output.');
