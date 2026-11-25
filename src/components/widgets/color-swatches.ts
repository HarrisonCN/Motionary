import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { cleanColor, list } from './kit';
import { rovingIndex } from './kit-12';
import { inkOn } from './kit-15';
import css from './ui-kit-15.css?raw';

/**
 * A row of colour swatches to pick one from, like a product's colour choice. It is a radio group: the arrow keys move
 * and pick, the picked swatch shows a check in black or white (whichever reads better on it) and its name next to the
 * row. With `name` the picked colour goes into a hidden input for forms.
 *
 * Attributes: `colors` (comma-separated CSS colours), `names` (comma-separated), `value` (a colour from the list; the
 * first by default), `name`, `label` (Colour), `shape` (circle | square; circle), `size` (px; 32).
 * Event `usa:change` ({ value, index, name }).
 */
export interface UsaColorSwatchesElement extends UsaElement {
  readonly value: string;
}

export function defineColorSwatches(tag = 'usa-color-swatches'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class ColorSwatches extends Base {
    static get observedAttributes(): string[] { return ['colors', 'names', 'value', 'name', 'label', 'shape', 'size']; }
    private _value = '';
    private _seen?: string;
    get value(): string { return this._value; }
    mount(): void {
      const colors = list(this.str('colors'), 40).map(cleanColor).filter(Boolean);
      const names = list(this.str('names'), 40);
      const start = this.str('value');
      if (start !== this._seen) {
        this._seen = start;
        this._value = colors.includes(start) ? start : colors[0] || '';
      } else if (!colors.includes(this._value)) this._value = colors[0] || '';
      const root = make('div', 'usa-kit usa-swatch');
      root.toggleAttribute('data-static', this.reduced);
      root.dataset.shape = this.str('shape') === 'square' ? 'square' : 'circle';
      root.style.setProperty('--usa-swatch-size', `${Math.max(16, Math.min(80, this.num('size', 32)))}px`);
      const row = make('div', 'usa-swatch-row');
      row.setAttribute('role', 'radiogroup');
      row.setAttribute('aria-label', this.str('label', 'Colour'));
      const caption = make('span', 'usa-swatch-name');
      caption.setAttribute('aria-hidden', 'true');
      const buttons = colors.map((c, i) => {
        const b = make('button', 'usa-swatch-btn');
        b.type = 'button';
        b.setAttribute('role', 'radio');
        b.setAttribute('aria-label', names[i] || c);
        b.style.setProperty('--c', c);
        b.style.setProperty('--ink', inkOn(c));
        row.append(b);
        return b;
      });
      const hidden = this.str('name') ? make('input') : null;
      if (hidden) { hidden.type = 'hidden'; hidden.name = this.str('name'); }
      root.append(row, caption);
      if (hidden) root.append(hidden);
      this.append(root);
      const paint = () => {
        const k = colors.indexOf(this._value);
        buttons.forEach((b, i) => {
          b.setAttribute('aria-checked', String(i === k));
          b.tabIndex = i === (k < 0 ? 0 : k) ? 0 : -1;
        });
        caption.textContent = k >= 0 ? names[k] || colors[k] : '';
        if (hidden) hidden.value = this._value;
      };
      paint();
      const pick = (i: number) => {
        const changed = colors[i] !== this._value;
        this._value = colors[i];
        paint();
        if (changed) this.emit('change', { value: colors[i], index: i, name: names[i] || colors[i] });
      };
      this.listen(row, 'click', (e: MouseEvent) => {
        const i = buttons.indexOf((e.target as Element).closest('.usa-swatch-btn') as HTMLButtonElement);
        if (i >= 0) pick(i);
      });
      this.listen(row, 'keydown', (e: KeyboardEvent) => {
        const i = buttons.indexOf(e.target as HTMLButtonElement);
        if (i < 0) return;
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); pick(i); return; }
        const next = rovingIndex(e.key, i, buttons.length, getComputedStyle(root).direction === 'rtl');
        if (next < 0) return;
        e.preventDefault();
        pick(next);
        buttons[next].focus();
      });
      this.onCleanup(() => root.remove());
    }
  }, { id: 'ui-kit-15', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
