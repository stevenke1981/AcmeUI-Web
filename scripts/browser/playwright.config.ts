import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: '.', testMatch: '*.spec.ts', fullyParallel: true, workers: 2,
  retries: 0, timeout: 60_000, forbidOnly: !!process.env.CI,
  outputDir: '../../output/browser/results', reporter: [['list'], ['json', { outputFile: '../../output/browser/report.json' }]],
  use: { browserName: 'chromium', baseURL: 'http://127.0.0.1:4173', viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce', trace: 'retain-on-failure' },
  webServer: [
    { command: 'pnpm exec vite --config scripts/browser/vite.config.mjs', url: 'http://127.0.0.1:4173/scripts/browser/fixtures/static.html', reuseExistingServer: false, timeout: 60_000 },
    { command: 'pnpm --filter @acmeui/gallery dev --host 127.0.0.1 --port 4174 --strictPort', url: 'http://127.0.0.1:4174', reuseExistingServer: false, timeout: 60_000 },
  ],
});
