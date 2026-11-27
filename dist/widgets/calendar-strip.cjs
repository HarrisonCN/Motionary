'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var kit = require('../chunks/kit-CujTUbPK.cjs');
var kit15 = require('../chunks/kit-15-D1Ovwhys.cjs');
var uiKit15 = require('../chunks/ui-kit-15-D2S59TJU.cjs');

const todayText = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
function defineCalendarStrip(tag = 'usa-calendar-strip') {
    const ctor = base.defineElement(tag, Base => class CalendarStrip extends Base {
        constructor() {
            super(...arguments);
            this._value = '';
            this._start = NaN;
        }
        static get observedAttributes() {
            return ['value', 'start', 'days', 'week-start', 'marks', 'min', 'max', 'locale', 'label', 'prev-label', 'next-label', 'name'];
        }
        get value() { return this._value; }
        get start() { return Number.isFinite(this._start) ? kit15.dayText(this._start) : ''; }
        mount() {
            const n = Math.max(3, Math.min(14, Math.round(this.num('days', 7))));
            const ws = this.num('week-start', 1);
            const today = kit15.parseDay(todayText());
            const min = kit15.parseDay(this.str('min'));
            const max = kit15.parseDay(this.str('max'));
            const marks = new Set(kit.list(this.str('marks'), 200).map(kit15.parseDay).filter(Number.isFinite));
            const seen = `${this.str('value')}|${this.str('start')}`;
            if (seen !== this._seen) {
                this._seen = seen;
                const v = kit15.parseDay(this.str('value'));
                this._value = Number.isFinite(v) ? kit15.dayText(v) : '';
                const s = kit15.parseDay(this.str('start'));
                this._start = Number.isFinite(s) ? s : n === 7 ? kit15.weekStartOf(Number.isFinite(v) ? v : today, ws) : Number.isFinite(v) ? v : today;
            }
            const locale = this.str('locale') || undefined;
            const fmt = (o) => {
                try {
                    return new Intl.DateTimeFormat(locale, { ...o, timeZone: 'UTC' });
                }
                catch {
                    return new Intl.DateTimeFormat(undefined, { ...o, timeZone: 'UTC' });
                }
            };
            const wd = fmt({ weekday: 'short' });
            const full = fmt({ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            const month = fmt({ year: 'numeric', month: 'long' });
            const root = moments.make('div', 'usa-kit usa-cstrip');
            root.toggleAttribute('data-static', this.reduced);
            root.setAttribute('role', 'group');
            root.setAttribute('aria-label', this.str('label', 'Dates'));
            const head = moments.make('div', 'usa-cstrip-head');
            const title = moments.make('span', 'usa-cstrip-month');
            title.setAttribute('aria-live', 'polite');
            const prev = moments.make('button', 'usa-cstrip-nav', '‹');
            const next = moments.make('button', 'usa-cstrip-nav', '›');
            prev.type = next.type = 'button';
            prev.setAttribute('aria-label', this.str('prev-label', 'Earlier'));
            next.setAttribute('aria-label', this.str('next-label', 'Later'));
            head.append(prev, title, next);
            const row = moments.make('div', 'usa-cstrip-days');
            const hidden = this.str('name') ? moments.make('input') : null;
            if (hidden) {
                hidden.type = 'hidden';
                hidden.name = this.str('name');
            }
            root.append(head, row);
            if (hidden)
                root.append(hidden);
            this.append(root);
            const ok = (d) => !(Number.isFinite(min) && d < min) && !(Number.isFinite(max) && d > max);
            let buttons = [];
            const draw = (focusDay) => {
                const s = this._start;
                const v = kit15.parseDay(this._value);
                const date = (d) => new Date(d * 864e5);
                const a = month.format(date(s));
                const b = month.format(date(s + n - 1));
                title.textContent = a === b ? a : `${a} – ${b}`;
                row.replaceChildren();
                buttons = [];
                for (let k = 0; k < n; k++) {
                    const d = s + k;
                    const btn = moments.make('button', 'usa-cstrip-day');
                    btn.type = 'button';
                    btn.dataset.day = kit15.dayText(d);
                    btn.append(moments.make('span', 'usa-cstrip-wd', wd.format(date(d))), moments.make('strong', 'usa-cstrip-num', String(date(d).getUTCDate())));
                    if (marks.has(d))
                        btn.append(moments.make('i', 'usa-cstrip-dot'));
                    btn.setAttribute('aria-label', full.format(date(d)));
                    btn.setAttribute('aria-pressed', String(d === v));
                    if (d === today)
                        btn.setAttribute('aria-current', 'date');
                    btn.disabled = !ok(d);
                    btn.tabIndex = -1;
                    row.append(btn);
                    buttons.push(btn);
                }
                const focusable = buttons.find((x) => kit15.parseDay(x.dataset.day) === (focusDay ?? v) && !x.disabled) || buttons.find((x) => x.getAttribute('aria-current') && !x.disabled) || buttons.find((x) => !x.disabled);
                if (focusable)
                    focusable.tabIndex = 0;
                prev.disabled = Number.isFinite(min) && s - 1 < min;
                next.disabled = Number.isFinite(max) && s + n > max;
                if (hidden)
                    hidden.value = this._value;
                return focusable;
            };
            const page = (delta, focusDay) => {
                this._start += delta;
                const f = draw(focusDay);
                if (focusDay !== undefined)
                    f?.focus();
                this.emit('page', { start: kit15.dayText(this._start) });
            };
            draw();
            this.listen(prev, 'click', () => page(-n));
            this.listen(next, 'click', () => page(n));
            this.listen(row, 'click', (e) => {
                const b = e.target.closest('.usa-cstrip-day');
                if (!b || b.disabled)
                    return;
                this._value = b.dataset.day;
                draw(kit15.parseDay(this._value))?.focus();
                this.emit('change', { value: this._value });
            });
            this.listen(row, 'keydown', (e) => {
                const i = buttons.indexOf(e.target);
                if (i < 0)
                    return;
                const rtl = getComputedStyle(root).direction === 'rtl';
                const fwd = rtl ? 'ArrowLeft' : 'ArrowRight';
                const back = rtl ? 'ArrowRight' : 'ArrowLeft';
                const d = this._start + i;
                let to = NaN;
                if (e.key === fwd)
                    to = d + 1;
                else if (e.key === back)
                    to = d - 1;
                else if (e.key === 'Home')
                    to = this._start;
                else if (e.key === 'End')
                    to = this._start + n - 1;
                else
                    return;
                e.preventDefault();
                if (!ok(to))
                    return;
                if (to < this._start)
                    page(-n, to);
                else if (to >= this._start + n)
                    page(n, to);
                else {
                    for (const b of buttons)
                        b.tabIndex = -1;
                    buttons[to - this._start].tabIndex = 0;
                    buttons[to - this._start].focus();
                }
            });
            this.onCleanup(() => root.remove());
        }
    }, { id: 'ui-kit-15', text: uiKit15.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineCalendarStrip = defineCalendarStrip;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/widgets/calendar-strip.cjs.map