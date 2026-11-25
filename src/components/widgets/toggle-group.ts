import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { list } from './kit';
import { rovingIndex } from './kit-12';
import css from './ui-kit-15.css?raw';

/**
 * A row of toggle buttons, one pressed at a time or, with `multiple`, any number. Each button says whether it is
 * pressed (`aria-pressed`); the arrow keys move between them and Space or Enter presses. With `required` the last
 * pressed button cannot be let go, so there is always a value. With `name` the value goes into a hidden input for
 * forms (several values joined by commas).
 *
 * Attributes: `options` (comma-separated labels), `values` (comma-separated values; the labels by default),
 * `value` (comma-separated), `multiple`, `required`, `name`, `label` (Options), `size` (sm | md | lg; md).
 * Event `usa:change` ({ value, index }) — `value` is an array of the pressed values; `index` the button just pressed.
 */
export interface UsaToggleGroupElement extends UsaElement {
  readonly value: string[];
}

export function defineToggleGroup(tag = 'usa-toggle-group'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class ToggleGroup extends Base {
    static get observedAttributes(): string[] { return ['options', 'values', 'value', 'multiple', 'required', 'name', 'label', 'size']; }
    private _value: string[] = [];
    private _seen?: string;
    get value(): string[] { return this._value.slice(); }
    mount(): void {
      const labels = list(this.str('options'), 24);
      const given = list(this.str('values'), 24);
      const vals = labels.map((l, i) => given[i] || l);
      const multiple = this.flag('multiple');
      const required = this.flag('required');
      const start = this.str('value');
      if (start !== this._seen) {
        this._seen = start;
        this._value = list(start, 24).filter((v) => vals.includes(v));
      } else this._value = this._value.filter((v) => vals.includes(v));
      if (!multiple) this._value = this._value.slice(0, 1);
      if (required && !this._value.length && vals.length) this._value = [vals[0]];
      const root = make('div', 'usa-kit usa-tgroup');
      root.setAttribute('role', 'group');
      root.setAttribute('aria-label', this.str('label', 'Options'));
      const size = this.str('size', 'md');
      root.dataset.size = ['sm', 'lg'].includes(size) ? size : 'md';
      root.toggleAttribute('data-static', this.reduced);
      const buttons = labels.map((l, i) => {
        const b = make('button', 'usa-tgroup-btn', l);
        b.type = 'button';
        b.dataset.value = vals[i];
        root.append(b);
        return b;
      });
      const hidden = this.str('name') ? make('input') : null;
      if (hidden) {
        hidden.type = 'hidden';
        hidden.name = this.str('name');
        root.append(hidden);
      }
      this.append(root);
      let focus = Math.max(0, vals.indexOf(this._value[0]));
      const paint = () => {
        buttons.forEach((b, i) => {
          b.setAttribute('aria-pressed', String(this._value.includes(vals[i])));
          b.tabIndex = i === focus ? 0 : -1;
        });
        if (hidden) hidden.value = this._value.join(',');
      };
      paint();
      const press = (i: number) => {
        const v = vals[i];
        const on = this._value.includes(v);
        if (on && required && this._value.length === 1) return;
        if (multiple) this._value = on ? this._value.filter((x) => x !== v) : vals.filter((x) => x === v || this._value.includes(x));
        else this._value = on ? [] : [v];
        focus = i;
        paint();
        this.emit('change', { value: this._value.slice(), index: i });
      };
      this.listen(root, 'click', (e: MouseEvent) => {
        const i = buttons.indexOf((e.target as Element).closest('.usa-tgroup-btn') as HTMLButtonElement);
        if (i >= 0) press(i);
      });
      this.listen(root, 'keydown', (e: KeyboardEvent) => {
        const i = buttons.indexOf(e.target as HTMLButtonElement);
        if (i < 0) return;
        const next = rovingIndex(e.key, i, buttons.length, getComputedStyle(root).direction === 'rtl');
        if (next < 0) return;
        e.preventDefault();
        focus = next;
        paint();
        buttons[next].focus();
      });
      this.onCleanup(() => root.remove());
    }
  }, { id: 'ui-kit-15', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
