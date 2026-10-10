'use strict';

var base = require('./base-BG_mxssu.cjs');
var shared = require('./shared-BxK1D7EZ.cjs');

var css = "usa-tip{position:relative;display:inline-block}.usa-tip-bubble{position:absolute;left:0;top:0;z-index:60;box-sizing:border-box;max-width:min(260px,calc(100vw - 16px));width:max-content;padding:7px 11px;border-radius:9px;background:var(--usa-tip-bg,#111827);color:var(--usa-tip-fg,#f9fafb);font:500 13px/1.4 system-ui,sans-serif;box-shadow:0 10px 26px -8px rgba(0,0,0,.4);text-align:left;white-space:normal}.usa-tip-bubble[hidden]{display:none}.usa-tip-bubble[data-placement=\"top\"]{transform-origin:50% 100%}.usa-tip-bubble[data-placement=\"bottom\"]{transform-origin:50% 0}.usa-tip-bubble[data-placement=\"left\"]{transform-origin:100% 50%}.usa-tip-bubble[data-placement=\"right\"]{transform-origin:0 50%}.usa-tip-arrow{position:absolute;width:10px;height:10px;background:inherit;transform:rotate(45deg)}.usa-tip-bubble[data-placement=\"top\"] .usa-tip-arrow{bottom:-4px;left:calc(50% - 5px + var(--usa-tip-shift,0px))}.usa-tip-bubble[data-placement=\"bottom\"] .usa-tip-arrow{top:-4px;left:calc(50% - 5px + var(--usa-tip-shift,0px))}.usa-tip-bubble[data-placement=\"left\"] .usa-tip-arrow{right:-4px;top:calc(50% - 5px)}.usa-tip-bubble[data-placement=\"right\"] .usa-tip-arrow{left:-4px;top:calc(50% - 5px)}";

const TIP_PLACEMENTS = ['top', 'bottom', 'left', 'right'];
const FLIP = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
function defineTip(tag = 'usa-tip') {
    return base.defineElement(tag, (Base) => {
        class UsaTip extends Base {
            constructor() {
                super(...arguments);
                this._bubble = null;
                this._trigger = null;
                this._open = false;
                this._t = 0;
            }
            static get observedAttributes() {
                return ['text', 'placement', 'trigger', 'delay'];
            }
            get opened() {
                return this._open;
            }
            mount() {
                this.querySelectorAll(':scope > .usa-tip-bubble[data-usa-part]').forEach((n) => n.remove());
                const rich = this.querySelector(':scope > [slot="tip"], :scope > [data-tip]');
                this._trigger = Array.from(this.children).find((c) => c !== rich && !c.matches('.usa-tip-bubble'));
                const b = rich || shared.part('span', 'usa-tip-bubble');
                b.classList.add('usa-tip-bubble');
                if (!rich)
                    b.textContent = this.str('text', '');
                b.id || (b.id = shared.nextId('usa-tipb'));
                b.hidden = true;
                if (!b.querySelector(':scope > .usa-tip-arrow'))
                    b.append(shared.part('span', 'usa-tip-arrow', { 'aria-hidden': 'true' }));
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
    }, { id: 'tip', text: css });
}

exports.TIP_PLACEMENTS = TIP_PLACEMENTS;
exports.defineTip = defineTip;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.0.1/dist/chunks/tip-CoXfHx5J.cjs.map