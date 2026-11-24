import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { cleanColor, ownChildren } from './kit';
import css from './motion-kit.css?raw';

/**
 * A card whose border carries a travelling beam of light: a short bright arc that runs around the edge, fading from one
 * color into another, with an optional soft glow under it. Built from a masked conic gradient and a registered custom
 * property, so it costs no script per frame; it pauses off screen. Browsers without `@property` show a still gradient
 * border, and so does reduced motion.
 *
 * Attributes: `duration` (seconds per lap; 1–60; 6), `colors` (two comma-separated colors), `length` (degrees of the
 * beam; 20–300; 70), `width` (border px; 1–8; 2), `radius` (px; 18), `glow`, `reverse`.
 */
export interface UsaBorderBeamElement extends UsaElement {}

export function defineBorderBeam(tag = 'usa-border-beam'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class BorderBeam extends Base {
    static get observedAttributes(): string[] { return ['duration', 'colors', 'length', 'width', 'radius', 'glow', 'reverse']; }
    mount(): void {
      const kids = ownChildren(this);
      const root = make('div', 'usa-kit usa-beam');
      root.append(...kids);
      this.append(root);
      const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
      root.style.setProperty('--dur', `${clamp(this.num('duration', 6), 1, 60)}s`);
      root.style.setProperty('--len', `${clamp(this.num('length', 70), 20, 300)}deg`);
      root.style.setProperty('--bw', `${clamp(this.num('width', 2), 1, 8)}px`);
      root.style.setProperty('--radius', `${clamp(this.num('radius', 18), 0, 200)}px`);
      if (this.flag('reverse')) root.style.setProperty('--dir', 'reverse');
      const [c1, c2] = this.str('colors').split(',').map((s) => cleanColor(s));
      if (c1) root.style.setProperty('--c1', c1);
      if (c2) root.style.setProperty('--c2', c2);
      root.toggleAttribute('data-glow', this.flag('glow'));
      const animated = typeof CSS !== 'undefined' && 'registerProperty' in CSS;
      root.toggleAttribute('data-static', this.reduced || !animated);
      this.inView((v) => root.toggleAttribute('data-paused', !v));
      this.onCleanup(() => {
        this.append(...kids);
        root.remove();
      });
    }
  }, { id: 'motion-kit', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
