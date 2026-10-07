import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import { dts } from 'rollup-plugin-dts';

// Peer dependencies are never bundled.
const external = ['solid-js'];

// Every entry (`use-scroll-animate` and `use-scroll-animate/<name>`) shares
// code through dist/chunks/, so importing several never loads the core twice.
const entries = {
  index: 'src/index.ts',
  react: 'src/react.ts',
  vue: 'src/vue.ts',
  svelte: 'src/svelte.ts',
  solid: 'src/solid.ts',
  element: 'src/element.ts',
};

const ts = () => typescript({ tsconfig: './tsconfig.json', declaration: false, declarationDir: undefined });

export default [
  // ESM first ("type": "module": .js = ESM), plus CommonJS (.cjs) for require()
  {
    input: entries,
    external,
    output: [
      { dir: 'dist', format: 'es', entryFileNames: '[name].js', chunkFileNames: 'chunks/[name]-[hash].js', sourcemap: true },
      { dir: 'dist', format: 'cjs', entryFileNames: '[name].cjs', chunkFileNames: 'chunks/[name]-[hash].cjs', exports: 'named', sourcemap: true },
    ],
    plugins: [resolve(), ts()],
  },
  // Browser globals for <script> tags / CDNs (unchanged URLs)
  {
    input: 'src/index.ts',
    output: { file: 'dist/index.umd.js', format: 'umd', name: 'ScrollAnimate', exports: 'named', sourcemap: true, plugins: [terser()] },
    plugins: [resolve(), ts()],
  },
  {
    // Registers <scroll-animate> on load.
    input: 'src/element-auto.ts',
    output: { file: 'dist/element.umd.js', format: 'umd', name: 'ScrollAnimateElement', exports: 'named', sourcemap: true, plugins: [terser()] },
    plugins: [resolve(), ts()],
  },
  // Bundled declarations: .d.ts next to the ESM .js, .d.cts next to the .cjs
  ...Object.entries(entries).map(([name, input]) => ({
    input,
    external,
    output: [
      { file: `dist/${name}.d.ts`, format: 'es' },
      { file: `dist/${name}.d.cts`, format: 'es' },
    ],
    plugins: [dts()],
  })),
];
