// 13.1.0: a complex page — 32 components from every family (GPU backgrounds, canvases, counters, carousels, forms,
// overlays, charts) mounted together and running at once — measured in each browser against the recorded baseline in
// perf/browser-baseline.json. Budgets are relative to the baseline with generous headroom (CI machines vary) plus
// absolute ceilings; PERF_RECORD=1 writes the measured numbers to test-results/perf-<browser>.json to re-record.
//   mountMs          define every component (dynamic imports) and mount the page
//   p95FrameMs       95th percentile frame interval while everything runs (3 s window)
//   rafPerFrame      native requestAnimationFrame calls per frame (the shared scheduler batches every loop into one)
//   teardown         after removing the page: no frame loop, no live WebGL context, no window / document listener
import { test, expect } from '@playwright/test';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { openFixture, define, exampleOf, expectNoErrors, byTag } from './helpers.mjs';

export const PAGE = ['usa-aurora', 'usa-particles', 'usa-shader', 'usa-blobs', 'usa-dot-network', 'usa-grid-glow', 'usa-marquee', 'usa-typewriter', 'usa-counter', 'usa-odometer', 'usa-reveal', 'usa-tabs', 'usa-carousel', 'usa-segmented', 'usa-switch', 'usa-stepper', 'usa-pagination', 'usa-slider', 'usa-color-picker', 'usa-date-picker', 'usa-star-rating', 'usa-gauge', 'usa-sparkline', 'usa-progress-ring', 'usa-countdown', 'usa-equalizer', 'usa-kpi', 'usa-skeleton-reveal', 'usa-menu', 'usa-popover', 'usa-modal', 'usa-tilt'].filter((t) => byTag[t]);

const BASE = JSON.parse(readFileSync(new URL('../../perf/browser-baseline.json', import.meta.url), 'utf8'));

test('complex page: 32 components running together', async ({ page, browserName }, info) => {
  test.setTimeout(120_000);
  await openFixture(page);
  const t0 = Date.now();
  await define(page, ...PAGE);
  const pre = await page.evaluate(() => window.__probe.snapshot());
  await page.evaluate((parts) => {
    const w = document.createElement('div');
    w.id = 'page';
    w.style.cssText = 'display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px';
    w.innerHTML = parts.map((h) => `<section style="min-height:120px;overflow:hidden">${h}</section>`).join('');
    document.getElementById('stage').append(w);
  }, PAGE.map(exampleOf));
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  const mountMs = Date.now() - t0;
  await page.waitForTimeout(500);
  const run = await page.evaluate(async () => {
    window.__probe.resetRaf();
    const times = [];
    let last = performance.now();
    const end = last + 3000;
    await new Promise((done) => {
      const tick = (t) => { times.push(t - last); last = t; if (t < end) requestAnimationFrame(tick); else done(); };
      requestAnimationFrame(tick);
    });
    const native = window.__probe.rafCount() - times.length; // the probe's own loop excluded
    const sorted = times.slice(1).sort((a, b) => a - b);
    const p = (q) => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
    return { frames: sorted.length, meanFrameMs: +(sorted.reduce((a, b) => a + b, 0) / sorted.length).toFixed(2), p95FrameMs: +p(0.95).toFixed(2), maxFrameMs: +sorted[sorted.length - 1].toFixed(2), rafPerFrame: +(native / sorted.length).toFixed(2), animations: document.getAnimations().length, heapMB: performance.memory ? +(performance.memory.usedJSHeapSize / 1048576).toFixed(1) : null };
  });
  await page.evaluate(() => document.getElementById('page').remove());
  await page.waitForTimeout(400);
  const teardown = await page.evaluate(async () => {
    const { schedulerStats } = await import('motionary/components');
    window.__probe.resetRaf();
    await new Promise((r) => setTimeout(r, 400));
    return { loops: schedulerStats().loops, raf: window.__probe.rafCount(), liveContexts: window.__probe.liveContexts(0), intervals: window.__probe.snapshot().intervals };
  });
  teardown.intervals -= pre.intervals;
  const result = { components: PAGE.length, mountMs, ...run, teardown };
  console.log(`[perf] ${browserName} ${JSON.stringify(result)}`);
  await info.attach(`perf-${browserName}`, { body: JSON.stringify(result, null, 2), contentType: 'application/json' });
  if (process.env.PERF_RECORD) {
    mkdirSync('test-results', { recursive: true });
    writeFileSync(`test-results/perf-${browserName}.json`, JSON.stringify(result, null, 2));
  }
  const b = BASE.browsers[browserName];
  const budget = BASE.budget;
  expect.soft(mountMs, 'mount time').toBeLessThanOrEqual(Math.max(budget.mountMsMax, b ? b.mountMs * budget.factor : 0));
  expect.soft(run.p95FrameMs, 'p95 frame interval').toBeLessThanOrEqual(Math.max(budget.p95FrameMsMax, b ? b.p95FrameMs * budget.factor : 0));
  expect.soft(run.rafPerFrame, 'native rAF calls per frame (shared scheduler)').toBeLessThanOrEqual(budget.rafPerFrameMax);
  expect.soft(teardown, 'teardown leaves nothing running').toEqual({ loops: 0, raf: 0, liveContexts: 0, intervals: 0 });
  expectNoErrors(page);
});
