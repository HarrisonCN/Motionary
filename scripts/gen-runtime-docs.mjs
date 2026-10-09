// 10.1: generate the prerequisite documentation from showcase/catalog/prereqs.js:
//   docs/runtime/<module>.md            one page per runtime module / official runtime (with compatibility table)
//   README.md     <!-- runtime:start --> … <!-- runtime:end -->      modules + every component that needs one
//   docs/components.md <!-- prereqs:start --> … <!-- prereqs:end --> the same per component
//   docs/compat-matrix.md + README.md <!-- stable:start --> … <!-- stable:end -->  11.0: the frozen compatibility matrix + stable API
// `--check` exits 1 when a generated file is out of date (used by check:peer-docs).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { COMPONENTS } from '../showcase/components-catalog.js';
import { PREREQS, prereqFor } from '../showcase/catalog/prereqs.js';

const HERE = (() => { try { return fileURLToPath(new URL('..', import.meta.url)); } catch { return ''; } })();
const ROOT = HERE && existsSync(join(HERE, 'package.json')) ? HERE : process.cwd();
const check = process.argv.includes('--check');
const fence = (lang, s) => ['```' + lang, s, '```'].join('\n');

export function needing() {
  const seen = new Set();
  return COMPONENTS.filter((c) => c.requires?.length && !seen.has(c.tag) && seen.add(c.tag));
}

export function modulePage(p) {
  const users = needing().filter((c) => c.requires.includes(p.id));
  return [
    `# ${p.label} — ${p.title}`,
    '',
    `> Generated from \`showcase/catalog/prereqs.js\` by \`scripts/gen-runtime-docs.mjs\` — edit the data, not this page.`,
    '',
    p.summary,
    '',
    p.kind === 'peer' ? `**Official third-party runtime** (optional peer dependency, lazy-loaded). Why not our own: ${p.why || 'proprietary format'}.` : `Part of Motionary's own zero-dependency runtime. Size budget: **${(p.budget / 1024).toFixed(1)} KB gzip** (enforced in CI).`,
    '',
    '## Prerequisites',
    '',
    `1. **Install:** \`${p.install}\``,
    `2. **Import path:** \`${p.importPath}\``,
    `3. **CDN:**`,
    '',
    fence('html', p.cdn),
    '',
    `   ESM from a CDN: \`${p.cdnEsm}\``,
    '',
    `4. **Import order & registration:** ${p.order}`,
    '',
    fence('js', `${p.import}\n${p.register}`),
    '',
    '## Example',
    '',
    fence('js', p.example),
    '',
    '## Exports',
    '',
    p.exports.map((e) => `\`${e}\``).join(' · '),
    '',
    '## Compatibility',
    '',
    '| Feature | Supported | Notes |',
    '|---|---|---|',
    ...p.compat.map(([f, s, n]) => `| ${f} | ${s === 'yes' ? '✅ yes' : s === 'partial' ? '◐ partial' : '✕ no'} | ${n || ''} |`),
    '',
    '## Components that need it',
    '',
    users.length ? users.map((c) => `- \`<${c.tag}>\` — ${c.title.en}`).join('\n') : '_None yet._',
    '',
  ].join('\n');
}

function componentBlock(c, h = '###') {
  const p = prereqFor(c);
  return [
    `${h} \`<${c.tag}>\` — ${p.badge}`,
    '',
    `- **Install:** \`${p.install}\``,
    `- **Import order & registration:** ${p.order}`,
    '',
    fence('js', p.importAndRegister),
    '',
    '- **CDN:**',
    '',
    fence('html', p.cdn),
    '',
    '- **Minimal example:**',
    '',
    fence('html', p.example),
    '',
  ].join('\n');
}

export function readmeSection() {
  const mods = Object.values(PREREQS);
  return [
    '<!-- runtime:start -->',
    '## Runtime (`motionary/runtime`) & prerequisites',
    '',
    "Motionary ships its own zero-dependency animation runtime — shared ticker, tween + timeline engine, and one tree-shakable module per feature / format (`motionary/runtime/<module>`). `npm i motionary` installs all of it; you pay only for the modules you import. Components that need a module say so with a **Requires:** badge in the gallery and the Store, and throw a clear error (install / import / CDN) when it is missing.",
    '',
    '| Module | Import | CDN (IIFE) | Register | gzip budget |',
    '|---|---|---|---|---|',
    ...mods.map((p) => `| [${p.title}](${p.docs}) | \`${p.importPath}\` | \`${p.cdn.split('\n').pop().replace(/<script src="|"><\/script>/g, '')}\` | \`${p.register}\` | ${p.kind === 'peer' ? 'official runtime (not bundled)' : (p.budget / 1024).toFixed(1) + ' KB'} |`),
    '',
    'Install once: `npm i motionary`. Plain HTML: load `runtime.iife.js` first, then the module files (each registers itself).',
    '',
    ...needing().map((c) => componentBlock(c, '####')),
    '<!-- runtime:end -->',
  ].join('\n');
}

export function componentsDocSection() {
  return ['<!-- prereqs:start -->', '## Prerequisites of runtime-powered components', '', 'Generated from `showcase/catalog/prereqs.js`. Runtime modules: see [docs/runtime/](runtime/).', '', ...needing().map((c) => componentBlock(c)), '<!-- prereqs:end -->'].join('\n');
}

function splice(text, start, end, block, anchor) {
  if (text.includes(start)) return text.slice(0, text.indexOf(start)) + block + text.slice(text.indexOf(end) + end.length);
  const i = text.indexOf(anchor);
  return i < 0 ? text + '\n' + block + '\n' : text.slice(0, i) + block + '\n\n' + text.slice(i);
}

// 11.0: the frozen compatibility matrix — generated from the same tested module data as docs/runtime/<module>.md.
const mark = (s) => (s === 'yes' ? '✅ yes' : s === 'partial' ? '◐ partial' : '✕ no');
const tally = (p) => ['yes', 'partial', 'no'].map((k) => p.compat.filter(([, s]) => s === k).length);

export function compatMatrix() {
  const mods = Object.values(PREREQS).filter((p) => p.compat?.length);
  const all = mods.reduce((a, p) => tally(p).map((n, i) => a[i] + n), [0, 0, 0]);
  return [
    '# Compatibility matrix (frozen in 11.0)',
    '',
    '> Generated from `showcase/catalog/prereqs.js` by `scripts/gen-runtime-docs.mjs` — the same data as each module page in [docs/runtime/](runtime/); every ✅ row is covered by the module tests and sample files. Edit the data, not this page.',
    '',
    `From 11.0 this matrix is part of the stable API: a ✅ row is not removed or downgraded before 12.0; minors may only add rows or turn ◐ / ✕ into ✅. Totals: **${all[0]}** ✅ · **${all[1]}** ◐ · **${all[2]}** ✕ across ${mods.length} modules.`,
    '',
    '| Module | Import | ✅ | ◐ | ✕ |',
    '|---|---|---|---|---|',
    ...mods.map((p) => { const [y, q, n] = tally(p); return `| [${p.title}](${p.docs.replace(/^docs\//, '')}) | \`${p.importPath}\` | ${y} | ${q} | ${n} |`; }),
    '',
    ...mods.flatMap((p) => [
      `## ${p.title} — \`${p.importPath}\`${p.kind === 'peer' ? ' (official runtime, optional peer)' : ''}`,
      '',
      '| Feature | Supported | Notes |',
      '|---|---|---|',
      ...p.compat.map(([f, s, n]) => `| ${f} | ${mark(s)} | ${n || ''} |`),
      '',
    ]),
  ].join('\n');
}

export function stableSection() {
  const mods = Object.values(PREREQS).filter((p) => p.compat?.length);
  return [
    '<!-- stable:start -->',
    '## Stable API (11.x) & compatibility matrix',
    '',
    'From 11.0 these are stable and follow semver until 12.0 (additions only in minors; see [docs/upgrading-11.md](./docs/upgrading-11.md)):',
    '',
    '- `motionary/runtime` and every `motionary/runtime/<module>` export and module id;',
    '- the AI manifest **schema v2** (`components.json`, `motionary/manifest.json`, `stability: "stable"`) and the `motionary-scene@1` format;',
    '- `motionary-mcp` **2.x** tool names and result shapes;',
    '- the individual entry points (`motionary/widgets/<name>`, `motionary/effects/<name>`, `motionary/components/<name>`) and their fixed gzip budgets;',
    '- the compatibility matrix below — a ✅ row is not removed before 12.0.',
    '',
    '| Module | ✅ | ◐ | ✕ |',
    '|---|---|---|---|',
    ...mods.map((p) => { const [y, q, n] = tally(p); return `| [${p.title}](${p.docs}) | ${y} | ${q} | ${n} |`; }),
    '',
    'Feature by feature: [docs/compat-matrix.md](./docs/compat-matrix.md).',
    '<!-- stable:end -->',
  ].join('\n');
}

export function generate() {
  const files = {};
  for (const p of Object.values(PREREQS)) files[p.docs] = modulePage(p);
  const readme = readFileSync(join(ROOT, 'README.md'), 'utf8');
  files['README.md'] = splice(readme, '<!-- runtime:start -->', '<!-- runtime:end -->', readmeSection(), '## Accessibility & reduced motion');
  files['README.md'] = splice(files['README.md'], '<!-- stable:start -->', '<!-- stable:end -->', stableSection(), '## Accessibility & reduced motion');
  files['docs/compat-matrix.md'] = compatMatrix();
  const comp = readFileSync(join(ROOT, 'docs/components.md'), 'utf8');
  files['docs/components.md'] = splice(comp, '<!-- prereqs:start -->', '<!-- prereqs:end -->', componentsDocSection(), '## Frameworks');
  return files;
}

if (process.argv[1]?.endsWith('gen-runtime-docs.mjs')) {
  const files = generate();
  let stale = [];
  for (const [f, s] of Object.entries(files)) {
    const p = join(ROOT, f);
    const cur = existsSync(p) ? readFileSync(p, 'utf8') : null;
    if (cur === s) continue;
    if (check) stale.push(f);
    else {
      mkdirSync(join(p, '..'), { recursive: true });
      writeFileSync(p, s);
    }
  }
  if (check && stale.length) {
    console.error(`❌ prerequisite docs out of date: ${stale.join(', ')} — run node scripts/gen-runtime-docs.mjs`);
    process.exit(1);
  }
  console.log(check ? 'runtime docs up to date' : `runtime docs written (${Object.keys(files).length} files checked)`);
}
