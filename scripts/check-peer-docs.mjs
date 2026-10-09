// 10.1: CI check — every component that needs a motionary/runtime module (or,
// from 10.6, an official third-party runtime) documents its prerequisites in all
// five places: gallery card, Store detail, docs page, README section, AI manifest.
// Each place must carry: install command, import path + registration, CDN URL, minimal example.
// Also: every requireModule / runtimeModule call in src/components is declared on its card,
// every runtime module has a docs page with a compatibility table and a size budget,
// and the generated docs are current. Run after `npm run build` (reads dist/manifest.json).
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { COMPONENTS } from '../showcase/components-catalog.js';
import { COMPONENT_ITEMS } from '../showcase/catalog-components.js';
import { PREREQS, prereqFor } from '../showcase/catalog/prereqs.js';

const HERE = (() => { try { return fileURLToPath(new URL('..', import.meta.url)); } catch { return ''; } })();
const ROOT = HERE && existsSync(join(HERE, 'package.json')) ? HERE : process.cwd();
const read = (f) => readFileSync(join(ROOT, f), 'utf8');
const errors = [];
const fail = (where, msg) => errors.push(`${where}: ${msg}`);

// 0. generated docs are current
try {
  execFileSync(process.execPath, [join(ROOT, 'scripts/gen-runtime-docs.mjs'), '--check'], { stdio: 'pipe' });
} catch (e) {
  fail('docs', String(e.stderr || e.message).trim());
}

// 1. runtime modules: docs page, compat table, budget, size-budget.json entry
const budgets = JSON.parse(read('size-budget.json'));
for (const p of Object.values(PREREQS)) {
  for (const k of ['install', 'importPath', 'import', 'register', 'cdn', 'order', 'example', 'docs']) if (!p[k]) fail(p.label, `missing "${k}"`);
  if (!existsSync(join(ROOT, p.docs))) fail(p.label, `no docs page ${p.docs}`);
  else {
    const d = read(p.docs);
    for (const s of [p.install, p.importPath, p.register, p.cdn.split('\n').pop(), '## Compatibility', '## Example']) if (!d.includes(s)) fail(p.docs, `missing ${JSON.stringify(s)}`);
  }
  if (p.kind === 'runtime') {
    if (!p.compat?.length) fail(p.label, 'no compatibility table');
    if (!budgets.some((b) => b.name.startsWith(`import '${p.importPath}'`))) fail(p.label, `no gzip budget in size-budget.json ("import '${p.importPath}'")`);
  }
}

// 2. requireModule()/runtimeModule() calls in components are declared on their cards
function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.ts') ? [p] : [];
  });
}
for (const file of walk(join(ROOT, 'src/components'))) {
  const s = readFileSync(file, 'utf8');
  const tags = [...s.matchAll(/export function define\w+\(tag = '([\w-]+)'/g)].map((m) => m[1]);
  const mods = [...new Set([...s.matchAll(/(?:runtimeModule<[^>]*>|runtimeModule|requireModule<[^>]*>|requireModule|requirePeer<[^>]*>|requirePeer)\(\s*this\s*,\s*'([\w@/.-]+)'/g)].map((m) => m[1]))];
  for (const tag of tags) for (const id of mods) {
    const card = COMPONENTS.find((c) => c.tag === tag);
    if (!card) fail(`<${tag}>`, `uses ${id} but has no gallery card`);
    else if (!card.requires?.includes(id)) fail(`<${tag}>`, `uses ${id} but its card does not declare requires: ['${id}']`);
  }
}

// 3. the five places, per component
const manifest = existsSync(join(ROOT, 'dist/manifest.json')) ? JSON.parse(read('dist/manifest.json')) : null;
if (!manifest) fail('manifest', 'dist/manifest.json missing — run npm run build first');
const readme = read('README.md');
const compDoc = read('docs/components.md');
const seen = new Set();
let n = 0;
for (const c of COMPONENTS) {
  if (!c.requires?.length || seen.has(c.tag)) continue;
  seen.add(c.tag);
  n++;
  const where = `<${c.tag}>`;
  for (const id of c.requires) if (!PREREQS[id]) fail(where, `unknown prerequisite "${id}"`);
  const p = prereqFor(c);
  const need = [p.install, ...c.requires.map((id) => PREREQS[id].importPath), ...c.requires.map((id) => PREREQS[id].register), PREREQS[c.requires[c.requires.length - 1]].cdn.split('\n').pop()];
  const has = (text, place) => {
    for (const s of need) if (!text.includes(s)) fail(where, `${place} is missing ${JSON.stringify(s)}`);
    if (!text.includes(`<${c.tag}`)) fail(where, `${place} has no minimal example`);
  };
  // (1) gallery card — rendered from card.requires via prereqFor(); its text must be complete
  has([p.badge, p.install, p.importAndRegister, p.cdn, p.example].join('\n'), 'gallery card');
  // (2) Store detail — the Store item carries the same block
  const item = COMPONENT_ITEMS.find((i) => i.gallery === c.id);
  if (!item?.prereq) fail(where, 'Store item has no prereq block');
  else has([item.prereq.badge, item.prereq.install, item.prereq.importAndRegister, item.prereq.cdn, item.prereq.example].join('\n'), 'Store detail');
  if (item && item.requiresBadge !== p.badge) fail(where, `Store badge ${JSON.stringify(item?.requiresBadge)} ≠ ${JSON.stringify(p.badge)}`);
  // (3) docs page
  const sec = compDoc.split(`\`<${c.tag}>\` — ${p.badge}`)[1]?.split('\n### ')[0];
  if (!sec) fail(where, 'docs/components.md has no prerequisites block');
  else has(sec + `<${c.tag}`, 'docs page');
  // (4) README
  const rs = readme.split(`\`<${c.tag}>\` — ${p.badge}`)[1]?.split('\n#### ')[0];
  if (!rs) fail(where, 'README has no prerequisites block');
  else has(rs, 'README');
  // (5) AI manifest
  const m = manifest?.components.find((x) => x.tag === c.tag);
  if (manifest && !m) fail(where, 'not in dist/manifest.json');
  else if (m) {
    if (JSON.stringify(m.requires) !== JSON.stringify(c.requires)) fail(where, 'manifest requires differ from the card');
    if (!m.prerequisites) fail(where, 'manifest has no prerequisites');
    else has([m.prerequisites.install, m.prerequisites.importAndRegister, m.prerequisites.cdn, m.prerequisites.example].join('\n'), 'manifest');
  }
}
for (const p of Object.values(PREREQS)) if (manifest && !manifest.runtimeModules.some((r) => r.id === p.id)) fail(p.label, 'not in manifest runtimeModules');

if (errors.length) {
  console.error(`❌ check:peer-docs — ${errors.length} problem(s):\n` + errors.map((e) => '  - ' + e).join('\n'));
  process.exit(1);
}
console.log(`✅ check:peer-docs — ${Object.keys(PREREQS).length} prerequisites, ${n} components documented in all five places`);
