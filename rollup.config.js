const typescript = require('@rollup/plugin-typescript');
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const terser = require('@rollup/plugin-terser');
const { dts } = require('rollup-plugin-dts');

module.exports = [
  // Main bundle
  {
    input: 'src/index.ts',
    output: [
      // CommonJS (`main`, `exports.require`). The package has no "type": "module",
      // so `.js` is CommonJS for Node.
      {
        file: 'dist/index.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
      },
      // ES module for Node and modern bundlers (`exports.import`). `.mjs` makes
      // Node treat it as ESM without "type": "module".
      {
        file: 'dist/index.mjs',
        format: 'es',
        sourcemap: true,
      },
      // ES module for legacy bundlers reading the `module` field (kept for
      // backward compatibility with deep imports of dist/index.esm.js).
      {
        file: 'dist/index.esm.js',
        format: 'es',
        sourcemap: true,
      },
      {
        file: 'dist/index.umd.js',
        format: 'umd',
        name: 'ScrollAnimate',
        exports: 'named',
        sourcemap: true,
        plugins: [terser()],
      },
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist/types',
        rootDir: './src',
      }),
    ],
  },
  // Bundled type declarations: one for `require` (.d.ts) and one for `import` (.d.mts)
  {
    input: 'src/index.ts',
    output: [
      { file: 'dist/index.d.ts', format: 'es' },
      { file: 'dist/index.d.mts', format: 'es' },
    ],
    plugins: [dts()],
  },
];
