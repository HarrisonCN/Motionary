/**
 * use-scroll-animate/components/depth — 3D (v3.5).
 * `<usa-cube>` (CSS 3D cube), `<usa-depth>` (layered depth parallax driven by
 * pointer, device orientation or scroll) and `deviceTilt()`. The 3D ring
 * carousel is `<usa-carousel-3d>` in `components/cards`.
 */
import { defineCube, type UsaCubeElement } from './cube';
import { defineDepth, type UsaDepthElement } from './depth-el';

export { defineCube, defineDepth };
export { deviceTilt, orientationToTilt, requestOrientationPermission, supportsOrientation } from './core';
export type { TiltReading } from './core';
export type { UsaCubeElement, UsaDepthElement };
export { configureComponents, prefersReducedMotion } from '../base';
export type { ComponentsConfig, UsaElement } from '../base';

/** Register every component of this category under its default tag. */
export function defineDepthComponents(): void {
  defineCube();
  defineDepth();
}

declare global {
  interface HTMLElementTagNameMap {
    'usa-cube': UsaCubeElement;
    'usa-depth': UsaDepthElement;
  }
}
