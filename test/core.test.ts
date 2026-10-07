import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MockIO, installMocks, animations, fireAll } from './setup';

async function load(opts: { reducedMotion?: boolean } = {}) {
  vi.resetModules();
  installMocks(opts);
  return import('../src/index');
}

function el(html = '<div></div>'): HTMLElement {
  const wrap = document.createElement('div');
  wrap.innerHTML = html;
  const node = wrap.firstElementChild as HTMLElement;
  document.body.appendChild(node);
  return node;
}

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('observe / animate', () => {
  it('hides on observe and animates on enter', async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate();
    const node = el();
    const onStart = vi.fn();
    const onComplete = vi.fn();
    sa.observe(node, { onStart, onComplete });
    expect(node.style.opacity).toBe('0');
    fireAll([node], true);
    expect(animations).toHaveLength(1);
    expect(onStart).toHaveBeenCalledWith(node);
    animations[0].finish();
    expect(onComplete).toHaveBeenCalledWith(node);
    expect(animations[0].committed).toBe(true);
    expect(animations[0].cancelled).toBe(true);
  });

  it('shares one IntersectionObserver across elements with the same options', async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate();
    const nodes = [el(), el(), el()];
    sa.observe(nodes);
    expect(MockIO.instances).toHaveLength(1);
    expect(MockIO.instances[0].targets.size).toBe(3);
  });

  it('once: stops observing after first animation', async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate();
    const node = el();
    sa.observe(node);
    fireAll([node], true);
    expect(MockIO.instances[0].targets.has(node)).toBe(false);
  });

  it('repeat: re-hides on leave, cancels the old animation and replays', async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate();
    const node = el();
    sa.observe(node, { repeat: true });
    fireAll([node], true);
    fireAll([node], false);
    expect(animations[0].cancelled).toBe(true);
    expect(node.style.opacity).toBe('0');
    fireAll([node], true);
    expect(animations).toHaveLength(2);
  });

  it('passes threshold arrays through to the observer', async () => {
    const { createScrollAnimate } = await load();
    createScrollAnimate().observe(el(), { threshold: [0, 0.5, 1] });
    expect(MockIO.instances[0].options.threshold).toEqual([0, 0.5, 1]);
  });

  it('offset keeps other rootMargin sides and handles negative offsets', async () => {
    const { applyOffset } = await import('../src/core');
    expect(applyOffset('0px', 0)).toBe('0px');
    expect(applyOffset('0px', 100)).toBe('0px 0px -100px 0px');
    expect(applyOffset('10px 20px', 50)).toBe('10px 20px -40px 20px');
    expect(applyOffset('0px', -30)).toBe('0px 0px 30px 0px');
  });

  it('stagger is relative to the batch, not all registered siblings', async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate();
    const list = el('<ul><li></li><li></li><li></li><li></li></ul>');
    const items = Array.from(list.children);
    sa.observe(items, { stagger: 100 });
    fireAll(items.slice(0, 2), true);
    fireAll(items.slice(2), true);
    expect(animations.map((a) => a.timing.delay)).toEqual([0, 100, 0, 100]);
  });

  it('custom easing functions produce interpolated keyframes for any transform', async () => {
    const { createScrollAnimate } = await load();
    // Without CSS linear() support (newer jsdom implements CSS.supports).
    (globalThis as any).CSS = { supports: () => false };
    const sa = createScrollAnimate();
    const node = el();
    sa.animate(node, { animation: 'zoom-in', easing: (t) => t });
    delete (globalThis as any).CSS;
    const kf = animations[0].keyframes;
    expect(kf.length).toBe(31);
    expect(kf[15].transform).toBe('scale(0.9)');
    expect(kf[15].opacity).toBe(0.5);
  });

  it('uses linear() easing when supported', async () => {
    const mod = await load();
    (globalThis as any).CSS = { supports: () => true };
    const sa = mod.createScrollAnimate();
    sa.animate(el(), { easing: (t) => t * t });
    expect(String(animations[0].timing.easing)).toMatch(/^linear\(0, /);
    expect(animations[0].keyframes).toHaveLength(2);
    delete (globalThis as any).CSS;
  });

  it('falls back to ease when the easing string is invalid', async () => {
    const { createScrollAnimate } = await load();
    const orig = (Element.prototype as any).animate;
    (Element.prototype as any).animate = function (kf: any, t: any) {
      if (t.easing === 'bogus') throw new TypeError('invalid easing');
      return orig.call(this, kf, t);
    };
    createScrollAnimate().animate(el(), { easing: 'bogus' });
    expect(animations[0].timing.easing).toBe('ease');
  });
});

describe('parallax & progress', () => {
  it('keeps parallax running after the once-animation fires', async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate();
    const node = el();
    sa.observe(node, { parallax: { y: 100 } });
    fireAll([node], true);
    animations[0].finish();
    const progress = MockIO.instances.find((io) => Array.isArray(io.options.threshold) && (io.options.threshold as number[]).length === 101)!;
    expect(progress.targets.has(node)).toBe(true);
    progress.fire(node, true, 1);
    expect(node.style.transform).toBe('translateY(100px)');
  });

  it('numeric data-sa-parallax strings are treated as px', async () => {
    const { createScrollAnimate } = await load();
    const node = el('<div data-sa data-sa-parallax-y="100"></div>');
    const sa = createScrollAnimate();
    sa.init();
    expect(sa.getObservedElements()[0].options.parallax.y).toBe(100);
  });
});

describe('robustness', () => {
  it('respects prefers-reduced-motion: no hide, no animation, callbacks still fire', async () => {
    const { createScrollAnimate } = await load({ reducedMotion: true });
    const sa = createScrollAnimate();
    const node = el();
    const onComplete = vi.fn();
    sa.observe(node, { onComplete, parallax: { y: 50 } });
    expect(node.style.opacity).toBe('');
    fireAll([node], true, 1);
    expect(animations).toHaveLength(0);
    expect(onComplete).toHaveBeenCalled();
    expect(node.style.transform).toBe('');
  });

  it('reveals content when IntersectionObserver is unavailable', async () => {
    const { createScrollAnimate } = await load();
    delete (globalThis as any).IntersectionObserver;
    const node = el();
    createScrollAnimate().observe(node);
    expect(node.style.opacity).toBe('');
  });

  it('unobserve/destroy restore elements that never animated', async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate();
    const a = el();
    const b = el();
    sa.observe([a, b]);
    sa.unobserve(a);
    expect(a.style.opacity).toBe('');
    sa.destroy();
    expect(b.style.opacity).toBe('');
    expect(sa.getObservedElements()).toHaveLength(0);
    expect(MockIO.instances.every((io) => io.disconnected)).toBe(true);
  });

  it('refresh does not replay or re-hide already animated once-elements', async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate({ autoUnregister: false });
    const node = el();
    sa.observe(node);
    fireAll([node], true);
    animations[0].finish();
    node.style.opacity = '1';
    sa.refresh();
    expect(node.style.opacity).toBe('1');
    fireAll([node], true);
    expect(animations).toHaveLength(1);
    expect(sa.getObservedElements()).toHaveLength(1);
  });

  it('drops detached elements from the registry', async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate();
    const node = el();
    sa.observe(node);
    fireAll([node], true);
    node.remove();
    sa.observe(el());
    expect(sa.getObservedElements().map((r) => r.element)).not.toContain(node);
  });

  it('init() twice does not re-hide animated elements', async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate();
    const node = el('<div data-sa></div>');
    sa.init();
    fireAll([node], true);
    animations[0].finish();
    node.style.opacity = '1';
    sa.init();
    expect(node.style.opacity).toBe('1');
  });

  it('malformed data-sa-easing JSON does not throw', async () => {
    const { createScrollAnimate } = await load();
    el('<div data-sa data-sa-easing="[0.1, 0.2"></div>');
    expect(() => createScrollAnimate().init()).not.toThrow();
  });

  it('useClassNames adds the hidden class on observe', async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate({ useClassNames: true });
    const node = el();
    sa.observe(node);
    expect(node.classList.contains('sa-hidden')).toBe(true);
    fireAll([node], true);
    expect(node.classList.contains('sa-visible')).toBe(true);
    expect(node.classList.contains('sa-hidden')).toBe(false);
  });
});

describe('interpolateValue', () => {
  it('handles units, zero without unit, and mismatched shapes', async () => {
    const { interpolateValue } = await import('../src/core');
    expect(interpolateValue('translateY(100%)', 'translateY(0px)', 0.5)).toBe('translateY(50%)');
    expect(interpolateValue('rotate(-180deg) scale(0.5)', 'rotate(0deg) scale(1)', 0.5)).toBe('rotate(-90deg) scale(0.75)');
    expect(interpolateValue('scale(1)', 'rotate(10deg)', 0.4)).toBe('scale(1)');
  });
});
