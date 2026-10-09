import { defineElement, type UsaElement } from '../base';
import css from './suggestion-chips.css?raw';

/**
 * `<usa-suggestion-chips>` (7.8) — follow-up prompt chips for AI chats:
 * `items="Summarise|Translate|Explain like I'm 5"` (or child `<button>`s /
 * text lines). The chips slide in one after another when they appear (and
 * again after `setItems()`); picking one pulses it, emits `usa:pick`
 * { text, index } and, with `dismiss`, the others fade away. A labelled list
 * of real buttons, arrow keys move between them; reduced motion: no slide or
 * pulse.
 */
export interface UsaSuggestionChipsElement extends UsaElement {
  items: string[];
  setItems(items: string[]): void;
}

/** "a | b|c" → ["a", "b", "c"] (7.8). */
export function parseChips(s: string): string[] {
  return s
    .split(/\||\n/)
    .map((t) => t.trim())
    .filter(Boolean);
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);

export function defineSuggestionChips(tag = 'usa-suggestion-chips'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaSuggestionChips extends Base {
        static get observedAttributes(): string[] {
          return ['items', 'label', 'dismiss'];
        }
        private _items: string[] | null = null;
        get items(): string[] {
          if (this._items) return this._items.slice();
          const attr = this.str('items');
          if (attr) return parseChips(attr);
          const kids = Array.from(this.children).filter((c) => !c.hasAttribute('data-usa-part'));
          return kids.length ? kids.map((c) => (c.textContent || '').trim()).filter(Boolean) : parseChips(this.getAttribute('data-text') || '');
        }
        set items(v: string[]) {
          this.setItems(v);
        }
        setItems(items: string[]): void {
          this._items = items.map(String).filter((t) => t.trim());
          this.mount();
        }
        mount(): void {
          const items = this.items;
          if (!this._items && !this.str('items')) {
            // keep authored content as the source of truth, hidden
            Array.from(this.children).forEach((c) => !c.hasAttribute('data-usa-part') && (c as HTMLElement).setAttribute('hidden', ''));
          }
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          this.insertAdjacentHTML(
            'beforeend',
            `<div class="usa-sc" role="list" aria-label="${esc(this.str('label', 'Suggestions'))}" data-usa-part>${items.map((t, i) => `<span role="listitem"><button type="button" class="usa-sc-chip" data-i="${i}">${esc(t)}</button></span>`).join('')}</div>`
          );
          const chips = Array.from(this.querySelectorAll<HTMLButtonElement>('.usa-sc-chip'));
          chips.forEach((c, i) => {
            this.listen(c, 'click', () => this.pick(i));
            this.listen(c, 'keydown', (e: KeyboardEvent) => {
              const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
              if (!d) return;
              e.preventDefault();
              chips[(i + d + chips.length) % chips.length].focus();
            });
          });
          this.inView((v) => v && this.enter(), { threshold: 0.2 });
        }
        private _entered = false;
        private enter(): void {
          if (this._entered && !this._items) return;
          this._entered = true;
          if (this.reduced) return;
          this.querySelectorAll('.usa-sc-chip').forEach((c, i) => this.motion(c, [{ opacity: 0, transform: 'translateY(10px) scale(.92)' }, { opacity: 1, transform: 'none' }], { duration: 380, delay: i * 70, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' }));
        }
        private pick(i: number): void {
          const chips = Array.from(this.querySelectorAll<HTMLButtonElement>('.usa-sc-chip'));
          const c = chips[i];
          if (!c) return;
          chips.forEach((x) => x.toggleAttribute('data-picked', x === c));
          if (!this.reduced) this.motion(c, [{ transform: 'none' }, { transform: 'scale(1.1)' }, { transform: 'none' }], { duration: 280, easing: 'ease-out' });
          if (this.flag('dismiss'))
            chips.forEach((x) => {
              if (x === c) return;
              x.setAttribute('data-gone', '');
              x.disabled = true;
            });
          this.emit('pick', { text: c.textContent, index: i });
        }
      }
      return UsaSuggestionChips as unknown as CustomElementConstructor;
    },
    { id: 'suggestion-chips', text: css }
  );
}
