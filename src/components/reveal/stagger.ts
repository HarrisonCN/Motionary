import { defineElement, EASE_OUT, type UsaElement } from '../base';
import { revealKeyframes } from './effects';
import css from './reveal.css?raw';

/**
 * `<usa-stagger>` — reveals its direct children one after another when the
 * list scrolls into view.
 *
 * Attributes: `effect` (default `fade-up`), `interval` (ms between children,
 * 70), `duration` (600), `delay` (0), `distance` (24), `easing`,
 * `threshold` (0.1), `repeat`. Events: `usa:enter`, `usa:complete`.
 */
export interface UsaStaggerElement extends UsaElement {
  reveal(): Promise<void>;
  reset(): void;
}

export function defineStagger(tag = 'usa-stagger'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaStagger extends Base {
        static get observedAttributes(): string[] {
          return ['effect', 'repeat', 'threshold', 'distance', 'interval', 'delay', 'duration', 'easing'];
        }

        private _anims: Animation[] = [];

        mount(): void {
          if (this.reduced) {
            this.setAttribute('data-state', 'shown');
            return;
          }
          if (this.getAttribute('data-state') !== 'shown') this.setAttribute('data-state', 'hidden');
          this.inView(
            (visible) => {
              if (visible && this.getAttribute('data-state') === 'hidden') {
                this.emit('enter');
                this.reveal();
              } else if (!visible && this.flag('repeat')) this.reset();
            },
            { threshold: this.num('threshold', 0.1) }
          );
        }

        unmount(): void {
          this.cancel();
        }

        private cancel(): void {
          this._anims.splice(0).forEach((a) => a.cancel());
        }

        reveal(): Promise<void> {
          this.cancel();
          this.setAttribute('data-state', 'shown');
          const kids = Array.from(this.children) as HTMLElement[];
          if (this.reduced || !kids.length) return Promise.resolve();
          const frames = revealKeyframes(this.str('effect', 'fade-up'), this.num('distance', 24));
          const interval = this.num('interval', 70);
          const base = this.num('delay', 0);
          const duration = this.num('duration', 600);
          const easing = this.str('easing', EASE_OUT);
          const anims = kids
            .map((kid, i) => this.motion(kid, frames, { duration, easing, delay: base + i * interval, fill: 'backwards' }))
            .filter((a): a is Animation => !!a);
          this._anims = anims;
          const last = anims[anims.length - 1];
          return new Promise((resolve) => {
            const done = () => {
              this.emit('complete');
              resolve();
            };
            if (!last) done();
            else last.onfinish = done;
          });
        }

        reset(): void {
          this.cancel();
          if (!this.reduced) this.setAttribute('data-state', 'hidden');
        }
      },
    { id: 'reveal', text: css }
  );
}
