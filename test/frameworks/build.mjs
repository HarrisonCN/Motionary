#!/usr/bin/env node
// 13.5.0: framework regression matrix — build one fixture app (docs/frameworks-matrix.md).
//   node test/frameworks/build.mjs <react18|react19|vue3|svelte5|solid|angular>
// Needs the built package (`npm run build`) and the fixture's own dependencies (`npm install` in test/frameworks/<fw>;
// the frameworks are NOT dependencies of motionary). Steps:
//   1. bundle src/server.* for Node and run it in a fresh Node process with no DOM globals (SSR: renderToString /
//      render / renderApplication) — importing motionary/* must not touch window/document at import time;
//   2. bundle src/client.* for the browser (development builds, so hydration mismatches are reported);
//   3. write dist/index.html = server HTML + client script. The Playwright spec (matrix.spec.mjs) hydrates it.
// `motionary` resolves to the repository root through package.json `exports` (node_modules/motionary symlink), and
// every framework import — also the ones inside motionary's own dist (e.g. solid-js) — resolves from the fixture,
// so there is exactly one copy of each framework.
import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, rmSync, symlinkSync, writeFileSync, lstatSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../..');
const fw = process.argv[2];
if (!fw || !existsSync(join(HERE, fw, 'package.json'))) {
  console.error('usage: node test/frameworks/build.mjs <' + readdirSync(HERE).filter((d) => existsSync(join(HERE, d, 'package.json'))).join('|') + '>');
  process.exit(2);
}
const DIR = join(HERE, fw);
const OUT = join(DIR, 'dist');
if (!existsSync(join(DIR, 'node_modules'))) throw new Error(`run \`npm install\` in test/frameworks/${fw} first`);
if (!existsSync(join(ROOT, 'dist/manifest.json'))) throw new Error('build the package first (`npm run build`)');

// node_modules/motionary → repository root (the package as installed: exports map, dist only)
const link = join(DIR, 'node_modules/motionary');
try { lstatSync(link); } catch { symlinkSync(relative(dirname(link), ROOT), link, 'dir'); }

const FRAMEWORK = /^(react|react-dom|vue|@vue\/[^/]+|svelte|solid-js|@angular\/[^/]+|rxjs|tslib|zone\.js)(\/.*)?$/;
const dedupe = {
  name: 'fixture-dedupe',
  setup(b) {
    b.onResolve({ filter: FRAMEWORK }, async (args) => {
      if (args.pluginData === 'dedupe') return undefined;
      const r = await b.resolve(args.path, { kind: args.kind, resolveDir: DIR, pluginData: 'dedupe' });
      return r.errors.length ? { errors: r.errors } : { path: r.path, external: r.external, sideEffects: r.sideEffects };
    });
  },
};

const pick = (base) => ['.tsx', '.ts', '.jsx', '.js', '.mjs'].map((e) => join(DIR, 'src', base + e)).find(existsSync);
const { plugins = [], esbuild: extra = {}, client: clientExtra = {}, server: serverExtra = {}, prepare } = existsSync(join(DIR, 'fixture.config.mjs')) ? (await import(join(DIR, 'fixture.config.mjs'))).default : {};

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
if (prepare) await prepare({ DIR, OUT });

const common = { bundle: true, absWorkingDir: DIR, logLevel: 'warning', plugins: [dedupe, ...plugins], sourcemap: 'inline', ...extra };
const dev = { 'process.env.NODE_ENV': '"development"' };

// 1. server bundle + render in a DOM-free Node process
await build({ ...common, entryPoints: [pick('server')], outfile: join(OUT, 'server.mjs'), platform: 'node', format: 'esm', define: { ...dev, ...extra.define }, ...serverExtra, plugins: [...common.plugins, ...(serverExtra.plugins || [])],
  banner: { js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);" } });
const html = execFileSync(process.execPath, ['--enable-source-maps', '-e', `
  for (const g of ['window', 'document', 'HTMLElement', 'customElements', 'localStorage', 'requestAnimationFrame'])
    if (typeof globalThis[g] !== 'undefined') { console.error('unexpected DOM global ' + g); process.exit(3); }
  const m = await import(${JSON.stringify('file://' + join(OUT, 'server.mjs'))});
  process.stdout.write(await m.render());
`], { cwd: DIR, encoding: 'utf8', input: '', stdio: ['pipe', 'pipe', 'inherit'] });
if (!/<usa-switch\b/.test(html)) throw new Error(`${fw}: server HTML has no <usa-switch>:\n${html.slice(0, 500)}`);
if (/usa-sw-track/.test(html)) throw new Error(`${fw}: server HTML already contains upgraded switch markup`);
writeFileSync(join(OUT, 'ssr.html'), html);

// 2. client bundle (development build: hydration warnings on)
await build({ ...common, entryPoints: [pick('client')], outfile: join(OUT, 'client.js'), platform: 'browser', format: 'esm', define: { ...dev, ...extra.define }, target: 'es2022', ...clientExtra, plugins: [...common.plugins, ...(clientExtra.plugins || [])] });

// 3. page
writeFileSync(join(OUT, 'index.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>motionary × ${fw}</title>
<meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/dist/components.css"></head>
<body><div id="app">${html}</div><script type="module" src="./client.js"></script></body></html>`);
console.log(`${fw}: ok (ssr ${html.length} B) → test/frameworks/${fw}/dist/index.html`);
