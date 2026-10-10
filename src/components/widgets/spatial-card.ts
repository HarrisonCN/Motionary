import { defineElement, type UsaElement } from '../base';
import css from './spatial-card.css?raw';

/**
 * `<usa-spatial-card>` (8.8) — a spatial-computing style window: frosted
 * glass panel floating in depth, a soft "gaze" highlight that follows the
 * pointer, `[data-depth]` content layered towards the viewer, and an
 * ornament bar (`ornament` = child `[slot=ornament]`) that lifts out below
 * the window. It eases forward on hover / focus and sinks back on press,
 * like poking a visionOS window. `usa:focus-depth` { active }. Reduced
 * motion: static glass.
 */
export interface UsaSpatialCardElement extends UsaElement {
  readonly active: boolean;
}

export function defineSpatialCard(tag = 'usa-spatial-card'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaSpatialCard extends Base {
        private _a = false;
        get active(): boolean {
          return this._a;
        }
        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          this.insertAdjacentHTML('afterbegin', '<span class="usa-sp-gaze" aria-hidden="true" data-usa-part></span>');
          const orn = this.querySelector<HTMLElement>(':scope > [slot=ornament]');
          if (orn) orn.classList.add('usa-sp-ornament');
          const set = (on: boolean) => {
            if (on === this._a) return;
            this._a = on;
            this.setFlag('data-active', on);
            this.emit('focus-depth', { active: on });
          };
          this.listen(this, 'pointermove', (e: PointerEvent) => {
            const r = this.getBoundingClientRect();
            if (!r.width) return;
            this.style.setProperty('--gx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
            this.style.setProperty('--gy', `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
          });
          this.listen(this, 'pointerenter', () => set(true));
          this.listen(this, 'pointerleave', () => set(this.matches(':focus-within')));
          this.listen(this, 'focusin', () => set(true));
          this.listen(this, 'focusout', (e: FocusEvent) => {
            if (!this.contains(e.relatedTarget as Node)) set(false);
          });
          // contract-exempt: keyboard-click-only — pointer-driven depth decoration, no action
          this.listen(this, 'pointerdown', () => {
            if (!this.reduced) this.motion(this, [{ transform: 'perspective(900px) translateZ(18px)' }, { transform: 'perspective(900px) translateZ(-6px)', offset: 0.4 }, { transform: 'perspective(900px) translateZ(18px)' }], { duration: 320, easing: 'ease-out' });
          });
        }
      }
      return UsaSpatialCard as unknown as CustomElementConstructor;
    },
    { id: 'spatial-card', text: css }
  );
}
