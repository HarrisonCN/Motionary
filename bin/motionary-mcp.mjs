#!/usr/bin/env node
// motionary-mcp 2.0 (10.7; 1.0 in 10.4) — a read-only Model Context Protocol server for the
// Motionary component catalog. Zero dependencies: speaks MCP (JSON-RPC 2.0,
// newline-delimited) over stdio and answers from the AI manifest that ships
// in the package (dist/manifest.json, the same data as components.json /
// llms.txt). It never writes files, runs code or touches the network.
//
//   npx -p motionary motionary-mcp            (or: npx motionary-mcp once installed)
//   MOTIONARY_MANIFEST=/path/manifest.json motionary-mcp   (use another manifest)
//
// Tools: list_components, search_components, get_component, get_example,
// scaffold_snippet (prerequisites included automatically); 2.0 (10.7) adds
// suggest_motion (natural language → motion spec + code, the deterministic
// parser from motionary/components/ai — no model, no network) and
// validate_snippet (unknown tags / attributes, missing or mis-ordered
// prerequisites, unregistered components, reduced-motion handling).
// Resources: motionary://manifest, motionary://llms.txt, motionary://component/<tag>.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createInterface } from 'node:readline';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { mountSnippet } from './mcp-mount.mjs';
import { runSnippet } from './mcp-browser.mjs';
import { compatAt, cmpVer } from './compat-history.mjs';
import { rankComponents, checkCompatibility, suggestFix, SCHEMAS } from './mcp-tools-2.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const SERVER = { name: 'motionary-mcp', version: '3.0.0' };
export const SERVER_INFO = SERVER;
/** 13.7: tool contract versions — input + output schema of each tool; a tool's major changes only on an incompatible change. */
export const TOOL_SCHEMA_VERSIONS = { list_components: '1.0', search_components: '1.1', get_component: '1.0', get_example: '1.0', scaffold_snippet: '1.1', suggest_motion: '1.1', validate_snippet: '2.0', check_compatibility: '2.0', suggest_fix: '2.0', list_templates: '1.0', get_template: '1.0', export_scene: '2.0', propose_edit: '2.0', validate_scene: '2.0' }; // 3.0 (16.0): 2.0 = scene inputs are objects (Scene v3 or v2), validate_snippet is code only
const PROTOCOLS = ['2025-06-18', '2025-03-26', '2024-11-05'];

export function loadManifest(path = process.env.MOTIONARY_MANIFEST || join(HERE, '../dist/manifest.json')) {
  if (!existsSync(path)) throw new Error(`motionary-mcp: manifest not found at ${path} (set MOTIONARY_MANIFEST, or run from an installed motionary package)`);
  return JSON.parse(readFileSync(path, 'utf8'));
}

// ---------------------------------------------------------------- catalog logic (pure)
const norm = (s) => String(s || '').toLowerCase();
const tagOf = (s) => {
  const t = norm(s).trim().replace(/^<|\/?>$/g, '');
  return t.startsWith('usa-') ? t : `usa-${t}`;
};
// 2.0: a requirement id is a motionary/runtime module or (10.6+) an official runtime (kind 'peer', e.g. rive → @rive-app/canvas)
let MOD = new Map();
const indexModules = (m) => {
  if (MOD.m !== m) (MOD = new Map((m.runtimeModules || []).map((x) => [x.id, x]))), (MOD.m = m);
};
const isPeer = (r) => r.startsWith('@') || MOD.get(r)?.kind === 'peer';
const reqLabel = (r) => (r === 'core' ? 'motionary/runtime' : MOD.get(r)?.kind === 'peer' ? MOD.get(r).label : r.includes('/') || r.startsWith('@') ? r : `motionary/runtime/${r}`);
const brief = (c) => ({ tag: c.tag, title: c.title, category: c.category, import: c.import.path, requires: c.requires.map(reqLabel), since: c.since, description: c.description.slice(0, 200) });

export function findComponent(m, tag) {
  indexModules(m);
  const t = tagOf(tag);
  return m.components.find((c) => c.tag === t) || m.components.find((c) => c.id === norm(tag));
}

/** Rank components for a free-text query (tag, title, keywords, description, category). */
export function searchComponents(m, query, limit = 10) {
  indexModules(m);
  // 13.7: exact-tag priority, exact keyword / tag-segment boosts, typo-tolerant matching, stable tie-break (mcp-tools-2.mjs) — same result shape
  return rankComponents(m, query).slice(0, limit).map((x) => ({ ...brief(x.c), score: x.s }));
}

const FRAMEWORKS = ['html', 'esm', 'react', 'vue', 'svelte', 'solid', 'angular'];
const runtimeCdn = (m, ids) => {
  const base = m.cdn.runtime.replace(/runtime\.iife\.js$/, '');
  return [`<script src="${m.cdn.runtime}"></script>`, ...ids.filter((i) => i !== 'core').map((i) => `<script src="${base}runtime/${i}.iife.js"></script>`)];
};
const runtimeImports = (ids) => {
  const mods = ids.filter((i) => i !== 'core');
  const camel = (id) => id.replace(/-(\w)/g, (_, c) => c.toUpperCase());
  return { lines: ["import { use } from 'motionary/runtime';", ...mods.map((i) => `import { ${camel(i)} } from 'motionary/runtime/${i}';`)], register: `use(${mods.map(camel).join(', ')});` };
};

// 13.2: `import { a } from 'x'` lines merged per module — one name is imported once (gl-model's two decoders shared one import)
export function mergeImports(lines) {
  const out = [], by = new Map();
  for (const l of lines) {
    const mm = l.match(/^import \{([^}]*)\} from (['"])([^'"]+)\2;?$/);
    if (!mm) { if (!out.includes(l) || !l.startsWith('import ')) out.push(l); continue; }
    if (!by.has(mm[3])) { by.set(mm[3], []); out.push({ from: mm[3] }); }
    const names = by.get(mm[3]);
    for (const n of mm[1].split(',').map((x) => x.trim()).filter(Boolean)) if (!names.includes(n)) names.push(n);
  }
  return out.map((l) => (typeof l === 'string' ? l : `import { ${by.get(l.from).join(', ')} } from '${l.from}';`));
}

// 13.2: package subpath → dist file, from the package.json next to this server (CDN pages cannot use bare `motionary/…` imports)
let EXPORTS = null;
const distPathOf = (spec) => {
  if (!EXPORTS) {
    EXPORTS = {};
    try {
      const pkg = JSON.parse(readFileSync(join(HERE, '../package.json'), 'utf8'));
      for (const [k, v] of Object.entries(pkg.exports || {})) {
        const t = typeof v === 'string' ? v : v && (v.import ? (typeof v.import === 'string' ? v.import : v.import.default) : v.default);
        if (typeof t === 'string' && t.startsWith('./dist/')) EXPORTS[k === '.' ? 'motionary' : 'motionary/' + k.slice(2)] = t.slice(7);
      }
    } catch { /* fall back to the naming convention */ }
  }
  return EXPORTS[spec] || (spec === 'motionary' ? 'index.js' : spec.replace(/^motionary\//, '') + '.js');
};
const cdnBase = (m) => m.cdn.components.replace(/components\.umd\.js$/, '');
/** Bare `motionary/…` specifiers in an HTML page → CDN module URLs of the same major. */
export const cdnImports = (m, code) => String(code).replace(/(\bfrom\s+|\bimport\s*\(?\s*)(['"])(motionary(?:\/[\w./-]+)?)\2/g, (_, k, q, spec) => `${k}${q}${cdnBase(m)}${distPathOf(spec)}${q}`);

const VOID = /^(area|base|br|col|embed|hr|img|input|link|meta|source|track|wbr)$/i;
const ATTR_RE = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
/** An example → { html (no scripts / comments), scripts: [code] } — framework scaffolds wire the scripts up after mount. */
export function splitExample(markup) {
  const scripts = [];
  const html = String(markup || '')
    .replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (_, a, body) => { if (body.trim()) scripts.push(body.trim()); return ''; })
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return { html, scripts };
}
const camelCss = (p) => (p.startsWith('--') ? p : p.replace(/-([a-z])/g, (_, c) => c.toUpperCase()));
const styleObj = (v) => `{{ ${v.split(';').map((d) => d.trim()).filter(Boolean).map((d) => { const i = d.indexOf(':'); return `${JSON.stringify(camelCss(d.slice(0, i).trim()))}: ${JSON.stringify(d.slice(i + 1).trim())}`; }).join(', ')} }}`;
const REACT_ATTR = { class: 'className', for: 'htmlFor', tabindex: 'tabIndex', readonly: 'readOnly', maxlength: 'maxLength', colspan: 'colSpan', rowspan: 'rowSpan', autoplay: 'autoPlay', playsinline: 'playsInline', crossorigin: 'crossOrigin', srcset: 'srcSet', contenteditable: 'contentEditable', autocomplete: 'autoComplete', inputmode: 'inputMode', enterkeyhint: 'enterKeyHint' };
const jsxValue = (v) => (v.includes('"') ? `{${JSON.stringify(v)}}` : `"${v}"`);
/** HTML markup → JSX (React or Solid): void tags closed, text braces escaped; React renames DOM attributes and turns style into an object; Solid sets attributes on <usa-*> elements with attr: (Solid sets properties otherwise). */
export function htmlToJsx(html, flavor = 'react') {
  return String(html).split(/(<[^>]+>)/g).map((part) => {
    if (!part.startsWith('<')) return part.replace(/[{}]/g, (c) => `{'${c}'}`);
    if (/^<\//.test(part)) return part;
    const mm = part.match(/^<([a-zA-Z][\w-]*)([\s\S]*?)(\/?)>$/);
    if (!mm) return part;
    const [, tag, rest] = mm;
    const custom = tag.includes('-');
    const attrs = [...rest.matchAll(ATTR_RE)].map(([, n, d, s1, u]) => {
      const v = d ?? s1 ?? u;
      let name = n;
      if (/^on[a-z]+$/i.test(name)) return null; // inline handlers: wire them in code
      if (flavor === 'react') {
        if (!custom) name = REACT_ATTR[name.toLowerCase()] || name; else if (name === 'class') name = 'className';
        if (name === 'style' && v != null) return `style=${styleObj(v)}`;
        return v == null ? (custom || name.startsWith('data-') ? `${name}=""` : name) : `${name}=${jsxValue(v)}`;
      }
      if (custom && name !== 'class' && name !== 'style' && name !== 'slot' && name !== 'id' && !name.includes(':')) name = `attr:${name}`;
      return v == null ? `${name}=""` : `${name}=${jsxValue(v)}`;
    }).filter(Boolean);
    const close = VOID.test(tag) || mm[3] ? ' />' : '>';
    return `<${tag}${attrs.length ? ' ' + attrs.join(' ') : ''}${close}`;
  }).join('');
}
/** Text and attribute braces / Angular block syntax as entities (Svelte, Angular templates). */
const escTemplate = (html, chars) => String(html).replace(chars, (c) => `&#${c.charCodeAt(0)};`);
const wireComment = (scripts, lang = 'js') => (scripts.length ? `\n${lang === 'html' ? '<!--' : '/*'} wire-up from the HTML example — run it after the component mounts:\n${scripts.join('\n').replace(/\*\//g, '* /').replace(/-->/g, '-- >')}\n${lang === 'html' ? '-->' : '*/'}` : '');

/** A ready-to-paste snippet for one or more components, prerequisites first. */
export function scaffold(m, tags, framework = 'esm') {
  indexModules(m);
  if (!FRAMEWORKS.includes(framework)) throw new Error(`framework must be one of ${FRAMEWORKS.join(', ')}`);
  const primary = tags.map((t) => {
    const c = findComponent(m, t);
    if (!c) throw new Error(`unknown component ${t} — use search_components first`);
    return c;
  });
  // 13.2: elements an example uses besides its own (e.g. <usa-add-to-cart> flies into a <usa-cart-drawer>) are registered too
  const comps = [...primary];
  for (const c of primary) for (const [, t] of String(c.example).matchAll(/<(usa-[a-z0-9-]+)/g)) { const k = findComponent(m, t); if (k && !comps.includes(k)) comps.push(k); }
  const req = [...new Set(comps.flatMap((c) => c.requires))].filter((r) => !isPeer(r));
  const peerIds = [...new Set(comps.flatMap((c) => c.requires))].filter(isPeer);
  const peers = peerIds.map(reqLabel);
  const peerSetup = peerIds.map((r) => MOD.get(r)).filter(Boolean);
  const umd = (c) => /\.umd\.js$/.test(c.cdn);
  const needsComponents = comps.some((c) => umd(c) && !/widgets\.umd/.test(c.cdn));
  const needsWidgets = comps.some((c) => /widgets\.umd/.test(c.cdn));
  const markup = primary.map((c) => c.example).join('\n');
  const byPath = new Map();
  for (const c of comps) byPath.set(c.import.path, [...(byPath.get(c.import.path) || []), c.import.define]);
  const defImports = [...byPath].map(([p, d]) => `import { ${[...new Set(d)].join(', ')} } from '${p}';`);
  const defCalls = [...new Set(comps.map((c) => c.import.register))];
  const install = ['npm i motionary', ...peers.map((p) => `npm i ${p}`)].join(' && ');
  const rt = req.length ? runtimeImports(req) : null;
  const prereqNote = req.length || peers.length ? `Prerequisites: ${[...req.map(reqLabel), ...peers].join(', ')} — register them before the components mount.` : 'No prerequisites.';
  let code;
  if (framework === 'html') {
    // entry-only elements (own ES module entry, not in the no-build bundles) load as modules from the same CDN major
    const esmOnly = comps.filter((c) => !umd(c));
    const mod = esmOnly.length ? [`<script type="module">\n${mergeImports(esmOnly.map((c) => `import { ${c.import.define} } from '${c.cdn}';`)).join('\n')}\n${esmOnly.map((c) => c.import.register).join('\n')}\n</script>`] : [];
    code = [
      '<!-- ' + prereqNote + ' -->',
      ...(req.length ? runtimeCdn(m, req) : []),
      ...peerSetup.map((p) => `<!-- ${p.label} (official runtime, lazy): -->\n${p.cdn}`),
      ...(needsComponents || !esmOnly.length ? [`<script src="${m.cdn.components}"></script>`] : []),
      ...(needsWidgets ? [`<script src="${m.cdn.widgets}"></script>`] : []),
      ...mod,
      '',
      cdnImports(m, markup),
    ].join('\n');
  } else {
    const setupLines = mergeImports([...(rt ? [...rt.lines] : []), ...peerSetup.map((p) => p.import).filter(Boolean), ...defImports]);
    const calls = [...(rt ? [rt.register + ' // prerequisites first'] : []), ...peerSetup.map((p) => p.register), ...defCalls];
    const setup = [...setupLines, '', ...calls].join('\n');
    const { html, scripts } = splitExample(markup);
    const indent = (s, n) => s.split('\n').map((l) => (l ? ' '.repeat(n) + l : l)).join('\n');
    if (framework === 'esm') code = `// ${install}\n${setup}\n\n/* HTML:\n${markup.replace(/\*\//g, '* /')}\n*/`;
    else if (framework === 'react' || framework === 'solid') code = `// ${install}\n${setup}\n\nexport function Demo() {\n  return (\n    <>\n${indent(htmlToJsx(html, framework), 6)}\n    </>\n  );\n}${wireComment(scripts)}`;
    else if (framework === 'vue') code = `<!-- ${install} -->\n<script setup>\n${setup}\n</script>\n\n<template>\n${indent(html.replace(/\{\{/g, "{{ '{{' }}"), 2)}\n</template>\n<!-- vite.config: vue({ template: { compilerOptions: { isCustomElement: (t) => t.startsWith('usa-') } } }) -->${wireComment(scripts, 'html')}`;
    else if (framework === 'svelte') code = `<!-- ${install} -->\n<script>\n${setup}\n</script>\n\n${escTemplate(html, /[{}]/g)}${wireComment(scripts, 'html')}`;
    else code = `// ${install}\nimport { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';\n${setup}\n\n@Component({\n  selector: 'app-demo',\n  standalone: true,\n  schemas: [CUSTOM_ELEMENTS_SCHEMA],\n  template: \`\n${indent(escTemplate(html, /[{}@`$\\]/g), 4)}\n  \`,\n})\nexport class DemoComponent {}${wireComment(scripts)}`;
  }
  return { framework, components: comps.map((c) => c.tag), install, prerequisites: req.map(reqLabel).concat(peers), code };
}

// ---------------------------------------------------------------- 2.0: suggest_motion + validate_snippet
let AI = null;
/** Load the natural-language parser (motionary/components/ai) — from the package build, or MOTIONARY_AI. */
export async function loadAi(path = process.env.MOTIONARY_AI || join(HERE, '../dist/components/ai.js')) {
  // a Function-wrapped import keeps bundlers / vite from rewriting this optional, path-based import
  if (!AI && existsSync(path)) AI = await new Function('u', 'return import(u)')(pathToFileURL(path).href);
  return AI;
}
export function setAi(mod) {
  AI = mod;
}

// ---------------------------------------------------------------- 2.2 (14.6): Scene v2 inputs
let SAI = null;
/** Load the AI Studio assistant (motionary/components/studio-ai: Scene v2 ops, checks, fixes) — package build or MOTIONARY_STUDIO_AI. */
export async function loadStudioAi(path = process.env.MOTIONARY_STUDIO_AI || join(HERE, '../dist/components/studio-ai.js')) {
  if (!SAI && existsSync(path)) SAI = await new Function('u', 'return import(u)')(pathToFileURL(path).href);
  return SAI;
}
export function setStudioAi(mod) {
  SAI = mod;
}
const needSai = () => { if (!SAI) throw new Error('scene inputs need motionary/components/studio-ai (dist/components/studio-ai.js) — run from an installed motionary package or set MOTIONARY_STUDIO_AI'); return SAI; };
let CATALOG = null;
const catalogOf = (m) => (CATALOG && CATALOG.m === m ? CATALOG.c : (CATALOG = { m, c: m.components.map((c) => ({ tag: c.tag, title: c.title, since: c.since, keywords: c.keywords || [], attributes: c.attributes || [], stability: c.stability })) }).c);
let SV3 = null;
/** The Scene v3 module (motionary/components/scene-v3): package build by default; tests pass the source module. */
export function setSceneV3(mod) { SV3 = mod; }
const needV3 = () => (SV3 ||= createRequire(import.meta.url)(join(HERE, '../dist/components/scene-v3.cjs')));
/** 3.0 (16.0): scene arguments are objects only (JSON text was removed: docs/deprecations-v16.md#mcp-scene-text). */
const sceneObject = (v, what = 'scene') => {
  if (typeof v === 'string') throw new Error(`${what}: pass the scene as a JSON object — JSON text was removed in motionary-mcp 3.0 (docs/deprecations-v16.md#mcp-scene-text)`);
  return v;
};
/** A scene argument (Scene v3 or v2 object) → { scene: Scene v2, version, lost } or { problems }. v3 is read through sceneV3ToV2. */
function sceneArg(a) {
  const v = sceneObject(a.scene);
  if (!v || typeof v !== 'object' || Array.isArray(v) || !Array.isArray(v.layers)) return { problems: [{ path: v && typeof v === 'object' ? 'layers' : '', message: v && typeof v === 'object' ? 'expected an array' : 'expected a Scene v3 / v2 object' }] };
  if (v.format === 'motionary-scene' && v.version === 3) {
    const V = needV3(), p = V.validateSceneV3(v);
    if (p.length) return { problems: p };
    const r = V.sceneV3ToV2(v);
    return { scene: r.doc, version: 3, lost: r.lost };
  }
  return { scene: v, version: v.version };
}
export const sceneTags = (scene) => [...new Set((scene.layers || []).map((l) => l && l.component && l.component.tag).filter((t) => typeof t === 'string'))];
const esc2 = (s) => String(s).replace(/</g, '\\u003c');
/** A page that renders a scene in a real browser: the headless sampler from the local build, then every keyframe track through the Web Animations API (finished at once). */
export function scenePreviewHtml(scene) {
  const els = [];
  for (const l of scene.layers) {
    const t = typeof l.target === 'string' ? l.target.trim() : '';
    const mm = /^([#.])([A-Za-z_][\w-]*)$/.exec(t);
    if (mm && !els.some((e) => e.t === t)) els.push({ t, html: mm[1] === '#' ? `<div id="${mm[2]}"></div>` : `<div class="${mm[2]}"></div>` });
  }
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"></head><body>
<div id="stage">${els.map((e) => e.html).join('')}</div>
<script type="application/json" id="scene">${esc2(JSON.stringify(scene))}</script>
<script type="module">
import { renderSceneHeadless } from 'https://cdn.jsdelivr.net/npm/motionary@15/dist/components/studio-ai.js';
const scene = JSON.parse(document.getElementById('scene').textContent);
const r = renderSceneHeadless(scene);
if (!r.ok) throw new Error('[motionary] scene render: ' + r.errors.join('; '));
const stage = document.getElementById('stage');
for (const l of scene.layers) {
  if (l.type !== 'track' || !l.keyframes || !l.keyframes.length) continue;
  const el = (l.target && l.target !== ':scope' && stage.querySelector(l.target)) || stage;
  const ks = l.keyframes.slice().sort((a, b) => a.time - b.time), end = ks[ks.length - 1].time;
  el.animate(ks.map((k) => Object.assign({}, k.props, { offset: end > 0 ? k.time / end : 0 })), { duration: Math.max(1, end), fill: 'both' }).finish();
}
document.documentElement.dataset.sceneRendered = String(r.frames);
</script></body></html>`;
}
/** validate_scene { scene, ops?, browser? } (3.0; Scene v3 or v2): model ops parsed as data, applied to a copy, schema + compatibility + headless render (+ a real browser). */
export async function validateScene(m, a) {
  const base = { schema: SCHEMAS.scene, valid: false, mode: 'static', problems: [], compatibility: [], render: { ok: false, frames: 0, errors: [] } };
  const sa = sceneArg(a);
  if (sa.problems) return { ...base, problems: sa.problems };
  base.sceneVersion = sa.version;
  const S = needSai();
  const parsed = S.parseAiEdit({ ops: Array.isArray(a.ops) ? a.ops : [] });
  if (parsed.errors.length) return { ...base, problems: parsed.errors };
  const version = a.version || installedVersion() || m.version;
  let mode = 'static', browser;
  const v = await S.validateAiEdit(sa.scene, parsed.ops, {
    catalog: catalogOf(m), version,
    validate: a.browser ? async (preview) => {
      const r = await validateSnippetInBrowser(m, scenePreviewHtml(preview));
      if (!r.mount?.mounted) { browser = { mounted: false, skipped: r.mount?.skipped }; return { ok: true, mode: 'static' }; }
      mode = 'browser';
      browser = { mounted: true, environment: r.mount.environment };
      return { ok: r.errors.length === 0, mode, errors: r.errors };
    } : undefined,
  });
  return { schema: SCHEMAS.scene, valid: v.ok, mode, version, sceneVersion: sa.version, ...(sa.lost && sa.lost.length && { lost: sa.lost }), problems: v.errors, compatibility: v.checks.compatibility, render: v.checks.render, ...(browser && { browser }), preview: v.preview };
}

// ---------------------------------------------------------------- 2.3 (14.8): templates + standalone export
let SEX = null, STP = null, TPL = null;
/** Load motionary/components/studio-export (14.7 standalone export) — package build or MOTIONARY_STUDIO_EXPORT. */
export async function loadStudioExport(path = process.env.MOTIONARY_STUDIO_EXPORT || join(HERE, '../dist/components/studio-export.js')) {
  if (!SEX && existsSync(path)) SEX = await new Function('u', 'return import(u)')(pathToFileURL(path).href);
  return SEX;
}
export function setStudioExport(mod) {
  SEX = mod;
}
/** Load motionary/components/studio-templates (14.8) — package build or MOTIONARY_STUDIO_TEMPLATES. */
export async function loadStudioTemplates(path = process.env.MOTIONARY_STUDIO_TEMPLATES || join(HERE, '../dist/components/studio-templates.js')) {
  if (!STP && existsSync(path)) STP = await new Function('u', 'return import(u)')(pathToFileURL(path).href);
  return STP;
}
export function setStudioTemplates(mod) {
  STP = mod;
  TPL = null;
}
const needMod = (mod, name) => { if (!mod) throw new Error(`this tool needs motionary/components/${name} (dist/components/${name}.js) — run from an installed motionary package or set MOTIONARY_${name.toUpperCase().replace(/-/g, '_')}`); return mod; };
/** The starter templates shipped in the package (templates/*.motionary-template.json, or MOTIONARY_TEMPLATES): parsed + integrity-checked, data only. */
export function shippedTemplates(dir = process.env.MOTIONARY_TEMPLATES || join(HERE, '../templates')) {
  if (TPL && TPL.dir === dir) return TPL.list;
  const S = needMod(STP, 'studio-templates'), list = [];
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.motionary-template.json')).sort() : [];
  for (const f of files) {
    const r = S.parseTemplate(readFileSync(join(dir, f), 'utf8'));
    list.push({ file: f, ok: r.ok, errors: r.errors, template: r.template, info: r.info });
  }
  TPL = { dir, list };
  return list;
}
const templateBrief = (x) => ({ id: x.info.id, name: x.info.name, version: x.info.version, license: x.info.license, ...(x.info.author && { author: x.info.author }), ...(x.info.description && { description: x.info.description }), requires: x.info.requires, layers: x.info.layers, files: x.info.files, duration: x.info.duration, integrity: x.info.integrity, verified: true, signed: x.info.signed, file: x.file });
const findTemplate = (id) => {
  const x = shippedTemplates().find((t) => t.ok && t.info.id === String(id || '').trim());
  if (!x) throw new Error(`unknown template ${id} — use list_templates`);
  return x;
};
/** export_scene: a Scene v3 / v2 object / Studio project / shipped template → the 14.7 standalone files (utf8 text or base64), digest and report. */
export function exportScene(m, a) {
  const X = needMod(SEX, 'studio-export');
  const given = ['scene', 'project', 'template'].filter((k) => a[k] !== undefined);
  if (given.length !== 1) throw new Error('give exactly one of scene, project or template');
  let input;
  if (a.template !== undefined) input = { pack: findTemplate(a.template).template.pack };
  else {
    input = sceneObject(a.scene !== undefined ? a.scene : a.project, a.scene !== undefined ? 'scene' : 'project');
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('expected a Scene v3 / v2 document or a Studio project');
    if (a.scene !== undefined && input.format === 'motionary-scene' && input.version === 3) { const sa = sceneArg(a); if (sa.problems) throw new Error(`scene: ${sa.problems[0].path}: ${sa.problems[0].message}`); input = sa.scene; }
  }
  const r = X.exportStandalone(input, { inline: !!a.inline, js: a.js !== false, ...(a.fps !== undefined && { fps: a.fps }), ...(a.title !== undefined && { title: String(a.title) }) });
  const toB64 = (b) => Buffer.from(b).toString('base64');
  const files = [...r.files].map(([path, v]) => (typeof v === 'string' ? { path, encoding: 'utf8', bytes: Buffer.byteLength(v), text: v } : { path, encoding: 'base64', bytes: v.length, data: toB64(v) }));
  return { schema: SCHEMAS.exportScene, digest: r.report.digest, files, report: r.report };
}

/** Natural language → motion spec, code in three styles, and the catalog components that implement it. */
export function suggestMotion(m, text, format = 'waapi') {
  if (!AI) throw new Error('suggest_motion needs motionary/components/ai (dist/components/ai.js) — run from an installed motionary package or set MOTIONARY_AI');
  const i = AI.describeMotion(String(text || ''));
  const comps = i.components.map((c) => {
    const k = findComponent(m, c.tag);
    return { ...c, requires: k ? brief(k).requires : [], import: k?.import?.path };
  });
  const code = { waapi: AI.motionSnippet(i, 'waapi'), css: AI.motionSnippet(i, 'css'), component: AI.motionSnippet(i, 'component') };
  return {
    text: i.text,
    effect: i.effect,
    also: i.also,
    direction: i.direction,
    amount: i.amount,
    duration: i.duration,
    delay: i.delay,
    easing: i.easing,
    easingName: i.easingName,
    trigger: i.trigger,
    iterations: i.iterations === Infinity ? 'infinite' : i.iterations,
    alternate: i.alternate,
    stagger: i.stagger,
    reducedMotion: i.reducedMotion,
    keyframes: i.keyframes,
    options: { ...i.options, iterations: i.options.iterations === Infinity ? 'infinite' : i.options.iterations },
    confidence: i.confidence,
    matched: i.matched,
    components: comps,
    code: code[format] ? code[format] : code.waapi,
    allCode: code,
    note: i.confidence < 0.5 ? 'Low confidence: describe the motion with an effect (fade, slide, zoom …), a direction and a trigger (on scroll, on hover …).' : undefined,
  };
}

const GLOBAL_ATTRS = new Set(['class', 'id', 'style', 'role', 'slot', 'hidden', 'tabindex', 'title', 'lang', 'dir', 'part', 'is', 'inert', 'nonce', 'popover', 'translate', 'draggable', 'contenteditable', 'autofocus', 'enterkeyhint', 'inputmode', 'key', 'ref', 'classname', 'v-if', 'v-for', 'v-show']);
const dist = (a, b) => {
  const d = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = d[0];
    d[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const t = d[j];
      d[j] = Math.min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = t;
    }
  }
  return d[b.length];
};
const camelId = (id) => id.replace(/-(\w)/g, (_, c) => c.toUpperCase());

/** Check a snippet (HTML, ESM, JSX, Vue or Svelte) against the catalog. Never runs it. */
export function validateSnippet(m, code) {
  indexModules(m);
  const src = String(code || '');
  const errors = [], warnings = [];
  const tags = [...src.matchAll(/<(usa-[a-z0-9-]+)([^>]*)>/gi)];
  const used = new Map();
  for (const [, rawTag, rawAttrs] of tags) {
    const tag = rawTag.toLowerCase();
    const c = findComponent(m, tag);
    if (!c) {
      const close = m.components.map((k) => [k.tag, dist(tag, k.tag)]).filter(([, d]) => d <= 3).sort((a, b) => a[1] - b[1]).map(([t]) => t);
      const near = [...new Set([...close, ...searchComponents(m, tag.replace(/^usa-/, '').replace(/-/g, ' '), 3).map((x) => x.tag)])].slice(0, 3);
      if (!used.has(tag)) errors.push(`unknown component <${tag}>${near.length ? ` — did you mean ${near.map((t) => `<${t}>`).join(', ')}?` : ''}`);
      used.set(tag, null);
      continue;
    }
    used.set(tag, c);
    if (!(c.attributes || []).length) continue;
    const attrs = [...rawAttrs.replace(/=\s*("[^"]*"|'[^']*')/g, '=""').matchAll(/(?:^|\s)([:@]?[a-zA-Z_][\w:.-]*)(?=\s*=|\s|\/?$)/g)].map((x) => x[1].replace(/^[:@]/, '').replace(/^(?:v-bind|bind):/, '').toLowerCase());
    for (const a of attrs) {
      if (GLOBAL_ATTRS.has(a) || a.startsWith('data-') || a.startsWith('aria-') || a.startsWith('on') || a.startsWith('v-') || a.includes(':')) continue;
      if (!c.attributes.includes(a)) warnings.push(`<${tag}> has no attribute "${a}" (attributes: ${c.attributes.join(', ')})`);
    }
  }
  const comps = [...used.values()].filter(Boolean);
  const hasScript = /<script\b|\bimport\s|\brequire\(/.test(src);
  // prerequisites (runtime modules + official runtimes) and their order
  const modules = [...new Set(comps.flatMap((c) => c.requires))];
  const firstDefine = Math.min(...comps.map((c) => { const i = src.indexOf(c.import.define + '('); return i < 0 ? Infinity : i; }), ...['components.umd.js', 'widgets.umd.js', 'motionary/components'].map((k) => { const i = src.indexOf(k); return i < 0 ? Infinity : i; }));
  for (const r of modules) {
    const who = comps.filter((c) => c.requires.includes(r)).map((c) => `<${c.tag}>`).join(', ');
    if (isPeer(r)) {
      const pk = reqLabel(r);
      const has = src.includes(pk) || /runtime-src=/.test(src) || /provideRiveRuntime\(/.test(src);
      if (!has) (hasScript ? errors : warnings).push(`${who} needs the official runtime ${pk} (optional peer): npm i ${pk}, or a runtime-src / provideRiveRuntime() — it is lazy-loaded on mount`);
      continue;
    }
    const names = r === 'core' ? ["motionary/runtime'", 'motionary/runtime"', 'runtime.iife.js'] : [`motionary/runtime/${r}`, `runtime/${r}.iife.js`];
    const at = Math.min(...names.map((n) => { const i = src.indexOf(n); return i < 0 ? Infinity : i; }));
    const path = r === 'core' ? 'motionary/runtime' : `motionary/runtime/${r}`;
    if (at === Infinity) {
      (hasScript ? errors : warnings).push(`${who} requires ${path}: ${r === 'core' ? "import { use } from 'motionary/runtime'" : `import { ${camelId(r)} } from '${path}'; use(${camelId(r)});`} before the component mounts (CDN: runtime.iife.js${r === 'core' ? '' : `, then runtime/${r}.iife.js`}, before the component bundles)`);
      continue;
    }
    if (r !== 'core' && /\bimport\s/.test(src) && src.replace(/<!--[\s\S]*?-->/g, '').includes(`motionary/runtime/${r}`) && !new RegExp(`use\\([^)]*\\b${camelId(r)}\\b`).test(src)) errors.push(`${path} is imported but never registered: call use(${camelId(r)}) before the components mount`);
    if (at > firstDefine) errors.push(`${path} is loaded after the components — register prerequisites first`);
    const useAt = src.search(new RegExp(`use\\([^)]*\\b${camelId(r)}\\b`));
    const defAt = Math.min(...comps.filter((c) => c.requires.includes(r)).map((c) => { const i = src.indexOf(c.import.define + '('); return i < 0 ? Infinity : i; }));
    if (useAt > -1 && defAt !== Infinity && useAt > defAt) errors.push(`use(${camelId(r)}) runs after ${who} are defined — call it first`);
  }
  // components imported in ESM but never defined
  if (/\bimport\s/.test(src)) for (const c of comps) if (!src.includes(c.import.define + '(') && !/defineAll\w*\(|defineWidgets\(|auto(?:\.js)?['"]/.test(src)) warnings.push(`<${c.tag}> is used but ${c.import.define}() is never called (import it from '${c.import.path}')`);
  // hand-written animations without a reduced-motion path
  if (/\.animate\(|@keyframes|animation\s*:/.test(src) && !/prefers-reduced-motion|reducedMotion|prefersReducedMotion/.test(src)) warnings.push('hand-written animation without a prefers-reduced-motion check — guard it (Motionary components already respect reduced motion)');
  return { valid: errors.length === 0, errors, warnings, components: comps.map((c) => c.tag), prerequisites: modules.map(reqLabel) };
}

/** 12.2: static checks + a real mount in jsdom (optional peer) with the built bundles; the snippet's own scripts never run. */
export async function validateSnippetMounted(m, code, opts = {}) {
  const r = validateSnippet(m, code);
  const src = String(code || '');
  const ids = [...new Set(r.components.flatMap((t) => findComponent(m, t)?.requires || []))].filter((x) => !isPeer(x) && (x === 'core' ? /motionary\/runtime['"]|runtime\.iife\.js/.test(src) : src.includes(`motionary/runtime/${x}`) || src.includes(`runtime/${x}.iife.js`)));
  if (ids.length && !ids.includes('core')) ids.unshift('core');
  const mt = await mountSnippet(m, src, { distDir: opts.distDir || process.env.MOTIONARY_DIST || join(HERE, '../dist'), findComponent, runtimeIds: ids, bundles: opts.bundles, loadJsdom: opts.loadJsdom });
  if (!mt.mounted) return { ...r, mount: { mounted: false, skipped: mt.skipped } };
  // a missing prerequisite the static pass already reported is confirmed by the mount, not reported twice
  const confirmed = [], errs = [];
  for (const e of mt.errors) {
    const k = (e.match(/requires (motionary\/runtime\/[\w-]+)/) || [])[1];
    if (k && r.errors.concat(r.warnings).some((x) => x.includes(`requires ${k}`))) confirmed.push(e); else errs.push(e);
  }
  const errors = [...r.errors, ...errs], warnings = [...r.warnings, ...mt.warnings];
  return { ...r, valid: errors.length === 0, errors, warnings, mount: { mounted: true, environment: mt.environment, components: mt.components, confirmed } };
}

/** 13.2: static checks + a real run in a headless browser (Playwright, optional peer) with the built bundles — see bin/mcp-browser.mjs. */
export async function validateSnippetInBrowser(m, code, opts = {}) {
  const r = validateSnippet(m, code);
  const src = String(code || '');
  const ids = [...new Set(r.components.flatMap((t) => findComponent(m, t)?.requires || []))].filter((x) => !isPeer(x) && (x === 'core' ? /motionary\/runtime['"]|runtime\.iife\.js/.test(src) : src.includes(`motionary/runtime/${x}`) || src.includes(`runtime/${x}.iife.js`)));
  if (ids.length && !ids.includes('core')) ids.unshift('core');
  const rn = await runSnippet(m, src, { ...opts, distDir: opts.distDir || process.env.MOTIONARY_DIST || join(HERE, '../dist'), findComponent, runtimeIds: ids });
  if (!rn.mounted) return { ...r, mount: { mounted: false, skipped: rn.skipped } };
  const confirmed = [], errs = [];
  for (const e of rn.errors) {
    const k = (e.match(/requires (motionary\/runtime\/[\w-]+)/) || [])[1];
    if (k && r.errors.concat(r.warnings).some((x) => x.includes(`requires ${k}`))) confirmed.push(e); else errs.push(e);
  }
  const errors = [...r.errors, ...errs], warnings = [...r.warnings, ...rn.warnings];
  return { ...r, valid: errors.length === 0, errors, warnings, mount: { mounted: true, environment: rn.environment, run: rn.run, components: rn.components, confirmed } };
}

/** 12.5: the motionary version installed in the user's project (MOTIONARY_INSTALLED, else ./node_modules/motionary). */
export function installedVersion(cwd = process.cwd()) {
  if (process.env.MOTIONARY_INSTALLED) return process.env.MOTIONARY_INSTALLED;
  try { return JSON.parse(readFileSync(join(cwd, 'node_modules/motionary/package.json'), 'utf8')).version; } catch { return null; }
}

/** 12.5: what a project on `version` can use, and what changed after it. */
export function checkCompat(m, version, tags) {
  indexModules(m);
  const v = version || installedVersion() || m.version;
  const comps = (tags && tags.length ? tags.map((t) => { const c = findComponent(m, t); if (!c) throw new Error(`unknown component ${t} — use search_components`); return c; }) : m.components);
  const rows = comps.map((c) => ({ tag: c.tag, ...compatAt(c, v) }));
  const mods = [...new Set(comps.flatMap((c) => c.requires))].map((id) => m.runtimeModules.find((r) => r.id === id)).filter(Boolean).map((r) => ({ module: r.label, ...compatAt(r, v) }));
  const missing = rows.filter((r) => !r.available), changed = rows.filter((r) => r.available && r.changedAfter.length);
  return {
    version: v, catalog: m.version, behind: cmpVer(v, m.version) < 0,
    summary: `${rows.length - missing.length}/${rows.length} available in ${v}; ${changed.length} changed after it`,
    components: tags && tags.length ? rows : [...missing, ...changed],
    modules: mods,
    ...(missing.length || changed.length ? { upgrade: `npm i motionary@${m.version} (see docs/upgrading-${String(m.version).split('.')[0]}.md)` } : {}),
  };
}

// ---------------------------------------------------------------- MCP surface
const RO = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
export const TOOLS = [
  { name: 'list_components', title: 'List Motionary components', description: 'List the <usa-*> Web Components in the Motionary catalog (tag, title, category, import path, prerequisites). Filter by category, by required runtime module, or by version introduced.', inputSchema: { type: 'object', properties: { category: { type: 'string', description: 'e.g. text, scroll, ui, transitions, widgets' }, requires: { type: 'string', description: "only components needing this prerequisite, e.g. 'scroll' or 'motionary/runtime/text'; 'none' for components without prerequisites" }, since: { type: 'string', description: "introduced in this version or later, e.g. '10.0'" }, version: { type: 'string', description: "the motionary version installed in the user's project (default: ./node_modules/motionary, else the catalog version) — answers are filtered for it" }, limit: { type: 'number', default: 500 } }, additionalProperties: false }, annotations: { title: 'List components', ...RO } },
  { name: 'search_components', title: 'Search Motionary components', description: 'Free-text search over tags, titles, keywords and descriptions; best matches first. Use it to pick a component for a UI need ("animated counter", "scroll pinned scene", "confetti").', inputSchema: { type: 'object', properties: { query: { type: 'string' }, limit: { type: 'number', default: 10 } }, required: ['query'], additionalProperties: false }, annotations: { title: 'Search components', ...RO } },
  { name: 'get_component', title: 'Get a component', description: 'Everything about one component: attributes, events, slots, methods, import / define, CDN, prerequisites (install, import + register order, CDN script order), minimal example, variants.', inputSchema: { type: 'object', properties: { tag: { type: 'string', description: "'usa-tilt', 'tilt' or '<usa-tilt>'" }, version: { type: 'string', description: "the motionary version installed in the user's project (default: ./node_modules/motionary, else the catalog version) — answers are filtered for it" } }, required: ['tag'], additionalProperties: false }, annotations: { title: 'Get component', ...RO } },
  { name: 'get_example', title: 'Get an example', description: "A working example for one component in the requested style ('html' = CDN, 'esm' = npm + bundler, or a variant id).", inputSchema: { type: 'object', properties: { tag: { type: 'string' }, variant: { type: 'string', description: "'html' (default), 'esm', or a variant id from get_component" } }, required: ['tag'], additionalProperties: false }, annotations: { title: 'Get example', ...RO } },
  { name: 'scaffold_snippet', title: 'Scaffold a snippet', description: 'A ready-to-paste snippet using one or more components, with every prerequisite installed, imported and registered in the right order before the components mount.', inputSchema: { type: 'object', properties: { tags: { type: 'array', items: { type: 'string' }, minItems: 1 }, framework: { type: 'string', enum: FRAMEWORKS, default: 'esm' } }, required: ['tags'], additionalProperties: false }, annotations: { title: 'Scaffold snippet', ...RO } },
  { name: 'suggest_motion', title: 'Suggest a motion', description: 'Natural language (English or Chinese) → a motion spec: effect, direction, duration, easing, trigger, stagger, Web Animations keyframes + options, CSS, and the Motionary components that implement it, with prerequisite-aware code. Deterministic parser, no model, no network.', inputSchema: { type: 'object', properties: { text: { type: 'string', description: "e.g. 'fade the cards up slowly when they scroll into view, one after another'" }, format: { type: 'string', enum: ['waapi', 'css', 'component', 'scene'], default: 'waapi', description: "'scene' (14.6): also a Scene v2 document (scene, ops, valid) made by the local rules of motionary/studio/ai" } }, required: ['text'], additionalProperties: false }, annotations: { title: 'Suggest motion', ...RO } },
  { name: 'validate_snippet', title: 'Validate a snippet', description: 'Check HTML / ESM / JSX / Vue / Svelte code that uses <usa-*> components: unknown tags (with suggestions) and attributes, missing or mis-ordered prerequisites (motionary/runtime modules, official runtimes), components never defined, hand-written animation without a reduced-motion path. Static analysis by default; mount: true also mounts the markup in a headless DOM (jsdom, optional peer) with the real Motionary bundles and checks definitions, upgrade errors, prerequisites, observed attributes and event names against the component contract — the snippet\'s own scripts never run. browser: true (13.2) runs it in a real headless browser instead (Playwright, optional peer): HTML snippets run as a whole page, their own scripts included, against the local build; uncaught errors and motionary console errors are reported.', inputSchema: { type: 'object', properties: { code: { type: 'string' }, mount: { type: 'boolean', default: false, description: 'also mount the markup in jsdom with the real bundles (12.2)' }, browser: { type: ['boolean', 'string'], enum: [true, false, 'auto'], default: false, description: "run it in a real headless browser instead (Playwright, optional peer; implies mount) — HTML runs as a whole page with its own scripts, ESM behind an import map, framework code as markup (13.2). true / 'auto' (13.7) fall back to the static checks when no browser is available; the result's mode says which ran" } }, additionalProperties: false }, annotations: { title: 'Validate snippet', ...RO } },
  { name: 'check_compatibility', title: 'Check compatibility (framework / version / browser)', description: "13.7: can these components (or the components a snippet uses) run in the user's setup? Per component: the motionary version that added it and releases that changed it after the given version, support and setup notes for html / esm / react / vue / svelte / solid / angular, the engines the browser suite tests every component in (Chromium, Firefox, WebKit), minimum browser versions and the web-platform features it needs with the fallback it uses. compatible is false when any component is unknown or newer than the version.", inputSchema: { type: 'object', properties: { tags: { type: 'array', items: { type: 'string' } }, code: { type: 'string', description: 'or: a snippet — its <usa-*> components are checked' }, framework: { type: 'string', enum: ['html', 'esm', 'react', 'vue', 'svelte', 'solid', 'angular'] }, version: { type: 'string', description: "the motionary version installed in the user's project (default: ./node_modules/motionary, else the catalog version)" }, browsers: { type: 'array', items: { type: 'string' }, description: "e.g. ['safari 16', 'firefox']" }, scene: { type: 'object', description: '14.6: or a scene object (Scene v3 or v2; 3.0: objects only) — the components its layers bind are checked' } }, additionalProperties: false }, outputSchema: { type: 'object', properties: { schema: { const: SCHEMAS.compatibility }, version: { type: 'string' }, catalog: { type: 'string' }, behind: { type: 'boolean' }, compatible: { type: 'boolean' }, components: { type: 'array' }, issues: { type: 'array' } }, required: ['schema', 'version', 'compatible', 'components', 'issues'] }, annotations: { title: 'Check compatibility', ...RO } },
  { name: 'suggest_fix', title: 'Suggest fixes for a snippet', description: "13.7: concrete patches for code that uses <usa-*> components — wrong tag names (closest real tag), mistyped / deprecated attributes, components used but never imported or defined, bare `motionary/…` imports in a CDN page (→ the CDN module URL of the same major), missing motionary/runtime prerequisites, import paths / event names / CDN pins removed in 13.0. Each fix is { kind, message, line, patch: { find, replace } }; fixed is the code with every patch applied and remaining what the static validator still reports. Never writes files.", inputSchema: { type: 'object', properties: { code: { type: 'string' }, context: { type: 'string', enum: ['cdn', 'esm', 'html'], description: 'how the code loads Motionary (default: detected)' }, scene: { type: 'object', description: '14.6: instead of code — a scene object (Scene v3 or v2, read as v2; 3.0: objects only); the answer adds sceneFixes (Scene v2 ops in the applyCanvasOps format: closest tag for a typo, drop a binding the installed version lacks, default easing for an unknown one) and fixedScene' }, version: { type: 'string', description: "14.6, with scene: the motionary version installed in the user's project" } }, additionalProperties: false }, outputSchema: { type: 'object', properties: { schema: { const: SCHEMAS.fix }, context: { type: 'string' }, fixes: { type: 'array', items: { type: 'object', properties: { kind: { type: 'string', enum: ['unknown-tag', 'unknown-attribute', 'deprecated-attribute', 'deprecated-api', 'bare-import', 'missing-import', 'missing-prerequisite'] }, message: { type: 'string' }, line: { type: 'number' }, patch: { type: 'object', properties: { find: { type: 'string' }, replace: { type: 'string' } }, required: ['find', 'replace'] } }, required: ['kind', 'message', 'patch'] } }, fixed: { type: 'string' }, valid: { type: 'boolean' }, remaining: { type: 'object' }, sceneFixes: { type: 'array' }, fixedScene: { type: 'object' } }, required: ['schema', 'fixes', 'fixed', 'valid'] }, annotations: { title: 'Suggest fix', ...RO } },
  { name: 'list_templates', title: 'List Studio templates', description: '14.8: the starter Motion Studio templates shipped with Motionary (motionary-template v1: data only, SHA-256 integrity checked before listing) — id, name, version, SPDX license, author, required Motionary modules, layer / file counts. query filters by id / name / description.', inputSchema: { type: 'object', properties: { query: { type: 'string' } }, additionalProperties: false }, outputSchema: { type: 'object', properties: { schema: { const: SCHEMAS.listTemplates }, count: { type: 'number' }, templates: { type: 'array' } }, required: ['schema', 'count', 'templates'] }, annotations: { title: 'List templates', ...RO } },
  { name: 'get_template', title: 'Get a Studio template', description: '14.8: one shipped template: manifest (license, requires, token theme, preview time), info, its Scene v2 document and a still preview (one inline HTML file without scripts, for a sandboxed iframe). Install it in an app with motionary/studio/templates installTemplate (one undo step, uninstall restores the project byte for byte).', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'], additionalProperties: false }, outputSchema: { type: 'object', properties: { schema: { const: SCHEMAS.getTemplate }, manifest: { type: 'object' }, info: { type: 'object' }, verified: { type: 'boolean' }, scene: { type: 'object' }, preview: { type: 'object' } }, required: ['schema', 'manifest', 'info', 'verified', 'scene'] }, annotations: { title: 'Get template', ...RO } },
  { name: 'export_scene', title: 'Export a scene as a standalone page', description: '14.8: a scene object (Scene v3 or v2), a Studio project or a shipped template → the 14.7 standalone export (motionary/studio/export): index.html + scene.css (plays with scripts off) + optional scene.js player + assets/, or one inline file; byte-reproducible, with the frameDigest fingerprint and a report of anything left out. Returns the files (utf8 text, binary as base64); writes nothing.', inputSchema: { type: 'object', properties: { scene: { type: 'object', description: 'a scene object: Scene v3 (16.0) or Scene v2 — JSON text was removed in motionary-mcp 3.0' }, project: { type: 'object', description: 'or a motionary-studio project (object)' }, template: { type: 'string', description: 'or a shipped template id (list_templates)' }, inline: { type: 'boolean', default: false }, js: { type: 'boolean', default: true }, fps: { type: 'number', default: 60 }, title: { type: 'string' } }, additionalProperties: false }, outputSchema: { type: 'object', properties: { schema: { const: SCHEMAS.exportScene }, digest: { type: 'string' }, files: { type: 'array' }, report: { type: 'object' } }, required: ['schema', 'digest', 'files', 'report'] }, annotations: { title: 'Export scene', ...RO } },
  { name: 'propose_edit', title: 'Propose a scene edit (never writes)', description: '15.1: a prompt + a scene object (Scene v3 or v2, edited as v2) → a validated edit proposal: Scene v2 ops with a sentence each, the JSON diff, the changed layer ids, the preview document and the schema / compatibility / render checks. Nothing is written — the caller (Motion Studio) applies it only after a person accepts it (motionary/studio/ai review + motionary/studio/provenance). The answer carries provenance { generator, requestId }: requestId is the argument or the MCP params._meta.correlationId (the client correlation id that MCP Gateway 15.1 canary keeps with the call lineage).', inputSchema: { type: 'object', properties: { scene: { type: 'object', description: 'a scene object: Scene v3 (16.0) or Scene v2 — JSON text was removed in motionary-mcp 3.0' }, prompt: { type: 'string' }, selection: { type: 'array', items: { type: 'string' }, description: 'only touch these layer ids (new layers are allowed)' }, requestId: { type: 'string', description: 'correlation id, 1–128 of A–Z a–z 0–9 . _ : -' } }, required: ['scene', 'prompt'], additionalProperties: false }, outputSchema: { type: 'object', properties: { schema: { const: SCHEMAS.proposeEdit }, ok: { type: 'boolean' }, applied: { const: false }, ops: { type: 'array' }, diff: { type: 'array' }, layers: { type: 'array' }, preview: { type: 'object' }, provenance: { type: 'object' } }, required: ['schema', 'ok', 'applied', 'ops', 'diff', 'layers', 'provenance'] }, annotations: { title: 'Propose edit', ...RO } },
  { name: 'validate_scene', title: 'Validate a scene', description: "15.9; 3.0 (16.0) accepts Scene v3 (flat or nested, read through sceneV3ToV2 — lost features listed) or Scene v2 objects → schema problems, component compatibility with the installed version and a headless render of every frame; ops (Scene v2 ops, parsed as data) are applied to a copy first; browser also renders it in a real headless browser. The same checks validate_snippet { scene } runs — motionary-mcp 3.0 (16.0) keeps scenes here only, so prefer this tool. Pass the scene as an object (JSON text still works in 2.x and returns a deprecation).", inputSchema: { type: 'object', properties: { scene: { type: 'object', description: 'a scene object: Scene v3 (16.0) or Scene v2 — JSON text was removed in motionary-mcp 3.0' }, ops: { type: 'array', items: { type: 'object' }, description: 'Scene v2 ops (motionary/studio/ai, applyCanvasOps format) applied to a copy first — parsed as data, never evaluated' }, version: { type: 'string', description: "the motionary version installed in the user's project" }, browser: { type: ['boolean', 'string'], enum: [true, false, 'auto'], default: false, description: 'also render it in a real headless browser (Playwright, optional peer)' } }, required: ['scene'], additionalProperties: false }, outputSchema: { type: 'object', properties: { schema: { const: SCHEMAS.scene }, valid: { type: 'boolean' }, mode: { type: 'string' }, problems: { type: 'array' }, compatibility: { type: 'array' }, render: { type: 'object' }, deprecations: { type: 'array' } }, required: ['schema', 'valid', 'problems'] }, annotations: { title: 'Validate scene', ...RO } },
];

// ---------------------------------------------------------------- 2.4 (15.1): propose_edit (never writes)
/** The MCP Gateway correlation-id rule (Gateway 15.1 canary keeps it with the call lineage): 1–128 of A–Z a–z 0–9 . _ : - */
export const REQUEST_ID_RE = /^[A-Za-z0-9._:-]{1,128}$/;
const layerIdsChanged = (a, b) => {
  const key = (d) => new Map((d.layers || []).filter((l) => l && typeof l.id === 'string').map((l) => [l.id, JSON.stringify(l)]));
  const x = key(a), y = key(b), out = [];
  for (const [id, v] of y) if (x.get(id) !== v) out.push(id);
  for (const id of x.keys()) if (!y.has(id)) out.push(id);
  return out.sort();
};
/** propose_edit: prompt + Scene v2 → a validated proposal (ops, JSON diff, changed layers, preview) + a provenance value. Writes nothing. */
export async function proposeEdit(m, a, ctx = {}) {
  if (typeof a.prompt !== 'string' || !a.prompt.trim()) throw new Error('prompt is required');
  const sa = sceneArg(a);
  if (sa.problems) throw new Error(`scene: ${sa.problems[0].message}`);
  const rid = a.requestId !== undefined ? a.requestId : ctx.correlationId;
  if (rid !== undefined && !(typeof rid === 'string' && REQUEST_ID_RE.test(rid))) throw new Error('requestId: 1–128 characters of A–Z a–z 0–9 . _ : - (the MCP Gateway correlation-id rule)');
  if (a.selection !== undefined && !(Array.isArray(a.selection) && a.selection.every((x) => typeof x === 'string'))) throw new Error('selection: expected an array of layer ids');
  const S = needSai(), base = JSON.parse(JSON.stringify(sa.scene));
  const opts = { catalog: catalogOf(m), version: installedVersion() || m.version, ...(a.selection && a.selection.length && { selection: a.selection }) };
  const p = await S.proposeAiEdit(base, a.prompt, opts);
  return {
    schema: SCHEMAS.proposeEdit, ok: p.ok, applied: false, summary: p.summary, source: p.source,
    ops: p.ops.map((x) => ({ index: x.index, op: x.op, text: x.text, ...(x.reason && { reason: x.reason }) })),
    diff: p.diff, layers: p.ok ? layerIdsChanged(base, p.preview) : [], preview: p.preview,
    checks: { schema: p.checks.schema.length, compatibility: p.checks.compatibility.length, render: { ok: p.checks.render.ok, frames: p.checks.render.frames } },
    errors: p.errors, fixes: p.fixes,
    provenance: { generator: 'motionary-mcp/propose_edit', ...(rid !== undefined && { requestId: rid }) },
  };
}

const text = (obj) => ({ content: [{ type: 'text', text: typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2) }], ...(typeof obj === 'object' ? { structuredContent: Array.isArray(obj) ? { items: obj } : obj } : {}) });

for (const t of TOOLS) t._meta = { 'motionary/schemaVersion': TOOL_SCHEMA_VERSIONS[t.name] };

// ---------------------------------------------------------------- 3.0 (16.0): the 2.x shapes announced in 2.5 are removed
const REMOVED_3 = {
  check_compat: 'check_compat was removed in motionary-mcp 3.0 — call check_compatibility { tags, version } (docs/deprecations-v16.md#mcp-check-compat)',
};
/** Call one tool. 3.0: check_compat and validate_snippet { scene } are refused with a pointer; scenes are objects (v3 or v2). */
export function callTool(m, name, a = {}, ctx = {}) {
  if (REMOVED_3[name]) throw Object.assign(new Error(REMOVED_3[name]), { code: -32602 });
  if (name === 'validate_snippet' && a && a.scene !== undefined) throw new Error('validate_snippet takes code only in motionary-mcp 3.0 — call validate_scene { scene } (docs/deprecations-v16.md#mcp-snippet-scene)');
  return callTool2(m, name, a, ctx);
}

function callTool2(m, name, a = {}, ctx = {}) {
  indexModules(m);
  switch (name) {
    case 'list_components': {
      let list = m.components;
      if (a.category) list = list.filter((c) => norm(c.category) === norm(a.category));
      if (a.requires) {
        const r = norm(a.requires).replace(/^motionary\/runtime\/?/, '') || 'core';
        list = r === 'none' ? list.filter((c) => !c.requires.length) : list.filter((c) => c.requires.includes(r));
      }
      if (a.since) {
        const v = (s) => String(s || '0').split('.').map(Number);
        const [M, n] = v(a.since);
        list = list.filter((c) => c.since && (v(c.since)[0] > M || (v(c.since)[0] === M && (v(c.since)[1] || 0) >= (n || 0))));
      }
      const iv = a.version || installedVersion();
      if (a.version) list = list.filter((c) => compatAt(c, a.version).available);
      const items = list.slice(0, a.limit || 500).map(brief);
      return text({ version: m.version, ...(iv ? { installed: iv } : {}), count: items.length, total: m.components.length, components: items });
    }
    case 'search_components':
      if (!a.query) throw new Error('query is required');
      return text({ query: a.query, results: searchComponents(m, a.query, a.limit || 10) });
    case 'get_component': {
      const c = findComponent(m, a.tag);
      if (!c) throw new Error(`unknown component ${a.tag} — use search_components`);
      const iv = a.version || installedVersion();
      return text(iv ? { ...c, compat: { installed: iv, ...compatAt(c, iv) } } : c);
    }
    case 'get_example': {
      const c = findComponent(m, a.tag);
      if (!c) throw new Error(`unknown component ${a.tag} — use search_components`);
      const v = a.variant || 'html';
      if (v === 'esm') return text(c.prerequisites ? `// ${c.prerequisites.install}\n${c.prerequisites.importAndRegister}\n\n/* HTML:\n${c.example}\n*/` : c.esm);
      if (v === 'html') return text(scaffold(m, [c.tag], 'html').code);
      const variant = (c.variants || []).find((x) => x.id === v);
      if (!variant) throw new Error(`no variant ${v} for ${c.tag}; variants: ${(c.variants || []).map((x) => x.id).join(', ') || 'none'}`);
      return text(variant.example);
    }
    case 'scaffold_snippet':
      if (!Array.isArray(a.tags) || !a.tags.length) throw new Error('tags must be a non-empty array');
      return text(scaffold(m, a.tags, a.framework || 'esm'));
    case 'suggest_motion':
      if (!a.text) throw new Error('text is required');
      if (a.format === 'scene') {
        const S = needSai(), opts = { catalog: catalogOf(m), version: installedVersion() || m.version };
        const empty = { format: 'motionary-scene', version: 2, layers: [] };
        const edit = S.localAiEdit(String(a.text), empty, opts);
        const ops = S.parseAiEdit(edit).ops;
        return S.validateAiEdit(empty, ops, opts).then((v) => text({ ...suggestMotion(m, a.text, 'waapi'), format: 'scene', scene: v.preview, ops, valid: v.ok, problems: v.errors }));
      }
      return text(suggestMotion(m, a.text, a.format || 'waapi'));
    case 'validate_snippet':
      if (typeof a.code !== 'string') throw new Error('code is required (scenes: validate_scene)');
      // 13.7: browser: true | 'auto' — a real headless browser when Playwright + a browser are available, otherwise the static
      // checks (mode says which ran; mount.skipped says why the browser did not)
      if (a.browser) return validateSnippetInBrowser(m, a.code).then((r) => text({ ...r, mode: r.mount?.mounted ? 'browser' : 'static', schema: SCHEMAS.validation }));
      if (a.mount) return validateSnippetMounted(m, a.code).then(text);
      return text(validateSnippet(m, a.code));
    case 'check_compatibility': {
      if (a.scene !== undefined) {
        const sa = sceneArg(a);
        if (sa.problems) throw new Error(`scene: ${sa.problems[0].message}`);
        const tags = [...(a.tags || []), ...sceneTags(sa.scene)];
        const { scene, ...rest } = a;
        if (!tags.length && !a.code) return text({ schema: SCHEMAS.compatibility, version: a.version || installedVersion() || m.version, catalog: m.version, behind: false, compatible: true, components: [], issues: [] });
        return text(checkCompatibility(m, { ...rest, tags }, { findComponent, installedVersion, validateSnippet }));
      }
      return text(checkCompatibility(m, a, { findComponent, installedVersion, validateSnippet }));
    }
    case 'suggest_fix':
      if (a.scene !== undefined && typeof a.code !== 'string') {
        const sa = sceneArg(a);
        if (sa.problems) throw new Error(`scene: ${sa.problems[0].message}`);
        const S = needSai(), opts = { catalog: catalogOf(m), version: a.version || installedVersion() || m.version };
        const f = S.suggestSceneFixes(sa.scene, opts);
        return S.validateAiEdit(sa.scene, f.ops, opts).then((v) => text({ schema: SCHEMAS.fix, context: 'scene', fixes: [], fixed: JSON.stringify(v.preview, null, 2), valid: v.ok, remaining: { errors: v.errors.map((e) => `${e.path}: ${e.message}`), warnings: v.checks.compatibility.filter((i) => i.level === 'warning').map((i) => i.message) }, sceneFixes: f.ops, messages: f.messages, fixedScene: v.preview }));
      }
      if (typeof a.code !== 'string') throw new Error('code is required (or scene)');
      return text(suggestFix(m, a.code, { context: a.context }, { findComponent, cdnImports, validateSnippet, searchComponents }));
    case 'list_templates': {
      const q = String(a.query || '').toLowerCase().trim();
      const list = shippedTemplates().filter((x) => x.ok).map(templateBrief).filter((x) => !q || [x.id, x.name, x.description || ''].some((s) => s.toLowerCase().includes(q)));
      return text({ schema: SCHEMAS.listTemplates, count: list.length, templates: list });
    }
    case 'get_template': {
      const x = findTemplate(a.id), S = needMod(STP, 'studio-templates');
      const scene = JSON.parse(x.template.pack).project.scene; // the pack's Scene v2 document (already checked by parseTemplate)
      return text({ schema: SCHEMAS.getTemplate, manifest: x.template.manifest, info: x.info, verified: true, integrity: x.template.integrity, scene, preview: S.previewTemplate(x.template) });
    }
    case 'export_scene':
      return text(exportScene(m, a));
    case 'propose_edit':
      return proposeEdit(m, a, ctx).then(text);
    case 'validate_scene':
      if (a.scene === undefined) throw new Error('scene is required');
      sceneObject(a.scene);
      return validateScene(m, a).then(text);
    default:
      throw Object.assign(new Error(`unknown tool ${name}`), { code: -32602 });
  }
}

export function resources(m) {
  return [
    { uri: 'motionary://manifest', name: 'manifest', title: 'Motionary component manifest (components.json)', mimeType: 'application/json' },
    { uri: 'motionary://llms.txt', name: 'llms.txt', title: 'Motionary llms.txt', mimeType: 'text/plain' },
  ];
}

export function readResource(m, uri) {
  if (uri === 'motionary://manifest') return { uri, mimeType: 'application/json', text: JSON.stringify(m) };
  if (uri === 'motionary://llms.txt') {
    const p = join(HERE, '../dist/llms.txt');
    const t = existsSync(p) ? readFileSync(p, 'utf8') : m.components.map((c) => `- <${c.tag}> (${c.import.path}): ${c.description}`).join('\n');
    return { uri, mimeType: 'text/plain', text: t };
  }
  const mm = /^motionary:\/\/component\/(.+)$/.exec(uri);
  if (mm) {
    const c = findComponent(m, decodeURIComponent(mm[1]));
    if (c) return { uri, mimeType: 'application/json', text: JSON.stringify(c, null, 2) };
  }
  throw Object.assign(new Error(`unknown resource ${uri}`), { code: -32002 });
}

/** Handle one JSON-RPC message; returns the response object (or null for notifications). */
export function handle(m, msg, state = {}) {
  const { id, method, params = {} } = msg || {};
  const isNote = id === undefined || id === null;
  const ok = (result) => (isNote ? null : { jsonrpc: '2.0', id, result });
  const err = (code, message) => (isNote ? null : { jsonrpc: '2.0', id, error: { code, message } });
  if (!msg || msg.jsonrpc !== '2.0' || typeof method !== 'string') return msg && 'result' in msg ? null : err(-32600, 'Invalid Request');
  try {
    switch (method) {
      case 'initialize': {
        const v = PROTOCOLS.includes(params.protocolVersion) ? params.protocolVersion : PROTOCOLS[0];
        state.initialized = true;
        return ok({ protocolVersion: v, capabilities: { tools: { listChanged: false }, resources: { listChanged: false, subscribe: false }, prompts: { listChanged: false }, logging: {} }, serverInfo: { ...SERVER, title: 'Motionary component catalog' }, instructions: `Read-only catalog of Motionary ${m.version} (${m.components.length} <usa-*> Web Components + motionary/runtime modules). Search or list to pick a component, get_component for its API, scaffold_snippet for code that already registers every prerequisite in the right order, suggest_motion to turn a description into motion code, validate_snippet to check code before you hand it over.` });
      }
      case 'ping':
        return ok({});
      case 'tools/list':
        return ok({ tools: TOOLS });
      case 'tools/call':
        try {
          const cid = params._meta && typeof params._meta.correlationId === 'string' ? params._meta.correlationId : undefined;
          const res = callTool(m, params.name, params.arguments || {}, cid ? { correlationId: cid } : {});
          if (res && typeof res.then === 'function') return res.then(ok, (e) => ok({ content: [{ type: 'text', text: String(e.message || e) }], isError: true }));
          return ok(res);
        } catch (e) {
          if (e.code === -32602) return err(-32602, e.message);
          return ok({ content: [{ type: 'text', text: String(e.message || e) }], isError: true });
        }
      case 'resources/list':
        return ok({ resources: resources(m) });
      case 'resources/templates/list':
        return ok({ resourceTemplates: [{ uriTemplate: 'motionary://component/{tag}', name: 'component', title: 'One Motionary component (JSON)', mimeType: 'application/json' }] });
      case 'resources/read':
        return ok({ contents: [readResource(m, params.uri)] });
      case 'prompts/list':
        return ok({ prompts: [] });
      case 'logging/setLevel':
        return ok({});
      default:
        if (method.startsWith('notifications/')) return null;
        return err(-32601, `Method not found: ${method}`);
    }
  } catch (e) {
    return err(e.code || -32603, String(e.message || e));
  }
}

export function serve(input = process.stdin, output = process.stdout, manifest) {
  const m = manifest || loadManifest();
  const state = {};
  const send = (o) => o && output.write(JSON.stringify(o) + '\n');
  const rl = createInterface({ input, crlfDelay: Infinity });
  rl.on('line', (line) => {
    if (!line.trim()) return;
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      return send({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } });
    }
    const out = (x) => { const r = handle(m, x, state); if (r && typeof r.then === 'function') r.then(send); else send(r); };
    if (Array.isArray(msg)) msg.forEach(out);
    else out(msg);
  });
  return rl;
}

const invoked = process.argv[1] && fileURLToPath(import.meta.url) === (await import('node:fs')).realpathSync(process.argv[1]);
if (invoked) {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log('motionary-mcp 2.0 — read-only MCP server (stdio) for the Motionary component catalog.\nConfigure your MCP client with: { "command": "npx", "args": ["-y", "-p", "motionary", "motionary-mcp"] }\nTools: ' + TOOLS.map((t) => t.name).join(', '));
  } else if (process.argv.includes('--version')) console.log(SERVER.version);
  else {
    try {
      await loadAi();
      await loadStudioAi();
      await loadStudioExport();
      await loadStudioTemplates();
      serve();
    } catch (e) {
      console.error(String(e.message || e));
      process.exit(1);
    }
  }
}
