/**
 * use-scroll-animate/components
 *
 * Framework-agnostic, dependency-free animated UI components built on
 * Custom Elements + CSS + the Web Animations API. They run in any browser
 * and in Windows desktop apps that render with a web view: Electron, Tauri
 * (WebView2), WinUI 3 / WPF / WinForms with WebView2, and installed PWAs.
 *
 * ```js
 * import { defineComponents } from 'use-scroll-animate/components';
 * defineComponents(); // registers every <usa-*> element
 * // or only what you use (tree-shakable):
 * import { defineTypewriter } from 'use-scroll-animate/components/text';
 * ```
 *
 * Importing has no side effects and is SSR-safe; nothing is registered
 * until a `define*()` function runs in a browser.
 *
 * @license MIT
 */
import { defineRevealComponents } from './reveal/index';
import { defineTextComponents } from './text/index';
import { defineInteractionComponents } from './interaction/index';
import { defineFeedbackComponents } from './feedback/index';
import { defineBackgroundComponents } from './background/index';
import { defineTransitionComponents } from './transitions/index';
import { definePhysicsComponents } from './physics/index';
import { defineCardComponents } from './cards/index';
import { defineClickComponents } from './click/index';
import { defineUiComponents } from './ui/index';
import { adoptVariants } from './ui/variants';
import { canDefine } from './base';

export * from './reveal/index';
export * from './text/index';
export * from './interaction/index';
export * from './feedback/index';
export * from './background/index';
export * from './transitions/index';
export * from './physics/index';
export * from './cards/index';
export * from './click/index';
export * from './ui/index';

/** The component categories and their default tags. */
export const COMPONENT_CATEGORIES = {
  reveal: ['usa-reveal', 'usa-stagger', 'usa-scroll-progress', 'usa-scrolly'],
  text: ['usa-typewriter', 'usa-split-text', 'usa-scramble', 'usa-counter', 'usa-shimmer-text', 'usa-text-rotate'],
  interaction: ['usa-ripple', 'usa-magnetic', 'usa-tilt', 'usa-spotlight', 'usa-press', 'usa-toggle'],
  feedback: ['usa-spinner', 'usa-skeleton', 'usa-progress', 'usa-toaster', 'usa-check'],
  background: ['usa-aurora', 'usa-particles', 'usa-grain', 'usa-marquee', 'usa-acrylic'],
  transitions: ['usa-dialog', 'usa-accordion', 'usa-flip-list', 'usa-view-switch'],
  physics: ['usa-spring', 'usa-draggable', 'usa-overscroll'],
  cards: ['usa-card', 'usa-card-stack', 'usa-sticky-stack', 'usa-carousel-3d'],
  click: ['usa-click', 'usa-button', 'usa-icon-morph', 'usa-like', 'usa-hold', 'usa-double-tap', 'usa-checkbox'],
  ui: ['usa-tabs', 'usa-drawer', 'usa-bottom-sheet', 'usa-pull-refresh', 'usa-fab', 'usa-navbar', 'usa-slider', 'usa-rating', 'usa-tooltip', 'usa-popover', 'usa-badge', 'usa-avatar-stack'],
} as const;

export type ComponentCategory = keyof typeof COMPONENT_CATEGORIES;

const BY_CATEGORY: Record<ComponentCategory, () => void> = {
  reveal: defineRevealComponents,
  text: defineTextComponents,
  interaction: defineInteractionComponents,
  feedback: defineFeedbackComponents,
  background: defineBackgroundComponents,
  transitions: defineTransitionComponents,
  physics: definePhysicsComponents,
  cards: defineCardComponents,
  click: defineClickComponents,
  ui: defineUiComponents,
};

/**
 * Register every `<usa-*>` component (or only the given categories).
 * Safe to call more than once and on the server (no-op without DOM).
 */
export function defineComponents(categories?: ComponentCategory[]): void {
  if (canDefine()) adoptVariants();
  (categories || (Object.keys(BY_CATEGORY) as ComponentCategory[])).forEach((c) => BY_CATEGORY[c]?.());
}
