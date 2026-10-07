/**
 * use-scroll-animate
 *
 * A lightweight, dependency-free scroll animation library for modern web
 * applications. Built with TypeScript, powered by IntersectionObserver and
 * the Web Animations API (or the native scroll-driven timeline). Safe to
 * import during SSR. Framework integrations live in the subpath entries:
 * `use-scroll-animate/react`, `/vue`, `/svelte`, `/solid`, `/element`.
 *
 * @license MIT
 * @see https://github.com/HarrisonCN/use-scroll-animate
 */

export { createScrollAnimate, getScrollProgress, supportsScrollTimeline } from './core';
export { staggerChildren } from './stagger';
export { timeline, resolvePosition, TIMELINE_PRESETS } from './components/timeline/core';
export { parallax } from './parallax';
export { PRESETS, resolvePreset, resolveEasing, EASING_MAP } from './presets';
export type {
  AnimationPreset,
  EasingType,
  AnimationKeyframe,
  CustomAnimation,
  ProgressMode,
  ScrollEngine,
  AnimateOptions,
  ScrollAnimateConfig,
  AnimatedElement,
  ScrollAnimateInstance,
} from './types';
export type { StaggerOptions } from './stagger';
export type { ParallaxHelperOptions } from './parallax';
export type { Timeline, TimelineOptions, TimelineStepOptions, TimelinePosition, ScrubOptions } from './components/timeline/core';

// Default export: a ready-to-use singleton instance
import { createScrollAnimate } from './core';

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
const ScrollAnimate = /* @__PURE__ */ createScrollAnimate();
export default ScrollAnimate;
