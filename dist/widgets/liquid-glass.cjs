'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var kit = require('../chunks/kit-CujTUbPK.cjs');
var motionSurfaces = require('../chunks/motion-surfaces-BSXtpQ2Z.cjs');

const SVG = 'http://www.w3.org/2000/svg';
function defineLiquidGlass(tag = 'usa-liquid-glass') {
    const ctor = base.defineElement(tag, Base => class LiquidGlass extends Base {
        static get observedAttributes() { return ['strength', 'blur', 'tint', 'radius', 'pressable']; }
        mount() {
            const kids = kit.ownChildren(this);
            const root = moments.make('div', 'usa-kit usa-glass');
            const id = moments.uniqueId('usa-glass');
            const strength = Math.min(100, Math.max(0, this.num('strength', 40)));
            // a displacement map made from soft noise: the backdrop is pushed around most near the rim
            const svg = document.createElementNS(SVG, 'svg');
            svg.setAttribute('class', 'usa-glass-defs');
            svg.setAttribute('aria-hidden', 'true');
            svg.setAttribute('width', '0');
            svg.setAttribute('height', '0');
            const filter = document.createElementNS(SVG, 'filter');
            filter.id = id;
            filter.setAttribute('x', '-10%');
            filter.setAttribute('y', '-10%');
            filter.setAttribute('width', '120%');
            filter.setAttribute('height', '120%');
            filter.setAttribute('color-interpolation-filters', 'sRGB');
            const noise = document.createElementNS(SVG, 'feTurbulence');
            noise.setAttribute('type', 'fractalNoise');
            noise.setAttribute('baseFrequency', '0.008 0.012');
            noise.setAttribute('numOctaves', '2');
            noise.setAttribute('seed', '7');
            noise.setAttribute('result', 'n');
            const blur = document.createElementNS(SVG, 'feGaussianBlur');
            blur.setAttribute('in', 'n');
            blur.setAttribute('stdDeviation', '2');
            blur.setAttribute('result', 'm');
            const disp = document.createElementNS(SVG, 'feDisplacementMap');
            disp.setAttribute('in', 'SourceGraphic');
            disp.setAttribute('in2', 'm');
            disp.setAttribute('scale', String(Math.round(strength * 0.9)));
            disp.setAttribute('xChannelSelector', 'R');
            disp.setAttribute('yChannelSelector', 'G');
            filter.append(noise, blur, disp);
            svg.append(filter);
            const sheen = moments.make('span', 'usa-glass-sheen');
            sheen.setAttribute('aria-hidden', 'true');
            const body = moments.make('div', 'usa-glass-body');
            body.append(...kids);
            root.append(svg, sheen, body);
            root.style.setProperty('--blur', `${Math.min(40, Math.max(0, this.num('blur', 14)))}px`);
            root.style.setProperty('--radius', `${Math.max(0, this.num('radius', 24))}px`);
            if (this.str('tint'))
                root.style.setProperty('--tint', this.str('tint'));
            // Chromium can run a backdrop through an SVG filter; others keep the frosted look
            const svgBackdrop = typeof CSS !== 'undefined' && !!CSS.supports?.('backdrop-filter', `url(#${id}) blur(1px)`) && /Chrome\//.test(navigator.userAgent) && strength > 0;
            if (svgBackdrop)
                root.style.setProperty('--refract', `url(#${id})`);
            root.toggleAttribute('data-refract', svgBackdrop);
            root.toggleAttribute('data-pressable', this.flag('pressable'));
            root.toggleAttribute('data-static', this.reduced);
            this.append(root);
            this.listen(root, 'pointermove', (e) => {
                if (this.reduced)
                    return;
                const r = root.getBoundingClientRect();
                root.style.setProperty('--x', `${(((e.clientX - r.left) / Math.max(1, r.width)) * 100).toFixed(1)}%`);
                root.style.setProperty('--y', `${(((e.clientY - r.top) / Math.max(1, r.height)) * 100).toFixed(1)}%`);
            }, { passive: true });
            this.listen(root, 'pointerleave', () => { root.style.removeProperty('--x'); root.style.removeProperty('--y'); });
            if (this.flag('pressable')) {
                this.listen(root, 'pointerdown', () => root.setAttribute('data-pressed', ''));
                const up = () => root.removeAttribute('data-pressed');
                this.listen(window, 'pointerup', up);
                this.listen(window, 'pointercancel', up);
            }
            this.onCleanup(() => {
                this.append(...kids);
                root.remove();
            });
        }
    }, { id: 'motion-surfaces', text: motionSurfaces.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineLiquidGlass = defineLiquidGlass;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/widgets/liquid-glass.cjs.map