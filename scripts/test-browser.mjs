import path from 'node:path';
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
const require = createRequire(import.meta.url);
const child = spawn(process.execPath, [require.resolve('@playwright/test/cli'), 'test', '--config', 'scripts/browser/playwright.config.ts', ...process.argv.slice(2)], {
  stdio: 'inherit', env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: path.resolve('.cache/ms-playwright') },
});
child.on('error', error => { console.error(error); process.exitCode = 1; });
child.on('close', code => { process.exitCode = code ?? 1; });
