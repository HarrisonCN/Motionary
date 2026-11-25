import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { list } from './kit';
import { rovingIndex } from './kit-12';
import { micro } from '../interaction/micro';
import { hostSprings, tick, edgeSprings, px } from './micro-kit-16';
import css from './micro-kit-16.css?raw';

/**
 * A segmented control whose pill slides on two springs: the edge in front moves on a quick spring and the edge
 * behind on a slower one, so the pill stretches toward the new choice and catches up with a soft overshoot. Options
 * dip when pressed. A radio group: arrow keys move and choose, Home / End jump.
 *
 * Attributes: `options` (comma-separated labels), `values` (comma-separated; the labels by default), `value`,
 * `label` (group name; Options), `name`, `disabled`, `feel`, `haptics`. Event `usa:change` ({ value, index }).
 */
export interface UsaMicroSegmentedElement extends UsaElement {
  value: string;
}

export function defineMicroSegmented(tag = 'usa-micro-segmented'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, (Base) => class MicroSegmented extends Base {
    static get observedAttributes(): string[] {
      return ['options', 'values', 'value', 'label', 'name', 'disabled', 'feel', 'haptics'];
    }
    private _value = '';
    private _seen?: string | null;
    private _pick: ((i: number) => void) | null = null;
    private _vals: string[] = [];
    get value(): string {
      return this._value;
    }
    set value(v: string) {
      const i = this._vals.indexOf(String(v));
      if (i >= 0 && this._pick) this._pick(i);
      else this._value = String(v);
    }
    mount(): void {
      const labels = list(this.str('options'), 12);
      const given = list(this.str('values'), 12);
      const vals = (this._vals = labels.map((l, i) => given[i] || l));
      const attr = this.getAttribute('value');
      if (attr !== this._seen) {
        this._seen = attr;
        this._value = attr ?? '';
      }
      if (!vals.includes(this._value)) this._value = vals[0] ?? '';
      const disabled = this.flag('disabled');
      const root = make('div', 'usa-mkit usa-mseg');
      root.setAttribute('role', 'radiogroup');
      root.setAttribute('aria-label', this.str('label', 'Options'));
      if (disabled) root.setAttribute('aria-disabled', 'true');
      const pill = make('span', 'usa-mseg-pill');
      pill.setAttribute('aria-hidden', 'true');
      root.append(pill);
      const buttons = labels.map((l, i) => {
        const b = make('button', 'usa-mseg-opt', l);
        b.type = 'button';
        b.setAttribute('role', 'radio');
        b.dataset.value = vals[i];
        b.disabled = disabled;
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
      const presses = buttons.map((b) => micro(b, 'press', { pressScale: 0.94, feel: this.str('feel') || undefined }));

      const group = hostSprings(this, { a: 0, b: 0 }, (v) => {
        const a = Math.min(v.a, v.b);
        const w = Math.max(0, Math.abs(v.b - v.a));
        pill.style.transform = `translateX(${px(a)})`;
        pill.style.width = px(w);
      });
      let index = Math.max(0, vals.indexOf(this._value));
      const edges = (i: number): [number, number] => {
        const b = buttons[i];
        if (!b) return [0, 0];
        const rr = root.getBoundingClientRect();
        const br = b.getBoundingClientRect();
        const left = br.left - rr.left - root.clientLeft;
        return [left, left + br.width];
      };
      const paint = () => {
        buttons.forEach((b, i) => {
          b.setAttribute('aria-checked', String(i === index));
          b.tabIndex = i === index ? 0 : -1;
        });
        if (hidden) hidden.value = this._value;
      };
      const place = (animate: boolean) => {
        const [l, r] = edges(index);
        if (!animate) return group.jump({ a: l, b: r });
        const s = edgeSprings(group.get('a'), l);
        group.set({ a: l }, { spring: s.left });
        group.set({ b: r }, { spring: s.right });
      };
      paint();
      place(false);
      root.toggleAttribute('data-ready', true);
      const pick = (i: number, focus = false) => {
        if (i < 0 || i >= buttons.length) return;
        const changed = i !== index;
        index = i;
        this._value = vals[i];
        paint();
        place(true);
        if (focus) buttons[i].focus();
        if (changed) {
          tick(this, 6);
          this.emit('change', { value: this._value, index: i });
        }
      };
      this._pick = (i) => pick(i);
      this.listen(root, 'click', (e: MouseEvent) => {
        const i = buttons.indexOf((e.target as Element).closest('.usa-mseg-opt') as HTMLButtonElement);
        if (i >= 0 && !disabled) pick(i);
      });
      this.listen(root, 'keydown', (e: KeyboardEvent) => {
        const i = buttons.indexOf(e.target as HTMLButtonElement);
        if (i < 0 || disabled) return;
        const next = rovingIndex(e.key, i, buttons.length, getComputedStyle(root).direction === 'rtl');
        if (next < 0) return;
        e.preventDefault();
        pick(next, true);
      });
      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(() => !group.animating && place(false));
        ro.observe(root);
        this.onCleanup(() => ro.disconnect());
      }
      // fonts can change the widths after the first paint
      (document as Document & { fonts?: { ready?: Promise<unknown> } }).fonts?.ready?.then(() => this.isConnected && !group.animating && place(false));
      this.onCleanup(() => {
        group.stop();
        presses.forEach((h) => h.destroy());
        root.remove();
        this._pick = null;
      });
    }
  }, { id: 'micro-kit-16', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
