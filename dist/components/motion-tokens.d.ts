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

/** Problems in a DTCG file (empty array = valid for motion purposes). */
declare function validateDesignTokens(json: unknown): string[];

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

/** Token-set generation (14.1 = 2). */
declare const MOTION_TOKENS_VERSION = 2;
declare const SEMANTIC_KINDS: readonly ["enter", "exit", "emphasis", "transition"];
type SemanticKind = (typeof SEMANTIC_KINDS)[number];
/** The built-in reduced-motion mode (derived from any set; explicit overrides apply on top). */
declare const REDUCED_MOTION_MODE = "reduced";
/** 15.3: the built-in gentle mode — half the travel, durations ≤ 300 ms, no overshoot (opt-in: no OS setting maps to it). */
declare const GENTLE_MOTION_MODE = "gentle";
/** A semantic motion: literals or references to primitives (`"{duration.fast}"`, `"{distance.md}"`, `"{spring.snappy}"`). */
interface SemanticToken {
    /** ms or `"{duration.x}"`. */
    duration: number | string;
    /** CSS easing or `"{easing.x}"` (default: `easing.standard`). */
    easing?: string;
    /** ms or `"{duration.x}"` (default 0). */
    delay?: number | string;
    /** px or `"{distance.x}"` (default 0). */
    distance?: number | string;
    /** `"{spring.x}"` or `{ stiffness, damping, mass }`. */
    spring?: string | SpringToken;
}
interface MotionTokenOverrides {
    duration?: Record<string, number>;
    easing?: Record<string, string>;
    spring?: Record<string, Partial<SpringToken>>;
    distance?: Record<string, number>;
    semantic?: {
        [K in SemanticKind]?: Record<string, Partial<SemanticToken>>;
    };
}
interface MotionTokenSet {
    /** ms */
    duration: Record<string, number>;
    /** CSS easing strings */
    easing: Record<string, string>;
    spring: Record<string, SpringToken>;
    /** Spatial distances in px (how far things travel). */
    distance: Record<string, number>;
    semantic: Record<SemanticKind, Record<string, SemanticToken>>;
    /** Named overrides: `compact`, custom modes; `reduced` is built in. */
    modes?: Record<string, MotionTokenOverrides>;
}
interface ResolvedMotion {
    duration: number;
    delay: number;
    easing: string;
    distance: number;
    spring?: SpringToken;
}
type MotionTokenInput = MotionTokenOverrides & {
    modes?: Record<string, MotionTokenOverrides>;
};
/** `"{a.b}"` → `"a.b"` (or undefined). */
declare const tokenRefPath: (v: unknown) => string | undefined;
declare const kebab: (s: string) => string;
/** The default token set: the 4.2 scale + distances + semantics + a `compact` mode. */
declare const MOTION_TOKENS_2: MotionTokenSet;
/** Merge a partial set (and modes) over `base` (default: the built-in set). Never mutates either. */
declare function defineMotionTokens(partial?: MotionTokenInput, base?: MotionTokenSet): MotionTokenSet;
/** The reduced-motion overrides derived from a set: no travel, durations ≤ 150 ms, no overshooting curves, critically damped springs. */
declare function reducedMotionOverrides(set: MotionTokenSet): MotionTokenOverrides;
/** 15.3: the gentle-motion overrides derived from a set: travel halved (rounded), durations ≤ 300 ms, no overshooting curves, springs at least 80 % of critical damping. Only changed values are listed. */
declare function gentleMotionOverrides(set: MotionTokenSet): MotionTokenOverrides;
/** The set as seen in `mode` (or several, applied in order); `reduced` and `gentle` (15.3) are always available. The result has no `modes`. */
declare function withMode(set: MotionTokenSet, mode?: string | string[]): MotionTokenSet;
/** One semantic motion, resolved to literals (falls back to the kind's `default`). */
declare function resolveSemantic(set: MotionTokenSet, kind: SemanticKind, name?: string, mode?: string | string[]): ResolvedMotion;
/** `"{duration.fast}"`, `"distance.md"`, `"{enter.default}"`, `"{semantic.exit.default}"` → its value (undefined when unknown). */
declare function resolveMotionToken(set: MotionTokenSet, ref: string, mode?: string | string[]): number | string | SpringToken | ResolvedMotion | undefined;
/** `{ duration, delay, easing }` for `animate()` in motionary/motion. */
declare function motionOptions(set: MotionTokenSet, kind: SemanticKind, name?: string, mode?: string | string[]): {
    duration: number;
    delay: number;
    easing: string;
};
/** Keyframes for a semantic motion: enter / exit fade + travel by its distance, emphasis nudges and returns, transition moves. */
declare function motionKeyframes(set: MotionTokenSet, kind: SemanticKind, name?: string, o?: {
    axis?: 'x' | 'y';
    direction?: 1 | -1;
    mode?: string | string[];
}): Keyframe[];
/** Whether `v` is a CSS easing this library understands (keywords, cubic-bezier with x in 0–1, steps(), linear()). */
declare function isCssEasing(v: unknown): boolean;
/** Problems in a token set (empty = valid). Never throws. */
declare function validateMotionTokens(set: MotionTokenSet): string[];
interface DTCGOptions {
    /** '2025.10' (default: `{ value, unit }`) or 'draft' (`"150ms"`, `"16px"`). */
    format?: '2025.10' | 'draft';
    /** Top-level group (default 'motion'). */
    group?: string;
    /** Write modes into `$extensions["org.motionary"].modes` (default true). */
    modes?: boolean;
}
/** Export a token set as a DTCG document (springs, semantic distance / spring and modes travel in `$extensions["org.motionary"]`). */
declare function motionTokenSetToDTCG(set: MotionTokenSet, o?: DTCGOptions): Record<string, any>;
/** Import a DTCG document (Motionary 2.0 exports, or any DTCG motion group); merged over `base` (default: the built-in set). Throws on broken aliases. */
declare function motionTokenSetFromDTCG(doc: unknown, base?: MotionTokenSet): MotionTokenSet;
interface CssOptions {
    /** Custom property prefix (default `--usa`). */
    prefix?: string;
    /** Mode to compute the variables in. */
    mode?: string | string[];
}
/** The custom-property map: primitives (`--usa-duration-fast: 150ms`, `--usa-distance-md: 16px`…) and semantic vars referencing them. */
declare function motionTokenSetVars(set: MotionTokenSet, o?: CssOptions): Record<string, string>;
/**
 * A stylesheet: the set on `selector`, then each mode as the variables that change — `reduced` under
 * `@media (prefers-reduced-motion: reduce)` and every mode under `selector[data-usa-motion-mode~="<mode>"]`
 * (an explicit data attribute wins over the OS preference).
 */
declare function motionTokenSetToCss(set: MotionTokenSet, o?: {
    selector?: string;
    prefix?: string;
    modes?: boolean;
}): string;
/** Whether the user asked for reduced motion (`prefers-reduced-motion: reduce`). */
declare function prefersReducedMotion(): boolean;
/**
 * Make `set` the active motion scale: writes every custom property on `root` (default `<html>`) and makes
 * `{duration.*}` / `{easing.*}` / `{spring.*}` references in motionary/motion, motionary/motion/scene and the
 * token-aware components resolve to it. `mode: 'auto'` follows `prefers-reduced-motion` (and its changes).
 * Returns an undo function.
 */
declare function applyMotionTokenSet(set: MotionTokenSet, o?: {
    mode?: string | string[] | 'auto';
    root?: HTMLElement;
    prefix?: string;
}): () => void;
/** Scene-local tokens (`doc.tokens`) for Scene Format v2 from a set (in `mode`). */
declare function toSceneTokens(set: MotionTokenSet, mode?: string | string[]): {
    duration: Record<string, number>;
    easing: Record<string, string>;
    spring: Record<string, SpringToken>;
};
/** A copy of a scene v2 document whose `tokens` carry the set (the document's own tokens win). */
declare function withSceneTokens<T extends Record<string, any>>(doc: T, set: MotionTokenSet, mode?: string | string[]): T & {
    tokens: ReturnType<typeof toSceneTokens>;
};

type FigmaResolvedType = 'FLOAT' | 'STRING' | 'BOOLEAN' | 'COLOR';
interface FigmaAlias {
    type: 'VARIABLE_ALIAS';
    id: string;
}
type FigmaValue = number | string | boolean | FigmaAlias | Record<string, number>;
/** The body of `POST /v1/files/:file_key/variables`. */
interface FigmaVariablesBody {
    variableCollections: {
        action: 'CREATE' | 'UPDATE' | 'DELETE';
        id: string;
        name?: string;
        initialModeId?: string;
        hiddenFromPublishing?: boolean;
    }[];
    variableModes: {
        action: 'CREATE' | 'UPDATE' | 'DELETE';
        id: string;
        name?: string;
        variableCollectionId: string;
    }[];
    variables: {
        action: 'CREATE' | 'UPDATE' | 'DELETE';
        id: string;
        name?: string;
        variableCollectionId?: string;
        resolvedType?: FigmaResolvedType;
        description?: string;
        scopes?: string[];
        codeSyntax?: {
            WEB?: string;
            ANDROID?: string;
            iOS?: string;
        };
    }[];
    variableModeValues: {
        variableId: string;
        modeId: string;
        value: FigmaValue;
    }[];
}
interface FigmaExportOptions {
    /** Collection name (default "Motion"). */
    collection?: string;
    /** Modes to add next to Default (default: `reduced` + the set's modes). */
    modes?: string[];
    /** Variable name prefix (default "motion"). */
    prefix?: string;
    /** CSS custom property prefix for `codeSyntax.WEB` (default `--usa`). */
    cssPrefix?: string;
}
/** A token set as a Figma Variables `POST` body (one collection, Default + one mode per token-set mode). */
declare function motionTokensToFigma(set?: MotionTokenSet, o?: FigmaExportOptions): FigmaVariablesBody;
/**
 * Read a Figma Variables `GET /v1/files/:key/variables/local` response (or a `POST` body) into a token set,
 * merged over `base`. The collection's default mode is the set; other modes become token-set modes holding only
 * what differs ("Reduced motion" / "Reduce motion" → `reduced`, "Dense UI" → `dense-ui`).
 */
declare function motionTokensFromFigma(json: unknown, o?: {
    collection?: string;
    prefix?: string;
    base?: MotionTokenSet;
}): MotionTokenSet;

export { GENTLE_MOTION_MODE, MOTION_TOKENS_2, MOTION_TOKENS_VERSION, REDUCED_MOTION_MODE, SEMANTIC_KINDS, applyMotionTokenSet, defineMotionTokens, gentleMotionOverrides, isCssEasing, kebab, motionKeyframes, motionOptions, motionTokenSetFromDTCG, motionTokenSetToCss, motionTokenSetToDTCG, motionTokenSetVars, motionTokensFromFigma, motionTokensToFigma, prefersReducedMotion, reducedMotionOverrides, resolveMotionToken, resolveSemantic, toSceneTokens, tokenRefPath, validateDesignTokens, validateMotionTokens, withMode, withSceneTokens };
export type { CssOptions, DTCGOptions, FigmaAlias, FigmaExportOptions, FigmaResolvedType, FigmaValue, FigmaVariablesBody, MotionTokenInput, MotionTokenOverrides, MotionTokenSet, ResolvedMotion, SemanticKind, SemanticToken, SpringToken };
