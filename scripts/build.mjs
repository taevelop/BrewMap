import { spawn } from 'node:child_process';

await import('./sync-public.mjs');

const nextExecutable = process.platform === 'win32' ? 'next.cmd' : 'next';
const build = spawn(nextExecutable, ['build'], {
  stdio: 'inherit',
  shell: false,
});

const exitCode = await new Promise((resolve) => {
  build.on('close', resolve);
});

if (exitCode !== 0) {
  process.exit(exitCode ?? 1);
}
