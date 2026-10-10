// Regenerates the `./components/<category>` entries of package.json
// `exports` and the `lint:package` CSS exclusions from scripts/categories.mjs.
import { readFileSync, writeFileSync } from 'node:fs';
import { CATEGORIES, COMPONENT_ENTRIES, RUNTIME_ENTRIES } from './categories.mjs';
import { LAYER_ALIASES, DEPRECATED_PATHS, PATHS_REMOVED } from '../bin/public-paths.mjs';

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
// 11.5: layer subpath aliases (same files as the paths they replace) and @deprecated types for the old paths
for (const [alias, target] of Object.entries(LAYER_ALIASES)) out[`./${alias}`] = out[`./${target}`];
// 13.0: the old paths are removed (the aliases above already point at the same dist files)
if (PATHS_REMOVED) for (const old of Object.keys(DEPRECATED_PATHS)) delete out[`./${old}`];
for (const [old] of Object.entries(PATHS_REMOVED ? {} : DEPRECATED_PATHS)) {
  if (old.endsWith('.json')) continue;
  const d = `./dist/deprecated/${old.replace(/\//g, '-')}`;
  const e = out[`./${old}`];
  out[`./${old}`] = { import: { types: `${d}.d.ts`, default: e.import.default }, require: { types: `${d}.d.cts`, default: e.require.default } };
}
out['./package.json'] = './package.json';
pkg.exports = out;
const css = [...(PATHS_REMOVED ? [] : ['./manifest.json', './manifest.schema.json']), ...Object.keys(LAYER_ALIASES).filter((a) => a.endsWith('.json')).map((a) => `./${a}`), './components.css', ...CATEGORIES.map((c) => `./components/${c}.css`)].join(' ');
pkg.scripts['lint:package'] = `publint && attw --pack . --profile node16 --exclude-entrypoints ${css}`;
writeFileSync(file, JSON.stringify(pkg, null, 2) + '\n');
console.log(`package.json exports synced: ${CATEGORIES.length} component categories`);
