import { defineElement, raf, caf, type UsaElement } from '../base';
import css from './particles.css?raw';

/**
 * `<usa-particles>` — a canvas of drifting particles, optionally linked by
 * lines when close (a "constellation"), that drift away from the pointer.
 * Fills its own box (place it as a background with
 * `position: absolute; inset: 0`, or give it a height).
 *
 * Attributes: `count` (60; scaled down on small boxes), `color`
 * (default `currentColor`), `size` (max radius px, 2.2), `speed` (0.35),
 * `links` (max link distance px, 110; `0` disables), `interactive`,
 * `paused`. Renders only while visible and the tab is shown, at device
 * pixel ratio ≤ 2. Reduced motion: one still frame.
 */
export interface UsaParticlesElement extends UsaElement {
  /** Re-seed the particles. */
  reset(): void;
}

interface P {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

export function defineParticles(tag = 'usa-particles'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaParticles extends Base {
        static get observedAttributes(): string[] {
          return ['count', 'color', 'size', 'speed', 'links', 'interactive', 'paused'];
        }

        private _canvas: HTMLCanvasElement | null = null;
        private _ctx: CanvasRenderingContext2D | null = null;
        private _ps: P[] = [];
        private _frame = 0;
        private _w = 0;
        private _h = 0;
        private _visible = false;
        private _mx = -1e4;
        private _color = '#888';
        private _my = -1e4;

        mount(): void {
          if (!this._canvas) {
            this._canvas = document.createElement('canvas');
            this._canvas.setAttribute('aria-hidden', 'true');
            this.prepend(this._canvas);
          }
          this._ctx = this._canvas.getContext?.('2d') ?? null;
          if (!this._ctx) return;
          this.resize();
          if (typeof ResizeObserver !== 'undefined') {
            const ro = new ResizeObserver(() => {
              this.resize();
              if (!this._frame) this.draw();
            });
            ro.observe(this);
            this.onCleanup(() => ro.disconnect());
          }
          this.inView((v) => {
            this._visible = v;
            this.loop();
          });
          this.listen(document, 'visibilitychange', () => this.loop());
          if (this.flag('interactive')) {
            this.listen(window, 'pointermove', (e: PointerEvent) => {
              const r = this.getBoundingClientRect();
              this._mx = e.clientX - r.left;
              this._my = e.clientY - r.top;
            }, { passive: true });
          }
          this.draw();
        }

        unmount(): void {
          caf(this._frame);
          this._frame = 0;
        }

        reset(): void {
          this._ps = [];
          this.resize();
          this.draw();
        }

        private resize(): void {
          const c = this._canvas;
          if (!c || !this._ctx) return;
          const w = this.clientWidth || 300;
          const h = this.clientHeight || 150;
          const dpr = Math.min(2, (typeof devicePixelRatio === 'number' && devicePixelRatio) || 1);
          c.width = Math.round(w * dpr);
          c.height = Math.round(h * dpr);
          this._ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          this._w = w;
          this._h = h;
          this._color = this.getAttribute('color') || (typeof getComputedStyle === 'function' ? getComputedStyle(this).color : '') || '#888';
          const want = Math.round(Math.min(1, (w * h) / (900 * 500)) * Math.max(1, this.num('count', 60))) || 1;
          const speed = this.num('speed', 0.35);
          const size = this.num('size', 2.2);
          while (this._ps.length < want) {
            const a = Math.random() * Math.PI * 2;
            const s = speed * (0.3 + Math.random() * 0.7);
            this._ps.push({ x: Math.random() * w, y: Math.random() * h, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: 0.6 + Math.random() * (size - 0.6) });
          }
          this._ps.length = want;
        }

        private loop(): void {
          const run = this._visible && !this.reduced && !this.flag('paused') && !(typeof document !== 'undefined' && document.hidden);
          if (run && !this._frame) {
            const tick = () => {
              this.step();
              this.draw();
              this._frame = raf(tick);
            };
            this._frame = raf(tick);
          } else if (!run && this._frame) {
            caf(this._frame);
            this._frame = 0;
          }
        }

        private step(): void {
          const { _w: w, _h: h } = this;
          for (const p of this._ps) {
            const dx = p.x - this._mx;
            const dy = p.y - this._my;
            const d2 = dx * dx + dy * dy;
            if (d2 < 8100 && d2 > 0.01) {
              const f = (1 - Math.sqrt(d2) / 90) * 0.6;
              p.x += (dx / Math.sqrt(d2)) * f;
              p.y += (dy / Math.sqrt(d2)) * f;
            }
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < -5) p.x = w + 5;
            else if (p.x > w + 5) p.x = -5;
            if (p.y < -5) p.y = h + 5;
            else if (p.y > h + 5) p.y = -5;
          }
        }

        private draw(): void {
          const ctx = this._ctx;
          if (!ctx) return;
          const color = this._color;
          ctx.clearRect(0, 0, this._w, this._h);
          ctx.fillStyle = color;
          ctx.strokeStyle = color;
          const ps = this._ps;
          const link = this.num('links', 110);
          if (link > 0) {
            const l2 = link * link;
            ctx.lineWidth = 0.6;
            for (let i = 0; i < ps.length; i++) {
              for (let j = i + 1; j < ps.length; j++) {
                const dx = ps[i].x - ps[j].x;
                const dy = ps[i].y - ps[j].y;
                const d2 = dx * dx + dy * dy;
                if (d2 < l2) {
                  ctx.globalAlpha = (1 - d2 / l2) * 0.35;
                  ctx.beginPath();
                  ctx.moveTo(ps[i].x, ps[i].y);
                  ctx.lineTo(ps[j].x, ps[j].y);
                  ctx.stroke();
                }
              }
            }
          }
          ctx.globalAlpha = 0.85;
          for (const p of ps) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
        }
      },
    { id: 'particles', text: css }
  );
}
