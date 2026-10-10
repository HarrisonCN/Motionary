import { P as PALETTE } from './shared-CkKHWrtJ.js';

/** Deterministic smooth pseudo-noise in [-1, 1] (sum of sines — cheap, no tables). */
function noise2(x, y, t = 0) {
    return (Math.sin(x * 1.7 + t) * Math.cos(y * 1.3 - t * 0.7) + Math.sin((x + y) * 0.9 + t * 0.5) * 0.5 + Math.cos(x * 0.6 - y * 1.1 - t * 0.3) * 0.5) / 2;
}
/** Hex `#rrggbb` → [r, g, b]. */
function hexRgb(hex) {
    const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex.trim());
    return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [124, 92, 255];
}
/**
 * Mount a generative canvas behind `el` and run `spec` on it. Returns the
 * cleanup. Exposed for custom generative effects.
 */
function canvasBackground(el, fx, spec, o) {
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.setAttribute('data-usa-fx-canvas', '');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:-1;border-radius:inherit';
    const restore = [];
    const set = (k, v) => {
        restore.push([k, el.style[k]]);
        el.style[k] = v;
    };
    if (getComputedStyle(el).position === 'static')
        set('position', 'relative');
    set('isolation', 'isolate');
    el.prepend(canvas);
    const ctx = canvas.getContext('2d');
    let raf = 0;
    let visible = true;
    let quality = Math.min(1, Math.max(0.35, Number(o.quality) || 1));
    let w = 0;
    let h = 0;
    let state = null;
    const t0 = performance.now();
    let last = t0;
    let slow = 0;
    let fast = 0;
    const resize = () => {
        const r = el.getBoundingClientRect();
        w = Math.max(1, Math.round(r.width));
        h = Math.max(1, Math.round(r.height));
        const dpr = Math.min(2, (typeof devicePixelRatio === 'number' ? devicePixelRatio : 1) || 1) * quality;
        canvas.width = Math.max(1, Math.round(w * dpr));
        canvas.height = Math.max(1, Math.round(h * dpr));
        if (ctx)
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        state = spec.init ? spec.init(w, h, o) : {};
    };
    const frame = (now) => {
        raf = 0;
        if (!ctx)
            return;
        const dt = now - last;
        last = now;
        // adaptive quality: sustained slow frames lower the render scale, fast ones raise it
        if (dt > 28)
            slow++;
        else if (dt < 18)
            fast++;
        if (slow > 20 && quality > 0.35) {
            quality = Math.max(0.35, quality - 0.15);
            slow = fast = 0;
            resize();
        }
        else if (fast > 240 && quality < 1) {
            quality = Math.min(1, quality + 0.15);
            slow = fast = 0;
            resize();
        }
        spec.draw({ ctx, w, h, t: (now - t0) / 1000, quality, state, o });
        if (visible && !document.hidden)
            raf = requestAnimationFrame(frame);
    };
    const start = () => {
        if (!raf && ctx && !fx.reduced) {
            last = performance.now();
            raf = requestAnimationFrame(frame);
        }
    };
    resize();
    if (ctx)
        spec.draw({ ctx, w, h, t: 0, quality, state, o }); // first / static frame
    const io = typeof IntersectionObserver === 'function' ? new IntersectionObserver((es) => {
        visible = es.some((e) => e.isIntersecting);
        if (visible)
            start();
    }) : null;
    io?.observe(el);
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => {
        resize();
        if (ctx && fx.reduced)
            spec.draw({ ctx, w, h, t: 0, quality, state, o });
    }) : null;
    ro?.observe(el);
    const vis = () => !document.hidden && visible && start();
    document.addEventListener('visibilitychange', vis);
    start();
    return () => {
        cancelAnimationFrame(raf);
        raf = 0;
        io?.disconnect();
        ro?.disconnect();
        document.removeEventListener('visibilitychange', vis);
        canvas.remove();
        for (const [k, v] of restore)
            el.style[k] = v;
    };
}
const gen = (name, description, defaults, spec) => ({
    name,
    kind: 'background',
    description,
    reduced: 'run',
    defaults: { colors: PALETTE, background: '#0b0d12', speed: 1, quality: 1, ...defaults },
    run: (el, o, ctx) => canvasBackground(el, ctx, spec, o),
});
/** Low-resolution scalar field → ImageData, drawn scaled up (used by voronoi / metaballs / contours). */
function field(f, cell, px) {
    const step = Math.max(2, Math.round(cell / f.quality));
    const cw = Math.max(1, Math.ceil(f.w / step));
    const ch = Math.max(1, Math.ceil(f.h / step));
    const st = f.state;
    if (!st.buf || st.buf.width !== cw || st.buf.height !== ch) {
        st.buf = document.createElement('canvas');
        st.buf.width = cw;
        st.buf.height = ch;
        st.bctx = st.buf.getContext('2d');
        st.img = st.bctx?.createImageData(cw, ch);
    }
    if (!st.bctx || !st.img)
        return;
    const d = st.img.data;
    for (let y = 0; y < ch; y++)
        for (let x = 0; x < cw; x++)
            px(x * step, y * step, d, (y * cw + x) * 4);
    st.bctx.putImageData(st.img, 0, 0);
    f.ctx.imageSmoothingEnabled = true;
    f.ctx.drawImage(st.buf, 0, 0, f.w, f.h);
}
const GENERATIVE_FX = [
    gen('flow-field', 'Particles drift along a slowly changing flow field, leaving silky trails.', { count: 600, fade: 0.06 }, {
        init: (w, h, o) => ({ p: Array.from({ length: o.count }, () => [Math.random() * w, Math.random() * h]) }),
        draw: ({ ctx, w, h, t, state, o, quality }) => {
            ctx.fillStyle = o.background;
            ctx.globalAlpha = t === 0 ? 1 : o.fade;
            ctx.fillRect(0, 0, w, h);
            ctx.globalAlpha = 0.8;
            const n = Math.round(state.p.length * quality);
            const steps = t === 0 ? 40 : 1;
            for (let i = 0; i < n; i++) {
                const q = state.p[i];
                ctx.fillStyle = o.colors[i % o.colors.length];
                for (let s = 0; s < steps; s++) {
                    const a = noise2(q[0] * 0.004, q[1] * 0.004, t * 0.15 * o.speed) * Math.PI * 2;
                    q[0] += Math.cos(a) * 1.2 * o.speed;
                    q[1] += Math.sin(a) * 1.2 * o.speed;
                    if (q[0] < 0 || q[0] > w || q[1] < 0 || q[1] > h)
                        (q[0] = Math.random() * w), (q[1] = Math.random() * h);
                    ctx.fillRect(q[0], q[1], 1.4, 1.4);
                }
            }
            ctx.globalAlpha = 1;
        },
    }),
    gen('voronoi', 'Drifting Voronoi cells in the palette, with darker borders.', { seeds: 14, cell: 6 }, {
        init: (w, h, o) => ({ s: Array.from({ length: o.seeds }, (_, i) => ({ x: Math.random() * w, y: Math.random() * h, vx: Math.random() - 0.5, vy: Math.random() - 0.5, c: hexRgb(o.colors[i % o.colors.length]) })) }),
        draw: (f) => {
            const { w, h, state, o } = f;
            for (const s of state.s) {
                s.x += s.vx * o.speed;
                s.y += s.vy * o.speed;
                if (s.x < 0 || s.x > w)
                    s.vx *= -1;
                if (s.y < 0 || s.y > h)
                    s.vy *= -1;
            }
            field(f, o.cell, (x, y, d, i) => {
                let b = Infinity;
                let b2 = Infinity;
                let c = state.s[0].c;
                for (const s of state.s) {
                    const dd = (s.x - x) ** 2 + (s.y - y) ** 2;
                    if (dd < b)
                        (b2 = b), (b = dd), (c = s.c);
                    else if (dd < b2)
                        b2 = dd;
                }
                const edge = Math.sqrt(b2) - Math.sqrt(b) < 6 ? 0.55 : 1;
                d[i] = c[0] * edge;
                d[i + 1] = c[1] * edge;
                d[i + 2] = c[2] * edge;
                d[i + 3] = 255;
            });
        },
    }),
    gen('mesh-gradient', 'Soft blobs of colour orbit and blend into a living mesh gradient.', { blobs: 4, blur: 0.65 }, {
        draw: ({ ctx, w, h, t, o }) => {
            ctx.fillStyle = o.background;
            ctx.fillRect(0, 0, w, h);
            const r = Math.max(w, h) * o.blur;
            for (let i = 0; i < o.blobs; i++) {
                const a = t * 0.25 * o.speed + (i * Math.PI * 2) / o.blobs;
                const x = w / 2 + Math.cos(a * (1 + i * 0.13)) * w * 0.32;
                const y = h / 2 + Math.sin(a * (0.8 + i * 0.11)) * h * 0.32;
                const [cr, cg, cb] = hexRgb(o.colors[i % o.colors.length]);
                const g = ctx.createRadialGradient(x, y, 0, x, y, r);
                g.addColorStop(0, `rgba(${cr},${cg},${cb},0.7)`);
                g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
                ctx.fillStyle = g;
                ctx.fillRect(0, 0, w, h);
            }
        },
    }),
    gen('starfield', 'Stars stream toward the viewer (warp speed with `speed: 4`).', { stars: 400, color: '#ffffff' }, {
        init: (_w, _h, o) => ({ s: Array.from({ length: o.stars }, () => [Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random()]) }),
        draw: ({ ctx, w, h, t, state, o, quality }) => {
            ctx.fillStyle = o.background;
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = o.color;
            const n = Math.round(state.s.length * quality);
            for (let i = 0; i < n; i++) {
                const s = state.s[i];
                if (t > 0)
                    s[2] -= 0.004 * o.speed;
                if (s[2] <= 0.01)
                    (s[0] = Math.random() * 2 - 1), (s[1] = Math.random() * 2 - 1), (s[2] = 1);
                const x = w / 2 + (s[0] / s[2]) * w * 0.5;
                const y = h / 2 + (s[1] / s[2]) * h * 0.5;
                if (x < 0 || x > w || y < 0 || y > h)
                    continue;
                const size = (1 - s[2]) * 2.6;
                ctx.globalAlpha = Math.min(1, (1 - s[2]) * 1.6);
                ctx.fillRect(x, y, size, size);
            }
            ctx.globalAlpha = 1;
        },
    }),
    gen('metaballs', 'Gooey blobs that merge and split (low-resolution field, scaled up).', { balls: 6, cell: 5, threshold: 1 }, {
        init: (w, h, o) => ({ b: Array.from({ length: o.balls }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 1.6, vy: (Math.random() - 0.5) * 1.6, r: Math.min(w, h) * (0.08 + Math.random() * 0.08) })) }),
        draw: (f) => {
            const { w, h, state, o } = f;
            for (const b of state.b) {
                b.x += b.vx * o.speed;
                b.y += b.vy * o.speed;
                if (b.x < 0 || b.x > w)
                    b.vx *= -1;
                if (b.y < 0 || b.y > h)
                    b.vy *= -1;
            }
            const [ar, ag, ab] = hexRgb(o.colors[0]);
            const [br, bg, bb] = hexRgb(o.colors[1] || o.colors[0]);
            const [kr, kg, kb] = hexRgb(o.background);
            field(f, o.cell, (x, y, d, i) => {
                let v = 0;
                for (const b of state.b)
                    v += (b.r * b.r) / ((b.x - x) ** 2 + (b.y - y) ** 2 + 1);
                const inside = v >= o.threshold;
                const k = Math.min(1, (v - o.threshold) * 0.8);
                d[i] = inside ? ar + (br - ar) * k : kr;
                d[i + 1] = inside ? ag + (bg - ag) * k : kg;
                d[i + 2] = inside ? ab + (bb - ab) * k : kb;
                d[i + 3] = 255;
            });
        },
    }),
    gen('contours', 'Topographic contour lines over a slowly shifting height field.', { levels: 9, cell: 4, color: '#7c5cff' }, {
        draw: (f) => {
            const { t, o } = f;
            const [lr, lg, lb] = hexRgb(o.color);
            const [kr, kg, kb] = hexRgb(o.background);
            const z = (x, y) => (noise2(x * 0.006, y * 0.006, t * 0.2 * o.speed) + 1) / 2;
            const step = Math.max(2, Math.round(o.cell / f.quality));
            field(f, o.cell, (x, y, d, i) => {
                const a = Math.floor(z(x, y) * o.levels);
                const line = a !== Math.floor(z(x + step, y) * o.levels) || a !== Math.floor(z(x, y + step) * o.levels);
                const shade = 0.12 + (a / o.levels) * 0.18;
                d[i] = line ? lr : kr + (lr - kr) * shade;
                d[i + 1] = line ? lg : kg + (lg - kg) * shade;
                d[i + 2] = line ? lb : kb + (lb - kb) * shade;
                d[i + 3] = 255;
            });
        },
    }),
];

export { GENERATIVE_FX as G, canvasBackground as c, hexRgb as h, noise2 as n };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.0.1/dist/chunks/generative-2LhxG5BJ.js.map