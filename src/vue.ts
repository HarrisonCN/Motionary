/**
 * use-scroll-animate - Vue 3 Integration
 * Provides useScrollAnimate composable for Vue 3 applications.
 *
 * A thin wrapper around the core engine, so it shares its behaviour: `once`,
 * `offset`, custom easing functions, parallax, `prefers-reduced-motion`
 * support, and cleanup on unmount.
 */

import type { AnimateOptions, ScrollAnimateInstance } from './types';
import { createScrollAnimate } from './core';

export function createVueComposables(Vue: {
  ref: <T>(value: T | null) => { value: T | null };
  onMounted: (fn: () => void) => void;
  onUnmounted: (fn: () => void) => void;
}) {
  // Created lazily on the client so importing on the server is side-effect free.
  let instance: ScrollAnimateInstance | null = null;
  const getInstance = () => instance || (instance = createScrollAnimate());

  function useScrollAnimate(options: AnimateOptions = {}) {
    const animateRef = Vue.ref<Element>(null);
    let el: Element | null = null;

    Vue.onMounted(() => {
      const value = animateRef.value as unknown as { $el?: unknown } | Element | null;
      // Support refs on components as well as plain elements.
      const target =
        value && typeof Element !== 'undefined' && !(value instanceof Element) && (value as any).$el instanceof Element
          ? ((value as any).$el as Element)
          : (value as Element | null);
      if (!target) return;
      el = target;
      getInstance().observe(el, options);
    });

    Vue.onUnmounted(() => {
      if (el) getInstance().unobserve(el);
      el = null;
    });

    return { animateRef };
  }

  return { useScrollAnimate };
}
