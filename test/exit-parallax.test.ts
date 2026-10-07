import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MockIO, installMocks, animations } from './setup';

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

const ioFor = (node: Element) => MockIO.instances.find((io) => io.targets.has(node))!;

let rafQueue: FrameRequestCallback[] = [];
beforeEach(() => {
  document.body.innerHTML = '';
  rafQueue = [];
  (globalThis as any).requestAnimationFrame = (cb: FrameRequestCallback) => rafQueue.push(cb);
  (globalThis as any).cancelAnimationFrame = () => { rafQueue = []; };
  Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true });
});
afterEach(() => {
  delete (globalThis as any).CSS;
  delete (globalThis as any).ViewTimeline;
});
const runFrames = () => { const q = rafQueue; rafQueue = []; q.forEach((cb) => cb(0)); };

describe('exit animations', () => {
  it('exit: true plays the entrance in reverse when leaving, and replays on re-entry', async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate();
    const node = el();
    sa.observe(node, { animation: 'fade-in-up', exit: true, duration: 400 });
    const io = ioFor(node);
    io.fire(node, true);
    expect(animations).toHaveLength(1);
    animations[0].finish();
    io.fire(node, false);
    expect(animations).toHaveLength(2);
    const out = animations[1];
    expect(out.keyframes[0]).toMatchObject({ opacity: 1, transform: 'translateY(0px)' });
    expect(out.keyframes[1]).toMatchObject({ opacity: 0, transform: 'translateY(40px)' });
    expect(out.timing).toMatchObject({ duration: 400, fill: 'forwards' });
    io.fire(node, true);
    expect(out.cancelled).toBe(true);
    expect(animations).toHaveLength(3);
    expect(animations[2].keyframes[0]).toMatchObject({ opacity: 0 });
  });

  it('exit: <preset> plays that preset in reverse', async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate();
    const node = el();
    sa.observe(node, { animation: 'zoom-in', exit: 'fade-in-down' });
    const io = ioFor(node);
    io.fire(node, true);
    io.fire(node, false);
    expect(animations[1].keyframes[1]).toMatchObject({ opacity: 0, transform: 'translateY(-40px)' });
  });

  it('exit implies repeat unless repeat is set explicitly', async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate({ autoUnregister: false });
    const a = el();
    const b = el();
    sa.observe(a, { exit: true });
    sa.observe(b, { exit: true, repeat: false });
    const [ra, rb] = sa.getObservedElements();
    expect(ra.options.repeat).toBe(true);
    expect(ra.options.once).toBe(false);
    expect(rb.options.repeat).toBe(false);
  });

  it('is parsed from data-sa-exit', async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate();
    el('<div data-sa data-sa-exit></div>');
    el('<div data-sa data-sa-exit="zoom-out"></div>');
    el('<div data-sa data-sa-exit="false"></div>');
    sa.init();
    expect(sa.getObservedElements().map((r) => r.options.exit)).toEqual([true, 'zoom-out', false]);
  });

  it('skips the exit animation under reduced motion', async () => {
    const { createScrollAnimate } = await load({ reducedMotion: true });
    const sa = createScrollAnimate();
    const node = el();
    sa.observe(node, { exit: true });
    const io = ioFor(node);
    io.fire(node, true);
    io.fire(node, false);
    expect(animations).toHaveLength(0);
    expect(node.style.opacity).toBe('');
  });

  it('class-name mode swaps classes back on exit', async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate({ useClassNames: true });
    const node = el();
    sa.observe(node, { exit: true });
    const io = ioFor(node);
    io.fire(node, true);
    expect(node.classList.contains('sa-visible')).toBe(true);
    io.fire(node, false);
    expect(node.classList.contains('sa-hidden')).toBe(true);
    expect(node.classList.contains('sa-visible')).toBe(false);
  });

  it('native engine adds a reversed animation over the exit range', async () => {
    (globalThis as any).CSS = { supports: () => true };
    (globalThis as any).ViewTimeline = class { constructor(public o: unknown) {} };
    const { createScrollAnimate } = await load();
    (globalThis as any).CSS = { supports: () => true };
    (globalThis as any).ViewTimeline = class { constructor(public o: unknown) {} };
    const sa = createScrollAnimate({ defaultEngine: 'auto' });
    const node = el();
    sa.observe(node, { animation: 'fade-in', exit: true });
    expect(animations).toHaveLength(2);
    expect(animations[1].timing).toMatchObject({ rangeStart: 'exit 0%', rangeEnd: 'exit 100%', fill: 'forwards' });
    expect(animations[1].keyframes[0]).toMatchObject({ opacity: 1 });
    expect(animations[1].keyframes[1]).toMatchObject({ opacity: 0 });
    // the entrance is kept alive (repeat) after finishing
    animations[0].finish();
    expect(animations[0].cancelled).toBe(false);
    sa.unobserve(node);
    expect(animations[0].cancelled).toBe(true);
    expect(animations[1].cancelled).toBe(true);
  });
});

describe('parallax() helper', () => {
  it('writes the progress var and a translate offset, updating on scroll while visible', async () => {
    const { parallax } = await load();
    const node = el();
    setRect(node, 1000, 0); // top at the bottom of a 1000px viewport -> progress 0
    const stop = parallax(node, { speed: 0.4 });
    expect(node.style.getPropertyValue('--sa-parallax')).toBe('0');
    expect(node.style.getPropertyValue('translate')).toBe('0px -20vh');
    const io = ioFor(node);
    expect(io.options).toMatchObject({ threshold: 0 });
    setRect(node, 500, 0);
    io.fire(node, true);
    expect(node.style.getPropertyValue('--sa-parallax')).toBe('0.5');
    expect(node.style.getPropertyValue('translate')).toBe('0px 0vh');
    setRect(node, 0, 0);
    window.dispatchEvent(new Event('scroll'));
    runFrames();
    expect(node.style.getPropertyValue('--sa-parallax')).toBe('1');
    expect(node.style.getPropertyValue('translate')).toBe('0px 20vh');
    stop();
    expect(node.style.getPropertyValue('translate')).toBe('');
    expect(node.style.getPropertyValue('--sa-parallax')).toBe('');
  });

  it('supports axis x, negative speed and a custom variable name', async () => {
    const { parallax } = await load();
    const node = el();
    setRect(node, 1000, 0);
    parallax(node, { speed: -0.2, axis: 'x', progressVar: 'drift' });
    expect(node.style.getPropertyValue('--drift')).toBe('0');
    expect(node.style.getPropertyValue('translate')).toBe('10vw 0px');
  });

  it('only listens to scroll while an element is visible', async () => {
    const { parallax } = await load();
    const node = el();
    setRect(node, 500, 100);
    const add = vi.spyOn(window, 'addEventListener');
    const remove = vi.spyOn(window, 'removeEventListener');
    parallax(node);
    expect(add.mock.calls.filter((c) => c[0] === 'scroll')).toHaveLength(0);
    ioFor(node).fire(node, true);
    expect(add.mock.calls.filter((c) => c[0] === 'scroll')).toHaveLength(1);
    ioFor(node).fire(node, false);
    expect(remove.mock.calls.filter((c) => c[0] === 'scroll')).toHaveLength(1);
  });

  it('respects reduced motion (progress only, no offset) unless disabled', async () => {
    const { parallax } = await load({ reducedMotion: true });
    const a = el();
    const b = el();
    setRect(a, 1000, 0);
    setRect(b, 1000, 0);
    parallax(a);
    parallax(b, { respectReducedMotion: false });
    expect(a.style.getPropertyValue('--sa-parallax')).toBe('0');
    expect(a.style.getPropertyValue('translate')).toBe('');
    expect(b.style.getPropertyValue('translate')).toBe('0px -10vh');
  });

  it('composes with transforms (uses translate, never touches transform)', async () => {
    const { parallax } = await load();
    const node = el('<div style="transform: rotate(5deg)"></div>');
    setRect(node, 1000, 0);
    parallax(node);
    expect(node.style.transform).toBe('rotate(5deg)');
  });

  it('accepts selectors and is a no-op without matches / IntersectionObserver', async () => {
    const { parallax } = await load();
    el('<div class="p"></div>');
    el('<div class="p"></div>');
    parallax('.p');
    expect(MockIO.instances[0].targets.size).toBe(2);
    expect(parallax('.none')).toBeTypeOf('function');
    delete (globalThis as any).IntersectionObserver;
    const node = el();
    parallax(node)();
    expect(node.style.getPropertyValue('translate')).toBe('');
  });
});
