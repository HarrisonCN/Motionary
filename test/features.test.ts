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

function setRect(node: Element, top: number, height: number) {
  (node as any).getBoundingClientRect = () => ({ top, height, bottom: top + height, left: 0, right: 0, width: 0, x: 0, y: top });
}

const flush = () => new Promise((r) => setTimeout(r, 0));

let rafQueue: FrameRequestCallback[] = [];
beforeEach(() => {
  document.body.innerHTML = '';
  rafQueue = [];
  (globalThis as any).requestAnimationFrame = (cb: FrameRequestCallback) => rafQueue.push(cb);
  (globalThis as any).cancelAnimationFrame = () => { rafQueue = []; };
  Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true });
});
const runFrames = () => { const q = rafQueue; rafQueue = []; q.forEach((cb) => cb(0)); };

describe('progressMode: scroll', () => {
  it('getScrollProgress maps viewport travel to 0..1, incl. elements taller than the viewport', async () => {
    const { getScrollProgress } = await load();
    const node = el();
    setRect(node, 1000, 3000); // top at bottom edge of a 1000px viewport
    expect(getScrollProgress(node)).toBe(0);
    setRect(node, -1000, 3000); // halfway: traveled 2000 of 4000
    expect(getScrollProgress(node)).toBe(0.5);
    setRect(node, -3000, 3000); // bottom at top edge
    expect(getScrollProgress(node)).toBe(1);
    setRect(node, -5000, 3000);
    expect(getScrollProgress(node)).toBe(1);
  });

  it('emits scroll progress on scroll (rAF-throttled) and stops listening when out of view', async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate();
    const node = el();
    const onProgress = vi.fn();
    const add = vi.spyOn(window, 'addEventListener');
    const remove = vi.spyOn(window, 'removeEventListener');
    sa.observe(node, { onProgress, progressMode: 'scroll' });
    const io = MockIO.instances.find((i) => i.options.threshold === 0)!;
    expect(io).toBeTruthy();
    setRect(node, 500, 3000);
    io.fire(node, true);
    expect(onProgress).toHaveBeenLastCalledWith(node, 500 / 4000);
    expect(add).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true });
    setRect(node, -1000, 3000);
    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('scroll'));
    expect(rafQueue).toHaveLength(1);
    runFrames();
    expect(onProgress).toHaveBeenLastCalledWith(node, 0.5);
    setRect(node, -3200, 3000);
    io.fire(node, false);
    expect(onProgress).toHaveBeenLastCalledWith(node, 1);
    expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true });
    sa.destroy();
  });

  it('drives progressVar with scroll progress and reads data-sa-progress', async () => {
    const { createScrollAnimate } = await load();
    const node = el('<div data-sa data-sa-progress="scroll" data-sa-progress-var="--p"></div>');
    const sa = createScrollAnimate();
    sa.init();
    expect(sa.getObservedElements()[0].options.progressMode).toBe('scroll');
    setRect(node, -500, 1000); // progress 0.75
    MockIO.instances.find((i) => i.options.threshold === 0)!.fire(node, true);
    expect(node.style.getPropertyValue('--p')).toBe('0.75');
  });

  it('default progressMode is still the intersection ratio', async () => {
    const { createScrollAnimate } = await load();
    const node = el();
    const onProgress = vi.fn();
    createScrollAnimate().observe(node, { onProgress });
    const io = MockIO.instances.find((i) => Array.isArray(i.options.threshold) && (i.options.threshold as number[]).length === 101)!;
    io.fire(node, true, 0.3);
    expect(onProgress).toHaveBeenCalledWith(node, 0.3);
  });
});

describe('autoUnregister', () => {
  it('drops finished once-elements from the registry and never replays them', async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate();
    const node = el('<div data-sa></div>');
    sa.init();
    expect(sa.getObservedElements()).toHaveLength(1);
    fireAll([node], true);
    expect(sa.getObservedElements()).toHaveLength(0);
    expect(MockIO.instances.every((io) => io.targets.size === 0)).toBe(true);
    animations[0].finish();
    node.style.opacity = '1';
    sa.init();
    sa.observe(node);
    sa.refresh();
    expect(node.style.opacity).toBe('1');
    expect(animations).toHaveLength(1);
  });

  it('keeps elements that still need progress, and repeat elements', async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate();
    const a = el();
    const b = el();
    sa.observe(a, { onProgress: () => {} });
    sa.observe(b, { repeat: true });
    fireAll([a, b], true);
    expect(sa.getObservedElements().map((r) => r.element)).toEqual([a, b]);
  });

  it('unobserve() lets a finished element be observed again', async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate();
    const node = el();
    sa.observe(node);
    fireAll([node], true);
    sa.unobserve(node);
    sa.observe(node);
    expect(sa.getObservedElements()).toHaveLength(1);
  });
});

describe('presets', () => {
  it('ships the new presets', async () => {
    const { PRESETS } = await load();
    ['scale-up', 'blur-in-up', 'flip-up', 'flip-down', 'rotate-left', 'rotate-right', 'clip-up', 'clip-down', 'clip-left', 'clip-right', 'clip-circle'].forEach((name) => {
      expect(PRESETS[name as keyof typeof PRESETS]).toBeTruthy();
    });
  });

  it('presets without opacity do not leave the element invisible', async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate();
    const a = el();
    const b = el();
    sa.observe(a, { animation: 'clip-up' });
    sa.observe(b, { animation: 'slide-up' });
    expect(a.style.opacity).toBe('0');
    fireAll([a, b], true);
    expect(a.style.opacity).toBe('');
    expect(b.style.opacity).toBe('');
    expect(animations[0].keyframes[0]).toEqual({ clipPath: 'inset(100% 0% 0% 0%)' });
  });

  it('clip-path values interpolate for custom easing functions', async () => {
    const { interpolateValue } = await import('../src/core');
    expect(interpolateValue('inset(100% 0% 0% 0%)', 'inset(0% 0% 0% 0%)', 0.25)).toBe('inset(75% 0% 0% 0%)');
    expect(interpolateValue('circle(0% at 50% 50%)', 'circle(75% at 50% 50%)', 0.5)).toBe('circle(37.5% at 50% 50%)');
  });
});

describe('staggerChildren / observeChildren', () => {
  it('animates initial children and children added before the reveal', async () => {
    const { staggerChildren } = await load();
    const ul = el('<ul><li></li><li></li></ul>');
    staggerChildren(ul, { stagger: 50, observeChildren: true });
    const li = document.createElement('li');
    ul.appendChild(li);
    await flush();
    expect(li.style.opacity).toBe('0');
    fireAll([ul], true);
    expect(animations.map((a) => a.timing.delay)).toEqual([0, 50, 100]);
  });

  it('children added after the reveal animate when they enter, staggered per batch', async () => {
    const { staggerChildren } = await load();
    const ul = el('<ul><li></li></ul>');
    const stop = staggerChildren(ul, { stagger: 40, observeChildren: true });
    fireAll([ul], true);
    expect(animations).toHaveLength(1);
    const added = [document.createElement('li'), document.createElement('li')];
    added.forEach((n) => ul.appendChild(n));
    await flush();
    expect(added[0].style.opacity).toBe('0');
    fireAll(added, true);
    expect(animations.slice(1).map((a) => a.timing.delay)).toEqual([0, 40]);
    stop();
  });

  it('without observeChildren, later children are left alone', async () => {
    const { staggerChildren } = await load();
    const ul = el('<ul><li></li></ul>');
    staggerChildren(ul, {});
    fireAll([ul], true);
    const li = document.createElement('li');
    ul.appendChild(li);
    await flush();
    expect(li.style.opacity).toBe('');
  });

  it('cleanup disconnects the MutationObserver', async () => {
    const { staggerChildren } = await load();
    const ul = el('<ul></ul>');
    const stop = staggerChildren(ul, { observeChildren: true });
    stop();
    const li = document.createElement('li');
    ul.appendChild(li);
    await flush();
    expect(li.style.opacity).toBe('');
  });
});

describe('sequence', () => {
  it('chains steps with durations, gaps (overlap), stagger and absolute times', async () => {
    const { sequence } = await load();
    el('<h1 class="t"></h1>');
    el('<p class="s"></p>');
    el('<i class="c"></i>');
    el('<i class="c"></i>');
    el('<b class="z"></b>');
    const tl = sequence([
      { target: '.t', duration: 500 },
      { target: '.s', duration: 400, gap: -200 },
      { target: '.c', duration: 300, stagger: 100, gap: 50 },
      { target: '.z', at: 0, duration: 100 },
    ]);
    expect(tl.duration()).toBe(1150);
    const done = tl.play();
    expect(animations.map((a) => a.timing.delay)).toEqual([0, 300, 750, 850, 0]);
    let resolved = false;
    done.then(() => (resolved = true));
    animations.slice(0, 4).forEach((a) => a.finish());
    await flush();
    expect(resolved).toBe(false);
    animations[4].finish();
    await flush();
    expect(resolved).toBe(true);
  });

  it('auto-plays once when the trigger enters, hiding targets until then', async () => {
    const { sequence } = await load();
    const hero = el('<section></section>');
    const t = el('<h1 class="t"></h1>');
    sequence([{ target: '.t', animation: 'scale-up' }], { trigger: hero });
    expect(t.style.opacity).toBe('0');
    expect(animations).toHaveLength(0);
    fireAll([hero], true);
    expect(animations).toHaveLength(1);
    fireAll([hero], true);
    expect(animations).toHaveLength(1);
  });

  it('cancel() reveals elements and resolves the pending play()', async () => {
    const { sequence } = await load();
    const t = el('<h1 class="t"></h1>');
    const tl = sequence([{ target: t }]);
    const p = tl.play();
    tl.cancel();
    await expect(p).resolves.toBeUndefined();
    expect(animations[0].cancelled).toBe(true);
    expect(t.style.opacity).toBe('');
  });

  it('reduced motion: completes immediately without animating', async () => {
    const { sequence } = await load({ reducedMotion: true });
    el('<h1 class="t"></h1>');
    await sequence([{ target: '.t' }, { target: '.t' }]).play();
    expect(animations).toHaveLength(0);
  });
});

describe('Vue useScrollStagger', () => {
  it('staggers children on mount and cleans up on unmount', async () => {
    await load();
    const { createVueComposables } = await import('../src/vue');
    const ul = el('<ul><li></li><li></li></ul>');
    let mounted!: () => void;
    let unmounted!: () => void;
    const { useScrollStagger } = createVueComposables({
      ref: () => ({ value: ul as any }),
      onMounted: (fn) => (mounted = fn),
      onUnmounted: (fn) => (unmounted = fn),
    });
    useScrollStagger({ stagger: 30 });
    mounted();
    fireAll([ul], true);
    expect(animations.map((a) => a.timing.delay)).toEqual([0, 30]);
    unmounted();
  });
});
