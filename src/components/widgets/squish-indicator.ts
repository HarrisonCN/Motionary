import { defineElement, type UsaElement } from '../base';
import { createSpring, type SpringValue } from '../physics/spring';
import { defineMoName } from './mo-name';
import { make, uniqueId } from './moments';
import css from './tactile.css?raw';

/** Split `"A, B, C"` into trimmed, non-empty, unique option labels (at most 8; falls back to A, B, C). */
export function parseOptions(text: string): string[] {
  const out: string[] = [];
  for (const part of text.split(',')) {
    const v = part.trim();
    if (v && !out.includes(v) && out.length < 8) out.push(v);
  }
  return out.length ? out : ['A', 'B', 'C'];
}

/**
 * A row of round, soft keys where the picked one swells on a spring (it overshoots and settles) while the others
 * shrink back: the "A / B / C" selection indicator. A native radio group, so arrow keys move the pick and it joins
 * forms through `name`.
 *
 * Attributes: `options` ("A,B,C"), `value` (an option, default the first), `label` (Choice), `name`, `disabled`.
 * Event `usa:change` ({ value, index }).
 */
export interface UsaSquishIndicatorElement extends UsaElement {
  value: string;
  readonly options: string[];
}

export function defineSquishIndicator(tag = 'usa-squish-indicator'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class SquishIndicator extends Base {
    static get observedAttributes(): string[] { return ['options', 'value', 'label', 'name', 'disabled']; }
    private _sync?: () => void;
    get options(): string[] { return parseOptions(this.str('options', 'A,B,C')); }
    get value(): string {
      const opts = this.options, v = this.str('value');
      return opts.includes(v) ? v : opts[0];
    }
    set value(v: string) { this.setAttribute('value', String(v)); }
    changed(name: string): void { if (name === 'options') super.changed(name); else this._sync?.(); }
    mount(): void {
      const root = make('fieldset', 'usa-tactile usa-pick');
      const legend = make('legend', 'usa-sr');
      const group = uniqueId('usa-pick');
      const opts = this.options;
      const springs: SpringValue[] = [];
      const inputs: HTMLInputElement[] = [];
      root.append(legend);
      opts.forEach((opt, i) => {
        const key = make('label', 'usa-pick-key');
        const input = make('input', 'usa-pick-input');
        input.type = 'radio'; input.name = group; input.value = opt;
        key.append(input, make('span', 'usa-pick-glyph', opt));
        root.append(key);
        inputs.push(input);
        springs.push(createSpring({ value: 0, spring: { stiffness: 420, damping: 13 }, onUpdate: (g) => key.style.setProperty('--grow', g.toFixed(4)) }));
        this.listen(input, 'change', () => {
          if (!input.checked) return;
          this.value = opt;
          this.emit('change', { value: opt, index: i });
        });
      });
      const field = make('input');
      field.type = 'hidden';
      root.append(field);
      this.append(root);
      const sync = () => {
        const v = this.value, disabled = this.flag('disabled');
        legend.textContent = this.str('label', 'Choice');
        root.disabled = disabled;
        field.name = this.str('name'); field.value = v; field.disabled = !field.name;
        inputs.forEach((input, i) => {
          const on = input.value === v;
          input.checked = on;
          input.parentElement!.toggleAttribute('data-on', on);
          if (this.reduced) springs[i].jump(on ? 1 : 0); else springs[i].set(on ? 1 : 0);
        });
        root.toggleAttribute('data-static', this.reduced);
      };
      this._sync = sync;
      this.onCleanup(() => { springs.forEach((s) => s.stop()); root.remove(); this._sync = undefined; });
      sync();
    }
  }, { id: 'tactile', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
