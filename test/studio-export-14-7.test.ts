// 14.7.0 — output & preview reliability (`motionary/studio/export` = `motionary/components/studio-export`): a Studio
// project becomes a standalone HTML / CSS (+ optional JS) work that plays without the editor and without a network;
// the same scene always gives the same bytes, and at every frame time the exported values equal `sampleTimelineDoc`
// (the 13.6 reference for "same animation"); a frame-export job (the adapter seam for GIF / video encoders) can fail,
// be resumed from its checkpoint and never blocks the basic export.
//
// Pure module (no DOM access in the exporter). The player that ships inside the export is a string; these tests run
// that exact string in jsdom.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  STUDIO_EXPORT_VERSION, EXPORT_LIMITS, BAKED_FORMAT, PLAYER_JS, bakeScene, sampleBaked, frameDigest, exportStandalone,
  createFrameExportJob, createJsonFramesAdapter,
} from '../src/components/studio/export';
import { createTimelineDoc, sampleTimelineDoc } from '../src/components/timeline/editor/index';
import { serializeStudioProject, sampleFrames, frameTime } from '../src/components/studio/index';
import { packStudioProject } from '../src/components/studio/assets';
import type { TimelineDoc } from '../src/components/timeline/editor/index';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const budgets = JSON.parse(readFileSync('size-budget.json', 'utf8')) as { name: string; import?: string; file?: string; limit: number }[];
const prevBudgets = JSON.parse(readFileSync('test/fixtures/size-budget-14-6-0.json', 'utf8')) as typeof budgets;
const SRC = readFileSync('src/components/studio/export.ts', 'utf8');
const enc = (s: string) => new TextEncoder().encode(s);
const text = (v: string | Uint8Array | undefined) => (typeof v === 'string' ? v : v ? new TextDecoder().decode(v) : '');

const doc0 = (): TimelineDoc => createTimelineDoc({
  name: 'hero', seed: 7,
  layers: [
    { id: 'title', type: 'track', target: '#title', keyframes: [
      { id: 'a1', time: 0, props: { opacity: 0, transform: 'translateY(20px) scale(0.9)' }, easing: 'ease-out' },
      { id: 'a2', time: 400, props: { opacity: 1, transform: 'translateY(0px) scale(1)' } },
    ] },
    { id: 'card', type: 'track', target: '.card', keyframes: [
      { id: 'b1', time: 0, props: { 'background-color': '#ff0000', '--x': 0, display: 'block' } },
      { id: 'b2', time: 250, props: { 'background-color': '#0000ff', '--x': 'random(0, 100)', display: 'none' }, easing: 'linear' },
      { id: 'b3', time: 600, props: { 'background-color': '#00ff00', '--x': 5 } },
    ] },
    { id: 'muted', type: 'track', target: '#gone', muted: true, keyframes: [{ id: 'c1', time: 0, props: { opacity: 0 } }, { id: 'c2', time: 100, props: { opacity: 1 } }] },
    { id: 'bg', type: 'track', target: '#bg', keyframes: [
      { id: 'd1', time: 0, props: { 'background-image': 'url("img/sky.png")', '--icon-src': 'icons/a.svg' } },
      { id: 'd2', time: 300, props: { 'background-image': 'url(../../etc/passwd)', '--icon-src': 'https://cdn.example.com/b.svg' } },
    ] },
  ],
});
const FILES = { 'img/sky.png': new Uint8Array([137, 80, 78, 71, 1, 2, 3]), 'icons/a.svg': enc('<svg xmlns="http://www.w3.org/2000/svg"/>') };
const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const norm = (v: unknown) => {
  const s = String(v).trim();
  const m = HEX.exec(s);
  if (!m) return typeof v === 'number' ? v : s;
  const h = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1];
  return `rgb(${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)})`;
};
const normFrame = (layers: Record<string, Record<string, unknown>>) =>
  Object.fromEntries(Object.entries(layers).map(([id, p]) => [id, Object.fromEntries(Object.entries(p).map(([k, v]) => [k, norm(v)]))]));
const sameNum = (a: unknown, b: unknown) => (typeof a === 'number' && typeof b === 'number' ? Math.abs(a - b) < 1e-9 : a === b);

describe('14.7 entry, version and budget', () => {
  it('ships motionary/studio/export (= motionary/components/studio-export) with zero runtime dependencies', () => {
    expect(pkg.version).toMatch(/^14\.([7-9]|\d\d)\.\d+$/);
    expect(STUDIO_EXPORT_VERSION).toBe(1);
    for (const p of ['./studio/export', './components/studio-export']) expect(pkg.exports[p]?.import?.default).toBe('./dist/components/studio-export.js');
    expect(pkg.dependencies ?? {}).toEqual({});
  });
  it('has its own budget line (≤ 15 KB), never raises a 14.6.0 line, lite stays ≤ 70 KB and studio/export stays out of lite / core / motion / studio / studio-assets / studio-ai', () => {
    const line = budgets.find((b) => b.import?.includes("pkg/components/studio-export'"));
    expect(line).toBeTruthy();
    expect(line!.limit).toBeLessThanOrEqual(15360);
    for (const b of prevBudgets) {
      const now = budgets.find((x) => x.name === b.name);
      expect(now, b.name).toBeTruthy();
      expect(now!.limit, b.name).toBeLessThanOrEqual(b.limit);
    }
    const lite = budgets.find((b) => /components\/lite'/.test(b.import || ''));
    expect(lite!.limit).toBeLessThanOrEqual(71680);
    for (const f of ['lite', 'core/index', 'motion/index', 'studio/index', 'studio/assets', 'studio/ai']) expect(readFileSync(`src/components/${f}.ts`, 'utf8')).not.toMatch(/studio\/export|from '\.\/export'/);
  });
  it('keeps the npm pack limits (11.2) unchanged: docs/images (README screenshots, served from GitHub) are no longer packed', () => {
    const packSrc = readFileSync('scripts/check-pack.mjs', 'utf8');
    expect(packSrc).toContain('PACK_LIMITS = { packed: 4.0 * 1024 * 1024, unpacked: 14 * 1024 * 1024, files: 2300 }');
    expect(pkg.files).toContain('docs');
    expect(pkg.files).toContain('!docs/images');
  });
  it('the exporter never evaluates, fetches or touches the DOM (the player is data: a string)', () => {
    const code = SRC.replace(/export const PLAYER_JS =[\s\S]*?\n\);?\n/, '');
    expect(code).not.toMatch(/\beval\(|new Function|import\(|fetch\(|XMLHttpRequest|WebSocket|require\(|node:|innerHTML|document\.|window\./);
    expect(typeof PLAYER_JS).toBe('string');
    expect(PLAYER_JS.length).toBeLessThan(2400);
    expect(PLAYER_JS).not.toMatch(/fetch\(|XMLHttpRequest|import\(|eval\(|innerHTML|WebSocket/);
  });
});

describe('bakeScene / sampleBaked: the exported values equal the reference at every frame', () => {
  it('bakes active tracks only, with per-property points; linear interpolable segments keep just their end points', () => {
    const b = bakeScene(doc0(), { fps: 60 });
    expect(b.format).toBe(BAKED_FORMAT);
    expect(b.version).toBe(1);
    expect(b.duration).toBe(600);
    expect(b.tracks.map((t) => t.id)).toEqual(['title', 'card', 'bg']);
    const card = b.tracks.find((t) => t.id === 'card')!;
    // background-color b2 → b3 is linear and interpolable: no frames in between
    const bg = card.props['background-color'];
    expect(bg.filter(([t]) => t > 250 && t < 600)).toEqual([]);
    // eased (title) and discrete / custom (display, --x) segments are sampled at every frame
    expect(b.tracks[0].props.opacity.length).toBeGreaterThan(20);
    expect(card.props.display.filter(([t]) => t > 0 && t < 250).length).toBeGreaterThan(10);
    expect(card.props['--x'].filter(([t]) => t > 250 && t < 600).length).toBeGreaterThan(10);
    // hex colours are written as rgb() (what the preview interpolates)
    expect(bg[0][1]).toBe('rgb(255, 0, 0)');
  });
  for (const fps of [24, 30, 60]) {
    it(`sampleBaked == sampleTimelineDoc at every frame (${fps} fps), random() resolved by seed`, () => {
      const d = doc0(), b = bakeScene(d, { fps });
      const frames = sampleFrames(d, { fps });
      expect(frames.length).toBe(Math.round((600 * fps) / 1000) + 1);
      for (const f of frames) {
        const got = sampleBaked(b, f.time);
        const exp = normFrame(f.layers);
        const g = normFrame(got.layers);
        expect(Object.keys(g)).toEqual(Object.keys(exp));
        for (const id of Object.keys(exp)) for (const k of Object.keys(exp[id])) expect(sameNum(g[id][k], exp[id][k]), `${id}.${k} @${f.time}: ${g[id][k]} vs ${exp[id][k]}`).toBe(true);
      }
    });
  }
  it('keyframes after `duration` are cut at the duration (the value there is the interpolated one)', () => {
    const d = createTimelineDoc({ duration: 200, layers: [{ id: 't', type: 'track', target: '#t', keyframes: [{ id: 'a', time: 0, props: { opacity: 0 } }, { id: 'b', time: 400, props: { opacity: 1 } }] }] });
    const b = bakeScene(d);
    expect(b.duration).toBe(200);
    expect(b.tracks[0].props.opacity).toEqual([[0, 0], [200, 0.5]]);
    expect(sampleBaked(b, 1000).layers.t.opacity).toBe(0.5);
  });
  it('accepts a Studio project text, a Scene v2 object or a timeline document; rejects malformed input', () => {
    const d = doc0();
    const a = JSON.stringify(bakeScene(d));
    expect(JSON.stringify(bakeScene(serializeStudioProject(d)))).toBe(a);
    expect(JSON.stringify(bakeScene(JSON.parse(serializeStudioProject(d)).scene))).toBe(a);
    expect(() => bakeScene('{nope')).toThrow();
    expect(() => bakeScene({ format: 'motionary-scene', version: 2, layers: 'x' } as any)).toThrow();
    expect(() => bakeScene(d, { fps: 0 })).toThrow();
    expect(() => bakeScene(d, { fps: 1000 })).toThrow();
  });
  it('refuses scenes that would bake past the point limit', () => {
    const d = createTimelineDoc({ layers: [{ id: 't', type: 'track', target: '#t', keyframes: [{ id: 'a', time: 0, props: { opacity: 0 }, easing: 'ease' }, { id: 'b', time: 1e7, props: { opacity: 1 } }] }] });
    expect(EXPORT_LIMITS.points).toBeGreaterThan(1000);
    expect(() => bakeScene(d, { fps: 60 })).toThrow(/points|frames/);
  });
});

describe('frameDigest: a fingerprint of "the same animation"', () => {
  it('is stable, changes with any frame and with fps, and equals the digest written into the export', () => {
    const d = doc0();
    const a = frameDigest(d), b = frameDigest(JSON.parse(JSON.stringify(d)));
    expect(a).toBe(b);
    expect(a).toMatch(/^mfd1-60-37-[0-9a-f]{8}$/);
    expect(frameDigest(d, { fps: 30 })).not.toBe(a);
    const d2 = doc0();
    d2.layers[0].keyframes![1].props.opacity = 0.99;
    expect(frameDigest(d2)).not.toBe(a);
    const out = exportStandalone(d, { assets: FILES });
    expect(out.report.digest).toBe(a);
    expect(text(out.files.get('index.html'))).toContain(`<meta name="motionary-digest" content="${a}">`);
  });
});

describe('exportStandalone: a work that runs without the editor', () => {
  it('writes index.html + scene.css + scene.js + assets/, deterministic to the byte', () => {
    const a = exportStandalone(doc0(), { assets: FILES, title: 'Hero <1>' });
    const b = exportStandalone(serializeStudioProject(doc0()), { assets: FILES, title: 'Hero <1>' });
    expect([...a.files.keys()]).toEqual(['assets/icons/a.svg', 'assets/img/sky.png', 'index.html', 'scene.css', 'scene.js']);
    for (const k of a.files.keys()) expect(text(b.files.get(k)), k).toBe(text(a.files.get(k)));
    expect(a.files.get('assets/img/sky.png')).toEqual(FILES['img/sky.png']);
    const html = text(a.files.get('index.html'));
    expect(html).toMatch(/^<!doctype html>/);
    expect(html).toContain('<title>Hero &lt;1&gt;</title>');
    expect(html).toContain('<link rel="stylesheet" href="scene.css">');
    expect(html).toContain('<script src="scene.js" defer></script>');
    expect(html).not.toMatch(/(src|href)="https?:/); // no remote script / stylesheet: plays offline
  });
  it('bakes CSS @keyframes (one per track, linear between baked points) and reduced-motion jumps to the final frame', () => {
    const css = text(exportStandalone(doc0(), { assets: FILES }).files.get('scene.css'));
    expect(css).toContain('@keyframes mo-0');
    expect(css).toContain('@keyframes mo-2');
    expect(css).not.toContain('@keyframes mo-3');
    expect(css).toMatch(/html:not\(\.mo-js\) \[data-motionary-export\] #title\s*\{[^}]*animation: mo-0 600ms linear 0ms 1 both/);
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).not.toContain('#gone');
    // 400 ms of 600 is 66.66667 %
    expect(css).toMatch(/66\.66667% \{[^}]*opacity: 1/);
  });
  it('rewrites asset references into assets/, blocks unsafe paths and reports what it did', () => {
    const out = exportStandalone(doc0(), { assets: { 'img/sky.png': FILES['img/sky.png'] } });
    const css = text(out.files.get('scene.css'));
    expect(css).toContain('url("assets/img/sky.png")');
    expect(css).toContain('url("about:invalid")');
    expect(css).not.toContain('passwd');
    expect(css).toContain('--icon-src: assets/icons/a.svg');
    expect(out.report.assets.copied).toEqual(['img/sky.png']);
    expect(out.report.assets.missing).toEqual(['icons/a.svg']);
    expect(out.report.assets.external).toEqual(['https://cdn.example.com/b.svg']);
    expect(out.report.assets.rejected.map((r) => r.reason)).toEqual(['outside']);
    expect(out.report.ok).toBe(false);
  });
  it('inline: true gives ONE html file (CSS, data and player inline, assets as data: URIs)', () => {
    const out = exportStandalone(doc0(), { assets: FILES, inline: true });
    expect([...out.files.keys()]).toEqual(['index.html']);
    const html = text(out.files.get('index.html'));
    expect(html).toContain('url("data:image/png;base64,');
    expect(html).toContain('--icon-src: data:image/svg+xml,%3Csvg'); // *src values: percent-encoded (no ; in a CSS declaration)
    expect(html).toContain('<style>');
    expect(html).not.toContain('scene.js');
  });
  it('js: false gives a CSS-only work (no script at all)', () => {
    const out = exportStandalone(doc0(), { assets: FILES, js: false });
    expect([...out.files.keys()]).not.toContain('scene.js');
    expect(text(out.files.get('index.html'))).not.toMatch(/<script(?! type="application\/json")/);
  });
  it('never lets a value, target, title or stage break out of CSS / HTML', () => {
    const d = createTimelineDoc({ layers: [
      { id: 'x', type: 'track', target: '#a', keyframes: [{ id: 'k', time: 0, props: { color: 'red;} body{display:none' } }, { id: 'k2', time: 100, props: { color: '</style><script>alert(1)</script>' } }] },
      { id: 'y', type: 'track', target: '#b{}', keyframes: [{ id: 'k3', time: 0, props: { opacity: 0 } }] },
      { id: 'z', type: 'track', target: '#c', keyframes: [{ id: 'k4', time: 0, props: { 'background-image': 'url(javascript:alert(1))' } }] },
    ] });
    const out = exportStandalone(d, { title: '</title><script>x()</script>', stage: '<div id="a" onclick="x()">hi</div><script>evil()</script><iframe src="https://e"></iframe><a href="javascript:x()">l</a>', inline: true });
    const html = text(out.files.get('index.html'));
    expect(html).not.toMatch(/<script>(alert|evil|x\()/);
    expect(html).not.toContain('display:none');
    expect(html).not.toMatch(/onclick|<iframe|javascript:/i);
    expect(html).not.toContain('#b{}');
    expect(html).toContain('<div id="a">hi</div>');
    const reasons = out.report.warnings.join('\n');
    expect(reasons).toMatch(/unsafe value/);
    expect(reasons).toMatch(/unsafe target/);
    // the scene data block cannot close its <script> element
    const data = /<script type="application\/json" id="motionary-scene">([\s\S]*?)<\/script>/.exec(html)![1];
    expect(data).not.toMatch(/<\//);
    expect(() => JSON.parse(data)).not.toThrow();
  });
  it('generates a stage for simple #id / .class / tag targets when none is given', () => {
    const html = text(exportStandalone(doc0(), { assets: FILES }).files.get('index.html'));
    expect(html).toContain('<div id="title"></div>');
    expect(html).toContain('<div class="card"></div>');
    expect(html).toContain('<div id="bg"></div>');
  });
  it('opens an offline project pack directly (pack → export keeps the assets)', () => {
    const pack = packStudioProject({ doc: doc0() }, FILES).text;
    const out = exportStandalone({ pack });
    expect(out.report.assets.copied).toEqual(['icons/a.svg', 'img/sky.png']);
  });
});

describe('the shipped player (PLAYER_JS) in a DOM', () => {
  const mount = (o: Parameters<typeof exportStandalone>[1] = {}) => {
    const out = exportStandalone(doc0(), { assets: FILES, ...o });
    const html = text(out.files.get('index.html'));
    const body = /<body>([\s\S]*)<\/body>/.exec(html)![1].replace(/<script[^>]*src=[^>]*><\/script>/g, '');
    document.documentElement.className = '';
    document.body.innerHTML = body;
    const raf: FrameRequestCallback[] = [];
    (window as any).requestAnimationFrame = (f: FrameRequestCallback) => raf.push(f);
    (window as any).matchMedia = () => ({ matches: false });
    // eslint-disable-next-line no-new-func
    new Function(PLAYER_JS)();
    return { api: (window as any).motionary, raf };
  };
  it('seek(t) writes exactly the reference frame (every frame at 60 fps) and marks <html class="mo-js">', () => {
    const { api } = mount();
    expect(document.documentElement.classList.contains('mo-js')).toBe(true);
    expect(api.duration).toBe(600);
    expect(api.digest).toBe(frameDigest(doc0()));
    const title = document.getElementById('title')!, card = document.querySelector('.card') as HTMLElement;
    for (const f of sampleFrames(doc0(), { fps: 60 })) {
      api.seek(f.time);
      expect(title.style.getPropertyValue('opacity'), `@${f.time}`).toBe(String(f.layers.title.opacity));
      expect(title.style.getPropertyValue('transform'), `@${f.time}`).toBe(String(f.layers.title.transform));
      expect(card.style.getPropertyValue('--x'), `@${f.time}`).toBe(String(f.layers.card['--x']));
      expect(card.style.getPropertyValue('display'), `@${f.time}`).toBe(String(f.layers.card.display));
    }
  });
  it('?t= freezes a frame; pause() / play() drive requestAnimationFrame', () => {
    const { api, raf } = mount();
    api.pause();
    const n = raf.length;
    api.play();
    expect(raf.length).toBeGreaterThan(n);
    api.pause();
    api.seek(frameTime(200));
    expect((document.getElementById('title') as HTMLElement).style.opacity).toBe(String(sampleTimelineDoc(doc0(), frameTime(200)).layers.title.opacity));
  });
});

describe('createFrameExportJob: the adapter seam for GIF / video (independent of the basic export)', () => {
  it('feeds every frame in order and returns the adapter result', async () => {
    const ad = createJsonFramesAdapter();
    const job = createFrameExportJob(doc0(), { fps: 30, adapter: ad });
    expect(job.total).toBe(19);
    const r = await job.run();
    expect(r.ok).toBe(true);
    expect(job.status).toBe('done');
    expect(r.result.frames.length).toBe(19);
    expect(r.result.frames.map((f: any) => f.time)).toEqual(sampleFrames(doc0(), { fps: 30 }).map((f) => f.time));
  });
  it('a failing frame stops the job with a checkpoint; resume() continues at that frame and the result equals one clean run', async () => {
    const clean = await createFrameExportJob(doc0(), { fps: 30, adapter: createJsonFramesAdapter() }).run();
    let fails = 2;
    const inner = createJsonFramesAdapter();
    const flaky = { ...inner, frame(i: number, f: any) { if (i === 7 && fails-- > 0) throw new Error('encoder busy'); return inner.frame(i, f); } };
    const job = createFrameExportJob(doc0(), { fps: 30, adapter: flaky });
    const r1 = await job.run();
    expect(r1.ok).toBe(false);
    expect(job.status).toBe('failed');
    expect(job.checkpoint.next).toBe(7);
    expect(String(job.error)).toMatch(/encoder busy/);
    expect((await job.resume()).ok).toBe(false);
    const r3 = await job.resume();
    expect(r3.ok).toBe(true);
    expect(JSON.stringify(r3.result)).toBe(JSON.stringify(clean.result));
  });
  it('a checkpoint survives a reload (new job, same scene) and is refused for a different scene', async () => {
    const inner = createJsonFramesAdapter();
    const job = createFrameExportJob(doc0(), { fps: 30, adapter: { ...inner, frame(i: number, f: any) { if (i === 5) throw new Error('crash'); return inner.frame(i, f); } } });
    await job.run();
    const cp = JSON.parse(JSON.stringify(job.checkpoint));
    expect(cp.format).toBe('motionary-frame-job');
    const seen: number[] = [];
    const job2 = createFrameExportJob(doc0(), { fps: 30, checkpoint: cp, adapter: { frame(i: number) { seen.push(i); } } });
    expect((await job2.run()).ok).toBe(true);
    expect(seen[0]).toBe(5);
    const other = doc0();
    other.layers[0].keyframes![1].time = 500;
    expect(() => createFrameExportJob(other, { fps: 30, checkpoint: cp, adapter: { frame() {} } })).toThrow(/checkpoint/);
  });
  it('abort() stops the job and calls adapter.abort; the basic export never waits for a job', async () => {
    let aborted = false, release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    const job = createFrameExportJob(doc0(), { fps: 30, adapter: { async frame(i: number) { if (i === 2) await gate; }, abort() { aborted = true; } } });
    const p = job.run();
    const out = exportStandalone(doc0(), { assets: FILES }); // synchronous, independent of the running job
    expect(out.files.has('index.html')).toBe(true);
    job.abort();
    release();
    const r = await p;
    expect(r.ok).toBe(false);
    expect(job.status).toBe('aborted');
    expect(aborted).toBe(true);
    await expect(job.resume()).rejects.toThrow(/aborted/);
  });
});
