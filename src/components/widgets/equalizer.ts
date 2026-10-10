import { defineElement, type UsaElement } from '../base';
import { clampN } from './shared';
import css from './equalizer.css?raw';

/**
 * `<usa-equalizer>` (7.1) — a graphic equalizer: one vertical slider per
 * band (`bands`, comma-separated labels — default 60 Hz … 16 kHz), each with
 * a springy cap; a smooth response curve is drawn through them. Presets
 * (`preset="flat | bass | vocal | rock | electronic"` or `applyPreset()`)
 * glide every band to its gain. Gains are −12…+12 dB; `values` (array),
 * keyboard per band (↑ / ↓ ±1, PageUp / PageDown ±3). Event `usa:change`
 * (`{ values }`). Reduced motion: bands jump.
 */
export interface UsaEqualizerElement extends UsaElement {
  values: number[];
  applyPreset(name: string): void;
}

export const EQ_PRESETS: Record<string, number[]> = {
  flat: [0, 0, 0, 0, 0, 0, 0],
  bass: [8, 6, 3, 0, -1, -1, 0],
  vocal: [-3, -1, 2, 5, 4, 1, -1],
  rock: [5, 3, -1, -2, 1, 4, 6],
  electronic: [6, 4, 0, -2, 2, 5, 7],
};

export function defineEqualizer(tag = 'usa-equalizer'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaEqualizer extends Base {
        static get observedAttributes(): string[] {
          return ['bands', 'preset', 'label'];
        }
        private _v: number[] = [];

        get values(): number[] {
          return this._v.slice();
        }
        set values(v: number[]) {
          v.forEach((x, i) => (this._v[i] = clampN(Math.round(x), -12, 12)));
          this.paint(true);
        }

        mount(): void {
          const labels = this.str('bands', '60,150,400,1k,2.4k,6k,16k').split(',').map((s) => s.trim()).filter(Boolean);
          const pre = EQ_PRESETS[this.str('preset', 'flat')] || EQ_PRESETS.flat;
          this._v = labels.map((_, i) => pre[Math.round((i / Math.max(1, labels.length - 1)) * (pre.length - 1))] || 0);
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          this.setAttribute('role', 'group');
          if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', this.str('label', 'Equalizer'));
          const bands = labels.map((l, i) => `<div class="usa-eq-band"><div class="usa-eq-slot" role="slider" tabindex="0" aria-orientation="vertical" aria-valuemin="-12" aria-valuemax="12" aria-label="${l} Hz" data-i="${i}"><span class="usa-eq-fill"></span><span class="usa-eq-cap"></span></div><span class="usa-eq-label">${l}</span></div>`).join('');
          this.insertAdjacentHTML('afterbegin', `<svg class="usa-eq-curve" data-usa-part aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 100 100"><path/></svg><div class="usa-eq-bands" data-usa-part>${bands}</div>`);
          this.querySelectorAll<HTMLElement>('.usa-eq-slot').forEach((slot) => {
            const i = Number(slot.dataset.i);
            this.listen(slot, 'keydown', (e: KeyboardEvent) => {
              const d: Record<string, number> = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: 3, PageDown: -3 };
              if (!(e.key in d)) return;
              e.preventDefault();
              this.setBand(i, this._v[i] + d[e.key]);
            });
            this.listen(slot, 'pointerdown', (e: PointerEvent) => {
              slot.setPointerCapture?.(e.pointerId);
              slot.toggleAttribute('data-drag', true);
              const at = (ev: PointerEvent) => {
                const r = slot.getBoundingClientRect();
                this.setBand(i, 12 - clampN((ev.clientY - r.top) / (r.height || 1), 0, 1) * 24);
              };
              at(e);
              const up = () => (slot.removeAttribute('data-drag'), slot.removeEventListener('pointermove', at), slot.removeEventListener('pointerup', up));
              slot.addEventListener('pointermove', at);
              slot.addEventListener('pointerup', up);
            });
          });
          this.paint(false);
        }

        private setBand(i: number, v: number): void {
          const n = clampN(Math.round(v), -12, 12);
          if (n === this._v[i]) return;
          this._v[i] = n;
          this.paint(false);
          this.emit('change', { values: this.values });
        }

        applyPreset(name: string): void {
          const p = EQ_PRESETS[name];
          if (!p) return;
          const n = this._v.length;
          this._v = this._v.map((_, i) => p[Math.round((i / Math.max(1, n - 1)) * (p.length - 1))] || 0);
          this.paint(true);
          this.emit('change', { values: this.values });
        }

        private paint(glide: boolean): void {
          this.toggleAttribute('data-glide', glide && !this.reduced);
          const slots = this.querySelectorAll<HTMLElement>('.usa-eq-slot');
          slots.forEach((s, i) => {
            const v = this._v[i] ?? 0;
            s.style.setProperty('--usa-eq-k', ((v + 12) / 24).toFixed(4));
            s.setAttribute('aria-valuenow', String(v));
            s.setAttribute('aria-valuetext', `${v > 0 ? '+' : ''}${v} dB`);
          });
          const n = this._v.length;
          const pts = this._v.map((v, i) => [((i + 0.5) / n) * 100, 50 - (v / 12) * 40]);
          let d = `M0 ${pts[0]?.[1] ?? 50}`;
          pts.forEach(([x, y], i) => {
            const [px, py] = i ? pts[i - 1] : [0, pts[0][1]];
            d += ` C${((px + x) / 2).toFixed(2)} ${py.toFixed(2)} ${((px + x) / 2).toFixed(2)} ${y.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)}`;
          });
          d += ` L100 ${pts[n - 1]?.[1] ?? 50}`;
          this.querySelector('.usa-eq-curve path')?.setAttribute('d', d);
        }
      }
      return UsaEqualizer as unknown as CustomElementConstructor;
    },
    { id: 'equalizer', text: css }
  );
}
