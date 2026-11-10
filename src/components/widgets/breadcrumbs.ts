import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import css from './breadcrumbs.css?raw';

/**
 * `<mo-breadcrumbs>` (17.3; legacy name `<usa-breadcrumbs>`) — a breadcrumb trail that animates as you navigate:
 * crumbs that stay keep their place, new ones slide in, dropped ones slide out (`set(items)`). When the trail is longer
 * than `max` (default 4), the middle collapses into a "…" button that expands the hidden crumbs with a stagger.
 * Children: links, with the current page last (any element; it gets `aria-current="page"`). They move into an `<ol>`
 * inside a `navigation` landmark named by `label` (default "Breadcrumb"); separators are CSS only. Methods
 * `set(items)` (`{ label, href? }[]`; values are written as text and attributes), `expand()`; property `items`;
 * event `usa:expand` (`{ hidden }`). Reduced motion: crumbs change without sliding.
 */
export interface BreadcrumbItem {
  label: string;
  href?: string;
}
export interface UsaBreadcrumbsElement extends UsaElement {
  readonly items: BreadcrumbItem[];
  set(items: BreadcrumbItem[]): void;
  expand(): void;
}

export function defineBreadcrumbs(tag = 'usa-breadcrumbs'): CustomElementConstructor | undefined {
  const C = defineElement(
    tag,
    (Base) => {
      class UsaBreadcrumbs extends Base {
        static get observedAttributes(): string[] {
          return ['label', 'max'];
        }
        private _ol: HTMLOListElement | null = null;
        private _expanded = false;

        get items(): BreadcrumbItem[] {
          return this.crumbs().map((li) => {
            const a = li.firstElementChild as HTMLElement | null;
            const href = a?.getAttribute('href');
            return href != null ? { label: a!.textContent || '', href } : { label: a?.textContent || '' };
          });
        }

        private crumbs(): HTMLLIElement[] {
          return this._ol ? Array.from(this._ol.children).filter((c): c is HTMLLIElement => c.localName === 'li' && !c.matches('.usa-bc-more,.usa-bc-out')) : [];
        }

        mount(): void {
          this.setAttribute('role', 'navigation');
          this.setAttribute('aria-label', this.str('label', 'Breadcrumb'));
          let ol = this.querySelector<HTMLOListElement>(':scope > ol.usa-bc-list');
          if (!ol) {
            ol = document.createElement('ol');
            ol.className = 'usa-bc-list';
            ol.setAttribute('data-usa-part', '');
            for (const node of Array.from(this.childNodes)) {
              if (node.nodeType === 1) {
                const li = document.createElement('li');
                li.append(node);
                ol.append(li);
              } else node.remove();
            }
            this.append(ol);
          }
          this._ol = ol;
          this.layout();
          this.listen(ol, 'click', (e: MouseEvent) => {
            if ((e.target as Element).closest('.usa-bc-more')) this.expand();
          });
        }

        /** aria-current on the last crumb; collapse the middle when longer than `max`. */
        private layout(): void {
          const ol = this._ol!;
          ol.querySelector(':scope > .usa-bc-more')?.remove();
          const list = this.crumbs();
          list.forEach((li, i) => {
            li.hidden = false;
            const el = li.firstElementChild;
            if (i === list.length - 1) el?.setAttribute('aria-current', 'page');
            else el?.removeAttribute('aria-current');
          });
          const max = Math.max(2, this.num('max', 4));
          if (this._expanded || list.length <= max) return;
          const hidden = list.slice(1, list.length - (max - 1));
          hidden.forEach((li) => (li.hidden = true));
          const more = document.createElement('li');
          more.className = 'usa-bc-more';
          const b = document.createElement('button');
          b.type = 'button';
          b.textContent = '…';
          b.setAttribute('aria-label', `Show ${hidden.length} more`);
          b.setAttribute('aria-expanded', 'false');
          more.append(b);
          list[0].after(more);
        }

        expand(): void {
          const more = this._ol?.querySelector<HTMLElement>(':scope > .usa-bc-more');
          if (!more) return;
          const hidden = this.crumbs().filter((li) => li.hidden);
          const focus = more.contains(document.activeElement);
          this._expanded = true;
          more.remove();
          hidden.forEach((li, i) => {
            li.hidden = false;
            if (!this.reduced) this.motion(li, [{ opacity: 0, transform: 'translateX(-10px)' }, { opacity: 1, transform: 'none' }], { duration: 260, delay: i * 50, easing: 'ease-out', fill: 'backwards' });
          });
          if (focus) (hidden[0]?.firstElementChild as HTMLElement | null)?.focus();
          this.emit('expand', { hidden: hidden.length });
        }

        set(items: BreadcrumbItem[]): void {
          const ol = this._ol;
          if (!ol) return;
          const old = this.crumbs();
          const prev = this.items;
          let keep = 0;
          while (keep < old.length && keep < items.length && prev[keep].label === items[keep].label && (prev[keep].href ?? null) === (items[keep].href ?? null)) keep++;
          this._expanded = false;
          for (const li of old.slice(keep)) {
            const a = this.reduced ? null : this.motion(li, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(12px)' }], { duration: 180, easing: 'ease-in' });
            li.classList.add('usa-bc-out');
            const rm = () => li.remove();
            if (a) a.finished.then(rm, rm);
            else rm();
          }
          const added: HTMLLIElement[] = [];
          for (const it of items.slice(keep)) {
            const li = document.createElement('li');
            const el = document.createElement(it.href != null ? 'a' : 'span');
            if (it.href != null) el.setAttribute('href', it.href);
            el.textContent = it.label;
            li.append(el);
            const out = ol.querySelector(':scope > .usa-bc-out');
            ol.insertBefore(li, out);
            added.push(li);
          }
          this.layout();
          if (!this.reduced) added.forEach((li, i) => !li.hidden && this.motion(li, [{ opacity: 0, transform: 'translateX(-12px)' }, { opacity: 1, transform: 'none' }], { duration: 280, delay: 80 + i * 60, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' }));
        }
      }
      return UsaBreadcrumbs as unknown as CustomElementConstructor;
    },
    { id: 'breadcrumbs', text: css }
  );
  defineMoName(tag, C);
  return C;
}
