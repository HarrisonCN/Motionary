import { f as defineElement } from './base-SPDwWyB1.js';
import { d as defineMoName } from './mo-name-DT5wwaGR.js';
import { m as make, u as uniqueId } from './moments-Cg_NlOYG.js';
import { c as cleanColor } from './kit-DugHPVcq.js';
import { c as css } from './motion-kit-13-BNuKjO2V.js';

/** An SVG path for a full circle of radius `r` centred at (cx, cy), starting at the top and going clockwise. */
function circlePath(r, cx = 50, cy = 50) {
    return `M${cx},${cy - r}a${r},${r} 0 1,1 0,${2 * r}a${r},${r} 0 1,1 0,${ -2 * r}`;
}
function defineCircularText(tag = 'usa-circular-text') {
    const ctor = defineElement(tag, Base => class CircularText extends Base {
        static get observedAttributes() { return ['text', 'separator', 'duration', 'direction', 'hover', 'size', 'color']; }
        mount() {
            const kids = Array.from(this.childNodes).filter((n) => !(n instanceof HTMLElement && n.classList.contains('usa-kit')));
            const text = this.str('text', 'Motionary').trim() || 'Motionary';
            const sep = this.str('separator', ' • ');
            const size = Math.max(60, Math.min(480, this.num('size', 140)));
            const root = make('div', 'usa-kit usa-ctext');
            root.style.setProperty('--size', `${size}px`);
            root.style.setProperty('--dur', `${Math.max(2, Math.min(120, this.num('duration', 16)))}s`);
            root.dataset.dir = this.str('direction') === 'ccw' ? 'ccw' : 'cw';
            const hover = this.str('hover', 'slow');
            root.dataset.hover = ['slow', 'fast', 'reverse', 'pause', 'none'].includes(hover) ? hover : 'slow';
            const c = cleanColor(this.str('color'));
            if (c)
                root.style.setProperty('--ctext', c);
            root.toggleAttribute('data-static', this.reduced);
            const ns = 'http://www.w3.org/2000/svg';
            const svg = document.createElementNS(ns, 'svg');
            svg.setAttribute('viewBox', '0 0 100 100');
            svg.setAttribute('aria-hidden', 'true');
            svg.setAttribute('class', 'usa-ctext-ring');
            const id = uniqueId('usa-ctext');
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
            const sr = make('span', 'usa-kit-sr', text);
            const mid = make('div', 'usa-ctext-mid');
            mid.append(...kids);
            root.append(svg, mid, sr);
            this.append(root);
            this.inView((v) => root.toggleAttribute('data-paused', !v));
            this.onCleanup(() => { this.append(...kids); root.remove(); });
        }
    }, { id: 'motion-kit-13', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { circlePath as c, defineCircularText as d };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/chunks/circular-text-BIhr_SxX.js.map