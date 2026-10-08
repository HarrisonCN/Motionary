import { u as defineElement, k as caf, r as raf, p as prefersReducedMotion, n as now, g as getMotionIntensity, f as configureComponents, q as adoptStyles } from '../chunks/base-CZiIAMBc.js';
export { M as MOTION_SCALE } from '../chunks/base-CZiIAMBc.js';
import { e as springSamples } from '../chunks/spring-BS5tg6aK.js';

var css$8 = "usa-cursor{--usa-cursor-color:var(--usa-accent,#7c5cff);--usa-cursor-size:28px;position:fixed;inset:0;pointer-events:none;z-index:2147483600;opacity:0;transition:opacity 0.2s ease;contain:strict}usa-cursor[data-active]{opacity:1}usa-cursor .usa-cursor-ring{position:absolute;left:0;top:0;width:var(--usa-cursor-size);height:var(--usa-cursor-size);margin:calc(var(--usa-cursor-size) / -2) 0 0 calc(var(--usa-cursor-size) / -2);border:1.5px solid var(--usa-cursor-color);border-radius:999px;box-sizing:border-box;transition:width 0.25s cubic-bezier(0.34,1.56,0.64,1),height 0.25s cubic-bezier(0.34,1.56,0.64,1),margin 0.25s ease,border-radius 0.25s ease,background-color 0.2s ease;will-change:transform}usa-cursor[mode=\"trail\"] .usa-cursor-ring{border:0;background:var(--usa-cursor-color);width:calc(var(--usa-cursor-size) * (0.45 - var(--i) * 0.04));height:calc(var(--usa-cursor-size) * (0.45 - var(--i) * 0.04));margin:calc(var(--usa-cursor-size) * (0.45 - var(--i) * 0.04) / -2) 0 0 calc(var(--usa-cursor-size) * (0.45 - var(--i) * 0.04) / -2);opacity:calc(1 - var(--i) * 0.11)}usa-cursor[data-hover] .usa-cursor-ring:first-child{width:calc(var(--usa-cursor-size) * 1.6);height:calc(var(--usa-cursor-size) * 1.6);margin:calc(var(--usa-cursor-size) * -0.8) 0 0 calc(var(--usa-cursor-size) * -0.8);background:color-mix(in srgb,var(--usa-cursor-color) 15%,transparent)}usa-cursor[data-snapped] .usa-cursor-ring{border-radius:12px;background:color-mix(in srgb,var(--usa-cursor-color) 12%,transparent);translate:-50% -50%;margin:0}usa-cursor[data-down] .usa-cursor-ring:first-child{scale:0.8}usa-cursor .usa-cursor-dot{position:absolute;left:-3px;top:-3px;width:6px;height:6px;border-radius:50%;background:var(--usa-cursor-color)}usa-cursor[data-snapped] .usa-cursor-dot{opacity:0}usa-cursor .usa-cursor-glow{position:absolute;left:-200px;top:-200px;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--usa-cursor-color) 35%,transparent),transparent 65%);mix-blend-mode:screen}.usa-cursor-none,.usa-cursor-none *{cursor:none !important}@media (pointer:coarse),(prefers-reduced-motion:reduce){usa-cursor{display:none}.usa-cursor-none,.usa-cursor-none *{cursor:auto !important}}";

const CURSOR_MODES = ['dot', 'trail', 'magnetic', 'glow'];
function defineCursor(tag = 'usa-cursor') {
    return defineElement(tag, (Base) => class UsaCursor extends Base {
        constructor() {
            super(...arguments);
            this._frame = 0;
        }
        static get observedAttributes() {
            return ['mode', 'size', 'color', 'hide-native'];
        }
        get active() {
            return this.hasAttribute('data-active');
        }
        mount() {
            this.setAttribute('aria-hidden', 'true');
            const fine = typeof matchMedia !== 'function' || matchMedia('(pointer: fine)').matches || matchMedia('(hover: hover)').matches;
            if (this.reduced || !fine) {
                // Decorative only: never leave (focusable) content inside aria-hidden (4.4 audit).
                this.replaceChildren();
                return;
            }
            const mode = this.str('mode', 'dot');
            const n = mode === 'trail' ? 8 : 1;
            this.innerHTML = Array.from({ length: n }, (_, i) => `<span class="usa-cursor-${mode === 'glow' ? 'glow' : 'ring'}" style="--i:${i}"></span>`).join('') + (mode === 'glow' ? '' : '<span class="usa-cursor-dot"></span>');
            if (this.str('color'))
                this.style.setProperty('--usa-cursor-color', this.str('color'));
            this.style.setProperty('--usa-cursor-size', `${this.num('size', 28)}px`);
            if (this.flag('hide-native'))
                document.documentElement.classList.add('usa-cursor-none');
            this.onCleanup(() => document.documentElement.classList.remove('usa-cursor-none'));
            const parts = Array.from(this.querySelectorAll('.usa-cursor-ring, .usa-cursor-glow'));
            const dot = this.querySelector('.usa-cursor-dot');
            const pts = parts.map(() => ({ x: -100, y: -100 }));
            let mx = -100;
            let my = -100;
            let snap = null;
            const sel = this.str('targets', 'a, button, [role="button"], [data-cursor], input, select, textarea, label');
            const loop = () => {
                this._frame = 0;
                let tx = mx;
                let ty = my;
                pts.forEach((p, i) => {
                    const k = mode === 'trail' ? 0.35 - i * 0.03 : mode === 'glow' ? 0.12 : 0.22;
                    const goalX = snap && i === 0 ? snap.left + snap.width / 2 : tx;
                    const goalY = snap && i === 0 ? snap.top + snap.height / 2 : ty;
                    p.x += (goalX - p.x) * k;
                    p.y += (goalY - p.y) * k;
                    parts[i].style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`;
                    tx = p.x;
                    ty = p.y;
                });
                if (snap && parts[0]) {
                    parts[0].style.width = `${snap.width + 12}px`;
                    parts[0].style.height = `${snap.height + 12}px`;
                }
                else if (parts[0]) {
                    parts[0].style.width = parts[0].style.height = '';
                }
                if (dot)
                    dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
                const moving = pts.some((p, i) => Math.abs(p.x - (i === 0 && snap ? snap.left + snap.width / 2 : mx)) > 0.3);
                if (moving)
                    this._frame = raf(loop);
            };
            const kick = () => {
                if (!this._frame)
                    this._frame = raf(loop);
            };
            this.listen(document, 'pointermove', (e) => {
                if (e.pointerType === 'touch')
                    return;
                mx = e.clientX;
                my = e.clientY;
                this.setAttribute('data-active', '');
                if (mode === 'magnetic') {
                    const t = e.target?.closest?.(sel);
                    snap = t ? t.getBoundingClientRect() : null;
                    this.toggleAttribute('data-snapped', !!t);
                }
                else {
                    this.toggleAttribute('data-hover', !!e.target?.closest?.(sel));
                }
                kick();
            }, { passive: true });
            this.listen(document, 'pointerdown', () => this.setAttribute('data-down', ''));
            this.listen(document, 'pointerup', () => this.removeAttribute('data-down'));
            this.listen(document.documentElement, 'pointerleave', () => this.removeAttribute('data-active'));
        }
        unmount() {
            caf(this._frame);
            this._frame = 0;
            this.removeAttribute('data-active');
        }
    }, { id: 'cursor', text: css$8 });
}

function smoothScroll(options = {}) {
    if (typeof window === 'undefined' || prefersReducedMotion())
        return () => undefined;
    const el = options.target || null;
    const lerp = Math.min(1, Math.max(0.02, options.lerp ?? 0.12));
    const mult = options.wheelMultiplier ?? 1;
    const get = () => (el ? el.scrollTop : window.scrollY);
    const max = () => (el ? el.scrollHeight - el.clientHeight : document.documentElement.scrollHeight - window.innerHeight);
    const set = (y) => (el ? (el.scrollTop = y) : window.scrollTo(0, y));
    let target = get();
    let current = target;
    let id = 0;
    const loop = () => {
        current += (target - current) * lerp;
        if (Math.abs(target - current) < 0.5)
            current = target;
        set(current);
        id = current === target ? 0 : raf(loop);
    };
    const onWheel = (e) => {
        if (e.ctrlKey || e.defaultPrevented)
            return;
        if (!id)
            target = current = get();
        e.preventDefault();
        const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * (window.innerHeight || 800) : e.deltaY;
        target = Math.max(0, Math.min(max(), target + dy * mult));
        if (!id)
            id = raf(loop);
    };
    const onScroll = () => {
        if (!id)
            target = current = get();
    };
    const host = el || window;
    host.addEventListener('wheel', onWheel, { passive: false });
    host.addEventListener('scroll', onScroll, { passive: true });
    return () => {
        host.removeEventListener('wheel', onWheel);
        host.removeEventListener('scroll', onScroll);
        if (id)
            caf(id);
        id = 0;
    };
}
/**
 * Scroll to a y position, element or selector with spring timing (or
 * instantly under reduced motion). Resolves when done.
 */
function scrollToTarget(to, options = {}) {
    if (typeof window === 'undefined')
        return Promise.resolve();
    const el = options.target || null;
    const start = el ? el.scrollTop : window.scrollY;
    let y = typeof to === 'number' ? to : 0;
    if (typeof to !== 'number') {
        const node = typeof to === 'string' ? document.querySelector(to) : to;
        if (!node)
            return Promise.resolve();
        const top = node.getBoundingClientRect().top;
        y = start + top - (el ? el.getBoundingClientRect().top : 0);
    }
    y = Math.max(0, y - (options.offset ?? 0));
    const set = (v) => (el ? (el.scrollTop = v) : window.scrollTo(0, v));
    if (prefersReducedMotion()) {
        set(y);
        return Promise.resolve();
    }
    const { values, duration } = springSamples(options.preset || 'slow');
    const t0 = now();
    return new Promise((resolve) => {
        const step = () => {
            const p = Math.min(1, (now() - t0) / Math.max(1, duration));
            const v = values[Math.min(values.length - 1, Math.round(p * (values.length - 1)))];
            set(start + (y - start) * v);
            if (p < 1)
                raf(step);
            else
                resolve();
        };
        raf(step);
    });
}

var css$7 = "usa-fullpage{position:relative;display:block;height:100vh;height:100dvh;overflow-y:auto;scroll-snap-type:y mandatory;overscroll-behavior:contain;outline:none}usa-fullpage[axis=\"x\"]{display:flex;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory}usa-fullpage .usa-fullpage-section{box-sizing:border-box;min-height:100%;scroll-snap-align:start;scroll-snap-stop:always}usa-fullpage[axis=\"x\"] .usa-fullpage-section{flex:0 0 100%}usa-fullpage .usa-fullpage-dots{position:sticky;float:right;top:50%;margin-right:16px;transform:translateY(-50%);display:grid;gap:10px;z-index:5}usa-fullpage .usa-fullpage-dots button{width:10px;height:10px;padding:0;border-radius:50%;border:0;cursor:pointer;background:color-mix(in srgb,currentColor 35%,transparent);transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1),background-color 0.2s ease}usa-fullpage .usa-fullpage-dots button[aria-current]{background:var(--usa-accent,#7c5cff);transform:scale(1.5)}";

function defineFullpage(tag = 'usa-fullpage') {
    return defineElement(tag, (Base) => class UsaFullpage extends Base {
        constructor() {
            super(...arguments);
            this._i = 0;
        }
        get index() {
            return this._i;
        }
        sections() {
            return Array.from(this.children).filter((c) => !c.classList.contains('usa-fullpage-dots'));
        }
        mount() {
            if (!this.hasAttribute('tabindex'))
                this.tabIndex = 0;
            const secs = this.sections();
            secs.forEach((s, i) => {
                s.classList.add('usa-fullpage-section');
                s.setAttribute('data-index', String(i));
            });
            let nav = null;
            if (this.flag('dots')) {
                nav = document.createElement('nav');
                nav.className = 'usa-fullpage-dots';
                nav.setAttribute('aria-label', 'Sections');
                secs.forEach((s, i) => {
                    const b = document.createElement('button');
                    b.type = 'button';
                    b.setAttribute('aria-label', s.getAttribute('aria-label') || s.querySelector('h1,h2,h3')?.textContent?.trim() || `Section ${i + 1}`);
                    b.addEventListener('click', () => this.go(i));
                    nav.append(b);
                });
                this.append(nav);
                this.onCleanup(() => nav?.remove());
            }
            this.mark(0);
            if (typeof IntersectionObserver !== 'undefined') {
                const io = new IntersectionObserver((entries) => {
                    for (const e of entries)
                        if (e.isIntersecting && e.intersectionRatio >= 0.6)
                            this.mark(Number(e.target.dataset.index));
                }, { root: this, threshold: [0.6] });
                secs.forEach((s) => io.observe(s));
                this.onCleanup(() => io.disconnect());
            }
            this.listen(this, 'keydown', (e) => {
                const n = this.sections().length;
                const map = { PageDown: this._i + 1, ArrowDown: this._i + 1, ' ': this._i + 1, PageUp: this._i - 1, ArrowUp: this._i - 1, Home: 0, End: n - 1 };
                if (this.str('axis') === 'x')
                    Object.assign(map, { ArrowRight: this._i + 1, ArrowLeft: this._i - 1 });
                if (!(e.key in map) || e.target.closest?.('input, textarea, select'))
                    return;
                e.preventDefault();
                this.go(map[e.key]);
            });
        }
        mark(i) {
            if (i === this._i && this.hasAttribute('data-ready'))
                return;
            this.setAttribute('data-ready', '');
            this._i = i;
            this.sections().forEach((s, j) => s.toggleAttribute('data-current', j === i));
            this.querySelectorAll('.usa-fullpage-dots button').forEach((b, j) => (j === i ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current')));
            this.emit('section', { index: i });
        }
        go(i) {
            const secs = this.sections();
            const t = secs[Math.max(0, Math.min(secs.length - 1, i))];
            if (!t)
                return;
            if (this.str('axis') === 'x')
                this.scrollTo({ left: t.offsetLeft, behavior: this.reduced ? 'auto' : 'smooth' });
            else
                scrollToTarget(t.offsetTop, { target: this, preset: 'stiff' });
            this.mark(secs.indexOf(t));
        }
        next() {
            this.go(this._i + 1);
        }
        prev() {
            this.go(this._i - 1);
        }
    }, { id: 'fullpage', text: css$7 });
}

var css$6 = "usa-loading-bar{--usa-loading:0;--usa-loading-h:3px;--usa-loading-color:var(--usa-accent,#7c5cff);position:fixed;left:0;right:0;top:0;height:var(--usa-loading-h);z-index:2147483500;pointer-events:none;opacity:0;transition:opacity 0.3s ease}usa-loading-bar[position=\"bottom\"]{top:auto;bottom:0}usa-loading-bar[data-active]{opacity:1}usa-loading-bar .usa-loading-bar-fill{position:absolute;inset:0;transform-origin:0 50%;transform:scaleX(var(--usa-loading));background:var(--usa-loading-color);box-shadow:0 0 10px var(--usa-loading-color);transition:transform 0.2s ease-out}@media (prefers-reduced-motion:reduce){usa-loading-bar .usa-loading-bar-fill{transition:none}}";

function defineLoadingBar(tag = 'usa-loading-bar') {
    return defineElement(tag, (Base) => class UsaLoadingBar extends Base {
        constructor() {
            super(...arguments);
            this._p = 0;
        }
        get progress() {
            return this._p;
        }
        mount() {
            if (!this.querySelector('.usa-loading-bar-fill'))
                this.innerHTML = '<span class="usa-loading-bar-fill"></span>';
            this.setAttribute('role', 'progressbar');
            this.setAttribute('aria-label', this.str('label', 'Loading'));
            this.setAttribute('aria-valuemin', '0');
            this.setAttribute('aria-valuemax', '100');
            if (this.str('color'))
                this.style.setProperty('--usa-loading-color', this.str('color'));
            this.style.setProperty('--usa-loading-h', `${this.num('height', 3)}px`);
            this.paint();
        }
        unmount() {
            clearInterval(this._t);
            clearTimeout(this._h);
        }
        paint() {
            this.style.setProperty('--usa-loading', this._p.toFixed(4));
            this.setAttribute('aria-valuenow', String(Math.round(this._p * 100)));
        }
        start() {
            clearTimeout(this._h);
            clearInterval(this._t);
            this.setAttribute('data-active', '');
            this.setAttribute('aria-busy', 'true');
            this._p = Math.max(this._p, 0.08);
            this.paint();
            this._t = setInterval(() => {
                this._p += (0.9 - this._p) * (this.reduced ? 0.5 : 0.08);
                this.paint();
            }, 200);
        }
        set(p) {
            this.setAttribute('data-active', '');
            this._p = Math.max(0, Math.min(1, p));
            this.paint();
        }
        done() {
            clearInterval(this._t);
            this._p = 1;
            this.paint();
            this.removeAttribute('aria-busy');
            this._h = setTimeout(() => {
                this.removeAttribute('data-active');
                this._h = setTimeout(() => {
                    this._p = 0;
                    this.paint();
                }, 300);
            }, 250);
        }
    }, { id: 'loading-bar', text: css$6 });
}
function bar() {
    if (typeof document === 'undefined')
        return null;
    let el = document.querySelector('usa-loading-bar');
    if (!el) {
        defineLoadingBar();
        el = document.createElement('usa-loading-bar');
        document.body.appendChild(el);
    }
    return typeof el.start === 'function' ? el : null;
}
/** Drive the page's `<usa-loading-bar>` (created on first use). */
const loadingBar = {
    start: () => bar()?.start(),
    set: (p) => bar()?.set(p),
    done: () => bar()?.done(),
    /** Run `task` with the bar shown; resolves with its result. */
    async track(task) {
        bar()?.start();
        try {
            return await (typeof task === 'function' ? task() : task);
        }
        finally {
            bar()?.done();
        }
    },
};

var css$5 = "usa-back-to-top{--usa-btt:0;position:fixed;right:max(20px,env(safe-area-inset-right));bottom:max(20px,env(safe-area-inset-bottom));z-index:850;opacity:0;transform:translateY(16px) scale(0.8);pointer-events:none;transition:opacity 0.25s ease,transform 0.4s cubic-bezier(0.34,1.56,0.64,1)}usa-back-to-top[position=\"bottom-left\"]{right:auto;left:max(20px,env(safe-area-inset-left))}usa-back-to-top[data-visible]{opacity:1;transform:none;pointer-events:auto}usa-back-to-top button{width:48px;height:48px;padding:0;border:0;border-radius:50%;cursor:pointer;display:grid;place-items:center;color:var(--usa-accent,#7c5cff);background:var(--usa-surface,#1b1e27);box-shadow:var(--usa-shadow,0 8px 24px -10px rgb(0 0 0 / 0.5))}usa-back-to-top svg{width:44px;height:44px;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}usa-back-to-top circle{stroke-dasharray:100;stroke-dashoffset:calc(100 - var(--usa-btt) * 100);transform:rotate(-90deg);transform-origin:50% 50%;opacity:0.85}usa-back-to-top button:focus-visible{outline:2px solid var(--usa-accent,#7c5cff);outline-offset:3px}@media (prefers-reduced-motion:reduce){usa-back-to-top{transition:opacity 0.2s ease;transform:none}}";

function defineBackToTop(tag = 'usa-back-to-top') {
    return defineElement(tag, (Base) => class UsaBackToTop extends Base {
        constructor() {
            super(...arguments);
            this._frame = 0;
        }
        get visible() {
            return this.hasAttribute('data-visible');
        }
        mount() {
            if (!this.querySelector('button')) {
                this.innerHTML = `<button type="button" aria-label="${this.str('label', 'Back to top')}"><svg viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="16" pathLength="100"/><path d="M12 20l6-6 6 6"/></svg></button>`;
            }
            const btn = this.querySelector('button');
            const update = () => {
                this._frame = 0;
                const y = window.scrollY || document.documentElement.scrollTop || 0;
                const max = Math.max(1, (document.documentElement.scrollHeight || 0) - (window.innerHeight || 0));
                this.toggleAttribute('data-visible', y > this.num('offset', 300));
                this.style.setProperty('--usa-btt', Math.min(1, y / max).toFixed(4));
            };
            this.listen(window, 'scroll', () => {
                if (!this._frame)
                    this._frame = raf(update);
            }, { passive: true });
            this.listen(btn, 'click', async () => {
                await scrollToTarget(0, { preset: 'slow' });
                const f = document.querySelector(this.str('focus-target', '#main')) || document.body;
                if (!f.hasAttribute('tabindex') && f !== document.body)
                    f.tabIndex = -1;
                f.focus?.({ preventScroll: true });
            });
            update();
        }
        unmount() {
            caf(this._frame);
            this._frame = 0;
        }
    }, { id: 'back-to-top', text: css$5 });
}

var css$4 = "usa-ambient{--usa-ambient-opacity:0.6;--usa-ambient-p:0;position:fixed;inset:0;z-index:-1;pointer-events:none;opacity:var(--usa-ambient-opacity);contain:strict}usa-ambient[layer=\"front\"]{z-index:2147483000}usa-ambient canvas{display:block}usa-ambient[effect=\"noise\"]{opacity:calc(var(--usa-ambient-opacity) * 0.25);background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\");animation:usa-ambient-grain 0.6s steps(4) infinite;mix-blend-mode:overlay}@keyframes usa-ambient-grain{25%{background-position:-40px 20px}50%{background-position:30px -50px}75%{background-position:-20px -30px}}usa-ambient[effect=\"gradient\"]{background:linear-gradient(135deg,hsl(calc(250 + var(--usa-ambient-p) * 140) 85% 60%),hsl(calc(190 + var(--usa-ambient-p) * 160) 85% 55%) 50%,hsl(calc(320 + var(--usa-ambient-p) * 90) 85% 62%))}@media (prefers-reduced-motion:reduce){usa-ambient[effect=\"noise\"]{animation:none}}";

const AMBIENT_EFFECTS = ['particles', 'snow', 'stars', 'noise', 'gradient'];
function defineAmbient(tag = 'usa-ambient') {
    return defineElement(tag, (Base) => class UsaAmbient extends Base {
        constructor() {
            super(...arguments);
            this._frame = 0;
        }
        static get observedAttributes() {
            return ['effect', 'density', 'color'];
        }
        mount() {
            this.setAttribute('aria-hidden', 'true');
            const effect = this.str('effect', 'particles');
            this.style.setProperty('--usa-ambient-opacity', String(this.num('opacity', 0.6)));
            this.replaceChildren();
            if (effect === 'noise')
                return;
            if (effect === 'gradient') {
                const upd = () => {
                    this._frame = 0;
                    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
                    this.style.setProperty('--usa-ambient-p', ((window.scrollY || 0) / max).toFixed(4));
                };
                if (!this.reduced)
                    this.listen(window, 'scroll', () => !this._frame && (this._frame = raf(upd)), { passive: true });
                upd();
                return;
            }
            const canvas = document.createElement('canvas');
            this.append(canvas);
            const ctx = canvas.getContext?.('2d');
            if (!ctx)
                return;
            const dpr = Math.min(2, window.devicePixelRatio || 1);
            let W = 0;
            let H = 0;
            const color = this.str('color', effect === 'snow' ? '#ffffff' : effect === 'stars' ? '#ffffff' : '#a78bfa');
            const speed = this.num('speed', 1);
            const resize = () => {
                W = window.innerWidth || 800;
                H = window.innerHeight || 600;
                canvas.width = W * dpr;
                canvas.height = H * dpr;
                canvas.style.width = `${W}px`;
                canvas.style.height = `${H}px`;
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            };
            resize();
            const base = effect === 'stars' ? 140 : effect === 'snow' ? 90 : 60;
            const n = Math.round(base * Math.max(0.2, Math.min(3, this.num('density', 1))) * Math.min(1.5, (W * H) / (1280 * 800)));
            const dots = Array.from({ length: n }, () => ({
                x: Math.random() * W,
                y: Math.random() * H,
                r: effect === 'stars' ? Math.random() * 1.3 + 0.2 : effect === 'snow' ? Math.random() * 2.6 + 0.8 : Math.random() * 2 + 0.6,
                vx: (Math.random() - 0.5) * 0.25,
                vy: effect === 'snow' ? Math.random() * 0.8 + 0.4 : (Math.random() - 0.5) * 0.25,
                t: Math.random() * Math.PI * 2,
            }));
            ctx.fillStyle = color;
            const draw = (move) => {
                ctx.clearRect(0, 0, W, H);
                for (const d of dots) {
                    if (move) {
                        d.t += 0.02 * speed;
                        d.x += (d.vx + (effect === 'snow' ? Math.sin(d.t) * 0.3 : 0)) * speed;
                        d.y += d.vy * speed;
                        if (d.y > H + 5)
                            d.y = -5;
                        if (d.y < -5)
                            d.y = H + 5;
                        if (d.x > W + 5)
                            d.x = -5;
                        if (d.x < -5)
                            d.x = W + 5;
                    }
                    ctx.globalAlpha = effect === 'stars' ? 0.35 + 0.65 * Math.abs(Math.sin(d.t)) : 0.85;
                    ctx.beginPath();
                    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
                    ctx.fill();
                }
            };
            this.listen(window, 'resize', () => {
                resize();
                ctx.fillStyle = color;
                draw(false);
            });
            if (this.reduced) {
                draw(false);
                return;
            }
            const loop = () => {
                if (!document.hidden)
                    draw(true);
                this._frame = raf(loop);
            };
            this._frame = raf(loop);
        }
        unmount() {
            caf(this._frame);
            this._frame = 0;
        }
    }, { id: 'ambient', text: css$4 });
}

var css$3 = "usa-splash{position:fixed;inset:0;z-index:2147483400;display:grid;place-items:center;background:var(--usa-splash-bg,var(--usa-surface,#0b0d12));color:var(--usa-text,#fff)}usa-splash[hidden]{display:none}";

function defineSplash(tag = 'usa-splash') {
    return defineElement(tag, (Base) => class UsaSplash extends Base {
        constructor() {
            super(...arguments);
            this._t0 = 0;
            this._gone = false;
        }
        mount() {
            this._t0 = Date.now();
            this.setAttribute('role', 'status');
            this.setAttribute('aria-label', this.str('label', 'Loading'));
            document.body?.setAttribute('aria-busy', 'true');
            if (this.flag('manual'))
                return;
            if (document.readyState === 'complete')
                this.done();
            else
                this.listen(window, 'load', () => this.done(), { once: true });
        }
        async done() {
            if (this._gone)
                return;
            this._gone = true;
            const wait = Math.max(0, this.num('min', 600) - (Date.now() - this._t0));
            if (wait)
                await new Promise((r) => setTimeout(r, wait));
            const exit = this.reduced ? 'fade' : this.str('exit', 'fade');
            const frames = {
                fade: [{ opacity: 1 }, { opacity: 0 }],
                scale: [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.15)' }],
                'slide-up': [{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }],
                circle: [{ clipPath: 'circle(150% at 50% 50%)' }, { clipPath: 'circle(0% at 50% 50%)' }],
            };
            const a = this.motion(this, frames[exit] || frames.fade, { duration: this.reduced ? 200 : 550, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'forwards' });
            await a?.finished.catch(() => undefined);
            document.body?.removeAttribute('aria-busy');
            this.hidden = true;
            this.emit('done');
        }
    }, { id: 'splash', text: css$3 });
}

var css$2 = "usa-auto-skeleton{display:block;--usa-skel-base:color-mix(in srgb,currentColor 10%,transparent);--usa-skel-shine:color-mix(in srgb,currentColor 18%,transparent)}usa-auto-skeleton[loading] :is(h1,h2,h3,h4,h5,h6,p,li,span,a,button,label,img,svg,video,input,select,textarea,td,th,figcaption,blockquote,[data-skeleton]):not([data-no-skeleton]):not(:has(:is(h1,h2,h3,h4,h5,h6,p,li,img,button,input))){color:transparent !important;border-color:transparent !important;box-shadow:none !important;user-select:none;pointer-events:none;background:linear-gradient(90deg,var(--usa-skel-base) 25%,var(--usa-skel-shine) 50%,var(--usa-skel-base) 75%) 0 0 / 300% 100% !important;border-radius:6px;animation:usa-skel-shimmer 1.4s ease-in-out infinite}usa-auto-skeleton[loading] :is(img,svg,video){opacity:0}usa-auto-skeleton[loading] :is(img,svg,video):not([data-no-skeleton]){opacity:1;object-position:-9999px}@keyframes usa-skel-shimmer{from{background-position:100% 0}to{background-position:0 0}}@media (prefers-reduced-motion:reduce){usa-auto-skeleton[loading] *{animation:none !important}}";

function defineAutoSkeleton(tag = 'usa-auto-skeleton') {
    return defineElement(tag, (Base) => class UsaAutoSkeleton extends Base {
        static get observedAttributes() {
            return ['loading'];
        }
        get loading() {
            return this.flag('loading');
        }
        set loading(v) {
            this.setFlag('loading', v);
        }
        mount() {
            this.sync(false);
        }
        changed() {
            this.sync(true);
        }
        sync(animate) {
            if (this.loading)
                this.setAttribute('aria-busy', 'true');
            else {
                this.removeAttribute('aria-busy');
                if (animate && !this.reduced)
                    this.motion(this, [{ opacity: 0.4 }, { opacity: 1 }], { duration: 300, easing: 'ease-out' });
            }
        }
    }, { id: 'auto-skeleton', text: css$2 });
}

var css$1 = "usa-motion-switch{--usa-motion-i:2;position:relative;display:inline-grid;grid-auto-flow:column;grid-auto-columns:1fr;padding:3px;border-radius:999px;background:color-mix(in srgb,currentColor 9%,transparent);isolation:isolate}usa-motion-switch button{position:relative;z-index:1;padding:6px 12px;border:0;background:none;color:inherit;font:inherit;font-size:0.85em;border-radius:999px;cursor:pointer}usa-motion-switch button[aria-checked=\"true\"]{color:var(--usa-accent-text,#fff)}usa-motion-switch button:focus-visible{outline:2px solid var(--usa-accent,#7c5cff);outline-offset:1px}usa-motion-switch .usa-motion-thumb{position:absolute;z-index:0;top:3px;bottom:3px;left:3px;width:calc((100% - 6px) / 4);border-radius:999px;background:var(--usa-accent,#7c5cff);transform:translateX(calc(var(--usa-motion-i) * 100%));transition:transform 0.4s cubic-bezier(0.34,1.4,0.64,1)}@media (prefers-reduced-motion:reduce){usa-motion-switch .usa-motion-thumb{transition:none}}";

const LEVELS = ['off', 'low', 'normal', 'high'];
const KEY = 'usa:motion';
/**
 * Set the global motion intensity for every `<usa-*>` component:
 * `'off'` (like reduced motion), `'low'`, `'normal'` (default), `'high'`.
 * Sets `--usa-motion` and `data-usa-motion` on `<html>`; with `persist`
 * the choice is remembered (localStorage) and restored by `restoreMotionIntensity()`.
 */
function setMotionIntensity(level, persist = false) {
    if (!LEVELS.includes(level))
        return;
    configureComponents({ motionIntensity: level });
    if (persist) {
        try {
            localStorage.setItem(KEY, level);
        }
        catch {
            /* private mode */
        }
    }
    if (typeof document !== 'undefined')
        document.dispatchEvent(new CustomEvent('usa:motion', { detail: { level } }));
}
/** Re-apply a persisted intensity (call early on page load). Returns it. */
function restoreMotionIntensity() {
    try {
        const v = localStorage.getItem(KEY);
        if (v && LEVELS.includes(v))
            setMotionIntensity(v);
    }
    catch {
        /* ignore */
    }
    return getMotionIntensity();
}
function defineMotionSwitch(tag = 'usa-motion-switch') {
    return defineElement(tag, (Base) => class UsaMotionSwitch extends Base {
        get value() {
            return getMotionIntensity();
        }
        set value(v) {
            setMotionIntensity(v, true);
            this.sync();
        }
        mount() {
            restoreMotionIntensity();
            const labels = this.str('labels', 'Off,Low,Normal,High').split(',');
            this.setAttribute('role', 'radiogroup');
            this.setAttribute('aria-label', this.str('label', 'Motion'));
            this.innerHTML = LEVELS.map((l, i) => `<button type="button" role="radio" data-level="${l}">${labels[i] || l}</button><span hidden></span>`.replace('<span hidden></span>', '')).join('') + '<span class="usa-motion-thumb" aria-hidden="true"></span>';
            this.listen(this, 'click', (e) => {
                const b = e.target.closest?.('[data-level]');
                if (b)
                    this.pick(b.dataset.level);
            });
            this.listen(this, 'keydown', (e) => {
                const i = LEVELS.indexOf(this.value);
                const n = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? i + 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? i - 1 : null;
                if (n === null)
                    return;
                e.preventDefault();
                this.pick(LEVELS[(n + LEVELS.length) % LEVELS.length]);
                this.querySelector('[aria-checked="true"]')?.focus();
            });
            this.listen(document, 'usa:motion', () => this.sync());
            this.sync();
        }
        pick(l) {
            this.value = l;
            this.emit('change', { level: l });
        }
        sync() {
            const v = this.value;
            const i = LEVELS.indexOf(v);
            this.style.setProperty('--usa-motion-i', String(i));
            this.querySelectorAll('[data-level]').forEach((b) => {
                const on = b.dataset.level === v;
                b.setAttribute('aria-checked', String(on));
                b.tabIndex = on ? 0 : -1;
            });
        }
    }, { id: 'motion-switch', text: css$1 });
}

var css = "::view-transition-group(root){animation-duration:var(--usa-pt-duration,600ms)}html[data-usa-pt] ::view-transition-old(root),html[data-usa-pt] ::view-transition-new(root){animation-duration:var(--usa-pt-duration,600ms);animation-timing-function:cubic-bezier(0.22,1,0.36,1);mix-blend-mode:normal}html[data-usa-pt=\"slide\"] ::view-transition-old(root),html[data-usa-pt=\"slide-left\"] ::view-transition-old(root){animation-name:usa-pt-out-left}html[data-usa-pt=\"slide\"] ::view-transition-new(root),html[data-usa-pt=\"slide-left\"] ::view-transition-new(root){animation-name:usa-pt-in-right}html[data-usa-pt=\"slide-right\"] ::view-transition-old(root){animation-name:usa-pt-out-right}html[data-usa-pt=\"slide-right\"] ::view-transition-new(root){animation-name:usa-pt-in-left}html[data-usa-pt=\"slide-up\"] ::view-transition-old(root){animation-name:usa-pt-out-up}html[data-usa-pt=\"slide-up\"] ::view-transition-new(root){animation-name:usa-pt-in-up}html[data-usa-pt=\"zoom\"] ::view-transition-old(root){animation-name:usa-pt-zoom-out}html[data-usa-pt=\"zoom\"] ::view-transition-new(root){animation-name:usa-pt-zoom-in}html[data-usa-pt=\"circle\"] ::view-transition-old(root){animation:none}html[data-usa-pt=\"circle\"] ::view-transition-new(root){animation-name:usa-pt-circle}html[data-usa-pt=\"blinds\"] ::view-transition-old(root){animation:none}html[data-usa-pt=\"blinds\"] ::view-transition-new(root){animation-name:usa-pt-blinds;-webkit-mask-image:repeating-linear-gradient(to bottom,#000 0 var(--usa-blind),transparent var(--usa-blind) 10vh);mask-image:repeating-linear-gradient(to bottom,#000 0 var(--usa-blind),transparent var(--usa-blind) 10vh)}html[data-usa-pt=\"pixel\"] ::view-transition-old(root){animation-name:usa-pt-pixel-out;animation-timing-function:steps(10,end)}html[data-usa-pt=\"pixel\"] ::view-transition-new(root){animation-name:usa-pt-pixel-in;animation-timing-function:steps(10,end)}@property --usa-blind{syntax:\"<length-percentage>\";inherits:false;initial-value:0vh}@keyframes usa-pt-out-left{to{transform:translateX(-30%);opacity:0}}@keyframes usa-pt-in-right{from{transform:translateX(30%);opacity:0}}@keyframes usa-pt-out-right{to{transform:translateX(30%);opacity:0}}@keyframes usa-pt-in-left{from{transform:translateX(-30%);opacity:0}}@keyframes usa-pt-out-up{to{transform:translateY(-12%);opacity:0}}@keyframes usa-pt-in-up{from{transform:translateY(12%);opacity:0}}@keyframes usa-pt-zoom-out{to{transform:scale(0.92);opacity:0}}@keyframes usa-pt-zoom-in{from{transform:scale(1.08);opacity:0}}@keyframes usa-pt-circle{from{clip-path:circle(0 at var(--usa-pt-x,50%) var(--usa-pt-y,50%))}to{clip-path:circle(var(--usa-pt-r,150vmax) at var(--usa-pt-x,50%) var(--usa-pt-y,50%))}}@keyframes usa-pt-blinds{from{--usa-blind:0vh}to{--usa-blind:10vh}}@keyframes usa-pt-pixel-out{to{opacity:0;filter:blur(6px) contrast(1.4)}}@keyframes usa-pt-pixel-in{from{opacity:0;filter:blur(6px) contrast(1.4)}}@media (prefers-reduced-motion:reduce){::view-transition-group(*),::view-transition-old(*),::view-transition-new(*){animation:none !important}}";

/**
 * Page & app-wide transitions (v2.7), built on the View Transitions API
 * (Chromium: Chrome, Edge, Electron, WebView2) with graceful fallbacks.
 *
 * - `pageTransition(update, { effect })` — SPA route changes: `fade`,
 *   `slide` (`slide-left` / `slide-right` / `slide-up`), `circle` (reveal
 *   from `x`, `y`), `blinds`, `pixel` (stepped dissolve), `zoom`.
 * - `enableMpaTransitions(effect)` — the same effects for multi-page sites
 *   (`@view-transition { navigation: auto }`); call it on every page.
 * - `themeTransition(apply, { x, y })` — a circle-reveal theme switch.
 *
 * Without View Transitions (Firefox, older Safari) or under reduced motion
 * the update runs immediately (`fade` falls back to a short cross-fade of
 * `fallback` when given).
 */
const PAGE_EFFECTS = ['fade', 'slide', 'slide-left', 'slide-right', 'slide-up', 'circle', 'blinds', 'pixel', 'zoom'];
let lastPointer = null;
function trackPointer() {
    if (typeof document === 'undefined' || trackPointer.done)
        return;
    trackPointer.done = true;
    document.addEventListener('pointerdown', (e) => (lastPointer = [e.clientX, e.clientY]), { capture: true, passive: true });
}
/** `true` when `document.startViewTransition` exists. */
const supportsViewTransitions = () => typeof document !== 'undefined' && typeof document.startViewTransition === 'function';
function setVars(o) {
    const d = document.documentElement;
    const W = window.innerWidth || 1024;
    const H = window.innerHeight || 768;
    const [x, y] = o.x !== undefined && o.y !== undefined ? [o.x, o.y] : lastPointer || [W / 2, H / 2];
    const r = Math.hypot(Math.max(x, W - x), Math.max(y, H - y));
    d.style.setProperty('--usa-pt-x', `${x}px`);
    d.style.setProperty('--usa-pt-y', `${y}px`);
    d.style.setProperty('--usa-pt-r', `${Math.ceil(r)}px`);
    d.style.setProperty('--usa-pt-duration', `${o.duration ?? 600}ms`);
}
/** Run `update` (sync or async) as an animated page transition. Resolves when it is done. */
async function pageTransition(update, options = {}) {
    if (typeof document === 'undefined') {
        await update();
        return;
    }
    adoptStyles('page-transitions', css);
    trackPointer();
    const effect = options.effect || 'fade';
    if (prefersReducedMotion() || !supportsViewTransitions()) {
        await update();
        const f = options.fallback;
        if (f && typeof f.animate === 'function' && !prefersReducedMotion())
            await f.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 }).finished.catch(() => undefined);
        return;
    }
    const d = document.documentElement;
    setVars(options);
    d.setAttribute('data-usa-pt', effect);
    try {
        const vt = document.startViewTransition(() => update());
        await vt.finished;
    }
    finally {
        d.removeAttribute('data-usa-pt');
    }
}
/** Opt a multi-page site into cross-document view transitions with `effect`. */
function enableMpaTransitions(effect = 'fade', duration = 450) {
    if (typeof document === 'undefined')
        return;
    adoptStyles('page-transitions', css);
    adoptStyles('mpa-transitions', prefersReducedMotion() ? '' : '@view-transition{navigation:auto}');
    const d = document.documentElement;
    d.setAttribute('data-usa-pt', effect);
    setVars({ duration });
}
/**
 * Switch theme with a circle reveal from (`x`, `y`) (default: last pointer).
 * `apply` flips your theme (e.g. toggles a class / `data-theme`).
 */
function themeTransition(apply, options = {}) {
    return pageTransition(apply, { ...options, effect: 'circle', duration: options.duration ?? 650 });
}

/**
 * use-scroll-animate/components/page — page & app-wide effects (v2.7).
 * Page transitions (`pageTransition()`, `enableMpaTransitions()`,
 * `themeTransition()`), `<usa-cursor>`, `smoothScroll()` / `scrollToTarget()`,
 * `<usa-fullpage>`, `<usa-loading-bar>` + `loadingBar`, `<usa-back-to-top>`,
 * `<usa-ambient>`, `<usa-splash>`, `<usa-auto-skeleton>` and the global motion
 * intensity (`setMotionIntensity()`, `<usa-motion-switch>`).
 */
/** Register every component of this category under its default tag. */
function definePageComponents() {
    defineCursor();
    defineFullpage();
    defineLoadingBar();
    defineBackToTop();
    defineAmbient();
    defineSplash();
    defineAutoSkeleton();
    defineMotionSwitch();
}

export { AMBIENT_EFFECTS, CURSOR_MODES, PAGE_EFFECTS, configureComponents, defineAmbient, defineAutoSkeleton, defineBackToTop, defineCursor, defineFullpage, defineLoadingBar, defineMotionSwitch, definePageComponents, defineSplash, enableMpaTransitions, getMotionIntensity, loadingBar, pageTransition, prefersReducedMotion, restoreMotionIntensity, scrollToTarget, setMotionIntensity, smoothScroll, supportsViewTransitions, themeTransition };
//# sourceMappingURL=page.js.map
