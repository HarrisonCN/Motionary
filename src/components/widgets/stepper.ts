import { defineElement, type UsaElement } from '../base';
import { ownChildren, clampN } from './shared';
import css from './stepper.css?raw';

/**
 * `<usa-stepper>` (6.7) — a step indicator / wizard. Each child is a step
 * (its text is the label). `value` is the current step (0-based); finished
 * steps pop a check mark, the connecting rail fills toward the current step
 * and the current step pulses once. `orientation="vertical"` stacks the
 * steps. `next()` / `prev()` / `value`; event `usa:change` (`{ value }`).
 * The list is an ordered list with `aria-current="step"`. Reduced motion: no
 * pop or pulse, the rail jumps.
 */
export interface UsaStepperElement extends UsaElement {
  value: number;
  readonly steps: HTMLElement[];
  next(): void;
  prev(): void;
}

export function defineStepper(tag = 'usa-stepper'): CustomElementConstructor | undefined {
  // contract-exempt: attr-unobserved(value) — state reflected by the element itself (set the property instead); observing it would re-mount on every change
  return defineElement(
    tag,
    (Base) => {
      class UsaStepper extends Base {
        static get observedAttributes(): string[] {
          return ['orientation', 'label', 'clickable'];
        }
        private _steps: HTMLElement[] = [];
        private _v = 0;
        private _fill: HTMLElement | null = null;

        get steps(): HTMLElement[] {
          return this._steps;
        }
        get value(): number {
          return this._v;
        }
        set value(v: number) {
          this.go(v);
        }

        mount(): void {
          this.dataset.orientation = this.str('orientation', 'horizontal') === 'vertical' ? 'vertical' : 'horizontal';
          this.setAttribute('role', 'list');
          if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', this.str('label', 'Progress'));
          this._steps = ownChildren(this);
          if (!this.querySelector(':scope > .usa-st-rail')) {
            const rail = document.createElement('span');
            rail.className = 'usa-st-rail';
            rail.setAttribute('data-usa-part', '');
            rail.setAttribute('aria-hidden', 'true');
            rail.innerHTML = '<span class="usa-st-fill"></span>';
            this.prepend(rail);
          }
          this._fill = this.querySelector('.usa-st-fill');
          this._steps.forEach((s, i) => {
            s.classList.add('usa-st-step');
            s.setAttribute('role', 'listitem');
            s.style.setProperty('--usa-st-i', String(i));
            if (!s.querySelector(':scope > .usa-st-dot')) {
              const d = document.createElement('span');
              d.className = 'usa-st-dot';
              d.setAttribute('aria-hidden', 'true');
              d.setAttribute('data-usa-part', '');
              d.innerHTML = `<span class="usa-st-num">${i + 1}</span><svg class="usa-st-check" viewBox="0 0 16 16"><path d="M3 8.5l3.2 3L13 4.8"/></svg>`;
              s.prepend(d);
            }
            if (s.hasAttribute('data-clickable') || this.flag('clickable')) this.listen(s, 'click', () => this.go(i));
          });
          this._v = clampN(this.num('value', 0) | 0, 0, Math.max(0, this._steps.length - 1));
          this.sync(-1);
        }

        private sync(prev: number): void {
          const n = this._steps.length;
          this._steps.forEach((s, i) => {
            s.toggleAttribute('data-done', i < this._v);
            s.toggleAttribute('data-current', i === this._v);
            if (i === this._v) s.setAttribute('aria-current', 'step');
            else s.removeAttribute('aria-current');
          });
          const pct = n > 1 ? (this._v / (n - 1)) * 100 : 0;
          this.style.setProperty('--usa-st-p', pct.toFixed(2) + '%');
          if (prev < 0 || this.reduced) return;
          const cur = this._steps[this._v]?.querySelector('.usa-st-dot');
          if (cur) this.motion(cur, [{ transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(124,92,255,.55)' }, { transform: 'scale(1.18)', offset: 0.35 }, { transform: 'scale(1)', boxShadow: '0 0 0 12px rgba(124,92,255,0)' }], { duration: 620, easing: 'ease-out' });
          if (this._v > prev) {
            const done = this._steps[prev]?.querySelector('.usa-st-check');
            if (done) this.motion(done, [{ strokeDashoffset: 20, transform: 'scale(.4)' }, { strokeDashoffset: 0, transform: 'scale(1)' }], { duration: 420, easing: 'cubic-bezier(.3,1.4,.5,1)' });
          }
        }

        go(i: number): void {
          const v = clampN(Math.round(i), 0, Math.max(0, this._steps.length - 1));
          if (v === this._v) return;
          const prev = this._v;
          this._v = v;
          this.setAttribute('value', String(v));
          this.sync(prev);
          this.emit('change', { value: v });
        }
        next(): void {
          this.go(this._v + 1);
        }
        prev(): void {
          this.go(this._v - 1);
        }
      }
      return UsaStepper as unknown as CustomElementConstructor;
    },
    { id: 'stepper', text: css }
  );
}
