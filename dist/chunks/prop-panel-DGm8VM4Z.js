import { f as defineElement } from './base-nzeN_ux7.js';

var css = "usa-prop-panel{display:block;max-width:100%;font:13px/1.4 system-ui,sans-serif;color:#0f172a}usa-prop-panel .usa-pp{display:grid;gap:8px;margin:0;padding:12px;border:1px solid rgba(15,23,42,.12);border-radius:12px;background:#fff}usa-prop-panel .usa-pp-row{display:grid;grid-template-columns:minmax(64px,auto) 1fr auto;align-items:center;gap:8px}usa-prop-panel label{font-weight:600;color:#334155;font-family:ui-monospace,monospace;font-size:12px}usa-prop-panel input[type=text],usa-prop-panel input[type=number],usa-prop-panel select{min-width:0;width:100%;box-sizing:border-box;padding:5px 8px;border:1px solid #cbd5e1;border-radius:6px;font:inherit}usa-prop-panel input[type=range]{width:100%;min-width:0;accent-color:#4f46e5}usa-prop-panel input[type=checkbox]{grid-column:2;justify-self:start;width:16px;height:16px;accent-color:#4f46e5}usa-prop-panel output{min-width:2.5em;text-align:right;font:12px ui-monospace,monospace;color:#64748b}usa-prop-panel .usa-pp-empty{margin:0;color:#64748b}usa-prop-panel .usa-pp-row{border-radius:6px}usa-prop-panel .usa-pp-reset{justify-self:start;padding:5px 12px;border:1px solid #cbd5e1;border-radius:7px;background:#fff;font:inherit;cursor:pointer}";

/** "value:number:0:100, theme:select:leaf|ocean, on:boolean" → prop specs (8.9). */
function parseProps(s) {
    const T = ['text', 'number', 'range', 'color', 'boolean', 'select'];
    return s
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => {
        const [name, type = 'text', ...rest] = p.split(':').map((x) => x.trim());
        const t = (T.includes(type) ? type : 'text');
        return { name, type: t, options: t === 'select' ? (rest[0] || '').split('|').filter(Boolean) : rest };
    })
        .filter((p) => /^[a-z][\w-]*$/i.test(p.name));
}
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
function definePropPanel(tag = 'usa-prop-panel') {
    return defineElement(tag, (Base) => {
        class UsaPropPanel extends Base {
            constructor() {
                super(...arguments);
                this._start = {};
            }
            static get observedAttributes() {
                return ['for', 'props', 'label'];
            }
            target() {
                const f = this.str('for');
                if (f === 'previous')
                    return this.previousElementSibling;
                return f ? document.querySelector(f) : null;
            }
            get props() {
                const s = this.str('props');
                if (s)
                    return parseProps(s);
                const t = this.target();
                const obs = t?.constructor?.observedAttributes || [];
                return obs.map((name) => ({ name, type: 'text', options: [] }));
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const t = this.target();
                const ps = this.props;
                this._start = {};
                ps.forEach((p) => (this._start[p.name] = t?.getAttribute(p.name) ?? null));
                const field = (p, i) => {
                    const id = `usa-pp-${i}-${p.name}`;
                    const v = t?.getAttribute(p.name);
                    let input = '';
                    if (p.type === 'boolean')
                        input = `<input id="${id}" type="checkbox" role="switch" data-p="${p.name}"${v != null ? ' checked' : ''}>`;
                    else if (p.type === 'select')
                        input = `<select id="${id}" data-p="${p.name}">${p.options.map((o) => `<option${o === v ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
                    else {
                        const [mn, mx] = p.options;
                        const range = p.type === 'range' || (p.type === 'number' && mn != null && mx != null);
                        input = `<input id="${id}" type="${p.type === 'color' ? 'color' : range ? 'range' : p.type === 'number' ? 'number' : 'text'}" data-p="${p.name}" value="${esc(v ?? '')}"${mn != null ? ` min="${esc(mn)}"` : ''}${mx != null ? ` max="${esc(mx)}"` : ''}${range ? ' step="any"' : ''}><output for="${id}">${esc(v ?? '')}</output>`;
                    }
                    return `<div class="usa-pp-row"><label for="${id}">${esc(p.name)}</label>${input}</div>`;
                };
                this.insertAdjacentHTML('beforeend', `<form class="usa-pp" aria-label="${esc(this.str('label', 'Properties'))}" data-usa-part>${ps.map(field).join('') || '<p class="usa-pp-empty">No properties</p>'}<button type="button" class="usa-pp-reset">Reset</button></form>`);
                const form = this.querySelector('form');
                this.listen(form, 'submit', (e) => e.preventDefault());
                this.listen(this.querySelector('.usa-pp-reset'), 'click', () => this.reset());
                this.listen(form, 'input', (e) => this.apply(e.target));
                this.listen(form, 'change', (e) => this.apply(e.target));
            }
            apply(inp) {
                const name = inp.dataset?.p;
                const t = this.target();
                if (!name || !t)
                    return;
                let value;
                if (inp instanceof HTMLInputElement && inp.type === 'checkbox')
                    value = inp.checked ? '' : null;
                else
                    value = inp.value;
                if (value == null)
                    t.removeAttribute(name);
                else
                    t.setAttribute(name, value);
                const out = inp.nextElementSibling;
                if (out?.tagName === 'OUTPUT')
                    out.textContent = value ?? '';
                this.emit('prop', { name, value });
            }
            reset() {
                const t = this.target();
                if (!t)
                    return;
                for (const [k, v] of Object.entries(this._start)) {
                    if (v == null)
                        t.removeAttribute(k);
                    else
                        t.setAttribute(k, v);
                }
                this.changed('props');
                if (!this.reduced)
                    this.querySelectorAll('.usa-pp-row').forEach((r, i) => this.motion(r, [{ backgroundColor: 'rgba(99,102,241,.18)' }, { backgroundColor: 'transparent' }], { duration: 600, delay: i * 40 }));
            }
        }
        return UsaPropPanel;
    }, { id: 'prop-panel', text: css });
}

export { definePropPanel as d, parseProps as p };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.2.0/dist/chunks/prop-panel-DGm8VM4Z.js.map