'use strict';

var base = require('../chunks/base-BG_mxssu.cjs');
var runtimeLink = require('../chunks/runtime-link-6mNrr9AF.cjs');
require('../chunks/registry-D3N8O2Nc.cjs');

var css = "usa-snap-carousel{display:block;position:relative;--usa-sc-size:80%;--usa-sc-gap:16px;--usa-sc-accent:#7c5cff}.usa-sc-viewport{overflow:hidden;border-radius:var(--usa-radius,14px);outline:none;cursor:grab}.usa-sc-viewport:focus-visible{box-shadow:0 0 0 2px var(--usa-sc-accent)}usa-snap-carousel[data-dragging] .usa-sc-viewport{cursor:grabbing}.usa-sc-track{display:flex;gap:var(--usa-sc-gap);will-change:transform;user-select:none;-webkit-user-select:none}.usa-sc-track>*{flex:0 0 var(--usa-sc-size);min-width:0;box-sizing:border-box;transition:opacity .3s,transform .3s}.usa-sc-track img{pointer-events:none;-webkit-user-drag:none}usa-snap-carousel:not([data-ready]) .usa-sc-viewport{overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:thin}usa-snap-carousel:not([data-ready]) .usa-sc-track>*{scroll-snap-align:center}usa-snap-carousel[data-ready] .usa-sc-track>:not([data-active]){opacity:.55;transform:scale(.94)}.usa-sc-nav{position:absolute;top:calc(50% - 18px);z-index:2;width:36px;height:36px;border-radius:50%;border:0;background:rgba(255,255,255,.9);color:#111;font:600 20px/1 system-ui;cursor:pointer;display:grid;place-items:center;box-shadow:0 4px 14px rgba(0,0,0,.18)}.usa-sc-nav:disabled{opacity:.35;cursor:default}.usa-sc-nav:focus-visible,.usa-sc-dot:focus-visible{outline:2px solid var(--usa-sc-accent);outline-offset:2px}.usa-sc-prev{left:8px}.usa-sc-next{right:8px}.usa-sc-dots{display:flex;justify-content:center;gap:6px;padding-top:10px}.usa-sc-dot{width:8px;height:8px;padding:0;border:0;border-radius:99px;background:color-mix(in srgb,currentColor 30%,transparent);cursor:pointer;transition:width .3s,background .3s}.usa-sc-dot[aria-current=\"true\"]{width:22px;background:var(--usa-sc-accent)}.usa-sc-live{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;margin:0}@media (prefers-reduced-motion:reduce){.usa-sc-track>*,.usa-sc-dot{transition:none}}";

function defineSnapCarousel(tag = 'usa-snap-carousel') {
    return base.defineElement(tag, (Base) => {
        class UsaSnapCarousel extends Base {
            constructor() {
                super(...arguments);
                this.slides = [];
                this.ds = null;
                this.cur = 0;
                this.sync = null;
            }
            static get observedAttributes() {
                return ['align', 'gap', 'autoplay', 'no-controls', 'no-dots', 'label', 'index'];
            }
            get length() {
                return this.slides.length;
            }
            get index() {
                return this.cur;
            }
            set index(v) {
                this.goTo(v);
            }
            get controller() {
                return this.ds;
            }
            next() {
                this.goTo(this.cur + 1 >= this.length ? 0 : this.cur + 1);
            }
            prev() {
                this.goTo(this.cur - 1 < 0 ? this.length - 1 : this.cur - 1);
            }
            goTo(i, animate = true) {
                const n = Math.max(0, Math.min(this.length - 1, Math.round(i)));
                if (this.ds)
                    this.ds.snapTo(n, animate && !this.reduced);
                else {
                    this.slides[n]?.scrollIntoView?.({ block: 'nearest', inline: 'center' });
                    this.set(n);
                }
            }
            set(n) {
                if (n === this.cur && this.dataset.ready !== undefined)
                    return this.sync?.();
                const from = this.cur;
                this.cur = n;
                this.sync?.();
                if (from !== n)
                    this.emit('change', { index: n, from });
            }
            mount() {
                // structure first (works without the runtime as a CSS scroll-snap strip)
                let vp = this.querySelector(':scope > .usa-sc-viewport');
                let track = vp?.querySelector(':scope > .usa-sc-track') || null;
                if (!vp || !track) {
                    vp = document.createElement('div');
                    vp.className = 'usa-sc-viewport';
                    track = document.createElement('div');
                    track.className = 'usa-sc-track';
                    for (const c of Array.from(this.children))
                        if (c instanceof HTMLElement && !c.matches('.usa-rt-missing, .usa-sc-ui'))
                            track.append(c);
                    vp.append(track);
                    this.append(vp);
                }
                this.querySelectorAll(':scope > .usa-sc-ui').forEach((x) => x.remove());
                this.slides = Array.from(track.children);
                const N = this.slides.length;
                this.setAttribute('role', 'region');
                this.setAttribute('aria-roledescription', 'carousel');
                this.setAttribute('aria-label', this.str('label', 'Carousel'));
                vp.tabIndex = 0;
                vp.setAttribute('aria-label', `${this.str('label', 'Carousel')} — use the arrow keys`);
                this.style.setProperty('--usa-sc-gap', `${this.num('gap', 16)}px`);
                this.slides.forEach((s, i) => {
                    s.setAttribute('role', 'group');
                    s.setAttribute('aria-roledescription', 'slide');
                    s.setAttribute('aria-label', `${i + 1} of ${N}`);
                });
                const live = document.createElement('p');
                live.className = 'usa-sc-ui usa-sc-live';
                live.setAttribute('aria-live', 'polite');
                this.append(live);
                let prevB = null, nextB = null;
                if (!this.flag('no-controls') && N > 1) {
                    const mk = (cls, label, glyph, fn) => {
                        const b = document.createElement('button');
                        b.type = 'button';
                        b.className = `usa-sc-ui usa-sc-nav ${cls}`;
                        b.setAttribute('aria-label', label);
                        b.textContent = glyph;
                        this.listen(b, 'click', fn);
                        this.append(b);
                        return b;
                    };
                    prevB = mk('usa-sc-prev', 'Previous slide', '‹', () => this.goTo(this.cur - 1));
                    nextB = mk('usa-sc-next', 'Next slide', '›', () => this.goTo(this.cur + 1));
                }
                const dots = [];
                if (!this.flag('no-dots') && N > 1) {
                    const nav = document.createElement('div');
                    nav.className = 'usa-sc-ui usa-sc-dots';
                    nav.setAttribute('role', 'group');
                    nav.setAttribute('aria-label', 'Choose a slide');
                    this.slides.forEach((_, i) => {
                        const d = document.createElement('button');
                        d.type = 'button';
                        d.className = 'usa-sc-dot';
                        d.setAttribute('aria-label', `Go to slide ${i + 1}`);
                        this.listen(d, 'click', () => this.goTo(i));
                        nav.append(d);
                        dots.push(d);
                    });
                    this.append(nav);
                }
                let announce = false;
                this.sync = () => {
                    dots.forEach((d, i) => d.setAttribute('aria-current', String(i === this.cur)));
                    if (prevB)
                        prevB.disabled = this.cur <= 0;
                    if (nextB)
                        nextB.disabled = this.cur >= N - 1;
                    this.slides.forEach((s, i) => s.toggleAttribute('data-active', i === this.cur));
                    if (announce)
                        live.textContent = `Slide ${this.cur + 1} of ${N}`;
                };
                this.listen(vp, 'keydown', (e) => {
                    const k = e.key;
                    const to = k === 'ArrowRight' ? this.cur + 1 : k === 'ArrowLeft' ? this.cur - 1 : k === 'Home' ? 0 : k === 'End' ? N - 1 : null;
                    if (to === null)
                        return;
                    e.preventDefault();
                    announce = true;
                    this.goTo(to);
                });
                this.listen(this, 'click', (e) => {
                    if (e.target?.closest?.('.usa-sc-nav, .usa-sc-dot'))
                        announce = true;
                }, { capture: true });
                const DS = runtimeLink.runtimeModule(this, 'drag-snap');
                const start = Math.max(0, Math.min(N - 1, this.num('index', 0)));
                this.cur = start;
                if (!DS) {
                    this.sync();
                    return;
                }
                this.dataset.ready = '';
                const center = this.str('align', 'center') !== 'start';
                const measure = () => {
                    const vw = vp.clientWidth;
                    const max = Math.max(0, track.scrollWidth - vw);
                    return this.slides.map((s) => {
                        const p = -(s.offsetLeft - (center ? (vw - s.offsetWidth) / 2 : 0));
                        return center ? p : Math.max(-max, Math.min(0, p));
                    });
                };
                const apply = (p) => (track.style.transform = `translate3d(${p.toFixed(2)}px,0,0)`);
                const ds = DS.createDragSnap(track, {
                    axis: 'x',
                    snap: measure(),
                    reducedMotion: this.reduced,
                    onUpdate: apply,
                    onSnap: (i) => this.set(i),
                    onDragStart: () => this.toggleAttribute('data-dragging', true),
                    onDragEnd: () => this.toggleAttribute('data-dragging', false),
                });
                this.ds = ds;
                ds.snapTo(start, false);
                this.set(start);
                this.onCleanup(() => {
                    ds.dispose();
                    this.ds = null;
                    track.style.transform = '';
                });
                const remeasure = () => ds.setSnapPoints(measure());
                this.listen(window, 'resize', remeasure, { passive: true });
                if (typeof ResizeObserver === 'function') {
                    const ro = new ResizeObserver(remeasure);
                    ro.observe(vp);
                    this.onCleanup(() => ro.disconnect());
                }
                // autoplay: paused on hover / focus / press / off screen; never under reduced motion
                const every = this.num('autoplay', 0);
                if (every > 0 && N > 1 && !this.reduced) {
                    let hold = 0, seen = true;
                    const h = (d) => () => (hold = Math.max(0, hold + d));
                    this.listen(this, 'pointerenter', h(1));
                    this.listen(this, 'pointerleave', h(-1));
                    this.listen(this, 'focusin', h(1));
                    this.listen(this, 'focusout', h(-1));
                    this.inView((v) => (seen = v));
                    const t = setInterval(() => {
                        if (!hold && seen && !ds.dragging)
                            this.goTo(this.cur + 1 >= N ? 0 : this.cur + 1);
                    }, Math.max(1200, every));
                    this.onCleanup(() => clearInterval(t));
                }
            }
            unmount() {
                this.removeAttribute('data-ready');
                this.removeAttribute('data-dragging');
            }
        }
        return UsaSnapCarousel;
    }, { id: 'snap-carousel', text: css });
}

exports.defineSnapCarousel = defineSnapCarousel;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.0.1/dist/components/snap-carousel.cjs.map