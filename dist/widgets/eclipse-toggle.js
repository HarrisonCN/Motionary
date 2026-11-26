import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { m as make } from '../chunks/moments-Cg_NlOYG.js';
import { c as css } from '../chunks/moments-D7dR6K16.js';

function defineEclipseToggle(tag = 'usa-eclipse-toggle') {
    const ctor = defineElement(tag, Base => class EclipseToggle extends Base {
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
            const root = make('button', 'usa-moment usa-eclipse');
            root.type = 'button';
            root.setAttribute('role', 'switch');
            const sky = make('span', 'usa-eclipse-sky');
            sky.setAttribute('aria-hidden', 'true');
            const sun = make('span', 'usa-eclipse-sun');
            for (let i = 0; i < 8; i++) {
                const ray = make('i', 'usa-eclipse-ray');
                ray.style.setProperty('--i', String(i));
                sky.append(ray);
            }
            sky.append(sun, make('span', 'usa-eclipse-moon'));
            const text = make('span', 'usa-eclipse-label');
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
    }, { id: 'moments', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineEclipseToggle };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/widgets/eclipse-toggle.js.map