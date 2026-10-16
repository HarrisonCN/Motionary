// 17.0.0 — mo-* names without a size cost for usa-* pages (size budgets, 2026-10-16). Tests first (failing-before:
// v17.0.0/failing-before-mo-entry.txt).
// The first 17.0 cut put the alias code (subclass registration + CSS selector renaming) in components/base.ts, which is
// inside every component entry: `npm run size:check` failed 37 budgets (lite 70.36 / 70.00 KB, per-entry widgets
// +0.37 KB each). No budget is raised; instead:
// - base.ts carries no mo-* code (every entry is back to its 16.9 size);
// - the alias code lives in its own side-effect-free entry `motionary/components/mo` (defineMoAliases / aliasTag /
//   aliasCss) with its own size line;
// - the no-build bundles (components.umd.js, widgets.umd.js) turn it on before registering, so CDN pages get <mo-*>;
// - ESM users opt in with one call; usa-* elements defined earlier and mo-* elements already on the page are picked up.
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(__dirname, '..');
const read = (f: string) => readFileSync(join(ROOT, f), 'utf8');

describe('17.0 mo-* names live in motionary/components/mo, not in base', () => {
  it('base.ts has no mo-* alias code (it is in every component entry)', () => {
    const s = read('src/components/base.ts');
    expect(s).not.toMatch(/aliasCss|aliasTag|defineAlias|'mo-'/);
  });
  it('motionary/components/mo is an entry with its own size line; lite and the per-entry limits are unchanged', () => {
    const pkg = JSON.parse(read('package.json'));
    expect(pkg.exports['./components/mo']).toBeTruthy();
    expect(read('scripts/categories.mjs')).toMatch(/\bmo: 'mo'/);
    const b = JSON.parse(read('size-budget.json')) as { name: string; limit: number; import?: string }[];
    expect(b.find((x) => x.import === "export * from 'pkg/components/mo';")).toBeTruthy();
    expect(b.find((x) => x.name === "import 'motionary/components/lite'")!.limit).toBe(71680);
    const lim = (n: string) => b.find((x) => x.name === n)!.limit;
    expect(lim("import 'motionary/widgets/sparkline' (per-entry, fixed)")).toBe(4352);
    expect(lim("import 'motionary/widgets/dock' (per-entry, fixed)")).toBe(3584);
    expect(lim("import { defineSpinner } from '…/components/feedback'")).toBe(3328);
  });
  it('importing motionary/components/mo defines nothing; defineMoAliases() aliases earlier and later usa-* definitions', async () => {
    const before = customElements.get('mo-spinner');
    const mo: any = await import(/* @vite-ignore */ ['..', 'src', 'components', 'mo'].join('/'));
    expect(before).toBeUndefined();
    expect(customElements.get('mo-spinner')).toBeUndefined();
    const { defineSpinner } = await import('../src/components/feedback/index');
    defineSpinner(); // defined before the opt-in
    expect(customElements.get('mo-spinner')).toBeUndefined();
    mo.defineMoAliases();
    expect(customElements.get('mo-spinner')!.prototype instanceof customElements.get('usa-spinner')!).toBe(true);
    const { defineSwitch } = await import('../src/components/widgets/switch');
    defineSwitch(); // defined after the opt-in
    expect(customElements.get('mo-switch')!.prototype instanceof customElements.get('usa-switch')!).toBe(true);
    defineSwitch('my-switch');
    expect(customElements.get('mo-my-switch')).toBeUndefined();
    expect(mo.aliasTag('usa-switch')).toBe('mo-switch');
    expect(mo.aliasTag('my-switch')).toBeNull();
  });
  it('the no-build bundles turn the mo-* names on before registering', () => {
    for (const f of ['src/components/auto.ts', 'src/components/widgets/auto.ts']) {
      const s = read(f);
      expect(s, f).toMatch(/defineMoAliases\(\)/);
      expect(s.indexOf('defineMoAliases()'), f).toBeLessThan(s.search(/define(Components|Widgets)\(\)/));
    }
  });
  it('docs say how ESM users opt in', () => {
    expect(existsSync(join(ROOT, 'src/components/mo.ts'))).toBe(true);
    for (const f of ['docs/deprecations-v17.md', 'docs/migrating-to-v17.md']) expect(read(f), f).toContain("motionary/components/mo");
    expect(read('docs/deprecations-v17.md')).toContain('defineMoAliases');
  });
});
