import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import css from './moments-ui.css?raw';

/** The arrow's hop: up, a small rebound, settle. */
export const HOP_FRAMES: Keyframe[] = [
  { transform: 'translateY(0)' },
  { transform: 'translateY(-7px)', offset: 0.3 },
  { transform: 'translateY(1px)', offset: 0.55 },
  { transform: 'translateY(-2px)', offset: 0.75 },
  { transform: 'translateY(0)' },
];

/**
 * A pill button whose arrow hops in its direction when pressed, and whose body dips a little under the finger.
 * Attributes: `label` (Up), `direction` (up | down | left | right, up), `disabled`. Method `press()`.
 * Event `usa:press` (no detail).
 */
export interface UsaBounceButtonElement extends UsaElement {
  press(): void;
}

const DIRECTIONS = ['up', 'down', 'left', 'right'];

export function defineBounceButton(tag = 'usa-bounce-button'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class BounceButton extends Base {
    static get observedAttributes(): string[] { return ['label', 'direction', 'disabled']; }
    private _sync?: () => void;
    private _hop?: () => void;
    press(): void {
      if (this.flag('disabled')) return;
      this._hop?.();
      this.emit('press');
    }
    changed(): void { this._sync?.(); }
    mount(): void {
      const root = make('button', 'usa-moment usa-bounce');
      root.type = 'button';
      const text = make('span', 'usa-bounce-label');
      const arrow = make('span', 'usa-bounce-arrow');
      arrow.setAttribute('aria-hidden', 'true');
      const turn = make('span', 'usa-bounce-turn');
      turn.append(arrow);
      root.append(text, turn);
      this.append(root);
      let run: Animation | null = null;
      this._hop = () => { run?.cancel(); run = this.motion(arrow, HOP_FRAMES, { duration: 560, easing: 'ease-out' }); };
      const sync = () => {
        const dir = this.str('direction', 'up');
        root.dataset.direction = DIRECTIONS.includes(dir) ? dir : 'up';
        text.textContent = this.str('label', 'Up');
        arrow.textContent = '↑';
        root.disabled = this.flag('disabled');
      };
      this._sync = sync;
      this.listen(root, 'click', () => this.press());
      this.onCleanup(() => { run?.cancel(); root.remove(); this._sync = undefined; this._hop = undefined; });
      sync();
    }
  }, { id: 'moment-ui', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
