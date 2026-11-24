import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { dataNum, ownChildren } from './kit';
import css from './motion-kit-12.css?raw';

/** The starting angle (degrees) of item `i` of `n` on one ring; rings after the first are offset by half a step. */
export function orbitAngle(i: number, n: number, ring = 1): number {
  if (n <= 0) return 0;
  const step = 360 / n;
  return Math.round((i * step + (ring % 2 === 0 ? step / 2 : 0)) * 100) / 100;
}

/**
 * Icons orbiting a centre on concentric rings, like an integrations diagram. The first child marked `data-center` (or
 * the first child) sits in the middle; the others go on ring 1, 2 or 3 (`data-ring`, otherwise spread over the rings)
 * and travel around it while staying upright, inner rings faster, alternate rings the other way. Hover or focus inside
 * pauses the motion so an item can be read or clicked; it also stops off screen and holds still under reduced motion.
 *
 * Attributes: `radius` (px between rings; 40–200; 72), `duration` (seconds per lap of the inner ring; 4–120; 24),
 * `label` (none).
 */
export interface UsaOrbitRingsElement extends UsaElement {}

export function defineOrbitRings(tag = 'usa-orbit-rings'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class OrbitRings extends Base {
    static get observedAttributes(): string[] { return ['radius', 'duration', 'label']; }
    mount(): void {
      const kids = ownChildren(this);
      if (!kids.length) return;
      const center = kids.find((k) => k.hasAttribute('data-center')) || kids[0];
      const others = kids.filter((k) => k !== center);
      const gap = Math.min(200, Math.max(40, this.num('radius', 72)));
      const lap = Math.min(120, Math.max(4, this.num('duration', 24)));
      const root = make('div', 'usa-kit usa-rings');
      const label = this.str('label');
      if (label) { root.setAttribute('role', 'group'); root.setAttribute('aria-label', label); }
      const rings = new Map<number, HTMLElement[]>();
      others.forEach((k, i) => {
        const r = Math.min(3, Math.max(1, Math.round(dataNum(k, 'ring', (i % 3) + 1))));
        if (!rings.has(r)) rings.set(r, []);
        rings.get(r)!.push(k);
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
