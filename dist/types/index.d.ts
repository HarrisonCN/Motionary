/**
 * use-scroll-animate
 *
 * A lightweight, dependency-free scroll animation library for modern web
 * applications. Built with TypeScript, powered by IntersectionObserver and
 * the Web Animations API. Safe to import during SSR.
 *
 * @license MIT
 * @see https://github.com/HarrisonCN/use-scroll-animate
 */
export { createScrollAnimate } from './core';
export { PRESETS, resolvePreset, resolveEasing, EASING_MAP } from './presets';
export { createReactHooks } from './react';
export { createVueComposables } from './vue';
export type { AnimationPreset, EasingType, AnimationKeyframe, CustomAnimation, ParallaxOptions, AnimateOptions, ScrollAnimateConfig, AnimatedElement, ScrollAnimateInstance, } from './types';
/**
 * Default singleton instance of ScrollAnimate.
 * Ready to use out of the box with sensible defaults.
 *
 * @example
 * ```js
 * import ScrollAnimate from 'use-scroll-animate';
 *
 * // Auto-initialize all elements with data-sa attribute
 * ScrollAnimate.init();
 *
 * // Or manually observe elements
 * ScrollAnimate.observe('.my-element', { animation: 'fade-in-up' });
 * ```
 */
declare const ScrollAnimate: import("./types").ScrollAnimateInstance;
export default ScrollAnimate;
