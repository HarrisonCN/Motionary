// motionary-mcp 13.2 — validate_snippet { browser: true }: run the snippet in a real headless browser (Playwright, optional peer)
// instead of jsdom. jsdom stays the default for { mount: true }; this is the opt-in, slower and more faithful check.
//   • HTML snippets run as a whole document, their own scripts included. CDN URLs for motionary / use-scroll-animate
//     (unpkg, jsDelivr, any version) are served from the local build, so the snippet runs against the package under test.
//   • ESM snippets (npm + bundler style) run as a module behind an import map that resolves every `motionary/*` subpath the
//     way package.json `exports` names it; the markup comes from the snippet's `/* HTML: … */` block.
//   • JSX / Vue / Svelte / Solid / Angular need their compiler, so only their markup is mounted (with the prerequisites the
//     snippet registers, loaded in the right order) — `run: 'markup'` says so. Real framework builds: scripts/build-examples.mjs.
// Every other network request is blocked (an official runtime the snippet loads from a CDN is reported, not fetched).
// Then the same contract checks as the jsdom mount run in the page: defined + upgraded, observed attributes, event names,
// plus uncaught errors / rejections and motionary console errors from the real run.
import { readFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { markupOf, listenedEvents, LEGACY_EVENTS_12 } from './mcp-mount.mjs';

const ORIGIN = 'http://motionary.test';
const TYPES = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.cjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.wasm': 'application/wasm', '.svg': 'image/svg+xml', '.png': 'image/png' };
const CDN = /^https?:\/\/(?:unpkg\.com|cdn\.jsdelivr\.net\/npm)\/(?:motionary|use-scroll-animate)(?:@[^/]+)?\/dist\/([^?#]+)/;
const GLOBAL = new Set(['class', 'id', 'style', 'role', 'slot', 'hidden', 'tabindex', 'title', 'lang', 'dir', 'part', 'is', 'inert', 'nonce', 'popover', 'translate', 'draggable', 'contenteditable', 'autofocus', 'key', 'ref', 'classname']);

/** How a snippet can run in a browser: 'document' (HTML), 'module' (ESM + bundler) or 'markup' (needs a framework compiler). */
export function snippetKind(code) {
  const s = String(code || '');
  const noBlock = s.replace(/\/\*[\s\S]*?\*\//g, '');
  const startsWithImport = /^\s*(?:\/\/[^\n]*\n\s*)*import[\s{*'"]/.test(noBlock);
  const framework = /<script\s+setup|<template[\s>]|\bexport\s+(?:default\s+)?(?:function|class)\b|@Component\(|className=|\sattr:[\w-]+=|=\{|<script(?![^>]*\b(?:src|type)=)[^>]*>[\s\S]*?\bimport\s/.test(s);
  if (framework) return 'markup';
  if (startsWithImport) return /<[a-z][\w-]*[\s>/]/i.test(noBlock) ? 'markup' : 'module';
  return /<[a-z!]/i.test(s) ? 'document' : 'markup';
}

/** package.json `exports` → import map entries ('motionary/runtime' → '/dist/runtime.js'). */
export function exportsToImports(exports, base = '/dist/') {
  const map = {};
  for (const [k, v] of Object.entries(exports || {})) {
    const t = typeof v === 'string' ? v : v && (v.import ? (typeof v.import === 'string' ? v.import : v.import.default) : v.default);
    if (typeof t === 'string' && t.startsWith('./dist/') && /\.m?js$/.test(t)) map[k === '.' ? 'motionary' : 'motionary/' + k.slice(2)] = base + t.slice(7);
  }
  return map;
}

/** Playwright from the user's project: playwright, playwright-core or @playwright/test (all optional). */
export async function loadPlaywright() {
  for (const id of ['playwright', 'playwright-core', '@playwright/test']) {
    try {
      const mod = await import(id);
      const pw = mod.chromium ? mod : mod.default;
      if (pw && pw.chromium) return pw;
    } catch { /* next */ }
  }
  throw new Error('playwright is not installed');
}

const esc = (s) => String(s).replace(/</g, '\\u003c');

function pageFor(kind, code, { imports, runtimeIds, bundles }) {
  if (kind === 'document') {
    const s = String(code);
    return /<html|<!doctype/i.test(s) ? s : `<!doctype html><html lang="en"><head><meta charset="utf-8"></head><body>\n${s}\n</body></html>`;
  }
  const head = ['<!doctype html><html lang="en"><head><meta charset="utf-8">'];
  let body = '';
  if (kind === 'module') {
    const html = (String(code).match(/\/\*\s*(?:then use it in your )?HTML:?\s*\n?([\s\S]*?)\*\//i) || [])[1] || markupOf(code);
    head.push(`<script type="importmap">${esc(JSON.stringify({ imports }))}</script>`);
    body = `${html}\n<script type="module">\n${String(code).replace(/\/\*[\s\S]*?\*\//g, '')}\n</script>`;
  } else {
    if (runtimeIds.length) { head.push(`<script src="/dist/runtime.iife.js"></script>`); for (const r of runtimeIds) if (r !== 'core') head.push(`<script src="/dist/runtime/${r}.iife.js"></script>`); }
    for (const b of bundles) head.push(`<script src="/dist/${b}"></script>`);
    body = markupOf(code);
  }
  return `${head.join('\n')}</head><body>\n${body}\n</body></html>`;
}

/**
 * Run and check. Returns { mounted, environment, run, components:[{tag, defined, upgraded}], errors, warnings, blocked }
 * or { mounted:false, skipped }. opts: distDir, findComponent, runtimeIds, browser (a launched Playwright browser to reuse),
 * browserName ('chromium' | 'firefox' | 'webkit'), executablePath, loadPlaywright, settle (ms after load, default 400).
 */
export async function runSnippet(m, code, opts = {}) {
  const { distDir, findComponent, runtimeIds = [], settle = 400 } = opts;
  if (!distDir || !existsSync(join(distDir, 'components.umd.js'))) return { mounted: false, skipped: `no built bundles in ${distDir} — run npm run build` };
  let browser = opts.browser, own = false;
  if (!browser) {
    let pw;
    try { pw = await (opts.loadPlaywright || loadPlaywright)(); } catch {
      return { mounted: false, skipped: 'playwright is not installed — `npm i -D playwright && npx playwright install chromium` (optional peer) to run snippets in a real browser; the static checks still ran' };
    }
    const name = opts.browserName || process.env.MOTIONARY_BROWSER || 'chromium';
    const executablePath = opts.executablePath || process.env.MOTIONARY_BROWSER_PATH || (name === 'chromium' ? process.env.CHROME_PATH : undefined) || undefined;
    try { browser = await pw[name].launch({ headless: true, ...(executablePath ? { executablePath } : {}) }); own = true; } catch (e) {
      return { mounted: false, skipped: `playwright could not start ${name}: ${String(e.message || e).split('\n')[0]} — \`npx playwright install ${name}\`; the static checks still ran` };
    }
  }
  const pkgFile = join(distDir, '..', 'package.json');
  const pkg = existsSync(pkgFile) ? JSON.parse(readFileSync(pkgFile, 'utf8')) : { exports: {} };
  const kind = snippetKind(code);
  const markup = markupOf(code);
  const tags = [...new Set([...(kind === 'document' ? String(code) : markup).matchAll(/<(usa-[a-z0-9-]+)/gi)].map((x) => x[1].toLowerCase()))];
  const widgets = tags.some((t) => /widgets\.umd/.test((findComponent && findComponent(m, t) || {}).cdn || ''));
  const html = pageFor(kind, code, { imports: exportsToImports(pkg.exports), runtimeIds, bundles: ['components.umd.js', ...(widgets ? ['widgets.umd.js'] : [])] });
  const errors = [], warnings = [], blocked = [], seen = new Set();
  const note = (list, msg) => { if (!seen.has(msg)) { seen.add(msg); list.push(msg); } };
  const context = await browser.newContext({ reducedMotion: 'no-preference', viewport: { width: 1024, height: 768 } });
  try {
    await context.route('**/*', async (route) => {
      const url = route.request().url();
      if (url === `${ORIGIN}/`) return route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: html });
      let file = null;
      if (url.startsWith(`${ORIGIN}/dist/`)) file = url.slice(ORIGIN.length + 6).split(/[?#]/)[0];
      else { const c = url.match(CDN); if (c) file = c[1]; }
      if (file != null) {
        const p = join(distDir, file);
        if (existsSync(p)) return route.fulfill({ status: 200, contentType: TYPES[extname(p)] || 'application/octet-stream', body: readFileSync(p), headers: { 'access-control-allow-origin': '*' } });
        return route.fulfill({ status: 404, body: '' });
      }
      if (/^(data|blob):/.test(url)) return route.continue();
      const type = route.request().resourceType();
      if (type === 'script' || type === 'fetch' || type === 'xhr') blocked.push(url);
      return route.abort('blockedbyclient');
    });
    const page = await context.newPage();
    page.on('pageerror', (e) => note(errors, `run: ${String(e.message || e).split('\n')[0]}`));
    page.on('console', (msg) => {
      const t = msg.text();
      if (msg.type() === 'error') {
        if (/Failed to load resource|net::ERR_BLOCKED|blockedbyclient/i.test(t)) return;
        if (/\[motionary\]|requires motionary|Error|error/.test(t)) note(errors, `run: ${t.split('\n')[0]}`);
      } else if (msg.type() === 'warning' && /\[motionary\]/.test(t) && !/lacks .* motionary 5\.0 requires/.test(t)) note(warnings, `run: ${t.split('\n')[0]}`);
    });
    await page.addInitScript(() => { addEventListener('unhandledrejection', (e) => console.error('Unhandled rejection: ' + ((e.reason && e.reason.message) || e.reason))); });
    await page.goto(`${ORIGIN}/`, { waitUntil: 'load', timeout: 20000 });
    await page.waitForTimeout(settle);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    const rows = await page.evaluate((list) => list.map((tag) => {
      const ctor = customElements.get(tag), el = document.querySelector(tag);
      return { tag, defined: !!ctor, upgraded: !!(ctor && el instanceof ctor), observed: ctor ? (ctor.observedAttributes || []).map(String) : [], attrs: el ? el.getAttributeNames() : [] };
    }), tags);
    const components = [];
    for (const row of rows) {
      components.push({ tag: row.tag, defined: row.defined, upgraded: row.upgraded });
      const c = findComponent ? findComponent(m, row.tag) : null;
      if (!c) continue;
      if (!row.defined) { note(errors, `<${row.tag}> was never defined in the page — ${kind === 'markup' ? `import it from '${c.import.path}' and call ${c.import.define}()` : `load ${/widgets\.umd/.test(c.cdn) ? 'widgets.umd.js' : 'components.umd.js'} or call ${c.import.define}()`}`); continue; }
      if (!row.upgraded) note(errors, `<${row.tag}> is defined but the element in the page did not upgrade`);
      const observed = new Set(row.observed.map((a) => a.toLowerCase()));
      for (const a of row.attrs) {
        const k = a.toLowerCase();
        if (GLOBAL.has(k) || k.startsWith('data-') || k.startsWith('aria-') || k.startsWith('on') || /[:@()]/.test(k)) continue;
        if ((c.attributes || []).includes(k) && !observed.has(k)) note(warnings, `<${row.tag} ${k}>: the element reads "${k}" but does not observe it — set it before mount; changing it later has no effect (contract exemption)`);
      }
    }
    const used = components.map((x) => findComponent && findComponent(m, x.tag)).filter(Boolean);
    const emitted = new Set(used.flatMap((c) => c.events || []));
    for (const ev of listenedEvents(code)) {
      if (LEGACY_EVENTS_12[ev]) note(errors, `event "${ev}" was removed in 12.0 — listen to "${LEGACY_EVENTS_12[ev]}" (npx usa-codemod-12 --write)`);
      else if (ev.startsWith('usa:') && used.length && !emitted.has(ev)) note(warnings, `no component in this snippet emits "${ev}" (they emit: ${[...emitted].join(', ') || 'no usa:* events'})`);
    }
    for (const u of [...new Set(blocked)]) note(warnings, `network request blocked: ${u} (the validation browser is offline; an official runtime from a CDN is not fetched)`);
    return { mounted: true, environment: `${browser.browserType().name()} ${browser.version()}`, run: kind, components, errors, warnings, blocked: [...new Set(blocked)] };
  } finally {
    await context.close().catch(() => {});
    if (own) await browser.close().catch(() => {});
  }
}

export const PAGE_ORIGIN = ORIGIN;
