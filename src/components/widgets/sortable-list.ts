import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { flip, measure } from './kit';
import { moveItem } from './kit-12';
import css from './parts-kit-12.css?raw';

/** The index a dragged item should take: how many of the other items' middles lie above the pointer `y`. */
export function dropIndex(y: number, middles: readonly number[]): number {
  let n = 0;
  for (const m of middles) if (y > m) n++;
  return n;
}

/**
 * A list you reorder by dragging. Each item (the `li`s of a child `ul` / `ol`, or the direct children) gets a grip
 * button; drag it and the other items glide out of the way. By keyboard: focus a grip, press Space or Enter to pick the
 * item up, the arrow keys to move it, Space or Enter to drop it, Escape to put it back. Every step is read out in a polite
 * live region. The items themselves are moved in the DOM, so a form inside keeps its order.
 *
 * Attributes: `label` (Reorder), `grab-label` (Move), `picked` ({item} picked up), `moved` ({item}, position {n} of
 * {total}), `dropped` ({item} dropped).
 * Event `usa:sort` ({ from, to }).
 */
export interface UsaSortableListElement extends UsaElement {
  readonly order: number[];
}

export function defineSortableList(tag = 'usa-sortable-list'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class SortableList extends Base {
    static get observedAttributes(): string[] { return ['label', 'grab-label', 'picked', 'moved', 'dropped']; }
    private _order: number[] = [];
    get order(): number[] { return this._order.slice(); }
    mount(): void {
      const listEl = (this.querySelector(':scope > ul, :scope > ol') as HTMLElement | null) || this;
      const items = Array.from(listEl.children).filter((c) => !c.classList.contains('usa-kit')) as HTMLElement[];
      this._order = items.map((_, i) => i);
      listEl.classList.add('usa-sort-list');
      const root = make('span', 'usa-kit usa-sort');
      const live = make('span', 'usa-kit-sr');
      live.setAttribute('aria-live', 'assertive');
      root.append(live);
      root.toggleAttribute('data-static', this.reduced);
      this.append(root);
      listEl.setAttribute('aria-label', this.str('label', 'Reorder'));
      const text = (el: HTMLElement) => (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60);
      const say = (key: string, fallback: string, el: HTMLElement) => {
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
      const current = () => Array.from(listEl.children).filter((c) => items.includes(c as HTMLElement)) as HTMLElement[];
      const place = (el: HTMLElement, to: number, self = true) => {
        const now = current();
        const before = measure(now);
        const rest = now.filter((x) => x !== el);
        const ref = rest[to] ?? null;
        if (ref) listEl.insertBefore(el, ref);
        else if (rest.length) rest[rest.length - 1].after(el);
        flip(before, self ? now : now.filter((x) => x !== el), 260);
      };
      const commit = (from: number) => {
        const to = current().indexOf(held!);
        if (to !== from) {
          this._order = moveItem(this._order, from, to);
          this.emit('sort', { from, to });
        }
      };
      let held: HTMLElement | null = null, start = -1;
      const pick = (el: HTMLElement) => { held = el; start = current().indexOf(el); el.setAttribute('data-held', ''); say('picked', '{item} picked up', el); };
      const drop = (cancel: boolean) => {
        if (!held) return;
        const el = held;
        if (cancel) place(el, start);
        commit(start);
        el.removeAttribute('data-held');
        el.style.removeProperty('--dy');
        say(cancel ? 'moved' : 'dropped', cancel ? '{item}, position {n} of {total}' : '{item} dropped', el);
        held = null;
      };
      grips.forEach((g, i) => {
        const el = items[i];
        this.listen(g, 'keydown', (e: KeyboardEvent) => {
          if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (held === el) drop(false); else { drop(false); pick(el); } return; }
          if (held !== el) return;
          if (e.key === 'Escape') { e.preventDefault(); drop(true); g.focus(); return; }
          const pos = current().indexOf(el);
          const to = e.key === 'ArrowUp' ? pos - 1 : e.key === 'ArrowDown' ? pos + 1 : e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : -2;
          if (to === -2) return;
          e.preventDefault();
          if (to < 0 || to >= items.length || to === pos) return;
          place(el, to);
          g.focus();
          say('moved', '{item}, position {n} of {total}', el);
        });
        this.listen(g, 'click', (e: MouseEvent) => { if (e.detail === 0) return; g.focus(); });
        let id = -1, grab = 0, dy = 0;
        this.listen(g, 'pointerdown', (e: PointerEvent) => {
          if (e.button !== 0) return;
          e.preventDefault();
          id = e.pointerId;
          const r = el.getBoundingClientRect();
          grab = e.clientY - (r.top + r.height / 2);
          dy = 0;
          g.setPointerCapture?.(id);
          pick(el);
        });
        this.listen(g, 'pointermove', (e: PointerEvent) => {
          if (e.pointerId !== id || held !== el) return;
          const want = e.clientY - grab;
          const others = current().filter((x) => x !== el);
          const to = dropIndex(want, others.map((x) => { const b = x.getBoundingClientRect(); return b.top + b.height / 2; }));
          if (to !== current().indexOf(el)) place(el, to, false);
          const r = el.getBoundingClientRect();
          dy = want - (r.top + r.height / 2 - dy);
          el.style.setProperty('--dy', `${dy}px`);
        });
        const up = (e: PointerEvent) => { if (e.pointerId !== id) return; id = -1; drop(e.type === 'pointercancel'); };
        this.listen(g, 'pointerup', up);
        this.listen(g, 'pointercancel', up);
      });
      this.onCleanup(() => {
        for (const g of grips) g.remove();
        for (const el of items) { el.classList.remove('usa-sort-item'); el.removeAttribute('data-held'); el.style.removeProperty('--dy'); }
        listEl.classList.remove('usa-sort-list');
        root.remove();
        held = null;
      });
    }
  }, { id: 'parts-kit-12', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
