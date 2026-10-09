// 10.1: build the AI-readable component manifest and llms.txt files from the
// source (tags, observed attributes, events, slots, methods) and the gallery
// catalog (titles, descriptions, examples, prerequisites).
//   dist/manifest.json        (npm: motionary/manifest.json; Pages: /components.json)
//   dist/manifest.schema.json (Pages: /components.schema.json)
//   dist/llms.txt, dist/llms-full.txt (Pages root)
// `node scripts/gen-manifest.mjs --stdout` prints the manifest instead.
import { existsSync, readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, relative } from 'node:path';
import { COMPONENTS, componentSnippets } from '../showcase/components-catalog.js';
import { PREREQS, prereqFor, RUNTIME_CDN } from '../showcase/catalog/prereqs.js';

const HERE = (() => { try { return fileURLToPath(new URL('..', import.meta.url)); } catch { return ''; } })();
const ROOT = HERE && existsSync(join(HERE, 'package.json')) ? HERE : process.cwd();
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const MAJOR = pkg.version.split('.')[0];
const PAGES = 'https://harrisoncn.github.io/Motionary/';

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.ts') && !p.endsWith('.d.ts') ? [p] : [];
  });
}

/** tag → { file, dir, attributes, events, slots, methods, doc } scanned from src/components. */
export function scanSource() {
  const out = {};
  for (const file of walk(join(ROOT, 'src/components'))) {
    const s = readFileSync(file, 'utf8');
    const re = /export function (define\w+)\(tag = '([a-z][a-z0-9]*-[a-z0-9-]+)'/g;
    const hits = [...s.matchAll(re)];
    hits.forEach((m, i) => {
      const body = s.slice(m.index, hits[i + 1]?.index ?? s.length);
      const attrs = /observedAttributes\(\)[^{]*\{\s*return \[([\s\S]*?)\];/.exec(body); // [\s\S]*?\]; — a spread like `...(X.observedAttributes || [])` must not end the list early
      const attributes = attrs ? [...attrs[1].matchAll(/'([^']+)'/g)].map((x) => x[1]) : [];
      const events = [...new Set([...body.matchAll(/\.emit\(\s*'([\w:-]+)'/g)].map((x) => 'usa:' + x[1]))];
      if (/usa:runtime-missing|runtimeModule</.test(body)) events.push('usa:runtime-missing');
      const slots = [...new Set([...body.matchAll(/<slot(?:\s+name="([\w-]+)")?/g)].map((x) => x[1] || 'default'))];
      const before = s.slice(0, m.index);
      const docs = [...before.matchAll(/\/\*\*([\s\S]*?)\*\//g)];
      const doc = docs.length ? docs[docs.length - 1][1].replace(/^\s*\* ?/gm, '').trim() : '';
      // methods from the element interface declared in the same file
      const iname = /export interface (Usa\w+Element) extends/.exec(before.slice(-4000))?.[1];
      let methods = [];
      if (iname) {
        const ib = new RegExp(`export interface ${iname} extends [^{]+\\{([\\s\\S]*?)\\n\\}`).exec(s);
        if (ib) methods = [...ib[1].matchAll(/^\s+(\w+)\(/gm)].map((x) => x[1]);
      }
      out[m[2]] ||= { file: relative(ROOT, file), dir: relative(join(ROOT, 'src/components'), file).split('/')[0], define: m[1], attributes, events, slots, methods, doc };
    });
  }
  return out;
}

const strip = (s) => (s || '').replace(/\s+/g, ' ').trim();

// schema v2: components deprecated for the next major (tag → { since, removedIn, use })
const PER_ENTRY = JSON.parse(readFileSync(new URL('./entries.json', import.meta.url), 'utf8'));
const ENTRY_BY_TAG = Object.fromEntries(PER_ENTRY.filter((e) => e.kind === 'widget').map((e) => [e.tag, e.entry]));
export const DEPRECATED = { 'usa-three-scene': { since: '10.9', removedIn: '11.0', use: 'usa-gl-scene' } };

export function buildManifest() {
  const src = scanSource();
  const byTag = new Map();
  for (const c of COMPONENTS) {
    if (!c.tag) continue;
    if (!byTag.has(c.tag)) byTag.set(c.tag, []);
    byTag.get(c.tag).push(c);
  }
  const components = [];
  for (const [tag, cards] of byTag) {
    const c = cards[0];
    const s = src[tag] || { attributes: [], events: [], slots: [], methods: [] };
    const sn = componentSnippets(c);
    const requires = [...new Set(cards.flatMap((x) => x.requires || []))];
    const entry = {
      id: c.id,
      tag,
      title: c.title.en,
      description: strip(c.desc.en),
      category: c.category,
      since: c.since || undefined,
      keywords: c.tags || [],
      import: { path: `motionary/components/${c.entry || c.category}`, define: c.define, register: `${c.define}();` },
      cdn: c.entry === 'widgets' || c.reg ? `https://unpkg.com/motionary@${MAJOR}/dist/widgets.umd.js` : `https://unpkg.com/motionary@${MAJOR}/dist/components.umd.js`,
      attributes: s.attributes,
      events: s.events,
      slots: s.slots,
      methods: s.methods,
      example: c.usage,
      esm: sn.esm,
      requires,
      prerequisites: requires.length ? prereqFor({ ...c, requires }) : null,
      // schema v2 (10.9): stability, deprecation, own entry
      entry: ENTRY_BY_TAG[tag] || null,
      stability: DEPRECATED[tag] ? 'deprecated' : 'stable',
      deprecated: DEPRECATED[tag] || null,
      source: s.file,
    };
    if (cards.length > 1) entry.variants = cards.map((x) => ({ id: x.id, title: x.title.en, description: strip(x.desc.en), example: x.usage }));
    components.push(entry);
  }
  // elements without a gallery card still get an entry (from the source doc comment)
  for (const [tag, s] of Object.entries(src)) {
    if (byTag.has(tag)) continue;
    components.push({
      id: tag.replace(/^usa-/, ''),
      tag,
      title: `<${tag}>`,
      description: strip(s.doc.split('\n\n')[0]).slice(0, 400) || `<${tag}> element.`,
      category: s.dir,
      import: { path: `motionary/components/${s.dir}`, define: s.define, register: `${s.define}();` },
      cdn: `https://unpkg.com/motionary@${MAJOR}/dist/${s.dir === 'widgets' ? 'widgets' : 'components'}.umd.js`,
      attributes: s.attributes,
      events: s.events,
      slots: s.slots,
      methods: s.methods,
      example: `<${tag}></${tag}>`,
      requires: [],
      prerequisites: null,
      entry: ENTRY_BY_TAG[tag] || null,
      stability: DEPRECATED[tag] ? 'deprecated' : 'stable',
      deprecated: DEPRECATED[tag] || null,
      source: s.file,
    });
  }
  components.sort((a, b) => a.tag.localeCompare(b.tag));
  return {
    $schema: `${PAGES}components.schema.json`,
    format: 'motionary/components',
    schemaVersion: 2,
    stability: MAJOR >= 11 ? 'stable' : 'release-candidate',
    package: pkg.name,
    version: pkg.version,
    homepage: PAGES,
    llms: `${PAGES}llms.txt`,
    cdn: { components: `https://unpkg.com/motionary@${MAJOR}/dist/components.umd.js`, widgets: `https://unpkg.com/motionary@${MAJOR}/dist/widgets.umd.js`, runtime: `${RUNTIME_CDN}runtime.iife.js` },
    runtimeModules: Object.values(PREREQS).map((p) => ({ ...p, optional: p.kind === 'peer', stability: 'stable' })),
    components,
    effects: PER_ENTRY.filter((e) => e.kind === 'effect').map((e) => ({ name: e.name, pack: e.pack, entry: e.entry, register: `${e.register}();` })),
  };
}

export function llms(m) {
  const lines = [
    `# Motionary ${m.version}`,
    '',
    '> Motionary is a zero-dependency motion library: scroll animations, 200+ presets and ' + m.components.length + ' animated Web Components (<usa-*>) that work in plain HTML and every framework, plus motionary/runtime — its own tween/timeline engine and format loaders.',
    '',
    `Install: \`npm i ${m.package}\` · CDN: ${m.cdn.components} (+ ${m.cdn.widgets} for 6.x+ widgets) · Manifest: ${m.homepage}components.json · Full text: ${m.homepage}llms-full.txt`,
    '',
    'Rules for using a component: (1) import its define function from `import.path` and call it once (or load the CDN bundle); (2) if `requires` is non-empty, install / import / register the prerequisites first (see the component\'s Prerequisites); (3) then use the tag in HTML.',
    '',
    '## Runtime modules',
    '',
    ...m.runtimeModules.map((r) => `- [${r.label}](${'https://github.com/HarrisonCN/Motionary/blob/main/' + r.docs}): ${r.summary}`),
    '',
    '## Components',
    '',
    ...m.components.map((c) => `- \`<${c.tag}>\` (${c.import.path}${c.requires.length ? `; requires ${c.requires.map((r) => PREREQS[r]?.label || r).join(' + ')}` : ''}): ${c.description.slice(0, 160)}`),
    '',
  ];
  return lines.join('\n');
}

export function llmsFull(m) {
  const out = [`# Motionary ${m.version} — full component reference`, '', `Generated from the source. Machine-readable version: ${m.homepage}components.json (schema ${m.homepage}components.schema.json).`, ''];
  out.push('## Runtime modules', '');
  for (const r of m.runtimeModules) {
    out.push(`### ${r.label} — ${r.title}`, '', r.summary, '', `- Install: \`${r.install}\``, `- Import: \`${r.importPath}\``, `- Register: \`${r.register}\` — ${r.order}`, `- CDN:`, '', '```html', r.cdn, '```', '', '```js', r.example, '```', '');
  }
  out.push('## Components', '');
  for (const c of m.components) {
    out.push(`### <${c.tag}> — ${c.title}`, '', c.description, '', `- Import: \`import { ${c.import.define} } from '${c.import.path}'; ${c.import.register}\``, `- CDN: ${c.cdn}`);
    if (c.attributes.length) out.push(`- Attributes: ${c.attributes.map((a) => '`' + a + '`').join(', ')}`);
    if (c.events.length) out.push(`- Events: ${c.events.map((a) => '`' + a + '`').join(', ')}`);
    if (c.slots.length) out.push(`- Slots: ${c.slots.join(', ')}`);
    if (c.methods?.length) out.push(`- Methods: ${c.methods.map((a) => '`' + a + '()`').join(', ')}`);
    if (c.prerequisites) {
      const p = c.prerequisites;
      out.push(`- ${p.badge}`, `  - Install: \`${p.install}\``, `  - Order: ${p.order}`, '', '```js', p.importAndRegister, '```', '', '```html', p.cdn, '```');
    }
    out.push('', '```html', c.example, '```', '');
  }
  return out.join('\n');
}

if (process.argv[1]?.endsWith('gen-manifest.mjs')) {
  const m = buildManifest();
  if (process.argv.includes('--stdout')) console.log(JSON.stringify(m, null, 2));
  else {
    mkdirSync(join(ROOT, 'dist'), { recursive: true });
    writeFileSync(join(ROOT, 'dist/manifest.json'), JSON.stringify(m, null, 2) + '\n');
    writeFileSync(join(ROOT, 'dist/manifest.schema.json'), readFileSync(join(ROOT, 'scripts/manifest.schema.json')));
    writeFileSync(join(ROOT, 'dist/llms.txt'), llms(m));
    writeFileSync(join(ROOT, 'dist/llms-full.txt'), llmsFull(m));
    console.log(`manifest: ${m.components.length} components, ${m.runtimeModules.length} runtime modules → dist/manifest.json, dist/llms.txt, dist/llms-full.txt`);
  }
}
