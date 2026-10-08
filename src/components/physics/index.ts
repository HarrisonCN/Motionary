/**
 * motionary/components/physics — spring & bounce physics (v2.3).
 * `<usa-spring>` (bounce-in, pop, drop, jelly, rubber-band), `<usa-draggable>`
 * (spring-back, inertia, snap) and `<usa-overscroll>` (elastic edges), plus
 * the spring core: `spring()`, `springEasing()`, `createSpring()`,
 * `SPRING_PRESETS`, `projectInertia()`, `snapTo()`, `rubberBand()`.
 */
import { defineSpring, type UsaSpringElement } from './spring-effect';
import { defineDraggable, type UsaDraggableElement } from './draggable';
import { defineOverscroll, type UsaOverscrollElement } from './overscroll';

export { defineSpring, defineDraggable, defineOverscroll };
export { SPRING_EFFECTS, springEffectKeyframes } from './spring-effect';
export type { SpringEffect } from './spring-effect';
export {
  SPRING_PRESETS,
  resolveSpring,
  stepSpring,
  springSamples,
  springEasing,
  linearEasing,
  supportsLinearEasing,
  spring,
  createSpring,
  projectInertia,
  snapTo,
  rubberBand,
} from './spring';
export type { SpringConfig, SpringPreset, SpringInput, SpringValue, SpringValueOptions } from './spring';
export type { UsaSpringElement, UsaDraggableElement, UsaOverscrollElement };

/** Register every component of this category under its default tag. */
export function definePhysicsComponents(): void {
  defineSpring();
  defineDraggable();
  defineOverscroll();
}

declare global {
  interface HTMLElementTagNameMap {
    'usa-spring': UsaSpringElement;
    'usa-draggable': UsaDraggableElement;
    'usa-overscroll': UsaOverscrollElement;
  }
}
