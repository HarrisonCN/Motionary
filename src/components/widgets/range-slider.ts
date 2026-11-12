import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { node, numberValue, formShell, formReset } from './form-craft';
import css from './form-craft.css?raw';

/** Two native range controls with a non-crossing interval and named form values. */
export interface UsaRangeSliderElement extends UsaElement { low: number; high: number; reset(): void; }
export function defineRangeSlider(tag = 'usa-range-slider'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class RangeSlider extends Base {
    static get observedAttributes(): string[] { return ['label', 'hint', 'low', 'high', 'min', 'max', 'step', 'min-gap', 'name', 'unit', 'disabled']; }
    private _sync?: () => void; private _initial?: [number, number];
    private bounds(): [number, number, number] { const a = numberValue(this.num('min', 0), 0), b = numberValue(this.num('max', 100), 100), min = Math.min(a, b), max = Math.max(a, b); return [min, max, numberValue(this.num('min-gap', 0), 0, 0, max - min)]; }
    get low(): number { const [a, b, gap] = this.bounds(); return numberValue(this.num('low', a), a, a, Math.max(a, numberValue(this.num('high', b), b, a + gap, b) - gap)); }
    set low(value: number) { const [a, , gap] = this.bounds(); this.setAttribute('low', String(numberValue(value, a, a, this.high - gap))); }
    get high(): number { const [a, b, gap] = this.bounds(); return numberValue(this.num('high', b), b, this.low + gap, b); }
    set high(value: number) { const [, b, gap] = this.bounds(); this.setAttribute('high', String(numberValue(value, b, this.low + gap, b))); }
    reset(): void { if (this._initial) { this.setAttribute('high', String(this._initial[1])); this.setAttribute('low', String(this._initial[0])); } this._sync?.(); }
    changed(): void { this._sync?.(); }
    mount(): void {
      this._initial ??= [this.low, this.high]; const { root, title, hint } = formShell(this, 'Range'), track = node('div', 'usa-form-range-track'), group = node('div', 'usa-form-range');
      const inputs: HTMLInputElement[] = [], outputs: HTMLOutputElement[] = [];
      for (const label of ['Lower', 'Upper']) { const row = node('label'), input = node('input'), out = node('output'); input.type = 'range'; row.append(node('span', '', label), input, out); inputs.push(input); outputs.push(out); group.append(row); }
      root.append(track, group, hint);
      const sync = () => { const [a, b, gap] = this.bounds(), values = [this.low, this.high]; title.textContent = this.str('label', 'Range'); hint.textContent = this.str('hint'); inputs.forEach((input, i) => { input.min = String(i ? values[0] + gap : a); input.max = String(i ? b : values[1] - gap); input.step = String(numberValue(this.num('step', 1), 1, 1e-6, 1e6)); input.value = String(values[i]); input.disabled = this.flag('disabled'); input.name = this.str('name') ? this.str('name') + (i ? '-high' : '-low') : ''; input.setAttribute('aria-label', `${title.textContent} ${i ? 'upper' : 'lower'}`); outputs[i].value = values[i] + this.str('unit'); }); track.style.setProperty('--low', `${b === a ? 0 : (values[0] - a) / (b - a) * 100}%`); track.style.setProperty('--high', `${b === a ? 100 : (values[1] - a) / (b - a) * 100}%`); };
      this._sync = sync; inputs.forEach((input, i) => { this.listen(input, 'input', () => { if (this.flag('disabled')) return; if (i) this.high = input.valueAsNumber; else this.low = input.valueAsNumber; sync(); this.emit('input', { low: this.low, high: this.high }); }); this.listen(input, 'change', () => this.emit('change', { low: this.low, high: this.high })); });
      formReset(this, () => this.reset()); this.onCleanup(() => { this._sync = undefined; }); sync();
    }
  }, { id: 'form-craft', text: css }); defineMoName(tag, ctor); return ctor;
}
