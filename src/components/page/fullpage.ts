import { defineElement, type UsaElement } from '../base';
import { scrollToTarget } from './scroll';
import css from './fullpage.css?raw';

/**
 * `<usa-fullpage>` — full-screen sections (its element children) that snap
 * one at a time (CSS scroll snap), with keyboard paging (PageUp/PageDown,
 * arrows, Home/End), optional dot navigation and the current section in
 * `aria-current` + `usa:section`.
 * Attributes: `dots` (show the dot nav), `axis` (`y` default, `x`).
 * Methods: `go(i)`, `next()`, `prev()`. Reduced motion: snapping stays,
 * jumps are instant.
 */
export interface UsaFullpageElement extends UsaElement {
  readonly index: number;
  go(i: number): void;
  next(): void;
  prev(): void;
}

export function defineFullpage(tag = 'usa-fullpage'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaFullpage extends Base {
        private _i = 0;
        get index(): number {
          return this._i;
        }
        private sections(): HTMLElement[] {
          return (Array.from(this.children) as HTMLElement[]).filter((c) => !c.classList.contains('usa-fullpage-dots'));
        }

        mount(): void {
          if (!this.hasAttribute('tabindex')) this.tabIndex = 0;
          const secs = this.sections();
          secs.forEach((s, i) => {
            s.classList.add('usa-fullpage-section');
            s.setAttribute('data-index', String(i));
          });
          let nav: HTMLElement | null = null;
          if (this.flag('dots')) {
            nav = document.createElement('nav');
            nav.className = 'usa-fullpage-dots';
            nav.setAttribute('aria-label', 'Sections');
            secs.forEach((s, i) => {
              const b = document.createElement('button');
              b.type = 'button';
              b.setAttribute('aria-label', s.getAttribute('aria-label') || s.querySelector('h1,h2,h3')?.textContent?.trim() || `Section ${i + 1}`);
              b.addEventListener('click', () => this.go(i));
              nav!.append(b);
            });
            this.append(nav);
            this.onCleanup(() => nav?.remove());
          }
          this.mark(0);
          if (typeof IntersectionObserver !== 'undefined') {
            const io = new IntersectionObserver(
              (entries) => {
                for (const e of entries) if (e.isIntersecting && e.intersectionRatio >= 0.6) this.mark(Number((e.target as HTMLElement).dataset.index));
              },
              { root: this, threshold: [0.6] }
            );
            secs.forEach((s) => io.observe(s));
            this.onCleanup(() => io.disconnect());
          }
          this.listen(this, 'keydown', (e: KeyboardEvent) => {
            const n = this.sections().length;
            const map: Record<string, number> = { PageDown: this._i + 1, ArrowDown: this._i + 1, ' ': this._i + 1, PageUp: this._i - 1, ArrowUp: this._i - 1, Home: 0, End: n - 1 };
            if (this.str('axis') === 'x') Object.assign(map, { ArrowRight: this._i + 1, ArrowLeft: this._i - 1 });
            if (!(e.key in map) || (e.target as Element).closest?.('input, textarea, select')) return;
            e.preventDefault();
            this.go(map[e.key]);
          });
        }

        private mark(i: number): void {
          if (i === this._i && this.hasAttribute('data-ready')) return;
          this.setAttribute('data-ready', '');
          this._i = i;
          this.sections().forEach((s, j) => s.toggleAttribute('data-current', j === i));
          this.querySelectorAll('.usa-fullpage-dots button').forEach((b, j) => (j === i ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current')));
          this.emit('section', { index: i });
        }

        go(i: number): void {
          const secs = this.sections();
          const t = secs[Math.max(0, Math.min(secs.length - 1, i))];
          if (!t) return;
          if (this.str('axis') === 'x') this.scrollTo({ left: t.offsetLeft, behavior: this.reduced ? 'auto' : 'smooth' });
          else scrollToTarget(t.offsetTop, { target: this, preset: 'stiff' });
          this.mark(secs.indexOf(t));
        }
        next(): void {
          this.go(this._i + 1);
        }
        prev(): void {
          this.go(this._i - 1);
        }
      },
    { id: 'fullpage', text: css }
  );
}
