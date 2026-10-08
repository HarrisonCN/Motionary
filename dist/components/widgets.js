import { x as defineElement } from '../chunks/base-C_3cAoRz.js';
import { d as springEasing } from '../chunks/spring-CbvHfVtP.js';

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
let uid = 0;
/** A document-unique id with a prefix. */
const nextId = (p) => `${p}-${++uid}`;
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

var css$3 = "usa-carousel{display:block;position:relative;--usa-carousel-dur:520ms;--usa-carousel-ease:cubic-bezier(.22,1,.36,1);overflow:hidden;border-radius:var(--usa-radius,14px);touch-action:pan-y}.usa-carousel-viewport{position:relative;overflow:hidden;height:100%;min-height:inherit}.usa-carousel-track{display:flex;height:100%;transition:transform var(--usa-carousel-dur) var(--usa-carousel-ease);will-change:transform}.usa-carousel-track>*{flex:0 0 100%;min-width:0;box-sizing:border-box}usa-carousel:not([data-effect=\"slide\"]) .usa-carousel-track{display:grid}usa-carousel:not([data-effect=\"slide\"]) .usa-carousel-track>*{grid-area:1/1;transition:opacity var(--usa-carousel-dur) ease,transform var(--usa-carousel-dur) var(--usa-carousel-ease),filter var(--usa-carousel-dur) ease}usa-carousel[data-effect=\"cards\"] .usa-carousel-viewport{perspective:900px}usa-carousel[data-dragging] .usa-carousel-track,usa-carousel[data-dragging] .usa-carousel-track>*{transition:none}.usa-carousel-nav{position:absolute;top:50%;translate:0 -50%;z-index:2;width:36px;height:36px;border-radius:50%;border:0;background:rgba(255,255,255,.85);color:#111;font:600 18px/1 system-ui;cursor:pointer;display:grid;place-items:center;box-shadow:0 4px 14px rgba(0,0,0,.18);transition:transform .2s}.usa-carousel-nav:hover{transform:scale(1.08)}.usa-carousel-nav:focus-visible{outline:2px solid #7c5cff;outline-offset:2px}.usa-carousel-prev{left:10px}.usa-carousel-next{right:10px}.usa-carousel-dots{position:absolute;left:0;right:0;bottom:10px;display:flex;justify-content:center;gap:6px;z-index:2}.usa-carousel-dot{width:8px;height:8px;padding:0;border:0;border-radius:99px;background:rgba(255,255,255,.55);cursor:pointer;transition:width .35s var(--usa-carousel-ease),background .35s}.usa-carousel-dot[aria-current=\"true\"]{width:22px;background:#fff}@media (prefers-reduced-motion:reduce){usa-carousel .usa-carousel-track,usa-carousel .usa-carousel-track>*,.usa-carousel-dot{transition:none!important}}usa-carousel[data-reduced] .usa-carousel-track,usa-carousel[data-reduced] .usa-carousel-track>*{transition:none!important}";

const CAROUSEL_EFFECTS = ['slide', 'fade', 'scale', 'cards'];
function defineCarousel(tag = 'usa-carousel') {
    return defineElement(tag, (Base) => {
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
    }, { id: 'carousel', text: css$3 });
}

var css$2 = "usa-tab-bar{display:block;--usa-tab-accent:#7c5cff;--usa-tab-ease:cubic-bezier(.22,1,.36,1)}.usa-tab-bar-list{position:relative;display:flex;gap:4px;padding:4px;border-radius:12px;background:rgba(127,127,127,.12);isolation:isolate;overflow-x:auto;scrollbar-width:none}.usa-tab-bar-list::-webkit-scrollbar{display:none}.usa-tab-bar-list>[role=\"tab\"]{position:relative;z-index:1;flex:1 0 auto;border:0;background:none;color:inherit;font:inherit;font-weight:600;padding:8px 14px;border-radius:9px;cursor:pointer;opacity:.7;transition:opacity .25s,color .25s;white-space:nowrap}.usa-tab-bar-list>[role=\"tab\"][aria-selected=\"true\"]{opacity:1}.usa-tab-bar-list>[role=\"tab\"]:focus-visible{outline:2px solid var(--usa-tab-accent);outline-offset:1px}.usa-tab-bar-ink{position:absolute;z-index:0;left:0;top:4px;bottom:4px;width:0;border-radius:9px;background:var(--usa-tab-accent);pointer-events:none}usa-tab-bar[data-indicator=\"pill\"] [aria-selected=\"true\"]{color:#fff}usa-tab-bar[data-indicator=\"underline\"] .usa-tab-bar-list{background:none;border-bottom:1px solid rgba(127,127,127,.25);border-radius:0}usa-tab-bar[data-indicator=\"underline\"] .usa-tab-bar-ink{top:auto;bottom:0;height:3px;border-radius:3px}usa-tab-bar[data-indicator=\"glow\"] .usa-tab-bar-ink{background:transparent;box-shadow:0 0 0 2px var(--usa-tab-accent),0 0 18px var(--usa-tab-accent)}usa-tab-bar[data-indicator=\"gooey\"] .usa-tab-bar-ink{filter:blur(.5px);border-radius:999px}usa-tab-bar[data-indicator=\"gooey\"] [aria-selected=\"true\"]{color:#fff}.usa-tab-bar-panel{padding:14px 2px}.usa-tab-bar-panel[hidden]{display:none}";

const TAB_INDICATORS = ['pill', 'underline', 'glow', 'gooey'];
function defineTabBar(tag = 'usa-tab-bar') {
    return defineElement(tag, (Base) => {
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
    }, { id: 'tab-bar', text: css$2 });
}

var css$1 = "usa-disclosure{display:block;--usa-disclosure-accent:#7c5cff}usa-disclosure>details{border-bottom:1px solid rgba(127,127,127,.25);overflow:hidden}usa-disclosure>details>summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 4px;font-weight:600}usa-disclosure>details>summary::-webkit-details-marker{display:none}usa-disclosure>details>summary::after{content:\"\";flex:none;width:9px;height:9px;border-right:2px solid currentColor;border-bottom:2px solid currentColor;rotate:45deg;translate:0 -3px;transition:rotate .35s cubic-bezier(.34,1.56,.64,1),translate .35s}usa-disclosure>details[open]>summary::after{rotate:225deg;translate:0 2px}usa-disclosure>details>summary:focus-visible{outline:2px solid var(--usa-disclosure-accent);outline-offset:2px;border-radius:6px}usa-disclosure>details>:not(summary){padding:0 4px 12px}usa-disclosure[variant=\"cards\"]>details{border:1px solid rgba(127,127,127,.25);border-radius:12px;margin-bottom:8px;padding:0 10px;transition:box-shadow .3s,border-color .3s}usa-disclosure[variant=\"cards\"]>details[open]{border-color:var(--usa-disclosure-accent);box-shadow:0 8px 24px rgba(124,92,255,.16)}@media (prefers-reduced-motion:reduce){usa-disclosure>details>summary::after{transition:none}}";

function defineDisclosure(tag = 'usa-disclosure') {
    return defineElement(tag, (Base) => {
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
                const sp = springEasing(this.str('spring', 'gentle'));
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
    }, { id: 'disclosure', text: css$1 });
}

var css = "usa-stories{display:block;position:relative;overflow:hidden;border-radius:var(--usa-radius,16px);background:#111;color:#fff;aspect-ratio:9/14;max-height:520px;user-select:none;-webkit-user-select:none;touch-action:manipulation}usa-stories>:not([data-usa-part]){position:absolute;inset:0;opacity:0;transition:opacity .35s ease,transform .5s cubic-bezier(.22,1,.36,1);transform:scale(1.04);pointer-events:none;box-sizing:border-box}usa-stories>[data-active]:not([data-usa-part]){opacity:1;transform:none;pointer-events:auto}usa-stories>img:not([data-usa-part]){width:100%;height:100%;object-fit:cover}.usa-stories-bars{position:absolute;z-index:3;top:8px;left:8px;right:48px;display:flex;gap:4px}.usa-stories-bar{flex:1;height:3px;border-radius:3px;background:rgba(255,255,255,.35);overflow:hidden}.usa-stories-bar>i{display:block;height:100%;width:100%;background:#fff;transform-origin:left;transform:scaleX(0)}.usa-stories-bar[data-done]>i{transform:scaleX(1)}.usa-stories-toggle{position:absolute;z-index:3;top:2px;right:6px;width:36px;height:30px;border:0;background:none;color:#fff;font:700 14px/1 system-ui;cursor:pointer;border-radius:8px}.usa-stories-toggle:focus-visible{outline:2px solid #fff}@media (prefers-reduced-motion:reduce){usa-stories>*{transition:none!important;transform:none!important}}";

function defineStories(tag = 'usa-stories') {
    return defineElement(tag, (Base) => {
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
    }, { id: 'stories', text: css });
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

export { CAROUSEL_EFFECTS, TAB_INDICATORS, WIDGETS, WIDGET_TAGS, defineCarousel, defineDisclosure, defineStories, defineTabBar, defineWidgets };
//# sourceMappingURL=widgets.js.map
