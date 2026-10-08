/**
 * Members shared by every `<usa-*>` element. Attribute helpers, a cleanup
 * bag that is emptied on disconnect, and motion helpers that degrade to the
 * final state without WAAPI or under reduced motion.
 */
interface UsaElement extends HTMLElement {
    /** `true` while reduced motion applies to this element. */
    readonly reduced: boolean;
}

declare const CLICK_EFFECTS: readonly ["ripple", "burst", "confetti", "squish", "press-spring", "shake"];
type ClickEffect = (typeof CLICK_EFFECTS)[number];
/**
 * `<usa-click>` — click / tap effects on whatever it wraps (combinable:
 * `effect="press-spring burst"`).
 *
 * - `ripple` — an ink wave from the pointer (enhanced: `color`, soft edge);
 * - `burst` — particles radiating from the pointer (`shape`: circle, square, star, heart, emoji);
 * - `confetti` — a confetti cannon from the click point;
 * - `squish` — squash on press, stretch on release (spring);
 * - `press-spring` — dips while pressed, springs back with overshoot;
 * - `shake` — horizontal error shake; plays on `invalid` events from a form
 *   inside, on `shake()`, or on click when `trigger="click"`.
 *
 * Attributes: `effect`, `color`, `shape`, `count`, `haptic` (vibrate ms,
 * where supported), `disabled`. Keyboard (Space/Enter) triggers the effects
 * from the centre. Reduced motion: no particles or movement; press dims.
 */
interface UsaClickElement extends UsaElement {
    readonly effects: string[];
    play(x?: number, y?: number): void;
    shake(): void;
}
declare function defineClick(tag?: string): CustomElementConstructor | undefined;

declare const BUTTON_DEFORMS: readonly ["squash", "wobble", "gooey", "dent"];
type ButtonDeform = (typeof BUTTON_DEFORMS)[number];
type ButtonShape = 'pill' | 'circle' | 'icon';
type ButtonState = 'idle' | 'loading' | 'success' | 'error';
/**
 * `<usa-button>` — **button click deformation** (按钮点击形变) around a
 * native `<button>` (or `<a>`) child — or the element itself becomes a button.
 *
 * `deform` (combinable, e.g. `deform="squash wobble"`):
 * - `squash` — squash on press, stretch-and-settle on release (spring);
 * - `wobble` — elastic border-radius wobble after a click;
 * - `gooey` — liquid blob: droplets squeeze out from the press point and
 *   merge back (SVG goo filter);
 * - `dent` — the surface dents toward the pressed point (3D tilt + inner shade).
 *
 * `shape="pill | circle | icon"` morphs the outline with a spring (label =
 * `[data-label]`, icon = `[data-icon]` children); `morphTo(shape)`.
 *
 * `morph="submit"` — click → `loading` (shrinks to a circle with a spinner,
 * `aria-busy`), then `success` (check) or `error` (shake + cross), and back
 * to `idle` after `reset` ms (1800). Drive it with `state="…"` / `.state`, or
 * call `event.detail.done(ok)` from a `usa:submit` listener.
 *
 * Attributes: `deform`, `shape`, `morph`, `state`, `reset`, `haptic`,
 * `disabled`. Events: `usa:submit`, `usa:state`. Reduced motion: no
 * deformation; shape and state changes are instant; status still announced.
 */
interface UsaButtonElement extends UsaElement {
    readonly target: HTMLElement;
    shape: ButtonShape;
    state: ButtonState;
    morphTo(shape: ButtonShape): Promise<void>;
}
declare function defineButton(tag?: string): CustomElementConstructor | undefined;

type Pt = [number, number];
type Quad = [Pt, Pt, Pt, Pt];
/**
 * Morphable icons: every icon is three quads (four points each) on a 24×24
 * grid, so any icon can morph into any other by interpolating points.
 */
declare const MORPH_ICONS: Record<string, [Quad, Quad, Quad]>;
/** SVG path data for an icon, or for the interpolation `t` (0–1) between two. */
declare function morphPath(from: string, to?: string, t?: number): string;
/**
 * `<usa-icon-morph>` — an icon that morphs between shapes with a spring:
 * play ↔ pause, menu ↔ close, plus ↔ minus, check, arrow-right…
 *
 * Attributes: `icons` (comma list, cycled; default `play,pause`), `index`
 * (current, 0), `size` (px, 24), `toggle` (makes it a button that cycles
 * on click / Enter / Space), `labels` (comma list of accessible names per
 * icon, e.g. `Play,Pause`), `preset` (spring, `wobbly`). Methods:
 * `next()`, `show(nameOrIndex)`. Events: `usa:change` (`{ index, icon }`).
 * Inside a `<usa-button>` or `<button>` it is decorative. Reduced motion:
 * the icon switches instantly.
 */
interface UsaIconMorphElement extends UsaElement {
    index: number;
    readonly icon: string;
    next(): void;
    show(icon: string | number): void;
}
declare function defineIconMorph(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-like>` — a like / favourite toggle: the heart pops with a spring and
 * bursts into particles when liked. `role="button"` + `aria-pressed`.
 *
 * Attributes: `liked`, `count` (shown next to the heart, updated ±1),
 * `label` (accessible name, default "Like"), `color`, `size` (px, 24),
 * `haptic`, `disabled`. Events: `change`, `usa:change` (`{ liked, count }`).
 * Reduced motion: colour change only.
 */
interface UsaLikeElement extends UsaElement {
    liked: boolean;
    count: number | null;
    toggle(force?: boolean): void;
}
declare function defineLike(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-hold>` — hold-to-confirm: press and hold (pointer, Space or Enter)
 * while a progress ring fills; releasing early rewinds it. Good for
 * destructive actions.
 *
 * Attributes: `duration` (ms, 1200), `label` (accessible name), `color`,
 * `disabled`. CSS variable `--usa-hold` (0–1). Events: `usa:progress`,
 * `usa:confirm`, `usa:cancel`. Reduced motion: same timing, the ring fills
 * without the scale pulse.
 */
interface UsaHoldElement extends UsaElement {
    readonly progress: number;
    cancel(): void;
}
declare function defineHold(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-double-tap>` — detects a double tap / double click on its content
 * (photos, posts) and pops a heart (or `icon`) at the tap point.
 *
 * Attributes: `icon` (text / emoji, default ♥), `color`, `delay` (max ms
 * between taps, 300), `haptic`, `disabled`. Events: `usa:double-tap`
 * (`{ x, y }`, element-relative). Keyboard users: press `L` while focused.
 * Reduced motion: the icon fades in and out without scaling or particles.
 */
interface UsaDoubleTapElement extends UsaElement {
    pop(x?: number, y?: number): void;
}
declare function defineDoubleTap(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-checkbox>` — an animated, form-associated checkbox: the box springs
 * and the check mark draws itself. `role="checkbox"` + `aria-checked`
 * (`mixed` with `indeterminate`).
 *
 * Attributes: `checked`, `indeterminate`, `disabled`, `name`, `value`
 * (`on`), `label`, `shape` (`square` default, `circle`). Events: `change`,
 * `usa:change` (`{ checked }`). Reduced motion: no spring or drawing.
 */
interface UsaCheckboxElement extends UsaElement {
    checked: boolean;
    indeterminate: boolean;
    toggle(force?: boolean): void;
}
declare function defineCheckbox(tag?: string): CustomElementConstructor | undefined;

interface BurstOptions {
    /** Number of particles (default 12). */
    count?: number;
    /** Colours to pick from (default: accent palette). */
    colors?: string[];
    /** Travel distance in px (default 48). */
    distance?: number;
    /** Particle size in px (default 6). */
    size?: number;
    /** `circle` (default), `square`, `star`, `heart` or any text / emoji. */
    shape?: 'circle' | 'square' | 'star' | 'heart' | string;
    /** Duration in ms (default 600). */
    duration?: number;
}
interface ConfettiOptions {
    /** Origin in client px (default: centre-bottom third of the viewport). */
    x?: number;
    y?: number;
    /** Pieces (default 80). */
    count?: number;
    /** Spread angle in degrees (default 70). */
    spread?: number;
    /** Launch speed multiplier (default 1). */
    velocity?: number;
    colors?: string[];
    /** Duration in ms (default 1600). */
    duration?: number;
}
/** `navigator.vibrate()` where supported (Android Chrome, some WebViews). Returns whether it ran. */
declare function haptic(pattern?: number | number[]): boolean;

/**
 * use-scroll-animate/components/click — click & tap effects (v2.5).
 * `<usa-click>` (ripple, burst, confetti, squish, press-spring, shake),
 * `<usa-button>` (button click deformation: squash, wobble, gooey, dent;
 * shape morph; submit → loading → success), `<usa-icon-morph>`,
 * `<usa-like>`, `<usa-hold>`, `<usa-double-tap>`, `<usa-checkbox>`, plus
 * `haptic()`. 6.0: `burst()`, `confetti()` and `shake()` were removed — play
 * the registered effects instead: `playEffect(el, 'burst' | 'confetti' | 'shake')`.
 */

/** Register every component of this category under its default tag. */
declare function defineClickComponents(): void;
declare global {
    interface HTMLElementTagNameMap {
        'usa-click': UsaClickElement;
        'usa-button': UsaButtonElement;
        'usa-icon-morph': UsaIconMorphElement;
        'usa-like': UsaLikeElement;
        'usa-hold': UsaHoldElement;
        'usa-double-tap': UsaDoubleTapElement;
        'usa-checkbox': UsaCheckboxElement;
    }
}

export { BUTTON_DEFORMS, CLICK_EFFECTS, MORPH_ICONS, defineButton, defineCheckbox, defineClick, defineClickComponents, defineDoubleTap, defineHold, defineIconMorph, defineLike, haptic, morphPath };
export type { BurstOptions, ButtonDeform, ButtonShape, ButtonState, ClickEffect, ConfettiOptions, UsaButtonElement, UsaCheckboxElement, UsaClickElement, UsaDoubleTapElement, UsaHoldElement, UsaIconMorphElement, UsaLikeElement };
