/**
 * use-scroll-animate/components/transitions — view & layout transitions.
 * `<usa-dialog>`, `<usa-accordion>`, `<usa-view-switch>`
 * and the `viewTransition()` and `flip()` helpers (4.0: `<usa-flip-list>` → `<usa-auto-animate>`,
 * `connectedAnimation()` → `sharedTransition()`, both in `components/layout`).
 */
import { defineDialog, type UsaDialogElement } from './dialog';
import { defineAccordion, type UsaAccordionElement } from './accordion';
import { defineViewSwitch, type UsaViewSwitchElement } from './view-switch';

export { defineDialog, defineAccordion, defineViewSwitch };
export { viewTransition, flip } from './helpers';
export type { ViewTransitionOptions, FlipOptions } from './helpers';
export type { DialogVariant } from './dialog';
export type { UsaDialogElement, UsaAccordionElement, UsaViewSwitchElement };
export { configureComponents, prefersReducedMotion } from '../base';
export type { ComponentsConfig, UsaElement } from '../base';

/** Register every component of this category under its default tag. */
export function defineTransitionComponents(): void {
  defineDialog();
  defineAccordion();
  defineViewSwitch();
}

declare global {
  interface HTMLElementTagNameMap {
    'usa-dialog': UsaDialogElement;
    'usa-accordion': UsaAccordionElement;
    'usa-view-switch': UsaViewSwitchElement;
  }
}
