/**
 * Members shared by every `<usa-*>` element. Attribute helpers, a cleanup
 * bag that is emptied on disconnect, and motion helpers that degrade to the
 * final state without WAAPI or under reduced motion.
 */
interface UsaElement extends HTMLElement {
    /** `true` while reduced motion applies to this element. */
    readonly reduced: boolean;
}

declare const CARD_EFFECTS: readonly ["flip", "holo", "glass", "border-glow", "conic-border", "lift", "spotlight", "sheen", "parallax-layers", "expand"];
type CardEffect = (typeof CARD_EFFECTS)[number];
/**
 * `<usa-card>` — card effects, combinable: `effect="lift sheen"`.
 *
 * - `flip` — front/back (`[data-front]` / `[data-back]` children) flip on
 *   hover or `trigger="click"`, `axis="y"` (default, horizontal flip) or `x`.
 * - `holo` — holographic foil that shifts with the pointer.
 * - `glass` — frosted glass surface (backdrop blur).
 * - `border-glow` — a glow on the border that follows the pointer.
 * - `conic-border` — a rotating conic-gradient border.
 * - `lift` — rises with a deeper shadow and a slight pointer tilt.
 * - `spotlight` — a soft light that follows the pointer.
 * - `sheen` — a light sweep across the card on hover / focus.
 * - `parallax-layers` — children with `data-depth="0.2…1"` move at different depths.
 * - `expand` — click to grow into a full detail view (`[data-detail]`
 *   content is shown), FLIP + spring; Esc, `[data-close]` or the backdrop closes.
 *
 * Attributes: `effect`, `axis`, `trigger`, `depth` (parallax px, 16),
 * `color` (glow / spotlight colour), `flipped`, `expanded`, `disabled`.
 * CSS variables: `--usa-card-x/-y` (pointer %, 0–100), `--usa-card-nx/-ny` (−1…1).
 * Methods: `flip(force?)`, `expand()`, `collapse()`. Events: `usa:flip`,
 * `usa:expand`, `usa:collapse`. Reduced motion: no tilt / parallax / sweep;
 * flips and expansions cross-fade.
 */
interface UsaCardElement extends UsaElement {
    readonly effects: string[];
    flipped: boolean;
    readonly expanded: boolean;
    flip(force?: boolean): void;
    expand(): Promise<void>;
    collapse(): Promise<void>;
}
declare function defineCard(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-card-stack>` — a deck of cards (its element children). The top card
 * can be swiped away left or right (pointer, touch or arrow keys); the rest
 * fan out behind it and move up with a spring.
 *
 * Attributes: `threshold` (px to dismiss, 90), `visible` (cards fanned
 * behind, 3), `offset` (px between cards, 10), `loop` (swiped cards go back
 * to the bottom), `disabled`. Methods: `swipe(direction)`, `top`. Events:
 * `usa:swipe` (`{ direction: 'left' | 'right', card }`), `usa:empty`.
 * Reduced motion: cards are removed instantly, no rotation.
 */
interface UsaCardStackElement extends UsaElement {
    readonly top: HTMLElement | null;
    swipe(direction: 'left' | 'right'): Promise<void>;
}
declare function defineCardStack(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-sticky-stack>` — cards (element children) stick to the top while
 * scrolling and the ones underneath scale down and dim as the next card
 * slides over them, like a deck building up.
 *
 * Attributes: `top` (px from the viewport top, 80), `gap` (px each card
 * peeks below the previous, 16), `scale` (how much a covered card shrinks,
 * 0.06). Reduced motion: cards still stack (sticky) but do not scale.
 */
interface UsaStickyStackElement extends UsaElement {
    update(): void;
}
declare function defineStickyStack(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-carousel-3d>` — its element children on a 3D ring. Rotate with the
 * arrow keys, a drag/swipe, the wheel (shift) or `next()` / `prev()`; the
 * front item is `aria-current`. Spring-driven rotation.
 *
 * Attributes: `radius` (px, auto from item width), `autoplay` (ms between
 * steps, pauses on hover/focus), `perspective` (px, 1200), `index`.
 * Events: `usa:change` (`{ index }`). Reduced motion: a flat, instant
 * switch (only the current item is shown, others dimmed).
 */
interface UsaCarousel3dElement extends UsaElement {
    index: number;
    next(): void;
    prev(): void;
    goTo(i: number): void;
}
declare function defineCarousel3d(tag?: string): CustomElementConstructor | undefined;

/**
 * use-scroll-animate/components/cards — card effects (v2.4).
 * `<usa-card effect="flip | holo | glass | border-glow | conic-border | lift |
 * spotlight | sheen | parallax-layers | expand">` (combinable),
 * `<usa-card-stack>` (swipeable deck), `<usa-sticky-stack>` (stacking on
 * scroll) and `<usa-carousel-3d>`.
 */

/** Register every component of this category under its default tag. */
declare function defineCardComponents(): void;
declare global {
    interface HTMLElementTagNameMap {
        'usa-card': UsaCardElement;
        'usa-card-stack': UsaCardStackElement;
        'usa-sticky-stack': UsaStickyStackElement;
        'usa-carousel-3d': UsaCarousel3dElement;
    }
}

export { CARD_EFFECTS, defineCard, defineCardComponents, defineCardStack, defineCarousel3d, defineStickyStack };
export type { CardEffect, UsaCardElement, UsaCardStackElement, UsaCarousel3dElement, UsaStickyStackElement };
