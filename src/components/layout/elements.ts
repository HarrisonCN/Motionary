import { defineElement, type UsaElement } from '../base';
import { autoAnimate, masonryLayout } from './core';
import css from './layout.css?raw';

/**
 * `<usa-auto-animate>` — wraps `autoAnimate()`: any change to its children
 * (add, remove, re-order, filter, size) animates. Attributes `duration`
 * (300), `no-scale`. Works for lists and CSS grids alike.
 */
export interface UsaAutoAnimateElement extends UsaElement {
  enable(): void;
  disable(): void;
}

export function defineAutoAnimate(tag = 'usa-auto-animate'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaAutoAnimate extends Base {
        private _c: ReturnType<typeof autoAnimate> | null = null;
        enable(): void {
          this._c?.enable();
        }
        disable(): void {
          this._c?.disable();
        }
        mount(): void {
          const c = (this._c = autoAnimate(this, { duration: this.num('duration', 300), scale: !this.flag('no-scale') }));
          this.onCleanup(() => c.stop());
        }
      },
    { id: 'layout', text: css }
  );
}

/**
 * `<usa-masonry>` — a masonry (Pinterest-style) grid: children are placed in
 * the shortest column and glide to new spots when the width, the items or
 * their sizes change. Attributes `columns` (fixed count) or `min` (min
 * column width px, 220), `gap` (16). Without JS layout support it is a
 * plain CSS multi-column flow. Reduced motion: no glide.
 */
export interface UsaMasonryElement extends UsaElement {
  layout(): void;
}

export function defineMasonry(tag = 'usa-masonry'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaMasonry extends Base {
        static get observedAttributes(): string[] {
          return ['columns', 'min', 'gap'];
        }
        changed(): void {
          this.layout();
        }
        layout(): void {
          const items = Array.from(this.children).filter((c) => !(c as any).__usaGhost) as HTMLElement[];
          const w = this.clientWidth;
          if (!w) return;
          const gap = this.num('gap', 16);
          const cols = this.num('columns', 0) || Math.max(1, Math.floor((w + gap) / (this.num('min', 220) + gap)));
          const cw = (w - gap * (cols - 1)) / cols;
          items.forEach((el) => (el.style.width = `${cw}px`));
          const pos = masonryLayout(items.map((el) => el.offsetHeight), cols, cw, gap);
          items.forEach((el, i) => (el.style.transform = `translate(${pos[i].x}px, ${pos[i].y}px)`));
          this.style.height = `${pos.height}px`;
          this.style.setProperty('--usa-masonry-cols', String(cols));
        }
        mount(): void {
          this.setAttribute('data-js', '');
          this.onCleanup(() => this.removeAttribute('data-js'));
          let id = 0;
          const queue = () => {
            if (id) return;
            // contract-exempt: reduced-motion — rAF batches layout, no motion
            id = requestAnimationFrame(() => {
              id = 0;
              this.layout();
            });
          };
          if (typeof ResizeObserver === 'function') {
            const ro = new ResizeObserver(queue);
            ro.observe(this);
            Array.from(this.children).forEach((c) => ro.observe(c));
            const mo = new MutationObserver((recs) => {
              recs.forEach((r) => r.addedNodes.forEach((n) => n instanceof Element && ro.observe(n)));
              queue();
            });
            mo.observe(this, { childList: true });
            this.onCleanup(() => (ro.disconnect(), mo.disconnect()));
          }
          this.listen(this, 'load', queue, { capture: true });
          this.layout();
        }
        unmount(): void {
          this.style.height = '';
          Array.from(this.children).forEach((c) => ((c as HTMLElement).style.transform = '', (c as HTMLElement).style.width = ''));
        }
      },
    { id: 'layout', text: css }
  );
}
