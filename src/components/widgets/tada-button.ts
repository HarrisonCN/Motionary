import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import css from './moments-ui.css?raw';

/** "Tada": shrink, shake with a slight tilt, grow back. */
export const TADA_FRAMES: Keyframe[] = [
  { transform: 'scale(1) rotate(0)' },
  { transform: 'scale(.9) rotate(-4deg)', offset: 0.1 },
  { transform: 'scale(.9) rotate(-4deg)', offset: 0.2 },
  { transform: 'scale(1.12) rotate(5deg)', offset: 0.3 },
  { transform: 'scale(1.12) rotate(-5deg)', offset: 0.45 },
  { transform: 'scale(1.12) rotate(5deg)', offset: 0.6 },
  { transform: 'scale(1.12) rotate(-3deg)', offset: 0.75 },
  { transform: 'scale(1) rotate(0)' },
];

/**
 * A favourite toggle: a star tile that celebrates with a "tada" when it is turned on. A native toggle button
 * (`aria-pressed`) carries pointer, Enter and Space. Attributes: `pressed`, `label` (Favourite), `disabled`.
 * Event `usa:change` ({ pressed }).
 */
export interface UsaTadaButtonElement extends UsaElement {
  pressed: boolean;
  toggle(force?: boolean): boolean;
}

export function defineTadaButton(tag = 'usa-tada-button'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class TadaButton extends Base {
    static get observedAttributes(): string[] { return ['pressed', 'label', 'disabled']; }
    private _sync?: () => void;
    get pressed(): boolean { return this.flag('pressed'); }
    set pressed(on: boolean) { this.setFlag('pressed', !!on); }
    toggle(force?: boolean): boolean {
      if (this.flag('disabled')) return this.pressed;
      this.pressed = force === undefined ? !this.pressed : !!force;
      return this.pressed;
    }
    changed(): void { this._sync?.(); }
    mount(): void {
      const root = make('button', 'usa-moment usa-tada');
      root.type = 'button';
      const star = make('span', 'usa-tada-star', '★');
      star.setAttribute('aria-hidden', 'true');
      root.append(star);
      this.append(root);
      let run: Animation | null = null;
      const sync = () => {
        root.setAttribute('aria-label', this.str('label', 'Favourite'));
        root.setAttribute('aria-pressed', String(this.pressed));
        root.toggleAttribute('data-on', this.pressed);
        root.disabled = this.flag('disabled');
      };
      this._sync = sync;
      this.listen(root, 'click', () => {
        if (this.flag('disabled')) return;
        const pressed = this.toggle();
        if (pressed) { run?.cancel(); run = this.motion(root, TADA_FRAMES, { duration: 800, easing: 'ease-in-out' }); }
        this.emit('change', { pressed });
      });
      this.onCleanup(() => { run?.cancel(); root.remove(); this._sync = undefined; });
      sync();
    }
  }, { id: 'moment-ui', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
