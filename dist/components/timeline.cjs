'use strict';

var base = require('../chunks/base-CXx7jZ-o.cjs');

/** Keyframe presets usable by name in `to()` and `data-tl`. */
const TIMELINE_PRESETS = {
    fade: [{ opacity: 0 }, { opacity: 1 }],
    'fade-up': [{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }],
    'fade-down': [{ opacity: 0, transform: 'translateY(-24px)' }, { opacity: 1, transform: 'none' }],
    'fade-left': [{ opacity: 0, transform: 'translateX(24px)' }, { opacity: 1, transform: 'none' }],
    'fade-right': [{ opacity: 0, transform: 'translateX(-24px)' }, { opacity: 1, transform: 'none' }],
    scale: [{ opacity: 0, transform: 'scale(0.85)' }, { opacity: 1, transform: 'none' }],
    blur: [{ opacity: 0, filter: 'blur(12px)' }, { opacity: 1, filter: 'blur(0)' }],
    rotate: [{ opacity: 0, transform: 'rotate(-12deg) scale(0.9)' }, { opacity: 1, transform: 'none' }],
    'clip-up': [{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0 0 0 0)' }],
    'clip-right': [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }],
};
/** Resolve a position against the previous step and labels (pure). */
function resolvePosition(pos, end, prevStart, labels = {}) {
    if (pos === undefined || pos === '' || pos === '>')
        return end;
    if (typeof pos === 'number')
        return Math.max(0, pos);
    const s = String(pos).trim();
    if (/^-?\d+(\.\d+)?$/.test(s))
        return Math.max(0, Number(s));
    const m = /^(<|>|[A-Za-z_][\w-]*)?\s*(?:([+-])=\s*(\d+(?:\.\d+)?))?$/.exec(s);
    if (!m)
        return end;
    const base = m[1] === '<' ? prevStart : m[1] === '>' || !m[1] ? end : labels[m[1]] ?? end;
    const delta = m[2] ? (m[2] === '-' ? -1 : 1) * Number(m[3]) : 0;
    return Math.max(0, base + delta);
}
const toEls = (t) => typeof t === 'string' ? (typeof document === 'undefined' ? [] : Array.from(document.querySelectorAll(t))) : t instanceof Element ? [t] : Array.from(t);
/**
 * Choreograph animations on one clock: chain, overlap, label, seek, reverse and
 * scrub them with scroll. Built on WAAPI (paused animations driven by one
 * playhead); without WAAPI or under reduced motion it jumps to the end state.
 *
 * @example
 * const tl = timeline({ defaults: { duration: 500 } })
 *   .to('.title', 'fade-up')
 *   .label('cards')
 *   .to('.card', 'scale', { stagger: 80, at: '-=200' })
 *   .to('.cta', [{ opacity: 0 }, { opacity: 1 }], { at: 'cards+=400' });
 * tl.play();             // or tl.scrub(document.querySelector('.hero'))
 */
function timeline(options = {}) {
    const d = { duration: 600, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', stagger: 0, ...options.defaults };
    const steps = [];
    const cues = [];
    const labels = {};
    let end = 0;
    let prevStart = 0;
    let t = 0;
    let frame = 0;
    let dir = 1;
    let settle;
    let built = false;
    const total = () => Math.max(end, ...cues.map((c) => c.at), 0);
    const build = () => {
        if (built)
            return;
        built = true;
        for (const s of steps) {
            if (typeof s.el.animate !== 'function') {
                s.anim = null;
                continue;
            }
            s.anim = s.el.animate(s.frames, { duration: s.duration, delay: s.start, easing: s.easing, fill: 'both' });
            s.anim.pause();
        }
    };
    const render = (to, from) => {
        build();
        t = base.clamp(to, 0, total());
        for (const s of steps) {
            if (s.anim)
                s.anim.currentTime = t;
            else
                base.applyFrame(s.el, s.frames[t >= s.start ? s.frames.length - 1 : 0]);
        }
        for (const c of cues)
            if ((from < c.at && t >= c.at) || (from > c.at && t <= c.at))
                c.fn();
        options.onUpdate?.(total() ? t / total() : 1);
    };
    const stop = () => {
        if (frame)
            base.caf(frame);
        frame = 0;
    };
    const run = (direction) => {
        stop();
        settle?.();
        dir = direction;
        const target = dir > 0 ? total() : 0;
        const k = base.motionScale();
        if (base.prefersReducedMotion() || k === 0 || !total()) {
            render(target, t);
            options.onComplete?.();
            return Promise.resolve();
        }
        const rate = (options.speed ?? 1) / k;
        return new Promise((resolve) => {
            settle = () => { settle = undefined; resolve(); };
            let last = base.now();
            const loop = () => {
                const n = base.now();
                const next = t + (n - last) * rate * dir;
                last = n;
                render(next, t);
                if ((dir > 0 && t >= target) || (dir < 0 && t <= 0)) {
                    frame = 0;
                    options.onComplete?.();
                    settle?.();
                    return;
                }
                frame = base.raf(loop);
            };
            frame = base.raf(loop);
        });
    };
    const api = {
        get duration() { return total(); },
        get labels() { return { ...labels }; },
        get time() { return t; },
        to(target, frames, o = {}) {
            const kf = typeof frames === 'string' ? TIMELINE_PRESETS[frames] || TIMELINE_PRESETS.fade : frames;
            const start = resolvePosition(o.at, end, prevStart, labels);
            const duration = o.duration ?? d.duration;
            const stagger = o.stagger ?? d.stagger;
            let last = start;
            toEls(target).forEach((el, i) => {
                const s = start + i * stagger;
                steps.push({ el, frames: kf, start: s, duration, easing: o.easing ?? d.easing });
                last = Math.max(last, s + duration);
            });
            prevStart = start;
            end = Math.max(end, last);
            built = false;
            steps.forEach((s) => s.anim?.cancel());
            return api;
        },
        label(name, at) {
            labels[name] = resolvePosition(at, end, prevStart, labels);
            return api;
        },
        call(fn, at) {
            cues.push({ fn, at: resolvePosition(at, end, prevStart, labels) });
            return api;
        },
        play(from) {
            if (from !== undefined)
                render(resolvePosition(from, 0, 0, labels), t);
            else if (t >= total())
                render(0, -1);
            return run(1);
        },
        reverse() {
            return run(-1);
        },
        pause() {
            stop();
            return api;
        },
        seek(to) {
            stop();
            render(resolvePosition(to, 0, 0, labels), t);
            return api;
        },
        progress(p) {
            if (p !== undefined)
                api.seek(base.clamp(p, 0, 1) * total());
            return total() ? t / total() : 0;
        },
        scrub(source, o = {}) {
            stop();
            if (base.prefersReducedMotion() || typeof window === 'undefined') {
                render(total(), t);
                return () => { };
            }
            let id = 0;
            let cur = t;
            const update = () => {
                id = 0;
                const r = source.getBoundingClientRect();
                const vh = window.innerHeight || 1;
                const p = base.clamp((vh + (o.offset ?? 0) - r.top) / (vh + r.height || 1), 0, 1);
                const goal = p * total();
                const sm = base.clamp(o.smooth ?? 0, 0, 0.95);
                cur = sm ? cur + (goal - cur) * (1 - sm) : goal;
                render(cur, t);
                if (sm && Math.abs(goal - cur) > 0.5)
                    id = base.raf(update);
            };
            const onScroll = () => { if (!id)
                id = base.raf(update); };
            window.addEventListener('scroll', onScroll, { passive: true });
            window.addEventListener('resize', onScroll, { passive: true });
            update();
            return () => {
                window.removeEventListener('scroll', onScroll);
                window.removeEventListener('resize', onScroll);
                if (id)
                    base.caf(id);
            };
        },
        cancel() {
            stop();
            settle?.();
            steps.forEach((s) => s.anim?.cancel());
            built = false;
        },
    };
    return api;
}

var css = "usa-timeline{display:block}usa-timeline[scrub]{position:relative}@media (prefers-reduced-motion:reduce){usa-timeline [data-tl]{opacity:1 !important;transform:none !important;filter:none !important;clip-path:none !important}}";

function defineTimeline(tag = 'usa-timeline') {
    return base.defineElement(tag, (Base) => class UsaTimeline extends Base {
        constructor() {
            super(...arguments);
            this._tl = null;
        }
        static get observedAttributes() {
            return ['scrub', 'trigger', 'overlap'];
        }
        get timeline() {
            return this._tl;
        }
        play() {
            return this._tl ? this._tl.play(0).then(() => void this.emit('complete')) : Promise.resolve();
        }
        reverse() {
            return this._tl ? this._tl.reverse() : Promise.resolve();
        }
        seek(to) {
            this._tl?.seek(to);
        }
        mount() {
            const overlap = this.num('overlap', 0);
            const tl = (this._tl = timeline({ defaults: { duration: this.num('duration', 600), stagger: this.num('stagger', 0) } }));
            this.querySelectorAll('[data-tl]').forEach((el, i) => {
                if (el.dataset.label)
                    tl.label(el.dataset.label);
                const name = el.dataset.tl || 'fade';
                tl.to(el, TIMELINE_PRESETS[name] ? name : 'fade', {
                    at: el.dataset.at ?? (i && overlap ? `-=${overlap}` : undefined),
                    duration: el.dataset.duration ? Number(el.dataset.duration) : undefined,
                });
            });
            this.onCleanup(() => tl.cancel());
            if (this.reduced) {
                tl.seek(tl.duration);
                return;
            }
            if (this.flag('scrub')) {
                this.onCleanup(tl.scrub(this, { smooth: 0.2 }));
                return;
            }
            tl.seek(0);
            const trigger = this.str('trigger', 'view');
            if (trigger === 'click')
                this.listen(this, 'click', () => void this.play());
            else if (trigger === 'view') {
                let played = false;
                this.inView((v) => {
                    if (v && (!played || this.flag('repeat'))) {
                        played = true;
                        void this.play();
                    }
                    else if (!v && this.flag('repeat'))
                        tl.seek(0);
                }, { threshold: 0.2 });
            }
        }
        unmount() {
            this._tl = null;
        }
    }, { id: 'timeline', text: css });
}

/**
 * use-scroll-animate/components/timeline — choreography (v3.1).
 * `timeline()` chains, overlaps, labels, seeks, reverses and scroll-scrubs
 * WAAPI animations on one playhead; `<usa-timeline>` builds one from
 * `data-tl` children.
 */
/** Register every component of this category under its default tag. */
function defineTimelineComponents() {
    defineTimeline();
}

exports.configureComponents = base.configureComponents;
exports.prefersReducedMotion = base.prefersReducedMotion;
exports.TIMELINE_PRESETS = TIMELINE_PRESETS;
exports.defineTimeline = defineTimeline;
exports.defineTimelineComponents = defineTimelineComponents;
exports.resolvePosition = resolvePosition;
exports.timeline = timeline;
//# sourceMappingURL=timeline.cjs.map
