'use strict';

var registry = require('../chunks/registry-BB1oO-lR.cjs');
var generative = require('../chunks/generative-BHIj-NU0.cjs');
require('../chunks/base-B3me2y0o.cjs');
require('../chunks/shared-jkgRH-Hx.cjs');

/** A minimal Verlet world: points, distance sticks, gravity, damping. */
class VerletWorld {
    constructor(gravity = 900, damping = 0.99, iterations = 4) {
        this.gravity = gravity;
        this.damping = damping;
        this.iterations = iterations;
        this.points = [];
        this.sticks = [];
    }
    add(x, y, pinned = false) {
        this.points.push({ x, y, px: x, py: y, pinned });
        return this.points.length - 1;
    }
    link(a, b, len) {
        const p = this.points[a];
        const q = this.points[b];
        this.sticks.push([a, b, len ?? Math.hypot(p.x - q.x, p.y - q.y)]);
    }
    step(dt, bounds) {
        const g = this.gravity * dt * dt;
        for (const p of this.points) {
            if (p.pinned)
                continue;
            const vx = (p.x - p.px) * this.damping;
            const vy = (p.y - p.py) * this.damping;
            p.px = p.x;
            p.py = p.y;
            p.x += vx;
            p.y += vy + g;
        }
        for (let k = 0; k < this.iterations; k++) {
            for (const [a, b, len] of this.sticks) {
                const p = this.points[a];
                const q = this.points[b];
                const dx = q.x - p.x;
                const dy = q.y - p.y;
                const d = Math.hypot(dx, dy) || 1e-6;
                const diff = (d - len) / d / (p.pinned || q.pinned ? 1 : 2);
                if (!p.pinned)
                    (p.x += dx * diff), (p.y += dy * diff);
                if (!q.pinned)
                    (q.x -= dx * diff), (q.y -= dy * diff);
            }
            if (bounds)
                for (const p of this.points)
                    (p.x = Math.min(bounds.w, Math.max(0, p.x))), (p.y = Math.min(bounds.h, Math.max(0, p.y)));
        }
    }
    /** Push points within `r` px of (x, y) by (dx, dy). */
    push(x, y, dx, dy, r = 40) {
        for (const p of this.points)
            if (!p.pinned && Math.hypot(p.x - x, p.y - y) < r)
                (p.x += dx), (p.y += dy);
    }
}
const bg = (name, description, defaults, spec) => ({
    name,
    kind: 'background',
    description,
    reduced: 'run',
    defaults: { speed: 1, quality: 1, ...defaults },
    run: (el, o, ctx) => {
        const stop = generative.canvasBackground(el, ctx, spec(el), o);
        ctx.onCleanup(stop);
        return stop;
    },
});
/** Pointer position relative to `el` plus the movement since the last read. */
function pointer(el) {
    const s = { x: -999, y: -999, dx: 0, dy: 0, down: false, clicks: 0 };
    const move = (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        if (s.x > -999)
            (s.dx += x - s.x), (s.dy += y - s.y);
        s.x = x;
        s.y = y;
    };
    const click = () => s.clicks++;
    const leave = () => (s.x = s.y = -999);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerdown', click);
    el.addEventListener('pointerleave', leave);
    return { s, off: () => (el.removeEventListener('pointermove', move), el.removeEventListener('pointerdown', click), el.removeEventListener('pointerleave', leave)) };
}
const tick = (state, t) => {
    const dt = state.last ? Math.min(1 / 30, t - state.last) : 1 / 60;
    state.last = t;
    return dt;
};
const PHYSICS2_FX = [
    {
        name: 'soft-body',
        kind: 'hover',
        description: 'The element wobbles like jelly: pointer motion pushes a damped spring that squashes and skews it (`stiffness`, `damping`, `amount`).',
        defaults: { stiffness: 220, damping: 9, amount: 1 },
        reduced: 'skip',
        run: (el, o, ctx) => {
            let vx = 0;
            let x = 0;
            let vy = 0;
            let y = 0;
            let raf = 0;
            let lx = NaN;
            let ly = NaN;
            let last = 0;
            const prev = el.style.transform;
            const loop = (now) => {
                const dt = last ? Math.min(0.033, (now - last) / 1000) : 1 / 60;
                last = now;
                vx += (-o.stiffness * x - o.damping * vx) * dt;
                vy += (-o.stiffness * y - o.damping * vy) * dt;
                x += vx * dt;
                y += vy * dt;
                const a = o.amount;
                el.style.transform = `skew(${(x * 0.6 * a).toFixed(2)}deg,${(y * 0.25 * a).toFixed(2)}deg) scale(${(1 + y * 0.004 * a).toFixed(4)},${(1 - y * 0.004 * a).toFixed(4)})`;
                if (Math.abs(x) + Math.abs(vx) + Math.abs(y) + Math.abs(vy) > 0.02)
                    raf = requestAnimationFrame(loop);
                else
                    ((raf = 0), (last = 0), (el.style.transform = prev));
            };
            const move = (e) => {
                if (!Number.isNaN(lx))
                    (vx += Math.max(-60, Math.min(60, (e.clientX - lx) * 4))), (vy += Math.max(-60, Math.min(60, (e.clientY - ly) * 4)));
                lx = e.clientX;
                ly = e.clientY;
                if (!raf && typeof requestAnimationFrame === 'function')
                    raf = requestAnimationFrame(loop);
            };
            const leave = () => (lx = ly = NaN);
            el.addEventListener('pointermove', move);
            el.addEventListener('pointerleave', leave);
            const stop = () => {
                el.removeEventListener('pointermove', move);
                el.removeEventListener('pointerleave', leave);
                if (raf)
                    cancelAnimationFrame(raf);
                el.style.transform = prev;
            };
            ctx.onCleanup(stop);
            return stop;
        },
    },
    {
        name: 'magnet',
        kind: 'hover',
        description: "The element's children are pulled toward the pointer on springs and settle back when it leaves (`strength`, `radius`).",
        defaults: { strength: 0.35, radius: 160 },
        reduced: 'skip',
        run: (el, o, ctx) => {
            const kids = Array.from(el.children);
            const prev = kids.map((k) => k.style.transform);
            kids.forEach((k) => (k.style.transition = 'transform .45s cubic-bezier(.3,1.5,.5,1)'));
            const move = (e) => {
                for (const k of kids) {
                    const r = k.getBoundingClientRect();
                    const dx = e.clientX - (r.left + r.width / 2);
                    const dy = e.clientY - (r.top + r.height / 2);
                    const d = Math.hypot(dx, dy);
                    const f = d < o.radius ? o.strength * (1 - d / o.radius) : 0;
                    k.style.transform = `translate(${(dx * f).toFixed(1)}px,${(dy * f).toFixed(1)}px)`;
                }
            };
            const leave = () => kids.forEach((k, i) => (k.style.transform = prev[i]));
            el.addEventListener('pointermove', move);
            el.addEventListener('pointerleave', leave);
            const stop = () => {
                el.removeEventListener('pointermove', move);
                el.removeEventListener('pointerleave', leave);
                kids.forEach((k, i) => ((k.style.transform = prev[i]), (k.style.transition = '')));
            };
            ctx.onCleanup(stop);
            return stop;
        },
    },
    bg('cloth', 'A cloth hangs from the top edge and ripples when the pointer moves through it (Verlet, Canvas 2D).', { cols: 16, rows: 10, color: '#7c5cff' }, (el) => {
        const p = pointer(el);
        return {
            init: (w, h, o) => {
                const world = new VerletWorld(600, 0.985, 3);
                const sx = (w * 0.86) / (o.cols - 1);
                const sy = (h * 0.75) / (o.rows - 1);
                for (let r = 0; r < o.rows; r++)
                    for (let c = 0; c < o.cols; c++)
                        world.add(w * 0.07 + c * sx, 6 + r * sy, r === 0 && c % 3 === 0);
                for (let r = 0; r < o.rows; r++)
                    for (let c = 0; c < o.cols; c++) {
                        const i = r * o.cols + c;
                        if (c)
                            world.link(i - 1, i);
                        if (r)
                            world.link(i - o.cols, i);
                    }
                return { world, off: p.off };
            },
            draw: ({ ctx, w, h, t, state, o }) => {
                const dt = tick(state, t);
                const world = state.world;
                if (t > 0) {
                    if (p.s.x > -999)
                        world.push(p.s.x, p.s.y, p.s.dx * 0.6, p.s.dy * 0.6, 50);
                    p.s.dx = p.s.dy = 0;
                    world.step(dt * o.speed, { w, h });
                }
                ctx.clearRect(0, 0, w, h);
                for (let r = 0; r < o.rows - 1; r++)
                    for (let c = 0; c < o.cols - 1; c++) {
                        const i = r * o.cols + c;
                        const a = world.points[i];
                        const b = world.points[i + 1];
                        const d = world.points[i + o.cols + 1];
                        const e = world.points[i + o.cols];
                        const shade = 0.55 + 0.45 * Math.max(0, Math.min(1, (b.x - a.x) / ((w * 0.86) / (o.cols - 1))));
                        ctx.globalAlpha = shade;
                        ctx.fillStyle = (r + c) % 2 ? o.color : '#22d3ee';
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.lineTo(d.x, d.y);
                        ctx.lineTo(e.x, e.y);
                        ctx.fill();
                    }
                ctx.globalAlpha = 1;
            },
        };
    }),
    bg('rope', 'A rope with a weight swings from the top; the pointer pushes it (Verlet, Canvas 2D).', { links: 14, color: '#f59e0b' }, (el) => {
        const p = pointer(el);
        return {
            init: (w, h, o) => {
                const world = new VerletWorld(900, 0.995, 6);
                const len = (h * 0.7) / o.links;
                for (let i = 0; i <= o.links; i++)
                    world.add(w / 2 + i * len * 0.6, 4 + i * len * 0.8, i === 0);
                for (let i = 1; i <= o.links; i++)
                    world.link(i - 1, i, len);
                return { world, off: p.off };
            },
            draw: ({ ctx, w, h, t, state, o }) => {
                const dt = tick(state, t);
                const world = state.world;
                if (t > 0) {
                    if (p.s.x > -999)
                        world.push(p.s.x, p.s.y, p.s.dx, p.s.dy, 36);
                    p.s.dx = p.s.dy = 0;
                    world.step(dt * o.speed, { w, h });
                }
                ctx.clearRect(0, 0, w, h);
                ctx.strokeStyle = o.color;
                ctx.lineWidth = 3;
                ctx.lineCap = 'round';
                ctx.beginPath();
                world.points.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)));
                ctx.stroke();
                const end = world.points[world.points.length - 1];
                ctx.fillStyle = o.color;
                ctx.beginPath();
                ctx.arc(end.x, end.y, 11, 0, Math.PI * 2);
                ctx.fill();
            },
        };
    }),
    bg('pinball', 'Balls fall through round bumpers that light up on a hit; click to drop another ball (Canvas 2D).', { balls: 5, bumpers: 7, colors: ['#f43f5e', '#f59e0b', '#22d3ee', '#a3e635'] }, (el) => {
        const p = pointer(el);
        return {
            init: (w, h, o) => {
                const ball = () => ({ x: w * (0.3 + Math.random() * 0.4), y: -10 - Math.random() * h * 0.5, vx: (Math.random() - 0.5) * 80, vy: 0 });
                const bumpers = Array.from({ length: o.bumpers }, (_, i) => ({ x: w * (0.15 + ((i * 0.37) % 0.7)), y: h * (0.25 + ((i * 0.53) % 0.6)), r: Math.min(w, h) * 0.06, hit: 0 }));
                return { balls: Array.from({ length: o.balls }, ball), bumpers, ball, clicks: 0, off: p.off };
            },
            draw: ({ ctx, w, h, t, state, o }) => {
                const dt = tick(state, t) * o.speed;
                if (p.s.clicks !== state.clicks) {
                    state.clicks = p.s.clicks;
                    const b = state.ball();
                    if (p.s.x > -999)
                        b.x = p.s.x;
                    b.y = 0;
                    state.balls.push(b);
                    if (state.balls.length > 24)
                        state.balls.shift();
                }
                ctx.clearRect(0, 0, w, h);
                for (const bu of state.bumpers) {
                    bu.hit = Math.max(0, bu.hit - dt * 2.5);
                    ctx.fillStyle = `rgba(124,92,255,${0.35 + bu.hit * 0.65})`;
                    ctx.shadowColor = '#a78bfa';
                    ctx.shadowBlur = bu.hit * 20;
                    ctx.beginPath();
                    ctx.arc(bu.x, bu.y, bu.r * (1 + bu.hit * 0.15), 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.shadowBlur = 0;
                state.balls.forEach((b, i) => {
                    if (t > 0) {
                        b.vy += 600 * dt;
                        b.x += b.vx * dt;
                        b.y += b.vy * dt;
                        for (const bu of state.bumpers) {
                            const dx = b.x - bu.x;
                            const dy = b.y - bu.y;
                            const d = Math.hypot(dx, dy);
                            if (d < bu.r + 6 && d > 0) {
                                const nx = dx / d;
                                const ny = dy / d;
                                const dot = b.vx * nx + b.vy * ny;
                                b.vx = (b.vx - 2 * dot * nx) * 0.92;
                                b.vy = (b.vy - 2 * dot * ny) * 0.92;
                                b.x = bu.x + nx * (bu.r + 6);
                                b.y = bu.y + ny * (bu.r + 6);
                                bu.hit = 1;
                            }
                        }
                        if (b.x < 6 || b.x > w - 6)
                            (b.vx *= -0.8), (b.x = Math.min(w - 6, Math.max(6, b.x)));
                        if (b.y > h + 12)
                            Object.assign(b, state.ball());
                    }
                    ctx.fillStyle = o.colors[i % o.colors.length];
                    ctx.beginPath();
                    ctx.arc(b.x, b.y, 6, 0, Math.PI * 2);
                    ctx.fill();
                });
            },
        };
    }),
];
/** Register the 6.8 physics 2.0 pack (idempotent). */
function registerPhysicsPack() {
    registry.registerEffects(PHYSICS2_FX);
}

exports.PHYSICS2_FX = PHYSICS2_FX;
exports.VerletWorld = VerletWorld;
exports.registerPhysicsPack = registerPhysicsPack;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.3.0/dist/components/fx-physics.cjs.map