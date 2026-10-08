/**
 * use-scroll-animate/components/click — click & tap effects (v2.5).
 * `<usa-click>` (ripple, burst, confetti, squish, press-spring, shake),
 * `<usa-button>` (button click deformation: squash, wobble, gooey, dent;
 * shape morph; submit → loading → success), `<usa-icon-morph>`,
 * `<usa-like>`, `<usa-hold>`, `<usa-double-tap>`, `<usa-checkbox>`, plus
 * `haptic()` (`burst()`, `confetti()`, `shake()` are deprecated in 5.9 —
 * use the registered effects through `playEffect()`).
 */
import { defineClick, type UsaClickElement } from './click';
import { defineButton, type UsaButtonElement } from './button';
import { defineIconMorph, type UsaIconMorphElement } from './icon-morph';
import { defineLike, type UsaLikeElement } from './like';
import { defineHold, type UsaHoldElement } from './hold';
import { defineDoubleTap, type UsaDoubleTapElement } from './double-tap';
import { defineCheckbox, type UsaCheckboxElement } from './checkbox';

export { defineClick, defineButton, defineIconMorph, defineLike, defineHold, defineDoubleTap, defineCheckbox };
export { CLICK_EFFECTS } from './click';
export type { ClickEffect } from './click';
export { BUTTON_DEFORMS } from './button';
export type { ButtonDeform, ButtonShape, ButtonState } from './button';
export { MORPH_ICONS, morphPath } from './icon-morph';
import { burst as burstFx, confetti as confettiFx, shake as shakeFx, type BurstOptions, type ConfettiOptions } from './fx';
import { deprecate } from '../base';
export { haptic } from './fx';

/**
 * @deprecated 5.9 — removed in 6.0. Use the registered effect:
 * `playEffect(document.body, 'burst', { x, y, ...options })` (`use-scroll-animate/components/fx`).
 */
export function burst(x: number, y: number, options: BurstOptions = {}): number {
  deprecate('burst()', "burst() is deprecated and removed in 6.0 — use playEffect(el, 'burst', { x, y, …options }) from use-scroll-animate/components/fx (npx usa-codemod-6).");
  return burstFx(x, y, options);
}

/** @deprecated 5.9 — removed in 6.0. Use `playEffect(document.body, 'confetti', options)`. */
export function confetti(options: ConfettiOptions = {}): number {
  deprecate('confetti()', "confetti() is deprecated and removed in 6.0 — use playEffect(el, 'confetti', options) from use-scroll-animate/components/fx (npx usa-codemod-6).");
  return confettiFx(options);
}

/** @deprecated 5.9 — removed in 6.0. Use `playEffect(el, 'shake', { intensity, duration })`. */
export function shake(el: Element, intensity = 8, duration = 480): Animation | null {
  deprecate('shake()', "shake() is deprecated and removed in 6.0 — use playEffect(el, 'shake', { intensity, duration }) from use-scroll-animate/components/fx (npx usa-codemod-6).");
  return shakeFx(el, intensity, duration);
}
export type { BurstOptions, ConfettiOptions };
export type { UsaClickElement, UsaButtonElement, UsaIconMorphElement, UsaLikeElement, UsaHoldElement, UsaDoubleTapElement, UsaCheckboxElement };

/** Register every component of this category under its default tag. */
export function defineClickComponents(): void {
  defineClick();
  defineButton();
  defineIconMorph();
  defineLike();
  defineHold();
  defineDoubleTap();
  defineCheckbox();
}

declare global {
  interface HTMLElementTagNameMap {
    'usa-click': UsaClickElement;
    'usa-button': UsaButtonElement;
    'usa-icon-morph': UsaIconMorphElement;
    'usa-like': UsaLikeElement;
    'usa-hold': UsaHoldElement;
    'usa-double-tap': UsaDoubleTapElement;
    'usa-checkbox': UsaCheckboxElement;
  }
}
