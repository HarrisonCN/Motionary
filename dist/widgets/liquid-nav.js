import { f as defineElement } from '../chunks/base-zSGb8ujt.js';

var css = "usa-liquid-nav{position:relative;display:inline-flex;align-items:center;gap:4px;padding:8px 10px 18px;border-radius:18px;background:var(--usa-lq-bg,#0f172a);color:#e2e8f0;font:600 13px/1 system-ui,sans-serif;--usa-lq-accent:#38bdf8}.usa-lq-defs{position:absolute}.usa-lq-goo{position:absolute;left:0;right:0;bottom:4px;height:14px;pointer-events:none}.usa-lq-goo i{position:absolute;left:-6px;top:1px;width:12px;height:12px;border-radius:50%;background:var(--usa-lq-accent)}.usa-lq-tail{width:9px!important;height:9px!important;left:-4.5px!important;top:2.5px!important}.usa-lq-item{position:relative;padding:8px 12px;border:0;border-radius:10px;background:none;color:inherit;font:inherit;text-decoration:none;cursor:pointer;opacity:.7;transition:opacity .2s,color .2s}.usa-lq-item[aria-current]{opacity:1;color:var(--usa-lq-accent)}.usa-lq-item:focus-visible{outline:2px solid var(--usa-lq-accent);outline-offset:1px;opacity:1}";

let uid = 0;
function defineLiquidNav(tag = 'usa-liquid-nav') {
    return defineElement(tag, (Base) => {
        class UsaLiquidNav extends Base {
            constructor() {
                super(...arguments);
                this._i = 0;
                this._id = `usa-lq-${++uid}`;
            }
            static get observedAttributes() {
                return ['label', 'value'];
            }
            items() {
                return Array.from(this.children).filter((c) => !c.hasAttribute('data-usa-part'));
            }
            get value() {
                return this._i;
            }
            set value(i) {
                this.select(i, false);
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this.setAttribute('role', 'navigation');
                this.setAttribute('aria-label', this.str('label', 'Main'));
                this.insertAdjacentHTML('afterbegin', `<svg class="usa-lq-defs" aria-hidden="true" width="0" height="0" data-usa-part><filter id="${this._id}"><feGaussianBlur in="SourceGraphic" stdDeviation="5"/><feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 20 -9"/></filter></svg><span class="usa-lq-goo" aria-hidden="true" style="filter:url(#${this._id})" data-usa-part><i class="usa-lq-drop"></i><i class="usa-lq-tail"></i></span>`);
                const items = this.items();
                const cur = items.findIndex((it) => it.getAttribute('aria-current') === 'page' || it.hasAttribute('data-active'));
                this._i = cur >= 0 ? cur : Math.max(0, Math.min(items.length - 1, Math.round(this.num('value', 0))));
                items.forEach((it, i) => {
                    it.classList.add('usa-lq-item');
                    this.listen(it, 'click', () => this.select(i, true));
                    this.listen(it, 'keydown', (e) => {
                        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
                        if (!d)
                            return;
                        e.preventDefault();
                        items[(i + d + items.length) % items.length].focus();
                    });
                });
                requestAnimationFrame(() => this.place(false));
                this.place(false);
                this.listen(window, 'resize', () => this.place(false));
            }
            select(i, user) {
                const items = this.items();
                if (!items[i] || (i === this._i && user))
                    return;
                const from = this._i;
                this._i = i;
                this.place(user && !this.reduced, from);
                if (user)
                    this.emit('change', { index: i, item: items[i] });
            }
            place(animate, from = this._i) {
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
                const x = it.offsetLeft + it.offsetWidth / 2;
                const px = items[from] ? items[from].offsetLeft + items[from].offsetWidth / 2 : x;
                drop.style.transform = `translateX(${x}px)`;
                tail.style.transform = `translateX(${x}px)`;
                if (!animate || px === x)
                    return;
                const dir = Math.sign(x - px);
                this.motion(drop, [{ transform: `translateX(${px}px) scale(1)` }, { transform: `translateX(${px + (x - px) * 0.6}px) scale(1.35, .8)`, offset: 0.45 }, { transform: `translateX(${x + dir * 4}px) scale(.9, 1.12)`, offset: 0.75 }, { transform: `translateX(${x}px) scale(1)` }], { duration: 620, easing: 'cubic-bezier(.4,0,.2,1)' });
                this.motion(tail, [{ transform: `translateX(${px}px) scale(1)` }, { transform: `translateX(${px + (x - px) * 0.25}px) scale(.7)`, offset: 0.5 }, { transform: `translateX(${x}px) scale(.9)`, offset: 0.85 }, { transform: `translateX(${x}px) scale(1)` }], { duration: 760, easing: 'cubic-bezier(.4,0,.2,1)' });
            }
        }
        return UsaLiquidNav;
    }, { id: 'liquid-nav', text: css });
}

export { defineLiquidNav };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.1.0/dist/widgets/liquid-nav.js.map