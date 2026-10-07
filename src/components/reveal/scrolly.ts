import { defineElement, clamp, type UsaElement } from '../base';
import css from './scrolly.css?raw';

/**
 * `<usa-scrolly>` — sticky scrollytelling. A child marked `data-sticky`
 * stays pinned while the `[data-step]` children scroll past; the step that
 * crosses the trigger line becomes active.
 *
 * Attributes: `offset` (trigger line as a fraction of the viewport height,
 * default 0.5), `active` (reflected index of the active step). The active
 * step gets `data-active`; the host gets `--usa-step` and `data-step-name`
 * (the step's `data-step` value). Event: `usa:step` (`detail.index`,
 * `detail.step`, `detail.name`).
 */
export interface UsaScrollyElement extends UsaElement {
  readonly active: number;
  readonly steps: HTMLElement[];
}

export function defineScrolly(tag = 'usa-scrolly'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaScrolly extends Base {
        static get observedAttributes(): string[] {
          return ['offset'];
        }

        private _active = -1;

        get active(): number {
          return this._active;
        }
        get steps(): HTMLElement[] {
          return Array.from(this.querySelectorAll<HTMLElement>('[data-step]'));
        }

        mount(): void {
          const steps = this.steps;
          if (!steps.length) return;
          const offset = clamp(this.num('offset', 0.5), 0, 1);
          // A thin trigger band `offset` down the viewport
          const top = Math.min(99, Math.round(offset * 100));
          const rootMargin = `-${top}% 0px -${Math.max(0, 99 - top)}% 0px`;
          if (typeof IntersectionObserver === 'undefined') {
            this.activate(0);
            return;
          }
          const io = new IntersectionObserver(
            (entries) => {
              for (const e of entries) if (e.isIntersecting) this.activate(steps.indexOf(e.target as HTMLElement));
            },
            { rootMargin }
          );
          steps.forEach((s) => io.observe(s));
          this.onCleanup(() => io.disconnect());
          if (this._active < 0) this.activate(0, true);
        }

        activate(index: number, silent = false): void {
          const steps = this.steps;
          if (index < 0 || index >= steps.length || index === this._active) return;
          this._active = index;
          steps.forEach((s, i) => s.toggleAttribute('data-active', i === index));
          const step = steps[index];
          this.setAttribute('active', String(index));
          this.style.setProperty('--usa-step', String(index));
          this.setAttribute('data-step-name', step.dataset.step || String(index));
          if (!silent) this.emit('step', { index, step, name: step.dataset.step || '' });
        }
      },
    { id: 'scrolly', text: css }
  );
}
