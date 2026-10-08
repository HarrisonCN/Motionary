type MotionSensitivity = 'full' | 'gentle' | 'minimal' | 'static';
type Cleanup = () => void;

/**
 * 5.0 — unified plugin-style effect registration. Every effect (built-in or
 * yours) is a plain object registered once and played the same way:
 * `playEffect(el, name)`, `bindEffect(el, name, { trigger })` or
 * `<usa-fx effect="name" trigger="click">`. Effects get a context that
 * already applies reduced motion, motion sensitivity, intensity and the
 * animation budget.
 */

declare const EFFECT_KINDS: readonly ["enter", "exit", "attention", "click", "hover", "card", "loop", "page", "background", "text", "cursor", "scroll"];
type EffectKind = (typeof EFFECT_KINDS)[number];
interface EffectContext {
    /** Reduced motion applies (OS setting, `minimal` / `static` sensitivity). */
    readonly reduced: boolean;
    readonly sensitivity: MotionSensitivity;
    /** The triggering event (pointer position for click effects), if any. */
    readonly event?: Event;
    /** `el.animate()` with the library's motion rules (may return `null`). */
    animate(el: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions): Animation | null;
    /** Register teardown for long-running effects (loops, listeners). */
    onCleanup(fn: Cleanup): void;
}
interface EffectDefinition<O extends Record<string, unknown> = Record<string, any>> {
    /** Unique, kebab-case. */
    name: string;
    kind: EffectKind;
    /** One line for docs and the gallery. */
    description?: string;
    /** Option defaults (merged under the caller's options). */
    defaults?: Partial<O>;
    /**
     * Under reduced motion: `'skip'` (do nothing — default for loop, background
     * and cursor effects) or `'run'` (run with `ctx.reduced === true`, the
     * effect degrades itself — default for everything else).
     */
    reduced?: 'skip' | 'run';
    /** Play the effect. Return an Animation / Promise to be awaited, or a cleanup. */
    run(el: HTMLElement, options: O, ctx: EffectContext): void | Cleanup | Animation | null | Promise<unknown>;
}

/**
 * 6.8 — Interactive physics 2.0 (`motionary/components/fx-physics`) on a tiny
 * Verlet integrator (`VerletWorld`), registered through `registerEffect()`:
 *
 * - `soft-body` (kind `hover`) — the element wobbles like jelly: pointer
 *   motion pushes a damped spring that squashes and skews it.
 * - `magnet` (kind `hover`) — the element's children are pulled toward the
 *   pointer on springs and settle back when it leaves.
 * - `cloth` (kind `background`) — a cloth hangs from the top edge and ripples
 *   when the pointer moves through it.
 * - `rope` (kind `background`) — a rope with a weight swings from the top;
 *   the pointer pushes it.
 * - `pinball` (kind `background`) — balls fall through round bumpers that
 *   light up on a hit; click to drop another ball.
 *
 * Canvas effects render only while visible; reduced motion draws one static
 * frame and the hover effects do nothing.
 */

interface VerletPoint {
    x: number;
    y: number;
    px: number;
    py: number;
    pinned: boolean;
}
/** A minimal Verlet world: points, distance sticks, gravity, damping. */
declare class VerletWorld {
    gravity: number;
    damping: number;
    iterations: number;
    points: VerletPoint[];
    sticks: [number, number, number][];
    constructor(gravity?: number, damping?: number, iterations?: number);
    add(x: number, y: number, pinned?: boolean): number;
    link(a: number, b: number, len?: number): void;
    step(dt: number, bounds?: {
        w: number;
        h: number;
    }): void;
    /** Push points within `r` px of (x, y) by (dx, dy). */
    push(x: number, y: number, dx: number, dy: number, r?: number): void;
}
declare const PHYSICS2_FX: EffectDefinition[];
/** Register the 6.8 physics 2.0 pack (idempotent). */
declare function registerPhysicsPack(): void;

export { PHYSICS2_FX, VerletWorld, registerPhysicsPack };
export type { VerletPoint };
