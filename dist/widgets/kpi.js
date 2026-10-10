import { f as defineElement } from '../chunks/base-zSGb8ujt.js';

/** Parse a figure like "$12.4k" / "−3.5%" / "1,204" → number + prefix / suffix / decimals (7.2). */
function parseFigureText(s) {
    const m = /^(\D*?)([-−]?[\d,]*\.?\d+)(.*)$/.exec(String(s).trim());
    if (!m)
        return null;
    const raw = m[2].replace(/,/g, '').replace('−', '-');
    const n = Number(raw);
    return Number.isFinite(n) ? { n, pre: m[1], post: m[3], dec: (raw.split('.')[1] || '').length } : null;
}

var css = "usa-kpi{display:inline-grid;grid-template-columns:1fr auto;grid-template-areas:\"label label\" \"value delta\" \"trend trend\" \"caption caption\";align-items:end;gap:4px 10px;width:var(--usa-kpi-w,220px);max-width:100%;padding:14px 16px;border-radius:16px;background:var(--usa-kpi-bg,#fff);color:#0f172a;box-shadow:0 8px 24px -12px rgba(15,23,42,.35);font:500 12px/1.3 system-ui,sans-serif}.usa-kpi-label{grid-area:label;opacity:.6;text-transform:uppercase;letter-spacing:.06em;font-size:11px;font-weight:700}.usa-kpi-value{grid-area:value;font:800 28px/1.05 system-ui,sans-serif;font-variant-numeric:tabular-nums;white-space:nowrap}.usa-kpi-delta{grid-area:delta;display:inline-flex;align-items:center;gap:3px;padding:3px 7px;border-radius:999px;font-weight:700;font-size:12px;margin-bottom:4px}.usa-kpi-delta[data-good=\"true\"]{background:rgba(34,197,94,.14);color:#15803d}.usa-kpi-delta[data-good=\"false\"]{background:rgba(239,68,68,.14);color:#b91c1c}.usa-kpi-delta i{font-style:normal;font-size:9px}.usa-kpi-trend{grid-area:trend;--usa-sl-w:100%;--usa-sl-h:34px;margin-top:4px}.usa-kpi-caption{grid-area:caption;opacity:.55;font-size:11px}.usa-kpi-caption:empty{display:none}";

function defineKpi(tag = 'usa-kpi') {
    return defineElement(tag, (Base) => {
        class UsaKpi extends Base {
            constructor() {
                super(...arguments);
                this._shown = 0;
                this._raf = 0;
                this._seen = false;
            }
            static get observedAttributes() {
                return ['label', 'delta', 'caption', 'trend', 'invert'];
            }
            get value() {
                return this.str('value', '0');
            }
            set value(v) {
                const prev = this._shown;
                this.setAttribute('value', String(v));
                this.roll(prev, true);
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const delta = this.str('delta', '');
                const neg = /^\s*[-−]/.test(delta);
                const good = this.flag('invert') ? neg : !neg;
                this.insertAdjacentHTML('afterbegin', `<span class="usa-kpi-label" data-usa-part></span><b class="usa-kpi-value" data-usa-part></b>${delta ? `<span class="usa-kpi-delta" data-usa-part data-good="${good}"><i aria-hidden="true">${neg ? '▼' : '▲'}</i><span></span></span>` : ''}${this.str('trend', '') ? `<usa-sparkline class="usa-kpi-trend" data-usa-part variant="area" values="${this.str('trend', '')}" aria-hidden="true"></usa-sparkline>` : ''}<span class="usa-kpi-caption" data-usa-part></span>`);
                this.querySelector('.usa-kpi-label').textContent = this.str('label', '');
                this.querySelector('.usa-kpi-caption').textContent = this.str('caption', '');
                const ds = this.querySelector('.usa-kpi-delta span');
                if (ds)
                    ds.textContent = delta;
                this.setAttribute('role', 'group');
                this.setAttribute('aria-label', [this.str('label', ''), this.value, delta && `(${delta})`, this.str('caption', '')].filter(Boolean).join(' '));
                this.onCleanup(() => cancelAnimationFrame(this._raf));
                const f = parseFigureText(this.value);
                this._shown = this.reduced || !f ? (f?.n ?? 0) : 0;
                this.write(this._shown);
                this.inView((vis) => {
                    if (!vis || this._seen)
                        return;
                    this._seen = true;
                    this.roll(0, false);
                    const d = this.querySelector('.usa-kpi-delta');
                    if (d && !this.reduced)
                        this.motion(d, [{ transform: 'translateY(8px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 420, delay: 500, easing: 'cubic-bezier(.2,.9,.3,1.2)', fill: 'backwards' });
                });
            }
            write(n) {
                const f = parseFigureText(this.value);
                const el = this.querySelector('.usa-kpi-value');
                if (!el)
                    return;
                el.textContent = f ? f.pre + n.toLocaleString(this.str('locale', '') || undefined, { minimumFractionDigits: f.dec, maximumFractionDigits: f.dec }) + f.post : this.value;
            }
            roll(from, flash) {
                const f = parseFigureText(this.value);
                if (!f)
                    return this.write(0);
                const to = f.n;
                if (this.reduced || typeof requestAnimationFrame !== 'function') {
                    this._shown = to;
                    return this.write(to);
                }
                cancelAnimationFrame(this._raf);
                const t0 = performance.now();
                const step = (now) => {
                    const k = Math.min(1, (now - t0) / 1100);
                    this._shown = from + (to - from) * (1 - Math.pow(1 - k, 3));
                    this.write(this._shown);
                    if (k < 1)
                        this._raf = requestAnimationFrame(step);
                };
                this._raf = requestAnimationFrame(step);
                if (flash)
                    this.motion(this, [{ boxShadow: '0 0 0 0 rgba(124,92,255,.5)' }, { boxShadow: '0 0 0 10px rgba(124,92,255,0)' }], { duration: 700, easing: 'ease-out' });
            }
        }
        return UsaKpi;
    }, { id: 'kpi', text: css });
}

export { defineKpi };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.7.0/dist/widgets/kpi.js.map