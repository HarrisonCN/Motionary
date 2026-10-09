import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, mount, anims, tick } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineWidgets, WIDGETS } from '../src/components/widgets';
import { registerEffectPacks, EFFECT_PACKS, ORGANIC_FX, registerOrganicPack } from '../src/components/fx2';
import { getEffect, playEffect } from '../src/components/fx';
import { COMPONENT_ITEMS } from '../showcase/catalog-components.js';
import { COMPONENTS, componentSnippets } from '../showcase/components-catalog.js';
import { COMPONENT_ENTRIES } from '../scripts/categories.mjs';
import { readFileSync } from 'node:fs';
import { ORGANIC_FX as ORG, blobRadius } from '../src/components/fx2';

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

describe('8.3 release', () => {
  it('ships its widgets', () => {
    expect(Object.keys(WIDGETS['8.3'])).toEqual(["usa-organic-card", "usa-liquid-nav"]);
    for (const t of Object.keys(WIDGETS['8.3'])) expect(customElements.get(t)).toBeTruthy();
  });
  it('registers its effect packs (also via registerEffectPacks) as their own entries', () => {
    registerOrganicPack();
    registerEffectPacks();
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    for (const def of ORGANIC_FX) expect(getEffect(def.name)).toBe(def);
    expect(EFFECT_PACKS['organic']).toBe(ORGANIC_FX);
    expect(COMPONENT_ENTRIES['fx-organic']).toBe('fx2/organic');
    expect(pkg.exports['./fx/organic'].import.default).toBe('./dist/components/fx-organic.js');
  });
  it('gallery cards with copyable code, Store entries and docs', () => {
    for (const tag of Object.keys(WIDGETS['8.3'])) {
      const card: any = COMPONENTS.find((c: any) => c.tag === tag);
      expect(card, tag).toBeTruthy();
      expect(card.since).toBe('8.3');
      expect(componentSnippets(card).esm).toContain(card.define);
    }
    expect(componentSnippets(COMPONENTS.find((c: any) => c.id === 'fx-vine')).esm).toContain("from 'motionary/components/fx-organic'");
    for (const id of ["organic-card", "liquid-nav", "fx-vine", "fx-drop"]) expect(COMPONENT_ITEMS.some((i: any) => i.gallery === id), id).toBe(true);
    const doc = readFileSync('docs/components.md', 'utf8');
    for (const s of ["<usa-organic-card", "<usa-liquid-nav", "motionary/fx/organic"]) expect(doc).toContain(s);
  });
});


describe('8.3 widgets behave', () => {
  it('organic card: tint, blob shape, morph', () => {
    configureComponents({ reducedMotion: 'reduce' });
    expect(blobRadius(3)).toMatch(/^\d+% \d+% \d+% \d+% \/ \d+% \d+% \d+% \d+%$/);
    expect(blobRadius(3)).toBe(blobRadius(3));
    expect(blobRadius(3)).not.toBe(blobRadius(4));
    const c = mount<any>('<usa-organic-card tint="petal" seed="2"><p>Hi</p></usa-organic-card>');
    expect(c.getAttribute('data-tint')).toBe('petal');
    expect(c.style.borderRadius).toBe(blobRadius(2));
    c.morph(9);
    expect(c.style.borderRadius).toBe(blobRadius(9));
    expect(c.querySelector('p').textContent).toBe('Hi');
    const d = mount<any>('<usa-organic-card tint="nope"></usa-organic-card>');
    expect(d.getAttribute('data-tint')).toBe('leaf');
  });
  it('liquid nav: navigation role, aria-current, click + keys, change event', () => {
    configureComponents({ reducedMotion: 'reduce' });
    const n = mount<any>('<usa-liquid-nav label="Primary"><a href="#a">A</a><a href="#b" aria-current="page">B</a><a href="#c">C</a></usa-liquid-nav>');
    expect(n.getAttribute('role')).toBe('navigation');
    expect(n.getAttribute('aria-label')).toBe('Primary');
    expect(n.value).toBe(1);
    const links = n.querySelectorAll('a');
    const ch = vi.fn();
    n.addEventListener('usa:change', ch);
    links[2].addEventListener('click', (e: Event) => e.preventDefault());
    links[2].click();
    expect(n.value).toBe(2);
    expect(links[2].getAttribute('aria-current')).toBe('page');
    expect(links[1].hasAttribute('aria-current')).toBe(false);
    expect(ch.mock.calls[0][0].detail.index).toBe(2);
    links[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(document.activeElement).toBe(links[0]);
    n.value = 0;
    expect(links[0].getAttribute('aria-current')).toBe('page');
    expect(ch).toHaveBeenCalledTimes(1);
    expect(n.querySelector('.usa-lq-goo').getAttribute('aria-hidden')).toBe('true');
  });
  it('organic pack: names, kinds, bloom staggers petals, drop rings cleaned, breathe stops', async () => {
    expect(ORG.map((e: any) => `${e.name}:${e.kind}`)).toEqual(['vine-grow:enter', 'bloom:enter', 'water-drop:attention', 'breathe:loop']);
    const el = document.createElement('div');
    el.innerHTML = '<i></i><i></i><i></i>';
    document.body.append(el);
    const ctx: any = { reduced: false, sensitivity: 'normal', animate: vi.fn(() => null), onCleanup: vi.fn() };
    await ORG[1].run(el, { stagger: 50, duration: 100 }, ctx);
    expect(ctx.animate.mock.calls.map((c: any) => c[2].delay)).toEqual([0, 50, 100]);
    const dctx: any = { ...ctx, animate: vi.fn(() => null) };
    await ORG[2].run(el, { rings: 2, color: 'blue', duration: 100 }, dctx);
    expect(dctx.animate).toHaveBeenCalledTimes(3);
    expect(el.querySelectorAll('span').length).toBe(0);
    const cancel = vi.fn();
    const bctx: any = { ...ctx, animate: vi.fn(() => ({ cancel })) };
    const stop = ORG[3].run(el, { duration: 1000 }, bctx);
    expect(bctx.animate.mock.calls[0][1].length).toBe(5);
    (stop as any)();
    expect(cancel).toHaveBeenCalled();
    const rctx: any = { ...ctx, reduced: true, animate: vi.fn(() => null) };
    await ORG[0].run(el, { duration: 100 }, rctx);
    expect(rctx.animate).not.toHaveBeenCalled();
  });
});
