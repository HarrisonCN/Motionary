'use strict';

var base = require('../chunks/base-B3me2y0o.cjs');

var css = "usa-bar-chart{--usa-bc-c:#7c5cff;display:block;width:var(--usa-bc-w,100%);max-width:100%;font:600 11px/1.2 system-ui,sans-serif}.usa-bc-list{display:flex;align-items:flex-end;gap:8px;height:var(--usa-bc-h,140px);margin:0;padding:0;list-style:none}.usa-bc-item{display:grid;grid-template-rows:auto 1fr auto;justify-items:center;flex:1;min-width:0;height:100%;gap:4px}.usa-bc-track{position:relative;grid-row:2;width:100%;display:flex;align-items:flex-end;justify-content:center}.usa-bc-bar{display:block;width:min(100%,38px);height:calc(var(--usa-bc-k) * 100%);border-radius:6px 6px 2px 2px;background:linear-gradient(var(--usa-bc-c),#22d3ee);transform-origin:50% 100%}.usa-bc-item[data-glide] .usa-bc-bar{transition:height .6s cubic-bezier(.3,1.25,.5,1)}.usa-bc-val{grid-row:1;font-variant-numeric:tabular-nums;opacity:.8}.usa-bc-label{grid-row:3;opacity:.6;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}usa-bar-chart[data-dir=\"h\"] .usa-bc-list{flex-direction:column;align-items:stretch;height:auto}usa-bar-chart[data-dir=\"h\"] .usa-bc-item{grid-template-columns:70px 1fr auto;grid-template-rows:none;align-items:center;height:22px}usa-bar-chart[data-dir=\"h\"] .usa-bc-label{grid-row:auto;grid-column:1;justify-self:start}usa-bar-chart[data-dir=\"h\"] .usa-bc-track{grid-row:auto;grid-column:2;height:100%;justify-content:flex-start;align-items:center}usa-bar-chart[data-dir=\"h\"] .usa-bc-bar{width:calc(var(--usa-bc-k) * 100%);height:14px;border-radius:2px 6px 6px 2px;transform-origin:0 50%;background:linear-gradient(90deg,var(--usa-bc-c),#22d3ee)}usa-bar-chart[data-dir=\"h\"] .usa-bc-item[data-glide] .usa-bc-bar{transition:width .6s cubic-bezier(.3,1.25,.5,1)}usa-bar-chart[data-dir=\"h\"] .usa-bc-val{grid-row:auto;grid-column:3}@media (prefers-reduced-motion:reduce){.usa-bc-bar{transition:none!important}}";

function defineBarChart(tag = 'usa-bar-chart') {
    return base.defineElement(tag, (Base) => {
        class UsaBarChart extends Base {
            constructor() {
                super(...arguments);
                this._data = [];
                this._seen = false;
            }
            static get observedAttributes() {
                return ['horizontal', 'unit', 'max'];
            }
            get data() {
                return this._data.map((d) => ({ ...d }));
            }
            set data(v) {
                this._data = (v || []).map((d) => ({ label: String(d.label), value: Number(d.value) || 0 }));
                if (this.isConnected)
                    this.render(true);
            }
            mount() {
                if (!this._data.length) {
                    const kids = Array.from(this.querySelectorAll(':scope > data'));
                    if (kids.length)
                        this._data = kids.map((k) => ({ label: k.textContent?.trim() || '', value: Number(k.getAttribute('value')) || 0 }));
                    else {
                        const vals = this.str('values', '').split(',').map(Number);
                        const labels = this.str('labels', '').split(',');
                        this._data = vals.filter(Number.isFinite).map((v, i) => ({ label: (labels[i] || String(i + 1)).trim(), value: v }));
                    }
                }
                this.querySelectorAll(':scope > data').forEach((d) => (d.hidden = true));
                this.dataset.dir = this.flag('horizontal') ? 'h' : 'v';
                this.render(false);
                this.inView((vis) => {
                    if (!vis || this._seen)
                        return;
                    this._seen = true;
                    if (this.reduced)
                        return;
                    this.querySelectorAll('.usa-bc-bar').forEach((b, i) => this.motion(b, [{ transform: this.dataset.dir === 'h' ? 'scaleX(0)' : 'scaleY(0)' }, { transform: 'none' }], { duration: 700, delay: i * 70, easing: 'cubic-bezier(.2,.8,.3,1.1)', fill: 'backwards' }));
                });
            }
            render(glide) {
                let list = this.querySelector(':scope > .usa-bc-list');
                if (!list) {
                    list = document.createElement('ul');
                    list.className = 'usa-bc-list';
                    list.setAttribute('data-usa-part', '');
                    this.appendChild(list);
                }
                const max = this.num('max', 0) || Math.max(1, ...this._data.map((d) => d.value));
                const unit = this.str('unit', '');
                const old = new Map(Array.from(list.children).map((li) => [li.dataset.label, li]));
                const next = [];
                for (const d of this._data) {
                    let li = old.get(d.label);
                    const isNew = !li;
                    if (!li) {
                        li = document.createElement('li');
                        li.className = 'usa-bc-item';
                        li.dataset.label = d.label;
                        li.innerHTML = '<span class="usa-bc-track"><span class="usa-bc-bar"></span></span><span class="usa-bc-val"></span><span class="usa-bc-label"></span>';
                        li.querySelector('.usa-bc-label').textContent = d.label;
                    }
                    old.delete(d.label);
                    const k = Math.max(0, Math.min(1, d.value / max));
                    li.style.setProperty('--usa-bc-k', k.toFixed(4));
                    li.querySelector('.usa-bc-val').textContent = `${d.value.toLocaleString()}${unit}`;
                    li.setAttribute('aria-label', `${d.label}: ${d.value.toLocaleString()}${unit}`);
                    li.toggleAttribute('data-glide', glide && !this.reduced);
                    if (isNew && glide && !this.reduced)
                        this.motion(li.querySelector('.usa-bc-bar'), [{ transform: this.dataset.dir === 'h' ? 'scaleX(0)' : 'scaleY(0)' }, { transform: 'none' }], { duration: 500, easing: 'ease-out' });
                    next.push(li);
                }
                old.forEach((li) => {
                    if (this.reduced || !glide)
                        return li.remove();
                    const a = this.motion(li, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.6)' }], { duration: 300, fill: 'forwards' });
                    if (a)
                        a.finished.then(() => li.remove(), () => li.remove());
                    else
                        li.remove();
                });
                next.forEach((li) => list.appendChild(li));
                this.setAttribute('role', 'figure');
                if (!this.hasAttribute('aria-label'))
                    this.setAttribute('aria-label', this.str('label', 'Bar chart'));
                list.setAttribute('role', 'list');
                next.forEach((li) => li.setAttribute('role', 'listitem'));
            }
        }
        return UsaBarChart;
    }, { id: 'bar-chart', text: css });
}

exports.defineBarChart = defineBarChart;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.2.0/dist/widgets/bar-chart.cjs.map