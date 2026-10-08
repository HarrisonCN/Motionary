#!/usr/bin/env node
// use-scroll-animate 4.x → 5.0 codemod.
//   npx usa-codemod-5 [--write] [paths…]   (default: ./src; dry run without --write)
// Rewrites:
//   1. motionIntensity: 'off'            → motionSensitivity: 'minimal'
//   2. setMotionIntensity('off'…)         → setMotionSensitivity('minimal'…) (+ import from components/a11y)
//   3. reducedMotion: 'no-preference'     → reducedMotion: 'user'
//   4. <usa-timeline … scrub="js" …>      → scrub smooth="0.1"
//   5. configureComponents / prefersReducedMotion imported from a category entry
//      (use-scroll-animate/components/<category>) → from 'use-scroll-animate/components'
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { pathToFileURL } from 'node:url';

const EXT = new Set(['.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx', '.mts', '.cts', '.vue', '.svelte', '.html', '.astro']);
const SHARED = ['configureComponents', 'prefersReducedMotion', 'ComponentsConfig', 'UsaElement'];

/** Apply every rewrite to one file's source. Returns { code, changes }. */
export function transform(source) {
  const changes = [];
  let code = source;
  const rep = (re, to, label) => {
    code = code.replace(re, (...m) => {
      changes.push(label);
      return typeof to === 'function' ? to(...m) : to;
    });
  };
  rep(/motionIntensity(\s*:\s*)(['"])off\2/g, (_m, sep, q) => `motionSensitivity${sep}${q}minimal${q}`, "motionIntensity: 'off' → motionSensitivity: 'minimal'");
  let usedSens = false;
  rep(/\bsetMotionIntensity\(\s*(['"])off\1/g, (_m, q) => ((usedSens = true), `setMotionSensitivity(${q}minimal${q}`), "setMotionIntensity('off') → setMotionSensitivity('minimal')");
  rep(/reducedMotion(\s*:\s*)(['"])no-preference\2/g, (_m, sep, q) => `reducedMotion${sep}${q}user${q}`, "reducedMotion: 'no-preference' → 'user'");
  rep(/(<usa-timeline\b[^>]*?)\bscrub=(["'])js\2/g, (_m, pre) => `${pre}scrub smooth="0.1"`, '<usa-timeline scrub="js"> → scrub smooth="0.1"');
  // shared names imported from a category entry
  rep(/import\s+(type\s+)?\{([^}]*)\}\s*from\s*(['"])use-scroll-animate\/components\/([a-z-]+)\3;?/g, (m, type, names, q, cat) => {
    if (['react', 'vue', 'svelte', 'solid', 'angular', 'jsx', 'lazy', 'tokens', 'a11y', 'perf', 'bridge', 'lite'].includes(cat)) return changes.pop(), m;
    const list = names.split(',').map((n) => n.trim()).filter(Boolean);
    const shared = list.filter((n) => SHARED.includes(n.replace(/^type\s+/, '').split(/\s+as\s+/)[0]));
    changes.pop(); // the generic label; re-pushed precisely below when something changes
    if (!shared.length) return m;
    changes.push(`${shared.join(', ')} → import from 'use-scroll-animate/components'`);
    const rest = list.filter((n) => !shared.includes(n));
    const t = type || '';
    const a = rest.length ? `import ${t}{ ${rest.join(', ')} } from ${q}use-scroll-animate/components/${cat}${q};\n` : '';
    return `${a}import ${t}{ ${shared.join(', ')} } from ${q}use-scroll-animate/components${q};`;
  }, 'shared import');
  if (usedSens && !/\bsetMotionSensitivity\b[^(]*from\s*['"]use-scroll-animate/.test(code) && /\bimport\b/.test(code)) {
    code = code.replace(/^(\s*import[^\n]*\n)/m, `import { setMotionSensitivity } from 'use-scroll-animate/components/a11y';\n$1`);
    changes.push("added import { setMotionSensitivity } from 'use-scroll-animate/components/a11y'");
  }
  return { code, changes };
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
  for (const root of paths.length ? paths : ['src'])
    for (const f of walk(root)) {
      const src = readFileSync(f, 'utf8');
      const { code, changes } = transform(src);
      if (!changes.length) continue;
      files++;
      edits += changes.length;
      console.log(`${f}\n  - ${changes.join('\n  - ')}`);
      if (write) writeFileSync(f, code);
    }
  console.log(`\n${edits} change(s) in ${files} file(s)${write ? ' written' : ' (dry run — add --write to apply)'}.`);
  return { files, edits };
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) run(process.argv.slice(2));
