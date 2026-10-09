'use strict';

var base = require('../chunks/base-B3me2y0o.cjs');
var shared = require('../chunks/shared-BxK1D7EZ.cjs');

var css = "usa-compare{position:relative;display:grid;overflow:hidden;border-radius:var(--usa-cmp-radius,14px);user-select:none;touch-action:pan-y;cursor:ew-resize;--usa-cmp-line:#fff;outline-offset:3px}usa-compare[data-orientation=\"vertical\"]{touch-action:pan-x;cursor:ns-resize}usa-compare>.usa-cmp-before,usa-compare>.usa-cmp-after{grid-area:1/1;display:block;width:100%;height:100%;object-fit:cover;pointer-events:none}.usa-cmp-handle{position:absolute;top:0;bottom:0;left:50%;width:0;z-index:2;pointer-events:none}.usa-cmp-handle::before{content:\"\";position:absolute;top:0;bottom:0;left:-1.5px;width:3px;background:var(--usa-cmp-line);box-shadow:0 0 8px rgba(0,0,0,.35)}usa-compare[data-orientation=\"vertical\"] .usa-cmp-handle{top:50%;bottom:auto;left:0;right:0;width:auto;height:0}usa-compare[data-orientation=\"vertical\"] .usa-cmp-handle::before{left:0;right:0;top:-1.5px;width:auto;height:3px}.usa-cmp-knob{position:absolute;top:50%;left:0;display:grid;place-items:center;width:40px;height:40px;margin:-20px 0 0 -20px;border-radius:50%;background:var(--usa-cmp-line);color:#111827;box-shadow:0 6px 18px rgba(0,0,0,.35);pointer-events:auto;cursor:grab;transition:transform .2s}usa-compare[data-orientation=\"vertical\"] .usa-cmp-knob{left:50%;top:0;transform:rotate(90deg)}usa-compare:active .usa-cmp-knob{transform:scale(.92)}usa-compare[data-orientation=\"vertical\"]:active .usa-cmp-knob{transform:rotate(90deg) scale(.92)}.usa-cmp-label{position:absolute;top:10px;z-index:1;padding:3px 9px;border-radius:999px;background:rgba(0,0,0,.55);color:#fff;font:600 12px/1.4 system-ui,sans-serif;pointer-events:none}.usa-cmp-label-b{left:10px}.usa-cmp-label-a{right:10px}";

function defineCompare(tag = 'usa-compare') {
    return base.defineElement(tag, (Base) => {
        class UsaCompare extends Base {
            constructor() {
                super(...arguments);
                this._p = 50;
                this._after = null;
                this._handle = null;
            }
            static get observedAttributes() {
                return ['orientation', 'labels'];
            }
            get position() {
                return this._p;
            }
            set position(v) {
                this.set(v, false);
            }
            get vertical() {
                return this.str('orientation', 'horizontal') === 'vertical';
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const [before, after] = shared.ownChildren(this);
                this.dataset.orientation = this.vertical ? 'vertical' : 'horizontal';
                before?.classList.add('usa-cmp-before');
                after?.classList.add('usa-cmp-after');
                this._after = after || null;
                const [lb, la] = this.str('labels', '').split(',').map((s) => s.trim());
                if (lb)
                    this.append(Object.assign(shared.part('span', 'usa-cmp-label usa-cmp-label-b', { 'aria-hidden': 'true' }), { textContent: lb }));
                if (la)
                    this.append(Object.assign(shared.part('span', 'usa-cmp-label usa-cmp-label-a', { 'aria-hidden': 'true' }), { textContent: la }));
                const h = shared.part('span', 'usa-cmp-handle', { 'aria-hidden': 'true' }, '<span class="usa-cmp-knob"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M9 6l-6 6 6 6M15 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>');
                this.append(h);
                this._handle = h;
                this.setAttribute('role', 'slider');
                this.tabIndex = 0;
                this.setAttribute('aria-valuemin', '0');
                this.setAttribute('aria-valuemax', '100');
                this.setAttribute('aria-orientation', this.vertical ? 'vertical' : 'horizontal');
                if (!this.hasAttribute('aria-label'))
                    this.setAttribute('aria-label', this.str('label', 'Compare before and after'));
                this.set(this.num('position', 50), false);
                let drag = false;
                const at = (e) => {
                    const r = this.getBoundingClientRect();
                    return this.vertical ? ((e.clientY - r.top) / (r.height || 1)) * 100 : ((e.clientX - r.left) / (r.width || 1)) * 100;
                };
                this.listen(this, 'pointerdown', (e) => {
                    drag = true;
                    this.setPointerCapture?.(e.pointerId);
                    this.set(at(e), true, !e.target.closest('.usa-cmp-handle'));
                });
                this.listen(this, 'pointermove', (e) => {
                    if (drag || this.flag('hover'))
                        this.set(at(e), true);
                });
                const up = () => (drag = false);
                this.listen(this, 'pointerup', up);
                this.listen(this, 'pointercancel', up);
                this.listen(this, 'keydown', (e) => {
                    const map = { ArrowLeft: -2, ArrowDown: -2, ArrowRight: 2, ArrowUp: 2, PageDown: -10, PageUp: 10 };
                    if (this.vertical)
                        Object.assign(map, { ArrowDown: 2, ArrowUp: -2 });
                    if (e.key === 'Home')
                        this.set(0, true);
                    else if (e.key === 'End')
                        this.set(100, true);
                    else if (e.key in map)
                        this.set(this._p + map[e.key], true);
                    else
                        return;
                    e.preventDefault();
                });
                if (this.flag('intro') && !this.reduced) {
                    let played = false;
                    this.inView((v) => {
                        if (!v || played)
                            return;
                        played = true;
                        const end = this._p;
                        const t0 = performance.now();
                        const step = (now) => {
                            const k = Math.min(1, (now - t0) / 1400);
                            this.paint(end + Math.sin(k * Math.PI * 2) * 22 * (1 - k));
                            if (k < 1 && typeof requestAnimationFrame === 'function')
                                requestAnimationFrame(step);
                            else
                                this.paint(end);
                        };
                        if (typeof requestAnimationFrame === 'function')
                            requestAnimationFrame(step);
                    }, { threshold: 0.5 });
                }
            }
            paint(p) {
                const v = shared.clampN(p, 0, 100);
                if (this._after)
                    this._after.style.clipPath = this.vertical ? `inset(${v}% 0 0 0)` : `inset(0 0 0 ${v}%)`;
                if (this._handle)
                    this._handle.style[this.vertical ? 'top' : 'left'] = `${v}%`;
                this.style.setProperty('--usa-cmp', `${v}%`);
            }
            set(p, user, ease = false) {
                const v = Math.round(shared.clampN(p, 0, 100) * 10) / 10;
                const from = this._p;
                this._p = v;
                this.setAttribute('aria-valuenow', String(Math.round(v)));
                this.setAttribute('aria-valuetext', `${Math.round(v)}%`);
                if (ease && !this.reduced && this._after && this._handle) {
                    const prop = this.vertical ? 'top' : 'left';
                    const clip = (x) => (this.vertical ? `inset(${x}% 0 0 0)` : `inset(0 0 0 ${x}%)`);
                    this.motion(this._after, [{ clipPath: clip(from) }, { clipPath: clip(v) }], { duration: 320, easing: 'cubic-bezier(.22,1,.36,1)' });
                    this.motion(this._handle, [{ [prop]: `${from}%` }, { [prop]: `${v}%` }], { duration: 320, easing: 'cubic-bezier(.22,1,.36,1)' });
                }
                this.paint(v);
                if (user && from !== v)
                    this.emit('change', { position: v });
            }
        }
        return UsaCompare;
    }, { id: 'compare', text: css });
}

exports.defineCompare = defineCompare;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.4.0/dist/widgets/compare.cjs.map