'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var luminous = require('../chunks/luminous-B_-9G2GO.cjs');

function defineParticleIcon(tag = 'usa-particle-icon') {
    const ctor = base.defineElement(tag, Base => {
        class ParticleIcon extends Base {
            static get observedAttributes() { return ['icon', 'label', 'decorative', 'theme']; }
            get icon() { return this.str('icon', 'moon'); }
            set icon(v) { this.setAttribute('icon', v); }
            morph(name) { this.icon = name; }
            changed(name) { if (name === 'icon')
                this.sync(true);
            else
                super.changed(name); }
            mount() {
                luminous.luminousTheme(this);
                this.querySelectorAll(':scope > [data-usa-part]').forEach(n => n.remove());
                this._svg = luminous.glyph(this);
                this._svg.setAttribute('data-usa-part', '');
                this.append(this._svg);
                this.sync(false);
            }
            sync(animate) {
                this.setAttribute('role', 'img');
                this.setAttribute('aria-label', this.str('label', this.icon));
                this.setAttribute('aria-hidden', String(this.flag('decorative')));
                if (this._svg)
                    luminous.morphGlyph(this._svg, this.icon, animate, this);
            }
        }
        return ParticleIcon;
    }, { id: 'particle-icon', text: luminous.shared + ':is(mo-particle-icon,usa-particle-icon){width:var(--mo-icon-size,56px);height:var(--mo-icon-size,56px);vertical-align:middle}' });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineParticleIcon = defineParticleIcon;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.7.0/dist/widgets/particle-icon.cjs.map