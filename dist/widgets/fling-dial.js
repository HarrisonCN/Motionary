import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { m as make } from '../chunks/moments-Cg_NlOYG.js';
import { h as hostSprings, t as tick } from '../chunks/micro-kit-16-DrJflWG2.js';
import { v as css, p as parseDialOptions, a as detentRotation, b as dialAngle, c as dialDelta, e as dialRest, d as detentAt } from '../chunks/snap-kit-20-0ruReijY.js';

const NS = 'http://www.w3.org/2000/svg';
function defineFlingDial(tag = 'usa-fling-dial') {
    const ctor = defineElement(tag, (Base) => class FlingDial extends Base {
        constructor() {
            super(...arguments);
            this._index = 0;
            this._opts = parseDialOptions('');
            this._go = null;
        }
        static get observedAttributes() {
            return ['options', 'value', 'label', 'disabled', 'feel', 'haptics'];
        }
        get options() {
            return this._opts.slice();
        }
        get index() {
            return this._index;
        }
        set index(v) {
            const n = this._opts.length;
            const i = ((Math.round(Number(v) || 0) % n) + n) % n;
            if (this._go)
                this._go(i, false);
            else
                this._index = i;
        }
        get value() {
            return this._opts[this._index] ?? '';
        }
        set value(v) {
            const i = this._opts.indexOf(String(v));
            if (i >= 0)
                this.index = i;
        }
        mount() {
            const opts = (this._opts = parseDialOptions(this.getAttribute('options')));
            const n = opts.length;
            const step = 360 / n;
            const attr = this.getAttribute('value');
            if (attr !== this._seen) {
                this._seen = attr;
                this._index = Math.max(0, opts.indexOf(this.str('value', opts[0])));
            }
            this._index = Math.min(n - 1, Math.max(0, this._index));
            const off = this.flag('disabled');
            const root = make('div', 'usa-snkit usa-fdial');
            root.toggleAttribute('data-disabled', off);
            const wheel = make('div', 'usa-fdial-wheel');
            wheel.setAttribute('role', 'slider');
            wheel.setAttribute('aria-label', this.str('label', 'Dial'));
            wheel.setAttribute('aria-valuemin', '0');
            wheel.setAttribute('aria-valuemax', String(n - 1));
            wheel.tabIndex = off ? -1 : 0;
            if (off)
                wheel.setAttribute('aria-disabled', 'true');
            const face = make('div', 'usa-fdial-face');
            const svg = document.createElementNS(NS, 'svg');
            svg.setAttribute('viewBox', '0 0 100 100');
            svg.setAttribute('aria-hidden', 'true');
            // a long tick on every option, short ones between when there is room
            const minor = n <= 12 ? 4 : n <= 24 ? 1 : 0;
            for (let i = 0; i < n * (minor + 1); i++) {
                const a = ((i * step) / (minor + 1) - 90) * (Math.PI / 180);
                const isMajor = i % (minor + 1) === 0;
                const r0 = isMajor ? 41 : 44;
                const line = document.createElementNS(NS, 'line');
                line.setAttribute('class', 'usa-fdial-tick');
                if (isMajor)
                    line.setAttribute('data-major', '');
                line.setAttribute('x1', String(Math.round((50 + r0 * Math.cos(a)) * 100) / 100));
                line.setAttribute('y1', String(Math.round((50 + r0 * Math.sin(a)) * 100) / 100));
                line.setAttribute('x2', String(Math.round((50 + 47.5 * Math.cos(a)) * 100) / 100));
                line.setAttribute('y2', String(Math.round((50 + 47.5 * Math.sin(a)) * 100) / 100));
                svg.append(line);
            }
            face.append(svg);
            const labels = opts.map((o, i) => {
                const s = make('span', 'usa-fdial-opt', o);
                s.setAttribute('aria-hidden', 'true');
                s.style.transform = `translate(-50%, -50%) rotate(${Math.round(i * step * 100) / 100}deg) translateY(calc(var(--usa-dial-size, 220px) * -0.33))`;
                face.append(s);
                return s;
            });
            const hub = make('div', 'usa-fdial-hub');
            hub.setAttribute('aria-hidden', 'true');
            const mark = make('div', 'usa-fdial-mark');
            wheel.append(face, hub);
            root.append(wheel, mark);
            this.append(root);
            let shown = -1;
            const paint = (i) => {
                if (i === shown)
                    return;
                if (shown >= 0)
                    labels[shown]?.removeAttribute('data-on');
                shown = i;
                labels[i]?.setAttribute('data-on', '');
                hub.textContent = opts[i];
                wheel.setAttribute('aria-valuenow', String(i));
                wheel.setAttribute('aria-valuetext', opts[i]);
            };
            let drag = null;
            const group = hostSprings(this, { r: detentRotation(this._index, n) }, (v) => {
                face.style.transform = `rotate(${Math.round(v.r * 100) / 100}deg)`;
                if (drag?.live) {
                    const i = detentAt(v.r, n);
                    if (i !== shown) {
                        paint(i);
                        tick(this, 5);
                        this.emit('input', { value: opts[i], index: i });
                    }
                }
            });
            const go = (i, user, velocity = 0, rest) => {
                const to = ((Math.round(i) % n) + n) % n;
                const changed = to !== this._index;
                this._index = to;
                paint(to);
                const target = rest ?? detentRotation(to, n, group.get('r'));
                group.set({ r: target }, { spring: { duration: 620, bounce: 0.3 }, velocity: velocity ? { r: velocity } : undefined });
                if (changed) {
                    if (user)
                        tick(this, 10);
                    this.emit('change', { value: opts[to], index: to });
                }
            };
            this._go = (i, user, velocity) => go(i, user, velocity);
            paint(this._index);
            group.jump({ r: detentRotation(this._index, n) });
            this.listen(wheel, 'keydown', (e) => {
                if (off)
                    return;
                const i = this._index;
                const keys = { ArrowRight: i + 1, ArrowUp: i + 1, ArrowLeft: i - 1, ArrowDown: i - 1, Home: 0, End: n - 1 };
                if (!(e.key in keys))
                    return;
                e.preventDefault();
                go(keys[e.key], true);
            });
            this.listen(wheel, 'pointerdown', (e) => {
                if (off || (e.pointerType === 'mouse' && e.button !== 0))
                    return;
                const rect = wheel.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                drag = { id: e.pointerId, cx, cy, a: dialAngle(e.clientX, e.clientY, cx, cy), x0: e.clientX, y0: e.clientY, last: group.get('r'), t: e.timeStamp, v: 0, live: false };
                try {
                    wheel.setPointerCapture?.(e.pointerId);
                }
                catch {
                    /* synthetic */
                }
            });
            this.listen(wheel, 'pointermove', (e) => {
                if (!drag || e.pointerId !== drag.id)
                    return;
                if (!drag.live) {
                    if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 5)
                        return;
                    drag.live = true;
                    root.setAttribute('data-dragging', '');
                    // a grab stops a spinning dial where it is
                    group.jump({ r: group.get('r') });
                    drag.last = group.get('r');
                }
                // close to the centre the angle jumps about: wait for the finger to move out
                if (Math.hypot(e.clientX - drag.cx, e.clientY - drag.cy) < 12)
                    return;
                const a = dialAngle(e.clientX, e.clientY, drag.cx, drag.cy);
                const r = drag.last + dialDelta(drag.a, a);
                const dt = Math.max(1, e.timeStamp - drag.t);
                drag.v = drag.v * 0.35 + (((r - drag.last) / dt) * 1000) * 0.65;
                drag.a = a;
                drag.last = r;
                drag.t = e.timeStamp;
                group.jump({ r });
            });
            const end = (e) => {
                if (!drag || e.pointerId !== drag.id)
                    return;
                const d = drag;
                drag = null;
                root.removeAttribute('data-dragging');
                if (!d.live) {
                    // a tap on the rim turns to the option there
                    if (e.type === 'pointerup' && Math.hypot(e.clientX - d.cx, e.clientY - d.cy) > 12) {
                        const at = dialAngle(e.clientX, e.clientY, d.cx, d.cy);
                        go(Math.round((at - group.get('r')) / step), true);
                    }
                    return;
                }
                const v = e.timeStamp - d.t > 90 ? 0 : d.v;
                const rest = dialRest(group.get('r'), v, n);
                go(detentAt(rest, n), true, v, rest);
            };
            this.listen(wheel, 'pointerup', end);
            this.listen(wheel, 'pointercancel', end);
            this.onCleanup(() => {
                group.stop();
                root.remove();
                this._go = null;
            });
        }
    }, { id: 'snap-kit-20', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineFlingDial };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/widgets/fling-dial.js.map