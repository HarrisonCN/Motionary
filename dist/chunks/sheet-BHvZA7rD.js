import { f as defineElement } from './base-zSGb8ujt.js';
import { p as part, o as ownChildren } from './shared-C8Pi6tuh.js';

var css = "usa-modal,usa-sheet{display:contents}.usa-ov{border:0;padding:0;margin:auto;color:inherit;background:transparent;max-width:min(92vw,520px);max-height:88vh;overflow:visible}.usa-ov::backdrop{background:rgba(10,12,20,.45);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}.usa-ov-body{box-sizing:border-box;background:var(--usa-ov-bg,#fff);color:var(--usa-ov-fg,#111827);border-radius:var(--usa-ov-radius,18px);padding:var(--usa-ov-pad,22px);box-shadow:0 30px 80px -20px rgba(0,0,0,.45);max-height:88vh;overflow:auto}.usa-sheet-panel{margin:0;max-width:none;max-height:none}usa-sheet[data-side=\"right\"] .usa-sheet-panel{inset:0 0 0 auto;height:100%;width:min(88vw,var(--usa-sheet-size,380px))}usa-sheet[data-side=\"left\"] .usa-sheet-panel{inset:0 auto 0 0;height:100%;width:min(88vw,var(--usa-sheet-size,380px))}usa-sheet[data-side=\"bottom\"] .usa-sheet-panel{inset:auto 0 0 0;width:100%;max-height:85vh}usa-sheet[data-side=\"top\"] .usa-sheet-panel{inset:0 0 auto 0;width:100%;max-height:85vh}usa-sheet .usa-ov-body{height:100%;max-height:inherit;border-radius:0}usa-sheet[data-side=\"bottom\"] .usa-ov-body{border-radius:var(--usa-ov-radius,18px) var(--usa-ov-radius,18px) 0 0;height:auto;max-height:85vh;touch-action:none}usa-sheet[data-side=\"top\"] .usa-ov-body{border-radius:0 0 var(--usa-ov-radius,18px) var(--usa-ov-radius,18px);height:auto}.usa-ov-grab{width:44px;height:5px;border-radius:3px;background:rgba(127,127,127,.45);margin:-8px auto 14px;cursor:grab}@media (prefers-color-scheme:dark){.usa-ov-body{background:var(--usa-ov-bg,#171a23);color:var(--usa-ov-fg,#e5e7eb)}}";

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
    }, { id: 'overlay', text: css });
}
const defineModal = (tag = 'usa-modal') => defineOverlay(tag, 'modal');
const defineSheet = (tag = 'usa-sheet') => defineOverlay(tag, 'sheet');

export { MODAL_EFFECTS as M, SHEET_SIDES as S, defineModal as a, delegateTriggers as b, defineSheet as d };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.8.0/dist/chunks/sheet-BHvZA7rD.js.map