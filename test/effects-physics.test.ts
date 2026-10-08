import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { installComponentMocks, mount, anims } from './components-setup';
import { configureComponents } from '../src/components/base';
import { defineFxComponents, playEffect, bindEffect, getEffect } from '../src/components/fx';
import { registerAllEffects, registerPhysicsEffects, PHYSICS_FX, EFFECT_PACKS, solveSpring, springKeyframes, bounceKeyframes } from '../src/components/effects';

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  defineFxComponents();
  registerAllEffects();
});
afterEach(() => configureComponents({ reducedMotion: 'user' }));

describe('5.2 bounce & physics micro-interactions', () => {
  it('registers every physics effect (idempotent)', () => {
    registerPhysicsEffects();
    for (const d of PHYSICS_FX) expect(getEffect(d.name)).toBe(d);
    expect(PHYSICS_FX.map((d) => d.name)).toEqual(['bounce-in', 'rubber-band', 'elastic-hover', 'drop-bounce', 'gravity-text', 'spring-follow', 'bell-swing']);
    expect(EFFECT_PACKS.physics).toBe(PHYSICS_FX);
  });

  it('solveSpring settles at 1, overshoots when under-damped, is monotonic when over-damped', () => {
    const s = solveSpring({ stiffness: 200, damping: 8, steps: 30 });
    expect(s.values).toHaveLength(31);
    expect(s.values[0]).toBe(0);
    expect(s.values[30]).toBe(1);
    expect(Math.max(...s.values)).toBeGreaterThan(1);
    expect(s.duration).toBeGreaterThan(100);
    const o = solveSpring({ stiffness: 100, damping: 40 });
    expect(o.values.every((v, i) => i === 0 || v >= o.values[i - 1] - 1e-9)).toBe(true);
    expect(springKeyframes((p) => ({ opacity: p })).frames.at(-1)).toEqual({ opacity: 1 });
  });

  it('bounceKeyframes starts at the drop height, touches the floor and ends at rest', () => {
    const hs = bounceKeyframes(0.5, 60);
    expect(hs[0]).toBe(1);
    expect(hs.at(-1)).toBeCloseTo(0, 2);
    expect(hs.filter((h) => h < 0.02).length).toBeGreaterThan(2);
    expect(Math.max(...hs.slice(30))).toBeLessThan(0.5);
  });

  it('enter / attention effects animate with solver keyframes', () => {
    const el = mount<HTMLElement>('<div>x</div>');
    void playEffect(el, 'bounce-in');
    expect(anims.at(-1)!.keyframes.length).toBeGreaterThan(20);
    void playEffect(el, 'bell-swing');
    expect(el.style.transformOrigin).toBe('top center');
    void playEffect(el, 'drop-bounce', { height: 100 });
    expect((anims.at(-1)!.keyframes[0] as any).transform).toBe('translateY(-100.0px)');
  });

  it('gravity-text splits once, keeps an aria-label and staggers each character', () => {
    const p = mount<HTMLElement>('<p>Hi!</p>');
    const n = anims.length;
    void playEffect(p, 'gravity-text');
    void playEffect(p, 'gravity-text');
    expect(p.getAttribute('aria-label')).toBe('Hi!');
    expect(p.children).toHaveLength(3);
    expect(anims.length).toBe(n + 6);
  });

  it('persistent elastic-hover / spring-follow bind and clean up', () => {
    const wrap = mount<HTMLElement>('<div><span>o</span></div>');
    const dot = wrap.firstElementChild as HTMLElement;
    const off = bindEffect(dot, 'spring-follow', { trigger: 'load' });
    wrap.dispatchEvent(new MouseEvent('pointermove', { clientX: 10, clientY: 10 }));
    off();
    expect(dot.style.translate).toBe('');
    const n = anims.length;
    const off2 = bindEffect(wrap, 'elastic-hover', { trigger: 'load' });
    wrap.dispatchEvent(new Event('pointerenter'));
    expect(anims.length).toBe(n + 1);
    off2();
  });

  it('reduced motion: entrances fade, attention / cursor effects do nothing', () => {
    configureComponents({ reducedMotion: 'reduce' });
    const el = mount<HTMLElement>('<div>x</div>');
    void playEffect(el, 'drop-bounce');
    expect(anims.at(-1)!.keyframes).toEqual([{ opacity: 0 }, { opacity: 1 }]);
    const n = anims.length;
    void playEffect(el, 'rubber-band');
    void playEffect(el, 'bell-swing');
    bindEffect(el, 'spring-follow', { trigger: 'load' });
    expect(anims.length).toBe(n);
  });
});
