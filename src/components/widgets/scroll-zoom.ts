import { caf, defineElement, raf, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { ownChildren } from './kit';
import css from './motion-kit.css?raw';

/** Scale, corner radius (px) and caption opacity at scroll `progress` (0–1), growing from `from` to full size by 0.7. */
export function zoomAt(progress: number, from = 0.45, radius = 28): { scale: number; radius: number; caption: number } {
  const p = Math.min(1, Math.max(0, progress));
  const t = Math.min(1, p / 0.7);
  const e = 1 - Math.pow(1 - t, 3);
  const f = Math.min(1, Math.max(0.05, from));
  return { scale: Math.round((f + (1 - f) * e) * 10000) / 10000, radius: Math.round(radius * (1 - e) * 100) / 100, caption: Math.round(Math.max(0, (p - 0.7) / 0.3) * 1000) / 1000 };
}

/**
 * A picture or video that starts as a small rounded card and grows to fill the screen as you scroll through the section,
 * then lets a caption rise over it. The first element child is the media; any further children form the caption. The
 * section is pinned with `position: sticky` for `length` of scrolling. Under reduced motion, below `min-width` px wide or
 * without sticky support it is the media at full width with the caption under it.
 *
 * Attributes: `from` (starting scale; 0.05–1; 0.45), `radius` (starting corner radius px; 28), `length` (CSS length of
 * the scroll; 250vh), `min-width` (px; 640), `label`.
 * Event `usa:progress` ({ progress }) at 0, 0.25, 0.5, 0.75 and 1.
 */
export interface UsaScrollZoomElement extends UsaElement {
  readonly progress: number;
}

export function defineScrollZoom(tag = 'usa-scroll-zoom'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class ScrollZoom extends Base {
    static get observedAttributes(): string[] { return ['from', 'radius', 'length', 'min-width', 'label']; }
    private _p = 0;
    get progress(): number { return this._p; }
    mount(): void {
      const kids = ownChildren(this);
      if (!kids.length) return;
      const root = make('section', 'usa-kit usa-szoom');
      const label = this.str('label');
      if (label) root.setAttribute('aria-label', label);
      const pin = make('div', 'usa-szoom-pin');
      const media = make('div', 'usa-szoom-media');
      media.append(kids[0]);
      pin.append(media);
      if (kids.length > 1) { const cap = make('div', 'usa-szoom-caption'); cap.append(...kids.slice(1)); pin.append(cap); }
      root.append(pin);
      root.style.setProperty('--len', this.str('length', '250vh'));
      this.append(root);
      const from = this.num('from', 0.45), radius = Math.max(0, this.num('radius', 28)), minW = Math.max(0, this.num('min-width', 640));
      let pinned = false, pending = 0, quarter = -1;
      const update = () => {
        pending = 0;
        if (!pinned) return;
        const r = root.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - window.innerHeight)));
        this._p = p;
        const z = zoomAt(p, from, radius);
        media.style.setProperty('--s', String(z.scale));
        media.style.setProperty('--r', `${z.radius / Math.max(0.05, z.scale)}px`);
        root.style.setProperty('--c', String(z.caption));
        const q = Math.floor(p * 4 + 1e-6);
        if (q !== quarter) { quarter = q; this.emit('progress', { progress: q / 4 }); }
      };
      const layout = () => {
        const sticky = typeof CSS === 'undefined' || !CSS.supports || CSS.supports('position', 'sticky');
        pinned = !this.reduced && sticky && window.innerWidth >= minW;
        root.toggleAttribute('data-pinned', pinned);
        if (!pinned) { media.style.removeProperty('--s'); media.style.removeProperty('--r'); root.style.removeProperty('--c'); this._p = 1; return; }
        update();
      };
      const queue = () => { if (pinned && !pending) pending = raf(update, this); };
      this.listen(window, 'scroll', queue, { passive: true });
      this.listen(window, 'resize', layout, { passive: true });
      this.onCleanup(() => {
        if (pending) caf(pending);
        this.append(...kids);
        root.remove();
        this._p = 0;
      });
      layout();
    }
  }, { id: 'motion-kit', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
