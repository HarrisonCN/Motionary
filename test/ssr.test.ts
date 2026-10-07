// @vitest-environment node
import { describe, it, expect, vi, afterEach } from 'vitest';

describe('SSR', () => {
  it('imports and calls the API without window/document', async () => {
    const mod = await import('../src/index');
    expect(typeof window).toBe('undefined');
    const sa = mod.default;
    expect(() => {
      sa.init();
      sa.observe('.x');
      sa.animate('.x');
      sa.refresh();
      sa.watch()();
      sa.destroy();
      mod.staggerChildren(null, { observeChildren: true })();
      const tl = mod.timeline().to('.x', 'fade');
      tl.play();
      tl.scrub({} as Element)();
      tl.cancel();
    }).not.toThrow();
  });
});

afterEach(() => {
  delete (globalThis as any).IntersectionObserver;
  delete (globalThis as any).matchMedia;
});

describe('SSR (no DOM): side effects and safe fallbacks', () => {
  it('importing has no side effects: no observers, no media queries', async () => {
    vi.resetModules();
    const IO = vi.fn();
    const matchMedia = vi.fn();
    (globalThis as any).IntersectionObserver = IO;
    (globalThis as any).matchMedia = matchMedia;
    const mod = await import('../src/index');
    mod.default.observe('.x');
    mod.default.init();
    expect(IO).not.toHaveBeenCalled();
    expect(matchMedia).not.toHaveBeenCalled();
  });

  it('helpers return safe values on the server', async () => {
    vi.resetModules();
    const mod = await import('../src/index');
    const core = await import('../src/core');
    expect(mod.getScrollProgress({} as Element)).toBe(0);
    expect(core.prefersReducedMotion()).toBe(false);
    expect(core.resolveTargets('.x')).toEqual([]);
    const sa = mod.createScrollAnimate();
    sa.configure({ defaultDuration: 1 });
    expect(sa.getObservedElements()).toEqual([]);
    expect(() => sa.unobserve('.x')).not.toThrow();
    const tl = mod.timeline().to('.x', 'fade', { duration: 100 });
    expect(tl.duration).toBe(0);
    await expect(tl.play()).resolves.toBeUndefined();
  });

  it('React hooks and Vue composables render on the server without touching the DOM', async () => {
    vi.resetModules();
    const { createReactHooks } = await import('../src/react');
    const { createVueComposables } = await import('../src/vue');
    // Server renderers never run effects / mounted hooks.
    const React = { useRef: <T,>(v: T | null) => ({ current: v }), useEffect: vi.fn() };
    const { useScrollAnimate, useScrollStagger } = createReactHooks(React as any);
    expect(useScrollAnimate({ animation: 'fade-in' })).toEqual({ current: null });
    expect(useScrollStagger()).toEqual({ current: null });
    expect(React.useEffect).toHaveBeenCalledTimes(2);

    const vue = createVueComposables({ ref: (v) => ({ value: v }), onMounted: vi.fn(), onUnmounted: vi.fn() });
    expect(vue.useScrollAnimate().animateRef.value).toBeNull();
    expect(vue.useScrollStagger().staggerRef.value).toBeNull();
  });
});
