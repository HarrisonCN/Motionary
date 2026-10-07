import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MockIO, installMocks, animations } from './setup';

class FakeViewTimeline {
  constructor(public options: { subject: Element; axis?: string }) {}
}

function setSupport(supported: boolean) {
  (globalThis as any).CSS = { supports: vi.fn((q: string) => supported && q === 'animation-timeline: view()') };
  if (supported) (globalThis as any).ViewTimeline = FakeViewTimeline;
  else delete (globalThis as any).ViewTimeline;
}

async function load(opts: { reducedMotion?: boolean; native?: boolean } = {}) {
  vi.resetModules();
  installMocks(opts);
  setSupport(opts.native ?? true);
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
afterEach(() => {
  delete (globalThis as any).CSS;
  delete (globalThis as any).ViewTimeline;
});

describe('engine option (native scroll-driven timeline)', () => {
  it('supportsScrollTimeline() checks CSS.supports(animation-timeline: view()) and ViewTimeline', async () => {
    let mod = await load({ native: true });
    expect(mod.supportsScrollTimeline()).toBe(true);
    expect((globalThis as any).CSS.supports).toHaveBeenCalledWith('animation-timeline: view()');
    mod = await load({ native: false });
    expect(mod.supportsScrollTimeline()).toBe(false);
  });

  it("defaults to 'auto' since 2.0: native when supported", async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate();
    const node = el();
    sa.observe(node, { animation: 'fade-in' });
    expect(animations).toHaveLength(1);
    expect(sa.getObservedElements()[0].engine).toBe('css');
  });

  it("'auto' uses JS when the element sets duration, delay, offset or stagger; 'css' does not", async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate();
    const opts = [{ duration: 900 }, { delay: 100 }, { offset: 50 }, { stagger: 80 }];
    opts.forEach((o) => sa.observe(el(), o));
    expect(animations).toHaveLength(0);
    expect(sa.getObservedElements().every((r) => r.engine === 'js')).toBe(true);
    sa.observe(el(), { duration: 900, engine: 'css' });
    expect(animations).toHaveLength(1);
  });

  it("defaultEngine: 'js' restores the 1.x behaviour", async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate({ defaultEngine: 'js' });
    const node = el();
    sa.observe(node, { animation: 'fade-in' });
    expect(node.style.opacity).toBe('0');
    expect(animations).toHaveLength(0);
    expect(sa.getObservedElements()[0].engine).toBe('js');
  });

  it("engine: 'auto' attaches the preset to a ViewTimeline instead of hiding the element", async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate();
    const node = el();
    sa.observe(node, { animation: 'fade-in-up', engine: 'auto', easing: 'spring' });
    expect(node.style.opacity).toBe('');
    expect(animations).toHaveLength(1);
    const a = animations[0];
    expect(a.el).toBe(node);
    expect(a.keyframes[0]).toMatchObject({ opacity: 0, transform: 'translateY(40px)' });
    const timing = a.timing as any;
    expect(timing.timeline).toBeInstanceOf(FakeViewTimeline);
    expect(timing.timeline.options.subject).toBe(node);
    expect(timing.rangeStart).toBe('entry 0%');
    expect(timing.rangeEnd).toBe('entry 100%');
    expect(timing.fill).toBe('both');
    expect(timing.easing).toBe('cubic-bezier(0.34, 1.56, 0.64, 1)');
    expect(timing.duration).toBeUndefined();
    expect(sa.getObservedElements()[0].engine).toBe('css');
  });

  it("engine: 'css' and 'auto' fall back to JS when unsupported", async () => {
    const { createScrollAnimate } = await load({ native: false });
    const sa = createScrollAnimate();
    const a = el();
    const b = el();
    sa.observe(a, { engine: 'css' });
    sa.observe(b, { engine: 'auto' });
    expect(a.style.opacity).toBe('0');
    expect(b.style.opacity).toBe('0');
    expect(animations).toHaveLength(0);
    MockIO.instances[0].fire(a, true);
    expect(animations).toHaveLength(1);
    expect((animations[0].timing as any).timeline).toBeUndefined();
    expect(animations[0].timing.duration).toBe(600);
  });

  it('falls back to JS when ViewTimeline construction throws', async () => {
    const { createScrollAnimate } = await load();
    (globalThis as any).ViewTimeline = class { constructor() { throw new Error('nope'); } };
    const sa = createScrollAnimate();
    const node = el();
    sa.observe(node, { engine: 'auto' });
    expect(node.style.opacity).toBe('0');
    expect(sa.getObservedElements()[0].engine).toBe('js');
  });

  it('uses JS under reduced motion and in class-name mode', async () => {
    let mod = await load({ reducedMotion: true });
    let sa = mod.createScrollAnimate({ defaultEngine: 'auto' });
    const a = el();
    sa.observe(a);
    expect(animations).toHaveLength(0);
    expect(a.style.opacity).toBe('');
    mod = await load();
    sa = mod.createScrollAnimate({ defaultEngine: 'auto', useClassNames: true });
    const b = el();
    sa.observe(b);
    expect(animations).toHaveLength(0);
    expect(b.classList.contains('sa-hidden')).toBe(true);
  });

  it('honours defaultEngine, data-sa-engine and data-sa-view-range', async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate({ defaultEngine: 'js' });
    el('<div data-sa data-sa-engine="css" data-sa-view-range="cover 0%, cover 50%"></div>');
    el('<div data-sa></div>');
    sa.init();
    expect(animations).toHaveLength(1);
    expect((animations[0].timing as any).rangeStart).toBe('cover 0%');
    expect((animations[0].timing as any).rangeEnd).toBe('cover 50%');

    const sb = createScrollAnimate({ defaultEngine: 'auto' });
    sb.observe(el(), { viewRange: ['contain 0%', 'contain 100%'] });
    expect(animations).toHaveLength(2);
    expect((animations[1].timing as any).rangeStart).toBe('contain 0%');
  });

  it('once: freezes the end state on finish (commitStyles + cancel) and fires callbacks', async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate({ defaultEngine: 'auto' });
    const node = el();
    const onStart = vi.fn();
    const onEnter = vi.fn();
    const onComplete = vi.fn();
    sa.observe(node, { onStart, onEnter, onComplete });
    const io = MockIO.instances.find((i) => i.targets.has(node))!;
    io.fire(node, true);
    expect(onEnter).toHaveBeenCalledTimes(1);
    expect(onStart).toHaveBeenCalledTimes(1);
    // released from the registry (autoUnregister) while the browser keeps driving it
    expect(sa.getObservedElements()).toHaveLength(0);
    const a = animations[0];
    expect(a.cancelled).toBe(false);
    a.finish();
    expect(a.committed).toBe(true);
    expect(a.cancelled).toBe(true);
    expect(onComplete).toHaveBeenCalledWith(node);
    // init() does not restart it
    node.setAttribute('data-sa', '');
    sa.init();
    expect(animations).toHaveLength(1);
  });

  it('repeat: keeps the scroll-linked animation alive and re-fires onStart per entry', async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate({ defaultEngine: 'auto' });
    const node = el();
    const onStart = vi.fn();
    const onLeave = vi.fn();
    sa.observe(node, { repeat: true, onStart, onLeave });
    const io = MockIO.instances.find((i) => i.targets.has(node))!;
    io.fire(node, true);
    animations[0].finish();
    expect(animations[0].cancelled).toBe(false);
    io.fire(node, false);
    expect(onLeave).toHaveBeenCalledTimes(1);
    expect(node.style.opacity).toBe('');
    io.fire(node, true);
    expect(onStart).toHaveBeenCalledTimes(2);
    expect(animations).toHaveLength(1);
  });

  it('unobserve() and destroy() cancel unfinished native animations and leave content visible', async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate({ defaultEngine: 'auto' });
    const a = el();
    const b = el();
    sa.observe([a, b]);
    sa.unobserve(a);
    expect(animations[0].cancelled).toBe(true);
    // b entered (released by autoUnregister) but has not finished yet
    MockIO.instances.find((i) => i.targets.has(b))!.fire(b, true);
    sa.destroy();
    expect(animations[1].cancelled).toBe(true);
    expect(b.style.opacity).toBe('');
  });

  it('progress/parallax keep working with the native engine', async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate({ defaultEngine: 'auto' });
    const node = el();
    const onProgress = vi.fn();
    sa.observe(node, { onProgress, progressVar: '--p' });
    const pio = MockIO.instances.find((i) => i.targets.has(node) && Array.isArray(i.options.threshold) && (i.options.threshold as number[]).length > 50)!;
    pio.fire(node, true, 0.25);
    expect(onProgress).toHaveBeenCalledWith(node, 0.25);
    expect(node.style.getPropertyValue('--p')).toBe('0.25');
  });

  it('manual animate() always uses the time-based JS engine', async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate({ defaultEngine: 'css' });
    const node = el();
    sa.animate(node, { animation: 'zoom-in' });
    expect((animations[0].timing as any).timeline).toBeUndefined();
    expect(animations[0].timing.duration).toBe(600);
  });
  it('releases native-engine elements that left the DOM (no longer held or touched by destroy())', async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate();
    const node = el();
    sa.observe(node, { animation: 'fade-in', repeat: true });
    expect(sa.getObservedElements()[0].engine).toBe('css');
    node.remove();
    sa.init(); // prunes detached elements
    expect(sa.getObservedElements()).toHaveLength(0);
    sa.destroy();
    expect(animations[0].cancelled).toBe(false);
    expect(node.style.opacity).toBe('');
  });
});
