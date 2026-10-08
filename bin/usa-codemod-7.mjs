#!/usr/bin/env node
// motionary 6.x → 7.0 codemod.
//   npx usa-codemod-7 [--write] [paths…]   (default: ./src; dry run without --write)
// Rewrites (6.9 deprecations, removed in 7.0):
//   1. 6.x effect-pack registrars → the *Pack names:
//      registerFx2 → registerEffectPacks, registerGpuEffects → registerGpuPack,
//      registerTextEffects3 → registerTextPack, registerLightEffects → registerLightPack,
//      register3dEffects → register3dPack, registerMorphEffects2 → registerMorphPack,
//      registerTransitionEffects2 → registerTransitionsPack, registerWeatherEffects → registerWeatherPack,
//      registerPhysicsEffects2 → registerPhysicsPack, FX2_PACKS → EFFECT_PACKS
//      (identifiers, imports and UsaWidgets.* globals).
//   2. <usa-tooltip …> → <usa-tip …> (same text / placement / delay attributes).
//   3. <usa-toggle …> → <usa-switch …> (same checked / disabled / label / name / value).
// Reported for a manual change:
//   4. defineTooltip / defineToggle imports (use defineTip / defineSwitch from motionary/components/widgets),
//      document.createElement('usa-tooltip' | 'usa-toggle'), CSS selectors on the old tags.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { pathToFileURL } from 'node:url';

const EXT = new Set(['.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx', '.mts', '.cts', '.vue', '.svelte', '.html', '.astro', '.md', '.mdx']);
export const RENAMES = {
  registerFx2: 'registerEffectPacks',
  registerGpuEffects: 'registerGpuPack',
  registerTextEffects3: 'registerTextPack',
  registerLightEffects: 'registerLightPack',
  register3dEffects: 'register3dPack',
  registerMorphEffects2: 'registerMorphPack',
  registerTransitionEffects2: 'registerTransitionsPack',
  registerWeatherEffects: 'registerWeatherPack',
  registerPhysicsEffects2: 'registerPhysicsPack',
  FX2_PACKS: 'EFFECT_PACKS',
};
export const TAGS = { 'usa-tooltip': 'usa-tip', 'usa-toggle': 'usa-switch' };

/** Apply every rewrite to one file's source. Returns { code, changes, manual }. */
export function transform(source) {
  const changes = [];
  const manual = [];
  let code = source;
  for (const [from, to] of Object.entries(RENAMES)) {
    const re = new RegExp(`(?<![\\w$])${from}(?![\\w$])`, 'g');
    const n = (code.match(re) || []).length;
    if (n) {
      code = code.replace(re, to);
      changes.push(`${from} → ${to} (${n}×)`);
    }
  }
  for (const [from, to] of Object.entries(TAGS)) {
    const re = new RegExp(`<(/?)${from}(?=[\\s>/])`, 'g');
    const n = (code.match(re) || []).length;
    if (n) {
      code = code.replace(re, `<$1${to}`);
      changes.push(`<${from}> → <${to}> (${n}×)`);
    }
    if (new RegExp(`createElement\\((['"\`])${from}\\1\\)`).test(code) || new RegExp(`(^|[\\s,{}>+~])${from}(?=[\\s.:#\\[{,>+~)]|$)`, 'm').test(code.replace(/<\/?[a-z][^>]*>/g, ''))) manual.push(`${from} is removed in 7.0 — use <${to}> (createElement / CSS selectors are not rewritten)`);
  }
  if (/\bdefineTooltip\b/.test(code)) manual.push("defineTooltip() is removed in 7.0 — import { defineTip } from 'motionary/components/widgets'");
  if (/\bdefineToggle\b/.test(code)) manual.push("defineToggle() is removed in 7.0 — import { defineSwitch } from 'motionary/components/widgets'");
  return { code, changes, manual };
}

function* walk(p) {
  const st = statSync(p);
  if (st.isDirectory()) {
    for (const f of readdirSync(p)) if (!['node_modules', 'dist', '.git'].includes(f)) yield* walk(join(p, f));
  } else if (EXT.has(extname(p))) yield p;
}

export function run(args) {
  const write = args.includes('--write');
  const paths = args.filter((a) => !a.startsWith('--'));
  let files = 0;
  let edits = 0;
  let todo = 0;
  for (const root of paths.length ? paths : ['src'])
    for (const f of walk(root)) {
      const src = readFileSync(f, 'utf8');
      const { code, changes, manual } = transform(src);
      if (!changes.length && !manual.length) continue;
      files++;
      edits += changes.length;
      todo += manual.length;
      console.log(`${f}${changes.map((c) => `\n  - ${c}`).join('')}${manual.map((c) => `\n  ! manual: ${c}`).join('')}`);
      if (write && changes.length) writeFileSync(f, code);
    }
  console.log(`\n${files} file(s), ${edits} rewrite(s)${write ? ' applied' : ' (dry run — pass --write to apply)'}, ${todo} manual change(s).`);
  return { files, edits, todo };
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) run(process.argv.slice(2));
