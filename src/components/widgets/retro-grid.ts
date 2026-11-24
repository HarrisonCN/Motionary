import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { cleanColor, ownChildren } from './kit';
import css from './motion-kit-12.css?raw';

/**
 * A synthwave floor: a grid of glowing lines laid in perspective that rolls toward the viewer and fades into the
 * horizon, with an optional striped sun. Pure CSS (a tilted plane with a moving gradient), so no script runs per frame;
 * it pauses off screen and holds still under reduced motion. The children sit on top.
 *
 * Attributes: `angle` (tilt in degrees; 30–85; 65), `cell` (grid size px; 20–200; 60), `color` (line color), `speed`
 * (0.25–4; 1), `sun`.
 */
export interface UsaRetroGridElement extends UsaElement {}

export function defineRetroGrid(tag = 'usa-retro-grid'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class RetroGrid extends Base {
    static get observedAttributes(): string[] { return ['angle', 'cell', 'color', 'speed', 'sun']; }
    mount(): void {
      const kids = ownChildren(this);
      const root = make('div', 'usa-kit usa-retro');
      const scene = make('div', 'usa-retro-scene');
      scene.setAttribute('aria-hidden', 'true');
      if (this.flag('sun')) scene.append(make('div', 'usa-retro-sun'));
      scene.append(make('div', 'usa-retro-floor'));
      const body = make('div', 'usa-retro-body');
      body.append(...kids);
      root.append(scene, body);
      const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
      root.style.setProperty('--tilt', `${clamp(this.num('angle', 65), 30, 85)}deg`);
      root.style.setProperty('--cell', `${clamp(this.num('cell', 60), 20, 200)}px`);
      root.style.setProperty('--speed', String(clamp(this.num('speed', 1), 0.25, 4)));
      const c = cleanColor(this.str('color'));
      if (c) root.style.setProperty('--line', c);
      root.toggleAttribute('data-static', this.reduced);
      this.append(root);
      this.inView((v) => root.toggleAttribute('data-paused', !v));
      this.onCleanup(() => { this.append(...kids); root.remove(); });
    }
  }, { id: 'motion-kit-12', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
