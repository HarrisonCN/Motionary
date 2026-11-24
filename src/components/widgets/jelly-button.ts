import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import css from './moments-ui.css?raw';

/** The wobble a press plays: a quick squash, then decaying stretch and squash back to rest. */
export const JELLY_FRAMES: Keyframe[] = [
  { transform: 'scale(1, 1)' },
  { transform: 'scale(1.18, .82)', offset: 0.18 },
  { transform: 'scale(.88, 1.12)', offset: 0.36 },
  { transform: 'scale(1.06, .94)', offset: 0.54 },
  { transform: 'scale(.98, 1.02)', offset: 0.72 },
  { transform: 'scale(1, 1)' },
];

/**
 * A round button that wobbles like jelly when pressed. A native button carries pointer, Enter and Space; the wobble is
 * skipped under reduced motion. Attributes: `label` (the accessible name, Add), `glyph` (the visible sign, +),
 * `disabled`. Method `press()`. Event `usa:press` (no detail).
 */
export interface UsaJellyButtonElement extends UsaElement {
  press(): void;
}

export function defineJellyButton(tag = 'usa-jelly-button'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class JellyButton extends Base {
    static get observedAttributes(): string[] { return ['label', 'glyph', 'disabled']; }
    private _sync?: () => void;
    private _wobble?: () => void;
    press(): void {
      if (this.flag('disabled')) return;
      this._wobble?.();
      this.emit('press');
    }
    changed(): void { this._sync?.(); }
    mount(): void {
      const root = make('button', 'usa-moment usa-jelly');
      root.type = 'button';
      const glyph = make('span', 'usa-jelly-glyph');
      glyph.setAttribute('aria-hidden', 'true');
      root.append(glyph);
      this.append(root);
      let run: Animation | null = null;
      this._wobble = () => { run?.cancel(); run = this.motion(root, JELLY_FRAMES, { duration: 620, easing: 'linear' }); };
      const sync = () => {
        glyph.textContent = this.str('glyph', '+');
        root.setAttribute('aria-label', this.str('label', 'Add'));
        root.disabled = this.flag('disabled');
      };
      this._sync = sync;
      this.listen(root, 'click', () => this.press());
      this.onCleanup(() => { run?.cancel(); root.remove(); this._sync = undefined; this._wobble = undefined; });
      sync();
    }
  }, { id: 'moment-ui', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
