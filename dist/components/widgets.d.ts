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
 * Home / End. Events `change`, `usa:change` (`{ value }`). Form-associated
 * (7.9): with `name` the value is submitted like `<usa-rating>`'s, which it
 * replaces in 8.0. Reduced motion: no pop,
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
 * `<usa-date-picker>` (6.9) — an inline calendar. Changing month slides the
 * grid in from the direction of travel, the selected day pops inside a
 * spring circle and today has a ring. A real date grid: `role="grid"`,
 * arrows (day / week), PageUp / PageDown (month), Home / End (week start /
 * end), Enter / Space selects; `min` / `max` (ISO `YYYY-MM-DD`) disable days
 * outside the range. `value` (ISO), `first-day` (0 = Sunday, 1 = Monday,
 * default 1), `locale`. Event `usa:change` (`{ value, date }`). Reduced
 * motion: no slide or pop.
 */
interface UsaDatePickerElement extends UsaElement {
    value: string;
    month: string;
    showMonth(delta: number): void;
}
/** Parse `YYYY-MM-DD` as a local date (or null). */
declare function parseISODate(s: string | null | undefined): Date | null;
/** The 6×7 day grid of a month (first row starts on `firstDay`). */
declare function monthGrid(year: number, month: number, firstDay?: number): Date[];
declare function defineDatePicker(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-color-picker>` (6.9) — a colour picker: a saturation / brightness
 * square and a hue strip (both `role="slider"`, arrow keys, Shift = ×10),
 * spring-follow thumbs, a preview chip that morphs to the new colour, and
 * optional `swatches` (comma-separated hex) that pop on pick. `value` is
 * `#rrggbb`. Events `usa:input` while dragging and `usa:change` on release
 * (`{ value }`). Reduced motion: thumbs jump, no pop.
 */
interface UsaColorPickerElement extends UsaElement {
    value: string;
}
/** HSV (h 0–360, s / v 0–1) → `#rrggbb`. */
declare function hsvToHex(h: number, s: number, v: number): string;
/** `#rrggbb` → HSV (or null). */
declare function hexToHsv(hex: string): [number, number, number] | null;
declare function defineColorPicker(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-file-drop>` (6.9) — a file drop zone. Dragging files over it lights
 * the zone with marching-ants borders and lifts the icon; dropping (or
 * choosing via the built-in file input — click / Enter / Space) flies each
 * file into a list with a progress bar. Progress is yours to report with
 * `setProgress(index, 0–1)`, or `simulate` fakes it for demos; a finished
 * file draws a check. Attributes `accept`, `multiple`, `label`. Event
 * `usa:files` (`{ files }`). Reduced motion: no ants, lift or fly-in.
 */
interface UsaFileDropElement extends UsaElement {
    readonly files: File[];
    setProgress(index: number, value: number): void;
    addFiles(files: ArrayLike<File>): void;
    clear(): void;
}
declare function defineFileDrop(tag?: string): CustomElementConstructor | undefined;

interface AnimationTrack {
    /** Selector inside the player (`:scope` = the player). */
    target?: string;
    /** Start time in ms. */
    start?: number;
    duration?: number;
    /** A timeline preset (`fade-up`, `scale`, `blur`…). */
    preset?: string;
    keyframes?: Keyframe[];
    easing?: string;
    /** A registered effect fired at `start` (instead of keyframes). */
    effect?: string;
    options?: Record<string, unknown>;
    label?: string;
}
interface AnimationJSON {
    format?: string;
    version?: number;
    name?: string;
    loop?: boolean;
    /** Total length; defaults to the end of the last track. */
    duration?: number;
    tracks: AnimationTrack[];
}

/**
 * `<usa-keyframe-editor>` (6.9) — animation editor 2.0: a compact timeline
 * for `<usa-player>` JSON. Each track is a row with a draggable bar (drag to
 * move, drag the right edge to resize; ← / → move by 50 ms, Shift + ← / →
 * resize); a playhead scrubs the preview, ▶ plays it. The preview target is
 * the element with id `for` (its children are the tracks' targets). Set
 * `animation` (object or JSON string, or a `<script type="application/json">`
 * child); read `animation` / `toJSON()` for the edited JSON (format
 * `use-scroll-animate/animation` v1 — playable by `<usa-player>`). Event
 * `usa:change` (`{ animation }`). Reduced motion: the preview jumps to the
 * end state.
 */
interface UsaKeyframeEditorElement extends UsaElement {
    animation: AnimationJSON;
    toJSON(): AnimationJSON;
    play(): void;
    seek(ms: number): void;
}
declare function defineKeyframeEditor(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-music-player>` (7.1) — a music player card: the cover turns like a
 * record while playing, the play button morphs ▶ ↔ ❚❚, mini equalizer bars
 * dance, and the progress bar is a scrubbable slider (arrows ±5 s). Plays a
 * child `<audio>` (or `src`), or simulates a track of `duration` seconds for
 * demos. Attributes `title`, `artist`, `cover` (image URL), `src`,
 * `duration`. Methods `play()`, `pause()`, `toggle()`, `seek(s)`; events
 * `usa:play`, `usa:pause`, `usa:seek`, `usa:prev`, `usa:next`. Reduced
 * motion: no spin or dancing bars.
 */
interface UsaMusicPlayerElement extends UsaElement {
    readonly playing: boolean;
    currentTime: number;
    readonly duration: number;
    play(): void;
    pause(): void;
    toggle(): void;
    seek(s: number): void;
}
declare function defineMusicPlayer(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-volume-knob>` (7.1) — a rotary knob: drag up / down (or around),
 * scroll, or use the keyboard (arrows ±1, PageUp / PageDown ±10, Home / End)
 * to turn it; the value arc fills, a ring of LED ticks lights up and the
 * pointer springs to the new angle. `role="slider"`; attributes `value`,
 * `min` (0), `max` (100), `label`, `size`. Events `usa:input` while turning,
 * `usa:change` when done (`{ value }`). Reduced motion: no spring.
 */
interface UsaVolumeKnobElement extends UsaElement {
    value: number;
}
declare function defineVolumeKnob(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-equalizer>` (7.1) — a graphic equalizer: one vertical slider per
 * band (`bands`, comma-separated labels — default 60 Hz … 16 kHz), each with
 * a springy cap; a smooth response curve is drawn through them. Presets
 * (`preset="flat | bass | vocal | rock | electronic"` or `applyPreset()`)
 * glide every band to its gain. Gains are −12…+12 dB; `values` (array),
 * keyboard per band (↑ / ↓ ±1, PageUp / PageDown ±3). Event `usa:change`
 * (`{ values }`). Reduced motion: bands jump.
 */
interface UsaEqualizerElement extends UsaElement {
    values: number[];
    applyPreset(name: string): void;
}
declare const EQ_PRESETS: Record<string, number[]>;
declare function defineEqualizer(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-lyrics>` (7.1) — synced karaoke lyrics. Lines come from `[data-t]`
 * children (start time in seconds) or LRC text (`[mm:ss.xx] line`) in a
 * `<script type="text/plain">` child. Set `time` (s) — or `for` the id of an
 * `<audio>` / `<video>` / `<usa-music-player>` to follow — and the active
 * line glows and scrolls to the centre while a highlight sweeps across it
 * word by word; past lines dim. Click a line to emit `usa:seek` (`{ time }`).
 * Reduced motion: no sweep or smooth scroll — the active line just switches.
 */
interface UsaLyricsElement extends UsaElement {
    time: number;
    readonly lines: {
        t: number;
        text: string;
    }[];
}
/** Parse LRC text into sorted `{ t, text }` lines. */
declare function parseLRC(src: string): {
    t: number;
    text: string;
}[];
declare function defineLyrics(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-bar-chart>` (7.2) — an animated bar chart from data: bars grow in a
 * stagger on first view, value labels count with them, and new data glides
 * every bar to its new height (bars that appear grow, bars that leave
 * shrink). Data from `data` (`[{ label, value }]`), a `values` +
 * `labels` attribute pair, or `<data value="…">label</data>` children.
 * `max`, `unit`, `horizontal`. Accessible as a list of "label: value"
 * items. Reduced motion: no growth or glide.
 */
interface UsaBarChartElement extends UsaElement {
    data: {
        label: string;
        value: number;
    }[];
}
declare function defineBarChart(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-gauge>` (7.2) — a semicircular gauge: the needle swings to `value`
 * on a damped spring (overshoot, settle), the arc fills with a colour that
 * follows `zones` ("60:#22c55e,85:#f59e0b,100:#ef4444" — upper bound:color)
 * and the number counts. `min` / `max` / `unit` / `label`; `role="meter"`.
 * Reduced motion: no swing or count.
 */
interface UsaGaugeElement extends UsaElement {
    value: number;
}
declare function defineGauge(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-sparkline>` (7.2) — a tiny inline trend line. `values`
 * ("3,5,4,8,6,9") or the `data` property; it draws itself on first view, a
 * soft area fades in under it, the last point pulses, and setting new data
 * morphs the line (point-by-point tween). `variant="line | area | bars"`,
 * `color`. Hover / touch shows a dot + value tooltip. Decorative by default
 * with a text summary as `aria-label` ("Trend: 3 to 9, up 200%").
 * Reduced motion: no draw, morph or pulse.
 */
interface UsaSparklineElement extends UsaElement {
    data: number[];
}
declare const SPARK_VARIANTS: readonly ["line", "area", "bars"];
/** Map values to SVG points in a w×h box (with padding). */
declare function sparkPoints(vals: number[], w?: number, h?: number, pad?: number): [number, number][];
declare function defineSparkline(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-kpi>` (7.2) — a KPI card: the value counts up on first view (keeps
 * prefix / suffix / decimals: "$12.4k", "98.2%"), the delta chip slides in
 * with an arrow that points and colours by sign (`delta="+12.5%"`, or
 * `invert` when down is good), and an optional `trend` ("4,6,5,9") draws a
 * sparkline. `label`, `value`, `delta`, `caption`. Setting `value` later
 * rolls from the old number to the new one and flashes the card.
 * Reduced motion: no count, slide or flash.
 */
interface UsaKpiElement extends UsaElement {
    value: string;
}
declare function defineKpi(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-add-to-cart>` (7.3) — a buy button: on click a ghost of the product
 * (`from` selector, default the closest `[data-product]` image) flies into
 * the cart (`cart` selector, default `[data-cart]`, or a `<usa-cart-drawer>`
 * whose `add()` is called with `item` JSON), then the button morphs into a
 * ✓ "Added" state for `hold` ms. `usa:add` (`{ item }`). A real `<button>`
 * inside; `aria-live` announces "Added to cart". Reduced motion: no flight
 * or morph — the cart just bumps.
 */
interface UsaAddToCartElement extends UsaElement {
    add(): void;
}
declare function defineAddToCart(tag?: string): CustomElementConstructor | undefined;

interface CartItem {
    id?: string;
    name: string;
    price: number;
    qty?: number;
    img?: string;
}
/**
 * `<usa-cart-drawer>` (7.3) — a cart button with a count badge plus a drawer
 * that slides in from the side. `add(item)` slides the line in (or bumps its
 * quantity), the badge bumps and the total rolls; lines remove with a collapse.
 * `open` / `close()` / `toggle()`; Esc and the backdrop close it; focus moves
 * into the panel and back. `currency` (default "$"), `label`. Events
 * `usa:change` (`{ items, total }`), `usa:open`, `usa:close`. The panel is a
 * labelled `dialog`; the badge count is announced. Reduced motion: no slide,
 * bump or roll.
 */
interface UsaCartDrawerElement extends UsaElement {
    items: CartItem[];
    readonly total: number;
    readonly count: number;
    open: boolean;
    add(item: CartItem): void;
    removeItem(id: string): void;
    toggle(force?: boolean): void;
}
/** Cart total (7.3). */
declare const cartTotal: (items: CartItem[]) => number;
declare function defineCartDrawer(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-product-gallery>` (7.3) — a product image gallery from its `<img>`
 * children: a large stage plus a thumbnail strip. Picking a thumbnail (click,
 * ←/→, swipe on touch) cross-slides the stage in the direction of travel; the
 * active thumbnail's ring glides to it. Hovering the stage zooms the photo
 * under the pointer (`zoom`, default 2; `nozoom` turns it off). `index`
 * property / attribute; `usa:change` (`{ index }`). The stage is a labelled
 * `group` whose label says "Image 2 of 4: alt". Reduced motion: images swap
 * instantly and the hover zoom is off.
 */
interface UsaProductGalleryElement extends UsaElement {
    index: number;
    readonly count: number;
    go(i: number): void;
    next(): void;
    prev(): void;
}
/** Wrap an index into 0..n-1 (7.3). */
declare const wrapIndex: (i: number, n: number) => number;
declare function defineProductGallery(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-countdown>` (7.3) — a flip-card countdown to `to` (ISO date / time)
 * or for `seconds`: days · hours · minutes · seconds, each digit flips like a
 * split-flap card when it changes. `units` ("d,h,m,s"), `labels`. Fires
 * `usa:tick` (`{ left }`) and `usa:done`; adds `data-done`. A `timer` with an
 * `aria-label` that updates once a minute (not every second). Reduced motion:
 * digits change without the flip.
 */
interface UsaCountdownElement extends UsaElement {
    /** Seconds left. */
    readonly left: number;
    start(): void;
    stop(): void;
}
/** Split seconds into d/h/m/s (7.3). */
declare function splitTime(sec: number): {
    d: number;
    h: number;
    m: number;
    s: number;
};
declare function defineCountdown(tag?: string): CustomElementConstructor | undefined;

interface ChatMessage {
    text: string;
    from?: string;
    me?: boolean;
    time?: string;
}
/**
 * `<usa-message-list>` (7.4) — a chat thread. Messages come from `<p>`
 * children (`data-me`, `data-from`, `data-time`) or `push(msg)`: each new
 * bubble pops in from its side, consecutive bubbles from the same sender are
 * grouped, and the list sticks to the bottom (smooth scroll) unless the
 * reader scrolled up — then a “↓ New messages” pill appears. `typing(name)`
 * shows an animated “… is typing” bubble until the next message (or
 * `typing(false)`). A `log` with `aria-live="polite"`. Reduced motion: no pop
 * or smooth scroll, the typing dots are static.
 */
interface UsaMessageListElement extends UsaElement {
    readonly messages: ChatMessage[];
    push(msg: ChatMessage): void;
    typing(who: string | false): void;
}
declare function defineMessageList(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-reactions>` (7.4) — an emoji reaction bar (Slack / iMessage style).
 * `emojis` ("👍,❤️,😂,🎉") with optional `counts` ("3,1,0,0"). Clicking a pill
 * toggles your reaction: the count rolls up / down, the emoji pops and a few
 * copies float up. A ＋ button opens a small picker that springs open. Each
 * pill is a `button` with `aria-pressed` and a label ("❤️ 2 reactions").
 * `usa:react` (`{ emoji, on, count }`). Reduced motion: no pop, roll or float.
 */
interface UsaReactionsElement extends UsaElement {
    /** emoji → count */
    readonly counts: Record<string, number>;
    /** Your active reactions. */
    readonly mine: string[];
    toggle(emoji: string, on?: boolean): void;
}
/** Parse "👍,❤️" + "3,1" into ordered [emoji, count] pairs (7.4). */
declare function parseReactions(emojis: string, counts?: string): [string, number][];
declare function defineReactions(tag?: string): CustomElementConstructor | undefined;

interface BellNotice {
    id?: string;
    text: string;
    time?: string;
    read?: boolean;
}
/**
 * `<usa-notification-bell>` (7.4) — a bell button with an unread badge and a
 * dropdown list. `notify(n)` rings the bell (a pendulum swing), bumps the
 * badge and slides the notice in at the top of the list; opening the list and
 * “Mark all read” clears the badge (it shrinks away). Notices from `<li>`
 * children too. Esc / outside click close it. The bell is a `button` with
 * `aria-expanded` and a label including the unread count; the list is a
 * labelled region. `usa:notify`, `usa:read`. Reduced motion: no swing, bump
 * or slide.
 */
interface UsaNotificationBellElement extends UsaElement {
    readonly unread: number;
    readonly notices: BellNotice[];
    open: boolean;
    notify(n: BellNotice | string): void;
    markAllRead(): void;
    ring(): void;
}
declare function defineNotificationBell(tag?: string): CustomElementConstructor | undefined;

/** Presence states (7.4). */
declare const PRESENCE_STATES: readonly ["online", "away", "busy", "offline"];
type PresenceState = (typeof PRESENCE_STATES)[number];
/**
 * `<usa-presence>` (7.4) — an avatar with a live status dot: `status`
 * online | away | busy | offline. Going online sends a ripple from the dot;
 * every change cross-fades the dot colour; `speaking` adds a pulsing ring
 * (voice chat), `story` an animated gradient ring (unseen story). Initials from
 * `name` when there is no `src`. Labelled `img` ("Ada Lovelace, online").
 * Reduced motion: no ripple, pulse or ring spin.
 */
interface UsaPresenceElement extends UsaElement {
    status: PresenceState;
}
/** Initials for a display name (7.4). */
declare const initials: (name: string) => string;
declare function definePresence(tag?: string): CustomElementConstructor | undefined;

interface LeaderRow {
    name: string;
    score: number;
    avatar?: string;
}
/**
 * `<usa-leaderboard>` (7.5) — a ranked list from `<li data-score>` children or
 * the `rows` property. When scores change, rows glide to their new rank
 * (FLIP), climbers flash green with ▲n, fallers red with ▼n, and scores roll.
 * Top three get 🥇🥈🥉. `limit`, `me` (name to highlight). An ordered list
 * whose items read "1. Ada, 980 points"; rank changes are announced politely.
 * `usa:rank` (`{ name, from, to }`). Reduced motion: rows jump, no flash or roll.
 */
interface UsaLeaderboardElement extends UsaElement {
    rows: LeaderRow[];
    setScore(name: string, score: number): void;
}
/** Sort rows by score desc, then name (7.5). */
declare const rankRows: (rows: LeaderRow[]) => LeaderRow[];
declare function defineLeaderboard(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-xp-bar>` (7.5) — an experience bar: `level`, `xp`, `per` (XP per
 * level, default 100). `add(n)` fills the bar smoothly; when it overflows the
 * bar fills to the end, the level badge pops (“Level up!”) and the bar restarts
 * with the remainder — several levels in a row if needed. A `progressbar`
 * labelled "Level 3, 40 of 100 XP"; level-ups are announced politely.
 * `usa:xp` (`{ level, xp, gained }`), `usa:levelup` (`{ level }`).
 * Reduced motion: the bar and level change at once, no pop.
 */
interface UsaXpBarElement extends UsaElement {
    level: number;
    xp: number;
    add(n: number): void;
}
/** Apply `gain` XP to (level, xp) with `per` XP per level (7.5). */
declare function levelFor(level: number, xp: number, gain: number, per?: number): {
    level: number;
    xp: number;
    ups: number;
};
declare function defineXpBar(tag?: string): CustomElementConstructor | undefined;

interface WallBadge {
    name: string;
    icon: string;
    locked: boolean;
}
/**
 * `<usa-badge-wall>` (7.5) — an achievement grid from `<li data-icon
 * data-locked>` children: locked badges are grey with a 🔒; `unlock(name)`
 * flips the badge over to its colour side with a shine, and the
 * “3 / 8 unlocked” counter rolls. Each badge is a labelled list item
 * ("First win, unlocked"); unlocks are announced politely. `badges`,
 * `usa:unlock` (`{ name }`). Reduced motion: the badge just changes, no flip.
 */
interface UsaBadgeWallElement extends UsaElement {
    readonly badges: WallBadge[];
    unlock(name: string): boolean;
}
/** Unlocked / total counts for a badge list (7.5). */
declare const badgeProgress: (b: WallBadge[]) => {
    unlocked: number;
    total: number;
};
declare function defineBadgeWall(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-prize-wheel>` (7.5) — a lottery wheel from `segments`
 * ("10%,Free ship,Try again,…"): the Spin button whirls the wheel and it eases
 * out on the result (random, or `spin(index)`), the pointer ticks and the
 * winning segment glows. `duration`, `turns`; `result`, `spinning`;
 * `usa:result` (`{ index, label }`). The button is disabled while spinning and
 * the result is announced politely. Reduced motion: the wheel jumps to the
 * result.
 */
interface UsaPrizeWheelElement extends UsaElement {
    readonly segments: string[];
    readonly result: number;
    readonly spinning: boolean;
    spin(index?: number): Promise<number>;
}
/** Final wheel rotation (deg) that puts segment `index` of `count` under the top pointer after `turns` full turns (7.5). */
declare function wheelAngle(index: number, count: number, turns?: number): number;
declare function definePrizeWheel(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-globe>` (7.6) — a spinning SVG globe (orthographic projection, no
 * WebGL, no map tiles): graticule, an optional `markers` list
 * ("Shanghai:31.2,121.5; London:51.5,-0.1") with pulsing dots, `speed`
 * (degrees per second, default 12; 0 = still), `tilt` (default 18°) and `lon`
 * (start longitude). Spins only while on screen; drag to turn it. `flyTo(name)`
 * rotates a marker to the front (`usa:focus`). The globe is `role="img"`
 * labelled with the marker names; reduced motion: no spin, flyTo jumps.
 */
interface GlobeMarker {
    name: string;
    lat: number;
    lon: number;
}
interface UsaGlobeElement extends UsaElement {
    readonly markers: GlobeMarker[];
    lon: number;
    flyTo(name: string): Promise<void>;
}
/** Orthographic projection on a unit sphere seen from longitude `lon0`, tilted by `tilt` degrees (7.6). */
declare function project(lat: number, lon: number, lon0?: number, tilt?: number): {
    x: number;
    y: number;
    visible: boolean;
};
/** Parse "Name:lat,lon; Name2:lat,lon" (7.6). */
declare function parseMarkers(s: string): GlobeMarker[];
declare function defineGlobe(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-location-card>` (7.6) — a place card with a stylised mini map (SVG
 * streets, no tiles, no network): `name`, `address`, `lat`/`lon`, an optional
 * origin `from-lat`/`from-lon` (the distance is computed with the haversine
 * formula, or set it with `distance`), `href` for a “Directions” link and
 * `unit` (`km` | `mi`). When it scrolls into view the pin drops in with a
 * bounce and a ring pulses under it; with an origin, the route from it draws
 * itself. `usa:arrive` fires when the pin lands. An `<article>` with a heading;
 * reduced motion: pin and route are shown at once.
 */
interface UsaLocationCardElement extends UsaElement {
    readonly km: number | null;
    replay(): void;
}
/** Great-circle distance in km between two lat/lon points (7.6). */
declare function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number;
/** "850 m", "4.2 km", "12 km" — or miles with `unit = 'mi'` (7.6). */
declare function formatDistance(km: number, unit?: 'km' | 'mi'): string;
declare function defineLocationCard(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-field>` (7.7) — an animated text input: the `label` floats up when
 * the field is focused or filled, the underline grows from the caret, and the
 * field validates on blur (native constraint validation: `type`, `required`,
 * `pattern`, `minlength`, `maxlength`). Invalid → the field shakes and the
 * message slides in (`usa:invalid`); valid → a check draws itself
 * (`usa:valid`). With `strength` (on `type="password"`) a 4-step strength
 * meter fills as you type (`passwordStrength()`). The `<input>` lives in the
 * light DOM, so a surrounding `<form>` submits it by its `name`. Reduced
 * motion: no shake, no slide — states switch at once.
 */
interface UsaFieldElement extends UsaElement {
    value: string;
    readonly input: HTMLInputElement | null;
    validate(): boolean;
}
/** 0–4 password strength score with a label (7.7). */
declare function passwordStrength(pw: string): {
    score: 0 | 1 | 2 | 3 | 4;
    label: string;
};
declare function defineField(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-otp>` (7.7) — a one-time-code input: `length` boxes (default 6; an initial `value` is typed in) that
 * auto-advance as you type, step back on Backspace, move with the arrow keys
 * and take a pasted code in one go (`autocomplete="one-time-code"` on the
 * first box for SMS autofill). Each digit pops in; when all boxes are filled
 * `usa:complete` fires with the code. `error()` shakes the row red and clears
 * it, `success()` turns it green with a wave; `fillCode(code)`, `clear()`. `mode="alnum"` allows
 * letters. A labelled `role="group"`; reduced motion: no pop, shake or wave.
 */
interface UsaOtpElement extends UsaElement {
    readonly value: string;
    fillCode(code: string): void;
    clear(): void;
    error(message?: string): void;
    success(): void;
}
/** Keep only the characters an OTP accepts (7.7). */
declare function sanitizeCode(s: string, mode?: 'numeric' | 'alnum'): string;
declare function defineOtp(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-upload-progress>` (7.7) — a file row with an animated progress bar:
 * `name`, `size` (bytes → "2.4 MB"), `value` 0–100 (the bar eases to it and a
 * shine runs over it while uploading), `status` (`uploading` | `done` |
 * `error`; reaching 100 sets `done`). Done → the bar turns into a check that
 * draws itself (`usa:done`); error → the row shakes and shows `message`
 * (`usa:error`) with a Retry button (`usa:retry`). A `role="progressbar"` with
 * value text; reduced motion: no shine, no easing, no shake.
 */
interface UsaUploadProgressElement extends UsaElement {
    value: number;
    status: 'uploading' | 'done' | 'error';
}
/** 1536 → "1.5 KB", 2_400_000 → "2.3 MB" (7.7). */
declare function formatBytes(n: number): string;
declare function defineUploadProgress(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-chat-composer>` (7.8) — an AI chat input: the textarea grows with its
 * text (up to `rows` lines, default 6), Enter sends (Shift+Enter = new line),
 * the send button pops when there is text and morphs into a Stop button while
 * `busy` — then a soft "thinking" glow runs round the composer. Sending emits
 * `usa:send` { text } (cancelable — call `preventDefault()` to keep the text)
 * and clears it; Stop emits `usa:stop`. `placeholder`, `label`, `send()`,
 * `clear()`, `value`. Reduced motion: no glow, no pop.
 */
interface UsaChatComposerElement extends UsaElement {
    value: string;
    busy: boolean;
    send(): boolean;
    clear(): void;
}
declare function defineChatComposer(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-suggestion-chips>` (7.8) — follow-up prompt chips for AI chats:
 * `items="Summarise|Translate|Explain like I'm 5"` (or child `<button>`s /
 * text lines). The chips slide in one after another when they appear (and
 * again after `setItems()`); picking one pulses it, emits `usa:pick`
 * { text, index } and, with `dismiss`, the others fade away. A labelled list
 * of real buttons, arrow keys move between them; reduced motion: no slide or
 * pulse.
 */
interface UsaSuggestionChipsElement extends UsaElement {
    items: string[];
    setItems(items: string[]): void;
}
/** "a | b|c" → ["a", "b", "c"] (7.8). */
declare function parseChips(s: string): string[];
declare function defineSuggestionChips(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-voice-button>` (7.8) — a push-to-talk mic button: click (or Space /
 * Enter) toggles `listening`; while listening a halo breathes round the
 * button and `bars` (default 5) wave beside it. Feed it the live input level
 * with `level` (0–1, e.g. from an `AnalyserNode` or a speech API) and the
 * bars and halo follow it; without levels they run an idle wave. `usa:start`
 * / `usa:stop`. A real `<button aria-pressed>`; `label`. Reduced motion: no
 * halo or wave — the pressed state shows by colour.
 */
interface UsaVoiceButtonElement extends UsaElement {
    listening: boolean;
    level: number;
    toggle(force?: boolean): void;
}
/** Bar heights (0–1) for a level and a phase, centre bars tallest (7.8). */
declare function waveBars(level: number, n?: number, phase?: number): number[];
declare function defineVoiceButton(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-command-palette>` (7.9) — a ⌘K command palette on the native
 * `<dialog>` (top layer, Esc, focus returns to the opener): it scales in,
 * the results filter as you type (fuzzy, matched letters highlighted) and
 * stagger in, a highlight glides to the active row (↑ / ↓, Enter runs it).
 * Commands come from child `<option value="id" data-group="Navigation"
 * data-keys="mod+n">Label</option>` elements or `setCommands([{ id, label,
 * group?, keys? }])`. `inline` renders it open in the page (no dialog,
 * e.g. for docs). `hotkey` (default `mod+k`; `none` to disable) opens it
 * from anywhere; `placeholder`, `label`. `show()`, `close()`, `toggle()`,
 * `opened`; `usa:run` { id, label }, `usa:open`, `usa:close`. A `combobox` +
 * `listbox`; reduced motion: no scale, stagger or glide.
 */
interface PaletteCommand {
    id: string;
    label: string;
    group?: string;
    keys?: string;
}
interface UsaCommandPaletteElement extends UsaElement {
    readonly opened: boolean;
    commands: PaletteCommand[];
    setCommands(list: PaletteCommand[]): void;
    show(): void;
    close(): void;
    toggle(): void;
}
/**
 * Fuzzy match: every query letter in order. Returns a score (higher is
 * better; -1 = no match) and the matched indexes (7.9).
 */
declare function fuzzyMatch(query: string, text: string): {
    score: number;
    hits: number[];
};
/** "mod+shift+k" → ["⌘", "⇧", "K"] on Apple platforms, ["Ctrl", "Shift", "K"] elsewhere (7.9). */
declare function keyLabels(keys: string, apple?: boolean): string[];
/** Does a KeyboardEvent match "mod+k"-style keys? (7.9) */
declare function matchesKeys(e: KeyboardEvent, keys: string, apple?: boolean): boolean;
declare function defineCommandPalette(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-shortcut keys="mod+k">` (7.9) — a keyboard-shortcut hint rendered
 * as keycaps (⌘ on Apple platforms, Ctrl elsewhere). When the user presses
 * the combination anywhere on the page the caps press down one after another
 * and `usa:trigger` fires (`listen="false"` to only display it; `for="id"`
 * clicks that element). Optional `label` text after the caps. The caps are
 * `<kbd>` with an accessible text like "Control K"; reduced motion: no
 * press animation.
 */
interface UsaShortcutElement extends UsaElement {
    readonly labels: string[];
    press(): void;
}
declare function defineShortcut(tag?: string): CustomElementConstructor | undefined;

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
        'usa-date-picker': UsaDatePickerElement;
        'usa-color-picker': UsaColorPickerElement;
        'usa-file-drop': UsaFileDropElement;
        'usa-keyframe-editor': UsaKeyframeEditorElement;
        'usa-music-player': UsaMusicPlayerElement;
        'usa-volume-knob': UsaVolumeKnobElement;
        'usa-equalizer': UsaEqualizerElement;
        'usa-lyrics': UsaLyricsElement;
        'usa-bar-chart': UsaBarChartElement;
        'usa-gauge': UsaGaugeElement;
        'usa-sparkline': UsaSparklineElement;
        'usa-kpi': UsaKpiElement;
        'usa-add-to-cart': UsaAddToCartElement;
        'usa-cart-drawer': UsaCartDrawerElement;
        'usa-product-gallery': UsaProductGalleryElement;
        'usa-countdown': UsaCountdownElement;
        'usa-message-list': UsaMessageListElement;
        'usa-reactions': UsaReactionsElement;
        'usa-notification-bell': UsaNotificationBellElement;
        'usa-presence': UsaPresenceElement;
        'usa-leaderboard': UsaLeaderboardElement;
        'usa-xp-bar': UsaXpBarElement;
        'usa-badge-wall': UsaBadgeWallElement;
        'usa-prize-wheel': UsaPrizeWheelElement;
        'usa-globe': UsaGlobeElement;
        'usa-location-card': UsaLocationCardElement;
        'usa-field': UsaFieldElement;
        'usa-otp': UsaOtpElement;
        'usa-upload-progress': UsaUploadProgressElement;
        'usa-chat-composer': UsaChatComposerElement;
        'usa-suggestion-chips': UsaSuggestionChipsElement;
        'usa-voice-button': UsaVoiceButtonElement;
        'usa-command-palette': UsaCommandPaletteElement;
        'usa-shortcut': UsaShortcutElement;
    }
}

export { CAROUSEL_EFFECTS, EQ_PRESETS, MENU_EFFECTS, MODAL_EFFECTS, NAV_INDICATORS, PRESENCE_STATES, PROGRESS_VARIANTS, SEGMENTED_VARIANTS, SHEET_SIDES, SKELETON_VARIANTS, SPARK_VARIANTS, SWITCH_VARIANTS, TAB_INDICATORS, TIP_PLACEMENTS, TOAST_POSITIONS, TOGGLE_VARIANTS, WEATHER_CONDITIONS, WIDGETS, WIDGET_TAGS, badgeProgress, cartTotal, defineAddToCart, defineBadgeWall, defineBarChart, defineCarousel, defineCartDrawer, defineChatComposer, defineColorPicker, defineCommandPalette, defineCompare, defineCountdown, defineCubeGallery, defineDatePicker, defineDisclosure, defineDock, defineEqualizer, defineField, defineFileDrop, defineGauge, defineGlobe, defineKanban, defineKeyframeEditor, defineKpi, defineLeaderboard, defineLocationCard, defineLyrics, defineMasonryFlow, defineMenu, defineMenuToggle, defineMessageList, defineMilestones, defineModal, defineMusicPlayer, defineNavMorph, defineNotificationBell, defineOdometer, defineOtp, definePagination, definePresence, definePrizeWheel, defineProductGallery, defineProgressRing, definePullCord, defineReactions, defineSegmented, defineSheet, defineShortcut, defineSkeletonReveal, defineSparkline, defineStarRating, defineStepper, defineStories, defineSuggestionChips, defineSwipeDeck, defineSwitch, defineTabBar, defineTip, defineToastStack, defineUploadProgress, defineVoiceButton, defineVolumeKnob, defineWeatherCard, defineWidgets, defineXpBar, formatBytes, formatDistance, fuzzyMatch, haversine, hexToHsv, hsvToHex, initials, keyLabels, levelFor, matchesKeys, monthGrid, pageWindow, parseChips, parseISODate, parseLRC, parseMarkers, parseReactions, passwordStrength, project, rankRows, sanitizeCode, sparkPoints, splitTime, stackToast, waveBars, wheelAngle, wrapIndex };
export type { BellNotice, CartItem, ChatMessage, GlobeMarker, LeaderRow, PaletteCommand, PresenceState, StackToastOptions, UsaAddToCartElement, UsaBadgeWallElement, UsaBarChartElement, UsaCarouselElement, UsaCartDrawerElement, UsaChatComposerElement, UsaColorPickerElement, UsaCommandPaletteElement, UsaCompareElement, UsaCountdownElement, UsaCubeGalleryElement, UsaDatePickerElement, UsaDisclosureElement, UsaDockElement, UsaEqualizerElement, UsaFieldElement, UsaFileDropElement, UsaGaugeElement, UsaGlobeElement, UsaKanbanElement, UsaKeyframeEditorElement, UsaKpiElement, UsaLeaderboardElement, UsaLocationCardElement, UsaLyricsElement, UsaMasonryFlowElement, UsaMenuElement, UsaMenuToggleElement, UsaMessageListElement, UsaMilestonesElement, UsaModalElement, UsaMusicPlayerElement, UsaNavMorphElement, UsaNotificationBellElement, UsaOdometerElement, UsaOtpElement, UsaPaginationElement, UsaPresenceElement, UsaPrizeWheelElement, UsaProductGalleryElement, UsaProgressRingElement, UsaPullCordElement, UsaReactionsElement, UsaSegmentedElement, UsaSheetElement, UsaShortcutElement, UsaSkeletonRevealElement, UsaSparklineElement, UsaStarRatingElement, UsaStepperElement, UsaStoriesElement, UsaSuggestionChipsElement, UsaSwipeDeckElement, UsaSwitchElement, UsaTabBarElement, UsaTipElement, UsaToastStackElement, UsaUploadProgressElement, UsaVoiceButtonElement, UsaVolumeKnobElement, UsaWeatherCardElement, UsaXpBarElement, WallBadge };
