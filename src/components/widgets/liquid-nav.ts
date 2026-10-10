import { defineElement, type UsaElement } from '../base';
import css from './liquid-nav.css?raw';

/**
 * `<usa-liquid-nav>` (8.3) — a navigation bar whose active indicator is a
 * drop of liquid: moving to another item it stretches like a droplet
 * towards the target, then settles with a wobble (gooey SVG filter).
 * Children are links or buttons; `value` (index) / `aria-current`; arrow
 * keys move focus. `usa:change` { index, item }. A labelled `nav`; reduced
 * motion: the drop jumps.
 */
export interface UsaLiquidNavElement extends UsaElement {
  value: number;
}

let uid = 0;

export function defineLiquidNav(tag = 'usa-liquid-nav'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaLiquidNav extends Base {
        static get observedAttributes(): string[] {
          return ['label', 'value'];
        }
        private _i = 0;
        private _id = `usa-lq-${++uid}`;
        private items(): HTMLElement[] {
          return Array.from(this.children).filter((c) => !c.hasAttribute('data-usa-part')) as HTMLElement[];
        }
        get value(): number {
          return this._i;
        }
        set value(i: number) {
          this.select(i, false);
        }
        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          this.setAttribute('role', 'navigation');
          this.setAttribute('aria-label', this.str('label', 'Main'));
          this.insertAdjacentHTML(
            'afterbegin',
            `<svg class="usa-lq-defs" aria-hidden="true" width="0" height="0" data-usa-part><filter id="${this._id}"><feGaussianBlur in="SourceGraphic" stdDeviation="5"/><feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 20 -9"/></filter></svg><span class="usa-lq-goo" aria-hidden="true" style="filter:url(#${this._id})" data-usa-part><i class="usa-lq-drop"></i><i class="usa-lq-tail"></i></span>`
          );
          const items = this.items();
          const cur = items.findIndex((it) => it.getAttribute('aria-current') === 'page' || it.hasAttribute('data-active'));
          this._i = cur >= 0 ? cur : Math.max(0, Math.min(items.length - 1, Math.round(this.num('value', 0))));
          items.forEach((it, i) => {
            it.classList.add('usa-lq-item');
            this.listen(it, 'click', () => this.select(i, true));
            this.listen(it, 'keydown', (e: KeyboardEvent) => {
              const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
              if (!d) return;
              e.preventDefault();
              items[(i + d + items.length) % items.length].focus();
            });
          });
          requestAnimationFrame(() => this.place(false));
          this.place(false);
          this.listen(window, 'resize', () => this.place(false));
        }
        private select(i: number, user: boolean): void {
          const items = this.items();
          if (!items[i] || (i === this._i && user)) return;
          const from = this._i;
          this._i = i;
          this.place(user && !this.reduced, from);
          if (user) this.emit('change', { index: i, item: items[i] });
        }
        private place(animate: boolean, from = this._i): void {
          const items = this.items();
          items.forEach((it, k) => {
            if (k === this._i) it.setAttribute('aria-current', 'page');
            else it.removeAttribute('aria-current');
          });
          const it = items[this._i];
          const drop = this.querySelector('.usa-lq-drop') as HTMLElement | null;
          const tail = this.querySelector('.usa-lq-tail') as HTMLElement | null;
          if (!it || !drop || !tail) return;
          const x = it.offsetLeft + it.offsetWidth / 2;
          const px = items[from] ? items[from].offsetLeft + items[from].offsetWidth / 2 : x;
          drop.style.transform = `translateX(${x}px)`;
          tail.style.transform = `translateX(${x}px)`;
          if (!animate || px === x) return;
          const dir = Math.sign(x - px);
          this.motion(drop, [{ transform: `translateX(${px}px) scale(1)` }, { transform: `translateX(${px + (x - px) * 0.6}px) scale(1.35, .8)`, offset: 0.45 }, { transform: `translateX(${x + dir * 4}px) scale(.9, 1.12)`, offset: 0.75 }, { transform: `translateX(${x}px) scale(1)` }], { duration: 620, easing: 'cubic-bezier(.4,0,.2,1)' });
          this.motion(tail, [{ transform: `translateX(${px}px) scale(1)` }, { transform: `translateX(${px + (x - px) * 0.25}px) scale(.7)`, offset: 0.5 }, { transform: `translateX(${x}px) scale(.9)`, offset: 0.85 }, { transform: `translateX(${x}px) scale(1)` }], { duration: 760, easing: 'cubic-bezier(.4,0,.2,1)' });
        }
      }
      return UsaLiquidNav as unknown as CustomElementConstructor;
    },
    { id: 'liquid-nav', text: css }
  );
}
