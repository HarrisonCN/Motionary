import { f as defineElement } from '../chunks/base-SPDwWyB1.js';

var css = "usa-route-transition{display:block;max-width:100%;box-sizing:border-box}usa-route-transition template{display:none}::view-transition-old(root),::view-transition-new(root){animation-duration:.28s}";

const KF = {
    fade: [[{ opacity: 1 }, { opacity: 0 }], [{ opacity: 0 }, { opacity: 1 }]],
    slide: [[{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(-24px)' }], [{ opacity: 0, transform: 'translateX(24px)' }, { opacity: 1, transform: 'none' }]],
    zoom: [[{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.94)' }], [{ opacity: 0, transform: 'scale(1.04)' }, { opacity: 1, transform: 'none' }]],
};
let crossDocDone = false;
function defineRouteTransition(tag = 'usa-route-transition') {
    return defineElement(tag, (Base) => {
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
                    if (u.origin !== location.origin || (u.pathname === location.pathname && u.search === location.search && u.hash))
                        return;
                    e.preventDefault();
                    this.go(u.pathname + u.search + u.hash, this.str('history', 'push'), 'link');
                };
                this.listen(scopeAll ? document : this, 'click', onClick);
                this.listen(window, 'popstate', () => {
                    if (this.str('history', 'push') !== 'off')
                        this.go(location.pathname + location.search + location.hash, 'off', 'popstate');
                });
            }
            unmount() {
                this.request?.abort();
            }
            async content(url, signal) {
                const tpl = Array.from(this.querySelectorAll('template[data-route]')).find((t) => t.dataset.route === url || t.dataset.route === url.split('#')[0]);
                if (tpl)
                    return { html: tpl.innerHTML };
                const res = await fetch(url, { signal, mode: 'same-origin', headers: { accept: 'text/html' } });
                if (!res.ok)
                    return null;
                const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
                const selector = this.str('selector');
                const el = selector ? doc.querySelector(selector) : this.id ? doc.getElementById(this.id) : doc.querySelector(this.localName);
                return el ? { html: el.innerHTML, title: doc.title } : null;
            }
            navigate(url, opts = {}) {
                return this.go(url, opts.history || this.str('history', 'push'));
            }
            async go(url, hist, source) {
                let target;
                try {
                    target = new URL(url, location.href);
                }
                catch {
                    return false;
                }
                if (target.origin !== location.origin || !this.emit('navigate', { url, from: this.cur }))
                    return false;
                this.request?.abort();
                const { signal } = this.request = new AbortController();
                const next = await this.content(url, signal).catch(() => null);
                if (signal.aborted)
                    return false;
                if (!next) {
                    if (source === 'popstate')
                        location.reload();
                    else if (source === 'link' || hist !== 'off')
                        location.assign(target.href);
                    return false;
                }
                let committed = false;
                const swap = () => {
                    if (signal.aborted)
                        return;
                    const templates = Array.from(this.querySelectorAll('template[data-route]'));
                    if (hist !== 'off')
                        history[hist === 'replace' ? 'replaceState' : 'pushState']({ usaRoute: url }, '', url);
                    this.innerHTML = next.html;
                    templates.forEach((t) => this.appendChild(t));
                    this.shared();
                    if (next.title)
                        document.title = next.title;
                    this.cur = url;
                    committed = true;
                    let id = target.hash.slice(1);
                    try {
                        id = decodeURIComponent(id);
                    }
                    catch { /* literal fragment */ }
                    const anchor = id && document.getElementById(id);
                    const focus = anchor || this.querySelector('[autofocus],h1') || this;
                    if (!focus.hasAttribute('tabindex') && focus.tabIndex < 0)
                        focus.tabIndex = -1;
                    focus.focus({ preventScroll: true });
                    if (anchor)
                        anchor.scrollIntoView();
                    else if (source !== 'popstate' && (window.scrollX || window.scrollY))
                        window.scrollTo(0, 0);
                };
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
                    if (!signal.aborted)
                        this.motion(this, fx[1], { duration: 260, easing: 'cubic-bezier(.22,1,.36,1)' });
                }
                if (signal.aborted || !committed)
                    return false;
                this.emit('navigated', { url });
                return true;
            }
        }
        return UsaRouteTransition;
    }, { id: 'route-transition', text: css });
}

export { defineRouteTransition };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.7.0/dist/widgets/route-transition.js.map