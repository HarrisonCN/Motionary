import { defineElement, raf, caf, type UsaElement } from '../base';
import css from './spotlight.css?raw';

/**
 * `<usa-spotlight>` — the Windows Fluent "Reveal highlight": a soft light
 * follows the pointer across a group of items, lighting up their borders
 * (even of neighbours) and the background of the hovered one. Put buttons,
 * tiles or menu items inside; each direct child is an item (or mark items
 * with `data-spotlight` to pick them yourself).
 *
 * Attributes: `size` (px, radius of the light, 160), `color` (default a
 * translucent white), `border` (px width of the lit border, 1),
 * `no-fill` (only light the borders). Not a motion effect, so it stays on
 * under reduced motion; off on touch-only devices.
 */
export type UsaSpotlightElement = UsaElement;

export function defineSpotlight(tag = 'usa-spotlight'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaSpotlight extends Base {
        static get observedAttributes(): string[] {
          return ['size', 'color', 'border'];
        }

        private _frame = 0;

        private items(): HTMLElement[] {
          const marked = Array.from(this.querySelectorAll<HTMLElement>('[data-spotlight]'));
          const items = marked.length ? marked : (Array.from(this.children) as HTMLElement[]);
          items.forEach((el) => el.classList.add('usa-spotlight-item'));
          return items;
        }

        mount(): void {
          const size = this.getAttribute('size');
          if (size) this.style.setProperty('--usa-spot-size', `${Number(size)}px`);
          const color = this.getAttribute('color');
          if (color) this.style.setProperty('--usa-spot-color', color);
          const border = this.getAttribute('border');
          if (border) this.style.setProperty('--usa-spot-border', `${Number(border)}px`);
          let items = this.items();
          let x = 0;
          let y = 0;
          const apply = () => {
            this._frame = 0;
            // All reads, then all writes
            const rects = items.map((el) => el.getBoundingClientRect());
            rects.forEach((r, i) => {
              items[i].style.setProperty('--usa-spot-x', `${(x - r.left).toFixed(1)}px`);
              items[i].style.setProperty('--usa-spot-y', `${(y - r.top).toFixed(1)}px`);
            });
          };
          this.listen(this, 'pointerenter', (e: PointerEvent) => {
            if (e.pointerType === 'touch') return;
            items = this.items();
            this.setAttribute('data-lit', '');
          });
          this.listen(this, 'pointermove', (e: PointerEvent) => {
            if (e.pointerType === 'touch') return;
            x = e.clientX;
            y = e.clientY;
            if (!this.hasAttribute('data-lit')) this.setAttribute('data-lit', '');
            // contract-exempt: reduced-motion — pointer-follow light, not a motion effect (documented to stay on under reduced motion)
            if (!this._frame) this._frame = raf(apply);
          });
          this.listen(this, 'pointerleave', () => this.removeAttribute('data-lit'));
        }

        unmount(): void {
          caf(this._frame);
          this._frame = 0;
          this.removeAttribute('data-lit');
        }
      },
    { id: 'spotlight', text: css }
  );
}
