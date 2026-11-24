'use strict';

var base = require('./base-DzZEJhQB.cjs');
var moName = require('./mo-name-DR9ysd5S.cjs');
var moments$1 = require('./moments-eoZA2npZ.cjs');
var moments = require('./moments-Rge1M2_3.cjs');

function hueColor(hue, saturation, lightness) {
    return `hsl(${Math.round(hue)} ${Math.round(saturation)}% ${Math.round(lightness)}%)`;
}
function defineHueOrbit(tag = 'usa-hue-orbit') {
    const ctor = base.defineElement(tag, Base => class HueOrbit extends Base {
        constructor() {
            super(...arguments);
            this._turn = 0;
        }
        static get observedAttributes() { return ['hue', 'count', 'saturation', 'lightness', 'label', 'disabled']; }
        count() { return Math.round(moments$1.bound(this.num('count', 12), 6, 24, 12)); }
        snap(h) {
            const step = 360 / this.count();
            return (Math.round((((h % 360) + 360) % 360) / step) * step) % 360;
        }
        get hue() { return this.snap(moments$1.bound(this.num('hue', 210), -1e6, 1e6, 210)); }
        set hue(h) { this.setAttribute('hue', String(Math.round(this.snap(Number(h) || 0)))); }
        get color() { return hueColor(this.hue, moments$1.bound(this.num('saturation', 78), 0, 100, 78), moments$1.bound(this.num('lightness', 58), 0, 100, 58)); }
        changed(name) {
            if (name === 'count')
                super.changed(name);
            else
                this._sync?.();
        }
        mount() {
            const count = this.count();
            const root = moments$1.make('fieldset', 'usa-moment usa-orbit');
            const legend = moments$1.make('legend', 'usa-orbit-legend');
            const ring = moments$1.make('div', 'usa-orbit-ring');
            const core = moments$1.make('span', 'usa-orbit-core');
            core.setAttribute('aria-hidden', 'true');
            const name = moments$1.uniqueId('usa-hue-orbit');
            const inputs = [];
            for (let i = 0; i < count; i++) {
                const h = (360 / count) * i;
                const item = moments$1.make('label', 'usa-orbit-dot');
                item.style.setProperty('--a', `${h}deg`);
                const input = moments$1.make('input');
                input.type = 'radio';
                input.name = name;
                input.value = String(Math.round(h));
                item.append(input, moments$1.make('span', 'usa-sr', `Hue ${Math.round(h)}°`));
                inputs.push(input);
                ring.append(item);
            }
            ring.append(core);
            root.append(legend, ring);
            this.append(root);
            this._turn = -this.hue;
            const sync = () => {
                const hue = this.hue, color = this.color, disabled = this.flag('disabled');
                legend.textContent = this.str('label', 'Accent hue');
                this._turn = moments$1.shortestTurn(this._turn, -hue);
                root.style.setProperty('--turn', `${this._turn}deg`);
                root.style.setProperty('--pick', color);
                root.style.setProperty('--s', `${moments$1.bound(this.num('saturation', 78), 0, 100, 78)}%`);
                root.style.setProperty('--l', `${moments$1.bound(this.num('lightness', 58), 0, 100, 58)}%`);
                root.toggleAttribute('data-static', this.reduced);
                root.disabled = disabled;
                for (const input of inputs) {
                    const on = Number(input.value) === Math.round(hue);
                    input.checked = on;
                    input.parentElement.toggleAttribute('data-on', on);
                }
            };
            this._sync = sync;
            for (const input of inputs)
                this.listen(input, 'change', () => {
                    if (!input.checked || this.flag('disabled'))
                        return;
                    this.hue = Number(input.value);
                    this.emit('change', { hue: this.hue, color: this.color });
                });
            this.onCleanup(() => { root.remove(); this._sync = undefined; });
            sync();
        }
    }, { id: 'moments', text: moments.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineHueOrbit = defineHueOrbit;
exports.hueColor = hueColor;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/chunks/hue-orbit-BGfcmKZH.cjs.map