// Smoke-test the published entry points (run after `npm run build`).
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';

const require = createRequire(import.meta.url);
const entries = {
  'use-scroll-animate': ['createScrollAnimate', 'getScrollProgress', 'supportsScrollTimeline', 'staggerChildren', 'sequence', 'parallax', 'PRESETS'],
  'use-scroll-animate/react': ['createReactHooks'],
  'use-scroll-animate/vue': ['createVueComposables'],
  'use-scroll-animate/svelte': ['scrollAnimate', 'scrollStagger'],
  'use-scroll-animate/solid': ['scrollAnimate', 'scrollStagger', 'useScrollAnimate'],
  'use-scroll-animate/element': ['defineScrollAnimate'],
  'use-scroll-animate/components': ['defineComponents', 'COMPONENT_CATEGORIES', 'configureComponents', 'toast', 'viewTransition', 'flip', 'connectedAnimation', 'defineTypewriter', 'defineDialog'],
  'use-scroll-animate/components/reveal': ['defineRevealComponents', 'defineReveal', 'defineStagger', 'defineScrollProgress', 'defineScrolly'],
  'use-scroll-animate/components/text': ['defineTextComponents', 'defineTypewriter', 'defineSplitText', 'defineScramble', 'defineCounter', 'defineShimmerText', 'defineTextRotate'],
  'use-scroll-animate/components/interaction': ['defineInteractionComponents', 'defineRipple', 'defineMagnetic', 'defineTilt', 'defineSpotlight', 'definePress', 'defineToggle'],
  'use-scroll-animate/components/feedback': ['defineFeedbackComponents', 'defineSpinner', 'defineSkeleton', 'defineProgress', 'defineToaster', 'defineCheck', 'toast'],
  'use-scroll-animate/components/background': ['defineBackgroundComponents', 'defineAurora', 'defineParticles', 'defineGrain', 'defineMarquee', 'defineAcrylic'],
  'use-scroll-animate/components/physics': ['definePhysicsComponents', 'defineSpring', 'defineDraggable', 'defineOverscroll', 'spring', 'springEasing', 'createSpring', 'SPRING_PRESETS', 'projectInertia', 'snapTo', 'rubberBand'],
  'use-scroll-animate/components/cards': ['defineCardComponents', 'defineCard', 'defineCardStack', 'defineStickyStack', 'defineCarousel3d', 'CARD_EFFECTS'],
  'use-scroll-animate/components/click': ['defineClickComponents', 'defineClick', 'defineButton', 'defineIconMorph', 'defineLike', 'defineHold', 'defineDoubleTap', 'defineCheckbox', 'burst', 'confetti', 'shake', 'haptic', 'morphPath', 'BUTTON_DEFORMS'],
  'use-scroll-animate/components/ui': ['defineUiComponents', 'defineTabs', 'defineDrawer', 'defineBottomSheet', 'definePullRefresh', 'defineFab', 'defineNavbar', 'defineSlider', 'defineRating', 'defineTooltip', 'definePopover', 'defineBadge', 'defineAvatarStack', 'VARIANTS', 'setVariant'],
  'use-scroll-animate/components/page': ['definePageComponents', 'defineCursor', 'defineFullpage', 'defineLoadingBar', 'defineBackToTop', 'defineAmbient', 'defineSplash', 'defineAutoSkeleton', 'defineMotionSwitch', 'pageTransition', 'enableMpaTransitions', 'themeTransition', 'smoothScroll', 'scrollToTarget', 'loadingBar', 'setMotionIntensity'],
  'use-scroll-animate/components/transitions': ['defineTransitionComponents', 'defineDialog', 'defineAccordion', 'defineFlipList', 'defineViewSwitch', 'viewTransition', 'flip', 'connectedAnimation'],
};

for (const [id, names] of Object.entries(entries)) {
  const esm = await import(id);
  const cjs = require(id);
  for (const mod of [esm, cjs]) {
    for (const name of names) assert.notEqual(typeof mod[name], 'undefined', `${id}: missing export ${name}`);
  }
}
const root = await import('use-scroll-animate');
assert.equal(typeof root.default.init, 'function', 'default instance');
assert.equal(typeof require('use-scroll-animate').default.init, 'function', 'default instance (CJS)');
// Browser bundles ship at their CDN paths (served by file path, not through `exports`)
for (const f of ['dist/index.umd.js', 'dist/element.umd.js', 'dist/components.umd.js', 'dist/components.css']) assert.ok(existsSync(new URL(`../${f}`, import.meta.url)), `missing ${f}`);
require('use-scroll-animate/package.json');
// Component stylesheets resolve through `exports`
for (const css of ['components.css', 'components/text.css']) assert.ok(require.resolve(`use-scroll-animate/${css}`).endsWith(`dist/${css}`), css);
// The component entries are SSR-safe: importing them in Node defines nothing and never throws
const comps = await import('use-scroll-animate/components');
assert.doesNotThrow(() => comps.defineComponents());
assert.equal(comps.toast('x'), null);
// 2.0: the main entry no longer re-exports the framework factories
assert.equal(root.createReactHooks, undefined, 'createReactHooks moved to /react');
console.log(`exports OK (ESM + CJS): ${Object.keys(entries).join(', ')}`);
