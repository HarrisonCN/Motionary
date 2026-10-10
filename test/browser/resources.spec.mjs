// 13.1.0: resource release for the WebGL / Canvas / animation-loop components, and the platform capability matrix
// (docs/browser-matrix.md). For every component that draws on a canvas or runs a frame loop:
//   - record which backend it chose in this browser (WebGL2 / WebGL / Canvas 2D / CSS fallback) — the matrix
//   - mount / unmount it 6 times: live WebGL contexts never pile up (each mount releases the previous one)
//   - after the last disconnect: every WebGL context it created is lost / released, no rAF callback runs, the shared
//     frame scheduler has no loop left, no listener on window / document, no interval
import { test, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { openFixture, define, exampleOf, expectNoErrors, byTag } from './helpers.mjs';

export const GPU = ['usa-shader', 'usa-distort', 'usa-liquid', 'usa-post-fx', 'usa-gl-scene', 'usa-gl-model', 'usa-gpu-particles', 'usa-shader-backdrop', 'usa-physics-playground', 'usa-globe', 'usa-gen-art', 'usa-worker-canvas', 'usa-particles', 'usa-blobs', 'usa-dot-network', 'usa-grid-glow', 'usa-water-ripple', 'usa-ambient', 'usa-gesture-fx', 'usa-skeleton-reveal', 'usa-lottie-player', 'usa-dotlottie', 'usa-audio'];

// one file per browser and component under test-results/gpu-matrix/ (CI uploads it; docs/browser-matrix.md summarises it)
const record = (browserName, key, value) => {
  const dir = `test-results/gpu-matrix/${browserName}`;
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/${key}.json`, JSON.stringify(value));
  console.log(`[matrix] ${browserName} ${key} ${JSON.stringify(value)}`);
};

test('platform capabilities', async ({ page, browserName }) => {
  await openFixture(page);
  const caps = await page.evaluate(async () => {
    const c = () => document.createElement('canvas');
    const gl2 = c().getContext('webgl2');
    const gl1 = c().getContext('webgl');
    let gpu = false;
    try { gpu = !!(navigator.gpu && (await navigator.gpu.requestAdapter())); } catch {}
    const dbg = gl2 || gl1;
    const info = dbg && dbg.getExtension('WEBGL_debug_renderer_info');
    return { webgl2: !!gl2, webgl: !!gl1, webgpu: gpu, offscreenCanvas: typeof OffscreenCanvas === 'function', loseContext: !!(dbg && dbg.getExtension('WEBGL_lose_context')), renderer: info ? dbg.getParameter(info.UNMASKED_RENDERER_WEBGL) : null };
  });
  record(browserName, '_capabilities', caps);
  expect(typeof caps.webgl2).toBe('boolean');
});

for (const tag of GPU) {
  test(`release ${tag}`, async ({ page, browserName }) => {
    test.skip(!byTag[tag], 'not in manifest');
    await openFixture(page);
    await define(page, tag);
    const base = await page.evaluate(() => window.__probe.snapshot());
    const ctxFrom = await page.evaluate(() => window.__probe.contextCount());
    await page.evaluate((html) => { const w = document.createElement('div'); w.innerHTML = html; w.style.cssText = 'width:480px;height:320px'; document.getElementById('stage').append(w); window.__wrap = w; }, exampleOf(tag));
    await page.waitForTimeout(700);
    const state = await page.evaluate((tag) => {
      const el = document.querySelector(tag);
      const p = window.__probe;
      return { backend: el.dataset.usaBackend || el.getAttribute('data-backend') || null, active: el.hasAttribute('data-active'), fallback: el.getAttribute('data-fallback'), contexts: p.contextCount(), canvases: el.querySelectorAll('canvas').length + (el.shadowRoot ? el.shadowRoot.querySelectorAll('canvas').length : 0) };
    }, tag);
    state.contexts -= ctxFrom;
    let peakLive = 0;
    for (let i = 0; i < 6; i++) {
      await page.evaluate(() => window.__wrap.remove());
      await page.waitForTimeout(80);
      await page.evaluate(() => document.getElementById('stage').append(window.__wrap));
      await page.waitForTimeout(160);
      peakLive = Math.max(peakLive, await page.evaluate((from) => window.__probe.liveContexts(from), ctxFrom));
    }
    await page.evaluate(() => window.__wrap.remove());
    await page.waitForTimeout(300);
    const after = await page.evaluate(async ({ base, from }) => {
      const s = window.__probe.snapshot();
      const extra = s.listenerTypes.slice();
      for (const t of base.listenerTypes) { const i = extra.indexOf(t); if (i >= 0) extra.splice(i, 1); }
      const { schedulerStats } = await import('motionary/components');
      window.__probe.resetRaf();
      await new Promise((r) => setTimeout(r, 400));
      return { liveContexts: window.__probe.liveContexts(from), listeners: extra, intervals: s.intervals - base.intervals, raf: window.__probe.rafCount(), loops: schedulerStats().loops };
    }, { base, from: ctxFrom });
    record(browserName, tag, { ...state, peakLiveWhileRemounting: peakLive });
    expect.soft(peakLive, 'WebGL contexts alive while re-mounting (old ones released)').toBeLessThanOrEqual(Math.max(1, state.contexts));
    expect.soft(after, 'after the last disconnect').toEqual({ liveContexts: 0, listeners: [], intervals: 0, raf: 0, loops: 0 });
    expectNoErrors(page, tag);
  });
}

test('usa-distort re-connected after its image failed: falls back instead of keeping a dead canvas', async ({ page }) => {
  await openFixture(page);
  await define(page, 'usa-distort');
  await page.evaluate(() => { document.getElementById('stage').innerHTML = '<div id="w"><usa-distort id="d"><img src="/missing.jpg" alt=""></usa-distort></div>'; });
  await page.waitForTimeout(500);
  const first = await page.evaluate(() => ({ fallback: document.getElementById('d').getAttribute('data-fallback'), canvas: !!document.querySelector('#d canvas') }));
  const w = await page.evaluate(() => { const w = document.getElementById('w'); w.remove(); document.getElementById('stage').append(w); });
  void w;
  await page.waitForTimeout(500);
  const again = await page.evaluate(() => ({ fallback: document.getElementById('d').getAttribute('data-fallback'), canvas: !!document.querySelector('#d canvas'), live: window.__probe.liveContexts(0) }));
  if (first.fallback === 'webgl') test.skip(true, 'no WebGL in this browser');
  expect(first).toEqual({ fallback: 'image', canvas: false });
  expect(again).toEqual({ fallback: 'image', canvas: false, live: 0 });
});
