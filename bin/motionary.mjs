#!/usr/bin/env node
// motionary — command line (11.5).
//   npx motionary doctor [paths…] [--json]   scan a project for deprecated import paths (exit 1 when found)
//   npx motionary export --target css|wxss|arkts   presets + motion tokens for other platforms (12.1)
//   npx motionary migrate <files…> [--write|--out f] [--diff] [--report] [--json] [--tokenize]   v1 motion JSON → scene v2 (13.9; official format since 14.0)
//   npx motionary migrate --code [paths…] [--write] [--json]   rewrite import moves + CDN majors in source files (14.0; @15 since 15.0)
//   npx motionary tokens import-figma|export-figma|validate|css …   Motion Tokens 2.0 ↔ DTCG / Figma Variables / CSS (14.1)
//   npx motionary codemod <11–13> [args…]   run an older usa-codemod-<n> (5–10 removed in 15.0: use npx motionary@v14-lts codemod <n>)
//   npx motionary doctor --v15 [paths…] [--json]   everything 15.0 removes: compat-v13 imports, codemod 5–10 scripts, legacy data (14.9)
//   npx motionary migrate --to 15 [paths…] [--write] [--report f] [--json]   move off it: .bak first, loss / manual report (14.9)
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
                             rewrite import moves in source files: motionary/components/scene-v2 → motionary/scene,
                             CDN motionary@10…14/ → motionary@15/ (removed APIs: use migrate --to 15).
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
  doctor --v15 [paths…] [--json]
                             list everything 15.0 removes: motionary/compat-v13 imports, codemod 5–10 scripts and legacy
                             (playground / unversioned) animation data. Exit 1 when any is found — docs/deprecations-v15.md
  migrate --to 15 [paths…] [--write] [--report file] [--json]
                             convert legacy animation data to Scene v2 in place and remove plain installCompatV13() uses,
                             each after a .bak copy (never overwrites a backup: .bak.1, .bak.2 …); lists manual work and
                             damaged Studio projects (never rewritten). Dry run by default — docs/migrating-to-v15.md
  codemod <11–13> [--write] [paths…]
                             run the usa-codemod-<n> upgrade tool (5–10 were removed in 15.0: npx motionary@v14-lts codemod <n>)
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
  // 15.0: normalizeAnimation is gone (no compat entry left to move it to) and the codemod 5–10 runner too —
  // `migrate --to 15` lists both as manual work.
  let code = source.replace(new RegExp(`(['"\`])${PKG}/components/scene-v2\\1`, 'g'), (m, q, pkg) => {
    changes.push(`${pkg}/components/scene-v2 → ${pkg}/scene`);
    return `${q}${pkg}/scene${q}`;
  });
  code = code.replace(/\b(motionary|use-scroll-animate)@(1[0-4])(?=\/)/g, (m, pkg, major) => {
    changes.push(`${pkg}@${major}/ → ${pkg}@15/ (CDN major)`);
    return `${pkg}@15`;
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
const CM = { 11: () => import('./usa-codemod-11.mjs'), 12: () => import('./usa-codemod-12.mjs'), 13: () => import('./usa-codemod-13.mjs') };
const CODEMODS = Object.keys(CM).map(Number);
/** `motionary codemod <n> [args…]`: runs bin/usa-codemod-<n>.mjs; returns the exit code. */
export async function runCodemod(rest) {
  const n = Number(rest[0]);
  const note = codemodNotice(n);
  if (note) { console.error(note); return 2; }
  if (!CODEMODS.includes(n)) { console.error(`usage: motionary codemod <${CODEMODS[0]}–${CODEMODS[CODEMODS.length - 1]}> [--write] [paths…]`); return 2; }
  const m = await CM[n]();
  m.run(rest.slice(1));
  return 0;
}

// --- 14.9: v15 preparation (docs/deprecations-v15.md) ---------------------------------------------
const V15_DOC = 'docs/deprecations-v15.md';
/** What 15.0 removes (same ids as DEPRECATIONS_V15 in motionary/compat-v13's notices) → how to fix it. */
export const V15_FIX = {
  'compat-v13-entry': 'motionary/compat-v13 is removed in 15.0 — drop the import (convert data with `npx motionary migrate --to 15`)',
  'install-compat-v13': 'installCompatV13() is removed in 15.0 — convert playground / unversioned animation JSON once with `npx motionary migrate --to 15` and remove the call',
  'normalize-animation': 'normalizeAnimation() is removed in 15.0 — use validateSceneV2() / migrateToSceneV2() from motionary/scene',
  'upgrade-legacy-animation': 'upgradeLegacyAnimation() is removed in 15.0 — use migrateToSceneV2() from motionary/scene',
  'old-codemods': '`motionary codemod <5–10>` is removed in 15.0 — run it with a 14.x CLI before upgrading, then drop the script',
};
const COMPAT_RE = /(['"`])(?:motionary|use-scroll-animate)\/(?:components\/)?compat-v13\1/;
const OLD_CODEMOD_RE = /(?:\bmotionary\s+codemod\s+(?:10|[5-9])|\busa-codemod-(?:10|[5-9]))(?![\d.])/;
const REPORT_NAME = 'motionary-migrate-report.json';
/** Error for `motionary codemod <5–10>` (removed in 15.0); '' for the codemods that stay (11–13). */
export function codemodNotice(n) {
  return n >= 5 && n <= 10 ? `motionary codemod ${n}: the 13.x upgrade tools (codemod 5–10) were removed in 15.0 — run it with a 14.x CLI: npx motionary@v14-lts codemod ${n} --write [paths…] (${V15_DOC}#old-codemods)` : '';
}
const isLegacyAnimation = (d) => !!d && typeof d === 'object' && !Array.isArray(d) && (d.format === 'use-scroll-animate/playground' || (d.format === undefined && d.version === undefined && Array.isArray(d.tracks)));
const compatId = (line) => (/\binstallCompatV13\b/.test(line) ? 'install-compat-v13' : /\bnormalizeAnimation\b/.test(line) ? 'normalize-animation' : /\bupgradeLegacyAnimation\b/.test(line) ? 'upgrade-legacy-animation' : 'compat-v13-entry');
function* v15Files(paths) {
  for (const root of paths.length ? paths : ['.']) if (existsSync(root)) for (const f of walk(root)) if (!f.endsWith(REPORT_NAME)) yield f;
}
function scanV15(f, text) {
  const out = [];
  const lines = text.split('\n');
  if (extname(f) === '.json') {
    let d; try { d = JSON.parse(text); } catch { d = undefined; }
    if (isLegacyAnimation(d)) out.push({ file: f, line: 1, kind: 'legacy-data', id: 'install-compat-v13', fix: 'convert to Scene v2: npx motionary migrate --to 15 --write', text: d.format || 'animation JSON without "format" / "version"' });
  } else lines.forEach((l, i) => { if (COMPAT_RE.test(l)) { const id = compatId(l); out.push({ file: f, line: i + 1, kind: 'compat-import', id, fix: V15_FIX[id], text: l.trim() }); } });
  lines.forEach((l, i) => { const m = l.match(OLD_CODEMOD_RE); if (m) out.push({ file: f, line: i + 1, kind: 'old-codemod', id: 'old-codemods', fix: V15_FIX['old-codemods'], text: m[0] }); });
  return out;
}
/** `doctor --v15` (14.9): every use of what 15.0 removes → [{ file, line, kind: 'compat-import' | 'old-codemod' | 'legacy-data', id, fix, text }]. */
export function doctorV15(paths) {
  const found = [];
  for (const f of v15Files(paths)) found.push(...scanV15(f, readFileSync(f, 'utf8')));
  return found;
}
/** Next free backup name: f.bak, then f.bak.1, f.bak.2 … (an existing backup is never overwritten). */
export function backupPath(f) {
  if (!existsSync(f + '.bak')) return f + '.bak';
  let n = 1; while (existsSync(`${f}.bak.${n}`)) n++;
  return `${f}.bak.${n}`;
}
const MANUAL_REASON = {
  'normalize-animation': 'normalizeAnimation() has no drop-in replacement: validate with validateSceneV2() or convert with migrateToSceneV2() from motionary/scene',
  'upgrade-legacy-animation': 'upgradeLegacyAnimation() has no drop-in replacement: convert with migrateToSceneV2() from motionary/scene (Scene v2 instead of animation JSON v1)',
  'compat-v13-entry': 'the motionary/compat-v13 import is used for something migrate cannot rewrite safely — remove it by hand',
  'install-compat-v13': 'installCompatV13() is used beyond a plain `installCompatV13();` statement (its uninstall is kept) — remove it by hand after converting the data',
  'old-codemods': 'the 13.x codemod runner is removed in 15.0: run this script with a 14.x CLI first, then delete it',
};
/** Remove `import { installCompatV13 } from '…/compat-v13'` and plain `installCompatV13();` statements; null when not mechanical. */
function stripInstallCompat(src) {
  const imp = new RegExp(String.raw`^[ \t]*import\s*\{\s*installCompatV13\s*\}\s*from\s*(['"])(?:motionary|use-scroll-animate)/(?:components/)?compat-v13\1;?[ \t]*\r?\n?`, 'm');
  if (!imp.test(src)) return null;
  const code = src.replace(imp, '').replace(/^[ \t]*installCompatV13\(\);?[ \t]*\r?\n?/gm, '');
  return /\binstallCompatV13\b|compat-v13/.test(code) ? null : code;
}
/**
 * `migrate --to 15` (14.9). Dry run unless `write`. Converts legacy animation data to Scene v2 in place (after a `.bak`),
 * removes mechanical installCompatV13 uses (after a `.bak`), lists manual work and damaged Studio projects (never rewritten).
 * Returns the report { format: 'motionary-migrate-report', version: 1, to: '15', write, files, manual, problems }.
 */
export function migrateTo15(paths, opts = {}) {
  const S = opts.sceneV2 || createRequire(import.meta.url)('../dist/components/scene-v2.cjs');
  let ST = opts.studio;
  const studio = () => (ST ||= createRequire(import.meta.url)('../dist/components/studio.cjs'));
  const write = !!opts.write;
  const files = [], manual = [], problems = [];
  const save = (f, text, old) => { const b = backupPath(f); writeFileSync(b, old); writeFileSync(f, text); return b; };
  for (const f of v15Files(paths)) {
    const text = readFileSync(f, 'utf8');
    if (extname(f) === '.json') {
      let d, bad;
      try { d = JSON.parse(text); } catch (e) { bad = e; }
      const isProject = /\.motionary\.json$/i.test(f) || (d && d.format === 'motionary-studio');
      if (isProject) {
        try { if (bad) throw new Error(`invalid JSON (${bad.message})`); studio().parseStudioProject(d); } catch (e) { problems.push({ file: f, kind: 'studio-project', message: String(e.message || e) + ' — left untouched; restore it from a backup or the last saved pack' }); }
        continue;
      }
      if (isLegacyAnimation(d)) {
        const r = S.migrateToSceneV2(text);
        if (!r.ok) { problems.push({ file: f, kind: 'legacy-data', message: (r.problems || []).map((p) => `${p.path || '(root)'}: ${p.message}`).join('; ') || 'migration failed' }); continue; }
        const e = { file: f, kind: 'legacy-data', id: 'install-compat-v13', changed: true, changes: r.report.changes, losses: r.report.lost, warnings: r.report.warnings, from: r.report.from };
        if (write) e.backup = save(f, S.serializeSceneV2(r.doc), text);
        files.push(e);
        continue;
      }
    }
    const hits = scanV15(f, text);
    if (!hits.length) continue;
    const e = { file: f, kind: hits[0].kind, id: hits[0].id, changed: false, changes: [] };
    const compat = hits.filter((h) => h.kind === 'compat-import');
    if (compat.length) {
      const only = compat.every((h) => h.id === 'install-compat-v13');
      const code = only ? stripInstallCompat(text) : null;
      if (code !== null) { e.changed = true; e.changes.push('removed installCompatV13 (import + call): convert the data it served with migrate --to 15'); if (write) e.backup = save(f, code, text); }
      else for (const h of compat) manual.push({ file: f, line: h.line, id: h.id, reason: MANUAL_REASON[h.id] });
    }
    for (const h of hits.filter((x) => x.kind === 'old-codemod')) manual.push({ file: f, line: h.line, id: h.id, reason: `${h.text}: ${MANUAL_REASON['old-codemods']}` });
    files.push(e);
  }
  const report = { format: 'motionary-migrate-report', version: 1, to: '15', write, files, manual, problems };
  if (opts.report) writeFileSync(opts.report, JSON.stringify(report, null, 2) + '\n');
  return report;
}
/** `motionary migrate --to 15 [paths…] [--write] [--report file] [--json]`: exit 1 when a file could not be migrated or read. */
export function runMigrateTo15(rest, env = {}) {
  const to = flag(rest, 'to');
  if (to !== '15') { console.error('usage: motionary migrate --to 15 [paths…] [--write] [--report file] [--json]'); return 2; }
  const VAL = new Set(['--to', '--report']);
  const paths = rest.filter((a, i) => !a.startsWith('--') && !VAL.has(rest[i - 1]));
  for (const p of paths) if (!existsSync(p)) { console.error(`motionary migrate --to 15: ${p} not found`); return 2; }
  const write = rest.includes('--write');
  const r = migrateTo15(paths, { write, sceneV2: env.sceneV2, studio: env.studio, report: flag(rest, 'report') || (write ? join(paths[0] || '.', REPORT_NAME) : undefined) });
  if (rest.includes('--json')) console.log(JSON.stringify(r, null, 2));
  else {
    for (const x of r.files) console.log(`${x.file}  ${x.kind}${x.changed ? (write ? `  converted (backup ${x.backup})` : '  will change') : ''}${x.losses && x.losses.length ? `  losses: ${x.losses.length}` : ''}`);
    for (const m of r.manual) console.log(`${m.file}:${m.line}  manual  ${m.reason}`);
    for (const p of r.problems) console.log(`${p.file}  problem  ${p.message}`);
    console.log(`\nmotionary migrate --to 15: ${r.files.filter((x) => x.changed).length} file(s) ${write ? 'migrated' : 'to migrate (dry run — add --write; backups are written first)'}, ${r.manual.length} manual item(s), ${r.problems.length} problem(s). See ${V15_DOC}.`);
  }
  return r.problems.length ? 1 : 0;
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
  if (cmd === 'migrate' && rest.includes('--to')) return runMigrateTo15(rest, env);
  if (cmd === 'migrate' && rest.includes('--code')) return runMigrateCode(rest.filter((a) => a !== '--code'));
  if (cmd === 'migrate') {
    if (env.sceneV2) return runMigrate(rest, env.sceneV2);
    return runMigrate(rest, createRequire(import.meta.url)('../dist/components/scene-v2.cjs'));
  }
  if (cmd === 'export') {
    if (env.presets) return runExport(rest, env.presets, env.tokens || TOKENS());
    return import('../dist/index.js').then((m) => runExport(rest, m.PRESETS, env.tokens || TOKENS()));
  }
  if ((cmd === 'doctor' || cmd === 'check') && rest.includes('--v15')) {
    const found = doctorV15(rest.filter((a) => !a.startsWith('--')));
    if (rest.includes('--json')) console.log(JSON.stringify({ v15: found }, null, 2));
    else if (!found.length) console.log('motionary doctor --v15: nothing that 15.0 removes was found ✓');
    else {
      for (const x of found) console.log(`${x.file}:${x.line}  ${x.kind}  ${x.text}\n    → ${x.fix}`);
      console.log(`\n${found.length} use(s) of what 15.0 removes (${V15_DOC}). Fix: npx motionary migrate --to 15 (dry run) then --write`);
    }
    return found.length ? 1 : 0;
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
