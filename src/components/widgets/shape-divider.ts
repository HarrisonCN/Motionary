import { defineElement, onFrame, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { cleanColor } from './kit';
import css from './page-kit.css?raw';

export const DIVIDER_SHAPES = ['wave', 'curve', 'tilt', 'arrow', 'zigzag', 'steps'] as const;
export type DividerShape = (typeof DIVIDER_SHAPES)[number];

const r = (n: number) => Math.round(n * 10) / 10;

/**
 * SVG path data for a divider `w` × `h` (the filled part is at the top, the edge runs along the bottom). `phase`
 * (radians) moves the wave crests; `amp` (0–1) scales the edge's depth.
 */
export function dividerPath(shape: string, w = 1200, h = 100, phase = 0, amp = 1): string {
  const d = Math.max(0, Math.min(1, amp)) * h;
  const base = h - d;
  switch (shape) {
    case 'curve':
      return `M0 0H${w}V${r(base)}Q${r(w / 2)} ${r(h + d * 0.9)} 0 ${r(base)}Z`;
    case 'tilt':
      return `M0 0H${w}V${r(base)}L0 ${h}Z`;
    case 'arrow':
      return `M0 0H${w}V${r(base)}H${r(w / 2 + d)}L${r(w / 2)} ${h}L${r(w / 2 - d)} ${r(base)}H0Z`;
    case 'zigzag': {
      const n = 16, step = w / n;
      let p = `M0 0H${w}V${r(base)}`;
      for (let i = n - 1; i >= 0; i--) p += `L${r(i * step + step / 2)} ${h}L${r(i * step)} ${r(base)}`;
      return p + 'Z';
    }
    case 'steps': {
      const n = 6, step = w / n;
      let p = `M0 0H${w}`;
      for (let i = n; i > 0; i--) p += `V${r(base + (d * (n - i + 1)) / n)}H${r((i - 1) * step)}`;
      return p + 'Z';
    }
    default: {
      const n = 48;
      let p = `M0 0H${w}`;
      for (let i = n; i >= 0; i--) {
        const x = (w * i) / n;
        const y = base + d / 2 + (Math.sin((i / n) * Math.PI * 4 + phase) * d) / 2;
        p += `L${r(x)} ${r(y)}`;
      }
      return p + 'Z';
    }
  }
}

/**
 * A section divider drawn in SVG: wave, curve, tilt, arrow, zigzag or steps, in the text color (or `color`). Put it
 * between two sections; `position="bottom"` turns it upside down for the foot of a section, `flip` mirrors it. The
 * wave can have up to three layers that drift slowly (`animate`); they stop off screen and stand still under reduced
 * motion. Decorative only: `aria-hidden`.
 *
 * Attributes: `shape` (wave), `height` (px; 80), `position` (top | bottom), `flip`, `color`, `layers` (1–3; 1),
 * `animate`.
 */
export interface UsaShapeDividerElement extends UsaElement {}

export function defineShapeDivider(tag = 'usa-shape-divider'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class ShapeDivider extends Base {
    static get observedAttributes(): string[] { return ['shape', 'height', 'position', 'flip', 'color', 'layers', 'animate']; }
    mount(): void {
      const shape = (DIVIDER_SHAPES as readonly string[]).includes(this.str('shape')) ? this.str('shape') : 'wave';
      const box = make('div', 'usa-kit usa-divider');
      box.setAttribute('aria-hidden', 'true');
      box.dataset.position = this.str('position') === 'bottom' ? 'bottom' : 'top';
      box.toggleAttribute('data-flip-x', this.flag('flip'));
      box.style.setProperty('--h', `${Math.min(400, Math.max(8, this.num('height', 80)))}px`);
      const color = cleanColor(this.str('color'));
      if (color) box.style.setProperty('--fill', color);
      const layers = shape === 'wave' ? Math.min(3, Math.max(1, Math.round(this.num('layers', 1)))) : 1;
      const NS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('viewBox', '0 0 1200 100');
      svg.setAttribute('preserveAspectRatio', 'none');
      svg.setAttribute('focusable', 'false');
      const paths = Array.from({ length: layers }, (_, i) => {
        const p = document.createElementNS(NS, 'path');
        p.setAttribute('d', dividerPath(shape, 1200, 100, i * 1.3, 1 - i * 0.18));
        return p;
      }).reverse();
      svg.append(...paths);
      box.append(svg);
      this.prepend(box);
      if (shape === 'wave' && this.flag('animate') && !this.reduced) {
        let stop: (() => void) | undefined;
        let t = 0;
        this.inView((v) => {
          stop?.();
          stop = undefined;
          if (!v) return;
          stop = onFrame((_now, dt) => {
            t += (dt || 16) / 1000;
            paths.forEach((p, i) => p.setAttribute('d', dividerPath(shape, 1200, 100, (layers - 1 - i) * 1.3 + t * (0.6 + i * 0.25), 1 - (layers - 1 - i) * 0.18)));
          }, this);
        });
        this.onCleanup(() => stop?.());
      }
      this.onCleanup(() => box.remove());
    }
  }, { id: 'page-kit', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
