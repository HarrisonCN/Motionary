'use strict';

var registry = require('../chunks/registry-BB1oO-lR.cjs');
require('../chunks/base-B3me2y0o.cjs');

/** Quadratic-bezier arc points from a to b, lifted by `lift` px (7.3). */
function arcPath(ax, ay, bx, by, lift = 120, steps = 8) {
    const cx = (ax + bx) / 2;
    const cy = Math.min(ay, by) - lift;
    return Array.from({ length: steps + 1 }, (_, i) => {
        const t = i / steps;
        const u = 1 - t;
        return { x: u * u * ax + 2 * u * t * cx + t * t * bx, y: u * u * ay + 2 * u * t * cy + t * t * by };
    });
}
const bump = (el, ctx) => el && ctx.animate(el, ctx.reduced ? [{ opacity: 0.5 }, { opacity: 1 }] : [{ transform: 'scale(1)' }, { transform: 'scale(1.25)', offset: 0.35 }, { transform: 'scale(.92)', offset: 0.7 }, { transform: 'scale(1)' }], { duration: ctx.reduced ? 250 : 480, easing: 'ease-out' });
const SHOP_FX = [
    {
        name: 'fly-to-cart',
        kind: 'click',
        description: 'A ghost of the element (or its first `img`) flies on an arc into the cart (`to` selector, default `[data-cart]`), shrinking; the cart bumps (`duration`, `lift`).',
        defaults: { to: '[data-cart]', duration: 750, lift: 120 },
        run: (el, o, ctx) => {
            const cart = document.querySelector(o.to);
            if (!cart)
                return;
            if (ctx.reduced)
                return void bump(cart, ctx);
            const src = el.querySelector('img') || el;
            const a = src.getBoundingClientRect();
            const b = cart.getBoundingClientRect();
            const ghost = src.cloneNode(true);
            ghost.removeAttribute('id');
            ghost.setAttribute('aria-hidden', 'true');
            Object.assign(ghost.style, { position: 'fixed', left: `${a.left}px`, top: `${a.top}px`, width: `${a.width}px`, height: `${a.height}px`, margin: '0', zIndex: '2147483000', pointerEvents: 'none', borderRadius: '12px', overflow: 'hidden' });
            document.body.appendChild(ghost);
            const pts = arcPath(0, 0, b.left + b.width / 2 - (a.left + a.width / 2), b.top + b.height / 2 - (a.top + a.height / 2), o.lift);
            const s = Math.max(0.12, Math.min(1, 28 / Math.max(a.width, a.height, 1)));
            const anim = ctx.animate(ghost, pts.map((p, i) => ({ transform: `translate(${p.x.toFixed(1)}px,${p.y.toFixed(1)}px) scale(${(1 - (1 - s) * (i / (pts.length - 1))).toFixed(3)})`, opacity: i === pts.length - 1 ? 0.6 : 1 })), { duration: o.duration, easing: 'cubic-bezier(.5,0,.75,.4)', fill: 'forwards' });
            const done = () => (ghost.remove(), bump(cart, ctx));
            if (anim)
                anim.finished.then(done, () => ghost.remove());
            else
                done();
            ctx.onCleanup(() => ghost.remove());
            return anim?.finished.catch(() => undefined);
        },
    },
    {
        name: 'price-flip',
        kind: 'enter',
        description: 'The price flips character by character like a split-flap display from `data-from` (or scrambled digits) to its text (`stagger`).',
        defaults: { stagger: 55, duration: 380 },
        run: (el, o, ctx) => {
            const to = el.dataset.priceTo || el.textContent || '';
            el.dataset.priceTo = to;
            if (ctx.reduced)
                return void (el.textContent = to);
            const from = (el.dataset.from || '').padStart(to.length, ' ');
            el.textContent = '';
            el.setAttribute('aria-label', to.trim());
            const anims = Array.from(to).map((ch, i) => {
                const span = document.createElement('span');
                span.setAttribute('aria-hidden', 'true');
                span.style.display = 'inline-block';
                span.textContent = /\d/.test(ch) ? (from[i] && from[i] !== ' ' ? from[i] : String((Number(ch) + 5) % 10)) : ch;
                el.appendChild(span);
                const a = ctx.animate(span, [{ transform: 'rotateX(0)' }, { transform: 'rotateX(90deg)', offset: 0.5 }, { transform: 'rotateX(0)' }], { duration: o.duration, delay: i * o.stagger, easing: 'ease-in-out' });
                setTimeout(() => (span.textContent = ch), i * o.stagger + o.duration / 2);
                return a;
            });
            return Promise.all(anims.map((a) => a?.finished.catch(() => undefined))).then(() => {
                el.textContent = to;
                el.removeAttribute('aria-label');
            });
        },
    },
    {
        name: 'stock-pulse',
        kind: 'loop',
        description: 'A soft urgency pulse — a glow ring in `color` — for low stock / last items (`color`, `period`).',
        defaults: { color: 'rgba(239,68,68,.55)', period: 1400 },
        reduced: 'skip',
        run: (el, o, ctx) => {
            const a = ctx.animate(el, [{ boxShadow: `0 0 0 0 ${o.color}` }, { boxShadow: '0 0 0 12px rgba(0,0,0,0)' }], { duration: o.period, iterations: Infinity, easing: 'ease-out' });
            const stop = () => a?.cancel();
            ctx.onCleanup(stop);
            return stop;
        },
    },
    {
        name: 'sale-shine',
        kind: 'hover',
        description: 'A diagonal light sweep across the element (product cards, buy buttons) (`duration`).',
        defaults: { duration: 700 },
        reduced: 'skip',
        run: (el, o, ctx) => {
            const s = document.createElement('span');
            s.setAttribute('aria-hidden', 'true');
            Object.assign(s.style, { position: 'absolute', inset: '0', pointerEvents: 'none', background: 'linear-gradient(115deg,transparent 30%,rgba(255,255,255,.55) 50%,transparent 70%)', borderRadius: 'inherit' });
            if (getComputedStyle(el).position === 'static')
                el.style.position = 'relative';
            const prev = el.style.overflow;
            el.style.overflow = 'hidden';
            el.appendChild(s);
            const a = ctx.animate(s, [{ transform: 'translateX(-100%)' }, { transform: 'translateX(100%)' }], { duration: o.duration, easing: 'ease-in-out' });
            const end = () => (s.remove(), (el.style.overflow = prev));
            if (a)
                a.finished.then(end, end);
            else
                end();
            return a?.finished.catch(() => undefined);
        },
    },
    {
        name: 'badge-pop',
        kind: 'attention',
        description: 'A sale badge pops in with a wobble (`duration`).',
        defaults: { duration: 650 },
        run: (el, o, ctx) => ctx.reduced
            ? ctx.animate(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 250 })
            : ctx.animate(el, [{ transform: 'scale(0) rotate(-20deg)' }, { transform: 'scale(1.2) rotate(8deg)', offset: 0.5 }, { transform: 'scale(.95) rotate(-4deg)', offset: 0.75 }, { transform: 'none' }], { duration: o.duration, easing: 'ease-out' }),
    },
];
/** Register the 7.3 e-commerce pack (idempotent). */
function registerShopPack() {
    registry.registerEffects(SHOP_FX);
}

exports.SHOP_FX = SHOP_FX;
exports.arcPath = arcPath;
exports.registerShopPack = registerShopPack;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.5.0/dist/components/fx-shop.cjs.map