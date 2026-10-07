const typescript = require('@rollup/plugin-typescript');
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const terser = require('@rollup/plugin-terser');
const { dts } = require('rollup-plugin-dts');

// Peer dependencies are never bundled.
const external = ['solid-js'];

// Subpath entries (`use-scroll-animate/<name>`) share code with the main entry
// through chunks in dist/chunks/, so importing several of them never loads two
// copies of the core.
const entries = {
  index: 'src/index.ts',
  react: 'src/react.ts',
  vue: 'src/vue.ts',
  svelte: 'src/svelte.ts',
  solid: 'src/solid.ts',
  element: 'src/element.ts',
};

const ts = (extra = {}) =>
  typescript({ tsconfig: './tsconfig.json', declaration: false, declarationDir: undefined, ...extra });

module.exports = [
  // ESM (.mjs, `exports.import`) + CommonJS (.js, `main` / `exports.require`)
  {
    input: entries,
    external,
    output: [
      { dir: 'dist', format: 'es', entryFileNames: '[name].mjs', chunkFileNames: 'chunks/[name]-[hash].mjs', sourcemap: true },
      { dir: 'dist', format: 'cjs', entryFileNames: '[name].js', chunkFileNames: 'chunks/[name]-[hash].js', exports: 'named', sourcemap: true },
    ],
    plugins: [resolve(), commonjs(), ts()],
  },
  // Single-file ES module for legacy bundlers reading the `module` field, plus
  // the per-file declarations in dist/types/ (kept for backward compatibility).
  {
    input: 'src/index.ts',
    output: { file: 'dist/index.esm.js', format: 'es', sourcemap: true },
    plugins: [resolve(), commonjs(), ts({ declaration: true, declarationDir: './dist/types', rootDir: './src' })],
  },
  // Browser globals for <script> tags / CDNs
  {
    input: 'src/index.ts',
    output: { file: 'dist/index.umd.js', format: 'umd', name: 'ScrollAnimate', exports: 'named', sourcemap: true, plugins: [terser()] },
    plugins: [resolve(), commonjs(), ts()],
  },
  {
    // Registers <scroll-animate> on load.
    input: 'src/element-auto.ts',
    output: { file: 'dist/element.umd.js', format: 'umd', name: 'ScrollAnimateElement', exports: 'named', sourcemap: true, plugins: [terser()] },
    plugins: [resolve(), commonjs(), ts()],
  },
  // Bundled type declarations: .d.ts for `require`, .d.mts for `import`
  ...Object.entries(entries).map(([name, input]) => ({
    input,
    external,
    output: [
      { file: `dist/${name}.d.ts`, format: 'es' },
      { file: `dist/${name}.d.mts`, format: 'es' },
    ],
    plugins: [dts()],
  })),
];
