import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { hostSprings, tick, uid } from './micro-kit-16';
import { linesHeight } from './damped-kit-18';
import css from './damped-kit-18.css?raw';

/**
 * Long text clamped to a few lines that unfolds on a damped spring: the height eases open with a short settle, the
 * fade at the bottom melts away as it goes, and "Show less" folds it back from wherever it is. When the text fits in
 * the clamp, no button is shown. The toggle is a real button with `aria-expanded`; the full text stays in the DOM
 * for screen readers and find-in-page.
 *
 * Content: the element's children are the text. Attributes: `lines` (lines shown when closed; 3), `more` (Read more),
 * `less` (Show less), `open`, `feel`.
 * Events: `usa:toggle` ({ open }).
 */
export interface UsaReadMoreElement extends UsaElement {
  open: boolean;
  /** Whether the text is longer than the clamp (and so has a button). */
  readonly clamped: boolean;
}

export function defineReadMore(tag = 'usa-read-more'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, (Base) => class ReadMore extends Base {
    static get observedAttributes(): string[] {
      return ['lines', 'more', 'less', 'open', 'feel'];
    }
    private _open = false;
    private _clamped = false;
    private _seen?: string | null;
    private _source: Node[] | null = null;
    private _set: ((on: boolean, user: boolean) => void) | null = null;
    get open(): boolean {
      return this._open;
    }
    set open(v: boolean) {
      if (this._set) this._set(!!v, false);
      else this._open = !!v;
    }
    get clamped(): boolean {
      return this._clamped;
    }
    mount(): void {
      if (!this._source) {
        this._source = [...this.childNodes];
        this._source.forEach((n) => n.parentNode === this && this.removeChild(n));
      }
      const attr = this.getAttribute('open');
      if (attr !== this._seen) {
        this._seen = attr;
        this._open = this.flag('open');
      }
      const lines = Math.max(1, Math.min(40, Math.floor(this.num('lines', 3))));
      const more = this.str('more', 'Read more');
      const less = this.str('less', 'Show less');
      const root = make('div', 'usa-dkit usa-rmore');
      const clip = make('div', 'usa-rmore-clip');
      clip.id = uid('usa-rmore');
      const text = make('div', 'usa-rmore-text');
      text.append(...this._source.map((n) => n.cloneNode(true)));
      const fade = make('div', 'usa-rmore-fade');
      fade.setAttribute('aria-hidden', 'true');
      clip.append(text, fade);
      const btn = make('button', 'usa-rmore-btn');
      btn.type = 'button';
      btn.setAttribute('aria-controls', clip.id);
      root.append(clip, btn);
      this.append(root);

      let closed = 0;
      let full = 0;
      const measure = () => {
        const lh = parseFloat(getComputedStyle(text).lineHeight) || (parseFloat(getComputedStyle(text).fontSize) || 16) * 1.5;
        closed = linesHeight(lines, lh);
        full = text.scrollHeight || text.getBoundingClientRect().height || full;
        this._clamped = full > closed + 2;
        btn.hidden = !this._clamped;
        root.toggleAttribute('data-clamped', this._clamped);
      };
      const group = hostSprings(this, { p: this._open ? 1 : 0 }, (v) => {
        const p = v.p;
        const resting = Math.abs(p - Math.round(p)) < 0.002 && Math.abs(group.velocity('p')) < 0.01;
        if (!this._clamped || (resting && Math.round(p) === 1)) clip.style.height = '';
        else clip.style.height = `${Math.round((closed + Math.max(0, p) * (full - closed)) * 10) / 10}px`;
        fade.style.opacity = String(Math.round(Math.min(1, Math.max(0, 1 - p * 1.6)) * 100) / 100);
      });
      const paint = () => {
        btn.textContent = this._open ? less : more;
        btn.setAttribute('aria-expanded', String(this._open));
        root.toggleAttribute('data-open', this._open);
      };
      const set = (on: boolean, user: boolean) => {
        if (on === this._open) return;
        measure();
        this._open = on;
        paint();
        group.set({ p: on ? 1 : 0 }, { spring: on ? { duration: 560, bounce: 0.14 } : { duration: 380, bounce: 0 } });
        if (user) tick(this, 5);
        this.emit('toggle', { open: on });
      };
      this._set = set;
      measure();
      paint();
      group.jump({ p: this._open ? 1 : 0 });
      this.listen(btn, 'click', () => set(!this._open, true));
      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(() => {
          measure();
          if (!group.animating) group.jump({ p: this._open ? 1 : 0 });
        });
        ro.observe(text);
        this.onCleanup(() => ro.disconnect());
      }
      this.onCleanup(() => {
        group.stop();
        root.remove();
        this._set = null;
      });
    }
  }, { id: 'damped-kit-18', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
