import { f as defineElement } from '../chunks/base-zSGb8ujt.js';
import { getMotionTokens, exportDesignTokens, validateDesignTokens, importDesignTokens, applyMotionTokens } from '../components/tokens.js';

var css = "usa-token-editor{display:block;max-width:100%;font:12px/1.4 ui-sans-serif,system-ui,sans-serif;color:#1e1b4b}usa-token-editor .usa-te-rows{display:grid;gap:4px;max-height:var(--usa-te-max,none);overflow:auto}usa-token-editor .usa-te-row{display:grid;grid-template-columns:minmax(0,1fr) 92px 18px 56px;align-items:center;gap:6px;padding:3px 6px;border-radius:8px;background:#f5f3ff}usa-token-editor .usa-te-row[data-invalid]{background:#fef2f2;outline:1px solid #fca5a5}usa-token-editor .usa-te-name{font:600 11px/1.2 ui-monospace,monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}usa-token-editor input{width:100%;min-width:0;box-sizing:border-box;padding:3px 5px;border:1px solid #c7d2fe;border-radius:6px;font:11px ui-monospace,monospace;background:#fff;color:inherit}usa-token-editor .usa-te-unit{font-size:10px;color:#6366f1}usa-token-editor .usa-te-prev{position:relative;height:10px;border-radius:5px;background:#e0e7ff;--usa-te-run:44px}usa-token-editor .usa-te-prev i{position:absolute;left:0;top:0;width:10px;height:10px;border-radius:50%;background:#6366f1}usa-token-editor .usa-te-bar{display:flex;gap:6px;margin-top:6px}usa-token-editor button{padding:5px 10px;border:0;border-radius:999px;background:#4f46e5;color:#fff;font:600 11px/1 system-ui,sans-serif;cursor:pointer}usa-token-editor button+button{background:#e0e7ff;color:#3730a3}usa-token-editor textarea{display:block;width:100%;box-sizing:border-box;margin-top:6px;font:10px/1.35 ui-monospace,monospace;border:1px solid #c7d2fe;border-radius:8px;padding:6px}usa-token-editor textarea[hidden]{display:none}usa-token-editor .usa-te-problems{margin:4px 0 0;padding-left:16px;color:#b91c1c;font-size:11px}usa-token-editor .usa-te-problems:empty{display:none}";

const bez = (e) => {
    const m = /^cubic-bezier\(([^)]+)\)$/.exec(e.trim());
    return m ? m[1].split(',').map(Number) : null;
};
function defineTokenEditor(tag = 'usa-token-editor') {
    return defineElement(tag, (Base) => {
        class UsaTokenEditor extends Base {
            constructor() {
                super(...arguments);
                this.t = JSON.parse(JSON.stringify(getMotionTokens()));
            }
            static get observedAttributes() {
                return ['apply', 'format', 'groups'];
            }
            get tokens() {
                return this.t;
            }
            set tokens(v) {
                this.t = JSON.parse(JSON.stringify(v));
                if (this.isConnected)
                    this.changed('tokens');
            }
            exportJSON() {
                const json = exportDesignTokens(this.t, { format: this.str('format', '2025.10') || '2025.10' });
                this.emit('export', { json });
                return json;
            }
            importJSON(json) {
                const problems = validateDesignTokens(json);
                try {
                    this.t = importDesignTokens(json, this.t);
                }
                catch (e) {
                    problems.push(String(e.message));
                }
                this.emit('import', { problems });
                if (this.isConnected)
                    this.changed('tokens');
                return problems;
            }
            mount() {
                const groups = this.str('groups', 'duration,easing').split(/[\s,]+/);
                const root = document.createElement('div');
                root.className = 'usa-te';
                root.setAttribute('role', 'group');
                root.setAttribute('aria-label', this.str('label', 'Motion tokens'));
                const rows = [];
                if (groups.includes('duration'))
                    for (const [k, v] of Object.entries(this.t.duration))
                        rows.push(`<div class="usa-te-row" data-g="duration" data-k="${k}"><span class="usa-te-name">duration.${k}</span><input type="number" min="0" step="10" value="${v}" aria-label="duration ${k} (ms)"><span class="usa-te-unit">ms</span><span class="usa-te-prev" aria-hidden="true"><i></i></span></div>`);
                if (groups.includes('easing'))
                    for (const [k, v] of Object.entries(this.t.easing)) {
                        const b = bez(v);
                        if (!b)
                            continue;
                        rows.push(`<div class="usa-te-row" data-g="easing" data-k="${k}"><span class="usa-te-name">easing.${k}</span><input type="text" value="${b.join(', ')}" aria-label="easing ${k} (x1, y1, x2, y2)" spellcheck="false"><span class="usa-te-unit"></span><span class="usa-te-prev" aria-hidden="true"><i></i></span></div>`);
                    }
                root.innerHTML = `<div class="usa-te-rows">${rows.join('')}</div><div class="usa-te-bar"><button type="button" data-act="export">Export DTCG</button><button type="button" data-act="import">Import…</button></div><textarea class="usa-te-json" rows="5" spellcheck="false" aria-label="Design tokens JSON" hidden></textarea><ul class="usa-te-problems" aria-live="polite"></ul>`;
                this.replaceChildren(root);
                const ta = root.querySelector('textarea'), probs = root.querySelector('.usa-te-problems');
                const preview = (row) => {
                    const dot = row.querySelector('i');
                    if (this.reduced)
                        return;
                    const g = row.dataset.g, k = row.dataset.k;
                    const dur = g === 'duration' ? this.t.duration[k] : this.t.duration.normal || 300;
                    const ease = g === 'easing' ? this.t.easing[k] : this.t.easing.standard || 'ease';
                    this.motion(dot, [{ transform: 'translateX(0)' }, { transform: 'translateX(var(--usa-te-run, 44px))' }], { duration: Math.max(1, dur), easing: ease, fill: 'both' });
                };
                let undoApply = null;
                const applyNow = () => {
                    if (!this.flag('apply'))
                        return;
                    undoApply?.();
                    undoApply = applyMotionTokens(this.t);
                };
                this.onCleanup(() => undoApply?.());
                root.querySelectorAll('.usa-te-row').forEach((row) => {
                    const inp = row.querySelector('input');
                    this.listen(inp, 'change', () => {
                        const g = row.dataset.g, k = row.dataset.k;
                        if (g === 'duration') {
                            const v = Math.max(0, Number(inp.value) || 0);
                            this.t.duration[k] = v;
                            inp.value = String(v);
                            row.removeAttribute('data-invalid');
                        }
                        else {
                            const n = inp.value.split(/[\s,]+/).filter(Boolean).map(Number);
                            const ok = n.length === 4 && n.every(Number.isFinite) && n[0] >= 0 && n[0] <= 1 && n[2] >= 0 && n[2] <= 1;
                            row.toggleAttribute('data-invalid', !ok);
                            inp.setAttribute('aria-invalid', String(!ok));
                            if (!ok)
                                return;
                            this.t.easing[k] = `cubic-bezier(${n.join(', ')})`;
                        }
                        applyNow();
                        preview(row);
                        this.emit('change', { tokens: this.t, group: g, name: k });
                    });
                    this.listen(row, 'pointerenter', () => preview(row));
                });
                this.listen(root, 'click', (e) => {
                    const act = e.target.closest('button')?.dataset.act;
                    if (act === 'export') {
                        ta.hidden = false;
                        ta.value = JSON.stringify(this.exportJSON(), null, 2);
                        probs.innerHTML = '';
                    }
                    else if (act === 'import') {
                        if (ta.hidden || !ta.value.trim()) {
                            ta.hidden = false;
                            ta.placeholder = 'Paste W3C Design Tokens JSON, then press Import again';
                            ta.focus();
                            return;
                        }
                        let json;
                        try {
                            json = JSON.parse(ta.value);
                        }
                        catch {
                            probs.innerHTML = '<li>Not valid JSON</li>';
                            return;
                        }
                        const p = this.importJSON(json);
                        const list = this.querySelector('.usa-te-problems');
                        if (list)
                            list.innerHTML = p.map((x) => `<li>${x.replace(/[<&]/g, (c) => (c === '<' ? '&lt;' : '&amp;'))}</li>`).join('');
                    }
                });
                applyNow();
                const first = root.querySelector('.usa-te-row');
                if (first)
                    this.inView((v) => v && preview(first));
            }
        }
        return UsaTokenEditor;
    }, { id: 'token-editor', text: css });
}

export { defineTokenEditor };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.2.0/dist/widgets/token-editor.js.map