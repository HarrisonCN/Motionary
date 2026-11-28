import { defineElement, onFrame, srText, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { hostSprings, tick } from './micro-kit-16';
import { pendulumStep, swingImpulse, pendulumAtRest } from './snap-kit-20';
import css from './snap-kit-20.css?raw';

/**
 * A sign hanging from a nail on two strings, like the "open / closed" card on a shop door: it swings as a real
 * pendulum does, slowing down over a few swings. Grab it and drag it sideways, then let go and it swings back with
 * the speed you gave it; a mouse brushing past nudges it. A click (or Enter / Space) turns it over to the back face
 * with a flip and a small swing. Under reduced motion it hangs still and turns over at once.
 *
 * Content: the child with `data-back` is the back face; the rest is the front. Attributes: `flipped` (start on the
 * back), `length` (px of string; 60), `label` (the sign's name; Sign), `feel`, `haptics`. Width:
 * `--usa-swing-width`. Events: `usa:flip` ({ flipped }). Methods: `swing(force)` gives it a push (1 = a firm one;
 * negative to the left).
 */
export interface UsaSwingSignElement extends UsaElement {
  flipped: boolean;
  swing(force?: number): void;
}

export function defineSwingSign(tag = 'usa-swing-sign'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, (Base) => class SwingSign extends Base {
    static get observedAttributes(): string[] {
      return ['flipped', 'length', 'label', 'feel', 'haptics'];
    }
    private _flipped = false;
    private _seen?: string | null;
    private _source: { front: Node[]; back: Node[] } | null = null;
    private _api: { flip: (to: boolean, user: boolean) => void; push: (v: number) => void } | null = null;
    get flipped(): boolean {
      return this._flipped;
    }
    set flipped(v: boolean) {
      if (this._api) this._api.flip(!!v, false);
      else this._flipped = !!v;
    }
    swing(force = 1): void {
      this._api?.push(3 * (Number(force) || 0));
    }
    mount(): void {
      if (!this._source) {
        const nodes = [...this.childNodes];
        const isBack = (x: Node) => x.nodeType === 1 && (x as Element).hasAttribute('data-back');
        this._source = { front: nodes.filter((x) => !isBack(x)), back: nodes.filter(isBack) };
        nodes.forEach((x) => x.parentNode === this && this.removeChild(x));
      }
      const attr = this.getAttribute('flipped');
      if (attr !== this._seen) {
        this._seen = attr;
        this._flipped = this.flag('flipped');
      }
      const length = Math.min(240, Math.max(20, this.num('length', 60)));
      const name = this.str('label', 'Sign');

      const root = make('div', 'usa-snkit usa-swing');
      root.style.setProperty('--usa-swing-length', `${length}px`);
      const nail = make('div', 'usa-swing-nail');
      nail.setAttribute('aria-hidden', 'true');
      const rig = make('div', 'usa-swing-rig');
      const ns = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('aria-hidden', 'true');
      for (const x of ['24%', '76%']) {
        const line = document.createElementNS(ns, 'line');
        line.setAttribute('x1', '50%');
        line.setAttribute('y1', '0');
        line.setAttribute('x2', x);
        line.setAttribute('y2', '100%');
        svg.append(line);
      }
      const card = make('div', 'usa-swing-card');
      card.setAttribute('role', 'button');
      card.tabIndex = 0;
      card.setAttribute('aria-label', name);
      card.setAttribute('aria-roledescription', 'sign');
      const front = make('div', 'usa-swing-face');
      front.append(...this._source.front.map((x) => x.cloneNode(true)));
      const back = make('div', 'usa-swing-face usa-swing-back');
      back.append(
        ...this._source.back.map((x) => {
          const c = x.cloneNode(true) as Element;
          c.removeAttribute('data-back');
          return c;
        }),
      );
      card.append(front, back);
      rig.append(svg, card);
      const status = srText('');
      status.setAttribute('role', 'status');
      root.append(nail, rig, status);
      this.append(root);

      // the pendulum: angle in radians, positive when the sign hangs to the right of the nail
      const arm = () => length + (card.offsetHeight || 120) / 2;
      let angle = 0;
      let speed = 0;
      let flipDeg = this._flipped ? 180 : 0;
      const draw = () => {
        rig.style.transform = `rotate(${Math.round(-angle * 10000) / 10000}rad)`;
        card.style.transform = `rotateY(${Math.round(flipDeg * 10) / 10}deg)`;
      };
      let visible = true;
      let stop: (() => void) | undefined;
      let held = false;
      const rest = () => {
        stop?.();
        stop = undefined;
      };
      const run = () => {
        if (stop || this.reduced || !visible || held) return;
        stop = onFrame((_t, dt) => {
          const next = pendulumStep(angle, speed, dt, arm());
          angle = next.angle;
          speed = next.velocity;
          if (pendulumAtRest(angle, speed)) {
            angle = 0;
            speed = 0;
            rest();
          }
          draw();
        }, this);
      };
      const push = (v: number) => {
        if (this.reduced || !Number.isFinite(v)) return;
        speed = Math.max(-9, Math.min(9, speed + v));
        run();
      };
      this.inView((v) => {
        visible = v;
        if (!v) rest();
        else if (!pendulumAtRest(angle, speed)) run();
      });

      const flipGroup = hostSprings(this, { f: flipDeg }, (v) => {
        flipDeg = v.f;
        draw();
      });
      const paint = () => {
        card.setAttribute('aria-pressed', String(this._flipped));
        front.setAttribute('aria-hidden', String(this._flipped));
        back.setAttribute('aria-hidden', String(!this._flipped));
        root.toggleAttribute('data-flipped', this._flipped);
      };
      const flip = (to: boolean, user: boolean) => {
        if (to === this._flipped) return;
        this._flipped = to;
        paint();
        flipGroup.set({ f: to ? 180 : 0 }, { spring: { duration: 680, bounce: 0.22 } });
        // turning over a hanging card sets it swinging a little
        push(to ? 1.6 : -1.6);
        const face = (to ? back : front).textContent?.trim().replace(/\s+/g, ' ') || (to ? 'Back' : 'Front');
        status.textContent = face.slice(0, 120);
        if (user) tick(this, 10);
        this.emit('flip', { flipped: to });
      };
      this._api = { flip, push };
      paint();
      flipGroup.jump({ f: flipDeg });
      draw();

      // drag sideways: the sign follows the pointer around the nail
      let drag: { id: number; x0: number; y0: number; off: number; last: number; t: number; v: number; live: boolean } | null = null;
      let dragged = false;
      const pivot = () => {
        const r = nail.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      };
      const aimAt = (x: number, y: number) => {
        const p = pivot();
        return Math.atan2(x - p.x, Math.max(1, y - p.y));
      };
      this.listen(card, 'pointerdown', (e: PointerEvent) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        dragged = false;
        drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, off: aimAt(e.clientX, e.clientY) - angle, last: angle, t: e.timeStamp, v: 0, live: false };
      });
      this.listen(card, 'pointermove', (e: PointerEvent) => {
        if (!drag || e.pointerId !== drag.id) return;
        if (!drag.live) {
          if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 5) return;
          drag.live = true;
          dragged = true;
          held = true;
          rest();
          root.setAttribute('data-dragging', '');
          try {
            card.setPointerCapture?.(e.pointerId);
          } catch {
            /* synthetic */
          }
        }
        if (this.reduced) return;
        const a = Math.max(-1.1, Math.min(1.1, aimAt(e.clientX, e.clientY) - drag.off));
        const dt = Math.max(1, e.timeStamp - drag.t);
        drag.v = drag.v * 0.3 + (((a - drag.last) / dt) * 1000) * 0.7;
        drag.last = a;
        drag.t = e.timeStamp;
        angle = a;
        speed = 0;
        draw();
      });
      const end = (e: PointerEvent) => {
        if (!drag || e.pointerId !== drag.id) return;
        const d = drag;
        drag = null;
        held = false;
        root.removeAttribute('data-dragging');
        if (!d.live) return;
        speed = e.timeStamp - d.t > 90 ? 0 : Math.max(-9, Math.min(9, d.v));
        tick(this, 6);
        run();
      };
      this.listen(card, 'pointerup', end);
      this.listen(card, 'pointercancel', end);
      this.listen(card, 'click', (e: MouseEvent) => {
        if (dragged) {
          dragged = false;
          e.preventDefault();
          return;
        }
        flip(!this._flipped, true);
      });
      this.listen(card, 'keydown', (e: KeyboardEvent) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        flip(!this._flipped, true);
      });
      // a mouse brushing past gives the sign a nudge in the direction it moved
      let brush = { x: 0, t: 0, v: 0 };
      this.listen(root, 'pointermove', (e: PointerEvent) => {
        if (e.pointerType !== 'mouse' || drag) return;
        const dt = Math.max(1, e.timeStamp - brush.t);
        brush = { x: e.clientX, t: e.timeStamp, v: brush.t ? ((e.clientX - brush.x) / dt) * 1000 : 0 };
      });
      this.listen(card, 'pointerenter', (e: PointerEvent) => {
        if (e.pointerType !== 'mouse' || drag || e.timeStamp - brush.t > 120) return;
        push(swingImpulse(brush.v, arm()) * 0.35);
      });
      this.onCleanup(() => {
        rest();
        flipGroup.stop();
        root.remove();
        this._api = null;
      });
    }
  }, { id: 'snap-kit-20', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
