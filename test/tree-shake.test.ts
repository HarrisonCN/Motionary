// @vitest-environment node
// 11.1: one export pulls in only its own code — esbuild bundles the sources (docs/tree-shaking.md).
// Node environment: esbuild refuses to run under jsdom (its TextEncoder invariant).
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { build, type Plugin } from 'esbuild';

const ROOT = process.cwd();
const read = (f: string) => readFileSync(f, 'utf8');

// `*.css?raw` → the file's text (what the build's cssRaw plugin does)
const raw: Plugin = {
  name: 'raw',
  setup(b) {
    b.onResolve({ filter: /\?raw$/ }, (a) => ({ path: join(a.resolveDir, a.path.replace(/\?raw$/, '')), namespace: 'raw' }));
    b.onLoad({ filter: /.*/, namespace: 'raw' }, (a) => ({ contents: read(a.path), loader: 'text' }));
  },
};
const bundle = async (code: string): Promise<string> =>
  (await build({ stdin: { contents: code, resolveDir: ROOT, loader: 'ts' }, bundle: true, write: false, format: 'esm', platform: 'browser', minify: true, logLevel: 'silent', plugins: [raw], external: ['solid-js', '@rive-app/*', 'draco3d'] })).outputFiles[0].text;

describe('11.1: one export pulls in only its own code (esbuild, from src)', () => {
  it('a bare import of any library module bundles to nothing', async () => {
    for (const m of ['./src/index.ts', './src/components/index.ts', './src/components/widgets/index.ts', './src/components/plugins/index.ts', './src/runtime/index.ts', './src/components/fx2/index.ts']) {
      expect((await bundle(`import '${m}';`)).trim(), m).toBe('');
    }
  }, 60_000);
  it('defineAddToCart from the widgets index does not bring the other widgets', async () => {
    const one = await bundle("import { defineAddToCart } from './src/components/widgets/index.ts'; defineAddToCart();");
    for (const t of ['usa-bar-chart', 'usa-gl-scene', 'usa-kanban', 'usa-command-palette']) expect(one.includes(t), t).toBe(false);
    expect(one.length).toBeLessThan(40_000);
    const all = await bundle("import { defineWidgets } from './src/components/widgets/index.ts'; defineWidgets();");
    expect(all.length).toBeGreaterThan(one.length * 10);
  }, 60_000);
  it('one plugin from motionary/plugins does not bring the other packs', async () => {
    const one = await bundle("import { gpu } from './src/components/plugins/index.ts'; console.log(gpu);");
    for (const t of ['liquid-text', 'coin-burst', 'film-burn']) expect(one.includes(t), t).toBe(false);
  }, 60_000);
  it('the runtime core does not bring WebGL / glTF code', async () => {
    const one = await bundle("import { tween } from './src/runtime/index.ts'; console.log(tween);");
    expect(one.includes('webgl2')).toBe(false);
    expect(one.length).toBeLessThan(20_000);
  }, 60_000);
});
