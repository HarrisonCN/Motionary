'use strict';

var base = require('../chunks/base-B3me2y0o.cjs');
var shared = require('../chunks/shared-BxK1D7EZ.cjs');

var css = "usa-stepper{--usa-st-c:#7c5cff;--usa-st-size:30px;position:relative;display:flex;justify-content:space-between;gap:8px;padding:0;counter-reset:s;max-width:100%}usa-stepper[data-orientation=\"vertical\"]{flex-direction:column;gap:22px}.usa-st-rail{position:absolute;left:calc(var(--usa-st-size)/2);right:calc(var(--usa-st-size)/2);top:calc(var(--usa-st-size)/2 - 2px);height:4px;border-radius:4px;background:rgba(127,127,127,.25);pointer-events:none}usa-stepper[data-orientation=\"vertical\"] .usa-st-rail{left:calc(var(--usa-st-size)/2 - 2px);right:auto;top:calc(var(--usa-st-size)/2);bottom:calc(var(--usa-st-size)/2);width:4px;height:auto}.usa-st-fill{position:absolute;inset:0;border-radius:inherit;background:var(--usa-st-c);transform-origin:0 0;transform:scaleX(calc(var(--usa-st-p,0%) / 100%));transition:transform .55s cubic-bezier(.6,.05,.3,1)}usa-stepper[data-orientation=\"vertical\"] .usa-st-fill{transform:scaleY(calc(var(--usa-st-p,0%) / 100%))}.usa-st-step{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:6px;min-width:0;font:600 12px/1.25 system-ui,sans-serif;text-align:center;color:rgba(127,127,127,.95)}usa-stepper[data-orientation=\"vertical\"] .usa-st-step{flex-direction:row;text-align:left}.usa-st-step[data-current],.usa-st-step[data-done]{color:inherit}.usa-st-dot{position:relative;display:grid;place-items:center;flex:none;width:var(--usa-st-size);height:var(--usa-st-size);border-radius:50%;background:var(--usa-st-bg,#fff);box-shadow:inset 0 0 0 2px rgba(127,127,127,.4);color:#666;font-weight:700;transition:background .3s,box-shadow .3s,color .3s}.usa-st-step[data-current] .usa-st-dot{box-shadow:inset 0 0 0 2px var(--usa-st-c);color:var(--usa-st-c)}.usa-st-step[data-done] .usa-st-dot{background:var(--usa-st-c);box-shadow:none;color:#fff}.usa-st-check{position:absolute;width:60%;height:60%;fill:none;stroke:#fff;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:20;stroke-dashoffset:20;opacity:0}.usa-st-step[data-done] .usa-st-check{stroke-dashoffset:0;opacity:1}.usa-st-step[data-done] .usa-st-num{opacity:0}.usa-st-step[data-clickable],usa-stepper[clickable] .usa-st-step{cursor:pointer}@media (prefers-reduced-motion:reduce){.usa-st-fill,.usa-st-dot{transition:none}}";

function defineStepper(tag = 'usa-stepper') {
    // contract-exempt: attr-unobserved — value: state reflected by the element itself (set the property instead); observing it would re-mount on every change
    return base.defineElement(tag, (Base) => {
        class UsaStepper extends Base {
            constructor() {
                super(...arguments);
                this._steps = [];
                this._v = 0;
                this._fill = null;
            }
            static get observedAttributes() {
                return ['orientation', 'label', 'clickable'];
            }
            get steps() {
                return this._steps;
            }
            get value() {
                return this._v;
            }
            set value(v) {
                this.go(v);
            }
            mount() {
                this.dataset.orientation = this.str('orientation', 'horizontal') === 'vertical' ? 'vertical' : 'horizontal';
                this.setAttribute('role', 'list');
                if (!this.hasAttribute('aria-label'))
                    this.setAttribute('aria-label', this.str('label', 'Progress'));
                this._steps = shared.ownChildren(this);
                if (!this.querySelector(':scope > .usa-st-rail')) {
                    const rail = document.createElement('span');
                    rail.className = 'usa-st-rail';
                    rail.setAttribute('data-usa-part', '');
                    rail.setAttribute('aria-hidden', 'true');
                    rail.innerHTML = '<span class="usa-st-fill"></span>';
                    this.prepend(rail);
                }
                this._fill = this.querySelector('.usa-st-fill');
                this._steps.forEach((s, i) => {
                    s.classList.add('usa-st-step');
                    s.setAttribute('role', 'listitem');
                    s.style.setProperty('--usa-st-i', String(i));
                    if (!s.querySelector(':scope > .usa-st-dot')) {
                        const d = document.createElement('span');
                        d.className = 'usa-st-dot';
                        d.setAttribute('aria-hidden', 'true');
                        d.setAttribute('data-usa-part', '');
                        d.innerHTML = `<span class="usa-st-num">${i + 1}</span><svg class="usa-st-check" viewBox="0 0 16 16"><path d="M3 8.5l3.2 3L13 4.8"/></svg>`;
                        s.prepend(d);
                    }
                    if (s.hasAttribute('data-clickable') || this.flag('clickable'))
                        this.listen(s, 'click', () => this.go(i));
                });
                this._v = shared.clampN(this.num('value', 0) | 0, 0, Math.max(0, this._steps.length - 1));
                this.sync(-1);
            }
            sync(prev) {
                const n = this._steps.length;
                this._steps.forEach((s, i) => {
                    s.toggleAttribute('data-done', i < this._v);
                    s.toggleAttribute('data-current', i === this._v);
                    if (i === this._v)
                        s.setAttribute('aria-current', 'step');
                    else
                        s.removeAttribute('aria-current');
                });
                const pct = n > 1 ? (this._v / (n - 1)) * 100 : 0;
                this.style.setProperty('--usa-st-p', pct.toFixed(2) + '%');
                if (prev < 0 || this.reduced)
                    return;
                const cur = this._steps[this._v]?.querySelector('.usa-st-dot');
                if (cur)
                    this.motion(cur, [{ transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(124,92,255,.55)' }, { transform: 'scale(1.18)', offset: 0.35 }, { transform: 'scale(1)', boxShadow: '0 0 0 12px rgba(124,92,255,0)' }], { duration: 620, easing: 'ease-out' });
                if (this._v > prev) {
                    const done = this._steps[prev]?.querySelector('.usa-st-check');
                    if (done)
                        this.motion(done, [{ strokeDashoffset: 20, transform: 'scale(.4)' }, { strokeDashoffset: 0, transform: 'scale(1)' }], { duration: 420, easing: 'cubic-bezier(.3,1.4,.5,1)' });
                }
            }
            go(i) {
                const v = shared.clampN(Math.round(i), 0, Math.max(0, this._steps.length - 1));
                if (v === this._v)
                    return;
                const prev = this._v;
                this._v = v;
                this.setAttribute('value', String(v));
                this.sync(prev);
                this.emit('change', { value: v });
            }
            next() {
                this.go(this._v + 1);
            }
            prev() {
                this.go(this._v - 1);
            }
        }
        return UsaStepper;
    }, { id: 'stepper', text: css });
}

exports.defineStepper = defineStepper;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.2.0/dist/widgets/stepper.cjs.map