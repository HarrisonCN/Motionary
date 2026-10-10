import { defineRevealComponents } from './components/reveal.js';
export { REVEAL_EFFECTS, defineReveal, defineScrollProgress, defineScrolly, defineStagger, readScrollProgress, revealKeyframes } from './components/reveal.js';
import { defineTextComponents } from './components/text.js';
export { JOINING_SCRIPT, defineCounter, defineGlitch, defineGradientText, defineHandwriting, defineScramble, defineScrollHighlight, defineShimmerText, defineSplitText, defineTextRotate, defineTypewriter, defineWaveText, easeOutExpo, graphemes, scrambleFrame, splitOrder, splitText, splitTimeline, splitWords } from './components/text.js';
import { defineInteractionComponents } from './components/interaction.js';
export { defineMagnetic, definePress, defineRipple, defineSpotlight, defineTilt } from './components/interaction.js';
import { defineFeedbackComponents } from './components/feedback.js';
export { SPINNER_VARIANTS, defineCheck, defineProgress, defineSkeleton, defineSpinner, defineToaster, toast } from './components/feedback.js';
import { defineBackgroundComponents } from './components/background.js';
export { defineAcrylic, defineAurora, defineBlobs, defineDotNetwork, defineGrain, defineGridGlow, defineMarquee, defineParticles, defineWaterRipple, fluentPreset } from './components/background.js';
import { defineTransitionComponents } from './components/transitions.js';
export { defineAccordion, defineDialog, defineViewSwitch, flip, viewTransition } from './components/transitions.js';
import { definePhysicsComponents } from './components/physics.js';
export { SPRING_EFFECTS, defineDraggable, defineOverscroll, defineSpring, springEffectKeyframes } from './components/physics.js';
import { defineCardComponents } from './components/cards.js';
export { CARD_EFFECTS, defineCard, defineCardStack, defineCarousel3d, defineStickyStack } from './components/cards.js';
import { defineClickComponents } from './components/click.js';
export { BUTTON_DEFORMS, CLICK_EFFECTS, MORPH_ICONS, defineButton, defineCheckbox, defineClick, defineDoubleTap, defineHold, defineIconMorph, defineLike, morphPath } from './components/click.js';
import { defineUiComponents } from './components/ui.js';
export { defineAvatarStack, defineBadge, defineBottomSheet, defineDrawer, defineFab, defineNavbar, definePopover, definePullRefresh, defineSlider, defineTabs } from './components/ui.js';
import { definePageComponents } from './components/page.js';
export { AMBIENT_EFFECTS, CURSOR_MODES, PAGE_EFFECTS, defineAmbient, defineAutoSkeleton, defineBackToTop, defineCursor, defineFullpage, defineLoadingBar, defineMotionSwitch, defineSplash, enableMpaTransitions, getMotionLevel, loadingBar, pageTransition, restoreMotionIntensity, scrollToTarget, setMotionIntensity, setMotionLevel, smoothScroll, supportsViewTransitions, themeTransition } from './components/page.js';
import { defineTimelineComponents } from './components/timeline.js';
export { defineTimeline } from './components/timeline.js';
import { defineGestureComponents } from './components/gesture.js';
export { definePinchZoom, defineSwipeable } from './components/gesture.js';
import { defineSvgComponents } from './components/svg.js';
export { ANIM_ICONS, MASK_SHAPES, defineAnimIcon, defineDraw, defineMaskReveal, defineMorph, drawLines, interpolatePath, morphTo, pathsCompatible } from './components/svg.js';
import { defineWebglComponents } from './components/webgl.js';
export { GL_FALLBACKS, PARTICLE_PRESETS, POST_EFFECTS, SHADERS, defineDistort, defineLiquid, definePostFx, defineShader, fragmentSource, glFallbackCss, glGovernor, glQuad, postFxShader, supportsWebGL, watchPowerSaver } from './components/webgl.js';
import { defineDepthComponents } from './components/depth.js';
export { defineCube, defineDepth, deviceTilt, orientationToTilt, requestOrientationPermission, supportsOrientation } from './components/depth.js';
import { defineLayoutComponents } from './components/layout.js';
export { autoAnimate, defineAutoAnimate, defineMasonry, flipFrames, masonryLayout, sharedTransition } from './components/layout.js';
import { definePacksComponents } from './components/packs.js';
export { PACKS, PACK_PRIMITIVES, applyPack, countUp, definePack, flyToCart } from './components/packs.js';
import { defineFxComponents } from './components/fx.js';
export { defineFx, registerBuiltinEffects } from './components/fx.js';
import { a as adoptVariants } from './chunks/variants-DRi3tBJf.js';
export { V as VARIANTS, s as setVariant } from './chunks/variants-DRi3tBJf.js';
import { i as canDefine } from './chunks/base-zSGb8ujt.js';
export { j as MOTION_SCALE, M as MOTION_SENSITIVITY_LEVELS, k as activeAnimations, l as adaptKeyframes, e as animateWithMotion, q as animationBudget, c as configureComponents, u as getMotionIntensity, g as getMotionSensitivity, m as motionScale, v as onFrame, p as prefersReducedMotion, w as schedulerStats, x as setAnimationBudget, y as withoutDeprecations } from './chunks/base-zSGb8ujt.js';
export { MOTION_TOKENS, applyMotionTokens, exportDesignTokens, getMotionTokens, importDesignTokens, importMotionTokens, mergeMotionTokens, motionToken, motionTokensToCss, motionTokensToJSON, motionTokensToVars, motionVar, parseDuration, parseEasing, resolveDurationToken, resolveEasingToken, resolveTokenAliases, validateDesignTokens } from './components/tokens.js';
export { ALL_TAGS, LIVE_REGION_IDS, MOTION_SENSITIVITY, SENSITIVITY_CSS, STATIC_ALTERNATIVES, announce, auditMotionA11y, baselineReport, liveRegion, motionAllowed, restoreMotionSensitivity, setMotionSensitivity, staticAlternative, warnBaseline } from './components/a11y.js';
export { autoDegrade, categoryOf, loadCategoryStyles, loadedStyles, onDemandStyles } from './components/perf.js';
export { BRIDGE_PROTOCOL_VERSION, applyNativeSettings, connectNativeShell, detectNativeHost, parseNativeSettings, postToNative } from './components/bridge.js';
export { C as COMPONENT_CATEGORIES } from './chunks/index-tags-B-JBecYg.js';
export { B as BUILTIN_EFFECTS } from './chunks/builtins-Simwbnqg.js';
export { EFFECT_KINDS, EFFECT_TRIGGERS, bindEffect, getEffect, hasEffect, listEffects, playEffect, registerEffect, registerEffects } from './chunks/registry-CYojuxi5.js';
export { S as SPRING_PRESETS, c as createSpring, l as linearEasing, p as projectInertia, r as resolveSpring, a as rubberBand, s as snapTo, b as spring, d as springEasing, e as springSamples, f as stepSpring, g as supportsLinearEasing } from './chunks/spring-CznnvQCN.js';
export { T as TIMELINE_PRESETS, r as resolvePosition, s as supportsNativeScrub, t as timeline } from './chunks/core-BOCM9zD5.js';
export { g as gesture, p as pinchScale, s as swipeDirection } from './chunks/core-BcQb_f91.js';
export { h as haptic } from './chunks/fx-DUteojZx.js';
import './chunks/key-click-BLm3BI8_.js';

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
    timeline: defineTimelineComponents,
    gesture: defineGestureComponents,
    svg: defineSvgComponents,
    webgl: defineWebglComponents,
    depth: defineDepthComponents,
    layout: defineLayoutComponents,
    packs: definePacksComponents,
    fx: defineFxComponents,
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

export { adoptVariants, defineBackgroundComponents, defineCardComponents, defineClickComponents, defineComponents, defineDepthComponents, defineFeedbackComponents, defineFxComponents, defineGestureComponents, defineInteractionComponents, defineLayoutComponents, definePacksComponents, definePageComponents, definePhysicsComponents, defineRevealComponents, defineSvgComponents, defineTextComponents, defineTimelineComponents, defineTransitionComponents, defineUiComponents, defineWebglComponents };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.0.0/dist/components.js.map