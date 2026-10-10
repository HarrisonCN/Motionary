'use strict';

var registry = require('../chunks/registry-BB1oO-lR.cjs');
var base = require('../chunks/base-B3me2y0o.cjs');
var shared = require('../chunks/shared-jkgRH-Hx.cjs');

const fade = (el, ctx, out) => ctx.animate(el, out ? [{ opacity: 1 }, { opacity: 0 }] : [{ opacity: 0 }, { opacity: 1 }], { duration: 200, fill: out ? 'forwards' : 'none' });
const isOut = (o) => o.mode === 'out';
const dir = (frames, out) => (out ? [...frames].reverse().map((f) => ({ ...f, offset: undefined })).map(({ offset, ...f }) => f) : frames);
/** Clipped copies of `el` laid over it (the original is hidden meanwhile). */
function pieces(el, clips) {
    if (getComputedStyle(el).position === 'static')
        el.style.position = 'relative';
    const prevVis = el.style.visibility;
    const wrap = document.createElement('div');
    wrap.setAttribute('aria-hidden', 'true');
    wrap.style.cssText = 'position:absolute;inset:0;pointer-events:none;perspective:900px;visibility:visible;z-index:1';
    const parts = clips.map((c) => {
        const p = el.cloneNode(true);
        p.removeAttribute('id');
        p.querySelectorAll('[id]').forEach((x) => x.removeAttribute('id'));
        p.style.cssText += `;position:absolute;inset:0;margin:0;width:100%;height:100%;box-sizing:border-box;clip-path:${c};visibility:visible`;
        wrap.appendChild(p);
        return p;
    });
    el.style.visibility = 'hidden';
    el.appendChild(wrap);
    return {
        parts,
        done: () => {
            wrap.remove();
            el.style.visibility = prevVis;
        },
    };
}
const TRANSITIONS2_FX = [
    {
        name: 'ripple-dissolve',
        kind: 'page',
        description: 'A circle with a ripple ring grows from the pointer (or `x` / `y` 0–1) and reveals (`mode: "in"`) or hides (`"out"`) the element.',
        defaults: { mode: 'in', duration: 900, x: 0.5, y: 0.5 },
        run: (el, o, ctx) => {
            const out = isOut(o);
            if (ctx.reduced)
                return fade(el, ctx, out);
            const r = el.getBoundingClientRect();
            const p = ctx.event ? shared.origin(el, ctx) : { x: r.left + r.width * o.x, y: r.top + r.height * o.y };
            const at = `${(p.x - r.left).toFixed(0)}px ${(p.y - r.top).toFixed(0)}px`;
            const f = [
                { clipPath: `circle(0% at ${at})`, filter: 'blur(2px)' },
                { clipPath: `circle(38% at ${at})`, filter: 'blur(0)', offset: 0.45 },
                { clipPath: `circle(150% at ${at})`, filter: 'blur(0)' },
            ];
            return ctx.animate(el, out ? [f[2], f[0]] : f, { duration: o.duration, easing: 'cubic-bezier(.6,.05,.3,1)', fill: out ? 'forwards' : 'none' });
        },
    },
    {
        name: 'shatter',
        kind: 'page',
        description: 'The element breaks into shards that fly apart (`mode: "out"`) or fly together (`"in"`) (`pieces`, `duration`).',
        defaults: { mode: 'out', duration: 900, pieces: 12 },
        run: (el, o, ctx) => {
            const out = isOut(o);
            if (ctx.reduced)
                return fade(el, ctx, out);
            const n = Math.max(4, Math.min(24, o.pieces | 0));
            const cols = Math.ceil(Math.sqrt(n / 2));
            const rows = Math.ceil(n / 2 / cols);
            const clips = [];
            for (let r = 0; r < rows; r++)
                for (let c = 0; c < cols; c++) {
                    const x0 = (c / cols) * 100;
                    const x1 = ((c + 1) / cols) * 100;
                    const y0 = (r / rows) * 100;
                    const y1 = ((r + 1) / rows) * 100;
                    clips.push(`polygon(${x0}% ${y0}%,${x1}% ${y0}%,${x0}% ${y1}%)`, `polygon(${x1}% ${y0}%,${x1}% ${y1}%,${x0}% ${y1}%)`);
                }
            const { parts, done } = pieces(el, clips);
            const anims = parts.map((p, i) => {
                const a = (i * 2.399) % (Math.PI * 2);
                const d = 80 + (i % 5) * 30;
                const scattered = { transform: `translate(${(Math.cos(a) * d).toFixed(0)}px,${(Math.sin(a) * d + 40).toFixed(0)}px) rotate(${((i % 7) - 3) * 35}deg) rotateX(${(i % 3) * 40}deg)`, opacity: 0 };
                const whole = { transform: 'none', opacity: 1 };
                return ctx.animate(p, out ? [whole, scattered] : [scattered, whole], { duration: o.duration, delay: (i % 6) * 25, easing: out ? 'cubic-bezier(.4,0,.9,.6)' : 'cubic-bezier(.1,.6,.3,1)', fill: 'both' });
            });
            return shared.all(anims).then(() => {
                done();
                if (out)
                    el.style.visibility = 'hidden';
            });
        },
    },
    {
        name: 'mosaic-flip',
        kind: 'page',
        description: 'A grid of tiles flips over in a diagonal wave (`cols`, `rows`, `duration` per tile).',
        defaults: { mode: 'in', cols: 6, rows: 4, duration: 520 },
        run: (el, o, ctx) => {
            const out = isOut(o);
            if (ctx.reduced)
                return fade(el, ctx, out);
            const C = Math.max(2, Math.min(12, o.cols | 0));
            const R = Math.max(2, Math.min(10, o.rows | 0));
            const clips = [];
            for (let r = 0; r < R; r++)
                for (let c = 0; c < C; c++)
                    clips.push(`inset(${((r / R) * 100).toFixed(2)}% ${(100 - ((c + 1) / C) * 100).toFixed(2)}% ${(100 - ((r + 1) / R) * 100).toFixed(2)}% ${((c / C) * 100).toFixed(2)}%)`);
            const { parts, done } = pieces(el, clips);
            const anims = parts.map((p, i) => {
                const r = Math.floor(i / C);
                const c = i % C;
                p.style.transformOrigin = `${((c + 0.5) / C) * 100}% ${((r + 0.5) / R) * 100}%`;
                p.style.backfaceVisibility = 'hidden';
                const f = [{ transform: 'rotateY(-90deg)', opacity: 0 }, { transform: 'rotateY(0)', opacity: 1 }];
                return ctx.animate(p, out ? [f[1], f[0]] : f, { duration: o.duration, delay: (r + c) * 45, easing: 'cubic-bezier(.3,.7,.3,1)', fill: 'both' });
            });
            return shared.all(anims).then(() => {
                done();
                if (out)
                    el.style.visibility = 'hidden';
            });
        },
    },
    {
        name: 'liquid-wipe',
        kind: 'page',
        description: 'A wavy liquid edge sweeps across the element (`direction` left | right | up | down, `waves`, `duration`).',
        defaults: { mode: 'in', direction: 'right', waves: 3, duration: 1000 },
        run: (el, o, ctx) => {
            const out = isOut(o);
            if (ctx.reduced)
                return fade(el, ctx, out);
            const N = 24;
            const shape = (k) => {
                const pts = [];
                const amp = 6 * Math.sin(Math.PI * k);
                for (let i = 0; i <= N; i++) {
                    const t = (i / N) * 100;
                    const edge = k * 120 - 10 + amp * Math.sin((i / N) * Math.PI * 2 * o.waves + k * 6);
                    pts.push(o.direction === 'up' || o.direction === 'down' ? `${t.toFixed(1)}% ${(o.direction === 'down' ? edge : 100 - edge).toFixed(1)}%` : `${(o.direction === 'left' ? 100 - edge : edge).toFixed(1)}% ${t.toFixed(1)}%`);
                }
                const tail = o.direction === 'up' ? ['100% 100%', '0% 100%'] : o.direction === 'down' ? ['100% 0%', '0% 0%'] : o.direction === 'left' ? ['100% 100%', '100% 0%'] : ['0% 100%', '0% 0%'];
                if (o.direction === 'up' || o.direction === 'down')
                    return `polygon(${[...pts, ...tail].join(',')})`;
                return `polygon(${[...pts, ...tail].join(',')})`;
            };
            const frames = Array.from({ length: 9 }, (_, i) => ({ clipPath: shape(i / 8) }));
            return ctx.animate(el, out ? frames.reverse() : frames, { duration: o.duration, easing: 'cubic-bezier(.65,.05,.35,1)', fill: out ? 'forwards' : 'none' });
        },
    },
    {
        name: 'page-curl',
        kind: 'page',
        description: 'The element turns like a page around its left edge, with a moving shade (`duration`).',
        defaults: { mode: 'in', duration: 900 },
        run: (el, o, ctx) => {
            const out = isOut(o);
            if (ctx.reduced)
                return fade(el, ctx, out);
            const prev = el.style.transformOrigin;
            el.style.transformOrigin = '0% 50%';
            const f = [
                { transform: 'perspective(1400px) rotateY(-100deg) skewY(-4deg)', filter: 'brightness(.55)', boxShadow: '30px 0 40px rgba(0,0,0,.35)', opacity: 0.4 },
                { transform: 'perspective(1400px) rotateY(-40deg) skewY(-2deg)', filter: 'brightness(.8)', boxShadow: '20px 0 30px rgba(0,0,0,.25)', opacity: 1, offset: 0.5 },
                { transform: 'perspective(1400px) rotateY(0) skewY(0)', filter: 'brightness(1)', boxShadow: '0 0 0 rgba(0,0,0,0)', opacity: 1 },
            ];
            const a = ctx.animate(el, dir(f, out), { duration: o.duration, easing: 'cubic-bezier(.45,.05,.3,1)', fill: out ? 'forwards' : 'none' });
            const reset = () => (el.style.transformOrigin = prev);
            if (a)
                a.finished.then(reset, reset);
            else
                reset();
            return a;
        },
    },
    {
        name: 'camera-dolly',
        kind: 'page',
        description: 'A dolly zoom: the element moves in from (or out to) depth with a depth-of-field blur (`scale`, `duration`).',
        defaults: { mode: 'in', duration: 900, scale: 1.35 },
        run: (el, o, ctx) => {
            const out = isOut(o);
            if (ctx.reduced)
                return fade(el, ctx, out);
            const f = [
                { transform: `perspective(900px) translateZ(-260px) scale(${o.scale})`, filter: 'blur(10px)', opacity: 0 },
                { transform: 'perspective(900px) translateZ(0) scale(1)', filter: 'blur(0)', opacity: 1 },
            ];
            return ctx.animate(el, out ? [f[1], { ...f[0], transform: `perspective(900px) translateZ(260px) scale(${(1 / o.scale).toFixed(3)})` }] : f, { duration: o.duration, easing: 'cubic-bezier(.2,.7,.2,1)', fill: out ? 'forwards' : 'none' });
        },
    },
];
/** CSS keyframes for the `::view-transition-new(root)` snapshot of each effect (cross-document transitions). */
const VT_CSS = {
    'ripple-dissolve': 'from{clip-path:circle(0% at 50% 50%)}to{clip-path:circle(150% at 50% 50%)}',
    'liquid-wipe': 'from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}',
    'page-curl': 'from{transform:perspective(1400px) rotateY(-100deg);transform-origin:0 50%;filter:brightness(.6)}to{transform:none;transform-origin:0 50%}',
    'camera-dolly': 'from{transform:scale(1.35);filter:blur(10px);opacity:0}to{transform:none;filter:none;opacity:1}',
    'mosaic-flip': 'from{transform:perspective(900px) rotateY(-90deg);opacity:0}to{transform:none;opacity:1}',
    shatter: 'from{transform:scale(.85) rotate(-3deg);opacity:0;filter:blur(4px)}to{transform:none;opacity:1;filter:none}',
};
/**
 * Run `update` (a DOM change) as a transition: inside `document.startViewTransition`
 * when supported (the new snapshot plays `effect`), otherwise `update()` then the
 * effect on `target` (default `document.body`'s first element).
 */
async function pageTransition(update, effect = 'ripple-dissolve', options = {}, target) {
    const doc = document;
    const def = registry.getEffect(effect);
    if (typeof doc.startViewTransition === 'function' && !base.prefersReducedMotion()) {
        const vt = doc.startViewTransition(update);
        await vt.ready.catch(() => undefined);
        const css = VT_CSS[effect];
        if (css) {
            const dur = Number(options.duration) || Number(def?.defaults?.duration) || 800;
            const m = /from\{([^}]*)\}to\{([^}]*)\}/.exec(css);
            const toObj = (s) => Object.fromEntries(s.split(';').filter(Boolean).map((d) => { const i = d.indexOf(':'); return [d.slice(0, i).replace(/-([a-z])/g, (_, c) => c.toUpperCase()), d.slice(i + 1)]; }));
            if (m)
                document.documentElement.animate([toObj(m[1]), toObj(m[2])], { duration: dur, easing: 'cubic-bezier(.6,.05,.3,1)', pseudoElement: '::view-transition-new(root)' });
        }
        await vt.finished.catch(() => undefined);
        return;
    }
    await update();
    const el = target || document.body.firstElementChild;
    if (el && def) {
        const { playEffect } = await Promise.resolve().then(function () { return require('../chunks/registry-BB1oO-lR.cjs'); });
        await playEffect(el, effect, { ...options, mode: 'in' });
    }
}
/** Opt a multi-page site into cross-document view transitions with an effect's look. Returns a remover. */
function crossDocumentTransitions(effect = 'ripple-dissolve', duration = 700) {
    const style = document.createElement('style');
    style.setAttribute('data-usa-vt', effect);
    const kf = VT_CSS[effect] || VT_CSS['camera-dolly'];
    style.textContent = `@view-transition{navigation:auto}@keyframes usa-vt-in{${kf}}::view-transition-new(root){animation:usa-vt-in ${duration}ms cubic-bezier(.6,.05,.3,1) both}::view-transition-old(root){animation:none}@media (prefers-reduced-motion:reduce){::view-transition-new(root){animation-duration:1ms}}`;
    document.head.appendChild(style);
    return () => style.remove();
}
/** Register the 6.7 transitions pack (idempotent). */
function registerTransitionsPack() {
    registry.registerEffects(TRANSITIONS2_FX);
}

exports.TRANSITIONS2_FX = TRANSITIONS2_FX;
exports.crossDocumentTransitions = crossDocumentTransitions;
exports.pageTransition = pageTransition;
exports.registerTransitionsPack = registerTransitionsPack;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.9.0/dist/components/fx-transitions.cjs.map