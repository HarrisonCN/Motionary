'use strict';

var base = require('../chunks/base-B3me2y0o.cjs');
var spring = require('../chunks/spring-DcM7pQgx.cjs');
var core = require('../chunks/core-BdLFN0RS.cjs');

var css = "usa-swipeable{display:block;touch-action:pan-y;user-select:none;-webkit-user-select:none}usa-swipeable[axis=\"y\"]{touch-action:pan-x}usa-swipeable>*{transform:translate3d(var(--usa-swipe,0px),0,0);opacity:calc(1 - var(--usa-swipe-p,0) * 0.5)}usa-swipeable[axis=\"y\"]>*{transform:translate3d(0,var(--usa-swipe,0px),0)}usa-swipeable:focus-visible{outline:2px solid currentColor;outline-offset:2px}usa-pinch-zoom{display:block;overflow:hidden;touch-action:none;position:relative}usa-pinch-zoom>*{transform:translate3d(var(--usa-zoom-x,0px),var(--usa-zoom-y,0px),0) scale(var(--usa-zoom,1));transform-origin:50% 50%}usa-pinch-zoom[data-zoomed]{cursor:grab}usa-pinch-zoom:focus-visible{outline:2px solid currentColor;outline-offset:2px}";

function defineSwipeable(tag = 'usa-swipeable') {
    return base.defineElement(tag, (Base) => class UsaSwipeable extends Base {
        constructor() {
            super(...arguments);
            this._off = 0;
        }
        static get observedAttributes() {
            return ['axis', 'disabled', 'distance', 'dismiss', 'preset'];
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
            this._s = spring.createSpring({ spring: 'stiff', value: this._off, onUpdate: (v) => this.put(v), onRest: done });
            this._s.set(far, sign * 1500);
        }
        reset() {
            this.removeAttribute('data-gone');
            if (this.reduced)
                return this.put(0);
            this._s.set(0);
        }
        mount() {
            this._s = spring.createSpring({ spring: this.str('preset', 'default'), onUpdate: (v) => this.put(v) });
            if (!this.hasAttribute('tabindex'))
                this.tabIndex = 0;
            const y = this.str('axis', 'x') === 'y';
            const max = () => this.num('distance', 120);
            this.onCleanup(core.gesture(this, {
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
    return base.defineElement(tag, (Base) => class UsaPinchZoom extends Base {
        constructor() {
            super(...arguments);
            this._v = { k: 1, x: 0, y: 0 };
        }
        static get observedAttributes() {
            return ['min', 'max', 'preset', 'double-tap'];
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
            return { x: base.clamp(x, -w, w), y: base.clamp(y, -h, h) };
        }
        zoomTo(scale) {
            const k = base.clamp(scale, this.num('min', 1), this.num('max', 4));
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
            this._k = spring.createSpring({ spring: preset, value: this._v.k, onUpdate: (v) => ((this._v.k = v), this.paint()) });
            this._x = spring.createSpring({ spring: preset, value: this._v.x, onUpdate: (v) => ((this._v.x = v), this.paint()) });
            this._y = spring.createSpring({ spring: preset, value: this._v.y, onUpdate: (v) => ((this._v.y = v), this.paint()) });
            if (!this.hasAttribute('tabindex'))
                this.tabIndex = 0;
            let base$1 = 1;
            let ox = 0;
            let oy = 0;
            this.onCleanup(core.gesture(this, {
                onPinch: ({ scale, first, last }) => {
                    if (first)
                        base$1 = this._v.k;
                    const k = base.clamp(base$1 * scale, this.num('min', 1) * 0.7, this.num('max', 4) * 1.3);
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
 * motionary/components/gesture — unified gestures (v3.2).
 * `gesture()` recognises pan, swipe, pinch, long-press, tap and double-tap
 * with release velocities for springs; `<usa-swipeable>` (swipe-to-dismiss)
 * and `<usa-pinch-zoom>` are built on it.
 */
/** Register every component of this category under its default tag. */
function defineGestureComponents() {
    defineSwipeable();
    definePinchZoom();
}

exports.gesture = core.gesture;
exports.pinchScale = core.pinchScale;
exports.swipeDirection = core.swipeDirection;
exports.defineGestureComponents = defineGestureComponents;
exports.definePinchZoom = definePinchZoom;
exports.defineSwipeable = defineSwipeable;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.2.0/dist/components/gesture.cjs.map