// 15.3.0: accessible & responsive motion in real browsers (chromium / firefox / webkit in CI):
// axe-core (devDependency) on the Studio app, keyboard-only reach of every app action, the app at 200 % zoom
// (640 × 400 CSS px) without horizontal scrolling, and the sensitivity tiers following the OS setting / the page.
import { test, expect } from '@playwright/test';
import { createRequire } from 'node:module';
import { openFixture, expectNoErrors } from './helpers.mjs';

const AXE = createRequire(import.meta.url).resolve('axe-core/axe.min.js');
const STAGE = `<div id="app"></div><div id="cv" style="position:relative;width:300px;height:120px"><div id="a" style="width:60px;height:30px;background:#08f"></div></div>`;
async function mountApp(page, o = {}) {
  await openFixture(page, o);
  await page.evaluate((html) => (document.getElementById('stage').innerHTML = html), STAGE);
  await page.evaluate(async () => {
    const A = await import('motionary/studio/app');
    window.__app = await A.createStudioApp(document.getElementById('app'), { stage: document.getElementById('cv'), name: 'a11y', length: 1000 });
  });
}

test.describe('15.3 accessible motion', () => {
  test('axe: no serious or critical WCAG 2.1 A/AA violations in the Studio app', async ({ page }) => {
    await mountApp(page);
    await page.addScriptTag({ path: AXE });
    const res = await page.evaluate(async () => (await window.axe.run(document.getElementById('app'), { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })).violations
      .filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id}: ${v.nodes.length} × ${v.nodes[0]?.target}`));
    expect(res).toEqual([]);
    expectNoErrors(page, 'studio app');
  });

  test('keyboard only: Tab reaches every app toolbar action, each with a visible focus indicator', async ({ page }) => {
    await mountApp(page);
    const actions = await page.evaluate(() => [...document.querySelectorAll('#app [data-app]')].filter((e) => e.matches('button, [role=button], a[href], input, select')).map((e) => e.getAttribute('data-app')));
    expect(actions.length).toBeGreaterThanOrEqual(3);
    const reached = new Set();
    await page.focus('body');
    for (let i = 0; i < 200 && reached.size < actions.length; i++) {
      await page.keyboard.press('Tab');
      const info = await page.evaluate(() => {
        const e = document.activeElement, s = e && getComputedStyle(e);
        return e ? { app: e.getAttribute('data-app'), ring: s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 2 || s.boxShadow !== 'none' } : {};
      });
      if (info.app && actions.includes(info.app)) { expect(info.ring, `focus ring on ${info.app}`).toBe(true); reached.add(info.app); }
    }
    expect([...reached].sort()).toEqual([...actions].sort());
  });

  test('200 % zoom (640 × 400 CSS px): no horizontal scrolling, every app action on screen or scrollable into view', async ({ page }) => {
    await page.setViewportSize({ width: 640, height: 400 });
    await mountApp(page);
    const o = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    expect(o.sw).toBeLessThanOrEqual(o.cw + 1);
    for (const el of await page.locator('#app [data-app]').all()) { if (!(await el.isVisible())) continue; /* display:none (e.g. the download link before an export) is not an action on screen */ await el.scrollIntoViewIfNeeded(); await expect(el).toBeInViewport(); }
  });

  test('sensitivity: reduced from the OS setting, gentle from the page, resolveVariant follows it', async ({ page }) => {
    await openFixture(page, { reducedMotion: 'reduce' });
    expect(await page.evaluate(async () => (await import('motionary/studio/a11y')).motionSensitivity())).toBe('reduced');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    const r = await page.evaluate(async () => {
      const A = await import('motionary/studio/a11y');
      document.documentElement.setAttribute('data-usa-motion-mode', 'gentle');
      const doc = { format: 'motionary-scene', version: 2, duration: 1000, layers: [{ id: 'a', type: 'track', target: '#a', keyframes: [{ id: 'k0', time: 0, props: { transform: 'translateX(100px)' } }, { id: 'k1', time: 1000, props: { transform: 'translateX(0px)' } }] }] };
      const s = A.motionSensitivity();
      return { s, t: A.resolveVariant(doc, { sensitivity: s }).layers[0].keyframes[0].props.transform };
    });
    expect(r).toEqual({ s: 'gentle', t: 'translateX(50px)' });
  });
});
