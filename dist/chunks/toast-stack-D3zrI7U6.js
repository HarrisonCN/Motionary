import { f as defineElement } from './base-zSGb8ujt.js';
import { p as part } from './shared-C8Pi6tuh.js';
import { b as delegateTriggers } from './sheet-BHvZA7rD.js';

var css = "usa-toast-stack{position:fixed;z-index:2147482000;width:min(360px,calc(100vw - 24px));pointer-events:none;--usa-tstack-bg:#111827;--usa-tstack-fg:#f9fafb}usa-toast-stack[contained]{position:absolute;width:min(360px,calc(100% - 24px))}usa-toast-stack[data-position^=\"bottom\"]{bottom:12px}usa-toast-stack[data-position^=\"top\"]{top:12px}usa-toast-stack[data-position$=\"right\"]{right:12px}usa-toast-stack[data-position$=\"left\"]{left:12px}usa-toast-stack[data-position$=\"center\"]{left:50%;transform:translateX(-50%)}.usa-tstack-list{position:relative;list-style:none;margin:0;padding:0;min-height:1px;transition:height .3s}.usa-tstack{position:absolute;left:0;right:0;display:flex;align-items:center;gap:10px;box-sizing:border-box;padding:12px 12px 12px 14px;border-radius:14px;background:var(--usa-tstack-bg);color:var(--usa-tstack-fg);box-shadow:0 12px 32px -10px rgba(0,0,0,.45);font:500 14px/1.35 system-ui,sans-serif;pointer-events:auto;touch-action:pan-y;transition:transform .38s cubic-bezier(.22,1,.36,1),opacity .3s;user-select:none}usa-toast-stack[data-position^=\"bottom\"] .usa-tstack{bottom:0;transform-origin:50% 100%}usa-toast-stack[data-position^=\"top\"] .usa-tstack{top:0;transform-origin:50% 0}.usa-tstack-icon{flex:none;display:grid;place-items:center;width:22px;height:22px;border-radius:50%;font-size:13px;font-weight:800;background:#3b82f6;color:#fff}.usa-tstack-success .usa-tstack-icon{background:#22c55e}.usa-tstack-warning .usa-tstack-icon{background:#f59e0b}.usa-tstack-error .usa-tstack-icon{background:#ef4444}.usa-tstack-text{flex:1;min-width:0;display:flex;flex-direction:column}.usa-tstack-text strong{font-weight:700}.usa-tstack-action{border:0;border-radius:8px;padding:6px 10px;background:rgba(255,255,255,.14);color:inherit;font:600 13px system-ui,sans-serif;cursor:pointer}.usa-tstack-close{border:0;background:none;color:inherit;opacity:.6;font-size:18px;line-height:1;cursor:pointer;padding:2px 4px}.usa-tstack-close:hover{opacity:1}@media (prefers-reduced-motion:reduce){.usa-tstack,.usa-tstack-list{transition:none}}";

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
                return ['position', 'duration', 'max'];
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
    }, { id: 'toast', text: css });
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
    // contract-exempt: lifecycle-global-listener — one delegated listener for [data-usa-toast] triggers, installed once per page, never per element
    document.addEventListener('click', (e) => {
        const t = e.target?.closest?.('[data-usa-toast]');
        if (!t)
            return;
        const target = t.getAttribute('data-usa-target');
        const s = target ? document.getElementById(target) : null;
        stackToast({ message: t.getAttribute('data-usa-toast') || '', title: t.getAttribute('data-usa-toast-title') || undefined, type: t.getAttribute('data-usa-toast-type') || 'info' }, s);
    });
}

export { TOAST_POSITIONS as T, defineToastStack as d, stackToast as s };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.9.0/dist/chunks/toast-stack-D3zrI7U6.js.map