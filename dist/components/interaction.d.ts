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
 * `<usa-ripple>` — an ink ripple from the pointer (or the centre, for
 * keyboard presses) on whatever it wraps: buttons, list items, cards.
 *
 * Attributes: `color` (default `currentColor`), `opacity` (0.22),
 * `duration` (ms, 550), `centered`, `disabled`. Clips its content to its
 * own border radius. Reduced motion: a brief highlight instead of the wave.
 */
interface UsaRippleElement extends UsaElement {
    /** Spawn a ripple at client coordinates (default: centre). */
    ripple(x?: number, y?: number): void;
}
declare function defineRipple(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-magnetic>` — its content leans toward the pointer when the pointer
 * comes near, and springs back when it leaves (great for CTAs and icons).
 *
 * Attributes: `strength` (0–1 share of the pointer offset, 0.35), `radius`
 * (px of attraction beyond the element's edge, 60), `disabled`. Only on
 * devices with a fine pointer that hovers; off under reduced motion.
 * Writes one `transform` per frame through `--usa-mx` / `--usa-my`.
 *
 * 17.9: `release="spring"` — when the pointer leaves, the content springs home from where it was, carrying the speed
 * the pointer left with (a fast exit overshoots a little and settles, a slow one glides back). The default (`ease`)
 * keeps the CSS transition.
 */
type UsaMagneticElement = UsaElement;
declare function defineMagnetic(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-tilt>` — a 3D card that tilts toward the pointer, with an optional
 * glare highlight that follows it.
 *
 * Attributes: `max` (deg, 10), `scale` (1.03 while hovered), `perspective`
 * (px, 900), `glare` (add the light reflection), `reverse` (tilt away),
 * `disabled`. Off under reduced motion. Exposes `--usa-tilt-x` /
 * `--usa-tilt-y` (−1…1) for parallax layers inside the card.
 */
type UsaTiltElement = UsaElement;
declare function defineTilt(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-spotlight>` — the Windows Fluent "Reveal highlight": a soft light
 * follows the pointer across a group of items, lighting up their borders
 * (even of neighbours) and the background of the hovered one. Put buttons,
 * tiles or menu items inside; each direct child is an item (or mark items
 * with `data-spotlight` to pick them yourself).
 *
 * Attributes: `size` (px, radius of the light, 160), `color` (default a
 * translucent white), `border` (px width of the lit border, 1),
 * `no-fill` (only light the borders). Not a motion effect, so it stays on
 * under reduced motion; off on touch-only devices.
 */
type UsaSpotlightElement = UsaElement;
declare function defineSpotlight(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-press>` — tactile press feedback: content dips while pressed and
 * springs back on release (the Fluent "pointer down" scale), or bounces once
 * on click with `bounce`.
 *
 * Attributes: `scale` (pressed scale, 0.95), `bounce` (overshoot on
 * release), `disabled`. Works with mouse, touch, pen and Space/Enter.
 * Reduced motion: a subtle dim instead of scaling.
 */
interface UsaPressElement extends UsaElement {
    readonly pressed: boolean;
}
declare function definePress(tag?: string): CustomElementConstructor | undefined;

type SpringPreset = 'default' | 'gentle' | 'wobbly' | 'stiff' | 'bouncy' | 'slow' | 'molasses';

/**
 * 17.16 — the spring core of the micro-interaction system.
 *
 * - **Exact:** springs are solved in closed form (under-, critically and over-damped), so a value is the same at
 *   30, 60 or 144 Hz and never drifts or explodes on a long frame. The older `createSpring()` (v2.3, numeric steps)
 *   stays as it was.
 * - **Perceptual:** a spring can be given as `{ duration, bounce }` (response time in ms and how much it overshoots,
 *   -1…1) instead of stiffness / damping / mass; `springFromFeel()` and `springFeel()` convert both ways.
 * - **Tuned:** `MICRO_SPRINGS` holds sixteen springs for the roles of a micro-interaction (press, release, hover,
 *   toggle, drag, settle, pop, jelly …), and `MICRO_FEELS` seven feels that retune all of them at once
 *   (`crisp`, `snappy`, `smooth`, `bouncy`, `playful`, `calm`, `heavy`).
 * - **Interruptible:** `createSpringGroup()` animates several named values on one frame loop. Retargeting keeps the
 *   current velocity, `impulse()` adds velocity (a flick, a shake, a pop), and every channel can use its own spring.
 *   Under reduced motion values jump to their targets and impulses do nothing.
 */
/** A spring as response time and bounce. `duration` in ms (default 400); `bounce` from -1 (overdamped) to 1 (default 0). */
interface SpringFeel {
    duration?: number;
    bounce?: number;
}
/** Stiffness (N/m), damping (N·s/m) and mass (kg). */
interface SpringPhysics {
    stiffness: number;
    damping: number;
    mass: number;
}
type MicroSpring = 'instant' | 'snappy' | 'smooth' | 'gentle' | 'bouncy' | 'elastic' | 'press' | 'release' | 'hover' | 'toggle' | 'drag' | 'settle' | 'pop' | 'jelly' | 'heavy' | 'feather';
type MicroFeel = 'crisp' | 'snappy' | 'smooth' | 'bouncy' | 'playful' | 'calm' | 'heavy';
type MicroSpringInput = MicroSpring | SpringPreset | SpringFeel | SpringPhysics | string | undefined | null;
interface SpringGroup {
    readonly values: Record<string, number>;
    readonly animating: boolean;
    get(name: string): number;
    /** Velocity of a channel, in units per second. */
    velocity(name: string): number;
    target(name: string): number;
    /** Animate channels to new targets. `velocity` replaces their velocity; `spring` sets their spring from now on. */
    set(targets: Record<string, number>, opts?: {
        velocity?: Record<string, number>;
        spring?: MicroSpringInput;
    }): void;
    /** Add velocity (units/s) to channels; they spring back to their targets. Optionally with a one-off spring. */
    impulse(velocities: Record<string, number>, spring?: MicroSpringInput): void;
    /** Move channels at once, with no motion. */
    jump(values: Record<string, number>): void;
    /** Change the default spring, feel or speed (running channels keep theirs until set again). */
    configure(opts: {
        spring?: MicroSpringInput;
        feel?: MicroFeel | string | null;
        speed?: number;
    }): void;
    /** Stop every channel where it is. */
    stop(): void;
}

/**
 * 17.16 micro-interaction engine. `micro(el, 'press hover glow')` gives any element spring-driven feedback; every
 * behaviour writes into one spring group per element and one `transform` per frame, so press, hover, tilt, a magnet
 * pull and a shake all add up instead of fighting over the same property. `data-mo-micro="…"` + `applyMicro()` does
 * the same from markup, and `<mo-micro>` wraps any content.
 *
 * Behaviours: `press` (dips and springs back with a little overshoot), `hover` (grows a touch), `lift` (rises with a
 * deepening shadow), `magnetic` (leans toward the pointer and snaps back keeping the pointer's speed), `tilt`
 * (3D tilt toward the pointer), `glow` (a light that follows the pointer, in the look's accent), `squish`
 * (squashes while pressed and wobbles back), `drag` (1:1 drag with rubber-band bounds, a flick that keeps its
 * speed, and grid snapping; arrow keys move it when focused) and `focus` (a focus ring that springs in).
 *
 * Feedback impulses (`feedback(el, kind)`): `shake`, `nod`, `pop`, `wiggle`, `jelly`, `nudge`, `bump`,
 * `attention`. They add velocity to the same springs, so they mix with whatever the element is already doing.
 *
 * The feel comes from `opts.feel`, the closest `[data-mo-feel]` or the `--mo-feel` custom property; a look's
 * `--mo-kit-speed` speeds it up or slows it down. Reduced motion: nothing moves; feedback shows a short outline in
 * the look's ok / bad / accent colour instead.
 */
type MicroBehavior = 'press' | 'hover' | 'lift' | 'magnetic' | 'tilt' | 'glow' | 'squish' | 'drag' | 'focus';
declare const MICRO_BEHAVIORS: readonly MicroBehavior[];
type MicroFeedback = 'shake' | 'nod' | 'pop' | 'wiggle' | 'jelly' | 'nudge' | 'bump' | 'attention';
declare const MICRO_FEEDBACK: readonly MicroFeedback[];
interface MicroOptions {
    /** Feel for every spring (`crisp`, `snappy`, `smooth`, `bouncy`, `playful`, `calm`, `heavy`). */
    feel?: MicroFeel | string | null;
    /** Replace every role spring with one spring (preset name, `"380ms 0.3"`, `{ duration, bounce }` …). */
    spring?: MicroSpringInput;
    /** Short vibrations on press and feedback where the device supports them (off by default). */
    haptics?: boolean;
    /** Pressed scale (default 0.96). */
    pressScale?: number;
    /** Hover scale (default 1.03). */
    hoverScale?: number;
    /** Lift in px (default 4). */
    lift?: number;
    /** Magnet pull, 0–1 of the pointer offset (default 0.35). */
    strength?: number;
    /** Farthest magnet pull in px (default 14). */
    reach?: number;
    /** Largest tilt in degrees (default 8). */
    tilt?: number;
    /** Drag bounds: `'parent'` (default), `'none'` or an element. */
    bounds?: 'parent' | 'none' | Element;
    /** Drag snapping grid in px (default none). */
    snap?: number;
    /** Drag axis (default `'both'`). */
    axis?: 'x' | 'y' | 'both';
    /** Ignore pointer and keys (feedback still plays). */
    disabled?: boolean;
    onPress?: () => void;
    onRelease?: () => void;
    onDragEnd?: (pos: {
        x: number;
        y: number;
    }) => void;
}
interface MicroHandle {
    readonly el: HTMLElement;
    readonly fx: readonly MicroBehavior[];
    readonly group: SpringGroup;
    /** Play a feedback impulse. */
    feedback(kind: MicroFeedback | string): void;
    /** Change behaviours and / or options. */
    update(fx?: string | readonly string[], opts?: MicroOptions): void;
    /** Drag offset in px. */
    readonly position: {
        x: number;
        y: number;
    };
    /** Move a draggable element (springs there unless `instant`). */
    moveTo(x: number, y: number, instant?: boolean): void;
    destroy(): void;
}
/** Split a behaviour list (`"press hover, glow"`) into known behaviours, in order, without repeats. */
declare function parseMicro(spec: string | readonly string[] | null | undefined): MicroBehavior[];
/** The feel that applies to `el`: its closest `[data-mo-feel]`, else the `--mo-feel` custom property, else `null`. */
declare function readFeel(el: Element): string | null;
/** A look's `--mo-kit-speed` on `el` (1 when unset). */
declare function readSpeed(el: Element): number;
/** Channel values → the composed CSS transform (`''` at rest). */
declare function microTransform(v: Record<string, number>, o?: {
    pressScale?: number;
    hoverScale?: number;
    perspective?: boolean;
}): string;
/** The micro handle of `el`, if it has one. */
declare const microOf: (el: Element) => MicroHandle | undefined;
/** Give `el` spring micro-interactions. Calling it again on the same element updates it. */
declare function micro(el: HTMLElement, fx?: string | readonly string[], opts?: MicroOptions): MicroHandle;
/**
 * Play a feedback impulse on any element (`shake` for an error, `nod` / `pop` for success, `wiggle`, `jelly`,
 * `nudge`, `bump`, `attention`). Elements without `micro()` get a temporary handle that goes away when they settle.
 */
declare function feedback(el: HTMLElement, kind: MicroFeedback | string, opts?: Pick<MicroOptions, 'feel' | 'haptics'>): void;
/**
 * Wire every `[data-mo-micro]` element under `root` (default `document`) and keep watching for new, changed and
 * removed ones. Options come from `data-mo-*` attributes (`data-mo-feel`, `data-mo-spring`, `data-mo-haptics`,
 * `data-mo-press-scale`, `data-mo-hover-scale`, `data-mo-lift`, `data-mo-strength`, `data-mo-reach`, `data-mo-tilt`,
 * `data-mo-snap`, `data-mo-axis`, `data-mo-bounds`). Returns a function that stops watching and undoes it all.
 */
declare function applyMicro(root?: ParentNode): () => void;

/**
 * motionary/components/interaction — micro-interactions.
 * `<usa-ripple>`, `<usa-magnetic>`, `<usa-tilt>`, `<usa-spotlight>`,
 * `<usa-press>`.
 * 17.16: the micro-interaction engine — `micro(el, 'press hover glow …')`, `applyMicro()` for `data-mo-micro`
 * markup and `feedback(el, 'shake' | 'pop' | …)` spring impulses.
 */

/** Register every component of this category under its default tag. */
declare function defineInteractionComponents(): void;
declare global {
    interface HTMLElementTagNameMap {
        'usa-ripple': UsaRippleElement;
        'usa-magnetic': UsaMagneticElement;
        'usa-tilt': UsaTiltElement;
        'usa-spotlight': UsaSpotlightElement;
        'usa-press': UsaPressElement;
    }
}

export { MICRO_BEHAVIORS, MICRO_FEEDBACK, applyMicro, defineInteractionComponents, defineMagnetic, definePress, defineRipple, defineSpotlight, defineTilt, feedback, micro, microOf, microTransform, parseMicro, readFeel, readSpeed };
export type { MicroBehavior, MicroFeedback, MicroHandle, MicroOptions, UsaMagneticElement, UsaPressElement, UsaRippleElement, UsaSpotlightElement, UsaTiltElement };
