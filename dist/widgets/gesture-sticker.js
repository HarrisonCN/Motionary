import { f as defineElement, d as clamp } from '../chunks/base-zSGb8ujt.js';
import { pinchAngle, pinchScale } from '../components/fx-gesture.js';
import '../chunks/registry-CYojuxi5.js';

var css = "usa-gesture-sticker{display:inline-block;touch-action:none;cursor:grab;outline:none;-webkit-user-select:none;user-select:none;transform-origin:50% 50%;filter:drop-shadow(0 6px 8px rgba(15,23,42,.25));will-change:transform}usa-gesture-sticker[data-held]{cursor:grabbing;filter:drop-shadow(0 16px 18px rgba(15,23,42,.35))}usa-gesture-sticker:focus-visible{outline:2px dashed #6366f1;outline-offset:4px}usa-gesture-sticker img{display:block;-webkit-user-drag:none;pointer-events:none}";

function defineGestureSticker(tag = 'usa-gesture-sticker') {
    return defineElement(tag, (Base) => {
        class UsaGestureSticker extends Base {
            constructor() {
                super(...arguments);
                this._st = { x: 0, y: 0, scale: 1, angle: 0 };
            }
            static get observedAttributes() {
                return ['min', 'max', 'label'];
            }
            get x() {
                return this._st.x;
            }
            get y() {
                return this._st.y;
            }
            get scale() {
                return this._st.scale;
            }
            get angle() {
                return this._st.angle;
            }
            mount() {
                this.setAttribute('role', 'group');
                this.setAttribute('aria-roledescription', 'sticker');
                this.setAttribute('aria-label', `${this.str('label', 'Sticker')} — drag, pinch or twist; arrows, + / −, [ / ] on the keyboard`);
                if (!this.hasAttribute('tabindex'))
                    this.tabIndex = 0;
                const pts = new Map();
                let start = null;
                const begin = () => {
                    const v = [...pts.values()];
                    start = v.length ? { st: { ...this._st }, a: v[0], b: v[1] } : null;
                    this.setFlag('data-held', v.length > 0);
                };
                this.listen(this, 'pointerdown', (e) => {
                    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
                    try {
                        this.setPointerCapture?.(e.pointerId);
                    }
                    catch {
                        /* synthetic */
                    }
                    begin();
                });
                this.listen(this, 'pointermove', (e) => {
                    if (!pts.has(e.pointerId) || !start)
                        return;
                    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
                    const v = [...pts.values()];
                    const s0 = start.st;
                    if (v.length >= 2 && start.b) {
                        const mx = (v[0].x + v[1].x - start.a.x - start.b.x) / 2;
                        const my = (v[0].y + v[1].y - start.a.y - start.b.y) / 2;
                        this.set({ x: s0.x + mx, y: s0.y + my, scale: s0.scale * pinchScale(start.a, start.b, v[0], v[1]), angle: s0.angle + pinchAngle(start.a, start.b, v[0], v[1]) }, false);
                    }
                    else
                        this.set({ ...s0, x: s0.x + v[0].x - start.a.x, y: s0.y + v[0].y - start.a.y }, false);
                });
                const up = (e) => {
                    pts.delete(e.pointerId);
                    begin();
                    if (!pts.size)
                        this.settle();
                };
                this.listen(this, 'pointerup', up);
                this.listen(this, 'pointercancel', up);
                this.listen(this, 'wheel', (e) => {
                    e.preventDefault();
                    if (e.shiftKey)
                        this.set({ ...this._st, angle: this._st.angle + (e.deltaY > 0 ? 8 : -8) }, true);
                    else
                        this.set({ ...this._st, scale: this._st.scale * (e.deltaY < 0 ? 1.1 : 1 / 1.1) }, true);
                }, { passive: false });
                this.listen(this, 'keydown', (e) => {
                    const s = { ...this._st };
                    const k = e.key;
                    if (k === 'ArrowLeft')
                        s.x -= 10;
                    else if (k === 'ArrowRight')
                        s.x += 10;
                    else if (k === 'ArrowUp')
                        s.y -= 10;
                    else if (k === 'ArrowDown')
                        s.y += 10;
                    else if (k === '+' || k === '=')
                        s.scale *= 1.15;
                    else if (k === '-')
                        s.scale /= 1.15;
                    else if (k === '[')
                        s.angle -= 15;
                    else if (k === ']')
                        s.angle += 15;
                    else if (k === '0')
                        return void (e.preventDefault(), this.reset());
                    else
                        return;
                    e.preventDefault();
                    this.set(s, true);
                });
                this.set(this._st, false, true);
            }
            settle() {
                if (this.reduced)
                    return;
                this.motion(this, [{ filter: 'brightness(1.08)' }, { filter: 'none' }], { duration: 300 });
            }
            set(s, ease, silent = false) {
                const min = Math.max(0.1, this.num('min', 0.5));
                const max = Math.max(min, this.num('max', 3));
                const n = { x: Math.round(s.x * 10) / 10, y: Math.round(s.y * 10) / 10, scale: Math.round(clamp(s.scale, min, max) * 1000) / 1000, angle: Math.round((((s.angle % 360) + 540) % 360 - 180) * 10) / 10 };
                this._st = n;
                this.style.transition = ease && !this.reduced ? 'transform .35s cubic-bezier(.3,1.4,.5,1)' : 'none';
                this.style.transform = `translate(${n.x}px,${n.y}px) rotate(${n.angle}deg) scale(${n.scale})`;
                if (!silent)
                    this.emit('transform', { ...n });
            }
            transformTo(s) {
                this.set({ ...this._st, ...s }, true);
            }
            reset() {
                this.set({ x: 0, y: 0, scale: 1, angle: 0 }, true);
            }
        }
        return UsaGestureSticker;
    }, { id: 'gesture-sticker', text: css });
}

export { defineGestureSticker };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.2.0/dist/widgets/gesture-sticker.js.map