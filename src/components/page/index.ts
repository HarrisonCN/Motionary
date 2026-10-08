/**
 * motionary/components/page — page & app-wide effects (v2.7).
 * Page transitions (`pageTransition()`, `enableMpaTransitions()`,
 * `themeTransition()`), `<usa-cursor>`, `smoothScroll()` / `scrollToTarget()`,
 * `<usa-fullpage>`, `<usa-loading-bar>` + `loadingBar`, `<usa-back-to-top>`,
 * `<usa-ambient>`, `<usa-splash>`, `<usa-auto-skeleton>` and the global motion
 * intensity (`setMotionIntensity()`, `<usa-motion-switch>`).
 */
import { defineCursor, type UsaCursorElement } from './cursor';
import { defineFullpage, type UsaFullpageElement } from './fullpage';
import { defineLoadingBar, type UsaLoadingBarElement } from './loading-bar';
import { defineBackToTop, type UsaBackToTopElement } from './back-to-top';
import { defineAmbient, type UsaAmbientElement } from './ambient';
import { defineSplash, type UsaSplashElement } from './splash';
import { defineAutoSkeleton, type UsaAutoSkeletonElement } from './auto-skeleton';
import { defineMotionSwitch, type UsaMotionSwitchElement } from './motion-switch';

export { defineCursor, defineFullpage, defineLoadingBar, defineBackToTop, defineAmbient, defineSplash, defineAutoSkeleton, defineMotionSwitch };
export { pageTransition, enableMpaTransitions, themeTransition, supportsViewTransitions, PAGE_EFFECTS } from './transitions';
export type { PageEffect, PageTransitionOptions } from './transitions';
export { smoothScroll, scrollToTarget } from './scroll';
export type { SmoothScrollOptions } from './scroll';
export { loadingBar } from './loading-bar';
export { CURSOR_MODES } from './cursor';
export type { CursorMode } from './cursor';
export { AMBIENT_EFFECTS } from './ambient';
export type { AmbientEffect } from './ambient';
export { setMotionIntensity, restoreMotionIntensity, setMotionLevel, getMotionLevel } from './motion-switch';
export type { MotionSwitchLevel } from './motion-switch';
export { getMotionIntensity, MOTION_SCALE } from '../base';
export type { MotionIntensity } from '../base';
export type { UsaCursorElement, UsaFullpageElement, UsaLoadingBarElement, UsaBackToTopElement, UsaAmbientElement, UsaSplashElement, UsaAutoSkeletonElement, UsaMotionSwitchElement };

/** Register every component of this category under its default tag. */
export function definePageComponents(): void {
  defineCursor();
  defineFullpage();
  defineLoadingBar();
  defineBackToTop();
  defineAmbient();
  defineSplash();
  defineAutoSkeleton();
  defineMotionSwitch();
}

declare global {
  interface HTMLElementTagNameMap {
    'usa-cursor': UsaCursorElement;
    'usa-fullpage': UsaFullpageElement;
    'usa-loading-bar': UsaLoadingBarElement;
    'usa-back-to-top': UsaBackToTopElement;
    'usa-ambient': UsaAmbientElement;
    'usa-splash': UsaSplashElement;
    'usa-auto-skeleton': UsaAutoSkeletonElement;
    'usa-motion-switch': UsaMotionSwitchElement;
  }
}
