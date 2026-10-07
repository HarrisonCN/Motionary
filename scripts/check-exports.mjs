// Smoke-test the published entry points (run after `npm run build`).
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';

const require = createRequire(import.meta.url);
const entries = {
  'use-scroll-animate': ['createScrollAnimate', 'getScrollProgress', 'supportsScrollTimeline', 'staggerChildren', 'sequence', 'parallax', 'PRESETS'],
  'use-scroll-animate/react': ['createReactHooks'],
  'use-scroll-animate/vue': ['createVueComposables'],
  'use-scroll-animate/svelte': ['scrollAnimate', 'scrollStagger'],
  'use-scroll-animate/solid': ['scrollAnimate', 'scrollStagger', 'useScrollAnimate'],
  'use-scroll-animate/element': ['defineScrollAnimate'],
};

for (const [id, names] of Object.entries(entries)) {
  const esm = await import(id);
  const cjs = require(id);
  for (const mod of [esm, cjs]) {
    for (const name of names) assert.notEqual(typeof mod[name], 'undefined', `${id}: missing export ${name}`);
  }
}
const root = await import('use-scroll-animate');
assert.equal(typeof root.default.init, 'function', 'default instance');
assert.equal(typeof require('use-scroll-animate').default.init, 'function', 'default instance (CJS)');
// Browser bundles ship at their CDN paths (served by file path, not through `exports`)
for (const f of ['dist/index.umd.js', 'dist/element.umd.js']) assert.ok(existsSync(new URL(`../${f}`, import.meta.url)), `missing ${f}`);
require('use-scroll-animate/package.json');
// 2.0: the main entry no longer re-exports the framework factories
assert.equal(root.createReactHooks, undefined, 'createReactHooks moved to /react');
console.log(`exports OK (ESM + CJS): ${Object.keys(entries).join(', ')}`);
