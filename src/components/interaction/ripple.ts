import { defineElement, EASE_OUT, type UsaElement } from '../base';
import css from './ripple.css?raw';

/**
 * `<usa-ripple>` — an ink ripple from the pointer (or the centre, for
 * keyboard presses) on whatever it wraps: buttons, list items, cards.
 *
 * Attributes: `color` (default `currentColor`), `opacity` (0.22),
 * `duration` (ms, 550), `centered`, `disabled`. Clips its content to its
 * own border radius. Reduced motion: a brief highlight instead of the wave.
 */
export interface UsaRippleElement extends UsaElement {
  /** Spawn a ripple at client coordinates (default: centre). */
  ripple(x?: number, y?: number): void;
}

export function defineRipple(tag = 'usa-ripple'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaRipple extends Base {
        static get observedAttributes(): string[] {
          return ['disabled', 'centered', 'color', 'opacity', 'duration'];
        }

        mount(): void {
          this.listen(this, 'pointerdown', (e: PointerEvent) => {
            if (e.button !== 0 && e.pointerType === 'mouse') return;
            this.ripple(e.clientX, e.clientY);
          });
          this.listen(this, 'keydown', (e: KeyboardEvent) => {
            if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) this.ripple();
          });
        }

        ripple(x?: number, y?: number): void {
          if (this.flag('disabled')) return;
          const r = this.getBoundingClientRect();
          const centered = this.flag('centered') || x === undefined || y === undefined;
          const cx = centered ? r.width / 2 : (x as number) - r.left;
          const cy = centered ? r.height / 2 : (y as number) - r.top;
          const radius = Math.hypot(Math.max(cx, r.width - cx), Math.max(cy, r.height - cy));
          const wave = document.createElement('span');
          wave.className = 'usa-ripple-wave';
          wave.setAttribute('aria-hidden', 'true');
          const size = radius * 2;
          wave.style.cssText = `width:${size}px;height:${size}px;left:${cx - radius}px;top:${cy - radius}px;background:${this.str('color', 'currentColor')}`;
          this.append(wave);
          const opacity = this.num('opacity', 0.22);
          const duration = this.num('duration', 550);
          const frames = this.reduced
            ? [{ opacity }, { opacity: 0 }]
            : [
                { transform: 'scale(0)', opacity },
                { transform: 'scale(1)', opacity, offset: 0.7 },
                { transform: 'scale(1)', opacity: 0 },
              ];
          const a = this.motion(wave, frames, { duration: this.reduced ? 300 : duration, easing: EASE_OUT, fill: 'forwards' });
          if (a) a.onfinish = () => wave.remove();
          else setTimeout(() => wave.remove(), 0);
        }
      },
    { id: 'ripple', text: css }
  );
}
