/**
 * motionary - React Integration
 * Provides useScrollAnimate and useScrollStagger hooks for React applications.
 * `useScrollStagger({ observeChildren: true })` also animates children added later.
 *
 * Both hooks are thin wrappers around the core engine, so they share its
 * behaviour: `once`, `offset`, custom easing functions, progress,
 * `prefers-reduced-motion` support, and proper cleanup on unmount.
 */

import type { AnimateOptions, ScrollAnimateInstance } from './types';
import { createScrollAnimate } from './core';
import { staggerChildren, type StaggerOptions } from './stagger';

type ReactRef<T> = { current: T | null };

const CALLBACKS = ['onStart', 'onComplete', 'onEnter', 'onLeave', 'onProgress'] as const;

/**
 * Wrap the callbacks that exist at mount so they always call the latest
 * version from the most recent render (avoids stale closures without
 * re-creating observers on every render).
 * @internal
 */
export function withLatestCallbacks(latest: ReactRef<AnimateOptions>): AnimateOptions {
  const initial = latest.current || {};
  const opts: AnimateOptions = { ...initial };
  CALLBACKS.forEach((name) => {
    if (typeof initial[name] === 'function') {
      (opts as any)[name] = (...args: unknown[]) => (latest.current?.[name] as any)?.(...args);
    }
  });
  return opts;
}

export function createReactHooks(React: {
  useRef: <T>(initial: T | null) => ReactRef<T>;
  useEffect: (effect: () => (() => void) | void, deps?: unknown[]) => void;
}) {
  // Created lazily on the client so importing on the server is side-effect free.
  let instance: ScrollAnimateInstance | null = null;
  const getInstance = () => instance || (instance = createScrollAnimate());

  function useScrollAnimate(options: AnimateOptions = {}) {
    const ref = React.useRef<Element>(null);
    const optionsRef = React.useRef<AnimateOptions>(options);
    optionsRef.current = options;

    React.useEffect(() => {
      const el = ref.current;
      if (!el) return;
      const sa = getInstance();
      sa.observe(el, withLatestCallbacks(optionsRef));
      return () => sa.unobserve(el);
    }, []);

    return ref;
  }

  function useScrollStagger(options: StaggerOptions = {}) {
    const ref = React.useRef<Element>(null);
    const optionsRef = React.useRef<AnimateOptions>(options);
    optionsRef.current = options;

    React.useEffect(() => {
      const container = ref.current;
      if (!container) return;
      return staggerChildren(container, withLatestCallbacks(optionsRef) as StaggerOptions, getInstance());
    }, []);

    return ref;
  }

  return { useScrollAnimate, useScrollStagger };
}
