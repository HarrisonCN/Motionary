#!/usr/bin/env node
// 11.2: npm package size check (CI, after the build). `npm pack --dry-run --json` must contain no source maps
// with size and file counts reported against historical references, without enforced caps (docs/size-policy.md).
// 17.3: unpacked 14 MB → 16 MB (measured 14.32 MB), maintainer-approved; recorded in CHANGELOG.
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

// Legacy name retained for historical tests; these numbers are reference measurements only.
export const PACK_LIMITS = { packed: 4.0 * 1024 * 1024, unpacked: 16 * 1024 * 1024, files: 2300 };

/** Package hygiene only: byte counts and file counts never reject an artifact. */
export function packageIssues(info) {
  const maps = info.files.filter((f) => f.path.endsWith('.map'));
  return maps.length ? [`${maps.length} source map(s) in the package (e.g. ${maps[0].path}) — they belong in the git tag, not on npm`] : [];
}

export function main() {
  const out = execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
  const info = JSON.parse(out.slice(out.indexOf('[')))[0];
  const mb = (n) => (n / 1024 / 1024).toFixed(2) + ' MB';
  const rows = [
    ['packed (tarball)', info.size, PACK_LIMITS.packed, mb],
    ['unpacked', info.unpackedSize, PACK_LIMITS.unpacked, mb],
    ['files', info.files.length, PACK_LIMITS.files, String],
  ];
  const fails = packageIssues(info);
  console.log('| npm pack | size | historical reference |\n|---|---|---|');
  for (const [name, v, lim, fmt] of rows) {
    console.log(`| ${name} | ${fmt(v)} | ${fmt(lim)} |`);
    if (v > lim) console.log(`  ${name}: above historical reference (informational)`);
  }
  if (fails.length) { console.error('❌ check:pack\n' + fails.map((x) => '  - ' + x).join('\n')); process.exitCode = 1; return; }
  console.log(`✅ check:pack — no source maps, ${mb(info.size)} packed`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
