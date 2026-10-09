'use strict';

var base = require('../chunks/base-DBheNxJu.cjs');
var spring = require('../chunks/spring-BlTQD2AV.cjs');
var player = require('../chunks/player-C4y4jXSv.cjs');
var registry = require('../chunks/registry-xQZnSqqV.cjs');
require('../chunks/builtins-CKKZNR95.cjs');
var components_fxShop = require('./fx-shop.cjs');
var components_engine = require('./engine.cjs');
var components_fxOrganic = require('./fx-organic.cjs');
var components_fxPaper = require('./fx-paper.cjs');
var components_fxSurface = require('./fx-surface.cjs');
var components_fxGesture = require('./fx-gesture.cjs');
var components_fxSpatial = require('./fx-spatial.cjs');
var components_dsl = require('./dsl.cjs');
var components_marketplace = require('./marketplace.cjs');
var components_fxCinema = require('./fx-cinema.cjs');
var components_fxLottie = require('./fx-lottie.cjs');
var components_fxGenart = require('./fx-genart.cjs');
var components_fxVideo = require('./fx-video.cjs');
var components_fxSafe = require('./fx-safe.cjs');
var components_fxPerf = require('./fx-perf.cjs');
var components_design = require('./design.cjs');
var components_native = require('./native.cjs');
var registry$1 = require('../chunks/registry-tzwKkldE.cjs');
require('../chunks/core-MQlXZKUG.cjs');
require('./tokens.cjs');
require('../chunks/fx-B_pbhpDp.cjs');
require('../chunks/manifest-PaF9B8Vt.cjs');

/** Helpers shared by the 6.x widgets (`motionary/components/widgets`). */
const clampN = (v, a, b) => Math.min(b, Math.max(a, v));
/** Children of `el` that are elements and not created by the widget itself. */
const ownChildren = (el, skip = '[data-usa-part]') => Array.from(el.children).filter((c) => c instanceof HTMLElement && !c.matches(skip));
/** Create a part element (marked so re-mounts can find / skip it). */
function part(tag, cls, attrs = {}, html = '') {
    const n = document.createElement(tag);
    n.className = cls;
    n.setAttribute('data-usa-part', '');
    for (const [k, v] of Object.entries(attrs))
        n.setAttribute(k, v);
    if (html)
        n.innerHTML = html;
    return n;
}
/** Remove the parts a previous mount created. */
const dropParts = (el) => el.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
let uid$4 = 0;
/** A document-unique id with a prefix. */
const nextId = (p) => `${p}-${++uid$4}`;
/** Roving arrow-key focus over `items` (horizontal or vertical); returns the new index or -1. */
function arrowIndex(e, i, n, vertical = false) {
    const prev = vertical ? 'ArrowUp' : 'ArrowLeft';
    const next = vertical ? 'ArrowDown' : 'ArrowRight';
    if (e.key === prev)
        return (i - 1 + n) % n;
    if (e.key === next)
        return (i + 1) % n;
    if (e.key === 'Home')
        return 0;
    if (e.key === 'End')
        return n - 1;
    return -1;
}

var css$1E = "usa-carousel{display:block;position:relative;--usa-carousel-dur:520ms;--usa-carousel-ease:cubic-bezier(.22,1,.36,1);overflow:hidden;border-radius:var(--usa-radius,14px);touch-action:pan-y}.usa-carousel-viewport{position:relative;overflow:hidden;height:100%;min-height:inherit}.usa-carousel-track{display:flex;height:100%;transition:transform var(--usa-carousel-dur) var(--usa-carousel-ease);will-change:transform}.usa-carousel-track>*{flex:0 0 100%;min-width:0;box-sizing:border-box}usa-carousel:not([data-effect=\"slide\"]) .usa-carousel-track{display:grid}usa-carousel:not([data-effect=\"slide\"]) .usa-carousel-track>*{grid-area:1/1;transition:opacity var(--usa-carousel-dur) ease,transform var(--usa-carousel-dur) var(--usa-carousel-ease),filter var(--usa-carousel-dur) ease}usa-carousel[data-effect=\"cards\"] .usa-carousel-viewport{perspective:900px}usa-carousel[data-dragging] .usa-carousel-track,usa-carousel[data-dragging] .usa-carousel-track>*{transition:none}.usa-carousel-nav{position:absolute;top:50%;translate:0 -50%;z-index:2;width:36px;height:36px;border-radius:50%;border:0;background:rgba(255,255,255,.85);color:#111;font:600 18px/1 system-ui;cursor:pointer;display:grid;place-items:center;box-shadow:0 4px 14px rgba(0,0,0,.18);transition:transform .2s}.usa-carousel-nav:hover{transform:scale(1.08)}.usa-carousel-nav:focus-visible{outline:2px solid #7c5cff;outline-offset:2px}.usa-carousel-prev{left:10px}.usa-carousel-next{right:10px}.usa-carousel-dots{position:absolute;left:0;right:0;bottom:10px;display:flex;justify-content:center;gap:6px;z-index:2}.usa-carousel-dot{width:8px;height:8px;padding:0;border:0;border-radius:99px;background:rgba(255,255,255,.55);cursor:pointer;transition:width .35s var(--usa-carousel-ease),background .35s}.usa-carousel-dot[aria-current=\"true\"]{width:22px;background:#fff}@media (prefers-reduced-motion:reduce){usa-carousel .usa-carousel-track,usa-carousel .usa-carousel-track>*,.usa-carousel-dot{transition:none!important}}usa-carousel[data-reduced] .usa-carousel-track,usa-carousel[data-reduced] .usa-carousel-track>*{transition:none!important}";

const CAROUSEL_EFFECTS = ['slide', 'fade', 'scale', 'cards'];
function defineCarousel(tag = 'usa-carousel') {
    return base.defineElement(tag, (Base) => {
        class UsaCarousel extends Base {
            constructor() {
                super(...arguments);
                this._i = 0;
                this._slides = [];
                this._track = null;
                this._timer = 0;
                this._hold = false;
                this._dots = [];
            }
            static get observedAttributes() {
                return ['effect', 'autoplay', 'loop', 'no-controls', 'no-dots'];
            }
            get length() {
                return this._slides.length;
            }
            get index() {
                return this._i;
            }
            set index(v) {
                this.goTo(v);
            }
            get effect() {
                const e = this.str('effect', 'slide');
                return CAROUSEL_EFFECTS.includes(e) ? e : 'slide';
            }
            mount() {
                this.dataset.effect = this.effect; // (not the observed attribute: no re-mount loop)
                this.toggleAttribute('data-reduced', this.reduced);
                const old = this.querySelector(':scope > .usa-carousel-viewport');
                this._slides = old ? ownChildren(old.firstElementChild) : ownChildren(this);
                dropParts(this);
                const vp = part('div', 'usa-carousel-viewport', { 'aria-live': this.num('autoplay', 0) ? 'off' : 'polite' });
                const track = part('div', 'usa-carousel-track');
                this._track = track;
                vp.append(track);
                const n = this._slides.length;
                this._slides.forEach((s, i) => {
                    s.setAttribute('role', 'group');
                    s.setAttribute('aria-roledescription', 'slide');
                    s.setAttribute('aria-label', `${i + 1} of ${n}`);
                    track.append(s);
                });
                this.prepend(vp);
                this.setAttribute('role', 'region');
                this.setAttribute('aria-roledescription', 'carousel');
                this.setAttribute('aria-label', this.str('label', 'Carousel'));
                if (!this.hasAttribute('tabindex'))
                    this.tabIndex = 0;
                if (n > 1 && !this.flag('no-controls')) {
                    const prev = part('button', 'usa-carousel-nav usa-carousel-prev', { type: 'button', 'aria-label': 'Previous slide' }, '‹');
                    const next = part('button', 'usa-carousel-nav usa-carousel-next', { type: 'button', 'aria-label': 'Next slide' }, '›');
                    this.listen(prev, 'click', () => this.prev());
                    this.listen(next, 'click', () => this.next());
                    this.append(prev, next);
                }
                this._dots = [];
                if (n > 1 && !this.flag('no-dots')) {
                    const dots = part('div', 'usa-carousel-dots', { role: 'group', 'aria-label': 'Choose slide' });
                    for (let i = 0; i < n; i++) {
                        const d = part('button', 'usa-carousel-dot', { type: 'button', 'aria-label': `Slide ${i + 1}` });
                        this.listen(d, 'click', () => this.goTo(i));
                        this._dots.push(d);
                        dots.append(d);
                    }
                    this.append(dots);
                }
                this._i = clampN(Math.round(this.num('index', 0)), 0, Math.max(0, n - 1));
                this.layout(0);
                this.listen(this, 'keydown', (e) => {
                    if (e.key === 'ArrowRight')
                        (e.preventDefault(), this.next());
                    else if (e.key === 'ArrowLeft')
                        (e.preventDefault(), this.prev());
                });
                this.drag(vp);
                const ms = this.num('autoplay', 0);
                if (ms > 0 && n > 1 && !this.reduced) {
                    let visible = true;
                    this.inView((v) => (visible = v));
                    const pause = (on) => () => (this._hold = on);
                    this.listen(this, 'pointerenter', pause(true));
                    this.listen(this, 'pointerleave', pause(false));
                    this.listen(this, 'focusin', pause(true));
                    this.listen(this, 'focusout', pause(false));
                    this._timer = window.setInterval(() => {
                        if (visible && !this._hold && !document.hidden)
                            this.next();
                    }, Math.max(1200, ms));
                    this.onCleanup(() => clearInterval(this._timer));
                }
            }
            drag(vp) {
                let x0 = 0;
                let dx = 0;
                let id = -1;
                this.listen(vp, 'pointerdown', (e) => {
                    if (this.length < 2 || e.target.closest('button,a,input'))
                        return;
                    id = e.pointerId;
                    x0 = e.clientX;
                    dx = 0;
                    this.setAttribute('data-dragging', '');
                });
                this.listen(window, 'pointermove', (e) => {
                    if (e.pointerId !== id)
                        return;
                    dx = e.clientX - x0;
                    this.layout(dx / Math.max(1, vp.clientWidth));
                });
                const end = (e) => {
                    if (e.pointerId !== id)
                        return;
                    id = -1;
                    this.removeAttribute('data-dragging');
                    const w = Math.max(1, vp.clientWidth);
                    if (Math.abs(dx) > w * 0.18)
                        dx < 0 ? this.next() : this.prev();
                    else
                        this.layout(0);
                };
                this.listen(window, 'pointerup', end);
                this.listen(window, 'pointercancel', end);
            }
            /** Position the slides (`drag` = fraction of a slide the pointer moved). */
            layout(drag) {
                const n = this.length;
                const i = this._i;
                const fx = this.effect;
                if (this._track)
                    this._track.style.transform = fx === 'slide' ? `translateX(${(-i + drag) * 100}%)` : '';
                this._slides.forEach((s, k) => {
                    let off = k - i + drag;
                    if (this.flag('loop') && n > 2) {
                        if (off > n / 2)
                            off -= n;
                        if (off < -n / 2)
                            off += n;
                    }
                    const active = k === i;
                    s.toggleAttribute('data-active', active);
                    s.setAttribute('aria-hidden', String(!active));
                    s.inert = !active;
                    if (fx === 'slide') {
                        s.style.transform = s.style.opacity = s.style.zIndex = s.style.filter = '';
                        return;
                    }
                    const a = Math.abs(off);
                    if (fx === 'fade') {
                        s.style.opacity = String(clampN(1 - a, 0, 1));
                        s.style.transform = '';
                    }
                    else if (fx === 'scale') {
                        s.style.opacity = String(clampN(1 - a, 0, 1));
                        s.style.transform = `scale(${1 + Math.min(1, a) * (off < 0 ? 0.12 : -0.12)})`;
                    }
                    else {
                        s.style.opacity = a > 2.2 ? '0' : String(1 - Math.min(a, 2) * 0.28);
                        s.style.transform = `translateX(${off * 58}%) translateZ(${-a * 140}px) rotateY(${clampN(-off * 38, -60, 60)}deg)`;
                        s.style.filter = a > 0.5 ? `brightness(${1 - Math.min(a, 2) * 0.18})` : '';
                    }
                    s.style.zIndex = String(100 - Math.round(a * 10));
                });
                this._dots.forEach((d, k) => d.setAttribute('aria-current', String(k === i)));
            }
            goTo(to) {
                const n = this.length;
                if (!n)
                    return;
                const t = this.flag('loop') ? ((Math.round(to) % n) + n) % n : clampN(Math.round(to), 0, n - 1);
                const from = this._i;
                this._i = t;
                this.layout(0);
                if (t !== from)
                    this.emit('change', { index: t, from });
            }
            next() {
                this.goTo(this._i + 1 >= this.length && !this.flag('loop') ? 0 : this._i + 1);
            }
            prev() {
                this.goTo(this._i - 1 < 0 && !this.flag('loop') ? this.length - 1 : this._i - 1);
            }
        }
        return UsaCarousel;
    }, { id: 'carousel', text: css$1E });
}

var css$1D = "usa-tab-bar{display:block;--usa-tab-accent:#7c5cff;--usa-tab-ease:cubic-bezier(.22,1,.36,1)}.usa-tab-bar-list{position:relative;display:flex;gap:4px;padding:4px;border-radius:12px;background:rgba(127,127,127,.12);isolation:isolate;overflow-x:auto;scrollbar-width:none}.usa-tab-bar-list::-webkit-scrollbar{display:none}.usa-tab-bar-list>[role=\"tab\"]{position:relative;z-index:1;flex:1 0 auto;border:0;background:none;color:inherit;font:inherit;font-weight:600;padding:8px 14px;border-radius:9px;cursor:pointer;opacity:.7;transition:opacity .25s,color .25s;white-space:nowrap}.usa-tab-bar-list>[role=\"tab\"][aria-selected=\"true\"]{opacity:1}.usa-tab-bar-list>[role=\"tab\"]:focus-visible{outline:2px solid var(--usa-tab-accent);outline-offset:1px}.usa-tab-bar-ink{position:absolute;z-index:0;left:0;top:4px;bottom:4px;width:0;border-radius:9px;background:var(--usa-tab-accent);pointer-events:none}usa-tab-bar[data-indicator=\"pill\"] [aria-selected=\"true\"]{color:#fff}usa-tab-bar[data-indicator=\"underline\"] .usa-tab-bar-list{background:none;border-bottom:1px solid rgba(127,127,127,.25);border-radius:0}usa-tab-bar[data-indicator=\"underline\"] .usa-tab-bar-ink{top:auto;bottom:0;height:3px;border-radius:3px}usa-tab-bar[data-indicator=\"glow\"] .usa-tab-bar-ink{background:transparent;box-shadow:0 0 0 2px var(--usa-tab-accent),0 0 18px var(--usa-tab-accent)}usa-tab-bar[data-indicator=\"gooey\"] .usa-tab-bar-ink{filter:blur(.5px);border-radius:999px}usa-tab-bar[data-indicator=\"gooey\"] [aria-selected=\"true\"]{color:#fff}.usa-tab-bar-panel{padding:14px 2px}.usa-tab-bar-panel[hidden]{display:none}";

const TAB_INDICATORS = ['pill', 'underline', 'glow', 'gooey'];
function defineTabBar(tag = 'usa-tab-bar') {
    return base.defineElement(tag, (Base) => {
        class UsaTabBar extends Base {
            constructor() {
                super(...arguments);
                this._tabs = [];
                this._panels = [];
                this._ink = null;
                this._i = 0;
            }
            static get observedAttributes() {
                return ['indicator'];
            }
            get selected() {
                return this._i;
            }
            set selected(v) {
                this.select(v);
            }
            mount() {
                const ind = this.str('indicator', 'pill');
                this.dataset.indicator = TAB_INDICATORS.includes(ind) ? ind : 'pill';
                let list = this.querySelector(':scope > .usa-tab-bar-list');
                if (!list) {
                    list = part('div', 'usa-tab-bar-list');
                    this.prepend(list);
                }
                list.setAttribute('role', 'tablist');
                list.setAttribute('aria-label', this.str('label', 'Tabs'));
                const kids = ownChildren(this);
                this._panels = kids.filter((k) => k.hasAttribute('data-panel'));
                for (const k of kids)
                    if (!k.hasAttribute('data-panel') && k.matches('button,[data-tab]'))
                        list.append(k);
                this._tabs = Array.from(list.children).filter((c) => c instanceof HTMLElement && !c.classList.contains('usa-tab-bar-ink'));
                this._ink = list.querySelector('.usa-tab-bar-ink') || part('span', 'usa-tab-bar-ink', { 'aria-hidden': 'true' });
                list.prepend(this._ink);
                this._tabs.forEach((t, i) => {
                    t.setAttribute('role', 'tab');
                    if (t.localName === 'button' && !t.hasAttribute('type'))
                        t.setAttribute('type', 'button');
                    t.id || (t.id = nextId('usa-tab'));
                    const p = this._panels[i];
                    if (p) {
                        p.id || (p.id = nextId('usa-tabpanel'));
                        p.classList.add('usa-tab-bar-panel');
                        p.setAttribute('role', 'tabpanel');
                        p.setAttribute('aria-labelledby', t.id);
                        p.tabIndex = 0;
                        t.setAttribute('aria-controls', p.id);
                    }
                    this.listen(t, 'click', () => this.select(i));
                });
                this.listen(list, 'keydown', (e) => {
                    const n = arrowIndex(e, this._i, this._tabs.length);
                    if (n < 0)
                        return;
                    e.preventDefault();
                    this.select(n);
                    this._tabs[n].focus();
                });
                this._i = Math.min(Math.max(0, Math.round(this.num('selected', 0))), Math.max(0, this._tabs.length - 1));
                this.sync(-1);
                if (typeof ResizeObserver === 'function') {
                    const ro = new ResizeObserver(() => this.place());
                    ro.observe(list);
                    this.onCleanup(() => ro.disconnect());
                }
            }
            rect(i) {
                const t = this._tabs[i];
                return t ? [t.offsetLeft, t.offsetWidth] : [0, 0];
            }
            place() {
                if (!this._ink)
                    return;
                const [x, w] = this.rect(this._i);
                this._ink.style.transform = `translateX(${x}px)`;
                this._ink.style.width = `${w}px`;
            }
            sync(from) {
                this._tabs.forEach((t, k) => {
                    t.setAttribute('aria-selected', String(k === this._i));
                    t.tabIndex = k === this._i ? 0 : -1;
                });
                this._panels.forEach((p, k) => (p.hidden = k !== this._i));
                this.place();
                if (from < 0 || from === this._i || !this._ink || this.reduced)
                    return;
                // stretchy travel: the leading edge arrives first, the trailing edge follows
                const [x0, w0] = this.rect(from);
                const [x1, w1] = this.rect(this._i);
                const right = x1 > x0;
                const mid = right ? { transform: `translateX(${x0}px)`, width: `${x1 + w1 - x0}px` } : { transform: `translateX(${x1}px)`, width: `${x0 + w0 - x1}px` };
                this.motion(this._ink, [{ transform: `translateX(${x0}px)`, width: `${w0}px` }, { ...mid, offset: 0.45 }, { transform: `translateX(${x1}px)`, width: `${w1}px` }], { duration: 480, easing: 'cubic-bezier(.22,1,.36,1)' });
                const p = this._panels[this._i];
                if (p)
                    this.motion(p, [{ opacity: 0, transform: `translateX(${right ? 24 : -24}px)` }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.22,1,.36,1)' });
            }
            select(i) {
                const n = Math.min(Math.max(0, Math.round(i)), this._tabs.length - 1);
                if (n === this._i || n < 0)
                    return;
                const from = this._i;
                this._i = n;
                this.sync(from);
                this.emit('change', { index: n, from });
            }
        }
        return UsaTabBar;
    }, { id: 'tab-bar', text: css$1D });
}

var css$1C = "usa-disclosure{display:block;--usa-disclosure-accent:#7c5cff}usa-disclosure>details{border-bottom:1px solid rgba(127,127,127,.25);overflow:hidden}usa-disclosure>details>summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 4px;font-weight:600}usa-disclosure>details>summary::-webkit-details-marker{display:none}usa-disclosure>details>summary::after{content:\"\";flex:none;width:9px;height:9px;border-right:2px solid currentColor;border-bottom:2px solid currentColor;rotate:45deg;translate:0 -3px;transition:rotate .35s cubic-bezier(.34,1.56,.64,1),translate .35s}usa-disclosure>details[open]>summary::after{rotate:225deg;translate:0 2px}usa-disclosure>details>summary:focus-visible{outline:2px solid var(--usa-disclosure-accent);outline-offset:2px;border-radius:6px}usa-disclosure>details>:not(summary){padding:0 4px 12px}usa-disclosure[variant=\"cards\"]>details{border:1px solid rgba(127,127,127,.25);border-radius:12px;margin-bottom:8px;padding:0 10px;transition:box-shadow .3s,border-color .3s}usa-disclosure[variant=\"cards\"]>details[open]{border-color:var(--usa-disclosure-accent);box-shadow:0 8px 24px rgba(124,92,255,.16)}@media (prefers-reduced-motion:reduce){usa-disclosure>details>summary::after{transition:none}}";

function defineDisclosure(tag = 'usa-disclosure') {
    return base.defineElement(tag, (Base) => {
        class UsaDisclosure extends Base {
            constructor() {
                super(...arguments);
                this._anims = new WeakMap();
            }
            get items() {
                return Array.from(this.children).filter((c) => c.localName === 'details');
            }
            mount() {
                this.listen(this, 'click', (e) => {
                    const s = e.target.closest('summary');
                    const d = s?.parentElement;
                    if (!s || !d || d.parentElement !== this)
                        return;
                    e.preventDefault();
                    this.set(d, !d.open);
                });
            }
            set(d, open) {
                if (open && !this.flag('multiple'))
                    for (const o of this.items)
                        if (o !== d && o.open)
                            this.set(o, false);
                if (d.open === open && !this._anims.get(d))
                    return;
                const summary = d.querySelector('summary');
                const closedH = summary ? summary.offsetHeight : 0;
                const startH = d.offsetHeight;
                this._anims.get(d)?.cancel();
                if (open)
                    d.open = true;
                const endH = open ? d.scrollHeight : closedH;
                const sp = spring.springEasing(this.str('spring', 'gentle'));
                const a = this.reduced ? null : this.motion(d, [{ height: `${startH}px` }, { height: `${endH}px` }], { duration: Math.min(sp.duration, 700), easing: sp.easing, fill: 'forwards' });
                const body = Array.from(d.children).filter((c) => c.localName !== 'summary');
                if (open && !this.reduced)
                    body.forEach((b) => this.motion(b, [{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 300, delay: 60, easing: 'ease-out' }));
                const done = () => {
                    this._anims.delete(d);
                    if (!open)
                        d.open = false;
                    a?.cancel();
                };
                if (a) {
                    this._anims.set(d, a);
                    a.finished.then(() => this._anims.get(d) === a && done(), () => undefined);
                }
                else
                    done();
                this.emit('toggle', { index: this.items.indexOf(d), open });
            }
            toggle(i, force) {
                const d = this.items[i];
                if (d)
                    this.set(d, force ?? !d.open);
            }
            openAll() {
                this.items.forEach((d) => (d.open = true));
            }
            closeAll() {
                this.items.forEach((d) => this.set(d, false));
            }
        }
        return UsaDisclosure;
    }, { id: 'disclosure', text: css$1C });
}

var css$1B = "usa-stories{display:block;position:relative;overflow:hidden;border-radius:var(--usa-radius,16px);background:#111;color:#fff;aspect-ratio:9/14;max-height:520px;user-select:none;-webkit-user-select:none;touch-action:manipulation}usa-stories>:not([data-usa-part]){position:absolute;inset:0;opacity:0;transition:opacity .35s ease,transform .5s cubic-bezier(.22,1,.36,1);transform:scale(1.04);pointer-events:none;box-sizing:border-box}usa-stories>[data-active]:not([data-usa-part]){opacity:1;transform:none;pointer-events:auto}usa-stories>img:not([data-usa-part]){width:100%;height:100%;object-fit:cover}.usa-stories-bars{position:absolute;z-index:3;top:8px;left:8px;right:48px;display:flex;gap:4px}.usa-stories-bar{flex:1;height:3px;border-radius:3px;background:rgba(255,255,255,.35);overflow:hidden}.usa-stories-bar>i{display:block;height:100%;width:100%;background:#fff;transform-origin:left;transform:scaleX(0)}.usa-stories-bar[data-done]>i{transform:scaleX(1)}.usa-stories-toggle{position:absolute;z-index:3;top:2px;right:6px;width:36px;height:30px;border:0;background:none;color:#fff;font:700 14px/1 system-ui;cursor:pointer;border-radius:8px}.usa-stories-toggle:focus-visible{outline:2px solid #fff}@media (prefers-reduced-motion:reduce){usa-stories>*{transition:none!important;transform:none!important}}";

function defineStories(tag = 'usa-stories') {
    return base.defineElement(tag, (Base) => {
        class UsaStories extends Base {
            constructor() {
                super(...arguments);
                this._i = 0;
                this._items = [];
                this._bars = [];
                this._fill = null;
                this._btn = null;
            }
            static get observedAttributes() {
                return ['duration', 'loop'];
            }
            get index() {
                return this._i;
            }
            mount() {
                dropParts(this);
                this._items = ownChildren(this);
                const bars = part('div', 'usa-stories-bars', { 'aria-hidden': 'true' });
                this._bars = this._items.map(() => {
                    const b = part('div', 'usa-stories-bar', {}, '<i></i>');
                    bars.append(b);
                    return b;
                });
                this._btn = part('button', 'usa-stories-toggle', { type: 'button' });
                this.listen(this._btn, 'click', (e) => {
                    e.stopPropagation();
                    this.hasAttribute('paused') ? this.play() : this.pause();
                });
                this.append(bars, this._btn);
                this.setAttribute('role', 'region');
                this.setAttribute('aria-roledescription', 'stories');
                if (!this.hasAttribute('aria-label'))
                    this.setAttribute('aria-label', 'Stories');
                if (!this.hasAttribute('tabindex'))
                    this.tabIndex = 0;
                if (this.reduced)
                    this.setAttribute('paused', '');
                let held = false;
                let downAt = 0;
                this.listen(this, 'pointerdown', (e) => {
                    if (e.target.closest('button,a'))
                        return;
                    downAt = performance.now();
                    held = !this.hasAttribute('paused');
                    if (held)
                        this._fill?.pause();
                });
                this.listen(this, 'pointerup', (e) => {
                    if (e.target.closest('button,a') || !downAt)
                        return;
                    const long = performance.now() - downAt > 350;
                    downAt = 0;
                    if (held && !this.hasAttribute('paused'))
                        this._fill?.play();
                    if (long)
                        return;
                    const r = this.getBoundingClientRect();
                    e.clientX - r.left < r.width / 3 ? this.prev() : this.next();
                });
                this.listen(this, 'keydown', (e) => {
                    if (e.key === 'ArrowRight')
                        this.next();
                    else if (e.key === 'ArrowLeft')
                        this.prev();
                    else if (e.key === ' ')
                        (e.preventDefault(), this.hasAttribute('paused') ? this.play() : this.pause());
                });
                this.onCleanup(() => this._fill?.cancel());
                this.goTo(Math.min(this._i, Math.max(0, this._items.length - 1)), true);
            }
            label() {
                if (this._btn) {
                    const p = this.hasAttribute('paused');
                    this._btn.textContent = p ? '▶' : '❚❚';
                    this._btn.setAttribute('aria-label', p ? 'Play stories' : 'Pause stories');
                }
            }
            goTo(i, initial = false) {
                const n = this._items.length;
                if (!n)
                    return;
                if (i >= n && !this.flag('loop')) {
                    this.emit('end');
                    this.pause();
                    return;
                }
                const t = ((i % n) + n) % n;
                const changed = t !== this._i || initial;
                this._i = t;
                this._items.forEach((s, k) => {
                    s.toggleAttribute('data-active', k === t);
                    s.setAttribute('aria-hidden', String(k !== t));
                });
                this._bars.forEach((b, k) => b.toggleAttribute('data-done', k < t));
                this._fill?.cancel();
                const fillEl = this._bars[t]?.firstElementChild;
                this._fill = fillEl ? fillEl.animate?.([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: Math.max(800, this.num('duration', 5000)), fill: 'forwards' }) ?? null : null;
                if (this._fill) {
                    const a = this._fill;
                    a.onfinish = () => this._fill === a && this.goTo(this._i + 1);
                    if (this.hasAttribute('paused'))
                        a.pause();
                }
                this.label();
                if (changed && !initial)
                    this.emit('change', { index: t });
            }
            next() {
                this.goTo(this._i + 1);
            }
            prev() {
                this.goTo(Math.max(0, this._i - 1));
            }
            pause() {
                this.setAttribute('paused', '');
                this._fill?.pause();
                this.label();
            }
            play() {
                this.removeAttribute('paused');
                if (this._fill?.playState === 'finished')
                    this.goTo(this._i + 1 >= this._items.length ? 0 : this._i + 1);
                else
                    this._fill?.play();
                this.label();
            }
        }
        return UsaStories;
    }, { id: 'stories', text: css$1B });
}

var css$1A = "usa-modal,usa-sheet{display:contents}.usa-ov{border:0;padding:0;margin:auto;color:inherit;background:transparent;max-width:min(92vw,520px);max-height:88vh;overflow:visible}.usa-ov::backdrop{background:rgba(10,12,20,.45);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}.usa-ov-body{box-sizing:border-box;background:var(--usa-ov-bg,#fff);color:var(--usa-ov-fg,#111827);border-radius:var(--usa-ov-radius,18px);padding:var(--usa-ov-pad,22px);box-shadow:0 30px 80px -20px rgba(0,0,0,.45);max-height:88vh;overflow:auto}.usa-sheet-panel{margin:0;max-width:none;max-height:none}usa-sheet[data-side=\"right\"] .usa-sheet-panel{inset:0 0 0 auto;height:100%;width:min(88vw,var(--usa-sheet-size,380px))}usa-sheet[data-side=\"left\"] .usa-sheet-panel{inset:0 auto 0 0;height:100%;width:min(88vw,var(--usa-sheet-size,380px))}usa-sheet[data-side=\"bottom\"] .usa-sheet-panel{inset:auto 0 0 0;width:100%;max-height:85vh}usa-sheet[data-side=\"top\"] .usa-sheet-panel{inset:0 0 auto 0;width:100%;max-height:85vh}usa-sheet .usa-ov-body{height:100%;max-height:inherit;border-radius:0}usa-sheet[data-side=\"bottom\"] .usa-ov-body{border-radius:var(--usa-ov-radius,18px) var(--usa-ov-radius,18px) 0 0;height:auto;max-height:85vh;touch-action:none}usa-sheet[data-side=\"top\"] .usa-ov-body{border-radius:0 0 var(--usa-ov-radius,18px) var(--usa-ov-radius,18px);height:auto}.usa-ov-grab{width:44px;height:5px;border-radius:3px;background:rgba(127,127,127,.45);margin:-8px auto 14px;cursor:grab}@media (prefers-color-scheme:dark){.usa-ov-body{background:var(--usa-ov-bg,#171a23);color:var(--usa-ov-fg,#e5e7eb)}}";

const MODAL_EFFECTS = ['scale', 'slide-up', 'flip', 'origin'];
const SHEET_SIDES = ['right', 'left', 'bottom', 'top'];
const EASE_OUT = 'cubic-bezier(.22,1,.36,1)';
// one delegated listener for [data-usa-open] / [data-usa-toast] triggers anywhere on the page
let delegated = false;
function delegateTriggers() {
    if (delegated || typeof document === 'undefined')
        return;
    delegated = true;
    document.addEventListener('click', (e) => {
        const t = e.target?.closest?.('[data-usa-open]');
        if (!t)
            return;
        const target = document.getElementById(t.getAttribute('data-usa-open') || '');
        if (target && typeof target.show === 'function') {
            e.preventDefault();
            if (target.opened)
                void target.close?.();
            else
                target.show(t);
        }
    });
}
function defineOverlay(tag, kind) {
    delegateTriggers();
    return base.defineElement(tag, (Base) => {
        class UsaOverlay extends Base {
            constructor() {
                super(...arguments);
                this._dlg = null;
                this._panel = null;
                this._open = false;
                this._ret = null;
                this._origin = null;
                this._value = '';
                this._closing = null;
            }
            static get observedAttributes() {
                return kind === 'modal' ? ['effect'] : ['side'];
            }
            get opened() {
                return this._open;
            }
            get returnValue() {
                return this._value;
            }
            mount() {
                let d = this.querySelector(':scope > dialog.usa-ov');
                if (!d) {
                    d = part('dialog', `usa-ov usa-${kind}-panel`);
                    const body = part('div', 'usa-ov-body');
                    body.append(...ownChildren(this));
                    d.append(body);
                    this.append(d);
                }
                this._dlg = d;
                this._panel = d.querySelector('.usa-ov-body');
                if (kind === 'modal') {
                    const ef = this.str('effect', 'scale');
                    this.dataset.effect = MODAL_EFFECTS.includes(ef) ? ef : 'scale';
                }
                else {
                    const side = this.str('side', 'right');
                    this.dataset.side = SHEET_SIDES.includes(side) ? side : 'right';
                    if (this.dataset.side === 'bottom' && this._panel && !this._panel.querySelector('[data-handle]'))
                        this._panel.prepend(part('div', 'usa-ov-grab', { 'data-handle': '', 'aria-hidden': 'true' }));
                    this.drag();
                }
                if (!d.hasAttribute('aria-labelledby'))
                    d.setAttribute('aria-label', this.str('label', kind === 'modal' ? 'Dialog' : 'Panel'));
                this.listen(d, 'cancel', (e) => {
                    e.preventDefault();
                    if (!this.flag('persistent'))
                        void this.close();
                });
                this.listen(d, 'click', (e) => {
                    const t = e.target;
                    const c = t.closest?.('[data-usa-close]');
                    if (c)
                        return void this.close(c.getAttribute('data-usa-close') || '');
                    if (t === d && !this.flag('persistent'))
                        void this.close(); // the ::backdrop
                });
                if (this.flag('open') && !this._open)
                    this.show();
            }
            unmount() {
                if (this._open && this._dlg?.open)
                    this._dlg.close?.();
                this._open = false;
            }
            frames(opening) {
                const fade = [{ opacity: 0 }, { opacity: 1 }];
                if (this.reduced)
                    return opening ? fade : [...fade].reverse();
                let f;
                if (kind === 'sheet') {
                    const s = this.dataset.side;
                    const off = s === 'left' ? 'translateX(-100%)' : s === 'bottom' ? 'translateY(100%)' : s === 'top' ? 'translateY(-100%)' : 'translateX(100%)';
                    f = [{ transform: off }, { transform: 'none' }];
                }
                else {
                    const e = this.dataset.effect;
                    const o = this._origin;
                    const r = this._dlg?.getBoundingClientRect();
                    if (e === 'origin' && o && r && r.width) {
                        const dx = o.left + o.width / 2 - (r.left + r.width / 2);
                        const dy = o.top + o.height / 2 - (r.top + r.height / 2);
                        f = [{ transform: `translate(${dx}px,${dy}px) scale(${Math.max(0.05, o.width / r.width).toFixed(3)},${Math.max(0.05, o.height / r.height).toFixed(3)})`, opacity: 0, borderRadius: '40px' }, { transform: 'none', opacity: 1 }];
                    }
                    else if (e === 'slide-up')
                        f = [{ transform: 'translateY(48px)', opacity: 0 }, { transform: 'none', opacity: 1 }];
                    else if (e === 'flip')
                        f = [{ transform: 'perspective(900px) rotateX(-28deg) translateY(30px)', opacity: 0 }, { transform: 'none', opacity: 1 }];
                    else
                        f = [{ transform: 'scale(.88)', opacity: 0 }, { transform: 'scale(1.015)', opacity: 1, offset: 0.7 }, { transform: 'none', opacity: 1 }];
                }
                return opening ? f : [f[0], f[f.length - 1]].reverse();
            }
            backdrop(opening) {
                if (!this._dlg)
                    return;
                const k = [{ opacity: 0 }, { opacity: 1 }];
                try {
                    this._dlg.animate?.(opening ? k : k.reverse(), { duration: opening ? 280 : 200, pseudoElement: '::backdrop', fill: 'forwards' });
                }
                catch {
                    /* no ::backdrop animation support */
                }
            }
            show(trigger) {
                const d = this._dlg;
                if (!d || this._open)
                    return;
                this._open = true;
                this._ret = trigger || document.activeElement;
                this._origin = trigger ? trigger.getBoundingClientRect() : null;
                if (typeof d.showModal === 'function') {
                    try {
                        d.showModal();
                    }
                    catch {
                        d.setAttribute('open', '');
                    }
                }
                else
                    d.setAttribute('open', '');
                this.setAttribute('data-open', '');
                this.backdrop(true);
                this.motion(d, this.frames(true), { duration: this.reduced ? 150 : kind === 'sheet' ? 420 : 460, easing: EASE_OUT });
                const f = d.querySelector('[autofocus]') || d.querySelector('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
                f?.focus?.();
                this.emit('open', { trigger: trigger || null });
            }
            close(value = '') {
                const d = this._dlg;
                if (!d || !this._open)
                    return Promise.resolve();
                if (this._closing)
                    return this._closing;
                this._value = value;
                this.backdrop(false);
                const a = this.motion(d, this.frames(false), { duration: this.reduced ? 120 : 260, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' });
                const done = () => {
                    this._closing = null;
                    this._open = false;
                    this.removeAttribute('data-open');
                    if (d.open && typeof d.close === 'function')
                        d.close(value);
                    else
                        d.removeAttribute('open');
                    a?.cancel?.();
                    d.style.transform = '';
                    this._ret?.focus?.();
                    this.emit('close', { value });
                };
                this._closing = a ? a.finished.then(done, done) : Promise.resolve().then(done);
                return this._closing;
            }
            toggle() {
                if (this._open)
                    void this.close();
                else
                    this.show();
            }
            // bottom sheet: drag down to dismiss, springs back otherwise
            drag() {
                const p = this._panel;
                const d = this._dlg;
                if (!p || !d || this.dataset.side !== 'bottom')
                    return;
                let y0 = -1;
                let dy = 0;
                let t0 = 0;
                this.listen(p, 'pointerdown', (e) => {
                    if (!e.target.closest('[data-handle]'))
                        return;
                    y0 = e.clientY;
                    dy = 0;
                    t0 = performance.now();
                    e.target.setPointerCapture?.(e.pointerId);
                });
                this.listen(p, 'pointermove', (e) => {
                    if (y0 < 0)
                        return;
                    dy = Math.max(0, e.clientY - y0);
                    d.style.transform = `translateY(${dy}px)`;
                });
                const up = () => {
                    if (y0 < 0)
                        return;
                    y0 = -1;
                    const v = dy / Math.max(1, performance.now() - t0);
                    if (dy > d.offsetHeight * 0.3 || v > 0.6)
                        void this.close();
                    else {
                        this.motion(d, [{ transform: `translateY(${dy}px)` }, { transform: 'translateY(-6px)', offset: 0.6 }, { transform: 'none' }], { duration: 380, easing: EASE_OUT });
                        d.style.transform = '';
                    }
                };
                this.listen(p, 'pointerup', up);
                this.listen(p, 'pointercancel', up);
            }
        }
        return UsaOverlay;
    }, { id: 'overlay', text: css$1A });
}
const defineModal = (tag = 'usa-modal') => defineOverlay(tag, 'modal');
const defineSheet = (tag = 'usa-sheet') => defineOverlay(tag, 'sheet');

var css$1z = "usa-toast-stack{position:fixed;z-index:2147482000;width:min(360px,calc(100vw - 24px));pointer-events:none;--usa-tstack-bg:#111827;--usa-tstack-fg:#f9fafb}usa-toast-stack[contained]{position:absolute;width:min(360px,calc(100% - 24px))}usa-toast-stack[data-position^=\"bottom\"]{bottom:12px}usa-toast-stack[data-position^=\"top\"]{top:12px}usa-toast-stack[data-position$=\"right\"]{right:12px}usa-toast-stack[data-position$=\"left\"]{left:12px}usa-toast-stack[data-position$=\"center\"]{left:50%;transform:translateX(-50%)}.usa-tstack-list{position:relative;list-style:none;margin:0;padding:0;min-height:1px;transition:height .3s}.usa-tstack{position:absolute;left:0;right:0;display:flex;align-items:center;gap:10px;box-sizing:border-box;padding:12px 12px 12px 14px;border-radius:14px;background:var(--usa-tstack-bg);color:var(--usa-tstack-fg);box-shadow:0 12px 32px -10px rgba(0,0,0,.45);font:500 14px/1.35 system-ui,sans-serif;pointer-events:auto;touch-action:pan-y;transition:transform .38s cubic-bezier(.22,1,.36,1),opacity .3s;user-select:none}usa-toast-stack[data-position^=\"bottom\"] .usa-tstack{bottom:0;transform-origin:50% 100%}usa-toast-stack[data-position^=\"top\"] .usa-tstack{top:0;transform-origin:50% 0}.usa-tstack-icon{flex:none;display:grid;place-items:center;width:22px;height:22px;border-radius:50%;font-size:13px;font-weight:800;background:#3b82f6;color:#fff}.usa-tstack-success .usa-tstack-icon{background:#22c55e}.usa-tstack-warning .usa-tstack-icon{background:#f59e0b}.usa-tstack-error .usa-tstack-icon{background:#ef4444}.usa-tstack-text{flex:1;min-width:0;display:flex;flex-direction:column}.usa-tstack-text strong{font-weight:700}.usa-tstack-action{border:0;border-radius:8px;padding:6px 10px;background:rgba(255,255,255,.14);color:inherit;font:600 13px system-ui,sans-serif;cursor:pointer}.usa-tstack-close{border:0;background:none;color:inherit;opacity:.6;font-size:18px;line-height:1;cursor:pointer;padding:2px 4px}.usa-tstack-close:hover{opacity:1}@media (prefers-reduced-motion:reduce){.usa-tstack,.usa-tstack-list{transition:none}}";

const TOAST_POSITIONS = ['bottom-right', 'bottom-left', 'bottom-center', 'top-right', 'top-left', 'top-center'];
const ICONS = { info: 'ℹ', success: '✓', warning: '!', error: '✕' };
let tid = 0;
function defineToastStack(tag = 'usa-toast-stack') {
    installToastTriggers();
    return base.defineElement(tag, (Base) => {
        class UsaToastStack extends Base {
            constructor() {
                super(...arguments);
                this._list = null;
                this._timers = new Map();
                this._hover = false;
            }
            static get observedAttributes() {
                return ['position'];
            }
            get count() {
                return this._list ? this._list.querySelectorAll(':scope > .usa-tstack:not([data-leaving])').length : 0;
            }
            mount() {
                const pos = this.str('position', 'bottom-right');
                this.dataset.position = TOAST_POSITIONS.includes(pos) ? pos : 'bottom-right';
                this.setAttribute('role', 'region');
                if (!this.hasAttribute('aria-label'))
                    this.setAttribute('aria-label', 'Notifications');
                this._list = this.querySelector(':scope > .usa-tstack-list') || part('ol', 'usa-tstack-list', { 'aria-live': 'polite', 'aria-relevant': 'additions' });
                if (!this._list.isConnected)
                    this.append(this._list);
                const expand = (on) => {
                    this._hover = on;
                    this.toggleAttribute('data-expanded', on);
                    this.layout();
                    for (const [id, t] of this._timers)
                        on ? this.pause(id, t) : this.resume(id);
                };
                this.listen(this, 'pointerenter', () => expand(true));
                this.listen(this, 'pointerleave', () => expand(false));
                this.listen(this, 'focusin', () => expand(true));
                this.listen(this, 'focusout', (e) => !this.contains(e.relatedTarget) && expand(false));
                this.onCleanup(() => this._timers.forEach((t) => t.h && clearTimeout(t.h)));
            }
            pause(_id, t) {
                if (!t.h)
                    return;
                clearTimeout(t.h);
                t.h = 0;
                t.left -= Date.now() - t.start;
            }
            resume(id) {
                const t = this._timers.get(id);
                if (!t || t.h)
                    return;
                t.start = Date.now();
                t.h = setTimeout(() => this.dismiss(id, 'timeout'), Math.max(400, t.left));
            }
            show(input) {
                const o = typeof input === 'string' ? { message: input } : input || {};
                const id = `usa-tstack-${++tid}`;
                const type = o.type && ICONS[o.type] ? o.type : 'info';
                const li = part('li', `usa-tstack usa-tstack-${type}`, { id, role: type === 'error' ? 'alert' : 'status' });
                li.append(part('span', 'usa-tstack-icon', { 'aria-hidden': 'true' }, ICONS[type]));
                const txt = part('div', 'usa-tstack-text');
                if (o.title)
                    txt.append(Object.assign(document.createElement('strong'), { textContent: o.title }));
                if (o.message)
                    txt.append(Object.assign(document.createElement('span'), { textContent: o.message }));
                li.append(txt);
                if (o.action) {
                    const b = part('button', 'usa-tstack-action', { type: 'button' });
                    b.textContent = o.action.label;
                    b.addEventListener('click', () => {
                        o.action?.onClick?.();
                        this.dismiss(id, 'action');
                    });
                    li.append(b);
                }
                const x = part('button', 'usa-tstack-close', { type: 'button', 'aria-label': 'Dismiss' }, '×');
                x.addEventListener('click', () => this.dismiss(id, 'close'));
                li.append(x);
                this.swipe(li, id);
                this._list?.prepend(li);
                const top = this.dataset.position?.startsWith('top');
                this.motion(li, this.reduced ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, translate: `0 ${top ? -110 : 110}%`, scale: '0.9' }, { opacity: 1, translate: '0 0', scale: '1' }], { duration: this.reduced ? 150 : 420, easing: 'cubic-bezier(.22,1,.36,1)' });
                this.layout();
                const dur = o.duration ?? this.num('duration', 4000);
                if (dur > 0) {
                    this._timers.set(id, { left: dur, start: Date.now(), h: 0 });
                    if (!this._hover)
                        this.resume(id);
                }
                this.emit('show', { id, ...o });
                return id;
            }
            dismiss(id, reason = 'api') {
                const li = this._list?.querySelector(`#${id}`);
                const t = this._timers.get(id);
                if (t?.h)
                    clearTimeout(t.h);
                this._timers.delete(id);
                if (!li || li.hasAttribute('data-leaving'))
                    return;
                li.setAttribute('data-leaving', '');
                const dx = Number(li.dataset.dx || 0);
                const a = this.motion(li, this.reduced ? [{ opacity: 1 }, { opacity: 0 }] : [{ opacity: 1, transform: `translateX(${dx}px)` }, { opacity: 0, transform: `translateX(${dx >= 0 ? 120 : -120}%)` }], { duration: this.reduced ? 120 : 260, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' });
                const rm = () => {
                    li.remove();
                    this.layout();
                };
                if (a)
                    a.finished.then(rm, rm);
                else
                    rm();
                this.emit('dismiss', { id, reason });
            }
            clear() {
                this._list?.querySelectorAll(':scope > .usa-tstack').forEach((li) => this.dismiss(li.id, 'clear'));
            }
            /** Collapsed: newest in front, older ones scaled down peeking behind. Expanded: a list. */
            layout() {
                if (!this._list)
                    return;
                const items = Array.from(this._list.querySelectorAll(':scope > .usa-tstack:not([data-leaving])'));
                const max = Math.max(1, this.num('max', 3));
                const dir = this.dataset.position?.startsWith('top') ? 1 : -1;
                let y = 0;
                items.forEach((li, k) => {
                    const h = li.offsetHeight || 56;
                    const tf = this._hover ? `translateY(${dir * y}px)` : `translateY(${dir * k * 10}px) scale(${(1 - k * 0.05).toFixed(3)})`;
                    li.style.transform = tf;
                    li.style.zIndex = String(100 - k);
                    li.style.opacity = !this._hover && k >= max ? '0' : '';
                    li.toggleAttribute('inert', !this._hover && k > 0);
                    y += h + 10;
                });
                this._list.style.height = this._hover && items.length ? `${y}px` : '';
            }
            swipe(li, id) {
                let x0 = NaN;
                li.addEventListener('pointerdown', (e) => {
                    if (e.target.closest('button'))
                        return;
                    x0 = e.clientX;
                    li.setPointerCapture?.(e.pointerId);
                });
                li.addEventListener('pointermove', (e) => {
                    if (Number.isNaN(x0))
                        return;
                    const dx = e.clientX - x0;
                    li.dataset.dx = String(dx);
                    li.style.translate = `${dx}px 0`;
                    li.style.opacity = String(Math.max(0.2, 1 - Math.abs(dx) / 240));
                });
                const up = () => {
                    if (Number.isNaN(x0))
                        return;
                    x0 = NaN;
                    const dx = Number(li.dataset.dx || 0);
                    li.style.translate = '';
                    li.style.opacity = '';
                    if (Math.abs(dx) > 80)
                        this.dismiss(id, 'swipe');
                    else
                        li.dataset.dx = '0';
                };
                li.addEventListener('pointerup', up);
                li.addEventListener('pointercancel', up);
            }
        }
        return UsaToastStack;
    }, { id: 'toast', text: css$1z });
}
/** Show a toast on the first `<usa-toast-stack>` of the page (one is created when missing). */
function stackToast(input, stack) {
    defineToastStack();
    let s = stack || document.querySelector('usa-toast-stack');
    if (!s) {
        s = document.createElement('usa-toast-stack');
        document.body.append(s);
    }
    return s.show(input);
}
let trig = false;
function installToastTriggers() {
    delegateTriggers();
    if (trig || typeof document === 'undefined')
        return;
    trig = true;
    document.addEventListener('click', (e) => {
        const t = e.target?.closest?.('[data-usa-toast]');
        if (!t)
            return;
        const target = t.getAttribute('data-usa-target');
        const s = target ? document.getElementById(target) : null;
        stackToast({ message: t.getAttribute('data-usa-toast') || '', title: t.getAttribute('data-usa-toast-title') || undefined, type: t.getAttribute('data-usa-toast-type') || 'info' }, s);
    });
}

var css$1y = "usa-menu{position:relative;display:inline-block}.usa-menu-list{position:absolute;z-index:50;min-width:180px;max-width:min(280px,90vw);box-sizing:border-box;padding:6px;border-radius:12px;background:var(--usa-menu-bg,#fff);color:var(--usa-menu-fg,#111827);box-shadow:0 18px 44px -12px rgba(0,0,0,.35),0 0 0 1px rgba(127,127,127,.15);display:flex;flex-direction:column;gap:2px;text-align:left}.usa-menu-list[hidden]{display:none}usa-menu[data-placement^=\"bottom\"] .usa-menu-list{top:calc(100% + 6px)}usa-menu[data-placement^=\"top\"] .usa-menu-list{bottom:calc(100% + 6px)}usa-menu[data-placement$=\"start\"] .usa-menu-list{left:0;transform-origin:0 0}usa-menu[data-placement$=\"end\"] .usa-menu-list{right:0;transform-origin:100% 0}usa-menu[data-placement=\"top-start\"] .usa-menu-list{transform-origin:0 100%}usa-menu[data-placement=\"top-end\"] .usa-menu-list{transform-origin:100% 100%}.usa-menu-list>[role=\"menuitem\"]{display:flex;align-items:center;gap:8px;width:100%;box-sizing:border-box;border:0;background:none;color:inherit;font:500 14px/1.3 system-ui,sans-serif;text-align:left;text-decoration:none;padding:8px 10px;border-radius:8px;cursor:pointer}.usa-menu-list>[role=\"menuitem\"]:hover,.usa-menu-list>[role=\"menuitem\"]:focus-visible{background:var(--usa-menu-hover,rgba(124,92,255,.14));outline:none}.usa-menu-list>hr{border:0;border-top:1px solid rgba(127,127,127,.2);margin:4px 2px}@media (prefers-color-scheme:dark){.usa-menu-list{background:var(--usa-menu-bg,#1d2130);color:var(--usa-menu-fg,#e5e7eb)}}";

const MENU_EFFECTS = ['scale', 'fold', 'slide'];
function defineMenu(tag = 'usa-menu') {
    return base.defineElement(tag, (Base) => {
        class UsaMenu extends Base {
            constructor() {
                super(...arguments);
                this._btn = null;
                this._list = null;
                this._items = [];
                this._open = false;
            }
            static get observedAttributes() {
                return ['placement', 'effect'];
            }
            get opened() {
                return this._open;
            }
            mount() {
                const kids = ownChildren(this);
                this._btn = kids.find((k) => k.hasAttribute('data-trigger')) || kids[0] || null;
                let list = this.querySelector(':scope > .usa-menu-list');
                if (!list) {
                    list = part('div', 'usa-menu-list', { role: 'menu' });
                    for (const k of kids)
                        if (k !== this._btn)
                            list.append(k);
                    this.append(list);
                }
                this._list = list;
                list.id || (list.id = nextId('usa-menu'));
                list.hidden = !this._open;
                const pl = this.str('placement', 'bottom-start');
                this.dataset.placement = /^(bottom|top)-(start|end)$/.test(pl) ? pl : 'bottom-start';
                const ef = this.str('effect', 'scale');
                this.dataset.effect = MENU_EFFECTS.includes(ef) ? ef : 'scale';
                this._items = Array.from(list.children).filter((c) => c instanceof HTMLElement && !c.matches('hr,[role="separator"]'));
                list.querySelectorAll('hr').forEach((h) => h.setAttribute('role', 'separator'));
                this._items.forEach((it, i) => {
                    it.setAttribute('role', 'menuitem');
                    it.tabIndex = -1;
                    if (it.localName === 'button' && !it.hasAttribute('type'))
                        it.setAttribute('type', 'button');
                    this.listen(it, 'click', () => {
                        this.emit('select', { index: i, value: it.dataset.value || (it.textContent || '').trim(), item: it });
                        this.close(true);
                    });
                });
                const b = this._btn;
                if (b) {
                    b.setAttribute('aria-haspopup', 'menu');
                    b.setAttribute('aria-expanded', String(this._open));
                    b.setAttribute('aria-controls', list.id);
                    if (b.localName === 'button' && !b.hasAttribute('type'))
                        b.setAttribute('type', 'button');
                    this.listen(b, 'click', () => this.toggle());
                    this.listen(b, 'keydown', (e) => {
                        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                            e.preventDefault();
                            this.open(e.key === 'ArrowUp' ? 'last' : 'first');
                        }
                    });
                }
                this.listen(list, 'keydown', (e) => {
                    const n = this._items.length;
                    const i = this._items.indexOf(document.activeElement);
                    let j = -1;
                    if (e.key === 'ArrowDown')
                        j = (i + 1) % n;
                    else if (e.key === 'ArrowUp')
                        j = (i - 1 + n) % n;
                    else if (e.key === 'Home')
                        j = 0;
                    else if (e.key === 'End')
                        j = n - 1;
                    else if (e.key === 'Escape') {
                        e.preventDefault();
                        return this.close(true);
                    }
                    else if (e.key === 'Tab')
                        return this.close(false);
                    if (j >= 0) {
                        e.preventDefault();
                        this._items[j]?.focus();
                    }
                });
                this.listen(document, 'pointerdown', (e) => {
                    if (this._open && !this.contains(e.target))
                        this.close(false);
                });
            }
            open(focus = 'first') {
                const l = this._list;
                if (!l || this._open)
                    return;
                this._open = true;
                l.hidden = false;
                this._btn?.setAttribute('aria-expanded', 'true');
                this.setAttribute('data-open', '');
                const ef = this.dataset.effect;
                if (this.reduced)
                    this.motion(l, [{ opacity: 0 }, { opacity: 1 }], { duration: 120 });
                else {
                    const f = ef === 'fold' ? [{ transform: 'perspective(600px) rotateX(-70deg)', opacity: 0 }, { transform: 'none', opacity: 1 }] : ef === 'slide' ? [{ transform: 'translateY(-10px)', opacity: 0, clipPath: 'inset(0 0 100% 0 round 12px)' }, { transform: 'none', opacity: 1, clipPath: 'inset(0 0 0 0 round 12px)' }] : [{ transform: 'scale(.6)', opacity: 0 }, { transform: 'scale(1.03)', opacity: 1, offset: 0.7 }, { transform: 'none', opacity: 1 }];
                    this.motion(l, f, { duration: 300, easing: 'cubic-bezier(.22,1,.36,1)' });
                    this._items.forEach((it, i) => this.motion(it, [{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 260, delay: 40 + i * 35, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' }));
                }
                (focus === 'last' ? this._items[this._items.length - 1] : this._items[0])?.focus();
                this.emit('open');
            }
            close(focusTrigger = false) {
                const l = this._list;
                if (!l || !this._open)
                    return;
                this._open = false;
                this._btn?.setAttribute('aria-expanded', 'false');
                this.removeAttribute('data-open');
                const a = this.motion(l, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: this.reduced ? 'none' : 'scale(.96)' }], { duration: this.reduced ? 80 : 150, easing: 'ease-in' });
                const hide = () => {
                    if (!this._open)
                        l.hidden = true;
                };
                if (a)
                    a.finished.then(hide, hide);
                else
                    hide();
                if (focusTrigger)
                    this._btn?.focus();
                this.emit('close');
            }
            toggle() {
                if (this._open)
                    this.close(true);
                else
                    this.open();
            }
        }
        return UsaMenu;
    }, { id: 'menu', text: css$1y });
}

var css$1x = "usa-progress-ring{position:relative;display:inline-block;vertical-align:middle;width:var(--usa-pr-size,120px);aspect-ratio:1;--usa-pr-color:#7c5cff;--usa-pr-track:rgba(127,127,127,.18);--usa-pr-width:9;font:700 calc(var(--usa-pr-size,120px)*.2)/1 system-ui,sans-serif;font-variant-numeric:tabular-nums}usa-progress-ring[data-variant=\"semi\"]{aspect-ratio:100/56}.usa-pr-label{position:absolute;inset:0;display:grid;place-items:center}usa-progress-ring[data-variant=\"semi\"] .usa-pr-label{place-items:end center}usa-progress-ring[data-variant=\"bar\"]{display:inline-flex;width:var(--usa-pr-size,100%);aspect-ratio:auto;gap:10px;align-items:center;font-size:14px}usa-progress-ring[data-variant=\"bar\"]>.usa-pr-track{flex:1 1 auto;min-width:40px}usa-progress-ring[data-variant=\"bar\"] .usa-pr-label{position:static;display:inline}usa-progress-ring .usa-pr-svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}.usa-pr-svg path{fill:none;stroke-width:var(--usa-pr-width);stroke-linecap:round}.usa-pr-svg .usa-pr-track{stroke:var(--usa-pr-track)}.usa-pr-svg .usa-pr-arc{stroke:var(--usa-pr-color)}usa-progress-ring[data-variant=\"semi\"] .usa-pr-label{padding-bottom:2%}.usa-pr-track:is(div){height:10px;border-radius:999px;background:var(--usa-pr-track);overflow:hidden}.usa-pr-fill{height:100%;border-radius:inherit;background:var(--usa-pr-color);transform-origin:0 50%;transform:scaleX(0)}usa-progress-ring[data-indeterminate] .usa-pr-svg{animation:usa-pr-spin 1.1s linear infinite}usa-progress-ring[data-indeterminate] .usa-pr-fill{width:35%;transform:none!important;animation:usa-pr-slide 1.3s ease-in-out infinite}@keyframes usa-pr-spin{to{transform:rotate(360deg)}}@keyframes usa-pr-slide{from{margin-left:-35%}to{margin-left:100%}}usa-odometer{display:inline-flex;align-items:flex-end;font-variant-numeric:tabular-nums;line-height:1.15}.usa-odo-row{display:inline-flex;align-items:flex-end}.usa-odo-col{display:inline-block;height:1.15em;overflow:hidden;-webkit-mask-image:linear-gradient(transparent,#000 18%,#000 82%,transparent);mask-image:linear-gradient(transparent,#000 18%,#000 82%,transparent)}.usa-odo-strip{display:block;white-space:pre;line-height:1.15em;text-align:center}.usa-odo-sym{display:inline-block;height:1.15em}@media (prefers-reduced-motion:reduce){usa-progress-ring[data-indeterminate] .usa-pr-svg,usa-progress-ring[data-indeterminate] .usa-pr-fill{animation-duration:4s}}";

const PROGRESS_VARIANTS = ['ring', 'bar', 'semi'];
const NS$1 = 'http://www.w3.org/2000/svg';
function defineProgressRing(tag = 'usa-progress-ring') {
    return base.defineElement(tag, (Base) => {
        class UsaProgressRing extends Base {
            constructor() {
                super(...arguments);
                this._shown = 0;
                this._arc = null;
                this._label = null;
                this._len = 1;
                this._raf = 0;
            }
            static get observedAttributes() {
                return ['variant', 'value', 'max', 'gradient'];
            }
            get value() {
                return this.hasAttribute('value') ? this.num('value', 0) : null;
            }
            set value(v) {
                if (v === null)
                    this.removeAttribute('value');
                else
                    this.setAttribute('value', String(v));
            }
            get max() {
                return Math.max(1e-9, this.num('max', 100));
            }
            set max(v) {
                this.setAttribute('max', String(v));
            }
            changed(name) {
                if (name === 'value' && this._arc)
                    return this.update();
                super.changed(name);
            }
            mount() {
                const v = this.str('variant', 'ring');
                const variant = PROGRESS_VARIANTS.includes(v) ? v : 'ring';
                this.dataset.variant = variant;
                this.setAttribute('role', 'progressbar');
                this.setAttribute('aria-valuemin', '0');
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const stops = this.str('gradient', '').split(',').map((s) => s.trim()).filter(Boolean);
                const gid = `usa-pr-${Math.random().toString(36).slice(2, 8)}`;
                if (variant === 'bar') {
                    const track = part('div', 'usa-pr-track');
                    const fill = part('div', 'usa-pr-fill');
                    if (stops.length)
                        fill.style.background = `linear-gradient(90deg,${stops.join(',')})`;
                    track.append(fill);
                    this.append(track);
                    this._arc = fill;
                }
                else {
                    const svg = document.createElementNS(NS$1, 'svg');
                    svg.setAttribute('data-usa-part', '');
                    svg.setAttribute('aria-hidden', 'true');
                    svg.setAttribute('class', 'usa-pr-svg');
                    svg.setAttribute('width', '100%');
                    svg.setAttribute('height', '100%');
                    const semi = variant === 'semi';
                    svg.setAttribute('viewBox', semi ? '0 0 100 56' : '0 0 100 100');
                    const d = semi ? 'M 8 50 A 42 42 0 0 1 92 50' : 'M 50 8 A 42 42 0 1 1 49.99 8';
                    const grad = stops.length ? `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">${stops.map((c, i) => `<stop offset="${stops.length > 1 ? i / (stops.length - 1) : 0}" stop-color="${c}"/>`).join('')}</linearGradient></defs>` : '';
                    svg.innerHTML = `${grad}<path class="usa-pr-track" d="${d}"/><path class="usa-pr-arc" d="${d}"${stops.length ? ` stroke="url(#${gid})"` : ''}/>`;
                    this.append(svg);
                    this._arc = svg.querySelector('.usa-pr-arc');
                    this._len = semi ? Math.PI * 42 : Math.PI * 2 * 42;
                    this._arc.style.strokeDasharray = `${this._len}`;
                    this._arc.style.strokeDashoffset = `${this._len}`;
                }
                this._label = part('span', 'usa-pr-label', { 'aria-hidden': 'true' });
                if (this.flag('no-label'))
                    this._label.hidden = true;
                this.append(this._label);
                this._shown = 0;
                this.onCleanup(() => {
                    if (this._raf && typeof cancelAnimationFrame === 'function')
                        cancelAnimationFrame(this._raf);
                });
                this.update();
            }
            paint(frac) {
                const f = clampN(frac, 0, 1.08);
                if (this._arc instanceof HTMLElement)
                    this._arc.style.transform = `scaleX(${Math.min(1, f)})`;
                else if (this._arc)
                    this._arc.style.strokeDashoffset = `${(this._len * (1 - Math.min(1, f))).toFixed(2)}`;
            }
            update() {
                const v = this.value;
                const max = this.max;
                this.setAttribute('aria-valuemax', String(max));
                this.toggleAttribute('data-indeterminate', v === null);
                if (v === null) {
                    this.removeAttribute('aria-valuenow');
                    if (this._label)
                        this._label.textContent = '';
                    this.paint(0.28);
                    return;
                }
                const target = clampN(v, 0, max) / max;
                this.setAttribute('aria-valuenow', String(clampN(v, 0, max)));
                const from = this._shown;
                this._shown = target;
                const label = (f) => {
                    if (this._label)
                        this._label.textContent = `${Math.round(f * 100)}%`;
                };
                if (this._raf && typeof cancelAnimationFrame === 'function')
                    cancelAnimationFrame(this._raf);
                if (this.reduced || typeof requestAnimationFrame !== 'function') {
                    this.paint(target);
                    label(target);
                }
                else {
                    const t0 = performance.now();
                    const dur = this.num('duration', 900);
                    const step = (now) => {
                        const k = Math.min(1, (now - t0) / dur);
                        // ease-out-back: a little overshoot, then settle
                        const c = 1.4;
                        const e = 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2);
                        const f = from + (target - from) * e;
                        this.paint(f);
                        label(from + (target - from) * Math.min(1, k * 1.15));
                        this._raf = k < 1 ? requestAnimationFrame(step) : 0;
                        if (k >= 1)
                            this.paint(target);
                    };
                    this._raf = requestAnimationFrame(step);
                }
                if (target >= 1 && from < 1)
                    this.emit('complete', { value: v });
            }
        }
        return UsaProgressRing;
    }, { id: 'meters', text: css$1x });
}
function defineOdometer(tag = 'usa-odometer') {
    return base.defineElement(tag, (Base) => {
        class UsaOdometer extends Base {
            constructor() {
                super(...arguments);
                this._row = null;
                this._text = '';
            }
            static get observedAttributes() {
                return ['value', 'locale', 'decimals', 'prefix', 'suffix'];
            }
            get value() {
                return this.num('value', 0);
            }
            set value(v) {
                this.setAttribute('value', String(v));
            }
            get text() {
                return this._text;
            }
            changed(name) {
                if (name === 'value' && this._row)
                    return this.render(true);
                super.changed(name);
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this._row = part('span', 'usa-odo-row', { 'aria-hidden': 'true' });
                this.append(this._row);
                this.setAttribute('role', 'img');
                this._text = '';
                this.render(false);
            }
            format() {
                const d = Math.max(0, Math.min(6, Math.round(this.num('decimals', 0))));
                let s;
                try {
                    s = new Intl.NumberFormat(this.str('locale', '') || undefined, { minimumFractionDigits: d, maximumFractionDigits: d }).format(this.value);
                }
                catch {
                    s = this.value.toFixed(d);
                }
                return `${this.str('prefix', '')}${s}${this.str('suffix', '')}`;
            }
            column(ch) {
                const isDigit = /\d/.test(ch);
                const col = part('span', isDigit ? 'usa-odo-col' : 'usa-odo-sym');
                if (isDigit) {
                    const strip = document.createElement('span');
                    strip.className = 'usa-odo-strip';
                    strip.textContent = '01234567890123456789'.split('').join('\n');
                    col.append(strip);
                    col.dataset.d = ch;
                    strip.style.transform = `translateY(${-Number(ch) * 5}%)`;
                }
                else
                    col.textContent = ch;
                return col;
            }
            render(animate) {
                const row = this._row;
                if (!row)
                    return;
                const next = this.format();
                this._text = next;
                this.setAttribute('aria-label', next);
                const anim = animate && !this.reduced;
                const dur = this.num('duration', 1100);
                const chars = next.split('');
                const old = Array.from(row.children);
                const off = chars.length - old.length; // right-aligned: digits keep their place value
                const fresh = new Set();
                const cols = chars.map((ch, i) => {
                    const o = old[i - off];
                    const digit = /\d/.test(ch);
                    if (o && digit && o.dataset.d !== undefined)
                        return o;
                    if (o && !digit && o.dataset.d === undefined) {
                        o.textContent = ch;
                        return o;
                    }
                    const c = this.column(ch);
                    fresh.add(c);
                    return c;
                });
                row.replaceChildren(...cols);
                cols.forEach((c, i) => {
                    if (fresh.has(c)) {
                        if (anim)
                            this.motion(c, [{ opacity: 0, transform: 'translateY(-60%)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.22,1,.36,1)' });
                        return;
                    }
                    if (c.dataset.d === undefined)
                        return;
                    const to = Number(chars[i]);
                    const from = Number(c.dataset.d);
                    c.dataset.d = String(to);
                    const strip = c.firstElementChild;
                    strip.style.transform = `translateY(${-to * 5}%)`;
                    if (!anim || from === to)
                        return;
                    const end = to >= from ? -to * 5 : -(to + 10) * 5; // always roll forward
                    const place = cols.length - i;
                    this.motion(strip, [{ transform: `translateY(${-from * 5}%)` }, { transform: `translateY(${end}%)` }], { duration: Math.max(400, dur - place * 60), easing: 'cubic-bezier(.2,.9,.25,1.04)' });
                });
            }
        }
        return UsaOdometer;
    }, { id: 'meters', text: css$1x });
}

var css$1w = "usa-skeleton-reveal{position:relative;display:block;--usa-sk-base:rgba(127,127,127,.16);--usa-sk-hi:rgba(255,255,255,.55)}usa-skeleton-reveal[data-loading]>:not(.usa-sk-layer){visibility:hidden}.usa-sk-layer{position:absolute;inset:0;pointer-events:none}.usa-sk-box{position:absolute;border-radius:6px;background:var(--usa-sk-base);overflow:hidden}usa-skeleton-reveal[data-variant=\"wave\"] .usa-sk-box{background:linear-gradient(100deg,var(--usa-sk-base) 30%,var(--usa-sk-hi) 50%,var(--usa-sk-base) 70%) var(--usa-sk-x,0) 0/var(--usa-sk-w,600px) 100% no-repeat,var(--usa-sk-base);animation:usa-sk-wave 1.4s linear infinite}usa-skeleton-reveal[data-variant=\"pulse\"] .usa-sk-box{animation:usa-sk-pulse 1.2s ease-in-out infinite alternate}usa-skeleton-reveal[data-variant=\"glow\"] .usa-sk-box{animation:usa-sk-glow 1.6s ease-in-out infinite alternate}@keyframes usa-sk-wave{from{background-position:calc(var(--usa-sk-x,0px) - var(--usa-sk-w,600px)) 0,0 0}to{background-position:calc(var(--usa-sk-x,0px) + var(--usa-sk-w,600px)) 0,0 0}}@keyframes usa-sk-pulse{from{opacity:1}to{opacity:.45}}@keyframes usa-sk-glow{from{box-shadow:0 0 0 rgba(124,92,255,0)}to{box-shadow:0 0 14px rgba(124,92,255,.45);background:rgba(124,92,255,.22)}}@media (prefers-color-scheme:dark){usa-skeleton-reveal{--usa-sk-hi:rgba(255,255,255,.16)}}@media (prefers-reduced-motion:reduce){.usa-sk-box{animation:none!important}}";

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
                const layer = part('div', 'usa-sk-layer', { 'aria-hidden': 'true' });
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
    }, { id: 'skeleton-reveal', text: css$1w });
}

var css$1v = "usa-star-rating{display:inline-flex;gap:var(--usa-star-gap,4px);--usa-star-size:28px;--usa-star-on:#fbbf24;--usa-star-off:rgba(127,127,127,.28);cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent;border-radius:8px}usa-star-rating[readonly]{cursor:default}usa-star-rating:focus-visible{outline:2px solid var(--usa-star-on);outline-offset:4px}.usa-star{position:relative;display:inline-block;width:var(--usa-star-size);height:var(--usa-star-size);--usa-star-fill:0%}.usa-star svg{display:block;width:100%;height:100%;overflow:visible;stroke:none}.usa-star-bg{fill:var(--usa-star-off)}.usa-star-fg{position:absolute;left:0;top:0;bottom:0;width:var(--usa-star-fill);overflow:hidden;transition:width .18s ease-out}.usa-star-fg svg{width:var(--usa-star-size);height:var(--usa-star-size);fill:var(--usa-star-on);filter:drop-shadow(0 1px 3px rgba(251,191,36,.45))}usa-star-rating[data-preview] .usa-star-fg{opacity:.8}.usa-star-spark{position:absolute;left:50%;top:50%;width:6px;height:6px;border-radius:50%;background:var(--usa-star-on);pointer-events:none}@media (prefers-reduced-motion:reduce){.usa-star-fg{transition:none}}";

const PATHS = {
    star: 'M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z',
    heart: 'M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.9 4.5 6.6 4.5c2.1 0 3.6 1.2 5.4 3.1 1.8-1.9 3.3-3.1 5.4-3.1 3.7 0 5.7 3.9 4.2 7.3C19.5 16.4 12 21 12 21z',
};
/** <usa-rating> icon characters accepted by `icon` (7.9). */
const ICON_ALIASES = { '★': 'star', '☆': 'star', '♥': 'heart', '❤': 'heart', '❤️': 'heart' };
function defineStarRating(tag = 'usa-star-rating') {
    return base.defineElement(tag, (Base) => {
        class UsaStarRating extends Base {
            static get observedAttributes() {
                return ['max', 'icon', 'readonly', 'step'];
            }
            constructor() {
                super();
                this._internals = null;
                this._v = 0;
                this._stars = [];
                try {
                    this._internals = this.attachInternals?.() ?? null;
                }
                catch {
                    this._internals = null;
                }
            }
            get value() {
                return this._v;
            }
            set value(v) {
                this.set(v, false);
            }
            get max() {
                return Math.max(1, Math.round(this.num('max', 5)));
            }
            get step() {
                return this.num('step', 1) === 0.5 ? 0.5 : 1;
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const icon = PATHS[ICON_ALIASES[this.str('icon', 'star')] || this.str('icon', 'star')] || PATHS.star;
                this._stars = [];
                for (let i = 0; i < this.max; i++) {
                    const s = part('span', 'usa-star', { 'aria-hidden': 'true' }, `<svg viewBox="0 0 24 24" width="100%" height="100%"><path class="usa-star-bg" d="${icon}"/></svg><span class="usa-star-fg"><svg viewBox="0 0 24 24" width="24" height="24"><path d="${icon}"/></svg></span>`);
                    this._stars.push(s);
                    this.append(s);
                }
                const ro = this.flag('readonly');
                this.setAttribute('role', ro ? 'img' : 'slider');
                if (!ro) {
                    this.tabIndex = 0;
                    this.setAttribute('aria-valuemin', '0');
                    this.setAttribute('aria-valuemax', String(this.max));
                }
                if (!this.hasAttribute('aria-label'))
                    this.setAttribute('aria-label', this.str('label', 'Rating'));
                this._v = clampN(this.num('value', 0), 0, this.max);
                this.paint(this._v);
                this.sync();
                if (ro)
                    return;
                const at = (e) => {
                    const r = this._stars[0].getBoundingClientRect();
                    const last = this._stars[this._stars.length - 1].getBoundingClientRect();
                    const w = last.right - r.left || 1;
                    const raw = ((e.clientX - r.left) / w) * this.max;
                    return clampN(Math.ceil(raw / this.step) * this.step, this.step, this.max);
                };
                this.listen(this, 'pointermove', (e) => {
                    this.setAttribute('data-preview', '');
                    this.paint(at(e));
                });
                this.listen(this, 'pointerleave', () => {
                    this.removeAttribute('data-preview');
                    this.paint(this._v);
                });
                this.listen(this, 'click', (e) => this.set(at(e), true));
                this.listen(this, 'keydown', (e) => {
                    const k = e.key;
                    let v = this._v;
                    if (k === 'ArrowRight' || k === 'ArrowUp')
                        v += this.step;
                    else if (k === 'ArrowLeft' || k === 'ArrowDown')
                        v -= this.step;
                    else if (k === 'Home')
                        v = 0;
                    else if (k === 'End')
                        v = this.max;
                    else
                        return;
                    e.preventDefault();
                    this.set(v, true);
                });
            }
            sync() {
                this.setAttribute('aria-valuenow', String(this._v));
                this.setAttribute('aria-valuetext', `${this._v} of ${this.max}`);
                this._internals?.setFormValue?.(String(this._v));
                if (this.flag('readonly'))
                    this.setAttribute('aria-label', `${this.str('label', 'Rating')}: ${this._v} of ${this.max}`);
            }
            paint(v) {
                this._stars.forEach((s, i) => s.style.setProperty('--usa-star-fill', `${(clampN(v - i, 0, 1) * 100).toFixed(0)}%`));
            }
            set(v, user) {
                const nv = clampN(Math.round(v / this.step) * this.step, 0, this.max);
                const changed = nv !== this._v;
                this._v = nv;
                this.paint(nv);
                this.sync();
                if (!user)
                    return;
                const idx = Math.ceil(nv) - 1;
                if (!this.reduced && idx >= 0) {
                    const star = this._stars[idx];
                    this.motion(star, [{ transform: 'scale(1)' }, { transform: 'scale(1.45) rotate(-12deg)', offset: 0.35 }, { transform: 'scale(.92)', offset: 0.7 }, { transform: 'none' }], { duration: 520, easing: 'cubic-bezier(.3,1.4,.5,1)' });
                    this._stars.slice(0, idx).forEach((s, i) => this.motion(s, [{ transform: 'none' }, { transform: 'translateY(-5px)' }, { transform: 'none' }], { duration: 320, delay: i * 45, easing: 'ease-out' }));
                    for (let k = 0; k < 8; k++) {
                        const sp = part('span', 'usa-star-spark', { 'aria-hidden': 'true' });
                        star.append(sp);
                        const a = (k / 8) * Math.PI * 2;
                        const anim = this.motion(sp, [{ transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }, { transform: `translate(calc(-50% + ${(Math.cos(a) * 22).toFixed(1)}px), calc(-50% + ${(Math.sin(a) * 22).toFixed(1)}px)) scale(.2)`, opacity: 0 }], { duration: 520, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'forwards' });
                        const rm = () => sp.remove();
                        if (anim)
                            anim.finished.then(rm, rm);
                        else
                            rm();
                    }
                }
                if (changed) {
                    this.dispatchEvent(new Event('change', { bubbles: true }));
                    this.emit('change', { value: nv });
                }
            }
        }
        UsaStarRating.formAssociated = true;
        return UsaStarRating;
    }, { id: 'star-rating', text: css$1v });
}

var css$1u = "usa-milestones{position:relative;display:block;--usa-ms-color:#7c5cff;--usa-ms-rail:rgba(127,127,127,.22);--usa-ms-gap:28px;padding:4px 0}.usa-ms-rail{position:absolute;top:0;bottom:0;left:50%;width:3px;margin-left:-1.5px;border-radius:3px;background:var(--usa-ms-rail);overflow:hidden}.usa-ms-fill{position:absolute;inset:0;background:linear-gradient(var(--usa-ms-color),#22d3ee);transform-origin:50% 0;transform:scaleY(0)}.usa-ms-item{position:relative;box-sizing:border-box;width:50%;padding:0 var(--usa-ms-gap) var(--usa-ms-gap);text-align:left}.usa-ms-item[data-side=\"right\"]{margin-left:50%}.usa-ms-item[data-side=\"left\"]{text-align:right}.usa-ms-dot{position:absolute;top:4px;width:14px;height:14px;border-radius:50%;background:var(--usa-ms-color);box-shadow:0 0 0 4px color-mix(in srgb,var(--usa-ms-color) 22%,transparent);transform:scale(0)}.usa-ms-item[data-reached] .usa-ms-dot{transform:none}.usa-ms-item[data-side=\"right\"] .usa-ms-dot{left:-7px}.usa-ms-item[data-side=\"left\"] .usa-ms-dot{right:-7px}.usa-ms-date{display:block;font-size:.8em;font-weight:700;letter-spacing:.04em;color:var(--usa-ms-color);margin-bottom:2px}.usa-ms-item:not([data-reached])>:not(.usa-ms-dot){opacity:0}usa-milestones[data-layout=\"left\"] .usa-ms-rail{left:7px}usa-milestones[data-layout=\"left\"] .usa-ms-item{width:auto;margin-left:0;padding-left:calc(var(--usa-ms-gap) + 8px);text-align:left}usa-milestones[data-layout=\"left\"] .usa-ms-dot{left:1px;right:auto}@media (max-width:640px){usa-milestones .usa-ms-rail{left:7px}usa-milestones .usa-ms-item{width:auto;margin-left:0;padding-left:calc(var(--usa-ms-gap) + 8px);text-align:left}usa-milestones .usa-ms-item .usa-ms-dot{left:1px;right:auto}}";

function defineMilestones(tag = 'usa-milestones') {
    return base.defineElement(tag, (Base) => {
        class UsaMilestones extends Base {
            constructor() {
                super(...arguments);
                this._items = [];
                this._fill = null;
                this._reached = -1;
                this._raf = 0;
            }
            static get observedAttributes() {
                return ['layout'];
            }
            get reached() {
                return this._reached;
            }
            mount() {
                this.dataset.layout = this.str('layout', 'alternate') === 'left' ? 'left' : 'alternate';
                this.setAttribute('role', this.getAttribute('role') || 'list');
                this.querySelectorAll(':scope > .usa-ms-rail').forEach((n) => n.remove());
                const rail = part('div', 'usa-ms-rail', { 'aria-hidden': 'true' });
                this._fill = part('div', 'usa-ms-fill');
                rail.append(this._fill);
                this.prepend(rail);
                this._items = ownChildren(this, '[data-usa-part],.usa-ms-rail');
                this._items.forEach((it, i) => {
                    it.classList.add('usa-ms-item');
                    it.setAttribute('role', 'listitem');
                    it.dataset.side = this.dataset.layout === 'left' || i % 2 === 0 ? 'right' : 'left';
                    if (!it.querySelector(':scope > .usa-ms-dot'))
                        it.prepend(part('span', 'usa-ms-dot', { 'aria-hidden': 'true' }));
                    const date = it.dataset.date;
                    if (date && !it.querySelector(':scope > .usa-ms-date'))
                        it.querySelector(':scope > .usa-ms-dot').after(part('span', 'usa-ms-date', {}, ''));
                    const d = it.querySelector(':scope > .usa-ms-date');
                    if (d && date)
                        d.textContent = date;
                });
                this._reached = -1;
                if (this.reduced) {
                    this._fill.style.transform = 'scaleY(1)';
                    this._items.forEach((it) => it.setAttribute('data-reached', ''));
                    this._reached = this._items.length - 1;
                    return;
                }
                const on = () => {
                    if (!this._raf)
                        this._raf = typeof requestAnimationFrame === 'function' ? requestAnimationFrame(() => this.update()) : (this.update(), 0);
                };
                this.listen(window, 'scroll', on, { passive: true });
                this.listen(window, 'resize', on);
                this.onCleanup(() => {
                    if (this._raf && typeof cancelAnimationFrame === 'function')
                        cancelAnimationFrame(this._raf);
                });
                this.update();
            }
            /** Fill the rail up to the viewport's 60 % line and reveal the milestones it passed. */
            update() {
                this._raf = 0;
                const r = this.getBoundingClientRect();
                const vh = (typeof window !== 'undefined' && window.innerHeight) || 800;
                const line = vh * 0.6;
                const p = r.height ? Math.min(1, Math.max(0, (line - r.top) / r.height)) : 0;
                if (this._fill)
                    this._fill.style.transform = `scaleY(${p.toFixed(4)})`;
                this._items.forEach((it, i) => {
                    if (it.hasAttribute('data-reached'))
                        return;
                    const top = it.getBoundingClientRect().top;
                    if (top < line || p >= 1) {
                        it.setAttribute('data-reached', '');
                        const card = Array.from(it.children).filter((c) => !c.matches('.usa-ms-dot,.usa-ms-date'));
                        const dot = it.querySelector(':scope > .usa-ms-dot');
                        if (dot)
                            this.motion(dot, [{ transform: 'scale(0)' }, { transform: 'scale(1.5)', offset: 0.6 }, { transform: 'scale(1)' }], { duration: 420, easing: 'cubic-bezier(.3,1.4,.5,1)' });
                        const dx = it.dataset.side === 'left' ? -28 : 28;
                        card.forEach((c, k) => this.motion(c, [{ opacity: 0, transform: `translateX(${dx}px)` }, { opacity: 1, transform: 'none' }], { duration: 520, delay: 80 + k * 60, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' }));
                        if (i > this._reached)
                            this._reached = i;
                        this.emit('reach', { index: i });
                    }
                });
            }
        }
        return UsaMilestones;
    }, { id: 'milestones', text: css$1u });
}

var css$1t = "usa-masonry-flow{position:relative;display:block;width:100%}usa-masonry-flow>*{position:absolute;left:0;top:0;box-sizing:border-box;margin:0;will-change:transform}usa-masonry-flow>[data-hidden]:not([data-leaving]){display:none}usa-masonry-flow>[data-leaving]{pointer-events:none}";

function defineMasonryFlow(tag = 'usa-masonry-flow') {
    return base.defineElement(tag, (Base) => {
        class UsaMasonryFlow extends Base {
            constructor() {
                super(...arguments);
                this._cols = 1;
                this._pos = new Map();
                this._busy = false;
            }
            static get observedAttributes() {
                return ['min', 'gap'];
            }
            get columns() {
                return this._cols;
            }
            items() {
                return ownChildren(this);
            }
            mount() {
                this.layout(false);
                if (typeof ResizeObserver === 'function') {
                    let w = this.clientWidth;
                    const ro = new ResizeObserver(() => {
                        if (Math.abs(this.clientWidth - w) < 2)
                            return;
                        w = this.clientWidth;
                        this.layout(true);
                    });
                    ro.observe(this);
                    this.onCleanup(() => ro.disconnect());
                }
                if (typeof MutationObserver === 'function') {
                    const mo = new MutationObserver(() => !this._busy && this.layout(true));
                    mo.observe(this, { childList: true });
                    this.onCleanup(() => mo.disconnect());
                }
                // images change heights when they load
                this.listen(this, 'load', () => this.layout(false), { capture: true });
            }
            layout(animate = true) {
                const gap = Math.max(0, this.num('gap', 12));
                const min = Math.max(60, this.num('min', 160));
                const W = this.clientWidth || 1;
                const cols = Math.max(1, Math.floor((W + gap) / (min + gap)));
                const cw = (W - gap * (cols - 1)) / cols;
                const heights = new Array(cols).fill(0);
                const all = this.items();
                for (const it of all) {
                    const hidden = it.hasAttribute('data-hidden');
                    it.style.width = `${cw}px`;
                    if (hidden)
                        continue;
                    const c = heights.indexOf(Math.min(...heights));
                    const x = c * (cw + gap);
                    const y = heights[c];
                    heights[c] += (it.offsetHeight || 0) + gap;
                    const old = this._pos.get(it);
                    it.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
                    if (animate && !this.reduced && old && (old[0] !== x || old[1] !== y)) {
                        this.motion(it, [{ transform: `translate(${old[0].toFixed(1)}px,${old[1].toFixed(1)}px)` }, { transform: `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)` }], { duration: 520, easing: 'cubic-bezier(.22,1,.36,1)' });
                    }
                    else if (animate && !this.reduced && !old) {
                        this.motion(it, [{ opacity: 0, transform: `translate(${x.toFixed(1)}px,${(y + 20).toFixed(1)}px) scale(.9)` }, { opacity: 1, transform: `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)` }], { duration: 420, easing: 'cubic-bezier(.22,1,.36,1)' });
                    }
                    this._pos.set(it, [x, y]);
                }
                for (const k of Array.from(this._pos.keys()))
                    if (!all.includes(k) || k.hasAttribute('data-hidden'))
                        this._pos.delete(k);
                this.style.height = `${Math.max(0, Math.max(...heights) - gap)}px`;
                const changed = cols !== this._cols;
                this._cols = cols;
                if (changed || animate)
                    this.emit('layout', { columns: cols });
            }
            filter(fn) {
                const test = typeof fn === 'string' ? (el) => el.matches(fn) : fn || (() => true);
                for (const it of this.items()) {
                    const show = test(it);
                    const was = !it.hasAttribute('data-hidden');
                    if (show === was)
                        continue;
                    if (show)
                        it.removeAttribute('data-hidden');
                    else if (this.reduced)
                        it.setAttribute('data-hidden', '');
                    else {
                        const tf = it.style.transform;
                        const a = this.motion(it, [{ opacity: 1, transform: tf }, { opacity: 0, transform: `${tf} scale(.6)` }], { duration: 260, easing: 'ease-in' });
                        it.setAttribute('data-hidden', '');
                        if (a) {
                            it.setAttribute('data-leaving', '');
                            const rm = () => it.removeAttribute('data-leaving');
                            a.finished.then(rm, rm);
                        }
                    }
                }
                this.layout(true);
            }
            reorder(list) {
                this._busy = true;
                for (const it of list)
                    this.append(it);
                this._busy = false;
                this.layout(true);
            }
            shuffle() {
                const list = this.items();
                for (let i = list.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [list[i], list[j]] = [list[j], list[i]];
                }
                this.reorder(list);
            }
            sort(compare) {
                this.reorder(this.items().sort(compare));
            }
        }
        return UsaMasonryFlow;
    }, { id: 'masonry-flow', text: css$1t });
}

var css$1s = "usa-compare{position:relative;display:grid;overflow:hidden;border-radius:var(--usa-cmp-radius,14px);user-select:none;touch-action:pan-y;cursor:ew-resize;--usa-cmp-line:#fff;outline-offset:3px}usa-compare[data-orientation=\"vertical\"]{touch-action:pan-x;cursor:ns-resize}usa-compare>.usa-cmp-before,usa-compare>.usa-cmp-after{grid-area:1/1;display:block;width:100%;height:100%;object-fit:cover;pointer-events:none}.usa-cmp-handle{position:absolute;top:0;bottom:0;left:50%;width:0;z-index:2;pointer-events:none}.usa-cmp-handle::before{content:\"\";position:absolute;top:0;bottom:0;left:-1.5px;width:3px;background:var(--usa-cmp-line);box-shadow:0 0 8px rgba(0,0,0,.35)}usa-compare[data-orientation=\"vertical\"] .usa-cmp-handle{top:50%;bottom:auto;left:0;right:0;width:auto;height:0}usa-compare[data-orientation=\"vertical\"] .usa-cmp-handle::before{left:0;right:0;top:-1.5px;width:auto;height:3px}.usa-cmp-knob{position:absolute;top:50%;left:0;display:grid;place-items:center;width:40px;height:40px;margin:-20px 0 0 -20px;border-radius:50%;background:var(--usa-cmp-line);color:#111827;box-shadow:0 6px 18px rgba(0,0,0,.35);pointer-events:auto;cursor:grab;transition:transform .2s}usa-compare[data-orientation=\"vertical\"] .usa-cmp-knob{left:50%;top:0;transform:rotate(90deg)}usa-compare:active .usa-cmp-knob{transform:scale(.92)}usa-compare[data-orientation=\"vertical\"]:active .usa-cmp-knob{transform:rotate(90deg) scale(.92)}.usa-cmp-label{position:absolute;top:10px;z-index:1;padding:3px 9px;border-radius:999px;background:rgba(0,0,0,.55);color:#fff;font:600 12px/1.4 system-ui,sans-serif;pointer-events:none}.usa-cmp-label-b{left:10px}.usa-cmp-label-a{right:10px}";

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
                const [before, after] = ownChildren(this);
                this.dataset.orientation = this.vertical ? 'vertical' : 'horizontal';
                before?.classList.add('usa-cmp-before');
                after?.classList.add('usa-cmp-after');
                this._after = after || null;
                const [lb, la] = this.str('labels', '').split(',').map((s) => s.trim());
                if (lb)
                    this.append(Object.assign(part('span', 'usa-cmp-label usa-cmp-label-b', { 'aria-hidden': 'true' }), { textContent: lb }));
                if (la)
                    this.append(Object.assign(part('span', 'usa-cmp-label usa-cmp-label-a', { 'aria-hidden': 'true' }), { textContent: la }));
                const h = part('span', 'usa-cmp-handle', { 'aria-hidden': 'true' }, '<span class="usa-cmp-knob"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M9 6l-6 6 6 6M15 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>');
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
                const v = clampN(p, 0, 100);
                if (this._after)
                    this._after.style.clipPath = this.vertical ? `inset(${v}% 0 0 0)` : `inset(0 0 0 ${v}%)`;
                if (this._handle)
                    this._handle.style[this.vertical ? 'top' : 'left'] = `${v}%`;
                this.style.setProperty('--usa-cmp', `${v}%`);
            }
            set(p, user, ease = false) {
                const v = Math.round(clampN(p, 0, 100) * 10) / 10;
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
    }, { id: 'compare', text: css$1s });
}

var css$1r = "usa-cube-gallery{position:relative;display:block;aspect-ratio:4/3;perspective:1100px;outline-offset:4px}.usa-cube-stage{position:absolute;inset:0;transform-style:preserve-3d;touch-action:pan-y}.usa-cube-face{position:absolute;inset:0;box-sizing:border-box;margin:0;backface-visibility:hidden;display:none;overflow:hidden;border-radius:var(--usa-cube-radius,14px)}.usa-cube-face[data-active]{display:block}.usa-cube-face>img{width:100%;height:100%;object-fit:cover;display:block}.usa-cube-btn{position:absolute;top:50%;z-index:2;width:34px;height:34px;margin-top:-17px;border:0;border-radius:50%;background:rgba(255,255,255,.85);color:#111827;font:700 20px/1 system-ui,sans-serif;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.25)}.usa-cube-prev{left:8px}.usa-cube-next{right:8px}.usa-cube-btn:focus-visible{outline:2px solid #7c5cff;outline-offset:2px}";

function defineCubeGallery(tag = 'usa-cube-gallery') {
    return base.defineElement(tag, (Base) => {
        class UsaCubeGallery extends Base {
            constructor() {
                super(...arguments);
                this._slides = [];
                this._i = 0;
                this._stage = null;
                this._busy = false;
                this._timer = 0;
            }
            static get observedAttributes() {
                return ['axis', 'autoplay'];
            }
            get index() {
                return this._i;
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this._slides = ownChildren(this);
                this.dataset.axis = this.str('axis', 'y') === 'x' ? 'x' : 'y';
                this.setAttribute('role', 'region');
                this.setAttribute('aria-roledescription', 'carousel');
                if (!this.hasAttribute('aria-label'))
                    this.setAttribute('aria-label', this.str('label', 'Gallery'));
                this.tabIndex = 0;
                const stage = part('div', 'usa-cube-stage');
                this._slides.forEach((s, i) => {
                    s.classList.add('usa-cube-face');
                    s.setAttribute('role', 'group');
                    s.setAttribute('aria-roledescription', 'slide');
                    s.setAttribute('aria-label', `${i + 1} of ${this._slides.length}`);
                    stage.append(s);
                });
                this.append(stage);
                this._stage = stage;
                const prev = part('button', 'usa-cube-btn usa-cube-prev', { type: 'button', 'aria-label': 'Previous slide' }, '‹');
                const next = part('button', 'usa-cube-btn usa-cube-next', { type: 'button', 'aria-label': 'Next slide' }, '›');
                this.append(prev, next);
                this.listen(prev, 'click', () => this.prev());
                this.listen(next, 'click', () => this.next());
                this.listen(this, 'keydown', (e) => {
                    if (e.target !== this)
                        return;
                    if (e.key === 'ArrowRight' || e.key === 'ArrowDown')
                        this.next();
                    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp')
                        this.prev();
                    else
                        return;
                    e.preventDefault();
                });
                let x0 = NaN;
                this.listen(stage, 'pointerdown', (e) => (x0 = this.dataset.axis === 'x' ? e.clientY : e.clientX));
                this.listen(stage, 'pointerup', (e) => {
                    if (Number.isNaN(x0))
                        return;
                    const d = (this.dataset.axis === 'x' ? e.clientY : e.clientX) - x0;
                    x0 = NaN;
                    if (Math.abs(d) > 40)
                        (d < 0 ? this.next() : this.prev());
                });
                this._i = Math.min(this._i, Math.max(0, this._slides.length - 1));
                this.show();
                const ms = this.num('autoplay', 0);
                if (ms > 0 && !this.reduced) {
                    let hold = false;
                    let vis = true;
                    const pause = (v) => (hold = v);
                    this.listen(this, 'pointerenter', () => pause(true));
                    this.listen(this, 'pointerleave', () => pause(false));
                    this.listen(this, 'focusin', () => pause(true));
                    this.listen(this, 'focusout', () => pause(false));
                    this.inView((v) => (vis = v));
                    this._timer = setInterval(() => !hold && vis && this.next(), Math.max(1200, ms));
                    this.onCleanup(() => this._timer && clearInterval(this._timer));
                }
            }
            show() {
                this._slides.forEach((s, k) => {
                    const on = k === this._i;
                    s.toggleAttribute('data-active', on);
                    s.inert = !on;
                    s.style.transform = '';
                });
            }
            goTo(i) {
                const n = this._slides.length;
                if (!n || this._busy)
                    return;
                const to = ((i % n) + n) % n;
                if (to === this._i)
                    return;
                const from = this._i;
                const dir = (to > from && !(from === 0 && to === n - 1)) || (from === n - 1 && to === 0) ? 1 : -1;
                const a = this._slides[from];
                const b = this._slides[to];
                this._i = to;
                this.emit('change', { index: to, from });
                if (this.reduced || !this._stage) {
                    this.show();
                    this.motion(b, [{ opacity: 0 }, { opacity: 1 }], { duration: 200 });
                    return;
                }
                // b waits on the adjacent face; the stage turns by 90°
                const ax = this.dataset.axis === 'x' ? 'X' : 'Y';
                const half = `${(((ax === 'Y' ? this.offsetWidth : this.offsetHeight) || 280) / 2).toFixed(1)}px`;
                const faceB = ax === 'Y' ? `rotateY(${dir * 90}deg) translateZ(${half})` : `rotateX(${-dir * 90}deg) translateZ(${half})`;
                b.setAttribute('data-active', '');
                b.style.transform = faceB;
                a.style.transform = `translateZ(${half})`;
                this._busy = true;
                const turn = ax === 'Y' ? `rotateY(${-dir * 90}deg)` : `rotateX(${dir * 90}deg)`;
                const anim = this.motion(this._stage, [{ transform: `translateZ(-${half}) rotate${ax}(0deg)` }, { transform: `translateZ(-${half}) ${turn}` }], { duration: 780, easing: 'cubic-bezier(.65,.05,.3,1)' });
                const end = () => {
                    this._busy = false;
                    this.show();
                };
                if (anim)
                    anim.finished.then(end, end);
                else
                    end();
            }
            next() {
                this.goTo(this._i + 1);
            }
            prev() {
                this.goTo(this._i - 1);
            }
        }
        return UsaCubeGallery;
    }, { id: 'cube-gallery', text: css$1r });
}

var css$1q = "usa-dock{display:inline-flex;align-items:flex-end;gap:var(--usa-dock-gap,8px);padding:8px 10px;border-radius:20px;background:var(--usa-dock-bg,rgba(255,255,255,.55));-webkit-backdrop-filter:blur(14px) saturate(1.6);backdrop-filter:blur(14px) saturate(1.6);box-shadow:0 10px 30px -10px rgba(0,0,0,.35),inset 0 0 0 1px rgba(255,255,255,.45);--usa-dock-size:44px}usa-dock[data-orientation=\"vertical\"]{flex-direction:column;align-items:flex-start}.usa-dock-item{--usa-dock-s:1;position:relative;display:grid;place-items:center;flex:none;width:calc(var(--usa-dock-size) * var(--usa-dock-s));height:calc(var(--usa-dock-size) * var(--usa-dock-s));border:0;padding:0;border-radius:calc(var(--usa-dock-size) * .26 * var(--usa-dock-s));background:var(--usa-dock-item,linear-gradient(135deg,#7c5cff,#22d3ee));color:#fff;font-size:calc(var(--usa-dock-size) * .5 * var(--usa-dock-s));text-decoration:none;cursor:pointer;transition:width .12s ease-out,height .12s ease-out,font-size .12s ease-out,border-radius .12s;box-shadow:0 4px 10px rgba(0,0,0,.18)}.usa-dock-item:focus-visible{outline:2px solid #7c5cff;outline-offset:3px}.usa-dock-item[data-label]::after{content:attr(data-label);position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%) translateY(4px);padding:3px 8px;border-radius:6px;background:rgba(17,24,39,.9);color:#fff;font:500 12px/1.3 system-ui,sans-serif;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .15s,transform .15s}.usa-dock-item[data-near]::after,.usa-dock-item:focus-visible::after{opacity:1;transform:translateX(-50%)}usa-dock[data-orientation=\"vertical\"] .usa-dock-item[data-label]::after{bottom:auto;left:calc(100% + 8px);top:50%;transform:translateY(-50%)}@media (prefers-reduced-motion:reduce){.usa-dock-item{transition:none}}";

function defineDock(tag = 'usa-dock') {
    return base.defineElement(tag, (Base) => {
        class UsaDock extends Base {
            constructor() {
                super(...arguments);
                this._items = [];
                this._raf = 0;
            }
            static get observedAttributes() {
                return ['orientation', 'magnify', 'range'];
            }
            get items() {
                return this._items;
            }
            mount() {
                this.dataset.orientation = this.str('orientation', 'horizontal') === 'vertical' ? 'vertical' : 'horizontal';
                this.setAttribute('role', this.getAttribute('role') || 'toolbar');
                if (!this.hasAttribute('aria-label'))
                    this.setAttribute('aria-label', this.str('label', 'Dock'));
                this._items = ownChildren(this);
                this._items.forEach((it) => {
                    it.classList.add('usa-dock-item');
                    if (it.dataset.label && !it.getAttribute('aria-label') && !it.textContent?.trim())
                        it.setAttribute('aria-label', it.dataset.label);
                    this.listen(it, 'click', () => this.bounce(it));
                    this.listen(it, 'focus', () => this.magnifyAt(this.center(it)));
                    this.listen(it, 'blur', () => this.magnifyAt(null));
                });
                this.listen(this, 'pointermove', (e) => {
                    const v = this.dataset.orientation === 'vertical' ? e.clientY : e.clientX;
                    if (!this._raf)
                        this._raf = typeof requestAnimationFrame === 'function' ? requestAnimationFrame(() => ((this._raf = 0), this.magnifyAt(v))) : (this.magnifyAt(v), 0);
                });
                this.listen(this, 'pointerleave', () => this.magnifyAt(null));
                this.onCleanup(() => {
                    if (this._raf && typeof cancelAnimationFrame === 'function')
                        cancelAnimationFrame(this._raf);
                });
            }
            center(it) {
                const r = it.getBoundingClientRect();
                return this.dataset.orientation === 'vertical' ? r.top + r.height / 2 : r.left + r.width / 2;
            }
            /** Scale every item by its distance to `pos` (client px), or reset with `null`. */
            magnifyAt(pos) {
                const max = this.num('magnify', 1.9);
                const range = Math.max(20, this.num('range', 140));
                for (const it of this._items) {
                    let s = 1;
                    if (pos !== null && !this.reduced) {
                        const d = Math.abs(this.center(it) - pos);
                        if (d < range)
                            s = 1 + (max - 1) * (0.5 + 0.5 * Math.cos((d / range) * Math.PI));
                    }
                    it.style.setProperty('--usa-dock-s', s.toFixed(3));
                    it.toggleAttribute('data-near', s > 1.5 || (pos !== null && this.reduced && Math.abs(this.center(it) - pos) < 24));
                }
            }
            bounce(it) {
                if (this.reduced || !this.flag('bounce'))
                    return;
                const v = this.dataset.orientation === 'vertical';
                this.motion(it, [{ translate: '0 0' }, { translate: v ? '18px 0' : '0 -22px', offset: 0.3 }, { translate: '0 0', offset: 0.55 }, { translate: v ? '8px 0' : '0 -9px', offset: 0.75 }, { translate: '0 0' }], { duration: 760, easing: 'ease-out' });
            }
        }
        return UsaDock;
    }, { id: 'dock', text: css$1q });
}

var css$1p = "usa-nav-morph{position:relative;display:flex;gap:4px;align-items:center;isolation:isolate;--usa-nm-color:#7c5cff;flex-wrap:nowrap;max-width:100%;overflow-x:auto;scrollbar-width:none}usa-nav-morph::-webkit-scrollbar{display:none}usa-nav-morph>:not(.usa-nm-ink){position:relative;z-index:1;flex:none;padding:8px 12px;border-radius:10px;color:inherit;text-decoration:none;font-weight:600;white-space:nowrap;transition:color .25s;outline-offset:2px}.usa-nm-ink{position:absolute;left:0;z-index:0;width:0;pointer-events:none;background:var(--usa-nm-color)}usa-nav-morph[data-indicator=\"underline\"] .usa-nm-ink{bottom:0;height:3px;border-radius:3px}usa-nav-morph[data-indicator=\"pill\"] .usa-nm-ink,usa-nav-morph[data-indicator=\"blob\"] .usa-nm-ink{top:0;bottom:0;border-radius:10px;opacity:.16}usa-nav-morph[data-indicator=\"blob\"] .usa-nm-ink{border-radius:999px;opacity:.2}usa-nav-morph[data-indicator=\"dot\"] .usa-nm-ink{bottom:0;height:6px;background:radial-gradient(circle,var(--usa-nm-color) 3px,transparent 3.5px)}usa-nav-morph>[aria-current=\"page\"]{color:var(--usa-nm-color)}";

const NAV_INDICATORS = ['underline', 'pill', 'blob', 'dot'];
function defineNavMorph(tag = 'usa-nav-morph') {
    return base.defineElement(tag, (Base) => {
        class UsaNavMorph extends Base {
            constructor() {
                super(...arguments);
                this._links = [];
                this._ink = null;
                this._active = 0;
                this._at = -1;
            }
            static get observedAttributes() {
                return ['indicator'];
            }
            get active() {
                return this._active;
            }
            set active(i) {
                this.setActive(i, false);
            }
            mount() {
                const ind = this.str('indicator', 'underline');
                this.dataset.indicator = NAV_INDICATORS.includes(ind) ? ind : 'underline';
                if (this.localName !== 'nav' && !this.hasAttribute('role'))
                    this.setAttribute('role', 'navigation');
                if (!this.hasAttribute('aria-label'))
                    this.setAttribute('aria-label', this.str('label', 'Main'));
                this.querySelectorAll(':scope > .usa-nm-ink').forEach((n) => n.remove());
                this._links = ownChildren(this);
                this._ink = part('span', 'usa-nm-ink', { 'aria-hidden': 'true' });
                this.prepend(this._ink);
                const cur = this._links.findIndex((l) => l.getAttribute('aria-current') === 'page');
                this._active = cur >= 0 ? cur : Math.max(0, Math.min(this._links.length - 1, Math.round(this.num('active', 0))));
                this._at = -1;
                this._links.forEach((l, i) => {
                    this.listen(l, 'pointerenter', () => this.moveTo(i));
                    this.listen(l, 'focus', () => this.moveTo(i));
                    this.listen(l, 'click', () => this.setActive(i, true));
                    this.listen(l, 'keydown', (e) => {
                        const n = arrowIndex(e, i, this._links.length);
                        if (n >= 0) {
                            e.preventDefault();
                            this._links[n].focus();
                        }
                    });
                });
                this.listen(this, 'pointerleave', () => this.moveTo(this._active));
                this.listen(this, 'focusout', (e) => !this.contains(e.relatedTarget) && this.moveTo(this._active));
                this.sync();
                this.moveTo(this._active);
                if (typeof ResizeObserver === 'function') {
                    const ro = new ResizeObserver(() => this.place(this._at < 0 ? this._active : this._at));
                    ro.observe(this);
                    this.onCleanup(() => ro.disconnect());
                }
            }
            rect(i) {
                const l = this._links[i];
                return l ? [l.offsetLeft, l.offsetWidth] : [0, 0];
            }
            place(i) {
                if (!this._ink)
                    return;
                const [x, w] = this.rect(i);
                this._ink.style.transform = `translateX(${x}px)`;
                this._ink.style.width = `${w}px`;
            }
            moveTo(i) {
                const from = this._at;
                this._at = i;
                this.place(i);
                if (from < 0 || from === i || this.reduced || !this._ink)
                    return;
                const [x0, w0] = this.rect(from);
                const [x1, w1] = this.rect(i);
                const mid = x1 > x0 ? { transform: `translateX(${x0}px)`, width: `${x1 + w1 - x0}px` } : { transform: `translateX(${x1}px)`, width: `${x0 + w0 - x1}px` };
                const blob = this.dataset.indicator === 'blob';
                this.motion(this._ink, [
                    { transform: `translateX(${x0}px)`, width: `${w0}px` },
                    { ...mid, offset: 0.4, ...(blob ? { borderRadius: '40% 60% 55% 45% / 60% 40% 60% 40%' } : {}) },
                    { transform: `translateX(${x1}px)`, width: `${w1}px` },
                ], { duration: 420, easing: 'cubic-bezier(.22,1,.36,1)' });
            }
            sync() {
                this._links.forEach((l, k) => {
                    if (k === this._active)
                        l.setAttribute('aria-current', 'page');
                    else if (l.getAttribute('aria-current') === 'page')
                        l.removeAttribute('aria-current');
                });
            }
            setActive(i, user) {
                const n = Math.max(0, Math.min(this._links.length - 1, Math.round(i)));
                const changed = n !== this._active;
                this._active = n;
                this.sync();
                this.moveTo(n);
                if (changed && user)
                    this.emit('change', { index: n });
            }
        }
        return UsaNavMorph;
    }, { id: 'nav-morph', text: css$1p });
}

var css$1o = "usa-menu-toggle{display:inline-grid;place-items:center;width:var(--usa-mt-size,44px);height:var(--usa-mt-size,44px);border-radius:12px;cursor:pointer;color:inherit;-webkit-tap-highlight-color:transparent;outline-offset:2px;--usa-mt-ease:cubic-bezier(.65,.05,.36,1)}usa-menu-toggle:hover{background:rgba(127,127,127,.12)}.usa-mt-box{position:relative;width:24px;height:18px}.usa-mt-bar{position:absolute;left:0;width:100%;height:2.5px;border-radius:2px;background:currentColor;transform-origin:50% 50%}.usa-mt-bar:nth-child(1){top:0}.usa-mt-bar:nth-child(2){top:7.75px}.usa-mt-bar:nth-child(3){bottom:0}usa-menu-toggle[data-animate] .usa-mt-bar{transition:transform .38s var(--usa-mt-ease),opacity .2s,top .38s var(--usa-mt-ease),bottom .38s var(--usa-mt-ease),width .38s var(--usa-mt-ease)}usa-menu-toggle[data-animate] .usa-mt-box{transition:transform .38s var(--usa-mt-ease)}usa-menu-toggle[data-variant=\"cross\"][data-open] .usa-mt-bar:nth-child(1),usa-menu-toggle[data-variant=\"plus-x\"][data-open] .usa-mt-bar:nth-child(1){top:7.75px;transform:rotate(45deg)}usa-menu-toggle[data-variant=\"cross\"][data-open] .usa-mt-bar:nth-child(2),usa-menu-toggle[data-variant=\"plus-x\"][data-open] .usa-mt-bar:nth-child(2){opacity:0;transform:scaleX(.2)}usa-menu-toggle[data-variant=\"cross\"][data-open] .usa-mt-bar:nth-child(3),usa-menu-toggle[data-variant=\"plus-x\"][data-open] .usa-mt-bar:nth-child(3){bottom:7.75px;transform:rotate(-45deg)}usa-menu-toggle[data-variant=\"plus-x\"][data-open] .usa-mt-box{transform:rotate(180deg)}usa-menu-toggle[data-variant=\"arrow\"][data-open] .usa-mt-bar:nth-child(1){width:55%;transform:translate(-2px,3.5px) rotate(-40deg)}usa-menu-toggle[data-variant=\"arrow\"][data-open] .usa-mt-bar:nth-child(3){width:55%;transform:translate(-2px,-3.5px) rotate(40deg)}usa-menu-toggle[data-variant=\"arrow\"][data-open] .usa-mt-box{transform:rotate(180deg)}usa-menu-toggle[data-variant=\"minus\"][data-open] .usa-mt-bar:nth-child(1){top:7.75px}usa-menu-toggle[data-variant=\"minus\"][data-open] .usa-mt-bar:nth-child(3){bottom:7.75px}";

const TOGGLE_VARIANTS = ['cross', 'arrow', 'minus', 'plus-x'];
function defineMenuToggle(tag = 'usa-menu-toggle') {
    return base.defineElement(tag, (Base) => {
        class UsaMenuToggle extends Base {
            constructor() {
                super(...arguments);
                this._open = false;
            }
            static get observedAttributes() {
                return ['variant'];
            }
            get open() {
                return this._open;
            }
            set open(v) {
                this.toggle(v);
            }
            mount() {
                const v = this.str('variant', 'cross');
                this.dataset.variant = TOGGLE_VARIANTS.includes(v) ? v : 'cross';
                if (!this.querySelector(':scope > .usa-mt-box')) {
                    const box = document.createElement('span');
                    box.className = 'usa-mt-box';
                    box.setAttribute('aria-hidden', 'true');
                    box.setAttribute('data-usa-part', '');
                    box.innerHTML = '<span class="usa-mt-bar"></span><span class="usa-mt-bar"></span><span class="usa-mt-bar"></span>';
                    this.prepend(box);
                }
                this.setAttribute('role', 'button');
                if (!this.hasAttribute('tabindex'))
                    this.tabIndex = 0;
                if (!this.hasAttribute('aria-label') && !this.textContent?.trim())
                    this.setAttribute('aria-label', this.str('label', 'Menu'));
                const id = this.str('for', '');
                if (id)
                    this.setAttribute('aria-controls', id);
                this._open = this.flag('pressed');
                this.sync(false);
                this.listen(this, 'click', () => this.toggle());
                this.listen(this, 'keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.toggle();
                    }
                });
            }
            sync(animate) {
                this.setAttribute('aria-expanded', String(this._open));
                this.toggleAttribute('data-open', this._open);
                this.toggleAttribute('data-animate', animate && !this.reduced);
                const target = this.str('for', '') ? document.getElementById(this.str('for', '')) : null;
                if (!target || !animate)
                    return;
                if (this._open && typeof target.show === 'function')
                    target.show();
                else if (!this._open && typeof target.close === 'function')
                    target.close();
                else
                    target.hidden = !this._open;
            }
            toggle(force) {
                const next = typeof force === 'boolean' ? force : !this._open;
                if (next === this._open)
                    return;
                this._open = next;
                this.toggleAttribute('pressed', next);
                this.sync(true);
                this.emit('toggle', { open: next });
            }
        }
        return UsaMenuToggle;
    }, { id: 'menu-toggle', text: css$1o });
}

var css$1n = "usa-tip{position:relative;display:inline-block}.usa-tip-bubble{position:absolute;left:0;top:0;z-index:60;box-sizing:border-box;max-width:min(260px,calc(100vw - 16px));width:max-content;padding:7px 11px;border-radius:9px;background:var(--usa-tip-bg,#111827);color:var(--usa-tip-fg,#f9fafb);font:500 13px/1.4 system-ui,sans-serif;box-shadow:0 10px 26px -8px rgba(0,0,0,.4);text-align:left;white-space:normal}.usa-tip-bubble[hidden]{display:none}.usa-tip-bubble[data-placement=\"top\"]{transform-origin:50% 100%}.usa-tip-bubble[data-placement=\"bottom\"]{transform-origin:50% 0}.usa-tip-bubble[data-placement=\"left\"]{transform-origin:100% 50%}.usa-tip-bubble[data-placement=\"right\"]{transform-origin:0 50%}.usa-tip-arrow{position:absolute;width:10px;height:10px;background:inherit;transform:rotate(45deg)}.usa-tip-bubble[data-placement=\"top\"] .usa-tip-arrow{bottom:-4px;left:calc(50% - 5px + var(--usa-tip-shift,0px))}.usa-tip-bubble[data-placement=\"bottom\"] .usa-tip-arrow{top:-4px;left:calc(50% - 5px + var(--usa-tip-shift,0px))}.usa-tip-bubble[data-placement=\"left\"] .usa-tip-arrow{right:-4px;top:calc(50% - 5px)}.usa-tip-bubble[data-placement=\"right\"] .usa-tip-arrow{left:-4px;top:calc(50% - 5px)}";

const TIP_PLACEMENTS = ['top', 'bottom', 'left', 'right'];
const FLIP = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
function defineTip(tag = 'usa-tip') {
    return base.defineElement(tag, (Base) => {
        class UsaTip extends Base {
            constructor() {
                super(...arguments);
                this._bubble = null;
                this._trigger = null;
                this._open = false;
                this._t = 0;
            }
            static get observedAttributes() {
                return ['text', 'placement', 'trigger'];
            }
            get opened() {
                return this._open;
            }
            mount() {
                this.querySelectorAll(':scope > .usa-tip-bubble[data-usa-part]').forEach((n) => n.remove());
                const rich = this.querySelector(':scope > [slot="tip"], :scope > [data-tip]');
                this._trigger = Array.from(this.children).find((c) => c !== rich && !c.matches('.usa-tip-bubble'));
                const b = rich || part('span', 'usa-tip-bubble');
                b.classList.add('usa-tip-bubble');
                if (!rich)
                    b.textContent = this.str('text', '');
                b.id || (b.id = nextId('usa-tipb'));
                b.hidden = true;
                if (!b.querySelector(':scope > .usa-tip-arrow'))
                    b.append(part('span', 'usa-tip-arrow', { 'aria-hidden': 'true' }));
                if (!b.isConnected)
                    this.append(b);
                this._bubble = b;
                const click = this.str('trigger', 'hover') === 'click';
                b.setAttribute('role', click ? 'dialog' : 'tooltip');
                const t = this._trigger;
                if (t) {
                    if (click) {
                        t.setAttribute('aria-expanded', 'false');
                        t.setAttribute('aria-controls', b.id);
                        t.setAttribute('aria-haspopup', 'dialog');
                        this.listen(t, 'click', () => (this._open ? this.hide() : this.show()));
                        this.listen(document, 'pointerdown', (e) => this._open && !this.contains(e.target) && this.hide());
                    }
                    else {
                        t.setAttribute('aria-describedby', b.id);
                        const delay = this.num('delay', 120);
                        const later = (fn, ms) => {
                            if (this._t)
                                clearTimeout(this._t);
                            this._t = setTimeout(fn, ms);
                        };
                        this.listen(this, 'pointerenter', () => later(() => this.show(), delay));
                        this.listen(this, 'pointerleave', () => later(() => this.hide(), 80));
                        this.listen(t, 'focusin', () => this.show());
                        this.listen(t, 'focusout', () => this.hide());
                        this.onCleanup(() => this._t && clearTimeout(this._t));
                    }
                }
                this.listen(document, 'keydown', (e) => {
                    if (e.key === 'Escape' && this._open) {
                        this.hide();
                        if (click)
                            t?.focus();
                    }
                });
            }
            position() {
                const b = this._bubble;
                const t = this._trigger || this;
                const want = TIP_PLACEMENTS.includes(this.str('placement', 'top')) ? this.str('placement', 'top') : 'top';
                const tr = t.getBoundingClientRect();
                const br = b.getBoundingClientRect();
                const vw = document.documentElement.clientWidth || window.innerWidth || 1024;
                const vh = window.innerHeight || 768;
                const gap = 10;
                const fits = (p) => (p === 'top' ? tr.top - br.height - gap >= 4 : p === 'bottom' ? tr.bottom + br.height + gap <= vh - 4 : p === 'left' ? tr.left - br.width - gap >= 4 : tr.right + br.width + gap <= vw - 4);
                const place = fits(want) || !fits(FLIP[want]) ? want : FLIP[want];
                const host = this.getBoundingClientRect();
                let x;
                let y;
                if (place === 'top' || place === 'bottom') {
                    x = tr.left + tr.width / 2 - br.width / 2;
                    y = place === 'top' ? tr.top - br.height - gap : tr.bottom + gap;
                }
                else {
                    x = place === 'left' ? tr.left - br.width - gap : tr.right + gap;
                    y = tr.top + tr.height / 2 - br.height / 2;
                }
                const cx = Math.min(Math.max(4, x), Math.max(4, vw - br.width - 4)); // shift inside the viewport
                b.style.left = `${(cx - host.left).toFixed(1)}px`;
                b.style.top = `${(y - host.top).toFixed(1)}px`;
                b.style.setProperty('--usa-tip-shift', `${(x - cx).toFixed(1)}px`);
                b.dataset.placement = place;
                return place;
            }
            show() {
                const b = this._bubble;
                if (!b || this._open)
                    return;
                this._open = true;
                b.hidden = false;
                const place = this.position();
                this._trigger?.setAttribute('aria-expanded', this._trigger.hasAttribute('aria-expanded') ? 'true' : '');
                if (this._trigger?.getAttribute('aria-expanded') === '')
                    this._trigger.removeAttribute('aria-expanded');
                const off = place === 'top' ? '0 6px' : place === 'bottom' ? '0 -6px' : place === 'left' ? '6px 0' : '-6px 0';
                this.motion(b, this.reduced ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, translate: off, scale: '0.6' }, { opacity: 1, translate: '0 0', scale: '1.04', offset: 0.65 }, { opacity: 1, translate: '0 0', scale: '1' }], { duration: this.reduced ? 120 : 340, easing: 'cubic-bezier(.3,1.3,.5,1)' });
                this.emit('open');
            }
            hide() {
                const b = this._bubble;
                if (!b || !this._open)
                    return;
                this._open = false;
                if (this._trigger?.hasAttribute('aria-expanded'))
                    this._trigger.setAttribute('aria-expanded', 'false');
                const a = this.motion(b, [{ opacity: 1 }, { opacity: 0, scale: this.reduced ? '1' : '0.9' }], { duration: 120, easing: 'ease-in' });
                const done = () => {
                    if (!this._open)
                        b.hidden = true;
                };
                if (a)
                    a.finished.then(done, done);
                else
                    done();
                this.emit('close');
            }
        }
        return UsaTip;
    }, { id: 'tip', text: css$1n });
}

var css$1m = "usa-stepper{--usa-st-c:#7c5cff;--usa-st-size:30px;position:relative;display:flex;justify-content:space-between;gap:8px;padding:0;counter-reset:s;max-width:100%}usa-stepper[data-orientation=\"vertical\"]{flex-direction:column;gap:22px}.usa-st-rail{position:absolute;left:calc(var(--usa-st-size)/2);right:calc(var(--usa-st-size)/2);top:calc(var(--usa-st-size)/2 - 2px);height:4px;border-radius:4px;background:rgba(127,127,127,.25);pointer-events:none}usa-stepper[data-orientation=\"vertical\"] .usa-st-rail{left:calc(var(--usa-st-size)/2 - 2px);right:auto;top:calc(var(--usa-st-size)/2);bottom:calc(var(--usa-st-size)/2);width:4px;height:auto}.usa-st-fill{position:absolute;inset:0;border-radius:inherit;background:var(--usa-st-c);transform-origin:0 0;transform:scaleX(calc(var(--usa-st-p,0%) / 100%));transition:transform .55s cubic-bezier(.6,.05,.3,1)}usa-stepper[data-orientation=\"vertical\"] .usa-st-fill{transform:scaleY(calc(var(--usa-st-p,0%) / 100%))}.usa-st-step{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:6px;min-width:0;font:600 12px/1.25 system-ui,sans-serif;text-align:center;color:rgba(127,127,127,.95)}usa-stepper[data-orientation=\"vertical\"] .usa-st-step{flex-direction:row;text-align:left}.usa-st-step[data-current],.usa-st-step[data-done]{color:inherit}.usa-st-dot{position:relative;display:grid;place-items:center;flex:none;width:var(--usa-st-size);height:var(--usa-st-size);border-radius:50%;background:var(--usa-st-bg,#fff);box-shadow:inset 0 0 0 2px rgba(127,127,127,.4);color:#666;font-weight:700;transition:background .3s,box-shadow .3s,color .3s}.usa-st-step[data-current] .usa-st-dot{box-shadow:inset 0 0 0 2px var(--usa-st-c);color:var(--usa-st-c)}.usa-st-step[data-done] .usa-st-dot{background:var(--usa-st-c);box-shadow:none;color:#fff}.usa-st-check{position:absolute;width:60%;height:60%;fill:none;stroke:#fff;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:20;stroke-dashoffset:20;opacity:0}.usa-st-step[data-done] .usa-st-check{stroke-dashoffset:0;opacity:1}.usa-st-step[data-done] .usa-st-num{opacity:0}.usa-st-step[data-clickable],usa-stepper[clickable] .usa-st-step{cursor:pointer}@media (prefers-reduced-motion:reduce){.usa-st-fill,.usa-st-dot{transition:none}}";

function defineStepper(tag = 'usa-stepper') {
    return base.defineElement(tag, (Base) => {
        class UsaStepper extends Base {
            constructor() {
                super(...arguments);
                this._steps = [];
                this._v = 0;
                this._fill = null;
            }
            static get observedAttributes() {
                return ['orientation'];
            }
            get steps() {
                return this._steps;
            }
            get value() {
                return this._v;
            }
            set value(v) {
                this.go(v);
            }
            mount() {
                this.dataset.orientation = this.str('orientation', 'horizontal') === 'vertical' ? 'vertical' : 'horizontal';
                this.setAttribute('role', 'list');
                if (!this.hasAttribute('aria-label'))
                    this.setAttribute('aria-label', this.str('label', 'Progress'));
                this._steps = ownChildren(this);
                if (!this.querySelector(':scope > .usa-st-rail')) {
                    const rail = document.createElement('span');
                    rail.className = 'usa-st-rail';
                    rail.setAttribute('data-usa-part', '');
                    rail.setAttribute('aria-hidden', 'true');
                    rail.innerHTML = '<span class="usa-st-fill"></span>';
                    this.prepend(rail);
                }
                this._fill = this.querySelector('.usa-st-fill');
                this._steps.forEach((s, i) => {
                    s.classList.add('usa-st-step');
                    s.setAttribute('role', 'listitem');
                    s.style.setProperty('--usa-st-i', String(i));
                    if (!s.querySelector(':scope > .usa-st-dot')) {
                        const d = document.createElement('span');
                        d.className = 'usa-st-dot';
                        d.setAttribute('aria-hidden', 'true');
                        d.setAttribute('data-usa-part', '');
                        d.innerHTML = `<span class="usa-st-num">${i + 1}</span><svg class="usa-st-check" viewBox="0 0 16 16"><path d="M3 8.5l3.2 3L13 4.8"/></svg>`;
                        s.prepend(d);
                    }
                    if (s.hasAttribute('data-clickable') || this.flag('clickable'))
                        this.listen(s, 'click', () => this.go(i));
                });
                this._v = clampN(this.num('value', 0) | 0, 0, Math.max(0, this._steps.length - 1));
                this.sync(-1);
            }
            sync(prev) {
                const n = this._steps.length;
                this._steps.forEach((s, i) => {
                    s.toggleAttribute('data-done', i < this._v);
                    s.toggleAttribute('data-current', i === this._v);
                    if (i === this._v)
                        s.setAttribute('aria-current', 'step');
                    else
                        s.removeAttribute('aria-current');
                });
                const pct = n > 1 ? (this._v / (n - 1)) * 100 : 0;
                this.style.setProperty('--usa-st-p', pct.toFixed(2) + '%');
                if (prev < 0 || this.reduced)
                    return;
                const cur = this._steps[this._v]?.querySelector('.usa-st-dot');
                if (cur)
                    this.motion(cur, [{ transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(124,92,255,.55)' }, { transform: 'scale(1.18)', offset: 0.35 }, { transform: 'scale(1)', boxShadow: '0 0 0 12px rgba(124,92,255,0)' }], { duration: 620, easing: 'ease-out' });
                if (this._v > prev) {
                    const done = this._steps[prev]?.querySelector('.usa-st-check');
                    if (done)
                        this.motion(done, [{ strokeDashoffset: 20, transform: 'scale(.4)' }, { strokeDashoffset: 0, transform: 'scale(1)' }], { duration: 420, easing: 'cubic-bezier(.3,1.4,.5,1)' });
                }
            }
            go(i) {
                const v = clampN(Math.round(i), 0, Math.max(0, this._steps.length - 1));
                if (v === this._v)
                    return;
                const prev = this._v;
                this._v = v;
                this.setAttribute('value', String(v));
                this.sync(prev);
                this.emit('change', { value: v });
            }
            next() {
                this.go(this._v + 1);
            }
            prev() {
                this.go(this._v - 1);
            }
        }
        return UsaStepper;
    }, { id: 'stepper', text: css$1m });
}

var css$1l = "usa-pagination{--usa-pg-c:#7c5cff;display:inline-flex;align-items:center;gap:4px;max-width:100%;font:600 14px/1 system-ui,sans-serif}.usa-pg-list{position:relative;display:inline-flex;align-items:center;gap:2px;isolation:isolate}.usa-pg-ink{position:absolute;left:0;top:0;height:100%;width:0;border-radius:10px;background:var(--usa-pg-c);z-index:-1;transition:width .3s}.usa-pg-btn{display:grid;place-items:center;min-width:34px;height:34px;padding:0 6px;border:0;border-radius:10px;background:none;color:inherit;font:inherit;cursor:pointer;transition:color .25s,background .2s}.usa-pg-btn:hover:not(:disabled):not([aria-current]){background:rgba(127,127,127,.14)}.usa-pg-btn[aria-current=\"page\"]{color:#fff}.usa-pg-btn:disabled{opacity:.35;cursor:default}.usa-pg-btn:focus-visible{outline:2px solid var(--usa-pg-c);outline-offset:2px}.usa-pg-gap{min-width:20px;text-align:center;opacity:.6}@media (max-width:420px){.usa-pg-btn{min-width:28px;height:30px;padding:0 3px}}@media (prefers-reduced-motion:reduce){.usa-pg-ink{transition:none}}";

/** The visible page list: numbers and `'…'` gaps (1-based). */
function pageWindow(page, total, siblings = 1) {
    const out = [];
    const lo = Math.max(2, page - siblings);
    const hi = Math.min(total - 1, page + siblings);
    out.push(1);
    if (lo > 2)
        out.push('…');
    for (let p = lo; p <= hi; p++)
        out.push(p);
    if (hi < total - 1)
        out.push('…');
    if (total > 1)
        out.push(total);
    return out;
}
function definePagination(tag = 'usa-pagination') {
    return base.defineElement(tag, (Base) => {
        class UsaPagination extends Base {
            constructor() {
                super(...arguments);
                this._page = 1;
                this._ink = null;
                this._list = null;
            }
            static get observedAttributes() {
                return ['total', 'siblings'];
            }
            get total() {
                return Math.max(1, this.num('total', 1) | 0);
            }
            get page() {
                return this._page;
            }
            set page(p) {
                this.go(p);
            }
            mount() {
                dropParts(this);
                this.setAttribute('role', 'navigation');
                if (!this.hasAttribute('aria-label'))
                    this.setAttribute('aria-label', this.str('label', 'Pagination'));
                this._page = clampN(this.num('page', 1) | 0, 1, this.total);
                const prev = this.btn('‹', 'Previous page', 'usa-pg-prev');
                const next = this.btn('›', 'Next page', 'usa-pg-next');
                this._list = document.createElement('span');
                this._list.className = 'usa-pg-list';
                this._list.setAttribute('data-usa-part', '');
                this._ink = document.createElement('span');
                this._ink.className = 'usa-pg-ink';
                this._ink.setAttribute('aria-hidden', 'true');
                this._list.appendChild(this._ink);
                this.append(prev, this._list, next);
                this.listen(prev, 'click', () => this.go(this._page - 1));
                this.listen(next, 'click', () => this.go(this._page + 1));
                this.listen(this._list, 'click', (e) => {
                    const b = e.target.closest?.('[data-page]');
                    if (b)
                        this.go(Number(b.dataset.page));
                });
                this.render(0);
            }
            btn(txt, label, cls) {
                const b = document.createElement('button');
                b.type = 'button';
                b.className = 'usa-pg-btn ' + cls;
                b.textContent = txt;
                b.setAttribute('aria-label', label);
                b.setAttribute('data-usa-part', '');
                return b;
            }
            render(dir) {
                const list = this._list;
                const old = new Map(Array.from(list.querySelectorAll('[data-page]')).map((b) => [b.dataset.page, b]));
                list.querySelectorAll('.usa-pg-btn,.usa-pg-gap').forEach((n) => n.remove());
                for (const p of pageWindow(this._page, this.total, Math.max(0, this.num('siblings', 1) | 0))) {
                    if (p === '…') {
                        const g = document.createElement('span');
                        g.className = 'usa-pg-gap';
                        g.textContent = '…';
                        g.setAttribute('aria-hidden', 'true');
                        list.appendChild(g);
                        continue;
                    }
                    const b = this.btn(String(p), `Page ${p}`, 'usa-pg-num');
                    b.dataset.page = String(p);
                    if (p === this._page)
                        b.setAttribute('aria-current', 'page');
                    list.appendChild(b);
                    if (dir && !old.has(String(p)) && !this.reduced)
                        this.motion(b, [{ transform: `translateX(${dir * 14}px)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 280, easing: 'ease-out' });
                }
                this.querySelector('.usa-pg-prev').disabled = this._page <= 1;
                this.querySelector('.usa-pg-next').disabled = this._page >= this.total;
                this.placeInk(dir !== 0);
            }
            placeInk(animate) {
                const cur = this._list?.querySelector('[aria-current="page"]');
                const ink = this._ink;
                if (!cur || !ink)
                    return;
                const from = ink.style.transform;
                const to = `translateX(${cur.offsetLeft}px)`;
                ink.style.width = cur.offsetWidth + 'px';
                ink.style.transform = to;
                if (animate && from && from !== to && !this.reduced)
                    this.motion(ink, [{ transform: from }, { transform: `${to} scaleX(1.35) scaleY(.8)`, offset: 0.55 }, { transform: to }], { duration: 420, easing: 'cubic-bezier(.3,1.3,.5,1)' });
            }
            go(p) {
                const v = clampN(Math.round(p), 1, this.total);
                if (v === this._page)
                    return;
                const dir = v > this._page ? 1 : -1;
                this._page = v;
                this.setAttribute('page', String(v));
                this.render(dir);
                this.emit('change', { page: v });
            }
        }
        return UsaPagination;
    }, { id: 'pagination', text: css$1l });
}

var css$1k = "usa-segmented{--usa-seg-c:#7c5cff;position:relative;display:inline-flex;align-items:stretch;padding:3px;border-radius:12px;background:rgba(127,127,127,.16);isolation:isolate;max-width:100%;font:600 13px/1 system-ui,sans-serif}.usa-seg-thumb{position:absolute;top:3px;bottom:3px;left:3px;z-index:-1;border-radius:9px;background:var(--usa-seg-thumb,#fff);box-shadow:0 2px 8px rgba(0,0,0,.18),0 0 0 .5px rgba(0,0,0,.05);transform-origin:50% 50%}usa-segmented[data-variant=\"pill\"]{border-radius:999px}usa-segmented[data-variant=\"pill\"] .usa-seg-thumb{border-radius:999px;background:var(--usa-seg-c)}usa-segmented[data-variant=\"pill\"] .usa-seg-item[data-selected]{color:#fff}usa-segmented[data-variant=\"outline\"]{background:none;box-shadow:inset 0 0 0 1.5px rgba(127,127,127,.35)}usa-segmented[data-variant=\"outline\"] .usa-seg-thumb{background:none;box-shadow:inset 0 0 0 2px var(--usa-seg-c)}.usa-seg-item{flex:1 1 0;min-width:0;padding:8px 14px;border:0;border-radius:9px;background:none;color:inherit;font:inherit;white-space:nowrap;cursor:pointer;opacity:.7;transition:opacity .2s,transform .25s cubic-bezier(.3,1.4,.5,1),color .2s}.usa-seg-item[data-selected]{opacity:1;transform:scale(1.04)}.usa-seg-item:focus-visible{outline:2px solid var(--usa-seg-c);outline-offset:1px}@media (max-width:420px){.usa-seg-item{padding:8px 9px}}@media (prefers-reduced-motion:reduce){.usa-seg-item{transition:none}}";

const SEGMENTED_VARIANTS = ['ios', 'pill', 'outline'];
function defineSegmented(tag = 'usa-segmented') {
    return base.defineElement(tag, (Base) => {
        class UsaSegmented extends Base {
            constructor() {
                super(...arguments);
                this._segs = [];
                this._v = 0;
                this._thumb = null;
            }
            static get observedAttributes() {
                return ['variant'];
            }
            get segments() {
                return this._segs;
            }
            get value() {
                return this._v;
            }
            set value(v) {
                this.select(v, false);
            }
            mount() {
                const v = this.str('variant', 'ios');
                this.dataset.variant = SEGMENTED_VARIANTS.includes(v) ? v : 'ios';
                this.setAttribute('role', 'radiogroup');
                if (!this.hasAttribute('aria-label'))
                    this.setAttribute('aria-label', this.str('label', 'Options'));
                this._segs = ownChildren(this);
                if (!this.querySelector(':scope > .usa-seg-thumb')) {
                    const t = document.createElement('span');
                    t.className = 'usa-seg-thumb';
                    t.setAttribute('aria-hidden', 'true');
                    t.setAttribute('data-usa-part', '');
                    this.prepend(t);
                }
                this._thumb = this.querySelector('.usa-seg-thumb');
                const pre = this._segs.findIndex((s) => s.hasAttribute('selected') || s.getAttribute('aria-checked') === 'true');
                this._v = clampN(pre >= 0 ? pre : this.num('value', 0) | 0, 0, Math.max(0, this._segs.length - 1));
                this._segs.forEach((s, i) => {
                    s.classList.add('usa-seg-item');
                    s.setAttribute('role', 'radio');
                    this.listen(s, 'click', () => this.select(i, true));
                    this.listen(s, 'keydown', (e) => {
                        const j = arrowIndex(e, i, this._segs.length);
                        if (j < 0)
                            return;
                        e.preventDefault();
                        this.select(j, true);
                        this._segs[j].focus();
                    });
                });
                this.sync(false);
                if (typeof ResizeObserver === 'function') {
                    const ro = new ResizeObserver(() => this.place(false));
                    ro.observe(this);
                    this.onCleanup(() => ro.disconnect());
                }
            }
            sync(animate) {
                this._segs.forEach((s, i) => {
                    s.setAttribute('aria-checked', String(i === this._v));
                    s.tabIndex = i === this._v ? 0 : -1;
                    s.toggleAttribute('data-selected', i === this._v);
                });
                this.place(animate);
            }
            place(animate) {
                const s = this._segs[this._v];
                const t = this._thumb;
                if (!s || !t)
                    return;
                const from = { x: t.offsetLeft, w: t.offsetWidth };
                t.style.left = s.offsetLeft + 'px';
                t.style.width = s.offsetWidth + 'px';
                if (!animate || this.reduced || !from.w)
                    return;
                const dx = from.x - s.offsetLeft;
                const sx = from.w / (s.offsetWidth || 1);
                this.motion(t, [{ transform: `translateX(${dx}px) scaleX(${sx})` }, { transform: `translateX(${dx * 0.35}px) scaleX(${Math.max(sx, 1) * 1.18}) scaleY(.88)`, offset: 0.45 }, { transform: 'none' }], { duration: 430, easing: 'cubic-bezier(.3,1.25,.5,1)' });
            }
            select(i, user) {
                const v = clampN(i | 0, 0, Math.max(0, this._segs.length - 1));
                if (v === this._v)
                    return;
                this._v = v;
                this.sync(true);
                if (user)
                    this.emit('change', { value: v, label: this._segs[v]?.textContent?.trim() || '' });
            }
        }
        return UsaSegmented;
    }, { id: 'segmented', text: css$1k });
}

var css$1j = "usa-switch{--usa-sw-c:#34c759;--usa-sw-w:52px;--usa-sw-h:30px;display:inline-flex;align-items:center;gap:8px;cursor:pointer;-webkit-tap-highlight-color:transparent;vertical-align:middle;outline-offset:3px;border-radius:999px}usa-switch[disabled]{opacity:.45;cursor:not-allowed}.usa-sw-track{position:relative;flex:none;width:var(--usa-sw-w);height:var(--usa-sw-h);border-radius:999px;background:rgba(127,127,127,.35);overflow:hidden;transition:background .3s}.usa-sw-fill{position:absolute;inset:0;border-radius:999px;background:var(--usa-sw-c);transform:scale(0);transform-origin:calc(var(--usa-sw-h)/2) 50%;transition:transform .35s cubic-bezier(.4,0,.2,1)}usa-switch[data-on] .usa-sw-fill{transform:scale(1)}.usa-sw-thumb{position:absolute;top:3px;left:3px;width:calc(var(--usa-sw-h) - 6px);height:calc(var(--usa-sw-h) - 6px);border-radius:999px;background:#fff;box-shadow:0 2px 6px rgba(0,0,0,.25);transition:left .32s cubic-bezier(.3,1.25,.5,1),width .2s ease,background .3s,box-shadow .3s}usa-switch[data-on] .usa-sw-thumb{left:calc(var(--usa-sw-w) - var(--usa-sw-h) + 3px)}usa-switch[data-variant=\"ios\"][data-press] .usa-sw-thumb{width:calc(var(--usa-sw-h) + 2px)}usa-switch[data-variant=\"ios\"][data-press][data-on] .usa-sw-thumb{left:calc(var(--usa-sw-w) - var(--usa-sw-h) - 5px)}usa-switch[data-variant=\"daynight\"]{--usa-sw-w:64px;--usa-sw-h:32px}usa-switch[data-variant=\"daynight\"] .usa-sw-track{background:linear-gradient(#7dd3fc,#38bdf8)}usa-switch[data-variant=\"daynight\"] .usa-sw-fill{background:linear-gradient(#1e1b4b,#312e81);transform:none;opacity:0;transition:opacity .45s}usa-switch[data-variant=\"daynight\"][data-on] .usa-sw-fill{opacity:1}usa-switch[data-variant=\"daynight\"] .usa-sw-thumb{background:radial-gradient(circle at 40% 40%,#fde68a,#f59e0b);box-shadow:0 0 10px #fbbf24}usa-switch[data-variant=\"daynight\"][data-on] .usa-sw-thumb{background:radial-gradient(circle at 65% 35%,transparent 5px,#e5e7eb 5.5px);box-shadow:0 0 8px rgba(255,255,255,.5)}usa-switch[data-variant=\"daynight\"] .usa-sw-deco{position:absolute;inset:0;background:radial-gradient(circle,#fff 1px,transparent 1.5px) 12px 8px/14px 11px;opacity:0;transform:translateY(6px);transition:opacity .4s,transform .5s}usa-switch[data-variant=\"daynight\"][data-on] .usa-sw-deco{opacity:.9;transform:none}usa-switch[data-variant=\"bounce\"] .usa-sw-thumb{transition:left .28s cubic-bezier(.5,0,.75,0)}usa-switch[data-variant=\"liquid\"] .usa-sw-fill{background:linear-gradient(90deg,#22d3ee,#7c5cff)}usa-switch[data-variant=\"liquid\"] .usa-sw-thumb{transition:left .5s cubic-bezier(.68,-.4,.27,1.4)}usa-switch:focus-visible .usa-sw-track{box-shadow:0 0 0 3px rgba(124,92,255,.5)}@media (prefers-reduced-motion:reduce){.usa-sw-thumb,.usa-sw-fill,.usa-sw-deco,.usa-sw-track{transition:none!important}}";

const SWITCH_VARIANTS = ['ios', 'daynight', 'bounce', 'liquid'];
function defineSwitch(tag = 'usa-switch') {
    return base.defineElement(tag, (Base) => {
        class UsaSwitch extends Base {
            constructor() {
                super(...arguments);
                this._on = false;
                this._input = null;
            }
            static get observedAttributes() {
                return ['variant'];
            }
            get checked() {
                return this._on;
            }
            set checked(v) {
                this.toggle(!!v, false);
            }
            mount() {
                const v = this.str('variant', 'ios');
                this.dataset.variant = SWITCH_VARIANTS.includes(v) ? v : 'ios';
                if (!this.querySelector(':scope > .usa-sw-track')) {
                    const t = document.createElement('span');
                    t.className = 'usa-sw-track';
                    t.setAttribute('aria-hidden', 'true');
                    t.setAttribute('data-usa-part', '');
                    t.innerHTML = '<span class="usa-sw-fill"></span><span class="usa-sw-deco"></span><span class="usa-sw-thumb"></span>';
                    this.prepend(t);
                }
                this.setAttribute('role', 'switch');
                if (!this.hasAttribute('tabindex'))
                    this.tabIndex = 0;
                if (!this.hasAttribute('aria-label') && !this.textContent?.trim())
                    this.setAttribute('aria-label', this.str('label', 'Toggle'));
                this._on = this.flag('checked');
                if (this.str('name', '') && !this._input) {
                    this._input = document.createElement('input');
                    this._input.type = 'hidden';
                    this._input.setAttribute('data-usa-part', '');
                    this.appendChild(this._input);
                }
                this.sync(false);
                this.querySelector('.usa-sw-thumb');
                this.listen(this, 'pointerdown', () => !this.reduced && this.toggleAttribute('data-press', true));
                this.listen(this, 'pointerup', () => this.removeAttribute('data-press'));
                this.listen(this, 'pointerleave', () => this.removeAttribute('data-press'));
                this.listen(this, 'click', () => this.toggle(undefined, true));
                this.listen(this, 'keydown', (e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        this.toggle(undefined, true);
                    }
                });
            }
            sync(animate) {
                this.setAttribute('aria-checked', String(this._on));
                this.toggleAttribute('data-on', this._on);
                this.toggleAttribute('data-animate', animate && !this.reduced);
                if (this._input) {
                    this._input.name = this.str('name', '');
                    this._input.value = this.str('value', 'on');
                    this._input.disabled = !this._on;
                }
                if (!animate || this.reduced)
                    return;
                const thumb = this.querySelector('.usa-sw-thumb');
                if (thumb && this.dataset.variant === 'bounce')
                    this.motion(thumb, [{ scale: '1 1' }, { scale: '1.35 .7', offset: 0.55 }, { scale: '.9 1.1', offset: 0.75 }, { scale: '1 1' }], { duration: 520, easing: 'ease-out' });
                const fill = this.querySelector('.usa-sw-fill');
                if (fill && this.dataset.variant === 'liquid')
                    this.motion(fill, [{ borderRadius: '50% 50% 40% 60%' }, { borderRadius: '30% 70% 60% 40%', offset: 0.5 }, { borderRadius: '999px' }], { duration: 600, easing: 'ease-out' });
            }
            toggle(force, user = false) {
                if (this.flag('disabled') && user)
                    return;
                const next = typeof force === 'boolean' ? force : !this._on;
                if (next === this._on)
                    return;
                this._on = next;
                this.toggleAttribute('checked', next);
                this.sync(user);
                if (user)
                    this.emit('change', { checked: next });
            }
        }
        return UsaSwitch;
    }, { id: 'switch', text: css$1j });
}

var css$1i = "usa-kanban{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(140px,1fr);gap:12px;max-width:100%;overflow-x:auto;padding:4px;font:500 13px/1.35 system-ui,sans-serif}.usa-kb-col{display:flex;flex-direction:column;gap:8px;min-height:80px;padding:10px;border-radius:14px;background:rgba(127,127,127,.12);margin:0;list-style:none}.usa-kb-col>h1,.usa-kb-col>h2,.usa-kb-col>h3,.usa-kb-col>h4{margin:0 0 2px;font-size:12px;letter-spacing:.06em;text-transform:uppercase;opacity:.7}.usa-kb-card{padding:10px 12px;border-radius:10px;background:var(--usa-kb-card,#fff);color:#111;box-shadow:0 1px 3px rgba(0,0,0,.14);cursor:grab;touch-action:none;user-select:none;outline-offset:2px}.usa-kb-card:focus-visible{outline:2px solid #7c5cff}.usa-kb-lifted{cursor:grabbing;box-shadow:0 18px 30px -8px rgba(0,0,0,.35);transition:transform .12s}.usa-kb-held{outline:2px dashed #7c5cff;transform:scale(1.03)}.usa-kb-ph{border-radius:10px;border:2px dashed rgba(124,92,255,.5);background:rgba(124,92,255,.08)}.usa-kb-live{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}@media (prefers-reduced-motion:reduce){.usa-kb-lifted,.usa-kb-held{transition:none;transform:none!important}}";

function defineKanban(tag = 'usa-kanban') {
    return base.defineElement(tag, (Base) => {
        class UsaKanban extends Base {
            constructor() {
                super(...arguments);
                this._cols = [];
                this._live = null;
                this._held = null;
            }
            get columns() {
                return this._cols;
            }
            cardsOf(col) {
                return Array.from(col.children).filter((c) => c instanceof HTMLElement && (c.hasAttribute('data-card') || c.localName === 'li'));
            }
            mount() {
                this._cols = ownChildren(this);
                this.setAttribute('role', 'group');
                if (!this.hasAttribute('aria-label'))
                    this.setAttribute('aria-label', this.str('label', 'Board'));
                if (!this.querySelector(':scope > .usa-kb-live')) {
                    const l = document.createElement('span');
                    l.className = 'usa-kb-live';
                    l.setAttribute('data-usa-part', '');
                    l.setAttribute('aria-live', 'polite');
                    this.appendChild(l);
                }
                this._live = this.querySelector('.usa-kb-live');
                this._cols.forEach((col) => {
                    col.classList.add('usa-kb-col');
                    col.setAttribute('role', 'list');
                    const title = col.dataset.title || col.querySelector('h1,h2,h3,h4,h5,h6')?.textContent?.trim() || '';
                    if (title)
                        col.setAttribute('aria-label', title);
                    this.cardsOf(col).forEach((c) => this.prepCard(c));
                });
                this.listen(this, 'pointerdown', (e) => this.drag(e));
                this.listen(this, 'keydown', (e) => this.key(e));
            }
            prepCard(c) {
                c.classList.add('usa-kb-card');
                c.setAttribute('role', 'listitem');
                if (!c.hasAttribute('tabindex'))
                    c.tabIndex = 0;
                c.setAttribute('aria-roledescription', 'draggable card');
            }
            say(msg) {
                if (this._live)
                    this._live.textContent = msg;
            }
            colName(col) {
                return col.getAttribute('aria-label') || `column ${this._cols.indexOf(col) + 1}`;
            }
            /** FLIP: run `change`, then glide every card from its old box. */
            flip(change) {
                const cards = this._cols.flatMap((c) => this.cardsOf(c));
                const before = new Map(cards.map((c) => [c, c.getBoundingClientRect()]));
                change();
                if (this.reduced)
                    return;
                for (const c of cards) {
                    const a = before.get(c);
                    const b = c.getBoundingClientRect();
                    const dx = a.left - b.left;
                    const dy = a.top - b.top;
                    if ((dx || dy) && c !== this._held)
                        this.motion(c, [{ transform: `translate(${dx}px,${dy}px)` }, { transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)' });
                }
            }
            move(card, to, index) {
                const from = card.parentElement;
                const list = this.cardsOf(to).filter((c) => c !== card);
                const i = Math.max(0, Math.min(list.length, index));
                this.flip(() => {
                    const ref = list[i] || null;
                    if (ref)
                        to.insertBefore(card, ref);
                    else
                        to.appendChild(card);
                });
                this.emit('move', { card, from, to, index: i });
            }
            drag(e) {
                const card = e.target.closest?.('.usa-kb-card');
                if (!card || !this.contains(card) || e.button > 0)
                    return;
                const r = card.getBoundingClientRect();
                const ox = e.clientX - r.left;
                const oy = e.clientY - r.top;
                let started = false;
                let lastX = e.clientX;
                const ghost = card;
                const ph = document.createElement('div');
                ph.className = 'usa-kb-ph';
                ph.setAttribute('data-usa-part', '');
                const onMove = (ev) => {
                    if (!started) {
                        if (Math.hypot(ev.clientX - e.clientX, ev.clientY - e.clientY) < 6)
                            return;
                        started = true;
                        ph.style.height = r.height + 'px';
                        card.parentElement.insertBefore(ph, card);
                        ghost.classList.add('usa-kb-lifted');
                        ghost.style.width = r.width + 'px';
                        ghost.style.position = 'fixed';
                        ghost.style.zIndex = '1000';
                        ghost.style.pointerEvents = 'none';
                    }
                    ev.preventDefault();
                    const tilt = this.reduced ? 0 : Math.max(-8, Math.min(8, (ev.clientX - lastX) * 0.8));
                    lastX = ev.clientX;
                    ghost.style.left = ev.clientX - ox + 'px';
                    ghost.style.top = ev.clientY - oy + 'px';
                    ghost.style.transform = `rotate(${tilt}deg) scale(${this.reduced ? 1 : 1.04})`;
                    const col = this._cols.find((c) => {
                        const b = c.getBoundingClientRect();
                        return ev.clientX >= b.left && ev.clientX <= b.right;
                    });
                    if (!col)
                        return;
                    const cards = this.cardsOf(col).filter((c) => c !== card);
                    const at = cards.find((c) => {
                        const b = c.getBoundingClientRect();
                        return ev.clientY < b.top + b.height / 2;
                    });
                    if (ph.parentElement !== col || ph.nextElementSibling !== (at || null))
                        this.flip(() => (at ? col.insertBefore(ph, at) : col.appendChild(ph)));
                };
                const onUp = () => {
                    window.removeEventListener('pointermove', onMove);
                    window.removeEventListener('pointerup', onUp);
                    window.removeEventListener('pointercancel', onUp);
                    if (!started)
                        return;
                    const to = ph.parentElement;
                    const index = this.cardsOf(to).filter((c) => c !== card).indexOf(ph.nextElementSibling);
                    const from = card.parentElement;
                    const g = ghost.getBoundingClientRect();
                    to.insertBefore(card, ph);
                    ph.remove();
                    ghost.classList.remove('usa-kb-lifted');
                    ghost.style.cssText = '';
                    const b = card.getBoundingClientRect();
                    if (!this.reduced)
                        this.motion(card, [{ transform: `translate(${g.left - b.left}px,${g.top - b.top}px) rotate(3deg)` }, { transform: 'none' }], { duration: 240, easing: 'cubic-bezier(.2,.9,.3,1.2)' });
                    const list = this.cardsOf(to);
                    this.emit('move', { card, from, to, index: index < 0 ? list.indexOf(card) : list.indexOf(card) });
                    this.say(`Moved to ${this.colName(to)}, position ${list.indexOf(card) + 1}`);
                };
                window.addEventListener('pointermove', onMove, { passive: false });
                window.addEventListener('pointerup', onUp);
                window.addEventListener('pointercancel', onUp);
            }
            key(e) {
                const card = e.target.closest?.('.usa-kb-card');
                if (!card)
                    return;
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    if (this._held === card) {
                        card.removeAttribute('aria-grabbed');
                        card.classList.remove('usa-kb-held');
                        this._held = null;
                        this.say(`Dropped in ${this.colName(card.parentElement)}`);
                    }
                    else {
                        this._held = card;
                        card.setAttribute('aria-grabbed', 'true');
                        card.classList.add('usa-kb-held');
                        this.say('Picked up. Use arrow keys to move, Space to drop.');
                    }
                    return;
                }
                if (e.key === 'Escape' && this._held) {
                    this._held.classList.remove('usa-kb-held');
                    this._held.removeAttribute('aria-grabbed');
                    this._held = null;
                    return;
                }
                if (this._held !== card)
                    return;
                const col = card.parentElement;
                const ci = this._cols.indexOf(col);
                const idx = this.cardsOf(col).indexOf(card);
                let to = col;
                let i = idx;
                if (e.key === 'ArrowLeft' && ci > 0)
                    (to = this._cols[ci - 1]), (i = Math.min(idx, this.cardsOf(to).length));
                else if (e.key === 'ArrowRight' && ci < this._cols.length - 1)
                    (to = this._cols[ci + 1]), (i = Math.min(idx, this.cardsOf(to).length));
                else if (e.key === 'ArrowUp')
                    i = Math.max(0, idx - 1);
                else if (e.key === 'ArrowDown')
                    i = idx + 1;
                else
                    return;
                e.preventDefault();
                this.move(card, to, i);
                card.focus();
                this.say(`${this.colName(to)}, position ${this.cardsOf(to).indexOf(card) + 1}`);
            }
        }
        return UsaKanban;
    }, { id: 'kanban', text: css$1i });
}

var css$1h = "usa-swipe-deck{position:relative;display:grid;width:var(--usa-sd-w,240px);max-width:100%;height:var(--usa-sd-h,300px);touch-action:pan-y;outline-offset:6px;border-radius:18px}.usa-sd-card{grid-area:1/1;position:relative;display:grid;place-items:center;border-radius:18px;background:var(--usa-sd-bg,linear-gradient(160deg,#7c5cff,#22d3ee));color:#fff;font:800 22px/1.2 system-ui,sans-serif;box-shadow:0 12px 28px -10px rgba(0,0,0,.4);transition:transform .3s cubic-bezier(.3,1.3,.5,1),opacity .3s;user-select:none;cursor:grab;overflow:hidden;touch-action:none}.usa-sd-card.usa-sd-dragging{transition:none;cursor:grabbing}.usa-sd-stamp{position:absolute;top:18px;padding:4px 10px;border:3px solid currentColor;border-radius:8px;font:900 20px/1 system-ui,sans-serif;letter-spacing:.1em;opacity:0;pointer-events:none}.usa-sd-like{left:16px;color:#4ade80;transform:rotate(-14deg)}.usa-sd-nope{right:16px;color:#f87171;transform:rotate(14deg)}@media (prefers-reduced-motion:reduce){.usa-sd-card{transition:none}}";

function defineSwipeDeck(tag = 'usa-swipe-deck') {
    return base.defineElement(tag, (Base) => {
        class UsaSwipeDeck extends Base {
            constructor() {
                super(...arguments);
                this._cards = [];
                this._gone = [];
            }
            get cards() {
                return this._cards.filter((c) => !this._gone.includes(c));
            }
            get top() {
                return this.cards[0] || null;
            }
            mount() {
                this._cards = ownChildren(this);
                this._gone = [];
                this.setAttribute('role', 'region');
                this.setAttribute('aria-roledescription', 'card deck');
                if (!this.hasAttribute('aria-label'))
                    this.setAttribute('aria-label', this.str('label', 'Cards'));
                if (!this.hasAttribute('tabindex'))
                    this.tabIndex = 0;
                this._cards.forEach((c) => {
                    c.classList.add('usa-sd-card');
                    if (!c.querySelector(':scope > .usa-sd-stamp')) {
                        c.insertAdjacentHTML('beforeend', '<span class="usa-sd-stamp usa-sd-like" data-usa-part aria-hidden="true">LIKE</span><span class="usa-sd-stamp usa-sd-nope" data-usa-part aria-hidden="true">NOPE</span>');
                    }
                });
                this.layout();
                this.listen(this, 'pointerdown', (e) => this.drag(e));
                this.listen(this, 'keydown', (e) => {
                    if (e.key === 'ArrowRight')
                        this.like();
                    else if (e.key === 'ArrowLeft')
                        this.nope();
                    else if (e.key === 'Backspace' || (e.key === 'z' && (e.ctrlKey || e.metaKey)))
                        this.undo();
                    else
                        return;
                    e.preventDefault();
                });
            }
            layout() {
                this.cards.forEach((c, i) => {
                    c.style.zIndex = String(100 - i);
                    c.style.transform = i ? `translateY(${Math.min(i, 2) * 10}px) scale(${1 - Math.min(i, 2) * 0.05})` : '';
                    c.style.opacity = i > 2 ? '0' : '1';
                    c.toggleAttribute('data-top', i === 0);
                    c.setAttribute('aria-hidden', String(i !== 0));
                });
                this._cards.filter((c) => this._gone.includes(c)).forEach((c) => (c.style.visibility = 'hidden'));
            }
            stamp(c, dx) {
                const k = Math.min(1, Math.abs(dx) / Math.max(40, this.num('threshold', 110)));
                c.querySelector('.usa-sd-like')?.style.setProperty('opacity', dx > 0 ? k.toFixed(2) : '0');
                c.querySelector('.usa-sd-nope')?.style.setProperty('opacity', dx < 0 ? k.toFixed(2) : '0');
            }
            fly(dir, dx = 0, dy = 0) {
                const c = this.top;
                if (!c)
                    return;
                const index = this._cards.indexOf(c);
                this._gone.push(c);
                const sign = dir === 'right' ? 1 : -1;
                const w = this.getBoundingClientRect().width || 300;
                const done = () => {
                    c.style.visibility = 'hidden';
                    this.stamp(c, 0);
                };
                const a = this.reduced
                    ? this.motion(c, [{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: 'forwards' })
                    : this.motion(c, [{ transform: `translate(${dx}px,${dy}px) rotate(${dx * 0.06}deg)` }, { transform: `translate(${sign * w * 1.5}px,${dy + 60}px) rotate(${sign * 30}deg)`, opacity: 0.6 }], { duration: 420, easing: 'cubic-bezier(.3,.6,.4,1)', fill: 'forwards' });
                if (a)
                    a.finished.then(done, done);
                else
                    done();
                this.layout();
                const next = this.top;
                if (next && !this.reduced)
                    this.motion(next, [{ transform: 'translateY(10px) scale(.95)' }, { transform: 'none' }], { duration: 300, easing: 'cubic-bezier(.3,1.3,.5,1)' });
                this.emit('swipe', { card: c, dir, index });
                if (!this.top)
                    this.emit('empty', {});
            }
            like() {
                this.fly('right');
            }
            nope() {
                this.fly('left');
            }
            undo() {
                const c = this._gone.pop();
                if (!c)
                    return;
                c.getAnimations?.().forEach((a) => a.cancel());
                c.style.visibility = '';
                this.layout();
                if (!this.reduced)
                    this.motion(c, [{ transform: 'translate(-120%,40px) rotate(-25deg)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.2,.9,.3,1.1)' });
            }
            drag(e) {
                const c = this.top;
                if (!c || !c.contains(e.target) || e.button > 0)
                    return;
                const x0 = e.clientX;
                const y0 = e.clientY;
                const t0 = performance.now();
                let dx = 0;
                let dy = 0;
                c.setPointerCapture?.(e.pointerId);
                c.classList.add('usa-sd-dragging');
                const move = (ev) => {
                    dx = ev.clientX - x0;
                    dy = ev.clientY - y0;
                    c.style.transform = `translate(${dx}px,${dy}px) rotate(${this.reduced ? 0 : dx * 0.06}deg)`;
                    this.stamp(c, dx);
                };
                const up = () => {
                    c.removeEventListener('pointermove', move);
                    c.removeEventListener('pointerup', up);
                    c.removeEventListener('pointercancel', up);
                    c.classList.remove('usa-sd-dragging');
                    const v = Math.abs(dx) / Math.max(1, performance.now() - t0);
                    if (Math.abs(dx) > this.num('threshold', 110) || (v > 0.6 && Math.abs(dx) > 30))
                        this.fly(dx > 0 ? 'right' : 'left', dx, dy);
                    else {
                        const from = c.style.transform;
                        c.style.transform = '';
                        this.stamp(c, 0);
                        if (!this.reduced && from)
                            this.motion(c, [{ transform: from }, { transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.3,1.5,.5,1)' });
                    }
                };
                c.addEventListener('pointermove', move);
                c.addEventListener('pointerup', up);
                c.addEventListener('pointercancel', up);
            }
        }
        return UsaSwipeDeck;
    }, { id: 'swipe-deck', text: css$1h });
}

var css$1g = "usa-weather-card{--usa-wc-sky:linear-gradient(160deg,#38bdf8,#0ea5e9);position:relative;display:grid;grid-template-columns:auto 1fr;align-items:center;gap:14px;width:var(--usa-wc-w,260px);max-width:100%;padding:16px 18px;border-radius:20px;background:var(--usa-wc-sky);color:#fff;overflow:hidden;font:500 13px/1.3 system-ui,sans-serif;box-shadow:0 12px 30px -12px rgba(2,6,23,.5);transition:background .6s}usa-weather-card[data-condition=\"cloudy\"]{--usa-wc-sky:linear-gradient(160deg,#94a3b8,#64748b)}usa-weather-card[data-condition=\"rain\"]{--usa-wc-sky:linear-gradient(160deg,#475569,#1e3a8a)}usa-weather-card[data-condition=\"snow\"]{--usa-wc-sky:linear-gradient(160deg,#cbd5e1,#60a5fa);color:#0f172a}usa-weather-card[data-condition=\"storm\"]{--usa-wc-sky:linear-gradient(160deg,#1e293b,#312e81)}usa-weather-card[data-condition=\"fog\"]{--usa-wc-sky:linear-gradient(160deg,#9ca3af,#d1d5db);color:#1f2937}usa-weather-card[data-condition=\"night\"]{--usa-wc-sky:linear-gradient(160deg,#0f172a,#1e1b4b)}.usa-wc-scene{position:relative;width:76px;height:64px}.usa-wc-icon{position:absolute;inset:0}.usa-wc-icon *{position:absolute;display:block}.usa-wc-text{display:flex;flex-direction:column;gap:2px;min-width:0}.usa-wc-temp{font:800 34px/1 system-ui,sans-serif;font-variant-numeric:tabular-nums}.usa-wc-place{opacity:.8;font-size:12px}.usa-wc-sun{left:14px;top:8px;width:46px;height:46px;border-radius:50%;background:radial-gradient(circle,#fde047 55%,transparent 56%);animation:usa-wc-spin 14s linear infinite}.usa-wc-sun::before{content:\"\";position:absolute;inset:-8px;border-radius:50%;background:repeating-conic-gradient(#fde047 0 8deg,transparent 8deg 30deg);-webkit-mask:radial-gradient(circle,transparent 58%,#000 60%,#000 70%,transparent 72%);mask:radial-gradient(circle,transparent 58%,#000 60%,#000 70%,transparent 72%)}.usa-wc-moon{left:18px;top:6px;width:40px;height:40px;border-radius:50%;box-shadow:-10px 6px 0 2px #f1f5f9;transform:rotate(-20deg)}.usa-wc-star{width:3px;height:3px;border-radius:50%;background:#fff;left:calc(8px + var(--i) * 14px);top:calc(40px + (var(--i) * 7px) % 20px);animation:usa-wc-tw 1.8s calc(var(--i) * .35s) ease-in-out infinite alternate}.usa-wc-cloud{left:8px;top:14px;width:56px;height:22px;border-radius:12px;background:#f1f5f9;animation:usa-wc-drift 4s ease-in-out infinite alternate}.usa-wc-cloud::before{content:\"\";position:absolute;left:12px;top:-12px;width:26px;height:26px;border-radius:50%;background:inherit}.usa-wc-c2{left:22px;top:6px;transform:scale(.7);opacity:.75;animation-delay:-2s}.usa-wc-dark{background:#94a3b8}.usa-wc-drop{left:calc(16px + var(--i) * 8px);top:38px;width:2px;height:9px;border-radius:2px;background:#bfdbfe;animation:usa-wc-fall .9s calc(var(--i) * .17s) linear infinite}.usa-wc-flake{left:calc(14px + var(--i) * 9px);top:38px;width:6px;height:6px;border-radius:50%;background:#fff;animation:usa-wc-snow 2.4s calc(var(--i) * .4s) linear infinite}.usa-wc-bolt{left:30px;top:30px;width:14px;height:26px;background:#fde047;clip-path:polygon(40% 0,100% 0,60% 45%,100% 45%,20% 100%,40% 55%,0 55%);animation:usa-wc-bolt 4s ease-in-out infinite}.usa-wc-fogband{left:4px;top:calc(14px + var(--i) * 14px);width:66px;height:6px;border-radius:6px;background:rgba(255,255,255,.85);animation:usa-wc-drift calc(3s + var(--i) * .8s) ease-in-out infinite alternate}@keyframes usa-wc-spin{to{transform:rotate(360deg)}}@keyframes usa-wc-tw{from{opacity:.2}to{opacity:1}}@keyframes usa-wc-drift{from{translate:-4px 0}to{translate:6px 0}}@keyframes usa-wc-fall{from{translate:0 0;opacity:1}to{translate:-3px 22px;opacity:0}}@keyframes usa-wc-snow{from{translate:0 0;opacity:1}50%{translate:4px 12px}to{translate:-2px 24px;opacity:0}}@keyframes usa-wc-bolt{0%,86%,100%{opacity:.35}90%{opacity:1}}@media (prefers-reduced-motion:reduce){usa-weather-card *{animation:none!important}}";

const WEATHER_CONDITIONS = ['clear', 'cloudy', 'rain', 'snow', 'storm', 'fog', 'night'];
const LABEL = { clear: 'Clear', cloudy: 'Cloudy', rain: 'Rain', snow: 'Snow', storm: 'Thunderstorm', fog: 'Fog', night: 'Clear night' };
const icon$1 = (c) => {
    const drops = (cls, n) => Array.from({ length: n }, (_, i) => `<i class="${cls}" style="--i:${i}"></i>`).join('');
    switch (c) {
        case 'clear':
            return '<span class="usa-wc-sun"></span>';
        case 'night':
            return `<span class="usa-wc-moon"></span>${drops('usa-wc-star', 5)}`;
        case 'cloudy':
            return '<span class="usa-wc-cloud usa-wc-c2"></span><span class="usa-wc-cloud"></span>';
        case 'rain':
            return `<span class="usa-wc-cloud"></span>${drops('usa-wc-drop', 6)}`;
        case 'snow':
            return `<span class="usa-wc-cloud"></span>${drops('usa-wc-flake', 6)}`;
        case 'storm':
            return `<span class="usa-wc-cloud usa-wc-dark"></span><span class="usa-wc-bolt"></span>${drops('usa-wc-drop', 4)}`;
        default:
            return `${drops('usa-wc-fogband', 3)}`;
    }
};
function defineWeatherCard(tag = 'usa-weather-card') {
    return base.defineElement(tag, (Base) => {
        class UsaWeatherCard extends Base {
            static get observedAttributes() {
                return ['condition', 'temp', 'place', 'unit', 'label'];
            }
            get condition() {
                return this.dataset.condition || 'clear';
            }
            set condition(v) {
                this.setAttribute('condition', v);
            }
            mount() {
                const c = this.str('condition', 'clear');
                const cond = WEATHER_CONDITIONS.includes(c) ? c : 'clear';
                const changed = this.dataset.condition && this.dataset.condition !== cond;
                this.dataset.condition = cond;
                const temp = this.num('temp', NaN);
                const unit = this.str('unit', '°');
                const label = this.str('label', LABEL[cond]);
                const place = this.str('place', '');
                this.setAttribute('role', 'group');
                this.setAttribute('aria-label', [label, Number.isFinite(temp) ? `${Math.round(temp)}${unit}` : '', place].filter(Boolean).join(', '));
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const scene = document.createElement('div');
                scene.className = 'usa-wc-scene';
                scene.setAttribute('aria-hidden', 'true');
                scene.setAttribute('data-usa-part', '');
                scene.innerHTML = `<span class="usa-wc-icon">${icon$1(cond)}</span>`;
                const text = document.createElement('div');
                text.className = 'usa-wc-text';
                text.setAttribute('data-usa-part', '');
                text.setAttribute('aria-hidden', 'true');
                text.innerHTML = `<b class="usa-wc-temp">${Number.isFinite(temp) ? Math.round(temp) + unit : ''}</b><span class="usa-wc-label"></span><span class="usa-wc-place"></span>`;
                text.querySelector('.usa-wc-label').textContent = label;
                text.querySelector('.usa-wc-place').textContent = place;
                this.prepend(scene, text);
                if (this.reduced)
                    return;
                if (changed)
                    this.motion(scene, [{ opacity: 0, transform: 'scale(.9)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'ease-out' });
                if (Number.isFinite(temp) && typeof requestAnimationFrame === 'function') {
                    const el = text.querySelector('.usa-wc-temp');
                    const t0 = performance.now();
                    const from = Math.round(temp) - Math.min(12, Math.abs(Math.round(temp)) + 6);
                    let raf = 0;
                    const f = (now) => {
                        const k = Math.min(1, (now - t0) / 900);
                        el.textContent = Math.round(from + (Math.round(temp) - from) * (1 - Math.pow(1 - k, 3))) + unit;
                        if (k < 1)
                            raf = requestAnimationFrame(f);
                    };
                    raf = requestAnimationFrame(f);
                    this.onCleanup(() => cancelAnimationFrame(raf));
                }
            }
        }
        return UsaWeatherCard;
    }, { id: 'weather-card', text: css$1g });
}

var css$1f = "usa-pull-cord{--usa-pc-color:#cbd5e1;--usa-pc-light:#fde68a;position:relative;display:inline-flex;flex-direction:column;align-items:center;width:90px;height:190px;cursor:pointer;touch-action:none;user-select:none;outline-offset:4px;border-radius:12px}.usa-pc-lamp{position:relative;width:76px;height:38px;border-radius:38px 38px 6px 6px;background:linear-gradient(#475569,#334155);box-shadow:0 0 0 rgba(253,230,138,0);transition:box-shadow .35s,background .35s}.usa-pc-lamp::after{content:\"\";position:absolute;left:50%;bottom:-10px;width:22px;height:12px;margin-left:-11px;border-radius:0 0 12px 12px;background:#64748b;transition:background .35s,box-shadow .35s}usa-pull-cord[data-on] .usa-pc-lamp{background:linear-gradient(#f59e0b,#d97706);box-shadow:0 30px 60px 10px rgba(253,230,138,.55)}usa-pull-cord[data-on] .usa-pc-lamp::after{background:var(--usa-pc-light);box-shadow:0 0 22px 8px var(--usa-pc-light)}.usa-pc-svg{width:80px;height:150px;margin-top:-2px;overflow:visible}.usa-pc-cord{fill:none;stroke:var(--usa-pc-color);stroke-width:2.2;stroke-linecap:round}.usa-pc-knob{fill:#e2e8f0;stroke:#94a3b8;stroke-width:1.5}usa-pull-cord[data-on] .usa-pc-knob{fill:var(--usa-pc-light)}@media (prefers-reduced-motion:reduce){.usa-pc-lamp,.usa-pc-lamp::after{transition:none}}";

function definePullCord(tag = 'usa-pull-cord') {
    return base.defineElement(tag, (Base) => {
        class UsaPullCord extends Base {
            constructor() {
                super(...arguments);
                this._on = false;
                this._raf = 0;
                this._x = 0;
                this._y = 0;
                this._vx = 0;
                this._vy = 0;
            }
            get on() {
                return this._on;
            }
            set on(v) {
                this.toggle(!!v, false);
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this.insertAdjacentHTML('afterbegin', '<span class="usa-pc-lamp" data-usa-part aria-hidden="true"></span><svg class="usa-pc-svg" data-usa-part aria-hidden="true" viewBox="-40 0 80 150"><path class="usa-pc-cord" d="M0 0 L0 90"/><circle class="usa-pc-knob" cx="0" cy="96" r="7"/></svg>');
                this.setAttribute('role', 'switch');
                if (!this.hasAttribute('tabindex'))
                    this.tabIndex = 0;
                if (!this.hasAttribute('aria-label'))
                    this.setAttribute('aria-label', this.str('label', 'Light'));
                this._on = this.flag('on');
                this.sync();
                this.draw();
                this.listen(this, 'keydown', (e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        this.pull();
                    }
                });
                this.listen(this, 'pointerdown', (e) => this.drag(e));
                this.onCleanup(() => this._raf && cancelAnimationFrame(this._raf));
            }
            sync() {
                this.setAttribute('aria-checked', String(this._on));
                this.toggleAttribute('data-on', this._on);
            }
            draw() {
                const cord = this.querySelector('.usa-pc-cord');
                const knob = this.querySelector('.usa-pc-knob');
                const ex = this._x;
                const ey = 90 + this._y;
                cord?.setAttribute('d', `M0 0 Q${(ex * 0.5).toFixed(1)} ${(ey * 0.55).toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`);
                knob?.setAttribute('cx', ex.toFixed(1));
                knob?.setAttribute('cy', (ey + 6).toFixed(1));
            }
            /** Damped spring back to rest. */
            release() {
                if (this.reduced || typeof requestAnimationFrame !== 'function') {
                    this._x = this._y = 0;
                    this.draw();
                    return;
                }
                let last = 0;
                const f = (now) => {
                    const dt = last ? Math.min(0.033, (now - last) / 1000) : 1 / 60;
                    last = now;
                    this._vx += (-120 * this._x - 3 * this._vx) * dt;
                    this._vy += (-260 * this._y - 9 * this._vy) * dt;
                    this._x += this._vx * dt;
                    this._y += this._vy * dt;
                    this.draw();
                    if (Math.abs(this._x) + Math.abs(this._y) + Math.abs(this._vx) + Math.abs(this._vy) > 0.05)
                        this._raf = requestAnimationFrame(f);
                    else
                        ((this._raf = 0), (this._x = this._y = this._vx = this._vy = 0), this.draw());
                };
                if (!this._raf)
                    this._raf = requestAnimationFrame(f);
            }
            /** Pull once (keyboard / click): tug the cord and toggle. */
            pull() {
                this._y = 26;
                this._vx = (Math.random() - 0.5) * 60;
                this.draw();
                this.toggle(undefined, true);
                this.release();
            }
            drag(e) {
                if (e.button > 0)
                    return;
                const y0 = e.clientY;
                const x0 = e.clientX;
                let moved = false;
                if (this._raf)
                    (cancelAnimationFrame(this._raf), (this._raf = 0));
                const move = (ev) => {
                    moved = moved || Math.abs(ev.clientY - y0) > 4;
                    this._y = Math.max(0, Math.min(50, ev.clientY - y0));
                    this._x = Math.max(-30, Math.min(30, (ev.clientX - x0) * 0.6));
                    this.draw();
                };
                const up = () => {
                    window.removeEventListener('pointermove', move);
                    window.removeEventListener('pointerup', up);
                    window.removeEventListener('pointercancel', up);
                    if (!moved)
                        return this.pull();
                    if (this._y >= this.num('threshold', 24))
                        this.toggle(undefined, true);
                    this._vy = -this._y * 2;
                    this.release();
                };
                window.addEventListener('pointermove', move);
                window.addEventListener('pointerup', up);
                window.addEventListener('pointercancel', up);
            }
            toggle(force, user = false) {
                const next = typeof force === 'boolean' ? force : !this._on;
                if (next === this._on)
                    return;
                this._on = next;
                this.toggleAttribute('on', next);
                this.sync();
                const lamp = this.querySelector('.usa-pc-lamp');
                if (user && lamp && !this.reduced)
                    this.motion(lamp, [{ transform: 'translateY(0)' }, { transform: 'translateY(3px)', offset: 0.3 }, { transform: 'translateY(0)' }], { duration: 300, easing: 'ease-out' });
                if (user)
                    this.emit('change', { on: next });
            }
        }
        return UsaPullCord;
    }, { id: 'pull-cord', text: css$1f });
}

var css$1e = "usa-date-picker{--usa-dp-c:#7c5cff;display:inline-block;width:var(--usa-dp-w,280px);max-width:100%;padding:12px;border-radius:16px;background:var(--usa-dp-bg,#fff);color:#111827;box-shadow:0 10px 30px -12px rgba(0,0,0,.3);font:500 13px/1 system-ui,sans-serif;user-select:none}.usa-dp-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}.usa-dp-title{font-weight:700;font-size:14px}.usa-dp-nav{width:30px;height:30px;border:0;border-radius:8px;background:none;color:inherit;font-size:18px;cursor:pointer}.usa-dp-nav:hover{background:rgba(127,127,127,.14)}.usa-dp-viewport{overflow:hidden}.usa-dp-row{display:grid;grid-template-columns:repeat(7,1fr);gap:2px}.usa-dp-dow{margin-bottom:4px;font-size:11px;opacity:.55;text-align:center}.usa-dp-day{position:relative;display:grid;place-items:center;aspect-ratio:1;border-radius:50%;cursor:pointer;font-variant-numeric:tabular-nums;outline:none;transition:background .2s,color .2s}.usa-dp-day:hover{background:rgba(124,92,255,.12)}.usa-dp-day[data-out]{opacity:.35}.usa-dp-day[data-today]{box-shadow:inset 0 0 0 1.5px var(--usa-dp-c)}.usa-dp-day[aria-selected=\"true\"]{background:var(--usa-dp-c);color:#fff}.usa-dp-day[aria-disabled]{opacity:.2;cursor:not-allowed;text-decoration:line-through}.usa-dp-day:focus-visible{box-shadow:0 0 0 2px #fff,0 0 0 4px var(--usa-dp-c)}@media (prefers-reduced-motion:reduce){.usa-dp-day{transition:none}}";

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
/** Parse `YYYY-MM-DD` as a local date (or null). */
function parseISODate(s) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
    if (!m)
        return null;
    const d = new Date(+m[1], +m[2] - 1, +m[3]);
    return d.getMonth() === +m[2] - 1 ? d : null;
}
/** The 6×7 day grid of a month (first row starts on `firstDay`). */
function monthGrid(year, month, firstDay = 1) {
    const first = new Date(year, month, 1);
    const off = (first.getDay() - firstDay + 7) % 7;
    return Array.from({ length: 42 }, (_, i) => new Date(year, month, 1 - off + i));
}
function defineDatePicker(tag = 'usa-date-picker') {
    return base.defineElement(tag, (Base) => {
        class UsaDatePicker extends Base {
            constructor() {
                super(...arguments);
                this._value = null;
                this._view = new Date();
                this._focus = new Date();
            }
            static get observedAttributes() {
                return ['min', 'max', 'first-day', 'locale'];
            }
            get value() {
                return this._value ? iso(this._value) : '';
            }
            set value(v) {
                const d = parseISODate(v);
                this._value = d;
                if (d)
                    (this._view = new Date(d.getFullYear(), d.getMonth(), 1)), (this._focus = d);
                if (this.isConnected)
                    this.render(0);
            }
            get month() {
                return iso(this._view).slice(0, 7);
            }
            mount() {
                const v = parseISODate(this.getAttribute('value'));
                if (v)
                    (this._value = v), (this._focus = v);
                else
                    this._focus = this._value || new Date();
                this._view = new Date(this._focus.getFullYear(), this._focus.getMonth(), 1);
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this.insertAdjacentHTML('afterbegin', '<div class="usa-dp-head" data-usa-part><button type="button" class="usa-dp-nav" data-d="-1" aria-label="Previous month">‹</button><span class="usa-dp-title" aria-live="polite"></span><button type="button" class="usa-dp-nav" data-d="1" aria-label="Next month">›</button></div><div class="usa-dp-viewport" data-usa-part><div class="usa-dp-grid" role="grid"></div></div>');
                this.listen(this, 'click', (e) => {
                    const t = e.target;
                    const nav = t.closest?.('.usa-dp-nav');
                    if (nav)
                        return this.showMonth(Number(nav.dataset.d));
                    const day = t.closest?.('[data-date]');
                    if (day && !day.hasAttribute('aria-disabled'))
                        this.pick(parseISODate(day.dataset.date));
                });
                this.listen(this, 'keydown', (e) => this.key(e));
                this.render(0);
            }
            inRange(d) {
                const lo = parseISODate(this.getAttribute('min'));
                const hi = parseISODate(this.getAttribute('max'));
                return (!lo || d >= lo) && (!hi || d <= hi);
            }
            render(dir, focus = false) {
                const grid = this.querySelector('.usa-dp-grid');
                if (!grid)
                    return;
                const loc = this.str('locale', '') || undefined;
                const fd = this.num('first-day', 1);
                const title = this.querySelector('.usa-dp-title');
                title.textContent = this._view.toLocaleDateString(loc, { month: 'long', year: 'numeric' });
                const days = monthGrid(this._view.getFullYear(), this._view.getMonth(), fd);
                const names = days.slice(0, 7).map((d) => d.toLocaleDateString(loc, { weekday: 'narrow' }));
                const today = iso(new Date());
                const sel = this.value;
                const foc = iso(this._focus);
                let html = `<div role="row" class="usa-dp-row usa-dp-dow">${names.map((n) => `<span role="columnheader">${n}</span>`).join('')}</div>`;
                for (let r = 0; r < 6; r++) {
                    html += '<div role="row" class="usa-dp-row">';
                    for (const d of days.slice(r * 7, r * 7 + 7)) {
                        const k = iso(d);
                        const out = d.getMonth() !== this._view.getMonth();
                        const dis = !this.inRange(d);
                        html += `<span role="gridcell" class="usa-dp-day" data-date="${k}"${out ? ' data-out' : ''}${k === today ? ' data-today' : ''} aria-selected="${k === sel}"${dis ? ' aria-disabled="true"' : ''} tabindex="${k === foc ? 0 : -1}" aria-label="${d.toLocaleDateString(loc, { day: 'numeric', month: 'long', year: 'numeric' })}">${d.getDate()}</span>`;
                    }
                    html += '</div>';
                }
                grid.innerHTML = html;
                if (focus)
                    grid.querySelector(`[data-date="${foc}"]`)?.focus();
                if (dir && !this.reduced)
                    this.motion(grid, [{ transform: `translateX(${dir * 30}%)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 320, easing: 'cubic-bezier(.2,.8,.2,1)' });
            }
            showMonth(delta) {
                this._view = new Date(this._view.getFullYear(), this._view.getMonth() + delta, 1);
                this._focus = new Date(this._view);
                this.render(Math.sign(delta));
            }
            pick(d) {
                if (!this.inRange(d))
                    return;
                this._value = d;
                this._focus = d;
                const dir = d.getMonth() !== this._view.getMonth() || d.getFullYear() !== this._view.getFullYear() ? (d > this._view ? 1 : -1) : 0;
                if (dir)
                    this._view = new Date(d.getFullYear(), d.getMonth(), 1);
                this.setAttribute('value', iso(d));
                this.render(dir, true);
                const cell = this.querySelector(`[data-date="${iso(d)}"]`);
                if (cell && !this.reduced)
                    this.motion(cell, [{ transform: 'scale(.6)' }, { transform: 'scale(1.15)', offset: 0.6 }, { transform: 'scale(1)' }], { duration: 380, easing: 'ease-out' });
                this.emit('change', { value: iso(d), date: d });
            }
            key(e) {
                if (!e.target.closest?.('[data-date]'))
                    return;
                const f = new Date(this._focus);
                const step = {
                    ArrowLeft: () => f.setDate(f.getDate() - 1),
                    ArrowRight: () => f.setDate(f.getDate() + 1),
                    ArrowUp: () => f.setDate(f.getDate() - 7),
                    ArrowDown: () => f.setDate(f.getDate() + 7),
                    PageUp: () => f.setMonth(f.getMonth() - 1),
                    PageDown: () => f.setMonth(f.getMonth() + 1),
                    Home: () => f.setDate(f.getDate() - ((f.getDay() - this.num('first-day', 1) + 7) % 7)),
                    End: () => f.setDate(f.getDate() + 6 - ((f.getDay() - this.num('first-day', 1) + 7) % 7)),
                };
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    return this.pick(this._focus);
                }
                if (!step[e.key])
                    return;
                e.preventDefault();
                step[e.key]();
                const dir = f.getMonth() !== this._view.getMonth() ? (f > this._view ? 1 : -1) : 0;
                this._focus = f;
                if (dir)
                    this._view = new Date(f.getFullYear(), f.getMonth(), 1);
                this.render(dir, true);
            }
        }
        return UsaDatePicker;
    }, { id: 'date-picker', text: css$1e });
}

var css$1d = "usa-color-picker{display:inline-flex;flex-direction:column;gap:10px;width:var(--usa-cp-w,240px);max-width:100%;padding:12px;border-radius:16px;background:var(--usa-cp-bg,#fff);box-shadow:0 10px 30px -12px rgba(0,0,0,.3)}.usa-cp-sv{position:relative;height:140px;border-radius:10px;background:linear-gradient(to top,#000,transparent),linear-gradient(to right,#fff,hsl(var(--usa-cp-h) 100% 50%));cursor:crosshair;touch-action:none;outline-offset:2px}.usa-cp-thumb{position:absolute;left:var(--usa-cp-x);top:var(--usa-cp-y);width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;background:var(--usa-cp-color);box-shadow:0 0 0 3px #fff,0 2px 6px rgba(0,0,0,.4);pointer-events:none;transition:left .18s cubic-bezier(.3,1.4,.5,1),top .18s cubic-bezier(.3,1.4,.5,1),transform .2s}[data-drag]>.usa-cp-thumb{transition:none;transform:scale(1.2)}.usa-cp-row{display:flex;align-items:center;gap:10px}.usa-cp-chip{flex:none;width:30px;height:30px;border-radius:50%;background:var(--usa-cp-color);box-shadow:inset 0 0 0 1px rgba(0,0,0,.1)}.usa-cp-hue{position:relative;flex:1;height:14px;border-radius:7px;background:linear-gradient(90deg,red,#ff0,lime,cyan,blue,#f0f,red);cursor:pointer;touch-action:none;outline-offset:2px}.usa-cp-hue .usa-cp-thumb{left:var(--usa-cp-hx);top:50%;background:hsl(var(--usa-cp-h) 100% 50%)}.usa-cp-swatches{display:flex;flex-wrap:wrap;gap:6px}.usa-cp-sw{width:22px;height:22px;border:0;border-radius:50%;cursor:pointer;box-shadow:inset 0 0 0 1px rgba(0,0,0,.12)}.usa-cp-sv:focus-visible,.usa-cp-hue:focus-visible,.usa-cp-sw:focus-visible{outline:2px solid #7c5cff}@media (prefers-reduced-motion:reduce){.usa-cp-thumb{transition:none}}";

/** HSV (h 0–360, s / v 0–1) → `#rrggbb`. */
function hsvToHex(h, s, v) {
    const f = (n) => {
        const k = (n + h / 60) % 6;
        return Math.round((v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255);
    };
    return '#' + [f(5), f(3), f(1)].map((x) => x.toString(16).padStart(2, '0')).join('');
}
/** `#rrggbb` → HSV (or null). */
function hexToHsv(hex) {
    const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex.trim());
    if (!m)
        return null;
    const [r, g, b] = [m[1], m[2], m[3]].map((x) => parseInt(x, 16) / 255);
    const mx = Math.max(r, g, b);
    const d = mx - Math.min(r, g, b);
    let h = 0;
    if (d)
        h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [(h * 60 + 360) % 360, mx ? d / mx : 0, mx];
}
function defineColorPicker(tag = 'usa-color-picker') {
    return base.defineElement(tag, (Base) => {
        class UsaColorPicker extends Base {
            constructor() {
                super(...arguments);
                this._h = 260;
                this._s = 0.64;
                this._v = 1;
            }
            static get observedAttributes() {
                return ['swatches'];
            }
            get value() {
                return hsvToHex(this._h, this._s, this._v);
            }
            set value(v) {
                const hsv = hexToHsv(v);
                if (!hsv)
                    return;
                [this._h, this._s, this._v] = hsv;
                this.paint(true);
            }
            mount() {
                const hsv = hexToHsv(this.str('value', '#7c5cff'));
                if (hsv)
                    [this._h, this._s, this._v] = hsv;
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const sw = this.str('swatches', '').split(',').map((s) => s.trim()).filter((s) => hexToHsv(s));
                this.insertAdjacentHTML('afterbegin', `<div class="usa-cp-sv" data-usa-part role="slider" tabindex="0" aria-label="Saturation and brightness"><span class="usa-cp-thumb"></span></div><div class="usa-cp-row" data-usa-part><span class="usa-cp-chip" aria-hidden="true"></span><div class="usa-cp-hue" role="slider" tabindex="0" aria-label="Hue" aria-valuemin="0" aria-valuemax="360"><span class="usa-cp-thumb"></span></div></div>${sw.length ? `<div class="usa-cp-swatches" data-usa-part>${sw.map((c) => `<button type="button" class="usa-cp-sw" style="background:${c}" data-c="${c}" aria-label="${c}"></button>`).join('')}</div>` : ''}`);
                const sv = this.querySelector('.usa-cp-sv');
                const hue = this.querySelector('.usa-cp-hue');
                this.drag(sv, (x, y) => ((this._s = x), (this._v = 1 - y)));
                this.drag(hue, (x) => (this._h = x * 360));
                this.listen(sv, 'keydown', (e) => this.keys(e, (d, ax) => (ax ? (this._v = clampN(this._v - d, 0, 1)) : (this._s = clampN(this._s + d, 0, 1)))));
                this.listen(hue, 'keydown', (e) => this.keys(e, (d) => (this._h = (this._h + d * 360 + 360) % 360)));
                this.listen(this, 'click', (e) => {
                    const b = e.target.closest?.('.usa-cp-sw');
                    if (!b)
                        return;
                    this.value = b.dataset.c;
                    if (!this.reduced)
                        this.motion(b, [{ transform: 'scale(1)' }, { transform: 'scale(1.35)', offset: 0.4 }, { transform: 'scale(1)' }], { duration: 360, easing: 'cubic-bezier(.3,1.5,.5,1)' });
                    this.emit('change', { value: this.value });
                });
                this.paint(false);
            }
            keys(e, fn) {
                const k = e.shiftKey ? 0.1 : 0.01;
                const map = { ArrowLeft: [-k, false], ArrowRight: [k, false], ArrowUp: [-k, true], ArrowDown: [k, true] };
                const m = map[e.key];
                if (!m)
                    return;
                e.preventDefault();
                fn(m[0], m[1]);
                this.paint(false);
                this.emit('change', { value: this.value });
            }
            drag(area, fn) {
                const at = (e) => {
                    const r = area.getBoundingClientRect();
                    fn(clampN((e.clientX - r.left) / (r.width || 1), 0, 1), clampN((e.clientY - r.top) / (r.height || 1), 0, 1));
                    this.paint(false);
                    this.emit('input', { value: this.value });
                };
                this.listen(area, 'pointerdown', (e) => {
                    area.setPointerCapture?.(e.pointerId);
                    area.toggleAttribute('data-drag', true);
                    at(e);
                    const move = (ev) => at(ev);
                    const up = () => {
                        area.removeAttribute('data-drag');
                        area.removeEventListener('pointermove', move);
                        area.removeEventListener('pointerup', up);
                        this.emit('change', { value: this.value });
                    };
                    area.addEventListener('pointermove', move);
                    area.addEventListener('pointerup', up);
                });
            }
            paint(morph) {
                const c = this.value;
                this.style.setProperty('--usa-cp-h', String(Math.round(this._h)));
                this.style.setProperty('--usa-cp-color', c);
                this.style.setProperty('--usa-cp-x', (this._s * 100).toFixed(2) + '%');
                this.style.setProperty('--usa-cp-y', ((1 - this._v) * 100).toFixed(2) + '%');
                this.style.setProperty('--usa-cp-hx', ((this._h / 360) * 100).toFixed(2) + '%');
                const sv = this.querySelector('.usa-cp-sv');
                sv?.setAttribute('aria-valuetext', `saturation ${Math.round(this._s * 100)}%, brightness ${Math.round(this._v * 100)}%`);
                const hue = this.querySelector('.usa-cp-hue');
                hue?.setAttribute('aria-valuenow', String(Math.round(this._h)));
                this.setAttribute('value', c);
                const chip = this.querySelector('.usa-cp-chip');
                if (morph && chip && !this.reduced)
                    this.motion(chip, [{ borderRadius: '50%', transform: 'scale(.7) rotate(-20deg)' }, { borderRadius: '30%', transform: 'scale(1.1)', offset: 0.6 }, { borderRadius: '50%', transform: 'none' }], { duration: 420, easing: 'ease-out' });
            }
        }
        return UsaColorPicker;
    }, { id: 'color-picker', text: css$1d });
}

var css$1c = "usa-file-drop{--usa-fd-c:#7c5cff;display:flex;flex-direction:column;gap:10px;width:var(--usa-fd-w,300px);max-width:100%;font:500 13px/1.3 system-ui,sans-serif}.usa-fd-zone{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;min-height:120px;padding:16px;border-radius:16px;background:rgba(124,92,255,.06);cursor:pointer;text-align:center;outline-offset:3px;transition:background .25s,transform .25s}.usa-fd-ants{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none}.usa-fd-ants rect{fill:none;stroke:rgba(124,92,255,.55);stroke-width:2;stroke-dasharray:8 6}usa-file-drop[data-over] .usa-fd-zone{background:rgba(124,92,255,.14);transform:scale(1.02)}usa-file-drop[data-over] .usa-fd-ants rect{stroke:var(--usa-fd-c);animation:usa-fd-march .6s linear infinite}.usa-fd-icon{font-size:30px;color:var(--usa-fd-c);transition:transform .3s cubic-bezier(.3,1.5,.5,1)}usa-file-drop[data-over] .usa-fd-icon{transform:translateY(-8px) scale(1.15)}.usa-fd-zone:focus-visible{outline:2px solid var(--usa-fd-c)}.usa-fd-list{display:flex;flex-direction:column;gap:6px;margin:0;padding:0;list-style:none}.usa-fd-item{--usa-fd-p:0;position:relative;display:grid;grid-template-columns:1fr auto 18px;align-items:center;gap:4px 8px;padding:8px 10px;border-radius:10px;background:rgba(127,127,127,.1)}.usa-fd-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600}.usa-fd-size{opacity:.6;font-size:12px}.usa-fd-bar{grid-column:1/3;height:4px;border-radius:4px;background:rgba(127,127,127,.25);overflow:hidden}.usa-fd-fill{display:block;height:100%;background:var(--usa-fd-c);transform-origin:0 50%;transform:scaleX(var(--usa-fd-p));transition:transform .2s}.usa-fd-check{grid-row:1/3;grid-column:3;width:18px;height:18px;fill:none;stroke:#22c55e;stroke-width:2.4;stroke-linecap:round;stroke-dasharray:20;stroke-dashoffset:20;transition:stroke-dashoffset .4s}.usa-fd-item[data-done] .usa-fd-check{stroke-dashoffset:0}@keyframes usa-fd-march{to{stroke-dashoffset:-14}}@media (prefers-reduced-motion:reduce){usa-file-drop *{animation:none!important;transition:none!important}usa-file-drop[data-over] .usa-fd-zone,usa-file-drop[data-over] .usa-fd-icon{transform:none}}";

const size = (n) => (n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1048576).toFixed(1)} MB`);
function defineFileDrop(tag = 'usa-file-drop') {
    return base.defineElement(tag, (Base) => {
        class UsaFileDrop extends Base {
            constructor() {
                super(...arguments);
                this._files = [];
                this._depth = 0;
            }
            get files() {
                return this._files.slice();
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const label = this.str('label', 'Drop files here or browse');
                this.insertAdjacentHTML('afterbegin', `<div class="usa-fd-zone" data-usa-part role="button" tabindex="0"><svg class="usa-fd-ants" aria-hidden="true"><rect x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" rx="14"/></svg><span class="usa-fd-icon" aria-hidden="true">⇪</span><span class="usa-fd-label"></span><input type="file" hidden></div><ul class="usa-fd-list" data-usa-part aria-live="polite"></ul>`);
                const zone = this.querySelector('.usa-fd-zone');
                zone.querySelector('.usa-fd-label').textContent = label;
                zone.setAttribute('aria-label', label);
                const input = zone.querySelector('input');
                if (this.str('accept', ''))
                    input.accept = this.str('accept', '');
                input.multiple = this.flag('multiple');
                this.listen(zone, 'click', (e) => e.target !== input && input.click());
                this.listen(zone, 'keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        input.click();
                    }
                });
                this.listen(input, 'change', () => input.files && this.addFiles(input.files));
                this.listen(zone, 'dragenter', (e) => {
                    e.preventDefault();
                    this._depth++;
                    this.toggleAttribute('data-over', true);
                });
                this.listen(zone, 'dragover', (e) => e.preventDefault());
                this.listen(zone, 'dragleave', () => {
                    this._depth = Math.max(0, this._depth - 1);
                    if (!this._depth)
                        this.removeAttribute('data-over');
                });
                this.listen(zone, 'drop', (e) => {
                    e.preventDefault();
                    this._depth = 0;
                    this.removeAttribute('data-over');
                    if (e.dataTransfer?.files?.length)
                        this.addFiles(e.dataTransfer.files);
                });
            }
            addFiles(list) {
                const ul = this.querySelector('.usa-fd-list');
                const files = Array.from(list).slice(0, this.flag('multiple') ? undefined : 1);
                if (!this.flag('multiple'))
                    this.clear();
                const start = this._files.length;
                files.forEach((f, i) => {
                    this._files.push(f);
                    const li = document.createElement('li');
                    li.className = 'usa-fd-item';
                    li.innerHTML = '<span class="usa-fd-name"></span><span class="usa-fd-size"></span><span class="usa-fd-bar"><span class="usa-fd-fill"></span></span><svg class="usa-fd-check" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3.2 3L13 4.8"/></svg>';
                    li.querySelector('.usa-fd-name').textContent = f.name;
                    li.querySelector('.usa-fd-size').textContent = size(f.size);
                    li.setAttribute('aria-label', `${f.name}, ${size(f.size)}`);
                    ul.appendChild(li);
                    if (!this.reduced)
                        this.motion(li, [{ transform: 'translateY(-28px) scale(.85)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 380, delay: i * 70, easing: 'cubic-bezier(.2,.9,.3,1.2)', fill: 'backwards' });
                });
                this.emit('files', { files });
                if (this.flag('simulate'))
                    files.forEach((_, i) => this.simulate(start + i));
            }
            simulate(i) {
                let p = 0;
                const tick = () => {
                    if (!this.isConnected)
                        return;
                    p = Math.min(1, p + 0.12 + Math.random() * 0.15);
                    this.setProgress(i, p);
                    if (p < 1)
                        setTimeout(tick, 160);
                };
                setTimeout(tick, 200);
            }
            setProgress(index, value) {
                const li = this.querySelectorAll('.usa-fd-item')[index];
                if (!li)
                    return;
                const v = Math.max(0, Math.min(1, value));
                li.style.setProperty('--usa-fd-p', String(v));
                li.toggleAttribute('data-done', v >= 1);
                li.setAttribute('aria-label', `${this._files[index]?.name || ''}, ${Math.round(v * 100)}%`);
            }
            clear() {
                this._files = [];
                this.querySelector('.usa-fd-list')?.replaceChildren();
            }
        }
        return UsaFileDrop;
    }, { id: 'file-drop', text: css$1c });
}

var css$1b = "usa-keyframe-editor{--usa-ke-c:#7c5cff;--usa-ke-head:100%;display:flex;flex-direction:column;gap:8px;width:var(--usa-ke-w,100%);max-width:100%;padding:10px;border-radius:14px;background:var(--usa-ke-bg,#0f172a);color:#e2e8f0;font:500 12px/1.2 system-ui,sans-serif}.usa-ke-bar{display:flex;align-items:center;gap:8px}.usa-ke-play{width:30px;height:30px;border:0;border-radius:50%;background:var(--usa-ke-c);color:#fff;cursor:pointer}.usa-ke-scrub{flex:1;min-width:0;accent-color:var(--usa-ke-c)}.usa-ke-time{min-width:58px;text-align:right;font-variant-numeric:tabular-nums;opacity:.8}.usa-ke-tracks{position:relative;display:flex;flex-direction:column;gap:4px}.usa-ke-tracks::after{content:\"\";position:absolute;top:0;bottom:0;left:calc(64px + (100% - 64px) * var(--usa-ke-head) / 100%);width:2px;background:#f43f5e;pointer-events:none}.usa-ke-row{display:grid;grid-template-columns:64px 1fr;align-items:center}.usa-ke-label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding-right:6px;opacity:.85}.usa-ke-lane{position:relative;height:22px;border-radius:6px;background:rgba(148,163,184,.14)}.usa-ke-clip{position:absolute;top:2px;bottom:2px;border-radius:5px;background:linear-gradient(90deg,var(--usa-ke-c),#22d3ee);cursor:grab;touch-action:none;outline-offset:2px;transition:left .2s,width .2s}.usa-ke-clip[data-drag]{cursor:grabbing;transition:none;box-shadow:0 4px 12px rgba(0,0,0,.4)}.usa-ke-clip:focus-visible{outline:2px solid #fff}.usa-ke-grip{position:absolute;right:0;top:0;bottom:0;width:8px;border-radius:0 5px 5px 0;background:rgba(255,255,255,.35);cursor:ew-resize}@media (prefers-reduced-motion:reduce){.usa-ke-clip{transition:none}}";

const DEFAULT = {
    format: player.ANIMATION_FORMAT,
    version: 1,
    name: 'Untitled',
    tracks: [
        { target: ':scope > :nth-child(1)', start: 0, duration: 600, preset: 'fade-up', label: 'Title' },
        { target: ':scope > :nth-child(2)', start: 300, duration: 600, preset: 'scale', label: 'Card' },
        { target: ':scope > :nth-child(3)', start: 700, duration: 500, preset: 'fade-up', label: 'Button' },
    ],
};
function defineKeyframeEditor(tag = 'usa-keyframe-editor') {
    return base.defineElement(tag, (Base) => {
        class UsaKeyframeEditor extends Base {
            constructor() {
                super(...arguments);
                this._anim = JSON.parse(JSON.stringify(DEFAULT));
                this._player = null;
            }
            get animation() {
                return this.toJSON();
            }
            set animation(v) {
                try {
                    const a = typeof v === 'string' ? JSON.parse(v) : v;
                    if (a && Array.isArray(a.tracks))
                        this._anim = { format: player.ANIMATION_FORMAT, version: 1, ...JSON.parse(JSON.stringify(a)) };
                }
                catch {
                    return;
                }
                if (this.isConnected)
                    this.render();
            }
            toJSON() {
                return JSON.parse(JSON.stringify({ ...this._anim, duration: this.total() }));
            }
            total() {
                return Math.max(500, ...this._anim.tracks.map((t) => (t.start || 0) + (t.duration || 0)));
            }
            mount() {
                const src = this.querySelector(':scope > script[type="application/json"]');
                if (src?.textContent)
                    this.animation = src.textContent;
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this.insertAdjacentHTML('afterbegin', '<div class="usa-ke-bar" data-usa-part><button type="button" class="usa-ke-play" aria-label="Play">▶</button><input class="usa-ke-scrub" type="range" min="0" max="1000" value="1000" aria-label="Playhead"><output class="usa-ke-time">0 ms</output></div><div class="usa-ke-tracks" data-usa-part role="list"></div>');
                this.listen(this.querySelector('.usa-ke-play'), 'click', () => this.play());
                this.listen(this.querySelector('.usa-ke-scrub'), 'input', (e) => this.seek((Number(e.target.value) / 1000) * this.total()));
                this.render();
            }
            target() {
                const id = this.str('for', '');
                return id ? document.getElementById(id) : null;
            }
            rebuild() {
                this._player?.destroy?.();
                this._player = null;
                const t = this.target();
                if (t)
                    this._player = player.createPlayer(t, this.toJSON(), { autoplay: false });
            }
            render() {
                const box = this.querySelector('.usa-ke-tracks');
                if (!box)
                    return;
                const total = this.total();
                box.innerHTML = '';
                this._anim.tracks.forEach((t, i) => {
                    const row = document.createElement('div');
                    row.className = 'usa-ke-row';
                    row.setAttribute('role', 'listitem');
                    row.innerHTML = `<span class="usa-ke-label"></span><span class="usa-ke-lane"><span class="usa-ke-clip" tabindex="0" role="slider" aria-valuemin="0" aria-valuemax="${total}"><span class="usa-ke-grip" aria-hidden="true"></span></span></span>`;
                    row.querySelector('.usa-ke-label').textContent = t.label || t.preset || t.effect || `Track ${i + 1}`;
                    const clip = row.querySelector('.usa-ke-clip');
                    clip.style.left = `${((t.start || 0) / total) * 100}%`;
                    clip.style.width = `${Math.max(2, ((t.duration || 300) / total) * 100)}%`;
                    clip.setAttribute('aria-valuenow', String(t.start || 0));
                    clip.setAttribute('aria-label', `${row.querySelector('.usa-ke-label').textContent}: start ${t.start || 0} ms, ${t.duration || 0} ms`);
                    clip.dataset.i = String(i);
                    this.wire(clip, i);
                    box.appendChild(row);
                });
                this.rebuild();
            }
            update(i, start, duration) {
                const t = this._anim.tracks[i];
                t.start = Math.max(0, Math.round(start / 10) * 10);
                t.duration = Math.max(50, Math.round(duration / 10) * 10);
                this.render();
                this.querySelector(`.usa-ke-clip[data-i="${i}"]`)?.focus();
                this.emit('change', { animation: this.toJSON() });
            }
            wire(clip, i) {
                clip.addEventListener('keydown', (e) => {
                    const t = this._anim.tracks[i];
                    const d = e.key === 'ArrowRight' ? 50 : e.key === 'ArrowLeft' ? -50 : 0;
                    if (!d)
                        return;
                    e.preventDefault();
                    if (e.shiftKey)
                        this.update(i, t.start || 0, (t.duration || 300) + d);
                    else
                        this.update(i, (t.start || 0) + d, t.duration || 300);
                });
                clip.addEventListener('pointerdown', (e) => {
                    const lane = clip.parentElement;
                    const w = lane.getBoundingClientRect().width || 1;
                    const total = this.total();
                    const t = this._anim.tracks[i];
                    const s0 = t.start || 0;
                    const d0 = t.duration || 300;
                    const resize = e.target.classList.contains('usa-ke-grip');
                    const x0 = e.clientX;
                    clip.setPointerCapture?.(e.pointerId);
                    clip.toggleAttribute('data-drag', true);
                    const move = (ev) => {
                        const dms = ((ev.clientX - x0) / w) * total;
                        if (resize)
                            clip.style.width = `${(Math.max(50, d0 + dms) / total) * 100}%`;
                        else
                            clip.style.left = `${(Math.max(0, s0 + dms) / total) * 100}%`;
                    };
                    const up = (ev) => {
                        clip.removeEventListener('pointermove', move);
                        clip.removeEventListener('pointerup', up);
                        clip.removeAttribute('data-drag');
                        const dms = ((ev.clientX - x0) / w) * total;
                        if (Math.abs(ev.clientX - x0) < 2)
                            return;
                        if (resize)
                            this.update(i, s0, d0 + dms);
                        else
                            this.update(i, s0 + dms, d0);
                    };
                    clip.addEventListener('pointermove', move);
                    clip.addEventListener('pointerup', up);
                });
            }
            seek(ms) {
                const total = this.total();
                const v = Math.max(0, Math.min(total, ms));
                this._player?.seek?.(v);
                const out = this.querySelector('.usa-ke-time');
                if (out)
                    out.textContent = `${Math.round(v)} ms`;
                this.style.setProperty('--usa-ke-head', `${(v / total) * 100}%`);
            }
            play() {
                if (!this._player)
                    this.rebuild();
                if (this.reduced)
                    return this.seek(this.total());
                this._player?.seek?.(0);
                this._player?.play?.();
                const t0 = performance.now();
                const total = this.total();
                const scrub = this.querySelector('.usa-ke-scrub');
                const f = () => {
                    const ms = Math.min(total, performance.now() - t0);
                    if (scrub)
                        scrub.value = String(Math.round((ms / total) * 1000));
                    this.style.setProperty('--usa-ke-head', `${(ms / total) * 100}%`);
                    const out = this.querySelector('.usa-ke-time');
                    if (out)
                        out.textContent = `${Math.round(ms)} ms`;
                    if (ms < total && this.isConnected)
                        requestAnimationFrame(f);
                };
                if (typeof requestAnimationFrame === 'function')
                    requestAnimationFrame(f);
            }
        }
        return UsaKeyframeEditor;
    }, { id: 'keyframe-editor', text: css$1b });
}

var css$1a = "usa-music-player{--usa-mp-c:#7c5cff;--usa-mp-p:0;display:grid;grid-template-columns:auto 1fr;gap:14px;align-items:center;width:var(--usa-mp-w,320px);max-width:100%;padding:14px;border-radius:20px;background:var(--usa-mp-bg,linear-gradient(160deg,#111827,#1e1b4b));color:#f8fafc;font:500 13px/1.3 system-ui,sans-serif;box-shadow:0 14px 34px -14px rgba(0,0,0,.55)}.usa-mp-cover{width:84px;height:84px}.usa-mp-disc{display:block;width:100%;height:100%;border-radius:50%;background:radial-gradient(circle,#0f172a 9%,#e2e8f0 9.5%,#e2e8f0 12%,transparent 12.5%),repeating-radial-gradient(circle,#111 0 2px,#1f2937 2px 4px),#111;background-size:cover;box-shadow:0 6px 18px rgba(0,0,0,.5),inset 0 0 0 2px rgba(255,255,255,.06)}usa-music-player[data-animate] .usa-mp-disc{animation:usa-mp-spin 1.8s linear infinite}.usa-mp-body{display:flex;flex-direction:column;gap:6px;min-width:0}.usa-mp-meta{display:flex;flex-direction:column;min-width:0}.usa-mp-title{font-size:15px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.usa-mp-artist{opacity:.7;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.usa-mp-bars{display:flex;gap:3px;align-items:flex-end;height:14px}.usa-mp-bars i{width:3px;height:30%;border-radius:2px;background:var(--usa-mp-c);transition:height .3s}usa-music-player[data-animate] .usa-mp-bars i{animation:usa-mp-bar .9s ease-in-out infinite alternate}.usa-mp-bars i:nth-child(2){animation-delay:-.3s!important}.usa-mp-bars i:nth-child(3){animation-delay:-.6s!important}.usa-mp-bars i:nth-child(4){animation-delay:-.15s!important}.usa-mp-track{position:relative;height:6px;border-radius:6px;background:rgba(255,255,255,.18);cursor:pointer;touch-action:none;outline-offset:4px}.usa-mp-fill{position:absolute;inset:0;border-radius:inherit;background:var(--usa-mp-c);transform-origin:0 50%;transform:scaleX(var(--usa-mp-p))}.usa-mp-knob{position:absolute;top:50%;left:calc(var(--usa-mp-p) * 100%);width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.4);transition:transform .2s}.usa-mp-track:hover .usa-mp-knob,.usa-mp-track:focus-visible .usa-mp-knob{transform:scale(1.3)}.usa-mp-times{display:flex;justify-content:space-between;font-size:11px;opacity:.65;font-variant-numeric:tabular-nums}.usa-mp-ctrls{display:flex;align-items:center;justify-content:center;gap:12px}.usa-mp-btn{border:0;background:none;color:inherit;font-size:16px;cursor:pointer;opacity:.85}.usa-mp-play{position:relative;width:40px;height:40px;border:0;border-radius:50%;background:#fff;cursor:pointer}.usa-mp-icon{position:absolute;left:50%;top:50%;width:14px;height:16px;margin:-8px 0 0 -6px;background:var(--usa-mp-c);clip-path:polygon(0 0,100% 50%,100% 50%,0 100%);transition:clip-path .3s cubic-bezier(.6,.05,.3,1)}usa-music-player[data-playing] .usa-mp-icon{margin-left:-7px;clip-path:polygon(0 0,35% 0,35% 100%,0 100%,0 0,65% 0,100% 0,100% 100%,65% 100%,65% 0)}.usa-mp-btn:focus-visible,.usa-mp-play:focus-visible,.usa-mp-track:focus-visible{outline:2px solid #fff}@keyframes usa-mp-spin{to{transform:rotate(360deg)}}@keyframes usa-mp-bar{from{height:20%}to{height:100%}}@media (prefers-reduced-motion:reduce){usa-music-player *{animation:none!important;transition:none!important}}";

const fmt$2 = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
function defineMusicPlayer(tag = 'usa-music-player') {
    return base.defineElement(tag, (Base) => {
        class UsaMusicPlayer extends Base {
            constructor() {
                super(...arguments);
                this._audio = null;
                this._playing = false;
                this._t = 0;
                this._raf = 0;
                this._last = 0;
                this.tick = (now) => {
                    if (!this._playing)
                        return;
                    if (!this._audio) {
                        this._t += this._last ? (now - this._last) / 1000 : 0;
                        this._last = now;
                        if (this._t >= this.duration) {
                            this._t = this.duration;
                            this.sync();
                            return this.pause();
                        }
                        this.sync();
                    }
                    this._raf = requestAnimationFrame(this.tick);
                };
            }
            static get observedAttributes() {
                return ['title', 'artist', 'cover', 'src'];
            }
            get playing() {
                return this._playing;
            }
            get duration() {
                const d = this._audio?.duration;
                return d && Number.isFinite(d) ? d : Math.max(1, this.num('duration', 180));
            }
            get currentTime() {
                return this._audio ? this._audio.currentTime : this._t;
            }
            set currentTime(v) {
                this.seek(v);
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this._audio = this.querySelector(':scope > audio');
                if (!this._audio && this.str('src', '')) {
                    this._audio = document.createElement('audio');
                    this._audio.src = this.str('src', '');
                    this._audio.preload = 'metadata';
                    this._audio.setAttribute('data-usa-part', '');
                    this.appendChild(this._audio);
                }
                this.setAttribute('role', 'group');
                this.setAttribute('aria-roledescription', 'music player');
                const title = this.str('title', 'Untitled');
                const artist = this.str('artist', '');
                this.setAttribute('aria-label', artist ? `${title} — ${artist}` : title);
                const cover = this.str('cover', '');
                this.insertAdjacentHTML('afterbegin', `<div class="usa-mp-cover" data-usa-part aria-hidden="true"><span class="usa-mp-disc"${cover ? ` style="background-image:url('${cover.replace(/'/g, '%27')}')"` : ''}></span></div><div class="usa-mp-body" data-usa-part><div class="usa-mp-meta"><b class="usa-mp-title"></b><span class="usa-mp-artist"></span></div><div class="usa-mp-bars" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="usa-mp-track" role="slider" tabindex="0" aria-label="Seek" aria-valuemin="0"><span class="usa-mp-fill"></span><span class="usa-mp-knob"></span></div><div class="usa-mp-times"><span class="usa-mp-cur">0:00</span><span class="usa-mp-dur"></span></div><div class="usa-mp-ctrls"><button type="button" class="usa-mp-btn" data-act="prev" aria-label="Previous">⏮</button><button type="button" class="usa-mp-play" data-act="play" aria-label="Play"><span class="usa-mp-icon"></span></button><button type="button" class="usa-mp-btn" data-act="next" aria-label="Next">⏭</button></div></div>`);
                this.querySelector('.usa-mp-title').textContent = title;
                this.querySelector('.usa-mp-artist').textContent = artist;
                this.listen(this, 'click', (e) => {
                    const act = e.target.closest?.('[data-act]');
                    if (!act)
                        return;
                    if (act.dataset.act === 'play')
                        this.toggle();
                    else
                        this.emit(act.dataset.act, {});
                });
                const track = this.querySelector('.usa-mp-track');
                this.listen(track, 'pointerdown', (e) => {
                    const at = (ev) => {
                        const r = track.getBoundingClientRect();
                        this.seek(clampN((ev.clientX - r.left) / (r.width || 1), 0, 1) * this.duration);
                    };
                    at(e);
                    track.setPointerCapture?.(e.pointerId);
                    const up = () => (track.removeEventListener('pointermove', at), track.removeEventListener('pointerup', up));
                    track.addEventListener('pointermove', at);
                    track.addEventListener('pointerup', up);
                });
                this.listen(track, 'keydown', (e) => {
                    const d = e.key === 'ArrowRight' ? 5 : e.key === 'ArrowLeft' ? -5 : 0;
                    if (!d)
                        return;
                    e.preventDefault();
                    this.seek(this.currentTime + d);
                });
                if (this._audio) {
                    this.listen(this._audio, 'timeupdate', () => this.sync());
                    this.listen(this._audio, 'loadedmetadata', () => this.sync());
                    this.listen(this._audio, 'ended', () => this.pause());
                }
                this.onCleanup(() => cancelAnimationFrame(this._raf));
                this.sync();
            }
            sync() {
                const d = this.duration;
                const t = this.currentTime;
                this.style.setProperty('--usa-mp-p', String(clampN(t / d, 0, 1)));
                const cur = this.querySelector('.usa-mp-cur');
                if (cur)
                    cur.textContent = fmt$2(t);
                const dur = this.querySelector('.usa-mp-dur');
                if (dur)
                    dur.textContent = fmt$2(d);
                const tr = this.querySelector('.usa-mp-track');
                tr?.setAttribute('aria-valuemax', String(Math.round(d)));
                tr?.setAttribute('aria-valuenow', String(Math.round(t)));
                tr?.setAttribute('aria-valuetext', `${fmt$2(t)} of ${fmt$2(d)}`);
                this.toggleAttribute('data-playing', this._playing);
                this.toggleAttribute('data-animate', this._playing && !this.reduced);
                const b = this.querySelector('.usa-mp-play');
                b?.setAttribute('aria-label', this._playing ? 'Pause' : 'Play');
                b?.setAttribute('aria-pressed', String(this._playing));
            }
            play() {
                if (this._playing)
                    return;
                this._playing = true;
                if (this._audio)
                    void this._audio.play()?.catch?.(() => undefined);
                this._last = 0;
                if (typeof requestAnimationFrame === 'function')
                    this._raf = requestAnimationFrame(this.tick);
                this.sync();
                const icon = this.querySelector('.usa-mp-play');
                if (icon && !this.reduced)
                    this.motion(icon, [{ transform: 'scale(.85)' }, { transform: 'scale(1.08)', offset: 0.6 }, { transform: 'scale(1)' }], { duration: 300, easing: 'ease-out' });
                this.emit('play', {});
            }
            pause() {
                if (!this._playing)
                    return;
                this._playing = false;
                this._audio?.pause();
                cancelAnimationFrame(this._raf);
                this.sync();
                this.emit('pause', {});
            }
            toggle() {
                if (this._playing)
                    this.pause();
                else
                    this.play();
            }
            seek(s) {
                const t = clampN(s, 0, this.duration);
                if (this._audio)
                    this._audio.currentTime = t;
                else
                    this._t = t;
                this.sync();
                this.emit('seek', { time: t });
            }
        }
        return UsaMusicPlayer;
    }, { id: 'music-player', text: css$1a });
}

var css$19 = "usa-volume-knob{--usa-vk-c:#22d3ee;--usa-vk-size:120px;position:relative;display:inline-grid;place-items:center;width:var(--usa-vk-size);height:var(--usa-vk-size);border-radius:50%;cursor:ns-resize;touch-action:none;user-select:none;outline-offset:6px}.usa-vk-arc{position:absolute;inset:0;width:100%;height:100%;overflow:visible}.usa-vk-arc path{fill:none;stroke-width:6;stroke-linecap:round}.usa-vk-bg{stroke:rgba(127,127,127,.25)}.usa-vk-val{stroke:var(--usa-vk-c);filter:drop-shadow(0 0 4px var(--usa-vk-c))}.usa-vk-ticks{position:absolute;inset:0}.usa-vk-ticks i{position:absolute;left:50%;top:50%;width:3px;height:3px;margin:-1.5px;border-radius:50%;background:rgba(127,127,127,.4);transform:rotate(var(--a)) translateY(calc(var(--usa-vk-size) * -.5 + 2px));transition:background .2s,box-shadow .2s}.usa-vk-ticks i[data-on]{background:var(--usa-vk-c);box-shadow:0 0 6px var(--usa-vk-c)}.usa-vk-cap{position:relative;width:62%;height:62%;border-radius:50%;background:radial-gradient(circle at 35% 30%,#4b5563,#111827 70%);box-shadow:0 8px 16px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.15);transform:rotate(var(--usa-vk-angle));transition:transform .35s cubic-bezier(.3,1.5,.5,1)}usa-volume-knob[data-drag] .usa-vk-cap{transition:none}.usa-vk-dot{position:absolute;left:50%;top:10%;width:6px;height:6px;margin-left:-3px;border-radius:50%;background:var(--usa-vk-c);box-shadow:0 0 6px var(--usa-vk-c)}usa-volume-knob:focus-visible{outline:2px solid var(--usa-vk-c)}@media (prefers-reduced-motion:reduce){.usa-vk-cap,.usa-vk-ticks i{transition:none}}";

const ARC = 270;
function defineVolumeKnob(tag = 'usa-volume-knob') {
    return base.defineElement(tag, (Base) => {
        class UsaVolumeKnob extends Base {
            constructor() {
                super(...arguments);
                this._v = 50;
            }
            static get observedAttributes() {
                return ['min', 'max'];
            }
            get value() {
                return this._v;
            }
            set value(v) {
                this.set(v, false);
            }
            mount() {
                this._v = clampN(this.num('value', 50), this.num('min', 0), this.num('max', 100));
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const ticks = Array.from({ length: 21 }, (_, i) => `<i style="--a:${-ARC / 2 + (i / 20) * ARC}deg"></i>`).join('');
                this.insertAdjacentHTML('afterbegin', `<span class="usa-vk-ticks" data-usa-part aria-hidden="true">${ticks}</span><svg class="usa-vk-arc" data-usa-part aria-hidden="true" viewBox="0 0 100 100"><path class="usa-vk-bg" d="${this.arc(1)}"/><path class="usa-vk-val" d="${this.arc(1)}"/></svg><span class="usa-vk-cap" data-usa-part aria-hidden="true"><span class="usa-vk-dot"></span></span>`);
                this.setAttribute('role', 'slider');
                if (!this.hasAttribute('tabindex'))
                    this.tabIndex = 0;
                if (!this.hasAttribute('aria-label'))
                    this.setAttribute('aria-label', this.str('label', 'Volume'));
                this.setAttribute('aria-valuemin', String(this.num('min', 0)));
                this.setAttribute('aria-valuemax', String(this.num('max', 100)));
                this.listen(this, 'keydown', (e) => {
                    const span = this.num('max', 100) - this.num('min', 0);
                    const d = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: span / 10, PageDown: -span / 10, Home: -Infinity, End: Infinity };
                    if (!(e.key in d))
                        return;
                    e.preventDefault();
                    this.set(this._v + d[e.key], true, true);
                });
                this.listen(this, 'wheel', (e) => {
                    e.preventDefault();
                    this.set(this._v - Math.sign(e.deltaY) * 2, true, true);
                }, { passive: false });
                this.listen(this, 'pointerdown', (e) => {
                    const y0 = e.clientY;
                    const v0 = this._v;
                    const span = this.num('max', 100) - this.num('min', 0);
                    this.setPointerCapture?.(e.pointerId);
                    this.toggleAttribute('data-drag', true);
                    const move = (ev) => this.set(v0 + ((y0 - ev.clientY) / 150) * span, true);
                    const up = () => {
                        this.removeAttribute('data-drag');
                        this.removeEventListener('pointermove', move);
                        this.removeEventListener('pointerup', up);
                        this.emit('change', { value: this._v });
                    };
                    this.addEventListener('pointermove', move);
                    this.addEventListener('pointerup', up);
                });
                this.paint();
            }
            /** SVG arc path for fraction `k` (0–1) of the 270° sweep. */
            arc(k) {
                const a0 = ((-ARC / 2 - 90) * Math.PI) / 180;
                const a1 = a0 + ((ARC * Math.max(0.0001, k)) * Math.PI) / 180;
                const p = (a) => `${(50 + 42 * Math.cos(a)).toFixed(2)} ${(50 + 42 * Math.sin(a)).toFixed(2)}`;
                return `M${p(a0)} A42 42 0 ${ARC * k > 180 ? 1 : 0} 1 ${p(a1)}`;
            }
            paint() {
                const lo = this.num('min', 0);
                const hi = this.num('max', 100);
                const k = (this._v - lo) / (hi - lo || 1);
                this.style.setProperty('--usa-vk-angle', `${-ARC / 2 + k * ARC}deg`);
                this.querySelector('.usa-vk-val')?.setAttribute('d', this.arc(k));
                this.querySelectorAll('.usa-vk-ticks i').forEach((t, i) => t.toggleAttribute('data-on', i / 20 <= k + 1e-6 && k > 0));
                this.setAttribute('aria-valuenow', String(Math.round(this._v)));
                this.setAttribute('value', String(Math.round(this._v)));
            }
            set(v, user, commit = false) {
                const n = clampN(Math.round(v), this.num('min', 0), this.num('max', 100));
                if (n === this._v)
                    return;
                this._v = n;
                this.paint();
                if (user)
                    this.emit('input', { value: n });
                if (commit)
                    this.emit('change', { value: n });
            }
        }
        return UsaVolumeKnob;
    }, { id: 'volume-knob', text: css$19 });
}

var css$18 = "usa-equalizer{--usa-eq-c:#7c5cff;position:relative;display:block;width:var(--usa-eq-w,320px);max-width:100%;padding:12px 10px 8px;border-radius:16px;background:var(--usa-eq-bg,#0f172a);color:#cbd5e1;font:600 10px/1 system-ui,sans-serif}.usa-eq-curve{position:absolute;left:10px;right:10px;top:12px;height:120px;width:calc(100% - 20px);pointer-events:none;overflow:visible}.usa-eq-curve path{fill:none;stroke:#22d3ee;stroke-width:1.6;vector-effect:non-scaling-stroke;opacity:.8;transition:d .45s cubic-bezier(.3,1.3,.5,1)}.usa-eq-bands{display:flex;justify-content:space-between;gap:4px}.usa-eq-band{display:flex;flex-direction:column;align-items:center;gap:6px;flex:1;min-width:0}.usa-eq-slot{--usa-eq-k:.5;position:relative;width:8px;height:120px;border-radius:6px;background:rgba(148,163,184,.18);cursor:ns-resize;touch-action:none;outline-offset:4px}.usa-eq-fill{position:absolute;left:0;right:0;top:calc((1 - max(var(--usa-eq-k),.5)) * 100%);bottom:calc(min(var(--usa-eq-k),.5) * 100%);border-radius:6px;background:var(--usa-eq-c)}.usa-eq-cap{position:absolute;left:50%;top:calc((1 - var(--usa-eq-k)) * 100%);width:20px;height:10px;margin:-5px 0 0 -10px;border-radius:4px;background:#f8fafc;box-shadow:0 2px 6px rgba(0,0,0,.5)}usa-equalizer[data-glide] .usa-eq-cap{transition:top .5s cubic-bezier(.3,1.4,.5,1)}usa-equalizer[data-glide] .usa-eq-fill{transition:top .5s cubic-bezier(.3,1.4,.5,1),bottom .5s cubic-bezier(.3,1.4,.5,1)}.usa-eq-slot[data-drag] .usa-eq-cap{transform:scale(1.15)}.usa-eq-slot:focus-visible{outline:2px solid #22d3ee}.usa-eq-label{opacity:.7;white-space:nowrap}@media (prefers-reduced-motion:reduce){.usa-eq-cap,.usa-eq-fill,.usa-eq-curve path{transition:none!important}}";

const EQ_PRESETS = {
    flat: [0, 0, 0, 0, 0, 0, 0],
    bass: [8, 6, 3, 0, -1, -1, 0],
    vocal: [-3, -1, 2, 5, 4, 1, -1],
    rock: [5, 3, -1, -2, 1, 4, 6],
    electronic: [6, 4, 0, -2, 2, 5, 7],
};
function defineEqualizer(tag = 'usa-equalizer') {
    return base.defineElement(tag, (Base) => {
        class UsaEqualizer extends Base {
            constructor() {
                super(...arguments);
                this._v = [];
            }
            static get observedAttributes() {
                return ['bands'];
            }
            get values() {
                return this._v.slice();
            }
            set values(v) {
                v.forEach((x, i) => (this._v[i] = clampN(Math.round(x), -12, 12)));
                this.paint(true);
            }
            mount() {
                const labels = this.str('bands', '60,150,400,1k,2.4k,6k,16k').split(',').map((s) => s.trim()).filter(Boolean);
                const pre = EQ_PRESETS[this.str('preset', 'flat')] || EQ_PRESETS.flat;
                this._v = labels.map((_, i) => pre[Math.round((i / Math.max(1, labels.length - 1)) * (pre.length - 1))] || 0);
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this.setAttribute('role', 'group');
                if (!this.hasAttribute('aria-label'))
                    this.setAttribute('aria-label', this.str('label', 'Equalizer'));
                const bands = labels.map((l, i) => `<div class="usa-eq-band"><div class="usa-eq-slot" role="slider" tabindex="0" aria-orientation="vertical" aria-valuemin="-12" aria-valuemax="12" aria-label="${l} Hz" data-i="${i}"><span class="usa-eq-fill"></span><span class="usa-eq-cap"></span></div><span class="usa-eq-label">${l}</span></div>`).join('');
                this.insertAdjacentHTML('afterbegin', `<svg class="usa-eq-curve" data-usa-part aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 100 100"><path/></svg><div class="usa-eq-bands" data-usa-part>${bands}</div>`);
                this.querySelectorAll('.usa-eq-slot').forEach((slot) => {
                    const i = Number(slot.dataset.i);
                    this.listen(slot, 'keydown', (e) => {
                        const d = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: 3, PageDown: -3 };
                        if (!(e.key in d))
                            return;
                        e.preventDefault();
                        this.setBand(i, this._v[i] + d[e.key]);
                    });
                    this.listen(slot, 'pointerdown', (e) => {
                        slot.setPointerCapture?.(e.pointerId);
                        slot.toggleAttribute('data-drag', true);
                        const at = (ev) => {
                            const r = slot.getBoundingClientRect();
                            this.setBand(i, 12 - clampN((ev.clientY - r.top) / (r.height || 1), 0, 1) * 24);
                        };
                        at(e);
                        const up = () => (slot.removeAttribute('data-drag'), slot.removeEventListener('pointermove', at), slot.removeEventListener('pointerup', up));
                        slot.addEventListener('pointermove', at);
                        slot.addEventListener('pointerup', up);
                    });
                });
                this.paint(false);
            }
            setBand(i, v) {
                const n = clampN(Math.round(v), -12, 12);
                if (n === this._v[i])
                    return;
                this._v[i] = n;
                this.paint(false);
                this.emit('change', { values: this.values });
            }
            applyPreset(name) {
                const p = EQ_PRESETS[name];
                if (!p)
                    return;
                const n = this._v.length;
                this._v = this._v.map((_, i) => p[Math.round((i / Math.max(1, n - 1)) * (p.length - 1))] || 0);
                this.paint(true);
                this.emit('change', { values: this.values });
            }
            paint(glide) {
                this.toggleAttribute('data-glide', glide && !this.reduced);
                const slots = this.querySelectorAll('.usa-eq-slot');
                slots.forEach((s, i) => {
                    const v = this._v[i] ?? 0;
                    s.style.setProperty('--usa-eq-k', ((v + 12) / 24).toFixed(4));
                    s.setAttribute('aria-valuenow', String(v));
                    s.setAttribute('aria-valuetext', `${v > 0 ? '+' : ''}${v} dB`);
                });
                const n = this._v.length;
                const pts = this._v.map((v, i) => [((i + 0.5) / n) * 100, 50 - (v / 12) * 40]);
                let d = `M0 ${pts[0]?.[1] ?? 50}`;
                pts.forEach(([x, y], i) => {
                    const [px, py] = i ? pts[i - 1] : [0, pts[0][1]];
                    d += ` C${((px + x) / 2).toFixed(2)} ${py.toFixed(2)} ${((px + x) / 2).toFixed(2)} ${y.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)}`;
                });
                d += ` L100 ${pts[n - 1]?.[1] ?? 50}`;
                this.querySelector('.usa-eq-curve path')?.setAttribute('d', d);
            }
        }
        return UsaEqualizer;
    }, { id: 'equalizer', text: css$18 });
}

var css$17 = "usa-lyrics{--usa-ly-c:#f472b6;display:block;width:var(--usa-ly-w,320px);max-width:100%;font:700 18px/1.35 system-ui,sans-serif}.usa-ly-list{height:var(--usa-ly-h,180px);margin:0;padding:70px 0;overflow-y:auto;list-style:none;scrollbar-width:none;-webkit-mask:linear-gradient(transparent,#000 25%,#000 75%,transparent);mask:linear-gradient(transparent,#000 25%,#000 75%,transparent)}.usa-ly-list::-webkit-scrollbar{display:none}.usa-ly-line{--usa-ly-k:0;padding:5px 4px;opacity:.38;cursor:pointer;transform-origin:0 50%;transition:opacity .35s,transform .35s cubic-bezier(.3,1.3,.5,1),filter .35s;filter:blur(.4px)}.usa-ly-line[data-past]{opacity:.22}.usa-ly-line[data-active]{opacity:1;filter:none;transform:scale(1.06);color:transparent;background:linear-gradient(90deg,var(--usa-ly-c) calc(var(--usa-ly-k) * 100%),var(--usa-ly-base,#94a3b8) calc(var(--usa-ly-k) * 100%));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 0 18px rgba(244,114,182,.25)}@media (prefers-reduced-motion:reduce){.usa-ly-line{transition:none;transform:none!important}}";

/** Parse LRC text into sorted `{ t, text }` lines. */
function parseLRC(src) {
    const out = [];
    for (const raw of src.split(/\r?\n/)) {
        const stamps = [...raw.matchAll(/\[(\d+):(\d+(?:\.\d+)?)\]/g)];
        const text = raw.replace(/\[[^\]]*\]/g, '').trim();
        for (const m of stamps)
            out.push({ t: Number(m[1]) * 60 + Number(m[2]), text });
    }
    return out.sort((a, b) => a.t - b.t);
}
function defineLyrics(tag = 'usa-lyrics') {
    return base.defineElement(tag, (Base) => {
        class UsaLyrics extends Base {
            constructor() {
                super(...arguments);
                this._lines = [];
                this._time = 0;
                this._active = -1;
                this._raf = 0;
            }
            get lines() {
                return this._lines.slice();
            }
            get time() {
                return this._time;
            }
            set time(v) {
                this._time = Math.max(0, Number(v) || 0);
                this.update();
            }
            mount() {
                const lrc = this.querySelector(':scope > script[type="text/plain"]');
                if (lrc?.textContent)
                    this._lines = parseLRC(lrc.textContent);
                else
                    this._lines = ownChildren(this).filter((c) => c.hasAttribute('data-t')).map((c) => ({ t: Number(c.dataset.t) || 0, text: c.textContent?.trim() || '' }));
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                ownChildren(this).forEach((c) => c.localName !== 'script' && (c.hidden = true));
                const list = document.createElement('ol');
                list.className = 'usa-ly-list';
                list.setAttribute('data-usa-part', '');
                this._lines.forEach((l, i) => {
                    const li = document.createElement('li');
                    li.className = 'usa-ly-line';
                    li.dataset.i = String(i);
                    li.textContent = l.text || '♪';
                    list.appendChild(li);
                });
                this.appendChild(list);
                this.setAttribute('role', 'region');
                if (!this.hasAttribute('aria-label'))
                    this.setAttribute('aria-label', this.str('label', 'Lyrics'));
                this.listen(list, 'click', (e) => {
                    const li = e.target.closest?.('.usa-ly-line');
                    if (li)
                        this.emit('seek', { time: this._lines[Number(li.dataset.i)].t });
                });
                this._active = -1;
                const src = this.str('for', '') ? document.getElementById(this.str('for', '')) : null;
                if (src && typeof requestAnimationFrame === 'function') {
                    const f = () => {
                        const t = src.currentTime;
                        if (typeof t === 'number' && Math.abs(t - this._time) > 0.01)
                            this.time = t;
                        this._raf = requestAnimationFrame(f);
                    };
                    this._raf = requestAnimationFrame(f);
                    this.onCleanup(() => cancelAnimationFrame(this._raf));
                }
                this.update();
            }
            /** Index of the line playing at `t`. */
            lineAt(t) {
                let i = -1;
                for (let k = 0; k < this._lines.length && this._lines[k].t <= t; k++)
                    i = k;
                return i;
            }
            update() {
                const i = this.lineAt(this._time);
                const items = this.querySelectorAll('.usa-ly-line');
                const cur = this._lines[i];
                const next = this._lines[i + 1];
                const k = cur ? Math.min(1, (this._time - cur.t) / Math.max(0.3, (next ? next.t : cur.t + 4) - cur.t)) : 0;
                if (items[i])
                    items[i].style.setProperty('--usa-ly-k', this.reduced ? '1' : k.toFixed(3));
                if (i === this._active)
                    return;
                this._active = i;
                items.forEach((li, j) => {
                    li.toggleAttribute('data-active', j === i);
                    li.toggleAttribute('data-past', j < i);
                    if (j === i)
                        li.setAttribute('aria-current', 'true');
                    else
                        li.removeAttribute('aria-current');
                });
                const list = this.querySelector('.usa-ly-list');
                const li = items[i];
                if (list && li) {
                    const top = li.offsetTop - list.clientHeight / 2 + li.offsetHeight / 2;
                    if (typeof list.scrollTo === 'function')
                        list.scrollTo({ top, behavior: this.reduced ? 'auto' : 'smooth' });
                    else
                        list.scrollTop = top;
                }
            }
        }
        return UsaLyrics;
    }, { id: 'lyrics', text: css$17 });
}

var css$16 = "usa-bar-chart{--usa-bc-c:#7c5cff;display:block;width:var(--usa-bc-w,100%);max-width:100%;font:600 11px/1.2 system-ui,sans-serif}.usa-bc-list{display:flex;align-items:flex-end;gap:8px;height:var(--usa-bc-h,140px);margin:0;padding:0;list-style:none}.usa-bc-item{display:grid;grid-template-rows:auto 1fr auto;justify-items:center;flex:1;min-width:0;height:100%;gap:4px}.usa-bc-track{position:relative;grid-row:2;width:100%;display:flex;align-items:flex-end;justify-content:center}.usa-bc-bar{display:block;width:min(100%,38px);height:calc(var(--usa-bc-k) * 100%);border-radius:6px 6px 2px 2px;background:linear-gradient(var(--usa-bc-c),#22d3ee);transform-origin:50% 100%}.usa-bc-item[data-glide] .usa-bc-bar{transition:height .6s cubic-bezier(.3,1.25,.5,1)}.usa-bc-val{grid-row:1;font-variant-numeric:tabular-nums;opacity:.8}.usa-bc-label{grid-row:3;opacity:.6;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}usa-bar-chart[data-dir=\"h\"] .usa-bc-list{flex-direction:column;align-items:stretch;height:auto}usa-bar-chart[data-dir=\"h\"] .usa-bc-item{grid-template-columns:70px 1fr auto;grid-template-rows:none;align-items:center;height:22px}usa-bar-chart[data-dir=\"h\"] .usa-bc-label{grid-row:auto;grid-column:1;justify-self:start}usa-bar-chart[data-dir=\"h\"] .usa-bc-track{grid-row:auto;grid-column:2;height:100%;justify-content:flex-start;align-items:center}usa-bar-chart[data-dir=\"h\"] .usa-bc-bar{width:calc(var(--usa-bc-k) * 100%);height:14px;border-radius:2px 6px 6px 2px;transform-origin:0 50%;background:linear-gradient(90deg,var(--usa-bc-c),#22d3ee)}usa-bar-chart[data-dir=\"h\"] .usa-bc-item[data-glide] .usa-bc-bar{transition:width .6s cubic-bezier(.3,1.25,.5,1)}usa-bar-chart[data-dir=\"h\"] .usa-bc-val{grid-row:auto;grid-column:3}@media (prefers-reduced-motion:reduce){.usa-bc-bar{transition:none!important}}";

function defineBarChart(tag = 'usa-bar-chart') {
    return base.defineElement(tag, (Base) => {
        class UsaBarChart extends Base {
            constructor() {
                super(...arguments);
                this._data = [];
                this._seen = false;
            }
            static get observedAttributes() {
                return ['horizontal', 'unit', 'max'];
            }
            get data() {
                return this._data.map((d) => ({ ...d }));
            }
            set data(v) {
                this._data = (v || []).map((d) => ({ label: String(d.label), value: Number(d.value) || 0 }));
                if (this.isConnected)
                    this.render(true);
            }
            mount() {
                if (!this._data.length) {
                    const kids = Array.from(this.querySelectorAll(':scope > data'));
                    if (kids.length)
                        this._data = kids.map((k) => ({ label: k.textContent?.trim() || '', value: Number(k.getAttribute('value')) || 0 }));
                    else {
                        const vals = this.str('values', '').split(',').map(Number);
                        const labels = this.str('labels', '').split(',');
                        this._data = vals.filter(Number.isFinite).map((v, i) => ({ label: (labels[i] || String(i + 1)).trim(), value: v }));
                    }
                }
                this.querySelectorAll(':scope > data').forEach((d) => (d.hidden = true));
                this.dataset.dir = this.flag('horizontal') ? 'h' : 'v';
                this.render(false);
                this.inView((vis) => {
                    if (!vis || this._seen)
                        return;
                    this._seen = true;
                    if (this.reduced)
                        return;
                    this.querySelectorAll('.usa-bc-bar').forEach((b, i) => this.motion(b, [{ transform: this.dataset.dir === 'h' ? 'scaleX(0)' : 'scaleY(0)' }, { transform: 'none' }], { duration: 700, delay: i * 70, easing: 'cubic-bezier(.2,.8,.3,1.1)', fill: 'backwards' }));
                });
            }
            render(glide) {
                let list = this.querySelector(':scope > .usa-bc-list');
                if (!list) {
                    list = document.createElement('ul');
                    list.className = 'usa-bc-list';
                    list.setAttribute('data-usa-part', '');
                    this.appendChild(list);
                }
                const max = this.num('max', 0) || Math.max(1, ...this._data.map((d) => d.value));
                const unit = this.str('unit', '');
                const old = new Map(Array.from(list.children).map((li) => [li.dataset.label, li]));
                const next = [];
                for (const d of this._data) {
                    let li = old.get(d.label);
                    const isNew = !li;
                    if (!li) {
                        li = document.createElement('li');
                        li.className = 'usa-bc-item';
                        li.dataset.label = d.label;
                        li.innerHTML = '<span class="usa-bc-track"><span class="usa-bc-bar"></span></span><span class="usa-bc-val"></span><span class="usa-bc-label"></span>';
                        li.querySelector('.usa-bc-label').textContent = d.label;
                    }
                    old.delete(d.label);
                    const k = Math.max(0, Math.min(1, d.value / max));
                    li.style.setProperty('--usa-bc-k', k.toFixed(4));
                    li.querySelector('.usa-bc-val').textContent = `${d.value.toLocaleString()}${unit}`;
                    li.setAttribute('aria-label', `${d.label}: ${d.value.toLocaleString()}${unit}`);
                    li.toggleAttribute('data-glide', glide && !this.reduced);
                    if (isNew && glide && !this.reduced)
                        this.motion(li.querySelector('.usa-bc-bar'), [{ transform: this.dataset.dir === 'h' ? 'scaleX(0)' : 'scaleY(0)' }, { transform: 'none' }], { duration: 500, easing: 'ease-out' });
                    next.push(li);
                }
                old.forEach((li) => {
                    if (this.reduced || !glide)
                        return li.remove();
                    const a = this.motion(li, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.6)' }], { duration: 300, fill: 'forwards' });
                    if (a)
                        a.finished.then(() => li.remove(), () => li.remove());
                    else
                        li.remove();
                });
                next.forEach((li) => list.appendChild(li));
                this.setAttribute('role', 'figure');
                if (!this.hasAttribute('aria-label'))
                    this.setAttribute('aria-label', this.str('label', 'Bar chart'));
                list.setAttribute('role', 'list');
                next.forEach((li) => li.setAttribute('role', 'listitem'));
            }
        }
        return UsaBarChart;
    }, { id: 'bar-chart', text: css$16 });
}

var css$15 = "usa-gauge{--usa-gg-c:#7c5cff;--usa-gg-k:0;position:relative;display:inline-block;width:var(--usa-gg-w,220px);max-width:100%;font:600 12px/1.2 system-ui,sans-serif;text-align:center}.usa-gg-svg{display:block;width:100%;height:auto;overflow:visible}.usa-gg-track,.usa-gg-arc{fill:none;stroke-width:16;stroke-linecap:round}.usa-gg-track{stroke:rgba(127,127,127,.2)}.usa-gg-arc{stroke:var(--usa-gg-c);stroke-dasharray:calc(max(var(--usa-gg-k),0) * 100) 100;transition:stroke .3s}.usa-gg-needle{transform-origin:100px 100px;transform:rotate(var(--usa-gg-angle,-90deg));fill:currentColor}.usa-gg-read{position:absolute;left:0;right:0;bottom:2px;display:flex;flex-direction:column;align-items:center;pointer-events:none}.usa-gg-num{font:800 22px/1 system-ui,sans-serif;font-variant-numeric:tabular-nums;transform:translateY(-34px)}.usa-gg-label{opacity:.65;transform:translateY(-34px)}";

function defineGauge(tag = 'usa-gauge') {
    return base.defineElement(tag, (Base) => {
        class UsaGauge extends Base {
            constructor() {
                super(...arguments);
                this._v = 0;
                this._shown = 0;
                this._vel = 0;
                this._raf = 0;
            }
            static get observedAttributes() {
                return ['min', 'max', 'zones', 'unit', 'label'];
            }
            get value() {
                return this._v;
            }
            set value(v) {
                this._v = clampN(Number(v) || 0, this.num('min', 0), this.num('max', 100));
                this.setAttribute('aria-valuenow', String(this._v));
                this.animateTo();
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this.insertAdjacentHTML('afterbegin', '<svg class="usa-gg-svg" data-usa-part aria-hidden="true" viewBox="0 0 200 120"><path class="usa-gg-track" d="M20 100 A80 80 0 0 1 180 100"/><path class="usa-gg-arc" d="M20 100 A80 80 0 0 1 180 100" pathLength="100"/><g class="usa-gg-needle"><path d="M100 100 L96 100 L100 30 L104 100 Z"/><circle cx="100" cy="100" r="7"/></g></svg><div class="usa-gg-read" data-usa-part aria-hidden="true"><b class="usa-gg-num">0</b><span class="usa-gg-label"></span></div>');
                this.querySelector('.usa-gg-label').textContent = this.str('label', '');
                this.setAttribute('role', 'meter');
                this.setAttribute('aria-valuemin', String(this.num('min', 0)));
                this.setAttribute('aria-valuemax', String(this.num('max', 100)));
                if (!this.hasAttribute('aria-label'))
                    this.setAttribute('aria-label', this.str('label', 'Gauge'));
                this._v = clampN(this.num('value', 0), this.num('min', 0), this.num('max', 100));
                this.setAttribute('aria-valuenow', String(this._v));
                this._shown = this.reduced ? this._v : this.num('min', 0);
                this.paint();
                this.onCleanup(() => cancelAnimationFrame(this._raf));
                this.inView((v) => v && this.animateTo());
            }
            /** Colour of the zone containing `v`. */
            zoneColor(v) {
                const zones = this.str('zones', '').split(',').map((z) => z.split(':')).filter((z) => z.length === 2).map(([b, c]) => [Number(b), c.trim()]).sort((a, b) => a[0] - b[0]);
                for (const [b, c] of zones)
                    if (v <= b)
                        return c;
                return zones.length ? zones[zones.length - 1][1] : '';
            }
            paint() {
                const lo = this.num('min', 0);
                const hi = this.num('max', 100);
                const k = clampN((this._shown - lo) / (hi - lo || 1), -0.05, 1.05);
                this.style.setProperty('--usa-gg-k', k.toFixed(4));
                this.style.setProperty('--usa-gg-angle', `${ -90 + k * 180}deg`);
                const z = this.zoneColor(this._shown);
                if (z)
                    this.style.setProperty('--usa-gg-c', z);
                const num = this.querySelector('.usa-gg-num');
                if (num)
                    num.textContent = `${Math.round(clampN(this._shown, lo, hi))}${this.str('unit', '')}`;
                this.setAttribute('aria-valuetext', `${Math.round(this._v)}${this.str('unit', '')}`);
            }
            animateTo() {
                if (this.reduced || typeof requestAnimationFrame !== 'function') {
                    this._shown = this._v;
                    return this.paint();
                }
                if (this._raf)
                    return;
                let last = 0;
                const f = (now) => {
                    const dt = last ? Math.min(0.033, (now - last) / 1000) : 1 / 60;
                    last = now;
                    const span = this.num('max', 100) - this.num('min', 0) || 1;
                    this._vel += (120 * (this._v - this._shown) - 11 * this._vel) * dt;
                    this._shown += this._vel * dt;
                    this.paint();
                    if (Math.abs(this._v - this._shown) / span > 0.0005 || Math.abs(this._vel) / span > 0.002)
                        this._raf = requestAnimationFrame(f);
                    else
                        ((this._raf = 0), (this._shown = this._v), (this._vel = 0), this.paint());
                };
                this._raf = requestAnimationFrame(f);
            }
        }
        return UsaGauge;
    }, { id: 'gauge', text: css$15 });
}

var css$14 = "usa-sparkline{--usa-sl-c:#7c5cff;position:relative;display:inline-block;width:var(--usa-sl-w,120px);height:var(--usa-sl-h,32px);vertical-align:middle}.usa-sl-svg{display:block;width:100%;height:100%;overflow:visible}.usa-sl-line{fill:none;stroke:var(--usa-sl-c);stroke-width:1.8;stroke-linejoin:round;stroke-linecap:round;vector-effect:non-scaling-stroke;stroke-dasharray:1}.usa-sl-area{fill:var(--usa-sl-c);opacity:0}usa-sparkline[data-variant=\"area\"] .usa-sl-area{opacity:.16;transition:opacity .8s .4s}.usa-sl-bars rect{fill:var(--usa-sl-c);opacity:.75}usa-sparkline:not([data-variant=\"bars\"]) .usa-sl-bars,usa-sparkline[data-variant=\"bars\"] .usa-sl-line,usa-sparkline[data-variant=\"bars\"] .usa-sl-end{display:none}.usa-sl-end{fill:var(--usa-sl-c);vector-effect:non-scaling-stroke;transform-box:fill-box;transform-origin:center;animation:usa-sl-pulse 1.8s ease-out infinite}.usa-sl-hover{fill:#fff;stroke:var(--usa-sl-c);stroke-width:1.5;vector-effect:non-scaling-stroke;opacity:0}usa-sparkline[data-hover] .usa-sl-hover{opacity:1}.usa-sl-tip{position:absolute;bottom:calc(100% + 4px);transform:translateX(-50%);padding:2px 6px;border-radius:5px;background:#111827;color:#fff;font:600 11px/1.3 system-ui,sans-serif;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .15s}usa-sparkline[data-hover] .usa-sl-tip{opacity:1}@keyframes usa-sl-pulse{0%{opacity:1;transform:scale(1)}70%{opacity:.4;transform:scale(1.8)}100%{opacity:1;transform:scale(1)}}@media (prefers-reduced-motion:reduce){.usa-sl-end{animation:none}}";

const SPARK_VARIANTS = ['line', 'area', 'bars'];
/** Map values to SVG points in a w×h box (with padding). */
function sparkPoints(vals, w = 100, h = 30, pad = 3) {
    if (!vals.length)
        return [];
    const lo = Math.min(...vals);
    const hi = Math.max(...vals);
    const span = hi - lo || 1;
    return vals.map((v, i) => [vals.length === 1 ? w / 2 : pad + (i / (vals.length - 1)) * (w - pad * 2), h - pad - ((v - lo) / span) * (h - pad * 2)]);
}
function defineSparkline(tag = 'usa-sparkline') {
    return base.defineElement(tag, (Base) => {
        class UsaSparkline extends Base {
            constructor() {
                super(...arguments);
                this._data = [];
                this._drawn = false;
                this._raf = 0;
            }
            static get observedAttributes() {
                return ['variant', 'color'];
            }
            get data() {
                return this._data.slice();
            }
            set data(v) {
                const from = sparkPoints(this._data);
                this._data = (v || []).map(Number).filter(Number.isFinite);
                if (this.isConnected)
                    this.render(from);
            }
            mount() {
                if (!this._data.length)
                    this._data = this.str('values', '').split(',').map(Number).filter(Number.isFinite);
                const v = this.str('variant', 'line');
                this.dataset.variant = SPARK_VARIANTS.includes(v) ? v : 'line';
                if (this.str('color', ''))
                    this.style.setProperty('--usa-sl-c', this.str('color', ''));
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this.insertAdjacentHTML('afterbegin', '<svg class="usa-sl-svg" data-usa-part viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><path class="usa-sl-area"/><g class="usa-sl-bars"></g><path class="usa-sl-line" pathLength="1"/><circle class="usa-sl-end" r="2.2"/><circle class="usa-sl-hover" r="2.4"/></svg><span class="usa-sl-tip" data-usa-part aria-hidden="true"></span>');
                this.setAttribute('role', 'img');
                this.listen(this, 'pointermove', (e) => this.hover(e));
                this.listen(this, 'pointerleave', () => this.removeAttribute('data-hover'));
                this.onCleanup(() => cancelAnimationFrame(this._raf));
                this.render(null);
                this.inView((vis) => {
                    if (!vis || this._drawn)
                        return;
                    this._drawn = true;
                    const line = this.querySelector('.usa-sl-line');
                    if (line && !this.reduced)
                        this.motion(line, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 900, easing: 'cubic-bezier(.6,.05,.3,1)' });
                });
            }
            summary() {
                const d = this._data;
                if (!d.length)
                    return 'No data';
                const a = d[0];
                const b = d[d.length - 1];
                const pct = a ? Math.round(((b - a) / Math.abs(a)) * 100) : 0;
                return `Trend: ${a} to ${b}${a ? `, ${pct >= 0 ? 'up' : 'down'} ${Math.abs(pct)}%` : ''}`;
            }
            paths(pts) {
                if (!pts.length)
                    return { line: '', area: '' };
                const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join('');
                return { line, area: `${line}L${pts[pts.length - 1][0].toFixed(2)} 30L${pts[0][0].toFixed(2)} 30Z` };
            }
            render(from) {
                this.setAttribute('aria-label', this.str('label', '') || this.summary());
                const to = sparkPoints(this._data);
                const apply = (pts) => {
                    const { line, area } = this.paths(pts);
                    this.querySelector('.usa-sl-line')?.setAttribute('d', line);
                    this.querySelector('.usa-sl-area')?.setAttribute('d', area);
                    const end = pts[pts.length - 1];
                    const c = this.querySelector('.usa-sl-end');
                    if (end && c)
                        (c.setAttribute('cx', end[0].toFixed(2)), c.setAttribute('cy', end[1].toFixed(2)));
                };
                const bars = this.querySelector('.usa-sl-bars');
                if (bars) {
                    const lo = Math.min(0, ...this._data);
                    const hi = Math.max(...this._data, 1);
                    const w = 100 / Math.max(1, this._data.length);
                    bars.innerHTML = this._data.map((v, i) => `<rect x="${(i * w + w * 0.15).toFixed(2)}" width="${(w * 0.7).toFixed(2)}" y="${(30 - ((v - lo) / (hi - lo || 1)) * 28).toFixed(2)}" height="${(((v - lo) / (hi - lo || 1)) * 28).toFixed(2)}" rx="1"/>`).join('');
                }
                if (!from || from.length !== to.length || this.reduced || typeof requestAnimationFrame !== 'function')
                    return apply(to);
                cancelAnimationFrame(this._raf);
                const t0 = performance.now();
                const f = (now) => {
                    const k = Math.min(1, (now - t0) / 500);
                    const e = 1 - Math.pow(1 - k, 3);
                    apply(to.map(([x, y], i) => [from[i][0] + (x - from[i][0]) * e, from[i][1] + (y - from[i][1]) * e]));
                    if (k < 1)
                        this._raf = requestAnimationFrame(f);
                };
                this._raf = requestAnimationFrame(f);
            }
            hover(e) {
                if (!this._data.length)
                    return;
                const r = this.getBoundingClientRect();
                const pts = sparkPoints(this._data);
                const x = ((e.clientX - r.left) / (r.width || 1)) * 100;
                let i = 0;
                pts.forEach(([px], j) => Math.abs(px - x) < Math.abs(pts[i][0] - x) && (i = j));
                const c = this.querySelector('.usa-sl-hover');
                c?.setAttribute('cx', pts[i][0].toFixed(2));
                c?.setAttribute('cy', pts[i][1].toFixed(2));
                const tip = this.querySelector('.usa-sl-tip');
                if (tip) {
                    tip.textContent = String(this._data[i]);
                    tip.style.left = `${pts[i][0]}%`;
                }
                this.toggleAttribute('data-hover', true);
            }
        }
        return UsaSparkline;
    }, { id: 'sparkline', text: css$14 });
}

/** Parse a figure like "$12.4k" / "−3.5%" / "1,204" → number + prefix / suffix / decimals (7.2). */
function parseFigureText(s) {
    const m = /^(\D*?)([-−]?[\d,]*\.?\d+)(.*)$/.exec(String(s).trim());
    if (!m)
        return null;
    const raw = m[2].replace(/,/g, '').replace('−', '-');
    const n = Number(raw);
    return Number.isFinite(n) ? { n, pre: m[1], post: m[3], dec: (raw.split('.')[1] || '').length } : null;
}

var css$13 = "usa-kpi{display:inline-grid;grid-template-columns:1fr auto;grid-template-areas:\"label label\" \"value delta\" \"trend trend\" \"caption caption\";align-items:end;gap:4px 10px;width:var(--usa-kpi-w,220px);max-width:100%;padding:14px 16px;border-radius:16px;background:var(--usa-kpi-bg,#fff);color:#0f172a;box-shadow:0 8px 24px -12px rgba(15,23,42,.35);font:500 12px/1.3 system-ui,sans-serif}.usa-kpi-label{grid-area:label;opacity:.6;text-transform:uppercase;letter-spacing:.06em;font-size:11px;font-weight:700}.usa-kpi-value{grid-area:value;font:800 28px/1.05 system-ui,sans-serif;font-variant-numeric:tabular-nums;white-space:nowrap}.usa-kpi-delta{grid-area:delta;display:inline-flex;align-items:center;gap:3px;padding:3px 7px;border-radius:999px;font-weight:700;font-size:12px;margin-bottom:4px}.usa-kpi-delta[data-good=\"true\"]{background:rgba(34,197,94,.14);color:#15803d}.usa-kpi-delta[data-good=\"false\"]{background:rgba(239,68,68,.14);color:#b91c1c}.usa-kpi-delta i{font-style:normal;font-size:9px}.usa-kpi-trend{grid-area:trend;--usa-sl-w:100%;--usa-sl-h:34px;margin-top:4px}.usa-kpi-caption{grid-area:caption;opacity:.55;font-size:11px}.usa-kpi-caption:empty{display:none}";

function defineKpi(tag = 'usa-kpi') {
    return base.defineElement(tag, (Base) => {
        class UsaKpi extends Base {
            constructor() {
                super(...arguments);
                this._shown = 0;
                this._raf = 0;
                this._seen = false;
            }
            static get observedAttributes() {
                return ['label', 'delta', 'caption', 'trend', 'invert'];
            }
            get value() {
                return this.str('value', '0');
            }
            set value(v) {
                const prev = this._shown;
                this.setAttribute('value', String(v));
                this.roll(prev, true);
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const delta = this.str('delta', '');
                const neg = /^\s*[-−]/.test(delta);
                const good = this.flag('invert') ? neg : !neg;
                this.insertAdjacentHTML('afterbegin', `<span class="usa-kpi-label" data-usa-part></span><b class="usa-kpi-value" data-usa-part></b>${delta ? `<span class="usa-kpi-delta" data-usa-part data-good="${good}"><i aria-hidden="true">${neg ? '▼' : '▲'}</i><span></span></span>` : ''}${this.str('trend', '') ? `<usa-sparkline class="usa-kpi-trend" data-usa-part variant="area" values="${this.str('trend', '')}" aria-hidden="true"></usa-sparkline>` : ''}<span class="usa-kpi-caption" data-usa-part></span>`);
                this.querySelector('.usa-kpi-label').textContent = this.str('label', '');
                this.querySelector('.usa-kpi-caption').textContent = this.str('caption', '');
                const ds = this.querySelector('.usa-kpi-delta span');
                if (ds)
                    ds.textContent = delta;
                this.setAttribute('role', 'group');
                this.setAttribute('aria-label', [this.str('label', ''), this.value, delta && `(${delta})`, this.str('caption', '')].filter(Boolean).join(' '));
                this.onCleanup(() => cancelAnimationFrame(this._raf));
                const f = parseFigureText(this.value);
                this._shown = this.reduced || !f ? (f?.n ?? 0) : 0;
                this.write(this._shown);
                this.inView((vis) => {
                    if (!vis || this._seen)
                        return;
                    this._seen = true;
                    this.roll(0, false);
                    const d = this.querySelector('.usa-kpi-delta');
                    if (d && !this.reduced)
                        this.motion(d, [{ transform: 'translateY(8px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 420, delay: 500, easing: 'cubic-bezier(.2,.9,.3,1.2)', fill: 'backwards' });
                });
            }
            write(n) {
                const f = parseFigureText(this.value);
                const el = this.querySelector('.usa-kpi-value');
                if (!el)
                    return;
                el.textContent = f ? f.pre + n.toLocaleString(this.str('locale', '') || undefined, { minimumFractionDigits: f.dec, maximumFractionDigits: f.dec }) + f.post : this.value;
            }
            roll(from, flash) {
                const f = parseFigureText(this.value);
                if (!f)
                    return this.write(0);
                const to = f.n;
                if (this.reduced || typeof requestAnimationFrame !== 'function') {
                    this._shown = to;
                    return this.write(to);
                }
                cancelAnimationFrame(this._raf);
                const t0 = performance.now();
                const step = (now) => {
                    const k = Math.min(1, (now - t0) / 1100);
                    this._shown = from + (to - from) * (1 - Math.pow(1 - k, 3));
                    this.write(this._shown);
                    if (k < 1)
                        this._raf = requestAnimationFrame(step);
                };
                this._raf = requestAnimationFrame(step);
                if (flash)
                    this.motion(this, [{ boxShadow: '0 0 0 0 rgba(124,92,255,.5)' }, { boxShadow: '0 0 0 10px rgba(124,92,255,0)' }], { duration: 700, easing: 'ease-out' });
            }
        }
        return UsaKpi;
    }, { id: 'kpi', text: css$13 });
}

var css$12 = "usa-add-to-cart{display:inline-block}.usa-atc-btn{position:relative;display:inline-grid;place-items:center;min-width:var(--usa-atc-w,150px);padding:11px 18px;border:0;border-radius:999px;background:var(--usa-atc-bg,#7c5cff);color:#fff;font:700 14px/1 system-ui,sans-serif;cursor:pointer;overflow:hidden;transition:background .3s}.usa-atc-btn>span{grid-area:1/1;transition:transform .35s cubic-bezier(.3,1.4,.5,1),opacity .25s}.usa-atc-done{transform:translateY(120%);opacity:0}usa-add-to-cart[data-added] .usa-atc-btn{background:var(--usa-atc-ok,#16a34a)}usa-add-to-cart[data-added] .usa-atc-label{transform:translateY(-120%);opacity:0}usa-add-to-cart[data-added] .usa-atc-done{transform:none;opacity:1}.usa-atc-btn:focus-visible{outline:3px solid #a78bfa;outline-offset:2px}.usa-atc-live{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}@media (prefers-reduced-motion:reduce){.usa-atc-btn>span{transition:none}}";

function defineAddToCart(tag = 'usa-add-to-cart') {
    return base.defineElement(tag, (Base) => {
        class UsaAddToCart extends Base {
            constructor() {
                super(...arguments);
                this._t = 0;
            }
            mount() {
                components_fxShop.registerShopPack();
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const label = this.textContent?.trim() || this.str('label', 'Add to cart');
                this.textContent = '';
                this.insertAdjacentHTML('afterbegin', '<button type="button" class="usa-atc-btn" data-usa-part><span class="usa-atc-label"></span><span class="usa-atc-done" aria-hidden="true">✓ <span></span></span></button><span class="usa-atc-live" data-usa-part aria-live="polite"></span>');
                this.querySelector('.usa-atc-label').textContent = label;
                this.querySelector('.usa-atc-done span').textContent = this.str('added', 'Added');
                this.listen(this.querySelector('.usa-atc-btn'), 'click', () => this.add());
                this.onCleanup(() => this._t && clearTimeout(this._t));
            }
            add() {
                let item = {};
                try {
                    item = JSON.parse(this.str('item', '{}'));
                }
                catch {
                    item = { name: this.str('item', '') };
                }
                const cartSel = this.str('cart', '[data-cart]');
                const cart = document.querySelector(cartSel);
                const from = (this.str('from', '') && document.querySelector(this.str('from', ''))) || this.closest('[data-product]')?.querySelector('img') || this;
                if (registry.getEffect('fly-to-cart'))
                    void registry.playEffect(from, 'fly-to-cart', { to: cart?.matches('usa-cart-drawer') ? `${cartSel} .usa-cd2-toggle` : cartSel });
                cart?.add?.(item);
                this.setAttribute('data-added', '');
                this.querySelector('.usa-atc-live').textContent = `${this.str('added', 'Added')} to cart`;
                if (!this.reduced)
                    this.motion(this.querySelector('.usa-atc-btn'), [{ transform: 'scale(1)' }, { transform: 'scale(.92)', offset: 0.3 }, { transform: 'scale(1)' }], { duration: 380, easing: 'ease-out' });
                if (this._t)
                    clearTimeout(this._t);
                this._t = setTimeout(() => this.removeAttribute('data-added'), this.num('hold', 1600));
                this.emit('add', { item });
            }
        }
        return UsaAddToCart;
    }, { id: 'add-to-cart', text: css$12 });
}

var css$11 = "usa-cart-drawer{position:relative;display:inline-block;font:500 13px/1.3 system-ui,sans-serif}.usa-cd2-toggle{position:relative;display:grid;place-items:center;width:44px;height:44px;border:0;border-radius:50%;background:var(--usa-cd2-btn,#f1f5f9);font-size:20px;cursor:pointer}.usa-cd2-badge{position:absolute;top:-2px;right:-2px;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#ef4444;color:#fff;font:800 11px/18px system-ui,sans-serif;text-align:center}.usa-cd2-badge:empty{display:none}.usa-cd2-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.35);z-index:2147482000}.usa-cd2-panel{position:fixed;top:0;right:0;bottom:0;width:min(var(--usa-cd2-w,340px),92vw);display:flex;flex-direction:column;background:var(--usa-cd2-bg,#fff);color:#0f172a;box-shadow:-12px 0 40px -12px rgba(15,23,42,.4);z-index:2147482001;outline:none}.usa-cd2-panel header,.usa-cd2-panel footer{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid rgba(15,23,42,.08)}.usa-cd2-panel footer{border:0;border-top:1px solid rgba(15,23,42,.08);margin-top:auto;font-size:15px}.usa-cd2-close,.usa-cd2-rm{border:0;background:none;font-size:20px;line-height:1;cursor:pointer;color:inherit;opacity:.6}.usa-cd2-list{margin:0;padding:6px 8px;list-style:none;overflow:auto}.usa-cd2-item{display:grid;grid-template-columns:36px 1fr auto auto auto;align-items:center;gap:8px;padding:8px;border-radius:10px;overflow:hidden}.usa-cd2-item img,.usa-cd2-item i{width:36px;height:36px;border-radius:8px;object-fit:cover;background:linear-gradient(135deg,#a78bfa,#22d3ee)}.usa-cd2-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600}.usa-cd2-qty{opacity:.6}.usa-cd2-price,.usa-cd2-total{font-variant-numeric:tabular-nums;font-weight:700}.usa-cd2-empty{margin:24px;text-align:center;opacity:.55}.usa-cd2-panel[hidden],.usa-cd2-backdrop[hidden]{display:none}";

/** Cart total (7.3). */
const cartTotal = (items) => Math.round(items.reduce((a, i) => a + (Number(i.price) || 0) * (i.qty || 1), 0) * 100) / 100;
function defineCartDrawer(tag = 'usa-cart-drawer') {
    return base.defineElement(tag, (Base) => {
        class UsaCartDrawer extends Base {
            constructor() {
                super(...arguments);
                this._items = [];
                this._open = false;
                this._ret = null;
            }
            get items() {
                return this._items.map((i) => ({ ...i }));
            }
            set items(v) {
                this._items = (v || []).map((i) => ({ ...i, id: i.id || i.name, qty: i.qty || 1 }));
                if (this.isConnected)
                    this.render(null);
            }
            get total() {
                return cartTotal(this._items);
            }
            get count() {
                return this._items.reduce((a, i) => a + (i.qty || 1), 0);
            }
            get open() {
                return this._open;
            }
            set open(v) {
                this.toggle(!!v);
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const label = this.str('label', 'Cart');
                this.insertAdjacentHTML('afterbegin', `<button type="button" class="usa-cd2-toggle" data-usa-part aria-haspopup="dialog" aria-expanded="false"><span aria-hidden="true">🛒</span><b class="usa-cd2-badge" aria-live="polite"></b></button><div class="usa-cd2-backdrop" data-usa-part hidden></div><div class="usa-cd2-panel" data-usa-part role="dialog" aria-modal="true" hidden tabindex="-1"><header><strong></strong><button type="button" class="usa-cd2-close" aria-label="Close">×</button></header><ul class="usa-cd2-list"></ul><p class="usa-cd2-empty">Your cart is empty</p><footer><span>Total</span><b class="usa-cd2-total"></b></footer></div>`);
                this.querySelector('.usa-cd2-panel strong').textContent = label;
                this.querySelector('.usa-cd2-panel').setAttribute('aria-label', label);
                this.listen(this.querySelector('.usa-cd2-toggle'), 'click', () => this.toggle());
                this.listen(this.querySelector('.usa-cd2-close'), 'click', () => this.toggle(false));
                this.listen(this.querySelector('.usa-cd2-backdrop'), 'click', () => this.toggle(false));
                this.listen(this, 'keydown', (e) => e.key === 'Escape' && this._open && this.toggle(false));
                this.listen(this.querySelector('.usa-cd2-list'), 'click', (e) => {
                    const b = e.target.closest('[data-rm]');
                    if (b)
                        this.removeItem(b.dataset.rm);
                });
                if (!this._items.length) {
                    try {
                        const init = JSON.parse(this.str('items', '[]'));
                        if (Array.isArray(init))
                            this._items = init.map((i) => ({ ...i, id: i.id || i.name, qty: i.qty || 1 }));
                    }
                    catch {
                        /* ignore bad JSON */
                    }
                }
                this.render(null);
            }
            toggle(force) {
                const on = force ?? !this._open;
                if (on === this._open)
                    return;
                this._open = on;
                const panel = this.querySelector('.usa-cd2-panel');
                const bd = this.querySelector('.usa-cd2-backdrop');
                this.querySelector('.usa-cd2-toggle').setAttribute('aria-expanded', String(on));
                this.toggleAttribute('data-open', on);
                if (on) {
                    this._ret = document.activeElement || null;
                    panel.hidden = bd.hidden = false;
                    if (!this.reduced) {
                        this.motion(panel, [{ transform: 'translateX(105%)' }, { transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.2,.9,.3,1)' });
                        this.motion(bd, [{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
                    }
                    panel.focus();
                    this.emit('open', {});
                }
                else {
                    const done = () => {
                        if (!this._open)
                            panel.hidden = bd.hidden = true;
                    };
                    const a = this.reduced ? null : this.motion(panel, [{ transform: 'none' }, { transform: 'translateX(105%)' }], { duration: 260, easing: 'ease-in' });
                    if (a)
                        a.finished.then(done, done);
                    else
                        done();
                    this._ret?.focus?.();
                    this.emit('close', {});
                }
            }
            add(item) {
                const id = item.id || item.name;
                const hit = this._items.find((i) => i.id === id);
                if (hit)
                    hit.qty = (hit.qty || 1) + (item.qty || 1);
                else
                    this._items.push({ ...item, id, qty: item.qty || 1 });
                this.render(id);
            }
            removeItem(id) {
                const li = Array.from(this.querySelectorAll('.usa-cd2-item')).find((n) => n.dataset.id === id) || null;
                this._items = this._items.filter((i) => i.id !== id);
                const a = li && !this.reduced ? this.motion(li, [{ opacity: 1, maxHeight: `${li.offsetHeight}px` }, { opacity: 0, maxHeight: '0px', paddingTop: '0', paddingBottom: '0' }], { duration: 260, fill: 'forwards' }) : null;
                if (a)
                    a.finished.then(() => this.render(null), () => this.render(null));
                else
                    this.render(null);
            }
            render(changed) {
                const cur = this.str('currency', '$');
                const list = this.querySelector('.usa-cd2-list');
                const old = new Map(Array.from(list.children).map((li) => [li.dataset.id, li]));
                for (const it of this._items) {
                    let li = old.get(it.id);
                    old.delete(it.id);
                    const isNew = !li;
                    if (!li) {
                        li = document.createElement('li');
                        li.className = 'usa-cd2-item';
                        li.dataset.id = it.id;
                        li.innerHTML = `${it.img ? '<img alt="">' : '<i aria-hidden="true"></i>'}<span class="usa-cd2-name"></span><span class="usa-cd2-qty"></span><span class="usa-cd2-price"></span><button type="button" class="usa-cd2-rm">×</button>`;
                        if (it.img)
                            li.querySelector('img').setAttribute('src', it.img);
                    }
                    li.querySelector('.usa-cd2-name').textContent = it.name;
                    li.querySelector('.usa-cd2-qty').textContent = `×${it.qty || 1}`;
                    li.querySelector('.usa-cd2-price').textContent = `${cur}${((it.price || 0) * (it.qty || 1)).toFixed(2)}`;
                    const rm = li.querySelector('.usa-cd2-rm');
                    rm.dataset.rm = it.id;
                    rm.setAttribute('aria-label', `Remove ${it.name}`);
                    list.appendChild(li);
                    if (changed === it.id && !this.reduced)
                        this.motion(li, isNew ? [{ transform: 'translateX(40px)', opacity: 0 }, { transform: 'none', opacity: 1 }] : [{ background: 'rgba(124,92,255,.18)' }, { background: 'transparent' }], { duration: 420, easing: 'cubic-bezier(.2,.9,.3,1.2)' });
                }
                old.forEach((li) => li.remove());
                const n = this.count;
                const badge = this.querySelector('.usa-cd2-badge');
                badge.textContent = n ? String(n) : '';
                this.querySelector('.usa-cd2-toggle').setAttribute('aria-label', `${this.str('label', 'Cart')}, ${n} item${n === 1 ? '' : 's'}`);
                if (changed && !this.reduced)
                    this.motion(badge, [{ transform: 'scale(1)' }, { transform: 'scale(1.5)', offset: 0.4 }, { transform: 'scale(1)' }], { duration: 420, easing: 'ease-out' });
                this.querySelector('.usa-cd2-empty').hidden = !!this._items.length;
                const tot = this.querySelector('.usa-cd2-total');
                const to = this.total;
                const from = Number(tot.dataset.v || 0);
                tot.dataset.v = String(to);
                if (this.reduced || from === to || typeof requestAnimationFrame !== 'function')
                    tot.textContent = `${cur}${to.toFixed(2)}`;
                else {
                    const t0 = performance.now();
                    const f = (now) => {
                        const k = Math.min(1, (now - t0) / 500);
                        tot.textContent = `${cur}${(from + (to - from) * (1 - Math.pow(1 - k, 3))).toFixed(2)}`;
                        if (k < 1)
                            requestAnimationFrame(f);
                    };
                    requestAnimationFrame(f);
                }
                this.emit('change', { items: this.items, total: to });
            }
        }
        return UsaCartDrawer;
    }, { id: 'cart-drawer', text: css$11 });
}

var css$10 = "usa-product-gallery{display:grid;gap:10px;width:var(--usa-pg2-w,320px);max-width:100%}.usa-pg2-stage{position:relative;aspect-ratio:var(--usa-pg2-ratio,1);border-radius:14px;overflow:hidden;background:#f1f5f9;cursor:zoom-in;outline:none}.usa-pg2-stage:focus-visible{box-shadow:0 0 0 3px #a78bfa}.usa-pg2-main{width:100%;height:100%;object-fit:cover;display:block;transition:transform .2s ease-out}.usa-pg2-thumbs{position:relative;display:flex;gap:8px;overflow-x:auto;padding:3px}.usa-pg2-thumb{flex:0 0 auto;width:var(--usa-pg2-t,56px);height:var(--usa-pg2-t,56px);padding:0;border:0;border-radius:10px;overflow:hidden;background:#e2e8f0;cursor:pointer;opacity:.65;transition:opacity .2s}.usa-pg2-thumb[aria-selected=true]{opacity:1}.usa-pg2-thumb img{width:100%;height:100%;object-fit:cover;display:block}.usa-pg2-thumb:focus-visible{outline:2px solid #7c5cff;outline-offset:2px}.usa-pg2-ring{position:absolute;left:0;top:3px;height:var(--usa-pg2-t,56px);border-radius:10px;box-shadow:0 0 0 2px var(--usa-pg2-accent,#7c5cff);pointer-events:none;transition:transform .35s cubic-bezier(.3,1.3,.5,1),width .35s}@media (prefers-reduced-motion:reduce){.usa-pg2-ring,.usa-pg2-main{transition:none}}";

/** Wrap an index into 0..n-1 (7.3). */
const wrapIndex = (i, n) => (n ? ((i % n) + n) % n : 0);
function defineProductGallery(tag = 'usa-product-gallery') {
    return base.defineElement(tag, (Base) => {
        class UsaProductGallery extends Base {
            constructor() {
                super(...arguments);
                this._i = 0;
                this._imgs = [];
            }
            static get observedAttributes() {
                return ['index'];
            }
            get count() {
                return this._imgs.length;
            }
            get index() {
                return this._i;
            }
            set index(v) {
                this.go(v);
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this._imgs = Array.from(this.querySelectorAll(':scope > img'));
                this._imgs.forEach((im) => (im.hidden = true));
                this.insertAdjacentHTML('beforeend', '<div class="usa-pg2-stage" data-usa-part role="group" tabindex="0"><img class="usa-pg2-main" alt=""></div><div class="usa-pg2-thumbs" data-usa-part role="tablist" aria-label="Product images"></div>');
                const thumbs = this.querySelector('.usa-pg2-thumbs');
                this._imgs.forEach((im, i) => {
                    const b = document.createElement('button');
                    b.type = 'button';
                    b.className = 'usa-pg2-thumb';
                    b.setAttribute('role', 'tab');
                    b.setAttribute('aria-label', im.alt || `Image ${i + 1}`);
                    b.innerHTML = `<img alt="" src="${im.getAttribute('src') || ''}">`;
                    this.listen(b, 'click', () => this.go(i));
                    thumbs.appendChild(b);
                });
                thumbs.insertAdjacentHTML('beforeend', '<i class="usa-pg2-ring" aria-hidden="true"></i>');
                const stage = this.querySelector('.usa-pg2-stage');
                const main = this.querySelector('.usa-pg2-main');
                this.listen(stage, 'keydown', (e) => {
                    if (e.key === 'ArrowRight')
                        (this.next(), e.preventDefault());
                    if (e.key === 'ArrowLeft')
                        (this.prev(), e.preventDefault());
                });
                this.listen(thumbs, 'keydown', (e) => {
                    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                        e.key === 'ArrowRight' ? this.next() : this.prev();
                        thumbs.children[this._i]?.focus();
                        e.preventDefault();
                    }
                });
                let sx = 0;
                this.listen(stage, 'pointerdown', (e) => (sx = e.clientX));
                this.listen(stage, 'pointerup', (e) => {
                    const dx = e.clientX - sx;
                    if (e.pointerType !== 'mouse' && Math.abs(dx) > 40)
                        dx < 0 ? this.next() : this.prev();
                });
                this.listen(stage, 'pointermove', (e) => {
                    if (e.pointerType !== 'mouse' || this.reduced || this.flag('nozoom'))
                        return;
                    const r = stage.getBoundingClientRect();
                    main.style.transformOrigin = `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}% ${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`;
                    main.style.transform = `scale(${this.num('zoom', 2)})`;
                });
                this.listen(stage, 'pointerleave', () => (main.style.transform = ''));
                this._i = wrapIndex(this.num('index', 0), this.count);
                this.paint(0);
            }
            changed() {
                if (this.isConnected && this._imgs.length)
                    this.go(this.num('index', 0));
            }
            go(i) {
                const n = wrapIndex(Math.round(i), this.count);
                if (n === this._i)
                    return;
                const dir = n > this._i ? 1 : -1;
                this._i = n;
                this.paint(dir);
                this.emit('change', { index: n });
            }
            next() {
                this.go(wrapIndex(this._i + 1, this.count));
            }
            prev() {
                this.go(wrapIndex(this._i - 1, this.count));
            }
            paint(dir) {
                const im = this._imgs[this._i];
                const main = this.querySelector('.usa-pg2-main');
                if (!im || !main)
                    return;
                main.src = im.getAttribute('src') || '';
                main.alt = im.alt;
                this.querySelector('.usa-pg2-stage').setAttribute('aria-label', `Image ${this._i + 1} of ${this.count}${im.alt ? `: ${im.alt}` : ''}`);
                const thumbs = Array.from(this.querySelectorAll('.usa-pg2-thumb'));
                thumbs.forEach((t, k) => (t.setAttribute('aria-selected', String(k === this._i)), (t.tabIndex = k === this._i ? 0 : -1)));
                const t = thumbs[this._i];
                const ring = this.querySelector('.usa-pg2-ring');
                if (t && ring) {
                    ring.style.transform = `translateX(${t.offsetLeft}px)`;
                    ring.style.width = `${t.offsetWidth || 56}px`;
                }
                if (dir && !this.reduced)
                    this.motion(main, [{ transform: `translateX(${dir * 18}%)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.2,.8,.2,1)' });
            }
        }
        return UsaProductGallery;
    }, { id: 'product-gallery', text: css$10 });
}

var css$$ = "usa-countdown{display:inline-block;font:700 12px/1.2 system-ui,sans-serif;color:var(--usa-cd-fg,inherit)}.usa-cd-row{display:flex;gap:var(--usa-cd-gap,10px)}.usa-cd-unit{display:flex;flex-direction:column;align-items:center;gap:4px}.usa-cd-unit small{font-size:10px;text-transform:uppercase;letter-spacing:.08em;opacity:.6}.usa-cd-digits{display:flex;gap:3px;perspective:300px}.usa-cd-d{display:grid;place-items:center;width:var(--usa-cd-w,28px);height:calc(var(--usa-cd-w,28px) * 1.35);border-radius:6px;background:var(--usa-cd-bg,#111827);color:var(--usa-cd-c,#fff);font:800 calc(var(--usa-cd-w,28px) * .8)/1 ui-monospace,monospace;box-shadow:inset 0 -1px 0 rgba(255,255,255,.08),0 4px 10px -4px rgba(0,0,0,.5);background-image:linear-gradient(transparent 49%,rgba(0,0,0,.35) 50%,transparent 51%);transform-origin:50% 50%}usa-countdown[data-done] .usa-cd-d{background-color:var(--usa-cd-done,#ef4444)}";

/** Split seconds into d/h/m/s (7.3). */
function splitTime(sec) {
    const t = Math.max(0, Math.floor(sec));
    return { d: Math.floor(t / 86400), h: Math.floor((t % 86400) / 3600), m: Math.floor((t % 3600) / 60), s: t % 60 };
}
const NAMES$1 = { d: 'days', h: 'hours', m: 'minutes', s: 'seconds' };
function defineCountdown(tag = 'usa-countdown') {
    return base.defineElement(tag, (Base) => {
        class UsaCountdown extends Base {
            constructor() {
                super(...arguments);
                this._end = 0;
                this._timer = 0;
                this._lastMin = -1;
            }
            static get observedAttributes() {
                return ['to', 'seconds'];
            }
            get left() {
                return Math.max(0, Math.round((this._end - Date.now()) / 1000));
            }
            mount() {
                const units = this.str('units', 'd,h,m,s').split(',').map((u) => u.trim()).filter((u) => u in NAMES$1);
                const labels = this.str('labels', '').split(',');
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this.insertAdjacentHTML('afterbegin', `<span class="usa-cd-row" data-usa-part aria-hidden="true">${units.map((u, i) => `<span class="usa-cd-unit" data-u="${u}"><span class="usa-cd-digits"></span><small>${labels[i]?.trim() || NAMES$1[u]}</small></span>`).join('')}</span>`);
                this.setAttribute('role', 'timer');
                this.reset();
                this.onCleanup(() => this.stop());
                this.start();
            }
            changed() {
                if (this.isConnected)
                    (this.reset(), this.start());
            }
            reset() {
                const to = this.str('to', '');
                const t = to ? Date.parse(to) : NaN;
                this._end = Number.isFinite(t) ? t : Date.now() + this.num('seconds', 60) * 1000;
                this._lastMin = -1;
                this.removeAttribute('data-done');
                this.paint(false);
            }
            start() {
                this.stop();
                this._timer = setInterval(() => this.paint(true), 1000);
            }
            stop() {
                if (this._timer)
                    clearInterval(this._timer);
                this._timer = 0;
            }
            paint(flip) {
                const left = this.left;
                const t = splitTime(left);
                this.querySelectorAll('.usa-cd-unit').forEach((u) => {
                    const key = u.dataset.u;
                    const val = String(key === 'h' && !this.querySelector('[data-u="d"]') ? t.h + t.d * 24 : t[key]).padStart(2, '0');
                    const box = u.querySelector('.usa-cd-digits');
                    while (box.children.length < val.length)
                        box.insertAdjacentHTML('afterbegin', '<b class="usa-cd-d">0</b>');
                    while (box.children.length > val.length)
                        box.firstElementChild.remove();
                    Array.from(box.children).forEach((d, i) => {
                        if (d.textContent === val[i])
                            return;
                        d.textContent = val[i];
                        if (flip && !this.reduced)
                            this.motion(d, [{ transform: 'rotateX(-90deg)', filter: 'brightness(.7)' }, { transform: 'none', filter: 'none' }], { duration: 360, easing: 'cubic-bezier(.3,1.4,.6,1)' });
                    });
                });
                const min = Math.floor(left / 60);
                if (min !== this._lastMin) {
                    this._lastMin = min;
                    this.setAttribute('aria-label', `${this.str('label', 'Time left')}: ${t.d ? `${t.d} days ` : ''}${t.h} hours ${t.m} minutes`);
                }
                if (flip)
                    this.emit('tick', { left });
                if (left <= 0 && !this.hasAttribute('data-done')) {
                    this.setAttribute('data-done', '');
                    this.stop();
                    this.emit('done', {});
                }
            }
        }
        return UsaCountdown;
    }, { id: 'countdown', text: css$$ });
}

var css$_ = "usa-message-list{position:relative;display:block;width:var(--usa-ml-w,320px);max-width:100%;font:400 14px/1.35 system-ui,sans-serif}.usa-ml-list{display:flex;flex-direction:column;gap:6px;height:var(--usa-ml-h,260px);margin:0;padding:10px;list-style:none;overflow-y:auto;overscroll-behavior:contain;border-radius:14px;background:var(--usa-ml-bg,#f8fafc)}.usa-ml-msg{display:flex;flex-direction:column;align-items:flex-start;max-width:80%}.usa-ml-msg[data-side=right]{align-self:flex-end;align-items:flex-end}.usa-ml-msg[data-grouped] .usa-ml-from{display:none}.usa-ml-from{font-size:11px;font-weight:600;opacity:.6;margin:2px 8px}.usa-ml-from:empty,.usa-ml-time:empty{display:none}.usa-ml-bubble{padding:8px 12px;border-radius:16px 16px 16px 4px;background:var(--usa-ml-them,#e2e8f0);color:#0f172a;overflow-wrap:anywhere}.usa-ml-msg[data-side=right] .usa-ml-bubble{border-radius:16px 16px 4px 16px;background:var(--usa-ml-me,#7c5cff);color:#fff}.usa-ml-time{font-size:10px;opacity:.5;margin:2px 8px}.usa-ml-typing .usa-ml-bubble{display:inline-flex;gap:4px;padding:11px 12px}.usa-ml-typing i{width:7px;height:7px;border-radius:50%;background:#64748b;animation:usa-ml-dot 1.1s infinite}.usa-ml-typing i:nth-child(2){animation-delay:.18s}.usa-ml-typing i:nth-child(3){animation-delay:.36s}@keyframes usa-ml-dot{0%,60%,100%{transform:none;opacity:.4}30%{transform:translateY(-5px);opacity:1}}.usa-ml-new{position:absolute;left:50%;bottom:10px;transform:translateX(-50%);border:0;border-radius:999px;padding:6px 12px;background:#0f172a;color:#fff;font:600 12px/1 system-ui,sans-serif;cursor:pointer;box-shadow:0 6px 16px -6px rgba(0,0,0,.5)}.usa-ml-new[hidden]{display:none}@media (prefers-reduced-motion:reduce){.usa-ml-typing i{animation:none}}";

function defineMessageList(tag = 'usa-message-list') {
    return base.defineElement(tag, (Base) => {
        class UsaMessageList extends Base {
            constructor() {
                super(...arguments);
                this._msgs = [];
            }
            get messages() {
                return this._msgs.map((m) => ({ ...m }));
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const seed = Array.from(this.querySelectorAll(':scope > p'));
                this._msgs = [];
                this.insertAdjacentHTML('beforeend', '<ol class="usa-ml-list" data-usa-part role="log" aria-live="polite"></ol><button type="button" class="usa-ml-new" data-usa-part hidden>↓ New messages</button>');
                this.querySelector('.usa-ml-list').setAttribute('aria-label', this.str('label', 'Messages'));
                seed.forEach((p) => {
                    p.hidden = true;
                    this.add({ text: p.textContent || '', me: p.hasAttribute('data-me'), from: p.dataset.from, time: p.dataset.time }, false);
                });
                const list = this.querySelector('.usa-ml-list');
                const pill = this.querySelector('.usa-ml-new');
                this.listen(list, 'scroll', () => this.atBottom() && (pill.hidden = true));
                this.listen(pill, 'click', () => this.toBottom(true));
                this.toBottom(false);
            }
            atBottom() {
                const l = this.querySelector('.usa-ml-list');
                return l.scrollHeight - l.scrollTop - l.clientHeight < 24;
            }
            toBottom(smooth) {
                const l = this.querySelector('.usa-ml-list');
                if (typeof l.scrollTo === 'function')
                    l.scrollTo({ top: l.scrollHeight, behavior: smooth && !this.reduced ? 'smooth' : 'auto' });
                else
                    l.scrollTop = l.scrollHeight;
                this.querySelector('.usa-ml-new').hidden = true;
            }
            add(m, animate) {
                const list = this.querySelector('.usa-ml-list');
                const stick = this.atBottom();
                this.typing(false);
                const prev = this._msgs[this._msgs.length - 1];
                this._msgs.push({ ...m });
                const li = document.createElement('li');
                li.className = 'usa-ml-msg';
                li.dataset.side = m.me ? 'right' : 'left';
                if (prev && !!prev.me === !!m.me && prev.from === m.from)
                    li.dataset.grouped = '';
                li.innerHTML = '<span class="usa-ml-from"></span><span class="usa-ml-bubble"></span><time class="usa-ml-time"></time>';
                li.querySelector('.usa-ml-from').textContent = m.me ? '' : m.from || '';
                li.querySelector('.usa-ml-bubble').textContent = m.text;
                li.querySelector('.usa-ml-time').textContent = m.time || '';
                list.appendChild(li);
                if (animate && !this.reduced) {
                    li.style.transformOrigin = m.me ? '100% 100%' : '0 100%';
                    this.motion(li, [{ transform: `translateX(${m.me ? 20 : -20}px) scale(.7)`, opacity: 0 }, { transform: 'scale(1.03)', opacity: 1, offset: 0.65 }, { transform: 'none', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.2,.9,.3,1)' });
                }
                if (stick || m.me)
                    this.toBottom(animate);
                else
                    this.querySelector('.usa-ml-new').hidden = false;
            }
            push(msg) {
                this.add(msg, true);
                this.emit('message', { message: { ...msg } });
            }
            typing(who) {
                const list = this.querySelector('.usa-ml-list');
                if (!list)
                    return;
                list.querySelector('.usa-ml-typing')?.remove();
                if (who === false || who === '')
                    return;
                const li = document.createElement('li');
                li.className = 'usa-ml-msg usa-ml-typing';
                li.dataset.side = 'left';
                li.innerHTML = '<span class="usa-ml-bubble"><i></i><i></i><i></i></span>';
                li.setAttribute('aria-label', `${who} is typing`);
                list.appendChild(li);
                if (this.atBottom() || list.children.length < 3)
                    this.toBottom(false);
            }
        }
        return UsaMessageList;
    }, { id: 'message-list', text: css$_ });
}

var css$Z = "usa-reactions{position:relative;display:inline-flex;flex-wrap:wrap;align-items:center;gap:6px;font:600 13px/1 system-ui,sans-serif}.usa-rx-row{display:inline-flex;flex-wrap:wrap;gap:6px}.usa-rx-pill,.usa-rx-add{position:relative;display:inline-flex;align-items:center;gap:5px;height:28px;padding:0 10px;border:1px solid rgba(15,23,42,.12);border-radius:999px;background:var(--usa-rx-bg,#fff);color:inherit;font:inherit;cursor:pointer}.usa-rx-pill[hidden]{display:none}.usa-rx-pill[aria-pressed=true]{border-color:var(--usa-rx-accent,#7c5cff);background:color-mix(in srgb,var(--usa-rx-accent,#7c5cff) 14%,#fff)}.usa-rx-emo{display:inline-block;font-size:15px}.usa-rx-n{display:inline-block;min-width:1ch;font-variant-numeric:tabular-nums}.usa-rx-float{position:absolute;left:50%;top:0;font-size:16px;pointer-events:none}.usa-rx-picker{position:absolute;bottom:calc(100% + 6px);left:0;display:flex;gap:2px;padding:4px;border-radius:999px;background:#fff;box-shadow:0 10px 30px -10px rgba(15,23,42,.45);transform-origin:20% 100%;z-index:5}.usa-rx-picker[hidden]{display:none}.usa-rx-picker button{border:0;background:none;font-size:20px;width:32px;height:32px;border-radius:50%;cursor:pointer}.usa-rx-picker button:hover,.usa-rx-picker button:focus-visible{background:#f1f5f9}.usa-rx-pill:focus-visible,.usa-rx-add:focus-visible{outline:2px solid #7c5cff;outline-offset:2px}";

/** Parse "👍,❤️" + "3,1" into ordered [emoji, count] pairs (7.4). */
function parseReactions(emojis, counts = '') {
    const c = counts.split(',').map((n) => Math.max(0, parseInt(n, 10) || 0));
    return emojis.split(',').map((e) => e.trim()).filter(Boolean).map((e, i) => [e, c[i] || 0]);
}
function defineReactions(tag = 'usa-reactions') {
    return base.defineElement(tag, (Base) => {
        class UsaReactions extends Base {
            constructor() {
                super(...arguments);
                this._c = new Map();
                this._mine = new Set();
            }
            get counts() {
                return Object.fromEntries(this._c);
            }
            get mine() {
                return Array.from(this._mine);
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this.setAttribute('role', 'group');
                if (!this.hasAttribute('aria-label'))
                    this.setAttribute('aria-label', 'Reactions');
                this._c = new Map(parseReactions(this.str('emojis', '👍,❤️,😂,🎉'), this.str('counts', '')));
                this.insertAdjacentHTML('beforeend', '<span class="usa-rx-row" data-usa-part></span><button type="button" class="usa-rx-add" data-usa-part aria-label="Add reaction" aria-expanded="false">＋</button><span class="usa-rx-picker" data-usa-part hidden></span>');
                const picker = this.querySelector('.usa-rx-picker');
                for (const e of this.str('picker', '👍,❤️,😂,🎉,😮,😢,🔥,👀').split(',').map((s) => s.trim()).filter(Boolean)) {
                    const b = document.createElement('button');
                    b.type = 'button';
                    b.textContent = e;
                    b.setAttribute('aria-label', `React ${e}`);
                    this.listen(b, 'click', () => (this.toggle(e, true), this.pick(false)));
                    picker.appendChild(b);
                }
                this.listen(this.querySelector('.usa-rx-add'), 'click', () => this.pick(picker.hidden === true));
                this.listen(this, 'keydown', (e) => e.key === 'Escape' && this.pick(false));
                this.render(null);
            }
            pick(open) {
                const p = this.querySelector('.usa-rx-picker');
                p.hidden = !open;
                this.querySelector('.usa-rx-add').setAttribute('aria-expanded', String(open));
                if (open && !this.reduced)
                    this.motion(p, [{ transform: 'scale(.4) translateY(8px)', opacity: 0 }, { transform: 'scale(1.05)', opacity: 1, offset: 0.7 }, { transform: 'none', opacity: 1 }], { duration: 300, easing: 'ease-out' });
            }
            toggle(emoji, on) {
                const has = this._mine.has(emoji);
                const want = on ?? !has;
                if (want === has)
                    return;
                const n = Math.max(0, (this._c.get(emoji) || 0) + (want ? 1 : -1));
                this._c.set(emoji, n);
                want ? this._mine.add(emoji) : this._mine.delete(emoji);
                this.render(emoji, want);
                this.emit('react', { emoji, on: want, count: n });
            }
            render(changed, up = true) {
                const row = this.querySelector('.usa-rx-row');
                for (const [e, n] of this._c) {
                    let b = Array.from(row.children).find((x) => x.dataset.e === e);
                    if (!b) {
                        b = document.createElement('button');
                        b.setAttribute('type', 'button');
                        b.className = 'usa-rx-pill';
                        b.dataset.e = e;
                        b.innerHTML = '<span class="usa-rx-emo" aria-hidden="true"></span><span class="usa-rx-n" aria-hidden="true"></span>';
                        b.querySelector('.usa-rx-emo').textContent = e;
                        this.listen(b, 'click', () => this.toggle(e));
                        row.appendChild(b);
                    }
                    b.hidden = n === 0 && !this._mine.has(e);
                    b.setAttribute('aria-pressed', String(this._mine.has(e)));
                    b.setAttribute('aria-label', `${e} ${n} reaction${n === 1 ? '' : 's'}`);
                    const num = b.querySelector('.usa-rx-n');
                    num.textContent = String(n);
                    if (changed === e && !this.reduced) {
                        this.motion(b.querySelector('.usa-rx-emo'), [{ transform: 'scale(1)' }, { transform: 'scale(1.6) rotate(-12deg)', offset: 0.35 }, { transform: 'scale(1)' }], { duration: 420, easing: 'ease-out' });
                        this.motion(num, [{ transform: `translateY(${up ? 10 : -10}px)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 260, easing: 'ease-out' });
                        if (up)
                            this.float(b, e);
                    }
                }
            }
            float(b, e) {
                for (let i = 0; i < 3; i++) {
                    const s = document.createElement('span');
                    s.className = 'usa-rx-float';
                    s.setAttribute('aria-hidden', 'true');
                    s.textContent = e;
                    b.appendChild(s);
                    const a = this.motion(s, [{ transform: 'translate(-50%,0) scale(.5)', opacity: 1 }, { transform: `translate(${ -50 + (i - 1) * 60}%,-42px) scale(1)`, opacity: 0 }], { duration: 700, delay: i * 70, easing: 'ease-out' });
                    if (a)
                        a.finished.then(() => s.remove(), () => s.remove());
                    else
                        s.remove();
                }
            }
        }
        return UsaReactions;
    }, { id: 'reactions', text: css$Z });
}

var css$Y = "usa-notification-bell{position:relative;display:inline-block;font:400 13px/1.35 system-ui,sans-serif}.usa-nb-btn{position:relative;display:grid;place-items:center;width:42px;height:42px;border:0;border-radius:50%;background:var(--usa-nb-bg,#f1f5f9);color:var(--usa-nb-fg,#0f172a);cursor:pointer}.usa-nb-bell{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;transform-origin:50% 12%}.usa-nb-badge{position:absolute;top:2px;right:2px;min-width:17px;height:17px;padding:0 4px;border-radius:9px;background:#ef4444;color:#fff;font:800 10px/17px system-ui,sans-serif;text-align:center}.usa-nb-badge:empty{display:none}.usa-nb-panel{position:absolute;top:calc(100% + 8px);right:0;width:min(280px,86vw);border-radius:14px;background:#fff;color:#0f172a;box-shadow:0 18px 40px -14px rgba(15,23,42,.45);overflow:hidden;z-index:20;transform-origin:90% 0}.usa-nb-panel[hidden]{display:none}.usa-nb-panel header{display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border-bottom:1px solid rgba(15,23,42,.08)}.usa-nb-read{border:0;background:none;color:#7c5cff;font:600 12px/1 system-ui,sans-serif;cursor:pointer}.usa-nb-list{max-height:220px;margin:0;padding:4px;list-style:none;overflow:auto}.usa-nb-item{display:flex;justify-content:space-between;gap:8px;padding:8px;border-radius:8px}.usa-nb-item[data-unread]{background:#f5f3ff;font-weight:600}.usa-nb-item[data-unread]::before{content:\"\";flex:0 0 7px;height:7px;margin-top:6px;border-radius:50%;background:#7c5cff}.usa-nb-item time{opacity:.5;font-size:11px;white-space:nowrap}.usa-nb-text{flex:1;min-width:0}.usa-nb-empty{margin:16px;text-align:center;opacity:.55}.usa-nb-btn:focus-visible,.usa-nb-read:focus-visible{outline:2px solid #7c5cff;outline-offset:2px}";

function defineNotificationBell(tag = 'usa-notification-bell') {
    return base.defineElement(tag, (Base) => {
        class UsaNotificationBell extends Base {
            constructor() {
                super(...arguments);
                this._n = [];
                this._open = false;
            }
            get unread() {
                return this._n.filter((n) => !n.read).length;
            }
            get notices() {
                return this._n.map((n) => ({ ...n }));
            }
            get open() {
                return this._open;
            }
            set open(v) {
                this.toggle(!!v);
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const seed = Array.from(this.querySelectorAll(':scope > li'));
                this._n = seed.map((li, i) => ({ id: `n${i}`, text: li.textContent || '', time: li.dataset.time, read: li.hasAttribute('data-read') }));
                seed.forEach((li) => li.remove());
                this.insertAdjacentHTML('beforeend', '<button type="button" class="usa-nb-btn" data-usa-part aria-expanded="false"><svg class="usa-nb-bell" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a6 6 0 0 0-6 6v4l-2 3h16l-2-3V9a6 6 0 0 0-6-6zm-2 15a2 2 0 0 0 4 0"/></svg><b class="usa-nb-badge"></b></button><div class="usa-nb-panel" data-usa-part role="region" hidden><header><strong>Notifications</strong><button type="button" class="usa-nb-read">Mark all read</button></header><ul class="usa-nb-list"></ul><p class="usa-nb-empty">You’re all caught up</p></div>');
                this.querySelector('.usa-nb-panel').setAttribute('aria-label', this.str('label', 'Notifications'));
                this.listen(this.querySelector('.usa-nb-btn'), 'click', () => this.toggle());
                this.listen(this.querySelector('.usa-nb-read'), 'click', () => this.markAllRead());
                this.listen(this, 'keydown', (e) => e.key === 'Escape' && this._open && (this.toggle(false), this.querySelector('.usa-nb-btn').focus()));
                this.listen(document, 'pointerdown', (e) => this._open && !this.contains(e.target) && this.toggle(false));
                this.render(null);
            }
            toggle(force) {
                const on = force ?? !this._open;
                this._open = on;
                const p = this.querySelector('.usa-nb-panel');
                if (!p)
                    return;
                p.hidden = !on;
                this.querySelector('.usa-nb-btn').setAttribute('aria-expanded', String(on));
                if (on && !this.reduced)
                    this.motion(p, [{ transform: 'translateY(-8px) scale(.96)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 220, easing: 'ease-out' });
            }
            ring() {
                if (this.reduced)
                    return;
                this.motion(this.querySelector('.usa-nb-bell'), [0, 18, -16, 12, -8, 4, 0].map((d) => ({ transform: `rotate(${d}deg)` })), { duration: 800, easing: 'ease-out' });
            }
            notify(n) {
                const item = typeof n === 'string' ? { text: n } : { ...n };
                item.id = item.id || `n${Date.now().toString(36)}${this._n.length}`;
                item.read = !!item.read;
                this._n.unshift(item);
                this.ring();
                this.render(item.id);
                this.emit('notify', { notice: { ...item } });
            }
            markAllRead() {
                if (!this.unread)
                    return;
                this._n.forEach((n) => (n.read = true));
                this.render(null);
                this.emit('read', {});
            }
            render(added) {
                const list = this.querySelector('.usa-nb-list');
                list.textContent = '';
                for (const n of this._n) {
                    const li = document.createElement('li');
                    li.className = 'usa-nb-item';
                    if (!n.read)
                        li.dataset.unread = '';
                    li.innerHTML = '<span class="usa-nb-text"></span><time></time>';
                    li.querySelector('.usa-nb-text').textContent = n.text;
                    li.querySelector('time').textContent = n.time || '';
                    list.appendChild(li);
                    if (n.id === added && !this.reduced)
                        this.motion(li, [{ transform: 'translateY(-100%)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 320, easing: 'cubic-bezier(.2,.9,.3,1)' });
                }
                this.querySelector('.usa-nb-empty').hidden = this._n.length > 0;
                const u = this.unread;
                const badge = this.querySelector('.usa-nb-badge');
                const had = badge.textContent !== '';
                badge.textContent = u ? (u > 99 ? '99+' : String(u)) : '';
                this.querySelector('.usa-nb-btn').setAttribute('aria-label', `${this.str('label', 'Notifications')}${u ? `, ${u} unread` : ''}`);
                if (!this.reduced && added)
                    this.motion(badge, [{ transform: 'scale(.3)' }, { transform: 'scale(1.35)', offset: 0.5 }, { transform: 'scale(1)' }], { duration: 380, easing: 'ease-out' });
                else if (!this.reduced && had && !u)
                    this.motion(badge, [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(0)', opacity: 0 }], { duration: 200 });
            }
        }
        return UsaNotificationBell;
    }, { id: 'notification-bell', text: css$Y });
}

var css$X = "usa-presence{--s:var(--usa-pr2-size,48px);position:relative;display:inline-grid;place-items:center;width:var(--s);height:var(--s);vertical-align:middle}.usa-pr2-face{display:grid;place-items:center;width:100%;height:100%;border-radius:50%;overflow:hidden;background:linear-gradient(135deg,#a78bfa,#22d3ee);color:#fff;font:700 calc(var(--s) * .36)/1 system-ui,sans-serif}.usa-pr2-face img{width:100%;height:100%;object-fit:cover}.usa-pr2-dot,.usa-pr2-ripple{position:absolute;right:0;bottom:0;width:calc(var(--s) * .28);height:calc(var(--s) * .28);border-radius:50%;box-sizing:border-box}.usa-pr2-dot{border:2px solid var(--usa-pr2-ring,#fff);background:#94a3b8;transition:background-color .3s}.usa-pr2-ripple{background:#22c55e;pointer-events:none}usa-presence[data-state=online] .usa-pr2-dot{background:#22c55e}usa-presence[data-state=away] .usa-pr2-dot{background:#f59e0b}usa-presence[data-state=busy] .usa-pr2-dot{background:#ef4444}usa-presence[speaking] .usa-pr2-face{box-shadow:0 0 0 3px #22c55e;animation:usa-pr2-speak 1.2s ease-in-out infinite}@keyframes usa-pr2-speak{50%{box-shadow:0 0 0 6px rgba(34,197,94,.35)}}usa-presence[story]::before{content:\"\";position:absolute;inset:-4px;border-radius:50%;background:conic-gradient(#f59e0b,#ef4444,#d946ef,#7c3aed,#f59e0b);animation:usa-pr2-spin 3s linear infinite;z-index:-1}usa-presence[story] .usa-pr2-face{box-shadow:0 0 0 2px var(--usa-pr2-ring,#fff)}@keyframes usa-pr2-spin{to{transform:rotate(1turn)}}@media (prefers-reduced-motion:reduce){usa-presence[speaking] .usa-pr2-face,usa-presence[story]::before{animation:none}.usa-pr2-dot{transition:none}}";

/** Presence states (7.4). */
const PRESENCE_STATES = ['online', 'away', 'busy', 'offline'];
/** Initials for a display name (7.4). */
const initials = (name) => name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => Array.from(w)[0].toUpperCase())
    .join('');
function definePresence(tag = 'usa-presence') {
    return base.defineElement(tag, (Base) => {
        class UsaPresence extends Base {
            constructor() {
                super(...arguments);
                this._prev = '';
            }
            static get observedAttributes() {
                return ['status', 'speaking', 'name', 'src'];
            }
            get status() {
                const s = this.str('status', 'offline');
                return PRESENCE_STATES.includes(s) ? s : 'offline';
            }
            set status(v) {
                this.setAttribute('status', v);
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this.insertAdjacentHTML('afterbegin', '<span class="usa-pr2-face" data-usa-part></span><i class="usa-pr2-dot" data-usa-part aria-hidden="true"></i>');
                this.setAttribute('role', 'img');
                this._prev = '';
                this.paint();
            }
            changed() {
                if (this.isConnected && this.querySelector('.usa-pr2-face'))
                    this.paint();
            }
            paint() {
                const face = this.querySelector('.usa-pr2-face');
                const name = this.str('name', '');
                const src = this.str('src', '');
                if (src)
                    face.innerHTML = `<img alt="" src="${src.replace(/"/g, '&quot;')}">`;
                else
                    face.textContent = initials(name) || '?';
                const s = this.status;
                this.dataset.state = s;
                this.setAttribute('aria-label', `${name || 'User'}, ${s}${this.flag('speaking') ? ', speaking' : ''}`);
                const dot = this.querySelector('.usa-pr2-dot');
                if (this._prev && this._prev !== s && !this.reduced) {
                    this.motion(dot, [{ transform: 'scale(.4)' }, { transform: 'scale(1.3)', offset: 0.6 }, { transform: 'scale(1)' }], { duration: 360, easing: 'ease-out' });
                    if (s === 'online') {
                        const r = document.createElement('i');
                        r.className = 'usa-pr2-ripple';
                        r.setAttribute('aria-hidden', 'true');
                        this.appendChild(r);
                        const a = this.motion(r, [{ transform: 'scale(1)', opacity: 0.7 }, { transform: 'scale(3.2)', opacity: 0 }], { duration: 700, easing: 'ease-out' });
                        if (a)
                            a.finished.then(() => r.remove(), () => r.remove());
                        else
                            r.remove();
                    }
                }
                this._prev = s;
            }
        }
        return UsaPresence;
    }, { id: 'presence', text: css$X });
}

var css$W = "usa-leaderboard{display:block;width:var(--usa-lb-w,320px);max-width:100%;font:500 14px/1.2 system-ui,sans-serif}.usa-lb-list{margin:0;padding:0;list-style:none;display:grid;gap:4px}.usa-lb-row{display:grid;grid-template-columns:28px 30px 1fr auto auto;align-items:center;gap:8px;padding:6px 10px;border-radius:10px;background:var(--usa-lb-bg,rgba(15,23,42,.04));position:relative}.usa-lb-row[data-me]{box-shadow:inset 0 0 0 2px var(--usa-lb-accent,#7c5cff)}.usa-lb-rank{text-align:center;font-weight:800;font-size:15px}.usa-lb-av{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#a78bfa,#22d3ee) center/cover;color:#fff;font-weight:700;font-size:13px}.usa-lb-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.usa-lb-delta{font:700 11px/1 system-ui,sans-serif;font-style:normal}.usa-lb-row[data-move=up] .usa-lb-delta{color:#16a34a}.usa-lb-row[data-move=down] .usa-lb-delta{color:#dc2626}.usa-lb-score{font-variant-numeric:tabular-nums;font-weight:800}.usa-lb-live{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}";

/** Sort rows by score desc, then name (7.5). */
const rankRows = (rows) => [...rows].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
const MEDAL = ['🥇', '🥈', '🥉'];
function defineLeaderboard(tag = 'usa-leaderboard') {
    return base.defineElement(tag, (Base) => {
        class UsaLeaderboard extends Base {
            constructor() {
                super(...arguments);
                this._rows = [];
            }
            get rows() {
                return rankRows(this._rows).map((r) => ({ ...r }));
            }
            set rows(v) {
                this._rows = (v || []).map((r) => ({ ...r, score: Number(r.score) || 0 }));
                if (this.isConnected)
                    this.render();
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const seed = Array.from(this.querySelectorAll(':scope > li'));
                if (seed.length)
                    this._rows = seed.map((li) => ({ name: (li.textContent || '').trim(), score: Number(li.dataset.score) || 0, avatar: li.dataset.avatar }));
                seed.forEach((li) => li.remove());
                this.insertAdjacentHTML('beforeend', '<ol class="usa-lb-list" data-usa-part></ol><span class="usa-lb-live" data-usa-part aria-live="polite"></span>');
                this.querySelector('.usa-lb-list').setAttribute('aria-label', this.str('label', 'Leaderboard'));
                this.render();
            }
            setScore(name, score) {
                const r = this._rows.find((x) => x.name === name);
                if (r)
                    r.score = score;
                else
                    this._rows.push({ name, score });
                this.render();
            }
            render() {
                const list = this.querySelector('.usa-lb-list');
                if (!list)
                    return;
                const ranked = rankRows(this._rows).slice(0, this.num('limit', 10));
                const old = new Map();
                Array.from(list.children).forEach((li) => {
                    const h = li;
                    old.set(h.dataset.name, { li: h, top: h.getBoundingClientRect().top, rank: Number(h.dataset.rank), score: Number(h.dataset.score) });
                });
                const me = this.str('me', '');
                const moves = [];
                ranked.forEach((r, i) => {
                    const prev = old.get(r.name);
                    old.delete(r.name);
                    const li = prev?.li || document.createElement('li');
                    if (!prev) {
                        li.className = 'usa-lb-row';
                        li.innerHTML = '<b class="usa-lb-rank" aria-hidden="true"></b><span class="usa-lb-av" aria-hidden="true"></span><span class="usa-lb-name"></span><i class="usa-lb-delta" aria-hidden="true"></i><span class="usa-lb-score"></span>';
                    }
                    li.dataset.name = r.name;
                    li.dataset.rank = String(i + 1);
                    li.dataset.score = String(r.score);
                    li.toggleAttribute('data-me', r.name === me);
                    li.querySelector('.usa-lb-rank').textContent = MEDAL[i] || String(i + 1);
                    const av = li.querySelector('.usa-lb-av');
                    av.textContent = r.avatar ? '' : Array.from(r.name)[0] || '?';
                    av.style.backgroundImage = r.avatar ? `url("${r.avatar}")` : '';
                    li.querySelector('.usa-lb-name').textContent = r.name;
                    li.setAttribute('aria-label', `${i + 1}. ${r.name}, ${r.score} points`);
                    const sc = li.querySelector('.usa-lb-score');
                    const delta = li.querySelector('.usa-lb-delta');
                    list.appendChild(li);
                    if (prev && prev.rank !== i + 1) {
                        const d = prev.rank - (i + 1);
                        delta.textContent = d > 0 ? `▲${d}` : `▼${-d}`;
                        li.dataset.move = d > 0 ? 'up' : 'down';
                        moves.push(`${r.name} ${d > 0 ? 'up' : 'down'} to ${i + 1}`);
                        this.emit('rank', { name: r.name, from: prev.rank, to: i + 1 });
                    }
                    else if (prev) {
                        delete li.dataset.move;
                        delta.textContent = '';
                    }
                    if (!this.reduced && prev) {
                        const dy = prev.top - li.getBoundingClientRect().top;
                        if (dy)
                            this.motion(li, [{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 520, easing: 'cubic-bezier(.2,.9,.3,1)' });
                        if (li.dataset.move)
                            this.motion(li, [{ backgroundColor: li.dataset.move === 'up' ? 'rgba(34,197,94,.25)' : 'rgba(239,68,68,.2)' }, { backgroundColor: 'transparent' }], { duration: 1200, composite: 'add' });
                    }
                    this.roll(sc, prev ? prev.score : r.score, r.score);
                });
                old.forEach(({ li }) => li.remove());
                if (moves.length)
                    this.querySelector('.usa-lb-live').textContent = moves.join('; ');
            }
            roll(el, from, to) {
                if (this.reduced || from === to || typeof requestAnimationFrame !== 'function')
                    return void (el.textContent = to.toLocaleString());
                const t0 = performance.now();
                const f = (now) => {
                    const k = Math.min(1, (now - t0) / 600);
                    el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3))).toLocaleString();
                    if (k < 1)
                        requestAnimationFrame(f);
                };
                requestAnimationFrame(f);
            }
        }
        return UsaLeaderboard;
    }, { id: 'leaderboard', text: css$W });
}

var css$V = "usa-xp-bar{display:flex;align-items:center;gap:10px;width:var(--usa-xp-w,300px);max-width:100%;font:600 13px/1 system-ui,sans-serif}.usa-xp-lvl{flex:none;display:grid;place-items:center;width:34px;height:34px;border-radius:50%;background:var(--usa-xp-accent,#7c5cff);color:#fff;font-size:15px;font-weight:800;box-shadow:0 0 0 3px rgba(124,92,255,.25)}.usa-xp-track{flex:1;min-width:0;height:12px;border-radius:99px;background:var(--usa-xp-track,rgba(15,23,42,.1));overflow:hidden}.usa-xp-fill{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--usa-xp-accent,#7c5cff),#22d3ee);transform-origin:0 50%;transform:scaleX(0)}.usa-xp-num{flex:none;font-variant-numeric:tabular-nums;opacity:.75}usa-xp-bar[data-levelup] .usa-xp-lvl{background:#f59e0b;box-shadow:0 0 0 4px rgba(245,158,11,.35)}.usa-xp-live{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}";

/** Apply `gain` XP to (level, xp) with `per` XP per level (7.5). */
function levelFor(level, xp, gain, per = 100) {
    const p = Math.max(1, per);
    let total = Math.max(0, xp + gain);
    let ups = 0;
    while (total >= p) {
        total -= p;
        ups++;
    }
    return { level: level + ups, xp: total, ups };
}
function defineXpBar(tag = 'usa-xp-bar') {
    return base.defineElement(tag, (Base) => {
        class UsaXpBar extends Base {
            constructor() {
                super(...arguments);
                this._busy = false;
            }
            static get observedAttributes() {
                return ['level', 'xp', 'per'];
            }
            get level() {
                return Math.max(1, Math.floor(this.num('level', 1)));
            }
            set level(v) {
                this.setAttribute('level', String(v));
            }
            get xp() {
                return Math.max(0, this.num('xp', 0));
            }
            set xp(v) {
                this.setAttribute('xp', String(v));
            }
            get per() {
                return Math.max(1, this.num('per', 100));
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this.insertAdjacentHTML('beforeend', '<b class="usa-xp-lvl" data-usa-part aria-hidden="true"></b><span class="usa-xp-track" data-usa-part><i class="usa-xp-fill"></i></span><span class="usa-xp-num" data-usa-part aria-hidden="true"></span><span class="usa-xp-live" data-usa-part aria-live="polite"></span>');
                this.setAttribute('role', 'progressbar');
                this.setAttribute('aria-valuemin', '0');
                this.paint(false);
            }
            changed() {
                if (!this._busy && this.querySelector('.usa-xp-fill'))
                    this.paint(false);
            }
            paint(animate, from) {
                const per = this.per;
                const xp = Math.min(this.xp, per);
                this.querySelector('.usa-xp-lvl').textContent = String(this.level);
                this.querySelector('.usa-xp-num').textContent = `${Math.round(xp)} / ${per} XP`;
                this.setAttribute('aria-valuemax', String(per));
                this.setAttribute('aria-valuenow', String(Math.round(xp)));
                this.setAttribute('aria-label', `Level ${this.level}, ${Math.round(xp)} of ${per} XP`);
                const fill = this.querySelector('.usa-xp-fill');
                const to = `scaleX(${(xp / per).toFixed(4)})`;
                if (animate && !this.reduced && from !== undefined)
                    this.motion(fill, [{ transform: `scaleX(${from.toFixed(4)})` }, { transform: to }], { duration: 500, easing: 'cubic-bezier(.2,.8,.3,1)' });
                fill.style.transform = to;
            }
            add(n) {
                const per = this.per;
                const start = this.level;
                const r = levelFor(start, Math.min(this.xp, per), Number(n) || 0, per);
                const fill = this.querySelector('.usa-xp-fill');
                const fromK = Math.min(this.xp, per) / per;
                this._busy = true;
                this.level = r.level;
                this.xp = r.xp;
                this._busy = false;
                if (!fill)
                    return;
                if (r.ups && !this.reduced) {
                    this.motion(fill, [{ transform: `scaleX(${fromK.toFixed(4)})` }, { transform: 'scaleX(1)' }], { duration: 380, easing: 'ease-in' });
                    const lvl = this.querySelector('.usa-xp-lvl');
                    this.motion(lvl, [{ transform: 'scale(1)' }, { transform: 'scale(1.6) rotate(-8deg)', offset: 0.5 }, { transform: 'scale(1)' }], { duration: 600, delay: 340, easing: 'ease-out' });
                    this.dataset.levelup = '';
                    setTimeout(() => {
                        delete this.dataset.levelup;
                    }, 1200);
                    setTimeout(() => this.isConnected && this.paint(true, 0), 380);
                    this.paint(false);
                    fill.style.transform = 'scaleX(1)';
                }
                else
                    this.paint(true, fromK);
                if (r.ups) {
                    this.querySelector('.usa-xp-live').textContent = `Level up! Level ${r.level}`;
                    this.emit('levelup', { level: r.level });
                }
                this.emit('xp', { level: r.level, xp: r.xp, gained: n });
            }
        }
        return UsaXpBar;
    }, { id: 'xp-bar', text: css$V });
}

var css$U = "usa-badge-wall{display:block;width:var(--usa-bw-w,320px);max-width:100%;font:600 12px/1.2 system-ui,sans-serif}.usa-bw-count{margin:0 0 8px;font-size:13px;opacity:.75;font-variant-numeric:tabular-nums}.usa-bw-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(70px,1fr));gap:8px;margin:0;padding:0;list-style:none}.usa-bw-badge{position:relative;display:grid;justify-items:center;gap:4px;padding:8px 4px;border-radius:12px;background:linear-gradient(160deg,#fde68a,#f59e0b);color:#422006;text-align:center;overflow:hidden}.usa-bw-icon{font-size:24px;line-height:1}.usa-bw-name{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.usa-bw-badge[data-locked]{background:var(--usa-bw-locked,#e2e8f0);color:#64748b}.usa-bw-badge[data-locked] .usa-bw-icon{filter:grayscale(1);opacity:.45}.usa-bw-badge[data-locked]::after{content:\"🔒\";position:absolute;top:3px;right:4px;font-size:11px}.usa-bw-badge[data-shine]::before{content:\"\";position:absolute;inset:0;background:linear-gradient(110deg,transparent 35%,rgba(255,255,255,.75) 50%,transparent 65%) 120% 0/250% 100%;animation:usa-bw-shine 1s ease-in-out .3s both;pointer-events:none}@keyframes usa-bw-shine{to{background-position:-20% 0}}.usa-bw-live{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}@media (prefers-reduced-motion:reduce){.usa-bw-badge[data-shine]::before{animation:none;display:none}}";

/** Unlocked / total counts for a badge list (7.5). */
const badgeProgress = (b) => ({ unlocked: b.filter((x) => !x.locked).length, total: b.length });
function defineBadgeWall(tag = 'usa-badge-wall') {
    return base.defineElement(tag, (Base) => {
        class UsaBadgeWall extends Base {
            constructor() {
                super(...arguments);
                this._b = [];
            }
            get badges() {
                return this._b.map((b) => ({ ...b }));
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const seed = Array.from(this.querySelectorAll(':scope > li'));
                if (seed.length)
                    this._b = seed.map((li) => ({ name: (li.textContent || '').trim(), icon: li.dataset.icon || '🏅', locked: li.hasAttribute('data-locked') }));
                seed.forEach((li) => li.remove());
                this.insertAdjacentHTML('beforeend', '<p class="usa-bw-count" data-usa-part></p><ul class="usa-bw-grid" data-usa-part></ul><span class="usa-bw-live" data-usa-part aria-live="polite"></span>');
                const grid = this.querySelector('.usa-bw-grid');
                grid.setAttribute('aria-label', this.str('label', 'Achievements'));
                for (const b of this._b) {
                    const li = document.createElement('li');
                    li.className = 'usa-bw-badge';
                    li.innerHTML = '<span class="usa-bw-icon" aria-hidden="true"></span><span class="usa-bw-name"></span>';
                    li.querySelector('.usa-bw-icon').textContent = b.icon;
                    li.querySelector('.usa-bw-name').textContent = b.name;
                    li.dataset.name = b.name;
                    grid.appendChild(li);
                    this.paintBadge(li, b);
                }
                this.count();
            }
            paintBadge(li, b) {
                li.toggleAttribute('data-locked', b.locked);
                li.setAttribute('aria-label', `${b.name}, ${b.locked ? 'locked' : 'unlocked'}`);
            }
            count() {
                const p = badgeProgress(this._b);
                this.querySelector('.usa-bw-count').textContent = `${p.unlocked} / ${p.total} unlocked`;
            }
            unlock(name) {
                const b = this._b.find((x) => x.name === name && x.locked);
                if (!b)
                    return false;
                b.locked = false;
                const li = Array.from(this.querySelectorAll('.usa-bw-badge')).find((x) => x.dataset.name === name);
                if (li) {
                    if (!this.reduced) {
                        this.motion(li, [{ transform: 'perspective(400px) rotateY(0)' }, { transform: 'perspective(400px) rotateY(90deg)', offset: 0.45 }, { transform: 'perspective(400px) rotateY(0) scale(1.12)', offset: 0.8 }, { transform: 'none' }], { duration: 700, easing: 'ease-out' });
                        setTimeout(() => this.paintBadge(li, b), 300);
                        li.dataset.shine = '';
                        setTimeout(() => delete li.dataset.shine, 1100);
                    }
                    else
                        this.paintBadge(li, b);
                    li.setAttribute('aria-label', `${b.name}, unlocked`);
                }
                this.count();
                this.querySelector('.usa-bw-live').textContent = `Unlocked: ${name}`;
                this.emit('unlock', { name });
                return true;
            }
        }
        return UsaBadgeWall;
    }, { id: 'badge-wall', text: css$U });
}

var css$T = "usa-prize-wheel{display:inline-block;--s:var(--usa-pw-size,200px);font:700 11px/1 system-ui,sans-serif}.usa-pw-box{position:relative;display:grid;place-items:center;width:var(--s);height:var(--s)}.usa-pw-wheel{position:absolute;inset:0;border-radius:50%;box-shadow:0 0 0 4px #fff,0 0 0 6px rgba(15,23,42,.15),0 8px 24px rgba(15,23,42,.2);will-change:transform}.usa-pw-label{position:absolute;left:50%;top:0;width:0;height:50%;display:flex;justify-content:center;padding-top:10px;transform-origin:0 100%;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.35);white-space:nowrap}.usa-pw-pointer{position:absolute;top:-10px;left:50%;margin-left:-9px;width:0;height:0;border:9px solid transparent;border-top:16px solid var(--usa-pw-pointer,#0f172a);border-bottom:0;z-index:2;transform-origin:50% 0}.usa-pw-btn{position:relative;z-index:1;width:30%;aspect-ratio:1;border:0;border-radius:50%;background:#fff;color:#0f172a;font:800 13px/1 system-ui,sans-serif;box-shadow:0 2px 8px rgba(15,23,42,.25);cursor:pointer}.usa-pw-btn:disabled{cursor:progress;opacity:.85}usa-prize-wheel[data-done] .usa-pw-wheel{box-shadow:0 0 0 4px #fff,0 0 0 6px #facc15,0 0 28px rgba(250,204,21,.6)}.usa-pw-live{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}";

/** Final wheel rotation (deg) that puts segment `index` of `count` under the top pointer after `turns` full turns (7.5). */
function wheelAngle(index, count, turns = 5) {
    const seg = 360 / Math.max(1, count);
    return turns * 360 + (360 - (index * seg + seg / 2));
}
const COLORS$1 = ['#7c5cff', '#22d3ee', '#f59e0b', '#ef4444', '#22c55e', '#ec4899', '#3b82f6', '#a3e635'];
function definePrizeWheel(tag = 'usa-prize-wheel') {
    return base.defineElement(tag, (Base) => {
        class UsaPrizeWheel extends Base {
            constructor() {
                super(...arguments);
                this._r = -1;
                this._spin = false;
                this._rot = 0;
            }
            get segments() {
                return this.str('segments', '10% off,Free ship,Try again,🎁 Gift,5% off,Jackpot').split(',').map((s) => s.trim()).filter(Boolean);
            }
            get result() {
                return this._r;
            }
            get spinning() {
                return this._spin;
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const s = this.segments;
                const seg = 360 / s.length;
                const grad = s.map((_, i) => `${COLORS$1[i % COLORS$1.length]} ${(i * seg).toFixed(2)}deg ${((i + 1) * seg).toFixed(2)}deg`).join(',');
                this.insertAdjacentHTML('beforeend', '<span class="usa-pw-box" data-usa-part><i class="usa-pw-pointer" aria-hidden="true"></i><span class="usa-pw-wheel" aria-hidden="true"></span><button type="button" class="usa-pw-btn"></button></span><span class="usa-pw-live" data-usa-part aria-live="polite"></span>');
                const wheel = this.querySelector('.usa-pw-wheel');
                wheel.style.background = `conic-gradient(${grad})`;
                s.forEach((label, i) => {
                    const l = document.createElement('span');
                    l.className = 'usa-pw-label';
                    l.textContent = label;
                    l.style.transform = `rotate(${(i * seg + seg / 2).toFixed(2)}deg)`;
                    wheel.appendChild(l);
                });
                this._rot = 0;
                const btn = this.querySelector('.usa-pw-btn');
                btn.textContent = this.str('label', 'Spin');
                btn.setAttribute('aria-label', `${this.str('label', 'Spin')} the prize wheel`);
                this.listen(btn, 'click', () => void this.spin());
            }
            async spin(index) {
                if (this._spin)
                    return this._r;
                const s = this.segments;
                const i = index !== undefined && index >= 0 && index < s.length ? Math.floor(index) : Math.floor(Math.random() * s.length);
                const wheel = this.querySelector('.usa-pw-wheel');
                const btn = this.querySelector('.usa-pw-btn');
                if (!wheel || !btn)
                    return -1;
                this._spin = true;
                btn.disabled = true;
                this.removeAttribute('data-done');
                const base = this._rot - (this._rot % 360);
                const to = base + wheelAngle(i, s.length, this.reduced ? 0 : this.num('turns', 5));
                const from = this._rot;
                this._rot = to;
                const a = this.reduced ? null : this.motion(wheel, [{ transform: `rotate(${from}deg)` }, { transform: `rotate(${to}deg)` }], { duration: this.num('duration', 4000), easing: 'cubic-bezier(.12,.6,.1,1)' });
                wheel.style.transform = `rotate(${to}deg)`;
                if (a) {
                    const ptr = this.querySelector('.usa-pw-pointer');
                    this.motion(ptr, [{ transform: 'rotate(0)' }, { transform: 'rotate(-18deg)' }, { transform: 'rotate(0)' }], { duration: 160, iterations: 18, easing: 'ease-out' });
                    await a.finished.catch(() => undefined);
                }
                this._spin = false;
                btn.disabled = false;
                this._r = i;
                this.setAttribute('data-done', '');
                this.querySelector('.usa-pw-live').textContent = `Result: ${s[i]}`;
                this.emit('result', { index: i, label: s[i] });
                return i;
            }
        }
        return UsaPrizeWheel;
    }, { id: 'prize-wheel', text: css$T });
}

var css$S = "usa-globe{display:inline-block;width:var(--usa-gl-size,200px);max-width:100%;aspect-ratio:1;touch-action:pan-y;cursor:grab;user-select:none}usa-globe:active{cursor:grabbing}.usa-gl-svg{display:block;width:100%;height:100%;overflow:visible}.usa-gl-sea{fill:var(--usa-gl-sea,#1e3a8a)}.usa-gl-grid{fill:none;stroke:var(--usa-gl-grid,rgba(255,255,255,.35));stroke-width:.7}.usa-gl-dot{fill:var(--usa-gl-accent,#f59e0b);stroke:#fff;stroke-width:1}.usa-gl-ring{fill:none;stroke:var(--usa-gl-accent,#f59e0b);stroke-width:1.5;transform-box:fill-box;transform-origin:center;opacity:0}.usa-gl-mark[data-hidden]{display:none}.usa-gl-mark[data-active] .usa-gl-dot{fill:#ef4444}@media (prefers-reduced-motion:no-preference){.usa-gl-ring{animation:usa-gl-pulse 1.8s ease-out infinite}}@keyframes usa-gl-pulse{0%{transform:scale(.6);opacity:.9}100%{transform:scale(3.2);opacity:0}}";

const RAD = Math.PI / 180;
/** Orthographic projection on a unit sphere seen from longitude `lon0`, tilted by `tilt` degrees (7.6). */
function project(lat, lon, lon0 = 0, tilt = 0) {
    const p = lat * RAD;
    const l = (lon - lon0) * RAD;
    const t = tilt * RAD;
    const x = Math.cos(p) * Math.sin(l);
    const y0 = Math.sin(p);
    const z0 = Math.cos(p) * Math.cos(l);
    const y = y0 * Math.cos(t) - z0 * Math.sin(t);
    const z = y0 * Math.sin(t) + z0 * Math.cos(t);
    return { x: Math.round(x * 1e4) / 1e4, y: Math.round(-y * 1e4) / 1e4, visible: z >= 0 };
}
/** Parse "Name:lat,lon; Name2:lat,lon" (7.6). */
function parseMarkers(s) {
    return String(s || '')
        .split(';')
        .map((part) => {
        const m = /^\s*([^:]+):\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*$/.exec(part);
        return m ? { name: m[1].trim(), lat: Math.max(-90, Math.min(90, +m[2])), lon: +m[3] } : null;
    })
        .filter((m) => !!m);
}
const R = 90;
const C = 100;
const line = (pts) => {
    let d = '';
    let pen = false;
    for (const p of pts) {
        if (!p.visible) {
            pen = false;
            continue;
        }
        d += `${pen ? 'L' : 'M'}${(C + p.x * R).toFixed(1)} ${(C + p.y * R).toFixed(1)}`;
        pen = true;
    }
    return d;
};
function defineGlobe(tag = 'usa-globe') {
    return base.defineElement(tag, (Base) => {
        class UsaGlobe extends Base {
            constructor() {
                super(...arguments);
                this._lon = 0;
                this._raf = 0;
                this._visible = false;
                this._drag = null;
            }
            static get observedAttributes() {
                return ['markers', 'speed', 'tilt'];
            }
            get markers() {
                return parseMarkers(this.str('markers'));
            }
            get lon() {
                return this._lon;
            }
            set lon(v) {
                this._lon = ((Number(v) % 360) + 360) % 360;
                this.draw();
            }
            mount() {
                this._lon = this.num('lon', this._lon);
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const ms = this.markers;
                this.insertAdjacentHTML('beforeend', `<svg class="usa-gl-svg" data-usa-part viewBox="0 0 200 200" aria-hidden="true"><defs><radialGradient id="usa-gl-shade" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></radialGradient></defs><circle class="usa-gl-sea" cx="100" cy="100" r="${R}"/><path class="usa-gl-grid"/><g class="usa-gl-marks">${ms.map((m) => `<g class="usa-gl-mark" data-name="${m.name.replace(/"/g, '&quot;')}"><circle class="usa-gl-ring" r="4"/><circle class="usa-gl-dot" r="3.2"/></g>`).join('')}</g><circle cx="100" cy="100" r="${R}" fill="url(#usa-gl-shade)" pointer-events="none"/></svg>`);
                this.setAttribute('role', 'img');
                this.setAttribute('aria-label', ms.length ? `Globe: ${ms.map((m) => m.name).join(', ')}` : 'Globe');
                this.draw();
                this.inView((v) => {
                    this._visible = v;
                    if (v)
                        this.spin();
                    else
                        cancelAnimationFrame(this._raf);
                });
                this.listen(this, 'pointerdown', (e) => {
                    this._drag = { x: e.clientX, lon: this._lon };
                    this.setPointerCapture?.(e.pointerId);
                });
                this.listen(this, 'pointermove', (e) => {
                    if (this._drag)
                        this.lon = this._drag.lon - (e.clientX - this._drag.x) * 0.6;
                });
                const up = () => (this._drag = null);
                this.listen(this, 'pointerup', up);
                this.listen(this, 'pointercancel', up);
                this.onCleanup(() => cancelAnimationFrame(this._raf));
            }
            spin() {
                cancelAnimationFrame(this._raf);
                const speed = this.num('speed', 12);
                if (this.reduced || !speed)
                    return;
                let last = 0;
                const step = (t) => {
                    if (!this._visible || !this.isConnected)
                        return;
                    const dt = last ? Math.min(64, t - last) : 0;
                    last = t;
                    if (!this._drag)
                        this.lon = this._lon + (speed * dt) / 1000;
                    this._raf = requestAnimationFrame(step);
                };
                this._raf = requestAnimationFrame(step);
            }
            draw() {
                const grid = this.querySelector('.usa-gl-grid');
                if (!grid)
                    return;
                const tilt = this.num('tilt', 18);
                let d = '';
                for (let lon = 0; lon < 360; lon += 30)
                    d += line(Array.from({ length: 37 }, (_, i) => project(-90 + i * 5, lon, this._lon, tilt)));
                for (let lat = -60; lat <= 60; lat += 30)
                    d += line(Array.from({ length: 73 }, (_, i) => project(lat, i * 5, this._lon, tilt)));
                grid.setAttribute('d', d);
                const ms = this.markers;
                this.querySelectorAll('.usa-gl-mark').forEach((g, i) => {
                    const m = ms[i];
                    if (!m)
                        return;
                    const p = project(m.lat, m.lon, this._lon, tilt);
                    g.setAttribute('transform', `translate(${(C + p.x * R).toFixed(1)} ${(C + p.y * R).toFixed(1)})`);
                    g.toggleAttribute('data-hidden', !p.visible);
                });
            }
            async flyTo(name) {
                const m = this.markers.find((x) => x.name === name);
                if (!m)
                    return;
                const from = this._lon;
                const delta = (((m.lon - from) % 360) + 540) % 360 - 180;
                if (this.reduced)
                    this.lon = from + delta;
                else
                    await new Promise((done) => {
                        const t0 = performance.now();
                        const dur = 900;
                        const tick = (t) => {
                            const k = Math.min(1, (t - t0) / dur);
                            const e = 1 - Math.pow(1 - k, 3);
                            this.lon = from + delta * e;
                            if (k < 1 && this.isConnected)
                                requestAnimationFrame(tick);
                            else
                                done();
                        };
                        requestAnimationFrame(tick);
                    });
                this.querySelectorAll('.usa-gl-mark').forEach((g) => g.toggleAttribute('data-active', g.getAttribute('data-name') === name));
                this.emit('focus', { name, lat: m.lat, lon: m.lon });
            }
        }
        return UsaGlobe;
    }, { id: 'globe', text: css$S });
}

var css$R = "usa-location-card{display:block;width:var(--usa-lc-w,280px);max-width:100%;font:500 13px/1.35 system-ui,sans-serif}.usa-lc{border-radius:16px;overflow:hidden;background:var(--usa-lc-bg,#fff);color:var(--usa-lc-fg,#0f172a);box-shadow:0 10px 28px -14px rgba(15,23,42,.45);border:1px solid rgba(15,23,42,.08)}.usa-lc-map{position:relative;height:var(--usa-lc-map-h,110px);background:var(--usa-lc-land,#e8efe4);overflow:hidden}.usa-lc-map svg{display:block;width:100%;height:100%}.usa-lc-street{fill:none;stroke:#fff;stroke-width:7;stroke-linecap:round}.usa-lc-route{fill:none;stroke:var(--usa-lc-accent,#2563eb);stroke-width:4;stroke-linecap:round;stroke-dasharray:100}.usa-lc-from{fill:#fff;stroke:var(--usa-lc-accent,#2563eb);stroke-width:3}.usa-lc-pin{position:absolute;left:70%;top:calc(48% - 8px);width:22px;height:22px;transform:translate(-50%,-100%);border-radius:50%;background:var(--usa-lc-pin,#ef4444);box-shadow:0 4px 8px rgba(0,0,0,.25)}.usa-lc-pin::after{content:\"\";position:absolute;inset:6px;border-radius:50%;background:#fff}.usa-lc-pin::before{content:\"\";position:absolute;left:50%;bottom:-8px;width:0;height:0;border:6px solid transparent;border-top:9px solid var(--usa-lc-pin,#ef4444);border-bottom:0;transform:translateX(-50%)}.usa-lc-ring{position:absolute;left:70%;top:48%;width:18px;height:18px;border-radius:50%;border:2px solid var(--usa-lc-pin,#ef4444);transform:translate(-50%,-50%);opacity:0;pointer-events:none}.usa-lc-body{padding:10px 14px 12px}.usa-lc-name{margin:0;font-size:15px;font-weight:750}.usa-lc-addr{margin:2px 0 0;opacity:.7}.usa-lc-meta{display:flex;align-items:center;gap:10px;margin:8px 0 0}.usa-lc-meta:empty{display:none}.usa-lc-dist{font-weight:700;font-variant-numeric:tabular-nums}.usa-lc-go{margin-left:auto;color:var(--usa-lc-accent,#2563eb);font-weight:700;text-decoration:none}.usa-lc-go:hover,.usa-lc-go:focus-visible{text-decoration:underline}";

/** Great-circle distance in km between two lat/lon points (7.6). */
function haversine(lat1, lon1, lat2, lon2) {
    const r = Math.PI / 180;
    const a = Math.sin(((lat2 - lat1) * r) / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(((lon2 - lon1) * r) / 2) ** 2;
    return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(a)));
}
/** "850 m", "4.2 km", "12 km" — or miles with `unit = 'mi'` (7.6). */
function formatDistance(km, unit = 'km') {
    if (unit === 'mi') {
        const mi = km * 0.621371;
        return mi < 0.1 ? `${Math.round(mi * 5280)} ft` : `${mi < 10 ? mi.toFixed(1) : Math.round(mi)} mi`;
    }
    return km < 1 ? `${Math.round(km * 1000)} m` : `${km < 10 ? km.toFixed(1) : Math.round(km)} km`;
}
const esc$g = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
function defineLocationCard(tag = 'usa-location-card') {
    return base.defineElement(tag, (Base) => {
        class UsaLocationCard extends Base {
            constructor() {
                super(...arguments);
                this._played = false;
            }
            static get observedAttributes() {
                return ['name', 'address', 'lat', 'lon', 'from-lat', 'from-lon', 'distance', 'href', 'unit'];
            }
            get km() {
                const lat = this.num('lat', NaN);
                const lon = this.num('lon', NaN);
                const fl = this.num('from-lat', NaN);
                const fo = this.num('from-lon', NaN);
                return [lat, lon, fl, fo].every(Number.isFinite) ? haversine(fl, fo, lat, lon) : null;
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const name = this.str('name', 'Location');
                const km = this.km;
                const dist = this.str('distance') || (km === null ? '' : formatDistance(km, this.str('unit') === 'mi' ? 'mi' : 'km'));
                const href = this.str('href');
                const origin = km !== null;
                this.insertAdjacentHTML('beforeend', `<article class="usa-lc" data-usa-part aria-label="${esc$g(name)}"><div class="usa-lc-map" aria-hidden="true"><svg viewBox="0 0 240 120" preserveAspectRatio="xMidYMid slice"><path class="usa-lc-street" d="M0 30H240M0 78H240M40 0V120M120 0V120M196 0V120M0 112L240 8"/>${origin ? '<path class="usa-lc-route" pathLength="100" d="M28 100C60 100 64 78 96 78S120 40 160 40 168 58 168 58"/><circle class="usa-lc-from" cx="28" cy="100" r="4"/>' : ''}</svg><span class="usa-lc-ring"></span><span class="usa-lc-pin"></span></div><div class="usa-lc-body"><h3 class="usa-lc-name">${esc$g(name)}</h3>${this.str('address') ? `<p class="usa-lc-addr">${esc$g(this.str('address'))}</p>` : ''}<p class="usa-lc-meta">${dist ? `<span class="usa-lc-dist">${esc$g(dist)}</span>` : ''}${href ? `<a class="usa-lc-go" href="${esc$g(href)}" target="_blank" rel="noopener">Directions</a>` : ''}</p></div></article>`);
                if (origin)
                    this.setAttribute('data-route', '');
                else
                    this.removeAttribute('data-route');
                this._played = false;
                this.inView((v) => v && !this._played && this.replay(), { threshold: 0.4 });
            }
            replay() {
                this._played = true;
                const pin = this.querySelector('.usa-lc-pin');
                const ring = this.querySelector('.usa-lc-ring');
                const route = this.querySelector('.usa-lc-route');
                if (!pin)
                    return;
                if (this.reduced) {
                    this.emit('arrive', { name: this.str('name') });
                    return;
                }
                if (route)
                    this.motion(route, [{ strokeDashoffset: '100' }, { strokeDashoffset: '0' }], { duration: 900, easing: 'ease-in-out' });
                const delay = route ? 700 : 0;
                const a = this.motion(pin, [{ transform: 'translate(-50%,-100%) translateY(-60px)', opacity: 0 }, { transform: 'translate(-50%,-100%)', opacity: 1, offset: 0.55 }, { transform: 'translate(-50%,-100%) translateY(-10px) scaleY(1.04)', offset: 0.75 }, { transform: 'translate(-50%,-100%)' }], { duration: 650, delay, easing: 'ease-out', fill: 'backwards' });
                if (ring)
                    this.motion(ring, [{ transform: 'translate(-50%,-50%) scale(.2)', opacity: 0.9 }, { transform: 'translate(-50%,-50%) scale(2.4)', opacity: 0 }], { duration: 900, delay: delay + 450, easing: 'ease-out', iterations: 2 });
                const done = () => this.isConnected && this.emit('arrive', { name: this.str('name') });
                if (a)
                    a.finished.then(done, () => undefined);
                else
                    done();
            }
        }
        return UsaLocationCard;
    }, { id: 'location-card', text: css$R });
}

var css$Q = "usa-field{display:block;width:var(--usa-fld-w,280px);max-width:100%;font:500 14px/1.3 system-ui,sans-serif;--usa-fld-accent:#6366f1;--usa-fld-bad:#e11d48;--usa-fld-good:#16a34a}.usa-fld{position:relative;padding-top:18px}.usa-fld-input{display:block;box-sizing:border-box;width:100%;padding:8px 30px 8px 2px;border:0;border-bottom:2px solid var(--usa-fld-rule,rgba(100,116,139,.45));background:transparent;color:inherit;font:inherit;outline:none;border-radius:0}.usa-fld-label{position:absolute;left:2px;top:26px;color:var(--usa-fld-muted,#64748b);pointer-events:none;transform-origin:0 0;transition:transform .22s cubic-bezier(.2,.8,.2,1),color .2s}usa-field[data-focus] .usa-fld-label,usa-field[data-filled] .usa-fld-label,.usa-fld-input:not(:placeholder-shown)+.usa-fld-label{transform:translateY(-24px) scale(.8)}usa-field[data-focus] .usa-fld-label{color:var(--usa-fld-accent)}.usa-fld-line{position:absolute;left:0;right:0;top:calc(18px + 2.3em - 1px);height:2px;background:var(--usa-fld-accent);transform:scaleX(0);transition:transform .3s cubic-bezier(.2,.8,.2,1)}usa-field[data-focus] .usa-fld-line{transform:scaleX(1)}usa-field[data-invalid] .usa-fld-line{transform:scaleX(1);background:var(--usa-fld-bad)}usa-field[data-invalid] .usa-fld-label{color:var(--usa-fld-bad)}.usa-fld-ok{position:absolute;right:2px;top:24px;width:20px;height:20px;fill:none;stroke:var(--usa-fld-good);stroke-width:3;stroke-linecap:round;stroke-linejoin:round}.usa-fld-ok path{stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset .35s ease-out}usa-field[data-valid] .usa-fld-ok path{stroke-dashoffset:0}.usa-fld-meter{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-top:6px}.usa-fld-meter i{height:4px;border-radius:2px;background:rgba(100,116,139,.25);transform-origin:0 50%;transition:background .25s}.usa-fld-meter[data-score=\"1\"] i:nth-child(-n+1){background:#ef4444}.usa-fld-meter[data-score=\"2\"] i:nth-child(-n+2){background:#f59e0b}.usa-fld-meter[data-score=\"3\"] i:nth-child(-n+3){background:#84cc16}.usa-fld-meter[data-score=\"4\"] i{background:#16a34a}.usa-fld-msg{margin:4px 0 0;min-height:1.3em;font-size:12px;color:var(--usa-fld-muted,#64748b)}usa-field[data-invalid] .usa-fld-msg{color:var(--usa-fld-bad)}@media (prefers-reduced-motion:reduce){.usa-fld-label,.usa-fld-line,.usa-fld-ok path,.usa-fld-meter i{transition:none}}";

/** 0–4 password strength score with a label (7.7). */
function passwordStrength(pw) {
    let s = 0;
    if (pw.length >= 8)
        s++;
    if (pw.length >= 12)
        s++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw))
        s++;
    if (/\d/.test(pw))
        s++;
    if (/[^A-Za-z0-9]/.test(pw))
        s++;
    if (!pw)
        s = 0;
    else if (pw.length < 6)
        s = Math.min(s, 1);
    const score = Math.min(4, s);
    return { score, label: ['Too short', 'Weak', 'Fair', 'Good', 'Strong'][score] };
}
const esc$f = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
let uid$3 = 0;
const PASS = ['type', 'name', 'required', 'pattern', 'minlength', 'maxlength', 'autocomplete', 'inputmode', 'placeholder'];
function defineField(tag = 'usa-field') {
    return base.defineElement(tag, (Base) => {
        class UsaField extends Base {
            constructor() {
                super(...arguments);
                this._id = `usa-fld-${++uid$3}`;
                this._checking = false;
            }
            static get observedAttributes() {
                return ['label', 'hint', 'error', 'strength', ...PASS];
            }
            get input() {
                return this.querySelector('.usa-fld-input');
            }
            get value() {
                return this.input?.value ?? this.str('value');
            }
            set value(v) {
                if (this.input) {
                    this.input.value = v;
                    this.sync();
                }
                else
                    this.setAttribute('value', v);
            }
            mount() {
                const keep = this.input?.value ?? this.str('value');
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const id = this._id;
                const strength = this.flag('strength');
                const attrs = PASS.filter((a) => this.hasAttribute(a))
                    .map((a) => (a === 'required' ? ' required' : ` ${a}="${esc$f(this.str(a))}"`))
                    .join('');
                this.insertAdjacentHTML('beforeend', `<div class="usa-fld" data-usa-part><input class="usa-fld-input" id="${id}"${attrs} aria-describedby="${id}-msg"${this.hasAttribute('type') ? '' : ' type="text"'}><label class="usa-fld-label" for="${id}">${esc$f(this.str('label', 'Label'))}</label><span class="usa-fld-line" aria-hidden="true"></span><svg class="usa-fld-ok" viewBox="0 0 24 24" aria-hidden="true"><path pathLength="1" d="M5 12.5l4.5 4.5L19 7.5"/></svg>${strength ? '<div class="usa-fld-meter" aria-hidden="true"><i></i><i></i><i></i><i></i></div>' : ''}<p class="usa-fld-msg" id="${id}-msg" aria-live="polite">${esc$f(this.str('hint'))}</p></div>`);
                const input = this.input;
                input.value = keep;
                this.listen(input, 'input', () => {
                    if (this.hasAttribute('data-invalid'))
                        this.validate();
                    this.sync();
                });
                this.listen(input, 'focus', () => this.setAttribute('data-focus', ''));
                this.listen(input, 'blur', () => {
                    this.removeAttribute('data-focus');
                    if (input.value || input.required)
                        this.validate();
                });
                // form submit / reportValidity(): show our message instead of the browser bubble
                this.listen(input, 'invalid', (e) => {
                    e.preventDefault();
                    if (!this._checking)
                        this.validate();
                });
                this.sync();
            }
            sync() {
                const input = this.input;
                if (!input)
                    return;
                this.setFlag('data-filled', !!input.value);
                const meter = this.querySelector('.usa-fld-meter');
                if (meter) {
                    const { score, label } = passwordStrength(input.value);
                    meter.setAttribute('data-score', String(score));
                    if (!this.hasAttribute('data-invalid')) {
                        const msg = this.querySelector('.usa-fld-msg');
                        msg.textContent = input.value ? `Strength: ${label}` : this.str('hint');
                    }
                }
            }
            /** Runs native validation; animates and emits `usa:valid` / `usa:invalid`. */
            validate() {
                const input = this.input;
                if (!input)
                    return false;
                this._checking = true;
                const ok = input.checkValidity();
                this._checking = false;
                const msg = this.querySelector('.usa-fld-msg');
                const was = this.hasAttribute('data-invalid');
                this.setFlag('data-invalid', !ok);
                this.setFlag('data-valid', ok && !!input.value);
                input.setAttribute('aria-invalid', String(!ok));
                if (!ok) {
                    msg.textContent = this.str('error') || input.validationMessage || 'Please check this field';
                    if (!was && !this.reduced) {
                        this.motion(this.querySelector('.usa-fld'), [{ transform: 'none' }, { transform: 'translateX(-8px)' }, { transform: 'translateX(7px)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(3px)' }, { transform: 'none' }], { duration: 420, easing: 'ease-out' });
                        this.motion(msg, [{ opacity: 0, transform: 'translateY(-4px)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: 'ease-out' });
                    }
                    this.emit('invalid', { value: input.value, message: msg.textContent });
                }
                else {
                    msg.textContent = this.str('hint');
                    this.sync();
                    if (input.value)
                        this.emit('valid', { value: input.value });
                }
                return ok;
            }
        }
        return UsaField;
    }, { id: 'field', text: css$Q });
}

var css$P = "usa-otp{display:inline-block;max-width:100%;--usa-otp-accent:#6366f1;--usa-otp-size:44px}.usa-otp{display:flex;gap:var(--usa-otp-gap,8px)}.usa-otp-box{box-sizing:border-box;width:var(--usa-otp-size);height:calc(var(--usa-otp-size)*1.18);min-width:0;flex:0 1 auto;padding:0;text-align:center;font:700 calc(var(--usa-otp-size)*.48)/1 ui-monospace,SFMono-Regular,Menlo,monospace;color:inherit;background:var(--usa-otp-bg,rgba(148,163,184,.12));border:2px solid var(--usa-otp-rule,rgba(100,116,139,.35));border-radius:10px;outline:none;caret-color:var(--usa-otp-accent);transition:border-color .2s,box-shadow .2s,background .2s}.usa-otp-box:focus{border-color:var(--usa-otp-accent);box-shadow:0 0 0 4px color-mix(in srgb,var(--usa-otp-accent) 22%,transparent)}.usa-otp-box[data-filled]{border-color:color-mix(in srgb,var(--usa-otp-accent) 60%,transparent)}usa-otp[data-state=error] .usa-otp-box{border-color:#e11d48;background:rgba(225,29,72,.08)}usa-otp[data-state=success] .usa-otp-box{border-color:#16a34a;background:rgba(22,163,74,.1);color:#15803d}@media (prefers-reduced-motion:reduce){.usa-otp-box{transition:none}}";

/** Keep only the characters an OTP accepts (7.7). */
function sanitizeCode(s, mode = 'numeric') {
    return (mode === 'alnum' ? s.replace(/[^0-9a-z]/gi, '').toUpperCase() : s.replace(/\D/g, ''));
}
function defineOtp(tag = 'usa-otp') {
    return base.defineElement(tag, (Base) => {
        class UsaOtp extends Base {
            static get observedAttributes() {
                return ['length', 'mode', 'label'];
            }
            boxes() {
                return Array.from(this.querySelectorAll('.usa-otp-box'));
            }
            get value() {
                return this.boxes()
                    .map((b) => b.value)
                    .join('');
            }
            get mode() {
                return this.str('mode') === 'alnum' ? 'alnum' : 'numeric';
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const n = Math.max(3, Math.min(10, Math.round(this.num('length', 6))));
                const label = this.str('label', 'Verification code');
                const im = this.mode === 'alnum' ? 'text' : 'numeric';
                let html = `<div class="usa-otp" role="group" aria-label="${label.replace(/"/g, '&quot;')}" data-usa-part>`;
                for (let i = 0; i < n; i++)
                    html += `<input class="usa-otp-box" maxlength="1" inputmode="${im}" aria-label="Digit ${i + 1} of ${n}"${i === 0 ? ' autocomplete="one-time-code"' : ' autocomplete="off"'}>`;
                html += '</div>';
                this.insertAdjacentHTML('beforeend', html);
                const boxes = this.boxes();
                boxes.forEach((b, i) => {
                    this.listen(b, 'input', () => {
                        const v = sanitizeCode(b.value, this.mode);
                        if (v.length > 1)
                            return this.fill(v, i);
                        b.value = v;
                        if (v) {
                            this.pop(b);
                            boxes[i + 1]?.focus();
                        }
                        this.check();
                    });
                    this.listen(b, 'keydown', (e) => {
                        if (e.key === 'Backspace' && !b.value && i > 0) {
                            e.preventDefault();
                            boxes[i - 1].value = '';
                            boxes[i - 1].focus();
                            this.check();
                        }
                        else if (e.key === 'ArrowLeft' && i > 0)
                            boxes[i - 1].focus();
                        else if (e.key === 'ArrowRight' && i < boxes.length - 1)
                            boxes[i + 1].focus();
                    });
                    this.listen(b, 'paste', (e) => {
                        const t = e.clipboardData?.getData('text') || '';
                        if (!t)
                            return;
                        e.preventDefault();
                        this.fill(sanitizeCode(t, this.mode), i);
                    });
                    this.listen(b, 'focus', () => b.select?.());
                });
                const init = sanitizeCode(this.str('value'), this.mode);
                if (init)
                    this.fill(init, 0, false);
            }
            /** Types `code` into the boxes (no focus move), e.g. from an SMS autofill or a demo. */
            fillCode(code) {
                this.boxes().forEach((b) => (b.value = ''));
                this.fill(sanitizeCode(code, this.mode), 0, false);
            }
            fill(code, from = 0, focus = true) {
                const boxes = this.boxes();
                const chars = code.split('');
                let last = from;
                for (let i = from; i < boxes.length && chars.length; i++) {
                    boxes[i].value = chars.shift();
                    this.pop(boxes[i], (i - from) * 40);
                    last = i;
                }
                if (focus)
                    boxes[Math.min(boxes.length - 1, last + 1)]?.focus();
                this.check();
            }
            pop(b, delay = 0) {
                if (!this.reduced)
                    this.motion(b, [{ transform: 'scale(.7)' }, { transform: 'scale(1.12)' }, { transform: 'none' }], { duration: 240, delay, easing: 'ease-out' });
            }
            check() {
                this.removeAttribute('data-state');
                const boxes = this.boxes();
                boxes.forEach((b) => b.toggleAttribute('data-filled', !!b.value));
                if (boxes.every((b) => b.value))
                    this.emit('complete', { code: this.value });
            }
            clear() {
                const boxes = this.boxes();
                boxes.forEach((b) => {
                    b.value = '';
                    b.removeAttribute('data-filled');
                });
            }
            error(message = 'Wrong code') {
                this.setAttribute('data-state', 'error');
                const row = this.querySelector('.usa-otp');
                row?.setAttribute('aria-description', message);
                const done = () => {
                    if (this.getAttribute('data-state') === 'error') {
                        this.clear();
                        this.setAttribute('data-state', 'error');
                    }
                };
                const a = this.reduced || !row ? null : this.motion(row, [{ transform: 'none' }, { transform: 'translateX(-10px)' }, { transform: 'translateX(9px)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(4px)' }, { transform: 'none' }], { duration: 450, easing: 'ease-out' });
                if (a)
                    a.finished.then(done, () => undefined);
                else
                    done();
            }
            success() {
                this.setAttribute('data-state', 'success');
                if (this.reduced)
                    return;
                this.boxes().forEach((b, i) => this.motion(b, [{ transform: 'none' }, { transform: 'translateY(-8px)' }, { transform: 'none' }], { duration: 360, delay: i * 55, easing: 'ease-out' }));
            }
        }
        return UsaOtp;
    }, { id: 'otp', text: css$P });
}

var css$O = "usa-upload-progress{display:block;width:var(--usa-up-w,300px);max-width:100%;font:500 13px/1.3 system-ui,sans-serif;--usa-up-accent:#6366f1}.usa-up{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;background:var(--usa-up-bg,rgba(148,163,184,.1));border:1px solid rgba(100,116,139,.18)}.usa-up-icon{flex:none;display:grid;place-items:center;width:34px;height:40px;border-radius:6px;background:var(--usa-up-accent);color:#fff;font:800 9px/1 system-ui,sans-serif;letter-spacing:.04em}.usa-up-main{flex:1;min-width:0}.usa-up-top,.usa-up-sub{display:flex;align-items:center;gap:8px}.usa-up-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:650}.usa-up-pct{font-variant-numeric:tabular-nums;font-weight:700;color:var(--usa-up-accent)}.usa-up-track{position:relative;height:6px;margin:6px 0 4px;border-radius:3px;background:rgba(100,116,139,.2);overflow:hidden}.usa-up-fill{position:absolute;inset:0;border-radius:inherit;background:var(--usa-up-accent);transform-origin:0 50%;transform:scaleX(0);overflow:hidden}usa-upload-progress[data-state=uploading] .usa-up-fill::after{content:\"\";position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.55),transparent);transform:translateX(-100%);animation:usa-up-shine 1.2s linear infinite}@keyframes usa-up-shine{to{transform:translateX(100%)}}.usa-up-sub{font-size:11.5px;color:var(--usa-up-muted,#64748b)}.usa-up-msg{flex:1;color:#e11d48}.usa-up-retry{display:none;border:0;background:none;padding:0;font:inherit;font-weight:700;color:var(--usa-up-accent);cursor:pointer}usa-upload-progress[data-state=error] .usa-up-retry{display:inline}usa-upload-progress[data-state=error] .usa-up-fill{background:#e11d48}usa-upload-progress[data-state=error] .usa-up-icon{background:#e11d48}usa-upload-progress[data-state=done] .usa-up-fill{background:#16a34a}.usa-up-ok{flex:none;width:0;height:24px;fill:none;stroke:#16a34a;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round;transition:width .25s}.usa-up-ok circle{opacity:.25}.usa-up-ok path{stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset .4s .15s ease-out}usa-upload-progress[data-state=done] .usa-up-ok{width:24px}usa-upload-progress[data-state=done] .usa-up-ok path{stroke-dashoffset:0}@media (prefers-reduced-motion:reduce){.usa-up-fill::after{animation:none!important;display:none}.usa-up-ok,.usa-up-ok path{transition:none}}";

/** 1536 → "1.5 KB", 2_400_000 → "2.3 MB" (7.7). */
function formatBytes(n) {
    if (!Number.isFinite(n) || n < 0)
        return '';
    const u = ['B', 'KB', 'MB', 'GB', 'TB'];
    let i = 0;
    while (n >= 1024 && i < u.length - 1) {
        n /= 1024;
        i++;
    }
    return `${i === 0 ? Math.round(n) : n < 10 ? n.toFixed(1) : Math.round(n)} ${u[i]}`;
}
const esc$e = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
function defineUploadProgress(tag = 'usa-upload-progress') {
    return base.defineElement(tag, (Base) => {
        class UsaUploadProgress extends Base {
            constructor() {
                super(...arguments);
                this._shown = 0;
            }
            static get observedAttributes() {
                return ['name', 'size', 'value', 'status', 'message'];
            }
            get value() {
                return base.clamp(this.num('value', 0), 0, 100);
            }
            set value(v) {
                this.setAttribute('value', String(base.clamp(Number(v) || 0, 0, 100)));
            }
            get status() {
                const s = this.str('status');
                return s === 'error' ? 'error' : s === 'done' || this.value >= 100 ? 'done' : 'uploading';
            }
            set status(s) {
                this.setAttribute('status', s);
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const name = this.str('name', 'file');
                const size = formatBytes(this.num('size', NaN));
                this.insertAdjacentHTML('beforeend', `<div class="usa-up" data-usa-part><span class="usa-up-icon" aria-hidden="true">${esc$e((name.split('.').pop() || '').slice(0, 4).toUpperCase())}</span><div class="usa-up-main"><div class="usa-up-top"><span class="usa-up-name">${esc$e(name)}</span><span class="usa-up-pct"></span></div><div class="usa-up-track" role="progressbar" aria-label="Uploading ${esc$e(name)}" aria-valuemin="0" aria-valuemax="100"><span class="usa-up-fill"></span></div><div class="usa-up-sub"><span class="usa-up-size">${esc$e(size)}</span><span class="usa-up-msg" aria-live="polite"></span><button type="button" class="usa-up-retry">Retry</button></div></div><svg class="usa-up-ok" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path pathLength="1" d="M7 12.5l3.2 3.2L17 9"/></svg></div>`);
                this.listen(this.querySelector('.usa-up-retry'), 'click', () => this.emit('retry', { name }));
                this._shown = 0;
                this.render(true);
            }
            changed(name) {
                if (name === 'name' || name === 'size')
                    return super.changed(name);
                this.render(false);
            }
            render(first) {
                const fill = this.querySelector('.usa-up-fill');
                if (!fill)
                    return;
                const v = this.value;
                const st = this.status;
                const prevState = this.getAttribute('data-state');
                this.setAttribute('data-state', st);
                const track = this.querySelector('.usa-up-track');
                track.setAttribute('aria-valuenow', String(Math.round(v)));
                track.setAttribute('aria-valuetext', st === 'done' ? 'Complete' : st === 'error' ? 'Failed' : `${Math.round(v)}%`);
                this.querySelector('.usa-up-pct').textContent = st === 'done' ? 'Done' : st === 'error' ? '' : `${Math.round(v)}%`;
                this.querySelector('.usa-up-msg').textContent = st === 'error' ? this.str('message', 'Upload failed') : '';
                const from = this._shown;
                const to = st === 'done' ? 100 : v;
                fill.style.transform = `scaleX(${to / 100})`;
                if (!first && !this.reduced && from !== to)
                    this.motion(fill, [{ transform: `scaleX(${from / 100})` }, { transform: `scaleX(${to / 100})` }], { duration: 380, easing: 'cubic-bezier(.2,.8,.2,1)' });
                this._shown = to;
                if (prevState === st)
                    return;
                if (st === 'done' && !first)
                    this.emit('done', { name: this.str('name') });
                if (st === 'error' && !first) {
                    if (!this.reduced)
                        this.motion(this.querySelector('.usa-up'), [{ transform: 'none' }, { transform: 'translateX(-7px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(-3px)' }, { transform: 'none' }], { duration: 380, easing: 'ease-out' });
                    this.emit('error', { name: this.str('name'), message: this.str('message', 'Upload failed') });
                }
            }
        }
        return UsaUploadProgress;
    }, { id: 'upload-progress', text: css$O });
}

var css$N = "usa-chat-composer{display:block;width:var(--usa-cc-w,100%);max-width:100%;font:500 14px/1.45 system-ui,sans-serif;--usa-cc-accent:#6366f1}.usa-cc{position:relative;display:flex;align-items:flex-end;gap:8px;padding:8px 8px 8px 14px;border-radius:22px;background:var(--usa-cc-bg,#fff);color:var(--usa-cc-fg,#0f172a);border:1px solid rgba(100,116,139,.28);box-shadow:0 6px 20px -12px rgba(15,23,42,.4)}.usa-cc-glow{position:absolute;inset:-2px;border-radius:24px;padding:2px;background:conic-gradient(from var(--usa-cc-a,0deg),#6366f1,#ec4899,#f59e0b,#22d3ee,#6366f1);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;opacity:0;transition:opacity .3s;pointer-events:none}@property --usa-cc-a{syntax:\"<angle>\";inherits:false;initial-value:0deg}usa-chat-composer[data-busy] .usa-cc-glow{opacity:1;animation:usa-cc-spin 2.4s linear infinite}@keyframes usa-cc-spin{to{--usa-cc-a:360deg}}.usa-cc-input{flex:1;min-width:0;resize:none;border:0;outline:none;background:transparent;color:inherit;font:inherit;padding:6px 0;max-height:12em;overflow-y:auto}.usa-cc-send{flex:none;display:grid;place-items:center;width:34px;height:34px;border-radius:50%;border:0;background:rgba(100,116,139,.25);color:#fff;cursor:pointer;transition:background .2s}usa-chat-composer[data-ready] .usa-cc-send{background:var(--usa-cc-accent)}.usa-cc-send:focus-visible{outline:2px solid var(--usa-cc-accent);outline-offset:2px}.usa-cc-send svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}.usa-cc-arrow{transition:transform .25s,opacity .2s;transform-origin:center}.usa-cc-stop{fill:currentColor;stroke:none;opacity:0;transform:scale(.4);transform-origin:12px 12px;transition:transform .25s,opacity .2s}usa-chat-composer[data-busy] .usa-cc-arrow{opacity:0;transform:scale(.4)}usa-chat-composer[data-busy] .usa-cc-stop{opacity:1;transform:none}@media (prefers-reduced-motion:reduce){usa-chat-composer[data-busy] .usa-cc-glow{animation:none}.usa-cc-arrow,.usa-cc-stop,.usa-cc-glow{transition:none}}";

const esc$d = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
function defineChatComposer(tag = 'usa-chat-composer') {
    return base.defineElement(tag, (Base) => {
        class UsaChatComposer extends Base {
            static get observedAttributes() {
                return ['placeholder', 'label', 'rows', 'busy'];
            }
            get area() {
                return this.querySelector('.usa-cc-input');
            }
            get value() {
                return this.area?.value ?? '';
            }
            set value(v) {
                const a = this.area;
                if (!a)
                    return;
                a.value = v;
                this.sync();
            }
            get busy() {
                return this.flag('busy');
            }
            set busy(on) {
                this.setFlag('busy', on);
            }
            mount() {
                const keep = this.area?.value ?? this.str('value');
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const label = this.str('label', 'Message');
                this.insertAdjacentHTML('beforeend', `<div class="usa-cc" data-usa-part><span class="usa-cc-glow" aria-hidden="true"></span><textarea class="usa-cc-input" rows="1" aria-label="${esc$d(label)}" placeholder="${esc$d(this.str('placeholder', 'Ask anything…'))}"></textarea><button type="button" class="usa-cc-send" aria-label="Send"><svg viewBox="0 0 24 24" aria-hidden="true"><path class="usa-cc-arrow" d="M12 19V5M5.5 11.5L12 5l6.5 6.5"/><rect class="usa-cc-stop" x="7" y="7" width="10" height="10" rx="2"/></svg></button></div>`);
                const a = this.area;
                a.value = keep;
                this.listen(a, 'input', () => this.sync());
                this.listen(a, 'keydown', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
                        e.preventDefault();
                        if (!this.busy)
                            this.send();
                    }
                });
                this.listen(this.querySelector('.usa-cc-send'), 'click', () => {
                    if (this.busy) {
                        this.emit('stop');
                        this.busy = false;
                    }
                    else
                        this.send();
                });
                this.sync(true);
                this.state();
            }
            changed(name) {
                if (name === 'busy')
                    return this.state();
                super.changed(name);
            }
            state() {
                const b = this.querySelector('.usa-cc-send');
                if (!b)
                    return;
                b.setAttribute('aria-label', this.busy ? 'Stop generating' : 'Send');
                this.setFlag('data-busy', this.busy);
                this.sync(true);
            }
            sync(quiet = false) {
                const a = this.area;
                if (!a)
                    return;
                const max = Math.max(1, Math.round(this.num('rows', 6)));
                a.style.height = 'auto';
                const lh = parseFloat(getComputedStyle(a).lineHeight) || 20;
                const h = a.scrollHeight;
                if (h > 0)
                    a.style.height = `${Math.min(h, lh * max + 16)}px`;
                const had = this.hasAttribute('data-ready');
                const ready = !!a.value.trim() || this.busy;
                this.setFlag('data-ready', ready);
                if (ready && !had && !quiet && !this.reduced)
                    this.motion(this.querySelector('.usa-cc-send'), [{ transform: 'scale(.6)' }, { transform: 'scale(1.15)' }, { transform: 'none' }], { duration: 260, easing: 'ease-out' });
            }
            /** Emits `usa:send` with the trimmed text and clears it (unless prevented). */
            send() {
                const text = this.value.trim();
                if (!text)
                    return false;
                if (!this.emit('send', { text }))
                    return false;
                this.clear();
                return true;
            }
            clear() {
                this.value = '';
            }
        }
        return UsaChatComposer;
    }, { id: 'chat-composer', text: css$N });
}

var css$M = "usa-suggestion-chips{display:block;max-width:100%;font:500 13px/1.2 system-ui,sans-serif;--usa-sc-accent:#6366f1}.usa-sc{display:flex;flex-wrap:wrap;gap:8px}.usa-sc>span{display:contents}.usa-sc-chip{padding:8px 13px;border-radius:999px;border:1px solid color-mix(in srgb,var(--usa-sc-accent) 35%,transparent);background:color-mix(in srgb,var(--usa-sc-accent) 8%,var(--usa-sc-bg,#fff));color:inherit;font:inherit;cursor:pointer;transition:background .2s,border-color .2s,opacity .3s,transform .3s}.usa-sc-chip:hover,.usa-sc-chip:focus-visible{background:color-mix(in srgb,var(--usa-sc-accent) 16%,var(--usa-sc-bg,#fff));outline:none;border-color:var(--usa-sc-accent)}.usa-sc-chip[data-picked]{background:var(--usa-sc-accent);border-color:var(--usa-sc-accent);color:#fff}.usa-sc-chip[data-gone]{opacity:0;transform:scale(.85);pointer-events:none}@media (prefers-reduced-motion:reduce){.usa-sc-chip{transition:none}}";

/** "a | b|c" → ["a", "b", "c"] (7.8). */
function parseChips(s) {
    return s
        .split(/\||\n/)
        .map((t) => t.trim())
        .filter(Boolean);
}
const esc$c = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
function defineSuggestionChips(tag = 'usa-suggestion-chips') {
    return base.defineElement(tag, (Base) => {
        class UsaSuggestionChips extends Base {
            constructor() {
                super(...arguments);
                this._items = null;
                this._entered = false;
            }
            static get observedAttributes() {
                return ['items', 'label', 'dismiss'];
            }
            get items() {
                if (this._items)
                    return this._items.slice();
                const attr = this.str('items');
                if (attr)
                    return parseChips(attr);
                const kids = Array.from(this.children).filter((c) => !c.hasAttribute('data-usa-part'));
                return kids.length ? kids.map((c) => (c.textContent || '').trim()).filter(Boolean) : parseChips(this.getAttribute('data-text') || '');
            }
            set items(v) {
                this.setItems(v);
            }
            setItems(items) {
                this._items = items.map(String).filter((t) => t.trim());
                this.mount();
            }
            mount() {
                const items = this.items;
                if (!this._items && !this.str('items')) {
                    // keep authored content as the source of truth, hidden
                    Array.from(this.children).forEach((c) => !c.hasAttribute('data-usa-part') && c.setAttribute('hidden', ''));
                }
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this.insertAdjacentHTML('beforeend', `<div class="usa-sc" role="list" aria-label="${esc$c(this.str('label', 'Suggestions'))}" data-usa-part>${items.map((t, i) => `<span role="listitem"><button type="button" class="usa-sc-chip" data-i="${i}">${esc$c(t)}</button></span>`).join('')}</div>`);
                const chips = Array.from(this.querySelectorAll('.usa-sc-chip'));
                chips.forEach((c, i) => {
                    this.listen(c, 'click', () => this.pick(i));
                    this.listen(c, 'keydown', (e) => {
                        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
                        if (!d)
                            return;
                        e.preventDefault();
                        chips[(i + d + chips.length) % chips.length].focus();
                    });
                });
                this.inView((v) => v && this.enter(), { threshold: 0.2 });
            }
            enter() {
                if (this._entered && !this._items)
                    return;
                this._entered = true;
                if (this.reduced)
                    return;
                this.querySelectorAll('.usa-sc-chip').forEach((c, i) => this.motion(c, [{ opacity: 0, transform: 'translateY(10px) scale(.92)' }, { opacity: 1, transform: 'none' }], { duration: 380, delay: i * 70, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' }));
            }
            pick(i) {
                const chips = Array.from(this.querySelectorAll('.usa-sc-chip'));
                const c = chips[i];
                if (!c)
                    return;
                chips.forEach((x) => x.toggleAttribute('data-picked', x === c));
                if (!this.reduced)
                    this.motion(c, [{ transform: 'none' }, { transform: 'scale(1.1)' }, { transform: 'none' }], { duration: 280, easing: 'ease-out' });
                if (this.flag('dismiss'))
                    chips.forEach((x) => {
                        if (x === c)
                            return;
                        x.setAttribute('data-gone', '');
                        x.disabled = true;
                    });
                this.emit('pick', { text: c.textContent, index: i });
            }
        }
        return UsaSuggestionChips;
    }, { id: 'suggestion-chips', text: css$M });
}

var css$L = "usa-voice-button{display:inline-block;--usa-vb-accent:#6366f1;--usa-vb-size:52px}.usa-vb{display:flex;align-items:center;gap:12px}.usa-vb-btn{position:relative;display:grid;place-items:center;width:var(--usa-vb-size);height:var(--usa-vb-size);border-radius:50%;border:0;background:var(--usa-vb-idle,#e2e8f0);color:#334155;cursor:pointer;transition:background .2s,color .2s}.usa-vb-btn:focus-visible{outline:2px solid var(--usa-vb-accent);outline-offset:3px}.usa-vb-btn svg{position:relative;width:46%;height:46%;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}.usa-vb-btn svg rect{fill:currentColor;stroke:none}.usa-vb-halo{position:absolute;inset:0;border-radius:50%;background:var(--usa-vb-accent);opacity:0;transition:transform .12s linear}usa-voice-button[listening] .usa-vb-btn{background:var(--usa-vb-accent);color:#fff}usa-voice-button[listening] .usa-vb-halo{opacity:.25;animation:usa-vb-breathe 1.6s ease-in-out infinite}usa-voice-button[data-live] .usa-vb-halo{animation:none}@keyframes usa-vb-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.35)}}.usa-vb-bars{display:flex;align-items:center;gap:3px;height:calc(var(--usa-vb-size)*.6);opacity:.25;transition:opacity .2s}.usa-vb-bars i{display:block;width:4px;height:100%;border-radius:2px;background:var(--usa-vb-accent);transform:scaleY(.15);transition:transform .1s linear}usa-voice-button[listening] .usa-vb-bars{opacity:1}usa-voice-button[listening]:not([data-live]) .usa-vb-bars i{animation:usa-vb-wave 1s ease-in-out infinite}.usa-vb-bars i:nth-child(2){animation-delay:-.15s!important}.usa-vb-bars i:nth-child(3){animation-delay:-.3s!important}.usa-vb-bars i:nth-child(4){animation-delay:-.45s!important}.usa-vb-bars i:nth-child(5){animation-delay:-.6s!important}.usa-vb-bars i:nth-child(6){animation-delay:-.75s!important}.usa-vb-bars i:nth-child(7){animation-delay:-.9s!important}@keyframes usa-vb-wave{0%,100%{transform:scaleY(.2)}50%{transform:scaleY(.9)}}@media (prefers-reduced-motion:reduce){usa-voice-button[listening] .usa-vb-halo,usa-voice-button[listening] .usa-vb-bars i{animation:none!important}.usa-vb-bars i{transition:none}}";

/** Bar heights (0–1) for a level and a phase, centre bars tallest (7.8). */
function waveBars(level, n = 5, phase = 0) {
    const l = base.clamp(level, 0, 1);
    return Array.from({ length: n }, (_, i) => {
        const mid = 1 - Math.abs(i - (n - 1) / 2) / ((n - 1) / 2 || 1);
        const wob = 0.5 + 0.5 * Math.sin(phase + i * 1.3);
        return Math.round(base.clamp(0.15 + l * (0.45 + 0.4 * mid) * (0.6 + 0.4 * wob), 0.1, 1) * 100) / 100;
    });
}
function defineVoiceButton(tag = 'usa-voice-button') {
    return base.defineElement(tag, (Base) => {
        class UsaVoiceButton extends Base {
            constructor() {
                super(...arguments);
                this._level = -1;
            }
            static get observedAttributes() {
                return ['label', 'bars', 'listening'];
            }
            get listening() {
                return this.flag('listening');
            }
            set listening(on) {
                this.setFlag('listening', on);
            }
            get level() {
                return Math.max(0, this._level);
            }
            set level(v) {
                this._level = base.clamp(Number(v) || 0, 0, 1);
                this.paint();
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const n = Math.max(3, Math.min(9, Math.round(this.num('bars', 5))));
                this.insertAdjacentHTML('beforeend', `<div class="usa-vb" data-usa-part><button type="button" class="usa-vb-btn" aria-pressed="false" aria-label="${this.str('label', 'Voice input').replace(/"/g, '&quot;')}"><span class="usa-vb-halo" aria-hidden="true"></span><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg></button><span class="usa-vb-bars" aria-hidden="true">${'<i></i>'.repeat(n)}</span></div>`);
                this.listen(this.querySelector('.usa-vb-btn'), 'click', () => this.toggle());
                this.sync(true);
            }
            changed(name) {
                if (name === 'listening')
                    return this.sync(false);
                super.changed(name);
            }
            toggle(force) {
                this.listening = force ?? !this.listening;
            }
            sync(first) {
                const btn = this.querySelector('.usa-vb-btn');
                if (!btn)
                    return;
                btn.setAttribute('aria-pressed', String(this.listening));
                if (!first)
                    this.emit(this.listening ? 'start' : 'stop');
                if (!this.listening)
                    this._level = -1;
                this.paint();
            }
            paint() {
                const bars = Array.from(this.querySelectorAll('.usa-vb-bars i'));
                const live = this.listening && this._level >= 0;
                this.setFlag('data-live', live);
                const hs = waveBars(live ? this._level : 0, bars.length, (typeof performance !== 'undefined' ? performance.now() : 0) / 120);
                bars.forEach((b, i) => (b.style.transform = live ? `scaleY(${hs[i]})` : ''));
                const halo = this.querySelector('.usa-vb-halo');
                if (halo)
                    halo.style.transform = live ? `scale(${1 + this._level * 0.6})` : '';
            }
        }
        return UsaVoiceButton;
    }, { id: 'voice-button', text: css$L });
}

var css$K = "usa-command-palette{display:contents;--usa-cp-accent:#6366f1}usa-command-palette>option{display:none}.usa-cp{width:min(560px,calc(100vw - 24px));max-width:none;padding:0;margin:12vh auto auto;border:0;border-radius:16px;background:transparent;color:inherit;overflow:visible}.usa-cp::backdrop{background:rgba(15,23,42,.35);backdrop-filter:blur(3px)}.usa-cp-box{border-radius:16px;background:var(--usa-cp-bg,#fff);color:var(--usa-cp-fg,#0f172a);box-shadow:0 24px 60px -20px rgba(15,23,42,.55);border:1px solid rgba(100,116,139,.2);overflow:hidden;font:500 14px/1.3 system-ui,sans-serif}.usa-cp-q{box-sizing:border-box;width:100%;padding:16px 18px;border:0;border-bottom:1px solid rgba(100,116,139,.18);background:transparent;color:inherit;font:inherit;font-size:16px;outline:none}.usa-cp-list{position:relative;max-height:min(340px,50vh);overflow-y:auto;padding:6px}.usa-cp-hl{position:absolute;left:6px;right:6px;top:0;border-radius:10px;background:color-mix(in srgb,var(--usa-cp-accent) 12%,transparent);pointer-events:none;opacity:0}.usa-cp-group{padding:8px 10px 4px;font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;opacity:.55}.usa-cp-item{position:relative;display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:10px;cursor:pointer}.usa-cp-item[aria-selected=true] .usa-cp-label{color:var(--usa-cp-accent)}.usa-cp-label{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.usa-cp-label mark{background:none;color:var(--usa-cp-accent);font-weight:800}.usa-cp-keys{display:flex;gap:3px}.usa-cp-keys kbd,usa-shortcut kbd{display:inline-grid;place-items:center;min-width:1.6em;padding:2px 5px;border-radius:5px;border:1px solid rgba(100,116,139,.35);border-bottom-width:2px;background:var(--usa-kbd-bg,rgba(148,163,184,.12));font:600 11px/1.3 system-ui,sans-serif;color:inherit}.usa-cp-empty{margin:0;padding:18px;text-align:center;opacity:.6}usa-command-palette[inline]{display:block;width:var(--usa-cp-w,100%);max-width:100%}usa-command-palette[inline] .usa-cp{position:static;width:100%;margin:0}usa-command-palette[inline] .usa-cp-box{box-shadow:0 12px 30px -18px rgba(15,23,42,.45)}";

/**
 * Fuzzy match: every query letter in order. Returns a score (higher is
 * better; -1 = no match) and the matched indexes (7.9).
 */
function fuzzyMatch(query, text) {
    const q = query.trim().toLowerCase();
    const t = text.toLowerCase();
    if (!q)
        return { score: 0, hits: [] };
    const hits = [];
    let score = 0;
    let from = 0;
    let prev = -2;
    for (const ch of q) {
        if (ch === ' ')
            continue;
        const i = t.indexOf(ch, from);
        if (i < 0)
            return { score: -1, hits: [] };
        hits.push(i);
        score += i === prev + 1 ? 3 : 1; // consecutive letters
        if (i === 0 || /[\s\-_/]/.test(t[i - 1]))
            score += 2; // word starts
        prev = i;
        from = i + 1;
    }
    return { score: score - t.length / 100, hits };
}
/** "mod+shift+k" → ["⌘", "⇧", "K"] on Apple platforms, ["Ctrl", "Shift", "K"] elsewhere (7.9). */
function keyLabels(keys, apple = isApple()) {
    const map = { mod: ['⌘', 'Ctrl'], cmd: ['⌘', '⌘'], meta: ['⌘', 'Win'], ctrl: ['⌃', 'Ctrl'], shift: ['⇧', 'Shift'], alt: ['⌥', 'Alt'], option: ['⌥', 'Alt'], enter: ['↵', 'Enter'], esc: ['Esc', 'Esc'], escape: ['Esc', 'Esc'], up: ['↑', '↑'], down: ['↓', '↓'], left: ['←', '←'], right: ['→', '→'], space: ['Space', 'Space'], tab: ['⇥', 'Tab'], backspace: ['⌫', 'Backspace'] };
    return keys
        .split('+')
        .map((k) => k.trim())
        .filter(Boolean)
        .map((k) => (map[k.toLowerCase()] ? map[k.toLowerCase()][apple ? 0 : 1] : k.length === 1 ? k.toUpperCase() : k[0].toUpperCase() + k.slice(1)));
}
/** Does a KeyboardEvent match "mod+k"-style keys? (7.9) */
function matchesKeys(e, keys, apple = isApple()) {
    const parts = keys.toLowerCase().split('+').map((k) => k.trim()).filter(Boolean);
    const key = parts.filter((p) => !['mod', 'cmd', 'meta', 'ctrl', 'shift', 'alt', 'option'].includes(p))[0];
    if (!key)
        return false;
    const want = { meta: false, ctrl: false, shift: parts.includes('shift'), alt: parts.includes('alt') || parts.includes('option') };
    if (parts.includes('mod'))
        want[apple ? 'meta' : 'ctrl'] = true;
    if (parts.includes('cmd') || parts.includes('meta'))
        want.meta = true;
    if (parts.includes('ctrl'))
        want.ctrl = true;
    const names = { esc: 'escape', space: ' ', up: 'arrowup', down: 'arrowdown', left: 'arrowleft', right: 'arrowright' };
    const k = (e.key || '').toLowerCase();
    return k === (names[key] || key) && e.metaKey === want.meta && e.ctrlKey === want.ctrl && e.shiftKey === want.shift && e.altKey === want.alt;
}
function isApple() {
    return typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.userAgentData?.platform || navigator.platform || navigator.userAgent || '');
}
const esc$b = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
let uid$2 = 0;
function defineCommandPalette(tag = 'usa-command-palette') {
    return base.defineElement(tag, (Base) => {
        class UsaCommandPalette extends Base {
            constructor() {
                super(...arguments);
                this._cmds = null;
                this._id = `usa-cp-${++uid$2}`;
                this._active = 0;
                this._shown = [];
                this._opener = null;
            }
            static get observedAttributes() {
                return ['placeholder', 'label', 'hotkey', 'inline'];
            }
            get commands() {
                if (this._cmds)
                    return this._cmds.slice();
                return Array.from(this.querySelectorAll(':scope > option')).map((o) => ({ id: o.value || (o.textContent || '').trim(), label: (o.textContent || '').trim(), group: o.getAttribute('data-group') || undefined, keys: o.getAttribute('data-keys') || undefined }));
            }
            set commands(v) {
                this.setCommands(v);
            }
            setCommands(list) {
                this._cmds = list.map((c) => ({ ...c, id: String(c.id), label: String(c.label) }));
                this.render();
            }
            get dlg() {
                return this.querySelector('.usa-cp');
            }
            get opened() {
                return !!this.dlg?.hasAttribute('open');
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const id = this._id;
                this.insertAdjacentHTML('beforeend', `<dialog class="usa-cp" data-usa-part aria-label="${esc$b(this.str('label', 'Command palette'))}"><div class="usa-cp-box"><input class="usa-cp-q" role="combobox" aria-expanded="true" aria-controls="${id}-list" aria-autocomplete="list" autocomplete="off" spellcheck="false" placeholder="${esc$b(this.str('placeholder', 'Type a command or search…'))}"><div class="usa-cp-list" id="${id}-list" role="listbox"><span class="usa-cp-hl" aria-hidden="true"></span></div><p class="usa-cp-empty" hidden>No results</p></div></dialog>`);
                const dlg = this.dlg;
                const q = this.querySelector('.usa-cp-q');
                this.listen(q, 'input', () => this.render(true));
                this.listen(q, 'keydown', (e) => {
                    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                        e.preventDefault();
                        this.move(e.key === 'ArrowDown' ? 1 : -1);
                    }
                    else if (e.key === 'Enter') {
                        e.preventDefault();
                        this.run(this._active);
                    }
                    else if (e.key === 'Escape' && typeof dlg.showModal !== 'function')
                        this.close();
                });
                this.listen(dlg, 'click', (e) => {
                    if (e.target === dlg)
                        this.close();
                });
                this.listen(dlg, 'cancel', (e) => {
                    e.preventDefault();
                    this.close();
                });
                const hk = this.str('hotkey', 'mod+k');
                if (hk !== 'none')
                    this.listen(document, 'keydown', (e) => {
                        if (matchesKeys(e, hk)) {
                            e.preventDefault();
                            this.toggle();
                        }
                    });
                this.render();
                if (this.flag('inline'))
                    dlg.setAttribute('open', '');
            }
            render(typed = false) {
                const list = this.querySelector('.usa-cp-list');
                if (!list)
                    return;
                const q = this.querySelector('.usa-cp-q').value;
                const all = this.commands;
                const scored = all
                    .map((c, i) => ({ c, i, m: fuzzyMatch(q, c.label) }))
                    .filter((x) => x.m.score >= 0)
                    .sort((a, b) => (q ? b.m.score - a.m.score : 0) || a.i - b.i);
                this._shown = scored.map((x) => x.c);
                this._active = 0;
                list.querySelectorAll('.usa-cp-item, .usa-cp-group').forEach((n) => n.remove());
                let html = '';
                let group = '\u0000';
                scored.forEach(({ c, m }, i) => {
                    if (!q && c.group !== group) {
                        group = c.group;
                        if (group)
                            html += `<div class="usa-cp-group" role="presentation">${esc$b(group)}</div>`;
                    }
                    const label = Array.from(c.label)
                        .map((ch, j) => (m.hits.includes(j) ? `<mark>${esc$b(ch)}</mark>` : esc$b(ch)))
                        .join('');
                    const keys = c.keys ? `<span class="usa-cp-keys">${keyLabels(c.keys).map((k) => `<kbd>${esc$b(k)}</kbd>`).join('')}</span>` : '';
                    html += `<div class="usa-cp-item" role="option" id="${this._id}-o${i}" data-i="${i}" aria-selected="false"><span class="usa-cp-label">${label}</span>${keys}</div>`;
                });
                list.insertAdjacentHTML('beforeend', html);
                list.querySelectorAll('.usa-cp-item').forEach((el) => {
                    el.addEventListener('pointermove', () => this.select(Number(el.dataset.i)));
                    el.addEventListener('click', () => this.run(Number(el.dataset.i)));
                });
                this.querySelector('.usa-cp-empty').hidden = scored.length > 0;
                this.select(0, false);
                if (typed && !this.reduced)
                    list.querySelectorAll('.usa-cp-item').forEach((el, i) => i < 8 && this.motion(el, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 200, delay: i * 25, easing: 'ease-out', fill: 'backwards' }));
            }
            select(i, glide = true) {
                const items = Array.from(this.querySelectorAll('.usa-cp-item'));
                const q = this.querySelector('.usa-cp-q');
                const hl = this.querySelector('.usa-cp-hl');
                if (!items.length || !q || !hl) {
                    q?.removeAttribute('aria-activedescendant');
                    if (hl)
                        hl.style.opacity = '0';
                    return;
                }
                this._active = Math.max(0, Math.min(items.length - 1, i));
                items.forEach((el, j) => el.setAttribute('aria-selected', String(j === this._active)));
                const el = items[this._active];
                q.setAttribute('aria-activedescendant', el.id);
                const to = `translateY(${el.offsetTop}px)`;
                const from = hl.style.transform;
                hl.style.opacity = '1';
                hl.style.height = `${el.offsetHeight || 36}px`;
                hl.style.transform = to;
                if (glide && from && from !== to && !this.reduced)
                    this.motion(hl, [{ transform: from }, { transform: to }], { duration: 160, easing: 'cubic-bezier(.2,.8,.2,1)' });
                el.scrollIntoView?.({ block: 'nearest' });
            }
            move(d) {
                const n = this._shown.length;
                if (n)
                    this.select((this._active + d + n) % n);
            }
            run(i) {
                const c = this._shown[i];
                if (!c)
                    return;
                this.emit('run', { id: c.id, label: c.label });
                this.close();
            }
            show() {
                const dlg = this.dlg;
                if (dlg && this.flag('inline'))
                    return this.querySelector('.usa-cp-q').focus();
                if (!dlg || this.opened)
                    return;
                this._opener = document.activeElement;
                const q = this.querySelector('.usa-cp-q');
                q.value = '';
                this.render();
                if (typeof dlg.showModal === 'function') {
                    try {
                        dlg.showModal();
                    }
                    catch {
                        dlg.setAttribute('open', '');
                    }
                }
                else
                    dlg.setAttribute('open', '');
                this.select(0, false);
                q.focus();
                if (!this.reduced)
                    this.motion(this.querySelector('.usa-cp-box'), [{ opacity: 0, transform: 'translateY(-8px) scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: 'cubic-bezier(.2,.8,.2,1)' });
                this.emit('open');
            }
            close() {
                const dlg = this.dlg;
                if (dlg && this.flag('inline')) {
                    this.querySelector('.usa-cp-q').value = '';
                    return this.render();
                }
                if (!dlg || !this.opened)
                    return;
                const done = () => {
                    if (typeof dlg.close === 'function' && dlg.open)
                        dlg.close();
                    dlg.removeAttribute('open');
                    this._opener?.focus?.();
                    this.emit('close');
                };
                const a = this.reduced ? null : this.motion(this.querySelector('.usa-cp-box'), [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.97)' }], { duration: 140, easing: 'ease-in' });
                if (a)
                    a.finished.then(done, done);
                else
                    done();
            }
            toggle() {
                if (this.opened)
                    this.close();
                else
                    this.show();
            }
        }
        return UsaCommandPalette;
    }, { id: 'command-palette', text: css$K });
}

var css$J = "usa-shortcut{display:inline-block;font:500 13px/1.3 system-ui,sans-serif}.usa-sk{display:inline-flex;align-items:center;gap:8px}.usa-sk-caps{display:inline-flex;gap:4px}usa-shortcut kbd{display:inline-grid;place-items:center;min-width:1.9em;height:1.9em;padding:0 6px;box-sizing:border-box;border-radius:6px;border:1px solid rgba(100,116,139,.4);border-bottom-width:3px;background:var(--usa-kbd-bg,#fff);color:inherit;font:600 12px/1 system-ui,sans-serif;box-shadow:0 1px 0 rgba(15,23,42,.08)}usa-shortcut[data-pressed] kbd{background:var(--usa-kbd-on,#eef2ff);border-color:var(--usa-kbd-accent,#6366f1)}.usa-sk-label{opacity:.75}";

const SPOKEN = { '⌘': 'Command', '⇧': 'Shift', '⌥': 'Option', '⌃': 'Control', Ctrl: 'Control', '↵': 'Enter', '⇥': 'Tab', '⌫': 'Backspace' };
const esc$a = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
function defineShortcut(tag = 'usa-shortcut') {
    return base.defineElement(tag, (Base) => {
        class UsaShortcut extends Base {
            static get observedAttributes() {
                return ['keys', 'label', 'listen', 'for'];
            }
            get labels() {
                return keyLabels(this.str('keys', 'mod+k'));
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const labels = this.labels;
                const spoken = labels.map((l) => SPOKEN[l] || l).join(' ');
                const text = this.str('label');
                this.insertAdjacentHTML('beforeend', `<span class="usa-sk" data-usa-part><span class="usa-sk-caps" role="img" aria-label="${esc$a(spoken)}">${labels.map((l) => `<kbd aria-hidden="true">${esc$a(l)}</kbd>`).join('')}</span>${text ? `<span class="usa-sk-label">${esc$a(text)}</span>` : ''}</span>`);
                if (this.str('listen') !== 'false')
                    this.listen(document, 'keydown', (e) => {
                        if (!e.repeat && matchesKeys(e, this.str('keys', 'mod+k'))) {
                            this.press();
                            const id = this.str('for');
                            const target = id ? document.getElementById(id) : null;
                            if (target) {
                                e.preventDefault();
                                target.click();
                            }
                        }
                    });
            }
            /** Animate the caps as if pressed and emit `usa:trigger`. */
            press() {
                const caps = Array.from(this.querySelectorAll('kbd'));
                this.setAttribute('data-pressed', '');
                const off = () => this.removeAttribute('data-pressed');
                if (!this.reduced) {
                    const runs = caps.map((k, i) => this.motion(k, [{ transform: 'none' }, { transform: 'translateY(2px) scale(.94)', borderBottomWidth: '1px' }, { transform: 'none' }], { duration: 260, delay: i * 50, easing: 'ease-out' }));
                    const last = runs[runs.length - 1];
                    if (last)
                        last.finished.then(off, off);
                    else
                        off();
                }
                else
                    off();
                this.emit('trigger', { keys: this.str('keys', 'mod+k') });
            }
        }
        return UsaShortcut;
    }, { id: 'shortcut', text: css$J });
}

var css$I = "usa-clock-control{display:inline-block;font:600 12.5px/1 system-ui,sans-serif;--usa-clk-accent:#6366f1}.usa-clk{display:inline-flex;align-items:center;gap:8px;padding:5px;border-radius:999px;background:var(--usa-clk-bg,rgba(148,163,184,.14));border:1px solid rgba(100,116,139,.2)}.usa-clk-play{display:grid;place-items:center;width:32px;height:32px;border-radius:50%;border:0;background:var(--usa-clk-accent);color:#fff;cursor:pointer}.usa-clk-play:focus-visible,.usa-clk-speed:focus-visible{outline:2px solid var(--usa-clk-accent);outline-offset:2px}.usa-clk-play svg{width:15px;height:15px;fill:currentColor}.usa-clk-tri{opacity:0;transform-origin:center;transition:opacity .15s}usa-clock-control[data-paused] .usa-clk-tri{opacity:1}usa-clock-control[data-paused] .usa-clk-bar{opacity:0}.usa-clk-speeds{position:relative;display:flex}.usa-clk-ink{position:absolute;left:0;top:0;bottom:0;border-radius:999px;background:var(--usa-clk-ink,#fff);box-shadow:0 1px 4px rgba(15,23,42,.18);transition:transform .25s cubic-bezier(.2,.8,.2,1),width .25s;opacity:0}.usa-clk-speed{position:relative;padding:8px 10px;border:0;background:none;color:inherit;font:inherit;cursor:pointer;border-radius:999px;font-variant-numeric:tabular-nums}.usa-clk-speed[aria-checked=true]{color:var(--usa-clk-accent)}@media (prefers-reduced-motion:reduce){.usa-clk-ink{transition:none}}";

function defineClockControl(tag = 'usa-clock-control') {
    return base.defineElement(tag, (Base) => {
        class UsaClockControl extends Base {
            static get observedAttributes() {
                return ['speeds', 'label'];
            }
            get rate() {
                return base.getClock().rate;
            }
            get paused() {
                return base.getClock().paused;
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const speeds = this.str('speeds', '0.25,0.5,1,2')
                    .split(',')
                    .map(Number)
                    .filter((n) => Number.isFinite(n) && n > 0)
                    .slice(0, 6);
                const label = this.str('label', 'Motion clock').replace(/"/g, '&quot;');
                this.insertAdjacentHTML('beforeend', `<div class="usa-clk" role="group" aria-label="${label}" data-usa-part><button type="button" class="usa-clk-play" aria-pressed="false" aria-label="Pause animations"><svg viewBox="0 0 24 24" aria-hidden="true"><rect class="usa-clk-bar" x="6" y="5" width="4" height="14" rx="1"/><rect class="usa-clk-bar" x="14" y="5" width="4" height="14" rx="1"/><path class="usa-clk-tri" d="M7 5l12 7-12 7z"/></svg></button><div class="usa-clk-speeds" role="radiogroup" aria-label="Speed"><span class="usa-clk-ink" aria-hidden="true"></span>${speeds.map((s) => `<button type="button" role="radio" class="usa-clk-speed" data-rate="${s}" aria-checked="false">${s}×</button>`).join('')}</div></div>`);
                this.listen(this.querySelector('.usa-clk-play'), 'click', () => {
                    base.setClock({ paused: !base.getClock().paused });
                });
                this.querySelectorAll('.usa-clk-speed').forEach((b) => this.listen(b, 'click', () => base.setClock({ rate: Number(b.dataset.rate) })));
                this.onCleanup(base.onClockChange(() => this.sync(true)));
                this.sync(false);
            }
            sync(user) {
                const { rate, paused } = base.getClock();
                const play = this.querySelector('.usa-clk-play');
                if (!play)
                    return;
                play.setAttribute('aria-pressed', String(paused));
                play.setAttribute('aria-label', paused ? 'Resume animations' : 'Pause animations');
                this.setFlag('data-paused', paused);
                let on = null;
                this.querySelectorAll('.usa-clk-speed').forEach((b) => {
                    const hit = Math.abs(Number(b.dataset.rate) - rate) < 1e-6;
                    b.setAttribute('aria-checked', String(hit));
                    if (hit)
                        on = b;
                });
                const ink = this.querySelector('.usa-clk-ink');
                const target = on;
                if (target) {
                    ink.style.opacity = '1';
                    ink.style.width = `${target.offsetWidth}px`;
                    ink.style.transform = `translateX(${target.offsetLeft}px)`;
                }
                else
                    ink.style.opacity = '0';
                if (user)
                    this.emit('change', { rate, paused });
            }
        }
        return UsaClockControl;
    }, { id: 'clock-control', text: css$I });
}

var css$H = "usa-hydrate{display:block}";

function defineHydrate(tag = 'usa-hydrate') {
    return base.defineElement(tag, (Base) => {
        class UsaHydrate extends Base {
            constructor() {
                super(...arguments);
                this._tl = null;
            }
            static get observedAttributes() {
                return ['effect', 'stagger', 'duration'];
            }
            get timeline() {
                return this._tl;
            }
            mount() {
                this.replay();
            }
            unmount() {
                this._tl?.cancel();
                this._tl = null;
            }
            replay() {
                this._tl?.cancel();
                const kids = Array.from(this.children);
                const frames = components_engine.HYDRATE_PRESETS[this.str('effect', 'fade-up')] || components_engine.HYDRATE_PRESETS['fade-up'];
                const tl = components_engine.createTimeline({ duration: this.num('duration', 600), easing: 'cubic-bezier(.2,.8,.2,1)' });
                const stagger = this.num('stagger', 60);
                kids.forEach((k, i) => tl.add(k, frames, {}, i * stagger));
                this._tl = tl;
                tl.play();
                this.setAttribute('data-usa-hydrated', '');
                tl.finished.then(() => this.isConnected && this._tl === tl && this.emit('hydrated', { count: kids.length }));
            }
        }
        return UsaHydrate;
    }, { id: 'hydrate', text: css$H });
}

var css$G = "usa-red-envelope{display:inline-block;--usa-re-w:150px;--usa-re-red:#dc2626;--usa-re-gold:#facc15}.usa-re{position:relative;display:block;width:var(--usa-re-w);height:calc(var(--usa-re-w)*1.35);padding:0;border:0;background:none;cursor:pointer;perspective:600px;font:600 14px/1.2 system-ui,sans-serif}.usa-re:focus-visible{outline:2px solid var(--usa-re-gold);outline-offset:4px;border-radius:12px}.usa-re-body{position:absolute;inset:0;border-radius:12px;background:linear-gradient(160deg,#ef4444,var(--usa-re-red) 60%,#b91c1c);box-shadow:0 12px 24px -12px rgba(127,29,29,.7);display:flex;align-items:flex-end;justify-content:center;padding-bottom:18%;z-index:2}.usa-re-msg{color:var(--usa-re-gold);font-size:calc(var(--usa-re-w)*.13);letter-spacing:.1em}.usa-re-flap{position:absolute;left:0;right:0;top:0;height:42%;border-radius:12px 12px 50% 50%/12px 12px 40% 40%;background:linear-gradient(#f87171,#dc2626);transform-origin:50% 0;z-index:3;display:grid;place-items:end center;box-shadow:0 4px 8px rgba(127,29,29,.35);transition:transform .45s ease-in-out}usa-red-envelope[data-open] .usa-re-flap{transform:rotateX(180deg);z-index:0;opacity:.85}.usa-re-seal{display:grid;place-items:center;width:30%;aspect-ratio:1;margin-bottom:-15%;border-radius:50%;background:var(--usa-re-gold);color:var(--usa-re-red);font-size:calc(var(--usa-re-w)*.14);font-weight:900;box-shadow:0 2px 6px rgba(0,0,0,.25)}usa-red-envelope[data-open] .usa-re-seal{visibility:hidden}.usa-re-card{position:absolute;left:8%;right:8%;top:6%;height:70%;border-radius:8px;background:#fff7ed;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;z-index:1;transition:transform .5s cubic-bezier(.3,1.4,.5,1)}usa-red-envelope[data-open] .usa-re-card{transform:translateY(-46%);z-index:3;box-shadow:0 6px 14px -6px rgba(127,29,29,.5)}.usa-re-amt{color:var(--usa-re-red);font-size:calc(var(--usa-re-w)*.16);font-weight:900;font-variant-numeric:tabular-nums}.usa-re-from{font-size:11px;color:#92400e}.usa-re-coins{position:absolute;left:50%;top:40%;z-index:4}.usa-re-coins i{position:absolute;left:0;top:0;width:16px;height:16px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fef08a,var(--usa-re-gold) 60%,#ca8a04);box-shadow:0 1px 3px rgba(0,0,0,.3)}.usa-re-live{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}@media (prefers-reduced-motion:reduce){.usa-re-flap,.usa-re-card{transition:none}}";

const esc$9 = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
function defineRedEnvelope(tag = 'usa-red-envelope') {
    return base.defineElement(tag, (Base) => {
        class UsaRedEnvelope extends Base {
            static get observedAttributes() {
                return ['amount', 'currency', 'message', 'from'];
            }
            get opened() {
                return this.hasAttribute('data-open');
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const msg = this.str('message', '恭喜发财');
                this.insertAdjacentHTML('beforeend', `<button type="button" class="usa-re" aria-expanded="false" aria-label="${esc$9(`Open red envelope${this.str('from') ? ` from ${this.str('from')}` : ''}`)}" data-usa-part><span class="usa-re-card" aria-hidden="true"><span class="usa-re-amt"></span><span class="usa-re-from">${esc$9(this.str('from'))}</span></span><span class="usa-re-body"><span class="usa-re-msg">${esc$9(msg)}</span></span><span class="usa-re-flap"><span class="usa-re-seal">福</span></span><span class="usa-re-coins" aria-hidden="true"></span><span class="usa-re-live" aria-live="polite"></span></button>`);
                this.listen(this.querySelector('.usa-re'), 'click', () => (this.opened ? this.close() : this.open()));
                if (this.flag('opened'))
                    this.open(true);
            }
            open(quiet = false) {
                if (this.opened)
                    return;
                this.setAttribute('data-open', '');
                const btn = this.querySelector('.usa-re');
                btn.setAttribute('aria-expanded', 'true');
                const amount = this.num('amount', 8.88);
                const cur = this.str('currency', '¥');
                const amt = this.querySelector('.usa-re-amt');
                const fmt = (v) => `${cur}${v.toFixed(Number.isInteger(amount) ? 0 : 2)}`;
                amt.textContent = fmt(amount);
                this.querySelector('.usa-re-live').textContent = `${fmt(amount)}${this.str('from') ? ` from ${this.str('from')}` : ''}`;
                if (!quiet && !this.reduced) {
                    this.motion(this.querySelector('.usa-re-flap'), [{ transform: 'rotateX(0)' }, { transform: 'rotateX(180deg)' }], { duration: 450, easing: 'ease-in-out' });
                    this.motion(this.querySelector('.usa-re-card'), [{ transform: 'translateY(0)' }, { transform: 'translateY(-46%)' }], { duration: 520, delay: 300, easing: 'cubic-bezier(.3,1.4,.5,1)', fill: 'backwards' });
                    const t0 = performance.now();
                    const step = () => {
                        const k = Math.min(1, (performance.now() - t0 - 350) / 700);
                        amt.textContent = fmt(amount * Math.max(0, 1 - Math.pow(1 - Math.max(0, k), 3)));
                        if (k < 1 && this.isConnected)
                            requestAnimationFrame(step);
                    };
                    requestAnimationFrame(step);
                    const coins = this.querySelector('.usa-re-coins');
                    for (let i = 0; i < 7; i++) {
                        const c = document.createElement('i');
                        coins.appendChild(c);
                        const x = (i - 3) * 22;
                        const a = this.motion(c, [{ transform: 'translate(-50%,0) scale(.3)', opacity: 0 }, { transform: `translate(calc(-50% + ${x}px), -${70 + (i % 3) * 18}px) scale(1) rotateY(360deg)`, opacity: 1, offset: 0.5 }, { transform: `translate(calc(-50% + ${x * 1.3}px), 10px) scale(.8) rotateY(720deg)`, opacity: 0 }], { duration: 1100, delay: 450 + i * 40, easing: 'ease-out', fill: 'backwards' });
                        const rm = () => c.remove();
                        if (a)
                            a.finished.then(rm, rm);
                        else
                            rm();
                    }
                }
                this.emit('open', { amount });
            }
            close() {
                this.removeAttribute('data-open');
                this.querySelector('.usa-re')?.setAttribute('aria-expanded', 'false');
            }
        }
        return UsaRedEnvelope;
    }, { id: 'red-envelope', text: css$G });
}

var css$F = "usa-festival-banner{position:relative;display:block;overflow:hidden;padding:18px 44px 18px 20px;border-radius:14px;color:#fff;font:700 15px/1.35 system-ui,sans-serif;isolation:isolate;background:linear-gradient(120deg,#b91c1c,#dc2626 55%,#ea580c)}usa-festival-banner[data-theme=xmas]{background:linear-gradient(120deg,#14532d,#166534 55%,#b91c1c)}usa-festival-banner[data-theme=halloween]{background:linear-gradient(120deg,#1e1b4b,#4c1d95 60%,#c2410c)}usa-festival-banner[data-theme=fireworks]{background:linear-gradient(120deg,#0f172a,#1e293b 60%,#312e81)}.usa-fb-scene{position:absolute;inset:0;z-index:-1;pointer-events:none}.usa-fb-scene i{position:absolute;display:block;font-style:normal;animation-play-state:paused}usa-festival-banner[data-live] .usa-fb-scene i{animation-play-state:running}.usa-fb-lantern{left:var(--x);top:-4px;width:18px;height:24px;border-radius:45%;background:radial-gradient(circle at 50% 40%,#fde68a,#f97316 45%,#b91c1c);box-shadow:0 0 14px rgba(251,191,36,.7);transform-origin:50% -10px;animation:usa-fb-sway 2.6s ease-in-out var(--d) infinite alternate}.usa-fb-lantern::after{content:\"\";position:absolute;left:50%;bottom:-8px;width:2px;height:8px;background:#facc15;transform:translateX(-50%)}@keyframes usa-fb-sway{from{transform:rotate(-8deg)}to{transform:rotate(8deg)}}.usa-fb-spark{left:var(--x);bottom:-6px;width:4px;height:4px;border-radius:50%;background:#fde047;box-shadow:0 0 6px #fde047;animation:usa-fb-rise 4s linear var(--d) infinite}@keyframes usa-fb-rise{from{transform:translateY(0);opacity:0}20%{opacity:1}to{transform:translateY(-90px);opacity:0}}.usa-fb-light{left:var(--x);top:3px;width:8px;height:11px;border-radius:50% 50% 45% 45%;background:#fde047;box-shadow:0 0 8px #fde047;animation:usa-fb-twinkle 1.2s ease-in-out var(--d) infinite alternate}.usa-fb-light:nth-child(3n){background:#f87171;box-shadow:0 0 8px #f87171}.usa-fb-light:nth-child(3n+1){background:#60a5fa;box-shadow:0 0 8px #60a5fa}@keyframes usa-fb-twinkle{from{opacity:.35}to{opacity:1}}.usa-fb-snow{left:var(--x);top:-8px;width:6px;height:6px;border-radius:50%;background:#fff;opacity:.85;animation:usa-fb-fall 6s linear var(--d) infinite}@keyframes usa-fb-fall{to{transform:translate(14px,120px)}}.usa-fb-moon{right:18%;top:10%;width:34px;height:34px;border-radius:50%;background:#fde68a;box-shadow:0 0 24px 6px rgba(253,230,138,.55);animation:usa-fb-glow 3s ease-in-out infinite alternate}@keyframes usa-fb-glow{to{box-shadow:0 0 34px 12px rgba(253,230,138,.75)}}.usa-fb-bat{left:-24px;top:var(--y);font-size:16px;animation:usa-fb-fly 7s linear var(--d) infinite}@keyframes usa-fb-fly{0%{transform:translate(0,0)}25%{transform:translate(28vw,-8px)}50%{transform:translate(56vw,6px)}100%{transform:translate(120vw,-4px)}}.usa-fb-rocket{left:var(--x);bottom:20%;width:6px;height:6px;border-radius:50%;background:var(--c);box-shadow:0 0 0 0 var(--c),14px 0 0 -1px var(--c),-14px 0 0 -1px var(--c),0 14px 0 -1px var(--c),0 -14px 0 -1px var(--c),10px 10px 0 -1px var(--c),-10px -10px 0 -1px var(--c),10px -10px 0 -1px var(--c),-10px 10px 0 -1px var(--c);animation:usa-fb-boom 2.4s ease-out var(--d) infinite}@keyframes usa-fb-boom{0%{transform:translateY(40px) scale(.1);opacity:0}30%{transform:translateY(0) scale(.2);opacity:1}60%{transform:scale(1.2);opacity:1}100%{transform:scale(1.5);opacity:0}}.usa-fb-x{position:absolute;right:8px;top:50%;transform:translateY(-50%);width:28px;height:28px;border:0;border-radius:50%;background:rgba(255,255,255,.18);color:#fff;font-size:18px;line-height:1;cursor:pointer}.usa-fb-x:focus-visible{outline:2px solid #fff;outline-offset:2px}@media (prefers-reduced-motion:reduce){.usa-fb-scene i{animation:none!important}}";

const FESTIVAL_THEMES = ['lunar', 'xmas', 'halloween', 'fireworks'];
const SCENES = {
    lunar: (i) => (i < 4 ? `<i class="usa-fb-lantern" style="--x:${8 + i * 26}%;--d:${i * -0.6}s"></i>` : `<i class="usa-fb-spark" style="--x:${(i * 37) % 100}%;--d:${(i * -0.7) % 4}s"></i>`),
    xmas: (i) => (i < 7 ? `<i class="usa-fb-light" style="--x:${6 + i * 14.5}%;--d:${i * -0.3}s"></i>` : `<i class="usa-fb-snow" style="--x:${(i * 29) % 100}%;--d:${(i * -0.9) % 6}s"></i>`),
    halloween: (i) => (i === 0 ? '<i class="usa-fb-moon"></i>' : i < 5 ? `<i class="usa-fb-bat" style="--y:${10 + i * 12}%;--d:${i * -1.4}s">🦇</i>` : ''),
    fireworks: (i) => (i < 4 ? `<i class="usa-fb-rocket" style="--x:${12 + i * 25}%;--d:${i * -0.7}s;--c:${['#f43f5e', '#facc15', '#22d3ee', '#a855f7'][i]}"></i>` : ''),
};
function defineFestivalBanner(tag = 'usa-festival-banner') {
    return base.defineElement(tag, (Base) => {
        class UsaFestivalBanner extends Base {
            static get observedAttributes() {
                return ['theme', 'label', 'dismissible'];
            }
            get theme() {
                const t = this.str('theme', 'lunar');
                return FESTIVAL_THEMES.includes(t) ? t : 'lunar';
            }
            set theme(t) {
                this.setAttribute('theme', t);
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this.setAttribute('role', 'region');
                this.setAttribute('aria-label', this.str('label', 'Announcement'));
                this.setAttribute('data-theme', this.theme);
                const scene = Array.from({ length: 16 }, (_, i) => SCENES[this.theme](i)).join('');
                this.insertAdjacentHTML('afterbegin', `<span class="usa-fb-scene" aria-hidden="true" data-usa-part>${scene}</span>`);
                if (this.flag('dismissible')) {
                    this.insertAdjacentHTML('beforeend', '<button type="button" class="usa-fb-x" aria-label="Dismiss" data-usa-part>×</button>');
                    this.listen(this.querySelector('.usa-fb-x'), 'click', () => this.dismiss());
                }
                this.inView((v) => this.setFlag('data-live', v && !this.reduced));
            }
            dismiss() {
                const done = () => {
                    this.hidden = true;
                    this.emit('dismiss');
                };
                const a = this.reduced ? null : this.motion(this, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-8px)' }], { duration: 220, easing: 'ease-in' });
                if (a)
                    a.finished.then(done, done);
                else
                    done();
            }
        }
        return UsaFestivalBanner;
    }, { id: 'festival-banner', text: css$F });
}

var css$E = "usa-terminal{display:block;width:var(--usa-term-w,100%);max-width:100%;--usa-term-bg:#0f172a;--usa-term-fg:#e2e8f0;--usa-term-accent:#22c55e}usa-terminal[data-theme=green]{--usa-term-bg:#03140a;--usa-term-fg:#4ade80;--usa-term-accent:#86efac}usa-terminal[data-theme=amber]{--usa-term-bg:#1a1003;--usa-term-fg:#fbbf24;--usa-term-accent:#fde68a}.usa-term{border-radius:10px;overflow:hidden;background:var(--usa-term-bg);color:var(--usa-term-fg);box-shadow:0 16px 36px -18px rgba(0,0,0,.6);font:500 12.5px/1.55 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}usa-terminal[data-theme=green] .usa-term,usa-terminal[data-theme=amber] .usa-term{text-shadow:0 0 6px currentColor}.usa-term-bar{display:flex;align-items:center;gap:6px;padding:8px 10px;background:rgba(255,255,255,.06)}.usa-term-bar i{width:10px;height:10px;border-radius:50%;background:#ef4444}.usa-term-bar i:nth-child(2){background:#f59e0b}.usa-term-bar i:nth-child(3){background:#22c55e}.usa-term-bar span{flex:1;text-align:center;margin-right:40px;opacity:.6;font-size:11px}.usa-term-body{min-height:var(--usa-term-h,120px);padding:10px 12px 12px}.usa-term-body p{margin:0;white-space:pre-wrap;word-break:break-word}.usa-term-ps{color:var(--usa-term-accent)}.usa-term-out{opacity:.8}.usa-term-cursor{display:inline-block;width:.6em;height:1.15em;margin-left:1px;vertical-align:text-bottom;background:currentColor;animation:usa-term-blink 1s steps(1) infinite}@keyframes usa-term-blink{50%{opacity:0}}@media (prefers-reduced-motion:reduce){.usa-term-cursor{animation:none}}";

const esc$8 = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
function defineTerminal(tag = 'usa-terminal') {
    return base.defineElement(tag, (Base) => {
        class UsaTerminal extends Base {
            constructor() {
                super(...arguments);
                this._lines = [];
                this._timer = 0;
                this._run = 0;
            }
            static get observedAttributes() {
                return ['title', 'prompt', 'theme', 'speed'];
            }
            mount() {
                const src = Array.from(this.children).filter((c) => !c.hasAttribute('data-usa-part'));
                if (src.length)
                    this._lines = src.map((c) => ({ cmd: c.hasAttribute('data-cmd'), text: (c.textContent || '').replace(/\s+$/, '') }));
                src.forEach((c) => c.remove());
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this.setAttribute('data-theme', ['green', 'amber'].includes(this.str('theme')) ? this.str('theme') : 'dark');
                this.insertAdjacentHTML('beforeend', `<div class="usa-term" data-usa-part><div class="usa-term-bar" aria-hidden="true"><i></i><i></i><i></i><span>${esc$8(this.str('title', 'terminal'))}</span></div><div class="usa-term-body" role="log" aria-label="${esc$8(this.str('title', 'Terminal'))}"></div></div>`);
                let started = false;
                this.inView((v) => {
                    if (v && !started) {
                        started = true;
                        this.replay();
                    }
                }, { threshold: 0.3 });
                this.onCleanup(() => clearTimeout(this._timer));
            }
            line(l) {
                const body = this.querySelector('.usa-term-body');
                const p = document.createElement('p');
                p.className = l.cmd ? 'usa-term-cmd' : 'usa-term-out';
                if (l.cmd)
                    p.innerHTML = `<span class="usa-term-ps" aria-hidden="true">${esc$8(this.str('prompt', '$'))} </span><span class="usa-term-tx"></span>`;
                body.appendChild(p);
                return p;
            }
            /** Clear and type everything again. */
            replay() {
                clearTimeout(this._timer);
                const run = ++this._run;
                const body = this.querySelector('.usa-term-body');
                if (!body)
                    return;
                body.textContent = '';
                if (this.reduced)
                    return this.skip();
                const speed = Math.max(5, this.num('speed', 45));
                let i = 0;
                const next = () => {
                    if (run !== this._run || !this.isConnected)
                        return;
                    body.querySelectorAll('.usa-term-cursor').forEach((c) => c.remove());
                    const l = this._lines[i++];
                    if (!l) {
                        const last = this.line({ cmd: true, text: '' });
                        last.insertAdjacentHTML('beforeend', '<span class="usa-term-cursor" aria-hidden="true"></span>');
                        this.emit('done');
                        if (this.flag('loop'))
                            this._timer = setTimeout(() => this.replay(), 2500);
                        return;
                    }
                    const p = this.line(l);
                    if (!l.cmd) {
                        p.textContent = l.text;
                        this.motion(p, [{ opacity: 0 }, { opacity: 1 }], { duration: 150 });
                        this._timer = setTimeout(next, 120);
                        return;
                    }
                    const tx = p.querySelector('.usa-term-tx');
                    const cur = document.createElement('span');
                    cur.className = 'usa-term-cursor';
                    cur.setAttribute('aria-hidden', 'true');
                    p.appendChild(cur);
                    let k = 0;
                    const type = () => {
                        if (run !== this._run)
                            return;
                        tx.textContent = l.text.slice(0, ++k);
                        if (k < l.text.length)
                            this._timer = setTimeout(type, speed * (0.6 + Math.random() * 0.8));
                        else
                            this._timer = setTimeout(next, 350);
                    };
                    this._timer = setTimeout(type, 250);
                };
                next();
            }
            /** Show every line at once. */
            skip() {
                clearTimeout(this._timer);
                this._run++;
                const body = this.querySelector('.usa-term-body');
                if (!body)
                    return;
                body.textContent = '';
                for (const l of this._lines) {
                    const p = this.line(l);
                    if (l.cmd)
                        p.querySelector('.usa-term-tx').textContent = l.text;
                    else
                        p.textContent = l.text;
                }
                this.emit('done');
            }
        }
        return UsaTerminal;
    }, { id: 'terminal', text: css$E });
}

var css$D = "usa-retro-button{display:inline-block}.usa-rb{font:700 14px/1 system-ui,sans-serif;cursor:pointer;color:inherit}.usa-rb:disabled{opacity:.5;cursor:not-allowed}usa-retro-button[data-variant=pixel] .usa-rb{padding:10px 16px;border:0;background:#f43f5e;color:#fff;font-family:ui-monospace,Menlo,monospace;letter-spacing:.06em;text-transform:uppercase;box-shadow:3px 0 0 #111,-3px 0 0 #111,0 3px 0 #111,0 -3px 0 #111,6px 6px 0 #111;image-rendering:pixelated}usa-retro-button[data-variant=pixel] .usa-rb:focus-visible{outline:3px dashed #111;outline-offset:6px}usa-retro-button[data-variant=crt] .usa-rb{padding:10px 18px;border:2px solid #22c55e;border-radius:4px;background:#03140a;color:#4ade80;font-family:ui-monospace,Menlo,monospace;text-shadow:0 0 6px #4ade80;box-shadow:0 0 10px rgba(74,222,128,.45),inset 0 0 12px rgba(74,222,128,.25);background-image:repeating-linear-gradient(0deg,rgba(0,0,0,.25) 0 1px,transparent 1px 3px)}usa-retro-button[data-variant=crt] .usa-rb:focus-visible{outline:2px solid #86efac;outline-offset:3px}usa-retro-button[data-variant=y2k] .usa-rb{padding:11px 22px;border:1px solid rgba(255,255,255,.7);border-radius:999px;color:#1e1b4b;background:linear-gradient(180deg,#f8fafc 0%,#c7d2fe 45%,#818cf8 52%,#e0e7ff 100%);box-shadow:0 6px 14px -6px rgba(79,70,229,.6),inset 0 1px 0 #fff;text-shadow:0 1px 0 rgba(255,255,255,.7)}usa-retro-button[data-variant=y2k] .usa-rb:focus-visible{outline:2px solid #6366f1;outline-offset:3px}usa-retro-button[data-variant=win95] .usa-rb{padding:7px 16px;border:0;border-radius:0;background:#c0c0c0;color:#000;font:400 13px/1 Tahoma,Verdana,sans-serif;box-shadow:inset -1px -1px #0a0a0a,inset 1px 1px #fff,inset -2px -2px #808080,inset 2px 2px #dfdfdf}usa-retro-button[data-variant=win95] .usa-rb:active{box-shadow:inset -1px -1px #fff,inset 1px 1px #0a0a0a,inset -2px -2px #dfdfdf,inset 2px 2px #808080}usa-retro-button[data-variant=win95] .usa-rb:focus-visible{outline:1px dotted #000;outline-offset:-4px}";

const RETRO_VARIANTS = ['pixel', 'crt', 'y2k', 'win95'];
function defineRetroButton(tag = 'usa-retro-button') {
    return base.defineElement(tag, (Base) => {
        class UsaRetroButton extends Base {
            static get observedAttributes() {
                return ['variant', 'disabled'];
            }
            get button() {
                return this.querySelector('.usa-rb');
            }
            get variant() {
                const v = this.str('variant', 'pixel');
                return RETRO_VARIANTS.includes(v) ? v : 'pixel';
            }
            set variant(v) {
                this.setAttribute('variant', v);
            }
            mount() {
                let btn = this.button;
                if (!btn) {
                    btn = document.createElement('button');
                    btn.className = 'usa-rb';
                    btn.setAttribute('data-usa-part', '');
                    while (this.firstChild)
                        btn.appendChild(this.firstChild);
                    this.appendChild(btn);
                }
                btn.type = this.str('type', 'button') || 'button';
                btn.disabled = this.flag('disabled');
                for (const a of ['name', 'value'])
                    if (this.hasAttribute(a))
                        btn.setAttribute(a, this.str(a));
                this.setAttribute('data-variant', this.variant);
                const b = btn;
                this.listen(b, 'pointerdown', () => this.press(b));
                this.listen(b, 'keydown', (e) => (e.key === 'Enter' || e.key === ' ') && !e.repeat && this.press(b));
            }
            press(b) {
                if (this.reduced || b.hasAttribute('disabled'))
                    return;
                const v = this.variant;
                if (v === 'pixel')
                    this.motion(b, [{ transform: 'none' }, { transform: 'translate(3px,3px)' }, { transform: 'translate(3px,3px)', offset: 0.6 }, { transform: 'none' }], { duration: 260, easing: 'steps(3, end)' });
                else if (v === 'crt')
                    this.motion(b, [{ filter: 'brightness(1)' }, { filter: 'brightness(1.8)' }, { filter: 'brightness(.7)' }, { filter: 'brightness(1.4)' }, { filter: 'brightness(1)' }], { duration: 300, easing: 'steps(4, end)' });
                else if (v === 'y2k')
                    this.motion(b, [{ transform: 'scale(1)' }, { transform: 'scale(.92)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: 420, easing: 'cubic-bezier(.3,1.5,.5,1)' });
                else
                    this.motion(b, [{ transform: 'none' }, { transform: 'translate(1px,1px)' }, { transform: 'none' }], { duration: 180 });
            }
        }
        return UsaRetroButton;
    }, { id: 'retro-button', text: css$D });
}

var css$C = "usa-organic-card{position:relative;display:block;padding:22px 24px;color:#0f172a;background:linear-gradient(140deg,#d9f99d,#86efac 55%,#34d399);box-shadow:0 18px 36px -22px rgba(22,101,52,.7);transition:box-shadow .3s;outline:none}usa-organic-card[data-tint=ocean]{background:linear-gradient(140deg,#bae6fd,#7dd3fc 50%,#38bdf8);box-shadow:0 18px 36px -22px rgba(3,105,161,.7)}usa-organic-card[data-tint=petal]{background:linear-gradient(140deg,#fbcfe8,#f9a8d4 50%,#f472b6);box-shadow:0 18px 36px -22px rgba(157,23,77,.6)}usa-organic-card[data-tint=sand]{background:linear-gradient(140deg,#fef3c7,#fde68a 50%,#fbbf24);box-shadow:0 18px 36px -22px rgba(146,64,14,.6)}usa-organic-card:hover{box-shadow:0 24px 44px -20px rgba(15,23,42,.45)}usa-organic-card:focus-within{box-shadow:0 0 0 3px rgba(15,23,42,.25),0 24px 44px -20px rgba(15,23,42,.45)}";

function defineOrganicCard(tag = 'usa-organic-card') {
    return base.defineElement(tag, (Base) => {
        class UsaOrganicCard extends Base {
            constructor() {
                super(...arguments);
                this._seed = 1;
                this._loop = null;
            }
            static get observedAttributes() {
                return ['tint', 'seed'];
            }
            mount() {
                this._seed = this.num('seed', 1);
                this.setAttribute('data-tint', ['ocean', 'petal', 'sand'].includes(this.str('tint')) ? this.str('tint') : 'leaf');
                this.style.borderRadius = components_fxOrganic.blobRadius(this._seed);
                this.inView((v) => {
                    this._loop?.cancel();
                    this._loop = null;
                    if (!v || this.reduced)
                        return;
                    const frames = [0, 1, 2, 0].map((k, i) => ({ borderRadius: components_fxOrganic.blobRadius(this._seed + k), offset: i / 3 }));
                    this._loop = this.motion(this, frames, { duration: 9000, iterations: Infinity, easing: 'ease-in-out' });
                });
                this.listen(this, 'pointerenter', () => this.morph(this._seed + 7));
                this.listen(this, 'pointerleave', () => this.morph(this._seed));
                this.onCleanup(() => this._loop?.cancel());
            }
            /** Morph to the blob shape of `seed` (random when omitted). */
            morph(seed = Math.random() * 100) {
                const to = components_fxOrganic.blobRadius(seed);
                const from = this.style.borderRadius || to;
                this.style.borderRadius = to;
                if (!this.reduced)
                    this.motion(this, [{ borderRadius: from }, { borderRadius: to }], { duration: 700, easing: 'cubic-bezier(.3,1.3,.5,1)', composite: 'replace' });
            }
        }
        return UsaOrganicCard;
    }, { id: 'organic-card', text: css$C });
}

var css$B = "usa-liquid-nav{position:relative;display:inline-flex;align-items:center;gap:4px;padding:8px 10px 18px;border-radius:18px;background:var(--usa-lq-bg,#0f172a);color:#e2e8f0;font:600 13px/1 system-ui,sans-serif;--usa-lq-accent:#38bdf8}.usa-lq-defs{position:absolute}.usa-lq-goo{position:absolute;left:0;right:0;bottom:4px;height:14px;pointer-events:none}.usa-lq-goo i{position:absolute;left:-6px;top:1px;width:12px;height:12px;border-radius:50%;background:var(--usa-lq-accent)}.usa-lq-tail{width:9px!important;height:9px!important;left:-4.5px!important;top:2.5px!important}.usa-lq-item{position:relative;padding:8px 12px;border:0;border-radius:10px;background:none;color:inherit;font:inherit;text-decoration:none;cursor:pointer;opacity:.7;transition:opacity .2s,color .2s}.usa-lq-item[aria-current]{opacity:1;color:var(--usa-lq-accent)}.usa-lq-item:focus-visible{outline:2px solid var(--usa-lq-accent);outline-offset:1px;opacity:1}";

let uid$1 = 0;
function defineLiquidNav(tag = 'usa-liquid-nav') {
    return base.defineElement(tag, (Base) => {
        class UsaLiquidNav extends Base {
            constructor() {
                super(...arguments);
                this._i = 0;
                this._id = `usa-lq-${++uid$1}`;
            }
            static get observedAttributes() {
                return ['label'];
            }
            items() {
                return Array.from(this.children).filter((c) => !c.hasAttribute('data-usa-part'));
            }
            get value() {
                return this._i;
            }
            set value(i) {
                this.select(i, false);
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this.setAttribute('role', 'navigation');
                this.setAttribute('aria-label', this.str('label', 'Main'));
                this.insertAdjacentHTML('afterbegin', `<svg class="usa-lq-defs" aria-hidden="true" width="0" height="0" data-usa-part><filter id="${this._id}"><feGaussianBlur in="SourceGraphic" stdDeviation="5"/><feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 20 -9"/></filter></svg><span class="usa-lq-goo" aria-hidden="true" style="filter:url(#${this._id})" data-usa-part><i class="usa-lq-drop"></i><i class="usa-lq-tail"></i></span>`);
                const items = this.items();
                const cur = items.findIndex((it) => it.getAttribute('aria-current') === 'page' || it.hasAttribute('data-active'));
                this._i = cur >= 0 ? cur : Math.max(0, Math.min(items.length - 1, Math.round(this.num('value', 0))));
                items.forEach((it, i) => {
                    it.classList.add('usa-lq-item');
                    this.listen(it, 'click', () => this.select(i, true));
                    this.listen(it, 'keydown', (e) => {
                        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
                        if (!d)
                            return;
                        e.preventDefault();
                        items[(i + d + items.length) % items.length].focus();
                    });
                });
                requestAnimationFrame(() => this.place(false));
                this.place(false);
                this.listen(window, 'resize', () => this.place(false));
            }
            select(i, user) {
                const items = this.items();
                if (!items[i] || (i === this._i && user))
                    return;
                const from = this._i;
                this._i = i;
                this.place(user && !this.reduced, from);
                if (user)
                    this.emit('change', { index: i, item: items[i] });
            }
            place(animate, from = this._i) {
                const items = this.items();
                items.forEach((it, k) => {
                    if (k === this._i)
                        it.setAttribute('aria-current', 'page');
                    else
                        it.removeAttribute('aria-current');
                });
                const it = items[this._i];
                const drop = this.querySelector('.usa-lq-drop');
                const tail = this.querySelector('.usa-lq-tail');
                if (!it || !drop || !tail)
                    return;
                const x = it.offsetLeft + it.offsetWidth / 2;
                const px = items[from] ? items[from].offsetLeft + items[from].offsetWidth / 2 : x;
                drop.style.transform = `translateX(${x}px)`;
                tail.style.transform = `translateX(${x}px)`;
                if (!animate || px === x)
                    return;
                const dir = Math.sign(x - px);
                this.motion(drop, [{ transform: `translateX(${px}px) scale(1)` }, { transform: `translateX(${px + (x - px) * 0.6}px) scale(1.35, .8)`, offset: 0.45 }, { transform: `translateX(${x + dir * 4}px) scale(.9, 1.12)`, offset: 0.75 }, { transform: `translateX(${x}px) scale(1)` }], { duration: 620, easing: 'cubic-bezier(.4,0,.2,1)' });
                this.motion(tail, [{ transform: `translateX(${px}px) scale(1)` }, { transform: `translateX(${px + (x - px) * 0.25}px) scale(.7)`, offset: 0.5 }, { transform: `translateX(${x}px) scale(.9)`, offset: 0.85 }, { transform: `translateX(${x}px) scale(1)` }], { duration: 760, easing: 'cubic-bezier(.4,0,.2,1)' });
            }
        }
        return UsaLiquidNav;
    }, { id: 'liquid-nav', text: css$B });
}

var css$A = "usa-hud-panel{position:relative;display:block;padding:12px 16px 14px;color:#cffafe;background:linear-gradient(160deg,rgba(8,47,73,.92),rgba(2,6,23,.95));clip-path:polygon(12px 0,calc(100% - 12px) 0,100% 12px,100% calc(100% - 12px),calc(100% - 12px) 100%,12px 100%,0 calc(100% - 12px),0 12px);font:500 12px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;--usa-hud-c:#22d3ee}.usa-hud-frame{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none}.usa-hud-frame path{fill:none;stroke:var(--usa-hud-c);stroke-width:1.5;stroke-dasharray:100;filter:drop-shadow(0 0 3px var(--usa-hud-c))}.usa-hud-head{display:flex;align-items:center;gap:8px;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid color-mix(in srgb,var(--usa-hud-c) 35%,transparent);letter-spacing:.12em}.usa-hud-dot{width:7px;height:7px;border-radius:50%;background:var(--usa-hud-c);box-shadow:0 0 8px var(--usa-hud-c);animation:usa-hud-blink 1.4s steps(1) infinite}@keyframes usa-hud-blink{50%{opacity:.25}}.usa-hud-title{flex:1;font-weight:800;color:var(--usa-hud-c)}.usa-hud-status{font-size:10px;opacity:.75}.usa-hud-row{display:grid;grid-template-columns:5.5em 1fr 3em;align-items:center;gap:8px;margin:5px 0 0}.usa-hud-bar{height:6px;background:color-mix(in srgb,var(--usa-hud-c) 15%,transparent);overflow:hidden}.usa-hud-bar i{display:block;width:var(--v);height:100%;background:var(--usa-hud-c);box-shadow:0 0 8px var(--usa-hud-c);transform-origin:0 50%}.usa-hud-num{text-align:right;color:var(--usa-hud-c);font-variant-numeric:tabular-nums}@media (prefers-reduced-motion:reduce){.usa-hud-dot{animation:none}}";

const esc$7 = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
function defineHudPanel(tag = 'usa-hud-panel') {
    return base.defineElement(tag, (Base) => {
        class UsaHudPanel extends Base {
            static get observedAttributes() {
                return ['title', 'status', 'color'];
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this.setAttribute('role', 'region');
                this.setAttribute('aria-label', this.str('title', 'Panel'));
                if (this.hasAttribute('color'))
                    this.style.setProperty('--usa-hud-c', this.str('color'));
                this.insertAdjacentHTML('afterbegin', `<svg class="usa-hud-frame" aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 100 100" data-usa-part><path pathLength="100" vector-effect="non-scaling-stroke" d="M6 1H94L99 6V94L94 99H6L1 94V6Z"/></svg><header class="usa-hud-head" data-usa-part><span class="usa-hud-dot" aria-hidden="true"></span><span class="usa-hud-title">${esc$7(this.str('title', 'SYSTEM'))}</span><span class="usa-hud-status">${esc$7(this.str('status', 'ONLINE'))}</span></header>`);
                this.querySelectorAll(':scope > [data-value]').forEach((r) => {
                    if (r.querySelector('.usa-hud-bar'))
                        return;
                    const v = Math.min(100, Math.max(0, Number(r.dataset.value) || 0));
                    r.classList.add('usa-hud-row');
                    r.insertAdjacentHTML('beforeend', `<span class="usa-hud-bar" aria-hidden="true"><i style="--v:${v}%"></i></span><span class="usa-hud-num">${v}%</span>`);
                });
                let booted = false;
                this.inView((v) => {
                    if (v && !booted) {
                        booted = true;
                        this.boot();
                    }
                }, { threshold: 0.3 });
            }
            boot() {
                this.setAttribute('data-booted', '');
                if (this.reduced)
                    return void this.emit('boot');
                const frame = this.querySelector('.usa-hud-frame path');
                if (frame)
                    this.motion(frame, [{ strokeDashoffset: '100' }, { strokeDashoffset: '0' }], { duration: 900, easing: 'ease-in-out', fill: 'backwards' });
                this.motion(this.querySelector('.usa-hud-head'), [{ opacity: 0, transform: 'translateX(-8px)' }, { opacity: 1, transform: 'none' }], { duration: 400, delay: 300, easing: 'steps(4, end)', fill: 'backwards' });
                const rows = Array.from(this.querySelectorAll('.usa-hud-bar i'));
                rows.forEach((b, i) => this.motion(b, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 700, delay: 500 + i * 120, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' }));
                const last = this.motion(this, [{ filter: 'brightness(1.6)' }, { filter: 'none' }], { duration: 500, delay: 500 + rows.length * 120 });
                if (last)
                    last.finished.then(() => this.emit('boot'), () => undefined);
                else
                    this.emit('boot');
            }
        }
        return UsaHudPanel;
    }, { id: 'hud-panel', text: css$A });
}

var css$z = "usa-radar{display:block;width:var(--usa-rd-size,200px);max-width:100%;aspect-ratio:1;--usa-rd-c:#22d3ee}.usa-rd{position:relative;width:100%;height:100%;border-radius:50%;background:radial-gradient(circle,#082f49 0,#020617 75%);box-shadow:0 0 0 2px color-mix(in srgb,var(--usa-rd-c) 45%,transparent),0 0 24px -4px var(--usa-rd-c);overflow:hidden}.usa-rd-ring{position:absolute;left:50%;top:50%;width:var(--r);height:var(--r);border:1px solid color-mix(in srgb,var(--usa-rd-c) 30%,transparent);border-radius:50%;transform:translate(-50%,-50%)}.usa-rd-cross{position:absolute;inset:0;background:linear-gradient(color-mix(in srgb,var(--usa-rd-c) 25%,transparent),color-mix(in srgb,var(--usa-rd-c) 25%,transparent)) 50% 0/1px 100% no-repeat,linear-gradient(color-mix(in srgb,var(--usa-rd-c) 25%,transparent),color-mix(in srgb,var(--usa-rd-c) 25%,transparent)) 0 50%/100% 1px no-repeat}.usa-rd-sweep{position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 0deg,transparent 0 300deg,color-mix(in srgb,var(--usa-rd-c) 15%,transparent) 330deg,color-mix(in srgb,var(--usa-rd-c) 70%,transparent) 360deg);animation:usa-rd-turn var(--usa-rd-period,4s) linear infinite;animation-play-state:paused}usa-radar[data-live] .usa-rd-sweep{animation-play-state:running}@keyframes usa-rd-turn{to{transform:rotate(360deg)}}.usa-rd-dot{position:absolute;width:8px;height:8px;border-radius:50%;background:var(--usa-rd-c);box-shadow:0 0 8px 2px var(--usa-rd-c);transform:translate(-50%,-50%);opacity:.15}.usa-rd-dot[data-lit]{opacity:1}.usa-rd-dot em{position:absolute;left:10px;top:-5px;font:600 9px/1 ui-monospace,Menlo,monospace;font-style:normal;color:var(--usa-rd-c);white-space:nowrap}@media (prefers-reduced-motion:reduce){.usa-rd-sweep{animation:none;transform:rotate(45deg)}}";

/** "A:40,0.6; B:200,0.3" → targets (bearing normalised to 0–360, distance clamped 0–1) (8.4). */
function parseTargets(s) {
    return s
        .split(';')
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => {
        const m = p.match(/^(.*?):\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)$/);
        if (!m)
            return null;
        return { name: m[1].trim(), bearing: ((Number(m[2]) % 360) + 360) % 360, distance: Math.min(1, Math.max(0, Number(m[3]))) };
    })
        .filter(Boolean);
}
const esc$6 = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
function defineRadar(tag = 'usa-radar') {
    return base.defineElement(tag, (Base) => {
        class UsaRadar extends Base {
            constructor() {
                super(...arguments);
                this._t = null;
                this._timers = [];
            }
            static get observedAttributes() {
                return ['targets', 'rings', 'speed', 'label'];
            }
            get targets() {
                return (this._t || parseTargets(this.str('targets'))).map((t) => ({ ...t }));
            }
            set targets(v) {
                this.setTargets(v);
            }
            setTargets(list) {
                this._t = list.map((t) => ({ name: String(t.name), bearing: ((Number(t.bearing) % 360) + 360) % 360, distance: Math.min(1, Math.max(0, Number(t.distance))) }));
                if (this.isConnected)
                    this.changed('targets');
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const ts = this.targets;
                const rings = Math.max(1, Math.min(8, Math.round(this.num('rings', 4))));
                this.setAttribute('role', 'img');
                this.setAttribute('aria-label', `${this.str('label', 'Radar')}: ${ts.length ? ts.map((t) => `${t.name} at ${Math.round(t.bearing)}°`).join(', ') : 'no targets'}`);
                const ringHtml = Array.from({ length: rings }, (_, i) => `<i class="usa-rd-ring" style="--r:${((i + 1) / rings) * 100}%"></i>`).join('');
                const dots = ts
                    .map((t, i) => {
                    const a = ((t.bearing - 90) * Math.PI) / 180;
                    const x = 50 + Math.cos(a) * t.distance * 48;
                    const y = 50 + Math.sin(a) * t.distance * 48;
                    return `<span class="usa-rd-dot" data-i="${i}" style="left:${x.toFixed(2)}%;top:${y.toFixed(2)}%"><em>${esc$6(t.name)}</em></span>`;
                })
                    .join('');
                this.insertAdjacentHTML('beforeend', `<div class="usa-rd" aria-hidden="true" data-usa-part>${ringHtml}<i class="usa-rd-cross"></i><i class="usa-rd-sweep"></i>${dots}</div>`);
                const period = Math.max(1, this.num('speed', 4)) * 1000;
                this.querySelector('.usa-rd').style.setProperty('--usa-rd-period', `${period}ms`);
                if (this.reduced) {
                    this.querySelectorAll('.usa-rd-dot').forEach((d) => d.setAttribute('data-lit', ''));
                    return;
                }
                this.inView((v) => {
                    this.setFlag('data-live', v);
                    this._timers.forEach(clearTimeout);
                    this._timers = [];
                    if (!v)
                        return;
                    const start = performance.now();
                    const ping = (t, i) => {
                        const d = this.querySelector(`.usa-rd-dot[data-i="${i}"]`);
                        if (!d || !this.isConnected)
                            return;
                        this.motion(d, [{ opacity: 1, transform: 'translate(-50%,-50%) scale(1.5)' }, { opacity: 0.15, transform: 'translate(-50%,-50%) scale(1)' }], { duration: period * 0.85, easing: 'ease-out', fill: 'forwards' });
                        this.emit('ping', { name: t.name });
                        this._timers.push(setTimeout(() => ping(t, i), period));
                    };
                    ts.forEach((t, i) => {
                        const elapsed = (performance.now() - start) % period;
                        const at = ((t.bearing / 360) * period - elapsed + period) % period;
                        this._timers.push(setTimeout(() => ping(t, i), at));
                    });
                });
                this.onCleanup(() => this._timers.forEach(clearTimeout));
            }
        }
        return UsaRadar;
    }, { id: 'radar', text: css$z });
}

var css$y = "usa-sticky-wall{display:flex;flex-wrap:wrap;gap:14px;padding:14px;align-items:flex-start}usa-sticky-wall>.usa-sticky{position:relative;box-sizing:border-box;width:120px;min-height:96px;padding:18px 12px 12px;font:500 13px/1.35 'Comic Sans MS','Segoe Print','Bradley Hand',cursive,system-ui;color:#3f3a2e;background:#fef08a;transform:rotate(var(--tilt,0deg));box-shadow:0 10px 16px -10px rgba(0,0,0,.45),inset 0 -12px 18px -14px rgba(0,0,0,.25);cursor:pointer;outline:none;transition:box-shadow .2s}usa-sticky-wall>.usa-sticky::before{content:'';position:absolute;top:5px;left:50%;width:10px;height:10px;margin-left:-5px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fca5a5,#dc2626 70%);box-shadow:0 2px 2px rgba(0,0,0,.3)}usa-sticky-wall>[data-paper=pink]{background:#fbcfe8}usa-sticky-wall>[data-paper=blue]{background:#bae6fd}usa-sticky-wall>[data-paper=green]{background:#bbf7d0}usa-sticky-wall>.usa-sticky:focus-visible{box-shadow:0 0 0 3px #6366f1,0 10px 16px -10px rgba(0,0,0,.45)}usa-sticky-wall>[data-picked]{box-shadow:0 18px 26px -12px rgba(0,0,0,.5)}";

const COLORS = ['yellow', 'pink', 'blue', 'green'];
function defineStickyWall(tag = 'usa-sticky-wall') {
    return base.defineElement(tag, (Base) => {
        class UsaStickyWall extends Base {
            constructor() {
                super(...arguments);
                this._z = 1;
            }
            static get observedAttributes() {
                return ['seed', 'label'];
            }
            get notes() {
                return Array.from(this.children).filter((c) => !c.hasAttribute('data-usa-part'));
            }
            mount() {
                this.setAttribute('role', 'list');
                if (this.hasAttribute('label'))
                    this.setAttribute('aria-label', this.str('label'));
                const r = components_fxPaper.paperRandom(this.num('seed', 3));
                const notes = this.notes;
                notes.forEach((n, i) => {
                    n.classList.add('usa-sticky');
                    n.setAttribute('role', 'listitem');
                    n.tabIndex = 0;
                    const c = COLORS.includes(n.dataset.color || '') ? n.dataset.color : COLORS[i % COLORS.length];
                    n.setAttribute('data-paper', c);
                    n.style.setProperty('--tilt', `${((r() - 0.5) * 8).toFixed(1)}deg`);
                });
                let shown = false;
                this.inView((v) => {
                    if (!v || shown || this.reduced)
                        return;
                    shown = true;
                    notes.forEach((n, i) => this.motion(n, [{ transform: 'translateY(-40px) rotate(calc(var(--tilt) * 3)) scale(1.1)', opacity: 0 }, { transform: 'translateY(4px) rotate(var(--tilt))', opacity: 1, offset: 0.75 }, { transform: 'rotate(var(--tilt))', opacity: 1 }], { duration: 520, delay: i * 110, easing: 'cubic-bezier(.3,1.2,.5,1)', fill: 'backwards' }));
                }, { threshold: 0.2 });
                this.listen(this, 'click', (e) => {
                    const n = e.target.closest?.('.usa-sticky');
                    if (n && n.parentElement === this)
                        this.pick(this.notes.indexOf(n));
                });
                this.listen(this, 'keydown', (e) => {
                    const n = e.target.closest?.('.usa-sticky');
                    if (n && n.parentElement === this && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        this.pick(this.notes.indexOf(n));
                    }
                });
            }
            /** Lift note `index` to the front with a little wiggle. */
            pick(index) {
                const n = this.notes[index];
                if (!n)
                    return;
                n.style.zIndex = String(++this._z);
                this.notes.forEach((x) => x.removeAttribute('data-picked'));
                n.setAttribute('data-picked', '');
                if (!this.reduced)
                    this.motion(n, [{ transform: 'rotate(var(--tilt)) scale(1)' }, { transform: 'rotate(0deg) scale(1.08)', offset: 0.4 }, { transform: 'rotate(var(--tilt)) scale(1.04)' }], { duration: 360, easing: 'ease-out' });
                this.emit('pick', { index });
            }
        }
        return UsaStickyWall;
    }, { id: 'sticky-wall', text: css$y });
}

var css$x = "usa-sketch-chart{display:block;max-width:100%;cursor:pointer;color:#334155;--usa-sk-c:#2563eb}usa-sketch-chart .usa-sk{display:block;width:100%;height:auto;overflow:visible}usa-sketch-chart .usa-sk path{fill:none;stroke-linecap:round;stroke-linejoin:round}usa-sketch-chart .usa-sk-axis{stroke:currentColor;stroke-width:1.6}usa-sketch-chart .usa-sk-mark{stroke:var(--usa-sk-c);stroke-width:2.2}usa-sketch-chart .usa-sk-hatch{stroke:var(--usa-sk-c);stroke-width:1;opacity:.55}usa-sketch-chart .usa-sk-dot{fill:#fff;stroke:var(--usa-sk-c);stroke-width:2}usa-sketch-chart text{fill:currentColor;font:12px 'Comic Sans MS','Segoe Print','Bradley Hand',cursive,system-ui;text-anchor:middle}";

const esc$5 = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const nums = (s) => s.split(',').map((x) => Number(x.trim())).filter((x) => Number.isFinite(x));
function defineSketchChart(tag = 'usa-sketch-chart') {
    return base.defineElement(tag, (Base) => {
        class UsaSketchChart extends Base {
            constructor() {
                super(...arguments);
                this._v = null;
            }
            static get observedAttributes() {
                return ['values', 'labels', 'type', 'color', 'label'];
            }
            get values() {
                return (this._v || nums(this.str('values'))).slice();
            }
            set values(v) {
                this.setValues(v);
            }
            setValues(v) {
                this._v = v.map(Number).filter((x) => Number.isFinite(x));
                if (this.isConnected)
                    this.changed('values');
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const vs = this.values;
                const labels = this.str('labels').split(',').map((s) => s.trim());
                const line = this.str('type') === 'line';
                if (this.hasAttribute('color'))
                    this.style.setProperty('--usa-sk-c', this.str('color'));
                this.setAttribute('role', 'img');
                this.setAttribute('aria-label', `${this.str('label', 'Chart')}: ${vs.map((v, i) => `${labels[i] || i + 1} ${v}`).join(', ') || 'no data'}`);
                const W = 240, H = 140, L = 22, B = 120, T = 12;
                const max = Math.max(1, ...vs);
                const step = vs.length ? (W - L - 8) / vs.length : 0;
                const y = (v) => B - (Math.max(0, v) / max) * (B - T);
                let g = `<path class="usa-sk-axis" d="${components_fxPaper.roughLine(L, T - 4, L, B, 1)} ${components_fxPaper.roughLine(L, B, W - 4, B, 2)}"/>`;
                if (line) {
                    const pts = vs.map((v, i) => [L + step * (i + 0.5), y(v)]);
                    g += pts.slice(1).map((p, i) => `<path class="usa-sk-mark" d="${components_fxPaper.roughLine(pts[i][0], pts[i][1], p[0], p[1], i + 5, 1.2)}"/>`).join('');
                    g += pts.map(([x, yy]) => `<circle class="usa-sk-dot" cx="${x.toFixed(1)}" cy="${yy.toFixed(1)}" r="3.5"/>`).join('');
                }
                else {
                    vs.forEach((v, i) => {
                        const x0 = L + step * i + step * 0.2;
                        const x1 = x0 + step * 0.6;
                        const yy = y(v);
                        g += `<path class="usa-sk-mark" d="${components_fxPaper.roughLine(x0, B, x0, yy, i * 3 + 7)} ${components_fxPaper.roughLine(x0, yy, x1, yy, i * 3 + 8)} ${components_fxPaper.roughLine(x1, yy, x1, B, i * 3 + 9)}"/>`;
                        for (let h = yy + 8; h < B - 2; h += 9)
                            g += `<path class="usa-sk-hatch" d="${components_fxPaper.roughLine(x0 + 2, Math.min(B, h + 5), x1 - 2, h - 3, h + i, 0.8)}"/>`;
                    });
                }
                g += vs.map((_, i) => (labels[i] ? `<text x="${(L + step * (i + 0.5)).toFixed(1)}" y="${B + 14}">${esc$5(labels[i])}</text>` : '')).join('');
                this.insertAdjacentHTML('beforeend', `<svg class="usa-sk" viewBox="0 0 ${W} ${H}" aria-hidden="true" data-usa-part>${g}</svg>`);
                if (this.reduced)
                    return void this.setAttribute('data-drawn', '');
                this.listen(this, 'click', () => this.redraw());
                let done = false;
                this.inView((v) => {
                    if (v && !done) {
                        done = true;
                        this.draw();
                    }
                }, { threshold: 0.3 });
            }
            /** Sketch the chart in again. */
            redraw() {
                if (this.reduced)
                    return;
                this.querySelectorAll('.usa-sk path, .usa-sk circle').forEach((p) => p.getAnimations?.().forEach((a) => a.cancel()));
                this.draw();
            }
            draw() {
                const strokes = Array.from(this.querySelectorAll('.usa-sk-axis, .usa-sk-mark, .usa-sk-hatch, .usa-sk-dot'));
                let last = null;
                strokes.forEach((p, i) => {
                    let len = 150;
                    try {
                        len = p.getTotalLength?.() || 150;
                    }
                    catch {
                        /* not rendered */
                    }
                    p.style.strokeDasharray = `${len}`;
                    last = this.motion(p, [{ strokeDashoffset: `${len}` }, { strokeDashoffset: '0' }], { duration: 380, delay: i * 45, easing: 'ease-out', fill: 'backwards' }) || last;
                });
                this.setAttribute('data-drawn', '');
                const end = () => this.emit('drawn');
                if (last)
                    last.finished.then(end, () => undefined);
                else
                    end();
            }
        }
        return UsaSketchChart;
    }, { id: 'sketch-chart', text: css$x });
}

var css$w = "usa-theme-switcher{position:relative;display:inline-flex;gap:2px;padding:4px;border-radius:999px;background:rgba(15,23,42,.08);max-width:100%;overflow-x:auto;scrollbar-width:none}usa-theme-switcher .usa-ts-pill{position:absolute;top:4px;bottom:4px;left:0;border-radius:999px;background:#fff;box-shadow:0 2px 8px -2px rgba(15,23,42,.3);transition:transform .35s cubic-bezier(.3,1.3,.5,1),width .35s}usa-theme-switcher .usa-ts-opt{position:relative;z-index:1;display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border:0;border-radius:999px;background:none;color:#334155;font:600 13px/1 system-ui,sans-serif;cursor:pointer;white-space:nowrap}usa-theme-switcher .usa-ts-opt[aria-checked=true]{color:#0f172a}usa-theme-switcher .usa-ts-opt:focus-visible{outline:2px solid #6366f1;outline-offset:1px}usa-theme-switcher .usa-ts-sw{width:12px;height:12px;border-radius:50%;background:#f8fafc;box-shadow:inset 0 0 0 1px rgba(15,23,42,.25)}usa-theme-switcher [data-sw=dark]{background:#0f172a}usa-theme-switcher [data-sw=neon]{background:#d946ef;box-shadow:0 0 6px #d946ef}usa-theme-switcher [data-sw=glass]{background:linear-gradient(135deg,rgba(255,255,255,.9),rgba(147,197,253,.6))}usa-theme-switcher [data-sw=neu]{background:#e0e5ec;box-shadow:2px 2px 3px #a3b1c6,-2px -2px 3px #fff}@media (prefers-reduced-motion:reduce){usa-theme-switcher .usa-ts-pill{transition:none}}";

const NAMES = { light: 'Light', dark: 'Dark', neon: 'Neon', glass: 'Glass', neu: 'Soft' };
function defineThemeSwitcher(tag = 'usa-theme-switcher') {
    return base.defineElement(tag, (Base) => {
        class UsaThemeSwitcher extends Base {
            constructor() {
                super(...arguments);
                this._v = '';
            }
            static get observedAttributes() {
                return ['themes', 'target', 'label'];
            }
            list() {
                const l = this.str('themes').split(',').map((s) => s.trim()).filter((s) => components_fxSurface.SURFACE_THEMES.includes(s));
                return l.length ? l : [...components_fxSurface.SURFACE_THEMES];
            }
            tgt() {
                const s = this.str('target');
                return s ? document.querySelector(s) : document.documentElement;
            }
            get value() {
                return this._v;
            }
            set value(t) {
                this.select(t, false);
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const l = this.list();
                this.setAttribute('role', 'radiogroup');
                this.setAttribute('aria-label', this.str('label', 'Theme'));
                let saved = '';
                try {
                    saved = this.hasAttribute('persist') ? localStorage.getItem(this.str('persist') || 'usa-theme') || '' : '';
                }
                catch {
                    /* storage blocked */
                }
                const start = l.includes(saved) ? saved : l.includes(this.str('value')) ? this.str('value') : l.includes(this.tgt()?.getAttribute('data-usa-surface') || '') ? this.tgt()?.getAttribute('data-usa-surface') : l[0];
                this.insertAdjacentHTML('beforeend', `<span class="usa-ts-pill" aria-hidden="true" data-usa-part></span>` + l.map((t) => `<button type="button" role="radio" class="usa-ts-opt" data-theme="${t}" data-usa-part><i class="usa-ts-sw" data-sw="${t}" aria-hidden="true"></i>${NAMES[t]}</button>`).join(''));
                this.listen(this, 'click', (e) => {
                    const b = e.target.closest?.('.usa-ts-opt');
                    if (b)
                        this.select(b.dataset.theme, true, e);
                });
                this.listen(this, 'keydown', (e) => {
                    const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
                    if (!d)
                        return;
                    e.preventDefault();
                    const ls = this.list();
                    const n = ls[(ls.indexOf(this._v) + d + ls.length) % ls.length];
                    this.select(n, true);
                    this.querySelector(`.usa-ts-opt[data-theme="${n}"]`)?.focus();
                });
                this._v = '';
                this.select(start, false);
            }
            select(t, user, ev) {
                if (!this.list().includes(t) || t === this._v)
                    return;
                const prev = this._v;
                this._v = t;
                this.querySelectorAll('.usa-ts-opt').forEach((b) => {
                    const on = b.dataset.theme === t;
                    b.setAttribute('aria-checked', String(on));
                    b.tabIndex = on ? 0 : -1;
                });
                const b = this.querySelector(`.usa-ts-opt[data-theme="${t}"]`);
                const pill = this.querySelector('.usa-ts-pill');
                if (b && pill) {
                    pill.style.width = `${b.offsetWidth}px`;
                    pill.style.transform = `translateX(${b.offsetLeft}px)`;
                }
                const apply = () => components_fxSurface.applySurfaceTheme(t, this.tgt());
                const doc = document;
                if (user && prev && !this.reduced && doc.startViewTransition && !this.str('target')) {
                    const x = ev?.clientX ?? innerWidth / 2;
                    const y = ev?.clientY ?? innerHeight / 2;
                    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
                    try {
                        doc.startViewTransition(apply).ready.then(() => document.documentElement.animate({ clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] }, { duration: 500, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' }), () => undefined);
                    }
                    catch {
                        apply();
                    }
                }
                else
                    apply();
                if (this.hasAttribute('persist'))
                    try {
                        localStorage.setItem(this.str('persist') || 'usa-theme', t);
                    }
                    catch {
                        /* storage blocked */
                    }
                if (user)
                    this.emit('change', { theme: t });
            }
        }
        return UsaThemeSwitcher;
    }, { id: 'theme-switcher', text: css$w });
}

var css$v = "usa-theme-surface{position:relative;display:block;box-sizing:border-box;padding:18px 20px;border-radius:16px;background:#fff;color:#0f172a;border:1px solid rgba(15,23,42,.08);box-shadow:0 10px 30px -18px rgba(15,23,42,.45);transition:background .4s,color .4s,box-shadow .4s,border-color .4s}usa-theme-surface[data-look=dark]{background:#0f172a;color:#e2e8f0;border-color:#1e293b}usa-theme-surface[data-look=neon]{background:#0b0614;color:#f5d0fe;border-color:#d946ef;box-shadow:0 0 6px #d946ef,0 0 18px rgba(217,70,239,.55),inset 0 0 12px rgba(217,70,239,.25);animation:usa-sf-neon 2.4s ease-in-out infinite}usa-theme-surface[data-look=glass]{background:linear-gradient(135deg,rgba(255,255,255,.55),rgba(255,255,255,.18));color:#0f172a;border-color:rgba(255,255,255,.7);-webkit-backdrop-filter:blur(14px) saturate(1.4);backdrop-filter:blur(14px) saturate(1.4);box-shadow:0 12px 32px -14px rgba(30,64,175,.45);overflow:hidden}usa-theme-surface[data-look=glass]::after{content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:linear-gradient(110deg,transparent 35%,rgba(255,255,255,.45) 50%,transparent 65%);background-size:250% 100%;animation:usa-sf-sheen 5s ease-in-out infinite}usa-theme-surface[data-look=neu]{background:#e0e5ec;color:#334155;border-color:transparent;box-shadow:8px 8px 16px #a3b1c6,-8px -8px 16px #fff}@keyframes usa-sf-neon{50%{box-shadow:0 0 10px #d946ef,0 0 30px rgba(217,70,239,.7),inset 0 0 16px rgba(217,70,239,.35)}}@keyframes usa-sf-sheen{0%,60%{background-position:130% 0}100%{background-position:-60% 0}}@media (prefers-reduced-motion:reduce){usa-theme-surface,usa-theme-surface::after{animation:none!important;transition:none}}";

function defineThemeSurface(tag = 'usa-theme-surface') {
    return base.defineElement(tag, (Base) => {
        class UsaThemeSurface extends Base {
            constructor() {
                super(...arguments);
                this._t = '';
                this._mo = null;
            }
            static get observedAttributes() {
                return ['theme'];
            }
            get theme() {
                return this._t;
            }
            resolve() {
                const own = this.str('theme');
                const near = own || this.parentElement?.closest('[data-usa-surface]')?.getAttribute('data-usa-surface') || document.documentElement.getAttribute('data-usa-surface') || 'light';
                return components_fxSurface.SURFACE_THEMES.includes(near) ? near : 'light';
            }
            sync() {
                const t = this.resolve();
                if (t === this._t)
                    return;
                const first = !this._t;
                this._t = t;
                this.setAttribute('data-look', t);
                if (first)
                    return;
                if (!this.reduced)
                    this.motion(this, [{ opacity: 0.4, transform: 'scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' });
                this.emit('theme', { theme: t });
            }
            mount() {
                this.sync();
                if (typeof MutationObserver !== 'undefined') {
                    this._mo?.disconnect();
                    this._mo = new MutationObserver(() => this.sync());
                    for (let n = this.parentElement; n; n = n.parentElement)
                        this._mo.observe(n, { attributes: true, attributeFilter: ['data-usa-surface'] });
                    this.onCleanup(() => this._mo?.disconnect());
                }
                this.listen(this, 'pointerdown', () => {
                    if (this._t === 'neu' && !this.reduced)
                        this.motion(this, [{ transform: 'scale(1)' }, { transform: 'scale(.98)', offset: 0.4 }, { transform: 'scale(1)' }], { duration: 300 });
                });
            }
            changed() {
                this.sync();
            }
        }
        return UsaThemeSurface;
    }, { id: 'theme-surface', text: css$v });
}

var css$u = "usa-gyro-card{position:relative;display:block;box-sizing:border-box;padding:22px;border-radius:18px;color:#fff;background:linear-gradient(135deg,#6366f1,#ec4899);box-shadow:0 18px 40px -20px rgba(79,70,229,.8);transform:perspective(800px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg));transform-style:preserve-3d;transition:transform .25s ease-out;will-change:transform;overflow:hidden}usa-gyro-card [data-depth]{display:block;transform:translateZ(calc(var(--depth-k,14px) * var(--d,1)))}usa-gyro-card [data-depth=\"2\"]{--d:2}usa-gyro-card [data-depth=\"3\"]{--d:3}usa-gyro-card .usa-gy-glare{position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:radial-gradient(circle at var(--gx,50%) var(--gy,30%),rgba(255,255,255,.4),transparent 55%);opacity:.5;transition:opacity .3s}usa-gyro-card[data-tilted] .usa-gy-glare{opacity:1}@media (prefers-reduced-motion:reduce){usa-gyro-card{transform:none;transition:none}}";

function defineGyroCard(tag = 'usa-gyro-card') {
    return base.defineElement(tag, (Base) => {
        class UsaGyroCard extends Base {
            constructor() {
                super(...arguments);
                this._src = 'none';
            }
            static get observedAttributes() {
                return ['max', 'glare'];
            }
            get source() {
                return this._src;
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                if (this.str('glare') !== 'false')
                    this.insertAdjacentHTML('beforeend', '<span class="usa-gy-glare" aria-hidden="true" data-usa-part></span>');
                if (this.reduced)
                    return;
                const max = Math.max(1, Math.min(40, this.num('max', 15)));
                this.listen(this, 'pointermove', (e) => {
                    if (this._src === 'gyro' || e.pointerType === 'touch')
                        return;
                    const r = this.getBoundingClientRect();
                    if (!r.width || !r.height)
                        return;
                    const px = (e.clientX - r.left) / r.width - 0.5;
                    const py = (e.clientY - r.top) / r.height - 0.5;
                    this.tilt(-py * 2 * max, px * 2 * max, 'pointer');
                });
                this.listen(this, 'pointerleave', () => {
                    if (this._src === 'pointer')
                        this.tilt(0, 0, 'pointer');
                });
                if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
                    let active = false;
                    const on = () => {
                        if (active)
                            return;
                        active = true;
                        this.inView((v) => {
                            if (v)
                                this.listen(window, 'deviceorientation', (e) => {
                                    if (e.beta == null || e.gamma == null)
                                        return;
                                    const t = components_fxGesture.orientationToTilt(e.beta, e.gamma, max);
                                    this.tilt(t.rx, t.ry, 'gyro');
                                });
                        });
                    };
                    const DOE = window.DeviceOrientationEvent;
                    if (typeof DOE.requestPermission === 'function') {
                        this.listen(this, 'click', () => {
                            if (!active)
                                DOE.requestPermission().then((s) => s === 'granted' && on(), () => undefined);
                        });
                    }
                    else
                        on();
                }
            }
            wobble() {
                if (this.reduced)
                    return null;
                const m = Math.max(1, Math.min(40, this.num('max', 15)));
                const f = (x, y) => ({ transform: `perspective(800px) rotateX(${x}deg) rotateY(${y}deg)` });
                return this.motion(this, [f(0, 0), f(-m, m), f(m * 0.6, -m * 0.8), f(-m * 0.3, m * 0.4), f(0, 0)], { duration: 1100, easing: 'ease-in-out' });
            }
            tilt(rx, ry, source = 'none') {
                this._src = (['gyro', 'pointer'].includes(source) ? source : 'none');
                this.style.setProperty('--rx', `${rx.toFixed(1)}deg`);
                this.style.setProperty('--ry', `${ry.toFixed(1)}deg`);
                this.style.setProperty('--gx', `${50 + ry * 2}%`);
                this.style.setProperty('--gy', `${50 - rx * 2}%`);
                this.setFlag('data-tilted', Math.abs(rx) + Math.abs(ry) > 0.5);
                this.emit('tilt', { rx, ry, source: this._src });
            }
        }
        return UsaGyroCard;
    }, { id: 'gyro-card', text: css$u });
}

var css$t = "usa-gesture-sticker{display:inline-block;touch-action:none;cursor:grab;outline:none;-webkit-user-select:none;user-select:none;transform-origin:50% 50%;filter:drop-shadow(0 6px 8px rgba(15,23,42,.25));will-change:transform}usa-gesture-sticker[data-held]{cursor:grabbing;filter:drop-shadow(0 16px 18px rgba(15,23,42,.35))}usa-gesture-sticker:focus-visible{outline:2px dashed #6366f1;outline-offset:4px}usa-gesture-sticker img{display:block;-webkit-user-drag:none;pointer-events:none}";

function defineGestureSticker(tag = 'usa-gesture-sticker') {
    return base.defineElement(tag, (Base) => {
        class UsaGestureSticker extends Base {
            constructor() {
                super(...arguments);
                this._st = { x: 0, y: 0, scale: 1, angle: 0 };
            }
            static get observedAttributes() {
                return ['min', 'max', 'label'];
            }
            get x() {
                return this._st.x;
            }
            get y() {
                return this._st.y;
            }
            get scale() {
                return this._st.scale;
            }
            get angle() {
                return this._st.angle;
            }
            mount() {
                this.setAttribute('role', 'group');
                this.setAttribute('aria-roledescription', 'sticker');
                this.setAttribute('aria-label', `${this.str('label', 'Sticker')} — drag, pinch or twist; arrows, + / −, [ / ] on the keyboard`);
                if (!this.hasAttribute('tabindex'))
                    this.tabIndex = 0;
                const pts = new Map();
                let start = null;
                const begin = () => {
                    const v = [...pts.values()];
                    start = v.length ? { st: { ...this._st }, a: v[0], b: v[1] } : null;
                    this.setFlag('data-held', v.length > 0);
                };
                this.listen(this, 'pointerdown', (e) => {
                    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
                    try {
                        this.setPointerCapture?.(e.pointerId);
                    }
                    catch {
                        /* synthetic */
                    }
                    begin();
                });
                this.listen(this, 'pointermove', (e) => {
                    if (!pts.has(e.pointerId) || !start)
                        return;
                    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
                    const v = [...pts.values()];
                    const s0 = start.st;
                    if (v.length >= 2 && start.b) {
                        const mx = (v[0].x + v[1].x - start.a.x - start.b.x) / 2;
                        const my = (v[0].y + v[1].y - start.a.y - start.b.y) / 2;
                        this.set({ x: s0.x + mx, y: s0.y + my, scale: s0.scale * components_fxGesture.pinchScale(start.a, start.b, v[0], v[1]), angle: s0.angle + components_fxGesture.pinchAngle(start.a, start.b, v[0], v[1]) }, false);
                    }
                    else
                        this.set({ ...s0, x: s0.x + v[0].x - start.a.x, y: s0.y + v[0].y - start.a.y }, false);
                });
                const up = (e) => {
                    pts.delete(e.pointerId);
                    begin();
                    if (!pts.size)
                        this.settle();
                };
                this.listen(this, 'pointerup', up);
                this.listen(this, 'pointercancel', up);
                this.listen(this, 'wheel', (e) => {
                    e.preventDefault();
                    if (e.shiftKey)
                        this.set({ ...this._st, angle: this._st.angle + (e.deltaY > 0 ? 8 : -8) }, true);
                    else
                        this.set({ ...this._st, scale: this._st.scale * (e.deltaY < 0 ? 1.1 : 1 / 1.1) }, true);
                }, { passive: false });
                this.listen(this, 'keydown', (e) => {
                    const s = { ...this._st };
                    const k = e.key;
                    if (k === 'ArrowLeft')
                        s.x -= 10;
                    else if (k === 'ArrowRight')
                        s.x += 10;
                    else if (k === 'ArrowUp')
                        s.y -= 10;
                    else if (k === 'ArrowDown')
                        s.y += 10;
                    else if (k === '+' || k === '=')
                        s.scale *= 1.15;
                    else if (k === '-')
                        s.scale /= 1.15;
                    else if (k === '[')
                        s.angle -= 15;
                    else if (k === ']')
                        s.angle += 15;
                    else if (k === '0')
                        return void (e.preventDefault(), this.reset());
                    else
                        return;
                    e.preventDefault();
                    this.set(s, true);
                });
                this.set(this._st, false, true);
            }
            settle() {
                if (this.reduced)
                    return;
                this.motion(this, [{ filter: 'brightness(1.08)' }, { filter: 'none' }], { duration: 300 });
            }
            set(s, ease, silent = false) {
                const min = Math.max(0.1, this.num('min', 0.5));
                const max = Math.max(min, this.num('max', 3));
                const n = { x: Math.round(s.x * 10) / 10, y: Math.round(s.y * 10) / 10, scale: Math.round(base.clamp(s.scale, min, max) * 1000) / 1000, angle: Math.round((((s.angle % 360) + 540) % 360 - 180) * 10) / 10 };
                this._st = n;
                this.style.transition = ease && !this.reduced ? 'transform .35s cubic-bezier(.3,1.4,.5,1)' : 'none';
                this.style.transform = `translate(${n.x}px,${n.y}px) rotate(${n.angle}deg) scale(${n.scale})`;
                if (!silent)
                    this.emit('transform', { ...n });
            }
            transformTo(s) {
                this.set({ ...this._st, ...s }, true);
            }
            reset() {
                this.set({ x: 0, y: 0, scale: 1, angle: 0 }, true);
            }
        }
        return UsaGestureSticker;
    }, { id: 'gesture-sticker', text: css$t });
}

var css$s = "usa-panorama{position:relative;display:block;height:220px;border-radius:14px;overflow:hidden;background:#0f172a;cursor:grab;touch-action:pan-y;outline:none;-webkit-user-select:none;user-select:none}usa-panorama[data-dragging]{cursor:grabbing}usa-panorama:focus-visible{box-shadow:0 0 0 3px #6366f1}usa-panorama .usa-pano-view{position:absolute;inset:0;background-repeat:repeat-x;background-size:auto 100%;background-position:0 50%}usa-panorama .usa-pano-procedural{background-size:400% 100%;background-repeat:repeat-x;background-image:radial-gradient(circle at 12% 30%,#fde68a 0 3%,transparent 3.5%),linear-gradient(170deg,transparent 58%,#166534 58.5% 64%,transparent 64.5%),linear-gradient(10deg,transparent 52%,#15803d 52.5% 60%,transparent 60.5%),linear-gradient(160deg,transparent 46%,#475569 46.5% 70%,transparent 70.5%),linear-gradient(20deg,transparent 48%,#64748b 48.5% 70%,transparent 70.5%),linear-gradient(#38bdf8,#bae6fd 55%,#86efac 55.5%,#22c55e)}usa-panorama .usa-pano-compass{position:absolute;right:10px;top:10px;width:34px;height:34px;border-radius:50%;background:rgba(15,23,42,.55);box-shadow:inset 0 0 0 2px rgba(255,255,255,.6)}usa-panorama .usa-pano-compass i{position:absolute;inset:4px;border-radius:50%;transition:transform .25s linear;background:conic-gradient(#ef4444 0 6deg,transparent 6deg 354deg,#ef4444 354deg)}usa-panorama .usa-pano-xr{position:absolute;left:10px;bottom:10px;padding:6px 10px;border:0;border-radius:999px;background:rgba(15,23,42,.7);color:#fff;font:600 12px/1 system-ui,sans-serif;cursor:pointer}";

function definePanorama(tag = 'usa-panorama') {
    return base.defineElement(tag, (Base) => {
        class UsaPanorama extends Base {
            constructor() {
                super(...arguments);
                this._yaw = 0;
                this._raf = 0;
            }
            static get observedAttributes() {
                return ['src', 'autorotate', 'label'];
            }
            get yaw() {
                return this._yaw;
            }
            set yaw(v) {
                this.lookAt(v);
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this.setAttribute('role', 'img');
                this.setAttribute('aria-label', this.str('label', '360° panorama'));
                this.setAttribute('aria-roledescription', 'panorama');
                if (!this.hasAttribute('tabindex'))
                    this.tabIndex = 0;
                const src = this.str('src');
                this.insertAdjacentHTML('beforeend', `<div class="usa-pano-view${src ? '' : ' usa-pano-procedural'}" data-usa-part></div><span class="usa-pano-compass" aria-hidden="true" data-usa-part><i></i></span><button type="button" class="usa-pano-xr" hidden data-usa-part>View in XR</button>`);
                const view = this.querySelector('.usa-pano-view');
                if (src)
                    view.style.backgroundImage = `url("${src.replace(/"/g, '%22')}")`;
                let vel = 0;
                let drag = null;
                this.listen(this, 'pointerdown', (e) => {
                    if (e.target.closest?.('.usa-pano-xr'))
                        return;
                    drag = { x: e.clientX, yaw: this._yaw, t: performance.now(), lx: e.clientX };
                    vel = 0;
                    this.setFlag('data-dragging', true);
                    try {
                        this.setPointerCapture?.(e.pointerId);
                    }
                    catch {
                        /* synthetic */
                    }
                });
                this.listen(this, 'pointermove', (e) => {
                    if (!drag)
                        return;
                    const w = this.clientWidth || 300;
                    const now = performance.now();
                    vel = ((drag.lx - e.clientX) / w) * 90 / Math.max(1, now - drag.t) * 16;
                    drag.t = now;
                    drag.lx = e.clientX;
                    this.lookAt(drag.yaw + ((drag.x - e.clientX) / w) * 90);
                });
                const up = () => {
                    if (!drag)
                        return;
                    drag = null;
                    this.setFlag('data-dragging', false);
                };
                this.listen(this, 'pointerup', up);
                this.listen(this, 'pointercancel', up);
                this.listen(this, 'keydown', (e) => {
                    if (e.key === 'ArrowLeft')
                        this.lookAt(this._yaw - 15);
                    else if (e.key === 'ArrowRight')
                        this.lookAt(this._yaw + 15);
                    else
                        return;
                    e.preventDefault();
                });
                const xr = this.querySelector('.usa-pano-xr');
                components_fxSpatial.xrSupport().then((m) => {
                    if (m === 'none' || m === 'inline' || !this.isConnected)
                        return;
                    xr.hidden = false;
                    this.emit('xr', { mode: m });
                });
                this.listen(xr, 'click', () => this.emit('xr-request', { yaw: this._yaw }));
                this.lookAt(this._yaw);
                if (this.reduced)
                    return;
                const rate = this.num('autorotate', 6);
                this.inView((v) => {
                    cancelAnimationFrame(this._raf);
                    if (!v)
                        return;
                    let last = performance.now();
                    const tick = (t) => {
                        const dt = Math.min(64, t - last);
                        last = t;
                        if (!drag) {
                            if (Math.abs(vel) > 0.02) {
                                this.lookAt(this._yaw + vel * (dt / 16));
                                vel *= 0.94;
                            }
                            else if (rate && !this.matches(':focus-within, :hover'))
                                this.lookAt(this._yaw + (rate * dt) / 1000, true);
                        }
                        this._raf = requestAnimationFrame(tick);
                    };
                    this._raf = requestAnimationFrame(tick);
                });
                this.onCleanup(() => cancelAnimationFrame(this._raf));
            }
            lookAt(deg, quiet = false) {
                this._yaw = ((deg % 360) + 360) % 360;
                const view = this.querySelector('.usa-pano-view');
                if (view) {
                    const tile = view.clientHeight ? view.clientHeight * 4 : 1200;
                    view.style.backgroundPositionX = `${components_fxSpatial.yawToOffset(this._yaw, tile)}px`;
                }
                const c = this.querySelector('.usa-pano-compass i');
                if (c)
                    c.style.transform = `rotate(${-this._yaw}deg)`;
                if (!quiet)
                    this.emit('look', { yaw: Math.round(this._yaw) });
            }
        }
        return UsaPanorama;
    }, { id: 'panorama', text: css$s });
}

var css$r = "usa-spatial-card{position:relative;display:block;box-sizing:border-box;padding:20px 22px;margin-bottom:28px;border-radius:24px;color:#0f172a;background:linear-gradient(140deg,rgba(255,255,255,.62),rgba(255,255,255,.28));border:1px solid rgba(255,255,255,.75);-webkit-backdrop-filter:blur(18px) saturate(1.5);backdrop-filter:blur(18px) saturate(1.5);box-shadow:0 22px 44px -26px rgba(15,23,42,.6),inset 0 1px 0 rgba(255,255,255,.8);transform:perspective(900px) translateZ(0);transform-style:preserve-3d;transition:transform .45s cubic-bezier(.2,.9,.25,1),box-shadow .45s}usa-spatial-card[data-active]{transform:perspective(900px) translateZ(18px);box-shadow:0 34px 60px -28px rgba(15,23,42,.55),inset 0 1px 0 rgba(255,255,255,.9)}usa-spatial-card .usa-sp-gaze{position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:radial-gradient(circle at var(--gx,50%) var(--gy,40%),rgba(255,255,255,.55),transparent 45%);opacity:0;transition:opacity .3s}usa-spatial-card[data-active] .usa-sp-gaze{opacity:1}usa-spatial-card [data-depth]{position:relative;display:block;transform:translateZ(calc(10px * var(--d,1)));transition:transform .45s}usa-spatial-card [data-depth=\"2\"]{--d:2}usa-spatial-card [data-depth=\"3\"]{--d:3}usa-spatial-card .usa-sp-ornament{position:absolute;left:50%;bottom:-22px;display:flex;gap:6px;padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.7);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);box-shadow:0 10px 20px -12px rgba(15,23,42,.5);transform:translateX(-50%) translateZ(30px);transition:transform .45s}usa-spatial-card[data-active] .usa-sp-ornament{transform:translateX(-50%) translateZ(40px) translateY(4px)}@media (prefers-reduced-motion:reduce){usa-spatial-card,usa-spatial-card *{transition:none!important}usa-spatial-card[data-active]{transform:none}}";

function defineSpatialCard(tag = 'usa-spatial-card') {
    return base.defineElement(tag, (Base) => {
        class UsaSpatialCard extends Base {
            constructor() {
                super(...arguments);
                this._a = false;
            }
            get active() {
                return this._a;
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this.insertAdjacentHTML('afterbegin', '<span class="usa-sp-gaze" aria-hidden="true" data-usa-part></span>');
                const orn = this.querySelector(':scope > [slot=ornament]');
                if (orn)
                    orn.classList.add('usa-sp-ornament');
                const set = (on) => {
                    if (on === this._a)
                        return;
                    this._a = on;
                    this.setFlag('data-active', on);
                    this.emit('focus-depth', { active: on });
                };
                this.listen(this, 'pointermove', (e) => {
                    const r = this.getBoundingClientRect();
                    if (!r.width)
                        return;
                    this.style.setProperty('--gx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
                    this.style.setProperty('--gy', `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
                });
                this.listen(this, 'pointerenter', () => set(true));
                this.listen(this, 'pointerleave', () => set(this.matches(':focus-within')));
                this.listen(this, 'focusin', () => set(true));
                this.listen(this, 'focusout', (e) => {
                    if (!this.contains(e.relatedTarget))
                        set(false);
                });
                this.listen(this, 'pointerdown', () => {
                    if (!this.reduced)
                        this.motion(this, [{ transform: 'perspective(900px) translateZ(18px)' }, { transform: 'perspective(900px) translateZ(-6px)', offset: 0.4 }, { transform: 'perspective(900px) translateZ(18px)' }], { duration: 320, easing: 'ease-out' });
                });
            }
        }
        return UsaSpatialCard;
    }, { id: 'spatial-card', text: css$r });
}

var css$q = "usa-code-export{display:block;max-width:100%;border-radius:12px;overflow:hidden;background:#0f172a;color:#e2e8f0;font:13px/1.4 system-ui,sans-serif}usa-code-export>:not([data-usa-part]){display:block;margin:12px auto}usa-code-export:not([for])>:not([data-usa-part]){padding:0 12px}usa-code-export .usa-ce-bar{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 8px;background:#1e293b}usa-code-export [role=tablist]{display:flex;gap:2px}usa-code-export button{padding:5px 10px;border:0;border-radius:6px;background:none;color:#94a3b8;font:600 12px/1 system-ui,sans-serif;cursor:pointer}usa-code-export [aria-selected=true]{background:#334155;color:#fff}usa-code-export .usa-ce-copy{background:#4f46e5;color:#fff}usa-code-export button:focus-visible,usa-code-export pre:focus-visible{outline:2px solid #818cf8;outline-offset:1px}usa-code-export pre{margin:0;padding:10px 12px;max-height:220px;overflow:auto;font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre;color:#e2e8f0;background:#0f172a}";

const RUNTIME_ATTR = /^(data-usa-|data-look$|data-tint$|data-paper$|data-booted$|data-drawn$|data-active$|data-held$|data-tilted$|data-zoomed$|data-dragging$|data-picked$|data-live$|data-lit$|aria-(checked|valuetext|valuenow|label|roledescription|hidden)$|role$|tabindex$|style$)/;
const RUNTIME_CLASS = /^usa-/;
/** A clean, portable description of `el` (runtime parts stripped) (8.9). */
function describeComponent(el) {
    const attrs = {};
    for (const a of Array.from(el.attributes)) {
        if (RUNTIME_ATTR.test(a.name))
            continue;
        if (a.name === 'class') {
            const c = a.value.split(/\s+/).filter((x) => x && !RUNTIME_CLASS.test(x)).join(' ');
            if (c)
                attrs.class = c;
            continue;
        }
        attrs[a.name] = a.value;
    }
    const children = [];
    el.childNodes.forEach((n) => {
        if (n.nodeType === 3) {
            const t = (n.textContent || '').replace(/\s+/g, ' ');
            if (t.trim())
                children.push(t.trim());
        }
        else if (n.nodeType === 1) {
            const e = n;
            const cls = (e.getAttribute('class') || '').split(/\s+/).filter(Boolean);
            // generated by a component: a marked part, or only usa-* classes and runtime attributes (bars, readouts, overlays)
            if (e.hasAttribute('data-usa-part') || (cls.length && cls.every((c) => RUNTIME_CLASS.test(c)) && Array.from(e.attributes).every((a) => a.name === 'class' || RUNTIME_ATTR.test(a.name))))
                return;
            children.push(describeComponent(e));
        }
    });
    return { tag: el.localName, attrs, children };
}
const esc$4 = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const VOID = new Set(['img', 'br', 'hr', 'input', 'source', 'meta', 'link', 'wbr', 'area', 'col', 'embed', 'track']);
function markup(n, jsx, ind) {
    if (typeof n === 'string')
        return ind + (jsx ? n.replace(/[{}<>]/g, (c) => `{'${c}'}`) : esc$4(n));
    const at = Object.entries(n.attrs)
        .map(([k, v]) => {
        const key = jsx && k === 'class' ? 'className' : jsx && k === 'for' ? 'htmlFor' : k;
        return v === '' ? ` ${key}` : ` ${key}="${esc$4(v)}"`;
    })
        .join('');
    if (VOID.has(n.tag))
        return `${ind}<${n.tag}${at}${jsx ? ' /' : ''}>`;
    if (!n.children.length)
        return `${ind}<${n.tag}${at}></${n.tag}>`;
    if (n.children.length === 1 && typeof n.children[0] === 'string')
        return `${ind}<${n.tag}${at}>${markup(n.children[0], jsx, '')}</${n.tag}>`;
    return `${ind}<${n.tag}${at}>\n${n.children.map((c) => markup(c, jsx, ind + '  ')).join('\n')}\n${ind}</${n.tag}>`;
}
/** Copy-paste code for a live element in `format` (8.9). */
function exportComponent(el, format = 'html') {
    const d = describeComponent(el);
    if (format === 'json')
        return JSON.stringify({ $schema: 'motionary/component@1', ...d }, null, 2);
    if (format === 'react')
        return `import { useEffect } from 'react';\nimport { defineWidgets } from 'motionary/components/widgets';\n\nexport function Demo() {\n  useEffect(() => defineWidgets(), []);\n  return (\n${markup(d, true, '    ')}\n  );\n}`;
    if (format === 'vue')
        return `<script setup>\nimport { defineWidgets } from 'motionary/components/widgets';\ndefineWidgets();\n</script>\n\n<template>\n${markup(d, false, '  ')}\n</template>`;
    return `${markup(d, false, '')}\n\n<script type="module">\n  import { defineWidgets } from 'https://cdn.jsdelivr.net/npm/motionary/dist/components/widgets.js';\n  defineWidgets();\n</script>`;
}
const FORMATS = ['html', 'react', 'vue', 'json'];
const LABELS = { html: 'HTML', react: 'React', vue: 'Vue', json: 'JSON' };
function defineCodeExport(tag = 'usa-code-export') {
    return base.defineElement(tag, (Base) => {
        class UsaCodeExport extends Base {
            constructor() {
                super(...arguments);
                this._f = 'html';
                this._mo = null;
            }
            static get observedAttributes() {
                return ['for', 'formats'];
            }
            fmts() {
                const l = this.str('formats').split(',').map((s) => s.trim()).filter((s) => FORMATS.includes(s));
                return l.length ? l : ['html', 'react', 'vue'];
            }
            src() {
                const f = this.str('for');
                return f ? document.querySelector(f) : this.querySelector(':scope > :not([data-usa-part])');
            }
            get format() {
                return this._f;
            }
            set format(f) {
                if (!this.fmts().includes(f))
                    return;
                const changed = f !== this._f;
                this._f = f;
                this.render();
                const pre = this.querySelector('.usa-ce-code');
                if (changed && pre && !this.reduced)
                    this.motion(pre, [{ opacity: 0.35, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: 'ease-out' });
            }
            get code() {
                const s = this.src();
                return s ? exportComponent(s, this._f) : '';
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const fm = this.fmts();
                if (!fm.includes(this._f))
                    this._f = fm[0];
                const id = `usa-ce-${Math.random().toString(36).slice(2, 8)}`;
                this.insertAdjacentHTML('beforeend', `<div class="usa-ce-bar" data-usa-part><div role="tablist" aria-label="Code format">${fm.map((f) => `<button type="button" role="tab" data-f="${f}" aria-controls="${id}">${LABELS[f]}</button>`).join('')}</div><button type="button" class="usa-ce-copy">Copy</button></div><pre class="usa-ce-code" id="${id}" role="tabpanel" tabindex="0" data-usa-part><code></code></pre>`);
                this.listen(this, 'click', (e) => {
                    const t = e.target;
                    const tab = t.closest?.('[data-f]');
                    if (tab && this.contains(tab))
                        this.format = tab.dataset.f;
                    if (t.closest?.('.usa-ce-copy'))
                        void this.copy();
                });
                this.listen(this, 'keydown', (e) => {
                    if (!e.target.closest?.('[role=tab]') || (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft'))
                        return;
                    const l = this.fmts();
                    this.format = l[(l.indexOf(this._f) + (e.key === 'ArrowRight' ? 1 : -1) + l.length) % l.length];
                    this.querySelector(`[data-f="${this._f}"]`)?.focus();
                });
                const s = this.src();
                if (s && typeof MutationObserver !== 'undefined') {
                    this._mo?.disconnect();
                    this._mo = new MutationObserver(() => this.render());
                    this._mo.observe(s, { attributes: true, attributeFilter: undefined });
                    this.onCleanup(() => this._mo?.disconnect());
                }
                this.render();
            }
            render() {
                this.querySelectorAll('[data-f]').forEach((b) => {
                    const on = b.dataset.f === this._f;
                    b.setAttribute('aria-selected', String(on));
                    b.tabIndex = on ? 0 : -1;
                });
                const c = this.querySelector('.usa-ce-code code');
                if (c)
                    c.textContent = this.code;
            }
            async copy() {
                let ok = false;
                try {
                    await navigator.clipboard.writeText(this.code);
                    ok = true;
                }
                catch {
                    ok = false;
                }
                const b = this.querySelector('.usa-ce-copy');
                if (b) {
                    b.textContent = ok ? 'Copied ✓' : 'Select & copy';
                    setTimeout(() => (b.textContent = 'Copy'), 1500);
                }
                if (ok && !this.reduced)
                    this.motion(this.querySelector('.usa-ce-code'), [{ boxShadow: '0 0 0 2px #22c55e' }, { boxShadow: '0 0 0 0 transparent' }], { duration: 600 });
                this.emit('copy', { format: this._f, ok });
                return ok;
            }
        }
        return UsaCodeExport;
    }, { id: 'code-export', text: css$q });
}

var css$p = "usa-prop-panel{display:block;max-width:100%;font:13px/1.4 system-ui,sans-serif;color:#0f172a}usa-prop-panel .usa-pp{display:grid;gap:8px;margin:0;padding:12px;border:1px solid rgba(15,23,42,.12);border-radius:12px;background:#fff}usa-prop-panel .usa-pp-row{display:grid;grid-template-columns:minmax(64px,auto) 1fr auto;align-items:center;gap:8px}usa-prop-panel label{font-weight:600;color:#334155;font-family:ui-monospace,monospace;font-size:12px}usa-prop-panel input[type=text],usa-prop-panel input[type=number],usa-prop-panel select{min-width:0;width:100%;box-sizing:border-box;padding:5px 8px;border:1px solid #cbd5e1;border-radius:6px;font:inherit}usa-prop-panel input[type=range]{width:100%;min-width:0;accent-color:#4f46e5}usa-prop-panel input[type=checkbox]{grid-column:2;justify-self:start;width:16px;height:16px;accent-color:#4f46e5}usa-prop-panel output{min-width:2.5em;text-align:right;font:12px ui-monospace,monospace;color:#64748b}usa-prop-panel .usa-pp-empty{margin:0;color:#64748b}usa-prop-panel .usa-pp-row{border-radius:6px}usa-prop-panel .usa-pp-reset{justify-self:start;padding:5px 12px;border:1px solid #cbd5e1;border-radius:7px;background:#fff;font:inherit;cursor:pointer}";

/** "value:number:0:100, theme:select:leaf|ocean, on:boolean" → prop specs (8.9). */
function parseProps(s) {
    const T = ['text', 'number', 'range', 'color', 'boolean', 'select'];
    return s
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => {
        const [name, type = 'text', ...rest] = p.split(':').map((x) => x.trim());
        const t = (T.includes(type) ? type : 'text');
        return { name, type: t, options: t === 'select' ? (rest[0] || '').split('|').filter(Boolean) : rest };
    })
        .filter((p) => /^[a-z][\w-]*$/i.test(p.name));
}
const esc$3 = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
function definePropPanel(tag = 'usa-prop-panel') {
    return base.defineElement(tag, (Base) => {
        class UsaPropPanel extends Base {
            constructor() {
                super(...arguments);
                this._start = {};
            }
            static get observedAttributes() {
                return ['for', 'props', 'label'];
            }
            target() {
                const f = this.str('for');
                if (f === 'previous')
                    return this.previousElementSibling;
                return f ? document.querySelector(f) : null;
            }
            get props() {
                const s = this.str('props');
                if (s)
                    return parseProps(s);
                const t = this.target();
                const obs = t?.constructor?.observedAttributes || [];
                return obs.map((name) => ({ name, type: 'text', options: [] }));
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const t = this.target();
                const ps = this.props;
                this._start = {};
                ps.forEach((p) => (this._start[p.name] = t?.getAttribute(p.name) ?? null));
                const field = (p, i) => {
                    const id = `usa-pp-${i}-${p.name}`;
                    const v = t?.getAttribute(p.name);
                    let input = '';
                    if (p.type === 'boolean')
                        input = `<input id="${id}" type="checkbox" role="switch" data-p="${p.name}"${v != null ? ' checked' : ''}>`;
                    else if (p.type === 'select')
                        input = `<select id="${id}" data-p="${p.name}">${p.options.map((o) => `<option${o === v ? ' selected' : ''}>${esc$3(o)}</option>`).join('')}</select>`;
                    else {
                        const [mn, mx] = p.options;
                        const range = p.type === 'range' || (p.type === 'number' && mn != null && mx != null);
                        input = `<input id="${id}" type="${p.type === 'color' ? 'color' : range ? 'range' : p.type === 'number' ? 'number' : 'text'}" data-p="${p.name}" value="${esc$3(v ?? '')}"${mn != null ? ` min="${esc$3(mn)}"` : ''}${mx != null ? ` max="${esc$3(mx)}"` : ''}${range ? ' step="any"' : ''}><output for="${id}">${esc$3(v ?? '')}</output>`;
                    }
                    return `<div class="usa-pp-row"><label for="${id}">${esc$3(p.name)}</label>${input}</div>`;
                };
                this.insertAdjacentHTML('beforeend', `<form class="usa-pp" aria-label="${esc$3(this.str('label', 'Properties'))}" data-usa-part>${ps.map(field).join('') || '<p class="usa-pp-empty">No properties</p>'}<button type="button" class="usa-pp-reset">Reset</button></form>`);
                const form = this.querySelector('form');
                this.listen(form, 'submit', (e) => e.preventDefault());
                this.listen(this.querySelector('.usa-pp-reset'), 'click', () => this.reset());
                this.listen(form, 'input', (e) => this.apply(e.target));
                this.listen(form, 'change', (e) => this.apply(e.target));
            }
            apply(inp) {
                const name = inp.dataset?.p;
                const t = this.target();
                if (!name || !t)
                    return;
                let value;
                if (inp instanceof HTMLInputElement && inp.type === 'checkbox')
                    value = inp.checked ? '' : null;
                else
                    value = inp.value;
                if (value == null)
                    t.removeAttribute(name);
                else
                    t.setAttribute(name, value);
                const out = inp.nextElementSibling;
                if (out?.tagName === 'OUTPUT')
                    out.textContent = value ?? '';
                this.emit('prop', { name, value });
            }
            reset() {
                const t = this.target();
                if (!t)
                    return;
                for (const [k, v] of Object.entries(this._start)) {
                    if (v == null)
                        t.removeAttribute(k);
                    else
                        t.setAttribute(k, v);
                }
                this.changed('props');
                if (!this.reduced)
                    this.querySelectorAll('.usa-pp-row').forEach((r, i) => this.motion(r, [{ backgroundColor: 'rgba(99,102,241,.18)' }, { backgroundColor: 'transparent' }], { duration: 600, delay: i * 40 }));
            }
        }
        return UsaPropPanel;
    }, { id: 'prop-panel', text: css$p });
}

var css$o = "usa-motion{display:block}";

function defineMotion(tag = 'usa-motion') {
    return base.defineElement(tag, (Base) => {
        class UsaMotion extends Base {
            constructor() {
                super(...arguments);
                this._errors = [];
            }
            static get observedAttributes() {
                return ['rules'];
            }
            get parsed() {
                return components_dsl.parseMotion(this.str('rules')).rules;
            }
            get errors() {
                return this._errors.slice();
            }
            mount() {
                this._errors = [];
                this.onCleanup(components_dsl.bindMotion(this, this.str('rules'), (m) => {
                    this._errors.push(m);
                    this.emit('motion-error', { message: m });
                }));
            }
        }
        return UsaMotion;
    }, { id: 'motion', text: css$o });
}

var css$n = "usa-plugin-store{display:block;max-width:100%;font:14px/1.4 system-ui,sans-serif;color:#0f172a}usa-plugin-store .usa-ps-q{width:100%;box-sizing:border-box;padding:9px 12px;border:1px solid #cbd5e1;border-radius:10px;font:inherit}usa-plugin-store .usa-ps-q:focus-visible{outline:2px solid #6366f1;outline-offset:1px}usa-plugin-store .usa-ps-count{margin:6px 2px;font-size:12px;color:#64748b}usa-plugin-store .usa-ps-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(220px,100%),1fr));gap:10px;margin:0;padding:0;list-style:none}usa-plugin-store .usa-ps-card{display:flex;flex-direction:column;gap:6px;padding:12px;border:1px solid rgba(15,23,42,.1);border-radius:12px;background:#fff;box-shadow:0 6px 16px -12px rgba(15,23,42,.4);min-width:0}usa-plugin-store .usa-ps-head{display:flex;align-items:center;gap:6px;flex-wrap:wrap}usa-plugin-store .usa-ps-head small{margin-left:auto;color:#94a3b8;font-size:11px}usa-plugin-store .usa-ps-badge{padding:1px 6px;border-radius:999px;background:#eef2ff;color:#4338ca;font-size:11px;font-weight:600}usa-plugin-store .usa-ps-card p{margin:0;color:#475569;font-size:13px}usa-plugin-store .usa-ps-fx{display:flex;flex-wrap:wrap;gap:4px}usa-plugin-store .usa-ps-fx code{padding:1px 6px;border-radius:6px;background:#f1f5f9;font-size:11px}usa-plugin-store .usa-ps-install{transition:opacity .3s,background-color .3s;align-self:flex-start;padding:6px 12px;border:0;border-radius:8px;background:#4f46e5;color:#fff;font:600 12px/1 system-ui,sans-serif;cursor:pointer}usa-plugin-store .usa-ps-install[data-done]{background:#16a34a;cursor:default}usa-plugin-store .usa-ps-install[data-busy]{opacity:.7}usa-plugin-store .usa-ps-install:focus-visible{outline:2px solid #6366f1;outline-offset:2px}";

const esc$2 = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
function definePluginStore(tag = 'usa-plugin-store') {
    return base.defineElement(tag, (Base) => {
        class UsaPluginStore extends Base {
            constructor() {
                super(...arguments);
                this._list = components_marketplace.MARKETPLACE;
                this.loader = null;
            }
            static get observedAttributes() {
                return ['query', 'label'];
            }
            get plugins() {
                return this._list.slice();
            }
            set plugins(v) {
                this._list = Array.isArray(v) ? v : components_marketplace.MARKETPLACE;
                if (this.isConnected)
                    this.changed('plugins');
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this.setAttribute('role', 'search');
                this.setAttribute('aria-label', this.str('label', 'Plugin marketplace'));
                this.insertAdjacentHTML('beforeend', `<input class="usa-ps-q" type="search" placeholder="Search plugins…" aria-label="Search plugins" value="${esc$2(this.str('query'))}" data-usa-part><p class="usa-ps-count" aria-live="polite" data-usa-part></p><ul class="usa-ps-list" data-usa-part></ul>`);
                const q = this.querySelector('.usa-ps-q');
                this.listen(q, 'input', () => this.search(q.value));
                this.listen(this, 'click', (e) => {
                    const b = e.target.closest?.('.usa-ps-install');
                    if (b && !b.disabled)
                        void this.install(b.dataset.name);
                });
                this.search(q.value);
            }
            search(query) {
                const res = components_marketplace.searchPlugins(query, this._list);
                const ul = this.querySelector('.usa-ps-list');
                const have = components_marketplace.installedPlugins();
                if (ul) {
                    ul.innerHTML = res
                        .map((p) => `<li class="usa-ps-card"><div class="usa-ps-head"><b>${esc$2(p.title)}</b>${p.official ? '<span class="usa-ps-badge">official</span>' : ''}<small>${esc$2(p.since ? `since ${p.since}` : '')}</small></div><p>${esc$2(p.description)}</p><div class="usa-ps-fx">${p.effects.map((f) => `<code>${esc$2(f)}</code>`).join('')}</div><button type="button" class="usa-ps-install" data-name="${esc$2(p.name)}"${have[p.name] ? ' disabled data-done' : ''}>${have[p.name] ? 'Installed ✓' : 'Install'}</button></li>`)
                        .join('');
                    if (!this.reduced)
                        ul.querySelectorAll('.usa-ps-card').forEach((c, i) => this.motion(c, [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 320, delay: Math.min(i, 8) * 50, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' }));
                }
                const c = this.querySelector('.usa-ps-count');
                if (c)
                    c.textContent = `${res.length} plugin${res.length === 1 ? '' : 's'}`;
                return res;
            }
            async install(name) {
                const p = this._list.find((x) => x.name === name);
                const b = this.querySelector(`.usa-ps-install[data-name="${typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(name) : name.replace(/["\\]/g, '\\$&')}"]`);
                if (!p)
                    return [];
                if (b) {
                    b.disabled = true;
                    b.setAttribute('data-busy', '');
                    b.textContent = 'Installing…';
                }
                try {
                    const fx = await components_marketplace.installPlugin(p, this.loader ? { load: this.loader } : {});
                    if (b) {
                        b.removeAttribute('data-busy');
                        b.setAttribute('data-done', '');
                        b.textContent = 'Installed ✓';
                        if (!this.reduced)
                            this.motion(b, [{ transform: 'scale(.9)' }, { transform: 'scale(1.08)', offset: 0.6 }, { transform: 'none' }], { duration: 360 });
                    }
                    this.emit('install', { name, effects: fx });
                    return fx;
                }
                catch (e) {
                    if (b) {
                        b.disabled = false;
                        b.removeAttribute('data-busy');
                        b.textContent = 'Retry';
                    }
                    this.emit('install-error', { name, message: String(e?.message || e) });
                    return [];
                }
            }
        }
        return UsaPluginStore;
    }, { id: 'plugin-store', text: css$n });
}

var css$m = "usa-chapter-nav{display:block;max-width:100%;font:13px/1.3 system-ui,sans-serif;color:#0f172a}usa-chapter-nav .usa-cn-list{display:flex;gap:6px;margin:0;padding:0;list-style:none;overflow-x:auto;scrollbar-width:none}usa-chapter-nav[data-orientation=vertical] .usa-cn-list{flex-direction:column;overflow:visible}usa-chapter-nav li{flex:1 1 0;min-width:84px}usa-chapter-nav .usa-cn-item{display:grid;grid-template-columns:auto 1fr;grid-template-rows:auto auto;align-items:center;gap:4px 8px;width:100%;padding:8px 10px;border:0;border-radius:10px;background:rgba(15,23,42,.05);color:inherit;font:inherit;text-align:left;cursor:pointer}usa-chapter-nav .usa-cn-item[aria-current]{background:#eef2ff;color:#3730a3}usa-chapter-nav .usa-cn-item:focus-visible{outline:2px solid #6366f1;outline-offset:1px}usa-chapter-nav .usa-cn-num{display:grid;place-items:center;width:22px;height:22px;border-radius:50%;background:#e2e8f0;font-weight:700;font-size:11px}usa-chapter-nav [aria-current] .usa-cn-num{background:#4f46e5;color:#fff}usa-chapter-nav .usa-cn-title{overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-weight:600}usa-chapter-nav .usa-cn-bar{grid-column:1/-1;height:3px;border-radius:2px;background:rgba(15,23,42,.1);overflow:hidden}usa-chapter-nav .usa-cn-bar i{display:block;height:100%;background:#4f46e5;transform:scaleX(var(--p,0));transform-origin:0 50%;transition:transform .15s linear}@media (prefers-reduced-motion:reduce){usa-chapter-nav .usa-cn-bar i{transition:none}}";

const esc$1 = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
function defineChapterNav(tag = 'usa-chapter-nav') {
    return base.defineElement(tag, (Base) => {
        class UsaChapterNav extends Base {
            constructor() {
                super(...arguments);
                this._cur = -1;
                this._secs = [];
            }
            static get observedAttributes() {
                return ['for', 'orientation', 'label'];
            }
            get current() {
                return this._cur;
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const root = (this.str('for') && document.querySelector(this.str('for'))) || document;
                this._secs = Array.from(root.querySelectorAll('[data-chapter]'));
                this.setAttribute('role', 'navigation');
                this.setAttribute('aria-label', this.str('label', 'Chapters'));
                this.setAttribute('data-orientation', this.str('orientation') === 'vertical' ? 'vertical' : 'horizontal');
                const title = (s, i) => s.dataset.chapter || s.querySelector('h1,h2,h3,h4')?.textContent?.trim() || `Chapter ${i + 1}`;
                this.insertAdjacentHTML('beforeend', `<ol class="usa-cn-list" data-usa-part>${this._secs.map((s, i) => `<li><button type="button" class="usa-cn-item" data-i="${i}"><span class="usa-cn-num">${i + 1}</span><span class="usa-cn-title">${esc$1(title(s, i))}</span><span class="usa-cn-bar" aria-hidden="true"><i></i></span></button></li>`).join('')}</ol>`);
                this.listen(this, 'click', (e) => {
                    const b = e.target.closest?.('.usa-cn-item');
                    if (b)
                        this.goTo(Number(b.dataset.i));
                });
                const update = () => {
                    const vh = innerHeight || 1;
                    let cur = 0;
                    this._secs.forEach((s, i) => {
                        const r = s.getBoundingClientRect();
                        const p = r.height ? Math.min(1, Math.max(0, (vh * 0.35 - r.top) / r.height)) : 0;
                        this.querySelector(`.usa-cn-item[data-i="${i}"] .usa-cn-bar i`)?.style.setProperty('--p', String(Math.round(p * 1000) / 1000));
                        if (r.top <= vh * 0.35)
                            cur = i;
                    });
                    this.setCurrent(cur);
                };
                this.listen(window, 'scroll', update, { passive: true });
                this.listen(window, 'resize', update);
                update();
            }
            setCurrent(i) {
                if (i === this._cur || !this._secs.length)
                    return;
                this._cur = i;
                this.querySelectorAll('.usa-cn-item').forEach((b, k) => {
                    if (k === i)
                        b.setAttribute('aria-current', 'step');
                    else
                        b.removeAttribute('aria-current');
                });
                const s = this._secs[i];
                this.emit('chapter', { index: i, title: this.querySelector(`.usa-cn-item[data-i="${i}"] .usa-cn-title`)?.textContent || '' });
                if (s && !this.reduced) {
                    const b = this.querySelector(`.usa-cn-item[data-i="${i}"] .usa-cn-num`);
                    if (b)
                        this.motion(b, [{ transform: 'scale(1)' }, { transform: 'scale(1.25)', offset: 0.4 }, { transform: 'scale(1)' }], { duration: 380, easing: 'cubic-bezier(.3,1.4,.5,1)' });
                }
            }
            goTo(i) {
                const s = this._secs[i];
                if (!s)
                    return;
                s.scrollIntoView?.({ behavior: this.reduced ? 'auto' : 'smooth', block: 'start' });
                this.setCurrent(i);
            }
        }
        return UsaChapterNav;
    }, { id: 'chapter-nav', text: css$m });
}

var css$l = "usa-scene{position:relative;display:block;overflow:hidden;border-radius:14px;background:#000;color:#fff;isolation:isolate}usa-scene>.usa-scene-media{display:block;width:100%;height:100%;object-fit:cover;transform-origin:50% 50%;will-change:transform}usa-scene>[data-caption]{position:absolute;left:5%;right:5%;bottom:8%;margin:0;font:700 clamp(15px,2.4vw,24px)/1.25 system-ui,sans-serif;text-shadow:0 2px 12px rgba(0,0,0,.7);opacity:0;transform:translateY(10px);transition:opacity .6s,transform .6s}usa-scene>[data-caption][data-shown]{opacity:1;transform:none}@media (prefers-reduced-motion:reduce){usa-scene>[data-caption]{transition:none}}";

function defineScene(tag = 'usa-scene') {
    return base.defineElement(tag, (Base) => {
        class UsaScene extends Base {
            constructor() {
                super(...arguments);
                this._p = 0;
            }
            static get observedAttributes() {
                return ['camera', 'strength', 'autoplay'];
            }
            get progress() {
                return this._p;
            }
            media() {
                return this.querySelector(':scope > [data-shot], :scope > img, :scope > video, :scope > picture');
            }
            mount() {
                const move = components_fxCinema.CAMERA_MOVES.includes(this.str('camera')) ? this.str('camera') : 'dolly-in';
                this.setAttribute('data-camera', move);
                const m = this.media();
                m?.classList.add('usa-scene-media');
                const caps = Array.from(this.querySelectorAll(':scope > [data-caption]'));
                if (this.reduced) {
                    caps.forEach((c) => c.setAttribute('data-shown', ''));
                    return;
                }
                if (this.hasAttribute('autoplay')) {
                    caps.forEach((c) => c.setAttribute('data-shown', ''));
                    const st = this.num('strength', 1);
                    this.inView((v) => {
                        m?.getAnimations?.().forEach((a) => a.cancel());
                        if (v && m)
                            this.motion(m, [0, 0.25, 0.5, 0.75, 1].map((p) => ({ transform: components_fxCinema.cameraFrame(move, p, st) })), { duration: 7000, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
                    });
                    return;
                }
                let stop = null;
                this.inView((v) => {
                    stop?.();
                    stop = null;
                    if (!v)
                        return;
                    let last = -1;
                    stop = base.onFrame(() => {
                        const r = this.getBoundingClientRect();
                        const vh = innerHeight || 1;
                        const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
                        if (Math.abs(p - last) < 0.001)
                            return;
                        last = p;
                        this.setProgress(p, move);
                    });
                });
                this.onCleanup(() => stop?.());
            }
            /** Render the shot at progress `p` (0–1) — also used by tests / scroll timelines. */
            setProgress(p, move = this.getAttribute('data-camera') || 'dolly-in') {
                this._p = Math.min(1, Math.max(0, p));
                const m = this.media();
                if (m)
                    m.style.transform = components_fxCinema.cameraFrame(move, this._p, this.num('strength', 1));
                this.querySelectorAll(':scope > [data-caption]').forEach((c) => this.setFlagOn(c, this._p >= Number(c.dataset.at ?? 0.3)));
                this.emit('shot', { progress: this._p });
            }
            setFlagOn(el, on) {
                if (on)
                    el.setAttribute('data-shown', '');
                else
                    el.removeAttribute('data-shown');
            }
        }
        return UsaScene;
    }, { id: 'scene', text: css$l });
}

var css$k = "usa-lottie{display:inline-block;line-height:0;max-width:100%}usa-lottie .usa-lt-svg{max-width:100%;height:auto;overflow:visible}usa-lottie [data-layer]{transform-box:view-box;transform-origin:0 0}";

function defineLottie(tag = 'usa-lottie') {
    return base.defineElement(tag, (Base) => {
        class UsaLottie extends Base {
            constructor() {
                super(...arguments);
                this._json = null;
                this._m = null;
                this._anims = [];
            }
            static get observedAttributes() {
                return ['src', 'loop', 'speed', 'label'];
            }
            get json() {
                return this._json;
            }
            set json(v) {
                this._json = typeof v === 'string' ? JSON.parse(v) : v;
                if (this.isConnected)
                    this.changed('json');
            }
            get parsed() {
                return this._m;
            }
            mount() {
                this.setAttribute('role', 'img');
                this.setAttribute('aria-label', this.str('label', 'Animation'));
                const src = this.str('src');
                if (this._json)
                    this.render(this._json);
                else if (src && typeof fetch !== 'undefined')
                    fetch(src)
                        .then((r) => r.json())
                        .then((j) => this.isConnected && this.str('src') === src && ((this._json = j), this.render(j)))
                        .catch(() => this.emit('error', { src }));
                this.onCleanup(() => this.stop());
            }
            render(j) {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this._m = components_fxLottie.lottieToKeyframes(j);
                this.insertAdjacentHTML('beforeend', components_fxLottie.lottieToSvg(j).replace('<svg ', '<svg data-usa-part class="usa-lt-svg" '));
                this.emit('load', { duration: this._m.duration, layers: this._m.layers.length });
                this.frame(0);
                if (this.hasAttribute('autoplay') && !this.reduced)
                    this.inView((v) => {
                        if (v)
                            this.play();
                        else
                            this.pause();
                    });
            }
            frame(i) {
                this._m?.layers.forEach((l) => {
                    const g = this.querySelector(`[data-layer="${l.index}"]`);
                    const k = l.keyframes[i] || l.keyframes[0];
                    if (g && k) {
                        g.style.transform = String(k.transform || '');
                        if (k.opacity != null)
                            g.style.opacity = String(k.opacity);
                    }
                });
            }
            play() {
                if (!this._m || this.reduced)
                    return;
                if (this._anims.length) {
                    this._anims.forEach((a) => a.play());
                    return;
                }
                const iterations = this.hasAttribute('loop') ? Infinity : 1;
                const rate = Math.max(0.1, this.num('speed', 1));
                this._anims = this._m.layers
                    .map((l) => {
                    const g = this.querySelector(`[data-layer="${l.index}"]`);
                    const a = g ? this.motion(g, l.keyframes, { duration: this._m.duration / rate, iterations, fill: 'both' }) : null;
                    return a;
                })
                    .filter(Boolean);
                const first = this._anims[0];
                if (first && iterations === 1)
                    first.finished.then(() => this.emit('complete'), () => undefined);
            }
            pause() {
                this._anims.forEach((a) => a.pause());
            }
            stop() {
                this._anims.splice(0).forEach((a) => a.cancel());
                this.frame(0);
            }
        }
        return UsaLottie;
    }, { id: 'lottie', text: css$k });
}

var css$j = "usa-lottie-icon{display:inline-block;width:var(--usa-li-size,32px);height:var(--usa-li-size,32px);line-height:0;cursor:pointer;vertical-align:middle}usa-lottie-icon>usa-lottie,usa-lottie-icon .usa-lt-svg{width:100%;height:100%}";

const fill = (r, g, b) => ({ ty: 'fl', c: { k: [r, g, b, 1] } });
const sh = (v, c = true) => ({ ty: 'sh', ks: { k: { v, i: v.map(() => [0, 0]), o: v.map(() => [0, 0]), c } } });
const anim = (keys) => ({ a: 1, k: keys.map(([t, s]) => ({ t, s })) });
const L = (nm, shapes, ks) => ({ nm, ks: { a: { k: [24, 24] }, p: { k: [24, 24] }, ...ks }, shapes });
const icon = (layers, op = 30) => ({ v: '5.7.0', fr: 30, ip: 0, op, w: 48, h: 48, layers });
/** The built-in Lottie icon set (9.2). */
const LOTTIE_ICONS = {
    heart: icon([L('heart', [sh([[24, 40], [8, 25], [7, 15], [15, 8], [24, 14], [33, 8], [41, 15], [40, 25]]), fill(0.96, 0.25, 0.37)], { s: anim([[0, [100, 100]], [7, [135, 135]], [14, [90, 90]], [22, [108, 108]], [30, [100, 100]]]) })]),
    bell: icon([L('bell', [sh([[24, 6], [34, 14], [35, 30], [40, 35], [8, 35], [13, 30], [14, 14]]), { ty: 'el', p: { k: [24, 39] }, s: { k: [8, 8] } }, fill(0.98, 0.75, 0.14)], { a: { k: [24, 6] }, p: { k: [24, 6] }, r: anim([[0, [0]], [6, [-20]], [12, [16]], [18, [-10]], [24, [5]], [30, [0]]]) })]),
    check: icon([
        L('tick', [sh([[14, 25], [21, 32], [35, 17], [32, 14], [21, 26], [17, 22]]), fill(1, 1, 1)], { s: anim([[0, [0, 0]], [10, [0, 0]], [20, [115, 115]], [28, [100, 100]]]) }),
        L('disc', [{ ty: 'el', p: { k: [24, 24] }, s: { k: [40, 40] } }, fill(0.13, 0.77, 0.37)], { s: anim([[0, [0, 0]], [10, [110, 110]], [16, [100, 100]]]) }),
    ]),
    spinner: icon([L('arc', [sh([[24, 4], [38, 10], [44, 24], [40, 24], [35, 13], [24, 8]]), fill(0.31, 0.27, 0.9)], { r: anim([[0, [0]], [30, [360]]]) })]),
    star: icon([L('star', [sh([[24, 4], [29, 18], [44, 18], [32, 27], [36, 42], [24, 33], [12, 42], [16, 27], [4, 18], [19, 18]]), fill(0.98, 0.8, 0.08)], { r: anim([[0, [0]], [15, [72]], [30, [72]]]), s: anim([[0, [100, 100]], [8, [70, 70]], [18, [120, 120]], [30, [100, 100]]]) })]),
    bolt: icon([L('bolt', [sh([[27, 4], [12, 27], [22, 27], [19, 44], [36, 19], [26, 19]]), fill(0.55, 0.36, 0.96)], { o: anim([[0, [100]], [4, [20]], [8, [100]], [12, [30]], [16, [100]]]), s: anim([[0, [100, 100]], [6, [120, 120]], [16, [100, 100]]]) })], 20),
};
function defineLottieIcon(tag = 'usa-lottie-icon') {
    return base.defineElement(tag, (Base) => {
        class UsaLottieIcon extends Base {
            static get observedAttributes() {
                return ['name', 'size', 'color', 'label', 'trigger'];
            }
            lottie() {
                return this.querySelector(':scope > usa-lottie');
            }
            mount() {
                if (typeof customElements !== 'undefined' && !customElements.get('usa-lottie'))
                    defineLottie();
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const name = LOTTIE_ICONS[this.str('name')] ? this.str('name') : 'heart';
                this.setAttribute('data-name', name);
                const label = this.str('label');
                if (label) {
                    this.setAttribute('role', 'img');
                    this.setAttribute('aria-label', label);
                }
                else
                    this.setAttribute('aria-hidden', 'true');
                this.style.setProperty('--usa-li-size', `${Math.max(12, this.num('size', 32))}px`);
                let json = LOTTIE_ICONS[name];
                if (this.hasAttribute('color')) {
                    const m = this.str('color').match(/^#?([0-9a-f]{6})$/i);
                    if (m) {
                        const n = parseInt(m[1], 16);
                        const c = [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, 1];
                        json = JSON.parse(JSON.stringify(json).replace(/"ty":"fl","c":\{"k":\[[^\]]*\]\}/g, `"ty":"fl","c":{"k":${JSON.stringify(c)}}`));
                    }
                }
                const lt = document.createElement('usa-lottie');
                lt.setAttribute('data-usa-part', '');
                if (this.str('trigger') === 'loop')
                    lt.setAttribute('loop', '');
                lt.json = json;
                this.appendChild(lt);
                const t = this.str('trigger', 'click');
                if (t === 'hover')
                    this.listen(this, 'pointerenter', () => this.play());
                else if (t === 'enter')
                    this.inView((v) => v && this.play(), { threshold: 0.5 });
                else if (t === 'loop')
                    this.inView((v) => (v ? this.play() : this.lottie()?.stop()));
                else
                    this.listen(this, 'click', () => this.play());
            }
            play() {
                const l = this.lottie();
                if (!l || this.reduced)
                    return;
                if (this.str('trigger') !== 'loop')
                    l.stop();
                l.play();
            }
        }
        return UsaLottieIcon;
    }, { id: 'lottie-icon', text: css$j });
}

var css$i = "usa-gen-art{position:relative;display:block;min-height:120px;border-radius:12px;overflow:hidden;cursor:pointer;outline:none}usa-gen-art>canvas{display:block;width:100%;height:100%;position:absolute;inset:0}usa-gen-art:focus-visible{box-shadow:0 0 0 3px #6366f1}";

const ARTS = ['flow', 'circles', 'truchet', 'waves'];
function defineGenArt(tag = 'usa-gen-art') {
    return base.defineElement(tag, (Base) => {
        class UsaGenArt extends Base {
            constructor() {
                super(...arguments);
                this._seed = 1;
                this._raf = 0;
            }
            static get observedAttributes() {
                return ['art', 'seed', 'palette', 'label'];
            }
            get seed() {
                return this._seed;
            }
            canvas() {
                return this.querySelector(':scope > canvas');
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this._seed = this.num('seed', 1);
                const art = ARTS.includes(this.str('art')) ? this.str('art') : 'flow';
                this.setAttribute('data-art', art);
                this.setAttribute('role', 'img');
                this.setAttribute('aria-label', this.str('label', `Generative ${art} artwork, seed ${this._seed}`));
                if (!this.hasAttribute('tabindex'))
                    this.tabIndex = 0;
                this.insertAdjacentHTML('afterbegin', '<canvas data-usa-part></canvas>');
                this.listen(this, 'click', () => this.generate());
                this.listen(this, 'keydown', (e) => {
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
            generate(seed = Math.floor(Math.random() * 1e6)) {
                this._seed = seed;
                this.setAttribute('aria-label', this.str('label', `Generative ${this.getAttribute('data-art')} artwork, seed ${seed}`));
                this.draw();
                this.emit('generate', { seed });
            }
            toDataURL(type = 'image/png') {
                return this.canvas()?.toDataURL(type) || '';
            }
            draw() {
                const c = this.canvas();
                const ctx = c?.getContext?.('2d');
                if (!c || !ctx)
                    return;
                cancelAnimationFrame(this._raf);
                const w = Math.max(60, Math.round(this.clientWidth || 300));
                const h = Math.max(60, Math.round(this.clientHeight || 180));
                const dpr = Math.min(2, (typeof devicePixelRatio === 'number' && devicePixelRatio) || 1);
                c.width = w * dpr;
                c.height = h * dpr;
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                const pal = components_fxGenart.PALETTES[this.str('palette')] || components_fxGenart.PALETTES.sunset;
                const r = components_fxGenart.seededRandom(this._seed);
                ctx.fillStyle = pal[pal.length - 1];
                ctx.fillRect(0, 0, w, h);
                const art = this.getAttribute('data-art');
                const steps = [];
                if (art === 'circles') {
                    const cs = [];
                    for (let i = 0; i < 900 && cs.length < 140; i++) {
                        const x = r() * w;
                        const y = r() * h;
                        let rad = 2 + r() * Math.min(w, h) * 0.14;
                        for (const [cx, cy, cr] of cs)
                            rad = Math.min(rad, Math.hypot(x - cx, y - cy) - cr - 1.5);
                        if (rad < 2)
                            continue;
                        cs.push([x, y, rad]);
                        const col = pal[Math.floor(r() * (pal.length - 1))];
                        steps.push(() => {
                            ctx.beginPath();
                            ctx.arc(x, y, rad, 0, Math.PI * 2);
                            ctx.fillStyle = col;
                            ctx.fill();
                        });
                    }
                }
                else if (art === 'truchet') {
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
                                }
                                else {
                                    ctx.arc(x + s, y, s / 2, Math.PI / 2, Math.PI);
                                    ctx.moveTo(x + s / 2, y + s);
                                    ctx.arc(x, y + s, s / 2, 0, -Math.PI / 2, true);
                                }
                                ctx.stroke();
                            });
                        }
                }
                else if (art === 'waves') {
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
                            for (let x = 0; x <= w; x += 4)
                                ctx.lineTo(x, base + Math.sin((x / w) * Math.PI * 2 * f + ph) * amp);
                            ctx.lineTo(w, h);
                            ctx.closePath();
                            ctx.fillStyle = col;
                            ctx.globalAlpha = 0.85;
                            ctx.fill();
                            ctx.globalAlpha = 1;
                        });
                    }
                }
                else {
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
                    for (let k = 0; k < per && i < steps.length; k++)
                        steps[i++]();
                    if (i < steps.length)
                        this._raf = requestAnimationFrame(tick);
                };
                tick();
            }
        }
        return UsaGenArt;
    }, { id: 'gen-art', text: css$i });
}

var css$h = "usa-bg-generator{display:block;max-width:100%;font:13px/1.3 system-ui,sans-serif;color:#0f172a}usa-bg-generator .usa-bg-preview{height:120px;border-radius:12px;box-shadow:inset 0 0 0 1px rgba(15,23,42,.1)}usa-bg-generator .usa-bg-controls{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:8px}usa-bg-generator label{display:inline-flex;gap:4px;align-items:center;font-weight:600}usa-bg-generator select,usa-bg-generator button{padding:5px 8px;border:1px solid #cbd5e1;border-radius:7px;background:#fff;font:inherit;cursor:pointer}usa-bg-generator .usa-bg-copy{background:#4f46e5;border-color:#4f46e5;color:#fff}usa-bg-generator .usa-bg-code{display:block;margin-top:6px;padding:6px 8px;border-radius:7px;background:#0f172a;color:#e2e8f0;font:11px/1.4 ui-monospace,monospace;white-space:nowrap;overflow-x:auto}";

const STYLES = ['mesh', 'grain', 'stripes', 'dots'];
const GRAIN = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.4'/%3E%3C/svg%3E\")";
/** The CSS background for a generator state (9.3). */
function backgroundCss(style, seed, palette) {
    const pal = components_fxGenart.PALETTES[palette] || components_fxGenart.PALETTES.sunset;
    if (style === 'stripes')
        return `repeating-linear-gradient(${(seed * 37) % 180}deg, ${pal[0]} 0 14px, ${pal[1]} 14px 28px, ${pal[2]} 28px 42px)`;
    if (style === 'dots')
        return `radial-gradient(${pal[1]} 22%, transparent 24%) 0 0 / 22px 22px, radial-gradient(${pal[2]} 22%, transparent 24%) 11px 11px / 22px 22px, ${pal[0]}`;
    if (style === 'grain')
        return `${GRAIN}, ${components_fxGenart.meshGradient(seed, palette)}`;
    return components_fxGenart.meshGradient(seed, palette);
}
function defineBgGenerator(tag = 'usa-bg-generator') {
    return base.defineElement(tag, (Base) => {
        class UsaBgGenerator extends Base {
            constructor() {
                super(...arguments);
                this._st = { palette: 'sunset', style: 'mesh', seed: 1 };
            }
            static get observedAttributes() {
                return ['label'];
            }
            get css() {
                return `background: ${backgroundCss(this._st.style, this._st.seed, this._st.palette)};`;
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this._st = { palette: components_fxGenart.PALETTES[this.str('palette')] ? this.str('palette') : 'sunset', style: STYLES.includes(this.str('style')) ? this.str('style') : 'mesh', seed: this.num('seed', 1) };
                this.setAttribute('role', 'group');
                this.setAttribute('aria-label', this.str('label', 'Background generator'));
                const opt = (l, v) => l.map((x) => `<option${x === v ? ' selected' : ''}>${x}</option>`).join('');
                this.insertAdjacentHTML('beforeend', `<div class="usa-bg-preview" aria-hidden="true" data-usa-part></div><div class="usa-bg-controls" data-usa-part><label>Palette <select data-k="palette">${opt(Object.keys(components_fxGenart.PALETTES), this._st.palette)}</select></label><label>Style <select data-k="style">${opt(STYLES, this._st.style)}</select></label><button type="button" class="usa-bg-shuffle">Shuffle</button><button type="button" class="usa-bg-copy">Copy CSS</button></div><code class="usa-bg-code" data-usa-part></code>`);
                this.listen(this, 'change', (e) => {
                    const s = e.target;
                    if (s.dataset?.k === 'palette' || s.dataset?.k === 'style') {
                        this._st[s.dataset.k] = s.value;
                        this.render(true);
                    }
                });
                this.listen(this, 'click', (e) => {
                    const t = e.target;
                    if (t.closest?.('.usa-bg-shuffle'))
                        this.shuffle();
                    if (t.closest?.('.usa-bg-copy'))
                        void this.copy();
                });
                this.render(false);
            }
            render(user) {
                const p = this.querySelector('.usa-bg-preview');
                const bg = backgroundCss(this._st.style, this._st.seed, this._st.palette);
                if (p) {
                    p.style.background = bg;
                    if (user && !this.reduced)
                        this.motion(p, [{ opacity: 0.4, filter: 'blur(6px)' }, { opacity: 1, filter: 'none' }], { duration: 450, easing: 'ease-out' });
                }
                const c = this.querySelector('.usa-bg-code');
                if (c)
                    c.textContent = this.css;
                if (user)
                    this.emit('change', { css: this.css, seed: this._st.seed });
            }
            shuffle() {
                this._st.seed = 1 + Math.floor(Math.random() * 9999);
                this.render(true);
            }
            async copy() {
                let ok = false;
                try {
                    await navigator.clipboard.writeText(this.css);
                    ok = true;
                }
                catch {
                    ok = false;
                }
                const b = this.querySelector('.usa-bg-copy');
                if (b) {
                    b.textContent = ok ? 'Copied ✓' : 'Copy failed';
                    setTimeout(() => (b.textContent = 'Copy CSS'), 1500);
                }
                return ok;
            }
        }
        return UsaBgGenerator;
    }, { id: 'bg-generator', text: css$h });
}

var css$g = "usa-video-card{position:relative;display:block;overflow:hidden;border-radius:14px;background:#0f172a;color:#fff;aspect-ratio:16/9;cursor:pointer;outline:none;isolation:isolate}usa-video-card>img,usa-video-card>video,usa-video-card>[data-poster]{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform 6s ease-out}usa-video-card>video{opacity:0;transition:opacity .35s}usa-video-card[data-previewing]:not([data-noplay])>video{opacity:1}usa-video-card[data-previewing][data-noplay]>img,usa-video-card[data-previewing][data-noplay]>[data-poster]{transform:scale(1.12) translate(-2%,-1%)}usa-video-card>:not([data-usa-part]):not(img):not(video):not([data-poster]){position:absolute;left:0;right:0;bottom:0;margin:0;padding:28px 12px 12px;background:linear-gradient(transparent,rgba(0,0,0,.7));font:700 14px/1.2 system-ui,sans-serif}usa-video-card .usa-vc-play{position:absolute;left:50%;top:50%;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;background:rgba(255,255,255,.9) url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M9 7l9 5-9 5z' fill='%230f172a'/%3E%3C/svg%3E\") center/22px no-repeat;box-shadow:0 6px 18px rgba(0,0,0,.35);transition:transform .3s,opacity .3s;z-index:1}usa-video-card[data-previewing] .usa-vc-play{transform:scale(.7);opacity:0}usa-video-card .usa-vc-time:not(:empty){position:absolute;right:8px;top:8px;padding:2px 6px;border-radius:5px;background:rgba(0,0,0,.65);font:600 11px/1.4 system-ui,sans-serif;z-index:1}usa-video-card .usa-vc-bar{position:absolute;left:0;right:0;bottom:0;height:3px;background:rgba(255,255,255,.2);z-index:1}usa-video-card .usa-vc-bar i{display:block;height:100%;background:#ef4444;transform:scaleX(var(--p,0));transform-origin:0 50%}usa-video-card:focus-visible{box-shadow:0 0 0 3px #6366f1}@media (prefers-reduced-motion:reduce){usa-video-card *{transition:none!important}}";

const fmt$1 = (s) => (Number.isFinite(s) && s > 0 ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '');
function defineVideoCard(tag = 'usa-video-card') {
    return base.defineElement(tag, (Base) => {
        class UsaVideoCard extends Base {
            constructor() {
                super(...arguments);
                this._on = false;
            }
            static get observedAttributes() {
                return ['label', 'duration'];
            }
            get previewing() {
                return this._on;
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this.setAttribute('role', 'button');
                if (!this.hasAttribute('tabindex'))
                    this.tabIndex = 0;
                const title = this.querySelector('[data-title], h3, h4, figcaption')?.textContent?.trim();
                this.setAttribute('aria-label', this.str('label', title ? `Play ${title}` : 'Play video'));
                const v = this.querySelector(':scope video, :scope > .usa-vc-media video');
                if (v) {
                    v.muted = true;
                    v.playsInline = true;
                    v.loop = true;
                    v.preload = v.preload || 'metadata';
                    v.setAttribute('aria-hidden', 'true');
                    v.tabIndex = -1;
                }
                const dur = this.str('duration');
                this.insertAdjacentHTML('beforeend', `<span class="usa-vc-play" aria-hidden="true" data-usa-part></span><span class="usa-vc-time" data-usa-part>${dur}</span><span class="usa-vc-bar" aria-hidden="true" data-usa-part><i></i></span>`);
                const time = this.querySelector('.usa-vc-time');
                const bar = this.querySelector('.usa-vc-bar i');
                if (v && !dur)
                    this.listen(v, 'loadedmetadata', () => (time.textContent = fmt$1(v.duration)));
                if (v)
                    this.listen(v, 'timeupdate', () => v.duration && bar.style.setProperty('--p', String(v.currentTime / v.duration)));
                const start = () => {
                    if (this._on || this.reduced)
                        return;
                    this._on = true;
                    this.setAttribute('data-previewing', '');
                    const p = v?.play?.();
                    if (p && typeof p.catch === 'function')
                        p.catch(() => this.setAttribute('data-noplay', ''));
                    if (!v)
                        this.setAttribute('data-noplay', '');
                };
                const stop = () => {
                    if (!this._on)
                        return;
                    this._on = false;
                    this.removeAttribute('data-previewing');
                    if (v) {
                        v.pause?.();
                        try {
                            v.currentTime = 0;
                        }
                        catch {
                            /* not loaded */
                        }
                    }
                    bar.style.setProperty('--p', '0');
                };
                this.listen(this, 'pointerenter', start);
                this.listen(this, 'pointerleave', stop);
                this.listen(this, 'focusin', start);
                this.listen(this, 'focusout', stop);
                this.listen(this, 'click', () => this.emit('open', { src: v?.currentSrc || v?.getAttribute('src') || '' }));
                this.listen(this, 'keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.emit('open', { src: v?.currentSrc || v?.getAttribute('src') || '' });
                    }
                });
                this.onCleanup(stop);
            }
        }
        return UsaVideoCard;
    }, { id: 'video-card', text: css$g });
}

var css$f = "usa-hero-video{position:relative;display:flex;flex-direction:column;justify-content:flex-end;min-height:260px;padding:24px;overflow:hidden;border-radius:16px;color:#fff;isolation:isolate}usa-hero-video>video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:-2;opacity:0;transition:opacity .8s}usa-hero-video[data-ready]:not([data-poster-only])>video{opacity:1}usa-hero-video .usa-hv-poster{position:absolute;inset:-4%;z-index:-3;background:linear-gradient(135deg,#1e1b4b,#7c3aed 45%,#f472b6) center/cover no-repeat}usa-hero-video>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:-3}usa-hero-video[data-poster-only] .usa-hv-poster{animation:usa-hv-kb 18s ease-in-out infinite alternate}usa-hero-video .usa-hv-scrim{position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.6))}usa-hero-video .usa-hv-toggle{position:absolute;right:12px;top:12px;width:34px;height:34px;border:0;border-radius:50%;background:rgba(0,0,0,.45) url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M7 5h4v14H7zM13 5h4v14h-4z'/%3E%3C/svg%3E\") center/16px no-repeat;cursor:pointer}usa-hero-video[data-paused] .usa-hv-toggle{background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M8 5l11 7-11 7z'/%3E%3C/svg%3E\")}usa-hero-video .usa-hv-toggle:focus-visible{outline:2px solid #fff;outline-offset:2px}@keyframes usa-hv-kb{from{transform:scale(1)}to{transform:scale(1.08) translate(-2%,-1%)}}@media (prefers-reduced-motion:reduce){usa-hero-video .usa-hv-poster{animation:none!important}usa-hero-video>video{transition:none}}";

function defineHeroVideo(tag = 'usa-hero-video') {
    return base.defineElement(tag, (Base) => {
        class UsaHeroVideo extends Base {
            constructor() {
                super(...arguments);
                this._paused = false;
            }
            static get observedAttributes() {
                return ['label', 'scrub', 'poster'];
            }
            get paused() {
                return this._paused;
            }
            video() {
                return this.querySelector(':scope > video');
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this.setAttribute('role', 'region');
                this.setAttribute('aria-label', this.str('label', 'Hero'));
                const v = this.video();
                const poster = this.str('poster');
                this.insertAdjacentHTML('afterbegin', `<div class="usa-hv-poster" aria-hidden="true" data-usa-part${poster ? ` style="background-image:url('${poster.replace(/['")\\]/g, '')}')"` : ''}></div><div class="usa-hv-scrim" aria-hidden="true" data-usa-part></div>`);
                const scrub = this.hasAttribute('scrub');
                if (!scrub)
                    this.insertAdjacentHTML('beforeend', '<button type="button" class="usa-hv-toggle" aria-label="Pause background video" data-usa-part></button>');
                if (!v || this.reduced) {
                    this.setAttribute('data-poster-only', '');
                    this._paused = true;
                    v?.removeAttribute('autoplay');
                    v?.pause?.();
                    this.querySelector('.usa-hv-toggle')?.setAttribute('hidden', '');
                    return;
                }
                v.muted = true;
                v.playsInline = true;
                v.setAttribute('aria-hidden', 'true');
                this.listen(v, 'canplay', () => this.setAttribute('data-ready', ''));
                this.listen(v, 'error', () => this.setAttribute('data-poster-only', ''));
                if (scrub) {
                    v.loop = false;
                    this.onCleanup(components_fxVideo.scrubVideo(v, this));
                }
                else {
                    v.loop = true;
                    this.listen(this.querySelector('.usa-hv-toggle'), 'click', () => this.toggle());
                    this.inView((vis) => {
                        if (this._paused)
                            return;
                        if (vis)
                            v.play?.()?.catch?.(() => this.setAttribute('data-poster-only', ''));
                        else
                            v.pause?.();
                    });
                }
            }
            toggle() {
                const v = this.video();
                const b = this.querySelector('.usa-hv-toggle');
                this._paused = !this._paused;
                if (this._paused)
                    v?.pause?.();
                else
                    v?.play?.()?.catch?.(() => undefined);
                b?.setAttribute('aria-label', this._paused ? 'Play background video' : 'Pause background video');
                this.setFlag('data-paused', this._paused);
                this.emit(this._paused ? 'pause' : 'play');
            }
        }
        return UsaHeroVideo;
    }, { id: 'hero-video', text: css$f });
}

var css$e = "usa-motion-prefs{display:block;max-width:100%;font:13px/1.35 system-ui,sans-serif;color:#0f172a}usa-motion-prefs .usa-mp{display:grid;gap:10px;margin:0;padding:14px;border:1px solid rgba(15,23,42,.12);border-radius:14px;background:#fff}usa-motion-prefs fieldset{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:6px;margin:0;padding:0;border:0}usa-motion-prefs legend{margin-bottom:6px;font-weight:700}usa-motion-prefs .usa-mp-level{display:flex;gap:6px;align-items:flex-start;padding:8px;border:1px solid #e2e8f0;border-radius:10px;cursor:pointer}usa-motion-prefs .usa-mp-level:has(input:checked){border-color:#6366f1;background:#eef2ff}usa-motion-prefs .usa-mp-level span{display:flex;flex-direction:column}usa-motion-prefs small{color:#64748b}usa-motion-prefs .usa-mp-row{display:flex;gap:8px;align-items:center;font-weight:600}usa-motion-prefs input[type=range]{flex:1;min-width:0;accent-color:#4f46e5}usa-motion-prefs .usa-mp-sample{height:22px;border-radius:999px;background:#f1f5f9;padding:3px;overflow:hidden}usa-motion-prefs .usa-mp-sample i{display:block;width:16px;height:16px;border-radius:50%;background:#4f46e5}usa-motion-prefs .usa-mp-reset{justify-self:start;padding:5px 12px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;font:inherit;cursor:pointer}usa-motion-prefs :focus-visible{outline:2px solid #6366f1;outline-offset:2px}";

const LEVELS = [
    ['full', 'Full', 'All motion'],
    ['gentle', 'Gentle', 'Smaller, softer moves'],
    ['minimal', 'Minimal', 'Fades only'],
    ['static', 'None', 'No animation'],
];
function defineMotionPrefs(tag = 'usa-motion-prefs') {
    return base.defineElement(tag, (Base) => {
        class UsaMotionPrefs extends Base {
            constructor() {
                super(...arguments);
                this._p = components_fxSafe.loadMotionPreferences();
            }
            static get observedAttributes() {
                return ['label'];
            }
            get prefs() {
                return { ...this._p };
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this._p = components_fxSafe.loadMotionPreferences();
                const id = `usa-mp-${Math.random().toString(36).slice(2, 7)}`;
                const p = this._p;
                this.insertAdjacentHTML('beforeend', `<form class="usa-mp" aria-label="${(this.str('label', 'Motion preferences')).replace(/"/g, '&quot;')}" data-usa-part><fieldset><legend>Motion</legend>${LEVELS.map(([v, l, d]) => `<label class="usa-mp-level"><input type="radio" name="${id}" value="${v}"${p.sensitivity === v ? ' checked' : ''}><span><b>${l}</b><small>${d}</small></span></label>`).join('')}</fieldset><label class="usa-mp-row">Speed <input type="range" min="0.25" max="2" step="0.25" value="${p.speed}" data-k="speed"><output>${p.speed}×</output></label><label class="usa-mp-row"><input type="checkbox" data-k="pauseAutoplay"${p.pauseAutoplay ? ' checked' : ''}> Pause autoplaying video</label><label class="usa-mp-row"><input type="checkbox" data-k="noParallax"${p.noParallax ? ' checked' : ''}> No parallax</label><div class="usa-mp-sample" aria-hidden="true"><i></i></div><button type="button" class="usa-mp-reset">Reset</button></form>`);
                const form = this.querySelector('form');
                this.listen(form, 'submit', (e) => e.preventDefault());
                const read = () => {
                    const lv = form.querySelector(`input[name="${id}"]:checked`)?.value;
                    const sp = Number(form.querySelector('[data-k=speed]').value);
                    form.querySelector('output').textContent = `${sp}×`;
                    this.set({ sensitivity: lv || 'full', speed: sp, pauseAutoplay: form.querySelector('[data-k=pauseAutoplay]').checked, noParallax: form.querySelector('[data-k=noParallax]').checked });
                };
                this.listen(form, 'change', read);
                this.listen(form, 'input', read);
                this.listen(this.querySelector('.usa-mp-reset'), 'click', () => this.reset());
                this.sample();
            }
            set(p) {
                this._p = components_fxSafe.applyMotionPreferences(p);
                this.sample();
                this.emit('change', { prefs: this.prefs });
            }
            sample() {
                const dot = this.querySelector('.usa-mp-sample i');
                if (!dot)
                    return;
                dot.getAnimations?.().forEach((a) => a.cancel());
                const lv = this._p.sensitivity;
                if (lv === 'static' || this.reduced)
                    return;
                const kf = lv === 'minimal' ? [{ opacity: 0.3 }, { opacity: 1 }, { opacity: 0.3 }] : [{ transform: 'translateX(0)' }, { transform: `translateX(${lv === 'gentle' ? 40 : 120}px)` }, { transform: 'translateX(0)' }];
                dot.animate?.(kf, { duration: 1600 / this._p.speed, iterations: Infinity, easing: 'ease-in-out' });
            }
            reset() {
                this._p = components_fxSafe.applyMotionPreferences({});
                this.changed('reset');
                this.emit('change', { prefs: this.prefs });
            }
        }
        return UsaMotionPrefs;
    }, { id: 'motion-prefs', text: css$e });
}

var css$d = "usa-pause-all{display:inline-block}usa-pause-all .usa-pa-btn{display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border:1px solid #cbd5e1;border-radius:999px;background:#fff;color:#0f172a;font:600 13px/1 system-ui,sans-serif;cursor:pointer}usa-pause-all .usa-pa-btn:focus-visible{outline:2px solid #6366f1;outline-offset:2px}usa-pause-all .usa-pa-icon{width:12px;height:12px;background:linear-gradient(90deg,currentColor 0 35%,transparent 35% 65%,currentColor 65%)}usa-pause-all[data-paused] .usa-pa-icon{background:currentColor;clip-path:polygon(10% 0,100% 50%,10% 100%)}[data-usa-paused] *,[data-usa-paused] *::before,[data-usa-paused] *::after{animation-play-state:paused!important}";

function definePauseAll(tag = 'usa-pause-all') {
    return base.defineElement(tag, (Base) => {
        class UsaPauseAll extends Base {
            constructor() {
                super(...arguments);
                this._held = [];
                this._media = [];
                this._local = false;
                this.sync = () => undefined;
            }
            static get observedAttributes() {
                return ['label', 'scope', 'resume-label'];
            }
            root() {
                const s = this.str('scope');
                return s ? document.querySelector(s) : null;
            }
            get paused() {
                return this.str('scope') ? this._local : base.getClock().paused;
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this.insertAdjacentHTML('beforeend', `<button type="button" class="usa-pa-btn" data-usa-part><span class="usa-pa-icon" aria-hidden="true"></span><span class="usa-pa-text"></span></button>`);
                const b = this.querySelector('.usa-pa-btn');
                this.listen(b, 'click', () => this.toggle());
                this.sync = () => {
                    const p = this.paused;
                    b.setAttribute('aria-pressed', String(p));
                    b.querySelector('.usa-pa-text').textContent = p ? this.str('resume-label', 'Play animations') : this.str('label', 'Pause animations');
                    this.setFlag('data-paused', p);
                };
                this.onCleanup(base.onClockChange(() => this.sync()));
                this.sync();
            }
            toggle() {
                const pause = !this.paused;
                const scoped = !!this.str('scope');
                const root = scoped ? this.root() : document.documentElement;
                if (!root)
                    return;
                if (pause) {
                    const all = scoped ? root.getAnimations?.({ subtree: true }) || [] : typeof document.getAnimations === 'function' ? document.getAnimations() : [];
                    this._held = all.filter((a) => a.playState === 'running');
                    this._held.forEach((a) => a.pause());
                    this._media = Array.from(root.querySelectorAll('video, audio')).filter((m) => !m.paused);
                    this._media.forEach((m) => m.pause());
                    root.setAttribute('data-usa-paused', '');
                }
                else {
                    this._held.splice(0).forEach((a) => a.play());
                    this._media.splice(0).forEach((m) => m.play?.()?.catch?.(() => undefined));
                    root.removeAttribute('data-usa-paused');
                }
                if (scoped) {
                    this._local = pause;
                    this.sync();
                }
                else
                    base.setClock({ paused: pause });
                this.emit('pause-all', { paused: pause });
            }
        }
        return UsaPauseAll;
    }, { id: 'pause-all', text: css$d });
}

var css$c = "usa-perf-monitor{position:fixed;z-index:2147483000;top:10px;right:10px;width:150px;border-radius:10px;background:rgba(15,23,42,.88);color:#e2e8f0;font:11px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;box-shadow:0 8px 24px -10px rgba(0,0,0,.6);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}usa-perf-monitor[data-corner=top-left]{right:auto;left:10px}usa-perf-monitor[data-corner=bottom-right]{top:auto;bottom:10px}usa-perf-monitor[data-corner=bottom-left]{top:auto;right:auto;bottom:10px;left:10px}usa-perf-monitor[data-corner=inline]{position:relative;top:auto;right:auto;z-index:auto}usa-perf-monitor .usa-pm-head{display:block;width:100%;padding:6px 8px;border:0;background:none;color:inherit;font:inherit;text-align:left;cursor:pointer}usa-perf-monitor .usa-pm-fps{font-size:16px;color:#4ade80;transition:color .3s}usa-perf-monitor[data-jank] .usa-pm-fps{color:#f87171}usa-perf-monitor .usa-pm-body{padding:0 8px 8px}usa-perf-monitor[collapsed] .usa-pm-body{display:none}usa-perf-monitor .usa-pm-spark{display:block;width:100%;height:22px}usa-perf-monitor .usa-pm-spark polyline{fill:none;stroke:#4ade80;stroke-width:1.5;vector-effect:non-scaling-stroke}usa-perf-monitor dl{display:grid;grid-template-columns:1fr auto;gap:1px 6px;margin:4px 0 0}usa-perf-monitor dt{color:#94a3b8}usa-perf-monitor dd{margin:0;text-align:right}usa-perf-monitor .usa-pm-head:focus-visible{outline:2px solid #818cf8;outline-offset:-2px}";

function definePerfMonitor(tag = 'usa-perf-monitor') {
    return base.defineElement(tag, (Base) => {
        class UsaPerfMonitor extends Base {
            constructor() {
                super(...arguments);
                this._s = { fps: 0, animations: 0, loops: 0, longTasks: 0, clock: 'running' };
            }
            static get observedAttributes() {
                return ['corner', 'warn'];
            }
            get stats() {
                return { ...this._s };
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const corner = ['top-left', 'bottom-right', 'bottom-left', 'inline'].includes(this.str('corner')) ? this.str('corner') : 'top-right';
                this.setAttribute('data-corner', corner);
                this.setAttribute('role', 'status');
                this.setAttribute('aria-label', 'Performance monitor');
                this.insertAdjacentHTML('beforeend', `<button type="button" class="usa-pm-head" aria-expanded="${!this.hasAttribute('collapsed')}" data-usa-part><b class="usa-pm-fps">–</b> fps</button><div class="usa-pm-body" data-usa-part><svg class="usa-pm-spark" viewBox="0 0 60 20" preserveAspectRatio="none" aria-hidden="true"><polyline points=""/></svg><dl><dt>Animations</dt><dd data-k="animations">0</dd><dt>Loops</dt><dd data-k="loops">0</dd><dt>Long tasks</dt><dd data-k="longTasks">0</dd><dt>Clock</dt><dd data-k="clock">running</dd></dl></div>`);
                const head = this.querySelector('.usa-pm-head');
                this.listen(head, 'click', () => {
                    const open = head.getAttribute('aria-expanded') !== 'true';
                    head.setAttribute('aria-expanded', String(open));
                    this.toggleAttribute('collapsed', !open);
                });
                const meter = components_fxPerf.fpsMeter(40);
                this.onCleanup(() => meter.stop());
                let longTasks = 0;
                if (typeof PerformanceObserver !== 'undefined')
                    try {
                        const po = new PerformanceObserver((l) => (longTasks += l.getEntries().length));
                        po.observe({ type: 'longtask', buffered: true });
                        this.onCleanup(() => po.disconnect());
                    }
                    catch {
                        /* longtask not supported */
                    }
                const hist = [];
                let jank = false;
                const tick = () => {
                    const c = base.getClock();
                    this._s = { fps: meter.fps, animations: base.activeAnimations(), loops: base.schedulerStats().loops, longTasks, clock: c.paused ? 'paused' : c.rate === 1 ? 'running' : `${c.rate}×` };
                    hist.push(this._s.fps);
                    if (hist.length > 30)
                        hist.shift();
                    this.querySelector('.usa-pm-fps').textContent = this._s.fps ? String(this._s.fps) : '–';
                    for (const k of ['animations', 'loops', 'longTasks', 'clock']) {
                        const d = this.querySelector(`[data-k=${k}]`);
                        if (d)
                            d.textContent = String(this._s[k]);
                    }
                    const max = 70;
                    this.querySelector('.usa-pm-spark polyline')?.setAttribute('points', hist.map((v, i) => `${(i / 29) * 60},${20 - (Math.min(v, max) / max) * 20}`).join(' '));
                    const low = this._s.fps > 0 && this._s.fps < this.num('warn', 45);
                    this.setFlag('data-jank', low);
                    if (low && !jank)
                        this.emit('jank', { fps: this._s.fps });
                    jank = low;
                };
                const id = setInterval(tick, 500);
                this.onCleanup(() => clearInterval(id));
                tick();
            }
        }
        return UsaPerfMonitor;
    }, { id: 'perf-monitor', text: css$c });
}

var css$b = "usa-worker-canvas{position:relative;display:block;height:160px;border-radius:12px;overflow:hidden;background:#0f172a}usa-worker-canvas>canvas{display:block;width:100%;height:100%}";

const WORKER_SCENES = {
    particles: `function (ctx, t, w, h, s) { if (!s.p) { s.p = Array.from({ length: 90 }, (_, i) => ({ x: (i * 97) % w, y: (i * 53) % h, vx: Math.cos(i) * 0.6, vy: Math.sin(i * 1.3) * 0.6, r: 1 + (i % 3) })); } ctx.fillStyle = 'rgba(15,23,42,0.25)'; ctx.fillRect(0, 0, w, h); for (const q of s.p) { q.x = (q.x + q.vx + w) % w; q.y = (q.y + q.vy + h) % h; ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, 6.283); ctx.fillStyle = 'hsl(' + ((q.x / w) * 120 + 200) + ',90%,65%)'; ctx.fill(); } }`,
    orbits: `function (ctx, t, w, h) { ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, w, h); for (let i = 1; i <= 6; i++) { const a = t / (400 + i * 180); const r = i * Math.min(w, h) / 14; ctx.strokeStyle = 'rgba(148,163,184,0.25)'; ctx.beginPath(); ctx.arc(w / 2, h / 2, r, 0, 6.283); ctx.stroke(); ctx.beginPath(); ctx.arc(w / 2 + Math.cos(a) * r, h / 2 + Math.sin(a) * r, 3 + i / 2, 0, 6.283); ctx.fillStyle = 'hsl(' + i * 50 + ',85%,65%)'; ctx.fill(); } }`,
    starfield: `function (ctx, t, w, h, s) { if (!s.st) { s.st = Array.from({ length: 140 }, (_, i) => ({ x: ((i * 7919) % 1000) / 500 - 1, y: ((i * 104729) % 1000) / 500 - 1, z: (i % 100) / 100 + 0.01 })); } ctx.fillStyle = '#020617'; ctx.fillRect(0, 0, w, h); for (const q of s.st) { q.z -= 0.004; if (q.z <= 0.01) q.z = 1; const x = w / 2 + (q.x / q.z) * w / 4, y = h / 2 + (q.y / q.z) * h / 4; ctx.fillStyle = 'rgba(255,255,255,' + (1 - q.z) + ')'; ctx.fillRect(x, y, 2 - q.z, 2 - q.z); } }`,
};
function defineWorkerCanvas(tag = 'usa-worker-canvas') {
    return base.defineElement(tag, (Base) => {
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
                const r = components_fxPerf.offscreenRender(c, this._prog || WORKER_SCENES[scene], { paused: this.reduced });
                this._backend = r.backend;
                this.setAttribute('data-usa-backend', r.backend);
                this.emit('backend', { backend: r.backend });
                this.onCleanup(() => r.stop());
            }
        }
        return UsaWorkerCanvas;
    }, { id: 'worker-canvas', text: css$b });
}

var css$a = "usa-motion-spec{position:relative;display:block;max-width:100%;overflow-x:auto;padding:10px;border:1px solid rgba(15,23,42,.12);border-radius:12px;background:#fff;color:#0f172a;font:12px/1.35 system-ui,sans-serif}usa-motion-spec .usa-ms-bar-top{display:flex;gap:6px;align-items:center;margin-bottom:6px}usa-motion-spec .usa-ms-bar-top b{margin-right:auto}usa-motion-spec button{padding:4px 10px;border:1px solid #cbd5e1;border-radius:7px;background:#fff;font:600 12px/1 system-ui,sans-serif;cursor:pointer}usa-motion-spec .usa-ms-play{background:#4f46e5;border-color:#4f46e5;color:#fff}usa-motion-spec table{width:100%;border-collapse:collapse}usa-motion-spec th,usa-motion-spec td{padding:5px 6px;border-top:1px solid #f1f5f9;text-align:left;vertical-align:middle}usa-motion-spec thead th{color:#64748b;font-weight:600;border-top:0}usa-motion-spec .usa-ms-trig{padding:1px 6px;border-radius:999px;background:#eef2ff;color:#4338ca;font-weight:700}usa-motion-spec .usa-ms-time{position:relative;min-width:110px}usa-motion-spec .usa-ms-bar{position:relative;display:block;height:8px;border-radius:4px;background:linear-gradient(90deg,#818cf8,#4f46e5);transform-origin:0 50%}usa-motion-spec small{display:block;color:#64748b}usa-motion-spec .usa-ms-curve{width:28px;height:28px;float:left;margin-right:4px}usa-motion-spec .usa-ms-curve path{fill:none;stroke:#4f46e5;stroke-width:2.5}usa-motion-spec .usa-ms-head{position:absolute;top:0;bottom:0;left:0;width:2px;background:#f43f5e;opacity:0;pointer-events:none}";

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
function defineMotionSpec(tag = 'usa-motion-spec') {
    return base.defineElement(tag, (Base) => {
        class UsaMotionSpec extends Base {
            static get observedAttributes() {
                return ['rules', 'label'];
            }
            get parsed() {
                return components_dsl.parseMotion(this.str('rules')).rules;
            }
            get css() {
                return components_design.motionToCss(this.parsed);
            }
            total() {
                return Math.max(400, ...this.parsed.map((r) => (r.delay || 0) + (r.duration ?? 600) + (r.stagger || 0) * 3));
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const rs = this.parsed;
                const T = this.total();
                const curve = (e) => {
                    const [a, b, c, d] = components_design.easingPoints(e || 'cubic-bezier(0.22, 1, 0.36, 1)');
                    return `<svg class="usa-ms-curve" viewBox="0 0 40 40" aria-hidden="true"><path d="M2 38 C${2 + a * 36} ${38 - b * 36} ${2 + c * 36} ${38 - d * 36} 38 2"/></svg>`;
                };
                const rows = rs
                    .map((r) => {
                    const d = r.duration ?? 600;
                    const left = ((r.delay || 0) / T) * 100;
                    const w = (d / T) * 100;
                    return `<tr><th scope="row"><span class="usa-ms-trig" data-t="${r.trigger}">${r.trigger}</span></th><td><code>${esc(r.effect)}</code></td><td class="usa-ms-time"><span class="usa-ms-bar" style="left:${left.toFixed(1)}%;width:${w.toFixed(1)}%"></span><small>${r.delay ? `${r.delay}ms + ` : ''}${d}ms${r.stagger ? ` · stagger ${r.stagger}ms` : ''}</small></td><td>${curve(r.easing)}<small>${esc(r.easing || 'default')}</small></td></tr>`;
                })
                    .join('');
                this.insertAdjacentHTML('beforeend', `<div class="usa-ms-bar-top" data-usa-part><b>${esc(this.str('label', 'Motion spec'))}</b><button type="button" class="usa-ms-play">Play</button><button type="button" class="usa-ms-copy">Copy CSS</button></div><table class="usa-ms" aria-label="${esc(this.str('label', 'Motion spec'))}" data-usa-part><thead><tr><th scope="col">Trigger</th><th scope="col">Effect</th><th scope="col">Timing (${T}ms)</th><th scope="col">Easing</th></tr></thead><tbody>${rows || '<tr><td colspan="4">No rules</td></tr>'}</tbody></table><span class="usa-ms-head" aria-hidden="true" data-usa-part></span>`);
                this.listen(this.querySelector('.usa-ms-play'), 'click', () => this.play());
                this.listen(this.querySelector('.usa-ms-copy'), 'click', async () => {
                    let ok = false;
                    try {
                        await navigator.clipboard.writeText(this.css);
                        ok = true;
                    }
                    catch {
                        ok = false;
                    }
                    this.emit('copy', { ok });
                });
            }
            play() {
                if (this.reduced)
                    return;
                const T = this.total();
                this.querySelectorAll('.usa-ms-bar').forEach((b) => this.motion(b, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: Math.min(1600, T), easing: 'linear', fill: 'backwards' }));
                const h = this.querySelector('.usa-ms-head');
                if (h)
                    this.motion(h, [{ left: '0%', opacity: 1 }, { left: '100%', opacity: 1 }], { duration: Math.min(1600, T), easing: 'linear' });
            }
        }
        return UsaMotionSpec;
    }, { id: 'motion-spec', text: css$a });
}

var css$9 = "usa-native-preview{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-start;max-width:100%;font:12px/1.4 system-ui,sans-serif}usa-native-preview .usa-np-device{position:relative;flex:none;width:150px;height:280px;padding:26px 8px 10px;border-radius:30px;background:#0f172a;box-shadow:0 14px 30px -16px rgba(15,23,42,.8);box-sizing:border-box}usa-native-preview[data-platform=android] .usa-np-device{border-radius:18px;padding-top:18px}usa-native-preview .usa-np-notch{position:absolute;top:8px;left:50%;width:52px;height:12px;margin-left:-26px;border-radius:8px;background:#000}usa-native-preview[data-platform=android] .usa-np-notch{width:8px;height:8px;margin-left:-4px;border-radius:50%;top:6px}usa-native-preview .usa-np-screen{display:flex;flex-direction:column;gap:8px;height:100%;padding:10px;border-radius:22px;background:#f8fafc;overflow:hidden;box-sizing:border-box}usa-native-preview[data-platform=android] .usa-np-screen{border-radius:10px}usa-native-preview .usa-np-side{flex:1 1 200px;min-width:0}usa-native-preview [role=tablist]{display:flex;gap:4px;flex-wrap:wrap}usa-native-preview [role=tablist] button{padding:4px 8px;border:1px solid #cbd5e1;border-radius:7px;background:#fff;font:600 11px/1 system-ui,sans-serif;cursor:pointer}usa-native-preview [aria-selected=true]{background:#0f172a!important;color:#fff;border-color:#0f172a!important}usa-native-preview .usa-np-replay{margin-left:auto;background:#4f46e5!important;color:#fff;border-color:#4f46e5!important}usa-native-preview .usa-np-code{margin:6px 0 0;padding:8px;max-height:230px;overflow:auto;border-radius:8px;background:#0f172a;color:#e2e8f0;font:10.5px/1.45 ui-monospace,monospace;white-space:pre}";

function defineNativePreview(tag = 'usa-native-preview') {
    return base.defineElement(tag, (Base) => {
        class UsaNativePreview extends Base {
            static get observedAttributes() {
                return ['rules', 'platform', 'name'];
            }
            code(platform) {
                const opts = { name: this.str('name', 'MotionView') };
                return platform === 'flutter' ? components_native.toFlutter(this.str('rules'), opts) : components_native.toReactNative(this.str('rules'), opts);
            }
            items() {
                return Array.from(this.querySelectorAll(':scope > .usa-np-device > .usa-np-screen > *'));
            }
            mount() {
                const plat = this.str('platform') === 'android' ? 'android' : 'ios';
                this.setAttribute('data-platform', plat);
                if (!this.querySelector(':scope > .usa-np-device')) {
                    const kids = Array.from(this.childNodes);
                    this.insertAdjacentHTML('afterbegin', '<div class="usa-np-device"><span class="usa-np-notch" aria-hidden="true"></span><div class="usa-np-screen"></div></div><div class="usa-np-side"><div role="tablist" aria-label="Native code"><button type="button" role="tab" data-p="react-native">React Native</button><button type="button" role="tab" data-p="flutter">Flutter</button><button type="button" class="usa-np-replay">Replay</button></div><pre class="usa-np-code" tabindex="0"><code></code></pre></div>');
                    const scr = this.querySelector('.usa-np-screen');
                    kids.forEach((k) => scr.appendChild(k));
                }
                let cur = 'react-native';
                const show = () => {
                    this.querySelectorAll('[role=tab][data-p]').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.p === cur)));
                    const c = this.querySelector('.usa-np-code code');
                    if (c)
                        c.textContent = this.code(cur);
                };
                this.listen(this, 'click', (e) => {
                    const t = e.target;
                    const tab = t.closest?.('[data-p]');
                    if (tab) {
                        cur = tab.dataset.p;
                        show();
                    }
                    if (t.closest?.('.usa-np-replay'))
                        this.replay();
                });
                this.listen(this, 'pointerdown', (e) => {
                    const it = e.target.closest?.('.usa-np-screen > *');
                    if (it && !this.reduced)
                        this.motion(it, [{ transform: 'scale(1)' }, { transform: 'scale(.92)', offset: 0.35 }, { transform: 'scale(1.03)', offset: 0.75 }, { transform: 'scale(1)' }], { duration: 420, easing: 'ease-out' });
                });
                show();
                let seen = false;
                this.inView((v) => {
                    if (v && !seen) {
                        seen = true;
                        this.replay();
                    }
                });
            }
            replay() {
                const r = components_dsl.parseMotion(this.str('rules')).rules.find((x) => x.trigger === 'enter' || x.trigger === 'load');
                if (!r || this.reduced)
                    return;
                const f = components_native.entranceFrom(r.effect);
                this.items().forEach((el, i) => this.motion(el, [{ opacity: f.opacity, transform: `translate(${f.x}px, ${f.y}px) scale(${f.scale})` }, { opacity: 1, transform: 'none' }], { duration: r.duration ?? 600, delay: (r.delay || 0) + (r.stagger || 0) * i, easing: r.easing || 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'backwards' }));
                this.emit('replay');
            }
        }
        return UsaNativePreview;
    }, { id: 'native-preview', text: css$9 });
}

/**
 * 10.1: how runtime-powered components reach `motionary/runtime` without
 * importing it — they read the page-wide module registry (only the tiny
 * registry file is bundled with the component) and, when a module is
 * missing, show the clear install / import / CDN message in place, log it
 * once and dispatch `usa:runtime-missing`.
 */
const logged = new Set();
/** The module API, or null after rendering the "missing module" notice into `host`. */
function runtimeModule(host, id) {
    const who = `<${host.localName}>`;
    try {
        return registry$1.requireModule(id, who);
    }
    catch {
        const msg = registry$1.missingMessage(id, who);
        if (!logged.has(id + who)) {
            logged.add(id + who);
            console.error(msg);
        }
        if (!host.querySelector(':scope > .usa-rt-missing')) {
            const p = document.createElement('p');
            p.className = 'usa-rt-missing';
            p.setAttribute('role', 'alert');
            p.textContent = msg;
            host.prepend(p);
        }
        host.dispatchEvent(new CustomEvent('usa:runtime-missing', { detail: { module: id, message: msg }, bubbles: true }));
        return null;
    }
}

var css$8 = "usa-plugin-card{display:block;max-width:100%;box-sizing:border-box;padding:14px;border-radius:16px;background:#fff;border:1px solid #e2e8f0;box-shadow:0 10px 26px -18px rgba(15,23,42,.55);color:#0f172a;font:13px/1.45 system-ui,sans-serif}usa-plugin-card .usa-pc-head{display:flex;align-items:center;gap:10px;min-width:0}usa-plugin-card .usa-pc-logo{flex:none;display:grid;place-items:center;width:38px;height:38px;border-radius:11px;background:linear-gradient(135deg,#6366f1,#ec4899);color:#fff;font:800 17px/1 system-ui,sans-serif}usa-plugin-card .usa-pc-meta{display:flex;flex-direction:column;min-width:0;flex:1}usa-plugin-card .usa-pc-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px}usa-plugin-card .usa-pc-sub{color:#64748b;font-size:11.5px}usa-plugin-card .usa-pc-dl{flex:none;color:#475569;font:600 12px/1 ui-monospace,monospace}usa-plugin-card .usa-pc-badges{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0 8px}usa-plugin-card .usa-pc-badge{padding:3px 8px;border-radius:999px;background:#f1f5f9;color:#334155;font:600 11px/1.3 system-ui,sans-serif}usa-plugin-card .usa-pc-compat[data-ok=true],usa-plugin-card .usa-pc-sig[data-state=ok]{background:#dcfce7;color:#166534}usa-plugin-card .usa-pc-compat[data-ok=false],usa-plugin-card .usa-pc-sig[data-state=bad]{background:#fee2e2;color:#991b1b}usa-plugin-card .usa-pc-more{padding:5px 10px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;font:600 12px/1 system-ui,sans-serif;cursor:pointer}usa-plugin-card .usa-pc-details{margin-top:8px;color:#334155}usa-plugin-card .usa-rt-missing{margin:0 0 8px;padding:8px;border-radius:8px;background:#fef2f2;color:#991b1b;font:11px/1.4 ui-monospace,monospace;overflow-wrap:anywhere}";

const fmt = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'k' : String(Math.round(n)));
function definePluginCard(tag = 'usa-plugin-card') {
    return base.defineElement(tag, (Base) => {
        class UsaPluginCard extends Base {
            constructor() {
                super(...arguments);
                this.rt = null;
            }
            static get observedAttributes() {
                return ['name', 'title', 'version', 'author', 'engine', 'downloads', 'integrity', 'src'];
            }
            compat() {
                return components_marketplace.checkCompat({ name: this.str('title', this.str('name')), engines: { motionary: this.str('engine', '*') } }, registry$1.RUNTIME_VERSION);
            }
            mount() {
                this.rt = runtimeModule(this, 'core');
                if (!this.querySelector(':scope > .usa-pc-head')) {
                    const kids = Array.from(this.childNodes).filter((n) => !(n instanceof HTMLElement && n.classList.contains('usa-rt-missing')));
                    const name = this.str('title', this.str('name', 'plugin'));
                    this.insertAdjacentHTML('beforeend', `<div class="usa-pc-head"><span class="usa-pc-logo" aria-hidden="true"></span><div class="usa-pc-meta"><strong class="usa-pc-name"></strong><span class="usa-pc-sub"></span></div><span class="usa-pc-dl" aria-label="downloads"><b>0</b> ↓</span></div><div class="usa-pc-badges"><span class="usa-pc-badge usa-pc-compat"></span><span class="usa-pc-badge usa-pc-sig"></span></div><button type="button" class="usa-pc-more" aria-expanded="false">Details</button><div class="usa-pc-details" hidden></div>`);
                    this.querySelector('.usa-pc-logo').textContent = name.slice(0, 1).toUpperCase();
                    this.querySelector('.usa-pc-name').textContent = name;
                    const det = this.querySelector('.usa-pc-details');
                    kids.forEach((k) => det.appendChild(k));
                }
                this.querySelector('.usa-pc-sub').textContent = `v${this.str('version', '1.0.0')}${this.str('author') ? ' · ' + this.str('author') : ''}`;
                const c = this.compat();
                const cb = this.querySelector('.usa-pc-compat');
                cb.textContent = c.ok ? `✓ Motionary ${c.range}` : `✕ needs ${c.range}`;
                cb.dataset.ok = String(c.ok);
                cb.title = c.message;
                const sig = this.querySelector('.usa-pc-sig');
                sig.textContent = this.str('integrity') ? 'Signed' : 'Unsigned';
                sig.dataset.state = this.str('integrity') ? 'pending' : 'none';
                if (this.str('integrity') && this.str('src'))
                    this.verify();
                this.listen(this.querySelector('.usa-pc-more'), 'click', () => this.toggle());
                this.countUp();
            }
            countUp() {
                const b = this.querySelector('.usa-pc-dl b');
                const total = this.num('downloads', 0);
                if (!this.rt || this.reduced) {
                    b.textContent = fmt(total);
                    return;
                }
                const o = { n: 0 };
                let seen = false;
                this.inView((v) => {
                    if (!v || seen || !this.rt)
                        return;
                    seen = true;
                    const tw = this.rt.tween(o, { to: { n: total }, duration: 1200, ease: 'expo-out', onUpdate: () => (b.textContent = fmt(o.n)) });
                    this.onCleanup(() => tw.kill());
                });
            }
            toggle(open) {
                const det = this.querySelector('.usa-pc-details');
                const btn = this.querySelector('.usa-pc-more');
                if (!det || !btn)
                    return;
                const next = open ?? det.hidden;
                btn.setAttribute('aria-expanded', String(next));
                if (next)
                    det.hidden = false;
                if (this.rt && !this.reduced) {
                    const h = det.scrollHeight;
                    det.style.overflow = 'hidden';
                    const tw = this.rt.tween(det, { from: { height: next ? '0px' : h + 'px', opacity: next ? 0 : 1 }, to: { height: next ? h + 'px' : '0px', opacity: next ? 1 : 0 }, duration: 320, ease: 'cubic-out', onComplete: () => { det.style.height = ''; det.style.overflow = ''; if (!next)
                            det.hidden = true; } });
                    this.onCleanup(() => tw.kill());
                }
                else if (!next)
                    det.hidden = true;
                this.emit('toggle', { open: next });
            }
            async verify() {
                const sig = this.querySelector('.usa-pc-sig');
                const integrity = this.str('integrity'), src = this.str('src');
                if (!integrity || !src || typeof fetch !== 'function')
                    return null;
                let ok = false;
                try {
                    const code = await (await fetch(src)).text();
                    ok = await components_marketplace.verifyPlugin(code, integrity);
                }
                catch {
                    ok = false;
                }
                if (sig) {
                    sig.textContent = ok ? '✓ Verified' : '✕ Signature mismatch';
                    sig.dataset.state = ok ? 'ok' : 'bad';
                }
                this.emit('verified', { ok });
                return ok;
            }
        }
        return UsaPluginCard;
    }, { id: 'plugin-card', text: css$8 });
}

var css$7 = "usa-install-button{display:inline-flex;flex-direction:column;gap:6px;max-width:100%;box-sizing:border-box;font:12px/1.4 system-ui,sans-serif}usa-install-button [role=tablist]{display:flex;flex-wrap:wrap;gap:4px}usa-install-button [role=tab]{padding:4px 9px;border:1px solid #cbd5e1;border-radius:999px;background:#fff;color:#334155;font:600 11px/1 system-ui,sans-serif;cursor:pointer}usa-install-button [role=tab][aria-selected=true]{background:#0f172a;border-color:#0f172a;color:#fff}usa-install-button .usa-ib-row{display:flex;align-items:stretch;min-width:0;border-radius:10px;background:#0f172a;color:#e2e8f0;overflow:hidden}usa-install-button code{flex:1;min-width:0;padding:9px 10px;font:12px/1.4 ui-monospace,monospace;white-space:pre-wrap;overflow-wrap:anywhere}usa-install-button .usa-ib-copy{flex:none;position:relative;min-width:74px;padding:0 12px;border:0;background:#4f46e5;color:#fff;font:700 12px/1 system-ui,sans-serif;cursor:pointer}usa-install-button .usa-ib-copy[data-copied]{background:#16a34a}";

const MANAGERS = ['npm', 'pnpm', 'yarn', 'bun', 'cdn'];
function defineInstallButton(tag = 'usa-install-button') {
    return base.defineElement(tag, (Base) => {
        class UsaInstallButton extends Base {
            constructor() {
                super(...arguments);
                this.cur = 'npm';
            }
            static get observedAttributes() {
                return ['package', 'managers', 'cdn', 'dev', 'manager'];
            }
            list() {
                const l = this.str('managers', 'npm pnpm yarn cdn').split(/[\s,]+/).filter((m) => MANAGERS.includes(m));
                return l.length ? l : ['npm'];
            }
            command(manager = this.cur) {
                const pkg = this.str('package', 'motionary');
                const dev = this.flag('dev');
                switch (manager) {
                    case 'pnpm': return `pnpm add ${dev ? '-D ' : ''}${pkg}`;
                    case 'yarn': return `yarn add ${dev ? '-D ' : ''}${pkg}`;
                    case 'bun': return `bun add ${dev ? '-d ' : ''}${pkg}`;
                    case 'cdn': {
                        const url = this.str('cdn', `https://cdn.jsdelivr.net/npm/${pkg}/+esm`);
                        return url.endsWith('.css') ? `<link rel="stylesheet" href="${url}">` : /\+esm$|\.mjs$/.test(url) ? `<script type="module">import * as m from '${url}';</script>` : `<script src="${url}"></script>`;
                    }
                    default: return `npm i ${dev ? '-D ' : ''}${pkg}`;
                }
            }
            mount() {
                const list = this.list();
                this.cur = list.includes(this.str('manager')) ? this.str('manager') : list[0];
                this.innerHTML = `<div role="tablist" aria-label="Package manager">${list.map((m) => `<button type="button" role="tab" data-m="${m}">${m === 'cdn' ? 'CDN' : m}</button>`).join('')}</div><div class="usa-ib-row"><code></code><button type="button" class="usa-ib-copy" aria-live="polite">Copy</button></div>`;
                const show = (animate = false) => {
                    this.querySelectorAll('[role=tab]').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.m === this.cur)));
                    const code = this.querySelector('code');
                    code.textContent = this.command();
                    if (animate && !this.reduced)
                        this.motion(code, [{ opacity: 0.25, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: 'cubic-bezier(.22,1,.36,1)' });
                };
                this.listen(this, 'click', (e) => {
                    const t = e.target;
                    const tab = t.closest?.('[data-m]');
                    if (tab) {
                        this.cur = tab.dataset.m;
                        show(true);
                    }
                    if (t.closest?.('.usa-ib-copy'))
                        this.copy();
                });
                show();
            }
            async copy() {
                const text = this.command();
                try {
                    await navigator.clipboard?.writeText(text);
                }
                catch {
                    /* clipboard blocked: the snippet stays selectable */
                }
                const b = this.querySelector('.usa-ib-copy');
                if (b) {
                    b.textContent = '✓ Copied';
                    b.setAttribute('data-copied', '');
                    if (!this.reduced)
                        this.motion(b, [{ transform: 'scale(1)' }, { transform: 'scale(.9)', offset: 0.3 }, { transform: 'scale(1.06)', offset: 0.7 }, { transform: 'scale(1)' }], { duration: 380, easing: 'ease-out' });
                    const id = setTimeout(() => {
                        b.textContent = 'Copy';
                        b.removeAttribute('data-copied');
                    }, 1600);
                    this.onCleanup(() => clearTimeout(id));
                }
                this.emit('copy', { text, manager: this.cur });
                return text;
            }
        }
        return UsaInstallButton;
    }, { id: 'install-button', text: css$7 });
}

var css$6 = "usa-scroll-scene{display:block;position:relative;max-width:100%;box-sizing:border-box}usa-scroll-scene [data-scrub]{will-change:transform,opacity}usa-scroll-scene .usa-rt-missing{margin:0 0 8px;padding:8px;border-radius:8px;background:#fef2f2;color:#991b1b;font:11px/1.4 ui-monospace,monospace;overflow-wrap:anywhere}";

/** 'opacity: 0 -> 1; x: -80 -> 0' → [{ from: { opacity: '0', x: '-80' }, to: {...} }] */
function parseScrub(spec) {
    const from = {}, to = {};
    for (const part of spec.split(';')) {
        const m = /^\s*([\w-]+)\s*:\s*([^>]+?)\s*->\s*(.+?)\s*$/.exec(part);
        if (!m)
            continue;
        const k = m[1].replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        from[k] = m[2];
        to[k] = m[3];
    }
    return { from, to };
}
function defineScrollScene(tag = 'usa-scroll-scene') {
    return base.defineElement(tag, (Base) => {
        class UsaScrollScene extends Base {
            constructor() {
                super(...arguments);
                this.scene = null;
                this.tl = null;
            }
            static get observedAttributes() {
                return ['start', 'end', 'scrub', 'pin', 'markers', 'stagger', 'toggle-class', 'preview'];
            }
            get progress() {
                return this.scene?.progress ?? 0;
            }
            timeline() {
                return this.tl;
            }
            refresh() {
                this.scene?.refresh();
            }
            mount() {
                const sc = runtimeModule(this, 'scroll');
                const core = sc && registry$1.requireModule('core'); // registered by use(scroll)
                if (!sc || !core)
                    return;
                const items = Array.from(this.querySelectorAll('[data-scrub]'));
                const stagger = this.num('stagger', 0);
                const tl = core.timeline({ paused: true });
                items.forEach((el, i) => {
                    const { from, to } = parseScrub(el.dataset.scrub || '');
                    tl.add(new core.Tween(el, { from, to, duration: Math.max(100, 1000 - stagger * (items.length - 1)), ease: this.reduced ? 'linear' : 'cubic-out', paused: true }), stagger * i);
                });
                tl.seek(0);
                this.tl = tl;
                const scrubAttr = this.getAttribute('scrub');
                const scrub = scrubAttr === null ? false : scrubAttr === '' || scrubAttr === 'true' ? true : Number(scrubAttr) || true;
                const canScroll = document.documentElement.scrollHeight > innerHeight + 2;
                if (this.flag('preview') && !canScroll) {
                    if (!this.reduced) {
                        const loop = core.timeline({ repeat: -1, yoyo: true, paused: true }).add(tl, 0);
                        loop.play();
                        this.onCleanup(() => loop.kill());
                    }
                    else
                        tl.progress = 1;
                    this.setAttribute('data-preview', '');
                    return;
                }
                this.scene = sc.scrollScene({
                    trigger: this,
                    start: this.str('start', 'top 85%'),
                    end: this.str('end', 'bottom 35%'),
                    scrub,
                    pin: this.flag('pin'),
                    markers: this.flag('markers'),
                    toggleClass: this.str('toggle-class') || undefined,
                    animation: tl,
                    onEnter: () => this.emit('enter'),
                    onLeave: () => this.emit('leave'),
                    onUpdate: (s) => this.emit('progress', { progress: s.progress }),
                });
                this.onCleanup(() => {
                    this.scene?.kill();
                    this.scene = null;
                    tl.kill();
                });
            }
        }
        return UsaScrollScene;
    }, { id: 'scroll-scene', text: css$6 });
}

var css$5 = "usa-motion-inspector{display:block;max-width:100%;box-sizing:border-box;padding:10px;border-radius:14px;background:#0f172a;color:#e2e8f0;font:12px/1.4 system-ui,sans-serif}usa-motion-inspector .usa-mi-bar{display:flex;justify-content:space-between;gap:8px;align-items:baseline;flex-wrap:wrap}usa-motion-inspector .usa-mi-rt{color:#94a3b8;font:11px/1.2 ui-monospace,monospace}usa-motion-inspector .usa-mi-tools{display:flex;flex-wrap:wrap;gap:4px;margin:8px 0}usa-motion-inspector button{padding:4px 8px;border:1px solid #334155;border-radius:7px;background:#1e293b;color:#e2e8f0;font:600 11px/1 system-ui,sans-serif;cursor:pointer}usa-motion-inspector button[aria-pressed=true]{background:#6366f1;border-color:#6366f1}usa-motion-inspector .usa-mi-list{margin:0;padding:0;list-style:none;display:grid;gap:4px;max-height:180px;overflow:auto}usa-motion-inspector .usa-mi-list li{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 8px;padding:5px 6px;border-radius:7px;background:#1e293b}usa-motion-inspector .usa-mi-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:11px/1.3 ui-monospace,monospace}usa-motion-inspector .usa-mi-state{color:#a5b4fc;font-size:10.5px}usa-motion-inspector li[data-state=paused] .usa-mi-state{color:#fbbf24}usa-motion-inspector input[type=range]{grid-column:1/-1;width:100%;margin:0;accent-color:#818cf8}usa-motion-inspector .usa-mi-empty{display:block!important;color:#94a3b8}";

const label = (a) => {
    const t = a.effect?.target;
    const name = a.animationName || a.transitionProperty || a.id || 'animate()';
    if (!t)
        return name;
    const cls = typeof t.className === 'string' && t.className.trim() ? '.' + t.className.trim().split(/\s+/)[0] : '';
    return `${t.localName}${t.id ? '#' + t.id : cls} · ${name}`;
};
function defineMotionInspector(tag = 'usa-motion-inspector') {
    return base.defineElement(tag, (Base) => {
        class UsaMotionInspector extends Base {
            constructor() {
                super(...arguments);
                this.rate = 1;
            }
            static get observedAttributes() {
                return ['scope', 'interval'];
            }
            animations() {
                const scope = this.str('scope') ? document.querySelector(this.str('scope')) : document;
                if (!scope)
                    return [];
                const list = typeof scope.getAnimations === 'function' ? scope.getAnimations(scope === document ? undefined : { subtree: true }) : [];
                return list.filter((a) => !this.contains(a.effect?.target || null));
            }
            pauseAll() {
                this.animations().forEach((a) => a.pause());
                this.refresh();
            }
            playAll() {
                this.animations().forEach((a) => a.play());
                this.refresh();
            }
            setRate(rate) {
                this.rate = rate > 0 ? rate : 1;
                this.animations().forEach((a) => (a.playbackRate = this.rate));
                if (registry$1.hasModule('core'))
                    registry$1.requireModule('core').getTicker().timeScale = this.rate;
                this.querySelectorAll('[data-rate]').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.rate) === this.rate)));
                this.emit('change', { rate: this.rate });
            }
            mount() {
                this.innerHTML = '<div class="usa-mi-bar"><strong>Motion inspector</strong><span class="usa-mi-rt" aria-live="polite"></span></div><div class="usa-mi-tools" role="toolbar" aria-label="Animation controls"><button type="button" data-act="pause">Pause all</button><button type="button" data-act="play">Play all</button><button type="button" data-rate="1" aria-pressed="true">1×</button><button type="button" data-rate="0.25" aria-pressed="false">0.25×</button></div><ol class="usa-mi-list" aria-label="Running animations"></ol>';
                this.listen(this, 'click', (e) => {
                    const b = e.target.closest?.('button');
                    if (!b)
                        return;
                    if (b.dataset.act === 'pause')
                        this.pauseAll();
                    if (b.dataset.act === 'play')
                        this.playAll();
                    if (b.dataset.rate)
                        this.setRate(Number(b.dataset.rate));
                });
                this.listen(this, 'input', (e) => {
                    const r = e.target;
                    const a = this.animations()[Number(r.dataset.i)];
                    const d = Number(a?.effect?.getComputedTiming().duration) || 0;
                    if (a && d) {
                        a.pause();
                        a.currentTime = (Number(r.value) / 100) * d;
                    }
                });
                this.refresh();
                let id = null;
                this.inView((v) => {
                    if (v && !id)
                        id = setInterval(() => this.refresh(), Math.max(100, this.num('interval', 500)));
                    if (!v && id) {
                        clearInterval(id);
                        id = null;
                    }
                });
                this.onCleanup(() => id && clearInterval(id));
            }
            refresh() {
                const list = this.querySelector('.usa-mi-list');
                if (!list)
                    return;
                const anims = this.animations();
                const rt = this.querySelector('.usa-mi-rt');
                if (registry$1.hasModule('core')) {
                    const t = registry$1.requireModule('core').getTicker();
                    rt.textContent = `runtime ${t.fps} fps · ${t.size} listener${t.size === 1 ? '' : 's'}`;
                }
                else
                    rt.textContent = `${anims.length} running`;
                list.textContent = '';
                anims.slice(0, 12).forEach((a, i) => {
                    const timing = a.effect?.getComputedTiming();
                    const p = Math.round((timing?.progress ?? 0) * 100);
                    const li = document.createElement('li');
                    li.dataset.state = a.playState;
                    li.innerHTML = '<span class="usa-mi-name"></span><span class="usa-mi-state"></span><input type="range" min="0" max="100" aria-label="Scrub">';
                    li.firstChild.textContent = label(a);
                    li.children[1].textContent = a.playState;
                    const r = li.querySelector('input');
                    r.value = String(p);
                    r.dataset.i = String(i);
                    list.appendChild(li);
                });
                if (!anims.length)
                    list.innerHTML = '<li class="usa-mi-empty">No running animations</li>';
                this.emit('change', { count: anims.length });
            }
        }
        return UsaMotionInspector;
    }, { id: 'motion-inspector', text: css$5 });
}

var css$4 = "usa-route-transition{display:block;max-width:100%;box-sizing:border-box}usa-route-transition template{display:none}::view-transition-old(root),::view-transition-new(root){animation-duration:.28s}";

const KF = {
    fade: [[{ opacity: 1 }, { opacity: 0 }], [{ opacity: 0 }, { opacity: 1 }]],
    slide: [[{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(-24px)' }], [{ opacity: 0, transform: 'translateX(24px)' }, { opacity: 1, transform: 'none' }]],
    zoom: [[{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.94)' }], [{ opacity: 0, transform: 'scale(1.04)' }, { opacity: 1, transform: 'none' }]],
};
let crossDocDone = false;
function defineRouteTransition(tag = 'usa-route-transition') {
    return base.defineElement(tag, (Base) => {
        class UsaRouteTransition extends Base {
            constructor() {
                super(...arguments);
                this.cur = '';
            }
            static get observedAttributes() {
                return ['effect', 'engine', 'cross-document'];
            }
            get current() {
                return this.cur;
            }
            shared(root = this) {
                root.querySelectorAll('[data-shared]').forEach((el) => (el.style.viewTransitionName = `usa-${el.dataset.shared}`));
            }
            mount() {
                this.cur = this.str('current', typeof location !== 'undefined' ? location.pathname : '/');
                if (this.flag('cross-document') && !crossDocDone && typeof document !== 'undefined') {
                    crossDocDone = true;
                    const st = document.createElement('style');
                    st.dataset.usaRoute = '';
                    st.textContent = '@view-transition{navigation:auto}';
                    document.head.appendChild(st);
                }
                this.shared();
                const scopeAll = this.str('links', 'inside') === 'document';
                const onClick = (e) => {
                    const t = e.target;
                    const btn = t.closest?.('[data-to]');
                    if (btn && this.contains(btn)) {
                        e.preventDefault();
                        this.navigate(btn.dataset.to, { history: 'off' });
                        return;
                    }
                    const a = t.closest?.('a[href]');
                    if (!a || (!scopeAll && !this.contains(a)) || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
                        return;
                    if ((a.target && a.target !== '_self') || a.hasAttribute('download') || a.dataset.noRoute !== undefined)
                        return;
                    const u = new URL(a.href, location.href);
                    if (u.origin !== location.origin || (u.pathname === location.pathname && u.hash))
                        return;
                    e.preventDefault();
                    this.navigate(u.pathname + u.search);
                };
                this.listen(scopeAll ? document : this, 'click', onClick);
                this.listen(window, 'popstate', () => {
                    if (this.str('history', 'push') !== 'off')
                        this.navigate(location.pathname + location.search, { history: 'off' });
                });
            }
            async content(url) {
                const tpl = Array.from(this.querySelectorAll('template[data-route]')).find((t) => t.dataset.route === url);
                if (tpl)
                    return { html: tpl.innerHTML };
                if (typeof fetch !== 'function')
                    return null;
                const res = await fetch(url, { headers: { accept: 'text/html' } });
                if (!res.ok)
                    return null;
                const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
                const sel = this.str('selector') || (this.id ? `#${this.id}` : this.localName);
                const el = doc.querySelector(sel);
                return el ? { html: el.innerHTML, title: doc.title } : null;
            }
            async navigate(url, opts = {}) {
                if (!this.emit('navigate', { url, from: this.cur }))
                    return false;
                const next = await this.content(url);
                if (!next) {
                    if (!this.querySelector(`template[data-route="${url}"]`) && typeof location !== 'undefined' && /^\//.test(url) && opts.history !== 'off')
                        location.assign(url);
                    return false;
                }
                const templates = Array.from(this.querySelectorAll('template[data-route]'));
                const swap = () => {
                    this.innerHTML = next.html;
                    templates.forEach((t) => this.appendChild(t));
                    this.shared();
                    if (next.title)
                        document.title = next.title;
                };
                const hist = opts.history || this.str('history', 'push');
                if (hist !== 'off' && typeof history !== 'undefined')
                    history[hist === 'replace' ? 'replaceState' : 'pushState']({ usaRoute: url }, '', url);
                const engine = this.str('engine', 'auto');
                const fx = KF[this.str('effect', 'fade')] || KF.fade;
                const vt = document.startViewTransition;
                if (this.reduced)
                    swap();
                else if (engine !== 'waapi' && typeof vt === 'function')
                    await vt.call(document, swap).finished.catch(() => undefined);
                else {
                    const out = this.motion(this, fx[0], { duration: 160, easing: 'ease-in', fill: 'forwards' });
                    // never wait longer than the exit animation: `finished` can stall (background tabs, test DOMs, cancelled effects)
                    if (out)
                        await Promise.race([out.finished.catch(() => undefined), new Promise((r) => setTimeout(r, 200))]);
                    swap();
                    out?.cancel();
                    this.motion(this, fx[1], { duration: 260, easing: 'cubic-bezier(.22,1,.36,1)' });
                }
                this.cur = url;
                this.emit('navigated', { url });
                return true;
            }
        }
        return UsaRouteTransition;
    }, { id: 'route-transition', text: css$4 });
}

var css$3 = "usa-text-splitter{display:block;max-width:100%}usa-text-splitter .usa-split-word{white-space:nowrap}usa-text-splitter .usa-split-char,usa-text-splitter .usa-split-word,usa-text-splitter .usa-split-line{will-change:transform,opacity}usa-text-splitter .usa-rt-missing{margin:0 0 8px;padding:8px;border-radius:8px;background:#fef2f2;color:#991b1b;font:11px/1.4 ui-monospace,monospace;overflow-wrap:anywhere}";

const FROM = {
    rise: { y: '0.9em', opacity: 0 },
    fade: { opacity: 0 },
    blur: { opacity: 0, filter: 'blur(8px)', scale: 1.3 },
    flip: { rotate: -90, opacity: 0, y: '0.4em' },
    wave: { y: '-0.6em', opacity: 0, scale: 0.6 },
};
const TO = {
    rise: { y: '0em', opacity: 1 },
    fade: { opacity: 1 },
    blur: { opacity: 1, filter: 'blur(0px)', scale: 1 },
    flip: { rotate: 0, opacity: 1, y: '0em' },
    wave: { y: '0em', opacity: 1, scale: 1 },
};
function defineTextSplitter(tag = 'usa-text-splitter') {
    return base.defineElement(tag, (Base) => {
        class UsaTextSplitter extends Base {
            constructor() {
                super(...arguments);
                this.res = null;
                this.anim = null;
            }
            static get observedAttributes() {
                return ['split', 'effect', 'stagger', 'duration', 'loop', 'trigger'];
            }
            pieces() {
                const r = this.res;
                if (!r)
                    return [];
                const by = this.str('split', 'chars');
                return by === 'lines' && r.lines.length ? r.lines : by === 'words' ? r.words : r.chars;
            }
            mount() {
                const tx = runtimeModule(this, 'text');
                if (!tx)
                    return;
                const by = this.str('split', 'chars');
                this.res = tx.splitText(this, { type: by === 'lines' ? 'words,lines' : by === 'words' ? 'words' : 'chars,words' });
                this.emit('split', { count: this.pieces().length });
                this.onCleanup(() => {
                    this.anim?.kill();
                    this.res?.revert();
                    this.res = null;
                });
                const trig = this.str('trigger', 'view');
                if (trig === 'load')
                    this.replay();
                else if (trig === 'hover')
                    this.listen(this, 'pointerenter', () => this.replay());
                else {
                    this.pieces().forEach((p) => (p.style.opacity = this.reduced ? '' : '0'));
                    this.inView((v) => v && !this.anim && this.replay());
                }
                if (this.flag('loop')) {
                    const id = setInterval(() => this.replay(), Math.max(2500, this.num('duration', 600) + this.num('stagger', 30) * this.pieces().length + 1500));
                    this.onCleanup(() => clearInterval(id));
                }
            }
            replay() {
                const pieces = this.pieces();
                if (!pieces.length)
                    return;
                this.anim?.kill();
                if (this.reduced) {
                    pieces.forEach((p) => (p.style.opacity = ''));
                    this.emit('done');
                    return;
                }
                const core = registry$1.requireModule('core');
                const fx = FROM[this.str('effect', 'rise')] ? this.str('effect', 'rise') : 'rise';
                this.anim = core.tween(pieces, { from: FROM[fx], to: TO[fx], duration: this.num('duration', 600), stagger: this.num('stagger', 30), ease: fx === 'wave' ? 'back-out' : 'cubic-out', onComplete: () => this.emit('done') });
            }
        }
        return UsaTextSplitter;
    }, { id: 'text-splitter', text: css$3 });
}

/**
 * 10.4 (scroll-driven 3.0): shared helpers for components that prefer the
 * browser's native scroll-driven animations (`animation-timeline: scroll()` /
 * `view()`) and fall back to a small JS scroll loop where they are missing.
 */
let uid = 0;
/** A unique CSS dashed ident ('--usa-sd-3'). */
const timelineName = (p = 'usa-sd') => `--${p}-${++uid}`;
/** Native scroll / view timelines are available (`engine="auto"`). */
function nativeScrollTimelines(kind = 'scroll') {
    return typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('animation-timeline', kind === 'view' ? 'view()' : 'scroll()');
}
/** The engine to use for `engine="auto | native | js"`. */
function pickEngine(attr, kind = 'scroll') {
    if (attr === 'js')
        return 'js';
    if (attr === 'native')
        return nativeScrollTimelines(kind) ? 'native' : 'js';
    return nativeScrollTimelines(kind) ? 'native' : 'js';
}
/** Lowest common ancestor of two elements (for `timeline-scope`). */
function commonAncestor(a, b) {
    for (let n = a; n; n = n.parentElement)
        if (n.contains(b))
            return n;
    return document.documentElement;
}
/** Scroll progress (0–1) of a scroller (window when `el` is the document scroller). */
function scrollProgress(el, horizontal = false) {
    const isDoc = el === document.scrollingElement || el === document.documentElement || el === document.body;
    const s = isDoc ? (document.scrollingElement || document.documentElement) : el;
    const max = horizontal ? s.scrollWidth - s.clientWidth : s.scrollHeight - s.clientHeight;
    const pos = horizontal ? s.scrollLeft : s.scrollTop;
    return max > 0 ? Math.min(1, Math.max(0, pos / max)) : 0;
}
/** View progress (0–1) of an element crossing the viewport (0 = top edge enters at the bottom, 1 = bottom edge leaves at the top). */
function viewProgress(el) {
    const r = el.getBoundingClientRect();
    const vh = (typeof innerHeight === 'number' && innerHeight) || document.documentElement.clientHeight || 1;
    return Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height || 1)));
}

var css$2 = "usa-scroll-ring{display:inline-block;width:var(--usa-ring-size,56px);height:var(--usa-ring-size,56px);color:var(--usa-ring-color,#6366f1);vertical-align:middle}usa-scroll-ring .usa-ring{all:unset;position:relative;display:grid;place-items:center;width:100%;height:100%;border-radius:50%;cursor:default;box-sizing:border-box}usa-scroll-ring button.usa-ring{cursor:pointer;transition:transform .2s cubic-bezier(.22,1,.36,1)}usa-scroll-ring button.usa-ring:hover{transform:scale(1.06)}usa-scroll-ring button.usa-ring:focus-visible{outline:2px solid currentColor;outline-offset:3px}usa-scroll-ring svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}usa-scroll-ring .usa-ring-track{stroke:var(--usa-ring-track,rgba(99,102,241,.16))}usa-scroll-ring .usa-ring-bar{stroke:currentColor;stroke-linecap:round;transition:stroke .3s}usa-scroll-ring[data-complete] .usa-ring-bar{stroke:var(--usa-ring-done,#10b981)}usa-scroll-ring .usa-ring-label{position:relative;font:700 calc(var(--usa-ring-size,56px)*.24)/1 ui-sans-serif,system-ui,sans-serif;color:var(--usa-ring-text,#1e1b4b);font-variant-numeric:tabular-nums}@keyframes usa-ring-fill{from{stroke-dashoffset:var(--usa-ring-c)}to{stroke-dashoffset:0}}@supports (animation-timeline:scroll()){usa-scroll-ring .usa-ring-native{animation:usa-ring-fill linear both}}@media (prefers-reduced-motion:reduce){usa-scroll-ring button.usa-ring{transition:none}}";

const NS = 'http://www.w3.org/2000/svg';
function defineScrollRing(tag = 'usa-scroll-ring') {
    return base.defineElement(tag, (Base) => {
        class UsaScrollRing extends Base {
            constructor() {
                super(...arguments);
                this.p = 0;
                this.eng = 'js';
            }
            static get observedAttributes() {
                return ['for', 'engine', 'label', 'back-to-top', 'size', 'thickness', 'horizontal', 'preview'];
            }
            get progress() {
                return this.p;
            }
            get engine() {
                return this.eng;
            }
            target() {
                const sel = this.str('for', 'page');
                if (sel === 'page')
                    return document.scrollingElement || document.documentElement;
                return this.parentElement?.querySelector(sel) || document.querySelector(sel) || document.scrollingElement || document.documentElement;
            }
            mount() {
                const size = this.num('size', 56), th = this.num('thickness', 5), r = (size - th) / 2, C = 2 * Math.PI * r;
                this.style.setProperty('--usa-ring-size', size + 'px');
                this.style.setProperty('--usa-ring-c', String(C));
                const svg = document.createElementNS(NS, 'svg');
                svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
                svg.setAttribute('aria-hidden', 'true');
                svg.innerHTML = `<circle class="usa-ring-track" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${th}" fill="none"/><circle class="usa-ring-bar" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${th}" fill="none" stroke-dasharray="${C}" stroke-dashoffset="${C}" transform="rotate(-90 ${size / 2} ${size / 2})"/>`;
                const bar = svg.lastElementChild;
                const label = document.createElement('span');
                label.className = 'usa-ring-label';
                label.setAttribute('aria-hidden', 'true');
                const host = this.flag('back-to-top') ? document.createElement('button') : document.createElement('span');
                host.className = 'usa-ring';
                if (host instanceof HTMLButtonElement) {
                    host.type = 'button';
                    host.setAttribute('aria-label', 'Back to top');
                }
                host.append(svg, ...(this.flag('label') ? [label] : []));
                this.replaceChildren(host);
                this.setAttribute('role', host instanceof HTMLButtonElement ? 'group' : 'progressbar');
                if (!(host instanceof HTMLButtonElement)) {
                    this.setAttribute('aria-valuemin', '0');
                    this.setAttribute('aria-valuemax', '100');
                    this.setAttribute('aria-label', this.getAttribute('aria-label') || 'Scroll progress');
                }
                const tgt = this.target();
                const isDoc = tgt === document.scrollingElement || tgt === document.documentElement;
                const horiz = this.flag('horizontal');
                const scrollEv = isDoc ? window : tgt;
                this.eng = pickEngine(this.str('engine', 'auto'));
                this.dataset.engine = this.eng;
                if (this.eng === 'native') {
                    const axis = horiz ? 'inline' : 'block';
                    if (isDoc)
                        bar.style.animationTimeline = `scroll(root ${axis})`;
                    else {
                        const name = timelineName('usa-ring');
                        tgt.style.setProperty('scroll-timeline', `${name} ${axis}`);
                        commonAncestor(this, tgt).style.setProperty('timeline-scope', name);
                        bar.style.animationTimeline = name;
                        this.onCleanup(() => {
                            tgt.style.removeProperty('scroll-timeline');
                            commonAncestor(this, tgt).style.removeProperty('timeline-scope');
                        });
                    }
                    bar.classList.add('usa-ring-native');
                }
                let raf = 0, lastPct = -1;
                const update = () => {
                    raf = 0;
                    this.p = scrollProgress(tgt, horiz);
                    const pct = Math.round(this.p * 100);
                    if (this.eng === 'js')
                        bar.setAttribute('stroke-dashoffset', String(C * (1 - this.p)));
                    if (pct !== lastPct) {
                        lastPct = pct;
                        label.textContent = pct + '%';
                        if (!(host instanceof HTMLButtonElement))
                            this.setAttribute('aria-valuenow', String(pct));
                        this.toggleAttribute('data-complete', pct >= 100);
                        this.emit('progress', { progress: this.p, percent: pct });
                    }
                };
                const onScroll = () => {
                    if (!raf)
                        raf = requestAnimationFrame(update);
                };
                this.listen(scrollEv, 'scroll', onScroll, { passive: true });
                this.listen(window, 'resize', onScroll, { passive: true });
                this.onCleanup(() => raf && cancelAnimationFrame(raf));
                update();
                if (host instanceof HTMLButtonElement)
                    this.listen(host, 'click', () => {
                        const opts = { [horiz ? 'left' : 'top']: 0, behavior: this.reduced ? 'auto' : 'smooth' };
                        (isDoc ? window : tgt).scrollTo(opts);
                        this.emit('top');
                    });
                if (this.flag('preview') && !isDoc && !this.reduced) {
                    let dir = 1, timer = null, user = false;
                    const el = tgt;
                    const glide = () => {
                        if (user)
                            return;
                        const max = horiz ? el.scrollWidth - el.clientWidth : el.scrollHeight - el.clientHeight;
                        el.scrollTo({ [horiz ? 'left' : 'top']: dir > 0 ? max : 0, behavior: 'smooth' });
                        dir = -dir;
                        timer = setTimeout(glide, 2200);
                    };
                    this.inView((v) => {
                        if (timer)
                            clearTimeout(timer);
                        timer = v ? setTimeout(glide, 300) : null;
                    });
                    const stopDemo = () => (user = true);
                    this.listen(el, 'wheel', stopDemo, { passive: true });
                    this.listen(el, 'touchstart', stopDemo, { passive: true });
                    this.onCleanup(() => timer && clearTimeout(timer));
                }
            }
        }
        return UsaScrollRing;
    }, { id: 'scroll-ring', text: css$2 });
}

var css$1 = "usa-parallax-layers{position:relative;display:block;overflow:hidden;isolation:isolate}usa-parallax-layers [data-depth]{will-change:translate,transform;transition:transform .35s cubic-bezier(.22,1,.36,1)}@keyframes usa-plx-y{from{translate:0 calc(var(--usa-depth,0)*var(--usa-plx-range,120)*1px)}to{translate:0 calc(var(--usa-depth,0)*var(--usa-plx-range,120)*-1px)}}@keyframes usa-plx-x{from{translate:calc(var(--usa-depth,0)*var(--usa-plx-range,120)*1px) 0}to{translate:calc(var(--usa-depth,0)*var(--usa-plx-range,120)*-1px) 0}}@supports (animation-timeline:view()){usa-parallax-layers .usa-plx-native{animation:usa-plx-y linear both;animation-range:cover}usa-parallax-layers[data-horizontal] .usa-plx-native{animation-name:usa-plx-x}}@media (prefers-reduced-motion:reduce){usa-parallax-layers [data-depth]{transition:none;animation:none!important;translate:none!important}}";

function defineParallaxLayers(tag = 'usa-parallax-layers') {
    return base.defineElement(tag, (Base) => {
        class UsaParallaxLayers extends Base {
            constructor() {
                super(...arguments);
                this.p = 0;
            }
            static get observedAttributes() {
                return ['range', 'engine', 'horizontal', 'pointer', 'strength', 'preview'];
            }
            get progress() {
                return this.p;
            }
            layers() {
                return Array.from(this.querySelectorAll(':scope > [data-depth], :scope > * > [data-depth]'));
            }
            mount() {
                const layers = this.layers();
                const range = this.num('range', 120);
                const horiz = this.flag('horizontal');
                this.style.setProperty('--usa-plx-range', String(range));
                layers.forEach((l) => l.style.setProperty('--usa-depth', String(Number(l.dataset.depth) || 0)));
                this.toggleAttribute('data-horizontal', horiz);
                if (this.reduced) {
                    this.dataset.engine = 'static';
                    return;
                }
                const canScroll = document.documentElement.scrollHeight > innerHeight + 2;
                if (this.flag('preview') && !canScroll) {
                    this.dataset.engine = 'preview';
                    const anims = layers.map((l) => {
                        const d = (Number(l.dataset.depth) || 0) * range;
                        const t = (v) => (horiz ? `${v}px 0` : `0 ${v}px`);
                        return this.motion(l, [{ translate: t(d) }, { translate: t(-d) }], { duration: 3200, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
                    });
                    this.onCleanup(() => anims.forEach((a) => a?.cancel()));
                }
                else {
                    const eng = pickEngine(this.str('engine', 'auto'), 'view');
                    this.dataset.engine = eng;
                    if (eng === 'native') {
                        const name = timelineName('usa-plx');
                        this.style.setProperty('view-timeline', `${name} block`);
                        layers.forEach((l) => {
                            l.classList.add('usa-plx-native');
                            l.style.animationTimeline = name;
                        });
                        this.onCleanup(() => layers.forEach((l) => l.classList.remove('usa-plx-native')));
                    }
                    let raf = 0;
                    const update = () => {
                        raf = 0;
                        this.p = viewProgress(this);
                        if (eng === 'js')
                            layers.forEach((l) => {
                                const v = (Number(l.dataset.depth) || 0) * range * (1 - 2 * this.p);
                                l.style.translate = horiz ? `${v.toFixed(2)}px 0` : `0 ${v.toFixed(2)}px`;
                            });
                        this.emit('progress', { progress: this.p });
                    };
                    const onScroll = () => {
                        if (!raf)
                            raf = requestAnimationFrame(update);
                    };
                    let visible = false;
                    this.inView((v) => {
                        visible = v;
                        if (v)
                            onScroll();
                    }, { rootMargin: '20% 0px' });
                    this.listen(window, 'scroll', () => visible && onScroll(), { passive: true });
                    this.listen(window, 'resize', onScroll, { passive: true });
                    this.onCleanup(() => raf && cancelAnimationFrame(raf));
                    update();
                }
                if (this.flag('pointer')) {
                    const s = this.num('strength', 14);
                    this.listen(this, 'pointermove', (e) => {
                        const r = this.getBoundingClientRect();
                        const dx = (e.clientX - r.left) / (r.width || 1) - 0.5, dy = (e.clientY - r.top) / (r.height || 1) - 0.5;
                        layers.forEach((l) => {
                            const d = Number(l.dataset.depth) || 0;
                            l.style.transform = `translate(${(-dx * s * d * 2).toFixed(2)}px, ${(-dy * s * d * 2).toFixed(2)}px)`;
                        });
                    });
                    this.listen(this, 'pointerleave', () => layers.forEach((l) => (l.style.transform = '')));
                }
                this.onCleanup(() => layers.forEach((l) => {
                    l.style.translate = '';
                    l.style.transform = '';
                    l.style.animationTimeline = '';
                }));
            }
        }
        return UsaParallaxLayers;
    }, { id: 'parallax-layers', text: css$1 });
}

var css = "usa-smooth-scroll{display:contents}usa-smooth-scroll[data-wrapper]{display:block;overflow:auto;overscroll-behavior:contain;max-height:100%;-webkit-overflow-scrolling:touch}usa-smooth-scroll[data-wrapper].usa-smooth{scroll-behavior:auto}html.usa-smooth{scroll-behavior:auto}usa-smooth-scroll .usa-rt-missing{margin:0 0 8px;padding:8px;border-radius:8px;background:#fef2f2;color:#991b1b;font:11px/1.4 ui-monospace,monospace;overflow-wrap:anywhere}";

function defineSmoothScroll(tag = 'usa-smooth-scroll') {
    return base.defineElement(tag, (Base) => {
        class UsaSmoothScroll extends Base {
            constructor() {
                super(...arguments);
                this.s = null;
            }
            static get observedAttributes() {
                return ['lerp', 'duration', 'ease', 'wheel-multiplier', 'horizontal', 'touch', 'anchors', 'offset', 'wrapper', 'preview'];
            }
            get instance() {
                return this.s;
            }
            mount() {
                const api = runtimeModule(this, 'smooth');
                if (!api)
                    return;
                const wrapper = this.flag('wrapper');
                this.toggleAttribute('data-wrapper', wrapper);
                const anchors = this.getAttribute('anchors') === 'false' ? false : { offset: -this.num('offset', 0) }; // offset="64" stops 64 px above the target (sticky headers)
                const s = api.smoothScroll({
                    wrapper: wrapper ? this : undefined,
                    lerp: this.num('lerp', 0.1),
                    duration: this.num('duration', 0) || undefined,
                    ease: this.str('ease') || undefined,
                    wheelMultiplier: this.num('wheel-multiplier', 1),
                    orientation: this.flag('horizontal') ? 'horizontal' : 'vertical',
                    touch: this.flag('touch'),
                    anchors,
                    onScroll: (x) => {
                        this.style.setProperty('--usa-smooth-progress', x.progress.toFixed(4));
                        this.emit('scroll', { progress: x.progress, velocity: x.velocity });
                    },
                });
                this.s = s;
                this.dataset.active = String(s.active);
                this.onCleanup(() => {
                    s.destroy();
                    this.s = null;
                });
                this.emit('ready', { active: s.active });
                if (wrapper && this.flag('preview') && s.active) {
                    let dir = 1, user = false, timer = null;
                    const glide = () => {
                        if (user)
                            return;
                        s.scrollTo(dir > 0 ? s.limit : 0, { duration: 1600 });
                        dir = -dir;
                        timer = setTimeout(glide, 2400);
                    };
                    this.inView((v) => {
                        if (timer)
                            clearTimeout(timer);
                        timer = v ? setTimeout(glide, 300) : null;
                    });
                    this.listen(this, 'wheel', () => (user = true), { passive: true });
                    this.listen(this, 'pointerdown', () => (user = true), { passive: true });
                    this.onCleanup(() => timer && clearTimeout(timer));
                }
            }
            glideTo(target, opts = {}) {
                this.s?.scrollTo(target, opts);
            }
            stop() {
                this.s?.stop();
            }
            resume() {
                this.s?.resume();
            }
        }
        return UsaSmoothScroll;
    }, { id: 'smooth-scroll', text: css });
}

/**
 * motionary/components/widgets — the 6.x animated UI widgets, in their own
 * entry so `motionary/components` and `components/lite` keep their size
 * budgets. Every widget is reduced-motion safe and keyboard accessible.
 *
 * ```ts
 * import { defineWidgets } from 'motionary/components/widgets';
 * defineWidgets(); // or defineCarousel(), defineTabBar(), …
 * ```
 * No build step: `<script src="https://unpkg.com/motionary@6/dist/widgets.umd.js">`
 * (registers every widget and every 6.x effect pack; `window.UsaWidgets`).
 */
/** The widgets by release (tag → define function). */
const WIDGETS = {
    '6.2': { 'usa-carousel': defineCarousel, 'usa-tab-bar': defineTabBar, 'usa-disclosure': defineDisclosure, 'usa-stories': defineStories },
    '6.3': { 'usa-toast-stack': defineToastStack, 'usa-modal': defineModal, 'usa-sheet': defineSheet, 'usa-menu': defineMenu },
    '6.4': { 'usa-progress-ring': defineProgressRing, 'usa-odometer': defineOdometer, 'usa-skeleton-reveal': defineSkeletonReveal, 'usa-star-rating': defineStarRating },
    '6.5': { 'usa-milestones': defineMilestones, 'usa-masonry-flow': defineMasonryFlow, 'usa-compare': defineCompare, 'usa-cube-gallery': defineCubeGallery },
    '6.6': { 'usa-dock': defineDock, 'usa-nav-morph': defineNavMorph, 'usa-menu-toggle': defineMenuToggle, 'usa-tip': defineTip },
    '6.7': { 'usa-stepper': defineStepper, 'usa-pagination': definePagination, 'usa-segmented': defineSegmented, 'usa-switch': defineSwitch },
    '6.8': { 'usa-kanban': defineKanban, 'usa-swipe-deck': defineSwipeDeck, 'usa-weather-card': defineWeatherCard, 'usa-pull-cord': definePullCord },
    '6.9': { 'usa-date-picker': defineDatePicker, 'usa-color-picker': defineColorPicker, 'usa-file-drop': defineFileDrop, 'usa-keyframe-editor': defineKeyframeEditor },
    '7.1': { 'usa-music-player': defineMusicPlayer, 'usa-volume-knob': defineVolumeKnob, 'usa-equalizer': defineEqualizer, 'usa-lyrics': defineLyrics },
    '7.2': { 'usa-bar-chart': defineBarChart, 'usa-gauge': defineGauge, 'usa-sparkline': defineSparkline, 'usa-kpi': defineKpi },
    '7.3': { 'usa-add-to-cart': defineAddToCart, 'usa-cart-drawer': defineCartDrawer, 'usa-product-gallery': defineProductGallery, 'usa-countdown': defineCountdown },
    '7.4': { 'usa-message-list': defineMessageList, 'usa-reactions': defineReactions, 'usa-notification-bell': defineNotificationBell, 'usa-presence': definePresence },
    '7.5': { 'usa-leaderboard': defineLeaderboard, 'usa-xp-bar': defineXpBar, 'usa-badge-wall': defineBadgeWall, 'usa-prize-wheel': definePrizeWheel },
    '7.6': { 'usa-globe': defineGlobe, 'usa-location-card': defineLocationCard },
    '7.7': { 'usa-field': defineField, 'usa-otp': defineOtp, 'usa-upload-progress': defineUploadProgress },
    '7.8': { 'usa-chat-composer': defineChatComposer, 'usa-suggestion-chips': defineSuggestionChips, 'usa-voice-button': defineVoiceButton },
    '7.9': { 'usa-command-palette': defineCommandPalette, 'usa-shortcut': defineShortcut },
    '8.0': { 'usa-clock-control': defineClockControl, 'usa-hydrate': defineHydrate },
    '8.1': { 'usa-red-envelope': defineRedEnvelope, 'usa-festival-banner': defineFestivalBanner },
    '8.2': { 'usa-terminal': defineTerminal, 'usa-retro-button': defineRetroButton },
    '8.3': { 'usa-organic-card': defineOrganicCard, 'usa-liquid-nav': defineLiquidNav },
    '8.4': { 'usa-hud-panel': defineHudPanel, 'usa-radar': defineRadar },
    '8.5': { 'usa-sticky-wall': defineStickyWall, 'usa-sketch-chart': defineSketchChart },
    '8.6': { 'usa-theme-switcher': defineThemeSwitcher, 'usa-theme-surface': defineThemeSurface },
    '8.7': { 'usa-gyro-card': defineGyroCard, 'usa-gesture-sticker': defineGestureSticker },
    '8.8': { 'usa-panorama': definePanorama, 'usa-spatial-card': defineSpatialCard },
    '8.9': { 'usa-code-export': defineCodeExport, 'usa-prop-panel': definePropPanel },
    '9.0': { 'usa-motion': defineMotion, 'usa-plugin-store': definePluginStore },
    '9.1': { 'usa-chapter-nav': defineChapterNav, 'usa-scene': defineScene },
    '9.2': { 'usa-lottie': defineLottie, 'usa-lottie-icon': defineLottieIcon },
    '9.3': { 'usa-gen-art': defineGenArt, 'usa-bg-generator': defineBgGenerator },
    '9.4': { 'usa-video-card': defineVideoCard, 'usa-hero-video': defineHeroVideo },
    '9.5': { 'usa-motion-prefs': defineMotionPrefs, 'usa-pause-all': definePauseAll },
    '9.6': { 'usa-perf-monitor': definePerfMonitor, 'usa-worker-canvas': defineWorkerCanvas },
    '9.7': { 'usa-motion-spec': defineMotionSpec },
    '9.8': { 'usa-native-preview': defineNativePreview },
    '10.1': { 'usa-plugin-card': definePluginCard, 'usa-install-button': defineInstallButton },
    '10.2': { 'usa-scroll-scene': defineScrollScene, 'usa-motion-inspector': defineMotionInspector },
    '10.3': { 'usa-route-transition': defineRouteTransition, 'usa-text-splitter': defineTextSplitter },
    '10.4': { 'usa-scroll-ring': defineScrollRing, 'usa-parallax-layers': defineParallaxLayers, 'usa-smooth-scroll': defineSmoothScroll },
};
/** Every widget tag, in release order. */
const WIDGET_TAGS = Object.values(WIDGETS).flatMap((g) => Object.keys(g));
/** Register every widget (or only those of one release, e.g. `'6.2'`) under its default tag. */
function defineWidgets(release) {
    for (const [v, group] of Object.entries(WIDGETS))
        if (!release || release === v)
            for (const [tag, fn] of Object.entries(group))
                fn(tag);
}

exports.CAROUSEL_EFFECTS = CAROUSEL_EFFECTS;
exports.EQ_PRESETS = EQ_PRESETS;
exports.FESTIVAL_THEMES = FESTIVAL_THEMES;
exports.LOTTIE_ICONS = LOTTIE_ICONS;
exports.MENU_EFFECTS = MENU_EFFECTS;
exports.MODAL_EFFECTS = MODAL_EFFECTS;
exports.NAV_INDICATORS = NAV_INDICATORS;
exports.PRESENCE_STATES = PRESENCE_STATES;
exports.PROGRESS_VARIANTS = PROGRESS_VARIANTS;
exports.RETRO_VARIANTS = RETRO_VARIANTS;
exports.SEGMENTED_VARIANTS = SEGMENTED_VARIANTS;
exports.SHEET_SIDES = SHEET_SIDES;
exports.SKELETON_VARIANTS = SKELETON_VARIANTS;
exports.SPARK_VARIANTS = SPARK_VARIANTS;
exports.SWITCH_VARIANTS = SWITCH_VARIANTS;
exports.TAB_INDICATORS = TAB_INDICATORS;
exports.TIP_PLACEMENTS = TIP_PLACEMENTS;
exports.TOAST_POSITIONS = TOAST_POSITIONS;
exports.TOGGLE_VARIANTS = TOGGLE_VARIANTS;
exports.WEATHER_CONDITIONS = WEATHER_CONDITIONS;
exports.WIDGETS = WIDGETS;
exports.WIDGET_TAGS = WIDGET_TAGS;
exports.WORKER_SCENES = WORKER_SCENES;
exports.backgroundCss = backgroundCss;
exports.badgeProgress = badgeProgress;
exports.cartTotal = cartTotal;
exports.defineAddToCart = defineAddToCart;
exports.defineBadgeWall = defineBadgeWall;
exports.defineBarChart = defineBarChart;
exports.defineBgGenerator = defineBgGenerator;
exports.defineCarousel = defineCarousel;
exports.defineCartDrawer = defineCartDrawer;
exports.defineChapterNav = defineChapterNav;
exports.defineChatComposer = defineChatComposer;
exports.defineClockControl = defineClockControl;
exports.defineCodeExport = defineCodeExport;
exports.defineColorPicker = defineColorPicker;
exports.defineCommandPalette = defineCommandPalette;
exports.defineCompare = defineCompare;
exports.defineCountdown = defineCountdown;
exports.defineCubeGallery = defineCubeGallery;
exports.defineDatePicker = defineDatePicker;
exports.defineDisclosure = defineDisclosure;
exports.defineDock = defineDock;
exports.defineEqualizer = defineEqualizer;
exports.defineFestivalBanner = defineFestivalBanner;
exports.defineField = defineField;
exports.defineFileDrop = defineFileDrop;
exports.defineGauge = defineGauge;
exports.defineGenArt = defineGenArt;
exports.defineGestureSticker = defineGestureSticker;
exports.defineGlobe = defineGlobe;
exports.defineGyroCard = defineGyroCard;
exports.defineHeroVideo = defineHeroVideo;
exports.defineHudPanel = defineHudPanel;
exports.defineHydrate = defineHydrate;
exports.defineInstallButton = defineInstallButton;
exports.defineKanban = defineKanban;
exports.defineKeyframeEditor = defineKeyframeEditor;
exports.defineKpi = defineKpi;
exports.defineLeaderboard = defineLeaderboard;
exports.defineLiquidNav = defineLiquidNav;
exports.defineLocationCard = defineLocationCard;
exports.defineLottie = defineLottie;
exports.defineLottieIcon = defineLottieIcon;
exports.defineLyrics = defineLyrics;
exports.defineMasonryFlow = defineMasonryFlow;
exports.defineMenu = defineMenu;
exports.defineMenuToggle = defineMenuToggle;
exports.defineMessageList = defineMessageList;
exports.defineMilestones = defineMilestones;
exports.defineModal = defineModal;
exports.defineMotion = defineMotion;
exports.defineMotionInspector = defineMotionInspector;
exports.defineMotionPrefs = defineMotionPrefs;
exports.defineMotionSpec = defineMotionSpec;
exports.defineMusicPlayer = defineMusicPlayer;
exports.defineNativePreview = defineNativePreview;
exports.defineNavMorph = defineNavMorph;
exports.defineNotificationBell = defineNotificationBell;
exports.defineOdometer = defineOdometer;
exports.defineOrganicCard = defineOrganicCard;
exports.defineOtp = defineOtp;
exports.definePagination = definePagination;
exports.definePanorama = definePanorama;
exports.defineParallaxLayers = defineParallaxLayers;
exports.definePauseAll = definePauseAll;
exports.definePerfMonitor = definePerfMonitor;
exports.definePluginCard = definePluginCard;
exports.definePluginStore = definePluginStore;
exports.definePresence = definePresence;
exports.definePrizeWheel = definePrizeWheel;
exports.defineProductGallery = defineProductGallery;
exports.defineProgressRing = defineProgressRing;
exports.definePropPanel = definePropPanel;
exports.definePullCord = definePullCord;
exports.defineRadar = defineRadar;
exports.defineReactions = defineReactions;
exports.defineRedEnvelope = defineRedEnvelope;
exports.defineRetroButton = defineRetroButton;
exports.defineRouteTransition = defineRouteTransition;
exports.defineScene = defineScene;
exports.defineScrollRing = defineScrollRing;
exports.defineScrollScene = defineScrollScene;
exports.defineSegmented = defineSegmented;
exports.defineSheet = defineSheet;
exports.defineShortcut = defineShortcut;
exports.defineSkeletonReveal = defineSkeletonReveal;
exports.defineSketchChart = defineSketchChart;
exports.defineSmoothScroll = defineSmoothScroll;
exports.defineSparkline = defineSparkline;
exports.defineSpatialCard = defineSpatialCard;
exports.defineStarRating = defineStarRating;
exports.defineStepper = defineStepper;
exports.defineStickyWall = defineStickyWall;
exports.defineStories = defineStories;
exports.defineSuggestionChips = defineSuggestionChips;
exports.defineSwipeDeck = defineSwipeDeck;
exports.defineSwitch = defineSwitch;
exports.defineTabBar = defineTabBar;
exports.defineTerminal = defineTerminal;
exports.defineTextSplitter = defineTextSplitter;
exports.defineThemeSurface = defineThemeSurface;
exports.defineThemeSwitcher = defineThemeSwitcher;
exports.defineTip = defineTip;
exports.defineToastStack = defineToastStack;
exports.defineUploadProgress = defineUploadProgress;
exports.defineVideoCard = defineVideoCard;
exports.defineVoiceButton = defineVoiceButton;
exports.defineVolumeKnob = defineVolumeKnob;
exports.defineWeatherCard = defineWeatherCard;
exports.defineWidgets = defineWidgets;
exports.defineWorkerCanvas = defineWorkerCanvas;
exports.defineXpBar = defineXpBar;
exports.describeComponent = describeComponent;
exports.exportComponent = exportComponent;
exports.formatBytes = formatBytes;
exports.formatDistance = formatDistance;
exports.fuzzyMatch = fuzzyMatch;
exports.haversine = haversine;
exports.hexToHsv = hexToHsv;
exports.hsvToHex = hsvToHex;
exports.initials = initials;
exports.keyLabels = keyLabels;
exports.levelFor = levelFor;
exports.matchesKeys = matchesKeys;
exports.monthGrid = monthGrid;
exports.pageWindow = pageWindow;
exports.parseChips = parseChips;
exports.parseISODate = parseISODate;
exports.parseLRC = parseLRC;
exports.parseMarkers = parseMarkers;
exports.parseProps = parseProps;
exports.parseReactions = parseReactions;
exports.parseScrub = parseScrub;
exports.parseTargets = parseTargets;
exports.passwordStrength = passwordStrength;
exports.project = project;
exports.rankRows = rankRows;
exports.sanitizeCode = sanitizeCode;
exports.sparkPoints = sparkPoints;
exports.splitTime = splitTime;
exports.stackToast = stackToast;
exports.waveBars = waveBars;
exports.wheelAngle = wheelAngle;
exports.wrapIndex = wrapIndex;
//# sourceMappingURL=widgets.cjs.map
