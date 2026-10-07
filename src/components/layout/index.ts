/**
 * use-scroll-animate/components/layout — layout animation (v3.6).
 * `autoAnimate()` / `<usa-auto-animate>` (list & grid reflow),
 * `<usa-masonry>`, and `sharedTransition()` for shared-element transitions
 * (View Transitions API with a FLIP fallback).
 */
import { defineAutoAnimate, defineMasonry, type UsaAutoAnimateElement, type UsaMasonryElement } from './elements';

export { defineAutoAnimate, defineMasonry };
export { autoAnimate, masonryLayout, sharedTransition, flipFrames } from './core';
export type { AutoAnimateOptions, SharedOptions } from './core';
export type { UsaAutoAnimateElement, UsaMasonryElement };
export { configureComponents, prefersReducedMotion } from '../base';
export type { ComponentsConfig, UsaElement } from '../base';

/** Register every component of this category under its default tag. */
export function defineLayoutComponents(): void {
  defineAutoAnimate();
  defineMasonry();
}

declare global {
  interface HTMLElementTagNameMap {
    'usa-auto-animate': UsaAutoAnimateElement;
    'usa-masonry': UsaMasonryElement;
  }
}
