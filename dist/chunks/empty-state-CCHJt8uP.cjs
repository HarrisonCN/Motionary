'use strict';

var base = require('./base-DzZEJhQB.cjs');
var moName = require('./mo-name-DR9ysd5S.cjs');
var moments = require('./moments-eoZA2npZ.cjs');
var kit = require('./kit-CujTUbPK.cjs');
var uiBlocks = require('./ui-blocks-DKqRP2UQ.cjs');

const SVG = 'http://www.w3.org/2000/svg';
/** Line drawings for the built-in illustrations (24×24 grid, stroked). */
const EMPTY_ICONS = {
    inbox: ['M3 13l3-8h12l3 8', 'M3 13v6h18v-6', 'M3 13h5l1 3h6l1-3h5'],
    search: ['M10.5 4a6.5 6.5 0 1 0 0 13a6.5 6.5 0 1 0 0-13', 'M15.5 15.5L21 21', 'M8 10.5h5'],
    folder: ['M3 6h6l2 2h10v11H3z', 'M3 10h18'],
    cloud: ['M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 9.5A4.5 4.5 0 0 0 7 18', 'M12 11v5', 'M9.5 13.5L12 11l2.5 2.5'],
    bell: ['M6 16V11a6 6 0 0 1 12 0v5l2 2H4z', 'M10 20a2 2 0 0 0 4 0'],
    cart: ['M3 4h3l2.5 11h10L21 7H7', 'M10 19.5h.01', 'M17 19.5h.01'],
};
function defineEmptyState(tag = 'usa-empty-state') {
    const ctor = base.defineElement(tag, Base => class EmptyState extends Base {
        static get observedAttributes() { return ['icon', 'heading', 'description', 'heading-level', 'compact']; }
        replay() { this._play?.(); }
        mount() {
            const actions = kit.ownChildren(this);
            const root = moments.make('div', 'usa-kit usa-empty');
            root.toggleAttribute('data-compact', this.flag('compact'));
            const art = document.createElementNS(SVG, 'svg');
            art.setAttribute('viewBox', '0 0 24 24');
            art.setAttribute('class', 'usa-empty-art');
            art.setAttribute('aria-hidden', 'true');
            art.setAttribute('focusable', 'false');
            const halo = moments.make('span', 'usa-empty-halo');
            halo.setAttribute('aria-hidden', 'true');
            const paths = (EMPTY_ICONS[this.str('icon')] || EMPTY_ICONS.inbox).map((d) => {
                const p = document.createElementNS(SVG, 'path');
                p.setAttribute('d', d);
                p.setAttribute('pathLength', '1');
                art.append(p);
                return p;
            });
            const figure = moments.make('div', 'usa-empty-figure');
            figure.append(halo, art);
            const level = Math.round(Math.min(6, Math.max(2, this.num('heading-level', 3))));
            const heading = moments.make(`h${level}`, 'usa-empty-heading', this.str('heading', 'Nothing here yet'));
            const desc = moments.make('p', 'usa-empty-desc', this.str('description'));
            desc.hidden = !this.str('description');
            const row = moments.make('div', 'usa-empty-actions');
            row.append(...actions);
            row.hidden = !actions.length;
            root.append(figure, heading, desc, row);
            root.toggleAttribute('data-pending', !this.reduced);
            this.append(root);
            const parts = [heading, desc, row];
            const play = () => {
                root.removeAttribute('data-pending');
                if (this.reduced)
                    return;
                paths.forEach((p, i) => this.motion(p, [{ strokeDashoffset: '1' }, { strokeDashoffset: '0' }], { duration: 700, delay: i * 140, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'both' }));
                this.motion(figure, [{ transform: 'translateY(8px) scale(.94)', opacity: 0 }, { transform: 'translateY(-3px) scale(1.02)', opacity: 1, offset: 0.7 }, { transform: 'none', opacity: 1 }], { duration: 640, easing: 'ease-out', fill: 'both' });
                parts.forEach((el, i) => this.motion(el, [{ transform: 'translateY(10px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 460, delay: 260 + i * 90, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both' }));
            };
            this._play = play;
            let seen = false;
            this.inView((visible) => { if (visible && !seen) {
                seen = true;
                play();
            } }, { threshold: 0.2 });
            this.onCleanup(() => {
                this.append(...actions);
                root.remove();
                this._play = undefined;
            });
        }
    }, { id: 'ui-blocks', text: uiBlocks.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.EMPTY_ICONS = EMPTY_ICONS;
exports.defineEmptyState = defineEmptyState;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/chunks/empty-state-CCHJt8uP.cjs.map