// 14.0.0: Motion Engine v2 (motionary/motion) and native scene v2 in <usa-player>, in real browsers: real WAAPI
// animations driven by the controller (seek renders exact computed styles, reverse / finished / cancel), compositions,
// spring overshoot, and a scene v2 document played by <usa-player> and playScene() to the same computed state.
import { test, expect } from '@playwright/test';
import { openFixture, expectNoErrors } from './helpers.mjs';

const MARKUP = `<div id="m" style="position:relative;width:400px;height:200px">
  <div class="a" style="width:40px;height:40px;background:#4f46e5"></div>
  <div class="b" style="width:40px;height:40px;background:#db2777"></div>
  <div class="b" style="width:40px;height:40px;background:#059669"></div>
</div>`;

test.describe('14.0 Motion Engine v2', () => {
  test('seek renders the exact state; sequence / stagger offsets; reverse + finished; cancel removes effects', async ({ page }) => {
    const errors = await openFixture(page);
    await page.evaluate((html) => { document.getElementById('stage').innerHTML = html; }, MARKUP);
    const r = await page.evaluate(async () => {
      const M = await import('motionary/motion');
      const a = document.querySelector('.a');
      const op = (el) => Number(getComputedStyle(el).opacity).toFixed(2);
      const out = {};
      const c = M.animate(a, [{ opacity: 0 }, { opacity: 1 }], { duration: 1000, easing: 'linear', autoplay: false });
      c.seek(250); out.seek250 = op(a);
      c.seek(800); out.seek800 = op(a);
      const s = M.sequence([M.animate(a, [{ opacity: 1 }, { opacity: 0.5 }], { duration: 100, easing: 'linear' }), M.stagger('.b', [{ opacity: 0 }, { opacity: 1 }], { duration: 100, each: 100, easing: 'linear' })], { autoplay: false });
      out.seqDuration = s.duration;
      s.seek(150); out.seq150 = [...document.querySelectorAll('.b')].map(op);
      c.cancel();
      s.cancel();
      out.afterCancel = op(a);
      const p = M.animate(a, [{ opacity: 0 }, { opacity: 1 }], { duration: 120, reducedMotion: 'ignore' });
      await p.finished;
      out.finished = [p.playState, op(a)];
      p.reverse();
      await p.finished;
      out.reversed = [p.currentTime, op(a)];
      p.cancel();
      return out;
    });
    expect(r.seek250).toBe('0.25');
    expect(r.seek800).toBe('0.80');
    expect(r.seqDuration).toBe(300);
    expect(r.seq150).toEqual(['0.50', '1.00']); // first .b half-way; second not started → its own style (1)
    expect(r.afterCancel).toBe('1.00');
    expect(r.finished).toEqual(['finished', '1.00']);
    expect(r.reversed).toEqual([0, '0.00']);
    expectNoErrors(errors);
  });

  test('spring overshoots through a CSS linear() easing and settles', async ({ page }) => {
    const errors = await openFixture(page);
    await page.evaluate((html) => { document.getElementById('stage').innerHTML = html; }, MARKUP);
    const r = await page.evaluate(async () => {
      const M = await import('motionary/motion');
      const a = document.querySelector('.a');
      const s = M.spring(a, [{ transform: 'translateX(0px)' }, { transform: 'translateX(100px)' }], 'bouncy', { autoplay: false });
      let peak = 0;
      for (let t = 0; t <= s.duration; t += 16) { s.seek(t); peak = Math.max(peak, new DOMMatrix(getComputedStyle(a).transform).m41); }
      s.seek(s.duration);
      return { peak, end: new DOMMatrix(getComputedStyle(a).transform).m41 };
    });
    expect(r.peak).toBeGreaterThan(100);
    expect(r.end).toBeCloseTo(100, 0);
    expectNoErrors(errors);
  });

  test('scene v2: <usa-player> and playScene() reach the same state at the same time', async ({ page }) => {
    const errors = await openFixture(page);
    const r = await page.evaluate(async () => {
      const scene = { format: 'motionary-scene', version: 2, tokens: { duration: { hero: 400 } }, layers: [
        { id: 'a', type: 'track', target: '.a', keyframes: [{ id: 'k1', time: 0, props: { opacity: 0 } }, { id: 'k2', time: 400, props: { opacity: 1 } }] },
        { id: 'b', type: 'track', target: '.b', start: 200, duration: 400, preset: 'fade', easing: '{easing.linear}' },
      ] };
      const html = '<div class="a" style="width:20px;height:20px"></div><div class="b" style="width:20px;height:20px"></div>';
      const E = await import('motionary/components/effects');
      const M = await import('motionary/motion/scene');
      E.definePlayer();
      const stage = document.getElementById('stage');
      stage.innerHTML = `<usa-player trigger="manual">${html}<script type="application/json">${JSON.stringify(scene)}</script></usa-player><div id="eng">${html}</div>`;
      const pl = stage.querySelector('usa-player');
      await new Promise((r) => requestAnimationFrame(r));
      const ops = (root) => [...root.querySelectorAll('.a, .b')].map((e) => Number(getComputedStyle(e).opacity).toFixed(2));
      pl.seek(300);
      const c = M.playScene(document.getElementById('eng'), scene, { autoplay: false });
      c.seek(300);
      return { err: pl.getAttribute('data-error'), duration: pl.player.duration, player: ops(pl), engine: ops(document.getElementById('eng')) };
    });
    expect(r.err).toBeNull();
    expect(r.duration).toBe(600);
    expect(r.player).toEqual(r.engine);
    expect(r.player[0]).toBe('0.75');
    expectNoErrors(errors);
  });
});
