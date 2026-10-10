'use strict';

var base = require('../chunks/base-B3me2y0o.cjs');
var components_fxSafe = require('../components/fx-safe.cjs');
require('../chunks/registry-BB1oO-lR.cjs');

var css = "usa-motion-prefs{display:block;max-width:100%;font:13px/1.35 system-ui,sans-serif;color:#0f172a}usa-motion-prefs .usa-mp{display:grid;gap:10px;margin:0;padding:14px;border:1px solid rgba(15,23,42,.12);border-radius:14px;background:#fff}usa-motion-prefs fieldset{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:6px;margin:0;padding:0;border:0}usa-motion-prefs legend{margin-bottom:6px;font-weight:700}usa-motion-prefs .usa-mp-level{display:flex;gap:6px;align-items:flex-start;padding:8px;border:1px solid #e2e8f0;border-radius:10px;cursor:pointer}usa-motion-prefs .usa-mp-level:has(input:checked){border-color:#6366f1;background:#eef2ff}usa-motion-prefs .usa-mp-level span{display:flex;flex-direction:column}usa-motion-prefs small{color:#64748b}usa-motion-prefs .usa-mp-row{display:flex;gap:8px;align-items:center;font-weight:600}usa-motion-prefs input[type=range]{flex:1;min-width:0;accent-color:#4f46e5}usa-motion-prefs .usa-mp-sample{height:22px;border-radius:999px;background:#f1f5f9;padding:3px;overflow:hidden}usa-motion-prefs .usa-mp-sample i{display:block;width:16px;height:16px;border-radius:50%;background:#4f46e5}usa-motion-prefs .usa-mp-reset{justify-self:start;padding:5px 12px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;font:inherit;cursor:pointer}usa-motion-prefs :focus-visible{outline:2px solid #6366f1;outline-offset:2px}";

const LEVELS = [
    ['full', 'Full', 'All motion'],
    ['gentle', 'Gentle', 'Smaller, softer moves'],
    ['minimal', 'Minimal', 'Fades only'],
    ['static', 'None', 'No animation'],
];
function defineMotionPrefs(tag = 'usa-motion-prefs') {
    return base.defineElement(tag, (Base) => {
        class UsaMotionPrefs extends Base {
            constructor() {
                super(...arguments);
                this._p = components_fxSafe.loadMotionPreferences();
            }
            static get observedAttributes() {
                return ['label'];
            }
            get prefs() {
                return { ...this._p };
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this._p = components_fxSafe.loadMotionPreferences();
                const id = `usa-mp-${Math.random().toString(36).slice(2, 7)}`;
                const p = this._p;
                this.insertAdjacentHTML('beforeend', `<form class="usa-mp" aria-label="${(this.str('label', 'Motion preferences')).replace(/"/g, '&quot;')}" data-usa-part><fieldset><legend>Motion</legend>${LEVELS.map(([v, l, d]) => `<label class="usa-mp-level"><input type="radio" name="${id}" value="${v}"${p.sensitivity === v ? ' checked' : ''}><span><b>${l}</b><small>${d}</small></span></label>`).join('')}</fieldset><label class="usa-mp-row">Speed <input type="range" min="0.25" max="2" step="0.25" value="${p.speed}" data-k="speed"><output>${p.speed}×</output></label><label class="usa-mp-row"><input type="checkbox" data-k="pauseAutoplay"${p.pauseAutoplay ? ' checked' : ''}> Pause autoplaying video</label><label class="usa-mp-row"><input type="checkbox" data-k="noParallax"${p.noParallax ? ' checked' : ''}> No parallax</label><div class="usa-mp-sample" aria-hidden="true"><i></i></div><button type="button" class="usa-mp-reset">Reset</button></form>`);
                const form = this.querySelector('form');
                this.listen(form, 'submit', (e) => e.preventDefault());
                const read = () => {
                    const lv = form.querySelector(`input[name="${id}"]:checked`)?.value;
                    const sp = Number(form.querySelector('[data-k=speed]').value);
                    form.querySelector('output').textContent = `${sp}×`;
                    this.set({ sensitivity: lv || 'full', speed: sp, pauseAutoplay: form.querySelector('[data-k=pauseAutoplay]').checked, noParallax: form.querySelector('[data-k=noParallax]').checked });
                };
                this.listen(form, 'change', read);
                this.listen(form, 'input', read);
                this.listen(this.querySelector('.usa-mp-reset'), 'click', () => this.reset());
                this.sample();
            }
            set(p) {
                this._p = components_fxSafe.applyMotionPreferences(p);
                this.sample();
                this.emit('change', { prefs: this.prefs });
            }
            sample() {
                const dot = this.querySelector('.usa-mp-sample i');
                if (!dot)
                    return;
                dot.getAnimations?.().forEach((a) => a.cancel());
                const lv = this._p.sensitivity;
                if (lv === 'static' || this.reduced)
                    return;
                const kf = lv === 'minimal' ? [{ opacity: 0.3 }, { opacity: 1 }, { opacity: 0.3 }] : [{ transform: 'translateX(0)' }, { transform: `translateX(${lv === 'gentle' ? 40 : 120}px)` }, { transform: 'translateX(0)' }];
                dot.animate?.(kf, { duration: 1600 / this._p.speed, iterations: Infinity, easing: 'ease-in-out' });
            }
            reset() {
                this._p = components_fxSafe.applyMotionPreferences({});
                this.changed('reset');
                this.emit('change', { prefs: this.prefs });
            }
        }
        return UsaMotionPrefs;
    }, { id: 'motion-prefs', text: css });
}

exports.defineMotionPrefs = defineMotionPrefs;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.2.0/dist/widgets/motion-prefs.cjs.map