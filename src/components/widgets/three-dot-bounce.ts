import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { mountLoader } from './loaders';
import css from './loaders.css?raw';

/**
 * Three dots hop in turn and squash a little as they land.
 *
 * Attributes: `label` (Loading, read once through `role="status"`), `duration` (ms for one lap, 300–8000, 1000),
 * `paused`. Pure CSS: it pauses while off screen and stands still under reduced motion.
 */
export interface UsaThreeDotBounceElement extends UsaElement {
  paused: boolean;
}

export function defineThreeDotBounce(tag = 'usa-three-dot-bounce'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class ThreeDotBounce extends Base {
    static get observedAttributes(): string[] { return ['label', 'paused', 'duration']; }
    private _sync?: () => void;
    get paused(): boolean { return this.flag('paused'); }
    set paused(on: boolean) { this.setFlag('paused', !!on); }
    changed(): void { this._sync?.(); }
    mount(): void {
      this._sync = mountLoader(this, { kind: 'dots', parts: 3, lap: 1000 });
      this.onCleanup(() => { this._sync = undefined; });
    }
  }, { id: 'moment-loaders', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
