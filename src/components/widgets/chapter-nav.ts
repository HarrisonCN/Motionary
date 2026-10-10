import { defineElement, type UsaElement, queryAttr } from '../base';
import css from './chapter-nav.css?raw';

/**
 * `<usa-chapter-nav for="#story">` (9.1) — chapter navigation for long-form
 * stories: one entry per `[data-chapter]` section (title from
 * `data-chapter`, else its first heading) inside the `for` container (or
 * the document), each with a progress bar that fills as you read that
 * chapter; the current chapter gets `aria-current="step"`, clicking one
 * scrolls smoothly to it. `orientation` horizontal (default) | vertical.
 * `current` index, `goTo(i)`; `usa:chapter` { index, title } on change.
 * A labelled `navigation`; reduced motion: instant jumps.
 */
export interface UsaChapterNavElement extends UsaElement {
  readonly current: number;
  goTo(i: number): void;
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);

export function defineChapterNav(tag = 'usa-chapter-nav'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaChapterNav extends Base {
        static get observedAttributes(): string[] {
          return ['for', 'orientation', 'label'];
        }
        private _cur = -1;
        private _secs: HTMLElement[] = [];
        get current(): number {
          return this._cur;
        }
        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          const root: ParentNode = queryAttr(this.str('for')) || document;
          this._secs = Array.from(root.querySelectorAll<HTMLElement>('[data-chapter]'));
          this.setAttribute('role', 'navigation');
          this.setAttribute('aria-label', this.str('label', 'Chapters'));
          this.setAttribute('data-orientation', this.str('orientation') === 'vertical' ? 'vertical' : 'horizontal');
          const title = (s: HTMLElement, i: number) => s.dataset.chapter || s.querySelector('h1,h2,h3,h4')?.textContent?.trim() || `Chapter ${i + 1}`;
          this.insertAdjacentHTML('beforeend', `<ol class="usa-cn-list" data-usa-part>${this._secs.map((s, i) => `<li><button type="button" class="usa-cn-item" data-i="${i}"><span class="usa-cn-num">${i + 1}</span><span class="usa-cn-title">${esc(title(s, i))}</span><span class="usa-cn-bar" aria-hidden="true"><i></i></span></button></li>`).join('')}</ol>`);
          this.listen(this, 'click', (e: Event) => {
            const b = (e.target as Element).closest?.('.usa-cn-item') as HTMLElement | null;
            if (b) this.goTo(Number(b.dataset.i));
          });
          const update = () => {
            const vh = innerHeight || 1;
            let cur = 0;
            this._secs.forEach((s, i) => {
              const r = s.getBoundingClientRect();
              const p = r.height ? Math.min(1, Math.max(0, (vh * 0.35 - r.top) / r.height)) : 0;
              (this.querySelector(`.usa-cn-item[data-i="${i}"] .usa-cn-bar i`) as HTMLElement | null)?.style.setProperty('--p', String(Math.round(p * 1000) / 1000));
              if (r.top <= vh * 0.35) cur = i;
            });
            this.setCurrent(cur);
          };
          this.listen(window, 'scroll', update, { passive: true });
          this.listen(window, 'resize', update);
          update();
        }
        private setCurrent(i: number): void {
          if (i === this._cur || !this._secs.length) return;
          this._cur = i;
          this.querySelectorAll('.usa-cn-item').forEach((b, k) => {
            if (k === i) b.setAttribute('aria-current', 'step');
            else b.removeAttribute('aria-current');
          });
          const s = this._secs[i];
          this.emit('chapter', { index: i, title: (this.querySelector(`.usa-cn-item[data-i="${i}"] .usa-cn-title`) as HTMLElement | null)?.textContent || '' });
          if (s && !this.reduced) {
            const b = this.querySelector(`.usa-cn-item[data-i="${i}"] .usa-cn-num`);
            if (b) this.motion(b, [{ transform: 'scale(1)' }, { transform: 'scale(1.25)', offset: 0.4 }, { transform: 'scale(1)' }], { duration: 380, easing: 'cubic-bezier(.3,1.4,.5,1)' });
          }
        }
        goTo(i: number): void {
          const s = this._secs[i];
          if (!s) return;
          s.scrollIntoView?.({ behavior: this.reduced ? 'auto' : 'smooth', block: 'start' });
          this.setCurrent(i);
        }
      }
      return UsaChapterNav as unknown as CustomElementConstructor;
    },
    { id: 'chapter-nav', text: css }
  );
}
