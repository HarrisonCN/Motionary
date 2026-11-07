import { defineElement, type UsaElement } from '../base';
import css from './liquid-nav.css?raw';

/**
 * `<usa-liquid-nav>` (8.3) — a navigation bar whose active indicator is a
 * drop of liquid: moving to another item it stretches like a droplet
 * towards the target, then settles with a wobble (gooey SVG filter).
 * Children are links or buttons; `value` (index) / `aria-current`; arrow
 * keys move focus (RTL-aware); Home/End jump to the first/last enabled item.
 * `orientation="vertical"` places the drop beside a sidebar. Interrupted
 * transitions continue from the visible drop; layout changes realign it.
 * `usa:change` { index, item }. A labelled `nav`; reduced motion: the drop jumps.
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
          return ['label', 'value', 'orientation'];
        }
        private _i = 0;
        private _animations: Animation[] = [];
        private _id = `usa-lq-${++uid}`;
        private items(): HTMLElement[] {
          return Array.from(this.children).filter((c) => !c.hasAttribute('data-usa-part')) as HTMLElement[];
        }
        get value(): number {
          return this._i;
        }
        set value(i: number) {
          if (Number.isInteger(i) && this.items()[i]) this.setAttribute('value', String(i));
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
          this._i = !this.hasAttribute('value') && cur >= 0 ? cur : Math.max(0, Math.min(items.length - 1, Math.round(this.num('value', 0))));
          this.dataset.orientation = this.vertical ? 'vertical' : 'horizontal';
          items.forEach((it, i) => {
            it.classList.add('usa-lq-item');
            this.listen(it, 'click', () => this.select(i, true));
            this.listen(it, 'keydown', (e: KeyboardEvent) => {
              const enabled = items.filter((item) => !this.disabled(item));
              const rtl = getComputedStyle(this).direction === 'rtl';
              const next = this.vertical ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight';
              const previous = this.vertical ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft';
              const d = e.key === next ? 1 : e.key === previous ? -1 : 0;
              if ((!d && e.key !== 'Home' && e.key !== 'End') || !enabled.length) return;
              e.preventDefault();
              const index = e.key === 'Home' ? 0 : e.key === 'End' ? enabled.length - 1 : (enabled.indexOf(items[i]) + d + enabled.length) % enabled.length;
              enabled[index].focus();
            });
          });
          this.place(false);
          // ResizeObserver already batches size changes before paint; writing
          // transforms here does not resize the observed elements.
          const realign = () => this.place(false);
          if (typeof ResizeObserver === 'function') {
            const observer = new ResizeObserver(realign);
            observer.observe(this);
            items.forEach((item) => observer.observe(item));
            this.onCleanup(() => observer.disconnect());
          }
          this.listen(window, 'resize', realign);
        }
        private get vertical(): boolean {
          return this.getAttribute('orientation') === 'vertical';
        }
        private disabled(item: HTMLElement): boolean {
          return item.matches(':disabled, [aria-disabled="true"], [hidden], [inert]');
        }
        changed(name: string): void {
          if (name === 'value') {
            this.select(Math.max(0, Math.min(this.items().length - 1, Math.round(this.num('value', 0)))), false);
          } else super.changed(name);
        }
        private select(i: number, user: boolean): void {
          const items = this.items();
          if (!items[i] || (user && this.disabled(items[i])) || i === this._i) return;
          this._i = i;
          // Keep declarative state in sync so reconnects preserve the selection.
          this.setAttribute('value', String(i));
          this.place(user && !this.reduced);
          if (user) this.emit('change', { index: i, item: items[i] });
        }
        private stop(): void {
          this._animations.forEach((animation) => animation.cancel());
          this._animations = [];
        }
        unmount(): void {
          this.stop();
        }
        private place(animate: boolean): void {
          const items = this.items();
          items.forEach((it, k) => {
            if (k === this._i) it.setAttribute('aria-current', 'page');
            else it.removeAttribute('aria-current');
          });
          const it = items[this._i];
          const drop = this.querySelector<HTMLElement>('.usa-lq-drop');
          const tail = this.querySelector<HTMLElement>('.usa-lq-tail');
          if (!it || !drop || !tail) return;
          const vertical = this.vertical;
          const axis = vertical ? 'Y' : 'X';
          const target = vertical ? it.offsetTop + it.offsetHeight / 2 : it.offsetLeft + it.offsetWidth / 2;
          // Capture each rendered transform before cancellation. This also
          // preserves continuity inside scaled or transformed containers.
          const starts = [drop, tail].map((node) => getComputedStyle(node).transform);
          this.stop();
          const end = `translate${axis}(${target}px)`;
          drop.style.transform = end;
          tail.style.transform = end;
          if (!animate) return;
          const stretch = vertical ? 'scale(.8, 1.35)' : 'scale(1.35, .8)';
          [drop, tail].forEach((node, i) => {
            const animation = this.motion(node, [
              { transform: starts[i] },
              { transform: `${end} ${stretch}`, offset: 0.7 },
              { transform: end },
            ], { duration: i ? 760 : 620, easing: 'cubic-bezier(.4,0,.2,1)' });
            if (animation) this._animations.push(animation);
          });
        }
      }
      return UsaLiquidNav as unknown as CustomElementConstructor;
    },
    { id: 'liquid-nav', text: css }
  );
}
