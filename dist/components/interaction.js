import { f as defineElement, D as EASE_OUT, n as now, r as raf, b as caf, d as clamp, E as EASE_SPRING, p as prefersReducedMotion } from '../chunks/base-SPDwWyB1.js';
import { c as createSpring } from '../chunks/spring-Bu3AwUgu.js';
export { M as MICRO_BEHAVIORS, a as MICRO_FEEDBACK, b as applyMicro, f as feedback, m as micro, c as microOf, d as microTransform, p as parseMicro, r as readFeel, e as readSpeed } from '../chunks/micro-DxpcOO8J.js';
import { c as createSpringGroup } from '../chunks/spring-solver-CQNBJPRE.js';

var css$4 = "usa-ripple{position:relative;display:inline-block;overflow:hidden;isolation:isolate;border-radius:inherit;-webkit-tap-highlight-color:transparent}usa-ripple[block]{display:block}usa-ripple .usa-ripple-wave{position:absolute;border-radius:50%;pointer-events:none;transform:scale(0);z-index:-1;will-change:transform,opacity}";

function defineRipple(tag = 'usa-ripple') {
    return defineElement(tag, (Base) => class UsaRipple extends Base {
        static get observedAttributes() {
            return ['disabled', 'centered', 'color', 'opacity', 'duration'];
        }
        mount() {
            this.listen(this, 'pointerdown', (e) => {
                if (e.button !== 0 && e.pointerType === 'mouse')
                    return;
                this.ripple(e.clientX, e.clientY);
            });
            this.listen(this, 'keydown', (e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !e.repeat)
                    this.ripple();
            });
        }
        ripple(x, y) {
            if (this.flag('disabled'))
                return;
            const r = this.getBoundingClientRect();
            const centered = this.flag('centered') || x === undefined || y === undefined;
            const cx = centered ? r.width / 2 : x - r.left;
            const cy = centered ? r.height / 2 : y - r.top;
            const radius = Math.hypot(Math.max(cx, r.width - cx), Math.max(cy, r.height - cy));
            const wave = document.createElement('span');
            wave.className = 'usa-ripple-wave';
            wave.setAttribute('aria-hidden', 'true');
            const size = radius * 2;
            wave.style.cssText = `width:${size}px;height:${size}px;left:${cx - radius}px;top:${cy - radius}px;background:${this.str('color', 'currentColor')}`;
            this.append(wave);
            const opacity = this.num('opacity', 0.22);
            const duration = this.num('duration', 550);
            const frames = this.reduced
                ? [{ opacity }, { opacity: 0 }]
                : [
                    { transform: 'scale(0)', opacity },
                    { transform: 'scale(1)', opacity, offset: 0.7 },
                    { transform: 'scale(1)', opacity: 0 },
                ];
            const a = this.motion(wave, frames, { duration: this.reduced ? 300 : duration, easing: EASE_OUT, fill: 'forwards' });
            if (a)
                a.onfinish = () => wave.remove();
            else
                setTimeout(() => wave.remove(), 0);
        }
    }, { id: 'ripple', text: css$4 });
}

var css$3 = "usa-magnetic{display:inline-block}usa-magnetic>*{transform:translate3d(var(--usa-mx,0px),var(--usa-my,0px),0);transition:transform 0.6s cubic-bezier(0.34,1.56,0.64,1)}usa-magnetic[data-active]>*{transition-duration:0.15s;transition-timing-function:ease-out}@media (prefers-reduced-motion:reduce){usa-magnetic>*,usa-tilt,usa-toggle .usa-toggle-knob{transition:none}}usa-magnetic[data-releasing]>*{transition:none}";

function defineMagnetic(tag = 'usa-magnetic') {
    return defineElement(tag, (Base) => class UsaMagnetic extends Base {
        constructor() {
            super(...arguments);
            this._frame = 0;
            this._off = { x: 0, y: 0 };
            this._vel = { x: 0, y: 0 };
        }
        static get observedAttributes() {
            return ['strength', 'radius', 'disabled', 'release'];
        }
        mount() {
            if (this.reduced || this.flag('disabled'))
                return;
            if (typeof matchMedia === 'function' && !matchMedia('(hover: hover) and (pointer: fine)').matches)
                return;
            const strength = this.num('strength', 0.35);
            const radius = this.num('radius', 60);
            let x = 0;
            let y = 0;
            let at = 0;
            let active = false;
            const apply = () => {
                this._frame = 0;
                const r = this.getBoundingClientRect();
                const dx = x - (r.left + r.width / 2);
                const dy = y - (r.top + r.height / 2);
                const near = Math.abs(dx) < r.width / 2 + radius && Math.abs(dy) < r.height / 2 + radius;
                if (near) {
                    active = true;
                    if (this._springs)
                        this.settle();
                    this.setAttribute('data-active', '');
                    this._off = { x: dx * strength, y: dy * strength };
                    this.style.setProperty('--usa-mx', `${(dx * strength).toFixed(2)}px`);
                    this.style.setProperty('--usa-my', `${(dy * strength).toFixed(2)}px`);
                }
                else if (active) {
                    active = false;
                    this.release(this.str('release') === 'spring');
                }
            };
            this.listen(document, 'pointermove', (e) => {
                if (e.pointerType !== 'mouse' && e.pointerType !== 'pen')
                    return;
                const t = now(), dt = Math.max(8, t - at) / 1000;
                if (at)
                    this._vel = { x: (e.clientX - x) / dt, y: (e.clientY - y) / dt };
                at = t;
                x = e.clientX;
                y = e.clientY;
                if (!this._frame)
                    this._frame = raf(apply);
            }, { passive: true });
            this.listen(document, 'pointerleave', () => this.release());
            this.listen(window, 'blur', () => this.release());
        }
        release(spring = false) {
            caf(this._frame);
            this._frame = 0;
            this.removeAttribute('data-active');
            const { x, y } = this._off;
            this._off = { x: 0, y: 0 };
            if (spring && !this.reduced && (x || y)) {
                // the pointer's exit speed, scaled like the offset and capped so a flick cannot throw the content away
                const cap = 1600, k = this.num('strength', 0.35);
                const vx = Math.max(-cap, Math.min(cap, this._vel.x * k)), vy = Math.max(-cap, Math.min(cap, this._vel.y * k));
                this.settle();
                this.setAttribute('data-releasing', '');
                const write = () => {
                    const [sx, sy] = this._springs;
                    this.style.setProperty('--usa-mx', `${sx.value.toFixed(2)}px`);
                    this.style.setProperty('--usa-my', `${sy.value.toFixed(2)}px`);
                };
                const rest = () => { if (this._springs && !this._springs[0].animating && !this._springs[1].animating)
                    this.settle(); };
                const cfg = { stiffness: 240, damping: 13, mass: 1 };
                this._springs = [
                    createSpring({ value: x, spring: cfg, onUpdate: write, onRest: rest }),
                    createSpring({ value: y, spring: cfg, onUpdate: write, onRest: rest }),
                ];
                this._springs[0].set(0, vx);
                this._springs[1].set(0, vy);
                return;
            }
            this.settle();
        }
        /** Stop a spring release and clear the offset. */
        settle() {
            if (this._springs) {
                this._springs.forEach((s) => s.stop());
                this._springs = undefined;
            }
            this.removeAttribute('data-releasing');
            this.style.removeProperty('--usa-mx');
            this.style.removeProperty('--usa-my');
        }
        unmount() {
            this.release();
        }
    }, { id: 'magnetic', text: css$3 });
}

var css$2 = "usa-tilt{display:block;position:relative;transform-style:preserve-3d;transition:transform 0.5s cubic-bezier(0.22,1,0.36,1);will-change:transform}usa-tilt[data-active]{transition-duration:0.12s}usa-tilt .usa-tilt-glare{position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;transition:opacity 0.3s ease;background:radial-gradient(circle at var(--usa-glare-x,50%) var(--usa-glare-y,50%),rgb(255 255 255 / 0.35),transparent 55%);mix-blend-mode:soft-light}usa-tilt[data-active] .usa-tilt-glare{opacity:1}";

function defineTilt(tag = 'usa-tilt') {
    return defineElement(tag, (Base) => class UsaTilt extends Base {
        constructor() {
            super(...arguments);
            this._frame = 0;
            this._glare = null;
        }
        static get observedAttributes() {
            return ['max', 'scale', 'perspective', 'glare', 'reverse', 'disabled'];
        }
        mount() {
            if (this.flag('glare') && !this._glare) {
                this._glare = document.createElement('span');
                this._glare.className = 'usa-tilt-glare';
                this._glare.setAttribute('aria-hidden', 'true');
                this.append(this._glare);
            }
            else if (!this.flag('glare') && this._glare) {
                this._glare.remove();
                this._glare = null;
            }
            if (this.reduced || this.flag('disabled'))
                return;
            const max = this.num('max', 10) * (this.flag('reverse') ? -1 : 1);
            const scale = this.num('scale', 1.03);
            const persp = this.num('perspective', 900);
            let px = 0.5;
            let py = 0.5;
            let rect = null;
            const apply = () => {
                this._frame = 0;
                const nx = clamp(px * 2 - 1, -1, 1);
                const ny = clamp(py * 2 - 1, -1, 1);
                this.style.transform = `perspective(${persp}px) rotateX(${(-ny * max).toFixed(2)}deg) rotateY(${(nx * max).toFixed(2)}deg) scale(${scale})`;
                this.style.setProperty('--usa-tilt-x', nx.toFixed(3));
                this.style.setProperty('--usa-tilt-y', ny.toFixed(3));
                this.style.setProperty('--usa-glare-x', `${(px * 100).toFixed(1)}%`);
                this.style.setProperty('--usa-glare-y', `${(py * 100).toFixed(1)}%`);
            };
            this.listen(this, 'pointerenter', (e) => {
                if (e.pointerType === 'touch')
                    return;
                rect = this.getBoundingClientRect();
                this.setAttribute('data-active', '');
            });
            this.listen(this, 'pointermove', (e) => {
                if (e.pointerType === 'touch')
                    return;
                rect = rect || this.getBoundingClientRect();
                px = (e.clientX - rect.left) / (rect.width || 1);
                py = (e.clientY - rect.top) / (rect.height || 1);
                if (!this._frame)
                    this._frame = raf(apply);
            });
            this.listen(this, 'pointerleave', () => this.reset());
        }
        reset() {
            caf(this._frame);
            this._frame = 0;
            this.removeAttribute('data-active');
            this.style.transform = '';
            this.style.setProperty('--usa-tilt-x', '0');
            this.style.setProperty('--usa-tilt-y', '0');
        }
        unmount() {
            this.reset();
        }
    }, { id: 'tilt', text: css$2 });
}

var css$1 = "usa-spotlight{display:block;--usa-spot-size:160px;--usa-spot-color:rgb(255 255 255 / 0.55);--usa-spot-border:1px}usa-spotlight .usa-spotlight-item{position:relative;isolation:isolate}usa-spotlight .usa-spotlight-item::before,usa-spotlight .usa-spotlight-item::after{content:\"\";position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;transition:opacity 0.25s ease}usa-spotlight .usa-spotlight-item::before{padding:var(--usa-spot-border);background:radial-gradient(var(--usa-spot-size) circle at var(--usa-spot-x,-999px) var(--usa-spot-y,-999px),var(--usa-spot-color),transparent 70%);-webkit-mask:linear-gradient(#000 0 0) content-box exclude,linear-gradient(#000 0 0);mask:linear-gradient(#000 0 0) content-box exclude,linear-gradient(#000 0 0)}usa-spotlight .usa-spotlight-item::after{z-index:-1;background:radial-gradient(calc(var(--usa-spot-size) * 0.9) circle at var(--usa-spot-x,-999px) var(--usa-spot-y,-999px),color-mix(in srgb,var(--usa-spot-color) 30%,transparent),transparent 70%)}usa-spotlight[data-lit] .usa-spotlight-item::before{opacity:1}usa-spotlight[data-lit] .usa-spotlight-item:hover::after{opacity:1}usa-spotlight[no-fill] .usa-spotlight-item::after{display:none}";

function defineSpotlight(tag = 'usa-spotlight') {
    return defineElement(tag, (Base) => class UsaSpotlight extends Base {
        constructor() {
            super(...arguments);
            this._frame = 0;
        }
        static get observedAttributes() {
            return ['size', 'color', 'border'];
        }
        items() {
            const marked = Array.from(this.querySelectorAll('[data-spotlight]'));
            const items = marked.length ? marked : Array.from(this.children);
            items.forEach((el) => el.classList.add('usa-spotlight-item'));
            return items;
        }
        mount() {
            const size = this.getAttribute('size');
            if (size)
                this.style.setProperty('--usa-spot-size', `${Number(size)}px`);
            const color = this.getAttribute('color');
            if (color)
                this.style.setProperty('--usa-spot-color', color);
            const border = this.getAttribute('border');
            if (border)
                this.style.setProperty('--usa-spot-border', `${Number(border)}px`);
            let items = this.items();
            let x = 0;
            let y = 0;
            const apply = () => {
                this._frame = 0;
                // All reads, then all writes
                const rects = items.map((el) => el.getBoundingClientRect());
                rects.forEach((r, i) => {
                    items[i].style.setProperty('--usa-spot-x', `${(x - r.left).toFixed(1)}px`);
                    items[i].style.setProperty('--usa-spot-y', `${(y - r.top).toFixed(1)}px`);
                });
            };
            this.listen(this, 'pointerenter', (e) => {
                if (e.pointerType === 'touch')
                    return;
                items = this.items();
                this.setAttribute('data-lit', '');
            });
            this.listen(this, 'pointermove', (e) => {
                if (e.pointerType === 'touch')
                    return;
                x = e.clientX;
                y = e.clientY;
                if (!this.hasAttribute('data-lit'))
                    this.setAttribute('data-lit', '');
                // contract-exempt: reduced-motion — pointer-follow light, not a motion effect (documented to stay on under reduced motion)
                if (!this._frame)
                    this._frame = raf(apply);
            });
            this.listen(this, 'pointerleave', () => this.removeAttribute('data-lit'));
        }
        unmount() {
            caf(this._frame);
            this._frame = 0;
            this.removeAttribute('data-lit');
        }
    }, { id: 'spotlight', text: css$1 });
}

var css = "usa-press{display:inline-block;touch-action:manipulation;-webkit-tap-highlight-color:transparent}usa-press[block]{display:block}";

function definePress(tag = 'usa-press') {
    return defineElement(tag, (Base) => class UsaPress extends Base {
        constructor() {
            super(...arguments);
            this._anim = null;
        }
        static get observedAttributes() {
            return ['disabled', 'scale', 'bounce'];
        }
        get pressed() {
            return this.hasAttribute('data-pressed');
        }
        frame(down) {
            if (this.reduced)
                return { opacity: down ? 0.7 : 1 };
            return { transform: down ? `scale(${this.num('scale', 0.95)})` : 'scale(1)' };
        }
        down() {
            if (this.pressed || this.flag('disabled'))
                return;
            this.setAttribute('data-pressed', '');
            const from = this.currentFrame();
            this._anim?.cancel();
            this._anim = this.motion(this, [from, this.frame(true)], { duration: 120, easing: 'cubic-bezier(0.3, 0, 0.7, 1)', fill: 'forwards' });
        }
        up() {
            if (!this.pressed)
                return;
            this.removeAttribute('data-pressed');
            const from = this.currentFrame();
            this._anim?.cancel();
            const bounce = this.flag('bounce');
            const frames = bounce && !this.reduced
                ? [from, { transform: 'scale(1.06)', offset: 0.45 }, { transform: 'scale(0.99)', offset: 0.75 }, this.frame(false)]
                : [from, this.frame(false)];
            const a = this.motion(this, frames, { duration: bounce ? 480 : 320, easing: EASE_SPRING });
            this._anim = a;
            if (a)
                a.onfinish = () => this._anim === a && (this._anim = null);
        }
        currentFrame() {
            if (typeof getComputedStyle !== 'function')
                return this.frame(false);
            const cs = getComputedStyle(this);
            return this.reduced ? { opacity: cs.opacity || '1' } : { transform: cs.transform && cs.transform !== 'none' ? cs.transform : 'scale(1)' };
        }
        mount() {
            this.listen(this, 'pointerdown', (e) => {
                if (e.pointerType === 'mouse' && e.button !== 0)
                    return;
                this.down();
            });
            for (const t of ['pointerup', 'pointerleave', 'pointercancel', 'focusout'])
                this.listen(this, t, () => this.up());
            this.listen(this, 'keydown', (e) => (e.key === ' ' || e.key === 'Enter') && !e.repeat && this.down());
            this.listen(this, 'keyup', (e) => (e.key === ' ' || e.key === 'Enter') && this.up());
        }
        unmount() {
            this._anim?.cancel();
            this._anim = null;
            this.removeAttribute('data-pressed');
        }
    }, { id: 'press', text: css });
}

/** Height progress → each child's [opacity, offset factor], child `i` of `n`, starting `stagger` later per child. */
function expandContentAt(p, i, n, stagger = 0.08) {
    const s = Math.min(0.5, Math.max(0, stagger)) * Math.min(i, Math.max(0, n - 1));
    const q = Math.min(1, Math.max(0, (p - s) / Math.max(0.05, 1 - s)));
    const opacity = Math.round(Math.min(1, Math.max(0, q * 1.6 - 0.4)) * 100) / 100;
    return [opacity, Math.round((1 - q) * 1000) / 1000];
}
const OPEN_SPRING = { duration: 520, bounce: 0.16 };
const CLOSE_SPRING = { duration: 360, bounce: 0 };
/** Longest a motion may run: on a frame-starved page the spring may crawl, but the box still reaches its end state. */
const SETTLE_LIMIT = 2000;
const states = /*#__PURE__*/ new WeakMap();
const isDetails = (el) => el.localName === 'details';
const summaryOf = (el) => (isDetails(el) ? el.querySelector(':scope > summary') : null);
const contentOf = (el) => [...el.children].filter((c) => c.localName !== 'summary');
const num = (v) => parseFloat(v) || 0;
/** Whether `el` is shown: `open` for `<details>`, not `hidden` otherwise. */
function isExpanded(el) {
    const st = states.get(el);
    if (st)
        return st.open;
    return isDetails(el) ? el.open : !el.hidden;
}
/** The border-box height of the closed box: 0 for a plain box, the summary line for `<details>`. */
function closedHeight(el) {
    const sum = summaryOf(el);
    if (!sum)
        return 0;
    const cs = getComputedStyle(el);
    const top = el.getBoundingClientRect().top;
    const r = sum.getBoundingClientRect();
    return Math.max(0, r.bottom - top + num(getComputedStyle(sum).marginBottom) + num(cs.paddingBottom) + num(cs.borderBottomWidth));
}
/** The border-box height of the open box right now (content may still be painting in). */
function fullHeight(el) {
    const cs = getComputedStyle(el);
    return el.scrollHeight + num(cs.borderTopWidth) + num(cs.borderBottomWidth);
}
function clear(el) {
    for (const k of ['height', 'overflow', 'box-sizing', '--mo-expand'])
        el.style.removeProperty(k);
    for (const c of contentOf(el)) {
        c.style.removeProperty('opacity');
        c.style.removeProperty('translate');
    }
    el.removeAttribute('data-mo-expanding');
}
function finish(el, st) {
    if (!st.open) {
        if (isDetails(el))
            el.open = false;
        else
            el.hidden = true;
    }
    clear(el);
    // at rest the box's own CSS decides (e.g. `details[open] { --mo-expand-turn: 1 }`)
    el.style.removeProperty('--mo-expand-turn');
    states.delete(el);
    st.ro?.disconnect();
    clearTimeout(st.guard);
    st.group.stop();
    const done = st.settle.splice(0);
    for (const fn of done)
        fn(st.open);
}
/**
 * Open or close `el` (a `<details>` or any box toggled with `hidden`) on a damped spring. `open` defaults to the
 * opposite of its current state. Resolves with the final state once it rests, or with the new state at once when
 * motion is reduced. A call during the motion retargets it and keeps its velocity.
 */
function springExpand(el, open, opts = {}) {
    const want = open ?? !isExpanded(el);
    const running = states.get(el);
    if (typeof window === 'undefined' || prefersReducedMotion() || typeof getComputedStyle !== 'function') {
        if (running)
            finish(el, { ...running, open: want });
        if (isDetails(el))
            el.open = want;
        else
            el.hidden = !want;
        el.style.removeProperty('--mo-expand-turn');
        return Promise.resolve(want);
    }
    if (!running && want === isExpanded(el))
        return Promise.resolve(want);
    let st = running;
    if (!st) {
        const wasOpen = isExpanded(el);
        // measure the closed height before anything changes
        const closed = wasOpen ? -1 : isDetails(el) ? el.getBoundingClientRect().height : 0;
        if (isDetails(el))
            el.open = true;
        else
            el.hidden = false;
        el.setAttribute('data-mo-expanding', '');
        el.style.boxSizing = 'border-box';
        el.style.overflow = 'hidden';
        const start = wasOpen ? 1 : 0;
        const drift = Number.isFinite(opts.drift) ? Math.max(0, opts.drift) : 10;
        const stagger = opts.stagger ?? 0.08;
        // The open height is measured when the motion starts and again only when the content resizes
        // (code drawers and lazy panels paint after `open` flips): reading it every frame forced a layout
        // of the whole page per frame, which stalls long pages (a gallery grid of hundreds of cards).
        const measure = () => {
            const was = el.style.height;
            el.style.height = 'auto';
            const h = fullHeight(el);
            el.style.height = was;
            return h;
        };
        let full = measure();
        let last = { p: start, turn: start };
        const paint = (v) => {
            last = v;
            const p = v.p;
            const to = Math.max(full, s.closed);
            el.style.height = `${Math.round((s.closed + Math.max(0, p) * (to - s.closed)) * 10) / 10}px`;
            el.style.setProperty('--mo-expand', String(Math.round(Math.min(1, Math.max(0, p)) * 1000) / 1000));
            el.style.setProperty('--mo-expand-turn', String(Math.round(v.turn * 1000) / 1000));
            const kids = contentOf(el);
            kids.forEach((c, i) => {
                const [o, f] = expandContentAt(p, i, kids.length, stagger);
                c.style.opacity = String(o);
                c.style.translate = drift ? `0 ${Math.round(-f * drift * 10) / 10}px` : '';
            });
        };
        const s = {
            open: want,
            closed: closed < 0 ? closedHeight(el) : closed,
            settle: [],
            opts,
            group: createSpringGroup({ p: start, turn: start }, {
                feel: opts.feel,
                owner: el,
                onUpdate: (v) => paint(v),
                onRest: () => {
                    if (states.get(el) === s)
                        finish(el, s);
                },
            }),
        };
        if (typeof ResizeObserver === 'function') {
            s.ro = new ResizeObserver(() => {
                if (states.get(el) !== s)
                    return;
                full = measure();
                paint(last);
            });
            for (const c of contentOf(el))
                s.ro.observe(c);
        }
        states.set(el, s);
        st = s;
    }
    st.open = want;
    const spring = want ? opts.spring ?? st.opts.spring ?? OPEN_SPRING : opts.closeSpring ?? st.opts.closeSpring ?? CLOSE_SPRING;
    st.group.set({ p: want ? 1 : 0 }, { spring });
    st.group.set({ turn: want ? 1 : 0 }, { spring: want ? 'bouncy' : 'snappy' });
    const s = st;
    clearTimeout(s.guard);
    s.guard = setTimeout(() => {
        if (states.get(el) === s)
            finish(el, s);
    }, SETTLE_LIMIT);
    return new Promise((resolve) => s.settle.push(resolve));
}
/**
 * Give a native `<details>` the damped open / close: its summary's click (mouse, Enter, Space) runs
 * `springExpand()` instead of the instant toggle. Returns a function that removes it.
 */
function springDetails(details, opts = {}) {
    const sum = summaryOf(details);
    if (!sum)
        return () => undefined;
    const onClick = (e) => {
        if (e.defaultPrevented || prefersReducedMotion())
            return;
        e.preventDefault();
        void springExpand(details, undefined, opts);
    };
    sum.addEventListener('click', onClick);
    return () => sum.removeEventListener('click', onClick);
}
/** Whether a summary click inside `root` belongs to a `<details>` that a custom element (a component) owns. */
const ownedByComponent = (el) => {
    for (let n = el; n; n = n.parentElement)
        if (n.localName.includes('-'))
            return true;
    return typeof ShadowRoot !== 'undefined' && el.getRootNode() instanceof ShadowRoot;
};
/**
 * Every `<details>` under `root` (now and added later) opens and closes on a damped spring, except those inside
 * a component, inside `[data-mo-expand="off"]`, or whose summary click is already handled. One listener, on `root`.
 */
function springAllDetails(root = document, opts = {}) {
    if (typeof document === 'undefined')
        return () => undefined;
    const onClick = (e) => {
        const t = e.target;
        const sum = t?.closest?.('summary');
        const d = sum?.parentElement;
        if (!sum || !d || d.localName !== 'details' || d.querySelector(':scope > summary') !== sum)
            return;
        if (e.defaultPrevented || prefersReducedMotion() || d.closest('[data-mo-expand="off"]') || ownedByComponent(d))
            return;
        // links and controls placed inside a summary keep their own click
        if (t !== sum && t?.closest?.('a[href], button, input, select, textarea, label') && sum.contains(t.closest('a[href], button, input, select, textarea, label')))
            return;
        e.preventDefault();
        void springExpand(d, undefined, opts);
    };
    root.addEventListener('click', onClick);
    return () => root.removeEventListener('click', onClick);
}

/**
 * motionary/components/interaction — micro-interactions.
 * `<usa-ripple>`, `<usa-magnetic>`, `<usa-tilt>`, `<usa-spotlight>`,
 * `<usa-press>`.
 * 17.16: the micro-interaction engine — `micro(el, 'press hover glow …')`, `applyMicro()` for `data-mo-micro`
 * markup and `feedback(el, 'shake' | 'pop' | …)` spring impulses.
 * 17.18: `springExpand()` / `springDetails()` / `springAllDetails()` — damped expand and collapse for boxes and
 * native `<details>`.
 */
/** Register every component of this category under its default tag. */
function defineInteractionComponents() {
    defineRipple();
    defineMagnetic();
    defineTilt();
    defineSpotlight();
    definePress();
}

export { defineInteractionComponents, defineMagnetic, definePress, defineRipple, defineSpotlight, defineTilt, expandContentAt, isExpanded, springAllDetails, springDetails, springExpand };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/components/interaction.js.map