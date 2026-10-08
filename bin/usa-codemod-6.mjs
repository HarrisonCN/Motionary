#!/usr/bin/env node
// use-scroll-animate 5.x → 6.0 codemod.
//   npx usa-codemod-6 [--write] [paths…]   (default: ./src; dry run without --write)
// Rewrites (5.9 deprecations, removed in 6.0 — every effect goes through the registry):
//   1. burst(x, y[, opts])      → playEffect(document.body, 'burst', { x: x, y: y[, ...opts] })
//   2. confetti([opts])         → playEffect(document.body, 'confetti'[, opts])
//   3. shake(el[, i[, d]])      → playEffect(el, 'shake'[, { intensity: i[, duration: d] }])
//      …and the import of burst / confetti / shake from use-scroll-animate/components[/click]
//      becomes `import { playEffect } from 'use-scroll-animate/components/fx'`.
// Reported for a manual change (no safe rewrite):
//   4. <usa-cursor mode="trail"> → <usa-fx effect="comet-trail" trigger="load" self> around the content
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { pathToFileURL } from 'node:url';

const EXT = new Set(['.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx', '.mts', '.cts', '.vue', '.svelte', '.html', '.astro']);
const OLD = ['burst', 'confetti', 'shake'];

/** Split a call's argument list at top-level commas (pure). */
export function splitArgs(s) {
  const out = [];
  let depth = 0;
  let cur = '';
  let q = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) {
      cur += c;
      if (c === '\\') cur += s[++i] ?? '';
      else if (c === q) q = '';
      continue;
    }
    if (c === '"' || c === "'" || c === '`') q = c;
    else if ('([{'.includes(c)) depth++;
    else if (')]}'.includes(c)) depth--;
    if (c === ',' && depth === 0) {
      out.push(cur.trim());
      cur = '';
    } else cur += c;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

/** Find `name(` calls and their balanced argument text. */
function rewriteCalls(code, name, fn, changes) {
  const re = new RegExp(`(?<![\\w.$])${name}\\(`, 'g');
  let out = '';
  let last = 0;
  let m;
  while ((m = re.exec(code))) {
    const start = m.index;
    let i = re.lastIndex;
    let depth = 1;
    let q = '';
    for (; i < code.length && depth; i++) {
      const c = code[i];
      if (q) {
        if (c === '\\') i++;
        else if (c === q) q = '';
      } else if (c === '"' || c === "'" || c === '`') q = c;
      else if (c === '(') depth++;
      else if (c === ')') depth--;
    }
    if (depth) break;
    const args = splitArgs(code.slice(re.lastIndex, i - 1));
    const rep = fn(args);
    if (rep == null) continue;
    out += code.slice(last, start) + rep;
    last = i;
    re.lastIndex = i;
    changes.push(`${name.replace('\\', '')}() → playEffect(…)`);
  }
  return out + code.slice(last);
}

const objOf = (pairs, rest) => {
  const lit = rest && /^\{[\s\S]*\}$/.test(rest) ? rest.slice(1, -1).trim() : '';
  const tail = rest ? [lit || `...${rest}`] : [];
  return `{ ${[...pairs.filter(([, v]) => v !== undefined).map(([k, v]) => (k === v ? k : `${k}: ${v}`)), ...tail].filter(Boolean).join(', ')} }`;
};

/** Apply every rewrite to one file's source. Returns { code, changes, manual }. */
export function transform(source) {
  const changes = [];
  const manual = [];
  let code = source;
  // Only touch files that import the old helpers from the library (or use the UMD global).
  const importRe = /import\s*\{([^}]*)\}\s*from\s*(['"])use-scroll-animate\/components(?:\/click)?\2;?/g;
  const imported = new Map(); // local name → original helper
  code = code.replace(importRe, (m, names, q) => {
    const list = names.split(',').map((n) => n.trim()).filter(Boolean);
    const old = list.filter((n) => OLD.includes(n.split(/\s+as\s+/)[0]));
    if (!old.length) return m;
    old.forEach((n) => imported.set(n.split(/\s+as\s+/).pop(), n.split(/\s+as\s+/)[0]));
    const rest = list.filter((n) => !old.includes(n));
    const src = m.match(/from\s*(['"])(.*?)\1/)[2];
    changes.push(`import { ${old.join(', ')} } → import { playEffect } from 'use-scroll-animate/components/fx'`);
    const keep = rest.length ? `import { ${rest.join(', ')} } from ${q}${src}${q};\n` : '';
    return `${keep}import { playEffect } from ${q}use-scroll-animate/components/fx${q};`;
  });
  const umd = /UsaComponents\.(burst|confetti|shake)\(/.test(code);
  if (umd) code = code.replace(/UsaComponents\.(burst|confetti|shake)\(/g, (_m, n) => (imported.set(`UsaComponents.${n}`, n), `UsaComponents.${n}(`));
  for (const [name, kind] of imported) {
    const pe = name.startsWith('UsaComponents.') ? 'UsaComponents.playEffect' : 'playEffect';
    const esc = name.replace('.', '\\.');
    code = rewriteCalls(code, esc, (a) => {
      if (kind === 'burst') return a.length >= 2 ? `${pe}(document.body, 'burst', ${objOf([['x', a[0]], ['y', a[1]]], a[2])})` : null;
      if (kind === 'confetti') return `${pe}(document.body, 'confetti'${a[0] ? `, ${a[0]}` : ''})`;
      if (kind === 'shake') return a.length ? `${pe}(${a[0]}, 'shake'${a.length > 1 ? `, ${objOf([['intensity', a[1]], ['duration', a[2]]])}` : ''})` : null;
      return null;
    }, changes);
  }
  if (/<usa-cursor\b[^>]*\bmode=(["'])trail\1/.test(code)) manual.push('<usa-cursor mode="trail"> is removed in 6.0 — wrap the content in <usa-fx effect="comet-trail" trigger="load" self> (see docs/upgrading-6.md)');
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
  console.log(`\n${edits} change(s), ${todo} manual item(s) in ${files} file(s)${write ? ' written' : ' (dry run — add --write to apply)'}.`);
  return { files, edits, manual: todo };
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) run(process.argv.slice(2));
