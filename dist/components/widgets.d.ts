/**
 * Members shared by every `<usa-*>` element. Attribute helpers, a cleanup
 * bag that is emptied on disconnect, and motion helpers that degrade to the
 * final state without WAAPI or under reduced motion.
 */
interface UsaElement extends HTMLElement {
    /** `true` while reduced motion applies to this element. */
    readonly reduced: boolean;
}

/**
 * `<usa-carousel>` (6.2) — swipeable carousel / slider. Each child is a slide.
 * Attributes: `effect` (`slide` · `fade` · `scale` · `cards` — 3D coverflow),
 * `autoplay` (ms; pauses on hover, focus, when off screen and under reduced
 * motion), `loop`, `index`, `label` ("Carousel"), `no-controls`, `no-dots`.
 * Drag / swipe with a pointer, arrow keys when focused. API: `next()`,
 * `prev()`, `goTo(i)`, `index`, `length`. Events: `usa:change` (`{ index, from }`).
 * Reduced motion: slides switch without movement.
 */
interface UsaCarouselElement extends UsaElement {
    index: number;
    readonly length: number;
    next(): void;
    prev(): void;
    goTo(i: number): void;
}
declare const CAROUSEL_EFFECTS: readonly ["slide", "fade", "scale", "cards"];
declare function defineCarousel(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-tab-bar>` (6.2) — tabs with an animated indicator that stretches
 * from the old tab to the new one (leading edge first, then the trailing edge
 * catches up). Children: `<button>` tabs, and optional panels marked
 * `data-panel` (in the same order). Attributes: `indicator` (`pill` ·
 * `underline` · `glow` · `gooey`), `selected` (index), `label`. Arrow keys,
 * Home/End. API: `select(i)`, `selected`. Events: `usa:change` (`{ index, from }`).
 * Panels slide in from the side of travel. Reduced motion: no stretch / slide.
 */
interface UsaTabBarElement extends UsaElement {
    selected: number;
    select(i: number): void;
}
declare const TAB_INDICATORS: readonly ["pill", "underline", "glow", "gooey"];
declare function defineTabBar(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-disclosure>` (6.2) — accordion 2.0 on native `<details>`: the
 * content springs open / closed (height + fade), the chevron flips with an
 * overshoot. Children: `<details><summary>…</summary>…</details>`.
 * Attributes: `multiple` (allow several open; default: one at a time),
 * `spring` (preset, default `gentle`), `variant="cards"`. API: `openAll()`,
 * `closeAll()`, `toggle(i, force?)`. Events: `usa:toggle` (`{ index, open }`).
 * Native semantics (keyboard, find-in-page) kept. Reduced motion: instant.
 */
interface UsaDisclosureElement extends UsaElement {
    toggle(i: number, force?: boolean): void;
    openAll(): void;
    closeAll(): void;
}
declare function defineDisclosure(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-stories>` (6.2) — story viewer: segmented progress bars at the top,
 * auto-advance, tap the left / right third to go back / forward, press and
 * hold to pause, a pause button (WCAG 2.2.2). Each child is one story.
 * Attributes: `duration` (ms per story, 5000), `loop`, `paused`.
 * API: `next()`, `prev()`, `goTo(i)`, `pause()`, `play()`, `index`.
 * Events: `usa:change` (`{ index }`), `usa:end`. Reduced motion: no
 * auto-advance (paused until the user navigates), cross-fade only.
 */
interface UsaStoriesElement extends UsaElement {
    readonly index: number;
    next(): void;
    prev(): void;
    goTo(i: number): void;
    pause(): void;
    play(): void;
}
declare function defineStories(tag?: string): CustomElementConstructor | undefined;

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

/** The widgets by release (tag → define function). */
declare const WIDGETS: Record<string, Record<string, (tag?: string) => CustomElementConstructor | undefined>>;
/** Every widget tag, in release order. */
declare const WIDGET_TAGS: string[];
/** Register every widget (or only those of one release, e.g. `'6.2'`) under its default tag. */
declare function defineWidgets(release?: string): void;
declare global {
    interface HTMLElementTagNameMap {
        'usa-carousel': UsaCarouselElement;
        'usa-tab-bar': UsaTabBarElement;
        'usa-disclosure': UsaDisclosureElement;
        'usa-stories': UsaStoriesElement;
    }
}

export { CAROUSEL_EFFECTS, TAB_INDICATORS, WIDGETS, WIDGET_TAGS, defineCarousel, defineDisclosure, defineStories, defineTabBar, defineWidgets };
export type { UsaCarouselElement, UsaDisclosureElement, UsaStoriesElement, UsaTabBarElement };
