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
/** Parse a natural-language motion description. */
declare function describeMotion(input: string): MotionIntent;
/** Turn an intent into ready code for one element: CSS, WAAPI or a Motionary component. */
declare function motionSnippet(i: MotionIntent, style?: 'waapi' | 'css' | 'component'): string;
declare const MOTION_EFFECTS: readonly MotionEffect[];
declare const MOTION_TRIGGERS: readonly MotionTrigger[];
/** What a provider returns: the decisions only — keyframes, CSS and component suggestions are derived locally. */
interface MotionSpec {
    effect: MotionEffect;
    also?: MotionEffect[];
    direction?: Direction;
    amount?: number;
    duration?: number;
    delay?: number;
    /** A named easing (spring · bouncy · snappy · smooth · linear · ease-in · ease-out) or `cubic-bezier()` / `steps()`. */
    easing?: string;
    trigger?: MotionTrigger;
    iterations?: number | 'infinite';
    alternate?: boolean;
    stagger?: number;
}
/** JSON Schema (2020-12) every provider answer must satisfy. */
declare const MOTION_SPEC_SCHEMA: {
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly title: "Motionary motion spec";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["effect"];
    readonly properties: {
        readonly effect: {
            readonly type: "string";
            readonly enum: readonly MotionEffect[];
        };
        readonly also: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly enum: readonly MotionEffect[];
            };
            readonly maxItems: 4;
        };
        readonly direction: {
            readonly enum: readonly ["up", "down", "left", "right", null];
        };
        readonly amount: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 2000;
        };
        readonly duration: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 20000;
        };
        readonly delay: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 20000;
        };
        readonly easing: {
            readonly type: "string";
            readonly maxLength: 80;
            readonly pattern: "^(?:linear|ease|ease-in|ease-out|ease-in-out|spring|bouncy|snappy|smooth|cubic-bezier\\(\\s*-?[\\d.]+\\s*,\\s*-?[\\d.]+\\s*,\\s*-?[\\d.]+\\s*,\\s*-?[\\d.]+\\s*\\)|steps\\(\\s*\\d+\\s*(?:,\\s*(?:start|end|jump-[a-z]+)\\s*)?\\))$";
        };
        readonly trigger: {
            readonly type: "string";
            readonly enum: readonly MotionTrigger[];
        };
        readonly iterations: {
            readonly anyOf: readonly [{
                readonly type: "integer";
                readonly minimum: 1;
                readonly maximum: 1000;
            }, {
                readonly const: "infinite";
            }];
        };
        readonly alternate: {
            readonly type: "boolean";
        };
        readonly stagger: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 5000;
        };
    };
};
/** Validate a value against the JSON Schema subset used by MOTION_SPEC_SCHEMA (type, enum, const, required,
 * additionalProperties, properties, items, anyOf, minimum, maximum, maxItems, maxLength, pattern). Returns the errors. */
declare function validateMotionSpec(value: unknown, schema?: any, path?: string): string[];
/** The decisions of an intent, in MotionSpec form (what a provider is asked to improve). */
declare function specOf(i: MotionIntent): MotionSpec;
/** Build a full intent (keyframes, WAAPI options, CSS, components) from a validated spec; unset fields come from `base`. */
declare function intentFromSpec(text: string, spec: MotionSpec, base?: MotionIntent): MotionIntent;
/** What a provider receives. Pass `system` + `prompt` to your model and ask for JSON matching `schema`. */
interface MotionProviderRequest {
    prompt: string;
    system: string;
    schema: typeof MOTION_SPEC_SCHEMA;
    /** The local parser's answer — a good default the model can refine. */
    local: MotionSpec;
    signal?: AbortSignal;
}
/** A user-supplied model: a function or `{ name, complete }`. Return the spec as an object or a JSON string. */
type MotionProvider = ((req: MotionProviderRequest) => unknown) | {
    name?: string;
    complete(req: MotionProviderRequest): unknown;
};
interface MotionSuggestion {
    intent: MotionIntent;
    /** `local`: no provider given · `provider`: the provider's validated answer · `fallback`: provider failed or answered invalid JSON. */
    source: 'local' | 'provider' | 'fallback';
    provider?: string;
    errors: string[];
}
declare const MOTION_SYSTEM_PROMPT = "You turn a short description of a UI animation into a JSON object that matches the given JSON Schema. Answer with the JSON object only. Durations, delays and stagger are milliseconds; amount is px for slides, a scale factor for zooms and degrees for rotations / flips.";
/**
 * Suggest a motion for a description. Without `provider`: the local deterministic parser (no network).
 * With `provider`: asks it for a MotionSpec, validates the answer against MOTION_SPEC_SCHEMA and falls back to the
 * local result on any error, timeout (default 8 s) or abort.
 */
declare function suggestMotion(text: string, options?: {
    provider?: MotionProvider;
    signal?: AbortSignal;
    timeout?: number;
}): Promise<MotionSuggestion>;

export { MOTION_EFFECTS, MOTION_SPEC_SCHEMA, MOTION_SYSTEM_PROMPT, MOTION_TRIGGERS, describeMotion, intentFromSpec, motionSnippet, specOf, suggestMotion, validateMotionSpec };
export type { Direction, MotionEffect, MotionIntent, MotionProvider, MotionProviderRequest, MotionSpec, MotionSuggestion, MotionTrigger };
