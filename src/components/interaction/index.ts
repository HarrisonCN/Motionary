/**
 * motionary/components/interaction — micro-interactions.
 * `<usa-ripple>`, `<usa-magnetic>`, `<usa-tilt>`, `<usa-spotlight>`,
 * `<usa-press>`.
 * 17.16: the micro-interaction engine — `micro(el, 'press hover glow …')`, `applyMicro()` for `data-mo-micro`
 * markup and `feedback(el, 'shake' | 'pop' | …)` spring impulses.
 * 17.18: `springExpand()` / `springDetails()` / `springAllDetails()` — damped expand and collapse for boxes and
 * native `<details>`.
 */
import { defineRipple, type UsaRippleElement } from './ripple';
import { defineMagnetic, type UsaMagneticElement } from './magnetic';
import { defineTilt, type UsaTiltElement } from './tilt';
import { defineSpotlight, type UsaSpotlightElement } from './spotlight';
import { definePress, type UsaPressElement } from './press';

export { defineRipple, defineMagnetic, defineTilt, defineSpotlight, definePress };
export type { UsaRippleElement, UsaMagneticElement, UsaTiltElement, UsaSpotlightElement, UsaPressElement };
export { micro, applyMicro, feedback, microOf, parseMicro, microTransform, readFeel, readSpeed, MICRO_BEHAVIORS, MICRO_FEEDBACK } from './micro';
export type { MicroBehavior, MicroFeedback, MicroOptions, MicroHandle } from './micro';
export { springExpand, springDetails, springAllDetails, isExpanded, expandContentAt } from './expand';
export type { SpringExpandOptions } from './expand';

/** Register every component of this category under its default tag. */
export function defineInteractionComponents(): void {
  defineRipple();
  defineMagnetic();
  defineTilt();
  defineSpotlight();
  definePress();
}

declare global {
  interface HTMLElementTagNameMap {
    'usa-ripple': UsaRippleElement;
    'usa-magnetic': UsaMagneticElement;
    'usa-tilt': UsaTiltElement;
    'usa-spotlight': UsaSpotlightElement;
    'usa-press': UsaPressElement;
  }
}
