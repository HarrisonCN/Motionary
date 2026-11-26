import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { m as make } from '../chunks/moments-Cg_NlOYG.js';
import { o as ownChildren, c as cleanColor } from '../chunks/kit-DugHPVcq.js';
import { c as css } from '../chunks/motion-kit-12-C9izfNaB.js';

function defineRetroGrid(tag = 'usa-retro-grid') {
    const ctor = defineElement(tag, Base => class RetroGrid extends Base {
        static get observedAttributes() { return ['angle', 'cell', 'color', 'speed', 'sun']; }
        mount() {
            const kids = ownChildren(this);
            const root = make('div', 'usa-kit usa-retro');
            const scene = make('div', 'usa-retro-scene');
            scene.setAttribute('aria-hidden', 'true');
            if (this.flag('sun'))
                scene.append(make('div', 'usa-retro-sun'));
            scene.append(make('div', 'usa-retro-floor'));
            const body = make('div', 'usa-retro-body');
            body.append(...kids);
            root.append(scene, body);
            const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
            root.style.setProperty('--tilt', `${clamp(this.num('angle', 65), 30, 85)}deg`);
            root.style.setProperty('--cell', `${clamp(this.num('cell', 60), 20, 200)}px`);
            root.style.setProperty('--speed', String(clamp(this.num('speed', 1), 0.25, 4)));
            const c = cleanColor(this.str('color'));
            if (c)
                root.style.setProperty('--line', c);
            root.toggleAttribute('data-static', this.reduced);
            this.append(root);
            this.inView((v) => root.toggleAttribute('data-paused', !v));
            this.onCleanup(() => { this.append(...kids); root.remove(); });
        }
    }, { id: 'motion-kit-12', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineRetroGrid };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/widgets/retro-grid.js.map