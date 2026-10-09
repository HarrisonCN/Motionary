import { describe, it, expect, afterEach, vi } from 'vitest';
import { installComponentMocks } from './components-setup';
import { readFileSync } from 'node:fs';
import { getEffect } from '../src/components/fx';
import { registerEffectPacks, registerAllPlugins, usePlugins, effectPlugins, definePlugin, EFFECT_PACKS } from '../src/components/fx2';
import { transform as codemod10 } from '../bin/usa-codemod-10.mjs';

afterEach(() => vi.restoreAllMocks());

describe('9.9 plugins API + 10.0 deprecations', () => {
  it('effectPlugins / usePlugins / definePlugin', () => {
    installComponentMocks();
    const ps = effectPlugins();
    expect(ps.length).toBe(Object.keys(EFFECT_PACKS).length);
    expect(ps.find((p) => p.name === 'retro')!.effects).toBe(EFFECT_PACKS.retro);
    const install = vi.fn();
    const p = definePlugin('acme/x', [{ name: 'acme-x', kind: 'attention', description: 'x', defaults: {}, run: () => undefined } as any], install);
    expect(usePlugins(p, p)).toEqual(['acme-x', 'acme-x']);
    expect(install).toHaveBeenCalledTimes(1);
    expect(getEffect('acme-x')).toBeTruthy();
    expect(usePlugins(ps.find((x) => x.name === 'cinema')!)).toContain('dolly-in');
  });
  it('registerEffectPacks warns once and still registers everything; registerAllPlugins does not warn', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    registerAllPlugins();
    expect(warn).not.toHaveBeenCalled();
    registerEffectPacks();
    registerEffectPacks();
    expect(warn.mock.calls.filter((c) => String(c[0]).includes('registerAllPlugins')).length).toBe(1);
    expect(getEffect('vhs-glitch')).toBeTruthy();
  });
  it('codemod-10, bin, docs; internals moved to the new name', () => {
    const r = codemod10("import { registerEffectPacks } from 'motionary/fx2';\nregisterEffectPacks();\nmyregisterEffectPacksX();");
    expect(r.code).toBe("import { registerAllPlugins } from 'motionary/fx2';\nregisterAllPlugins();\nmyregisterEffectPacksX();");
    expect(codemod10(r.code).changes).toEqual([]);
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    expect(pkg.bin['usa-codemod-10']).toBe('./bin/usa-codemod-10.mjs');
    expect(readFileSync('docs/upgrading-10.md', 'utf8')).toContain('usa-codemod-10');
    expect(readFileSync('docs/deprecations.md', 'utf8')).toContain('Deprecated in 9.9, removed in 10.0');
    expect(readFileSync('src/components/widgets/auto.ts', 'utf8')).toContain('registerAllPlugins');
    expect(readFileSync('showcase/gallery.js', 'utf8')).toContain('lib.registerAllPlugins');
  });
});
