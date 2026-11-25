/**
 * motionary/components/physics — spring & bounce physics (v2.3).
 * `<usa-spring>` (bounce-in, pop, drop, jelly, rubber-band), `<usa-draggable>`
 * (spring-back, inertia, snap) and `<usa-overscroll>` (elastic edges), plus
 * the spring core: `spring()`, `springEasing()`, `createSpring()`,
 * `SPRING_PRESETS`, `projectInertia()`, `snapTo()`, `rubberBand()`.
 * 17.16 adds the exact spring solver of the micro-interaction system: `springSolution()`, `springFromFeel()` /
 * `springFeel()` (duration + bounce), `microSpring()`, `MICRO_SPRINGS`, `MICRO_FEELS`, `settleTime()`,
 * `microEasing()` and `createSpringGroup()`.
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
export {
  MICRO_SPRINGS,
  MICRO_FEELS,
  springFromFeel,
  springFeel,
  microSpring,
  springSolution,
  settleTime,
  microEasing,
  createSpringGroup,
} from './spring-solver';
export type { SpringFeel, SpringPhysics, MicroSpring, MicroFeel, MicroSpringInput, SpringGroup, SpringGroupOptions } from './spring-solver';
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
