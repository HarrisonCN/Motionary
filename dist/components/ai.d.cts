/**
 * `motionary/components/ai` (10.7, AI-assisted motion) — turns a short
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
/** Parse a natural-language motion description. */
declare function describeMotion(input: string): MotionIntent;
/** Turn an intent into ready code for one element: CSS, WAAPI or a Motionary component. */
declare function motionSnippet(i: MotionIntent, style?: 'waapi' | 'css' | 'component'): string;

export { describeMotion, motionSnippet };
export type { Direction, MotionEffect, MotionIntent, MotionTrigger };
