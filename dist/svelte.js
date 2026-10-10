import { c as createScrollAnimate } from './chunks/core-Dj6iomdc.js';
import { s as staggerChildren } from './chunks/stagger-B9sKPwQB.js';
import './chunks/presets-BYBVJVeP.js';

/**
 * motionary - Svelte integration
 *
 * Svelte actions (no import from `svelte` needed, works with Svelte 3, 4 and 5):
 *
 * ```svelte
 * <script>
 *   import { scrollAnimate, scrollStagger } from 'motionary/svelte';
 * </script>
 * <div use:scrollAnimate={{ animation: 'fade-in-up', duration: 800 }}>…</div>
 * <ul use:scrollStagger={{ stagger: 60 }}>…</ul>
 * ```
 */
let shared = null;
const getInstance = (own) => own || shared || (shared = createScrollAnimate());
const CALLBACKS = ['onStart', 'onComplete', 'onEnter', 'onLeave', 'onProgress'];
/** Callbacks always call the latest parameter's version. */
function liveCallbacks(opts, latest) {
    const out = { ...opts };
    CALLBACKS.forEach((name) => {
        if (typeof opts[name] === 'function')
            out[name] = (...args) => latest()[name]?.(...args);
    });
    return out;
}
/**
 * Animate `node` when it scrolls into view. Changing the parameter updates the
 * callbacks right away; other options are applied if the element has not
 * animated yet.
 */
function scrollAnimate(node, options = {}) {
    let current = options;
    const { instance, ...opts } = options;
    const sa = getInstance(instance);
    sa.observe(node, liveCallbacks(opts, () => current));
    return {
        update(next = {}) {
            current = next;
            const record = sa.getObservedElements().find((r) => r.element === node);
            if (record && !record.animated) {
                const { instance: _ignored, ...nextOpts } = next;
                sa.unobserve(node);
                sa.observe(node, liveCallbacks(nextOpts, () => current));
            }
        },
        destroy() {
            sa.unobserve(node);
        },
    };
}
/** Stagger the children of `node` when it scrolls into view (`observeChildren: true` also animates children added later). */
function scrollStagger(node, options = {}) {
    const { instance, ...opts } = options;
    const stop = staggerChildren(node, opts, getInstance(instance));
    return { destroy: stop };
}

export { scrollAnimate, scrollStagger };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.0.0/dist/svelte.js.map