import { defineRevealComponents } from './components/reveal.js';
export { REVEAL_EFFECTS, defineReveal, defineScrollProgress, defineScrolly, defineStagger, readScrollProgress, revealKeyframes } from './components/reveal.js';
import { defineTextComponents } from './components/text.js';
export { defineCounter, defineScramble, defineShimmerText, defineSplitText, defineTextRotate, defineTypewriter, easeOutExpo, scrambleFrame } from './components/text.js';
import { defineInteractionComponents } from './components/interaction.js';
export { defineMagnetic, definePress, defineRipple, defineSpotlight, defineTilt, defineToggle } from './components/interaction.js';
import { defineFeedbackComponents } from './components/feedback.js';
export { SPINNER_VARIANTS, defineCheck, defineProgress, defineSkeleton, defineSpinner, defineToaster, toast } from './components/feedback.js';
import { defineBackgroundComponents } from './components/background.js';
export { defineAcrylic, defineAurora, defineGrain, defineMarquee, defineParticles } from './components/background.js';
import { defineTransitionComponents } from './components/transitions.js';
export { connectedAnimation, defineAccordion, defineDialog, defineFlipList, defineViewSwitch, flip, viewTransition } from './components/transitions.js';
import { definePhysicsComponents } from './components/physics.js';
export { SPRING_EFFECTS, SPRING_PRESETS, createSpring, defineDraggable, defineOverscroll, defineSpring, linearEasing, projectInertia, resolveSpring, rubberBand, snapTo, spring, springEasing, springEffectKeyframes, springSamples, stepSpring, supportsLinearEasing } from './components/physics.js';
export { c as configureComponents, p as prefersReducedMotion } from './chunks/base-CuvCgqLy.js';

/**
 * use-scroll-animate/components
 *
 * Framework-agnostic, dependency-free animated UI components built on
 * Custom Elements + CSS + the Web Animations API. They run in any browser
 * and in Windows desktop apps that render with a web view: Electron, Tauri
 * (WebView2), WinUI 3 / WPF / WinForms with WebView2, and installed PWAs.
 *
 * ```js
 * import { defineComponents } from 'use-scroll-animate/components';
 * defineComponents(); // registers every <usa-*> element
 * // or only what you use (tree-shakable):
 * import { defineTypewriter } from 'use-scroll-animate/components/text';
 * ```
 *
 * Importing has no side effects and is SSR-safe; nothing is registered
 * until a `define*()` function runs in a browser.
 *
 * @license MIT
 */
/** The component categories and their default tags. */
const COMPONENT_CATEGORIES = {
    reveal: ['usa-reveal', 'usa-stagger', 'usa-scroll-progress', 'usa-scrolly'],
    text: ['usa-typewriter', 'usa-split-text', 'usa-scramble', 'usa-counter', 'usa-shimmer-text', 'usa-text-rotate'],
    interaction: ['usa-ripple', 'usa-magnetic', 'usa-tilt', 'usa-spotlight', 'usa-press', 'usa-toggle'],
    feedback: ['usa-spinner', 'usa-skeleton', 'usa-progress', 'usa-toaster', 'usa-check'],
    background: ['usa-aurora', 'usa-particles', 'usa-grain', 'usa-marquee', 'usa-acrylic'],
    transitions: ['usa-dialog', 'usa-accordion', 'usa-flip-list', 'usa-view-switch'],
    physics: ['usa-spring', 'usa-draggable', 'usa-overscroll'],
};
const BY_CATEGORY = {
    reveal: defineRevealComponents,
    text: defineTextComponents,
    interaction: defineInteractionComponents,
    feedback: defineFeedbackComponents,
    background: defineBackgroundComponents,
    transitions: defineTransitionComponents,
    physics: definePhysicsComponents,
};
/**
 * Register every `<usa-*>` component (or only the given categories).
 * Safe to call more than once and on the server (no-op without DOM).
 */
function defineComponents(categories) {
    (categories || Object.keys(BY_CATEGORY)).forEach((c) => BY_CATEGORY[c]?.());
}

export { COMPONENT_CATEGORIES, defineBackgroundComponents, defineComponents, defineFeedbackComponents, defineInteractionComponents, definePhysicsComponents, defineRevealComponents, defineTextComponents, defineTransitionComponents };
//# sourceMappingURL=components.js.map
