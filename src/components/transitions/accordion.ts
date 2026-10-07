import { defineElement, EASE_OUT, type UsaElement } from '../base';
import css from './accordion.css?raw';

/**
 * `<usa-accordion>` — smooth expand / collapse for the native `<details>`
 * elements inside it (keeps their semantics, keyboard support and
 * find-in-page, and adds no wrapper elements, so framework-rendered content
 * is left alone). Only one stays open unless `multiple` is set.
 *
 * Attributes: `multiple`, `duration` (ms, 300). Event: `usa:toggle`
 * (`detail.details`, `detail.open`). Reduced motion: instant.
 * Heights are measured once per toggle and animated on the `<details>`.
 */
export interface UsaAccordionElement extends UsaElement {
  readonly items: HTMLDetailsElement[];
  toggleItem(details: HTMLDetailsElement, open?: boolean): Promise<void>;
}

export function defineAccordion(tag = 'usa-accordion'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaAccordion extends Base {
        static get observedAttributes(): string[] {
          return [];
        }

        private _running = new WeakMap<HTMLDetailsElement, Animation>();

        get items(): HTMLDetailsElement[] {
          return Array.from(this.children).filter((c): c is HTMLDetailsElement => c.tagName === 'DETAILS');
        }

        mount(): void {
          this.listen(this, 'click', (e: MouseEvent) => {
            const summary = (e.target as Element).closest?.('summary');
            const d = summary?.parentElement;
            if (!summary || !d || d.tagName !== 'DETAILS' || d.parentElement !== this) return;
            e.preventDefault();
            this.toggleItem(d as HTMLDetailsElement);
          });
        }

        /** Height of `d` when closed: its summary plus its own padding and border. */
        private closedHeight(d: HTMLDetailsElement): number {
          const summary = d.querySelector(':scope > summary');
          const cs = typeof getComputedStyle === 'function' ? getComputedStyle(d) : null;
          const extra = cs
            ? ['paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth'].reduce((n, k) => n + (parseFloat((cs as any)[k]) || 0), 0)
            : 0;
          return (summary ? summary.getBoundingClientRect().height : 0) + extra;
        }

        async toggleItem(d: HTMLDetailsElement, open = !d.open || d.hasAttribute('data-closing')): Promise<void> {
          if (open && !this.flag('multiple')) this.items.forEach((o) => o !== d && o.open && this.toggleItem(o, false));
          this._running.get(d)?.cancel();
          this._running.delete(d);
          const duration = this.reduced ? 0 : this.num('duration', 300);
          const startH = d.getBoundingClientRect().height;
          if (open) {
            d.removeAttribute('data-closing');
            d.open = true;
          }
          this.emit('toggle', { details: d, open });
          if (!duration || typeof d.animate !== 'function') {
            if (!open) d.open = false;
            return;
          }
          const endH = open ? d.getBoundingClientRect().height : this.closedHeight(d);
          if (!open) d.setAttribute('data-closing', '');
          d.style.overflow = 'hidden';
          const a = d.animate([{ height: `${startH}px` }, { height: `${endH}px` }], { duration, easing: EASE_OUT });
          this._running.set(d, a);
          await a.finished.catch(() => undefined);
          if (this._running.get(d) !== a) return;
          this._running.delete(d);
          d.style.overflow = '';
          if (!open) {
            d.open = false;
            d.removeAttribute('data-closing');
          }
        }
      },
    { id: 'accordion', text: css }
  );
}
