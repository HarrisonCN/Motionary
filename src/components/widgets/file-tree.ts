import { defineElement } from '../base';
import { defineMoName } from './mo-name';
import css from './file-tree.css?raw';

/** A nested file index. Use native details/summary for folders and links for files. */
export function defineFileTree(tag = 'usa-file-tree'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class extends Base {
    mount(): void {
      this.listen(this, 'keydown', (event: KeyboardEvent) => {
        const item = event.target;
        if (!(item instanceof HTMLElement) || !item.matches('summary, a[href]') ||
            item.closest(this.localName) !== this || event.altKey || event.ctrlKey || event.metaKey) return;
        const folder = item.closest('details');
        if (!folder || !this.contains(folder)) return;
        if (event.key === 'ArrowRight' && item.tagName === 'SUMMARY') {
          event.preventDefault();
          if (!folder.open) folder.open = true;
          else folder.querySelector<HTMLElement>(':scope > :not(summary) :is(summary,a[href]), :scope > a[href]')?.focus();
        } else if (event.key === 'ArrowLeft') {
          event.preventDefault();
          if (item.tagName === 'SUMMARY' && folder.open) folder.open = false;
          else {
            const parent = item.tagName === 'SUMMARY' ? folder.parentElement?.closest('details') : folder;
            if (parent && this.contains(parent)) parent.querySelector<HTMLElement>(':scope > summary')?.focus();
          }
        }
      });
    }
  }, { id: 'file-tree', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
