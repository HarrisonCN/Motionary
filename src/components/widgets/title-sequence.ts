import { defineElement } from '../base';
import { defineMoName } from './mo-name';
import css from './title-sequence.css?raw';

/** Film intertitles. Put a heading in each details/summary and use its body for the credits. */
export function defineTitleSequence(tag = 'usa-title-sequence'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class extends Base {
    mount(): void {
      this.listen(this, 'toggle', (event: Event) => {
        const card = event.target;
        if (!(card instanceof HTMLDetailsElement) || !card.open || card.parentElement !== this) return;
        for (const sibling of this.querySelectorAll<HTMLDetailsElement>(':scope > details[open]')) {
          if (sibling !== card) sibling.open = false;
        }
        if (!this.reduced) for (const panel of Array.from(card.children)) {
          if (panel.tagName !== 'SUMMARY') this.motion(panel, [{ clipPath: 'circle(0%)' }, { clipPath: 'circle(75%)' }], { duration: 420, easing: 'ease-out' });
        }
      }, { capture: true });
    }
  }, { id: 'title-sequence', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
