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
interface ComponentJSON {
    $schema?: string;
    tag: string;
    attrs?: Record<string, string>;
    children?: (ComponentJSON | string)[];
}

/**
 * `motionary/tooling/design` (= `motionary/tooling/design`, 9.7) — design-tool
 * integration.
 *
 * - `figmaToMotion(reactions)` — Figma prototype reactions (plugin API
 *   `node.reactions`: ON_CLICK / ON_HOVER / ON_PRESS / AFTER_TIMEOUT with
 *   DISSOLVE / SMART_ANIMATE / MOVE_IN / SLIDE_IN / PUSH / SCROLL_ANIMATE
 *   transitions, easing and duration) → a Motionary DSL string for
 *   `data-motion`. The `figma-plugin/` scaffold in the repo uses it.
 * - `framerComponent(desc, { name })` — a Framer code component (React,
 *   property controls for every attribute) from the 8.9 component JSON.
 * - `motionToCss(rules, selector)` — CSS `@keyframes` + rules for the
 *   entrance rules of a motion string (timeline presets), for hand-off to
 *   teams without JS.
 * - `easingPoints(easing)` — the cubic-bezier control points of a CSS
 *   easing (named or `cubic-bezier(…)`), for spec sheets.
 */

/** Control points [x1, y1, x2, y2] of a CSS easing (unknown → ease) (9.7). */
declare function easingPoints(easing?: string): [number, number, number, number];
/** Figma prototype reactions → a Motionary DSL string (unsupported reactions are skipped) (9.7). */
declare function figmaToMotion(reactions: any[]): string;
/** A Framer code component (TSX source) for a component description (9.7). */
declare function framerComponent(desc: ComponentJSON | string, opts?: {
    name?: string;
}): string;
/** CSS `@keyframes` + rules for the entrance (`enter` / `load`) rules of a motion string (9.7). */
declare function motionToCss(rules: string | MotionRule[], selector?: string): string;

export { easingPoints, figmaToMotion, framerComponent, motionToCss };
