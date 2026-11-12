import { k as canDefine } from '../chunks/base-SPDwWyB1.js';

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
const publicTagNames = 'accordion acrylic activity-wall add-to-cart ambient anim-icon audio aurora auto-animate auto-skeleton avatar-stack back-to-top badge badge-wall bar-chart bezier-lab bg-generator blobs bottom-sheet breadcrumbs button card card-stack carousel carousel-3d cart-drawer chapter-nav chat-composer check checkbox click clock-control code-export coffee-timer color-picker combobox command-palette compare consent countdown counter cta-popup cube cube-gallery cursor date-picker delivery-tracker depth dialog disclosure distort dock dot-network dotlottie double-tap download-menu draggable draw drawer elastic-mesh equalizer fab festival-banner field file-drop file-tree flight-status fluid-type fullpage fullscreen-menu fx gauge gen-art gesture-fx gesture-sticker gl-model gl-scene glitch globe glucose-sparkline gpu-particles gradient-text grain gravity-well grid-glow gyro-card halo-segmented halo-slider handwriting hero-video hold hold-action hud-panel hydrate icon-morph ink-flow install-button kanban keyframe-editor kpi leaderboard like liquid liquid-metal liquid-nav loading-bar location-card lottie lottie-icon lottie-player luminous-switch lyrics magnetic magnetic-field marquee mask-reveal masonry masonry-flow mega-menu menu menu-toggle message-list meter-countdown milestones modal morph motion motion-inspector motion-prefs motion-prompt motion-spec motion-switch motion-theme multi-select music-player native-preview nav-flyout nav-morph navbar notification-bell number-stepper odometer orbit-pass orbit-progress organic-card otp overscroll pack pagination panorama parallax-layers particle-button particle-icon particles password pause-all perf-monitor physics-playground pinch-zoom player plugin-card plugin-store popover post-fx presence press prize-wheel product-gallery progress progress-ring prop-panel pull-cord pull-refresh race-telemetry radar range-slider reaction-field reactions red-envelope retro-button reveal revision-reveal ride-status ripple rive route-sparkline route-transition scene scramble scroll-highlight scroll-progress scroll-ring scroll-scene scrolly scrub-number segmented select shader shader-backdrop sheet shimmer-text shortcut skeleton skeleton-reveal sketch-chart slider smooth-scroll snap-carousel sparkline spatial-card spinner splash split-text spotlight spring spring-lab stagger star-rating status-pill stepper sticky-stack sticky-wall stories story suggestion-chips sun-timeline swipe-deck swipeable switch tab-bar tabs terminal text-loupe text-rotate text-splitter theme-surface theme-switcher tilt timeline tip title-sequence toast-stack toaster token-editor transit-progress typewriter upload-progress validation-summary video-card view-switch vital-wave voice-button volume-knob water-ripple wave-text weather-card worker-canvas workout-player xp-bar';

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
    if (!canDefine() || started)
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

export { aliasCss, aliasTag, defineMoAliases };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.7.0/dist/components/mo.js.map