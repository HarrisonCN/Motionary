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
import { defineToastStack, stackToast, TOAST_POSITIONS, type UsaToastStackElement, type StackToastOptions } from './toast';
import { defineModal, defineSheet, MODAL_EFFECTS, SHEET_SIDES, type UsaModalElement, type UsaSheetElement } from './overlay';
import { defineMenu, MENU_EFFECTS, type UsaMenuElement } from './menu';
import { defineProgressRing, defineOdometer, PROGRESS_VARIANTS, type UsaProgressRingElement, type UsaOdometerElement } from './meters';
import { defineSkeletonReveal, SKELETON_VARIANTS, type UsaSkeletonRevealElement } from './skeleton-reveal';
import { defineStarRating, type UsaStarRatingElement } from './star-rating';
import { defineMilestones, type UsaMilestonesElement } from './milestones';
import { defineMasonryFlow, type UsaMasonryFlowElement } from './masonry-flow';
import { defineCompare, type UsaCompareElement } from './compare';
import { defineCubeGallery, type UsaCubeGalleryElement } from './cube-gallery';

export { defineCarousel, defineTabBar, defineDisclosure, defineStories, CAROUSEL_EFFECTS, TAB_INDICATORS };
export type { UsaCarouselElement, UsaTabBarElement, UsaDisclosureElement, UsaStoriesElement };
export { defineToastStack, stackToast, TOAST_POSITIONS, defineModal, defineSheet, MODAL_EFFECTS, SHEET_SIDES, defineMenu, MENU_EFFECTS };
export type { UsaToastStackElement, StackToastOptions, UsaModalElement, UsaSheetElement, UsaMenuElement };

export { defineProgressRing, defineOdometer, PROGRESS_VARIANTS, defineSkeletonReveal, SKELETON_VARIANTS, defineStarRating };
export type { UsaProgressRingElement, UsaOdometerElement, UsaSkeletonRevealElement, UsaStarRatingElement };

export { defineMilestones, defineMasonryFlow, defineCompare, defineCubeGallery };
export type { UsaMilestonesElement, UsaMasonryFlowElement, UsaCompareElement, UsaCubeGalleryElement };

/** The widgets by release (tag → define function). */
export const WIDGETS: Record<string, Record<string, (tag?: string) => CustomElementConstructor | undefined>> = {
  '6.2': { 'usa-carousel': defineCarousel, 'usa-tab-bar': defineTabBar, 'usa-disclosure': defineDisclosure, 'usa-stories': defineStories },
  '6.3': { 'usa-toast-stack': defineToastStack, 'usa-modal': defineModal, 'usa-sheet': defineSheet, 'usa-menu': defineMenu },
  '6.4': { 'usa-progress-ring': defineProgressRing, 'usa-odometer': defineOdometer, 'usa-skeleton-reveal': defineSkeletonReveal, 'usa-star-rating': defineStarRating },
  '6.5': { 'usa-milestones': defineMilestones, 'usa-masonry-flow': defineMasonryFlow, 'usa-compare': defineCompare, 'usa-cube-gallery': defineCubeGallery },
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
    'usa-toast-stack': UsaToastStackElement;
    'usa-modal': UsaModalElement;
    'usa-sheet': UsaSheetElement;
    'usa-menu': UsaMenuElement;
    'usa-progress-ring': UsaProgressRingElement;
    'usa-odometer': UsaOdometerElement;
    'usa-skeleton-reveal': UsaSkeletonRevealElement;
    'usa-star-rating': UsaStarRatingElement;
    'usa-milestones': UsaMilestonesElement;
    'usa-masonry-flow': UsaMasonryFlowElement;
    'usa-compare': UsaCompareElement;
    'usa-cube-gallery': UsaCubeGalleryElement;
  }
}
