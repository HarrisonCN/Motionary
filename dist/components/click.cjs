'use strict';

var base = require('../chunks/base-Dm6ee5ug.cjs');
var spring = require('../chunks/spring-Dp5BllPB.cjs');

/**
 * Click-effect helpers (v2.5): `burst()`, `confetti()`, `shake()`, `haptic()`.
 * Particles live in one fixed, pointer-transparent layer and are removed when
 * their animation ends. Under reduced motion particles are skipped and
 * `shake()` only flashes an outline.
 */
let layer = null;
function fxLayer() {
    if (layer && layer.isConnected)
        return layer;
    layer = document.createElement('div');
    layer.className = 'usa-fx-layer';
    layer.setAttribute('aria-hidden', 'true');
    layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483000;overflow:hidden;contain:strict';
    document.body.appendChild(layer);
    return layer;
}
const PALETTE = ['#7c5cff', '#22d3ee', '#f472b6', '#facc15', '#34d399', '#fb923c'];
const GLYPH = { star: '★', heart: '♥' };
function particle(x, y, size, color, shape) {
    const p = document.createElement('span');
    const glyph = GLYPH[shape] || (shape !== 'circle' && shape !== 'square' ? shape : '');
    p.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;margin:${-size / 2}px 0 0 ${-size / 2}px;will-change:transform,opacity;` +
        (glyph ? `font-size:${size * 2}px;line-height:${size}px;text-align:center;color:${color}` : `background:${color};border-radius:${shape === 'square' ? '2px' : '50%'}`);
    if (glyph)
        p.textContent = glyph;
    fxLayer().appendChild(p);
    return p;
}
const done = (a, el) => {
    if (a)
        a.onfinish = () => el.remove();
    else
        el.remove();
};
/** Particles radiating from client point (x, y). Returns the number spawned. */
function burst(x, y, options = {}) {
    if (typeof document === 'undefined' || base.prefersReducedMotion())
        return 0;
    const { count = 12, colors = PALETTE, distance = 48, size = 6, shape = 'circle', duration = 600 } = options;
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
        const d = distance * (0.7 + Math.random() * 0.5);
        const p = particle(x, y, size, colors[i % colors.length], shape);
        const a = typeof p.animate === 'function'
            ? p.animate([
                { transform: 'translate(0,0) scale(1)', opacity: 1 },
                { transform: `translate(${Math.cos(angle) * d}px, ${Math.sin(angle) * d}px) scale(0.2)`, opacity: 0 },
            ], { duration: duration * (0.8 + Math.random() * 0.4), easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' })
            : null;
        done(a, p);
    }
    return count;
}
/** A confetti cannon (paper pieces with gravity, drift and spin). */
function confetti(options = {}) {
    if (typeof document === 'undefined' || base.prefersReducedMotion())
        return 0;
    const W = window.innerWidth || 800;
    const H = window.innerHeight || 600;
    const { x = W / 2, y = H * 0.66, count = 80, spread = 70, velocity = 1, colors = PALETTE, duration = 1600 } = options;
    for (let i = 0; i < count; i++) {
        const angle = ((-90 + (Math.random() - 0.5) * spread) * Math.PI) / 180;
        const speed = (260 + Math.random() * 320) * velocity;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        const p = particle(x, y, 6 + Math.random() * 5, colors[i % colors.length], Math.random() > 0.5 ? 'square' : 'circle');
        p.style.height = `${4 + Math.random() * 3}px`;
        const frames = [];
        const steps = 8;
        const T = duration / 1000;
        const spin = (Math.random() - 0.5) * 1440;
        for (let s = 0; s <= steps; s++) {
            const t = (s / steps) * T;
            const g = 900;
            frames.push({
                transform: `translate(${(vx * t * 0.8).toFixed(1)}px, ${(vy * t + 0.5 * g * t * t).toFixed(1)}px) rotate(${((spin * s) / steps).toFixed(0)}deg) rotateX(${s * 120}deg)`,
                opacity: s === steps ? 0 : 1,
            });
        }
        const a = typeof p.animate === 'function' ? p.animate(frames, { duration: duration * (0.85 + Math.random() * 0.3), easing: 'linear', fill: 'forwards' }) : null;
        done(a, p);
    }
    return count;
}
/** Horizontal error shake (`intensity` px, default 8). Reduced motion: a red outline flash. */
function shake(el, intensity = 8, duration = 480) {
    const t = el;
    if (typeof t.animate !== 'function')
        return null;
    if (base.prefersReducedMotion())
        return t.animate([{ outline: '2px solid #e5484d' }, { outline: '2px solid transparent' }], { duration: 600 });
    const k = intensity;
    return t.animate([0, -k, k, -k * 0.75, k * 0.75, -k * 0.4, k * 0.4, 0].map((v) => ({ transform: `translateX(${v}px)` })), { duration, easing: 'ease-in-out' });
}
/** `navigator.vibrate()` where supported (Android Chrome, some WebViews). Returns whether it ran. */
function haptic(pattern = 10) {
    try {
        return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function' ? navigator.vibrate(pattern) : false;
    }
    catch {
        return false;
    }
}

var css$6 = "usa-click{position:relative;display:inline-block;overflow:hidden;isolation:isolate;border-radius:inherit;-webkit-tap-highlight-color:transparent;touch-action:manipulation}usa-click[block]{display:block}usa-click .usa-click-wave{position:absolute;border-radius:50%;pointer-events:none;z-index:-1;transform:scale(0);background:radial-gradient(circle,var(--usa-wave) 0 55%,color-mix(in srgb,var(--usa-wave) 40%,transparent) 70%,transparent 72%)}";

const CLICK_EFFECTS = ['ripple', 'burst', 'confetti', 'squish', 'press-spring', 'shake'];
function defineClick(tag = 'usa-click') {
    return base.defineElement(tag, (Base) => class UsaClick extends Base {
        constructor() {
            super(...arguments);
            this._press = null;
        }
        static get observedAttributes() {
            return ['effect', 'disabled'];
        }
        get effects() {
            return this.str('effect', 'ripple').split(/[\s,]+/).filter(Boolean);
        }
        mount() {
            this.listen(this, 'pointerdown', (e) => {
                if (this.flag('disabled') || (e.pointerType === 'mouse' && e.button !== 0))
                    return;
                this.down();
                if (this.effects.includes('ripple'))
                    this.ripple(e.clientX, e.clientY);
            });
            const up = () => this.up();
            this.listen(this, 'pointerup', up);
            this.listen(this, 'pointerleave', up);
            this.listen(this, 'pointercancel', up);
            this.listen(this, 'click', (e) => {
                if (this.flag('disabled'))
                    return;
                const kb = e.detail === 0;
                const r = this.getBoundingClientRect();
                const x = kb ? r.left + r.width / 2 : e.clientX;
                const y = kb ? r.top + r.height / 2 : e.clientY;
                if (kb && this.effects.includes('ripple'))
                    this.ripple(x, y);
                this.play(x, y);
                if (this.effects.includes('shake') && this.str('trigger') === 'click')
                    this.shake();
            });
            this.listen(this, 'keydown', (e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !e.repeat)
                    this.down();
            });
            this.listen(this, 'keyup', up);
            if (this.effects.includes('shake'))
                this.listen(this, 'invalid', () => this.shake(), { capture: true });
        }
        /** Particles + haptics at client (x, y) (default: centre). */
        play(x, y) {
            if (x === undefined || y === undefined) {
                const r = this.getBoundingClientRect();
                x = r.left + r.width / 2;
                y = r.top + r.height / 2;
            }
            const fx = this.effects;
            const colors = this.str('color') ? this.str('color').split(',') : undefined;
            if (fx.includes('burst'))
                burst(x, y, { count: this.num('count', 12), shape: this.str('shape', 'circle'), colors });
            if (fx.includes('confetti'))
                confetti({ x, y, count: this.num('count', 60), colors, spread: 90, velocity: 0.8 });
            if (this.hasAttribute('haptic'))
                haptic(this.num('haptic', 10));
            this.emit('click-effect', { x, y, effects: fx });
        }
        shake() {
            shake(this);
            if (this.hasAttribute('haptic'))
                haptic([30, 40, 30]);
        }
        ripple(x, y) {
            if (this.reduced)
                return;
            const r = this.getBoundingClientRect();
            const cx = x - r.left;
            const cy = y - r.top;
            const radius = Math.hypot(Math.max(cx, r.width - cx), Math.max(cy, r.height - cy));
            const wave = document.createElement('span');
            wave.className = 'usa-click-wave';
            wave.setAttribute('aria-hidden', 'true');
            wave.style.cssText = `width:${radius * 2}px;height:${radius * 2}px;left:${cx - radius}px;top:${cy - radius}px;--usa-wave:${this.str('color', 'currentColor').split(',')[0]}`;
            this.append(wave);
            const a = this.motion(wave, [{ transform: 'scale(0)', opacity: 0.35 }, { transform: 'scale(1)', opacity: 0.25, offset: 0.6 }, { transform: 'scale(1.05)', opacity: 0 }], {
                duration: 650,
                easing: base.EASE_OUT,
                fill: 'forwards',
            });
            if (a)
                a.onfinish = () => wave.remove();
            else
                wave.remove();
        }
        down() {
            if (this.hasAttribute('data-pressed'))
                return;
            const fx = this.effects;
            if (!fx.includes('squish') && !fx.includes('press-spring'))
                return;
            this.setAttribute('data-pressed', '');
            this._press?.cancel();
            const to = this.reduced ? { opacity: 0.75 } : fx.includes('squish') ? { transform: 'scale(1.08, 0.86)' } : { transform: 'scale(0.94)' };
            const from = this.reduced ? { opacity: 1 } : { transform: 'none' };
            this._press = this.motion(this, [from, to], {
                duration: 110,
                easing: 'ease-out',
                fill: 'forwards',
            });
        }
        up() {
            if (!this.hasAttribute('data-pressed'))
                return;
            this.removeAttribute('data-pressed');
            const fx = this.effects;
            this._press?.cancel();
            if (this.reduced) {
                this._press = this.motion(this, [{ opacity: 0.75 }, { opacity: 1 }], { duration: 150 });
                return;
            }
            const from = fx.includes('squish') ? 'scale(1.08, 0.86)' : 'scale(0.94)';
            const frames = fx.includes('squish')
                ? [{ transform: from }, { transform: 'scale(0.92, 1.1)', offset: 0.3 }, { transform: 'scale(1.03, 0.97)', offset: 0.6 }, { transform: 'none' }]
                : [{ transform: from }, { transform: 'none' }];
            this._press = this.motion(this, frames, fx.includes('squish') ? { duration: 520, easing: 'ease-out' } : spring.springEasing('bouncy'));
        }
    }, { id: 'click', text: css$6 });
}

var css$5 = "usa-button{position:relative;display:inline-block;isolation:isolate;-webkit-tap-highlight-color:transparent;touch-action:manipulation;vertical-align:middle}usa-button[role=\"button\"]{cursor:pointer}usa-button .usa-button-face{position:relative;overflow:hidden;will-change:transform;transform-origin:50% 60%;white-space:nowrap}usa-button[deform~=\"gooey\"] .usa-button-face{overflow:visible}usa-button[deform~=\"dent\"] .usa-button-face::after{content:\"\";position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;transition:opacity 0.2s ease;background:radial-gradient(circle at var(--usa-dent-x,50%) var(--usa-dent-y,50%),rgb(0 0 0 / 0.28),transparent 60%)}usa-button[deform~=\"dent\"][data-pressed] .usa-button-face::after{opacity:1}usa-button .usa-button-goo{position:absolute;inset:0;z-index:-1;pointer-events:none;filter:url(#usa-goo)}usa-button .usa-button-goo i{position:absolute;width:22px;height:22px;border-radius:50%;background:var(--usa-goo-bg);transform:translate(-50%,-50%) scale(0.4)}usa-button .usa-button-face[data-shape=\"circle\"],usa-button .usa-button-face[data-shape=\"icon\"]{padding-inline:0;aspect-ratio:1;border-radius:999px;display:inline-grid;place-items:center}usa-button .usa-button-face [data-label],usa-button .usa-button-face [data-icon]{transition:opacity 0.2s ease}usa-button .usa-button-face[data-shape=\"circle\"] [data-label],usa-button .usa-button-face[data-shape=\"icon\"] [data-label]{position:absolute;opacity:0;pointer-events:none}usa-button .usa-button-face[data-shape=\"circle\"] [data-icon]{opacity:0}usa-button .usa-button-status{position:absolute;inset:0;display:grid;place-items:center;pointer-events:none}usa-button .usa-button-status svg{grid-area:1 / 1;width:1.25em;height:1.25em;fill:none;stroke:currentColor;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round;opacity:0}usa-button .usa-button-spin circle{stroke-dasharray:60 100;transform-origin:50% 50%;animation:usa-btn-spin 0.8s linear infinite}usa-button .usa-button-ok path,usa-button .usa-button-err path{stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset 0.35s ease 0.1s}usa-button .usa-button-face[data-state=\"loading\"] .usa-button-spin,usa-button .usa-button-face[data-state=\"success\"] .usa-button-ok,usa-button .usa-button-face[data-state=\"error\"] .usa-button-err{opacity:1}usa-button .usa-button-face[data-state=\"success\"] .usa-button-ok path,usa-button .usa-button-face[data-state=\"error\"] .usa-button-err path{stroke-dashoffset:0}usa-button .usa-button-face:is([data-state=\"loading\"],[data-state=\"success\"],[data-state=\"error\"])>:not(.usa-button-status){opacity:0}usa-button .usa-button-face[data-state=\"success\"]{background:#16a34a;border-color:#16a34a;color:#fff}usa-button .usa-button-face[data-state=\"error\"]{background:#e5484d;border-color:#e5484d;color:#fff}usa-button .usa-button-face[data-state]{transition:background-color 0.25s ease,color 0.25s ease,border-radius 0.3s ease}@keyframes usa-btn-spin{to{transform:rotate(360deg)}}@media (prefers-reduced-motion:reduce){usa-button .usa-button-spin circle{animation-duration:2.4s}usa-button .usa-button-face,usa-button .usa-button-face *{transition:none !important}}";

const BUTTON_DEFORMS = ['squash', 'wobble', 'gooey', 'dent'];
let gooInjected = false;
function injectGoo() {
    if (gooInjected || typeof document === 'undefined')
        return;
    gooInjected = true;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.style.position = 'absolute';
    svg.innerHTML = '<filter id="usa-goo"><feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b"/><feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" result="g"/><feComposite in="SourceGraphic" in2="g" operator="atop"/></filter>';
    document.body.appendChild(svg);
}
function defineButton(tag = 'usa-button') {
    return base.defineElement(tag, (Base) => class UsaButton extends Base {
        constructor() {
            super(...arguments);
            this._press = null;
            this._status = null;
            this._shapeBefore = null;
        }
        static get observedAttributes() {
            return ['deform', 'state', 'shape', 'disabled'];
        }
        get target() {
            return this.querySelector(':scope > button, :scope > a, :scope > [role="button"]') || this;
        }
        deforms() {
            return this.str('deform').split(/[\s,]+/).filter(Boolean);
        }
        get shape() {
            return this.str('shape', 'pill') || 'pill';
        }
        set shape(v) {
            this.morphTo(v);
        }
        get state() {
            return this.str('state', 'idle') || 'idle';
        }
        set state(v) {
            this.setAttribute('state', v);
        }
        mount() {
            const t = this.target;
            if (t === this) {
                this.setAttribute('role', 'button');
                if (!this.hasAttribute('tabindex'))
                    this.tabIndex = 0;
            }
            t.classList.add('usa-button-face');
            if (this.str('morph') === 'submit' && !t.querySelector('.usa-button-status')) {
                const s = document.createElement('span');
                s.className = 'usa-button-status';
                s.setAttribute('aria-hidden', 'true');
                s.innerHTML =
                    '<svg class="usa-button-spin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" pathLength="100"/></svg>' +
                        '<svg class="usa-button-ok" viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7" pathLength="1"/></svg>' +
                        '<svg class="usa-button-err" viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17" pathLength="1"/></svg>';
                t.append(s);
                const live = document.createElement('span');
                live.className = 'usa-sr';
                live.setAttribute('role', 'status');
                this.append(live);
                this._status = live;
            }
            if (this.deforms().includes('gooey'))
                injectGoo();
            this.applyState();
            this.listen(t, 'pointerdown', (e) => {
                if (this.isOff() || (e.pointerType === 'mouse' && e.button !== 0))
                    return;
                this.down(e.clientX, e.clientY);
            });
            for (const ev of ['pointerup', 'pointerleave', 'pointercancel'])
                this.listen(t, ev, () => this.up());
            this.listen(t, 'keydown', (e) => (e.key === 'Enter' || e.key === ' ') && !e.repeat && this.down());
            this.listen(t, 'keyup', () => this.up());
            this.listen(t, 'click', (e) => {
                if (this.isOff()) {
                    if (this.state === 'loading')
                        e.preventDefault();
                    return;
                }
                if (this.deforms().includes('wobble'))
                    this.wobble();
                if (this.hasAttribute('haptic'))
                    haptic(this.num('haptic', 10));
                if (this.str('morph') === 'submit' && this.state === 'idle')
                    this.submit();
            });
            if (t === this)
                this.listen(this, 'keydown', (e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
                        e.preventDefault();
                        this.click();
                    }
                });
        }
        unmount() {
            clearTimeout(this._timer);
            this._press?.cancel();
        }
        changed(name) {
            if (name === 'state')
                this.applyState();
            else if (name === 'shape')
                this.target.setAttribute('data-shape', this.shape);
            else {
                super.changed(name);
            }
        }
        isOff() {
            return this.flag('disabled') || this.state === 'loading';
        }
        /* ------------------------------------------------ press deformations */
        down(x, y) {
            if (this.reduced || this.hasAttribute('data-pressed'))
                return;
            const d = this.deforms();
            if (!d.length)
                return;
            this.setAttribute('data-pressed', '');
            const t = this.target;
            const r = t.getBoundingClientRect();
            const px = x === undefined ? 0.5 : base.clamp((x - r.left) / (r.width || 1), 0, 1);
            const py = y === undefined ? 0.5 : base.clamp((y - r.top) / (r.height || 1), 0, 1);
            t.style.setProperty('--usa-dent-x', `${(px * 100).toFixed(1)}%`);
            t.style.setProperty('--usa-dent-y', `${(py * 100).toFixed(1)}%`);
            const parts = [];
            if (d.includes('dent'))
                parts.push(`perspective(600px) rotateX(${((0.5 - py) * -14).toFixed(2)}deg) rotateY(${((px - 0.5) * 14).toFixed(2)}deg) scale(0.97)`);
            if (d.includes('squash'))
                parts.push('scale(1.12, 0.84)');
            if (d.includes('gooey')) {
                parts.push('scale(0.96)');
                this.goo(px, py);
            }
            if (!parts.length)
                return;
            this._press?.cancel();
            this._press = this.motion(t, [{ transform: 'none' }, { transform: parts.join(' ') }], { duration: 110, easing: 'ease-out', fill: 'forwards' });
        }
        up() {
            if (!this.hasAttribute('data-pressed'))
                return;
            this.removeAttribute('data-pressed');
            const t = this.target;
            const a = this._press;
            const from = a?.effect?.getKeyframes?.().slice(-1)[0]?.transform;
            a?.cancel();
            if (!from)
                return;
            this._press = this.motion(t, [{ transform: from }, { transform: 'none' }], { ...spring.springEasing(this.deforms().includes('squash') ? 'bouncy' : 'wobbly') });
        }
        wobble() {
            if (this.reduced)
                return;
            const t = this.target;
            const r = getComputedStyle(t).borderRadius || '12px';
            this.motion(t, [
                { borderRadius: r },
                { borderRadius: '42% 58% 50% 50% / 60% 45% 55% 40%', offset: 0.2 },
                { borderRadius: '58% 42% 45% 55% / 40% 60% 40% 60%', offset: 0.45 },
                { borderRadius: '48% 52% 52% 48% / 52% 48% 52% 48%', offset: 0.7 },
                { borderRadius: r },
            ], { duration: 700, easing: 'ease-out' });
        }
        goo(px, py) {
            const t = this.target;
            const layer = document.createElement('span');
            layer.className = 'usa-button-goo';
            layer.setAttribute('aria-hidden', 'true');
            layer.style.setProperty('--usa-goo-bg', getComputedStyle(t).backgroundColor || 'currentColor');
            const drops = [];
            for (let i = 0; i < 4; i++) {
                const d = document.createElement('i');
                d.style.left = `${(px * 100).toFixed(1)}%`;
                d.style.top = `${(py * 100).toFixed(1)}%`;
                layer.append(d);
                drops.push(d);
            }
            this.prepend(layer);
            let left = drops.length;
            drops.forEach((d, i) => {
                const ang = (i / drops.length) * Math.PI * 2 + 0.6;
                const dist = 26 + (i % 2) * 12;
                const a = this.motion(d, [
                    { transform: 'translate(-50%, -50%) scale(0.4)' },
                    { transform: `translate(calc(-50% + ${(Math.cos(ang) * dist).toFixed(1)}px), calc(-50% + ${(Math.sin(ang) * dist).toFixed(1)}px)) scale(1)`, offset: 0.45 },
                    { transform: 'translate(-50%, -50%) scale(0.2)' },
                ], { duration: 700, easing: 'cubic-bezier(0.34, 1.3, 0.64, 1)', fill: 'forwards' });
                const end = () => --left === 0 && layer.remove();
                if (a)
                    a.onfinish = end;
                else
                    end();
            });
        }
        /* ------------------------------------------------ shape morph */
        async morphTo(shape) {
            const t = this.target;
            const before = t.getBoundingClientRect();
            this.setAttribute('shape', shape);
            t.setAttribute('data-shape', shape);
            if (this.reduced)
                return;
            const after = t.getBoundingClientRect();
            if (!before.width || !after.width || Math.abs(before.width - after.width) < 0.5)
                return;
            const a = this.motion(t, [{ width: `${before.width}px` }, { width: `${after.width}px` }], spring.springEasing('stiff'));
            await a?.finished.catch(() => undefined);
        }
        /* ------------------------------------------------ submit morph */
        submit() {
            let settled = false;
            const done = (ok = true) => {
                if (settled)
                    return;
                settled = true;
                this.state = ok ? 'success' : 'error';
            };
            this.state = 'loading';
            this.emit('submit', { done });
        }
        applyState() {
            if (this.str('morph') !== 'submit')
                return;
            const t = this.target;
            const s = this.state;
            clearTimeout(this._timer);
            t.setAttribute('data-state', s);
            if (s === 'loading') {
                if (this._shapeBefore === null)
                    this._shapeBefore = this.shape;
                t.setAttribute('aria-busy', 'true');
                this.morphTo('circle');
            }
            else {
                t.removeAttribute('aria-busy');
            }
            if (s === 'error') {
                shake(t);
                if (this.hasAttribute('haptic'))
                    haptic([30, 40, 30]);
            }
            if (s === 'success' && !this.reduced) {
                const ok = t.querySelector('.usa-button-ok');
                if (ok)
                    this.motion(ok, [{ transform: 'scale(0.4)' }, { transform: 'scale(1)' }], spring.springEasing('bouncy'));
            }
            if (this._status)
                this._status.textContent = s === 'loading' ? 'Loading…' : s === 'success' ? 'Done' : s === 'error' ? 'Failed' : '';
            if (s === 'success' || s === 'error') {
                this._timer = setTimeout(() => {
                    this.state = 'idle';
                }, this.num('reset', 1800));
            }
            if (s === 'idle' && this._shapeBefore !== null) {
                const back = this._shapeBefore;
                this._shapeBefore = null;
                this.morphTo(back);
            }
            this.emit('state', { state: s });
        }
    }, { id: 'button', text: css$5 });
}

var css$4 = "usa-icon-morph{display:inline-grid;place-items:center;line-height:0;color:inherit;-webkit-tap-highlight-color:transparent;vertical-align:middle}usa-icon-morph svg{fill:currentColor;overflow:visible}usa-icon-morph[toggle]{cursor:pointer;border-radius:8px}usa-icon-morph[toggle]:focus-visible{outline:2px solid var(--usa-accent,#7c5cff);outline-offset:3px}";

const C = [[12, 12], [12, 12], [12, 12], [12, 12]];
/**
 * Morphable icons: every icon is three quads (four points each) on a 24×24
 * grid, so any icon can morph into any other by interpolating points.
 */
const MORPH_ICONS = {
    play: [[[7, 5], [12.5, 8.25], [12.5, 15.75], [7, 19]], [[12.5, 8.25], [19, 12], [19, 12], [12.5, 15.75]], C],
    pause: [[[6, 5], [10, 5], [10, 19], [6, 19]], [[14, 5], [18, 5], [18, 19], [14, 19]], C],
    menu: [[[4, 6], [20, 6], [20, 8], [4, 8]], [[4, 11], [20, 11], [20, 13], [4, 13]], [[4, 16], [20, 16], [20, 18], [4, 18]]],
    close: [[[5.2, 6.6], [6.6, 5.2], [18.8, 17.4], [17.4, 18.8]], C, [[17.4, 5.2], [18.8, 6.6], [6.6, 18.8], [5.2, 17.4]]],
    plus: [[[11, 4], [13, 4], [13, 20], [11, 20]], [[4, 11], [20, 11], [20, 13], [4, 13]], C],
    minus: [[[4, 11], [20, 11], [20, 13], [4, 13]], [[4, 11], [20, 11], [20, 13], [4, 13]], C],
    check: [[[4.3, 12.7], [5.7, 11.3], [10.4, 16], [9, 17.4]], [[9, 17.4], [7.6, 16], [18.3, 5.3], [19.7, 6.7]], C],
    'arrow-right': [[[4, 11], [17, 11], [17, 13], [4, 13]], [[12.6, 6.4], [14, 5], [21, 12], [19.6, 13.4]], [[19.6, 10.6], [21, 12], [14, 19], [12.6, 17.6]]],
};
/** SVG path data for an icon, or for the interpolation `t` (0–1) between two. */
function morphPath(from, to = from, t = 0) {
    const a = MORPH_ICONS[from] || MORPH_ICONS.menu;
    const b = MORPH_ICONS[to] || a;
    return a
        .map((q, i) => {
        const pts = q.map((p, j) => {
            const r = b[i][j];
            return `${(p[0] + (r[0] - p[0]) * t).toFixed(2)} ${(p[1] + (r[1] - p[1]) * t).toFixed(2)}`;
        });
        return `M${pts.join('L')}Z`;
    })
        .join('');
}
function defineIconMorph(tag = 'usa-icon-morph') {
    return base.defineElement(tag, (Base) => class UsaIconMorph extends Base {
        constructor() {
            super(...arguments);
            this._i = 0;
            this._from = 'play';
            this._to = 'play';
        }
        static get observedAttributes() {
            return ['icons', 'size', 'toggle'];
        }
        list() {
            return this.str('icons', 'play,pause').split(',').map((s) => s.trim()).filter((s) => MORPH_ICONS[s]);
        }
        get index() {
            return this._i;
        }
        set index(v) {
            this.show(v);
        }
        get icon() {
            return this.list()[this._i] || 'play';
        }
        draw(t) {
            this.querySelector('path')?.setAttribute('d', morphPath(this._from, this._to, t));
        }
        mount() {
            const size = this.num('size', 24);
            this.innerHTML = `<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true" focusable="false"><path/></svg>`;
            this._i = Math.max(0, Math.min(this.list().length - 1, this.num('index', 0)));
            this._from = this._to = this.icon;
            this._t = spring.createSpring({ value: 1, spring: this.str('preset', 'wobbly'), onUpdate: (v) => this.draw(v) });
            this.draw(1);
            if (this.flag('toggle')) {
                this.setAttribute('role', 'button');
                if (!this.hasAttribute('tabindex'))
                    this.tabIndex = 0;
                this.listen(this, 'click', () => this.next());
                this.listen(this, 'keydown', (e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
                        e.preventDefault();
                        this.next();
                    }
                });
            }
            this.label();
        }
        unmount() {
            this._t?.stop();
        }
        label() {
            const labels = this.str('labels').split(',').map((s) => s.trim());
            const l = labels[this._i];
            if (l)
                this.setAttribute('aria-label', l);
            if (!this.flag('toggle') && !l)
                this.setAttribute('aria-hidden', 'true');
        }
        show(icon) {
            const list = this.list();
            const i = typeof icon === 'number' ? ((icon % list.length) + list.length) % list.length : list.indexOf(icon);
            if (i < 0 || !this._t)
                return;
            const name = list[i];
            // morph from wherever we are now (interruptible)
            const cur = this._t.value;
            this._from = cur >= 0.5 ? this._to : this._from;
            this._to = name;
            this._i = i;
            this._t.jump(0);
            this._t.set(1);
            this.label();
            this.emit('change', { index: i, icon: name });
        }
        next() {
            this.show(this._i + 1);
        }
    }, { id: 'icon-morph', text: css$4 });
}

var css$3 = "usa-like{--usa-like-color:#f43f5e;display:inline-flex;align-items:center;gap:0.35em;cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent;vertical-align:middle}usa-like .usa-like-heart{fill:transparent;stroke:currentColor;stroke-width:1.8;transition:fill 0.2s ease,stroke 0.2s ease;overflow:visible}usa-like[liked] .usa-like-heart{fill:var(--usa-like-color);stroke:var(--usa-like-color)}usa-like .usa-like-count{font-variant-numeric:tabular-nums}usa-like[disabled]{opacity:0.5;cursor:not-allowed}usa-like:focus-visible{outline:2px solid var(--usa-like-color);outline-offset:3px;border-radius:8px}";

const HEART = 'M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.2 5.3 3.2 1.7-2 3.2-3.2 5.3-3.2 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z';
function defineLike(tag = 'usa-like') {
    return base.defineElement(tag, (Base) => class UsaLike extends Base {
        static get observedAttributes() {
            return ['liked', 'count', 'label', 'disabled'];
        }
        get liked() {
            return this.flag('liked');
        }
        set liked(v) {
            this.setFlag('liked', v);
        }
        get count() {
            return this.hasAttribute('count') ? this.num('count', 0) : null;
        }
        set count(v) {
            if (v === null)
                this.removeAttribute('count');
            else
                this.setAttribute('count', String(v));
        }
        mount() {
            if (!this.querySelector(':scope > .usa-like-heart')) {
                const size = this.num('size', 24);
                this.insertAdjacentHTML('afterbegin', `<svg class="usa-like-heart" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true"><path d="${HEART}"/></svg><span class="usa-like-count" aria-hidden="true"></span>`);
            }
            if (this.str('color'))
                this.style.setProperty('--usa-like-color', this.str('color'));
            this.setAttribute('role', 'button');
            if (!this.hasAttribute('tabindex'))
                this.tabIndex = 0;
            this.sync();
            this.listen(this, 'click', () => this.toggle());
            this.listen(this, 'keydown', (e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
                    e.preventDefault();
                    this.toggle();
                }
            });
        }
        changed() {
            this.sync();
        }
        sync() {
            const c = this.count;
            const label = this.str('label', 'Like');
            this.setAttribute('aria-pressed', String(this.liked));
            this.setAttribute('aria-label', c === null ? label : `${label} (${c})`);
            this.toggleAttribute('aria-disabled', this.flag('disabled'));
            const out = this.querySelector('.usa-like-count');
            if (out)
                out.textContent = c === null ? '' : new Intl.NumberFormat().format(c);
        }
        toggle(force) {
            if (this.flag('disabled'))
                return;
            const next = force === undefined ? !this.liked : force;
            if (next === this.liked)
                return;
            this.liked = next;
            if (this.count !== null)
                this.count = Math.max(0, this.count + (next ? 1 : -1));
            this.sync();
            const heart = this.querySelector('.usa-like-heart');
            if (next && heart && !this.reduced) {
                this.motion(heart, [{ transform: 'scale(0.4)' }, { transform: 'scale(1)' }], spring.springEasing('bouncy'));
                const r = heart.getBoundingClientRect();
                burst(r.left + r.width / 2, r.top + r.height / 2, { count: 10, distance: 28, size: 5, colors: [getComputedStyle(this).getPropertyValue('--usa-like-color').trim() || '#f43f5e', '#fb923c', '#facc15'] });
            }
            if (this.hasAttribute('haptic'))
                haptic(this.num('haptic', 12));
            this.dispatchEvent(new Event('change', { bubbles: true }));
            this.emit('change', { liked: next, count: this.count });
        }
    }, { id: 'like', text: css$3 });
}

var css$2 = "usa-hold{--usa-hold-color:#e5484d;position:relative;display:inline-flex;align-items:center;gap:0.5em;cursor:pointer;user-select:none;-webkit-user-select:none;touch-action:manipulation;-webkit-tap-highlight-color:transparent}usa-hold .usa-hold-ring{width:1.6em;height:1.6em;transform:rotate(-90deg);flex:none}usa-hold .usa-hold-ring circle{fill:none;stroke-width:3.5;stroke-linecap:round}usa-hold .usa-hold-ring circle:first-child{stroke:color-mix(in srgb,currentColor 18%,transparent)}usa-hold .usa-hold-ring circle:last-child{stroke:var(--usa-hold-color);stroke-dasharray:100;stroke-dashoffset:100}usa-hold[data-holding]{transform:scale(calc(1 - var(--usa-hold,0) * 0.05))}usa-hold[data-done] .usa-hold-ring{animation:usa-hold-pop 0.4s cubic-bezier(0.34,1.56,0.64,1)}@keyframes usa-hold-pop{50%{transform:rotate(-90deg) scale(1.3)}}usa-hold[disabled]{opacity:0.5;cursor:not-allowed}usa-hold:focus-visible{outline:2px solid var(--usa-hold-color);outline-offset:3px;border-radius:10px}@media (prefers-reduced-motion:reduce){usa-hold[data-holding]{transform:none}usa-hold[data-done] .usa-hold-ring{animation:none}}";

function defineHold(tag = 'usa-hold') {
    return base.defineElement(tag, (Base) => class UsaHold extends Base {
        constructor() {
            super(...arguments);
            this._p = 0;
            this._frame = 0;
            this._holding = false;
        }
        static get observedAttributes() {
            return ['duration', 'disabled'];
        }
        get progress() {
            return this._p;
        }
        set(p) {
            this._p = p;
            this.style.setProperty('--usa-hold', p.toFixed(4));
            const c = this.querySelector('.usa-hold-ring circle:last-child');
            if (c)
                c.style.strokeDashoffset = String(100 - p * 100);
        }
        mount() {
            if (!this.querySelector(':scope > .usa-hold-ring')) {
                this.insertAdjacentHTML('beforeend', '<svg class="usa-hold-ring" viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="15.9" pathLength="100"/><circle cx="18" cy="18" r="15.9" pathLength="100"/></svg>');
            }
            if (this.str('color'))
                this.style.setProperty('--usa-hold-color', this.str('color'));
            this.setAttribute('role', 'button');
            if (!this.hasAttribute('tabindex'))
                this.tabIndex = 0;
            if (this.str('label'))
                this.setAttribute('aria-label', this.str('label'));
            this.setAttribute('aria-description', 'Press and hold to confirm');
            this.set(0);
            this.listen(this, 'pointerdown', (e) => (e.pointerType !== 'mouse' || e.button === 0) && this.start());
            for (const t of ['pointerup', 'pointerleave', 'pointercancel'])
                this.listen(this, t, () => this.stop());
            this.listen(this, 'keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (!e.repeat)
                        this.start();
                }
            });
            this.listen(this, 'keyup', (e) => (e.key === 'Enter' || e.key === ' ') && this.stop());
            this.listen(this, 'contextmenu', (e) => this._holding && e.preventDefault());
        }
        unmount() {
            base.caf(this._frame);
            this._holding = false;
        }
        start() {
            if (this.flag('disabled') || this._holding)
                return;
            this._holding = true;
            this.setAttribute('data-holding', '');
            const dur = Math.max(100, this.num('duration', 1200));
            let last = base.now();
            const tick = () => {
                const t = base.now();
                const p = Math.min(1, this._p + (t - last) / dur);
                last = t;
                this.set(p);
                this.emit('progress', { progress: p });
                if (p >= 1) {
                    this._holding = false;
                    this.removeAttribute('data-holding');
                    this.setAttribute('data-done', '');
                    if (this.hasAttribute('haptic'))
                        haptic(20);
                    this.emit('confirm');
                    setTimeout(() => {
                        this.removeAttribute('data-done');
                        this.rewind();
                    }, 700);
                    return;
                }
                this._frame = base.raf(tick);
            };
            this._frame = base.raf(tick);
        }
        stop() {
            if (!this._holding)
                return;
            this._holding = false;
            base.caf(this._frame);
            this.removeAttribute('data-holding');
            if (this._p < 1) {
                this.emit('cancel', { progress: this._p });
                this.rewind();
            }
        }
        rewind() {
            let last = base.now();
            const back = () => {
                if (this._holding)
                    return;
                const t = base.now();
                const p = Math.max(0, this._p - (t - last) / 250);
                last = t;
                this.set(p);
                if (p > 0)
                    this._frame = base.raf(back);
            };
            this._frame = base.raf(back);
        }
        cancel() {
            this.stop();
        }
    }, { id: 'hold', text: css$2 });
}

var css$1 = "usa-double-tap{position:relative;display:block;touch-action:manipulation;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none}usa-double-tap .usa-double-tap-icon{position:absolute;pointer-events:none;font-size:64px;line-height:1;color:#f43f5e;transform:translate(-50%,-50%);text-shadow:0 6px 18px rgb(0 0 0 / 0.35);z-index:2}";

function defineDoubleTap(tag = 'usa-double-tap') {
    return base.defineElement(tag, (Base) => class UsaDoubleTap extends Base {
        mount() {
            let last = 0;
            let lx = 0;
            let ly = 0;
            this.listen(this, 'pointerup', (e) => {
                if (this.flag('disabled'))
                    return;
                const t = e.timeStamp || Date.now();
                if (t - last < this.num('delay', 300) && Math.hypot(e.clientX - lx, e.clientY - ly) < 40) {
                    last = 0;
                    this.pop(e.clientX, e.clientY);
                }
                else {
                    last = t;
                    lx = e.clientX;
                    ly = e.clientY;
                }
            });
            this.listen(this, 'dblclick', (e) => e.preventDefault());
            this.listen(this, 'keydown', (e) => e.key.toLowerCase() === 'l' && !e.repeat && this.pop());
        }
        pop(x, y) {
            const r = this.getBoundingClientRect();
            if (x === undefined || y === undefined) {
                x = r.left + r.width / 2;
                y = r.top + r.height / 2;
            }
            const icon = document.createElement('span');
            icon.className = 'usa-double-tap-icon';
            icon.setAttribute('aria-hidden', 'true');
            icon.textContent = this.str('icon', '♥');
            icon.style.left = `${x - r.left}px`;
            icon.style.top = `${y - r.top}px`;
            if (this.str('color'))
                icon.style.color = this.str('color');
            this.append(icon);
            const frames = this.reduced
                ? [{ opacity: 0 }, { opacity: 1, offset: 0.3 }, { opacity: 0 }]
                : [
                    { opacity: 0, transform: 'translate(-50%, -50%) scale(0.2) rotate(-15deg)' },
                    { opacity: 1, transform: 'translate(-50%, -50%) scale(1.15) rotate(5deg)', offset: 0.3 },
                    { opacity: 1, transform: 'translate(-50%, -50%) scale(1) rotate(0deg)', offset: 0.6 },
                    { opacity: 0, transform: 'translate(-50%, -110%) scale(0.9)' },
                ];
            const a = this.motion(icon, frames, { duration: 900, easing: 'ease-out', fill: 'forwards' });
            if (a)
                a.onfinish = () => icon.remove();
            else
                icon.remove();
            burst(x, y, { count: 8, distance: 40, size: 5, colors: [this.str('color', '#f43f5e'), '#fb923c', '#facc15'] });
            if (this.hasAttribute('haptic'))
                haptic(15);
            this.emit('double-tap', { x: x - r.left, y: y - r.top });
        }
    }, { id: 'double-tap', text: css$1 });
}

var css = "usa-checkbox{--usa-checkbox-on:var(--usa-accent,#7c5cff);display:inline-flex;align-items:center;gap:0.55em;cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent;vertical-align:middle}usa-checkbox .usa-checkbox-box{flex:none;width:1.25em;height:1.25em;border-radius:0.3em;border:1.5px solid color-mix(in srgb,currentColor 55%,transparent);display:grid;place-items:center;transition:background-color 0.2s ease,border-color 0.2s ease;box-sizing:border-box}usa-checkbox[shape=\"circle\"] .usa-checkbox-box{border-radius:50%}usa-checkbox svg{width:85%;height:85%;fill:none;stroke:#fff;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}usa-checkbox svg path{stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset 0.28s cubic-bezier(0.65,0,0.35,1) 0.05s}usa-checkbox[checked]:not([indeterminate]) .usa-checkbox-check,usa-checkbox[indeterminate] .usa-checkbox-dash{stroke-dashoffset:0}usa-checkbox[checked] .usa-checkbox-box,usa-checkbox[indeterminate] .usa-checkbox-box{background:var(--usa-checkbox-on);border-color:var(--usa-checkbox-on)}usa-checkbox[disabled]{opacity:0.45;cursor:not-allowed}usa-checkbox:focus-visible{outline:none}usa-checkbox:focus-visible .usa-checkbox-box{outline:2px solid var(--usa-checkbox-on);outline-offset:2px}@media (prefers-reduced-motion:reduce){usa-checkbox svg path,usa-checkbox .usa-checkbox-box{transition:none}}";

function defineCheckbox(tag = 'usa-checkbox') {
    return base.defineElement(tag, (Base) => {
        class UsaCheckbox extends Base {
            static get observedAttributes() {
                return ['checked', 'indeterminate', 'disabled', 'label'];
            }
            constructor() {
                super();
                this._internals = null;
                try {
                    this._internals = this.attachInternals?.() ?? null;
                }
                catch {
                    this._internals = null;
                }
            }
            get checked() {
                return this.flag('checked');
            }
            set checked(v) {
                this.setFlag('checked', v);
            }
            get indeterminate() {
                return this.flag('indeterminate');
            }
            set indeterminate(v) {
                this.setFlag('indeterminate', v);
            }
            mount() {
                if (!this.querySelector(':scope > .usa-checkbox-box')) {
                    this.insertAdjacentHTML('afterbegin', '<span class="usa-checkbox-box" aria-hidden="true"><svg viewBox="0 0 24 24"><path class="usa-checkbox-check" d="M5 12.5l4.2 4.2L19 7" pathLength="1"/><path class="usa-checkbox-dash" d="M6 12h12" pathLength="1"/></svg></span>');
                }
                this.setAttribute('role', 'checkbox');
                if (!this.hasAttribute('tabindex'))
                    this.tabIndex = 0;
                this.sync();
                this.listen(this, 'click', () => this.toggle());
                this.listen(this, 'keydown', (e) => {
                    if (e.key === ' ' && !e.repeat) {
                        e.preventDefault();
                        this.toggle();
                    }
                });
            }
            changed() {
                this.sync();
            }
            sync() {
                this.setAttribute('aria-checked', this.indeterminate ? 'mixed' : String(this.checked));
                if (this.str('label'))
                    this.setAttribute('aria-label', this.str('label'));
                this.toggleAttribute('aria-disabled', this.flag('disabled'));
                this._internals?.setFormValue?.(this.checked ? this.str('value', 'on') : null);
            }
            toggle(force) {
                if (this.flag('disabled'))
                    return;
                const next = force === undefined ? !this.checked || this.indeterminate : force;
                this.indeterminate = false;
                this.checked = next;
                this.sync();
                const box = this.querySelector('.usa-checkbox-box');
                if (box && !this.reduced)
                    this.motion(box, [{ transform: 'scale(0.75)' }, { transform: 'scale(1)' }], spring.springEasing('bouncy'));
                this.dispatchEvent(new Event('change', { bubbles: true }));
                this.emit('change', { checked: next });
            }
        }
        UsaCheckbox.formAssociated = true;
        return UsaCheckbox;
    }, { id: 'checkbox', text: css });
}

/**
 * use-scroll-animate/components/click — click & tap effects (v2.5).
 * `<usa-click>` (ripple, burst, confetti, squish, press-spring, shake),
 * `<usa-button>` (button click deformation: squash, wobble, gooey, dent;
 * shape morph; submit → loading → success), `<usa-icon-morph>`,
 * `<usa-like>`, `<usa-hold>`, `<usa-double-tap>`, `<usa-checkbox>`, plus
 * `burst()`, `confetti()`, `shake()` and `haptic()`.
 */
/** Register every component of this category under its default tag. */
function defineClickComponents() {
    defineClick();
    defineButton();
    defineIconMorph();
    defineLike();
    defineHold();
    defineDoubleTap();
    defineCheckbox();
}

exports.configureComponents = base.configureComponents;
exports.prefersReducedMotion = base.prefersReducedMotion;
exports.BUTTON_DEFORMS = BUTTON_DEFORMS;
exports.CLICK_EFFECTS = CLICK_EFFECTS;
exports.MORPH_ICONS = MORPH_ICONS;
exports.burst = burst;
exports.confetti = confetti;
exports.defineButton = defineButton;
exports.defineCheckbox = defineCheckbox;
exports.defineClick = defineClick;
exports.defineClickComponents = defineClickComponents;
exports.defineDoubleTap = defineDoubleTap;
exports.defineHold = defineHold;
exports.defineIconMorph = defineIconMorph;
exports.defineLike = defineLike;
exports.haptic = haptic;
exports.morphPath = morphPath;
exports.shake = shake;
//# sourceMappingURL=click.cjs.map
