import { defineElement, type UsaElement } from '../base';
import { localeAttr } from './shared';
import css from './date-picker.css?raw';

/**
 * `<usa-date-picker>` (6.9) — an inline calendar. Changing month slides the
 * grid in from the direction of travel, the selected day pops inside a
 * spring circle and today has a ring. A real date grid: `role="grid"`,
 * arrows (day / week), PageUp / PageDown (month), Home / End (week start /
 * end), Enter / Space selects; `min` / `max` (ISO `YYYY-MM-DD`) disable days
 * outside the range. `value` (ISO), `first-day` (0 = Sunday, 1 = Monday,
 * default 1), `locale`. Event `usa:change` (`{ value, date }`). Reduced
 * motion: no slide or pop.
 */
export interface UsaDatePickerElement extends UsaElement {
  value: string;
  month: string;
  showMonth(delta: number): void;
}

const iso = (d: Date): string => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
/** Parse `YYYY-MM-DD` as a local date (or null). */
export function parseISODate(s: string | null | undefined): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3]);
  return d.getMonth() === +m[2] - 1 ? d : null;
}
/** The 6×7 day grid of a month (first row starts on `firstDay`). */
export function monthGrid(year: number, month: number, firstDay = 1): Date[] {
  const first = new Date(year, month, 1);
  const off = (first.getDay() - firstDay + 7) % 7;
  return Array.from({ length: 42 }, (_, i) => new Date(year, month, 1 - off + i));
}

export function defineDatePicker(tag = 'usa-date-picker'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaDatePicker extends Base {
        static get observedAttributes(): string[] {
          return ['min', 'max', 'first-day', 'locale'];
        }
        private _value: Date | null = null;
        private _view = new Date();
        private _focus = new Date();

        get value(): string {
          return this._value ? iso(this._value) : '';
        }
        set value(v: string) {
          const d = parseISODate(v);
          this._value = d;
          if (d) (this._view = new Date(d.getFullYear(), d.getMonth(), 1)), (this._focus = d);
          if (this.isConnected) this.render(0);
        }
        get month(): string {
          return iso(this._view).slice(0, 7);
        }

        mount(): void {
          const v = parseISODate(this.getAttribute('value'));
          if (v) (this._value = v), (this._focus = v);
          else this._focus = this._value || new Date();
          this._view = new Date(this._focus.getFullYear(), this._focus.getMonth(), 1);
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          this.insertAdjacentHTML('afterbegin', '<div class="usa-dp-head" data-usa-part><button type="button" class="usa-dp-nav" data-d="-1" aria-label="Previous month">‹</button><span class="usa-dp-title" aria-live="polite"></span><button type="button" class="usa-dp-nav" data-d="1" aria-label="Next month">›</button></div><div class="usa-dp-viewport" data-usa-part><div class="usa-dp-grid" role="grid"></div></div>');
          this.listen(this, 'click', (e: Event) => {
            const t = e.target as HTMLElement;
            const nav = t.closest?.('.usa-dp-nav') as HTMLElement | null;
            if (nav) return this.showMonth(Number(nav.dataset.d));
            const day = t.closest?.('[data-date]') as HTMLElement | null;
            if (day && !day.hasAttribute('aria-disabled')) this.pick(parseISODate(day.dataset.date!)!);
          });
          this.listen(this, 'keydown', (e: KeyboardEvent) => this.key(e));
          this.render(0);
        }

        private inRange(d: Date): boolean {
          const lo = parseISODate(this.getAttribute('min'));
          const hi = parseISODate(this.getAttribute('max'));
          return (!lo || d >= lo) && (!hi || d <= hi);
        }

        private render(dir: number, focus = false): void {
          const grid = this.querySelector('.usa-dp-grid') as HTMLElement | null;
          if (!grid) return;
          const loc = localeAttr(this.str('locale', ''));
          const fd = this.num('first-day', 1);
          const title = this.querySelector('.usa-dp-title') as HTMLElement;
          title.textContent = this._view.toLocaleDateString(loc, { month: 'long', year: 'numeric' });
          const days = monthGrid(this._view.getFullYear(), this._view.getMonth(), fd);
          const names = days.slice(0, 7).map((d) => d.toLocaleDateString(loc, { weekday: 'narrow' }));
          const today = iso(new Date());
          const sel = this.value;
          const foc = iso(this._focus);
          let html = `<div role="row" class="usa-dp-row usa-dp-dow">${names.map((n) => `<span role="columnheader">${n}</span>`).join('')}</div>`;
          for (let r = 0; r < 6; r++) {
            html += '<div role="row" class="usa-dp-row">';
            for (const d of days.slice(r * 7, r * 7 + 7)) {
              const k = iso(d);
              const out = d.getMonth() !== this._view.getMonth();
              const dis = !this.inRange(d);
              html += `<span role="gridcell" class="usa-dp-day" data-date="${k}"${out ? ' data-out' : ''}${k === today ? ' data-today' : ''} aria-selected="${k === sel}"${dis ? ' aria-disabled="true"' : ''} tabindex="${k === foc ? 0 : -1}" aria-label="${d.toLocaleDateString(loc, { day: 'numeric', month: 'long', year: 'numeric' })}">${d.getDate()}</span>`;
            }
            html += '</div>';
          }
          grid.innerHTML = html;
          if (focus) (grid.querySelector(`[data-date="${foc}"]`) as HTMLElement | null)?.focus();
          if (dir && !this.reduced) this.motion(grid, [{ transform: `translateX(${dir * 30}%)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 320, easing: 'cubic-bezier(.2,.8,.2,1)' });
        }

        showMonth(delta: number): void {
          this._view = new Date(this._view.getFullYear(), this._view.getMonth() + delta, 1);
          this._focus = new Date(this._view);
          this.render(Math.sign(delta));
        }

        private pick(d: Date): void {
          if (!this.inRange(d)) return;
          this._value = d;
          this._focus = d;
          const dir = d.getMonth() !== this._view.getMonth() || d.getFullYear() !== this._view.getFullYear() ? (d > this._view ? 1 : -1) : 0;
          if (dir) this._view = new Date(d.getFullYear(), d.getMonth(), 1);
          this.setAttribute('value', iso(d));
          this.render(dir, true);
          const cell = this.querySelector(`[data-date="${iso(d)}"]`);
          if (cell && !this.reduced) this.motion(cell, [{ transform: 'scale(.6)' }, { transform: 'scale(1.15)', offset: 0.6 }, { transform: 'scale(1)' }], { duration: 380, easing: 'ease-out' });
          this.emit('change', { value: iso(d), date: d });
        }

        private key(e: KeyboardEvent): void {
          if (!(e.target as HTMLElement).closest?.('[data-date]')) return;
          const f = new Date(this._focus);
          const step: Record<string, () => void> = {
            ArrowLeft: () => f.setDate(f.getDate() - 1),
            ArrowRight: () => f.setDate(f.getDate() + 1),
            ArrowUp: () => f.setDate(f.getDate() - 7),
            ArrowDown: () => f.setDate(f.getDate() + 7),
            PageUp: () => f.setMonth(f.getMonth() - 1),
            PageDown: () => f.setMonth(f.getMonth() + 1),
            Home: () => f.setDate(f.getDate() - ((f.getDay() - this.num('first-day', 1) + 7) % 7)),
            End: () => f.setDate(f.getDate() + 6 - ((f.getDay() - this.num('first-day', 1) + 7) % 7)),
          };
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            return this.pick(this._focus);
          }
          if (!step[e.key]) return;
          e.preventDefault();
          step[e.key]();
          const dir = f.getMonth() !== this._view.getMonth() ? (f > this._view ? 1 : -1) : 0;
          this._focus = f;
          if (dir) this._view = new Date(f.getFullYear(), f.getMonth(), 1);
          this.render(dir, true);
        }
      }
      return UsaDatePicker as unknown as CustomElementConstructor;
    },
    { id: 'date-picker', text: css }
  );
}
