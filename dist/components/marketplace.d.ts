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

/**
 * 10.1: plugin signature (integrity) checks and version compatibility.
 *
 * - `pluginIntegrity(code)` → `'sha256-<base64>'` (Subresource-Integrity style).
 * - `verifyPlugin(code, integrity)` → `true` when the code matches (sha256 / sha384 / sha512).
 * - `satisfies(version, range)` — semver ranges: `*`, `x`, `1.2.3`, `=`, `>`, `>=`, `<`, `<=`,
 *   `^`, `~`, `1.x`, hyphen ranges `1.0.0 - 2.0.0`, AND (space) and OR (`||`).
 * - `checkCompat(manifest, version)` — reads `engines.motionary` (or `motionary`) from a plugin manifest.
 */
type Algo = 'sha256' | 'sha384' | 'sha512';
/** SRI-style integrity string of plugin code. Needs Web Crypto (browsers, Node ≥ 18, workers). */
declare function pluginIntegrity(code: string | ArrayBuffer | Uint8Array, algo?: Algo): Promise<string>;
/** Does the code match the integrity string (any of several, space-separated)? */
declare function verifyPlugin(code: string | ArrayBuffer | Uint8Array, integrity: string): Promise<boolean>;
/** Does `version` satisfy the semver `range`? */
declare function satisfies(version: string, range: string): boolean;
interface CompatResult {
    ok: boolean;
    range: string;
    version: string;
    message: string;
}
/** Check a plugin manifest's `engines.motionary` (or `motionary`) range against the running version. */
declare function checkCompat(manifest: {
    engines?: {
        motionary?: string;
    };
    motionary?: string;
    name?: string;
}, version: string): CompatResult;

declare const MARKETPLACE_FORMAT = "motionary/marketplace";
interface PluginListing {
    name: string;
    title: string;
    description: string;
    entry: string;
    register: string;
    effects: string[];
    tags: string[];
    since: string;
    author?: string;
    official?: boolean;
}
/** The first-party catalogue (9.0). */
declare const MARKETPLACE: PluginListing[];
/** Ranked search over listings (name / title / tags / effects / description) (9.0). */
declare function searchPlugins(query: string, list?: PluginListing[]): PluginListing[];
/** Names of installed plugins → their registered effects (9.0). */
declare function installedPlugins(): Record<string, string[]>;
/**
 * Install a plugin: `load(entry)` imports the module (default: dynamic `import()`), then its
 * `register*` function runs (first-party listing) or its `effects` are validated and registered
 * through `loadEffectPack` (third-party pack). Returns the registered effect names (9.0).
 */
declare function installPlugin(p: PluginListing | string, opts?: {
    load?: (entry: string) => Promise<any>;
    override?: boolean;
}): Promise<string[]>;
/** Read a marketplace index (`{ format: "motionary/marketplace", version: 1, plugins }`) (9.0). */
declare function fetchMarketplace(url: string, fetcher?: typeof fetch): Promise<PluginListing[]>;

export { EFFECT_PACK_FORMAT, MARKETPLACE, MARKETPLACE_FORMAT, checkCompat, fetchMarketplace, installPlugin, installedPlugins, loadEffectPack, packManifest, pluginIntegrity, satisfies, searchPlugins, validateManifest, verifyPlugin };
export type { CompatResult, EffectPackManifest, PluginListing };
