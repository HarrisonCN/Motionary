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
import { definePageComponents } from './page/index';
import { defineTimelineComponents } from './timeline/index';
import { defineGestureComponents } from './gesture/index';
import { defineSvgComponents } from './svg/index';
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
export * from './page/index';
export * from './timeline/index';
export * from './gesture/index';
export * from './svg/index';

export { COMPONENT_CATEGORIES } from './index-tags';
export type { ComponentCategory } from './index-tags';
import { COMPONENT_CATEGORIES, type ComponentCategory } from './index-tags';

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
  page: definePageComponents,
  timeline: defineTimelineComponents,
  gesture: defineGestureComponents,
  svg: defineSvgComponents,
};

/**
 * Register every `<usa-*>` component (or only the given categories).
 * Safe to call more than once and on the server (no-op without DOM).
 */
export function defineComponents(categories?: ComponentCategory[]): void {
  if (canDefine()) adoptVariants();
  (categories || (Object.keys(BY_CATEGORY) as ComponentCategory[])).forEach((c) => BY_CATEGORY[c]?.());
}
