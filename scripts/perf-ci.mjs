#!/usr/bin/env node
// 11.3: performance metrics in headless Chromium (CI, Node ≥ 22 for the global WebSocket; no extra dependency —
// it speaks the Chrome DevTools Protocol directly). Budgets are fixed in perf/budgets.json and never raised
// automatically. Run after `npm run build`:  npm run perf  (CHROME_PATH=/path/to/chrome to pick a browser).
//
//  first-screen   bytes (gzip) of every JS / CSS file a page with four components downloads through
//                 motionary/components/lazy (on-demand loading), plus parse / compile / execute time
//  gpu            WebGL contexts, live textures / buffers / framebuffers / programs while <usa-gl-scene> runs,
//                 and what is left after the element is removed (leaks)
//  frames         frame stability while 300 elements tween for 2 s, relative to the browser's own idle frame
//                 interval (headless Chrome often runs at 30 fps): dropped-frame ratio, p95 frame time over that
//                 baseline, longest frame, JS time per frame in requestAnimationFrame callbacks, long tasks
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdtempSync, rmSync, statSync } from 'node:fs';
import { join, extname, normalize } from 'node:path';
import { tmpdir } from 'node:os';
import { spawn, execFileSync } from 'node:child_process';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = process.cwd(); // npm run perf runs at the package root

/** p-th percentile (nearest rank) of a list of numbers. */
export function percentile(xs, p) {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.max(0, Math.ceil((p / 100) * s.length) - 1))];
}
/** Frame stats from requestAnimationFrame deltas (ms). A frame is "dropped" when it took > 1.5 × the refresh interval (the measured idle baseline). */
export function frameStats(deltas, interval = 1000 / 60) {
  const dropped = deltas.filter((d) => d > interval * 1.5).length;
  return { frames: deltas.length, droppedRatio: deltas.length ? dropped / deltas.length : 0, p95: percentile(deltas, 95), longest: deltas.length ? Math.max(...deltas) : 0 };
}
/** Compare metrics with budgets ({ key: max }); returns the failures. */
export function overBudget(metrics, budgets) {
  return Object.entries(budgets).filter(([k, max]) => typeof metrics[k] === 'number' && metrics[k] > max).map(([k, max]) => `${k} = ${round(metrics[k])} > ${max}`);
}
const round = (x) => Math.round(x * 100) / 100;

function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  for (const c of ['google-chrome-stable', 'google-chrome', 'chromium', 'chromium-browser']) {
    try { return execFileSync('which', [c], { encoding: 'utf8' }).trim(); } catch {}
  }
  return null;
}

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.cjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.map': 'application/json' };
function serve() {
  const log = [];
  const srv = createServer((req, res) => {
    const p = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^([/\\])+/, '');
    const f = join(ROOT, p);
    if (!f.startsWith(ROOT) || !existsSync(f) || statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
    const body = readFileSync(f);
    log.push({ path: p, bytes: body.length, gzip: gzipSync(body).length });
    res.writeHead(200, { 'content-type': TYPES[extname(f)] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(body);
  });
  return new Promise((ok) => srv.listen(0, '127.0.0.1', () => ok({ srv, log, port: srv.address().port })));
}

async function launch(chrome) {
  const dir = mkdtempSync(join(tmpdir(), 'motionary-perf-'));
  const args = ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${dir}`, '--no-first-run', '--no-default-browser-check',
    '--window-size=1280,800', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding', ...(process.env.CI || process.getuid?.() === 0 ? ['--no-sandbox'] : [])];
  const proc = spawn(chrome, args, { stdio: ['ignore', 'ignore', 'pipe'] });
  const ws = await new Promise((ok, no) => {
    let buf = ''; const t = setTimeout(() => no(new Error('Chrome did not start: ' + buf.slice(-400))), 20000);
    proc.stderr.on('data', (d) => { buf += d; const m = buf.match(/DevTools listening on (ws:\/\/\S+)/); if (m) { clearTimeout(t); ok(m[1]); } });
    proc.on('exit', (c) => no(new Error('Chrome exited ' + c + ': ' + buf.slice(-400))));
  });
  const sock = new WebSocket(ws);
  await new Promise((ok, no) => { sock.onopen = ok; sock.onerror = no; });
  let id = 0; const pending = new Map(); const listeners = [];
  sock.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { const { ok, no } = pending.get(m.id); pending.delete(m.id); m.error ? no(new Error(m.error.message)) : ok(m.result); }
    else for (const l of listeners) l(m);
  };
  const send = (method, params = {}, sessionId) => new Promise((ok, no) => { const i = ++id; pending.set(i, { ok, no }); sock.send(JSON.stringify({ id: i, method, params, sessionId })); });
  const close = () => { try { sock.close(); } catch {} proc.kill('SIGKILL'); setTimeout(() => rmSync(dir, { recursive: true, force: true }), 500); };
  return { send, listeners, close };
}

async function runPage(b, url, initScript) {
  const { targetId } = await b.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await b.send('Target.attachToTarget', { targetId, flatten: true });
  const s = (m, p) => b.send(m, p, sessionId);
  const errors = [];
  const onMsg = (m) => {
    if (m.sessionId !== sessionId) return;
    if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map((a) => a.value ?? a.description).join(' '));
  };
  b.listeners.push(onMsg);
  await s('Page.enable'); await s('Runtime.enable'); await s('Performance.enable', { timeDomain: 'threadTicks' });
  if (initScript) await s('Page.addScriptToEvaluateOnNewDocument', { source: initScript });
  await s('Page.navigate', { url });
  const r = await s('Runtime.evaluate', { expression: 'new Promise((ok, no) => { const t = setTimeout(() => no(new Error("timeout")), 30000); const w = () => window.__perf ? (clearTimeout(t), ok(window.__perf)) : setTimeout(w, 50); w(); })', awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(`${url}: ${r.exceptionDetails.exception?.description || r.exceptionDetails.text}`);
  const { metrics } = await s('Performance.getMetrics');
  const pm = Object.fromEntries(metrics.map((m) => [m.name, m.value]));
  await b.send('Target.closeTarget', { targetId });
  b.listeners.splice(b.listeners.indexOf(onMsg), 1);
  return { page: r.result.value, cdp: pm, errors };
}

// Counts WebGL objects created / deleted by the page (installed before any page script runs).
const GL_COUNTER = `(() => {
  const c = window.__gl = { contexts: 0, live: { texture: 0, buffer: 0, framebuffer: 0, renderbuffer: 0, program: 0, shader: 0, vertexArray: 0 }, peak: {} };
  const gc = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (t, o) { const x = gc.call(this, t, o); if (x && /webgl/.test(t) && !x.__counted) { x.__counted = 1; c.contexts++; } return x; };
  if (typeof OffscreenCanvas !== 'undefined') { const oc = OffscreenCanvas.prototype.getContext; OffscreenCanvas.prototype.getContext = function (t, o) { const x = oc.call(this, t, o); if (x && /webgl/.test(t) && !x.__counted) { x.__counted = 1; c.contexts++; } return x; }; }
  for (const P of [window.WebGLRenderingContext, window.WebGL2RenderingContext].filter(Boolean).map((K) => K.prototype)) {
    for (const k of Object.keys(c.live)) {
      const N = k[0].toUpperCase() + k.slice(1), cr = P['create' + N], de = P['delete' + N];
      if (cr) P['create' + N] = function (...a) { const o = cr.apply(this, a); if (o) { c.live[k]++; c.peak[k] = Math.max(c.peak[k] || 0, c.live[k]); } return o; };
      if (de) P['delete' + N] = function (o) { if (o) c.live[k]--; return de.call(this, o); };
    }
  }
})();`;

export async function main() {
  const budgets = JSON.parse(readFileSync(join(ROOT, 'perf/budgets.json'), 'utf8'));
  const chrome = findChrome();
  if (!chrome) {
    if (process.env.CI) { console.error('❌ perf: no Chrome / Chromium found (set CHROME_PATH)'); process.exit(1); }
    console.log('perf: skipped — no Chrome / Chromium found (set CHROME_PATH)'); return;
  }
  const { srv, log, port } = await serve();
  const b = await launch(chrome);
  const base = `http://127.0.0.1:${port}/perf/`;
  const fails = [];
  const report = {};
  try {
    // first screen
    log.length = 0;
    const fs1 = await runPage(b, base + 'first-screen.html');
    const assets = log.filter((x) => /\.(m?js|css)$/.test(x.path));
    report['first-screen'] = {
      transferKB: assets.reduce((n, x) => n + x.gzip, 0) / 1024,
      requests: assets.length,
      scriptMs: (fs1.cdp.ScriptDuration || 0) * 1000,
      readyMs: fs1.page.readyMs,
      errors: fs1.errors.length,
    };
    // gpu
    const g = await runPage(b, base + 'gpu.html', GL_COUNTER);
    report.gpu = { contexts: g.page.during.contexts, textures: g.page.during.live.texture, buffers: g.page.during.live.buffer,
      programs: g.page.during.live.program, leakedTextures: g.page.after.live.texture, leakedBuffers: g.page.after.live.buffer, rendered: g.page.rendered ? 1 : 0, errors: g.errors.length };
    // frames
    const f = await runPage(b, base + 'frames.html');
    const idle = percentile(f.page.baseline, 50) || 1000 / 60;
    const st = frameStats(f.page.deltas, idle);
    report.frames = { baselineMs: idle, frames: st.frames, droppedPct: st.droppedRatio * 100, p95Ms: st.p95, p95OverBaselineMs: Math.max(0, st.p95 - idle), longestMs: st.longest, scriptMsPerFrame: f.page.frames ? f.page.rafMs / f.page.frames : 0, longTasks: f.page.longTasks, errors: f.errors.length };
  } finally { b.close(); srv.close(); }

  console.log('| metric | value | budget |\n|---|---|---|');
  for (const [group, m] of Object.entries(report)) {
    for (const [k, v] of Object.entries(m)) console.log(`| ${group}.${k} | ${round(v)} | ${budgets[group]?.[k] ?? '—'} |`);
    fails.push(...overBudget(m, budgets[group] || {}).map((x) => `${group}.${x}`));
  }
  if (report.gpu.rendered !== 1) fails.push('gpu: <usa-gl-scene> did not render (no WebGL2?)');
  if (report.frames.frames < 30) fails.push(`frames: only ${report.frames.frames} frames recorded`);
  if (process.env.PERF_JSON) (await import('node:fs')).writeFileSync(process.env.PERF_JSON, JSON.stringify(report, null, 2));
  if (fails.length) { console.error('❌ perf\n' + fails.map((x) => '  - ' + x).join('\n')); process.exit(1); }
  console.log('✅ perf — all metrics within perf/budgets.json');
}

if (process.argv[1] && import.meta.url.startsWith('file:') && fileURLToPath(import.meta.url) === process.argv[1]) main().catch((e) => { console.error('❌ perf:', e.message); process.exit(1); });
