'use strict';

var base = require('./base-BG_mxssu.cjs');
var shared = require('./shared-BxK1D7EZ.cjs');

var css = "usa-pagination{--usa-pg-c:#7c5cff;display:inline-flex;align-items:center;gap:4px;max-width:100%;font:600 14px/1 system-ui,sans-serif}.usa-pg-list{position:relative;display:inline-flex;align-items:center;gap:2px;isolation:isolate}.usa-pg-ink{position:absolute;left:0;top:0;height:100%;width:0;border-radius:10px;background:var(--usa-pg-c);z-index:-1;transition:width .3s}.usa-pg-btn{display:grid;place-items:center;min-width:34px;height:34px;padding:0 6px;border:0;border-radius:10px;background:none;color:inherit;font:inherit;cursor:pointer;transition:color .25s,background .2s}.usa-pg-btn:hover:not(:disabled):not([aria-current]){background:rgba(127,127,127,.14)}.usa-pg-btn[aria-current=\"page\"]{color:#fff}.usa-pg-btn:disabled{opacity:.35;cursor:default}.usa-pg-btn:focus-visible{outline:2px solid var(--usa-pg-c);outline-offset:2px}.usa-pg-gap{min-width:20px;text-align:center;opacity:.6}@media (max-width:420px){.usa-pg-btn{min-width:28px;height:30px;padding:0 3px}}@media (prefers-reduced-motion:reduce){.usa-pg-ink{transition:none}}";

/** The visible page list: numbers and `'…'` gaps (1-based). */
function pageWindow(page, total, siblings = 1) {
    const out = [];
    const lo = Math.max(2, page - siblings);
    const hi = Math.min(total - 1, page + siblings);
    out.push(1);
    if (lo > 2)
        out.push('…');
    for (let p = lo; p <= hi; p++)
        out.push(p);
    if (hi < total - 1)
        out.push('…');
    if (total > 1)
        out.push(total);
    return out;
}
function definePagination(tag = 'usa-pagination') {
    // contract-exempt: attr-unobserved(page) — state reflected by the element itself (set the property instead); observing it would re-mount on every change
    return base.defineElement(tag, (Base) => {
        class UsaPagination extends Base {
            constructor() {
                super(...arguments);
                this._page = 1;
                this._ink = null;
                this._list = null;
            }
            static get observedAttributes() {
                return ['total', 'siblings', 'label'];
            }
            get total() {
                return Math.max(1, this.num('total', 1) | 0);
            }
            get page() {
                return this._page;
            }
            set page(p) {
                this.go(p);
            }
            mount() {
                shared.dropParts(this);
                this.setAttribute('role', 'navigation');
                if (!this.hasAttribute('aria-label'))
                    this.setAttribute('aria-label', this.str('label', 'Pagination'));
                this._page = shared.clampN(this.num('page', 1) | 0, 1, this.total);
                const prev = this.btn('‹', 'Previous page', 'usa-pg-prev');
                const next = this.btn('›', 'Next page', 'usa-pg-next');
                this._list = document.createElement('span');
                this._list.className = 'usa-pg-list';
                this._list.setAttribute('data-usa-part', '');
                this._ink = document.createElement('span');
                this._ink.className = 'usa-pg-ink';
                this._ink.setAttribute('aria-hidden', 'true');
                this._list.appendChild(this._ink);
                this.append(prev, this._list, next);
                this.listen(prev, 'click', () => this.go(this._page - 1));
                this.listen(next, 'click', () => this.go(this._page + 1));
                this.listen(this._list, 'click', (e) => {
                    const b = e.target.closest?.('[data-page]');
                    if (b)
                        this.go(Number(b.dataset.page));
                });
                this.render(0);
            }
            btn(txt, label, cls) {
                const b = document.createElement('button');
                b.type = 'button';
                b.className = 'usa-pg-btn ' + cls;
                b.textContent = txt;
                b.setAttribute('aria-label', label);
                b.setAttribute('data-usa-part', '');
                return b;
            }
            render(dir) {
                const list = this._list;
                const old = new Map(Array.from(list.querySelectorAll('[data-page]')).map((b) => [b.dataset.page, b]));
                list.querySelectorAll('.usa-pg-btn,.usa-pg-gap').forEach((n) => n.remove());
                for (const p of pageWindow(this._page, this.total, Math.max(0, this.num('siblings', 1) | 0))) {
                    if (p === '…') {
                        const g = document.createElement('span');
                        g.className = 'usa-pg-gap';
                        g.textContent = '…';
                        g.setAttribute('aria-hidden', 'true');
                        list.appendChild(g);
                        continue;
                    }
                    const b = this.btn(String(p), `Page ${p}`, 'usa-pg-num');
                    b.dataset.page = String(p);
                    if (p === this._page)
                        b.setAttribute('aria-current', 'page');
                    list.appendChild(b);
                    if (dir && !old.has(String(p)) && !this.reduced)
                        this.motion(b, [{ transform: `translateX(${dir * 14}px)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 280, easing: 'ease-out' });
                }
                this.querySelector('.usa-pg-prev').disabled = this._page <= 1;
                this.querySelector('.usa-pg-next').disabled = this._page >= this.total;
                this.placeInk(dir !== 0);
            }
            placeInk(animate) {
                const cur = this._list?.querySelector('[aria-current="page"]');
                const ink = this._ink;
                if (!cur || !ink)
                    return;
                const from = ink.style.transform;
                const to = `translateX(${cur.offsetLeft}px)`;
                ink.style.width = cur.offsetWidth + 'px';
                ink.style.transform = to;
                if (animate && from && from !== to && !this.reduced)
                    this.motion(ink, [{ transform: from }, { transform: `${to} scaleX(1.35) scaleY(.8)`, offset: 0.55 }, { transform: to }], { duration: 420, easing: 'cubic-bezier(.3,1.3,.5,1)' });
            }
            go(p) {
                const v = shared.clampN(Math.round(p), 1, this.total);
                if (v === this._page)
                    return;
                const dir = v > this._page ? 1 : -1;
                this._page = v;
                this.setAttribute('page', String(v));
                this.render(dir);
                this.emit('change', { page: v });
            }
        }
        return UsaPagination;
    }, { id: 'pagination', text: css });
}

exports.definePagination = definePagination;
exports.pageWindow = pageWindow;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.0.2/dist/chunks/pagination-4NCqUPrX.cjs.map