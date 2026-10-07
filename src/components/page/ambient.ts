import { defineElement, raf, caf, type UsaElement } from '../base';
import css from './ambient.css?raw';

export const AMBIENT_EFFECTS = ['particles', 'snow', 'stars', 'noise', 'gradient'] as const;
export type AmbientEffect = (typeof AMBIENT_EFFECTS)[number];

/**
 * `<usa-ambient effect="particles | snow | stars | noise | gradient">` — a
 * fixed, page-wide ambient layer behind (or, with `layer="front"`, over)
 * the content, never catching the pointer.
 * - `particles` — slow drifting dots; `snow` — falling flakes with sway;
 *   `stars` — twinkling starfield (canvas, paused in hidden tabs, DPR ≤ 2);
 * - `noise` — animated film grain (CSS, SVG turbulence);
 * - `gradient` — a gradient whose hue shifts with the scroll position.
 * Attributes: `effect`, `density` (0.2–3, 1), `color`, `opacity` (0.6),
 * `layer` (`back` default, `front`), `speed` (1). Reduced motion: one
 * static frame (no falling, twinkling or grain flicker).
 */
export interface UsaAmbientElement extends UsaElement {}

export function defineAmbient(tag = 'usa-ambient'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaAmbient extends Base {
        static get observedAttributes(): string[] {
          return ['effect', 'density', 'color'];
        }
        private _frame = 0;

        mount(): void {
          this.setAttribute('aria-hidden', 'true');
          const effect = this.str('effect', 'particles');
          this.style.setProperty('--usa-ambient-opacity', String(this.num('opacity', 0.6)));
          this.replaceChildren();
          if (effect === 'noise') return;
          if (effect === 'gradient') {
            const upd = () => {
              this._frame = 0;
              const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
              this.style.setProperty('--usa-ambient-p', ((window.scrollY || 0) / max).toFixed(4));
            };
            if (!this.reduced) this.listen(window, 'scroll', () => !this._frame && (this._frame = raf(upd)), { passive: true });
            upd();
            return;
          }
          const canvas = document.createElement('canvas');
          this.append(canvas);
          const ctx = canvas.getContext?.('2d');
          if (!ctx) return;
          const dpr = Math.min(2, window.devicePixelRatio || 1);
          let W = 0;
          let H = 0;
          const color = this.str('color', effect === 'snow' ? '#ffffff' : effect === 'stars' ? '#ffffff' : '#a78bfa');
          const speed = this.num('speed', 1);
          const resize = () => {
            W = window.innerWidth || 800;
            H = window.innerHeight || 600;
            canvas.width = W * dpr;
            canvas.height = H * dpr;
            canvas.style.width = `${W}px`;
            canvas.style.height = `${H}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          };
          resize();
          const base = effect === 'stars' ? 140 : effect === 'snow' ? 90 : 60;
          const n = Math.round(base * Math.max(0.2, Math.min(3, this.num('density', 1))) * Math.min(1.5, (W * H) / (1280 * 800)));
          const dots = Array.from({ length: n }, () => ({
            x: Math.random() * W,
            y: Math.random() * H,
            r: effect === 'stars' ? Math.random() * 1.3 + 0.2 : effect === 'snow' ? Math.random() * 2.6 + 0.8 : Math.random() * 2 + 0.6,
            vx: (Math.random() - 0.5) * 0.25,
            vy: effect === 'snow' ? Math.random() * 0.8 + 0.4 : (Math.random() - 0.5) * 0.25,
            t: Math.random() * Math.PI * 2,
          }));
          ctx.fillStyle = color;
          const draw = (move: boolean) => {
            ctx.clearRect(0, 0, W, H);
            for (const d of dots) {
              if (move) {
                d.t += 0.02 * speed;
                d.x += (d.vx + (effect === 'snow' ? Math.sin(d.t) * 0.3 : 0)) * speed;
                d.y += d.vy * speed;
                if (d.y > H + 5) d.y = -5;
                if (d.y < -5) d.y = H + 5;
                if (d.x > W + 5) d.x = -5;
                if (d.x < -5) d.x = W + 5;
              }
              ctx.globalAlpha = effect === 'stars' ? 0.35 + 0.65 * Math.abs(Math.sin(d.t)) : 0.85;
              ctx.beginPath();
              ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
              ctx.fill();
            }
          };
          this.listen(window, 'resize', () => {
            resize();
            ctx.fillStyle = color;
            draw(false);
          });
          if (this.reduced) {
            draw(false);
            return;
          }
          const loop = () => {
            if (!document.hidden) draw(true);
            this._frame = raf(loop);
          };
          this._frame = raf(loop);
        }

        unmount(): void {
          caf(this._frame);
          this._frame = 0;
        }
      },
    { id: 'ambient', text: css }
  );
}
