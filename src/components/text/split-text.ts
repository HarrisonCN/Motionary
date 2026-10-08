import { defineElement, srText, type UsaElement } from '../base';
import css from './split-text.css?raw';
import { graphemes, words, splitOrder, JOINING_SCRIPT, type SplitFrom } from './split';

/**
 * `<usa-split-text>` — splits its text into words or characters and reveals
 * them in a cascade (pure CSS animation per unit, transform / opacity /
 * filter only). Words never break across lines.
 *
 * 4.3: `Intl.Segmenter`-aware (emoji, CJK words), Arabic-script words are
 * never split below the word, `by="lines"` reveals line by line, and `from`
 * (`start` · `end` · `center` · `edges` · `random`) sets the cascade order.
 *
 * Attributes: `by` (`chars` | `words` | `lines`, default `chars`), `effect`
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
        private _steps = 0;

        get units(): HTMLElement[] {
          return Array.from(this.querySelectorAll<HTMLElement>('.usa-split-unit'));
        }

        mount(): void {
          if (this._source === null) this._source = this.getAttribute('text') ?? (this.textContent || '').replace(/\s+/g, ' ').trim();
          const text = this.getAttribute('text') ?? this._source;
          const mode = this.str('by', 'chars');
          const byWords = mode !== 'chars';
          const lang = this.closest('[lang]')?.getAttribute('lang') || undefined;
          const frag = document.createDocumentFragment();
          frag.append(srText(text));
          const units: HTMLElement[] = [];
          for (const word of words(text, lang)) {
            if (/^\s+$/.test(word)) {
              frag.append(' ');
              continue;
            }
            const wordEl = document.createElement('span');
            wordEl.className = 'usa-split-word';
            wordEl.setAttribute('aria-hidden', 'true');
            const parts = byWords || JOINING_SCRIPT.test(word) ? [word] : graphemes(word, lang);
            for (const part of parts) {
              const u = document.createElement('span');
              u.className = 'usa-split-unit';
              u.textContent = part;
              units.push(u);
              wordEl.append(u);
            }
            frag.append(wordEl);
          }
          this.replaceChildren(frag);
          // cascade order: per unit, or per line for by="lines"
          let rank = units.map((_, k) => k);
          if (mode === 'lines') {
            let line = -1;
            let top: number | null = null;
            rank = units.map((u) => {
              const t = Math.round((u.parentElement as HTMLElement).offsetTop);
              if (top === null || Math.abs(t - top) > 2) line++;
              top = t;
              return line;
            });
          }
          const groups = Math.max(0, ...rank) + 1;
          const order = splitOrder(groups, this.str('from', 'start') as SplitFrom);
          units.forEach((u, k) => u.style.setProperty('--i', String(order[rank[k]] ?? 0)));
          const i = Math.max(0, ...units.map((_, k) => order[rank[k]] ?? 0)) + 1;
          this._steps = i;
          this.style.setProperty('--usa-split-stagger', `${this.num('stagger', mode === 'lines' ? 140 : byWords ? 70 : 28)}ms`);
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
          const by = this.str('by', 'chars');
          const total = this.num('delay', 0) + this.num('duration', 620) + Math.max(0, this._steps - 1) * this.num('stagger', by === 'lines' ? 140 : by === 'words' ? 70 : 28);
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
