import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { bound, make } from './moments';
import css from './moments-ui.css?raw';

/**
 * A Wi-Fi style signal indicator: a dot and three arcs. `level` lights 0–3 arcs; `searching` sweeps the arcs outward
 * in turn until a level is set. It is a picture with a text alternative (`role="img"`), not a control.
 *
 * Attributes: `level` (0–3, 3), `searching`, `label` (Signal). The text alternative reads "Signal: 2 of 3" or
 * "Signal: searching".
 */
export interface UsaWifiSignalElement extends UsaElement {
  level: number;
}

export function defineWifiSignal(tag = 'usa-wifi-signal'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class WifiSignal extends Base {
    static get observedAttributes(): string[] { return ['level', 'searching', 'label']; }
    private _sync?: () => void;
    get level(): number { return Math.round(bound(this.num('level', 3), 0, 3, 3)); }
    set level(n: number) { this.setAttribute('level', String(Math.round(bound(Number(n), 0, 3, 0)))); }
    changed(): void { this._sync?.(); }
    mount(): void {
      const root = make('span', 'usa-moment usa-wifi');
      root.setAttribute('role', 'img');
      for (let i = 0; i < 4; i++) {
        const arc = make('i', 'usa-wifi-arc');
        arc.style.setProperty('--i', String(i));
        root.append(arc);
      }
      this.append(root);
      const sync = () => {
        const searching = this.flag('searching'), level = this.level;
        root.dataset.level = String(level);
        root.toggleAttribute('data-searching', searching);
        root.toggleAttribute('data-static', this.reduced);
        root.setAttribute('aria-label', `${this.str('label', 'Signal')}: ${searching ? 'searching' : `${level} of 3`}`);
      };
      this._sync = sync;
      this.inView((visible) => root.toggleAttribute('data-offscreen', !visible));
      this.onCleanup(() => { root.remove(); this._sync = undefined; });
      sync();
    }
  }, { id: 'moment-ui', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
