/**
 * motionary/components/widgets — the 6.x animated UI widgets, in their own
 * entry so `motionary/components` and `components/lite` keep their size
 * budgets. Every widget is reduced-motion safe and keyboard accessible.
 *
 * ```ts
 * import { defineWidgets } from 'motionary/components/widgets';
 * defineWidgets(); // or defineCarousel(), defineTabBar(), …
 * ```
 * No build step: `<script src="https://unpkg.com/motionary@6/dist/widgets.umd.js">`
 * (registers every widget and every 6.x effect pack; `window.UsaWidgets`).
 */
import { defineCarousel, CAROUSEL_EFFECTS, type UsaCarouselElement } from './carousel';
import { defineTabBar, TAB_INDICATORS, type UsaTabBarElement } from './tab-bar';
import { defineDisclosure, type UsaDisclosureElement } from './disclosure';
import { defineStories, type UsaStoriesElement } from './stories';

export { defineCarousel, defineTabBar, defineDisclosure, defineStories, CAROUSEL_EFFECTS, TAB_INDICATORS };
export type { UsaCarouselElement, UsaTabBarElement, UsaDisclosureElement, UsaStoriesElement };

/** The widgets by release (tag → define function). */
export const WIDGETS: Record<string, Record<string, (tag?: string) => CustomElementConstructor | undefined>> = {
  '6.2': { 'usa-carousel': defineCarousel, 'usa-tab-bar': defineTabBar, 'usa-disclosure': defineDisclosure, 'usa-stories': defineStories },
};

/** Every widget tag, in release order. */
export const WIDGET_TAGS: string[] = Object.values(WIDGETS).flatMap((g) => Object.keys(g));

/** Register every widget (or only those of one release, e.g. `'6.2'`) under its default tag. */
export function defineWidgets(release?: string): void {
  for (const [v, group] of Object.entries(WIDGETS)) if (!release || release === v) for (const [tag, fn] of Object.entries(group)) fn(tag);
}

declare global {
  interface HTMLElementTagNameMap {
    'usa-carousel': UsaCarouselElement;
    'usa-tab-bar': UsaTabBarElement;
    'usa-disclosure': UsaDisclosureElement;
    'usa-stories': UsaStoriesElement;
  }
}
