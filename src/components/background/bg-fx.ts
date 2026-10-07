import { defineElement, raf, caf, type UsaElement } from '../base';
import css from './bg-fx.css?raw';

/** Shared canvas setup: DPR ≤ 2, resize with the host, run only while visible & tab shown. */
function canvasLoop(host: any, draw: (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void, still: boolean): void {
  const c = document.createElement('canvas');
  c.className = 'usa-bg-canvas';
  c.setAttribute('aria-hidden', 'true');
  host.prepend(c);
  host.onCleanup(() => c.remove());
  const ctx = c.getContext?.('2d') as CanvasRenderingContext2D | null;
  if (!ctx) return;
  const dpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
  let w = 0;
  let h = 0;
  const size = () => {
    const r = host.getBoundingClientRect();
    w = Math.max(1, r.width || 300);
    h = Math.max(1, r.height || 150);
    c.width = w * dpr;
    c.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  size();
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(size) : null;
  ro?.observe(host);
  host.onCleanup(() => ro?.disconnect());
  let id = 0;
  let on = false;
  const loop = (t: number) => {
    if (!document.hidden) draw(ctx, w, h, t);
    id = raf(loop);
  };
  if (still) {
    draw(ctx, w, h, 0);
    return;
  }
  host.inView((v: boolean) => {
    if (v && !on) {
      on = true;
      id = raf(loop);
    } else if (!v && on) {
      on = false;
      caf(id);
    }
  });
  host.onCleanup(() => caf(id));
}

/**
 * `<usa-grid-glow>` — a line grid behind its content that lights up around
 * the pointer. Attributes: `size` (cell px, 32), `color`, `radius` (px, 220).
 * Reduced motion: the grid stays, a soft static glow in the centre.
 */
export interface UsaGridGlowElement extends UsaElement {}
export function defineGridGlow(tag = 'usa-grid-glow'): CustomElementConstructor | undefined {
  return defineElement(tag, (Base) => class extends Base {
    mount(): void {
      this.style.setProperty('--usa-grid', `${this.num('size', 32)}px`);
      this.style.setProperty('--usa-grid-r', `${this.num('radius', 220)}px`);
      if (this.str('color')) this.style.setProperty('--usa-grid-color', this.str('color'));
      if (this.reduced) return;
      let f = 0;
      let x = 0;
      let y = 0;
      this.listen(this, 'pointermove', (e: PointerEvent) => {
        const r = this.getBoundingClientRect();
        x = e.clientX - r.left;
        y = e.clientY - r.top;
        if (!f) f = raf(() => {
          f = 0;
          this.style.setProperty('--usa-grid-x', `${x}px`);
          this.style.setProperty('--usa-grid-y', `${y}px`);
        });
      });
      this.onCleanup(() => caf(f));
    }
  }, { id: 'bg-fx', text: css });
}

/**
 * `<usa-blobs>` — soft, slowly morphing colour blobs (fluid gradient
 * backdrop). Attributes: `colors` (comma list), `speed` (1), `blur` (px, 60).
 * Reduced motion: still blobs.
 */
export interface UsaBlobsElement extends UsaElement {}
export function defineBlobs(tag = 'usa-blobs'): CustomElementConstructor | undefined {
  return defineElement(tag, (Base) => class extends Base {
    mount(): void {
      this.querySelector(':scope > .usa-blobs-layer')?.remove();
      const colors = this.str('colors', '#7c5cff,#22d3ee,#f472b6,#34d399').split(',');
      const layer = document.createElement('div');
      layer.className = 'usa-blobs-layer';
      layer.setAttribute('aria-hidden', 'true');
      layer.innerHTML = colors.map((c, i) => `<i style="--c:${c.trim()};--i:${i}"></i>`).join('');
      this.prepend(layer);
      this.style.setProperty('--usa-blobs-speed', String(this.num('speed', 1)));
      this.style.setProperty('--usa-blobs-blur', `${this.num('blur', 60)}px`);
    }
  }, { id: 'bg-fx', text: css });
}

/**
 * `<usa-water-ripple>` — interactive water ripples on a canvas over its
 * content (pointer moves and taps disturb the surface). Low-resolution height
 * map, paused off-screen. Attributes: `damping` (0.96), `strength` (1),
 * `color` (highlight). Reduced motion: nothing is drawn.
 */
export interface UsaWaterRippleElement extends UsaElement {
  drop(x: number, y: number, strength?: number): void;
}
export function defineWaterRipple(tag = 'usa-water-ripple'): CustomElementConstructor | undefined {
  return defineElement(tag, (Base) => class extends Base {
    private _drop: ((x: number, y: number, s?: number) => void) | null = null;
    drop(x: number, y: number, s = 1): void {
      this._drop?.(x, y, s);
    }
    mount(): void {
      if (this.reduced) return;
      const S = 4;
      let cols = 0;
      let rows = 0;
      let a = new Float32Array(0);
      let b = new Float32Array(0);
      const damp = this.num('damping', 0.96);
      const color = this.str('color', '255,255,255');
      this._drop = (x, y, s = 1) => {
        const cx = Math.floor(x / S);
        const cy = Math.floor(y / S);
        if (cx < 1 || cy < 1 || cx >= cols - 1 || cy >= rows - 1) return;
        a[cy * cols + cx] += 256 * s * this.num('strength', 1);
      };
      canvasLoop(this, (ctx, w, h) => {
        const nc = Math.ceil(w / S);
        const nr = Math.ceil(h / S);
        if (nc !== cols || nr !== rows) {
          cols = nc;
          rows = nr;
          a = new Float32Array(cols * rows);
          b = new Float32Array(cols * rows);
        }
        ctx.clearRect(0, 0, w, h);
        for (let y = 1; y < rows - 1; y++) {
          for (let x = 1; x < cols - 1; x++) {
            const i = y * cols + x;
            const v = ((a[i - 1] + a[i + 1] + a[i - cols] + a[i + cols]) / 2 - b[i]) * damp;
            b[i] = v;
            if (v > 2 || v < -2) {
              ctx.fillStyle = `rgba(${color},${Math.min(0.5, Math.abs(v) / 300).toFixed(3)})`;
              ctx.fillRect(x * S, y * S, S, S);
            }
          }
        }
        const t = a;
        a = b;
        b = t;
      }, false);
      this.listen(this, 'pointermove', (e: PointerEvent) => {
        const r = this.getBoundingClientRect();
        this.drop(e.clientX - r.left, e.clientY - r.top, 0.35);
      });
      this.listen(this, 'pointerdown', (e: PointerEvent) => {
        const r = this.getBoundingClientRect();
        this.drop(e.clientX - r.left, e.clientY - r.top, 1.5);
      });
    }
  }, { id: 'bg-fx', text: css });
}

/**
 * `<usa-dot-network>` — a grid of dots that swell and link up with lines
 * around the pointer (a living network backdrop). Attributes: `gap` (px,
 * 28), `color`, `radius` (px of influence, 140). Reduced motion: a static
 * dot grid.
 */
export interface UsaDotNetworkElement extends UsaElement {}
export function defineDotNetwork(tag = 'usa-dot-network'): CustomElementConstructor | undefined {
  return defineElement(tag, (Base) => class extends Base {
    mount(): void {
      const gap = Math.max(8, this.num('gap', 28));
      const R = this.num('radius', 140);
      const color = this.str('color', '124,92,255');
      let px = -1e4;
      let py = -1e4;
      this.listen(this, 'pointermove', (e: PointerEvent) => {
        const r = this.getBoundingClientRect();
        px = e.clientX - r.left;
        py = e.clientY - r.top;
      });
      this.listen(this, 'pointerleave', () => (px = py = -1e4));
      canvasLoop(this, (ctx, w, h) => {
        ctx.clearRect(0, 0, w, h);
        const near: [number, number, number][] = [];
        for (let y = gap / 2; y < h; y += gap) {
          for (let x = gap / 2; x < w; x += gap) {
            const d = Math.hypot(x - px, y - py);
            const k = d < R ? 1 - d / R : 0;
            const ox = k ? ((x - px) / (d || 1)) * k * 8 : 0;
            const oy = k ? ((y - py) / (d || 1)) * k * 8 : 0;
            ctx.fillStyle = `rgba(${color},${(0.25 + k * 0.75).toFixed(3)})`;
            ctx.beginPath();
            ctx.arc(x + ox, y + oy, 1.2 + k * 2.2, 0, Math.PI * 2);
            ctx.fill();
            if (k > 0.2) near.push([x + ox, y + oy, k]);
          }
        }
        ctx.lineWidth = 1;
        for (const [x, y, k] of near) {
          ctx.strokeStyle = `rgba(${color},${(k * 0.5).toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(px, py);
          ctx.stroke();
        }
      }, this.reduced);
    }
  }, { id: 'bg-fx', text: css });
}
