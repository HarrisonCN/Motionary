'use strict';

var base = require('./base-B3me2y0o.cjs');

var css = "usa-prize-wheel{display:inline-block;--s:var(--usa-pw-size,200px);font:700 11px/1 system-ui,sans-serif}.usa-pw-box{position:relative;display:grid;place-items:center;width:var(--s);height:var(--s)}.usa-pw-wheel{position:absolute;inset:0;border-radius:50%;box-shadow:0 0 0 4px #fff,0 0 0 6px rgba(15,23,42,.15),0 8px 24px rgba(15,23,42,.2);will-change:transform}.usa-pw-label{position:absolute;left:50%;top:0;width:0;height:50%;display:flex;justify-content:center;padding-top:10px;transform-origin:0 100%;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.35);white-space:nowrap}.usa-pw-pointer{position:absolute;top:-10px;left:50%;margin-left:-9px;width:0;height:0;border:9px solid transparent;border-top:16px solid var(--usa-pw-pointer,#0f172a);border-bottom:0;z-index:2;transform-origin:50% 0}.usa-pw-btn{position:relative;z-index:1;width:30%;aspect-ratio:1;border:0;border-radius:50%;background:#fff;color:#0f172a;font:800 13px/1 system-ui,sans-serif;box-shadow:0 2px 8px rgba(15,23,42,.25);cursor:pointer}.usa-pw-btn:disabled{cursor:progress;opacity:.85}usa-prize-wheel[data-done] .usa-pw-wheel{box-shadow:0 0 0 4px #fff,0 0 0 6px #facc15,0 0 28px rgba(250,204,21,.6)}.usa-pw-live{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}";

/** Final wheel rotation (deg) that puts segment `index` of `count` under the top pointer after `turns` full turns (7.5). */
function wheelAngle(index, count, turns = 5) {
    const seg = 360 / Math.max(1, count);
    return turns * 360 + (360 - (index * seg + seg / 2));
}
const COLORS = ['#7c5cff', '#22d3ee', '#f59e0b', '#ef4444', '#22c55e', '#ec4899', '#3b82f6', '#a3e635'];
function definePrizeWheel(tag = 'usa-prize-wheel') {
    return base.defineElement(tag, (Base) => {
        class UsaPrizeWheel extends Base {
            constructor() {
                super(...arguments);
                this._r = -1;
                this._spin = false;
                this._rot = 0;
            }
            static get observedAttributes() {
                return ['segments', 'label', 'turns', 'duration'];
            }
            get segments() {
                return this.str('segments', '10% off,Free ship,Try again,🎁 Gift,5% off,Jackpot').split(',').map((s) => s.trim()).filter(Boolean);
            }
            get result() {
                return this._r;
            }
            get spinning() {
                return this._spin;
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const s = this.segments;
                const seg = 360 / s.length;
                const grad = s.map((_, i) => `${COLORS[i % COLORS.length]} ${(i * seg).toFixed(2)}deg ${((i + 1) * seg).toFixed(2)}deg`).join(',');
                this.insertAdjacentHTML('beforeend', '<span class="usa-pw-box" data-usa-part><i class="usa-pw-pointer" aria-hidden="true"></i><span class="usa-pw-wheel" aria-hidden="true"></span><button type="button" class="usa-pw-btn"></button></span><span class="usa-pw-live" data-usa-part aria-live="polite"></span>');
                const wheel = this.querySelector('.usa-pw-wheel');
                wheel.style.background = `conic-gradient(${grad})`;
                s.forEach((label, i) => {
                    const l = document.createElement('span');
                    l.className = 'usa-pw-label';
                    l.textContent = label;
                    l.style.transform = `rotate(${(i * seg + seg / 2).toFixed(2)}deg)`;
                    wheel.appendChild(l);
                });
                this._rot = 0;
                const btn = this.querySelector('.usa-pw-btn');
                btn.textContent = this.str('label', 'Spin');
                btn.setAttribute('aria-label', `${this.str('label', 'Spin')} the prize wheel`);
                this.listen(btn, 'click', () => void this.spin());
            }
            async spin(index) {
                if (this._spin)
                    return this._r;
                const s = this.segments;
                const i = index !== undefined && index >= 0 && index < s.length ? Math.floor(index) : Math.floor(Math.random() * s.length);
                const wheel = this.querySelector('.usa-pw-wheel');
                const btn = this.querySelector('.usa-pw-btn');
                if (!wheel || !btn)
                    return -1;
                this._spin = true;
                btn.disabled = true;
                this.removeAttribute('data-done');
                const base = this._rot - (this._rot % 360);
                const to = base + wheelAngle(i, s.length, this.reduced ? 0 : this.num('turns', 5));
                const from = this._rot;
                this._rot = to;
                const a = this.reduced ? null : this.motion(wheel, [{ transform: `rotate(${from}deg)` }, { transform: `rotate(${to}deg)` }], { duration: this.num('duration', 4000), easing: 'cubic-bezier(.12,.6,.1,1)' });
                wheel.style.transform = `rotate(${to}deg)`;
                if (a) {
                    const ptr = this.querySelector('.usa-pw-pointer');
                    this.motion(ptr, [{ transform: 'rotate(0)' }, { transform: 'rotate(-18deg)' }, { transform: 'rotate(0)' }], { duration: 160, iterations: 18, easing: 'ease-out' });
                    await a.finished.catch(() => undefined);
                }
                this._spin = false;
                btn.disabled = false;
                this._r = i;
                this.setAttribute('data-done', '');
                this.querySelector('.usa-pw-live').textContent = `Result: ${s[i]}`;
                this.emit('result', { index: i, label: s[i] });
                return i;
            }
        }
        return UsaPrizeWheel;
    }, { id: 'prize-wheel', text: css });
}

exports.definePrizeWheel = definePrizeWheel;
exports.wheelAngle = wheelAngle;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.5.0/dist/chunks/prize-wheel-CYEPyee6.cjs.map