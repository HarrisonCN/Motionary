#!/usr/bin/env node
// motionary 12.x → 13.0 codemod.
//   npx usa-codemod-13 [--write] [paths…]   (default: ./src; dry run without --write)
// Rewrites:
//   1. import paths deprecated in 11.5 and REMOVED in 13.0 → their layer subpaths (bin/public-paths.mjs DEPRECATED_PATHS):
//      motionary/components/core → motionary/core, motionary/components/ai → motionary/tooling/ai, motionary/design and
//      motionary/components/design → motionary/tooling/design, motionary/components/angular → motionary/angular,
//      motionary/manifest(.schema).json → motionary/tooling/… (also for the use-scroll-animate alias package).
//   2. legacy event names removed in 12.0 → usa:* (if any are left from 11.x code).
//   3. CDN URLs pinned to an older major → @13: unpkg / jsDelivr `motionary@10/`, `@11/`, `@12/` → `motionary@13/`
//      (exact versions such as motionary@12.4.0 are left alone — you pinned them on purpose).
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { rewritePaths, rewriteEvents } from './public-paths.mjs';

export const TARGET_MAJOR = '13';
const EXT = new Set(['.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx', '.mts', '.cts', '.vue', '.svelte', '.html', '.astro', '.md', '.mdx', '.json']);

/** CDN major pins → @13. Returns { code, hits }. */
export function rewriteCdnMajor(source, to = TARGET_MAJOR) {
  const hits = [];
  const code = source.replace(/((?:unpkg\.com|cdn\.jsdelivr\.net\/npm)\/(?:motionary|use-scroll-animate))@(\d+)\//g, (m, base, major) => {
    if (major === to || Number(major) < 10) return m;
    hits.push({ from: `@${major}/`, to: `@${to}/` });
    return `${base}@${to}/`;
  });
  return { code, hits };
}

/** Apply every rewrite to one file's source. Returns { code, changes }. */
export function transform(source) {
  const p = rewritePaths(source);
  const e = rewriteEvents(p.code);
  const c = rewriteCdnMajor(e.code);
  const count = {};
  for (const h of [...p.hits, ...e.hits, ...c.hits]) count[`${h.from} → ${h.to}`] = (count[`${h.from} → ${h.to}`] || 0) + 1;
  return { code: c.code, changes: Object.entries(count).map(([k, n]) => `${k} (${n}×)`) };
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
      const { code, changes } = transform(readFileSync(f, 'utf8'));
      if (!changes.length) continue;
      files++;
      edits += changes.length;
      console.log(`${f}${changes.map((c) => `\n  - ${c}`).join('')}`);
      if (write) writeFileSync(f, code);
    }
  console.log(`\n${files} file(s), ${edits} rewrite(s)${write ? '' : ' — dry run, add --write to apply'}`);
  return { files, edits };
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) run(process.argv.slice(2));
