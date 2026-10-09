import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, mount, anims, tick } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineWidgets, WIDGETS } from '../src/components/widgets';
import { registerAllPlugins, EFFECT_PACKS, SPATIAL_FX, registerSpatialPack } from '../src/components/fx2';
import { getEffect, playEffect } from '../src/components/fx';
import { COMPONENT_ITEMS } from '../showcase/catalog-components.js';
import { COMPONENTS, componentSnippets } from '../showcase/components-catalog.js';
import { COMPONENT_ENTRIES } from '../scripts/categories.mjs';
import { readFileSync } from 'node:fs';
import { SPATIAL_FX as SP, yawToOffset, xrSupport } from '../src/components/fx2';

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

describe('8.8 release', () => {
  it('ships its widgets', () => {
    expect(Object.keys(WIDGETS['8.8'])).toEqual(["usa-panorama", "usa-spatial-card"]);
    for (const t of Object.keys(WIDGETS['8.8'])) expect(customElements.get(t)).toBeTruthy();
  });
  it('registers its effect packs (also via registerAllPlugins) as their own entries', () => {
    registerSpatialPack();
    registerAllPlugins();
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    for (const def of SPATIAL_FX) expect(getEffect(def.name)).toBe(def);
    expect(EFFECT_PACKS['spatial']).toBe(SPATIAL_FX);
    expect(COMPONENT_ENTRIES['fx-spatial']).toBe('fx2/spatial');
    expect(pkg.exports['./fx/spatial'].import.default).toBe('./dist/components/fx-spatial.js');
  });
  it('gallery cards with copyable code, Store entries and docs', () => {
    for (const tag of Object.keys(WIDGETS['8.8'])) {
      const card: any = COMPONENTS.find((c: any) => c.tag === tag);
      expect(card, tag).toBeTruthy();
      expect(card.since).toBe('8.8');
      expect(componentSnippets(card).esm).toContain(card.define);
    }
    expect(componentSnippets(COMPONENTS.find((c: any) => c.id === 'fx-portal')).esm).toContain("from 'motionary/components/fx-spatial'");
    for (const id of ["panorama", "spatial-card", "fx-portal", "fx-spatial-float"]) expect(COMPONENT_ITEMS.some((i: any) => i.gallery === id), id).toBe(true);
    const doc = readFileSync('docs/components.md', 'utf8');
    for (const s of ["<usa-panorama", "<usa-spatial-card", "motionary/fx/spatial"]) expect(doc).toContain(s);
  });
});


describe('8.8 widgets behave', () => {
  it('spatial helpers', async () => {
    expect(yawToOffset(0, 1000)).toBe(-0);
    expect(yawToOffset(90, 1000)).toBe(-250);
    expect(yawToOffset(-90, 1000)).toBe(-750);
    expect(yawToOffset(450, 1000)).toBe(-250);
    expect(yawToOffset(10, 0)).toBe(0);
    expect(await xrSupport()).toBe('none');
    vi.stubGlobal('navigator', { xr: { isSessionSupported: async (m: string) => m === 'immersive-ar' } });
    expect(await xrSupport()).toBe('immersive-ar');
  });
  it('panorama: img role, procedural scene, keys + look event, compass, XR badge hidden', () => {
    configureComponents({ reducedMotion: 'reduce' });
    const p = mount<any>('<usa-panorama label="Valley"></usa-panorama>');
    expect(p.getAttribute('role')).toBe('img');
    expect(p.getAttribute('aria-label')).toBe('Valley');
    expect(p.tabIndex).toBe(0);
    expect(p.querySelector('.usa-pano-procedural')).not.toBeNull();
    expect(p.querySelector('.usa-pano-xr').hidden).toBe(true);
    const ev = vi.fn();
    p.addEventListener('usa:look', ev);
    p.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(p.yaw).toBe(345);
    expect(ev.mock.calls[0][0].detail.yaw).toBe(345);
    p.yaw = 400;
    expect(p.yaw).toBe(40);
    expect(p.querySelector('.usa-pano-compass i').style.transform).toBe('rotate(-40deg)');
    const q = mount<any>('<usa-panorama src="a.jpg"></usa-panorama>');
    expect(q.querySelector('.usa-pano-view').style.backgroundImage).toContain('a.jpg');
    expect(q.getAttribute('aria-label')).toBe('360° panorama');
  });
  it('spatial card: gaze layer, ornament, active on enter/focus', () => {
    configureComponents({ reducedMotion: 'reduce' });
    const c = mount<any>('<usa-spatial-card><button>x</button><nav slot="ornament"><button>y</button></nav></usa-spatial-card>');
    expect(c.querySelector('.usa-sp-gaze').getAttribute('aria-hidden')).toBe('true');
    expect(c.querySelector('[slot=ornament]').classList.contains('usa-sp-ornament')).toBe(true);
    const ev = vi.fn();
    c.addEventListener('usa:focus-depth', ev);
    c.dispatchEvent(new Event('pointerenter'));
    expect(c.active).toBe(true);
    expect(c.hasAttribute('data-active')).toBe(true);
    c.dispatchEvent(new Event('pointerleave'));
    expect(c.active).toBe(false);
    c.querySelector('button').dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    expect(c.active).toBe(true);
    expect(ev).toHaveBeenCalledTimes(3);
  });
  it('spatial pack: names, kinds, ring cleaned, float stops, reduced', async () => {
    expect(SP.map((e: any) => `${e.name}:${e.kind}`)).toEqual(['portal-open:enter', 'orbit-in:enter', 'spatial-float:loop', 'depth-pop:attention']);
    const el = document.createElement('div');
    document.body.append(el);
    const ctx: any = { reduced: false, sensitivity: 'normal', animate: vi.fn(() => null), onCleanup: vi.fn() };
    await SP[0].run(el, { color: '#fff', duration: 100 }, ctx);
    expect(ctx.animate).toHaveBeenCalledTimes(2);
    expect(el.querySelectorAll('span').length).toBe(0);
    const cancel = vi.fn();
    const fctx: any = { ...ctx, animate: vi.fn(() => ({ cancel })) };
    (SP[2].run(el, { duration: 100 }, fctx) as any)();
    expect(cancel).toHaveBeenCalled();
    const octx: any = { ...ctx, animate: vi.fn(() => null) };
    await SP[1].run(el, { from: 'right', duration: 100 }, octx);
    expect(octx.animate.mock.calls[0][1][0].transform).toContain('translateX(60%)');
    const rctx: any = { ...ctx, reduced: true, animate: vi.fn(() => null) };
    for (const fx of SP) await fx.run(el, { ...fx.defaults }, rctx);
    expect(rctx.animate).not.toHaveBeenCalled();
  });
});
