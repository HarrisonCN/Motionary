import { defineElement, type UsaElement } from '../base';
import css from './notification-bell.css?raw';

export interface BellNotice {
  id?: string;
  text: string;
  time?: string;
  read?: boolean;
}

/**
 * `<usa-notification-bell>` (7.4) — a bell button with an unread badge and a
 * dropdown list. `notify(n)` rings the bell (a pendulum swing), bumps the
 * badge and slides the notice in at the top of the list; opening the list and
 * “Mark all read” clears the badge (it shrinks away). Notices from `<li>`
 * children too. Esc / outside click close it. The bell is a `button` with
 * `aria-expanded` and a label including the unread count; the list is a
 * labelled region. `usa:notify`, `usa:read`. Reduced motion: no swing, bump
 * or slide.
 */
export interface UsaNotificationBellElement extends UsaElement {
  readonly unread: number;
  readonly notices: BellNotice[];
  open: boolean;
  notify(n: BellNotice | string): void;
  markAllRead(): void;
  ring(): void;
}

export function defineNotificationBell(tag = 'usa-notification-bell'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaNotificationBell extends Base {
        static get observedAttributes(): string[] {
          return ['label'];
        }
        private _n: BellNotice[] = [];
        private _open = false;
        get unread(): number {
          return this._n.filter((n) => !n.read).length;
        }
        get notices(): BellNotice[] {
          return this._n.map((n) => ({ ...n }));
        }
        get open(): boolean {
          return this._open;
        }
        set open(v: boolean) {
          this.toggle(!!v);
        }

        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          const seed = Array.from(this.querySelectorAll<HTMLElement>(':scope > li'));
          this._n = seed.map((li, i) => ({ id: `n${i}`, text: li.textContent || '', time: li.dataset.time, read: li.hasAttribute('data-read') }));
          seed.forEach((li) => li.remove());
          this.insertAdjacentHTML('beforeend', '<button type="button" class="usa-nb-btn" data-usa-part aria-expanded="false"><svg class="usa-nb-bell" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a6 6 0 0 0-6 6v4l-2 3h16l-2-3V9a6 6 0 0 0-6-6zm-2 15a2 2 0 0 0 4 0"/></svg><b class="usa-nb-badge"></b></button><div class="usa-nb-panel" data-usa-part role="region" hidden><header><strong>Notifications</strong><button type="button" class="usa-nb-read">Mark all read</button></header><ul class="usa-nb-list"></ul><p class="usa-nb-empty">You’re all caught up</p></div>');
          this.querySelector('.usa-nb-panel')!.setAttribute('aria-label', this.str('label', 'Notifications'));
          this.listen(this.querySelector('.usa-nb-btn')!, 'click', () => this.toggle());
          this.listen(this.querySelector('.usa-nb-read')!, 'click', () => this.markAllRead());
          this.listen(this, 'keydown', (e: KeyboardEvent) => e.key === 'Escape' && this._open && (this.toggle(false), (this.querySelector('.usa-nb-btn') as HTMLElement).focus()));
          this.listen(document, 'pointerdown', (e: Event) => this._open && !this.contains(e.target as Node) && this.toggle(false));
          this.render(null);
        }

        toggle(force?: boolean): void {
          const on = force ?? !this._open;
          this._open = on;
          const p = this.querySelector('.usa-nb-panel') as HTMLElement | null;
          if (!p) return;
          p.hidden = !on;
          this.querySelector('.usa-nb-btn')!.setAttribute('aria-expanded', String(on));
          if (on && !this.reduced) this.motion(p, [{ transform: 'translateY(-8px) scale(.96)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 220, easing: 'ease-out' });
        }

        ring(): void {
          if (this.reduced) return;
          this.motion(this.querySelector('.usa-nb-bell')!, [0, 18, -16, 12, -8, 4, 0].map((d) => ({ transform: `rotate(${d}deg)` })), { duration: 800, easing: 'ease-out' });
        }

        notify(n: BellNotice | string): void {
          const item: BellNotice = typeof n === 'string' ? { text: n } : { ...n };
          item.id = item.id || `n${Date.now().toString(36)}${this._n.length}`;
          item.read = !!item.read;
          this._n.unshift(item);
          this.ring();
          this.render(item.id);
          this.emit('notify', { notice: { ...item } });
        }

        markAllRead(): void {
          if (!this.unread) return;
          this._n.forEach((n) => (n.read = true));
          this.render(null);
          this.emit('read', {});
        }

        private render(added: string | null): void {
          const list = this.querySelector('.usa-nb-list') as HTMLElement;
          list.textContent = '';
          for (const n of this._n) {
            const li = document.createElement('li');
            li.className = 'usa-nb-item';
            if (!n.read) li.dataset.unread = '';
            li.innerHTML = '<span class="usa-nb-text"></span><time></time>';
            (li.querySelector('.usa-nb-text') as HTMLElement).textContent = n.text;
            (li.querySelector('time') as HTMLElement).textContent = n.time || '';
            list.appendChild(li);
            if (n.id === added && !this.reduced) this.motion(li, [{ transform: 'translateY(-100%)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 320, easing: 'cubic-bezier(.2,.9,.3,1)' });
          }
          (this.querySelector('.usa-nb-empty') as HTMLElement).hidden = this._n.length > 0;
          const u = this.unread;
          const badge = this.querySelector('.usa-nb-badge') as HTMLElement;
          const had = badge.textContent !== '';
          badge.textContent = u ? (u > 99 ? '99+' : String(u)) : '';
          this.querySelector('.usa-nb-btn')!.setAttribute('aria-label', `${this.str('label', 'Notifications')}${u ? `, ${u} unread` : ''}`);
          if (!this.reduced && added) this.motion(badge, [{ transform: 'scale(.3)' }, { transform: 'scale(1.35)', offset: 0.5 }, { transform: 'scale(1)' }], { duration: 380, easing: 'ease-out' });
          else if (!this.reduced && had && !u) this.motion(badge, [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(0)', opacity: 0 }], { duration: 200 });
        }
      }
      return UsaNotificationBell as unknown as CustomElementConstructor;
    },
    { id: 'notification-bell', text: css }
  );
}
