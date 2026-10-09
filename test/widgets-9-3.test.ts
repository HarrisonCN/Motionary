import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, mount, anims, tick } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineWidgets, WIDGETS, backgroundCss } from '../src/components/widgets';
import { registerEffectPacks, EFFECT_PACKS, GENART_FX, registerGenArtPack } from '../src/components/fx2';
import { getEffect, playEffect } from '../src/components/fx';
import { COMPONENT_ITEMS } from '../showcase/catalog-components.js';
import { COMPONENTS, componentSnippets } from '../showcase/components-catalog.js';
import { COMPONENT_ENTRIES } from '../scripts/categories.mjs';
import { readFileSync } from 'node:fs';
import { GENART_FX as GA, PALETTES, seededRandom, meshGradient } from '../src/components/fx2';

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

describe('9.3 release', () => {
  it('ships its widgets', () => {
    expect(Object.keys(WIDGETS['9.3'])).toEqual(["usa-gen-art", "usa-bg-generator"]);
    for (const t of Object.keys(WIDGETS['9.3'])) expect(customElements.get(t)).toBeTruthy();
  });
  it('registers its effect packs (also via registerEffectPacks) as their own entries', () => {
    registerGenArtPack();
    registerEffectPacks();
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    for (const def of GENART_FX) expect(getEffect(def.name)).toBe(def);
    expect(EFFECT_PACKS['genart']).toBe(GENART_FX);
    expect(COMPONENT_ENTRIES['fx-genart']).toBe('fx2/genart');
    expect(pkg.exports['./fx/genart'].import.default).toBe('./dist/components/fx-genart.js');
  });
  it('gallery cards with copyable code, Store entries and docs', () => {
    for (const tag of Object.keys(WIDGETS['9.3'])) {
      const card: any = COMPONENTS.find((c: any) => c.tag === tag);
      expect(card, tag).toBeTruthy();
      expect(card.since).toBe('9.3');
      expect(componentSnippets(card).esm).toContain(card.define);
    }
    expect(componentSnippets(COMPONENTS.find((c: any) => c.id === 'fx-halftone')).esm).toContain("from 'motionary/components/fx-genart'");
    for (const id of ["gen-art", "bg-generator", "fx-halftone", "fx-mesh"]) expect(COMPONENT_ITEMS.some((i: any) => i.gallery === id), id).toBe(true);
    const doc = readFileSync('docs/components.md', 'utf8');
    for (const s of ["<usa-gen-art", "<usa-bg-generator", "motionary/fx/genart"]) expect(doc).toContain(s);
  });
});


describe('9.3 generative art', () => {
  it('seededRandom, meshGradient, backgroundCss', () => {
    const a = seededRandom(5);
    const b = seededRandom(5);
    const xs = [a(), a(), a()];
    expect([b(), b(), b()]).toEqual(xs);
    expect(xs.every((x) => x >= 0 && x < 1)).toBe(true);
    expect(meshGradient(3, 'ocean')).toBe(meshGradient(3, 'ocean'));
    expect(meshGradient(3, 'ocean')).not.toBe(meshGradient(4, 'ocean'));
    expect(meshGradient(3, 'ocean').endsWith(PALETTES.ocean[0])).toBe(true);
    expect(meshGradient(1, 'nope')).toContain(PALETTES.sunset[0]);
    expect(backgroundCss('dots', 1, 'mono')).toContain('22px 22px');
    expect(backgroundCss('grain', 1, 'mono')).toContain('feTurbulence');
  });
  it('<usa-gen-art>: img label, art fallback, generate + event', () => {
    configureComponents({ reducedMotion: 'reduce' });
    const g = mount<any>('<usa-gen-art art="waves" seed="9"></usa-gen-art>');
    expect(g.getAttribute('role')).toBe('img');
    expect(g.getAttribute('aria-label')).toBe('Generative waves artwork, seed 9');
    expect(g.seed).toBe(9);
    const ev = vi.fn();
    g.addEventListener('usa:generate', ev);
    g.generate(42);
    expect(g.seed).toBe(42);
    expect(g.getAttribute('aria-label')).toContain('seed 42');
    expect(ev.mock.calls[0][0].detail.seed).toBe(42);
    g.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(ev).toHaveBeenCalledTimes(2);
    expect(mount<any>('<usa-gen-art art="bogus"></usa-gen-art>').getAttribute('data-art')).toBe('flow');
  });
  it('<usa-bg-generator>: controls, change, shuffle, copy', async () => {
    configureComponents({ reducedMotion: 'reduce' });
    const g = mount<any>('<usa-bg-generator palette="ocean" seed="2"></usa-bg-generator>');
    expect(g.getAttribute('role')).toBe('group');
    expect(g.css).toBe(`background: ${backgroundCss('mesh', 2, 'ocean')};`);
    expect(g.querySelector('.usa-bg-code').textContent).toBe(g.css);
    const ev = vi.fn();
    g.addEventListener('usa:change', ev);
    const st = g.querySelector('[data-k=style]');
    st.value = 'stripes';
    st.dispatchEvent(new Event('change', { bubbles: true }));
    expect(g.css).toContain('repeating-linear-gradient');
    g.shuffle();
    expect(ev).toHaveBeenCalledTimes(2);
    const writeText = vi.fn(async () => undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    expect(await g.copy()).toBe(true);
    expect(writeText.mock.calls[0][0]).toBe(g.css);
  });
  it('genart pack: names, kinds, loops stop and clean up, reduced', async () => {
    expect(GA.map((e: any) => `${e.name}:${e.kind}`)).toEqual(['halftone-in:enter', 'mesh-drift:loop', 'kaleido:loop', 'grain-flicker:loop']);
    const el = document.createElement('div');
    document.body.append(el);
    const cancel = vi.fn();
    const ctx: any = { reduced: false, sensitivity: 'normal', animate: vi.fn(() => ({ cancel, finished: Promise.resolve() })), onCleanup: vi.fn() };
    for (const i of [1, 2, 3]) (GA[i].run(el, { ...GA[i].defaults }, ctx) as any)();
    expect(cancel).toHaveBeenCalledTimes(3);
    expect(el.querySelectorAll('span').length).toBe(0);
    await GA[0].run(el, { dot: 8, duration: 100 }, ctx);
    expect(ctx.animate.mock.calls.at(-1)[1].length).toBe(7);
    const rctx: any = { ...ctx, reduced: true, animate: vi.fn(() => null) };
    for (const i of [1, 2, 3]) expect(GA[i].run(el, { ...GA[i].defaults }, rctx)).toBeUndefined();
    expect(rctx.animate).not.toHaveBeenCalled();
  });
});
