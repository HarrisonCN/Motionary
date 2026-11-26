import { f as defineElement, r as raf, b as caf } from './base-SPDwWyB1.js';
import { d as defineMoName } from './mo-name-DT5wwaGR.js';
import { m as make } from './moments-Cg_NlOYG.js';
import { c as css } from './parts-kit-O_H_tVRs.js';

/** The rows to render: [start, end) and the pixel offset of `start`, for a scroll position and a fixed row height. */
function virtualWindow(scrollTop, viewport, rowHeight, count, overscan = 4) {
    const h = Math.max(1, rowHeight);
    const n = Math.max(0, Math.floor(count));
    const first = Math.floor(Math.max(0, scrollTop) / h);
    const start = Math.max(0, Math.min(n, first - Math.max(0, overscan)));
    const end = Math.min(n, first + Math.ceil(Math.max(0, viewport) / h) + Math.max(0, overscan) + 1);
    return { start, end, offset: start * h };
}
function defineVirtualList(tag = 'usa-virtual-list') {
    const ctor = defineElement(tag, Base => class VirtualList extends Base {
        constructor() {
            super(...arguments);
            this._items = [];
        }
        static get observedAttributes() { return ['row-height', 'height', 'overscan', 'label']; }
        get items() { return this._items; }
        set items(v) { this._items = Array.isArray(v) ? v : []; this._refresh?.(true); }
        get render() { return this._render; }
        set render(fn) { this._render = typeof fn === 'function' ? fn : undefined; this._refresh?.(true); }
        scrollToIndex(index) {
            if (!this._box)
                return;
            const h = Math.max(8, this.num('row-height', 40));
            this._box.scrollTop = Math.max(0, Math.min(this._items.length - 1, Math.round(index))) * h;
        }
        mount() {
            const json = this.querySelector(':scope > script[type="application/json"]');
            const lis = Array.from(this.querySelectorAll(':scope > ul > li, :scope > ol > li, :scope > li'));
            const source = Array.from(this.children);
            if (!this._items.length) {
                if (json) {
                    try {
                        const v = JSON.parse(json.textContent || '[]');
                        if (Array.isArray(v))
                            this._items = v;
                    }
                    catch { /* not an array: keep the list empty */ }
                }
                else if (lis.length)
                    this._items = lis.map((li) => li.textContent?.trim() ?? '');
            }
            source.forEach((c) => (c.hidden = true));
            const rowH = Math.max(8, this.num('row-height', 40));
            const box = make('div', 'usa-kit usa-vlist');
            box.tabIndex = 0;
            box.setAttribute('role', 'region');
            box.setAttribute('aria-label', this.str('label', 'List'));
            box.style.setProperty('--h', this.str('height', '320px'));
            box.style.setProperty('--row', `${rowH}px`);
            const spacer = make('div', 'usa-vlist-spacer');
            const rows = make('ul', 'usa-vlist-rows');
            rows.setAttribute('role', 'list');
            spacer.append(rows);
            box.append(spacer);
            this.append(box);
            this._box = box;
            let pending = 0, last = '';
            const shown = new Set();
            const refresh = (force = false) => {
                pending = 0;
                const n = this._items.length;
                spacer.style.height = `${n * rowH}px`;
                const { start, end, offset } = virtualWindow(box.scrollTop, box.clientHeight || 320, rowH, n, Math.max(0, this.num('overscan', 4)));
                const key = `${start}:${end}`;
                if (key === last && !force)
                    return;
                last = key;
                rows.style.transform = `translateY(${offset}px)`;
                const out = [];
                for (let i = start; i < end; i++) {
                    const li = make('li', 'usa-vlist-row');
                    li.setAttribute('aria-setsize', String(n));
                    li.setAttribute('aria-posinset', String(i + 1));
                    const item = this._items[i];
                    const made = this._render ? this._render(item, i) : item !== null && typeof item === 'object' ? String(item.label ?? item.name ?? JSON.stringify(item)) : String(item);
                    if (typeof made === 'string')
                        li.textContent = made;
                    else
                        li.append(made);
                    if (!force && !this.reduced && !shown.has(i))
                        li.dataset.new = '';
                    out.push(li);
                }
                shown.clear();
                for (let i = start; i < end; i++)
                    shown.add(i);
                rows.replaceChildren(...out);
                if (!force)
                    this.emit('range', { start, end });
            };
            this._refresh = refresh;
            this.listen(box, 'scroll', () => { if (!pending)
                pending = raf(() => refresh(), this); }, { passive: true });
            this.listen(box, 'keydown', (e) => {
                const page = box.clientHeight - rowH;
                const by = { ArrowDown: rowH, ArrowUp: -rowH, PageDown: page, PageUp: -page };
                if (e.key in by) {
                    e.preventDefault();
                    box.scrollTop += by[e.key];
                }
                else if (e.key === 'Home') {
                    e.preventDefault();
                    box.scrollTop = 0;
                }
                else if (e.key === 'End') {
                    e.preventDefault();
                    box.scrollTop = box.scrollHeight;
                }
            });
            if (typeof ResizeObserver !== 'undefined') {
                const ro = new ResizeObserver(() => refresh(true));
                ro.observe(box);
                this.onCleanup(() => ro.disconnect());
            }
            this.onCleanup(() => {
                if (pending)
                    caf(pending);
                box.remove();
                source.forEach((c) => (c.hidden = false));
                this._refresh = undefined;
                this._box = undefined;
            });
            refresh(true);
        }
    }, { id: 'parts-kit', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineVirtualList as d, virtualWindow as v };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/chunks/virtual-list-CE5rRK-D.js.map