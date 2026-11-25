import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { list } from './kit';
import { dayText, parseDay, weekStartOf } from './kit-15';
import css from './ui-kit-15.css?raw';

/**
 * A strip of days to pick a date from, the kind booking and diary apps put above a list: a week (or `days` days) of
 * weekday and date buttons, with back and forward buttons that move a whole strip. Today is marked, days in `marks`
 * get a dot, and days outside `min` / `max` cannot be picked. The arrow keys move a day (paging when they run off the
 * end) and Home / End jump to the ends of the strip. Dates are "YYYY-MM-DD"; weekday names come from `locale`.
 *
 * Attributes: `value`, `start` (the first day shown; otherwise the week holding `value` or today), `days` (3–14; 7),
 * `week-start` (0 Sunday … 6 Saturday; 1), `marks` (comma-separated dates), `min`, `max`, `locale`, `label` (Dates),
 * `prev-label` (Earlier), `next-label` (Later), `name`.
 * Events `usa:change` ({ value }), `usa:page` ({ start }).
 */
export interface UsaCalendarStripElement extends UsaElement {
  readonly value: string;
  readonly start: string;
}

const todayText = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export function defineCalendarStrip(tag = 'usa-calendar-strip'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class CalendarStrip extends Base {
    static get observedAttributes(): string[] {
      return ['value', 'start', 'days', 'week-start', 'marks', 'min', 'max', 'locale', 'label', 'prev-label', 'next-label', 'name'];
    }
    private _value = '';
    private _start = NaN;
    private _seen?: string;
    get value(): string { return this._value; }
    get start(): string { return Number.isFinite(this._start) ? dayText(this._start) : ''; }
    mount(): void {
      const n = Math.max(3, Math.min(14, Math.round(this.num('days', 7))));
      const ws = this.num('week-start', 1);
      const today = parseDay(todayText());
      const min = parseDay(this.str('min'));
      const max = parseDay(this.str('max'));
      const marks = new Set(list(this.str('marks'), 200).map(parseDay).filter(Number.isFinite));
      const seen = `${this.str('value')}|${this.str('start')}`;
      if (seen !== this._seen) {
        this._seen = seen;
        const v = parseDay(this.str('value'));
        this._value = Number.isFinite(v) ? dayText(v) : '';
        const s = parseDay(this.str('start'));
        this._start = Number.isFinite(s) ? s : n === 7 ? weekStartOf(Number.isFinite(v) ? v : today, ws) : Number.isFinite(v) ? v : today;
      }
      const locale = this.str('locale') || undefined;
      const fmt = (o: Intl.DateTimeFormatOptions) => {
        try { return new Intl.DateTimeFormat(locale, { ...o, timeZone: 'UTC' }); } catch { return new Intl.DateTimeFormat(undefined, { ...o, timeZone: 'UTC' }); }
      };
      const wd = fmt({ weekday: 'short' });
      const full = fmt({ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      const month = fmt({ year: 'numeric', month: 'long' });
      const root = make('div', 'usa-kit usa-cstrip');
      root.toggleAttribute('data-static', this.reduced);
      root.setAttribute('role', 'group');
      root.setAttribute('aria-label', this.str('label', 'Dates'));
      const head = make('div', 'usa-cstrip-head');
      const title = make('span', 'usa-cstrip-month');
      title.setAttribute('aria-live', 'polite');
      const prev = make('button', 'usa-cstrip-nav', '‹');
      const next = make('button', 'usa-cstrip-nav', '›');
      prev.type = next.type = 'button';
      prev.setAttribute('aria-label', this.str('prev-label', 'Earlier'));
      next.setAttribute('aria-label', this.str('next-label', 'Later'));
      head.append(prev, title, next);
      const row = make('div', 'usa-cstrip-days');
      const hidden = this.str('name') ? make('input') : null;
      if (hidden) { hidden.type = 'hidden'; hidden.name = this.str('name'); }
      root.append(head, row);
      if (hidden) root.append(hidden);
      this.append(root);
      const ok = (d: number) => !(Number.isFinite(min) && d < min) && !(Number.isFinite(max) && d > max);
      let buttons: HTMLButtonElement[] = [];
      const draw = (focusDay?: number) => {
        const s = this._start;
        const v = parseDay(this._value);
        const date = (d: number) => new Date(d * 864e5);
        const a = month.format(date(s));
        const b = month.format(date(s + n - 1));
        title.textContent = a === b ? a : `${a} – ${b}`;
        row.replaceChildren();
        buttons = [];
        for (let k = 0; k < n; k++) {
          const d = s + k;
          const btn = make('button', 'usa-cstrip-day');
          btn.type = 'button';
          btn.dataset.day = dayText(d);
          btn.append(make('span', 'usa-cstrip-wd', wd.format(date(d))), make('strong', 'usa-cstrip-num', String(date(d).getUTCDate())));
          if (marks.has(d)) btn.append(make('i', 'usa-cstrip-dot'));
          btn.setAttribute('aria-label', full.format(date(d)));
          btn.setAttribute('aria-pressed', String(d === v));
          if (d === today) btn.setAttribute('aria-current', 'date');
          btn.disabled = !ok(d);
          btn.tabIndex = -1;
          row.append(btn);
          buttons.push(btn);
        }
        const focusable = buttons.find((x) => parseDay(x.dataset.day!) === (focusDay ?? v) && !x.disabled) || buttons.find((x) => x.getAttribute('aria-current') && !x.disabled) || buttons.find((x) => !x.disabled);
        if (focusable) focusable.tabIndex = 0;
        prev.disabled = Number.isFinite(min) && s - 1 < min;
        next.disabled = Number.isFinite(max) && s + n > max;
        if (hidden) hidden.value = this._value;
        return focusable;
      };
      const page = (delta: number, focusDay?: number) => {
        this._start += delta;
        const f = draw(focusDay);
        if (focusDay !== undefined) f?.focus();
        this.emit('page', { start: dayText(this._start) });
      };
      draw();
      this.listen(prev, 'click', () => page(-n));
      this.listen(next, 'click', () => page(n));
      this.listen(row, 'click', (e: MouseEvent) => {
        const b = (e.target as Element).closest('.usa-cstrip-day') as HTMLButtonElement | null;
        if (!b || b.disabled) return;
        this._value = b.dataset.day!;
        draw(parseDay(this._value))?.focus();
        this.emit('change', { value: this._value });
      });
      this.listen(row, 'keydown', (e: KeyboardEvent) => {
        const i = buttons.indexOf(e.target as HTMLButtonElement);
        if (i < 0) return;
        const rtl = getComputedStyle(root).direction === 'rtl';
        const fwd = rtl ? 'ArrowLeft' : 'ArrowRight';
        const back = rtl ? 'ArrowRight' : 'ArrowLeft';
        const d = this._start + i;
        let to = NaN;
        if (e.key === fwd) to = d + 1;
        else if (e.key === back) to = d - 1;
        else if (e.key === 'Home') to = this._start;
        else if (e.key === 'End') to = this._start + n - 1;
        else return;
        e.preventDefault();
        if (!ok(to)) return;
        if (to < this._start) page(-n, to);
        else if (to >= this._start + n) page(n, to);
        else {
          for (const b of buttons) b.tabIndex = -1;
          buttons[to - this._start].tabIndex = 0;
          buttons[to - this._start].focus();
        }
      });
      this.onCleanup(() => root.remove());
    }
  }, { id: 'ui-kit-15', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
