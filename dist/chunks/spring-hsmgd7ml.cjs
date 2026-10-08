'use strict';

var base = require('./base-DE2yzxE7.cjs');

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
        return { easing: base.EASE_SPRING, duration: Math.min(duration, 1200) };
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
    if (base.prefersReducedMotion() || typeof target.animate !== 'function') {
        base.applyFrame(target, keyframes[keyframes.length - 1]);
        return null;
    }
    const { easing, duration } = springEasing(input);
    return target.animate(keyframes, { duration: duration * base.motionScale(), easing, fill: 'both', ...options });
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
            base.caf(id);
        running = false;
    };
    const loop = () => {
        const t = base.now();
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
        id = base.raf(loop);
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
            if (base.prefersReducedMotion()) {
                api.jump(target);
                opts.onRest?.(target);
                return;
            }
            if (!running) {
                running = true;
                last = base.now();
                id = base.raf(loop);
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

exports.SPRING_PRESETS = SPRING_PRESETS;
exports.createSpring = createSpring;
exports.linearEasing = linearEasing;
exports.projectInertia = projectInertia;
exports.resolveSpring = resolveSpring;
exports.rubberBand = rubberBand;
exports.snapTo = snapTo;
exports.spring = spring;
exports.springEasing = springEasing;
exports.springSamples = springSamples;
exports.stepSpring = stepSpring;
exports.supportsLinearEasing = supportsLinearEasing;
//# sourceMappingURL=spring-hsmgd7ml.cjs.map
