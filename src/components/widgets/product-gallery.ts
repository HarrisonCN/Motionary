import { defineElement, type UsaElement } from '../base';
import css from './product-gallery.css?raw';

/**
 * `<usa-product-gallery>` (7.3) — a product image gallery from its `<img>`
 * children: a large stage plus a thumbnail strip. Picking a thumbnail (click,
 * ←/→, swipe on touch) cross-slides the stage in the direction of travel; the
 * active thumbnail's ring glides to it. Hovering the stage zooms the photo
 * under the pointer (`zoom`, default 2; `nozoom` turns it off). `index`
 * property / attribute; `usa:change` (`{ index }`). The stage is a labelled
 * `group` whose label says "Image 2 of 4: alt". Reduced motion: images swap
 * instantly and the hover zoom is off.
 */
export interface UsaProductGalleryElement extends UsaElement {
  index: number;
  readonly count: number;
  go(i: number): void;
  next(): void;
  prev(): void;
}

/** Wrap an index into 0..n-1 (7.3). */
export const wrapIndex = (i: number, n: number): number => (n ? ((i % n) + n) % n : 0);

export function defineProductGallery(tag = 'usa-product-gallery'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaProductGallery extends Base {
        static get observedAttributes(): string[] {
          return ['index', 'nozoom', 'zoom'];
        }
        private _i = 0;
        private _imgs: HTMLImageElement[] = [];

        get count(): number {
          return this._imgs.length;
        }
        get index(): number {
          return this._i;
        }
        set index(v: number) {
          this.go(v);
        }

        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          this._imgs = Array.from(this.querySelectorAll<HTMLImageElement>(':scope > img'));
          this._imgs.forEach((im) => (im.hidden = true));
          this.insertAdjacentHTML('beforeend', '<div class="usa-pg2-stage" data-usa-part role="group" tabindex="0"><img class="usa-pg2-main" alt=""></div><div class="usa-pg2-thumbs" data-usa-part role="tablist" aria-label="Product images"></div>');
          const thumbs = this.querySelector('.usa-pg2-thumbs') as HTMLElement;
          this._imgs.forEach((im, i) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'usa-pg2-thumb';
            b.setAttribute('role', 'tab');
            b.setAttribute('aria-label', im.alt || `Image ${i + 1}`);
            b.innerHTML = `<img alt="" src="${im.getAttribute('src') || ''}">`;
            this.listen(b, 'click', () => this.go(i));
            thumbs.appendChild(b);
          });
          thumbs.insertAdjacentHTML('beforeend', '<i class="usa-pg2-ring" aria-hidden="true"></i>');
          const stage = this.querySelector('.usa-pg2-stage') as HTMLElement;
          const main = this.querySelector('.usa-pg2-main') as HTMLImageElement;
          this.listen(stage, 'keydown', (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') (this.next(), e.preventDefault());
            if (e.key === 'ArrowLeft') (this.prev(), e.preventDefault());
          });
          this.listen(thumbs, 'keydown', (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
              e.key === 'ArrowRight' ? this.next() : this.prev();
              (thumbs.children[this._i] as HTMLElement)?.focus();
              e.preventDefault();
            }
          });
          let sx = 0;
          this.listen(stage, 'pointerdown', (e: PointerEvent) => (sx = e.clientX));
          this.listen(stage, 'pointerup', (e: PointerEvent) => {
            const dx = e.clientX - sx;
            if (e.pointerType !== 'mouse' && Math.abs(dx) > 40) dx < 0 ? this.next() : this.prev();
          });
          this.listen(stage, 'pointermove', (e: PointerEvent) => {
            if (e.pointerType !== 'mouse' || this.reduced || this.flag('nozoom')) return;
            const r = stage.getBoundingClientRect();
            main.style.transformOrigin = `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}% ${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`;
            main.style.transform = `scale(${this.num('zoom', 2)})`;
          });
          this.listen(stage, 'pointerleave', () => (main.style.transform = ''));
          this._i = wrapIndex(this.num('index', 0), this.count);
          this.paint(0);
        }

        changed(): void {
          if (this.isConnected && this._imgs.length) this.go(this.num('index', 0));
        }

        go(i: number): void {
          const n = wrapIndex(Math.round(i), this.count);
          if (n === this._i) return;
          const dir = n > this._i ? 1 : -1;
          this._i = n;
          this.paint(dir);
          this.emit('change', { index: n });
        }
        next(): void {
          this.go(wrapIndex(this._i + 1, this.count));
        }
        prev(): void {
          this.go(wrapIndex(this._i - 1, this.count));
        }

        private paint(dir: number): void {
          const im = this._imgs[this._i];
          const main = this.querySelector('.usa-pg2-main') as HTMLImageElement | null;
          if (!im || !main) return;
          main.src = im.getAttribute('src') || '';
          main.alt = im.alt;
          this.querySelector('.usa-pg2-stage')!.setAttribute('aria-label', `Image ${this._i + 1} of ${this.count}${im.alt ? `: ${im.alt}` : ''}`);
          const thumbs = Array.from(this.querySelectorAll<HTMLElement>('.usa-pg2-thumb'));
          thumbs.forEach((t, k) => (t.setAttribute('aria-selected', String(k === this._i)), (t.tabIndex = k === this._i ? 0 : -1)));
          const t = thumbs[this._i];
          const ring = this.querySelector('.usa-pg2-ring') as HTMLElement;
          if (t && ring) {
            ring.style.transform = `translateX(${t.offsetLeft}px)`;
            ring.style.width = `${t.offsetWidth || 56}px`;
          }
          if (dir && !this.reduced) this.motion(main, [{ transform: `translateX(${dir * 18}%)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.2,.8,.2,1)' });
        }
      }
      return UsaProductGallery as unknown as CustomElementConstructor;
    },
    { id: 'product-gallery', text: css }
  );
}
