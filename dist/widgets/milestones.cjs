'use strict';

var base = require('../chunks/base-B3me2y0o.cjs');
var shared = require('../chunks/shared-BxK1D7EZ.cjs');

var css = "usa-milestones{position:relative;display:block;--usa-ms-color:#7c5cff;--usa-ms-rail:rgba(127,127,127,.22);--usa-ms-gap:28px;padding:4px 0}.usa-ms-rail{position:absolute;top:0;bottom:0;left:50%;width:3px;margin-left:-1.5px;border-radius:3px;background:var(--usa-ms-rail);overflow:hidden}.usa-ms-fill{position:absolute;inset:0;background:linear-gradient(var(--usa-ms-color),#22d3ee);transform-origin:50% 0;transform:scaleY(0)}.usa-ms-item{position:relative;box-sizing:border-box;width:50%;padding:0 var(--usa-ms-gap) var(--usa-ms-gap);text-align:left}.usa-ms-item[data-side=\"right\"]{margin-left:50%}.usa-ms-item[data-side=\"left\"]{text-align:right}.usa-ms-dot{position:absolute;top:4px;width:14px;height:14px;border-radius:50%;background:var(--usa-ms-color);box-shadow:0 0 0 4px color-mix(in srgb,var(--usa-ms-color) 22%,transparent);transform:scale(0)}.usa-ms-item[data-reached] .usa-ms-dot{transform:none}.usa-ms-item[data-side=\"right\"] .usa-ms-dot{left:-7px}.usa-ms-item[data-side=\"left\"] .usa-ms-dot{right:-7px}.usa-ms-date{display:block;font-size:.8em;font-weight:700;letter-spacing:.04em;color:var(--usa-ms-color);margin-bottom:2px}.usa-ms-item:not([data-reached])>:not(.usa-ms-dot){opacity:0}usa-milestones[data-layout=\"left\"] .usa-ms-rail{left:7px}usa-milestones[data-layout=\"left\"] .usa-ms-item{width:auto;margin-left:0;padding-left:calc(var(--usa-ms-gap) + 8px);text-align:left}usa-milestones[data-layout=\"left\"] .usa-ms-dot{left:1px;right:auto}@media (max-width:640px){usa-milestones .usa-ms-rail{left:7px}usa-milestones .usa-ms-item{width:auto;margin-left:0;padding-left:calc(var(--usa-ms-gap) + 8px);text-align:left}usa-milestones .usa-ms-item .usa-ms-dot{left:1px;right:auto}}";

function defineMilestones(tag = 'usa-milestones') {
    return base.defineElement(tag, (Base) => {
        class UsaMilestones extends Base {
            constructor() {
                super(...arguments);
                this._items = [];
                this._fill = null;
                this._reached = -1;
                this._raf = 0;
            }
            static get observedAttributes() {
                return ['layout'];
            }
            get reached() {
                return this._reached;
            }
            mount() {
                this.dataset.layout = this.str('layout', 'alternate') === 'left' ? 'left' : 'alternate';
                this.setAttribute('role', this.getAttribute('role') || 'list');
                this.querySelectorAll(':scope > .usa-ms-rail').forEach((n) => n.remove());
                const rail = shared.part('div', 'usa-ms-rail', { 'aria-hidden': 'true' });
                this._fill = shared.part('div', 'usa-ms-fill');
                rail.append(this._fill);
                this.prepend(rail);
                this._items = shared.ownChildren(this, '[data-usa-part],.usa-ms-rail');
                this._items.forEach((it, i) => {
                    it.classList.add('usa-ms-item');
                    it.setAttribute('role', 'listitem');
                    it.dataset.side = this.dataset.layout === 'left' || i % 2 === 0 ? 'right' : 'left';
                    if (!it.querySelector(':scope > .usa-ms-dot'))
                        it.prepend(shared.part('span', 'usa-ms-dot', { 'aria-hidden': 'true' }));
                    const date = it.dataset.date;
                    if (date && !it.querySelector(':scope > .usa-ms-date'))
                        it.querySelector(':scope > .usa-ms-dot').after(shared.part('span', 'usa-ms-date', {}, ''));
                    const d = it.querySelector(':scope > .usa-ms-date');
                    if (d && date)
                        d.textContent = date;
                });
                this._reached = -1;
                if (this.reduced) {
                    this._fill.style.transform = 'scaleY(1)';
                    this._items.forEach((it) => it.setAttribute('data-reached', ''));
                    this._reached = this._items.length - 1;
                    return;
                }
                const on = () => {
                    if (!this._raf)
                        this._raf = typeof requestAnimationFrame === 'function' ? requestAnimationFrame(() => this.update()) : (this.update(), 0);
                };
                this.listen(window, 'scroll', on, { passive: true });
                this.listen(window, 'resize', on);
                this.onCleanup(() => {
                    if (this._raf && typeof cancelAnimationFrame === 'function')
                        cancelAnimationFrame(this._raf);
                });
                this.update();
            }
            /** Fill the rail up to the viewport's 60 % line and reveal the milestones it passed. */
            update() {
                this._raf = 0;
                const r = this.getBoundingClientRect();
                const vh = (typeof window !== 'undefined' && window.innerHeight) || 800;
                const line = vh * 0.6;
                const p = r.height ? Math.min(1, Math.max(0, (line - r.top) / r.height)) : 0;
                if (this._fill)
                    this._fill.style.transform = `scaleY(${p.toFixed(4)})`;
                this._items.forEach((it, i) => {
                    if (it.hasAttribute('data-reached'))
                        return;
                    const top = it.getBoundingClientRect().top;
                    if (top < line || p >= 1) {
                        it.setAttribute('data-reached', '');
                        const card = Array.from(it.children).filter((c) => !c.matches('.usa-ms-dot,.usa-ms-date'));
                        const dot = it.querySelector(':scope > .usa-ms-dot');
                        if (dot)
                            this.motion(dot, [{ transform: 'scale(0)' }, { transform: 'scale(1.5)', offset: 0.6 }, { transform: 'scale(1)' }], { duration: 420, easing: 'cubic-bezier(.3,1.4,.5,1)' });
                        const dx = it.dataset.side === 'left' ? -28 : 28;
                        card.forEach((c, k) => this.motion(c, [{ opacity: 0, transform: `translateX(${dx}px)` }, { opacity: 1, transform: 'none' }], { duration: 520, delay: 80 + k * 60, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' }));
                        if (i > this._reached)
                            this._reached = i;
                        this.emit('reach', { index: i });
                    }
                });
            }
        }
        return UsaMilestones;
    }, { id: 'milestones', text: css });
}

exports.defineMilestones = defineMilestones;
//# sourceMappingURL=milestones.cjs.map
