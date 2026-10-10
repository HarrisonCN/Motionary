import { f as defineElement } from '../chunks/base-CBMzOs1k.js';
import { MARKETPLACE, searchPlugins, installedPlugins, installPlugin } from '../components/marketplace.js';
import '../chunks/manifest-CQUlazDF.js';
import '../chunks/registry-4UDF3Dpk.js';
import '../chunks/sign-DvZ1jHxE.js';

var css = "usa-plugin-store{display:block;max-width:100%;font:14px/1.4 system-ui,sans-serif;color:#0f172a}usa-plugin-store .usa-ps-q{width:100%;box-sizing:border-box;padding:9px 12px;border:1px solid #cbd5e1;border-radius:10px;font:inherit}usa-plugin-store .usa-ps-q:focus-visible{outline:2px solid #6366f1;outline-offset:1px}usa-plugin-store .usa-ps-count{margin:6px 2px;font-size:12px;color:#64748b}usa-plugin-store .usa-ps-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(220px,100%),1fr));gap:10px;margin:0;padding:0;list-style:none}usa-plugin-store .usa-ps-card{display:flex;flex-direction:column;gap:6px;padding:12px;border:1px solid rgba(15,23,42,.1);border-radius:12px;background:#fff;box-shadow:0 6px 16px -12px rgba(15,23,42,.4);min-width:0}usa-plugin-store .usa-ps-head{display:flex;align-items:center;gap:6px;flex-wrap:wrap}usa-plugin-store .usa-ps-head small{margin-left:auto;color:#94a3b8;font-size:11px}usa-plugin-store .usa-ps-badge{padding:1px 6px;border-radius:999px;background:#eef2ff;color:#4338ca;font-size:11px;font-weight:600}usa-plugin-store .usa-ps-card p{margin:0;color:#475569;font-size:13px}usa-plugin-store .usa-ps-fx{display:flex;flex-wrap:wrap;gap:4px}usa-plugin-store .usa-ps-fx code{padding:1px 6px;border-radius:6px;background:#f1f5f9;font-size:11px}usa-plugin-store .usa-ps-install{transition:opacity .3s,background-color .3s;align-self:flex-start;padding:6px 12px;border:0;border-radius:8px;background:#4f46e5;color:#fff;font:600 12px/1 system-ui,sans-serif;cursor:pointer}usa-plugin-store .usa-ps-install[data-done]{background:#16a34a;cursor:default}usa-plugin-store .usa-ps-install[data-busy]{opacity:.7}usa-plugin-store .usa-ps-install:focus-visible{outline:2px solid #6366f1;outline-offset:2px}";

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
function definePluginStore(tag = 'usa-plugin-store') {
    return defineElement(tag, (Base) => {
        class UsaPluginStore extends Base {
            constructor() {
                super(...arguments);
                this._list = MARKETPLACE;
                this.loader = null;
            }
            static get observedAttributes() {
                return ['query', 'label'];
            }
            get plugins() {
                return this._list.slice();
            }
            set plugins(v) {
                this._list = Array.isArray(v) ? v : MARKETPLACE;
                if (this.isConnected)
                    this.changed('plugins');
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this.setAttribute('role', 'search');
                this.setAttribute('aria-label', this.str('label', 'Plugin marketplace'));
                this.insertAdjacentHTML('beforeend', `<input class="usa-ps-q" type="search" placeholder="Search plugins…" aria-label="Search plugins" value="${esc(this.str('query'))}" data-usa-part><p class="usa-ps-count" aria-live="polite" data-usa-part></p><ul class="usa-ps-list" data-usa-part></ul>`);
                const q = this.querySelector('.usa-ps-q');
                this.listen(q, 'input', () => this.search(q.value));
                this.listen(this, 'click', (e) => {
                    const b = e.target.closest?.('.usa-ps-install');
                    if (b && !b.disabled)
                        void this.install(b.dataset.name);
                });
                this.search(q.value);
            }
            search(query) {
                const res = searchPlugins(query, this._list);
                const ul = this.querySelector('.usa-ps-list');
                const have = installedPlugins();
                if (ul) {
                    ul.innerHTML = res
                        .map((p) => `<li class="usa-ps-card"><div class="usa-ps-head"><b>${esc(p.title)}</b>${p.official ? '<span class="usa-ps-badge">official</span>' : ''}<small>${esc(p.since ? `since ${p.since}` : '')}</small></div><p>${esc(p.description)}</p><div class="usa-ps-fx">${p.effects.map((f) => `<code>${esc(f)}</code>`).join('')}</div><button type="button" class="usa-ps-install" data-name="${esc(p.name)}"${have[p.name] ? ' disabled data-done' : ''}>${have[p.name] ? 'Installed ✓' : 'Install'}</button></li>`)
                        .join('');
                    if (!this.reduced)
                        ul.querySelectorAll('.usa-ps-card').forEach((c, i) => this.motion(c, [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 320, delay: Math.min(i, 8) * 50, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' }));
                }
                const c = this.querySelector('.usa-ps-count');
                if (c)
                    c.textContent = `${res.length} plugin${res.length === 1 ? '' : 's'}`;
                return res;
            }
            async install(name) {
                const p = this._list.find((x) => x.name === name);
                const b = this.querySelector(`.usa-ps-install[data-name="${typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(name) : name.replace(/["\\]/g, '\\$&')}"]`);
                if (!p)
                    return [];
                if (b) {
                    b.disabled = true;
                    b.setAttribute('data-busy', '');
                    b.textContent = 'Installing…';
                }
                try {
                    const fx = await installPlugin(p, this.loader ? { load: this.loader } : {});
                    if (b) {
                        b.removeAttribute('data-busy');
                        b.setAttribute('data-done', '');
                        b.textContent = 'Installed ✓';
                        if (!this.reduced)
                            this.motion(b, [{ transform: 'scale(.9)' }, { transform: 'scale(1.08)', offset: 0.6 }, { transform: 'none' }], { duration: 360 });
                    }
                    this.emit('install', { name, effects: fx });
                    return fx;
                }
                catch (e) {
                    if (b) {
                        b.disabled = false;
                        b.removeAttribute('data-busy');
                        b.textContent = 'Retry';
                    }
                    this.emit('install-error', { name, message: String(e?.message || e) });
                    return [];
                }
            }
        }
        return UsaPluginStore;
    }, { id: 'plugin-store', text: css });
}

export { definePluginStore };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.0.1/dist/widgets/plugin-store.js.map