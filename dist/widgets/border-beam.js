import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { m as make } from '../chunks/moments-Cg_NlOYG.js';
import { o as ownChildren, c as cleanColor } from '../chunks/kit-DugHPVcq.js';
import { c as css } from '../chunks/motion-kit-CFZmE2br.js';

function defineBorderBeam(tag = 'usa-border-beam') {
    const ctor = defineElement(tag, Base => class BorderBeam extends Base {
        static get observedAttributes() { return ['duration', 'colors', 'length', 'width', 'radius', 'glow', 'reverse']; }
        mount() {
            const kids = ownChildren(this);
            const root = make('div', 'usa-kit usa-beam');
            root.append(...kids);
            this.append(root);
            const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
            root.style.setProperty('--dur', `${clamp(this.num('duration', 6), 1, 60)}s`);
            root.style.setProperty('--len', `${clamp(this.num('length', 70), 20, 300)}deg`);
            root.style.setProperty('--bw', `${clamp(this.num('width', 2), 1, 8)}px`);
            root.style.setProperty('--radius', `${clamp(this.num('radius', 18), 0, 200)}px`);
            if (this.flag('reverse'))
                root.style.setProperty('--dir', 'reverse');
            const [c1, c2] = this.str('colors').split(',').map((s) => cleanColor(s));
            if (c1)
                root.style.setProperty('--c1', c1);
            if (c2)
                root.style.setProperty('--c2', c2);
            root.toggleAttribute('data-glow', this.flag('glow'));
            const animated = typeof CSS !== 'undefined' && 'registerProperty' in CSS;
            root.toggleAttribute('data-static', this.reduced || !animated);
            this.inView((v) => root.toggleAttribute('data-paused', !v));
            this.onCleanup(() => {
                this.append(...kids);
                root.remove();
            });
        }
    }, { id: 'motion-kit', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineBorderBeam };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/widgets/border-beam.js.map