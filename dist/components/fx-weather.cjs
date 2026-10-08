'use strict';

var registry = require('../chunks/registry-DehBVRDV.cjs');
var generative = require('../chunks/generative-BHIj-NU0.cjs');
var shared = require('../chunks/shared-jkgRH-Hx.cjs');
require('../chunks/base-BaQV-2ha.cjs');

const bg = (name, description, defaults, spec) => ({
    name,
    kind: 'background',
    description,
    reduced: 'run',
    defaults: { speed: 1, quality: 1, ...defaults },
    run: (el, o, ctx) => {
        const stop = generative.canvasBackground(el, ctx, spec, o);
        ctx.onCleanup(stop);
        return stop;
    },
});
const step = (state, t) => {
    const dt = state.last ? Math.min(0.05, t - state.last) : 0;
    state.last = t;
    return dt;
};
/** Mix two `[r,g,b]` colours. */
const mix = (a, b, k) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(',')})`;
/** Sky colours (top, bottom) for an hour 0–24. */
function skyAt(hour) {
    const keys = [
        [0, [8, 10, 30], [22, 26, 60]],
        [5, [30, 27, 75], [250, 140, 110]],
        [7, [90, 160, 230], [255, 210, 160]],
        [12, [40, 130, 230], [170, 215, 255]],
        [17, [70, 120, 200], [255, 190, 130]],
        [19, [60, 40, 110], [250, 110, 90]],
        [21, [12, 14, 40], [40, 36, 90]],
        [24, [8, 10, 30], [22, 26, 60]],
    ];
    const h = ((hour % 24) + 24) % 24;
    let i = 0;
    while (i < keys.length - 2 && keys[i + 1][0] <= h)
        i++;
    const [h0, t0, b0] = keys[i];
    const [h1, t1, b1] = keys[i + 1];
    const k = (h - h0) / (h1 - h0 || 1);
    return [mix(t0, t1, k), mix(b0, b1, k)];
}
const WEATHER_FX = [
    bg('rain-glass', 'Droplets on a window pane grow and run down, leaving trails (Canvas 2D).', { count: 70, tint: 'rgba(200,225,255,.55)' }, {
        init: (w, h, o) => ({ d: Array.from({ length: o.count }, () => ({ x: Math.random() * w, y: Math.random() * h, r: shared.rand(1, 3.2), v: 0, trail: [] })) }),
        draw: ({ ctx, w, h, t, state, o }) => {
            const dt = step(state, t) * o.speed;
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = 'rgba(30,50,80,.12)';
            ctx.fillRect(0, 0, w, h);
            for (const d of state.d) {
                if (d.r > 2.6 && Math.random() < dt * 0.6)
                    d.v = shared.rand(40, 110);
                if (d.v) {
                    d.y += d.v * dt;
                    d.x += Math.sin(d.y * 0.05) * 0.3;
                    d.trail.push([d.x, d.y]);
                    if (d.trail.length > 18)
                        d.trail.shift();
                    if (d.y > h + 6)
                        Object.assign(d, { y: -4, x: Math.random() * w, r: shared.rand(1, 2.4), v: 0, trail: [] });
                }
                else
                    d.r = Math.min(3.4, d.r + dt * 0.25);
                if (d.trail.length > 1) {
                    ctx.strokeStyle = 'rgba(220,235,255,.25)';
                    ctx.lineWidth = d.r * 0.7;
                    ctx.beginPath();
                    d.trail.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
                    ctx.stroke();
                }
                const g = ctx.createRadialGradient(d.x - d.r * 0.3, d.y - d.r * 0.4, 0, d.x, d.y, d.r * 1.4);
                g.addColorStop(0, 'rgba(255,255,255,.9)');
                g.addColorStop(1, o.tint);
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.ellipse(d.x, d.y, d.r, d.r * 1.15, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        },
    }),
    bg('snowfall', 'Snowflakes drift down and pile up along the bottom edge (Canvas 2D).', { count: 90, pile: 18, color: '#ffffff' }, {
        init: (w, h, o) => ({ f: Array.from({ length: o.count }, () => ({ x: Math.random() * w, y: Math.random() * h, r: shared.rand(1, 3.4), ph: shared.rand(0, 6.3) })), pile: new Float32Array(Math.max(2, Math.ceil(w / 6))) }),
        draw: ({ ctx, w, h, t, state, o, quality }) => {
            const dt = step(state, t) * o.speed;
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = o.color;
            const n = Math.max(8, Math.round(state.f.length * quality));
            for (let i = 0; i < n; i++) {
                const f = state.f[i];
                f.y += (14 + f.r * 9) * dt;
                f.x += Math.sin(t * 0.8 + f.ph) * 12 * dt;
                const col = Math.min(state.pile.length - 1, Math.max(0, Math.floor(f.x / 6)));
                if (f.y > h - state.pile[col]) {
                    state.pile[col] = Math.min(o.pile, state.pile[col] + f.r * 0.12);
                    f.y = -5;
                    f.x = Math.random() * w;
                }
                ctx.globalAlpha = 0.55 + f.r / 8;
                ctx.beginPath();
                ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 0.95;
            ctx.beginPath();
            ctx.moveTo(0, h);
            for (let c = 0; c < state.pile.length; c++)
                ctx.lineTo(c * 6 + 3, h - state.pile[c] - Math.sin(c * 0.7) * Math.min(2, state.pile[c] * 0.2));
            ctx.lineTo(w, h);
            ctx.fill();
            ctx.globalAlpha = 1;
        },
    }),
    bg('lightning', 'A safe storm: branching bolts at most once per `interval` (≥ 2.5 s), sky glow capped at 22 %, no flash under reduced motion (Canvas 2D).', { interval: 4, glow: 0.22, color: '#c7d2fe' }, {
        init: () => ({ next: 1.2, bolt: null, age: 0 }),
        draw: ({ ctx, w, h, t, state, o }) => {
            const dt = step(state, t);
            ctx.clearRect(0, 0, w, h);
            const sky = ctx.createLinearGradient(0, 0, 0, h);
            sky.addColorStop(0, '#0b1020');
            sky.addColorStop(1, '#1e293b');
            ctx.fillStyle = sky;
            ctx.fillRect(0, 0, w, h);
            if (t === 0)
                return;
            const every = Math.max(2.5, Number(o.interval) || 4);
            if (t > state.next) {
                state.next = t + every + Math.random() * every * 0.5;
                const segs = [];
                const branch = (x, y, len, depth) => {
                    let cx = x;
                    let cy = y;
                    const path = [[cx, cy]];
                    while (cy < y + len && cy < h) {
                        cx += shared.rand(-14, 14);
                        cy += shared.rand(8, 18);
                        path.push([cx, cy]);
                        if (depth < 2 && Math.random() < 0.12)
                            branch(cx, cy, len * 0.4, depth + 1);
                    }
                    segs.push(path);
                };
                branch(shared.rand(w * 0.2, w * 0.8), 0, h * 0.85, 0);
                state.bolt = segs;
                state.age = 0;
            }
            if (state.bolt) {
                state.age += dt;
                const a = Math.max(0, 1 - state.age / 0.45);
                ctx.fillStyle = `rgba(200,210,255,${(Math.min(0.22, Number(o.glow) || 0.22) * a).toFixed(3)})`;
                ctx.fillRect(0, 0, w, h);
                ctx.strokeStyle = o.color;
                ctx.shadowColor = o.color;
                ctx.shadowBlur = 12;
                ctx.globalAlpha = a;
                state.bolt.forEach((p, i) => {
                    ctx.lineWidth = i === state.bolt.length - 1 ? 2.4 : 1;
                    ctx.beginPath();
                    p.forEach(([x, y], j) => (j ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
                    ctx.stroke();
                });
                ctx.globalAlpha = 1;
                ctx.shadowBlur = 0;
                if (a <= 0)
                    state.bolt = null;
            }
        },
    }),
    bg('fog', 'Soft layered fog banks drifting at different speeds (Canvas 2D).', { banks: 9, color: '226,232,240', density: 0.35 }, {
        init: (w, h, o) => ({ b: Array.from({ length: o.banks }, (_, i) => ({ x: Math.random() * w, y: h * (0.35 + (i / o.banks) * 0.65), r: shared.rand(0.35, 0.7) * Math.max(w, h), v: shared.rand(6, 22) * (i % 2 ? 1 : -1) })) }),
        draw: ({ ctx, w, h, t, state, o }) => {
            const dt = step(state, t) * o.speed;
            ctx.clearRect(0, 0, w, h);
            for (const b of state.b) {
                b.x += b.v * dt;
                if (b.x > w + b.r)
                    b.x = -b.r;
                if (b.x < -b.r)
                    b.x = w + b.r;
                const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
                g.addColorStop(0, `rgba(${o.color},${o.density})`);
                g.addColorStop(1, `rgba(${o.color},0)`);
                ctx.fillStyle = g;
                ctx.fillRect(0, 0, w, h);
            }
        },
    }),
    bg('aurora-veil', 'Curtains of northern lights waving over a starry night sky (Canvas 2D).', { colors: ['#22d3ee', '#a3e635', '#c084fc'], stars: 60 }, {
        init: (w, h, o) => ({ s: Array.from({ length: o.stars }, () => [Math.random() * w, Math.random() * h * 0.7, Math.random()]) }),
        draw: ({ ctx, w, h, t, state, o }) => {
            const sky = ctx.createLinearGradient(0, 0, 0, h);
            sky.addColorStop(0, '#020617');
            sky.addColorStop(1, '#0f172a');
            ctx.fillStyle = sky;
            ctx.fillRect(0, 0, w, h);
            for (const [x, y, k] of state.s) {
                ctx.fillStyle = `rgba(255,255,255,${(0.3 + 0.5 * Math.abs(Math.sin(t * 1.5 + k * 9))).toFixed(2)})`;
                ctx.fillRect(x, y, 1.4, 1.4);
            }
            ctx.globalCompositeOperation = 'lighter';
            o.colors.forEach((c, i) => {
                const base = h * (0.25 + i * 0.12);
                for (let x = 0; x < w; x += 4) {
                    const y = base + Math.sin(x * 0.012 + t * (0.5 + i * 0.2) + i) * h * 0.08 + Math.sin(x * 0.03 - t * 0.7) * h * 0.03;
                    const len = h * (0.22 + 0.12 * Math.sin(x * 0.02 + t + i));
                    const g = ctx.createLinearGradient(0, y - len, 0, y);
                    g.addColorStop(0, 'rgba(0,0,0,0)');
                    g.addColorStop(1, c);
                    ctx.globalAlpha = 0.16;
                    ctx.fillStyle = g;
                    ctx.fillRect(x, y - len, 4, len);
                }
            });
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
        },
    }),
    bg('day-cycle', 'The sky moves through dawn, day, dusk and night with the sun and moon on an arc (`cycle` seconds or a fixed `hour`) (Canvas 2D).', { cycle: 24, hour: null }, {
        draw: ({ ctx, w, h, t, o }) => {
            const hour = typeof o.hour === 'number' ? o.hour : (8 + (t / Math.max(4, Number(o.cycle) || 24)) * 24) % 24;
            const [top, bot] = skyAt(hour);
            const g = ctx.createLinearGradient(0, 0, 0, h);
            g.addColorStop(0, top);
            g.addColorStop(1, bot);
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, w, h);
            const body = (k, color, r) => {
                if (k < 0 || k > 1)
                    return;
                const x = w * k;
                const y = h * 0.9 - Math.sin(k * Math.PI) * h * 0.75;
                ctx.fillStyle = color;
                ctx.shadowColor = color;
                ctx.shadowBlur = 24;
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            };
            body((hour - 6) / 12, '#fde047', Math.min(w, h) * 0.07);
            body(((hour + 6) % 24) / 12, '#e2e8f0', Math.min(w, h) * 0.05);
            ctx.fillStyle = 'rgba(15,23,42,.55)';
            ctx.beginPath();
            ctx.moveTo(0, h);
            for (let x = 0; x <= w; x += 8)
                ctx.lineTo(x, h * 0.88 - Math.sin(x * 0.015) * h * 0.05 - Math.sin(x * 0.041) * h * 0.02);
            ctx.lineTo(w, h);
            ctx.fill();
        },
    }),
];
/** Register the 6.8 weather & ambience pack (idempotent). */
function registerWeatherEffects() {
    registry.registerEffects(WEATHER_FX);
}

exports.WEATHER_FX = WEATHER_FX;
exports.registerWeatherEffects = registerWeatherEffects;
exports.skyAt = skyAt;
//# sourceMappingURL=fx-weather.cjs.map
