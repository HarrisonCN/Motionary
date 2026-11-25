import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { hostSprings, tick } from './micro-kit-16';
import { ratingAt, starFill } from './spring-kit-17';
import css from './spring-kit-17.css?raw';

const SVG = 'http://www.w3.org/2000/svg';
const STAR = 'M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3-4.6-4.4 6.3-.9z';

/**
 * A star rating whose stars are springs: hovering lifts and previews the stars under the pointer, choosing one pops
 * the stars up to it one after another, and clearing deflates them. Works as a slider with the arrow keys, Home
 * and End; with `half` the pointer picks half stars and the keys move by halves.
 *
 * Attributes: `value` (0 = none), `max` (5), `half`, `label` (accessible name; Rating), `readonly`, `clearable`
 * (choosing the current value again clears it), `show-value` (shows "4 / 5" beside the stars), `size` (px; 30),
 * `disabled`, `feel`, `haptics`.
 * Events: `usa:change` ({ value }).
 */
export interface UsaSpringRatingElement extends UsaElement {
  value: number;
}

export function defineSpringRating(tag = 'usa-spring-rating'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, (Base) => class SpringRating extends Base {
    static get observedAttributes(): string[] {
      return ['value', 'max', 'half', 'label', 'readonly', 'clearable', 'show-value', 'size', 'disabled', 'feel', 'haptics'];
    }
    private _value = 0;
    private _seen?: string | null;
    private _set: ((v: number, user: boolean) => void) | null = null;
    get value(): number {
      return this._value;
    }
    set value(v: number) {
      if (this._set) this._set(Number(v), false);
      else this._value = Number(v) || 0;
    }
    mount(): void {
      const max = Math.max(1, Math.min(10, Math.floor(this.num('max', 5))));
      const half = this.flag('half');
      const step = half ? 0.5 : 1;
      const clamp = (v: number) => Math.min(max, Math.max(0, Math.round((Number.isFinite(v) ? v : 0) / step) * step));
      const attr = this.getAttribute('value');
      if (attr !== this._seen) {
        this._seen = attr;
        this._value = this.num('value', 0);
      }
      this._value = clamp(this._value);
      const readonly = this.flag('readonly');
      const disabled = this.flag('disabled');
      const root = make('div', 'usa-skit usa-srate');
      root.style.setProperty('--sz', `${Math.max(12, Math.min(80, this.num('size', 30)))}px`);
      root.setAttribute('role', readonly ? 'img' : 'slider');
      root.setAttribute('aria-label', this.str('label', 'Rating'));
      root.toggleAttribute('data-readonly', readonly);
      root.toggleAttribute('data-disabled', disabled);
      if (!readonly) {
        root.tabIndex = disabled ? -1 : 0;
        root.setAttribute('aria-valuemin', '0');
        root.setAttribute('aria-valuemax', String(max));
        if (disabled) root.setAttribute('aria-disabled', 'true');
      }
      const stars = Array.from({ length: max }, () => {
        const s = make('span', 'usa-srate-star');
        s.setAttribute('aria-hidden', 'true');
        const svg = document.createElementNS(SVG, 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        for (const cls of ['usa-srate-base', 'usa-srate-fill']) {
          const p = document.createElementNS(SVG, 'path');
          p.setAttribute('d', STAR);
          p.setAttribute('class', cls);
          svg.append(p);
        }
        s.append(svg);
        root.append(s);
        return { s, svg };
      });
      const text = this.flag('show-value') ? make('span', 'usa-srate-text') : null;
      if (text) {
        text.setAttribute('aria-hidden', 'true');
        root.append(text);
      }
      this.append(root);

      const init: Record<string, number> = {};
      stars.forEach((_, i) => {
        init[`f${i}`] = starFill(this._value, i);
        init[`s${i}`] = 1;
      });
      const group = hostSprings(this, init, (v) => {
        stars.forEach(({ s, svg }, i) => {
          s.style.setProperty('--f', String(Math.round(Math.min(1, Math.max(0, v[`f${i}`])) * 1000) / 1000));
          svg.style.transform = `scale(${Math.round(Math.max(0, v[`s${i}`]) * 1000) / 1000})`;
        });
      });
      const word = (v: number) => `${v} of ${max}`;
      const paint = () => {
        if (readonly) root.setAttribute('aria-label', `${this.str('label', 'Rating')}: ${word(this._value)}`);
        else {
          root.setAttribute('aria-valuenow', String(this._value));
          root.setAttribute('aria-valuetext', this._value ? word(this._value) : 'No rating');
        }
        if (text) text.textContent = `${this._value} / ${max}`;
      };
      paint();
      const show = (v: number, pop: boolean) => {
        stars.forEach((_, i) => {
          const f = starFill(v, i);
          if (pop && f > 0 && group.target(`f${i}`) < f) {
            // pop the newly filled stars one after another
            group.jump({ [`s${i}`]: 0.6 + Math.min(0.3, i * 0.02) });
            group.set({ [`s${i}`]: 1 }, { spring: 'pop', velocity: { [`s${i}`]: 2 + i * 0.6 } });
          }
          group.set({ [`f${i}`]: f }, { spring: pop ? 'snappy' : 'smooth' });
        });
      };
      const commit = (v: number, user: boolean, clear = false) => {
        let next = clamp(v);
        if (clear && this.flag('clearable') && next === this._value) next = 0;
        if (next === this._value) return show(this._value, false);
        const up = next > this._value;
        this._value = next;
        paint();
        show(next, up);
        if (!up) stars.forEach((_, i) => group.impulse({ [`s${i}`]: -1.5 }, 'gentle'));
        if (user) {
          tick(this, 8);
          this.emit('change', { value: next });
        }
      };
      this._set = commit;
      if (readonly) {
        this.onCleanup(() => {
          group.stop();
          root.remove();
          this._set = null;
        });
        return;
      }
      const at = (e: PointerEvent) => {
        const r = root.getBoundingClientRect();
        const width = stars.length ? stars[stars.length - 1].s.getBoundingClientRect().right - r.left : r.width;
        const rtl = typeof getComputedStyle === 'function' && getComputedStyle(root).direction === 'rtl';
        return ratingAt(rtl ? r.right - e.clientX : e.clientX - r.left, width || r.width, max, half);
      };
      let hover = -1;
      this.listen(root, 'pointermove', (e: PointerEvent) => {
        if (disabled || e.pointerType === 'touch') return;
        const v = at(e);
        if (v === hover) return;
        hover = v;
        show(v, false);
        stars.forEach((_, i) => group.set({ [`s${i}`]: i < Math.ceil(v) ? 1.08 : 1 }, { spring: 'hover' }));
      });
      this.listen(root, 'pointerleave', () => {
        if (hover < 0) return;
        hover = -1;
        show(this._value, false);
        stars.forEach((_, i) => group.set({ [`s${i}`]: 1 }, { spring: 'hover' }));
      });
      this.listen(root, 'pointerdown', (e: PointerEvent) => {
        if (disabled || (e.pointerType === 'mouse' && e.button !== 0)) return;
        root.focus({ preventScroll: true });
        const v = at(e);
        stars.forEach((_, i) => i < Math.ceil(v) && group.set({ [`s${i}`]: 0.86 }, { spring: 'press' }));
      });
      this.listen(root, 'click', (e: MouseEvent) => {
        if (disabled) return;
        hover = -1;
        stars.forEach((_, i) => group.set({ [`s${i}`]: 1 }, { spring: 'release' }));
        commit(at(e as PointerEvent), true, true);
      });
      this.listen(root, 'keydown', (e: KeyboardEvent) => {
        if (disabled) return;
        const rtl = typeof getComputedStyle === 'function' && getComputedStyle(root).direction === 'rtl';
        const fwd = rtl ? 'ArrowLeft' : 'ArrowRight';
        const back = rtl ? 'ArrowRight' : 'ArrowLeft';
        const moves: Record<string, number> = { [fwd]: step, ArrowUp: step, [back]: -step, ArrowDown: -step, Home: -Infinity, End: Infinity };
        if (!(e.key in moves)) return;
        e.preventDefault();
        const d = moves[e.key];
        const next = d === Infinity ? max : d === -Infinity ? 0 : this._value + d;
        if ((next > max && this._value >= max) || (next < 0 && this._value <= 0)) {
          const i = next > max ? max - 1 : 0;
          group.impulse({ [`s${i}`]: -2.5 }, 'elastic');
          return;
        }
        commit(next, true);
      });
      this.onCleanup(() => {
        group.stop();
        root.remove();
        this._set = null;
      });
    }
  }, { id: 'spring-kit-17', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
