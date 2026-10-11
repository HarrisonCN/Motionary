// 13.9.0 — deprecation hints for 14.0 removals: @deprecated JSDoc, one-time dev-only console warnings that a
// production build removes, a deprecation list doc and a migration guide; lite and the core entries unchanged.
// 14.0: the deprecated APIs moved to motionary/compat-v13, which keeps these notices (installCompatV13 for the player).
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { DEPRECATIONS_V14, warnDeprecated, resetDeprecationWarnings } from '../src/components/deprecations';
import { createPlayer } from '../src/components/effects/player';
import { normalizeAnimation, installCompatV13 } from '../src/components/compat-v13/index';

const PLAYGROUND = JSON.parse(readFileSync('test/fixtures/scene-v2/playground.json', 'utf8'));
let warn: ReturnType<typeof vi.spyOn>;
beforeEach(() => { resetDeprecationWarnings(); warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); });
afterEach(() => { vi.restoreAllMocks(); delete (globalThis as any).MOTIONARY_NO_DEPRECATION; });

describe('13.9 deprecations: runtime notices (development)', () => {
  it('warnDeprecated warns once per id, with the docs anchor', () => {
    warnDeprecated('normalize-animation');
    warnDeprecated('normalize-animation');
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toMatch(/removed in 14\.0.*deprecations-v14\.md#normalize-animation/);
  });
  it('MOTIONARY_NO_DEPRECATION silences notices', () => {
    (globalThis as any).MOTIONARY_NO_DEPRECATION = true;
    warnDeprecated('normalize-animation');
    expect(warn).not.toHaveBeenCalled();
  });
  it('calling normalizeAnimation() warns once; createPlayer() with current JSON does not', () => {
    const el = document.createElement('div');
    const p = createPlayer(el, { format: 'use-scroll-animate/animation', version: 1, tracks: [{ target: ':scope', duration: 100, keyframes: [{ opacity: 0 }, { opacity: 1 }] }] });
    p.destroy();
    expect(warn).not.toHaveBeenCalled();
    normalizeAnimation({ format: 'use-scroll-animate/animation', version: 1, tracks: [] });
    normalizeAnimation({ format: 'use-scroll-animate/animation', version: 1, tracks: [] });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toMatch(/normalizeAnimation/);
  });
  it('playground documents and unversioned JSON in the player (with installCompatV13) warn once each; behaviour unchanged', () => {
    const off = installCompatV13();
    const el = document.createElement('div');
    el.innerHTML = '<i></i><i></i>';
    const a = createPlayer(el, PLAYGROUND);
    expect(a.duration).toBe(600);
    a.destroy();
    createPlayer(el, PLAYGROUND).destroy();
    const b = createPlayer(el, { tracks: [{ target: ':scope', duration: 400, keyframes: [{ opacity: 0 }, { opacity: 1 }] }] });
    expect(b.duration).toBe(400);
    b.destroy();
    const msgs = warn.mock.calls.map((c) => String(c[0]));
    expect(msgs.filter((m) => /playground/.test(m))).toHaveLength(1);
    expect(msgs.filter((m) => /without "format"/.test(m))).toHaveLength(1);
    off();
  });
});

describe('13.9 deprecations: production builds drop them', () => {
  // esbuild runs in a child process (jsdom's TextEncoder breaks esbuild's invariant check in-process)
  const bundle = (nodeEnv: string) =>
    execFileSync(process.execPath, ['-e', `require('esbuild').build({ entryPoints: ['src/components/compat-v13/index.ts'], bundle: true, write: false, format: 'esm', minify: true, platform: 'browser', define: { 'process.env.NODE_ENV': '${JSON.stringify(nodeEnv)}' }, logLevel: 'silent' }).then((r) => process.stdout.write(r.outputFiles[0].text))`], { encoding: 'utf8', maxBuffer: 64 << 20 });
  it('NODE_ENV=production: no warning text, no deprecations module', () => {
    const prod = bundle('production');
    expect(prod).not.toMatch(/served by motionary\/compat-v13 until/);
    expect(prod).not.toMatch(/deprecations-v14/);
    expect(prod).not.toMatch(/MOTIONARY_NO_DEPRECATION/);
  });
  it('NODE_ENV=development keeps them', () => {
    expect(bundle('development')).toMatch(/served by motionary\/compat-v13 until/);
  });
  it('without a bundler (no process global) the guard is safe', () => {
    expect(readFileSync('src/components/compat-v13/index.ts', 'utf8')).toMatch(/typeof process !== 'undefined' && process\.env\.NODE_ENV !== 'production'/);
  });
  it('lite and motionary/components never import the deprecations module', () => {
    for (const f of ['src/components/lite.ts', 'src/components/index.ts', 'src/core.ts', 'src/index.ts']) expect(readFileSync(f, 'utf8')).not.toMatch(/deprecations/);
  });
});

describe('13.9 deprecations: type hints + docs', () => {
  it('@deprecated JSDoc on each runtime-deprecated API', () => {
    const src = readFileSync('src/components/compat-v13/index.ts', 'utf8');
    expect(src).toMatch(/@deprecated[^*]*14\.0[\s\S]{0,400}export function normalizeAnimation/);
  });
  it('docs/deprecations-v14.md lists every id with an anchor, replacement and codemod / migrate path', () => {
    const doc = readFileSync('docs/deprecations-v14.md', 'utf8');
    for (const id of Object.keys(DEPRECATIONS_V14)) expect(doc).toMatch(new RegExp(`<a id="${id}"></a>`));
    expect(doc).toMatch(/usa-codemod-5.*usa-codemod-10/s);
    expect(doc).toMatch(/motionary migrate/);
  });
  it('docs/migrating-to-v14.md covers scene v2 and the deprecations (final in 14.0)', () => {
    const g = readFileSync('docs/migrating-to-v14.md', 'utf8');
    expect(g).toMatch(/motionary migrate/);
    expect(g).toMatch(/deprecations-v14\.md/);
    expect(g).toMatch(/scene-v2/);
  });
  it('old codemod bins print a one-line notice to stderr (14.0: run them with `motionary codemod <n>`)', () => {
    for (const n of [5, 6, 7, 8, 9, 10]) expect(readFileSync(`bin/usa-codemod-${n}.mjs`, 'utf8')).toMatch(/left the package bin in 14\.0.*motionary codemod/);
  });
});
