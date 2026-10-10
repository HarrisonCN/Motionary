import { defineElement, type UsaElement } from '../base';
import { ownChildren, part, arrowIndex } from './shared';
import css from './nav-morph.css?raw';

/**
 * `<usa-nav-morph>` (6.6) — navigation links with an indicator that morphs
 * between them: it follows the hovered / focused link (stretching from the
 * old one, leading edge first) and settles back on the current page
 * (`aria-current="page"`, `active` index, or a click). `indicator="underline |
 * pill | blob | dot"`. Arrow keys move focus across links. Event
 * `usa:change` (`{ index }`). Reduced motion: the indicator jumps.
 */
export interface UsaNavMorphElement extends UsaElement {
  active: number;
}

export const NAV_INDICATORS = ['underline', 'pill', 'blob', 'dot'] as const;

export function defineNavMorph(tag = 'usa-nav-morph'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaNavMorph extends Base {
        static get observedAttributes(): string[] {
          return ['indicator', 'label', 'active'];
        }
        private _links: HTMLElement[] = [];
        private _ink: HTMLElement | null = null;
        private _active = 0;
        private _at = -1;

        get active(): number {
          return this._active;
        }
        set active(i: number) {
          this.setActive(i, false);
        }

        mount(): void {
          const ind = this.str('indicator', 'underline');
          this.dataset.indicator = (NAV_INDICATORS as readonly string[]).includes(ind) ? ind : 'underline';
          if (this.localName !== 'nav' && !this.hasAttribute('role')) this.setAttribute('role', 'navigation');
          if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', this.str('label', 'Main'));
          this.querySelectorAll(':scope > .usa-nm-ink').forEach((n) => n.remove());
          this._links = ownChildren(this);
          this._ink = part('span', 'usa-nm-ink', { 'aria-hidden': 'true' });
          this.prepend(this._ink);
          const cur = this._links.findIndex((l) => l.getAttribute('aria-current') === 'page');
          this._active = cur >= 0 ? cur : Math.max(0, Math.min(this._links.length - 1, Math.round(this.num('active', 0))));
          this._at = -1;
          this._links.forEach((l, i) => {
            this.listen(l, 'pointerenter', () => this.moveTo(i));
            this.listen(l, 'focus', () => this.moveTo(i));
            this.listen(l, 'click', () => this.setActive(i, true));
            this.listen(l, 'keydown', (e: KeyboardEvent) => {
              const n = arrowIndex(e, i, this._links.length);
              if (n >= 0) {
                e.preventDefault();
                this._links[n].focus();
              }
            });
          });
          this.listen(this, 'pointerleave', () => this.moveTo(this._active));
          this.listen(this, 'focusout', (e: FocusEvent) => !this.contains(e.relatedTarget as Node) && this.moveTo(this._active));
          this.sync();
          this.moveTo(this._active);
          if (typeof ResizeObserver === 'function') {
            const ro = new ResizeObserver(() => this.place(this._at < 0 ? this._active : this._at));
            ro.observe(this);
            this.onCleanup(() => ro.disconnect());
          }
        }

        private rect(i: number): [number, number] {
          const l = this._links[i];
          return l ? [l.offsetLeft, l.offsetWidth] : [0, 0];
        }

        private place(i: number): void {
          if (!this._ink) return;
          const [x, w] = this.rect(i);
          this._ink.style.transform = `translateX(${x}px)`;
          this._ink.style.width = `${w}px`;
        }

        private moveTo(i: number): void {
          const from = this._at;
          this._at = i;
          this.place(i);
          if (from < 0 || from === i || this.reduced || !this._ink) return;
          const [x0, w0] = this.rect(from);
          const [x1, w1] = this.rect(i);
          const mid = x1 > x0 ? { transform: `translateX(${x0}px)`, width: `${x1 + w1 - x0}px` } : { transform: `translateX(${x1}px)`, width: `${x0 + w0 - x1}px` };
          const blob = this.dataset.indicator === 'blob';
          this.motion(this._ink, [
            { transform: `translateX(${x0}px)`, width: `${w0}px` },
            { ...mid, offset: 0.4, ...(blob ? { borderRadius: '40% 60% 55% 45% / 60% 40% 60% 40%' } : {}) },
            { transform: `translateX(${x1}px)`, width: `${w1}px` },
          ], { duration: 420, easing: 'cubic-bezier(.22,1,.36,1)' });
        }

        private sync(): void {
          this._links.forEach((l, k) => {
            if (k === this._active) l.setAttribute('aria-current', 'page');
            else if (l.getAttribute('aria-current') === 'page') l.removeAttribute('aria-current');
          });
        }

        private setActive(i: number, user: boolean): void {
          const n = Math.max(0, Math.min(this._links.length - 1, Math.round(i)));
          const changed = n !== this._active;
          this._active = n;
          this.sync();
          this.moveTo(n);
          if (changed && user) this.emit('change', { index: n });
        }
      }
      return UsaNavMorph as unknown as CustomElementConstructor;
    },
    { id: 'nav-morph', text: css }
  );
}
