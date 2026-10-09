import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import { dts } from 'rollup-plugin-dts';
import { readFileSync, readdirSync } from 'node:fs';
import { CATEGORIES, COMPONENT_ENTRIES, RUNTIME_ENTRIES } from './scripts/categories.mjs';
import { dirname, resolve as pathResolve } from 'node:path';

// `import css from './x.css?raw'` → the minified stylesheet as a string
// (Vite/Vitest support `?raw` natively; this mirrors it for the build).
export function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};,>])\s*/g, '$1')
    .replace(/:\s+/g, ':')
    .replace(/;}/g, '}')
    .trim();
}
const cssRaw = () => ({
  name: 'css-raw',
  async resolveId(source, importer) {
    if (!source.endsWith('.css?raw')) return null;
    const r = await this.resolve(source.slice(0, -4), importer, { skipSelf: true });
    return r && '\0raw:' + r.id;
  },
  load(id) {
    if (!id.startsWith('\0raw:')) return null;
    const file = id.slice(5);
    this.addWatchFile(file);
    return `export default ${JSON.stringify(minifyCss(readFileSync(file, 'utf8')))};`;
  },
});

// dist/components.css (+ one file per category) for apps that load styles
// themselves (e.g. a strict CSP, or configureComponents({ injectStyles: false })).
const CSS_CATEGORIES = Object.fromEntries(
  CATEGORIES.map((cat) => [
    cat,
    readdirSync(`src/components/${cat}`)
      .filter((f) => f.endsWith('.css') && !f.endsWith('.shadow.css'))
      .sort()
      .map((f) => `${cat}/${f}`),
  ])
);
const BASE_CSS = '.usa-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;border:0}';
const componentsCss = () => ({
  name: 'components-css',
  generateBundle() {
    const read = (f) => minifyCss(readFileSync(`src/components/${f}`, 'utf8'));
    const all = [BASE_CSS];
    for (const [cat, files] of Object.entries(CSS_CATEGORIES)) {
      const css = files.map(read).join('\n');
      all.push(css);
      this.emitFile({ type: 'asset', fileName: `components/${cat}.css`, source: `/* motionary/components/${cat} */\n${BASE_CSS}\n${css}\n` });
    }
    this.emitFile({ type: 'asset', fileName: 'components.css', source: `/* motionary/components — all <usa-*> styles */\n${all.join('\n')}\n` });
  },
});

// Peer dependencies are never bundled.
const external = ['solid-js'];

// Every entry (`motionary` and `motionary/<name>`) shares
// code through dist/chunks/, so importing several never loads the core twice.
const entries = {
  index: 'src/index.ts',
  react: 'src/react.ts',
  vue: 'src/vue.ts',
  svelte: 'src/svelte.ts',
  solid: 'src/solid.ts',
  element: 'src/element.ts',
  'presets/extended': 'src/extended-presets.ts',
  components: 'src/components/index.ts',
  ...Object.fromEntries(CATEGORIES.map((c) => [`components/${c}`, `src/components/${c}/index.ts`])),
  ...Object.fromEntries(Object.entries(COMPONENT_ENTRIES).filter(([n]) => n !== 'lite').map(([n, src]) => [`components/${n}`, `src/components/${src}.ts`])),
  ...Object.fromEntries(Object.entries(RUNTIME_ENTRIES).map(([n, src]) => [n, `src/runtime/${src}.ts`])),
};

// 10.1: CDN builds of motionary/runtime. runtime.iife.js = core (window.MotionaryRuntime, registers itself);
// runtime/<module>.iife.js reads the core from window.MotionaryRuntime (load it first) and registers the module.
const RUNTIME_CORE_FILES = /[\\/]src[\\/]runtime[\\/](index|registry|ticker|tween|ease)(\.ts)?$/;
const runtimeIife = () => [
  { input: 'src/runtime/iife/core.ts', output: { file: 'dist/runtime.iife.js', format: 'iife', name: 'MotionaryRuntime', extend: true, exports: 'named', sourcemap: true, plugins: [terser()] }, plugins: [resolve(), ts()] },
  ...Object.values(RUNTIME_ENTRIES).filter((m) => m !== 'index').map((m) => ({
    input: `src/runtime/iife/${m}.ts`,
    external: (id, importer) => !!importer && RUNTIME_CORE_FILES.test(id.startsWith('.') ? pathResolve(dirname(importer), id) : id),
    output: { file: `dist/runtime/${m}.iife.js`, format: 'iife', name: 'MotionaryRuntime', extend: true, exports: 'named', globals: () => 'MotionaryRuntime', sourcemap: true, plugins: [terser()] },
    plugins: [resolve(), ts()],
  })),
];

// `?raw` imports of light-DOM CSS become '' (the lite build loads dist/components/<cat>.css
// on demand instead); shadow-DOM styles stay inlined.
const cssEmpty = () => ({
  name: 'css-empty',
  async resolveId(source, importer) {
    if (!source.endsWith('.css?raw') || source.endsWith('.shadow.css?raw')) return null;
    return '\0empty-css:' + source;
  },
  load(id) {
    return id.startsWith('\0empty-css:') ? 'export default "";' : null;
  },
});

const ts = () => typescript({ tsconfig: './tsconfig.json', declaration: false, declarationDir: undefined });

// 10.5: the build runs in several processes so the sandbox / CI never needs one huge heap
// (PART=code → JS bundles; PART=dts SLICE=i/n → the i-th of n slices of the declaration bundles; unset → everything).
const PART = process.env.PART || 'all';
const SLICE = (process.env.SLICE || '0/1').split('/').map(Number);
const pick = (code, decls) => [...(PART === 'dts' ? [] : code), ...(PART === 'code' ? [] : decls.filter((_, i) => i % SLICE[1] === SLICE[0]))];

export default pick([
  ...runtimeIife(),
  // ESM first ("type": "module": .js = ESM), plus CommonJS (.cjs) for require()
  {
    input: entries,
    external,
    output: [
      { dir: 'dist', format: 'es', entryFileNames: '[name].js', chunkFileNames: 'chunks/[name]-[hash].js', sourcemap: true },
      { dir: 'dist', format: 'cjs', entryFileNames: '[name].cjs', chunkFileNames: 'chunks/[name]-[hash].cjs', exports: 'named', sourcemap: true },
    ],
    plugins: [cssRaw(), resolve(), ts()],
  },
  // Browser globals for <script> tags / CDNs (unchanged URLs)
  {
    input: 'src/index.ts',
    output: { file: 'dist/index.umd.js', format: 'umd', name: 'ScrollAnimate', exports: 'named', sourcemap: true, plugins: [terser()] },
    plugins: [resolve(), ts()],
  },
  {
    // 6.1 extended presets for <script> pages: registers itself into the shared preset table.
    input: 'src/extended-presets-umd.ts',
    output: { file: 'dist/presets-extended.umd.js', format: 'umd', name: 'ScrollAnimatePresets', exports: 'named', sourcemap: true, plugins: [terser()] },
    plugins: [resolve(), ts()],
  },
  {
    // Registers <scroll-animate> on load.
    input: 'src/element-auto.ts',
    output: { file: 'dist/element.umd.js', format: 'umd', name: 'ScrollAnimateElement', exports: 'named', sourcemap: true, plugins: [terser()] },
    plugins: [resolve(), ts()],
  },
  {
    // No-build bundle: <script src="components.umd.js"> registers every <usa-*>
    // element and exposes the API as window.UsaComponents. Also writes the CSS files.
    input: 'src/components/auto.ts',
    output: { dir: 'dist', entryFileNames: 'components.umd.js', format: 'umd', name: 'UsaComponents', exports: 'named', sourcemap: true, plugins: [terser()] },
    plugins: [cssRaw(), resolve(), ts(), componentsCss()],
  },
  {
    // 6.2+: <script src="widgets.umd.js"> registers every 6.x widget + 6.x effect pack (window.UsaWidgets).
    input: 'src/components/widgets/auto.ts',
    output: { file: 'dist/widgets.umd.js', format: 'umd', name: 'UsaWidgets', exports: 'named', sourcemap: true, plugins: [terser()] },
    plugins: [cssRaw(), resolve(), ts()],
  },
  // components/lite: everything, CSS loaded on demand (self-contained file, 4.5).
  {
    input: 'src/components/lite.ts',
    external,
    output: [
      { file: 'dist/components/lite.js', format: 'es', inlineDynamicImports: true, sourcemap: true },
      { file: 'dist/components/lite.cjs', format: 'cjs', exports: 'named', inlineDynamicImports: true, sourcemap: true },
    ],
    plugins: [
      cssEmpty(),
      cssRaw(),
      resolve(),
      ts(),
      {
        // Declarations: the same API as components (+ perf), no second dts bundle.
        name: 'lite-dts',
        generateBundle(opts) {
          if (opts.format !== 'es') return;
          for (const ext of ['d.ts', 'd.cts']) {
            const from = ext === 'd.ts' ? '.js' : '.cjs';
            this.emitFile({ type: 'asset', fileName: `lite.${ext}`, source: `export * from '../components${from}';\nexport * from './perf${from}';\n/** The dist/ folder this module was loaded from. */\nexport declare const STYLE_BASE: string;\n` });
          }
        },
      },
    ],
  },
], // Bundled declarations: .d.ts next to the ESM .js, .d.cts next to the .cjs
  Object.entries(entries).map(([name, input]) => ({
    input,
    external,
    output: [
      { file: `dist/${name}.d.ts`, format: 'es' },
      { file: `dist/${name}.d.cts`, format: 'es' },
    ],
    plugins: [cssRaw(), dts()],
  })),
);
