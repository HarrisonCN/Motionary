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
 * `motionary/native` (= `motionary/components/native`, 9.8) — native 2.0:
 * take the motion you designed on the web to React Native and Flutter.
 *
 * - `toReactNative(rules, { name })` — a React Native component (Animated +
 *   Easing.bezier / spring) for the entrance and press rules of a motion
 *   string.
 * - `toFlutter(rules, { name })` — a Flutter widget (AnimationController +
 *   Cubic curves) for the same rules.
 * - `nativeEasing(easing, 'react-native' | 'flutter')` — a CSS easing as
 *   `Easing.bezier(…)` / `Cubic(…)`.
 * - `nativeTokens()` — Motionary's motion tokens (durations, easings as
 *   bezier arrays, springs) as JSON for native design systems.
 *
 * Complete sample apps live in `examples/native/react-native` and
 * `examples/native/flutter`.
 */

type Platform = 'react-native' | 'flutter';
/** A CSS easing as React Native `Easing.bezier(…)` or Flutter `Cubic(…)` (9.8). */
declare function nativeEasing(easing: string | undefined, platform: Platform): string;
/** Start values for an entrance preset: opacity, translate x / y (dp), scale (9.8). */
declare function entranceFrom(effect: string): {
    opacity: number;
    x: number;
    y: number;
    scale: number;
};
/** A React Native component for a motion string (entrance on mount, `pop` / press rules on press) (9.8). */
declare function toReactNative(rules: string | MotionRule[], opts?: {
    name?: string;
}): string;
/** A Flutter widget for a motion string (entrance on first build, press spring) (9.8). */
declare function toFlutter(rules: string | MotionRule[], opts?: {
    name?: string;
}): string;
/** Motion tokens for native design systems: durations (ms), easings as bezier arrays, springs (9.8). */
declare function nativeTokens(): {
    duration: Record<string, number>;
    easing: Record<string, number[]>;
    spring: Record<string, {
        stiffness: number;
        damping: number;
        mass: number;
    }>;
};

export { entranceFrom, nativeEasing, nativeTokens, toFlutter, toReactNative };
