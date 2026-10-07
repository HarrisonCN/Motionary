/**
 * use-scroll-animate - React Integration
 * Provides useScrollAnimate and useScrollStagger hooks for React applications.
 *
 * Both hooks are thin wrappers around the core engine, so they share its
 * behaviour: `once`, `offset`, custom easing functions, parallax,
 * `prefers-reduced-motion` support, and proper cleanup on unmount.
 */

import type { AnimateOptions, ScrollAnimateInstance } from './types';
import { createScrollAnimate, prepareElement, supportsObserver } from './core';

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

  function useScrollStagger(options: AnimateOptions & { stagger?: number } = {}) {
    const ref = React.useRef<Element>(null);
    const optionsRef = React.useRef<AnimateOptions>(options);
    optionsRef.current = options;

    React.useEffect(() => {
      const container = ref.current;
      if (!container) return;

      const sa = getInstance();
      const { stagger = 80, delay = 0, threshold = 0.1, rootMargin = '0px', ...rest } =
        withLatestCallbacks(optionsRef);
      const children = Array.from(container.children);
      if (!supportsObserver()) return; // leave content visible

      children.forEach((child) => prepareElement(child));

      const observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          observer.disconnect();
          children.forEach((child, i) => {
            sa.animate(child, { ...rest, delay: delay + i * stagger });
          });
        },
        { threshold, rootMargin }
      );

      observer.observe(container);
      return () => observer.disconnect();
    }, []);

    return ref;
  }

  return { useScrollAnimate, useScrollStagger };
}
