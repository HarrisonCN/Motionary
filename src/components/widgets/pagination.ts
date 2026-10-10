import { defineElement, type UsaElement } from '../base';
import { clampN, dropParts } from './shared';
import css from './pagination.css?raw';

/**
 * `<usa-pagination>` (6.7) — page buttons with a sliding "ink" that springs
 * to the current page (squashing as it travels) and numbers that slide in
 * from the direction of travel when the window of pages shifts. Attributes
 * `total`, `page` (1-based), `siblings` (pages each side, 1). Prev / next
 * buttons, ellipses, `aria-current="page"`; event `usa:change` (`{ page }`).
 * Reduced motion: the ink jumps and numbers do not slide.
 */
export interface UsaPaginationElement extends UsaElement {
  page: number;
  readonly total: number;
}

/** The visible page list: numbers and `'…'` gaps (1-based). */
export function pageWindow(page: number, total: number, siblings = 1): (number | '…')[] {
  const out: (number | '…')[] = [];
  const lo = Math.max(2, page - siblings);
  const hi = Math.min(total - 1, page + siblings);
  out.push(1);
  if (lo > 2) out.push('…');
  for (let p = lo; p <= hi; p++) out.push(p);
  if (hi < total - 1) out.push('…');
  if (total > 1) out.push(total);
  return out;
}

export function definePagination(tag = 'usa-pagination'): CustomElementConstructor | undefined {
  // contract-exempt: attr-unobserved(page) — state reflected by the element itself (set the property instead); observing it would re-mount on every change
  return defineElement(
    tag,
    (Base) => {
      class UsaPagination extends Base {
        static get observedAttributes(): string[] {
          return ['total', 'siblings', 'label'];
        }
        private _page = 1;
        private _ink: HTMLElement | null = null;
        private _list: HTMLElement | null = null;

        get total(): number {
          return Math.max(1, this.num('total', 1) | 0);
        }
        get page(): number {
          return this._page;
        }
        set page(p: number) {
          this.go(p);
        }

        mount(): void {
          dropParts(this);
          this.setAttribute('role', 'navigation');
          if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', this.str('label', 'Pagination'));
          this._page = clampN(this.num('page', 1) | 0, 1, this.total);
          const prev = this.btn('‹', 'Previous page', 'usa-pg-prev');
          const next = this.btn('›', 'Next page', 'usa-pg-next');
          this._list = document.createElement('span');
          this._list.className = 'usa-pg-list';
          this._list.setAttribute('data-usa-part', '');
          this._ink = document.createElement('span');
          this._ink.className = 'usa-pg-ink';
          this._ink.setAttribute('aria-hidden', 'true');
          this._list.appendChild(this._ink);
          this.append(prev, this._list, next);
          this.listen(prev, 'click', () => this.go(this._page - 1));
          this.listen(next, 'click', () => this.go(this._page + 1));
          this.listen(this._list, 'click', (e: Event) => {
            const b = (e.target as HTMLElement).closest?.('[data-page]') as HTMLElement | null;
            if (b) this.go(Number(b.dataset.page));
          });
          this.render(0);
        }

        private btn(txt: string, label: string, cls: string): HTMLButtonElement {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'usa-pg-btn ' + cls;
          b.textContent = txt;
          b.setAttribute('aria-label', label);
          b.setAttribute('data-usa-part', '');
          return b;
        }

        private render(dir: number): void {
          const list = this._list!;
          const old = new Map(Array.from(list.querySelectorAll<HTMLElement>('[data-page]')).map((b) => [b.dataset.page, b]));
          list.querySelectorAll('.usa-pg-btn,.usa-pg-gap').forEach((n) => n.remove());
          for (const p of pageWindow(this._page, this.total, Math.max(0, this.num('siblings', 1) | 0))) {
            if (p === '…') {
              const g = document.createElement('span');
              g.className = 'usa-pg-gap';
              g.textContent = '…';
              g.setAttribute('aria-hidden', 'true');
              list.appendChild(g);
              continue;
            }
            const b = this.btn(String(p), `Page ${p}`, 'usa-pg-num');
            b.dataset.page = String(p);
            if (p === this._page) b.setAttribute('aria-current', 'page');
            list.appendChild(b);
            if (dir && !old.has(String(p)) && !this.reduced) this.motion(b, [{ transform: `translateX(${dir * 14}px)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 280, easing: 'ease-out' });
          }
          (this.querySelector('.usa-pg-prev') as HTMLButtonElement).disabled = this._page <= 1;
          (this.querySelector('.usa-pg-next') as HTMLButtonElement).disabled = this._page >= this.total;
          this.placeInk(dir !== 0);
        }

        private placeInk(animate: boolean): void {
          const cur = this._list?.querySelector<HTMLElement>('[aria-current="page"]');
          const ink = this._ink;
          if (!cur || !ink) return;
          const from = ink.style.transform;
          const to = `translateX(${cur.offsetLeft}px)`;
          ink.style.width = cur.offsetWidth + 'px';
          ink.style.transform = to;
          if (animate && from && from !== to && !this.reduced) this.motion(ink, [{ transform: from }, { transform: `${to} scaleX(1.35) scaleY(.8)`, offset: 0.55 }, { transform: to }], { duration: 420, easing: 'cubic-bezier(.3,1.3,.5,1)' });
        }

        go(p: number): void {
          const v = clampN(Math.round(p), 1, this.total);
          if (v === this._page) return;
          const dir = v > this._page ? 1 : -1;
          this._page = v;
          this.setAttribute('page', String(v));
          this.render(dir);
          this.emit('change', { page: v });
        }
      }
      return UsaPagination as unknown as CustomElementConstructor;
    },
    { id: 'pagination', text: css }
  );
}
