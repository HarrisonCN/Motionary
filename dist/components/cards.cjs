'use strict';

var base = require('../chunks/base-5DFCAnvH.cjs');
var spring = require('../chunks/spring-Bi4qY0pL.cjs');

var css$3 = "usa-card{--usa-card-radius:18px;--usa-card-bg:var(--usa-surface,#1b1e27);--usa-card-glow:var(--usa-accent,#7c5cff);--usa-card-x:50%;--usa-card-y:50%;--usa-card-nx:0;--usa-card-ny:0;position:relative;display:block;border-radius:var(--usa-card-radius);isolation:isolate;-webkit-tap-highlight-color:transparent}usa-card:focus-visible{outline:2px solid var(--usa-card-glow);outline-offset:3px}usa-card[effect~=\"lift\"]{transition:transform 0.45s cubic-bezier(0.34,1.56,0.64,1),box-shadow 0.45s ease}usa-card[effect~=\"lift\"][data-hover],usa-card[effect~=\"lift\"]:focus-visible{transform:translateY(-6px) perspective(900px) rotateX(calc(var(--usa-card-ny) * -4deg)) rotateY(calc(var(--usa-card-nx) * 4deg));box-shadow:0 22px 44px -18px rgb(0 0 0 / 0.55)}usa-card[effect~=\"glass\"]{background:color-mix(in srgb,var(--usa-card-bg) 45%,transparent);border:1px solid rgb(255 255 255 / 0.16);-webkit-backdrop-filter:blur(18px) saturate(1.5);backdrop-filter:blur(18px) saturate(1.5)}usa-card[effect~=\"spotlight\"]::before,usa-card[effect~=\"border-glow\"]::after{content:\"\";position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;transition:opacity 0.3s ease}usa-card[effect~=\"spotlight\"]::before{z-index:-1;background:radial-gradient(260px circle at var(--usa-card-x) var(--usa-card-y),color-mix(in srgb,var(--usa-card-glow) 28%,transparent),transparent 70%)}usa-card[effect~=\"border-glow\"]::after{padding:1.5px;background:radial-gradient(180px circle at var(--usa-card-x) var(--usa-card-y),var(--usa-card-glow),transparent 70%);-webkit-mask:linear-gradient(#000 0 0) content-box exclude,linear-gradient(#000 0 0);mask:linear-gradient(#000 0 0) content-box exclude,linear-gradient(#000 0 0)}usa-card[data-hover]::before,usa-card[data-hover]::after{opacity:1}@property --usa-card-angle{syntax:\"<angle>\";inherits:false;initial-value:0deg}usa-card[effect~=\"conic-border\"]{border:2px solid transparent;background:linear-gradient(var(--usa-card-bg),var(--usa-card-bg)) padding-box,conic-gradient(from var(--usa-card-angle),var(--usa-card-glow),#22d3ee,#f472b6,var(--usa-card-glow)) border-box;animation:usa-card-spin 4s linear infinite}@keyframes usa-card-spin{to{--usa-card-angle:360deg}}usa-card .usa-card-sheen{position:absolute;inset:0;border-radius:inherit;overflow:hidden;pointer-events:none}usa-card .usa-card-sheen::before{content:\"\";position:absolute;top:0;bottom:0;width:45%;left:-60%;transform:skewX(-20deg);background:linear-gradient(90deg,transparent,rgb(255 255 255 / 0.35),transparent)}usa-card[effect~=\"sheen\"]:hover .usa-card-sheen::before,usa-card[effect~=\"sheen\"]:focus-visible .usa-card-sheen::before{left:130%;transition:left 0.8s cubic-bezier(0.22,1,0.36,1)}usa-card .usa-card-holo{position:absolute;inset:0;border-radius:inherit;pointer-events:none;mix-blend-mode:color-dodge;opacity:0.35;background:linear-gradient(115deg,transparent 20%,#ff7ad9 35%,#7af0ff 45%,#ffe27a 55%,transparent 70%) calc(var(--usa-card-x) * 1.4 - 20%) calc(var(--usa-card-y) * 1.4 - 20%) / 220% 220%;transition:opacity 0.3s ease}usa-card[data-hover] .usa-card-holo{opacity:0.7}usa-card[effect~=\"parallax-layers\"] [data-depth]{transition:transform 0.25s ease-out;will-change:transform}usa-card[effect~=\"flip\"]{perspective:1000px;display:grid}usa-card[effect~=\"flip\"]>[data-front],usa-card[effect~=\"flip\"]>[data-back]{grid-area:1 / 1;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:inherit;transition:transform 0.7s cubic-bezier(0.34,1.3,0.64,1),opacity 0.3s ease}usa-card[effect~=\"flip\"]>[data-back]{transform:rotateY(180deg)}usa-card[effect~=\"flip\"][axis=\"x\"]>[data-back]{transform:rotateX(180deg)}usa-card[effect~=\"flip\"][flipped]>[data-front],usa-card[effect~=\"flip\"]:not([trigger=\"click\"]):hover>[data-front]{transform:rotateY(-180deg)}usa-card[effect~=\"flip\"][flipped]>[data-back],usa-card[effect~=\"flip\"]:not([trigger=\"click\"]):hover>[data-back]{transform:rotateY(0deg)}usa-card[effect~=\"flip\"][axis=\"x\"][flipped]>[data-front],usa-card[effect~=\"flip\"][axis=\"x\"]:not([trigger=\"click\"]):hover>[data-front]{transform:rotateX(180deg)}usa-card[effect~=\"flip\"][axis=\"x\"][flipped]>[data-back],usa-card[effect~=\"flip\"][axis=\"x\"]:not([trigger=\"click\"]):hover>[data-back]{transform:rotateX(0deg)}usa-card[effect~=\"flip\"][trigger=\"click\"]{cursor:pointer}usa-card[effect~=\"expand\"]{cursor:zoom-in}usa-card[effect~=\"expand\"]:not([expanded]) [data-detail]{display:none}usa-card[expanded]{position:fixed;inset:6vh max(4vw,calc(50vw - 420px));z-index:1000;overflow:auto;cursor:default;background:var(--usa-card-bg);box-shadow:0 30px 80px -20px rgb(0 0 0 / 0.6)}.usa-card-backdrop{position:fixed;inset:0;z-index:999;background:rgb(0 0 0 / 0.45)}@media (prefers-reduced-motion:reduce){usa-card,usa-card *,usa-card .usa-card-sheen::before{transition-duration:0.01ms !important;animation:none !important}usa-card[effect~=\"lift\"][data-hover]{transform:none}usa-card[effect~=\"flip\"]>[data-front],usa-card[effect~=\"flip\"]>[data-back]{transform:none !important}usa-card[effect~=\"flip\"][flipped]>[data-front],usa-card[effect~=\"flip\"]:not([flipped])>[data-back]{opacity:0;visibility:hidden}usa-card[effect~=\"flip\"]:not([trigger=\"click\"]):hover>[data-front]{opacity:0;visibility:hidden}usa-card[effect~=\"flip\"]:not([trigger=\"click\"]):hover>[data-back]{opacity:1;visibility:visible}}@media (prefers-reduced-transparency:reduce),(forced-colors:active){usa-card[effect~=\"glass\"]{background:var(--usa-card-bg);-webkit-backdrop-filter:none;backdrop-filter:none}}";

const CARD_EFFECTS = ['flip', 'holo', 'glass', 'border-glow', 'conic-border', 'lift', 'spotlight', 'sheen', 'parallax-layers', 'expand'];
/** Effects that follow the pointer (they share one rAF-throttled tracker). */
const TRACKING = new Set(['holo', 'border-glow', 'spotlight', 'parallax-layers', 'lift']);
function defineCard(tag = 'usa-card') {
    return base.defineElement(tag, (Base) => class UsaCard extends Base {
        constructor() {
            super(...arguments);
            this._frame = 0;
            this._spacer = null;
            this._backdrop = null;
            this._busy = false;
        }
        static get observedAttributes() {
            return ['effect', 'trigger', 'disabled'];
        }
        get effects() {
            return this.str('effect', 'lift').split(/[\s,]+/).filter(Boolean);
        }
        has(e) {
            return this.effects.includes(e);
        }
        get flipped() {
            return this.flag('flipped');
        }
        set flipped(v) {
            this.setFlag('flipped', v);
        }
        get expanded() {
            return this.flag('expanded');
        }
        mount() {
            if (this.flag('disabled'))
                return;
            const color = this.str('color');
            if (color)
                this.style.setProperty('--usa-card-glow', color);
            if (this.has('sheen') && !this.querySelector(':scope > .usa-card-sheen'))
                this.append(deco('usa-card-sheen'));
            if (this.has('holo') && !this.querySelector(':scope > .usa-card-holo'))
                this.append(deco('usa-card-holo'));
            if (this.has('flip')) {
                const click = this.str('trigger', 'hover') === 'click';
                if (click) {
                    if (!this.hasAttribute('tabindex'))
                        this.tabIndex = 0;
                    this.setAttribute('role', this.getAttribute('role') || 'button');
                    this.setAttribute('aria-pressed', String(this.flipped));
                    this.listen(this, 'click', (e) => !interactive(e.target, this) && this.flip());
                    this.listen(this, 'keydown', (e) => {
                        if ((e.key === 'Enter' || e.key === ' ') && e.target === this) {
                            e.preventDefault();
                            this.flip();
                        }
                    });
                }
                this.setBackHidden();
            }
            if (this.has('expand')) {
                if (!this.hasAttribute('tabindex'))
                    this.tabIndex = 0;
                this.setAttribute('aria-expanded', String(this.expanded));
                this.listen(this, 'click', (e) => {
                    const t = e.target;
                    if (t.closest?.('[data-close]')) {
                        e.stopPropagation();
                        this.collapse();
                    }
                    else if (!this.expanded && !interactive(t, this))
                        this.expand();
                });
                this.listen(this, 'keydown', (e) => {
                    if (e.key === 'Escape' && this.expanded)
                        this.collapse();
                    else if ((e.key === 'Enter' || e.key === ' ') && e.target === this && !this.expanded) {
                        e.preventDefault();
                        this.expand();
                    }
                });
            }
            if (!this.effects.some((e) => TRACKING.has(e)) || this.reduced)
                return;
            let rect = null;
            let px = 0.5;
            let py = 0.5;
            const apply = () => {
                this._frame = 0;
                const nx = base.clamp(px * 2 - 1, -1, 1);
                const ny = base.clamp(py * 2 - 1, -1, 1);
                this.style.setProperty('--usa-card-x', `${(px * 100).toFixed(1)}%`);
                this.style.setProperty('--usa-card-y', `${(py * 100).toFixed(1)}%`);
                this.style.setProperty('--usa-card-nx', nx.toFixed(3));
                this.style.setProperty('--usa-card-ny', ny.toFixed(3));
                if (this.has('parallax-layers')) {
                    const depth = this.num('depth', 16);
                    this.querySelectorAll('[data-depth]').forEach((l) => {
                        const d = Number(l.dataset.depth) || 0.5;
                        l.style.transform = `translate3d(${(nx * depth * d).toFixed(1)}px, ${(ny * depth * d).toFixed(1)}px, 0)`;
                    });
                }
            };
            this.listen(this, 'pointerenter', () => {
                rect = this.getBoundingClientRect();
                this.setAttribute('data-hover', '');
            });
            this.listen(this, 'pointermove', (e) => {
                if (this.expanded)
                    return;
                rect = rect || this.getBoundingClientRect();
                px = (e.clientX - rect.left) / (rect.width || 1);
                py = (e.clientY - rect.top) / (rect.height || 1);
                if (!this._frame)
                    this._frame = base.raf(apply);
            });
            this.listen(this, 'pointerleave', () => {
                rect = null;
                px = py = 0.5;
                this.removeAttribute('data-hover');
                if (!this._frame)
                    this._frame = base.raf(apply);
            });
        }
        unmount() {
            base.caf(this._frame);
            this._frame = 0;
            if (this.expanded)
                this.finishCollapse();
        }
        setBackHidden() {
            const front = this.querySelector(':scope > [data-front]');
            const back = this.querySelector(':scope > [data-back]');
            front?.setAttribute('aria-hidden', String(this.flipped));
            back?.setAttribute('aria-hidden', String(!this.flipped));
        }
        flip(force) {
            const next = force === undefined ? !this.flipped : force;
            if (next === this.flipped)
                return;
            this.flipped = next;
            if (this.hasAttribute('aria-pressed'))
                this.setAttribute('aria-pressed', String(next));
            this.setBackHidden();
            this.emit('flip', { flipped: next });
        }
        async expand() {
            if (this.expanded || this._busy)
                return;
            this._busy = true;
            const first = this.getBoundingClientRect();
            const spacer = document.createElement('div');
            spacer.className = 'usa-card-spacer';
            spacer.style.cssText = `width:${first.width}px;height:${first.height}px`;
            spacer.setAttribute('aria-hidden', 'true');
            this.before(spacer);
            this._spacer = spacer;
            const backdrop = document.createElement('div');
            backdrop.className = 'usa-card-backdrop';
            backdrop.addEventListener('click', () => this.collapse());
            this.before(backdrop);
            this._backdrop = backdrop;
            this.setFlag('expanded', true);
            this.setAttribute('aria-expanded', 'true');
            this.emit('expand');
            const last = this.getBoundingClientRect();
            await this.flipFrom(first, last);
            this.motion(backdrop, [{ opacity: 0 }, { opacity: 1 }], { duration: 250, easing: 'ease-out' });
            this.focus({ preventScroll: true });
            this._busy = false;
        }
        async collapse() {
            if (!this.expanded || this._busy)
                return;
            this._busy = true;
            const first = this.getBoundingClientRect();
            const b = this._backdrop;
            if (b)
                this.motion(b, [{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: 'ease-in', fill: 'forwards' });
            this.finishCollapse();
            this.emit('collapse');
            const last = this.getBoundingClientRect();
            await this.flipFrom(first, last);
            this._busy = false;
        }
        finishCollapse() {
            this.setFlag('expanded', false);
            this.setAttribute('aria-expanded', 'false');
            this._spacer?.remove();
            this._backdrop?.remove();
            this._spacer = this._backdrop = null;
        }
        async flipFrom(first, last) {
            if (this.reduced) {
                const a = this.motion(this, [{ opacity: 0.4 }, { opacity: 1 }], { duration: 200 });
                await a?.finished.catch(() => undefined);
                return;
            }
            const sx = first.width / (last.width || 1);
            const sy = first.height / (last.height || 1);
            const dx = first.left - last.left;
            const dy = first.top - last.top;
            const { easing, duration } = spring.springEasing('stiff');
            const a = this.motion(this, [{ transformOrigin: '0 0', transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` }, { transformOrigin: '0 0', transform: 'none' }], { duration: Math.min(duration, 900), easing: easing || base.EASE_OUT });
            await a?.finished.catch(() => undefined);
        }
    }, { id: 'card', text: css$3 });
}
function deco(cls) {
    const s = document.createElement('span');
    s.className = cls;
    s.setAttribute('aria-hidden', 'true');
    return s;
}
/** Clicks on links, buttons and form fields inside the card keep their own behaviour. */
function interactive(t, host) {
    const el = t?.closest?.('a, button, input, select, textarea, label, [contenteditable]');
    return !!el && el !== host && host.contains(el);
}

var css$2 = "usa-card-stack{position:relative;display:grid;touch-action:pan-y;user-select:none;-webkit-user-select:none}usa-card-stack>*{grid-area:1 / 1;transform-origin:50% 100%;transition:transform 0.35s cubic-bezier(0.34,1.3,0.64,1),opacity 0.3s ease;will-change:transform}usa-card-stack>[data-top]{cursor:grab}usa-card-stack[data-dragging]>*,usa-card-stack>[data-top]{transition:none}usa-card-stack:focus-visible{outline:2px solid var(--usa-accent,#7c5cff);outline-offset:4px;border-radius:12px}@media (prefers-reduced-motion:reduce){usa-card-stack>*{transition:none}}";

function defineCardStack(tag = 'usa-card-stack') {
    return base.defineElement(tag, (Base) => class UsaCardStack extends Base {
        constructor() {
            super(...arguments);
            this._drag = null;
            this._busy = false;
        }
        static get observedAttributes() {
            return ['visible', 'offset', 'disabled'];
        }
        get top() {
            return this.cards()[0] || null;
        }
        cards() {
            return Array.from(this.children).filter((c) => !c.hasAttribute('data-gone'));
        }
        layout(dragX = 0) {
            const visible = this.num('visible', 3);
            const off = this.num('offset', 10);
            const reduced = this.reduced;
            this.cards().forEach((c, i) => {
                c.style.zIndex = String(100 - i);
                c.toggleAttribute('data-top', i === 0);
                c.setAttribute('aria-hidden', String(i !== 0));
                if (i === 0) {
                    const rot = reduced ? 0 : dragX / 18;
                    c.style.transform = `translate3d(${dragX}px, 0, 0) rotate(${rot.toFixed(2)}deg)`;
                    c.style.opacity = '1';
                }
                else {
                    const k = Math.min(i, visible);
                    const pull = Math.min(1, Math.abs(dragX) / this.num('threshold', 90));
                    const kk = Math.max(0, k - pull);
                    c.style.transform = `translate3d(0, ${(kk * off).toFixed(1)}px, 0) scale(${(1 - kk * 0.05).toFixed(3)})`;
                    c.style.opacity = i > visible ? '0' : '1';
                }
            });
        }
        mount() {
            if (!this.hasAttribute('tabindex'))
                this.tabIndex = 0;
            if (!this.hasAttribute('role'))
                this.setAttribute('role', 'group');
            this.setAttribute('aria-roledescription', 'card stack');
            this._x = spring.createSpring({ spring: 'wobbly', onUpdate: (v) => this.layout(v) });
            this.layout();
            this.listen(this, 'pointerdown', (e) => {
                if (this.flag('disabled') || this._busy || !this.top || !this.top.contains(e.target))
                    return;
                this._x.stop();
                this._drag = { id: e.pointerId, x0: e.clientX - this._x.value, t0: e.timeStamp };
                try {
                    this.setPointerCapture?.(e.pointerId);
                }
                catch {
                    /* synthetic */
                }
                this.setAttribute('data-dragging', '');
            });
            this.listen(this, 'pointermove', (e) => {
                if (!this._drag || e.pointerId !== this._drag.id)
                    return;
                this._x.jump(e.clientX - this._drag.x0);
            });
            const up = (e) => {
                if (!this._drag || e.pointerId !== this._drag.id)
                    return;
                this._drag = null;
                this.removeAttribute('data-dragging');
                const x = this._x.value;
                if (Math.abs(x) >= this.num('threshold', 90))
                    this.swipe(x > 0 ? 'right' : 'left');
                else
                    this._x.set(0);
            };
            this.listen(this, 'pointerup', up);
            this.listen(this, 'pointercancel', up);
            this.listen(this, 'keydown', (e) => {
                if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                    e.preventDefault();
                    this.swipe(e.key === 'ArrowLeft' ? 'left' : 'right');
                }
            });
            const mo = typeof MutationObserver !== 'undefined' ? new MutationObserver(() => this.layout(this._x.value)) : null;
            mo?.observe(this, { childList: true });
            this.onCleanup(() => mo?.disconnect());
        }
        unmount() {
            this._x?.stop();
        }
        async swipe(direction) {
            const card = this.top;
            if (!card || this._busy || this.flag('disabled'))
                return;
            this._busy = true;
            this._x.stop();
            const from = this._x.value;
            const to = (direction === 'left' ? -1 : 1) * Math.max(320, (this.getBoundingClientRect().width || 300) * 1.4);
            card.setAttribute('data-gone', '');
            this._x.jump(0);
            this.layout(0);
            const a = this.reduced
                ? null
                : this.motion(card, [{ transform: `translate3d(${from}px,0,0) rotate(${from / 18}deg)`, opacity: 1 }, { transform: `translate3d(${to}px,0,0) rotate(${to / 14}deg)`, opacity: 0 }], {
                    duration: 380,
                    easing: 'cubic-bezier(0.3, 0.7, 0.4, 1)',
                    fill: 'forwards',
                });
            await a?.finished.catch(() => undefined);
            a?.cancel();
            card.removeAttribute('data-gone');
            if (this.flag('loop'))
                this.append(card);
            else
                card.remove();
            this.layout(0);
            this._busy = false;
            this.emit('swipe', { direction, card });
            if (!this.top)
                this.emit('empty');
        }
    }, { id: 'card-stack', text: css$2 });
}

var css$1 = "usa-sticky-stack{display:grid;gap:28vh;padding-bottom:10vh}usa-sticky-stack>*{position:sticky;transform-origin:50% 0;will-change:transform}";

function defineStickyStack(tag = 'usa-sticky-stack') {
    return base.defineElement(tag, (Base) => class UsaStickyStack extends Base {
        constructor() {
            super(...arguments);
            this._frame = 0;
        }
        static get observedAttributes() {
            return ['top', 'gap', 'scale'];
        }
        mount() {
            const top = this.num('top', 80);
            const gap = this.num('gap', 16);
            const cards = Array.from(this.children);
            cards.forEach((c, i) => {
                c.style.top = `${top + i * gap}px`;
                c.style.zIndex = String(i + 1);
            });
            if (this.reduced)
                return;
            const schedule = () => {
                if (!this._frame)
                    this._frame = base.raf(() => this.update());
            };
            let active = false;
            this.inView((v) => {
                if (v && !active) {
                    active = true;
                    window.addEventListener('scroll', schedule, { passive: true });
                    window.addEventListener('resize', schedule, { passive: true });
                    schedule();
                }
                else if (!v && active) {
                    active = false;
                    window.removeEventListener('scroll', schedule);
                    window.removeEventListener('resize', schedule);
                }
            });
            this.onCleanup(() => {
                window.removeEventListener('scroll', schedule);
                window.removeEventListener('resize', schedule);
            });
        }
        unmount() {
            base.caf(this._frame);
            this._frame = 0;
        }
        update() {
            this._frame = 0;
            const cards = Array.from(this.children);
            const rects = cards.map((c) => c.getBoundingClientRect());
            const shrink = this.num('scale', 0.06);
            cards.forEach((c, i) => {
                let covered = 0;
                for (let j = i + 1; j < cards.length; j++) {
                    const h = rects[i].height || 1;
                    covered += base.clamp((rects[i].bottom - rects[j].top) / h, 0, 1);
                }
                const s = 1 - Math.min(3, covered) * shrink;
                c.style.transform = covered > 0.001 ? `scale(${s.toFixed(4)})` : '';
                c.style.filter = covered > 0.001 ? `brightness(${(1 - Math.min(0.35, covered * 0.12)).toFixed(3)})` : '';
            });
        }
    }, { id: 'sticky-stack', text: css$1 });
}

var css = "usa-carousel-3d{position:relative;display:grid;place-items:center;perspective:var(--usa-c3d-perspective,1200px);transform-style:preserve-3d;touch-action:pan-y;user-select:none;-webkit-user-select:none;min-height:220px}usa-carousel-3d>*{grid-area:1 / 1;backface-visibility:hidden;transition:opacity 0.3s ease;cursor:pointer}usa-carousel-3d>[aria-current]{cursor:default}usa-carousel-3d:focus-visible{outline:2px solid var(--usa-accent,#7c5cff);outline-offset:4px;border-radius:12px}@media (prefers-reduced-motion:reduce){usa-carousel-3d{perspective:none}usa-carousel-3d>:not([aria-current]){visibility:hidden}}";

function defineCarousel3d(tag = 'usa-carousel-3d') {
    return base.defineElement(tag, (Base) => class UsaCarousel3d extends Base {
        constructor() {
            super(...arguments);
            this._i = 0;
        }
        static get observedAttributes() {
            return ['radius', 'perspective', 'autoplay'];
        }
        get index() {
            return this._i;
        }
        set index(v) {
            this.goTo(v);
        }
        items() {
            return Array.from(this.children);
        }
        render(angle) {
            const items = this.items();
            const n = items.length || 1;
            const step = 360 / n;
            const w = items[0]?.offsetWidth || 200;
            const r = this.num('radius', Math.round(w / 2 / Math.tan(Math.PI / n)) + 24);
            const reduced = this.reduced;
            items.forEach((it, i) => {
                const norm = ((((i * step - angle) % 360) + 540) % 360) - 180;
                it.style.transform = reduced ? '' : `rotateY(${norm.toFixed(2)}deg) translateZ(${r}px)`;
                it.style.opacity = reduced ? (i === this._i ? '1' : '0') : String(Math.max(0.25, 1 - Math.abs(norm) / 200));
            });
        }
        mount() {
            this.style.setProperty('--usa-c3d-perspective', `${this.num('perspective', 1200)}px`);
            if (!this.hasAttribute('tabindex'))
                this.tabIndex = 0;
            this.setAttribute('role', 'region');
            this.setAttribute('aria-roledescription', 'carousel');
            this._i = Math.max(0, Math.min(this.items().length - 1, this.num('index', 0)));
            const step = () => 360 / (this.items().length || 1);
            this._angle = spring.createSpring({ value: this._i * step(), spring: 'gentle', onUpdate: (v) => this.render(v) });
            this.render(this._angle.value);
            this.mark();
            this.listen(this, 'keydown', (e) => {
                if (e.key === 'ArrowRight')
                    this.next();
                else if (e.key === 'ArrowLeft')
                    this.prev();
                else
                    return;
                e.preventDefault();
            });
            let x0 = null;
            this.listen(this, 'pointerdown', (e) => (x0 = e.clientX));
            this.listen(this, 'pointerup', (e) => {
                if (x0 === null)
                    return;
                const dx = e.clientX - x0;
                x0 = null;
                if (Math.abs(dx) > 40)
                    dx < 0 ? this.next() : this.prev();
            });
            this.listen(this, 'click', (e) => {
                const it = this.items().find((c) => c.contains(e.target));
                if (it) {
                    const i = this.items().indexOf(it);
                    if (i !== this._i)
                        this.goTo(i);
                }
            });
            const every = this.num('autoplay', 0);
            if (every > 0 && !this.reduced) {
                let paused = false;
                const pause = () => (paused = true);
                const resume = () => (paused = false);
                this.listen(this, 'pointerenter', pause);
                this.listen(this, 'pointerleave', resume);
                this.listen(this, 'focusin', pause);
                this.listen(this, 'focusout', resume);
                const t = setInterval(() => !paused && !document.hidden && this.next(), every);
                this.onCleanup(() => clearInterval(t));
            }
        }
        unmount() {
            this._angle?.stop();
        }
        mark() {
            this.items().forEach((it, i) => {
                if (i === this._i)
                    it.setAttribute('aria-current', 'true');
                else
                    it.removeAttribute('aria-current');
            });
        }
        goTo(i) {
            const n = this.items().length;
            if (!n || !this._angle)
                return;
            const step = 360 / n;
            // shortest rotation from the current target
            const cur = this._angle.target;
            const curIdx = Math.round(cur / step);
            let delta = (((i - curIdx) % n) + n) % n;
            if (delta > n / 2)
                delta -= n;
            this._i = ((i % n) + n) % n;
            this._angle.set((curIdx + delta) * step);
            if (this.reduced)
                this.render(this._angle.value);
            this.mark();
            this.emit('change', { index: this._i });
        }
        next() {
            this.goTo(this._i + 1);
        }
        prev() {
            this.goTo(this._i - 1);
        }
    }, { id: 'carousel-3d', text: css });
}

/**
 * use-scroll-animate/components/cards — card effects (v2.4).
 * `<usa-card effect="flip | holo | glass | border-glow | conic-border | lift |
 * spotlight | sheen | parallax-layers | expand">` (combinable),
 * `<usa-card-stack>` (swipeable deck), `<usa-sticky-stack>` (stacking on
 * scroll) and `<usa-carousel-3d>`.
 */
/** Register every component of this category under its default tag. */
function defineCardComponents() {
    defineCard();
    defineCardStack();
    defineStickyStack();
    defineCarousel3d();
}

exports.configureComponents = base.configureComponents;
exports.prefersReducedMotion = base.prefersReducedMotion;
exports.CARD_EFFECTS = CARD_EFFECTS;
exports.defineCard = defineCard;
exports.defineCardComponents = defineCardComponents;
exports.defineCardStack = defineCardStack;
exports.defineCarousel3d = defineCarousel3d;
exports.defineStickyStack = defineStickyStack;
//# sourceMappingURL=cards.cjs.map
