import { caf, defineElement, raf, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import css from './ui-blocks.css?raw';

/**
 * An "On this page" table of contents that follows the reader: the link of the section in view gets
 * `aria-current="location"` and a marker slides to it. Without link children it builds the list from the headings
 * inside `target` (their text is copied as plain text; headings without an id are skipped). Clicking a link scrolls
 * smoothly (instantly under reduced motion), moves focus to the heading and updates the address hash.
 *
 * Attributes: `target` (CSS selector of the content; the document by default), `selector` (h2[id], h3[id]),
 * `label` (On this page), `offset` (px kept clear at the top, e.g. under a sticky header; 80).
 * Method `refresh()` (rebuild after the content changed). Event `usa:change` ({ id, index }).
 */
export interface UsaScrollspyElement extends UsaElement {
  readonly current: string;
  refresh(): void;
}

export function defineScrollspy(tag = 'usa-scrollspy'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class Scrollspy extends Base {
    static get observedAttributes(): string[] { return ['target', 'selector', 'label', 'offset']; }
    private _current = '';
    get current(): string { return this._current; }
    refresh(): void { this.changed('refresh'); }
    mount(): void {
      const own = Array.from(this.querySelectorAll<HTMLAnchorElement>(':scope > a[href^="#"], :scope > ul a[href^="#"], :scope > ol a[href^="#"]'));
      const original = Array.from(this.childNodes);
      const homes = own.map((a) => [a, a.parentNode!, a.nextSibling] as const);
      const root = make('nav', 'usa-kit usa-spy');
      root.setAttribute('aria-label', this.str('label', 'On this page'));
      const title = make('p', 'usa-spy-title', this.str('label', 'On this page'));
      title.setAttribute('aria-hidden', 'true');
      const list = make('ol', 'usa-spy-list');
      const marker = make('span', 'usa-spy-marker');
      marker.setAttribute('aria-hidden', 'true');
      const scope: ParentNode = (this.str('target') && document.querySelector(this.str('target'))) || document;
      let links: HTMLAnchorElement[];
      if (own.length) {
        links = own;
        for (const a of own) {
          const li = make('li', 'usa-spy-item');
          li.append(a);
          list.append(li);
        }
        for (const n of original) if (n.parentNode === this) n.parentNode.removeChild(n);
      } else {
        let headings: HTMLElement[] = [];
        try { headings = Array.from(scope.querySelectorAll<HTMLElement>(this.str('selector', 'h2[id], h3[id]'))); } catch { /* invalid selector → empty */ }
        links = headings.filter((h) => h.id && !this.contains(h)).slice(0, 80).map((h) => {
          const li = make('li', 'usa-spy-item');
          li.dataset.level = h.tagName.length === 2 ? h.tagName.charAt(1) : '2';
          const a = make('a', 'usa-spy-link', (h.textContent || '').trim());
          a.href = `#${encodeURIComponent(h.id)}`;
          li.append(a);
          list.append(li);
          return a;
        });
      }
      for (const a of links) a.classList.add('usa-spy-link');
      list.append(marker);
      root.append(title, list);
      this.append(root);
      const idOf = (a: HTMLAnchorElement) => { try { return decodeURIComponent(a.getAttribute('href')!.slice(1)); } catch { return a.getAttribute('href')!.slice(1); } };
      const sections = links.map((a) => document.getElementById(idOf(a)));
      const offset = Math.max(0, this.num('offset', 80));
      const setCurrent = (index: number) => {
        const a = links[index];
        const id = a ? idOf(a) : '';
        links.forEach((l, i) => (i === index ? l.setAttribute('aria-current', 'location') : l.removeAttribute('aria-current')));
        if (a) {
          marker.hidden = false;
          marker.style.setProperty('--y', `${a.offsetTop}px`);
          marker.style.setProperty('--h', `${a.offsetHeight}px`);
        } else marker.hidden = true;
        root.toggleAttribute('data-static', this.reduced);
        if (id !== this._current) {
          this._current = id;
          if (id) this.emit('change', { id, index });
        }
      };
      // the current section is the last one whose top has passed the offset line
      let pending = 0;
      const update = () => {
        pending = 0;
        let index = -1;
        sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top - offset <= 1) index = i; });
        if (index < 0 && sections.some(Boolean)) index = sections.findIndex(Boolean);
        // at the very bottom, the last section counts even if its heading never reached the line
        const end = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
        if (end) for (let i = sections.length - 1; i >= 0; i--) if (sections[i]) { index = i; break; }
        setCurrent(index);
      };
      const queue = () => { if (!pending) pending = raf(update); };
      this.listen(window, 'scroll', queue, { passive: true });
      this.listen(window, 'resize', queue, { passive: true });
      this.onCleanup(() => pending && caf(pending));
      this.listen(list, 'click', (e: MouseEvent) => {
        const a = (e.target as Element).closest?.('a') as HTMLAnchorElement | null;
        const index = a ? links.indexOf(a) : -1;
        const section = sections[index];
        if (!a || !section || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        const y = section.getBoundingClientRect().top + window.scrollY - offset + 1;
        window.scrollTo({ top: y, behavior: this.reduced ? 'auto' : 'smooth' });
        if (!section.hasAttribute('tabindex')) section.setAttribute('tabindex', '-1');
        section.focus({ preventScroll: true });
        try { history.replaceState(history.state, '', a.getAttribute('href')!); } catch { /* sandboxed */ }
        setCurrent(index);
      });
      this.onCleanup(() => {
        root.remove();
        for (const a of own) a.classList.remove('usa-spy-link'), a.removeAttribute('aria-current');
        if (own.length) {
          this.append(...original);
          for (const [a, parent, next] of [...homes].reverse()) parent.insertBefore(a, next && next.parentNode === parent ? next : null);
        }
      });
      update();
    }
  }, { id: 'ui-blocks', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
