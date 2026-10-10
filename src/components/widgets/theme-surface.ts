import { defineElement, type UsaElement } from '../base';
import { SURFACE_THEMES } from '../fx2/themefx';
import css from './theme-surface.css?raw';

/**
 * `<usa-theme-surface>` (8.6) — a themeable card for the 8.6 theme system. It
 * follows the nearest `data-usa-surface` (set by `<usa-theme-switcher>` or
 * `applySurfaceTheme()`), or its own `theme` attribute: light, dark, neon (glowing
 * edge that pulses), glass (frosted backdrop with a moving sheen) and neu
 * (soft neumorphic relief that presses on click). When the theme changes
 * the surface cross-fades into the new look. `theme` property is the
 * resolved theme; `usa:theme` { theme } on change. Reduced motion: the look
 * changes without animation.
 */
export interface UsaThemeSurfaceElement extends UsaElement {
  readonly theme: string;
}

export function defineThemeSurface(tag = 'usa-theme-surface'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaThemeSurface extends Base {
        static get observedAttributes(): string[] {
          return ['theme'];
        }
        private _t = '';
        private _mo: MutationObserver | null = null;
        get theme(): string {
          return this._t;
        }
        private resolve(): string {
          const own = this.str('theme');
          const near = own || this.parentElement?.closest('[data-usa-surface]')?.getAttribute('data-usa-surface') || document.documentElement.getAttribute('data-usa-surface') || 'light';
          return (SURFACE_THEMES as readonly string[]).includes(near) ? near : 'light';
        }
        private sync(): void {
          const t = this.resolve();
          if (t === this._t) return;
          const first = !this._t;
          this._t = t;
          this.setAttribute('data-look', t);
          if (first) return;
          if (!this.reduced) this.motion(this, [{ opacity: 0.4, transform: 'scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' });
          this.emit('theme', { theme: t });
        }
        mount(): void {
          this.sync();
          if (typeof MutationObserver !== 'undefined') {
            this._mo?.disconnect();
            this._mo = new MutationObserver(() => this.sync());
            for (let n: Element | null = this.parentElement; n; n = n.parentElement) this._mo.observe(n, { attributes: true, attributeFilter: ['data-usa-surface'] });
            this.onCleanup(() => this._mo?.disconnect());
          }
          // contract-exempt: keyboard-click-only — pointer-driven surface decoration, no action
          this.listen(this, 'pointerdown', () => {
            if (this._t === 'neu' && !this.reduced) this.motion(this, [{ transform: 'scale(1)' }, { transform: 'scale(.98)', offset: 0.4 }, { transform: 'scale(1)' }], { duration: 300 });
          });
        }
        changed(): void {
          this.sync();
        }
      }
      return UsaThemeSurface as unknown as CustomElementConstructor;
    },
    { id: 'theme-surface', text: css }
  );
}
