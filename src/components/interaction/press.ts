import { defineElement, EASE_SPRING, type UsaElement } from '../base';
import css from './press.css?raw';

/**
 * `<usa-press>` — tactile press feedback: content dips while pressed and
 * springs back on release (the Fluent "pointer down" scale), or bounces once
 * on click with `bounce`.
 *
 * Attributes: `scale` (pressed scale, 0.95), `bounce` (overshoot on
 * release), `disabled`. Works with mouse, touch, pen and Space/Enter.
 * Reduced motion: a subtle dim instead of scaling.
 */
export interface UsaPressElement extends UsaElement {
  readonly pressed: boolean;
}

export function definePress(tag = 'usa-press'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaPress extends Base {
        static get observedAttributes(): string[] {
          return ['disabled', 'scale', 'bounce'];
        }

        private _anim: Animation | null = null;
        private _down = false;

        get pressed(): boolean {
          return this._down;
        }

        private frame(down: boolean): Keyframe {
          if (this.reduced) return { opacity: down ? 0.7 : 1 };
          return { transform: down ? `scale(${this.num('scale', 0.95)})` : 'scale(1)' };
        }

        private down(): void {
          if (this._down || this.flag('disabled')) return;
          this._down = true;
          this.setAttribute('data-pressed', '');
          const from = this.currentFrame();
          this._anim?.cancel();
          this._anim = this.motion(this, [from, this.frame(true)], { duration: 120, easing: 'cubic-bezier(0.3, 0, 0.7, 1)', fill: 'forwards' });
        }

        private up(): void {
          if (!this._down) return;
          this._down = false;
          this.removeAttribute('data-pressed');
          const from = this.currentFrame();
          this._anim?.cancel();
          const frames: Keyframe[] =
            this.flag('bounce') && !this.reduced
              ? [from, { transform: 'scale(1.06)', offset: 0.45 }, { transform: 'scale(0.99)', offset: 0.75 }, this.frame(false)]
              : [from, this.frame(false)];
          const a = this.motion(this, frames, { duration: this.flag('bounce') ? 480 : 320, easing: EASE_SPRING });
          this._anim = a;
          if (a) a.onfinish = () => this._anim === a && (this._anim = null);
        }

        private currentFrame(): Keyframe {
          if (typeof getComputedStyle !== 'function') return this.frame(false);
          const cs = getComputedStyle(this);
          return this.reduced ? { opacity: cs.opacity || '1' } : { transform: cs.transform && cs.transform !== 'none' ? cs.transform : 'scale(1)' };
        }

        mount(): void {
          this.listen(this, 'pointerdown', (e: PointerEvent) => {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            this.down();
          });
          for (const t of ['pointerup', 'pointerleave', 'pointercancel', 'blur']) this.listen(this, t, () => this.up());
          this.listen(this, 'keydown', (e: KeyboardEvent) => (e.key === ' ' || e.key === 'Enter') && !e.repeat && this.down());
          this.listen(this, 'keyup', (e: KeyboardEvent) => (e.key === ' ' || e.key === 'Enter') && this.up());
        }

        unmount(): void {
          this._anim?.cancel();
          this._anim = null;
          this._down = false;
        }
      },
    { id: 'press', text: css }
  );
}
