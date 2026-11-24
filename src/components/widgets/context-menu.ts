import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make, uniqueId } from './moments';
import css from './parts-kit.css?raw';

/** Where to put a menu `w` × `h` opened at (x, y) so it stays `pad` px inside a `vw` × `vh` viewport (flips at edges). */
export function placeMenu(x: number, y: number, w: number, h: number, vw: number, vh: number, pad = 8): { left: number; top: number; originX: 'left' | 'right'; originY: 'top' | 'bottom' } {
  let left = x, top = y, originX: 'left' | 'right' = 'left', originY: 'top' | 'bottom' = 'top';
  if (x + w + pad > vw && x - w >= pad) { left = x - w; originX = 'right'; }
  if (y + h + pad > vh && y - h >= pad) { top = y - h; originY = 'bottom'; }
  left = Math.max(pad, Math.min(left, vw - w - pad));
  top = Math.max(pad, Math.min(top, vh - h - pad));
  return { left, top, originX, originY };
}

/**
 * A right-click menu for an area. The element's `menu` child (or the child marked `data-menu`) holds the items as
 * buttons or links (an `hr` separates groups, `aria-disabled="true"` disables one); the other children are the area.
 * Right-click, a long press on touch, the Menu key or Shift+F10 opens it at the pointer (or at the area's corner), it
 * grows from that corner and stays inside the window. It follows the ARIA menu pattern: arrow keys, Home / End, first
 * letter, Enter, Escape and Tab close it and focus returns to the area. Holding Shift while right-clicking keeps the
 * browser's own menu.
 *
 * Attributes: `label` (Actions), `long-press` (ms; 500; 0 turns it off).
 * Events `usa:open` ({ x, y }), `usa:select` ({ index, label }), `usa:close`.
 */
export interface UsaContextMenuElement extends UsaElement {
  readonly open: boolean;
  show(x?: number, y?: number): void;
  close(): void;
}

export function defineContextMenu(tag = 'usa-context-menu'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class ContextMenu extends Base {
    static get observedAttributes(): string[] { return ['label', 'long-press']; }
    private _api?: { show(x?: number, y?: number): void; close(focus?: boolean): void; isOpen(): boolean };
    get open(): boolean { return !!this._api?.isOpen(); }
    show(x?: number, y?: number): void { this._api?.show(x, y); }
    close(): void { this._api?.close(true); }
    mount(): void {
      const menu = (this.querySelector(':scope > menu, :scope > [data-menu]') as HTMLElement | null);
      if (!menu) return;
      const area = Array.from(this.children).filter((c) => c !== menu) as HTMLElement[];
      const target = area[0] ?? this;
      const madeFocusable = !target.hasAttribute('tabindex') && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(target.tagName);
      if (madeFocusable) target.tabIndex = 0;
      target.classList.add('usa-ctx-target');
      target.setAttribute('aria-haspopup', 'menu');
      const was = { hidden: menu.hidden, cls: menu.className, role: menu.getAttribute('role'), label: menu.getAttribute('aria-label'), id: menu.id };
      menu.classList.add('usa-kit', 'usa-ctx-menu');
      menu.setAttribute('role', 'menu');
      menu.setAttribute('aria-label', this.str('label', 'Actions'));
      if (!menu.id) menu.id = uniqueId('usa-ctx');
      target.setAttribute('aria-controls', menu.id);
      menu.hidden = true;
      const kids = Array.from(menu.children) as HTMLElement[];
      const roles = kids.map((k) => [k.getAttribute('role'), k.getAttribute('tabindex')] as const);
      kids.forEach((k) => {
        if (k.tagName === 'HR') { k.setAttribute('role', 'separator'); return; }
        k.setAttribute('role', 'menuitem');
        k.tabIndex = -1;
      });
      const items = () => kids.filter((k) => k.getAttribute('role') === 'menuitem');
      const enabled = () => items().filter((k) => k.getAttribute('aria-disabled') !== 'true');
      let isOpen = false;
      const focusAt = (i: number) => { const list = enabled(); if (list.length) list[(i + list.length) % list.length].focus(); };
      const close = (focus = false) => {
        if (!isOpen) return;
        isOpen = false;
        menu.hidden = true;
        menu.removeAttribute('data-open');
        target.setAttribute('aria-expanded', 'false');
        if (focus) target.focus();
        this.emit('close');
      };
      const show = (x?: number, y?: number) => {
        const r = target.getBoundingClientRect();
        const px = Number.isFinite(x) ? Number(x) : r.left + 12;
        const py = Number.isFinite(y) ? Number(y) : r.top + 12;
        menu.hidden = false;
        menu.toggleAttribute('data-static', this.reduced);
        const m = menu.getBoundingClientRect();
        const at = placeMenu(px, py, m.width || 200, m.height || 160, window.innerWidth, window.innerHeight);
        menu.style.left = `${at.left}px`;
        menu.style.top = `${at.top}px`;
        menu.style.setProperty('--ox', at.originX);
        menu.style.setProperty('--oy', at.originY);
        menu.removeAttribute('data-open');
        void menu.offsetWidth;
        menu.setAttribute('data-open', '');
        target.setAttribute('aria-expanded', 'true');
        if (!isOpen) { isOpen = true; this.emit('open', { x: Math.round(px), y: Math.round(py) }); }
        focusAt(0);
      };
      this._api = { show, close, isOpen: () => isOpen };
      target.setAttribute('aria-expanded', 'false');
      this.listen(target, 'contextmenu', (e: MouseEvent) => {
        if (e.shiftKey) return;
        e.preventDefault();
        show(e.clientX, e.clientY);
      });
      this.listen(target, 'keydown', (e: KeyboardEvent) => {
        if (e.key === 'ContextMenu' || (e.key === 'F10' && e.shiftKey)) { e.preventDefault(); show(); }
      });
      const hold = Math.max(0, this.num('long-press', 500));
      let timer = 0;
      const cancel = () => { clearTimeout(timer); timer = 0; };
      if (hold) {
        this.listen(target, 'pointerdown', (e: PointerEvent) => {
          if (e.pointerType !== 'touch') return;
          cancel();
          timer = window.setTimeout(() => show(e.clientX, e.clientY), hold);
        });
        for (const t of ['pointerup', 'pointercancel', 'pointermove']) this.listen(target, t, (e: PointerEvent) => { if (t !== 'pointermove' || Math.abs(e.movementX) + Math.abs(e.movementY) > 6) cancel(); });
      }
      this.listen(menu, 'keydown', (e: KeyboardEvent) => {
        const list = enabled();
        const i = list.indexOf(document.activeElement as HTMLElement);
        if (e.key === 'ArrowDown') { e.preventDefault(); focusAt(i + 1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); focusAt(i - 1); }
        else if (e.key === 'Home') { e.preventDefault(); focusAt(0); }
        else if (e.key === 'End') { e.preventDefault(); focusAt(-1); }
        else if (e.key === 'Escape') { e.preventDefault(); close(true); }
        else if (e.key === 'Tab') close(false);
        else if (e.key === 'Enter' || e.key === ' ') { if (i >= 0) { e.preventDefault(); list[i].click(); } }
        else if (e.key.length === 1) {
          const k = e.key.toLowerCase();
          const j = list.findIndex((it, n) => n > i && (it.textContent || '').trim().toLowerCase().startsWith(k));
          const any = j >= 0 ? j : list.findIndex((it) => (it.textContent || '').trim().toLowerCase().startsWith(k));
          if (any >= 0) list[any].focus();
        }
      });
      this.listen(menu, 'click', (e: MouseEvent) => {
        const it = (e.target as Element).closest('[role="menuitem"]') as HTMLElement | null;
        if (!it || !menu.contains(it)) return;
        if (it.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
        this.emit('select', { index: items().indexOf(it), label: (it.textContent || '').trim() });
        close(true);
      });
      this.listen(document, 'pointerdown', (e: PointerEvent) => { if (isOpen && !menu.contains(e.target as Node)) close(false); }, { capture: true });
      this.listen(window, 'resize', () => close(false));
      this.listen(window, 'scroll', () => close(false), { passive: true, capture: true });
      this.onCleanup(() => {
        cancel();
        isOpen = false;
        menu.hidden = was.hidden;
        menu.className = was.cls;
        if (was.role === null) menu.removeAttribute('role'); else menu.setAttribute('role', was.role);
        if (was.label === null) menu.removeAttribute('aria-label'); else menu.setAttribute('aria-label', was.label);
        if (!was.id) menu.removeAttribute('id');
        menu.removeAttribute('data-open');
        menu.removeAttribute('data-static');
        menu.style.cssText = '';
        kids.forEach((k, n) => {
          const [role, tab] = roles[n];
          if (role === null) k.removeAttribute('role'); else k.setAttribute('role', role);
          if (tab === null) k.removeAttribute('tabindex'); else k.setAttribute('tabindex', tab);
        });
        target.classList.remove('usa-ctx-target');
        if (!target.className) target.removeAttribute('class');
        for (const a of ['aria-haspopup', 'aria-controls', 'aria-expanded']) target.removeAttribute(a);
        if (madeFocusable) target.removeAttribute('tabindex');
        this._api = undefined;
      });
    }
  }, { id: 'parts-kit', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
