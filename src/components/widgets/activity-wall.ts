import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import css from './activity-wall.css?raw';

/** `<mo-activity-wall>` — drifting columns of live-activity cards. Supply direct children with data-column.
 * Pauses on hover, focus, hidden document and offscreen. `paused` is reflected. No duplicate interactive content.
 */
export interface UsaActivityWallElement extends UsaElement {
  paused: boolean;
  play(): void;
  pause(): void;
}
export function defineActivityWall(tag = 'usa-activity-wall'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => {
    class ActivityWall extends Base {
      static get observedAttributes(): string[] { return ['paused', 'speed', 'label']; }
      private _sync?: () => void;
      get paused(): boolean { return this.flag('paused'); }
      set paused(value: boolean) { this.setFlag('paused', value); }
      play(): void { this.paused = false; }
      pause(): void { this.paused = true; }
      changed(): void { this._sync?.(); }
      mount(): void {
        this.classList.add('usa-activity-wall');
        this.setAttribute('role', 'region');
        let visible = typeof IntersectionObserver === 'undefined', hover = false, focus = false;
        const sync = () => {
          this.setAttribute('aria-label', this.str('label', 'Live activity collection'));
          this.style.setProperty('--usa-wall-speed', `${Math.max(1, this.num('speed', 40))}s`);
          this.toggleAttribute('data-wall-animate', visible && !hover && !focus && !this.paused && !document.hidden && !this.reduced);
        };
        this._sync = sync;
        this.inView(v => { visible = v; sync(); });
        this.listen(this, 'mouseenter', () => { hover = true; sync(); });
        this.listen(this, 'mouseleave', () => { hover = false; sync(); });
        this.listen(this, 'focusin', () => { focus = true; sync(); });
        this.listen(this, 'focusout', (event: FocusEvent) => { focus = !!event.relatedTarget && this.contains(event.relatedTarget as Node); sync(); });
        this.listen(document, 'visibilitychange', sync);
        if (typeof matchMedia === 'function') this.listen(matchMedia('(prefers-reduced-motion: reduce)'), 'change', sync);
        this.onCleanup(() => { this._sync = undefined; this.removeAttribute('data-wall-animate'); });
        sync();
      }
    }
    return ActivityWall;
  }, { id: 'activity-wall', text: css });
  defineMoName(tag, ctor); return ctor;
}
