import { p as prefersReducedMotion, n as now, m as motionScale, r as raf, D as EASE_OUT, d as clamp, E as EASE_SPRING, f as defineElement } from '../chunks/base-zSGb8ujt.js';

const anim = (el, frames, o) => {
    if (typeof el.animate !== 'function')
        return null;
    const k = motionScale();
    return el.animate(frames, { ...o, duration: (o.duration ?? 400) * k, delay: (o.delay ?? 0) * k });
};
const on = (el, type, fn) => {
    el.addEventListener(type, fn);
    return () => el.removeEventListener(type, fn);
};
const io = (el, cb) => {
    if (typeof IntersectionObserver === 'undefined')
        return void cb();
    const o = new IntersectionObserver((es) => es.some((e) => e.isIntersecting) && (o.disconnect(), cb()), { threshold: 0.15 });
    o.observe(el);
    return () => o.disconnect();
};
/** Count `el`'s number up from 0 when it enters the view (keeps prefix / suffix / decimals). */
function countUp(el, duration = 1200) {
    const text = el.textContent || '';
    const m = /(-?[\d,]*\.?\d+)/.exec(text);
    if (!m || prefersReducedMotion())
        return () => { };
    const target = Number(m[1].replace(/,/g, ''));
    const dec = (m[1].split('.')[1] || '').length;
    const fmt = (v) => text.replace(m[1], v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }));
    el.setAttribute('aria-label', text.trim());
    el.textContent = fmt(0);
    let stop = false;
    const off = io(el, () => {
        const t0 = now();
        const d = duration * motionScale() || 1;
        const step = () => {
            if (stop)
                return;
            const p = clamp((now() - t0) / d, 0, 1);
            el.textContent = fmt(target * (1 - Math.pow(1 - p, 3)));
            if (p < 1)
                raf(step);
        };
        raf(step);
    });
    return () => {
        stop = true;
        off();
        el.textContent = text;
    };
}
/**
 * Fly a copy of `from` (e.g. a product image) into `to` (the cart icon) along
 * an arc, then bump the target. Resolves when it lands. Instant under
 * reduced motion (only the bump's state change, no flight).
 */
async function flyToCart(from, to, o = {}) {
    if (prefersReducedMotion() || typeof document === 'undefined')
        return;
    const a = from.getBoundingClientRect();
    const b = to.getBoundingClientRect();
    const ghost = from.cloneNode(true);
    ghost.setAttribute('aria-hidden', 'true');
    Object.assign(ghost.style, { position: 'fixed', left: `${a.left}px`, top: `${a.top}px`, width: `${a.width}px`, height: `${a.height}px`, margin: '0', zIndex: '2147483000', pointerEvents: 'none' });
    document.body.appendChild(ghost);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2);
    const dy = b.top + b.height / 2 - (a.top + a.height / 2);
    const f = anim(ghost, [
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 80}px) scale(0.6)`, opacity: 0.9, offset: 0.5 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.15)`, opacity: 0.4 },
    ], { duration: o.duration ?? 700, easing: 'cubic-bezier(0.5, 0, 0.5, 1)' });
    await f?.finished.catch(() => undefined);
    ghost.remove();
    anim(to, [{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }], { duration: 380, easing: EASE_SPRING });
}
const PRIMITIVES = {
    reveal: (el, c) => {
        if (c.reduced)
            return;
        el.style.opacity = '0';
        const off = io(el, () => {
            el.style.opacity = '';
            anim(el, [{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: Math.min(c.index, 8) * 70, easing: EASE_OUT, fill: 'backwards' });
        });
        return () => (off(), (el.style.opacity = ''));
    },
    lift: (el, c) => {
        if (c.reduced)
            return;
        const a = on(el, 'pointerenter', () => anim(el, [{ transform: 'none' }, { transform: 'translateY(-6px) scale(1.02)' }], { duration: 220, easing: EASE_OUT, fill: 'forwards' }));
        const b = on(el, 'pointerleave', () => anim(el, [{ transform: 'translateY(-6px) scale(1.02)' }, { transform: 'none' }], { duration: 260, easing: EASE_OUT, fill: 'forwards' }));
        return () => (a(), b());
    },
    press: (el, c) => (c.reduced ? undefined : on(el, 'pointerdown', () => anim(el, [{ transform: 'scale(1)' }, { transform: 'scale(0.94)' }, { transform: 'scale(1)' }], { duration: 260, easing: EASE_SPRING }))),
    'count-up': (el) => countUp(el),
    pulse: (el, c) => {
        if (c.reduced)
            return;
        const a = anim(el, [{ boxShadow: '0 0 0 0 rgba(124, 92, 255, 0.55)' }, { boxShadow: '0 0 0 14px rgba(124, 92, 255, 0)' }], { duration: 1600, iterations: Infinity });
        return () => a?.cancel();
    },
    float: (el, c) => {
        if (c.reduced)
            return;
        const a = anim(el, [{ transform: 'translateY(0)' }, { transform: 'translateY(-8px)' }, { transform: 'translateY(0)' }], { duration: 3000, delay: c.index * 300, iterations: Infinity, easing: 'ease-in-out' });
        return () => a?.cancel();
    },
    shake: (el, c) => (c.reduced ? undefined : on(el, 'click', () => anim(el, [0, -8, 8, -6, 6, -3, 0].map((x) => ({ transform: `translateX(${x}px)` })), { duration: 420 }))),
    bump: (el, c) => (c.reduced ? undefined : on(el, 'usa:bump', () => anim(el, [{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 360, easing: EASE_SPRING }))),
    'fly-to-cart': (el, c) => on(el, 'click', () => {
        const cart = c.root.querySelector('[data-role="cart"]') || document.querySelector('[data-role="cart"]');
        const item = el.closest('[data-role="product"]')?.querySelector('img, [data-role="thumb"]') || el;
        if (cart)
            void flyToCart(item, cart).then(() => cart.dispatchEvent(new CustomEvent('usa:added', { bubbles: true })));
    }),
};
/** The five effect packs: `data-role` → primitives. */
const PACKS = {
    ecommerce: { product: ['reveal', 'lift'], 'add-to-cart': ['press', 'fly-to-cart'], cart: ['bump'], price: ['count-up'], badge: ['pulse'] },
    portfolio: { project: ['reveal', 'lift'], heading: ['reveal'], stat: ['count-up'], contact: ['press', 'pulse'] },
    dashboard: { card: ['reveal'], stat: ['count-up'], alert: ['pulse'], action: ['press'] },
    game: { button: ['press'], score: ['count-up', 'bump'], item: ['float'], hit: ['shake'], reward: ['pulse'] },
    landing: { hero: ['reveal'], feature: ['reveal', 'lift'], cta: ['press', 'pulse'], logo: ['float'], stat: ['count-up'] },
};
/**
 * Apply an effect pack to `root`: every descendant with a `data-role` the
 * pack knows gets its effects (staggered by index). Returns an undo function.
 * Reduced motion: only non-motion behaviour (e.g. the cart event) remains.
 *
 * @example
 * applyPack('ecommerce', document.querySelector('main'));
 * // <article data-role="product">… <button data-role="add-to-cart"> … <a data-role="cart">
 */
function applyPack(name, root = document) {
    const pack = PACKS[name];
    if (!pack || typeof document === 'undefined')
        return () => { };
    const r = root.documentElement ? root.body : root;
    const reduced = prefersReducedMotion();
    const cleanups = [];
    for (const [role, fx] of Object.entries(pack)) {
        r.querySelectorAll(`[data-role="${role}"]`).forEach((el, index) => {
            for (const f of fx) {
                const c = PRIMITIVES[f]?.(el, { root: r, index, reduced });
                if (c)
                    cleanups.push(c);
            }
        });
    }
    return () => cleanups.splice(0).forEach((c) => c());
}
/** Primitive names a pack uses (for docs / tooling). */
const PACK_PRIMITIVES = /*#__PURE__*/ Object.keys(PRIMITIVES);

function definePack(tag = 'usa-pack') {
    return defineElement(tag, (Base) => class UsaPack extends Base {
        static get observedAttributes() {
            return ['name'];
        }
        get roles() {
            return Object.keys(PACKS[this.str('name', 'landing')] || {});
        }
        mount() {
            var _a;
            (_a = this.style).display || (_a.display = 'block');
            this.onCleanup(applyPack(this.str('name', 'landing'), this));
        }
    });
}

/**
 * motionary/components/packs — effect packs (v3.9).
 * Ready-made motion for e-commerce, portfolio, dashboard, game UI and
 * landing pages: mark elements with `data-role` and apply a pack with
 * `<usa-pack name="…">` or `applyPack(name, root)`. Includes `flyToCart()`
 * and `countUp()`.
 */
/** Register every component of this category under its default tag. */
function definePacksComponents() {
    definePack();
}

export { PACKS, PACK_PRIMITIVES, applyPack, countUp, definePack, definePacksComponents, flyToCart };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.9.0/dist/components/packs.js.map