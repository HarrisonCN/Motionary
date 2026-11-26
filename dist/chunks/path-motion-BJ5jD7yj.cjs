'use strict';

var base = require('./base-DzZEJhQB.cjs');
var moName = require('./mo-name-DR9ysd5S.cjs');
var moments = require('./moments-eoZA2npZ.cjs');
var kit = require('./kit-CujTUbPK.cjs');
var motionSurfaces = require('./motion-surfaces-BSXtpQ2Z.cjs');

const SVG = 'http://www.w3.org/2000/svg';
/** Keep only path-data characters (commands, numbers, separators); anything else makes the path empty. */
function cleanPathData(d) {
    const s = String(d ?? '').trim();
    return /^[MmLlHhVvCcSsQqTtAaZz0-9eE.,+\-\s]*$/.test(s) && /^[Mm]/.test(s) ? s : '';
}
function definePathMotion(tag = 'usa-path-motion') {
    const ctor = base.defineElement(tag, Base => class PathMotion extends Base {
        constructor() {
            super(...arguments);
            this._p = 0;
        }
        static get observedAttributes() { return ['path', 'trigger', 'duration', 'rotate', 'trace', 'spacing', 'show-path']; }
        get progress() { return Math.min(1, this._p); }
        set progress(p) { this._paint?.(Math.min(1, Math.max(0, Number(p) || 0))); }
        mount() {
            const kids = kit.ownChildren(this);
            const own = kids.find((k) => k.localName === 'svg' && k.querySelector('path'));
            const riders = kids.filter((k) => k !== own);
            const root = moments.make('div', 'usa-kit usa-path');
            let svg;
            let path;
            if (own) {
                svg = own;
                path = own.querySelector('path');
            }
            else {
                svg = document.createElementNS(SVG, 'svg');
                svg.setAttribute('viewBox', '0 0 100 100');
                svg.setAttribute('preserveAspectRatio', 'none');
                path = document.createElementNS(SVG, 'path');
                path.setAttribute('d', cleanPathData(this.str('path', 'M5 80 C 30 10, 70 10, 95 80')) || 'M5 80 C 30 10, 70 10, 95 80');
                path.setAttribute('vector-effect', 'non-scaling-stroke');
                svg.append(path);
            }
            svg.classList.add('usa-path-svg');
            svg.setAttribute('aria-hidden', 'true');
            path.classList.add('usa-path-line');
            root.toggleAttribute('data-show-path', this.flag('show-path') || this.flag('trace'));
            root.toggleAttribute('data-trace', this.flag('trace'));
            const layer = moments.make('div', 'usa-path-riders');
            const slots = riders.map((r) => { const s = moments.make('div', 'usa-path-rider'); s.append(r); layer.append(s); return s; });
            if (!slots.length) {
                const dot = moments.make('div', 'usa-path-rider');
                dot.append(moments.make('span', 'usa-path-dot'));
                dot.setAttribute('aria-hidden', 'true');
                layer.append(dot);
                slots.push(dot);
            }
            root.append(svg, layer);
            this.append(root);
            const total = typeof path.getTotalLength === 'function' ? (() => { try {
                return path.getTotalLength();
            }
            catch {
                return 0;
            } })() : 0;
            if (total) {
                path.style.strokeDasharray = `${total}`;
            }
            const spacing = Math.min(0.5, Math.max(0, this.num('spacing', 0.08)));
            const rotate = this.flag('rotate');
            // path user units → px inside root (handles viewBox scaling, including a non-uniform one)
            const toPx = (x, y) => {
                const vb = svg.viewBox?.baseVal;
                const w = svg.clientWidth || root.clientWidth, h = svg.clientHeight || root.clientHeight;
                if (!vb || !vb.width || !vb.height)
                    return { x, y };
                return { x: ((x - vb.x) / vb.width) * w, y: ((y - vb.y) / vb.height) * h };
            };
            const paint = (p) => {
                this._p = p;
                root.style.setProperty('--p', p.toFixed(4));
                if (this.flag('trace') && total)
                    path.style.strokeDashoffset = `${total * (1 - p)}`;
                slots.forEach((s, i) => {
                    const at = Math.min(1, Math.max(0, p - i * spacing));
                    if (!total) {
                        s.style.transform = `translate(${at * 100}%, 0)`;
                        return;
                    }
                    const len = at * total;
                    const pt = path.getPointAtLength(len);
                    const ahead = path.getPointAtLength(Math.min(total, len + 1));
                    const behind = path.getPointAtLength(Math.max(0, len - 1));
                    const a = toPx(pt.x, pt.y), b = toPx(ahead.x, ahead.y), c = toPx(behind.x, behind.y);
                    const angle = rotate ? (Math.atan2(b.y - c.y, b.x - c.x) * 180) / Math.PI : 0;
                    s.style.transform = `translate(${a.x.toFixed(1)}px, ${a.y.toFixed(1)}px) translate(-50%, -50%) rotate(${angle.toFixed(1)}deg)`;
                    s.style.opacity = p - i * spacing < 0 ? '0' : '';
                });
            };
            this._paint = paint;
            const trigger = ['scroll', 'loop', 'hover'].includes(this.str('trigger')) ? this.str('trigger') : 'view';
            const duration = Math.max(200, this.num('duration', 2400));
            const end = 1 + spacing * (slots.length - 1);
            let stop = null;
            const halt = () => { stop?.(); stop = null; };
            if (this.reduced) {
                paint(1);
            }
            else if (trigger === 'scroll') {
                let pending = 0;
                const update = () => {
                    pending = 0;
                    const r = root.getBoundingClientRect(), vh = window.innerHeight;
                    paint(Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height))) * end);
                };
                const queue = () => { if (!pending)
                    pending = base.raf(update); };
                this.listen(window, 'scroll', queue, { passive: true });
                this.listen(window, 'resize', queue, { passive: true });
                this.onCleanup(() => pending && base.caf(pending));
                update();
            }
            else {
                let t0 = 0, from = 0, paused = false, visible = false;
                const run = (loop) => {
                    halt();
                    t0 = base.now();
                    from = loop ? this._p / end : 0;
                    stop = base.onFrame(() => {
                        const t = (base.now() - t0) / duration + from;
                        if (loop)
                            paint((t % 1) * end);
                        else {
                            paint(kit.easeOut(Math.min(1, t)) * end);
                            if (t >= 1) {
                                halt();
                                this.emit('done');
                            }
                        }
                    }, this);
                };
                if (trigger === 'view') {
                    paint(0);
                    let seen = false;
                    this.inView((v) => { if (v && !seen) {
                        seen = true;
                        run(false);
                    } }, { threshold: 0.3 });
                }
                else if (trigger === 'hover') {
                    paint(0);
                    this.listen(root, 'pointerenter', () => { if (!stop)
                        run(true); });
                    this.listen(root, 'pointerleave', halt);
                }
                else {
                    const btn = moments.make('button', 'usa-path-pause');
                    btn.type = 'button';
                    root.append(btn);
                    const sync = () => { btn.setAttribute('aria-label', paused ? 'Play motion' : 'Pause motion'); btn.setAttribute('aria-pressed', String(paused)); root.toggleAttribute('data-paused', paused); };
                    const go = () => (visible && !paused ? (stop || run(true)) : halt());
                    this.listen(btn, 'click', () => { paused = !paused; sync(); go(); });
                    this.inView((v) => { visible = v; go(); });
                    sync();
                }
            }
            this.onCleanup(() => {
                halt();
                svg.classList.remove('usa-path-svg');
                path.classList.remove('usa-path-line');
                path.style.strokeDasharray = path.style.strokeDashoffset = '';
                this.append(...kids);
                root.remove();
                this._paint = undefined;
            });
        }
    }, { id: 'motion-surfaces', text: motionSurfaces.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.cleanPathData = cleanPathData;
exports.definePathMotion = definePathMotion;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/chunks/path-motion-BJ5jD7yj.cjs.map