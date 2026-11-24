import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { mountLoader } from './loaders';
import css from './loaders.css?raw';

/**
 * Placeholder text lines with a light band sweeping across them while content loads.
 *
 * Attributes: `label` (Loading, read once through `role="status"`), `duration` (ms for one lap, 300–8000, 1600),
 * `paused`. Pure CSS: it pauses while off screen and stands still under reduced motion.
 */
export interface UsaSweepLinesElement extends UsaElement {
  paused: boolean;
}

export function defineSweepLines(tag = 'usa-sweep-lines'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class SweepLines extends Base {
    static get observedAttributes(): string[] { return ['label', 'paused', 'duration']; }
    private _sync?: () => void;
    get paused(): boolean { return this.flag('paused'); }
    set paused(on: boolean) { this.setFlag('paused', !!on); }
    changed(): void { this._sync?.(); }
    mount(): void {
      this._sync = mountLoader(this, { kind: 'sweep', parts: 4, lap: 1600 });
      this.onCleanup(() => { this._sync = undefined; });
    }
  }, { id: 'moment-loaders', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
