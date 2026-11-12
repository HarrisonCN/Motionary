import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { s as shared, l as luminousTheme } from '../chunks/luminous-iQ0lxR6o.js';

var css = ":is(mo-halo-segmented,usa-halo-segmented){max-width:100%;width:var(--mo-segment-width,320px)}.usa-hs-track{position:relative;display:flex;padding:4px;border-radius:20px;min-height:54px}.usa-hs-track>button{z-index:1;flex:1;min-width:0;padding:10px 5px;border:0;border-radius:16px;background:transparent;color:inherit;cursor:pointer;overflow:hidden;text-overflow:ellipsis;font-size:14px}.usa-hs-pill{position:absolute;box-sizing:border-box;top:4px;bottom:4px;border-radius:16px;border-bottom:2px solid var(--lu-accent);transition:inset-inline-start .65s cubic-bezier(.22,1.2,.3,1),width .35s}.usa-hs-track>button[aria-checked=false]{opacity:.6}";

function defineHaloSegmented(tag = 'usa-halo-segmented') {
    const ctor = defineElement(tag, Base => {
        class HaloSegmented extends Base {
            constructor() {
                super(...arguments);
                this._items = [];
                this._reflecting = false;
            }
            static get observedAttributes() { return ['options', 'value', 'label', 'disabled', 'theme']; }
            get value() { return this.str('value'); }
            set value(v) { this.setAttribute('value', v); }
            changed(name) { if (!this._reflecting) {
                if (name === 'value' || name === 'disabled')
                    this.sync();
                else
                    super.changed(name);
            } }
            mount() {
                luminousTheme(this);
                this.querySelectorAll(':scope > [data-usa-part]').forEach(n => n.remove());
                this.setAttribute('role', 'radiogroup');
                this.setAttribute('aria-label', this.str('label', 'Mode'));
                const track = document.createElement('span');
                track.className = 'usa-hs-track usa-lu-surface';
                track.setAttribute('data-usa-part', '');
                const pill = document.createElement('span');
                pill.className = 'usa-hs-pill usa-lu-glass';
                pill.setAttribute('aria-hidden', 'true');
                track.append(pill);
                this._pill = pill;
                const options = [...new Set(this.str('options', 'Studio,Gallery,Export').split(',').map(s => s.trim()).filter(Boolean))].slice(0, 12);
                if (!options.length)
                    options.push('Studio');
                this._items = options.map(value => {
                    const b = document.createElement('button');
                    b.type = 'button';
                    b.setAttribute('role', 'radio');
                    b.textContent = value;
                    b.dataset.value = value;
                    track.append(b);
                    this.listen(b, 'click', () => this.select(value, true));
                    return b;
                });
                this.append(track);
                this.sync();
                this.listen(track, 'keydown', (e) => {
                    if (this.flag('disabled'))
                        return;
                    const i = this._items.findIndex(b => b.dataset.value === this.value), rtl = getComputedStyle(this).direction === 'rtl';
                    const d = e.key === 'ArrowRight' ? (rtl ? -1 : 1) : e.key === 'ArrowLeft' ? (rtl ? 1 : -1) : e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;
                    const n = e.key === 'Home' ? 0 : e.key === 'End' ? this._items.length - 1 : d ? (i + d + this._items.length) % this._items.length : -1;
                    if (n < 0)
                        return;
                    e.preventDefault();
                    this.select(this._items[n].dataset.value, true);
                    this._items[n].focus();
                });
            }
            select(v, user) {
                if (this.flag('disabled') || v === this.value)
                    return;
                this.value = v;
                if (user)
                    this.emit('change', { value: this.value, index: this._items.findIndex(b => b.dataset.value === this.value) });
            }
            sync() {
                if (!this._items.length)
                    return;
                let i = this._items.findIndex(b => b.dataset.value === this.value);
                if (i < 0)
                    i = 0;
                this._reflecting = true;
                this.value = this._items[i].dataset.value;
                this._reflecting = false;
                this.toggleAttribute('data-lu-reduced', this.reduced);
                this.setAttribute('aria-disabled', String(this.flag('disabled')));
                this._items.forEach((b, n) => { b.disabled = this.flag('disabled'); b.tabIndex = n === i ? 0 : -1; b.setAttribute('aria-checked', String(n === i)); });
                if (this._pill) {
                    this._pill.style.width = `calc((100% - 8px) / ${this._items.length})`;
                    this._pill.style.insetInlineStart = `calc(4px + (100% - 8px) * ${i} / ${this._items.length})`;
                }
            }
        }
        return HaloSegmented;
    }, { id: 'halo-segmented', text: shared + css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineHaloSegmented };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.6.0/dist/widgets/halo-segmented.js.map