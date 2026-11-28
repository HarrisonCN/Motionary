import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { hostSprings, tick } from './micro-kit-16';
import { dampedAt } from './damped-kit-18';
import { frameOnce } from './fling-kit-19';
import { rulerRange, rulerValue, rulerIndex, rulerRest, stepDecimals } from './snap-kit-20';
import css from './snap-kit-20.css?raw';

/**
 * A ruler you fling to pick a value, as the weight and height pickers of health apps do: the scale follows the
 * finger under a fixed needle, a flick keeps coasting with its speed, and it settles on the nearest step with a short
 * spring. Past either end it stretches like rubber. A tap on the scale moves to the step under the finger. It is a
 * real slider for the keyboard and screen readers: the arrow keys move one step, Page Up / Page Down one major step,
 * Home and End to the ends.
 *
 * Attributes: `min` (0), `max` (100), `step` (1), `value` (min), `major` (steps between labelled ticks; 10),
 * `spacing` (px between steps; 10), `unit` (shown after the value and read out with it), `label` (the slider's
 * name; Value), `disabled`, `feel`, `haptics`. Height: `--usa-ruler-height`.
 * Events: `usa:input` ({ value }, while dragging, each time a new step passes the needle), `usa:change` ({ value }).
 */
export interface UsaFlingRulerElement extends UsaElement {
  value: number;
}

export function defineFlingRuler(tag = 'usa-fling-ruler'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, (Base) => class FlingRuler extends Base {
    static get observedAttributes(): string[] {
      return ['min', 'max', 'step', 'value', 'major', 'spacing', 'unit', 'label', 'disabled', 'feel', 'haptics'];
    }
    private _value = NaN;
    private _seen?: string | null;
    private _go: ((i: number, user: boolean, velocity?: number) => void) | null = null;
    private _range = { min: 0, max: 100, step: 1, steps: 100 };
    get value(): number {
      return Number.isFinite(this._value) ? this._value : this._range.min;
    }
    set value(v: number) {
      const r = this._range;
      const i = rulerIndex(Number(v), r.min, r.step, r.steps);
      if (this._go) this._go(i, false);
      else this._value = rulerValue(i, r.min, r.step, r.steps);
    }
    mount(): void {
      const r = (this._range = rulerRange(this.num('min', 0), this.num('max', 100), this.num('step', 1)));
      const attr = this.getAttribute('value');
      if (attr !== this._seen) {
        this._seen = attr;
        this._value = this.num('value', r.min);
      }
      let index = rulerIndex(this.value, r.min, r.step, r.steps);
      this._value = rulerValue(index, r.min, r.step, r.steps);
      const major = Math.max(1, Math.round(this.num('major', 10)));
      const spacing = Math.min(60, Math.max(4, this.num('spacing', 10)));
      const unit = this.str('unit', '');
      const off = this.flag('disabled');
      const decimals = stepDecimals(r.step);
      const text = (v: number) => v.toFixed(decimals);

      const root = make('div', 'usa-snkit usa-ruler');
      root.toggleAttribute('data-disabled', off);
      const out = make('div', 'usa-ruler-value');
      out.setAttribute('aria-hidden', 'true');
      const num = make('span');
      out.append(num);
      if (unit) out.append(make('small', '', unit));
      const view = make('div', 'usa-ruler-view');
      view.setAttribute('role', 'slider');
      view.setAttribute('aria-label', this.str('label', 'Value'));
      view.setAttribute('aria-orientation', 'horizontal');
      view.setAttribute('aria-valuemin', text(r.min));
      view.setAttribute('aria-valuemax', text(r.max));
      view.tabIndex = off ? -1 : 0;
      if (off) view.setAttribute('aria-disabled', 'true');
      const strip = make('div', 'usa-ruler-strip');
      strip.style.width = `${r.steps * spacing + 2}px`;
      strip.style.setProperty('--usa-ruler-step-px', `${spacing}px`);
      strip.style.setProperty('--usa-ruler-major-px', `${spacing * major}px`);
      // a label on every major tick, thinned out on a very long scale
      const every = major * Math.max(1, Math.ceil(r.steps / major / 200));
      for (let k = 0; k <= r.steps; k += every) {
        const lab = make('span', 'usa-ruler-label', text(rulerValue(k, r.min, r.step, r.steps)));
        lab.style.left = `${k * spacing}px`;
        strip.append(lab);
      }
      const needle = make('div', 'usa-ruler-needle');
      view.append(strip, needle);
      root.append(out, view);
      this.append(root);

      let half = 0;
      const measure = () => (half = (view.clientWidth || 300) / 2);
      measure();
      let shown = -1;
      const paint = (i: number) => {
        if (i === shown) return;
        shown = i;
        const v = rulerValue(i, r.min, r.step, r.steps);
        num.textContent = text(v);
        view.setAttribute('aria-valuenow', text(v));
        view.setAttribute('aria-valuetext', unit ? `${text(v)} ${unit}` : text(v));
      };
      let drag: { id: number; x0: number; y0: number; from: number; last: number; t: number; v: number; live: boolean } | null = null;
      const group = hostSprings(this, { p: index }, (v) => {
        strip.style.transform = `translateX(${Math.round((half - v.p * spacing) * 10) / 10}px)`;
        if (drag?.live) {
          const i = Math.min(r.steps, Math.max(0, Math.round(v.p)));
          if (i !== shown) {
            paint(i);
            tick(this, 4);
            this.emit('input', { value: rulerValue(i, r.min, r.step, r.steps) });
          }
        }
      });
      const go = (i: number, user: boolean, velocity = 0) => {
        const to = Math.min(r.steps, Math.max(0, Math.round(i)));
        const changed = to !== index;
        index = to;
        this._value = rulerValue(to, r.min, r.step, r.steps);
        paint(to);
        group.set({ p: to }, { spring: { duration: 640, bounce: 0.14 }, velocity: velocity ? { p: velocity } : undefined });
        if (changed) {
          if (user) tick(this, 8);
          this.emit('change', { value: this._value });
        }
      };
      this._go = go;
      paint(index);
      group.jump({ p: index });

      this.listen(view, 'keydown', (e: KeyboardEvent) => {
        if (off) return;
        const keys: Record<string, number> = { ArrowRight: index + 1, ArrowUp: index + 1, ArrowLeft: index - 1, ArrowDown: index - 1, PageUp: index + major, PageDown: index - major, Home: 0, End: r.steps };
        if (!(e.key in keys)) return;
        e.preventDefault();
        go(keys[e.key], true);
      });
      this.listen(view, 'pointerdown', (e: PointerEvent) => {
        if (off || (e.pointerType === 'mouse' && e.button !== 0)) return;
        measure();
        drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, from: group.get('p'), last: e.clientX, t: e.timeStamp, v: 0, live: false };
        // a grab stops a coasting scale where it is
        if (group.animating) group.jump({ p: group.get('p') });
      });
      this.listen(view, 'pointermove', (e: PointerEvent) => {
        if (!drag || e.pointerId !== drag.id) return;
        const dx = e.clientX - drag.x0;
        if (!drag.live) {
          if (Math.abs(dx) < 5 || Math.abs(dx) < Math.abs(e.clientY - drag.y0)) return;
          drag.live = true;
          root.setAttribute('data-dragging', '');
          try {
            view.setPointerCapture?.(e.pointerId);
          } catch {
            /* synthetic */
          }
        }
        const dt = Math.max(1, e.timeStamp - drag.t);
        drag.v = drag.v * 0.35 + ((-(e.clientX - drag.last) / spacing / dt) * 1000) * 0.65;
        drag.last = e.clientX;
        drag.t = e.timeStamp;
        group.jump({ p: dampedAt(drag.from - dx / spacing, 0, r.steps, Math.max(4, half / spacing)) });
      });
      const end = (e: PointerEvent) => {
        if (!drag || e.pointerId !== drag.id) return;
        const d = drag;
        drag = null;
        root.removeAttribute('data-dragging');
        if (!d.live) {
          // a tap moves to the step under the finger
          if (e.type === 'pointerup') {
            const rect = view.getBoundingClientRect();
            const at = rect.width ? e.clientX - rect.left : half;
            go(Math.round(d.from + (at - half) / spacing), true);
          }
          return;
        }
        // a slow release has no speed left; a flick keeps its momentum for a while
        const v = e.timeStamp - d.t > 90 ? 0 : d.v;
        go(rulerRest(group.get('p'), v, r.steps), true, v);
      };
      this.listen(view, 'pointerup', end);
      this.listen(view, 'pointercancel', end);
      if (typeof ResizeObserver !== 'undefined') {
        const later = frameOnce(() => {
          measure();
          if (!drag && !group.animating) group.jump({ p: index });
        }, this);
        const ro = new ResizeObserver(() => later.ask());
        ro.observe(view);
        this.onCleanup(() => {
          ro.disconnect();
          later.cancel();
        });
      }
      this.onCleanup(() => {
        group.stop();
        root.remove();
        this._go = null;
      });
    }
  }, { id: 'snap-kit-20', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
