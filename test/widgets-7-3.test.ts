import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, mount, anims, tick } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineWidgets, WIDGETS, cartTotal, splitTime, wrapIndex } from '../src/components/widgets';
import { registerEffectPacks, EFFECT_PACKS, SHOP_FX, registerShopPack } from '../src/components/fx2';
import { getEffect, playEffect } from '../src/components/fx';
import { COMPONENT_ITEMS } from '../showcase/catalog-components.js';
import { COMPONENTS, componentSnippets } from '../showcase/components-catalog.js';
import { COMPONENT_ENTRIES } from '../scripts/categories.mjs';
import { readFileSync } from 'node:fs';
import { SHOP_FX, registerShopPack, arcPath } from '../src/components/fx2';
import { cartTotal, wrapIndex, splitTime } from '../src/components/widgets';

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

describe('7.3 release', () => {
  it('ships its widgets', () => {
    expect(Object.keys(WIDGETS['7.3'])).toEqual(["usa-add-to-cart", "usa-cart-drawer", "usa-product-gallery", "usa-countdown"]);
    for (const t of Object.keys(WIDGETS['7.3'])) expect(customElements.get(t)).toBeTruthy();
  });
  it('registers its effect packs (also via registerEffectPacks) as their own entries', () => {
    registerShopPack();
    registerEffectPacks();
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    for (const def of SHOP_FX) expect(getEffect(def.name)).toBe(def);
    expect(EFFECT_PACKS['shop']).toBe(SHOP_FX);
    expect(COMPONENT_ENTRIES['fx-shop']).toBe('fx2/shop');
    expect(pkg.exports['./fx/shop'].import.default).toBe('./dist/components/fx-shop.js');
  });
  it('gallery cards with copyable code, Store entries and docs', () => {
    for (const tag of Object.keys(WIDGETS['7.3'])) {
      const card: any = COMPONENTS.find((c: any) => c.tag === tag);
      expect(card, tag).toBeTruthy();
      expect(card.since).toBe('7.3');
      expect(componentSnippets(card).esm).toContain(card.define);
    }
    expect(componentSnippets(COMPONENTS.find((c: any) => c.id === 'fx-cart')).esm).toContain("from 'motionary/components/fx-shop'");
    for (const id of ["add-to-cart", "cart-drawer", "product-gallery", "countdown", "fx-cart", "fx-price"]) expect(COMPONENT_ITEMS.some((i: any) => i.gallery === id), id).toBe(true);
    const doc = readFileSync('docs/components.md', 'utf8');
    for (const s of ["<usa-add-to-cart", "<usa-cart-drawer", "<usa-product-gallery", "<usa-countdown", "motionary/fx/shop"]) expect(doc).toContain(s);
  });
});


describe('7.3 widgets behave', () => {
  it('cart drawer: add merges quantities, total, badge label, dialog toggles', () => {
    configureComponents({ reducedMotion: 'reduce' });
    const c = mount<any>('<usa-cart-drawer currency="€"></usa-cart-drawer>');
    c.add({ id: 'a', name: 'A', price: 10 });
    c.add({ id: 'a', name: 'A', price: 10 });
    c.add({ name: 'B', price: 2.5 });
    expect(c.count).toBe(3);
    expect(c.total).toBe(22.5);
    expect(c.querySelector('.usa-cd2-total').textContent).toBe('€22.50');
    expect(c.querySelector('.usa-cd2-toggle').getAttribute('aria-label')).toBe('Cart, 3 items');
    expect(c.querySelectorAll('.usa-cd2-item').length).toBe(2);
    const panel = c.querySelector('.usa-cd2-panel');
    expect(panel.hidden).toBe(true);
    c.toggle(true);
    expect(panel.hidden).toBe(false);
    expect(panel.getAttribute('role')).toBe('dialog');
    c.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(c.open).toBe(false);
    c.removeItem("a");
    expect(c.count).toBe(1);
    expect(cartTotal([{ name: 'x', price: 1.1, qty: 3 }])).toBe(3.3);
  });
  it('add-to-cart: adds its item to a <usa-cart-drawer>, morphs, announces and emits', () => {
    configureComponents({ reducedMotion: 'reduce' });
    const c = mount<any>('<usa-cart-drawer id="cx"></usa-cart-drawer>');
    const b = mount<any>('<usa-add-to-cart cart="#cx" item=\'{"name":"Shoe","price":89}\'>Buy</usa-add-to-cart>');
    const ev = vi.fn();
    b.addEventListener('usa:add', ev);
    b.querySelector('button').click();
    expect(c.count).toBe(1);
    expect(b.hasAttribute('data-added')).toBe(true);
    expect(b.querySelector('.usa-atc-live').textContent).toBe('Added to cart');
    expect(b.querySelector('.usa-atc-label').textContent).toBe('Buy');
    expect(ev).toHaveBeenCalledTimes(1);
  });
  it('product gallery: thumbnails as tabs, wraps, labels the stage, emits change', () => {
    configureComponents({ reducedMotion: 'reduce' });
    const g = mount<any>('<usa-product-gallery><img src="a.png" alt="Front"><img src="b.png" alt="Side"><img src="c.png" alt="Back"></usa-product-gallery>');
    expect(g.count).toBe(3);
    expect(g.querySelectorAll('[role="tab"]').length).toBe(3);
    expect(g.querySelector('.usa-pg2-stage').getAttribute('aria-label')).toBe('Image 1 of 3: Front');
    const ev = vi.fn();
    g.addEventListener('usa:change', ev);
    g.prev();
    expect(g.index).toBe(2);
    expect(g.querySelector('.usa-pg2-main').getAttribute('src')).toBe('c.png');
    expect(g.querySelectorAll('[role="tab"]')[2].getAttribute('aria-selected')).toBe('true');
    g.querySelectorAll('[role="tab"]')[1].click();
    expect(g.index).toBe(1);
    expect(ev).toHaveBeenCalledTimes(2);
    expect(wrapIndex(-1, 4)).toBe(3);
    expect(wrapIndex(5, 0)).toBe(0);
  });
  it('countdown: splits time, timer role, minute-level label, done at zero', () => {
    vi.useFakeTimers();
    try {
      expect(splitTime(90061)).toEqual({ d: 1, h: 1, m: 1, s: 1 });
      const c = mount<any>('<usa-countdown seconds="2" units="m,s"></usa-countdown>');
      expect(c.getAttribute('role')).toBe('timer');
      expect(c.querySelectorAll('.usa-cd-unit').length).toBe(2);
      expect(c.getAttribute('aria-label')).toMatch(/^Time left: /);
      const done = vi.fn();
      c.addEventListener('usa:done', done);
      vi.advanceTimersByTime(3500);
      expect(c.hasAttribute('data-done')).toBe(true);
      expect(done).toHaveBeenCalledTimes(1);
      c.setAttribute('seconds', '30');
      expect(c.hasAttribute('data-done')).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('e-commerce motion pack', () => {
  it('arcPath starts and ends at the points and lifts in the middle', () => {
    const p = arcPath(0, 0, 100, 0, 50, 4);
    expect(p[0]).toEqual({ x: 0, y: 0 });
    expect(p[4]).toEqual({ x: 100, y: 0 });
    expect(p[2].y).toBeLessThan(0);
  });
  it('registers 5 effects with the right kinds; reduced stock-pulse is skipped and price-flip sets text', () => {
    registerShopPack();
    expect(SHOP_FX.map((d) => d.name).sort()).toEqual(['badge-pop', 'fly-to-cart', 'price-flip', 'sale-shine', 'stock-pulse']);
    expect(getEffect('fly-to-cart')?.kind).toBe('click');
    expect(getEffect('stock-pulse')?.reduced).toBe('skip');
    const el = mount<HTMLElement>('<span data-from="9.99">$5.00</span>');
    getEffect('price-flip')!.run(el, { ...getEffect('price-flip')!.defaults }, ctx(true));
    expect(el.textContent).toBe('$5.00');
  });
});
