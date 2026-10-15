#!/usr/bin/env node
// motionary — command line (11.5).
//   npx motionary doctor [paths…] [--json]   scan a project for deprecated import paths (exit 1 when found)
//   npx motionary export --target css|wxss|arkts   presets + motion tokens for other platforms (12.1)
//   npx motionary export --scene f.json --target css|wxss|arkts|compose|swiftui [--out f] [--report f] [--strict]   a scene → native code + loss report (15.2)
//   npx motionary migrate <files…> [--write|--out f] [--diff] [--report] [--json] [--tokenize]   v1 motion JSON → scene v2 (13.9; official format since 14.0)
//   npx motionary migrate --code [paths…] [--write] [--json]   rewrite import moves + CDN majors in source files (14.0; @16 since 16.0, + check_compat tool name)
//   npx motionary tokens import-figma|export-figma|validate|css …   Motion Tokens 2.0 ↔ DTCG / Figma Variables / CSS (14.1)
//   npx motionary codemod <11–13> [args…]   run an older usa-codemod-<n> (5–10 removed in 15.0: use npx motionary@v14-lts codemod <n>)
//   (doctor --v15 / migrate --to 15 were removed in 17.0: npx motionary@v16-lts …)
//   npx motionary doctor --v16 [paths…] [--json]   everything 16.0 changes: Scene v2 data, variants in meta, exportScene() without a version, MCP 2.x shapes (15.9)
//   npx motionary migrate --to 16 [paths…] [--dry-run] [--report f] [--json]   Scene v3 preview with a per-file loss report; --write waits for 16.0 (15.9)
//   npx motionary help
// Old subpaths still work (removed in 13.0) and never warn at runtime; `doctor` is how a project finds them.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
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
  export --scene scene.json --target css|wxss|arkts|compose|swiftui [--out file] [--report report.json] [--strict] [--rpx] [--package p]
                             a Scene v2 / timeline document → CSS, WXSS, ArkTS, Jetpack Compose or SwiftUI with a per-property
                             loss report (lost properties are listed on stderr; --strict exits 1 when anything is lost) — docs/studio-native.md
                             export presets + motion tokens for the web, mini programs (WXSS) or HarmonyOS (ArkTS) — docs/cross-platform.md
  compat <version> [--json]  what a project on <version> can use and what changed after it (from the manifest) — docs/version-compat.md
  migrate <files…> [--dry-run] [--write | --out file] [--diff] [--report] [--json] [--tokenize] [--to-v2]
                             migrate motionary-timeline v1 / <usa-player> animation JSON / playground state to the
                             motionary-scene format: Scene v3 since 16.0 (--to-v2: Scene v2 for 15.x consumers). Dry run by default; --write saves <name>.scene.json
                             next to each input (never overwrites it). Exit 1 when any file fails — docs/migrating-to-v14.md
  migrate --code [paths…] [--write] [--json]
                             rewrite import moves in source files: motionary/components/scene-v2 → motionary/scene,
                             CDN motionary@10…15/ → motionary@16/, MCP tool name check_compat → check_compatibility (16.0).
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
  doctor --v15 / migrate --to 15
                             removed in 17.0 — run them with the 16.x CLI: npx motionary@v16-lts doctor --v15
  doctor --v16 [paths…] [--json]
                             list everything 16.0 changes: Scene v2 files (16.0 writes v3), meta["motionary:variants"],
                             studio.exportScene() without { version: 2 }, MCP 2.x shapes (check_compat, validate_snippet
                             { scene }). Exit 1 when any is found — docs/deprecations-v16.md
  doctor --v17 [paths…] [--json]
                             16.9: everything 17.0 removes (motionary/scene/v3-preview imports, doctor --v15 /
                             migrate --to 15 in scripts). Exit 1 when any is found — docs/deprecations-v17.md
  migrate --to 17 [paths…] [--write] [--report file] [--json]
                             16.9: rewrite motionary/scene/v3-preview → motionary/scene/v3 (.bak first)
  migrate --to 16 [paths…] [--dry-run] [--report file] [--json]
                             preview Scene v2 → v3 per file (lossless? what changes, what is lost) and list manual work.
                             15.x only previews (a v3 file does not open in 15.x); 16.0 adds --write with .bak copies
                             — docs/migrating-to-v16.md
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
/** `motionary export --scene` (15.2): `N` = the studio-native module. 0 ok, 1 lost properties under --strict, 2 bad input / target. */
export function runExportScene(rest, N) {
  const target = flag(rest, 'target') || 'css';
  try {
    const doc = JSON.parse(readFileSync(flag(rest, 'scene'), 'utf8'));
    const pkg = flag(rest, 'package');
    const { code, file, report } = N.exportNative(doc, { target, rpx: rest.includes('--rpx'), ...(pkg ? { package: pkg } : {}) });
    const out = flag(rest, 'out'), rep = flag(rest, 'report');
    if (out) { writeFileSync(out, code); console.log(`motionary export: ${target} → ${out} (suggested name ${file})`); } else process.stdout.write(code);
    if (rep) writeFileSync(rep, JSON.stringify(report, null, 2) + '\n');
    for (const l of report.lost) console.error(`lost (${target}): layer "${l.layer}" ${l.prop} — ${l.reason}`);
    for (const n of report.notes) console.error(`note: ${n}`);
    return report.lost.length && rest.includes('--strict') ? 1 : 0;
  } catch (e) {
    console.error(String(e.message || e) + `\n(scene targets: ${N.NATIVE_TARGETS.join(', ')})`);
    return 2;
  }
}
/** `motionary migrate` (13.9): returns the exit code. `S` = the scene-v2 module (dist/components/scene-v2.js). */
export function runMigrate(rest, S, V3) {
  const outFile = flag(rest, 'out');
  const files = rest.filter((a, i) => !a.startsWith('--') && rest[i - 1] !== '--out');
  if (!files.length) { console.error('usage: motionary migrate <files…> [--dry-run] [--write | --out file] [--diff] [--report] [--json] [--tokenize] [--to-v2]'); return 2; }
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
    else if (!dry) {
      // 16.0: Scene v3 is the write format (`--to-v2` keeps writing v2 for 15.x consumers)
      const v3 = !rest.includes('--to-v2') && (V3 ||= createRequire(import.meta.url)('../dist/components/scene-v3.cjs'));
      writeFileSync(target, v3 ? v3.serializeSceneV3(v3.migrateToSceneV3(r.doc).doc) : S.serializeSceneV2(r.doc));
    }
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
  code = code.replace(/\b(motionary|use-scroll-animate)@(1[0-5])(?=\/)/g, (m, pkg, major) => {
    changes.push(`${pkg}@${major}/ → ${pkg}@16/ (CDN major)`);
    return `${pkg}@16`;
  });
  // 16.0: motionary-mcp 3.0 removed the check_compat tool — rewrite the quoted tool name (validate_snippet { scene } is
  // listed by `migrate --to 16` as manual work: the argument shape needs a person)
  code = code.replace(/(['"`])check_compat\1/g, (m, q) => {
    changes.push('check_compat → check_compatibility (motionary-mcp 3.0 tool name)');
    return `${q}check_compatibility${q}`;
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

// --- 14.9: v15 preparation (docs/deprecations-v15.md); the v15 project migration itself was removed in 17.0 (v16-lts keeps it) ---
const V15_DOC = 'docs/deprecations-v15.md';
const REPORT_NAME = 'motionary-migrate-report.json';
/** Error for `motionary codemod <5–10>` (removed in 15.0); '' for the codemods that stay (11–13). */
export function codemodNotice(n) {
  return n >= 5 && n <= 10 ? `motionary codemod ${n}: the 13.x upgrade tools (codemod 5–10) were removed in 15.0 — run it with a 14.x CLI: npx motionary@v14-lts codemod ${n} --write [paths…] (${V15_DOC}#old-codemods)` : '';
}
function* v15Files(paths) {
  for (const root of paths.length ? paths : ['.']) if (existsSync(root)) for (const f of walk(root)) if (!f.endsWith(REPORT_NAME)) yield f;
}
/** Next free backup name: f.bak, then f.bak.1, f.bak.2 … (an existing backup is never overwritten). */
export function backupPath(f) {
  if (!existsSync(f + '.bak')) return f + '.bak';
  let n = 1; while (existsSync(`${f}.bak.${n}`)) n++;
  return `${f}.bak.${n}`;
}
// ---------------------------------------------------------------- 15.9: v16 preparation
const V16_DOC = 'docs/deprecations-v16.md';
/** What 16.0 changes (same ids as DEPRECATIONS_V16 in motionary/scene/v3) → how to fix it. */
export const V16_FIX = {
  'scene-v2-write': '16.0 writes Scene v3 (v2 is still read): convert files with `npx motionary migrate --to 16`; code that needs v2 calls studio.exportScene({ version: 2 })',
  'variants-meta': 'Scene v3 keeps breakpoint variants in "variants": `npx motionary migrate --to 16` moves them; code uses variantsOf() from motionary/studio/a11y',
  'mcp-snippet-scene': 'motionary-mcp 3.0: validate_snippet takes code only — call validate_scene { scene } (motionary-mcp 2.5+)',
  'mcp-scene-text': 'motionary-mcp 3.0: pass scene arguments as objects, not JSON text',
  'mcp-check-compat': 'motionary-mcp 3.0 removes check_compat — call check_compatibility { tags, version }',
};
const isStudioProjectFile = (f, d) => /\.motionary\.json$/i.test(f) || !!(d && d.format === 'motionary-studio');
const isSceneV2Data = (d) => !!d && typeof d === 'object' && !Array.isArray(d) && d.format === 'motionary-scene' && d.version === 2;
const hasVariantsMeta = (d) => !!(d && d.meta && typeof d.meta === 'object' && !Array.isArray(d.meta) && Object.prototype.hasOwnProperty.call(d.meta, 'motionary:variants'));
const V16_CODE = [
  ['scene-v2-write', /\.exportScene\(\s*\)/],
  ['variants-meta', /motionary:variants/],
  ['mcp-check-compat', /(['"`])check_compat\1/],
  ['mcp-snippet-scene', /(['"`])validate_snippet\1.*\bscene\b/],
];
function scanV16(f, text) {
  const out = [], lines = text.split('\n');
  const hit = (id, line, t) => out.push({ file: f, line, kind: extname(f) === '.json' ? 'scene-data' : 'code', id, fix: V16_FIX[id], text: t });
  if (extname(f) === '.json') {
    let d; try { d = JSON.parse(text); } catch { return out; }
    if (isStudioProjectFile(f, d) || !isSceneV2Data(d)) return out;
    hit('scene-v2-write', 1, 'motionary-scene version 2');
    if (hasVariantsMeta(d)) hit('variants-meta', Math.max(1, lines.findIndex((l) => l.includes('motionary:variants')) + 1), 'meta["motionary:variants"]');
    return out;
  }
  lines.forEach((l, i) => { for (const [id, re] of V16_CODE) if (re.test(l)) hit(id, i + 1, l.trim()); });
  return out;
}
/** `doctor --v16` (15.9): every use of what 16.0 changes → [{ file, line, kind: 'scene-data' | 'code', id, fix, text }]. */
export function doctorV16(paths) {
  const found = [];
  for (const f of v15Files(paths)) found.push(...scanV16(f, readFileSync(f, 'utf8')));
  return found;
}
/**
 * `migrate --to 16` (15.9). A dry run unless `write` — and the CLI refuses `write` on 15.x, because a Scene v3 file
 * does not open in 15.x; `write` is the 16.0 code path (Scene v2 data → v3 after a `.bak`, never overwriting a backup).
 * Studio projects are never rewritten (16.0 Studio upgrades them on open). Code findings are manual work.
 * Returns { format: 'motionary-migrate-report', version: 1, to: '16', write, files, manual, skipped, problems }.
 */
export function migrateTo16(paths, opts = {}) {
  const V3 = opts.sceneV3 || createRequire(import.meta.url)('../dist/components/scene-v3.cjs');
  const write = !!opts.write;
  const files = [], manual = [], skipped = [], problems = [];
  for (const f of v15Files(paths)) {
    const text = readFileSync(f, 'utf8');
    if (extname(f) === '.json') {
      let d; try { d = JSON.parse(text); } catch { continue; }
      if (isStudioProjectFile(f, d)) { skipped.push({ file: f, reason: 'Studio project — never rewritten here; the 16.0 Studio upgrades it on open (a .bak is kept)' }); continue; }
      if (!isSceneV2Data(d)) continue;
      const r = V3.migrateToSceneV3(text);
      if (!r.ok) { problems.push({ file: f, kind: 'scene-data', message: (r.problems || []).map((p) => `${p.path || '(root)'}: ${p.message}`).join('; ') || 'migration failed' }); continue; }
      const e = { file: f, kind: 'scene-data', id: 'scene-v2-write', changed: true, lossless: r.report.lossless, changes: r.report.changes, losses: r.report.lost, warnings: r.report.warnings };
      if (write) { const b = backupPath(f); writeFileSync(b, text); writeFileSync(f, V3.serializeSceneV3(r.doc)); e.backup = b; }
      files.push(e);
      continue;
    }
    for (const h of scanV16(f, text)) manual.push({ file: f, line: h.line, id: h.id, reason: h.fix });
  }
  const report = { format: 'motionary-migrate-report', version: 1, to: '16', write, files, manual, skipped, problems };
  if (opts.report) writeFileSync(opts.report, JSON.stringify(report, null, 2) + '\n');
  return report;
}
const ownMajor = () => { try { return Number(JSON.parse(readFileSync(join(fileURLToPath(import.meta.url), '../../package.json'), 'utf8')).version.split('.')[0]); } catch { return 0; } };
/** `motionary migrate --to 16 [paths…] [--dry-run] [--report file] [--json]`: exit 1 when a file could not be read / migrated; 2 for usage (and --write before 16.0). */
export function runMigrateTo16(rest, env = {}) {
  const VAL = new Set(['--to', '--report']);
  const paths = rest.filter((a, i) => !a.startsWith('--') && !VAL.has(rest[i - 1]));
  for (const p of paths) if (!existsSync(p)) { console.error(`motionary migrate --to 16: ${p} not found`); return 2; }
  const major = env.major ?? ownMajor();
  const write = rest.includes('--write');
  if (write && major < 16 && !env.allowWrite) { console.error(`motionary migrate --to 16 --write: motionary ${major}.x cannot open Scene v3 files, so writing them waits for 16.0 (npx motionary@16 migrate --to 16 --write). Run without --write (or with --dry-run) for the report — ${V16_DOC}`); return 2; }
  const r = migrateTo16(paths, { write, sceneV3: env.sceneV3, report: flag(rest, 'report') || (write ? join(paths[0] || '.', REPORT_NAME) : undefined) });
  if (rest.includes('--json')) console.log(JSON.stringify(r, null, 2));
  else {
    for (const x of r.files) console.log(`${x.file}  Scene v2 → v3${write ? `  converted (backup ${x.backup})` : '  will change'}  ${x.lossless ? 'lossless' : `losses: ${x.losses.length}`}`);
    for (const m of r.manual) console.log(`${m.file}:${m.line}  manual  ${m.reason}`);
    for (const s of r.skipped) console.log(`${s.file}  skipped  ${s.reason}`);
    for (const p of r.problems) console.log(`${p.file}  problem  ${p.message}`);
    console.log(`\nmotionary migrate --to 16: ${r.files.length} scene file(s) ${write ? 'migrated' : 'to migrate in 16.0 (dry run)'}, ${r.files.filter((x) => !x.lossless).length} with losses, ${r.manual.length} manual item(s), ${r.problems.length} problem(s). See ${V16_DOC}.`);
  }
  return r.problems.length ? 1 : 0;
}

// ---------------------------------------------------------------- 16.9: v17 preparation
const V17_DOC = 'docs/deprecations-v17.md';
const dep17 = (id, what, fix) => ({ id, removedIn: '17.0', what, fix, doc: `${V17_DOC}#${id}` });
/** What 17.0 removes (announced in 16.9). */
export const DEPRECATIONS_V17 = [
  dep17('scene-v3-preview', "the 15.9 preview import path motionary/scene/v3-preview (+ motionary/components/scene-v3-preview)", "import from 'motionary/scene/v3' (or 'motionary/components/scene-v3') — same API; npx motionary migrate --to 17 --write rewrites the imports"),
  dep17('cli-migrate-15', 'the 13.x / 14.x → 15 project migration commands `motionary doctor --v15` and `motionary migrate --to 15`', 'run them with the 16.x CLI before upgrading: npx motionary@v16-lts migrate --to 15 --write (v16-lts keeps them)'),
];
const FIX17 = Object.fromEntries(DEPRECATIONS_V17.map((d) => [d.id, d.fix]));
const ALIAS17_RE = /(['"`])motionary\/(scene\/v3|components\/scene-v3)-preview\1/g;
const CLI15_RE = /\bmotionary(?:@[\w.-]+)?\s+(?:doctor\s+--v15|migrate\s+--to\s+15)\b/;
/** Notice printed (stderr) by the commands 17.0 removes. */
export const notice17 = (cmd) => `motionary ${cmd}: removed in 17.0 — run it with the 16.x CLI (npx motionary@v16-lts ${cmd}) before upgrading (${V17_DOC}#cli-migrate-15)`;
/** 17.0: the v15 project migration commands are gone — the error they print (exit 2). */
export const removed17 = (cmd) => `motionary ${cmd}: removed in 17.0 — run it with the 16.x CLI: npx motionary@v16-lts ${cmd} (${V17_DOC}#cli-migrate-15)`;
function scanV17(f, text) {
  const out = [];
  text.split('\n').forEach((l, i) => {
    if (new RegExp(ALIAS17_RE.source).test(l)) out.push({ file: f, line: i + 1, id: 'scene-v3-preview', fix: FIX17['scene-v3-preview'], text: l.trim() });
    else if (CLI15_RE.test(l)) out.push({ file: f, line: i + 1, id: 'cli-migrate-15', fix: FIX17['cli-migrate-15'], text: l.trim() });
  });
  return out;
}
/** `doctor --v17` (16.9): every use of what 17.0 removes → [{ file, line, id, fix, text }], grouped by id (DEPRECATIONS_V17 order), then file / line. */
export function doctorV17(paths) {
  const found = [];
  for (const f of v15Files(paths)) if (!/\.bak(\.\d+)?$/.test(f)) found.push(...scanV17(f, readFileSync(f, 'utf8')));
  const ord = (x) => DEPRECATIONS_V17.findIndex((d) => d.id === x.id);
  return found.sort((a, b) => ord(a) - ord(b) || (a.file < b.file ? -1 : a.file > b.file ? 1 : a.line - b.line)); // grouped by removal
}
/**
 * `migrate --to 17` (16.9): rewrites motionary/scene/v3-preview → motionary/scene/v3 (and the components/ form) in code;
 * a dry run unless `write` (`.bak` first, never overwriting a backup). The v15 commands are listed as manual work.
 * Returns { format: 'motionary-migrate-report', version: 1, to: '17', write, files, manual, problems }.
 */
export function migrateTo17(paths, opts = {}) {
  const write = !!opts.write;
  const files = [], manual = [], problems = [];
  for (const f of v15Files(paths)) {
    if (/\.bak(\.\d+)?$/.test(f)) continue;
    const text = readFileSync(f, 'utf8');
    const hits = scanV17(f, text);
    if (!hits.length) continue;
    let n = 0;
    const next = text.replace(ALIAS17_RE, (_m, q, p) => (n++, `${q}motionary/${p}${q}`));
    if (n) {
      const e = { file: f, id: 'scene-v3-preview', changed: true, rewrites: n };
      if (write) { const b = backupPath(f); writeFileSync(b, text); writeFileSync(f, next); e.backup = b; }
      files.push(e);
    }
    for (const h of hits) if (h.id !== 'scene-v3-preview') manual.push({ file: f, line: h.line, id: h.id, reason: h.fix });
  }
  const report = { format: 'motionary-migrate-report', version: 1, to: '17', write, files, manual, problems };
  if (opts.report) writeFileSync(opts.report, JSON.stringify(report, null, 2) + '\n');
  return report;
}
/** `motionary migrate --to 17 [paths…] [--write] [--report file] [--json]`. */
export function runMigrateTo17(rest) {
  const VAL = new Set(['--to', '--report']);
  const paths = rest.filter((a, i) => !a.startsWith('--') && !VAL.has(rest[i - 1]));
  for (const p of paths) if (!existsSync(p)) { console.error(`motionary migrate --to 17: ${p} not found`); return 2; }
  const write = rest.includes('--write');
  const r = migrateTo17(paths, { write, report: flag(rest, 'report') });
  if (rest.includes('--json')) console.log(JSON.stringify(r, null, 2));
  else {
    for (const x of r.files) console.log(`${x.file}  motionary/scene/v3-preview → motionary/scene/v3 ×${x.rewrites}${write ? `  (backup ${x.backup})` : '  will change'}`);
    for (const m of r.manual) console.log(`${m.file}:${m.line}  manual  ${m.reason}`);
    console.log(`\nmotionary migrate --to 17: ${r.files.length} file(s) ${write ? 'rewritten' : 'to rewrite (dry run — add --write; backups are written first)'}, ${r.manual.length} manual item(s). See ${V17_DOC}.`);
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
  if (cmd === 'migrate' && rest.includes('--to')) {
    const to = flag(rest, 'to');
    if (to === '17') return runMigrateTo17(rest);
    if (to === '16') return runMigrateTo16(rest, env);
    if (to === '15') { console.error(removed17('migrate --to 15')); return 2; }
    console.error('usage: motionary migrate --to 16|17 [paths…] [--write] [--report file] [--json]');
    return 2;
  }
  if (cmd === 'migrate' && rest.includes('--code')) return runMigrateCode(rest.filter((a) => a !== '--code'));
  if (cmd === 'migrate') {
    return runMigrate(rest, env.sceneV2 || createRequire(import.meta.url)('../dist/components/scene-v2.cjs'), env.sceneV3);
  }
  if (cmd === 'export') {
    if (rest.includes('--scene')) return env.native ? runExportScene(rest, env.native) : runExportScene(rest, createRequire(import.meta.url)('../dist/components/studio-native.cjs'));
    if (env.presets) return runExport(rest, env.presets, env.tokens || TOKENS());
    return import('../dist/index.js').then((m) => runExport(rest, m.PRESETS, env.tokens || TOKENS()));
  }
  if ((cmd === 'doctor' || cmd === 'check') && rest.includes('--v16')) {
    const found = doctorV16(rest.filter((a) => !a.startsWith('--')));
    if (rest.includes('--json')) console.log(JSON.stringify({ v16: found }, null, 2));
    else if (!found.length) console.log('motionary doctor --v16: nothing that 16.0 changes was found ✓');
    else {
      for (const x of found) console.log(`${x.file}:${x.line}  ${x.id}  ${x.text}\n    → ${x.fix}`);
      console.log(`\n${found.length} use(s) of what 16.0 changes (${V16_DOC}). Preview the move: npx motionary migrate --to 16`);
    }
    return found.length ? 1 : 0;
  }
  if ((cmd === 'doctor' || cmd === 'check') && rest.includes('--v17')) {
    const found = doctorV17(rest.filter((a) => !a.startsWith('--')));
    if (rest.includes('--json')) console.log(JSON.stringify({ v17: found }, null, 2));
    else if (!found.length) console.log('motionary doctor --v17: nothing that 17.0 removes was found ✓');
    else {
      for (const x of found) console.log(`${x.file}:${x.line}  ${x.id}  ${x.text}\n    → ${x.fix}`);
      console.log(`\n${found.length} use(s) of what 17.0 removes (${V17_DOC}). Fix: npx motionary migrate --to 17 (dry run) then --write`);
    }
    return found.length ? 1 : 0;
  }
  if ((cmd === 'doctor' || cmd === 'check') && rest.includes('--v15')) { console.error(removed17('doctor --v15')); return 2; }
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
