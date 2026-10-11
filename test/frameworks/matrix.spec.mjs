// 13.5.0: framework regression matrix (docs/frameworks-matrix.md). One fixture app per framework under
// test/frameworks/<fw>, server-rendered in Node with no DOM, hydrated here, then the element is defined (upgrade after
// hydrate). Every fixture renders the same thing — <p id="status"> and a <usa-switch id="sw"> whose `checked`
// property is bound from framework state and whose `usa:change` event is bound the framework's own way — and fills
// window.__fx (shared/capture.ts) with setChecked(bool), show(bool) and, where the framework has it, keepAlive(tab).
//   node test/frameworks/build.mjs <fw> && FW=<fw> npx playwright test -c test/frameworks/playwright.config.mjs
import { test, expect } from '@playwright/test';

const FW = (process.env.FW || 'react19,react18,vue3,svelte5,solid,angular').split(',');
const HYDRATION = /hydrat|mismatch|did not match|server rendered|expected server html/i;

for (const fw of FW) {
  test.describe(fw, () => {
    let consoleMsgs;
    test.beforeEach(async ({ page }) => {
      consoleMsgs = [];
      page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') consoleMsgs.push(`${m.type()}: ${m.text()}`); });
      page.on('pageerror', (e) => consoleMsgs.push('pageerror: ' + e.message));
      await page.goto(`/test/frameworks/${fw}/dist/index.html`);
      await page.waitForFunction(() => window.__fx && window.__fx.ready === true, null, { timeout: 15_000 });
    });

    test('SSR markup hydrates without mismatch warnings, then the element upgrades', async ({ page }) => {
      const sw = page.locator('#sw');
      await expect(sw).toHaveAttribute('role', 'switch');
      await expect(sw.locator('.usa-sw-track')).toHaveCount(1);
      await expect(page.locator('#status')).toHaveText('off');
      const fx = await page.evaluate(() => ({ errors: __fx.errors, warnings: __fx.warnings }));
      expect([...fx.errors, ...fx.warnings].filter((m) => HYDRATION.test(m)), 'hydration warnings').toEqual([]);
      expect(consoleMsgs.filter((m) => !/favicon|ERR_FILE_NOT_FOUND|404/.test(m)), 'console errors / warnings').toEqual([]);
    });

    test('usa:change reaches the framework handler exactly once per click, with a typed detail', async ({ page }) => {
      await page.locator('#sw').click();
      await expect(page.locator('#status')).toHaveText('on');
      await expect(page.locator('#sw')).toHaveAttribute('aria-checked', 'true');
      await page.locator('#sw').click();
      await expect(page.locator('#status')).toHaveText('off');
      expect(await page.evaluate(() => __fx.log)).toEqual(['change:true', 'change:false']);
    });

    test('framework state → element property (set before and after the upgrade)', async ({ page }) => {
      await page.evaluate(() => __fx.setChecked(true));
      await expect(page.locator('#sw')).toHaveAttribute('aria-checked', 'true');
      expect(await page.evaluate(() => document.getElementById('sw').checked)).toBe(true);
      await page.evaluate(() => __fx.setChecked(false));
      await expect(page.locator('#sw')).toHaveAttribute('aria-checked', 'false');
      expect(await page.evaluate(() => Object.prototype.hasOwnProperty.call(document.getElementById('sw'), 'checked')), 'own `checked` shadows the accessor').toBe(false);
    });

    test('mount → unmount → re-mount: a fresh element upgrades and listens once (no leaked or doubled listeners)', async ({ page }) => {
      await page.evaluate(() => __fx.show(false));
      await expect(page.locator('#sw')).toHaveCount(0);
      await page.evaluate(() => __fx.show(true));
      await expect(page.locator('#sw')).toHaveAttribute('role', 'switch');
      await expect(page.locator('#sw .usa-sw-track')).toHaveCount(1);
      await page.locator('#sw').click();
      await expect(page.locator('#status')).toHaveText('on');
      expect(await page.evaluate(() => __fx.log)).toEqual(['change:true']);
      for (let i = 0; i < 5; i++) {
        await page.evaluate(() => __fx.show(false));
        await page.evaluate(() => __fx.show(true));
      }
      await page.locator('#sw').click();
      expect(await page.evaluate(() => __fx.log)).toEqual(['change:true', 'change:false']);
      await expect(page.locator('#sw .usa-sw-track')).toHaveCount(1);
    });

    test('keep-alive (where the framework has it): a cached element keeps its state and its single listener', async ({ page }) => {
      test.skip(!(await page.evaluate(() => typeof __fx.keepAlive === 'function')), `${fw} has no keep-alive`);
      await page.locator('#ka-sw').click();
      await expect(page.locator('#ka-sw')).toHaveAttribute('aria-checked', 'true');
      await page.evaluate(() => { document.getElementById('ka-sw').__marker = 1; __fx.keepAlive('b'); });
      await expect(page.locator('#ka-sw')).toHaveCount(0);
      await page.evaluate(() => __fx.keepAlive('a'));
      await expect(page.locator('#ka-sw')).toHaveAttribute('aria-checked', 'true');
      expect(await page.evaluate(() => document.getElementById('ka-sw').__marker)).toBe(1);
      await expect(page.locator('#ka-sw .usa-sw-track')).toHaveCount(1);
      await page.locator('#ka-sw').click();
      expect(await page.evaluate(() => __fx.log.filter((l) => l.startsWith('ka:')))).toEqual(['ka:true', 'ka:false']);
    });
  });
}
