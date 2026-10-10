import { defineElement, type UsaElement } from '../base';
import { clampN } from './shared';
import css from './color-picker.css?raw';

/**
 * `<usa-color-picker>` (6.9) — a colour picker: a saturation / brightness
 * square and a hue strip (both `role="slider"`, arrow keys, Shift = ×10),
 * spring-follow thumbs, a preview chip that morphs to the new colour, and
 * optional `swatches` (comma-separated hex) that pop on pick. `value` is
 * `#rrggbb`. Events `usa:input` while dragging and `usa:change` on release
 * (`{ value }`). Reduced motion: thumbs jump, no pop.
 */
export interface UsaColorPickerElement extends UsaElement {
  value: string;
}

/** HSV (h 0–360, s / v 0–1) → `#rrggbb`. */
export function hsvToHex(h: number, s: number, v: number): string {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return Math.round((v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255);
  };
  return '#' + [f(5), f(3), f(1)].map((x) => x.toString(16).padStart(2, '0')).join('');
}
/** `#rrggbb` → HSV (or null). */
export function hexToHsv(hex: string): [number, number, number] | null {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex.trim());
  if (!m) return null;
  const [r, g, b] = [m[1], m[2], m[3]].map((x) => parseInt(x, 16) / 255);
  const mx = Math.max(r, g, b);
  const d = mx - Math.min(r, g, b);
  let h = 0;
  if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(h * 60 + 360) % 360, mx ? d / mx : 0, mx];
}

export function defineColorPicker(tag = 'usa-color-picker'): CustomElementConstructor | undefined {
  // contract-exempt: attr-unobserved(value) — state reflected by the element itself (set the property instead); observing it would re-mount on every change
  return defineElement(
    tag,
    (Base) => {
      class UsaColorPicker extends Base {
        static get observedAttributes(): string[] {
          return ['swatches'];
        }
        private _h = 260;
        private _s = 0.64;
        private _v = 1;

        get value(): string {
          return hsvToHex(this._h, this._s, this._v);
        }
        set value(v: string) {
          const hsv = hexToHsv(v);
          if (!hsv) return;
          [this._h, this._s, this._v] = hsv;
          this.paint(true);
        }

        mount(): void {
          const hsv = hexToHsv(this.str('value', '#7c5cff'));
          if (hsv) [this._h, this._s, this._v] = hsv;
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          const sw = this.str('swatches', '').split(',').map((s) => s.trim()).filter((s) => hexToHsv(s));
          this.insertAdjacentHTML('afterbegin', `<div class="usa-cp-sv" data-usa-part role="slider" tabindex="0" aria-label="Saturation and brightness"><span class="usa-cp-thumb"></span></div><div class="usa-cp-row" data-usa-part><span class="usa-cp-chip" aria-hidden="true"></span><div class="usa-cp-hue" role="slider" tabindex="0" aria-label="Hue" aria-valuemin="0" aria-valuemax="360"><span class="usa-cp-thumb"></span></div></div>${sw.length ? `<div class="usa-cp-swatches" data-usa-part>${sw.map((c) => `<button type="button" class="usa-cp-sw" style="background:${c}" data-c="${c}" aria-label="${c}"></button>`).join('')}</div>` : ''}`);
          const sv = this.querySelector('.usa-cp-sv') as HTMLElement;
          const hue = this.querySelector('.usa-cp-hue') as HTMLElement;
          this.drag(sv, (x, y) => ((this._s = x), (this._v = 1 - y)));
          this.drag(hue, (x) => (this._h = x * 360));
          this.listen(sv, 'keydown', (e: KeyboardEvent) => this.keys(e, (d, ax) => (ax ? (this._v = clampN(this._v - d, 0, 1)) : (this._s = clampN(this._s + d, 0, 1)))));
          this.listen(hue, 'keydown', (e: KeyboardEvent) => this.keys(e, (d) => (this._h = (this._h + d * 360 + 360) % 360)));
          this.listen(this, 'click', (e: Event) => {
            const b = (e.target as HTMLElement).closest?.('.usa-cp-sw') as HTMLElement | null;
            if (!b) return;
            this.value = b.dataset.c!;
            if (!this.reduced) this.motion(b, [{ transform: 'scale(1)' }, { transform: 'scale(1.35)', offset: 0.4 }, { transform: 'scale(1)' }], { duration: 360, easing: 'cubic-bezier(.3,1.5,.5,1)' });
            this.emit('change', { value: this.value });
          });
          this.paint(false);
        }

        private keys(e: KeyboardEvent, fn: (d: number, vertical: boolean) => void): void {
          const k = e.shiftKey ? 0.1 : 0.01;
          const map: Record<string, [number, boolean]> = { ArrowLeft: [-k, false], ArrowRight: [k, false], ArrowUp: [-k, true], ArrowDown: [k, true] };
          const m = map[e.key];
          if (!m) return;
          e.preventDefault();
          fn(m[0], m[1]);
          this.paint(false);
          this.emit('change', { value: this.value });
        }

        private drag(area: HTMLElement, fn: (x: number, y: number) => void): void {
          const at = (e: PointerEvent) => {
            const r = area.getBoundingClientRect();
            fn(clampN((e.clientX - r.left) / (r.width || 1), 0, 1), clampN((e.clientY - r.top) / (r.height || 1), 0, 1));
            this.paint(false);
            this.emit('input', { value: this.value });
          };
          this.listen(area, 'pointerdown', (e: PointerEvent) => {
            area.setPointerCapture?.(e.pointerId);
            area.toggleAttribute('data-drag', true);
            at(e);
            const move = (ev: PointerEvent) => at(ev);
            const up = () => {
              area.removeAttribute('data-drag');
              area.removeEventListener('pointermove', move);
              area.removeEventListener('pointerup', up);
              this.emit('change', { value: this.value });
            };
            area.addEventListener('pointermove', move);
            area.addEventListener('pointerup', up);
          });
        }

        private paint(morph: boolean): void {
          const c = this.value;
          this.style.setProperty('--usa-cp-h', String(Math.round(this._h)));
          this.style.setProperty('--usa-cp-color', c);
          this.style.setProperty('--usa-cp-x', (this._s * 100).toFixed(2) + '%');
          this.style.setProperty('--usa-cp-y', ((1 - this._v) * 100).toFixed(2) + '%');
          this.style.setProperty('--usa-cp-hx', ((this._h / 360) * 100).toFixed(2) + '%');
          const sv = this.querySelector('.usa-cp-sv');
          sv?.setAttribute('aria-valuetext', `saturation ${Math.round(this._s * 100)}%, brightness ${Math.round(this._v * 100)}%`);
          const hue = this.querySelector('.usa-cp-hue');
          hue?.setAttribute('aria-valuenow', String(Math.round(this._h)));
          this.setAttribute('value', c);
          const chip = this.querySelector('.usa-cp-chip');
          if (morph && chip && !this.reduced) this.motion(chip, [{ borderRadius: '50%', transform: 'scale(.7) rotate(-20deg)' }, { borderRadius: '30%', transform: 'scale(1.1)', offset: 0.6 }, { borderRadius: '50%', transform: 'none' }], { duration: 420, easing: 'ease-out' });
        }
      }
      return UsaColorPicker as unknown as CustomElementConstructor;
    },
    { id: 'color-picker', text: css }
  );
}
