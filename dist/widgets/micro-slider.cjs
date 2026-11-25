'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var microKit16$1 = require('../chunks/micro-kit-16-QpCvprq4.cjs');
var microKit16 = require('../chunks/micro-kit-16-CPdfvyga.cjs');

function defineMicroSlider(tag = 'usa-micro-slider') {
    const ctor = base.defineElement(tag, (Base) => class MicroSlider extends Base {
        constructor() {
            super(...arguments);
            this._value = NaN;
            this._set = null;
        }
        static get observedAttributes() {
            return ['min', 'max', 'step', 'value', 'label', 'unit', 'name', 'disabled', 'feel', 'haptics'];
        }
        get value() {
            return this._value;
        }
        set value(v) {
            if (this._set)
                this._set(Number(v));
            else
                this._value = Number(v);
        }
        mount() {
            let min = this.num('min', 0);
            let max = this.num('max', 100);
            if (max < min)
                [min, max] = [max, min];
            const step = Math.max(0, this.num('step', 1));
            const attr = this.getAttribute('value');
            if (attr !== this._seen) {
                this._seen = attr;
                this._value = this.num('value', (min + max) / 2);
            }
            this._value = microKit16$1.valueAt(microKit16$1.fraction(Number.isFinite(this._value) ? this._value : (min + max) / 2, min, max), min, max, step);
            const unit = this.str('unit');
            const disabled = this.flag('disabled');
            const root = moments.make('div', 'usa-mkit usa-mslider');
            const track = moments.make('div', 'usa-mslider-track');
            const fill = moments.make('div', 'usa-mslider-fill');
            const thumb = moments.make('div', 'usa-mslider-thumb');
            const bubble = moments.make('span', 'usa-mslider-bubble');
            bubble.setAttribute('aria-hidden', 'true');
            thumb.append(bubble);
            thumb.setAttribute('role', 'slider');
            thumb.tabIndex = disabled ? -1 : 0;
            thumb.setAttribute('aria-label', this.str('label', 'Value'));
            thumb.setAttribute('aria-valuemin', String(min));
            thumb.setAttribute('aria-valuemax', String(max));
            if (disabled)
                thumb.setAttribute('aria-disabled', 'true');
            track.append(fill, thumb);
            root.append(track);
            root.toggleAttribute('data-disabled', disabled);
            const hidden = this.str('name') ? moments.make('input') : null;
            if (hidden) {
                hidden.type = 'hidden';
                hidden.name = this.str('name');
                root.append(hidden);
            }
            this.append(root);
            const dir = typeof getComputedStyle === 'function' && getComputedStyle(this).direction === 'rtl' ? -1 : 1;
            let width = 0;
            const measure = () => (width = track.getBoundingClientRect().width || width || 200);
            const group = microKit16$1.hostSprings(this, { t: microKit16$1.fraction(this._value, min, max), o: 0, b: 0 }, (v) => {
                const t = Math.min(1, Math.max(0, v.t));
                const pct = `${Math.round(t * 10000) / 100}%`;
                thumb.style.insetInlineStart = pct;
                fill.style.width = pct;
                const w = width || 200;
                const o = v.o;
                if (Math.abs(o) > 0.05) {
                    track.style.transformOrigin = (o > 0) === (dir > 0) ? 'left center' : 'right center';
                    track.style.transform = `scaleX(${Math.round((1 + Math.abs(o) / w) * 10000) / 10000}) translateX(0)`;
                }
                else
                    track.style.transform = '';
                const sq = microKit16$1.stretch(group.velocity('t') * w, 0.28);
                thumb.style.setProperty('--sx', String(Math.round((1 + sq) * 1000) / 1000));
                thumb.style.setProperty('--sy', String(Math.round((1 - sq * 0.6) * 1000) / 1000));
                const b = Math.max(0, v.b);
                bubble.style.transform = `translate(-50%, ${microKit16$1.px(-6 - b * 6)}) scale(${Math.round(b * 1000) / 1000})`;
                bubble.style.opacity = String(Math.min(1, b));
            });
            const text = (n) => `${n}${unit ? (/^[%°]/.test(unit) ? unit : ` ${unit}`) : ''}`;
            const paintValue = () => {
                thumb.setAttribute('aria-valuenow', String(this._value));
                thumb.setAttribute('aria-valuetext', text(this._value));
                bubble.textContent = text(this._value);
                if (hidden)
                    hidden.value = String(this._value);
            };
            paintValue();
            const commit = (n, emit) => {
                const next = microKit16$1.valueAt(microKit16$1.fraction(n, min, max), min, max, step);
                const changed = next !== this._value;
                this._value = next;
                paintValue();
                if (changed && emit !== 'change')
                    this.emit('input', { value: next });
                if (changed && step >= (max - min) / 40)
                    microKit16$1.tick(this, 4);
                if (emit !== 'input' && (changed || emit === 'change'))
                    this.emit('change', { value: next });
                return changed;
            };
            this._set = (n) => {
                if (!Number.isFinite(n))
                    return;
                commit(n, 'input');
                group.set({ t: microKit16$1.fraction(this._value, min, max) }, { spring: 'snappy' });
            };
            let drag = null;
            const posAt = (clientX) => {
                const r = track.getBoundingClientRect();
                const w = r.width || width || 200;
                const raw = dir > 0 ? (clientX - r.left) / w : (r.right - clientX) / w;
                return raw;
            };
            this.listen(root, 'pointerdown', (e) => {
                if (disabled || (e.pointerType === 'mouse' && e.button !== 0))
                    return;
                measure();
                e.preventDefault();
                thumb.focus({ preventScroll: true });
                drag = { id: e.pointerId, start: this._value, moved: false };
                try {
                    root.setPointerCapture?.(e.pointerId);
                }
                catch {
                    /* synthetic */
                }
                const raw = posAt(e.clientX);
                group.set({ t: Math.min(1, Math.max(0, raw)), b: 1 }, { spring: 'snappy' });
                commit(min + Math.min(1, Math.max(0, raw)) * (max - min), 'input');
                root.setAttribute('data-active', '');
            });
            this.listen(root, 'pointermove', (e) => {
                if (!drag || e.pointerId !== drag.id)
                    return;
                drag.moved = true;
                const raw = posAt(e.clientX);
                const inside = Math.min(1, Math.max(0, raw));
                group.set({ t: inside }, { spring: 'drag' });
                group.jump({ o: microKit16$1.overdrag(raw * (width || 200), 0, width || 200, Math.max(60, (width || 200) * 0.5)) });
                commit(min + inside * (max - min), 'input');
            });
            const end = (e) => {
                if (!drag || e.pointerId !== drag.id)
                    return;
                const start = drag.start;
                drag = null;
                root.removeAttribute('data-active');
                group.set({ t: microKit16$1.fraction(this._value, min, max) }, { spring: 'settle' });
                group.set({ o: 0 }, { spring: 'elastic' });
                group.set({ b: document.activeElement === thumb && thumb.matches?.(':focus-visible') ? 1 : 0 }, { spring: 'smooth' });
                if (this._value !== start)
                    this.emit('change', { value: this._value });
            };
            this.listen(root, 'pointerup', end);
            this.listen(root, 'pointercancel', end);
            this.listen(thumb, 'keydown', (e) => {
                if (disabled)
                    return;
                const unitStep = step > 0 ? step : (max - min) / 100;
                const back = dir > 0 ? 'ArrowLeft' : 'ArrowRight';
                const fwd = dir > 0 ? 'ArrowRight' : 'ArrowLeft';
                const moves = {
                    [fwd]: unitStep, ArrowUp: unitStep, [back]: -unitStep, ArrowDown: -unitStep,
                    PageUp: unitStep * 10, PageDown: -unitStep * 10, Home: -Infinity, End: Infinity,
                };
                if (!(e.key in moves))
                    return;
                e.preventDefault();
                measure();
                const d = moves[e.key];
                const target = d === Infinity ? max : d === -Infinity ? min : this._value + d;
                if ((target < min && this._value <= min) || (target > max && this._value >= max)) {
                    // pushing against an end: a small rubber bump
                    group.impulse({ o: (target < min ? -1 : 1) * 160 }, 'elastic');
                    return;
                }
                if (commit(Math.min(max, Math.max(min, target)), 'both'))
                    group.set({ t: microKit16$1.fraction(this._value, min, max) }, { spring: 'snappy' });
            });
            this.listen(thumb, 'focus', () => {
                try {
                    if (thumb.matches(':focus-visible'))
                        group.set({ b: 1 }, { spring: 'pop' });
                }
                catch {
                    /* old engines */
                }
            });
            this.listen(thumb, 'blur', () => !drag && group.set({ b: 0 }, { spring: 'smooth' }));
            if (typeof ResizeObserver !== 'undefined') {
                const ro = new ResizeObserver(() => measure());
                ro.observe(track);
                this.onCleanup(() => ro.disconnect());
            }
            this.onCleanup(() => {
                group.stop();
                root.remove();
                this._set = null;
            });
        }
    }, { id: 'micro-kit-16', text: microKit16.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineMicroSlider = defineMicroSlider;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/widgets/micro-slider.cjs.map