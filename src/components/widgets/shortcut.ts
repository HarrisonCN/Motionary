import { defineElement, type UsaElement } from '../base';
import { keyLabels, matchesKeys } from './command-palette';
import css from './shortcut.css?raw';

/**
 * `<usa-shortcut keys="mod+k">` (7.9) — a keyboard-shortcut hint rendered
 * as keycaps (⌘ on Apple platforms, Ctrl elsewhere). When the user presses
 * the combination anywhere on the page the caps press down one after another
 * and `usa:trigger` fires (`listen="false"` to only display it; `for="id"`
 * clicks that element). Optional `label` text after the caps. The caps are
 * `<kbd>` with an accessible text like "Control K"; reduced motion: no
 * press animation.
 */
export interface UsaShortcutElement extends UsaElement {
  readonly labels: string[];
  press(): void;
}

const SPOKEN: Record<string, string> = { '⌘': 'Command', '⇧': 'Shift', '⌥': 'Option', '⌃': 'Control', Ctrl: 'Control', '↵': 'Enter', '⇥': 'Tab', '⌫': 'Backspace' };
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);

export function defineShortcut(tag = 'usa-shortcut'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaShortcut extends Base {
        static get observedAttributes(): string[] {
          return ['keys', 'label', 'listen', 'for'];
        }
        get labels(): string[] {
          return keyLabels(this.str('keys', 'mod+k'));
        }
        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          const labels = this.labels;
          const spoken = labels.map((l) => SPOKEN[l] || l).join(' ');
          const text = this.str('label');
          this.insertAdjacentHTML(
            'beforeend',
            `<span class="usa-sk" data-usa-part><span class="usa-sk-caps" role="img" aria-label="${esc(spoken)}">${labels.map((l) => `<kbd aria-hidden="true">${esc(l)}</kbd>`).join('')}</span>${text ? `<span class="usa-sk-label">${esc(text)}</span>` : ''}</span>`
          );
          if (this.str('listen') !== 'false')
            this.listen(document, 'keydown', (e: KeyboardEvent) => {
              if (!e.repeat && matchesKeys(e, this.str('keys', 'mod+k'))) {
                this.press();
                const id = this.str('for');
                const target = id ? document.getElementById(id) : null;
                if (target) {
                  e.preventDefault();
                  target.click();
                }
              }
            });
        }
        /** Animate the caps as if pressed and emit `usa:trigger`. */
        press(): void {
          const caps = Array.from(this.querySelectorAll('kbd'));
          this.setAttribute('data-pressed', '');
          const off = () => this.removeAttribute('data-pressed');
          if (!this.reduced) {
            const runs = caps.map((k, i) => this.motion(k, [{ transform: 'none' }, { transform: 'translateY(2px) scale(.94)', borderBottomWidth: '1px' }, { transform: 'none' }], { duration: 260, delay: i * 50, easing: 'ease-out' }));
            const last = runs[runs.length - 1];
            if (last) last.finished.then(off, off);
            else off();
          } else off();
          this.emit('trigger', { keys: this.str('keys', 'mod+k') });
        }
      }
      return UsaShortcut as unknown as CustomElementConstructor;
    },
    { id: 'shortcut', text: css }
  );
}
