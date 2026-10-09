'use strict';

var base = require('./base-B3me2y0o.cjs');

var css = "usa-presence{--s:var(--usa-pr2-size,48px);position:relative;display:inline-grid;place-items:center;width:var(--s);height:var(--s);vertical-align:middle}.usa-pr2-face{display:grid;place-items:center;width:100%;height:100%;border-radius:50%;overflow:hidden;background:linear-gradient(135deg,#a78bfa,#22d3ee);color:#fff;font:700 calc(var(--s) * .36)/1 system-ui,sans-serif}.usa-pr2-face img{width:100%;height:100%;object-fit:cover}.usa-pr2-dot,.usa-pr2-ripple{position:absolute;right:0;bottom:0;width:calc(var(--s) * .28);height:calc(var(--s) * .28);border-radius:50%;box-sizing:border-box}.usa-pr2-dot{border:2px solid var(--usa-pr2-ring,#fff);background:#94a3b8;transition:background-color .3s}.usa-pr2-ripple{background:#22c55e;pointer-events:none}usa-presence[data-state=online] .usa-pr2-dot{background:#22c55e}usa-presence[data-state=away] .usa-pr2-dot{background:#f59e0b}usa-presence[data-state=busy] .usa-pr2-dot{background:#ef4444}usa-presence[speaking] .usa-pr2-face{box-shadow:0 0 0 3px #22c55e;animation:usa-pr2-speak 1.2s ease-in-out infinite}@keyframes usa-pr2-speak{50%{box-shadow:0 0 0 6px rgba(34,197,94,.35)}}usa-presence[story]::before{content:\"\";position:absolute;inset:-4px;border-radius:50%;background:conic-gradient(#f59e0b,#ef4444,#d946ef,#7c3aed,#f59e0b);animation:usa-pr2-spin 3s linear infinite;z-index:-1}usa-presence[story] .usa-pr2-face{box-shadow:0 0 0 2px var(--usa-pr2-ring,#fff)}@keyframes usa-pr2-spin{to{transform:rotate(1turn)}}@media (prefers-reduced-motion:reduce){usa-presence[speaking] .usa-pr2-face,usa-presence[story]::before{animation:none}.usa-pr2-dot{transition:none}}";

/** Presence states (7.4). */
const PRESENCE_STATES = ['online', 'away', 'busy', 'offline'];
/** Initials for a display name (7.4). */
const initials = (name) => name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => Array.from(w)[0].toUpperCase())
    .join('');
function definePresence(tag = 'usa-presence') {
    return base.defineElement(tag, (Base) => {
        class UsaPresence extends Base {
            constructor() {
                super(...arguments);
                this._prev = '';
            }
            static get observedAttributes() {
                return ['status', 'speaking', 'name', 'src'];
            }
            get status() {
                const s = this.str('status', 'offline');
                return PRESENCE_STATES.includes(s) ? s : 'offline';
            }
            set status(v) {
                this.setAttribute('status', v);
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this.insertAdjacentHTML('afterbegin', '<span class="usa-pr2-face" data-usa-part></span><i class="usa-pr2-dot" data-usa-part aria-hidden="true"></i>');
                this.setAttribute('role', 'img');
                this._prev = '';
                this.paint();
            }
            changed() {
                if (this.isConnected && this.querySelector('.usa-pr2-face'))
                    this.paint();
            }
            paint() {
                const face = this.querySelector('.usa-pr2-face');
                const name = this.str('name', '');
                const src = this.str('src', '');
                if (src)
                    face.innerHTML = `<img alt="" src="${src.replace(/"/g, '&quot;')}">`;
                else
                    face.textContent = initials(name) || '?';
                const s = this.status;
                this.dataset.state = s;
                this.setAttribute('aria-label', `${name || 'User'}, ${s}${this.flag('speaking') ? ', speaking' : ''}`);
                const dot = this.querySelector('.usa-pr2-dot');
                if (this._prev && this._prev !== s && !this.reduced) {
                    this.motion(dot, [{ transform: 'scale(.4)' }, { transform: 'scale(1.3)', offset: 0.6 }, { transform: 'scale(1)' }], { duration: 360, easing: 'ease-out' });
                    if (s === 'online') {
                        const r = document.createElement('i');
                        r.className = 'usa-pr2-ripple';
                        r.setAttribute('aria-hidden', 'true');
                        this.appendChild(r);
                        const a = this.motion(r, [{ transform: 'scale(1)', opacity: 0.7 }, { transform: 'scale(3.2)', opacity: 0 }], { duration: 700, easing: 'ease-out' });
                        if (a)
                            a.finished.then(() => r.remove(), () => r.remove());
                        else
                            r.remove();
                    }
                }
                this._prev = s;
            }
        }
        return UsaPresence;
    }, { id: 'presence', text: css });
}

exports.PRESENCE_STATES = PRESENCE_STATES;
exports.definePresence = definePresence;
exports.initials = initials;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.4.0/dist/chunks/presence-230b12uw.cjs.map