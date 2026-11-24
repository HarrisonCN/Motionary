import { defineElement, type UsaElement } from '../base';
import { createSpring } from '../physics/spring';
import { defineMoName } from './mo-name';
import { bound, make, uniqueId } from './moments';
import css from './moments.css?raw';

/**
 * A vertical volume pill that bulges under the finger: press or drag anywhere on it to set the level, the pill swells
 * around the touch point and settles on a spring when released. A native range input (visually tucked away, still
 * focusable) carries the value for arrow / Page / Home / End keys and screen readers.
 *
 * Attributes: `value` (0–100, 60), `label`, `disabled`. Events `usa:input` / `usa:change` ({ value }).
 */
export interface UsaBulgeVolumeElement extends UsaElement {
  value: number;
}

export function defineBulgeVolume(tag = 'usa-bulge-volume'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class BulgeVolume extends Base {
    static get observedAttributes(): string[] { return ['value', 'label', 'disabled']; }
    private _sync?: () => void;
    get value(): number { return Math.round(bound(this.num('value', 60), 0, 100, 60)); }
    set value(n: number) { this.setAttribute('value', String(Math.round(bound(Number(n), 0, 100, 0)))); }
    changed(): void { this._sync?.(); }
    mount(): void {
      const root = make('div', 'usa-moment usa-bulge');
      const pill = make('div', 'usa-bulge-pill');
      pill.setAttribute('aria-hidden', 'true');
      pill.append(make('span', 'usa-bulge-fill'), make('span', 'usa-bulge-glyph'));
      const id = uniqueId('usa-bulge');
      const input = make('input', 'usa-bulge-input');
      input.type = 'range'; input.min = '0'; input.max = '100'; input.step = '1'; input.id = id;
      const title = make('label', 'usa-bulge-label');
      title.htmlFor = id;
      const out = make('output', 'usa-bulge-value');
      root.append(pill, input, title, out);
      this.append(root);

      const swell = createSpring({ spring: { stiffness: 380, damping: 15 }, onUpdate: (b) => root.style.setProperty('--bulge', b.toFixed(4)) });
      const level = createSpring({ value: this.value / 100, spring: { stiffness: 460, damping: 30 }, onUpdate: (v) => root.style.setProperty('--v', v.toFixed(4)) });
      root.style.setProperty('--v', String(this.value / 100));
      let pointer: number | undefined;
      const fromPointer = (e: PointerEvent) => {
        const r = pill.getBoundingClientRect();
        const at = r.height ? bound((e.clientY - r.top) / r.height, 0, 1, 0.5) : 0.5;
        root.style.setProperty('--at', at.toFixed(4));
        return Math.round((1 - at) * 100);
      };
      const set = (v: number) => {
        if (v === this.value) return;
        this.value = v;
        this.emit('input', { value: this.value });
      };
      const sync = () => {
        const v = this.value, disabled = this.flag('disabled');
        title.textContent = this.str('label', 'Volume');
        out.textContent = `${v}%`;
        input.value = String(v);
        input.disabled = disabled;
        root.toggleAttribute('data-disabled', disabled);
        root.dataset.level = v === 0 ? 'mute' : v < 34 ? 'low' : v < 67 ? 'mid' : 'high';
        level.set(v / 100);
      };
      this._sync = sync;
      this.listen(pill, 'pointerdown', (e: PointerEvent) => {
        if (this.flag('disabled') || pointer !== undefined || (e.pointerType === 'mouse' && e.button !== 0)) return;
        pointer = e.pointerId;
        pill.setPointerCapture?.(e.pointerId);
        e.preventDefault();
        input.focus({ preventScroll: true });
        swell.set(1);
        set(fromPointer(e));
      });
      this.listen(pill, 'pointermove', (e: PointerEvent) => { if (e.pointerId === pointer) set(fromPointer(e)); });
      const end = (e: PointerEvent) => {
        if (e.pointerId !== pointer) return;
        pointer = undefined;
        swell.set(0, -2);
        this.emit('change', { value: this.value });
      };
      this.listen(pill, 'pointerup', end);
      this.listen(pill, 'pointercancel', end);
      this.listen(input, 'input', () => {
        root.style.setProperty('--at', String(1 - input.valueAsNumber / 100));
        swell.set(0.45);
        set(input.valueAsNumber);
      });
      this.listen(input, 'change', () => { swell.set(0); this.emit('change', { value: this.value }); });
      this.listen(input, 'blur', () => swell.set(0));
      this.onCleanup(() => { swell.stop(); level.stop(); root.remove(); this._sync = undefined; });
      sync();
    }
  }, { id: 'moments', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
