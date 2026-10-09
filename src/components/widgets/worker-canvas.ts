import { defineElement, type UsaElement } from '../base';
import { offscreenRender, type DrawProgram } from '../fx2/perf3';
import css from './worker-canvas.css?raw';

/**
 * `<usa-worker-canvas scene="particles">` (9.6) — a canvas animation that
 * renders in a Web Worker on an OffscreenCanvas (main thread stays free;
 * falls back to the shared frame loop): built-in `scene` = `particles` ·
 * `orbits` · `starfield`, or your own `program` (the source of
 * `(ctx, t, w, h, state) => {…}`). Only runs while on screen.
 * `data-usa-backend` shows `worker` or `main`; `backend` property;
 * `usa:backend` { backend }. An `img` with `label`; reduced motion: one
 * still frame.
 */
export interface UsaWorkerCanvasElement extends UsaElement {
  program: DrawProgram | null;
  readonly backend: string;
}

export const WORKER_SCENES: Record<string, string> = {
  particles: `function (ctx, t, w, h, s) { if (!s.p) { s.p = Array.from({ length: 90 }, (_, i) => ({ x: (i * 97) % w, y: (i * 53) % h, vx: Math.cos(i) * 0.6, vy: Math.sin(i * 1.3) * 0.6, r: 1 + (i % 3) })); } ctx.fillStyle = 'rgba(15,23,42,0.25)'; ctx.fillRect(0, 0, w, h); for (const q of s.p) { q.x = (q.x + q.vx + w) % w; q.y = (q.y + q.vy + h) % h; ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, 6.283); ctx.fillStyle = 'hsl(' + ((q.x / w) * 120 + 200) + ',90%,65%)'; ctx.fill(); } }`,
  orbits: `function (ctx, t, w, h) { ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, w, h); for (let i = 1; i <= 6; i++) { const a = t / (400 + i * 180); const r = i * Math.min(w, h) / 14; ctx.strokeStyle = 'rgba(148,163,184,0.25)'; ctx.beginPath(); ctx.arc(w / 2, h / 2, r, 0, 6.283); ctx.stroke(); ctx.beginPath(); ctx.arc(w / 2 + Math.cos(a) * r, h / 2 + Math.sin(a) * r, 3 + i / 2, 0, 6.283); ctx.fillStyle = 'hsl(' + i * 50 + ',85%,65%)'; ctx.fill(); } }`,
  starfield: `function (ctx, t, w, h, s) { if (!s.st) { s.st = Array.from({ length: 140 }, (_, i) => ({ x: ((i * 7919) % 1000) / 500 - 1, y: ((i * 104729) % 1000) / 500 - 1, z: (i % 100) / 100 + 0.01 })); } ctx.fillStyle = '#020617'; ctx.fillRect(0, 0, w, h); for (const q of s.st) { q.z -= 0.004; if (q.z <= 0.01) q.z = 1; const x = w / 2 + (q.x / q.z) * w / 4, y = h / 2 + (q.y / q.z) * h / 4; ctx.fillStyle = 'rgba(255,255,255,' + (1 - q.z) + ')'; ctx.fillRect(x, y, 2 - q.z, 2 - q.z); } }`,
};

export function defineWorkerCanvas(tag = 'usa-worker-canvas'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaWorkerCanvas extends Base {
        static get observedAttributes(): string[] {
          return ['scene', 'label'];
        }
        private _prog: DrawProgram | null = null;
        private _backend = 'none';
        get program(): DrawProgram | null {
          return this._prog;
        }
        set program(p: DrawProgram | null) {
          this._prog = p;
          if (this.isConnected) this.changed('program');
        }
        get backend(): string {
          return this._backend;
        }
        mount(): void {
          this.querySelectorAll(':scope > canvas[data-usa-part]').forEach((n) => n.remove());
          const scene = WORKER_SCENES[this.str('scene')] ? this.str('scene') : 'particles';
          this.setAttribute('role', 'img');
          this.setAttribute('aria-label', this.str('label', `Animated ${scene}`));
          const c = document.createElement('canvas');
          c.setAttribute('data-usa-part', '');
          c.width = Math.max(60, Math.round(this.clientWidth || 300));
          c.height = Math.max(40, Math.round(this.clientHeight || 160));
          this.prepend(c);
          const r = offscreenRender(c, this._prog || WORKER_SCENES[scene], { paused: this.reduced });
          this._backend = r.backend;
          this.setAttribute('data-usa-backend', r.backend);
          this.emit('backend', { backend: r.backend });
          this.onCleanup(() => r.stop());
        }
      }
      return UsaWorkerCanvas as unknown as CustomElementConstructor;
    },
    { id: 'worker-canvas', text: css }
  );
}
