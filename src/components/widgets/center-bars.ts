import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { mountLoader } from './loaders';
import css from './loaders.css?raw';

/**
 * Five upright bars stretch and settle from their centre line in a ripple, like a quiet equaliser.
 *
 * Attributes: `label` (Loading, read once through `role="status"`), `duration` (ms for one lap, 300–8000, 1000),
 * `paused`. Pure CSS: it pauses while off screen and stands still under reduced motion.
 */
export interface UsaCenterBarsElement extends UsaElement {
  paused: boolean;
}

export function defineCenterBars(tag = 'usa-center-bars'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class CenterBars extends Base {
    static get observedAttributes(): string[] { return ['label', 'paused', 'duration']; }
    private _sync?: () => void;
    get paused(): boolean { return this.flag('paused'); }
    set paused(on: boolean) { this.setFlag('paused', !!on); }
    changed(): void { this._sync?.(); }
    mount(): void {
      this._sync = mountLoader(this, { kind: 'bars', parts: 5, lap: 1000 });
      this.onCleanup(() => { this._sync = undefined; });
    }
  }, { id: 'moment-loaders', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
