import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { m as make } from '../chunks/moments-Cg_NlOYG.js';
import { c as cleanColor } from '../chunks/kit-DugHPVcq.js';
import { d as dayNumber, h as ganttSpan } from '../chunks/kit-13-hC4WCTBH.js';
import { c as css } from '../chunks/parts-kit-13-CQI5zrN-.js';

const day = (n, locale) => {
    try {
        return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(n * 864e5));
    }
    catch {
        return new Date(n * 864e5).toISOString().slice(5, 10);
    }
};
function defineGantt(tag = 'usa-gantt') {
    const ctor = defineElement(tag, Base => class Gantt extends Base {
        static get observedAttributes() { return ['today', 'label', 'today-label', 'done-label']; }
        mount() {
            const src = this.querySelector(':scope > ul, :scope > ol');
            const items = src ? Array.from(src.children).filter((c) => c.tagName === 'LI') : [];
            const tasks = items.map((li) => {
                const s = dayNumber(li.dataset.start || ''), e = dayNumber(li.dataset.end || li.dataset.start || '');
                return { name: (li.textContent || '').trim(), s, e: Number.isFinite(e) ? e : s, progress: Math.max(0, Math.min(100, Number(li.dataset.progress) || 0)), color: cleanColor(li.dataset.color || ''), after: Math.round(Number(li.dataset.after) || 0) };
            }).filter((t) => Number.isFinite(t.s));
            if (!src || !tasks.length)
                return;
            const min = Math.min(...tasks.map((t) => Math.min(t.s, t.e)));
            const max = Math.max(...tasks.map((t) => Math.max(t.s, t.e)));
            const wasHidden = src.hidden;
            src.hidden = true;
            const root = make('div', 'usa-kit usa-gantt');
            root.setAttribute('role', 'group');
            root.setAttribute('aria-label', this.str('label', 'Timeline'));
            root.toggleAttribute('data-static', this.reduced);
            const axis = make('div', 'usa-gantt-axis');
            axis.setAttribute('aria-hidden', 'true');
            const days = max - min + 1;
            const stepDays = days > 70 ? 14 : 7;
            // week lines start on the first Monday on or after `min` (1970-01-01 was a Thursday)
            const firstMon = min + ((7 - ((((min + 3) % 7) + 7) % 7)) % 7);
            for (let d = days > 10 ? firstMon : min; d <= max; d += days > 10 ? stepDays : 1) {
                const tick = make('span', 'usa-gantt-tick', day(d));
                tick.style.setProperty('--x', `${((d - min) / days) * 100}%`);
                axis.append(tick);
            }
            const rows = make('ol', 'usa-gantt-rows');
            tasks.forEach((t, i) => {
                const li = make('li', 'usa-gantt-row');
                const name = make('span', 'usa-gantt-name', t.name);
                const lane = make('div', 'usa-gantt-lane');
                const sp = ganttSpan(t.s, t.e, min, max);
                const bar = make('button', 'usa-gantt-bar');
                bar.type = 'button';
                bar.style.setProperty('--l', `${sp.left}%`);
                bar.style.setProperty('--w', `${sp.width}%`);
                bar.style.setProperty('--p', `${t.progress}%`);
                bar.style.setProperty('--i', String(i));
                if (t.color)
                    bar.style.setProperty('--c', t.color);
                const fill = make('span', 'usa-gantt-fill');
                fill.setAttribute('aria-hidden', 'true');
                bar.append(fill, make('span', 'usa-gantt-pct', t.progress ? `${t.progress}%` : ''));
                bar.setAttribute('aria-label', `${t.name}: ${day(Math.min(t.s, t.e))} – ${day(Math.max(t.s, t.e))}${t.progress ? `, ${t.progress}% ${this.str('done-label', 'done')}` : ''}`);
                if (t.progress >= 100)
                    bar.setAttribute('data-done', '');
                this.listen(bar, 'click', () => this.emit('select', { index: i }));
                lane.append(bar);
                li.append(name, lane);
                rows.append(li);
            });
            // dependency links: a small elbow from the end of task `after` to the start of this task
            tasks.forEach((t, i) => {
                const from = t.after - 1;
                if (from < 0 || from >= tasks.length || from === i)
                    return;
                const a = ganttSpan(tasks[from].s, tasks[from].e, min, max), b = ganttSpan(t.s, t.e, min, max);
                const link = make('span', 'usa-gantt-link');
                link.setAttribute('aria-hidden', 'true');
                link.style.setProperty('--x1', `${a.left + a.width}%`);
                link.style.setProperty('--x2', `${b.left}%`);
                link.style.setProperty('--rows', String(i - from));
                link.style.setProperty('--i', String(i));
                rows.children[from].querySelector('.usa-gantt-lane').append(link);
            });
            const today = dayNumber(this.str('today'));
            root.append(axis, rows);
            if (Number.isFinite(today) && today >= min && today <= max) {
                const mark = make('span', 'usa-gantt-today');
                mark.style.setProperty('--x', ((today - min + 0.5) / days * 100).toFixed(3));
                mark.append(make('span', '', this.str('today-label', 'Today')));
                mark.setAttribute('aria-hidden', 'true');
                root.append(mark);
            }
            this.append(root);
            let shown = false;
            this.inView((v) => { if (v && !shown) {
                shown = true;
                root.setAttribute('data-in', '');
            } });
            this.onCleanup(() => { root.remove(); src.hidden = wasHidden; });
        }
    }, { id: 'parts-kit-13', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineGantt };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/widgets/gantt.js.map