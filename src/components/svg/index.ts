/**
 * use-scroll-animate/components/svg — SVG animation (v3.3).
 * `<usa-draw>` (line drawing), `<usa-morph>` (path morph), `<usa-mask-reveal>`
 * (mask / clip-path reveals) and `<usa-anim-icon>` (animated icons), plus
 * `interpolatePath()`, `morphTo()`, `drawLines()`.
 */
import { defineDraw, type UsaDrawElement } from './draw';
import { defineMorph, type UsaMorphElement } from './morph';
import { defineMaskReveal, type UsaMaskRevealElement } from './mask-reveal';
import { defineAnimIcon, type UsaAnimIconElement } from './anim-icon';

export { defineDraw, defineMorph, defineMaskReveal, defineAnimIcon };
export { interpolatePath, pathsCompatible, morphTo, drawLines } from './core';
export type { MorphOptions } from './core';
export { MASK_SHAPES } from './mask-reveal';
export { ANIM_ICONS } from './anim-icon';
export type { UsaDrawElement, UsaMorphElement, UsaMaskRevealElement, UsaAnimIconElement };

/** Register every component of this category under its default tag. */
export function defineSvgComponents(): void {
  defineDraw();
  defineMorph();
  defineMaskReveal();
  defineAnimIcon();
}

declare global {
  interface HTMLElementTagNameMap {
    'usa-draw': UsaDrawElement;
    'usa-morph': UsaMorphElement;
    'usa-mask-reveal': UsaMaskRevealElement;
    'usa-anim-icon': UsaAnimIconElement;
  }
}
