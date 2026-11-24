import { defineElement, type UsaElement } from '../base';
import { createSpring } from '../physics/spring';
import { defineMoName } from './mo-name';
import { bound, make, roundTo, uniqueId } from './moments';
import css from './moments-ui.css?raw';

/**
 * A range slider whose value bubble rides the thumb on a spring: it lags, leans into fast drags and wobbles upright
 * when you stop. A row of ticks below dims the ones passed. A native range input carries the value for pointer, keys
 * and screen readers.
 *
 * Attributes: `value` (16), `min` (0), `max` (32), `step` (1), `ticks` (0–21, 9), `label` (Value), `unit`, `name`,
 * `disabled`. Events `usa:input` / `usa:change` ({ value }).
 */
export interface UsaElasticSliderElement extends UsaElement {
  value: number;
}

export function defineElasticSlider(tag = 'usa-elastic-slider'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class ElasticSlider extends Base {
    static get observedAttributes(): string[] { return ['value', 'min', 'max', 'step', 'ticks', 'label', 'unit', 'name', 'disabled']; }
    private _sync?: () => void;
    private range(): [number, number, number] {
      const min = this.num('min', 0), max = Math.max(min + 1e-9, this.num('max', 32));
      const step = this.num('step', 1) > 0 ? this.num('step', 1) : 1;
      return [min, max, step];
    }
    get value(): number {
      const [min, max, step] = this.range();
      return roundTo(bound(this.num('value', 16), min, max, min), step);
    }
    set value(n: number) { this.setAttribute('value', String(n)); }
    changed(): void { this._sync?.(); }
    mount(): void {
      const root = make('div', 'usa-moment usa-elastic');
      const id = uniqueId('usa-elastic');
      const title = make('label', 'usa-elastic-label');
      title.htmlFor = id;
      const rail = make('div', 'usa-elastic-rail');
      const bubble = make('output', 'usa-elastic-bubble');
      bubble.htmlFor.add(id);
      const input = make('input', 'usa-elastic-input');
      input.type = 'range'; input.id = id;
      const ticks = make('span', 'usa-elastic-ticks');
      ticks.setAttribute('aria-hidden', 'true');
      rail.append(input, bubble, ticks);
      root.append(title, rail);
      this.append(root);
      const at = (v: number) => { const [min, max] = this.range(); return (v - min) / (max - min); };
      const lag = createSpring({ value: at(this.value), spring: { stiffness: 260, damping: 14 }, onUpdate: (p, velocity) => {
        root.style.setProperty('--b', p.toFixed(4));
        root.style.setProperty('--lean', bound(velocity * 14, -28, 28, 0).toFixed(2));
      } });
      const sync = () => {
        const [min, max, step] = this.range(), v = this.value, n = Math.round(bound(this.num('ticks', 9), 0, 21, 9));
        title.textContent = this.str('label', 'Value');
        input.min = String(min); input.max = String(max); input.step = String(step); input.value = String(v);
        input.name = this.str('name');
        input.disabled = this.flag('disabled');
        bubble.textContent = `${v}${this.str('unit')}`;
        root.style.setProperty('--v', at(v).toFixed(4));
        if (ticks.childElementCount !== n) ticks.replaceChildren(...Array.from({ length: n }, (_, i) => {
          const t = make('i');
          t.style.setProperty('--t', String(n > 1 ? i / (n - 1) : 0));
          return t;
        }));
        if (this.reduced) { lag.jump(at(v)); root.style.setProperty('--lean', '0'); } else lag.set(at(v));
      };
      this._sync = sync;
      this.listen(input, 'input', () => {
        this.value = input.valueAsNumber;
        this.emit('input', { value: this.value });
      });
      this.listen(input, 'change', () => this.emit('change', { value: this.value }));
      this.onCleanup(() => { lag.stop(); root.remove(); this._sync = undefined; });
      sync();
    }
  }, { id: 'moment-ui', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
