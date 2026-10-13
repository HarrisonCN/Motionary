// 14.7.0: the standalone export (motionary/studio/export) in a real browser — the exported work plays without the
// editor and without a network, and at frame times its computed styles equal the reference (`sampleTimelineDoc`):
// through the shipped player (seek), through the CSS-only fallback (paused CSS animations), from files on disk
// (file://, assets/ next to index.html) and under reduced motion. No request leaves the page: every http(s) request
// is aborted.
import { test, expect } from '@playwright/test';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const X = await import(pathToFileURL(join(ROOT, 'dist/components/studio-export.js')).href);
const T = await import(pathToFileURL(join(ROOT, 'dist/components/timeline-editor.js')).href);
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

const doc = () => T.createTimelineDoc({
  name: 'export spec', seed: 3,
  layers: [
    { id: 'title', type: 'track', target: '#title', keyframes: [
      { id: 'a1', time: 0, props: { opacity: 0, transform: 'translateX(40px) rotate(10deg)' }, easing: 'ease-out' },
      { id: 'a2', time: 500, props: { opacity: 1, transform: 'translateX(0px) rotate(0deg)' } },
    ] },
    { id: 'card', type: 'track', target: '.card', keyframes: [
      { id: 'b1', time: 0, props: { 'background-color': '#ff0000', width: '100px' } },
      { id: 'b2', time: 300, props: { 'background-color': '#0000ff', width: '160px' }, easing: 'cubic-bezier(0.3, 0, 0.2, 1)' },
      { id: 'b3', time: 600, props: { 'background-color': '#00aa00', width: '120px' } },
    ] },
    { id: 'bg', type: 'track', target: '#bg', keyframes: [
      { id: 'c1', time: 0, props: { 'background-image': 'url("img/dot.png")', opacity: 0.5 } },
      { id: 'c2', time: 600, props: { opacity: 1 } },
    ] },
  ],
});
const STAGE = '<h1 id="title">Hello</h1><div class="card" style="height:40px"></div><div id="bg" style="width:50px;height:50px"></div>';
const CHECK = [['title', '#title', ['opacity', 'transform']], ['card', '.card', ['background-color', 'width']], ['bg', '#bg', ['opacity']]];
// every 3rd frame at 60 fps (frame n at n × 1000 / 60 ms, 4 decimals — the studio frame grid)
const FRAMES = Array.from({ length: 37 }, (_, n) => Math.round(((n * 1000) / 60) * 1e4) / 1e4).filter((_, i) => i % 3 === 0).map((t) => T.sampleTimelineDoc(doc(), t));

async function offline(page, reducedMotion = 'no-preference') {
  page.__errors = [];
  page.on('pageerror', (e) => page.__errors.push(String(e && e.message)));
  page.__requests = [];
  await page.route(/^https?:\/\//, (r) => { page.__requests.push(r.request().url()); return r.abort(); });
  await page.emulateMedia({ reducedMotion });
}

/** Compare computed styles of the exported elements with a probe element styled with the reference values. */
async function compare(page, frames, mode) {
  return page.evaluate(({ frames, CHECK, mode }) => {
    const probe = document.createElement('div');
    probe.style.cssText = 'position:absolute;visibility:hidden';
    document.body.appendChild(probe);
    const nums = (s) => (String(s).match(/-?\d*\.?\d+(e[-+]?\d+)?/gi) || []).map(Number);
    const close = (a, b) => { const x = nums(a), y = nums(b); return String(a).replace(/-?\d*\.?\d+(e[-+]?\d+)?/gi, '#') === String(b).replace(/-?\d*\.?\d+(e[-+]?\d+)?/gi, '#') && x.length === y.length && x.every((v, i) => Math.abs(v - y[i]) <= 0.002 * Math.max(1, Math.abs(y[i]))); };
    const bad = [];
    for (const f of frames) {
      if (mode === 'player') window.motionary.seek(f.time);
      else if (mode === 'css') for (const a of document.getAnimations()) { a.pause(); a.currentTime = f.time; }
      for (const [id, sel, props] of CHECK) {
        const el = document.querySelector(sel);
        for (const p of props) {
          probe.style.setProperty(p, String(f.layers[id][p]));
          const want = getComputedStyle(probe).getPropertyValue(p), got = getComputedStyle(el).getPropertyValue(p);
          if (!close(got, want)) bad.push(`${f.time} ${sel} ${p}: ${got} vs ${want}`);
          probe.style.removeProperty(p);
        }
      }
    }
    return bad;
  }, { frames, CHECK, mode });
}

test('inline export + player: computed styles equal the reference at every 3rd frame (60 fps), offline', async ({ page }) => {
  await offline(page);
  const out = X.exportStandalone(doc(), { inline: true, stage: STAGE, assets: { 'img/dot.png': new Uint8Array(PNG) } });
  expect(out.report.ok).toBe(true);
  await page.setContent(out.files.get('index.html'));
  await expect.poll(() => page.evaluate(() => typeof window.motionary)).toBe('object');
  expect(await page.evaluate(() => [window.motionary.duration, window.motionary.digest, document.documentElement.classList.contains('mo-js')])).toEqual([600, out.report.digest, true]);
  await page.evaluate(() => window.motionary.pause());
  expect(await compare(page, FRAMES, 'player')).toEqual([]);
  expect(await page.evaluate(() => getComputedStyle(document.querySelector('#bg')).backgroundImage)).toContain('data:image/png;base64,');
  expect(page.__requests).toEqual([]);
  expect(page.__errors).toEqual([]);
});

test('CSS-only export (no script): paused CSS animations give the reference values at frame times', async ({ page }) => {
  await offline(page);
  const out = X.exportStandalone(doc(), { inline: true, js: false, stage: STAGE, assets: { 'img/dot.png': new Uint8Array(PNG) } });
  const html = out.files.get('index.html');
  expect(html).not.toMatch(/<script/);
  await page.setContent(html);
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(3);
  expect(await compare(page, FRAMES, 'css')).toEqual([]);
  expect(page.__errors).toEqual([]);
});

test('files on disk: index.html + scene.css + scene.js + assets/ play from file:// with no network; ?t= freezes a frame', async ({ page }) => {
  await offline(page);
  const out = X.exportStandalone(doc(), { stage: STAGE, assets: { 'img/dot.png': new Uint8Array(PNG) } });
  const dir = mkdtempSync(join(tmpdir(), 'mo-export-'));
  for (const [name, data] of out.files) { mkdirSync(dirname(join(dir, name)), { recursive: true }); writeFileSync(join(dir, name), data); }
  const url = pathToFileURL(join(dir, 'index.html')).href;
  await page.goto(url + '?t=300');
  await expect.poll(() => page.evaluate(() => window.motionary && window.motionary.time)).toBe(300);
  const f300 = T.sampleTimelineDoc(doc(), 300);
  expect(await compare(page, [f300], 'player-frozen')).toEqual([]);
  expect(await page.evaluate(() => getComputedStyle(document.querySelector('#bg')).backgroundImage)).toContain('assets/img/dot.png');
  const loaded = await page.evaluate(() => new Promise((r) => { const i = new Image(); i.onload = () => r(i.naturalWidth); i.onerror = () => r(-1); i.src = 'assets/img/dot.png'; }));
  expect(loaded).toBe(1);
  expect(page.__requests).toEqual([]);
  expect(page.__errors).toEqual([]);
});

test('reduced motion: the player and the CSS fallback both show the final frame', async ({ page }) => {
  await offline(page, 'reduce');
  const end = T.sampleTimelineDoc(doc(), 600);
  const out = X.exportStandalone(doc(), { inline: true, stage: STAGE });
  await page.setContent(out.files.get('index.html'));
  await expect.poll(() => page.evaluate(() => window.motionary && window.motionary.time)).toBe(600);
  expect(await compare(page, [end], 'player-frozen')).toEqual([]);
  const css = X.exportStandalone(doc(), { inline: true, js: false, stage: STAGE });
  await page.setContent(css.files.get('index.html'));
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => getComputedStyle(document.querySelector('#title')).opacity)).toBe('1');
  expect(await page.evaluate(() => getComputedStyle(document.querySelector('.card')).width)).toBe('120px');
});
