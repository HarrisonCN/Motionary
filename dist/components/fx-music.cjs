'use strict';

var registry = require('../chunks/registry-BB1oO-lR.cjs');
var generative = require('../chunks/generative-BHIj-NU0.cjs');
var audio = require('../chunks/audio-BSQmg3MB.cjs');
require('../chunks/base-B3me2y0o.cjs');
require('../chunks/shared-jkgRH-Hx.cjs');

/** A smooth, deterministic fake analyser frame at time `t` (s). */
function syntheticSample(t, bins = 64) {
    const freq = new Uint8Array(bins);
    const wave = new Uint8Array(128);
    const beat = Math.pow(Math.max(0, Math.sin(t * Math.PI * 2 * 1.9)), 8);
    for (let i = 0; i < bins; i++) {
        const k = i / bins;
        const v = (0.75 - k * 0.55) * (0.55 + 0.25 * Math.sin(t * 3.1 + i * 0.45) + 0.2 * Math.sin(t * 5.3 - i * 0.9)) + (k < 0.12 ? beat * 0.45 : 0);
        freq[i] = Math.max(0, Math.min(255, Math.round(v * 255)));
    }
    for (let i = 0; i < 128; i++)
        wave[i] = Math.round(128 + 70 * (0.6 * Math.sin(i * 0.19 + t * 9) + 0.3 * Math.sin(i * 0.53 - t * 13) + 0.25 * beat * Math.sin(i * 0.05)));
    const bass = Array.from(freq.slice(0, Math.max(1, Math.round(bins * 0.08)))).reduce((a, b) => a + b, 0) / (Math.max(1, Math.round(bins * 0.08)) * 255);
    return { level: 0.35 + beat * 0.3, bass, freq, wave };
}
/** The live analyser frame, or the synthetic one. */
const musicSample = (t) => audio.getAudio()?.sample() ?? syntheticSample(t);
const bg = (name, description, defaults, spec) => ({
    name,
    kind: 'background',
    description,
    reduced: 'run',
    defaults: { speed: 1, quality: 1, colors: ['#22d3ee', '#7c5cff', '#f472b6'], ...defaults },
    run: (el, o, ctx) => {
        const stop = generative.canvasBackground(el, ctx, spec, o);
        ctx.onCleanup(stop);
        return stop;
    },
});
const grad = (ctx, x0, y0, x1, y1, colors) => {
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    colors.forEach((c, i) => g.addColorStop(i / Math.max(1, colors.length - 1), c));
    return g;
};
/** A loop effect driven by the music sample each frame. */
const loop = (name, description, defaults, apply) => ({
    name,
    kind: 'loop',
    description,
    defaults,
    reduced: 'skip',
    run: (el, o, ctx) => {
        const prev = el.style.transform;
        const st = {};
        let raf = 0;
        const t0 = performance.now();
        const f = (now) => {
            const t = (now - t0) / 1000;
            apply(el, musicSample(t), t, o, st);
            raf = requestAnimationFrame(f);
        };
        if (typeof requestAnimationFrame === 'function')
            raf = requestAnimationFrame(f);
        const stop = () => {
            cancelAnimationFrame(raf);
            el.style.transform = prev;
        };
        ctx.onCleanup(stop);
        return stop;
    },
});
const MUSIC_FX = [
    bg('waveform-scope', 'An oscilloscope line of the waveform with a soft glow (Canvas 2D; live analyser or synthetic).', { width: 2.5 }, {
        draw: ({ ctx, w, h, t, o }) => {
            const s = musicSample(t);
            ctx.clearRect(0, 0, w, h);
            ctx.lineWidth = o.width;
            ctx.strokeStyle = grad(ctx, 0, 0, w, 0, o.colors);
            ctx.shadowColor = o.colors[0];
            ctx.shadowBlur = 10;
            ctx.beginPath();
            const n = s.wave.length;
            for (let i = 0; i < n; i++) {
                const x = (i / (n - 1)) * w;
                const y = h / 2 + ((s.wave[i] - 128) / 128) * h * 0.4;
                if (i)
                    ctx.lineTo(x, y);
                else
                    ctx.moveTo(x, y);
            }
            ctx.stroke();
            ctx.shadowBlur = 0;
        },
    }),
    bg('radial-spectrum', 'Spectrum bars around a circle that breathes with the bass (Canvas 2D).', { bars: 48 }, {
        draw: ({ ctx, w, h, t, o }) => {
            const s = musicSample(t);
            ctx.clearRect(0, 0, w, h);
            const cx = w / 2;
            const cy = h / 2;
            const r0 = Math.min(w, h) * (0.18 + s.bass * 0.06);
            const n = o.bars;
            ctx.lineCap = 'round';
            ctx.lineWidth = Math.max(2, (Math.PI * 2 * r0) / n / 2);
            for (let i = 0; i < n; i++) {
                const v = s.freq[Math.floor((i / n) * s.freq.length * 0.8)] / 255;
                const a = (i / n) * Math.PI * 2 - Math.PI / 2;
                const len = Math.min(w, h) * 0.28 * v + 2;
                ctx.strokeStyle = o.colors[i % o.colors.length];
                ctx.beginPath();
                ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
                ctx.lineTo(cx + Math.cos(a) * (r0 + len), cy + Math.sin(a) * (r0 + len));
                ctx.stroke();
            }
        },
    }),
    bg('spectrum-mirror', 'Mirrored spectrum bars with a reflection on the floor (Canvas 2D).', { bars: 32, gap: 3 }, {
        draw: ({ ctx, w, h, t, o }) => {
            const s = musicSample(t);
            ctx.clearRect(0, 0, w, h);
            const n = o.bars;
            const bw = Math.max(1, (w - o.gap * (n - 1)) / n);
            const base = h * 0.68;
            ctx.fillStyle = grad(ctx, 0, base - h * 0.6, 0, base, o.colors);
            for (let i = 0; i < n; i++) {
                const v = s.freq[Math.floor((Math.abs(i - n / 2) / (n / 2)) * s.freq.length * 0.7)] / 255;
                const bh = Math.max(2, v * h * 0.6);
                const x = i * (bw + o.gap);
                ctx.globalAlpha = 1;
                ctx.fillRect(x, base - bh, bw, bh);
                ctx.globalAlpha = 0.22;
                ctx.fillRect(x, base + 2, bw, bh * 0.45);
            }
            ctx.globalAlpha = 1;
        },
    }),
    bg('sound-particles', 'Particles launched upward by the bass, coloured by pitch (Canvas 2D).', { max: 140 }, {
        init: () => ({ p: [] }),
        draw: ({ ctx, w, h, t, state, o }) => {
            const s = musicSample(t);
            const dt = state.last ? Math.min(0.05, t - state.last) : 0;
            state.last = t;
            ctx.clearRect(0, 0, w, h);
            const spawn = Math.round(s.bass * 6);
            for (let i = 0; i < spawn && state.p.length < o.max; i++)
                state.p.push({ x: Math.random() * w, y: h + 4, vx: (Math.random() - 0.5) * 40, vy: -(80 + s.bass * 260 + Math.random() * 60), life: 1, c: o.colors[Math.floor(Math.random() * o.colors.length)] });
            state.p = state.p.filter((p) => {
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.vy += 120 * dt;
                p.life -= dt * 0.6;
                ctx.globalAlpha = Math.max(0, p.life);
                ctx.fillStyle = p.c;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
                ctx.fill();
                return p.life > 0 && p.y < h + 10;
            });
            ctx.globalAlpha = 1;
        },
    }),
    loop('beat-bounce', 'The element pumps with the bass (`amount`).', { amount: 0.12 }, (el, s, _t, o) => {
        el.style.transform = `scale(${(1 + s.bass * o.amount).toFixed(4)})`;
    }),
    loop('vinyl-spin', 'The element turns like a record at 33⅓ rpm; the level speeds it up (`rpm`).', { rpm: 33.3 }, (el, s, t, o, st) => {
        const dt = st.last ? Math.min(0.05, t - st.last) : 0;
        st.last = t;
        st.a = ((st.a || 0) + (o.rpm / 60) * 360 * dt * (0.8 + s.level * 0.6)) % 360;
        el.style.transform = `rotate(${st.a.toFixed(2)}deg)`;
    }),
];
/** Register the 7.1 music visualization pack (idempotent). */
function registerMusicPack() {
    registry.registerEffects(MUSIC_FX);
}

exports.MUSIC_FX = MUSIC_FX;
exports.musicSample = musicSample;
exports.registerMusicPack = registerMusicPack;
exports.syntheticSample = syntheticSample;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.3.0/dist/components/fx-music.cjs.map