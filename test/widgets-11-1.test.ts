// 11.1: side-effect-free, tree-shakable core (docs/tree-shaking.md).
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const read = (f: string) => readFileSync(f, 'utf8');
const pkg = JSON.parse(read('package.json'));
const walk = (d: string): string[] => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : f.endsWith('.ts') && !f.endsWith('.d.ts') ? [p] : []; });

/** The source files that run code on import (registration, CDN builds) — and only these. */
const SIDE_SRC = ['src/extended-presets.ts', 'src/extended-presets-umd.ts', 'src/element-auto.ts', 'src/components/auto.ts', 'src/components/widgets/auto.ts', 'src/components/lite.ts'];

describe('11.1: package.json sideEffects is precise', () => {
  it('lists only CSS, the UMD / IIFE builds, presets/extended and components/lite (+ their sources)', () => {
    expect(pkg.sideEffects).toEqual([
      '*.css',
      './dist/presets/extended.js', './dist/presets/extended.cjs',
      './dist/components/lite.js', './dist/components/lite.cjs',
      './dist/*.umd.js', './dist/runtime.iife.js', './dist/runtime/*.iife.js',
      ...SIDE_SRC.map((f) => './' + f), './src/runtime/iife/*.ts',
    ]);
    expect(pkg.scripts['check:treeshake']).toBe('node scripts/check-treeshake.mjs');
    expect(read('.github/workflows/ci.yml')).toMatch(/npm run check:treeshake/);
    expect(pkg.devDependencies.esbuild).toBeTruthy();
    expect(Object.keys(pkg.dependencies || {})).toEqual([]);
  });
  it('only the listed source files call code at module level', () => {
    const offenders: string[] = [];
    for (const f of walk(join(ROOT, 'src'))) {
      const rel = relative(ROOT, f).split('\\').join('/');
      if (SIDE_SRC.includes(rel) || rel.startsWith('src/runtime/iife/')) continue;
      readFileSync(f, 'utf8').split('\n').forEach((l, i) => {
        // a bare top-level statement call: defineX(); register(...); customElements.define(...)
        if (/^(?:[A-Za-z_$][\w$]*\.)*[A-Za-z_$][\w$]*\(.*\);?\s*$/.test(l) && !/^(?:if|for|while|switch|return|export|import|function)\b/.test(l)) offenders.push(`${rel}:${i + 1}: ${l.slice(0, 80)}`);
      });
    }
    expect(offenders).toEqual([]);
  });
});

describe('11.1: /*#__PURE__*/ on module-level calls', () => {
  it('every module-level `const x = call(…)` in src/ is annotated', () => {
    const DECL = /^(?:export\s+)?(?:const|let|var)\s+[\w$]+(?:\s*:\s*[^=\n]+)?\s*=\s*((?:new\s+)?[A-Za-z_$][\w$.]*(?:<[^>\n]*>)?\(.*)$/;
    const missing: string[] = [];
    for (const f of walk(join(ROOT, 'src'))) {
      const rel = relative(ROOT, f).split('\\').join('/');
      if (SIDE_SRC.includes(rel) || rel.startsWith('src/runtime/iife/')) continue;
      let tpl = false;
      readFileSync(f, 'utf8').split('\n').forEach((l, i) => {
        if (tpl) { if ((l.match(/`/g) || []).length % 2) tpl = false; return; }
        const m = DECL.exec(l);
        if (m && !/^(vec|mat)\d/.test(m[1])) missing.push(`${rel}:${i + 1}`);
        if ((l.match(/`/g) || []).length % 2) tpl = true;
      });
    }
    expect(missing).toEqual([]);
  });
  it('the generated motionary/effects/<name> entries are annotated', () => {
    expect(read('src/entries/effects/coin-burst.ts')).toMatch(/= \/\*#__PURE__\*\/ GAME_FX\.find\(/);
  });
});

describe('11.1: importing registers nothing', () => {
  it('no <usa-*> element, effect or runtime module exists after importing the libraries', async () => {
    const before = Object.getOwnPropertySymbols(globalThis).map(String);
    await import('../src/components/index');
    await import('../src/components/widgets/index');
    await import('../src/components/plugins/index');
    await import('../src/components/fx2/index');
    await import('../src/runtime/index');
    await import('../src/index');
    const tags = ['usa-card', 'usa-add-to-cart', 'usa-gl-scene', 'usa-fx', 'usa-reveal', 'scroll-animate'];
    for (const t of tags) expect(customElements.get(t), t).toBeUndefined();
    const after = Object.getOwnPropertySymbols(globalThis).map(String);
    // the effect table, the shared clock and the runtime registry are created on first use, not on import.
    // The one exception is the preset table behind `PRESETS` (the HTML data-attribute API): it is shared through a
    // global symbol by design and is `/*#__PURE__*/`, so a bundler drops it when `PRESETS` is unused.
    expect(after.filter((s) => !before.includes(s) && /motionary|use-scroll-animate/.test(s))).toEqual(['Symbol(use-scroll-animate.presets)']);
    const { listEffects } = await import('../src/components/fx/registry');
    expect(listEffects()).toEqual([]);
  });
  it('the effect table and the clock are still shared per page once used', async () => {
    const { registerEffect, hasEffect } = await import('../src/components/fx/registry');
    const off = registerEffect({ name: 'tree-shake-probe', kind: 'enter', run: () => {} } as any);
    expect(hasEffect('tree-shake-probe')).toBe(true);
    expect((globalThis as any)[Symbol.for('use-scroll-animate.effects')].has('tree-shake-probe')).toBe(true);
    off();
    const { getClock, setClock } = await import('../src/components/base');
    setClock({ rate: 2 });
    expect(getClock().rate).toBe(2);
    expect((globalThis as any)[Symbol.for('motionary.clock')].rate).toBe(2);
    setClock({ rate: 1 });
  });
});

describe('11.1: docs', () => {
  it('docs/tree-shaking.md, README and ROADMAP', () => {
    expect(read('docs/tree-shaking.md')).toMatch(/sideEffects/);
    expect(read('README.md')).toMatch(/docs\/tree-shaking\.md/);
    expect(read('docs/ROADMAP.md')).toMatch(/✅ \*\*v11\.1 — /);
  });
});
