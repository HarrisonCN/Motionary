// JSX through babel-preset-solid — server: generate 'ssr'; client: generate 'dom'; both hydratable
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const req = createRequire(new URL('./package.json', import.meta.url));
const babel = req('@babel/core');
const preset = req.resolve('babel-preset-solid');
const solid = (generate) => ({
  name: 'solid-' + generate,
  setup(b) {
    b.onLoad({ filter: /\.jsx$/ }, async ({ path }) => {
      const { code } = await babel.transformAsync(readFileSync(path, 'utf8'), { filename: path, presets: [[preset, { generate, hydratable: true }]], babelrc: false, configFile: false });
      return { contents: code, loader: 'js' };
    });
  },
});
export default { server: { plugins: [solid('ssr')], conditions: ['solid', 'node'] }, client: { plugins: [solid('dom')], conditions: ['solid', 'browser', 'development'] } };
