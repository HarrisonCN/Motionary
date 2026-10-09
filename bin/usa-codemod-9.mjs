#!/usr/bin/env node
// motionary 8.x → 9.0 codemod.
//   npx usa-codemod-9 [--write] [paths…]   (default: ./src; dry run without --write)
// Rewrites (8.9 deprecations, removed in 9.0):
//   1. applyTheme → applyMotionTheme, THEMES → MOTION_THEMES, THEME_NAMES → MOTION_THEME_NAMES
//      (the 5.8 motion-theme API of motionary/components/effects; the 8.6 surface themes are
//      applySurfaceTheme / SURFACE_THEMES and are not touched).
//   2. <usa-theme …> → <usa-motion-theme …> (<usa-theme-switcher> / <usa-theme-surface> untouched).
// Reported for a manual change:
//   3. document.createElement('usa-theme'), CSS selectors on usa-theme.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { pathToFileURL } from 'node:url';

const EXT = new Set(['.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx', '.mts', '.cts', '.vue', '.svelte', '.html', '.astro', '.md', '.mdx', '.css', '.scss']);
export const RENAMES = { applyTheme: 'applyMotionTheme', THEMES: 'MOTION_THEMES', THEME_NAMES: 'MOTION_THEME_NAMES' };
export const TAGS = { 'usa-theme': 'usa-motion-theme' };

/** Apply every rewrite to one file's source. Returns { code, changes, manual }. */
export function transform(source) {
  const changes = [];
  const manual = [];
  let code = source;
  for (const [from, to] of Object.entries(RENAMES)) {
    const re = new RegExp(`(?<![\\w$.])${from}(?![\\w$])`, 'g');
    const n = (code.match(re) || []).length;
    if (n) {
      code = code.replace(re, to);
      changes.push(`${from} → ${to} (${n}×)`);
    }
  }
  let t = 0;
  code = code.replace(/<(\/?)usa-theme(?=[\s>/])/g, (_, slash) => {
    t++;
    return `<${slash}usa-motion-theme`;
  });
  if (t) changes.push(`<usa-theme> → <usa-motion-theme> (${t}×)`);
  if (/createElement\((['"`])usa-theme\1\)/.test(code)) manual.push("document.createElement('usa-theme') — use 'usa-motion-theme' (removed in 9.0)");
  if (/(^|[\s,{}>+~])usa-theme(?=[\s.:#[{,>+~)]|$)/m.test(code.replace(/<\/?[a-z][^>]*>/g, ''))) manual.push('CSS selectors on usa-theme — select usa-motion-theme');
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
