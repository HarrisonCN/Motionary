#!/usr/bin/env node
// 17.0: `mo-codemod` — the Motionary-named alias of the usa-codemod tools (same runner as `npx motionary codemod`).
//   npx -p motionary mo-codemod <11–13> [--write] [paths…]
// 17.3: `mo-codemod tags [--write] [paths…]` renames <usa-*> elements to their default <mo-*> names: tags in markup /
// JSX / Vue / Svelte, tag selectors in .css files (attribute values, classes, comments and strings untouched), and tag
// selectors passed to querySelector / closest / matches / createElement / customElements.get / whenDefined. Events stay
// `usa:*`. Dry run by default (lists the files and counts); --write keeps a `.bak` of every changed file (an existing
// backup is never overwritten). The usa-* names keep working; docs/deprecations-v17.md#mo-names.
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { runCodemod } from './motionary.mjs';

const CODE = new Set(['.html', '.htm', '.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx', '.vue', '.svelte', '.astro', '.md', '.mdx']);
const SKIP = new Set(['node_modules', '.git', 'dist', 'build', '.next', '.nuxt', 'coverage']);

/** Rename usa-* element names to mo-* in code / markup (tags and tag-selector strings only). */
export function renameTags(src) {
  let n = 0;
  const out = String(src)
    .replace(/(<\/?)usa-([a-z][a-z0-9-]*)/g, (_, a, b) => (n++, `${a}mo-${b}`))
    .replace(/((?:querySelector(?:All)?|closest|matches|createElement|customElements\.get|whenDefined)\(\s*['"`])usa-(?=[a-z])/g, (_, a) => (n++, `${a}mo-`));
  return { out, n };
}

const walk = (p) => {
  if (!existsSync(p)) return [];
  const st = statSync(p);
  if (st.isFile()) return [p];
  return readdirSync(p).flatMap((f) => (SKIP.has(f) ? [] : walk(join(p, f))));
};

export async function runTags(args) {
  const write = args.includes('--write');
  const paths = args.filter((a) => !a.startsWith('--'));
  let aliasCss = null;
  try {
    ({ aliasCss } = await import('../dist/components/mo.js'));
  } catch {
    /* source checkout without a build: CSS files are reported, not rewritten */
  }
  let files = 0, total = 0;
  for (const f of (paths.length ? paths : ['.']).flatMap(walk)) {
    const ext = extname(f).toLowerCase();
    if (f.endsWith('.bak') || (!CODE.has(ext) && ext !== '.css')) continue;
    const src = readFileSync(f, 'utf8');
    let out = src, n = 0;
    if (ext === '.css') {
      if (!aliasCss) {
        if (/(^|[\s,>+~(])usa-[a-z]/m.test(src)) console.log(`${f}: has usa-* selectors (build the package to rewrite CSS)`);
        continue;
      }
      out = aliasCss(src);
      n = out === src ? 0 : (src.match(/usa-[a-z]/g) || []).length - (out.match(/usa-[a-z]/g) || []).length;
    } else ({ out, n } = renameTags(src));
    if (out === src) continue;
    files++;
    total += n;
    console.log(`${f}: ${n} rename${n === 1 ? '' : 's'}`);
    if (write) {
      if (!existsSync(f + '.bak')) writeFileSync(f + '.bak', src);
      writeFileSync(f, out);
    }
  }
  console.log(`${write ? 'renamed' : 'would rename'} ${total} usa-* name${total === 1 ? '' : 's'} in ${files} file${files === 1 ? '' : 's'}${write ? '' : ' (dry run; add --write)'}`);
  return 0;
}

const argv = process.argv.slice(2);
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('mo-codemod.mjs') || process.argv[1]?.endsWith('mo-codemod')) {
  Promise.resolve(argv[0] === 'tags' ? runTags(argv.slice(1)) : runCodemod(argv)).then((c) => {
    process.exitCode = c;
  });
}
