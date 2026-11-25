import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make, uniqueId } from './moments';
import { ownChildren } from './kit';
import { radialSpots } from './kit-15';
import css from './ui-kit-15.css?raw';

/**
 * A round button that fans its own children out on a circle around it. The children (buttons or links) are moved into
 * the menu and put back when the element is removed. The toggle says whether the menu is open (`aria-expanded`); the
 * arrow keys move round the items, Home and End jump to the ends, Escape closes the menu and focus goes back to the
 * toggle. Picking an item closes the menu.
 *
 * Attributes: `open`, `label` (Menu), `radius` (px; 84), `start` (degrees, 0 = east, -90 = north; -90),
 * `spread` (degrees; 360), `icon` (the toggle's text; ＋).
 * Events `usa:toggle` ({ open }), `usa:select` ({ index, label }).
 */
export interface UsaRadialMenuElement extends UsaElement {
  readonly open: boolean;
  toggle(force?: boolean): void;
}

export function defineRadialMenu(tag = 'usa-radial-menu'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class RadialMenu extends Base {
    static get observedAttributes(): string[] { return ['open', 'label', 'radius', 'start', 'spread', 'icon']; }
    private _open = false;
    private _set?: (open: boolean, focus?: boolean) => void;
    get open(): boolean { return this._open; }
    toggle(force?: boolean): void { this._set?.(force ?? !this._open, false); }
    mount(): void {
      const items = ownChildren(this);
      const root = make('div', 'usa-kit usa-rmenu');
      root.toggleAttribute('data-static', this.reduced);
      const id = uniqueId('usa-rmenu');
      const toggle = make('button', 'usa-rmenu-toggle');
      toggle.type = 'button';
      toggle.setAttribute('aria-label', this.str('label', 'Menu'));
      toggle.setAttribute('aria-controls', id);
      const mark = make('span', 'usa-rmenu-icon', this.str('icon', '＋'));
      mark.setAttribute('aria-hidden', 'true');
      toggle.append(mark);
      const ring = make('div', 'usa-rmenu-ring');
      ring.id = id;
      ring.setAttribute('role', 'group');
      ring.setAttribute('aria-label', this.str('label', 'Menu'));
      const spots = radialSpots(items.length, Math.max(32, Math.min(400, this.num('radius', 84))), this.num('start', -90), this.num('spread', 360));
      const focusables: HTMLElement[] = [];
      items.forEach((el, i) => {
        const slot = make('div', 'usa-rmenu-item');
        slot.style.setProperty('--x', `${spots[i].x}px`);
        slot.style.setProperty('--y', `${spots[i].y}px`);
        slot.style.setProperty('--i', String(i));
        slot.append(el);
        ring.append(slot);
        const f = (el.matches('button, a[href], [tabindex]') ? el : el.querySelector('button, a[href], [tabindex]')) as HTMLElement | null;
        focusables.push(f || el);
      });
      root.append(ring, toggle);
      this.append(root);
      const set = (open: boolean, focus = true) => {
        if (open === this._open && root.hasAttribute('data-ready')) return;
        this._open = open;
        root.toggleAttribute('data-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        ring.inert = !open;
        if (!root.hasAttribute('data-ready')) { root.setAttribute('data-ready', ''); if (!open) return; }
        if (open && focus) focusables[0]?.focus();
        if (!open && focus) toggle.focus();
        this.emit('toggle', { open });
      };
      this._set = set;
      set(this.flag('open'), false);
      this.listen(toggle, 'click', () => set(!this._open, false));
      this.listen(ring, 'click', (e: MouseEvent) => {
        const i = focusables.findIndex((f, k) => f.contains(e.target as Node) || items[k].contains(e.target as Node));
        if (i < 0) return;
        this.emit('select', { index: i, label: (items[i].getAttribute('aria-label') || items[i].textContent || '').trim() });
        set(false);
      });
      this.listen(root, 'keydown', (e: KeyboardEvent) => {
        if (e.key === 'Escape' && this._open) { e.preventDefault(); set(false); return; }
        const i = focusables.indexOf(document.activeElement as HTMLElement);
        if (i < 0) {
          if (e.target === toggle && (e.key === 'ArrowDown' || e.key === 'ArrowUp') && items.length) { e.preventDefault(); set(true); }
          return;
        }
        const n = focusables.length;
        const next = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? (i + 1) % n
          : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? (i - 1 + n) % n
          : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : -1;
        if (next < 0) return;
        e.preventDefault();
        focusables[next].focus();
      });
      this.onCleanup(() => {
        this._set = undefined;
        this._open = false;
        root.remove();
        this.append(...items);
      });
    }
  }, { id: 'ui-kit-15', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
