#!/usr/bin/env node
// 10.1: scaffold a Motionary effect plugin.
//   npx -p motionary create-motionary-plugin my-plugin [--dir path] [--force]
// Writes package.json (motionary as a peer, engines.motionary range), src/index.js
// (an EffectPlugin for createMotion().use() / usePlugins()), a test, a README and
// scripts/sign.mjs, which writes the SRI integrity of dist/index.js into
// motionary-plugin.json (checked by verifyPlugin() / <usa-plugin-card integrity>).
import { mkdirSync, writeFileSync, existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const args = process.argv.slice(2);
if (!args.length || args.includes('--help') || args.includes('-h')) {
  console.log('Usage: create-motionary-plugin <name> [--dir <path>] [--force]\n\nScaffolds a Motionary effect plugin (EffectPlugin) with tests, README and an integrity signing script.');
  process.exit(args.length ? 0 : 1);
}
const name = args.find((a) => !a.startsWith('-') && args[args.indexOf(a) - 1] !== '--dir');
if (!/^(@[a-z0-9-]+\/)?[a-z0-9][a-z0-9._-]*$/.test(name || '')) {
  console.error(`create-motionary-plugin: invalid package name "${name}" (lowercase, npm rules)`);
  process.exit(1);
}
const short = name.split('/').pop().replace(/^motionary-(plugin-)?/, '');
const dir = resolve(args.includes('--dir') ? args[args.indexOf('--dir') + 1] : short);
if (existsSync(dir) && readdirSync(dir).length && !args.includes('--force')) {
  console.error(`create-motionary-plugin: ${dir} is not empty (use --force)`);
  process.exit(1);
}
const self = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const major = self.version.split('.')[0];
const effect = `${short}-pop`;
const files = {
  'package.json': JSON.stringify({
    name,
    version: '0.1.0',
    description: `Motionary effect plugin: ${short}`,
    type: 'module',
    main: './dist/index.js',
    exports: { '.': './dist/index.js', './motionary-plugin.json': './motionary-plugin.json' },
    files: ['dist', 'motionary-plugin.json'],
    keywords: ['motionary', 'motionary-plugin', 'animation'],
    scripts: { build: 'node -e "require(\'fs\').mkdirSync(\'dist\',{recursive:true});require(\'fs\').copyFileSync(\'src/index.js\',\'dist/index.js\')"', sign: 'node scripts/sign.mjs', test: 'node --test test/plugin.test.mjs', prepublishOnly: 'npm run build && npm run sign && npm test' },
    peerDependencies: { motionary: `>=${major}.0.0` },
    engines: { motionary: `>=${major}.0.0` },
    license: 'MIT',
  }, null, 2) + '\n',
  'src/index.js': `/**
 * ${name} — a Motionary effect plugin.
 *
 *   import { createMotion } from 'motionary/core';
 *   import ${camel(short)} from '${name}';
 *   createMotion().use(${camel(short)});
 *   // or: import { usePlugins } from 'motionary/fx2'; usePlugins(${camel(short)});
 */
const ${camel(short)} = {
  name: '${short}',
  effects: [
    {
      name: '${effect}',
      kind: 'enter',
      description: 'Scale up with a soft overshoot.',
      // run(el, options, ctx): ctx.animate(el, keyframes, timing) honours reduced motion and pausing
      run(el, options, ctx) {
        if (ctx.reduced) return null;
        return ctx.animate(el, [{ transform: 'scale(.6)', opacity: 0 }, { transform: 'scale(1.08)', opacity: 1, offset: 0.7 }, { transform: 'scale(1)', opacity: 1 }], { duration: 520, easing: 'cubic-bezier(.22,1,.36,1)' });
      },
    },
  ],
};
export default ${camel(short)};
`,
  'test/plugin.test.mjs': `import { test } from 'node:test';
import assert from 'node:assert/strict';
import plugin from '../src/index.js';

test('exports an EffectPlugin', () => {
  assert.equal(typeof plugin.name, 'string');
  assert.ok(Array.isArray(plugin.effects) && plugin.effects.length > 0);
  for (const e of plugin.effects) assert.equal(typeof e.run, 'function');
});
test('respects reduced motion', () => {
  assert.equal(plugin.effects[0].run({}, {}, { reduced: true, animate() { throw new Error('animated'); } }), null);
});
`,
  'scripts/sign.mjs': `// Writes motionary-plugin.json with the SRI integrity of dist/index.js.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const code = readFileSync('dist/index.js');
const integrity = 'sha256-' + createHash('sha256').update(code).digest('base64');
const manifest = { format: 'motionary/plugin', name: pkg.name, version: pkg.version, entry: 'dist/index.js', integrity, engines: pkg.engines };
writeFileSync('motionary-plugin.json', JSON.stringify(manifest, null, 2) + '\\n');
console.log('signed', pkg.name, integrity);
`,
  'README.md': `# ${name}

A [Motionary](https://github.com/HarrisonCN/Motionary) effect plugin.

\`\`\`bash
npm i motionary ${name}
\`\`\`

\`\`\`js
import { createMotion } from 'motionary/core';
import ${camel(short)} from '${name}';

createMotion().use(${camel(short)});
\`\`\`

## Develop

- \`npm test\` — node:test
- \`npm run build && npm run sign\` — writes \`motionary-plugin.json\` with the \`sha256-…\` integrity of \`dist/index.js\`.
  Hosts verify it with \`verifyPlugin(code, integrity)\` from \`motionary/marketplace\`, and
  \`<usa-plugin-card integrity="sha256-…" src=".../dist/index.js">\` shows a Verified badge.
- \`engines.motionary\` is checked by \`checkCompat(manifest, version)\`.
`,
};
function camel(s) {
  return s.replace(/[-_.](\w)/g, (_, c) => c.toUpperCase()).replace(/^\d/, '_$&');
}
for (const [f, s] of Object.entries(files)) {
  mkdirSync(join(dir, f, '..'), { recursive: true });
  writeFileSync(join(dir, f), s);
}
console.log(`Created ${name} in ${dir}\n  cd ${dir} && npm test`);
