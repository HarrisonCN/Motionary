// 13.1.0: real-browser regression suite (test/browser, docs/browser-matrix.md). Playwright is a devDependency only.
//   npx playwright install --with-deps chromium firefox webkit   (once)
//   npm run build && npm run test:browser
// CHROME_PATH=/path/to/chrome runs the chromium project on another Chromium build (e.g. where Playwright ships none).
import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.BROWSER_TEST_PORT || 4173);
const chromium = { ...devices['Desktop Chrome'] };
const mobileChrome = { ...devices['Pixel 7'] };
if (process.env.CHROME_PATH) chromium.launchOptions = mobileChrome.launchOptions = { executablePath: process.env.CHROME_PATH };
const MOBILE = /mobile\.spec\.mjs$/;

export default defineConfig({
  testDir: 'test/browser',
  testMatch: /.*\.spec\.mjs$/,
  timeout: 60_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['list'], ['github'], ['json', { outputFile: 'test-results/browser.json' }]] : [['list']],
  use: { baseURL: `http://127.0.0.1:${PORT}`, trace: process.env.CI ? 'retain-on-failure' : 'off' },
  webServer: { command: `node test/browser/serve.mjs ${PORT}`, url: `http://127.0.0.1:${PORT}/__fixture.html`, reuseExistingServer: !process.env.CI, timeout: 30_000 },
  // 13.3.0: phones — mobile.spec.mjs runs only in the two mobile projects (device emulation: touch, isMobile, DPR,
  // viewport, UA); the desktop projects run everything else. Firefox has no mobile emulation in Playwright.
  projects: [
    { name: 'chromium', use: chromium, testIgnore: MOBILE },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] }, testIgnore: MOBILE },
    { name: 'webkit', use: { ...devices['Desktop Safari'] }, testIgnore: MOBILE },
    { name: 'mobile-chrome', use: mobileChrome, testMatch: MOBILE },
    { name: 'mobile-safari', use: { ...devices['iPhone 14'] }, testMatch: MOBILE },
  ],
});
