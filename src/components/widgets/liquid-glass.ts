import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make, uniqueId } from './moments';
import { ownChildren } from './kit';
import css from './motion-surfaces.css?raw';

const SVG = 'http://www.w3.org/2000/svg';

/**
 * A liquid-glass surface: the backdrop is blurred, brightened and — where the browser can filter a backdrop through
 * SVG — bent at the edges like thick glass. A specular highlight follows the pointer, the rim catches light, and a
 * press squashes the pane a little before it springs back. The element's own children sit on the glass. Without
 * backdrop filters it falls back to a frosted tint; under reduced motion the highlight stays put.
 *
 * Attributes: `strength` (refraction, 0–100; 40), `blur` (px, 0–40; 14), `tint` (CSS colour; a faint white),
 * `radius` (px; 24), `pressable` (the squash on press).
 */
export type UsaLiquidGlassElement = UsaElement;

export function defineLiquidGlass(tag = 'usa-liquid-glass'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class LiquidGlass extends Base {
    static get observedAttributes(): string[] { return ['strength', 'blur', 'tint', 'radius', 'pressable']; }
    mount(): void {
      const kids = ownChildren(this);
      const root = make('div', 'usa-kit usa-glass');
      const id = uniqueId('usa-glass');
      const strength = Math.min(100, Math.max(0, this.num('strength', 40)));
      // a displacement map made from soft noise: the backdrop is pushed around most near the rim
      const svg = document.createElementNS(SVG, 'svg');
      svg.setAttribute('class', 'usa-glass-defs');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('width', '0');
      svg.setAttribute('height', '0');
      const filter = document.createElementNS(SVG, 'filter');
      filter.id = id;
      filter.setAttribute('x', '-10%'); filter.setAttribute('y', '-10%');
      filter.setAttribute('width', '120%'); filter.setAttribute('height', '120%');
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
      const sheen = make('span', 'usa-glass-sheen');
      sheen.setAttribute('aria-hidden', 'true');
      const body = make('div', 'usa-glass-body');
      body.append(...kids);
      root.append(svg, sheen, body);
      root.style.setProperty('--blur', `${Math.min(40, Math.max(0, this.num('blur', 14)))}px`);
      root.style.setProperty('--radius', `${Math.max(0, this.num('radius', 24))}px`);
      if (this.str('tint')) root.style.setProperty('--tint', this.str('tint'));
      // Chromium can run a backdrop through an SVG filter; others keep the frosted look
      const svgBackdrop = typeof CSS !== 'undefined' && !!CSS.supports?.('backdrop-filter', `url(#${id}) blur(1px)`) && /Chrome\//.test(navigator.userAgent) && strength > 0;
      if (svgBackdrop) root.style.setProperty('--refract', `url(#${id})`);
      root.toggleAttribute('data-refract', svgBackdrop);
      root.toggleAttribute('data-pressable', this.flag('pressable'));
      root.toggleAttribute('data-static', this.reduced);
      this.append(root);
      this.listen(root, 'pointermove', (e: PointerEvent) => {
        if (this.reduced) return;
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
  }, { id: 'motion-surfaces', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
