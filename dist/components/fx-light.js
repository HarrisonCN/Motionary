import { registerEffects } from '../chunks/registry-CyKExAmE.js';
import { c as canvasBackground, h as hexRgb } from '../chunks/generative-2LhxG5BJ.js';
import { o as overlay } from '../chunks/shared-CkKHWrtJ.js';
import '../chunks/base-2-yYc93C.js';

/** Track the pointer over `el` as 0–1 coordinates (`fn(x, y, inside)`); starts at (`x0`, `y0`). Returns a remover. */
function trackPointer(el, ctx, fn, x0 = 0.3, y0 = 0.25) {
    fn(x0, y0, false);
    if (ctx.reduced)
        return () => undefined;
    let raf = 0;
    let px = x0;
    let py = y0;
    let inside = false;
    const flush = () => {
        raf = 0;
        fn(px, py, inside);
    };
    const queue = () => {
        if (!raf)
            raf = typeof requestAnimationFrame === 'function' ? requestAnimationFrame(flush) : (flush(), 0);
    };
    const move = (e) => {
        const r = el.getBoundingClientRect();
        px = r.width ? Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) : 0.5;
        py = r.height ? Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)) : 0.5;
        inside = true;
        queue();
    };
    const leave = () => {
        inside = false;
        px = x0;
        py = y0;
        queue();
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
        if (raf && typeof cancelAnimationFrame === 'function')
            cancelAnimationFrame(raf);
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerleave', leave);
    };
}
const rgba = (hex, a) => {
    const [r, g, b] = hexRgb(hex);
    return `rgba(${r},${g},${b},${a})`;
};
const LIGHT_FX = [
    {
        name: 'light-follow',
        kind: 'hover',
        reduced: 'run',
        description: 'A soft point light with a specular hot spot follows the pointer over the surface (persistent; `color`, `size` px, `intensity` 0–1).',
        defaults: { color: '#ffffff', size: 260, intensity: 0.55 },
        run: (el, o, ctx) => {
            const [ov, rm] = overlay(el, 'mix-blend-mode:soft-light;transition:opacity .3s;z-index:1');
            const [spec, rm2] = overlay(el, 'mix-blend-mode:screen;z-index:1');
            const stop = trackPointer(el, ctx, (x, y, inside) => {
                const p = `${(x * 100).toFixed(1)}% ${(y * 100).toFixed(1)}%`;
                ov.style.background = `radial-gradient(${o.size}px circle at ${p}, ${rgba(o.color, o.intensity)}, transparent 70%), radial-gradient(${o.size * 2.4}px circle at ${p}, transparent 30%, rgba(0,0,0,${(o.intensity * 0.45).toFixed(2)}))`;
                spec.style.background = `radial-gradient(${Math.round(o.size / 5)}px circle at ${p}, ${rgba(o.color, inside ? o.intensity * 0.7 : o.intensity * 0.35)}, transparent 70%)`;
                el.style.setProperty('--usa-lx', x.toFixed(3));
                el.style.setProperty('--usa-ly', y.toFixed(3));
            });
            return () => {
                stop();
                rm();
                rm2();
            };
        },
    },
    {
        name: 'refraction',
        kind: 'hover',
        reduced: 'run',
        description: 'A glass lens bends and magnifies what is behind it while following the pointer (persistent; `size` px, `blur`, `rim` color). Uses backdrop-filter.',
        defaults: { size: 120, blur: 1.5, zoom: 1.12, rim: '#9be7ff' },
        run: (el, o, ctx) => {
            if (getComputedStyle(el).position === 'static')
                el.style.position = 'relative';
            const lens = document.createElement('span');
            lens.setAttribute('aria-hidden', 'true');
            const s = Number(o.size) || 120;
            lens.style.cssText = `position:absolute;left:0;top:0;width:${s}px;height:${s}px;border-radius:50%;pointer-events:none;z-index:2;` +
                `-webkit-backdrop-filter:blur(${o.blur}px) saturate(1.6) contrast(1.08) brightness(1.08);backdrop-filter:blur(${o.blur}px) saturate(1.6) contrast(1.08) brightness(1.08);` +
                `box-shadow:inset 0 0 0 1px rgba(255,255,255,.55),inset 6px 8px 14px rgba(255,255,255,.45),inset -8px -10px 18px ${rgba(o.rim, 0.45)},0 10px 30px -8px rgba(0,0,0,.35);` +
                `background:radial-gradient(circle at 32% 28%,rgba(255,255,255,.55),rgba(255,255,255,0) 32%),radial-gradient(circle at 70% 78%,${rgba(o.rim, 0.25)},transparent 45%);transform-origin:50% 50%;will-change:transform;transition:opacity .25s`;
            el.appendChild(lens);
            const stop = trackPointer(el, ctx, (x, y, inside) => {
                const w = el.clientWidth;
                const h = el.clientHeight;
                lens.style.transform = `translate(${(x * w - s / 2).toFixed(1)}px,${(y * h - s / 2).toFixed(1)}px) scale(${inside ? o.zoom : 1})`;
                lens.style.opacity = inside || ctx.reduced ? '1' : '.85';
            }, 0.5, 0.5);
            return () => {
                stop();
                lens.remove();
            };
        },
    },
    {
        name: 'brushed-metal',
        kind: 'card',
        reduced: 'run',
        description: 'Fine brushed-metal lines with an anisotropic sheen that turns with the pointer angle (persistent; `tint`, `lines` px).',
        defaults: { tint: '#cbd5e1', lines: 2 },
        run: (el, o, ctx) => {
            const l = Math.max(1, Number(o.lines) || 2);
            const [grain, rm] = overlay(el, `z-index:0;opacity:.55;mix-blend-mode:overlay;background:repeating-linear-gradient(90deg,rgba(255,255,255,.18) 0 1px,rgba(0,0,0,.12) 1px ${l}px,rgba(255,255,255,.06) ${l}px ${l * 2 + 1}px),linear-gradient(180deg,${rgba(o.tint, 0.9)},${rgba(o.tint, 0.55)})`);
            const [sheen, rm2] = overlay(el, 'z-index:1;mix-blend-mode:soft-light');
            const stop = trackPointer(el, ctx, (x, y) => {
                const ang = Math.atan2(y - 0.5, x - 0.5) * (180 / Math.PI) + 90;
                sheen.style.background = `conic-gradient(from ${ang.toFixed(1)}deg at ${(x * 100).toFixed(1)}% ${(y * 100).toFixed(1)}%, rgba(255,255,255,.75), rgba(0,0,0,.35) 25%, rgba(255,255,255,.6) 50%, rgba(0,0,0,.35) 75%, rgba(255,255,255,.75))`;
            });
            return () => {
                stop();
                rm();
                rm2();
            };
        },
    },
    {
        name: 'pearlescent',
        kind: 'card',
        reduced: 'run',
        description: 'A nacre / holographic film whose hues shift with the pointer position (persistent; `strength` 0–1).',
        defaults: { strength: 0.6 },
        run: (el, o, ctx) => {
            const [film, rm] = overlay(el, `z-index:1;mix-blend-mode:color-dodge;opacity:${o.strength}`);
            const [gloss, rm2] = overlay(el, 'z-index:1;mix-blend-mode:soft-light');
            const stop = trackPointer(el, ctx, (x, y) => {
                const hue = Math.round((x * 0.7 + y * 0.3) * 360);
                film.style.background = `linear-gradient(${Math.round(115 + x * 50)}deg, hsla(${hue},90%,70%,.55), hsla(${hue + 60},90%,75%,.35) 25%, hsla(${hue + 140},85%,70%,.5) 50%, hsla(${hue + 220},90%,75%,.35) 75%, hsla(${hue + 300},90%,70%,.55))`;
                film.style.backgroundSize = '220% 220%';
                film.style.backgroundPosition = `${(x * 100).toFixed(1)}% ${(y * 100).toFixed(1)}%`;
                gloss.style.background = `radial-gradient(80% 60% at ${(x * 100).toFixed(1)}% ${(y * 100).toFixed(1)}%, rgba(255,255,255,.65), transparent 60%)`;
            });
            return () => {
                stop();
                rm();
                rm2();
            };
        },
    },
    {
        name: 'god-rays',
        kind: 'background',
        reduced: 'run',
        description: 'Volumetric light shafts fan out from a source point and slowly sweep (Canvas 2D, additive; `color`, `rays`, `x` / `y` source 0–1).',
        defaults: { color: '#ffe7a3', background: '#0b1020', rays: 14, x: 0.5, y: -0.1, speed: 1, quality: 1 },
        run: (el, o, ctx) => {
            const stop = canvasBackground(el, ctx, {
                init: () => ({ seeds: Array.from({ length: Math.max(3, o.rays | 0) }, (_, i) => ({ a: (i / o.rays) * 1.6 - 0.8 + Math.random() * 0.08, w: 0.03 + Math.random() * 0.06, p: Math.random() * 6.28 })) }),
                draw: ({ ctx: g, w, h, t, state }) => {
                    g.globalCompositeOperation = 'source-over';
                    g.fillStyle = o.background;
                    g.fillRect(0, 0, w, h);
                    const sx = o.x * w;
                    const sy = o.y * h;
                    const len = Math.hypot(w, h) * 1.2;
                    const [r, gg, b] = hexRgb(o.color);
                    g.globalCompositeOperation = 'lighter';
                    for (const s of state.seeds) {
                        const a = Math.PI / 2 + s.a + Math.sin(t * 0.25 * o.speed + s.p) * 0.08;
                        const alpha = 0.1 + 0.08 * Math.sin(t * 0.8 * o.speed + s.p * 2);
                        const grad = g.createLinearGradient(sx, sy, sx + Math.cos(a) * len, sy + Math.sin(a) * len);
                        grad.addColorStop(0, `rgba(${r},${gg},${b},${(alpha * 2).toFixed(3)})`);
                        grad.addColorStop(1, `rgba(${r},${gg},${b},0)`);
                        g.fillStyle = grad;
                        g.beginPath();
                        g.moveTo(sx, sy);
                        g.lineTo(sx + Math.cos(a - s.w) * len, sy + Math.sin(a - s.w) * len);
                        g.lineTo(sx + Math.cos(a + s.w) * len, sy + Math.sin(a + s.w) * len);
                        g.closePath();
                        g.fill();
                    }
                    const glow = g.createRadialGradient(sx, sy, 0, sx, sy, Math.max(w, h) * 0.45);
                    glow.addColorStop(0, `rgba(${r},${gg},${b},.45)`);
                    glow.addColorStop(1, `rgba(${r},${gg},${b},0)`);
                    g.fillStyle = glow;
                    g.fillRect(0, 0, w, h);
                    g.globalCompositeOperation = 'source-over';
                },
            }, o);
            ctx.onCleanup(stop);
            return stop;
        },
    },
    {
        name: 'pointer-shadow',
        kind: 'hover',
        reduced: 'run',
        description: 'The pointer is the light: the element casts a soft real-time shadow away from it (persistent; `depth` px, `blur`, `color`).',
        defaults: { depth: 22, blur: 18, color: 'rgba(15,23,42,.38)' },
        run: (el, o, ctx) => {
            const prev = el.style.filter;
            const stop = trackPointer(el, ctx, (x, y, inside) => {
                const dx = (0.5 - x) * 2 * o.depth;
                const dy = (0.5 - y) * 2 * o.depth;
                const k = inside ? 1 : 0.6;
                el.style.filter = `drop-shadow(${(dx * k).toFixed(1)}px ${(dy * k + 4).toFixed(1)}px ${o.blur}px ${o.color})`;
            }, 0.35, 0.2);
            return () => {
                stop();
                el.style.filter = prev;
            };
        },
    },
];
/** Register the 6.4 light & materials pack (idempotent). */
function registerLightPack() {
    registerEffects(LIGHT_FX);
}

export { LIGHT_FX, registerLightPack, trackPointer };
//# sourceMappingURL=fx-light.js.map
