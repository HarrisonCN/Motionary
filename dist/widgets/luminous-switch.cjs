'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var luminous = require('../chunks/luminous-B_-9G2GO.cjs');

var css = ":is(mo-luminous-switch,usa-luminous-switch){--lu-switch-width:var(--mo-switch-width,180px)}.usa-ls-track{position:relative;display:block;width:var(--lu-switch-width);height:calc(var(--lu-switch-width)*.52);padding:6px;border-radius:30px;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:background .65s,box-shadow .65s}.usa-ls-thumb{display:grid;place-items:center;position:relative;box-sizing:border-box;width:48%;height:100%;border-radius:24px;transform:translateX(0);transition:transform .78s cubic-bezier(.22,1.25,.3,1),background .6s;color:var(--lu-fg)}:is(mo-luminous-switch,usa-luminous-switch)[data-on] .usa-ls-thumb{transform:translateX(108%)}.usa-ls-thumb:after{content:\"\";position:absolute;inset:-2px;pointer-events:none;border-radius:inherit;border:2px solid transparent;border-bottom-color:var(--lu-accent);border-inline-start-color:var(--lu-accent);filter:drop-shadow(0 0 4px var(--lu-accent)) drop-shadow(0 0 9px var(--lu-accent));transition:transform .7s}[data-on]>.usa-ls-track .usa-ls-thumb:after{transform:rotate(180deg)}.usa-ls-thumb>.usa-lu-glyph{width:55%;height:65%;filter:drop-shadow(0 0 3px currentColor)}.usa-ls-track:active .usa-ls-thumb{scale:1.04 .94}[dir=rtl] :is(mo-luminous-switch,usa-luminous-switch)[data-on] .usa-ls-thumb,:is(mo-luminous-switch,usa-luminous-switch)[dir=rtl][data-on] .usa-ls-thumb{transform:translateX(-108%)}";

function defineLuminousSwitch(tag = 'usa-luminous-switch') {
    const ctor = base.defineElement(tag, Base => {
        class LuminousSwitch extends Base {
            constructor() {
                super(...arguments);
                this._initial = false;
                this._hadInitial = false;
            }
            static get observedAttributes() { return ['checked', 'disabled', 'label', 'name', 'value', 'target', 'theme']; }
            get checked() { return this.flag('checked'); }
            set checked(value) { this.toggleAttribute('checked', !!value); }
            toggle(force) { this.checked = force ?? !this.checked; }
            changed(name) { if (name === 'checked' || name === 'disabled')
                this.sync(name === 'checked');
            else
                super.changed(name); }
            mount() {
                luminous.luminousTheme(this);
                if (!this._hadInitial) {
                    this._initial = this.checked;
                    this._hadInitial = true;
                }
                this.querySelectorAll(':scope > [data-usa-part]').forEach(n => n.remove());
                const b = document.createElement('button');
                b.type = 'button';
                b.className = 'usa-ls-track usa-lu-surface';
                b.setAttribute('role', 'switch');
                b.setAttribute('data-usa-part', '');
                const thumb = document.createElement('span');
                thumb.className = 'usa-ls-thumb usa-lu-glass';
                this._svg = luminous.glyph(this);
                thumb.append(this._svg);
                b.append(thumb);
                this.prepend(b);
                this._button = b;
                const input = document.createElement('input');
                input.type = 'hidden';
                input.setAttribute('data-usa-part', '');
                this.append(input);
                this._input = input;
                this.sync(false);
                this.listen(b, 'click', () => { if (this.flag('disabled'))
                    return; this.toggle(); this.emit('change', { checked: this.checked, theme: this.checked ? 'light' : 'dark' }); });
                const form = this.closest('form');
                if (form)
                    this.listen(form, 'reset', (e) => { queueMicrotask(() => { if (!e.defaultPrevented && this.isConnected)
                        this.checked = this._initial; }); });
            }
            sync(animate) {
                if (!this._button || !this._svg)
                    return;
                const checked = this.checked;
                this._button.disabled = this.flag('disabled');
                this._button.setAttribute('aria-checked', String(checked));
                this._button.setAttribute('aria-label', this.str('label', 'Light theme'));
                this.toggleAttribute('data-on', checked);
                this.toggleAttribute('data-lu-reduced', this.reduced);
                this.dataset.luTheme = checked ? 'light' : 'dark';
                luminous.morphGlyph(this._svg, checked ? 'sun' : 'moon', animate, this);
                if (this._input) {
                    this._input.name = this.str('name');
                    this._input.value = this.str('value', 'on');
                    this._input.disabled = !checked || this.flag('disabled') || !this._input.name;
                }
                if (this.str('target'))
                    base.queryAttr(this.str('target'))?.setAttribute('data-usa-surface', checked ? 'light' : 'dark');
            }
        }
        return LuminousSwitch;
    }, { id: 'luminous-switch', text: luminous.shared + css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineLuminousSwitch = defineLuminousSwitch;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.6.0/dist/widgets/luminous-switch.cjs.map