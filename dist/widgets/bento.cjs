'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var kit = require('../chunks/kit-CujTUbPK.cjs');
var uiBlocks = require('../chunks/ui-blocks-DKqRP2UQ.cjs');

function defineBento(tag = 'usa-bento') {
    const ctor = base.defineElement(tag, Base => class Bento extends Base {
        static get observedAttributes() { return ['columns', 'gap', 'collapse', 'stagger']; }
        mount() {
            const tiles = kit.ownChildren(this);
            const root = moments.make('div', 'usa-kit usa-bento');
            const cols = Math.round(Math.min(6, Math.max(2, this.num('columns', 4))));
            root.style.setProperty('--cols', String(cols));
            root.style.setProperty('--gap', `${Math.max(0, this.num('gap', 12))}px`);
            const stagger = Math.max(0, Math.min(300, this.num('stagger', 70)));
            for (const [i, t] of tiles.entries()) {
                const cell = moments.make('div', 'usa-bento-tile');
                cell.style.gridColumn = `span ${Math.round(Math.min(cols, Math.max(1, kit.dataNum(t, 'span', 1))))}`;
                cell.style.gridRow = `span ${Math.round(Math.min(3, Math.max(1, kit.dataNum(t, 'rows', 1))))}`;
                cell.style.setProperty('--i', String(i));
                cell.append(t);
                root.append(cell);
            }
            root.style.setProperty('--stagger', `${stagger}ms`);
            this.append(root);
            const collapse = Math.max(0, this.num('collapse', 560));
            const fit = () => root.toggleAttribute('data-narrow', root.clientWidth < collapse);
            if (typeof ResizeObserver !== 'undefined') {
                const ro = new ResizeObserver(fit);
                ro.observe(root);
                this.onCleanup(() => ro.disconnect());
            }
            fit();
            root.toggleAttribute('data-static', this.reduced);
            let seen = false;
            this.inView((visible) => {
                if (visible && !seen) {
                    seen = true;
                    root.setAttribute('data-in', '');
                }
            }, { threshold: 0.1 });
            this.listen(root, 'pointermove', (e) => {
                const cell = e.target.closest?.('.usa-bento-tile');
                if (!cell || this.reduced)
                    return;
                const r = cell.getBoundingClientRect();
                cell.style.setProperty('--x', `${e.clientX - r.left}px`);
                cell.style.setProperty('--y', `${e.clientY - r.top}px`);
            }, { passive: true });
            this.onCleanup(() => {
                this.append(...tiles);
                root.remove();
            });
        }
    }, { id: 'ui-blocks', text: uiBlocks.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineBento = defineBento;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/widgets/bento.cjs.map