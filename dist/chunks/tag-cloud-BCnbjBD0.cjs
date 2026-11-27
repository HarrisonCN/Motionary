'use strict';

var base = require('./base-DzZEJhQB.cjs');
var moName = require('./mo-name-DR9ysd5S.cjs');
var moments = require('./moments-eoZA2npZ.cjs');
var kit = require('./kit-CujTUbPK.cjs');
var kit12 = require('./kit-12-B4H_NaC_.cjs');
var uiKit12 = require('./ui-kit-12-CLbcSb3N.cjs');

/** The font size (px) for a tag of `weight` (1–10) between `min` and `max` px, on a gentle square-root curve. */
function tagSize(weight, min = 14, max = 40) {
    const w = Math.min(10, Math.max(1, Number.isFinite(weight) ? weight : 1));
    const lo = Math.min(min, max), hi = Math.max(min, max);
    return Math.round(lo + (hi - lo) * Math.sqrt((w - 1) / 9));
}
function defineTagCloud(tag = 'usa-tag-cloud') {
    const ctor = base.defineElement(tag, Base => class TagCloud extends Base {
        static get observedAttributes() { return ['min-size', 'max-size', 'still', 'label']; }
        mount() {
            const kids = kit.ownChildren(this);
            const root = moments.make('div', 'usa-kit usa-tags');
            root.setAttribute('role', 'group');
            root.setAttribute('aria-label', this.str('label', 'Tags'));
            const min = this.num('min-size', 14), max = this.num('max-size', 40);
            const wraps = kids.map((k, i) => {
                const w = kit.dataNum(k, 'weight', 3);
                const span = moments.make('span', 'usa-tags-item');
                span.style.setProperty('--size', `${tagSize(w, min, max)}px`);
                span.style.setProperty('--weight', String(Math.round(400 + Math.min(10, Math.max(1, w)) * 40)));
                span.style.setProperty('--i', String(i));
                span.style.setProperty('--beat', `${(2.6 + kit12.seeded(i, 7) * 2.4).toFixed(2)}s`);
                span.style.setProperty('--lift', `${(2 + kit12.seeded(i, 3) * 4).toFixed(1)}px`);
                span.append(k);
                root.append(span);
                return span;
            });
            root.toggleAttribute('data-still', this.flag('still'));
            root.toggleAttribute('data-static', this.reduced);
            this.append(root);
            let shown = false;
            this.inView((v) => {
                root.toggleAttribute('data-paused', !v);
                if (v && !shown) {
                    shown = true;
                    root.setAttribute('data-in', '');
                }
            });
            this.onCleanup(() => {
                for (const w of wraps)
                    this.append(...Array.from(w.childNodes));
                root.remove();
            });
        }
    }, { id: 'ui-kit-12', text: uiKit12.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineTagCloud = defineTagCloud;
exports.tagSize = tagSize;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/chunks/tag-cloud-BCnbjBD0.cjs.map