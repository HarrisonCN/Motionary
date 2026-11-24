import { f as defineElement, r as raf, b as caf, n as now } from './base-SPDwWyB1.js';
import { d as defineMoName } from './mo-name-DT5wwaGR.js';
import { m as make } from './moments-Cg_NlOYG.js';
import { o as ownChildren, c as cleanColor } from './kit-DugHPVcq.js';
import { c as css } from './motion-kit-12-C9izfNaB.js';

/**
 * How strongly a dot `dist` px from a ripple's centre is lit `t` ms after it started: a ring of `width` px that travels
 * at `speed` px/ms and fades out as it grows. 0–1.
 */
function rippleAt(dist, t, speed = 0.5, width = 60, life = 1600) {
    if (t < 0 || t > life)
        return 0;
    const front = t * speed;
    const d = Math.abs(dist - front);
    if (d > width)
        return 0;
    return (1 - d / width) * (1 - t / life);
}
function defineRippleGrid(tag = 'usa-ripple-grid') {
    const ctor = defineElement(tag, Base => class RippleGrid extends Base {
        static get observedAttributes() { return ['gap', 'dot', 'color', 'accent', 'auto', 'label']; }
        ripple(x, y) { this._ripple?.(x, y); }
        mount() {
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
            const waves = [];
            const colors = () => {
                const cs = getComputedStyle(root);
                return { dot: cleanColor(this.str('color')) || cs.getPropertyValue('--ripple-dot').trim() || 'rgba(127,127,127,.35)', hot: cleanColor(this.str('accent')) || cs.getPropertyValue('--ripple-hot').trim() || '#6366f1' };
            };
            let pal = { dot: '', hot: '' };
            const paint = () => {
                id = 0;
                if (!ctx || !w || !h)
                    return;
                const t = now();
                while (waves.length && t - waves[0].t > 1600)
                    waves.shift();
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                ctx.clearRect(0, 0, w, h);
                for (let y = gap / 2; y < h; y += gap) {
                    for (let x = gap / 2; x < w; x += gap) {
                        let k = 0;
                        for (const wv of waves)
                            k = Math.max(k, rippleAt(Math.hypot(x - wv.x, y - wv.y), t - wv.t));
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = k > 0.02 ? pal.hot : pal.dot;
                        if (k > 0.02)
                            ctx.globalAlpha = 0.35 + k * 0.65;
                        ctx.beginPath();
                        ctx.arc(x, y, dotR * (1 + k * 1.6), 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
                if (waves.length && visible && !this.reduced)
                    id = raf(paint, this);
            };
            const size = () => {
                const r = root.getBoundingClientRect();
                dpr = Math.min(2, window.devicePixelRatio || 1);
                w = r.width;
                h = r.height;
                canvas.width = Math.round(w * dpr);
                canvas.height = Math.round(h * dpr);
                pal = colors();
                if (!id)
                    paint();
            };
            const start = (x, y) => {
                this.emit('ripple', { x: Math.round(x), y: Math.round(y) });
                if (this.reduced)
                    return;
                waves.push({ x, y, t: now() });
                if (waves.length > 6)
                    waves.shift();
                if (!id)
                    id = raf(paint, this);
            };
            this._ripple = (x, y) => start(x ?? w / 2, y ?? h / 2);
            this.listen(root, 'pointerdown', (e) => {
                if (e.target.closest('a, button, input, select, textarea, label'))
                    return;
                const r = root.getBoundingClientRect();
                start(e.clientX - r.left, e.clientY - r.top);
            });
            this.listen(root, 'keydown', (e) => {
                if (e.target !== root || (e.key !== 'Enter' && e.key !== ' '))
                    return;
                e.preventDefault();
                start(w / 2, h / 2);
            });
            const every = Math.max(0, this.num('auto', 0));
            if (every) {
                const timer = setInterval(() => { if (visible && !this.reduced)
                    start(Math.random() * w, Math.random() * h); }, Math.max(600, every));
                this.onCleanup(() => clearInterval(timer));
            }
            if (typeof ResizeObserver !== 'undefined') {
                const ro = new ResizeObserver(size);
                ro.observe(root);
                this.onCleanup(() => ro.disconnect());
            }
            this.inView((v) => { visible = v; if (v && waves.length && !id)
                id = raf(paint, this); });
            this.onCleanup(() => { caf(id); id = 0; waves.length = 0; this.append(...kids); root.remove(); this._ripple = undefined; });
            size();
        }
    }, { id: 'motion-kit-12', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineRippleGrid as d, rippleAt as r };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/chunks/ripple-grid-DLiasgki.js.map