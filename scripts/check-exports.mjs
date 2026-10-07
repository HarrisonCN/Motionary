// Smoke-test the published entry points (run after `npm run build`).
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const names = ['createScrollAnimate', 'getScrollProgress', 'staggerChildren', 'sequence', 'createReactHooks', 'createVueComposables', 'PRESETS'];

const esm = await import('use-scroll-animate');
const cjs = require('use-scroll-animate');
for (const mod of [esm, cjs]) {
  for (const name of names) assert.equal(typeof mod[name] === 'undefined', false, `missing export ${name}`);
  assert.equal(typeof mod.default.init, 'function', 'default instance');
}
// Legacy deep imports keep working
require('use-scroll-animate/dist/index.js');
require('use-scroll-animate/package.json');
console.log('exports OK (ESM + CJS)');
