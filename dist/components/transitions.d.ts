/**
 * use-scroll-animate/components — shared base for the `<usa-*>` custom elements.
 *
 * Everything here is lazy: nothing touches `window`, `document`,
 * `HTMLElement` or `matchMedia` at import time, so the components can be
 * imported during SSR (Next, Nuxt, Astro…) and in Electron/Tauri preload
 * scripts. Classes are created the first time a `define*()` function runs.
 */
interface ComponentsConfig {
    /**
     * Inject each component's CSS when it is defined (default `true`). Uses a
     * constructable stylesheet (`document.adoptedStyleSheets`, which a strict
     * `style-src` CSP does not block) and falls back to a `<style>` tag. Set
     * to `false` when you load `use-scroll-animate/components.css` yourself.
     */
    injectStyles?: boolean;
    /**
     * `'user'` (default) follows `prefers-reduced-motion`; `'reduce'` always
     * uses the reduced variants (e.g. a kiosk / battery-saver mode);
     * `'no-preference'` ignores the OS setting (only for demos — respect your users).
     */
    reducedMotion?: 'user' | 'reduce' | 'no-preference';
    /**
     * Global motion intensity (v2.7): `'off'` (same as reduced motion),
     * `'low'` (shorter, calmer), `'normal'` (default) or `'high'`. Scales every
     * component animation's duration and sets `--usa-motion` (0 / 0.6 / 1 /
     * 1.25) on `<html>` for your own CSS. See `setMotionIntensity()`.
     */
    motionIntensity?: MotionIntensity;
}
type MotionIntensity = 'off' | 'low' | 'normal' | 'high';
/** Change global component settings (call before `define*()` for `injectStyles`). */
declare function configureComponents(options: ComponentsConfig): void;
/** `true` when animations should be reduced (OS setting or `configureComponents`). */
declare function prefersReducedMotion(): boolean;
/**
 * Members shared by every `<usa-*>` element. Attribute helpers, a cleanup
 * bag that is emptied on disconnect, and motion helpers that degrade to the
 * final state without WAAPI or under reduced motion.
 */
interface UsaElement extends HTMLElement {
    /** `true` while reduced motion applies to this element. */
    readonly reduced: boolean;
}

type DialogVariant = 'modal' | 'drawer-start' | 'drawer-end' | 'drawer-bottom' | 'sheet';
/**
 * `<usa-dialog>` — an animated modal or drawer built on the native
 * `<dialog>` (top layer, focus trapping, inert page, Esc to close). Its
 * children are slotted into the panel (they stay in the light DOM, so
 * React / Vue / Svelte keep owning them). Style with `::part(panel)`,
 * `::part(backdrop)` and the `--usa-dialog-*` custom properties.
 *
 * Attributes: `open` (reflects; set/remove to open/close), `kind`
 * (`modal` default — Fluent scale + fade; `drawer-start` / `drawer-end`
 * slide from the side, `drawer-bottom` / `sheet` from below), `label`
 * (accessible name), `no-backdrop-close`, `no-esc`. Elements inside
 * with `data-close` close it. Events: `usa:open`, `usa:close` (cancelable
 * `usa:beforeclose`). Reduced motion: fade only.
 */
interface UsaDialogElement extends UsaElement {
    open: boolean;
    show(): Promise<void>;
    close(returnValue?: string): Promise<void>;
    readonly dialog: HTMLDialogElement | null;
    returnValue: string;
}
declare function defineDialog(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-accordion>` — smooth expand / collapse for the native `<details>`
 * elements inside it (keeps their semantics, keyboard support and
 * find-in-page, and adds no wrapper elements, so framework-rendered content
 * is left alone). Only one stays open unless `multiple` is set.
 *
 * Attributes: `multiple`, `duration` (ms, 300). Event: `usa:toggle`
 * (`detail.details`, `detail.open`). Reduced motion: instant.
 * Heights are measured once per toggle and animated on the `<details>`.
 */
interface UsaAccordionElement extends UsaElement {
    readonly items: HTMLDetailsElement[];
    toggleItem(details: HTMLDetailsElement, open?: boolean): Promise<void>;
}
declare function defineAccordion(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-view-switch>` — shows one of its children at a time (tabs, wizard
 * steps, app pages) and animates between them. Children are views; name
 * them with `data-view`, or address them by index.
 *
 * Attributes: `active` (view name or index, default the first),
 * `effect` (`fade` | `slide` (default, direction-aware — Fluent "page
 * transition") | `scale` | `drill`), `duration` (ms, 320). Inactive views
 * get `hidden` + `inert`. Event: `usa:change` (`detail.view`,
 * `detail.index`). Reduced motion: a quick fade.
 */
interface UsaViewSwitchElement extends UsaElement {
    active: string;
    readonly views: HTMLElement[];
    show(view: string | number): Promise<void>;
}
declare function defineViewSwitch(tag?: string): CustomElementConstructor | undefined;

interface ViewTransitionOptions {
    /**
     * Element to cross-fade when the View Transitions API is missing (default:
     * none — the update is applied without animation).
     */
    fallback?: HTMLElement | null;
    /** Fallback fade duration in ms (default 180 out + 220 in). */
    duration?: number;
    /** View transition types (`document.startViewTransition({ types })`, where supported). */
    types?: string[];
}
/**
 * Run `update()` (which changes the DOM) inside a view transition:
 * `document.startViewTransition()` where available (Chrome/Edge 111+, so
 * Electron, WebView2 and Tauri on Windows), otherwise a short cross-fade of
 * `options.fallback`. Instant under reduced motion. Resolves when finished.
 *
 * Give elements a `view-transition-name` in CSS for shared-element morphs.
 */
declare function viewTransition(update: () => void | Promise<void>, options?: ViewTransitionOptions): Promise<void>;
interface FlipOptions {
    duration?: number;
    easing?: string;
    /** Fade/scale in elements that did not exist before (default true). */
    animateEnter?: boolean;
}
type Targets = Element | Iterable<Element> | ArrayLike<Element>;
/**
 * FLIP animation for layout changes (list reorder, filter, grid resize):
 * measures `targets` (an element's children, or a list), runs `mutate()`,
 * then animates each element from its old position to its new one with
 * transforms only. Elements added by `mutate()` fade in.
 *
 * ```js
 * await flip(list, () => list.append(...shuffled));
 * ```
 */
declare function flip(targets: Targets, mutate: () => void | Promise<void>, options?: FlipOptions): Promise<void>;

/**
 * use-scroll-animate/components/transitions — view & layout transitions.
 * `<usa-dialog>`, `<usa-accordion>`, `<usa-view-switch>`
 * and the `viewTransition()` and `flip()` helpers (4.0: `<usa-flip-list>` → `<usa-auto-animate>`,
 * `connectedAnimation()` → `sharedTransition()`, both in `components/layout`).
 */

/** Register every component of this category under its default tag. */
declare function defineTransitionComponents(): void;
declare global {
    interface HTMLElementTagNameMap {
        'usa-dialog': UsaDialogElement;
        'usa-accordion': UsaAccordionElement;
        'usa-view-switch': UsaViewSwitchElement;
    }
}

export { configureComponents, defineAccordion, defineDialog, defineTransitionComponents, defineViewSwitch, flip, prefersReducedMotion, viewTransition };
export type { ComponentsConfig, DialogVariant, FlipOptions, UsaAccordionElement, UsaDialogElement, UsaElement, UsaViewSwitchElement, ViewTransitionOptions };
