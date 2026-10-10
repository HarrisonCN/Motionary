// 13.2.0: documentation and contract consistency — facts generated from the manifest (component counts with one definition,
// the core element table with its entry points, package description), version descriptions that agree everywhere
// (scripts/check-versions.mjs), and a release gate that cannot be bypassed (scripts/release-gate.mjs, .github/required-checks.json,
// pipefail in CI, docs/release-gate.md).
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const read = (f: string) => readFileSync(f, 'utf8');
// modules added in 13.2 load lazily so that, before they exist, each test fails on its own (test-first run)
const opt = async (p: string): Promise<any> => { try { return await import(/* @vite-ignore */ p); } catch { return {}; } };
const { buildManifest } = await import('../scripts/gen-manifest.mjs');
const m = buildManifest();
const pkg = JSON.parse(read('package.json'));
const run = (args: string[]) => { try { return { code: 0, out: execFileSync(process.execPath, args, { encoding: 'utf8', stdio: 'pipe' }) }; } catch (e: any) { return { code: e.status ?? 1, out: String(e.stdout || '') + String(e.stderr || e.message) }; } };

describe('13.2 component counts: one definition, generated from the manifest (scripts/facts.mjs)', async () => {
  const F = await opt('../scripts/facts.mjs');
  const n: any = F.componentCounts ? F.componentCounts(m) : {};
  it('public = core + widgets; widgets = widgets bundle + entry-only', () => {
    expect(n.public).toBe(m.components.length);
    expect(n.core + n.widgets).toBe(n.public);
    expect(n.widgetsBundle + n.entryOnly).toBe(n.widgets);
    expect(n.core).toBe(m.components.filter((c: any) => !c.entry).length);
    expect(n.entryOnly).toBe(3);
    expect(n.effects).toBe(m.effects.length);
  });
  it('README (en / zh / ja) and docs/components.md carry the generated numbers and link the definition', () => {
    for (const f of ['README.md', 'README_zh.md', 'README_ja.md', 'docs/components.md']) {
      const s = read(f);
      expect(s, f).toContain(`<!--fact:public-->${n.public}<!--/fact-->`);
      expect(s, f).toContain(`<!--fact:core-->${n.core}<!--/fact-->`);
      expect(s, f).toMatch(/components\.md#how-components-are-counted|\(#how-components-are-counted\)/);
    }
    const doc = read('docs/components.md');
    expect(doc).toContain('## How components are counted');
    expect(doc).not.toMatch(/now \*\*v3\*\*|\*\*30 animated UI components\*\*/);
  });
  it('the core element table (category, entry point, elements) is generated from the manifest in all three READMEs', () => {
    const core = m.components.filter((c: any) => !c.entry);
    for (const f of ['README.md', 'README_zh.md', 'README_ja.md']) {
      const s = read(f);
      const block = (s.match(/<!-- core-table:start -->([\s\S]*?)<!-- core-table:end -->/) || [])[1] || '';
      const tags = [...block.matchAll(/`<(usa-[a-z0-9-]+)>`/g)].map((x) => x[1]);
      expect(tags.sort(), f).toEqual(core.map((c: any) => c.tag).sort());
      for (const p of new Set(core.map((c: any) => c.import.path))) expect(block, `${f} ${p}`).toContain(`\`${p}\``);
    }
  });
  it('package.json description is generated (no hand-written count)', () => {
    expect(pkg.description).toContain(`${n.public} animated Web Components`);
    expect(F.packageDescription ? F.packageDescription(m) : null).toBe(pkg.description);
  });
  it('facts --check passes; the CI job runs every docs generator in check mode (check:docs)', () => {
    const r = run(['scripts/facts.mjs', '--check']);
    expect(r.code, r.out).toBe(0);
    expect(pkg.scripts['check:docs']).toMatch(/facts\.mjs --check/);
    for (const g of ['gen-component-docs', 'gen-entries', 'gen-runtime-docs', 'gen-figma-plugin', 'check-versions']) expect(pkg.scripts['check:docs'], g).toContain(g);
    expect(read('.github/workflows/ci.yml')).toMatch(/run: npm run check:docs/);
  });
});

describe('13.2 manifest CDN field is true for every element', () => {
  it('entry-only elements (own module entry, not in the no-build bundles) get a module URL, not components.umd.js', () => {
    for (const t of ['usa-snap-carousel', 'usa-dotlottie', 'usa-gl-model']) expect(m.components.find((c: any) => c.tag === t)?.cdn, t).toMatch(/\/dist\/components\/[\w-]+\.js$/);
    for (const c of m.components.filter((x: any) => !x.entry)) expect(c.cdn, c.tag).toMatch(/components\.umd\.js$/);
    for (const c of m.components.filter((x: any) => x.entry && !['usa-snap-carousel', 'usa-dotlottie', 'usa-gl-model'].includes(x.tag))) expect(c.cdn, c.tag).toMatch(/widgets\.umd\.js$/);
  });
  it('no-build bundles really define what the manifest says (after a build)', async () => {
    if (!existsSync('dist/components.umd.js')) return; // the unit job runs before the build
    const { JSDOM } = await import('jsdom');
    const defined = (file: string) => {
      const dom = new JSDOM('<!doctype html><body></body>', { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://localhost/' });
      const w: any = dom.window;
      w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
      for (const k of ['IntersectionObserver', 'ResizeObserver']) w[k] = class { observe() {} unobserve() {} disconnect() {} };
      w.eval(read(file));
      const tags = new Set(m.components.map((c: any) => c.tag).filter((t: string) => w.customElements.get(t)));
      w.close();
      return tags;
    };
    const comp = defined('dist/components.umd.js'), wid = defined('dist/widgets.umd.js');
    const wrong = m.components.filter((c: any) => (/components\.umd\.js$/.test(c.cdn) && !comp.has(c.tag)) || (/widgets\.umd\.js$/.test(c.cdn) && !wid.has(c.tag))).map((c: any) => c.tag);
    expect(wrong).toEqual([]);
  });
});

describe('13.2 version descriptions agree everywhere (scripts/check-versions.mjs)', async () => {
  const V = await opt('../scripts/check-versions.mjs');
  it('no findings across README / docs / site / package metadata', () => {
    expect(V.checkVersions ? V.checkVersions().findings : ['scripts/check-versions.mjs missing']).toEqual([]);
  });
  it('catches the classes of drift it is for', () => {
    expect(typeof V.policyLatest).toBe('function');
    expect(V.policyLatest('## [13.1.0] - x\n## [13.0.2] - x\n## [13.0.1] - x\n## [13.0.0] - x\n## [12.9.0] - x\n', '13.1.0')).toBe('13.0.2');
    const f = V.scanText ? V.scanText('showcase/x.html', 'Motionary v6 · <script src="https://unpkg.com/motionary@12/dist/components.umd.js">', { major: 13, latest: '13.0.2' }) : [];
    expect(f.map((x: any) => x.rule).sort()).toEqual(['cdn-major', 'product-major']);
    expect(V.scanText('docs/x.md', 'Exact pins (`motionary@12.4.0`) keep working; latest (13.0.1 today)', { major: 13, latest: '13.0.2' }).map((x: any) => x.rule)).toEqual(['latest']);
  });
  it('package version, runtime version and lock agree', () => {
    expect(read('src/runtime/registry.ts')).toContain(`RUNTIME_VERSION = '${pkg.version}'`);
    expect(JSON.parse(read('package-lock.json')).version).toBe(pkg.version);
  });
  it('the site no longer says "Motionary v6" or pins a CDN URL to an old major', () => {
    for (const f of ['showcase/index.html', 'showcase/i18n.js']) expect(read(f), f).not.toMatch(/Motionary v6/);
    expect(read('showcase/components.html')).not.toMatch(/motionary@12\//);
  });
});

describe('13.2 release gate: CI checks cannot be bypassed on the way to npm (scripts/release-gate.mjs)', async () => {
  const G = await opt('../scripts/release-gate.mjs');
  const required = existsSync('.github/required-checks.json') ? JSON.parse(read('.github/required-checks.json')) : { checks: [] };
  const pr = { number: 1, state: 'open', draft: false, merged: false, head: { sha: 'abc' } };
  const green = (names: string[]) => names.map((name) => ({ name, status: 'completed', conclusion: 'success', head_sha: 'abc', started_at: '2026-10-10T10:00:00Z' }));
  it('required checks are every CI job (contract, size, tree-shaking, playground run in the Node jobs; the three browsers)', () => {
    expect(required.checks).toEqual(expect.arrayContaining(['Node 20', 'Node 22', 'Node 24', 'Browser (chromium)', 'Browser (firefox)', 'Browser (webkit)']));
    expect(G.checksFromWorkflow ? G.checksFromWorkflow(read('.github/workflows/ci.yml')).sort() : []).toEqual([...required.checks].sort());
  });
  it('green head → ok; failing, missing, pending or stale checks → refused', () => {
    const ev = (o: any) => G.evaluateGate({ required: required.checks, pr, ...o });
    expect(ev({ checkRuns: green(required.checks) })).toMatchObject({ ok: true, problems: [] });
    const failing = green(required.checks); failing[1] = { ...failing[1], conclusion: 'failure' };
    expect(ev({ checkRuns: failing }).ok).toBe(false);
    expect(ev({ checkRuns: green(required.checks.slice(1)) }).problems.join('\n')).toMatch(/missing/);
    const pending = green(required.checks); pending[0] = { ...pending[0], status: 'in_progress', conclusion: null };
    expect(ev({ checkRuns: pending }).ok).toBe(false);
    const rerunFailed = [...green(required.checks), { ...green([required.checks[0]])[0], conclusion: 'failure', started_at: '2026-10-10T11:00:00Z' }];
    expect(ev({ checkRuns: rerunFailed }).ok).toBe(false); // the newest run of a check counts
    const otherSha = green(required.checks).map((r) => ({ ...r, head_sha: 'old' }));
    expect(ev({ checkRuns: otherSha }).ok).toBe(false);
    expect(ev({ checkRuns: [...green(required.checks), { name: 'Extra', status: 'completed', conclusion: 'failure', head_sha: 'abc' }] }).ok).toBe(false);
    expect(G.evaluateGate({ required: required.checks, pr: { ...pr, draft: true }, checkRuns: green(required.checks) }).ok).toBe(false);
    expect(G.evaluateGate({ required: required.checks, pr: { ...pr, merged: true, state: 'closed' }, checkRuns: green(required.checks) }).ok).toBe(false);
  });
  it('CI steps fail the job: bash with pipefail (| tee no longer swallows a failing check), nothing continue-on-error', () => {
    for (const f of ['.github/workflows/ci.yml', '.github/workflows/pages.yml']) {
      const y = read(f);
      expect(y, f).toMatch(/defaults:\s*\n\s+run:\s*\n\s+shell: bash/);
      expect(y, f).not.toMatch(/continue-on-error:\s*true/);
    }
  });
  it('documented: required checks in branch settings, the gate in the release flow', () => {
    const d = read('docs/release-gate.md');
    for (const c of required.checks) expect(d).toContain(c);
    expect(d).toMatch(/Settings → (Branches|Rules)/);
    expect(d).toMatch(/release-gate\.mjs/);
    expect(read('docs/versions.md')).toContain('release-gate.md');
    expect(read('CONTRIBUTING.md')).toContain('release-gate.md');
  });
});
