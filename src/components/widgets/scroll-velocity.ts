import { defineElement, onFrame, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { ownChildren } from './kit';
import css from './motion-surfaces.css?raw';

export type VelocityMode = 'skew' | 'stretch' | 'blur' | 'tilt';

/** Map a scroll speed (px per frame at 60 fps) to the effect amount, softly capped at ±1. */
export function velocityAmount(pxPerFrame: number, strength = 1): number {
  const v = (pxPerFrame / 40) * strength;
  return Math.tanh(v);
}

/**
 * Content that reacts to how fast the page scrolls: the faster the scroll, the more it skews, stretches, blurs or
 * tilts, and it eases back to rest when the scroll stops. Only while the element is on screen; nothing moves under
 * reduced motion. The element's own children are the content.
 *
 * Attributes: `mode` (skew | stretch | blur | tilt; skew), `strength` (0.1–3; 1), `max` (the largest skew / tilt in
 * degrees, 1–30; 10).
 */
export interface UsaScrollVelocityElement extends UsaElement {
  readonly amount: number;
}

export function defineScrollVelocity(tag = 'usa-scroll-velocity'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class ScrollVelocity extends Base {
    static get observedAttributes(): string[] { return ['mode', 'strength', 'max']; }
    private _amount = 0;
    get amount(): number { return this._amount; }
    mount(): void {
      const kids = ownChildren(this);
      const root = make('div', 'usa-kit usa-vel');
      const modes: VelocityMode[] = ['skew', 'stretch', 'blur', 'tilt'];
      const mode = (modes.includes(this.str('mode') as VelocityMode) ? this.str('mode') : 'skew') as VelocityMode;
      root.dataset.mode = mode;
      root.append(...kids);
      this.append(root);
      const strength = Math.min(3, Math.max(0.1, this.num('strength', 1)));
      const max = Math.min(30, Math.max(1, this.num('max', 10)));
      let lastY = window.scrollY, value = 0, stop: (() => void) | null = null;
      const paint = (a: number) => {
        this._amount = a;
        root.style.setProperty('--vel', a.toFixed(4));
        root.style.setProperty('--vel-abs', Math.abs(a).toFixed(4));
        root.style.setProperty('--vel-max', `${max}deg`);
      };
      const start = () => {
        if (stop || this.reduced) return;
        lastY = window.scrollY;
        stop = onFrame((_t, dt) => {
          const y = window.scrollY;
          const perFrame = ((y - lastY) / Math.max(1, dt)) * 16.7;
          lastY = y;
          const target = velocityAmount(perFrame, strength);
          // chase the target quickly, decay slowly, so a flick reads as a lean that settles
          const k = Math.abs(target) > Math.abs(value) ? 0.35 : 0.08;
          value += (target - value) * k;
          if (Math.abs(value) < 0.0005 && target === 0) { halt(); return; }
          paint(value);
        }, this);
      };
      // the loop runs only while the page is scrolling and the element is on screen
      let visible = false;
      const halt = () => { stop?.(); stop = null; value = 0; paint(0); };
      this.inView((v) => { visible = v; if (!v) halt(); });
      this.listen(window, 'scroll', () => { if (visible) start(); }, { passive: true });
      this.onCleanup(() => {
        halt();
        this.append(...kids);
        root.remove();
      });
      paint(0);
    }
  }, { id: 'motion-surfaces', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
