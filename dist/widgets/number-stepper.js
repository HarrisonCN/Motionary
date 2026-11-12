import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { c as css, d as numberValue, f as formShell, n as node, a as formMotion, b as formReset } from '../chunks/form-craft-saDInBKK.js';

function defineNumberStepper(tag = 'usa-number-stepper') {
    const ctor = defineElement(tag, Base => class NumberStepper extends Base {
        static get observedAttributes() { return ['label', 'hint', 'value', 'min', 'max', 'step', 'name', 'disabled', 'required']; }
        bounds() { const a = numberValue(this.num('min', 0), 0), b = numberValue(this.num('max', 100), 100); return [Math.min(a, b), Math.max(a, b)]; }
        get value() { const [a, b] = this.bounds(); return numberValue(this.num('value', a), a, a, b); }
        set value(value) { const [a, b] = this.bounds(); this.setAttribute('value', String(Number(numberValue(value, a, a, b).toFixed(10)))); }
        stepUp(amount = 1) { if (!this.flag('disabled'))
            this.value += numberValue(amount, 1, -1e6, 1e6) * numberValue(this.num('step', 1), 1, 1e-6, 1e6); }
        stepDown(amount = 1) { this.stepUp(-amount); }
        reset() { this.value = this._initial ?? this.bounds()[0]; this._sync?.(); }
        changed() { this._sync?.(); }
        mount() {
            this._initial ?? (this._initial = this.value);
            const { root, title, hint } = formShell(this, 'Quantity'), row = node('div', 'usa-form-row');
            const minus = node('button', 'usa-form-step-button', '−'), plus = node('button', 'usa-form-step-button', '+'), input = node('input', 'usa-form-step-number');
            minus.type = plus.type = 'button';
            input.type = 'number';
            minus.setAttribute('aria-label', 'Decrease');
            plus.setAttribute('aria-label', 'Increase');
            row.append(minus, input, plus);
            root.append(row, hint);
            const animate = formMotion(this);
            let editing = false;
            const sync = () => { const [a, b] = this.bounds(), disabled = this.flag('disabled'); title.textContent = this.str('label', 'Quantity'); hint.textContent = this.str('hint'); input.setAttribute('aria-label', title.textContent); input.min = String(a); input.max = String(b); input.step = String(numberValue(this.num('step', 1), 1, 1e-6, 1e6)); if (!editing)
                input.value = String(this.value); input.name = this.str('name'); input.required = this.flag('required'); input.disabled = disabled; minus.disabled = disabled || this.value <= a; plus.disabled = disabled || this.value >= b; };
            this._sync = sync;
            const change = (direction) => { this.stepUp(direction); animate(input); this.emit('input', { value: this.value }); this.emit('change', { value: this.value }); };
            this.listen(minus, 'click', () => change(-1));
            this.listen(plus, 'click', () => change(1));
            this.listen(input, 'input', () => { if (!Number.isFinite(input.valueAsNumber))
                return; editing = true; try {
                this.value = input.valueAsNumber;
            }
            finally {
                editing = false;
            } this.emit('input', { value: this.value }); });
            this.listen(input, 'change', () => { sync(); this.emit('change', { value: this.value }); });
            formReset(this, () => this.reset());
            this.onCleanup(() => { this._sync = undefined; });
            sync();
        }
    }, { id: 'form-craft', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineNumberStepper };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.7.0/dist/widgets/number-stepper.js.map