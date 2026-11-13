'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var formCraft = require('../chunks/form-craft-i3CaepYO.cjs');

function defineRangeSlider(tag = 'usa-range-slider') {
    const ctor = base.defineElement(tag, Base => class RangeSlider extends Base {
        static get observedAttributes() { return ['label', 'hint', 'low', 'high', 'min', 'max', 'step', 'min-gap', 'name', 'unit', 'disabled']; }
        stepSize() { return formCraft.numberValue(this.num('step', 1), 1, 1e-6, 1e6); }
        bounds() {
            const a = formCraft.numberValue(this.num('min', 0), 0), b = formCraft.numberValue(this.num('max', 100), 100), min = Math.min(a, b), step = this.stepSize();
            const ticks = Math.max(0, Math.floor((Math.max(a, b) - min) / step + 1e-8)), max = Number((min + ticks * step).toFixed(10));
            const gap = Math.min(ticks, Math.ceil(formCraft.numberValue(this.num('min-gap', 0), 0, 0, max - min) / step - 1e-8)) * step;
            return [min, max, Number(gap.toFixed(10))];
        }
        snap(value, min, max) {
            const [base] = this.bounds(), step = this.stepSize();
            const rounded = base + Math.round((formCraft.numberValue(value, min, min, max) - base) / step) * step;
            return Number(formCraft.numberValue(rounded, min, min, max).toFixed(10));
        }
        get low() { const [a, b, gap] = this.bounds(); return this.snap(this.num('low', a), a, this.snap(this.num('high', b), a + gap, b) - gap); }
        set low(value) { const [a, , gap] = this.bounds(); this.setAttribute('low', String(this.snap(value, a, this.high - gap))); }
        get high() { const [, b, gap] = this.bounds(); return this.snap(this.num('high', b), this.low + gap, b); }
        set high(value) { const [, b, gap] = this.bounds(); this.setAttribute('high', String(this.snap(value, this.low + gap, b))); }
        reset() { if (this._initial) {
            this.setAttribute('high', String(this._initial[1]));
            this.setAttribute('low', String(this._initial[0]));
        } this._sync?.(); }
        changed() { this._sync?.(); }
        mount() {
            this._initial ?? (this._initial = [this.low, this.high]);
            const { root, title, hint } = formCraft.formShell(this, 'Range'), track = formCraft.node('div', 'usa-form-range-track'), group = formCraft.node('div', 'usa-form-range');
            const inputs = [], outputs = [];
            for (const label of ['Lower', 'Upper']) {
                const row = formCraft.node('label'), input = formCraft.node('input'), out = formCraft.node('output');
                input.type = 'range';
                row.append(formCraft.node('span', '', label), input, out);
                inputs.push(input);
                outputs.push(out);
                group.append(row);
            }
            root.append(track, group, hint);
            const sync = () => { const [a, b, gap] = this.bounds(), values = [this.low, this.high]; title.textContent = this.str('label', 'Range'); hint.textContent = this.str('hint'); inputs.forEach((input, i) => { input.min = String(i ? values[0] + gap : a); input.max = String(i ? b : values[1] - gap); input.step = String(formCraft.numberValue(this.num('step', 1), 1, 1e-6, 1e6)); input.value = String(values[i]); input.disabled = this.flag('disabled'); input.name = this.str('name') ? this.str('name') + (i ? '-high' : '-low') : ''; input.setAttribute('aria-label', `${title.textContent} ${i ? 'upper' : 'lower'}`); outputs[i].value = values[i] + this.str('unit'); }); track.style.setProperty('--low', `${b === a ? 0 : (values[0] - a) / (b - a) * 100}%`); track.style.setProperty('--high', `${b === a ? 100 : (values[1] - a) / (b - a) * 100}%`); };
            this._sync = sync;
            inputs.forEach((input, i) => { this.listen(input, 'input', () => { if (this.flag('disabled'))
                return; if (i)
                this.high = input.valueAsNumber;
            else
                this.low = input.valueAsNumber; sync(); this.emit('input', { low: this.low, high: this.high }); }); this.listen(input, 'change', () => this.emit('change', { low: this.low, high: this.high })); });
            formCraft.formReset(this, () => this.reset());
            this.onCleanup(() => { this._sync = undefined; });
            sync();
        }
    }, { id: 'form-craft', text: formCraft.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineRangeSlider = defineRangeSlider;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.7.0/dist/widgets/range-slider.cjs.map