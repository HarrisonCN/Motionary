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
 * `<usa-toast-stack>` (6.3) — notifications that pile up into a collapsed
 * stack (newest in front, older ones peeking behind), fan out on hover or
 * focus, auto-dismiss (paused while hovered), and can be swiped away.
 *
 * Attributes: `position` (`bottom-right` · `bottom-left` · `bottom-center` ·
 * `top-right` · `top-left` · `top-center`), `duration` (ms, `0` = sticky),
 * `max` (visible in the stack), `contained` (positioned inside its parent
 * instead of the viewport). API: `show(message | options)` → id,
 * `dismiss(id)`, `clear()`; module helper `stackToast()` uses the first stack on
 * the page (creating one). Any `[data-usa-toast="message"]` element shows a
 * toast on click (`data-usa-toast-type`, `data-usa-target`). Events:
 * `usa:show`, `usa:dismiss` (`{ id, reason }`). Toasts live in a polite live
 * region. Reduced motion: no slide or swipe animation.
 */
interface StackToastOptions {
    message?: string;
    title?: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    /** ms; 0 = stays until dismissed. Defaults to the stack's `duration`. */
    duration?: number;
    /** An action button. */
    action?: {
        label: string;
        onClick?: () => void;
    };
}
interface UsaToastStackElement extends UsaElement {
    show(input: string | StackToastOptions): string;
    dismiss(id: string, reason?: string): void;
    clear(): void;
    readonly count: number;
}
declare const TOAST_POSITIONS: readonly ["bottom-right", "bottom-left", "bottom-center", "top-right", "top-left", "top-center"];
declare function defineToastStack(tag?: string): CustomElementConstructor | undefined;
/** Show a toast on the first `<usa-toast-stack>` of the page (one is created when missing). */
declare function stackToast(input: string | StackToastOptions, stack?: UsaToastStackElement | null): string;

/**
 * `<usa-modal>` and `<usa-sheet>` (6.3) — modal overlays on the native
 * `<dialog>` (top layer, focus trap, Esc, inert page), with animated open
 * and close and a fading, blurred backdrop.
 *
 * - `<usa-modal effect="scale | slide-up | flip | origin">` — `origin`
 *   grows the dialog out of the button that opened it.
 * - `<usa-sheet side="right | left | bottom | top">` — a side sheet; a
 *   bottom sheet can be dragged down to dismiss (`<div data-handle>` or the
 *   built-in grab handle).
 *
 * Attributes: `open` (initial), `label`, `persistent` (backdrop click / Esc
 * don't close). Any element with `data-usa-open="<id>"` opens the overlay
 * with that id; `[data-usa-close]` inside closes it. API: `show(trigger?)`,
 * `close(value?)`, `toggle()`, `opened`. Events: `usa:open`, `usa:close`
 * (`{ value }`). Focus returns to the opener. Reduced motion: no movement,
 * a short fade.
 */
interface UsaOverlayElement extends UsaElement {
    readonly opened: boolean;
    readonly returnValue: string;
    show(trigger?: Element | null): void;
    close(value?: string): Promise<void>;
    toggle(): void;
}
type UsaModalElement = UsaOverlayElement;
type UsaSheetElement = UsaOverlayElement;
declare const MODAL_EFFECTS: readonly ["scale", "slide-up", "flip", "origin"];
declare const SHEET_SIDES: readonly ["right", "left", "bottom", "top"];
declare const defineModal: (tag?: string) => CustomElementConstructor | undefined;
declare const defineSheet: (tag?: string) => CustomElementConstructor | undefined;

/**
 * `<usa-menu>` (6.3) — a dropdown menu that unfolds from its button: the
 * list scales out of the trigger corner and the items cascade in. The first
 * child is the trigger (or `[data-trigger]`); the other children (`<button>`,
 * `<a>`, `<hr>` separators) become menu items.
 *
 * Attributes: `placement` (`bottom-start` · `bottom-end` · `top-start` ·
 * `top-end`), `effect` (`scale` · `fold` · `slide`). Keyboard: Enter / Space /
 * ArrowDown open, arrows and Home / End move, Esc closes, Tab leaves; outside
 * clicks close. API: `open()`, `close()`, `toggle()`, `opened`. Events:
 * `usa:select` (`{ index, value, item }`), `usa:open`, `usa:close`. Reduced
 * motion: a short fade.
 */
interface UsaMenuElement extends UsaElement {
    readonly opened: boolean;
    open(focus?: 'first' | 'last'): void;
    close(focusTrigger?: boolean): void;
    toggle(): void;
}
declare const MENU_EFFECTS: readonly ["scale", "fold", "slide"];
declare function defineMenu(tag?: string): CustomElementConstructor | undefined;

/**
 * 6.4 meters: `<usa-progress-ring>` and `<usa-odometer>`.
 *
 * `<usa-progress-ring value="64" max="100">` — a ring, `bar` or `semi`
 * (semicircle gauge) `variant`; the arc eases (with a little overshoot) to
 * each new value while the centre label counts; `gradient="#a,#b"`;
 * no `value` = indeterminate (spinning arc). `role="progressbar"`.
 * Event `usa:complete` when it reaches max.
 *
 * `<usa-odometer value="1234">` — rolling digit wheels: every digit column
 * spins to its new digit (lower digits travel further), columns slide in /
 * out when the length changes; `locale` grouping via Intl.NumberFormat,
 * `decimals`, `prefix` / `suffix`, `duration`. The accessible name is the
 * formatted number.
 *
 * Reduced motion: values switch without animation.
 */
interface UsaProgressRingElement extends UsaElement {
    value: number | null;
    max: number;
}
interface UsaOdometerElement extends UsaElement {
    value: number;
    readonly text: string;
}
declare const PROGRESS_VARIANTS: readonly ["ring", "bar", "semi"];
declare function defineProgressRing(tag?: string): CustomElementConstructor | undefined;
declare function defineOdometer(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-skeleton-reveal loading>` (6.4) — a skeleton generated from the
 * real content: while `loading`, every text line, image and marked block
 * (`[data-skeleton]`) of the children is measured and covered by a
 * placeholder with one synchronized shimmer (`variant="wave | pulse |
 * glow"`). Remove `loading` (or call `reveal()`) and the placeholders
 * dissolve top-to-bottom while the content fades in from a blur.
 *
 * `aria-busy` follows `loading`. Event `usa:reveal`. Reduced motion: no
 * shimmer, a plain crossfade.
 */
interface UsaSkeletonRevealElement extends UsaElement {
    loading: boolean;
    reveal(): Promise<void>;
}
declare const SKELETON_VARIANTS: readonly ["wave", "pulse", "glow"];
declare function defineSkeletonReveal(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-star-rating value="3.5">` (6.4) — rating stars 2.0: the fill
 * follows the pointer (hover preview, `step="0.5"` half stars), a click
 * pops the chosen star and throws a small sparkle burst, the other stars
 * ripple in sequence. `max`, `step` (`1` · `0.5`), `readonly`, `label`,
 * `icon` (`star` · `heart`). Keyboard: it is a `role="slider"` — arrows,
 * Home / End. Event `usa:change` (`{ value }`). Reduced motion: no pop,
 * burst or ripple.
 */
interface UsaStarRatingElement extends UsaElement {
    value: number;
}
declare function defineStarRating(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-milestones>` (6.5) — a scroll-drawn timeline: a progress line grows
 * down the rail as you scroll, and each milestone (a child element, with an
 * optional `data-date`) pops its dot and slides its card in when the line
 * reaches it. Cards alternate sides on wide screens (`layout="alternate"`,
 * default) or sit on one side (`layout="left"`); below 640 px they always
 * stack. Events `usa:reach` (`{ index }`). Reduced motion: everything is
 * shown, the line is full.
 */
interface UsaMilestonesElement extends UsaElement {
    readonly reached: number;
}
declare function defineMilestones(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-masonry-flow>` (6.5) — a masonry grid whose items glide to their
 * new places (FLIP) whenever the layout changes: resize, items added or
 * removed, `filter()`, `shuffle()`, `sort()`. Columns come from `min`
 * (minimum column width, px) and `gap`. Hidden items scale out, shown ones
 * scale in. Event `usa:layout` (`{ columns }`). Reduced motion: items jump.
 */
interface UsaMasonryFlowElement extends UsaElement {
    readonly columns: number;
    layout(animate?: boolean): void;
    filter(fn: ((el: HTMLElement) => boolean) | string | null): void;
    shuffle(): void;
    sort(compare: (a: HTMLElement, b: HTMLElement) => number): void;
}
declare function defineMasonryFlow(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-compare>` (6.5) — before / after image compare slider. The first
 * child is "before", the second "after" (images, videos or any element).
 * Drag the handle (or anywhere with `hover`), click to jump, or use the
 * keyboard (it is a `role="slider"`: arrows, Page Up / Down, Home / End).
 * `position` (0–100, default 50), `orientation="horizontal | vertical"`,
 * `intro` plays a short sweep when it scrolls into view, `labels="Before,
 * After"`. Event `usa:change` (`{ position }`). Reduced motion: no intro
 * sweep or eased jumps.
 */
interface UsaCompareElement extends UsaElement {
    position: number;
}
declare function defineCompare(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-cube-gallery>` (6.5) — a gallery on a turning 3D cube: the current
 * slide and the next one sit on adjacent faces and the cube rotates between
 * them. Swipe / drag, arrow keys, prev / next buttons, `autoplay` (ms;
 * pauses on hover, focus and off screen), `axis="y | x"`. API `next()`,
 * `prev()`, `goTo(i)`, `index`; event `usa:change`. Reduced motion: slides
 * switch with a fade.
 */
interface UsaCubeGalleryElement extends UsaElement {
    readonly index: number;
    next(): void;
    prev(): void;
    goTo(i: number): void;
}
declare function defineCubeGallery(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-dock>` (6.6) — a macOS-style dock: items magnify with a smooth
 * cosine falloff as the pointer moves along it, neighbours make room, and a
 * click bounces the item (`bounce`). Children are the items (`<a>` /
 * `<button>`, each with an accessible name); `data-label` shows a tooltip
 * label above the hovered item. Attributes: `magnify` (max scale, 1.9),
 * `range` (px of influence, 140), `orientation="horizontal | vertical"`.
 * Keyboard focus magnifies the focused item. Reduced motion: no
 * magnification or bounce (labels still show).
 */
interface UsaDockElement extends UsaElement {
    readonly items: HTMLElement[];
}
declare function defineDock(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-nav-morph>` (6.6) — navigation links with an indicator that morphs
 * between them: it follows the hovered / focused link (stretching from the
 * old one, leading edge first) and settles back on the current page
 * (`aria-current="page"`, `active` index, or a click). `indicator="underline |
 * pill | blob | dot"`. Arrow keys move focus across links. Event
 * `usa:change` (`{ index }`). Reduced motion: the indicator jumps.
 */
interface UsaNavMorphElement extends UsaElement {
    active: number;
}
declare const NAV_INDICATORS: readonly ["underline", "pill", "blob", "dot"];
declare function defineNavMorph(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-menu-toggle>` (6.6) — the hamburger button that morphs into its
 * "open" icon: `variant="cross"` (✕, default), `arrow` (←), `minus` (—) or
 * `plus-x` (+ turning into ✕). It is a real `<button>`-like control
 * (`role="button"`, Space / Enter, `aria-expanded`); `for="<id>"` sets
 * `aria-controls` and toggles the `hidden` attribute (or `.open()` /
 * `.close()` / `.show()`) of that element. `pressed` reflects the state.
 * Event `usa:toggle` (`{ open }`). Reduced motion: the icon switches without
 * the morph.
 */
interface UsaMenuToggleElement extends UsaElement {
    open: boolean;
    toggle(force?: boolean): void;
}
declare const TOGGLE_VARIANTS: readonly ["cross", "arrow", "minus", "plus-x"];
declare function defineMenuToggle(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-tip>` (6.6) — tooltip / popover 2.0. Wrap the trigger; the tip
 * content is the `text` attribute or a child with `[slot="tip"]` / `[data-tip]`
 * (rich content). It springs out of the trigger with its arrow,
 * auto-flips to stay inside the viewport and shifts along the edge.
 * `placement="top | bottom | left | right"`, `trigger="hover | click"`
 * (`click` = popover: toggles, Esc / outside click close), `delay` (ms).
 * Hover tips also open on keyboard focus and close on Esc (WCAG 1.4.13).
 * Events `usa:open`, `usa:close`. Reduced motion: a short fade.
 */
interface UsaTipElement extends UsaElement {
    readonly opened: boolean;
    show(): void;
    hide(): void;
}
declare const TIP_PLACEMENTS: readonly ["top", "bottom", "left", "right"];
declare function defineTip(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-stepper>` (6.7) — a step indicator / wizard. Each child is a step
 * (its text is the label). `value` is the current step (0-based); finished
 * steps pop a check mark, the connecting rail fills toward the current step
 * and the current step pulses once. `orientation="vertical"` stacks the
 * steps. `next()` / `prev()` / `value`; event `usa:change` (`{ value }`).
 * The list is an ordered list with `aria-current="step"`. Reduced motion: no
 * pop or pulse, the rail jumps.
 */
interface UsaStepperElement extends UsaElement {
    value: number;
    readonly steps: HTMLElement[];
    next(): void;
    prev(): void;
}
declare function defineStepper(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-pagination>` (6.7) — page buttons with a sliding "ink" that springs
 * to the current page (squashing as it travels) and numbers that slide in
 * from the direction of travel when the window of pages shifts. Attributes
 * `total`, `page` (1-based), `siblings` (pages each side, 1). Prev / next
 * buttons, ellipses, `aria-current="page"`; event `usa:change` (`{ page }`).
 * Reduced motion: the ink jumps and numbers do not slide.
 */
interface UsaPaginationElement extends UsaElement {
    page: number;
    readonly total: number;
}
/** The visible page list: numbers and `'…'` gaps (1-based). */
declare function pageWindow(page: number, total: number, siblings?: number): (number | '…')[];
declare function definePagination(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-segmented>` (6.7) — a segmented control (iOS style): a thumb slides
 * under the chosen segment with a spring and stretches while it travels;
 * the chosen label scales up slightly. Children are the segments (buttons
 * or any element). It is a radio group (`role="radiogroup"`, arrow keys,
 * Home / End, roving tabindex). `value` is the selected index; `usa:change`
 * (`{ value, label }`). `variant="ios | pill | outline"`. Reduced motion:
 * the thumb jumps.
 */
interface UsaSegmentedElement extends UsaElement {
    value: number;
    readonly segments: HTMLElement[];
}
declare const SEGMENTED_VARIANTS: readonly ["ios", "pill", "outline"];
declare function defineSegmented(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-switch>` (6.7) — toggle switch variants: `ios` (the thumb stretches
 * while pressed and slides), `daynight` (sun → moon with stars and
 * clouds), `bounce` (the thumb squashes and bounces at the end) and
 * `liquid` (a gooey fill pours behind the thumb). A real switch:
 * `role="switch"`, `aria-checked`, Space / Enter, `disabled`; `checked`
 * property / attribute; inside a `<form>` with `name` it submits `value`
 * ("on") when checked. Event `usa:change` (`{ checked }`). Reduced motion:
 * no squash, bounce or pour — it just switches.
 */
interface UsaSwitchElement extends UsaElement {
    checked: boolean;
    toggle(force?: boolean): void;
}
declare const SWITCH_VARIANTS: readonly ["ios", "daynight", "bounce", "liquid"];
declare function defineSwitch(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-kanban>` (6.8) — a kanban board with drag-sort. Children are the
 * columns (any element; a `[data-title]` attribute or its first heading is
 * the title); the column's `[data-card]` children (or `<li>`s) are cards.
 * Drag a card (pointer or touch): it lifts and tilts toward the drag
 * direction, a placeholder opens where it will land, and the other cards
 * glide out of the way (FLIP). Keyboard: Space / Enter picks a card up,
 * arrows move it (← → between columns, ↑ ↓ within), Space drops, Esc cancels;
 * moves are announced politely. Event `usa:move` (`{ card, from, to, index }`).
 * Reduced motion: no tilt or glide.
 */
interface UsaKanbanElement extends UsaElement {
    readonly columns: HTMLElement[];
    cardsOf(col: HTMLElement): HTMLElement[];
    move(card: HTMLElement, to: HTMLElement, index: number): void;
}
declare function defineKanban(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-swipe-deck>` (6.8) — a stack of swipe cards (Tinder style). Drag the
 * top card: it follows the pointer and rotates, "LIKE" / "NOPE" stamps fade
 * in, and past `threshold` px (or a fast fling) it flies off; otherwise it
 * springs back. The next card scales up from behind. Buttons / keys:
 * `like()`, `nope()`, ← / →, and `undo()` brings the last card back.
 * Event `usa:swipe` (`{ card, dir: 'left' | 'right', index }`) and
 * `usa:empty`. Reduced motion: cards fade instead of flying.
 */
interface UsaSwipeDeckElement extends UsaElement {
    readonly cards: HTMLElement[];
    readonly top: HTMLElement | null;
    like(): void;
    nope(): void;
    undo(): void;
}
declare function defineSwipeDeck(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-weather-card>` (6.8) — an animated weather widget. `condition`
 * (`clear | cloudy | rain | snow | storm | fog | night`) picks an animated
 * icon and sky (sun rays turn, clouds drift, rain and snow fall, a gentle —
 * flash-safe — bolt, fog bands, twinkling stars); `temp` counts up to the
 * value, `unit` (°), `place` and `label` fill the text. Changing `condition`
 * cross-fades the scene. Reduced motion: static icon, no count-up. The scene
 * is decorative; the text is the accessible summary (`role="group"` with an
 * `aria-label` like "Rain, 12°, Lisbon").
 */
interface UsaWeatherCardElement extends UsaElement {
    condition: string;
}
declare const WEATHER_CONDITIONS: readonly ["clear", "cloudy", "rain", "snow", "storm", "fog", "night"];
declare function defineWeatherCard(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-pull-cord>` (6.8) — a lamp pull-cord switch. Drag the handle down
 * (or click / Space / Enter): the cord stretches, and when released past
 * `threshold` px it toggles `on` with a click-bounce; the cord swings back on
 * a damped spring (simulated, drawn as an SVG curve). The lamp shade above
 * glows when on (CSS custom property `--usa-pc-glow`). A real switch:
 * `role="switch"`, `aria-checked`; event `usa:change` (`{ on }`). Reduced
 * motion: no swing — it just toggles.
 */
interface UsaPullCordElement extends UsaElement {
    on: boolean;
    toggle(force?: boolean): void;
}
declare function definePullCord(tag?: string): CustomElementConstructor | undefined;

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
        'usa-dock': UsaDockElement;
        'usa-nav-morph': UsaNavMorphElement;
        'usa-menu-toggle': UsaMenuToggleElement;
        'usa-tip': UsaTipElement;
        'usa-stepper': UsaStepperElement;
        'usa-pagination': UsaPaginationElement;
        'usa-segmented': UsaSegmentedElement;
        'usa-switch': UsaSwitchElement;
        'usa-kanban': UsaKanbanElement;
        'usa-swipe-deck': UsaSwipeDeckElement;
        'usa-weather-card': UsaWeatherCardElement;
        'usa-pull-cord': UsaPullCordElement;
    }
}

export { CAROUSEL_EFFECTS, MENU_EFFECTS, MODAL_EFFECTS, NAV_INDICATORS, PROGRESS_VARIANTS, SEGMENTED_VARIANTS, SHEET_SIDES, SKELETON_VARIANTS, SWITCH_VARIANTS, TAB_INDICATORS, TIP_PLACEMENTS, TOAST_POSITIONS, TOGGLE_VARIANTS, WEATHER_CONDITIONS, WIDGETS, WIDGET_TAGS, defineCarousel, defineCompare, defineCubeGallery, defineDisclosure, defineDock, defineKanban, defineMasonryFlow, defineMenu, defineMenuToggle, defineMilestones, defineModal, defineNavMorph, defineOdometer, definePagination, defineProgressRing, definePullCord, defineSegmented, defineSheet, defineSkeletonReveal, defineStarRating, defineStepper, defineStories, defineSwipeDeck, defineSwitch, defineTabBar, defineTip, defineToastStack, defineWeatherCard, defineWidgets, pageWindow, stackToast };
export type { StackToastOptions, UsaCarouselElement, UsaCompareElement, UsaCubeGalleryElement, UsaDisclosureElement, UsaDockElement, UsaKanbanElement, UsaMasonryFlowElement, UsaMenuElement, UsaMenuToggleElement, UsaMilestonesElement, UsaModalElement, UsaNavMorphElement, UsaOdometerElement, UsaPaginationElement, UsaProgressRingElement, UsaPullCordElement, UsaSegmentedElement, UsaSheetElement, UsaSkeletonRevealElement, UsaStarRatingElement, UsaStepperElement, UsaStoriesElement, UsaSwipeDeckElement, UsaSwitchElement, UsaTabBarElement, UsaTipElement, UsaToastStackElement, UsaWeatherCardElement };
