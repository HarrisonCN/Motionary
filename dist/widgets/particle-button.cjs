'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var luminous = require('../chunks/luminous-B_-9G2GO.cjs');

var css = ".usa-pb-button{display:flex;align-items:center;gap:12px;min-height:52px;padding:9px 22px 9px 13px;border-radius:19px;background-color:var(--lu-bg);color:var(--lu-fg);cursor:pointer;transition:box-shadow .3s,scale .3s}.usa-pb-button>.usa-lu-glyph{width:34px;height:34px;flex:none}.usa-pb-button:hover{box-shadow:inset 0 1px 2px #fff5,0 0 26px color-mix(in srgb,var(--lu-accent) 50%,transparent)}.usa-pb-button:active{scale:.96}:is(mo-particle-button,usa-particle-button)[pressed]:not([pressed=false]) .usa-pb-button{border-color:var(--lu-accent)}";

function defineParticleButton(tag = 'usa-particle-button') {
    const ctor = base.defineElement(tag, Base => {
        class ParticleButton extends Base {
            static get observedAttributes() { return ['label', 'icon', 'active-icon', 'toggle', 'pressed', 'disabled', 'theme']; }
            get pressed() { return this.flag('pressed'); }
            set pressed(v) { this.toggleAttribute('pressed', !!v); }
            changed(name) { if (name === 'pressed' || name === 'disabled')
                this.sync(true);
            else
                super.changed(name); }
            activate() {
                if (this.flag('disabled'))
                    return;
                if (this.flag('toggle'))
                    this.pressed = !this.pressed;
                else
                    this.sync(true);
                this.emit('activate', { pressed: this.pressed });
            }
            mount() {
                luminous.luminousTheme(this);
                this.querySelectorAll(':scope > [data-usa-part]').forEach(n => n.remove());
                const b = document.createElement('button');
                b.type = 'button';
                b.className = 'usa-pb-button usa-lu-glass';
                b.setAttribute('data-usa-part', '');
                this._svg = luminous.glyph(this);
                b.append(this._svg);
                const text = document.createElement('span');
                text.textContent = this.str('label', 'Activate');
                b.append(text);
                this._button = b;
                this.prepend(b);
                this.sync(false);
                this.listen(b, 'click', () => this.activate());
            }
            sync(animate) {
                if (!this._button || !this._svg)
                    return;
                this._button.disabled = this.flag('disabled');
                if (this.flag('toggle'))
                    this._button.setAttribute('aria-pressed', String(this.pressed));
                else
                    this._button.removeAttribute('aria-pressed');
                this.toggleAttribute('data-lu-reduced', this.reduced);
                luminous.morphGlyph(this._svg, this.pressed ? this.str('active-icon', 'check') : this.str('icon', 'spark'), animate, this);
            }
        }
        return ParticleButton;
    }, { id: 'particle-button', text: luminous.shared + css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineParticleButton = defineParticleButton;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.6.0/dist/widgets/particle-button.cjs.map