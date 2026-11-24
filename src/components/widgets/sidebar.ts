import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make, uniqueId } from './moments';
import { ownChildren } from './kit';
import css from './ui-blocks.css?raw';

/**
 * A vertical navigation rail that collapses to icons. A pill glides to the current item with a small overshoot; the
 * rail's width springs between its two sizes. The element's own `<a>` / `<button>` children are the items: each may
 * carry `data-icon` (a short glyph or emoji shown when collapsed) and `aria-current="page"` for the current one.
 * Collapsed labels stay in the accessibility tree (visually hidden), so each item keeps its name.
 *
 * Attributes: `label` (Sidebar, the nav's accessible name), `collapsed`, `collapse-label` (Collapse sidebar), `expand-label` (Expand sidebar).
 * Method `toggle(force?)`. Events `usa:toggle` ({ collapsed }), `usa:select` ({ index, item }).
 */
export interface UsaSidebarElement extends UsaElement {
  collapsed: boolean;
  toggle(force?: boolean): boolean;
}

export function defineSidebar(tag = 'usa-sidebar'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class Sidebar extends Base {
    static get observedAttributes(): string[] { return ['label', 'collapsed', 'expand-label', 'collapse-label']; }
    private _sync?: () => void;
    get collapsed(): boolean { return this.flag('collapsed'); }
    set collapsed(on: boolean) { this.setFlag('collapsed', !!on); }
    toggle(force?: boolean): boolean {
      this.collapsed = force === undefined ? !this.collapsed : !!force;
      return this.collapsed;
    }
    changed(): void { this._sync?.(); }
    mount(): void {
      const original = ownChildren(this);
      const items = original.filter((el) => el.matches('a,button'));
      const others = original.filter((el) => !items.includes(el));
      const root = make('nav', 'usa-kit usa-side');
      const list = make('ul', 'usa-side-list');
      list.id = uniqueId('usa-side');
      const pill = make('span', 'usa-side-pill');
      pill.setAttribute('aria-hidden', 'true');
      const toggle = make('button', 'usa-side-toggle');
      toggle.type = 'button';
      toggle.setAttribute('aria-controls', list.id);
      toggle.append(make('span', 'usa-side-chevron'), make('span', 'usa-sr'));
      const wraps = items.map((item) => {
        const li = make('li', 'usa-side-item');
        const icon = make('span', 'usa-side-icon', item.dataset.icon || (item.textContent || '').trim().charAt(0) || '•');
        icon.setAttribute('aria-hidden', 'true');
        const text = make('span', 'usa-side-text');
        text.append(...Array.from(item.childNodes));
        item.append(icon, text);
        item.classList.add('usa-side-link');
        li.append(item);
        list.append(li);
        return { item, text };
      });
      list.append(pill);
      root.append(toggle, list);
      if (others.length) {
        const foot = make('div', 'usa-side-foot');
        foot.append(...others);
        root.append(foot);
      }
      this.append(root);
      let current = Math.max(0, items.findIndex((i) => i.getAttribute('aria-current') === 'page' || i.getAttribute('aria-current') === 'true'));
      const place = () => {
        const it = items[current];
        if (!it) { pill.hidden = true; return; }
        pill.hidden = false;
        pill.style.setProperty('--y', `${it.offsetTop}px`);
        pill.style.setProperty('--h', `${it.offsetHeight}px`);
      };
      const sync = () => {
        const collapsed = this.collapsed;
        root.setAttribute('aria-label', this.str('label', 'Sidebar'));
        root.toggleAttribute('data-collapsed', collapsed);
        root.toggleAttribute('data-static', this.reduced);
        toggle.setAttribute('aria-expanded', String(!collapsed));
        toggle.lastElementChild!.textContent = collapsed ? this.str('expand-label', 'Expand sidebar') : this.str('collapse-label', 'Collapse sidebar');
        items.forEach((it, i) => {
          if (i === current) it.setAttribute('aria-current', it.getAttribute('aria-current') || 'page');
          else it.removeAttribute('aria-current');
          // a collapsed item's label is visually hidden, so a tooltip shows it on hover
          if (collapsed) it.title = (wraps[i].text.textContent || '').trim();
          else it.removeAttribute('title');
        });
        place();
      };
      this._sync = sync;
      this.listen(toggle, 'click', () => this.emit('toggle', { collapsed: this.toggle() }));
      this.listen(list, 'click', (e: Event) => {
        const index = items.findIndex((it) => it.contains(e.target as Node));
        if (index < 0) return;
        current = index;
        sync();
        this.emit('select', { index, item: items[index] });
      });
      // the rail's width animates, so the pill follows the item once the layout settles
      this.listen(root, 'transitionend', place);
      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(place);
        ro.observe(list);
        this.onCleanup(() => ro.disconnect());
      }
      this.onCleanup(() => {
        for (const { item, text } of wraps) {
          item.classList.remove('usa-side-link');
          item.removeAttribute('title');
          item.textContent = '';
          item.append(...Array.from(text.childNodes));
        }
        this.append(...original);
        root.remove();
        this._sync = undefined;
      });
      sync();
    }
  }, { id: 'ui-blocks', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
