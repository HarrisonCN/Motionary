import { defineElement, raf, caf, now, clamp, type UsaElement, getBase } from '../base';

type BaseCtor = ReturnType<typeof getBase>;
import { glQuad, type GLQuad } from './gl';
import css from './webgl.css?raw';

/**
 * Shared shell for the WebGL elements: a canvas over (or behind) the
 * content that renders only while visible and the tab is shown, a DPR cap
 * of 2, and a graceful fallback (`data-fallback`) when WebGL, the shader
 * or the image (CORS) is unavailable — the original content / CSS stays.
 */
export interface UsaGLElement extends UsaElement {
  /** `true` once WebGL rendering is active (otherwise the CSS fallback shows). */
  readonly active: boolean;
}

type Kind = 'shader' | 'distort' | 'liquid';

function make(kind: Kind) {
  return (Base: BaseCtor): CustomElementConstructor =>
    class extends Base {
      static get observedAttributes(): string[] {
        return kind === 'shader' ? ['preset', 'speed'] : ['src'];
      }
      private _q: GLQuad | null = null;
      private _c: HTMLCanvasElement | null = null;
      private _id = 0;
      private _mouse: [number, number] = [0.5, 0.5];
      private _hover = 0;
      private _hoverTo = 0;
      private _ripples: { x: number; y: number; t: number }[] = [];

      get active(): boolean {
        return !!this._q;
      }

      private fallback(reason: string): void {
        this.setAttribute('data-fallback', reason);
        this._c?.remove();
        this._c = null;
        this._q?.dispose();
        this._q = null;
      }

      private frame(): void {
        const q = this._q;
        if (!q) return;
        this._hover += (this._hoverTo - this._hover) * 0.12;
        const t = now();
        this._ripples = this._ripples.filter((r) => t - r.t < 2500);
        q.render({
          time: (t / 1000) * this.num('speed', 1),
          mouse: this._mouse,
          hover: this._hover,
          ripples: this._ripples.flatMap((r) => [r.x, r.y, (t - r.t) / 1000, this.num('strength', 1)]),
        });
      }

      mount(): void {
        this.removeAttribute('data-fallback');
        const custom = this.querySelector('script[type="x-shader/x-fragment"]');
        const frag = kind === 'shader' ? custom?.textContent || this.str('preset', 'gradient') : kind;
        const img = kind === 'shader' ? null : (this.querySelector('img') as HTMLImageElement | null);
        if (kind !== 'shader' && !img) return this.fallback('no-image');
        const c = (this._c = document.createElement('canvas'));
        c.setAttribute('aria-hidden', 'true');
        c.className = 'usa-gl';
        this.prepend(c);
        const q = (this._q = glQuad(c, frag));
        if (!q) return this.fallback('webgl');
        this.onCleanup(() => this.fallback('off'));
        const start = () => {
          if (!img) return true;
          try {
            q.texture(img);
            return true;
          } catch {
            this.fallback('image');
            return false;
          }
        };
        const draw = () => {
          q.resize();
          this.frame();
        };
        if (img && !(img.complete && img.naturalWidth)) {
          if (!img.crossOrigin && /^https?:/.test(img.src) && !img.src.startsWith(location.origin)) img.crossOrigin = 'anonymous';
          this.listen(img, 'load', () => start() && draw());
          this.listen(img, 'error', () => this.fallback('image'));
        } else if (!start()) return;
        this.setAttribute('data-active', '');
        this.onCleanup(() => this.removeAttribute('data-active'));
        draw();
        if (kind !== 'shader') {
          const pos = (e: PointerEvent) => {
            const r = this.getBoundingClientRect();
            this._mouse = [clamp((e.clientX - r.left) / (r.width || 1), 0, 1), clamp(1 - (e.clientY - r.top) / (r.height || 1), 0, 1)];
          };
          this.listen(this, 'pointermove', pos);
          this.listen(this, 'pointerenter', (e: PointerEvent) => (pos(e), (this._hoverTo = 1)));
          this.listen(this, 'pointerleave', () => (this._hoverTo = 0));
          if (kind === 'liquid')
            this.listen(this, 'pointerdown', (e: PointerEvent) => {
              pos(e);
              this._ripples = [...this._ripples.slice(-3), { x: this._mouse[0], y: this._mouse[1], t: now() }];
            });
        }
        if (this.reduced) return; // one static frame, no loop
        let visible = false;
        const loop = () => {
          this.frame();
          this._id = raf(loop);
        };
        const sync = () => {
          caf(this._id);
          this._id = 0;
          if (visible && !document.hidden) this._id = raf(loop);
        };
        this.inView((v: boolean) => ((visible = v), sync()));
        this.listen(document, 'visibilitychange', sync);
        this.listen(window, 'resize', () => q.resize(), { passive: true });
        this.onCleanup(() => caf(this._id));
      }
    };
}

/**
 * `<usa-shader>` — GPU shader background behind its content. `preset`
 * (`gradient` · `plasma` · `waves` · `aurora`) or your own fragment shader in
 * `<script type="x-shader/x-fragment">` (uniforms `u_time`, `u_resolution`,
 * `u_mouse`, `v_uv`); `speed`. Without WebGL: the element's CSS background.
 */
export function defineShader(tag = 'usa-shader'): CustomElementConstructor | undefined {
  return defineElement(tag, make('shader'), { id: 'webgl', text: css });
}

/**
 * `<usa-distort>` — hover distortion + RGB split on the `<img>` inside,
 * following the pointer. Without WebGL / CORS: a gentle CSS zoom.
 */
export function defineDistort(tag = 'usa-distort'): CustomElementConstructor | undefined {
  return defineElement(tag, make('distort'), { id: 'webgl', text: css });
}

/**
 * `<usa-liquid>` — liquid image: clicks / taps send ripples through the
 * `<img>` inside, hover adds a gentle wobble; `strength`. Fallback: plain image.
 */
export function defineLiquid(tag = 'usa-liquid'): CustomElementConstructor | undefined {
  return defineElement(tag, make('liquid'), { id: 'webgl', text: css });
}
