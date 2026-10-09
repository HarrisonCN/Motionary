'use strict';

var base = require('../chunks/base-DBheNxJu.cjs');
var spring = require('../chunks/spring-BlTQD2AV.cjs');
var variants = require('../chunks/variants-CrDDJoYK.cjs');

/** Position a fixed `floating` element next to `anchor`, flipping when it would leave the viewport. */
function place(floating, anchor, placement = 'top', gap = 8) {
    const a = anchor.getBoundingClientRect();
    const f = floating.getBoundingClientRect();
    const W = window.innerWidth || 1024;
    const H = window.innerHeight || 768;
    const fits = {
        top: a.top - f.height - gap >= 0,
        bottom: a.bottom + f.height + gap <= H,
        left: a.left - f.width - gap >= 0,
        right: a.right + f.width + gap <= W,
    };
    const opposite = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
    const p = fits[placement] || !fits[opposite[placement]] ? placement : opposite[placement];
    let x = 0;
    let y = 0;
    if (p === 'top' || p === 'bottom') {
        x = Math.min(Math.max(4, a.left + a.width / 2 - f.width / 2), W - f.width - 4);
        y = p === 'top' ? a.top - f.height - gap : a.bottom + gap;
    }
    else {
        y = Math.min(Math.max(4, a.top + a.height / 2 - f.height / 2), H - f.height - 4);
        x = p === 'left' ? a.left - f.width - gap : a.right + gap;
    }
    floating.style.left = `${Math.round(x)}px`;
    floating.style.top = `${Math.round(y)}px`;
    floating.setAttribute('data-placement', p);
    return p;
}
let uid = 0;
const nextId = (prefix) => `${prefix}-${++uid}`;

var css$8 = "usa-tabs{display:block;font-family:var(--usa-font)}usa-tabs .usa-tabs-list{position:relative;display:flex;gap:4px;border-bottom:1px solid color-mix(in srgb,currentColor 14%,transparent)}usa-tabs [role=\"tab\"]{position:relative;z-index:1;padding:10px 14px;border:0;background:none;color:inherit;font:inherit;cursor:pointer;opacity:0.7;transition:opacity 0.2s ease,color 0.2s ease;border-radius:calc(var(--usa-radius,14px) / 2)}usa-tabs [role=\"tab\"][aria-selected=\"true\"]{opacity:1;color:var(--usa-accent,#7c5cff)}usa-tabs [role=\"tab\"]:focus-visible{outline:2px solid var(--usa-accent,#7c5cff);outline-offset:-2px}usa-tabs .usa-tabs-indicator{position:absolute;left:0;bottom:-1px;height:3px;width:0;border-radius:3px;background:var(--usa-accent,#7c5cff);pointer-events:none}usa-tabs[indicator=\"pill\"] .usa-tabs-list{border-bottom:0;padding:4px;border-radius:999px;background:color-mix(in srgb,currentColor 8%,transparent)}usa-tabs[indicator=\"pill\"] .usa-tabs-indicator{top:4px;bottom:4px;height:auto;border-radius:999px;opacity:0.18}usa-tabs [role=\"tabpanel\"]{padding:14px 2px}usa-tabs [role=\"tabpanel\"]:focus-visible{outline:2px solid var(--usa-accent,#7c5cff);outline-offset:2px;border-radius:6px}";

function defineTabs(tag = 'usa-tabs') {
    variants.adoptVariants();
    return base.defineElement(tag, (Base) => class UsaTabs extends Base {
        constructor() {
            super(...arguments);
            this._i = 0;
            this._bar = null;
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
        tabs() {
            return Array.from(this.querySelectorAll('[data-tab]')).filter((t) => t.closest(this.localName) === this);
        }
        panels() {
            return Array.from(this.querySelectorAll('[data-panel]')).filter((t) => t.closest(this.localName) === this);
        }
        mount() {
            const tabs = this.tabs();
            const panels = this.panels();
            const list = tabs[0]?.parentElement;
            if (!list)
                return;
            list.setAttribute('role', 'tablist');
            list.classList.add('usa-tabs-list');
            if (!list.querySelector(':scope > .usa-tabs-indicator')) {
                this._bar = document.createElement('span');
                this._bar.className = 'usa-tabs-indicator';
                this._bar.setAttribute('aria-hidden', 'true');
                list.append(this._bar);
            }
            else
                this._bar = list.querySelector(':scope > .usa-tabs-indicator');
            tabs.forEach((t, i) => {
                t.id || (t.id = nextId('usa-tab'));
                t.setAttribute('role', 'tab');
                const p = panels[i];
                if (p) {
                    p.id || (p.id = nextId('usa-panel'));
                    p.setAttribute('role', 'tabpanel');
                    p.setAttribute('aria-labelledby', t.id);
                    t.setAttribute('aria-controls', p.id);
                    if (!p.hasAttribute('tabindex'))
                        p.tabIndex = 0;
                }
                this.listen(t, 'click', () => this.select(i));
            });
            this.listen(list, 'keydown', (e) => {
                const n = tabs.length;
                const map = { ArrowRight: this._i + 1, ArrowDown: this._i + 1, ArrowLeft: this._i - 1, ArrowUp: this._i - 1, Home: 0, End: n - 1 };
                if (!(e.key in map))
                    return;
                e.preventDefault();
                this.select((map[e.key] + n) % n, true);
            });
            const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => this.moveBar(false)) : null;
            ro?.observe(list);
            this.onCleanup(() => ro?.disconnect());
            this.select(Math.max(0, Math.min(tabs.length - 1, this.num('selected', 0))), false, true);
        }
        moveBar(animate) {
            const t = this.tabs()[this._i];
            const bar = this._bar;
            if (!t || !bar)
                return;
            const from = bar.style.transform;
            const fromW = bar.style.width;
            bar.style.width = `${t.offsetWidth}px`;
            bar.style.transform = `translateX(${t.offsetLeft}px)`;
            if (animate && from && !this.reduced)
                this.motion(bar, [{ transform: from, width: fromW }, { transform: bar.style.transform, width: bar.style.width }], spring.springEasing('stiff'));
        }
        select(i, focus = false, initial = false) {
            const tabs = this.tabs();
            const panels = this.panels();
            if (!tabs[i])
                return;
            const prev = this._i;
            this._i = i;
            this.setAttribute('selected', String(i));
            tabs.forEach((t, j) => {
                t.setAttribute('aria-selected', String(j === i));
                t.tabIndex = j === i ? 0 : -1;
            });
            panels.forEach((p, j) => (p.hidden = j !== i));
            if (focus)
                tabs[i].focus();
            this.moveBar(!initial);
            if (initial || prev === i)
                return;
            const p = panels[i];
            if (p && !this.reduced)
                this.motion(p, [{ opacity: 0, transform: `translateX(${i > prev ? 16 : -16}px)` }, { opacity: 1, transform: 'none' }], { duration: 280, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
            this.emit('change', { index: i });
        }
    }, { id: 'tabs', text: css$8 });
}

var css$7 = "usa-drawer,usa-bottom-sheet{position:fixed;z-index:1001;box-sizing:border-box;overflow:auto;overscroll-behavior:contain;touch-action:pan-y;will-change:transform;outline:none}usa-drawer{top:0;bottom:0;left:0;width:min(86vw,360px);border-radius:0 var(--usa-radius,14px) var(--usa-radius,14px) 0;padding:20px}usa-drawer[side=\"right\"]{left:auto;right:0;border-radius:var(--usa-radius,14px) 0 0 var(--usa-radius,14px)}usa-drawer[side=\"top\"],usa-drawer[side=\"bottom\"]{left:0;right:0;width:auto;bottom:auto;max-height:80vh;border-radius:0 0 var(--usa-radius,14px) var(--usa-radius,14px);touch-action:pan-x}usa-drawer[side=\"bottom\"]{top:auto;bottom:0;border-radius:var(--usa-radius,14px) var(--usa-radius,14px) 0 0}usa-bottom-sheet{left:0;right:0;bottom:0;margin:0 auto;max-width:640px;border-radius:22px 22px 0 0;padding:8px 20px 24px;touch-action:none}usa-bottom-sheet .usa-sheet-handle{width:40px;height:5px;border-radius:3px;margin:4px auto 14px;background:color-mix(in srgb,currentColor 35%,transparent);cursor:grab}usa-drawer[hidden],usa-bottom-sheet[hidden]{display:none}.usa-panel-backdrop{position:fixed;inset:0;z-index:1000;background:rgb(0 0 0 / 0.45)}";

/** Shared machinery of `<usa-drawer>` and `<usa-bottom-sheet>`: backdrop, focus, Esc, drag-to-dismiss. */
function makePanel(Base, kind) {
    return class UsaPanel extends Base {
        constructor() {
            super(...arguments);
            this._backdrop = null;
            this._return = null;
            this._drag = null;
        }
        static get observedAttributes() {
            return ['open', 'side'];
        }
        get open() {
            return this.flag('open');
        }
        set open(v) {
            this.setFlag('open', v);
        }
        /** Main axis size of the panel (px). */
        size() {
            const r = this.getBoundingClientRect();
            return (kind === 'sheet' || this.vertical() ? r.height : r.width) || (kind === 'sheet' ? window.innerHeight * 0.9 : 320);
        }
        vertical() {
            return kind === 'sheet' || this.str('side') === 'top' || this.str('side') === 'bottom';
        }
        /** +1 when hiding moves the panel in the positive axis direction. */
        dir() {
            const side = kind === 'sheet' ? 'bottom' : this.str('side', 'left');
            return side === 'left' || side === 'top' ? -1 : 1;
        }
        /** Offsets (px from fully open) the panel may rest at; the largest closes it. */
        stops() {
            return [0];
        }
        render(v) {
            const axis = this.vertical() ? 'Y' : 'X';
            this.style.transform = `translate${axis}(${(v * this.dir()).toFixed(1)}px)`;
            if (this._backdrop)
                this._backdrop.style.opacity = String(base.clamp(1 - v / (this.size() || 1), 0, 1));
        }
        mount() {
            this.setAttribute('role', 'dialog');
            if (this.str('label'))
                this.setAttribute('aria-label', this.str('label'));
            if (!this.hasAttribute('tabindex'))
                this.tabIndex = -1;
            this.classList.add('usa-surface');
            this._pos = spring.createSpring({ value: this.size() * 2, spring: 'stiff', onUpdate: (v) => this.render(v), onRest: (v) => v >= this.size() - 1 && !this.open && this.afterClose() });
            if (this.open)
                this.show(false);
            else {
                this.hidden = true;
                this._pos.jump(this.size() * 1.2);
            }
            this.listen(document, 'keydown', (e) => e.key === 'Escape' && this.open && this.close());
            this.listen(this, 'click', (e) => e.target.closest?.('[data-close]') && this.close());
            this.listen(this, 'pointerdown', (e) => this.dragStart(e));
            this.listen(this, 'pointermove', (e) => this.dragMove(e));
            this.listen(this, 'pointerup', (e) => this.dragEnd(e));
            this.listen(this, 'pointercancel', (e) => this.dragEnd(e));
        }
        unmount() {
            this._pos?.stop();
            this._backdrop?.remove();
            this._backdrop = null;
        }
        changed(name) {
            if (name !== 'open')
                return super.changed(name);
            if (this.open && this.hidden)
                this.show(true);
            else if (!this.open && !this.hidden)
                this.hide();
        }
        show(animate = true) {
            this._return = document.activeElement;
            this.hidden = false;
            this.setAttribute('aria-modal', 'true');
            if (!this._backdrop) {
                this._backdrop = document.createElement('div');
                this._backdrop.className = 'usa-panel-backdrop';
                this._backdrop.addEventListener('click', () => this.close());
                this.before(this._backdrop);
            }
            const target = this.stops()[this.initialStop()];
            if (!animate)
                this._pos.jump(target);
            else {
                this._pos.jump(this.size());
                this._pos.set(target);
            }
            this.setFlag('open', true);
            this.focus({ preventScroll: true });
            this.emit('open');
        }
        initialStop() {
            return 0;
        }
        hide() {
            this._pos.set(this.size() * 1.05);
            this.emit('close');
        }
        afterClose() {
            this.hidden = true;
            this._backdrop?.remove();
            this._backdrop = null;
            if (this._return instanceof HTMLElement)
                this._return.focus({ preventScroll: true });
        }
        close() {
            this.setFlag('open', false);
        }
        dragStart(e) {
            const handle = kind === 'sheet' ? e.target.closest?.('[data-handle], .usa-sheet-handle') || (this.scrollTop <= 0 ? this : null) : this;
            if (!handle || e.target.closest?.('input, textarea, select, button, a, [data-no-drag]'))
                return;
            const p = this.vertical() ? e.clientY : e.clientX;
            this._pos.stop();
            this._drag = { id: e.pointerId, start: p, origin: this._pos.value, t: e.timeStamp, last: p, lt: e.timeStamp };
        }
        dragMove(e) {
            const d = this._drag;
            if (!d || e.pointerId !== d.id)
                return;
            const p = this.vertical() ? e.clientY : e.clientX;
            let v = d.origin + (p - d.start) * this.dir();
            if (v < 0)
                v = spring.rubberBand(v, 200);
            d.lt = d.t;
            d.t = e.timeStamp;
            d.last = p;
            this._pos.jump(v);
        }
        dragEnd(e) {
            const d = this._drag;
            if (!d || e.pointerId !== d.id)
                return;
            this._drag = null;
            const moved = this._pos.value - d.origin;
            const dt = Math.max(16, d.t - d.lt) / 1000;
            const vel = Math.abs(moved) > 4 ? (moved / Math.max(dt, (e.timeStamp - (d.lt || 0)) / 1000 || 0.1)) * 0.2 : 0;
            const projected = spring.projectInertia(this._pos.value, base.clamp(vel, -3e3, 3000));
            const stops = [...this.stops(), this.size()];
            const to = spring.snapTo(projected, stops);
            if (to >= this.size() - 1)
                this.close();
            else
                this._pos.set(to);
            this.emit('snap', { offset: to });
        }
    };
}
function defineDrawer(tag = 'usa-drawer') {
    variants.adoptVariants();
    return base.defineElement(tag, (Base) => makePanel(Base, 'drawer'), { id: 'sheet', text: css$7 });
}
function defineBottomSheet(tag = 'usa-bottom-sheet') {
    variants.adoptVariants();
    return base.defineElement(tag, (Base) => {
        const Panel = makePanel(Base, 'sheet');
        return class UsaBottomSheet extends Panel {
            static get observedAttributes() {
                return ['open', 'snap'];
            }
            mount() {
                if (!this.querySelector(':scope > .usa-sheet-handle')) {
                    const h = document.createElement('div');
                    h.className = 'usa-sheet-handle';
                    h.setAttribute('aria-hidden', 'true');
                    this.prepend(h);
                }
                super.mount();
            }
            size() {
                return (window.innerHeight || 800) * Math.max(...this.fractions());
            }
            fractions() {
                const f = this.str('snap', '0.5,0.92').split(',').map(Number).filter((n) => n > 0 && n <= 1);
                return f.length ? f : [0.5, 0.92];
            }
            stops() {
                const full = this.size();
                const H = window.innerHeight || 800;
                return this.fractions().map((f) => Math.max(0, full - f * H)).sort((a, b) => a - b);
            }
            initialStop() {
                const f = this.fractions();
                const pick = f[base.clamp(this.num('start', 0), 0, f.length - 1)];
                const target = Math.max(0, this.size() - pick * (window.innerHeight || 800));
                const s = this.stops();
                return Math.max(0, s.indexOf(target));
            }
            render(v) {
                this.style.height = `${this.size()}px`;
                super.render(v);
            }
        };
    }, { id: 'sheet', text: css$7 });
}

var css$6 = "usa-pull-refresh{position:relative;display:block;overflow:auto;overscroll-behavior-y:contain;touch-action:pan-x pan-down}usa-pull-refresh>:not(.usa-pull-indicator):not(.usa-sr){transform:translateY(var(--usa-pull,0px))}usa-pull-refresh .usa-pull-indicator{position:absolute;left:50%;top:0;width:34px;height:34px;margin-left:-17px;z-index:2;display:grid;place-items:center;border-radius:50%;background:var(--usa-surface,#1b1e27);box-shadow:var(--usa-shadow);color:var(--usa-accent,#7c5cff);transform:translateY(calc(var(--usa-pull,0px) - 40px)) rotate(calc(var(--usa-pull-p,0) * 270deg));opacity:var(--usa-pull-p,0);pointer-events:none}usa-pull-refresh .usa-pull-indicator svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:3;stroke-linecap:round}usa-pull-refresh .usa-pull-indicator circle{stroke-dasharray:calc(var(--usa-pull-p,0) * 75) 100}usa-pull-refresh[data-armed] .usa-pull-indicator{background:var(--usa-accent,#7c5cff);color:var(--usa-accent-text,#fff)}usa-pull-refresh[data-refreshing] .usa-pull-indicator{opacity:1;animation:usa-pull-spin 0.8s linear infinite}usa-pull-refresh[data-refreshing] .usa-pull-indicator circle{stroke-dasharray:60 100}@keyframes usa-pull-spin{from{transform:translateY(calc(var(--usa-pull,0px) - 40px)) rotate(0)}to{transform:translateY(calc(var(--usa-pull,0px) - 40px)) rotate(360deg)}}@media (prefers-reduced-motion:reduce){usa-pull-refresh[data-refreshing] .usa-pull-indicator{animation-duration:2.4s;transform:translateY(8px)}}";

function definePullRefresh(tag = 'usa-pull-refresh') {
    variants.adoptVariants();
    return base.defineElement(tag, (Base) => class UsaPullRefresh extends Base {
        constructor() {
            super(...arguments);
            this._busy = false;
            this._ind = null;
            this._live = null;
        }
        get refreshing() {
            return this._busy;
        }
        draw(v) {
            const th = this.num('threshold', 70);
            this.style.setProperty('--usa-pull', `${v.toFixed(1)}px`);
            this.style.setProperty('--usa-pull-p', Math.min(1, v / th).toFixed(3));
            this.toggleAttribute('data-armed', v >= th && !this._busy);
        }
        mount() {
            if (!this.querySelector(':scope > .usa-pull-indicator')) {
                this._ind = document.createElement('div');
                this._ind.className = 'usa-pull-indicator';
                this._ind.setAttribute('aria-hidden', 'true');
                this._ind.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" pathLength="100"/></svg>';
                this.prepend(this._ind);
                this._live = document.createElement('span');
                this._live.className = 'usa-sr';
                this._live.setAttribute('role', 'status');
                this.append(this._live);
            }
            this._y = spring.createSpring({ spring: 'stiff', onUpdate: (v) => this.draw(v) });
            let start = null;
            let id = -1;
            this.listen(this, 'pointerdown', (e) => {
                if (this.flag('disabled') || this._busy || this.scrollTop > 0)
                    return;
                start = e.clientY;
                id = e.pointerId;
            });
            this.listen(this, 'pointermove', (e) => {
                if (start === null || e.pointerId !== id)
                    return;
                const d = e.clientY - start;
                if (d <= 0)
                    return;
                this._y.jump(this.reduced ? 0 : spring.rubberBand(d, 220));
                if (this.reduced && d > this.num('threshold', 70))
                    this.setAttribute('data-armed', '');
            });
            const end = (e) => {
                if (start === null || e.pointerId !== id)
                    return;
                const d = e.clientY - start;
                start = null;
                const armed = this.hasAttribute('data-armed') || (!this.reduced && this._y.value >= this.num('threshold', 70)) || (this.reduced && d > this.num('threshold', 70));
                if (armed)
                    this.refresh();
                else
                    this._y.set(0);
            };
            this.listen(this, 'pointerup', end);
            this.listen(this, 'pointercancel', end);
        }
        unmount() {
            this._y?.stop();
        }
        refresh() {
            if (this._busy)
                return Promise.resolve();
            this._busy = true;
            this.removeAttribute('data-armed');
            this.setAttribute('data-refreshing', '');
            this.setAttribute('aria-busy', 'true');
            if (this._live)
                this._live.textContent = this.str('label', 'Refreshing');
            this._y.set(this.reduced ? 0 : this.num('threshold', 70) * 0.8);
            return new Promise((resolve) => {
                let finished = false;
                const done = () => {
                    if (finished)
                        return;
                    finished = true;
                    this._busy = false;
                    this.removeAttribute('data-refreshing');
                    this.removeAttribute('aria-busy');
                    if (this._live)
                        this._live.textContent = '';
                    this._y.set(0);
                    resolve();
                };
                const ev = new CustomEvent('usa:refresh', { detail: { done }, bubbles: true, cancelable: true });
                this.dispatchEvent(ev);
                const fn = this.onrefresh;
                if (typeof fn === 'function')
                    Promise.resolve(fn(ev)).then(done, done);
            });
        }
    }, { id: 'pull-refresh', text: css$6 });
}

var css$5 = "usa-fab{position:fixed;right:max(20px,env(safe-area-inset-right));bottom:max(20px,env(safe-area-inset-bottom));z-index:900;display:grid;place-items:center}usa-fab[position=\"bottom-left\"]{right:auto;left:max(20px,env(safe-area-inset-left))}usa-fab[position=\"inline\"]{position:relative;right:auto;bottom:auto;display:inline-grid}usa-fab>*{grid-area:1 / 1}usa-fab .usa-fab-main{position:relative;z-index:1;width:56px;height:56px;border-radius:min(var(--usa-radius,14px) * 1.2,28px);border:0;display:grid;place-items:center;font-size:24px;cursor:pointer;background:var(--usa-accent,#7c5cff);color:var(--usa-accent-text,#fff);box-shadow:var(--usa-shadow);transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1)}usa-fab[open] .usa-fab-main{transform:rotate(45deg)}usa-fab .usa-fab-action{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;opacity:0;transform:scale(0.4);will-change:transform,opacity}usa-fab .usa-fab-main:focus-visible,usa-fab .usa-fab-action:focus-visible{outline:2px solid var(--usa-accent,#7c5cff);outline-offset:3px}@media (prefers-reduced-motion:reduce){usa-fab .usa-fab-main{transition:none}}";

function defineFab(tag = 'usa-fab') {
    variants.adoptVariants();
    return base.defineElement(tag, (Base) => class UsaFab extends Base {
        static get observedAttributes() {
            return ['direction', 'gap'];
        }
        get open() {
            return this.flag('open');
        }
        set open(v) {
            this.toggle(v);
        }
        parts() {
            const kids = Array.from(this.children);
            return [kids[0] || null, kids.slice(1)];
        }
        offset(i, n) {
            const g = this.num('gap', 56) * (i + 1);
            switch (this.str('direction', 'up')) {
                case 'down':
                    return [0, g];
                case 'left':
                    return [-g, 0];
                case 'right':
                    return [g, 0];
                case 'radial': {
                    const a = Math.PI + (n > 1 ? (i / (n - 1)) * (Math.PI / 2) : Math.PI / 4);
                    const r = this.num('gap', 56) * 1.6;
                    return [Math.cos(a) * r, Math.sin(a) * r];
                }
                default:
                    return [0, -g];
            }
        }
        mount() {
            const [main, actions] = this.parts();
            if (!main)
                return;
            main.classList.add('usa-fab-main');
            main.setAttribute('aria-haspopup', 'true');
            actions.forEach((a) => a.classList.add('usa-fab-action'));
            this.apply(false);
            this.listen(main, 'click', () => this.toggle());
            this.listen(document, 'keydown', (e) => {
                if (e.key === 'Escape' && this.open) {
                    this.toggle(false);
                    main.focus();
                }
            });
            this.listen(document, 'pointerdown', (e) => this.open && !this.contains(e.target) && this.toggle(false));
            this.listen(this, 'click', (e) => {
                const a = e.target.closest?.('.usa-fab-action');
                if (a && this.contains(a))
                    this.toggle(false);
            });
        }
        apply(animate) {
            const [main, actions] = this.parts();
            if (!main)
                return;
            const open = this.open;
            main.setAttribute('aria-expanded', String(open));
            actions.forEach((a, i) => {
                const [x, y] = this.offset(i, actions.length);
                a.toggleAttribute('inert', !open);
                a.setAttribute('aria-hidden', String(!open));
                const to = open ? `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(1)` : 'translate(0, 0) scale(0.4)';
                const from = a.style.transform || 'translate(0, 0) scale(0.4)';
                a.style.transform = this.reduced ? (open ? `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)` : 'translate(0, 0)') : to;
                a.style.opacity = open ? '1' : '0';
                if (animate && !this.reduced) {
                    const t = spring.springEasing(open ? 'wobbly' : 'stiff');
                    this.motion(a, [{ transform: from, opacity: open ? 0 : 1 }, { transform: to, opacity: open ? 1 : 0 }], { ...t, delay: (open ? i : actions.length - 1 - i) * 35 });
                }
            });
        }
        toggle(force) {
            const next = force === undefined ? !this.open : force;
            if (next === this.open)
                return;
            this.setFlag('open', next);
            this.apply(true);
            this.emit('toggle', { open: next });
        }
    }, { id: 'fab', text: css$5 });
}

var css$4 = "usa-navbar{position:sticky;top:0;z-index:800;display:block;transition:transform 0.35s cubic-bezier(0.22,1,0.36,1),padding 0.25s ease,box-shadow 0.25s ease;will-change:transform}usa-navbar[data-hidden]{transform:translateY(-100%)}usa-navbar[data-scrolled]{box-shadow:var(--usa-shadow,0 6px 20px -10px rgb(0 0 0 / 0.4))}usa-navbar[shrink][data-scrolled]{padding-block:4px}@media (prefers-reduced-motion:reduce){usa-navbar{transition:none}}";

function defineNavbar(tag = 'usa-navbar') {
    variants.adoptVariants();
    return base.defineElement(tag, (Base) => class UsaNavbar extends Base {
        constructor() {
            super(...arguments);
            this._frame = 0;
            this._last = 0;
        }
        get hiddenByScroll() {
            return this.hasAttribute('data-hidden');
        }
        mount() {
            const sel = this.str('target');
            const scroller = (sel && document.querySelector(sel)) || window;
            const pos = () => (scroller === window ? window.scrollY || document.documentElement.scrollTop : scroller.scrollTop);
            this._last = pos();
            const update = () => {
                this._frame = 0;
                const y = pos();
                const dy = y - this._last;
                this._last = y;
                this.toggleAttribute('data-scrolled', y > 4);
                if (y <= this.num('threshold', 64) || dy < -2)
                    this.show();
                else if (dy > 2 && !this.contains(document.activeElement))
                    this.hide();
            };
            const on = () => {
                if (!this._frame)
                    this._frame = base.raf(update);
            };
            this.listen(scroller, 'scroll', on, { passive: true });
            this.listen(this, 'focusin', () => this.show());
            update();
        }
        unmount() {
            base.caf(this._frame);
            this._frame = 0;
        }
        hide() {
            if (this.hiddenByScroll)
                return;
            this.setAttribute('data-hidden', '');
            this.emit('hide');
        }
        show() {
            if (!this.hiddenByScroll)
                return;
            this.removeAttribute('data-hidden');
            this.emit('show');
        }
    }, { id: 'navbar', text: css$4 });
}

var css$3 = "usa-slider{--usa-slider:0;position:relative;display:block;height:28px;min-width:120px;touch-action:none;cursor:pointer;-webkit-tap-highlight-color:transparent}usa-slider .usa-slider-track{position:absolute;left:0;right:0;top:50%;height:6px;margin-top:-3px;border-radius:3px;background:color-mix(in srgb,currentColor 16%,transparent);overflow:hidden}usa-slider .usa-slider-fill{position:absolute;inset:0;background:var(--usa-accent,#7c5cff);transform-origin:0 50%;transform:scaleX(var(--usa-slider))}usa-slider .usa-slider-thumb{position:absolute;top:50%;left:calc(var(--usa-slider) * 100%);width:20px;height:20px;margin:-10px 0 0 -10px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgb(0 0 0 / 0.35),0 0 0 4px color-mix(in srgb,var(--usa-accent,#7c5cff) 0%,transparent);transition:transform 0.25s cubic-bezier(0.34,1.56,0.64,1),box-shadow 0.2s ease}usa-slider:hover .usa-slider-thumb,usa-slider:focus-visible .usa-slider-thumb{box-shadow:0 1px 4px rgb(0 0 0 / 0.35),0 0 0 6px color-mix(in srgb,var(--usa-accent,#7c5cff) 25%,transparent)}usa-slider[data-dragging] .usa-slider-thumb{transform:scale(1.25)}usa-slider .usa-slider-bubble{position:absolute;bottom:150%;left:50%;transform:translateX(-50%) scale(0.6);opacity:0;padding:2px 8px;border-radius:8px;font:600 12px/1.6 system-ui,sans-serif;color:var(--usa-accent-text,#fff);background:var(--usa-accent,#7c5cff);white-space:nowrap;pointer-events:none;transition:opacity 0.15s ease,transform 0.25s cubic-bezier(0.34,1.56,0.64,1)}usa-slider[bubble][data-dragging] .usa-slider-bubble,usa-slider[bubble]:focus-visible .usa-slider-bubble{opacity:1;transform:translateX(-50%) scale(1)}usa-slider:focus-visible{outline:none}usa-slider[disabled]{opacity:0.45;cursor:not-allowed}@media (prefers-reduced-motion:reduce){usa-slider .usa-slider-thumb,usa-slider .usa-slider-bubble{transition:none}}";

function defineSlider(tag = 'usa-slider') {
    variants.adoptVariants();
    return base.defineElement(tag, (Base) => {
        class UsaSlider extends Base {
            static get observedAttributes() {
                return ['min', 'max', 'disabled', 'label'];
            }
            constructor() {
                super();
                this._internals = null;
                this._v = 0;
                this._id = -1;
                try {
                    this._internals = this.attachInternals?.() ?? null;
                }
                catch {
                    this._internals = null;
                }
            }
            range() {
                const min = this.num('min', 0);
                const max = Math.max(min + 1e-9, this.num('max', 100));
                return [min, max, Math.max(1e-9, this.num('step', 1))];
            }
            get value() {
                return this._v;
            }
            set value(v) {
                this.setValue(v, false);
            }
            fraction(v = this._v) {
                const [min, max] = this.range();
                return (v - min) / (max - min);
            }
            setValue(v, user, animate = true) {
                const [min, max, step] = this.range();
                const q = base.clamp(Math.round((v - min) / step) * step + min, min, max);
                const val = Number(q.toFixed(10));
                const changed = val !== this._v;
                this._v = val;
                this.setAttribute('aria-valuenow', String(val));
                this.setAttribute('aria-valuetext', String(val));
                this._internals?.setFormValue?.(String(val));
                const bubble = this.querySelector('.usa-slider-bubble');
                if (bubble)
                    bubble.textContent = String(val);
                if (animate)
                    this._pos?.set(this.fraction());
                else
                    this._pos?.jump(this.fraction());
                if (changed && user) {
                    this.dispatchEvent(new Event('input', { bubbles: true }));
                    this.emit('input', { value: val });
                }
            }
            mount() {
                if (!this.querySelector(':scope > .usa-slider-track')) {
                    this.innerHTML = '<span class="usa-slider-track"><span class="usa-slider-fill"></span></span><span class="usa-slider-thumb"><span class="usa-slider-bubble"></span></span>';
                }
                this.setAttribute('role', 'slider');
                if (!this.hasAttribute('tabindex'))
                    this.tabIndex = 0;
                const [min, max] = this.range();
                this.setAttribute('aria-valuemin', String(min));
                this.setAttribute('aria-valuemax', String(max));
                if (this.str('label'))
                    this.setAttribute('aria-label', this.str('label'));
                this.toggleAttribute('aria-disabled', this.flag('disabled'));
                this._pos = spring.createSpring({ spring: 'stiff', onUpdate: (f) => this.style.setProperty('--usa-slider', base.clamp(f, 0, 1).toFixed(4)) });
                this.setValue(this.num('value', min), false, false);
                const fromPointer = (e) => {
                    const r = this.getBoundingClientRect();
                    return min + base.clamp((e.clientX - r.left) / (r.width || 1), 0, 1) * (max - min);
                };
                this.listen(this, 'pointerdown', (e) => {
                    if (this.flag('disabled'))
                        return;
                    this._id = e.pointerId;
                    try {
                        this.setPointerCapture?.(e.pointerId);
                    }
                    catch {
                        /* synthetic */
                    }
                    this.setAttribute('data-dragging', '');
                    this.setValue(fromPointer(e), true);
                });
                this.listen(this, 'pointermove', (e) => e.pointerId === this._id && this.setValue(fromPointer(e), true));
                const end = (e) => {
                    if (e.pointerId !== this._id)
                        return;
                    this._id = -1;
                    this.removeAttribute('data-dragging');
                    this.commit();
                };
                this.listen(this, 'pointerup', end);
                this.listen(this, 'pointercancel', end);
                this.listen(this, 'keydown', (e) => {
                    if (this.flag('disabled'))
                        return;
                    const [mn, mx, st] = this.range();
                    const map = { ArrowRight: this._v + st, ArrowUp: this._v + st, ArrowLeft: this._v - st, ArrowDown: this._v - st, PageUp: this._v + st * 10, PageDown: this._v - st * 10, Home: mn, End: mx };
                    if (!(e.key in map))
                        return;
                    e.preventDefault();
                    this.setValue(map[e.key], true);
                    this.commit();
                });
            }
            unmount() {
                this._pos?.stop();
            }
            commit() {
                this.dispatchEvent(new Event('change', { bubbles: true }));
                this.emit('change', { value: this._v });
            }
        }
        UsaSlider.formAssociated = true;
        return UsaSlider;
    }, { id: 'slider', text: css$3 });
}

var css$2 = "usa-popover{display:inline-block}usa-popover .usa-popover-panel{position:fixed;z-index:1500;min-width:180px;max-width:min(92vw,360px);padding:12px 14px;outline:none}usa-popover .usa-popover-panel[hidden]{display:none}";

function definePopover(tag = 'usa-popover') {
    variants.adoptVariants();
    return base.defineElement(tag, (Base) => class UsaPopover extends Base {
        get open() {
            return this.flag('open');
        }
        set open(v) {
            this.toggle(v);
        }
        parts() {
            return [this.firstElementChild, this.querySelector(':scope > [data-popover]')];
        }
        mount() {
            const [trigger, panel] = this.parts();
            if (!trigger || !panel || trigger === panel)
                return;
            panel.id || (panel.id = nextId('usa-pop'));
            panel.classList.add('usa-surface', 'usa-popover-panel');
            if (!panel.hasAttribute('role'))
                panel.setAttribute('role', 'dialog');
            panel.tabIndex = -1;
            trigger.setAttribute('aria-controls', panel.id);
            trigger.setAttribute('aria-haspopup', 'dialog');
            this.render(false);
            this.listen(trigger, 'click', () => this.toggle());
            this.listen(document, 'keydown', (e) => {
                if (e.key === 'Escape' && this.open) {
                    this.toggle(false);
                    trigger.focus();
                }
            });
            this.listen(document, 'pointerdown', (e) => this.open && !this.contains(e.target) && this.toggle(false));
            this.listen(window, 'resize', () => this.open && place(panel, trigger, this.str('placement', 'bottom')));
        }
        render(animate) {
            const [trigger, panel] = this.parts();
            if (!trigger || !panel)
                return;
            trigger.setAttribute('aria-expanded', String(this.open));
            panel.hidden = !this.open;
            if (!this.open)
                return;
            const p = place(panel, trigger, this.str('placement', 'bottom'));
            if (!animate)
                return;
            const origin = { top: '50% 100%', bottom: '50% 0', left: '100% 50%', right: '0 50%' }[p];
            panel.style.transformOrigin = origin;
            this.motion(panel, this.reduced ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, transform: 'scale(0.9)' }, { opacity: 1, transform: 'none' }], this.reduced ? { duration: 120 } : spring.springEasing('wobbly'));
            panel.focus({ preventScroll: true });
        }
        toggle(force) {
            const next = force === undefined ? !this.open : force;
            if (next === this.open)
                return;
            this.setFlag('open', next);
            this.render(true);
            this.emit(next ? 'open' : 'close');
        }
    }, { id: 'popover', text: css$2 });
}

var css$1 = "usa-badge{position:relative;display:inline-block}usa-badge .usa-badge-count{position:absolute;top:0;right:0;transform-origin:50% 50%;translate:45% -45%;min-width:18px;height:18px;padding:0 5px;box-sizing:border-box;border-radius:9px;display:grid;place-items:center;font:700 11px/1 system-ui,sans-serif;color:var(--usa-accent-text,#fff);background:var(--usa-badge-color,#e5484d);box-shadow:0 0 0 2px var(--usa-badge-ring,Canvas);pointer-events:none}usa-badge[data-dot] .usa-badge-count{min-width:10px;width:10px;height:10px;padding:0}usa-badge .usa-badge-count[hidden]{display:none}usa-badge[pulse] .usa-badge-count::after{content:\"\";position:absolute;inset:0;border-radius:inherit;background:inherit;animation:usa-badge-pulse 1.6s ease-out infinite;z-index:-1}@keyframes usa-badge-pulse{from{transform:scale(1);opacity:0.6}to{transform:scale(2.4);opacity:0}}@media (prefers-reduced-motion:reduce){usa-badge[pulse] .usa-badge-count::after{animation:none}}";

function defineBadge(tag = 'usa-badge') {
    variants.adoptVariants();
    return base.defineElement(tag, (Base) => class UsaBadge extends Base {
        constructor() {
            super(...arguments);
            this._el = null;
        }
        static get observedAttributes() {
            return ['value', 'max', 'dot', 'label'];
        }
        get value() {
            return this.str('value');
        }
        set value(v) {
            this.setAttribute('value', String(v));
        }
        mount() {
            if (!this._el || !this._el.isConnected) {
                this._el = document.createElement('span');
                this._el.className = 'usa-badge-count';
                this.append(this._el);
            }
            this.sync(false);
        }
        changed(name) {
            this.sync(name === 'value');
        }
        sync(bump) {
            const el = this._el;
            if (!el)
                return;
            const raw = this.value;
            const n = Number(raw);
            const max = this.num('max', 99);
            const text = this.flag('dot') ? '' : raw !== '' && Number.isFinite(n) && n > max ? `${max}+` : raw;
            const empty = !this.flag('dot') && (raw === '' || (raw === '0' && !this.flag('show-zero')));
            el.textContent = text;
            el.hidden = empty;
            this.toggleAttribute('data-dot', this.flag('dot'));
            const label = this.str('label', raw ? `${raw} new` : 'New');
            el.setAttribute('aria-label', label.replace('{n}', raw));
            el.setAttribute('role', 'status');
            if (bump && !empty && !this.reduced)
                this.motion(el, [{ transform: 'scale(0.4)' }, { transform: 'scale(1)' }], spring.springEasing('bouncy'));
        }
    }, { id: 'badge', text: css$1 });
}

var css = "usa-avatar-stack{--usa-avatar-size:36px;--usa-avatar-overlap:0.35;display:inline-flex;align-items:center;padding-inline-start:calc(var(--usa-avatar-size) * var(--usa-avatar-overlap))}usa-avatar-stack .usa-avatar{width:var(--usa-avatar-size);height:var(--usa-avatar-size);border-radius:50%;object-fit:cover;flex:none;box-shadow:0 0 0 2px var(--usa-avatar-ring,Canvas);margin-inline-start:calc(var(--usa-avatar-size) * var(--usa-avatar-overlap) * -1);transition:margin 0.45s cubic-bezier(0.34,1.56,0.64,1),transform 0.3s cubic-bezier(0.34,1.56,0.64,1);display:grid;place-items:center;font:700 12px/1 system-ui,sans-serif;background:color-mix(in srgb,currentColor 14%,transparent)}usa-avatar-stack .usa-avatar[hidden]{display:none}usa-avatar-stack:hover .usa-avatar,usa-avatar-stack:focus-within .usa-avatar{margin-inline-start:4px}usa-avatar-stack .usa-avatar:hover{transform:translateY(-4px) scale(1.08)}@media (prefers-reduced-motion:reduce){usa-avatar-stack .usa-avatar{transition:none}usa-avatar-stack:hover .usa-avatar,usa-avatar-stack:focus-within .usa-avatar{margin-inline-start:calc(var(--usa-avatar-size) * var(--usa-avatar-overlap) * -1)}usa-avatar-stack .usa-avatar:hover{transform:none}}";

function defineAvatarStack(tag = 'usa-avatar-stack') {
    variants.adoptVariants();
    return base.defineElement(tag, (Base) => class UsaAvatarStack extends Base {
        static get observedAttributes() {
            return ['max', 'size', 'overlap'];
        }
        mount() {
            this.querySelector(':scope > .usa-avatar-more')?.remove();
            const kids = Array.from(this.children);
            const max = Math.max(1, this.num('max', 5));
            this.style.setProperty('--usa-avatar-size', `${this.num('size', 36)}px`);
            this.style.setProperty('--usa-avatar-overlap', String(this.num('overlap', 0.35)));
            this.setAttribute('role', 'group');
            this.setAttribute('aria-label', this.str('label', `${kids.length} people`));
            kids.forEach((k, i) => {
                k.classList.add('usa-avatar');
                k.hidden = i >= max;
                k.style.setProperty('--i', String(i));
                k.style.zIndex = String(kids.length - i);
            });
            if (kids.length > max) {
                const more = document.createElement('span');
                more.className = 'usa-avatar usa-avatar-more';
                more.textContent = `+${kids.length - max}`;
                more.style.setProperty('--i', String(max));
                more.setAttribute('aria-label', `and ${kids.length - max} more`);
                this.append(more);
            }
        }
    }, { id: 'avatar-stack', text: css });
}

/**
 * motionary/components/ui — animated UI components + style variants (v2.6).
 * `<usa-tabs>`, `<usa-drawer>`, `<usa-bottom-sheet>`, `<usa-pull-refresh>`,
 * `<usa-fab>`, `<usa-navbar>`, `<usa-slider>`,
 * `<usa-popover>`, `<usa-badge>`, `<usa-avatar-stack>`,
 * and `variant="minimal | neon | glass | brutalist | fluent | material"`
 * design tokens (`setVariant()`, `VARIANTS`).
 */
/** Register every component of this category under its default tag. */
function defineUiComponents() {
    defineTabs();
    defineDrawer();
    defineBottomSheet();
    definePullRefresh();
    defineFab();
    defineNavbar();
    defineSlider();
    definePopover();
    defineBadge();
    defineAvatarStack();
}

exports.VARIANTS = variants.VARIANTS;
exports.adoptVariants = variants.adoptVariants;
exports.setVariant = variants.setVariant;
exports.defineAvatarStack = defineAvatarStack;
exports.defineBadge = defineBadge;
exports.defineBottomSheet = defineBottomSheet;
exports.defineDrawer = defineDrawer;
exports.defineFab = defineFab;
exports.defineNavbar = defineNavbar;
exports.definePopover = definePopover;
exports.definePullRefresh = definePullRefresh;
exports.defineSlider = defineSlider;
exports.defineTabs = defineTabs;
exports.defineUiComponents = defineUiComponents;
//# sourceMappingURL=ui.cjs.map
