'use strict';

var base = require('./base-B3me2y0o.cjs');
var shared = require('./shared-BxK1D7EZ.cjs');

var css = "usa-skeleton-reveal{position:relative;display:block;--usa-sk-base:rgba(127,127,127,.16);--usa-sk-hi:rgba(255,255,255,.55)}usa-skeleton-reveal[data-loading]>:not(.usa-sk-layer){visibility:hidden}.usa-sk-layer{position:absolute;inset:0;pointer-events:none}.usa-sk-box{position:absolute;border-radius:6px;background:var(--usa-sk-base);overflow:hidden}usa-skeleton-reveal[data-variant=\"wave\"] .usa-sk-box{background:linear-gradient(100deg,var(--usa-sk-base) 30%,var(--usa-sk-hi) 50%,var(--usa-sk-base) 70%) var(--usa-sk-x,0) 0/var(--usa-sk-w,600px) 100% no-repeat,var(--usa-sk-base);animation:usa-sk-wave 1.4s linear infinite}usa-skeleton-reveal[data-variant=\"pulse\"] .usa-sk-box{animation:usa-sk-pulse 1.2s ease-in-out infinite alternate}usa-skeleton-reveal[data-variant=\"glow\"] .usa-sk-box{animation:usa-sk-glow 1.6s ease-in-out infinite alternate}@keyframes usa-sk-wave{from{background-position:calc(var(--usa-sk-x,0px) - var(--usa-sk-w,600px)) 0,0 0}to{background-position:calc(var(--usa-sk-x,0px) + var(--usa-sk-w,600px)) 0,0 0}}@keyframes usa-sk-pulse{from{opacity:1}to{opacity:.45}}@keyframes usa-sk-glow{from{box-shadow:0 0 0 rgba(124,92,255,0)}to{box-shadow:0 0 14px rgba(124,92,255,.45);background:rgba(124,92,255,.22)}}@media (prefers-color-scheme:dark){usa-skeleton-reveal{--usa-sk-hi:rgba(255,255,255,.16)}}@media (prefers-reduced-motion:reduce){.usa-sk-box{animation:none!important}}";

const SKELETON_VARIANTS = ['wave', 'pulse', 'glow'];
function defineSkeletonReveal(tag = 'usa-skeleton-reveal') {
    return base.defineElement(tag, (Base) => {
        class UsaSkeletonReveal extends Base {
            constructor() {
                super(...arguments);
                this._layer = null;
            }
            static get observedAttributes() {
                return ['loading', 'variant'];
            }
            get loading() {
                return this.flag('loading');
            }
            set loading(v) {
                this.setFlag('loading', v);
            }
            changed(name) {
                if (name === 'loading') {
                    if (this.loading)
                        this.build();
                    else
                        void this.reveal();
                    return;
                }
                super.changed(name);
            }
            mount() {
                const v = this.str('variant', 'wave');
                this.dataset.variant = SKELETON_VARIANTS.includes(v) ? v : 'wave';
                if (this.loading)
                    this.build();
                if (typeof ResizeObserver === 'function') {
                    const ro = new ResizeObserver(() => this.loading && this.build());
                    ro.observe(this);
                    this.onCleanup(() => ro.disconnect());
                }
                this.onCleanup(() => this._layer?.remove());
            }
            /** Measure the content and lay placeholders over it. */
            build() {
                this.setAttribute('aria-busy', 'true');
                this.setAttribute('data-loading', '');
                this._layer?.remove();
                const layer = shared.part('div', 'usa-sk-layer', { 'aria-hidden': 'true' });
                const host = this.getBoundingClientRect();
                const boxes = [];
                const add = (r, round = false) => {
                    if (r.width < 2 || r.height < 2)
                        return;
                    boxes.push([r.left - host.left, r.top - host.top, r.width, r.height, round]);
                };
                const marked = Array.from(this.querySelectorAll('[data-skeleton], img, svg, video, canvas, button, input'));
                for (const m of marked)
                    if (!m.closest('.usa-sk-layer'))
                        add(m.getBoundingClientRect(), m.dataset.skeleton === 'circle' || getComputedStyle(m).borderRadius === '50%');
                // text: one bar per rendered line (Range client rects), skipping marked elements
                const walker = document.createTreeWalker(this, NodeFilter.SHOW_TEXT);
                for (let n = walker.nextNode(); n; n = walker.nextNode()) {
                    if (!n.textContent?.trim() || (n.parentElement && marked.some((m) => m.contains(n.parentElement))))
                        continue;
                    const range = document.createRange();
                    range.selectNodeContents(n);
                    const rects = typeof range.getClientRects === 'function' ? Array.from(range.getClientRects()) : [];
                    for (const r of rects)
                        add({ left: r.left, top: r.top + r.height * 0.18, width: r.width, height: r.height * 0.64 });
                }
                for (const [x, y, w, h, round] of boxes) {
                    const b = document.createElement('span');
                    b.className = 'usa-sk-box';
                    b.style.cssText = `left:${x.toFixed(1)}px;top:${y.toFixed(1)}px;width:${w.toFixed(1)}px;height:${h.toFixed(1)}px;${round ? 'border-radius:50%' : ''}`;
                    b.style.setProperty('--usa-sk-x', `${(-x).toFixed(1)}px`);
                    layer.append(b);
                }
                this.append(layer);
                this._layer = layer;
            }
            reveal() {
                const layer = this._layer;
                this.removeAttribute('aria-busy');
                if (this.hasAttribute('loading'))
                    this.removeAttribute('loading');
                this._layer = null;
                if (!layer) {
                    this.removeAttribute('data-loading');
                    return Promise.resolve();
                }
                const boxes = Array.from(layer.children);
                const kids = Array.from(this.children).filter((c) => c !== layer);
                this.removeAttribute('data-loading');
                const done = [];
                if (this.reduced) {
                    const a = this.motion(layer, [{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: 'forwards' });
                    if (a)
                        done.push(a.finished);
                }
                else {
                    const top = Math.min(...boxes.map((b) => parseFloat(b.style.top) || 0), 0);
                    for (const b of boxes) {
                        const a = this.motion(b, [{ opacity: 1, transform: 'none', filter: 'blur(0)' }, { opacity: 0, transform: 'scale(1.04)', filter: 'blur(6px)' }], { duration: 420, delay: Math.min(500, ((parseFloat(b.style.top) || 0) - top) * 1.2), easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
                        if (a)
                            done.push(a.finished);
                    }
                    kids.forEach((k, i) => this.motion(k, [{ opacity: 0, filter: 'blur(8px)', transform: 'translateY(6px)' }, { opacity: 1, filter: 'blur(0)', transform: 'none' }], { duration: 520, delay: 60 + i * 70, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' }));
                }
                const end = () => {
                    layer.remove();
                    this.emit('reveal');
                };
                return Promise.all(done).then(end, end);
            }
        }
        return UsaSkeletonReveal;
    }, { id: 'skeleton-reveal', text: css });
}

exports.SKELETON_VARIANTS = SKELETON_VARIANTS;
exports.defineSkeletonReveal = defineSkeletonReveal;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.3.0/dist/chunks/skeleton-reveal-n4L3iur-.cjs.map