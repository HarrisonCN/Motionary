import { defineElement, raf, caf, now, clamp, motionScale, type UsaElement } from '../base';
import { keyClick } from '../key-click';
import { drawLines } from './core';
import css from './svg.css?raw';

/**
 * `<usa-draw>` — line drawing: every stroke of the SVG inside draws itself.
 * Attributes: `trigger` (`view` default · `hover` · `click` · `scrub`),
 * `duration` (1600), `stagger` (0–0.9 share of the timeline, 0.2), `fill`
 * (fade the fill in after drawing), `repeat`. Method `play()`, property
 * `progress`, event `usa:complete`. Reduced motion: drawn immediately.
 */
export interface UsaDrawElement extends UsaElement {
  play(): void;
  progress: number;
}

export function defineDraw(tag = 'usa-draw'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaDraw extends Base {
        private _set: (p: number) => void = () => {};
        private _p = 0;
        private _id = 0;

        get progress(): number {
          return this._p;
        }
        set progress(p: number) {
          this._p = clamp(p, 0, 1);
          this._set(this._p);
          this.toggleAttribute('data-drawn', this._p >= 1);
        }

        play(): void {
          caf(this._id);
          if (this.reduced) {
            this.progress = 1;
            return void this.emit('complete');
          }
          const dur = this.num('duration', 1600) * motionScale();
          const t0 = now();
          this.progress = 0;
          const step = () => {
            this.progress = (now() - t0) / dur;
            if (this._p < 1) this._id = raf(step);
            else this.emit('complete');
          };
          this._id = raf(step);
        }

        mount(): void {
          this._set = drawLines(this, { stagger: this.num('stagger', 0.2) });
          const trigger = this.str('trigger', 'view');
          if (this.reduced) {
            this.progress = 1;
            return;
          }
          this.progress = 0;
          if (trigger === 'scrub') {
            const update = () => {
              const r = this.getBoundingClientRect();
              const vh = window.innerHeight || 1;
              this.progress = (vh - r.top) / (vh * 0.6 + r.height * 0.4 || 1);
            };
            this.listen(window, 'scroll', update, { passive: true });
            update();
          } else if (trigger === 'hover') this.listen(this, 'pointerenter', () => this.play());
          else if (trigger === 'click') {
            this.listen(this, 'click', () => this.play());
            keyClick(this as any);
          }
          else {
            let done = false;
            this.inView((v) => {
              if (v && (!done || this.flag('repeat'))) {
                done = true;
                this.play();
              } else if (!v && this.flag('repeat')) this.progress = 0;
            }, { threshold: 0.3 });
          }
          this.onCleanup(() => caf(this._id));
        }
      },
    { id: 'svg', text: css }
  );
}
