'use strict';

var base = require('./base-B3me2y0o.cjs');

var css = "usa-xp-bar{display:flex;align-items:center;gap:10px;width:var(--usa-xp-w,300px);max-width:100%;font:600 13px/1 system-ui,sans-serif}.usa-xp-lvl{flex:none;display:grid;place-items:center;width:34px;height:34px;border-radius:50%;background:var(--usa-xp-accent,#7c5cff);color:#fff;font-size:15px;font-weight:800;box-shadow:0 0 0 3px rgba(124,92,255,.25)}.usa-xp-track{flex:1;min-width:0;height:12px;border-radius:99px;background:var(--usa-xp-track,rgba(15,23,42,.1));overflow:hidden}.usa-xp-fill{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--usa-xp-accent,#7c5cff),#22d3ee);transform-origin:0 50%;transform:scaleX(0)}.usa-xp-num{flex:none;font-variant-numeric:tabular-nums;opacity:.75}usa-xp-bar[data-levelup] .usa-xp-lvl{background:#f59e0b;box-shadow:0 0 0 4px rgba(245,158,11,.35)}.usa-xp-live{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}";

/** Apply `gain` XP to (level, xp) with `per` XP per level (7.5). */
function levelFor(level, xp, gain, per = 100) {
    const p = Math.max(1, per);
    let total = Math.max(0, xp + gain);
    let ups = 0;
    while (total >= p) {
        total -= p;
        ups++;
    }
    return { level: level + ups, xp: total, ups };
}
function defineXpBar(tag = 'usa-xp-bar') {
    return base.defineElement(tag, (Base) => {
        class UsaXpBar extends Base {
            constructor() {
                super(...arguments);
                this._busy = false;
            }
            static get observedAttributes() {
                return ['level', 'xp', 'per'];
            }
            get level() {
                return Math.max(1, Math.floor(this.num('level', 1)));
            }
            set level(v) {
                this.setAttribute('level', String(v));
            }
            get xp() {
                return Math.max(0, this.num('xp', 0));
            }
            set xp(v) {
                this.setAttribute('xp', String(v));
            }
            get per() {
                return Math.max(1, this.num('per', 100));
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this.insertAdjacentHTML('beforeend', '<b class="usa-xp-lvl" data-usa-part aria-hidden="true"></b><span class="usa-xp-track" data-usa-part><i class="usa-xp-fill"></i></span><span class="usa-xp-num" data-usa-part aria-hidden="true"></span><span class="usa-xp-live" data-usa-part aria-live="polite"></span>');
                this.setAttribute('role', 'progressbar');
                this.setAttribute('aria-valuemin', '0');
                this.paint(false);
            }
            changed() {
                if (!this._busy && this.querySelector('.usa-xp-fill'))
                    this.paint(false);
            }
            paint(animate, from) {
                const per = this.per;
                const xp = Math.min(this.xp, per);
                this.querySelector('.usa-xp-lvl').textContent = String(this.level);
                this.querySelector('.usa-xp-num').textContent = `${Math.round(xp)} / ${per} XP`;
                this.setAttribute('aria-valuemax', String(per));
                this.setAttribute('aria-valuenow', String(Math.round(xp)));
                this.setAttribute('aria-label', `Level ${this.level}, ${Math.round(xp)} of ${per} XP`);
                const fill = this.querySelector('.usa-xp-fill');
                const to = `scaleX(${(xp / per).toFixed(4)})`;
                if (animate && !this.reduced && from !== undefined)
                    this.motion(fill, [{ transform: `scaleX(${from.toFixed(4)})` }, { transform: to }], { duration: 500, easing: 'cubic-bezier(.2,.8,.3,1)' });
                fill.style.transform = to;
            }
            add(n) {
                const per = this.per;
                const start = this.level;
                const r = levelFor(start, Math.min(this.xp, per), Number(n) || 0, per);
                const fill = this.querySelector('.usa-xp-fill');
                const fromK = Math.min(this.xp, per) / per;
                this._busy = true;
                this.level = r.level;
                this.xp = r.xp;
                this._busy = false;
                if (!fill)
                    return;
                if (r.ups && !this.reduced) {
                    this.motion(fill, [{ transform: `scaleX(${fromK.toFixed(4)})` }, { transform: 'scaleX(1)' }], { duration: 380, easing: 'ease-in' });
                    const lvl = this.querySelector('.usa-xp-lvl');
                    this.motion(lvl, [{ transform: 'scale(1)' }, { transform: 'scale(1.6) rotate(-8deg)', offset: 0.5 }, { transform: 'scale(1)' }], { duration: 600, delay: 340, easing: 'ease-out' });
                    this.dataset.levelup = '';
                    setTimeout(() => {
                        delete this.dataset.levelup;
                    }, 1200);
                    setTimeout(() => this.isConnected && this.paint(true, 0), 380);
                    this.paint(false);
                    fill.style.transform = 'scaleX(1)';
                }
                else
                    this.paint(true, fromK);
                if (r.ups) {
                    this.querySelector('.usa-xp-live').textContent = `Level up! Level ${r.level}`;
                    this.emit('levelup', { level: r.level });
                }
                this.emit('xp', { level: r.level, xp: r.xp, gained: n });
            }
        }
        return UsaXpBar;
    }, { id: 'xp-bar', text: css });
}

exports.defineXpBar = defineXpBar;
exports.levelFor = levelFor;
//# sourceMappingURL=xp-bar-D4Yq5Dpv.cjs.map
