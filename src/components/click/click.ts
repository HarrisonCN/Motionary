import { defineElement, EASE_OUT, type UsaElement } from '../base';
import { springEasing } from '../physics/spring';
import { burst, confetti, shake, haptic } from './fx';
import css from './click.css?raw';

export const CLICK_EFFECTS = ['ripple', 'burst', 'confetti', 'squish', 'press-spring', 'shake'] as const;
export type ClickEffect = (typeof CLICK_EFFECTS)[number];

/**
 * `<usa-click>` — click / tap effects on whatever it wraps (combinable:
 * `effect="press-spring burst"`).
 *
 * - `ripple` — an ink wave from the pointer (enhanced: `color`, soft edge);
 * - `burst` — particles radiating from the pointer (`shape`: circle, square, star, heart, emoji);
 * - `confetti` — a confetti cannon from the click point;
 * - `squish` — squash on press, stretch on release (spring);
 * - `press-spring` — dips while pressed, springs back with overshoot;
 * - `shake` — horizontal error shake; plays on `invalid` events from a form
 *   inside, on `shake()`, or on click when `trigger="click"`.
 *
 * Attributes: `effect`, `color`, `shape`, `count`, `haptic` (vibrate ms,
 * where supported), `disabled`. Keyboard (Space/Enter) triggers the effects
 * from the centre. Reduced motion: no particles or movement; press dims.
 */
export interface UsaClickElement extends UsaElement {
  readonly effects: string[];
  play(x?: number, y?: number): void;
  shake(): void;
}

export function defineClick(tag = 'usa-click'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaClick extends Base {
        static get observedAttributes(): string[] {
          return ['effect', 'disabled', 'trigger', 'color', 'count', 'shape', 'haptic'];
        }

        private _press: Animation | null = null;

        get effects(): string[] {
          return this.str('effect', 'ripple').split(/[\s,]+/).filter(Boolean);
        }

        mount(): void {
          this.listen(this, 'pointerdown', (e: PointerEvent) => {
            if (this.flag('disabled') || (e.pointerType === 'mouse' && e.button !== 0)) return;
            this.down();
            if (this.effects.includes('ripple')) this.ripple(e.clientX, e.clientY);
          });
          const up = () => this.up();
          this.listen(this, 'pointerup', up);
          this.listen(this, 'pointerleave', up);
          this.listen(this, 'pointercancel', up);
          this.listen(this, 'click', (e: MouseEvent) => {
            if (this.flag('disabled')) return;
            const kb = e.detail === 0;
            const r = this.getBoundingClientRect();
            const x = kb ? r.left + r.width / 2 : e.clientX;
            const y = kb ? r.top + r.height / 2 : e.clientY;
            if (kb && this.effects.includes('ripple')) this.ripple(x, y);
            this.play(x, y);
            if (this.effects.includes('shake') && this.str('trigger') === 'click') this.shake();
          });
          this.listen(this, 'keydown', (e: KeyboardEvent) => {
            if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) this.down();
          });
          this.listen(this, 'keyup', up);
          if (this.effects.includes('shake')) this.listen(this, 'invalid', () => this.shake(), { capture: true });
        }

        /** Particles + haptics at client (x, y) (default: centre). */
        play(x?: number, y?: number): void {
          if (x === undefined || y === undefined) {
            const r = this.getBoundingClientRect();
            x = r.left + r.width / 2;
            y = r.top + r.height / 2;
          }
          const fx = this.effects;
          const colors = this.str('color') ? this.str('color').split(',') : undefined;
          if (fx.includes('burst')) burst(x, y, { count: this.num('count', 12), shape: this.str('shape', 'circle'), colors });
          if (fx.includes('confetti')) confetti({ x, y, count: this.num('count', 60), colors, spread: 90, velocity: 0.8 });
          if (this.hasAttribute('haptic')) haptic(this.num('haptic', 10));
          this.emit('click-effect', { x, y, effects: fx });
        }

        shake(): void {
          shake(this);
          if (this.hasAttribute('haptic')) haptic([30, 40, 30]);
        }

        private ripple(x: number, y: number): void {
          if (this.reduced) return;
          const r = this.getBoundingClientRect();
          const cx = x - r.left;
          const cy = y - r.top;
          const radius = Math.hypot(Math.max(cx, r.width - cx), Math.max(cy, r.height - cy));
          const wave = document.createElement('span');
          wave.className = 'usa-click-wave';
          wave.setAttribute('aria-hidden', 'true');
          wave.style.cssText = `width:${radius * 2}px;height:${radius * 2}px;left:${cx - radius}px;top:${cy - radius}px;--usa-wave:${this.str('color', 'currentColor').split(',')[0]}`;
          this.append(wave);
          const a = this.motion(wave, [{ transform: 'scale(0)', opacity: 0.35 }, { transform: 'scale(1)', opacity: 0.25, offset: 0.6 }, { transform: 'scale(1.05)', opacity: 0 }], {
            duration: 650,
            easing: EASE_OUT,
            fill: 'forwards',
          });
          if (a) a.onfinish = () => wave.remove();
          else wave.remove();
        }

        private down(): void {
          if (this.hasAttribute('data-pressed')) return;
          const fx = this.effects;
          if (!fx.includes('squish') && !fx.includes('press-spring')) return;
          this.setAttribute('data-pressed', '');
          this._press?.cancel();
          const to = this.reduced ? { opacity: 0.75 } : fx.includes('squish') ? { transform: 'scale(1.08, 0.86)' } : { transform: 'scale(0.94)' };
          const from: Keyframe = this.reduced ? { opacity: 1 } : { transform: 'none' };
          this._press = this.motion(this, [from, to], {
            duration: 110,
            easing: 'ease-out',
            fill: 'forwards',
          });
        }

        private up(): void {
          if (!this.hasAttribute('data-pressed')) return;
          this.removeAttribute('data-pressed');
          const fx = this.effects;
          this._press?.cancel();
          if (this.reduced) {
            this._press = this.motion(this, [{ opacity: 0.75 }, { opacity: 1 }], { duration: 150 });
            return;
          }
          const from = fx.includes('squish') ? 'scale(1.08, 0.86)' : 'scale(0.94)';
          const frames: Keyframe[] = fx.includes('squish')
            ? [{ transform: from }, { transform: 'scale(0.92, 1.1)', offset: 0.3 }, { transform: 'scale(1.03, 0.97)', offset: 0.6 }, { transform: 'none' }]
            : [{ transform: from }, { transform: 'none' }];
          this._press = this.motion(this, frames, fx.includes('squish') ? { duration: 520, easing: 'ease-out' } : springEasing('bouncy'));
        }
      },
    { id: 'click', text: css }
  );
}
