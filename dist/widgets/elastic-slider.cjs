'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var spring = require('../chunks/spring-DoapHVAk.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var momentsUi = require('../chunks/moments-ui-Wb8gBRiX.cjs');

function defineElasticSlider(tag = 'usa-elastic-slider') {
    const ctor = base.defineElement(tag, Base => class ElasticSlider extends Base {
        static get observedAttributes() { return ['value', 'min', 'max', 'step', 'ticks', 'label', 'unit', 'name', 'disabled']; }
        range() {
            const min = this.num('min', 0), max = Math.max(min + 1e-9, this.num('max', 32));
            const step = this.num('step', 1) > 0 ? this.num('step', 1) : 1;
            return [min, max, step];
        }
        get value() {
            const [min, max, step] = this.range();
            return moments.roundTo(moments.bound(this.num('value', 16), min, max, min), step);
        }
        set value(n) { this.setAttribute('value', String(n)); }
        changed() { this._sync?.(); }
        mount() {
            const root = moments.make('div', 'usa-moment usa-elastic');
            const id = moments.uniqueId('usa-elastic');
            const title = moments.make('label', 'usa-elastic-label');
            title.htmlFor = id;
            const rail = moments.make('div', 'usa-elastic-rail');
            const bubble = moments.make('output', 'usa-elastic-bubble');
            bubble.htmlFor.add(id);
            const input = moments.make('input', 'usa-elastic-input');
            input.type = 'range';
            input.id = id;
            const ticks = moments.make('span', 'usa-elastic-ticks');
            ticks.setAttribute('aria-hidden', 'true');
            rail.append(input, bubble, ticks);
            root.append(title, rail);
            this.append(root);
            const at = (v) => { const [min, max] = this.range(); return (v - min) / (max - min); };
            const lag = spring.createSpring({ value: at(this.value), spring: { stiffness: 260, damping: 14 }, onUpdate: (p, velocity) => {
                    root.style.setProperty('--b', p.toFixed(4));
                    root.style.setProperty('--lean', moments.bound(velocity * 14, -28, 28, 0).toFixed(2));
                } });
            const sync = () => {
                const [min, max, step] = this.range(), v = this.value, n = Math.round(moments.bound(this.num('ticks', 9), 0, 21, 9));
                title.textContent = this.str('label', 'Value');
                input.min = String(min);
                input.max = String(max);
                input.step = String(step);
                input.value = String(v);
                input.name = this.str('name');
                input.disabled = this.flag('disabled');
                bubble.textContent = `${v}${this.str('unit')}`;
                root.style.setProperty('--v', at(v).toFixed(4));
                if (ticks.childElementCount !== n)
                    ticks.replaceChildren(...Array.from({ length: n }, (_, i) => {
                        const t = moments.make('i');
                        t.style.setProperty('--t', String(n > 1 ? i / (n - 1) : 0));
                        return t;
                    }));
                if (this.reduced) {
                    lag.jump(at(v));
                    root.style.setProperty('--lean', '0');
                }
                else
                    lag.set(at(v));
            };
            this._sync = sync;
            this.listen(input, 'input', () => {
                this.value = input.valueAsNumber;
                this.emit('input', { value: this.value });
            });
            this.listen(input, 'change', () => this.emit('change', { value: this.value }));
            this.onCleanup(() => { lag.stop(); root.remove(); this._sync = undefined; });
            sync();
        }
    }, { id: 'moment-ui', text: momentsUi.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineElasticSlider = defineElasticSlider;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/widgets/elastic-slider.cjs.map