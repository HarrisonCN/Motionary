// motionary-mcp 12.2 — validate_snippet { mount: true }: mount the snippet's markup in a headless DOM (jsdom, optional peer) with the
// real Motionary bundles, then check what actually happened against the component contract (docs/component-contract.md):
//   • every <usa-*> tag is defined by the bundles and upgrades without throwing
//   • missing prerequisites surface as the components' own errors ("requires motionary/runtime/…"), not a guess
//   • attributes the snippet sets are ones the element observes (changes after mount are applied)
//   • event names the snippet listens to are ones the used components emit (usa:* names; legacy names removed in 12.0)
// The snippet's own <script> code is never executed: only its markup is mounted, plus the library bundles it loads.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export const LEGACY_EVENTS_12 = { 'usa-beat': 'usa:beat', 'usa-audio-error': 'usa:audio-error', 'usa-player-ready': 'usa:ready', 'usa-player-finish': 'usa:finish', 'usa-story-step': 'usa:step' };
const GLOBAL = new Set(['class', 'id', 'style', 'role', 'slot', 'hidden', 'tabindex', 'title', 'lang', 'dir', 'part', 'is', 'inert', 'nonce', 'popover', 'translate', 'draggable', 'contenteditable', 'autofocus', 'key', 'ref', 'classname']);

/** Event names a snippet listens to: addEventListener('x'), Vue @x / v-on:x, Angular (x), Svelte on:x, JSX onX={…} is ignored (props). */
export function listenedEvents(code) {
  const s = String(code || ''), out = new Set();
  for (const r of [/addEventListener\(\s*['"`]([\w:.-]+)['"`]/g, /\s(?:@|v-on:)([\w:.-]+)\s*=/g, /\s\(([\w:.-]+)\)\s*=/g, /\son:([\w:.-]+)\s*=/g]) for (const m of s.matchAll(r)) out.add(m[1]);
  return [...out];
}

/** Markup to mount: an HTML snippet without its scripts, or — for ESM / JSX / Vue / Svelte — one element per <usa-*> opening tag. */
export function markupOf(code) {
  const s = String(code || '');
  const html = s.replace(/<script\b[\s\S]*?<\/script>/gi, '');
  const looksHtml = /<usa-[a-z0-9-]+[\s>]/i.test(html) && !/\bimport\s|\bexport\s|=\{|\{\{|className=/.test(html);
  if (looksHtml) return html;
  return [...s.matchAll(/<(usa-[a-z0-9-]+)((?:\s+[a-zA-Z_][\w.-]*(?:\s*=\s*(?:"[^"]*"|'[^']*'))?)*)\s*\/?>/gi)].map(([, t, a]) => `<${t}${a}></${t}>`).join('\n');
}

const stub = (w, reduce) => {
  w.matchMedia = (q) => ({ matches: /prefers-reduced-motion:\s*reduce/.test(q) ? reduce : false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false });
  for (const n of ['IntersectionObserver', 'ResizeObserver', 'MutationObserver']) if (!w[n]) w[n] = class { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } };
  const anim = () => ({ finished: Promise.resolve(), ready: Promise.resolve(), cancel() {}, finish() {}, play() {}, pause() {}, reverse() {}, commitStyles() {}, persist() {}, updatePlaybackRate() {}, addEventListener() {}, removeEventListener() {}, currentTime: 0, playState: 'finished', effect: null, onfinish: null, oncancel: null });
  if (!w.Element.prototype.animate) w.Element.prototype.animate = anim;
  if (!w.Element.prototype.getAnimations) w.Element.prototype.getAnimations = () => [];
  if (!w.document.getAnimations) w.document.getAnimations = () => [];
  w.HTMLCanvasElement.prototype.getContext = () => null;
  if (!w.CSSStyleSheet.prototype.replaceSync) w.CSSStyleSheet.prototype.replaceSync = function () {};
};

/** Mount and check. Returns { mounted, environment, components:[{tag, defined, upgraded}], errors, warnings } or { mounted:false, skipped }. */
export async function mountSnippet(m, code, { distDir, findComponent, runtimeIds = [], bundles, loadJsdom = () => import('jsdom') } = {}) {
  let JSDOM, VirtualConsole;
  try {
    ({ JSDOM, VirtualConsole } = await loadJsdom());
  } catch {
    return { mounted: false, skipped: 'jsdom is not installed — `npm i -D jsdom` (optional peer) to mount snippets; the static checks still ran' };
  }
  const errors = [], warnings = [], seen = new Set();
  const note = (list, msg) => { if (!seen.has(msg)) { seen.add(msg); list.push(msg); } };
  const vc = new VirtualConsole();
  vc.on('jsdomError', (e) => { const t = String((e && (e.detail?.message || e.detail || e.message)) || e); if (!/Not implemented/.test(t)) note(errors, `mount: ${t.split('\n')[0]}`); });
  vc.on('error', (...a) => { const t = a.map(String).join(' '); if (/\[motionary\]|requires motionary|Error/.test(t)) note(errors, `mount: ${t.split('\n')[0]}`); });
  vc.on('warn', (...a) => { const t = a.map(String).join(' '); if (/\[motionary\]/.test(t) && !/lacks .* motionary 5\.0 requires/.test(t)) note(warnings, `mount: ${t.split('\n')[0]}`); });
  const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://localhost/', virtualConsole: vc });
  const w = dom.window;
  try {
    stub(w, false);
    const load = (f) => { const p = f.startsWith('/') ? f : join(distDir, f); if (existsSync(p)) { try { w.eval(readFileSync(p, 'utf8')); } catch (e) { note(errors, `mount: ${f} threw while loading: ${String(e.message || e).split('\n')[0]}`); } return true; } return false; };
    // prerequisites the snippet itself loads, in the order a correct page loads them
    if (runtimeIds.length) { load('runtime.iife.js'); for (const r of runtimeIds) if (r !== 'core') load(`runtime/${r}.iife.js`); }
    const markup = markupOf(code);
    const tags = [...new Set([...markup.matchAll(/<(usa-[a-z0-9-]+)/gi)].map((x) => x[1].toLowerCase()))];
    if (bundles) for (const b of bundles) load(b);
    else {
      if (!load('components.umd.js')) return { mounted: false, skipped: `no built bundles in ${distDir} — run npm run build` };
      if (tags.some((t) => !w.customElements.get(t))) load('widgets.umd.js');
    }
    w.document.body.innerHTML = markup;
    await new Promise((r) => w.setTimeout(r, 30));
    await new Promise((r) => w.setTimeout(r, 0));
    const components = [];
    for (const tag of tags) {
      const ctor = w.customElements.get(tag), el = w.document.querySelector(tag);
      const c = findComponent ? findComponent(m, tag) : null;
      const row = { tag, defined: !!ctor, upgraded: !!(ctor && el instanceof ctor) };
      components.push(row);
      if (!c) continue; // unknown tags are reported by the static pass
      if (!ctor) { note(warnings, `<${tag}> is not in the no-build bundles (components.umd.js / widgets.umd.js) — mounted checks skipped; import it from '${c.import.path}'`); continue; }
      const observed = new Set((ctor.observedAttributes || []).map((a) => String(a).toLowerCase()));
      for (const a of el ? el.getAttributeNames() : []) {
        const k = a.toLowerCase();
        if (GLOBAL.has(k) || k.startsWith('data-') || k.startsWith('aria-') || k.startsWith('on') || /[:@()]/.test(k)) continue;
        if ((c.attributes || []).includes(k) && !observed.has(k)) note(warnings, `<${tag} ${k}>: the element reads "${k}" but does not observe it — set it before mount; changing it later has no effect (contract exemption)`);
      }
    }
    // events: legacy names are gone in 12.0; usa:* names must be emitted by a component the snippet uses
    const used = components.map((x) => findComponent && findComponent(m, x.tag)).filter(Boolean);
    const emitted = new Set(used.flatMap((c) => c.events || []));
    for (const ev of listenedEvents(code)) {
      if (LEGACY_EVENTS_12[ev]) note(errors, `event "${ev}" was removed in 12.0 — listen to "${LEGACY_EVENTS_12[ev]}" (npx usa-codemod-12 --write)`);
      else if (ev.startsWith('usa:') && used.length && !emitted.has(ev)) note(warnings, `no component in this snippet emits "${ev}" (they emit: ${[...emitted].join(', ') || 'no usa:* events'})`);
    }
    return { mounted: true, environment: 'jsdom', components, errors, warnings };
  } finally {
    w.close();
  }
}
