import { defineElement, type UsaElement } from '../base';
import css from './countdown.css?raw';

/**
 * `<usa-countdown>` (7.3) — a flip-card countdown to `to` (ISO date / time)
 * or for `seconds`: days · hours · minutes · seconds, each digit flips like a
 * split-flap card when it changes. `units` ("d,h,m,s"), `labels`. Fires
 * `usa:tick` (`{ left }`) and `usa:done`; adds `data-done`. A `timer` with an
 * `aria-label` that updates once a minute (not every second). Reduced motion:
 * digits change without the flip.
 */
export interface UsaCountdownElement extends UsaElement {
  /** Seconds left. */
  readonly left: number;
  start(): void;
  stop(): void;
}

/** Split seconds into d/h/m/s (7.3). */
export function splitTime(sec: number): { d: number; h: number; m: number; s: number } {
  const t = Math.max(0, Math.floor(sec));
  return { d: Math.floor(t / 86400), h: Math.floor((t % 86400) / 3600), m: Math.floor((t % 3600) / 60), s: t % 60 };
}

const NAMES: Record<string, string> = { d: 'days', h: 'hours', m: 'minutes', s: 'seconds' };

export function defineCountdown(tag = 'usa-countdown'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaCountdown extends Base {
        static get observedAttributes(): string[] {
          return ['to', 'seconds', 'units', 'labels', 'label'];
        }
        private _end = 0;
        private _timer: ReturnType<typeof setInterval> | 0 = 0;
        private _lastMin = -1;

        get left(): number {
          return Math.max(0, Math.round((this._end - Date.now()) / 1000));
        }

        mount(): void {
          const units = this.str('units', 'd,h,m,s').split(',').map((u) => u.trim()).filter((u) => u in NAMES);
          const labels = this.str('labels', '').split(',');
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          this.insertAdjacentHTML('afterbegin', `<span class="usa-cd-row" data-usa-part aria-hidden="true">${units.map((u, i) => `<span class="usa-cd-unit" data-u="${u}"><span class="usa-cd-digits"></span><small>${labels[i]?.trim() || NAMES[u]}</small></span>`).join('')}</span>`);
          this.setAttribute('role', 'timer');
          this.reset();
          this.onCleanup(() => this.stop());
          this.start();
        }

        changed(): void {
          if (this.isConnected) (this.reset(), this.start());
        }

        private reset(): void {
          const to = this.str('to', '');
          const t = to ? Date.parse(to) : NaN;
          this._end = Number.isFinite(t) ? t : Date.now() + this.num('seconds', 60) * 1000;
          this._lastMin = -1;
          this.removeAttribute('data-done');
          this.paint(false);
        }

        start(): void {
          this.stop();
          this._timer = setInterval(() => this.paint(true), 1000);
        }
        stop(): void {
          if (this._timer) clearInterval(this._timer);
          this._timer = 0;
        }

        private paint(flip: boolean): void {
          const left = this.left;
          const t = splitTime(left);
          this.querySelectorAll<HTMLElement>('.usa-cd-unit').forEach((u) => {
            const key = u.dataset.u as 'd' | 'h' | 'm' | 's';
            const val = String(key === 'h' && !this.querySelector('[data-u="d"]') ? t.h + t.d * 24 : t[key]).padStart(2, '0');
            const box = u.querySelector('.usa-cd-digits') as HTMLElement;
            while (box.children.length < val.length) box.insertAdjacentHTML('afterbegin', '<b class="usa-cd-d">0</b>');
            while (box.children.length > val.length) box.firstElementChild!.remove();
            Array.from(box.children).forEach((d, i) => {
              if (d.textContent === val[i]) return;
              d.textContent = val[i];
              if (flip && !this.reduced) this.motion(d, [{ transform: 'rotateX(-90deg)', filter: 'brightness(.7)' }, { transform: 'none', filter: 'none' }], { duration: 360, easing: 'cubic-bezier(.3,1.4,.6,1)' });
            });
          });
          const min = Math.floor(left / 60);
          if (min !== this._lastMin) {
            this._lastMin = min;
            this.setAttribute('aria-label', `${this.str('label', 'Time left')}: ${t.d ? `${t.d} days ` : ''}${t.h} hours ${t.m} minutes`);
          }
          if (flip) this.emit('tick', { left });
          if (left <= 0 && !this.hasAttribute('data-done')) {
            this.setAttribute('data-done', '');
            this.stop();
            this.emit('done', {});
          }
        }
      }
      return UsaCountdown as unknown as CustomElementConstructor;
    },
    { id: 'countdown', text: css }
  );
}
