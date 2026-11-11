'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var luminous = require('../chunks/luminous-B_-9G2GO.cjs');

var css = ":is(mo-halo-slider,usa-halo-slider){width:var(--mo-slider-width,260px);max-width:100%}.usa-hsl-label{display:grid;grid-template-columns:1fr auto;gap:12px;font-size:14px;color:var(--lu-fg)}.usa-hsl-label>output{font-variant-numeric:tabular-nums;opacity:.7}.usa-hsl-range{grid-column:1/-1;appearance:none;-webkit-appearance:none;box-sizing:border-box;width:100%;height:44px;margin:0;border:1px solid var(--lu-edge);border-radius:18px;background:linear-gradient(to right,color-mix(in srgb,var(--lu-accent) 45%,var(--lu-bg)) var(--lu-fill),var(--lu-bg) var(--lu-fill));box-shadow:inset 0 3px 8px var(--lu-inset);cursor:pointer}.usa-hsl-range::-webkit-slider-thumb{appearance:none;-webkit-appearance:none;box-sizing:border-box;width:32px;height:36px;border:1px solid var(--lu-accent);border-radius:13px;background:var(--lu-glass);background-color:var(--lu-bg);box-shadow:0 0 15px var(--lu-accent),inset 0 1px 1px #fff8}.usa-hsl-range::-moz-range-thumb{box-sizing:border-box;width:32px;height:36px;border:1px solid var(--lu-accent);border-radius:13px;background:var(--lu-glass);background-color:var(--lu-bg);box-shadow:0 0 15px var(--lu-accent),inset 0 1px 1px #fff8}[dir=rtl] .usa-hsl-range,.usa-hsl-range:dir(rtl){background:linear-gradient(to left,color-mix(in srgb,var(--lu-accent) 45%,var(--lu-bg)) var(--lu-fill),var(--lu-bg) var(--lu-fill))}@media(forced-colors:active){.usa-hsl-range{appearance:auto;-webkit-appearance:auto}}";

function defineHaloSlider(tag = 'usa-halo-slider') {
    const ctor = base.defineElement(tag, Base => {
        class HaloSlider extends Base {
            constructor() {
                super(...arguments);
                this._reflecting = false;
            }
            static get observedAttributes() { return ['value', 'min', 'max', 'step', 'disabled', 'label', 'name', 'theme']; }
            get value() { return this._input ? Number(this._input.value) : this.num('value', 0); }
            set value(v) { this.setAttribute('value', String(Number.isFinite(v) ? v : 0)); }
            changed(name) { if (!this._reflecting) {
                if (name === 'value')
                    this.sync();
                else
                    super.changed(name);
            } }
            mount() {
                luminous.luminousTheme(this);
                this.querySelectorAll(':scope > [data-usa-part]').forEach(n => n.remove());
                const label = document.createElement('label');
                label.className = 'usa-hsl-label';
                label.setAttribute('data-usa-part', '');
                const title = document.createElement('span');
                title.textContent = this.str('label', 'Level');
                const output = document.createElement('output');
                output.setAttribute('aria-hidden', 'true');
                this._output = output;
                label.append(title, output);
                const input = document.createElement('input');
                input.type = 'range';
                input.className = 'usa-hsl-range';
                input.setAttribute('aria-label', this.str('label', 'Level'));
                const min = this.num('min', 0), max = Math.max(min + 1, this.num('max', 100));
                input.min = String(min);
                input.max = String(max);
                input.step = this.str('step') === 'any' ? 'any' : String(Math.max(.000001, this.num('step', 1)));
                if (this._initial === undefined)
                    this._initial = this.str('value', String(min));
                input.name = this.str('name');
                input.disabled = this.flag('disabled');
                input.defaultValue = this._initial;
                label.append(input);
                this.append(label);
                this._input = input;
                this.sync();
                this.listen(input, 'input', () => { this.reflect(); this.emit('input', { value: this.value }); });
                this.listen(input, 'change', () => { this.reflect(); this.emit('change', { value: this.value }); });
                const form = this.closest('form');
                if (form)
                    this.listen(form, 'reset', (e) => { queueMicrotask(() => { if (!e.defaultPrevented && this.isConnected)
                        this.reflect(); }); });
            }
            reflect() {
                if (!this._input)
                    return;
                this._reflecting = true;
                this.setAttribute('value', this._input.value);
                this._reflecting = false;
                const p = (this.value - Number(this._input.min)) / (Number(this._input.max) - Number(this._input.min));
                this._input.style.setProperty('--lu-fill', `${p * 100}%`);
                if (this._output)
                    this._output.value = String(this.value);
            }
            sync() { if (this._input) {
                this._input.value = this.str('value', this._input.min);
                this.reflect();
            } }
        }
        return HaloSlider;
    }, { id: 'halo-slider', text: luminous.shared + css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineHaloSlider = defineHaloSlider;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.4.0/dist/widgets/halo-slider.cjs.map