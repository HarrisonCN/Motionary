import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { c as createSpring } from '../chunks/spring-Bu3AwUgu.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { b as bound, r as roundTo, m as make, n as notchValues, a as nearestNotch, u as uniqueId } from '../chunks/moments-Cg_NlOYG.js';
import { c as css } from '../chunks/moments-D7dR6K16.js';

function defineNotchSlider(tag = 'usa-notch-slider') {
    const ctor = defineElement(tag, Base => class NotchSlider extends Base {
        static get observedAttributes() { return ['value', 'min', 'max', 'step', 'notches', 'snap', 'unit', 'name', 'label', 'disabled']; }
        range() {
            const a = bound(this.num('min', 0), -1e9, 1e9, 0), b = bound(this.num('max', 100), -1e9, 1e9, 100);
            const lo = Math.min(a, b), hi = Math.max(a, b) === lo ? lo + 1 : Math.max(a, b);
            return [lo, hi, bound(this.num('step', 1), 1e-6, hi - lo, 1)];
        }
        get value() { const [lo, hi, step] = this.range(); return roundTo(bound(this.num('value', lo), lo, hi, lo), step); }
        set value(n) { const [lo, hi, step] = this.range(); this.setAttribute('value', String(roundTo(bound(Number(n), lo, hi, lo), step))); }
        changed(name) {
            if (name === 'notches' || name === 'min' || name === 'max')
                super.changed(name);
            else
                this._sync?.();
        }
        mount() {
            const root = make('div', 'usa-moment usa-notch');
            const head = make('div', 'usa-notch-head');
            const title = make('label', 'usa-notch-label');
            const out = make('output', 'usa-notch-value');
            head.append(title, out);
            const track = make('div', 'usa-notch-track');
            const fill = make('span', 'usa-notch-fill');
            const thumb = make('span', 'usa-notch-thumb');
            track.setAttribute('aria-hidden', 'true');
            const input = make('input', 'usa-notch-input');
            input.type = 'range';
            const id = uniqueId('usa-notch');
            input.id = id;
            title.htmlFor = id;
            const [lo0, hi0] = this.range();
            const marks = notchValues(lo0, hi0, this.num('notches', 5)).map((v, i) => {
                const tick = make('i', 'usa-notch-tick');
                tick.style.setProperty('--at', String((v - lo0) / (hi0 - lo0)));
                tick.dataset.index = String(i);
                track.append(tick);
                return tick;
            });
            track.prepend(fill);
            track.append(thumb);
            root.append(head, track, input);
            this.append(root);
            const pos = createSpring({
                value: (this.value - lo0) / (hi0 - lo0),
                spring: { stiffness: 420, damping: 26 },
                onUpdate: (p) => root.style.setProperty('--p', p.toFixed(4)),
            });
            root.style.setProperty('--p', String((this.value - lo0) / (hi0 - lo0)));
            let last = this.value;
            const notches = () => { const [lo, hi] = this.range(); return notchValues(lo, hi, marks.length); };
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
                        this.emit('detent', { value: roundTo(n, this.range()[2]), index: i });
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
                const reach = bound(this.num('snap', 0.04), 0, 0.2, 0.04) * (hi - lo);
                const near = reach > 0 ? nearestNotch(this.value, notches(), reach) : null;
                if (near !== null && Math.abs(near - this.value) > 1e-9) {
                    const snapped = roundTo(near, step);
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
    }, { id: 'moments', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineNotchSlider };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/widgets/notch-slider.js.map