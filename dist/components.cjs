'use strict';

var components_reveal = require('./components/reveal.cjs');
var components_text = require('./components/text.cjs');
var components_interaction = require('./components/interaction.cjs');
var components_feedback = require('./components/feedback.cjs');
var components_background = require('./components/background.cjs');
var components_transitions = require('./components/transitions.cjs');
var components_physics = require('./components/physics.cjs');
var base = require('./chunks/base-CJ7XfidP.cjs');

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
    reveal: components_reveal.defineRevealComponents,
    text: components_text.defineTextComponents,
    interaction: components_interaction.defineInteractionComponents,
    feedback: components_feedback.defineFeedbackComponents,
    background: components_background.defineBackgroundComponents,
    transitions: components_transitions.defineTransitionComponents,
    physics: components_physics.definePhysicsComponents,
};
/**
 * Register every `<usa-*>` component (or only the given categories).
 * Safe to call more than once and on the server (no-op without DOM).
 */
function defineComponents(categories) {
    (categories || Object.keys(BY_CATEGORY)).forEach((c) => BY_CATEGORY[c]?.());
}

exports.REVEAL_EFFECTS = components_reveal.REVEAL_EFFECTS;
exports.defineReveal = components_reveal.defineReveal;
exports.defineRevealComponents = components_reveal.defineRevealComponents;
exports.defineScrollProgress = components_reveal.defineScrollProgress;
exports.defineScrolly = components_reveal.defineScrolly;
exports.defineStagger = components_reveal.defineStagger;
exports.readScrollProgress = components_reveal.readScrollProgress;
exports.revealKeyframes = components_reveal.revealKeyframes;
exports.defineCounter = components_text.defineCounter;
exports.defineScramble = components_text.defineScramble;
exports.defineShimmerText = components_text.defineShimmerText;
exports.defineSplitText = components_text.defineSplitText;
exports.defineTextComponents = components_text.defineTextComponents;
exports.defineTextRotate = components_text.defineTextRotate;
exports.defineTypewriter = components_text.defineTypewriter;
exports.easeOutExpo = components_text.easeOutExpo;
exports.scrambleFrame = components_text.scrambleFrame;
exports.defineInteractionComponents = components_interaction.defineInteractionComponents;
exports.defineMagnetic = components_interaction.defineMagnetic;
exports.definePress = components_interaction.definePress;
exports.defineRipple = components_interaction.defineRipple;
exports.defineSpotlight = components_interaction.defineSpotlight;
exports.defineTilt = components_interaction.defineTilt;
exports.defineToggle = components_interaction.defineToggle;
exports.SPINNER_VARIANTS = components_feedback.SPINNER_VARIANTS;
exports.defineCheck = components_feedback.defineCheck;
exports.defineFeedbackComponents = components_feedback.defineFeedbackComponents;
exports.defineProgress = components_feedback.defineProgress;
exports.defineSkeleton = components_feedback.defineSkeleton;
exports.defineSpinner = components_feedback.defineSpinner;
exports.defineToaster = components_feedback.defineToaster;
exports.toast = components_feedback.toast;
exports.defineAcrylic = components_background.defineAcrylic;
exports.defineAurora = components_background.defineAurora;
exports.defineBackgroundComponents = components_background.defineBackgroundComponents;
exports.defineGrain = components_background.defineGrain;
exports.defineMarquee = components_background.defineMarquee;
exports.defineParticles = components_background.defineParticles;
exports.connectedAnimation = components_transitions.connectedAnimation;
exports.defineAccordion = components_transitions.defineAccordion;
exports.defineDialog = components_transitions.defineDialog;
exports.defineFlipList = components_transitions.defineFlipList;
exports.defineTransitionComponents = components_transitions.defineTransitionComponents;
exports.defineViewSwitch = components_transitions.defineViewSwitch;
exports.flip = components_transitions.flip;
exports.viewTransition = components_transitions.viewTransition;
exports.SPRING_EFFECTS = components_physics.SPRING_EFFECTS;
exports.SPRING_PRESETS = components_physics.SPRING_PRESETS;
exports.createSpring = components_physics.createSpring;
exports.defineDraggable = components_physics.defineDraggable;
exports.defineOverscroll = components_physics.defineOverscroll;
exports.definePhysicsComponents = components_physics.definePhysicsComponents;
exports.defineSpring = components_physics.defineSpring;
exports.linearEasing = components_physics.linearEasing;
exports.projectInertia = components_physics.projectInertia;
exports.resolveSpring = components_physics.resolveSpring;
exports.rubberBand = components_physics.rubberBand;
exports.snapTo = components_physics.snapTo;
exports.spring = components_physics.spring;
exports.springEasing = components_physics.springEasing;
exports.springEffectKeyframes = components_physics.springEffectKeyframes;
exports.springSamples = components_physics.springSamples;
exports.stepSpring = components_physics.stepSpring;
exports.supportsLinearEasing = components_physics.supportsLinearEasing;
exports.configureComponents = base.configureComponents;
exports.prefersReducedMotion = base.prefersReducedMotion;
exports.COMPONENT_CATEGORIES = COMPONENT_CATEGORIES;
exports.defineComponents = defineComponents;
//# sourceMappingURL=components.cjs.map
