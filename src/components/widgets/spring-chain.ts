import { defineElement, onFrame, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { microSpring } from '../physics/spring-solver';
import { readFeel, readSpeed } from '../interaction/micro';
import { chainPath, linkSize, frameOnce } from './fling-kit-19';
import css from './fling-kit-19.css?raw';

const NS = 'http://www.w3.org/2000/svg';

/**
 * A chain of links on damped springs that follows the pointer: the head chases it, each link chases the one before,
 * so the tail swings, lags and settles like a rope. A press plucks it. With no pointer over it the head drifts along
 * a slow figure-eight. Decorative: it is one image for screen readers, it pauses off screen, and under reduced motion
 * it rests as a still curve.
 *
 * Attributes: `links` (3–40; 12), `size` (the head's size in px; 18), `label` (the image's accessible name; Spring
 * chain), `feel`. Colour with `--usa-chain-color`, height with `--usa-chain-height`.
 */
export interface UsaSpringChainElement extends UsaElement {
  /** Give every link a push, as a press does. */
  pluck(): void;
}

export function defineSpringChain(tag = 'usa-spring-chain'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, (Base) => class SpringChain extends Base {
    static get observedAttributes(): string[] {
      return ['links', 'size', 'label', 'feel'];
    }
    private _pluck: (() => void) | null = null;
    pluck(): void {
      this._pluck?.();
    }
    mount(): void {
      const n = Math.min(40, Math.max(3, Math.round(this.num('links', 12))));
      const head = Math.min(64, Math.max(4, this.num('size', 18)));
      const root = make('div', 'usa-fkit usa-chain');
      root.setAttribute('role', 'img');
      root.setAttribute('aria-label', this.str('label', 'Spring chain'));
      const svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('aria-hidden', 'true');
      const rope = document.createElementNS(NS, 'path');
      rope.setAttribute('class', 'usa-chain-rope');
      svg.append(rope);
      const dots = Array.from({ length: n }, (_, i) => {
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('class', 'usa-chain-link');
        c.setAttribute('r', String(linkSize(i, n, head) / 2));
        return c;
      });
      svg.append(...[...dots].reverse());
      root.append(svg);
      this.append(root);

      let w = 0;
      let h = 0;
      const measure = () => {
        w = root.clientWidth || 320;
        h = root.clientHeight || 220;
      };
      measure();
      // a still S-curve across the middle: the rest pose, and the whole picture under reduced motion
      const pts = Array.from({ length: n }, (_, i) => {
        const f = n > 1 ? i / (n - 1) : 0;
        return { x: w * (0.3 + 0.4 * f), y: h / 2 + Math.sin(f * Math.PI * 2) * h * 0.12, vx: 0, vy: 0 };
      });
      const draw = () => {
        rope.setAttribute('d', chainPath(pts));
        pts.forEach((p, i) => {
          dots[i].setAttribute('cx', String(Math.round(p.x * 10) / 10));
          dots[i].setAttribute('cy', String(Math.round(p.y * 10) / 10));
        });
      };
      draw();

      const feel = this.getAttribute('feel')?.trim() || readFeel(this);
      const phys = microSpring({ duration: 300, bounce: 0.32 }, feel, readSpeed(this));
      let pointer: { x: number; y: number } | null = null;
      let clock = 0;
      const step = (dt: number) => {
        clock += dt;
        const target = pointer || { x: w / 2 + Math.sin(clock * 0.0011) * w * 0.3, y: h / 2 + Math.sin(clock * 0.0022) * h * 0.28 };
        // fixed sub-steps keep the springs stable whatever the frame time
        const sub = Math.min(8, Math.max(1, Math.ceil(dt / 8)));
        const s = Math.min(64, dt) / 1000 / sub;
        for (let k = 0; k < sub; k++) {
          for (let i = 0; i < n; i++) {
            const p = pts[i];
            const to = i ? pts[i - 1] : target;
            const ax = (-phys.stiffness * (p.x - to.x) - phys.damping * p.vx) / phys.mass;
            const ay = (-phys.stiffness * (p.y - to.y) - phys.damping * p.vy) / phys.mass;
            p.vx += ax * s;
            p.vy += ay * s;
            p.x += p.vx * s;
            p.y += p.vy * s;
          }
        }
        draw();
      };
      let stop: (() => void) | null = null;
      const run = (on: boolean) => {
        if (on && !stop && !this.reduced) stop = onFrame((_t, dt) => step(dt), this);
        else if (!on && stop) {
          stop();
          stop = null;
        }
      };
      this.inView((visible) => run(visible));
      this._pluck = () => {
        if (this.reduced) return;
        pts.forEach((p, i) => {
          const a = (i / n) * Math.PI * 2;
          p.vx += Math.cos(a) * 900;
          p.vy += Math.sin(a) * 900;
        });
      };
      const at = (e: PointerEvent) => {
        const r = root.getBoundingClientRect();
        pointer = { x: e.clientX - r.left, y: e.clientY - r.top };
      };
      this.listen(root, 'pointermove', at);
      this.listen(root, 'pointerdown', (e: PointerEvent) => {
        at(e);
        this._pluck?.();
      });
      this.listen(root, 'pointerleave', () => (pointer = null));
      if (typeof ResizeObserver !== 'undefined') {
        const later = frameOnce(() => {
          measure();
          if (this.reduced) {
            pts.forEach((p, i) => {
              const f = n > 1 ? i / (n - 1) : 0;
              p.x = w * (0.3 + 0.4 * f);
              p.y = h / 2 + Math.sin(f * Math.PI * 2) * h * 0.12;
            });
            draw();
          }
        }, this);
        const ro = new ResizeObserver(() => later.ask());
        ro.observe(root);
        this.onCleanup(() => {
          ro.disconnect();
          later.cancel();
        });
      }
      this.onCleanup(() => {
        run(false);
        root.remove();
        this._pluck = null;
      });
    }
  }, { id: 'fling-kit-19', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
