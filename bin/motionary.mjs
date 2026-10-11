#!/usr/bin/env node
// motionary — command line (11.5).
//   npx motionary doctor [paths…] [--json]   scan a project for deprecated import paths (exit 1 when found)
//   npx motionary export --target css|wxss|arkts   presets + motion tokens for other platforms (12.1)
//   npx motionary migrate <files…> [--write|--out f] [--diff] [--report] [--json] [--tokenize]   v1 motion JSON → scene v2 (13.9; official format since 14.0)
//   npx motionary migrate --code [paths…] [--write] [--json]   rewrite the 14.0 import moves in source files (14.0)
//   npx motionary tokens import-figma|export-figma|validate|css …   Motion Tokens 2.0 ↔ DTCG / Figma Variables / CSS (14.1)
//   npx motionary codemod <5–13> [args…]   run an older usa-codemod-<n> (5–10 left the package bin in 14.0)
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
                             motionary-scene v2 (the 14.0 format). Dry run by default; --write saves <name>.scene.json
                             next to each input (never overwrites it). Exit 1 when any file fails — docs/migrating-to-v14.md
  migrate --code [paths…] [--write] [--json]
                             rewrite the 14.0 import moves in source files: normalizeAnimation → motionary/compat-v13,
                             motionary/components/scene-v2 → motionary/scene, usa-codemod-5…10 scripts → motionary codemod <n>,
                             CDN motionary@10…13/ → motionary@14/.
                             Dry run by default (default path: current directory)
  tokens import-figma <file> [--out file] [--css] [--collection name]
                             Figma Variables JSON (GET /v1/files/:key/variables/local response or a POST body) →
                             Motion Tokens 2.0 as W3C Design Tokens (DTCG) JSON, or CSS with --css — docs/motion-tokens.md
  tokens export-figma [tokens.json] [--out file] [--collection name] [--modes reduced,compact]
                             DTCG tokens (default: the built-in set) → a Figma Variables POST /v1/files/:key/variables body
                             (no network calls: send it with your own Figma token)
  tokens validate <file>     check a DTCG or Figma Variables tokens file. Exit 1 when it has problems
  tokens css [tokens.json] [--out file]
                             CSS custom properties, with reduced-motion and mode blocks
  codemod <5–13> [--write] [paths…]
                             run the usa-codemod-<n> upgrade tool (5–10 are 13.x compat tools, no longer package bins)
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
// --- 14.0: migrate --code + codemod -------------------------------------------------------------
const PKG = '(motionary|use-scroll-animate)';
/** Rewrite the 14.0 import moves in one source text. Returns { code, changes }. Idempotent. */
export function migrateCode(source) {
  const changes = [];
  let code = source.replace(new RegExp(`import\\s*\\{([^}]*)\\}\\s*from\\s*(['"])${PKG}/components/effects\\2;?`, 'g'), (m, names, q, pkg) => {
    const list = names.split(',').map((x) => x.trim()).filter(Boolean);
    const moved = list.filter((x) => /^normalizeAnimation(\s+as\s+\w+)?$/.test(x));
    if (!moved.length) return m;
    changes.push(`normalizeAnimation → ${pkg}/compat-v13`);
    const rest = list.filter((x) => !moved.includes(x));
    const compat = `import { ${moved.join(', ')} } from ${q}${pkg}/compat-v13${q};`;
    return rest.length ? `import { ${rest.join(', ')} } from ${q}${pkg}/components/effects${q};\n${compat}` : compat;
  });
  code = code.replace(new RegExp(`(['"\`])${PKG}/components/scene-v2\\1`, 'g'), (m, q, pkg) => {
    changes.push(`${pkg}/components/scene-v2 → ${pkg}/scene`);
    return `${q}${pkg}/scene${q}`;
  });
  code = code.replace(/(npx\s+)?usa-codemod-(5|6|7|8|9|10)\b/g, (m, npx, n) => {
    changes.push(`usa-codemod-${n} → motionary codemod ${n}`);
    return `${npx || ''}motionary codemod ${n}`;
  });
  code = code.replace(/\b(motionary|use-scroll-animate)@(1[0-3])(?=\/)/g, (m, pkg, major) => {
    changes.push(`${pkg}@${major}/ → ${pkg}@14/ (CDN major)`);
    return `${pkg}@14`;
  });
  return { code, changes };
}
/** `motionary migrate --code`: returns the exit code. */
export function runMigrateCode(rest) {
  const write = rest.includes('--write');
  const out = [];
  for (const root of rest.filter((a) => !a.startsWith('--')).concat(rest.some((a) => !a.startsWith('--')) ? [] : ['.'])) {
    if (!existsSync(root)) { console.error(`motionary migrate --code: ${root} not found`); return 2; }
    for (const f of walk(root)) {
      const src = readFileSync(f, 'utf8');
      const { code, changes } = migrateCode(src);
      if (!changes.length) continue;
      out.push({ file: f, changes });
      if (write) writeFileSync(f, code);
    }
  }
  if (rest.includes('--json')) console.log(JSON.stringify({ write, files: out }, null, 2));
  else {
    for (const r of out) console.log(`${r.file}\n${r.changes.map((c) => `  - ${c}`).join('\n')}`);
    console.log(`\nmotionary migrate --code: ${out.reduce((n, r) => n + r.changes.length, 0)} change(s) in ${out.length} file(s)${write ? ' written' : ' (dry run — add --write to apply)'}.`);
  }
  return 0;
}
// static specifiers (bundlers / vite cannot analyse a template import next to a shebang)
const CM = { 5: () => import('./usa-codemod-5.mjs'), 6: () => import('./usa-codemod-6.mjs'), 7: () => import('./usa-codemod-7.mjs'), 8: () => import('./usa-codemod-8.mjs'), 9: () => import('./usa-codemod-9.mjs'), 10: () => import('./usa-codemod-10.mjs'), 11: () => import('./usa-codemod-11.mjs'), 12: () => import('./usa-codemod-12.mjs'), 13: () => import('./usa-codemod-13.mjs') };
const CODEMODS = Object.keys(CM).map(Number);
/** `motionary codemod <n> [args…]`: runs bin/usa-codemod-<n>.mjs; returns the exit code. */
export async function runCodemod(rest) {
  const n = Number(rest[0]);
  if (!CODEMODS.includes(n)) { console.error(`usage: motionary codemod <${CODEMODS[0]}–${CODEMODS[CODEMODS.length - 1]}> [--write] [paths…]`); return 2; }
  const m = await CM[n]();
  m.run(rest.slice(1));
  return 0;
}

/** `motionary tokens …` (14.1): `T` = the motion-tokens module (dist/components/motion-tokens.cjs). Returns the exit code. */
export function runTokens(rest, T) {
  const USAGE = 'usage: motionary tokens <import-figma <file> | export-figma [tokens.json] | validate <file> | css [tokens.json]> [--out file] [--css] [--collection name] [--modes a,b]';
  const [sub, ...args] = rest;
  const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
  const VAL = new Set(['--out', '--collection', '--modes']);
  const files = args.filter((a, i) => !a.startsWith('--') && !VAL.has(args[i - 1]));
  const load = (f) => {
    try { return JSON.parse(readFileSync(f, 'utf8')); } catch (e) { console.error(`motionary tokens: cannot read ${f}: ${e.code === 'ENOENT' ? 'no such file' : e.message}`); return undefined; }
  };
  const isFigma = (j) => !!(j && ((j.meta && j.meta.variables) || Array.isArray(j.variables)));
  const emit = (text) => {
    const out = opt('--out');
    if (out) { writeFileSync(out, text.endsWith('\n') ? text : text + '\n'); console.error(`motionary tokens: wrote ${out}`); }
    else process.stdout.write(text.endsWith('\n') ? text : text + '\n');
    return 0;
  };
  const fromFile = (j) => (isFigma(j) ? T.motionTokensFromFigma(j, { collection: opt('--collection') }) : T.motionTokenSetFromDTCG(j));
  try {
    if (sub === 'import-figma' || sub === 'export-figma' || sub === 'css' || sub === 'validate') {
      const needFile = sub === 'import-figma' || sub === 'validate';
      if (needFile && !files[0]) { console.error(USAGE); return 2; }
      const json = files[0] ? load(files[0]) : undefined;
      if (files[0] && json === undefined) return 2;
      if (sub === 'validate') {
        let problems = [];
        if (!isFigma(json)) problems = T.validateDesignTokens(json);
        if (!problems.length) { try { problems = T.validateMotionTokens(fromFile(json)); } catch (e) { problems = [String(e.message).replace('[motionary] tokens: ', '')]; } }
        if (!problems.length) { console.log(`motionary tokens: ${files[0]} ✓ valid (${isFigma(json) ? 'Figma Variables' : 'DTCG'})`); return 0; }
        for (const p of problems) console.error(`  ${p}`);
        console.error(`${problems.length} problem(s) in ${files[0]}`);
        return 1;
      }
      if (sub === 'import-figma') {
        if (!isFigma(json)) { console.error(`motionary tokens: ${files[0]} is not Figma Variables JSON (meta.variables or a POST body)`); return 2; }
        const set = T.motionTokensFromFigma(json, { collection: opt('--collection') });
        for (const p of T.validateMotionTokens(set)) console.error(`  warning: ${p}`);
        return emit(args.includes('--css') ? T.motionTokenSetToCss(set) : JSON.stringify(T.motionTokenSetToDTCG(set), null, 2));
      }
      const set = json === undefined ? T.MOTION_TOKENS_2 : fromFile(json);
      if (sub === 'css') return emit(T.motionTokenSetToCss(set));
      const modes = opt('--modes');
      return emit(JSON.stringify(T.motionTokensToFigma(set, { collection: opt('--collection'), modes: modes ? modes.split(',').map((m) => m.trim()).filter(Boolean) : undefined }), null, 2));
    }
  } catch (e) {
    console.error(`motionary tokens: ${String(e.message).replace('[motionary] tokens: ', '')}`);
    return 1;
  }
  console.error(USAGE);
  return 2;
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
  if (cmd === 'codemod') return runCodemod(rest);
  if (cmd === 'tokens') return runTokens(rest, env.motionTokens || createRequire(import.meta.url)('../dist/components/motion-tokens.cjs'));
  if (cmd === 'migrate' && rest.includes('--code')) return runMigrateCode(rest.filter((a) => a !== '--code'));
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
