import { u as defineElement, F as kindOf, D as EASE_OUT, k as clamp, H as FLUENT_DECELERATE, E as EASE_SPRING } from '../chunks/base-CLuqlLfG.js';

var css$4 = "usa-spinner{--usa-spinner-size:32px;--usa-spinner-color:currentColor;position:relative;display:inline-block;vertical-align:middle;flex:none;width:var(--usa-spinner-size);height:var(--usa-spinner-size);color:var(--usa-spinner-color)}usa-spinner i{position:absolute;display:block}usa-spinner[paused] *,usa-spinner[paused] *::after{animation-play-state:paused !important}usa-spinner svg{width:100%;height:100%;animation:usa-spin 2s linear infinite;overflow:visible}usa-spinner svg circle{fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-dasharray:0.5 100;stroke-dashoffset:0;animation:usa-ring-arc 1.6s ease-in-out infinite}@keyframes usa-spin{to{transform:rotate(360deg)}}@keyframes usa-ring-arc{0%{stroke-dasharray:0.5 100;stroke-dashoffset:0}50%{stroke-dasharray:62 100;stroke-dashoffset:-20}100%{stroke-dasharray:0.5 100;stroke-dashoffset:-99}}usa-spinner[data-kind=\"windows\"] i{inset:0;opacity:0;animation:usa-orbit 5.5s infinite}usa-spinner[data-kind=\"windows\"] i::after{content:\"\";position:absolute;left:50%;top:0;width:12%;height:12%;margin-left:-6%;border-radius:50%;background:currentColor}usa-spinner[data-kind=\"windows\"] i:nth-child(2){animation-delay:240ms;--n:1}usa-spinner[data-kind=\"windows\"] i:nth-child(3){animation-delay:480ms;--n:2}usa-spinner[data-kind=\"windows\"] i:nth-child(4){animation-delay:720ms;--n:3}usa-spinner[data-kind=\"windows\"] i:nth-child(5){animation-delay:960ms;--n:4}@keyframes usa-orbit{0%{transform:rotate(225deg);opacity:1;animation-timing-function:ease-out}7%{transform:rotate(345deg);animation-timing-function:linear}30%{transform:rotate(455deg);animation-timing-function:ease-in-out}39%{transform:rotate(690deg);animation-timing-function:linear}70%{transform:rotate(815deg);opacity:1;animation-timing-function:ease-out}75%{transform:rotate(945deg);animation-timing-function:ease-out}76%,100%{transform:rotate(945deg);opacity:0}}usa-spinner[data-kind=\"ring\"] i{inset:0;border-radius:50%;border:calc(var(--usa-spinner-size) / 9) solid color-mix(in srgb,currentColor 20%,transparent);border-top-color:currentColor;animation:usa-spin 0.8s linear infinite}usa-spinner[data-kind=\"dots\"]{display:inline-flex;align-items:center;justify-content:space-between;height:calc(var(--usa-spinner-size) / 2.5)}usa-spinner[data-kind=\"dots\"] i{position:static;width:22%;aspect-ratio:1;border-radius:50%;background:currentColor;animation:usa-dot 1.2s ease-in-out infinite}usa-spinner[data-kind=\"dots\"] i:nth-child(2){animation-delay:0.15s}usa-spinner[data-kind=\"dots\"] i:nth-child(3){animation-delay:0.3s}@keyframes usa-dot{0%,60%,100%{transform:translateY(0);opacity:0.35}30%{transform:translateY(-70%);opacity:1}}usa-spinner[data-kind=\"pulse\"] i{inset:0;border-radius:50%;background:currentColor;opacity:0;animation:usa-pulse 1.6s cubic-bezier(0.22,1,0.36,1) infinite}usa-spinner[data-kind=\"pulse\"] i:nth-child(2){animation-delay:0.8s}@keyframes usa-pulse{from{transform:scale(0.1);opacity:0.8}to{transform:scale(1);opacity:0}}usa-spinner[data-kind=\"bars\"]{display:inline-flex;align-items:center;justify-content:space-between}usa-spinner[data-kind=\"bars\"] i{position:static;width:16%;height:100%;border-radius:2px;background:currentColor;transform:scaleY(0.35);animation:usa-bar 1s ease-in-out infinite}usa-spinner[data-kind=\"bars\"] i:nth-child(2){animation-delay:0.12s}usa-spinner[data-kind=\"bars\"] i:nth-child(3){animation-delay:0.24s}usa-spinner[data-kind=\"bars\"] i:nth-child(4){animation-delay:0.36s}@keyframes usa-bar{0%,100%{transform:scaleY(0.35)}40%{transform:scaleY(1)}}@media (prefers-reduced-motion:reduce){usa-spinner svg,usa-spinner i,usa-spinner i::after{animation:usa-calm 2.4s ease-in-out infinite !important}usa-spinner[data-kind=\"windows\"] i{transform:rotate(calc(var(--n,0) * 72deg))}usa-spinner svg circle{animation:none;stroke-dasharray:30 100}}@keyframes usa-calm{0%,100%{opacity:1}50%{opacity:0.4}}";

const SPINNER_VARIANTS = ['fluent', 'windows', 'ring', 'dots', 'pulse', 'bars'];
function markup(variant) {
    switch (variant) {
        case 'windows':
            return '<i></i><i></i><i></i><i></i><i></i>';
        case 'dots':
            return '<i></i><i></i><i></i>';
        case 'bars':
            return '<i></i><i></i><i></i><i></i>';
        case 'pulse':
            return '<i></i><i></i>';
        case 'ring':
            return '<i></i>';
        default:
            return '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7" pathLength="100"/></svg>';
    }
}
function defineSpinner(tag = 'usa-spinner') {
    return defineElement(tag, (Base) => class UsaSpinner extends Base {
        static get observedAttributes() {
            return ['kind', 'size', 'label'];
        }
        /** The spinner kind (`kind` attribute). */
        get kind() {
            return kindOf(this, SPINNER_VARIANTS, 'fluent');
        }
        set kind(v) {
            this.setAttribute('kind', v);
        }
        mount() {
            const variant = this.kind;
            if (this.getAttribute('data-kind') !== variant) {
                this.innerHTML = markup(variant);
                this.setAttribute('data-kind', variant);
            }
            const size = this.getAttribute('size');
            if (size)
                this.style.setProperty('--usa-spinner-size', `${Number(size)}px`);
            else
                this.style.removeProperty('--usa-spinner-size');
            this.setAttribute('role', 'progressbar');
            if (!this.hasAttribute('aria-label') || this.hasAttribute('label'))
                this.setAttribute('aria-label', this.str('label', 'Loading'));
        }
    }, { id: 'spinner', text: css$4 });
}

var css$3 = "usa-skeleton{display:block;--usa-skeleton-base:color-mix(in srgb,currentColor 10%,transparent);--usa-skeleton-shine:color-mix(in srgb,currentColor 9%,transparent);--usa-skeleton-radius:8px}usa-skeleton[loading]>:not(.usa-skeleton-ph){display:none !important}usa-skeleton .usa-skeleton-ph{display:flex;gap:14px;align-items:flex-start}usa-skeleton .usa-bone-lines{flex:1;display:grid;gap:10px;min-width:0}usa-skeleton .usa-bone{position:relative;display:block;overflow:hidden;height:0.9em;border-radius:var(--usa-skeleton-radius);background:var(--usa-skeleton-base)}usa-skeleton .usa-bone-last{width:62%}usa-skeleton .usa-bone-block{height:120px}usa-skeleton .usa-bone-circle{border-radius:50%;flex:none}usa-skeleton .usa-bone-avatar{width:44px;height:44px}usa-skeleton .usa-bone::after{content:\"\";position:absolute;inset:0;transform:translateX(-100%);background:linear-gradient(90deg,transparent,var(--usa-skeleton-shine),transparent);animation:usa-skeleton 1.5s ease-in-out infinite}@keyframes usa-skeleton{to{transform:translateX(100%)}}@media (prefers-reduced-motion:reduce){usa-skeleton .usa-bone::after{animation:none}}";

function defineSkeleton(tag = 'usa-skeleton') {
    return defineElement(tag, (Base) => class UsaSkeleton extends Base {
        constructor() {
            super(...arguments);
            this._ph = null;
        }
        static get observedAttributes() {
            return ['loading', 'lines', 'width', 'height', 'circle', 'avatar', 'radius'];
        }
        get loading() {
            return this.hasAttribute('loading');
        }
        set loading(v) {
            this.toggleAttribute('loading', !!v);
        }
        changed(name) {
            if (name === 'loading')
                this.sync(true);
            else {
                this._ph?.remove();
                this._ph = null;
                this.sync(false);
            }
        }
        mount() {
            this.sync(false);
        }
        build() {
            const ph = document.createElement('div');
            ph.className = 'usa-skeleton-ph';
            ph.setAttribute('aria-hidden', 'true');
            const bone = (cls = '') => {
                const b = document.createElement('span');
                b.className = `usa-bone ${cls}`.trim();
                return b;
            };
            const radius = this.getAttribute('radius');
            if (radius)
                this.style.setProperty('--usa-skeleton-radius', radius);
            if (this.flag('circle') || this.hasAttribute('width') || this.hasAttribute('height')) {
                const b = bone(this.flag('circle') ? 'usa-bone-circle' : 'usa-bone-block');
                b.style.width = this.str('width', this.flag('circle') ? this.str('height', '48px') : '100%');
                b.style.height = this.str('height', this.flag('circle') ? b.style.width : '120px');
                ph.append(b);
            }
            else {
                if (this.flag('avatar'))
                    ph.append(bone('usa-bone-circle usa-bone-avatar'));
                const col = document.createElement('div');
                col.className = 'usa-bone-lines';
                const n = Math.max(1, Math.min(20, this.num('lines', 3)));
                for (let i = 0; i < n; i++)
                    col.append(bone(i === n - 1 && n > 1 ? 'usa-bone-last' : ''));
                ph.append(col);
            }
            return ph;
        }
        sync(animate) {
            const loading = this.loading;
            this.setAttribute('aria-busy', String(loading));
            if (loading) {
                if (!this._ph) {
                    this._ph = this.build();
                    this.prepend(this._ph);
                }
                return;
            }
            if (this._ph) {
                this._ph.remove();
                this._ph = null;
            }
            if (animate && !this.reduced) {
                for (const kid of Array.from(this.children)) {
                    this.motion(kid, [{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: 360, easing: EASE_OUT });
                }
            }
            this.emit('loaded');
        }
    }, { id: 'skeleton', text: css$3 });
}

var css$2 = "usa-progress{--usa-progress-color:var(--usa-accent,#7c5cff);--usa-progress-track:color-mix(in srgb,currentColor 14%,transparent);position:relative;display:block;height:var(--usa-progress-height,4px);border-radius:999px;overflow:hidden;background:var(--usa-progress-track);contain:paint}usa-progress .usa-progress-bar{position:absolute;inset:0;border-radius:inherit;background:var(--usa-progress-color);transform:scaleX(0);transform-origin:0 50%;transition:transform 0.45s cubic-bezier(0.22,1,0.36,1)}usa-progress .usa-progress-bar2{display:none}usa-progress[data-indeterminate] .usa-progress-bar{right:auto;width:40%;transform:translateX(-100%);transition:none;animation:usa-indet 2s cubic-bezier(0.4,0,0.6,1) infinite}usa-progress[data-indeterminate] .usa-progress-bar2{display:block;width:60%;animation:usa-indet2 2s cubic-bezier(0.4,0,0.6,1) 1s infinite}usa-progress[state=\"paused\"]{--usa-progress-color:#c19c00}usa-progress[state=\"error\"]{--usa-progress-color:#d13438}usa-progress[state=\"paused\"] .usa-progress-bar,usa-progress[state=\"error\"] .usa-progress-bar{animation-play-state:paused}@keyframes usa-indet{from{transform:translateX(-100%)}to{transform:translateX(250%)}}@keyframes usa-indet2{from{transform:translateX(-100%)}to{transform:translateX(167%)}}@media (prefers-reduced-motion:reduce){usa-progress .usa-progress-bar{transition:none}usa-progress[data-indeterminate] .usa-progress-bar{width:100%;transform:none;animation:usa-calm-bar 2.4s ease-in-out infinite}usa-progress[data-indeterminate] .usa-progress-bar2{display:none}}@keyframes usa-calm-bar{0%,100%{opacity:1}50%{opacity:0.4}}";

function defineProgress(tag = 'usa-progress') {
    return defineElement(tag, (Base) => class UsaProgress extends Base {
        constructor() {
            super(...arguments);
            this._fill = null;
        }
        static get observedAttributes() {
            return ['value', 'max', 'indeterminate', 'label'];
        }
        get value() {
            const v = this.getAttribute('value');
            return v === null || v === '' || Number.isNaN(Number(v)) ? null : Number(v);
        }
        set value(v) {
            if (v === null || v === undefined)
                this.removeAttribute('value');
            else
                this.setAttribute('value', String(v));
        }
        get max() {
            const m = this.num('max', 100);
            return m > 0 ? m : 100;
        }
        set max(v) {
            this.setAttribute('max', String(v));
        }
        get ratio() {
            const v = this.value;
            return this.hasAttribute('indeterminate') || v === null ? null : clamp(v / this.max, 0, 1);
        }
        changed() {
            this.sync();
        }
        mount() {
            if (!this._fill) {
                this.innerHTML = '<span class="usa-progress-bar"></span><span class="usa-progress-bar usa-progress-bar2"></span>';
                this._fill = this.firstElementChild;
            }
            this.setAttribute('role', 'progressbar');
            this.sync();
        }
        sync() {
            const ratio = this.ratio;
            const label = this.getAttribute('label');
            if (label)
                this.setAttribute('aria-label', label);
            this.toggleAttribute('data-indeterminate', ratio === null);
            if (ratio === null) {
                this.removeAttribute('aria-valuenow');
                if (this._fill)
                    this._fill.style.transform = '';
                return;
            }
            this.setAttribute('aria-valuemin', '0');
            this.setAttribute('aria-valuemax', String(this.max));
            this.setAttribute('aria-valuenow', String(this.value));
            if (this._fill)
                this._fill.style.transform = `scaleX(${ratio})`;
            if (ratio === 1)
                this.emit('complete');
        }
    }, { id: 'progress', text: css$2 });
}

var css$1 = "usa-toaster{position:fixed;z-index:2147483000;right:16px;bottom:16px;display:flex;flex-direction:column;gap:10px;width:min(360px,calc(100vw - 32px));pointer-events:none}usa-toaster[position^=\"top\"]{bottom:auto;top:16px}usa-toaster[position$=\"left\"]{right:auto;left:16px}usa-toaster[position$=\"center\"]{right:auto;left:50%;translate:-50% 0}usa-toaster .usa-toast{--usa-toast-accent:#0078d4;pointer-events:auto;display:flex;align-items:flex-start;gap:10px;padding:12px 12px 12px 14px;border-radius:10px;background:var(--usa-toast-bg,color-mix(in srgb,Canvas 92%,transparent));color:var(--usa-toast-fg,CanvasText);border:1px solid color-mix(in srgb,CanvasText 12%,transparent);border-left:3px solid var(--usa-toast-accent);box-shadow:0 8px 28px -8px rgb(0 0 0 / 0.35);font:inherit;font-size:14px;line-height:1.4;-webkit-backdrop-filter:blur(20px) saturate(1.4);backdrop-filter:blur(20px) saturate(1.4)}usa-toaster .usa-toast[data-type=\"success\"]{--usa-toast-accent:#0f9d58}usa-toaster .usa-toast[data-type=\"warning\"]{--usa-toast-accent:#c19c00}usa-toaster .usa-toast[data-type=\"error\"]{--usa-toast-accent:#d13438}usa-toaster .usa-toast-icon{flex:none;width:20px;height:20px;fill:none;stroke:var(--usa-toast-accent);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}usa-toaster .usa-toast-msg{flex:1;min-width:0;padding-top:1px;overflow-wrap:anywhere}usa-toaster .usa-toast-action,usa-toaster .usa-toast-close{flex:none;border:0;background:transparent;color:inherit;font:inherit;cursor:pointer;border-radius:6px;padding:2px 6px}usa-toaster .usa-toast-action{color:var(--usa-toast-accent);font-weight:600}usa-toaster .usa-toast-close{opacity:0.6;line-height:0;padding:3px}usa-toaster .usa-toast-close svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}usa-toaster .usa-toast-action:hover,usa-toaster .usa-toast-close:hover{background:color-mix(in srgb,currentColor 10%,transparent);opacity:1}";

const ICONS = {
    info: '<path d="M12 8h.01M11 12h1v5h1"/>',
    success: '<path d="m8 12.5 3 3 5-6"/>',
    warning: '<path d="M12 8v5M12 16.5h.01"/>',
    error: '<path d="m9 9 6 6M15 9l-6 6"/>',
};
function defineToaster(tag = 'usa-toaster') {
    return defineElement(tag, (Base) => class UsaToaster extends Base {
        static get observedAttributes() {
            return ['label'];
        }
        mount() {
            this.setAttribute('role', 'region');
            this.setAttribute('aria-label', this.str('label', 'Notifications'));
        }
        flip(mutate) {
            const kids = Array.from(this.children);
            const before = new Map(kids.map((k) => [k, k.getBoundingClientRect().top]));
            mutate();
            if (this.reduced)
                return;
            for (const k of Array.from(this.children)) {
                const top = before.get(k);
                if (top === undefined || k.hasAttribute('data-leaving'))
                    continue;
                const dy = top - k.getBoundingClientRect().top;
                if (Math.abs(dy) > 0.5)
                    this.motion(k, [{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 320, easing: EASE_OUT, composite: 'add' });
            }
        }
        enterFrames() {
            if (this.reduced)
                return [{ opacity: 0 }, { opacity: 1 }];
            const pos = this.str('position', 'bottom-right');
            const x = pos.endsWith('right') ? '110%' : pos.endsWith('left') ? '-110%' : '0';
            const y = pos.endsWith('center') ? (pos.startsWith('top') ? '-120%' : '120%') : '0';
            return [{ opacity: 0, transform: `translate(${x}, ${y}) scale(0.96)` }, { opacity: 1, transform: 'none' }];
        }
        show(message, options = {}) {
            const type = options.type || 'info';
            const el = document.createElement('div');
            el.className = 'usa-toast';
            el.setAttribute('data-type', type);
            el.setAttribute('role', type === 'error' ? 'alert' : 'status');
            el.innerHTML = `<svg class="usa-toast-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/>${ICONS[type] || ICONS.info}</svg><div class="usa-toast-msg"></div>`;
            el.querySelector('.usa-toast-msg').textContent = message;
            let closed = null;
            let timer = 0;
            const close = () => {
                if (closed)
                    return closed;
                clearTimeout(timer);
                el.setAttribute('data-leaving', '');
                const frames = this.enterFrames().reverse();
                const a = el.isConnected ? this.motion(el, frames, { duration: 220, easing: 'cubic-bezier(0.7, 0, 0.84, 0)', fill: 'forwards' }) : null;
                closed = new Promise((resolve) => {
                    const done = () => {
                        this.flip(() => el.remove());
                        resolve();
                    };
                    if (a)
                        a.onfinish = done;
                    else
                        done();
                });
                return closed;
            };
            if (options.action) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'usa-toast-action';
                btn.textContent = options.action.label;
                btn.addEventListener('click', () => {
                    options.action.onClick();
                    close();
                });
                el.append(btn);
            }
            if (options.dismissible !== false) {
                const x = document.createElement('button');
                x.type = 'button';
                x.className = 'usa-toast-close';
                x.setAttribute('aria-label', 'Close');
                x.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17"/></svg>';
                x.addEventListener('click', () => close());
                el.append(x);
            }
            const duration = options.duration ?? 4000;
            const arm = () => {
                clearTimeout(timer);
                if (duration > 0)
                    timer = setTimeout(close, duration);
            };
            const hold = () => clearTimeout(timer);
            el.addEventListener('pointerenter', hold);
            el.addEventListener('pointerleave', arm);
            el.addEventListener('focusin', hold);
            el.addEventListener('focusout', arm);
            const top = this.str('position', 'bottom-right').startsWith('top');
            this.flip(() => (top ? this.prepend(el) : this.append(el)));
            this.motion(el, this.enterFrames(), { duration: 420, easing: FLUENT_DECELERATE });
            arm();
            const live = Array.from(this.querySelectorAll('.usa-toast:not([data-leaving])'));
            const max = Math.max(1, this.num('max', 4));
            const extra = live.length - max;
            if (extra > 0)
                (top ? live.slice(-extra) : live.slice(0, extra)).forEach((t) => t._close?.());
            el._close = close;
            this.emit('toast', { element: el, message, type });
            return { element: el, close };
        }
        clear() {
            this.querySelectorAll('.usa-toast').forEach((t) => t._close?.());
        }
    }, { id: 'toast', text: css$1 });
}
/**
 * Show a toast. Defines `<usa-toaster>` and adds one to `<body>` if the
 * page has none. Returns a handle with `close()`. No-op on the server.
 *
 * ```js
 * toast('Saved', { type: 'success' });
 * ```
 */
function toast(message, options = {}) {
    if (typeof document === 'undefined' || !defineToaster())
        return null;
    let host = typeof options.toaster === 'string' ? document.querySelector(options.toaster) : options.toaster || document.querySelector('usa-toaster');
    if (!host) {
        host = document.createElement('usa-toaster');
        document.body.append(host);
    }
    return host.show(message, options);
}

var css = "usa-check{--usa-check-size:56px;--usa-check-color:#0f9d58;display:inline-block;width:var(--usa-check-size);height:var(--usa-check-size);vertical-align:middle}usa-check[data-kind=\"error\"]{--usa-check-color:#d13438}usa-check[data-kind=\"warning\"]{--usa-check-color:#c19c00}usa-check svg{width:100%;height:100%;overflow:visible}usa-check circle,usa-check path{fill:none;stroke:var(--usa-check-color);stroke-width:3.5;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1 1}usa-check[data-state=\"idle\"] circle,usa-check[data-state=\"idle\"] path{stroke-dashoffset:1}usa-check[data-state=\"done\"] circle,usa-check[data-state=\"done\"] path{stroke-dashoffset:0}";

const PATHS = {
    success: 'M15 27 l7 7 l14 -15',
    error: 'M18 18 L34 34 M34 18 L18 34',
    warning: 'M26 15 V30 M26 37 V37.5',
};
function defineCheck(tag = 'usa-check') {
    return defineElement(tag, (Base) => class UsaCheck extends Base {
        constructor() {
            super(...arguments);
            this._anims = [];
        }
        static get observedAttributes() {
            return ['kind', 'size', 'label'];
        }
        mount() {
            const variant = kindOf(this, PATHS, 'success');
            this.innerHTML = `<svg viewBox="0 0 52 52" aria-hidden="true"><circle class="usa-check-circle" cx="26" cy="26" r="23" pathLength="1"/><path class="usa-check-mark" d="${PATHS[variant]}" pathLength="1"/></svg>`;
            this.setAttribute('data-kind', variant);
            const size = this.getAttribute('size');
            if (size)
                this.style.setProperty('--usa-check-size', `${Number(size)}px`);
            const label = this.getAttribute('label');
            if (label) {
                this.setAttribute('role', 'img');
                this.setAttribute('aria-label', label);
            }
            if (this.reduced) {
                this.setAttribute('data-state', 'done');
                return;
            }
            this.setAttribute('data-state', 'idle');
            const start = this.str('start', 'view');
            if (start === 'load')
                this.play();
            else if (start === 'view') {
                let done = false;
                this.inView((v) => v && !done && ((done = true), this.play()), { threshold: 0.5 });
            }
        }
        unmount() {
            this._anims.splice(0).forEach((a) => a.cancel());
        }
        reset() {
            this._anims.splice(0).forEach((a) => a.cancel());
            this.setAttribute('data-state', this.reduced ? 'done' : 'idle');
        }
        play() {
            this.reset();
            this.setAttribute('data-state', 'done');
            const circle = this.querySelector('.usa-check-circle');
            const mark = this.querySelector('.usa-check-mark');
            const svg = this.querySelector('svg');
            if (this.reduced || !circle || !mark || !svg) {
                this.emit('complete');
                return Promise.resolve();
            }
            const draw = [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }];
            const anims = [
                this.motion(circle, draw, { duration: 520, easing: EASE_OUT, fill: 'backwards' }),
                this.motion(mark, draw, { duration: 340, delay: 420, easing: EASE_OUT, fill: 'backwards' }),
                this.motion(svg, [{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }], { duration: 420, delay: 640, easing: EASE_SPRING }),
            ].filter((a) => !!a);
            this._anims = anims;
            return new Promise((resolve) => {
                const last = anims[anims.length - 1];
                const done = () => {
                    this.emit('complete');
                    resolve();
                };
                if (last)
                    last.onfinish = done;
                else
                    done();
            });
        }
    }, { id: 'check', text: css });
}

/**
 * motionary/components/feedback — loading & feedback.
 * `<usa-spinner>`, `<usa-skeleton>`, `<usa-progress>`, `<usa-toaster>` +
 * `toast()`, `<usa-check>`.
 */
/** Register every component of this category under its default tag. */
function defineFeedbackComponents() {
    defineSpinner();
    defineSkeleton();
    defineProgress();
    defineToaster();
    defineCheck();
}

export { SPINNER_VARIANTS, defineCheck, defineFeedbackComponents, defineProgress, defineSkeleton, defineSpinner, defineToaster, toast };
//# sourceMappingURL=feedback.js.map
