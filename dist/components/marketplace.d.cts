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
 * 6.9 — effect marketplace manifest (`motionary/components/marketplace`).
 *
 * A third-party effect pack is an ES module that exports its effects (an
 * `EffectDefinition[]` as `effects` or `default`) plus a JSON manifest:
 *
 * ```json
 * { "format": "motionary/effect-pack", "version": 1,
 *   "name": "@acme/motion-snow", "packVersion": "1.2.0",
 *   "description": "Snow and frost effects", "license": "MIT",
 *   "author": "Acme", "entry": "./dist/index.js", "requires": ">=6.9",
 *   "effects": [{ "name": "frost", "kind": "background", "description": "…",
 *                 "defaults": { "speed": 1 } }] }
 * ```
 *
 * `packManifest()` writes one from your effects, `validateManifest()` checks
 * one (format, semver, unique kebab-case names, known kinds, effects match
 * the module), and `loadEffectPack()` imports a pack (URL or module),
 * validates it and registers its effects — refusing names that already
 * exist unless `override`.
 */

declare const EFFECT_PACK_FORMAT = "motionary/effect-pack";
interface EffectPackManifest {
    format: typeof EFFECT_PACK_FORMAT;
    version: 1;
    name: string;
    packVersion: string;
    description?: string;
    license?: string;
    author?: string;
    homepage?: string;
    entry?: string;
    requires?: string;
    keywords?: string[];
    effects: {
        name: string;
        kind: string;
        description?: string;
        defaults?: Record<string, unknown>;
    }[];
}
/** Build a manifest from an effect pack. */
declare function packManifest(name: string, packVersion: string, effects: EffectDefinition[], extra?: Partial<Omit<EffectPackManifest, 'format' | 'version' | 'name' | 'packVersion' | 'effects'>>): EffectPackManifest;
/** Check a manifest (and optionally the module's effects against it). */
declare function validateManifest(m: unknown, effects?: EffectDefinition[]): {
    ok: boolean;
    errors: string[];
};
/**
 * Import an effect pack (a URL / specifier, or an already imported module
 * with `effects` / `default` and `manifest`), validate and register it.
 * Returns the registered effect names.
 */
declare function loadEffectPack(src: string | {
    effects?: EffectDefinition[];
    default?: EffectDefinition[];
    manifest?: EffectPackManifest;
}, opts?: {
    manifest?: EffectPackManifest;
    override?: boolean;
}): Promise<string[]>;

export { EFFECT_PACK_FORMAT, loadEffectPack, packManifest, validateManifest };
export type { EffectPackManifest };
