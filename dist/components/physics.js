import { x as defineElement, k as clamp } from '../chunks/base-Yno7N2eC.js';
import { d as springEasing, c as createSpring, s as snapTo, a as rubberBand, p as projectInertia } from '../chunks/spring-DfQO5USi.js';
export { S as SPRING_PRESETS, l as linearEasing, r as resolveSpring, b as spring, e as springSamples, f as stepSpring, g as supportsLinearEasing } from '../chunks/spring-DfQO5USi.js';

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
 * motionary/components/physics — spring & bounce physics (v2.3).
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

export { SPRING_EFFECTS, createSpring, defineDraggable, defineOverscroll, definePhysicsComponents, defineSpring, projectInertia, rubberBand, snapTo, springEasing, springEffectKeyframes };
//# sourceMappingURL=physics.js.map
