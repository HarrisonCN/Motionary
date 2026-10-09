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
var components_svg = require('./components/svg.cjs');
var components_webgl = require('./components/webgl.cjs');
var components_depth = require('./components/depth.cjs');
var components_layout = require('./components/layout.cjs');
var components_packs = require('./components/packs.cjs');
var components_fx = require('./components/fx.cjs');
var variants = require('./chunks/variants-cVfgIaXa.cjs');
var base = require('./chunks/base-B3me2y0o.cjs');
var components_tokens = require('./components/tokens.cjs');
var components_a11y = require('./components/a11y.cjs');
var components_perf = require('./components/perf.cjs');
var components_bridge = require('./components/bridge.cjs');
var indexTags = require('./chunks/index-tags-hLIF2Clq.cjs');
var builtins = require('./chunks/builtins-Cz3iufK6.cjs');
var registry = require('./chunks/registry-BB1oO-lR.cjs');
var spring = require('./chunks/spring-DcM7pQgx.cjs');
var core = require('./chunks/core-KIvPGg0c.cjs');
var core$1 = require('./chunks/core-BdLFN0RS.cjs');
var fx = require('./chunks/fx-BaPAanPW.cjs');

/**
 * motionary/components
 *
 * Framework-agnostic, dependency-free animated UI components built on
 * Custom Elements + CSS + the Web Animations API. They run in any browser
 * and in Windows desktop apps that render with a web view: Electron, Tauri
 * (WebView2), WinUI 3 / WPF / WinForms with WebView2, and installed PWAs.
 *
 * ```js
 * import { defineComponents } from 'motionary/components';
 * defineComponents(); // registers every <usa-*> element
 * // or only what you use (tree-shakable):
 * import { defineTypewriter } from 'motionary/components/text';
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
    svg: components_svg.defineSvgComponents,
    webgl: components_webgl.defineWebglComponents,
    depth: components_depth.defineDepthComponents,
    layout: components_layout.defineLayoutComponents,
    packs: components_packs.definePacksComponents,
    fx: components_fx.defineFxComponents,
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
exports.JOINING_SCRIPT = components_text.JOINING_SCRIPT;
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
exports.graphemes = components_text.graphemes;
exports.scrambleFrame = components_text.scrambleFrame;
exports.splitOrder = components_text.splitOrder;
exports.splitText = components_text.splitText;
exports.splitTimeline = components_text.splitTimeline;
exports.splitWords = components_text.splitWords;
exports.defineInteractionComponents = components_interaction.defineInteractionComponents;
exports.defineMagnetic = components_interaction.defineMagnetic;
exports.definePress = components_interaction.definePress;
exports.defineRipple = components_interaction.defineRipple;
exports.defineSpotlight = components_interaction.defineSpotlight;
exports.defineTilt = components_interaction.defineTilt;
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
exports.defineAccordion = components_transitions.defineAccordion;
exports.defineDialog = components_transitions.defineDialog;
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
exports.defineButton = components_click.defineButton;
exports.defineCheckbox = components_click.defineCheckbox;
exports.defineClick = components_click.defineClick;
exports.defineClickComponents = components_click.defineClickComponents;
exports.defineDoubleTap = components_click.defineDoubleTap;
exports.defineHold = components_click.defineHold;
exports.defineIconMorph = components_click.defineIconMorph;
exports.defineLike = components_click.defineLike;
exports.morphPath = components_click.morphPath;
exports.defineAvatarStack = components_ui.defineAvatarStack;
exports.defineBadge = components_ui.defineBadge;
exports.defineBottomSheet = components_ui.defineBottomSheet;
exports.defineDrawer = components_ui.defineDrawer;
exports.defineFab = components_ui.defineFab;
exports.defineNavbar = components_ui.defineNavbar;
exports.definePopover = components_ui.definePopover;
exports.definePullRefresh = components_ui.definePullRefresh;
exports.defineSlider = components_ui.defineSlider;
exports.defineTabs = components_ui.defineTabs;
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
exports.getMotionLevel = components_page.getMotionLevel;
exports.loadingBar = components_page.loadingBar;
exports.pageTransition = components_page.pageTransition;
exports.restoreMotionIntensity = components_page.restoreMotionIntensity;
exports.scrollToTarget = components_page.scrollToTarget;
exports.setMotionIntensity = components_page.setMotionIntensity;
exports.setMotionLevel = components_page.setMotionLevel;
exports.smoothScroll = components_page.smoothScroll;
exports.supportsViewTransitions = components_page.supportsViewTransitions;
exports.themeTransition = components_page.themeTransition;
exports.defineTimeline = components_timeline.defineTimeline;
exports.defineTimelineComponents = components_timeline.defineTimelineComponents;
exports.defineGestureComponents = components_gesture.defineGestureComponents;
exports.definePinchZoom = components_gesture.definePinchZoom;
exports.defineSwipeable = components_gesture.defineSwipeable;
exports.ANIM_ICONS = components_svg.ANIM_ICONS;
exports.MASK_SHAPES = components_svg.MASK_SHAPES;
exports.defineAnimIcon = components_svg.defineAnimIcon;
exports.defineDraw = components_svg.defineDraw;
exports.defineMaskReveal = components_svg.defineMaskReveal;
exports.defineMorph = components_svg.defineMorph;
exports.defineSvgComponents = components_svg.defineSvgComponents;
exports.drawLines = components_svg.drawLines;
exports.interpolatePath = components_svg.interpolatePath;
exports.morphTo = components_svg.morphTo;
exports.pathsCompatible = components_svg.pathsCompatible;
exports.GL_FALLBACKS = components_webgl.GL_FALLBACKS;
exports.PARTICLE_PRESETS = components_webgl.PARTICLE_PRESETS;
exports.POST_EFFECTS = components_webgl.POST_EFFECTS;
exports.SHADERS = components_webgl.SHADERS;
exports.defineDistort = components_webgl.defineDistort;
exports.defineLiquid = components_webgl.defineLiquid;
exports.definePostFx = components_webgl.definePostFx;
exports.defineShader = components_webgl.defineShader;
exports.defineWebglComponents = components_webgl.defineWebglComponents;
exports.fragmentSource = components_webgl.fragmentSource;
exports.glFallbackCss = components_webgl.glFallbackCss;
exports.glGovernor = components_webgl.glGovernor;
exports.glQuad = components_webgl.glQuad;
exports.postFxShader = components_webgl.postFxShader;
exports.supportsWebGL = components_webgl.supportsWebGL;
exports.watchPowerSaver = components_webgl.watchPowerSaver;
exports.defineCube = components_depth.defineCube;
exports.defineDepth = components_depth.defineDepth;
exports.defineDepthComponents = components_depth.defineDepthComponents;
exports.deviceTilt = components_depth.deviceTilt;
exports.orientationToTilt = components_depth.orientationToTilt;
exports.requestOrientationPermission = components_depth.requestOrientationPermission;
exports.supportsOrientation = components_depth.supportsOrientation;
exports.autoAnimate = components_layout.autoAnimate;
exports.defineAutoAnimate = components_layout.defineAutoAnimate;
exports.defineLayoutComponents = components_layout.defineLayoutComponents;
exports.defineMasonry = components_layout.defineMasonry;
exports.flipFrames = components_layout.flipFrames;
exports.masonryLayout = components_layout.masonryLayout;
exports.sharedTransition = components_layout.sharedTransition;
exports.PACKS = components_packs.PACKS;
exports.PACK_PRIMITIVES = components_packs.PACK_PRIMITIVES;
exports.applyPack = components_packs.applyPack;
exports.countUp = components_packs.countUp;
exports.definePack = components_packs.definePack;
exports.definePacksComponents = components_packs.definePacksComponents;
exports.flyToCart = components_packs.flyToCart;
exports.defineFx = components_fx.defineFx;
exports.defineFxComponents = components_fx.defineFxComponents;
exports.registerBuiltinEffects = components_fx.registerBuiltinEffects;
exports.VARIANTS = variants.VARIANTS;
exports.adoptVariants = variants.adoptVariants;
exports.setVariant = variants.setVariant;
exports.MOTION_SCALE = base.MOTION_SCALE;
exports.MOTION_SENSITIVITY_LEVELS = base.MOTION_SENSITIVITY_LEVELS;
exports.activeAnimations = base.activeAnimations;
exports.adaptKeyframes = base.adaptKeyframes;
exports.animateWithMotion = base.animateWithMotion;
exports.animationBudget = base.animationBudget;
exports.configureComponents = base.configureComponents;
exports.getMotionIntensity = base.getMotionIntensity;
exports.getMotionSensitivity = base.getMotionSensitivity;
exports.motionScale = base.motionScale;
exports.onFrame = base.onFrame;
exports.prefersReducedMotion = base.prefersReducedMotion;
exports.schedulerStats = base.schedulerStats;
exports.setAnimationBudget = base.setAnimationBudget;
exports.withoutDeprecations = base.withoutDeprecations;
exports.MOTION_TOKENS = components_tokens.MOTION_TOKENS;
exports.applyMotionTokens = components_tokens.applyMotionTokens;
exports.exportDesignTokens = components_tokens.exportDesignTokens;
exports.getMotionTokens = components_tokens.getMotionTokens;
exports.importDesignTokens = components_tokens.importDesignTokens;
exports.importMotionTokens = components_tokens.importMotionTokens;
exports.mergeMotionTokens = components_tokens.mergeMotionTokens;
exports.motionToken = components_tokens.motionToken;
exports.motionTokensToCss = components_tokens.motionTokensToCss;
exports.motionTokensToJSON = components_tokens.motionTokensToJSON;
exports.motionTokensToVars = components_tokens.motionTokensToVars;
exports.motionVar = components_tokens.motionVar;
exports.parseDuration = components_tokens.parseDuration;
exports.parseEasing = components_tokens.parseEasing;
exports.resolveDurationToken = components_tokens.resolveDurationToken;
exports.resolveEasingToken = components_tokens.resolveEasingToken;
exports.resolveTokenAliases = components_tokens.resolveTokenAliases;
exports.validateDesignTokens = components_tokens.validateDesignTokens;
exports.ALL_TAGS = components_a11y.ALL_TAGS;
exports.LIVE_REGION_IDS = components_a11y.LIVE_REGION_IDS;
exports.MOTION_SENSITIVITY = components_a11y.MOTION_SENSITIVITY;
exports.SENSITIVITY_CSS = components_a11y.SENSITIVITY_CSS;
exports.STATIC_ALTERNATIVES = components_a11y.STATIC_ALTERNATIVES;
exports.announce = components_a11y.announce;
exports.auditMotionA11y = components_a11y.auditMotionA11y;
exports.baselineReport = components_a11y.baselineReport;
exports.liveRegion = components_a11y.liveRegion;
exports.motionAllowed = components_a11y.motionAllowed;
exports.restoreMotionSensitivity = components_a11y.restoreMotionSensitivity;
exports.setMotionSensitivity = components_a11y.setMotionSensitivity;
exports.staticAlternative = components_a11y.staticAlternative;
exports.warnBaseline = components_a11y.warnBaseline;
exports.autoDegrade = components_perf.autoDegrade;
exports.categoryOf = components_perf.categoryOf;
exports.loadCategoryStyles = components_perf.loadCategoryStyles;
exports.loadedStyles = components_perf.loadedStyles;
exports.onDemandStyles = components_perf.onDemandStyles;
exports.BRIDGE_PROTOCOL_VERSION = components_bridge.BRIDGE_PROTOCOL_VERSION;
exports.applyNativeSettings = components_bridge.applyNativeSettings;
exports.connectNativeShell = components_bridge.connectNativeShell;
exports.detectNativeHost = components_bridge.detectNativeHost;
exports.parseNativeSettings = components_bridge.parseNativeSettings;
exports.postToNative = components_bridge.postToNative;
exports.COMPONENT_CATEGORIES = indexTags.COMPONENT_CATEGORIES;
exports.BUILTIN_EFFECTS = builtins.BUILTIN_EFFECTS;
exports.EFFECT_KINDS = registry.EFFECT_KINDS;
exports.EFFECT_TRIGGERS = registry.EFFECT_TRIGGERS;
exports.bindEffect = registry.bindEffect;
exports.getEffect = registry.getEffect;
exports.hasEffect = registry.hasEffect;
exports.listEffects = registry.listEffects;
exports.playEffect = registry.playEffect;
exports.registerEffect = registry.registerEffect;
exports.registerEffects = registry.registerEffects;
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
exports.TIMELINE_PRESETS = core.TIMELINE_PRESETS;
exports.resolvePosition = core.resolvePosition;
exports.supportsNativeScrub = core.supportsNativeScrub;
exports.timeline = core.timeline;
exports.gesture = core$1.gesture;
exports.pinchScale = core$1.pinchScale;
exports.swipeDirection = core$1.swipeDirection;
exports.haptic = fx.haptic;
exports.defineComponents = defineComponents;
//# sourceMappingURL=components.cjs.map
