import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { bound, make } from './moments';
import css from './moments-ui.css?raw';

/** The pieces a reveal animates: words (spaces kept as their own pieces) or characters. */
export function revealPieces(text: string, by: 'word' | 'char'): string[] {
  if (by === 'char') return Array.from(text);
  return text.split(/(\s+)/).filter((p) => p !== '');
}

/**
 * A line of text that rises into place piece by piece, each piece clearing a soft blur, when it scrolls into view.
 * Screen readers get the whole text once; the pieces are hidden from them.
 *
 * Attributes: `text` (Moments), `by` (word | char, char), `stagger` (ms between pieces, 10–300, 45), `once`
 * (reveal the first time only; otherwise it hides again off screen). Method `replay()`.
 */
export interface UsaTextRevealElement extends UsaElement {
  replay(): void;
}

export function defineTextReveal(tag = 'usa-text-reveal'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class TextReveal extends Base {
    static get observedAttributes(): string[] { return ['text', 'by', 'stagger', 'once']; }
    private _replay?: () => void;
    replay(): void { this._replay?.(); }
    mount(): void {
      const text = this.str('text', 'Moments');
      const by = this.str('by') === 'word' ? 'word' : 'char';
      const root = make('span', 'usa-moment usa-reveal');
      root.style.setProperty('--stagger', `${bound(this.num('stagger', 45), 10, 300, 45)}ms`);
      const art = make('span', 'usa-reveal-art');
      art.setAttribute('aria-hidden', 'true');
      revealPieces(text, by).forEach((piece, i) => {
        const span = make('span', /^\s+$/.test(piece) ? 'usa-reveal-gap' : 'usa-reveal-piece', piece);
        span.style.setProperty('--i', String(i));
        art.append(span);
      });
      root.append(art, make('span', 'usa-sr', text));
      root.toggleAttribute('data-static', this.reduced);
      this.append(root);
      let shown = false;
      this.inView((visible) => {
        if (visible) { root.setAttribute('data-in', ''); shown = true; }
        else if (!(shown && this.flag('once'))) root.removeAttribute('data-in');
      }, { threshold: 0.2 });
      this._replay = () => {
        root.removeAttribute('data-in');
        void root.offsetWidth; // restart the transitions from the hidden state
        root.setAttribute('data-in', '');
      };
      this.onCleanup(() => { root.remove(); this._replay = undefined; });
    }
  }, { id: 'moment-ui', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
