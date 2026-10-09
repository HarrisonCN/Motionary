import { defineElement, type UsaElement } from '../base';
import { PALETTES, meshGradient } from '../fx2/genart';
import css from './bg-generator.css?raw';

/**
 * `<usa-bg-generator>` (9.3) — a background generator: pick a palette,
 * a style (`mesh` gradient, `grain` mesh, `stripes`, `dots`) and a seed
 * (shuffle button), see it live with a cross-fade, and copy the CSS
 * (`background: …`). `palette`, `style`, `seed`; `css` property,
 * `shuffle()`, `copy()`; `usa:change` { css, seed }. A labelled `group`
 * of real form controls; reduced motion: no cross-fade.
 */
export interface UsaBgGeneratorElement extends UsaElement {
  readonly css: string;
  shuffle(): void;
  copy(): Promise<boolean>;
}
const STYLES = ['mesh', 'grain', 'stripes', 'dots'];
const GRAIN = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.4'/%3E%3C/svg%3E\")";

/** The CSS background for a generator state (9.3). */
export function backgroundCss(style: string, seed: number, palette: string): string {
  const pal = PALETTES[palette] || PALETTES.sunset;
  if (style === 'stripes') return `repeating-linear-gradient(${(seed * 37) % 180}deg, ${pal[0]} 0 14px, ${pal[1]} 14px 28px, ${pal[2]} 28px 42px)`;
  if (style === 'dots') return `radial-gradient(${pal[1]} 22%, transparent 24%) 0 0 / 22px 22px, radial-gradient(${pal[2]} 22%, transparent 24%) 11px 11px / 22px 22px, ${pal[0]}`;
  if (style === 'grain') return `${GRAIN}, ${meshGradient(seed, palette)}`;
  return meshGradient(seed, palette);
}

export function defineBgGenerator(tag = 'usa-bg-generator'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaBgGenerator extends Base {
        static get observedAttributes(): string[] {
          return ['label'];
        }
        private _st = { palette: 'sunset', style: 'mesh', seed: 1 };
        get css(): string {
          return `background: ${backgroundCss(this._st.style, this._st.seed, this._st.palette)};`;
        }
        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          this._st = { palette: PALETTES[this.str('palette')] ? this.str('palette') : 'sunset', style: STYLES.includes(this.str('style')) ? this.str('style') : 'mesh', seed: this.num('seed', 1) };
          this.setAttribute('role', 'group');
          this.setAttribute('aria-label', this.str('label', 'Background generator'));
          const opt = (l: string[], v: string) => l.map((x) => `<option${x === v ? ' selected' : ''}>${x}</option>`).join('');
          this.insertAdjacentHTML(
            'beforeend',
            `<div class="usa-bg-preview" aria-hidden="true" data-usa-part></div><div class="usa-bg-controls" data-usa-part><label>Palette <select data-k="palette">${opt(Object.keys(PALETTES), this._st.palette)}</select></label><label>Style <select data-k="style">${opt(STYLES, this._st.style)}</select></label><button type="button" class="usa-bg-shuffle">Shuffle</button><button type="button" class="usa-bg-copy">Copy CSS</button></div><code class="usa-bg-code" data-usa-part></code>`
          );
          this.listen(this, 'change', (e: Event) => {
            const s = e.target as HTMLSelectElement;
            if (s.dataset?.k === 'palette' || s.dataset?.k === 'style') {
              (this._st as any)[s.dataset.k] = s.value;
              this.render(true);
            }
          });
          this.listen(this, 'click', (e: Event) => {
            const t = e.target as Element;
            if (t.closest?.('.usa-bg-shuffle')) this.shuffle();
            if (t.closest?.('.usa-bg-copy')) void this.copy();
          });
          this.render(false);
        }
        private render(user: boolean): void {
          const p = this.querySelector<HTMLElement>('.usa-bg-preview');
          const bg = backgroundCss(this._st.style, this._st.seed, this._st.palette);
          if (p) {
            p.style.background = bg;
            if (user && !this.reduced) this.motion(p, [{ opacity: 0.4, filter: 'blur(6px)' }, { opacity: 1, filter: 'none' }], { duration: 450, easing: 'ease-out' });
          }
          const c = this.querySelector('.usa-bg-code');
          if (c) c.textContent = this.css;
          if (user) this.emit('change', { css: this.css, seed: this._st.seed });
        }
        shuffle(): void {
          this._st.seed = 1 + Math.floor(Math.random() * 9999);
          this.render(true);
        }
        async copy(): Promise<boolean> {
          let ok = false;
          try {
            await navigator.clipboard.writeText(this.css);
            ok = true;
          } catch {
            ok = false;
          }
          const b = this.querySelector('.usa-bg-copy');
          if (b) {
            b.textContent = ok ? 'Copied ✓' : 'Copy failed';
            setTimeout(() => (b.textContent = 'Copy CSS'), 1500);
          }
          return ok;
        }
      }
      return UsaBgGenerator as unknown as CustomElementConstructor;
    },
    { id: 'bg-generator', text: css }
  );
}
