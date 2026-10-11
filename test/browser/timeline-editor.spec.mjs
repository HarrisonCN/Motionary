// 13.6.0: reproducible timeline preview in a real browser (motionary/components/timeline-editor). The same time must
// give the same pixels whatever happened before — fixed-step playback, jumps, scrubbing backwards, a reload — and a
// seeded random value must not change between runs. Pixel comparisons run in Chromium; the DOM-state checks in every
// desktop browser.
import { test, expect } from '@playwright/test';
import { openFixture, expectNoErrors } from './helpers.mjs';

const MARKUP = `<div id="tl" style="position:relative;width:480px;height:240px;background:#fff;overflow:hidden">
  <div class="bg" style="position:absolute;inset:0"></div>
  <div class="card" style="position:absolute;left:24px;top:40px;width:120px;height:80px;background:#4f46e5;border-radius:12px"></div>
  <div class="card" style="position:absolute;left:180px;top:40px;width:120px;height:80px;background:#db2777;border-radius:12px"></div>
  <div class="cta" style="position:absolute;left:330px;top:150px;width:120px;height:48px;background:#059669;border-radius:24px"></div>
</div>`;

const DOC = {
  format: 'motionary-timeline', version: 1, name: 'browser', seed: 7, duration: 1500,
  layers: [
    { id: 'hero', type: 'group' },
    { id: 'bg', type: 'track', parent: 'hero', target: '.bg', keyframes: [
      { id: 'k1', time: 0, props: { backgroundColor: '#f8fafc' }, easing: 'ease-in-out' },
      { id: 'k2', time: 1500, props: { backgroundColor: '#fde68a' } } ] },
    { id: 'c1', type: 'track', parent: 'hero', target: '.card:nth-child(2)', keyframes: [
      { id: 'k3', time: 0, props: { opacity: 0, transform: 'translateY(random(20, 60)px) rotate(random(-20, 20)deg)' }, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      { id: 'k4', time: 900, props: { opacity: 1, transform: 'translateY(0px) rotate(0deg)' } } ] },
    { id: 'c2', type: 'track', parent: 'hero', target: '.card:nth-child(3)', keyframes: [
      { id: 'k5', time: 300, props: { opacity: 0, transform: 'scale(0.6)' }, easing: 'back-out' },
      { id: 'k6', time: 1200, props: { opacity: 1, transform: 'scale(1)' } } ] },
    { id: 'cta', type: 'track', target: '.cta', keyframes: [
      { id: 'k7', time: 600, props: { transform: 'translateX(80px)', borderRadius: '0px' }, easing: 'steps(5, end)' },
      { id: 'k8', time: 1500, props: { transform: 'translateX(0px)', borderRadius: '24px' } } ] },
  ],
};

async function setup(page) {
  await openFixture(page);
  await page.evaluate(async ({ html, doc }) => {
    document.getElementById('stage').innerHTML = html;
    const TE = await import('motionary/components/timeline-editor');
    const d = TE.parseTimelineDoc(doc);
    window.__te = { TE, d, p: TE.createTimelinePreview(document.getElementById('tl'), d, { clock: TE.createFixedClock({ step: 1000 / 60 }) }) };
  }, { html: MARKUP, doc: DOC });
}
const state = (page) => page.evaluate(() => [...document.querySelectorAll('#tl > *')].map((e) => e.getAttribute('style')).join('\n'));
const shot = (page) => page.locator('#tl').screenshot({ animations: 'disabled' });
const seek = (page, ...ts) => page.evaluate(async (ts) => { for (const t of ts) window.__te.p.seek(t); await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); }, ts);

test.describe('13.6 timeline editor: reproducible preview', () => {
  test('same time → same DOM state: fixed-step playback, jumps, backwards scrub', async ({ page }) => {
    await setup(page);
    // 45 fixed steps of 1000/60 ms = 750 ms
    const t = await page.evaluate(() => { let f; for (let i = 0; i < 45; i++) f = window.__te.p.advance(); return f.time; });
    expect(t).toBe(750);
    const played = await state(page);
    await seek(page, 1500, 0, 1234, 750);
    expect(await state(page)).toBe(played);
    await seek(page, ...Array.from({ length: 30 }, (_, i) => 1500 - i * 25), 750);
    expect(await state(page)).toBe(played);
    // the sampled frame matches the one a fresh document parse produces
    const same = await page.evaluate(() => JSON.stringify(window.__te.TE.sampleTimelineDoc(window.__te.TE.parseTimelineDoc(window.__te.TE.serializeTimelineDoc(window.__te.d)), 750)) === JSON.stringify(window.__te.TE.sampleTimelineDoc(window.__te.d, 750)));
    expect(same).toBe(true);
    await expectNoErrors(page);
  });

  test('seeded random survives a reload; another seed differs', async ({ page }) => {
    await setup(page);
    await seek(page, 0);
    const first = await state(page);
    expect(first).toMatch(/translateY\([\d.]+px\) rotate\(-?[\d.]+deg\)/);
    await setup(page);
    await seek(page, 0);
    expect(await state(page)).toBe(first);
    const other = await page.evaluate(() => { window.__te.p.setDoc({ ...window.__te.d, seed: 8 }); window.__te.p.seek(0); return [...document.querySelectorAll('#tl > *')].map((e) => e.getAttribute('style')).join('\n'); });
    expect(other).not.toBe(first);
  });

  test('undo / redo restores the previewed frame exactly', async ({ page }) => {
    await setup(page);
    const r = await page.evaluate(() => {
      const { TE, d, p } = window.__te;
      const h = TE.createTimelineHistory(d);
      h.subscribe((doc) => p.setDoc(doc));
      p.seek(1000);
      const s = () => [...document.querySelectorAll('#tl > *')].map((e) => e.getAttribute('style')).join('\n');
      const before = s();
      h.begin('drag');
      for (let i = 0; i < 10; i++) h.apply((x) => TE.shiftKeyframes(x, ['k5', 'k6'], 20));
      h.commit();
      const moved = s();
      h.undo();
      const undone = s();
      h.redo();
      return { before, moved, undone, redone: s(), size: h.size };
    });
    expect(r.moved).not.toBe(r.before);
    expect(r.undone).toBe(r.before);
    expect(r.redone).toBe(r.moved);
    expect(r.size).toBe(1);
  });

  test('visual snapshots: identical pixels at the same time however it was reached (Chromium)', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'pixel comparisons run in Chromium');
    await setup(page);
    for (const t of [0, 420, 750, 1111, 1500]) {
      await page.evaluate((t) => { window.__te.p.seek(0); const c = window.__te.TE.createFixedClock({ step: 1000 / 60 }); let f = window.__te.p.seek(0); while (c.time < t - 1e-9) { c.tick(); f = window.__te.p.seek(Math.min(c.time, t)); } return f.time; }, t);
      await seek(page, t);
      const stepped = await shot(page);
      await seek(page, 1500 - t, 0, 1500, t);
      const jumped = await shot(page);
      expect(jumped.equals(stepped), `t=${t}: jump vs step`).toBe(true);
      await setup(page);
      await seek(page, t);
      const reloaded = await shot(page);
      expect(reloaded.equals(stepped), `t=${t}: reload`).toBe(true);
    }
    // different times really render differently (the comparison is not vacuous)
    await seek(page, 0);
    const a = await shot(page);
    await seek(page, 1500);
    expect((await shot(page)).equals(a)).toBe(false);
  });
});
