import { f as defineElement } from './base-SPDwWyB1.js';
import { d as defineMoName } from './mo-name-DT5wwaGR.js';
import { m as make } from './moments-Cg_NlOYG.js';
import { l as list } from './kit-DugHPVcq.js';
import { k as iconSvg, l as css, a as ICON_CATEGORIES, i as iconCategory, g as iconElement, s as searchIcons } from './icon-Za8WMwLC.js';

/** What a pick copies to the clipboard with `copy`: the name, an `<mo-icon>` tag, or the svg markup. */
function iconCopyText(name, kind) {
    if (kind === 'name')
        return name;
    if (kind === 'tag')
        return `<mo-icon name="${name}"></mo-icon>`;
    if (kind === 'svg')
        return iconSvg(name);
    return '';
}
/**
 * Index of the next cell when moving through a grid of `count` cells laid out `columns` wide: arrows move by one cell
 * or one row, Home and End jump to the ends; the index stays inside the grid.
 */
function gridStep(index, key, count, columns) {
    if (count <= 0)
        return -1;
    const cols = Math.max(1, columns);
    const to = key === 'ArrowRight' ? index + 1 : key === 'ArrowLeft' ? index - 1 : key === 'ArrowDown' ? index + cols : key === 'ArrowUp' ? index - cols : key === 'Home' ? 0 : key === 'End' ? count - 1 : index;
    return Math.max(0, Math.min(count - 1, to));
}
function defineIconPicker(tag = 'usa-icon-picker') {
    const ctor = defineElement(tag, Base => class IconPicker extends Base {
        constructor() {
            super(...arguments);
            this._value = '';
        }
        static get observedAttributes() {
            return ['value', 'name', 'copy', 'categories', 'category-labels', 'size', 'height', 'compact', 'label', 'search-label', 'placeholder', 'all-label', 'empty', 'count-label'];
        }
        get value() { return this._value; }
        search(query) { this._search?.(query); }
        mount() {
            const offered = list(this.str('categories'), 64);
            const cats = ICON_CATEGORIES.filter((c) => !offered.length || offered.includes(c.id));
            const labels = list(this.str('category-labels'), 64);
            const copy = this.str('copy');
            // a new value attribute replaces the pick; other remounts keep what was picked
            const start = this.str('value');
            if (start !== this._seen) {
                this._seen = start;
                this._value = iconCategory(start) ? start : '';
            }
            const root = make('div', 'usa-kit usa-ipick');
            root.setAttribute('role', 'group');
            root.setAttribute('aria-label', this.str('label', 'Icons'));
            root.toggleAttribute('data-compact', this.flag('compact'));
            root.toggleAttribute('data-static', this.reduced);
            root.style.setProperty('--usa-ipick-size', `${Math.max(12, Math.min(64, this.num('size', 24)))}px`);
            root.style.setProperty('--usa-ipick-height', `${Math.max(120, Math.min(2000, this.num('height', 360)))}px`);
            const top = make('div', 'usa-ipick-top');
            const box = make('label', 'usa-ipick-search');
            const glass = iconElement('search');
            glass.setAttribute('aria-hidden', 'true');
            glass.setAttribute('width', '18');
            glass.setAttribute('height', '18');
            const input = make('input');
            input.type = 'search';
            input.autocomplete = 'off';
            input.spellcheck = false;
            input.setAttribute('aria-label', this.str('search-label', 'Search icons'));
            input.placeholder = this.str('placeholder', 'Search icons…');
            box.append(glass, input);
            const count = make('span', 'usa-ipick-count');
            count.setAttribute('aria-live', 'polite');
            top.append(box, count);
            const chips = make('div', 'usa-ipick-cats');
            chips.setAttribute('role', 'group');
            chips.setAttribute('aria-label', this.str('label', 'Icons'));
            let category = '';
            const chipFor = (id, text) => {
                const b = make('button', 'usa-ipick-cat', text);
                b.type = 'button';
                b.dataset.category = id;
                b.setAttribute('aria-pressed', String(id === category));
                chips.append(b);
                return b;
            };
            chipFor('', this.str('all-label', 'All'));
            for (const c of cats)
                chipFor(c.id, labels[ICON_CATEGORIES.indexOf(c)] || c.en);
            const grid = make('div', 'usa-ipick-grid');
            grid.setAttribute('role', 'group');
            grid.setAttribute('aria-label', this.str('label', 'Icons'));
            const empty = make('p', 'usa-ipick-empty', this.str('empty', 'No icons match.'));
            empty.hidden = true;
            const hidden = this.str('name') ? make('input') : null;
            if (hidden) {
                hidden.type = 'hidden';
                hidden.name = this.str('name');
                hidden.value = this._value;
            }
            root.append(top, chips, grid, empty);
            if (hidden)
                root.append(hidden);
            this.append(root);
            // one button per icon, built once; searching only hides and shows them
            const allowed = new Set(cats.map((c) => c.id));
            const buttons = new Map();
            for (const name of searchIcons()) {
                if (!allowed.has(iconCategory(name)))
                    continue;
                const b = make('button', 'usa-ipick-btn');
                b.type = 'button';
                b.dataset.icon = name;
                b.title = name;
                b.setAttribute('aria-label', name);
                b.setAttribute('aria-pressed', String(name === this._value));
                b.tabIndex = -1;
                const svg = iconElement(name);
                svg.classList.add('usa-icon');
                svg.setAttribute('aria-hidden', 'true');
                b.append(svg, make('span', 'usa-ipick-name', name));
                grid.append(b);
                buttons.set(name, b);
            }
            let shown = [];
            const countText = (n) => this.str('count-label', '{n} icons').replace('{n}', String(n));
            const filter = () => {
                const names = new Set(searchIcons(input.value, category));
                shown = [];
                for (const [name, b] of buttons) {
                    const on = names.has(name);
                    b.hidden = !on;
                    if (on)
                        shown.push(b);
                }
                count.textContent = countText(shown.length);
                empty.hidden = shown.length > 0;
                const current = shown.find((b) => b.dataset.icon === this._value) || shown[0];
                for (const b of shown)
                    b.tabIndex = b === current ? 0 : -1;
            };
            this._search = (q) => { input.value = q; filter(); };
            filter();
            const pick = (b) => {
                const name = b.dataset.icon;
                this._value = name;
                if (hidden)
                    hidden.value = name;
                for (const x of buttons.values())
                    x.setAttribute('aria-pressed', String(x === b));
                for (const x of shown)
                    x.tabIndex = x === b ? 0 : -1;
                const text = iconCopyText(name, copy);
                let copied = false;
                if (text && navigator.clipboard?.writeText) {
                    copied = true;
                    navigator.clipboard.writeText(text).catch(() => { });
                }
                this.emit('pick', { name, category: iconCategory(name), copied });
            };
            this.listen(input, 'input', filter);
            this.listen(chips, 'click', (e) => {
                const b = e.target.closest('.usa-ipick-cat');
                if (!b)
                    return;
                category = b.dataset.category || '';
                for (const x of chips.querySelectorAll('.usa-ipick-cat'))
                    x.setAttribute('aria-pressed', String(x === b));
                filter();
            });
            this.listen(grid, 'click', (e) => {
                const b = e.target.closest('.usa-ipick-btn');
                if (b)
                    pick(b);
            });
            const columns = () => {
                if (shown.length < 2)
                    return 1;
                const y = shown[0].offsetTop;
                const k = shown.findIndex((b) => b.offsetTop !== y);
                return k < 0 ? shown.length : k;
            };
            this.listen(grid, 'keydown', (e) => {
                if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key))
                    return;
                const i = shown.indexOf(e.target);
                if (i < 0)
                    return;
                e.preventDefault();
                const next = shown[gridStep(i, e.key, shown.length, columns())];
                for (const x of shown)
                    x.tabIndex = x === next ? 0 : -1;
                next.focus();
            });
            // Down from the search field goes into the grid
            this.listen(input, 'keydown', (e) => {
                if (e.key !== 'ArrowDown' || !shown.length)
                    return;
                e.preventDefault();
                (shown.find((b) => b.tabIndex === 0) || shown[0]).focus();
            });
            this.onCleanup(() => {
                root.remove();
                this._search = undefined;
            });
        }
    }, { id: 'icons', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineIconPicker as d, gridStep as g, iconCopyText as i };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/chunks/icon-picker-Cbu79YYV.js.map