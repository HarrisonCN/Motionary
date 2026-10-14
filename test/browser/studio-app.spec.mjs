// 15.0.0: Motion Studio 2.0 (motionary/studio/app) in real browsers — the whole authoring loop through the UI:
// new → add a track and keys with mouse + keyboard (Studio toolbar, ruler, inspector) → preview a frame on the stage →
// Save (app toolbar) → a fresh app → Reopen → same project text and frame digest → Export → the exported file, opened
// in a sandboxed iframe with no network, shows the preview's value at the same frame. Desktop projects here; the phone
// viewport run is in mobile.spec.mjs.
import { test, expect } from '@playwright/test';
import { openFixture, expectNoErrors } from './helpers.mjs';

const STAGE = `
<div id="app"></div>
<div id="cv" style="position:relative;width:420px;height:160px;background:#fafafa">
  <div id="a" style="position:absolute;left:20px;top:20px;width:80px;height:40px;background:#08f"></div>
</div>`;
const ZOOM = 600; // px per second

async function mountApp(page) {
  await openFixture(page);
  await page.evaluate((html) => (document.getElementById('stage').innerHTML = html), STAGE);
  await page.evaluate(async (ZOOM) => {
    const A = await import('motionary/studio/app');
    window.__A = A;
    window.__store = window.__store || A.createMemoryStorage();
    window.__app = await A.createStudioApp(document.getElementById('app'), { stage: document.getElementById('cv'), storage: window.__store, name: 'promo', zoom: ZOOM, length: 1000, canvas: { snap: false } });
  }, ZOOM);
}
const box = (page, sel) => page.evaluate((s) => { const r = document.querySelector(s).getBoundingClientRect(); return { x: r.left, y: r.top + r.height / 2 }; }, sel);

test.describe('15.0 Motion Studio 2.0 app', () => {
  test('new → edit (UI) → preview → save → reopen in a fresh app → same digest → export plays the same frame offline', async ({ page }) => {
    await mountApp(page);
    expect(await page.locator('[data-app]').count()).toBeGreaterThanOrEqual(7);
    await page.locator('[data-field="track-name"]').fill('A');
    await page.locator('[data-field="track-target"]').fill('#a');
    await page.click('[data-act="add-track"]');
    const id = await page.evaluate(() => window.__app.history.doc.layers[0].id);
    const scrub = async (ms) => { const r = await box(page, '[data-ruler]'); await page.mouse.click(r.x + (ms * ZOOM) / 1000, r.y); };
    const key = async (ms, value) => {
      await page.click(`[data-row-head="${id}"] span`);
      await scrub(ms);
      if (await page.locator('[data-inspector] [data-prop="opacity"]').count()) { const l = page.locator('[data-inspector] [data-prop="opacity"]'); await l.fill(value); await l.press('Enter'); }
      else { await page.locator('[data-field="prop-name"]').fill('opacity'); await page.locator('[data-field="prop-value"]').fill(value); await page.click('[data-act="add-prop"]'); }
    };
    await key(0, '0');
    await key(500, '1');
    expect(await page.evaluate(() => window.__app.history.doc.layers[0].keyframes.map((k) => [k.time, k.props.opacity]))).toEqual([[0, 0], [500, 1]]);
    expect(await page.evaluate(() => window.__app.dirty)).toBe(true);
    // preview: scrub to 250 ms → the stage shows the sampled value
    await scrub(250);
    const shown = Number(await page.evaluate(() => getComputedStyle(document.getElementById('a')).opacity));
    expect(shown).toBeGreaterThan(0.05);
    expect(shown).toBeLessThan(0.95);
    // save from the app toolbar
    await page.click('[data-app="save"]');
    await expect.poll(() => page.evaluate(() => window.__app.dirty)).toBe(false);
    const text = await page.evaluate(() => window.__store.read('promo'));
    const digest = await page.evaluate(() => window.__app.digest());
    // a fresh app on the same storage: Reopen
    await page.evaluate(() => window.__app.destroy());
    await page.evaluate(async () => {
      window.__app = await window.__A.createStudioApp(document.getElementById('app'), { stage: document.getElementById('cv'), storage: window.__store, name: 'promo', zoom: 600, length: 1000, canvas: { snap: false } });
    });
    expect(await page.evaluate(() => window.__app.history.doc.layers.length)).toBe(0);
    await page.click('[data-app="reopen"]');
    await expect.poll(() => page.evaluate(() => window.__app.history.doc.layers.length)).toBe(1);
    expect(await page.evaluate(() => window.__app.studio.save())).toBe(text);
    expect(await page.evaluate(() => window.__app.digest())).toBe(digest);
    // export → one inline file; open it script-less in a sandboxed iframe, frozen at 250 ms via the 14.7 player? No scripts:
    // compare the CSS animation at 250 ms (getAnimations().currentTime) with the preview value
    const html = await page.evaluate(async () => (await window.__app.exportStandalone({ inline: true, js: false })).files.get('index.html'));
    expect(html).toContain(digest);
    await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
    const exported = await page.evaluate((html) => new Promise((done) => {
      const f = document.createElement('iframe');
      f.setAttribute('sandbox', 'allow-same-origin');
      f.style.cssText = 'width:440px;height:200px';
      f.onload = () => {
        const d = f.contentDocument, el = d.querySelector('#a');
        for (const a of d.getAnimations()) { a.pause(); a.currentTime = 250; }
        done(el ? Number(d.defaultView.getComputedStyle(el).opacity) : -1);
      };
      f.srcdoc = html;
      document.body.append(f);
    }), html);
    expect(Math.abs(exported - shown)).toBeLessThan(0.01);
    // export button produces a download link
    await page.click('[data-app="export"]');
    await expect(page.locator('[data-app="download"]')).toHaveAttribute('download', 'promo.html');
    await page.evaluate(() => window.__app.destroy());
    await expectNoErrors(page);
  });

  test('open a damaged file keeps the current project; undo / redo / new from the toolbar', async ({ page }) => {
    await mountApp(page);
    await page.evaluate(() => window.__app.studio.addTrack({ name: 'A', target: '#a' }));
    const before = await page.evaluate(() => window.__app.studio.save());
    const r = await page.evaluate(() => window.__app.open('{"format":"motionary-studio","version":1,"scene":'));
    expect(r.ok).toBe(false);
    expect(await page.evaluate(() => window.__app.studio.save())).toBe(before);
    await expect(page.locator('.usa-studio-app-status')).toContainText('Could not open');
    await page.click('[data-app="undo"]');
    expect(await page.evaluate(() => window.__app.history.doc.layers.length)).toBe(0);
    await page.click('[data-app="redo"]');
    expect(await page.evaluate(() => window.__app.history.doc.layers.length)).toBe(1);
    await page.click('[data-app="new"]');
    await expect.poll(() => page.evaluate(() => window.__app.history.doc.layers.length)).toBe(0);
    expect(await page.evaluate(() => window.__app.history.canUndo)).toBe(false);
    await page.evaluate(() => window.__app.destroy());
    await expectNoErrors(page);
  });
});
