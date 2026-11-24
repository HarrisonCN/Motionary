import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { mountLoader } from './loaders';
import css from './loaders.css?raw';

/**
 * Three rings breathe out from a still centre dot, one after another, and fade as they widen.
 *
 * Attributes: `label` (Loading, read once through `role="status"`), `duration` (ms for one lap, 300–8000, 1800),
 * `paused`. Pure CSS: it pauses while off screen and stands still under reduced motion.
 */
export interface UsaTriplePulseElement extends UsaElement {
  paused: boolean;
}

export function defineTriplePulse(tag = 'usa-triple-pulse'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class TriplePulse extends Base {
    static get observedAttributes(): string[] { return ['label', 'paused', 'duration']; }
    private _sync?: () => void;
    get paused(): boolean { return this.flag('paused'); }
    set paused(on: boolean) { this.setFlag('paused', !!on); }
    changed(): void { this._sync?.(); }
    mount(): void {
      this._sync = mountLoader(this, { kind: 'pulse', parts: 3, lap: 1800 });
      this.onCleanup(() => { this._sync = undefined; });
    }
  }, { id: 'moment-loaders', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
