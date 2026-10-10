#!/usr/bin/env node
// motionary — command line (11.5).
//   npx motionary doctor [paths…] [--json]   scan a project for deprecated import paths (exit 1 when found)
//   npx motionary help
// Old subpaths still work (removed in 13.0) and never warn at runtime; `doctor` is how a project finds them.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { DEPRECATED_PATHS, REMOVED_IN, findOldPaths } from './public-paths.mjs';

const EXT = new Set(['.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx', '.mts', '.cts', '.vue', '.svelte', '.html', '.astro', '.md', '.mdx', '.json']);
const SKIP = new Set(['node_modules', 'dist', '.git', 'build', 'coverage', '.next', '.nuxt', '.svelte-kit']);

function* walk(p) {
  const st = statSync(p);
  if (st.isDirectory()) {
    for (const f of readdirSync(p)) if (!SKIP.has(f)) yield* walk(join(p, f));
  } else if (EXT.has(extname(p)) && !p.endsWith('package-lock.json')) yield p;
}

/** Scan files / directories; returns [{ file, line, from, to }]. */
export function doctor(paths) {
  const found = [];
  for (const root of paths.length ? paths : ['.']) {
    if (!existsSync(root)) continue;
    for (const f of walk(root)) for (const h of findOldPaths(readFileSync(f, 'utf8'))) found.push({ file: f, ...h });
  }
  return found;
}

const HELP = `motionary <command>

  doctor [paths…] [--json]   list deprecated motionary import paths (default: current directory).
                             Exit code 1 when any is found. Fix them with: npx usa-codemod-12 --write [paths…]
  help                       this text

Deprecated subpaths (work until ${REMOVED_IN}, no runtime warning):
${Object.entries(DEPRECATED_PATHS).map(([a, b]) => `  motionary/${a}  →  motionary/${b}`).join('\n')}
`;

export function main(argv) {
  const [cmd = 'help', ...rest] = argv;
  if (cmd === 'doctor' || cmd === 'check') {
    const found = doctor(rest.filter((a) => !a.startsWith('--')));
    if (rest.includes('--json')) console.log(JSON.stringify({ deprecated: found }, null, 2));
    else if (!found.length) console.log('motionary doctor: no deprecated import paths found ✓');
    else {
      for (const x of found) console.log(`${x.file}:${x.line}  ${x.from}  →  ${x.to}`);
      console.log(`\n${found.length} deprecated import path(s) — removed in ${REMOVED_IN}. Rewrite them: npx usa-codemod-12 --write`);
    }
    return found.length ? 1 : 0;
  }
  console.log(HELP);
  return cmd === 'help' || cmd === '--help' || cmd === '-h' ? 0 : 2;
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) process.exitCode = main(process.argv.slice(2));
