'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var kit = require('../chunks/kit-CujTUbPK.cjs');
var motionKit12 = require('../chunks/motion-kit-12-MnOftQWG.cjs');

function defineRetroGrid(tag = 'usa-retro-grid') {
    const ctor = base.defineElement(tag, Base => class RetroGrid extends Base {
        static get observedAttributes() { return ['angle', 'cell', 'color', 'speed', 'sun']; }
        mount() {
            const kids = kit.ownChildren(this);
            const root = moments.make('div', 'usa-kit usa-retro');
            const scene = moments.make('div', 'usa-retro-scene');
            scene.setAttribute('aria-hidden', 'true');
            if (this.flag('sun'))
                scene.append(moments.make('div', 'usa-retro-sun'));
            scene.append(moments.make('div', 'usa-retro-floor'));
            const body = moments.make('div', 'usa-retro-body');
            body.append(...kids);
            root.append(scene, body);
            const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
            root.style.setProperty('--tilt', `${clamp(this.num('angle', 65), 30, 85)}deg`);
            root.style.setProperty('--cell', `${clamp(this.num('cell', 60), 20, 200)}px`);
            root.style.setProperty('--speed', String(clamp(this.num('speed', 1), 0.25, 4)));
            const c = kit.cleanColor(this.str('color'));
            if (c)
                root.style.setProperty('--line', c);
            root.toggleAttribute('data-static', this.reduced);
            this.append(root);
            this.inView((v) => root.toggleAttribute('data-paused', !v));
            this.onCleanup(() => { this.append(...kids); root.remove(); });
        }
    }, { id: 'motion-kit-12', text: motionKit12.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineRetroGrid = defineRetroGrid;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/widgets/retro-grid.cjs.map