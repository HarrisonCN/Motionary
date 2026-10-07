'use strict';

var components_reveal = require('./components/reveal.cjs');
var components_text = require('./components/text.cjs');
var components_interaction = require('./components/interaction.cjs');
var components_feedback = require('./components/feedback.cjs');
var components_background = require('./components/background.cjs');
var components_transitions = require('./components/transitions.cjs');
var components_physics = require('./components/physics.cjs');
var components_cards = require('./components/cards.cjs');
var components_click = require('./components/click.cjs');
var components_ui = require('./components/ui.cjs');
var components_page = require('./components/page.cjs');
var components_timeline = require('./components/timeline.cjs');
var components_gesture = require('./components/gesture.cjs');
var variants = require('./chunks/variants-BNIrn4ch.cjs');
var base = require('./chunks/base-CXx7jZ-o.cjs');
var indexTags = require('./chunks/index-tags-DCTX4F9b.cjs');
var spring = require('./chunks/spring-2OTnYCzm.cjs');

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
    reveal: components_reveal.defineRevealComponents,
    text: components_text.defineTextComponents,
    interaction: components_interaction.defineInteractionComponents,
    feedback: components_feedback.defineFeedbackComponents,
    background: components_background.defineBackgroundComponents,
    transitions: components_transitions.defineTransitionComponents,
    physics: components_physics.definePhysicsComponents,
    cards: components_cards.defineCardComponents,
    click: components_click.defineClickComponents,
    ui: components_ui.defineUiComponents,
    page: components_page.definePageComponents,
    timeline: components_timeline.defineTimelineComponents,
    gesture: components_gesture.defineGestureComponents,
};
/**
 * Register every `<usa-*>` component (or only the given categories).
 * Safe to call more than once and on the server (no-op without DOM).
 */
function defineComponents(categories) {
    if (base.canDefine())
        variants.adoptVariants();
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
exports.defineGlitch = components_text.defineGlitch;
exports.defineGradientText = components_text.defineGradientText;
exports.defineHandwriting = components_text.defineHandwriting;
exports.defineScramble = components_text.defineScramble;
exports.defineScrollHighlight = components_text.defineScrollHighlight;
exports.defineShimmerText = components_text.defineShimmerText;
exports.defineSplitText = components_text.defineSplitText;
exports.defineTextComponents = components_text.defineTextComponents;
exports.defineTextRotate = components_text.defineTextRotate;
exports.defineTypewriter = components_text.defineTypewriter;
exports.defineWaveText = components_text.defineWaveText;
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
exports.defineBlobs = components_background.defineBlobs;
exports.defineDotNetwork = components_background.defineDotNetwork;
exports.defineGrain = components_background.defineGrain;
exports.defineGridGlow = components_background.defineGridGlow;
exports.defineMarquee = components_background.defineMarquee;
exports.defineParticles = components_background.defineParticles;
exports.defineWaterRipple = components_background.defineWaterRipple;
exports.fluentPreset = components_background.fluentPreset;
exports.connectedAnimation = components_transitions.connectedAnimation;
exports.defineAccordion = components_transitions.defineAccordion;
exports.defineDialog = components_transitions.defineDialog;
exports.defineFlipList = components_transitions.defineFlipList;
exports.defineTransitionComponents = components_transitions.defineTransitionComponents;
exports.defineViewSwitch = components_transitions.defineViewSwitch;
exports.flip = components_transitions.flip;
exports.viewTransition = components_transitions.viewTransition;
exports.SPRING_EFFECTS = components_physics.SPRING_EFFECTS;
exports.defineDraggable = components_physics.defineDraggable;
exports.defineOverscroll = components_physics.defineOverscroll;
exports.definePhysicsComponents = components_physics.definePhysicsComponents;
exports.defineSpring = components_physics.defineSpring;
exports.springEffectKeyframes = components_physics.springEffectKeyframes;
exports.CARD_EFFECTS = components_cards.CARD_EFFECTS;
exports.defineCard = components_cards.defineCard;
exports.defineCardComponents = components_cards.defineCardComponents;
exports.defineCardStack = components_cards.defineCardStack;
exports.defineCarousel3d = components_cards.defineCarousel3d;
exports.defineStickyStack = components_cards.defineStickyStack;
exports.BUTTON_DEFORMS = components_click.BUTTON_DEFORMS;
exports.CLICK_EFFECTS = components_click.CLICK_EFFECTS;
exports.MORPH_ICONS = components_click.MORPH_ICONS;
exports.burst = components_click.burst;
exports.confetti = components_click.confetti;
exports.defineButton = components_click.defineButton;
exports.defineCheckbox = components_click.defineCheckbox;
exports.defineClick = components_click.defineClick;
exports.defineClickComponents = components_click.defineClickComponents;
exports.defineDoubleTap = components_click.defineDoubleTap;
exports.defineHold = components_click.defineHold;
exports.defineIconMorph = components_click.defineIconMorph;
exports.defineLike = components_click.defineLike;
exports.haptic = components_click.haptic;
exports.morphPath = components_click.morphPath;
exports.shake = components_click.shake;
exports.defineAvatarStack = components_ui.defineAvatarStack;
exports.defineBadge = components_ui.defineBadge;
exports.defineBottomSheet = components_ui.defineBottomSheet;
exports.defineDrawer = components_ui.defineDrawer;
exports.defineFab = components_ui.defineFab;
exports.defineNavbar = components_ui.defineNavbar;
exports.definePopover = components_ui.definePopover;
exports.definePullRefresh = components_ui.definePullRefresh;
exports.defineRating = components_ui.defineRating;
exports.defineSlider = components_ui.defineSlider;
exports.defineTabs = components_ui.defineTabs;
exports.defineTooltip = components_ui.defineTooltip;
exports.defineUiComponents = components_ui.defineUiComponents;
exports.AMBIENT_EFFECTS = components_page.AMBIENT_EFFECTS;
exports.CURSOR_MODES = components_page.CURSOR_MODES;
exports.PAGE_EFFECTS = components_page.PAGE_EFFECTS;
exports.defineAmbient = components_page.defineAmbient;
exports.defineAutoSkeleton = components_page.defineAutoSkeleton;
exports.defineBackToTop = components_page.defineBackToTop;
exports.defineCursor = components_page.defineCursor;
exports.defineFullpage = components_page.defineFullpage;
exports.defineLoadingBar = components_page.defineLoadingBar;
exports.defineMotionSwitch = components_page.defineMotionSwitch;
exports.definePageComponents = components_page.definePageComponents;
exports.defineSplash = components_page.defineSplash;
exports.enableMpaTransitions = components_page.enableMpaTransitions;
exports.loadingBar = components_page.loadingBar;
exports.pageTransition = components_page.pageTransition;
exports.restoreMotionIntensity = components_page.restoreMotionIntensity;
exports.scrollToTarget = components_page.scrollToTarget;
exports.setMotionIntensity = components_page.setMotionIntensity;
exports.smoothScroll = components_page.smoothScroll;
exports.supportsViewTransitions = components_page.supportsViewTransitions;
exports.themeTransition = components_page.themeTransition;
exports.TIMELINE_PRESETS = components_timeline.TIMELINE_PRESETS;
exports.defineTimeline = components_timeline.defineTimeline;
exports.defineTimelineComponents = components_timeline.defineTimelineComponents;
exports.resolvePosition = components_timeline.resolvePosition;
exports.timeline = components_timeline.timeline;
exports.defineGestureComponents = components_gesture.defineGestureComponents;
exports.definePinchZoom = components_gesture.definePinchZoom;
exports.defineSwipeable = components_gesture.defineSwipeable;
exports.gesture = components_gesture.gesture;
exports.pinchScale = components_gesture.pinchScale;
exports.swipeDirection = components_gesture.swipeDirection;
exports.VARIANTS = variants.VARIANTS;
exports.adoptVariants = variants.adoptVariants;
exports.setVariant = variants.setVariant;
exports.MOTION_SCALE = base.MOTION_SCALE;
exports.configureComponents = base.configureComponents;
exports.getMotionIntensity = base.getMotionIntensity;
exports.prefersReducedMotion = base.prefersReducedMotion;
exports.COMPONENT_CATEGORIES = indexTags.COMPONENT_CATEGORIES;
exports.SPRING_PRESETS = spring.SPRING_PRESETS;
exports.createSpring = spring.createSpring;
exports.linearEasing = spring.linearEasing;
exports.projectInertia = spring.projectInertia;
exports.resolveSpring = spring.resolveSpring;
exports.rubberBand = spring.rubberBand;
exports.snapTo = spring.snapTo;
exports.spring = spring.spring;
exports.springEasing = spring.springEasing;
exports.springSamples = spring.springSamples;
exports.stepSpring = spring.stepSpring;
exports.supportsLinearEasing = spring.supportsLinearEasing;
exports.defineComponents = defineComponents;
//# sourceMappingURL=components.cjs.map
