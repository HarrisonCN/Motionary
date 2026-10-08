/**
 * motionary/components/click — click & tap effects (v2.5).
 * `<usa-click>` (ripple, burst, confetti, squish, press-spring, shake),
 * `<usa-button>` (button click deformation: squash, wobble, gooey, dent;
 * shape morph; submit → loading → success), `<usa-icon-morph>`,
 * `<usa-like>`, `<usa-hold>`, `<usa-double-tap>`, `<usa-checkbox>`, plus
 * `haptic()`. 6.0: `burst()`, `confetti()` and `shake()` were removed — play
 * the registered effects instead: `playEffect(el, 'burst' | 'confetti' | 'shake')`.
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
export { haptic } from './fx';
export type { BurstOptions, ConfettiOptions } from './fx';
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
