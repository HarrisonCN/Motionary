// compile .svelte with svelte/compiler — server: generate 'server'; client: generate 'client' (hydratable, dev warnings)
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname } from 'node:path';
const req = createRequire(new URL('./package.json', import.meta.url));
const sc = await import(req.resolve('svelte/compiler'));
const compile = sc.compile ?? sc.default.compile;
const svelte = (generate) => ({
  name: 'svelte-' + generate,
  setup(b) {
    b.onLoad({ filter: /\.svelte$/ }, ({ path }) => {
      const { js, warnings } = compile(readFileSync(path, 'utf8'), { filename: path, generate, dev: generate === 'client' });
      return { contents: js.code, loader: 'js', resolveDir: dirname(path), warnings: warnings.map((w) => ({ text: `svelte ${w.code}: ${w.message}` })) };
    });
  },
});
export default { server: { plugins: [svelte('server')] }, client: { plugins: [svelte('client')] } };
