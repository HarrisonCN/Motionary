'use strict';

var base = require('../chunks/base-B3me2y0o.cjs');

/**
 * `motionary/engine` (= `motionary/components/engine`, 8.0) — the unified
 * timeline engine and SSR hydration animations.
 *
 * - **`motionClock`** — the one clock every component, effect and frame loop
 *   runs on: `rate` (slow-mo / fast-forward), `pause()` / `resume()` /
 *   `toggle()`, `time`, `onChange()`. Pausing it freezes every animation
 *   started by Motionary on the page.
 * - **`createTimeline()`** — sequence animations on that clock:
 *   `add(target, keyframes, options, position)` with positions `1200`
 *   (ms), `'+=200'` / `'-=100'` (after / overlapping the previous end) or
 *   `'<'` / `'<+=80'` (with the previous start); `play()`, `pause()`,
 *   `seek(ms)`, `progress` (0–1, settable), `duration`, `finished`.
 * - **`hydrateMotion()`** — animate server-rendered `[data-usa-hydrate]`
 *   markup in on hydration without a flash: `ssrHead()` gives the `<style>`
 *   + one-line `<script>` for the document head (content stays visible
 *   without JS, and a CSS fallback reveals it after 3 s if JS never runs).
 */
/** The shared motion clock (8.0). */
const motionClock = {
    get rate() {
        return base.getClock().rate;
    },
    set rate(r) {
        base.setClock({ rate: r });
    },
    get paused() {
        return base.getClock().paused;
    },
    /** Clock time in ms (advances with the shared frame loop, scaled by `rate`, frozen while paused). */
    get time() {
        return base.getClock().time;
    },
    pause() {
        base.setClock({ paused: true });
    },
    resume() {
        base.setClock({ paused: false });
    },
    toggle() {
        base.setClock({ paused: !base.getClock().paused });
    },
    onChange: base.onClockChange,
};
/** Resolve a timeline position against the previous entry (8.0). */
function resolvePosition(position, prev, total) {
    if (typeof position === 'number' && Number.isFinite(position))
        return Math.max(0, position);
    const p = String(position ?? '').replace(/\s+/g, '');
    const prevStart = prev ? prev.start : 0;
    const prevEnd = prev ? prev.end : 0;
    let m;
    if (p === '')
        return prev ? prevEnd : 0;
    if (p === '<')
        return prevStart;
    if ((m = p.match(/^<([+-])=(\d+(?:\.\d+)?)$/)))
        return Math.max(0, prevStart + (m[1] === '+' ? 1 : -1) * Number(m[2]));
    if ((m = p.match(/^([+-])=(\d+(?:\.\d+)?)$/)))
        return Math.max(0, prevEnd + (m[1] === '+' ? 1 : -1) * Number(m[2]));
    if (p === '>')
        return total;
    const n = Number(p);
    return Number.isFinite(n) ? Math.max(0, n) : prevEnd;
}
const span = (o) => {
    const d = typeof o.duration === 'number' ? o.duration : 0;
    const it = typeof o.iterations === 'number' && Number.isFinite(o.iterations) ? o.iterations : 1;
    return (o.delay || 0) + d * it + (o.endDelay || 0);
};
/** Sequence animations on the shared clock (8.0). */
function createTimeline(defaults = {}) {
    const { autoplay = false, ...base$1 } = defaults;
    const entries = [];
    let anims = [];
    let playing = false;
    let pos = 0;
    let resolveDone = () => undefined;
    let finished = new Promise((r) => (resolveDone = r));
    let timer = 0;
    const duration = () => entries.reduce((m, e) => Math.max(m, e.end), 0);
    const build = () => {
        if (anims.length === entries.length)
            return;
        anims.forEach((a) => a?.cancel());
        anims = entries.map((e) => {
            const a = base.animateWithMotion(e.target, e.keyframes, { fill: 'both', ...e.options, delay: e.start + (e.options.delay || 0) });
            if (a) {
                a.pause();
                a.currentTime = pos;
            }
            return a;
        });
    };
    const done = () => {
        playing = false;
        pos = duration();
        resolveDone();
    };
    const tl = {
        get entries() {
            return entries;
        },
        get duration() {
            return duration();
        },
        get playing() {
            return playing;
        },
        get progress() {
            const live = anims.find((a) => a && typeof a.currentTime === 'number');
            const t = live && playing ? Number(live.currentTime) : pos;
            const d = duration();
            return d ? Math.min(1, Math.max(0, t / d)) : 0;
        },
        set progress(p) {
            tl.seek(Math.min(1, Math.max(0, p)) * duration());
        },
        get finished() {
            return finished;
        },
        add(target, keyframes, options = {}, position) {
            const opts = { ...base$1, ...(typeof options === 'number' ? { duration: options } : options) };
            const list = !target ? [] : target instanceof Element ? [target] : Array.from(target);
            const prev = entries.length ? entries[entries.length - 1] : null;
            let start = resolvePosition(position, prev, duration());
            const stagger = opts.stagger ? Number(opts.stagger) : 0;
            delete opts.stagger;
            for (const el of list) {
                entries.push({ target: el, keyframes, options: opts, start, end: start + span(opts) });
                start += stagger;
            }
            anims.forEach((a) => a?.cancel());
            anims = [];
            return tl;
        },
        play() {
            if (pos >= duration())
                pos = 0;
            if (playing)
                return tl;
            if (pos === 0 && anims.length) {
                anims.forEach((a) => a?.cancel());
                anims = [];
                finished = new Promise((r) => (resolveDone = r));
            }
            build();
            playing = true;
            const live = anims.filter(Boolean);
            live.forEach((a) => {
                a.currentTime = pos;
                a.play();
            });
            clearTimeout(timer);
            if (!live.length || base.prefersReducedMotion()) {
                tl.seek(duration());
                done();
            }
            else
                Promise.all(live.map((a) => a.finished.catch(() => undefined))).then(() => playing && done());
            return tl;
        },
        pause() {
            const live = anims.find((a) => a && typeof a.currentTime === 'number');
            if (live)
                pos = Number(live.currentTime);
            anims.forEach((a) => a?.pause());
            playing = false;
            return tl;
        },
        seek(ms) {
            pos = Math.min(duration(), Math.max(0, ms));
            build();
            anims.forEach((a) => {
                if (!a)
                    return;
                a.currentTime = pos;
                if (!playing)
                    a.pause();
            });
            return tl;
        },
        restart() {
            anims.forEach((a) => a?.cancel());
            anims = [];
            pos = 0;
            playing = false;
            finished = new Promise((r) => (resolveDone = r));
            return tl.play();
        },
        cancel() {
            anims.forEach((a) => a?.cancel());
            anims = [];
            playing = false;
            pos = 0;
        },
    };
    if (autoplay)
        queueMicrotask(() => entries.length && tl.play());
    return tl;
}
/** Hydration presets for `data-usa-hydrate="…"` (8.0). */
const HYDRATE_PRESETS = {
    fade: [{ opacity: 0 }, { opacity: 1 }],
    'fade-up': [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }],
    'fade-down': [{ opacity: 0, transform: 'translateY(-16px)' }, { opacity: 1, transform: 'none' }],
    scale: [{ opacity: 0, transform: 'scale(.94)' }, { opacity: 1, transform: 'none' }],
    blur: [{ opacity: 0, filter: 'blur(8px)' }, { opacity: 1, filter: 'none' }],
    'slide-left': [{ opacity: 0, transform: 'translateX(24px)' }, { opacity: 1, transform: 'none' }],
};
/**
 * CSS that keeps `[data-usa-hydrate]` hidden only while JS is on and the
 * page has not hydrated yet (`html.usa-js`), with a 3 s CSS fallback so the
 * content can never stay invisible (8.0).
 */
const HYDRATION_CSS = 'html.usa-js [data-usa-hydrate]:not([data-usa-hydrated]),html.usa-js usa-hydrate:not([data-usa-hydrated])>*{opacity:0;animation:usa-hydrate-fallback 0s 3s forwards}@keyframes usa-hydrate-fallback{to{opacity:1}}@media (prefers-reduced-motion:reduce){html.usa-js [data-usa-hydrate]:not([data-usa-hydrated]),html.usa-js usa-hydrate:not([data-usa-hydrated])>*{opacity:1;animation:none}}';
/** `<style>` + inline `<script>` for the SSR document head (8.0). Pass a CSP `nonce` if you use one. */
function ssrHead(nonce) {
    const n = nonce ? ` nonce="${String(nonce).replace(/"/g, '')}"` : '';
    return `<style data-usa-hydration${n}>${HYDRATION_CSS}</style><script${n}>document.documentElement.classList.add('usa-js')</script>`;
}
/**
 * Animate server-rendered `[data-usa-hydrate]` elements in (document order,
 * staggered; per-element `data-usa-delay`), mark them `data-usa-hydrated`
 * and emit `usa:hydrated` on the root. Returns the timeline (8.0).
 */
function hydrateMotion(root = document, options = {}) {
    const { stagger = 60, duration = 600, preset = 'fade-up', easing = 'cubic-bezier(.2,.8,.2,1)' } = options;
    if (typeof document !== 'undefined' && !document.querySelector('style[data-usa-hydration]')) {
        const s = document.createElement('style');
        s.setAttribute('data-usa-hydration', '');
        s.textContent = HYDRATION_CSS;
        document.head?.appendChild(s);
    }
    const els = Array.from(root.querySelectorAll('[data-usa-hydrate]:not([data-usa-hydrated])'));
    const tl = createTimeline({ easing, duration });
    els.forEach((el, i) => {
        const name = el.getAttribute('data-usa-hydrate') || preset;
        const frames = HYDRATE_PRESETS[name] || HYDRATE_PRESETS[preset] || HYDRATE_PRESETS['fade-up'];
        const extra = Number(el.getAttribute('data-usa-delay')) || 0;
        tl.add(el, frames, { duration, easing }, i * stagger + extra);
    });
    // mark first so the hiding CSS lets go; the animation's backwards fill holds the first frame
    tl.play();
    els.forEach((el) => el.setAttribute('data-usa-hydrated', ''));
    const target = root.dispatchEvent ? root : document;
    tl.finished.then(() => target.dispatchEvent?.(new CustomEvent('usa:hydrated', { detail: { count: els.length }, bubbles: true })));
    return tl;
}

exports.getClock = base.getClock;
exports.onClockChange = base.onClockChange;
exports.setClock = base.setClock;
exports.trackAnimation = base.trackAnimation;
exports.HYDRATE_PRESETS = HYDRATE_PRESETS;
exports.HYDRATION_CSS = HYDRATION_CSS;
exports.createTimeline = createTimeline;
exports.hydrateMotion = hydrateMotion;
exports.motionClock = motionClock;
exports.resolvePosition = resolvePosition;
exports.ssrHead = ssrHead;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.7.0/dist/components/engine.cjs.map