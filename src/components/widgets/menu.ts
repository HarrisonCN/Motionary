import { defineElement, type UsaElement } from '../base';
import { ownChildren, part, nextId } from './shared';
import css from './menu.css?raw';

/**
 * `<usa-menu>` (6.3) — a dropdown menu that unfolds from its button: the
 * list scales out of the trigger corner and the items cascade in. The first
 * child is the trigger (or `[data-trigger]`); the other children (`<button>`,
 * `<a>`, `<hr>` separators) become menu items.
 *
 * Attributes: `placement` (`bottom-start` · `bottom-end` · `top-start` ·
 * `top-end`), `effect` (`scale` · `fold` · `slide`). Keyboard: Enter / Space /
 * ArrowDown open, arrows and Home / End move, Esc closes, Tab leaves; outside
 * clicks close. API: `open()`, `close()`, `toggle()`, `opened`. Events:
 * `usa:select` (`{ index, value, item }`), `usa:open`, `usa:close`. Reduced
 * motion: a short fade.
 */
export interface UsaMenuElement extends UsaElement {
  readonly opened: boolean;
  open(focus?: 'first' | 'last'): void;
  close(focusTrigger?: boolean): void;
  toggle(): void;
}

export const MENU_EFFECTS = ['scale', 'fold', 'slide'] as const;

export function defineMenu(tag = 'usa-menu'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaMenu extends Base {
        static get observedAttributes(): string[] {
          return ['placement', 'effect'];
        }
        private _btn: HTMLElement | null = null;
        private _list: HTMLElement | null = null;
        private _items: HTMLElement[] = [];
        private _open = false;

        get opened(): boolean {
          return this._open;
        }

        mount(): void {
          const kids = ownChildren(this);
          this._btn = kids.find((k) => k.hasAttribute('data-trigger')) || kids[0] || null;
          let list = this.querySelector<HTMLElement>(':scope > .usa-menu-list');
          if (!list) {
            list = part('div', 'usa-menu-list', { role: 'menu' });
            for (const k of kids) if (k !== this._btn) list.append(k);
            this.append(list);
          }
          this._list = list;
          list.id ||= nextId('usa-menu');
          list.hidden = !this._open;
          const pl = this.str('placement', 'bottom-start');
          this.dataset.placement = /^(bottom|top)-(start|end)$/.test(pl) ? pl : 'bottom-start';
          const ef = this.str('effect', 'scale');
          this.dataset.effect = (MENU_EFFECTS as readonly string[]).includes(ef) ? ef : 'scale';
          this._items = Array.from(list.children).filter((c): c is HTMLElement => c instanceof HTMLElement && !c.matches('hr,[role="separator"]'));
          list.querySelectorAll('hr').forEach((h) => h.setAttribute('role', 'separator'));
          this._items.forEach((it, i) => {
            it.setAttribute('role', 'menuitem');
            it.tabIndex = -1;
            if (it.localName === 'button' && !it.hasAttribute('type')) it.setAttribute('type', 'button');
            this.listen(it, 'click', () => {
              this.emit('select', { index: i, value: it.dataset.value || (it.textContent || '').trim(), item: it });
              this.close(true);
            });
          });
          const b = this._btn;
          if (b) {
            b.setAttribute('aria-haspopup', 'menu');
            b.setAttribute('aria-expanded', String(this._open));
            b.setAttribute('aria-controls', list.id);
            if (b.localName === 'button' && !b.hasAttribute('type')) b.setAttribute('type', 'button');
            this.listen(b, 'click', () => this.toggle());
            this.listen(b, 'keydown', (e: KeyboardEvent) => {
              if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                this.open(e.key === 'ArrowUp' ? 'last' : 'first');
              }
            });
          }
          this.listen(list, 'keydown', (e: KeyboardEvent) => {
            const n = this._items.length;
            const i = this._items.indexOf(document.activeElement as HTMLElement);
            let j = -1;
            if (e.key === 'ArrowDown') j = (i + 1) % n;
            else if (e.key === 'ArrowUp') j = (i - 1 + n) % n;
            else if (e.key === 'Home') j = 0;
            else if (e.key === 'End') j = n - 1;
            else if (e.key === 'Escape') {
              e.preventDefault();
              return this.close(true);
            } else if (e.key === 'Tab') return this.close(false);
            if (j >= 0) {
              e.preventDefault();
              this._items[j]?.focus();
            }
          });
          this.listen(document, 'pointerdown', (e: PointerEvent) => {
            if (this._open && !this.contains(e.target as Node)) this.close(false);
          });
        }

        open(focus: 'first' | 'last' = 'first'): void {
          const l = this._list;
          if (!l || this._open) return;
          this._open = true;
          l.hidden = false;
          this._btn?.setAttribute('aria-expanded', 'true');
          this.setAttribute('data-open', '');
          const ef = this.dataset.effect;
          if (this.reduced) this.motion(l, [{ opacity: 0 }, { opacity: 1 }], { duration: 120 });
          else {
            const f: Keyframe[] = ef === 'fold' ? [{ transform: 'perspective(600px) rotateX(-70deg)', opacity: 0 }, { transform: 'none', opacity: 1 }] : ef === 'slide' ? [{ transform: 'translateY(-10px)', opacity: 0, clipPath: 'inset(0 0 100% 0 round 12px)' }, { transform: 'none', opacity: 1, clipPath: 'inset(0 0 0 0 round 12px)' }] : [{ transform: 'scale(.6)', opacity: 0 }, { transform: 'scale(1.03)', opacity: 1, offset: 0.7 }, { transform: 'none', opacity: 1 }];
            this.motion(l, f, { duration: 300, easing: 'cubic-bezier(.22,1,.36,1)' });
            this._items.forEach((it, i) => this.motion(it, [{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 260, delay: 40 + i * 35, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' }));
          }
          (focus === 'last' ? this._items[this._items.length - 1] : this._items[0])?.focus();
          this.emit('open');
        }

        close(focusTrigger = false): void {
          const l = this._list;
          if (!l || !this._open) return;
          this._open = false;
          this._btn?.setAttribute('aria-expanded', 'false');
          this.removeAttribute('data-open');
          const a = this.motion(l, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: this.reduced ? 'none' : 'scale(.96)' }], { duration: this.reduced ? 80 : 150, easing: 'ease-in' });
          const hide = () => {
            if (!this._open) l.hidden = true;
          };
          if (a) a.finished.then(hide, hide);
          else hide();
          if (focusTrigger) this._btn?.focus();
          this.emit('close');
        }

        toggle(): void {
          if (this._open) this.close(true);
          else this.open();
        }
      }
      return UsaMenu as unknown as CustomElementConstructor;
    },
    { id: 'menu', text: css }
  );
}
