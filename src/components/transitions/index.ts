/**
 * use-scroll-animate/components/transitions — view & layout transitions.
 * `<usa-dialog>`, `<usa-accordion>`, `<usa-flip-list>`, `<usa-view-switch>`
 * and the `viewTransition()`, `flip()`, `connectedAnimation()` helpers.
 */
import { defineDialog, type UsaDialogElement } from './dialog';
import { defineAccordion, type UsaAccordionElement } from './accordion';
import { defineFlipList, type UsaFlipListElement } from './flip-list';
import { defineViewSwitch, type UsaViewSwitchElement } from './view-switch';

export { defineDialog, defineAccordion, defineFlipList, defineViewSwitch };
export { viewTransition, flip, connectedAnimation } from './helpers';
export type { ViewTransitionOptions, FlipOptions, ConnectedOptions } from './helpers';
export type { DialogVariant } from './dialog';
export type { UsaDialogElement, UsaAccordionElement, UsaFlipListElement, UsaViewSwitchElement };
export { configureComponents, prefersReducedMotion } from '../base';
export type { ComponentsConfig, UsaElement } from '../base';

/** Register every component of this category under its default tag. */
export function defineTransitionComponents(): void {
  defineDialog();
  defineAccordion();
  defineFlipList();
  defineViewSwitch();
}

declare global {
  interface HTMLElementTagNameMap {
    'usa-dialog': UsaDialogElement;
    'usa-accordion': UsaAccordionElement;
    'usa-flip-list': UsaFlipListElement;
    'usa-view-switch': UsaViewSwitchElement;
  }
}
