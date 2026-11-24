import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { cleanColor, list } from './kit';
import css from './motion-kit-12.css?raw';

/** An SVG path from (x1, y1) to (x2, y2) that bows sideways by `curve` (a share of the distance; 0 = straight). */
export function beamPath(x1: number, y1: number, x2: number, y2: number, curve = 0.2): string {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const dx = x2 - x1, dy = y2 - y1;
  const cx = mx - dy * curve, cy = my + dx * curve;
  const r = (n: number) => Math.round(n * 10) / 10;
  return `M${r(x1)},${r(y1)} Q${r(cx)},${r(cy)} ${r(x2)},${r(y2)}`;
}

/**
 * Animated beams between parts of a diagram: a faint line joins each pair of named children and a bright pulse of light
 * travels along it, again and again — for "your app → our API → the services" pictures. Name the children with
 * `data-node` and list the joins in `links` as `from>to` pairs. The lines are redrawn when the layout changes. They are
 * decorative (`aria-hidden`); the children stay as written. The pulses stop off screen and under reduced motion, where
 * the lines stay.
 *
 * Attributes: `links` (comma-separated `from>to` pairs), `curve` (−1–1; 0.2), `colors` (two comma-separated colors),
 * `duration` (seconds per pulse; 0.5–20; 3).
 */
export interface UsaConnectBeamElement extends UsaElement {
  redraw(): void;
}

export function defineConnectBeam(tag = 'usa-connect-beam'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class ConnectBeam extends Base {
    static get observedAttributes(): string[] { return ['links', 'curve', 'colors', 'duration']; }
    private _draw?: () => void;
    redraw(): void { this._draw?.(); }
    mount(): void {
      const ns = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('class', 'usa-kit usa-beams');
      svg.setAttribute('aria-hidden', 'true');
      const uid = `usa-beam-${Math.random().toString(36).slice(2, 8)}`;
      const [c1, c2] = this.str('colors').split(',').map((s) => cleanColor(s));
      svg.style.setProperty('--b1', c1 || '#22d3ee');
      svg.style.setProperty('--b2', c2 || '#a855f7');
      svg.style.setProperty('--dur', `${Math.min(20, Math.max(0.5, this.num('duration', 3)))}s`);
      const curve = Math.min(1, Math.max(-1, this.num('curve', 0.2)));
      const pairs = list(this.str('links'), 40).map((p) => p.split('>').map((s) => s.trim())).filter((p) => p.length === 2 && p[0] && p[1]);
      const defs = document.createElementNS(ns, 'defs');
      svg.append(defs);
      this.prepend(svg);
      this.classList.add('usa-beams-host');
      const node = (name: string) => Array.from(this.querySelectorAll<HTMLElement>('[data-node]')).find((el) => el.dataset.node === name) || null;
      const draw = () => {
        const box = this.getBoundingClientRect();
        svg.setAttribute('viewBox', `0 0 ${Math.max(1, box.width)} ${Math.max(1, box.height)}`);
        for (const el of Array.from(svg.querySelectorAll('g, linearGradient'))) el.remove();
        pairs.forEach(([from, to], i) => {
          const a = node(from), b = node(to);
          if (!a || !b) return;
          const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
          const x1 = ra.left + ra.width / 2 - box.left, y1 = ra.top + ra.height / 2 - box.top;
          const x2 = rb.left + rb.width / 2 - box.left, y2 = rb.top + rb.height / 2 - box.top;
          const d = beamPath(x1, y1, x2, y2, curve);
          const grad = document.createElementNS(ns, 'linearGradient');
          grad.id = `${uid}-${i}`;
          grad.setAttribute('gradientUnits', 'userSpaceOnUse');
          for (const [k, v] of [['x1', x1], ['y1', y1], ['x2', x2], ['y2', y2]] as const) grad.setAttribute(k, String(v));
          grad.innerHTML = '<stop offset="0" stop-color="var(--b1)"/><stop offset="1" stop-color="var(--b2)"/>';
          defs.append(grad);
          const g = document.createElementNS(ns, 'g');
          const base = document.createElementNS(ns, 'path');
          base.setAttribute('class', 'usa-beam-line');
          base.setAttribute('d', d);
          const pulse = document.createElementNS(ns, 'path');
          pulse.setAttribute('class', 'usa-beam-pulse');
          pulse.setAttribute('d', d);
          pulse.setAttribute('pathLength', '100');
          pulse.setAttribute('stroke', `url(#${grad.id})`);
          pulse.style.setProperty('--i', String(i));
          g.append(base, pulse);
          svg.append(g);
        });
      };
      this._draw = draw;
      svg.toggleAttribute('data-static', this.reduced);
      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(() => draw());
        ro.observe(this);
        for (const [a, b] of pairs) for (const n of [node(a), node(b)]) if (n) ro.observe(n);
        this.onCleanup(() => ro.disconnect());
      }
      this.inView((v) => svg.toggleAttribute('data-paused', !v));
      this.onCleanup(() => { svg.remove(); this.classList.remove('usa-beams-host'); this._draw = undefined; });
      draw();
    }
  }, { id: 'motion-kit-12', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
