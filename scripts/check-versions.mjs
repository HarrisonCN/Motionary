// 13.2: version descriptions agree across README / docs / site / package metadata. Checks, with the rule name each finding carries:
//   package-version  package.json = package-lock.json = RUNTIME_VERSION (src/runtime/registry.ts); CHANGELOG has the release
//   cdn-major        a CDN URL pinned to a major (`motionary@12/…`, `use-scroll-animate@12/…`) names the current major
//   product-major    "Motionary vN" names the current major
//   latest           a statement of what npm `latest` points to names the version docs/versions.md's policy gives
//                    (the newest x.0.y of the current major — minors get their own v<major>-<minor> tag)
// Exact pins (`motionary@12.4.0`) are allowed everywhere; history (CHANGELOG, upgrading guides, codemods, audits) is not scanned.
// `node scripts/check-versions.mjs` prints the findings and exits 1 when there are any (CI: npm run check:docs).
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, relative } from 'node:path';

const HERE = (() => { try { return fileURLToPath(new URL('..', import.meta.url)); } catch { return ''; } })();
const ROOT = HERE && existsSync(join(HERE, 'package.json')) ? HERE : process.cwd();
const read = (f) => readFileSync(join(ROOT, f), 'utf8');

const parse = (v) => String(v).split('.').map((x) => parseInt(x, 10) || 0);
const cmp = (a, b) => { const x = parse(a), y = parse(b); for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i]; return 0; };

/** The version npm `latest` should point to under the docs/versions.md policy: the newest x.0.y of the current major. */
export function policyLatest(changelog, version) {
  const major = parse(version)[0];
  const vs = [...String(changelog).matchAll(/^## \[(\d+\.\d+\.\d+)\]/gm)].map((x) => x[1]).filter((v) => parse(v)[0] === major && parse(v)[1] === 0 && cmp(v, version) <= 0);
  return vs.sort(cmp).pop() || null;
}

/** Findings for one file's text. ctx: { major, latest }. */
export function scanText(file, text, { major, latest }) {
  const out = [];
  const lines = String(text).split('\n');
  lines.forEach((line, i) => {
    const at = `${file}:${i + 1}`;
    for (const mm of line.matchAll(/\b(?:motionary|use-scroll-animate)@(\d+)(?=\/)/g)) if (Number(mm[1]) !== major) out.push({ rule: 'cdn-major', at, text: mm[0], expected: `@${major}` });
    // the site states the product major in its own words ("Motionary 13 · …"); elsewhere only the "vN" form is a version claim
    for (const mm of line.matchAll(file.startsWith('showcase/') ? /\bMotionary v?(\d+)\b(?!\.)/g : /\bMotionary v(\d+)\b/g)) if (Number(mm[1]) !== major) out.push({ rule: 'product-major', at, text: mm[0], expected: `Motionary ${major}` });
    const l = line.match(/\blatest\b`?[^\n]{0,120}?[(（](\d+\.\d+\.\d+)(?: today)?[)）]/);
    if (l && latest && l[1] !== latest) out.push({ rule: 'latest', at, text: l[0], expected: latest });
  });
  return out;
}

const SKIP = [/^CHANGELOG\.md$/, /^docs\/upgrading-/, /^docs\/audit-/, /^bin\/usa-codemod-/, /^test\//, /^node_modules\//, /^dist\//, /^docs\/components\//];
function files() {
  const out = [];
  const walk = (dir, exts) => {
    for (const f of readdirSync(join(ROOT, dir))) {
      const p = join(dir, f);
      if (statSync(join(ROOT, p)).isDirectory()) { if (!/node_modules|\.git/.test(f)) walk(p, exts); } else if (exts.test(f)) out.push(p);
    }
  };
  for (const f of ['README.md', 'README_zh.md', 'README_ja.md', 'AGENTS.md', 'CONTRIBUTING.md', 'package.json']) if (existsSync(join(ROOT, f))) out.push(f);
  walk('docs', /\.md$/);
  walk('showcase', /\.(html|js)$/);
  walk('demo', /\.(html|js)$/);
  walk('examples', /\.(html|js|ts|tsx|md|json)$/);
  walk('figma-plugin', /\.(html|json|md)$/);
  return out.map((f) => relative('.', f)).filter((f) => !SKIP.some((r) => r.test(f)));
}

export function checkVersions() {
  const pkg = JSON.parse(read('package.json'));
  const major = parse(pkg.version)[0];
  const changelog = read('CHANGELOG.md');
  const latest = policyLatest(changelog, pkg.version);
  const findings = [];
  const lock = JSON.parse(read('package-lock.json'));
  const rt = (read('src/runtime/registry.ts').match(/RUNTIME_VERSION = '([^']+)'/) || [])[1];
  if (lock.version !== pkg.version || (lock.packages && lock.packages[''] && lock.packages[''].version !== pkg.version)) findings.push({ rule: 'package-version', at: 'package-lock.json', text: lock.version, expected: pkg.version });
  if (rt !== pkg.version) findings.push({ rule: 'package-version', at: 'src/runtime/registry.ts', text: rt, expected: pkg.version });
  if (!new RegExp(`^## \\[${pkg.version.replace(/\./g, '\\.')}\\]`, 'm').test(changelog)) findings.push({ rule: 'package-version', at: 'CHANGELOG.md', text: 'no release heading', expected: `## [${pkg.version}]` });
  for (const f of files()) findings.push(...scanText(f, read(f), { major, latest }));
  return { version: pkg.version, major, latest, findings };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const r = checkVersions();
  if (r.findings.length) {
    for (const f of r.findings) console.error(`❌ ${f.rule} ${f.at}: "${f.text}" — expected ${f.expected}`);
    process.exit(1);
  }
  console.log(`versions consistent: ${r.version}, CDN major @${r.major}, npm latest ${r.latest}`);
}
