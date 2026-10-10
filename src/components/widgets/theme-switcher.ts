import { defineElement, type UsaElement } from '../base';
import { SURFACE_THEMES, applySurfaceTheme } from '../fx2/themefx';
import css from './theme-switcher.css?raw';

/**
 * `<usa-theme-switcher themes="light,dark,neon,glass,neu" target="#app">`
 * (8.6) — a segmented theme switcher for the 8.6 theme system: picking a
 * theme sets `data-usa-surface` on the `target` (default `<html>`), a pill
 * slides under the active option and the page change is revealed with a
 * circular wipe from the click point (View Transitions when supported).
 * `value`, `persist` (localStorage key); `usa:change` { theme }. A
 * `radiogroup` of `radio`s with arrow keys; reduced motion: instant.
 */
export interface UsaThemeSwitcherElement extends UsaElement {
  value: string;
}

const NAMES: Record<string, string> = { light: 'Light', dark: 'Dark', neon: 'Neon', glass: 'Glass', neu: 'Soft' };

export function defineThemeSwitcher(tag = 'usa-theme-switcher'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaThemeSwitcher extends Base {
        static get observedAttributes(): string[] {
          return ['themes', 'target', 'label', 'persist', 'value'];
        }
        private _v = '';
        private list(): string[] {
          const l = this.str('themes').split(',').map((s) => s.trim()).filter((s) => (SURFACE_THEMES as readonly string[]).includes(s));
          return l.length ? l : [...SURFACE_THEMES];
        }
        private tgt(): Element | null {
          const s = this.str('target');
          return s ? document.querySelector(s) : document.documentElement;
        }
        get value(): string {
          return this._v;
        }
        set value(t: string) {
          this.select(t, false);
        }
        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          const l = this.list();
          this.setAttribute('role', 'radiogroup');
          this.setAttribute('aria-label', this.str('label', 'Theme'));
          let saved = '';
          try {
            saved = this.hasAttribute('persist') ? localStorage.getItem(this.str('persist') || 'usa-theme') || '' : '';
          } catch {
            /* storage blocked */
          }
          const start = l.includes(saved) ? saved : l.includes(this.str('value')) ? this.str('value') : l.includes(this.tgt()?.getAttribute('data-usa-surface') || '') ? (this.tgt()?.getAttribute('data-usa-surface') as string) : l[0];
          this.insertAdjacentHTML('beforeend', `<span class="usa-ts-pill" aria-hidden="true" data-usa-part></span>` + l.map((t) => `<button type="button" role="radio" class="usa-ts-opt" data-theme="${t}" data-usa-part><i class="usa-ts-sw" data-sw="${t}" aria-hidden="true"></i>${NAMES[t]}</button>`).join(''));
          this.listen(this, 'click', (e: MouseEvent) => {
            const b = (e.target as Element).closest?.('.usa-ts-opt') as HTMLElement | null;
            if (b) this.select(b.dataset.theme as string, true, e);
          });
          this.listen(this, 'keydown', (e: KeyboardEvent) => {
            const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
            if (!d) return;
            e.preventDefault();
            const ls = this.list();
            const n = ls[(ls.indexOf(this._v) + d + ls.length) % ls.length];
            this.select(n, true);
            (this.querySelector(`.usa-ts-opt[data-theme="${n}"]`) as HTMLElement | null)?.focus();
          });
          this._v = '';
          this.select(start, false);
        }
        private select(t: string, user: boolean, ev?: MouseEvent): void {
          if (!this.list().includes(t) || t === this._v) return;
          const prev = this._v;
          this._v = t;
          this.querySelectorAll<HTMLElement>('.usa-ts-opt').forEach((b) => {
            const on = b.dataset.theme === t;
            b.setAttribute('aria-checked', String(on));
            b.tabIndex = on ? 0 : -1;
          });
          const b = this.querySelector<HTMLElement>(`.usa-ts-opt[data-theme="${t}"]`);
          const pill = this.querySelector<HTMLElement>('.usa-ts-pill');
          if (b && pill) {
            pill.style.width = `${b.offsetWidth}px`;
            pill.style.transform = `translateX(${b.offsetLeft}px)`;
          }
          const apply = () => applySurfaceTheme(t, this.tgt());
          const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
          if (user && prev && !this.reduced && doc.startViewTransition && !this.str('target')) {
            const x = ev?.clientX ?? innerWidth / 2;
            const y = ev?.clientY ?? innerHeight / 2;
            const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
            try {
              doc.startViewTransition(apply).ready.then(() => document.documentElement.animate({ clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] }, { duration: 500, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' } as KeyframeAnimationOptions), () => undefined);
            } catch {
              apply();
            }
          } else apply();
          if (this.hasAttribute('persist'))
            try {
              localStorage.setItem(this.str('persist') || 'usa-theme', t);
            } catch {
              /* storage blocked */
            }
          if (user) this.emit('change', { theme: t });
        }
      }
      return UsaThemeSwitcher as unknown as CustomElementConstructor;
    },
    { id: 'theme-switcher', text: css }
  );
}
