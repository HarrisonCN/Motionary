import { caf, defineElement, now, raf, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import css from './page-kit.css?raw';

const ICON = '<svg class="usa-dl-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path class="usa-dl-arrow" d="M12 4v11m-5-5l5 5 5-5M5 20h14"/><path class="usa-dl-tick" d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

/** A progress value (0–100) as a whole-number percentage label. */
export function percentLabel(p: number): string {
  const n = Number.isFinite(p) ? Math.min(100, Math.max(0, p)) : 0;
  return `${Math.floor(n)}%`;
}

/**
 * A download button that fills with progress and ends on a drawn tick. Pressing it emits `usa:start`; the page then sets
 * `progress` (0–100) as its download moves on, and at 100 the button turns into "done" and emits `usa:done`. For a demo
 * or a known wait, `duration` (ms) fills it by itself. The button is a native `button` with `aria-busy` while running; a
 * live region reads the percentage in tens. Pressing again when done starts over unless `once` is set.
 *
 * Attributes: `label` (Download), `done-label` (Downloaded), `progress` (0–100), `duration` (ms; 0 = driven by the page),
 * `once`.
 * Events `usa:start`, `usa:done`.
 */
export interface UsaDownloadButtonElement extends UsaElement {
  progress: number;
  readonly state: 'idle' | 'busy' | 'done';
  reset(): void;
}

export function defineDownloadButton(tag = 'usa-download-button'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class DownloadButton extends Base {
    static get observedAttributes(): string[] { return ['label', 'done-label', 'progress', 'duration', 'once']; }
    private _state: 'idle' | 'busy' | 'done' = 'idle';
    private _paint?: () => void;
    get state(): 'idle' | 'busy' | 'done' { return this._state; }
    get progress(): number { return Math.min(100, Math.max(0, this.num('progress', 0))); }
    set progress(v: number) { this.setAttribute('progress', String(Math.min(100, Math.max(0, Number(v) || 0)))); }
    reset(): void { this._state = 'idle'; this.removeAttribute('progress'); this._paint?.(); }
    changed(name: string): void { if (name === 'progress') this._paint?.(); else super.changed(name); }
    mount(): void {
      const btn = make('button', 'usa-kit usa-dl');
      btn.type = 'button';
      btn.innerHTML = ICON;
      const text = make('span', 'usa-dl-text');
      const live = make('span', 'usa-kit-sr');
      live.setAttribute('role', 'status');
      btn.append(text);
      this.append(btn, live);
      let tick = 0, said = -1;
      const paint = () => {
        const p = this.progress;
        if (this._state === 'busy' && p >= 100) {
          this._state = 'done';
          this.emit('done');
        }
        btn.dataset.state = this._state;
        btn.toggleAttribute('data-static', this.reduced);
        btn.setAttribute('aria-busy', String(this._state === 'busy'));
        btn.style.setProperty('--p', String(this._state === 'busy' ? p / 100 : 0));
        text.textContent = this._state === 'busy' ? percentLabel(p) : this._state === 'done' ? this.str('done-label', 'Downloaded') : this.str('label', 'Download');
        const tens = this._state === 'busy' ? Math.floor(p / 10) : -1;
        if (this._state === 'done') live.textContent = this.str('done-label', 'Downloaded');
        else if (tens !== said && tens >= 0) live.textContent = percentLabel(tens * 10);
        said = tens;
      };
      this._paint = paint;
      const run = (ms: number) => {
        const start = now();
        const step = () => {
          if (this._state !== 'busy') return;
          this.progress = Math.min(100, ((now() - start) / ms) * 100);
          if (this.progress < 100) tick = raf(step, this);
        };
        if (this.reduced) { this.progress = 100; return; }
        tick = raf(step, this);
      };
      this.listen(btn, 'click', () => {
        if (this._state === 'busy') return;
        if (this._state === 'done' && this.flag('once')) return;
        this._state = 'busy';
        this.setAttribute('progress', '0');
        paint();
        this.emit('start');
        const ms = Math.max(0, this.num('duration', 0));
        if (ms) run(ms);
      });
      this.onCleanup(() => {
        caf(tick);
        btn.remove();
        live.remove();
        this._paint = undefined;
      });
      paint();
    }
  }, { id: 'page-kit', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
