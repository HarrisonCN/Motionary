import { defineElement, onFrame, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { tick } from './micro-kit-16';
import { cruise, wrapOffset } from './fling-kit-19';
import css from './fling-kit-19.css?raw';

const NS = 'http://www.w3.org/2000/svg';
const glyph = (paused: boolean): SVGSVGElement => {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 14 14');
  svg.setAttribute('aria-hidden', 'true');
  const p = document.createElementNS(NS, 'path');
  p.setAttribute('d', paused ? 'M3 1.5v11l9-5.5z' : 'M2.5 1.5h3.2v11H2.5zM8.3 1.5h3.2v11H8.3z');
  svg.append(p);
  return svg;
};

/**
 * A marquee you can grab: it drifts at a cruise speed, follows the finger when dragged, keeps a flick's momentum and
 * then eases back to its cruise speed on a damped curve, wrapping around without a seam. It slows to a stop under the
 * pointer and while focus is inside, and a pause button stops it for good. The arrow keys give it a push. Under
 * reduced motion it does not move and becomes a plain horizontal scroller.
 *
 * Content: the items (each direct child). Attributes: `speed` (cruise speed in px/s, negative for the other way;
 * 40), `gap` (px between items; 24), `paused` (present to start paused), `label` (the region's accessible name;
 * Scrolling list), `haptics`.
 * Events: `usa:pause` ({ paused }).
 */
export interface UsaFlingMarqueeElement extends UsaElement {
  paused: boolean;
  /** Push the marquee with a speed in px/s (positive moves the items toward the start). */
  fling(velocity: number): void;
}

export function defineFlingMarquee(tag = 'usa-fling-marquee'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, (Base) => class FlingMarquee extends Base {
    static get observedAttributes(): string[] {
      return ['speed', 'gap', 'paused', 'label', 'haptics'];
    }
    private _paused = false;
    private _seen?: boolean;
    private _source: Node[] | null = null;
    private _api: { pause: (on: boolean, user: boolean) => void; fling: (v: number) => void } | null = null;
    get paused(): boolean {
      return this._paused;
    }
    set paused(v: boolean) {
      if (this._api) this._api.pause(!!v, false);
      else this._paused = !!v;
    }
    fling(velocity: number): void {
      this._api?.fling(velocity);
    }
    mount(): void {
      if (!this._source) {
        this._source = [...this.childNodes].filter((n) => n.nodeType === 1 || (n.nodeType === 3 && n.textContent?.trim()));
        [...this.childNodes].forEach((n) => this.removeChild(n));
      }
      const attr = this.hasAttribute('paused');
      if (attr !== this._seen) {
        this._seen = attr;
        this._paused = attr;
      }
      const speed = Math.min(2000, Math.max(-2000, this.num('speed', 40)));
      const gap = Math.max(0, this.num('gap', 24));
      const still = this.reduced;
      const root = make('div', 'usa-fkit usa-fmq');
      root.style.setProperty('--usa-fmq-gap', `${gap}px`);
      root.toggleAttribute('data-static', still);
      const view = make('div', 'usa-fmq-view');
      view.tabIndex = 0;
      view.setAttribute('role', 'region');
      view.setAttribute('aria-label', this.str('label', 'Scrolling list'));
      const track = make('div', 'usa-fmq-track');
      const run = make('div', 'usa-fmq-run');
      run.append(...this._source.map((n) => n.cloneNode(true)));
      track.append(run);
      view.append(track);
      const toggle = make('button', 'usa-fmq-toggle');
      toggle.type = 'button';
      root.append(view);
      if (!still) root.append(toggle);
      this.append(root);
      if (still) {
        this._api = { pause: (on) => (this._paused = on), fling: () => {} };
        this.onCleanup(() => {
          root.remove();
          this._api = null;
        });
        return;
      }

      // copies fill the view so the loop never shows a gap; they are hidden from assistive tech and from Tab
      let period = 0;
      const fill = () => {
        period = run.offsetWidth || 0;
        const need = period > 0 ? Math.max(1, Math.ceil((view.clientWidth || 0) / period) + 1) : 1;
        while (track.children.length - 1 < need) {
          const copy = run.cloneNode(true) as HTMLElement;
          copy.setAttribute('aria-hidden', 'true');
          copy.setAttribute('inert', '');
          track.append(copy);
        }
      };
      fill();
      const paint = () => {
        toggle.setAttribute('aria-label', this._paused ? 'Play' : 'Pause');
        toggle.setAttribute('aria-pressed', String(this._paused));
        toggle.replaceChildren(glyph(this._paused));
      };
      paint();
      let x = 0;
      let v = this._paused ? 0 : speed;
      let hover = false;
      let focus = false;
      let drag: { id: number; x0: number; from: number; last: number; t: number; v: number; live: boolean } | null = null;
      const place = () => {
        x = wrapOffset(x, period || 1);
        track.style.transform = `translateX(${Math.round(-x * 10) / 10}px)`;
      };
      const frame = (_t: number, dt: number) => {
        if (drag) return;
        const target = this._paused || hover || focus ? 0 : speed;
        // a fling decays toward the cruise speed (or rest) with a longer time constant than a plain slow-down
        v = cruise(v, target, dt, Math.abs(v) > Math.abs(speed) * 1.5 ? 900 : 520);
        x += (v * Math.min(64, dt)) / 1000;
        place();
      };
      let stop: (() => void) | null = null;
      const loop = (on: boolean) => {
        if (on && !stop) stop = onFrame(frame, this);
        else if (!on && stop) {
          stop();
          stop = null;
        }
      };
      this.inView((visible) => loop(visible));
      const pause = (on: boolean, user: boolean) => {
        if (on === this._paused) return;
        this._paused = on;
        paint();
        if (user) tick(this, 6);
        this.emit('pause', { paused: on });
      };
      this._api = { pause, fling: (vel: number) => (v = Math.max(-4000, Math.min(4000, v + (Number(vel) || 0)))) };
      this.listen(toggle, 'click', () => pause(!this._paused, true));
      this.listen(view, 'keydown', (e: KeyboardEvent) => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.preventDefault();
        const dir = getComputedStyle(this).direction === 'rtl' ? -1 : 1;
        v = Math.max(-4000, Math.min(4000, v + (e.key === 'ArrowRight' ? 700 : -700) * dir));
      });
      this.listen(root, 'pointerenter', (e: PointerEvent) => {
        if (e.pointerType === 'mouse') hover = true;
      });
      this.listen(root, 'pointerleave', () => (hover = false));
      this.listen(root, 'focusin', () => (focus = true));
      this.listen(root, 'focusout', (e: FocusEvent) => {
        if (!root.contains(e.relatedTarget as Node)) focus = false;
      });
      this.listen(view, 'pointerdown', (e: PointerEvent) => {
        if ((e.pointerType === 'mouse' && e.button !== 0) || (e.target as Element).closest?.('a, button, input, textarea, select, [contenteditable]')) return;
        drag = { id: e.pointerId, x0: e.clientX, from: x, last: e.clientX, t: e.timeStamp, v: 0, live: false };
      });
      this.listen(view, 'pointermove', (e: PointerEvent) => {
        if (!drag || e.pointerId !== drag.id) return;
        if (!drag.live) {
          if (Math.abs(e.clientX - drag.x0) < 5) return;
          drag.live = true;
          root.setAttribute('data-dragging', '');
          try {
            view.setPointerCapture?.(e.pointerId);
          } catch {
            /* synthetic */
          }
        }
        const dt = Math.max(1, e.timeStamp - drag.t);
        drag.v = drag.v * 0.35 + (-((e.clientX - drag.last) / dt) * 1000) * 0.65;
        drag.last = e.clientX;
        drag.t = e.timeStamp;
        x = drag.from - (e.clientX - drag.x0);
        place();
      });
      const end = (e: PointerEvent) => {
        if (!drag || e.pointerId !== drag.id) return;
        const d = drag;
        drag = null;
        root.removeAttribute('data-dragging');
        if (d.live) v = Math.max(-4000, Math.min(4000, d.v));
      };
      this.listen(view, 'pointerup', end);
      this.listen(view, 'pointercancel', end);
      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(() => {
          fill();
          place();
        });
        ro.observe(view);
        ro.observe(run);
        this.onCleanup(() => ro.disconnect());
      }
      this.onCleanup(() => {
        loop(false);
        root.remove();
        this._api = null;
      });
    }
  }, { id: 'fling-kit-19', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
