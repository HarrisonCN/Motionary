// 14.2.0: Layout Motion 2.0 (motionary/motion/layout) in real browsers: element rects measured mid-transition (seeked
// and while playing), scale correction of children and border-radius, scroll containers / sticky during an update,
// View Transitions on/off parity (the API forced off → FLIP fallback ends in the same DOM and rects), reduced motion.
import { test, expect } from '@playwright/test';
import { openFixture, expectNoErrors } from './helpers.mjs';

const STAGE = `
<div id="wrap" style="position:absolute;left:0;top:0;width:600px;height:400px;margin:0;padding:0">
  <div id="box" style="position:absolute;left:0;top:0;width:100px;height:100px;border-radius:20px;background:#08f">
    <span id="label" style="position:absolute;left:10px;top:10px;width:40px;height:20px;display:block;background:#fff"></span>
  </div>
</div>`;
const rect = (page, sel) => page.evaluate((s) => { const r = document.querySelector(s).getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; }, sel);
const near = (a, b, eps = 1.5) => { for (const k of Object.keys(b)) expect(Math.abs(a[k] - b[k]), `${k}: ${a[k]} vs ${b[k]}`).toBeLessThan(eps); };

test.describe('14.2 Layout Motion 2.0', () => {
  test('FLIP: rects mid-transition, scale correction of children, border-radius correction, restore', async ({ page }) => {
    await openFixture(page);
    await page.evaluate((html) => (document.getElementById('stage').innerHTML = html), STAGE);
    await page.evaluate(async () => {
      const L = await import('motionary/motion/layout');
      const box = document.getElementById('box');
      window.__c = L.flip(box, () => Object.assign(box.style, { left: '200px', top: '100px', width: '300px', height: '200px' }), { duration: 100, easing: 'linear', autoplay: false });
    });
    await page.evaluate(() => window.__c.seek(0));
    near(await rect(page, '#box'), { x: 0, y: 0, w: 100, h: 100 });
    near(await rect(page, '#label'), { w: 40, h: 20 }); // corrected: not scaled down with the parent
    expect(await page.evaluate(() => parseFloat(getComputedStyle(document.getElementById('box')).borderTopLeftRadius))).toBeCloseTo(60, 0); // 20 / (100/300)
    await page.evaluate(() => window.__c.seek(50));
    near(await rect(page, '#box'), { x: 100, y: 50, w: 200, h: 150 });
    near(await rect(page, '#label'), { x: 110, y: 60, w: 40, h: 20 });
    await page.evaluate(() => window.__c.finish());
    near(await rect(page, '#box'), { x: 200, y: 100, w: 300, h: 200 });
    expect(await page.evaluate(() => document.getElementById('box').style.transform)).toBe('');
    expect(await page.evaluate(() => document.getElementById('box').style.borderRadius)).toBe('20px');
    await expectNoErrors(page);
  });

  test('FLIP while playing: the rect is between old and new mid-flight, interruptible without a jump', async ({ page }) => {
    await openFixture(page);
    await page.evaluate((html) => (document.getElementById('stage').innerHTML = html), STAGE);
    const mid = await page.evaluate(async () => {
      const L = await import('motionary/motion/layout');
      const box = document.getElementById('box');
      const c = L.flip(box, () => (box.style.left = '400px'), { duration: 600, easing: 'linear' });
      await new Promise((r) => setTimeout(r, 250));
      const x = box.getBoundingClientRect().left;
      // interrupt: go back to 0 from wherever it is now
      const c2 = L.flip(box, () => (box.style.left = '0px'), { duration: 600, easing: 'linear', autoplay: false });
      c2.seek(0);
      const x2 = box.getBoundingClientRect().left;
      const s1 = c.playState;
      c2.finish();
      return { x, x2, s1, end: box.getBoundingClientRect().left };
    });
    expect(mid.x).toBeGreaterThan(20);
    expect(mid.x).toBeLessThan(380);
    expect(Math.abs(mid.x2 - mid.x)).toBeLessThan(40); // continues from the interrupted spot (one frame of drift at most)
    expect(mid.s1).toBe('idle');
    expect(mid.end).toBeCloseTo(0, 0);
    await expectNoErrors(page);
  });

  test('scroll containers and sticky: scrolling during the update is not a layout change; a real move animates by the layout delta', async ({ page }) => {
    await openFixture(page);
    await page.evaluate(() => {
      document.getElementById('stage').innerHTML = `
        <div id="sc" style="position:absolute;left:0;top:0;width:300px;height:200px;overflow:auto">
          <div id="sticky" style="position:sticky;top:0;height:30px;background:#333"></div>
          <div id="item" style="margin-top:100px;width:50px;height:50px;background:#f80"></div>
          <div style="height:1000px"></div>
        </div>`;
    });
    const r = await page.evaluate(async () => {
      const L = await import('motionary/motion/layout');
      const sc = document.getElementById('sc');
      const item = document.getElementById('item');
      const sticky = document.getElementById('sticky');
      const c1 = L.flip([item, sticky], () => (sc.scrollTop = 60), { duration: 100, autoplay: false });
      const t1 = [item.style.transform, sticky.style.transform];
      c1.cancel();
      sc.scrollTop = 0;
      const before = item.getBoundingClientRect();
      const c2 = L.flip(item, () => { sc.scrollTop = 60; item.style.marginLeft = '100px'; }, { duration: 100, easing: 'linear', autoplay: false });
      c2.seek(0);
      const at0 = item.getBoundingClientRect();
      c2.finish();
      return { t1, before: [before.left, before.top], at0: [at0.left, at0.top] };
    });
    expect(r.t1).toEqual(['', '']);
    expect(r.at0[0]).toBeCloseTo(r.before[0], 0); // starts at its old x …
    expect(r.at0[1]).toBeCloseTo(r.before[1] - 60, 0); // … in the scrolled container (no fake vertical travel)
    await expectNoErrors(page);
  });

  test('View Transitions on/off parity: same final DOM and rects; FLIP fallback flies from the old box', async ({ page, browserName }) => {
    await openFixture(page);
    const run = (forceOff) => page.evaluate(async (forceOff) => {
      const L = await import('motionary/motion/layout');
      const stage = document.getElementById('stage');
      stage.innerHTML = '<div id="grid" style="position:absolute;left:0;top:0;width:600px;height:400px"><div id="thumb" data-layout-id="photo" style="position:absolute;left:20px;top:20px;width:80px;height:60px;background:#0a0"></div></div>';
      const saved = document.startViewTransition;
      if (forceOff) delete Document.prototype.startViewTransition, (document.startViewTransition = undefined);
      const supported = L.supportsViewTransitions();
      const t = await L.layoutTransition(() => {
        stage.querySelector('#thumb').remove();
        stage.querySelector('#grid').insertAdjacentHTML('beforeend', '<div id="big" data-layout-id="photo" style="position:absolute;left:200px;top:100px;width:320px;height:240px;background:#0a0"></div>');
      }, { duration: 200, easing: 'linear', autoplay: false });
      let mid = null;
      if (t.controls) { t.controls.seek(0); const r = document.getElementById('big').getBoundingClientRect(); mid = [r.left, r.top, r.width, r.height]; t.controls.finish(); }
      await t.finished;
      const r = document.getElementById('big').getBoundingClientRect();
      const out = { method: t.method, supported, mid, final: [r.left, r.top, r.width, r.height], html: stage.innerHTML, vtn: document.getElementById('big').style.getPropertyValue('view-transition-name'), style: !!document.querySelector('style[data-motionary-vt]') };
      if (forceOff && saved) document.startViewTransition = saved;
      return out;
    }, forceOff);
    const on = await run(false);
    const off = await run(true);
    expect(on.method).toBe(on.supported ? 'view-transition' : 'flip');
    expect(off.supported).toBe(false);
    expect(off.method).toBe('flip');
    expect(off.mid).toEqual([20, 20, 80, 60].map((v) => expect.closeTo(v, 0)));
    expect(off.final).toEqual(on.final);
    expect(off.html).toBe(on.html);
    expect(on.vtn).toBe('');
    expect(on.style).toBe(false);
    test.info().annotations.push({ type: 'view-transitions', description: `${browserName}: ${on.supported ? 'native' : 'unsupported → FLIP'}` });
    await expectNoErrors(page);
  });

  test('reduced motion: instant by default, crossfade on request (no movement)', async ({ page }) => {
    await openFixture(page, { reducedMotion: 'reduce' });
    await page.evaluate((html) => (document.getElementById('stage').innerHTML = html), STAGE);
    const r = await page.evaluate(async () => {
      const L = await import('motionary/motion/layout');
      const box = document.getElementById('box');
      box.setAttribute('data-layout-id', 'b');
      const c = L.flip(box, () => (box.style.left = '200px'), { duration: 300 });
      const instant = { state: c.playState, transform: box.style.transform, x: box.getBoundingClientRect().left };
      const t = await L.layoutTransition(() => (box.style.left = '0px'));
      const t2 = await L.layoutTransition(() => (box.style.left = '100px'), { reducedMotion: 'crossfade', method: 'flip', duration: 100, autoplay: false });
      t2.controls.seek(0);
      const cross = { method: t2.method, transform: box.style.transform, opacity: getComputedStyle(box).opacity, x: box.getBoundingClientRect().left };
      t2.controls.finish();
      return { instant, method: t.method, cross, opacityAfter: box.style.opacity };
    });
    expect(r.instant).toEqual({ state: 'finished', transform: '', x: 200 });
    expect(r.method).toBe('instant');
    expect(r.cross.method).toBe('crossfade');
    expect(r.cross.transform).toBe('');
    expect(r.cross.opacity).toBe('0');
    expect(r.cross.x).toBeCloseTo(100, 0);
    expect(r.opacityAfter).toBe('');
    await expectNoErrors(page);
  });
});
