'use strict';

var base = require('./base-DzZEJhQB.cjs');
var moName = require('./mo-name-DR9ysd5S.cjs');
var moments = require('./moments-eoZA2npZ.cjs');
var kit = require('./kit-CujTUbPK.cjs');
var pageKit = require('./page-kit-BcYkJGw5.cjs');

/** How far (0–1) a block whose top is at `top` and height `height` has risen into a viewport `vh` tall. */
function riseProgress(top, height, vh) {
    if (!(height > 0) || !(vh > 0))
        return 1;
    const p = (vh - top) / Math.min(height, vh);
    return Math.min(1, Math.max(0, p));
}
function defineRevealFooter(tag = 'usa-reveal-footer') {
    const ctor = base.defineElement(tag, Base => class RevealFooter extends Base {
        constructor() {
            super(...arguments);
            this._p = 1;
        }
        static get observedAttributes() { return ['shift', 'landmark']; }
        get progress() { return this._p; }
        mount() {
            const kids = kit.ownChildren(this);
            const root = moments.make(this.str('landmark') === 'false' ? 'div' : 'footer', 'usa-kit usa-rfoot');
            const inner = moments.make('div', 'usa-rfoot-inner');
            inner.append(...kids);
            root.append(inner);
            this.append(root);
            root.style.setProperty('--shift', `${Math.min(100, Math.max(0, this.num('shift', 50)))}%`);
            let pending = 0, told = false, active = false;
            const update = () => {
                pending = 0;
                const r = root.getBoundingClientRect();
                const p = this.reduced ? 1 : riseProgress(r.top, r.height, window.innerHeight);
                this._p = p;
                root.style.setProperty('--p', p.toFixed(4));
                if (p >= 1 && !told) {
                    told = true;
                    this.emit('reveal');
                }
                if (p < 0.98)
                    told = false;
            };
            const queue = () => { if (active && !pending)
                pending = base.raf(update, this); };
            this.inView((v) => { active = v; if (v)
                queue(); }, { rootMargin: '20% 0px' });
            this.listen(window, 'scroll', queue, { passive: true });
            this.listen(window, 'resize', queue, { passive: true });
            this.onCleanup(() => {
                if (pending)
                    base.caf(pending);
                this.append(...kids);
                root.remove();
                this._p = 1;
            });
            update();
        }
    }, { id: 'page-kit', text: pageKit.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineRevealFooter = defineRevealFooter;
exports.riseProgress = riseProgress;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/chunks/reveal-footer-BvjeDtHz.cjs.map