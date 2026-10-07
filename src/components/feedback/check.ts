import { kindOf, defineElement, EASE_OUT, EASE_SPRING, type UsaElement } from '../base';
import css from './check.css?raw';

/**
 * `<usa-check>` — an animated result icon: the circle draws itself, then the
 * check mark (or cross / exclamation) strokes in with a little pop.
 *
 * Attributes: `variant` (`success` default, `error`, `warning`), `size`
 * (px, 56), `start` (`view` default | `load` | `manual`), `label`
 * (accessible name, e.g. "Payment complete"; the icon is decorative
 * without it). Event: `usa:complete`. Reduced motion: drawn instantly.
 */
export interface UsaCheckElement extends UsaElement {
  play(): Promise<void>;
  reset(): void;
}

const PATHS: Record<string, string> = {
  success: 'M15 27 l7 7 l14 -15',
  error: 'M18 18 L34 34 M34 18 L18 34',
  warning: 'M26 15 V30 M26 37 V37.5',
};

export function defineCheck(tag = 'usa-check'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaCheck extends Base {
        static get observedAttributes(): string[] {
          return ['kind', 'variant', 'size', 'label'];
        }

        private _anims: Animation[] = [];

        mount(): void {
          const variant = kindOf(this, PATHS, 'success');
          this.innerHTML = `<svg viewBox="0 0 52 52" aria-hidden="true"><circle class="usa-check-circle" cx="26" cy="26" r="23" pathLength="1"/><path class="usa-check-mark" d="${PATHS[variant]}" pathLength="1"/></svg>`;
          this.setAttribute('data-variant', variant);
          const size = this.getAttribute('size');
          if (size) this.style.setProperty('--usa-check-size', `${Number(size)}px`);
          const label = this.getAttribute('label');
          if (label) {
            this.setAttribute('role', 'img');
            this.setAttribute('aria-label', label);
          }
          if (this.reduced) {
            this.setAttribute('data-state', 'done');
            return;
          }
          this.setAttribute('data-state', 'idle');
          const start = this.str('start', 'view');
          if (start === 'load') this.play();
          else if (start === 'view') {
            let done = false;
            this.inView((v) => v && !done && ((done = true), this.play()), { threshold: 0.5 });
          }
        }

        unmount(): void {
          this._anims.splice(0).forEach((a) => a.cancel());
        }

        reset(): void {
          this._anims.splice(0).forEach((a) => a.cancel());
          this.setAttribute('data-state', this.reduced ? 'done' : 'idle');
        }

        play(): Promise<void> {
          this.reset();
          this.setAttribute('data-state', 'done');
          const circle = this.querySelector('.usa-check-circle');
          const mark = this.querySelector('.usa-check-mark');
          const svg = this.querySelector('svg');
          if (this.reduced || !circle || !mark || !svg) {
            this.emit('complete');
            return Promise.resolve();
          }
          const draw = [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }];
          const anims = [
            this.motion(circle, draw, { duration: 520, easing: EASE_OUT, fill: 'backwards' }),
            this.motion(mark, draw, { duration: 340, delay: 420, easing: EASE_OUT, fill: 'backwards' }),
            this.motion(svg, [{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }], { duration: 420, delay: 640, easing: EASE_SPRING }),
          ].filter((a): a is Animation => !!a);
          this._anims = anims;
          return new Promise((resolve) => {
            const last = anims[anims.length - 1];
            const done = () => {
              this.emit('complete');
              resolve();
            };
            if (last) last.onfinish = done;
            else done();
          });
        }
      },
    { id: 'check', text: css }
  );
}
