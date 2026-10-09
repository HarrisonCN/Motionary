#!/usr/bin/env node
// motionary 10.x → 11.0 codemod.
//   npx usa-codemod-11 [--write] [paths…]   (default: ./src; dry run without --write)
// Rewrites (10.9 deprecations, removed in 11.0):
//   1. <usa-three-scene> → <usa-gl-scene> (tags, closing tags, CSS / querySelector selectors), defineThreeScene → defineGlScene.
// Flags for a manual change:
//   2. offscreenRender() / <usa-worker-canvas> given a string program (11.0 refuses string programs on the main thread).
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { pathToFileURL } from 'node:url';

const EXT = new Set(['.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx', '.mts', '.cts', '.vue', '.svelte', '.html', '.astro', '.md', '.mdx', '.css', '.scss']);
export const RENAMES = { defineThreeScene: 'defineGlScene', 'usa-three-scene': 'usa-gl-scene', UsaThreeSceneElement: 'UsaGlSceneElement' };

/** Apply every rewrite to one file's source. Returns { code, changes, manual }. */
export function transform(source) {
  const changes = [];
  const manual = [];
  let code = source;
  for (const [from, to] of Object.entries(RENAMES)) {
    const re = new RegExp(`(?<![\\w$-])${from.replace(/-/g, '\\-')}(?![\\w$-])`, 'g');
    const n = (code.match(re) || []).length;
    if (n) {
      code = code.replace(re, to);
      changes.push(`${from} → ${to} (${n}×)`);
    }
  }
  if (/offscreenRender\(\s*[^,]+,\s*[`'"]/.test(code) || /<usa-worker-canvas\b[^>]*\bprogram=/.test(code))
    manual.push('a string program for offscreenRender() / <usa-worker-canvas program>: 11.0 runs string programs only in a worker — pass a function (or keep worker: true and an OffscreenCanvas-capable browser)');
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
  let files = 0, edits = 0, todo = 0;
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
  console.log(`\n${files} file(s), ${edits} rewrite(s)${todo ? `, ${todo} manual change(s)` : ''}${write ? '' : ' — dry run, add --write to apply'}`);
  return { files, edits, todo };
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) run(process.argv.slice(2));
