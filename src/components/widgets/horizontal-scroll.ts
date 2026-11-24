import { caf, defineElement, raf, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { ownChildren } from './kit';
import css from './motion-surfaces.css?raw';

/** The track's x offset (px, ≤ 0) for a section `progress` (0–1) through, given the overflow width. */
export function trackOffset(progress: number, overflow: number): number {
  const p = Math.min(1, Math.max(0, progress));
  return -p * Math.max(0, overflow);
}

/**
 * A section that turns vertical scrolling into sideways movement: while it passes, its panels slide left across a
 * pinned frame, and a thin bar shows how far along you are. The section is as tall as the sideways distance needs.
 * Each element child is one panel. When a panel's link or button gets keyboard focus, the page scrolls so that panel
 * is in view. Under reduced motion, without `position: sticky`, or below `min-width` px wide, it falls back to a
 * plain horizontal scroller with snap points.
 *
 * Attributes: `panel-width` (CSS width of a panel; 80vw), `gap` (px; 24), `progress` (show the bar; on unless
 * "false"), `min-width` (px; 640), `label` (Gallery).
 * Event `usa:change` ({ index }).
 */
export interface UsaHorizontalScrollElement extends UsaElement {
  readonly index: number;
}

export function defineHorizontalScroll(tag = 'usa-horizontal-scroll'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class HorizontalScroll extends Base {
    static get observedAttributes(): string[] { return ['panel-width', 'gap', 'progress', 'min-width', 'label']; }
    private _index = 0;
    get index(): number { return this._index; }
    mount(): void {
      const kids = ownChildren(this);
      const root = make('section', 'usa-kit usa-hscroll');
      root.setAttribute('aria-label', this.str('label', 'Gallery'));
      const pin = make('div', 'usa-hscroll-pin');
      const track = make('div', 'usa-hscroll-track');
      const panels = kids.map((k) => { const p = make('div', 'usa-hscroll-panel'); p.append(k); track.append(p); return p; });
      const bar = make('div', 'usa-hscroll-bar');
      bar.setAttribute('aria-hidden', 'true');
      bar.hidden = this.str('progress') === 'false';
      pin.append(track, bar);
      root.append(pin);
      root.style.setProperty('--panel', this.str('panel-width', '80vw'));
      root.style.setProperty('--gap', `${Math.max(0, this.num('gap', 24))}px`);
      this.append(root);
      const minWidth = Math.max(0, this.num('min-width', 640));
      let overflow = 0, pending = 0, pinned = false;
      const layout = () => {
        const sticky = typeof CSS === 'undefined' || !CSS.supports || CSS.supports('position', 'sticky');
        pinned = !this.reduced && sticky && window.innerWidth >= minWidth;
        root.toggleAttribute('data-pinned', pinned);
        if (!pinned) { root.style.height = ''; track.style.transform = ''; return; }
        overflow = Math.max(0, track.scrollWidth - pin.clientWidth);
        root.style.height = `${window.innerHeight + overflow}px`;
        update();
      };
      const update = () => {
        pending = 0;
        if (!pinned) return;
        const r = root.getBoundingClientRect();
        const total = Math.max(1, r.height - window.innerHeight);
        const p = Math.min(1, Math.max(0, -r.top / total));
        track.style.transform = `translate3d(${trackOffset(p, overflow).toFixed(1)}px, 0, 0)`;
        bar.style.setProperty('--p', p.toFixed(4));
        const index = Math.round(p * Math.max(0, panels.length - 1));
        if (index !== this._index) { this._index = index; this.emit('change', { index }); }
      };
      const queue = () => { if (!pending) pending = raf(update); };
      this.listen(window, 'scroll', queue, { passive: true });
      this.listen(window, 'resize', layout, { passive: true });
      // keyboard users: bring the focused panel into the pinned frame by scrolling the page to its position
      this.listen(track, 'focusin', (e: FocusEvent) => {
        if (!pinned) return;
        const i = panels.findIndex((p) => p.contains(e.target as Node));
        if (i < 0) return;
        const want = Math.min(overflow, Math.max(0, panels[i].offsetLeft - (pin.clientWidth - panels[i].offsetWidth) / 2));
        const total = Math.max(1, root.offsetHeight - window.innerHeight);
        const top = root.getBoundingClientRect().top + window.scrollY + (overflow ? (want / overflow) * total : 0);
        pin.scrollLeft = 0;
        window.scrollTo({ top, behavior: 'auto' });
      });
      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(() => layout());
        ro.observe(track);
        this.onCleanup(() => ro.disconnect());
      }
      this.onCleanup(() => {
        if (pending) caf(pending);
        this.append(...kids);
        root.remove();
        this._index = 0;
      });
      layout();
    }
  }, { id: 'motion-surfaces', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
