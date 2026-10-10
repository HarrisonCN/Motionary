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
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createInterface } from 'node:readline';
import { pathToFileURL } from 'node:url';
import { mountSnippet } from './mcp-mount.mjs';
import { compatAt, cmpVer } from './compat-history.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const SERVER = { name: 'motionary-mcp', version: '2.0.0' };
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
  const words = norm(query).split(/[^a-z0-9\u00c0-\uffff-]+/).filter(Boolean);
  if (!words.length) return [];
  const scored = m.components.map((c) => {
    const tag = c.tag, title = norm(c.title), kw = (c.keywords || []).map(norm).join(' '), desc = norm(c.description), cat = norm(c.category);
    let s = 0;
    for (const w of words) {
      if (tag === `usa-${w}` || tag === w) s += 20;
      else if (tag.includes(w)) s += 8;
      if (title.includes(w)) s += 6;
      if (kw.includes(w)) s += 5;
      if (cat === w) s += 4;
      if (desc.includes(w)) s += 2;
      if ((c.attributes || []).includes(w)) s += 1;
    }
    return { c, s };
  });
  return scored.filter((x) => x.s > 0).sort((a, b) => b.s - a.s || a.c.tag.localeCompare(b.c.tag)).slice(0, limit).map((x) => ({ ...brief(x.c), score: x.s }));
}

const FRAMEWORKS = ['html', 'esm', 'react', 'vue', 'svelte'];
const runtimeCdn = (m, ids) => {
  const base = m.cdn.runtime.replace(/runtime\.iife\.js$/, '');
  return [`<script src="${m.cdn.runtime}"></script>`, ...ids.filter((i) => i !== 'core').map((i) => `<script src="${base}runtime/${i}.iife.js"></script>`)];
};
const runtimeImports = (ids) => {
  const mods = ids.filter((i) => i !== 'core');
  const camel = (id) => id.replace(/-(\w)/g, (_, c) => c.toUpperCase());
  return { lines: ["import { use } from 'motionary/runtime';", ...mods.map((i) => `import { ${camel(i)} } from 'motionary/runtime/${i}';`)], register: `use(${mods.map(camel).join(', ')});` };
};

/** A ready-to-paste snippet for one or more components, prerequisites first. */
export function scaffold(m, tags, framework = 'esm') {
  indexModules(m);
  if (!FRAMEWORKS.includes(framework)) throw new Error(`framework must be one of ${FRAMEWORKS.join(', ')}`);
  const comps = tags.map((t) => {
    const c = findComponent(m, t);
    if (!c) throw new Error(`unknown component ${t} — use search_components first`);
    return c;
  });
  const req = [...new Set(comps.flatMap((c) => c.requires))].filter((r) => !isPeer(r));
  const peerIds = [...new Set(comps.flatMap((c) => c.requires))].filter(isPeer);
  const peers = peerIds.map(reqLabel);
  const peerSetup = peerIds.map((r) => MOD.get(r)).filter(Boolean);
  const needsWidgets = comps.some((c) => /widgets\.umd/.test(c.cdn));
  const markup = comps.map((c) => c.example).join('\n');
  const byPath = new Map();
  for (const c of comps) byPath.set(c.import.path, [...(byPath.get(c.import.path) || []), c.import.define]);
  const defImports = [...byPath].map(([p, d]) => `import { ${[...new Set(d)].join(', ')} } from '${p}';`);
  const defCalls = [...new Set(comps.map((c) => c.import.register))];
  const install = ['npm i motionary', ...peers.map((p) => `npm i ${p}`)].join(' && ');
  const rt = req.length ? runtimeImports(req) : null;
  const prereqNote = req.length || peers.length ? `Prerequisites: ${[...req.map(reqLabel), ...peers].join(', ')} — register them before the components mount.` : 'No prerequisites.';
  let code;
  if (framework === 'html') {
    const esmOnly = comps.filter((c) => !/\.umd\.js$/.test(c.cdn));
    code = [
      '<!-- ' + prereqNote + ' -->',
      ...(req.length ? runtimeCdn(m, req) : []),
      ...peerSetup.map((p) => `<!-- ${p.label} (official runtime, lazy): -->\n${p.cdn}`),
      ...(comps.some((c) => /components\.umd/.test(c.cdn)) || !esmOnly.length ? [`<script src="${m.cdn.components}"></script>`] : []),
      ...(needsWidgets ? [`<script src="${m.cdn.widgets}"></script>`] : []),
      // 13.2: elements with their own entry (not in the no-build bundles) load as ES modules from the same CDN major
      ...(esmOnly.length ? [`<script type="module">\n${esmOnly.map((c) => `import { ${c.import.define} } from '${c.cdn}';`).join('\n')}\n${esmOnly.map((c) => c.import.register).join('\n')}\n</script>`] : []),
      '',
      markup,
    ].join('\n');
  } else {
    const setup = [...(rt ? [...rt.lines] : []), ...peerSetup.map((p) => p.import).filter((l) => !defImports.includes(l)), ...defImports, '', ...(rt ? [rt.register + ' // prerequisites first'] : []), ...peerSetup.map((p) => p.register), ...defCalls].join('\n');
    if (framework === 'esm') code = `// ${install}\n${setup}\n\n/* HTML:\n${markup}\n*/`;
    else if (framework === 'react') code = `// ${install}\n${setup}\n\nexport function Demo() {\n  return (\n    <>\n${markup.split('\n').map((l) => '      ' + l.replace(/\bclass=/g, 'className=')).join('\n')}\n    </>\n  );\n}`;
    else if (framework === 'vue') code = `<!-- ${install} -->\n<script setup>\n${setup}\n</script>\n\n<template>\n${markup.split('\n').map((l) => '  ' + l).join('\n')}\n</template>\n<!-- vite.config: vue({ template: { compilerOptions: { isCustomElement: (t) => t.startsWith('usa-') } } }) -->`;
    else code = `<!-- ${install} -->\n<script>\n${setup}\n</script>\n\n${markup}`;
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
    const attrs = [...rawAttrs.matchAll(/(?:^|\s)([:@]?[a-zA-Z_][\w:.-]*)(?=\s*=|\s|\/?$)/g)].map((x) => x[1].replace(/^[:@]/, '').replace(/^(?:v-bind|bind):/, '').toLowerCase());
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
    if (r !== 'core' && /\bimport\s/.test(src) && !new RegExp(`use\\([^)]*\\b${camelId(r)}\\b`).test(src)) errors.push(`${path} is imported but never registered: call use(${camelId(r)}) before the components mount`);
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
  { name: 'suggest_motion', title: 'Suggest a motion', description: 'Natural language (English or Chinese) → a motion spec: effect, direction, duration, easing, trigger, stagger, Web Animations keyframes + options, CSS, and the Motionary components that implement it, with prerequisite-aware code. Deterministic parser, no model, no network.', inputSchema: { type: 'object', properties: { text: { type: 'string', description: "e.g. 'fade the cards up slowly when they scroll into view, one after another'" }, format: { type: 'string', enum: ['waapi', 'css', 'component'], default: 'waapi' } }, required: ['text'], additionalProperties: false }, annotations: { title: 'Suggest motion', ...RO } },
  { name: 'validate_snippet', title: 'Validate a snippet', description: 'Check HTML / ESM / JSX / Vue / Svelte code that uses <usa-*> components: unknown tags (with suggestions) and attributes, missing or mis-ordered prerequisites (motionary/runtime modules, official runtimes), components never defined, hand-written animation without a reduced-motion path. Static analysis by default; mount: true also mounts the markup in a headless DOM (jsdom, optional peer) with the real Motionary bundles and checks definitions, upgrade errors, prerequisites, observed attributes and event names against the component contract — the snippet\'s own scripts never run.', inputSchema: { type: 'object', properties: { code: { type: 'string' }, mount: { type: 'boolean', default: false, description: 'also mount the markup in jsdom with the real bundles (12.2)' } }, required: ['code'], additionalProperties: false }, annotations: { title: 'Validate snippet', ...RO } },
  { name: 'check_compat', title: 'Check version compatibility', description: "Which components / runtime modules a project on a given motionary version can use, which were added later (with the release that added them) and which changed after it (from the release notes). Defaults to the version installed in the user's project.", inputSchema: { type: 'object', properties: { version: { type: 'string', description: "the motionary version installed in the user's project (default: ./node_modules/motionary, else the catalog version) — answers are filtered for it" }, tags: { type: 'array', items: { type: 'string' }, description: 'only these components (default: everything that is missing or changed for that version)' } }, additionalProperties: false }, annotations: { title: 'Check compatibility', ...RO } },
];

const text = (obj) => ({ content: [{ type: 'text', text: typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2) }], ...(typeof obj === 'object' ? { structuredContent: Array.isArray(obj) ? { items: obj } : obj } : {}) });

export function callTool(m, name, a = {}) {
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
      return text(suggestMotion(m, a.text, a.format || 'waapi'));
    case 'check_compat':
      return text(checkCompat(m, a.version, a.tags));
    case 'validate_snippet':
      if (typeof a.code !== 'string') throw new Error('code is required');
      if (a.mount) return validateSnippetMounted(m, a.code).then(text);
      return text(validateSnippet(m, a.code));
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
          const res = callTool(m, params.name, params.arguments || {});
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
      serve();
    } catch (e) {
      console.error(String(e.message || e));
      process.exit(1);
    }
  }
}
