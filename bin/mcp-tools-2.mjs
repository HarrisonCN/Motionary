// motionary-mcp 2.1 (13.7) — "AI tools 2.0": versioned result schemas, compatibility checks and auto-fix suggestions.
// Pure functions over the AI manifest; no dependencies, no network, never writes files. The catalog helpers
// (findComponent, searchComponents, validateSnippet, cdnImports …) are passed in by bin/motionary-mcp.mjs.
import { transform as codemod13 } from './usa-codemod-13.mjs';
import { compatAt, cmpVer } from './compat-history.mjs';

/** Result schema versions of the 13.7 tools (bumped on any incompatible change; fields are only ever added within a major). */
export const SCHEMAS = { search: 'motionary-mcp/search@1', compatibility: 'motionary-mcp/check_compatibility@1', validation: 'motionary-mcp/validate_snippet@1', fix: 'motionary-mcp/suggest_fix@1', scene: 'motionary-mcp/validate_scene@1', listTemplates: 'motionary-mcp/list_templates@1', getTemplate: 'motionary-mcp/get_template@1', exportScene: 'motionary-mcp/export_scene@1' };

export function levenshtein(a, b) {
  a = String(a); b = String(b);
  if (a === b) return 0;
  const p = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = p[0]; p[0] = i;
    for (let j = 1; j <= b.length; j++) { const t = p[j]; p[j] = Math.min(p[j] + 1, p[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = t; }
  }
  return p[b.length];
}
const near = (w, x) => { if (w.length < 4 || x.length < 3) return false; const d = levenshtein(w, x); return d <= (w.length >= 7 ? 2 : 1); };

/** 13.7 ranking: exact tag (as typed, with or without usa-, spaces or hyphens) first, then exact tag segment / keyword /
 *  category, then substring matches, then typo-tolerant (fuzzy) matches; ties break on the tag name, so results are stable. */
export function rankComponents(m, query) {
  const q = String(query || '').toLowerCase().trim().replace(/^<|\/?>$/g, '');
  const words = q.split(/[^a-z0-9\u00c0-\uffff-]+/).filter(Boolean);
  if (!words.length) return [];
  const joined = 'usa-' + q.replace(/^usa-/, '').split(/[\s_]+/).filter(Boolean).join('-');
  return m.components.map((c) => {
    const tag = c.tag, segs = tag.slice(4).split('-'), title = String(c.title || '').toLowerCase(), kws = (c.keywords || []).map((k) => String(k).toLowerCase()), kw = kws.join(' '), desc = String(c.description || '').toLowerCase(), cat = String(c.category || '').toLowerCase();
    let s = tag === joined ? 100 : 0;
    for (const w0 of words) {
      const w = w0.replace(/^usa-/, '');
      let hit = false;
      if (tag === `usa-${w}`) { s += 20; hit = true; } else if (segs.includes(w)) { s += 10; hit = true; } else if (tag.includes(w)) { s += 8; hit = true; }
      if (title.includes(w)) { s += 6; hit = true; }
      if (kws.includes(w)) { s += 7; hit = true; } else if (kw.includes(w)) { s += 5; hit = true; }
      if (cat === w) { s += 4; hit = true; }
      if (desc.includes(w)) { s += 2; hit = true; }
      if ((c.attributes || []).includes(w)) { s += 1; hit = true; }
      if (!hit) s += segs.some((x) => near(w, x) || (w.length >= 4 && x.startsWith(w))) ? 6 : kws.some((x) => near(w, x)) || title.split(/\W+/).some((x) => near(w, x)) ? 3 : 0;
    }
    return { c, s };
  }).filter((x) => x.s > 0).sort((a, b) => b.s - a.s || a.c.tag.localeCompare(b.c.tag));
}

// ---------------------------------------------------------------- check_compatibility
export const FRAMEWORK_NOTES = {
  html: 'CDN <script> tags or a <script type="module"> — no build step',
  esm: 'npm + any bundler (Vite, webpack, Rollup, esbuild)',
  react: 'React 19 passes attributes and properties to custom elements natively; React 18 sets attributes only (set object properties / listen to usa:* events through a ref)',
  vue: 'Vue 3: compilerOptions.isCustomElement = (t) => t.startsWith("usa-")',
  svelte: 'Svelte 4 / 5: custom elements work as-is',
  solid: 'Solid: use attr:name for attributes (Solid sets properties otherwise)',
  angular: 'Angular 15+: schemas: [CUSTOM_ELEMENTS_SCHEMA] on the standalone component',
};
// Engines the browser suite runs every component in on each PR (docs/browser-matrix.md, 13.1) and the web-platform
// features some components need beyond the Custom Elements + Shadow DOM baseline (with the fallback they use without them).
export const ENGINES = ['chromium', 'firefox', 'webkit'];
const BASELINE = { chrome: '90', edge: '90', firefox: '90', safari: '15' };
const FEATURES = [
  { id: 'webgl2', test: (c) => c.requires.some((r) => /^(gl|format-gltf|gltf-anim|gltf-decoders|format-obj)$/.test(r)) || /^usa-gl-/.test(c.tag), note: 'WebGL2 — without it the element renders nothing and reports data-backend="none"', fallback: 'none' },
  { id: 'webgl', test: (c) => /^usa-(shader|distort|liquid|post-fx)$/.test(c.tag), note: 'WebGL — falls back to a CSS / canvas2d rendering', fallback: 'css' },
  { id: 'web-audio', test: (c) => /^usa-(equalizer|audio|waveform|voice-button)/.test(c.tag) || c.requires.includes('audio'), note: 'Web Audio — silent / static bars without it', fallback: 'static' },
  { id: 'scroll-timeline', test: (c) => c.requires.includes('scroll'), note: 'scroll-driven animations — uses its own scroll scenes where animation-timeline is missing', fallback: 'js' },
];

/** Framework, version and browser support for components (or a whole snippet), from the manifest. */
export function checkCompatibility(m, a, { findComponent, installedVersion, validateSnippet }) {
  const version = a.version || installedVersion() || m.version;
  let tags = (a.tags || []).slice();
  if (a.code) tags.push(...validateSnippet(m, a.code).components);
  tags = [...new Set(tags)];
  if (!tags.length) throw new Error('give tags or code');
  const framework = a.framework ? String(a.framework).toLowerCase() : null;
  if (framework && !FRAMEWORK_NOTES[framework]) throw new Error(`framework must be one of ${Object.keys(FRAMEWORK_NOTES).join(', ')}`);
  const browsers = (a.browsers || []).map((b) => String(b).toLowerCase());
  const issues = [];
  const components = tags.map((t) => {
    const c = findComponent(m, t);
    if (!c) { issues.push({ tag: t, level: 'error', message: `unknown component ${t} — use search_components` }); return { tag: t, known: false }; }
    const at = compatAt(c, version);
    const features = FEATURES.filter((f) => f.test(c)).map(({ id, note, fallback }) => ({ id, note, fallback }));
    if (!at.available) issues.push({ tag: c.tag, level: 'error', message: `<${c.tag}> needs motionary ${c.since} (you have ${version}) — npm i motionary@${m.version}` });
    for (const ch of at.changedAfter || []) issues.push({ tag: c.tag, level: 'warning', message: `<${c.tag}> changed in ${ch} (after ${version}) — see the CHANGELOG` });
    if (c.stability === 'deprecated') issues.push({ tag: c.tag, level: 'warning', message: `<${c.tag}> is deprecated${c.deprecated?.use ? ` — use ${c.deprecated.use}` : ''}` });
    const peer = (c.prerequisites && c.prerequisites.install) || null;
    for (const b of browsers) {
      const eng = /chrom|edge|chrome/.test(b) ? 'chromium' : /firefox|gecko/.test(b) ? 'firefox' : /safari|webkit|ios/.test(b) ? 'webkit' : null;
      if (!eng) issues.push({ tag: c.tag, level: 'warning', message: `${b}: not covered by the browser suite (Chromium, Firefox, WebKit)` });
      for (const f of features) if (f.fallback === 'none') issues.push({ tag: c.tag, level: 'warning', message: `${b}: <${c.tag}> needs ${f.id}; where the GPU / driver lacks it nothing is drawn` });
    }
    return {
      tag: c.tag, known: true, since: c.since || null, available: at.available, changedAfter: at.changedAfter || [], stability: c.stability || 'stable',
      frameworks: Object.fromEntries(Object.entries(FRAMEWORK_NOTES).filter(([k]) => !framework || k === framework).map(([k, note]) => [k, { supported: true, note }])),
      browsers: { tested: ENGINES, minimum: BASELINE, features },
      prerequisites: (c.requires || []).slice(), ...(peer ? { install: peer } : {}),
    };
  });
  return { schema: SCHEMAS.compatibility, version, catalog: m.version, behind: cmpVer(version, m.version) < 0, compatible: !issues.some((i) => i.level === 'error'), components, issues };
}

// ---------------------------------------------------------------- suggest_fix
const lineOf = (src, i) => src.slice(0, Math.max(0, i)).split('\n').length;
const GLOBAL = new Set(['id', 'class', 'style', 'slot', 'hidden', 'title', 'lang', 'dir', 'tabindex', 'role', 'part', 'is', 'key', 'ref', 'classname', 'inert', 'draggable', 'contenteditable', 'exportparts', 'nonce', 'autofocus', 'popover', 'translate', 'spellcheck', 'accesskey', 'enterkeyhint', 'inputmode']);

/** Concrete patch suggestions for code using <usa-*> components: wrong tag names, unknown (mistyped / deprecated)
 *  attributes, components used but never imported / defined, bare `motionary/…` imports in a CDN page, missing
 *  runtime prerequisites, import paths / event names / CDN pins removed in 13.0 (the usa-codemod-13 tables).
 *  Each fix is { kind, message, line, patch: { find, replace } }; `fixed` is the code with every patch applied. */
export function suggestFix(m, code, opts, h) {
  const { findComponent, cdnImports, validateSnippet } = h;
  let src = String(code || '');
  const fixes = [];
  const add = (kind, message, find, replace, at) => { if (find && find !== replace && !fixes.some((f) => f.patch.find === find && f.patch.replace === replace)) fixes.push({ kind, message, line: lineOf(String(code || ''), at ?? String(code || '').indexOf(find)), patch: { find, replace } }); };
  const context = opts.context || (/<html|<script\b|unpkg\.com|jsdelivr\.net/i.test(src) ? 'cdn' : /\bimport\s/.test(src) ? 'esm' : 'html');
  // 1. unknown tags → closest tag (open + close)
  for (const mm of src.matchAll(/<(usa-[a-z0-9-]+)/gi)) {
    const t = mm[1].toLowerCase();
    if (findComponent(m, t)) continue;
    const best = m.components.map((k) => [k.tag, levenshtein(t, k.tag)]).sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]))[0];
    const rank = h.searchComponents(m, t.slice(4).replace(/-/g, ' '), 1)[0];
    const to = best && best[1] <= Math.max(2, Math.floor(t.length / 4)) ? best[0] : rank?.tag;
    if (to) { add('unknown-tag', `<${t}> is not a Motionary component — did you mean <${to}>?`, `<${mm[1]}`, `<${to}`, mm.index); add('unknown-tag', `closing tag of <${t}>`, `</${mm[1]}>`, `</${to}>`); }
  }
  // later passes look at the code with the tag names already fixed (patches are applied in order)
  for (const f of fixes) src = src.split(f.patch.find).join(f.patch.replace);
  // 2. unknown attributes → closest attribute of that component (typos and renamed / deprecated attributes)
  for (const mm of src.matchAll(/<(usa-[a-z0-9-]+)([^>]*)>/gi)) {
    const c = findComponent(m, mm[1]);
    if (!c || !(c.attributes || []).length) continue;
    const dep = (m.deprecatedAttributes || {})[c.tag] || {};
    for (const am of mm[2].replace(/=\s*("[^"]*"|'[^']*')/g, (q) => q.replace(/[^\s="']/g, 'x').replace(/\s/g, '_')).matchAll(/(?:^|\s)([a-zA-Z_][\w-]*)(?=\s*=|\s|\/?$)/g)) {
      const a = am[1].toLowerCase();
      if (GLOBAL.has(a) || a.startsWith('data-') || a.startsWith('aria-') || a.startsWith('on') || c.attributes.includes(a)) continue;
      const to = dep[a] || c.attributes.map((x) => [x, levenshtein(a, x)]).filter(([, d]) => d <= 2).sort((p, q) => p[1] - q[1])[0]?.[0];
      if (!to) continue;
      const whole = mm[0], fixed = whole.replace(new RegExp(`(\\s)${am[1]}(?=[\\s=/>])`), `$1${to}`);
      add(dep[a] ? 'deprecated-attribute' : 'unknown-attribute', dep[a] ? `<${c.tag}> attribute "${a}" is deprecated — use "${to}"` : `<${c.tag}> has no attribute "${a}" — did you mean "${to}"?`, whole, fixed, mm.index);
    }
  }
  // 3. removed paths / legacy events / old CDN major pins (usa-codemod-13)
  const cm = codemod13(src);
  if (cm.changes.length) {
    const a = src.split('\n'), b = cm.code.split('\n');
    a.forEach((l, i) => { if (b[i] !== undefined && b[i] !== l) add('deprecated-api', `removed in 13.0: ${cm.changes.join('; ')}`, l, b[i]); });
  }
  // 4. bare `motionary/…` imports inside a page that loads Motionary from a CDN
  if (context === 'cdn' || context === 'html') {
    for (const sm of src.matchAll(/<script\b[^>]*type=["']module["'][^>]*>([\s\S]*?)<\/script>/gi)) {
      for (const lm of sm[1].matchAll(/^.*\b(?:from\s*|import\s*\(?\s*)['"]motionary(?:\/[\w./-]+)?['"].*$/gm)) add('bare-import', 'a CDN page cannot resolve bare `motionary/…` specifiers (no import map) — import the module from the same CDN major', lm[0], cdnImports(m, lm[0]));
    }
  }
  // 5. components used but never imported / defined (ESM)
  const usedTags = [...new Set([...src.matchAll(/<(usa-[a-z0-9-]+)/gi)].map((x) => x[1].toLowerCase()))].map((t) => findComponent(m, t) || findComponent(m, fixes.find((f) => f.kind === 'unknown-tag' && f.patch.find === `<${t}`)?.patch.replace.slice(1) || '')).filter(Boolean);
  if (context === 'esm') {
    const lines = [];
    for (const c of usedTags) if (!src.includes(c.import.define + '(') && !/defineAll\w*\(|defineWidgets\(/.test(src)) lines.push(`import { ${c.import.define} } from '${c.import.path}';\n${c.import.register}`);
    if (lines.length) {
      const imp = [...src.matchAll(/^import .*$/gm)].pop();
      if (imp) add('missing-import', `components used but never defined: ${usedTags.filter((c) => !src.includes(c.import.define + '(')).map((c) => `<${c.tag}>`).join(', ')}`, imp[0], `${imp[0]}\n${lines.join('\n')}`, imp.index);
      else fixes.push({ kind: 'missing-import', message: 'components used but never defined', line: 1, patch: { find: '', replace: lines.join('\n') + '\n', insertAt: 'start' } });
    }
  }
  // 6. missing runtime prerequisites (from the static validator)
  const pre = validateSnippet(m, src).errors.concat(validateSnippet(m, src).warnings).filter((e) => /requires motionary\/runtime/.test(e));
  for (const e of pre) {
    const mod = (e.match(/requires (motionary\/runtime(?:\/[\w-]+)?)/) || [])[1];
    if (!mod) continue;
    const id = mod.split('/')[2], camel = id ? id.replace(/-(\w)/g, (_, x) => x.toUpperCase()) : null;
    if (context === 'esm') {
      const imp = src.match(/^import .*$/m);
      const ins = id ? `import { use } from 'motionary/runtime';\nimport { ${camel} } from '${mod}';\nuse(${camel}); // prerequisites first` : `import 'motionary/runtime';`;
      if (imp && !src.includes(`'${mod}'`)) add('missing-prerequisite', e, imp[0], `${ins}\n${imp[0]}`, imp.index);
    } else {
      const base = m.cdn.runtime.replace(/runtime\.iife\.js$/, '');
      const tagAt = src.search(/<script\b[^>]*src=[^>]*(components|widgets)\.umd\.js/);
      const first = tagAt > -1 ? src.slice(tagAt, src.indexOf('>', tagAt) + 1) : null;
      const ins = `${src.includes('runtime.iife.js') ? '' : `<script src="${m.cdn.runtime}"></script>\n`}${id ? `<script src="${base}runtime/${id}.iife.js"></script>\n` : ''}`;
      if (first && ins) add('missing-prerequisite', e, first, ins + first, tagAt);
    }
  }
  let fixed = String(code || '');
  for (const f of fixes) fixed = f.patch.insertAt === 'start' ? f.patch.replace + fixed : fixed.split(f.patch.find).join(f.patch.replace);
  const after = validateSnippet(m, fixed);
  return { schema: SCHEMAS.fix, context, fixes, fixed, valid: after.valid, remaining: { errors: after.errors, warnings: after.warnings } };
}
