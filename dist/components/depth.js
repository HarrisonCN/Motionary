import { f as defineElement, d as clamp, r as raf, b as caf } from '../chunks/base-zSGb8ujt.js';
import { c as createSpring } from '../chunks/spring-CznnvQCN.js';
import { g as gesture } from '../chunks/core-BcQb_f91.js';

var css = "usa-cube{--usa-cube-size:200px;display:block;width:var(--usa-cube-size);height:var(--usa-cube-size);perspective:var(--usa-cube-perspective,900px);touch-action:pan-y;user-select:none;-webkit-user-select:none;position:relative}usa-cube>[data-face]{position:absolute;inset:0;backface-visibility:hidden;transform:translateZ(calc(var(--usa-cube-size) / -2)) rotateX(var(--usa-cube-rx,0deg)) rotateY(var(--usa-cube-ry,0deg)) var(--usa-face) translateZ(calc(var(--usa-cube-size) / 2));transform-origin:50% 50%}usa-cube>[data-face=\"front\"]{--usa-face:rotateY(0deg)}usa-cube>[data-face=\"right\"]{--usa-face:rotateY(90deg)}usa-cube>[data-face=\"back\"]{--usa-face:rotateY(180deg)}usa-cube>[data-face=\"left\"]{--usa-face:rotateY(-90deg)}usa-cube>[data-face=\"top\"]{--usa-face:rotateX(90deg)}usa-cube>[data-face=\"bottom\"]{--usa-face:rotateX(-90deg)}usa-cube:focus-visible{outline:2px solid currentColor;outline-offset:6px}usa-depth{display:block;position:relative;perspective:1000px}usa-depth>*{transform:var(--usa-depth-rot,none);transform-style:preserve-3d}usa-depth [data-depth]{will-change:transform;transition:transform 0.12s linear}@media (prefers-reduced-motion:reduce){usa-depth [data-depth]{transform:none !important}}";

const FACES = ['front', 'right', 'back', 'left', 'top', 'bottom'];
/** Rotation (deg) that brings each face to the front. */
const ROT = { front: [0, 0], right: [0, -90], back: [0, -180], left: [0, 90], top: [-90, 0], bottom: [90, 0] };
function defineCube(tag = 'usa-cube') {
    return defineElement(tag, (Base) => class UsaCube extends Base {
        constructor() {
            super(...arguments);
            this._i = 0;
            this._base = [0, 0];
        }
        static get observedAttributes() {
            return ['size', 'autoplay', 'perspective'];
        }
        get index() {
            return this._i;
        }
        faces() {
            return Array.from(this.children).filter((c) => c instanceof HTMLElement && !c.hasAttribute('slot')).slice(0, 6);
        }
        paint() {
            this.style.setProperty('--usa-cube-rx', `${this._rx.value}deg`);
            this.style.setProperty('--usa-cube-ry', `${this._ry.value}deg`);
        }
        show(face) {
            const n = this.faces().length || 1;
            const i = typeof face === 'number' ? ((face % n) + n) % n : Math.max(0, FACES.indexOf(face));
            this._i = i;
            const [rx, ry] = ROT[FACES[i]];
            // take the shortest way round on Y
            const cur = this._ry.target;
            const ty = ry + Math.round((cur - ry) / 360) * 360;
            this._base = [rx, ty];
            if (this.reduced) {
                this._rx.jump(rx);
                this._ry.jump(ty);
            }
            else {
                this._rx.set(rx);
                this._ry.set(ty);
            }
            this.faces().forEach((f, j) => f.setAttribute('aria-hidden', String(j !== i)));
            this.emit('change', { index: i, face: FACES[i] });
        }
        next() {
            this.show(this._i + 1);
        }
        prev() {
            this.show(this._i - 1);
        }
        mount() {
            this.style.setProperty('--usa-cube-size', `${this.num('size', 200)}px`);
            this.style.setProperty('--usa-cube-perspective', `${this.num('perspective', 900)}px`);
            this.faces().forEach((f, j) => f.setAttribute('data-face', FACES[j]));
            if (!this.hasAttribute('tabindex'))
                this.tabIndex = 0;
            if (!this.hasAttribute('role'))
                this.setAttribute('role', 'region');
            if (!this.hasAttribute('aria-roledescription'))
                this.setAttribute('aria-roledescription', 'cube');
            this._rx = createSpring({ spring: 'gentle', onUpdate: () => this.paint() });
            this._ry = createSpring({ spring: 'gentle', onUpdate: () => this.paint() });
            this.show(this._i);
            this.paint();
            this.onCleanup(gesture(this, {
                onPan: ({ dx, dy, last }) => {
                    if (this.reduced)
                        return;
                    if (!last) {
                        this._ry.jump(this._base[1] + dx * 0.5);
                        this._rx.jump(this._base[0] - dy * 0.5);
                        return;
                    }
                    if (Math.abs(dx) > 40 && Math.abs(dx) >= Math.abs(dy))
                        return dx < 0 ? this.next() : this.prev();
                    if (Math.abs(dy) > 40 && this.faces().length > 4)
                        return this.show(dy < 0 ? 'bottom' : 'top');
                    this.show(this._i);
                },
            }));
            this.listen(this, 'keydown', (e) => {
                const k = { ArrowRight: () => this.next(), ArrowLeft: () => this.prev(), ArrowUp: () => this.show('bottom'), ArrowDown: () => this.show('top'), Home: () => this.show(0) };
                if (!k[e.key] || ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && this.faces().length < 6))
                    return;
                e.preventDefault();
                k[e.key]();
            });
            const ms = this.num('autoplay', 0);
            if (ms > 0 && !this.reduced) {
                let paused = false;
                const id = setInterval(() => !paused && this.show((this._i + 1) % Math.min(4, this.faces().length || 1)), ms);
                this.listen(this, 'pointerenter', () => (paused = true));
                this.listen(this, 'pointerleave', () => (paused = false));
                this.listen(this, 'focusin', () => (paused = true));
                this.listen(this, 'focusout', () => (paused = false));
                this.onCleanup(() => clearInterval(id));
            }
        }
        unmount() {
            this._rx?.stop();
            this._ry?.stop();
        }
    }, { id: 'depth', text: css });
}

/** Map a DeviceOrientation reading (beta/gamma degrees) to -1…1 tilt around a resting pose (pure). */
function orientationToTilt(beta, gamma, range = 30, rest = 45) {
    return {
        x: clamp((gamma ?? 0) / range, -1, 1),
        y: clamp(((beta ?? rest) - rest) / range, -1, 1),
    };
}
/** `true` when DeviceOrientation events exist. */
const supportsOrientation = () => typeof window !== 'undefined' && 'DeviceOrientationEvent' in window;
/**
 * Ask for motion-sensor permission where required (iOS 13+; must run inside
 * a user gesture). Resolves `true` when tilt events can be used.
 */
async function requestOrientationPermission() {
    if (!supportsOrientation())
        return false;
    const D = window.DeviceOrientationEvent;
    if (typeof D.requestPermission !== 'function')
        return true;
    try {
        return (await D.requestPermission()) === 'granted';
    }
    catch {
        return false;
    }
}
/**
 * Listen to device tilt (smoothed); falls back to nothing on desktops.
 * Returns a stop function.
 */
function deviceTilt(cb, o = {}) {
    if (!supportsOrientation())
        return () => { };
    let cur = { x: 0, y: 0 };
    const k = 1 - clamp(o.smooth ?? 0.2, 0, 0.95);
    const on = (e) => {
        const t = orientationToTilt(e.beta, e.gamma, o.range ?? 30);
        cur = { x: cur.x + (t.x - cur.x) * k, y: cur.y + (t.y - cur.y) * k };
        cb(cur);
    };
    window.addEventListener('deviceorientation', on);
    return () => window.removeEventListener('deviceorientation', on);
}

function defineDepth(tag = 'usa-depth') {
    return defineElement(tag, (Base) => class UsaDepth extends Base {
        constructor() {
            super(...arguments);
            this._t = { x: 0, y: 0 };
            this._id = 0;
        }
        static get observedAttributes() {
            return ['source', 'strength', 'rotate'];
        }
        get tilt() {
            return { ...this._t };
        }
        requestPermission() {
            return requestOrientationPermission().then((ok) => {
                if (ok) {
                    this.changed('source');
                }
                return ok;
            });
        }
        apply() {
            this._id = 0;
            const s = this.num('strength', 40);
            const r = this.num('rotate', 0);
            const { x, y } = this._t;
            this.style.setProperty('--usa-depth-x', x.toFixed(4));
            this.style.setProperty('--usa-depth-y', y.toFixed(4));
            if (r)
                this.style.setProperty('--usa-depth-rot', `rotateX(${(-y * r).toFixed(2)}deg) rotateY(${(x * r).toFixed(2)}deg)`);
            this.querySelectorAll('[data-depth]').forEach((el) => {
                const d = clamp(Number(el.dataset.depth) || 0, -1, 1);
                el.style.transform = `translate3d(${(x * d * s).toFixed(2)}px, ${(y * d * s).toFixed(2)}px, 0) scale(${(1 + d * 0.04).toFixed(4)})`;
            });
        }
        set(x, y) {
            this._t = { x: clamp(x, -1, 1), y: clamp(y, -1, 1) };
            if (!this._id)
                this._id = raf(() => this.apply());
        }
        mount() {
            if (this.reduced)
                return;
            const src = this.str('source', 'pointer').split(/\s+/);
            if (src.includes('pointer')) {
                this.listen(this, 'pointermove', (e) => {
                    const r = this.getBoundingClientRect();
                    this.set(((e.clientX - r.left) / (r.width || 1)) * 2 - 1, ((e.clientY - r.top) / (r.height || 1)) * 2 - 1);
                });
                this.listen(this, 'pointerleave', () => this.set(0, 0));
            }
            if (src.includes('orientation') && supportsOrientation())
                this.onCleanup(deviceTilt((t) => this.set(t.x, t.y)));
            if (src.includes('scroll')) {
                const on = () => {
                    const r = this.getBoundingClientRect();
                    const vh = window.innerHeight || 1;
                    this.set(this._t.x, clamp(((r.top + r.height / 2) / vh) * 2 - 1, -1, 1));
                };
                this.listen(window, 'scroll', on, { passive: true });
                on();
            }
            this.onCleanup(() => {
                caf(this._id);
                this._id = 0;
            });
        }
        unmount() {
            this._t = { x: 0, y: 0 };
            this.querySelectorAll('[data-depth]').forEach((el) => (el.style.transform = ''));
        }
    }, { id: 'depth', text: css });
}

/**
 * motionary/components/depth — 3D (v3.5).
 * `<usa-cube>` (CSS 3D cube), `<usa-depth>` (layered depth parallax driven by
 * pointer, device orientation or scroll) and `deviceTilt()`. The 3D ring
 * carousel is `<usa-carousel-3d>` in `components/cards`.
 */
/** Register every component of this category under its default tag. */
function defineDepthComponents() {
    defineCube();
    defineDepth();
}

export { defineCube, defineDepth, defineDepthComponents, deviceTilt, orientationToTilt, requestOrientationPermission, supportsOrientation };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.3.0/dist/components/depth.js.map