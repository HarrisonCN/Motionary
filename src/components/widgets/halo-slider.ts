import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { luminousTheme } from './luminous-shared';
import shared from './luminous.css?raw';
import css from './halo-slider.css?raw';

/** `<mo-halo-slider value="40" label="Brightness">` — native range input with a glass thumb and luminous fill.
 * Native touch, keyboard, step, form name and disabled semantics. Reflected numeric value. `usa:input` / `usa:change` { value }.
 */
export interface UsaHaloSliderElement extends UsaElement { value: number; }
export function defineHaloSlider(tag = 'usa-halo-slider'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => {
    class HaloSlider extends Base {
      static get observedAttributes(): string[] { return ['value', 'min', 'max', 'step', 'disabled', 'label', 'name', 'theme']; }
      private _input?: HTMLInputElement;
      private _output?: HTMLOutputElement;
      private _reflecting = false;
      private _initial?: string;
      get value(): number { return this._input ? Number(this._input.value) : this.num('value', 0); }
      set value(v: number) { this.setAttribute('value', String(Number.isFinite(v) ? v : 0)); }
      changed(name: string): void { if (!this._reflecting) { if (name === 'value') this.sync(); else super.changed(name); } }
      mount(): void {
        luminousTheme(this); this.querySelectorAll(':scope > [data-usa-part]').forEach(n => n.remove());
        const label = document.createElement('label'); label.className = 'usa-hsl-label'; label.setAttribute('data-usa-part', '');
        const title = document.createElement('span'); title.textContent = this.str('label', 'Level');
        const output = document.createElement('output'); output.setAttribute('aria-hidden', 'true'); this._output = output; label.append(title, output);
        const input = document.createElement('input'); input.type = 'range'; input.className = 'usa-hsl-range'; input.setAttribute('aria-label', this.str('label', 'Level'));
        const min = this.num('min', 0), max = Math.max(min + 1, this.num('max', 100)); input.min = String(min); input.max = String(max);
        input.step = this.str('step') === 'any' ? 'any' : String(Math.max(.000001, this.num('step', 1)));
        if (this._initial === undefined) this._initial = this.str('value', String(min));
        input.name = this.str('name'); input.disabled = this.flag('disabled'); input.defaultValue = this._initial;
        label.append(input); this.append(label); this._input = input; this.sync();
        this.listen(input, 'input', () => { this.reflect(); this.emit('input', { value: this.value }); });
        this.listen(input, 'change', () => { this.reflect(); this.emit('change', { value: this.value }); });
        const form = this.closest('form'); if (form) this.listen(form, 'reset', (e: Event) => { queueMicrotask(() => { if (!e.defaultPrevented && this.isConnected) this.reflect(); }); });
      }
      private reflect(): void {
        if (!this._input) return; this._reflecting = true; this.setAttribute('value', this._input.value); this._reflecting = false;
        const p = (this.value - Number(this._input.min)) / (Number(this._input.max) - Number(this._input.min));
        this._input.style.setProperty('--lu-fill', `${p * 100}%`); if (this._output) this._output.value = String(this.value);
      }
      private sync(): void { if (this._input) { this._input.value = this.str('value', this._input.min); this.reflect(); } }
    }
    return HaloSlider;
  }, { id: 'halo-slider', text: shared + css });
  defineMoName(tag, ctor); return ctor;
}
