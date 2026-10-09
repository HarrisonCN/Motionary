// Regenerates the `./components/<category>` entries of package.json
// `exports` and the `lint:package` CSS exclusions from scripts/categories.mjs.
import { readFileSync, writeFileSync } from 'node:fs';
import { CATEGORIES, COMPONENT_ENTRIES, RUNTIME_ENTRIES } from './categories.mjs';

const file = new URL('../package.json', import.meta.url);
const pkg = JSON.parse(readFileSync(file, 'utf8'));
const entry = (name) => ({
  import: { types: `./dist/${name}.d.ts`, default: `./dist/${name}.js` },
  require: { types: `./dist/${name}.d.cts`, default: `./dist/${name}.cjs` },
});
const out = {};
for (const [k, v] of Object.entries(pkg.exports)) {
  if (k.startsWith('./components/') || k.startsWith('./widgets/') || k.startsWith('./effects/') || k.startsWith('./runtime') || k.startsWith('./manifest') || k === './components.css' || k === './package.json') continue;
  out[k] = v;
}
for (const c of CATEGORIES) out[`./components/${c}`] = entry(`components/${c}`);
for (const n of Object.keys(COMPONENT_ENTRIES)) out[`./components/${n}`] = entry(`components/${n}`);
for (const n of Object.keys(RUNTIME_ENTRIES)) out[`./${n}`] = entry(n);
// 10.9: per-component entries
for (const e of JSON.parse(readFileSync(new URL('./entries.json', import.meta.url), 'utf8'))) { const n = `${e.kind === 'widget' ? 'widgets' : 'effects'}/${e.name}`; out[`./${n}`] = entry(n); }
out['./manifest.json'] = './dist/manifest.json';
out['./manifest.schema.json'] = './dist/manifest.schema.json';
out['./components.css'] = './dist/components.css';
for (const c of CATEGORIES) out[`./components/${c}.css`] = `./dist/components/${c}.css`;
out['./package.json'] = './package.json';
pkg.exports = out;
const css = ['./manifest.json', './manifest.schema.json', './components.css', ...CATEGORIES.map((c) => `./components/${c}.css`)].join(' ');
pkg.scripts['lint:package'] = `publint && attw --pack . --profile node16 --exclude-entrypoints ${css}`;
writeFileSync(file, JSON.stringify(pkg, null, 2) + '\n');
console.log(`package.json exports synced: ${CATEGORIES.length} component categories`);
