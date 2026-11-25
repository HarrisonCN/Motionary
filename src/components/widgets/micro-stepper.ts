import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { micro } from '../interaction/micro';
import { hostSprings, tick, holdDelays, valueAt, fraction } from './micro-kit-16';
import css from './micro-kit-16.css?raw';

/**
 * A number stepper whose digits roll on a spring (up for more, down for less) and whose buttons repeat faster and
 * faster while held. At a limit the number leans against it and springs back instead of changing, so the end is felt
 * rather than only greyed out. The number is a spin button: Up / Down, Page Up / Page Down, Home / End.
 *
 * Attributes: `min` (0), `max` (99), `step` (1), `value`, `label` (Quantity), `name`, `disabled`, `feel`, `haptics`.
 * Event `usa:change` ({ value }).
 */
export interface UsaMicroStepperElement extends UsaElement {
  value: number;
}

export function defineMicroStepper(tag = 'usa-micro-stepper'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, (Base) => class MicroStepper extends Base {
    static get observedAttributes(): string[] {
      return ['min', 'max', 'step', 'value', 'label', 'name', 'disabled', 'feel', 'haptics'];
    }
    private _value = NaN;
    private _seen?: string | null;
    private _set: ((n: number) => void) | null = null;
    get value(): number {
      return this._value;
    }
    set value(n: number) {
      if (this._set) this._set(Number(n));
      else this._value = Number(n);
    }
    mount(): void {
      let min = this.num('min', 0);
      let max = this.num('max', 99);
      if (max < min) [min, max] = [max, min];
      const step = Math.max(Number.EPSILON, this.num('step', 1));
      const attr = this.getAttribute('value');
      if (attr !== this._seen) {
        this._seen = attr;
        this._value = this.num('value', min);
      }
      const snap = (n: number) => valueAt(fraction(n, min, max), min, max, step);
      this._value = snap(Number.isFinite(this._value) ? this._value : min);
      const disabled = this.flag('disabled');
      const label = this.str('label', 'Quantity');
      const root = make('div', 'usa-mkit usa-mstep');
      root.setAttribute('role', 'group');
      root.setAttribute('aria-label', label);
      const minus = make('button', 'usa-mstep-btn', '−');
      minus.type = 'button';
      minus.setAttribute('aria-label', `Decrease ${label}`);
      const plus = make('button', 'usa-mstep-btn', '+');
      plus.type = 'button';
      plus.setAttribute('aria-label', `Increase ${label}`);
      const box = make('div', 'usa-mstep-value');
      box.setAttribute('role', 'spinbutton');
      box.tabIndex = disabled ? -1 : 0;
      box.setAttribute('aria-label', label);
      box.setAttribute('aria-valuemin', String(min));
      box.setAttribute('aria-valuemax', String(max));
      const now = make('span', 'usa-mstep-num');
      const old = make('span', 'usa-mstep-num usa-mstep-old');
      old.setAttribute('aria-hidden', 'true');
      box.append(old, now);
      minus.disabled = plus.disabled = disabled;
      root.append(minus, box, plus);
      const hidden = this.str('name') ? make('input') : null;
      if (hidden) {
        hidden.type = 'hidden';
        hidden.name = this.str('name');
        root.append(hidden);
      }
      this.append(root);
      const presses = [minus, plus].map((b) => micro(b, 'press', { pressScale: 0.9, feel: this.str('feel') || undefined }));

      let dir = 1;
      const group = hostSprings(this, { r: 0, k: 0 }, (v) => {
        const r = v.r;
        now.style.transform = `translateY(${Math.round(r * 1000) / 10}%)`;
        old.style.transform = `translateY(${Math.round((r - dir) * 1000) / 10}%)`;
        old.style.opacity = String(Math.max(0, Math.min(1, Math.abs(r) * 1.4)));
        box.style.transform = Math.abs(v.k) > 0.05 ? `translateX(${Math.round(v.k * 10) / 10}px)` : '';
      });
      const paint = () => {
        now.textContent = String(this._value);
        box.setAttribute('aria-valuenow', String(this._value));
        minus.setAttribute('aria-disabled', String(this._value <= min));
        plus.setAttribute('aria-disabled', String(this._value >= max));
        if (hidden) hidden.value = String(this._value);
      };
      paint();
      const set = (n: number, emit = true) => {
        const next = snap(n);
        if (next === this._value) return false;
        dir = next > this._value ? 1 : -1;
        old.textContent = String(this._value);
        this._value = next;
        paint();
        // the new number comes in from below when it grows (from above when it shrinks)
        group.jump({ r: dir });
        group.set({ r: 0 }, { spring: 'bouncy' });
        tick(this, 6);
        if (emit) this.emit('change', { value: next });
        return true;
      };
      this._set = (n) => Number.isFinite(n) && set(n, false);
      const bump = (sign: number) => {
        if (sign < 0 ? this._value <= min : this._value >= max) {
          group.impulse({ k: sign * 220 }, '200 0.7');
          tick(this, [6, 30, 6]);
          return false;
        }
        return set(this._value + sign * step);
      };
      let timer: ReturnType<typeof setTimeout> | undefined;
      let fromPointer = false;
      const stop = () => clearTimeout(timer);
      const hold = (sign: number) => {
        const delays = holdDelays(60);
        let i = 0;
        const next = () => {
          if (!bump(sign)) return stop();
          timer = setTimeout(next, delays[Math.min(++i, delays.length - 1)]);
        };
        if (!bump(sign)) return;
        timer = setTimeout(next, delays[0]);
      };
      for (const [btn, sign] of [[minus, -1], [plus, 1]] as const) {
        this.listen(btn, 'pointerdown', (e: PointerEvent) => {
          if (disabled || (e.pointerType === 'mouse' && e.button !== 0)) return;
          fromPointer = true;
          stop();
          hold(sign);
        });
        for (const t of ['pointerup', 'pointerleave', 'pointercancel']) this.listen(btn, t, stop);
        this.listen(btn, 'click', () => {
          // a click from the keyboard (no pointer down before it) steps once
          if (fromPointer) {
            fromPointer = false;
            return;
          }
          if (!disabled) bump(sign);
        });
      }
      this.listen(box, 'keydown', (e: KeyboardEvent) => {
        if (disabled) return;
        const keys: Record<string, () => unknown> = {
          ArrowUp: () => bump(1), ArrowDown: () => bump(-1), PageUp: () => set(this._value + step * 10) || bump(1),
          PageDown: () => set(this._value - step * 10) || bump(-1), Home: () => set(min) || bump(-1), End: () => set(max) || bump(1),
        };
        if (!keys[e.key]) return;
        e.preventDefault();
        keys[e.key]();
      });
      this.onCleanup(() => {
        stop();
        group.stop();
        presses.forEach((h) => h.destroy());
        root.remove();
        this._set = null;
      });
    }
  }, { id: 'micro-kit-16', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
