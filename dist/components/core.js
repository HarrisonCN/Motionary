/**
 * 10.2: declarative `data-motion` in `motionary/core` — no DSL package needed.
 *
 * ```html
 * <h1 data-motion="enter: fade-up 600ms">Hello</h1>
 * <ul data-motion="enter: fade-up 500ms stagger 80ms"> <li>…</li> <li>…</li> </ul>
 * <button data-motion="click: pop; hover: lift">Buy</button>
 * ```
 * ```ts
 * import { createMotion, applyMotionAttributes } from 'motionary/core';
 * const stop = applyMotionAttributes(createMotion(), document, { observe: true });
 * ```
 *
 * Rule grammar (subset of the 9.0 DSL): `trigger: effect [duration] [delay <t>]
 * [stagger <t>] [ease <easing>] [once]`, rules separated by `;`. Triggers:
 * `enter`, `load`, `click`, `hover`, `loop`. Times: `600ms`, `0.6s`, `600`.
 * `stagger` animates the element's children. Effects are core presets or any
 * effect a plugin registered with `use()`.
 */
const TRIGGERS = ['enter', 'load', 'click', 'hover', 'loop'];
const ms = (t) => (t.endsWith('ms') ? parseFloat(t) : t.endsWith('s') ? parseFloat(t) * 1000 : parseFloat(t));
/** Parse a `data-motion` value. Throws on an unknown trigger or a malformed rule. */
function parseMotionAttr(value) {
    return value
        .split(';')
        .map((r) => r.trim())
        .filter(Boolean)
        .map((r) => {
        const m = /^([a-z]+)\s*:\s*(.+)$/i.exec(r);
        if (!m || !TRIGGERS.includes(m[1]))
            throw new Error(`[motionary] data-motion: bad rule "${r}" (use trigger: effect, trigger = ${TRIGGERS.join(' | ')})`);
        const toks = m[2].trim().split(/\s+/);
        const rule = { trigger: m[1], effect: toks.shift() };
        for (let i = 0; i < toks.length; i++) {
            const t = toks[i];
            if (t === 'delay' || t === 'stagger')
                rule[t] = ms(toks[++i] || '0');
            else if (t === 'ease')
                rule.easing = toks[++i];
            else if (t === 'once')
                rule.once = true;
            else if (/^[\d.]+(ms|s)?$/.test(t))
                rule.duration = ms(t);
            else
                rule.easing = t;
        }
        return rule;
    });
}
/**
 * Wire every `[data-motion]` element under `root` to the motion instance.
 * `observe: true` also wires elements added later (MutationObserver).
 * Returns a function that unbinds everything. No-op without a DOM (SSR).
 */
function applyMotionAttributes(m, root = typeof document !== 'undefined' ? document : null, o = {}) {
    if (!root)
        return () => undefined;
    const attr = o.attribute || 'data-motion';
    const offs = new Map();
    const wire = (el) => {
        if (offs.has(el))
            return;
        const value = el.getAttribute(attr);
        if (!value)
            return;
        const list = [];
        for (const r of parseMotionAttr(value)) {
            const opts = { duration: r.duration, delay: r.delay, easing: r.easing };
            for (const k of Object.keys(opts))
                if (opts[k] === undefined)
                    delete opts[k];
            if (r.trigger === 'enter' && r.effect in PRESETS) {
                list.push(m.reveal(r.stagger ? el.children : el, r.effect, { ...opts, stagger: r.stagger, once: r.once ?? true }));
            }
            else {
                if (!m.has(r.effect))
                    throw new Error(`[motionary] data-motion: unknown effect "${r.effect}" — register its plugin with createMotion().use(…)`);
                list.push(m.bind(el, r.effect, { ...opts, trigger: r.trigger, once: r.once }));
            }
        }
        offs.set(el, list);
        el.setAttribute('data-motion-ready', '');
    };
    const scan = (n) => {
        if (n.getAttribute?.(attr))
            wire(n);
        n.querySelectorAll?.(`[${attr}]`).forEach(wire);
    };
    scan(root);
    let mo = null;
    if (o.observe && typeof MutationObserver !== 'undefined') {
        mo = new MutationObserver((recs) => recs.forEach((r) => r.addedNodes.forEach((n) => n.nodeType === 1 && scan(n))));
        mo.observe(root, { childList: true, subtree: true });
    }
    return () => {
        mo?.disconnect();
        offs.forEach((l, el) => {
            l.forEach((f) => f());
            el.removeAttribute('data-motion-ready');
        });
        offs.clear();
    };
}

/**
 * `motionary/core` (10.0) — the zero-dependency core, under 10 KB gzip.
 *
 * Everything else is a plugin: `createMotion().use(retro, cinema)` with the
 * packs from `motionary/plugins` (or your own `{ name, effects }`).
 *
 * - `createMotion({ reducedMotion, rate })` → an instance with `use()`,
 *   `play(el, effect, options)`, `bind(el, effect, { trigger })`,
 *   `reveal(targets, preset, { stagger, once, threshold })`, `animate()`,
 *   `pause()` / `resume()` / `setRate()` for everything it started,
 *   `effects()` and `destroy()`.
 * - `PRESETS` — entrance keyframes (fade, fade-up/down/left/right, scale,
 *   zoom-in/out, blur-in, flip-up), registered as `enter` effects.
 * - `preferredBackend()` — `webgpu` (default when available) → `webgl2` →
 *   `canvas`, the order GPU plugins use.
 *
 * Reduced motion is honoured everywhere (OS setting or `reducedMotion:
 * 'reduce'`): entrances fade, loops / backgrounds / cursors are skipped.
 */
const VERSION = '10.0.0';
const T = (x, y, s = 1) => `translate(${x}px,${y}px) scale(${s})`;
/** Entrance keyframes (10.0). */
const PRESETS = {
    fade: [{ opacity: 0 }, { opacity: 1 }],
    'fade-up': [{ opacity: 0, transform: T(0, 24) }, { opacity: 1, transform: 'none' }],
    'fade-down': [{ opacity: 0, transform: T(0, -24) }, { opacity: 1, transform: 'none' }],
    'fade-left': [{ opacity: 0, transform: T(24, 0) }, { opacity: 1, transform: 'none' }],
    'fade-right': [{ opacity: 0, transform: T(-24, 0) }, { opacity: 1, transform: 'none' }],
    scale: [{ opacity: 0, transform: 'scale(.85)' }, { opacity: 1, transform: 'none' }],
    'zoom-in': [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'none' }],
    'zoom-out': [{ opacity: 0, transform: 'scale(1.2)' }, { opacity: 1, transform: 'none' }],
    'blur-in': [{ opacity: 0, filter: 'blur(10px)' }, { opacity: 1, filter: 'none' }],
    'flip-up': [{ opacity: 0, transform: 'perspective(600px) rotateX(-60deg)' }, { opacity: 1, transform: 'none' }],
};
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const SKIP = ['loop', 'background', 'cursor'];
/** GPU backend order used by GPU plugins: WebGPU by default (10.0). */
function preferredBackend() {
    if (typeof navigator !== 'undefined' && navigator.gpu)
        return 'webgpu';
    try {
        if (typeof document !== 'undefined' && document.createElement('canvas').getContext?.('webgl2'))
            return 'webgl2';
    }
    catch {
        /* no GL */
    }
    return 'canvas';
}
const list = (t) => typeof t === 'string' ? (typeof document === 'undefined' ? [] : Array.from(document.querySelectorAll(t))) : 'length' in t && !(t instanceof Element) ? Array.from(t) : [t];
/** Create a Motionary core instance (10.0). */
function createMotion(config = {}) {
    const reg = new Map();
    const plugins = new Set();
    const live = new Set();
    const offs = new Set();
    let paused = false;
    let rate = config.rate && config.rate > 0 ? config.rate : 1;
    const reduced = () => config.reducedMotion === 'reduce' || (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches);
    const animate = (el, kf, o) => {
        if (typeof el.animate !== 'function')
            return null;
        const a = el.animate(kf, o);
        if (!a)
            return null;
        live.add(a);
        if (rate !== 1)
            a.playbackRate = rate;
        if (paused)
            a.pause();
        const done = () => live.delete(a);
        a.finished?.then(done, done);
        return a;
    };
    const ctx = (event, cleanups = []) => ({ reduced: reduced(), sensitivity: reduced() ? 'minimal' : 'full', event, animate, onCleanup: (f) => cleanups.push(f) });
    const skip = (d) => reduced() && (d.reduced ?? (SKIP.includes(d.kind) ? 'skip' : 'run')) === 'skip';
    const m = {
        get paused() {
            return paused;
        },
        get rate() {
            return rate;
        },
        use(...ps) {
            for (const p of ps) {
                if (!p || plugins.has(p.name))
                    continue;
                plugins.add(p.name);
                for (const e of p.effects || [])
                    if (!reg.has(e.name))
                        reg.set(e.name, e);
                p.install?.(m);
            }
            return m;
        },
        has: (n) => reg.has(n),
        effects: () => Array.from(reg.keys()).sort(),
        reduced,
        animate,
        async play(el, name, options = {}, event) {
            const d = reg.get(name);
            if (!d)
                throw new Error(`[motionary] unknown effect "${name}" — add its plugin with use()`);
            if (skip(d))
                return;
            const out = d.run(el, { ...(d.defaults || {}), ...options }, ctx(event));
            if (out?.finished?.then)
                await out.finished.catch(() => undefined);
            else if (out?.then)
                await out;
        },
        bind(el, name, options = {}) {
            const { trigger = 'click', once, ...o } = options;
            const d = reg.get(name);
            if (!d)
                throw new Error(`[motionary] unknown effect "${name}"`);
            const stops = [];
            let current = [];
            const fire = (e) => {
                if (skip(d))
                    return;
                current.splice(0).forEach((f) => f());
                const out = d.run(el, { ...(d.defaults || {}), ...o }, ctx(e, current));
                if (typeof out === 'function')
                    current.push(out);
            };
            const on = (type) => {
                const h = (e) => fire(e);
                el.addEventListener(type, h, { once: !!once });
                stops.push(() => el.removeEventListener(type, h));
            };
            if (trigger === 'click')
                on('click');
            else if (trigger === 'hover')
                (on('pointerenter'), on('focusin'));
            else if (trigger === 'load' || trigger === 'loop')
                fire();
            else if (trigger === 'enter' && typeof IntersectionObserver !== 'undefined') {
                const io = new IntersectionObserver((es) => es.forEach((en) => {
                    if (!en.isIntersecting)
                        return;
                    fire();
                    if (once !== false)
                        io.disconnect();
                }));
                io.observe(el);
                stops.push(() => io.disconnect());
            }
            const off = () => {
                stops.splice(0).forEach((f) => f());
                current.splice(0).forEach((f) => f());
                offs.delete(off);
            };
            offs.add(off);
            return off;
        },
        reveal(targets, preset = 'fade-up', o = {}) {
            const els = list(targets);
            const kf = PRESETS[preset] || PRESETS.fade;
            const show = (el, i) => {
                el.style.removeProperty('opacity');
                animate(el, reduced() ? PRESETS.fade : kf, { duration: o.duration ?? 600, delay: (o.delay ?? 0) + (o.stagger ?? 0) * i, easing: o.easing || EASE, fill: 'backwards' });
            };
            if (typeof IntersectionObserver === 'undefined') {
                els.forEach(show);
                return () => undefined;
            }
            els.forEach((el) => (el.style.opacity = '0'));
            let batch = 0;
            const io = new IntersectionObserver((es) => {
                batch = 0;
                for (const en of es) {
                    if (!en.isIntersecting)
                        continue;
                    show(en.target, batch++);
                    if (o.once !== false)
                        io.unobserve(en.target);
                }
            }, { threshold: o.threshold ?? 0.15 });
            els.forEach((el) => io.observe(el));
            const off = () => {
                io.disconnect();
                els.forEach((el) => el.style.removeProperty('opacity'));
                offs.delete(off);
            };
            offs.add(off);
            return off;
        },
        pause() {
            paused = true;
            live.forEach((a) => a.pause());
        },
        resume() {
            paused = false;
            live.forEach((a) => a.play());
        },
        setRate(r) {
            if (!(r > 0))
                return;
            rate = r;
            live.forEach((a) => (a.playbackRate = r));
        },
        destroy() {
            Array.from(offs).forEach((f) => f());
            live.forEach((a) => a.cancel());
            live.clear();
        },
    };
    m.use({ name: 'core/presets', effects: Object.entries(PRESETS).map(([name, frames]) => ({ name, kind: 'enter', defaults: { duration: 600, delay: 0, easing: EASE }, run: (el, o, c) => c.animate(el, c.reduced ? PRESETS.fade : frames, { duration: o.duration, delay: o.delay, easing: o.easing, fill: 'backwards' }) })) });
    return m;
}

export { PRESETS, VERSION, applyMotionAttributes, createMotion, parseMotionAttr, preferredBackend };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.2.0/dist/components/core.js.map