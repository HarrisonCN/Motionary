import { c as createScrollAnimate } from './chunks/core-BP-a1iNc.js';
import { s as staggerChildren } from './chunks/stagger-DTv_WiUQ.js';

/**
 * use-scroll-animate - React Integration
 * Provides useScrollAnimate and useScrollStagger hooks for React applications.
 * `useScrollStagger({ observeChildren: true })` also animates children added later.
 *
 * Both hooks are thin wrappers around the core engine, so they share its
 * behaviour: `once`, `offset`, custom easing functions, parallax,
 * `prefers-reduced-motion` support, and proper cleanup on unmount.
 */
const CALLBACKS = ['onStart', 'onComplete', 'onEnter', 'onLeave', 'onProgress'];
/**
 * Wrap the callbacks that exist at mount so they always call the latest
 * version from the most recent render (avoids stale closures without
 * re-creating observers on every render).
 * @internal
 */
function withLatestCallbacks(latest) {
    const initial = latest.current || {};
    const opts = { ...initial };
    CALLBACKS.forEach((name) => {
        if (typeof initial[name] === 'function') {
            opts[name] = (...args) => latest.current?.[name]?.(...args);
        }
    });
    return opts;
}
function createReactHooks(React) {
    // Created lazily on the client so importing on the server is side-effect free.
    let instance = null;
    const getInstance = () => instance || (instance = createScrollAnimate());
    function useScrollAnimate(options = {}) {
        const ref = React.useRef(null);
        const optionsRef = React.useRef(options);
        optionsRef.current = options;
        React.useEffect(() => {
            const el = ref.current;
            if (!el)
                return;
            const sa = getInstance();
            sa.observe(el, withLatestCallbacks(optionsRef));
            return () => sa.unobserve(el);
        }, []);
        return ref;
    }
    function useScrollStagger(options = {}) {
        const ref = React.useRef(null);
        const optionsRef = React.useRef(options);
        optionsRef.current = options;
        React.useEffect(() => {
            const container = ref.current;
            if (!container)
                return;
            return staggerChildren(container, withLatestCallbacks(optionsRef), getInstance());
        }, []);
        return ref;
    }
    return { useScrollAnimate, useScrollStagger };
}

export { createReactHooks, withLatestCallbacks };
//# sourceMappingURL=react.js.map
