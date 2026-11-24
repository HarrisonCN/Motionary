import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { dataNum, ownChildren } from './kit';
import { seeded } from './kit-12';
import css from './ui-kit-12.css?raw';

/** The font size (px) for a tag of `weight` (1–10) between `min` and `max` px, on a gentle square-root curve. */
export function tagSize(weight: number, min = 14, max = 40): number {
  const w = Math.min(10, Math.max(1, Number.isFinite(weight) ? weight : 1));
  const lo = Math.min(min, max), hi = Math.max(min, max);
  return Math.round(lo + (hi - lo) * Math.sqrt((w - 1) / 9));
}

/**
 * A word cloud from the children (links, buttons or plain spans). Each child's `data-weight` (1–10) sets its size;
 * heavier tags are drawn bolder. The tags rise in one after another when the cloud first scrolls into view and then bob
 * very slightly, each on its own beat; hovering or focusing one lifts it and dims the rest. The children stay where they
 * are in the reading order. Under reduced motion they are simply shown.
 *
 * Attributes: `min-size` (px; 14), `max-size` (px; 40), `still` (no bobbing), `label` (Tags).
 */
export interface UsaTagCloudElement extends UsaElement {}

export function defineTagCloud(tag = 'usa-tag-cloud'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class TagCloud extends Base {
    static get observedAttributes(): string[] { return ['min-size', 'max-size', 'still', 'label']; }
    mount(): void {
      const kids = ownChildren(this);
      const root = make('div', 'usa-kit usa-tags');
      root.setAttribute('role', 'group');
      root.setAttribute('aria-label', this.str('label', 'Tags'));
      const min = this.num('min-size', 14), max = this.num('max-size', 40);
      const wraps = kids.map((k, i) => {
        const w = dataNum(k, 'weight', 3);
        const span = make('span', 'usa-tags-item');
        span.style.setProperty('--size', `${tagSize(w, min, max)}px`);
        span.style.setProperty('--weight', String(Math.round(400 + Math.min(10, Math.max(1, w)) * 40)));
        span.style.setProperty('--i', String(i));
        span.style.setProperty('--beat', `${(2.6 + seeded(i, 7) * 2.4).toFixed(2)}s`);
        span.style.setProperty('--lift', `${(2 + seeded(i, 3) * 4).toFixed(1)}px`);
        span.append(k);
        root.append(span);
        return span;
      });
      root.toggleAttribute('data-still', this.flag('still'));
      root.toggleAttribute('data-static', this.reduced);
      this.append(root);
      let shown = false;
      this.inView((v) => {
        root.toggleAttribute('data-paused', !v);
        if (v && !shown) { shown = true; root.setAttribute('data-in', ''); }
      });
      this.onCleanup(() => {
        for (const w of wraps) this.append(...Array.from(w.childNodes));
        root.remove();
      });
    }
  }, { id: 'ui-kit-12', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
