import { defineElement } from '../base';
import css from './download-menu.css?raw';

/** A download picker. The author supplies a details element with a summary and download links. */
export function defineDownloadMenu(tag = 'usa-download-menu'): CustomElementConstructor | undefined {
  return defineElement(tag, Base => class extends Base {
    mount(): void {
      const disclosure = this.querySelector<HTMLDetailsElement>(':scope > details');
      if (!disclosure) return;
      this.listen(this, 'keydown', (event: KeyboardEvent) => {
        if (event.key === 'Escape' && disclosure.open) {
          event.preventDefault();
          disclosure.open = false;
          disclosure.querySelector('summary')?.focus();
        }
      });
      this.listen(this.ownerDocument, 'pointerdown', (event: Event) => {
        if (disclosure.open && !event.composedPath().includes(this)) disclosure.open = false;
      });
      this.listen(disclosure, 'click', (event: MouseEvent) => {
        if (event.target instanceof Element && event.target.closest('a[href]')) {
          disclosure.open = false;
          disclosure.querySelector('summary')?.focus();
        }
      });
    }
  }, { id: 'download-menu', text: css });
}
