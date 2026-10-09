import { defineElement, type UsaElement } from '../base';
import css from './festival-banner.css?raw';

/**
 * `<usa-festival-banner theme="lunar">` (8.1) — a festive announcement
 * banner with an ambient scene behind its text: `lunar` (swaying lanterns,
 * drifting gold sparkles), `xmas` (falling snow, twinkling lights),
 * `halloween` (bats, a glowing moon), `fireworks` (bursting rockets). Its
 * own content is the message; `dismissible` adds a close button
 * (`usa:dismiss`). The decorations are `aria-hidden`, the banner is a
 * labelled `region`; the scene only animates while on screen and is static
 * under reduced motion.
 */
export interface UsaFestivalBannerElement extends UsaElement {
  theme: string;
  dismiss(): void;
}

export const FESTIVAL_THEMES = ['lunar', 'xmas', 'halloween', 'fireworks'] as const;

const SCENES: Record<string, (i: number) => string> = {
  lunar: (i) => (i < 4 ? `<i class="usa-fb-lantern" style="--x:${8 + i * 26}%;--d:${i * -0.6}s"></i>` : `<i class="usa-fb-spark" style="--x:${(i * 37) % 100}%;--d:${(i * -0.7) % 4}s"></i>`),
  xmas: (i) => (i < 7 ? `<i class="usa-fb-light" style="--x:${6 + i * 14.5}%;--d:${i * -0.3}s"></i>` : `<i class="usa-fb-snow" style="--x:${(i * 29) % 100}%;--d:${(i * -0.9) % 6}s"></i>`),
  halloween: (i) => (i === 0 ? '<i class="usa-fb-moon"></i>' : i < 5 ? `<i class="usa-fb-bat" style="--y:${10 + i * 12}%;--d:${i * -1.4}s">🦇</i>` : ''),
  fireworks: (i) => (i < 4 ? `<i class="usa-fb-rocket" style="--x:${12 + i * 25}%;--d:${i * -0.7}s;--c:${['#f43f5e', '#facc15', '#22d3ee', '#a855f7'][i]}"></i>` : ''),
};

export function defineFestivalBanner(tag = 'usa-festival-banner'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaFestivalBanner extends Base {
        static get observedAttributes(): string[] {
          return ['theme', 'label', 'dismissible'];
        }
        get theme(): string {
          const t = this.str('theme', 'lunar');
          return (FESTIVAL_THEMES as readonly string[]).includes(t) ? t : 'lunar';
        }
        set theme(t: string) {
          this.setAttribute('theme', t);
        }
        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          this.setAttribute('role', 'region');
          this.setAttribute('aria-label', this.str('label', 'Announcement'));
          this.setAttribute('data-theme', this.theme);
          const scene = Array.from({ length: 16 }, (_, i) => SCENES[this.theme](i)).join('');
          this.insertAdjacentHTML('afterbegin', `<span class="usa-fb-scene" aria-hidden="true" data-usa-part>${scene}</span>`);
          if (this.flag('dismissible')) {
            this.insertAdjacentHTML('beforeend', '<button type="button" class="usa-fb-x" aria-label="Dismiss" data-usa-part>×</button>');
            this.listen(this.querySelector('.usa-fb-x') as Element, 'click', () => this.dismiss());
          }
          this.inView((v) => this.setFlag('data-live', v && !this.reduced));
        }
        dismiss(): void {
          const done = () => {
            this.hidden = true;
            this.emit('dismiss');
          };
          const a = this.reduced ? null : this.motion(this, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-8px)' }], { duration: 220, easing: 'ease-in' });
          if (a) a.finished.then(done, done);
          else done();
        }
      }
      return UsaFestivalBanner as unknown as CustomElementConstructor;
    },
    { id: 'festival-banner', text: css }
  );
}
