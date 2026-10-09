import { f as defineElement } from '../chunks/base-zSGb8ujt.js';
import { parseMotion } from '../components/dsl.js';
import { motionToCss, easingPoints } from '../components/design.js';
import '../chunks/registry-CYojuxi5.js';
import '../chunks/core-BOCM9zD5.js';
import '../components/tokens.js';

var css = "usa-motion-spec{position:relative;display:block;max-width:100%;overflow-x:auto;padding:10px;border:1px solid rgba(15,23,42,.12);border-radius:12px;background:#fff;color:#0f172a;font:12px/1.35 system-ui,sans-serif}usa-motion-spec .usa-ms-bar-top{display:flex;gap:6px;align-items:center;margin-bottom:6px}usa-motion-spec .usa-ms-bar-top b{margin-right:auto}usa-motion-spec button{padding:4px 10px;border:1px solid #cbd5e1;border-radius:7px;background:#fff;font:600 12px/1 system-ui,sans-serif;cursor:pointer}usa-motion-spec .usa-ms-play{background:#4f46e5;border-color:#4f46e5;color:#fff}usa-motion-spec table{width:100%;border-collapse:collapse}usa-motion-spec th,usa-motion-spec td{padding:5px 6px;border-top:1px solid #f1f5f9;text-align:left;vertical-align:middle}usa-motion-spec thead th{color:#64748b;font-weight:600;border-top:0}usa-motion-spec .usa-ms-trig{padding:1px 6px;border-radius:999px;background:#eef2ff;color:#4338ca;font-weight:700}usa-motion-spec .usa-ms-time{position:relative;min-width:110px}usa-motion-spec .usa-ms-bar{position:relative;display:block;height:8px;border-radius:4px;background:linear-gradient(90deg,#818cf8,#4f46e5);transform-origin:0 50%}usa-motion-spec small{display:block;color:#64748b}usa-motion-spec .usa-ms-curve{width:28px;height:28px;float:left;margin-right:4px}usa-motion-spec .usa-ms-curve path{fill:none;stroke:#4f46e5;stroke-width:2.5}usa-motion-spec .usa-ms-head{position:absolute;top:0;bottom:0;left:0;width:2px;background:#f43f5e;opacity:0;pointer-events:none}";

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
function defineMotionSpec(tag = 'usa-motion-spec') {
    return defineElement(tag, (Base) => {
        class UsaMotionSpec extends Base {
            static get observedAttributes() {
                return ['rules', 'label'];
            }
            get parsed() {
                return parseMotion(this.str('rules')).rules;
            }
            get css() {
                return motionToCss(this.parsed);
            }
            total() {
                return Math.max(400, ...this.parsed.map((r) => (r.delay || 0) + (r.duration ?? 600) + (r.stagger || 0) * 3));
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const rs = this.parsed;
                const T = this.total();
                const curve = (e) => {
                    const [a, b, c, d] = easingPoints(e || 'cubic-bezier(0.22, 1, 0.36, 1)');
                    return `<svg class="usa-ms-curve" viewBox="0 0 40 40" aria-hidden="true"><path d="M2 38 C${2 + a * 36} ${38 - b * 36} ${2 + c * 36} ${38 - d * 36} 38 2"/></svg>`;
                };
                const rows = rs
                    .map((r) => {
                    const d = r.duration ?? 600;
                    const left = ((r.delay || 0) / T) * 100;
                    const w = (d / T) * 100;
                    return `<tr><th scope="row"><span class="usa-ms-trig" data-t="${r.trigger}">${r.trigger}</span></th><td><code>${esc(r.effect)}</code></td><td class="usa-ms-time"><span class="usa-ms-bar" style="left:${left.toFixed(1)}%;width:${w.toFixed(1)}%"></span><small>${r.delay ? `${r.delay}ms + ` : ''}${d}ms${r.stagger ? ` · stagger ${r.stagger}ms` : ''}</small></td><td>${curve(r.easing)}<small>${esc(r.easing || 'default')}</small></td></tr>`;
                })
                    .join('');
                this.insertAdjacentHTML('beforeend', `<div class="usa-ms-bar-top" data-usa-part><b>${esc(this.str('label', 'Motion spec'))}</b><button type="button" class="usa-ms-play">Play</button><button type="button" class="usa-ms-copy">Copy CSS</button></div><table class="usa-ms" aria-label="${esc(this.str('label', 'Motion spec'))}" data-usa-part><thead><tr><th scope="col">Trigger</th><th scope="col">Effect</th><th scope="col">Timing (${T}ms)</th><th scope="col">Easing</th></tr></thead><tbody>${rows || '<tr><td colspan="4">No rules</td></tr>'}</tbody></table><span class="usa-ms-head" aria-hidden="true" data-usa-part></span>`);
                this.listen(this.querySelector('.usa-ms-play'), 'click', () => this.play());
                this.listen(this.querySelector('.usa-ms-copy'), 'click', async () => {
                    let ok = false;
                    try {
                        await navigator.clipboard.writeText(this.css);
                        ok = true;
                    }
                    catch {
                        ok = false;
                    }
                    this.emit('copy', { ok });
                });
            }
            play() {
                if (this.reduced)
                    return;
                const T = this.total();
                this.querySelectorAll('.usa-ms-bar').forEach((b) => this.motion(b, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: Math.min(1600, T), easing: 'linear', fill: 'backwards' }));
                const h = this.querySelector('.usa-ms-head');
                if (h)
                    this.motion(h, [{ left: '0%', opacity: 1 }, { left: '100%', opacity: 1 }], { duration: Math.min(1600, T), easing: 'linear' });
            }
        }
        return UsaMotionSpec;
    }, { id: 'motion-spec', text: css });
}

export { defineMotionSpec };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.4.0/dist/widgets/motion-spec.js.map