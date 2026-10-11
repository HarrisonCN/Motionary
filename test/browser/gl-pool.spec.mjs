// 13.8.0: graphics reliability in a real browser (Chromium; WEBGL_lose_context is the portable way to force a loss).
//   - 32 WebGL components (every WebGL tag in the manifest's webgl category + shader-backdrop) on one long page with
//     motionary/components/gl-pool installed: live contexts never exceed the cap, on-screen ones render, scrolling
//     hands contexts to the newly visible ones
//   - a forced context loss (WEBGL_lose_context) re-mounts the component on a fresh context; without the pool the
//     widgets show their own fallback instead of a blank canvas
//   - no WebGL at all: every GPU component from the manifest renders a fallback (CSS still, Canvas 2D or poster)
//   - reduced motion: one still frame, no frame loop
import { test, expect } from '@playwright/test';
import { openFixture, define, exampleOf, byTag, manifest } from './helpers.mjs';

test.skip(({ browserName }) => browserName !== 'chromium', 'Chromium: WEBGL_lose_context + a known context cap');

// WebGL components named by the manifest (category webgl + the gl widgets): the set the pool has to keep under the cap
const GL_TAGS = manifest.components.filter((c) => c.category === 'webgl').map((c) => c.tag).concat(['usa-shader-backdrop']).filter((t) => byTag[t]);
const POOL = "import { installGLPool } from 'motionary/components/gl-pool'; installGLPool({ maxContexts: 8 }); window.__pool = await import('motionary/components/gl-pool');";

const installPool = (page) =>
  page.evaluate(async (code) => {
    const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
    try { await import(url); } finally { URL.revokeObjectURL(url); }
  }, POOL);

const mountList = (page, items) =>
  page.evaluate((items) => {
    const stage = document.getElementById('stage');
    for (const [i, html] of items.entries()) {
      const w = document.createElement('div');
      w.className = 'cell';
      w.dataset.i = String(i);
      w.style.cssText = 'width:420px;height:260px;margin:0 0 40px';
      w.innerHTML = html;
      stage.append(w);
    }
  }, items);

const gpuState = (page) =>
  page.evaluate(() => {
    const els = [...document.querySelectorAll('.cell')].map((c) => [...c.children].find((e) => e.localName.startsWith('usa-')));
    const vis = (el) => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };
    const lit = (el) => el.hasAttribute('data-active') || el.dataset.usaBackend === 'webgl2' || el.dataset.usaBackend === 'webgl';
    return {
      probeLive: window.__probe.liveContexts(0),
      pool: window.__pool.glPoolStats(),
      visible: els.filter(vis).length,
      visibleLit: els.filter((e) => vis(e) && lit(e)).length,
      total: els.length,
    };
  });

test('32 WebGL components stay under the context cap; visible ones render; scrolling moves contexts', async ({ page }) => {
  expect(GL_TAGS.length).toBeGreaterThanOrEqual(4);
  await openFixture(page);
  await installPool(page);
  await define(page, ...GL_TAGS);
  const items = Array.from({ length: 32 }, (_, i) => exampleOf(GL_TAGS[i % GL_TAGS.length]));
  await mountList(page, items);
  await page.waitForTimeout(1200);
  let s = await gpuState(page);
  expect(s.total).toBe(32);
  expect(s.probeLive).toBeLessThanOrEqual(8);
  expect(s.pool.live).toBeLessThanOrEqual(8);
  expect(s.pool.peak).toBeLessThanOrEqual(8);
  expect(s.visibleLit).toBe(s.visible);
  let peak = s.probeLive;
  for (const y of [3000, 6000, 9000, 1e6]) {
    await page.evaluate((y) => scrollTo(0, y), y);
    await page.waitForTimeout(900);
    s = await gpuState(page);
    peak = Math.max(peak, s.probeLive);
    expect(s.probeLive, `at y=${y}`).toBeLessThanOrEqual(8);
    expect(s.visibleLit, `visible components render at y=${y}`).toBe(s.visible);
  }
  expect(peak).toBeLessThanOrEqual(8);
  expect(s.pool.evicted).toBeGreaterThan(0);
  expect(page.__errors).toEqual([]);
});

test('forced context loss: the pool re-mounts the component on a fresh context', async ({ page }) => {
  await openFixture(page);
  await installPool(page);
  await define(page, 'usa-shader', 'usa-shader-backdrop');
  await mountList(page, [exampleOf('usa-shader'), exampleOf('usa-shader-backdrop')]);
  await page.waitForTimeout(600);
  for (const [tag, kind] of [['usa-shader', 'webgl'], ['usa-shader-backdrop', 'webgl2']]) {
    const before = await page.evaluate(([tag, kind]) => {
      const c = document.querySelector(tag).querySelector('canvas');
      window.__old = c;
      c.getContext(kind).getExtension('WEBGL_lose_context').loseContext();
      return true;
    }, [tag, kind]);
    expect(before).toBe(true);
    await page.waitForTimeout(800);
    const after = await page.evaluate(([tag, kind]) => {
      const el = document.querySelector(tag);
      const c = el.querySelector('canvas');
      const gl = c && c.getContext(kind);
      return { fresh: c !== window.__old, live: !!gl && !gl.isContextLost(), state: el.getAttribute('data-usa-gl'), backend: el.dataset.usaBackend || null, active: el.hasAttribute('data-active') };
    }, [tag, kind]);
    expect(after, tag).toMatchObject({ fresh: true, live: true, state: 'restored' });
  }
  const st = await page.evaluate(() => window.__pool.glPoolStats());
  expect(st.lost).toBe(2);
  expect(st.recovered).toBe(2);
  expect(page.__errors).toEqual([]);
});

test('forced context loss without the pool: widgets show their fallback, not a blank canvas', async ({ page }) => {
  await openFixture(page);
  await define(page, 'usa-shader-backdrop');
  await mountList(page, [exampleOf('usa-shader-backdrop')]);
  await page.waitForTimeout(500);
  await page.evaluate(() => document.querySelector('usa-shader-backdrop canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
  await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const el = document.querySelector('usa-shader-backdrop');
    return { backend: el.dataset.usaBackend, canvasShown: getComputedStyle(el.querySelector('canvas')).display !== 'none', bg: getComputedStyle(el).backgroundImage };
  });
  expect(r.backend).toBe('css');
  expect(r.canvasShown).toBe(false);
  expect(r.bg).toMatch(/gradient/);
});

// every component the 13.1 resource suite treats as GPU-backed and that the manifest lists
const GPU = ['usa-shader', 'usa-distort', 'usa-liquid', 'usa-post-fx', 'usa-gl-scene', 'usa-shader-backdrop', 'usa-gpu-particles', 'usa-globe', 'usa-particles'].filter((t) => byTag[t]);

test('no WebGL: every GPU component renders a fallback', async ({ page }) => {
  await page.addInitScript(() => {
    const g = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...a) { return /webgl/.test(String(type)) ? null : g.call(this, type, ...a); };
    if (navigator.gpu) Object.defineProperty(navigator, 'gpu', { value: undefined });
  });
  await openFixture(page);
  await define(page, ...GPU);
  await mountList(page, GPU.map(exampleOf));
  await page.waitForTimeout(1200);
  const res = await page.evaluate((tags) => tags.map((tag) => {
    const el = document.querySelector(tag);
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    const canvases = [...el.querySelectorAll('canvas'), ...(el.shadowRoot ? el.shadowRoot.querySelectorAll('canvas') : [])];
    const has2d = canvases.some((c) => { try { return !!c.getContext('2d'); } catch { return false; } });
    const marker = el.getAttribute('data-fallback') || el.dataset.usaBackend || null;
    const painted = cs.backgroundImage !== 'none' || cs.getPropertyValue('--usa-gl-fallback').trim() !== '' || !!el.querySelector('img, svg') || !!(el.shadowRoot && el.shadowRoot.querySelector('svg')) || has2d || cs.backgroundColor !== 'rgba(0, 0, 0, 0)';
    return { tag, w: Math.round(r.width), h: Math.round(r.height), marker, painted, webglActive: el.hasAttribute('data-active') && !el.getAttribute('data-fallback') && /webgl/.test(el.dataset.usaBackend || 'webgl') && !has2d };
  }), GPU);
  for (const r of res) {
    expect(r.w * r.h, `${r.tag} has a box`).toBeGreaterThan(0);
    expect(r.painted, `${r.tag} paints a fallback (${r.marker})`).toBe(true);
  }
  expect(page.__errors).toEqual([]);
});

test('reduced motion: one still frame, no frame loop (with the pool installed)', async ({ page }) => {
  await openFixture(page, { reducedMotion: 'reduce' });
  await installPool(page);
  await define(page, 'usa-shader', 'usa-shader-backdrop');
  await mountList(page, [exampleOf('usa-shader'), exampleOf('usa-shader-backdrop')]);
  await page.waitForTimeout(1200); // the shared feature probe is released after 1 s
  await page.evaluate(() => window.__probe.resetRaf());
  await page.waitForTimeout(600);
  const r = await page.evaluate(() => ({ raf: window.__probe.rafCount(), shader: document.querySelector('usa-shader').hasAttribute('data-active'), backdrop: document.querySelector('usa-shader-backdrop').dataset.usaBackend, live: window.__pool.glPoolStats().live, gl: document.querySelectorAll('usa-shader, usa-shader-backdrop').length, leases: JSON.stringify(window.__pool.glPoolStats().leases) }));
  expect(r.shader).toBe(true);
  expect(r.backdrop).toBe('webgl2');
  expect(r.raf).toBeLessThanOrEqual(2);
  expect(r.live, r.leases).toBe(r.gl); // one context per component, the feature probe already released
  expect(page.__errors).toEqual([]);
});
