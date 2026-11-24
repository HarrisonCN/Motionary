import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make, uniqueId } from './moments';
import css from './moments-ui.css?raw';

export interface PlanOption { name: string; detail: string }

/** `"Basic|Free, Pro|$12 a month"` → [{ name: 'Basic', detail: 'Free' }, …]; at most 6 plans. */
export function parsePlans(text: string): PlanOption[] {
  return text.split(',').map((item) => {
    const [name, ...rest] = item.split('|');
    return { name: name.trim(), detail: rest.join('|').trim() };
  }).filter((p) => p.name).slice(0, 6);
}

/**
 * A row of plan cards where a frame glides to the chosen card with a little overshoot and a tick pops in. The cards
 * are a native radio group in a fieldset, so arrow keys move the choice and a form gets the value.
 *
 * Attributes: `plans` (`Name|detail` pairs separated by commas; Basic|Free, Pro|$12, Team|$29), `value` (a plan's
 * name; the first by default), `label` (Plan), `name` (form field name), `disabled`.
 * Event `usa:change` ({ value, index }).
 */
export interface UsaPlanPickerElement extends UsaElement {
  value: string;
}

export function definePlanPicker(tag = 'usa-plan-picker'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class PlanPicker extends Base {
    static get observedAttributes(): string[] { return ['plans', 'value', 'label', 'name', 'disabled']; }
    private _sync?: () => void;
    private plans(): PlanOption[] {
      const list = parsePlans(this.str('plans', 'Basic|Free, Pro|$12, Team|$29'));
      return list.length ? list : parsePlans('Basic|Free, Pro|$12, Team|$29');
    }
    get value(): string {
      const plans = this.plans(), v = this.str('value');
      return plans.some((p) => p.name === v) ? v : plans[0].name;
    }
    set value(v: string) { this.setAttribute('value', String(v)); }
    changed(name: string): void { if (name === 'plans') super.changed(name); else this._sync?.(); }
    mount(): void {
      const plans = this.plans();
      const root = make('fieldset', 'usa-moment usa-plans');
      const legend = make('legend', 'usa-plans-legend');
      const row = make('div', 'usa-plans-row');
      const frame = make('span', 'usa-plans-frame');
      frame.setAttribute('aria-hidden', 'true');
      const group = uniqueId('usa-plan');
      const inputs = plans.map((plan, i) => {
        const card = make('label', 'usa-plan');
        const input = make('input', 'usa-plan-input');
        input.type = 'radio'; input.name = group; input.value = plan.name;
        card.style.setProperty('--i', String(i));
        card.append(input, make('span', 'usa-plan-name', plan.name), make('span', 'usa-plan-detail', plan.detail), make('span', 'usa-plan-tick'));
        row.append(card);
        return input;
      });
      row.append(frame);
      root.append(legend, row);
      root.style.setProperty('--count', String(plans.length));
      this.append(root);
      const field = make('input');
      field.type = 'hidden';
      root.append(field);
      const sync = () => {
        const value = this.value, formName = this.str('name');
        legend.textContent = this.str('label', 'Plan');
        root.disabled = this.flag('disabled');
        inputs.forEach((input, i) => {
          input.checked = input.value === value;
          if (input.checked) root.style.setProperty('--at', String(i));
        });
        // the radios share a per-instance group name; a form gets the value through one hidden field
        field.name = formName;
        field.value = value;
        field.disabled = !formName;
        root.toggleAttribute('data-static', this.reduced);
      };
      this._sync = sync;
      this.listen(row, 'change', (e: Event) => {
        const input = e.target as HTMLInputElement;
        const index = inputs.indexOf(input);
        if (index < 0) return;
        this.value = input.value;
        this.emit('change', { value: input.value, index });
      });
      this.onCleanup(() => { root.remove(); this._sync = undefined; });
      sync();
    }
  }, { id: 'moment-ui', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
