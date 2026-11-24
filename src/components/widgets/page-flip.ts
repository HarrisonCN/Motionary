import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { clampTo } from './kit-13';
import css from './motion-kit-13.css?raw';

/** How far (degrees, 0 to -180) a page has turned when dragged `dx` px across a page `width` px wide. */
export const turnAngle = (dx: number, width: number): number => (width > 0 ? clampTo((dx / width) * 180, -180, 0) : 0);

/**
 * A book whose pages turn in 3D. Each child is one page (a `section`, `figure` or any element). Pages turn around the
 * spine with a shadow that deepens mid-turn; drag a page edge to turn it by hand (let go past halfway and it finishes,
 * otherwise it falls back), or use the Previous / Next buttons, the arrow keys on the book, or a swipe. Only the open
 * page is exposed to assistive technology, and a polite status says which page it is. Reduced motion swaps pages
 * without turning them.
 *
 * Attributes: `index` (0-based; 0), `label` (Book), `prev-label` (Previous page), `next-label` (Next page),
 * `page-label` ("Page {n} of {total}").
 * Event `usa:change` ({ index }).
 */
export interface UsaPageFlipElement extends UsaElement {
  index: number;
  next(): void;
  prev(): void;
}

export function definePageFlip(tag = 'usa-page-flip'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class PageFlip extends Base {
    static get observedAttributes(): string[] { return ['index', 'label', 'prev-label', 'next-label', 'page-label']; }
    private _i = 0;
    private _go?: (i: number, fire?: boolean) => void;
    get index(): number { return this._i; }
    set index(v: number) { this.setAttribute('index', String(v)); }
    next(): void { this._go?.(this._i + 1); }
    prev(): void { this._go?.(this._i - 1); }
    changed(name: string): void { if (name === 'index' && this._go) this._go(Math.round(this.num('index', 0)), false); else super.changed(name); }
    mount(): void {
      const pages = Array.from(this.children).filter((c) => !c.classList.contains('usa-kit')) as HTMLElement[];
      if (!pages.length) return;
      const root = make('div', 'usa-kit usa-book');
      root.setAttribute('role', 'region');
      root.setAttribute('aria-roledescription', 'book');
      root.setAttribute('aria-label', this.str('label', 'Book'));
      root.toggleAttribute('data-static', this.reduced);
      const stage = make('div', 'usa-book-stage');
      stage.tabIndex = 0;
      const leaves = pages.map((p, i) => {
        const leaf = make('div', 'usa-book-page');
        leaf.style.setProperty('--z', String(pages.length - i));
        const shade = make('span', 'usa-book-shade');
        shade.setAttribute('aria-hidden', 'true');
        leaf.append(p, shade);
        stage.append(leaf);
        return leaf;
      });
      const nav = make('div', 'usa-book-nav');
      const prev = make('button', 'usa-book-prev', '‹');
      const next = make('button', 'usa-book-next', '›');
      prev.type = next.type = 'button';
      prev.setAttribute('aria-label', this.str('prev-label', 'Previous page'));
      next.setAttribute('aria-label', this.str('next-label', 'Next page'));
      const status = make('span', 'usa-book-status');
      status.setAttribute('role', 'status');
      nav.append(prev, status, next);
      root.append(stage, nav);
      this.append(root);
      const total = leaves.length;
      const paint = () => {
        leaves.forEach((leaf, j) => {
          const turned = j < this._i;
          leaf.toggleAttribute('data-turned', turned);
          leaf.style.setProperty('--z', String(turned ? j + 1 : total - j + total));
          leaf.style.removeProperty('--turn');
          const open = j === this._i;
          leaf.toggleAttribute('inert', !open);
          leaf.setAttribute('aria-hidden', String(!open));
        });
        prev.disabled = this._i === 0;
        next.disabled = this._i >= total - 1;
        status.textContent = this.str('page-label', 'Page {n} of {total}').replace('{n}', String(this._i + 1)).replace('{total}', String(total));
      };
      const go = (i: number, fire = true) => {
        const k = clampTo(Math.round(i), 0, total - 1);
        if (k === this._i && fire) return;
        this._i = k;
        paint();
        if (fire) this.emit('change', { index: k });
      };
      this._go = go;
      this._i = clampTo(Math.round(this.num('index', this._i)), 0, total - 1);
      paint();
      this.listen(prev, 'click', () => go(this._i - 1));
      this.listen(next, 'click', () => go(this._i + 1));
      this.listen(stage, 'keydown', (e: KeyboardEvent) => {
        const rtl = getComputedStyle(this).direction === 'rtl';
        const fwd = rtl ? 'ArrowLeft' : 'ArrowRight', back = rtl ? 'ArrowRight' : 'ArrowLeft';
        const to = e.key === fwd || e.key === 'PageDown' ? this._i + 1 : e.key === back || e.key === 'PageUp' ? this._i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? total - 1 : null;
        if (to === null) return;
        e.preventDefault();
        go(to);
      });
      // drag: forward from the right half turns the open page; backward from the left half un-turns the last one
      let drag: { x: number; leaf: HTMLElement; forward: boolean; width: number } | null = null;
      this.listen(stage, 'pointerdown', (e: PointerEvent) => {
        if (e.button > 0 || (e.target as Element).closest('a,button,input,select,textarea,[contenteditable]')) return;
        const r = stage.getBoundingClientRect();
        const forward = e.clientX - r.left > r.width / 2;
        const leaf = forward ? leaves[this._i] : leaves[this._i - 1];
        if (!leaf || (forward && this._i >= total - 1)) return;
        drag = { x: e.clientX, leaf, forward, width: r.width || 1 };
        try { stage.setPointerCapture(e.pointerId); } catch { /* synthetic */ }
        root.setAttribute('data-dragging', '');
      });
      this.listen(stage, 'pointermove', (e: PointerEvent) => {
        if (!drag || this.reduced) return;
        const dx = e.clientX - drag.x;
        const a = drag.forward ? turnAngle(dx, drag.width) : -180 + Math.max(0, Math.min(180, (dx / drag.width) * 180));
        drag.leaf.style.setProperty('--turn', `${a}deg`);
        drag.leaf.style.setProperty('--z', String(total * 3));
      });
      const end = (e: PointerEvent) => {
        if (!drag) return;
        const dx = e.clientX - drag.x;
        root.removeAttribute('data-dragging');
        const d = drag;
        drag = null;
        if (d.forward && dx < -Math.min(60, d.width * 0.25)) go(this._i + 1);
        else if (!d.forward && dx > Math.min(60, d.width * 0.25)) go(this._i - 1);
        else paint();
      };
      this.listen(stage, 'pointerup', end);
      this.listen(stage, 'pointercancel', end);
      this.onCleanup(() => {
        for (const p of pages) this.append(p);
        root.remove();
        this._go = undefined;
      });
    }
  }, { id: 'motion-kit-13', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
