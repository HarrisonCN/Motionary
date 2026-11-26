import { f as defineElement } from './base-SPDwWyB1.js';
import { d as defineMoName } from './mo-name-DT5wwaGR.js';
import { m as make } from './moments-Cg_NlOYG.js';
import { c as cleanColor } from './kit-DugHPVcq.js';
import { c as css } from './motion-kit-13-BNuKjO2V.js';

/** The share (0–1) of fully transparent pixels in RGBA `data`, sampling every `step`-th pixel. */
function clearedShare(data, step = 8) {
    const px = Math.floor(data.length / 4);
    if (!px)
        return 0;
    let seen = 0, clear = 0;
    for (let i = 0; i < px; i += Math.max(1, step)) {
        seen++;
        if (data[i * 4 + 3] < 32)
            clear++;
    }
    return seen ? clear / seen : 0;
}
function defineScratchCard(tag = 'usa-scratch-card') {
    const ctor = defineElement(tag, Base => class ScratchCard extends Base {
        constructor() {
            super(...arguments);
            this._done = false;
        }
        static get observedAttributes() { return ['color', 'label', 'reveal-label', 'threshold', 'brush']; }
        get revealed() { return this._done; }
        reveal() { this._reveal?.('button'); }
        mount() {
            const kids = Array.from(this.childNodes).filter((n) => !(n instanceof HTMLElement && n.classList.contains('usa-kit')));
            const root = make('div', 'usa-kit usa-scratch');
            root.toggleAttribute('data-static', this.reduced);
            const prize = make('div', 'usa-scratch-prize');
            prize.append(...kids);
            const canvas = make('canvas', 'usa-scratch-foil');
            canvas.setAttribute('aria-hidden', 'true');
            const hint = make('span', 'usa-scratch-hint', this.str('label', 'Scratch to reveal'));
            hint.setAttribute('aria-hidden', 'true');
            const btn = make('button', 'usa-scratch-btn', this.str('reveal-label', 'Reveal'));
            btn.type = 'button';
            root.append(prize, canvas, hint, btn);
            this.append(root);
            if (this._done) {
                root.setAttribute('data-revealed', '');
                btn.hidden = hint.hidden = true;
            }
            const ctx = (() => { try {
                return canvas.getContext('2d', { willReadFrequently: true });
            }
            catch {
                return null;
            } })();
            const foil = cleanColor(this.str('color')) || '#b8bcc6';
            const brush = Math.max(6, Math.min(80, this.num('brush', 22)));
            const threshold = Math.max(0.05, Math.min(0.95, this.num('threshold', 0.5)));
            let dpr = 1;
            const finish = (by) => {
                if (this._done)
                    return;
                this._done = true;
                root.setAttribute('data-revealed', '');
                btn.hidden = true;
                hint.hidden = true;
                this.emit('reveal', { by });
            };
            this._reveal = finish;
            const paint = () => {
                if (!ctx || this._done)
                    return;
                dpr = Math.min(2, window.devicePixelRatio || 1);
                const w = root.clientWidth || 300, h = root.clientHeight || 160;
                canvas.width = Math.round(w * dpr);
                canvas.height = Math.round(h * dpr);
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                ctx.globalCompositeOperation = 'source-over';
                const g = ctx.createLinearGradient(0, 0, w, h);
                g.addColorStop(0, foil);
                g.addColorStop(0.5, '#eef0f4');
                g.addColorStop(1, foil);
                ctx.fillStyle = g;
                ctx.fillRect(0, 0, w, h);
                // a fine diagonal sheen so it reads as foil
                ctx.strokeStyle = 'rgba(255,255,255,.25)';
                ctx.lineWidth = 1;
                for (let x = -h; x < w; x += 6) {
                    ctx.beginPath();
                    ctx.moveTo(x, h);
                    ctx.lineTo(x + h, 0);
                    ctx.stroke();
                }
            };
            if (!ctx) {
                root.setAttribute('data-nofoil', '');
            }
            let last = null;
            let moves = 0;
            const scratch = (x, y) => {
                if (!ctx)
                    return;
                ctx.globalCompositeOperation = 'destination-out';
                ctx.lineCap = ctx.lineJoin = 'round';
                ctx.lineWidth = brush;
                ctx.beginPath();
                if (last) {
                    ctx.moveTo(last.x, last.y);
                    ctx.lineTo(x, y);
                    ctx.stroke();
                }
                else {
                    ctx.arc(x, y, brush / 2, 0, Math.PI * 2);
                    ctx.fill();
                }
                last = { x, y };
                if (!this.reduced && moves % 3 === 0) {
                    const s = make('i', 'usa-scratch-spark');
                    s.style.left = `${x}px`;
                    s.style.top = `${y}px`;
                    s.style.setProperty('--dx', `${(moves * 37) % 30 - 15}px`);
                    root.append(s);
                    s.addEventListener('animationend', () => s.remove(), { once: true });
                }
                if (++moves % 12 === 0) {
                    try {
                        if (clearedShare(ctx.getImageData(0, 0, canvas.width, canvas.height).data, 16) >= threshold)
                            finish('scratch');
                    }
                    catch { /* tainted or unsupported */ }
                }
            };
            const pos = (e) => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
            let down = false;
            this.listen(canvas, 'pointerdown', (e) => {
                if (this._done)
                    return;
                down = true;
                last = null;
                try {
                    canvas.setPointerCapture(e.pointerId);
                }
                catch { /* synthetic */ }
                const p = pos(e);
                scratch(p.x, p.y);
                root.setAttribute('data-scratching', '');
            });
            this.listen(canvas, 'pointermove', (e) => { if (down && !this._done) {
                const p = pos(e);
                scratch(p.x, p.y);
            } });
            const up = () => { down = false; last = null; root.removeAttribute('data-scratching'); };
            this.listen(canvas, 'pointerup', up);
            this.listen(canvas, 'pointercancel', up);
            this.listen(btn, 'click', () => finish('button'));
            if (typeof ResizeObserver !== 'undefined') {
                const ro = new ResizeObserver(() => { if (!moves)
                    paint(); });
                ro.observe(root);
                this.onCleanup(() => ro.disconnect());
            }
            paint();
            this.onCleanup(() => {
                root.remove();
                this.append(...kids);
                this._reveal = undefined;
            });
        }
    }, { id: 'motion-kit-13', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { clearedShare as c, defineScratchCard as d };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/chunks/scratch-card-B_1xCIZy.js.map