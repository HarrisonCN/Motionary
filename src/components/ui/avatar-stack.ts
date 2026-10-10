import { defineElement, type UsaElement } from '../base';
import { adoptVariants } from './variants';
import css from './avatar-stack.css?raw';

/**
 * `<usa-avatar-stack>` — overlapping avatars (its children: `<img>` or any
 * element) that spread apart with a spring on hover / focus; extra ones
 * collapse into a "+N" chip.
 * Attributes: `max` (visible avatars, 5), `size` (px, 36), `overlap` (0–1,
 * 0.35), `label` (group name), `variant`. Reduced motion: no spreading.
 */
export interface UsaAvatarStackElement extends UsaElement {}

export function defineAvatarStack(tag = 'usa-avatar-stack'): CustomElementConstructor | undefined {
  adoptVariants();
  return defineElement(
    tag,
    (Base) =>
      class UsaAvatarStack extends Base {
        static get observedAttributes(): string[] {
          return ['max', 'size', 'overlap', 'label'];
        }
        mount(): void {
          this.querySelector(':scope > .usa-avatar-more')?.remove();
          const kids = Array.from(this.children) as HTMLElement[];
          const max = Math.max(1, this.num('max', 5));
          this.style.setProperty('--usa-avatar-size', `${this.num('size', 36)}px`);
          this.style.setProperty('--usa-avatar-overlap', String(this.num('overlap', 0.35)));
          this.setAttribute('role', 'group');
          this.setAttribute('aria-label', this.str('label', `${kids.length} people`));
          kids.forEach((k, i) => {
            k.classList.add('usa-avatar');
            k.hidden = i >= max;
            k.style.setProperty('--i', String(i));
            k.style.zIndex = String(kids.length - i);
          });
          if (kids.length > max) {
            const more = document.createElement('span');
            more.className = 'usa-avatar usa-avatar-more';
            more.textContent = `+${kids.length - max}`;
            more.style.setProperty('--i', String(max));
            more.setAttribute('aria-label', `and ${kids.length - max} more`);
            this.append(more);
          }
        }
      },
    { id: 'avatar-stack', text: css }
  );
}
