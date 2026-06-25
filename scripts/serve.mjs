import { spawn } from 'node:child_process';

await import('./sync-public.mjs');

const nextExecutable = process.platform === 'win32' ? 'next.cmd' : 'next';
const port = process.env.PORT || '3000';
const devServer = spawn(nextExecutable, ['dev', '--hostname', '0.0.0.0', '--port', port], {
  stdio: 'inherit',
  shell: false,
});

const exitCode = await new Promise((resolve) => {
  devServer.on('close', resolve);
});

if (exitCode !== 0) {
  process.exit(exitCode ?? 1);
}
