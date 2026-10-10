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
interface MotionParse {
    rules: MotionRule[];
    errors: string[];
}
/** Parse a motion string into rules (+ human-readable errors for what was skipped) (9.0). */
declare function parseMotion(src: string): MotionParse;
/** Rules back to the canonical motion string (9.0). */
declare function serializeMotion(rules: MotionRule[]): string;
/** Tagged template: motion`enter: fade-up ${dur}ms` → the motion string (validated in dev via `parseMotion`) (9.0). */
declare function motion(strings: TemplateStringsArray, ...vals: unknown[]): string;
/** Bind parsed rules (or a motion string) to one element; returns the cleanup (9.0). */
declare function bindMotion(el: HTMLElement, rules: MotionRule[] | string, onError?: (msg: string) => void): () => void;
/** Bind every `[data-motion]` under `root` (default `document`); `observe` also binds ones added later. Returns { errors, cleanup } (9.0). */
declare function applyMotion(root?: ParentNode, opts?: {
    observe?: boolean;
    attribute?: string;
}): {
    errors: string[];
    cleanup: () => void;
};
interface ComponentJSON {
    $schema?: string;
    tag: string;
    attrs?: Record<string, string>;
    children?: (ComponentJSON | string)[];
}
/** Build live markup from the 8.9 `describeComponent()` / `exportComponent(el, 'json')` format (9.0). */
declare function createComponent(desc: ComponentJSON | string): Element;

export { applyMotion, bindMotion, createComponent, motion, parseMotion, serializeMotion };
export type { ComponentJSON, MotionParse, MotionRule };
