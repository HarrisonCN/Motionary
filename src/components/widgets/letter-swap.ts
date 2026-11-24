import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import css from './motion-kit-12.css?raw';

/**
 * Hover text where every letter rolls out of view and a copy rolls in behind it, one after another — for links,
 * buttons and menu items. It works on its first child element (a link or button) or on its own text. Only plain text is
 * split; the visible letters are hidden from assistive technology and the whole word is kept for it in one piece, so
 * the link still reads "Pricing". Keyboard focus plays it too. Under reduced motion the text simply stays.
 *
 * Attributes: `stagger` (ms between letters; 0–120; 24), `direction` (up | down; up).
 */
export interface UsaLetterSwapElement extends UsaElement {}

export function defineLetterSwap(tag = 'usa-letter-swap'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class LetterSwap extends Base {
    static get observedAttributes(): string[] { return ['stagger', 'direction']; }
    mount(): void {
      const target = (this.firstElementChild as HTMLElement | null) && !(this.firstElementChild as HTMLElement).classList.contains('usa-kit')
        ? this.firstElementChild as HTMLElement
        : this;
      if (target.children.length && target !== this) return;
      if (target === this && this.children.length) return;
      const text = target.textContent || '';
      if (!text.trim() || this.reduced) return;
      const original = Array.from(target.childNodes);
      const wrap = make('span', 'usa-kit usa-swap');
      wrap.dataset.dir = this.str('direction') === 'down' ? 'down' : 'up';
      wrap.style.setProperty('--stagger', `${Math.min(120, Math.max(0, this.num('stagger', 24)))}ms`);
      const sr = make('span', 'usa-kit-sr', text);
      const vis = make('span', 'usa-swap-letters');
      vis.setAttribute('aria-hidden', 'true');
      Array.from(text).forEach((ch, i) => {
        const cell = make('span', 'usa-swap-cell');
        cell.style.setProperty('--i', String(i));
        const glyph = ch === ' ' ? ' ' : ch;
        cell.append(make('span', 'usa-swap-a', glyph), make('span', 'usa-swap-b', glyph));
        vis.append(cell);
      });
      wrap.append(sr, vis);
      for (const n of original) n.remove();
      target.append(wrap);
      this.onCleanup(() => { wrap.remove(); target.append(...original); });
    }
  }, { id: 'motion-kit-12', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
