type MotionSensitivity = 'full' | 'gentle' | 'minimal' | 'static';
type Cleanup = () => void;
/**
 * Members shared by every `<usa-*>` element. Attribute helpers, a cleanup
 * bag that is emptied on disconnect, and motion helpers that degrade to the
 * final state without WAAPI or under reduced motion.
 */
interface UsaElement extends HTMLElement {
    /** `true` while reduced motion applies to this element. */
    readonly reduced: boolean;
}

interface SearchResult {
    value: string;
    label: string;
    description?: string;
}
type SearchProvider = (query: string, context: {
    signal: AbortSignal;
}) => Promise<SearchResult[]> | SearchResult[];
interface UsaSearchFieldElement extends UsaElement {
    value: string;
    provider: SearchProvider | undefined;
    readonly input: HTMLInputElement | null;
    readonly results: SearchResult[];
    search(query?: string): void;
    clear(): void;
    cancel(): void;
    reset(): void;
}
/** Debounced native search with an application-supplied provider, abortable requests and stale-result protection. */
declare function defineSearchField(tag?: string): CustomElementConstructor | undefined;

interface UsaTextareaElement extends UsaElement {
    value: string;
    readonly input: HTMLTextAreaElement | null;
    focusInput(): void;
    reset(): void;
}
/** Native multiline entry with optional bounded auto-resize, a UTF-16 character counter and form reset. */
declare function defineTextarea(tag?: string): CustomElementConstructor | undefined;

interface UsaFormStepperElement extends UsaElement {
    step: number;
    readonly count: number;
    next(): boolean;
    back(): boolean;
    goTo(index: number): boolean;
    reset(): void;
    refresh(): void;
}
/** Validated steps around original light-DOM fields. Completion emits an event; the application owns submission. */
declare function defineFormStepper(tag?: string): CustomElementConstructor | undefined;

interface FormChoice {
    value: string;
    label: string;
    disabled?: boolean;
    group?: string;
}

interface FormIssue {
    target: string;
    message: string;
}
interface UsaValidationSummaryElement extends UsaElement {
    errors: FormIssue[];
    validate(): boolean;
    clear(): void;
}
/** Native validity summary or supplied errors; links focus real controls. No values are collected or emitted. */
declare function defineValidationSummary(tag?: string): CustomElementConstructor | undefined;

/** Styled native select: platform keyboard, optgroups, validation and real form submission. */
interface UsaSelectElement extends UsaElement {
    value: string;
    options: FormChoice[];
    reset(): void;
    readonly input: HTMLSelectElement | null;
}
declare function defineSelect(tag?: string): CustomElementConstructor | undefined;

interface UsaComboboxElement extends UsaElement {
    value: string;
    options: FormChoice[];
    show(): void;
    hide(): void;
    reset(): void;
}
declare function defineCombobox(tag?: string): CustomElementConstructor | undefined;

interface UsaMultiSelectElement extends UsaElement {
    values: string[];
    options: FormChoice[];
    reset(): void;
}
declare function defineMultiSelect(tag?: string): CustomElementConstructor | undefined;

/**
 * A light / dark switch drawn as an eclipse: a disc slides over the sun, the rays retract and a thin corona stays.
 * A native `<button role="switch">` handles pointer, Enter and Space. Attributes: `checked`, `label`, `disabled`.
 * Event `usa:change` ({ checked }). It reports the state only; the page decides what dark means.
 */
interface UsaEclipseToggleElement extends UsaElement {
    checked: boolean;
    toggle(force?: boolean): boolean;
}
declare function defineEclipseToggle(tag?: string): CustomElementConstructor | undefined;

/**
 * A hue picker drawn as an orbit: swatches sit on a ring, the picked one swells and the ring turns it to the top
 * (always the short way round) while the core fills with its colour. Native radio inputs carry the choice, so arrow
 * keys, Tab and screen readers work as usual.
 *
 * Attributes: `hue` (0–359, snapped to the nearest swatch, 210), `count` (swatches, 6–24, 12), `saturation` (0–100, 78),
 * `lightness` (0–100, 58), `label`, `disabled`. Properties `hue`, `color`. Event `usa:change` ({ hue, color }).
 */
interface UsaHueOrbitElement extends UsaElement {
    hue: number;
    readonly color: string;
}
declare function hueColor(hue: number, saturation: number, lightness: number): string;
declare function defineHueOrbit(tag?: string): CustomElementConstructor | undefined;

/**
 * A slider with detents: notch marks along the track, a thumb that follows on a spring, a tick that pops as the
 * value passes each notch, and a gentle snap onto a notch when released close to it. A native range input carries
 * the value, so it works with arrow / Page / Home / End keys and submits with a form.
 *
 * Attributes: `value`, `min` (0), `max` (100), `step` (1), `notches` (marks including both ends, 2–21, 5),
 * `snap` (snap reach as a share of the range, 0–0.2, 0.04; 0 turns snapping off), `unit`, `name`, `label`, `disabled`.
 * Events `usa:input` / `usa:change` ({ value }), `usa:detent` ({ value, index }) when a notch is crossed or reached.
 */
interface UsaNotchSliderElement extends UsaElement {
    value: number;
}
declare function defineNotchSlider(tag?: string): CustomElementConstructor | undefined;

/**
 * A vertical volume pill that bulges under the finger: press or drag anywhere on it to set the level, the pill swells
 * around the touch point and settles on a spring when released. A native range input (visually tucked away, still
 * focusable) carries the value for arrow / Page / Home / End keys and screen readers.
 *
 * Attributes: `value` (0–100, 60), `label`, `disabled`. Events `usa:input` / `usa:change` ({ value }).
 */
interface UsaBulgeVolumeElement extends UsaElement {
    value: number;
}
declare function defineBulgeVolume(tag?: string): CustomElementConstructor | undefined;

/**
 * A copy-to-clipboard button whose two squares redraw into a tick and whose label rolls to "Copied", then back.
 * The text comes from the `text` attribute, or from the element named by `for` (its value or text content).
 * A native button handles pointer and keyboard; the outcome is announced through a polite live region.
 *
 * Attributes: `text`, `for` (an element id), `label` (Copy), `done-label` (Copied), `fail-label` (Press Ctrl+C),
 * `duration` (ms the confirmation stays, 400–10000, 1600), `disabled`. Method `copy()` → Promise<boolean>.
 * Event `usa:copy` ({ ok, length }): only the success and the length leave the element, never the copied text.
 */
interface UsaCopyButtonElement extends UsaElement {
    copy(): Promise<boolean>;
}
declare function defineCopyButton(tag?: string): CustomElementConstructor | undefined;

/**
 * A loading indicator in which a highlight is handed from tile to tile around a small grid, each tile squashing a
 * little as it takes the baton. Pure CSS animation: it pauses while off screen and stands still under reduced motion.
 *
 * Attributes: `size` (2 or 3 tiles a side, 2), `duration` (ms for one lap, 600–6000, 1400), `label` (Loading),
 * `paused`. The label is announced once through `role="status"`.
 */
interface UsaTileRelayElement extends UsaElement {
    paused: boolean;
}
/** Clockwise order of the outer ring of an n×n grid (row-major indices). */
declare function relayOrder(n: number): number[];
declare function defineTileRelay(tag?: string): CustomElementConstructor | undefined;

/**
 * A soft, rubbery key: it sinks while held and wobbles back up past its rest height when let go. A native button
 * carries pointer, Enter and Space; a click from assistive tech still gets a short dip.
 *
 * Attributes: `label` (the key's text, A), `shape` (square | round | pill, square), `tone` (dark | light, dark),
 * `disabled`. Method `press()`. Event `usa:press` (no detail).
 */
interface UsaSquishKeyElement extends UsaElement {
    press(): void;
}
declare function defineSquishKey(tag?: string): CustomElementConstructor | undefined;

/**
 * Six dots chase each other round a small circle, each one shrinking as it trails the leader.
 *
 * Attributes: `label` (Loading, read once through `role="status"`), `duration` (ms for one lap, 300–8000, 1200),
 * `paused`. Pure CSS: it pauses while off screen and stands still under reduced motion.
 */
interface UsaSixDotOrbitElement extends UsaElement {
    paused: boolean;
}
declare function defineSixDotOrbit(tag?: string): CustomElementConstructor | undefined;

/**
 * Five upright bars stretch and settle from their centre line in a ripple, like a quiet equaliser.
 *
 * Attributes: `label` (Loading, read once through `role="status"`), `duration` (ms for one lap, 300–8000, 1000),
 * `paused`. Pure CSS: it pauses while off screen and stands still under reduced motion.
 */
interface UsaCenterBarsElement extends UsaElement {
    paused: boolean;
}
declare function defineCenterBars(tag?: string): CustomElementConstructor | undefined;

/**
 * A faint ring with a quarter arc that sweeps round it, easing in and out of each turn.
 *
 * Attributes: `label` (Loading, read once through `role="status"`), `duration` (ms for one lap, 300–8000, 900),
 * `paused`. Pure CSS: it pauses while off screen and stands still under reduced motion.
 */
interface UsaQuarterRingElement extends UsaElement {
    paused: boolean;
}
declare function defineQuarterRing(tag?: string): CustomElementConstructor | undefined;

/**
 * Three rings breathe out from a still centre dot, one after another, and fade as they widen.
 *
 * Attributes: `label` (Loading, read once through `role="status"`), `duration` (ms for one lap, 300–8000, 1800),
 * `paused`. Pure CSS: it pauses while off screen and stands still under reduced motion.
 */
interface UsaTriplePulseElement extends UsaElement {
    paused: boolean;
}
declare function defineTriplePulse(tag?: string): CustomElementConstructor | undefined;

/**
 * A soft disc that slowly swells and settles like a breath, with a halo that follows half a beat behind.
 *
 * Attributes: `label` (Loading, read once through `role="status"`), `duration` (ms for one lap, 300–8000, 4000),
 * `paused`. Pure CSS: it pauses while off screen and stands still under reduced motion.
 */
interface UsaBreathOrbElement extends UsaElement {
    paused: boolean;
}
declare function defineBreathOrb(tag?: string): CustomElementConstructor | undefined;

/**
 * Three dots hop in turn and squash a little as they land.
 *
 * Attributes: `label` (Loading, read once through `role="status"`), `duration` (ms for one lap, 300–8000, 1000),
 * `paused`. Pure CSS: it pauses while off screen and stands still under reduced motion.
 */
interface UsaThreeDotBounceElement extends UsaElement {
    paused: boolean;
}
declare function defineThreeDotBounce(tag?: string): CustomElementConstructor | undefined;

/**
 * A short stroke runs round an infinity sign without end.
 *
 * Attributes: `label` (Loading, read once through `role="status"`), `duration` (ms for one lap, 300–8000, 1600),
 * `paused`. Pure CSS: it pauses while off screen and stands still under reduced motion.
 */
interface UsaInfinityLoopElement extends UsaElement {
    paused: boolean;
}
declare function defineInfinityLoop(tag?: string): CustomElementConstructor | undefined;

/**
 * Placeholder text lines with a light band sweeping across them while content loads.
 *
 * Attributes: `label` (Loading, read once through `role="status"`), `duration` (ms for one lap, 300–8000, 1600),
 * `paused`. Pure CSS: it pauses while off screen and stands still under reduced motion.
 */
interface UsaSweepLinesElement extends UsaElement {
    paused: boolean;
}
declare function defineSweepLines(tag?: string): CustomElementConstructor | undefined;

/**
 * A Wi-Fi style signal indicator: a dot and three arcs. `level` lights 0–3 arcs; `searching` sweeps the arcs outward
 * in turn until a level is set. It is a picture with a text alternative (`role="img"`), not a control.
 *
 * Attributes: `level` (0–3, 3), `searching`, `label` (Signal). The text alternative reads "Signal: 2 of 3" or
 * "Signal: searching".
 */
interface UsaWifiSignalElement extends UsaElement {
    level: number;
}
declare function defineWifiSignal(tag?: string): CustomElementConstructor | undefined;

/** The pieces a reveal animates: words (spaces kept as their own pieces) or characters. */
declare function revealPieces(text: string, by: 'word' | 'char'): string[];
/**
 * A line of text that rises into place piece by piece, each piece clearing a soft blur, when it scrolls into view.
 * Screen readers get the whole text once; the pieces are hidden from them.
 *
 * Attributes: `text` (Moments), `by` (word | char, char), `stagger` (ms between pieces, 10–300, 45), `once`
 * (reveal the first time only; otherwise it hides again off screen). Method `replay()`.
 */
interface UsaTextRevealElement extends UsaElement {
    replay(): void;
}
declare function defineTextReveal(tag?: string): CustomElementConstructor | undefined;

/**
 * A round button that wobbles like jelly when pressed. A native button carries pointer, Enter and Space; the wobble is
 * skipped under reduced motion. Attributes: `label` (the accessible name, Add), `glyph` (the visible sign, +),
 * `disabled`. Method `press()`. Event `usa:press` (no detail).
 */
interface UsaJellyButtonElement extends UsaElement {
    press(): void;
}
declare function defineJellyButton(tag?: string): CustomElementConstructor | undefined;

/**
 * A pill button whose arrow hops in its direction when pressed, and whose body dips a little under the finger.
 * Attributes: `label` (Up), `direction` (up | down | left | right, up), `disabled`. Method `press()`.
 * Event `usa:press` (no detail).
 */
interface UsaBounceButtonElement extends UsaElement {
    press(): void;
}
declare function defineBounceButton(tag?: string): CustomElementConstructor | undefined;

/**
 * A favourite toggle: a star tile that celebrates with a "tada" when it is turned on. A native toggle button
 * (`aria-pressed`) carries pointer, Enter and Space. Attributes: `pressed`, `label` (Favourite), `disabled`.
 * Event `usa:change` ({ pressed }).
 */
interface UsaTadaButtonElement extends UsaElement {
    pressed: boolean;
    toggle(force?: boolean): boolean;
}
declare function defineTadaButton(tag?: string): CustomElementConstructor | undefined;

/**
 * A raised tile that sinks into a groove when turned on and rises back out when turned off; its mark turns with it.
 * A native toggle button (`aria-pressed`) carries pointer, Enter and Space. Attributes: `pressed`, `label` (Pin),
 * `disabled`. Event `usa:change` ({ pressed }).
 */
interface UsaGrooveToggleElement extends UsaElement {
    pressed: boolean;
    toggle(force?: boolean): boolean;
}
declare function defineGrooveToggle(tag?: string): CustomElementConstructor | undefined;

/** The text a badge shows: nothing at 0, the count, or `max+` past `max`. */
declare function badgeText(count: number, max: number): string;
/**
 * A bag button with a count badge and an add button beside it. Adding pops the badge and gives the bag a small nudge.
 * Both are native buttons; the bag's accessible name carries the count ("Cart, 2 items"), and a polite live region
 * announces each change. The element only counts: the page decides what adding means.
 *
 * Attributes: `count` (0–9999, 0), `max` (shown as `max+` beyond it, 1–999, 99), `label` (Cart), `add-label`
 * (Add to cart), `disabled`. Method `add(n = 1)`. Events `usa:add` ({ count }) and `usa:open` (no detail, the bag).
 */
interface UsaCartBadgeElement extends UsaElement {
    count: number;
    add(n?: number): number;
}
declare function defineCartBadge(tag?: string): CustomElementConstructor | undefined;

/** Split typed or pasted text into trimmed, non-empty chip values. */
declare function splitChips(text: string): string[];
/**
 * A tag field: type and press Enter or a comma to turn the text into a chip that pops in; Backspace in an empty field
 * takes the last chip back, and each chip has its own remove button. Duplicates are ignored. A native text input does
 * the typing; a polite live region announces each added or removed chip.
 *
 * Attributes: `value` (comma-separated chips), `label` (Tags), `placeholder` (Add tag), `max` (0 = no limit, 0–50),
 * `name` (submits one hidden input per chip with a form), `disabled`. Property `values`.
 * Event `usa:change` ({ values }).
 */
interface UsaChipInputElement extends UsaElement {
    values: string[];
}
declare function defineChipInput(tag?: string): CustomElementConstructor | undefined;

interface PlanOption {
    name: string;
    detail: string;
}
/** `"Basic|Free, Pro|$12 a month"` → [{ name: 'Basic', detail: 'Free' }, …]; at most 6 plans. */
declare function parsePlans(text: string): PlanOption[];
/**
 * A row of plan cards where a frame glides to the chosen card with a little overshoot and a tick pops in. The cards
 * are a native radio group in a fieldset, so arrow keys move the choice and a form gets the value.
 *
 * Attributes: `plans` (`Name|detail` pairs separated by commas; Basic|Free, Pro|$12, Team|$29), `value` (a plan's
 * name; the first by default), `label` (Plan), `name` (form field name), `disabled`.
 * Event `usa:change` ({ value, index }).
 */
interface UsaPlanPickerElement extends UsaElement {
    value: string;
}
declare function definePlanPicker(tag?: string): CustomElementConstructor | undefined;

declare const ALIGNMENTS: readonly ["left", "center", "right"];
type Alignment = typeof ALIGNMENTS[number];
/**
 * A three-way text alignment switch: a thumb slides under the chosen icon and a small preview of lines above it
 * re-aligns with a staggered spring. A native radio group carries the choice, so arrow keys move it.
 *
 * Attributes: `value` (left | center | right, left), `label` (Text alignment), `disabled`.
 * Event `usa:change` ({ value }).
 */
interface UsaAlignSwitchElement extends UsaElement {
    value: Alignment;
}
declare function defineAlignSwitch(tag?: string): CustomElementConstructor | undefined;

/**
 * A range slider whose value bubble rides the thumb on a spring: it lags, leans into fast drags and wobbles upright
 * when you stop. A row of ticks below dims the ones passed. A native range input carries the value for pointer, keys
 * and screen readers.
 *
 * Attributes: `value` (16), `min` (0), `max` (32), `step` (1), `ticks` (0–21, 9), `label` (Value), `unit`, `name`,
 * `disabled`. Events `usa:input` / `usa:change` ({ value }).
 */
interface UsaElasticSliderElement extends UsaElement {
    value: number;
}
declare function defineElasticSlider(tag?: string): CustomElementConstructor | undefined;

/** Keep the digits of `text`, at most `length` of them. */
declare function digitsOf(text: string, length: number): string[];
/**
 * A one-time code field: one box per digit that moves focus on as you type, takes a pasted code across the boxes,
 * and shakes and clears when the page calls `reject()`. `accept()` marks it as right. The code never leaves the element
 * in an event; the page reads `value` when `usa:complete` fires.
 *
 * Attributes: `length` (4–8, 4), `label` (Verification code), `disabled`. Property `value`. Methods `reject()`,
 * `accept()`, `clear()`. Events `usa:complete` ({ length }) when every box is filled.
 */
interface UsaCodeShakeElement extends UsaElement {
    readonly value: string;
    reject(): void;
    accept(): void;
    clear(): void;
}
declare function defineCodeShake(tag?: string): CustomElementConstructor | undefined;

declare const STRENGTH_WORDS: readonly ["Too short", "Weak", "Fair", "Good", "Strong"];
/**
 * A rough 0–4 strength score: length first, then the mix of lower case, upper case, digits and symbols, with a
 * penalty for one repeated character. A hint for people, not a security check.
 */
declare function passwordScore(text: string): number;
/**
 * A password field with a four-segment strength meter under it: segments fill with a spring as the score rises and
 * the word beside them changes (Weak, Fair, Good, Strong). A show / hide button reveals the text. The score is
 * announced politely; the password never leaves the element in an event.
 *
 * Attributes: `label` (Password), `name` (form field name), `placeholder`, `disabled`. Property `score`.
 * Event `usa:change` ({ score }) when the score changes.
 */
interface UsaStrengthMeterElement extends UsaElement {
    readonly score: number;
}
declare function defineStrengthMeter(tag?: string): CustomElementConstructor | undefined;

/**
 * A step indicator: dots on a line, with a filled bead that springs from dot to dot and stretches as it travels.
 * Back and next buttons move it; the current step is announced ("Step 2 of 4"). It shows progress only: the page
 * decides what each step holds.
 *
 * Attributes: `steps` (2–8, 4), `value` (current step, 1-based, 1), `label` (Progress), `disabled`. Methods `next()`,
 * `prev()`. Event `usa:change` ({ value }).
 */
interface UsaStepTrackElement extends UsaElement {
    value: number;
    next(): number;
    prev(): number;
}
declare function defineStepTrack(tag?: string): CustomElementConstructor | undefined;

/**
 * A single disclosure card whose body opens on a spring: it overshoots its height a little and settles, and the
 * chevron turns with it. The element's own children become the body. A native button with `aria-expanded` /
 * `aria-controls` toggles it; the closed body is `hidden`, so its content leaves the tab order.
 *
 * Attributes: `heading` (Details), `open`, `disabled`. Method `toggle(force?)`. Event `usa:toggle` ({ open }).
 */
interface UsaElasticAccordionElement extends UsaElement {
    open: boolean;
    toggle(force?: boolean): boolean;
}
declare function defineElasticAccordion(tag?: string): CustomElementConstructor | undefined;

/** Split `"A, B, C"` into trimmed, non-empty, unique option labels (at most 8; falls back to A, B, C). */
declare function parseOptions(text: string): string[];
/**
 * A row of round, soft keys where the picked one swells on a spring (it overshoots and settles) while the others
 * shrink back: the "A / B / C" selection indicator. A native radio group, so arrow keys move the pick and it joins
 * forms through `name`.
 *
 * Attributes: `options` ("A,B,C"), `value` (an option, default the first), `label` (Choice), `name`, `disabled`.
 * Event `usa:change` ({ value, index }).
 */
interface UsaSquishIndicatorElement extends UsaElement {
    value: string;
    readonly options: string[];
}
declare function defineSquishIndicator(tag?: string): CustomElementConstructor | undefined;

/**
 * A vertical navigation rail that collapses to icons. A pill glides to the current item with a small overshoot; the
 * rail's width springs between its two sizes. The element's own `<a>` / `<button>` children are the items: each may
 * carry `data-icon` (a short glyph or emoji shown when collapsed) and `aria-current="page"` for the current one.
 * Collapsed labels stay in the accessibility tree (visually hidden), so each item keeps its name.
 *
 * Attributes: `label` (Sidebar, the nav's accessible name), `collapsed`, `collapse-label` (Collapse sidebar), `expand-label` (Expand sidebar).
 * Method `toggle(force?)`. Events `usa:toggle` ({ collapsed }), `usa:select` ({ index, item }).
 */
interface UsaSidebarElement extends UsaElement {
    collapsed: boolean;
    toggle(force?: boolean): boolean;
}
declare function defineSidebar(tag?: string): CustomElementConstructor | undefined;

/**
 * An "On this page" table of contents that follows the reader: the link of the section in view gets
 * `aria-current="location"` and a marker slides to it. Without link children it builds the list from the headings
 * inside `target` (their text is copied as plain text; headings without an id are skipped). Clicking a link scrolls
 * smoothly (instantly under reduced motion), moves focus to the heading and updates the address hash.
 *
 * Attributes: `target` (CSS selector of the content; the document by default), `selector` (h2[id], h3[id]),
 * `label` (On this page), `offset` (px kept clear at the top, e.g. under a sticky header; 80).
 * Method `refresh()` (rebuild after the content changed). Event `usa:change` ({ id, index }).
 */
interface UsaScrollspyElement extends UsaElement {
    readonly current: string;
    refresh(): void;
}
declare function defineScrollspy(tag?: string): CustomElementConstructor | undefined;

type BillingPeriod = 'monthly' | 'yearly';
/**
 * A pricing table with a monthly / yearly switch. Switching rolls each price to its new value and the period suffix
 * crossfades; a featured plan is lifted with a badge. Each element child is one plan:
 * `<div data-name="Pro" data-monthly="12" data-yearly="120" data-featured data-badge="Popular" data-cta="Start Pro">`
 * — its own content (usually a feature list) becomes the plan's body. The switch is a native radio pair; each plan's
 * call to action is a native button.
 *
 * Attributes: `period` (monthly | yearly), `currency` ($), `label` (Billing period), `monthly-label` (Monthly),
 * `yearly-label` (Yearly), `yearly-note` (shown next to Yearly, e.g. "2 months free"), `locale`, `month-unit` (/mo), `year-unit` (/yr).
 * Events `usa:change` ({ period }), `usa:select` ({ plan, period, price }).
 */
interface UsaPricingElement extends UsaElement {
    period: BillingPeriod;
}
declare function definePricing(tag?: string): CustomElementConstructor | undefined;

/**
 * A slim bar for one or more announcements. With several element children it rolls from one message to the next
 * every `interval` ms; rolling pauses while the bar is hovered or focused, and a pause button stops it for good
 * (WCAG 2.2.2). The close button folds the bar away and the element becomes `hidden`. Nothing is stored: whether a
 * dismissed bar stays dismissed on the next visit is up to the page (listen for `usa:dismiss`).
 *
 * Attributes: `interval` (ms, 2500–20000; 5000), `dismissible` (adds a close button), `label`
 * (Announcements), `close-label` (Dismiss), `tone` (neutral | accent | warning).
 * Methods `dismiss()`, `next()`, `previous()`. Events `usa:change` ({ index }), `usa:dismiss`.
 */
interface UsaAnnouncementBarElement extends UsaElement {
    readonly index: number;
    dismiss(): void;
    next(): void;
    previous(): void;
}
declare function defineAnnouncementBar(tag?: string): CustomElementConstructor | undefined;

/**
 * A call-to-action bar that slides in once the reader has scrolled past the point where the page's own call to
 * action was (the `watch` element, or `offset` pixels), and slides away again when that comes back into view. While
 * hidden it is `inert`, so its buttons leave the tab order. Its own children are the bar's content.
 *
 * Attributes: `watch` (selector of the element whose leaving the top of the viewport shows the bar), `offset`
 * (px scrolled before showing when there is no `watch`; 320), `position` (bottom | top), `label` (Call to action),
 * `dismissible` (adds a close button; once closed it stays closed until the element is re-mounted), `close-label`.
 * Events `usa:show`, `usa:hide`, `usa:dismiss`.
 */
interface UsaStickyCtaElement extends UsaElement {
    readonly shown: boolean;
}
declare function defineStickyCta(tag?: string): CustomElementConstructor | undefined;

/**
 * A bento grid: tiles of different sizes that rise in one after another the first time the grid scrolls into view.
 * A soft light follows the pointer across the tile under it and the tile lifts a little. Each element child is a
 * tile; `data-span` (columns, 1–4) and `data-rows` (rows, 1–3) size it. The tiles keep their own content and
 * semantics; on narrow screens (under `collapse` px) every tile takes the full width.
 *
 * Attributes: `columns` (2–6; 4), `gap` (px; 12), `collapse` (px; 560), `stagger` (ms between tiles; 70).
 */
type UsaBentoElement = UsaElement;
declare function defineBento(tag?: string): CustomElementConstructor | undefined;

/** Line drawings for the built-in illustrations (24×24 grid, stroked). */
declare const EMPTY_ICONS: Record<string, string[]>;
/**
 * An "empty" placeholder that shows what to do next: a line illustration draws itself in when the block scrolls into
 * view and settles with a small bounce, then the heading, the description and the actions rise in turn. The
 * element's own children (buttons, links) become the actions. Motion is finite; the illustration is decorative.
 *
 * Attributes: `icon` (inbox | search | folder | cloud | bell | cart; inbox), `heading` (Nothing here yet),
 * `description`, `heading-level` (2–6; 3), `compact`.
 * Method `replay()`.
 */
interface UsaEmptyStateElement extends UsaElement {
    replay(): void;
}
declare function defineEmptyState(tag?: string): CustomElementConstructor | undefined;

/**
 * A zoomable lightbox for the images inside it. A thumbnail opens a native modal `<dialog>` and the picture grows
 * out of the thumbnail's place; previous / next buttons, arrow keys and a swipe move through the set; a double
 * click, the zoom button or `+` / `-` zoom to 2× and dragging then pans. Escape or the close button shrinks it back
 * and focus returns to the thumbnail. A thumbnail inside `<a href>` opens the linked image (only image addresses —
 * http(s), relative or data:image — are loaded; nothing is navigated); `data-full` on the `<img>` does the same.
 * A `<figcaption>` next to the image, or else its `alt`, becomes the caption.
 *
 * Attributes: `label` (Image viewer), `loop` (wrap around at the ends).
 * Methods `open(index)`, `close()`. Events `usa:open` ({ index }), `usa:change` ({ index }), `usa:close`.
 */
interface UsaLightboxElement extends UsaElement {
    readonly index: number;
    open(index?: number): void;
    close(): void;
}
declare function defineLightbox(tag?: string): CustomElementConstructor | undefined;

type SortDirection = 'ascending' | 'descending' | 'none';
/** A cell's sort key: its `data-value`, else its text; numbers (incl. 1,234.5 / 12% / $9) compare as numbers. */
declare function sortKey(cell: Element | undefined): string | number;
/** Compare two sort keys (numbers before text). */
declare function compareKeys(a: string | number, b: string | number): number;
/**
 * Progressive enhancement for the `<table>` inside it: header buttons sort by a column (`aria-sort` on the header,
 * numbers compared as numbers), an optional search box filters rows, and the rows glide to their new places
 * (FLIP) instead of jumping. A polite status line reads "12 of 40 rows". The table stays a real table; without
 * JavaScript it is simply unsorted. Columns marked `data-sort="false"` on their `<th>` are left alone.
 *
 * Attributes: `filterable` (adds the search box), `filter-label` (Filter rows), `placeholder` (Filter…),
 * `sort-column` (0-based), `sort-direction` (ascending | descending).
 * Methods `sort(column, direction?)`, `filter(query)`. Events `usa:sort` ({ column, direction }),
 * `usa:filter` ({ query, count }).
 */
interface UsaDataTableElement extends UsaElement {
    sort(column: number, direction?: SortDirection): void;
    filter(query: string): number;
}
declare function defineDataTable(tag?: string): CustomElementConstructor | undefined;

/**
 * A row of filter chips that rearranges a collection. Each chip is a toggle button (`aria-pressed`); "All" clears the
 * choice. The items of the `target` container that carry a `data-tags` list ("design motion") stay when they match a
 * chosen tag (any of them, or all of them with `match="all"`); the others fade out and the rest glide together
 * (FLIP). Hidden items get `hidden`, so they leave the tab order and the accessibility tree. A polite status line
 * reads "6 of 12 shown".
 *
 * Attributes: `options` (comma-separated tags; collected from the items when absent), `value` (comma-separated
 * chosen tags), `target` (selector of the container; the next sibling element by default), `multiple`,
 * `match` (any | all), `label` (Filter), `all-label` (All).
 * Event `usa:change` ({ value, count }).
 */
interface UsaFilterChipsElement extends UsaElement {
    value: string[];
}
declare function defineFilterChips(tag?: string): CustomElementConstructor | undefined;

/**
 * Pulsing points on a picture that open short notes. The first `<img>` (or `<picture>`) child is the picture; every
 * other element child with `data-x` / `data-y` (percent of the picture) is one note, with an optional `data-title`.
 * Each point is a native button with `aria-expanded`; its note pops out of the point and sits on whichever side has
 * room. One note is open at a time; Escape, a click outside or the point again closes it and focus stays on the
 * point. The points pulse a few times when the picture scrolls into view (continuously with `pulse="loop"`).
 *
 * Attributes: `pulse` (once | loop | off; once), `label` (Points of interest).
 * Methods `open(index)`, `close()`. Events `usa:open` ({ index }), `usa:close`.
 */
interface UsaHotspotsElement extends UsaElement {
    readonly index: number;
    open(index: number): void;
    close(): void;
}
declare function defineHotspots(tag?: string): CustomElementConstructor | undefined;

/** The resting pose of a card `offset` places from the active one: angle (deg), x (% of card width), y (px), scale. */
declare function fanPose(offset: number, spread: number): {
    angle: number;
    x: number;
    y: number;
    scale: number;
    z: number;
};
/**
 * Cards held like a hand of playing cards: the active card stands upright in front, the others fan out to both
 * sides. Previous / next buttons, the arrow keys, a swipe or a click on a side card bring a card forward, and every
 * card swings to its new place on a spring. Each element child is one card. The cards behind are `inert` and
 * `aria-hidden`, so only the front card's content is reachable; a polite status says "Card 2 of 5".
 *
 * Attributes: `index` (0-based; the middle card by default), `spread` (degrees between cards, 3–20; 9), `loop`,
 * `label` (Cards). Methods `next()`, `previous()`, `go(index)`. Event `usa:change` ({ index }).
 */
interface UsaFanCarouselElement extends UsaElement {
    index: number;
    next(): void;
    previous(): void;
    go(index: number): void;
}
declare function defineFanCarousel(tag?: string): CustomElementConstructor | undefined;

/**
 * A row of narrow panels where one is open wide: hovering, focusing or clicking another panel makes it grow while the
 * rest narrow, and its content slides in. Each element child is one panel; its `data-title` labels the panel's
 * toggle button (shown sideways while the panel is narrow) and `data-image` sets a cover picture. The toggle is a
 * native button with `aria-expanded`; closed panels' content is `hidden`. Under 640 px wide (`stack`) the panels
 * stack vertically.
 *
 * Attributes: `index` (open panel; 0), `trigger` (hover | click; hover), `stack` (px; 640), `label` (Panels).
 * Event `usa:change` ({ index }).
 */
interface UsaExpandCardsElement extends UsaElement {
    index: number;
}
declare function defineExpandCards(tag?: string): CustomElementConstructor | undefined;

/** A JSON path segment list as text: `$.items[2].name`. */
declare function jsonPath(parts: (string | number)[]): string;
/**
 * A collapsible JSON tree. Objects and arrays open and close with a height spring and show their size ("{3}",
 * "[12]") while closed; values are coloured by type. It is a WAI-ARIA tree: one tab stop, ↑ ↓ move, → opens / goes in,
 * ← closes / goes up, Home / End jump. All text is set as text, never as markup. The data comes from the `data`
 * property, the `json` attribute or a child `<script type="application/json">`; invalid JSON shows the parse error.
 *
 * Attributes: `json`, `expand-depth` (levels open at first; 1), `max-nodes` (rendering stops after this many; 2000),
 * `label` (JSON). Property `data`. Methods `expandAll()`, `collapseAll()`. Event `usa:toggle` ({ path, open }).
 */
interface UsaJsonViewerElement extends UsaElement {
    data: unknown;
    expandAll(): void;
    collapseAll(): void;
}
declare function defineJsonViewer(tag?: string): CustomElementConstructor | undefined;

type VelocityMode = 'skew' | 'stretch' | 'blur' | 'tilt';
/** Map a scroll speed (px per frame at 60 fps) to the effect amount, softly capped at ±1. */
declare function velocityAmount(pxPerFrame: number, strength?: number): number;
/**
 * Content that reacts to how fast the page scrolls: the faster the scroll, the more it skews, stretches, blurs or
 * tilts, and it eases back to rest when the scroll stops. Only while the element is on screen; nothing moves under
 * reduced motion. The element's own children are the content.
 *
 * Attributes: `mode` (skew | stretch | blur | tilt; skew), `strength` (0.1–3; 1), `max` (the largest skew / tilt in
 * degrees, 1–30; 10).
 */
interface UsaScrollVelocityElement extends UsaElement {
    readonly amount: number;
}
declare function defineScrollVelocity(tag?: string): CustomElementConstructor | undefined;

/** The track's x offset (px, ≤ 0) for a section `progress` (0–1) through, given the overflow width. */
declare function trackOffset(progress: number, overflow: number): number;
/**
 * A section that turns vertical scrolling into sideways movement: while it passes, its panels slide left across a
 * pinned frame, and a thin bar shows how far along you are. The section is as tall as the sideways distance needs.
 * Each element child is one panel. When a panel's link or button gets keyboard focus, the page scrolls so that panel
 * is in view. Under reduced motion, without `position: sticky`, or below `min-width` px wide, it falls back to a
 * plain horizontal scroller with snap points.
 *
 * Attributes: `panel-width` (CSS width of a panel; 80vw), `gap` (px; 24), `progress` (show the bar; on unless
 * "false"), `min-width` (px; 640), `label` (Gallery).
 * Event `usa:change` ({ index }).
 */
interface UsaHorizontalScrollElement extends UsaElement {
    readonly index: number;
}
declare function defineHorizontalScroll(tag?: string): CustomElementConstructor | undefined;

/**
 * An area where moving the pointer leaves a trail of pictures: every `distance` px a picture pops up under the
 * pointer, tilted a little, and shrinks away after `life` ms. The pictures come from the element's `<img>` children
 * (in turn); its other children are the area's real content and stay on top. The trail is decorative
 * (`aria-hidden`); it does nothing for touch scrolling or under reduced motion.
 *
 * Attributes: `distance` (px between pictures, 20–400; 90), `life` (ms, 200–3000; 900), `max` (pictures at once,
 * 1–30; 10), `size` (picture width in px, 40–480; 160).
 */
type UsaImageTrailElement = UsaElement;
declare function defineImageTrail(tag?: string): CustomElementConstructor | undefined;

/**
 * An editorial list where hovering a row shows its picture floating beside the pointer: the picture follows on a
 * spring, leans with the pointer's speed and crossfades between rows. Keyboard focus on a row shows the picture next
 * to that row. Each element child is one row (usually a link); its `data-image` is the picture. The picture is
 * decorative (`aria-hidden`); the rows keep their own semantics. Under reduced motion the picture appears in place
 * without following.
 *
 * Attributes: `size` (picture width in px, 80–480; 240), `tilt` (max lean in degrees, 0–20; 8), `label` (List).
 * Event `usa:change` ({ index }) when the shown row changes (-1 when none).
 */
interface UsaHoverRevealListElement extends UsaElement {
    readonly index: number;
}
declare function defineHoverRevealList(tag?: string): CustomElementConstructor | undefined;

/**
 * A liquid-glass surface: the backdrop is blurred, brightened and — where the browser can filter a backdrop through
 * SVG — bent at the edges like thick glass. A specular highlight follows the pointer, the rim catches light, and a
 * press squashes the pane a little before it springs back. The element's own children sit on the glass. Without
 * backdrop filters it falls back to a frosted tint; under reduced motion the highlight stays put.
 *
 * Attributes: `strength` (refraction, 0–100; 40), `blur` (px, 0–40; 14), `tint` (CSS colour; a faint white),
 * `radius` (px; 24), `pressable` (the squash on press).
 */
type UsaLiquidGlassElement = UsaElement;
declare function defineLiquidGlass(tag?: string): CustomElementConstructor | undefined;

/** Keep only path-data characters (commands, numbers, separators); anything else makes the path empty. */
declare function cleanPathData(d: string): string;
/**
 * Moves things along an SVG path. The path comes from the `path` attribute (path data in a 0–100 box) or from the
 * first `<path>` of an `<svg>` child. The element's other children ride the path, spaced along it; with `rotate`
 * they turn to face the way they travel, and with `trace` the path draws itself behind the leader.
 * `trigger="scroll"` ties the progress to the element's passage through the viewport, `view` plays once when it
 * scrolls into view, `loop` plays continuously (while on screen; a pause button is added), and `hover` plays while
 * the pointer is over it. Under reduced motion the riders rest at the end.
 *
 * Attributes: `path`, `trigger` (scroll | view | loop | hover; view), `duration` (ms; 2400), `rotate`, `trace`,
 * `spacing` (gap between riders as a fraction of the path, 0–0.5; 0.08), `show-path` (draw the full path faintly).
 * Property `progress` (0–1). Event `usa:done` (view mode, when it reaches the end).
 */
interface UsaPathMotionElement extends UsaElement {
    progress: number;
}
declare function definePathMotion(tag?: string): CustomElementConstructor | undefined;

type CutStyle = 'slice' | 'shred' | 'split' | 'tear';
/** The clip-path polygons of `count` strips (horizontal for slice, vertical for shred), in percent. */
declare function stripClips(style: CutStyle, count: number): string[];
/**
 * A cut transition for any content: copies of it are cut into strips (`slice` horizontal, `shred` vertical), two
 * halves (`split`) or two torn halves (`tear`) that fly in from alternating sides and meet, then the real content
 * takes their place. `play('out')` cuts it apart again and leaves it hidden. The copies are `aria-hidden`, `inert`
 * and stripped of ids; while they move, the real content is only made transparent, so it keeps its place in the
 * layout and in the accessibility tree. Plays
 * when it scrolls into view unless `trigger="manual"`. Reduced motion fades instead.
 *
 * Attributes: `cut` (slice | shred | split | tear; slice), `pieces` (strips for slice / shred, 2–24; 6),
 * `duration` (ms; 900), `trigger` (view | manual; view).
 * Method `play(direction?: 'in' | 'out')` (a promise). Event `usa:done` ({ direction }).
 */
interface UsaCutRevealElement extends UsaElement {
    play(direction?: 'in' | 'out'): Promise<void>;
}
declare function defineCutReveal(tag?: string): CustomElementConstructor | undefined;

/** The suggestions that contain `query` (case-insensitive), the ones that start with it first, at most `max`. */
declare function matchSuggestions(items: string[], query: string, max?: number): string[];
/**
 * A search button that widens into a search field. The field is a native `input type="search"` inside a form with
 * `role="search"`; pressing the shortcut key (`/` by default) anywhere outside another field opens and focuses it, and
 * Escape empties and then closes it. Suggestions come from `suggestions` (comma list) or child `<option>` elements and
 * follow the ARIA combobox pattern (arrow keys, Enter, Escape). Submitting emits `usa:search`.
 *
 * Attributes: `label` (Search), `placeholder`, `suggestions`, `shortcut` (/; "none" turns it off), `expanded`,
 * `width` (CSS width when open; 320px), `name` (q).
 * Events `usa:search` ({ query }), `usa:toggle` ({ expanded }).
 */
interface UsaSearchBarElement extends UsaElement {
    expanded: boolean;
    readonly value: string;
}
declare function defineSearchBar(tag?: string): CustomElementConstructor | undefined;

/** A plain, permissive email check: something@something.tld, no spaces, at most 254 characters. */
declare function isEmail(text: string): boolean;
/**
 * A newsletter sign-up: an email field and a button in one pill. A bad address shakes the field and says why; a good
 * one emits `usa:subscribe` with the address. The element never sends anything itself: if no listener calls
 * `preventDefault()` it shows the thank-you state at once; a listener that does can call `done()` or `error(message)`
 * when its own request finishes (the button shows a spinner meanwhile). The button then shrinks to a drawn tick.
 * Messages go to a polite live region. Any element children are kept above the form as its intro.
 *
 * Attributes: `label` (Email address), `placeholder` (you@example.com), `button-label` (Subscribe),
 * `success` (Thanks! Check your inbox.), `invalid` (Enter a valid email address).
 * Events `usa:subscribe` ({ email }, cancelable), `usa:done`, `usa:error` ({ message }).
 */
interface UsaSubscribeElement extends UsaElement {
    readonly state: 'idle' | 'sending' | 'done' | 'error';
    done(): void;
    error(message?: string): void;
    reset(): void;
}
declare function defineSubscribe(tag?: string): CustomElementConstructor | undefined;

/** A progress value (0–100) as a whole-number percentage label. */
declare function percentLabel(p: number): string;
/**
 * A download button that fills with progress and ends on a drawn tick. Pressing it emits `usa:start`; the page then sets
 * `progress` (0–100) as its download moves on, and at 100 the button turns into "done" and emits `usa:done`. For a demo
 * or a known wait, `duration` (ms) fills it by itself. The button is a native `button` with `aria-busy` while running; a
 * live region reads the percentage in tens. Pressing again when done starts over unless `once` is set.
 *
 * Attributes: `label` (Download), `done-label` (Downloaded), `progress` (0–100), `duration` (ms; 0 = driven by the page),
 * `once`.
 * Events `usa:start`, `usa:done`.
 */
interface UsaDownloadButtonElement extends UsaElement {
    progress: number;
    readonly state: 'idle' | 'busy' | 'done';
    reset(): void;
}
declare function defineDownloadButton(tag?: string): CustomElementConstructor | undefined;

/** How far (0–1) a block whose top is at `top` and height `height` has risen into a viewport `vh` tall. */
declare function riseProgress(top: number, height: number, vh: number): number;
/**
 * A footer that is uncovered rather than scrolled in: as it rises into view its content slides up from beneath the page
 * above, grows to full size and loses a soft shadow, like a drawer under the last section. The children stay in normal
 * flow inside a `footer` (or `role="contentinfo"` is left to the page when `landmark="false"`), so links and focus order
 * are untouched. Under reduced motion it is a plain footer.
 *
 * Attributes: `shift` (percent of its height the content starts below; 0–100; 50), `landmark` (on unless "false").
 * Event `usa:reveal` once it is fully in view.
 */
interface UsaRevealFooterElement extends UsaElement {
    readonly progress: number;
}
declare function defineRevealFooter(tag?: string): CustomElementConstructor | undefined;

declare const DIVIDER_SHAPES: readonly ["wave", "curve", "tilt", "arrow", "zigzag", "steps"];
type DividerShape = (typeof DIVIDER_SHAPES)[number];
/**
 * SVG path data for a divider `w` × `h` (the filled part is at the top, the edge runs along the bottom). `phase`
 * (radians) moves the wave crests; `amp` (0–1) scales the edge's depth.
 */
declare function dividerPath(shape: string, w?: number, h?: number, phase?: number, amp?: number): string;
/**
 * A section divider drawn in SVG: wave, curve, tilt, arrow, zigzag or steps, in the text color (or `color`). Put it
 * between two sections; `position="bottom"` turns it upside down for the foot of a section, `flip` mirrors it. The
 * wave can have up to three layers that drift slowly (`animate`); they stop off screen and stand still under reduced
 * motion. Decorative only: `aria-hidden`.
 *
 * Attributes: `shape` (wave), `height` (px; 80), `position` (top | bottom), `flip`, `color`, `layers` (1–3; 1),
 * `animate`.
 */
interface UsaShapeDividerElement extends UsaElement {
}
declare function defineShapeDivider(tag?: string): CustomElementConstructor | undefined;

declare const CUE_KINDS: readonly ["mouse", "chevron", "line"];
/**
 * A "scroll down" hint for the bottom of a hero: a mouse with a rolling wheel, a pair of blinking chevrons or a line
 * with a falling dash. It is a real button: pressing it scrolls to `target` (or one screen down). It fades away once
 * the page has scrolled past `hide-after` px and comes back near the top. The looping hint stops under reduced motion.
 *
 * Attributes: `kind` (mouse | chevron | line; mouse), `label` (Scroll down), `target` (selector), `hide-after` (px; 40),
 * `text` (visible caption; none).
 * Events `usa:hide`, `usa:show`.
 */
interface UsaScrollCueElement extends UsaElement {
    readonly away: boolean;
}
declare function defineScrollCue(tag?: string): CustomElementConstructor | undefined;

/** The rows to render: [start, end) and the pixel offset of `start`, for a scroll position and a fixed row height. */
declare function virtualWindow(scrollTop: number, viewport: number, rowHeight: number, count: number, overscan?: number): {
    start: number;
    end: number;
    offset: number;
};
/**
 * A scrolling list that only puts the rows on screen into the page, so tens of thousands of items stay fast. Items come
 * from the `items` property (strings, or objects shown through `render`), from a child `script type="application/json"`
 * holding an array, or from the child `li` elements. Rows have one fixed height. The list is a focusable region with
 * `role="list"`; each row says where it sits (`aria-setsize`, `aria-posinset`), and arrow keys, Page Up / Down, Home and
 * End scroll it. Rows that scroll in fade up slightly unless motion is reduced.
 *
 * Attributes: `row-height` (px; 40), `height` (CSS height; 320px), `overscan` (rows; 4), `label` (List).
 * Event `usa:range` ({ start, end }) when the rendered rows change.
 */
interface UsaVirtualListElement extends UsaElement {
    items: unknown[];
    render?: (item: unknown, index: number) => string | Node;
    scrollToIndex(index: number): void;
}
declare function defineVirtualList(tag?: string): CustomElementConstructor | undefined;

/**
 * Loads more as the reader reaches the end. When the bottom of the content comes within `root-margin` of the screen,
 * the element emits `usa:load` with the next page number and shows a spinner; the page appends the new items (to the
 * element, or to its first child list) and calls `done()`, or `end()` when there is nothing more. New items rise in one
 * after another. A real "Load more" button sits under the list for keyboards, for browsers without
 * IntersectionObserver and for `auto="false"`; a polite live region says when items were added and when the list ends.
 *
 * Attributes: `root-margin` (200px), `auto` (on unless "false"), `label` (Loading more), `button-label` (Load more),
 * `end-label` (You have reached the end), `stagger` (ms between new items; 40).
 * Events `usa:load` ({ page }), `usa:end`.
 */
interface UsaInfiniteScrollElement extends UsaElement {
    readonly page: number;
    readonly loading: boolean;
    done(): void;
    end(): void;
    reset(): void;
}
declare function defineInfiniteScroll(tag?: string): CustomElementConstructor | undefined;

/** Where to put a menu `w` × `h` opened at (x, y) so it stays `pad` px inside a `vw` × `vh` viewport (flips at edges). */
declare function placeMenu(x: number, y: number, w: number, h: number, vw: number, vh: number, pad?: number): {
    left: number;
    top: number;
    originX: 'left' | 'right';
    originY: 'top' | 'bottom';
};
/**
 * A right-click menu for an area. The element's `menu` child (or the child marked `data-menu`) holds the items as
 * buttons or links (an `hr` separates groups, `aria-disabled="true"` disables one); the other children are the area.
 * Right-click, a long press on touch, the Menu key or Shift+F10 opens it at the pointer (or at the area's corner), it
 * grows from that corner and stays inside the window. It follows the ARIA menu pattern: arrow keys, Home / End, first
 * letter, Enter, Escape and Tab close it and focus returns to the area. Holding Shift while right-clicking keeps the
 * browser's own menu.
 *
 * Attributes: `label` (Actions), `long-press` (ms; 500; 0 turns it off).
 * Events `usa:open` ({ x, y }), `usa:select` ({ index, label }), `usa:close`.
 */
interface UsaContextMenuElement extends UsaElement {
    readonly open: boolean;
    show(x?: number, y?: number): void;
    close(): void;
}
declare function defineContextMenu(tag?: string): CustomElementConstructor | undefined;

/** A split position (percent) kept between `min` and `max` (themselves kept within 0–100), rounded to 0.1. */
declare function clampSplit(pct: number, min?: number, max?: number): number;
/**
 * Two panes with a handle between them. Drag the handle (mouse, pen or touch) or focus it and use the arrow keys
 * (Shift for bigger steps), Home / End for the limits and Enter to fold the first pane to its minimum and back. Double
 * click springs back to where it started. The handle is a `role="separator"` with `aria-valuenow`, labelled and tied to
 * the first pane. The first two element children are the panes.
 *
 * Attributes: `orientation` (horizontal | vertical; horizontal = side by side), `position` (percent of the first pane;
 * 50), `min` (10), `max` (90), `step` (5), `height` (CSS height; 320px), `label` (Resize panes).
 * Event `usa:change` ({ position }) when a drag or key press ends.
 */
interface UsaSplitPaneElement extends UsaElement {
    position: number;
}
declare function defineSplitPane(tag?: string): CustomElementConstructor | undefined;

/** A window position kept inside a desktop `W` × `H` so at least its title bar (`grip` px) stays reachable. */
declare function clampWindow(x: number, y: number, w: number, W: number, H: number, grip?: number): {
    x: number;
    y: number;
};
/**
 * A little desktop of overlapping windows. Each element child becomes a window titled by its `data-title` (and sized by
 * `data-width`); drag a window by its title bar, click it to bring it to the front, close it with its × button and open
 * it again from the dock at the bottom. Windows open with a short pop and close back toward their dock button. By
 * keyboard: the title bar is a focusable handle; arrow keys move the window (Shift for 40 px), Escape closes it; the dock
 * buttons are toggle buttons (`aria-pressed` = the window in front).
 *
 * Attributes: `height` (CSS height; 420px), `label` (Desktop), `close-label` (Close).
 * Events `usa:focus` ({ index }), `usa:close` ({ index }), `usa:open` ({ index }), `usa:move` ({ index, x, y }).
 */
interface UsaDesktopWindowsElement extends UsaElement {
    readonly active: number;
    open(index: number): void;
    close(index: number): void;
}
declare function defineDesktopWindows(tag?: string): CustomElementConstructor | undefined;

/**
 * The pose of a card `offset` places behind the front card (0 = front, negative = already passed) in a stack that shows
 * `visible` cards: lift (px, negative = up), scale, opacity and stacking order.
 */
declare function stackPose(offset: number, visible?: number): {
    y: number;
    scale: number;
    opacity: number;
    z: number;
};
/**
 * A stack of cards with the current one in front and the next few peeking out behind, smaller. Next sends the front card
 * off to the side and the next one steps forward; previous brings it back. Swipe or drag the front card sideways, use the
 * buttons, or the arrow keys on the stack. Cards behind the front are `inert`; a counter and a polite live region say
 * which card is showing.
 *
 * Attributes: `index` (0), `visible` (1–5 cards behind; 3), `loop`, `label` (Cards), `prev-label` (Previous),
 * `next-label` (Next).
 * Event `usa:change` ({ index }).
 */
interface UsaStackSliderElement extends UsaElement {
    index: number;
    next(): void;
    prev(): void;
}
declare function defineStackSlider(tag?: string): CustomElementConstructor | undefined;

/** The transform that makes a box at `to` look like it sits at `from` (FLIP "invert" step). */
declare function invertRect(from: {
    left: number;
    top: number;
    width: number;
    height: number;
}, to: {
    left: number;
    top: number;
    width: number;
    height: number;
}): string;
/**
 * A card that grows into its detail view. The first element child is the card (wrapped in a real button); the child
 * marked `data-detail` is what opens. Pressing the card opens a native modal `<dialog>` whose panel morphs out of the
 * card's own box (one shared-element FLIP) while the backdrop fades in; closing, Escape or a click on the backdrop
 * shrinks it back into the card and returns focus. Under reduced motion it simply opens and closes.
 *
 * Attributes: `label` (accessible name of the card button; the card's text otherwise), `close-label` (Close).
 * Events `usa:open`, `usa:close`.
 */
interface UsaMorphCardElement extends UsaElement {
    readonly open: boolean;
    show(): void;
    close(): void;
}
declare function defineMorphCard(tag?: string): CustomElementConstructor | undefined;

/** Scale, corner radius (px) and caption opacity at scroll `progress` (0–1), growing from `from` to full size by 0.7. */
declare function zoomAt(progress: number, from?: number, radius?: number): {
    scale: number;
    radius: number;
    caption: number;
};
/**
 * A picture or video that starts as a small rounded card and grows to fill the screen as you scroll through the section,
 * then lets a caption rise over it. The first element child is the media; any further children form the caption. The
 * section is pinned with `position: sticky` for `length` of scrolling. Under reduced motion, below `min-width` px wide or
 * without sticky support it is the media at full width with the caption under it.
 *
 * Attributes: `from` (starting scale; 0.05–1; 0.45), `radius` (starting corner radius px; 28), `length` (CSS length of
 * the scroll; 250vh), `min-width` (px; 640), `label`.
 * Event `usa:progress` ({ progress }) at 0, 0.25, 0.5, 0.75 and 1.
 */
interface UsaScrollZoomElement extends UsaElement {
    readonly progress: number;
}
declare function defineScrollZoom(tag?: string): CustomElementConstructor | undefined;

/** Element rectangles keyed by element, for a FLIP step. */
declare function measure(els: Iterable<Element>): Map<Element, DOMRect>;
/**
 * FLIP: after the DOM has changed, animate each element from where it was (`before`) to where it is now.
 * Elements that were not measured before fade and scale in. Returns the started animations.
 */
declare function flip(before: Map<Element, DOMRect>, els: Iterable<Element>, duration?: number): Animation[];
/**
 * Tween a number from `from` to `to` over `ms`, calling `update` each frame (reduced motion: one call with `to`).
 * Returns a cancel function.
 */
declare function tween(from: number, to: number, ms: number, update: (v: number, done: boolean) => void, el?: Element): () => void;
/** An image address that is safe to load: http(s), data:image, or a relative / root-relative path; otherwise ''. */
declare function safeImageUrl(u: string): string;
/** A CSS color the browser accepts, or ''. Without `CSS.supports` only plain words, hex, rgb/hsl/oklch() pass. */
declare function cleanColor(value: string): string;

/** Index of the section whose box spans the line `line` px from the viewport top (the last one above it otherwise). */
declare function sectionAt(tops: number[], line: number): number;
/**
 * Background (and text) color that changes as you scroll from one section to the next. Each element child is a
 * section with `data-bg` and optionally `data-fg`; when a section crosses the `line` (a fraction of the screen height),
 * the element (or the `target`, e.g. `body`) eases to its colors. Colors are checked with `CSS.supports`. Under reduced
 * motion the colors still change, without the fade. Pick pairs with enough contrast; the element does not check it.
 *
 * Attributes: `target` (selector; the element itself), `line` (0–1; 0.5).
 * Event `usa:change` ({ index, color }).
 */
interface UsaScrollBgElement extends UsaElement {
    readonly index: number;
}
declare function defineScrollBg(tag?: string): CustomElementConstructor | undefined;

/**
 * Where item `i` of `n` sits in the tunnel at scroll `progress` (0–1): depth `z` (px, negative = far away), sideways
 * offsets (alternating left / right, up / down) and opacity (fades in from the far end, out as it passes the viewer).
 */
declare function tunnelPose(progress: number, i: number, n: number, depth?: number): {
    x: number;
    y: number;
    z: number;
    opacity: number;
};
/**
 * A scroll-driven tunnel of pictures: as you scroll through the section, each image flies out of the distance toward
 * you, alternating left and right, and fades as it passes. Each element child (an `img`, a `figure`, a link…) is one
 * image. The section is pinned for `length` of scrolling (per image). Under reduced motion, below `min-width` px or
 * without sticky / 3D support it is a plain grid of the same children.
 *
 * Attributes: `depth` (px; 1600), `length` (scroll per image, vh; 70), `size` (CSS width of an image),
 * `min-width` (px; 640), `label` (Gallery).
 * Event `usa:change` ({ index }) as the nearest image changes.
 */
interface UsaImageTunnelElement extends UsaElement {
    readonly index: number;
}
declare function defineImageTunnel(tag?: string): CustomElementConstructor | undefined;

/** The item facing the viewer when the ring is turned `rotation` degrees (items `360 / n` apart, item 0 at 0°). */
declare function frontIndex(rotation: number, n: number): number;
/** The ring radius (px) that keeps `n` items of width `w` with a `gap` between them around the circle. */
declare function ringRadius(n: number, w: number, gap?: number): number;
/**
 * Pictures on a slowly turning 3D ring. Drag (or swipe) to spin it, and it coasts to a stop on the nearest picture;
 * the arrow keys turn it one picture at a time; the picture in front is the focusable one and pressing it emits
 * `usa:select`. Each element child is one picture and is wrapped in a button. The idle turn stops while the pointer or
 * focus is on the ring, off screen and under reduced motion, and a pause button stops it for good.
 *
 * Attributes: `speed` (degrees per second; 6; 0 = still), `tilt` (degrees; -8), `item-width` (px; 180),
 * `height` (CSS height; 420px), `label` (Gallery), `pause-label` (Pause), `play-label` (Play).
 * Events `usa:change` ({ index }), `usa:select` ({ index }).
 */
interface UsaOrbitGalleryElement extends UsaElement {
    index: number;
}
declare function defineOrbitGallery(tag?: string): CustomElementConstructor | undefined;

/** The line's sag (px below the ends) at `t` (0–1 along it) for a parabola with `sag` at the middle. */
declare function sagAt(t: number, sag: number): number;
/** One step of a damped spring: returns the new [angle, velocity] after `dt` seconds. */
declare function swingStep(angle: number, velocity: number, dt: number, stiffness?: number, damping?: number): [number, number];
/**
 * Photos (or cards) pegged to a sagging line. Moving the pointer across them gives each a push that makes it swing on
 * its peg and settle; pulling one down with the pointer stretches the line a little. Keyboard focus inside a card gives
 * it a small swing too, so the effect is never pointer-only. Each element child hangs from its own peg at the height of
 * the curve. The swinging stops off screen and does not happen under reduced motion.
 *
 * Attributes: `sag` (px; 24), `item-width` (CSS width; 160px), `strength` (push per px/ms; 1), `label`.
 * Event `usa:swing` ({ index }) when a card is pushed.
 */
interface UsaClotheslineElement extends UsaElement {
    swing(index: number, amount?: number): void;
}
declare function defineClothesline(tag?: string): CustomElementConstructor | undefined;

/**
 * Path data for a `w` × `h` box with corner radius `r` whose four edges bow outward at their middles by
 * `top`, `right`, `bottom` and `left` px (negative pulls them in).
 */
declare function elasticPath(w: number, h: number, r: number, bow: {
    top: number;
    right: number;
    bottom: number;
    left: number;
}): string;
/**
 * A frame made of rubber: when the pointer comes near an edge from outside or inside, that edge bows toward it, and it
 * snaps back with a wobble when the pointer moves away. Keyboard focus inside gives the frame a small pulse. The frame is
 * drawn as an SVG path behind the children, in `--fill` / `--stroke` (or `fill` / `stroke`). Under reduced motion it
 * is a still rounded box.
 *
 * Attributes: `stretch` (px; 22), `reach` (px from an edge that pulls it; 70), `radius` (px; 18), `fill`, `stroke`,
 * `stroke-width` (px; 2).
 */
interface UsaElasticFrameElement extends UsaElement {
}
declare function defineElasticFrame(tag?: string): CustomElementConstructor | undefined;

/**
 * A card whose border carries a travelling beam of light: a short bright arc that runs around the edge, fading from one
 * color into another, with an optional soft glow under it. Built from a masked conic gradient and a registered custom
 * property, so it costs no script per frame; it pauses off screen. Browsers without `@property` show a still gradient
 * border, and so does reduced motion.
 *
 * Attributes: `duration` (seconds per lap; 1–60; 6), `colors` (two comma-separated colors), `length` (degrees of the
 * beam; 20–300; 70), `width` (border px; 1–8; 2), `radius` (px; 18), `glow`, `reverse`.
 */
interface UsaBorderBeamElement extends UsaElement {
}
declare function defineBorderBeam(tag?: string): CustomElementConstructor | undefined;

/**
 * Feature tabs that play themselves: the active tab fills a progress bar and, when it is full, the next tab opens.
 * Each child is a panel; its `data-tab` names the tab (or its first heading, or "1", "2", …). The tabs follow the ARIA
 * tab pattern with roving focus (arrow keys, Home, End). Autoplay waits while the pointer or focus is inside, while the
 * element is off screen and after the pause button is pressed; it is off under reduced motion, where panels switch at
 * once. The bar is a CSS animation, so no script runs per frame.
 *
 * Attributes: `index` (0), `interval` (ms per tab; 5000; 0 = no autoplay), `label` (Features), `pause-label` (Pause),
 * `play-label` (Play).
 * Event `usa:change` ({ index }).
 */
interface UsaProgressTabsElement extends UsaElement {
    index: number;
    readonly playing: boolean;
    select(index: number): void;
}
declare function defineProgressTabs(tag?: string): CustomElementConstructor | undefined;

/**
 * Code blocks behind tabs (npm / pnpm / yarn, JS / TS, …) with a sliding underline and a copy button. Each child is a
 * block (usually a `pre`); its `data-tab` names the tab. Elements with the same `group` switch together. The copy
 * button copies the visible block's text and turns into a drawn tick for a moment; the events never carry the code.
 *
 * Attributes: `index` (0), `group` (none), `label` (Code), `copy-label` (Copy), `copied-label` (Copied).
 * Events `usa:change` ({ index, label }), `usa:copy` ({ index }).
 */
interface UsaCodeTabsElement extends UsaElement {
    index: number;
    copy(): Promise<boolean>;
}
declare function defineCodeTabs(tag?: string): CustomElementConstructor | undefined;

/**
 * "Was this helpful?" under an article: two thumb buttons. The chosen thumb pops on a spring and the row turns into a
 * thank-you line. With `ask-why`, a "No" opens a short text box first (and its Send button) before saying thanks. Nothing
 * is sent anywhere: the page reads `usa:vote` / `usa:feedback` and stores the answer itself.
 *
 * Attributes: `question` (Was this helpful?), `yes-label` (Yes), `no-label` (No), `thanks` (Thanks for the feedback!),
 * `ask-why`, `why-label` (What was missing?), `send-label` (Send).
 * Events `usa:vote` ({ vote }), `usa:feedback` ({ vote, text }).
 */
interface UsaHelpfulVoteElement extends UsaElement {
    readonly vote: '' | 'yes' | 'no';
    reset(): void;
}
declare function defineHelpfulVote(tag?: string): CustomElementConstructor | undefined;

declare const SHARE_TARGETS: readonly ["copy", "x", "linkedin", "facebook", "email"];
type ShareTarget = (typeof SHARE_TARGETS)[number];
/** The address that shares `url` (and `title`) on `target`; `''` for copy or an unknown target or a non-http(s) url. */
declare function shareUrl(target: string, url: string, title?: string): string;
/**
 * A share button. Pressing it fans out a row of targets on a spring (copy link, X, LinkedIn, Facebook, email); the
 * targets are ordinary links that open the network's own share page, and "Copy link" copies the address and draws a
 * tick. With `native`, devices that have the Web Share sheet use it instead. Esc or a click outside folds the row back.
 *
 * Attributes: `url` (this page), `share-title` (the document title), `targets` (copy, x, linkedin, email), `label` (Share),
 * `copied-label` (Link copied), `native`.
 * Events `usa:open`, `usa:close`, `usa:share` ({ target }).
 */
interface UsaShareButtonElement extends UsaElement {
    readonly open: boolean;
    toggle(force?: boolean): void;
}
declare function defineShareButton(tag?: string): CustomElementConstructor | undefined;

/**
 * Text that edits in place. The text is shown inside a button with a small pencil; pressing it (or Enter / F2 on it)
 * swaps in a text field of the same width, already selected. Enter or leaving the field saves and the saved text flashes
 * once; Escape puts the old text back. Empty text is refused unless `allow-empty` is set.
 *
 * Attributes: `value` (the child text), `label` (Edit), `placeholder`, `maxlength` (200), `allow-empty`.
 * Events `usa:edit`, `usa:change` ({ value, previous }), `usa:cancel`.
 */
interface UsaInlineEditElement extends UsaElement {
    value: string;
    edit(): void;
}
declare function defineInlineEdit(tag?: string): CustomElementConstructor | undefined;

/** The font size (px) for a tag of `weight` (1–10) between `min` and `max` px, on a gentle square-root curve. */
declare function tagSize(weight: number, min?: number, max?: number): number;
/**
 * A word cloud from the children (links, buttons or plain spans). Each child's `data-weight` (1–10) sets its size;
 * heavier tags are drawn bolder. The tags rise in one after another when the cloud first scrolls into view and then bob
 * very slightly, each on its own beat; hovering or focusing one lifts it and dims the rest. The children stay where they
 * are in the reading order. Under reduced motion they are simply shown.
 *
 * Attributes: `min-size` (px; 14), `max-size` (px; 40), `still` (no bobbing), `label` (Tags).
 */
interface UsaTagCloudElement extends UsaElement {
}
declare function defineTagCloud(tag?: string): CustomElementConstructor | undefined;

/** The level (0–4) of `value` on a scale up to `max`: 0 only for zero, then four equal bands. */
declare function heatLevel(value: number, max: number): number;
/**
 * An activity calendar: one small square per day, seven to a column, shaded in five steps from empty to busiest (like a
 * contribution graph). The squares fade in on a diagonal sweep when the calendar first scrolls into view. It is an ARIA
 * grid with one tab stop: arrow keys move day by day and week by week, Home / End go to the ends of a week, and each cell
 * reads "<date or day number>: <value> <unit>". Hover or focus shows the same text in a tooltip; Enter or a click emits
 * `usa:select`. Set the numbers with `values` (or the `data` property); `start` (YYYY-MM-DD) dates the first square.
 *
 * Attributes: `values` (comma-separated numbers), `start` (date of the first value), `label` (Activity), `unit`
 * (contributions), `colors` (five comma-separated colors, empty → busiest).
 * Event `usa:select` ({ index, value }).
 */
interface UsaHeatmapElement extends UsaElement {
    data: number[];
}
declare function defineHeatmap(tag?: string): CustomElementConstructor | undefined;

/** Where each slice starts and how long it is, as fractions of the ring (a 0.5% gap between slices when more than one). */
declare function donutArcs(values: readonly number[]): {
    start: number;
    length: number;
}[];
/**
 * A donut chart whose slices draw in one after another when it scrolls into view, with the total counting up in the
 * middle. Hovering or focusing a slice (or its legend entry) lifts it out and shows its value and share in the middle.
 * The legend is a list of real buttons, so the chart works by keyboard and is read as text; the SVG is decorative.
 *
 * Attributes: `values` (comma-separated numbers), `labels` (comma-separated), `colors` (comma-separated), `label` (Chart),
 * `unit` (none), `thickness` (ring width as a share of the radius; 0.1–0.9; 0.38), `center-label` (Total).
 * Event `usa:select` ({ index, value }).
 */
interface UsaDonutChartElement extends UsaElement {
    data: number[];
}
declare function defineDonutChart(tag?: string): CustomElementConstructor | undefined;

/** The index a dragged item should take: how many of the other items' middles lie above the pointer `y`. */
declare function dropIndex(y: number, middles: readonly number[]): number;
/**
 * A list you reorder by dragging. Each item (the `li`s of a child `ul` / `ol`, or the direct children) gets a grip
 * button; drag it and the other items glide out of the way. By keyboard: focus a grip, press Space or Enter to pick the
 * item up, the arrow keys to move it, Space or Enter to drop it, Escape to put it back. Every step is read out in a polite
 * live region. The items themselves are moved in the DOM, so a form inside keeps its order.
 *
 * Attributes: `label` (Reorder), `grab-label` (Move), `picked` ({item} picked up), `moved` ({item}, position {n} of
 * {total}), `dropped` ({item} dropped).
 * Event `usa:sort` ({ from, to }).
 */
interface UsaSortableListElement extends UsaElement {
    readonly order: number[];
}
declare function defineSortableList(tag?: string): CustomElementConstructor | undefined;

/**
 * The background position (px) that shows the point (`x`, `y`) of a `w` × `h` image, magnified `zoom` times, in the
 * middle of a round lens `size` px wide.
 */
declare function lensOffset(x: number, y: number, w: number, h: number, zoom: number, size: number): {
    x: number;
    y: number;
};
/**
 * A magnifying lens for a product photo. Move the pointer over the image (or press and drag on a touch screen) and a
 * round lens follows it, showing that spot enlarged. By keyboard: focus the image, then the arrow keys move the lens
 * (Shift for bigger steps), + and − change the zoom, Escape hides it. The lens uses the image's own `currentSrc`, so a
 * responsive image is magnified at the size the browser chose. It scales in on a spring, or just appears under reduced
 * motion.
 *
 * Attributes: `zoom` (1.5–6; 2.5), `size` (lens diameter px; 80–400; 170), `label` (Zoom).
 * Events `usa:zoom` ({ zoom }).
 */
interface UsaZoomLensElement extends UsaElement {
    zoom: number;
}
declare function defineZoomLens(tag?: string): CustomElementConstructor | undefined;

/** Total and average of star counts given from the top star down (`[five, four, three, two, one]`). */
declare function ratingSummary(counts: readonly number[]): {
    total: number;
    average: number;
};
/**
 * A review summary: the average score counts up beside a row of stars that fill to it, and one bar per star level grows
 * to its share, top to bottom, when the block scrolls into view. Each bar is a button (for "show only 4-star reviews"),
 * reading for example "4 stars: 120 reviews, 31%".
 *
 * Attributes: `values` (counts from the top star down; 5 numbers for a 5-star scale), `label` (Ratings), `reviews-label`
 * (reviews), `stars-label` (stars).
 * Event `usa:select` ({ stars }).
 */
interface UsaRatingBarsElement extends UsaElement {
    readonly average: number;
}
declare function defineRatingBars(tag?: string): CustomElementConstructor | undefined;

/** Dash offset of a progress ring of radius `r` with `done` of `total` filled. */
declare function ringDash(done: number, total: number, r?: number): {
    length: number;
    offset: number;
};
/**
 * An onboarding checklist. Each child becomes one task with a real checkbox (a child that already holds a checkbox keeps
 * it). Ticking a task draws a line through it and moves a progress ring in the header on; when every task is ticked the
 * ring pops, the heading changes to `done-label` and `usa:complete` fires. Unticking works too. The count is read out
 * politely.
 *
 * Attributes: `label` (Getting started), `done-label` (All done!).
 * Events `usa:change` ({ index, checked, done, total }), `usa:complete`.
 */
interface UsaChecklistElement extends UsaElement {
    readonly done: number;
}
declare function defineChecklist(tag?: string): CustomElementConstructor | undefined;

/** Start position (% of the box), delay (s), duration (s) and tail length (px) of meteor `i`, the same on every load. */
declare function meteorAt(i: number): {
    left: number;
    top: number;
    delay: number;
    duration: number;
    tail: number;
};
/**
 * A panel with shooting stars streaking across behind its content. Each meteor is a CSS-animated streak with a glowing
 * head and a fading tail; the layout is the same on every load. The streaks stop while the panel is off screen, and are
 * not drawn at all under reduced motion. The children sit on top and keep their reading order.
 *
 * Attributes: `count` (1–60; 18), `angle` (degrees; 215), `color` (#fff), `speed` (0.25–4; 1).
 */
interface UsaMeteorsElement extends UsaElement {
}
declare function defineMeteors(tag?: string): CustomElementConstructor | undefined;

/** An SVG path from (x1, y1) to (x2, y2) that bows sideways by `curve` (a share of the distance; 0 = straight). */
declare function beamPath(x1: number, y1: number, x2: number, y2: number, curve?: number): string;
/**
 * Animated beams between parts of a diagram: a faint line joins each pair of named children and a bright pulse of light
 * travels along it, again and again — for "your app → our API → the services" pictures. Name the children with
 * `data-node` and list the joins in `links` as `from>to` pairs. The lines are redrawn when the layout changes. They are
 * decorative (`aria-hidden`); the children stay as written. The pulses stop off screen and under reduced motion, where
 * the lines stay.
 *
 * Attributes: `links` (comma-separated `from>to` pairs), `curve` (−1–1; 0.2), `colors` (two comma-separated colors),
 * `duration` (seconds per pulse; 0.5–20; 3).
 */
interface UsaConnectBeamElement extends UsaElement {
    redraw(): void;
}
declare function defineConnectBeam(tag?: string): CustomElementConstructor | undefined;

/**
 * A synthwave floor: a grid of glowing lines laid in perspective that rolls toward the viewer and fades into the
 * horizon, with an optional striped sun. Pure CSS (a tilted plane with a moving gradient), so no script runs per frame;
 * it pauses off screen and holds still under reduced motion. The children sit on top.
 *
 * Attributes: `angle` (tilt in degrees; 30–85; 65), `cell` (grid size px; 20–200; 60), `color` (line color), `speed`
 * (0.25–4; 1), `sun`.
 */
interface UsaRetroGridElement extends UsaElement {
}
declare function defineRetroGrid(tag?: string): CustomElementConstructor | undefined;

/** The starting angle (degrees) of item `i` of `n` on one ring; rings after the first are offset by half a step. */
declare function orbitAngle(i: number, n: number, ring?: number): number;
/**
 * Icons orbiting a centre on concentric rings, like an integrations diagram. The first child marked `data-center` (or
 * the first child) sits in the middle; the others go on ring 1, 2 or 3 (`data-ring`, otherwise spread over the rings)
 * and travel around it while staying upright, inner rings faster, alternate rings the other way. Hover or focus inside
 * pauses the motion so an item can be read or clicked; it also stops off screen and holds still under reduced motion.
 *
 * Attributes: `radius` (px between rings; 40–200; 72), `duration` (seconds per lap of the inner ring; 4–120; 24),
 * `label` (none).
 */
interface UsaOrbitRingsElement extends UsaElement {
}
declare function defineOrbitRings(tag?: string): CustomElementConstructor | undefined;

/**
 * Hover text where every letter rolls out of view and a copy rolls in behind it, one after another — for links,
 * buttons and menu items. It works on its first child element (a link or button) or on its own text. Only plain text is
 * split; the visible letters are hidden from assistive technology and the whole word is kept for it in one piece, so
 * the link still reads "Pricing". Keyboard focus plays it too. Under reduced motion the text simply stays.
 *
 * Attributes: `stagger` (ms between letters; 0–120; 24), `direction` (up | down; up).
 */
interface UsaLetterSwapElement extends UsaElement {
}
declare function defineLetterSwap(tag?: string): CustomElementConstructor | undefined;

/**
 * How strongly a dot `dist` px from a ripple's centre is lit `t` ms after it started: a ring of `width` px that travels
 * at `speed` px/ms and fades out as it grows. 0–1.
 */
declare function rippleAt(dist: number, t: number, speed?: number, width?: number, life?: number): number;
/**
 * A field of dots behind the content that ripples like water: click or tap anywhere on it and a ring of light spreads out
 * from that point, lifting the dots it passes. With `auto` (ms) a ripple starts from a random spot now and then while it
 * is on screen. Drawn on a canvas only while a ripple is running; it holds still off screen and under reduced motion. The
 * background is decorative; Enter or Space on the focused field starts a ripple from the middle.
 *
 * Attributes: `gap` (px between dots; 8–60; 20), `dot` (dot radius px; 0.5–6; 1.5), `color` (dot color), `accent`
 * (ripple color), `auto` (ms; 0 = off), `label` (Ripple field).
 * Event `usa:ripple` ({ x, y }).
 */
interface UsaRippleGridElement extends UsaElement {
    ripple(x?: number, y?: number): void;
}
declare function defineRippleGrid(tag?: string): CustomElementConstructor | undefined;

/**
 * A guided product tour. Each child with `data-step` is one step: its `data-target` (a CSS selector) names the part of
 * the page to point at, `data-title` its heading and its content the text. A child button with `data-start` starts the
 * tour (so does `start()` or the `open` attribute). The page dims except for a soft cut-out around the target, and a
 * card with Back / Next / Done and Skip sits next to it, scrolling the target into view first. The card is a labelled
 * non-modal dialog that takes focus; Escape ends the tour and focus goes back to where it was.
 *
 * Attributes: `open`, `label` (Tour), `next-label` (Next), `back-label` (Back), `done-label` (Done), `skip-label` (Skip),
 * `count-label` ("{n} of {total}"), `padding` (cut-out padding in px; 8).
 * Events `usa:step` ({ index }), `usa:end` ({ completed }).
 */
interface UsaTourElement extends UsaElement {
    readonly index: number;
    start(index?: number): void;
    next(): void;
    back(): void;
    end(): void;
}
declare function defineTour(tag?: string): CustomElementConstructor | undefined;

/**
 * A signature pad. Draw with a mouse, pen or finger: strokes are smoothed into curves and get thinner when drawn fast,
 * like ink (pen pressure is used when the device reports it). Undo takes back the last stroke and Clear empties the
 * pad. People who cannot draw can type their name instead; it is set in a handwriting style. With `name` the
 * signature is also put into a hidden form field as a PNG data URL, so a surrounding form submits it.
 *
 * Attributes: `label` (Signature), `color` (ink; #111827), `width` (base stroke in px; 2.5), `name`, `clear-label`
 * (Clear), `undo-label` (Undo), `type-label` (Or type your name), `placeholder` (Sign here).
 * Event `usa:change` ({ empty, strokes, typed }). Methods `clear()`, `undo()`, `toDataURL()`; property `empty`.
 */
interface UsaSignaturePadElement extends UsaElement {
    readonly empty: boolean;
    clear(): void;
    undo(): void;
    toDataURL(type?: string): string;
}
declare function defineSignaturePad(tag?: string): CustomElementConstructor | undefined;

/**
 * Drum-style wheels like a phone's time picker, built from the native `select` children (one wheel per select). Each
 * wheel scrolls and snaps to a row, the rows lean back in 3D the further they are from the centre, and the select
 * underneath is kept in sync, so forms and `change` listeners keep working. Each wheel is a `spinbutton`: arrow keys,
 * Page Up / Down, Home and End move it, and its value is read out. Clicking a row picks it.
 *
 * Attributes: `label` (Picker), `rows` (visible rows, odd, 3–9; 5).
 * Event `usa:change` ({ index, values }) where `index` is the wheel that moved and `values` the selected values.
 */
interface UsaWheelPickerElement extends UsaElement {
    readonly values: string[];
}
declare function defineWheelPicker(tag?: string): CustomElementConstructor | undefined;

/**
 * @-mentions for a text field. Wraps the child `textarea` or `input` (one is created when there is none). Typing the
 * trigger character opens a list of matching people under the field that pops in; arrow keys move through it, Enter or
 * Tab inserts the name, Escape closes it, and clicking a name works too. The field is a combobox, so screen readers
 * hear the active suggestion. Names come from `people` (comma-separated).
 *
 * Attributes: `people`, `trigger` (@), `max` (suggestions shown; 6), `label` (Message), `empty-label` (No matches).
 * Event `usa:mention` ({ name }).
 */
interface UsaMentionInputElement extends UsaElement {
    people: string[];
    readonly mentions: string[];
}
declare function defineMentionInput(tag?: string): CustomElementConstructor | undefined;

type EmojiEntry = {
    emoji: string;
    name: string;
    group: string;
};
/** Every built-in emoji with its keywords and group. */
declare const EMOJI: EmojiEntry[];
/** Emoji whose keywords contain every word of `query` (case-insensitive); all of them for an empty query. */
declare function filterEmoji(query: string, set?: readonly EmojiEntry[]): EmojiEntry[];
/**
 * An emoji panel: a search field, one tab per group, a "recent" row (kept in local storage when it is available) and a
 * grid of buttons that you walk with the arrow keys. Picking an emoji pops it and, with `for`, inserts it at the caret
 * of that input or textarea.
 *
 * Attributes: `for` (selector of a field to type into), `label` (Emoji), `search-label` (Search emoji),
 * `recent-label` (Recent), `empty-label` (No emoji found), `columns` (6–12; 8), `remember` (local storage key; off when
 * absent).
 * Event `usa:pick` ({ emoji, name }).
 */
interface UsaEmojiPickerElement extends UsaElement {
}
declare function defineEmojiPicker(tag?: string): CustomElementConstructor | undefined;

/** "3 replies" style text: `{n}` in `label` is replaced by the count; a separate singular form is used for 1. */
declare function replyCount(n: number, one?: string, many?: string): string;
/**
 * A threaded discussion built from nested `article` children: each has `data-author`, optional `data-time` and
 * `data-likes`, its text, and its replies as nested `article`s. Every comment gets an avatar with the author's initial,
 * a thread line, a like button that counts (and pops), a Reply button that opens a small form, and, when it has
 * replies, a toggle that folds them away with the count. Posted replies slide in under the comment and fire an event;
 * nothing is sent anywhere. The articles stay where they are, so the content reads the same without JavaScript.
 *
 * Attributes: `label` (Comments), `you` (author name for new replies; You), `reply-label` (Reply), `like-label` (Like),
 * `send-label` (Post), `hide-label` ("Hide replies"), `show-label` ("{n} replies"), `show-one-label` ("1 reply"),
 * `placeholder` (Write a reply…).
 * Events `usa:like` ({ index, liked, likes }), `usa:reply` ({ index, text }), `usa:toggle` ({ index, open }).
 */
interface UsaCommentThreadElement extends UsaElement {
}
declare function defineCommentThread(tag?: string): CustomElementConstructor | undefined;

/**
 * 17.13 helpers shared by the studio widgets (tour, wheel-picker, mention-input, diff-viewer, the charts, split-flap, …).
 * Pure functions with no DOM access, so they are easy to test. Original implementations; see docs/studio-17-13.md.
 */
/** Clamp `n` to [min, max]; a non-finite `n` becomes `min`. */
declare const clampTo: (n: number, min: number, max: number) => number;
/**
 * Where a tour card of size `card` goes next to the `target` rectangle inside a `view` of the given size: below the
 * target when it fits, otherwise above, otherwise whichever side has more room. The card is kept `margin` px inside
 * the view horizontally and centred on the target where possible.
 */
declare function tourPlace(target: {
    top: number;
    left: number;
    width: number;
    height: number;
}, card: {
    width: number;
    height: number;
}, view: {
    width: number;
    height: number;
}, gap?: number, margin?: number): {
    top: number;
    left: number;
    side: 'below' | 'above';
};
/** The wheel row under the centre line for a scroll offset: rounded, clamped to the `n` rows. */
declare function wheelIndex(scrollTop: number, rowHeight: number, n: number): number;
/** How far a wheel row leans back, in degrees, when it is `offset` rows from the centre (±80° at most). */
declare const wheelTilt: (offset: number) => number;
/**
 * The mention being typed just before `caret`: the `trigger` character at the start of the text or after a space,
 * followed by up to 30 non-space characters. Returns its start index and the query, or `null`.
 */
declare function mentionQuery(text: string, caret: number, trigger?: string): {
    start: number;
    query: string;
} | null;
/** Names that start with the query first, then names that contain it; case-insensitive; at most `max`. */
declare function matchNames(names: readonly string[], query: string, max?: number): string[];
type DiffLine = {
    type: 'same' | 'add' | 'del';
    text: string;
    a?: number;
    b?: number;
};
/**
 * A line diff of `before` → `after` from their longest common subsequence. Removed lines come before the lines that
 * replace them. `a` / `b` are 1-based line numbers in the old / new text. Inputs over 2000 lines each are cut there.
 */
declare function diffLines(before: string, after: string): DiffLine[];
/** The part of `a` and `b` that differs, as [start, endA, endB] after the shared prefix and suffix. */
declare function changedSpan(a: string, b: string): [number, number, number];
/** Round tick values covering [min, max], about `count` of them (1, 2, 2.5 or 5 × a power of ten apart). */
declare function niceTicks(min: number, max: number, count?: number): number[];
/**
 * An SVG path through `values` spread over `width` × `height` (y up), scaled to [min, max]. With `smooth` the line is a
 * monotone cubic curve (no overshoot between points); otherwise straight segments. Non-finite values are skipped.
 */
declare function linePath(values: readonly number[], width: number, height: number, min: number, max: number, smooth?: boolean): string;
/** Each funnel stage's width as a share of the first, and its conversion from the previous stage and from the first. */
declare function funnelRows(values: readonly number[]): {
    share: number;
    step: number;
    overall: number;
}[];
/**
 * Squarified treemap: rectangles for `values` (largest first is best) filling `width` × `height`, in input order.
 * Zero or negative values get an empty rectangle.
 */
declare function squarify(values: readonly number[], width: number, height: number): {
    x: number;
    y: number;
    w: number;
    h: number;
}[];
/** Whole days since 1970-01-01 for a `YYYY-MM-DD` date (UTC), or NaN. */
declare function dayNumber(text: string): number;
/** A bar's left edge and width as percentages of the [min, max] day range (end day included). */
declare function ganttSpan(start: number, end: number, min: number, max: number): {
    left: number;
    width: number;
};
/**
 * Which category fills each of `cells` waffle cells, by largest remainder so the counts add up exactly.
 * Cells after the categories (when the values sum to less than `total`) get -1.
 */
declare function waffleCells(values: readonly number[], total?: number, cells?: number): number[];
/** How many flaps a split-flap character turns through to get from `from` to `to` in `charset` (always forward). */
declare function flapSteps(from: string, to: string, charset: string): number;
/** A stable shuffle of 0…n-1 for `seed` (Fisher–Yates over a small hash; no Math.random). */
declare function shuffleOrder(n: number, seed?: number): number[];
/** Pointer pull on a letter: 1 at the pointer, falling smoothly to 0 at `radius` px away. */
declare function pressureAt(distance: number, radius: number): number;
/** The angle (degrees, 0 = right, clockwise) from (x, y) toward (px, py). */
declare const angleTo: (x: number, y: number, px: number, py: number) => number;
/** Width of a signature stroke for a pointer speed (px per ms): faster is thinner, within 0.45×–1.6× of `base`. */
declare const strokeWidth: (speed: number, base?: number) => number;

/**
 * A code diff from two child `pre` elements, `data-before` and `data-after`. Lines are compared, then shown unified
 * (one column with − and + lines) or split (old and new side by side); a toggle switches between them. Changed lines
 * cascade in, and inside a pair of changed lines the characters that differ are marked. A header gives the file name
 * and the +added / −removed counts. The table is real text with line numbers that screen readers can step through.
 *
 * Attributes: `mode` (unified, split; unified), `file`, `label` (Diff), `unified-label` (Unified), `split-label` (Split),
 * `added-label` (added), `removed-label` (removed).
 * Event `usa:mode` ({ mode }).
 */
interface UsaDiffViewerElement extends UsaElement {
    readonly lines: DiffLine[];
}
declare function defineDiffViewer(tag?: string): CustomElementConstructor | undefined;

/** Series from a `values` attribute: series separated by `|`, numbers by commas or spaces; at most 6 × 200. */
declare function parseSeries(text: string): number[][];
/**
 * A line chart that draws itself in when it scrolls into view, with a soft area fill under each line and round y-axis
 * ticks. Hover anywhere on the plot (or focus it and use the arrow keys) to move a crosshair from point to point; a
 * tooltip lists every series at that point. Legend entries are toggle buttons that hide and show a series. A hidden
 * table carries the same numbers for screen readers.
 *
 * Attributes: `values` ("1,4,3 | 2,2,5"), `labels` (x labels, comma-separated), `series` (series names), `colors`,
 * `label` (Chart), `unit`, `smooth` (on unless "false"), `area` (on unless "false"), `height` (px; 220).
 * Events `usa:point` ({ index }), `usa:toggle` ({ series, visible }).
 */
interface UsaLineChartElement extends UsaElement {
    data: number[][];
}
declare function defineLineChart(tag?: string): CustomElementConstructor | undefined;

/**
 * A conversion funnel. Each stage is a centred bar as wide as its share of the first stage; the bars grow out from the
 * middle one after another when the funnel scrolls into view, the numbers count up, and between stages a small badge
 * shows how many made it to the next step. Every stage is a button that reports a pick, and the whole funnel is an
 * ordered list, so it reads in order as text.
 *
 * Attributes: `values` (comma-separated), `labels` (comma-separated), `colors`, `label` (Funnel), `unit`,
 * `conversion-label` ("{p} continue").
 * Event `usa:select` ({ index, value, step, overall }).
 */
interface UsaFunnelChartElement extends UsaElement {
}
declare function defineFunnelChart(tag?: string): CustomElementConstructor | undefined;

/**
 * A squarified treemap: each value becomes a tile whose area matches its share, laid out to keep tiles close to
 * square. Tiles scale in from their own centres, biggest first, when the map scrolls into view, and label themselves
 * when there is room. Every tile is a button in one tab stop (arrow keys move between them in reading order) with its
 * name, value and share, and a pick is reported.
 *
 * Attributes: `values`, `labels`, `colors`, `label` (Treemap), `unit`, `ratio` (width / height; 1.8).
 * Event `usa:select` ({ index, value, share }).
 */
interface UsaTreemapElement extends UsaElement {
}
declare function defineTreemap(tag?: string): CustomElementConstructor | undefined;

/**
 * A small Gantt timeline from list items: each `li` is a task with `data-start` and `data-end` (YYYY-MM-DD), optional
 * `data-progress` (0–100), `data-color` and `data-after` (the 1-based number of a task it follows, drawn as a link).
 * Bars grow from their start date one after another, a progress fill runs inside them, week lines sit behind, and a
 * "today" marker shows where the schedule stands. Each task row reads its name, dates and progress as text.
 *
 * Attributes: `today` (YYYY-MM-DD; none), `label` (Timeline), `today-label` (Today), `done-label` (done).
 * Event `usa:select` ({ index }).
 */
interface UsaGanttElement extends UsaElement {
}
declare function defineGantt(tag?: string): CustomElementConstructor | undefined;

/**
 * A waffle chart: a 10 × 10 grid where every square is one percent, coloured by category. The squares pop in along a
 * diagonal wave when the chart scrolls into view. Hovering or focusing a legend entry lifts that category's squares and
 * dims the rest. The legend is a list of buttons with each share in words, so the grid itself is decorative.
 *
 * Attributes: `values`, `labels`, `colors`, `label` (Chart), `total` (what a full grid stands for; 100 or the sum),
 * `shape` (square, round; square).
 * Event `usa:select` ({ index, value, cells }).
 */
interface UsaWaffleChartElement extends UsaElement {
}
declare function defineWaffleChart(tag?: string): CustomElementConstructor | undefined;

/**
 * A split-flap display, like an old departures board. Each character sits on a flap that folds down through the
 * alphabet until it reaches its letter, one column slightly after the other. Set `value` to change the text, or give
 * `words` to cycle through a list. Screen readers get the plain text through a polite live region, once per change.
 * Under reduced motion the letters change without flipping.
 *
 * Attributes: `value` (the child text), `words` (comma-separated; cycles), `interval` (ms between words; 3000),
 * `length` (columns; the longest text), `charset` (letters to flip through; A–Z, 0–9 and :.-/), `speed` (ms per flap; 60).
 * Event `usa:change` ({ value }).
 */
interface UsaSplitFlapElement extends UsaElement {
    value: string;
}
declare function defineSplitFlap(tag?: string): CustomElementConstructor | undefined;

/** The share (0–1) of fully transparent pixels in RGBA `data`, sampling every `step`-th pixel. */
declare function clearedShare(data: ArrayLike<number>, step?: number): number;
/**
 * A scratch-off card. Its content sits under a foil that you rub away with a mouse, pen or finger; sparkles trail the
 * scratch, and once enough is gone the rest of the foil fades and falls away. A Reveal button (shown to keyboard and
 * screen reader users, and to everyone if drawing is not possible) uncovers it in one go. The content is always in the
 * page for assistive technology; the foil is decorative.
 *
 * Attributes: `color` (foil; silver), `label` (Scratch to reveal), `reveal-label` (Reveal), `threshold` (share that
 * finishes it; 0.5), `brush` (px; 22).
 * Event `usa:reveal` ({ by }) — "scratch" or "button".
 */
interface UsaScratchCardElement extends UsaElement {
    readonly revealed: boolean;
    reveal(): void;
}
declare function defineScratchCard(tag?: string): CustomElementConstructor | undefined;

/** How far (degrees, 0 to -180) a page has turned when dragged `dx` px across a page `width` px wide. */
declare const turnAngle: (dx: number, width: number) => number;
/**
 * A book whose pages turn in 3D. Each child is one page (a `section`, `figure` or any element). Pages turn around the
 * spine with a shadow that deepens mid-turn; drag a page edge to turn it by hand (let go past halfway and it finishes,
 * otherwise it falls back), or use the Previous / Next buttons, the arrow keys on the book, or a swipe. Only the open
 * page is exposed to assistive technology, and a polite status says which page it is. Reduced motion swaps pages
 * without turning them.
 *
 * Attributes: `index` (0-based; 0), `label` (Book), `prev-label` (Previous page), `next-label` (Next page),
 * `page-label` ("Page {n} of {total}").
 * Event `usa:change` ({ index }).
 */
interface UsaPageFlipElement extends UsaElement {
    index: number;
    next(): void;
    prev(): void;
}
declare function definePageFlip(tag?: string): CustomElementConstructor | undefined;

/** An SVG path for a full circle of radius `r` centred at (cx, cy), starting at the top and going clockwise. */
declare function circlePath(r: number, cx?: number, cy?: number): string;
/**
 * Text set around a circle that turns slowly, like a badge or a "scroll down" seal. The text comes from `text` (it is
 * repeated with a separator to fill the ring); the children sit in the middle, so a link or icon can live there.
 * Hovering slows it down, speeds it up or reverses it (`hover`). It stops off screen and under reduced motion. The ring
 * is decorative; the text is also given once as plain text for screen readers.
 *
 * Attributes: `text`, `separator` (" • "), `duration` (seconds per turn; 16), `direction` (cw, ccw; cw), `hover` (slow,
 * fast, reverse, pause, none; slow), `size` (px; 140), `color`.
 */
interface UsaCircularTextElement extends UsaElement {
}
declare function defineCircularText(tag?: string): CustomElementConstructor | undefined;

/**
 * Two faces that swap through a grid of pixels. The first child is the front, the second the back. On hover, focus
 * inside or a tap, square pixels blink in at random until they cover the card, the faces swap underneath, and the
 * pixels blink out again. Under reduced motion the faces cross-fade. The hidden face is `inert` and hidden from
 * assistive technology, so only what is shown can be read or reached.
 *
 * Attributes: `grid` (pixels per row, 4–30; 12), `color` (pixel colour; the accent), `duration` (ms for each half;
 * 320), `trigger` (hover, click; hover), `flipped`.
 * Event `usa:change` ({ flipped }).
 */
interface UsaPixelTransitionElement extends UsaElement {
    flipped: boolean;
    toggle(force?: boolean): void;
}
declare function definePixelTransition(tag?: string): CustomElementConstructor | undefined;

/**
 * A field of short lines that turn to point at the pointer, like iron filings around a magnet; lines near the pointer
 * also grow a little. Without a pointer (or on touch after the finger lifts) they settle back to a resting angle.
 * The children sit on top. One frame is drawn per pointer move at most, and nothing moves under reduced motion.
 *
 * Attributes: `rows` (3–30; 9), `columns` (3–40; 12), `color` (the ink, faded), `angle` (resting angle in degrees; -30),
 * `length` (line length in px; 18).
 */
interface UsaMagnetLinesElement extends UsaElement {
}
declare function defineMagnetLines(tag?: string): CustomElementConstructor | undefined;

/**
 * A headline whose letters swell as the pointer comes near: each letter gets heavier, taller and wider by how close
 * the pointer is, so a soft bulge follows it along the word. With a variable font the weight axis is used; otherwise
 * the letters scale. Away from the pointer they ease back. Screen readers get the text once, unsplit; nothing moves
 * under reduced motion.
 *
 * Attributes: `radius` (reach in px; 160), `min-weight` (300), `max-weight` (900), `stretch` (extra height at the
 * pointer, 0–1; 0.35).
 */
interface UsaTextPressureElement extends UsaElement {
}
declare function defineTextPressure(tag?: string): CustomElementConstructor | undefined;

/**
 * A grid of tiles (logos, avatars, photos) that every few seconds trade places, gliding to their new spots. The
 * shuffle only changes where tiles are drawn (CSS order), never the document order, so keyboard and screen reader
 * order stay as written. It pauses while hovered, focused or off screen, and not at all under reduced motion; a
 * pause button lets anyone stop it.
 *
 * Attributes: `interval` (ms; 2800), `columns` (2–10; 4), `gap` (px; 10), `pause-label` (Pause), `play-label` (Play).
 * Event `usa:shuffle` ({ order }).
 */
interface UsaShuffleGridElement extends UsaElement {
    shuffle(): void;
}
declare function defineShuffleGrid(tag?: string): CustomElementConstructor | undefined;

/** The motions an icon can play (17.14). */
declare const ICON_MOTIONS: readonly ["spin", "pulse", "beat", "bounce", "wiggle", "shake", "ring", "float", "flip", "draw", "pop", "blink"];
type IconMotion = (typeof ICON_MOTIONS)[number];
/** When a motion plays: always, on hover or focus of the nearest control, on click, or once when scrolled into view. */
declare const ICON_TRIGGERS: readonly ["loop", "hover", "click", "view"];
type IconTrigger = (typeof ICON_TRIGGERS)[number];
/** An icon's `<svg>` element, built with DOM calls (no markup parsing). Unknown names give an empty svg. */
declare function iconElement(name: string): SVGSVGElement;
/**
 * One icon from the built-in set of 753 line icons (`ICONS`, see docs/icons-17-14.md), drawn with `currentColor` so it
 * takes the colour of the text around it. It can play one of twelve small motions: `spin`, `pulse`, `beat`, `bounce`,
 * `wiggle`, `shake`, `ring`, `float`, `flip`, `draw` (the lines trace themselves), `pop` and `blink`, either on a loop,
 * on hover or focus of the nearest button or link (or the icon itself), on click, or once when it scrolls into view.
 * Without a `label` the icon is decorative and hidden from screen readers; with one it is an image with that name.
 * Nothing moves under reduced motion.
 *
 * Attributes: `name`, `size` (px; 24), `stroke` (line width, 0.5–4; 2), `color`, `label`, `motion`, `trigger` (loop,
 * hover, click, view; hover), `duration` (ms of one run; depends on the motion).
 * Event `usa:play` ({ name, motion }) when a motion starts by hover, click or view.
 */
interface UsaIconElement extends UsaElement {
    /** Play the icon's motion once now (no-op without a motion or under reduced motion). */
    play(): void;
}
declare function defineIcon(tag?: string): CustomElementConstructor | undefined;

/** What a pick copies to the clipboard with `copy`: the name, an `<mo-icon>` tag, or the svg markup. */
declare function iconCopyText(name: string, kind: string): string;
/**
 * Index of the next cell when moving through a grid of `count` cells laid out `columns` wide: arrows move by one cell
 * or one row, Home and End jump to the ends; the index stays inside the grid.
 */
declare function gridStep(index: number, key: string, count: number, columns: number): number;
/**
 * A searchable picker for the built-in icon set: a search field, category chips and a grid of icon buttons, with a
 * live count. Arrow keys walk the grid, Home and End jump to its ends, Enter or a click picks. The picked icon pops,
 * can be copied to the clipboard as a name, an `<mo-icon>` tag or svg markup, and is sent with a form through a hidden
 * input when the picker has a `name`. Typing matches words in icon names and category names (English or Chinese).
 *
 * Attributes: `value` (the starting pick), `name` (form field), `copy` (name, tag, svg; off), `categories` (comma list
 * of category ids to offer; all), `category-labels` (comma list of chip labels in category order), `size` (icon px;
 * 24), `height` (grid px; 360), `compact` (hide the names under icons), `label` (Icons), `search-label` (Search icons),
 * `placeholder` (Search icons…), `all-label` (All), `empty` (No icons match.), `count-label` ({n} icons).
 * Event `usa:pick` ({ name, category, copied }).
 */
interface UsaIconPickerElement extends UsaElement {
    /** The picked icon's name, or ''. */
    readonly value: string;
    /** Show the icons matching a search (as if typed in the field). */
    search(query: string): void;
}
declare function defineIconPicker(tag?: string): CustomElementConstructor | undefined;

/**
 * A round button that fans its own children out on a circle around it. The children (buttons or links) are moved into
 * the menu and put back when the element is removed. The toggle says whether the menu is open (`aria-expanded`); the
 * arrow keys move round the items, Home and End jump to the ends, Escape closes the menu and focus goes back to the
 * toggle. Picking an item closes the menu, then fires `usa:select`.
 *
 * Attributes: `open`, `label` (Menu), `radius` (px; 84), `start` (degrees, 0 = east, -90 = north; -90),
 * `spread` (degrees; 360), `icon` (the toggle's text; ＋).
 * Events `usa:toggle` ({ open }), `usa:select` ({ index, label }).
 */
interface UsaRadialMenuElement extends UsaElement {
    readonly open: boolean;
    toggle(force?: boolean): void;
}
declare function defineRadialMenu(tag?: string): CustomElementConstructor | undefined;

/**
 * A preview card that opens when the pointer rests on a trigger or the trigger takes keyboard focus, and closes a
 * moment after both leave, so the pointer can move onto the card (to follow a link in it) without it vanishing. The
 * child with `data-trigger` is the trigger and the child with `data-card` the card; the card describes the trigger
 * (`aria-describedby`) and Escape closes it. Nothing opens on touch alone, so the trigger's own link still works.
 *
 * Attributes: `open-delay` (ms; 300), `close-delay` (ms; 200), `placement` (bottom | top | start | end; bottom),
 * `open`.
 * Event `usa:toggle` ({ open }).
 */
interface UsaHoverCardElement extends UsaElement {
    readonly open: boolean;
    show(): void;
    hide(): void;
}
declare function defineHoverCard(tag?: string): CustomElementConstructor | undefined;

/**
 * A row of toggle buttons, one pressed at a time or, with `multiple`, any number. Each button says whether it is
 * pressed (`aria-pressed`); the arrow keys move between them and Space or Enter presses. With `required` the last
 * pressed button cannot be let go, so there is always a value. With `name` the value goes into a hidden input for
 * forms (several values joined by commas).
 *
 * Attributes: `options` (comma-separated labels), `values` (comma-separated values; the labels by default),
 * `value` (comma-separated), `multiple`, `required`, `name`, `label` (Options), `size` (sm | md | lg; md).
 * Event `usa:change` ({ value, index }) — `value` is an array of the pressed values; `index` the button just pressed.
 */
interface UsaToggleGroupElement extends UsaElement {
    readonly value: string[];
}
declare function defineToggleGroup(tag?: string): CustomElementConstructor | undefined;

/**
 * A compact time field: an hour and a minute spin button with small up / down buttons, plus an AM / PM switch when
 * `hour12` is set. The arrow keys step (minutes by `step`, snapping to it), Page Up / Down step an hour, Home / End go
 * to the ends, and typing digits sets a part directly. The value is always 24-hour "HH:MM"; with `name` it goes into a
 * hidden input for forms.
 *
 * Attributes: `value` ("HH:MM"; 09:00), `step` (minutes; 5), `hour12`, `name`, `label` (Time), `hour-label` (Hours),
 * `minute-label` (Minutes), `am-label` (AM), `pm-label` (PM).
 * Event `usa:change` ({ value }).
 */
interface UsaTimePickerElement extends UsaElement {
    readonly value: string;
}
declare function defineTimePicker(tag?: string): CustomElementConstructor | undefined;

/**
 * A row of colour swatches to pick one from, like a product's colour choice. It is a radio group: the arrow keys move
 * and pick, the picked swatch shows a check in black or white (whichever reads better on it) and its name next to the
 * row. With `name` the picked colour goes into a hidden input for forms.
 *
 * Attributes: `colors` (comma-separated CSS colours), `names` (comma-separated), `value` (a colour from the list; the
 * first by default), `name`, `label` (Colour), `shape` (circle | square; circle), `size` (px; 32).
 * Event `usa:change` ({ value, index, name }).
 */
interface UsaColorSwatchesElement extends UsaElement {
    readonly value: string;
}
declare function defineColorSwatches(tag?: string): CustomElementConstructor | undefined;

/**
 * A strip of days to pick a date from, the kind booking and diary apps put above a list: a week (or `days` days) of
 * weekday and date buttons, with back and forward buttons that move a whole strip. Today is marked, days in `marks`
 * get a dot, and days outside `min` / `max` cannot be picked. The arrow keys move a day (paging when they run off the
 * end) and Home / End jump to the ends of the strip. Dates are "YYYY-MM-DD"; weekday names come from `locale`.
 *
 * Attributes: `value`, `start` (the first day shown; otherwise the week holding `value` or today), `days` (3–14; 7),
 * `week-start` (0 Sunday … 6 Saturday; 1), `marks` (comma-separated dates), `min`, `max`, `locale`, `label` (Dates),
 * `prev-label` (Earlier), `next-label` (Later), `name`.
 * Events `usa:change` ({ value }), `usa:page` ({ start }).
 */
interface UsaCalendarStripElement extends UsaElement {
    readonly value: string;
    readonly start: string;
}
declare function defineCalendarStrip(tag?: string): CustomElementConstructor | undefined;

/**
 * Turns a plain HTML comparison table (plans, products, versions) into an easier one to read. Cells that say yes or no
 * ("yes", "✓", "是" … / "no", "—", "否" …) get a green check or a grey cross, the words staying for screen readers; one
 * column can be highlighted with a badge such as "Popular"; the first column sticks while the table scrolls sideways;
 * and an "Only differences" switch hides the rows where every column says the same. The table itself is the content
 * and is put back unchanged when the element is removed.
 *
 * Attributes: `highlight` (the column to highlight, counting the compared columns from 1), `badge-label` (Popular),
 * `diff-label` (Only differences), `differences` (start with only the differences shown), `label`.
 * Event `usa:filter` ({ differences, hidden }).
 */
interface UsaComparisonTableElement extends UsaElement {
    readonly differences: boolean;
}
declare function defineComparisonTable(tag?: string): CustomElementConstructor | undefined;

/**
 * Progress rings for a handful of measures at once, one inside the other, each sweeping three quarters of a circle in
 * proportion to its value out of `max`, like an activity tracker. The arcs draw in when the chart scrolls into view.
 * Beside the rings a legend lists each measure with its value; every legend row is a button that picks that ring and
 * dims the others. The chart is labelled and the legend reads as text.
 *
 * Attributes: `values` (comma-separated), `max` (100, or a comma-separated max per ring), `labels`, `colors`, `unit`,
 * `label` (Progress), `size` (px; 220).
 * Event `usa:select` ({ index, value, max }).
 */
interface UsaRadialBarsElement extends UsaElement {
}
declare function defineRadialBars(tag?: string): CustomElementConstructor | undefined;

/**
 * A bar chart race: the same names ranked frame after frame (years, months, rounds), the bars gliding past each other
 * as the order changes, with the frame's name large in the corner. It plays by itself once it scrolls into view (not
 * when reduced motion is asked for), and a play / pause button and a slider let you scrub through the frames. The
 * moving bars are hidden from screen readers; the current frame is written out in order as text instead.
 *
 * Attributes: `labels` (comma-separated names), `frames` (frame names separated by `|`), `values` (one comma-separated
 * list per frame, frames separated by `;`), `colors`, `top` (bars shown; 8), `interval` (ms per frame; 1600),
 * `unit`, `label` (Ranking), `play-label` (Play), `pause-label` (Pause), `frame-label` (Frame).
 * Event `usa:frame` ({ index, name, leader }).
 */
interface UsaBarRaceElement extends UsaElement {
    readonly frame: number;
    go(index: number): void;
}
declare function defineBarRace(tag?: string): CustomElementConstructor | undefined;

/**
 * Bullet charts: one compact row per measure with its actual value as a dark bar, its target as a short upright line,
 * and qualitative bands (poor, fair, good) behind them, the way dashboards show results against goals. A row whose
 * value meets its target gets a check. The bars grow in when the chart scrolls into view; every row is a button that
 * reports a pick, and its label reads value, target and whether it was met.
 *
 * Attributes: `values`, `targets`, `labels` (all comma-separated), `ranges` (band edges as fractions of `max` or plain
 * numbers; 0.5,0.8,1), `max` (the largest value or target by default), `colors` (bar colours), `unit`,
 * `label` (Results), `target-label` ("target {t}"), `met-label` (met), `missed-label` (below target).
 * Event `usa:select` ({ index, value, target, met }).
 */
interface UsaBulletChartElement extends UsaElement {
}
declare function defineBulletChart(tag?: string): CustomElementConstructor | undefined;

/**
 * A slope chart: each item is a line from its value at one point (before) to its value at another (after), so rises,
 * falls and changes of order stand out at a glance. Lines that rise are green, lines that fall red, flat ones grey;
 * the end labels are nudged apart so they never overlap. Below the chart each item is a button with its change in
 * percent; picking one (or hovering its line) brings it forward and fades the rest.
 *
 * Attributes: `before`, `after`, `labels` (all comma-separated), `from-label` (Before), `to-label` (After), `unit`,
 * `label` (Change).
 * Event `usa:select` ({ index, before, after, change }) — `change` as a fraction of `before` (0.25 = +25%).
 */
interface UsaSlopeChartElement extends UsaElement {
}
declare function defineSlopeChart(tag?: string): CustomElementConstructor | undefined;

/**
 * A dot plot: one row per item with its value as a dot on a shared scale, and with `compare` a second dot joined to
 * the first by a bar, a "dumbbell" that shows the gap between two series (last year and this year, plan and actual).
 * The dots slide in from the left edge when the chart scrolls into view; a legend names the two series, grid lines
 * mark round numbers, and every row is a button that reports a pick and reads out both values.
 *
 * Attributes: `values`, `compare`, `labels` (all comma-separated), `series` (two comma-separated names),
 * `min` / `max` (scale ends; from the data by default), `unit`, `label` (Comparison).
 * Event `usa:select` ({ index, value, compare }) — `compare` is null without the `compare` attribute.
 */
interface UsaDotPlotElement extends UsaElement {
}
declare function defineDotPlot(tag?: string): CustomElementConstructor | undefined;

type MicroFeedback = 'shake' | 'nod' | 'pop' | 'wiggle' | 'jelly' | 'nudge' | 'bump' | 'attention';

/**
 * `<mo-micro>` gives whatever it wraps spring micro-interactions from the 17.16 engine: press, hover, lift, magnetic,
 * tilt, glow, squish, drag and focus, in any mix, all adding up in one transform. Feedback impulses (`shake`, `nod`,
 * `pop`, `wiggle`, `jelly`, `nudge`, `bump`, `attention`) play through `feedback(kind)` or the `feedback` attribute.
 *
 * Attributes: `fx` (behaviours, space separated; press hover), `feel` (crisp | snappy | smooth | bouncy | playful |
 * calm | heavy), `spring` (one spring for everything: a preset name or "380ms 0.3"), `haptics`, `disabled`,
 * `press-scale` (0.96), `hover-scale` (1.03), `lift` (4), `strength` (magnet pull 0–1; 0.35), `reach` (14),
 * `tilt` (8), `bounds` (parent | none), `snap` (drag grid px), `axis` (x | y | both), `feedback` (plays when set).
 * Events: `usa:press`, `usa:release`, `usa:drag-end` ({ x, y }).
 */
interface UsaMicroElement extends UsaElement {
    feedback(kind: MicroFeedback | string): void;
    readonly position: {
        x: number;
        y: number;
    };
    moveTo(x: number, y: number, instant?: boolean): void;
}
declare function defineMicro(tag?: string): CustomElementConstructor | undefined;

/**
 * A switch on real springs. The knob carries its speed (it stretches as it travels and squashes into the end), can be
 * dragged with rubber-band ends and flicked, and widens while held. Space, Enter or a click toggles it.
 *
 * Attributes: `checked`, `disabled`, `label` (visible text; also its name), `name` + `value` (form value when on;
 * "on"), `size` (sm | md | lg; md), `feel`, `haptics`. Event `usa:change` ({ checked }).
 */
interface UsaMicroSwitchElement extends UsaElement {
    checked: boolean;
    toggle(force?: boolean): void;
}
declare function defineMicroSwitch(tag?: string): CustomElementConstructor | undefined;

/**
 * A checkbox whose box squashes under the finger, fills with a springy pop and then draws its tick; unchecking
 * rubs the tick out first. `indeterminate` shows a bar (`aria-checked="mixed"`) until it is clicked.
 *
 * Attributes: `checked`, `indeterminate`, `disabled`, `label` (visible text), `name` + `value` (form value; "on"),
 * `feel`, `haptics`. Event `usa:change` ({ checked }).
 */
interface UsaMicroCheckboxElement extends UsaElement {
    checked: boolean;
    indeterminate: boolean;
}
declare function defineMicroCheckbox(tag?: string): CustomElementConstructor | undefined;

/**
 * A text field with spring feedback: the label floats up on a spring, the focus line grows out from where it was
 * clicked, the field shakes once when it turns out invalid (the message is announced), a tick pops in when it is
 * valid with `success`, and the character count bumps as it nears `maxlength`.
 *
 * Attributes: `label` (required for a name), `type` (text | email | password | url | tel | search | number),
 * `value`, `name`, `required`, `pattern`, `minlength`, `maxlength`, `autocomplete`, `hint`, `error` (message used
 * when invalid; else the browser's), `success` (tick when valid), `disabled`, `feel`, `haptics`.
 * Events: `usa:input` ({ value }), `usa:invalid` ({ message }), `usa:valid` ({ value }). Method `validate()`.
 */
interface UsaMicroInputElement extends UsaElement {
    value: string;
    validate(): boolean;
}
declare function defineMicroInput(tag?: string): CustomElementConstructor | undefined;

type MicroButtonState = 'idle' | 'loading' | 'success' | 'error';
/**
 * An action button that shows the whole life of an action with springs: it dips when pressed, folds into a round
 * spinner while the work runs, pops a tick on success or shakes with a cross on failure, then springs back to its
 * label. Each state is announced. Give it the work with `run(task)` (a promise or a function returning one) — for
 * instance from the `usa:action` event — or drive it with the `state` attribute.
 *
 * Attributes: `label`, `loading-label` (announced; Working…), `success-label` (Done), `error-label` (Try again),
 * `state` (idle | loading | success | error), `reset` (ms before going back to idle; 1800; 0 stays), `variant`
 * (solid | soft | ghost), `fx` (micro behaviours of the button; press hover focus), `disabled`, `feel`, `haptics`.
 * Events: `usa:action` ({ run }) on click while idle, `usa:state` ({ state }).
 */
interface UsaMicroButtonElement extends UsaElement {
    readonly state: MicroButtonState;
    run(task: Promise<unknown> | (() => unknown)): Promise<boolean>;
    setState(state: MicroButtonState): void;
}
declare function defineMicroButton(tag?: string): CustomElementConstructor | undefined;

/**
 * A slider with springs all the way through: the thumb trails the finger by a hair and settles onto the step it was
 * let go near, squashes with its speed, and a value bubble pops up while it moves. Dragging past an end stretches
 * the whole track like rubber, and it wobbles back; pushing past an end with the keys gives the same little bump.
 *
 * Attributes: `min` (0), `max` (100), `step` (1), `value`, `label` (accessible name; Value), `unit` (added to the
 * spoken and shown value), `name`, `disabled`, `feel`, `haptics`.
 * Events: `usa:input` ({ value }) while it moves, `usa:change` ({ value }) when it is let go.
 */
interface UsaMicroSliderElement extends UsaElement {
    value: number;
}
declare function defineMicroSlider(tag?: string): CustomElementConstructor | undefined;

/**
 * A segmented control whose pill slides on two springs: the edge in front moves on a quick spring and the edge
 * behind on a slower one, so the pill stretches toward the new choice and catches up with a soft overshoot. Options
 * dip when pressed. A radio group: arrow keys move and choose, Home / End jump.
 *
 * Attributes: `options` (comma-separated labels), `values` (comma-separated; the labels by default), `value`,
 * `label` (group name; Options), `name`, `disabled`, `feel`, `haptics`. Event `usa:change` ({ value, index }).
 */
interface UsaMicroSegmentedElement extends UsaElement {
    value: string;
}
declare function defineMicroSegmented(tag?: string): CustomElementConstructor | undefined;

/**
 * A number stepper whose digits roll on a spring (up for more, down for less) and whose buttons repeat faster and
 * faster while held. At a limit the number leans against it and springs back instead of changing, so the end is felt
 * rather than only greyed out. The number is a spin button: Up / Down, Page Up / Page Down, Home / End.
 *
 * Attributes: `min` (0), `max` (99), `step` (1), `value`, `label` (Quantity), `name`, `disabled`, `feel`, `haptics`.
 * Event `usa:change` ({ value }).
 */
interface UsaMicroStepperElement extends UsaElement {
    value: number;
}
declare function defineMicroStepper(tag?: string): CustomElementConstructor | undefined;

/**
 * A like toggle with spring physics: the heart squashes on press, pops past full size when it fills, throws a ring
 * and a burst of dots, and the count rolls to its new number (up when liking, down when taking it back). Unliking
 * just deflates. Under reduced motion it switches without the burst.
 *
 * Attributes: `liked`, `count` (number shown beside the heart; leave out to hide it), `compact` (1.2k style),
 * `label` (accessible name; Like), `dots` (burst size; 8), `fx` (micro behaviours; press hover focus), `disabled`,
 * `feel`, `haptics`.
 * Events: `usa:change` ({ liked, count }).
 */
interface UsaSpringLikeElement extends UsaElement {
    liked: boolean;
    readonly count: number;
    toggle(force?: boolean): void;
}
declare function defineSpringLike(tag?: string): CustomElementConstructor | undefined;

/**
 * A star rating whose stars are springs: hovering lifts and previews the stars under the pointer, choosing one pops
 * the stars up to it one after another, and clearing deflates them. Works as a slider with the arrow keys, Home
 * and End; with `half` the pointer picks half stars and the keys move by halves.
 *
 * Attributes: `value` (0 = none), `max` (5), `half`, `label` (accessible name; Rating), `readonly`, `clearable`
 * (choosing the current value again clears it), `show-value` (shows "4 / 5" beside the stars), `size` (px; 30),
 * `disabled`, `feel`, `haptics`.
 * Events: `usa:change` ({ value }).
 */
interface UsaSpringRatingElement extends UsaElement {
    value: number;
}
declare function defineSpringRating(tag?: string): CustomElementConstructor | undefined;

/**
 * A copy-to-clipboard button: the copy icon springs away and a tick pops in when the text is on the clipboard, or
 * the button shakes with a cross when the browser refuses. The outcome is announced and it springs back after a
 * moment. Copies `text`, or the text of the element named by `for` (an id), or of its own `code` preview.
 *
 * Attributes: `text`, `for` (id of an element whose text or value is copied), `label` (Copy), `copied-label`
 * (Copied), `failed-label` (Couldn't copy), `show-text` (shows the text in a code style), `reset` (ms; 1600),
 * `fx` (micro behaviours; press hover focus), `disabled`, `feel`, `haptics`.
 * Events: `usa:copy` ({ ok, text }).
 */
interface UsaSpringCopyElement extends UsaElement {
    copy(): Promise<boolean>;
}
declare function defineSpringCopy(tag?: string): CustomElementConstructor | undefined;

/**
 * A tag field where every chip is a spring: new tags pop in, removed ones shrink away, and a duplicate makes the
 * chip that already has it shake. Enter, comma or a paste with commas adds tags; Backspace in the empty field
 * first marks the last chip and then removes it. Each chip's × button removes it, and every change is announced.
 *
 * Attributes: `value` (comma-separated tags), `label` (accessible name; Tags), `placeholder` (Add a tag…), `max`
 * (most tags), `max-length` (characters per tag; 40), `name` (adds a hidden input with the comma-joined tags),
 * `disabled`, `feel`, `haptics`.
 * Events: `usa:change` ({ tags, added, removed }), `usa:reject` ({ text, reason: 'duplicate' | 'full' }).
 */
interface UsaSpringTagsElement extends UsaElement {
    tags: string[];
    addTag(text: string): string[];
    removeTag(index: number): void;
}
declare function defineSpringTags(tag?: string): CustomElementConstructor | undefined;

/**
 * A one-time-code field of separate boxes on springs: each character pops into its box, focus hops on to the next
 * one, a pasted or autofilled code fills every box in a ripple, Backspace steps back. `reject()` shakes the row and
 * clears it, `accept()` nods and turns it green: call them from `usa:complete` once the code is checked.
 *
 * Attributes: `length` (6), `mode` (numeric | alphanumeric), `group` (boxes per group, with a dash between; 0),
 * `label` (accessible name; Verification code), `value`, `name` (adds a hidden input), `mask` (shows dots),
 * `disabled`, `feel`, `haptics`.
 * Events: `usa:change` ({ value }), `usa:complete` ({ value }).
 */
interface UsaSpringCodeElement extends UsaElement {
    value: string;
    accept(): void;
    reject(): void;
    clear(): void;
}
declare function defineSpringCode(tag?: string): CustomElementConstructor | undefined;

/**
 * A list you reorder by dragging the handles: the picked item lifts and tilts with its speed, the others spring out
 * of its way, and on release it settles into its slot. With the keyboard, Space or Enter on a handle picks the item
 * up, the arrow keys move it (the others make room the same way), Space or Enter drops it and Escape puts it back.
 * Every move is announced.
 *
 * Content: the element's direct children become the items (their text is the item's name), or `items` gives
 * pipe-separated names. Attributes: `items`, `label` (accessible name; Reorder list), `gap` (px; 8), `disabled`,
 * `feel`, `haptics`.
 * Events: `usa:reorder` ({ from, to, order }) — `order` lists the original indexes in their new order.
 */
interface UsaSpringListElement extends UsaElement {
    readonly order: number[];
    move(from: number, to: number): void;
}
declare function defineSpringList(tag?: string): CustomElementConstructor | undefined;

/**
 * A list row that swipes open to reveal actions, on springs: the row follows the finger, stretches like rubber past
 * the actions, and is flung open or shut by the speed of the release. The ⋯ button opens and closes it for the
 * keyboard and screen readers, Escape closes it, and choosing an action closes it again.
 *
 * Content: the element's children are the row's content. Attributes: `actions` (pipe-separated labels, each may end
 * with `:danger`, `:ok` or `:neutral` for its colour; Archive|Delete:danger), `open`, `label` (accessible name of the
 * ⋯ button; More actions), `disabled`, `feel`, `haptics`.
 * Events: `usa:action` ({ index, label }), `usa:toggle` ({ open }).
 */
interface UsaSpringSwipeElement extends UsaElement {
    open: boolean;
}
declare function defineSpringSwipe(tag?: string): CustomElementConstructor | undefined;

interface SpringToastOptions {
    tone?: 'info' | 'success' | 'error' | 'warning';
    /** ms before it leaves by itself; 0 keeps it until dismissed (default from the `duration` attribute). */
    duration?: number;
}
/**
 * A stack of toasts on springs: each new toast drops in with a little overshoot and pushes the others back into a
 * tidy pile, which fans out while the pointer or focus is on it. A toast leaves after its time (paused while the
 * stack is hovered or focused), with its × button, or by being swiped sideways — it follows the finger and is thrown
 * off by the release speed. New toasts are announced politely, errors assertively.
 *
 * Attributes: `position` (top-start | top-center | top-end | bottom-start | bottom-center | bottom-end; bottom-end),
 * `duration` (ms; 4000), `max` (toasts kept; 5), `label` (accessible name of the region; Notifications), `feel`,
 * `haptics`.
 * Events: `usa:show` ({ id, text, tone }), `usa:dismiss` ({ id, reason: 'timeout' | 'close' | 'swipe' | 'overflow' | 'clear' }).
 */
interface UsaSpringToastsElement extends UsaElement {
    show(text: string, options?: SpringToastOptions): number;
    dismiss(id: number): void;
    clear(): void;
}
declare function defineSpringToasts(tag?: string): CustomElementConstructor | undefined;

/**
 * An accordion whose panels open on springs: the height follows a spring (so a fast toggle reverses smoothly from
 * where it is), the content drifts in after it, and the chevron flips with a little overshoot. Headers are real
 * buttons with `aria-expanded`; the arrow keys, Home and End move between them.
 *
 * Content: each direct child is a section; its `data-title` (or first heading) is the header and the rest its
 * panel. Attributes: `open` (indexes of open sections, e.g. "0" or "0, 2"), `multiple` (several may be open),
 * `feel`, `haptics`.
 * Events: `usa:toggle` ({ index, open }).
 */
interface UsaSpringAccordionElement extends UsaElement {
    readonly openIndexes: number[];
    toggle(index: number, force?: boolean): void;
}
declare function defineSpringAccordion(tag?: string): CustomElementConstructor | undefined;

/**
 * A number whose digits roll on springs: each digit column spins up or down to its new digit with a soft overshoot
 * (the ones digit bounciest), and new columns grow in. Screen readers get the plain number. Set `value` (or the
 * property) to roll; it rolls from its old value, and from 0 the first time it scrolls into view with `from-zero`.
 *
 * Attributes: `value` (0), `decimals` (0), `group` (thousands separator, e.g. "," ; none), `prefix`, `suffix`,
 * `from-zero`, `label` (read before the number), `feel`.
 * Events: `usa:change` ({ value }) when the value changes after the first render.
 */
interface UsaSpringCounterElement extends UsaElement {
    value: number;
}
declare function defineSpringCounter(tag?: string): CustomElementConstructor | undefined;

/**
 * One collapsible panel with a damped open: the height follows a spring with a short overshoot, the content drifts
 * in child by child, the chevron flips with a little bounce, and a second click mid-way reverses from where the
 * panel is. The header is a real button with `aria-expanded` and `aria-controls`.
 *
 * Content: the element's children are the panel. Attributes: `label` (header text; Details), `open`, `disabled`,
 * `feel`, `haptics`.
 * Events: `usa:toggle` ({ open }).
 */
interface UsaSpringCollapseElement extends UsaElement {
    open: boolean;
    toggle(force?: boolean): void;
}
declare function defineSpringCollapse(tag?: string): CustomElementConstructor | undefined;

/**
 * Long text clamped to a few lines that unfolds on a damped spring: the height eases open with a short settle, the
 * fade at the bottom melts away as it goes, and "Show less" folds it back from wherever it is. When the text fits in
 * the clamp, no button is shown. The toggle is a real button with `aria-expanded`; the full text stays in the DOM
 * for screen readers and find-in-page.
 *
 * Content: the element's children are the text. Attributes: `lines` (lines shown when closed; 3), `more` (Read more),
 * `less` (Show less), `open`, `feel`.
 * Events: `usa:toggle` ({ open }).
 */
interface UsaReadMoreElement extends UsaElement {
    open: boolean;
    /** Whether the text is longer than the clamp (and so has a button). */
    readonly clamped: boolean;
}
declare function defineReadMore(tag?: string): CustomElementConstructor | undefined;

/**
 * A bottom sheet inside its own frame, with snap points and a damped, physical feel: it rises on a spring with a
 * short settle, follows the finger, stretches like rubber past its top snap, and a release is carried by its speed
 * to the nearest snap, or closes it when flicked down. The backdrop dims with it. The grabber is a button: Enter
 * steps through the snaps, the arrow keys move up and down, Escape closes and focus returns to the trigger.
 *
 * Content: children with `data-sheet` go in the sheet; the rest stay on the page behind it, under a trigger button.
 * Attributes: `snaps` (fractions or percentages of the frame's height; 0.5, 0.92), `open` (present to open; a number
 * opens that snap), `label` (the sheet's accessible name; Sheet), `trigger` (the trigger's text; Open sheet),
 * `feel`, `haptics`.
 * Events: `usa:snap` ({ index }, -1 when closed).
 */
interface UsaSpringSheetElement extends UsaElement {
    /** The snap the sheet rests at, -1 when closed. */
    readonly snap: number;
    show(index?: number): void;
    close(): void;
}
declare function defineSpringSheet(tag?: string): CustomElementConstructor | undefined;

/**
 * Pages that slide sideways with a damped, physical feel: the track follows the finger, resists like rubber past the
 * first and last page, and a release is carried by its speed to the next page (one page per flick, as on a phone)
 * with a short settle. The dots stretch toward the page they are heading for. Previous / next buttons and the dots are
 * real buttons; the arrow keys, Home and End move between pages, and pages out of view are inert.
 *
 * Content: each direct child is a page. Attributes: `index` (the page shown; 0), `label` (the region's accessible
 * name; Pages), `feel`, `haptics`.
 * Events: `usa:change` ({ index }).
 */
interface UsaSpringPagerElement extends UsaElement {
    index: number;
    readonly count: number;
    next(): void;
    prev(): void;
}
declare function defineSpringPager(tag?: string): CustomElementConstructor | undefined;

/**
 * A scroll area whose ends stretch like rubber: scrolling or dragging past the top or bottom pulls the content a
 * little further with growing resistance, and it springs back with a damped settle when let go, on every platform
 * (iOS already does this natively, so there it is left to the system). Scrolling itself stays native: the wheel,
 * touch, the keyboard and scroll anchoring all work as usual, and the area is a focusable, labelled region.
 *
 * Content: the element's children scroll. Attributes: `height` (CSS length of the area; 320px), `label` (accessible
 * name; Scrollable content), `feel`, `haptics`.
 * Events: `usa:edge` ({ edge: 'top' | 'bottom' }) when a pull past an end goes further than 56 px.
 */
interface UsaElasticScrollElement extends UsaElement {
    /** The scrolling box, for scrollTo() and scroll events. */
    readonly scroller: HTMLElement | null;
}
declare function defineElasticScroll(tag?: string): CustomElementConstructor | undefined;

/**
 * A pile of cards (notifications, updates) that fans open into a list on damped springs: each card slides to its
 * place on its own, slightly later spring, so the list unrolls with a soft cascade and settles; closing gathers
 * them back behind the first. Collapsed, only the first card is reachable; the toggle is a real button with
 * `aria-expanded`, and clicking the pile opens it too.
 *
 * Content: each direct child is a card. Attributes: `open`, `more` (the toggle's text while closed; Show all),
 * `less` (Show less), `peek` (px each hidden card shows below the one above; 10), `gap` (px between open cards; 10),
 * `feel`, `haptics`.
 * Events: `usa:toggle` ({ open }).
 */
interface UsaSpringStackElement extends UsaElement {
    open: boolean;
}
declare function defineSpringStack(tag?: string): CustomElementConstructor | undefined;

/** The four corners a floating window can dock to. */
type PipCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
declare const PIP_CORNERS: readonly PipCorner[];
/** A corner name from text such as "top left", "tl" or "bottom-right" (default bottom-right). */
declare function parseCorner(text: string | null | undefined): PipCorner;
/** Top-left position (px) of a `w` × `h` window docked to `corner` of a `fw` × `fh` frame, `inset` px from its edges. */
declare function cornerPoint(corner: PipCorner, w: number, h: number, fw: number, fh: number, inset?: number): {
    x: number;
    y: number;
};
/**
 * The corner a released window flies to: the one nearest to where its momentum would carry its centre. `x`, `y` are
 * its top-left position, `vx`, `vy` its speed in px/s.
 */
declare function pipCorner(x: number, y: number, vx: number, vy: number, w: number, h: number, fw: number, fh: number): PipCorner;
/** The corner an arrow key moves to from `corner` (the same corner when the key points off the frame). */
declare function cornerStep(corner: PipCorner, key: string): PipCorner;
/**
 * The shape of an island morphing between its compact and expanded size: `t` = 0 is compact, 1 expanded (a spring
 * may carry it a little past either end). The corner radius stays a pill while the box is short and eases to
 * `radius` as it grows.
 */
declare function islandShape(t: number, compact: {
    w: number;
    h: number;
}, expanded: {
    w: number;
    h: number;
}, radius?: number): {
    width: number;
    height: number;
    radius: number;
};
/** Length and offset (px) of a scrollbar thumb on a `track` px track; at least `min` px long. */
declare function thumbMetrics(scrollTop: number, scrollHeight: number, clientHeight: number, track: number, min?: number): {
    size: number;
    offset: number;
};
/** The scroll position that puts the thumb at `offset` px (the inverse of `thumbMetrics`). */
declare function scrollForThumb(offset: number, size: number, track: number, scrollHeight: number, clientHeight: number): number;
/** The labelled section a scroll position is in: the last one whose top (px, ascending) is at or above it; -1 before the first. */
declare function labelAt(tops: readonly number[], scrollTop: number, lead?: number): number;
/**
 * Whether a slide-to-confirm released at `x` px (of `max`) with speed `v` px/s confirms: when it is past `threshold`
 * of the way, or its momentum would carry it to the end.
 */
declare function slideOutcome(x: number, v: number, max: number, threshold?: number): boolean;
/** A smooth SVG path through points (quadratic curves through the midpoints), as a rope drawn through its links. */
declare function chainPath(points: readonly {
    x: number;
    y: number;
}[]): string;
/** Size of link `i` of `n` in a chain whose head is `head` px: each link a little smaller, down to 35%. */
declare function linkSize(i: number, n: number, head: number): number;
/** `x` folded into `[0, period)`, for a loop that wraps around. */
declare function wrapOffset(x: number, period: number): number;
/**
 * A speed easing toward `target` over a frame of `dt` ms, with time constant `tau` ms: a fling slows down and an
 * idle marquee picks its cruise speed back up on the same damped curve, whatever the frame rate.
 */
declare function cruise(v: number, target: number, dt: number, tau?: number): number;

/**
 * A floating window (picture-in-picture style) inside its own frame. It follows the finger, stretches like rubber
 * past the frame's edges, and a release is carried by its speed to the nearest corner, where it settles on a spring.
 * The window is focusable: the arrow keys send it to the neighbouring corner.
 *
 * Content: the child with `data-pip` is the window; the rest is the page behind it. Attributes: `corner`
 * (top-left, top-right, bottom-left or bottom-right; bottom-right), `inset` (px from the frame's edges; 12),
 * `label` (the window's accessible name; Floating window), `feel`, `haptics`. Size the frame with
 * `--usa-pip-height` and the window with `--usa-pip-width`.
 * Events: `usa:corner` ({ corner }).
 */
interface UsaSpringPipElement extends UsaElement {
    corner: PipCorner;
}
declare function defineSpringPip(tag?: string): CustomElementConstructor | undefined;

/**
 * A pill that morphs into a card and back on one spring: width, height and corner radius move together and overshoot
 * a little, the compact content fades out as the expanded content grows in. A press while it is compact plays a short
 * squash (`pulse()`), as when a notification arrives. The compact face is a real button with `aria-expanded`;
 * Escape, the close button or a press outside collapse it and focus returns to the button.
 *
 * Content: the child with `data-compact` is the compact face, the rest is the expanded card. Attributes: `expanded`
 * (present to open), `label` (the button's accessible name when the compact face has no text), `close` (the close
 * button's name; Collapse), `feel`, `haptics`. Set the expanded width with `--usa-island-width` and the colours with
 * `--usa-island-bg` / `--usa-island-ink`.
 * Events: `usa:toggle` ({ expanded }).
 */
interface UsaSpringIslandElement extends UsaElement {
    expanded: boolean;
    expand(): void;
    collapse(): void;
    toggle(): void;
    /** A short squash, as a notification arriving. */
    pulse(): void;
}
declare function defineSpringIsland(tag?: string): CustomElementConstructor | undefined;

/**
 * Press and hold a card to peek at it: the card sinks a little while the press lasts, then a preview grows out of it
 * on a spring, over a dimmed, blurred page. The preview follows the finger; pull it down (or tap outside, or press
 * Escape) and it shrinks back into the card. A quick tap is left to the page (`usa:tap`). The card is focusable:
 * Enter, Space or the context-menu key open the preview, which is a modal dialog, and focus returns to the card.
 *
 * Content: the child with `data-peek` is the preview; the rest is the card. Attributes: `delay` (ms the press must
 * last; 420), `label` (the preview's accessible name; Preview), `close` (the close button's name; Close), `feel`,
 * `haptics`. Set the preview's width with `--usa-peek-width`.
 * Events: `usa:toggle` ({ open }), `usa:tap` ({}).
 */
interface UsaSpringPeekElement extends UsaElement {
    readonly open: boolean;
    show(): void;
    close(): void;
}
declare function defineSpringPeek(tag?: string): CustomElementConstructor | undefined;

/**
 * A scroll area with its own slim scrollbar on a spring: the thumb trails the scroll a moment and settles, squashes
 * when a wheel or swipe pushes past an end, and fades out when the area is idle. Drag the thumb to scroll fast; a
 * bubble beside it names the section under it (children with `data-label`, or the h2 / h3 headings). A press on the
 * track pages toward it. Scrolling itself stays native, so the wheel, touch, keyboard and find-in-page work as usual;
 * the custom bar is decoration for pointers and is hidden from screen readers.
 *
 * Content: anything; it scrolls. Attributes: `height` (the area's height; 320px), `label` (the region's accessible
 * name; Scrollable content), `feel`.
 * Events: `usa:section` ({ index, label }) when the labelled section at the top changes.
 */
interface UsaSpringScrollbarElement extends UsaElement {
    readonly scroller: HTMLElement | null;
    /** The labelled section at the top, -1 before the first. */
    readonly section: number;
}
declare function defineSpringScrollbar(tag?: string): CustomElementConstructor | undefined;

/**
 * Slide to confirm: a knob in a track that follows the finger, stretches like rubber past the end, and springs back
 * with a wobble when let go too early. Past `threshold` of the way, or flicked hard enough to get there, it rides to
 * the end and confirms. The prompt shimmers until then. The knob is a real button: Enter or Space confirms (the
 * slide is for pointers), and the outcome is announced.
 *
 * Attributes: `label` (the prompt and the button's name; Slide to confirm), `done` (shown once confirmed;
 * Confirmed), `threshold` (0.05–1 of the way; 0.8), `confirmed` (present when confirmed), `disabled`, `feel`,
 * `haptics`. Size it with `--usa-slide-width` and `--usa-slide-h`.
 * Events: `usa:confirm` ({}), `usa:reset` ({}).
 */
interface UsaSlideConfirmElement extends UsaElement {
    readonly confirmed: boolean;
    confirm(): void;
    reset(): void;
}
declare function defineSlideConfirm(tag?: string): CustomElementConstructor | undefined;

/**
 * A chain of links on damped springs that follows the pointer: the head chases it, each link chases the one before,
 * so the tail swings, lags and settles like a rope. A press plucks it. With no pointer over it the head drifts along
 * a slow figure-eight. Decorative: it is one image for screen readers, it pauses off screen, and under reduced motion
 * it rests as a still curve.
 *
 * Attributes: `links` (3–40; 12), `size` (the head's size in px; 18), `label` (the image's accessible name; Spring
 * chain), `feel`. Colour with `--usa-chain-color`, height with `--usa-chain-height`.
 */
interface UsaSpringChainElement extends UsaElement {
    /** Give every link a push, as a press does. */
    pluck(): void;
}
declare function defineSpringChain(tag?: string): CustomElementConstructor | undefined;

/**
 * A marquee you can grab: it drifts at a cruise speed, follows the finger when dragged, keeps a flick's momentum and
 * then eases back to its cruise speed on a damped curve, wrapping around without a seam. It slows to a stop under the
 * pointer and while focus is inside, and a pause button stops it for good. The arrow keys give it a push. Under
 * reduced motion it does not move and becomes a plain horizontal scroller.
 *
 * Content: the items (each direct child). Attributes: `speed` (cruise speed in px/s, negative for the other way;
 * 40), `gap` (px between items; 24), `paused` (present to start paused), `label` (the region's accessible name;
 * Scrolling list), `haptics`.
 * Events: `usa:pause` ({ paused }).
 */
interface UsaFlingMarqueeElement extends UsaElement {
    paused: boolean;
    /** Push the marquee with a speed in px/s (positive moves the items toward the start). */
    fling(velocity: number): void;
}
declare function defineFlingMarquee(tag?: string): CustomElementConstructor | undefined;

/**
 * A pair of squishy − / + keys around a number that rolls as it changes. Hold a key to repeat. Both keys are native
 * buttons; ArrowUp / ArrowDown on either key step too, and the value is announced through a polite live region.
 *
 * Attributes: `value` (0), `min` (0), `max` (10), `step` (1), `label` (Quantity), `disabled`.
 * Events `usa:input` ({ value }) on every step and `usa:change` ({ value }) when a press or hold ends.
 */
interface UsaSquishStepperElement extends UsaElement {
    value: number;
    stepUp(): void;
    stepDown(): void;
}
declare function defineSquishStepper(tag?: string): CustomElementConstructor | undefined;

/**
 * A thumb stick in a soft well: drag the cap and it follows with a rubbery pull past the rim, then springs back to
 * centre when let go. The cap is a native button, so arrow keys push it (Shift halves the push) and releasing the key
 * lets it spring home. Readings are normalised to -1…1 on each axis, with a dead zone around the centre.
 *
 * Attributes: `label` (Joystick), `dead-zone` (0–0.9, 0.12), `disabled`. Read-only properties `x`, `y`.
 * Events `usa:move` ({ x, y }) while it moves and `usa:release` ({ x, y }, the last reading) when let go.
 */
interface UsaAnalogStickElement extends UsaElement {
    readonly x: number;
    readonly y: number;
}
/** Apply a radial dead zone and rescale the rest so the reading still reaches 1 at the rim. */
declare function deadZone(x: number, y: number, zone: number): [number, number];
declare function defineAnalogStick(tag?: string): CustomElementConstructor | undefined;

/**
 * A squishy download / upload key. Pressing it hops the arrow toward the tray and asks the page to start the transfer;
 * the page then reports progress through the `progress` attribute, which fills a ring around the key. At 100 the arrow
 * turns into a tick and `usa:complete` fires once. A native button handles pointer and keyboard; progress is
 * announced through a polite live region.
 *
 * Attributes: `direction` (download | upload, download), `label` (Download / Upload), `progress` (0–100, absent when
 * idle), `disabled`. Events `usa:transfer` ({ direction }) on press and `usa:complete` ({ direction }).
 */
interface UsaTransferButtonElement extends UsaElement {
    progress: number | null;
}
declare function defineTransferButton(tag?: string): CustomElementConstructor | undefined;

/** Separate seven coaxial lens sections with a horizontal drag. The value ranges from 0 to 100. */
interface UsaLensStackElement extends UsaElement {
    value: number;
}
declare function defineLensStack(tag?: string): CustomElementConstructor | undefined;

/** Pivot nine overlapping blades to vary the opening. The value ranges from 0 to 100. */
interface UsaIrisDiaphragmElement extends UsaElement {
    value: number;
}
declare function defineIrisDiaphragm(tag?: string): CustomElementConstructor | undefined;

/** Lift thirteen contour plates to study the relief in perspective. The value ranges from 0 to 100. */
interface UsaContourReliefElement extends UsaElement {
    value: number;
}
declare function defineContourRelief(tag?: string): CustomElementConstructor | undefined;

/** Bounded native number entry with decimal-safe buttons, form submission and reset. */
interface UsaNumberStepperElement extends UsaElement {
    value: number;
    stepUp(amount?: number): void;
    stepDown(amount?: number): void;
    reset(): void;
}
declare function defineNumberStepper(tag?: string): CustomElementConstructor | undefined;

/** Password entry with a reversible reveal button; values are never included in emitted event details. */
interface UsaPasswordElement extends UsaElement {
    value: string;
    revealed: boolean;
    readonly input: HTMLInputElement | null;
    reset(): void;
}
declare function definePassword(tag?: string): CustomElementConstructor | undefined;

/** Two native range controls with a non-crossing interval and named form values. */
interface UsaRangeSliderElement extends UsaElement {
    low: number;
    high: number;
    reset(): void;
}
declare function defineRangeSlider(tag?: string): CustomElementConstructor | undefined;

interface UsaConsentElement extends UsaElement {
    preferences: {
        analytics: boolean;
        marketing: boolean;
    };
    reset(): void;
}
/** Explicit preference controls. Emits a decision; does not read/write cookies or storage, or activate services. */
declare function defineConsent(tag?: string): CustomElementConstructor | undefined;

interface UsaCtaPopupElement extends UsaElement {
    open: boolean;
    show(): void;
    hide(reason?: string): void;
}
/** Explicit native modal dialog. No exit-intent tracking, timers, navigation or subscription requests. */
declare function defineCtaPopup(tag?: string): CustomElementConstructor | undefined;

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
 * don't close). `label`, `persistent`, `effect` and `side` can change at any
 * time, also while the overlay is open (13.0.1: updated in place). Any element with `data-usa-open="<id>"` opens the overlay
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
 * keys move focus (RTL-aware); Home/End jump to the first/last enabled item.
 * `orientation="vertical"` places the drop beside a sidebar. Interrupted
 * transitions continue from the visible drop; layout changes realign it.
 * `usa:change` { index, item }. A labelled `nav`; reduced motion: the drop jumps.
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
type SceneFn = (ctx: CanvasRenderingContext2D, t: number, w: number, h: number, s: any) => void;
/** Built-in programs must be self-contained so their source also runs in a dedicated Worker. */
declare const WORKER_SCENE_FNS: Record<string, SceneFn>;
declare const WORKER_SCENES: Record<string, string>;
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
 * `<usa-install-button package="motionary" managers="npm pnpm yarn bun cdn" cdn="https://cdn.jsdelivr.net/npm/motionary@17/dist/runtime.iife.js">`
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

/** A nested file index. Use native details/summary for folders and links for files. */
declare function defineFileTree(tag?: string): CustomElementConstructor | undefined;

/** A download picker. The author supplies a details element with a summary and download links. */
declare function defineDownloadMenu(tag?: string): CustomElementConstructor | undefined;

/** Film intertitles. Put a heading in each details/summary and use its body for the credits. */
declare function defineTitleSequence(tag?: string): CustomElementConstructor | undefined;

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
 * `motionary/tooling/ai` — a small deterministic parser (English and
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
 * 17.3 — the shared core of `<mo-mega-menu>` and `<mo-nav-flyout>`: a row of top-level items, each either a plain link
 * or an item element holding a trigger `<button>` and a `[data-panel]`. Panels follow the disclosure navigation pattern
 * (`aria-expanded` / `aria-controls` on a real button, no `role="menu"`), open with hover intent, click or keyboard,
 * and sit on one shared surface (`.usa-np-bg`) that morphs between the panels instead of each panel fading on its own.
 */
interface UsaNavPanelsElement extends UsaElement {
    /** Index of the open item (`-1` when every panel is closed). */
    readonly openIndex: number;
    /** Open the item at `index` (a plain link item is ignored); `focus` moves focus to its first focusable control. */
    openItem(index: number, focus?: boolean): void;
    /** Close the open panel; `focusTrigger` returns focus to its trigger. */
    close(focusTrigger?: boolean): void;
}
/**
 * `<mo-mega-menu>` (17.3; legacy name `<usa-mega-menu>`) — a navigation bar whose items open full-width mega panels
 * (columns, a featured card, anything) on one shared surface that morphs its height from panel to panel.
 * Children: plain links, or an item element holding a trigger `<button>` and a `[data-panel]` element:
 * `<div><button>Products</button><div data-panel>…</div></div>`. Hover intent (`delay`, default 120 ms; once a panel
 * is open, moving to another trigger switches at once), click / tap toggles, `close-delay` (default 220 ms) after the
 * pointer leaves. Keyboard: ←/→ / Home / End move between triggers, ↓ opens and focuses the panel, Esc closes and
 * returns focus, Tab out closes. Disclosure pattern (`aria-expanded`, `aria-controls`); the host is a
 * `navigation` landmark named by `label` (default "Main"). Events `usa:open` / `usa:close` (`{ index }`); methods
 * `openItem(i, focus?)`, `close(focusTrigger?)`. Reduced motion: panels switch without the morph.
 */
declare const defineMegaMenu: (tag?: string) => CustomElementConstructor | undefined;
/**
 * `<mo-nav-flyout>` (17.3; legacy name `<usa-nav-flyout>`) — nav links with dropdown flyouts anchored under their
 * trigger. One shared background slides and resizes from flyout to flyout (position, width and height), so moving
 * along the bar feels like one surface. Same markup, keyboard, hover intent and events as `<mo-mega-menu>`:
 * `<div><button>Docs</button><div data-panel>…</div></div>` items or plain links; `label`, `delay`, `close-delay`;
 * `openItem(i, focus?)`, `close(focusTrigger?)`; `usa:open` / `usa:close` (`{ index }`). Flyouts stay inside the bar's
 * width. Reduced motion: the background jumps.
 */
declare const defineNavFlyout: (tag?: string) => CustomElementConstructor | undefined;
type UsaMegaMenuElement = UsaNavPanelsElement;
type UsaNavFlyoutElement = UsaNavPanelsElement;

/**
 * `<mo-fullscreen-menu>` (17.3; legacy name `<usa-fullscreen-menu>`) — a menu button that opens a full-screen overlay:
 * the overlay grows out of the button as a circle (`variant="circle"`, default) or drops as a curtain
 * (`variant="curtain"`), then the big links rise one after another. A link with `data-preview="image.jpg"` shows that
 * picture beside the list while it is hovered or focused. Children: the links (any elements); they move into the
 * overlay's `<nav>`. The overlay is a modal dialog (`role="dialog"`, `aria-modal`, named by `label`, default "Menu"):
 * focus moves to the first link and stays inside, Esc / the button / a link click closes it and focus returns to the
 * button, page scrolling is locked while open. Methods `show()`, `hide()`, `toggle(force?)`, property `open`; events
 * `usa:open` / `usa:close`. Reduced motion: the overlay and links appear without the reveal.
 */
interface UsaFullscreenMenuElement extends UsaElement {
    open: boolean;
    show(): void;
    hide(): void;
    toggle(force?: boolean): void;
}
declare function defineFullscreenMenu(tag?: string): CustomElementConstructor | undefined;

/**
 * `<mo-breadcrumbs>` (17.3; legacy name `<usa-breadcrumbs>`) — a breadcrumb trail that animates as you navigate:
 * crumbs that stay keep their place, new ones slide in, dropped ones slide out (`set(items)`). When the trail is longer
 * than `max` (default 4), the middle collapses into a "…" button that expands the hidden crumbs with a stagger.
 * Children: links, with the current page last (any element; it gets `aria-current="page"`). They move into an `<ol>`
 * inside a `navigation` landmark named by `label` (default "Breadcrumb"); separators are CSS only. Methods
 * `set(items)` (`{ label, href? }[]`; values are written as text and attributes), `expand()`; property `items`;
 * event `usa:expand` (`{ hidden }`). Reduced motion: crumbs change without sliding.
 */
interface BreadcrumbItem {
    label: string;
    href?: string;
}
interface UsaBreadcrumbsElement extends UsaElement {
    readonly items: BreadcrumbItem[];
    set(items: BreadcrumbItem[]): void;
    expand(): void;
}
declare function defineBreadcrumbs(tag?: string): CustomElementConstructor | undefined;

type MatterData = Record<string, string | number | boolean | null>;
interface UsaMatterElement extends UsaElement {
    play(): void;
    pause(): void;
    reset(): void;
    activate(): void;
    deactivate(): void;
    update(data: MatterData): void;
}

/** `<mo-gravity-well>` — an original interactive gravity study (17.6), with keyboard controls and motion-safe cleanup. */
interface UsaGravityWellElement extends UsaMatterElement {
    update(data: MatterData): void;
    reset(): void;
    play(): void;
    pause(): void;
    activate(): void;
    deactivate(): void;
}
declare function defineGravityWell(tag?: string): CustomElementConstructor | undefined;

/** `<mo-liquid-metal>` — an original interactive metal study (17.6), with keyboard controls and motion-safe cleanup. */
interface UsaLiquidMetalElement extends UsaMatterElement {
    update(data: MatterData): void;
    reset(): void;
    play(): void;
    pause(): void;
    activate(): void;
    deactivate(): void;
}
declare function defineLiquidMetal(tag?: string): CustomElementConstructor | undefined;

/** `<mo-reaction-field>` — an original interactive reaction study (17.6), with keyboard controls and motion-safe cleanup. */
interface UsaReactionFieldElement extends UsaMatterElement {
    update(data: MatterData): void;
    reset(): void;
    play(): void;
    pause(): void;
    activate(): void;
    deactivate(): void;
}
declare function defineReactionField(tag?: string): CustomElementConstructor | undefined;

/** `<mo-ink-flow>` — an original interactive ink study (17.6), with keyboard controls and motion-safe cleanup. */
interface UsaInkFlowElement extends UsaMatterElement {
    update(data: MatterData): void;
    reset(): void;
    play(): void;
    pause(): void;
    activate(): void;
    deactivate(): void;
}
declare function defineInkFlow(tag?: string): CustomElementConstructor | undefined;

/** `<mo-fluid-type>` — an original interactive fluid study (17.6), with keyboard controls and motion-safe cleanup. */
interface UsaFluidTypeElement extends UsaMatterElement {
    update(data: MatterData): void;
    reset(): void;
    play(): void;
    pause(): void;
    activate(): void;
    deactivate(): void;
}
declare function defineFluidType(tag?: string): CustomElementConstructor | undefined;

/** `<mo-magnetic-field>` — an original interactive magnetic study (17.6), with keyboard controls and motion-safe cleanup. */
interface UsaMagneticFieldElement extends UsaMatterElement {
    update(data: MatterData): void;
    reset(): void;
    play(): void;
    pause(): void;
    activate(): void;
    deactivate(): void;
}
declare function defineMagneticField(tag?: string): CustomElementConstructor | undefined;

/** `<mo-elastic-mesh>` — an original interactive mesh study (17.6), with keyboard controls and motion-safe cleanup. */
interface UsaElasticMeshElement extends UsaMatterElement {
    update(data: MatterData): void;
    reset(): void;
    play(): void;
    pause(): void;
    activate(): void;
    deactivate(): void;
}
declare function defineElasticMesh(tag?: string): CustomElementConstructor | undefined;

interface UsaMatterToolElement extends UsaElement {
    readonly params: Record<string, number>;
    update(data: MatterData): void;
    play(): void;
    pause(): void;
    reset(): void;
}

/** `<mo-spring-lab>` — an original interactive spring study (17.6), with keyboard controls and motion-safe cleanup. */
interface UsaSpringLabElement extends UsaMatterToolElement {
    update(data: MatterData): void;
    reset(): void;
    play(): void;
    pause(): void;
}
declare function defineSpringLab(tag?: string): CustomElementConstructor | undefined;

/** `<mo-bezier-lab>` — an original interactive bezier study (17.6), with keyboard controls and motion-safe cleanup. */
interface UsaBezierLabElement extends UsaMatterToolElement {
    update(data: MatterData): void;
    reset(): void;
    play(): void;
    pause(): void;
}
declare function defineBezierLab(tag?: string): CustomElementConstructor | undefined;

interface UsaMatterTextElement extends UsaElement {
    reset(): void;
    update(data: MatterData): void;
}

/** `<mo-text-loupe>` — an original interactive loupe study (17.6), with keyboard controls and motion-safe cleanup. */
interface UsaTextLoupeElement extends UsaMatterTextElement {
    update(data: MatterData): void;
    reset(): void;
    focusAt(x: number, y: number): void;
}
declare function defineTextLoupe(tag?: string): CustomElementConstructor | undefined;

/** `<mo-revision-reveal>` — an original interactive revision study (17.6), with keyboard controls and motion-safe cleanup. */
interface UsaRevisionRevealElement extends UsaMatterTextElement {
    update(data: MatterData): void;
    reset(): void;
    value: number;
}
declare function defineRevisionReveal(tag?: string): CustomElementConstructor | undefined;

/** `<mo-hold-action>` — cancellable pointer/keyboard hold. Emits confirmation only; it performs no external action. */
interface UsaHoldActionElement extends UsaElement {
    readonly value: number;
    readonly confirmed: boolean;
    reset(): void;
    cancel(): void;
    update(data: MatterData): void;
}
declare function defineHoldAction(tag?: string): CustomElementConstructor | undefined;

/** `<mo-scrub-number>` — editable number with horizontal precision dragging; vertical touch scrolling remains available. */
interface UsaScrubNumberElement extends UsaElement {
    value: number;
    stepUp(amount?: number): void;
    stepDown(amount?: number): void;
    reset(): void;
    update(data: MatterData): void;
}
declare function defineScrubNumber(tag?: string): CustomElementConstructor | undefined;

type ActivityData = Record<string, string | number | boolean | null>;
interface UsaActivityElement extends UsaElement {
    value: number;
    update(data: ActivityData): void;
    play(): void;
    pause(): void;
    reset(): void;
}

/** `<mo-flight-status>` — compact live-activity flight status. Data is supplied by attributes or update().
 * No network or simulated readings. `animated` enables ornamental motion; `running` explicitly enables supported clocks.
 * Buttons emit usa:action / usa:change; clocks emit usa:tick and usa:complete. All resources stop on disconnect.
 */
interface UsaFlightStatusElement extends UsaActivityElement {
    update(data: ActivityData): void;
    play(): void;
    pause(): void;
    reset(): void;
}
declare function defineFlightStatus(tag?: string): CustomElementConstructor | undefined;

/** `<mo-transit-progress>` — compact live-activity transit progress. Data is supplied by attributes or update().
 * No network or simulated readings. `animated` enables ornamental motion; `running` explicitly enables supported clocks.
 * Buttons emit usa:action / usa:change; clocks emit usa:tick and usa:complete. All resources stop on disconnect.
 */
interface UsaTransitProgressElement extends UsaActivityElement {
    update(data: ActivityData): void;
    play(): void;
    pause(): void;
    reset(): void;
}
declare function defineTransitProgress(tag?: string): CustomElementConstructor | undefined;

/** `<mo-sun-timeline>` — compact live-activity sun timeline. Data is supplied by attributes or update().
 * No network or simulated readings. `animated` enables ornamental motion; `running` explicitly enables supported clocks.
 * Buttons emit usa:action / usa:change; clocks emit usa:tick and usa:complete. All resources stop on disconnect.
 */
interface UsaSunTimelineElement extends UsaActivityElement {
    update(data: ActivityData): void;
    play(): void;
    pause(): void;
    reset(): void;
}
declare function defineSunTimeline(tag?: string): CustomElementConstructor | undefined;

/** `<mo-delivery-tracker>` — compact live-activity delivery tracker. Data is supplied by attributes or update().
 * No network or simulated readings. `animated` enables ornamental motion; `running` explicitly enables supported clocks.
 * Buttons emit usa:action / usa:change; clocks emit usa:tick and usa:complete. All resources stop on disconnect.
 */
interface UsaDeliveryTrackerElement extends UsaActivityElement {
    update(data: ActivityData): void;
    play(): void;
    pause(): void;
    reset(): void;
}
declare function defineDeliveryTracker(tag?: string): CustomElementConstructor | undefined;

/** `<mo-glucose-sparkline>` — compact live-activity glucose sparkline. Data is supplied by attributes or update().
 * No network or simulated readings. `animated` enables ornamental motion; `running` explicitly enables supported clocks.
 * Buttons emit usa:action / usa:change; clocks emit usa:tick and usa:complete. All resources stop on disconnect.
 */
interface UsaGlucoseSparklineElement extends UsaActivityElement {
    update(data: ActivityData): void;
    play(): void;
    pause(): void;
    reset(): void;
}
declare function defineGlucoseSparkline(tag?: string): CustomElementConstructor | undefined;

/** `<mo-coffee-timer>` — compact live-activity coffee timer. Data is supplied by attributes or update().
 * No network or simulated readings. `animated` enables ornamental motion; `running` explicitly enables supported clocks.
 * Buttons emit usa:action / usa:change; clocks emit usa:tick and usa:complete. All resources stop on disconnect.
 */
interface UsaCoffeeTimerElement extends UsaActivityElement {
    update(data: ActivityData): void;
    play(): void;
    pause(): void;
    reset(): void;
}
declare function defineCoffeeTimer(tag?: string): CustomElementConstructor | undefined;

/** `<mo-vital-wave>` — compact live-activity vital wave. Data is supplied by attributes or update().
 * No network or simulated readings. `animated` enables ornamental motion; `running` explicitly enables supported clocks.
 * Buttons emit usa:action / usa:change; clocks emit usa:tick and usa:complete. All resources stop on disconnect.
 */
interface UsaVitalWaveElement extends UsaActivityElement {
    update(data: ActivityData): void;
    play(): void;
    pause(): void;
    reset(): void;
}
declare function defineVitalWave(tag?: string): CustomElementConstructor | undefined;

/** `<mo-orbit-pass>` — compact live-activity orbit pass. Data is supplied by attributes or update().
 * No network or simulated readings. `animated` enables ornamental motion; `running` explicitly enables supported clocks.
 * Buttons emit usa:action / usa:change; clocks emit usa:tick and usa:complete. All resources stop on disconnect.
 */
interface UsaOrbitPassElement extends UsaActivityElement {
    update(data: ActivityData): void;
    play(): void;
    pause(): void;
    reset(): void;
}
declare function defineOrbitPass(tag?: string): CustomElementConstructor | undefined;

/** `<mo-meter-countdown>` — compact live-activity meter countdown. Data is supplied by attributes or update().
 * No network or simulated readings. `animated` enables ornamental motion; `running` explicitly enables supported clocks.
 * Buttons emit usa:action / usa:change; clocks emit usa:tick and usa:complete. All resources stop on disconnect.
 */
interface UsaMeterCountdownElement extends UsaActivityElement {
    update(data: ActivityData): void;
    play(): void;
    pause(): void;
    reset(): void;
}
declare function defineMeterCountdown(tag?: string): CustomElementConstructor | undefined;

/** `<mo-race-telemetry>` — compact live-activity race telemetry. Data is supplied by attributes or update().
 * No network or simulated readings. `animated` enables ornamental motion; `running` explicitly enables supported clocks.
 * Buttons emit usa:action / usa:change; clocks emit usa:tick and usa:complete. All resources stop on disconnect.
 */
interface UsaRaceTelemetryElement extends UsaActivityElement {
    update(data: ActivityData): void;
    play(): void;
    pause(): void;
    reset(): void;
}
declare function defineRaceTelemetry(tag?: string): CustomElementConstructor | undefined;

/** `<mo-workout-player>` — compact live-activity workout player. Data is supplied by attributes or update().
 * No network or simulated readings. `animated` enables ornamental motion; `running` explicitly enables supported clocks.
 * Buttons emit usa:action / usa:change; clocks emit usa:tick and usa:complete. All resources stop on disconnect.
 */
interface UsaWorkoutPlayerElement extends UsaActivityElement {
    update(data: ActivityData): void;
    play(): void;
    pause(): void;
    reset(): void;
}
declare function defineWorkoutPlayer(tag?: string): CustomElementConstructor | undefined;

/** `<mo-status-pill>` — compact live-activity status pill. Data is supplied by attributes or update().
 * No network or simulated readings. `animated` enables ornamental motion; `running` explicitly enables supported clocks.
 * Buttons emit usa:action / usa:change; clocks emit usa:tick and usa:complete. All resources stop on disconnect.
 */
interface UsaStatusPillElement extends UsaActivityElement {
    update(data: ActivityData): void;
    play(): void;
    pause(): void;
    reset(): void;
}
declare function defineStatusPill(tag?: string): CustomElementConstructor | undefined;

/** `<mo-ride-status>` — compact live-activity ride status. Data is supplied by attributes or update().
 * No network or simulated readings. `animated` enables ornamental motion; `running` explicitly enables supported clocks.
 * Buttons emit usa:action / usa:change; clocks emit usa:tick and usa:complete. All resources stop on disconnect.
 */
interface UsaRideStatusElement extends UsaActivityElement {
    update(data: ActivityData): void;
    play(): void;
    pause(): void;
    reset(): void;
}
declare function defineRideStatus(tag?: string): CustomElementConstructor | undefined;

/** `<mo-route-sparkline>` — compact live-activity route sparkline. Data is supplied by attributes or update().
 * No network or simulated readings. `animated` enables ornamental motion; `running` explicitly enables supported clocks.
 * Buttons emit usa:action / usa:change; clocks emit usa:tick and usa:complete. All resources stop on disconnect.
 */
interface UsaRouteSparklineElement extends UsaActivityElement {
    update(data: ActivityData): void;
    play(): void;
    pause(): void;
    reset(): void;
}
declare function defineRouteSparkline(tag?: string): CustomElementConstructor | undefined;

/** `<mo-activity-wall>` — drifting columns of live-activity cards. Supply direct children with data-column.
 * Pauses on hover, focus, hidden document and offscreen. `paused` is reflected. No duplicate interactive content.
 */
interface UsaActivityWallElement extends UsaElement {
    paused: boolean;
    play(): void;
    pause(): void;
}
declare function defineActivityWall(tag?: string): CustomElementConstructor | undefined;

/** `<mo-luminous-switch>` — a glass day/night switch with a sliding halo and particle sun/moon morph.
 * `checked` is reflected; optional `target` receives data-usa-surface=light/dark. No page theme is changed without target.
 * Native button keyboard semantics; `name`/`value` participate in forms, including reset. `usa:change` { checked, theme }.
 */
interface UsaLuminousSwitchElement extends UsaElement {
    checked: boolean;
    toggle(force?: boolean): void;
}
declare function defineLuminousSwitch(tag?: string): CustomElementConstructor | undefined;

/** `<mo-particle-icon icon="moon">` — 64 SVG particles morph between sun, moon, check, heart, play, pause, spark and power.
 * Set `icon` or call morph(name). A labelled image; `decorative` hides it from assistive technology. No idle animation.
 */
interface UsaParticleIconElement extends UsaElement {
    icon: string;
    morph(name: string): void;
}
declare function defineParticleIcon(tag?: string): CustomElementConstructor | undefined;

/** `<mo-particle-button label="Save" icon="spark" active-icon="check">` — glass action/toggle button with a particle burst.
 * `toggle` enables reflected `pressed`/aria-pressed; otherwise it is an ordinary action button. `usa:activate` { pressed }.
 */
interface UsaParticleButtonElement extends UsaElement {
    pressed: boolean;
    activate(): void;
}
declare function defineParticleButton(tag?: string): CustomElementConstructor | undefined;

/** `<mo-halo-segmented options="Studio,Gallery,Export" value="Studio">` — glowing glass radio choices with a spring pill.
 * `value` is reflected. Arrow keys (including RTL), Home/End and native Space activation. `usa:change` { value, index }.
 */
interface UsaHaloSegmentedElement extends UsaElement {
    value: string;
}
declare function defineHaloSegmented(tag?: string): CustomElementConstructor | undefined;

/** `<mo-halo-slider value="40" label="Brightness">` — native range input with a glass thumb and luminous fill.
 * Native touch, keyboard, step, form name and disabled semantics. Reflected numeric value. `usa:input` / `usa:change` { value }.
 */
interface UsaHaloSliderElement extends UsaElement {
    value: number;
}
declare function defineHaloSlider(tag?: string): CustomElementConstructor | undefined;

/** `<mo-orbit-progress value="65" max="100" label="Export">` — determinate luminous glass progress dial.
 * Reflected numeric value, bounded to 0..max. Accessible progressbar. No idle rotation or invented progress.
 */
interface UsaOrbitProgressElement extends UsaElement {
    value: number;
}
declare function defineOrbitProgress(tag?: string): CustomElementConstructor | undefined;

/**
 * Snap points of a sheet from text such as "0.4, 0.9" or "40%, 90%": fractions of the frame's height, kept in
 * (0, 1], sorted, duplicates dropped. Falls back to `[0.5, 1]` when nothing usable is given.
 */
declare function parseSnaps(text: string | null | undefined): number[];
/**
 * Where a released sheet comes to rest: the snap (index into `snaps`) nearest to where its momentum would carry it,
 * or -1 to close. `shown` is the visible fraction (0–1) and `velocity` how fast it grows, in fractions per second.
 * A sheet may only close when `closable` and the projection falls below half of the lowest snap.
 */
declare function sheetRest(shown: number, velocity: number, snaps: readonly number[], closable?: boolean): number;
/**
 * The page a pager settles on after a drag: the page under its projected position, but never more than one page
 * from where the drag began (`from`), so a hard flick turns one page, as on a phone. `offset` is the track's
 * position in px (0 = first page, growing to the right), `velocity` in px/s.
 */
declare function pageAfter(offset: number, velocity: number, width: number, count: number, from: number): number;
/**
 * A position inside `[min, max]`, or past an end with rubber-band resistance (the further, the stiffer), as an
 * iOS scroll view does. `dimension` is the size that sets how stiff the band is.
 */
declare function dampedAt(position: number, min: number, max: number, dimension: number, constant?: number): number;
/**
 * The layout of card `i` of `n` in a stack: collapsed, cards tuck behind the first (each `peek` px lower and a
 * little smaller); open (`t` = 1), they lie one under another `gap` px apart. `heights` are the cards' heights.
 * Returns the y offset in px and the scale; `t` in between blends the two.
 */
declare function pilePose(i: number, heights: readonly number[], t: number, peek?: number, gap?: number): {
    y: number;
    scale: number;
    opacity: number;
};
/** Height of `lines` lines of text with the given line height in px (at least one line). */
declare const linesHeight: (lines: number, lineHeight: number) => number;

/**
 * 17.17 helpers shared by the spring parts (like-button, star-rating, copy-button, tag-input, pin-input, reorder-list,
 * swipe-item, toast-stack, spring-accordion, spring-counter). Pure functions with no DOM access, so they are easy to
 * test. The motion itself comes from the 17.16 spring core (`createSpringGroup`, `micro()`, `feedback()`).
 * Original implementations; see docs/spring-parts-17-17.md.
 */
/**
 * Where the `n` dots of a burst fly to: evenly round a circle of `radius` px, the first one straight up, each with a
 * small alternating inward step so the ring looks hand-thrown rather than ruled. Offsets from the centre, 0.1 px.
 */
declare function burstPoints(n: number, radius?: number): {
    x: number;
    y: number;
}[];
/** A count shown compactly: 999, 1.2k, 12k, 1.2M (`locale` digits are left to the caller). */
declare function compactCount(n: number): string;
/**
 * The rating under a pointer at `x` px across a row `width` px wide with `max` stars: 1…max, or in halves with
 * `half`. Positions left of the row give the lowest step, right of it `max`.
 */
declare function ratingAt(x: number, width: number, max?: number, half?: boolean): number;
/** How full star `i` (0-based) is for a rating: 0, 0.5 or 1. */
declare const starFill: (value: number, i: number) => number;
/** Tags from text: split on commas or new lines, trimmed, inner spaces collapsed, empties dropped. */
declare function parseTags(text: string): string[];
/**
 * Add the tags in `raw` to `tags`: case-insensitive duplicates are refused (their index is reported), each tag is cut
 * to `maxLength` characters and nothing is added past `max` tags.
 */
declare function addTags(tags: readonly string[], raw: string, max?: number, maxLength?: number): {
    tags: string[];
    added: string[];
    duplicate: number;
    full: boolean;
};
/** The characters a one-time-code field keeps from typed or pasted text: digits, or letters and digits upper-cased. */
declare function codeChars(text: string, mode?: 'numeric' | 'alphanumeric', length?: number): string[];
/**
 * The slot a dragged item belongs in: `tops` are the slot tops in px (in order), `y` is the dragged item's centre.
 * The item takes the last slot whose middle it has passed.
 */
declare function slotAt(y: number, tops: readonly number[], heights: readonly number[]): number;
/** Offsets that make room for an item being moved from `from` to `to`: the items between shift by `size` px. */
declare function shiftFor(i: number, from: number, to: number, size: number): number;
/**
 * Whether a swiped row should end open: past half the actions' `width`, or flicked open at more than `fling` px/s;
 * a flick the other way closes it. `offset` and `velocity` are positive toward open.
 */
declare function swipeOpen(offset: number, width: number, velocity?: number, fling?: number): boolean;
/**
 * Where toast `i` (0 = newest) of `count` sits in a stack: collapsed, the older ones peek out `peek` px behind the
 * newest and shrink; expanded, they spread out with `gap` px between them. `heights` are the toasts' heights.
 */
declare function stackLayout(i: number, heights: readonly number[], expanded: boolean, gap?: number, peek?: number): {
    y: number;
    scale: number;
    opacity: number;
};
/** A number as the characters a rolling counter shows: fixed `decimals`, optional thousands `group` separator. */
declare function counterText(value: number, decimals?: number, group?: string): string;
/**
 * Line up two counter texts from the right so each digit column keeps its place value: shorter texts are padded
 * with '' on the left. Returns the columns as [before, after] pairs.
 */
declare function alignDigits(before: string, after: string): [string, string][];
/** Open panel indexes from an attribute like "0, 2"; with `multiple` false only the first one is kept. */
declare function openSet(text: string, count: number, multiple?: boolean): number[];

/**
 * 17.12 helpers shared by the tab, copy and list widgets (progress-tabs, code-tabs, share-button, sortable-list, …).
 * Original implementations; see docs/collections-17-12.md.
 */
/**
 * The index a roving-focus key moves to in a row of `n` items: ArrowRight / ArrowDown go forward, ArrowLeft / ArrowUp
 * back (both wrap), Home and End jump to the ends. Any other key returns `-1`. `rtl` swaps left and right.
 */
declare function rovingIndex(key: string, index: number, n: number, rtl?: boolean): number;
/** Copy `text` to the clipboard; resolves `true` when a copy happened (Clipboard API, then a hidden textarea). */
declare function copyText(text: string): Promise<boolean>;
/** A small deterministic pseudo-random number in [0, 1) for index `i` and `seed` (stable layouts, no Math.random). */
declare function seeded(i: number, seed?: number): number;
/** Move one item of a copy of `list` from `from` to `to` (both clamped). */
declare function moveItem<T>(list: readonly T[], from: number, to: number): T[];
/** Numbers from a comma / space separated attribute; non-numbers become 0, negatives 0; at most `max` values. */
declare function numbers(text: string, max?: number): number[];

/**
 * The built-in icon set: 753 original line icons drawn on a 24 × 24 grid with a 2px round stroke, grouped in
 * 34 categories (17.14 drew the first 253 in 14 categories; 17.15 and 17.17 each added 250 more in 10 new ones). Each icon is a short list of shapes separated by `;`:
 *
 * - `c cx cy r` is a circle,
 * - `r x y width height [radius]` is a rectangle,
 * - anything else is SVG path data.
 *
 * `iconParts()` turns one into element descriptions, `iconSvg()` into markup, and `searchIcons()` filters the set.
 * The shapes carry no colour: they are stroked with `currentColor`, so an icon takes the colour of its text.
 */
type IconCategory = 'arrows' | 'interface' | 'media' | 'files' | 'communication' | 'devices' | 'weather' | 'commerce' | 'editor' | 'travel' | 'people' | 'nature' | 'shapes' | 'time' | 'development' | 'security' | 'health' | 'food' | 'household' | 'sports' | 'education' | 'finance' | 'charts' | 'tools' | 'animals' | 'music' | 'gaming' | 'transport' | 'office' | 'science' | 'buildings' | 'celebration' | 'clothing' | 'gestures';
/** Categories in display order, with English and Chinese names. */
declare const ICON_CATEGORIES: readonly {
    id: IconCategory;
    en: string;
    zh: string;
}[];
/** Every icon by category; names are unique across the whole set. */
declare const ICON_GROUPS: Readonly<Record<IconCategory, Readonly<Record<string, string>>>>;
/** Every icon by name, flattened from `ICON_GROUPS`. */
declare const ICONS: Readonly<Record<string, string>>;
/** All icon names in category order, or those of one category. */
declare function iconNames(category?: string): string[];
/** The category an icon belongs to, or undefined for an unknown name. */
declare function iconCategory(name: string): IconCategory | undefined;
interface IconPart {
    tag: 'path' | 'circle' | 'rect';
    attrs: Record<string, string>;
}
/** One icon's shapes as element descriptions; an unknown name gives []. */
declare function iconParts(name: string): IconPart[];
/** Attributes shared by every icon's `<svg>`. */
declare const ICON_SVG_ATTRS: Readonly<Record<string, string>>;
/**
 * One icon as an `<svg>` string (empty for an unknown name). `size` is in px (24), `stroke` the line width (2).
 * Without a `label` the svg is hidden from screen readers; with one it is an image with that name.
 */
declare function iconSvg(name: string, opts?: {
    size?: number;
    stroke?: number;
    label?: string;
}): string;
/**
 * Names matching a search, in set order. Every word of the query must appear in the name or the category (English or
 * Chinese category name); `category` narrows to one category first.
 */
declare function searchIcons(query?: string, category?: string): string[];

/**
 * 17.15 helpers shared by the toolkit widgets (radial-menu, time-picker, color-swatches, calendar-strip,
 * comparison-table, radial-bars, bar-race, slope-chart, …). Pure functions with no DOM access, so they are easy to
 * test. Original implementations; see docs/toolkit-17-15.md.
 */
/**
 * Where `n` items sit on a circle of `radius` px, starting at `start` degrees (0 = east, -90 = north) and spread over
 * `spread` degrees. A full circle (360) spaces them evenly without doubling the first spot; a part circle puts the
 * first and last item on its two ends. Offsets are from the centre, rounded to 0.1 px.
 */
declare function radialSpots(n: number, radius?: number, start?: number, spread?: number): {
    x: number;
    y: number;
    angle: number;
}[];
/** "HH:MM" (24-hour) as hours and minutes, or null when it is not a real time. */
declare function timeParts(text: string): {
    h: number;
    m: number;
} | null;
/** Minutes since midnight back to "HH:MM", wrapping round the day either way. */
declare function formatTime(minutes: number): string;
/**
 * Step a time by `delta` steps of `step` minutes in one `unit`: hours move by whole hours, minutes snap to the step
 * grid first (so 10:07 with a 5-minute step goes up to 10:10 and down to 10:05) and wrap within the hour.
 */
declare function stepTime(text: string, unit: 'h' | 'm', delta: number, step?: number): string;
/** A 24-hour hour as a 12-hour clock: hour 1–12 and whether it is after noon. */
declare const hour12: (h: number) => {
    hour: number;
    pm: boolean;
};
/** Relative luminance of a `#rgb` / `#rrggbb` color (0 dark … 1 light), or NaN for anything else. */
declare function luminance(hex: string): number;
/** The ink (black or white) that reads best on a hex color; anything that is not hex gets white. */
declare function inkOn(hex: string): '#000000' | '#ffffff';
/** A "YYYY-MM-DD" day as a UTC day number (days since 1970-01-01), or NaN. */
declare function parseDay(text: string): number;
/** A UTC day number back to "YYYY-MM-DD". */
declare function dayText(day: number): string;
/** The day that starts the week holding `day`, with weeks starting on `weekStart` (0 Sunday … 6 Saturday; 1 by default). */
declare function weekStartOf(day: number, weekStart?: number): number;
/** Whether a table row's cells (after the first, which names the row) are not all the same, ignoring case and spaces. */
declare function rowDiffers(cells: readonly string[]): boolean;
/** A comparison cell that is really a yes or a no: "yes", "✓", "true", "是" … → 'yes'; "no", "✗", "—" … → 'no'; else ''. */
declare function cellMark(text: string): 'yes' | 'no' | '';
/**
 * Stroke-dash numbers for an arc that covers `fraction` of a `sweep`-degree track on a circle of radius `r`:
 * the visible length, the track length and the full circumference.
 */
declare function arcDash(fraction: number, r: number, sweep?: number): {
    on: number;
    track: number;
    circumference: number;
};
/**
 * The order of names for one frame of a bar race: indexes sorted by value, largest first, ties kept in input order,
 * cut to the `top` places. Each entry carries its place and value.
 */
declare function raceRanks(values: readonly number[], top?: number): {
    index: number;
    value: number;
    place: number;
}[];
/** Frames of numbers from text like "1,2,3; 4,5,6": frames split on ";", numbers on commas or spaces (non-numbers → 0). */
declare function frameValues(text: string, maxFrames?: number, maxValues?: number): number[][];
/**
 * Push label positions apart so no two are closer than `gap`, keeping them inside [min, max] and their order. Used for
 * the end labels of a slope chart. Returns new positions in the input order.
 */
declare function spreadLabels(ys: readonly number[], gap?: number, min?: number, max?: number): number[];
/** Signed numbers (negatives kept) from a comma / space separated attribute; non-numbers become 0; at most `max`. */
declare function signedNumbers(text: string, max?: number): number[];
/** Change from `before` to `after` as a fraction of `before` (0.25 = +25%); 0 when `before` is 0. */
declare const relativeChange: (before: number, after: number) => number;

type LookFamily = 'ui' | 'parts' | 'motion';
/** Palette: ink, paper, accent, second accent. `DARK_PALETTES` lists the dark ones. */
declare const LOOK_PALETTES: {
    readonly indigo: readonly ["#18181b", "#ffffff", "#4f46e5", "#a855f7"];
    readonly ocean: readonly ["#0c2a3e", "#f0f9ff", "#0369a1", "#22d3ee"];
    readonly forest: readonly ["#14281d", "#f3f8f2", "#15803d", "#a3e635"];
    readonly sunset: readonly ["#3b1d0e", "#fff7ed", "#c2410c", "#fb7185"];
    readonly rose: readonly ["#3f0d1f", "#fff1f5", "#be123c", "#f472b6"];
    readonly grape: readonly ["#2a1240", "#faf5ff", "#7c3aed", "#e879f9"];
    readonly amber: readonly ["#2f2104", "#fffbeb", "#b45309", "#facc15"];
    readonly slate: readonly ["#0f172a", "#f8fafc", "#475569", "#94a3b8"];
    readonly mint: readonly ["#062a24", "#f0fdfa", "#0f766e", "#34d399"];
    readonly coral: readonly ["#3a1410", "#fff5f2", "#c43d1c", "#ffb703"];
    readonly midnight: readonly ["#e2e8f0", "#0b1020", "#818cf8", "#22d3ee"];
    readonly ember: readonly ["#fef3c7", "#1c1210", "#fb923c", "#f87171"];
    readonly cherry: readonly ["#3b0a0f", "#fff5f5", "#b91c1c", "#fca5a5"];
    readonly olive: readonly ["#1f2410", "#f9faf1", "#4d6b0f", "#bef264"];
    readonly cobalt: readonly ["#0b1640", "#f3f6ff", "#1d4ed8", "#60a5fa"];
    readonly plum: readonly ["#2b0b2a", "#fdf4fb", "#a21caf", "#f0abfc"];
    readonly sand: readonly ["#2b2418", "#fbf8f1", "#8a5a1f", "#e7c98b"];
    readonly teal: readonly ["#042f2e", "#effcfa", "#0e7490", "#5eead4"];
    readonly aurora: readonly ["#e0f2fe", "#06121f", "#a78bfa", "#34d399"];
    readonly velvet: readonly ["#fce7f3", "#1a0b16", "#f472b6", "#fbbf24"];
    readonly lavender: readonly ["#1e1b3a", "#f7f5ff", "#6d28d9", "#c4b5fd"];
    readonly moss: readonly ["#18230f", "#f6f8ef", "#3f6212", "#d9f99d"];
    readonly copper: readonly ["#2a160c", "#fdf6f0", "#9a3412", "#fdba74"];
    readonly lagoon: readonly ["#062430", "#f0fbfc", "#155e75", "#67e8f9"];
    readonly berry: readonly ["#2a0a1f", "#fdf2f8", "#9d174d", "#f9a8d4"];
    readonly sage: readonly ["#1a2620", "#f4f7f4", "#3f6b56", "#a7c4b5"];
    readonly espresso: readonly ["#2b1d16", "#faf6f2", "#6f4e37", "#d6b48c"];
    readonly navy: readonly ["#0a1433", "#f5f7fc", "#1e3a8a", "#fbbf24"];
    readonly obsidian: readonly ["#e5e7eb", "#0a0a0c", "#a3e635", "#38bdf8"];
    readonly abyss: readonly ["#ccfbf1", "#03141a", "#2dd4bf", "#818cf8"];
    readonly jade: readonly ["#052e1f", "#effdf6", "#047857", "#6ee7b7"];
    readonly saffron: readonly ["#2e1a02", "#fffaeb", "#a16207", "#fde047"];
    readonly denim: readonly ["#0f1b2d", "#f4f7fb", "#2f5d8a", "#93c5fd"];
    readonly orchid: readonly ["#2e0b33", "#fcf4ff", "#86198f", "#e9a8f5"];
    readonly rust: readonly ["#2b1206", "#fdf5f0", "#9a3b12", "#fbbf24"];
    readonly spruce: readonly ["#06211f", "#f0f8f7", "#115e59", "#5eead4"];
    readonly flamingo: readonly ["#3a0d1c", "#fff3f6", "#be185d", "#f9a8c9"];
    readonly periwinkle: readonly ["#16183a", "#f5f6ff", "#3f4bb8", "#b4bcfb"];
    readonly onyx: readonly ["#f4f4f5", "#0c0c0e", "#fda4af", "#fcd34d"];
    readonly nebula: readonly ["#ede9fe", "#0d0a1f", "#c084fc", "#67e8f9"];
};
type LookPalette = keyof typeof LOOK_PALETTES;
/** What a look sets. Colors that a reader has to read against (`ink`, `paper`, `bg`, `cta`) are plain hex where they can be. */
interface LookSpec {
    ink: string;
    paper: string;
    accent: string;
    onAccent: string;
    /** The opaque color behind the widget that the look was tuned for (the paper, or the tint under frosted glass). */
    bg: string;
    dark: boolean;
    soft?: string;
    line?: string;
    radius?: string;
    shadow?: string;
    glow?: string;
    bw?: string;
    bs?: string;
    /** Dash pattern for drawn outlines (the elastic frame). */
    dash?: string;
    backdrop?: string;
    cta?: string;
    onCta?: string;
    ok?: string;
    bad?: string;
    mediaFilter?: string;
    mediaRadius?: string;
    frame?: string;
    speed?: string;
    beamA?: string;
    beamB?: string;
    font?: string;
    /** 17.17: the micro-interaction feel (a `MICRO_FEELS` name, or `default` for the springs as tuned), set as `--mo-feel`. */
    feel?: string;
}
interface LookInfo extends LookSpec {
    name: string;
    family: LookFamily;
    treatment: string;
    palette: LookPalette;
}
interface Pal {
    ink: string;
    paper: string;
    accent: string;
    a2: string;
    on: string;
    dark: boolean;
}
type Treatment = (p: Pal) => Partial<LookSpec>;
declare const LOOK_TREATMENTS: Record<LookFamily, Record<string, Treatment>>;
/**
 * 17.17: how each treatment moves. Every look sets `--mo-feel`, which the spring core (`micro()`, the spring widgets)
 * reads, so a brutal look lands heavy, a clay look plays, a terminal look snaps: the motion matches the surface.
 */
declare const LOOK_FEELS: Record<LookFamily, Record<string, string>>;
declare const LOOK_FAMILIES: LookFamily[];
/** Every look name, or a family's, in treatment then palette order. */
declare function lookNames(family?: LookFamily): string[];
/** What a look sets, or null for an unknown name. */
declare function lookInfo(name: string): LookInfo | null;
/** A look's custom properties, as `{ '--mo-kit-ink': '#…', … }` (empty for an unknown name). */
declare function lookTokens(name: string): Record<string, string>;
/** The CSS rule for one look (empty for an unknown name). */
declare function lookRule(name: string): string;
/** The stylesheet for every look, or one family's. */
declare function looksCss(family?: LookFamily): string;
/** Add the rules for every look (or one family's) to the document, once. */
declare function adoptLooks(family?: LookFamily): void;
/** Give `el` a look (adopting just that rule); null removes it. False for an unknown name. */
declare function applyLook(el: Element | null, name: string | null): boolean;

/**
 * motionary/components — the phone viewport (13.3.0): one shared watcher for the soft keyboard
 * (`visualViewport`) and screen rotation, used by `<usa-bottom-sheet>`, `<usa-drawer>`, `<usa-modal>`, `<usa-sheet>`,
 * `<usa-toast-stack>` and `<usa-pagination>`. Public from `motionary/components/widgets`.
 */

/** The visible viewport height: the layout height minus what the soft keyboard covers (13.3.0). */
declare const viewportHeight: () => number;
/**
 * Watch the visible viewport on phones (13.3.0): `fn` runs when the soft keyboard opens or closes
 * (`visualViewport` resize / scroll), on window resize and on `orientationchange`. While at least one
 * watcher is active, `<html>` has `--usa-vvh` and `--usa-kb` (px). Returns the unsubscribe function;
 * the last one removes every listener and both variables.
 */
declare function watchViewport(fn?: () => void): Cleanup;

declare const WIDGETS: Record<string, Record<string, (tag?: string) => CustomElementConstructor | undefined>>;
/** Every widget tag, in release order. */
declare const WIDGET_TAGS: string[];
/**
 * Register every widget (or only those of one release, e.g. `'6.2'`). 17.3: `mo-*` is the default name — this turns on
 * the `<mo-*>` names first (`defineMoAliases()`); the `usa-*` names stay registered as deprecated aliases.
 */
declare function defineWidgets(release?: string): void;
declare global {
    interface HTMLElementTagNameMap {
        'usa-eclipse-toggle': UsaEclipseToggleElement;
        'mo-eclipse-toggle': UsaEclipseToggleElement;
        'usa-hue-orbit': UsaHueOrbitElement;
        'mo-hue-orbit': UsaHueOrbitElement;
        'usa-notch-slider': UsaNotchSliderElement;
        'mo-notch-slider': UsaNotchSliderElement;
        'usa-bulge-volume': UsaBulgeVolumeElement;
        'mo-bulge-volume': UsaBulgeVolumeElement;
        'usa-copy-button': UsaCopyButtonElement;
        'mo-copy-button': UsaCopyButtonElement;
        'usa-tile-relay': UsaTileRelayElement;
        'mo-tile-relay': UsaTileRelayElement;
        'usa-squish-key': UsaSquishKeyElement;
        'mo-squish-key': UsaSquishKeyElement;
        'usa-squish-stepper': UsaSquishStepperElement;
        'mo-squish-stepper': UsaSquishStepperElement;
        'usa-analog-stick': UsaAnalogStickElement;
        'mo-analog-stick': UsaAnalogStickElement;
        'usa-transfer-button': UsaTransferButtonElement;
        'mo-transfer-button': UsaTransferButtonElement;
        'usa-six-dot-orbit': UsaSixDotOrbitElement;
        'mo-six-dot-orbit': UsaSixDotOrbitElement;
        'usa-center-bars': UsaCenterBarsElement;
        'mo-center-bars': UsaCenterBarsElement;
        'usa-quarter-ring': UsaQuarterRingElement;
        'mo-quarter-ring': UsaQuarterRingElement;
        'usa-triple-pulse': UsaTriplePulseElement;
        'mo-triple-pulse': UsaTriplePulseElement;
        'usa-breath-orb': UsaBreathOrbElement;
        'mo-breath-orb': UsaBreathOrbElement;
        'usa-three-dot-bounce': UsaThreeDotBounceElement;
        'mo-three-dot-bounce': UsaThreeDotBounceElement;
        'usa-infinity-loop': UsaInfinityLoopElement;
        'mo-infinity-loop': UsaInfinityLoopElement;
        'usa-sweep-lines': UsaSweepLinesElement;
        'mo-sweep-lines': UsaSweepLinesElement;
        'usa-wifi-signal': UsaWifiSignalElement;
        'mo-wifi-signal': UsaWifiSignalElement;
        'usa-text-reveal': UsaTextRevealElement;
        'mo-text-reveal': UsaTextRevealElement;
        'usa-jelly-button': UsaJellyButtonElement;
        'mo-jelly-button': UsaJellyButtonElement;
        'usa-bounce-button': UsaBounceButtonElement;
        'mo-bounce-button': UsaBounceButtonElement;
        'usa-tada-button': UsaTadaButtonElement;
        'mo-tada-button': UsaTadaButtonElement;
        'usa-groove-toggle': UsaGrooveToggleElement;
        'mo-groove-toggle': UsaGrooveToggleElement;
        'usa-cart-badge': UsaCartBadgeElement;
        'mo-cart-badge': UsaCartBadgeElement;
        'usa-chip-input': UsaChipInputElement;
        'mo-chip-input': UsaChipInputElement;
        'usa-plan-picker': UsaPlanPickerElement;
        'mo-plan-picker': UsaPlanPickerElement;
        'usa-align-switch': UsaAlignSwitchElement;
        'mo-align-switch': UsaAlignSwitchElement;
        'usa-elastic-slider': UsaElasticSliderElement;
        'mo-elastic-slider': UsaElasticSliderElement;
        'usa-code-shake': UsaCodeShakeElement;
        'mo-code-shake': UsaCodeShakeElement;
        'usa-strength-meter': UsaStrengthMeterElement;
        'mo-strength-meter': UsaStrengthMeterElement;
        'usa-step-track': UsaStepTrackElement;
        'mo-step-track': UsaStepTrackElement;
        'usa-elastic-accordion': UsaElasticAccordionElement;
        'mo-elastic-accordion': UsaElasticAccordionElement;
        'usa-squish-indicator': UsaSquishIndicatorElement;
        'mo-squish-indicator': UsaSquishIndicatorElement;
        'usa-sidebar': UsaSidebarElement;
        'mo-sidebar': UsaSidebarElement;
        'usa-scrollspy': UsaScrollspyElement;
        'mo-scrollspy': UsaScrollspyElement;
        'usa-pricing': UsaPricingElement;
        'mo-pricing': UsaPricingElement;
        'usa-announcement-bar': UsaAnnouncementBarElement;
        'mo-announcement-bar': UsaAnnouncementBarElement;
        'usa-sticky-cta': UsaStickyCtaElement;
        'mo-sticky-cta': UsaStickyCtaElement;
        'usa-bento': UsaBentoElement;
        'mo-bento': UsaBentoElement;
        'usa-empty-state': UsaEmptyStateElement;
        'mo-empty-state': UsaEmptyStateElement;
        'usa-lightbox': UsaLightboxElement;
        'mo-lightbox': UsaLightboxElement;
        'usa-data-table': UsaDataTableElement;
        'mo-data-table': UsaDataTableElement;
        'usa-filter-chips': UsaFilterChipsElement;
        'mo-filter-chips': UsaFilterChipsElement;
        'usa-hotspots': UsaHotspotsElement;
        'mo-hotspots': UsaHotspotsElement;
        'usa-fan-carousel': UsaFanCarouselElement;
        'mo-fan-carousel': UsaFanCarouselElement;
        'usa-expand-cards': UsaExpandCardsElement;
        'mo-expand-cards': UsaExpandCardsElement;
        'usa-json-viewer': UsaJsonViewerElement;
        'mo-json-viewer': UsaJsonViewerElement;
        'usa-scroll-velocity': UsaScrollVelocityElement;
        'mo-scroll-velocity': UsaScrollVelocityElement;
        'usa-horizontal-scroll': UsaHorizontalScrollElement;
        'mo-horizontal-scroll': UsaHorizontalScrollElement;
        'usa-image-trail': UsaImageTrailElement;
        'mo-image-trail': UsaImageTrailElement;
        'usa-hover-reveal-list': UsaHoverRevealListElement;
        'mo-hover-reveal-list': UsaHoverRevealListElement;
        'usa-liquid-glass': UsaLiquidGlassElement;
        'mo-liquid-glass': UsaLiquidGlassElement;
        'usa-path-motion': UsaPathMotionElement;
        'mo-path-motion': UsaPathMotionElement;
        'usa-cut-reveal': UsaCutRevealElement;
        'mo-cut-reveal': UsaCutRevealElement;
        'usa-search-bar': UsaSearchBarElement;
        'mo-search-bar': UsaSearchBarElement;
        'usa-subscribe': UsaSubscribeElement;
        'mo-subscribe': UsaSubscribeElement;
        'usa-download-button': UsaDownloadButtonElement;
        'mo-download-button': UsaDownloadButtonElement;
        'usa-reveal-footer': UsaRevealFooterElement;
        'mo-reveal-footer': UsaRevealFooterElement;
        'usa-shape-divider': UsaShapeDividerElement;
        'mo-shape-divider': UsaShapeDividerElement;
        'usa-scroll-cue': UsaScrollCueElement;
        'mo-scroll-cue': UsaScrollCueElement;
        'usa-virtual-list': UsaVirtualListElement;
        'mo-virtual-list': UsaVirtualListElement;
        'usa-infinite-scroll': UsaInfiniteScrollElement;
        'mo-infinite-scroll': UsaInfiniteScrollElement;
        'usa-context-menu': UsaContextMenuElement;
        'mo-context-menu': UsaContextMenuElement;
        'usa-split-pane': UsaSplitPaneElement;
        'mo-split-pane': UsaSplitPaneElement;
        'usa-desktop-windows': UsaDesktopWindowsElement;
        'mo-desktop-windows': UsaDesktopWindowsElement;
        'usa-stack-slider': UsaStackSliderElement;
        'mo-stack-slider': UsaStackSliderElement;
        'usa-morph-card': UsaMorphCardElement;
        'mo-morph-card': UsaMorphCardElement;
        'usa-scroll-zoom': UsaScrollZoomElement;
        'mo-scroll-zoom': UsaScrollZoomElement;
        'usa-scroll-bg': UsaScrollBgElement;
        'mo-scroll-bg': UsaScrollBgElement;
        'usa-image-tunnel': UsaImageTunnelElement;
        'mo-image-tunnel': UsaImageTunnelElement;
        'usa-orbit-gallery': UsaOrbitGalleryElement;
        'mo-orbit-gallery': UsaOrbitGalleryElement;
        'usa-clothesline': UsaClotheslineElement;
        'mo-clothesline': UsaClotheslineElement;
        'usa-elastic-frame': UsaElasticFrameElement;
        'mo-elastic-frame': UsaElasticFrameElement;
        'usa-border-beam': UsaBorderBeamElement;
        'mo-border-beam': UsaBorderBeamElement;
        'usa-progress-tabs': UsaProgressTabsElement;
        'mo-progress-tabs': UsaProgressTabsElement;
        'usa-code-tabs': UsaCodeTabsElement;
        'mo-code-tabs': UsaCodeTabsElement;
        'usa-helpful-vote': UsaHelpfulVoteElement;
        'mo-helpful-vote': UsaHelpfulVoteElement;
        'usa-share-button': UsaShareButtonElement;
        'mo-share-button': UsaShareButtonElement;
        'usa-inline-edit': UsaInlineEditElement;
        'mo-inline-edit': UsaInlineEditElement;
        'usa-tag-cloud': UsaTagCloudElement;
        'mo-tag-cloud': UsaTagCloudElement;
        'usa-heatmap': UsaHeatmapElement;
        'mo-heatmap': UsaHeatmapElement;
        'usa-donut-chart': UsaDonutChartElement;
        'mo-donut-chart': UsaDonutChartElement;
        'usa-sortable-list': UsaSortableListElement;
        'mo-sortable-list': UsaSortableListElement;
        'usa-zoom-lens': UsaZoomLensElement;
        'mo-zoom-lens': UsaZoomLensElement;
        'usa-rating-bars': UsaRatingBarsElement;
        'mo-rating-bars': UsaRatingBarsElement;
        'usa-checklist': UsaChecklistElement;
        'mo-checklist': UsaChecklistElement;
        'usa-meteors': UsaMeteorsElement;
        'mo-meteors': UsaMeteorsElement;
        'usa-connect-beam': UsaConnectBeamElement;
        'mo-connect-beam': UsaConnectBeamElement;
        'usa-retro-grid': UsaRetroGridElement;
        'mo-retro-grid': UsaRetroGridElement;
        'usa-orbit-rings': UsaOrbitRingsElement;
        'mo-orbit-rings': UsaOrbitRingsElement;
        'usa-letter-swap': UsaLetterSwapElement;
        'mo-letter-swap': UsaLetterSwapElement;
        'usa-ripple-grid': UsaRippleGridElement;
        'mo-ripple-grid': UsaRippleGridElement;
        'usa-tour': UsaTourElement;
        'mo-tour': UsaTourElement;
        'usa-signature-pad': UsaSignaturePadElement;
        'mo-signature-pad': UsaSignaturePadElement;
        'usa-wheel-picker': UsaWheelPickerElement;
        'mo-wheel-picker': UsaWheelPickerElement;
        'usa-mention-input': UsaMentionInputElement;
        'mo-mention-input': UsaMentionInputElement;
        'usa-emoji-picker': UsaEmojiPickerElement;
        'mo-emoji-picker': UsaEmojiPickerElement;
        'usa-comment-thread': UsaCommentThreadElement;
        'mo-comment-thread': UsaCommentThreadElement;
        'usa-diff-viewer': UsaDiffViewerElement;
        'mo-diff-viewer': UsaDiffViewerElement;
        'usa-line-chart': UsaLineChartElement;
        'mo-line-chart': UsaLineChartElement;
        'usa-funnel-chart': UsaFunnelChartElement;
        'mo-funnel-chart': UsaFunnelChartElement;
        'usa-treemap': UsaTreemapElement;
        'mo-treemap': UsaTreemapElement;
        'usa-gantt': UsaGanttElement;
        'mo-gantt': UsaGanttElement;
        'usa-waffle-chart': UsaWaffleChartElement;
        'mo-waffle-chart': UsaWaffleChartElement;
        'usa-split-flap': UsaSplitFlapElement;
        'mo-split-flap': UsaSplitFlapElement;
        'usa-scratch-card': UsaScratchCardElement;
        'mo-scratch-card': UsaScratchCardElement;
        'usa-page-flip': UsaPageFlipElement;
        'mo-page-flip': UsaPageFlipElement;
        'usa-circular-text': UsaCircularTextElement;
        'mo-circular-text': UsaCircularTextElement;
        'usa-pixel-transition': UsaPixelTransitionElement;
        'mo-pixel-transition': UsaPixelTransitionElement;
        'usa-magnet-lines': UsaMagnetLinesElement;
        'mo-magnet-lines': UsaMagnetLinesElement;
        'usa-text-pressure': UsaTextPressureElement;
        'mo-text-pressure': UsaTextPressureElement;
        'usa-shuffle-grid': UsaShuffleGridElement;
        'mo-shuffle-grid': UsaShuffleGridElement;
        'usa-icon': UsaIconElement;
        'mo-icon': UsaIconElement;
        'usa-icon-picker': UsaIconPickerElement;
        'mo-icon-picker': UsaIconPickerElement;
        'usa-radial-menu': UsaRadialMenuElement;
        'mo-radial-menu': UsaRadialMenuElement;
        'usa-hover-card': UsaHoverCardElement;
        'mo-hover-card': UsaHoverCardElement;
        'usa-toggle-group': UsaToggleGroupElement;
        'mo-toggle-group': UsaToggleGroupElement;
        'usa-time-picker': UsaTimePickerElement;
        'mo-time-picker': UsaTimePickerElement;
        'usa-color-swatches': UsaColorSwatchesElement;
        'mo-color-swatches': UsaColorSwatchesElement;
        'usa-calendar-strip': UsaCalendarStripElement;
        'mo-calendar-strip': UsaCalendarStripElement;
        'usa-comparison-table': UsaComparisonTableElement;
        'mo-comparison-table': UsaComparisonTableElement;
        'usa-radial-bars': UsaRadialBarsElement;
        'mo-radial-bars': UsaRadialBarsElement;
        'usa-bar-race': UsaBarRaceElement;
        'mo-bar-race': UsaBarRaceElement;
        'usa-bullet-chart': UsaBulletChartElement;
        'mo-bullet-chart': UsaBulletChartElement;
        'usa-slope-chart': UsaSlopeChartElement;
        'mo-slope-chart': UsaSlopeChartElement;
        'usa-dot-plot': UsaDotPlotElement;
        'mo-dot-plot': UsaDotPlotElement;
        'usa-micro': UsaMicroElement;
        'mo-micro': UsaMicroElement;
        'usa-micro-switch': UsaMicroSwitchElement;
        'mo-micro-switch': UsaMicroSwitchElement;
        'usa-micro-checkbox': UsaMicroCheckboxElement;
        'mo-micro-checkbox': UsaMicroCheckboxElement;
        'usa-micro-input': UsaMicroInputElement;
        'mo-micro-input': UsaMicroInputElement;
        'usa-micro-button': UsaMicroButtonElement;
        'mo-micro-button': UsaMicroButtonElement;
        'usa-micro-slider': UsaMicroSliderElement;
        'mo-micro-slider': UsaMicroSliderElement;
        'usa-micro-segmented': UsaMicroSegmentedElement;
        'mo-micro-segmented': UsaMicroSegmentedElement;
        'usa-micro-stepper': UsaMicroStepperElement;
        'mo-micro-stepper': UsaMicroStepperElement;
        'usa-spring-like': UsaSpringLikeElement;
        'mo-spring-like': UsaSpringLikeElement;
        'usa-spring-rating': UsaSpringRatingElement;
        'mo-spring-rating': UsaSpringRatingElement;
        'usa-spring-copy': UsaSpringCopyElement;
        'mo-spring-copy': UsaSpringCopyElement;
        'usa-spring-tags': UsaSpringTagsElement;
        'mo-spring-tags': UsaSpringTagsElement;
        'usa-spring-code': UsaSpringCodeElement;
        'mo-spring-code': UsaSpringCodeElement;
        'usa-spring-list': UsaSpringListElement;
        'mo-spring-list': UsaSpringListElement;
        'usa-spring-swipe': UsaSpringSwipeElement;
        'mo-spring-swipe': UsaSpringSwipeElement;
        'usa-spring-toasts': UsaSpringToastsElement;
        'mo-spring-toasts': UsaSpringToastsElement;
        'usa-spring-accordion': UsaSpringAccordionElement;
        'mo-spring-accordion': UsaSpringAccordionElement;
        'usa-spring-counter': UsaSpringCounterElement;
        'mo-spring-counter': UsaSpringCounterElement;
        'usa-spring-collapse': UsaSpringCollapseElement;
        'mo-spring-collapse': UsaSpringCollapseElement;
        'usa-read-more': UsaReadMoreElement;
        'mo-read-more': UsaReadMoreElement;
        'usa-spring-sheet': UsaSpringSheetElement;
        'mo-spring-sheet': UsaSpringSheetElement;
        'usa-spring-pager': UsaSpringPagerElement;
        'mo-spring-pager': UsaSpringPagerElement;
        'usa-elastic-scroll': UsaElasticScrollElement;
        'mo-elastic-scroll': UsaElasticScrollElement;
        'usa-spring-stack': UsaSpringStackElement;
        'mo-spring-stack': UsaSpringStackElement;
        'usa-spring-pip': UsaSpringPipElement;
        'mo-spring-pip': UsaSpringPipElement;
        'usa-spring-island': UsaSpringIslandElement;
        'mo-spring-island': UsaSpringIslandElement;
        'usa-spring-peek': UsaSpringPeekElement;
        'mo-spring-peek': UsaSpringPeekElement;
        'usa-spring-scrollbar': UsaSpringScrollbarElement;
        'mo-spring-scrollbar': UsaSpringScrollbarElement;
        'usa-slide-confirm': UsaSlideConfirmElement;
        'mo-slide-confirm': UsaSlideConfirmElement;
        'usa-spring-chain': UsaSpringChainElement;
        'mo-spring-chain': UsaSpringChainElement;
        'usa-fling-marquee': UsaFlingMarqueeElement;
        'mo-fling-marquee': UsaFlingMarqueeElement;
        'usa-lens-stack': UsaLensStackElement;
        'mo-lens-stack': UsaLensStackElement;
        'usa-iris-diaphragm': UsaIrisDiaphragmElement;
        'mo-iris-diaphragm': UsaIrisDiaphragmElement;
        'usa-contour-relief': UsaContourReliefElement;
        'mo-contour-relief': UsaContourReliefElement;
        'usa-select': UsaSelectElement;
        'mo-select': UsaSelectElement;
        'usa-combobox': UsaComboboxElement;
        'mo-combobox': UsaComboboxElement;
        'usa-multi-select': UsaMultiSelectElement;
        'mo-multi-select': UsaMultiSelectElement;
        'usa-textarea': UsaTextareaElement;
        'mo-textarea': UsaTextareaElement;
        'usa-search-field': UsaSearchFieldElement;
        'mo-search-field': UsaSearchFieldElement;
        'usa-form-stepper': UsaFormStepperElement;
        'mo-form-stepper': UsaFormStepperElement;
        'usa-number-stepper': UsaNumberStepperElement;
        'mo-number-stepper': UsaNumberStepperElement;
        'usa-password': UsaPasswordElement;
        'mo-password': UsaPasswordElement;
        'usa-range-slider': UsaRangeSliderElement;
        'mo-range-slider': UsaRangeSliderElement;
        'usa-consent': UsaConsentElement;
        'mo-consent': UsaConsentElement;
        'usa-cta-popup': UsaCtaPopupElement;
        'mo-cta-popup': UsaCtaPopupElement;
        'usa-validation-summary': UsaValidationSummaryElement;
        'mo-validation-summary': UsaValidationSummaryElement;
        'usa-gravity-well': UsaGravityWellElement;
        'mo-gravity-well': UsaGravityWellElement;
        'usa-liquid-metal': UsaLiquidMetalElement;
        'mo-liquid-metal': UsaLiquidMetalElement;
        'usa-reaction-field': UsaReactionFieldElement;
        'mo-reaction-field': UsaReactionFieldElement;
        'usa-ink-flow': UsaInkFlowElement;
        'mo-ink-flow': UsaInkFlowElement;
        'usa-fluid-type': UsaFluidTypeElement;
        'mo-fluid-type': UsaFluidTypeElement;
        'usa-magnetic-field': UsaMagneticFieldElement;
        'mo-magnetic-field': UsaMagneticFieldElement;
        'usa-elastic-mesh': UsaElasticMeshElement;
        'mo-elastic-mesh': UsaElasticMeshElement;
        'usa-spring-lab': UsaSpringLabElement;
        'mo-spring-lab': UsaSpringLabElement;
        'usa-bezier-lab': UsaBezierLabElement;
        'mo-bezier-lab': UsaBezierLabElement;
        'usa-text-loupe': UsaTextLoupeElement;
        'mo-text-loupe': UsaTextLoupeElement;
        'usa-revision-reveal': UsaRevisionRevealElement;
        'mo-revision-reveal': UsaRevisionRevealElement;
        'usa-hold-action': UsaHoldActionElement;
        'mo-hold-action': UsaHoldActionElement;
        'usa-scrub-number': UsaScrubNumberElement;
        'mo-scrub-number': UsaScrubNumberElement;
        'usa-flight-status': UsaFlightStatusElement;
        'mo-flight-status': UsaFlightStatusElement;
        'usa-transit-progress': UsaTransitProgressElement;
        'mo-transit-progress': UsaTransitProgressElement;
        'usa-sun-timeline': UsaSunTimelineElement;
        'mo-sun-timeline': UsaSunTimelineElement;
        'usa-delivery-tracker': UsaDeliveryTrackerElement;
        'mo-delivery-tracker': UsaDeliveryTrackerElement;
        'usa-glucose-sparkline': UsaGlucoseSparklineElement;
        'mo-glucose-sparkline': UsaGlucoseSparklineElement;
        'usa-coffee-timer': UsaCoffeeTimerElement;
        'mo-coffee-timer': UsaCoffeeTimerElement;
        'usa-vital-wave': UsaVitalWaveElement;
        'mo-vital-wave': UsaVitalWaveElement;
        'usa-orbit-pass': UsaOrbitPassElement;
        'mo-orbit-pass': UsaOrbitPassElement;
        'usa-meter-countdown': UsaMeterCountdownElement;
        'mo-meter-countdown': UsaMeterCountdownElement;
        'usa-race-telemetry': UsaRaceTelemetryElement;
        'mo-race-telemetry': UsaRaceTelemetryElement;
        'usa-workout-player': UsaWorkoutPlayerElement;
        'mo-workout-player': UsaWorkoutPlayerElement;
        'usa-status-pill': UsaStatusPillElement;
        'mo-status-pill': UsaStatusPillElement;
        'usa-ride-status': UsaRideStatusElement;
        'mo-ride-status': UsaRideStatusElement;
        'usa-route-sparkline': UsaRouteSparklineElement;
        'mo-route-sparkline': UsaRouteSparklineElement;
        'usa-activity-wall': UsaActivityWallElement;
        'mo-activity-wall': UsaActivityWallElement;
        'usa-luminous-switch': UsaLuminousSwitchElement;
        'mo-luminous-switch': UsaLuminousSwitchElement;
        'usa-particle-icon': UsaParticleIconElement;
        'mo-particle-icon': UsaParticleIconElement;
        'usa-particle-button': UsaParticleButtonElement;
        'mo-particle-button': UsaParticleButtonElement;
        'usa-halo-segmented': UsaHaloSegmentedElement;
        'mo-halo-segmented': UsaHaloSegmentedElement;
        'usa-halo-slider': UsaHaloSliderElement;
        'mo-halo-slider': UsaHaloSliderElement;
        'usa-orbit-progress': UsaOrbitProgressElement;
        'mo-orbit-progress': UsaOrbitProgressElement;
        'usa-carousel': UsaCarouselElement;
        'usa-mega-menu': UsaMegaMenuElement;
        'mo-mega-menu': UsaMegaMenuElement;
        'usa-nav-flyout': UsaNavFlyoutElement;
        'mo-nav-flyout': UsaNavFlyoutElement;
        'usa-fullscreen-menu': UsaFullscreenMenuElement;
        'mo-fullscreen-menu': UsaFullscreenMenuElement;
        'usa-breadcrumbs': UsaBreadcrumbsElement;
        'mo-breadcrumbs': UsaBreadcrumbsElement;
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

export { ALIGNMENTS, BACKDROP_PRESETS, CAROUSEL_EFFECTS, CUE_KINDS, DIVIDER_SHAPES, EMOJI, EMPTY_ICONS, EQ_PRESETS, FESTIVAL_THEMES, ICONS, ICON_CATEGORIES, ICON_GROUPS, ICON_MOTIONS, ICON_SVG_ATTRS, ICON_TRIGGERS, LOOK_FAMILIES, LOOK_FEELS, LOOK_PALETTES, LOOK_TREATMENTS, LOTTIE_ICONS, MENU_EFFECTS, MODAL_EFFECTS, NAV_INDICATORS, PARTICLE_DRAW_WGSL, PARTICLE_SIM_WGSL, PHYSICS_PRESETS, PIP_CORNERS, POST_PASSES, PRESENCE_STATES, PROGRESS_VARIANTS, RETRO_VARIANTS, RIVE_CDN, RIVE_PEER, SEGMENTED_VARIANTS, SHARE_TARGETS, SHEET_SIDES, SKELETON_VARIANTS, SPARK_VARIANTS, STRENGTH_WORDS, SWITCH_VARIANTS, TAB_INDICATORS, TIP_PLACEMENTS, TOAST_POSITIONS, TOGGLE_VARIANTS, WEATHER_CONDITIONS, WIDGETS, WIDGET_TAGS, WORKER_SCENES, WORKER_SCENE_FNS, addTags, adoptLooks, alignDigits, angleTo, applyLook, arcDash, backgroundCss, badgeProgress, badgeText, beamPath, burstPoints, cartTotal, cellMark, chainPath, changedSpan, circlePath, clampSplit, clampTo, clampWindow, cleanColor, cleanPathData, clearedShare, codeChars, compactCount, compareKeys, copyText, cornerPoint, cornerStep, counterText, cruise, dampedAt, dayNumber, dayText, deadZone, defineActivityWall, defineAddToCart, defineAlignSwitch, defineAnalogStick, defineAnnouncementBar, defineBadgeWall, defineBarChart, defineBarRace, defineBento, defineBezierLab, defineBgGenerator, defineBorderBeam, defineBounceButton, defineBreadcrumbs, defineBreathOrb, defineBulgeVolume, defineBulletChart, defineCalendarStrip, defineCarousel, defineCartBadge, defineCartDrawer, defineCenterBars, defineChapterNav, defineChatComposer, defineChecklist, defineChipInput, defineCircularText, defineClockControl, defineClothesline, defineCodeExport, defineCodeShake, defineCodeTabs, defineCoffeeTimer, defineColorPicker, defineColorSwatches, defineCombobox, defineCommandPalette, defineCommentThread, defineCompare, defineComparisonTable, defineConnectBeam, defineConsent, defineContextMenu, defineContourRelief, defineCopyButton, defineCountdown, defineCtaPopup, defineCubeGallery, defineCutReveal, defineDataTable, defineDatePicker, defineDeliveryTracker, defineDesktopWindows, defineDiffViewer, defineDisclosure, defineDock, defineDonutChart, defineDotPlot, defineDownloadButton, defineDownloadMenu, defineEclipseToggle, defineElasticAccordion, defineElasticFrame, defineElasticMesh, defineElasticScroll, defineElasticSlider, defineEmojiPicker, defineEmptyState, defineEqualizer, defineExpandCards, defineFanCarousel, defineFestivalBanner, defineField, defineFileDrop, defineFileTree, defineFilterChips, defineFlightStatus, defineFlingMarquee, defineFluidType, defineFormStepper, defineFullscreenMenu, defineFunnelChart, defineGantt, defineGauge, defineGenArt, defineGestureSticker, defineGlScene, defineGlobe, defineGlucoseSparkline, defineGpuParticles, defineGravityWell, defineGrooveToggle, defineGyroCard, defineHaloSegmented, defineHaloSlider, defineHeatmap, defineHelpfulVote, defineHeroVideo, defineHoldAction, defineHorizontalScroll, defineHotspots, defineHoverCard, defineHoverRevealList, defineHudPanel, defineHueOrbit, defineHydrate, defineIcon, defineIconPicker, defineImageTrail, defineImageTunnel, defineInfiniteScroll, defineInfinityLoop, defineInkFlow, defineInlineEdit, defineInstallButton, defineIrisDiaphragm, defineJellyButton, defineJsonViewer, defineKanban, defineKeyframeEditor, defineKpi, defineLeaderboard, defineLensStack, defineLetterSwap, defineLightbox, defineLineChart, defineLiquidGlass, defineLiquidMetal, defineLiquidNav, defineLocationCard, defineLottie, defineLottieIcon, defineLottiePlayer, defineLuminousSwitch, defineLyrics, defineMagnetLines, defineMagneticField, defineMasonryFlow, defineMegaMenu, defineMentionInput, defineMenu, defineMenuToggle, defineMessageList, defineMeteors, defineMeterCountdown, defineMicro, defineMicroButton, defineMicroCheckbox, defineMicroInput, defineMicroSegmented, defineMicroSlider, defineMicroStepper, defineMicroSwitch, defineMilestones, defineModal, defineMorphCard, defineMotion, defineMotionInspector, defineMotionPrefs, defineMotionPrompt, defineMotionSpec, defineMultiSelect, defineMusicPlayer, defineNativePreview, defineNavFlyout, defineNavMorph, defineNotchSlider, defineNotificationBell, defineNumberStepper, defineOdometer, defineOrbitGallery, defineOrbitPass, defineOrbitProgress, defineOrbitRings, defineOrganicCard, defineOtp, definePageFlip, definePagination, definePanorama, defineParallaxLayers, defineParticleButton, defineParticleIcon, definePassword, definePathMotion, definePauseAll, definePerfMonitor, definePhysicsPlayground, definePixelTransition, definePlanPicker, definePluginCard, definePluginStore, definePresence, definePricing, definePrizeWheel, defineProductGallery, defineProgressRing, defineProgressTabs, definePropPanel, definePullCord, defineQuarterRing, defineRaceTelemetry, defineRadar, defineRadialBars, defineRadialMenu, defineRangeSlider, defineRatingBars, defineReactionField, defineReactions, defineReadMore, defineRedEnvelope, defineRetroButton, defineRetroGrid, defineRevealFooter, defineRevisionReveal, defineRideStatus, defineRippleGrid, defineRive, defineRouteSparkline, defineRouteTransition, defineScene, defineScratchCard, defineScrollBg, defineScrollCue, defineScrollRing, defineScrollScene, defineScrollVelocity, defineScrollZoom, defineScrollspy, defineScrubNumber, defineSearchBar, defineSearchField, defineSegmented, defineSelect, defineShaderBackdrop, defineShapeDivider, defineShareButton, defineSheet, defineShortcut, defineShuffleGrid, defineSidebar, defineSignaturePad, defineSixDotOrbit, defineSkeletonReveal, defineSketchChart, defineSlideConfirm, defineSlopeChart, defineSmoothScroll, defineSortableList, defineSparkline, defineSpatialCard, defineSplitFlap, defineSplitPane, defineSpringAccordion, defineSpringChain, defineSpringCode, defineSpringCollapse, defineSpringCopy, defineSpringCounter, defineSpringIsland, defineSpringLab, defineSpringLike, defineSpringList, defineSpringPager, defineSpringPeek, defineSpringPip, defineSpringRating, defineSpringScrollbar, defineSpringSheet, defineSpringStack, defineSpringSwipe, defineSpringTags, defineSpringToasts, defineSquishIndicator, defineSquishKey, defineSquishStepper, defineStackSlider, defineStarRating, defineStatusPill, defineStepTrack, defineStepper, defineStickyCta, defineStickyWall, defineStories, defineStrengthMeter, defineSubscribe, defineSuggestionChips, defineSunTimeline, defineSweepLines, defineSwipeDeck, defineSwitch, defineTabBar, defineTadaButton, defineTagCloud, defineTerminal, defineTextLoupe, defineTextPressure, defineTextReveal, defineTextSplitter, defineTextarea, defineThemeSurface, defineThemeSwitcher, defineThreeDotBounce, defineTileRelay, defineTimePicker, defineTip, defineTitleSequence, defineToastStack, defineToggleGroup, defineTokenEditor, defineTour, defineTransferButton, defineTransitProgress, defineTreemap, defineTriplePulse, defineUploadProgress, defineValidationSummary, defineVideoCard, defineVirtualList, defineVitalWave, defineVoiceButton, defineVolumeKnob, defineWaffleChart, defineWeatherCard, defineWheelPicker, defineWidgets, defineWifiSignal, defineWorkerCanvas, defineWorkoutPlayer, defineXpBar, defineZoomLens, describeComponent, diffLines, digitsOf, dividerPath, donutArcs, dropIndex, elasticPath, exportComponent, fanPose, filterEmoji, flapSteps, flip, formatBytes, formatDistance, formatTime, frameValues, frontIndex, funnelRows, fuzzyMatch, ganttSpan, gridStep, haversine, heatLevel, hexToHsv, hour12, hsvToHex, hueColor, iconCategory, iconCopyText, iconElement, iconNames, iconParts, iconSvg, initials, inkOn, invertRect, isEmail, islandShape, jsonPath, keyLabels, labelAt, lensOffset, levelFor, linePath, linesHeight, linkSize, loadRiveRuntime, lookInfo, lookNames, lookRule, lookTokens, looksCss, luminance, matchNames, matchSuggestions, matchesKeys, measure, mentionQuery, meteorAt, monthGrid, moveItem, niceTicks, numbers, openSet, orbitAngle, pageAfter, pageWindow, parseChips, parseCorner, parseDay, parseISODate, parseLRC, parseMarkers, parseOptions, parsePlans, parseProps, parseReactions, parseScrub, parseSeries, parseSnaps, parseTags, parseTargets, passwordScore, passwordStrength, percentLabel, pilePose, pipCorner, placeMenu, pressureAt, project, provideRiveRuntime, raceRanks, radialSpots, rankRows, ratingAt, ratingSummary, relativeChange, relayOrder, replyCount, revealPieces, ringDash, ringRadius, rippleAt, riseProgress, rovingIndex, rowDiffers, safeImageUrl, sagAt, sanitizeCode, scrollForThumb, searchIcons, sectionAt, seeded, shareUrl, sheetRest, shiftFor, shuffleOrder, signedNumbers, slideOutcome, slotAt, sortKey, sparkPoints, splitChips, splitTime, spreadLabels, squarify, stackLayout, stackPose, stackToast, starFill, stepTime, stripClips, strokeWidth, swingStep, swipeOpen, tagSize, thumbMetrics, timeParts, tourPlace, trackOffset, tunnelPose, turnAngle, tween, velocityAmount, viewportHeight, virtualWindow, waffleCells, watchViewport, waveBars, weekStartOf, wheelAngle, wheelIndex, wheelTilt, wrapIndex, wrapOffset, zoomAt };
export type { Alignment, BellNotice, BillingPeriod, BreadcrumbItem, CartItem, ChatMessage, CutStyle, DiffLine, DividerShape, EmojiEntry, ExportFormat, ExportedNode, FormChoice, FormIssue, GlobeMarker, IconCategory, IconMotion, IconPart, IconTrigger, LeaderRow, LookFamily, LookInfo, LookPalette, MicroButtonState, PaletteCommand, PerfStats, PipCorner, PlanOption, PresenceState, PropSpec, RadarTarget, SearchProvider, SearchResult, ShareTarget, SortDirection, SpringToastOptions, StackToastOptions, StickerState, UsaActivityWallElement, UsaAddToCartElement, UsaAlignSwitchElement, UsaAnalogStickElement, UsaAnnouncementBarElement, UsaBadgeWallElement, UsaBarChartElement, UsaBarRaceElement, UsaBentoElement, UsaBezierLabElement, UsaBgGeneratorElement, UsaBorderBeamElement, UsaBounceButtonElement, UsaBreadcrumbsElement, UsaBreathOrbElement, UsaBulgeVolumeElement, UsaBulletChartElement, UsaCalendarStripElement, UsaCarouselElement, UsaCartBadgeElement, UsaCartDrawerElement, UsaCenterBarsElement, UsaChapterNavElement, UsaChatComposerElement, UsaChecklistElement, UsaChipInputElement, UsaCircularTextElement, UsaClockControlElement, UsaClotheslineElement, UsaCodeExportElement, UsaCodeShakeElement, UsaCodeTabsElement, UsaCoffeeTimerElement, UsaColorPickerElement, UsaColorSwatchesElement, UsaComboboxElement, UsaCommandPaletteElement, UsaCommentThreadElement, UsaCompareElement, UsaComparisonTableElement, UsaConnectBeamElement, UsaConsentElement, UsaContextMenuElement, UsaContourReliefElement, UsaCopyButtonElement, UsaCountdownElement, UsaCtaPopupElement, UsaCubeGalleryElement, UsaCutRevealElement, UsaDataTableElement, UsaDatePickerElement, UsaDeliveryTrackerElement, UsaDesktopWindowsElement, UsaDiffViewerElement, UsaDisclosureElement, UsaDockElement, UsaDonutChartElement, UsaDotPlotElement, UsaDownloadButtonElement, UsaEclipseToggleElement, UsaElasticAccordionElement, UsaElasticFrameElement, UsaElasticMeshElement, UsaElasticScrollElement, UsaElasticSliderElement, UsaEmojiPickerElement, UsaEmptyStateElement, UsaEqualizerElement, UsaExpandCardsElement, UsaFanCarouselElement, UsaFestivalBannerElement, UsaFieldElement, UsaFileDropElement, UsaFilterChipsElement, UsaFlightStatusElement, UsaFlingMarqueeElement, UsaFluidTypeElement, UsaFormStepperElement, UsaFullscreenMenuElement, UsaFunnelChartElement, UsaGanttElement, UsaGaugeElement, UsaGenArtElement, UsaGestureStickerElement, UsaGlSceneElement, UsaGlobeElement, UsaGlucoseSparklineElement, UsaGpuParticlesElement, UsaGravityWellElement, UsaGrooveToggleElement, UsaGyroCardElement, UsaHaloSegmentedElement, UsaHaloSliderElement, UsaHeatmapElement, UsaHelpfulVoteElement, UsaHeroVideoElement, UsaHoldActionElement, UsaHorizontalScrollElement, UsaHotspotsElement, UsaHoverCardElement, UsaHoverRevealListElement, UsaHudPanelElement, UsaHueOrbitElement, UsaHydrateElement, UsaIconElement, UsaIconPickerElement, UsaImageTrailElement, UsaImageTunnelElement, UsaInfiniteScrollElement, UsaInfinityLoopElement, UsaInkFlowElement, UsaInlineEditElement, UsaInstallButtonElement, UsaIrisDiaphragmElement, UsaJellyButtonElement, UsaJsonViewerElement, UsaKanbanElement, UsaKeyframeEditorElement, UsaKpiElement, UsaLeaderboardElement, UsaLensStackElement, UsaLetterSwapElement, UsaLightboxElement, UsaLineChartElement, UsaLiquidGlassElement, UsaLiquidMetalElement, UsaLiquidNavElement, UsaLocationCardElement, UsaLottieElement, UsaLottieIconElement, UsaLottiePlayerElement, UsaLuminousSwitchElement, UsaLyricsElement, UsaMagnetLinesElement, UsaMagneticFieldElement, UsaMasonryFlowElement, UsaMegaMenuElement, UsaMentionInputElement, UsaMenuElement, UsaMenuToggleElement, UsaMessageListElement, UsaMeteorsElement, UsaMeterCountdownElement, UsaMicroButtonElement, UsaMicroCheckboxElement, UsaMicroElement, UsaMicroInputElement, UsaMicroSegmentedElement, UsaMicroSliderElement, UsaMicroStepperElement, UsaMicroSwitchElement, UsaMilestonesElement, UsaModalElement, UsaMorphCardElement, UsaMotionElement, UsaMotionInspectorElement, UsaMotionPrefsElement, UsaMotionPromptElement, UsaMotionSpecElement, UsaMultiSelectElement, UsaMusicPlayerElement, UsaNativePreviewElement, UsaNavFlyoutElement, UsaNavMorphElement, UsaNotchSliderElement, UsaNotificationBellElement, UsaNumberStepperElement, UsaOdometerElement, UsaOrbitGalleryElement, UsaOrbitPassElement, UsaOrbitProgressElement, UsaOrbitRingsElement, UsaOrganicCardElement, UsaOtpElement, UsaPageFlipElement, UsaPaginationElement, UsaPanoramaElement, UsaParallaxLayersElement, UsaParticleButtonElement, UsaParticleIconElement, UsaPasswordElement, UsaPathMotionElement, UsaPauseAllElement, UsaPerfMonitorElement, UsaPhysicsPlaygroundElement, UsaPixelTransitionElement, UsaPlanPickerElement, UsaPluginCardElement, UsaPluginStoreElement, UsaPresenceElement, UsaPricingElement, UsaPrizeWheelElement, UsaProductGalleryElement, UsaProgressRingElement, UsaProgressTabsElement, UsaPropPanelElement, UsaPullCordElement, UsaQuarterRingElement, UsaRaceTelemetryElement, UsaRadarElement, UsaRadialBarsElement, UsaRadialMenuElement, UsaRangeSliderElement, UsaRatingBarsElement, UsaReactionFieldElement, UsaReactionsElement, UsaReadMoreElement, UsaRedEnvelopeElement, UsaRetroButtonElement, UsaRetroGridElement, UsaRevealFooterElement, UsaRevisionRevealElement, UsaRideStatusElement, UsaRippleGridElement, UsaRiveElement, UsaRouteSparklineElement, UsaRouteTransitionElement, UsaSceneElement, UsaScratchCardElement, UsaScrollBgElement, UsaScrollCueElement, UsaScrollRingElement, UsaScrollSceneElement, UsaScrollVelocityElement, UsaScrollZoomElement, UsaScrollspyElement, UsaScrubNumberElement, UsaSearchBarElement, UsaSearchFieldElement, UsaSegmentedElement, UsaSelectElement, UsaShaderBackdropElement, UsaShapeDividerElement, UsaShareButtonElement, UsaSheetElement, UsaShortcutElement, UsaShuffleGridElement, UsaSidebarElement, UsaSignaturePadElement, UsaSixDotOrbitElement, UsaSkeletonRevealElement, UsaSketchChartElement, UsaSlideConfirmElement, UsaSlopeChartElement, UsaSmoothScrollElement, UsaSortableListElement, UsaSparklineElement, UsaSpatialCardElement, UsaSplitFlapElement, UsaSplitPaneElement, UsaSpringAccordionElement, UsaSpringChainElement, UsaSpringCodeElement, UsaSpringCollapseElement, UsaSpringCopyElement, UsaSpringCounterElement, UsaSpringIslandElement, UsaSpringLabElement, UsaSpringLikeElement, UsaSpringListElement, UsaSpringPagerElement, UsaSpringPeekElement, UsaSpringPipElement, UsaSpringRatingElement, UsaSpringScrollbarElement, UsaSpringSheetElement, UsaSpringStackElement, UsaSpringSwipeElement, UsaSpringTagsElement, UsaSpringToastsElement, UsaSquishIndicatorElement, UsaSquishKeyElement, UsaSquishStepperElement, UsaStackSliderElement, UsaStarRatingElement, UsaStatusPillElement, UsaStepTrackElement, UsaStepperElement, UsaStickyCtaElement, UsaStickyWallElement, UsaStoriesElement, UsaStrengthMeterElement, UsaSubscribeElement, UsaSuggestionChipsElement, UsaSunTimelineElement, UsaSweepLinesElement, UsaSwipeDeckElement, UsaSwitchElement, UsaTabBarElement, UsaTadaButtonElement, UsaTagCloudElement, UsaTerminalElement, UsaTextLoupeElement, UsaTextPressureElement, UsaTextRevealElement, UsaTextSplitterElement, UsaTextareaElement, UsaThemeSurfaceElement, UsaThemeSwitcherElement, UsaThreeDotBounceElement, UsaTileRelayElement, UsaTimePickerElement, UsaTipElement, UsaToastStackElement, UsaToggleGroupElement, UsaTokenEditorElement, UsaTourElement, UsaTransferButtonElement, UsaTransitProgressElement, UsaTreemapElement, UsaTriplePulseElement, UsaUploadProgressElement, UsaValidationSummaryElement, UsaVideoCardElement, UsaVirtualListElement, UsaVitalWaveElement, UsaVoiceButtonElement, UsaVolumeKnobElement, UsaWaffleChartElement, UsaWeatherCardElement, UsaWheelPickerElement, UsaWifiSignalElement, UsaWorkerCanvasElement, UsaWorkoutPlayerElement, UsaXpBarElement, UsaZoomLensElement, VelocityMode, WallBadge };
