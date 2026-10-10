import { defineElement, type UsaElement } from '../base';
import css from './retro-button.css?raw';

/**
 * `<usa-retro-button variant="pixel">Start</usa-retro-button>` (8.2) —
 * retro-styled buttons with era-true press motion: `pixel` (8-bit, hard
 * stepped press and a pixel shadow), `crt` (phosphor glow that flickers on
 * press), `y2k` (glossy chrome pill that bounces) and `win95` (bevelled
 * grey box that sinks). The content becomes the label of a real `<button>`
 * (`type`, `disabled`, `name`, `value` are passed on). Reduced motion: no
 * flicker or bounce — only the pressed colours.
 */
export interface UsaRetroButtonElement extends UsaElement {
  readonly button: HTMLButtonElement | null;
  variant: string;
}

export const RETRO_VARIANTS = ['pixel', 'crt', 'y2k', 'win95'] as const;

export function defineRetroButton(tag = 'usa-retro-button'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaRetroButton extends Base {
        static get observedAttributes(): string[] {
          return ['variant', 'disabled', 'type'];
        }
        get button(): HTMLButtonElement | null {
          return this.querySelector('.usa-rb');
        }
        get variant(): string {
          const v = this.str('variant', 'pixel');
          return (RETRO_VARIANTS as readonly string[]).includes(v) ? v : 'pixel';
        }
        set variant(v: string) {
          this.setAttribute('variant', v);
        }
        mount(): void {
          let btn = this.button;
          if (!btn) {
            btn = document.createElement('button');
            btn.className = 'usa-rb';
            btn.setAttribute('data-usa-part', '');
            while (this.firstChild) btn.appendChild(this.firstChild);
            this.appendChild(btn);
          }
          btn.type = (this.str('type', 'button') as 'button' | 'submit' | 'reset') || 'button';
          btn.disabled = this.flag('disabled');
          for (const a of ['name', 'value']) if (this.hasAttribute(a)) btn.setAttribute(a, this.str(a));
          this.setAttribute('data-variant', this.variant);
          const b = btn;
          this.listen(b, 'pointerdown', () => this.press(b));
          this.listen(b, 'keydown', (e: KeyboardEvent) => (e.key === 'Enter' || e.key === ' ') && !e.repeat && this.press(b));
        }
        private press(b: HTMLElement): void {
          if (this.reduced || b.hasAttribute('disabled')) return;
          const v = this.variant;
          if (v === 'pixel') this.motion(b, [{ transform: 'none' }, { transform: 'translate(3px,3px)' }, { transform: 'translate(3px,3px)', offset: 0.6 }, { transform: 'none' }], { duration: 260, easing: 'steps(3, end)' });
          else if (v === 'crt') this.motion(b, [{ filter: 'brightness(1)' }, { filter: 'brightness(1.8)' }, { filter: 'brightness(.7)' }, { filter: 'brightness(1.4)' }, { filter: 'brightness(1)' }], { duration: 300, easing: 'steps(4, end)' });
          else if (v === 'y2k') this.motion(b, [{ transform: 'scale(1)' }, { transform: 'scale(.92)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: 420, easing: 'cubic-bezier(.3,1.5,.5,1)' });
          else this.motion(b, [{ transform: 'none' }, { transform: 'translate(1px,1px)' }, { transform: 'none' }], { duration: 180 });
        }
      }
      return UsaRetroButton as unknown as CustomElementConstructor;
    },
    { id: 'retro-button', text: css }
  );
}
