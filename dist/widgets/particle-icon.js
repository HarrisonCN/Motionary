import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { s as shared, l as luminousTheme, g as glyph, m as morphGlyph } from '../chunks/luminous-iQ0lxR6o.js';

function defineParticleIcon(tag = 'usa-particle-icon') {
    const ctor = defineElement(tag, Base => {
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
                luminousTheme(this);
                this.querySelectorAll(':scope > [data-usa-part]').forEach(n => n.remove());
                this._svg = glyph(this);
                this._svg.setAttribute('data-usa-part', '');
                this.append(this._svg);
                this.sync(false);
            }
            sync(animate) {
                this.setAttribute('role', 'img');
                this.setAttribute('aria-label', this.str('label', this.icon));
                this.setAttribute('aria-hidden', String(this.flag('decorative')));
                if (this._svg)
                    morphGlyph(this._svg, this.icon, animate, this);
            }
        }
        return ParticleIcon;
    }, { id: 'particle-icon', text: shared + ':is(mo-particle-icon,usa-particle-icon){width:var(--mo-icon-size,56px);height:var(--mo-icon-size,56px);vertical-align:middle}' });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineParticleIcon };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.7.0/dist/widgets/particle-icon.js.map