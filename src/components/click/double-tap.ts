import { defineElement, type UsaElement } from '../base';
import { burst, haptic } from './fx';
import css from './double-tap.css?raw';

/**
 * `<usa-double-tap>` — detects a double tap / double click on its content
 * (photos, posts) and pops a heart (or `icon`) at the tap point.
 *
 * Attributes: `icon` (text / emoji, default ♥), `color`, `delay` (max ms
 * between taps, 300), `haptic`, `disabled`. Events: `usa:double-tap`
 * (`{ x, y }`, element-relative). Keyboard users: press `L` while focused.
 * Reduced motion: the icon fades in and out without scaling or particles.
 */
export interface UsaDoubleTapElement extends UsaElement {
  pop(x?: number, y?: number): void;
}

export function defineDoubleTap(tag = 'usa-double-tap'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaDoubleTap extends Base {
        static get observedAttributes(): string[] {
          return ['disabled', 'delay', 'icon', 'color'];
        }
        mount(): void {
          let last = 0;
          let lx = 0;
          let ly = 0;
          this.listen(this, 'pointerup', (e: PointerEvent) => {
            if (this.flag('disabled')) return;
            const t = e.timeStamp || Date.now();
            if (t - last < this.num('delay', 300) && Math.hypot(e.clientX - lx, e.clientY - ly) < 40) {
              last = 0;
              this.pop(e.clientX, e.clientY);
            } else {
              last = t;
              lx = e.clientX;
              ly = e.clientY;
            }
          });
          this.listen(this, 'dblclick', (e: MouseEvent) => e.preventDefault());
          this.listen(this, 'keydown', (e: KeyboardEvent) => e.key.toLowerCase() === 'l' && !e.repeat && this.pop());
        }

        pop(x?: number, y?: number): void {
          const r = this.getBoundingClientRect();
          if (x === undefined || y === undefined) {
            x = r.left + r.width / 2;
            y = r.top + r.height / 2;
          }
          const icon = document.createElement('span');
          icon.className = 'usa-double-tap-icon';
          icon.setAttribute('aria-hidden', 'true');
          icon.textContent = this.str('icon', '♥');
          icon.style.left = `${x - r.left}px`;
          icon.style.top = `${y - r.top}px`;
          if (this.str('color')) icon.style.color = this.str('color');
          this.append(icon);
          const frames: Keyframe[] = this.reduced
            ? [{ opacity: 0 }, { opacity: 1, offset: 0.3 }, { opacity: 0 }]
            : [
                { opacity: 0, transform: 'translate(-50%, -50%) scale(0.2) rotate(-15deg)' },
                { opacity: 1, transform: 'translate(-50%, -50%) scale(1.15) rotate(5deg)', offset: 0.3 },
                { opacity: 1, transform: 'translate(-50%, -50%) scale(1) rotate(0deg)', offset: 0.6 },
                { opacity: 0, transform: 'translate(-50%, -110%) scale(0.9)' },
              ];
          const a = this.motion(icon, frames, { duration: 900, easing: 'ease-out', fill: 'forwards' });
          if (a) a.onfinish = () => icon.remove();
          else icon.remove();
          burst(x, y, { count: 8, distance: 40, size: 5, colors: [this.str('color', '#f43f5e'), '#fb923c', '#facc15'] });
          if (this.hasAttribute('haptic')) haptic(15);
          this.emit('double-tap', { x: x - r.left, y: y - r.top });
        }
      },
    { id: 'double-tap', text: css }
  );
}
