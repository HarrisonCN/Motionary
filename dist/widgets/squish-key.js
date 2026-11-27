import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { m as make } from '../chunks/moments-Cg_NlOYG.js';
import { p as pressSpring, t as tap } from '../chunks/tactile-BYcJBRbl.js';
import { c as css } from '../chunks/tactile-CJEqqRov.js';

function defineSquishKey(tag = 'usa-squish-key') {
    const ctor = defineElement(tag, Base => class SquishKey extends Base {
        static get observedAttributes() { return ['label', 'shape', 'tone', 'disabled']; }
        press() {
            if (this.flag('disabled'))
                return;
            this._tap?.();
            this.emit('press');
        }
        changed() { this._sync?.(); }
        mount() {
            const tile = make('span', 'usa-tactile usa-squish');
            const key = make('button', 'usa-squish-key');
            key.type = 'button';
            const glyph = make('span', 'usa-squish-glyph');
            key.append(glyph);
            tile.append(key);
            this.append(tile);
            const press = pressSpring(this, key);
            this._tap = () => tap(press);
            const sync = () => {
                glyph.textContent = this.str('label', 'A');
                const shape = this.str('shape', 'square');
                tile.dataset.shape = shape === 'round' || shape === 'pill' ? shape : 'square';
                tile.dataset.tone = this.str('tone') === 'light' ? 'light' : 'dark';
                key.disabled = this.flag('disabled');
                tile.toggleAttribute('data-static', this.reduced);
            };
            this._sync = sync;
            this.listen(key, 'click', (e) => {
                if (e.detail === 0)
                    tap(press);
                this.emit('press');
            });
            this.onCleanup(() => { tile.remove(); this._sync = undefined; this._tap = undefined; });
            sync();
        }
    }, { id: 'tactile', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineSquishKey };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/widgets/squish-key.js.map