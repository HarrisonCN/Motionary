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

/** Fake React whose `useRef` hands out `attached` for the first ref (the DOM ref). */
function fakeReact(attached: Element | null) {
  const cleanups: Array<() => void> = [];
  let first = true;
  return {
    cleanups,
    unmount: () => cleanups.splice(0).forEach((c) => c()),
    useRef: <T,>(initial: T | null) => {
      if (first) {
        first = false;
        return { current: attached as any };
      }
      return { current: initial };
    },
    useEffect: (fn: () => void | (() => void)) => {
      const c = fn();
      if (c) cleanups.push(c);
    },
  };
}

const flush = () => new Promise((r) => setTimeout(r, 0));

let rafQueue: FrameRequestCallback[] = [];
beforeEach(() => {
  document.body.innerHTML = '';
  rafQueue = [];
  (globalThis as any).requestAnimationFrame = (cb: FrameRequestCallback) => rafQueue.push(cb);
  (globalThis as any).cancelAnimationFrame = () => {
    rafQueue = [];
  };
  Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true });
});

describe('reduced motion', () => {
  it('init(): [data-sa] elements are never hidden, never animated, callbacks still fire', async () => {
    const { createScrollAnimate } = await load({ reducedMotion: true });
    const a = el('<div data-sa data-sa-animation="zoom-in"></div>');
    const b = el('<div data-sa data-sa-repeat></div>');
    const onStart = vi.fn();
    const sa = createScrollAnimate();
    sa.init();
    sa.observe(el(), { onStart });
    expect(a.style.opacity).toBe('');
    expect(b.style.opacity).toBe('');
    fireAll([a, b, ...sa.getObservedElements().map((r) => r.element)], true);
    expect(animations).toHaveLength(0);
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('repeat elements are not re-hidden when they leave', async () => {
    const { createScrollAnimate } = await load({ reducedMotion: true });
    const sa = createScrollAnimate();
    const node = el();
    const onLeave = vi.fn();
    sa.observe(node, { repeat: true, onLeave });
    fireAll([node], true);
    fireAll([node], false);
    expect(onLeave).toHaveBeenCalledWith(node);
    expect(node.style.opacity).toBe('');
    expect(animations).toHaveLength(0);
  });

  it('useClassNames: no hidden class is applied, visible class is added on enter', async () => {
    const { createScrollAnimate } = await load({ reducedMotion: true });
    const sa = createScrollAnimate({ useClassNames: true });
    const node = el();
    sa.observe(node);
    expect(node.classList.contains('sa-hidden')).toBe(false);
    fireAll([node], true);
    expect(node.classList.contains('sa-visible')).toBe(true);
  });

  it('scroll progress still reaches onProgress under reduced motion', async () => {
    const { createScrollAnimate } = await load({ reducedMotion: true });
    const sa = createScrollAnimate();
    const node = el();
    const onProgress = vi.fn();
    sa.observe(node, { progressMode: 'scroll', onProgress });
    setRect(node, -500, 1000);
    MockIO.instances.find((i) => i.options.threshold === 0)!.fire(node, true);
    expect(onProgress).toHaveBeenCalledWith(node, 0.75);
    expect(node.style.transform).toBe('');
    sa.destroy();
  });

  it('staggerChildren and timeline leave content visible and finish immediately', async () => {
    const { staggerChildren, timeline } = await load({ reducedMotion: true });
    const list = el('<ul><li></li><li></li></ul>');
    staggerChildren(list, { stagger: 50 });
    expect(Array.from(list.children).every((c) => (c as HTMLElement).style.opacity === '')).toBe(true);
    fireAll([list], true);
    expect(animations).toHaveLength(0);

    const title = el('<h1 class="t"></h1>');
    const done = vi.fn();
    const tl = timeline({ onComplete: done }).to(title, 'fade-up');
    await tl.play();
    expect(done).toHaveBeenCalled();
    expect(tl.progress()).toBe(1);
  });

  it('honours a preference that changes after the instance was created', async () => {
    const { createScrollAnimate } = await load();
    const query = { matches: false, media: '(prefers-reduced-motion: reduce)', addEventListener() {}, removeEventListener() {} };
    window.matchMedia = vi.fn(() => query) as any;
    const sa = createScrollAnimate();
    sa.animate(el());
    expect(animations).toHaveLength(1);
    query.matches = true;
    const node = el();
    const onComplete = vi.fn();
    sa.animate(node, { onComplete });
    expect(animations).toHaveLength(1);
    expect(onComplete).toHaveBeenCalledWith(node);
  });

  it('configure({ disabled: true }) at runtime reveals instead of animating', async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate();
    const node = el();
    sa.observe(node);
    expect(node.style.opacity).toBe('0');
    sa.configure({ disabled: true });
    fireAll([node], true);
    expect(animations).toHaveLength(0);
    expect(node.style.opacity).toBe('');
  });
});

describe('cleanup', () => {
  it('unobserving a scroll-mode element that is in view removes the scroll listener', async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate();
    const node = el();
    const remove = vi.spyOn(window, 'removeEventListener');
    sa.observe(node, { progressMode: 'scroll', onProgress: () => {} });
    setRect(node, 500, 1000);
    MockIO.instances.find((i) => i.options.threshold === 0)!.fire(node, true);
    sa.unobserve(node);
    expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true });
    expect(remove).toHaveBeenCalledWith('resize', expect.any(Function), { passive: true });
    remove.mockRestore();
  });

  it('destroy() cancels a pending animation frame and stops reporting progress', async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate();
    const node = el();
    const onProgress = vi.fn();
    sa.observe(node, { progressMode: 'scroll', onProgress });
    setRect(node, 500, 1000);
    MockIO.instances.find((i) => i.options.threshold === 0)!.fire(node, true);
    onProgress.mockClear();
    window.dispatchEvent(new Event('scroll'));
    expect(rafQueue).toHaveLength(1);
    sa.destroy();
    expect(rafQueue).toHaveLength(0);
    window.dispatchEvent(new Event('scroll'));
    expect(rafQueue).toHaveLength(0);
    expect(onProgress).not.toHaveBeenCalled();
  });

  it('a destroyed instance can be reused', async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate();
    const node = el('<div data-sa></div>');
    sa.init();
    fireAll([node], true);
    sa.destroy();
    sa.observe(node);
    expect(sa.getObservedElements()).toHaveLength(1);
    fireAll([node], true);
    expect(animations).toHaveLength(2);
  });

  it('a new animation on the same element cancels the running one', async () => {
    const { createScrollAnimate } = await load();
    const sa = createScrollAnimate();
    const node = el();
    const first = vi.fn();
    sa.animate(node, { onComplete: first });
    sa.animate(node);
    expect(animations[0].cancelled).toBe(true);
    expect(animations[0].onfinish).toBeNull();
    expect(first).not.toHaveBeenCalled();
  });

  it('useClassNames: onComplete fires after duration + delay, and a replay clears the old timer', async () => {
    vi.useFakeTimers();
    try {
      const { createScrollAnimate } = await load();
      const sa = createScrollAnimate({ useClassNames: true });
      const node = el();
      const onComplete = vi.fn();
      sa.animate(node, { duration: 300, delay: 100, onComplete });
      expect(node.style.animationDelay).toBe('100ms');
      vi.advanceTimersByTime(399);
      expect(onComplete).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1);
      expect(onComplete).toHaveBeenCalledTimes(1);

      const replay = vi.fn();
      sa.animate(node, { duration: 300, onComplete: replay });
      sa.animate(node, { duration: 300, onComplete: replay });
      vi.advanceTimersByTime(300);
      expect(replay).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('useClassNames: destroy() clears pending completion timers', async () => {
    vi.useFakeTimers();
    try {
      const { createScrollAnimate } = await load();
      const sa = createScrollAnimate({ useClassNames: true });
      const node = el();
      const onComplete = vi.fn();
      sa.animate(node, { duration: 300, delay: 100, onComplete });
      sa.destroy();
      vi.advanceTimersByTime(1000);
      expect(onComplete).not.toHaveBeenCalled();
      expect(node.classList.contains('sa-visible')).toBe(true);

      // A second instance's timers are untouched by the first one's destroy().
      const other = createScrollAnimate({ useClassNames: true });
      const node2 = el();
      const done2 = vi.fn();
      other.animate(node2, { duration: 200, onComplete: done2 });
      sa.destroy();
      vi.advanceTimersByTime(200);
      expect(done2).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('falls back to setting the end styles when the Web Animations API is missing', async () => {
    const { createScrollAnimate } = await load();
    delete (Element.prototype as any).animate;
    const node = el();
    const onComplete = vi.fn();
    createScrollAnimate().animate(node, { animation: { from: { opacity: 0 }, to: { opacity: 1, color: 'red' } }, onComplete });
    expect(node.style.opacity).toBe('1');
    expect(node.style.color).toBe('red');
    expect(onComplete).toHaveBeenCalledWith(node);
  });
});

describe('React hooks lifecycle', () => {
  it('unmounting before the element entered makes it visible and stops observing', async () => {
    await load();
    const { createReactHooks } = await import('../src/react');
    const node = el();
    const React = fakeReact(node);
    const { useScrollAnimate } = createReactHooks(React as any);
    useScrollAnimate();
    expect(node.style.opacity).toBe('0');
    React.unmount();
    expect(node.style.opacity).toBe('');
    expect(MockIO.instances.every((io) => !io.targets.has(node))).toBe(true);
    fireAll([node], true);
    expect(animations).toHaveLength(0);
  });

  it('does nothing when the ref was never attached', async () => {
    await load();
    const { createReactHooks } = await import('../src/react');
    const React = fakeReact(null);
    const { useScrollAnimate } = createReactHooks(React as any);
    expect(() => useScrollAnimate()).not.toThrow();
    expect(React.cleanups).toHaveLength(0);
    expect(MockIO.instances).toHaveLength(0);
  });

  it('callbacks always call the latest version passed to the hook', async () => {
    await load();
    const { withLatestCallbacks } = await import('../src/react');
    const first = vi.fn();
    const second = vi.fn();
    const latest = { current: { onEnter: first, duration: 200 } as any };
    const opts = withLatestCallbacks(latest);
    expect(opts.duration).toBe(200);
    expect(opts.onLeave).toBeUndefined(); // only callbacks present at mount are wrapped
    latest.current = { onEnter: second };
    const node = el();
    opts.onEnter!(node);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith(node);
    latest.current = {};
    expect(() => opts.onEnter!(node)).not.toThrow();
  });

  it('useScrollStagger unmount disconnects the MutationObserver and releases late children', async () => {
    await load();
    const { createReactHooks } = await import('../src/react');
    const list = el('<ul><li></li></ul>');
    const React = fakeReact(list);
    const { useScrollStagger } = createReactHooks(React as any);
    useScrollStagger({ observeChildren: true });
    fireAll([list], true); // reveal: first child animates
    const late = document.createElement('li');
    list.appendChild(late);
    await flush();
    expect(late.style.opacity).toBe('0');
    React.unmount();
    expect(late.style.opacity).toBe('');
    const after = document.createElement('li');
    list.appendChild(after);
    await flush();
    expect(after.style.opacity).toBe('');
  });
});

describe('Vue composables lifecycle', () => {
  function fakeVue(value: unknown) {
    const hooks = { mounted: [] as Array<() => void>, unmounted: [] as Array<() => void> };
    return {
      hooks,
      api: {
        ref: () => ({ value: value as any }),
        onMounted: (fn: () => void) => hooks.mounted.push(fn),
        onUnmounted: (fn: () => void) => hooks.unmounted.push(fn),
      },
    };
  }

  it('unwraps component refs ($el)', async () => {
    await load();
    const { createVueComposables } = await import('../src/vue');
    const node = el();
    const vue = fakeVue({ $el: node });
    createVueComposables(vue.api).useScrollAnimate();
    vue.hooks.mounted.forEach((f) => f());
    expect(node.style.opacity).toBe('0');
    fireAll([node], true);
    expect(animations).toHaveLength(1);
    vue.hooks.unmounted.forEach((f) => f());
  });

  it('a null ref is a no-op on mount and unmount', async () => {
    await load();
    const { createVueComposables } = await import('../src/vue');
    const vue = fakeVue(null);
    const { useScrollAnimate, useScrollStagger } = createVueComposables(vue.api);
    useScrollAnimate();
    useScrollStagger();
    expect(() => {
      vue.hooks.mounted.forEach((f) => f());
      vue.hooks.unmounted.forEach((f) => f());
    }).not.toThrow();
    expect(MockIO.instances).toHaveLength(0);
  });
});

describe('data attributes', () => {
  it('parses once/repeat flags, threshold lists and cubic-bezier easing', async () => {
    const { createScrollAnimate } = await load();
    el('<div data-sa data-sa-once="false" data-sa-threshold="0, 0.5, 1" data-sa-easing="[0.1, 0.2, 0.3, 0.4]" data-sa-root-margin="10px" data-sa-offset="20"></div>');
    el('<div data-sa data-sa-repeat data-sa-duration="abc" data-sa-animation="fade-in, zoom-in"></div>');
    const sa = createScrollAnimate();
    sa.init();
    const [a, b] = sa.getObservedElements().map((r) => r.options);
    expect(a.once).toBe(false);
    expect(a.threshold).toEqual([0, 0.5, 1]);
    expect(a.easing).toEqual([0.1, 0.2, 0.3, 0.4]);
    expect(a.rootMargin).toBe('10px');
    expect(MockIO.instances[0].options.rootMargin).toBe('10px 10px -10px 10px');
    expect(b.repeat).toBe(true);
    expect(b.once).toBe(false);
    expect(b.duration).toBe(600); // invalid number falls back to the default
    expect(b.animation).toEqual(['fade-in', 'zoom-in']);
  });

  it('init(scope) only picks up elements inside the scope', async () => {
    const { createScrollAnimate } = await load();
    const scope = el('<section><div data-sa></div></section>');
    const outside = el('<div data-sa></div>');
    const sa = createScrollAnimate();
    sa.init(scope);
    expect(sa.getObservedElements().map((r) => r.element)).toEqual([scope.firstElementChild]);
    expect(outside.style.opacity).toBe('');
  });

  it('a custom root is passed to every observer', async () => {
    const { createScrollAnimate } = await load();
    const scroller = el('<div id="scroller"></div>');
    const sa = createScrollAnimate({ root: scroller });
    sa.observe(el(), { onProgress: () => {} });
    expect(MockIO.instances.length).toBeGreaterThan(1);
    expect(MockIO.instances.every((io) => io.options.root === scroller)).toBe(true);
  });
});
