import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { bound, make, roundTo } from './moments';
import { pressSpring, tap } from './tactile';
import css from './tactile.css?raw';

/**
 * A pair of squishy − / + keys around a number that rolls as it changes. Hold a key to repeat. Both keys are native
 * buttons; ArrowUp / ArrowDown on either key step too, and the value is announced through a polite live region.
 *
 * Attributes: `value` (0), `min` (0), `max` (10), `step` (1), `label` (Quantity), `disabled`.
 * Events `usa:input` ({ value }) on every step and `usa:change` ({ value }) when a press or hold ends.
 */
export interface UsaSquishStepperElement extends UsaElement {
  value: number;
  stepUp(): void;
  stepDown(): void;
}

export function defineSquishStepper(tag = 'usa-squish-stepper'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class SquishStepper extends Base {
    static get observedAttributes(): string[] { return ['value', 'min', 'max', 'step', 'label', 'disabled']; }
    private _sync?: () => void;
    private range(): [number, number, number] {
      const min = this.num('min', 0);
      const max = Math.max(min, this.num('max', 10));
      const step = this.num('step', 1) > 0 ? this.num('step', 1) : 1;
      return [min, max, step];
    }
    get value(): number { const [min, max] = this.range(); return bound(this.num('value', min), min, max, min); }
    set value(n: number) { const [min, max, step] = this.range(); this.setAttribute('value', String(roundTo(bound(Number(n), min, max, min), step))); }
    private nudge(dir: 1 | -1): boolean {
      if (this.flag('disabled')) return false;
      const [min, max, step] = this.range();
      const next = roundTo(bound(this.value + dir * step, min, max, min), step);
      if (next === this.value) return false;
      this.value = next;
      this.emit('input', { value: this.value });
      return true;
    }
    stepUp(): void { if (this.nudge(1)) this.emit('change', { value: this.value }); }
    stepDown(): void { if (this.nudge(-1)) this.emit('change', { value: this.value }); }
    changed(): void { this._sync?.(); }
    mount(): void {
      const root = make('div', 'usa-tactile usa-stepper');
      root.setAttribute('role', 'group');
      const minus = make('button', 'usa-squish-key usa-stepper-key');
      const plus = make('button', 'usa-squish-key usa-stepper-key');
      minus.type = plus.type = 'button';
      minus.append(make('span', 'usa-squish-glyph', '−'));
      plus.append(make('span', 'usa-squish-glyph', '+'));
      minus.setAttribute('aria-label', 'Decrease');
      plus.setAttribute('aria-label', 'Increase');
      const win = make('span', 'usa-stepper-window');
      const num = make('output', 'usa-stepper-value');
      num.setAttribute('aria-live', 'polite');
      win.append(num);
      root.append(minus, win, plus);
      this.append(root);
      const springs = [pressSpring(this, minus), pressSpring(this, plus)];

      let delay: ReturnType<typeof setTimeout> | undefined;
      let repeat: ReturnType<typeof setInterval> | undefined;
      let stepped = false;
      const stop = () => {
        clearTimeout(delay); clearInterval(repeat);
        delay = repeat = undefined;
        if (stepped) { stepped = false; this.emit('change', { value: this.value }); }
      };
      const roll = (dir: 1 | -1) => {
        win.dataset.roll = dir > 0 ? 'up' : 'down';
        this.motion(num, [{ transform: `translateY(${dir > 0 ? 40 : -40}%)`, opacity: 0.2 }, { transform: 'none', opacity: 1 }], { duration: 220, easing: 'cubic-bezier(.34,1.56,.64,1)' });
      };
      const step = (dir: 1 | -1) => { if (this.nudge(dir)) { stepped = true; roll(dir); } };
      const hold = (dir: 1 | -1) => {
        stop();
        step(dir);
        delay = setTimeout(() => { repeat = setInterval(() => step(dir), 90); }, 420);
      };
      ([[minus, -1], [plus, 1]] as const).forEach(([key, dir], i) => {
        this.listen(key, 'pointerdown', (e: PointerEvent) => {
          if (key.disabled || (e.pointerType === 'mouse' && e.button !== 0)) return;
          hold(dir);
        });
        for (const type of ['pointerup', 'pointerleave', 'pointercancel', 'blur']) this.listen(key, type, stop);
        // Enter / Space and assistive-tech clicks arrive as a click with no pointer press before it
        this.listen(key, 'click', (e: MouseEvent) => {
          if (e.detail !== 0) return;
          if (!springs[i].animating) tap(springs[i]);
          step(dir); stop();
        });
        this.listen(key, 'keydown', (e: KeyboardEvent) => {
          const d = e.key === 'ArrowUp' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowDown' || e.key === 'ArrowLeft' ? -1 : 0;
          if (!d) return;
          e.preventDefault();
          tap(springs[d > 0 ? 1 : 0]);
          step(d as 1 | -1); stop();
        });
      });
      const sync = () => {
        const [min, max] = this.range();
        const v = this.value, disabled = this.flag('disabled');
        num.textContent = String(v);
        root.setAttribute('aria-label', this.str('label', 'Quantity'));
        minus.disabled = disabled || v <= min;
        plus.disabled = disabled || v >= max;
        root.toggleAttribute('data-disabled', disabled);
        root.toggleAttribute('data-static', this.reduced);
        if (minus.disabled || plus.disabled) stop();
      };
      this._sync = sync;
      this.onCleanup(() => { clearTimeout(delay); clearInterval(repeat); root.remove(); this._sync = undefined; });
      sync();
    }
  }, { id: 'tactile', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
