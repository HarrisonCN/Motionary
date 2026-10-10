type MotionSensitivity = 'full' | 'gentle' | 'minimal' | 'static';
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
 * `<usa-clock-control>` (8.0) — a small control bar for the unified motion
 * clock: play / pause every Motionary animation on the page and switch the
 * speed (`speeds="0.25,0.5,1,2"`). It reflects changes made elsewhere
 * (`motionClock.rate = …`). Handy for demos, debugging and as a user-facing
 * "pause animations" control. A labelled `group` with a toggle button
 * (`aria-pressed`) and a radio group of speeds; `usa:change` { rate, paused }.
 */
interface UsaClockControlElement extends UsaElement {
    readonly rate: number;
    readonly paused: boolean;
}
declare function defineClockControl(tag?: string): CustomElementConstructor | undefined;

/**
 * `motionary/engine` (= `motionary/components/engine`, 8.0) — the unified
 * timeline engine and SSR hydration animations.
 *
 * - **`motionClock`** — the one clock every component, effect and frame loop
 *   runs on: `rate` (slow-mo / fast-forward), `pause()` / `resume()` /
 *   `toggle()`, `time`, `onChange()`. Pausing it freezes every animation
 *   started by Motionary on the page.
 * - **`createTimeline()`** — sequence animations on that clock:
 *   `add(target, keyframes, options, position)` with positions `1200`
 *   (ms), `'+=200'` / `'-=100'` (after / overlapping the previous end) or
 *   `'<'` / `'<+=80'` (with the previous start); `play()`, `pause()`,
 *   `seek(ms)`, `progress` (0–1, settable), `duration`, `finished`.
 * - **`hydrateMotion()`** — animate server-rendered `[data-usa-hydrate]`
 *   markup in on hydration without a flash: `ssrHead()` gives the `<style>`
 *   + one-line `<script>` for the document head (content stays visible
 *   without JS, and a CSS fallback reveals it after 3 s if JS never runs).
 */

type TimelinePosition = number | string;
interface TimelineEntry {
    target: Element;
    keyframes: Keyframe[];
    options: KeyframeAnimationOptions;
    start: number;
    end: number;
}
interface MotionTimeline {
    readonly entries: readonly TimelineEntry[];
    readonly duration: number;
    readonly playing: boolean;
    progress: number;
    readonly finished: Promise<void>;
    add(target: Element | Element[] | NodeListOf<Element> | null, keyframes: Keyframe[], options?: number | KeyframeAnimationOptions, position?: TimelinePosition): MotionTimeline;
    play(): MotionTimeline;
    pause(): MotionTimeline;
    seek(ms: number): MotionTimeline;
    restart(): MotionTimeline;
    cancel(): void;
}

/**
 * `<usa-hydrate effect="fade-up" stagger="60">` (8.0) — SSR hydration
 * animation for its children: server-rendered content stays hidden only
 * while JS is on and the element has not upgraded yet (with `ssrHead()` in
 * the document head; a 3 s CSS fallback reveals it anyway), then the
 * children animate in one after another on the unified clock and the
 * element gets `data-usa-hydrated` (`usa:hydrated`). `effect`: fade ·
 * fade-up · fade-down · scale · blur · slide-left; `duration`; `replay()`;
 * `timeline`. Reduced motion: shown at once.
 */
interface UsaHydrateElement extends UsaElement {
    readonly timeline: MotionTimeline | null;
    replay(): void;
}
declare function defineHydrate(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-red-envelope amount="88.88" from="Grandma">` (8.1) — a Lunar New
 * Year red envelope (红包): tap / Enter / Space and the flap swings open, the
 * card slides out with the `amount` (counting up, `currency`, default ¥)
 * and gold coins pop out. `message` (default 恭喜发财), `from`, `opened`
 * (initial state); `open()`, `close()`; `usa:open` { amount }. A real
 * `<button aria-expanded>`; reduced motion: opens without the swing, slide,
 * count or coins.
 */
interface UsaRedEnvelopeElement extends UsaElement {
    readonly opened: boolean;
    open(): void;
    close(): void;
}
declare function defineRedEnvelope(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-festival-banner theme="lunar">` (8.1) — a festive announcement
 * banner with an ambient scene behind its text: `lunar` (swaying lanterns,
 * drifting gold sparkles), `xmas` (falling snow, twinkling lights),
 * `halloween` (bats, a glowing moon), `fireworks` (bursting rockets). Its
 * own content is the message; `dismissible` adds a close button
 * (`usa:dismiss`). The decorations are `aria-hidden`, the banner is a
 * labelled `region`; the scene only animates while on screen and is static
 * under reduced motion.
 */
interface UsaFestivalBannerElement extends UsaElement {
    theme: string;
    dismiss(): void;
}
declare const FESTIVAL_THEMES: readonly ["lunar", "xmas", "halloween", "fireworks"];
declare function defineFestivalBanner(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-terminal title="zsh">` (8.2) — a retro terminal window: child lines
 * `<p data-cmd>npm i motionary</p>` are typed after the `prompt` (default
 * `$`) character by character with a blinking block cursor, other children
 * print as output, one after another, when the window scrolls into view.
 * `speed` (ms per character), `theme` (`dark` · `green` · `amber`), `loop`;
 * `replay()`, `skip()`; `usa:done`. A labelled `log` region; reduced motion:
 * everything is shown at once.
 */
interface UsaTerminalElement extends UsaElement {
    replay(): void;
    skip(): void;
}
declare function defineTerminal(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-retro-button variant="pixel">Start</usa-retro-button>` (8.2) —
 * retro-styled buttons with era-true press motion: `pixel` (8-bit, hard
 * stepped press and a pixel shadow), `crt` (phosphor glow that flickers on
 * press), `y2k` (glossy chrome pill that bounces) and `win95` (bevelled
 * grey box that sinks). The content becomes the label of a real `<button>`
 * (`type`, `disabled`, `name`, `value` are passed on). Reduced motion: no
 * flicker or bounce — only the pressed colours.
 */
interface UsaRetroButtonElement extends UsaElement {
    readonly button: HTMLButtonElement | null;
    variant: string;
}
declare const RETRO_VARIANTS: readonly ["pixel", "crt", "y2k", "win95"];
declare function defineRetroButton(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-organic-card>` (8.3) — a card with a soft, living blob shape: its
 * outline slowly breathes while on screen, morphs towards the pointer on
 * hover and settles into a rounder shape on focus. A gradient `tint`
 * (`leaf` · `ocean` · `petal` · `sand`) sits behind the content. The content
 * is your own markup; `seed` picks the starting shape. Reduced motion: a
 * static blob.
 */
interface UsaOrganicCardElement extends UsaElement {
    morph(seed?: number): void;
}
declare function defineOrganicCard(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-liquid-nav>` (8.3) — a navigation bar whose active indicator is a
 * drop of liquid: moving to another item it stretches like a droplet
 * towards the target, then settles with a wobble (gooey SVG filter).
 * Children are links or buttons; `value` (index) / `aria-current`; arrow
 * keys move focus. `usa:change` { index, item }. A labelled `nav`; reduced
 * motion: the drop jumps.
 */
interface UsaLiquidNavElement extends UsaElement {
    value: number;
}
declare function defineLiquidNav(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-hud-panel title="SYSTEM">` (8.4) — a sci-fi HUD panel: angled
 * corners, a glowing frame that draws itself in when the panel scrolls into
 * view, a header with a blinking status light and `status` text, and its
 * own content below. Child `<meter>`-like rows `<p data-value="72">Shields</p>`
 * become animated bar readouts. `color`, `status`; `boot()` replays the
 * intro; `usa:boot`. A labelled `region`; reduced motion: shown at once.
 */
interface UsaHudPanelElement extends UsaElement {
    boot(): void;
}
declare function defineHudPanel(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-radar targets="A:40,0.6; B:200,0.3">` (8.4) — a sci-fi radar scope:
 * a conic sweep turns round (`speed` seconds per turn) and each target
 * (`name:bearing°,distance 0–1`) lights up and fades as the beam passes
 * over it. `rings` (default 4), `label`; `setTargets()`, `targets`;
 * `usa:ping` { name } as a target is swept. An `img` with a text summary of
 * the targets; the sweep runs only on screen, reduced motion shows a still
 * scope with all targets lit.
 */
interface RadarTarget {
    name: string;
    bearing: number;
    distance: number;
}
interface UsaRadarElement extends UsaElement {
    targets: RadarTarget[];
    setTargets(list: RadarTarget[]): void;
}
/** "A:40,0.6; B:200,0.3" → targets (bearing normalised to 0–360, distance clamped 0–1) (8.4). */
declare function parseTargets(s: string): RadarTarget[];
declare function defineRadar(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-sticky-wall>` (8.5) — a wall of sticky notes: each child becomes a
 * note with a paper colour (`data-color` yellow · pink · blue · green, or
 * cycling), a slight random tilt (`seed`) and a pin, and the notes drop onto
 * the wall one by one when it scrolls into view. Clicking / Enter on a note
 * lifts it to the front (`usa:pick` { index }). A `list` of `listitem`s;
 * reduced motion: notes are simply there.
 */
interface UsaStickyWallElement extends UsaElement {
    readonly notes: HTMLElement[];
    pick(index: number): void;
}
declare function defineStickyWall(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-sketch-chart values="3,7,5,9" labels="Q1,Q2,Q3,Q4">` (8.5) — a
 * hand-drawn chart: wobbly pencil axes, hatched bars (`type="bar"`, default)
 * or a sketchy line with dots (`type="line"`), sketched in stroke by stroke
 * when it scrolls into view. `color`, `label`; `values` property /
 * `setValues()`; `redraw()` (also on click) sketches it again; `usa:drawn`
 * when finished. An `img` whose label lists the data; reduced motion: drawn
 * at once.
 */
interface UsaSketchChartElement extends UsaElement {
    values: number[];
    setValues(v: number[]): void;
    redraw(): void;
}
declare function defineSketchChart(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-theme-switcher themes="light,dark,neon,glass,neu" target="#app">`
 * (8.6) — a segmented theme switcher for the 8.6 theme system: picking a
 * theme sets `data-usa-surface` on the `target` (default `<html>`), a pill
 * slides under the active option and the page change is revealed with a
 * circular wipe from the click point (View Transitions when supported).
 * `value`, `persist` (localStorage key); `usa:change` { theme }. A
 * `radiogroup` of `radio`s with arrow keys; reduced motion: instant.
 */
interface UsaThemeSwitcherElement extends UsaElement {
    value: string;
}
declare function defineThemeSwitcher(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-theme-surface>` (8.6) — a themeable card for the 8.6 theme system. It
 * follows the nearest `data-usa-surface` (set by `<usa-theme-switcher>` or
 * `applySurfaceTheme()`), or its own `theme` attribute: light, dark, neon (glowing
 * edge that pulses), glass (frosted backdrop with a moving sheen) and neu
 * (soft neumorphic relief that presses on click). When the theme changes
 * the surface cross-fades into the new look. `theme` property is the
 * resolved theme; `usa:theme` { theme } on change. Reduced motion: the look
 * changes without animation.
 */
interface UsaThemeSurfaceElement extends UsaElement {
    readonly theme: string;
}
declare function defineThemeSurface(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-gyro-card>` (8.7) — a 3D card that tilts with the phone's gyroscope
 * (`deviceorientation`) and with the pointer on desktop, with a moving glare
 * and `[data-depth]` children that float at different depths. On iOS the
 * motion permission is requested on the first tap. `max` (degrees, default
 * 15), `glare` (default on); `tilt(rx, ry)` sets it by hand; `usa:tilt`
 * { rx, ry, source }. Reduced motion: flat, no tilt.
 */
interface UsaGyroCardElement extends UsaElement {
    readonly source: 'gyro' | 'pointer' | 'none';
    tilt(rx: number, ry: number, source?: string): void;
    /** Play a short tilt wobble (a demo / attention cue); `null` under reduced motion. */
    wobble(): Animation | null;
}
declare function defineGyroCard(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-gesture-sticker>` (8.7) — a multi-touch sticker: drag it with one
 * finger, pinch with two to scale and twist to rotate (all at once), with a
 * springy settle and a lifted shadow while held. Mouse: drag, wheel scales,
 * Shift + wheel rotates. Keyboard: arrows move, + / − scale, [ / ] rotate,
 * 0 resets. `min` / `max` scale; `x`, `y`, `scale`, `angle`;
 * `transformTo({ x, y, scale, angle })`, `reset()`; `usa:transform`.
 * A focusable `img`-like `group`; reduced motion: no spring.
 */
interface StickerState {
    x: number;
    y: number;
    scale: number;
    angle: number;
}
interface UsaGestureStickerElement extends UsaElement, StickerState {
    transformTo(s: Partial<StickerState>): void;
    reset(): void;
}
declare function defineGestureSticker(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-panorama src="pano.jpg">` (8.8) — a 360° panorama viewer: drag
 * (or swipe) to look around, inertia after release, a slow auto-rotate
 * (`autorotate`, degrees per second, default 6, `0` off) and arrow keys.
 * Without `src` it shows a built-in procedural landscape. A compass shows
 * the heading. When the browser offers WebXR, a "View in XR" badge appears
 * (`usa:xr` { mode }). `yaw` property, `lookAt(deg)`; `usa:look` { yaw }.
 * A focusable `img` with `label`; reduced motion: no auto-rotate or inertia.
 */
interface UsaPanoramaElement extends UsaElement {
    yaw: number;
    lookAt(deg: number): void;
}
declare function definePanorama(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-spatial-card>` (8.8) — a spatial-computing style window: frosted
 * glass panel floating in depth, a soft "gaze" highlight that follows the
 * pointer, `[data-depth]` content layered towards the viewer, and an
 * ornament bar (`ornament` = child `[slot=ornament]`) that lifts out below
 * the window. It eases forward on hover / focus and sinks back on press,
 * like poking a visionOS window. `usa:focus-depth` { active }. Reduced
 * motion: static glass.
 */
interface UsaSpatialCardElement extends UsaElement {
    readonly active: boolean;
}
declare function defineSpatialCard(tag?: string): CustomElementConstructor | undefined;

/**
 * 8.9 — low-code component export.
 *
 * `exportComponent(el, format)` turns a live, configured element (any
 * `<usa-*>` with its attributes and light-DOM content) into copy-paste code:
 * `'html'` (a no-build page snippet with a CDN module import), `'react'`
 * (JSX + import), `'vue'` (SFC) or `'json'` (a portable description that the
 * 9.0 declarative DSL reads). Runtime parts Motionary added (`data-usa-*`,
 * `role`, `aria-*` it set, generated parts) are left out.
 *
 * `<usa-code-export for="#el" formats="html,react,vue">` shows that code in
 * tabs next to the live component, re-generates it when the element's
 * attributes change, and copies it with one click (`usa:copy` { format }).
 */
type ExportFormat = 'html' | 'react' | 'vue' | 'json';
interface ExportedNode {
    tag: string;
    attrs: Record<string, string>;
    children: (ExportedNode | string)[];
}
interface UsaCodeExportElement extends UsaElement {
    format: ExportFormat;
    readonly code: string;
    copy(): Promise<boolean>;
}
/** A clean, portable description of `el` (runtime parts stripped) (8.9). */
declare function describeComponent(el: Element): ExportedNode;
/** Copy-paste code for a live element in `format` (8.9). */
declare function exportComponent(el: Element, format?: ExportFormat): string;
declare function defineCodeExport(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-prop-panel for="#el" props="value:number:0:100, theme:select:leaf|ocean, readonly:boolean">`
 * (8.9) — a low-code property editor for a live component: each prop gets a
 * field (`text`, `number` with optional min:max, `range`, `color`,
 * `boolean` switch, `select` with options) bound to the element's
 * attribute (`for` is a selector, or `previous` for the element just
 * before the panel), so editing it re-renders the component on the spot. Without
 * `props` it lists the element's `observedAttributes` as text fields. A
 * labelled `form`; `usa:prop` { name, value }; `reset()` restores the
 * starting attributes. Pairs with `<usa-code-export>`.
 */
interface PropSpec {
    name: string;
    type: 'text' | 'number' | 'range' | 'color' | 'boolean' | 'select';
    options: string[];
}
interface UsaPropPanelElement extends UsaElement {
    readonly props: PropSpec[];
    reset(): void;
}
/** "value:number:0:100, theme:select:leaf|ocean, on:boolean" → prop specs (8.9). */
declare function parseProps(s: string): PropSpec[];
declare function definePropPanel(tag?: string): CustomElementConstructor | undefined;

/**
 * 5.0 — unified plugin-style effect registration. Every effect (built-in or
 * yours) is a plain object registered once and played the same way:
 * `playEffect(el, name)`, `bindEffect(el, name, { trigger })` or
 * `<usa-fx effect="name" trigger="click">`. Effects get a context that
 * already applies reduced motion, motion sensitivity, intensity and the
 * animation budget.
 */

declare const EFFECT_TRIGGERS: readonly ["click", "hover", "enter", "load", "loop", "manual"];
type EffectTrigger = (typeof EFFECT_TRIGGERS)[number];

/**
 * `motionary/dsl` (= `motionary/components/dsl`, 9.0) — the declarative
 * motion DSL. Describe motion as one readable string instead of code:
 *
 * ```html
 * <section data-motion="enter: fade-up 600ms ease-out stagger 80ms; hover: pop; click: confetti count=40">
 * ```
 *
 * Grammar — rules separated by `;`, each `trigger: effect [modifiers…]`:
 * - trigger: `enter` · `click` · `hover` · `load` · `loop` · `manual`
 * - effect: any registered effect name (timeline presets, packs, plugins)
 * - modifiers: a duration (`600ms` / `0.6s`), `delay 120ms`,
 *   `stagger 80ms` (children one after another), an easing (`ease-out`,
 *   `linear`, `spring`, `cubic-bezier(…)`, `steps(…)`), `once`, and
 *   `key=value` effect options (numbers / booleans parsed).
 *
 * `parseMotion()` → rules + errors, `serializeMotion()` back to a string,
 * `motion\`…\`` tagged template, `applyMotion(root)` binds every
 * `[data-motion]` under `root` (and watches for new ones with `observe`),
 * `bindMotion(el, rules)` for one element, and `createComponent(json)`
 * builds live markup from the 8.9 `describeComponent()` JSON.
 */

interface MotionRule {
    trigger: EffectTrigger;
    effect: string;
    duration?: number;
    delay?: number;
    stagger?: number;
    easing?: string;
    once?: boolean;
    options: Record<string, string | number | boolean>;
}

/**
 * `<usa-motion rules="enter: fade-up 600ms stagger 80ms; hover: pop">` (9.0)
 * — the declarative motion DSL as an element: its `rules` (the same string
 * as `data-motion`) are bound to it, `stagger` runs them over its children.
 * Changing `rules` re-binds. `rules` / `parsed` properties; `errors` lists
 * what was skipped (unknown trigger, modifier or effect) and `usa:motion-error`
 * fires for each. Layout-neutral (`display: contents` unless styled).
 */
interface UsaMotionElement extends UsaElement {
    readonly parsed: MotionRule[];
    readonly errors: string[];
}
declare function defineMotion(tag?: string): CustomElementConstructor | undefined;

interface CompatResult {
    ok: boolean;
    range: string;
    version: string;
    message: string;
}

interface PluginListing {
    name: string;
    title: string;
    description: string;
    entry: string;
    register: string;
    effects: string[];
    tags: string[];
    since: string;
    author?: string;
    official?: boolean;
}

/**
 * `<usa-plugin-store>` (9.0) — the plugin marketplace as a component: a
 * search box over the catalogue (first-party packs by default, or a
 * `plugins` list you set), result cards with their effects as chips, and
 * an Install button per plugin that imports and registers it (`loader`
 * property maps entries to imports for bundlers). Cards fly in staggered,
 * installs show a progress ring then a check. `usa:install` { name, effects }
 * / `usa:install-error` { name, message }. A labelled `search` region with
 * a live result count; reduced motion: no fly-in.
 */
interface UsaPluginStoreElement extends UsaElement {
    plugins: PluginListing[];
    loader: ((entry: string) => Promise<any>) | null;
    search(q: string): PluginListing[];
    install(name: string): Promise<string[]>;
}
declare function definePluginStore(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-chapter-nav for="#story">` (9.1) — chapter navigation for long-form
 * stories: one entry per `[data-chapter]` section (title from
 * `data-chapter`, else its first heading) inside the `for` container (or
 * the document), each with a progress bar that fills as you read that
 * chapter; the current chapter gets `aria-current="step"`, clicking one
 * scrolls smoothly to it. `orientation` horizontal (default) | vertical.
 * `current` index, `goTo(i)`; `usa:chapter` { index, title } on change.
 * A labelled `navigation`; reduced motion: instant jumps.
 */
interface UsaChapterNavElement extends UsaElement {
    readonly current: number;
    goTo(i: number): void;
}
declare function defineChapterNav(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-scene camera="dolly-in" strength="1">` (9.1) — a scroll-scrubbed
 * cinematic shot: while the scene crosses the viewport its media (first
 * `img` / `video` / `[data-shot]` child) follows a camera move —
 * `dolly-in` · `dolly-out` · `pan-left` · `pan-right` · `tilt-up` ·
 * `tilt-down` · `zoom-in` · `zoom-out` · `orbit` — and `[data-caption]`
 * children fade in at their `data-at` progress (0–1). `autoplay` plays the
 * move on its own (looping back and forth) instead of following the scroll.
 * `progress` (0–1);
 * `usa:shot` { progress } while it moves. Reduced motion: a still frame,
 * captions shown.
 */
interface UsaSceneElement extends UsaElement {
    readonly progress: number;
    setProgress(p: number): void;
}
declare function defineScene(tag?: string): CustomElementConstructor | undefined;

/**
 * 9.2 — Lottie import (`motionary/fx/lottie`, also `motionary/components/fx-lottie`).
 *
 * `lottieToKeyframes(json)` converts the layer transforms of a Lottie
 * (bodymovin) JSON — position `p`, scale `s`, rotation `r`, opacity `o`
 * (static or keyframed) — into WAAPI keyframes per layer plus the duration
 * (`op − ip` frames at `fr` fps), so a designer's After Effects motion runs
 * on Motionary's clock without lottie-web. `lottieToSvg(json)` renders the
 * simple vector shapes (ellipse `el`, rect `rc`, path `sh`, fill `fl`,
 * stroke `st`) as SVG groups, one per layer. `riveInputs(instance, el, map)`
 * wires Motionary-style triggers (hover / press / click / enter) to the
 * boolean / trigger inputs of a Rive state machine you created with the
 * Rive runtime.
 *
 * Effects: `lottie-play` (attention) plays the keyframes stored on an
 * element by `<usa-lottie>`; `icon-pop` (click) a sticker-like pop with a
 * ring burst for icons. Reduced motion: no motion.
 */

interface LottieLayerMotion {
    name: string;
    index: number;
    keyframes: Keyframe[];
    anchor: [number, number];
}
interface LottieMotion {
    width: number;
    height: number;
    duration: number;
    layers: LottieLayerMotion[];
}

/**
 * `<usa-lottie src="anim.json">` (9.2) — plays a Lottie (bodymovin) file
 * without lottie-web: simple vector layers are rendered as SVG and their
 * transform / opacity keyframes run as WAAPI animations on Motionary's
 * clock. `autoplay` (on screen), `loop`, `speed`, `label`; `json`
 * property (set data directly), `play()`, `pause()`, `stop()`, `parsed`;
 * `usa:load` { duration, layers } / `usa:complete`. An `img` with `label`;
 * reduced motion: first frame, no autoplay.
 */
interface UsaLottieElement extends UsaElement {
    json: unknown;
    readonly parsed: LottieMotion | null;
    play(): void;
    pause(): void;
    stop(): void;
}
declare function defineLottie(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-lottie-icon name="heart" trigger="click">` (9.2) — an animated icon
 * set shipped as tiny Lottie files and played by `<usa-lottie>`: `heart`
 * (beat), `bell` (swing), `check` (draw-in), `spinner` (spin), `star`
 * (twinkle), `bolt` (zap). `trigger` click (default) · hover · enter ·
 * loop; `size` (px, 32), `color`, `label` (otherwise decorative). The JSON
 * of each is exported as `LOTTIE_ICONS` — the same format designers export
 * from After Effects. Reduced motion: static icon.
 */
interface UsaLottieIconElement extends UsaElement {
    play(): void;
}
/** The built-in Lottie icon set (9.2). */
declare const LOTTIE_ICONS: Record<string, unknown>;
declare function defineLottieIcon(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-gen-art art="flow" seed="7" palette="ocean">` (9.3) — seeded
 * generative artwork on a canvas: `flow` (particles tracing a flow field),
 * `circles` (circle packing), `truchet` (quarter-arc tiles) or `waves`
 * (layered sine ridges). It draws itself in when it scrolls into view;
 * click / Enter re-seeds (`usa:generate` { seed }). `seed`, `palette`
 * (`PALETTES` name), `label`; `generate(seed?)`, `toDataURL()`. A focusable
 * `img`; reduced motion: drawn at once.
 */
interface UsaGenArtElement extends UsaElement {
    readonly seed: number;
    generate(seed?: number): void;
    toDataURL(type?: string): string;
}
declare function defineGenArt(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-bg-generator>` (9.3) — a background generator: pick a palette,
 * a style (`mesh` gradient, `grain` mesh, `stripes`, `dots`) and a seed
 * (shuffle button), see it live with a cross-fade, and copy the CSS
 * (`background: …`). `palette`, `style`, `seed`; `css` property,
 * `shuffle()`, `copy()`; `usa:change` { css, seed }. A labelled `group`
 * of real form controls; reduced motion: no cross-fade.
 */
interface UsaBgGeneratorElement extends UsaElement {
    readonly css: string;
    shuffle(): void;
    copy(): Promise<boolean>;
}
/** The CSS background for a generator state (9.3). */
declare function backgroundCss(style: string, seed: number, palette: string): string;
declare function defineBgGenerator(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-video-card>` (9.4) — a video thumbnail card: hover / focus plays a
 * muted preview of its `<video>` (paused and rewound on leave) with a
 * progress line, a play badge and a duration chip (`duration` attribute or
 * read from the video). Without a playable video the poster (`<img>` child
 * or `poster` gradient) gets a slow Ken Burns drift instead. Click / Enter →
 * `usa:open`. `previewing`; a focusable `link`-like button with your
 * `label`; reduced motion: no preview, no drift.
 */
interface UsaVideoCardElement extends UsaElement {
    readonly previewing: boolean;
}
declare function defineVideoCard(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-hero-video>` (9.4) — a full-bleed hero with a background video:
 * the poster (`poster` image URL, an `<img>` child, or a gradient) shows
 * first and cross-fades to the video once it can play; a scrim keeps your
 * content readable and a pause / play button is always there (WCAG 2.2.2).
 * `scrub` makes it scroll-driven (the video follows the scroll instead of
 * playing). Without a playable video the poster drifts slowly (Ken Burns).
 * `paused`, `toggle()`; `usa:play` / `usa:pause`. A `region` with `label`;
 * reduced motion: poster only, no autoplay.
 */
interface UsaHeroVideoElement extends UsaElement {
    readonly paused: boolean;
    toggle(): void;
}
declare function defineHeroVideo(tag?: string): CustomElementConstructor | undefined;

/**
 * 9.5 — Accessible motion 2.0 (`motionary/fx/safe`, also `motionary/components/fx-safe`):
 *
 * - `vestibularSafe(keyframes)` — strips movement (translate / scale /
 *   rotate / skew / perspective, clip and blur) from keyframes, keeping
 *   opacity and colour, so any animation can get a vestibular-safe twin.
 * - `flashCount(keyframes, duration)` / `isFlashSafe(...)` — counts large
 *   opacity / brightness swings and checks WCAG 2.3.1's three-flashes-per-
 *   second limit.
 * - `applyMotionPreferences(prefs)` / `loadMotionPreferences()` — the
 *   settings behind `<usa-motion-prefs>`: sensitivity level, speed (shared
 *   clock rate), pause autoplay, no parallax; persisted in localStorage and
 *   exposed as `data-usa-*` attributes on `<html>` for your CSS.
 *
 * Effects that never move anything: `safe-fade` (enter), `focus-glow`
 * (attention), `color-pulse` (attention), `underline-sweep` (hover).
 */

interface MotionPreferences {
    sensitivity: MotionSensitivity;
    speed: number;
    pauseAutoplay: boolean;
    noParallax: boolean;
}

/**
 * `<usa-motion-prefs>` (9.5) — a motion preference panel for your users:
 * motion level (Full · Gentle · Minimal · None — Motionary's sensitivity
 * levels), animation speed (the shared clock rate, 0.25–2×), "pause
 * autoplaying video" and "no parallax". Changes apply instantly to every
 * Motionary component on the page, persist in localStorage and are shown
 * as `data-usa-*` attributes on `<html>`; a live sample shows the result.
 * `prefs`, `reset()`; `usa:change` { prefs }. A labelled `form` of real
 * radio buttons, slider and checkboxes.
 */
interface UsaMotionPrefsElement extends UsaElement {
    readonly prefs: MotionPreferences;
    reset(): void;
}
declare function defineMotionPrefs(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-pause-all>` (9.5) — one button that pauses all motion on the page
 * (WCAG 2.2.2 "Pause, Stop, Hide"): it pauses Motionary's shared clock
 * (every component, effect and frame loop), every other CSS / WAAPI
 * animation in the document and autoplaying media; pressing again resumes
 * them. Stays in sync with `motionClock`. `scope` (a selector) limits it to
 * one subtree's animations and media and leaves the shared clock alone.
 * `paused`, `toggle()`;
 * `usa:pause-all` { paused }. A real `button` with `aria-pressed`.
 */
interface UsaPauseAllElement extends UsaElement {
    readonly paused: boolean;
    toggle(): void;
}
declare function definePauseAll(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-perf-monitor>` (9.6) — a live performance overlay for motion work:
 * FPS with a sparkline, active Motionary animations, frame-loop callbacks,
 * long tasks (PerformanceObserver) and the shared clock state. `corner`
 * (top-right default · top-left · bottom-right · bottom-left · `inline`),
 * `collapsed`; click the header to collapse. `stats` property;
 * `usa:jank` { fps } when FPS drops under `warn` (45). A labelled `status`
 * region updated about twice a second.
 */
interface PerfStats {
    fps: number;
    animations: number;
    loops: number;
    longTasks: number;
    clock: string;
}
interface UsaPerfMonitorElement extends UsaElement {
    readonly stats: PerfStats;
}
declare function definePerfMonitor(tag?: string): CustomElementConstructor | undefined;

/**
 * 9.6 — Performance 3.0 (`motionary/fx/perf`, also `motionary/components/fx-perf`):
 *
 * - `runInWorker(fn, ...args)` — run a pure function in a throw-away Web
 *   Worker (built from its source) and get a promise of its result; runs
 *   inline when Workers are unavailable.
 * - `offscreenRender(canvas, program, options)` — move a canvas animation
 *   off the main thread: `program` is the source of
 *   `function (ctx, t, w, h, state) {…}`; with OffscreenCanvas + Worker it
 *   runs in a worker (`backend: 'worker'`), otherwise on the main thread via
 *   the shared frame loop (`'main'`). Returns { backend, stop, resize }.
 * - `fpsMeter()` — a rolling frames-per-second meter on the shared loop.
 *
 * Effects: `idle-reveal` (enter) waits for an idle moment before fading in
 * (keeps first paint / input snappy); `gpu-lift` (hover) a compositor-only
 * lift (transform + opacity only). Reduced motion: idle-reveal just shows,
 * gpu-lift does nothing.
 */

type DrawProgram = string | ((ctx: CanvasRenderingContext2D, t: number, w: number, h: number, state: Record<string, unknown>) => void);

/**
 * `<usa-worker-canvas scene="particles">` (9.6) — a canvas animation that
 * renders in a Web Worker on an OffscreenCanvas (main thread stays free;
 * falls back to the shared frame loop): built-in `scene` = `particles` ·
 * `orbits` · `starfield`, or your own `program` (a function
 * `(ctx, t, w, h, state) => {…}`; 11.0: a source string only runs in a worker). Only runs while on screen.
 * `data-usa-backend` shows `worker` or `main`; `backend` property;
 * `usa:backend` { backend }. An `img` with `label`; reduced motion: one
 * still frame.
 */
interface UsaWorkerCanvasElement extends UsaElement {
    program: DrawProgram | null;
    readonly backend: string;
}
declare const WORKER_SCENES: Record<string, string>;
type SceneFn = (ctx: CanvasRenderingContext2D, t: number, w: number, h: number, s: any) => void;
/** The built-in scenes as functions — the main-thread fallback when no worker / OffscreenCanvas is available (11.0: strings are never evaluated on the main thread). Same drawing as `WORKER_SCENES`. */
declare const WORKER_SCENE_FNS: Record<string, SceneFn>;
declare function defineWorkerCanvas(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-motion-spec rules="enter: fade-up 600ms ease-out stagger 80ms; hover: pop 300ms">`
 * (9.7) — a motion spec sheet for design hand-off: one row per rule with
 * its trigger, effect, a duration / delay bar on a shared time axis and the
 * easing curve drawn from its cubic-bezier, plus a Play button that runs a
 * playhead across the timeline and "Copy CSS" (`motionToCss`). `rules`;
 * `parsed`, `play()`, `css`; `usa:copy`. A labelled `table`.
 */
interface UsaMotionSpecElement extends UsaElement {
    readonly parsed: MotionRule[];
    readonly css: string;
    play(): void;
}
declare function defineMotionSpec(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-native-preview rules="enter: fade-up 500ms smooth stagger 80ms; click: pop" platform="ios">`
 * (9.8) — preview web motion as it will feel on a phone and get the native
 * code: a device frame (iOS or Android chrome) whose children replay the
 * entrance with the rule's curve (Replay), press with a spring, and code
 * tabs with the generated React Native and Flutter source. `platform`,
 * `name`; `replay()`, `code(platform)`; `usa:replay`.
 */
interface UsaNativePreviewElement extends UsaElement {
    replay(): void;
    code(platform: 'react-native' | 'flutter'): string;
}
declare function defineNativePreview(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-plugin-card name="retro" title="Retro" version="1.2.0" author="Motionary" engine="^10.0.0" downloads="12400">`
 * (10.1) — a plugin detail card: version + Motionary compatibility badge
 * (`engine` semver range vs the running version), signature badge
 * (`integrity` checked against the code at `src` with Web Crypto), a
 * download counter and an expandable details panel, both animated with
 * **`motionary/runtime`** (requires the runtime core: `use()` first).
 * Children become the details. `toggle(open?)`, `verify()`, `compat()`;
 * `usa:toggle`, `usa:verified`, `usa:runtime-missing`.
 */
interface UsaPluginCardElement extends UsaElement {
    toggle(open?: boolean): void;
    verify(): Promise<boolean | null>;
    compat(): CompatResult;
}
declare function definePluginCard(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-install-button package="motionary" managers="npm pnpm yarn bun cdn" cdn="https://cdn.jsdelivr.net/npm/motionary@12/dist/runtime.iife.js">`
 * (10.1) — one-click install snippet: package-manager tabs (npm, pnpm, yarn,
 * bun, CDN), the command in a code row and a copy button that confirms with
 * a check. `package`, `dev` (dev dependency), `managers`, `cdn` (URL for the
 * CDN tab; `<script>` for .js URLs, `@import` for .css), `manager` (initial
 * tab). `command(manager)`, `copy()`; `usa:copy` `{ text, manager }`.
 */
interface UsaInstallButtonElement extends UsaElement {
    command(manager?: string): string;
    copy(): Promise<string>;
}
declare function defineInstallButton(tag?: string): CustomElementConstructor | undefined;

/** Easing functions (t ∈ [0, 1] → progress). Original implementations of the standard Penner-style curves. */
type Ease = (t: number) => number;

type Target = object | Element;
type Props = Record<string, number | string>;
interface PlayOptions {
    /** Delay before the first iteration, ms. */
    delay?: number;
    /** Extra iterations (-1 = forever). */
    repeat?: number;
    /** Alternate direction on every other iteration. */
    yoyo?: boolean;
    /** Start paused (`play()` to start). */
    paused?: boolean;
    onUpdate?: (progress: number) => void;
    onComplete?: () => void;
}
interface TweenOptions extends PlayOptions {
    to?: Props;
    from?: Props;
    /** ms (default 600). */
    duration?: number;
    ease?: string | Ease;
    /** Delay added per target index (ms) when several targets are given. */
    stagger?: number;
}
/** Common playback: delay, repeat, yoyo, direction, ticker attachment, promise. */
declare abstract class Playable {
    delay: number;
    repeat: number;
    yoyo: boolean;
    /** Playback rate multiplier. */
    timeScale: number;
    onUpdate?: (progress: number) => void;
    onComplete?: () => void;
    protected _t: number;
    private _dir;
    private _off;
    private _done;
    private _resolve;
    /** Resolves on completion (forward end, or start when reversed). */
    finished: Promise<void>;
    /** Set when owned by a timeline (then the ticker never drives it). */
    parent: Timeline | null;
    constructor(o: PlayOptions);
    /** One iteration, ms. */
    abstract get duration(): number;
    /** Render at `ms` into one iteration. */
    protected abstract renderLocal(ms: number, iterationEnded: boolean): void;
    get totalDuration(): number;
    get time(): number;
    get progress(): number;
    set progress(p: number);
    get isActive(): boolean;
    get reversed(): boolean;
    /** Jump to `ms` (total time, including the delay) and render. */
    seek(ms: number): this;
    play(): this;
    pause(): this;
    /** Play backwards from the current time. */
    reverse(): this;
    restart(): this;
    /** Stop and detach for good. */
    kill(): void;
    /** Promise-like: `await tween(...)`. */
    then<R>(ok?: (v: void) => R, err?: (e: unknown) => R): Promise<R>;
    private attach;
    private advance;
    protected complete(): void;
}
/** Position: ms number, '<' (start of previous), '>' (end of previous, default), '+=200' / '-=200' (relative to the end), 'label', 'label+=100', '<+=100'. */
type Position = number | string;
interface TimelineOptions extends PlayOptions {
    /** Defaults merged into every `.to()`. */
    defaults?: Omit<TweenOptions, 'to' | 'from'>;
}
/** A sequence of tweens, nested timelines and callbacks. */
declare class Timeline extends Playable {
    private children;
    private labels;
    private prevStart;
    private prevEnd;
    private defaults;
    private lastLocal;
    constructor(o?: TimelineOptions);
    get duration(): number;
    private resolve;
    /** Add a tween, timeline or callback at a position. */
    add(item: Playable | (() => void), position?: Position): this;
    /** `tween(target, vars)` placed at `position` (stagger across several targets). */
    to(target: Target | Target[] | ArrayLike<Target>, vars: TweenOptions, position?: Position): this;
    call(fn: () => void, position?: Position): this;
    label(name: string, position?: Position): this;
    /** Time of a label, ms. */
    labelTime(name: string): number | undefined;
    remove(item: Playable): void;
    /** Children in start order (callbacks excluded). */
    getChildren(): Playable[];
    protected renderLocal(ms: number): void;
}

/**
 * `<usa-scroll-scene start="top 80%" end="bottom 20%" scrub="120" pin markers>`
 * (10.2) — a scroll-linked scene powered by **`motionary/runtime/scroll`**
 * (requires `use(scroll)` first). Each child with `data-scrub="opacity: 0 -> 1;
 * x: -80 -> 0; rotate: -8deg -> 0deg"` is tweened across the scene; `stagger`
 * (ms of the scene's 1000 ms timeline) offsets the children. `scrub` = `true`
 * (direct) or a smoothing time in ms; without `scrub` the timeline plays on
 * enter and reverses on leave-back. `pin`, `markers`, `toggle-class`.
 * When the page cannot scroll (e.g. a thumbnail), `preview` loops the scene.
 * `progress` (read-only), `refresh()`, `timeline()`; `usa:progress`, `usa:enter`, `usa:leave`.
 */
interface UsaScrollSceneElement extends UsaElement {
    readonly progress: number;
    refresh(): void;
    timeline(): Timeline | null;
}
/** 'opacity: 0 -> 1; x: -80 -> 0' → [{ from: { opacity: '0', x: '-80' }, to: {...} }] */
declare function parseScrub(spec: string): {
    from: Record<string, string>;
    to: Record<string, string>;
};
declare function defineScrollScene(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-motion-inspector scope="#app" interval="500">` (10.2) — a live panel
 * listing the running animations under `scope` (Web Animations: CSS
 * animations / transitions, `element.animate()`, Motionary components) with
 * their target, state and progress, plus the `motionary/runtime` ticker
 * (fps, listeners) when the runtime is on the page. Pause / play all,
 * slow motion (0.25×) and per-row scrub. `refresh()`, `pauseAll()`,
 * `playAll()`, `setRate(rate)`, `animations()`; `usa:change`.
 */
interface UsaMotionInspectorElement extends UsaElement {
    refresh(): void;
    pauseAll(): void;
    playAll(): void;
    setRate(rate: number): void;
    animations(): Animation[];
}
declare function defineMotionInspector(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-route-transition effect="slide" cross-document>` (10.3, View
 * Transitions 2.0) — a route container: same-origin link clicks (and
 * `[data-to]` buttons) swap its content with the matching element of the
 * target page (fetched) or of an inline `<template data-route="/about">`,
 * animated with the View Transitions API when available (`engine="auto"`),
 * or with the Web Animations fallback (`engine="waapi"`). Elements with
 * `data-shared="hero"` morph between routes (shared-element transitions via
 * `view-transition-name`). `cross-document` opts the whole site into native
 * cross-document (MPA) view transitions. `effect` (fade | slide | zoom),
 * `selector` (element to take from fetched pages, default this element's
 * id), `history` (push | replace | off). `navigate(url)`, `current`;
 * `usa:navigate` (cancelable), `usa:navigated`.
 */
interface UsaRouteTransitionElement extends UsaElement {
    navigate(url: string, opts?: {
        history?: 'push' | 'replace' | 'off';
    }): Promise<boolean>;
    readonly current: string;
}
declare function defineRouteTransition(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-text-splitter split="chars" effect="rise" stagger="30">Hello world</usa-text-splitter>`
 * (10.3) — splits its text into characters, words or lines with
 * **`motionary/runtime/text`** (requires `use(text)` first) and animates the
 * pieces in with a runtime stagger when it scrolls into view. Accessible: the
 * element keeps an `aria-label` with the full text. `split` (chars | words |
 * lines), `effect` (rise | fade | blur | flip | wave), `stagger` (ms),
 * `duration` (ms), `loop` (replay every few seconds), `trigger` (view | load | hover).
 * `replay()`, `pieces()`; `usa:split`, `usa:done`.
 */
interface UsaTextSplitterElement extends UsaElement {
    replay(): void;
    pieces(): HTMLElement[];
}
declare function defineTextSplitter(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-scroll-ring label back-to-top></usa-scroll-ring>` (10.4, scroll-driven
 * 3.0) — a circular scroll-progress indicator for the page or for any scroll
 * container (`for=".article"`, looked up next to the ring first). Native
 * `animation-timeline: scroll()` first (the ring then animates off the main
 * thread, no script per frame); a small passive JS loop where scroll
 * timelines are missing (`engine="auto | native | js"`, the one in use is
 * reflected in `data-engine`). `label` shows the percentage, `back-to-top`
 * makes it a button that scrolls the target back to the start, `size`,
 * `thickness`, `horizontal`, `preview` (demo: glides the tracked container
 * back and forth while visible). `progress` (0–1); `usa:progress` on change
 * (whole percents), `usa:top`.
 */
interface UsaScrollRingElement extends UsaElement {
    readonly progress: number;
    readonly engine: 'native' | 'js';
}
declare function defineScrollRing(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-parallax-layers range="120"><img data-depth="0.2" …><h2 data-depth="-0.4">…</h2></usa-parallax-layers>`
 * (10.4, scroll-driven 3.0) — a parallax container: each child with
 * `data-depth` (−1…1; 0 = still, positive = slower / behind, negative =
 * faster / in front) moves by `depth × range` px while the container crosses
 * the viewport. Native `view()` scroll timeline first (no script per frame),
 * JS fallback otherwise (`engine="auto | native | js"`, reflected in
 * `data-engine`); `horizontal` moves layers sideways, `pointer` adds a
 * pointer-driven tilt of the layers (`strength` px), `preview` loops the
 * motion when the page cannot scroll (thumbnails). Static under reduced
 * motion. `layers()`, `progress`; `usa:progress`.
 */
interface UsaParallaxLayersElement extends UsaElement {
    layers(): HTMLElement[];
    readonly progress: number;
}
declare function defineParallaxLayers(tag?: string): CustomElementConstructor | undefined;

/**
 * `motionary/runtime/smooth` (10.4) — smooth (inertial) scrolling on the
 * runtime ticker, written for Motionary (own implementation and API).
 *
 * - Wheel / trackpad input is eased towards its target (`lerp` or a fixed
 *   `duration` + `ease`) on the shared ticker; keyboard, scrollbar dragging,
 *   find-in-page and screen-reader scrolling stay native (the target follows
 *   them), touch stays native by default (`touch: true` to smooth it).
 * - Works on the window or inside any scrollable `wrapper`; vertical or
 *   horizontal; nested scrollables and `[data-smooth-ignore]` are left alone.
 * - Anchor links (`#id`) glide to their target (with `offset`), focus moves
 *   for keyboard users, and the URL hash is kept.
 * - **Off under `prefers-reduced-motion: reduce`** (and while the media query
 *   matches; it re-enables when it stops matching) — wheel scrolling is then
 *   fully native. `force: true` overrides this only for non-motion use cases.
 * - Real `scroll` events still fire, so `motionary/runtime/scroll` scenes,
 *   IntersectionObservers and CSS scroll timelines all keep working.
 * SSR-safe: nothing touches `window` until `smoothScroll()` is called.
 */

interface SmoothOptions {
    /** Scroll container (default: the window / document scroller). */
    wrapper?: HTMLElement | Window;
    /** Easing factor per 60 fps frame, 0–1 (default 0.1). Ignored when `duration` is set. */
    lerp?: number;
    /** Fixed glide time in ms (with `ease`) instead of `lerp`. */
    duration?: number;
    ease?: string | Ease;
    orientation?: 'vertical' | 'horizontal';
    /** Wheel delta multiplier (default 1). */
    wheelMultiplier?: number;
    /** Smooth touch scrolling too (default false: native momentum is better on touch devices). */
    touch?: boolean;
    touchMultiplier?: number;
    /** Glide to `#anchor` links (default true). */
    anchors?: boolean | {
        offset?: number;
    };
    /** Ignore prefers-reduced-motion (default false — leave it off unless the motion is essential). */
    force?: boolean;
    onScroll?: (s: SmoothScroll) => void;
}
interface ScrollToOptions2 {
    offset?: number;
    /** Jump without animating. */
    immediate?: boolean;
    duration?: number;
    ease?: string | Ease;
    onComplete?: () => void;
}
declare class SmoothScroll {
    /** Current (animated) scroll position, px. */
    current: number;
    /** Where the scroll is heading, px. */
    target: number;
    /** px per frame of the last update. */
    velocity: number;
    /** True while gliding. */
    isScrolling: boolean;
    private o;
    private el;
    private win;
    private stopped;
    private reduced;
    private off;
    private tickOff;
    private written;
    private glide;
    private listeners;
    private touchY;
    constructor(o?: SmoothOptions);
    private on;
    private get horizontal();
    private axis;
    /** The scroll position the browser reports. */
    get native(): number;
    /** Maximum scroll, px. */
    get limit(): number;
    /** 0–1 */
    get progress(): number;
    /** Smoothing is running (not stopped, not reduced motion). */
    get active(): boolean;
    private wheel;
    private push;
    private start;
    private tick;
    private easeOf;
    private write;
    private halt;
    private anchor;
    /** Scroll to a position (px), an element, or a selector. Animated unless reduced motion / `immediate`. */
    scrollTo(to: number | string | Element, o?: ScrollToOptions2): void;
    /** Pause smoothing (native scrolling everywhere) — e.g. while a modal is open. */
    stop(): void;
    /** Resume after `stop()`. */
    resume(): void;
    /** Listen to every smoothed frame; returns an unsubscribe function. */
    onScroll(fn: (s: SmoothScroll) => void): () => void;
    /** Remove all listeners and restore native scrolling. */
    destroy(): void;
}

/**
 * `<usa-smooth-scroll lerp="0.1"></usa-smooth-scroll>` (10.4) — smooth,
 * inertial wheel scrolling with **`motionary/runtime/smooth`** (requires
 * `use(smooth)` first). Without `wrapper` it smooths the whole page while it
 * is in the document; with `wrapper` the element itself becomes the smooth
 * scroll container (give it a height). `lerp` (0–1), `duration` + `ease`
 * (fixed glide instead of lerp), `wheel-multiplier`, `horizontal`, `touch`,
 * `anchors` (default on; `anchors="false"` to keep native jumps), `offset`
 * (px, for sticky headers), `preview` (demo: glides through a wrapper while
 * visible). Off under reduced motion (native scrolling). `glideTo(target)`,
 * `stop()`, `resume()`, `instance`; `usa:ready`, `usa:scroll` (progress).
 */
interface UsaSmoothScrollElement extends UsaElement {
    glideTo(target: number | string | Element, opts?: {
        offset?: number;
        immediate?: boolean;
    }): void;
    stop(): void;
    resume(): void;
    readonly instance: SmoothScroll | null;
}
declare function defineSmoothScroll(tag?: string): CustomElementConstructor | undefined;

/**
 * `motionary/runtime/gl` (10.5) — a small WebGL2 scene renderer written for
 * Motionary (not a Three.js clone; own API, own shaders):
 *
 * - **math** (`mat4`, quaternions — column-major `Float32Array`s), pure;
 * - **scene graph**: `GlNode` (position / rotation quaternion / scale,
 *   children, optional mesh), `Camera` (perspective, `lookAt`), lights
 *   (`ambient`, up to 4 directional / point), `bounds()` + `frameNode()`;
 * - **geometry** builders (`box`, `plane`, `sphere`, `torus`) and custom
 *   geometry from typed arrays (indexed 16 / 32-bit or not);
 * - **materials**: `standard` (metallic-roughness PBR approximation, base
 *   colour texture, emissive, ACES-free Reinhard tone mapping, sRGB),
 *   `unlit`, and `shader` (your GLSL ES 3.00 fragment with the standard
 *   varyings + your uniforms);
 * - **textures** from images, canvases, bitmaps and **videos** (updated per
 *   decoded frame with `requestVideoFrameCallback`; `scrubVideo()` seeks a
 *   video from a 0–1 progress, e.g. a scroll scene);
 * - `orbitControls()` — drag / wheel / pinch / arrow keys, damping, optional
 *   auto-rotate (off under reduced motion).
 *
 * Math, geometry and the scene graph are pure (SSR / workers); rendering
 * needs WebGL2 (`createRenderer()` throws a clear error without it). Model
 * loaders live in `motionary/runtime/format-gltf` and `format-obj`.
 */

type Vec3 = [number, number, number];
type Quat = [number, number, number, number];
type Mat4 = Float32Array;
interface Geometry {
    positions: Float32Array;
    normals?: Float32Array;
    uvs?: Float32Array;
    indices?: Uint16Array | Uint32Array;
    /** 'triangles' (default), 'lines', 'points'. */
    mode?: 'triangles' | 'lines' | 'points';
    /** Bump after changing positions / normals in place (10.8: skinning, morph targets) — the renderer re-uploads them. */
    version?: number;
    /** Renderer cache. */
    _gpu?: unknown;
}
interface GlTexture {
    source: TexImageSource | {
        width: number;
        height: number;
        data: Uint8Array | Uint8ClampedArray;
    };
    /** sRGB colour data (default true for colour maps). */
    srgb?: boolean;
    repeat?: boolean;
    flipY?: boolean;
    /** Re-upload every frame a new video frame is ready. */
    video?: boolean;
    needsUpdate?: boolean;
    _gpu?: unknown;
}
interface Material {
    type: 'standard' | 'unlit' | 'shader';
    /** Linear RGBA multiplier (sRGB input converted by the shader). */
    color: [number, number, number, number];
    map?: GlTexture | null;
    metallic: number;
    roughness: number;
    emissive: Vec3;
    doubleSided?: boolean;
    transparent?: boolean;
    wireframe?: boolean;
    /** 'shader' materials: GLSL ES 3.00 fragment body + uniforms. */
    fragment?: string;
    uniforms?: Record<string, number | number[] | Float32Array | GlTexture>;
    _gpu?: unknown;
}
interface Mesh {
    geometry: Geometry;
    material: Material;
}
declare class GlNode {
    name: string;
    position: Vec3;
    rotation: Quat;
    scale: Vec3;
    /** Set to use a fixed local matrix instead of position / rotation / scale (glTF `matrix`). */
    matrix: Mat4 | null;
    children: GlNode[];
    parent: GlNode | null;
    mesh: Mesh | Mesh[] | null;
    visible: boolean;
    /** Free-form data (loaders put source info here). */
    extras: Record<string, unknown>;
    readonly world: Mat4;
    constructor(name?: string, mesh?: Mesh | Mesh[] | null);
    add(...nodes: GlNode[]): this;
    remove(n: GlNode): void;
    setEuler(x: number, y: number, z: number): this;
    local(): Mat4;
    /** Recompute world matrices of this subtree. */
    updateWorld(parent?: Mat4): void;
    traverse(fn: (n: GlNode) => void): void;
    find(name: string): GlNode | null;
}
declare class Camera extends GlNode {
    fov: number;
    near: number;
    far: number;
    aspect: number;
    target: Vec3;
    up: Vec3;
    constructor(o?: {
        fov?: number;
        near?: number;
        far?: number;
        position?: Vec3;
        target?: Vec3;
    });
    view(): Mat4;
    projection(): Mat4;
}
interface Light {
    type: 'directional' | 'point';
    /** Direction the light travels (directional) or position (point). */
    vector: Vec3;
    color: Vec3;
    intensity: number;
}
declare class Scene$1 {
    root: GlNode;
    ambient: Vec3;
    lights: Light[];
    /** Clear colour (sRGB, 0–1) or null for transparent. */
    background: [number, number, number, number] | null;
    exposure: number;
    add(...n: GlNode[]): this;
}

/**
 * `motionary/runtime/gltf-anim` (10.8) — glTF 2.0 animation, skinning and
 * morph targets for models loaded by `motionary/runtime/format-gltf`
 * (own implementation; requires `use(gl, formatGltf, gltfAnim)`).
 *
 * - animation channels on node `translation` / `rotation` / `scale` /
 *   `weights` with `LINEAR` (quaternions slerped), `STEP` and
 *   `CUBICSPLINE` (Hermite with in / out tangents) samplers;
 * - morph targets (POSITION + NORMAL deltas) with mesh default weights,
 *   node weights and animated weights;
 * - skins: joint hierarchy, inverse bind matrices, 4 joints / vertex
 *   (JOINTS_0 / WEIGHTS_0), skinned on the CPU and re-uploaded each frame
 *   (`geometry.version`), so it works with every runtime/gl material;
 * - `gltfAnimator(model)` plays a clip (by name or index) with loop / speed
 *   / seek, `update(dt)` from your loop or `play()` on the shared ticker.
 *
 * Sampling and deformation are pure (SSR / workers / tests).
 */

type Num$3 = number;
type ChannelPath = 'translation' | 'rotation' | 'scale' | 'weights';
type Interpolation = 'LINEAR' | 'STEP' | 'CUBICSPLINE';
interface GltfChannel {
    node: GlNode;
    path: ChannelPath;
    interpolation: Interpolation;
    times: Float32Array;
    values: Float32Array;
    /** Components per key (3, 4 or the morph target count). */
    size: Num$3;
}
interface GltfClip {
    name: string;
    duration: Num$3;
    channels: GltfChannel[];
}
interface GltfAnimator {
    readonly clips: GltfClip[];
    readonly clip: GltfClip | null;
    time: Num$3;
    speed: Num$3;
    loop: boolean;
    readonly playing: boolean;
    /** Switch clip (name or index); keeps playing state. */
    use(clip: string | Num$3): void;
    seek(t: Num$3): void;
    /** Advance by `dt` seconds and pose + deform. */
    update(dt: Num$3): void;
    /** Run on the shared ticker. */
    play(): void;
    pause(): void;
    dispose(): void;
}

/**
 * `<usa-gl-scene src="model.glb" controls auto-rotate></usa-gl-scene>` (10.5)
 * — a WebGL2 3D viewer on **`motionary/runtime/gl`** (requires `use(gl)`;
 * `.gltf` / `.glb` models also need `motionary/runtime/format-gltf`, `.obj`
 * needs `motionary/runtime/format-obj`). Without `src` it shows a built-in
 * `shape` (torus · box · sphere · plane). `color`, `metallic`, `roughness`,
 * `background`, `exposure`, `controls` (drag / wheel / pinch / arrow keys),
 * `auto-rotate` (deg/s; off under reduced motion), `video` (a video URL
 * mapped onto the shape as a texture; `video-scrub` ties its time to the
 * element's scroll position instead of playing), `label` (accessible name).
 * 10.8: `animation` (clip name or index; empty = the first) plays a glTF
 * animation with skinning and morph targets (requires
 * `motionary/runtime/gltf-anim`), `animation-speed`; reduced motion shows
 * the first pose. Renders only while visible. `scene`, `camera`, `root`,
 * `animator`, `reload()`; `usa:load` { meshes, animations }, `usa:error`.
 * (The 10.5 alias `<usa-three-scene>` was removed in 11.0.)
 */
interface UsaGlSceneElement extends UsaElement {
    readonly scene: Scene$1 | null;
    readonly camera: Camera | null;
    readonly root: GlNode | null;
    readonly animator: GltfAnimator | null;
    reload(): Promise<void>;
}
declare function defineGlScene(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-gpu-particles count="20000" mode="swirl"></usa-gpu-particles>` (10.5,
 * WebGPU effects 2.0) — a particle canvas simulated by a **WebGPU compute
 * shader** (positions + velocities in a storage buffer, drawn as instanced
 * quads), falling back to a CPU simulation on Canvas 2D (fewer particles)
 * where WebGPU is missing or refused. `mode` (swirl · galaxy · fountain),
 * `count`, `colors` (comma list), `size`, `speed`, `trail` (0–1 frame fade,
 * a one-pass post effect), `pointer` (particles flee the pointer), `label`.
 * Only simulates while visible; one still frame under reduced motion.
 * `data-usa-backend` = webgpu | canvas2d; `backend`; `usa:backend`.
 */
interface UsaGpuParticlesElement extends UsaElement {
    readonly backend: string;
}
/** WGSL compute pass: integrates every particle (flow field / orbit / fountain + pointer repulsion). */
declare const PARTICLE_SIM_WGSL = "struct P{pos:vec2f,vel:vec2f};struct U{t:f32,dt:f32,mode:f32,speed:f32,ptr:vec2f,aspect:f32,size:f32,c0:vec4f,c1:vec4f};\n@group(0) @binding(1) var<uniform> u:U;@group(0) @binding(0) var<storage,read_write> ps:array<P>;\nfn h(n:f32)->f32{return fract(sin(n)*43758.5453);}\n@compute @workgroup_size(64) fn sim(@builtin(global_invocation_id) id:vec3u){let i=id.x;if(i>=arrayLength(&ps)){return;}var p=ps[i];let fi=f32(i);\nvar acc=vec2f(0.0);let r=length(p.pos)+1e-3;\nif(u.mode<0.5){acc=vec2f(-p.pos.y,p.pos.x)*0.9/r+vec2f(sin(p.pos.y*3.0+u.t),cos(p.pos.x*3.0-u.t))*0.35-p.pos*0.15;}\nelse if(u.mode<1.5){acc=vec2f(-p.pos.y,p.pos.x)/(r*r*4.0+0.2)-p.pos*0.08/r;}\nelse{acc=vec2f(0.0,-1.4);if(p.pos.y<-1.1){p.pos=vec2f((h(fi+u.t)-0.5)*0.1,-1.0);p.vel=vec2f((h(fi*1.7+u.t)-0.5)*0.9,1.6+h(fi*3.1)*0.8);}}\nlet d=p.pos-u.ptr;let dl=length(d);if(dl<0.35&&u.ptr.x>-5.0){acc+=d/(dl*dl+0.02)*0.12;}\np.vel=(p.vel+acc*u.dt*u.speed)*pow(0.985,u.dt*60.0);p.pos+=p.vel*u.dt*u.speed;\nif(abs(p.pos.x)>1.6||abs(p.pos.y)>1.6){p.pos=vec2f(h(fi)-0.5,h(fi*7.3)-0.5)*1.6;p.vel=vec2f(0.0);}ps[i]=p;}";
/** WGSL render pass: instanced soft round quads, additive. */
declare const PARTICLE_DRAW_WGSL = "struct P{pos:vec2f,vel:vec2f};struct U{t:f32,dt:f32,mode:f32,speed:f32,ptr:vec2f,aspect:f32,size:f32,c0:vec4f,c1:vec4f};\n@group(0) @binding(1) var<uniform> u:U;@group(0) @binding(0) var<storage,read> ps:array<P>;\nstruct V{@builtin(position) pos:vec4f,@location(0) q:vec2f,@location(1) c:vec4f};\n@vertex fn vs(@builtin(vertex_index) vi:u32,@builtin(instance_index) ii:u32)->V{var c=array<vec2f,6>(vec2f(-1.0,-1.0),vec2f(1.0,-1.0),vec2f(-1.0,1.0),vec2f(-1.0,1.0),vec2f(1.0,-1.0),vec2f(1.0,1.0));let p=ps[ii];let q=c[vi];var o:V;\no.pos=vec4f(p.pos.x/u.aspect+q.x*u.size/u.aspect,p.pos.y+q.y*u.size,0.0,1.0);o.q=q;o.c=mix(u.c0,u.c1,clamp(length(p.vel)*0.8,0.0,1.0));return o;}\n@fragment fn fs(v:V)->@location(0) vec4f{let a=smoothstep(1.0,0.0,length(v.q));return vec4f(v.c.rgb*a,a*v.c.a);}";
declare function defineGpuParticles(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-shader-backdrop preset="aurora" post="bloom,vignette,grain"></usa-shader-backdrop>`
 * (10.5, WebGPU effects 2.0 — post-processing chain) — an animated shader
 * background (WebGL2) rendered into a framebuffer and run through a chain
 * of post passes in order: `bloom`, `vignette`, `grain`, `chromatic`
 * (aberration), `pixelate`, `scanlines`. `preset` (aurora · plasma · waves ·
 * nebula) or your own GLSL `vec3 scene(vec2 uv, float t)` in a child
 * `<script type="x-shader/x-fragment">`; `colors` (3), `speed`,
 * `intensity` (post strength 0–1), `label`. Content inside sits on top.
 * Renders only while visible; one still frame under reduced motion; a CSS
 * gradient without WebGL2. `passes` (the post chain in use); `usa:backend`.
 */
interface UsaShaderBackdropElement extends UsaElement {
    readonly passes: string[];
}
/** Built-in scenes: GLSL bodies of `vec3 scene(vec2 uv, float t)`. */
declare const BACKDROP_PRESETS: Record<string, string>;
/** Post passes (GLSL bodies reading `u_src`). */
declare const POST_PASSES: Record<string, string>;
declare function defineShaderBackdrop(tag?: string): CustomElementConstructor | undefined;

/**
 * `motionary/runtime/vector` (10.6) — a Lottie (bodymovin JSON) + dotLottie
 * player written for Motionary (own renderer on Canvas 2D; no lottie-web
 * code). Supported subset — see the compatibility table in
 * `docs/runtime/vector.md`:
 *
 * - layers: shape, solid, null, image, precomp (with time stretch / time
 *   remap), parenting, in / out points, hidden layers;
 * - transforms: anchor, position (incl. split X / Y and spatial bezier
 *   paths), scale, rotation, skew, opacity;
 * - shapes: groups, paths, rectangles (rounded), ellipses, stars / polygons;
 *   fills (non-zero / even-odd), strokes (caps, joins, dashes), linear and
 *   radial gradient fills / strokes, **trim paths** (individually /
 *   simultaneously);
 * - **masks** (add, subtract, intersect, inverted, opacity) and **track
 *   mattes** (alpha, alpha inverted; luma approximated by alpha);
 * - keyframes: bezier easing per dimension, hold keyframes, v4 (`e`) and v5+
 *   (`s` only) files;
 * - **dotLottie** (`.lottie`): zip (stored + deflate via the native
 *   `DecompressionStream`; 11.0: entry-count / size / ratio limits enforced
 *   while inflating — `ZipLimits`, `ZIP_LIMITS`), `manifest.json` v1 / v2, several animations,
 *   embedded images.
 *
 * 10.8: **text layers** (system / web fonts by family + style, justification,
 * tracking, line height, fill + stroke, box text with wrapping, source-text
 * keyframes and expressions) and an **expression subset** (see
 * `lottie-expr.ts`: time, value, wiggle, loopOut / loopIn, linear / ease,
 * Math…; no eval). Not supported (documented): 3D layers, effects, text
 * animators, glyph outlines (`chars`), merge paths, repeaters. `lottiePlayer()` is a
 * runtime timeline (seek, reverse, scrub with `progress`, markers → labels).
 */

type Num$2 = number;
interface LottieProp {
    a?: Num$2;
    k: any;
    x?: string;
    s?: boolean;
}
interface LottieLayer {
    t?: any;
    ty: Num$2;
    ind?: Num$2;
    parent?: Num$2;
    ip: Num$2;
    op: Num$2;
    st?: Num$2;
    sr?: Num$2;
    ks: any;
    shapes?: any[];
    hd?: boolean;
    tt?: Num$2;
    td?: Num$2;
    masksProperties?: any[];
    refId?: string;
    w?: Num$2;
    h?: Num$2;
    sw?: Num$2;
    sh?: Num$2;
    sc?: string;
    tm?: LottieProp;
    nm?: string;
    ddd?: Num$2;
    ef?: unknown[];
}
interface LottieAnimation {
    v?: string;
    fr: Num$2;
    ip: Num$2;
    op: Num$2;
    w: Num$2;
    h: Num$2;
    nm?: string;
    layers: LottieLayer[];
    assets?: {
        id: string;
        layers?: LottieLayer[];
        p?: string;
        u?: string;
        w?: Num$2;
        h?: Num$2;
        e?: Num$2;
    }[];
    markers?: {
        cm: string;
        tm: Num$2;
        dr: Num$2;
    }[];
    fonts?: {
        list?: {
            fName: string;
            fFamily?: string;
            fStyle?: string;
        }[];
    };
    chars?: unknown[];
}
type LottiePlayer = Playable & {
    readonly frame: Num$2;
    readonly totalFrames: Num$2;
    readonly animation: LottieAnimation;
    goToFrame(f: Num$2): void;
    setSegment(seg: [Num$2, Num$2] | string | null): void;
    markers: Record<string, [Num$2, Num$2]>;
};

/**
 * `<usa-lottie-player src="hero.lottie" autoplay loop></usa-lottie-player>`
 * (10.6) — plays Lottie JSON and dotLottie (`.lottie`) files with
 * **`motionary/runtime/vector`** (requires `use(vector)`): Motionary's own
 * Canvas 2D renderer for the documented subset (shapes, gradients, trim
 * paths, masks, track mattes, precomps, images). `animation` (id inside a
 * dotLottie), `autoplay`, `loop` (or a count), `speed`, `mode` (normal ·
 * bounce), `segment` ("0,30" or a marker name), `hover` (play on hover),
 * `scrub` (progress follows the element's scroll position), `fit` (contain ·
 * cover · fill), `background`, `label`. Methods `play()`, `pause()`,
 * `stop()`, `seek(frame)`, `player`, `animationData`, `unsupported`
 * (features in the file this renderer skips); `usa:load`, `usa:complete`,
 * `usa:error`. Reduced motion: first frame, no autoplay. Renders only while
 * visible.
 */
interface UsaLottiePlayerElement extends UsaElement {
    play(): void;
    pause(): void;
    stop(): void;
    seek(frame: number): void;
    readonly player: LottiePlayer | null;
    readonly animationData: LottieAnimation | null;
    readonly unsupported: string[];
}
declare function defineLottiePlayer(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-rive src="vehicles.riv" state-machine="bumpy" autoplay></usa-rive>`
 * (10.6) — plays Rive (`.riv`) files with the **official Rive runtime**
 * `@rive-app/canvas` (an optional peer dependency; `.riv` is Rive's
 * proprietary binary format, so Motionary does not reimplement it). The
 * runtime is loaded lazily on first use: from `provideRiveRuntime(() =>
 * import('@rive-app/canvas'))` (bundlers, after `npm i @rive-app/canvas`),
 * from `window.rive` (the official CDN script), an import map, or from
 * `runtime-src` (a URL to the official ESM / UMD build). Missing →
 * a clear message in place + `usa:runtime-missing`. `artboard`,
 * `animation`, `state-machine`, `autoplay`, `fit` (contain · cover · fill ·
 * fitWidth · fitHeight · none), `label`. `rive` (the official instance),
 * `play()`, `pause()`, `input(name)` (state-machine input); `usa:load`,
 * `usa:error`. Reduced motion: paused on the first frame.
 */
interface UsaRiveElement extends UsaElement {
    readonly rive: any;
    play(): void;
    pause(): void;
    input(name: string): any;
}
declare const RIVE_PEER = "@rive-app/canvas";
declare const RIVE_CDN = "https://unpkg.com/@rive-app/canvas@2.44.1/rive.js";
/**
 * Hand `<usa-rive>` the official runtime yourself — the module, or (better) a
 * lazy loader such as `() => import('@rive-app/canvas')` for bundlers that do
 * not follow the element's own optional import. Call before the element mounts.
 */
declare function provideRiveRuntime(runtime: unknown | (() => unknown)): void;
/** Load the official runtime: window.rive → import('@rive-app/canvas') → `runtimeSrc` script. */
declare function loadRiveRuntime(runtimeSrc?: string): Promise<any>;
declare function defineRive(tag?: string): CustomElementConstructor | undefined;

/**
 * motionary/components/tokens — motion design tokens (4.2).
 *
 * One source of truth for durations, easings and springs: as CSS custom
 * properties (`--usa-duration-fast`, `--usa-easing-emphasized`,
 * `--usa-spring-bouncy-stiffness`…), as W3C Design Tokens JSON, and importable
 * from Figma Tokens (Tokens Studio) or Style Dictionary exports.
 *
 * ```ts
 * import { applyMotionTokens, importMotionTokens, motionToken } from 'motionary/components/tokens';
 * applyMotionTokens(importMotionTokens(await (await fetch('/tokens.json')).json()));
 * el.animate(frames, { duration: motionToken('duration', 'slow'), easing: motionToken('easing', 'emphasized') });
 * ```
 */
interface SpringToken {
    stiffness: number;
    damping: number;
    mass: number;
}
interface MotionTokens {
    /** Durations in ms. */
    duration: Record<string, number>;
    /** CSS easing strings. */
    easing: Record<string, string>;
    /** Spring physics parameters. */
    spring: Record<string, SpringToken>;
}

/**
 * `<usa-token-editor apply></usa-token-editor>` (10.6, motion design tokens
 * 2.0) — edit motion tokens (durations and cubic-bézier easings) with a live
 * preview per token, then export them as W3C Design Tokens (DTCG 2025.10 or
 * the earlier draft) or import a DTCG file (aliases resolved, problems
 * listed). `apply` writes the tokens to `:root` custom properties as you
 * edit; `format` (2025.10 · draft); `groups` (duration,easing). `tokens`,
 * `exportJSON()`, `importJSON(json)`; `usa:change` { tokens },
 * `usa:export` { json }, `usa:import` { problems }.
 */
interface UsaTokenEditorElement extends UsaElement {
    tokens: MotionTokens;
    exportJSON(): Record<string, unknown>;
    importJSON(json: unknown): string[];
}
declare function defineTokenEditor(tag?: string): CustomElementConstructor | undefined;

/**
 * `motionary/runtime/physics` (10.7) — a small 2D rigid-body engine written
 * for Motionary (own implementation and API; no Matter.js / Box2D code):
 *
 * - bodies: circles, boxes and convex polygons (static, dynamic or
 *   kinematic), density → mass + moment of inertia, restitution, friction,
 *   sensors, collision groups / masks, sleeping;
 * - collisions: sort-and-sweep broad phase, separating-axis narrow phase
 *   with clipped contact manifolds (up to 2 points), sequential, accumulated and
 *   clamped impulses (normal + Coulomb friction) with a Baumgarte position bias;
 * - constraints: `distance` (rigid or a spring with `stiffness` /
 *   `damping`), `pin` (a body point to a world point — also the pointer
 *   drag constraint) and `weld`-like stiff distance pairs;
 * - a fixed time step (default 1/60 s) with an accumulator, so results are
 *   the same at any frame rate; `world.run()` drives it from the shared
 *   runtime ticker (pauses while the ticker sleeps).
 *
 * Pure maths — no DOM: safe in SSR and workers. Units are up to you (the
 * defaults assume pixels: gravity 980 px/s²).
 */

type Num$1 = number;
interface Vec2 {
    x: Num$1;
    y: Num$1;
}
type ShapeKind = 'circle' | 'box' | 'polygon';
interface BodyOptions {
    shape?: ShapeKind;
    x?: Num$1;
    y?: Num$1;
    angle?: Num$1;
    /** circle */
    radius?: Num$1;
    /** box */
    width?: Num$1;
    height?: Num$1;
    /** polygon: local vertices (any winding; made convex-ccw) */
    vertices?: [Num$1, Num$1][];
    /** 'dynamic' (default), 'static' (never moves) or 'kinematic' (moves by its velocity, ignores forces / collisions). */
    type?: 'dynamic' | 'static' | 'kinematic';
    /** Mass per unit area (default 0.001 → a 40 px box weighs 1.6). */
    density?: Num$1;
    /** Overrides density. */
    mass?: Num$1;
    restitution?: Num$1;
    friction?: Num$1;
    vx?: Num$1;
    vy?: Num$1;
    angularVelocity?: Num$1;
    /** Linear / angular damping per second (0–1). */
    damping?: Num$1;
    angularDamping?: Num$1;
    /** Collides with nothing, reports overlaps only. */
    sensor?: boolean;
    /** Collision filtering: bodies collide when (a.category & b.mask) && (b.category & a.mask). */
    category?: Num$1;
    mask?: Num$1;
    /** No rotation (infinite inertia). */
    fixedRotation?: boolean;
    label?: string;
    /** Anything (e.g. a fill colour for your renderer). */
    data?: unknown;
}
declare class Body {
    readonly id: number;
    label: string;
    shape: ShapeKind;
    type: 'dynamic' | 'static' | 'kinematic';
    position: Vec2;
    velocity: Vec2;
    angle: Num$1;
    angularVelocity: Num$1;
    force: Vec2;
    torque: number;
    radius: number;
    /** Local convex vertices (counter-clockwise) for boxes / polygons. */
    verts: Vec2[];
    normals: Vec2[];
    mass: number;
    invMass: number;
    inertia: number;
    invInertia: number;
    restitution: Num$1;
    friction: Num$1;
    damping: Num$1;
    angularDamping: Num$1;
    sensor: boolean;
    category: Num$1;
    mask: Num$1;
    sleeping: boolean;
    sleepTime: number;
    data: unknown;
    /** Bounding box, refreshed every step. */
    aabb: {
        minX: number;
        minY: number;
        maxX: number;
        maxY: number;
    };
    private wv;
    private wvAngle;
    private wvPos;
    constructor(o?: BodyOptions);
    get isStatic(): boolean;
    /** Vertices in world space (cached per pose). */
    worldVerts(): Vec2[];
    worldNormal(i: Num$1): Vec2;
    updateAabb(): void;
    applyImpulse(j: Vec2, at?: Vec2): void;
    applyForce(f: Vec2, at?: Vec2): void;
    wake(): void;
    /** Is the world point inside this body? */
    contains(x: Num$1, y: Num$1): boolean;
}
interface Contact {
    point: Vec2;
    depth: Num$1;
}
interface Manifold {
    a: Body;
    b: Body;
    normal: Vec2;
    contacts: Contact[];
}
interface ConstraintOptions {
    type: 'distance' | 'pin';
    a: Body;
    /** distance: the other body; pin: omitted. */
    b?: Body;
    /** Anchor on a / b in body-local coordinates (default the centre). */
    anchorA?: [Num$1, Num$1];
    anchorB?: [Num$1, Num$1];
    /** pin: the world point. */
    point?: [Num$1, Num$1];
    /** Rest length (default: the current distance). */
    length?: Num$1;
    /** 1 = rigid; < 1 = spring (fraction of the error corrected per step). */
    stiffness?: Num$1;
    /** Spring damping (0–1). */
    damping?: Num$1;
    label?: string;
}
declare class Constraint {
    type: 'distance' | 'pin';
    a: Body;
    b: Body | null;
    anchorA: Vec2;
    anchorB: Vec2;
    point: Vec2;
    length: Num$1;
    stiffness: Num$1;
    damping: Num$1;
    label: string;
    constructor(o: ConstraintOptions);
    worldA(): Vec2;
    worldB(): Vec2;
    /** One velocity iteration (impulse along the constraint axis, with a position bias). */
    solve(h: Num$1): void;
}
interface WorldOptions {
    gravity?: [Num$1, Num$1];
    /** Velocity iterations per step (default 10). */
    iterations?: Num$1;
    /** Fixed step in seconds (default 1/60). */
    step?: Num$1;
    /** Let resting bodies sleep (default true). */
    sleeping?: boolean;
}
type CollisionListener = (m: Manifold) => void;
declare class World {
    gravity: Vec2;
    iterations: Num$1;
    fixedStep: Num$1;
    sleeping: boolean;
    bodies: Body[];
    constraints: Constraint[];
    /** Manifolds of the last step (incl. sensor overlaps, which have no response). */
    contacts: Manifold[];
    time: number;
    steps: number;
    private acc;
    private warm;
    private listeners;
    private stop;
    constructor(o?: WorldOptions);
    add<T extends Body | Constraint>(...items: T[]): T;
    body(o: BodyOptions): Body;
    constraint(o: ConstraintOptions): Constraint;
    remove(...items: (Body | Constraint)[]): void;
    clear(): void;
    /** Static walls around a w × h box (thickness t outside it). */
    bounds(w: Num$1, h: Num$1, t?: number, o?: {
        top?: boolean;
    }): Body[];
    onCollision(fn: CollisionListener): () => void;
    /** Bodies under a world point (topmost = last added first). */
    query(x: Num$1, y: Num$1): Body[];
    /** Advance by `seconds` of real time in fixed steps (max 8 steps per call). */
    update(seconds: Num$1): Num$1;
    /** One fixed step of h seconds. */
    step(h?: Num$1): void;
    /** Drive the world from the shared runtime ticker (needs the core). Returns a stopper. */
    run(): () => void;
    get running(): boolean;
    /** Total kinetic energy (handy for tests / "settled" checks). */
    energy(): Num$1;
}

/**
 * `motionary/runtime/format-scene` (10.7) — the versioned scene format
 * `motionary-scene@1`: a JSON description of a 2D physics scene (world,
 * named materials, bodies, constraints, per-body style) that
 * `<usa-physics-playground>` and your own code can load, validate,
 * migrate and save.
 *
 * ```json
 * { "format": "motionary-scene@1",
 *   "world": { "width": 600, "height": 360, "gravity": [0, 980], "walls": true },
 *   "materials": { "rubber": { "restitution": 0.8, "friction": 0.6, "density": 0.001 } },
 *   "bodies": [
 *     { "id": "ball", "shape": "circle", "radius": 20, "position": [120, 40], "material": "rubber", "style": { "fill": "#f472b6" } },
 *     { "id": "floor-plank", "shape": "box", "size": [300, 16], "position": [300, 300], "angle": 0.1, "static": true }
 *   ],
 *   "constraints": [ { "type": "distance", "a": "ball", "b": "floor-plank", "length": 120, "stiffness": 0.3 } ] }
 * ```
 *
 * - `validateScene(json)` lists problems (never throws);
 * - `migrateScene(json)` upgrades older shapes (an unversioned scene, the
 *   `motionary-scene@0` draft) to `@1` and reports what it changed;
 * - `parseScene(json)` = migrate + validate, throws on errors;
 * - `sceneToWorld(scene)` builds a `motionary/runtime/physics` world
 *   (bodies by id); `worldToScene(world)` saves one back.
 *
 * Needs `motionary/runtime/physics` registered for `sceneToWorld` /
 * `worldToScene`; validation and migration are pure.
 */

type Num = number;
declare const SCENE_FORMAT = "motionary-scene@1";
interface SceneMaterial {
    restitution?: Num;
    friction?: Num;
    density?: Num;
}
interface SceneBody {
    id: string;
    shape: 'circle' | 'box' | 'polygon';
    position: [Num, Num];
    angle?: Num;
    radius?: Num;
    size?: [Num, Num];
    vertices?: [Num, Num][];
    static?: boolean;
    kinematic?: boolean;
    material?: string;
    restitution?: Num;
    friction?: Num;
    density?: Num;
    velocity?: [Num, Num];
    angularVelocity?: Num;
    sensor?: boolean;
    style?: {
        fill?: string;
        stroke?: string;
        label?: string;
    };
}
interface SceneConstraint {
    type: 'distance' | 'pin';
    a: string;
    b?: string;
    point?: [Num, Num];
    anchorA?: [Num, Num];
    anchorB?: [Num, Num];
    length?: Num;
    stiffness?: Num;
    damping?: Num;
}
interface Scene {
    format: typeof SCENE_FORMAT;
    name?: string;
    world: {
        width: Num;
        height: Num;
        gravity?: [Num, Num];
        walls?: boolean | {
            top?: boolean;
        };
        iterations?: Num;
    };
    materials?: Record<string, SceneMaterial>;
    bodies: SceneBody[];
    constraints?: SceneConstraint[];
}

/**
 * `<usa-physics-playground preset="pyramid"></usa-physics-playground>` (10.7)
 * — a 2D rigid-body sandbox drawn on Canvas 2D, simulated by Motionary's own
 * **`motionary/runtime/physics`** and loaded from a **`motionary-scene@1`**
 * scene (`motionary/runtime/format-scene`). Requires `use(physics,
 * formatScene)` before it mounts.
 *
 * Attributes: `preset` (balls · pyramid · pendulum · dominoes), `src` (a
 * scene JSON URL) or an inline `<script type="application/json">` scene,
 * `gravity` (px/s², default 980), `spawn` (click / tap empty space drops a
 * body), `paused`, `label`. Drag any dynamic body (pointer or touch);
 * arrow keys nudge the last body touched. Reduced motion: the scene is
 * settled off-screen and drawn once (dragging still works, one frame per
 * move). Only steps while visible.
 *
 * API: `world`, `bodies` (by scene id), `scene` (the loaded scene),
 * `reset()`, `play()`, `pause()`, `toScene()`; events `usa:load` ({ bodies,
 * format }), `usa:collision` (first contact between two dynamic bodies per
 * step), `usa:error`, `usa:runtime-missing`.
 */
interface UsaPhysicsPlaygroundElement extends UsaElement {
    readonly world: World | null;
    readonly bodies: Record<string, Body>;
    readonly scene: Scene | null;
    reset(): void;
    play(): void;
    pause(): void;
    toScene(): Scene | null;
}
/** The built-in scenes (motionary-scene@1). */
declare const PHYSICS_PRESETS: Record<string, () => unknown>;
declare function definePhysicsPlayground(tag?: string): CustomElementConstructor | undefined;

/**
 * Motion intent parser (10.7; 11.6: moved to Motion Core, re-exported by `motionary/tooling/ai`) — turns a short
 * natural-language description ("fade the cards up slowly when they scroll
 * into view, one after another") into a motion spec: effect, direction,
 * distance, duration, delay, easing, trigger, repeat, stagger, Web
 * Animations keyframes + options, a CSS rule and the Motionary components
 * that do it. English and Chinese phrases. A small deterministic parser —
 * no model, no network — shared by `<usa-motion-prompt>` and the
 * `suggest_motion` tool of `motionary-mcp` (which runs an evaluation set of
 * prompts against it in CI).
 *
 * Pure: no DOM access — safe in Node, workers and SSR.
 */
type MotionEffect = 'fade' | 'slide' | 'zoom' | 'rotate' | 'flip' | 'bounce' | 'shake' | 'pulse' | 'blur' | 'reveal' | 'typewriter' | 'count' | 'tilt' | 'magnetic' | 'ripple' | 'parallax' | 'marquee' | 'particles';
type MotionTrigger = 'load' | 'scroll' | 'hover' | 'click' | 'loop';
type Direction = 'up' | 'down' | 'left' | 'right' | null;
interface MotionIntent {
    /** The input, trimmed. */
    text: string;
    effect: MotionEffect;
    /** Secondary effects mentioned with the main one ("fade and zoom"). */
    also: MotionEffect[];
    direction: Direction;
    /** px for slides, scale factor for zooms, degrees for rotations / flips. */
    amount: number;
    duration: number;
    delay: number;
    easing: string;
    /** Named easing the text asked for ('spring', 'bouncy', 'smooth', 'linear', 'snappy', 'ease-out' …). */
    easingName: string;
    trigger: MotionTrigger;
    /** 1 = once, Infinity = forever. */
    iterations: number;
    alternate: boolean;
    /** ms between items for lists / groups (0 = none). */
    stagger: number;
    reducedMotion: 'respect';
    keyframes: Keyframe[];
    options: KeyframeAnimationOptions;
    css: string;
    /** Motionary components that implement it, best first. */
    components: {
        tag: string;
        why: string;
        snippet: string;
    }[];
    /** 0–1: how much of the text was understood. */
    confidence: number;
    /** Words / phrases that drove each decision (for explanations). */
    matched: string[];
}
interface MotionSuggestion {
    intent: MotionIntent;
    /** `local`: no provider given · `provider`: the provider's validated answer · `fallback`: provider failed or answered invalid JSON. */
    source: 'local' | 'provider' | 'fallback';
    provider?: string;
    errors: string[];
}

/**
 * `<usa-motion-prompt></usa-motion-prompt>` (10.7, AI-assisted motion) — type
 * what you want ("fade the cards up slowly, one after another" / "卡片从下往上
 * 依次淡入") and get a live preview plus ready code: Web Animations, CSS or a
 * Motionary component. Runs `describeMotion()` from
 * `motionary/components/ai` — a small deterministic parser (English and
 * Chinese), **no model and no network**; the same parser backs the
 * `suggest_motion` tool of `motionary-mcp`.
 *
 * Attributes: `value` (initial prompt), `format` (waapi · css · component,
 * default waapi), `placeholder`, `label`. The preview respects reduced
 * motion (shows the end state). API: `intent`, `suggest(text)`; events
 * `usa:suggest` ({ intent, source, errors }), `usa:copy` ({ format, code }).
 * 11.6: `suggester` — optional, e.g. `(text) => suggestMotion(text, { provider })` from `motionary/tooling/ai` (docs/ai-provider.md):
 * the local suggestion shows at once and is replaced by the validated answer (kept on any failure). No network unless you set it.
 */
interface UsaMotionPromptElement extends UsaElement {
    readonly intent: MotionIntent | null;
    /** 11.6: optional async suggester, e.g. `(t) => suggestMotion(t, { provider })` (motionary/tooling/ai). */
    suggester: ((text: string) => Promise<MotionSuggestion>) | null;
    suggest(text: string): MotionIntent;
}
declare function defineMotionPrompt(tag?: string): CustomElementConstructor | undefined;

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
        'usa-clock-control': UsaClockControlElement;
        'usa-hydrate': UsaHydrateElement;
        'usa-red-envelope': UsaRedEnvelopeElement;
        'usa-festival-banner': UsaFestivalBannerElement;
        'usa-terminal': UsaTerminalElement;
        'usa-retro-button': UsaRetroButtonElement;
        'usa-organic-card': UsaOrganicCardElement;
        'usa-liquid-nav': UsaLiquidNavElement;
        'usa-hud-panel': UsaHudPanelElement;
        'usa-radar': UsaRadarElement;
        'usa-sticky-wall': UsaStickyWallElement;
        'usa-sketch-chart': UsaSketchChartElement;
        'usa-theme-switcher': UsaThemeSwitcherElement;
        'usa-theme-surface': UsaThemeSurfaceElement;
        'usa-gyro-card': UsaGyroCardElement;
        'usa-gesture-sticker': UsaGestureStickerElement;
        'usa-panorama': UsaPanoramaElement;
        'usa-spatial-card': UsaSpatialCardElement;
        'usa-code-export': UsaCodeExportElement;
        'usa-prop-panel': UsaPropPanelElement;
        'usa-motion': UsaMotionElement;
        'usa-plugin-store': UsaPluginStoreElement;
        'usa-chapter-nav': UsaChapterNavElement;
        'usa-scene': UsaSceneElement;
        'usa-lottie': UsaLottieElement;
        'usa-lottie-icon': UsaLottieIconElement;
        'usa-gen-art': UsaGenArtElement;
        'usa-bg-generator': UsaBgGeneratorElement;
        'usa-video-card': UsaVideoCardElement;
        'usa-hero-video': UsaHeroVideoElement;
        'usa-motion-prefs': UsaMotionPrefsElement;
        'usa-pause-all': UsaPauseAllElement;
        'usa-perf-monitor': UsaPerfMonitorElement;
        'usa-worker-canvas': UsaWorkerCanvasElement;
        'usa-motion-spec': UsaMotionSpecElement;
        'usa-native-preview': UsaNativePreviewElement;
        'usa-plugin-card': UsaPluginCardElement;
        'usa-install-button': UsaInstallButtonElement;
        'usa-scroll-scene': UsaScrollSceneElement;
        'usa-motion-inspector': UsaMotionInspectorElement;
        'usa-route-transition': UsaRouteTransitionElement;
        'usa-text-splitter': UsaTextSplitterElement;
        'usa-scroll-ring': UsaScrollRingElement;
        'usa-parallax-layers': UsaParallaxLayersElement;
        'usa-smooth-scroll': UsaSmoothScrollElement;
        'usa-gl-scene': UsaGlSceneElement;
        'usa-gpu-particles': UsaGpuParticlesElement;
        'usa-shader-backdrop': UsaShaderBackdropElement;
        'usa-lottie-player': UsaLottiePlayerElement;
        'usa-rive': UsaRiveElement;
        'usa-token-editor': UsaTokenEditorElement;
        'usa-physics-playground': UsaPhysicsPlaygroundElement;
        'usa-motion-prompt': UsaMotionPromptElement;
    }
}

export { BACKDROP_PRESETS, CAROUSEL_EFFECTS, EQ_PRESETS, FESTIVAL_THEMES, LOTTIE_ICONS, MENU_EFFECTS, MODAL_EFFECTS, NAV_INDICATORS, PARTICLE_DRAW_WGSL, PARTICLE_SIM_WGSL, PHYSICS_PRESETS, POST_PASSES, PRESENCE_STATES, PROGRESS_VARIANTS, RETRO_VARIANTS, RIVE_CDN, RIVE_PEER, SEGMENTED_VARIANTS, SHEET_SIDES, SKELETON_VARIANTS, SPARK_VARIANTS, SWITCH_VARIANTS, TAB_INDICATORS, TIP_PLACEMENTS, TOAST_POSITIONS, TOGGLE_VARIANTS, WEATHER_CONDITIONS, WIDGETS, WIDGET_TAGS, WORKER_SCENES, WORKER_SCENE_FNS, backgroundCss, badgeProgress, cartTotal, defineAddToCart, defineBadgeWall, defineBarChart, defineBgGenerator, defineCarousel, defineCartDrawer, defineChapterNav, defineChatComposer, defineClockControl, defineCodeExport, defineColorPicker, defineCommandPalette, defineCompare, defineCountdown, defineCubeGallery, defineDatePicker, defineDisclosure, defineDock, defineEqualizer, defineFestivalBanner, defineField, defineFileDrop, defineGauge, defineGenArt, defineGestureSticker, defineGlScene, defineGlobe, defineGpuParticles, defineGyroCard, defineHeroVideo, defineHudPanel, defineHydrate, defineInstallButton, defineKanban, defineKeyframeEditor, defineKpi, defineLeaderboard, defineLiquidNav, defineLocationCard, defineLottie, defineLottieIcon, defineLottiePlayer, defineLyrics, defineMasonryFlow, defineMenu, defineMenuToggle, defineMessageList, defineMilestones, defineModal, defineMotion, defineMotionInspector, defineMotionPrefs, defineMotionPrompt, defineMotionSpec, defineMusicPlayer, defineNativePreview, defineNavMorph, defineNotificationBell, defineOdometer, defineOrganicCard, defineOtp, definePagination, definePanorama, defineParallaxLayers, definePauseAll, definePerfMonitor, definePhysicsPlayground, definePluginCard, definePluginStore, definePresence, definePrizeWheel, defineProductGallery, defineProgressRing, definePropPanel, definePullCord, defineRadar, defineReactions, defineRedEnvelope, defineRetroButton, defineRive, defineRouteTransition, defineScene, defineScrollRing, defineScrollScene, defineSegmented, defineShaderBackdrop, defineSheet, defineShortcut, defineSkeletonReveal, defineSketchChart, defineSmoothScroll, defineSparkline, defineSpatialCard, defineStarRating, defineStepper, defineStickyWall, defineStories, defineSuggestionChips, defineSwipeDeck, defineSwitch, defineTabBar, defineTerminal, defineTextSplitter, defineThemeSurface, defineThemeSwitcher, defineTip, defineToastStack, defineTokenEditor, defineUploadProgress, defineVideoCard, defineVoiceButton, defineVolumeKnob, defineWeatherCard, defineWidgets, defineWorkerCanvas, defineXpBar, describeComponent, exportComponent, formatBytes, formatDistance, fuzzyMatch, haversine, hexToHsv, hsvToHex, initials, keyLabels, levelFor, loadRiveRuntime, matchesKeys, monthGrid, pageWindow, parseChips, parseISODate, parseLRC, parseMarkers, parseProps, parseReactions, parseScrub, parseTargets, passwordStrength, project, provideRiveRuntime, rankRows, sanitizeCode, sparkPoints, splitTime, stackToast, waveBars, wheelAngle, wrapIndex };
export type { BellNotice, CartItem, ChatMessage, ExportFormat, ExportedNode, GlobeMarker, LeaderRow, PaletteCommand, PerfStats, PresenceState, PropSpec, RadarTarget, StackToastOptions, StickerState, UsaAddToCartElement, UsaBadgeWallElement, UsaBarChartElement, UsaBgGeneratorElement, UsaCarouselElement, UsaCartDrawerElement, UsaChapterNavElement, UsaChatComposerElement, UsaClockControlElement, UsaCodeExportElement, UsaColorPickerElement, UsaCommandPaletteElement, UsaCompareElement, UsaCountdownElement, UsaCubeGalleryElement, UsaDatePickerElement, UsaDisclosureElement, UsaDockElement, UsaEqualizerElement, UsaFestivalBannerElement, UsaFieldElement, UsaFileDropElement, UsaGaugeElement, UsaGenArtElement, UsaGestureStickerElement, UsaGlSceneElement, UsaGlobeElement, UsaGpuParticlesElement, UsaGyroCardElement, UsaHeroVideoElement, UsaHudPanelElement, UsaHydrateElement, UsaInstallButtonElement, UsaKanbanElement, UsaKeyframeEditorElement, UsaKpiElement, UsaLeaderboardElement, UsaLiquidNavElement, UsaLocationCardElement, UsaLottieElement, UsaLottieIconElement, UsaLottiePlayerElement, UsaLyricsElement, UsaMasonryFlowElement, UsaMenuElement, UsaMenuToggleElement, UsaMessageListElement, UsaMilestonesElement, UsaModalElement, UsaMotionElement, UsaMotionInspectorElement, UsaMotionPrefsElement, UsaMotionPromptElement, UsaMotionSpecElement, UsaMusicPlayerElement, UsaNativePreviewElement, UsaNavMorphElement, UsaNotificationBellElement, UsaOdometerElement, UsaOrganicCardElement, UsaOtpElement, UsaPaginationElement, UsaPanoramaElement, UsaParallaxLayersElement, UsaPauseAllElement, UsaPerfMonitorElement, UsaPhysicsPlaygroundElement, UsaPluginCardElement, UsaPluginStoreElement, UsaPresenceElement, UsaPrizeWheelElement, UsaProductGalleryElement, UsaProgressRingElement, UsaPropPanelElement, UsaPullCordElement, UsaRadarElement, UsaReactionsElement, UsaRedEnvelopeElement, UsaRetroButtonElement, UsaRiveElement, UsaRouteTransitionElement, UsaSceneElement, UsaScrollRingElement, UsaScrollSceneElement, UsaSegmentedElement, UsaShaderBackdropElement, UsaSheetElement, UsaShortcutElement, UsaSkeletonRevealElement, UsaSketchChartElement, UsaSmoothScrollElement, UsaSparklineElement, UsaSpatialCardElement, UsaStarRatingElement, UsaStepperElement, UsaStickyWallElement, UsaStoriesElement, UsaSuggestionChipsElement, UsaSwipeDeckElement, UsaSwitchElement, UsaTabBarElement, UsaTerminalElement, UsaTextSplitterElement, UsaThemeSurfaceElement, UsaThemeSwitcherElement, UsaTipElement, UsaToastStackElement, UsaTokenEditorElement, UsaUploadProgressElement, UsaVideoCardElement, UsaVoiceButtonElement, UsaVolumeKnobElement, UsaWeatherCardElement, UsaWorkerCanvasElement, UsaXpBarElement, WallBadge };
