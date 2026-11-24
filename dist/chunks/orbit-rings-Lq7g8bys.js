import { f as defineElement } from './base-SPDwWyB1.js';
import { d as defineMoName } from './mo-name-DT5wwaGR.js';
import { m as make } from './moments-Cg_NlOYG.js';
import { o as ownChildren, d as dataNum } from './kit-DugHPVcq.js';
import { c as css } from './motion-kit-12-C9izfNaB.js';

/** The starting angle (degrees) of item `i` of `n` on one ring; rings after the first are offset by half a step. */
function orbitAngle(i, n, ring = 1) {
    if (n <= 0)
        return 0;
    const step = 360 / n;
    return Math.round((i * step + (ring % 2 === 0 ? step / 2 : 0)) * 100) / 100;
}
function defineOrbitRings(tag = 'usa-orbit-rings') {
    const ctor = defineElement(tag, Base => class OrbitRings extends Base {
        static get observedAttributes() { return ['radius', 'duration', 'label']; }
        mount() {
            const kids = ownChildren(this);
            if (!kids.length)
                return;
            const center = kids.find((k) => k.hasAttribute('data-center')) || kids[0];
            const others = kids.filter((k) => k !== center);
            const gap = Math.min(200, Math.max(40, this.num('radius', 72)));
            const lap = Math.min(120, Math.max(4, this.num('duration', 24)));
            const root = make('div', 'usa-kit usa-rings');
            const label = this.str('label');
            if (label) {
                root.setAttribute('role', 'group');
                root.setAttribute('aria-label', label);
            }
            const rings = new Map();
            others.forEach((k, i) => {
                const r = Math.min(3, Math.max(1, Math.round(dataNum(k, 'ring', (i % 3) + 1))));
                if (!rings.has(r))
                    rings.set(r, []);
                rings.get(r).push(k);
            });
            const count = Math.max(1, ...rings.keys());
            root.style.setProperty('--box', `${(count * gap + 40) * 2}px`);
            const mid = make('div', 'usa-rings-center');
            mid.append(center);
            for (const [r, items] of [...rings].sort((a, b) => a[0] - b[0])) {
                const orbit = make('div', 'usa-rings-orbit');
                orbit.style.setProperty('--r', `${r * gap}px`);
                orbit.style.setProperty('--lap', `${lap * (1 + (r - 1) * 0.6)}s`);
                orbit.style.setProperty('--dir', r % 2 === 0 ? 'reverse' : 'normal');
                items.forEach((k, i) => {
                    const slot = make('div', 'usa-rings-item');
                    slot.style.setProperty('--a', `${orbitAngle(i, items.length, r)}deg`);
                    slot.append(k);
                    orbit.append(slot);
                });
                root.append(orbit);
            }
            root.append(mid);
            root.toggleAttribute('data-static', this.reduced);
            this.append(root);
            this.inView((v) => root.toggleAttribute('data-paused', !v));
            this.onCleanup(() => { this.append(...kids); root.remove(); });
        }
    }, { id: 'motion-kit-12', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineOrbitRings as d, orbitAngle as o };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/chunks/orbit-rings-Lq7g8bys.js.map