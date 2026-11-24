import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { b as bound, m as make } from '../chunks/moments-Cg_NlOYG.js';
import { c as css } from '../chunks/moments-ui-CQJNkFyY.js';

function defineWifiSignal(tag = 'usa-wifi-signal') {
    const ctor = defineElement(tag, Base => class WifiSignal extends Base {
        static get observedAttributes() { return ['level', 'searching', 'label']; }
        get level() { return Math.round(bound(this.num('level', 3), 0, 3, 3)); }
        set level(n) { this.setAttribute('level', String(Math.round(bound(Number(n), 0, 3, 0)))); }
        changed() { this._sync?.(); }
        mount() {
            const root = make('span', 'usa-moment usa-wifi');
            root.setAttribute('role', 'img');
            for (let i = 0; i < 4; i++) {
                const arc = make('i', 'usa-wifi-arc');
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
    }, { id: 'moment-ui', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineWifiSignal };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/widgets/wifi-signal.js.map