// Print raw / gzipped sizes of the build outputs and of tree-shaken imports,
// and with `--check` fail when an entry exceeds its gzip budget in
// size-budget.json. Run after `npm run build`.
import { readFileSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { rollup } from 'rollup';
import terser from '@rollup/plugin-terser';

const check = process.argv.includes('--check');
const budgets = JSON.parse(readFileSync(new URL('../size-budget.json', import.meta.url), 'utf8'));
const gz = (code) => gzipSync(code, { level: 9 }).length;
// Resolve `pkg` / `pkg/<sub>` through package.json `exports` (as a consumer would), so a budget on a removed or
// unexported path fails instead of silently measuring the dist file behind it.
const exportsMap = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).exports;
const resolvePkg = (id) => {
  const key = id === 'pkg' ? '.' : './' + id.slice(4);
  const e = exportsMap[key];
  const file = e && (typeof e === 'string' ? e : e.import?.default ?? e.default);
  if (!file) throw new Error(`size budget imports '${id.replace(/^pkg/, 'motionary')}', which package.json does not export`);
  return file.replace(/^\.\//, '');
};
const rows = [];
const fmt = (n) => (n / 1024).toFixed(2) + ' kB';

async function treeShaken(source) {
  const bundle = await rollup({
    input: 'entry',
    onwarn: () => undefined,
    external: ['solid-js'],
    plugins: [
      {
        name: 'virtual',
        resolveId: (id) => (id === 'entry' ? id : id === 'pkg' || id.startsWith('pkg/') ? resolvePkg(id) : null),
        load: (id) => (id === 'entry' ? source : null),
      },
      terser(),
    ],
  });
  const { output } = await bundle.generate({ format: 'es' });
  return Buffer.from(output[0].code);
}

for (const b of budgets) {
  let code;
  if (b.file) {
    if (!existsSync(b.file)) {
      rows.push({ ...b, missing: true });
      continue;
    }
    code = readFileSync(b.file);
  } else {
    code = await treeShaken(b.import);
  }
  rows.push({ ...b, raw: code.length, gz: gz(code) });
}

let failed = false;
console.log('| Entry | Size | Gzip | Budget (gzip) | |');
console.log('|---|---:|---:|---:|---|');
for (const r of rows) {
  if (r.missing) {
    console.log(`| ${r.name} | – | – | ${fmt(r.limit)} | ❌ missing |`);
    failed = true;
    continue;
  }
  const ok = r.gz <= r.limit;
  if (!ok) failed = true;
  console.log(`| ${r.name} | ${fmt(r.raw)} | ${fmt(r.gz)} | ${fmt(r.limit)} | ${ok ? '✅' : '❌ over budget'} |`);
}
if (check && failed) {
  console.error('\nSize budget exceeded (see size-budget.json).');
  process.exit(1);
}
