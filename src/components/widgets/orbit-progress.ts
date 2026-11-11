import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { luminousTheme } from './luminous-shared';
import shared from './luminous.css?raw';
import css from './orbit-progress.css?raw';

/** `<mo-orbit-progress value="65" max="100" label="Export">` — determinate luminous glass progress dial.
 * Reflected numeric value, bounded to 0..max. Accessible progressbar. No idle rotation or invented progress.
 */
export interface UsaOrbitProgressElement extends UsaElement { value: number; }
export function defineOrbitProgress(tag = 'usa-orbit-progress'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => {
    class OrbitProgress extends Base {
      static get observedAttributes(): string[] { return ['value', 'max', 'label', 'theme']; }
      private _ring?: SVGCircleElement;
      private _text?: HTMLElement;
      get value(): number { return Math.max(0, Math.min(Math.max(1, this.num('max', 100)), this.num('value', 0))); }
      set value(v: number) { this.setAttribute('value', String(Number.isFinite(v) ? v : 0)); }
      changed(name: string): void { if (name === 'value' || name === 'max') this.sync(); else super.changed(name); }
      mount(): void {
        luminousTheme(this); this.querySelectorAll(':scope > [data-usa-part]').forEach(n => n.remove());
        const face = document.createElement('span'); face.className = 'usa-op-face usa-lu-surface'; face.setAttribute('data-usa-part', ''); face.setAttribute('aria-hidden', 'true');
        face.innerHTML = '<svg viewBox="0 0 100 100"><circle class="usa-op-track" cx="50" cy="50" r="42"/><circle class="usa-op-ring" cx="50" cy="50" r="42" pathLength="100"/></svg><span class="usa-op-value"></span>';
        this._ring = face.querySelector('.usa-op-ring')!; this._text = face.querySelector('.usa-op-value')!; this.append(face); this.sync();
      }
      private sync(): void {
        const max = Math.max(1, this.num('max', 100)), value = this.value;
        this.setAttribute('role', 'progressbar'); this.setAttribute('aria-label', this.str('label', 'Progress'));
        this.setAttribute('aria-valuemin', '0'); this.setAttribute('aria-valuemax', String(max)); this.setAttribute('aria-valuenow', String(value));
        this.toggleAttribute('data-lu-reduced', this.reduced);
        if (this._ring) this._ring.style.strokeDashoffset = String(100 - value / max * 100);
        if (this._text) this._text.textContent = `${Math.round(value / max * 100)}%`;
      }
    }
    return OrbitProgress;
  }, { id: 'orbit-progress', text: shared + css });
  defineMoName(tag, ctor); return ctor;
}
