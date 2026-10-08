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
    /**
     * Motion-sensitivity level (v4.4), finer than reduced motion:
     * `'full'` (default) · `'gentle'` (no spins, zooms, skews or parallax —
     * translations and fades only, safe for vestibular disorders) ·
     * `'minimal'` (fades only; components use their reduced-motion variants) ·
     * `'static'` (no animation: every component shows its static alternative).
     * See `setMotionSensitivity()` in `use-scroll-animate/components/a11y`.
     */
    motionSensitivity?: MotionSensitivity;
}
type MotionSensitivity = 'full' | 'gentle' | 'minimal' | 'static';
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

/**
 * `<usa-tabs>` — accessible tabs with a sliding (spring) indicator.
 * Tabs: `[data-tab]` children (buttons); panels: `[data-panel]` children, in
 * the same order. Arrow keys / Home / End move between tabs (roving tabindex).
 *
 * Attributes: `selected` (index, 0), `indicator` (`line` default, `pill`),
 * `variant`. Events: `usa:change` (`{ index }`). Panels fade/slide in;
 * reduced motion: the indicator jumps and panels switch instantly.
 */
interface UsaTabsElement extends UsaElement {
    selected: number;
    select(i: number, focus?: boolean): void;
}
declare function defineTabs(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-drawer>` — a side panel that slides in with a spring and can be
 * dragged / swiped closed. Modal: backdrop, Esc, focus returns on close.
 * Attributes: `open`, `side` (`left` default, `right`, `top`, `bottom`),
 * `label`, `variant`. Events: `usa:open`, `usa:close`. `[data-close]` closes.
 * Reduced motion: opens and closes instantly.
 */
interface UsaDrawerElement extends UsaElement {
    open: boolean;
    show(): void;
    close(): void;
}
/**
 * `<usa-bottom-sheet>` — a draggable bottom sheet with snap points
 * (`snap="0.3,0.6,0.92"`, fractions of the viewport height; default
 * `0.5,0.92`; `start` = index of the snap it opens at, default 0), inertia and drag-down-to-dismiss. `[data-handle]` (or the
 * built-in grabber) drags it. Attributes: `open`, `snap`, `start` (initial
 * snap index), `label`, `variant`. Events: `usa:open`, `usa:close`, `usa:snap`.
 */
interface UsaBottomSheetElement extends UsaDrawerElement {
}
declare function defineDrawer(tag?: string): CustomElementConstructor | undefined;
declare function defineBottomSheet(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-pull-refresh>` — pull-to-refresh for a scroll container (itself):
 * pull down at the top (touch / pointer) and a spinner stretches in; past
 * `threshold` (px, 70) releasing fires `usa:refresh` — call
 * `event.detail.done()` (or return a promise to `onrefresh`) to finish.
 * Also exposes `refresh()` for a keyboard / button path.
 * Attributes: `threshold`, `disabled`, `label` (status text, "Refreshing").
 * Reduced motion: no stretch; the spinner simply appears while refreshing.
 */
interface UsaPullRefreshElement extends UsaElement {
    readonly refreshing: boolean;
    refresh(): Promise<void>;
}
declare function definePullRefresh(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-fab>` — floating action button with a speed dial. The first element
 * child is the main button; the others are actions that fan out with a
 * staggered spring when it opens (`direction="up"` default, `down`, `left`,
 * `right`, `radial`). Esc / outside click closes; `aria-expanded` on the
 * main button; actions are hidden from AT while closed.
 * Attributes: `open`, `direction`, `position` (`bottom-right` default, `bottom-left`,
 * `inline`), `gap` (px, 56), `variant`. Events: `usa:toggle` (`{ open }`).
 * Reduced motion: actions appear without travel.
 */
interface UsaFabElement extends UsaElement {
    open: boolean;
    toggle(force?: boolean): void;
}
declare function defineFab(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-navbar>` — an app bar that hides while you scroll down and returns
 * as soon as you scroll up (or reach the top); `shrink` makes it compact
 * once scrolled. Focus inside always reveals it.
 * Attributes: `threshold` (px of scroll before hiding, 64), `shrink`,
 * `target` (selector of a scroll container instead of the page), `variant`.
 * State attributes: `data-hidden`, `data-scrolled`. Events: `usa:hide`, `usa:show`.
 * Reduced motion: hides/shows without sliding (instant).
 */
interface UsaNavbarElement extends UsaElement {
    readonly hiddenByScroll: boolean;
    show(): void;
}
declare function defineNavbar(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-slider>` — a form-associated range slider (`role="slider"`). The
 * thumb follows with a spring, grows while dragged and shows a value bubble.
 * Keyboard: arrows (step), PageUp/PageDown (10 steps), Home/End.
 * Attributes: `value`, `min` (0), `max` (100), `step` (1), `name`, `label`,
 * `bubble` (show the value while dragging), `disabled`, `variant`.
 * Events: `input` + `usa:input` while moving, `change` + `usa:change` on release.
 * Reduced motion: the thumb jumps (no spring).
 */
interface UsaSliderElement extends UsaElement {
    value: number;
}
declare function defineSlider(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-rating>` — star rating with hover preview and a springy pop when a
 * value is chosen. `role="slider"` (arrow keys, Home/End, number keys).
 * Attributes: `value` (0), `max` (5), `icon` (★), `readonly`, `label`
 * ("Rating"), `name` (form value), `variant`. Events: `change`, `usa:change` (`{ value }`).
 * Reduced motion: no pop.
 */
interface UsaRatingElement extends UsaElement {
    value: number;
}
declare function defineRating(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-tooltip text="…">` — a tooltip for the element it wraps, shown on
 * hover (after `delay` ms, 300) and on keyboard focus, hidden on Esc / blur.
 * It springs in from its placement side and flips to stay on screen; the
 * trigger gets `aria-describedby`.
 * Attributes: `text`, `placement` (`top` default, `bottom`, `left`, `right`),
 * `delay`, `variant`. Reduced motion: fades only.
 */
interface UsaTooltipElement extends UsaElement {
    show(): void;
    hide(): void;
}
declare function defineTooltip(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-popover>` — a click-to-open popover: the first element child is the
 * trigger, `[data-popover]` is the content. Springs open from the trigger,
 * flips to stay on screen; Esc or an outside click closes and focus returns
 * to the trigger. `aria-expanded` / `aria-controls` on the trigger.
 * Attributes: `open`, `placement` (`bottom` default), `variant`. Events:
 * `usa:open`, `usa:close`. Reduced motion: fades only.
 */
interface UsaPopoverElement extends UsaElement {
    open: boolean;
    toggle(force?: boolean): void;
}
declare function definePopover(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-badge>` — a count / dot badge on whatever it wraps; bumps with a
 * spring whenever the value changes and pulses with `pulse`.
 * Attributes: `value` (number or text; 0 / empty hides it unless
 * `show-zero`), `max` (99 → "99+"), `dot`, `pulse`, `label` (accessible
 * text, default "{n} new"), `variant`. Reduced motion: no bump or pulse.
 */
interface UsaBadgeElement extends UsaElement {
    value: string;
}
declare function defineBadge(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-avatar-stack>` — overlapping avatars (its children: `<img>` or any
 * element) that spread apart with a spring on hover / focus; extra ones
 * collapse into a "+N" chip.
 * Attributes: `max` (visible avatars, 5), `size` (px, 36), `overlap` (0–1,
 * 0.35), `label` (group name), `variant`. Reduced motion: no spreading.
 */
interface UsaAvatarStackElement extends UsaElement {
}
declare function defineAvatarStack(tag?: string): CustomElementConstructor | undefined;

/**
 * Style variants (v2.6): `variant="minimal | neon | glass | brutalist |
 * fluent | material"` on any `<usa-*>` element — or on any ancestor as
 * `data-usa-variant`, or page-wide with `setVariant()` — sets the shared
 * design tokens every component reads:
 *
 * `--usa-accent`, `--usa-accent-text`, `--usa-surface`, `--usa-text`,
 * `--usa-radius`, `--usa-border`, `--usa-shadow`, `--usa-blur`, `--usa-font`.
 *
 * (`<usa-spinner>`, `<usa-check>` and `<usa-dialog>` already use `variant`
 * for their kind; the token names never clash with those values except
 * `fluent`, which means the same thing there.)
 */
declare const VARIANTS: readonly ["minimal", "neon", "glass", "brutalist", "fluent", "material"];
type Variant = (typeof VARIANTS)[number];
/** Inject the variant token sheet (done automatically by every `ui` component). */
declare function adoptVariants(): void;
/** Apply a variant to the whole page (or `root`); `null` removes it. */
declare function setVariant(variant: Variant | null, root?: Element | null): void;

type Placement = 'top' | 'bottom' | 'left' | 'right';

/**
 * use-scroll-animate/components/ui — animated UI components + style variants (v2.6).
 * `<usa-tabs>`, `<usa-drawer>`, `<usa-bottom-sheet>`, `<usa-pull-refresh>`,
 * `<usa-fab>`, `<usa-navbar>`, `<usa-slider>`, `<usa-rating>`,
 * `<usa-tooltip>`, `<usa-popover>`, `<usa-badge>`, `<usa-avatar-stack>`,
 * and `variant="minimal | neon | glass | brutalist | fluent | material"`
 * design tokens (`setVariant()`, `VARIANTS`).
 */

/** Register every component of this category under its default tag. */
declare function defineUiComponents(): void;
declare global {
    interface HTMLElementTagNameMap {
        'usa-tabs': UsaTabsElement;
        'usa-drawer': UsaDrawerElement;
        'usa-bottom-sheet': UsaBottomSheetElement;
        'usa-pull-refresh': UsaPullRefreshElement;
        'usa-fab': UsaFabElement;
        'usa-navbar': UsaNavbarElement;
        'usa-slider': UsaSliderElement;
        'usa-rating': UsaRatingElement;
        'usa-tooltip': UsaTooltipElement;
        'usa-popover': UsaPopoverElement;
        'usa-badge': UsaBadgeElement;
        'usa-avatar-stack': UsaAvatarStackElement;
    }
}

export { VARIANTS, adoptVariants, configureComponents, defineAvatarStack, defineBadge, defineBottomSheet, defineDrawer, defineFab, defineNavbar, definePopover, definePullRefresh, defineRating, defineSlider, defineTabs, defineTooltip, defineUiComponents, prefersReducedMotion, setVariant };
export type { ComponentsConfig, Placement, UsaAvatarStackElement, UsaBadgeElement, UsaBottomSheetElement, UsaDrawerElement, UsaElement, UsaFabElement, UsaNavbarElement, UsaPopoverElement, UsaPullRefreshElement, UsaRatingElement, UsaSliderElement, UsaTabsElement, UsaTooltipElement, Variant };
