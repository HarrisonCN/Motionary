import { p as prefersReducedMotion, g as applyFrame, e as EASE_SPRING, n as now, r as raf, b as caf, d as defineElement, a as clamp } from '../chunks/base-CuvCgqLy.js';
export { c as configureComponents } from '../chunks/base-CuvCgqLy.js';

const SPRING_PRESETS = {
    default: { stiffness: 170, damping: 26, mass: 1 },
    gentle: { stiffness: 120, damping: 14, mass: 1 },
    wobbly: { stiffness: 180, damping: 12, mass: 1 },
    stiff: { stiffness: 210, damping: 20, mass: 1 },
    bouncy: { stiffness: 300, damping: 10, mass: 1 },
    slow: { stiffness: 280, damping: 60, mass: 1 },
    molasses: { stiffness: 280, damping: 120, mass: 1 },
};
/** Resolve a preset name or a partial config to a full config. */
function resolveSpring(input) {
    const base = typeof input === 'string' ? SPRING_PRESETS[input] || SPRING_PRESETS.default : { ...SPRING_PRESETS.default, ...(input || {}) };
    const pos = (v, d) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : d);
    const o = (typeof input === 'object' && input) || {};
    return {
        stiffness: pos(base.stiffness, 170),
        damping: Math.max(0, Number.isFinite(base.damping) ? base.damping : 26),
        mass: pos(base.mass, 1),
        velocity: Number.isFinite(o.velocity) ? o.velocity : 0,
        precision: pos(o.precision, 0.001),
    };
}
/** One integration step (semi-implicit Euler) towards `to`. Returns [x, v]. */
function stepSpring(cfg, x, v, to, dt) {
    const a = (-cfg.stiffness * (x - to) - cfg.damping * v) / cfg.mass;
    const nv = v + a * dt;
    return [x + nv * dt, nv];
}
const cache = new Map();
/**
 * Sample the spring from 0 to 1 at `fps` (default 60). `values` may exceed 1
 * (overshoot); `duration` is the time to rest, in ms (max 10 s).
 */
function springSamples(input, fps = 60) {
    const cfg = resolveSpring(input);
    const key = `${cfg.stiffness}|${cfg.damping}|${cfg.mass}|${cfg.velocity}|${cfg.precision}|${fps}`;
    const hit = cache.get(key);
    if (hit)
        return hit;
    const values = [0];
    let x = 0;
    let v = cfg.velocity;
    const frame = 1000 / fps;
    let t = 0;
    let next = frame;
    while (t < 10000) {
        [x, v] = stepSpring(cfg, x, v, 1, 0.001);
        t += 1;
        if (t >= next) {
            values.push(x);
            next += frame;
            if (Math.abs(1 - x) < cfg.precision && Math.abs(v) < cfg.precision * 10)
                break;
        }
    }
    values[values.length - 1] = 1;
    const out = { values, duration: Math.round(t) };
    if (cache.size > 64)
        cache.clear();
    cache.set(key, out);
    return out;
}
/** `true` when CSS `linear()` easing is supported. */
function supportsLinearEasing() {
    return typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('animation-timing-function', 'linear(0, 1)');
}
/**
 * The spring as `{ easing, duration }` for `el.animate()` / CSS. `easing` is
 * a `linear(…)` function with at most `points` stops (default 48), or a
 * cubic-bezier overshoot where `linear()` is unsupported.
 */
function springEasing(input, points = 48) {
    const { values, duration } = springSamples(input);
    if (!supportsLinearEasing())
        return { easing: EASE_SPRING, duration: Math.min(duration, 1200) };
    return { easing: linearEasing(values, points), duration };
}
/** Build a CSS `linear()` easing from samples (down-sampled to `points`). */
function linearEasing(values, points = 48) {
    const n = values.length;
    const step = Math.max(1, Math.ceil((n - 1) / Math.max(2, points - 1)));
    const out = [];
    for (let i = 0; i < n - 1; i += step)
        out.push(String(Math.round(values[i] * 1000) / 1000));
    out.push('1');
    return `linear(${out.join(', ')})`;
}
/**
 * Animate `el` between keyframes with spring timing (WAAPI). Under reduced
 * motion the final frame is applied immediately. Returns the Animation (or
 * `null` without WAAPI / under reduced motion).
 */
function spring(el, keyframes, input, options = {}) {
    const target = el;
    if (prefersReducedMotion() || typeof target.animate !== 'function') {
        applyFrame(target, keyframes[keyframes.length - 1]);
        return null;
    }
    const { easing, duration } = springEasing(input);
    return target.animate(keyframes, { duration, easing, fill: 'both', ...options });
}
/**
 * An interruptible spring-animated number: call `set()` as often as you like,
 * the motion keeps its velocity (like iOS / Framer springs). Reduced motion
 * jumps straight to the target.
 */
function createSpring(opts = {}) {
    let cfg = resolveSpring(opts.spring);
    let x = opts.value ?? 0;
    let v = 0;
    let to = x;
    let id = 0;
    let last = 0;
    let running = false;
    const stop = () => {
        if (running)
            caf(id);
        running = false;
    };
    const loop = () => {
        const t = now();
        let dt = Math.min(64, Math.max(1, t - last));
        last = t;
        while (dt > 0) {
            const s = Math.min(dt, 4);
            [x, v] = stepSpring(cfg, x, v, to, s / 1000);
            dt -= s;
        }
        const scale = Math.max(1, Math.abs(to) * 0.0005);
        if (Math.abs(to - x) < cfg.precision * scale * 10 && Math.abs(v) < cfg.precision * scale * 100) {
            x = to;
            v = 0;
            running = false;
            opts.onUpdate?.(x, 0);
            opts.onRest?.(x);
            return;
        }
        opts.onUpdate?.(x, v);
        id = raf(loop);
    };
    const api = {
        get value() {
            return x;
        },
        get velocity() {
            return v;
        },
        get target() {
            return to;
        },
        get animating() {
            return running;
        },
        set(target, velocity) {
            to = target;
            if (velocity !== undefined && Number.isFinite(velocity))
                v = velocity;
            if (prefersReducedMotion()) {
                api.jump(target);
                opts.onRest?.(target);
                return;
            }
            if (!running) {
                running = true;
                last = now();
                id = raf(loop);
            }
        },
        jump(value) {
            stop();
            x = to = value;
            v = 0;
            opts.onUpdate?.(x, 0);
        },
        stop() {
            stop();
            v = 0;
            to = x;
        },
        configure(input) {
            cfg = resolveSpring(input);
        },
    };
    return api;
}
/* ------------------------------------------------------------------ */
/* Inertia + snapping                                                  */
/* ------------------------------------------------------------------ */
/**
 * Where a flick at `velocity` (units/s) comes to rest with exponential
 * decay: `value + velocity · timeConstant` (default 0.325 s, iOS-like).
 */
function projectInertia(value, velocity, timeConstant = 0.325) {
    return value + velocity * timeConstant;
}
/** Snap to a grid (`number`) or the nearest of a list of points. */
function snapTo(value, to) {
    if (Array.isArray(to)) {
        if (!to.length)
            return value;
        return to.reduce((best, p) => (Math.abs(p - value) < Math.abs(best - value) ? p : best), to[0]);
    }
    if (typeof to === 'number' && to > 0)
        return Math.round(value / to) * to;
    return value;
}
/** iOS-style rubber-band resistance: how far content moves when pulled `distance` past an edge. */
function rubberBand(distance, dimension, constant = 0.55) {
    if (dimension <= 0)
        return 0;
    const sign = distance < 0 ? -1 : 1;
    const d = Math.abs(distance);
    return sign * (1 - 1 / ((d * constant) / dimension + 1)) * dimension;
}

var css$2 = "usa-spring{display:inline-block;transform-origin:50% 70%}usa-spring[block]{display:block}usa-spring[effect=\"drop\"]{transform-origin:50% 100%}usa-spring[data-state=\"hidden\"]{opacity:0}usa-spring[trigger=\"click\"],usa-spring[trigger=\"hover\"]{cursor:pointer;-webkit-tap-highlight-color:transparent}";

const SPRING_EFFECTS = ['bounce-in', 'pop', 'drop', 'jelly', 'rubber-band'];
/** Entrance effects start hidden; attention effects (jelly, rubber-band) play on visible content. */
const ENTRANCE = new Set(['bounce-in', 'pop', 'drop']);
/** Keyframes of a spring effect (entrances use spring timing, attention effects fixed frames). */
function springEffectKeyframes(effect, reduced = false) {
    if (reduced)
        return ENTRANCE.has(effect) ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 1 }];
    switch (effect) {
        case 'pop':
            return [{ opacity: 0, transform: 'scale(0.5)' }, { opacity: 1, transform: 'scale(1)' }];
        case 'drop':
            return [{ opacity: 0, transform: 'translate3d(0, -120%, 0)' }, { opacity: 1, transform: 'translate3d(0, 0, 0)' }];
        case 'jelly':
            return [
                { transform: 'scale3d(1, 1, 1)' },
                { transform: 'scale3d(1.25, 0.75, 1)', offset: 0.3 },
                { transform: 'scale3d(0.75, 1.25, 1)', offset: 0.4 },
                { transform: 'scale3d(1.15, 0.85, 1)', offset: 0.5 },
                { transform: 'scale3d(0.95, 1.05, 1)', offset: 0.65 },
                { transform: 'scale3d(1.05, 0.95, 1)', offset: 0.75 },
                { transform: 'scale3d(1, 1, 1)' },
            ];
        case 'rubber-band':
            return [
                { transform: 'scale3d(1, 1, 1)' },
                { transform: 'scale3d(1.3, 0.7, 1)', offset: 0.3 },
                { transform: 'scale3d(0.8, 1.2, 1)', offset: 0.45 },
                { transform: 'scale3d(1.1, 0.9, 1)', offset: 0.6 },
                { transform: 'scale3d(0.97, 1.03, 1)', offset: 0.8 },
                { transform: 'scale3d(1, 1, 1)' },
            ];
        default:
            return [{ opacity: 0, transform: 'scale(0.3)' }, { opacity: 1, transform: 'scale(1)' }];
    }
}
const DEFAULT_PRESET = { 'bounce-in': 'bouncy', pop: 'wobbly', drop: 'bouncy' };
function defineSpring(tag = 'usa-spring') {
    return defineElement(tag, (Base) => class UsaSpring extends Base {
        constructor() {
            super(...arguments);
            this._anim = null;
        }
        static get observedAttributes() {
            return ['effect', 'trigger', 'repeat'];
        }
        get effect() {
            return this.str('effect', 'bounce-in');
        }
        set effect(v) {
            this.setAttribute('effect', v);
        }
        config() {
            if (this.hasAttribute('stiffness') || this.hasAttribute('damping') || this.hasAttribute('mass'))
                return { stiffness: this.num('stiffness', 170), damping: this.num('damping', 26), mass: this.num('mass', 1) };
            return this.str('preset', DEFAULT_PRESET[this.effect] || 'wobbly');
        }
        mount() {
            const trigger = this.str('trigger', 'view');
            const entrance = ENTRANCE.has(this.effect);
            if (trigger === 'view') {
                if (entrance)
                    this.setAttribute('data-state', 'hidden');
                this.inView((visible) => {
                    if (visible)
                        this.play();
                    else if (this.flag('repeat') && entrance)
                        this.reset();
                }, { threshold: 0.15 });
            }
            else {
                if (trigger === 'hover')
                    this.listen(this, 'pointerenter', () => this.play());
                if (trigger === 'click') {
                    this.listen(this, 'click', () => this.play());
                    this.listen(this, 'keydown', (e) => (e.key === 'Enter' || e.key === ' ') && !e.repeat && this.play());
                }
            }
        }
        unmount() {
            this._anim?.cancel();
            this._anim = null;
        }
        reset() {
            this._anim?.cancel();
            this._anim = null;
            if (ENTRANCE.has(this.effect))
                this.setAttribute('data-state', 'hidden');
        }
        async play() {
            const effect = this.effect;
            const reduced = this.reduced;
            this._anim?.cancel();
            this.setAttribute('data-state', 'playing');
            const frames = springEffectKeyframes(effect, reduced);
            const timing = ENTRANCE.has(effect) && !reduced
                ? springEasing(this.config())
                : { duration: reduced ? 250 : this.num('duration', 900), easing: 'ease-out' };
            const a = this.motion(this, frames, { ...timing, delay: this.num('delay', 0), fill: 'backwards' });
            this._anim = a;
            if (a) {
                try {
                    await a.finished;
                }
                catch {
                    return;
                }
                if (this._anim !== a)
                    return;
            }
            this._anim = null;
            this.setAttribute('data-state', 'done');
            this.emit('complete', { effect });
        }
    }, { id: 'spring', text: css$2 });
}

var css$1 = "usa-draggable{display:inline-block;touch-action:none;user-select:none;-webkit-user-select:none;cursor:grab;will-change:transform;-webkit-tap-highlight-color:transparent}usa-draggable[axis=\"x\"]{touch-action:pan-y}usa-draggable[axis=\"y\"]{touch-action:pan-x}usa-draggable[block]{display:block}usa-draggable[data-dragging]{cursor:grabbing}usa-draggable[disabled]{cursor:default}usa-draggable:focus-visible{outline:2px solid var(--usa-accent,#7c5cff);outline-offset:3px}";

const parseSnap = (s) => {
    if (!s.trim())
        return null;
    const parts = s.split(',').map((p) => Number(p.trim())).filter((n) => Number.isFinite(n));
    if (!parts.length)
        return null;
    return s.includes(',') ? parts : parts[0];
};
function defineDraggable(tag = 'usa-draggable') {
    return defineElement(tag, (Base) => class UsaDraggable extends Base {
        constructor() {
            super(...arguments);
            this._x = 0;
            this._y = 0;
            this._drag = null;
        }
        static get observedAttributes() {
            return ['axis', 'disabled', 'preset'];
        }
        get x() {
            return this._x;
        }
        get y() {
            return this._y;
        }
        get dragging() {
            return !!this._drag;
        }
        render() {
            this.style.transform = `translate3d(${this._x}px, ${this._y}px, 0)`;
            this.style.setProperty('--usa-drag-x', `${this._x}px`);
            this.style.setProperty('--usa-drag-y', `${this._y}px`);
        }
        axis() {
            return this.str('axis', 'both');
        }
        /** Bounds relative to the origin, from the parent box. */
        limits() {
            if (this.str('bounds') !== 'parent' || !this.parentElement)
                return null;
            const p = this.parentElement.getBoundingClientRect();
            const r = this.getBoundingClientRect();
            const ox = r.left - this._x;
            const oy = r.top - this._y;
            return { minX: p.left - ox, maxX: p.right - ox - r.width, minY: p.top - oy, maxY: p.bottom - oy - r.height };
        }
        mount() {
            let settled = 0;
            const rest = () => {
                if (++settled >= 2) {
                    settled = 0;
                    this.removeAttribute('data-moving');
                    this.emit('settle', { x: this._x, y: this._y });
                }
            };
            const spring = this.str('preset', 'wobbly');
            this._sx = createSpring({ value: this._x, spring, onUpdate: (v) => ((this._x = v), this.render()), onRest: rest });
            this._sy = createSpring({ value: this._y, spring, onUpdate: (v) => ((this._y = v), this.render()), onRest: rest });
            if (!this.hasAttribute('tabindex'))
                this.tabIndex = 0;
            this.setAttribute('aria-roledescription', 'draggable');
            this.listen(this, 'pointerdown', (e) => this.start(e));
            this.listen(this, 'pointermove', (e) => this.move(e));
            this.listen(this, 'pointerup', (e) => this.end(e));
            this.listen(this, 'pointercancel', (e) => this.end(e));
            this.listen(this, 'keydown', (e) => this.key(e));
            this.render();
        }
        unmount() {
            this._sx?.stop();
            this._sy?.stop();
            this._drag = null;
        }
        start(e) {
            if (this.flag('disabled') || (e.pointerType === 'mouse' && e.button !== 0))
                return;
            this._sx.stop();
            this._sy.stop();
            this._drag = { id: e.pointerId, px: e.clientX, py: e.clientY, ox: this._x, oy: this._y, samples: [[e.clientX, e.clientY, typeof e.timeStamp === 'number' ? e.timeStamp : Date.now()]] };
            try {
                this.setPointerCapture?.(e.pointerId);
            }
            catch {
                /* synthetic events */
            }
            this.setAttribute('data-dragging', '');
            this.emit('drag-start', { x: this._x, y: this._y });
        }
        move(e) {
            const d = this._drag;
            if (!d || e.pointerId !== d.id)
                return;
            const axis = this.axis();
            let x = axis === 'y' ? d.ox : d.ox + e.clientX - d.px;
            let y = axis === 'x' ? d.oy : d.oy + e.clientY - d.py;
            const b = this.limits();
            if (b) {
                const band = (v, lo, hi, dim) => (v < lo ? lo + rubberBand(v - lo, dim) : v > hi ? hi + rubberBand(v - hi, dim) : v);
                x = band(x, b.minX, b.maxX, 200);
                y = band(y, b.minY, b.maxY, 200);
            }
            this._x = x;
            this._y = y;
            d.samples.push([e.clientX, e.clientY, typeof e.timeStamp === 'number' ? e.timeStamp : Date.now()]);
            if (d.samples.length > 6)
                d.samples.shift();
            this.render();
            this.emit('drag', { x, y });
        }
        velocity() {
            const s = this._drag?.samples || [];
            if (s.length < 2)
                return [0, 0];
            const a = s[0];
            const b = s[s.length - 1];
            const dt = (b[2] - a[2]) / 1000;
            if (dt <= 0 || dt > 0.3)
                return [0, 0];
            return [(b[0] - a[0]) / dt, (b[1] - a[1]) / dt];
        }
        end(e) {
            const d = this._drag;
            if (!d || e.pointerId !== d.id)
                return;
            let [vx, vy] = this.velocity();
            const axis = this.axis();
            if (axis === 'y')
                vx = 0;
            if (axis === 'x')
                vy = 0;
            this._drag = null;
            this.removeAttribute('data-dragging');
            let tx = this._x;
            let ty = this._y;
            if (this.flag('spring-back')) {
                tx = 0;
                ty = 0;
            }
            else {
                if (this.flag('inertia') && !this.reduced) {
                    tx = projectInertia(tx, vx);
                    ty = projectInertia(ty, vy);
                }
                [tx, ty] = this.constrain(tx, ty);
            }
            this.emit('drag-end', { x: tx, y: ty, vx, vy });
            this.go(tx, ty, vx, vy);
        }
        constrain(x, y) {
            const snap = parseSnap(this.str('snap'));
            let tx = snapTo(x, snap);
            let ty = snapTo(y, snap);
            const b = this.limits();
            if (b) {
                tx = clamp(tx, b.minX, Math.max(b.minX, b.maxX));
                ty = clamp(ty, b.minY, Math.max(b.minY, b.maxY));
            }
            const axis = this.axis();
            return [axis === 'y' ? 0 : tx, axis === 'x' ? 0 : ty];
        }
        go(x, y, vx = 0, vy = 0) {
            this.setAttribute('data-moving', '');
            this._sx.set(x, vx);
            this._sy.set(y, vy);
        }
        key(e) {
            if (this.flag('disabled'))
                return;
            const step = this.num('step', 16);
            const snap = parseSnap(this.str('snap'));
            const s = typeof snap === 'number' ? snap : step;
            const map = { ArrowLeft: [-s, 0], ArrowRight: [s, 0], ArrowUp: [0, -s], ArrowDown: [0, s] };
            if (e.key === 'Home' || e.key === 'Escape') {
                e.preventDefault();
                this.reset();
                return;
            }
            const m = map[e.key];
            if (!m)
                return;
            e.preventDefault();
            const [tx, ty] = this.flag('spring-back') ? [this._sx.target + m[0], this._sy.target + m[1]] : this.constrain(this._sx.target + m[0], this._sy.target + m[1]);
            this.go(tx, ty);
        }
        moveTo(x, y, animate = true) {
            if (!animate) {
                this._sx.jump(x);
                this._sy.jump(y);
                return;
            }
            this.go(x, y);
        }
        reset() {
            this.go(0, 0);
        }
    }, { id: 'draggable', text: css$1 });
}

var css = "usa-overscroll{display:block;overflow:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}usa-overscroll[axis=\"x\"]{overflow-y:hidden}usa-overscroll>*{transform:translate3d(0,var(--usa-overscroll,0px),0)}usa-overscroll[axis=\"x\"]>*{transform:translate3d(var(--usa-overscroll,0px),0,0)}usa-overscroll[data-stretched]>*{will-change:transform}";

function defineOverscroll(tag = 'usa-overscroll') {
    return defineElement(tag, (Base) => class UsaOverscroll extends Base {
        constructor() {
            super(...arguments);
            this._off = 0;
        }
        static get observedAttributes() {
            return ['axis', 'disabled'];
        }
        get offset() {
            return this._off;
        }
        set(v) {
            this._off = v;
            this.style.setProperty('--usa-overscroll', `${v}px`);
            this.toggleAttribute('data-stretched', Math.abs(v) > 0.5);
        }
        edge(delta) {
            const x = this.str('axis', 'y') === 'x';
            const pos = x ? this.scrollLeft : this.scrollTop;
            const max = (x ? this.scrollWidth - this.clientWidth : this.scrollHeight - this.clientHeight) - 1;
            return (delta < 0 && pos <= 0) || (delta > 0 && pos >= max);
        }
        stretch(raw) {
            const max = this.num('max', 120);
            this.set(Math.max(-max, Math.min(max, rubberBand(raw, max * 2.5))));
        }
        mount() {
            this._spring = createSpring({ spring: this.str('preset', 'default'), onUpdate: (v) => this.set(v) });
            const x = this.str('axis', 'y') === 'x';
            const off = () => this.flag('disabled') || this.reduced;
            // Wheel / trackpad: accumulate past the edge, spring back when it stops.
            let pull = 0;
            let timer;
            this.listen(this, 'wheel', (e) => {
                const d = x ? e.deltaX || e.deltaY : e.deltaY;
                if (off() || !d || !this.edge(d))
                    return;
                this._spring.stop();
                pull -= d;
                this.stretch(pull);
                clearTimeout(timer);
                timer = setTimeout(() => {
                    pull = 0;
                    this._spring.jump(this._off);
                    this._spring.set(0);
                }, 140);
            }, { passive: true });
            this.onCleanup(() => clearTimeout(timer));
            // Touch: rubber-band while the finger pulls past the edge.
            let start = 0;
            let active = false;
            this.listen(this, 'touchstart', (e) => {
                if (off())
                    return;
                const t = e.touches[0];
                start = x ? t.clientX : t.clientY;
                active = false;
                this._spring.stop();
            }, { passive: true });
            this.listen(this, 'touchmove', (e) => {
                if (off())
                    return;
                const t = e.touches[0];
                const dist = (x ? t.clientX : t.clientY) - start;
                if (!active && dist !== 0 && this.edge(-dist))
                    active = true;
                if (!active)
                    return;
                if (e.cancelable)
                    e.preventDefault();
                this.stretch(dist);
            }, { passive: false });
            const release = () => {
                if (!active)
                    return;
                active = false;
                this._spring.jump(this._off);
                this._spring.set(0);
            };
            this.listen(this, 'touchend', release);
            this.listen(this, 'touchcancel', release);
        }
        unmount() {
            this._spring?.stop();
            this.set(0);
        }
    }, { id: 'overscroll', text: css });
}

/**
 * use-scroll-animate/components/physics — spring & bounce physics (v2.3).
 * `<usa-spring>` (bounce-in, pop, drop, jelly, rubber-band), `<usa-draggable>`
 * (spring-back, inertia, snap) and `<usa-overscroll>` (elastic edges), plus
 * the spring core: `spring()`, `springEasing()`, `createSpring()`,
 * `SPRING_PRESETS`, `projectInertia()`, `snapTo()`, `rubberBand()`.
 */
/** Register every component of this category under its default tag. */
function definePhysicsComponents() {
    defineSpring();
    defineDraggable();
    defineOverscroll();
}

export { SPRING_EFFECTS, SPRING_PRESETS, createSpring, defineDraggable, defineOverscroll, definePhysicsComponents, defineSpring, linearEasing, prefersReducedMotion, projectInertia, resolveSpring, rubberBand, snapTo, spring, springEasing, springEffectKeyframes, springSamples, stepSpring, supportsLinearEasing };
//# sourceMappingURL=physics.js.map
