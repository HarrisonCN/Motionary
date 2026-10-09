import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

// 10.9: per-component entry points. Every motionary/widgets/<name> registers only its own tag; every
// motionary/effects/<name> registers only its own effect. Each entry is loaded into a fresh module graph with a
// fresh (fake) custom-element registry, so nothing another entry defined can leak in.
const LIST: any[] = JSON.parse(readFileSync('scripts/entries.json', 'utf8'));
const W = LIST.filter((e) => e.kind === 'widget');
const E = LIST.filter((e) => e.kind === 'effect');
// tags a widget legitimately defines together with its own (child elements it renders)
const ALSO: Record<string, string[]> = { 'usa-gl-model': ['usa-gl-scene'], 'usa-dotlottie': ['usa-lottie-player'] }; // subclasses: they register the element they extend

afterEach(() => vi.unstubAllGlobals());

describe('10.9 per-component entry points', () => {
  it('generated files are current; package exports, budgets and the manifest list every entry', () => {
    execFileSync(process.execPath, ['scripts/gen-entries.mjs', '--check']);
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    const budgets = JSON.parse(readFileSync('size-budget.json', 'utf8'));
    for (const e of LIST) {
      const sub = e.entry.replace(/^motionary/, '.');
      expect(pkg.exports[sub], sub).toBeTruthy();
      expect(budgets.some((b: any) => b.name === `import '${e.entry}' (per-entry, fixed)` && b.limit >= 1), e.entry).toBe(true);
    }
    expect(W.length).toBeGreaterThan(100);
    expect(E.length).toBeGreaterThan(100);
    for (const n of ['toast-stack', 'dock', 'carousel', 'snap-carousel']) expect(W.some((e) => e.name === n), n).toBe(true);
    for (const n of ['pearlescent', 'spectrum-mirror']) expect(E.some((e) => e.name === n), n).toBe(true);
    const m = JSON.parse(execFileSync(process.execPath, ['scripts/gen-manifest.mjs', '--stdout'], { maxBuffer: 64 << 20 }).toString());
    expect(m.components.find((c: any) => c.tag === 'usa-dock').entry).toBe('motionary/widgets/dock');
    expect(m.effects.find((x: any) => x.name === 'pearlescent')).toMatchObject({ entry: 'motionary/effects/pearlescent', register: 'registerPearlescent();' });
    expect(readFileSync('README.md', 'utf8')).toContain('motionary/widgets/<name>');
  });

  it('each widget entry registers only its own tag', async () => {
    const extra: string[] = [];
    for (const e of W) {
      vi.resetModules();
      const reg = new Map<string, CustomElementConstructor>();
      vi.stubGlobal('customElements', { get: (t: string) => reg.get(t), define: (t: string, c: CustomElementConstructor) => reg.set(t, c), whenDefined: async () => undefined, upgrade: () => undefined });
      const mod: any = await import(/* @vite-ignore */ '../' + e.src);
      expect(Object.keys(mod).filter((k) => typeof mod[k] === 'function'), e.entry).toEqual([e.define]);
      mod[e.define]();
      const tags = [...reg.keys()].sort();
      const allowed = [e.tag, ...(ALSO[e.tag] || [])].sort();
      if (JSON.stringify(tags) !== JSON.stringify(allowed)) extra.push(`${e.entry}: ${tags.join(', ')}`);
    }
    expect(extra).toEqual([]);
  }, 240000);

  it('each effect entry registers only its own effect', async () => {
    const bad: string[] = [];
    for (const e of E) {
      vi.resetModules();
      const registry: any = await import('../src/components/fx/registry');
      const before = registry.listEffects().map((d: any) => d.name);
      const mod: any = await import(/* @vite-ignore */ '../' + e.src);
      mod[e.register]();
      const added = registry.listEffects().map((d: any) => d.name).filter((n: string) => !before.includes(n));
      if (added.join() !== e.name || mod.effect?.name !== e.name || mod.register !== mod[e.register]) bad.push(`${e.entry}: ${added.join(', ')}`);
    }
    expect(bad).toEqual([]);
  }, 240000);
});
