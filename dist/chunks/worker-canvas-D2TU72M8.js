import { f as defineElement } from './base-CBMzOs1k.js';
import { offscreenRender } from '../components/fx-perf.js';

var css = "usa-worker-canvas{position:relative;display:block;height:160px;border-radius:12px;overflow:hidden;background:#0f172a}usa-worker-canvas>canvas{display:block;width:100%;height:100%}";

const WORKER_SCENES = {
    particles: `function (ctx, t, w, h, s) { if (!s.p) { s.p = Array.from({ length: 90 }, (_, i) => ({ x: (i * 97) % w, y: (i * 53) % h, vx: Math.cos(i) * 0.6, vy: Math.sin(i * 1.3) * 0.6, r: 1 + (i % 3) })); } ctx.fillStyle = 'rgba(15,23,42,0.25)'; ctx.fillRect(0, 0, w, h); for (const q of s.p) { q.x = (q.x + q.vx + w) % w; q.y = (q.y + q.vy + h) % h; ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, 6.283); ctx.fillStyle = 'hsl(' + ((q.x / w) * 120 + 200) + ',90%,65%)'; ctx.fill(); } }`,
    orbits: `function (ctx, t, w, h) { ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, w, h); for (let i = 1; i <= 6; i++) { const a = t / (400 + i * 180); const r = i * Math.min(w, h) / 14; ctx.strokeStyle = 'rgba(148,163,184,0.25)'; ctx.beginPath(); ctx.arc(w / 2, h / 2, r, 0, 6.283); ctx.stroke(); ctx.beginPath(); ctx.arc(w / 2 + Math.cos(a) * r, h / 2 + Math.sin(a) * r, 3 + i / 2, 0, 6.283); ctx.fillStyle = 'hsl(' + i * 50 + ',85%,65%)'; ctx.fill(); } }`,
    starfield: `function (ctx, t, w, h, s) { if (!s.st) { s.st = Array.from({ length: 140 }, (_, i) => ({ x: ((i * 7919) % 1000) / 500 - 1, y: ((i * 104729) % 1000) / 500 - 1, z: (i % 100) / 100 + 0.01 })); } ctx.fillStyle = '#020617'; ctx.fillRect(0, 0, w, h); for (const q of s.st) { q.z -= 0.004; if (q.z <= 0.01) q.z = 1; const x = w / 2 + (q.x / q.z) * w / 4, y = h / 2 + (q.y / q.z) * h / 4; ctx.fillStyle = 'rgba(255,255,255,' + (1 - q.z) + ')'; ctx.fillRect(x, y, 2 - q.z, 2 - q.z); } }`,
};
/** The built-in scenes as functions — the main-thread fallback when no worker / OffscreenCanvas is available (11.0: strings are never evaluated on the main thread). Same drawing as `WORKER_SCENES`. */
const WORKER_SCENE_FNS = {
    particles(ctx, _t, w, h, s) {
        if (!s.p)
            s.p = Array.from({ length: 90 }, (_, i) => ({ x: (i * 97) % w, y: (i * 53) % h, vx: Math.cos(i) * 0.6, vy: Math.sin(i * 1.3) * 0.6, r: 1 + (i % 3) }));
        ctx.fillStyle = 'rgba(15,23,42,0.25)';
        ctx.fillRect(0, 0, w, h);
        for (const q of s.p) {
            q.x = (q.x + q.vx + w) % w;
            q.y = (q.y + q.vy + h) % h;
            ctx.beginPath();
            ctx.arc(q.x, q.y, q.r, 0, 6.283);
            ctx.fillStyle = 'hsl(' + ((q.x / w) * 120 + 200) + ',90%,65%)';
            ctx.fill();
        }
    },
    orbits(ctx, t, w, h) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, w, h);
        for (let i = 1; i <= 6; i++) {
            const a = t / (400 + i * 180);
            const r = (i * Math.min(w, h)) / 14;
            ctx.strokeStyle = 'rgba(148,163,184,0.25)';
            ctx.beginPath();
            ctx.arc(w / 2, h / 2, r, 0, 6.283);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(w / 2 + Math.cos(a) * r, h / 2 + Math.sin(a) * r, 3 + i / 2, 0, 6.283);
            ctx.fillStyle = 'hsl(' + i * 50 + ',85%,65%)';
            ctx.fill();
        }
    },
    starfield(ctx, _t, w, h, s) {
        if (!s.st)
            s.st = Array.from({ length: 140 }, (_, i) => ({ x: ((i * 7919) % 1000) / 500 - 1, y: ((i * 104729) % 1000) / 500 - 1, z: (i % 100) / 100 + 0.01 }));
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, w, h);
        for (const q of s.st) {
            q.z -= 0.004;
            if (q.z <= 0.01)
                q.z = 1;
            const x = w / 2 + ((q.x / q.z) * w) / 4, y = h / 2 + ((q.y / q.z) * h) / 4;
            ctx.fillStyle = 'rgba(255,255,255,' + (1 - q.z) + ')';
            ctx.fillRect(x, y, 2 - q.z, 2 - q.z);
        }
    },
};
function defineWorkerCanvas(tag = 'usa-worker-canvas') {
    return defineElement(tag, (Base) => {
        class UsaWorkerCanvas extends Base {
            constructor() {
                super(...arguments);
                this._prog = null;
                this._backend = 'none';
            }
            static get observedAttributes() {
                return ['scene', 'label'];
            }
            get program() {
                return this._prog;
            }
            set program(p) {
                this._prog = p;
                if (this.isConnected)
                    this.changed('program');
            }
            get backend() {
                return this._backend;
            }
            mount() {
                this.querySelectorAll(':scope > canvas[data-usa-part]').forEach((n) => n.remove());
                const scene = WORKER_SCENES[this.str('scene')] ? this.str('scene') : 'particles';
                this.setAttribute('role', 'img');
                this.setAttribute('aria-label', this.str('label', `Animated ${scene}`));
                const c = document.createElement('canvas');
                c.setAttribute('data-usa-part', '');
                c.width = Math.max(60, Math.round(this.clientWidth || 300));
                c.height = Math.max(40, Math.round(this.clientHeight || 160));
                this.prepend(c);
                const r = offscreenRender(c, this._prog || WORKER_SCENES[scene], { paused: this.reduced, fallback: this._prog ? undefined : WORKER_SCENE_FNS[scene] });
                this._backend = r.backend;
                this.setAttribute('data-usa-backend', r.backend);
                this.emit('backend', { backend: r.backend });
                this.onCleanup(() => r.stop());
            }
        }
        return UsaWorkerCanvas;
    }, { id: 'worker-canvas', text: css });
}

export { WORKER_SCENES as W, WORKER_SCENE_FNS as a, defineWorkerCanvas as d };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.0.2/dist/chunks/worker-canvas-D2TU72M8.js.map