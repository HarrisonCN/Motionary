/**
 * motionary/components/ui — animated UI components + style variants (v2.6).
 * `<usa-tabs>`, `<usa-drawer>`, `<usa-bottom-sheet>`, `<usa-pull-refresh>`,
 * `<usa-fab>`, `<usa-navbar>`, `<usa-slider>`,
 * `<usa-popover>`, `<usa-badge>`, `<usa-avatar-stack>`,
 * and `variant="minimal | neon | glass | brutalist | fluent | material"`
 * design tokens (`setVariant()`, `VARIANTS`).
 */
import { defineTabs, type UsaTabsElement } from './tabs';
import { defineDrawer, defineBottomSheet, type UsaDrawerElement, type UsaBottomSheetElement } from './sheet';
import { definePullRefresh, type UsaPullRefreshElement } from './pull-refresh';
import { defineFab, type UsaFabElement } from './fab';
import { defineNavbar, type UsaNavbarElement } from './navbar';
import { defineSlider, type UsaSliderElement } from './slider';
import { definePopover, type UsaPopoverElement } from './popover';
import { defineBadge, type UsaBadgeElement } from './badge';
import { defineAvatarStack, type UsaAvatarStackElement } from './avatar-stack';

export { defineTabs, defineDrawer, defineBottomSheet, definePullRefresh, defineFab, defineNavbar, defineSlider, definePopover, defineBadge, defineAvatarStack };
export { VARIANTS, setVariant, adoptVariants } from './variants';
export type { Variant } from './variants';
export type { Placement } from './position';
export type {
  UsaTabsElement,
  UsaDrawerElement,
  UsaBottomSheetElement,
  UsaPullRefreshElement,
  UsaFabElement,
  UsaNavbarElement,
  UsaSliderElement,
  UsaPopoverElement,
  UsaBadgeElement,
  UsaAvatarStackElement,
};

/** Register every component of this category under its default tag. */
export function defineUiComponents(): void {
  defineTabs();
  defineDrawer();
  defineBottomSheet();
  definePullRefresh();
  defineFab();
  defineNavbar();
  defineSlider();
  definePopover();
  defineBadge();
  defineAvatarStack();
}

declare global {
  interface HTMLElementTagNameMap {
    'usa-tabs': UsaTabsElement;
    'usa-drawer': UsaDrawerElement;
    'usa-bottom-sheet': UsaBottomSheetElement;
    'usa-pull-refresh': UsaPullRefreshElement;
    'usa-fab': UsaFabElement;
    'usa-navbar': UsaNavbarElement;
    'usa-slider': UsaSliderElement;
    'usa-popover': UsaPopoverElement;
    'usa-badge': UsaBadgeElement;
    'usa-avatar-stack': UsaAvatarStackElement;
  }
}
