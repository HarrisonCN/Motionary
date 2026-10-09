import { defineElement, type UsaElement } from '../base';
import { createTimeline, HYDRATE_PRESETS, type MotionTimeline } from '../engine';
import css from './hydrate.css?raw';

/**
 * `<usa-hydrate effect="fade-up" stagger="60">` (8.0) — SSR hydration
 * animation for its children: server-rendered content stays hidden only
 * while JS is on and the element has not upgraded yet (with `ssrHead()` in
 * the document head; a 3 s CSS fallback reveals it anyway), then the
 * children animate in one after another on the unified clock and the
 * element gets `data-usa-hydrated` (`usa:hydrated`). `effect`: fade ·
 * fade-up · fade-down · scale · blur · slide-left; `duration`; `replay()`;
 * `timeline`. Reduced motion: shown at once.
 */
export interface UsaHydrateElement extends UsaElement {
  readonly timeline: MotionTimeline | null;
  replay(): void;
}

export function defineHydrate(tag = 'usa-hydrate'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaHydrate extends Base {
        static get observedAttributes(): string[] {
          return ['effect', 'stagger', 'duration'];
        }
        private _tl: MotionTimeline | null = null;
        get timeline(): MotionTimeline | null {
          return this._tl;
        }
        mount(): void {
          this.replay();
        }
        unmount(): void {
          this._tl?.cancel();
          this._tl = null;
        }
        replay(): void {
          this._tl?.cancel();
          const kids = Array.from(this.children) as HTMLElement[];
          const frames = HYDRATE_PRESETS[this.str('effect', 'fade-up')] || HYDRATE_PRESETS['fade-up'];
          const tl = createTimeline({ duration: this.num('duration', 600), easing: 'cubic-bezier(.2,.8,.2,1)' });
          const stagger = this.num('stagger', 60);
          kids.forEach((k, i) => tl.add(k, frames, {}, i * stagger));
          this._tl = tl;
          tl.play();
          this.setAttribute('data-usa-hydrated', '');
          tl.finished.then(() => this.isConnected && this._tl === tl && this.emit('hydrated', { count: kids.length }));
        }
      }
      return UsaHydrate as unknown as CustomElementConstructor;
    },
    { id: 'hydrate', text: css }
  );
}
