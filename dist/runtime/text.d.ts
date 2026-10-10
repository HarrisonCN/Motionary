/**
 * 11.4: runtime tiers. **basic** — ticker, tween, timeline, scroll, text, CSS / WAAPI keyframes; **standard** — smooth
 * scrolling, drag-snap, SVG, sprites, GIF / APNG / WebP, Lottie; **advanced** — WebGL, 3D file parsing and decoders,
 * physics. A page that only uses basic modules never downloads standard or advanced code.
 */
type RuntimeTier = 'basic' | 'standard' | 'advanced';
/** A runtime module: `{ id, version, api }`, registered with `use()`. */
interface RuntimeModule<A = unknown> {
    /** Module id: 'core', 'format-css', 'scroll', … (import path `motionary/runtime/<id>`). */
    id: string;
    version: string;
    /** Other modules this one needs (registered first by `use()` callers). */
    requires?: string[];
    /** 11.4: runtime tier — basic · standard · advanced (docs/runtime-tiers.md). */
    tier?: RuntimeTier;
    /** The module's public API (what `requireModule(id)` returns). */
    api: A;
    /** Optional one-time setup, called on first registration. */
    setup?(registry: RuntimeRegistry): void;
}
interface RuntimeRegistry {
    version: string;
    modules: Map<string, RuntimeModule>;
    /** Shared per-page state slots (the ticker lives here). */
    slots: Record<string, unknown>;
}

/**
 * `motionary/runtime/text` (10.3) — split text into characters, words and
 * lines for animation, keeping it accessible (original implementation).
 *
 * - `segment(text, 'chars' | 'words')` — pure, works anywhere (SSR, workers):
 *   grapheme clusters via `Intl.Segmenter` when available (emoji, combining
 *   marks, CJK stay whole), whitespace-aware words.
 * - `splitText(el, { type: 'chars,words,lines' })` — wraps the element's text
 *   in spans (nested elements such as `<a>`, `<em>` keep their markup), groups
 *   words into lines by their rendered position, sets `aria-label` on the
 *   element with the original text and hides the pieces from assistive tech.
 *   `revert()` restores the original markup; `resplit()` re-measures lines
 *   (e.g. after a resize).
 */

type SplitType = 'chars' | 'words' | 'lines';
/** Split a string into graphemes ('chars') or words + whitespace runs ('words'). */
declare function segment(text: string, by?: 'chars' | 'words'): string[];
interface SplitOptions {
    /** Any of chars, words, lines (comma / space separated). Default 'chars,words'. */
    type?: string;
    /** Class prefix (default 'usa-split'): pieces get `<prefix>-char`, `-word`, `-line`. */
    className?: string;
    /** Set a `--i` custom property (index) on each piece for CSS staggering (default true). */
    indexVar?: boolean;
}
interface SplitResult {
    chars: HTMLElement[];
    words: HTMLElement[];
    lines: HTMLElement[];
    /** Restore the original markup. */
    revert(): void;
    /** Revert and split again (re-measures lines). */
    resplit(): SplitResult;
}
/** Split an element's text (see module docs). Needs a DOM. */
declare function splitText(el: HTMLElement, o?: SplitOptions): SplitResult;
interface TextApi {
    segment: typeof segment;
    splitText: typeof splitText;
}
/** The module object for `use(text)`. */
declare const text: RuntimeModule<TextApi>;

export { segment, splitText, text };
export type { SplitOptions, SplitResult, SplitType, TextApi };
