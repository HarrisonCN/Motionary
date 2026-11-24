import { defineElement, queryAttr, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import css from './page-kit.css?raw';

export const CUE_KINDS = ['mouse', 'chevron', 'line'] as const;

/**
 * A "scroll down" hint for the bottom of a hero: a mouse with a rolling wheel, a pair of blinking chevrons or a line
 * with a falling dash. It is a real button: pressing it scrolls to `target` (or one screen down). It fades away once
 * the page has scrolled past `hide-after` px and comes back near the top. The looping hint stops under reduced motion.
 *
 * Attributes: `kind` (mouse | chevron | line; mouse), `label` (Scroll down), `target` (selector), `hide-after` (px; 40),
 * `text` (visible caption; none).
 * Events `usa:hide`, `usa:show`.
 */
export interface UsaScrollCueElement extends UsaElement {
  readonly away: boolean;
}

export function defineScrollCue(tag = 'usa-scroll-cue'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class ScrollCue extends Base {
    static get observedAttributes(): string[] { return ['kind', 'label', 'target', 'hide-after', 'text']; }
    private _gone = false;
    get away(): boolean { return this._gone; }
    mount(): void {
      const kind = (CUE_KINDS as readonly string[]).includes(this.str('kind')) ? this.str('kind') : 'mouse';
      const btn = make('button', 'usa-kit usa-cue');
      btn.type = 'button';
      btn.setAttribute('aria-label', this.str('label', 'Scroll down'));
      const art = make('span', `usa-cue-${kind}`);
      art.setAttribute('aria-hidden', 'true');
      if (kind === 'chevron') art.append(make('i'), make('i'));
      btn.append(art);
      const caption = this.str('text');
      if (caption) btn.append(make('span', 'usa-cue-text', caption));
      this.append(btn);
      const after = Math.max(0, this.num('hide-after', 40));
      const check = () => {
        const gone = window.scrollY > after;
        if (gone === this._gone) return;
        this._gone = gone;
        btn.toggleAttribute('data-hidden', gone);
        btn.tabIndex = gone ? -1 : 0;
        this.emit(gone ? 'hide' : 'show');
      };
      this.listen(window, 'scroll', check, { passive: true });
      this.listen(btn, 'click', () => {
        const target = queryAttr(this.str('target') || null);
        const behavior: ScrollBehavior = this.reduced ? 'auto' : 'smooth';
        if (target) {
          target.scrollIntoView({ behavior, block: 'start' });
          if (!target.hasAttribute('tabindex') && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(target.tagName)) target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
        } else window.scrollBy({ top: window.innerHeight * 0.9, behavior });
      });
      this.onCleanup(() => {
        btn.remove();
        this._gone = false;
      });
      btn.toggleAttribute('data-static', this.reduced);
      check();
    }
  }, { id: 'page-kit', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
