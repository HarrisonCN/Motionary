import { defineElement, onFrame, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { ownChildren } from './kit';
import css from './motion-kit.css?raw';

/** The line's sag (px below the ends) at `t` (0–1 along it) for a parabola with `sag` at the middle. */
export function sagAt(t: number, sag: number): number {
  const x = Math.min(1, Math.max(0, t));
  return Math.round(4 * sag * x * (1 - x) * 100) / 100;
}

/** One step of a damped spring: returns the new [angle, velocity] after `dt` seconds. */
export function swingStep(angle: number, velocity: number, dt: number, stiffness = 60, damping = 5): [number, number] {
  const a = -stiffness * angle - damping * velocity;
  const v = velocity + a * dt;
  return [angle + v * dt, v];
}

/**
 * Photos (or cards) pegged to a sagging line. Moving the pointer across them gives each a push that makes it swing on
 * its peg and settle; pulling one down with the pointer stretches the line a little. Keyboard focus inside a card gives
 * it a small swing too, so the effect is never pointer-only. Each element child hangs from its own peg at the height of
 * the curve. The swinging stops off screen and does not happen under reduced motion.
 *
 * Attributes: `sag` (px; 24), `item-width` (CSS width; 160px), `strength` (push per px/ms; 1), `label`.
 * Event `usa:swing` ({ index }) when a card is pushed.
 */
export interface UsaClotheslineElement extends UsaElement {
  swing(index: number, amount?: number): void;
}

export function defineClothesline(tag = 'usa-clothesline'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class Clothesline extends Base {
    static get observedAttributes(): string[] { return ['sag', 'item-width', 'strength', 'label']; }
    private _push?: (i: number, v: number) => void;
    swing(index: number, amount = 40): void { this._push?.(Math.round(index), Number(amount) || 0); }
    mount(): void {
      const kids = ownChildren(this);
      const sag = Math.max(0, Math.min(120, this.num('sag', 24)));
      const root = make('div', 'usa-kit usa-line');
      const label = this.str('label');
      if (label) { root.setAttribute('role', 'group'); root.setAttribute('aria-label', label); }
      root.style.setProperty('--sag', `${sag}px`);
      root.style.setProperty('--w', this.str('item-width', '160px'));
      const NS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('class', 'usa-line-svg');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('viewBox', `0 0 1000 ${sag + 16}`);
      svg.setAttribute('preserveAspectRatio', 'none');
      const path = document.createElementNS(NS, 'path');
      svg.append(path);
      const row = make('div', 'usa-line-row');
      const items = kids.map((k) => { const it = make('div', 'usa-line-item'); it.append(k); row.append(it); return it; });
      root.append(svg, row);
      this.append(root);
      const st = items.map(() => ({ a: 0, v: 0 }));
      let pull = 0, pullAt = 0.5;
      const drawLine = () => {
        const extra = pull;
        const mid = 1000 * pullAt;
        path.setAttribute('d', `M0 4 Q${mid} ${4 + sag * 2 + extra * 2} 1000 4`);
        const rr = row.getBoundingClientRect();
        items.forEach((it) => {
          const r = it.getBoundingClientRect();
          const t = rr.width ? (r.left + r.width / 2 - rr.left) / rr.width : 0.5;
          const near = 1 - Math.min(1, Math.abs(t - pullAt) * 2);
          it.style.setProperty('--drop', `${sagAt(t, sag) + extra * near}px`);
        });
      };
      let stop: (() => void) | undefined, visible = true;
      const run = () => {
        stop?.();
        stop = undefined;
        if (this.reduced || !visible) return;
        stop = onFrame((_t, dt) => {
          const s = Math.min(0.033, (dt || 16) / 1000);
          let moving = Math.abs(pull) > 0.05;
          st.forEach((p, i) => {
            [p.a, p.v] = swingStep(p.a, p.v, s);
            if (Math.abs(p.a) < 0.02 && Math.abs(p.v) < 0.02) { p.a = 0; p.v = 0; } else moving = true;
            items[i].style.setProperty('--swing', `${p.a.toFixed(2)}deg`);
          });
          if (!drag) pull *= Math.pow(0.002, s);
          drawLine();
          if (!moving) { stop?.(); stop = undefined; }
        }, this);
      };
      const push = (i: number, v: number) => {
        if (this.reduced || !st[i]) return;
        st[i].v += Math.max(-400, Math.min(400, v));
        this.emit('swing', { index: i });
        if (!stop) run();
      };
      this._push = push;
      this.inView((v) => { visible = v; if (!v) { stop?.(); stop = undefined; } });
      const strength = Math.max(0, this.num('strength', 1));
      let last: { x: number; t: number } | null = null;
      let drag: { id: number; y: number } | null = null;
      this.listen(row, 'pointermove', (e: PointerEvent) => {
        if (drag && e.pointerId === drag.id) {
          pull = Math.max(0, Math.min(60, (e.clientY - drag.y) * 0.5));
          if (!stop) run();
          return;
        }
        if (e.pointerType !== 'mouse') return;
        const now = e.timeStamp;
        if (last) {
          const vx = (e.clientX - last.x) / Math.max(1, now - last.t);
          const i = items.findIndex((it) => it.contains(e.target as Node));
          if (i >= 0 && Math.abs(vx) > 0.05) push(i, vx * 120 * strength);
        }
        last = { x: e.clientX, t: now };
      });
      this.listen(row, 'pointerleave', () => (last = null));
      this.listen(row, 'pointerdown', (e: PointerEvent) => {
        if (e.button !== 0 || this.reduced || (e.target as Element).closest('a, button, input, select, textarea')) return;
        const rr = row.getBoundingClientRect();
        pullAt = rr.width ? Math.min(0.9, Math.max(0.1, (e.clientX - rr.left) / rr.width)) : 0.5;
        drag = { id: e.pointerId, y: e.clientY };
        row.setPointerCapture?.(e.pointerId);
      });
      const release = (e: PointerEvent) => {
        if (!drag || e.pointerId !== drag.id) return;
        drag = null;
        st.forEach((_, i) => push(i, (i % 2 ? 1 : -1) * pull * 2));
      };
      this.listen(row, 'pointerup', release);
      this.listen(row, 'pointercancel', release);
      this.listen(row, 'focusin', (e: FocusEvent) => { const i = items.findIndex((it) => it.contains(e.target as Node)); if (i >= 0) push(i, 60); });
      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(() => drawLine());
        ro.observe(row);
        this.onCleanup(() => ro.disconnect());
      }
      this.onCleanup(() => {
        stop?.();
        this.append(...kids);
        root.remove();
        this._push = undefined;
      });
      root.toggleAttribute('data-static', this.reduced);
      drawLine();
    }
  }, { id: 'motion-kit', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
