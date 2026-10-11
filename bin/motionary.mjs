#!/usr/bin/env node
// motionary — command line (11.5).
//   npx motionary doctor [paths…] [--json]   scan a project for deprecated import paths (exit 1 when found)
//   npx motionary export --target css|wxss|arkts   presets + motion tokens for other platforms (12.1)
//   npx motionary migrate <files…> [--write|--out f] [--diff] [--report] [--json] [--tokenize]   v1 motion JSON → scene v2 draft (13.9)
//   npx motionary help
// Old subpaths still work (removed in 13.0) and never warn at runtime; `doctor` is how a project finds them.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { exportMotion, TARGETS } from './xplat.mjs';
import { DEPRECATED_PATHS, REMOVED_IN, LEGACY_EVENTS, EVENTS_REMOVED_IN, findDeprecated } from './public-paths.mjs';

const EXT = new Set(['.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx', '.mts', '.cts', '.vue', '.svelte', '.html', '.astro', '.md', '.mdx', '.json']);
const SKIP = new Set(['node_modules', 'dist', '.git', 'build', 'coverage', '.next', '.nuxt', '.svelte-kit']);

function* walk(p) {
  const st = statSync(p);
  if (st.isDirectory()) {
    for (const f of readdirSync(p)) if (!SKIP.has(f)) yield* walk(join(p, f));
  } else if (EXT.has(extname(p)) && !p.endsWith('package-lock.json')) yield p;
}

/** Scan files / directories; returns [{ file, line, kind: 'path' | 'event', from, to, removedIn }]. */
export function doctor(paths) {
  const found = [];
  for (const root of paths.length ? paths : ['.']) {
    if (!existsSync(root)) continue;
    for (const f of walk(root)) for (const h of findDeprecated(readFileSync(f, 'utf8'))) found.push({ file: f, ...h });
  }
  return found;
}

const HELP = `motionary <command>

  doctor [paths…] [--json]   list deprecated motionary import paths and legacy event names (default: current directory).
                             Exit code 1 when any is found. Fix them with: npx usa-codemod-13 --write [paths…]
  export --target css|wxss|arkts [--presets a,b] [--duration token] [--easing token] [--rpx] [--out file]
                             export presets + motion tokens for the web, mini programs (WXSS) or HarmonyOS (ArkTS) — docs/cross-platform.md
  compat <version> [--json]  what a project on <version> can use and what changed after it (from the manifest) — docs/version-compat.md
  migrate <files…> [--dry-run] [--write | --out file] [--diff] [--report] [--json] [--tokenize]
                             migrate motionary-timeline v1 / <usa-player> animation JSON / playground state to the
                             motionary-scene v2 DRAFT (14.0 format). Dry run by default; --write saves <name>.scene.json
                             next to each input (never overwrites it). Exit 1 when any file fails — docs/migrating-to-v14.md
  help                       this text

Deprecated subpaths (work until ${REMOVED_IN}, no runtime warning):
${Object.entries(DEPRECATED_PATHS).map(([a, b]) => `  motionary/${a}  →  motionary/${b}`).join('\n')}

Legacy event names (fire next to the usa:* names since 11.8, removed in ${EVENTS_REMOVED_IN}):
${Object.entries(LEGACY_EVENTS).map(([a, b]) => `  ${a}  →  ${b}`).join('\n')}
`;

const flag = (rest, name) => { const i = rest.indexOf('--' + name); return i >= 0 ? rest[i + 1] : undefined; };
/** `motionary export`: returns the exit code; writes to --out or stdout. */
export function runExport(rest, presets, tokens) {
  const target = flag(rest, 'target') || 'css';
  const list = flag(rest, 'presets');
  try {
    const code = exportMotion(target, presets, tokens, { presets: list ? list.split(',').map((s) => s.trim()).filter(Boolean) : undefined, duration: flag(rest, 'duration'), easing: flag(rest, 'easing'), rpx: rest.includes('--rpx') });
    const out = flag(rest, 'out');
    if (out) { writeFileSync(out, code); console.log(`motionary export: ${target} → ${out}`); } else process.stdout.write(code);
    return 0;
  } catch (e) {
    console.error(String(e.message || e) + `\n(targets: ${TARGETS.join(', ')})`);
    return 2;
  }
}
/** `motionary migrate` (13.9): returns the exit code. `S` = the scene-v2 module (dist/components/scene-v2.js). */
export function runMigrate(rest, S) {
  const outFile = flag(rest, 'out');
  const files = rest.filter((a, i) => !a.startsWith('--') && rest[i - 1] !== '--out');
  if (!files.length) { console.error('usage: motionary migrate <files…> [--dry-run] [--write | --out file] [--diff] [--report] [--json] [--tokenize]'); return 2; }
  if (outFile && files.length > 1) { console.error('motionary migrate: --out takes a single input (use --write for several)'); return 2; }
  const write = rest.includes('--write') || !!outFile;
  const dry = rest.includes('--dry-run') || !write;
  const json = rest.includes('--json');
  const results = [];
  let failed = 0;
  for (const f of files) {
    let text;
    try { text = readFileSync(f, 'utf8'); } catch (e) { failed++; results.push({ file: f, ok: false, problems: [{ path: '', message: `cannot read (${e.code || e.message})` }], report: { from: 'unknown', changes: [], lost: [], warnings: [], stats: {} } }); if (!json) console.error(`${f}: cannot read (${e.code || e.message})`); continue; }
    const r = S.migrateToSceneV2(text, { tokenize: rest.includes('--tokenize') });
    let input = null; try { input = JSON.parse(text); } catch {}
    const target = outFile || f.replace(/(\.json)?$/i, '.scene.json');
    if (!r.ok) failed++;
    else if (!dry) writeFileSync(target, S.serializeSceneV2(r.doc));
    const diff = r.ok && input ? S.diffJson(input, r.doc) : [];
    results.push({ file: f, out: r.ok && !dry ? target : undefined, ok: r.ok, report: r.report, problems: r.problems, diff: rest.includes('--diff') ? diff : undefined });
    if (json) continue;
    console.log(S.formatMigrationReport(r, f));
    if (rest.includes('--diff') && r.ok) {
      const show = (v) => { const t = JSON.stringify(v); return t && t.length > 80 ? t.slice(0, 77) + '…' : t; };
      for (const c of diff) console.log(`    ${c.op === 'add' ? '+' : c.op === 'remove' ? '-' : '~'} ${c.path}: ${c.op === 'add' ? show(c.to) : c.op === 'remove' ? show(c.from) : `${show(c.from)} → ${show(c.to)}`}`);
    }
    if (r.ok) console.log(dry ? '  (dry run — nothing written; --write to save ' + target + ')' : `  → ${target}`);
  }
  if (json) process.stdout.write(JSON.stringify(results, null, 2) + '\n');
  return failed ? 1 : 0;
}
const TOKENS = () => { try { return JSON.parse(readFileSync(new URL('../docs/motion.tokens.json', import.meta.url), 'utf8')); } catch { return JSON.parse(readFileSync(join(process.cwd(), 'docs/motion.tokens.json'), 'utf8')); } }; // non-file import.meta.url under jsdom

/** env.presets / env.tokens are for tests; the CLI loads PRESETS from the built package (dist/index.js). */
export function main(argv, env = {}) {
  const [cmd = 'help', ...rest] = argv;
  if (cmd === 'compat') {
    const v = rest.find((x) => !x.startsWith('--'));
    if (!v) { console.error('usage: motionary compat <version> [--json]'); return 2; }
    const m = env.manifest || JSON.parse(readFileSync(new URL('../dist/manifest.json', import.meta.url), 'utf8'));
    return import('./compat-history.mjs').then(({ compatAt }) => {
      const rows = m.components.map((c) => ({ tag: c.tag, ...compatAt(c, v) }));
      const missing = rows.filter((r) => !r.available), changed = rows.filter((r) => r.available && r.changedAfter.length);
      if (rest.includes('--json')) console.log(JSON.stringify({ version: v, catalog: m.version, missing, changed }, null, 2));
      else {
        console.log(`motionary ${m.version} catalog, checked for ${v}: ${rows.length - missing.length}/${rows.length} components available, ${changed.length} changed after ${v}`);
        if (missing.length) console.log('\nAdded later:\n' + missing.map((r) => `  <${r.tag}>  since ${r.since}`).join('\n'));
        if (changed.length) console.log('\nChanged after ' + v + ':\n' + changed.map((r) => `  <${r.tag}>  ${r.changedAfter.join(', ')}`).join('\n'));
      }
      return 0;
    });
  }
  if (cmd === 'migrate') {
    if (env.sceneV2) return runMigrate(rest, env.sceneV2);
    return runMigrate(rest, createRequire(import.meta.url)('../dist/components/scene-v2.cjs'));
  }
  if (cmd === 'export') {
    if (env.presets) return runExport(rest, env.presets, env.tokens || TOKENS());
    return import('../dist/index.js').then((m) => runExport(rest, m.PRESETS, env.tokens || TOKENS()));
  }
  if (cmd === 'doctor' || cmd === 'check') {
    const found = doctor(rest.filter((a) => !a.startsWith('--')));
    if (rest.includes('--json')) console.log(JSON.stringify({ deprecated: found }, null, 2));
    else if (!found.length) console.log('motionary doctor: no deprecated import paths or event names found ✓');
    else {
      for (const x of found) console.log(`${x.file}:${x.line}  ${x.from}  →  ${x.to}  (removed in ${x.removedIn})`);
      console.log(`\n${found.length} deprecated use(s). Rewrite them: npx usa-codemod-13 --write (see docs/upgrading-13.md)`);
    }
    return found.length ? 1 : 0;
  }
  console.log(HELP);
  return cmd === 'help' || cmd === '--help' || cmd === '-h' ? 0 : 2;
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) Promise.resolve(main(process.argv.slice(2))).then((c) => { process.exitCode = c; });
