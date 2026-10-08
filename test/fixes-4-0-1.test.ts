import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { installComponentMocks, anims, intersect, mount } from './components-setup';

const effects: Array<() => void> = [];
const cleanups: Array<() => void> = [];
vi.mock('solid-js', () => ({
  createRenderEffect: (fn: () => void) => (effects.push(fn), fn()),
  onMount: (fn: () => void) => fn(),
  onCleanup: (fn: () => void) => cleanups.push(fn),
}));

const read = (file: string) => readFileSync(`${process.cwd()}/${file}`, 'utf8');

beforeEach(() => {
  installComponentMocks();
  document.body.innerHTML = '';
  effects.length = 0;
  cleanups.length = 0;
});

describe('4.0.1 regressions', () => {
  it('<usa-mask-reveal> repeat hides with opacity again when it leaves the viewport', async () => {
    const { defineSvgComponents } = await import('../src/components/svg');
    defineSvgComponents();
    const el = mount<any>('<usa-mask-reveal repeat delay="200"><p>x</p></usa-mask-reveal>');
    intersect(el, true);
    expect(el.dataset.state).toBe('revealing');
    expect(el.style.opacity).toBe('');
    intersect(el, false);
    expect(el.dataset.state).toBe('hidden');
    expect(el.style.opacity).toBe('0');
    expect(el.style.clipPath).toBe('');
  });

  it('<usa-timeline trigger="click"> shows its final state until clicked; Enter replays', async () => {
    const { defineTimelineComponents } = await import('../src/components/timeline');
    defineTimelineComponents();
    const el = mount<any>('<usa-timeline trigger="click" duration="20"><b data-tl="fade-up">x</b></usa-timeline>');
    expect(el.timeline.progress()).toBe(1);
    expect(el.tabIndex).toBe(0);
    const play = vi.spyOn(el, 'play');
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(play).toHaveBeenCalledTimes(1);
  });

  it('WebGL elements follow their own size with a ResizeObserver', async () => {
    const observed: Element[] = [];
    (globalThis as any).ResizeObserver = class {
      constructor(public cb: () => void) {}
      observe(el: Element) {
        observed.push(el);
      }
      disconnect() {}
    };
    const gl = await import('../src/components/webgl/gl');
    vi.spyOn(gl, 'glQuad').mockReturnValue({ resize() {}, texture() {}, render() {}, dispose() {} } as any);
    const { defineWebglComponents } = await import('../src/components/webgl');
    defineWebglComponents();
    const el = mount('<usa-shader></usa-shader>');
    expect(observed.includes(el) || el.hasAttribute('data-fallback')).toBe(true);
    delete (globalThis as any).ResizeObserver;
  });

  it('Solid `use:usa` directive tracks its accessor (no manual refresh)', async () => {
    const solid = await import('../src/components/frameworks/solid');
    const el = mount('<div></div>') as any;
    let v = 1;
    const fn = vi.fn();
    solid.usa(el, () => ({ props: { index: v }, on: { change: fn } }));
    expect(el.index).toBe(1);
    v = 2;
    effects.forEach((e) => e()); // what Solid does when a tracked signal changes
    expect(el.index).toBe(2);
    el.dispatchEvent(new CustomEvent('usa:change'));
    expect(fn).toHaveBeenCalledTimes(1);
    cleanups.forEach((c) => c());
    el.dispatchEvent(new CustomEvent('usa:change'));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('showcase: demo SVGs are not squashed by the icon rule, helper classes exist, deep links allow digits', () => {
    const css = read('showcase/styles.css');
    expect(css).toMatch(/svg:not\(\[width\]\)/);
    const g = read('showcase/gallery.css');
    for (const c of ['.demo-tile--lg', '.demo-zoom']) expect(g).toContain(c);
    expect(read('showcase/gallery.js')).toContain('#c-([a-z0-9-]+)');
    expect(g).not.toMatch(/max-width: 640px\) \{ \.nav-link \{ display: none/);
  });

  it('showcase copy is current (no stale v2 / v3.0 kickers, no Chinese in English copy)', () => {
    expect(read('showcase/i18n.js')).not.toContain("'use-scroll-animate v2'");
    expect(read('showcase/gallery-i18n.js')).not.toMatch(/'v3\.0 ·/);
    expect(read('showcase/catalog/click.js')).not.toContain('(按钮点击形变)');
  });
});
