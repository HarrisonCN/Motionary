'use strict';

var base = require('../chunks/base-BaQV-2ha.cjs');
var registry = require('../chunks/registry-DehBVRDV.cjs');
var shared = require('../chunks/shared-jkgRH-Hx.cjs');

/** Split `el`'s text into `aria-hidden` inline-block characters (idempotent). Returns them. */
function splitChars(el) {
    if (el.dataset.usaChars)
        return Array.from(el.querySelectorAll(':scope > .usa-ch'));
    const text = el.textContent || '';
    el.textContent = '';
    for (const ch of Array.from(text)) {
        const s = document.createElement('span');
        s.className = 'usa-ch';
        s.setAttribute('aria-hidden', 'true');
        s.style.cssText = 'display:inline-block;white-space:pre';
        s.textContent = ch;
        el.appendChild(s);
    }
    el.appendChild(base.srText(text.trim()));
    el.dataset.usaChars = '1';
    return Array.from(el.querySelectorAll(':scope > .usa-ch'));
}
const raf = (fn) => (typeof requestAnimationFrame === 'function' ? requestAnimationFrame(fn) : 0);
const caf = (h) => {
    if (h && typeof cancelAnimationFrame === 'function')
        cancelAnimationFrame(h);
};
let fid = 0;
const TEXT3_FX = [
    {
        name: 'liquid-text',
        kind: 'loop',
        description: 'The text ripples like liquid: an animated SVG turbulence + displacement filter (`strength`, `speed`).',
        defaults: { strength: 7, speed: 1 },
        run: (el, o) => {
            const id = `usa-liquid-${++fid}`;
            const ns = 'http://www.w3.org/2000/svg';
            const svg = document.createElementNS(ns, 'svg');
            svg.setAttribute('aria-hidden', 'true');
            svg.setAttribute('width', '0');
            svg.setAttribute('height', '0');
            svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
            svg.innerHTML = `<filter id="${id}" x="-10%" y="-20%" width="120%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.06" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="${Number(o.strength) || 7}" xChannelSelector="R" yChannelSelector="G"/></filter>`;
            document.body.appendChild(svg);
            const turb = svg.querySelector('feTurbulence');
            const prev = el.style.filter;
            el.style.filter = `url(#${id})`;
            let h = 0;
            const t0 = performance.now();
            const tick = (now) => {
                const t = ((now - t0) / 1000) * (Number(o.speed) || 1);
                turb?.setAttribute('baseFrequency', `${(0.012 + 0.004 * Math.sin(t * 1.3)).toFixed(4)} ${(0.06 + 0.02 * Math.cos(t)).toFixed(4)}`);
                h = raf(tick);
            };
            h = raf(tick);
            return () => {
                caf(h);
                el.style.filter = prev;
                svg.remove();
            };
        },
    },
    {
        name: 'neon-write',
        kind: 'text',
        description: 'Letters flicker on one by one like a neon sign being switched on, then keep a soft glow (`color`, `stagger`).',
        defaults: { color: '#ff4fd8', stagger: 70, duration: 520 },
        run: (el, o, ctx) => {
            var _a;
            const glow = `0 0 4px #fff,0 0 10px ${o.color},0 0 22px ${o.color},0 0 42px ${o.color}`;
            el.style.textShadow = glow;
            (_a = el.style).color || (_a.color = '#fff');
            if (ctx.reduced)
                return;
            const cs = splitChars(el);
            return shared.all(cs.map((c, i) => ctx.animate(c, [
                { opacity: 0.08, textShadow: 'none' },
                { opacity: 1, textShadow: glow, offset: 0.2 },
                { opacity: 0.2, textShadow: 'none', offset: 0.32 },
                { opacity: 1, textShadow: glow, offset: 0.46 },
                { opacity: 0.55, offset: 0.6 },
                { opacity: 1, textShadow: glow },
            ], { duration: o.duration, delay: i * o.stagger + shared.rand(0, 60), easing: 'steps(6, end)', fill: 'backwards' })));
        },
    },
    {
        name: 'particle-text',
        kind: 'text',
        description: 'Particles fly in from around the element and assemble into the glyphs, then hand over to the real text (`gap` px between samples, `duration`, `colors`).',
        defaults: { gap: 3, duration: 1300, colors: ['#7c5cff', '#22d3ee', '#ff5c8a'], spread: 120 },
        reduced: 'skip',
        run: (el, o) => {
            const cs = splitChars(el);
            const r = el.getBoundingClientRect();
            if (!r.width || !r.height)
                return;
            const pad = Number(o.spread) || 120;
            const W = Math.ceil(r.width + pad * 2);
            const H = Math.ceil(r.height + pad * 2);
            const canvas = document.createElement('canvas');
            canvas.setAttribute('aria-hidden', 'true');
            canvas.width = W;
            canvas.height = H;
            canvas.style.cssText = `position:absolute;left:${r.left - pad}px;top:${r.top - pad}px;width:${W}px;height:${H}px`;
            const g = canvas.getContext('2d');
            if (!g)
                return;
            // rasterise each character where the browser laid it out
            const cs0 = getComputedStyle(el);
            g.font = `${cs0.fontStyle} ${cs0.fontWeight} ${cs0.fontSize} ${cs0.fontFamily}`;
            g.textBaseline = 'middle';
            g.fillStyle = '#000';
            for (const c of cs) {
                const b = c.getBoundingClientRect();
                g.fillText(c.textContent || '', b.left - r.left + pad, b.top - r.top + pad + b.height / 2);
            }
            const img = g.getImageData(0, 0, W, H);
            const gap = Math.max(2, Math.round(Number(o.gap) || 3));
            const pts = [];
            for (let y = 0; y < H; y += gap)
                for (let x = 0; x < W; x += gap)
                    if (img.data[(y * W + x) * 4 + 3] > 128) {
                        const a = shared.rand(0, Math.PI * 2);
                        const rr = shared.rand(pad * 0.6, pad * 1.4);
                        pts.push({ x, y, sx: W / 2 + Math.cos(a) * (W / 2 + rr * 0.3), sy: H / 2 + Math.sin(a) * (H / 2 + rr * 0.3), c: o.colors[pts.length % o.colors.length], d: shared.rand(0, 0.35) });
                    }
            shared.fxLayer().appendChild(canvas);
            cs.forEach((c) => (c.style.opacity = '0'));
            const t0 = performance.now();
            const dur = Number(o.duration) || 1300;
            return new Promise((done) => {
                const finish = () => {
                    canvas.remove();
                    cs.forEach((c) => (c.style.opacity = ''));
                    done();
                };
                const tick = (now) => {
                    const k = (now - t0) / dur;
                    g.clearRect(0, 0, W, H);
                    for (const p of pts) {
                        const e = Math.min(1, Math.max(0, (k - p.d) / (1 - p.d)));
                        const q = 1 - Math.pow(1 - e, 3);
                        g.globalAlpha = k > 1 ? Math.max(0, 1 - (k - 1) * 4) : 0.25 + 0.75 * q;
                        g.fillStyle = p.c;
                        g.fillRect(p.sx + (p.x - p.sx) * q, p.sy + (p.y - p.sy) * q, gap - 0.5, gap - 0.5);
                    }
                    if (k > 1)
                        cs.forEach((c) => (c.style.opacity = String(Math.min(1, (k - 1) * 4))));
                    if (k < 1.25)
                        raf(tick);
                    else
                        finish();
                };
                if (!raf(tick))
                    finish();
            });
        },
    },
    {
        name: 'glitch-text',
        kind: 'text',
        description: 'RGB-split slices of the text jump sideways for a moment (`duration`, `colors` of the two channels).',
        defaults: { duration: 650, colors: ['#22d3ee', '#ff3d81'] },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return ctx.animate(el, [{ opacity: 1 }, { opacity: 0.6 }, { opacity: 1 }], { duration: 200 });
            if (getComputedStyle(el).position === 'static')
                el.style.position = 'relative';
            const text = el.textContent || '';
            const steps = 8;
            const mk = (color, dir) => {
                const s = document.createElement('span');
                s.setAttribute('aria-hidden', 'true');
                s.textContent = text;
                s.style.cssText = `position:absolute;inset:0;color:${color};mix-blend-mode:screen;pointer-events:none;white-space:inherit`;
                el.appendChild(s);
                const frames = [];
                for (let i = 0; i <= steps; i++) {
                    const top = Math.round(shared.rand(0, 80));
                    frames.push({ clipPath: `inset(${top}% 0 ${Math.max(0, 100 - top - shared.rand(8, 30)).toFixed(0)}% 0)`, transform: `translateX(${(dir * shared.rand(2, 9)).toFixed(1)}px)` });
                }
                frames.push({ clipPath: 'inset(50% 0 50% 0)', transform: 'none' });
                const a = ctx.animate(s, frames, { duration: o.duration, easing: `steps(${steps}, end)` });
                const rm = () => s.remove();
                if (a)
                    a.finished.then(rm, rm);
                else
                    rm();
                return a;
            };
            return shared.all([
                mk(o.colors[0], -1),
                mk(o.colors[1], 1),
                ctx.animate(el, [{ transform: 'none' }, { transform: 'translate(-2px,1px) skewX(-4deg)' }, { transform: 'translate(2px,-1px)' }, { transform: 'skewX(3deg)' }, { transform: 'none' }], { duration: o.duration, easing: 'steps(5, end)' }),
            ]);
        },
    },
    {
        name: 'text-trail',
        kind: 'cursor',
        description: 'The letters of a word fall off the pointer as it moves over the element (persistent; `text`, `color`, `spacing` px).',
        defaults: { text: 'MOTIONARY', color: '#7c5cff', spacing: 22, size: 18 },
        run: (el, o, ctx) => {
            const word = Array.from(String(o.text || '✦'));
            let i = 0;
            let lx = -1e4;
            let ly = -1e4;
            const move = (e) => {
                if (Math.hypot(e.clientX - lx, e.clientY - ly) < o.spacing)
                    return;
                lx = e.clientX;
                ly = e.clientY;
                const ch = word[i++ % word.length];
                shared.spawn(e.clientX - o.size / 2, e.clientY - o.size / 2, `font:800 ${o.size}px/1 system-ui,sans-serif;color:${o.color};text-shadow:0 2px 8px rgba(0,0,0,.25)`, ctx, [
                    { transform: 'translateY(0) rotate(0) scale(1)', opacity: 1 },
                    { transform: `translateY(${shared.rand(30, 60).toFixed(0)}px) rotate(${shared.rand(-60, 60).toFixed(0)}deg) scale(.6)`, opacity: 0 },
                ], { duration: shared.rand(700, 1000), easing: 'cubic-bezier(.3,.1,.7,1)' }, ch);
            };
            el.addEventListener('pointermove', move);
            return () => el.removeEventListener('pointermove', move);
        },
    },
    {
        name: 'font-breathe',
        kind: 'loop',
        description: 'A variable-font weight wave breathes through the text (`min` / `max` weight, `period` ms, `stagger`). Best with a variable font.',
        defaults: { min: 200, max: 900, period: 2400, stagger: 90 },
        run: (el, o, ctx) => {
            const cs = splitChars(el);
            const anims = cs.map((c, i) => ctx.animate(c, [
                { fontWeight: o.min, fontVariationSettings: `'wght' ${o.min}` },
                { fontWeight: o.max, fontVariationSettings: `'wght' ${o.max}` },
            ], { duration: o.period / 2, delay: i * o.stagger, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' }));
            return () => anims.forEach((a) => a?.cancel());
        },
    },
    {
        name: 'flip-chars',
        kind: 'text',
        description: 'Every character flips up in 3D around its baseline, staggered (`stagger`, `duration`, `axis` x | y).',
        defaults: { stagger: 45, duration: 700, axis: 'x' },
        run: (el, o, ctx) => {
            var _a;
            const cs = splitChars(el);
            (_a = el.style).perspective || (_a.perspective = '600px');
            const rot = o.axis === 'y' ? 'rotateY' : 'rotateX';
            return shared.all(cs.map((c, i) => {
                c.style.transformOrigin = '50% 70% -0.4em';
                c.style.backfaceVisibility = 'hidden';
                return ctx.reduced
                    ? ctx.animate(c, [{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: i * 10, fill: 'backwards' })
                    : ctx.animate(c, [{ transform: `${rot}(-100deg)`, opacity: 0 }, { transform: `${rot}(12deg)`, opacity: 1, offset: 0.7 }, { transform: `${rot}(0)`, opacity: 1 }], { duration: o.duration, delay: i * o.stagger, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'backwards' });
            }));
        },
    },
];
/** Register the 6.3 text pack (idempotent). */
function registerTextPack() {
    registry.registerEffects(TEXT3_FX);
}
/** @deprecated since 6.9 — use `registerTextPack()` (removed in 7.0; `npx usa-codemod-7`). */
function registerTextEffects3() {
    base.deprecate('registerTextEffects3', 'registerTextEffects3() is deprecated since 6.9 and removed in 7.0 — use registerTextPack() (npx usa-codemod-7).');
    registerTextPack();
}

exports.TEXT3_FX = TEXT3_FX;
exports.registerTextEffects3 = registerTextEffects3;
exports.registerTextPack = registerTextPack;
exports.splitChars = splitChars;
//# sourceMappingURL=fx-text.cjs.map
