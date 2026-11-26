import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { hostSprings, tick, uid } from './micro-kit-16';
import { dampedAt, pageAfter } from './damped-kit-18';
import css from './damped-kit-18.css?raw';

/**
 * Pages that slide sideways with a damped, physical feel: the track follows the finger, resists like rubber past the
 * first and last page, and a release is carried by its speed to the next page (one page per flick, as on a phone)
 * with a short settle. The dots stretch toward the page they are heading for. Previous / next buttons and the dots are
 * real buttons; the arrow keys, Home and End move between pages, and pages out of view are inert.
 *
 * Content: each direct child is a page. Attributes: `index` (the page shown; 0), `label` (the region's accessible
 * name; Pages), `feel`, `haptics`.
 * Events: `usa:change` ({ index }).
 */
export interface UsaSpringPagerElement extends UsaElement {
  index: number;
  readonly count: number;
  next(): void;
  prev(): void;
}

export function defineSpringPager(tag = 'usa-spring-pager'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, (Base) => class SpringPager extends Base {
    static get observedAttributes(): string[] {
      return ['index', 'label', 'feel', 'haptics'];
    }
    private _index = 0;
    private _seen?: string | null;
    private _source: Node[][] | null = null;
    private _go: ((i: number, user: boolean, velocity?: number) => void) | null = null;
    get index(): number {
      return this._index;
    }
    set index(v: number) {
      if (this._go) this._go(Math.floor(v), false);
      else this._index = Math.max(0, Math.floor(v) || 0);
    }
    get count(): number {
      return this._source?.length ?? 0;
    }
    next(): void {
      this.index = this._index + 1;
    }
    prev(): void {
      this.index = this._index - 1;
    }
    mount(): void {
      if (!this._source) {
        const kids = [...this.children];
        this._source = kids.map((k) => [k.cloneNode(true)]);
        kids.forEach((k) => k.remove());
      }
      const pages = this._source;
      const n = Math.max(1, pages.length);
      const attr = this.getAttribute('index');
      if (attr !== this._seen) {
        this._seen = attr;
        this._index = Math.floor(this.num('index', 0)) || 0;
      }
      this._index = Math.min(n - 1, Math.max(0, this._index));
      const root = make('div', 'usa-dkit usa-dpager');
      root.setAttribute('role', 'region');
      root.setAttribute('aria-roledescription', 'carousel');
      root.setAttribute('aria-label', this.str('label', 'Pages'));
      const view = make('div', 'usa-dpager-view');
      const track = make('div', 'usa-dpager-track');
      const slides = pages.map((nodes, i) => {
        const s = make('div', 'usa-dpager-page');
        s.id = uid('usa-dpager-page');
        s.setAttribute('role', 'group');
        s.setAttribute('aria-roledescription', 'slide');
        s.setAttribute('aria-label', `${i + 1} / ${n}`);
        s.append(...nodes.map((x) => x.cloneNode(true)));
        track.append(s);
        return s;
      });
      view.append(track);
      const bar = make('div', 'usa-dpager-bar');
      const prev = make('button', 'usa-dpager-arrow', '‹');
      prev.type = 'button';
      prev.setAttribute('aria-label', 'Previous page');
      const next = make('button', 'usa-dpager-arrow', '›');
      next.type = 'button';
      next.setAttribute('aria-label', 'Next page');
      const dotsBox = make('div', 'usa-dpager-dots');
      const dots = slides.map((s, i) => {
        const d = make('button', 'usa-dpager-dot');
        d.type = 'button';
        d.setAttribute('aria-label', `Page ${i + 1}`);
        d.setAttribute('aria-controls', s.id);
        d.dataset.index = String(i);
        dotsBox.append(d);
        return d;
      });
      bar.append(prev, dotsBox, next);
      root.append(view, bar);
      this.append(root);

      const dir = typeof getComputedStyle === 'function' && getComputedStyle(this).direction === 'rtl' ? -1 : 1;
      let w = 0;
      const measure = () => (w = view.getBoundingClientRect().width || w || 320);
      measure();
      const group = hostSprings(this, { x: this._index }, (v) => {
        track.style.transform = `translateX(${Math.round(-v.x * w * dir * 10) / 10}px)`;
        dots.forEach((d, i) => {
          const near = Math.max(0, 1 - Math.abs(v.x - i));
          d.style.setProperty('--usa-dpager-near', String(Math.round(near * 1000) / 1000));
        });
      });
      const paint = () => {
        slides.forEach((s, i) => {
          const on = i === this._index;
          s.toggleAttribute('inert', !on);
          s.setAttribute('aria-hidden', String(!on));
        });
        dots.forEach((d, i) => d.setAttribute('aria-current', String(i === this._index)));
        prev.disabled = this._index <= 0;
        next.disabled = this._index >= n - 1;
      };
      const go = (i: number, user: boolean, velocity = 0) => {
        const to = Math.min(n - 1, Math.max(0, i));
        const changed = to !== this._index;
        this._index = to;
        paint();
        group.set({ x: to }, { spring: { duration: 520, bounce: 0.18 }, velocity: velocity ? { x: velocity } : undefined });
        if (changed) {
          if (user) tick(this, 6);
          this.emit('change', { index: to });
        }
      };
      this._go = go;
      paint();
      group.jump({ x: this._index });

      this.listen(prev, 'click', () => go(this._index - 1, true));
      this.listen(next, 'click', () => go(this._index + 1, true));
      this.listen(dotsBox, 'click', (e: MouseEvent) => {
        const d = (e.target as Element).closest?.('.usa-dpager-dot') as HTMLElement | null;
        if (d) go(Number(d.dataset.index), true);
      });
      this.listen(root, 'keydown', (e: KeyboardEvent) => {
        if ((e.target as Element).closest?.('input, textarea, select, [contenteditable]')) return;
        const keys: Record<string, number> = { ArrowRight: this._index + dir, ArrowLeft: this._index - dir, Home: 0, End: n - 1 };
        if (!(e.key in keys)) return;
        e.preventDefault();
        go(keys[e.key], true);
      });

      let drag: { id: number; x0: number; y0: number; from: number; last: number; t: number; v: number; live: boolean } | null = null;
      this.listen(view, 'pointerdown', (e: PointerEvent) => {
        if ((e.pointerType === 'mouse' && e.button !== 0) || (e.target as Element).closest?.('a, button, input, textarea, select, [contenteditable]')) return;
        measure();
        drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, from: group.get('x'), last: e.clientX, t: e.timeStamp, v: 0, live: false };
      });
      this.listen(view, 'pointermove', (e: PointerEvent) => {
        if (!drag || e.pointerId !== drag.id) return;
        const dx = (e.clientX - drag.x0) * dir;
        if (!drag.live) {
          if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(e.clientY - drag.y0)) return;
          drag.live = true;
          root.setAttribute('data-dragging', '');
          try {
            view.setPointerCapture?.(e.pointerId);
          } catch {
            /* synthetic */
          }
        }
        const dt = Math.max(1, e.timeStamp - drag.t);
        drag.v = (-((e.clientX - drag.last) * dir) / dt) * 1000;
        drag.last = e.clientX;
        drag.t = e.timeStamp;
        const raw = drag.from * w - dx;
        group.jump({ x: dampedAt(raw, 0, (n - 1) * w, w) / w });
      });
      const end = (e: PointerEvent) => {
        if (!drag || e.pointerId !== drag.id) return;
        const d = drag;
        drag = null;
        root.removeAttribute('data-dragging');
        if (!d.live) return;
        go(pageAfter(group.get('x') * w, d.v, w, n, Math.round(d.from)), true, d.v / w);
      };
      this.listen(view, 'pointerup', end);
      this.listen(view, 'pointercancel', end);
      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(() => {
          measure();
          if (!group.animating) group.jump({ x: this._index });
        });
        ro.observe(view);
        this.onCleanup(() => ro.disconnect());
      }
      this.onCleanup(() => {
        group.stop();
        root.remove();
        this._go = null;
      });
    }
  }, { id: 'damped-kit-18', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
