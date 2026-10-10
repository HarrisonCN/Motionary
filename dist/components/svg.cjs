'use strict';

var base = require('../chunks/base-B3me2y0o.cjs');
var keyClick = require('../chunks/key-click-v7I4K5Sr.cjs');

const NUM = /-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi;
/** `true` when two path strings share the same commands (so their numbers can be interpolated). */
function pathsCompatible(a, b) {
    return a.replace(NUM, '#').replace(/[\s,]+/g, ' ').trim() === b.replace(NUM, '#').replace(/[\s,]+/g, ' ').trim();
}
/**
 * Path data between `a` and `b` at `t` (0–1). Paths with the same command
 * structure morph number-by-number; others switch at the midpoint.
 */
function interpolatePath(a, b, t) {
    if (t <= 0)
        return a;
    if (t >= 1)
        return b;
    if (!pathsCompatible(a, b))
        return t < 0.5 ? a : b;
    const nb = b.match(NUM) || [];
    let i = 0;
    return a.replace(NUM, (n) => {
        const v = Number(n) + (Number(nb[i++]) - Number(n)) * t;
        return String(Math.round(v * 1000) / 1000);
    });
}
const ease = (t) => 1 - Math.pow(1 - t, 3);
/** Animate a `<path>`'s `d` to `to`. Resolves when done; instant under reduced motion. */
function morphTo(path, to, o = {}) {
    const from = path.getAttribute('d') || to;
    const dur = (o.duration ?? 500) * base.motionScale();
    const prev = path.__usaMorph;
    if (prev)
        base.caf(prev);
    if (base.prefersReducedMotion() || dur <= 0 || from === to) {
        path.setAttribute('d', to);
        return Promise.resolve();
    }
    const fn = o.easing || ease;
    const t0 = base.now();
    return new Promise((resolve) => {
        const step = () => {
            const t = base.clamp((base.now() - t0) / dur, 0, 1);
            path.setAttribute('d', interpolatePath(from, to, fn(t)));
            if (t < 1)
                path.__usaMorph = base.raf(step);
            else {
                path.__usaMorph = 0;
                resolve();
            }
        };
        path.__usaMorph = base.raf(step);
    });
}
const DRAWABLE = 'path, line, polyline, polygon, circle, ellipse, rect';
/**
 * Prepare every stroke in `root` for line drawing (normalised `pathLength=1`,
 * so no `getTotalLength()` is needed) and return a function that sets
 * progress 0–1, optionally staggered between shapes.
 */
function drawLines(root, o = {}) {
    const shapes = Array.from(root.querySelectorAll(DRAWABLE));
    shapes.forEach((s) => {
        s.setAttribute('pathLength', '1');
        s.style.strokeDasharray = '1 1';
    });
    const st = base.clamp(o.stagger ?? 0, 0, 0.9);
    return (p) => {
        const n = shapes.length;
        shapes.forEach((s, i) => {
            const start = n > 1 ? (i / (n - 1)) * st : 0;
            const local = base.clamp((p - start) / (1 - st || 1), 0, 1);
            s.style.strokeDashoffset = String(1 - local);
        });
    };
}

var css = "usa-draw{display:inline-block}usa-draw svg :is(path,line,polyline,polygon,circle,ellipse,rect){transition:fill-opacity 0.6s ease}usa-draw[fill]:not([data-drawn]) svg :is(path,polygon,circle,ellipse,rect){fill-opacity:0}usa-morph{display:inline-block;line-height:0}usa-morph svg{width:100%;height:100%;fill:currentColor}usa-morph[role=\"button\"]{cursor:pointer}usa-mask-reveal{display:block}usa-mask-reveal[data-state=\"visible\"]{clip-path:none !important}usa-mask-reveal[data-state=\"hidden\"]{opacity:0}usa-anim-icon{display:inline-flex;line-height:0;vertical-align:middle}usa-anim-icon svg{overflow:visible}@media (prefers-reduced-motion:reduce){usa-mask-reveal{clip-path:none !important;opacity:1 !important}usa-draw svg *{stroke-dashoffset:0 !important}}";

function defineDraw(tag = 'usa-draw') {
    return base.defineElement(tag, (Base) => class UsaDraw extends Base {
        constructor() {
            super(...arguments);
            this._set = () => { };
            this._p = 0;
            this._id = 0;
        }
        static get observedAttributes() {
            return ['duration', 'stagger', 'trigger', 'repeat'];
        }
        get progress() {
            return this._p;
        }
        set progress(p) {
            this._p = base.clamp(p, 0, 1);
            this._set(this._p);
            this.toggleAttribute('data-drawn', this._p >= 1);
        }
        play() {
            base.caf(this._id);
            if (this.reduced) {
                this.progress = 1;
                return void this.emit('complete');
            }
            const dur = this.num('duration', 1600) * base.motionScale();
            const t0 = base.now();
            this.progress = 0;
            const step = () => {
                this.progress = (base.now() - t0) / dur;
                if (this._p < 1)
                    this._id = base.raf(step);
                else
                    this.emit('complete');
            };
            this._id = base.raf(step);
        }
        mount() {
            this._set = drawLines(this, { stagger: this.num('stagger', 0.2) });
            const trigger = this.str('trigger', 'view');
            if (this.reduced) {
                this.progress = 1;
                return;
            }
            this.progress = 0;
            if (trigger === 'scrub') {
                const update = () => {
                    const r = this.getBoundingClientRect();
                    const vh = window.innerHeight || 1;
                    this.progress = (vh - r.top) / (vh * 0.6 + r.height * 0.4 || 1);
                };
                this.listen(window, 'scroll', update, { passive: true });
                update();
            }
            else if (trigger === 'hover')
                this.listen(this, 'pointerenter', () => this.play());
            else if (trigger === 'click') {
                this.listen(this, 'click', () => this.play());
                keyClick.keyClick(this);
            }
            else {
                let done = false;
                this.inView((v) => {
                    if (v && (!done || this.flag('repeat'))) {
                        done = true;
                        this.play();
                    }
                    else if (!v && this.flag('repeat'))
                        this.progress = 0;
                }, { threshold: 0.3 });
            }
            this.onCleanup(() => base.caf(this._id));
        }
    }, { id: 'svg', text: css });
}

function defineMorph(tag = 'usa-morph') {
    return base.defineElement(tag, (Base) => class UsaMorph extends Base {
        constructor() {
            super(...arguments);
            this._i = 0;
            this._path = null;
        }
        static get observedAttributes() {
            return ['paths', 'trigger', 'duration', 'interval'];
        }
        get index() {
            return this._i;
        }
        list() {
            return this.str('paths').split('|').map((s) => s.trim()).filter(Boolean);
        }
        next() {
            const l = this.list();
            if (!this._path || l.length < 2)
                return Promise.resolve();
            this._i = (this._i + 1) % l.length;
            this.emit('change', { index: this._i });
            return morphTo(this._path, l[this._i], { duration: this.num('duration', 600) });
        }
        mount() {
            let path = this.querySelector('path');
            if (!path) {
                this.innerHTML = '<svg viewBox="0 0 100 100" aria-hidden="true"><path></path></svg>';
                path = this.querySelector('path');
            }
            this._path = path;
            const l = this.list();
            if (l[0])
                this._path.setAttribute('d', l[this._i % l.length]);
            const t = this.str('trigger', 'click');
            if (t === 'hover') {
                this.listen(this, 'pointerenter', () => void this.next());
                this.listen(this, 'pointerleave', () => void this.next());
            }
            else if (t === 'auto' || t === 'view') {
                let timer;
                this.inView((v) => {
                    clearInterval(timer);
                    if (!v || this.reduced)
                        return;
                    if (t === 'view')
                        return void this.next();
                    timer = setInterval(() => void this.next(), this.num('interval', 2000));
                });
                this.onCleanup(() => clearInterval(timer));
            }
            else {
                if (!this.hasAttribute('tabindex'))
                    this.tabIndex = 0;
                if (!this.hasAttribute('role'))
                    this.setAttribute('role', 'button');
                this.listen(this, 'click', () => void this.next());
                this.listen(this, 'keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        void this.next();
                    }
                });
            }
        }
    }, { id: 'svg', text: css });
}

/** Clip-path start / end frames for each reveal shape. */
const MASK_SHAPES = {
    circle: ['circle(0% at 50% 50%)', 'circle(75% at 50% 50%)'],
    diamond: ['polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)', 'polygon(50% -50%, 150% 50%, 50% 150%, -50% 50%)'],
    wipe: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'],
    'wipe-up': ['inset(100% 0 0 0)', 'inset(0% 0 0 0)'],
    iris: ['inset(50% 50% 50% 50% round 50%)', 'inset(0% 0% 0% 0% round 0%)'],
    star: [
        'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%)',
        'polygon(50% -60%, 80% 20%, 160% 30%, 95% 85%, 115% 170%, 50% 125%, -15% 170%, 5% 85%, -60% 30%, 20% 20%)',
    ],
};
function defineMaskReveal(tag = 'usa-mask-reveal') {
    return base.defineElement(tag, (Base) => class UsaMaskReveal extends Base {
        static get observedAttributes() {
            return ['shape', 'at', 'duration', 'delay', 'trigger', 'repeat'];
        }
        frames() {
            const s = MASK_SHAPES[this.str('shape', 'circle')] || MASK_SHAPES.circle;
            const at = this.str('at');
            return at && s[0].startsWith('circle') ? [s[0].replace('50% 50%', at), s[1].replace('50% 50%', at)] : s;
        }
        reveal() {
            const [a, b] = this.frames();
            this.setAttribute('data-state', 'revealing');
            // fill 'both' keeps the closed mask applied during `delay`
            const anim = this.motion(this, [{ clipPath: a }, { clipPath: b }], { duration: this.num('duration', 900), delay: this.num('delay', 0), easing: base.EASE_OUT, fill: 'both' });
            this.style.opacity = '';
            const done = () => {
                this.setAttribute('data-state', 'visible');
                this.emit('complete');
            };
            if (!anim)
                return Promise.resolve(done());
            return anim.finished.then(done, () => { });
        }
        mount() {
            if (this.reduced) {
                this.setAttribute('data-state', 'visible');
                return;
            }
            // 4.0.1: hide with opacity, not the closed clip-path — Chromium's
            // IntersectionObserver honours the target's own clip-path, so a fully
            // clipped element never reports as intersecting and never revealed.
            const hide = () => {
                this.getAnimations?.().forEach((x) => x.cancel());
                this.style.opacity = '0';
                this.setAttribute('data-state', 'hidden');
            };
            hide();
            this.onCleanup(() => ((this.style.opacity = ''), (this.style.clipPath = '')));
            const t = this.str('trigger', 'view');
            if (t === 'hover')
                this.listen(this, 'pointerenter', () => void this.reveal());
            else if (t === 'click') {
                this.listen(this, 'click', () => void this.reveal());
                keyClick.keyClick(this);
            }
            else {
                let done = false;
                this.inView((v) => {
                    if (v && (!done || this.flag('repeat'))) {
                        done = true;
                        void this.reveal();
                    }
                    else if (!v && this.flag('repeat'))
                        hide();
                }, { threshold: 0.25 });
            }
        }
    }, { id: 'svg', text: css });
}

/** Built-in animated icons (24×24 strokes) and the motion each one plays. */
const ANIM_ICONS = {
    bell: { d: 'M6 16V11a6 6 0 0 1 12 0v5l2 2H4l2-2M10 20a2 2 0 0 0 4 0', duration: 800, origin: '50% 10%', frames: [{ rotate: '0deg' }, { rotate: '18deg' }, { rotate: '-14deg' }, { rotate: '9deg' }, { rotate: '-5deg' }, { rotate: '0deg' }] },
    heart: { d: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z', duration: 600, frames: [{ scale: 1 }, { scale: 1.3 }, { scale: 0.92 }, { scale: 1.12 }, { scale: 1 }] },
    check: { d: 'M4 12.5l5 5L20 6.5', duration: 600, frames: [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }] },
    arrow: { d: 'M4 12h15M13 6l6 6-6 6', duration: 600, frames: [{ translate: '0 0' }, { translate: '5px 0' }, { translate: '0 0' }] },
    star: { d: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z', duration: 700, frames: [{ rotate: '0deg', scale: 1 }, { rotate: '72deg', scale: 1.2 }, { rotate: '144deg', scale: 1 }] },
    gear: { d: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1', duration: 900, frames: [{ rotate: '0deg' }, { rotate: '180deg' }] },
    search: { d: 'M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM15.5 15.5L20 20', duration: 700, frames: [{ rotate: '0deg' }, { rotate: '-15deg' }, { rotate: '10deg' }, { rotate: '0deg' }] },
    download: { d: 'M12 4v11M7 10l5 5 5-5M5 20h14', duration: 700, frames: [{ translate: '0 0' }, { translate: '0 3px' }, { translate: '0 0' }] },
};
function defineAnimIcon(tag = 'usa-anim-icon') {
    return base.defineElement(tag, (Base) => class UsaAnimIcon extends Base {
        static get observedAttributes() {
            return ['name', 'size', 'label', 'trigger'];
        }
        icon() {
            return ANIM_ICONS[this.str('name', 'heart')] || ANIM_ICONS.heart;
        }
        play() {
            if (this.reduced)
                return;
            const svg = this.querySelector('svg');
            const i = this.icon();
            const target = i.frames[0].strokeDashoffset !== undefined ? this.querySelector('path') : svg;
            if (target)
                this.motion(target, i.frames, { duration: i.duration, easing: 'ease-in-out', iterations: this.str('trigger') === 'loop' ? Infinity : 1 });
        }
        mount() {
            const i = this.icon();
            const size = this.num('size', 24);
            const label = this.str('label');
            this.innerHTML = `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform-origin:${i.origin || '50% 50%'}"${label ? ` role="img" aria-label="${label.replace(/"/g, '&quot;')}"` : ' aria-hidden="true"'}><path d="${i.d}"${i.frames[0].strokeDashoffset !== undefined ? ' pathLength="1" stroke-dasharray="1"' : ''}></path></svg>`;
            const t = this.str('trigger', 'hover');
            if (t === 'click') {
                this.listen(this, 'click', () => this.play());
                keyClick.keyClick(this);
            }
            else if (t === 'view' || t === 'loop')
                this.inView((v) => v && this.play(), { threshold: 0.5 });
            else {
                this.listen(this, 'pointerenter', () => this.play());
                this.listen(this, 'focusin', () => this.play());
            }
        }
    }, { id: 'svg', text: css });
}

/**
 * motionary/components/svg — SVG animation (v3.3).
 * `<usa-draw>` (line drawing), `<usa-morph>` (path morph), `<usa-mask-reveal>`
 * (mask / clip-path reveals) and `<usa-anim-icon>` (animated icons), plus
 * `interpolatePath()`, `morphTo()`, `drawLines()`.
 */
/** Register every component of this category under its default tag. */
function defineSvgComponents() {
    defineDraw();
    defineMorph();
    defineMaskReveal();
    defineAnimIcon();
}

exports.ANIM_ICONS = ANIM_ICONS;
exports.MASK_SHAPES = MASK_SHAPES;
exports.defineAnimIcon = defineAnimIcon;
exports.defineDraw = defineDraw;
exports.defineMaskReveal = defineMaskReveal;
exports.defineMorph = defineMorph;
exports.defineSvgComponents = defineSvgComponents;
exports.drawLines = drawLines;
exports.interpolatePath = interpolatePath;
exports.morphTo = morphTo;
exports.pathsCompatible = pathsCompatible;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.5.0/dist/components/svg.cjs.map