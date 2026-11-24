'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');

// Keep strings, comments, attribute selectors and escaped identifiers opaque. Braces / semicolons inside them
// are content, not rule boundaries (and an attribute value that happens to name a component must stay unchanged).
const CSS_TOKENS = /\/\*[\s\S]*?\*\/|"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|\[(?:\\[\s\S]|"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|[^\]\\])*\]|(?:\\[\s\S]|[\w-]|[^\x00-\x7f])+|[^\w]/g;
/**
 * Rewrite component tag names in selectors only (the text in front of each `{` that is not an at-rule); declarations, at-rule
 * preludes such as `@keyframes usa-spin`, classes, attributes and custom properties are untouched.
 */
const rewriteTagSelectors = (text, replaceTag) => {
  let out = '', raw = '', renamed = '', first = '', previous = '';
  for (const [token] of text.matchAll(CSS_TOKENS)) {
    if (token === '{' || token === '}' || token === ';') {
      out += (token === '{' && first !== '@' ? renamed : raw) + token;
      raw = renamed = first = previous = '';
    } else {
      raw += token;
      const comment = token.startsWith('/*');
      if (!first && !comment && token.trim()) first = token;
      renamed += /^usa-[a-z]/.test(token) && previous !== '.' && previous !== '#' && previous !== ':'
        ? replaceTag(token) : token;
      if (!comment) previous = token;
    }
  }
  return out + raw;
};

// Generated from the component manifest.
const publicTagNames = 'accordion acrylic activity-wall add-to-cart align-switch ambient analog-stick anim-icon announcement-bar audio aurora auto-animate auto-skeleton avatar-stack back-to-top badge badge-wall bar-chart bento bezier-lab bg-generator blobs border-beam bottom-sheet bounce-button breadcrumbs breath-orb bulge-volume button card card-stack carousel carousel-3d cart-badge cart-drawer center-bars chapter-nav chat-composer check checkbox checklist chip-input circular-text click clock-control clothesline code-export code-shake code-tabs coffee-timer color-picker combobox command-palette comment-thread compare connect-beam consent context-menu contour-relief copy-button countdown counter cta-popup cube cube-gallery cursor cut-reveal data-table date-picker delivery-tracker depth desktop-windows dialog diff-viewer disclosure distort dock donut-chart dot-network dotlottie double-tap download-button download-menu draggable draw drawer eclipse-toggle elastic-accordion elastic-frame elastic-mesh elastic-slider emoji-picker empty-state equalizer expand-cards fab fan-carousel festival-banner field file-drop file-tree filter-chips flight-status fluid-type form-stepper fullpage fullscreen-menu funnel-chart fx gantt gauge gen-art gesture-fx gesture-sticker gl-model gl-scene glitch globe glucose-sparkline gpu-particles gradient-text grain gravity-well grid-glow groove-toggle gyro-card halo-segmented halo-slider handwriting heatmap helpful-vote hero-video hold hold-action horizontal-scroll hotspots hover-reveal-list hud-panel hue-orbit hydrate icon icon-morph icon-picker image-trail image-tunnel infinite-scroll infinity-loop ink-flow inline-edit install-button iris-diaphragm jelly-button json-viewer kanban keyframe-editor kpi leaderboard lens-stack letter-swap lightbox like line-chart liquid liquid-glass liquid-metal liquid-nav loading-bar location-card lottie lottie-icon lottie-player luminous-switch lyrics magnet-lines magnetic magnetic-field marquee mask-reveal masonry masonry-flow mega-menu mention-input menu menu-toggle message-list meteors meter-countdown milestones modal morph morph-card motion motion-inspector motion-prefs motion-prompt motion-spec motion-switch motion-theme multi-select music-player native-preview nav-flyout nav-morph navbar notch-slider notification-bell number-stepper odometer orbit-gallery orbit-pass orbit-progress orbit-rings organic-card otp overscroll pack page-flip pagination panorama parallax-layers particle-button particle-icon particles password path-motion pause-all perf-monitor physics-playground pinch-zoom pixel-transition plan-picker player plugin-card plugin-store popover post-fx presence press pricing prize-wheel product-gallery progress progress-ring progress-tabs prop-panel pull-cord pull-refresh quarter-ring race-telemetry radar range-slider rating-bars reaction-field reactions red-envelope retro-button retro-grid reveal reveal-footer revision-reveal ride-status ripple ripple-grid rive route-sparkline route-transition scene scramble scratch-card scroll-bg scroll-cue scroll-highlight scroll-progress scroll-ring scroll-scene scroll-velocity scroll-zoom scrollspy scrolly scrub-number search-bar search-field segmented select shader shader-backdrop shape-divider share-button sheet shimmer-text shortcut shuffle-grid sidebar signature-pad six-dot-orbit skeleton skeleton-reveal sketch-chart slider smooth-scroll snap-carousel sortable-list sparkline spatial-card spinner splash split-flap split-pane split-text spotlight spring spring-lab squish-indicator squish-key squish-stepper stack-slider stagger star-rating status-pill step-track stepper sticky-cta sticky-stack sticky-wall stories story strength-meter subscribe suggestion-chips sun-timeline sweep-lines swipe-deck swipeable switch tab-bar tabs tada-button tag-cloud terminal text-loupe text-pressure text-reveal text-rotate text-splitter textarea theme-surface theme-switcher three-dot-bounce tile-relay tilt timeline tip title-sequence toast-stack toaster token-editor tour transfer-button transit-progress treemap triple-pulse typewriter upload-progress validation-summary video-card view-switch virtual-list vital-wave voice-button volume-knob waffle-chart water-ripple wave-text weather-card wheel-picker wifi-signal worker-canvas workout-player xp-bar zoom-lens';

/**
 * motionary/components/mo — the 17.0 `<mo-*>` names.
 *
 * After `defineMoAliases()` every default `<usa-*>` element is also registered as `<mo-*>` (`<usa-switch>` →
 * `<mo-switch>`): a subclass, so attributes, properties and `usa:*` events are the same. The component styles are extended
 * with matching public tag selectors the first time a `<mo-*>` element connects, so pages that never use `mo-*` pay nothing.
 *
 * The no-build bundles (`components.umd.js`, `widgets.umd.js`) call it before they register anything. With ESM, call it
 * once, ideally before you define components; `usa-*` elements defined earlier (the default component set) and `mo-*`
 * elements already on the page are picked up too. Kept out of the component base so `usa-*` pages keep their size.
 *
 * ```ts
 * import { defineMoAliases } from 'motionary/components/mo';
 * import { defineComponents } from 'motionary/components';
 * defineMoAliases();
 * defineComponents();   // <mo-card>, <mo-tabs>, … and <usa-*> both work
 * ```
 */
/** The `mo-*` alias of a default `usa-*` tag (`usa-switch` → `mo-switch`), or `null` for any other tag. */
const aliasTag = (tag) => (/^usa-[a-z]/.test(tag) ? 'mo-' + tag.slice(4) : null);
/** Return a copy of the stylesheet with public tag selectors. */
const aliasCss = (text) => rewriteTagSelectors(text, tag => 'mo-' + tag.slice(4));
let started = false;
function styleLoaded(event) {
    if (event.target?.matches?.('link[data-usa-css]'))
        scan();
}
const seen = /*#__PURE__*/ new WeakSet();
/** Extend style selectors in place so media queries, cascade layers and declaration order stay intact. */
function extendSelectors(rules) {
    for (const rule of rules) {
        if ('selectorText' in rule) {
            const style = rule;
            const selector = style.selectorText;
            const renamed = aliasCss(selector + '{').slice(0, -1);
            if (renamed !== selector)
                style.selectorText = selector + ',' + renamed;
        }
        if ('cssRules' in rule)
            extendSelectors(rule.cssRules);
    }
}
function scan() {
    const d = document;
    for (const s of [...d.styleSheets, ...(d.adoptedStyleSheets || [])]) {
        const o = s.ownerNode;
        if (seen.has(s) || (o && !o.matches('[data-usa],[data-usa-css]')))
            continue;
        try {
            if (!s.cssRules.length)
                continue;
            extendSelectors(s.cssRules);
            seen.add(s);
        }
        catch {
            // A pending or cross-origin stylesheet may not expose writable rules.
        }
    }
}
function alias(tag, ctor) {
    const a = aliasTag(tag);
    if (!a || customElements.get(a))
        return;
    const C = ctor;
    class Alias extends C {
        connectedCallback() {
            super.connectedCallback?.();
            // A stable listener also handles a later stylesheet load without adding duplicate listeners.
            document.addEventListener('load', styleLoaded, true);
            scan();
        }
    }
    customElements.define(a, Alias);
}
/**
 * Turn on the `<mo-*>` names: every `usa-*` element defined from now on gets its `mo-*` alias, and so do the default
 * components already defined and any `usa-*` definition behind a `<mo-*>` element already on the page. Idempotent.
 */
function defineMoAliases() {
    if (!base.canDefine() || started)
        return;
    started = true;
    const reg = customElements;
    const define = reg.define;
    reg.define = function (name, ctor, options) {
        define.call(this, name, ctor, options);
        alias(name, ctor);
    };
    const names = publicTagNames.split(' ');
    globalThis.document?.querySelectorAll('*').forEach(({ localName }) => {
        if (localName.startsWith('mo-'))
            names.push(localName.slice(3));
    });
    for (const name of names) {
        const tag = 'usa-' + name;
        const ctor = reg.get(tag);
        if (ctor)
            alias(tag, ctor);
    }
}

exports.aliasCss = aliasCss;
exports.aliasTag = aliasTag;
exports.defineMoAliases = defineMoAliases;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/components/mo.cjs.map