#!/usr/bin/env node
// 13.5.0: type-check every framework fixture (tsc --noEmit -p test/frameworks/<fw>) against the BUILT package types.
// Usage: node test/frameworks/typecheck.mjs [fw ...]   (fixture node_modules must be installed; run after `npm run build`)
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
const tsc = join(here, '../../node_modules/typescript/bin/tsc');
const fws = process.argv.slice(2).length ? process.argv.slice(2) : ['react18', 'react19', 'vue3', 'svelte5', 'solid', 'angular'];
let failed = 0;
for (const fw of fws) {
  const r = spawnSync(process.execPath, [tsc, '--noEmit', '-p', join(here, fw)], { encoding: 'utf8' });
  const ok = r.status === 0;
  if (!ok) failed++;
  console.log(`${ok ? '✓' : '✘'} types ${fw}`);
  if (!ok) console.log((r.stdout || '') + (r.stderr || ''));
}
process.exit(failed ? 1 : 0);
