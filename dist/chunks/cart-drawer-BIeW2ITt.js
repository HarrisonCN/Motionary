import { f as defineElement } from './base-zSGb8ujt.js';

var css = "usa-cart-drawer{position:relative;display:inline-block;font:500 13px/1.3 system-ui,sans-serif}.usa-cd2-toggle{position:relative;display:grid;place-items:center;width:44px;height:44px;border:0;border-radius:50%;background:var(--usa-cd2-btn,#f1f5f9);font-size:20px;cursor:pointer}.usa-cd2-badge{position:absolute;top:-2px;right:-2px;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#ef4444;color:#fff;font:800 11px/18px system-ui,sans-serif;text-align:center}.usa-cd2-badge:empty{display:none}.usa-cd2-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.35);z-index:2147482000}.usa-cd2-panel{position:fixed;top:0;right:0;bottom:0;width:min(var(--usa-cd2-w,340px),92vw);display:flex;flex-direction:column;background:var(--usa-cd2-bg,#fff);color:#0f172a;box-shadow:-12px 0 40px -12px rgba(15,23,42,.4);z-index:2147482001;outline:none}.usa-cd2-panel header,.usa-cd2-panel footer{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid rgba(15,23,42,.08)}.usa-cd2-panel footer{border:0;border-top:1px solid rgba(15,23,42,.08);margin-top:auto;font-size:15px}.usa-cd2-close,.usa-cd2-rm{border:0;background:none;font-size:20px;line-height:1;cursor:pointer;color:inherit;opacity:.6}.usa-cd2-list{margin:0;padding:6px 8px;list-style:none;overflow:auto}.usa-cd2-item{display:grid;grid-template-columns:36px 1fr auto auto auto;align-items:center;gap:8px;padding:8px;border-radius:10px;overflow:hidden}.usa-cd2-item img,.usa-cd2-item i{width:36px;height:36px;border-radius:8px;object-fit:cover;background:linear-gradient(135deg,#a78bfa,#22d3ee)}.usa-cd2-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600}.usa-cd2-qty{opacity:.6}.usa-cd2-price,.usa-cd2-total{font-variant-numeric:tabular-nums;font-weight:700}.usa-cd2-empty{margin:24px;text-align:center;opacity:.55}.usa-cd2-panel[hidden],.usa-cd2-backdrop[hidden]{display:none}";

/** Cart total (7.3). */
const cartTotal = (items) => Math.round(items.reduce((a, i) => a + (Number(i.price) || 0) * (i.qty || 1), 0) * 100) / 100;
function defineCartDrawer(tag = 'usa-cart-drawer') {
    return defineElement(tag, (Base) => {
        class UsaCartDrawer extends Base {
            constructor() {
                super(...arguments);
                this._items = [];
                this._open = false;
                this._ret = null;
            }
            static get observedAttributes() {
                return ['label', 'items', 'currency'];
            }
            get items() {
                return this._items.map((i) => ({ ...i }));
            }
            set items(v) {
                this._items = (v || []).map((i) => ({ ...i, id: i.id || i.name, qty: i.qty || 1 }));
                if (this.isConnected)
                    this.render(null);
            }
            get total() {
                return cartTotal(this._items);
            }
            get count() {
                return this._items.reduce((a, i) => a + (i.qty || 1), 0);
            }
            get open() {
                return this._open;
            }
            set open(v) {
                this.toggle(!!v);
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const label = this.str('label', 'Cart');
                this.insertAdjacentHTML('afterbegin', `<button type="button" class="usa-cd2-toggle" data-usa-part aria-haspopup="dialog" aria-expanded="false"><span aria-hidden="true">🛒</span><b class="usa-cd2-badge" aria-live="polite"></b></button><div class="usa-cd2-backdrop" data-usa-part hidden></div><div class="usa-cd2-panel" data-usa-part role="dialog" aria-modal="true" hidden tabindex="-1"><header><strong></strong><button type="button" class="usa-cd2-close" aria-label="Close">×</button></header><ul class="usa-cd2-list"></ul><p class="usa-cd2-empty">Your cart is empty</p><footer><span>Total</span><b class="usa-cd2-total"></b></footer></div>`);
                this.querySelector('.usa-cd2-panel strong').textContent = label;
                this.querySelector('.usa-cd2-panel').setAttribute('aria-label', label);
                this.listen(this.querySelector('.usa-cd2-toggle'), 'click', () => this.toggle());
                this.listen(this.querySelector('.usa-cd2-close'), 'click', () => this.toggle(false));
                this.listen(this.querySelector('.usa-cd2-backdrop'), 'click', () => this.toggle(false));
                this.listen(this, 'keydown', (e) => e.key === 'Escape' && this._open && this.toggle(false));
                this.listen(this.querySelector('.usa-cd2-list'), 'click', (e) => {
                    const b = e.target.closest('[data-rm]');
                    if (b)
                        this.removeItem(b.dataset.rm);
                });
                if (!this._items.length) {
                    try {
                        const init = JSON.parse(this.str('items', '[]'));
                        if (Array.isArray(init))
                            this._items = init.map((i) => ({ ...i, id: i.id || i.name, qty: i.qty || 1 }));
                    }
                    catch {
                        /* ignore bad JSON */
                    }
                }
                this.render(null);
            }
            toggle(force) {
                const on = force ?? !this._open;
                if (on === this._open)
                    return;
                this._open = on;
                const panel = this.querySelector('.usa-cd2-panel');
                const bd = this.querySelector('.usa-cd2-backdrop');
                this.querySelector('.usa-cd2-toggle').setAttribute('aria-expanded', String(on));
                this.toggleAttribute('data-open', on);
                if (on) {
                    this._ret = document.activeElement || null;
                    panel.hidden = bd.hidden = false;
                    if (!this.reduced) {
                        this.motion(panel, [{ transform: 'translateX(105%)' }, { transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.2,.9,.3,1)' });
                        this.motion(bd, [{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
                    }
                    panel.focus();
                    this.emit('open', {});
                }
                else {
                    const done = () => {
                        if (!this._open)
                            panel.hidden = bd.hidden = true;
                    };
                    const a = this.reduced ? null : this.motion(panel, [{ transform: 'none' }, { transform: 'translateX(105%)' }], { duration: 260, easing: 'ease-in' });
                    if (a)
                        a.finished.then(done, done);
                    else
                        done();
                    this._ret?.focus?.();
                    this.emit('close', {});
                }
            }
            add(item) {
                const id = item.id || item.name;
                const hit = this._items.find((i) => i.id === id);
                if (hit)
                    hit.qty = (hit.qty || 1) + (item.qty || 1);
                else
                    this._items.push({ ...item, id, qty: item.qty || 1 });
                this.render(id);
            }
            removeItem(id) {
                const li = Array.from(this.querySelectorAll('.usa-cd2-item')).find((n) => n.dataset.id === id) || null;
                this._items = this._items.filter((i) => i.id !== id);
                const a = li && !this.reduced ? this.motion(li, [{ opacity: 1, maxHeight: `${li.offsetHeight}px` }, { opacity: 0, maxHeight: '0px', paddingTop: '0', paddingBottom: '0' }], { duration: 260, fill: 'forwards' }) : null;
                if (a)
                    a.finished.then(() => this.render(null), () => this.render(null));
                else
                    this.render(null);
            }
            render(changed) {
                const cur = this.str('currency', '$');
                const list = this.querySelector('.usa-cd2-list');
                const old = new Map(Array.from(list.children).map((li) => [li.dataset.id, li]));
                for (const it of this._items) {
                    let li = old.get(it.id);
                    old.delete(it.id);
                    const isNew = !li;
                    if (!li) {
                        li = document.createElement('li');
                        li.className = 'usa-cd2-item';
                        li.dataset.id = it.id;
                        li.innerHTML = `${it.img ? '<img alt="">' : '<i aria-hidden="true"></i>'}<span class="usa-cd2-name"></span><span class="usa-cd2-qty"></span><span class="usa-cd2-price"></span><button type="button" class="usa-cd2-rm">×</button>`;
                        if (it.img)
                            li.querySelector('img').setAttribute('src', it.img);
                    }
                    li.querySelector('.usa-cd2-name').textContent = it.name;
                    li.querySelector('.usa-cd2-qty').textContent = `×${it.qty || 1}`;
                    li.querySelector('.usa-cd2-price').textContent = `${cur}${((it.price || 0) * (it.qty || 1)).toFixed(2)}`;
                    const rm = li.querySelector('.usa-cd2-rm');
                    rm.dataset.rm = it.id;
                    rm.setAttribute('aria-label', `Remove ${it.name}`);
                    list.appendChild(li);
                    if (changed === it.id && !this.reduced)
                        this.motion(li, isNew ? [{ transform: 'translateX(40px)', opacity: 0 }, { transform: 'none', opacity: 1 }] : [{ background: 'rgba(124,92,255,.18)' }, { background: 'transparent' }], { duration: 420, easing: 'cubic-bezier(.2,.9,.3,1.2)' });
                }
                old.forEach((li) => li.remove());
                const n = this.count;
                const badge = this.querySelector('.usa-cd2-badge');
                badge.textContent = n ? String(n) : '';
                this.querySelector('.usa-cd2-toggle').setAttribute('aria-label', `${this.str('label', 'Cart')}, ${n} item${n === 1 ? '' : 's'}`);
                if (changed && !this.reduced)
                    this.motion(badge, [{ transform: 'scale(1)' }, { transform: 'scale(1.5)', offset: 0.4 }, { transform: 'scale(1)' }], { duration: 420, easing: 'ease-out' });
                this.querySelector('.usa-cd2-empty').hidden = !!this._items.length;
                const tot = this.querySelector('.usa-cd2-total');
                const to = this.total;
                const from = Number(tot.dataset.v || 0);
                tot.dataset.v = String(to);
                if (this.reduced || from === to || typeof requestAnimationFrame !== 'function')
                    tot.textContent = `${cur}${to.toFixed(2)}`;
                else {
                    const t0 = performance.now();
                    const f = (now) => {
                        const k = Math.min(1, (now - t0) / 500);
                        tot.textContent = `${cur}${(from + (to - from) * (1 - Math.pow(1 - k, 3))).toFixed(2)}`;
                        if (k < 1)
                            requestAnimationFrame(f);
                    };
                    requestAnimationFrame(f);
                }
                this.emit('change', { items: this.items, total: to });
            }
        }
        return UsaCartDrawer;
    }, { id: 'cart-drawer', text: css });
}

export { cartTotal as c, defineCartDrawer as d };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.4.0/dist/chunks/cart-drawer-BIeW2ITt.js.map