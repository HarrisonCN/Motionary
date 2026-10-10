'use strict';

var base = require('../chunks/base-BG_mxssu.cjs');

var css = "usa-route-transition{display:block;max-width:100%;box-sizing:border-box}usa-route-transition template{display:none}::view-transition-old(root),::view-transition-new(root){animation-duration:.28s}";

const KF = {
    fade: [[{ opacity: 1 }, { opacity: 0 }], [{ opacity: 0 }, { opacity: 1 }]],
    slide: [[{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(-24px)' }], [{ opacity: 0, transform: 'translateX(24px)' }, { opacity: 1, transform: 'none' }]],
    zoom: [[{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.94)' }], [{ opacity: 0, transform: 'scale(1.04)' }, { opacity: 1, transform: 'none' }]],
};
let crossDocDone = false;
function defineRouteTransition(tag = 'usa-route-transition') {
    return base.defineElement(tag, (Base) => {
        class UsaRouteTransition extends Base {
            constructor() {
                super(...arguments);
                this.cur = '';
            }
            static get observedAttributes() {
                return ['effect', 'engine', 'cross-document', 'current', 'links', 'history', 'selector'];
            }
            get current() {
                return this.cur;
            }
            shared(root = this) {
                root.querySelectorAll('[data-shared]').forEach((el) => (el.style.viewTransitionName = `usa-${el.dataset.shared}`));
            }
            mount() {
                this.cur = this.str('current', typeof location !== 'undefined' ? location.pathname : '/');
                if (this.flag('cross-document') && !crossDocDone && typeof document !== 'undefined') {
                    crossDocDone = true;
                    const st = document.createElement('style');
                    st.dataset.usaRoute = '';
                    st.textContent = '@view-transition{navigation:auto}';
                    document.head.appendChild(st);
                }
                this.shared();
                const scopeAll = this.str('links', 'inside') === 'document';
                const onClick = (e) => {
                    const t = e.target;
                    const btn = t.closest?.('[data-to]');
                    if (btn && this.contains(btn)) {
                        e.preventDefault();
                        this.navigate(btn.dataset.to, { history: 'off' });
                        return;
                    }
                    const a = t.closest?.('a[href]');
                    if (!a || (!scopeAll && !this.contains(a)) || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
                        return;
                    if ((a.target && a.target !== '_self') || a.hasAttribute('download') || a.dataset.noRoute !== undefined)
                        return;
                    const u = new URL(a.href, location.href);
                    if (u.origin !== location.origin || (u.pathname === location.pathname && u.hash))
                        return;
                    e.preventDefault();
                    this.navigate(u.pathname + u.search);
                };
                this.listen(scopeAll ? document : this, 'click', onClick);
                this.listen(window, 'popstate', () => {
                    if (this.str('history', 'push') !== 'off')
                        this.navigate(location.pathname + location.search, { history: 'off' });
                });
            }
            async content(url) {
                const tpl = Array.from(this.querySelectorAll('template[data-route]')).find((t) => t.dataset.route === url);
                if (tpl)
                    return { html: tpl.innerHTML };
                if (typeof fetch !== 'function')
                    return null;
                const res = await fetch(url, { headers: { accept: 'text/html' } });
                if (!res.ok)
                    return null;
                const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
                const sel = this.str('selector') || (this.id ? `#${this.id}` : this.localName);
                const el = doc.querySelector(sel);
                return el ? { html: el.innerHTML, title: doc.title } : null;
            }
            async navigate(url, opts = {}) {
                if (!this.emit('navigate', { url, from: this.cur }))
                    return false;
                const next = await this.content(url);
                if (!next) {
                    if (!this.querySelector(`template[data-route="${url}"]`) && typeof location !== 'undefined' && /^\//.test(url) && opts.history !== 'off')
                        location.assign(url);
                    return false;
                }
                const templates = Array.from(this.querySelectorAll('template[data-route]'));
                const swap = () => {
                    this.innerHTML = next.html;
                    templates.forEach((t) => this.appendChild(t));
                    this.shared();
                    if (next.title)
                        document.title = next.title;
                };
                const hist = opts.history || this.str('history', 'push');
                if (hist !== 'off' && typeof history !== 'undefined')
                    history[hist === 'replace' ? 'replaceState' : 'pushState']({ usaRoute: url }, '', url);
                const engine = this.str('engine', 'auto');
                const fx = KF[this.str('effect', 'fade')] || KF.fade;
                const vt = document.startViewTransition;
                if (this.reduced)
                    swap();
                else if (engine !== 'waapi' && typeof vt === 'function')
                    await vt.call(document, swap).finished.catch(() => undefined);
                else {
                    const out = this.motion(this, fx[0], { duration: 160, easing: 'ease-in', fill: 'forwards' });
                    // never wait longer than the exit animation: `finished` can stall (background tabs, test DOMs, cancelled effects)
                    if (out)
                        await Promise.race([out.finished.catch(() => undefined), new Promise((r) => setTimeout(r, 200))]);
                    swap();
                    out?.cancel();
                    this.motion(this, fx[1], { duration: 260, easing: 'cubic-bezier(.22,1,.36,1)' });
                }
                this.cur = url;
                this.emit('navigated', { url });
                return true;
            }
        }
        return UsaRouteTransition;
    }, { id: 'route-transition', text: css });
}

exports.defineRouteTransition = defineRouteTransition;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.0.1/dist/widgets/route-transition.cjs.map