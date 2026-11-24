import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import css from './parts-kit.css?raw';

/**
 * Loads more as the reader reaches the end. When the bottom of the content comes within `root-margin` of the screen,
 * the element emits `usa:load` with the next page number and shows a spinner; the page appends the new items (to the
 * element, or to its first child list) and calls `done()`, or `end()` when there is nothing more. New items rise in one
 * after another. A real "Load more" button sits under the list for keyboards, for browsers without
 * IntersectionObserver and for `auto="false"`; a polite live region says when items were added and when the list ends.
 *
 * Attributes: `root-margin` (200px), `auto` (on unless "false"), `label` (Loading more), `button-label` (Load more),
 * `end-label` (You have reached the end), `stagger` (ms between new items; 40).
 * Events `usa:load` ({ page }), `usa:end`.
 */
export interface UsaInfiniteScrollElement extends UsaElement {
  readonly page: number;
  readonly loading: boolean;
  done(): void;
  end(): void;
  reset(): void;
}

export function defineInfiniteScroll(tag = 'usa-infinite-scroll'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class InfiniteScroll extends Base {
    static get observedAttributes(): string[] { return ['root-margin', 'auto', 'label', 'button-label', 'end-label', 'stagger']; }
    private _page = 1;
    private _state: 'idle' | 'loading' | 'end' = 'idle';
    private _api?: { done(): void; end(): void; reset(): void };
    get page(): number { return this._page; }
    get loading(): boolean { return this._state === 'loading'; }
    done(): void { this._api?.done(); }
    end(): void { this._api?.end(); }
    reset(): void { this._api?.reset(); }
    mount(): void {
      const list = (this.querySelector(':scope > ul, :scope > ol, :scope > [data-items]') as HTMLElement | null) ?? this;
      const foot = make('div', 'usa-kit usa-inf-foot');
      const sentinel = make('div', 'usa-inf-sentinel');
      sentinel.setAttribute('aria-hidden', 'true');
      const spin = make('span', 'usa-inf-spin');
      spin.setAttribute('aria-hidden', 'true');
      const more = make('button', 'usa-inf-more', this.str('button-label', 'Load more'));
      more.type = 'button';
      const live = make('p', 'usa-kit-sr');
      live.setAttribute('role', 'status');
      foot.append(spin, more, live);
      this.append(sentinel, foot);
      const ours = new Set<Node>([sentinel, foot]);
      const count = () => Array.from(list.children).filter((c) => !ours.has(c)).length;
      let before = count();
      let near = false;
      const endNote = () => foot.append(make('span', 'usa-inf-end', this.str('end-label', 'You have reached the end')));
      if (this._state === 'end') endNote();
      if (this._state === 'loading') this._state = 'idle';
      const paint = () => {
        foot.dataset.state = this._state;
        foot.toggleAttribute('data-static', this.reduced);
        more.disabled = this._state !== 'idle';
        this.setAttribute('aria-busy', String(this._state === 'loading'));
      };
      const load = () => {
        if (this._state !== 'idle') return;
        this._state = 'loading';
        before = count();
        live.textContent = this.str('label', 'Loading more');
        paint();
        this.emit('load', { page: this._page + 1 });
      };
      const settle = (end: boolean) => {
        if (this._state === 'end') return;
        const added = Math.max(0, count() - before);
        if (this._state === 'loading' && added) this._page++;
        const fresh = Array.from(list.children).filter((c) => !ours.has(c)).slice(before) as HTMLElement[];
        if (!this.reduced) {
          const gap = Math.max(0, this.num('stagger', 40));
          fresh.forEach((el, i) => {
            el.style.setProperty('--d', `${Math.min(i, 12) * gap}ms`);
            el.classList.add('usa-inf-item-in');
            el.addEventListener('animationend', () => { el.classList.remove('usa-inf-item-in'); el.style.removeProperty('--d'); }, { once: true });
          });
        }
        this._state = end ? 'end' : 'idle';
        live.textContent = end ? this.str('end-label', 'You have reached the end') : added ? `${added} more` : '';
        if (list === this) this.append(sentinel, foot);
        if (end) { endNote(); this.emit('end'); }
        paint();
        if (!end && near) queueMicrotask(() => { if (near && sentinel.getBoundingClientRect().top <= window.innerHeight + (parseFloat(this.str('root-margin', '200')) || 0)) load(); });
      };
      this._api = {
        done: () => { if (this._state === 'loading') settle(false); },
        end: () => settle(true),
        reset: () => { this._page = 1; this._state = 'idle'; foot.querySelector('.usa-inf-end')?.remove(); live.textContent = ''; paint(); },
      };
      this.listen(more, 'click', load);
      if (this.str('auto') !== 'false' && typeof IntersectionObserver !== 'undefined') {
        const seen: IntersectionObserverCallback = (es) => { near = es.some((e) => e.isIntersecting); if (near) load(); };
        let io: IntersectionObserver;
        try { io = new IntersectionObserver(seen, { rootMargin: `0px 0px ${this.str('root-margin', '200px')} 0px` }); }
        catch { io = new IntersectionObserver(seen, { rootMargin: '0px 0px 200px 0px' }); }
        io.observe(sentinel);
        this.onCleanup(() => io.disconnect());
      }
      this.onCleanup(() => {
        sentinel.remove();
        foot.remove();
        this.removeAttribute('aria-busy');
        this._api = undefined;
      });
      paint();
    }
  }, { id: 'parts-kit', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
