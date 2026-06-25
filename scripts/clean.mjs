import { rm } from 'node:fs/promises';
import { basename, dirname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const generatedDirectories = ['.next', 'out', 'dist', 'public'];

function assertGeneratedPath(targetPath, expectedName) {
  const relativeTargetPath = relative(repoRoot, targetPath);

  if (basename(targetPath) !== expectedName || relativeTargetPath.startsWith('..') || isAbsolute(relativeTargetPath)) {
    throw new Error(`Refusing to clean unexpected path: ${targetPath}`);
  }
}

for (const directory of generatedDirectories) {
  const targetPath = resolve(repoRoot, directory);
  assertGeneratedPath(targetPath, directory);
  await rm(targetPath, { recursive: true, force: true });
}

console.log('Removed generated Next.js outputs.');
