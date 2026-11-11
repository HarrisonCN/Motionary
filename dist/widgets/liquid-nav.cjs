'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');

var css = "usa-liquid-nav{position:relative;display:inline-flex;align-items:center;gap:4px;padding:8px 10px 18px;border-radius:18px;background:var(--usa-lq-bg,#0f172a);color:#e2e8f0;font:600 13px/1 system-ui,sans-serif;--usa-lq-accent:#38bdf8}.usa-lq-defs{position:absolute}.usa-lq-goo{position:absolute;left:0;right:0;bottom:4px;height:14px;pointer-events:none}.usa-lq-goo i{position:absolute;left:-6px;top:1px;width:12px;height:12px;border-radius:50%;background:var(--usa-lq-accent)}.usa-lq-tail{width:9px!important;height:9px!important;left:-4.5px!important;top:2.5px!important}.usa-lq-item{position:relative;padding:8px 12px;border:0;border-radius:10px;background:none;color:inherit;font:inherit;text-decoration:none;cursor:pointer;opacity:.7;transition:opacity .2s,color .2s}.usa-lq-item[aria-current]{opacity:1;color:var(--usa-lq-accent)}.usa-lq-item:focus-visible{outline:2px solid var(--usa-lq-accent);outline-offset:1px;opacity:1}usa-liquid-nav[data-orientation=\"vertical\"]{flex-direction:column;align-items:stretch;padding:10px 18px 10px 10px}usa-liquid-nav[data-orientation=\"vertical\"]>.usa-lq-goo{left:auto;right:4px;top:0;bottom:0;width:14px;height:auto}usa-liquid-nav[data-orientation=\"vertical\"]>.usa-lq-goo i{left:1px;top:-6px}usa-liquid-nav[data-orientation=\"vertical\"]>.usa-lq-goo .usa-lq-tail{left:2.5px!important;top:-4.5px!important}.usa-lq-item:disabled,.usa-lq-item[aria-disabled=\"true\"]{cursor:default;opacity:.4}";

let uid = 0;
function defineLiquidNav(tag = 'usa-liquid-nav') {
    return base.defineElement(tag, (Base) => {
        class UsaLiquidNav extends Base {
            constructor() {
                super(...arguments);
                this._i = 0;
                this._animations = [];
                this._id = `usa-lq-${++uid}`;
            }
            static get observedAttributes() {
                return ['label', 'value', 'orientation'];
            }
            items() {
                return Array.from(this.children).filter((c) => !c.hasAttribute('data-usa-part'));
            }
            get value() {
                return this._i;
            }
            set value(i) {
                if (Number.isInteger(i) && this.items()[i])
                    this.setAttribute('value', String(i));
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this.setAttribute('role', 'navigation');
                this.setAttribute('aria-label', this.str('label', 'Main'));
                this.insertAdjacentHTML('afterbegin', `<svg class="usa-lq-defs" aria-hidden="true" width="0" height="0" data-usa-part><filter id="${this._id}"><feGaussianBlur in="SourceGraphic" stdDeviation="5"/><feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 20 -9"/></filter></svg><span class="usa-lq-goo" aria-hidden="true" style="filter:url(#${this._id})" data-usa-part><i class="usa-lq-drop"></i><i class="usa-lq-tail"></i></span>`);
                const items = this.items();
                const cur = items.findIndex((it) => it.getAttribute('aria-current') === 'page' || it.hasAttribute('data-active'));
                this._i = !this.hasAttribute('value') && cur >= 0 ? cur : Math.max(0, Math.min(items.length - 1, Math.round(this.num('value', 0))));
                this.dataset.orientation = this.vertical ? 'vertical' : 'horizontal';
                items.forEach((it, i) => {
                    it.classList.add('usa-lq-item');
                    this.listen(it, 'click', () => this.select(i, true));
                    this.listen(it, 'keydown', (e) => {
                        const enabled = items.filter((item) => !this.disabled(item));
                        const rtl = getComputedStyle(this).direction === 'rtl';
                        const next = this.vertical ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight';
                        const previous = this.vertical ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft';
                        const d = e.key === next ? 1 : e.key === previous ? -1 : 0;
                        if ((!d && e.key !== 'Home' && e.key !== 'End') || !enabled.length)
                            return;
                        e.preventDefault();
                        const index = e.key === 'Home' ? 0 : e.key === 'End' ? enabled.length - 1 : (enabled.indexOf(items[i]) + d + enabled.length) % enabled.length;
                        enabled[index].focus();
                    });
                });
                this.place(false);
                // ResizeObserver already batches size changes before paint; writing
                // transforms here does not resize the observed elements.
                const realign = () => this.place(false);
                if (typeof ResizeObserver === 'function') {
                    const observer = new ResizeObserver(realign);
                    observer.observe(this);
                    items.forEach((item) => observer.observe(item));
                    this.onCleanup(() => observer.disconnect());
                }
                this.listen(window, 'resize', realign);
            }
            get vertical() {
                return this.getAttribute('orientation') === 'vertical';
            }
            disabled(item) {
                return item.matches(':disabled, [aria-disabled="true"], [hidden], [inert]');
            }
            changed(name) {
                if (name === 'value') {
                    this.select(Math.max(0, Math.min(this.items().length - 1, Math.round(this.num('value', 0)))), false);
                }
                else
                    super.changed(name);
            }
            select(i, user) {
                const items = this.items();
                if (!items[i] || (user && this.disabled(items[i])) || i === this._i)
                    return;
                this._i = i;
                // Keep declarative state in sync so reconnects preserve the selection.
                this.setAttribute('value', String(i));
                this.place(user && !this.reduced);
                if (user)
                    this.emit('change', { index: i, item: items[i] });
            }
            stop() {
                this._animations.forEach((animation) => animation.cancel());
                this._animations = [];
            }
            unmount() {
                this.stop();
            }
            place(animate) {
                const items = this.items();
                items.forEach((it, k) => {
                    if (k === this._i)
                        it.setAttribute('aria-current', 'page');
                    else
                        it.removeAttribute('aria-current');
                });
                const it = items[this._i];
                const drop = this.querySelector('.usa-lq-drop');
                const tail = this.querySelector('.usa-lq-tail');
                if (!it || !drop || !tail)
                    return;
                const vertical = this.vertical;
                const axis = vertical ? 'Y' : 'X';
                const target = vertical ? it.offsetTop + it.offsetHeight / 2 : it.offsetLeft + it.offsetWidth / 2;
                // Capture each rendered transform before cancellation. This also
                // preserves continuity inside scaled or transformed containers.
                const starts = [drop, tail].map((node) => getComputedStyle(node).transform);
                this.stop();
                const end = `translate${axis}(${target}px)`;
                drop.style.transform = end;
                tail.style.transform = end;
                if (!animate)
                    return;
                const stretch = vertical ? 'scale(.8, 1.35)' : 'scale(1.35, .8)';
                [drop, tail].forEach((node, i) => {
                    const animation = this.motion(node, [
                        { transform: starts[i] },
                        { transform: `${end} ${stretch}`, offset: 0.7 },
                        { transform: end },
                    ], { duration: i ? 760 : 620, easing: 'cubic-bezier(.4,0,.2,1)' });
                    if (animation)
                        this._animations.push(animation);
                });
            }
        }
        return UsaLiquidNav;
    }, { id: 'liquid-nav', text: css });
}

exports.defineLiquidNav = defineLiquidNav;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.4.0/dist/widgets/liquid-nav.cjs.map