import { caf, defineElement, raf, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { ownChildren } from './kit';
import css from './page-kit.css?raw';

/** How far (0–1) a block whose top is at `top` and height `height` has risen into a viewport `vh` tall. */
export function riseProgress(top: number, height: number, vh: number): number {
  if (!(height > 0) || !(vh > 0)) return 1;
  const p = (vh - top) / Math.min(height, vh);
  return Math.min(1, Math.max(0, p));
}

/**
 * A footer that is uncovered rather than scrolled in: as it rises into view its content slides up from beneath the page
 * above, grows to full size and loses a soft shadow, like a drawer under the last section. The children stay in normal
 * flow inside a `footer` (or `role="contentinfo"` is left to the page when `landmark="false"`), so links and focus order
 * are untouched. Under reduced motion it is a plain footer.
 *
 * Attributes: `shift` (percent of its height the content starts below; 0–100; 50), `landmark` (on unless "false").
 * Event `usa:reveal` once it is fully in view.
 */
export interface UsaRevealFooterElement extends UsaElement {
  readonly progress: number;
}

export function defineRevealFooter(tag = 'usa-reveal-footer'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class RevealFooter extends Base {
    static get observedAttributes(): string[] { return ['shift', 'landmark']; }
    private _p = 1;
    get progress(): number { return this._p; }
    mount(): void {
      const kids = ownChildren(this);
      const root = make(this.str('landmark') === 'false' ? 'div' : 'footer', 'usa-kit usa-rfoot');
      const inner = make('div', 'usa-rfoot-inner');
      inner.append(...kids);
      root.append(inner);
      this.append(root);
      root.style.setProperty('--shift', `${Math.min(100, Math.max(0, this.num('shift', 50)))}%`);
      let pending = 0, told = false, active = false;
      const update = () => {
        pending = 0;
        const r = root.getBoundingClientRect();
        const p = this.reduced ? 1 : riseProgress(r.top, r.height, window.innerHeight);
        this._p = p;
        root.style.setProperty('--p', p.toFixed(4));
        if (p >= 1 && !told) { told = true; this.emit('reveal'); }
        if (p < 0.98) told = false;
      };
      const queue = () => { if (active && !pending) pending = raf(update, this); };
      this.inView((v) => { active = v; if (v) queue(); }, { rootMargin: '20% 0px' });
      this.listen(window, 'scroll', queue, { passive: true });
      this.listen(window, 'resize', queue, { passive: true });
      this.onCleanup(() => {
        if (pending) caf(pending);
        this.append(...kids);
        root.remove();
        this._p = 1;
      });
      update();
    }
  }, { id: 'page-kit', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
