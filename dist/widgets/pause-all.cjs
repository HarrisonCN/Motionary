'use strict';

var base = require('../chunks/base-B3me2y0o.cjs');

var css = "usa-pause-all{display:inline-block}usa-pause-all .usa-pa-btn{display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border:1px solid #cbd5e1;border-radius:999px;background:#fff;color:#0f172a;font:600 13px/1 system-ui,sans-serif;cursor:pointer}usa-pause-all .usa-pa-btn:focus-visible{outline:2px solid #6366f1;outline-offset:2px}usa-pause-all .usa-pa-icon{width:12px;height:12px;background:linear-gradient(90deg,currentColor 0 35%,transparent 35% 65%,currentColor 65%)}usa-pause-all[data-paused] .usa-pa-icon{background:currentColor;clip-path:polygon(10% 0,100% 50%,10% 100%)}[data-usa-paused] *,[data-usa-paused] *::before,[data-usa-paused] *::after{animation-play-state:paused!important}";

function definePauseAll(tag = 'usa-pause-all') {
    return base.defineElement(tag, (Base) => {
        class UsaPauseAll extends Base {
            constructor() {
                super(...arguments);
                this._held = [];
                this._media = [];
                this._local = false;
                this.sync = () => undefined;
            }
            static get observedAttributes() {
                return ['label', 'scope', 'resume-label'];
            }
            root() {
                const s = this.str('scope');
                return s ? document.querySelector(s) : null;
            }
            get paused() {
                return this.str('scope') ? this._local : base.getClock().paused;
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this.insertAdjacentHTML('beforeend', `<button type="button" class="usa-pa-btn" data-usa-part><span class="usa-pa-icon" aria-hidden="true"></span><span class="usa-pa-text"></span></button>`);
                const b = this.querySelector('.usa-pa-btn');
                this.listen(b, 'click', () => this.toggle());
                this.sync = () => {
                    const p = this.paused;
                    b.setAttribute('aria-pressed', String(p));
                    b.querySelector('.usa-pa-text').textContent = p ? this.str('resume-label', 'Play animations') : this.str('label', 'Pause animations');
                    this.setFlag('data-paused', p);
                };
                this.onCleanup(base.onClockChange(() => this.sync()));
                this.sync();
            }
            toggle() {
                const pause = !this.paused;
                const scoped = !!this.str('scope');
                const root = scoped ? this.root() : document.documentElement;
                if (!root)
                    return;
                if (pause) {
                    const all = scoped ? root.getAnimations?.({ subtree: true }) || [] : typeof document.getAnimations === 'function' ? document.getAnimations() : [];
                    this._held = all.filter((a) => a.playState === 'running');
                    this._held.forEach((a) => a.pause());
                    this._media = Array.from(root.querySelectorAll('video, audio')).filter((m) => !m.paused);
                    this._media.forEach((m) => m.pause());
                    root.setAttribute('data-usa-paused', '');
                }
                else {
                    this._held.splice(0).forEach((a) => a.play());
                    this._media.splice(0).forEach((m) => m.play?.()?.catch?.(() => undefined));
                    root.removeAttribute('data-usa-paused');
                }
                if (scoped) {
                    this._local = pause;
                    this.sync();
                }
                else
                    base.setClock({ paused: pause });
                this.emit('pause-all', { paused: pause });
            }
        }
        return UsaPauseAll;
    }, { id: 'pause-all', text: css });
}

exports.definePauseAll = definePauseAll;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.4.0/dist/widgets/pause-all.cjs.map