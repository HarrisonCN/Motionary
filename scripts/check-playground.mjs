#!/usr/bin/env node
// 13.0.2: component playground (showcase/run.html) end to end in headless Chromium — no extra dependency, it
// speaks the Chrome DevTools Protocol through scripts/perf-ci.mjs. Run after `npm run build`:
//   npm run check:playground          (CHROME_PATH=/path/to/chrome to pick a browser; PLAYGROUND_SHOTS=dir for screenshots)
//
// Checks (docs/ROADMAP + Q4 plan, v13.0.2 acceptance):
//  edit-run        an edit anywhere in the HTML document (head and body) shows up in the preview after Run
//  rapid-run       Run pressed again while the previous preview is loading shows the last edit
//  copy-download   Copy and Download hand out exactly the code in the editor (not the original sample)
//  standalone      the downloaded .html opens on its own (file://) and the component registers from its CDN URLs
//                  (served from this build's dist/ unless PLAYGROUND_REAL_CDN=1)
//  tabs-keep-edits switching HTML (CDN) ↔ npm + bundler keeps each tab's edits
//  esm-run         the npm + bundler tab runs the edited module through an import map
//  isolation       a user script cannot reach the playground page (parent / top / storage) or inject markup into it
//  module-samples  pages whose component or example needs ES modules (no CDN bundle / bare imports) register and resolve
//  missing-prereq  removing a prerequisite <script> shows the module and the exact line that fixes it
//  runtime-error   a script error in the preview is shown under the editor
//  esm-unknown     an import that motionary does not export is named with a fix
//  deps-badge      the prerequisites / tier badge sits next to the component title, not over the page heading
//  mobile          at 390 px: no horizontal scroll, controls reachable and ≥ 36 px tall, editor font ≥ 16 px, short
//                  component list, badge clear of the heading, Run shows the edit
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdtempSync, statSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, extname, normalize, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { findChrome, launch } from './perf-ci.mjs';

const ROOT = process.cwd();
const SHOTS = process.env.PLAYGROUND_SHOTS ? resolve(process.env.PLAYGROUND_SHOTS) : null;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.map': 'application/json' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function serve() {
  const srv = createServer((req, res) => {
    const p = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^([/\\])+/, '');
    const f = join(ROOT, p);
    if (!f.startsWith(ROOT) || !existsSync(f) || statSync(f).isDirectory()) { res.writeHead(404, { 'access-control-allow-origin': '*' }); res.end(); return; }
    // like GitHub Pages: CORS open, so the sandboxed (opaque-origin) preview can load module scripts from the site
    res.writeHead(200, { 'content-type': TYPES[extname(f)] || 'application/octet-stream', 'cache-control': 'no-store', 'access-control-allow-origin': '*' });
    res.end(readFileSync(f));
  });
  return new Promise((ok) => srv.listen(0, '127.0.0.1', () => ok({ srv, port: srv.address().port })));
}

async function openTab(b, url, { width = 1280, height = 900, mobile = false, init, cdnFromDist = false } = {}) {
  const { targetId } = await b.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await b.send('Target.attachToTarget', { targetId, flatten: true });
  const s = (m, p) => b.send(m, p, sessionId);
  const frames = new Map(); // OOPIF sessions (sandboxed iframes can live in their own process)
  const onMsg = (m) => {
    if (m.method === 'Target.attachedToTarget' && m.sessionId === sessionId && m.params.targetInfo.type === 'iframe') frames.set(m.params.targetInfo.targetId, m.params.sessionId);
    if (m.method === 'Target.detachedFromTarget' && m.sessionId === sessionId) for (const [k, v] of frames) if (v === m.params.sessionId) frames.delete(k);
    if (m.method === 'Fetch.requestPaused' && m.sessionId === sessionId) {
      // the page keeps its CDN URLs; their bytes come from this build's dist/ (deterministic, and the release under
      // test is not on the CDN yet). PLAYGROUND_REAL_CDN=1 lets them through to the network instead.
      const hit = m.params.request.url.match(/motionary@[^/]+\/dist\/([^?#]+)/);
      const f = hit && join(ROOT, 'dist', normalize(hit[1]));
      if (f && f.startsWith(join(ROOT, 'dist')) && existsSync(f)) s('Fetch.fulfillRequest', { requestId: m.params.requestId, responseCode: 200, responseHeaders: [{ name: 'content-type', value: TYPES[extname(f)] || 'text/javascript' }, { name: 'access-control-allow-origin', value: '*' }], body: readFileSync(f).toString('base64') }).catch(() => {});
      else s('Fetch.continueRequest', { requestId: m.params.requestId }).catch(() => {});
    }
  };
  b.listeners.push(onMsg);
  await s('Page.enable'); await s('Runtime.enable');
  await s('Target.setAutoAttach', { autoAttach: true, waitForDebuggerOnStart: false, flatten: true });
  await s('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: mobile ? 2 : 1, mobile });
  if (mobile) await s('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  if (init) await s('Page.addScriptToEvaluateOnNewDocument', { source: init });
  if (cdnFromDist && !process.env.PLAYGROUND_REAL_CDN) await s('Fetch.enable', { patterns: [{ urlPattern: '*motionary@*' }] });
  await s('Page.navigate', { url });
  const ev = async (expression) => {
    const r = await s('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };
  // evaluate inside the preview iframe (the parent cannot: it is sandboxed without allow-same-origin)
  const frameEv = async (expression) => {
    // the preview may be in-process (isolated world on the child frame) or an out-of-process iframe target; a sandboxed
    // srcdoc frame can change process on every Run, so ask every candidate and keep the first non-empty answer
    let reached = false, empty = null;
    const tree = await s('Page.getFrameTree');
    for (const child of tree.frameTree.childFrames || []) {
      try {
        const { executionContextId } = await s('Page.createIsolatedWorld', { frameId: child.frame.id, worldName: 'check' });
        const r = await s('Runtime.evaluate', { expression, contextId: executionContextId, awaitPromise: true, returnByValue: true });
        if (!r.exceptionDetails) { reached = true; if (r.result.value != null && r.result.value !== false) return r.result.value; empty = r.result.value; }
      } catch {}
    }
    for (const fs of [...frames.values()].reverse()) {
      const r = await b.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }, fs).catch(() => null);
      if (r && !r.exceptionDetails) { reached = true; if (r.result.value != null && r.result.value !== false) return r.result.value; empty = r.result.value; }
    }
    if (!reached) throw new Error('preview frame not reachable');
    return empty;
  };
  const shot = async (name) => {
    if (!SHOTS) return null;
    mkdirSync(SHOTS, { recursive: true });
    const { data } = await s('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    const f = join(SHOTS, name + '.png'); writeFileSync(f, Buffer.from(data, 'base64')); return f;
  };
  const close = async () => { b.listeners.splice(b.listeners.indexOf(onMsg), 1); await b.send('Target.closeTarget', { targetId }).catch(() => {}); };
  return { s, ev, frameEv, shot, close };
}

const until = async (fn, ms = 15000) => { const t = Date.now(); let last; while (Date.now() - t < ms) { try { last = await fn(); if (last) return last; } catch (e) { last = e.message; } await sleep(150); } return last; };

// page helpers (run in the playground page)
const READY = `new Promise((ok) => { const w = () => document.getElementById('code') && document.getElementById('code').value ? ok(true) : setTimeout(w, 50); w(); })`;
const setCode = (code) => `(() => { const t = document.getElementById('code'); t.value = ${JSON.stringify(code)}; t.dispatchEvent(new Event('input', { bubbles: true })); return true; })()`;
const click = (sel) => `(() => { const b = document.querySelector(${JSON.stringify(sel)}); b.click(); return true; })()`;
const getCode = `document.getElementById('code').value`;
const problems = `(document.getElementById('problems') || {}).textContent || ''`;
const CLIP = `(() => { window.__copied = null; try { Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: (t) => { window.__copied = t; return Promise.resolve(); } } }); } catch {} })();`;

export async function main() {
  const chrome = findChrome();
  if (!chrome) {
    if (process.env.CI) { console.error('❌ playground: no Chrome / Chromium found (set CHROME_PATH)'); process.exit(1); }
    console.log('playground: skipped — no Chrome / Chromium found (set CHROME_PATH)'); return;
  }
  const { srv, port } = await serve();
  const b = await launch(chrome);
  const url = (tag) => `http://127.0.0.1:${port}/showcase/run.html#${tag}`;
  const results = [];
  const check = async (name, fn) => {
    try { const r = await fn(); results.push({ name, ok: r === true, detail: r === true ? '' : String(r) }); }
    catch (e) { results.push({ name, ok: false, detail: e.message }); }
  };
  const dl = mkdtempSync(join(tmpdir(), 'motionary-playground-'));
  await b.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: dl, eventsEnabled: true });
  try {
    // ---------------------------------------------------------------- HTML (CDN) tab
    const t = await openTab(b, url('usa-reveal'), { init: CLIP });
    await t.ev(READY);
    const original = await t.ev(getCode);
    const edited = original
      .replace('</title>', ' (edited)</title>')
      .replace(/<style>/, '<style id="head-edit">h2{color:rgb(255, 0, 0)}</style>\n<style>')
      .replace('<h2>Hello</h2>', '<h2 id="edited">Edited in the playground</h2>');
    await check('edit-run', async () => {
      if (edited === original) return 'sample changed: could not apply the edit';
      await t.ev(setCode(edited)); await t.ev(click('#run'));
      const r = await until(() => t.frameEv(`(() => { const h = document.getElementById('edited'); return h && document.getElementById('head-edit') && customElements.get('usa-reveal') ? { text: h.textContent, color: getComputedStyle(h).color, title: document.title } : null; })()`), 25000);
      if (!r || typeof r !== 'object') {
        const diag = { srcdocHasEdit: await t.ev(`document.getElementById('preview').srcdoc.includes('id="edited"')`), frame: await t.frameEv(`location.href + ' ' + document.readyState + ' ' + !!document.getElementById('edited') + ' ' + !!document.getElementById('head-edit') + ' ' + !!customElements.get('usa-reveal')`).catch((e) => e.message), msg: await t.ev(`document.getElementById('msg').textContent + ' | ' + ${problems}`) };
        return 'preview does not show the edit: ' + JSON.stringify(r) + ' ' + JSON.stringify(diag);
      }
      return r.text === 'Edited in the playground' && r.color === 'rgb(255, 0, 0)' && /\(edited\)/.test(r.title) ? true : 'head edit missing in preview: ' + JSON.stringify(r);
    });
    await check('rapid-run', async () => {
      // Run clicked again while the previous preview is still loading: the last edit wins
      for (const n of [1, 2, 3]) { await t.ev(setCode(original.replace('<h2>Hello</h2>', `<h2 id="rapid">Run ${n}</h2>`))); await t.ev(click('#run')); }
      const r = await until(() => t.frameEv(`(document.getElementById('rapid') || {}).textContent || null`).then((x) => (x === 'Run 3' ? x : null)), 20000);
      return r === 'Run 3' ? true : 'preview did not show the last Run: ' + JSON.stringify(r);
    });
    await t.ev(setCode(edited));
    await check('copy-download', async () => {
      await t.ev(click('#copy'));
      const copied = await until(() => t.ev('window.__copied'));
      for (const f of readdirSync(dl)) { try { (await import('node:fs')).rmSync(join(dl, f)); } catch {} }
      await t.ev(click('#download'));
      const file = await until(() => readdirSync(dl).find((f) => /\.html$/.test(f) && !/crdownload/.test(f)));
      if (!file) return 'no download';
      const got = readFileSync(join(dl, file), 'utf8');
      const ed = await t.ev(getCode);
      if (copied !== ed) return 'Copy differs from the editor';
      if (got !== ed) return 'Download differs from the editor (' + (got === original ? 'it is the original sample' : 'other content') + ')';
      return true;
    });
    await check('standalone', async () => {
      const file = readdirSync(dl).find((f) => /\.html$/.test(f));
      if (!file) return 'no downloaded file';
      const sa = await openTab(b, pathToFileURL(join(dl, file)).href, { cdnFromDist: true });
      try {
        const r = await until(() => sa.ev(`(() => { const h = document.getElementById('edited'); return h && customElements.get('usa-reveal') ? { text: h.textContent, color: getComputedStyle(h).color } : null; })()`), 30000);
        if (!r || typeof r !== 'object') return 'standalone page did not run: ' + JSON.stringify(r);
        return r.text === 'Edited in the playground' && r.color === 'rgb(255, 0, 0)' ? true : 'standalone page is not the edited code: ' + JSON.stringify(r);
      } finally { await sa.close(); }
    });
    await check('deps-badge', async () => {
      const o = await t.ev(`(() => { const a = document.getElementById('deps').getBoundingClientRect(), h = document.querySelector('header h1').getBoundingClientRect(); return { overlap: !(a.right <= h.left || a.left >= h.right || a.bottom <= h.top || a.top >= h.bottom), pos: getComputedStyle(document.getElementById('deps')).position }; })()`);
      return o.overlap ? 'the prerequisites badge covers the page title (' + o.pos + ')' : true;
    });
    await check('tabs-keep-edits', async () => {
      await t.ev(setCode(edited));
      await t.ev(click('[role=tab][data-k=esm]')); await sleep(100);
      await t.ev(click('[role=tab][data-k=html]')); await sleep(100);
      return (await t.ev(getCode)) === edited ? true : 'HTML edits lost after switching tabs';
    });
    await check('runtime-error', async () => {
      await t.ev(setCode(original.replace('</body>', '<script>notAFunction123();</script>\n</body>'))); await t.ev(click('#run'));
      const p = await until(async () => { const x = await t.ev(problems); return /notAFunction123/.test(x) ? x : null; }, 8000);
      return typeof p === 'string' && /notAFunction123/.test(p) ? true : 'runtime error not shown in the page';
    });
    await check('isolation', async () => {
      const attack = original.replace('</body>', `<script>
  const r = [];
  try { parent.document.body.dataset.pwned = '1'; r.push('parent-dom'); } catch (e) { r.push('blocked:' + e.name); }
  try { top.location.href = 'about:blank#pwned'; r.push('top-nav'); } catch (e) { r.push('blocked:' + e.name); }
  try { localStorage.setItem('x', '1'); r.push('storage'); } catch (e) { r.push('blocked:' + e.name); }
  try { parent.eval('document.body.dataset.pwned=1'); r.push('parent-eval'); } catch (e) { r.push('blocked:' + e.name); }
  const html = '<img src=x onerror="document.body.dataset.xss=1">';
  for (const k of ['error', 'console', 'ready', 'runtime-missing']) parent.postMessage({ __motionaryPlayground: (window.__mp || ''), kind: k, message: html, undefined: [html] }, '*');
  parent.postMessage(html, '*');
  window.__iso = r.join(',');
</script>
</body>`);
      await t.ev(setCode(attack)); await t.ev(click('#run'));
      const r = await until(() => t.frameEv('window.__iso || null'));
      await sleep(800);
      const p = await t.ev(`({ pwned: document.body.dataset.pwned || null, xss: document.body.dataset.xss || null, href: location.href, imgs: document.querySelectorAll('#problems img, #msg img').length })`);
      if (typeof r !== 'string') return 'attack script did not run: ' + r;
      if (/parent-dom|top-nav|storage|parent-eval/.test(r)) return 'sandbox escape: ' + r;
      if (p.pwned || p.xss || p.imgs || !p.href.includes('/showcase/run.html')) return 'parent affected: ' + JSON.stringify(p);
      return true;
    });
    if (SHOTS) { await t.ev(setCode(original)); await t.ev(click('#run')); await sleep(1200); await t.shot('desktop-1280-html'); }
    await t.close();

    // ---------------------------------------------------------------- prerequisites
    const p = await openTab(b, url('usa-text-splitter'));
    await p.ev(READY);
    await check('missing-prereq', async () => {
      const code = await p.ev(getCode);
      const without = code.split('\n').filter((l) => !/runtime\/text\.iife\.js/.test(l)).join('\n');
      if (without === code) return 'sample has no runtime/text script';
      await p.ev(setCode(without)); await p.ev(click('#run'));
      const x = await until(async () => { const v = await p.ev(problems); return /motionary\/runtime\/text/.test(v) && /runtime\/text\.iife\.js/.test(v) ? v : null; }, 8000);
      return typeof x === 'string' ? true : 'no concrete fix shown for the missing prerequisite: ' + JSON.stringify(await p.ev(problems));
    });
    if (SHOTS) await p.shot('desktop-1280-missing-prereq');
    await p.close();

    // ---------------------------------------------------------------- HTML pages that need ES modules
    await check('module-samples', async () => {
      const bad = [];
      for (const tag of ['usa-snap-carousel', 'usa-dotlottie', 'usa-auto-animate', 'usa-toaster']) {
        const x = await openTab(b, url(tag));
        try {
          await x.ev(READY);
          const r = await until(async () => { const msg = await x.ev(`document.getElementById('msg').textContent`); return /^Ran/.test(msg) ? { msg, p: await x.ev(problems) } : null; }, 12000);
          if (!r || typeof r !== 'object') { bad.push(`${tag}: did not finish`); continue; }
          if (/not registered|resolve module specifier|bare import|No CDN bundle/i.test(r.p)) bad.push(`${tag}: ${r.p.slice(0, 160)}`);
          const reg = await x.frameEv(`!!customElements.get(${JSON.stringify(tag)})`);
          if (!reg) bad.push(`${tag}: not registered in the preview`);
        } finally { await x.close(); }
      }
      return bad.length ? bad.join(' ; ') : true;
    });

    // ---------------------------------------------------------------- npm + bundler tab
    const e = await openTab(b, url('usa-reveal'));
    await e.ev(READY);
    await e.ev(click('[role=tab][data-k=esm]')); await sleep(150);
    const esm = await e.ev(getCode);
    await check('esm-run', async () => {
      const ed = esm.replace('<h2>Hello</h2>', '<h2 id="esm-edited">From the npm tab</h2>');
      if (ed === esm) return 'npm sample has no markup to edit';
      await e.ev(setCode(ed)); await e.ev(click('#run'));
      const r = await until(() => e.frameEv(`(() => { const h = document.getElementById('esm-edited'); return h && customElements.get('usa-reveal') ? h.textContent : null; })()`));
      return r === 'From the npm tab' ? true : 'npm tab edit not run: ' + JSON.stringify(r);
    });
    await check('esm-unknown', async () => {
      await e.ev(setCode("import 'motionary/does-not-exist';\n" + esm)); await e.ev(click('#run'));
      const x = await until(async () => { const v = await e.ev(problems); return /motionary\/does-not-exist/.test(v) ? v : null; }, 8000);
      return typeof x === 'string' ? true : 'unknown import not explained';
    });
    if (SHOTS) { await e.ev(setCode(esm)); await e.ev(click('#run')); await sleep(1200); await e.shot('desktop-1280-npm'); }
    await e.close();

    // ---------------------------------------------------------------- mobile 390 px
    const mo = await openTab(b, url('usa-reveal'), { width: 390, height: 844, mobile: true });
    await mo.ev(READY);
    await check('mobile', async () => {
      await sleep(500);
      const m = await mo.ev(`(() => {
        const vw = document.documentElement.clientWidth, sw = document.scrollingElement.scrollWidth;
        const ctrls = ['#q', '#run', '#copy', '#download', '[role=tab][data-k=html]', '[role=tab][data-k=esm]', '#code', '#preview'].map((s) => { const r = document.querySelector(s).getBoundingClientRect(); return { s, w: r.width, h: r.height, left: r.left, right: r.right }; });
        const fs = parseFloat(getComputedStyle(document.getElementById('code')).fontSize);
        const a = document.getElementById('deps').getBoundingClientRect(), h = document.querySelector('header h1').getBoundingClientRect();
        const overlap = !(a.right <= h.left || a.left >= h.right || a.bottom <= h.top || a.top >= h.bottom);
        return { vw, sw, ctrls, fs, overlap, list: document.getElementById('list').getBoundingClientRect().height };
      })()`);
      const bad = m.ctrls.filter((c) => c.w < 1 || c.left < -1 || c.right > m.vw + 1 || (/#(run|copy|download)|role=tab/.test(c.s) && c.h < 36));
      if (m.sw > m.vw + 1) return `horizontal scroll: ${m.sw} > ${m.vw}`;
      if (bad.length) return 'controls off-screen or too small: ' + JSON.stringify(bad);
      if (m.overlap) return 'the prerequisites badge covers the page title';
      if (m.list > 260) return `component list is ${Math.round(m.list)} px tall — the editor starts below the fold`;
      if (m.fs < 16) return `editor font ${m.fs}px < 16px (iOS zooms the page on focus)`;
      await mo.shot('mobile-390-top');
      await mo.ev(`document.getElementById('code').scrollIntoView({ block: 'start' })`); await mo.shot('mobile-390-editor');
      const code = await mo.ev(getCode);
      await mo.ev(setCode(code.replace('<h2>Hello</h2>', '<h2 id="m">Mobile edit</h2>'))); await mo.ev(click('#run'));
      const r = await until(() => mo.frameEv(`(document.getElementById('m') || {}).textContent || null`));
      await mo.ev(`document.getElementById('preview').scrollIntoView({ block: 'start' })`); await sleep(600); await mo.shot('mobile-390-preview');
      return r === 'Mobile edit' ? true : 'Run on mobile did not show the edit';
    });
    await mo.close();
  } finally { b.close(); srv.close(); }

  console.log('| check | result |\n|---|---|');
  for (const r of results) console.log(`| ${r.name} | ${r.ok ? '✅' : '❌ ' + r.detail.replace(/\|/g, '/').slice(0, 300)} |`);
  if (SHOTS) console.log('screenshots: ' + SHOTS);
  const failed = results.filter((r) => !r.ok);
  if (failed.length) { console.error(`❌ playground — ${failed.length} of ${results.length} checks failed`); process.exit(1); }
  console.log(`✅ playground — ${results.length} checks passed`);
}

if (process.argv[1] && import.meta.url.startsWith('file:') && fileURLToPath(import.meta.url) === process.argv[1]) main().catch((e) => { console.error('❌ playground:', e.message); process.exit(1); });
