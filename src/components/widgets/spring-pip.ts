import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { hostSprings, tick } from './micro-kit-16';
import { dampedAt } from './damped-kit-18';
import { cornerPoint, cornerStep, parseCorner, pipCorner, type PipCorner, frameOnce } from './fling-kit-19';
import css from './fling-kit-19.css?raw';

/**
 * A floating window (picture-in-picture style) inside its own frame. It follows the finger, stretches like rubber
 * past the frame's edges, and a release is carried by its speed to the nearest corner, where it settles on a spring.
 * The window is focusable: the arrow keys send it to the neighbouring corner.
 *
 * Content: the child with `data-pip` is the window; the rest is the page behind it. Attributes: `corner`
 * (top-left, top-right, bottom-left or bottom-right; bottom-right), `inset` (px from the frame's edges; 12),
 * `label` (the window's accessible name; Floating window), `feel`, `haptics`. Size the frame with
 * `--usa-pip-height` and the window with `--usa-pip-width`.
 * Events: `usa:corner` ({ corner }).
 */
export interface UsaSpringPipElement extends UsaElement {
  corner: PipCorner;
}

export function defineSpringPip(tag = 'usa-spring-pip'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, (Base) => class SpringPip extends Base {
    static get observedAttributes(): string[] {
      return ['corner', 'inset', 'label', 'feel', 'haptics'];
    }
    private _corner: PipCorner = 'bottom-right';
    private _seen?: string | null;
    private _source: { win: Node[]; page: Node[] } | null = null;
    private _go: ((c: PipCorner, user: boolean, v?: { x: number; y: number }) => void) | null = null;
    get corner(): PipCorner {
      return this._corner;
    }
    set corner(v: PipCorner) {
      const c = parseCorner(v);
      if (this._go) this._go(c, false);
      else this._corner = c;
    }
    mount(): void {
      if (!this._source) {
        const nodes = [...this.childNodes];
        const isWin = (n: Node) => n.nodeType === 1 && (n as Element).hasAttribute('data-pip');
        this._source = { win: nodes.filter(isWin), page: nodes.filter((n) => !isWin(n)) };
        nodes.forEach((n) => n.parentNode === this && this.removeChild(n));
      }
      const attr = this.getAttribute('corner');
      if (attr !== this._seen) {
        this._seen = attr;
        this._corner = parseCorner(attr);
      }
      const inset = Math.max(0, this.num('inset', 12));
      const root = make('div', 'usa-fkit usa-pip');
      const page = make('div', 'usa-pip-page');
      page.append(...this._source.page.map((n) => n.cloneNode(true)));
      const win = make('div', 'usa-pip-win');
      win.tabIndex = 0;
      win.setAttribute('role', 'group');
      win.setAttribute('aria-roledescription', 'floating window');
      win.setAttribute('aria-label', this.str('label', 'Floating window'));
      win.append(...this._source.win.map((n) => n.cloneNode(true)));
      root.append(page, win);
      this.append(root);

      const size = () => ({ fw: root.clientWidth || 320, fh: root.clientHeight || 300, w: win.offsetWidth || 160, h: win.offsetHeight || 100 });
      let box = size();
      const group = hostSprings(this, { x: 0, y: 0, s: 1 }, (v) => {
        win.style.transform = `translate(${Math.round(v.x * 10) / 10}px, ${Math.round(v.y * 10) / 10}px) scale(${Math.round(v.s * 1000) / 1000})`;
      });
      const go = (c: PipCorner, user: boolean, velocity?: { x: number; y: number }) => {
        const changed = c !== this._corner;
        this._corner = c;
        win.dataset.corner = c;
        box = size();
        const p = cornerPoint(c, box.w, box.h, box.fw, box.fh, inset);
        group.set({ x: p.x, y: p.y, s: 1 }, { spring: { duration: 560, bounce: 0.2 }, velocity: velocity ? { x: velocity.x, y: velocity.y } : undefined });
        if (changed) {
          if (user) tick(this, 8);
          this.emit('corner', { corner: c });
        }
      };
      this._go = go;
      win.dataset.corner = this._corner;
      const home = cornerPoint(this._corner, box.w, box.h, box.fw, box.fh, inset);
      group.jump(home);

      this.listen(win, 'keydown', (e: KeyboardEvent) => {
        if (!/^Arrow(Up|Down|Left|Right)$/.test(e.key)) return;
        e.preventDefault();
        go(cornerStep(this._corner, e.key), true);
      });

      let drag: { id: number; dx: number; dy: number; x0: number; y0: number; lx: number; ly: number; t: number; vx: number; vy: number; live: boolean } | null = null;
      this.listen(win, 'pointerdown', (e: PointerEvent) => {
        if ((e.pointerType === 'mouse' && e.button !== 0) || (e.target as Element).closest?.('a, button, input, textarea, select, [contenteditable]')) return;
        box = size();
        const r = root.getBoundingClientRect();
        drag = { id: e.pointerId, dx: e.clientX - r.left - group.get('x'), dy: e.clientY - r.top - group.get('y'), x0: e.clientX, y0: e.clientY, lx: e.clientX, ly: e.clientY, t: e.timeStamp, vx: 0, vy: 0, live: false };
      });
      this.listen(win, 'pointermove', (e: PointerEvent) => {
        if (!drag || e.pointerId !== drag.id) return;
        if (!drag.live) {
          if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 4) return;
          drag.live = true;
          root.setAttribute('data-dragging', '');
          group.set({ s: 1.04 }, { spring: 'snappy' });
          try {
            win.setPointerCapture?.(e.pointerId);
          } catch {
            /* synthetic */
          }
        }
        const dt = Math.max(1, e.timeStamp - drag.t);
        // a light low-pass on the release speed, so one late event does not decide the corner
        drag.vx = drag.vx * 0.4 + (((e.clientX - drag.lx) / dt) * 1000) * 0.6;
        drag.vy = drag.vy * 0.4 + (((e.clientY - drag.ly) / dt) * 1000) * 0.6;
        drag.lx = e.clientX;
        drag.ly = e.clientY;
        drag.t = e.timeStamp;
        const r = root.getBoundingClientRect();
        const x = dampedAt(e.clientX - r.left - drag.dx, inset, Math.max(inset, box.fw - box.w - inset), box.fw / 2);
        const y = dampedAt(e.clientY - r.top - drag.dy, inset, Math.max(inset, box.fh - box.h - inset), box.fh / 2);
        group.jump({ x, y });
      });
      const end = (e: PointerEvent) => {
        if (!drag || e.pointerId !== drag.id) return;
        const d = drag;
        drag = null;
        root.removeAttribute('data-dragging');
        if (!d.live) return;
        const c = pipCorner(group.get('x'), group.get('y'), d.vx, d.vy, box.w, box.h, box.fw, box.fh);
        go(c, true, { x: d.vx, y: d.vy });
      };
      this.listen(win, 'pointerup', end);
      this.listen(win, 'pointercancel', end);
      if (typeof ResizeObserver !== 'undefined') {
        const later = frameOnce(() => {
          if (drag) return;
          box = size();
          if (!group.animating) group.jump(cornerPoint(this._corner, box.w, box.h, box.fw, box.fh, inset));
        }, this);
        const ro = new ResizeObserver(() => later.ask());
        ro.observe(root);
        ro.observe(win);
        this.onCleanup(() => {
          ro.disconnect();
          later.cancel();
        });
      }
      this.onCleanup(() => {
        group.stop();
        root.remove();
        this._go = null;
      });
    }
  }, { id: 'fling-kit-19', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
