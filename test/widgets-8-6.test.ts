import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, mount, anims, tick } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineWidgets, WIDGETS } from '../src/components/widgets';
import { registerAllPlugins, EFFECT_PACKS, SURFACE_FX, registerSurfacePack } from '../src/components/fx2';
import { getEffect, playEffect } from '../src/components/fx';
import { COMPONENT_ITEMS } from '../showcase/catalog-components.js';
import { COMPONENTS, componentSnippets } from '../showcase/components-catalog.js';
import { COMPONENT_ENTRIES } from '../scripts/categories.mjs';
import { readFileSync } from 'node:fs';
import { SURFACE_FX as SF, SURFACE_THEMES, applySurfaceTheme } from '../src/components/fx2';

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  defineWidgets();
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  configureComponents({ reducedMotion: 'user' });
});

const ctx = (reduced = false): any => ({ reduced, animate: (el: Element, k: Keyframe[], o: any) => (el as any).animate(k, o), onCleanup() {} });
void ctx; void anims; void tick; void playEffect; void mount;

describe('8.6 release', () => {
  it('ships its widgets', () => {
    expect(Object.keys(WIDGETS['8.6'])).toEqual(["usa-theme-switcher", "usa-theme-surface"]);
    for (const t of Object.keys(WIDGETS['8.6'])) expect(customElements.get(t)).toBeTruthy();
  });
  it('registers its effect packs (also via registerAllPlugins) as their own entries', () => {
    registerSurfacePack();
    registerAllPlugins();
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    for (const def of SURFACE_FX) expect(getEffect(def.name)).toBe(def);
    expect(EFFECT_PACKS['surface']).toBe(SURFACE_FX);
    expect(COMPONENT_ENTRIES['fx-surface']).toBe('fx2/themefx');
    expect(pkg.exports['./fx/surface'].import.default).toBe('./dist/components/fx-surface.js');
  });
  it('gallery cards with copyable code, Store entries and docs', () => {
    for (const tag of Object.keys(WIDGETS['8.6'])) {
      const card: any = COMPONENTS.find((c: any) => c.tag === tag);
      expect(card, tag).toBeTruthy();
      expect(card.since).toBe('8.6');
      expect(componentSnippets(card).esm).toContain(card.define);
    }
    expect(componentSnippets(COMPONENTS.find((c: any) => c.id === 'fx-neon')).esm).toContain("from 'motionary/components/fx-surface'");
    for (const id of ["theme-switcher", "theme-surface", "fx-neon", "fx-glass"]) expect(COMPONENT_ITEMS.some((i: any) => i.gallery === id), id).toBe(true);
    const doc = readFileSync('docs/components.md', 'utf8');
    for (const s of ["<usa-theme-switcher", "<usa-theme-surface", "motionary/fx/surface"]) expect(doc).toContain(s);
  });
});


describe('8.6 widgets behave', () => {
  it('applySurfaceTheme + theme switcher: radiogroup, target, keys, change, persist', () => {
    configureComponents({ reducedMotion: 'reduce' });
    expect(SURFACE_THEMES).toEqual(['light', 'dark', 'neon', 'glass', 'neu']);
    const box = document.createElement('div');
    expect(applySurfaceTheme('nope', box)).toBe('light');
    expect(box.getAttribute('data-usa-surface')).toBe('light');
    box.id = 'app';
    document.body.append(box);
    localStorage.removeItem('t-key');
    const s = mount<any>('<usa-theme-switcher target="#app" themes="light,neon,bogus,glass" persist="t-key"></usa-theme-switcher>');
    expect(s.getAttribute('role')).toBe('radiogroup');
    const opts = s.querySelectorAll('.usa-ts-opt');
    expect([...opts].map((o: any) => o.dataset.theme)).toEqual(['light', 'neon', 'glass']);
    expect(s.value).toBe('light');
    expect(opts[0].getAttribute('aria-checked')).toBe('true');
    const ch = vi.fn();
    s.addEventListener('usa:change', ch);
    opts[1].click();
    expect(box.getAttribute('data-usa-surface')).toBe('neon');
    expect(ch.mock.calls[0][0].detail.theme).toBe('neon');
    expect(localStorage.getItem('t-key')).toBe('neon');
    s.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(s.value).toBe('glass');
    expect(opts[2].tabIndex).toBe(0);
    expect(opts[1].tabIndex).toBe(-1);
    s.value = 'light';
    expect(box.getAttribute('data-usa-surface')).toBe('light');
    expect(ch).toHaveBeenCalledTimes(2);
    s.remove();
    const s2 = mount<any>('<usa-theme-switcher target="#app" persist="t-key"></usa-theme-switcher>');
    expect(s2.value).toBe('light');
  });
  it('theme surface: follows nearest theme, own theme wins, emits on change', async () => {
    configureComponents({ reducedMotion: 'reduce' });
    const wrap = document.createElement('div');
    wrap.setAttribute('data-usa-surface', 'neon');
    document.body.append(wrap);
    wrap.innerHTML = '<usa-theme-surface>x</usa-theme-surface><usa-theme-surface theme="neu">y</usa-theme-surface>';
    const [a, b] = wrap.querySelectorAll<any>('usa-theme-surface');
    expect(a.theme).toBe('neon');
    expect(a.getAttribute('data-look')).toBe('neon');
    expect(b.theme).toBe('neu');
    const ev = vi.fn();
    a.addEventListener('usa:theme', ev);
    wrap.setAttribute('data-usa-surface', 'glass');
    await new Promise((r) => setTimeout(r, 0));
    expect(a.theme).toBe('glass');
    expect(ev.mock.calls[0][0].detail.theme).toBe('glass');
    expect(b.theme).toBe('neu');
    b.setAttribute('theme', 'bogus');
    expect(b.theme).toBe('light');
  });
  it('surface pack: names, kinds, pulse stops, frost shine removed, reduced', async () => {
    expect(SF.map((e: any) => `${e.name}:${e.kind}`)).toEqual(['neon-ignite:enter', 'neon-pulse:loop', 'glass-frost:enter', 'neu-press:attention']);
    const el = document.createElement('div');
    document.body.append(el);
    const ctx: any = { reduced: false, sensitivity: 'normal', animate: vi.fn(() => null), onCleanup: vi.fn() };
    await SF[2].run(el, { duration: 100 }, ctx);
    expect(ctx.animate).toHaveBeenCalledTimes(2);
    expect(el.querySelectorAll('span').length).toBe(0);
    const cancel = vi.fn();
    const pctx: any = { ...ctx, animate: vi.fn(() => ({ cancel })) };
    const stop = SF[1].run(el, { color: '#0ff', duration: 100 }, pctx);
    (stop as any)();
    expect(cancel).toHaveBeenCalled();
    const rctx: any = { ...ctx, reduced: true, animate: vi.fn(() => null) };
    for (const fx of SF) await fx.run(el, { ...fx.defaults }, rctx);
    expect(rctx.animate).not.toHaveBeenCalled();
  });
});
