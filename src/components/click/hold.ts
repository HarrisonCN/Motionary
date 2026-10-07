import { defineElement, raf, caf, now, type UsaElement } from '../base';
import { haptic } from './fx';
import css from './hold.css?raw';

/**
 * `<usa-hold>` — hold-to-confirm: press and hold (pointer, Space or Enter)
 * while a progress ring fills; releasing early rewinds it. Good for
 * destructive actions.
 *
 * Attributes: `duration` (ms, 1200), `label` (accessible name), `color`,
 * `disabled`. CSS variable `--usa-hold` (0–1). Events: `usa:progress`,
 * `usa:confirm`, `usa:cancel`. Reduced motion: same timing, the ring fills
 * without the scale pulse.
 */
export interface UsaHoldElement extends UsaElement {
  readonly progress: number;
  cancel(): void;
}

export function defineHold(tag = 'usa-hold'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaHold extends Base {
        static get observedAttributes(): string[] {
          return ['duration', 'disabled'];
        }

        private _p = 0;
        private _frame = 0;
        private _holding = false;

        get progress(): number {
          return this._p;
        }

        private set(p: number): void {
          this._p = p;
          this.style.setProperty('--usa-hold', p.toFixed(4));
          const c = this.querySelector<SVGCircleElement>('.usa-hold-ring circle:last-child');
          if (c) c.style.strokeDashoffset = String(100 - p * 100);
        }

        mount(): void {
          if (!this.querySelector(':scope > .usa-hold-ring')) {
            this.insertAdjacentHTML('beforeend', '<svg class="usa-hold-ring" viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="15.9" pathLength="100"/><circle cx="18" cy="18" r="15.9" pathLength="100"/></svg>');
          }
          if (this.str('color')) this.style.setProperty('--usa-hold-color', this.str('color'));
          this.setAttribute('role', 'button');
          if (!this.hasAttribute('tabindex')) this.tabIndex = 0;
          if (this.str('label')) this.setAttribute('aria-label', this.str('label'));
          this.setAttribute('aria-description', 'Press and hold to confirm');
          this.set(0);
          this.listen(this, 'pointerdown', (e: PointerEvent) => (e.pointerType !== 'mouse' || e.button === 0) && this.start());
          for (const t of ['pointerup', 'pointerleave', 'pointercancel']) this.listen(this, t, () => this.stop());
          this.listen(this, 'keydown', (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (!e.repeat) this.start();
            }
          });
          this.listen(this, 'keyup', (e: KeyboardEvent) => (e.key === 'Enter' || e.key === ' ') && this.stop());
          this.listen(this, 'contextmenu', (e: Event) => this._holding && e.preventDefault());
        }

        unmount(): void {
          caf(this._frame);
          this._holding = false;
        }

        private start(): void {
          if (this.flag('disabled') || this._holding) return;
          this._holding = true;
          this.setAttribute('data-holding', '');
          const dur = Math.max(100, this.num('duration', 1200));
          let last = now();
          const tick = () => {
            const t = now();
            const p = Math.min(1, this._p + (t - last) / dur);
            last = t;
            this.set(p);
            this.emit('progress', { progress: p });
            if (p >= 1) {
              this._holding = false;
              this.removeAttribute('data-holding');
              this.setAttribute('data-done', '');
              if (this.hasAttribute('haptic')) haptic(20);
              this.emit('confirm');
              setTimeout(() => {
                this.removeAttribute('data-done');
                this.rewind();
              }, 700);
              return;
            }
            this._frame = raf(tick);
          };
          this._frame = raf(tick);
        }

        private stop(): void {
          if (!this._holding) return;
          this._holding = false;
          caf(this._frame);
          this.removeAttribute('data-holding');
          if (this._p < 1) {
            this.emit('cancel', { progress: this._p });
            this.rewind();
          }
        }

        private rewind(): void {
          let last = now();
          const back = () => {
            if (this._holding) return;
            const t = now();
            const p = Math.max(0, this._p - (t - last) / 250);
            last = t;
            this.set(p);
            if (p > 0) this._frame = raf(back);
          };
          this._frame = raf(back);
        }

        cancel(): void {
          this.stop();
        }
      },
    { id: 'hold', text: css }
  );
}
