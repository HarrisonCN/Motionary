/**
 * use-scroll-animate - Solid integration
 *
 * ```tsx
 * import { scrollAnimate, scrollStagger, useScrollAnimate } from 'use-scroll-animate/solid';
 * false && scrollAnimate; // keep the directive import (TypeScript)
 *
 * <div use:scrollAnimate={{ animation: 'zoom-in' }}>…</div>
 * <ul use:scrollStagger={{ stagger: 60 }}>…</ul>
 * <div ref={useScrollAnimate({ animation: 'fade-in-up' })}>…</div>
 * ```
 *
 * `solid-js` is an optional peer dependency (only needed for this entry).
 */

import { onCleanup, onMount } from 'solid-js';
import type { AnimateOptions, ScrollAnimateInstance } from './types';
import { createScrollAnimate } from './core';
import { staggerChildren, type StaggerOptions } from './stagger';

export interface SolidScrollAnimateOptions extends AnimateOptions {
  instance?: ScrollAnimateInstance;
}
export interface SolidScrollStaggerOptions extends StaggerOptions {
  instance?: ScrollAnimateInstance;
}

declare module 'solid-js' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface Directives {
      scrollAnimate: SolidScrollAnimateOptions | true;
      scrollStagger: SolidScrollStaggerOptions | true;
    }
  }
}

let shared: ScrollAnimateInstance | null = null;
const getInstance = (own?: ScrollAnimateInstance) => own || shared || (shared = createScrollAnimate());

function read<T>(accessor?: () => T | true | undefined): T {
  const v = accessor?.();
  return (v && v !== true ? v : {}) as T;
}

function observe(el: Element, options: SolidScrollAnimateOptions): void {
  const { instance, ...opts } = options;
  const sa = getInstance(instance);
  // Wait until the element is in the document (directives/refs run before insertion).
  onMount(() => sa.observe(el, opts));
  onCleanup(() => sa.unobserve(el));
}

/** Directive: `<div use:scrollAnimate={{ animation: 'fade-in' }} />` */
export function scrollAnimate(el: Element, accessor?: () => SolidScrollAnimateOptions | true | undefined): void {
  observe(el, read(accessor));
}

/** Directive: `<ul use:scrollStagger={{ stagger: 60, observeChildren: true }} />` */
export function scrollStagger(el: Element, accessor?: () => SolidScrollStaggerOptions | true | undefined): void {
  const { instance, ...opts } = read<SolidScrollStaggerOptions>(accessor);
  let stop: (() => void) | undefined;
  onMount(() => {
    stop = staggerChildren(el, opts, getInstance(instance));
  });
  onCleanup(() => stop?.());
}

/** Primitive returning a `ref` callback: `<div ref={useScrollAnimate({ animation: 'fade-in-up' })} />` */
export function useScrollAnimate(options: SolidScrollAnimateOptions = {}): (el: Element) => void {
  let el: Element | undefined;
  const { instance, ...opts } = options;
  const sa = getInstance(instance);
  onMount(() => el && sa.observe(el, opts));
  onCleanup(() => el && sa.unobserve(el));
  return (node: Element) => {
    el = node;
  };
}
