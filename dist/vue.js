import { c as createScrollAnimate } from './chunks/core-Dj6iomdc.js';
import { s as staggerChildren } from './chunks/stagger-B9sKPwQB.js';
import './chunks/presets-BYBVJVeP.js';

/**
 * motionary - Vue 3 Integration
 * Provides useScrollAnimate and useScrollStagger composables for Vue 3 applications.
 *
 * A thin wrapper around the core engine, so it shares its behaviour: `once`,
 * `offset`, custom easing functions, progress, `prefers-reduced-motion`
 * support, and cleanup on unmount.
 */
/** Support refs on components (`$el`) as well as plain elements. */
function unwrap(value) {
    if (value && typeof Element !== 'undefined' && !(value instanceof Element) && value.$el instanceof Element) {
        return value.$el;
    }
    return value || null;
}
function createVueComposables(Vue) {
    // Created lazily on the client so importing on the server is side-effect free.
    let instance = null;
    const getInstance = () => instance || (instance = createScrollAnimate());
    function useScrollAnimate(options = {}) {
        const animateRef = Vue.ref(null);
        let el = null;
        Vue.onMounted(() => {
            const target = unwrap(animateRef.value);
            if (!target)
                return;
            el = target;
            getInstance().observe(el, options);
        });
        Vue.onUnmounted(() => {
            if (el)
                getInstance().unobserve(el);
            el = null;
        });
        return { animateRef };
    }
    /** Stagger the children of `staggerRef`; `observeChildren: true` also animates children added later. */
    function useScrollStagger(options = {}) {
        const staggerRef = Vue.ref(null);
        let stop;
        Vue.onMounted(() => {
            const target = unwrap(staggerRef.value);
            if (target)
                stop = staggerChildren(target, options, getInstance());
        });
        Vue.onUnmounted(() => {
            stop?.();
            stop = undefined;
        });
        return { staggerRef };
    }
    return { useScrollAnimate, useScrollStagger };
}

export { createVueComposables };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.7.0/dist/vue.js.map