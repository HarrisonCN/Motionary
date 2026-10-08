import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { installComponentMocks, mount, anims } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineFxComponents, playEffect, bindEffect, getEffect, listEffects } from '../src/components/fx';
import { registerAllEffects, registerCardClickEffects, CARD_FX, CLICK_FX, EFFECT_PACKS } from '../src/components/effects';

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  defineFxComponents();
  registerAllEffects();
});
afterEach(() => configureComponents({ reducedMotion: 'user' }));

const layer = () => document.querySelector('[data-usa-fx-layer]');

describe('5.1 card & click effects 2.0', () => {
  it('registers through the 5.0 registry (idempotent)', () => {
    registerCardClickEffects();
    registerAllEffects();
    for (const d of [...CARD_FX, ...CLICK_FX]) expect(getEffect(d.name)).toBe(d);
    expect(listEffects('click').map((d) => d.name)).toEqual(expect.arrayContaining(['shockwave', 'ink-splash', 'star-burst', 'jelly-press', 'ring-ripple', 'emoji-rain']));
    expect(Object.keys(EFFECT_PACKS)).toContain('cards-click');
  });

  it('click effects spawn aria-hidden particles at the click point in a fixed layer', () => {
    const btn = document.createElement('button');
    document.body.append(btn);
    for (const name of ['shockwave', 'ink-splash', 'star-burst', 'ring-ripple', 'emoji-rain']) {
      const before = layer()?.childElementCount ?? 0;
      void playEffect(btn, name, {}, new MouseEvent('click', { clientX: 40, clientY: 30 }));
      expect(layer()!.childElementCount, name).toBeGreaterThan(before);
    }
    expect(layer()!.getAttribute('aria-hidden')).toBe('true');
    expect((layer()!.lastElementChild as HTMLElement).style.left).toBe('40px');
  });

  it('card effects animate the card / its children; holo is persistent and cleans up', () => {
    const card = mount<HTMLElement>('<div><i>a</i><i>b</i><i>c</i></div>');
    const n = anims.length;
    void playEffect(card, 'card-fan');
    expect(anims.length).toBe(n + 3);
    void playEffect(card, 'topple');
    expect(card.style.transformOrigin).toBe('bottom center');
    const unbind = bindEffect(card, 'holo', { trigger: 'hover' });
    card.dispatchEvent(new Event('pointerenter'));
    card.dispatchEvent(new Event('pointerenter'));
    expect(card.querySelectorAll('span[aria-hidden="true"]').length).toBe(1); // replaced, not stacked
    unbind();
    expect(card.querySelectorAll('span[aria-hidden="true"]').length).toBe(0);
  });

  it('reduced motion: particles are skipped, presses fade, loops do not start', () => {
    configureComponents({ reducedMotion: 'reduce' });
    const btn = document.createElement('button');
    document.body.append(btn);
    void playEffect(btn, 'shockwave');
    expect(layer()).toBeNull();
    void playEffect(btn, 'jelly-press');
    expect(anims[anims.length - 1].keyframes[1]).toEqual({ opacity: 0.7 });
    const n = anims.length;
    bindEffect(btn, 'float-tilt', { trigger: 'loop' });
    expect(anims.length).toBe(n);
  });

  it('<usa-fx> plays pack effects', () => {
    const el = mount<any>('<usa-fx effect="star-burst"><button>Go</button></usa-fx>');
    el.target.click();
    expect(layer()!.childElementCount).toBeGreaterThan(0);
  });
});
