import { defineElement, type UsaElement } from '../base';
import { ownChildren } from './shared';
import css from './dock.css?raw';

/**
 * `<usa-dock>` (6.6) — a macOS-style dock: items magnify with a smooth
 * cosine falloff as the pointer moves along it, neighbours make room, and a
 * click bounces the item (`bounce`). Children are the items (`<a>` /
 * `<button>`, each with an accessible name); `data-label` shows a tooltip
 * label above the hovered item. Attributes: `magnify` (max scale, 1.9),
 * `range` (px of influence, 140), `orientation="horizontal | vertical"`.
 * Keyboard focus magnifies the focused item. Reduced motion: no
 * magnification or bounce (labels still show).
 */
export interface UsaDockElement extends UsaElement {
  readonly items: HTMLElement[];
}

export function defineDock(tag = 'usa-dock'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaDock extends Base {
        static get observedAttributes(): string[] {
          return ['orientation', 'magnify', 'range', 'label', 'bounce'];
        }
        private _items: HTMLElement[] = [];
        private _raf = 0;

        get items(): HTMLElement[] {
          return this._items;
        }

        mount(): void {
          this.dataset.orientation = this.str('orientation', 'horizontal') === 'vertical' ? 'vertical' : 'horizontal';
          this.setAttribute('role', this.getAttribute('role') || 'toolbar');
          if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', this.str('label', 'Dock'));
          this._items = ownChildren(this);
          this._items.forEach((it) => {
            it.classList.add('usa-dock-item');
            if (it.dataset.label && !it.getAttribute('aria-label') && !it.textContent?.trim()) it.setAttribute('aria-label', it.dataset.label);
            this.listen(it, 'click', () => this.bounce(it));
            this.listen(it, 'focus', () => this.magnifyAt(this.center(it)));
            this.listen(it, 'blur', () => this.magnifyAt(null));
          });
          this.listen(this, 'pointermove', (e: PointerEvent) => {
            const v = this.dataset.orientation === 'vertical' ? e.clientY : e.clientX;
            if (!this._raf) this._raf = typeof requestAnimationFrame === 'function' ? requestAnimationFrame(() => ((this._raf = 0), this.magnifyAt(v))) : (this.magnifyAt(v), 0);
          });
          this.listen(this, 'pointerleave', () => this.magnifyAt(null));
          this.onCleanup(() => {
            if (this._raf && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(this._raf);
          });
        }

        private center(it: HTMLElement): number {
          const r = it.getBoundingClientRect();
          return this.dataset.orientation === 'vertical' ? r.top + r.height / 2 : r.left + r.width / 2;
        }

        /** Scale every item by its distance to `pos` (client px), or reset with `null`. */
        magnifyAt(pos: number | null): void {
          const max = this.num('magnify', 1.9);
          const range = Math.max(20, this.num('range', 140));
          for (const it of this._items) {
            let s = 1;
            if (pos !== null && !this.reduced) {
              const d = Math.abs(this.center(it) - pos);
              if (d < range) s = 1 + (max - 1) * (0.5 + 0.5 * Math.cos((d / range) * Math.PI));
            }
            it.style.setProperty('--usa-dock-s', s.toFixed(3));
            it.toggleAttribute('data-near', s > 1.5 || (pos !== null && this.reduced && Math.abs(this.center(it) - pos) < 24));
          }
        }

        bounce(it: HTMLElement): void {
          if (this.reduced || !this.flag('bounce')) return;
          const v = this.dataset.orientation === 'vertical';
          this.motion(it, [{ translate: '0 0' }, { translate: v ? '18px 0' : '0 -22px', offset: 0.3 }, { translate: '0 0', offset: 0.55 }, { translate: v ? '8px 0' : '0 -9px', offset: 0.75 }, { translate: '0 0' }], { duration: 760, easing: 'ease-out' });
        }
      }
      return UsaDock as unknown as CustomElementConstructor;
    },
    { id: 'dock', text: css }
  );
}
