import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { mountLoader } from './loaders';
import css from './loaders.css?raw';

/**
 * A soft disc that slowly swells and settles like a breath, with a halo that follows half a beat behind.
 *
 * Attributes: `label` (Loading, read once through `role="status"`), `duration` (ms for one lap, 300–8000, 4000),
 * `paused`. Pure CSS: it pauses while off screen and stands still under reduced motion.
 */
export interface UsaBreathOrbElement extends UsaElement {
  paused: boolean;
}

export function defineBreathOrb(tag = 'usa-breath-orb'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class BreathOrb extends Base {
    static get observedAttributes(): string[] { return ['label', 'paused', 'duration']; }
    private _sync?: () => void;
    get paused(): boolean { return this.flag('paused'); }
    set paused(on: boolean) { this.setFlag('paused', !!on); }
    changed(): void { this._sync?.(); }
    mount(): void {
      this._sync = mountLoader(this, { kind: 'breath', parts: 2, lap: 4000 });
      this.onCleanup(() => { this._sync = undefined; });
    }
  }, { id: 'moment-loaders', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
