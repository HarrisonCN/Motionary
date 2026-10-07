import { f as clamp, h as defineElement } from '../chunks/base-Cu-86Z31.js';
export { a as configureComponents, p as prefersReducedMotion } from '../chunks/base-Cu-86Z31.js';
import { c as createSpring } from '../chunks/spring-BV-cpTHC.js';

/** The swipe a pointer release represents, or `null` (pure). */
function swipeDirection(dx, dy, vx, vy, o = {}) {
    const dist = o.distance ?? 40;
    const vel = o.velocity ?? 300;
    const horiz = o.axis === 'x' || (o.axis !== 'y' && Math.abs(dx) >= Math.abs(dy));
    const d = horiz ? dx : dy;
    const v = horiz ? vx : vy;
    if (Math.abs(d) < dist && Math.abs(v) < vel * 2)
        return null;
    if (Math.abs(v) < vel && Math.abs(d) < dist * 3)
        return null;
    const direction = horiz ? (d > 0 ? 'right' : 'left') : d > 0 ? 'down' : 'up';
    return { direction, velocity: Math.abs(v), dx, dy };
}
/** Scale between two pointer distances, clamped to [min, max] (pure). */
function pinchScale(startDistance, distance, base = 1, min = 0.5, max = 4) {
    if (!startDistance)
        return base;
    return clamp(base * (distance / startDistance), min, max);
}
const pid = (e) => (typeof e.pointerId === 'number' ? e.pointerId : 1);
/**
 * One recognizer for pan, swipe, pinch (two pointers or Ctrl + wheel),
 * long-press, tap and double-tap, with velocities ready to hand to a spring
 * (`createSpring().set(target, velocity)`). Works with mouse, touch and pen
 * through Pointer Events. Returns a cleanup function.
 *
 * @example
 * const x = createSpring({ onUpdate: (v) => (card.style.translate = `${v}px`) });
 * gesture(card, {
 *   onPan: ({ dx, last, vx }) => (last ? x.set(0, vx) : x.jump(dx)),
 *   onSwipe: ({ direction }) => dismiss(direction),
 * }, { axis: 'x' });
 */
function gesture(el, h, o = {}) {
    const pts = new Map();
    let start = { x: 0, y: 0 };
    let last = { x: 0, y: 0, t: 0 };
    let vx = 0;
    let vy = 0;
    let panning = false;
    let pinch = null;
    let pinchScaleNow = 1;
    let press;
    let pressed = false;
    let lastTap = -1e9;
    const th = o.threshold ?? 4;
    const dist = () => {
        const [a, b] = [...pts.values()];
        return Math.hypot(a.x - b.x, a.y - b.y);
    };
    const mid = () => {
        const [a, b] = [...pts.values()];
        return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    };
    const t = (e) => (e.timeStamp || Date.now());
    const down = (e) => {
        pts.set(pid(e), { x: e.clientX, y: e.clientY });
        try {
            el.setPointerCapture?.(pid(e));
        }
        catch { /* jsdom / synthetic */ }
        if (pts.size === 2 && h.onPinch) {
            clearTimeout(press);
            if (panning)
                h.onPan?.({ dx: last.x - start.x, dy: last.y - start.y, vx: 0, vy: 0, first: false, last: true, event: e });
            panning = false;
            pinch = { d0: dist(), first: true };
            return;
        }
        if (pts.size > 1)
            return;
        start = { x: e.clientX, y: e.clientY };
        last = { ...start, t: t(e) };
        vx = vy = 0;
        pressed = false;
        if (h.onLongPress)
            press = setTimeout(() => { pressed = true; h.onLongPress?.({ x: start.x, y: start.y }); }, o.longPress ?? 500);
    };
    const move = (e) => {
        if (!pts.has(pid(e)))
            return;
        pts.set(pid(e), { x: e.clientX, y: e.clientY });
        if (pinch && pts.size >= 2) {
            const m = mid();
            pinchScaleNow = pinchScale(pinch.d0, dist(), 1, 0.05, 20);
            h.onPinch?.({ scale: pinchScaleNow, x: m.x, y: m.y, first: pinch.first, last: false });
            pinch.first = false;
            return;
        }
        const dx = e.clientX - start.x;
        const dy = e.clientY - start.y;
        const dt = Math.max(1, t(e) - last.t) / 1000;
        vx = (e.clientX - last.x) / dt;
        vy = (e.clientY - last.y) / dt;
        last = { x: e.clientX, y: e.clientY, t: t(e) };
        if (!panning) {
            const off = o.axis === 'x' ? Math.abs(dx) : o.axis === 'y' ? Math.abs(dy) : Math.hypot(dx, dy);
            if (off < th)
                return;
            clearTimeout(press);
            if (o.axis && Math.abs(o.axis === 'x' ? dy : dx) > off) {
                pts.delete(pid(e));
                return;
            } // wrong axis: let the page scroll
            panning = true;
            h.onPan?.({ dx: o.axis === 'y' ? 0 : dx, dy: o.axis === 'x' ? 0 : dy, vx, vy, first: true, last: false, event: e });
            return;
        }
        if (e.cancelable)
            e.preventDefault();
        h.onPan?.({ dx: o.axis === 'y' ? 0 : dx, dy: o.axis === 'x' ? 0 : dy, vx, vy, first: false, last: false, event: e });
    };
    const up = (e) => {
        if (!pts.has(pid(e)))
            return;
        pts.delete(pid(e));
        clearTimeout(press);
        if (pinch) {
            if (pts.size < 2) {
                h.onPinch?.({ scale: pinchScaleNow, ...start, first: false, last: true });
                pinch = null;
                pts.clear();
            }
            return;
        }
        const dx = e.clientX - start.x;
        const dy = e.clientY - start.y;
        if (panning) {
            panning = false;
            if (t(e) - last.t > 80)
                vx = vy = 0; // paused before release
            h.onPan?.({ dx: o.axis === 'y' ? 0 : dx, dy: o.axis === 'x' ? 0 : dy, vx, vy, first: false, last: true, event: e });
            const s = swipeDirection(dx, dy, vx, vy, { distance: o.swipeDistance, velocity: o.swipeVelocity, axis: o.axis });
            if (s)
                h.onSwipe?.(s);
            return;
        }
        if (pressed || e.type === 'pointercancel')
            return;
        const p = { x: e.clientX, y: e.clientY };
        const n = t(e);
        if (h.onDoubleTap && n - lastTap < 300) {
            lastTap = -1e9;
            h.onDoubleTap(p);
            return;
        }
        lastTap = n;
        h.onTap?.(p);
    };
    const wheel = (e) => {
        if (!h.onPinch || o.wheelPinch === false || !e.ctrlKey)
            return;
        e.preventDefault();
        const s = Math.exp(-e.deltaY / 100);
        h.onPinch({ scale: s, x: e.clientX, y: e.clientY, first: true, last: true });
    };
    const opts = { passive: false };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move, opts);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('wheel', wheel, opts);
    if (o.axis && !el.style.touchAction)
        el.style.touchAction = o.axis === 'x' ? 'pan-y' : 'pan-x';
    else if (!o.axis && !el.style.touchAction && (h.onPan || h.onPinch))
        el.style.touchAction = 'none';
    return () => {
        clearTimeout(press);
        el.removeEventListener('pointerdown', down);
        el.removeEventListener('pointermove', move, opts);
        el.removeEventListener('pointerup', up);
        el.removeEventListener('pointercancel', up);
        el.removeEventListener('wheel', wheel, opts);
    };
}

var css = "usa-swipeable{display:block;touch-action:pan-y;user-select:none;-webkit-user-select:none}usa-swipeable[axis=\"y\"]{touch-action:pan-x}usa-swipeable>*{transform:translate3d(var(--usa-swipe,0px),0,0);opacity:calc(1 - var(--usa-swipe-p,0) * 0.5)}usa-swipeable[axis=\"y\"]>*{transform:translate3d(0,var(--usa-swipe,0px),0)}usa-swipeable:focus-visible{outline:2px solid currentColor;outline-offset:2px}usa-pinch-zoom{display:block;overflow:hidden;touch-action:none;position:relative}usa-pinch-zoom>*{transform:translate3d(var(--usa-zoom-x,0px),var(--usa-zoom-y,0px),0) scale(var(--usa-zoom,1));transform-origin:50% 50%}usa-pinch-zoom[data-zoomed]{cursor:grab}usa-pinch-zoom:focus-visible{outline:2px solid currentColor;outline-offset:2px}";

function defineSwipeable(tag = 'usa-swipeable') {
    return defineElement(tag, (Base) => class UsaSwipeable extends Base {
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
        put(v) {
            this._off = v;
            this.style.setProperty('--usa-swipe', `${v}px`);
            this.style.setProperty('--usa-swipe-p', String(Math.min(1, Math.abs(v) / this.num('distance', 120))));
        }
        swipe(direction) {
            if (!this.emit('swipe', { direction }))
                return this.reset();
            const sign = direction === 'left' || direction === 'up' ? -1 : 1;
            const far = sign * ((this.str('axis', 'x') === 'y' ? this.offsetHeight : this.offsetWidth) + 80 || 600);
            const done = () => {
                this.emit('dismiss', { direction });
                if (this.flag('dismiss'))
                    this.remove();
            };
            if (this.reduced) {
                this.put(0);
                return done();
            }
            this.setAttribute('data-gone', '');
            this._s = createSpring({ spring: 'stiff', value: this._off, onUpdate: (v) => this.put(v), onRest: done });
            this._s.set(far, sign * 1500);
        }
        reset() {
            this.removeAttribute('data-gone');
            if (this.reduced)
                return this.put(0);
            this._s.set(0);
        }
        mount() {
            this._s = createSpring({ spring: this.str('preset', 'default'), onUpdate: (v) => this.put(v) });
            if (!this.hasAttribute('tabindex'))
                this.tabIndex = 0;
            const y = this.str('axis', 'x') === 'y';
            const max = () => this.num('distance', 120);
            this.onCleanup(gesture(this, {
                onPan: ({ dx, dy, vx, vy, last }) => {
                    if (this.flag('disabled'))
                        return;
                    const d = y ? dy : dx;
                    if (!last) {
                        this._s.stop();
                        if (!this.reduced)
                            this.put(Math.abs(d) > max() ? Math.sign(d) * (max() + (Math.abs(d) - max()) * 0.35) : d);
                        return;
                    }
                    if (Math.abs(d) > max())
                        this.swipe(y ? (d > 0 ? 'down' : 'up') : d > 0 ? 'right' : 'left');
                    else if (!this.hasAttribute('data-gone')) {
                        if (this.reduced)
                            this.put(0);
                        else
                            this._s.set(0, y ? vy : vx);
                    }
                },
                onSwipe: ({ direction }) => {
                    if (this.flag('disabled') || this.hasAttribute('data-gone'))
                        return;
                    if (y === (direction === 'up' || direction === 'down'))
                        this.swipe(direction);
                },
            }, { axis: y ? 'y' : 'x' }));
            this.listen(this, 'keydown', (e) => {
                if (this.flag('disabled'))
                    return;
                const map = y ? { ArrowUp: 'up', ArrowDown: 'down' } : { ArrowLeft: 'left', ArrowRight: 'right' };
                if (e.key === 'Delete' || e.key === 'Backspace')
                    this.swipe(y ? 'up' : 'left');
                else if (map[e.key])
                    this.swipe(map[e.key]);
                else
                    return;
                e.preventDefault();
            });
        }
        unmount() {
            this._s?.stop();
        }
    }, { id: 'gesture', text: css });
}

function definePinchZoom(tag = 'usa-pinch-zoom') {
    return defineElement(tag, (Base) => class UsaPinchZoom extends Base {
        constructor() {
            super(...arguments);
            this._v = { k: 1, x: 0, y: 0 };
        }
        get scale() {
            return this._v.k;
        }
        paint() {
            const { k, x, y } = this._v;
            this.style.setProperty('--usa-zoom', String(k));
            this.style.setProperty('--usa-zoom-x', `${x}px`);
            this.style.setProperty('--usa-zoom-y', `${y}px`);
            this.toggleAttribute('data-zoomed', k > 1.01);
        }
        bound(k, x, y) {
            const w = (this.clientWidth * (k - 1)) / 2;
            const h = (this.clientHeight * (k - 1)) / 2;
            return { x: clamp(x, -w, w), y: clamp(y, -h, h) };
        }
        zoomTo(scale) {
            const k = clamp(scale, this.num('min', 1), this.num('max', 4));
            const b = this.bound(k, this._v.x, this._v.y);
            if (this.reduced) {
                this._v = { k, ...b };
                this.paint();
            }
            else {
                this._k.set(k);
                this._x.set(b.x);
                this._y.set(b.y);
            }
            this.emit('zoom', { scale: k });
        }
        mount() {
            const preset = this.str('preset', 'gentle');
            this._k = createSpring({ spring: preset, value: this._v.k, onUpdate: (v) => ((this._v.k = v), this.paint()) });
            this._x = createSpring({ spring: preset, value: this._v.x, onUpdate: (v) => ((this._v.x = v), this.paint()) });
            this._y = createSpring({ spring: preset, value: this._v.y, onUpdate: (v) => ((this._v.y = v), this.paint()) });
            if (!this.hasAttribute('tabindex'))
                this.tabIndex = 0;
            let base = 1;
            let ox = 0;
            let oy = 0;
            this.onCleanup(gesture(this, {
                onPinch: ({ scale, first, last }) => {
                    if (first)
                        base = this._v.k;
                    const k = clamp(base * scale, this.num('min', 1) * 0.7, this.num('max', 4) * 1.3);
                    if (last)
                        return this.zoomTo(k);
                    this._k.jump(k);
                },
                onPan: ({ dx, dy, vx, vy, first, last }) => {
                    if (this._v.k <= 1.01)
                        return;
                    if (first)
                        ((ox = this._v.x), (oy = this._v.y));
                    if (!last) {
                        this._x.jump(ox + dx);
                        this._y.jump(oy + dy);
                        return;
                    }
                    const b = this.bound(this._v.k, ox + dx + vx * 0.15, oy + dy + vy * 0.15);
                    this._x.set(b.x, vx);
                    this._y.set(b.y, vy);
                },
                onDoubleTap: () => this.zoomTo(this._v.k > 1.01 ? 1 : this.num('double-tap', 2)),
            }));
            this.listen(this, 'keydown', (e) => {
                if (e.key === '+' || e.key === '=')
                    this.zoomTo(this._v.k * 1.25);
                else if (e.key === '-')
                    this.zoomTo(this._v.k / 1.25);
                else if (e.key === '0')
                    this.zoomTo(1);
                else
                    return;
                e.preventDefault();
            });
            this.paint();
        }
        unmount() {
            [this._k, this._x, this._y].forEach((s) => s?.stop());
        }
    }, { id: 'gesture', text: css });
}

/**
 * use-scroll-animate/components/gesture — unified gestures (v3.2).
 * `gesture()` recognises pan, swipe, pinch, long-press, tap and double-tap
 * with release velocities for springs; `<usa-swipeable>` (swipe-to-dismiss)
 * and `<usa-pinch-zoom>` are built on it.
 */
/** Register every component of this category under its default tag. */
function defineGestureComponents() {
    defineSwipeable();
    definePinchZoom();
}

export { defineGestureComponents, definePinchZoom, defineSwipeable, gesture, pinchScale, swipeDirection };
//# sourceMappingURL=gesture.js.map
