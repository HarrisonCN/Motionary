/**
 * Motion design tokens 2.0 (10.6): the W3C Design Tokens Community Group
 * format (DTCG, stable 2025.10) — import with alias resolution and
 * validation, export in the stable or the earlier draft shape.
 *
 * - `resolveTokenAliases(json)` — replaces `{group.token}` references
 *   (whole values and inside composite values), detects cycles and
 *   unknown references;
 * - `validateDesignTokens(json)` — problems (unknown `$type`, malformed
 *   durations / cubic béziers, broken aliases) without throwing;
 * - `importDesignTokens(json)` — resolve + import into `MotionTokens`
 *   (durations, easings, `transition` composites, springs from
 *   `$extensions["org.motionary"]`);
 * - `exportDesignTokens(tokens, { format })` — `2025.10` writes durations
 *   as `{ value, unit: "ms" }`, `draft` as `"150ms"`; springs travel in
 *   `$extensions["org.motionary"].spring` (springs are not a DTCG type).
 */

/** Inherit `$type` from parent groups (DTCG) and resolve `{a.b}` aliases. Throws on cycles / missing targets. */
declare function resolveTokenAliases<T = any>(json: T): T;
/** Problems in a DTCG file (empty array = valid for motion purposes). */
declare function validateDesignTokens(json: unknown): string[];
/** Resolve aliases, then import (merged over `base`). Springs come from `$extensions["org.motionary"].spring`. */
declare function importDesignTokens(json: unknown, base?: MotionTokens): MotionTokens;
interface ExportOptions {
    /** '2025.10' (stable: durations as { value, unit }) or 'draft' ("150ms"). Default '2025.10'. */
    format?: '2025.10' | 'draft';
    /** Top-level group name (default 'motion'). */
    group?: string;
    /** Add `transition` composite tokens for these [name, durationToken, easingToken] triples. */
    transitions?: [string, string, string][];
}
/** Export motion tokens as a DTCG document. */
declare function exportDesignTokens(tokens?: MotionTokens, o?: ExportOptions): Record<string, unknown>;

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
/** The default motion scale (Material / Fluent-inspired). */
declare const MOTION_TOKENS: MotionTokens;
type MotionTokenGroup = keyof MotionTokens;
type DeepPartialTokens = {
    [K in keyof MotionTokens]?: Partial<MotionTokens[K]>;
};
/** Merge partial tokens over a base (defaults: the built-in scale). */
declare function mergeMotionTokens(partial: DeepPartialTokens, base?: MotionTokens): MotionTokens;
/** The custom-property map: `{ '--usa-duration-fast': '150ms', … }`. */
declare function motionTokensToVars(tokens?: MotionTokens, prefix?: string): Record<string, string>;
/** A stylesheet string: `:root { --usa-duration-fast: 150ms; … }`. */
declare function motionTokensToCss(tokens?: MotionTokens, selector?: string, prefix?: string): string;
/** W3C Design Tokens (DTCG) JSON: `{ motion: { duration: { fast: { $type: 'duration', $value: '150ms' } } } }`. */
declare function motionTokensToJSON(tokens?: MotionTokens): Record<string, unknown>;
/** Parse `150ms`, `0.15s`, `150` → ms. */
declare function parseDuration(v: unknown): number | undefined;
/** Parse `[x1,y1,x2,y2]`, `'cubic-bezier(…)'`, `'0.2, 0, 0, 1'` or a keyword → CSS easing. */
declare function parseEasing(v: unknown): string | undefined;
/**
 * Import tokens from W3C DTCG JSON, Figma Tokens / Tokens Studio
 * (`{ value, type }`) or Style Dictionary (`{ value }`, nested) — anything
 * under a `duration` / `easing` / `spring` group (any depth, e.g.
 * `motion.duration.fast` or `global.animation.easing.out`), or typed leaves
 * (`duration`, `cubicBezier`, `transition`, `spring`). Unknown values are
 * skipped; the result is merged over the defaults.
 */
declare function importMotionTokens(json: unknown, base?: MotionTokens): MotionTokens;
/** The tokens currently applied (via `applyMotionTokens`), or the defaults. */
declare function getMotionTokens(): MotionTokens;
/**
 * Write tokens as CSS custom properties on `root` (default `<html>`) and make
 * them the active set for `motionToken()`. Returns an undo function.
 */
declare function applyMotionTokens(tokens?: DeepPartialTokens | MotionTokens, root?: HTMLElement, prefix?: string): () => void;
/** Look up a token: `motionToken('duration', 'fast')` → `150`; `motionToken('easing', 'emphasized')` → CSS easing. */
declare function motionToken(group: 'duration', name: string): number;
declare function motionToken(group: 'easing', name: string): string;
declare function motionToken(group: 'spring', name: string): SpringToken;
/** `var(--usa-duration-fast, 150ms)` — a CSS reference with the current value as fallback. */
declare function motionVar(group: MotionTokenGroup, name: string, prop?: 'stiffness' | 'damping' | 'mass', prefix?: string): string;
/** Resolve a duration that may be a token name (`'fast'`) or ms. */
declare function resolveDurationToken(v: number | string | undefined, fallback: number): number;
/** Resolve an easing that may be a token name (`'emphasized'`) or CSS. */
declare function resolveEasingToken(v: string | undefined, fallback: string): string;

export { MOTION_TOKENS, applyMotionTokens, exportDesignTokens, getMotionTokens, importDesignTokens, importMotionTokens, mergeMotionTokens, motionToken, motionTokensToCss, motionTokensToJSON, motionTokensToVars, motionVar, parseDuration, parseEasing, resolveDurationToken, resolveEasingToken, resolveTokenAliases, validateDesignTokens };
export type { DeepPartialTokens, MotionTokenGroup, MotionTokens, SpringToken };
