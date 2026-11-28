import { defineElement, srText, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { hostSprings, tick, uid } from './micro-kit-16';
import { frameOnce } from './fling-kit-19';
import { gridSlot, slotAtPoint, slotStep } from './snap-kit-20';
import css from './snap-kit-20.css?raw';
import type { SpringGroup } from '../physics/spring-solver';

/**
 * A grid of tiles you rearrange like the icons of a phone's home screen: pick a tile up (drag it with a mouse, or
 * press and hold it on a touch screen), and it lifts and follows the finger while the others jiggle and spring out of
 * its way into their new places; let go and it settles into its slot with the speed it was thrown at. With the
 * keyboard, Space or Enter picks the focused tile up, the arrow keys move it through the grid (Home and End to the
 * ends), Space or Enter drops it and Escape puts everything back; each step is announced.
 *
 * Content: each child is a tile (its `data-key` names it in `order` and the event; its `aria-label`, `data-label` or
 * text is read out). Attributes: `columns` (1–12; 4), `gap` (px; 12), `row-height` (px; square tiles when unset),
 * `label` (the list's name; Items), `feel`, `haptics`.
 * Events: `usa:reorder` ({ from, to, order }, `order` being the keys in their new order).
 */
export interface UsaSpringGridElement extends UsaElement {
  /** The tiles' keys (`data-key`, else their first position) in their current order. */
  readonly order: string[];
}

export function defineSpringGrid(tag = 'usa-spring-grid'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, (Base) => class SpringGrid extends Base {
    static get observedAttributes(): string[] {
      return ['columns', 'gap', 'row-height', 'label', 'feel', 'haptics'];
    }
    private _source: Element[] | null = null;
    private _order: number[] = [];
    private _keys: string[] = [];
    get order(): string[] {
      return this._order.map((i) => this._keys[i]);
    }
    mount(): void {
      if (!this._source) {
        const kids = [...this.children];
        this._source = kids.map((k) => k.cloneNode(true) as Element);
        kids.forEach((k) => k.remove());
      }
      const src = this._source;
      const n = src.length;
      this._keys = src.map((k, i) => (k as HTMLElement).dataset?.key || String(i));
      if (this._order.length !== n) this._order = src.map((_, i) => i);
      const order = this._order;
      const cols = Math.min(12, Math.max(1, Math.round(this.num('columns', 4))));
      const gap = Math.max(0, this.num('gap', 12));
      const rowAttr = this.num('row-height', 0);

      const root = make('div', 'usa-snkit usa-sgrid');
      root.setAttribute('role', 'list');
      root.setAttribute('aria-label', this.str('label', 'Items'));
      const help = srText('Press Space to pick up. Use the arrow keys to move, Space to drop, Escape to cancel.');
      help.id = uid('usa-sgrid-help');
      const status = srText('');
      status.setAttribute('role', 'status');
      const names: string[] = [];
      const items = src.map((node, i) => {
        const el = make('div', 'usa-sgrid-item');
        el.setAttribute('role', 'listitem');
        el.tabIndex = 0;
        el.setAttribute('aria-describedby', help.id);
        el.dataset.item = String(i);
        el.append(node.cloneNode(true));
        names[i] = node.getAttribute('aria-label') || (node as HTMLElement).dataset?.label || node.textContent?.trim() || `Item ${i + 1}`;
        if (node.getAttribute('aria-label')) el.setAttribute('aria-label', names[i]);
        return el;
      });
      // the tiles sit in the DOM in their current order, so screen readers read them as they are seen
      order.forEach((i) => root.append(items[i]));
      root.append(help, status);
      this.append(root);

      let cell = 80;
      let rowH = 80;
      const layout = () => {
        const w = root.clientWidth || 320;
        cell = Math.max(24, (w - gap * (cols - 1)) / cols);
        rowH = rowAttr > 0 ? rowAttr : cell;
        const rows = Math.max(1, Math.ceil(n / cols));
        root.style.height = `${Math.round(rows * rowH + (rows - 1) * gap)}px`;
        for (const el of items) {
          el.style.width = `${Math.round(cell * 10) / 10}px`;
          el.style.height = `${Math.round(rowH * 10) / 10}px`;
        }
      };
      layout();
      const springs: SpringGroup[] = items.map((el, i) => {
        const p = gridSlot(order.indexOf(i), cols, cell, gap, rowH);
        return hostSprings(this, { x: p.x, y: p.y, s: 1 }, (v) => {
          el.style.transform = `translate(${Math.round(v.x * 10) / 10}px, ${Math.round(v.y * 10) / 10}px) scale(${Math.round(v.s * 1000) / 1000})`;
        });
      });
      /** Send every tile (but `skip`, which the finger holds) to its slot; staggered a little by distance. */
      const place = (animate: boolean, skip = -1) => {
        order.forEach((item, slot) => {
          if (item === skip) return;
          const p = gridSlot(slot, cols, cell, gap, rowH);
          if (animate) springs[item].set({ x: p.x, y: p.y }, { spring: { duration: 480, bounce: 0.22 } });
          else springs[item].jump({ x: p.x, y: p.y });
        });
      };
      place(false);
      const announce = (text: string) => (status.textContent = text);
      const syncDom = (keep?: HTMLElement) => {
        const had = keep && keep.ownerDocument?.activeElement === keep;
        order.forEach((i) => root.insertBefore(items[i], help));
        if (had) keep.focus({ preventScroll: true });
      };
      const moveTo = (item: number, to: number) => {
        const from = order.indexOf(item);
        if (from < 0 || to === from) return false;
        order.splice(from, 1);
        order.splice(to, 0, item);
        return true;
      };
      const lift = (item: number, on: boolean) => {
        items[item].toggleAttribute('data-lifted', on);
        root.toggleAttribute('data-editing', on);
        springs[item].set({ s: on ? 1.08 : 1 }, { spring: on ? 'snappy' : { duration: 420, bounce: 0.3 } });
      };
      const finish = (item: number, from: number) => {
        const to = order.indexOf(item);
        syncDom(items[item]);
        if (to !== from) {
          tick(this, 10);
          this.emit('reorder', { from, to, order: this.order });
        }
        return to;
      };

      // keyboard: pick up, move, drop / cancel
      let picked: { item: number; from: number; saved: number[] } | null = null;
      const drop = (cancel: boolean) => {
        if (!picked) return;
        const p = picked;
        picked = null;
        if (cancel) {
          order.splice(0, order.length, ...p.saved);
          place(true);
        }
        lift(p.item, false);
        const to = finish(p.item, p.from);
        announce(cancel ? `${names[p.item]}: move cancelled.` : `${names[p.item]} dropped at position ${to + 1} of ${n}.`);
      };
      this.listen(root, 'keydown', (e: KeyboardEvent) => {
        const el = (e.target as Element).closest?.('.usa-sgrid-item') as HTMLElement | null;
        if (!el || e.target !== el) return;
        const item = Number(el.dataset.item);
        if (!picked) {
          if (e.key !== ' ' && e.key !== 'Enter') return;
          e.preventDefault();
          picked = { item, from: order.indexOf(item), saved: order.slice() };
          lift(item, true);
          tick(this, 8);
          announce(`${names[item]} picked up, position ${picked.from + 1} of ${n}.`);
          return;
        }
        if (picked.item !== item) return;
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          drop(false);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          drop(true);
        } else if (/^(Arrow(Up|Down|Left|Right)|Home|End)$/.test(e.key)) {
          e.preventDefault();
          const to = slotStep(order.indexOf(item), e.key, cols, n);
          if (moveTo(item, to)) {
            place(true);
            tick(this, 4);
            announce(`Position ${to + 1} of ${n}.`);
          }
        }
      });
      this.listen(root, 'focusout', (e: FocusEvent) => {
        if (picked && e.target === items[picked.item] && e.relatedTarget !== items[picked.item]) drop(false);
      });

      // pointer: a mouse drags at once, touch and pen after a short hold (so the page still scrolls)
      let drag: { id: number; item: number; from: number; x0: number; y0: number; ox: number; oy: number; lx: number; ly: number; t: number; vx: number; vy: number; live: boolean; timer: ReturnType<typeof setTimeout> | 0 } | null = null;
      const clear = () => {
        if (drag?.timer) clearTimeout(drag.timer);
      };
      const start = (e: PointerEvent) => {
        if (!drag) return;
        drag.live = true;
        lift(drag.item, true);
        tick(this, 8);
        try {
          items[drag.item].setPointerCapture?.(e.pointerId);
        } catch {
          /* synthetic */
        }
      };
      this.listen(root, 'pointerdown', (e: PointerEvent) => {
        const el = (e.target as Element).closest?.('.usa-sgrid-item') as HTMLElement | null;
        if (!el || picked || drag || (e.pointerType === 'mouse' && e.button !== 0) || (e.target as Element).closest?.('a, button, input, textarea, select, [contenteditable]')) return;
        const item = Number(el.dataset.item);
        const r = root.getBoundingClientRect();
        const at = { x: springs[item].get('x'), y: springs[item].get('y') };
        drag = { id: e.pointerId, item, from: order.indexOf(item), x0: e.clientX, y0: e.clientY, ox: e.clientX - r.left - at.x, oy: e.clientY - r.top - at.y, lx: e.clientX, ly: e.clientY, t: e.timeStamp, vx: 0, vy: 0, live: false, timer: 0 };
        if (e.pointerType !== 'mouse') {
          drag.timer = setTimeout(() => {
            if (drag && !drag.live) start(e);
          }, 320);
        }
      });
      this.listen(root, 'pointermove', (e: PointerEvent) => {
        if (!drag || e.pointerId !== drag.id) return;
        if (!drag.live) {
          const moved = Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0);
          if (e.pointerType === 'mouse') {
            if (moved < 5) return;
            start(e);
          } else {
            // a touch that moves before the hold is a scroll
            if (moved > 8) {
              clear();
              drag = null;
            }
            return;
          }
        }
        const dt = Math.max(1, e.timeStamp - drag.t);
        drag.vx = drag.vx * 0.4 + (((e.clientX - drag.lx) / dt) * 1000) * 0.6;
        drag.vy = drag.vy * 0.4 + (((e.clientY - drag.ly) / dt) * 1000) * 0.6;
        drag.lx = e.clientX;
        drag.ly = e.clientY;
        drag.t = e.timeStamp;
        const r = root.getBoundingClientRect();
        const x = e.clientX - r.left - drag.ox;
        const y = e.clientY - r.top - drag.oy;
        springs[drag.item].jump({ x, y });
        const to = slotAtPoint(x + cell / 2, y + rowH / 2, cols, cell, gap, n, rowH);
        if (to >= 0 && moveTo(drag.item, to)) {
          place(true, drag.item);
          tick(this, 4);
        }
      });
      const end = (e: PointerEvent) => {
        if (!drag || e.pointerId !== drag.id) return;
        const d = drag;
        clear();
        drag = null;
        if (!d.live) return;
        const slot = order.indexOf(d.item);
        const p = gridSlot(slot, cols, cell, gap, rowH);
        const fresh = e.timeStamp - d.t < 90;
        springs[d.item].set({ x: p.x, y: p.y }, { spring: { duration: 520, bounce: 0.24 }, velocity: fresh ? { x: d.vx, y: d.vy } : undefined });
        lift(d.item, false);
        const to = finish(d.item, d.from);
        if (to !== d.from) announce(`${names[d.item]} moved to position ${to + 1} of ${n}.`);
      };
      this.listen(root, 'pointerup', end);
      this.listen(root, 'pointercancel', end);
      // once a tile is held, a touch drag moves the tile, not the page; and a long press opens no menu
      this.listen(root, 'touchmove', (e: TouchEvent) => {
        if (drag?.live && e.cancelable) e.preventDefault();
      }, { passive: false });
      this.listen(root, 'contextmenu', (e: Event) => {
        if (drag) e.preventDefault();
      });
      if (typeof ResizeObserver !== 'undefined') {
        const later = frameOnce(() => {
          layout();
          if (!drag) place(false);
        }, this);
        const ro = new ResizeObserver(() => later.ask());
        ro.observe(root);
        this.onCleanup(() => {
          ro.disconnect();
          later.cancel();
        });
      }
      this.onCleanup(() => {
        clear();
        drag = null;
        picked = null;
        springs.forEach((s) => s.stop());
        root.remove();
      });
    }
  }, { id: 'snap-kit-20', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
