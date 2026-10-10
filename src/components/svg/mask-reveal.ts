import { defineElement, EASE_OUT, type UsaElement } from '../base';
import { keyClick } from '../key-click';
import css from './svg.css?raw';

/** Clip-path start / end frames for each reveal shape. */
export const MASK_SHAPES: Record<string, [string, string]> = {
  circle: ['circle(0% at 50% 50%)', 'circle(75% at 50% 50%)'],
  diamond: ['polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)', 'polygon(50% -50%, 150% 50%, 50% 150%, -50% 50%)'],
  wipe: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'],
  'wipe-up': ['inset(100% 0 0 0)', 'inset(0% 0 0 0)'],
  iris: ['inset(50% 50% 50% 50% round 50%)', 'inset(0% 0% 0% 0% round 0%)'],
  star: [
    'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%)',
    'polygon(50% -60%, 80% 20%, 160% 30%, 95% 85%, 115% 170%, 50% 125%, -15% 170%, 5% 85%, -60% 30%, 20% 20%)',
  ],
};

/**
 * `<usa-mask-reveal>` — reveals its content through a growing mask shape.
 * Attributes: `shape` (`circle` default · `diamond` · `wipe` · `wipe-up` ·
 * `iris` · `star`), `duration` (900), `delay`, `trigger` (`view` · `hover`
 * · `click`), `repeat`, `at` (`x% y%` origin for circle). Event
 * `usa:complete`. Reduced motion: content is shown without the mask.
 */
export interface UsaMaskRevealElement extends UsaElement {
  reveal(): Promise<void>;
}

export function defineMaskReveal(tag = 'usa-mask-reveal'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaMaskReveal extends Base {
        static get observedAttributes(): string[] {
          return ['shape', 'at', 'duration', 'delay', 'trigger', 'repeat'];
        }
        private frames(): [string, string] {
          const s = MASK_SHAPES[this.str('shape', 'circle')] || MASK_SHAPES.circle;
          const at = this.str('at');
          return at && s[0].startsWith('circle') ? [s[0].replace('50% 50%', at), s[1].replace('50% 50%', at)] : s;
        }

        reveal(): Promise<void> {
          const [a, b] = this.frames();
          this.setAttribute('data-state', 'revealing');
          // fill 'both' keeps the closed mask applied during `delay`
          const anim = this.motion(this, [{ clipPath: a }, { clipPath: b }], { duration: this.num('duration', 900), delay: this.num('delay', 0), easing: EASE_OUT, fill: 'both' });
          this.style.opacity = '';
          const done = () => {
            this.setAttribute('data-state', 'visible');
            this.emit('complete');
          };
          if (!anim) return Promise.resolve(done());
          return anim.finished.then(done, () => {});
        }

        mount(): void {
          if (this.reduced) {
            this.setAttribute('data-state', 'visible');
            return;
          }
          // 4.0.1: hide with opacity, not the closed clip-path — Chromium's
          // IntersectionObserver honours the target's own clip-path, so a fully
          // clipped element never reports as intersecting and never revealed.
          const hide = () => {
            this.getAnimations?.().forEach((x) => x.cancel());
            this.style.opacity = '0';
            this.setAttribute('data-state', 'hidden');
          };
          hide();
          this.onCleanup(() => ((this.style.opacity = ''), (this.style.clipPath = '')));
          const t = this.str('trigger', 'view');
          if (t === 'hover') this.listen(this, 'pointerenter', () => void this.reveal());
          else if (t === 'click') {
            this.listen(this, 'click', () => void this.reveal());
            keyClick(this as any);
          }
          else {
            let done = false;
            this.inView((v) => {
              if (v && (!done || this.flag('repeat'))) {
                done = true;
                void this.reveal();
              } else if (!v && this.flag('repeat')) hide();
            }, { threshold: 0.25 });
          }
        }
      },
    { id: 'svg', text: css }
  );
}
