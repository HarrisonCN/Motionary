import { defineElement, EASE_OUT, type UsaElement } from '../base';
import { revealKeyframes, type RevealEffect } from './effects';
import css from './reveal.css?raw';

/**
 * `<usa-reveal>` — reveals its content when it scrolls into view.
 *
 * Attributes: `effect` (see {@link RevealEffect}, default `fade-up`),
 * `duration` (ms, 700), `delay` (ms, 0), `distance` (px, 32), `easing`,
 * `threshold` (0–1, 0.15), `root-margin`, `repeat` (hide again when it
 * leaves, replay on re-entry). Events: `usa:enter`, `usa:leave`, `usa:complete`.
 */
export interface UsaRevealElement extends UsaElement {
  effect: RevealEffect | string;
  /** Play the entrance now (also called automatically on enter). */
  reveal(): Promise<void>;
  /** Hide again so the next `reveal()` replays the entrance. */
  reset(): void;
  readonly revealed: boolean;
}

export function defineReveal(tag = 'usa-reveal'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaReveal extends Base {
        static get observedAttributes(): string[] {
          return ['effect', 'distance', 'repeat', 'threshold', 'root-margin'];
        }

        private _anim: Animation | null = null;

        get effect(): string {
          return this.str('effect', 'fade-up');
        }
        set effect(v: string) {
          this.setAttribute('effect', v);
        }
        get revealed(): boolean {
          return this.getAttribute('data-state') !== 'hidden';
        }

        mount(): void {
          if (this.reduced) {
            this.setAttribute('data-state', 'shown');
            return;
          }
          if (this.getAttribute('data-state') !== 'shown') this.setAttribute('data-state', 'hidden');
          this.inView(
            (visible) => {
              if (visible) {
                this.emit('enter');
                if (!this.revealed) this.reveal();
              } else {
                this.emit('leave');
                if (this.flag('repeat') && this.revealed) this.reset();
              }
            },
            { threshold: this.num('threshold', 0.15), rootMargin: this.str('root-margin', '0px') }
          );
        }

        unmount(): void {
          this._anim?.cancel();
          this._anim = null;
        }

        reveal(): Promise<void> {
          this._anim?.cancel();
          this.setAttribute('data-state', 'shown');
          if (this.reduced) return Promise.resolve();
          const a = this.motion(this, revealKeyframes(this.effect, this.num('distance', 32)), {
            duration: this.num('duration', 700),
            delay: this.num('delay', 0),
            easing: this.str('easing', EASE_OUT),
            fill: 'backwards',
          });
          this._anim = a;
          return new Promise((resolve) => {
            const done = () => {
              if (this._anim === a) this._anim = null;
              this.emit('complete');
              resolve();
            };
            if (!a) done();
            else a.onfinish = done;
          });
        }

        reset(): void {
          this._anim?.cancel();
          this._anim = null;
          if (!this.reduced) this.setAttribute('data-state', 'hidden');
        }
      },
    { id: 'reveal', text: css }
  );
}
