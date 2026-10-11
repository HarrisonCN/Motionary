// 13.5.0: framework regression matrix (test/frameworks, docs/frameworks-matrix.md) — Chromium only; the cross-engine
// suite is test/browser. Serves the repository root with test/browser/serve.mjs.
//   for fw in react18 react19 vue3 svelte5 solid angular; do (cd test/frameworks/$fw && npm install) && node test/frameworks/build.mjs $fw; done
//   npx playwright test -c test/frameworks/playwright.config.mjs        (FW=vue3 for one framework)
import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));

const PORT = Number(process.env.FW_TEST_PORT || 4183);
const chromium = { ...devices['Desktop Chrome'] };
if (process.env.CHROME_PATH) chromium.launchOptions = { executablePath: process.env.CHROME_PATH };

export default defineConfig({
  testDir: '.',
  testMatch: /matrix\.spec\.mjs$/,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['github']] : [['list']],
  use: { baseURL: `http://127.0.0.1:${PORT}` },
  webServer: process.env.FW_NO_SERVER ? undefined : { command: `node test/browser/serve.mjs ${PORT}`, cwd: ROOT, url: `http://127.0.0.1:${PORT}/__fixture.html`, reuseExistingServer: !process.env.CI, timeout: 30_000 },
  projects: [{ name: 'chromium', use: chromium }],
});
