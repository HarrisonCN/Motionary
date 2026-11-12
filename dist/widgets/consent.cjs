'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var formCraft = require('../chunks/form-craft-i3CaepYO.cjs');

/** Explicit preference controls. Emits a decision; does not read/write cookies or storage, or activate services. */
function defineConsent(tag = 'usa-consent') {
    const ctor = base.defineElement(tag, Base => class Consent extends Base {
        static get observedAttributes() { return ['label', 'hint', 'analytics', 'marketing', 'disabled', 'name']; }
        get preferences() { return { analytics: this.flag('analytics'), marketing: this.flag('marketing') }; }
        set preferences(value) { this.setFlag('analytics', !!value?.analytics); this.setFlag('marketing', !!value?.marketing); }
        reset() { this.preferences = this._initial ?? { analytics: false, marketing: false }; this._sync?.(); }
        changed() { this._sync?.(); }
        mount() {
            this._initial ?? (this._initial = this.preferences);
            const { root, title, hint } = formCraft.formShell(this, 'Your preferences');
            const inputs = new Map();
            for (const [key, label, note] of [['essential', 'Essential', 'Needed for the requested functionality'], ['analytics', 'Analytics', 'Optional usage measurement'], ['marketing', 'Personalization', 'Optional recommendations']]) {
                const row = formCraft.node('label', 'usa-form-check'), input = formCraft.node('input'), text = formCraft.node('span', '', label);
                input.type = 'checkbox';
                text.append(formCraft.node('small', '', note));
                row.append(input, text);
                root.append(row);
                inputs.set(key, input);
            }
            const bar = formCraft.node('div', 'usa-form-row'), reject = formCraft.node('button', '', 'Essential only'), save = formCraft.node('button', '', 'Save preferences');
            reject.type = save.type = 'button';
            save.dataset.primary = '';
            bar.style.marginTop = '20px';
            bar.append(reject, save);
            root.append(bar, hint);
            const animate = formCraft.formMotion(this);
            const sync = () => { title.textContent = this.str('label', 'Your preferences'); hint.textContent = this.str('hint', 'Nothing is stored until your application handles this choice.'); const p = this.preferences; inputs.forEach((input, key) => { input.checked = key === 'essential' || p[key]; input.disabled = key === 'essential' || this.flag('disabled'); input.name = this.str('name') && key !== 'essential' ? this.str('name') + '-' + key : ''; input.value = 'yes'; }); save.disabled = reject.disabled = this.flag('disabled'); };
            this._sync = sync;
            for (const key of ['analytics', 'marketing'])
                this.listen(inputs.get(key), 'change', () => { if (this.flag('disabled'))
                    return; this.setFlag(key, inputs.get(key).checked); this.emit('change', { ...this.preferences }); });
            this.listen(save, 'click', () => { animate(hint); this.emit('consent', { ...this.preferences }); });
            this.listen(reject, 'click', () => { this.preferences = { analytics: false, marketing: false }; this.emit('consent', { ...this.preferences }); });
            formCraft.formReset(this, () => this.reset());
            this.onCleanup(() => { this._sync = undefined; });
            sync();
        }
    }, { id: 'form-craft', text: formCraft.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineConsent = defineConsent;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.7.0/dist/widgets/consent.cjs.map