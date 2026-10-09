#!/usr/bin/env node
// 11.2: npm package size check (CI, after the build). `npm pack --dry-run --json` must contain no source maps
// and stay within fixed limits — they are not raised automatically (docs/source-maps.md has the measurements).
import { execFileSync } from 'node:child_process';

export const PACK_LIMITS = { packed: 4.0 * 1024 * 1024, unpacked: 14 * 1024 * 1024, files: 2300 };

const out = execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
const info = JSON.parse(out.slice(out.indexOf('[')))[0];
const maps = info.files.filter((f) => f.path.endsWith('.map'));
const mb = (n) => (n / 1024 / 1024).toFixed(2) + ' MB';
const rows = [
  ['packed (tarball)', info.size, PACK_LIMITS.packed, mb],
  ['unpacked', info.unpackedSize, PACK_LIMITS.unpacked, mb],
  ['files', info.files.length, PACK_LIMITS.files, String],
];
const fails = [];
console.log('| npm pack | size | limit |\n|---|---|---|');
for (const [name, v, lim, fmt] of rows) {
  console.log(`| ${name} | ${fmt(v)} | ${fmt(lim)} |`);
  if (v > lim) fails.push(`${name} ${fmt(v)} > ${fmt(lim)}`);
}
if (maps.length) fails.push(`${maps.length} source map(s) in the package (e.g. ${maps[0].path}) — they belong in the git tag, not on npm`);
if (fails.length) { console.error('❌ check:pack\n' + fails.map((x) => '  - ' + x).join('\n')); process.exit(1); }
console.log(`✅ check:pack — no source maps, ${mb(info.size)} packed`);
