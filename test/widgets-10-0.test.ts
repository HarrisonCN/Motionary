import { describe, it, expect, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { installComponentMocks, anims } from './components-setup';
import { MockIO } from './setup';
import { createMotion, PRESETS, preferredBackend, VERSION } from '../src/components/core';
import { ALL_PLUGINS, retro, cinema, paper } from '../src/components/plugins';
import { EFFECT_PACKS } from '../src/components/fx2';

afterEach(() => vi.restoreAllMocks());

describe('10.0 zero-dependency core + plugins', () => {
  it('core bundles with no imports and stays under 10 KB gzip', () => {
    const src = readFileSync('src/components/core/index.ts', 'utf8');
    expect(src).not.toMatch(/^\s*import\s/m);
    // esbuild in a child process (its JS API trips over jsdom's TextEncoder)
    const out = execFileSync('node_modules/.bin/esbuild', ['src/components/core/index.ts', '--bundle', '--minify', '--format=esm', '--platform=browser']);
    const gz = gzipSync(out).length;
    expect(gz).toBeLessThan(10 * 1024);
    const budget = JSON.parse(readFileSync('size-budget.json', 'utf8'));
    expect(budget.find((e: any) => e.name.includes('motionary/core')).limit).toBe(10240);
  });

  it('createMotion: presets, use(), play / bind / reveal, pause / resume / rate / destroy', async () => {
    installComponentMocks();
    expect(VERSION).toBe('10.0.0');
    const m = createMotion();
    for (const p of Object.keys(PRESETS)) expect(m.has(p)).toBe(true);
    expect(m.has('vhs-glitch')).toBe(false);
    const el = document.createElement('div');
    document.body.append(el);
    await expect(m.play(el, 'vhs-glitch')).rejects.toThrow(/use\(\)/);
    const install = vi.fn();
    const custom = { name: 'acme/x', effects: [{ name: 'acme-x', kind: 'attention', run: (e: HTMLElement, _o: any, c: any) => c.animate(e, [{ opacity: 0 }, { opacity: 1 }], 100) }], install };
    m.use(custom, custom);
    expect(install).toHaveBeenCalledTimes(1);
    const p = m.play(el, 'acme-x');
    expect(anims.length).toBe(1);
    anims[0].finish();
    await p;
    m.setRate(2);
    expect(m.rate).toBe(2);
    const off = m.bind(el, 'acme-x', { trigger: 'click' });
    el.click();
    expect(anims.length).toBe(2);
    m.pause();
    expect(m.paused).toBe(true);
    expect(anims[1].playState).toBe('paused');
    m.resume();
    off();
    el.click();
    expect(anims.length).toBe(2);
    const items = [0, 1, 2].map(() => document.body.appendChild(document.createElement('p')));
    m.reveal(items, 'fade-up', { stagger: 80 });
    expect(items[0].style.opacity).toBe('0');
    const io = MockIO.instances[MockIO.instances.length - 1];
    io.callback(items.map((target) => ({ target, isIntersecting: true }) as any), io as any);
    expect(anims.slice(-3).map((a) => a.timing.delay)).toEqual([0, 80, 160]);
    expect(items[2].style.opacity).toBe('');
    m.destroy();
    expect(anims.every((a) => a.cancelled || a.playState === 'finished')).toBe(true);
  });

  it('reduced motion: entrances fade, loops are skipped', async () => {
    installComponentMocks({ reducedMotion: true });
    const m = createMotion();
    m.use({ name: 'loopy', effects: [{ name: 'spin', kind: 'loop', run: (e: HTMLElement, _o: any, c: any) => c.animate(e, [{ rotate: '0deg' }, { rotate: '360deg' }], 1000) }] });
    const el = document.createElement('div');
    await m.play(el, 'spin');
    expect(anims.length).toBe(0);
    const p = m.play(el, 'zoom-in');
    expect(anims[0].keyframes).toEqual(PRESETS.fade);
    anims[0].finish();
    await p;
    expect(createMotion({ reducedMotion: 'reduce' }).reduced()).toBe(true);
  });

  it('every built-in effect pack is a plugin; core.use() runs pack effects', () => {
    installComponentMocks();
    expect(ALL_PLUGINS.length).toBe(Object.keys(EFFECT_PACKS).length);
    expect(retro.effects).toBe(EFFECT_PACKS.retro);
    expect(cinema.name).toBe('cinema');
    const m = createMotion().use(retro, cinema, paper);
    expect(m.has('vhs-glitch')).toBe(true);
    expect(m.has('dolly-in')).toBe(true);
    expect(m.has('paper-unfold')).toBe(true);
    expect(m.effects().length).toBeGreaterThan(Object.keys(PRESETS).length + 10);
  });

  it('WebGPU is the default backend when available', () => {
    expect(['webgl2', 'canvas']).toContain(preferredBackend());
    (navigator as any).gpu = {};
    expect(preferredBackend()).toBe('webgpu');
    delete (navigator as any).gpu;
  });

  it('exports, docs, roadmap; 9.9 deprecation removed', async () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    expect(pkg.exports['./core']).toBeTruthy();
    expect(pkg.exports['./plugins']).toBeTruthy();
    const fx2: any = await import('../src/components/fx2');
    expect(fx2['register' + 'EffectPacks']).toBeUndefined();
    expect(readFileSync('docs/core.md', 'utf8')).toContain('createMotion');
    const roadmap = readFileSync('docs/ROADMAP.md', 'utf8');
    expect(roadmap).toContain('v10.1');
    expect(roadmap).toContain('v11.0');
    expect(roadmap).toMatch(/路线图/);
  });
});
