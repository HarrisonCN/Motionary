import { caf, defineElement, raf, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import css from './parts-kit.css?raw';

/** The rows to render: [start, end) and the pixel offset of `start`, for a scroll position and a fixed row height. */
export function virtualWindow(scrollTop: number, viewport: number, rowHeight: number, count: number, overscan = 4): { start: number; end: number; offset: number } {
  const h = Math.max(1, rowHeight);
  const n = Math.max(0, Math.floor(count));
  const first = Math.floor(Math.max(0, scrollTop) / h);
  const start = Math.max(0, Math.min(n, first - Math.max(0, overscan)));
  const end = Math.min(n, first + Math.ceil(Math.max(0, viewport) / h) + Math.max(0, overscan) + 1);
  return { start, end, offset: start * h };
}

/**
 * A scrolling list that only puts the rows on screen into the page, so tens of thousands of items stay fast. Items come
 * from the `items` property (strings, or objects shown through `render`), from a child `script type="application/json"`
 * holding an array, or from the child `li` elements. Rows have one fixed height. The list is a focusable region with
 * `role="list"`; each row says where it sits (`aria-setsize`, `aria-posinset`), and arrow keys, Page Up / Down, Home and
 * End scroll it. Rows that scroll in fade up slightly unless motion is reduced.
 *
 * Attributes: `row-height` (px; 40), `height` (CSS height; 320px), `overscan` (rows; 4), `label` (List).
 * Event `usa:range` ({ start, end }) when the rendered rows change.
 */
export interface UsaVirtualListElement extends UsaElement {
  items: unknown[];
  render?: (item: unknown, index: number) => string | Node;
  scrollToIndex(index: number): void;
}

export function defineVirtualList(tag = 'usa-virtual-list'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class VirtualList extends Base {
    static get observedAttributes(): string[] { return ['row-height', 'height', 'overscan', 'label']; }
    private _items: unknown[] = [];
    private _render?: (item: unknown, index: number) => string | Node;
    private _refresh?: (force?: boolean) => void;
    private _box?: HTMLElement;
    get items(): unknown[] { return this._items; }
    set items(v: unknown[]) { this._items = Array.isArray(v) ? v : []; this._refresh?.(true); }
    get render(): ((item: unknown, index: number) => string | Node) | undefined { return this._render; }
    set render(fn: ((item: unknown, index: number) => string | Node) | undefined) { this._render = typeof fn === 'function' ? fn : undefined; this._refresh?.(true); }
    scrollToIndex(index: number): void {
      if (!this._box) return;
      const h = Math.max(8, this.num('row-height', 40));
      this._box.scrollTop = Math.max(0, Math.min(this._items.length - 1, Math.round(index))) * h;
    }
    mount(): void {
      const json = this.querySelector(':scope > script[type="application/json"]');
      const lis = Array.from(this.querySelectorAll(':scope > ul > li, :scope > ol > li, :scope > li')) as HTMLElement[];
      const source = Array.from(this.children) as HTMLElement[];
      if (!this._items.length) {
        if (json) { try { const v = JSON.parse(json.textContent || '[]'); if (Array.isArray(v)) this._items = v; } catch { /* not an array: keep the list empty */ } }
        else if (lis.length) this._items = lis.map((li) => li.textContent?.trim() ?? '');
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
      const shown = new Set<number>();
      const refresh = (force = false) => {
        pending = 0;
        const n = this._items.length;
        spacer.style.height = `${n * rowH}px`;
        const { start, end, offset } = virtualWindow(box.scrollTop, box.clientHeight || 320, rowH, n, Math.max(0, this.num('overscan', 4)));
        const key = `${start}:${end}`;
        if (key === last && !force) return;
        last = key;
        rows.style.transform = `translateY(${offset}px)`;
        const out: HTMLElement[] = [];
        for (let i = start; i < end; i++) {
          const li = make('li', 'usa-vlist-row');
          li.setAttribute('aria-setsize', String(n));
          li.setAttribute('aria-posinset', String(i + 1));
          const item = this._items[i];
          const made = this._render ? this._render(item, i) : item !== null && typeof item === 'object' ? String((item as any).label ?? (item as any).name ?? JSON.stringify(item)) : String(item);
          if (typeof made === 'string') li.textContent = made;
          else li.append(made);
          if (!force && !this.reduced && !shown.has(i)) li.dataset.new = '';
          out.push(li);
        }
        shown.clear();
        for (let i = start; i < end; i++) shown.add(i);
        rows.replaceChildren(...out);
        if (!force) this.emit('range', { start, end });
      };
      this._refresh = refresh;
      this.listen(box, 'scroll', () => { if (!pending) pending = raf(() => refresh(), this); }, { passive: true });
      this.listen(box, 'keydown', (e: KeyboardEvent) => {
        const page = box.clientHeight - rowH;
        const by: Record<string, number> = { ArrowDown: rowH, ArrowUp: -rowH, PageDown: page, PageUp: -page };
        if (e.key in by) { e.preventDefault(); box.scrollTop += by[e.key]; }
        else if (e.key === 'Home') { e.preventDefault(); box.scrollTop = 0; }
        else if (e.key === 'End') { e.preventDefault(); box.scrollTop = box.scrollHeight; }
      });
      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(() => refresh(true));
        ro.observe(box);
        this.onCleanup(() => ro.disconnect());
      }
      this.onCleanup(() => {
        if (pending) caf(pending);
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
