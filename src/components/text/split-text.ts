import { defineElement, srText, type UsaElement } from '../base';
import css from './split-text.css?raw';

/**
 * `<usa-split-text>` — splits its text into words or characters and reveals
 * them in a cascade (pure CSS animation per unit, transform / opacity /
 * filter only). Words never break across lines.
 *
 * Attributes: `by` (`chars` | `words`, default `chars`), `effect`
 * (`rise` | `fade` | `blur` | `flip` | `pop`, default `rise`), `stagger`
 * (ms between units, 28 for chars / 70 for words), `duration` (ms, 620),
 * `delay` (ms, 0), `trigger` (`view` | `load` | `manual`, default `view`),
 * `repeat`. The original text stays readable via `aria-label`.
 * Event: `usa:complete`.
 */
export interface UsaSplitTextElement extends UsaElement {
  readonly units: HTMLElement[];
  play(): void;
  reset(): void;
}

export function defineSplitText(tag = 'usa-split-text'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaSplitText extends Base {
        static get observedAttributes(): string[] {
          return ['by', 'text'];
        }

        private _source: string | null = null;
        private _timer: ReturnType<typeof setTimeout> | 0 = 0;

        get units(): HTMLElement[] {
          return Array.from(this.querySelectorAll<HTMLElement>('.usa-split-unit'));
        }

        mount(): void {
          if (this._source === null) this._source = this.getAttribute('text') ?? (this.textContent || '').replace(/\s+/g, ' ').trim();
          const text = this.getAttribute('text') ?? this._source;
          const byWords = this.str('by', 'chars') === 'words';
          const frag = document.createDocumentFragment();
          frag.append(srText(text));
          let i = 0;
          text.split(' ').forEach((word, w) => {
            if (w > 0) frag.append(' ');
            const wordEl = document.createElement('span');
            wordEl.className = 'usa-split-word';
            wordEl.setAttribute('aria-hidden', 'true');
            const parts = byWords ? [word] : Array.from(word);
            for (const part of parts) {
              const u = document.createElement('span');
              u.className = 'usa-split-unit';
              u.textContent = part;
              u.style.setProperty('--i', String(i++));
              wordEl.append(u);
            }
            frag.append(wordEl);
          });
          this.replaceChildren(frag);
          this.style.setProperty('--usa-split-stagger', `${this.num('stagger', byWords ? 70 : 28)}ms`);
          this.style.setProperty('--usa-split-duration', `${this.num('duration', 620)}ms`);
          this.style.setProperty('--usa-split-delay', `${this.num('delay', 0)}ms`);
          this.style.setProperty('--usa-split-count', String(i));
          if (this.reduced) {
            this.setAttribute('data-state', 'shown');
            return;
          }
          this.setAttribute('data-state', 'hidden');
          const trigger = this.str('trigger', 'view');
          if (trigger === 'load') this.play();
          else if (trigger === 'view') {
            this.inView((visible) => {
              if (visible && this.getAttribute('data-state') === 'hidden') this.play();
              else if (!visible && this.flag('repeat')) this.reset();
            }, { threshold: 0.2 });
          }
        }

        unmount(): void {
          clearTimeout(this._timer as ReturnType<typeof setTimeout>);
        }

        play(): void {
          clearTimeout(this._timer as ReturnType<typeof setTimeout>);
          if (this.reduced) {
            this.setAttribute('data-state', 'shown');
            return;
          }
          // Restart the CSS animations
          this.setAttribute('data-state', 'hidden');
          void this.offsetWidth;
          this.setAttribute('data-state', 'play');
          const n = this.units.length;
          const total = this.num('delay', 0) + this.num('duration', 620) + Math.max(0, n - 1) * this.num('stagger', this.str('by') === 'words' ? 70 : 28);
          this._timer = setTimeout(() => {
            this.setAttribute('data-state', 'shown');
            this.emit('complete');
          }, total);
        }

        reset(): void {
          clearTimeout(this._timer as ReturnType<typeof setTimeout>);
          this.setAttribute('data-state', this.reduced ? 'shown' : 'hidden');
        }
      },
    { id: 'split-text', text: css }
  );
}
