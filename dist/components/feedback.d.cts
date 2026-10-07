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

declare const SPINNER_VARIANTS: readonly ["fluent", "windows", "ring", "dots", "pulse", "bars"];
type SpinnerVariant = (typeof SPINNER_VARIANTS)[number];
/**
 * `<usa-spinner>` — indeterminate loading indicators, pure CSS animations
 * of `transform` / `opacity` (plus an SVG stroke for `fluent`).
 *
 * Kinds (`kind`; `variant` is a deprecated alias until 3.0): `fluent` (default — the WinUI / Windows 11
 * ProgressRing arc), `windows` (the Windows 10 boot "orbiting dots"),
 * `ring` (classic border spinner), `dots` (three bouncing dots / typing
 * indicator), `pulse` (expanding ripple), `bars` (equalizer).
 * Attributes: `size` (px, 32), `label` (accessible name, "Loading"),
 * `paused`. Colour follows `color` / `--usa-spinner-color`.
 * `role="progressbar"` without a value (indeterminate). Reduced motion:
 * a slow opacity pulse instead of movement.
 */
interface UsaSpinnerElement extends UsaElement {
    /** Spinner kind (`kind` attribute). */
    kind: SpinnerVariant;
    /** @deprecated alias of `kind`, removed in 3.0. */
    variant: SpinnerVariant;
}
declare function defineSpinner(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-skeleton>` — shimmering placeholders while content loads. With
 * `loading`, it shows `lines` bars (or one block of `width` × `height`,
 * or a `circle`) and hides its children; remove `loading` and the real
 * content fades in.
 *
 * Attributes: `loading`, `lines` (3), `width`, `height` (CSS lengths),
 * `circle`, `radius`, `avatar` (circle + lines, like a list row).
 * `aria-busy` follows `loading`. Reduced motion: no shimmer sweep.
 */
interface UsaSkeletonElement extends UsaElement {
    loading: boolean;
}
declare function defineSkeleton(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-progress>` — a linear progress bar. Determinate (`value` / `max`)
 * bars glide between values with `transform: scaleX()`; without a value,
 * or with `indeterminate`, it shows the Windows Fluent indeterminate
 * animation (two sliding segments).
 *
 * Attributes: `value`, `max` (100), `indeterminate`, `state`
 * (`paused` | `error` — the WinUI states), `label` (accessible name).
 * `role="progressbar"` with `aria-valuenow` when determinate.
 * Reduced motion: no glide; indeterminate becomes a gentle pulse.
 */
interface UsaProgressElement extends UsaElement {
    value: number | null;
    max: number;
    /** 0–1, or `null` when indeterminate. */
    readonly ratio: number | null;
}
declare function defineProgress(tag?: string): CustomElementConstructor | undefined;

type ToastType = 'info' | 'success' | 'warning' | 'error';
interface ToastOptions {
    /** ms before it hides itself; `0` keeps it until closed (default 4000). */
    duration?: number;
    type?: ToastType;
    /** Optional action button. */
    action?: {
        label: string;
        onClick: () => void;
    };
    /** Show a close button (default `true`). */
    dismissible?: boolean;
    /** The toaster to use (default: the first `<usa-toaster>`, created if missing). */
    toaster?: UsaToasterElement | string;
}
interface ToastHandle {
    element: HTMLElement;
    close(): Promise<void>;
}
/**
 * `<usa-toaster>` — the region toasts slide into (`role="region"`, each
 * toast `role="status"`, errors `role="alert"`). Toasts pause their timer
 * while hovered or focused, and the stack re-flows with a FLIP animation.
 *
 * Attributes: `position` (`bottom-right` default, `bottom-left`,
 * `bottom-center`, `top-right`, `top-left`, `top-center`), `max` (visible
 * toasts, 4), `label` (region name, "Notifications").
 * Reduced motion: toasts fade instead of sliding.
 */
interface UsaToasterElement extends UsaElement {
    show(message: string, options?: ToastOptions): ToastHandle;
    clear(): void;
}
declare function defineToaster(tag?: string): CustomElementConstructor | undefined;
/**
 * Show a toast. Defines `<usa-toaster>` and adds one to `<body>` if the
 * page has none. Returns a handle with `close()`. No-op on the server.
 *
 * ```js
 * toast('Saved', { type: 'success' });
 * ```
 */
declare function toast(message: string, options?: ToastOptions): ToastHandle | null;

/**
 * `<usa-check>` — an animated result icon: the circle draws itself, then the
 * check mark (or cross / exclamation) strokes in with a little pop.
 *
 * Attributes: `variant` (`success` default, `error`, `warning`), `size`
 * (px, 56), `start` (`view` default | `load` | `manual`), `label`
 * (accessible name, e.g. "Payment complete"; the icon is decorative
 * without it). Event: `usa:complete`. Reduced motion: drawn instantly.
 */
interface UsaCheckElement extends UsaElement {
    play(): Promise<void>;
    reset(): void;
}
declare function defineCheck(tag?: string): CustomElementConstructor | undefined;

/**
 * use-scroll-animate/components/feedback — loading & feedback.
 * `<usa-spinner>`, `<usa-skeleton>`, `<usa-progress>`, `<usa-toaster>` +
 * `toast()`, `<usa-check>`.
 */

/** Register every component of this category under its default tag. */
declare function defineFeedbackComponents(): void;
declare global {
    interface HTMLElementTagNameMap {
        'usa-spinner': UsaSpinnerElement;
        'usa-skeleton': UsaSkeletonElement;
        'usa-progress': UsaProgressElement;
        'usa-toaster': UsaToasterElement;
        'usa-check': UsaCheckElement;
    }
}

export { SPINNER_VARIANTS, configureComponents, defineCheck, defineFeedbackComponents, defineProgress, defineSkeleton, defineSpinner, defineToaster, prefersReducedMotion, toast };
export type { ComponentsConfig, SpinnerVariant, ToastHandle, ToastOptions, ToastType, UsaCheckElement, UsaElement, UsaProgressElement, UsaSkeletonElement, UsaSpinnerElement, UsaToasterElement };
