import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { bound, make } from './moments';
import { pressSpring, tap } from './tactile';
import css from './tactile.css?raw';

const SVG = 'http://www.w3.org/2000/svg';

/**
 * A squishy download / upload key. Pressing it hops the arrow toward the tray and asks the page to start the transfer;
 * the page then reports progress through the `progress` attribute, which fills a ring around the key. At 100 the arrow
 * turns into a tick and `usa:complete` fires once. A native button handles pointer and keyboard; progress is
 * announced through a polite live region.
 *
 * Attributes: `direction` (download | upload, download), `label` (Download / Upload), `progress` (0–100, absent when
 * idle), `disabled`. Events `usa:transfer` ({ direction }) on press and `usa:complete` ({ direction }).
 */
export interface UsaTransferButtonElement extends UsaElement {
  progress: number | null;
}

export function defineTransferButton(tag = 'usa-transfer-button'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class TransferButton extends Base {
    static get observedAttributes(): string[] { return ['direction', 'label', 'progress', 'disabled']; }
    private _sync?: () => void;
    private _done = false;
    get progress(): number | null {
      if (!this.hasAttribute('progress')) return null;
      return Math.round(bound(this.num('progress', 0), 0, 100, 0));
    }
    set progress(n: number | null) {
      if (n === null || n === undefined) this.removeAttribute('progress');
      else this.setAttribute('progress', String(Math.round(bound(Number(n), 0, 100, 0))));
    }
    private direction(): 'download' | 'upload' { return this.str('direction') === 'upload' ? 'upload' : 'download'; }
    changed(): void { this._sync?.(); }
    mount(): void {
      const root = make('span', 'usa-tactile usa-transfer');
      const key = make('button', 'usa-squish-key usa-transfer-key');
      key.type = 'button';
      const ring = document.createElementNS(SVG, 'svg');
      ring.setAttribute('viewBox', '0 0 40 40');
      ring.setAttribute('aria-hidden', 'true');
      ring.classList.add('usa-transfer-ring');
      const track = document.createElementNS(SVG, 'circle');
      const bar = document.createElementNS(SVG, 'circle');
      for (const c of [track, bar]) { c.setAttribute('cx', '20'); c.setAttribute('cy', '20'); c.setAttribute('r', '18'); c.setAttribute('pathLength', '1'); }
      track.classList.add('usa-transfer-track');
      bar.classList.add('usa-transfer-bar');
      ring.append(track, bar);
      const icon = document.createElementNS(SVG, 'svg');
      icon.setAttribute('viewBox', '0 0 24 24');
      icon.setAttribute('aria-hidden', 'true');
      icon.classList.add('usa-transfer-icon');
      const shapes: [string, string][] = [
        ['usa-transfer-arrow', 'M12 4v11M7 10.5l5 5 5-5'],
        ['usa-transfer-tray', 'M5 19.5h14'],
        ['usa-transfer-tick', 'M6 12.5l4 4 8-9'],
      ];
      for (const [cls, d] of shapes) {
        const p = document.createElementNS(SVG, 'path');
        p.setAttribute('d', d);
        p.setAttribute('pathLength', '1');
        p.classList.add(cls);
        icon.append(p);
      }
      const name = make('span', 'usa-transfer-label');
      const status = make('span', 'usa-sr');
      status.setAttribute('aria-live', 'polite');
      key.append(ring, icon);
      root.append(key, name, status);
      this.append(root);
      const press = pressSpring(this, key, 0.85);
      let lastSaid = -1;
      const sync = () => {
        const dir = this.direction();
        const p = this.progress;
        const label = this.str('label', dir === 'upload' ? 'Upload' : 'Download');
        root.dataset.direction = dir;
        name.textContent = label;
        key.setAttribute('aria-label', label);
        key.disabled = this.flag('disabled');
        root.style.setProperty('--progress', String((p ?? 0) / 100));
        root.dataset.state = p === null ? 'idle' : p >= 100 ? 'done' : 'busy';
        if (p === null) { this._done = false; lastSaid = -1; status.textContent = ''; }
        else {
          // announce in quarters so a screen reader is not flooded
          const quarter = Math.floor(p / 25);
          if (quarter !== lastSaid) { lastSaid = quarter; status.textContent = p >= 100 ? `${label} complete` : `${label} ${p}%`; }
          if (p >= 100 && !this._done) { this._done = true; this.emit('complete', { direction: dir }); }
          if (p < 100) this._done = false;
        }
        key.setAttribute('aria-busy', String(root.dataset.state === 'busy'));
        root.toggleAttribute('data-static', this.reduced);
      };
      this._sync = sync;
      this.listen(key, 'click', (e: MouseEvent) => {
        if (e.detail === 0) tap(press);
        this.motion(icon, [{ transform: 'none' }, { transform: `translateY(${this.direction() === 'upload' ? -3 : 3}px)` }, { transform: 'none' }], { duration: 360, easing: 'cubic-bezier(.34,1.56,.64,1)' });
        this.emit('transfer', { direction: this.direction() });
      });
      this.onCleanup(() => { root.remove(); this._sync = undefined; });
      sync();
    }
  }, { id: 'tactile', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
