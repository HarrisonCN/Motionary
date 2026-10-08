import { y as defineElement } from '../chunks/base-DchG4q_S.js';
import { d as springEasing } from '../chunks/spring-BhoT09Qb.js';

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

var css$l = "usa-carousel{display:block;position:relative;--usa-carousel-dur:520ms;--usa-carousel-ease:cubic-bezier(.22,1,.36,1);overflow:hidden;border-radius:var(--usa-radius,14px);touch-action:pan-y}.usa-carousel-viewport{position:relative;overflow:hidden;height:100%;min-height:inherit}.usa-carousel-track{display:flex;height:100%;transition:transform var(--usa-carousel-dur) var(--usa-carousel-ease);will-change:transform}.usa-carousel-track>*{flex:0 0 100%;min-width:0;box-sizing:border-box}usa-carousel:not([data-effect=\"slide\"]) .usa-carousel-track{display:grid}usa-carousel:not([data-effect=\"slide\"]) .usa-carousel-track>*{grid-area:1/1;transition:opacity var(--usa-carousel-dur) ease,transform var(--usa-carousel-dur) var(--usa-carousel-ease),filter var(--usa-carousel-dur) ease}usa-carousel[data-effect=\"cards\"] .usa-carousel-viewport{perspective:900px}usa-carousel[data-dragging] .usa-carousel-track,usa-carousel[data-dragging] .usa-carousel-track>*{transition:none}.usa-carousel-nav{position:absolute;top:50%;translate:0 -50%;z-index:2;width:36px;height:36px;border-radius:50%;border:0;background:rgba(255,255,255,.85);color:#111;font:600 18px/1 system-ui;cursor:pointer;display:grid;place-items:center;box-shadow:0 4px 14px rgba(0,0,0,.18);transition:transform .2s}.usa-carousel-nav:hover{transform:scale(1.08)}.usa-carousel-nav:focus-visible{outline:2px solid #7c5cff;outline-offset:2px}.usa-carousel-prev{left:10px}.usa-carousel-next{right:10px}.usa-carousel-dots{position:absolute;left:0;right:0;bottom:10px;display:flex;justify-content:center;gap:6px;z-index:2}.usa-carousel-dot{width:8px;height:8px;padding:0;border:0;border-radius:99px;background:rgba(255,255,255,.55);cursor:pointer;transition:width .35s var(--usa-carousel-ease),background .35s}.usa-carousel-dot[aria-current=\"true\"]{width:22px;background:#fff}@media (prefers-reduced-motion:reduce){usa-carousel .usa-carousel-track,usa-carousel .usa-carousel-track>*,.usa-carousel-dot{transition:none!important}}usa-carousel[data-reduced] .usa-carousel-track,usa-carousel[data-reduced] .usa-carousel-track>*{transition:none!important}";

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
    }, { id: 'carousel', text: css$l });
}

var css$k = "usa-tab-bar{display:block;--usa-tab-accent:#7c5cff;--usa-tab-ease:cubic-bezier(.22,1,.36,1)}.usa-tab-bar-list{position:relative;display:flex;gap:4px;padding:4px;border-radius:12px;background:rgba(127,127,127,.12);isolation:isolate;overflow-x:auto;scrollbar-width:none}.usa-tab-bar-list::-webkit-scrollbar{display:none}.usa-tab-bar-list>[role=\"tab\"]{position:relative;z-index:1;flex:1 0 auto;border:0;background:none;color:inherit;font:inherit;font-weight:600;padding:8px 14px;border-radius:9px;cursor:pointer;opacity:.7;transition:opacity .25s,color .25s;white-space:nowrap}.usa-tab-bar-list>[role=\"tab\"][aria-selected=\"true\"]{opacity:1}.usa-tab-bar-list>[role=\"tab\"]:focus-visible{outline:2px solid var(--usa-tab-accent);outline-offset:1px}.usa-tab-bar-ink{position:absolute;z-index:0;left:0;top:4px;bottom:4px;width:0;border-radius:9px;background:var(--usa-tab-accent);pointer-events:none}usa-tab-bar[data-indicator=\"pill\"] [aria-selected=\"true\"]{color:#fff}usa-tab-bar[data-indicator=\"underline\"] .usa-tab-bar-list{background:none;border-bottom:1px solid rgba(127,127,127,.25);border-radius:0}usa-tab-bar[data-indicator=\"underline\"] .usa-tab-bar-ink{top:auto;bottom:0;height:3px;border-radius:3px}usa-tab-bar[data-indicator=\"glow\"] .usa-tab-bar-ink{background:transparent;box-shadow:0 0 0 2px var(--usa-tab-accent),0 0 18px var(--usa-tab-accent)}usa-tab-bar[data-indicator=\"gooey\"] .usa-tab-bar-ink{filter:blur(.5px);border-radius:999px}usa-tab-bar[data-indicator=\"gooey\"] [aria-selected=\"true\"]{color:#fff}.usa-tab-bar-panel{padding:14px 2px}.usa-tab-bar-panel[hidden]{display:none}";

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
    }, { id: 'tab-bar', text: css$k });
}

var css$j = "usa-disclosure{display:block;--usa-disclosure-accent:#7c5cff}usa-disclosure>details{border-bottom:1px solid rgba(127,127,127,.25);overflow:hidden}usa-disclosure>details>summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 4px;font-weight:600}usa-disclosure>details>summary::-webkit-details-marker{display:none}usa-disclosure>details>summary::after{content:\"\";flex:none;width:9px;height:9px;border-right:2px solid currentColor;border-bottom:2px solid currentColor;rotate:45deg;translate:0 -3px;transition:rotate .35s cubic-bezier(.34,1.56,.64,1),translate .35s}usa-disclosure>details[open]>summary::after{rotate:225deg;translate:0 2px}usa-disclosure>details>summary:focus-visible{outline:2px solid var(--usa-disclosure-accent);outline-offset:2px;border-radius:6px}usa-disclosure>details>:not(summary){padding:0 4px 12px}usa-disclosure[variant=\"cards\"]>details{border:1px solid rgba(127,127,127,.25);border-radius:12px;margin-bottom:8px;padding:0 10px;transition:box-shadow .3s,border-color .3s}usa-disclosure[variant=\"cards\"]>details[open]{border-color:var(--usa-disclosure-accent);box-shadow:0 8px 24px rgba(124,92,255,.16)}@media (prefers-reduced-motion:reduce){usa-disclosure>details>summary::after{transition:none}}";

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
    }, { id: 'disclosure', text: css$j });
}

var css$i = "usa-stories{display:block;position:relative;overflow:hidden;border-radius:var(--usa-radius,16px);background:#111;color:#fff;aspect-ratio:9/14;max-height:520px;user-select:none;-webkit-user-select:none;touch-action:manipulation}usa-stories>:not([data-usa-part]){position:absolute;inset:0;opacity:0;transition:opacity .35s ease,transform .5s cubic-bezier(.22,1,.36,1);transform:scale(1.04);pointer-events:none;box-sizing:border-box}usa-stories>[data-active]:not([data-usa-part]){opacity:1;transform:none;pointer-events:auto}usa-stories>img:not([data-usa-part]){width:100%;height:100%;object-fit:cover}.usa-stories-bars{position:absolute;z-index:3;top:8px;left:8px;right:48px;display:flex;gap:4px}.usa-stories-bar{flex:1;height:3px;border-radius:3px;background:rgba(255,255,255,.35);overflow:hidden}.usa-stories-bar>i{display:block;height:100%;width:100%;background:#fff;transform-origin:left;transform:scaleX(0)}.usa-stories-bar[data-done]>i{transform:scaleX(1)}.usa-stories-toggle{position:absolute;z-index:3;top:2px;right:6px;width:36px;height:30px;border:0;background:none;color:#fff;font:700 14px/1 system-ui;cursor:pointer;border-radius:8px}.usa-stories-toggle:focus-visible{outline:2px solid #fff}@media (prefers-reduced-motion:reduce){usa-stories>*{transition:none!important;transform:none!important}}";

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
    }, { id: 'stories', text: css$i });
}

var css$h = "usa-modal,usa-sheet{display:contents}.usa-ov{border:0;padding:0;margin:auto;color:inherit;background:transparent;max-width:min(92vw,520px);max-height:88vh;overflow:visible}.usa-ov::backdrop{background:rgba(10,12,20,.45);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}.usa-ov-body{box-sizing:border-box;background:var(--usa-ov-bg,#fff);color:var(--usa-ov-fg,#111827);border-radius:var(--usa-ov-radius,18px);padding:var(--usa-ov-pad,22px);box-shadow:0 30px 80px -20px rgba(0,0,0,.45);max-height:88vh;overflow:auto}.usa-sheet-panel{margin:0;max-width:none;max-height:none}usa-sheet[data-side=\"right\"] .usa-sheet-panel{inset:0 0 0 auto;height:100%;width:min(88vw,var(--usa-sheet-size,380px))}usa-sheet[data-side=\"left\"] .usa-sheet-panel{inset:0 auto 0 0;height:100%;width:min(88vw,var(--usa-sheet-size,380px))}usa-sheet[data-side=\"bottom\"] .usa-sheet-panel{inset:auto 0 0 0;width:100%;max-height:85vh}usa-sheet[data-side=\"top\"] .usa-sheet-panel{inset:0 0 auto 0;width:100%;max-height:85vh}usa-sheet .usa-ov-body{height:100%;max-height:inherit;border-radius:0}usa-sheet[data-side=\"bottom\"] .usa-ov-body{border-radius:var(--usa-ov-radius,18px) var(--usa-ov-radius,18px) 0 0;height:auto;max-height:85vh;touch-action:none}usa-sheet[data-side=\"top\"] .usa-ov-body{border-radius:0 0 var(--usa-ov-radius,18px) var(--usa-ov-radius,18px);height:auto}.usa-ov-grab{width:44px;height:5px;border-radius:3px;background:rgba(127,127,127,.45);margin:-8px auto 14px;cursor:grab}@media (prefers-color-scheme:dark){.usa-ov-body{background:var(--usa-ov-bg,#171a23);color:var(--usa-ov-fg,#e5e7eb)}}";

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
    return defineElement(tag, (Base) => {
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
    }, { id: 'overlay', text: css$h });
}
const defineModal = (tag = 'usa-modal') => defineOverlay(tag, 'modal');
const defineSheet = (tag = 'usa-sheet') => defineOverlay(tag, 'sheet');

var css$g = "usa-toast-stack{position:fixed;z-index:2147482000;width:min(360px,calc(100vw - 24px));pointer-events:none;--usa-tstack-bg:#111827;--usa-tstack-fg:#f9fafb}usa-toast-stack[contained]{position:absolute;width:min(360px,calc(100% - 24px))}usa-toast-stack[data-position^=\"bottom\"]{bottom:12px}usa-toast-stack[data-position^=\"top\"]{top:12px}usa-toast-stack[data-position$=\"right\"]{right:12px}usa-toast-stack[data-position$=\"left\"]{left:12px}usa-toast-stack[data-position$=\"center\"]{left:50%;transform:translateX(-50%)}.usa-tstack-list{position:relative;list-style:none;margin:0;padding:0;min-height:1px;transition:height .3s}.usa-tstack{position:absolute;left:0;right:0;display:flex;align-items:center;gap:10px;box-sizing:border-box;padding:12px 12px 12px 14px;border-radius:14px;background:var(--usa-tstack-bg);color:var(--usa-tstack-fg);box-shadow:0 12px 32px -10px rgba(0,0,0,.45);font:500 14px/1.35 system-ui,sans-serif;pointer-events:auto;touch-action:pan-y;transition:transform .38s cubic-bezier(.22,1,.36,1),opacity .3s;user-select:none}usa-toast-stack[data-position^=\"bottom\"] .usa-tstack{bottom:0;transform-origin:50% 100%}usa-toast-stack[data-position^=\"top\"] .usa-tstack{top:0;transform-origin:50% 0}.usa-tstack-icon{flex:none;display:grid;place-items:center;width:22px;height:22px;border-radius:50%;font-size:13px;font-weight:800;background:#3b82f6;color:#fff}.usa-tstack-success .usa-tstack-icon{background:#22c55e}.usa-tstack-warning .usa-tstack-icon{background:#f59e0b}.usa-tstack-error .usa-tstack-icon{background:#ef4444}.usa-tstack-text{flex:1;min-width:0;display:flex;flex-direction:column}.usa-tstack-text strong{font-weight:700}.usa-tstack-action{border:0;border-radius:8px;padding:6px 10px;background:rgba(255,255,255,.14);color:inherit;font:600 13px system-ui,sans-serif;cursor:pointer}.usa-tstack-close{border:0;background:none;color:inherit;opacity:.6;font-size:18px;line-height:1;cursor:pointer;padding:2px 4px}.usa-tstack-close:hover{opacity:1}@media (prefers-reduced-motion:reduce){.usa-tstack,.usa-tstack-list{transition:none}}";

const TOAST_POSITIONS = ['bottom-right', 'bottom-left', 'bottom-center', 'top-right', 'top-left', 'top-center'];
const ICONS = { info: 'ℹ', success: '✓', warning: '!', error: '✕' };
let tid = 0;
function defineToastStack(tag = 'usa-toast-stack') {
    installToastTriggers();
    return defineElement(tag, (Base) => {
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
    }, { id: 'toast', text: css$g });
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

var css$f = "usa-menu{position:relative;display:inline-block}.usa-menu-list{position:absolute;z-index:50;min-width:180px;max-width:min(280px,90vw);box-sizing:border-box;padding:6px;border-radius:12px;background:var(--usa-menu-bg,#fff);color:var(--usa-menu-fg,#111827);box-shadow:0 18px 44px -12px rgba(0,0,0,.35),0 0 0 1px rgba(127,127,127,.15);display:flex;flex-direction:column;gap:2px;text-align:left}.usa-menu-list[hidden]{display:none}usa-menu[data-placement^=\"bottom\"] .usa-menu-list{top:calc(100% + 6px)}usa-menu[data-placement^=\"top\"] .usa-menu-list{bottom:calc(100% + 6px)}usa-menu[data-placement$=\"start\"] .usa-menu-list{left:0;transform-origin:0 0}usa-menu[data-placement$=\"end\"] .usa-menu-list{right:0;transform-origin:100% 0}usa-menu[data-placement=\"top-start\"] .usa-menu-list{transform-origin:0 100%}usa-menu[data-placement=\"top-end\"] .usa-menu-list{transform-origin:100% 100%}.usa-menu-list>[role=\"menuitem\"]{display:flex;align-items:center;gap:8px;width:100%;box-sizing:border-box;border:0;background:none;color:inherit;font:500 14px/1.3 system-ui,sans-serif;text-align:left;text-decoration:none;padding:8px 10px;border-radius:8px;cursor:pointer}.usa-menu-list>[role=\"menuitem\"]:hover,.usa-menu-list>[role=\"menuitem\"]:focus-visible{background:var(--usa-menu-hover,rgba(124,92,255,.14));outline:none}.usa-menu-list>hr{border:0;border-top:1px solid rgba(127,127,127,.2);margin:4px 2px}@media (prefers-color-scheme:dark){.usa-menu-list{background:var(--usa-menu-bg,#1d2130);color:var(--usa-menu-fg,#e5e7eb)}}";

const MENU_EFFECTS = ['scale', 'fold', 'slide'];
function defineMenu(tag = 'usa-menu') {
    return defineElement(tag, (Base) => {
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
    }, { id: 'menu', text: css$f });
}

var css$e = "usa-progress-ring{position:relative;display:inline-block;vertical-align:middle;width:var(--usa-pr-size,120px);aspect-ratio:1;--usa-pr-color:#7c5cff;--usa-pr-track:rgba(127,127,127,.18);--usa-pr-width:9;font:700 calc(var(--usa-pr-size,120px)*.2)/1 system-ui,sans-serif;font-variant-numeric:tabular-nums}usa-progress-ring[data-variant=\"semi\"]{aspect-ratio:100/56}.usa-pr-label{position:absolute;inset:0;display:grid;place-items:center}usa-progress-ring[data-variant=\"semi\"] .usa-pr-label{place-items:end center}usa-progress-ring[data-variant=\"bar\"]{display:inline-flex;width:var(--usa-pr-size,100%);aspect-ratio:auto;gap:10px;align-items:center;font-size:14px}usa-progress-ring[data-variant=\"bar\"]>.usa-pr-track{flex:1 1 auto;min-width:40px}usa-progress-ring[data-variant=\"bar\"] .usa-pr-label{position:static;display:inline}usa-progress-ring .usa-pr-svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}.usa-pr-svg path{fill:none;stroke-width:var(--usa-pr-width);stroke-linecap:round}.usa-pr-svg .usa-pr-track{stroke:var(--usa-pr-track)}.usa-pr-svg .usa-pr-arc{stroke:var(--usa-pr-color)}usa-progress-ring[data-variant=\"semi\"] .usa-pr-label{padding-bottom:2%}.usa-pr-track:is(div){height:10px;border-radius:999px;background:var(--usa-pr-track);overflow:hidden}.usa-pr-fill{height:100%;border-radius:inherit;background:var(--usa-pr-color);transform-origin:0 50%;transform:scaleX(0)}usa-progress-ring[data-indeterminate] .usa-pr-svg{animation:usa-pr-spin 1.1s linear infinite}usa-progress-ring[data-indeterminate] .usa-pr-fill{width:35%;transform:none!important;animation:usa-pr-slide 1.3s ease-in-out infinite}@keyframes usa-pr-spin{to{transform:rotate(360deg)}}@keyframes usa-pr-slide{from{margin-left:-35%}to{margin-left:100%}}usa-odometer{display:inline-flex;align-items:flex-end;font-variant-numeric:tabular-nums;line-height:1.15}.usa-odo-row{display:inline-flex;align-items:flex-end}.usa-odo-col{display:inline-block;height:1.15em;overflow:hidden;-webkit-mask-image:linear-gradient(transparent,#000 18%,#000 82%,transparent);mask-image:linear-gradient(transparent,#000 18%,#000 82%,transparent)}.usa-odo-strip{display:block;white-space:pre;line-height:1.15em;text-align:center}.usa-odo-sym{display:inline-block;height:1.15em}@media (prefers-reduced-motion:reduce){usa-progress-ring[data-indeterminate] .usa-pr-svg,usa-progress-ring[data-indeterminate] .usa-pr-fill{animation-duration:4s}}";

const PROGRESS_VARIANTS = ['ring', 'bar', 'semi'];
const NS = 'http://www.w3.org/2000/svg';
function defineProgressRing(tag = 'usa-progress-ring') {
    return defineElement(tag, (Base) => {
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
                    const svg = document.createElementNS(NS, 'svg');
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
    }, { id: 'meters', text: css$e });
}
function defineOdometer(tag = 'usa-odometer') {
    return defineElement(tag, (Base) => {
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
    }, { id: 'meters', text: css$e });
}

var css$d = "usa-skeleton-reveal{position:relative;display:block;--usa-sk-base:rgba(127,127,127,.16);--usa-sk-hi:rgba(255,255,255,.55)}usa-skeleton-reveal[data-loading]>:not(.usa-sk-layer){visibility:hidden}.usa-sk-layer{position:absolute;inset:0;pointer-events:none}.usa-sk-box{position:absolute;border-radius:6px;background:var(--usa-sk-base);overflow:hidden}usa-skeleton-reveal[data-variant=\"wave\"] .usa-sk-box{background:linear-gradient(100deg,var(--usa-sk-base) 30%,var(--usa-sk-hi) 50%,var(--usa-sk-base) 70%) var(--usa-sk-x,0) 0/var(--usa-sk-w,600px) 100% no-repeat,var(--usa-sk-base);animation:usa-sk-wave 1.4s linear infinite}usa-skeleton-reveal[data-variant=\"pulse\"] .usa-sk-box{animation:usa-sk-pulse 1.2s ease-in-out infinite alternate}usa-skeleton-reveal[data-variant=\"glow\"] .usa-sk-box{animation:usa-sk-glow 1.6s ease-in-out infinite alternate}@keyframes usa-sk-wave{from{background-position:calc(var(--usa-sk-x,0px) - var(--usa-sk-w,600px)) 0,0 0}to{background-position:calc(var(--usa-sk-x,0px) + var(--usa-sk-w,600px)) 0,0 0}}@keyframes usa-sk-pulse{from{opacity:1}to{opacity:.45}}@keyframes usa-sk-glow{from{box-shadow:0 0 0 rgba(124,92,255,0)}to{box-shadow:0 0 14px rgba(124,92,255,.45);background:rgba(124,92,255,.22)}}@media (prefers-color-scheme:dark){usa-skeleton-reveal{--usa-sk-hi:rgba(255,255,255,.16)}}@media (prefers-reduced-motion:reduce){.usa-sk-box{animation:none!important}}";

const SKELETON_VARIANTS = ['wave', 'pulse', 'glow'];
function defineSkeletonReveal(tag = 'usa-skeleton-reveal') {
    return defineElement(tag, (Base) => {
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
    }, { id: 'skeleton-reveal', text: css$d });
}

var css$c = "usa-star-rating{display:inline-flex;gap:var(--usa-star-gap,4px);--usa-star-size:28px;--usa-star-on:#fbbf24;--usa-star-off:rgba(127,127,127,.28);cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent;border-radius:8px}usa-star-rating[readonly]{cursor:default}usa-star-rating:focus-visible{outline:2px solid var(--usa-star-on);outline-offset:4px}.usa-star{position:relative;display:inline-block;width:var(--usa-star-size);height:var(--usa-star-size);--usa-star-fill:0%}.usa-star svg{display:block;width:100%;height:100%;overflow:visible;stroke:none}.usa-star-bg{fill:var(--usa-star-off)}.usa-star-fg{position:absolute;left:0;top:0;bottom:0;width:var(--usa-star-fill);overflow:hidden;transition:width .18s ease-out}.usa-star-fg svg{width:var(--usa-star-size);height:var(--usa-star-size);fill:var(--usa-star-on);filter:drop-shadow(0 1px 3px rgba(251,191,36,.45))}usa-star-rating[data-preview] .usa-star-fg{opacity:.8}.usa-star-spark{position:absolute;left:50%;top:50%;width:6px;height:6px;border-radius:50%;background:var(--usa-star-on);pointer-events:none}@media (prefers-reduced-motion:reduce){.usa-star-fg{transition:none}}";

const PATHS = {
    star: 'M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z',
    heart: 'M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.9 4.5 6.6 4.5c2.1 0 3.6 1.2 5.4 3.1 1.8-1.9 3.3-3.1 5.4-3.1 3.7 0 5.7 3.9 4.2 7.3C19.5 16.4 12 21 12 21z',
};
function defineStarRating(tag = 'usa-star-rating') {
    return defineElement(tag, (Base) => {
        class UsaStarRating extends Base {
            constructor() {
                super(...arguments);
                this._v = 0;
                this._stars = [];
            }
            static get observedAttributes() {
                return ['max', 'icon', 'readonly', 'step'];
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
                const icon = PATHS[this.str('icon', 'star')] || PATHS.star;
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
                if (changed)
                    this.emit('change', { value: nv });
            }
        }
        return UsaStarRating;
    }, { id: 'star-rating', text: css$c });
}

var css$b = "usa-milestones{position:relative;display:block;--usa-ms-color:#7c5cff;--usa-ms-rail:rgba(127,127,127,.22);--usa-ms-gap:28px;padding:4px 0}.usa-ms-rail{position:absolute;top:0;bottom:0;left:50%;width:3px;margin-left:-1.5px;border-radius:3px;background:var(--usa-ms-rail);overflow:hidden}.usa-ms-fill{position:absolute;inset:0;background:linear-gradient(var(--usa-ms-color),#22d3ee);transform-origin:50% 0;transform:scaleY(0)}.usa-ms-item{position:relative;box-sizing:border-box;width:50%;padding:0 var(--usa-ms-gap) var(--usa-ms-gap);text-align:left}.usa-ms-item[data-side=\"right\"]{margin-left:50%}.usa-ms-item[data-side=\"left\"]{text-align:right}.usa-ms-dot{position:absolute;top:4px;width:14px;height:14px;border-radius:50%;background:var(--usa-ms-color);box-shadow:0 0 0 4px color-mix(in srgb,var(--usa-ms-color) 22%,transparent);transform:scale(0)}.usa-ms-item[data-reached] .usa-ms-dot{transform:none}.usa-ms-item[data-side=\"right\"] .usa-ms-dot{left:-7px}.usa-ms-item[data-side=\"left\"] .usa-ms-dot{right:-7px}.usa-ms-date{display:block;font-size:.8em;font-weight:700;letter-spacing:.04em;color:var(--usa-ms-color);margin-bottom:2px}.usa-ms-item:not([data-reached])>:not(.usa-ms-dot){opacity:0}usa-milestones[data-layout=\"left\"] .usa-ms-rail{left:7px}usa-milestones[data-layout=\"left\"] .usa-ms-item{width:auto;margin-left:0;padding-left:calc(var(--usa-ms-gap) + 8px);text-align:left}usa-milestones[data-layout=\"left\"] .usa-ms-dot{left:1px;right:auto}@media (max-width:640px){usa-milestones .usa-ms-rail{left:7px}usa-milestones .usa-ms-item{width:auto;margin-left:0;padding-left:calc(var(--usa-ms-gap) + 8px);text-align:left}usa-milestones .usa-ms-item .usa-ms-dot{left:1px;right:auto}}";

function defineMilestones(tag = 'usa-milestones') {
    return defineElement(tag, (Base) => {
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
    }, { id: 'milestones', text: css$b });
}

var css$a = "usa-masonry-flow{position:relative;display:block;width:100%}usa-masonry-flow>*{position:absolute;left:0;top:0;box-sizing:border-box;margin:0;will-change:transform}usa-masonry-flow>[data-hidden]:not([data-leaving]){display:none}usa-masonry-flow>[data-leaving]{pointer-events:none}";

function defineMasonryFlow(tag = 'usa-masonry-flow') {
    return defineElement(tag, (Base) => {
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
    }, { id: 'masonry-flow', text: css$a });
}

var css$9 = "usa-compare{position:relative;display:grid;overflow:hidden;border-radius:var(--usa-cmp-radius,14px);user-select:none;touch-action:pan-y;cursor:ew-resize;--usa-cmp-line:#fff;outline-offset:3px}usa-compare[data-orientation=\"vertical\"]{touch-action:pan-x;cursor:ns-resize}usa-compare>.usa-cmp-before,usa-compare>.usa-cmp-after{grid-area:1/1;display:block;width:100%;height:100%;object-fit:cover;pointer-events:none}.usa-cmp-handle{position:absolute;top:0;bottom:0;left:50%;width:0;z-index:2;pointer-events:none}.usa-cmp-handle::before{content:\"\";position:absolute;top:0;bottom:0;left:-1.5px;width:3px;background:var(--usa-cmp-line);box-shadow:0 0 8px rgba(0,0,0,.35)}usa-compare[data-orientation=\"vertical\"] .usa-cmp-handle{top:50%;bottom:auto;left:0;right:0;width:auto;height:0}usa-compare[data-orientation=\"vertical\"] .usa-cmp-handle::before{left:0;right:0;top:-1.5px;width:auto;height:3px}.usa-cmp-knob{position:absolute;top:50%;left:0;display:grid;place-items:center;width:40px;height:40px;margin:-20px 0 0 -20px;border-radius:50%;background:var(--usa-cmp-line);color:#111827;box-shadow:0 6px 18px rgba(0,0,0,.35);pointer-events:auto;cursor:grab;transition:transform .2s}usa-compare[data-orientation=\"vertical\"] .usa-cmp-knob{left:50%;top:0;transform:rotate(90deg)}usa-compare:active .usa-cmp-knob{transform:scale(.92)}usa-compare[data-orientation=\"vertical\"]:active .usa-cmp-knob{transform:rotate(90deg) scale(.92)}.usa-cmp-label{position:absolute;top:10px;z-index:1;padding:3px 9px;border-radius:999px;background:rgba(0,0,0,.55);color:#fff;font:600 12px/1.4 system-ui,sans-serif;pointer-events:none}.usa-cmp-label-b{left:10px}.usa-cmp-label-a{right:10px}";

function defineCompare(tag = 'usa-compare') {
    return defineElement(tag, (Base) => {
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
    }, { id: 'compare', text: css$9 });
}

var css$8 = "usa-cube-gallery{position:relative;display:block;aspect-ratio:4/3;perspective:1100px;outline-offset:4px}.usa-cube-stage{position:absolute;inset:0;transform-style:preserve-3d;touch-action:pan-y}.usa-cube-face{position:absolute;inset:0;box-sizing:border-box;margin:0;backface-visibility:hidden;display:none;overflow:hidden;border-radius:var(--usa-cube-radius,14px)}.usa-cube-face[data-active]{display:block}.usa-cube-face>img{width:100%;height:100%;object-fit:cover;display:block}.usa-cube-btn{position:absolute;top:50%;z-index:2;width:34px;height:34px;margin-top:-17px;border:0;border-radius:50%;background:rgba(255,255,255,.85);color:#111827;font:700 20px/1 system-ui,sans-serif;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.25)}.usa-cube-prev{left:8px}.usa-cube-next{right:8px}.usa-cube-btn:focus-visible{outline:2px solid #7c5cff;outline-offset:2px}";

function defineCubeGallery(tag = 'usa-cube-gallery') {
    return defineElement(tag, (Base) => {
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
    }, { id: 'cube-gallery', text: css$8 });
}

var css$7 = "usa-dock{display:inline-flex;align-items:flex-end;gap:var(--usa-dock-gap,8px);padding:8px 10px;border-radius:20px;background:var(--usa-dock-bg,rgba(255,255,255,.55));-webkit-backdrop-filter:blur(14px) saturate(1.6);backdrop-filter:blur(14px) saturate(1.6);box-shadow:0 10px 30px -10px rgba(0,0,0,.35),inset 0 0 0 1px rgba(255,255,255,.45);--usa-dock-size:44px}usa-dock[data-orientation=\"vertical\"]{flex-direction:column;align-items:flex-start}.usa-dock-item{--usa-dock-s:1;position:relative;display:grid;place-items:center;flex:none;width:calc(var(--usa-dock-size) * var(--usa-dock-s));height:calc(var(--usa-dock-size) * var(--usa-dock-s));border:0;padding:0;border-radius:calc(var(--usa-dock-size) * .26 * var(--usa-dock-s));background:var(--usa-dock-item,linear-gradient(135deg,#7c5cff,#22d3ee));color:#fff;font-size:calc(var(--usa-dock-size) * .5 * var(--usa-dock-s));text-decoration:none;cursor:pointer;transition:width .12s ease-out,height .12s ease-out,font-size .12s ease-out,border-radius .12s;box-shadow:0 4px 10px rgba(0,0,0,.18)}.usa-dock-item:focus-visible{outline:2px solid #7c5cff;outline-offset:3px}.usa-dock-item[data-label]::after{content:attr(data-label);position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%) translateY(4px);padding:3px 8px;border-radius:6px;background:rgba(17,24,39,.9);color:#fff;font:500 12px/1.3 system-ui,sans-serif;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .15s,transform .15s}.usa-dock-item[data-near]::after,.usa-dock-item:focus-visible::after{opacity:1;transform:translateX(-50%)}usa-dock[data-orientation=\"vertical\"] .usa-dock-item[data-label]::after{bottom:auto;left:calc(100% + 8px);top:50%;transform:translateY(-50%)}@media (prefers-reduced-motion:reduce){.usa-dock-item{transition:none}}";

function defineDock(tag = 'usa-dock') {
    return defineElement(tag, (Base) => {
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
    }, { id: 'dock', text: css$7 });
}

var css$6 = "usa-nav-morph{position:relative;display:flex;gap:4px;align-items:center;isolation:isolate;--usa-nm-color:#7c5cff;flex-wrap:nowrap;max-width:100%;overflow-x:auto;scrollbar-width:none}usa-nav-morph::-webkit-scrollbar{display:none}usa-nav-morph>:not(.usa-nm-ink){position:relative;z-index:1;flex:none;padding:8px 12px;border-radius:10px;color:inherit;text-decoration:none;font-weight:600;white-space:nowrap;transition:color .25s;outline-offset:2px}.usa-nm-ink{position:absolute;left:0;z-index:0;width:0;pointer-events:none;background:var(--usa-nm-color)}usa-nav-morph[data-indicator=\"underline\"] .usa-nm-ink{bottom:0;height:3px;border-radius:3px}usa-nav-morph[data-indicator=\"pill\"] .usa-nm-ink,usa-nav-morph[data-indicator=\"blob\"] .usa-nm-ink{top:0;bottom:0;border-radius:10px;opacity:.16}usa-nav-morph[data-indicator=\"blob\"] .usa-nm-ink{border-radius:999px;opacity:.2}usa-nav-morph[data-indicator=\"dot\"] .usa-nm-ink{bottom:0;height:6px;background:radial-gradient(circle,var(--usa-nm-color) 3px,transparent 3.5px)}usa-nav-morph>[aria-current=\"page\"]{color:var(--usa-nm-color)}";

const NAV_INDICATORS = ['underline', 'pill', 'blob', 'dot'];
function defineNavMorph(tag = 'usa-nav-morph') {
    return defineElement(tag, (Base) => {
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
    }, { id: 'nav-morph', text: css$6 });
}

var css$5 = "usa-menu-toggle{display:inline-grid;place-items:center;width:var(--usa-mt-size,44px);height:var(--usa-mt-size,44px);border-radius:12px;cursor:pointer;color:inherit;-webkit-tap-highlight-color:transparent;outline-offset:2px;--usa-mt-ease:cubic-bezier(.65,.05,.36,1)}usa-menu-toggle:hover{background:rgba(127,127,127,.12)}.usa-mt-box{position:relative;width:24px;height:18px}.usa-mt-bar{position:absolute;left:0;width:100%;height:2.5px;border-radius:2px;background:currentColor;transform-origin:50% 50%}.usa-mt-bar:nth-child(1){top:0}.usa-mt-bar:nth-child(2){top:7.75px}.usa-mt-bar:nth-child(3){bottom:0}usa-menu-toggle[data-animate] .usa-mt-bar{transition:transform .38s var(--usa-mt-ease),opacity .2s,top .38s var(--usa-mt-ease),bottom .38s var(--usa-mt-ease),width .38s var(--usa-mt-ease)}usa-menu-toggle[data-animate] .usa-mt-box{transition:transform .38s var(--usa-mt-ease)}usa-menu-toggle[data-variant=\"cross\"][data-open] .usa-mt-bar:nth-child(1),usa-menu-toggle[data-variant=\"plus-x\"][data-open] .usa-mt-bar:nth-child(1){top:7.75px;transform:rotate(45deg)}usa-menu-toggle[data-variant=\"cross\"][data-open] .usa-mt-bar:nth-child(2),usa-menu-toggle[data-variant=\"plus-x\"][data-open] .usa-mt-bar:nth-child(2){opacity:0;transform:scaleX(.2)}usa-menu-toggle[data-variant=\"cross\"][data-open] .usa-mt-bar:nth-child(3),usa-menu-toggle[data-variant=\"plus-x\"][data-open] .usa-mt-bar:nth-child(3){bottom:7.75px;transform:rotate(-45deg)}usa-menu-toggle[data-variant=\"plus-x\"][data-open] .usa-mt-box{transform:rotate(180deg)}usa-menu-toggle[data-variant=\"arrow\"][data-open] .usa-mt-bar:nth-child(1){width:55%;transform:translate(-2px,3.5px) rotate(-40deg)}usa-menu-toggle[data-variant=\"arrow\"][data-open] .usa-mt-bar:nth-child(3){width:55%;transform:translate(-2px,-3.5px) rotate(40deg)}usa-menu-toggle[data-variant=\"arrow\"][data-open] .usa-mt-box{transform:rotate(180deg)}usa-menu-toggle[data-variant=\"minus\"][data-open] .usa-mt-bar:nth-child(1){top:7.75px}usa-menu-toggle[data-variant=\"minus\"][data-open] .usa-mt-bar:nth-child(3){bottom:7.75px}";

const TOGGLE_VARIANTS = ['cross', 'arrow', 'minus', 'plus-x'];
function defineMenuToggle(tag = 'usa-menu-toggle') {
    return defineElement(tag, (Base) => {
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
    }, { id: 'menu-toggle', text: css$5 });
}

var css$4 = "usa-tip{position:relative;display:inline-block}.usa-tip-bubble{position:absolute;left:0;top:0;z-index:60;box-sizing:border-box;max-width:min(260px,calc(100vw - 16px));width:max-content;padding:7px 11px;border-radius:9px;background:var(--usa-tip-bg,#111827);color:var(--usa-tip-fg,#f9fafb);font:500 13px/1.4 system-ui,sans-serif;box-shadow:0 10px 26px -8px rgba(0,0,0,.4);text-align:left;white-space:normal}.usa-tip-bubble[hidden]{display:none}.usa-tip-bubble[data-placement=\"top\"]{transform-origin:50% 100%}.usa-tip-bubble[data-placement=\"bottom\"]{transform-origin:50% 0}.usa-tip-bubble[data-placement=\"left\"]{transform-origin:100% 50%}.usa-tip-bubble[data-placement=\"right\"]{transform-origin:0 50%}.usa-tip-arrow{position:absolute;width:10px;height:10px;background:inherit;transform:rotate(45deg)}.usa-tip-bubble[data-placement=\"top\"] .usa-tip-arrow{bottom:-4px;left:calc(50% - 5px + var(--usa-tip-shift,0px))}.usa-tip-bubble[data-placement=\"bottom\"] .usa-tip-arrow{top:-4px;left:calc(50% - 5px + var(--usa-tip-shift,0px))}.usa-tip-bubble[data-placement=\"left\"] .usa-tip-arrow{right:-4px;top:calc(50% - 5px)}.usa-tip-bubble[data-placement=\"right\"] .usa-tip-arrow{left:-4px;top:calc(50% - 5px)}";

const TIP_PLACEMENTS = ['top', 'bottom', 'left', 'right'];
const FLIP = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
function defineTip(tag = 'usa-tip') {
    return defineElement(tag, (Base) => {
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
    }, { id: 'tip', text: css$4 });
}

var css$3 = "usa-stepper{--usa-st-c:#7c5cff;--usa-st-size:30px;position:relative;display:flex;justify-content:space-between;gap:8px;padding:0;counter-reset:s;max-width:100%}usa-stepper[data-orientation=\"vertical\"]{flex-direction:column;gap:22px}.usa-st-rail{position:absolute;left:calc(var(--usa-st-size)/2);right:calc(var(--usa-st-size)/2);top:calc(var(--usa-st-size)/2 - 2px);height:4px;border-radius:4px;background:rgba(127,127,127,.25);pointer-events:none}usa-stepper[data-orientation=\"vertical\"] .usa-st-rail{left:calc(var(--usa-st-size)/2 - 2px);right:auto;top:calc(var(--usa-st-size)/2);bottom:calc(var(--usa-st-size)/2);width:4px;height:auto}.usa-st-fill{position:absolute;inset:0;border-radius:inherit;background:var(--usa-st-c);transform-origin:0 0;transform:scaleX(calc(var(--usa-st-p,0%) / 100%));transition:transform .55s cubic-bezier(.6,.05,.3,1)}usa-stepper[data-orientation=\"vertical\"] .usa-st-fill{transform:scaleY(calc(var(--usa-st-p,0%) / 100%))}.usa-st-step{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:6px;min-width:0;font:600 12px/1.25 system-ui,sans-serif;text-align:center;color:rgba(127,127,127,.95)}usa-stepper[data-orientation=\"vertical\"] .usa-st-step{flex-direction:row;text-align:left}.usa-st-step[data-current],.usa-st-step[data-done]{color:inherit}.usa-st-dot{position:relative;display:grid;place-items:center;flex:none;width:var(--usa-st-size);height:var(--usa-st-size);border-radius:50%;background:var(--usa-st-bg,#fff);box-shadow:inset 0 0 0 2px rgba(127,127,127,.4);color:#666;font-weight:700;transition:background .3s,box-shadow .3s,color .3s}.usa-st-step[data-current] .usa-st-dot{box-shadow:inset 0 0 0 2px var(--usa-st-c);color:var(--usa-st-c)}.usa-st-step[data-done] .usa-st-dot{background:var(--usa-st-c);box-shadow:none;color:#fff}.usa-st-check{position:absolute;width:60%;height:60%;fill:none;stroke:#fff;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:20;stroke-dashoffset:20;opacity:0}.usa-st-step[data-done] .usa-st-check{stroke-dashoffset:0;opacity:1}.usa-st-step[data-done] .usa-st-num{opacity:0}.usa-st-step[data-clickable],usa-stepper[clickable] .usa-st-step{cursor:pointer}@media (prefers-reduced-motion:reduce){.usa-st-fill,.usa-st-dot{transition:none}}";

function defineStepper(tag = 'usa-stepper') {
    return defineElement(tag, (Base) => {
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
    }, { id: 'stepper', text: css$3 });
}

var css$2 = "usa-pagination{--usa-pg-c:#7c5cff;display:inline-flex;align-items:center;gap:4px;max-width:100%;font:600 14px/1 system-ui,sans-serif}.usa-pg-list{position:relative;display:inline-flex;align-items:center;gap:2px;isolation:isolate}.usa-pg-ink{position:absolute;left:0;top:0;height:100%;width:0;border-radius:10px;background:var(--usa-pg-c);z-index:-1;transition:width .3s}.usa-pg-btn{display:grid;place-items:center;min-width:34px;height:34px;padding:0 6px;border:0;border-radius:10px;background:none;color:inherit;font:inherit;cursor:pointer;transition:color .25s,background .2s}.usa-pg-btn:hover:not(:disabled):not([aria-current]){background:rgba(127,127,127,.14)}.usa-pg-btn[aria-current=\"page\"]{color:#fff}.usa-pg-btn:disabled{opacity:.35;cursor:default}.usa-pg-btn:focus-visible{outline:2px solid var(--usa-pg-c);outline-offset:2px}.usa-pg-gap{min-width:20px;text-align:center;opacity:.6}@media (max-width:420px){.usa-pg-btn{min-width:28px;height:30px;padding:0 3px}}@media (prefers-reduced-motion:reduce){.usa-pg-ink{transition:none}}";

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
    return defineElement(tag, (Base) => {
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
    }, { id: 'pagination', text: css$2 });
}

var css$1 = "usa-segmented{--usa-seg-c:#7c5cff;position:relative;display:inline-flex;align-items:stretch;padding:3px;border-radius:12px;background:rgba(127,127,127,.16);isolation:isolate;max-width:100%;font:600 13px/1 system-ui,sans-serif}.usa-seg-thumb{position:absolute;top:3px;bottom:3px;left:3px;z-index:-1;border-radius:9px;background:var(--usa-seg-thumb,#fff);box-shadow:0 2px 8px rgba(0,0,0,.18),0 0 0 .5px rgba(0,0,0,.05);transform-origin:50% 50%}usa-segmented[data-variant=\"pill\"]{border-radius:999px}usa-segmented[data-variant=\"pill\"] .usa-seg-thumb{border-radius:999px;background:var(--usa-seg-c)}usa-segmented[data-variant=\"pill\"] .usa-seg-item[data-selected]{color:#fff}usa-segmented[data-variant=\"outline\"]{background:none;box-shadow:inset 0 0 0 1.5px rgba(127,127,127,.35)}usa-segmented[data-variant=\"outline\"] .usa-seg-thumb{background:none;box-shadow:inset 0 0 0 2px var(--usa-seg-c)}.usa-seg-item{flex:1 1 0;min-width:0;padding:8px 14px;border:0;border-radius:9px;background:none;color:inherit;font:inherit;white-space:nowrap;cursor:pointer;opacity:.7;transition:opacity .2s,transform .25s cubic-bezier(.3,1.4,.5,1),color .2s}.usa-seg-item[data-selected]{opacity:1;transform:scale(1.04)}.usa-seg-item:focus-visible{outline:2px solid var(--usa-seg-c);outline-offset:1px}@media (max-width:420px){.usa-seg-item{padding:8px 9px}}@media (prefers-reduced-motion:reduce){.usa-seg-item{transition:none}}";

const SEGMENTED_VARIANTS = ['ios', 'pill', 'outline'];
function defineSegmented(tag = 'usa-segmented') {
    return defineElement(tag, (Base) => {
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
    }, { id: 'segmented', text: css$1 });
}

var css = "usa-switch{--usa-sw-c:#34c759;--usa-sw-w:52px;--usa-sw-h:30px;display:inline-flex;align-items:center;gap:8px;cursor:pointer;-webkit-tap-highlight-color:transparent;vertical-align:middle;outline-offset:3px;border-radius:999px}usa-switch[disabled]{opacity:.45;cursor:not-allowed}.usa-sw-track{position:relative;flex:none;width:var(--usa-sw-w);height:var(--usa-sw-h);border-radius:999px;background:rgba(127,127,127,.35);overflow:hidden;transition:background .3s}.usa-sw-fill{position:absolute;inset:0;border-radius:999px;background:var(--usa-sw-c);transform:scale(0);transform-origin:calc(var(--usa-sw-h)/2) 50%;transition:transform .35s cubic-bezier(.4,0,.2,1)}usa-switch[data-on] .usa-sw-fill{transform:scale(1)}.usa-sw-thumb{position:absolute;top:3px;left:3px;width:calc(var(--usa-sw-h) - 6px);height:calc(var(--usa-sw-h) - 6px);border-radius:999px;background:#fff;box-shadow:0 2px 6px rgba(0,0,0,.25);transition:left .32s cubic-bezier(.3,1.25,.5,1),width .2s ease,background .3s,box-shadow .3s}usa-switch[data-on] .usa-sw-thumb{left:calc(var(--usa-sw-w) - var(--usa-sw-h) + 3px)}usa-switch[data-variant=\"ios\"][data-press] .usa-sw-thumb{width:calc(var(--usa-sw-h) + 2px)}usa-switch[data-variant=\"ios\"][data-press][data-on] .usa-sw-thumb{left:calc(var(--usa-sw-w) - var(--usa-sw-h) - 5px)}usa-switch[data-variant=\"daynight\"]{--usa-sw-w:64px;--usa-sw-h:32px}usa-switch[data-variant=\"daynight\"] .usa-sw-track{background:linear-gradient(#7dd3fc,#38bdf8)}usa-switch[data-variant=\"daynight\"] .usa-sw-fill{background:linear-gradient(#1e1b4b,#312e81);transform:none;opacity:0;transition:opacity .45s}usa-switch[data-variant=\"daynight\"][data-on] .usa-sw-fill{opacity:1}usa-switch[data-variant=\"daynight\"] .usa-sw-thumb{background:radial-gradient(circle at 40% 40%,#fde68a,#f59e0b);box-shadow:0 0 10px #fbbf24}usa-switch[data-variant=\"daynight\"][data-on] .usa-sw-thumb{background:radial-gradient(circle at 65% 35%,transparent 5px,#e5e7eb 5.5px);box-shadow:0 0 8px rgba(255,255,255,.5)}usa-switch[data-variant=\"daynight\"] .usa-sw-deco{position:absolute;inset:0;background:radial-gradient(circle,#fff 1px,transparent 1.5px) 12px 8px/14px 11px;opacity:0;transform:translateY(6px);transition:opacity .4s,transform .5s}usa-switch[data-variant=\"daynight\"][data-on] .usa-sw-deco{opacity:.9;transform:none}usa-switch[data-variant=\"bounce\"] .usa-sw-thumb{transition:left .28s cubic-bezier(.5,0,.75,0)}usa-switch[data-variant=\"liquid\"] .usa-sw-fill{background:linear-gradient(90deg,#22d3ee,#7c5cff)}usa-switch[data-variant=\"liquid\"] .usa-sw-thumb{transition:left .5s cubic-bezier(.68,-.4,.27,1.4)}usa-switch:focus-visible .usa-sw-track{box-shadow:0 0 0 3px rgba(124,92,255,.5)}@media (prefers-reduced-motion:reduce){.usa-sw-thumb,.usa-sw-fill,.usa-sw-deco,.usa-sw-track{transition:none!important}}";

const SWITCH_VARIANTS = ['ios', 'daynight', 'bounce', 'liquid'];
function defineSwitch(tag = 'usa-switch') {
    return defineElement(tag, (Base) => {
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
    }, { id: 'switch', text: css });
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

export { CAROUSEL_EFFECTS, MENU_EFFECTS, MODAL_EFFECTS, NAV_INDICATORS, PROGRESS_VARIANTS, SEGMENTED_VARIANTS, SHEET_SIDES, SKELETON_VARIANTS, SWITCH_VARIANTS, TAB_INDICATORS, TIP_PLACEMENTS, TOAST_POSITIONS, TOGGLE_VARIANTS, WIDGETS, WIDGET_TAGS, defineCarousel, defineCompare, defineCubeGallery, defineDisclosure, defineDock, defineMasonryFlow, defineMenu, defineMenuToggle, defineMilestones, defineModal, defineNavMorph, defineOdometer, definePagination, defineProgressRing, defineSegmented, defineSheet, defineSkeletonReveal, defineStarRating, defineStepper, defineStories, defineSwitch, defineTabBar, defineTip, defineToastStack, defineWidgets, pageWindow, stackToast };
//# sourceMappingURL=widgets.js.map
