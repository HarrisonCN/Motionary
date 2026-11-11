import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { luminousTheme } from './luminous-shared';
import shared from './luminous.css?raw';
import css from './halo-segmented.css?raw';

/** `<mo-halo-segmented options="Studio,Gallery,Export" value="Studio">` — glowing glass radio choices with a spring pill.
 * `value` is reflected. Arrow keys (including RTL), Home/End and native Space activation. `usa:change` { value, index }.
 */
export interface UsaHaloSegmentedElement extends UsaElement { value: string; }
export function defineHaloSegmented(tag = 'usa-halo-segmented'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => {
    class HaloSegmented extends Base {
      static get observedAttributes(): string[] { return ['options', 'value', 'label', 'disabled', 'theme']; }
      private _items: HTMLButtonElement[] = [];
      private _pill?: HTMLElement;
      private _reflecting = false;
      get value(): string { return this.str('value'); }
      set value(v: string) { this.setAttribute('value', v); }
      changed(name: string): void { if (!this._reflecting) { if (name === 'value' || name === 'disabled') this.sync(); else super.changed(name); } }
      mount(): void {
        luminousTheme(this); this.querySelectorAll(':scope > [data-usa-part]').forEach(n => n.remove());
        this.setAttribute('role', 'radiogroup'); this.setAttribute('aria-label', this.str('label', 'Mode'));
        const track = document.createElement('span'); track.className = 'usa-hs-track usa-lu-surface'; track.setAttribute('data-usa-part', '');
        const pill = document.createElement('span'); pill.className = 'usa-hs-pill usa-lu-glass'; pill.setAttribute('aria-hidden', 'true'); track.append(pill); this._pill = pill;
        const options = [...new Set(this.str('options', 'Studio,Gallery,Export').split(',').map(s => s.trim()).filter(Boolean))].slice(0, 12);
        if (!options.length) options.push('Studio');
        this._items = options.map(value => {
          const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'radio'); b.textContent = value; b.dataset.value = value; track.append(b);
          this.listen(b, 'click', () => this.select(value, true)); return b;
        });
        this.append(track); this.sync();
        this.listen(track, 'keydown', (e: KeyboardEvent) => {
          if (this.flag('disabled')) return;
          const i = this._items.findIndex(b => b.dataset.value === this.value), rtl = getComputedStyle(this).direction === 'rtl';
          const d = e.key === 'ArrowRight' ? (rtl ? -1 : 1) : e.key === 'ArrowLeft' ? (rtl ? 1 : -1) : e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;
          const n = e.key === 'Home' ? 0 : e.key === 'End' ? this._items.length - 1 : d ? (i + d + this._items.length) % this._items.length : -1;
          if (n < 0) return; e.preventDefault(); this.select(this._items[n].dataset.value!, true); this._items[n].focus();
        });
      }
      private select(v: string, user: boolean): void {
        if (this.flag('disabled') || v === this.value) return;
        this.value = v; if (user) this.emit('change', { value: this.value, index: this._items.findIndex(b => b.dataset.value === this.value) });
      }
      private sync(): void {
        if (!this._items.length) return;
        let i = this._items.findIndex(b => b.dataset.value === this.value); if (i < 0) i = 0;
        this._reflecting = true; this.value = this._items[i].dataset.value!; this._reflecting = false;
        this.toggleAttribute('data-lu-reduced', this.reduced); this.setAttribute('aria-disabled', String(this.flag('disabled')));
        this._items.forEach((b, n) => { b.disabled = this.flag('disabled'); b.tabIndex = n === i ? 0 : -1; b.setAttribute('aria-checked', String(n === i)); });
        if (this._pill) { this._pill.style.width = `calc((100% - 8px) / ${this._items.length})`; this._pill.style.insetInlineStart = `calc(4px + (100% - 8px) * ${i} / ${this._items.length})`; }
      }
    }
    return HaloSegmented;
  }, { id: 'halo-segmented', text: shared + css });
  defineMoName(tag, ctor); return ctor;
}
