// Smoke-test the published entry points (run after `npm run build`).
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';

const require = createRequire(import.meta.url);
const entries = {
  'motionary': ['createScrollAnimate', 'getScrollProgress', 'supportsScrollTimeline', 'staggerChildren', 'timeline', 'parallax', 'PRESETS', 'registerPresets', 'reversePreset'],
  'motionary/presets/extended': ['EXTENDED_PRESETS', 'EXTENDED_PRESET_CATEGORIES', 'registerExtendedPresets'],
  'motionary/react': ['createReactHooks'],
  'motionary/vue': ['createVueComposables'],
  'motionary/svelte': ['scrollAnimate', 'scrollStagger'],
  'motionary/solid': ['scrollAnimate', 'scrollStagger', 'useScrollAnimate'],
  'motionary/element': ['defineScrollAnimate'],
  'motionary/components': ['defineComponents', 'COMPONENT_CATEGORIES', 'configureComponents', 'toast', 'viewTransition', 'flip', 'sharedTransition', 'defineTypewriter', 'defineDialog'],
  'motionary/components/reveal': ['defineRevealComponents', 'defineReveal', 'defineStagger', 'defineScrollProgress', 'defineScrolly'],
  'motionary/components/text': ['defineTextComponents', 'defineTypewriter', 'defineSplitText', 'defineScramble', 'defineCounter', 'defineShimmerText', 'defineTextRotate', 'defineWaveText', 'defineGlitch', 'defineGradientText', 'defineHandwriting', 'defineScrollHighlight'],
  'motionary/components/interaction': ['defineInteractionComponents', 'defineRipple', 'defineMagnetic', 'defineTilt', 'defineSpotlight', 'definePress'],
  'motionary/components/feedback': ['defineFeedbackComponents', 'defineSpinner', 'defineSkeleton', 'defineProgress', 'defineToaster', 'defineCheck', 'toast'],
  'motionary/components/background': ['defineBackgroundComponents', 'defineAurora', 'defineParticles', 'defineGrain', 'defineMarquee', 'defineAcrylic', 'defineGridGlow', 'defineBlobs', 'defineWaterRipple', 'defineDotNetwork', 'fluentPreset'],
  'motionary/components/physics': ['definePhysicsComponents', 'defineSpring', 'defineDraggable', 'defineOverscroll', 'spring', 'springEasing', 'createSpring', 'SPRING_PRESETS', 'projectInertia', 'snapTo', 'rubberBand'],
  'motionary/components/cards': ['defineCardComponents', 'defineCard', 'defineCardStack', 'defineStickyStack', 'defineCarousel3d', 'CARD_EFFECTS'],
  'motionary/components/click': ['defineClickComponents', 'defineClick', 'defineButton', 'defineIconMorph', 'defineLike', 'defineHold', 'defineDoubleTap', 'defineCheckbox', 'haptic', 'morphPath', 'BUTTON_DEFORMS'],
  'motionary/engine': ['motionClock', 'createTimeline', 'resolvePosition', 'hydrateMotion', 'ssrHead', 'HYDRATION_CSS', 'HYDRATE_PRESETS', 'setClock', 'getClock'],
  'motionary/components/ui': ['defineUiComponents', 'defineTabs', 'defineDrawer', 'defineBottomSheet', 'definePullRefresh', 'defineFab', 'defineNavbar', 'defineSlider', 'definePopover', 'defineBadge', 'defineAvatarStack', 'VARIANTS', 'setVariant'],
  'motionary/components/page': ['definePageComponents', 'defineCursor', 'defineFullpage', 'defineLoadingBar', 'defineBackToTop', 'defineAmbient', 'defineSplash', 'defineAutoSkeleton', 'defineMotionSwitch', 'pageTransition', 'enableMpaTransitions', 'themeTransition', 'smoothScroll', 'scrollToTarget', 'loadingBar', 'setMotionIntensity'],
  'motionary/components/react': ['createUsaComponents', 'USA_TAGS', 'eventName'],
  'motionary/components/vue': ['UsaPlugin', 'isUsaElement'],
  'motionary/components/svelte': ['usa', 'defineUsa', 'bindUsa'],
  'motionary/components/solid': ['usa', 'defineUsa', 'bindUsa'],
  'motionary/components/angular': ['usaInitializer', 'defineUsa', 'usaDetail', 'bindUsa'],
  'motionary/components/lazy': ['lazyDefine', 'defineUsed', 'loadCategory', 'categoryOfTag'],
  'motionary/components/transitions': ['defineTransitionComponents', 'defineDialog', 'defineAccordion', 'defineViewSwitch', 'viewTransition', 'flip'],
};

for (const [id, names] of Object.entries(entries)) {
  const esm = await import(id);
  const cjs = require(id);
  for (const mod of [esm, cjs]) {
    for (const name of names) assert.notEqual(typeof mod[name], 'undefined', `${id}: missing export ${name}`);
  }
}
const root = await import('motionary');
assert.equal(typeof root.default.init, 'function', 'default instance');
assert.equal(typeof require('motionary').default.init, 'function', 'default instance (CJS)');
// Browser bundles ship at their CDN paths (served by file path, not through `exports`)
for (const f of ['dist/index.umd.js', 'dist/presets-extended.umd.js', 'dist/element.umd.js', 'dist/components.umd.js', 'dist/components.css']) assert.ok(existsSync(new URL(`../${f}`, import.meta.url)), `missing ${f}`);
require('motionary/package.json');
// Component stylesheets resolve through `exports`
for (const css of ['components.css', 'components/text.css']) assert.ok(require.resolve(`motionary/${css}`).endsWith(`dist/${css}`), css);
// The component entries are SSR-safe: importing them in Node defines nothing and never throws
const comps = await import('motionary/components');
assert.doesNotThrow(() => comps.defineComponents());
assert.equal(comps.toast('x'), null);
// 2.0: the main entry no longer re-exports the framework factories
assert.equal(root.createReactHooks, undefined, 'createReactHooks moved to /react');
// 6.1: importing presets/extended registers its presets in the shared table
assert.ok(root.PRESETS['bounce-in-up'] && root.PRESETS['clip-diamond'], 'extended presets registered');
assert.ok(Object.keys(root.PRESETS).length >= 200, 'preset count');
console.log(`exports OK (ESM + CJS): ${Object.keys(entries).join(', ')}`);
