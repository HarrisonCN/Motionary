// Regenerates the `./components/<category>` entries of package.json
// `exports` and the `lint:package` CSS exclusions from scripts/categories.mjs.
import { readFileSync, writeFileSync } from 'node:fs';
import { CATEGORIES } from './categories.mjs';

const file = new URL('../package.json', import.meta.url);
const pkg = JSON.parse(readFileSync(file, 'utf8'));
const entry = (name) => ({
  import: { types: `./dist/${name}.d.ts`, default: `./dist/${name}.js` },
  require: { types: `./dist/${name}.d.cts`, default: `./dist/${name}.cjs` },
});
const out = {};
for (const [k, v] of Object.entries(pkg.exports)) {
  if (k.startsWith('./components/') || k === './components.css' || k === './package.json') continue;
  out[k] = v;
}
for (const c of CATEGORIES) out[`./components/${c}`] = entry(`components/${c}`);
out['./components.css'] = './dist/components.css';
for (const c of CATEGORIES) out[`./components/${c}.css`] = `./dist/components/${c}.css`;
out['./package.json'] = './package.json';
pkg.exports = out;
const css = ['./components.css', ...CATEGORIES.map((c) => `./components/${c}.css`)].join(' ');
pkg.scripts['lint:package'] = `publint && attw --pack . --profile node16 --exclude-entrypoints ${css}`;
writeFileSync(file, JSON.stringify(pkg, null, 2) + '\n');
console.log(`package.json exports synced: ${CATEGORIES.length} component categories`);
