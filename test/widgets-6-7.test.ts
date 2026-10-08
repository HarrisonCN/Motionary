import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, mount, anims } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineWidgets, WIDGETS, pageWindow, SEGMENTED_VARIANTS, SWITCH_VARIANTS } from '../src/components/widgets';
import { TRANSITIONS2_FX, registerTransitionsPack, registerEffectPacks, EFFECT_PACKS, pageTransition, crossDocumentTransitions } from '../src/components/fx2';
import { getEffect, playEffect } from '../src/components/fx';
import { COMPONENT_ITEMS } from '../showcase/catalog-components.js';
import { COMPONENTS, componentSnippets } from '../showcase/components-catalog.js';
import { COMPONENT_ENTRIES } from '../scripts/categories.mjs';
import { readFileSync } from 'node:fs';

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  defineWidgets();
});
afterEach(() => {
  vi.unstubAllGlobals();
  configureComponents({ reducedMotion: 'user' });
});

describe('6.7 widgets', () => {
  it('ships stepper, pagination, segmented and switch', () => {
    expect(Object.keys(WIDGETS['6.7'])).toEqual(['usa-stepper', 'usa-pagination', 'usa-segmented', 'usa-switch']);
    for (const t of Object.keys(WIDGETS['6.7'])) expect(customElements.get(t)).toBeTruthy();
    expect(SEGMENTED_VARIANTS).toEqual(['ios', 'pill', 'outline']);
    expect(SWITCH_VARIANTS).toEqual(['ios', 'daynight', 'bounce', 'liquid']);
  });
  it('stepper marks done / current steps, fills the rail and emits change', () => {
    const s = mount<any>('<usa-stepper value="1"><span>A</span><span>B</span><span>C</span></usa-stepper>');
    expect(s.getAttribute('role')).toBe('list');
    expect(s.steps[0].hasAttribute('data-done')).toBe(true);
    expect(s.steps[1].getAttribute('aria-current')).toBe('step');
    expect(s.style.getPropertyValue('--usa-st-p')).toBe('50.00%');
    const seen: number[] = [];
    s.addEventListener('usa:change', (e: CustomEvent) => seen.push(e.detail.value));
    anims.length = 0;
    s.next();
    expect(s.value).toBe(2);
    expect(anims.length).toBeGreaterThan(0);
    s.next();
    expect(seen).toEqual([2]);
    s.prev();
    expect(s.steps[1].getAttribute('aria-current')).toBe('step');
  });
  it('pagination window, aria-current, disabled ends and change', () => {
    expect(pageWindow(1, 10)).toEqual([1, 2, '…', 10]);
    expect(pageWindow(5, 10)).toEqual([1, '…', 4, 5, 6, '…', 10]);
    expect(pageWindow(1, 1)).toEqual([1]);
    const p = mount<any>('<usa-pagination total="10" page="1"></usa-pagination>');
    expect(p.getAttribute('role')).toBe('navigation');
    expect(p.querySelector('[aria-current="page"]').textContent).toBe('1');
    expect(p.querySelector('.usa-pg-prev').disabled).toBe(true);
    let got = 0;
    p.addEventListener('usa:change', (e: CustomEvent) => (got = e.detail.page));
    (p.querySelector('.usa-pg-next') as HTMLButtonElement).click();
    expect(got).toBe(2);
    p.page = 10;
    expect(p.querySelector('.usa-pg-next').disabled).toBe(true);
    expect(p.querySelectorAll('.usa-pg-gap').length).toBe(1);
  });
  it('segmented is a radio group with arrow keys', () => {
    const s = mount<any>('<usa-segmented><button>A</button><button>B</button><button>C</button></usa-segmented>');
    expect(s.getAttribute('role')).toBe('radiogroup');
    expect(s.segments[0].getAttribute('aria-checked')).toBe('true');
    let label = '';
    s.addEventListener('usa:change', (e: CustomEvent) => (label = e.detail.label));
    s.segments[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(s.value).toBe(1);
    expect(label).toBe('B');
    s.segments[2].click();
    expect(s.segments[2].tabIndex).toBe(0);
    expect(s.segments[1].tabIndex).toBe(-1);
  });
  it('switch toggles aria-checked, form value, disabled and reduced motion', () => {
    const w = mount<any>('<usa-switch variant="bounce" name="dark"></usa-switch>');
    expect(w.getAttribute('role')).toBe('switch');
    expect(w.getAttribute('aria-checked')).toBe('false');
    const input = w.querySelector('input[type=hidden]') as HTMLInputElement;
    expect(input.disabled).toBe(true);
    anims.length = 0;
    w.click();
    expect(w.checked).toBe(true);
    expect(input.disabled).toBe(false);
    expect(input.value).toBe('on');
    expect(anims.length).toBe(1);
    w.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    expect(w.checked).toBe(false);
    w.setAttribute('disabled', '');
    w.click();
    expect(w.checked).toBe(false);
    installComponentMocks({ reducedMotion: true });
    const r = mount<any>('<usa-switch variant="bounce"></usa-switch>');
    anims.length = 0;
    r.click();
    expect(r.checked).toBe(true);
    expect(anims.length).toBe(0);
    expect(r.hasAttribute('data-animate')).toBe(false);
  });
});

describe('Transitions 2.0 (fx-transitions)', () => {
  it('registers 6 page effects (also via registerEffectPacks) and is its own entry', () => {
    registerTransitionsPack();
    registerEffectPacks();
    expect(TRANSITIONS2_FX.map((d) => d.name)).toEqual(['ripple-dissolve', 'shatter', 'mosaic-flip', 'liquid-wipe', 'page-curl', 'camera-dolly']);
    for (const d of TRANSITIONS2_FX) {
      expect(getEffect(d.name)).toBe(d);
      expect(d.kind).toBe('page');
    }
    expect(EFFECT_PACKS.transitions).toBe(TRANSITIONS2_FX);
    expect(COMPONENT_ENTRIES['fx-transitions']).toBe('fx2/transitions2');
  });
  it('shatter / mosaic-flip animate clipped pieces and clean them up', async () => {
    registerTransitionsPack();
    const el = mount<HTMLElement>('<div id="x">Hello</div>');
    anims.length = 0;
    const p = playEffect(el, 'mosaic-flip', { cols: 3, rows: 2 });
    expect(el.querySelectorAll('[aria-hidden="true"] > div').length).toBe(6);
    expect(anims.length).toBe(6);
    expect(el.querySelector('[aria-hidden] #x')).toBeNull();
    anims.forEach((a: any) => a.finish?.());
    await p;
    await new Promise((r) => setTimeout(r, 0));
    expect(el.querySelector('[aria-hidden="true"]')).toBeNull();
    expect(el.style.visibility).toBe('');
  });
  it('liquid-wipe / ripple-dissolve / page-curl / camera-dolly animate the element; reduced motion fades', () => {
    registerTransitionsPack();
    const el = mount<HTMLElement>('<div>x</div>');
    for (const n of ['liquid-wipe', 'ripple-dissolve', 'page-curl', 'camera-dolly']) {
      anims.length = 0;
      playEffect(el, n);
      expect(anims.length, n).toBe(1);
    }
    installComponentMocks({ reducedMotion: true });
    const r = mount<HTMLElement>('<div>y</div>');
    anims.length = 0;
    playEffect(r, 'shatter');
    expect(anims.length).toBe(1);
    expect(r.children.length).toBe(0);
  });
  it('pageTransition uses startViewTransition when available, else update + effect; crossDocumentTransitions adds and removes a style', async () => {
    registerTransitionsPack();
    const upd = vi.fn();
    (document as any).startViewTransition = (cb: () => void) => (cb(), { ready: Promise.resolve(), finished: Promise.resolve() });
    (document.documentElement as any).animate = vi.fn();
    await pageTransition(upd, 'liquid-wipe');
    expect(upd).toHaveBeenCalledTimes(1);
    expect((document.documentElement as any).animate).toHaveBeenCalled();
    delete (document as any).startViewTransition;
    document.body.innerHTML = '<main>m</main>';
    const upd2 = vi.fn();
    void pageTransition(upd2, 'camera-dolly');
    await new Promise((r) => setTimeout(r, 0));
    expect(upd2).toHaveBeenCalledTimes(1);
    const rm = crossDocumentTransitions('page-curl');
    expect(document.querySelector('style[data-usa-vt="page-curl"]')!.textContent).toContain('@view-transition{navigation:auto}');
    rm();
    expect(document.querySelector('style[data-usa-vt]')).toBeNull();
  });
});

describe('6.7 showcase + Store + docs', () => {
  it('gallery cards and Store entries for every 6.7 widget and pack', () => {
    for (const tag of Object.keys(WIDGETS['6.7'])) {
      const card: any = COMPONENTS.find((c: any) => c.tag === tag);
      expect(card, tag).toBeTruthy();
      expect(card.since).toBe('6.7');
      expect(componentSnippets(card).esm).toContain(card.define);
    }
    expect(componentSnippets(COMPONENTS.find((c: any) => c.id === 'fx-shatter')).esm).toContain("from 'motionary/components/fx-transitions'");
    for (const id of ['stepper', 'pagination', 'segmented', 'switch', 'fx-ripple-wipe', 'fx-shatter', 'fx-curl']) expect(COMPONENT_ITEMS.some((i: any) => i.gallery === id), id).toBe(true);
    const doc = readFileSync('docs/components.md', 'utf8');
    for (const s of ['<usa-stepper', '<usa-pagination', '<usa-segmented', '<usa-switch', 'fx-transitions', 'pageTransition']) expect(doc).toContain(s);
  });
});
