// Print raw / gzipped sizes of the build outputs and of a core-only import.
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { rollup } from 'rollup';
import terser from '@rollup/plugin-terser';

const gz = (code) => gzipSync(code, { level: 9 }).length;
const row = (name, code) => console.log(`${name.padEnd(34)} ${String(code.length).padStart(7)} B  ${String(gz(code)).padStart(6)} B gz`);

for (const f of ['dist/index.mjs', 'dist/index.js', 'dist/index.umd.js']) row(f, readFileSync(f));

async function treeShaken(label, source) {
  const bundle = await rollup({
    input: 'entry',
    plugins: [
      { name: 'virtual', resolveId: (id) => (id === 'entry' ? id : id === 'pkg' ? 'dist/index.mjs' : null), load: (id) => (id === 'entry' ? source : null) },
      terser(),
    ],
  });
  const { output } = await bundle.generate({ format: 'es' });
  row(label, Buffer.from(output[0].code));
}
await treeShaken('minified: everything', "export * from 'pkg'; export { default } from 'pkg';");
await treeShaken('minified: core (default instance)', "export { default } from 'pkg';");
await treeShaken('minified: createScrollAnimate', "export { createScrollAnimate } from 'pkg';");
await treeShaken('minified: sequence', "export { sequence } from 'pkg';");
