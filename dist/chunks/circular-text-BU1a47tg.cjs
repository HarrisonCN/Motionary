'use strict';

var base = require('./base-DzZEJhQB.cjs');
var moName = require('./mo-name-DR9ysd5S.cjs');
var moments = require('./moments-eoZA2npZ.cjs');
var kit = require('./kit-CujTUbPK.cjs');
var motionKit13 = require('./motion-kit-13-CQF_2Unb.cjs');

/** An SVG path for a full circle of radius `r` centred at (cx, cy), starting at the top and going clockwise. */
function circlePath(r, cx = 50, cy = 50) {
    return `M${cx},${cy - r}a${r},${r} 0 1,1 0,${2 * r}a${r},${r} 0 1,1 0,${ -2 * r}`;
}
function defineCircularText(tag = 'usa-circular-text') {
    const ctor = base.defineElement(tag, Base => class CircularText extends Base {
        static get observedAttributes() { return ['text', 'separator', 'duration', 'direction', 'hover', 'size', 'color']; }
        mount() {
            const kids = Array.from(this.childNodes).filter((n) => !(n instanceof HTMLElement && n.classList.contains('usa-kit')));
            const text = this.str('text', 'Motionary').trim() || 'Motionary';
            const sep = this.str('separator', ' • ');
            const size = Math.max(60, Math.min(480, this.num('size', 140)));
            const root = moments.make('div', 'usa-kit usa-ctext');
            root.style.setProperty('--size', `${size}px`);
            root.style.setProperty('--dur', `${Math.max(2, Math.min(120, this.num('duration', 16)))}s`);
            root.dataset.dir = this.str('direction') === 'ccw' ? 'ccw' : 'cw';
            const hover = this.str('hover', 'slow');
            root.dataset.hover = ['slow', 'fast', 'reverse', 'pause', 'none'].includes(hover) ? hover : 'slow';
            const c = kit.cleanColor(this.str('color'));
            if (c)
                root.style.setProperty('--ctext', c);
            root.toggleAttribute('data-static', this.reduced);
            const ns = 'http://www.w3.org/2000/svg';
            const svg = document.createElementNS(ns, 'svg');
            svg.setAttribute('viewBox', '0 0 100 100');
            svg.setAttribute('aria-hidden', 'true');
            svg.setAttribute('class', 'usa-ctext-ring');
            const id = moments.uniqueId('usa-ctext');
            const path = document.createElementNS(ns, 'path');
            path.setAttribute('id', id);
            path.setAttribute('d', circlePath(40));
            path.setAttribute('fill', 'none');
            const t = document.createElementNS(ns, 'text');
            const tp = document.createElementNS(ns, 'textPath');
            tp.setAttribute('href', `#${id}`);
            tp.setAttribute('textLength', String(Math.round(2 * Math.PI * 40 - 1)));
            tp.setAttribute('lengthAdjust', 'spacing');
            // repeat the phrase until it is long enough to go round without huge gaps
            const unit = text + sep;
            const reps = Math.max(1, Math.min(8, Math.round(40 / Math.max(4, unit.length))));
            tp.textContent = unit.repeat(reps);
            t.append(tp);
            svg.append(path, t);
            const sr = moments.make('span', 'usa-kit-sr', text);
            const mid = moments.make('div', 'usa-ctext-mid');
            mid.append(...kids);
            root.append(svg, mid, sr);
            this.append(root);
            this.inView((v) => root.toggleAttribute('data-paused', !v));
            this.onCleanup(() => { this.append(...kids); root.remove(); });
        }
    }, { id: 'motion-kit-13', text: motionKit13.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.circlePath = circlePath;
exports.defineCircularText = defineCircularText;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/chunks/circular-text-BU1a47tg.cjs.map