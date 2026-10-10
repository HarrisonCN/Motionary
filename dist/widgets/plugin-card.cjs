'use strict';

var base = require('../chunks/base-B3me2y0o.cjs');
var sign = require('../chunks/sign-RAkQIWrM.cjs');
var registry = require('../chunks/registry-VKfDCYYI.cjs');
var runtimeLink = require('../chunks/runtime-link-CyExCzuU.cjs');

var css = "usa-plugin-card{display:block;max-width:100%;box-sizing:border-box;padding:14px;border-radius:16px;background:#fff;border:1px solid #e2e8f0;box-shadow:0 10px 26px -18px rgba(15,23,42,.55);color:#0f172a;font:13px/1.45 system-ui,sans-serif}usa-plugin-card .usa-pc-head{display:flex;align-items:center;gap:10px;min-width:0}usa-plugin-card .usa-pc-logo{flex:none;display:grid;place-items:center;width:38px;height:38px;border-radius:11px;background:linear-gradient(135deg,#6366f1,#ec4899);color:#fff;font:800 17px/1 system-ui,sans-serif}usa-plugin-card .usa-pc-meta{display:flex;flex-direction:column;min-width:0;flex:1}usa-plugin-card .usa-pc-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px}usa-plugin-card .usa-pc-sub{color:#64748b;font-size:11.5px}usa-plugin-card .usa-pc-dl{flex:none;color:#475569;font:600 12px/1 ui-monospace,monospace}usa-plugin-card .usa-pc-badges{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0 8px}usa-plugin-card .usa-pc-badge{padding:3px 8px;border-radius:999px;background:#f1f5f9;color:#334155;font:600 11px/1.3 system-ui,sans-serif}usa-plugin-card .usa-pc-compat[data-ok=true],usa-plugin-card .usa-pc-sig[data-state=ok]{background:#dcfce7;color:#166534}usa-plugin-card .usa-pc-compat[data-ok=false],usa-plugin-card .usa-pc-sig[data-state=bad]{background:#fee2e2;color:#991b1b}usa-plugin-card .usa-pc-more{padding:5px 10px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;font:600 12px/1 system-ui,sans-serif;cursor:pointer}usa-plugin-card .usa-pc-details{margin-top:8px;color:#334155}usa-plugin-card .usa-rt-missing{margin:0 0 8px;padding:8px;border-radius:8px;background:#fef2f2;color:#991b1b;font:11px/1.4 ui-monospace,monospace;overflow-wrap:anywhere}";

const fmt = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'k' : String(Math.round(n)));
function definePluginCard(tag = 'usa-plugin-card') {
    return base.defineElement(tag, (Base) => {
        class UsaPluginCard extends Base {
            constructor() {
                super(...arguments);
                this.rt = null;
            }
            static get observedAttributes() {
                return ['name', 'title', 'version', 'author', 'engine', 'downloads', 'integrity', 'src'];
            }
            compat() {
                return sign.checkCompat({ name: this.str('title', this.str('name')), engines: { motionary: this.str('engine', '*') } }, registry.RUNTIME_VERSION);
            }
            mount() {
                this.rt = runtimeLink.runtimeModule(this, 'core');
                if (!this.querySelector(':scope > .usa-pc-head')) {
                    const kids = Array.from(this.childNodes).filter((n) => !(n instanceof HTMLElement && n.classList.contains('usa-rt-missing')));
                    const name = this.str('title', this.str('name', 'plugin'));
                    this.insertAdjacentHTML('beforeend', `<div class="usa-pc-head"><span class="usa-pc-logo" aria-hidden="true"></span><div class="usa-pc-meta"><strong class="usa-pc-name"></strong><span class="usa-pc-sub"></span></div><span class="usa-pc-dl" aria-label="downloads"><b>0</b> ↓</span></div><div class="usa-pc-badges"><span class="usa-pc-badge usa-pc-compat"></span><span class="usa-pc-badge usa-pc-sig"></span></div><button type="button" class="usa-pc-more" aria-expanded="false">Details</button><div class="usa-pc-details" hidden></div>`);
                    this.querySelector('.usa-pc-logo').textContent = name.slice(0, 1).toUpperCase();
                    this.querySelector('.usa-pc-name').textContent = name;
                    const det = this.querySelector('.usa-pc-details');
                    kids.forEach((k) => det.appendChild(k));
                }
                this.querySelector('.usa-pc-sub').textContent = `v${this.str('version', '1.0.0')}${this.str('author') ? ' · ' + this.str('author') : ''}`;
                const c = this.compat();
                const cb = this.querySelector('.usa-pc-compat');
                cb.textContent = c.ok ? `✓ Motionary ${c.range}` : `✕ needs ${c.range}`;
                cb.dataset.ok = String(c.ok);
                cb.title = c.message;
                const sig = this.querySelector('.usa-pc-sig');
                sig.textContent = this.str('integrity') ? 'Signed' : 'Unsigned';
                sig.dataset.state = this.str('integrity') ? 'pending' : 'none';
                if (this.str('integrity') && this.str('src'))
                    this.verify();
                this.listen(this.querySelector('.usa-pc-more'), 'click', () => this.toggle());
                this.countUp();
            }
            countUp() {
                const b = this.querySelector('.usa-pc-dl b');
                const total = this.num('downloads', 0);
                if (!this.rt || this.reduced) {
                    b.textContent = fmt(total);
                    return;
                }
                const o = { n: 0 };
                let seen = false;
                this.inView((v) => {
                    if (!v || seen || !this.rt)
                        return;
                    seen = true;
                    const tw = this.rt.tween(o, { to: { n: total }, duration: 1200, ease: 'expo-out', onUpdate: () => (b.textContent = fmt(o.n)) });
                    this.onCleanup(() => tw.kill());
                });
            }
            toggle(open) {
                const det = this.querySelector('.usa-pc-details');
                const btn = this.querySelector('.usa-pc-more');
                if (!det || !btn)
                    return;
                const next = open ?? det.hidden;
                btn.setAttribute('aria-expanded', String(next));
                if (next)
                    det.hidden = false;
                if (this.rt && !this.reduced) {
                    const h = det.scrollHeight;
                    det.style.overflow = 'hidden';
                    const tw = this.rt.tween(det, { from: { height: next ? '0px' : h + 'px', opacity: next ? 0 : 1 }, to: { height: next ? h + 'px' : '0px', opacity: next ? 1 : 0 }, duration: 320, ease: 'cubic-out', onComplete: () => { det.style.height = ''; det.style.overflow = ''; if (!next)
                            det.hidden = true; } });
                    this.onCleanup(() => tw.kill());
                }
                else if (!next)
                    det.hidden = true;
                this.emit('toggle', { open: next });
            }
            async verify() {
                const sig = this.querySelector('.usa-pc-sig');
                const integrity = this.str('integrity'), src = this.str('src');
                if (!integrity || !src || typeof fetch !== 'function')
                    return null;
                let ok = false;
                try {
                    const code = await (await fetch(src)).text();
                    ok = await sign.verifyPlugin(code, integrity);
                }
                catch {
                    ok = false;
                }
                if (sig) {
                    sig.textContent = ok ? '✓ Verified' : '✕ Signature mismatch';
                    sig.dataset.state = ok ? 'ok' : 'bad';
                }
                this.emit('verified', { ok });
                return ok;
            }
        }
        return UsaPluginCard;
    }, { id: 'plugin-card', text: css });
}

exports.definePluginCard = definePluginCard;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.0.0/dist/widgets/plugin-card.cjs.map