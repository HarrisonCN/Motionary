'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var kit = require('../chunks/kit-CujTUbPK.cjs');
var dataMedia = require('../chunks/data-media-CzBZCPJg.cjs');

function defineFilterChips(tag = 'usa-filter-chips') {
    const ctor = base.defineElement(tag, Base => class FilterChips extends Base {
        constructor() {
            super(...arguments);
            this._count = 0;
        }
        static get observedAttributes() { return ['options', 'value', 'target', 'multiple', 'match', 'label', 'all-label']; }
        get value() { return kit.list(this.str('value')); }
        set value(v) { this.setAttribute('value', (Array.isArray(v) ? v : [String(v)]).join(',')); }
        changed(name) { if (name === 'value' || name === 'match')
            this._sync?.();
        else
            super.changed(name); }
        mount() {
            let container = null;
            try {
                container = this.str('target') ? document.querySelector(this.str('target')) : this.nextElementSibling;
            }
            catch { /* invalid selector */ }
            const items = container ? Array.from(container.children) : [];
            const tagsOf = (el) => (el.dataset.tags || '').split(/[\s,]+/).filter(Boolean).map((t) => t.toLowerCase());
            let options = kit.list(this.str('options'), 30);
            if (!options.length)
                options = Array.from(new Set(items.flatMap(tagsOf))).slice(0, 30);
            const root = moments.make('div', 'usa-kit usa-fchips');
            root.setAttribute('role', 'group');
            const row = moments.make('div', 'usa-fchips-row');
            const status = moments.make('p', 'usa-fchips-status');
            status.setAttribute('aria-live', 'polite');
            const chip = (text, value) => {
                const b = moments.make('button', 'usa-fchip');
                b.type = 'button';
                b.dataset.value = value;
                b.append(moments.make('span', 'usa-fchip-check'), moments.make('span', 'usa-fchip-text', text));
                row.append(b);
                return b;
            };
            const all = chip(this.str('all-label', 'All'), '');
            const chips = options.map((o) => chip(o, o.toLowerCase()));
            root.append(row, status);
            this.append(root);
            let first = true;
            const sync = () => {
                const chosen = this.value.map((v) => v.toLowerCase()).filter((v) => options.some((o) => o.toLowerCase() === v));
                const matchAll = this.str('match') === 'all';
                root.setAttribute('aria-label', this.str('label', 'Filter'));
                root.toggleAttribute('data-static', this.reduced);
                all.setAttribute('aria-pressed', String(!chosen.length));
                for (const c of chips)
                    c.setAttribute('aria-pressed', String(chosen.includes(c.dataset.value)));
                const before = first ? new Map() : kit.measure(items.filter((i) => !i.hidden));
                const leaving = [];
                let count = 0;
                for (const it of items) {
                    const tags = tagsOf(it);
                    const keep = !chosen.length || (matchAll ? chosen.every((c) => tags.includes(c)) : chosen.some((c) => tags.includes(c)));
                    if (keep)
                        count++;
                    if (!keep && !it.hidden)
                        leaving.push(it);
                    else
                        it.hidden = !keep;
                }
                // leaving items fade out in place, then drop out of the layout and the rest glide together
                const wasFirst = first;
                const settle = () => {
                    for (const it of leaving)
                        it.hidden = true;
                    if (!wasFirst)
                        kit.flip(before, items, 420);
                };
                if (leaving.length && !this.reduced && !first) {
                    const anims = leaving.map((el) => this.motion(el, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.9)' }], { duration: 180, easing: 'ease-in' }));
                    Promise.all(anims.map((a) => a?.finished.catch(() => undefined))).then(settle);
                }
                else
                    settle();
                status.textContent = items.length ? `${count} of ${items.length} shown` : '';
                first = false;
                this._count = count;
            };
            this._sync = sync;
            this.listen(row, 'click', (e) => {
                const b = e.target.closest?.('.usa-fchip');
                if (!b)
                    return;
                const v = b.dataset.value;
                const cur = this.value.map((x) => x.toLowerCase());
                const next = !v ? [] : this.flag('multiple') ? (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]) : cur.length === 1 && cur[0] === v ? [] : [v];
                this.value = next;
                this.emit('change', { value: next, count: this._count });
            });
            this.onCleanup(() => {
                for (const it of items)
                    it.hidden = false;
                root.remove();
                this._sync = undefined;
            });
            sync();
        }
    }, { id: 'data-media', text: dataMedia.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineFilterChips = defineFilterChips;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/widgets/filter-chips.cjs.map