'use strict';

var base = require('./base-B3me2y0o.cjs');
var runtimeLink = require('./runtime-link-Bne5p2tj.cjs');

var css = "usa-physics-playground{position:relative;display:block;aspect-ratio:5/3;min-height:140px;background:radial-gradient(circle at 50% 0,#1e293b,#0f172a);border-radius:12px;overflow:hidden;touch-action:none}usa-physics-playground>canvas{display:block;width:100%;height:100%;cursor:grab;outline:none}usa-physics-playground>canvas:active{cursor:grabbing}usa-physics-playground>canvas:focus-visible{box-shadow:inset 0 0 0 2px #818cf8}usa-physics-playground>script{display:none}";

const PALETTE = ['#818cf8', '#f472b6', '#34d399', '#fbbf24', '#38bdf8', '#fb7185'];
const W = 600, H = 360;
/** The built-in scenes (motionary-scene@1). */
const PHYSICS_PRESETS = {
    balls: () => ({
        format: 'motionary-scene@1',
        world: { width: W, height: H, gravity: [0, 980], walls: true },
        materials: { rubber: { restitution: 0.75, friction: 0.3 } },
        bodies: Array.from({ length: 14 }, (_, i) => ({ id: `ball-${i}`, shape: 'circle', radius: 14 + ((i * 7) % 13), position: [60 + ((i * 83) % 480), 40 + (i % 4) * 30], material: 'rubber', style: { fill: PALETTE[i % PALETTE.length] } })),
    }),
    pyramid: () => {
        const bodies = [];
        const s = 34;
        for (let row = 0; row < 6; row++)
            for (let i = 0; i <= row; i++)
                bodies.push({ id: `box-${row}-${i}`, shape: 'box', size: [s, s], position: [W / 2 + (i - row / 2) * (s + 1), H - 12 - (6 - row) * s + s / 2], style: { fill: PALETTE[row % PALETTE.length] } });
        bodies.push({ id: 'ball', shape: 'circle', radius: 18, position: [80, 60], velocity: [420, 0], restitution: 0.4, density: 0.004, style: { fill: '#f8fafc' } });
        return { format: 'motionary-scene@1', world: { width: W, height: H, gravity: [0, 980], walls: true }, bodies };
    },
    pendulum: () => ({
        format: 'motionary-scene@1',
        world: { width: W, height: H, gravity: [0, 980], walls: true },
        bodies: [0, 1, 2, 3, 4].map((i) => ({ id: `bob-${i}`, shape: 'circle', radius: 20, position: [i === 0 ? 120 : 220 + i * 41, i === 0 ? 120 : 250], restitution: 0.95, friction: 0, style: { fill: PALETTE[i] } })),
        constraints: [0, 1, 2, 3, 4].map((i) => ({ type: 'pin', a: `bob-${i}`, point: [220 + i * 41, 40], length: i === 0 ? Math.hypot(220 - 120, 40 - 120) : 210, stiffness: 1 })),
    }),
    dominoes: () => ({
        format: 'motionary-scene@1',
        world: { width: W, height: H, gravity: [0, 980], walls: true },
        bodies: [
            ...Array.from({ length: 9 }, (_, i) => ({ id: `domino-${i}`, shape: 'box', size: [10, 70], position: [150 + i * 44, H - 35], friction: 0.6, style: { fill: PALETTE[i % PALETTE.length] } })),
            { id: 'ramp', shape: 'polygon', vertices: [[0, 0], [110, 70], [0, 70]], position: [40, H - 35], static: true, style: { fill: '#475569' } },
            { id: 'ball', shape: 'circle', radius: 14, position: [30, 40], density: 0.003, style: { fill: '#f8fafc' } },
        ],
    }),
};
function definePhysicsPlayground(tag = 'usa-physics-playground') {
    return base.defineElement(tag, (Base) => {
        class UsaPhysicsPlayground extends Base {
            constructor() {
                super(...arguments);
                this.w = null;
                this.byId = {};
                this.sc = null;
                this.running = true;
                this.redraw = null;
                this.rebuild = null;
            }
            static get observedAttributes() {
                return ['preset', 'src', 'gravity', 'spawn', 'label'];
            }
            get world() {
                return this.w;
            }
            get bodies() {
                return this.byId;
            }
            get scene() {
                return this.sc;
            }
            reset() {
                this.rebuild?.();
            }
            play() {
                this.running = true;
                this.removeAttribute('paused');
            }
            pause() {
                this.running = false;
                this.setAttribute('paused', '');
            }
            toScene() {
                const F = runtimeLink.runtimeModule(this, 'format-scene');
                if (!F || !this.w || !this.sc)
                    return null;
                return F.worldToScene(this.w, { width: this.sc.world.width, height: this.sc.world.height, walls: !!this.sc.world.walls });
            }
            mount() {
                const P = runtimeLink.runtimeModule(this, 'physics');
                const F = P && runtimeLink.runtimeModule(this, 'format-scene');
                if (!P || !F)
                    return;
                this.running = !this.flag('paused');
                const canvas = document.createElement('canvas');
                canvas.setAttribute('role', 'img');
                canvas.setAttribute('aria-label', this.str('label', 'Physics playground'));
                canvas.tabIndex = 0;
                this.querySelector(':scope > canvas')?.remove();
                this.prepend(canvas);
                this.onCleanup(() => canvas.remove());
                const ctx = canvas.getContext('2d');
                let alive = true;
                this.onCleanup(() => (alive = false));
                let view = { s: 1, ox: 0, oy: 0 };
                let last = null;
                let drag = null;
                const draw = () => {
                    if (!ctx || !this.w || !this.sc)
                        return;
                    const dpr = Math.min(2, (typeof devicePixelRatio === 'number' && devicePixelRatio) || 1);
                    const cw = Math.max(1, Math.round((canvas.clientWidth || W) * dpr)), ch = Math.max(1, Math.round((canvas.clientHeight || H) * dpr));
                    if (canvas.width !== cw || canvas.height !== ch)
                        Object.assign(canvas, { width: cw, height: ch });
                    const { width, height } = this.sc.world;
                    const s = Math.min(cw / width, ch / height);
                    view = { s: s / dpr, ox: (cw - width * s) / 2 / dpr, oy: (ch - height * s) / 2 / dpr };
                    ctx.setTransform(1, 0, 0, 1, 0, 0);
                    ctx.clearRect(0, 0, cw, ch);
                    ctx.setTransform(s, 0, 0, s, (cw - width * s) / 2, (ch - height * s) / 2);
                    for (const b of this.w.bodies) {
                        const st = b.data?.style || {};
                        if (!b.data?.id)
                            continue; // walls from bounds()
                        ctx.fillStyle = st.fill || (b.type === 'static' ? '#475569' : PALETTE[b.id % PALETTE.length]);
                        ctx.globalAlpha = b.sleeping ? 0.85 : 1;
                        ctx.beginPath();
                        if (b.shape === 'circle') {
                            ctx.arc(b.position.x, b.position.y, b.radius, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.strokeStyle = 'rgba(15,23,42,.55)';
                            ctx.lineWidth = 2;
                            ctx.beginPath();
                            ctx.moveTo(b.position.x, b.position.y);
                            ctx.lineTo(b.position.x + Math.cos(b.angle) * b.radius, b.position.y + Math.sin(b.angle) * b.radius);
                            ctx.stroke();
                        }
                        else {
                            const vs = b.worldVerts();
                            vs.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
                            ctx.closePath();
                            ctx.fill();
                        }
                    }
                    ctx.globalAlpha = 1;
                    ctx.strokeStyle = 'rgba(148,163,184,.6)';
                    ctx.lineWidth = 1.5;
                    for (const c of this.w.constraints) {
                        const a = c.worldA(), b = c.worldB();
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                };
                this.redraw = draw;
                const build = (json) => {
                    try {
                        const g = this.str('gravity');
                        const sceneJson = JSON.parse(JSON.stringify(json));
                        if (g && sceneJson?.world)
                            sceneJson.world.gravity = [0, Number(g)];
                        const r = F.sceneToWorld(sceneJson);
                        this.w = r.world;
                        this.byId = r.bodies;
                        this.sc = r.scene;
                        let seen = '';
                        r.world.onCollision((m) => {
                            if (m.a.type !== 'dynamic' || m.b.type !== 'dynamic' || m.a.sensor || m.b.sensor)
                                return;
                            const k = String(r.world.steps);
                            if (seen === k)
                                return;
                            seen = k;
                            this.emit('collision', { a: m.a.data?.id, b: m.b.data?.id });
                        });
                        if (this.reduced)
                            for (let i = 0; i < 240; i++)
                                r.world.step();
                        draw();
                        this.emit('load', { bodies: Object.keys(r.bodies).length, format: r.scene.format });
                    }
                    catch (e) {
                        this.emit('error', { error: String(e?.message || e) });
                    }
                };
                const load = () => {
                    const inline = this.querySelector(':scope > script[type="application/json"]');
                    const src = this.str('src');
                    if (inline)
                        return build(JSON.parse(inline.textContent || '{}'));
                    if (src) {
                        fetch(new URL(src, location.href).href)
                            .then((r) => r.json())
                            .then((j) => alive && build(j))
                            .catch((e) => this.emit('error', { error: String(e?.message || e) }));
                        return;
                    }
                    build((PHYSICS_PRESETS[this.str('preset', 'balls')] || PHYSICS_PRESETS.balls)());
                };
                this.rebuild = load;
                load();
                const toWorld = (e) => {
                    const r = canvas.getBoundingClientRect();
                    return [(e.clientX - r.left - view.ox) / view.s, (e.clientY - r.top - view.oy) / view.s];
                };
                this.listen(canvas, 'pointerdown', (e) => {
                    if (!this.w)
                        return;
                    const [x, y] = toWorld(e);
                    const hit = this.w.query(x, y).find((b) => b.type === 'dynamic');
                    if (hit) {
                        last = hit;
                        drag = P.dragConstraint(this.w, hit, x, y);
                        canvas.setPointerCapture?.(e.pointerId);
                    }
                    else if (this.flag('spawn')) {
                        const n = Object.keys(this.byId).length;
                        const id = `spawn-${n}`;
                        this.byId[id] = this.w.body({ shape: n % 2 ? 'box' : 'circle', x, y, radius: 16, width: 30, height: 30, restitution: 0.4, data: { id, style: { fill: PALETTE[n % PALETTE.length] } }, label: id });
                        last = this.byId[id];
                        if (this.reduced)
                            draw();
                    }
                });
                this.listen(canvas, 'pointermove', (e) => {
                    if (!drag)
                        return;
                    const [x, y] = toWorld(e);
                    drag.move(x, y);
                    if (this.reduced && this.w) {
                        for (let i = 0; i < 4; i++)
                            this.w.step();
                        draw();
                    }
                });
                const up = () => {
                    drag?.release();
                    drag = null;
                };
                this.listen(canvas, 'pointerup', up);
                this.listen(canvas, 'pointercancel', up);
                this.listen(canvas, 'keydown', (e) => {
                    const b = last || Object.values(this.byId).find((x) => x.type === 'dynamic');
                    const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
                    if (!b || !d[e.key])
                        return;
                    e.preventDefault();
                    b.applyImpulse({ x: d[e.key][0] * 200 * b.mass, y: d[e.key][1] * 300 * b.mass });
                    b.wake();
                    if (this.reduced && this.w) {
                        for (let i = 0; i < 30; i++)
                            this.w.step();
                        draw();
                    }
                });
                let visible = true;
                this.inView((v) => (visible = v));
                if (this.reduced)
                    return;
                let prev = 0;
                const loop = (now) => {
                    if (!alive)
                        return;
                    requestAnimationFrame(loop);
                    const dt = prev ? Math.min(0.05, (now - prev) / 1000) : 1 / 60;
                    prev = now;
                    if (!visible || !this.w)
                        return;
                    if (this.running)
                        this.w.update(dt);
                    draw();
                };
                requestAnimationFrame(loop);
            }
        }
        return UsaPhysicsPlayground;
    }, { id: 'physics-playground', text: css });
}

exports.PHYSICS_PRESETS = PHYSICS_PRESETS;
exports.definePhysicsPlayground = definePhysicsPlayground;
//# sourceMappingURL=physics-playground-YVxNGnUK.cjs.map
