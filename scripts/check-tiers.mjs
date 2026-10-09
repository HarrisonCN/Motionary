#!/usr/bin/env node
// 11.4: runtime tiers check on the built package (CI, after `npm run build`).
// Bundles every module of a tier (plus the lower tiers) through the package's own exports with esbuild and checks
//  - each tier bundle stays within its fixed gzip budget (TIER_BUDGETS — never raised automatically);
//  - the basic bundle contains no standard / advanced module, and standard none of advanced.
import { buildSync } from 'esbuild';
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

/** Fixed gzip budgets per tier bundle (all modules of the tier and the tiers below, registered with use()). */
export const TIER_BUDGETS = { basic: 12 * 1024, standard: 37 * 1024, advanced: 60 * 1024 };

const ROOT = process.cwd();
const camel = (id) => id.replace(/-(\w)/g, (_, c) => c.toUpperCase());

export async function main() {
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  const { RUNTIME_TIERS, TIER_ORDER } = await import(pathToFileURL(join(ROOT, 'dist/runtime.js')).href);
  // only the modules this package ships (peers such as rive are not bundled)
  const mods = Object.entries(RUNTIME_TIERS).filter(([id]) => id !== 'core' && pkg.exports[`./runtime/${id}`]);
  const fails = [];
  const out = {};
  for (const tier of TIER_ORDER) {
    const upto = TIER_ORDER.slice(0, TIER_ORDER.indexOf(tier) + 1);
    const ids = mods.filter(([, t]) => upto.includes(t)).map(([id]) => id);
    const code = `import { use } from 'motionary/runtime';\n${ids.map((id) => `import { ${camel(id)} } from 'motionary/runtime/${id}';`).join('\n')}\nuse(${ids.map(camel).join(', ')});\n`;
    const js = buildSync({ stdin: { contents: code, resolveDir: ROOT, loader: 'js' }, bundle: true, write: false, format: 'esm', platform: 'browser', minify: true, logLevel: 'silent' }).outputFiles[0].text;
    const gz = gzipSync(js).length;
    out[tier] = { modules: ids.length + 1, gz };
    if (gz > TIER_BUDGETS[tier]) fails.push(`${tier}: ${(gz / 1024).toFixed(2)} KB gzip > ${(TIER_BUDGETS[tier] / 1024).toFixed(1)} KB`);
    for (const [id, t] of mods) {
      if (!upto.includes(t) && new RegExp(`id:\\s*["']${id}["']`).test(js)) fails.push(`${tier} bundle contains the ${t} module "${id}"`);
    }
  }
  console.log('| tier | modules (incl. core) | gzip | budget |\n|---|---|---|---|');
  for (const [t, r] of Object.entries(out)) console.log(`| ${t} | ${r.modules} | ${(r.gz / 1024).toFixed(2)} KB | ${(TIER_BUDGETS[t] / 1024).toFixed(1)} KB |`);
  if (fails.length) { console.error('❌ check:tiers\n' + fails.map((x) => '  - ' + x).join('\n')); process.exit(1); }
  console.log('✅ check:tiers — each tier within its budget; lower tiers never contain higher-tier modules');
}

if (process.argv[1] && import.meta.url.startsWith('file:') && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch((e) => { console.error('❌ check:tiers:', e.message); process.exit(1); });
