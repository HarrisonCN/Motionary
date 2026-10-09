#!/usr/bin/env node
// motionary 7.x → 8.0 codemod.
//   npx usa-codemod-8 [--write] [paths…]   (default: ./src; dry run without --write)
// Rewrites (7.9 deprecations, removed in 8.0):
//   1. <usa-rating …> → <usa-star-rating …> (value / max / readonly / label / name unchanged;
//      icon="♥" → icon="heart", icon="★" → icon="star"; a variant="…" attribute is dropped).
//   2. --usa-rating-on → --usa-star-on (CSS custom property).
// Reported for a manual change:
//   3. defineRating imports (use defineStarRating from motionary/components/widgets),
//      document.createElement('usa-rating'), CSS selectors on usa-rating / .usa-rating-star.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { pathToFileURL } from 'node:url';

const EXT = new Set(['.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx', '.mts', '.cts', '.vue', '.svelte', '.html', '.astro', '.md', '.mdx', '.css', '.scss']);
export const TAGS = { 'usa-rating': 'usa-star-rating' };
const ICONS = { '★': 'star', '☆': 'star', '♥': 'heart', '❤': 'heart', '❤️': 'heart' };

/** Apply every rewrite to one file's source. Returns { code, changes, manual }. */
export function transform(source) {
  const changes = [];
  const manual = [];
  let code = source;
  let n = 0;
  code = code.replace(/<usa-rating(?=[\s>/])([^>]*)>/g, (_, attrs) => {
    n++;
    const a = attrs
      .replace(/\sicon=(["'])(.*?)\1/g, (m, q, v) => (ICONS[v] ? ` icon=${q}${ICONS[v]}${q}` : m))
      .replace(/\svariant=(["']).*?\1/g, '');
    return `<usa-star-rating${a}>`;
  });
  const closes = (code.match(/<\/usa-rating>/g) || []).length;
  code = code.replace(/<\/usa-rating>/g, '</usa-star-rating>');
  if (n || closes) changes.push(`<usa-rating> → <usa-star-rating> (${Math.max(n, closes)}×)`);
  const vars = (code.match(/--usa-rating-on\b/g) || []).length;
  if (vars) {
    code = code.replace(/--usa-rating-on\b/g, '--usa-star-on');
    changes.push(`--usa-rating-on → --usa-star-on (${vars}×)`);
  }
  if (/createElement\((['"`])usa-rating\1\)/.test(code)) manual.push("document.createElement('usa-rating') — use 'usa-star-rating' (removed in 8.0)");
  if (/(^|[\s,{}>+~])usa-rating(?=[\s.:#[{,>+~)]|$)|\.usa-rating-star\b/m.test(code.replace(/<\/?[a-z][^>]*>/g, ''))) manual.push('CSS selectors on usa-rating / .usa-rating-star — restyle <usa-star-rating> (.usa-star, --usa-star-on)');
  if (/\bdefineRating\b/.test(code)) manual.push("defineRating() is removed in 8.0 — import { defineStarRating } from 'motionary/components/widgets'");
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
