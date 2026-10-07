import { defineElement, type UsaElement } from '../base';
import css from './svg.css?raw';

type Icon = { d: string; frames: Keyframe[]; duration: number; origin?: string };

/** Built-in animated icons (24×24 strokes) and the motion each one plays. */
export const ANIM_ICONS: Record<string, Icon> = {
  bell: { d: 'M6 16V11a6 6 0 0 1 12 0v5l2 2H4l2-2M10 20a2 2 0 0 0 4 0', duration: 800, origin: '50% 10%', frames: [{ rotate: '0deg' }, { rotate: '18deg' }, { rotate: '-14deg' }, { rotate: '9deg' }, { rotate: '-5deg' }, { rotate: '0deg' }] },
  heart: { d: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z', duration: 600, frames: [{ scale: 1 }, { scale: 1.3 }, { scale: 0.92 }, { scale: 1.12 }, { scale: 1 }] },
  check: { d: 'M4 12.5l5 5L20 6.5', duration: 600, frames: [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }] },
  arrow: { d: 'M4 12h15M13 6l6 6-6 6', duration: 600, frames: [{ translate: '0 0' }, { translate: '5px 0' }, { translate: '0 0' }] },
  star: { d: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z', duration: 700, frames: [{ rotate: '0deg', scale: 1 }, { rotate: '72deg', scale: 1.2 }, { rotate: '144deg', scale: 1 }] },
  gear: { d: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1', duration: 900, frames: [{ rotate: '0deg' }, { rotate: '180deg' }] },
  search: { d: 'M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM15.5 15.5L20 20', duration: 700, frames: [{ rotate: '0deg' }, { rotate: '-15deg' }, { rotate: '10deg' }, { rotate: '0deg' }] },
  download: { d: 'M12 4v11M7 10l5 5 5-5M5 20h14', duration: 700, frames: [{ translate: '0 0' }, { translate: '0 3px' }, { translate: '0 0' }] },
};

/**
 * `<usa-anim-icon name="bell">` — an animated stroke icon that plays its
 * motion on `trigger` (`hover` default · `click` · `view` · `loop`).
 * Attributes: `name` (see `ANIM_ICONS`), `size` (24), `label` (accessible
 * name; decorative when absent). Method `play()`. Reduced motion: static.
 */
export interface UsaAnimIconElement extends UsaElement {
  play(): void;
}

export function defineAnimIcon(tag = 'usa-anim-icon'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaAnimIcon extends Base {
        static get observedAttributes(): string[] {
          return ['name', 'size', 'label'];
        }
        private icon(): Icon {
          return ANIM_ICONS[this.str('name', 'heart')] || ANIM_ICONS.heart;
        }

        play(): void {
          if (this.reduced) return;
          const svg = this.querySelector('svg');
          const i = this.icon();
          const target = i.frames[0].strokeDashoffset !== undefined ? this.querySelector('path') : svg;
          if (target) this.motion(target, i.frames, { duration: i.duration, easing: 'ease-in-out', iterations: this.str('trigger') === 'loop' ? Infinity : 1 });
        }

        mount(): void {
          const i = this.icon();
          const size = this.num('size', 24);
          const label = this.str('label');
          this.innerHTML = `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform-origin:${i.origin || '50% 50%'}"${label ? ` role="img" aria-label="${label.replace(/"/g, '&quot;')}"` : ' aria-hidden="true"'}><path d="${i.d}"${i.frames[0].strokeDashoffset !== undefined ? ' pathLength="1" stroke-dasharray="1"' : ''}></path></svg>`;
          const t = this.str('trigger', 'hover');
          if (t === 'click') this.listen(this, 'click', () => this.play());
          else if (t === 'view' || t === 'loop') this.inView((v) => v && this.play(), { threshold: 0.5 });
          else {
            this.listen(this, 'pointerenter', () => this.play());
            this.listen(this, 'focusin', () => this.play());
          }
        }
      },
    { id: 'svg', text: css }
  );
}
