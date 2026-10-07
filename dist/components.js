import { defineRevealComponents } from './components/reveal.js';
export { REVEAL_EFFECTS, defineReveal, defineScrollProgress, defineScrolly, defineStagger, readScrollProgress, revealKeyframes } from './components/reveal.js';
import { defineTextComponents } from './components/text.js';
export { defineCounter, defineGlitch, defineGradientText, defineHandwriting, defineScramble, defineScrollHighlight, defineShimmerText, defineSplitText, defineTextRotate, defineTypewriter, defineWaveText, easeOutExpo, scrambleFrame } from './components/text.js';
import { defineInteractionComponents } from './components/interaction.js';
export { defineMagnetic, definePress, defineRipple, defineSpotlight, defineTilt, defineToggle } from './components/interaction.js';
import { defineFeedbackComponents } from './components/feedback.js';
export { SPINNER_VARIANTS, defineCheck, defineProgress, defineSkeleton, defineSpinner, defineToaster, toast } from './components/feedback.js';
import { defineBackgroundComponents } from './components/background.js';
export { defineAcrylic, defineAurora, defineBlobs, defineDotNetwork, defineGrain, defineGridGlow, defineMarquee, defineParticles, defineWaterRipple, fluentPreset } from './components/background.js';
import { defineTransitionComponents } from './components/transitions.js';
export { connectedAnimation, defineAccordion, defineDialog, defineFlipList, defineViewSwitch, flip, viewTransition } from './components/transitions.js';
import { definePhysicsComponents } from './components/physics.js';
export { SPRING_EFFECTS, defineDraggable, defineOverscroll, defineSpring, springEffectKeyframes } from './components/physics.js';
import { defineCardComponents } from './components/cards.js';
export { CARD_EFFECTS, defineCard, defineCardStack, defineCarousel3d, defineStickyStack } from './components/cards.js';
import { defineClickComponents } from './components/click.js';
export { BUTTON_DEFORMS, CLICK_EFFECTS, MORPH_ICONS, burst, confetti, defineButton, defineCheckbox, defineClick, defineDoubleTap, defineHold, defineIconMorph, defineLike, haptic, morphPath, shake } from './components/click.js';
import { defineUiComponents } from './components/ui.js';
export { defineAvatarStack, defineBadge, defineBottomSheet, defineDrawer, defineFab, defineNavbar, definePopover, definePullRefresh, defineRating, defineSlider, defineTabs, defineTooltip } from './components/ui.js';
import { definePageComponents } from './components/page.js';
export { AMBIENT_EFFECTS, CURSOR_MODES, PAGE_EFFECTS, defineAmbient, defineAutoSkeleton, defineBackToTop, defineCursor, defineFullpage, defineLoadingBar, defineMotionSwitch, defineSplash, enableMpaTransitions, loadingBar, pageTransition, restoreMotionIntensity, scrollToTarget, setMotionIntensity, smoothScroll, supportsViewTransitions, themeTransition } from './components/page.js';
import { a as adoptVariants } from './chunks/variants-Dp_5lJ_J.js';
export { V as VARIANTS, s as setVariant } from './chunks/variants-Dp_5lJ_J.js';
import { c as canDefine } from './chunks/base-Co98Z2iM.js';
export { M as MOTION_SCALE, a as configureComponents, g as getMotionIntensity, p as prefersReducedMotion } from './chunks/base-Co98Z2iM.js';
export { C as COMPONENT_CATEGORIES } from './chunks/index-tags-f37txHmb.js';
export { S as SPRING_PRESETS, c as createSpring, l as linearEasing, p as projectInertia, r as resolveSpring, a as rubberBand, s as snapTo, b as spring, d as springEasing, e as springSamples, f as stepSpring, g as supportsLinearEasing } from './chunks/spring-YNUpez2g.js';

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
const BY_CATEGORY = {
    reveal: defineRevealComponents,
    text: defineTextComponents,
    interaction: defineInteractionComponents,
    feedback: defineFeedbackComponents,
    background: defineBackgroundComponents,
    transitions: defineTransitionComponents,
    physics: definePhysicsComponents,
    cards: defineCardComponents,
    click: defineClickComponents,
    ui: defineUiComponents,
    page: definePageComponents,
};
/**
 * Register every `<usa-*>` component (or only the given categories).
 * Safe to call more than once and on the server (no-op without DOM).
 */
function defineComponents(categories) {
    if (canDefine())
        adoptVariants();
    (categories || Object.keys(BY_CATEGORY)).forEach((c) => BY_CATEGORY[c]?.());
}

export { adoptVariants, defineBackgroundComponents, defineCardComponents, defineClickComponents, defineComponents, defineFeedbackComponents, defineInteractionComponents, definePageComponents, definePhysicsComponents, defineRevealComponents, defineTextComponents, defineTransitionComponents, defineUiComponents };
//# sourceMappingURL=components.js.map
