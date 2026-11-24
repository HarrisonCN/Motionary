import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { c as css, m as mountLoader } from '../chunks/loaders-GsGWzSqf.js';

const SVG = 'http://www.w3.org/2000/svg';
/** The figure-eight drawing: a faint track and a moving dash on the same path. */
function figure() {
    const svg = document.createElementNS(SVG, 'svg');
    svg.setAttribute('viewBox', '0 0 64 32');
    svg.classList.add('usa-loader-svg');
    const d = 'M32 16c-6-8-10-11-16-11a11 11 0 0 0 0 22c6 0 10-3 16-11s10-11 16-11a11 11 0 0 1 0 22c-6 0-10-3-16-11z';
    for (const cls of ['usa-loader-track', 'usa-loader-run']) {
        const p = document.createElementNS(SVG, 'path');
        p.setAttribute('d', d);
        p.setAttribute('pathLength', '100');
        p.classList.add(cls);
        svg.append(p);
    }
    return svg;
}
function defineInfinityLoop(tag = 'usa-infinity-loop') {
    const ctor = defineElement(tag, Base => class InfinityLoop extends Base {
        static get observedAttributes() { return ['label', 'paused', 'duration']; }
        get paused() { return this.flag('paused'); }
        set paused(on) { this.setFlag('paused', !!on); }
        changed() { this._sync?.(); }
        mount() {
            this._sync = mountLoader(this, { kind: 'infinity', parts: 0, lap: 1600, extra: figure });
            this.onCleanup(() => { this._sync = undefined; });
        }
    }, { id: 'moment-loaders', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineInfinityLoop };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/widgets/infinity-loop.js.map