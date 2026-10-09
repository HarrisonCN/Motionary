import { f as defineElement } from './base-zSGb8ujt.js';

var css = "usa-date-picker{--usa-dp-c:#7c5cff;display:inline-block;width:var(--usa-dp-w,280px);max-width:100%;padding:12px;border-radius:16px;background:var(--usa-dp-bg,#fff);color:#111827;box-shadow:0 10px 30px -12px rgba(0,0,0,.3);font:500 13px/1 system-ui,sans-serif;user-select:none}.usa-dp-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}.usa-dp-title{font-weight:700;font-size:14px}.usa-dp-nav{width:30px;height:30px;border:0;border-radius:8px;background:none;color:inherit;font-size:18px;cursor:pointer}.usa-dp-nav:hover{background:rgba(127,127,127,.14)}.usa-dp-viewport{overflow:hidden}.usa-dp-row{display:grid;grid-template-columns:repeat(7,1fr);gap:2px}.usa-dp-dow{margin-bottom:4px;font-size:11px;opacity:.55;text-align:center}.usa-dp-day{position:relative;display:grid;place-items:center;aspect-ratio:1;border-radius:50%;cursor:pointer;font-variant-numeric:tabular-nums;outline:none;transition:background .2s,color .2s}.usa-dp-day:hover{background:rgba(124,92,255,.12)}.usa-dp-day[data-out]{opacity:.35}.usa-dp-day[data-today]{box-shadow:inset 0 0 0 1.5px var(--usa-dp-c)}.usa-dp-day[aria-selected=\"true\"]{background:var(--usa-dp-c);color:#fff}.usa-dp-day[aria-disabled]{opacity:.2;cursor:not-allowed;text-decoration:line-through}.usa-dp-day:focus-visible{box-shadow:0 0 0 2px #fff,0 0 0 4px var(--usa-dp-c)}@media (prefers-reduced-motion:reduce){.usa-dp-day{transition:none}}";

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
/** Parse `YYYY-MM-DD` as a local date (or null). */
function parseISODate(s) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
    if (!m)
        return null;
    const d = new Date(+m[1], +m[2] - 1, +m[3]);
    return d.getMonth() === +m[2] - 1 ? d : null;
}
/** The 6×7 day grid of a month (first row starts on `firstDay`). */
function monthGrid(year, month, firstDay = 1) {
    const first = new Date(year, month, 1);
    const off = (first.getDay() - firstDay + 7) % 7;
    return Array.from({ length: 42 }, (_, i) => new Date(year, month, 1 - off + i));
}
function defineDatePicker(tag = 'usa-date-picker') {
    return defineElement(tag, (Base) => {
        class UsaDatePicker extends Base {
            constructor() {
                super(...arguments);
                this._value = null;
                this._view = new Date();
                this._focus = new Date();
            }
            static get observedAttributes() {
                return ['min', 'max', 'first-day', 'locale'];
            }
            get value() {
                return this._value ? iso(this._value) : '';
            }
            set value(v) {
                const d = parseISODate(v);
                this._value = d;
                if (d)
                    (this._view = new Date(d.getFullYear(), d.getMonth(), 1)), (this._focus = d);
                if (this.isConnected)
                    this.render(0);
            }
            get month() {
                return iso(this._view).slice(0, 7);
            }
            mount() {
                const v = parseISODate(this.getAttribute('value'));
                if (v)
                    (this._value = v), (this._focus = v);
                else
                    this._focus = this._value || new Date();
                this._view = new Date(this._focus.getFullYear(), this._focus.getMonth(), 1);
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this.insertAdjacentHTML('afterbegin', '<div class="usa-dp-head" data-usa-part><button type="button" class="usa-dp-nav" data-d="-1" aria-label="Previous month">‹</button><span class="usa-dp-title" aria-live="polite"></span><button type="button" class="usa-dp-nav" data-d="1" aria-label="Next month">›</button></div><div class="usa-dp-viewport" data-usa-part><div class="usa-dp-grid" role="grid"></div></div>');
                this.listen(this, 'click', (e) => {
                    const t = e.target;
                    const nav = t.closest?.('.usa-dp-nav');
                    if (nav)
                        return this.showMonth(Number(nav.dataset.d));
                    const day = t.closest?.('[data-date]');
                    if (day && !day.hasAttribute('aria-disabled'))
                        this.pick(parseISODate(day.dataset.date));
                });
                this.listen(this, 'keydown', (e) => this.key(e));
                this.render(0);
            }
            inRange(d) {
                const lo = parseISODate(this.getAttribute('min'));
                const hi = parseISODate(this.getAttribute('max'));
                return (!lo || d >= lo) && (!hi || d <= hi);
            }
            render(dir, focus = false) {
                const grid = this.querySelector('.usa-dp-grid');
                if (!grid)
                    return;
                const loc = this.str('locale', '') || undefined;
                const fd = this.num('first-day', 1);
                const title = this.querySelector('.usa-dp-title');
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
                if (focus)
                    grid.querySelector(`[data-date="${foc}"]`)?.focus();
                if (dir && !this.reduced)
                    this.motion(grid, [{ transform: `translateX(${dir * 30}%)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 320, easing: 'cubic-bezier(.2,.8,.2,1)' });
            }
            showMonth(delta) {
                this._view = new Date(this._view.getFullYear(), this._view.getMonth() + delta, 1);
                this._focus = new Date(this._view);
                this.render(Math.sign(delta));
            }
            pick(d) {
                if (!this.inRange(d))
                    return;
                this._value = d;
                this._focus = d;
                const dir = d.getMonth() !== this._view.getMonth() || d.getFullYear() !== this._view.getFullYear() ? (d > this._view ? 1 : -1) : 0;
                if (dir)
                    this._view = new Date(d.getFullYear(), d.getMonth(), 1);
                this.setAttribute('value', iso(d));
                this.render(dir, true);
                const cell = this.querySelector(`[data-date="${iso(d)}"]`);
                if (cell && !this.reduced)
                    this.motion(cell, [{ transform: 'scale(.6)' }, { transform: 'scale(1.15)', offset: 0.6 }, { transform: 'scale(1)' }], { duration: 380, easing: 'ease-out' });
                this.emit('change', { value: iso(d), date: d });
            }
            key(e) {
                if (!e.target.closest?.('[data-date]'))
                    return;
                const f = new Date(this._focus);
                const step = {
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
                if (!step[e.key])
                    return;
                e.preventDefault();
                step[e.key]();
                const dir = f.getMonth() !== this._view.getMonth() ? (f > this._view ? 1 : -1) : 0;
                this._focus = f;
                if (dir)
                    this._view = new Date(f.getFullYear(), f.getMonth(), 1);
                this.render(dir, true);
            }
        }
        return UsaDatePicker;
    }, { id: 'date-picker', text: css });
}

export { defineDatePicker as d, monthGrid as m, parseISODate as p };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.4.0/dist/chunks/date-picker-DKv1uKYq.js.map