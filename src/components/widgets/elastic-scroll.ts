import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { hostSprings, tick } from './micro-kit-16';
import { rubberBand } from '../physics/spring';
import css from './damped-kit-18.css?raw';

const IOS = (): boolean =>
  typeof navigator !== 'undefined' && (/iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

/**
 * A scroll area whose ends stretch like rubber: scrolling or dragging past the top or bottom pulls the content a
 * little further with growing resistance, and it springs back with a damped settle when let go, on every platform
 * (iOS already does this natively, so there it is left to the system). Scrolling itself stays native: the wheel,
 * touch, the keyboard and scroll anchoring all work as usual, and the area is a focusable, labelled region.
 *
 * Content: the element's children scroll. Attributes: `height` (CSS length of the area; 320px), `label` (accessible
 * name; Scrollable content), `feel`, `haptics`.
 * Events: `usa:edge` ({ edge: 'top' | 'bottom' }) when a pull past an end goes further than 56 px.
 */
export interface UsaElasticScrollElement extends UsaElement {
  /** The scrolling box, for scrollTo() and scroll events. */
  readonly scroller: HTMLElement | null;
}

export function defineElasticScroll(tag = 'usa-elastic-scroll'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, (Base) => class ElasticScroll extends Base {
    static get observedAttributes(): string[] {
      return ['height', 'label', 'feel', 'haptics'];
    }
    private _source: Node[] | null = null;
    private _scroller: HTMLElement | null = null;
    get scroller(): HTMLElement | null {
      return this._scroller;
    }
    mount(): void {
      if (!this._source) {
        this._source = [...this.childNodes];
        this._source.forEach((n) => n.parentNode === this && this.removeChild(n));
      }
      const root = make('div', 'usa-dkit usa-escroll');
      const box = make('div', 'usa-escroll-box');
      box.tabIndex = 0;
      box.setAttribute('role', 'region');
      box.setAttribute('aria-label', this.str('label', 'Scrollable content'));
      const height = this.str('height');
      if (height) box.style.height = height;
      const content = make('div', 'usa-escroll-content');
      content.append(...this._source.map((n) => n.cloneNode(true)));
      box.append(content);
      root.append(box);
      this.append(root);
      this._scroller = box;

      let h = 0;
      const measure = () => (h = box.clientHeight || h || 320);
      measure();
      let fired = false;
      const group = hostSprings(this, { o: 0 }, (v) => {
        const shift = rubberBand(v.o, h, 0.55);
        content.style.transform = Math.abs(shift) < 0.05 ? '' : `translateY(${Math.round(shift * 10) / 10}px)`;
        root.toggleAttribute('data-stretched', Math.abs(shift) >= 0.05);
      });
      const back = { duration: 560, bounce: 0 };
      const edgeOf = (o: number): 'top' | 'bottom' => (o > 0 ? 'top' : 'bottom');
      const maybeFire = (o: number) => {
        if (fired || Math.abs(rubberBand(o, h, 0.55)) < 56) return;
        fired = true;
        tick(this, 10);
        this.emit('edge', { edge: edgeOf(o) });
      };
      const atTop = () => box.scrollTop <= 0;
      const atBottom = () => box.scrollTop + box.clientHeight >= box.scrollHeight - 1;

      // wheel / trackpad: a push past an end becomes velocity that the spring absorbs and returns
      this.listen(box, 'wheel', (e: WheelEvent) => {
        if (e.ctrlKey || e.deltaX * e.deltaX > e.deltaY * e.deltaY) return;
        const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * h : e.deltaY;
        if (!((dy < 0 && atTop()) || (dy > 0 && atBottom()))) return;
        measure();
        if (!group.animating) fired = false;
        const vel = Math.max(-2600, Math.min(2600, group.velocity('o') - dy * 9));
        group.set({ o: 0 }, { spring: back, velocity: { o: vel } });
        maybeFire(group.get('o') + vel * 0.12);
      }, { passive: true });

      // touch (not on iOS, which bounces natively): follow the finger past an end, then spring back
      let touch: { y: number; pull: number; t: number; v: number } | null = null;
      this.listen(box, 'touchstart', (e: TouchEvent) => {
        if (e.touches.length !== 1 || IOS()) return;
        measure();
        fired = false;
        touch = { y: e.touches[0].clientY, pull: 0, t: e.timeStamp, v: 0 };
      }, { passive: true });
      this.listen(box, 'touchmove', (e: TouchEvent) => {
        if (!touch || e.touches.length !== 1) return;
        const y = e.touches[0].clientY;
        const d = y - touch.y;
        const dt = Math.max(1, e.timeStamp - touch.t);
        touch.v = (d / dt) * 1000;
        touch.y = y;
        touch.t = e.timeStamp;
        if (touch.pull > 0 || (d > 0 && atTop())) touch.pull = Math.max(0, touch.pull + d);
        else if (touch.pull < 0 || (d < 0 && atBottom())) touch.pull = Math.min(0, touch.pull + d);
        else return;
        group.jump({ o: touch.pull });
        maybeFire(touch.pull);
      }, { passive: true });
      const release = () => {
        if (!touch) return;
        const t = touch;
        touch = null;
        if (t.pull) group.set({ o: 0 }, { spring: back, velocity: { o: t.v } });
      };
      this.listen(box, 'touchend', release);
      this.listen(box, 'touchcancel', release);
      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(() => measure());
        ro.observe(box);
        this.onCleanup(() => ro.disconnect());
      }
      this.onCleanup(() => {
        group.stop();
        root.remove();
        this._scroller = null;
      });
    }
  }, { id: 'damped-kit-18', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
