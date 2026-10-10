import { defineElement, raf, caf, now, type UsaElement } from '../base';
import css from './counter.css?raw';

/**
 * `<usa-counter>` — counts up (or down) to a number when it scrolls into view.
 *
 * Attributes: `to` (target, required), `from` (0), `duration` (ms, 1600),
 * `decimals` (0), `locale` (default: the document language), `prefix`,
 * `suffix`, `grouping="false"` (no thousands separators), `start`
 * (`view` | `load` | `manual`). Setting the `value` property animates from
 * the current value — handy for live dashboards. Uses tabular digits so
 * the width does not jump. Event: `usa:complete`. Reduced motion: jumps.
 */
export interface UsaCounterElement extends UsaElement {
  /** Current target; setting it animates to the new number. */
  value: number;
  /** Animate to `to` (default: the `to` attribute). */
  play(to?: number): Promise<void>;
  format(n: number): string;
}

/** easeOutExpo */
export const easeOutExpo = (t: number): number => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

export function defineCounter(tag = 'usa-counter'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaCounter extends Base {
        static get observedAttributes(): string[] {
          return ['to', 'decimals', 'locale', 'prefix', 'suffix', 'grouping', 'from', 'start', 'duration'];
        }

        private _current = NaN;
        private _target = NaN;
        private _frame = 0;
        private _fmt: Intl.NumberFormat | null = null;

        get value(): number {
          return Number.isNaN(this._target) ? this.num('to', 0) : this._target;
        }
        set value(v: number) {
          this.play(Number(v));
        }

        format(n: number): string {
          if (!this._fmt) {
            const d = Math.max(0, Math.min(20, this.num('decimals', 0)));
            const locale = this.getAttribute('locale') || (typeof document !== 'undefined' && document.documentElement.lang) || undefined;
            try {
              this._fmt = new Intl.NumberFormat(locale, { minimumFractionDigits: d, maximumFractionDigits: d, useGrouping: this.getAttribute('grouping') !== 'false' });
            } catch {
              this._fmt = new Intl.NumberFormat(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
            }
          }
          return `${this.str('prefix')}${this._fmt.format(n)}${this.str('suffix')}`;
        }

        private render(n: number): void {
          this._current = n;
          this.textContent = this.format(n);
        }

        changed(name: string): void {
          this._fmt = null;
          if (name === 'to') this.play();
          else this.render(Number.isNaN(this._current) ? this.num('from', 0) : this._current);
        }

        mount(): void {
          this._fmt = null;
          const to = this.num('to', 0);
          if (this.reduced) {
            this._target = to;
            this.render(to);
            return;
          }
          if (Number.isNaN(this._current)) this.render(this.num('from', 0));
          const start = this.str('start', 'view');
          if (start === 'load') this.play();
          else if (start === 'view') {
            let done = false;
            this.inView((v) => {
              if (v && !done) {
                done = true;
                this.play();
              }
            }, { threshold: 0.4 });
          }
        }

        unmount(): void {
          caf(this._frame);
          this._frame = 0;
        }

        play(to = this.num('to', 0)): Promise<void> {
          caf(this._frame);
          this._target = to;
          const from = Number.isNaN(this._current) ? this.num('from', 0) : this._current;
          if (this.reduced || from === to || !this.isConnected) {
            this.render(to);
            this.emit('complete', { value: to });
            return Promise.resolve();
          }
          const duration = this.num('duration', 1600);
          const t0 = now();
          return new Promise((resolve) => {
            const step = () => {
              const t = Math.min(1, Math.max(0, now() - t0) / duration);
              this.render(from + (to - from) * easeOutExpo(t));
              if (t < 1) this._frame = raf(step);
              else {
                this._frame = 0;
                this.render(to);
                this.emit('complete', { value: to });
                resolve();
              }
            };
            this._frame = raf(step);
          });
        }
      },
    { id: 'counter', text: css }
  );
}
