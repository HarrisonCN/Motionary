import { f as defineElement } from './base-SPDwWyB1.js';
import { d as defineMoName } from './mo-name-DT5wwaGR.js';
import { m as make } from './moments-Cg_NlOYG.js';
import { m as measure, f as flip } from './kit-DugHPVcq.js';
import { m as moveItem } from './kit-12-C5AMRg3h.js';
import { c as css } from './parts-kit-12-hM32fkey.js';

/** The index a dragged item should take: how many of the other items' middles lie above the pointer `y`. */
function dropIndex(y, middles) {
    let n = 0;
    for (const m of middles)
        if (y > m)
            n++;
    return n;
}
function defineSortableList(tag = 'usa-sortable-list') {
    const ctor = defineElement(tag, Base => class SortableList extends Base {
        constructor() {
            super(...arguments);
            this._order = [];
        }
        static get observedAttributes() { return ['label', 'grab-label', 'picked', 'moved', 'dropped']; }
        get order() { return this._order.slice(); }
        mount() {
            const listEl = this.querySelector(':scope > ul, :scope > ol') || this;
            const items = Array.from(listEl.children).filter((c) => !c.classList.contains('usa-kit'));
            this._order = items.map((_, i) => i);
            listEl.classList.add('usa-sort-list');
            const root = make('span', 'usa-kit usa-sort');
            const live = make('span', 'usa-kit-sr');
            live.setAttribute('aria-live', 'assertive');
            root.append(live);
            root.toggleAttribute('data-static', this.reduced);
            this.append(root);
            listEl.setAttribute('aria-label', this.str('label', 'Reorder'));
            const text = (el) => (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60);
            const say = (key, fallback, el) => {
                const pos = current().indexOf(el);
                live.textContent = this.str(key, fallback).replace('{item}', text(el)).replace('{n}', String(pos + 1)).replace('{total}', String(items.length));
            };
            const grips = items.map((el) => {
                el.classList.add('usa-sort-item');
                const g = make('button', 'usa-sort-grip');
                g.type = 'button';
                g.setAttribute('aria-label', `${this.str('grab-label', 'Move')}: ${text(el)}`);
                g.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>';
                el.prepend(g);
                return g;
            });
            const current = () => Array.from(listEl.children).filter((c) => items.includes(c));
            const place = (el, to, self = true) => {
                const now = current();
                const before = measure(now);
                const rest = now.filter((x) => x !== el);
                const ref = rest[to] ?? null;
                if (ref)
                    listEl.insertBefore(el, ref);
                else if (rest.length)
                    rest[rest.length - 1].after(el);
                flip(before, self ? now : now.filter((x) => x !== el), 260);
            };
            const commit = (from) => {
                const to = current().indexOf(held);
                if (to !== from) {
                    this._order = moveItem(this._order, from, to);
                    this.emit('sort', { from, to });
                }
            };
            let held = null, start = -1;
            const pick = (el) => { held = el; start = current().indexOf(el); el.setAttribute('data-held', ''); say('picked', '{item} picked up', el); };
            const drop = (cancel) => {
                if (!held)
                    return;
                const el = held;
                if (cancel)
                    place(el, start);
                commit(start);
                el.removeAttribute('data-held');
                el.style.removeProperty('--dy');
                say(cancel ? 'moved' : 'dropped', cancel ? '{item}, position {n} of {total}' : '{item} dropped', el);
                held = null;
            };
            grips.forEach((g, i) => {
                const el = items[i];
                this.listen(g, 'keydown', (e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        if (held === el)
                            drop(false);
                        else {
                            drop(false);
                            pick(el);
                        }
                        return;
                    }
                    if (held !== el)
                        return;
                    if (e.key === 'Escape') {
                        e.preventDefault();
                        drop(true);
                        g.focus();
                        return;
                    }
                    const pos = current().indexOf(el);
                    const to = e.key === 'ArrowUp' ? pos - 1 : e.key === 'ArrowDown' ? pos + 1 : e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : -2;
                    if (to === -2)
                        return;
                    e.preventDefault();
                    if (to < 0 || to >= items.length || to === pos)
                        return;
                    place(el, to);
                    g.focus();
                    say('moved', '{item}, position {n} of {total}', el);
                });
                this.listen(g, 'click', (e) => { if (e.detail === 0)
                    return; g.focus(); });
                let id = -1, grab = 0, dy = 0;
                this.listen(g, 'pointerdown', (e) => {
                    if (e.button !== 0)
                        return;
                    e.preventDefault();
                    id = e.pointerId;
                    const r = el.getBoundingClientRect();
                    grab = e.clientY - (r.top + r.height / 2);
                    dy = 0;
                    g.setPointerCapture?.(id);
                    pick(el);
                });
                this.listen(g, 'pointermove', (e) => {
                    if (e.pointerId !== id || held !== el)
                        return;
                    const want = e.clientY - grab;
                    const others = current().filter((x) => x !== el);
                    const to = dropIndex(want, others.map((x) => { const b = x.getBoundingClientRect(); return b.top + b.height / 2; }));
                    if (to !== current().indexOf(el))
                        place(el, to, false);
                    const r = el.getBoundingClientRect();
                    dy = want - (r.top + r.height / 2 - dy);
                    el.style.setProperty('--dy', `${dy}px`);
                });
                const up = (e) => { if (e.pointerId !== id)
                    return; id = -1; drop(e.type === 'pointercancel'); };
                this.listen(g, 'pointerup', up);
                this.listen(g, 'pointercancel', up);
            });
            this.onCleanup(() => {
                for (const g of grips)
                    g.remove();
                for (const el of items) {
                    el.classList.remove('usa-sort-item');
                    el.removeAttribute('data-held');
                    el.style.removeProperty('--dy');
                }
                listEl.classList.remove('usa-sort-list');
                root.remove();
                held = null;
            });
        }
    }, { id: 'parts-kit-12', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { dropIndex as a, defineSortableList as d };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/chunks/sortable-list-D4ayYQzk.js.map