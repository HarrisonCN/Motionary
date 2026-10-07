// Smoke-test the published entry points (run after `npm run build`).
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const entries = {
  'use-scroll-animate': ['createScrollAnimate', 'getScrollProgress', 'supportsScrollTimeline', 'staggerChildren', 'sequence', 'parallax', 'createReactHooks', 'createVueComposables', 'PRESETS'],
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
// Legacy deep imports keep working
require('use-scroll-animate/dist/index.js');
require('use-scroll-animate/package.json');
console.log(`exports OK (ESM + CJS): ${Object.keys(entries).join(', ')}`);
