import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { formatTime, hour12, stepTime, timeParts } from './kit-15';
import css from './ui-kit-15.css?raw';

/**
 * A compact time field: an hour and a minute spin button with small up / down buttons, plus an AM / PM switch when
 * `hour12` is set. The arrow keys step (minutes by `step`, snapping to it), Page Up / Down step an hour, Home / End go
 * to the ends, and typing digits sets a part directly. The value is always 24-hour "HH:MM"; with `name` it goes into a
 * hidden input for forms.
 *
 * Attributes: `value` ("HH:MM"; 09:00), `step` (minutes; 5), `hour12`, `name`, `label` (Time), `hour-label` (Hours),
 * `minute-label` (Minutes), `am-label` (AM), `pm-label` (PM).
 * Event `usa:change` ({ value }).
 */
export interface UsaTimePickerElement extends UsaElement {
  readonly value: string;
}

export function defineTimePicker(tag = 'usa-time-picker'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class TimePicker extends Base {
    static get observedAttributes(): string[] { return ['value', 'step', 'hour12', 'name', 'label', 'hour-label', 'minute-label', 'am-label', 'pm-label']; }
    private _value = '09:00';
    private _seen?: string;
    get value(): string { return this._value; }
    mount(): void {
      const start = this.str('value');
      if (start !== this._seen) {
        this._seen = start;
        this._value = timeParts(start) ? formatTime(timeParts(start)!.h * 60 + timeParts(start)!.m) : '09:00';
      }
      const step = Math.max(1, Math.min(60, Math.round(this.num('step', 5))));
      const twelve = this.flag('hour12');
      const root = make('div', 'usa-kit usa-time');
      root.setAttribute('role', 'group');
      root.setAttribute('aria-label', this.str('label', 'Time'));
      root.toggleAttribute('data-static', this.reduced);
      const part = (unit: 'h' | 'm', label: string) => {
        const wrap = make('span', 'usa-time-part');
        const up = make('button', 'usa-time-up', '▴');
        const down = make('button', 'usa-time-down', '▾');
        for (const b of [up, down]) { b.type = 'button'; b.tabIndex = -1; b.setAttribute('aria-hidden', 'true'); }
        const spin = make('span', 'usa-time-spin');
        spin.setAttribute('role', 'spinbutton');
        spin.setAttribute('aria-label', label);
        spin.tabIndex = 0;
        spin.dataset.unit = unit;
        wrap.append(up, spin, down);
        this.listen(up, 'click', () => { set(stepTime(this._value, unit, 1, step)); spin.focus(); });
        this.listen(down, 'click', () => { set(stepTime(this._value, unit, -1, step)); spin.focus(); });
        return { wrap, spin };
      };
      const hh = part('h', this.str('hour-label', 'Hours'));
      const mm = part('m', this.str('minute-label', 'Minutes'));
      const colon = make('span', 'usa-time-colon', ':');
      colon.setAttribute('aria-hidden', 'true');
      root.append(hh.wrap, colon, mm.wrap);
      const ampm = twelve ? make('button', 'usa-time-ampm') : null;
      if (ampm) { ampm.type = 'button'; root.append(ampm); }
      const hidden = this.str('name') ? make('input') : null;
      if (hidden) { hidden.type = 'hidden'; hidden.name = this.str('name'); root.append(hidden); }
      this.append(root);
      const am = this.str('am-label', 'AM');
      const pm = this.str('pm-label', 'PM');
      const paint = () => {
        const p = timeParts(this._value)!;
        const h12 = hour12(p.h);
        const hText = twelve ? String(h12.hour).padStart(2, '0') : String(p.h).padStart(2, '0');
        hh.spin.textContent = hText;
        hh.spin.setAttribute('aria-valuenow', String(twelve ? h12.hour : p.h));
        hh.spin.setAttribute('aria-valuemin', twelve ? '1' : '0');
        hh.spin.setAttribute('aria-valuemax', twelve ? '12' : '23');
        hh.spin.setAttribute('aria-valuetext', twelve ? `${h12.hour} ${h12.pm ? pm : am}` : hText);
        mm.spin.textContent = String(p.m).padStart(2, '0');
        mm.spin.setAttribute('aria-valuenow', String(p.m));
        mm.spin.setAttribute('aria-valuemin', '0');
        mm.spin.setAttribute('aria-valuemax', '59');
        if (ampm) {
          ampm.textContent = h12.pm ? pm : am;
          ampm.setAttribute('aria-label', `${am} / ${pm}: ${h12.pm ? pm : am}`);
        }
        if (hidden) hidden.value = this._value;
      };
      const set = (v: string) => {
        if (v === this._value) return;
        this._value = v;
        paint();
        this.emit('change', { value: v });
      };
      paint();
      if (ampm) this.listen(ampm, 'click', () => {
        const p = timeParts(this._value)!;
        set(formatTime(((p.h + 12) % 24) * 60 + p.m));
      });
      let typed = '';
      let typedAt = 0;
      for (const { spin } of [hh, mm]) {
        this.listen(spin, 'keydown', (e: KeyboardEvent) => {
          const unit = spin.dataset.unit as 'h' | 'm';
          const p = timeParts(this._value)!;
          let v = '';
          if (e.key === 'ArrowUp') v = stepTime(this._value, unit, 1, step);
          else if (e.key === 'ArrowDown') v = stepTime(this._value, unit, -1, step);
          else if (e.key === 'PageUp') v = stepTime(this._value, 'h', 1, step);
          else if (e.key === 'PageDown') v = stepTime(this._value, 'h', -1, step);
          else if (e.key === 'Home') v = unit === 'h' ? formatTime((twelve && p.h >= 12 ? 12 : 0) * 60 + p.m) : formatTime(p.h * 60);
          else if (e.key === 'End') v = unit === 'h' ? formatTime((twelve && p.h < 12 ? 11 : 23) * 60 + p.m) : formatTime(p.h * 60 + 59);
          else if (/^\d$/.test(e.key)) {
            const now = Date.now();
            typed = now - typedAt < 1200 && typed.length < 2 ? typed + e.key : e.key;
            typedAt = now;
            let n = Number(typed);
            if (unit === 'h') {
              if (twelve) { n = Math.min(12, n) || 12; n = (n % 12) + (p.h >= 12 ? 12 : 0); } else n = Math.min(23, n);
              v = formatTime(n * 60 + p.m);
            } else v = formatTime(p.h * 60 + Math.min(59, n));
          } else return;
          e.preventDefault();
          set(v);
        });
      }
      this.onCleanup(() => root.remove());
    }
  }, { id: 'ui-kit-15', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
