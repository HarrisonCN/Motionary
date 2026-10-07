/**
 * use-scroll-animate/components — shared base for the `<usa-*>` custom elements.
 *
 * Everything here is lazy: nothing touches `window`, `document`,
 * `HTMLElement` or `matchMedia` at import time, so the components can be
 * imported during SSR (Next, Nuxt, Astro…) and in Electron/Tauri preload
 * scripts. Classes are created the first time a `define*()` function runs.
 */
const config = { injectStyles: true, reducedMotion: 'user' };
/** Change global component settings (call before `define*()` for `injectStyles`). */
function configureComponents(options) {
    Object.assign(config, options);
}
const canDefine = () => typeof customElements !== 'undefined' && typeof HTMLElement !== 'undefined';
/** `true` when animations should be reduced (OS setting or `configureComponents`). */
function prefersReducedMotion() {
    if (config.reducedMotion !== 'user')
        return config.reducedMotion === 'reduce';
    return typeof matchMedia === 'function' && !!matchMedia('(prefers-reduced-motion: reduce)').matches;
}
const injected = new Set();
/** Add a component's stylesheet to the document once. */
function adoptStyles(id, css) {
    if (!config.injectStyles || !css || injected.has(id) || typeof document === 'undefined')
        return;
    injected.add(id);
    try {
        if (typeof CSSStyleSheet === 'function' && 'adoptedStyleSheets' in document) {
            const sheet = new CSSStyleSheet();
            sheet.replaceSync(css);
            document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
            return;
        }
    }
    catch {
        /* fall through to <style> */
    }
    const style = document.createElement('style');
    style.setAttribute('data-usa', id);
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
}
/** Attach `css` to a shadow root (constructable sheet where supported, else `<style>`). */
function shadowStyles(root, css) {
    try {
        if (typeof CSSStyleSheet === 'function' && 'adoptedStyleSheets' in root) {
            const sheet = new CSSStyleSheet();
            sheet.replaceSync(css);
            root.adoptedStyleSheets = [sheet];
            return;
        }
    }
    catch {
        /* fall through */
    }
    const style = document.createElement('style');
    style.textContent = css;
    root.prepend(style);
}
let baseClass = null;
/** The lazily created base class (needs `HTMLElement`). */
function getBase() {
    if (baseClass)
        return baseClass;
    class Base extends HTMLElement {
        constructor() {
            super(...arguments);
            this._cleanups = [];
            this._connected = false;
        }
        get reduced() {
            return prefersReducedMotion();
        }
        connectedCallback() {
            if (this._connected)
                return;
            this._connected = true;
            // Upgraded while the parser is still inside us (a <script> in <head>
            // defined the element): children/text are not there yet, so wait.
            if (typeof document !== 'undefined' && document.readyState === 'loading' && !this.nextSibling && !this.childNodes.length) {
                const go = () => {
                    if (this._connected && this.isConnected)
                        this.mount();
                };
                document.addEventListener('DOMContentLoaded', go, { once: true });
                this._cleanups.push(() => document.removeEventListener('DOMContentLoaded', go));
                return;
            }
            this.mount();
        }
        disconnectedCallback() {
            this._connected = false;
            this.teardown();
        }
        attributeChangedCallback(_name, oldValue, value) {
            if (!this._connected || oldValue === value)
                return;
            this.changed(_name);
        }
        /** Re-mount on attribute change (override for finer updates). */
        changed(_name) {
            this.teardown();
            this.mount();
        }
        teardown() {
            this._cleanups.splice(0).reverse().forEach((fn) => fn());
            this.unmount();
        }
        mount() { }
        unmount() { }
        str(name, fallback = '') {
            const v = this.getAttribute(name);
            return v === null ? fallback : v;
        }
        num(name, fallback) {
            const v = this.getAttribute(name);
            const n = v === null || v.trim() === '' ? NaN : Number(v);
            return Number.isFinite(n) ? n : fallback;
        }
        /** Boolean attribute: present and not `"false"`. */
        flag(name) {
            const v = this.getAttribute(name);
            return v !== null && v !== 'false';
        }
        setFlag(name, on) {
            if (on)
                this.setAttribute(name, '');
            else
                this.removeAttribute(name);
        }
        onCleanup(fn) {
            this._cleanups.push(fn);
        }
        listen(target, type, fn, options) {
            target.addEventListener(type, fn, options);
            this.onCleanup(() => target.removeEventListener(type, fn, options));
        }
        /** Calls `cb(true/false)` as the element enters / leaves the viewport. */
        inView(cb, init, target = this) {
            if (typeof IntersectionObserver === 'undefined') {
                cb(true);
                return;
            }
            const io = new IntersectionObserver((entries) => {
                for (const e of entries)
                    cb(e.isIntersecting, e);
            }, init);
            io.observe(target);
            this.onCleanup(() => io.disconnect());
        }
        /** `el.animate()` that returns `null` (and applies the last frame) without WAAPI. */
        motion(el, keyframes, options) {
            if (typeof el.animate !== 'function') {
                applyFrame(el, keyframes[keyframes.length - 1]);
                return null;
            }
            return el.animate(keyframes, options);
        }
        emit(type, detail) {
            return this.dispatchEvent(new CustomEvent(`usa:${type}`, { detail, bubbles: true, cancelable: true }));
        }
    }
    baseClass = Base;
    return baseClass;
}
/** Write a keyframe's properties as inline styles (no-WAAPI fallback). */
function applyFrame(el, frame) {
    if (!frame)
        return;
    for (const [k, v] of Object.entries(frame)) {
        if (k === 'offset' || k === 'easing' || k === 'composite' || v == null)
            continue;
        el.style[k] = String(v);
    }
}
/**
 * Register `tag` with the class built by `make(Base)`. Returns the
 * constructor, the already registered one, or `undefined` without DOM.
 */
function defineElement(tag, make, css) {
    if (!canDefine())
        return undefined;
    adoptStyles('base', BASE_CSS);
    if (css)
        adoptStyles(css.id, css.text);
    const existing = customElements.get(tag);
    if (existing)
        return existing;
    const ctor = make(getBase());
    customElements.define(tag, ctor);
    return ctor;
}
const BASE_CSS = '.usa-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;border:0}';
/** A visually hidden copy of `text` for screen readers (the animated copy is `aria-hidden`). */
function srText(text) {
    const s = document.createElement('span');
    s.className = 'usa-sr';
    s.textContent = text;
    return s;
}
/** requestAnimationFrame with a timeout fallback (jsdom / hidden documents). */
const raf = (cb) => typeof requestAnimationFrame === 'function' ? requestAnimationFrame(cb) : setTimeout(() => cb(Date.now()), 16);
/** Monotonic time in ms (rAF callback timestamps differ between environments, so loops use this). */
const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
const caf = (id) => {
    if (typeof cancelAnimationFrame === 'function')
        cancelAnimationFrame(id);
    else
        clearTimeout(id);
};
/** Spring-ish easing used across the components. */
const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';
const EASE_SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
/** Windows Fluent "decelerate" / "point-to-point" curves. */
const FLUENT_DECELERATE = 'cubic-bezier(0.1, 0.9, 0.2, 1)';
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export { EASE_OUT as E, FLUENT_DECELERATE as F, configureComponents as a, clamp as b, canDefine as c, defineElement as d, caf as e, EASE_SPRING as f, shadowStyles as g, adoptStyles as h, applyFrame as i, now as n, prefersReducedMotion as p, raf as r, srText as s };
//# sourceMappingURL=base-08OYzphB.js.map
