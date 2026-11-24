'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var spring = require('../chunks/spring-DoapHVAk.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments$1 = require('../chunks/moments-eoZA2npZ.cjs');
var moments = require('../chunks/moments-Rge1M2_3.cjs');

function defineNotchSlider(tag = 'usa-notch-slider') {
    const ctor = base.defineElement(tag, Base => class NotchSlider extends Base {
        static get observedAttributes() { return ['value', 'min', 'max', 'step', 'notches', 'snap', 'unit', 'name', 'label', 'disabled']; }
        range() {
            const a = moments$1.bound(this.num('min', 0), -1e9, 1e9, 0), b = moments$1.bound(this.num('max', 100), -1e9, 1e9, 100);
            const lo = Math.min(a, b), hi = Math.max(a, b) === lo ? lo + 1 : Math.max(a, b);
            return [lo, hi, moments$1.bound(this.num('step', 1), 1e-6, hi - lo, 1)];
        }
        get value() { const [lo, hi, step] = this.range(); return moments$1.roundTo(moments$1.bound(this.num('value', lo), lo, hi, lo), step); }
        set value(n) { const [lo, hi, step] = this.range(); this.setAttribute('value', String(moments$1.roundTo(moments$1.bound(Number(n), lo, hi, lo), step))); }
        changed(name) {
            if (name === 'notches' || name === 'min' || name === 'max')
                super.changed(name);
            else
                this._sync?.();
        }
        mount() {
            const root = moments$1.make('div', 'usa-moment usa-notch');
            const head = moments$1.make('div', 'usa-notch-head');
            const title = moments$1.make('label', 'usa-notch-label');
            const out = moments$1.make('output', 'usa-notch-value');
            head.append(title, out);
            const track = moments$1.make('div', 'usa-notch-track');
            const fill = moments$1.make('span', 'usa-notch-fill');
            const thumb = moments$1.make('span', 'usa-notch-thumb');
            track.setAttribute('aria-hidden', 'true');
            const input = moments$1.make('input', 'usa-notch-input');
            input.type = 'range';
            const id = moments$1.uniqueId('usa-notch');
            input.id = id;
            title.htmlFor = id;
            const [lo0, hi0] = this.range();
            const marks = moments$1.notchValues(lo0, hi0, this.num('notches', 5)).map((v, i) => {
                const tick = moments$1.make('i', 'usa-notch-tick');
                tick.style.setProperty('--at', String((v - lo0) / (hi0 - lo0)));
                tick.dataset.index = String(i);
                track.append(tick);
                return tick;
            });
            track.prepend(fill);
            track.append(thumb);
            root.append(head, track, input);
            this.append(root);
            const pos = spring.createSpring({
                value: (this.value - lo0) / (hi0 - lo0),
                spring: { stiffness: 420, damping: 26 },
                onUpdate: (p) => root.style.setProperty('--p', p.toFixed(4)),
            });
            root.style.setProperty('--p', String((this.value - lo0) / (hi0 - lo0)));
            let last = this.value;
            const notches = () => { const [lo, hi] = this.range(); return moments$1.notchValues(lo, hi, marks.length); };
            const pop = (index) => {
                const tick = marks[index];
                if (!tick)
                    return;
                this.motion(tick, [{ transform: 'translate(-50%, -50%) scaleY(1)' }, { transform: 'translate(-50%, -50%) scaleY(1.9)' }, { transform: 'translate(-50%, -50%) scaleY(1)' }], { duration: 260, easing: 'ease-out' });
            };
            const crossed = (from, to) => {
                const list = notches();
                list.forEach((n, i) => {
                    const passed = (from < n && to >= n) || (from > n && to <= n);
                    if (passed) {
                        pop(i);
                        this.emit('detent', { value: moments$1.roundTo(n, this.range()[2]), index: i });
                    }
                });
            };
            const sync = () => {
                const [lo, hi, step] = this.range(), v = this.value;
                title.textContent = this.str('label', 'Intensity');
                out.textContent = `${v}${this.str('unit')}`;
                input.min = String(lo);
                input.max = String(hi);
                input.step = String(step);
                if (document.activeElement !== input || input.valueAsNumber !== v)
                    input.value = String(v);
                input.name = this.str('name');
                input.disabled = this.flag('disabled');
                root.toggleAttribute('data-disabled', input.disabled);
                const list = notches();
                marks.forEach((m, i) => m.toggleAttribute('data-passed', v >= list[i] - 1e-9));
                pos.set((v - lo) / (hi - lo));
            };
            this._sync = sync;
            this.listen(input, 'input', () => {
                const next = input.valueAsNumber;
                if (!Number.isFinite(next))
                    return;
                crossed(last, next);
                last = next;
                this.value = next;
                this.emit('input', { value: this.value });
            });
            this.listen(input, 'change', () => {
                const [lo, hi, step] = this.range();
                const reach = moments$1.bound(this.num('snap', 0.04), 0, 0.2, 0.04) * (hi - lo);
                const near = reach > 0 ? moments$1.nearestNotch(this.value, notches(), reach) : null;
                if (near !== null && Math.abs(near - this.value) > 1e-9) {
                    const snapped = moments$1.roundTo(near, step);
                    crossed(this.value, snapped);
                    last = snapped;
                    this.value = snapped;
                    input.value = String(this.value);
                }
                this.emit('change', { value: this.value });
            });
            this.onCleanup(() => { pos.stop(); root.remove(); this._sync = undefined; });
            sync();
        }
    }, { id: 'moments', text: moments.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineNotchSlider = defineNotchSlider;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/widgets/notch-slider.cjs.map