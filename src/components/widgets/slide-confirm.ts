import { defineElement, srText, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { hostSprings, tick } from './micro-kit-16';
import { dampedAt } from './damped-kit-18';
import { slideOutcome } from './fling-kit-19';
import css from './fling-kit-19.css?raw';

const NS = 'http://www.w3.org/2000/svg';
const icon = (d: string): SVGSVGElement => {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  const p = document.createElementNS(NS, 'path');
  p.setAttribute('d', d);
  svg.append(p);
  return svg;
};
const ARROW = 'M5 12h13M13 6l6 6-6 6';
const CHECK = 'M5 12.5l4.5 4.5L19 7.5';

/**
 * Slide to confirm: a knob in a track that follows the finger, stretches like rubber past the end, and springs back
 * with a wobble when let go too early. Past `threshold` of the way, or flicked hard enough to get there, it rides to
 * the end and confirms. The prompt shimmers until then. The knob is a real button: Enter or Space confirms (the
 * slide is for pointers), and the outcome is announced.
 *
 * Attributes: `label` (the prompt and the button's name; Slide to confirm), `done` (shown once confirmed;
 * Confirmed), `threshold` (0.05–1 of the way; 0.8), `confirmed` (present when confirmed), `disabled`, `feel`,
 * `haptics`. Size it with `--usa-slide-width` and `--usa-slide-h`.
 * Events: `usa:confirm` ({}), `usa:reset` ({}).
 */
export interface UsaSlideConfirmElement extends UsaElement {
  readonly confirmed: boolean;
  confirm(): void;
  reset(): void;
}

export function defineSlideConfirm(tag = 'usa-slide-confirm'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, (Base) => class SlideConfirm extends Base {
    static get observedAttributes(): string[] {
      return ['label', 'done', 'threshold', 'confirmed', 'disabled', 'feel', 'haptics'];
    }
    private _done = false;
    private _seen?: boolean;
    private _api: { confirm: (v?: number) => void; reset: () => void } | null = null;
    get confirmed(): boolean {
      return this._done;
    }
    confirm(): void {
      if (this._api) this._api.confirm();
      else this._done = true;
    }
    reset(): void {
      if (this._api) this._api.reset();
      else this._done = false;
    }
    mount(): void {
      const attr = this.hasAttribute('confirmed');
      if (attr !== this._seen) {
        this._seen = attr;
        this._done = attr;
      }
      const prompt = this.str('label', 'Slide to confirm');
      const doneText = this.str('done', 'Confirmed');
      const threshold = Math.min(1, Math.max(0.05, this.num('threshold', 0.8)));
      const off = this.flag('disabled');
      const root = make('div', 'usa-fkit usa-slide');
      const fill = make('div', 'usa-slide-fill');
      const text = make('span', 'usa-slide-text');
      text.setAttribute('aria-hidden', 'true');
      const knob = make('button', 'usa-slide-knob');
      knob.type = 'button';
      knob.disabled = off;
      const status = srText('');
      status.setAttribute('role', 'status');
      root.append(fill, text, knob, status);
      this.append(root);

      let max = 0;
      const measure = () => {
        const w = root.clientWidth || 300;
        const k = knob.offsetWidth || 48;
        max = Math.max(1, w - k - 8);
      };
      measure();
      const group = hostSprings(this, { x: this._done ? max : 0 }, (v) => {
        const x = v.x;
        knob.style.transform = `translateX(${Math.round(x * 10) / 10}px)`;
        fill.style.width = `calc(var(--usa-slide-h) + ${Math.round(Math.max(0, x) * 10) / 10}px)`;
        text.style.opacity = this._done ? '1' : String(Math.round(Math.max(0, 1 - (x / max) * 1.4) * 1000) / 1000);
      });
      const paint = () => {
        root.toggleAttribute('data-confirmed', this._done);
        text.textContent = this._done ? doneText : prompt;
        knob.setAttribute('aria-label', this._done ? doneText : prompt);
        knob.setAttribute('aria-disabled', String(this._done || off));
        knob.replaceChildren(icon(this._done ? CHECK : ARROW));
      };
      const confirm = (velocity = 0) => {
        if (this._done || off) return;
        this._done = true;
        measure();
        paint();
        group.set({ x: max }, { spring: { duration: 420, bounce: 0.18 }, velocity: velocity ? { x: velocity } : undefined });
        status.textContent = doneText;
        tick(this, [10, 30, 16]);
        this.emit('confirm', {});
      };
      const reset = () => {
        if (!this._done) return;
        this._done = false;
        paint();
        group.set({ x: 0 }, { spring: { duration: 560, bounce: 0.2 } });
        status.textContent = '';
        this.emit('reset', {});
      };
      this._api = { confirm, reset };
      paint();
      group.jump({ x: this._done ? max : 0 });

      // a click with no pointer behind it (detail 0) is Enter or Space: confirm; pointer clicks are the slide's
      this.listen(knob, 'click', (e: MouseEvent) => {
        if (e.detail === 0) confirm();
      });
      let drag: { id: number; x0: number; from: number; last: number; t: number; v: number } | null = null;
      this.listen(knob, 'pointerdown', (e: PointerEvent) => {
        if ((e.pointerType === 'mouse' && e.button !== 0) || this._done || off) return;
        measure();
        drag = { id: e.pointerId, x0: e.clientX, from: group.get('x'), last: e.clientX, t: e.timeStamp, v: 0 };
        root.setAttribute('data-dragging', '');
        try {
          knob.setPointerCapture?.(e.pointerId);
        } catch {
          /* synthetic */
        }
      });
      this.listen(knob, 'pointermove', (e: PointerEvent) => {
        if (!drag || e.pointerId !== drag.id) return;
        const dt = Math.max(1, e.timeStamp - drag.t);
        drag.v = drag.v * 0.4 + (((e.clientX - drag.last) / dt) * 1000) * 0.6;
        drag.last = e.clientX;
        drag.t = e.timeStamp;
        group.jump({ x: dampedAt(drag.from + e.clientX - drag.x0, 0, max, max * 0.5) });
      });
      const end = (e: PointerEvent) => {
        if (!drag || e.pointerId !== drag.id) return;
        const d = drag;
        drag = null;
        root.removeAttribute('data-dragging');
        const x = group.get('x');
        if (e.type === 'pointerup' && slideOutcome(x, d.v, max, threshold)) confirm(d.v);
        else group.set({ x: 0 }, { spring: { duration: 560, bounce: 0.38 }, velocity: { x: d.v } });
      };
      this.listen(knob, 'pointerup', end);
      this.listen(knob, 'pointercancel', end);
      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(() => {
          measure();
          if (!group.animating && !drag) group.jump({ x: this._done ? max : 0 });
        });
        ro.observe(root);
        this.onCleanup(() => ro.disconnect());
      }
      this.onCleanup(() => {
        group.stop();
        root.remove();
        this._api = null;
      });
    }
  }, { id: 'fling-kit-19', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
