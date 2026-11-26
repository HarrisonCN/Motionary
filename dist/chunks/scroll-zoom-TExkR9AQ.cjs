'use strict';

var base = require('./base-DzZEJhQB.cjs');
var moName = require('./mo-name-DR9ysd5S.cjs');
var moments = require('./moments-eoZA2npZ.cjs');
var kit = require('./kit-CujTUbPK.cjs');
var motionKit = require('./motion-kit-Bl78eN_4.cjs');

/** Scale, corner radius (px) and caption opacity at scroll `progress` (0–1), growing from `from` to full size by 0.7. */
function zoomAt(progress, from = 0.45, radius = 28) {
    const p = Math.min(1, Math.max(0, progress));
    const t = Math.min(1, p / 0.7);
    const e = 1 - Math.pow(1 - t, 3);
    const f = Math.min(1, Math.max(0.05, from));
    return { scale: Math.round((f + (1 - f) * e) * 10000) / 10000, radius: Math.round(radius * (1 - e) * 100) / 100, caption: Math.round(Math.max(0, (p - 0.7) / 0.3) * 1000) / 1000 };
}
function defineScrollZoom(tag = 'usa-scroll-zoom') {
    const ctor = base.defineElement(tag, Base => class ScrollZoom extends Base {
        constructor() {
            super(...arguments);
            this._p = 0;
        }
        static get observedAttributes() { return ['from', 'radius', 'length', 'min-width', 'label']; }
        get progress() { return this._p; }
        mount() {
            const kids = kit.ownChildren(this);
            if (!kids.length)
                return;
            const root = moments.make('section', 'usa-kit usa-szoom');
            const label = this.str('label');
            if (label)
                root.setAttribute('aria-label', label);
            const pin = moments.make('div', 'usa-szoom-pin');
            const media = moments.make('div', 'usa-szoom-media');
            media.append(kids[0]);
            pin.append(media);
            if (kids.length > 1) {
                const cap = moments.make('div', 'usa-szoom-caption');
                cap.append(...kids.slice(1));
                pin.append(cap);
            }
            root.append(pin);
            root.style.setProperty('--len', this.str('length', '250vh'));
            this.append(root);
            const from = this.num('from', 0.45), radius = Math.max(0, this.num('radius', 28)), minW = Math.max(0, this.num('min-width', 640));
            let pinned = false, pending = 0, quarter = -1;
            const update = () => {
                pending = 0;
                if (!pinned)
                    return;
                const r = root.getBoundingClientRect();
                const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - window.innerHeight)));
                this._p = p;
                const z = zoomAt(p, from, radius);
                media.style.setProperty('--s', String(z.scale));
                media.style.setProperty('--r', `${z.radius / Math.max(0.05, z.scale)}px`);
                root.style.setProperty('--c', String(z.caption));
                const q = Math.floor(p * 4 + 1e-6);
                if (q !== quarter) {
                    quarter = q;
                    this.emit('progress', { progress: q / 4 });
                }
            };
            const layout = () => {
                const sticky = typeof CSS === 'undefined' || !CSS.supports || CSS.supports('position', 'sticky');
                pinned = !this.reduced && sticky && window.innerWidth >= minW;
                root.toggleAttribute('data-pinned', pinned);
                if (!pinned) {
                    media.style.removeProperty('--s');
                    media.style.removeProperty('--r');
                    root.style.removeProperty('--c');
                    this._p = 1;
                    return;
                }
                update();
            };
            const queue = () => { if (pinned && !pending)
                pending = base.raf(update, this); };
            this.listen(window, 'scroll', queue, { passive: true });
            this.listen(window, 'resize', layout, { passive: true });
            this.onCleanup(() => {
                if (pending)
                    base.caf(pending);
                this.append(...kids);
                root.remove();
                this._p = 0;
            });
            layout();
        }
    }, { id: 'motion-kit', text: motionKit.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineScrollZoom = defineScrollZoom;
exports.zoomAt = zoomAt;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/chunks/scroll-zoom-TExkR9AQ.cjs.map