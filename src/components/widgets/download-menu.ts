import { defineElement } from '../base';
import { defineMoName } from './mo-name';
import css from './download-menu.css?raw';

/** A download picker. The author supplies a details element with a summary and download links. */
export function defineDownloadMenu(tag = 'usa-download-menu'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class extends Base {
    mount(): void {
      const openMenu = () => this.querySelector<HTMLDetailsElement>(':scope > details[open]');
      this.listen(this, 'keydown', (event: KeyboardEvent) => {
        const disclosure = openMenu();
        if (event.key === 'Escape' && disclosure) {
          event.preventDefault();
          disclosure.open = false;
          disclosure.querySelector('summary')?.focus();
        }
      });
      this.listen(this.ownerDocument, 'pointerdown', (event: Event) => {
        const disclosure = openMenu();
        if (disclosure && !event.composedPath().includes(this)) disclosure.open = false;
      });
      this.listen(this, 'click', (event: MouseEvent) => {
        const disclosure = openMenu();
        const link = event.target instanceof Element && event.target.closest('a[href]');
        if (disclosure && link && disclosure.contains(link)) {
          disclosure.open = false;
          disclosure.querySelector('summary')?.focus();
        }
      });
    }
  }, { id: 'download-menu', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
