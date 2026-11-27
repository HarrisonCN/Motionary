'use strict';

var base = require('./base-DzZEJhQB.cjs');
var spring = require('./spring-DoapHVAk.cjs');

/** Sixteen springs tuned for the parts of a micro-interaction. */
const MICRO_SPRINGS = {
    instant: { duration: 120, bounce: 0 },
    snappy: { duration: 260, bounce: 0.12 },
    smooth: { duration: 420, bounce: 0 },
    gentle: { duration: 600, bounce: 0.05 },
    bouncy: { duration: 480, bounce: 0.38 },
    elastic: { duration: 650, bounce: 0.55 },
    press: { duration: 150, bounce: 0 },
    release: { duration: 380, bounce: 0.32 },
    hover: { duration: 320, bounce: 0.15 },
    toggle: { duration: 340, bounce: 0.22 },
    drag: { duration: 110, bounce: 0 },
    settle: { duration: 520, bounce: 0.18 },
    pop: { duration: 360, bounce: 0.45 },
    jelly: { duration: 700, bounce: 0.62 },
    heavy: { duration: 800, bounce: 0.08 },
    feather: { duration: 900, bounce: 0.25 },
};
/** A feel retunes every role spring: durations are divided by `speed` and `bounce` is added to their bounce. */
const MICRO_FEELS = {
    crisp: { speed: 1.35, bounce: -0.1 },
    snappy: { speed: 1.2, bounce: 0 },
    smooth: { speed: 1, bounce: -0.08 },
    bouncy: { speed: 1, bounce: 0.18 },
    playful: { speed: 0.9, bounce: 0.3 },
    calm: { speed: 0.75, bounce: -0.12 },
    heavy: { speed: 0.65, bounce: 0.05 },
};
const fin = (n, d) => (typeof n === 'number' && Number.isFinite(n) ? n : d);
/** `{ duration, bounce }` → stiffness / damping / mass (mass 1 unless given). */
function springFromFeel(feel = {}, mass = 1) {
    const m = fin(mass, 1) > 0 ? mass : 1;
    const T = Math.min(10000, Math.max(16, fin(feel.duration, 400))) / 1000;
    const b = Math.min(0.95, Math.max(-0.95, fin(feel.bounce, 0)));
    const zeta = b >= 0 ? 1 - b : 1 / (1 + b);
    const w = (2 * Math.PI) / T;
    return { stiffness: w * w * m, damping: 2 * zeta * w * m, mass: m };
}
/** Stiffness / damping / mass → `{ duration, bounce, dampingRatio }`. */
function springFeel(p) {
    const k = Math.max(1e-6, p.stiffness);
    const m = Math.max(1e-6, p.mass);
    const zeta = Math.max(0, p.damping) / (2 * Math.sqrt(k * m));
    const duration = ((2 * Math.PI) / Math.sqrt(k / m)) * 1000;
    return { duration, bounce: zeta <= 1 ? 1 - zeta : 1 / zeta - 1, dampingRatio: zeta };
}
/**
 * Any spring description → physics: a `MICRO_SPRINGS` name, a v2.3 `SPRING_PRESETS` name, `"<duration>[ms] <bounce>"`
 * (e.g. `"380ms 0.3"`), `{ duration, bounce }` or `{ stiffness, damping, mass }`. `feel` retunes it and `speed`
 * (e.g. a look's `--mo-kit-speed`) shortens or stretches it. Unknown input is the `smooth` spring.
 */
function microSpring(input, feel, speed = 1) {
    let f = null;
    if (typeof input === 'string') {
        const s = input.trim();
        if (s in MICRO_SPRINGS)
            f = { ...MICRO_SPRINGS[s] };
        else if (s in spring.SPRING_PRESETS)
            f = springFeel(spring.resolveSpring(s));
        else {
            const m = /^(\d+(?:\.\d+)?)\s*(ms|s)?(?:[\s,]+(-?\d*\.?\d+))?$/.exec(s);
            if (m)
                f = { duration: Number(m[1]) * (m[2] === 's' ? 1000 : 1), bounce: m[3] === undefined ? 0 : Number(m[3]) };
        }
    }
    else if (input && typeof input === 'object') {
        if ('stiffness' in input || 'damping' in input) {
            const r = spring.resolveSpring(input);
            f = springFeel(r);
            if (!feel && speed === 1)
                return { stiffness: r.stiffness, damping: r.damping, mass: r.mass };
        }
        else
            f = { duration: fin(input.duration, 400), bounce: fin(input.bounce, 0) };
    }
    f || (f = { ...MICRO_SPRINGS.smooth });
    const tune = feel && MICRO_FEELS[feel];
    const sp = Math.min(4, Math.max(0.25, fin(speed, 1) > 0 ? speed : 1)) * (tune ? tune.speed : 1);
    return springFromFeel({ duration: f.duration / sp, bounce: f.bounce + (tune ? tune.bounce : 0) });
}
/**
 * The closed-form motion from `from` towards `to` starting at `velocity` (units/s). Returns a function of elapsed
 * time in ms that gives `[value, velocity]`.
 */
function springSolution(p, from, to, velocity = 0) {
    const m = Math.max(1e-6, p.mass);
    const k = Math.max(1e-6, p.stiffness);
    const w = Math.sqrt(k / m);
    const zeta = Math.max(0, p.damping) / (2 * Math.sqrt(k * m));
    const x0 = from - to;
    const v0 = fin(velocity, 0);
    if (Math.abs(zeta - 1) < 1e-4) {
        const c = v0 + w * x0;
        return (ms) => {
            const t = Math.max(0, ms) / 1000;
            const e = Math.exp(-w * t);
            return [to + e * (x0 + c * t), e * (v0 - w * c * t)];
        };
    }
    if (zeta < 1) {
        const wd = w * Math.sqrt(1 - zeta * zeta);
        const a = zeta * w;
        const B = (v0 + a * x0) / wd;
        return (ms) => {
            const t = Math.max(0, ms) / 1000;
            const e = Math.exp(-a * t);
            const cos = Math.cos(wd * t);
            const sin = Math.sin(wd * t);
            return [to + e * (x0 * cos + B * sin), e * ((B * wd - a * x0) * cos - (a * B + x0 * wd) * sin)];
        };
    }
    const s = Math.sqrt(zeta * zeta - 1);
    const r1 = -w * (zeta - s);
    const r2 = -w * (zeta + s);
    const c2 = (v0 - r1 * x0) / (r2 - r1);
    const c1 = x0 - c2;
    return (ms) => {
        const t = Math.max(0, ms) / 1000;
        const e1 = Math.exp(r1 * t);
        const e2 = Math.exp(r2 * t);
        return [to + c1 * e1 + c2 * e2, r1 * c1 * e1 + r2 * c2 * e2];
    };
}
/** When a motion from `from` to `to` comes to rest within `precision` (a fraction of the distance; default 0.001), in ms (max 10 s). */
function settleTime(p, from = 0, to = 1, velocity = 0, precision = 0.001) {
    const f = springSolution(p, from, to, velocity);
    const scale = Math.max(Math.abs(to - from), Math.abs(velocity) * 0.05, 1e-6) * precision;
    let still = 0;
    for (let t = 0; t <= 10000; t += 4) {
        const [x, v] = f(t);
        if (Math.abs(x - to) < scale && Math.abs(v) < scale * 20) {
            if (!still)
                still = t;
            if (t - still >= 60)
                return still;
        }
        else
            still = 0;
    }
    return 10000;
}
/** The spring from 0 to 1 as a CSS `linear()` easing and its duration in ms, for `el.animate()` / transitions. */
function microEasing(input, feel, points = 40) {
    const p = microSpring(input, feel);
    const duration = settleTime(p);
    if (!spring.supportsLinearEasing())
        return { easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', duration: Math.min(duration, 1200) };
    const f = springSolution(p, 0, 1);
    const n = Math.max(2, Math.min(200, Math.round(points)));
    const values = Array.from({ length: n + 1 }, (_, i) => f((duration * i) / n)[0]);
    return { easing: spring.linearEasing(values, n + 1), duration };
}
/**
 * Several spring-animated numbers that share one frame loop (on the motion clock, so `setClock()` slows or pauses
 * them too). Retargeting keeps velocity; each channel keeps the spring it was last set with.
 */
function createSpringGroup(initial, opts = {}) {
    let spec = opts.spring;
    let feel = opts.feel;
    let speed = opts.speed ?? 1;
    let base$1 = microSpring(spec, feel, speed);
    const ch = new Map();
    const values = {};
    let clock = 0;
    let stopLoop = null;
    const precision = opts.precision ?? 0.001;
    const reduced = () => !opts.always && base.prefersReducedMotion();
    const add = (name, value) => {
        const c = { x: value, v: 0, to: value, t0: 0, p: base$1, f: null };
        ch.set(name, c);
        values[name] = value;
        return c;
    };
    for (const [k, v] of Object.entries(initial))
        add(k, fin(v, 0));
    const chan = (name) => ch.get(name) || add(name, 0);
    const sample = (c) => {
        if (!c.f)
            return;
        [c.x, c.v] = c.f(clock - c.t0);
    };
    const tuned = (s) => (s === undefined ? base$1 : microSpring(s, feel, speed));
    const restart = (c) => {
        c.t0 = clock;
        c.f = springSolution(c.p, c.x, c.to, c.v);
    };
    let fresh = false;
    const frame = (_t, dt) => {
        // the scheduler's first delta after a quiet spell spans the whole quiet time: count one frame instead
        clock += Math.min(fresh ? 16.7 : 64, Math.max(0, dt)) / Math.max(0.01, base.motionScale());
        fresh = false;
        let busy = false;
        ch.forEach((c, name) => {
            if (c.f) {
                sample(c);
                const scale = Math.max(1, Math.abs(c.to)) * precision;
                if (Math.abs(c.x - c.to) < scale && Math.abs(c.v) < scale * 30) {
                    c.x = c.to;
                    c.v = 0;
                    c.f = null;
                }
                else
                    busy = true;
            }
            values[name] = c.x;
        });
        opts.onUpdate?.(values, group);
        if (!busy) {
            stopLoop?.();
            stopLoop = null;
            opts.onRest?.(values);
        }
    };
    const wake = () => {
        if (stopLoop)
            return;
        fresh = true;
        stopLoop = base.onFrame(frame, opts.owner);
    };
    const group = {
        values,
        get animating() {
            return !!stopLoop;
        },
        get: (name) => chan(name).x,
        velocity: (name) => chan(name).v,
        target: (name) => chan(name).to,
        set(targets, o = {}) {
            const p = o.spring === undefined ? undefined : tuned(o.spring);
            if (reduced())
                return group.jump(targets);
            for (const [name, to] of Object.entries(targets)) {
                if (!Number.isFinite(to))
                    continue;
                const c = chan(name);
                sample(c);
                c.to = to;
                if (p)
                    c.p = p;
                const v = o.velocity?.[name];
                if (v !== undefined && Number.isFinite(v))
                    c.v = v;
                restart(c);
            }
            wake();
        },
        impulse(vel, s) {
            if (reduced())
                return;
            const p = s === undefined ? undefined : tuned(s);
            for (const [name, dv] of Object.entries(vel)) {
                if (!Number.isFinite(dv) || !dv)
                    continue;
                const c = chan(name);
                sample(c);
                c.v += dv;
                if (p)
                    c.p = p;
                restart(c);
            }
            wake();
        },
        jump(vals) {
            for (const [name, x] of Object.entries(vals)) {
                if (!Number.isFinite(x))
                    continue;
                const c = chan(name);
                c.x = c.to = x;
                c.v = 0;
                c.f = null;
                values[name] = x;
            }
            if (![...ch.values()].some((c) => c.f)) {
                stopLoop?.();
                stopLoop = null;
            }
            opts.onUpdate?.(values, group);
        },
        configure(o) {
            if ('spring' in o)
                spec = o.spring;
            if ('feel' in o)
                feel = o.feel;
            if (o.speed !== undefined)
                speed = o.speed;
            base$1 = microSpring(spec, feel, speed);
        },
        stop() {
            ch.forEach((c) => {
                sample(c);
                c.to = c.x;
                c.v = 0;
                c.f = null;
            });
            stopLoop?.();
            stopLoop = null;
        },
    };
    return group;
}

exports.MICRO_FEELS = MICRO_FEELS;
exports.MICRO_SPRINGS = MICRO_SPRINGS;
exports.createSpringGroup = createSpringGroup;
exports.microEasing = microEasing;
exports.microSpring = microSpring;
exports.settleTime = settleTime;
exports.springFeel = springFeel;
exports.springFromFeel = springFromFeel;
exports.springSolution = springSolution;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/chunks/spring-solver-CS4saXm-.cjs.map