import { defineElement, type UsaElement } from '../base';
import { PALETTES, seededRandom } from '../fx2/genart';
import css from './gen-art.css?raw';

/**
 * `<usa-gen-art art="flow" seed="7" palette="ocean">` (9.3) — seeded
 * generative artwork on a canvas: `flow` (particles tracing a flow field),
 * `circles` (circle packing), `truchet` (quarter-arc tiles) or `waves`
 * (layered sine ridges). It draws itself in when it scrolls into view;
 * click / Enter re-seeds (`usa:generate` { seed }). `seed`, `palette`
 * (`PALETTES` name), `label`; `generate(seed?)`, `toDataURL()`. A focusable
 * `img`; reduced motion: drawn at once.
 */
export interface UsaGenArtElement extends UsaElement {
  readonly seed: number;
  generate(seed?: number): void;
  toDataURL(type?: string): string;
}
const ARTS = ['flow', 'circles', 'truchet', 'waves'];

export function defineGenArt(tag = 'usa-gen-art'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaGenArt extends Base {
        static get observedAttributes(): string[] {
          return ['art', 'seed', 'palette', 'label'];
        }
        private _seed = 1;
        private _raf = 0;
        get seed(): number {
          return this._seed;
        }
        private canvas(): HTMLCanvasElement | null {
          return this.querySelector(':scope > canvas');
        }
        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          this._seed = this.num('seed', 1);
          const art = ARTS.includes(this.str('art')) ? this.str('art') : 'flow';
          this.setAttribute('data-art', art);
          this.setAttribute('role', 'img');
          this.setAttribute('aria-label', this.str('label', `Generative ${art} artwork, seed ${this._seed}`));
          if (!this.hasAttribute('tabindex')) this.tabIndex = 0;
          this.insertAdjacentHTML('afterbegin', '<canvas data-usa-part></canvas>');
          this.listen(this, 'click', () => this.generate());
          this.listen(this, 'keydown', (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              this.generate();
            }
          });
          let drawn = false;
          this.inView((v) => {
            if (v && !drawn) {
              drawn = true;
              this.draw();
            }
          });
          this.onCleanup(() => cancelAnimationFrame(this._raf));
        }
        generate(seed = Math.floor(Math.random() * 1e6)): void {
          this._seed = seed;
          this.setAttribute('aria-label', this.str('label', `Generative ${this.getAttribute('data-art')} artwork, seed ${seed}`));
          this.draw();
          this.emit('generate', { seed });
        }
        toDataURL(type = 'image/png'): string {
          return this.canvas()?.toDataURL(type) || '';
        }
        private draw(): void {
          const c = this.canvas();
          const ctx = c?.getContext?.('2d');
          if (!c || !ctx) return;
          cancelAnimationFrame(this._raf);
          const w = Math.max(60, Math.round(this.clientWidth || 300));
          const h = Math.max(60, Math.round(this.clientHeight || 180));
          const dpr = Math.min(2, (typeof devicePixelRatio === 'number' && devicePixelRatio) || 1);
          c.width = w * dpr;
          c.height = h * dpr;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          const pal = PALETTES[this.str('palette')] || PALETTES.sunset;
          const r = seededRandom(this._seed);
          ctx.fillStyle = pal[pal.length - 1];
          ctx.fillRect(0, 0, w, h);
          const art = this.getAttribute('data-art');
          const steps: (() => void)[] = [];
          if (art === 'circles') {
            const cs: [number, number, number][] = [];
            for (let i = 0; i < 900 && cs.length < 140; i++) {
              const x = r() * w;
              const y = r() * h;
              let rad = 2 + r() * Math.min(w, h) * 0.14;
              for (const [cx, cy, cr] of cs) rad = Math.min(rad, Math.hypot(x - cx, y - cy) - cr - 1.5);
              if (rad < 2) continue;
              cs.push([x, y, rad]);
              const col = pal[Math.floor(r() * (pal.length - 1))];
              steps.push(() => {
                ctx.beginPath();
                ctx.arc(x, y, rad, 0, Math.PI * 2);
                ctx.fillStyle = col;
                ctx.fill();
              });
            }
          } else if (art === 'truchet') {
            const s = Math.max(16, Math.round(Math.min(w, h) / 8));
            ctx.lineWidth = s / 5;
            ctx.lineCap = 'round';
            for (let y = 0; y < h; y += s)
              for (let x = 0; x < w; x += s) {
                const flip = r() > 0.5;
                const col = pal[Math.floor(r() * (pal.length - 1))];
                steps.push(() => {
                  ctx.strokeStyle = col;
                  ctx.beginPath();
                  if (flip) {
                    ctx.arc(x, y, s / 2, 0, Math.PI / 2);
                    ctx.moveTo(x + s, y + s / 2);
                    ctx.arc(x + s, y + s, s / 2, -Math.PI / 2, Math.PI, true);
                  } else {
                    ctx.arc(x + s, y, s / 2, Math.PI / 2, Math.PI);
                    ctx.moveTo(x + s / 2, y + s);
                    ctx.arc(x, y + s, s / 2, 0, -Math.PI / 2, true);
                  }
                  ctx.stroke();
                });
              }
          } else if (art === 'waves') {
            const n = 7;
            for (let i = 0; i < n; i++) {
              const base = (h / (n + 1)) * (i + 1);
              const amp = 6 + r() * h * 0.08;
              const f = 1 + r() * 3;
              const ph = r() * Math.PI * 2;
              const col = pal[i % (pal.length - 1)];
              steps.push(() => {
                ctx.beginPath();
                ctx.moveTo(0, h);
                for (let x = 0; x <= w; x += 4) ctx.lineTo(x, base + Math.sin((x / w) * Math.PI * 2 * f + ph) * amp);
                ctx.lineTo(w, h);
                ctx.closePath();
                ctx.fillStyle = col;
                ctx.globalAlpha = 0.85;
                ctx.fill();
                ctx.globalAlpha = 1;
              });
            }
          } else {
            const z = 0.004 + r() * 0.006;
            const ph = r() * 10;
            for (let i = 0; i < 160; i++) {
              let x = r() * w;
              let y = r() * h;
              const col = pal[Math.floor(r() * (pal.length - 1))];
              steps.push(() => {
                ctx.strokeStyle = col;
                ctx.lineWidth = 1.4;
                ctx.globalAlpha = 0.8;
                ctx.beginPath();
                ctx.moveTo(x, y);
                for (let k = 0; k < 40; k++) {
                  const a = (Math.sin(x * z + ph) + Math.cos(y * z - ph)) * Math.PI;
                  x += Math.cos(a) * 3;
                  y += Math.sin(a) * 3;
                  ctx.lineTo(x, y);
                }
                ctx.stroke();
                ctx.globalAlpha = 1;
              });
            }
          }
          if (this.reduced || typeof requestAnimationFrame === 'undefined') {
            steps.forEach((f) => f());
            return;
          }
          const per = Math.max(1, Math.ceil(steps.length / 40));
          let i = 0;
          const tick = () => {
            for (let k = 0; k < per && i < steps.length; k++) steps[i++]();
            if (i < steps.length) this._raf = requestAnimationFrame(tick);
          };
          tick();
        }
      }
      return UsaGenArt as unknown as CustomElementConstructor;
    },
    { id: 'gen-art', text: css }
  );
}
