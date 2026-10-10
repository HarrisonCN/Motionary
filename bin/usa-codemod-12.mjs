#!/usr/bin/env node
// motionary 11.x → 12.0 / 13.0 codemod.
//   npx usa-codemod-12 [--write] [paths…]   (default: ./src; dry run without --write)
// Rewrites (11.5 deprecations — old subpaths removed in 13.0):
//   1. deprecated import paths → their layer subpaths (bin/public-paths.mjs): motionary/components/core → motionary/core,
//      motionary/components/ai → motionary/tooling/ai, motionary/design and motionary/components/design → motionary/tooling/design,
//      motionary/components/angular → motionary/angular, motionary/manifest(.schema).json → motionary/tooling/…
//      (the same for the use-scroll-animate alias package).
//   2. (11.9) legacy event names → usa:* (removed in 12.0): usa-beat → usa:beat, usa-audio-error → usa:audio-error,
//      usa-player-ready → usa:ready, usa-player-finish → usa:finish, usa-story-step → usa:step — in quoted strings,
//      Vue @x, Angular (x) and Svelte on:x bindings (data-usa-beat attributes are left alone).
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { rewritePaths, rewriteEvents } from './public-paths.mjs';

const EXT = new Set(['.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx', '.mts', '.cts', '.vue', '.svelte', '.html', '.astro', '.md', '.mdx', '.json']);

/** Apply every rewrite to one file's source. Returns { code, changes, manual }. */
export function transform(source) {
  const p = rewritePaths(source);
  const e = rewriteEvents(p.code);
  const code = e.code;
  const hits = [...p.hits, ...e.hits];
  const count = {};
  for (const h of hits) count[`${h.from} → ${h.to}`] = (count[`${h.from} → ${h.to}`] || 0) + 1;
  return { code, changes: Object.entries(count).map(([k, n]) => `${k} (${n}×)`), manual: [] };
}

function* walk(p) {
  const st = statSync(p);
  if (st.isDirectory()) {
    for (const f of readdirSync(p)) if (!['node_modules', 'dist', '.git'].includes(f)) yield* walk(join(p, f));
  } else if (EXT.has(extname(p)) && !p.endsWith('package-lock.json')) yield p;
}

export function run(args) {
  const write = args.includes('--write');
  const paths = args.filter((a) => !a.startsWith('--'));
  let files = 0, edits = 0;
  for (const root of paths.length ? paths : ['src'])
    for (const f of walk(root)) {
      const src = readFileSync(f, 'utf8');
      const { code, changes } = transform(src);
      if (!changes.length) continue;
      files++;
      edits += changes.length;
      console.log(`${f}${changes.map((c) => `\n  - ${c}`).join('')}`);
      if (write) writeFileSync(f, code);
    }
  console.log(`\n${files} file(s), ${edits} rewrite(s)${write ? '' : ' — dry run, add --write to apply'}`);
  return { files, edits, todo: 0 };
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) run(process.argv.slice(2));
