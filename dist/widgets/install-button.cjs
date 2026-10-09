'use strict';

var base = require('../chunks/base-B3me2y0o.cjs');

var css = "usa-install-button{display:inline-flex;flex-direction:column;gap:6px;max-width:100%;box-sizing:border-box;font:12px/1.4 system-ui,sans-serif}usa-install-button [role=tablist]{display:flex;flex-wrap:wrap;gap:4px}usa-install-button [role=tab]{padding:4px 9px;border:1px solid #cbd5e1;border-radius:999px;background:#fff;color:#334155;font:600 11px/1 system-ui,sans-serif;cursor:pointer}usa-install-button [role=tab][aria-selected=true]{background:#0f172a;border-color:#0f172a;color:#fff}usa-install-button .usa-ib-row{display:flex;align-items:stretch;min-width:0;border-radius:10px;background:#0f172a;color:#e2e8f0;overflow:hidden}usa-install-button code{flex:1;min-width:0;padding:9px 10px;font:12px/1.4 ui-monospace,monospace;white-space:pre-wrap;overflow-wrap:anywhere}usa-install-button .usa-ib-copy{flex:none;position:relative;min-width:74px;padding:0 12px;border:0;background:#4f46e5;color:#fff;font:700 12px/1 system-ui,sans-serif;cursor:pointer}usa-install-button .usa-ib-copy[data-copied]{background:#16a34a}";

const MANAGERS = ['npm', 'pnpm', 'yarn', 'bun', 'cdn'];
function defineInstallButton(tag = 'usa-install-button') {
    return base.defineElement(tag, (Base) => {
        class UsaInstallButton extends Base {
            constructor() {
                super(...arguments);
                this.cur = 'npm';
            }
            static get observedAttributes() {
                return ['package', 'managers', 'cdn', 'dev', 'manager'];
            }
            list() {
                const l = this.str('managers', 'npm pnpm yarn cdn').split(/[\s,]+/).filter((m) => MANAGERS.includes(m));
                return l.length ? l : ['npm'];
            }
            command(manager = this.cur) {
                const pkg = this.str('package', 'motionary');
                const dev = this.flag('dev');
                switch (manager) {
                    case 'pnpm': return `pnpm add ${dev ? '-D ' : ''}${pkg}`;
                    case 'yarn': return `yarn add ${dev ? '-D ' : ''}${pkg}`;
                    case 'bun': return `bun add ${dev ? '-d ' : ''}${pkg}`;
                    case 'cdn': {
                        const url = this.str('cdn', `https://cdn.jsdelivr.net/npm/${pkg}/+esm`);
                        return url.endsWith('.css') ? `<link rel="stylesheet" href="${url}">` : /\+esm$|\.mjs$/.test(url) ? `<script type="module">import * as m from '${url}';</script>` : `<script src="${url}"></script>`;
                    }
                    default: return `npm i ${dev ? '-D ' : ''}${pkg}`;
                }
            }
            mount() {
                const list = this.list();
                this.cur = list.includes(this.str('manager')) ? this.str('manager') : list[0];
                this.innerHTML = `<div role="tablist" aria-label="Package manager">${list.map((m) => `<button type="button" role="tab" data-m="${m}">${m === 'cdn' ? 'CDN' : m}</button>`).join('')}</div><div class="usa-ib-row"><code></code><button type="button" class="usa-ib-copy" aria-live="polite">Copy</button></div>`;
                const show = (animate = false) => {
                    this.querySelectorAll('[role=tab]').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.m === this.cur)));
                    const code = this.querySelector('code');
                    code.textContent = this.command();
                    if (animate && !this.reduced)
                        this.motion(code, [{ opacity: 0.25, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: 'cubic-bezier(.22,1,.36,1)' });
                };
                this.listen(this, 'click', (e) => {
                    const t = e.target;
                    const tab = t.closest?.('[data-m]');
                    if (tab) {
                        this.cur = tab.dataset.m;
                        show(true);
                    }
                    if (t.closest?.('.usa-ib-copy'))
                        this.copy();
                });
                show();
            }
            async copy() {
                const text = this.command();
                try {
                    await navigator.clipboard?.writeText(text);
                }
                catch {
                    /* clipboard blocked: the snippet stays selectable */
                }
                const b = this.querySelector('.usa-ib-copy');
                if (b) {
                    b.textContent = '✓ Copied';
                    b.setAttribute('data-copied', '');
                    if (!this.reduced)
                        this.motion(b, [{ transform: 'scale(1)' }, { transform: 'scale(.9)', offset: 0.3 }, { transform: 'scale(1.06)', offset: 0.7 }, { transform: 'scale(1)' }], { duration: 380, easing: 'ease-out' });
                    const id = setTimeout(() => {
                        b.textContent = 'Copy';
                        b.removeAttribute('data-copied');
                    }, 1600);
                    this.onCleanup(() => clearTimeout(id));
                }
                this.emit('copy', { text, manager: this.cur });
                return text;
            }
        }
        return UsaInstallButton;
    }, { id: 'install-button', text: css });
}

exports.defineInstallButton = defineInstallButton;
//# sourceMappingURL=install-button.cjs.map
