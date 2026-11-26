'use strict';

var base = require('./base-DzZEJhQB.cjs');
var moName = require('./mo-name-DR9ysd5S.cjs');
var moments = require('./moments-eoZA2npZ.cjs');
var kit = require('./kit-CujTUbPK.cjs');
var kit12 = require('./kit-12-B4H_NaC_.cjs');
var motionKit12 = require('./motion-kit-12-MnOftQWG.cjs');

/** Start position (% of the box), delay (s), duration (s) and tail length (px) of meteor `i`, the same on every load. */
function meteorAt(i) {
    return {
        left: Math.round(kit12.seeded(i, 1) * 1200) / 10 - 10,
        top: Math.round(kit12.seeded(i, 2) * 400) / 10 - 20,
        delay: Math.round(kit12.seeded(i, 3) * 80) / 10,
        duration: Math.round((2.2 + kit12.seeded(i, 4) * 3.6) * 10) / 10,
        tail: Math.round(50 + kit12.seeded(i, 5) * 90),
    };
}
function defineMeteors(tag = 'usa-meteors') {
    const ctor = base.defineElement(tag, Base => class Meteors extends Base {
        static get observedAttributes() { return ['count', 'angle', 'color', 'speed']; }
        mount() {
            const kids = kit.ownChildren(this);
            const root = moments.make('div', 'usa-kit usa-meteors');
            const sky = moments.make('div', 'usa-meteors-sky');
            sky.setAttribute('aria-hidden', 'true');
            const n = Math.min(60, Math.max(1, Math.round(this.num('count', 18))));
            if (!this.reduced) {
                for (let i = 0; i < n; i++) {
                    const m = meteorAt(i);
                    const s = moments.make('span', 'usa-meteor');
                    s.style.cssText = `left:${m.left}%;top:${m.top}%;--delay:${m.delay}s;--dur:${m.duration}s;--tail:${m.tail}px`;
                    sky.append(s);
                }
            }
            const body = moments.make('div', 'usa-meteors-body');
            body.append(...kids);
            root.append(sky, body);
            root.style.setProperty('--angle', `${this.num('angle', 215)}deg`);
            root.style.setProperty('--speed', String(Math.min(4, Math.max(0.25, this.num('speed', 1)))));
            const c = kit.cleanColor(this.str('color'));
            if (c)
                root.style.setProperty('--meteor', c);
            root.toggleAttribute('data-static', this.reduced);
            this.append(root);
            this.inView((v) => root.toggleAttribute('data-paused', !v));
            this.onCleanup(() => { this.append(...kids); root.remove(); });
        }
    }, { id: 'motion-kit-12', text: motionKit12.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineMeteors = defineMeteors;
exports.meteorAt = meteorAt;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/chunks/meteors-9gvhAzs7.cjs.map