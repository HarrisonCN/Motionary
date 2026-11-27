'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments$1 = require('../chunks/moments-eoZA2npZ.cjs');
var moments = require('../chunks/moments-Rge1M2_3.cjs');

function defineEclipseToggle(tag = 'usa-eclipse-toggle') {
    const ctor = base.defineElement(tag, Base => class EclipseToggle extends Base {
        static get observedAttributes() { return ['checked', 'label', 'disabled']; }
        get checked() { return this.flag('checked'); }
        set checked(on) { this.setFlag('checked', !!on); }
        toggle(force) {
            if (this.flag('disabled'))
                return this.checked;
            this.checked = force === undefined ? !this.checked : !!force;
            return this.checked;
        }
        changed() { this._sync?.(); }
        mount() {
            const root = moments$1.make('button', 'usa-moment usa-eclipse');
            root.type = 'button';
            root.setAttribute('role', 'switch');
            const sky = moments$1.make('span', 'usa-eclipse-sky');
            sky.setAttribute('aria-hidden', 'true');
            const sun = moments$1.make('span', 'usa-eclipse-sun');
            for (let i = 0; i < 8; i++) {
                const ray = moments$1.make('i', 'usa-eclipse-ray');
                ray.style.setProperty('--i', String(i));
                sky.append(ray);
            }
            sky.append(sun, moments$1.make('span', 'usa-eclipse-moon'));
            const text = moments$1.make('span', 'usa-eclipse-label');
            root.append(sky, text);
            this.append(root);
            const sync = () => {
                const on = this.checked;
                text.textContent = this.str('label', 'Dark mode');
                root.setAttribute('aria-checked', String(on));
                root.toggleAttribute('data-on', on);
                root.toggleAttribute('data-static', this.reduced);
                root.disabled = this.flag('disabled');
            };
            this._sync = sync;
            this.listen(root, 'click', () => {
                if (this.flag('disabled'))
                    return;
                const checked = this.toggle();
                this.emit('change', { checked });
            });
            this.onCleanup(() => { root.remove(); this._sync = undefined; });
            sync();
        }
    }, { id: 'moments', text: moments.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineEclipseToggle = defineEclipseToggle;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/widgets/eclipse-toggle.cjs.map