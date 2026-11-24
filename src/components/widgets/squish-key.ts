import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { pressSpring, tap } from './tactile';
import css from './tactile.css?raw';

/**
 * A soft, rubbery key: it sinks while held and wobbles back up past its rest height when let go. A native button
 * carries pointer, Enter and Space; a click from assistive tech still gets a short dip.
 *
 * Attributes: `label` (the key's text, A), `shape` (square | round | pill, square), `tone` (dark | light, dark),
 * `disabled`. Method `press()`. Event `usa:press` (no detail).
 */
export interface UsaSquishKeyElement extends UsaElement {
  press(): void;
}

export function defineSquishKey(tag = 'usa-squish-key'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class SquishKey extends Base {
    static get observedAttributes(): string[] { return ['label', 'shape', 'tone', 'disabled']; }
    private _sync?: () => void;
    private _tap?: () => void;
    press(): void {
      if (this.flag('disabled')) return;
      this._tap?.();
      this.emit('press');
    }
    changed(): void { this._sync?.(); }
    mount(): void {
      const tile = make('span', 'usa-tactile usa-squish');
      const key = make('button', 'usa-squish-key');
      key.type = 'button';
      const glyph = make('span', 'usa-squish-glyph');
      key.append(glyph);
      tile.append(key);
      this.append(tile);
      const press = pressSpring(this, key);
      this._tap = () => tap(press);
      const sync = () => {
        glyph.textContent = this.str('label', 'A');
        const shape = this.str('shape', 'square');
        tile.dataset.shape = shape === 'round' || shape === 'pill' ? shape : 'square';
        tile.dataset.tone = this.str('tone') === 'light' ? 'light' : 'dark';
        key.disabled = this.flag('disabled');
        tile.toggleAttribute('data-static', this.reduced);
      };
      this._sync = sync;
      this.listen(key, 'click', (e: MouseEvent) => {
        if (e.detail === 0) tap(press);
        this.emit('press');
      });
      this.onCleanup(() => { tile.remove(); this._sync = undefined; this._tap = undefined; });
      sync();
    }
  }, { id: 'tactile', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
