import { caf, defineElement, now, raf, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { cleanColor, ownChildren } from './kit';
import css from './motion-kit-12.css?raw';

/**
 * How strongly a dot `dist` px from a ripple's centre is lit `t` ms after it started: a ring of `width` px that travels
 * at `speed` px/ms and fades out as it grows. 0–1.
 */
export function rippleAt(dist: number, t: number, speed = 0.5, width = 60, life = 1600): number {
  if (t < 0 || t > life) return 0;
  const front = t * speed;
  const d = Math.abs(dist - front);
  if (d > width) return 0;
  return (1 - d / width) * (1 - t / life);
}

/**
 * A field of dots behind the content that ripples like water: click or tap anywhere on it and a ring of light spreads out
 * from that point, lifting the dots it passes. With `auto` (ms) a ripple starts from a random spot now and then while it
 * is on screen. Drawn on a canvas only while a ripple is running; it holds still off screen and under reduced motion. The
 * background is decorative; Enter or Space on the focused field starts a ripple from the middle.
 *
 * Attributes: `gap` (px between dots; 8–60; 20), `dot` (dot radius px; 0.5–6; 1.5), `color` (dot color), `accent`
 * (ripple color), `auto` (ms; 0 = off), `label` (Ripple field).
 * Event `usa:ripple` ({ x, y }).
 */
export interface UsaRippleGridElement extends UsaElement {
  ripple(x?: number, y?: number): void;
}

export function defineRippleGrid(tag = 'usa-ripple-grid'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class RippleGrid extends Base {
    static get observedAttributes(): string[] { return ['gap', 'dot', 'color', 'accent', 'auto', 'label']; }
    private _ripple?: (x?: number, y?: number) => void;
    ripple(x?: number, y?: number): void { this._ripple?.(x, y); }
    mount(): void {
      const kids = ownChildren(this);
      const root = make('div', 'usa-kit usa-ripple');
      const canvas = make('canvas', 'usa-ripple-canvas');
      canvas.setAttribute('aria-hidden', 'true');
      const body = make('div', 'usa-ripple-body');
      body.append(...kids);
      root.append(canvas, body);
      root.tabIndex = 0;
      root.setAttribute('role', 'group');
      root.setAttribute('aria-label', this.str('label', 'Ripple field'));
      root.toggleAttribute('data-static', this.reduced);
      this.append(root);
      const gap = Math.min(60, Math.max(8, this.num('gap', 20)));
      const dotR = Math.min(6, Math.max(0.5, this.num('dot', 1.5)));
      const ctx = canvas.getContext?.('2d') ?? null;
      let w = 0, h = 0, dpr = 1, id = 0, visible = true;
      const waves: { x: number; y: number; t: number }[] = [];
      const colors = () => {
        const cs = getComputedStyle(root);
        return { dot: cleanColor(this.str('color')) || cs.getPropertyValue('--ripple-dot').trim() || 'rgba(127,127,127,.35)', hot: cleanColor(this.str('accent')) || cs.getPropertyValue('--ripple-hot').trim() || '#6366f1' };
      };
      let pal = { dot: '', hot: '' };
      const paint = () => {
        id = 0;
        if (!ctx || !w || !h) return;
        const t = now();
        while (waves.length && t - waves[0].t > 1600) waves.shift();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        for (let y = gap / 2; y < h; y += gap) {
          for (let x = gap / 2; x < w; x += gap) {
            let k = 0;
            for (const wv of waves) k = Math.max(k, rippleAt(Math.hypot(x - wv.x, y - wv.y), t - wv.t));
            ctx.globalAlpha = 1;
            ctx.fillStyle = k > 0.02 ? pal.hot : pal.dot;
            if (k > 0.02) ctx.globalAlpha = 0.35 + k * 0.65;
            ctx.beginPath();
            ctx.arc(x, y, dotR * (1 + k * 1.6), 0, Math.PI * 2);
            ctx.fill();
          }
        }
        if (waves.length && visible && !this.reduced) id = raf(paint, this);
      };
      const size = () => {
        const r = root.getBoundingClientRect();
        dpr = Math.min(2, window.devicePixelRatio || 1);
        w = r.width; h = r.height;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        pal = colors();
        if (!id) paint();
      };
      const start = (x: number, y: number) => {
        this.emit('ripple', { x: Math.round(x), y: Math.round(y) });
        if (this.reduced) return;
        waves.push({ x, y, t: now() });
        if (waves.length > 6) waves.shift();
        if (!id) id = raf(paint, this);
      };
      this._ripple = (x, y) => start(x ?? w / 2, y ?? h / 2);
      this.listen(root, 'pointerdown', (e: PointerEvent) => {
        if ((e.target as Element).closest('a, button, input, select, textarea, label')) return;
        const r = root.getBoundingClientRect();
        start(e.clientX - r.left, e.clientY - r.top);
      });
      this.listen(root, 'keydown', (e: KeyboardEvent) => {
        if (e.target !== root || (e.key !== 'Enter' && e.key !== ' ')) return;
        e.preventDefault();
        start(w / 2, h / 2);
      });
      const every = Math.max(0, this.num('auto', 0));
      if (every) {
        const timer = setInterval(() => { if (visible && !this.reduced) start(Math.random() * w, Math.random() * h); }, Math.max(600, every));
        this.onCleanup(() => clearInterval(timer));
      }
      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(size);
        ro.observe(root);
        this.onCleanup(() => ro.disconnect());
      }
      this.inView((v) => { visible = v; if (v && waves.length && !id) id = raf(paint, this); });
      this.onCleanup(() => { caf(id); id = 0; waves.length = 0; this.append(...kids); root.remove(); this._ripple = undefined; });
      size();
    }
  }, { id: 'motion-kit-12', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
