import { describe, it, expect, vi, beforeEach } from 'vitest';
import { installMocks, fireAll, animations } from './setup';

/** Tiny fake React: effects run immediately; cleanups collected. */
function fakeReact() {
  const cleanups: Array<() => void> = [];
  return {
    cleanups,
    useRef: <T,>(initial: T | null) => ({ current: initial }),
    useEffect: (fn: () => void | (() => void)) => {
      const c = fn();
      if (c) cleanups.push(c);
    },
  };
}

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('React hooks', () => {
  it('useScrollAnimate observes, animates, cleans up', async () => {
    vi.resetModules();
    installMocks();
    const { createReactHooks } = await import('../src/index');
    const React = fakeReact();
    const node = document.createElement('div');
    document.body.appendChild(node);
    // Simulate ref attachment before effect: patch useRef to return attached ref
    const origUseRef = React.useRef;
    let first = true;
    React.useRef = (<T,>(init: T | null) => {
      if (first) { first = false; return { current: node as any }; }
      return origUseRef(init);
    }) as any;
    const { useScrollAnimate } = createReactHooks(React as any);
    const onEnter = vi.fn();
    useScrollAnimate({ onEnter });
    expect(node.style.opacity).toBe('0');
    fireAll([node], true);
    expect(onEnter).toHaveBeenCalled();
    expect(animations).toHaveLength(1);
    React.cleanups.forEach((c) => c());
  });

  it('useScrollStagger animates children with stagger delay', async () => {
    vi.resetModules();
    installMocks();
    const { createReactHooks } = await import('../src/index');
    const React = fakeReact();
    const ul = document.createElement('ul');
    ul.innerHTML = '<li></li><li></li><li></li>';
    document.body.appendChild(ul);
    let first = true;
    const orig = React.useRef;
    React.useRef = (<T,>(init: T | null) => {
      if (first) { first = false; return { current: ul as any }; }
      return orig(init);
    }) as any;
    const { useScrollStagger } = createReactHooks(React as any);
    useScrollStagger({ stagger: 50 });
    expect((ul.children[0] as HTMLElement).style.opacity).toBe('0');
    fireAll([ul], true);
    expect(animations.map((a) => a.timing.delay)).toEqual([0, 50, 100]);
  });
});

describe('Vue composable', () => {
  it('observes on mount and unobserves on unmount', async () => {
    vi.resetModules();
    installMocks();
    const { createVueComposables } = await import('../src/index');
    let mounted!: () => void;
    let unmounted!: () => void;
    const node = document.createElement('div');
    document.body.appendChild(node);
    const { useScrollAnimate } = createVueComposables({
      ref: () => ({ value: node as any }),
      onMounted: (fn) => (mounted = fn),
      onUnmounted: (fn) => (unmounted = fn),
    });
    useScrollAnimate({ animation: 'zoom-in' });
    mounted();
    expect(node.style.opacity).toBe('0');
    unmounted();
    expect(node.style.opacity).toBe('');
  });
});
