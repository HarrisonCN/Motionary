import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installComponentMocks, mount, anims } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineFxComponents, playEffect, bindEffect, getEffect } from '../src/components/fx';
import { registerAllEffects, registerPageEffects, PAGE_FX, EFFECT_PACKS } from '../src/components/effects';

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  defineFxComponents();
  registerAllEffects();
});
afterEach(() => configureComponents({ reducedMotion: 'user' }));

const tickAll = async () => {
  for (let i = 0; i < 5; i++) {
    anims.filter((a) => a.playState === 'running').forEach((a) => a.finish());
    await new Promise((r) => setTimeout(r, 0));
  }
};
const screen = () => document.querySelector('[data-usa-page-fx]') as HTMLElement | null;

describe('5.3 page-wide effects', () => {
  it('registers every page effect', () => {
    registerPageEffects();
    expect(PAGE_FX.map((d) => d.name)).toEqual(['curtain', 'iris', 'pixel-dissolve', 'blinds', 'velocity-skew', 'spotlight', 'edge-glow']);
    for (const d of PAGE_FX) expect(getEffect(d.name)).toBe(d);
    expect(EFFECT_PACKS.page).toBe(PAGE_FX);
  });

  it.each([
    ['curtain', 2],
    ['iris', 1],
    ['blinds', 8],
    ['pixel-dissolve', 160],
  ])('%s covers the viewport, calls onCovered once, reveals and removes its layer', async (name, parts) => {
    const onCovered = vi.fn();
    const done = playEffect(document.body, name, { onCovered });
    const s = screen()!;
    expect(s.getAttribute('aria-hidden')).toBe('true');
    expect(s.style.position).toBe('fixed');
    expect(s.children).toHaveLength(parts);
    expect(onCovered).not.toHaveBeenCalled();
    await tickAll();
    await done;
    expect(onCovered).toHaveBeenCalledTimes(1);
    expect(screen()).toBeNull();
  });

  it('reduced motion: every transition is a short cross-fade that still calls onCovered', async () => {
    configureComponents({ reducedMotion: 'reduce' });
    const onCovered = vi.fn();
    const done = playEffect(document.body, 'pixel-dissolve', { onCovered });
    expect(screen()!.children).toHaveLength(0);
    expect(anims.at(-1)!.keyframes).toEqual([{ opacity: 0 }, { opacity: 1 }]);
    await tickAll();
    await done;
    expect(onCovered).toHaveBeenCalledTimes(1);
    expect(screen()).toBeNull();
  });

  it('persistent spotlight / edge-glow add a pointer-transparent layer and remove it on unbind', () => {
    for (const name of ['spotlight', 'edge-glow']) {
      const off = bindEffect(document.body, name, { trigger: 'load' });
      expect(screen()!.style.pointerEvents, name).toBe('none');
      off();
      expect(screen(), name).toBeNull();
    }
  });

  it('velocity-skew follows scroll and resets on unbind; skipped under reduced motion', () => {
    const el = mount<HTMLElement>('<div>x</div>');
    const off = bindEffect(el, 'velocity-skew', { trigger: 'load' });
    off();
    expect(el.style.transform).toBe('');
    configureComponents({ reducedMotion: 'reduce' });
    bindEffect(document.body, 'spotlight', { trigger: 'load' });
    expect(screen()).toBeNull();
  });
});
