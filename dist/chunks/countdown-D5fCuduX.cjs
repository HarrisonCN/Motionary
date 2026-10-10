'use strict';

var base = require('./base-B3me2y0o.cjs');

var css = "usa-countdown{display:inline-block;font:700 12px/1.2 system-ui,sans-serif;color:var(--usa-cd-fg,inherit)}.usa-cd-row{display:flex;gap:var(--usa-cd-gap,10px)}.usa-cd-unit{display:flex;flex-direction:column;align-items:center;gap:4px}.usa-cd-unit small{font-size:10px;text-transform:uppercase;letter-spacing:.08em;opacity:.6}.usa-cd-digits{display:flex;gap:3px;perspective:300px}.usa-cd-d{display:grid;place-items:center;width:var(--usa-cd-w,28px);height:calc(var(--usa-cd-w,28px) * 1.35);border-radius:6px;background:var(--usa-cd-bg,#111827);color:var(--usa-cd-c,#fff);font:800 calc(var(--usa-cd-w,28px) * .8)/1 ui-monospace,monospace;box-shadow:inset 0 -1px 0 rgba(255,255,255,.08),0 4px 10px -4px rgba(0,0,0,.5);background-image:linear-gradient(transparent 49%,rgba(0,0,0,.35) 50%,transparent 51%);transform-origin:50% 50%}usa-countdown[data-done] .usa-cd-d{background-color:var(--usa-cd-done,#ef4444)}";

/** Split seconds into d/h/m/s (7.3). */
function splitTime(sec) {
    const t = Math.max(0, Math.floor(sec));
    return { d: Math.floor(t / 86400), h: Math.floor((t % 86400) / 3600), m: Math.floor((t % 3600) / 60), s: t % 60 };
}
const NAMES = { d: 'days', h: 'hours', m: 'minutes', s: 'seconds' };
function defineCountdown(tag = 'usa-countdown') {
    return base.defineElement(tag, (Base) => {
        class UsaCountdown extends Base {
            constructor() {
                super(...arguments);
                this._end = 0;
                this._timer = 0;
                this._lastMin = -1;
            }
            static get observedAttributes() {
                return ['to', 'seconds', 'units', 'labels', 'label'];
            }
            get left() {
                return Math.max(0, Math.round((this._end - Date.now()) / 1000));
            }
            mount() {
                const units = this.str('units', 'd,h,m,s').split(',').map((u) => u.trim()).filter((u) => u in NAMES);
                const labels = this.str('labels', '').split(',');
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this.insertAdjacentHTML('afterbegin', `<span class="usa-cd-row" data-usa-part aria-hidden="true">${units.map((u, i) => `<span class="usa-cd-unit" data-u="${u}"><span class="usa-cd-digits"></span><small>${labels[i]?.trim() || NAMES[u]}</small></span>`).join('')}</span>`);
                this.setAttribute('role', 'timer');
                this.reset();
                this.onCleanup(() => this.stop());
                this.start();
            }
            changed() {
                if (this.isConnected)
                    (this.reset(), this.start());
            }
            reset() {
                const to = this.str('to', '');
                const t = to ? Date.parse(to) : NaN;
                this._end = Number.isFinite(t) ? t : Date.now() + this.num('seconds', 60) * 1000;
                this._lastMin = -1;
                this.removeAttribute('data-done');
                this.paint(false);
            }
            start() {
                this.stop();
                this._timer = setInterval(() => this.paint(true), 1000);
            }
            stop() {
                if (this._timer)
                    clearInterval(this._timer);
                this._timer = 0;
            }
            paint(flip) {
                const left = this.left;
                const t = splitTime(left);
                this.querySelectorAll('.usa-cd-unit').forEach((u) => {
                    const key = u.dataset.u;
                    const val = String(key === 'h' && !this.querySelector('[data-u="d"]') ? t.h + t.d * 24 : t[key]).padStart(2, '0');
                    const box = u.querySelector('.usa-cd-digits');
                    while (box.children.length < val.length)
                        box.insertAdjacentHTML('afterbegin', '<b class="usa-cd-d">0</b>');
                    while (box.children.length > val.length)
                        box.firstElementChild.remove();
                    Array.from(box.children).forEach((d, i) => {
                        if (d.textContent === val[i])
                            return;
                        d.textContent = val[i];
                        if (flip && !this.reduced)
                            this.motion(d, [{ transform: 'rotateX(-90deg)', filter: 'brightness(.7)' }, { transform: 'none', filter: 'none' }], { duration: 360, easing: 'cubic-bezier(.3,1.4,.6,1)' });
                    });
                });
                const min = Math.floor(left / 60);
                if (min !== this._lastMin) {
                    this._lastMin = min;
                    this.setAttribute('aria-label', `${this.str('label', 'Time left')}: ${t.d ? `${t.d} days ` : ''}${t.h} hours ${t.m} minutes`);
                }
                if (flip)
                    this.emit('tick', { left });
                if (left <= 0 && !this.hasAttribute('data-done')) {
                    this.setAttribute('data-done', '');
                    this.stop();
                    this.emit('done', {});
                }
            }
        }
        return UsaCountdown;
    }, { id: 'countdown', text: css });
}

exports.defineCountdown = defineCountdown;
exports.splitTime = splitTime;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.2.0/dist/chunks/countdown-D5fCuduX.cjs.map