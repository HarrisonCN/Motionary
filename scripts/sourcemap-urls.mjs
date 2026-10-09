#!/usr/bin/env node
// 11.2: source maps are not published to npm (package.json "files" excludes dist/**/*.map) — they stay in the
// tagged git tree. After the build, every `//# sourceMappingURL=<relative>` comment in dist/ is rewritten to the
// map's permanent URL in the release tag, so DevTools still finds it on demand:
//   https://raw.githubusercontent.com/HarrisonCN/Motionary/v<version>/dist/<path>.map
// Run by `npm run build` (last step). Idempotent: absolute URLs are left alone.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

export const MAP_REPO = 'https://raw.githubusercontent.com/HarrisonCN/Motionary';
export const mapBase = (version) => `${MAP_REPO}/v${version}/`;

/** Rewrite the sourceMappingURL comment of one file (`rel` = its path from the package root, posix). */
export function rewriteMapUrl(code, rel, version) {
  return code.replace(/\/\/# sourceMappingURL=(?!https?:|data:)(\S+)\s*$/, (_, url) =>
    `//# sourceMappingURL=${mapBase(version)}${posix.normalize(posix.join(posix.dirname(rel), url))}`);
}

const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });

if (process.argv[1] && import.meta.url.startsWith('file:') && fileURLToPath(import.meta.url) === process.argv[1]) {
  const root = process.cwd(); // npm run build runs at the package root
  const { version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  let n = 0;
  for (const f of walk(join(root, 'dist'))) {
    if (!/\.(c|m)?js$/.test(f)) continue;
    const rel = relative(root, f).split('\\').join('/');
    const s = readFileSync(f, 'utf8');
    const t = rewriteMapUrl(s, rel, version);
    if (t !== s) { writeFileSync(f, t); n++; }
  }
  console.log(`sourcemap-urls: ${n} file(s) now point at ${mapBase(version)}dist/…`);
}
