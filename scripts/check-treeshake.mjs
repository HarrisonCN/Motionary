#!/usr/bin/env node
// 11.1: tree-shaking check on the built package (run after `npm run build`; CI step "Tree-shaking").
//  1. `import 'motionary/<subpath>'` with nothing used bundles to nothing — except the entries listed in
//     package.json "sideEffects" (CSS, UMD / IIFE builds, presets/extended, components/lite).
//  2. Importing ONE define from a group entry pulls in only that component: the bundle stays under a fixed
//     size and contains none of the other components' tags.
// Uses esbuild (devDependency) with the package's own exports map (self-reference `motionary/...`).
import { buildSync } from 'esbuild';
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const ROOT = process.cwd();
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const external = Object.keys(pkg.peerDependencies || {}).map((p) => (p.includes('/') ? p.split('/')[0] + '/*' : p));
const bundle = (code) => buildSync({ stdin: { contents: code, resolveDir: ROOT, loader: 'js' }, bundle: true, write: false, format: 'esm', platform: 'browser', minify: true, logLevel: 'silent', external }).outputFiles[0].text;
const gz = (s) => gzipSync(s).length;
const side = (file) => (pkg.sideEffects || []).some((p) => new RegExp('^' + p.replace(/^\.\//, '').replace(/[.]/g, '\\.').replace(/\*/g, '[^/]*') + '$').test(file.replace(/^\.\//, '')));

const fails = [];
let bare = 0;
for (const [k, v] of Object.entries(pkg.exports)) {
  const f = v?.import?.default;
  if (typeof f !== 'string' || !f.endsWith('.js')) continue;
  const spec = 'motionary' + k.slice(1);
  bare++;
  let out;
  try { out = bundle(`import '${spec}';`); } catch (e) { fails.push(`${spec}: does not bundle (${e.message.split('\n')[1] || e.message})`); continue; }
  if (side(f)) continue;
  if (out.trim().length) fails.push(`import '${spec}' is not side-effect free (${out.length} bytes left after tree-shaking)`);
}

// one export from a group entry → only its own code (fixed limits, gzip)
const ONE = [
  { code: "import { defineAddToCart } from 'motionary/components/widgets'; defineAddToCart();", max: 8 * 1024, absent: ['usa-bar-chart', 'usa-gl-scene', 'usa-kanban'] },
  { code: "import { gpu } from 'motionary/plugins'; console.log(gpu);", max: 8 * 1024, absent: ['liquid-text', 'coin-burst', 'film-burn'] },
  { code: "import { tween } from 'motionary/runtime'; console.log(tween);", max: 6 * 1024, absent: ['webgl2', 'glTF'] },
  { code: "import { createScrollAnimate } from 'motionary'; console.log(createScrollAnimate);", max: 8 * 1024, absent: ['usa-'] },
];
for (const c of ONE) {
  let out;
  try { out = bundle(c.code); } catch (e) { fails.push(`${c.code}: ${e.message.split('\n')[1] || e.message}`); continue; }
  const size = gz(out);
  if (size > c.max) fails.push(`${c.code} → ${(size / 1024).toFixed(2)} KB gzip > ${(c.max / 1024).toFixed(1)} KB`);
  for (const a of c.absent) if (out.includes(a)) fails.push(`${c.code} → bundle still contains "${a}"`);
  console.log(`${(size / 1024).toFixed(2)} KB gzip  ${c.code}`);
}
if (fails.length) { console.error('❌ check:treeshake\n' + fails.map((x) => '  - ' + x).join('\n')); process.exit(1); }
console.log(`✅ check:treeshake — ${bare} entry points side-effect free on import (except the ${(pkg.sideEffects || []).length} sideEffects patterns), ${ONE.length} single-export bundles within their limits`);
