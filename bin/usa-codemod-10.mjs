#!/usr/bin/env node
// motionary 9.x → 10.0 codemod.
//   npx usa-codemod-10 [--write] [paths…]   (default: ./src; dry run without --write)
// Rewrites (9.9 deprecations, removed in 10.0):
//   1. registerEffectPacks → registerAllPlugins (every effect pack is a plugin in 10.0).
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { pathToFileURL } from 'node:url';

const EXT = new Set(['.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx', '.mts', '.cts', '.vue', '.svelte', '.html', '.astro', '.md', '.mdx']);
export const RENAMES = { registerEffectPacks: 'registerAllPlugins' };

/** Apply every rewrite to one file's source. Returns { code, changes, manual }. */
export function transform(source) {
  const changes = [];
  const manual = [];
  let code = source;
  for (const [from, to] of Object.entries(RENAMES)) {
    const re = new RegExp(`(?<![\\w$])${from}(?![\\w$])`, 'g');
    const n = (code.match(re) || []).length;
    if (n) {
      code = code.replace(re, to);
      changes.push(`${from} → ${to} (${n}×)`);
    }
  }
  return { code, changes, manual };
}

function* walk(p) {
  const st = statSync(p);
  if (st.isDirectory()) {
    for (const f of readdirSync(p)) if (!['node_modules', 'dist', '.git'].includes(f)) yield* walk(join(p, f));
  } else if (EXT.has(extname(p))) yield p;
}

export function run(args) {
  const write = args.includes('--write');
  const paths = args.filter((a) => !a.startsWith('--'));
  let files = 0;
  let edits = 0;
  let todo = 0;
  for (const root of paths.length ? paths : ['src'])
    for (const f of walk(root)) {
      const src = readFileSync(f, 'utf8');
      const { code, changes, manual } = transform(src);
      if (!changes.length && !manual.length) continue;
      files++;
      edits += changes.length;
      todo += manual.length;
      console.log(`${f}${changes.map((c) => `\n  - ${c}`).join('')}${manual.map((c) => `\n  ! manual: ${c}`).join('')}`);
      if (write && changes.length) writeFileSync(f, code);
    }
  console.log(`\n${files} file(s), ${edits} rewrite(s)${write ? ' applied' : ' (dry run — pass --write to apply)'}, ${todo} manual change(s).`);
  return { files, edits, todo };
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) run(process.argv.slice(2));
