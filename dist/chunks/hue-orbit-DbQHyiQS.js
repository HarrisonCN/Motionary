import { f as defineElement } from './base-SPDwWyB1.js';
import { d as defineMoName } from './mo-name-DT5wwaGR.js';
import { b as bound, m as make, u as uniqueId, s as shortestTurn } from './moments-Cg_NlOYG.js';
import { c as css } from './moments-D7dR6K16.js';

function hueColor(hue, saturation, lightness) {
    return `hsl(${Math.round(hue)} ${Math.round(saturation)}% ${Math.round(lightness)}%)`;
}
function defineHueOrbit(tag = 'usa-hue-orbit') {
    const ctor = defineElement(tag, Base => class HueOrbit extends Base {
        constructor() {
            super(...arguments);
            this._turn = 0;
        }
        static get observedAttributes() { return ['hue', 'count', 'saturation', 'lightness', 'label', 'disabled']; }
        count() { return Math.round(bound(this.num('count', 12), 6, 24, 12)); }
        snap(h) {
            const step = 360 / this.count();
            return (Math.round((((h % 360) + 360) % 360) / step) * step) % 360;
        }
        get hue() { return this.snap(bound(this.num('hue', 210), -1e6, 1e6, 210)); }
        set hue(h) { this.setAttribute('hue', String(Math.round(this.snap(Number(h) || 0)))); }
        get color() { return hueColor(this.hue, bound(this.num('saturation', 78), 0, 100, 78), bound(this.num('lightness', 58), 0, 100, 58)); }
        changed(name) {
            if (name === 'count')
                super.changed(name);
            else
                this._sync?.();
        }
        mount() {
            const count = this.count();
            const root = make('fieldset', 'usa-moment usa-orbit');
            const legend = make('legend', 'usa-orbit-legend');
            const ring = make('div', 'usa-orbit-ring');
            const core = make('span', 'usa-orbit-core');
            core.setAttribute('aria-hidden', 'true');
            const name = uniqueId('usa-hue-orbit');
            const inputs = [];
            for (let i = 0; i < count; i++) {
                const h = (360 / count) * i;
                const item = make('label', 'usa-orbit-dot');
                item.style.setProperty('--a', `${h}deg`);
                const input = make('input');
                input.type = 'radio';
                input.name = name;
                input.value = String(Math.round(h));
                item.append(input, make('span', 'usa-sr', `Hue ${Math.round(h)}°`));
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
                this._turn = shortestTurn(this._turn, -hue);
                root.style.setProperty('--turn', `${this._turn}deg`);
                root.style.setProperty('--pick', color);
                root.style.setProperty('--s', `${bound(this.num('saturation', 78), 0, 100, 78)}%`);
                root.style.setProperty('--l', `${bound(this.num('lightness', 58), 0, 100, 58)}%`);
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
    }, { id: 'moments', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineHueOrbit as d, hueColor as h };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/chunks/hue-orbit-DbQHyiQS.js.map