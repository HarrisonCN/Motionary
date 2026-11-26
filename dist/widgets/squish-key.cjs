'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var tactile$1 = require('../chunks/tactile-Dfg7b_8s.cjs');
var tactile = require('../chunks/tactile-DqlGeBjU.cjs');

function defineSquishKey(tag = 'usa-squish-key') {
    const ctor = base.defineElement(tag, Base => class SquishKey extends Base {
        static get observedAttributes() { return ['label', 'shape', 'tone', 'disabled']; }
        press() {
            if (this.flag('disabled'))
                return;
            this._tap?.();
            this.emit('press');
        }
        changed() { this._sync?.(); }
        mount() {
            const tile = moments.make('span', 'usa-tactile usa-squish');
            const key = moments.make('button', 'usa-squish-key');
            key.type = 'button';
            const glyph = moments.make('span', 'usa-squish-glyph');
            key.append(glyph);
            tile.append(key);
            this.append(tile);
            const press = tactile$1.pressSpring(this, key);
            this._tap = () => tactile$1.tap(press);
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
                    tactile$1.tap(press);
                this.emit('press');
            });
            this.onCleanup(() => { tile.remove(); this._sync = undefined; this._tap = undefined; });
            sync();
        }
    }, { id: 'tactile', text: tactile.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineSquishKey = defineSquishKey;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/widgets/squish-key.cjs.map