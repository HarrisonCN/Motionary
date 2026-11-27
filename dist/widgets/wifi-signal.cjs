'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var momentsUi = require('../chunks/moments-ui-Wb8gBRiX.cjs');

function defineWifiSignal(tag = 'usa-wifi-signal') {
    const ctor = base.defineElement(tag, Base => class WifiSignal extends Base {
        static get observedAttributes() { return ['level', 'searching', 'label']; }
        get level() { return Math.round(moments.bound(this.num('level', 3), 0, 3, 3)); }
        set level(n) { this.setAttribute('level', String(Math.round(moments.bound(Number(n), 0, 3, 0)))); }
        changed() { this._sync?.(); }
        mount() {
            const root = moments.make('span', 'usa-moment usa-wifi');
            root.setAttribute('role', 'img');
            for (let i = 0; i < 4; i++) {
                const arc = moments.make('i', 'usa-wifi-arc');
                arc.style.setProperty('--i', String(i));
                root.append(arc);
            }
            this.append(root);
            const sync = () => {
                const searching = this.flag('searching'), level = this.level;
                root.dataset.level = String(level);
                root.toggleAttribute('data-searching', searching);
                root.toggleAttribute('data-static', this.reduced);
                root.setAttribute('aria-label', `${this.str('label', 'Signal')}: ${searching ? 'searching' : `${level} of 3`}`);
            };
            this._sync = sync;
            this.inView((visible) => root.toggleAttribute('data-offscreen', !visible));
            this.onCleanup(() => { root.remove(); this._sync = undefined; });
            sync();
        }
    }, { id: 'moment-ui', text: momentsUi.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineWifiSignal = defineWifiSignal;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/widgets/wifi-signal.cjs.map