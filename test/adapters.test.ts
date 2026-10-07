import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MockIO, installMocks, animations } from './setup';

const cleanups: Array<() => void> = [];
const mounts: Array<() => void> = [];
vi.mock('solid-js', () => ({
  onMount: (fn: () => void) => mounts.push(fn),
  onCleanup: (fn: () => void) => cleanups.push(fn),
}));
const mount = () => mounts.splice(0).forEach((fn) => fn());

function el(html = '<div></div>'): HTMLElement {
  const wrap = document.createElement('div');
  wrap.innerHTML = html;
  const node = wrap.firstElementChild as HTMLElement;
  document.body.appendChild(node);
  return node;
}

const ioFor = (node: Element) => MockIO.instances.find((io) => io.targets.has(node));

beforeEach(() => {
  vi.resetModules();
  installMocks();
  document.body.innerHTML = '';
  cleanups.length = 0;
  mounts.length = 0;
});

describe('svelte actions (use-scroll-animate/svelte)', () => {
  it('scrollAnimate observes the node and destroy() releases it', async () => {
    const { scrollAnimate } = await import('../src/svelte');
    const node = el();
    const action = scrollAnimate(node, { animation: 'zoom-in', duration: 300 });
    expect(node.style.opacity).toBe('0');
    expect(ioFor(node)).toBeTruthy();
    action.destroy!();
    expect(ioFor(node)).toBeUndefined();
    expect(node.style.opacity).toBe(''); // never left hidden
  });

  it('plays the configured animation when the node enters', async () => {
    const { scrollAnimate } = await import('../src/svelte');
    const node = el();
    scrollAnimate(node, { animation: 'zoom-in', duration: 300 });
    ioFor(node)!.fire(node, true);
    expect(animations).toHaveLength(1);
    expect(animations[0].timing.duration).toBe(300);
    expect(animations[0].keyframes[0]).toMatchObject({ transform: 'scale(0.8)' });
  });

  it('update() swaps callbacks and, before the node animated, its options', async () => {
    const { scrollAnimate } = await import('../src/svelte');
    const node = el();
    const first = vi.fn();
    const second = vi.fn();
    const action = scrollAnimate(node, { onStart: first, duration: 100 });
    action.update!({ onStart: second, duration: 900 });
    ioFor(node)!.fire(node, true);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith(node);
    expect(animations[0].timing.duration).toBe(900);
  });

  it('update() after the node animated does not replay it', async () => {
    const { scrollAnimate } = await import('../src/svelte');
    const node = el();
    const action = scrollAnimate(node, { repeat: true });
    ioFor(node)!.fire(node, true);
    action.update!({ repeat: true, duration: 50 });
    expect(animations).toHaveLength(1);
    expect(animations[0].cancelled).toBe(false);
  });

  it('accepts a custom instance', async () => {
    const { scrollAnimate } = await import('../src/svelte');
    const { createScrollAnimate } = await import('../src/core');
    const sa = createScrollAnimate();
    const node = el();
    scrollAnimate(node, { instance: sa, repeat: true });
    expect(sa.getObservedElements().map((r) => r.element)).toContain(node);
  });

  it('scrollStagger staggers children and destroy() reveals them', async () => {
    const { scrollStagger } = await import('../src/svelte');
    const list = el('<ul><li></li><li></li><li></li></ul>');
    const action = scrollStagger(list, { stagger: 50 });
    const items = Array.from(list.children) as HTMLElement[];
    expect(items.every((i) => i.style.opacity === '0')).toBe(true);
    action.destroy!();
    expect(items.every((i) => i.style.opacity === '')).toBe(true);
  });
});

describe('solid primitives (use-scroll-animate/solid)', () => {
  it('scrollAnimate directive observes on mount and unobserves on cleanup', async () => {
    const { scrollAnimate } = await import('../src/solid');
    const node = el();
    scrollAnimate(node, () => ({ animation: 'fade-in', duration: 200 }));
    expect(ioFor(node)).toBeUndefined(); // waits for mount
    mount();
    expect(ioFor(node)).toBeTruthy();
    ioFor(node)!.fire(node, true);
    expect(animations[0].timing.duration).toBe(200);
    cleanups.forEach((c) => c());
    expect(ioFor(node)).toBeUndefined();
  });

  it('directive accepts a bare `use:scrollAnimate` (true) value', async () => {
    const { scrollAnimate } = await import('../src/solid');
    const node = el();
    scrollAnimate(node, () => true);
    mount();
    expect(ioFor(node)).toBeTruthy();
  });

  it('useScrollAnimate returns a ref callback that is observed on mount', async () => {
    const { useScrollAnimate } = await import('../src/solid');
    const node = el();
    const ref = useScrollAnimate({ animation: 'zoom-out', duration: 120 });
    ref(node);
    mount();
    ioFor(node)!.fire(node, true);
    expect(animations[0].timing.duration).toBe(120);
    cleanups.forEach((c) => c());
    expect(ioFor(node)).toBeUndefined();
  });

  it('scrollStagger directive staggers children and cleans up', async () => {
    const { scrollStagger } = await import('../src/solid');
    const list = el('<ul><li></li><li></li></ul>');
    scrollStagger(list, () => ({ stagger: 40 }));
    mount();
    const items = Array.from(list.children) as HTMLElement[];
    expect(items[0].style.opacity).toBe('0');
    cleanups.forEach((c) => c());
    expect(items[0].style.opacity).toBe('');
  });
});

describe('<scroll-animate> custom element (use-scroll-animate/element)', () => {
  it('defineScrollAnimate registers the tag once and returns the class', async () => {
    const { defineScrollAnimate } = await import('../src/element');
    const tag = 'sa-test-a';
    const Ctor = defineScrollAnimate(tag);
    expect(Ctor).toBe(customElements.get(tag));
    expect(defineScrollAnimate(tag)).toBe(Ctor);
  });

  it('observes itself with attribute options and emits sa:* events', async () => {
    const { defineScrollAnimate } = await import('../src/element');
    defineScrollAnimate('sa-test-b');
    const node = el('<sa-test-b animation="fade-in-left" duration="250" easing="spring"></sa-test-b>');
    const events: string[] = [];
    ['enter', 'start', 'complete', 'leave'].forEach((t) => node.addEventListener(`sa:${t}`, () => events.push(t)));
    expect(node.style.display).toBe('block');
    expect(node.style.opacity).toBe('0');
    ioFor(node)!.fire(node, true);
    expect(animations).toHaveLength(1);
    expect(animations[0].timing.duration).toBe(250);
    expect(animations[0].timing.easing).toBe('cubic-bezier(0.34, 1.56, 0.64, 1)');
    expect(animations[0].keyframes[0]).toMatchObject({ transform: 'translateX(-40px)' });
    animations[0].finish();
    expect(events).toEqual(['enter', 'start', 'complete']);
  });

  it('removing the element unobserves it; attribute changes before entering re-apply options', async () => {
    const { defineScrollAnimate } = await import('../src/element');
    defineScrollAnimate('sa-test-c');
    const node = el('<sa-test-c repeat duration="100"></sa-test-c>');
    node.setAttribute('duration', '700');
    ioFor(node)!.fire(node, true);
    expect(animations[0].timing.duration).toBe(700);
    node.remove();
    expect(ioFor(node)).toBeUndefined();
  });

  it('emits sa:progress when progress is requested', async () => {
    const { defineScrollAnimate } = await import('../src/element');
    defineScrollAnimate('sa-test-d');
    const node = el('<sa-test-d progress-var="--p"></sa-test-d>');
    const seen: number[] = [];
    node.addEventListener('sa:progress', (e) => seen.push((e as CustomEvent).detail.progress));
    const pio = MockIO.instances.find((io) => io.targets.has(node) && Array.isArray(io.options.threshold) && (io.options.threshold as number[]).length > 50)!;
    pio.fire(node, true, 0.4);
    expect(seen).toEqual([0.4]);
    expect(node.style.getPropertyValue('--p')).toBe('0.4');
  });

  it('is SSR-safe without customElements', async () => {
    const { defineScrollAnimate } = await import('../src/element');
    const ce = globalThis.customElements;
    // @ts-expect-error simulate server
    delete (globalThis as any).customElements;
    Object.defineProperty(globalThis, 'customElements', { value: undefined, configurable: true });
    expect(defineScrollAnimate('sa-test-e')).toBeUndefined();
    Object.defineProperty(globalThis, 'customElements', { value: ce, configurable: true });
  });

  it('element-auto entry registers <scroll-animate>', async () => {
    await import('../src/element-auto');
    expect(customElements.get('scroll-animate')).toBeTruthy();
  });
});
