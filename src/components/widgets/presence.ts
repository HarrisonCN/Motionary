import { defineElement, type UsaElement } from '../base';
import css from './presence.css?raw';

/** Presence states (7.4). */
export const PRESENCE_STATES = ['online', 'away', 'busy', 'offline'] as const;
export type PresenceState = (typeof PRESENCE_STATES)[number];

/**
 * `<usa-presence>` (7.4) — an avatar with a live status dot: `status`
 * online | away | busy | offline. Going online sends a ripple from the dot;
 * every change cross-fades the dot colour; `speaking` adds a pulsing ring
 * (voice chat), `story` an animated gradient ring (unseen story). Initials from
 * `name` when there is no `src`. Labelled `img` ("Ada Lovelace, online").
 * Reduced motion: no ripple, pulse or ring spin.
 */
export interface UsaPresenceElement extends UsaElement {
  status: PresenceState;
}

/** Initials for a display name (7.4). */
export const initials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => Array.from(w)[0]!.toUpperCase())
    .join('');

export function definePresence(tag = 'usa-presence'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaPresence extends Base {
        static get observedAttributes(): string[] {
          return ['status', 'speaking', 'name', 'src'];
        }
        private _prev = '';
        get status(): PresenceState {
          const s = this.str('status', 'offline') as PresenceState;
          return PRESENCE_STATES.includes(s) ? s : 'offline';
        }
        set status(v: PresenceState) {
          this.setAttribute('status', v);
        }

        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          this.insertAdjacentHTML('afterbegin', '<span class="usa-pr2-face" data-usa-part></span><i class="usa-pr2-dot" data-usa-part aria-hidden="true"></i>');
          this.setAttribute('role', 'img');
          this._prev = '';
          this.paint();
        }

        changed(): void {
          if (this.isConnected && this.querySelector('.usa-pr2-face')) this.paint();
        }

        private paint(): void {
          const face = this.querySelector('.usa-pr2-face') as HTMLElement;
          const name = this.str('name', '');
          const src = this.str('src', '');
          if (src) face.innerHTML = `<img alt="" src="${src.replace(/"/g, '&quot;')}">`;
          else face.textContent = initials(name) || '?';
          const s = this.status;
          this.dataset.state = s;
          this.setAttribute('aria-label', `${name || 'User'}, ${s}${this.flag('speaking') ? ', speaking' : ''}`);
          const dot = this.querySelector('.usa-pr2-dot') as HTMLElement;
          if (this._prev && this._prev !== s && !this.reduced) {
            this.motion(dot, [{ transform: 'scale(.4)' }, { transform: 'scale(1.3)', offset: 0.6 }, { transform: 'scale(1)' }], { duration: 360, easing: 'ease-out' });
            if (s === 'online') {
              const r = document.createElement('i');
              r.className = 'usa-pr2-ripple';
              r.setAttribute('aria-hidden', 'true');
              this.appendChild(r);
              const a = this.motion(r, [{ transform: 'scale(1)', opacity: 0.7 }, { transform: 'scale(3.2)', opacity: 0 }], { duration: 700, easing: 'ease-out' });
              if (a) a.finished.then(() => r.remove(), () => r.remove());
              else r.remove();
            }
          }
          this._prev = s;
        }
      }
      return UsaPresence as unknown as CustomElementConstructor;
    },
    { id: 'presence', text: css }
  );
}
