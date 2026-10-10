// 10.2: one Markdown page per component — docs/components/<tag>.md — generated from the
// same data as the AI manifest and llms-full.txt (source scan + gallery catalog + prerequisites),
// plus docs/components/README.md (index). `--check` exits 1 when a page is out of date.
import { fileURLToPath } from 'node:url';
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { buildManifest } from './gen-manifest.mjs';

const HERE = (() => { try { return fileURLToPath(new URL('..', import.meta.url)); } catch { return ''; } })();
const ROOT = HERE && existsSync(join(HERE, 'package.json')) ? HERE : process.cwd();
const DIR = 'docs/components';
const fence = (lang, s) => ['```' + lang, s, '```'].join('\n');
const list = (xs, f = (x) => '`' + x + '`') => (xs?.length ? xs.map(f).join(', ') : '—');

export function componentPage(c, m) {
  const out = [
    `# \`<${c.tag}>\` — ${c.title}`,
    '',
    `> Generated from the source and the gallery catalog by \`scripts/gen-component-docs.mjs\` (same data as [components.json](${m.homepage}components.json) and [llms-full.txt](${m.homepage}llms-full.txt)).`,
    '',
    c.description,
    '',
    `- **Category:** ${c.category}${c.since ? ` · **since** ${c.since}` : ''}${c.changed && c.changed.length ? ` · **changed in** ${c.changed.join(', ')}` : ''}`,
    `- **Import:** \`import { ${c.import.define} } from '${c.import.path}'\` then \`${c.import.register}\``,
    /\.umd\.js$/.test(c.cdn) ? `- **CDN:** \`<script src="${c.cdn}"></script>\`` : `- **CDN:** \`<script type="module">import { ${c.import.define} } from '${c.cdn}'; ${c.import.register}</script>\` (own entry, not in the no-build bundles)`,
    `- **Attributes:** ${list(c.attributes)}`,
    `- **Events:** ${list(c.events)}`,
    `- **Slots:** ${list(c.slots, (x) => x)}`,
    `- **Methods:** ${list(c.methods, (x) => '`' + x + '()`')}`,
    `- **Source:** [${c.source}](../../${c.source})`,
    '',
  ];
  if (c.prerequisites) {
    const p = c.prerequisites;
    out.push(`## Prerequisites — ${p.badge}`, '', `1. **Install:** \`${p.install}\``, `2. **Import order & registration:** ${p.order}`, '', fence('js', p.importAndRegister), '', '3. **CDN:**', '', fence('html', p.cdn), '');
  }
  out.push('## Minimal example', '', fence('html', c.example), '');
  if (c.esm) out.push('## ES module', '', fence('js', c.esm), '');
  if (c.variants?.length) {
    out.push('## Variants', '');
    for (const v of c.variants) out.push(`### ${v.title}`, '', v.description, '', fence('html', v.example), '');
  }
  return out.join('\n');
}

const slug = (tag) => tag.replace(/[^a-z0-9-]/g, '');

export function generateComponentDocs() {
  const m = buildManifest();
  const files = {};
  for (const c of m.components) files[`${DIR}/${slug(c.tag)}.md`] = componentPage(c, m);
  const cats = [...new Set(m.components.map((c) => c.category))];
  files[`${DIR}/README.md`] = [
    `# Motionary components (${m.components.length})`,
    '',
    'One page per `<usa-*>` element, generated from the source. Machine-readable: `motionary/tooling/manifest.json` · Pages `/components.json` · `/llms.txt` · `/llms-full.txt`. How to use these with an AI assistant: [AGENTS.md](../../AGENTS.md) and [the prompt guide](../ai-prompt-guide.md).',
    '',
    ...cats.flatMap((cat) => [`## ${cat}`, '', ...m.components.filter((c) => c.category === cat).map((c) => `- [\`<${c.tag}>\`](${slug(c.tag)}.md) — ${c.title}${c.requires.length ? ` · ${c.prerequisites.badge}` : ''}`), '']),
  ].join('\n');
  return files;
}

if (process.argv[1]?.endsWith('gen-component-docs.mjs')) {
  const check = process.argv.includes('--check');
  const files = generateComponentDocs();
  const stale = [];
  for (const [f, s] of Object.entries(files)) {
    const p = join(ROOT, f);
    if (existsSync(p) && readFileSync(p, 'utf8') === s) continue;
    if (check) stale.push(f);
    else {
      mkdirSync(join(p, '..'), { recursive: true });
      writeFileSync(p, s);
    }
  }
  const extra = existsSync(join(ROOT, DIR)) ? readdirSync(join(ROOT, DIR)).filter((f) => !files[`${DIR}/${f}`]) : [];
  if (check && (stale.length || extra.length)) {
    console.error(`❌ component docs out of date: ${[...stale, ...extra.map((f) => DIR + '/' + f + ' (orphan)')].slice(0, 10).join(', ')} — run node scripts/gen-component-docs.mjs`);
    process.exit(1);
  }
  if (!check) for (const f of extra) rmSync(join(ROOT, DIR, f));
  console.log(check ? `component docs up to date (${Object.keys(files).length} files)` : `component docs written (${Object.keys(files).length} files)`);
}
