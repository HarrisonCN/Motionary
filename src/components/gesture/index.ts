/**
 * motionary/components/gesture — unified gestures (v3.2).
 * `gesture()` recognises pan, swipe, pinch, long-press, tap and double-tap
 * with release velocities for springs; `<usa-swipeable>` (swipe-to-dismiss)
 * and `<usa-pinch-zoom>` are built on it.
 */
import { defineSwipeable, type UsaSwipeableElement } from './swipeable';
import { definePinchZoom, type UsaPinchZoomElement } from './pinch-zoom';

export { defineSwipeable, definePinchZoom };
export { gesture, swipeDirection, pinchScale } from './core';
export type { GestureHandlers, GestureOptions, PanState, SwipeState, SwipeDirection, PinchState, PressState } from './core';
export type { UsaSwipeableElement, UsaPinchZoomElement };

/** Register every component of this category under its default tag. */
export function defineGestureComponents(): void {
  defineSwipeable();
  definePinchZoom();
}

declare global {
  interface HTMLElementTagNameMap {
    'usa-swipeable': UsaSwipeableElement;
    'usa-pinch-zoom': UsaPinchZoomElement;
  }
}
