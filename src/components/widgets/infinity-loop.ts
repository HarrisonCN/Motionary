import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { mountLoader } from './loaders';
import css from './loaders.css?raw';

const SVG = 'http://www.w3.org/2000/svg';

/** The figure-eight drawing: a faint track and a moving dash on the same path. */
function figure(): Element {
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

/**
 * A short stroke runs round an infinity sign without end.
 *
 * Attributes: `label` (Loading, read once through `role="status"`), `duration` (ms for one lap, 300–8000, 1600),
 * `paused`. Pure CSS: it pauses while off screen and stands still under reduced motion.
 */
export interface UsaInfinityLoopElement extends UsaElement {
  paused: boolean;
}

export function defineInfinityLoop(tag = 'usa-infinity-loop'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class InfinityLoop extends Base {
    static get observedAttributes(): string[] { return ['label', 'paused', 'duration']; }
    private _sync?: () => void;
    get paused(): boolean { return this.flag('paused'); }
    set paused(on: boolean) { this.setFlag('paused', !!on); }
    changed(): void { this._sync?.(); }
    mount(): void {
      this._sync = mountLoader(this, { kind: 'infinity', parts: 0, lap: 1600, extra: figure });
      this.onCleanup(() => { this._sync = undefined; });
    }
  }, { id: 'moment-loaders', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
