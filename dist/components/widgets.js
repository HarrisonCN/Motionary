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

var css$9 = "usa-carousel{display:block;position:relative;--usa-carousel-dur:520ms;--usa-carousel-ease:cubic-bezier(.22,1,.36,1);overflow:hidden;border-radius:var(--usa-radius,14px);touch-action:pan-y}.usa-carousel-viewport{position:relative;overflow:hidden;height:100%;min-height:inherit}.usa-carousel-track{display:flex;height:100%;transition:transform var(--usa-carousel-dur) var(--usa-carousel-ease);will-change:transform}.usa-carousel-track>*{flex:0 0 100%;min-width:0;box-sizing:border-box}usa-carousel:not([data-effect=\"slide\"]) .usa-carousel-track{display:grid}usa-carousel:not([data-effect=\"slide\"]) .usa-carousel-track>*{grid-area:1/1;transition:opacity var(--usa-carousel-dur) ease,transform var(--usa-carousel-dur) var(--usa-carousel-ease),filter var(--usa-carousel-dur) ease}usa-carousel[data-effect=\"cards\"] .usa-carousel-viewport{perspective:900px}usa-carousel[data-dragging] .usa-carousel-track,usa-carousel[data-dragging] .usa-carousel-track>*{transition:none}.usa-carousel-nav{position:absolute;top:50%;translate:0 -50%;z-index:2;width:36px;height:36px;border-radius:50%;border:0;background:rgba(255,255,255,.85);color:#111;font:600 18px/1 system-ui;cursor:pointer;display:grid;place-items:center;box-shadow:0 4px 14px rgba(0,0,0,.18);transition:transform .2s}.usa-carousel-nav:hover{transform:scale(1.08)}.usa-carousel-nav:focus-visible{outline:2px solid #7c5cff;outline-offset:2px}.usa-carousel-prev{left:10px}.usa-carousel-next{right:10px}.usa-carousel-dots{position:absolute;left:0;right:0;bottom:10px;display:flex;justify-content:center;gap:6px;z-index:2}.usa-carousel-dot{width:8px;height:8px;padding:0;border:0;border-radius:99px;background:rgba(255,255,255,.55);cursor:pointer;transition:width .35s var(--usa-carousel-ease),background .35s}.usa-carousel-dot[aria-current=\"true\"]{width:22px;background:#fff}@media (prefers-reduced-motion:reduce){usa-carousel .usa-carousel-track,usa-carousel .usa-carousel-track>*,.usa-carousel-dot{transition:none!important}}usa-carousel[data-reduced] .usa-carousel-track,usa-carousel[data-reduced] .usa-carousel-track>*{transition:none!important}";

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
    }, { id: 'carousel', text: css$9 });
}

var css$8 = "usa-tab-bar{display:block;--usa-tab-accent:#7c5cff;--usa-tab-ease:cubic-bezier(.22,1,.36,1)}.usa-tab-bar-list{position:relative;display:flex;gap:4px;padding:4px;border-radius:12px;background:rgba(127,127,127,.12);isolation:isolate;overflow-x:auto;scrollbar-width:none}.usa-tab-bar-list::-webkit-scrollbar{display:none}.usa-tab-bar-list>[role=\"tab\"]{position:relative;z-index:1;flex:1 0 auto;border:0;background:none;color:inherit;font:inherit;font-weight:600;padding:8px 14px;border-radius:9px;cursor:pointer;opacity:.7;transition:opacity .25s,color .25s;white-space:nowrap}.usa-tab-bar-list>[role=\"tab\"][aria-selected=\"true\"]{opacity:1}.usa-tab-bar-list>[role=\"tab\"]:focus-visible{outline:2px solid var(--usa-tab-accent);outline-offset:1px}.usa-tab-bar-ink{position:absolute;z-index:0;left:0;top:4px;bottom:4px;width:0;border-radius:9px;background:var(--usa-tab-accent);pointer-events:none}usa-tab-bar[data-indicator=\"pill\"] [aria-selected=\"true\"]{color:#fff}usa-tab-bar[data-indicator=\"underline\"] .usa-tab-bar-list{background:none;border-bottom:1px solid rgba(127,127,127,.25);border-radius:0}usa-tab-bar[data-indicator=\"underline\"] .usa-tab-bar-ink{top:auto;bottom:0;height:3px;border-radius:3px}usa-tab-bar[data-indicator=\"glow\"] .usa-tab-bar-ink{background:transparent;box-shadow:0 0 0 2px var(--usa-tab-accent),0 0 18px var(--usa-tab-accent)}usa-tab-bar[data-indicator=\"gooey\"] .usa-tab-bar-ink{filter:blur(.5px);border-radius:999px}usa-tab-bar[data-indicator=\"gooey\"] [aria-selected=\"true\"]{color:#fff}.usa-tab-bar-panel{padding:14px 2px}.usa-tab-bar-panel[hidden]{display:none}";

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
    }, { id: 'tab-bar', text: css$8 });
}

var css$7 = "usa-disclosure{display:block;--usa-disclosure-accent:#7c5cff}usa-disclosure>details{border-bottom:1px solid rgba(127,127,127,.25);overflow:hidden}usa-disclosure>details>summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 4px;font-weight:600}usa-disclosure>details>summary::-webkit-details-marker{display:none}usa-disclosure>details>summary::after{content:\"\";flex:none;width:9px;height:9px;border-right:2px solid currentColor;border-bottom:2px solid currentColor;rotate:45deg;translate:0 -3px;transition:rotate .35s cubic-bezier(.34,1.56,.64,1),translate .35s}usa-disclosure>details[open]>summary::after{rotate:225deg;translate:0 2px}usa-disclosure>details>summary:focus-visible{outline:2px solid var(--usa-disclosure-accent);outline-offset:2px;border-radius:6px}usa-disclosure>details>:not(summary){padding:0 4px 12px}usa-disclosure[variant=\"cards\"]>details{border:1px solid rgba(127,127,127,.25);border-radius:12px;margin-bottom:8px;padding:0 10px;transition:box-shadow .3s,border-color .3s}usa-disclosure[variant=\"cards\"]>details[open]{border-color:var(--usa-disclosure-accent);box-shadow:0 8px 24px rgba(124,92,255,.16)}@media (prefers-reduced-motion:reduce){usa-disclosure>details>summary::after{transition:none}}";

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
    }, { id: 'disclosure', text: css$7 });
}

var css$6 = "usa-stories{display:block;position:relative;overflow:hidden;border-radius:var(--usa-radius,16px);background:#111;color:#fff;aspect-ratio:9/14;max-height:520px;user-select:none;-webkit-user-select:none;touch-action:manipulation}usa-stories>:not([data-usa-part]){position:absolute;inset:0;opacity:0;transition:opacity .35s ease,transform .5s cubic-bezier(.22,1,.36,1);transform:scale(1.04);pointer-events:none;box-sizing:border-box}usa-stories>[data-active]:not([data-usa-part]){opacity:1;transform:none;pointer-events:auto}usa-stories>img:not([data-usa-part]){width:100%;height:100%;object-fit:cover}.usa-stories-bars{position:absolute;z-index:3;top:8px;left:8px;right:48px;display:flex;gap:4px}.usa-stories-bar{flex:1;height:3px;border-radius:3px;background:rgba(255,255,255,.35);overflow:hidden}.usa-stories-bar>i{display:block;height:100%;width:100%;background:#fff;transform-origin:left;transform:scaleX(0)}.usa-stories-bar[data-done]>i{transform:scaleX(1)}.usa-stories-toggle{position:absolute;z-index:3;top:2px;right:6px;width:36px;height:30px;border:0;background:none;color:#fff;font:700 14px/1 system-ui;cursor:pointer;border-radius:8px}.usa-stories-toggle:focus-visible{outline:2px solid #fff}@media (prefers-reduced-motion:reduce){usa-stories>*{transition:none!important;transform:none!important}}";

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
    }, { id: 'stories', text: css$6 });
}

var css$5 = "usa-modal,usa-sheet{display:contents}.usa-ov{border:0;padding:0;margin:auto;color:inherit;background:transparent;max-width:min(92vw,520px);max-height:88vh;overflow:visible}.usa-ov::backdrop{background:rgba(10,12,20,.45);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}.usa-ov-body{box-sizing:border-box;background:var(--usa-ov-bg,#fff);color:var(--usa-ov-fg,#111827);border-radius:var(--usa-ov-radius,18px);padding:var(--usa-ov-pad,22px);box-shadow:0 30px 80px -20px rgba(0,0,0,.45);max-height:88vh;overflow:auto}.usa-sheet-panel{margin:0;max-width:none;max-height:none}usa-sheet[data-side=\"right\"] .usa-sheet-panel{inset:0 0 0 auto;height:100%;width:min(88vw,var(--usa-sheet-size,380px))}usa-sheet[data-side=\"left\"] .usa-sheet-panel{inset:0 auto 0 0;height:100%;width:min(88vw,var(--usa-sheet-size,380px))}usa-sheet[data-side=\"bottom\"] .usa-sheet-panel{inset:auto 0 0 0;width:100%;max-height:85vh}usa-sheet[data-side=\"top\"] .usa-sheet-panel{inset:0 0 auto 0;width:100%;max-height:85vh}usa-sheet .usa-ov-body{height:100%;max-height:inherit;border-radius:0}usa-sheet[data-side=\"bottom\"] .usa-ov-body{border-radius:var(--usa-ov-radius,18px) var(--usa-ov-radius,18px) 0 0;height:auto;max-height:85vh;touch-action:none}usa-sheet[data-side=\"top\"] .usa-ov-body{border-radius:0 0 var(--usa-ov-radius,18px) var(--usa-ov-radius,18px);height:auto}.usa-ov-grab{width:44px;height:5px;border-radius:3px;background:rgba(127,127,127,.45);margin:-8px auto 14px;cursor:grab}@media (prefers-color-scheme:dark){.usa-ov-body{background:var(--usa-ov-bg,#171a23);color:var(--usa-ov-fg,#e5e7eb)}}";

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
    }, { id: 'overlay', text: css$5 });
}
const defineModal = (tag = 'usa-modal') => defineOverlay(tag, 'modal');
const defineSheet = (tag = 'usa-sheet') => defineOverlay(tag, 'sheet');

var css$4 = "usa-toast-stack{position:fixed;z-index:2147482000;width:min(360px,calc(100vw - 24px));pointer-events:none;--usa-tstack-bg:#111827;--usa-tstack-fg:#f9fafb}usa-toast-stack[contained]{position:absolute;width:min(360px,calc(100% - 24px))}usa-toast-stack[data-position^=\"bottom\"]{bottom:12px}usa-toast-stack[data-position^=\"top\"]{top:12px}usa-toast-stack[data-position$=\"right\"]{right:12px}usa-toast-stack[data-position$=\"left\"]{left:12px}usa-toast-stack[data-position$=\"center\"]{left:50%;transform:translateX(-50%)}.usa-tstack-list{position:relative;list-style:none;margin:0;padding:0;min-height:1px;transition:height .3s}.usa-tstack{position:absolute;left:0;right:0;display:flex;align-items:center;gap:10px;box-sizing:border-box;padding:12px 12px 12px 14px;border-radius:14px;background:var(--usa-tstack-bg);color:var(--usa-tstack-fg);box-shadow:0 12px 32px -10px rgba(0,0,0,.45);font:500 14px/1.35 system-ui,sans-serif;pointer-events:auto;touch-action:pan-y;transition:transform .38s cubic-bezier(.22,1,.36,1),opacity .3s;user-select:none}usa-toast-stack[data-position^=\"bottom\"] .usa-tstack{bottom:0;transform-origin:50% 100%}usa-toast-stack[data-position^=\"top\"] .usa-tstack{top:0;transform-origin:50% 0}.usa-tstack-icon{flex:none;display:grid;place-items:center;width:22px;height:22px;border-radius:50%;font-size:13px;font-weight:800;background:#3b82f6;color:#fff}.usa-tstack-success .usa-tstack-icon{background:#22c55e}.usa-tstack-warning .usa-tstack-icon{background:#f59e0b}.usa-tstack-error .usa-tstack-icon{background:#ef4444}.usa-tstack-text{flex:1;min-width:0;display:flex;flex-direction:column}.usa-tstack-text strong{font-weight:700}.usa-tstack-action{border:0;border-radius:8px;padding:6px 10px;background:rgba(255,255,255,.14);color:inherit;font:600 13px system-ui,sans-serif;cursor:pointer}.usa-tstack-close{border:0;background:none;color:inherit;opacity:.6;font-size:18px;line-height:1;cursor:pointer;padding:2px 4px}.usa-tstack-close:hover{opacity:1}@media (prefers-reduced-motion:reduce){.usa-tstack,.usa-tstack-list{transition:none}}";

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
    }, { id: 'toast', text: css$4 });
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

var css$3 = "usa-menu{position:relative;display:inline-block}.usa-menu-list{position:absolute;z-index:50;min-width:180px;max-width:min(280px,90vw);box-sizing:border-box;padding:6px;border-radius:12px;background:var(--usa-menu-bg,#fff);color:var(--usa-menu-fg,#111827);box-shadow:0 18px 44px -12px rgba(0,0,0,.35),0 0 0 1px rgba(127,127,127,.15);display:flex;flex-direction:column;gap:2px;text-align:left}.usa-menu-list[hidden]{display:none}usa-menu[data-placement^=\"bottom\"] .usa-menu-list{top:calc(100% + 6px)}usa-menu[data-placement^=\"top\"] .usa-menu-list{bottom:calc(100% + 6px)}usa-menu[data-placement$=\"start\"] .usa-menu-list{left:0;transform-origin:0 0}usa-menu[data-placement$=\"end\"] .usa-menu-list{right:0;transform-origin:100% 0}usa-menu[data-placement=\"top-start\"] .usa-menu-list{transform-origin:0 100%}usa-menu[data-placement=\"top-end\"] .usa-menu-list{transform-origin:100% 100%}.usa-menu-list>[role=\"menuitem\"]{display:flex;align-items:center;gap:8px;width:100%;box-sizing:border-box;border:0;background:none;color:inherit;font:500 14px/1.3 system-ui,sans-serif;text-align:left;text-decoration:none;padding:8px 10px;border-radius:8px;cursor:pointer}.usa-menu-list>[role=\"menuitem\"]:hover,.usa-menu-list>[role=\"menuitem\"]:focus-visible{background:var(--usa-menu-hover,rgba(124,92,255,.14));outline:none}.usa-menu-list>hr{border:0;border-top:1px solid rgba(127,127,127,.2);margin:4px 2px}@media (prefers-color-scheme:dark){.usa-menu-list{background:var(--usa-menu-bg,#1d2130);color:var(--usa-menu-fg,#e5e7eb)}}";

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
    }, { id: 'menu', text: css$3 });
}

var css$2 = "usa-progress-ring{position:relative;display:inline-grid;place-items:center;width:var(--usa-pr-size,120px);aspect-ratio:1;--usa-pr-color:#7c5cff;--usa-pr-track:rgba(127,127,127,.18);--usa-pr-width:9;font:700 calc(var(--usa-pr-size,120px)*.2)/1 system-ui,sans-serif;font-variant-numeric:tabular-nums}usa-progress-ring[data-variant=\"semi\"]{aspect-ratio:100/56;align-items:end}usa-progress-ring[data-variant=\"bar\"]{display:grid;width:var(--usa-pr-size,100%);aspect-ratio:auto;grid-template-columns:1fr auto;gap:10px;align-items:center;font-size:14px}.usa-pr-svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}.usa-pr-svg path{fill:none;stroke-width:var(--usa-pr-width);stroke-linecap:round}.usa-pr-svg .usa-pr-track{stroke:var(--usa-pr-track)}.usa-pr-svg .usa-pr-arc{stroke:var(--usa-pr-color)}usa-progress-ring[data-variant=\"semi\"] .usa-pr-label{padding-bottom:4%}.usa-pr-track:is(div){height:10px;border-radius:999px;background:var(--usa-pr-track);overflow:hidden}.usa-pr-fill{height:100%;border-radius:inherit;background:var(--usa-pr-color);transform-origin:0 50%;transform:scaleX(0)}usa-progress-ring[data-indeterminate] .usa-pr-svg{animation:usa-pr-spin 1.1s linear infinite}usa-progress-ring[data-indeterminate] .usa-pr-fill{width:35%;transform:none!important;animation:usa-pr-slide 1.3s ease-in-out infinite}@keyframes usa-pr-spin{to{transform:rotate(360deg)}}@keyframes usa-pr-slide{from{margin-left:-35%}to{margin-left:100%}}usa-odometer{display:inline-flex;align-items:flex-end;font-variant-numeric:tabular-nums;line-height:1.15}.usa-odo-row{display:inline-flex;align-items:flex-end}.usa-odo-col{display:inline-block;height:1.15em;overflow:hidden;-webkit-mask-image:linear-gradient(transparent,#000 18%,#000 82%,transparent);mask-image:linear-gradient(transparent,#000 18%,#000 82%,transparent)}.usa-odo-strip{display:block;white-space:pre;line-height:1.15em;text-align:center}.usa-odo-sym{display:inline-block;height:1.15em}@media (prefers-reduced-motion:reduce){usa-progress-ring[data-indeterminate] .usa-pr-svg,usa-progress-ring[data-indeterminate] .usa-pr-fill{animation-duration:4s}}";

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
    }, { id: 'meters', text: css$2 });
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
    }, { id: 'meters', text: css$2 });
}

var css$1 = "usa-skeleton-reveal{position:relative;display:block;--usa-sk-base:rgba(127,127,127,.16);--usa-sk-hi:rgba(255,255,255,.55)}usa-skeleton-reveal[data-loading]>:not(.usa-sk-layer){visibility:hidden}.usa-sk-layer{position:absolute;inset:0;pointer-events:none}.usa-sk-box{position:absolute;border-radius:6px;background:var(--usa-sk-base);overflow:hidden}usa-skeleton-reveal[data-variant=\"wave\"] .usa-sk-box{background:linear-gradient(100deg,var(--usa-sk-base) 30%,var(--usa-sk-hi) 50%,var(--usa-sk-base) 70%) var(--usa-sk-x,0) 0/var(--usa-sk-w,600px) 100% no-repeat,var(--usa-sk-base);animation:usa-sk-wave 1.4s linear infinite}usa-skeleton-reveal[data-variant=\"pulse\"] .usa-sk-box{animation:usa-sk-pulse 1.2s ease-in-out infinite alternate}usa-skeleton-reveal[data-variant=\"glow\"] .usa-sk-box{animation:usa-sk-glow 1.6s ease-in-out infinite alternate}@keyframes usa-sk-wave{from{background-position:calc(var(--usa-sk-x,0px) - var(--usa-sk-w,600px)) 0,0 0}to{background-position:calc(var(--usa-sk-x,0px) + var(--usa-sk-w,600px)) 0,0 0}}@keyframes usa-sk-pulse{from{opacity:1}to{opacity:.45}}@keyframes usa-sk-glow{from{box-shadow:0 0 0 rgba(124,92,255,0)}to{box-shadow:0 0 14px rgba(124,92,255,.45);background:rgba(124,92,255,.22)}}@media (prefers-color-scheme:dark){usa-skeleton-reveal{--usa-sk-hi:rgba(255,255,255,.16)}}@media (prefers-reduced-motion:reduce){.usa-sk-box{animation:none!important}}";

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
    }, { id: 'skeleton-reveal', text: css$1 });
}

var css = "usa-star-rating{display:inline-flex;gap:var(--usa-star-gap,4px);--usa-star-size:28px;--usa-star-on:#fbbf24;--usa-star-off:rgba(127,127,127,.28);cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent;border-radius:8px}usa-star-rating[readonly]{cursor:default}usa-star-rating:focus-visible{outline:2px solid var(--usa-star-on);outline-offset:4px}.usa-star{position:relative;display:inline-block;width:var(--usa-star-size);height:var(--usa-star-size);--usa-star-fill:0%}.usa-star svg{display:block;width:100%;height:100%;overflow:visible}.usa-star-bg{fill:var(--usa-star-off)}.usa-star-fg{position:absolute;left:0;top:0;bottom:0;width:var(--usa-star-fill);overflow:hidden;transition:width .18s ease-out}.usa-star-fg svg{width:var(--usa-star-size);height:var(--usa-star-size);fill:var(--usa-star-on);filter:drop-shadow(0 1px 3px rgba(251,191,36,.45))}usa-star-rating[data-preview] .usa-star-fg{opacity:.8}.usa-star-spark{position:absolute;left:50%;top:50%;width:6px;height:6px;border-radius:50%;background:var(--usa-star-on);pointer-events:none}@media (prefers-reduced-motion:reduce){.usa-star-fg{transition:none}}";

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
                    const s = part('span', 'usa-star', { 'aria-hidden': 'true' }, `<svg viewBox="0 0 24 24"><path class="usa-star-bg" d="${icon}"/></svg><span class="usa-star-fg"><svg viewBox="0 0 24 24"><path d="${icon}"/></svg></span>`);
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
    }, { id: 'star-rating', text: css });
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

export { CAROUSEL_EFFECTS, MENU_EFFECTS, MODAL_EFFECTS, PROGRESS_VARIANTS, SHEET_SIDES, SKELETON_VARIANTS, TAB_INDICATORS, TOAST_POSITIONS, WIDGETS, WIDGET_TAGS, defineCarousel, defineDisclosure, defineMenu, defineModal, defineOdometer, defineProgressRing, defineSheet, defineSkeletonReveal, defineStarRating, defineStories, defineTabBar, defineToastStack, defineWidgets, stackToast };
//# sourceMappingURL=widgets.js.map
