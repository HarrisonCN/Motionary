import { defineElement, type UsaElement } from '../base';
import { ownChildren, part } from './shared';
import css from './milestones.css?raw';

/**
 * `<usa-milestones>` (6.5) — a scroll-drawn timeline: a progress line grows
 * down the rail as you scroll, and each milestone (a child element, with an
 * optional `data-date`) pops its dot and slides its card in when the line
 * reaches it. Cards alternate sides on wide screens (`layout="alternate"`,
 * default) or sit on one side (`layout="left"`); below 640 px they always
 * stack. Events `usa:reach` (`{ index }`). Reduced motion: everything is
 * shown, the line is full.
 */
export interface UsaMilestonesElement extends UsaElement {
  readonly reached: number;
}

export function defineMilestones(tag = 'usa-milestones'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaMilestones extends Base {
        static get observedAttributes(): string[] {
          return ['layout'];
        }
        private _items: HTMLElement[] = [];
        private _fill: HTMLElement | null = null;
        private _reached = -1;
        private _raf = 0;

        get reached(): number {
          return this._reached;
        }

        mount(): void {
          this.dataset.layout = this.str('layout', 'alternate') === 'left' ? 'left' : 'alternate';
          this.setAttribute('role', this.getAttribute('role') || 'list');
          this.querySelectorAll(':scope > .usa-ms-rail').forEach((n) => n.remove());
          const rail = part('div', 'usa-ms-rail', { 'aria-hidden': 'true' });
          this._fill = part('div', 'usa-ms-fill');
          rail.append(this._fill);
          this.prepend(rail);
          this._items = ownChildren(this, '[data-usa-part],.usa-ms-rail');
          this._items.forEach((it, i) => {
            it.classList.add('usa-ms-item');
            it.setAttribute('role', 'listitem');
            it.dataset.side = this.dataset.layout === 'left' || i % 2 === 0 ? 'right' : 'left';
            if (!it.querySelector(':scope > .usa-ms-dot')) it.prepend(part('span', 'usa-ms-dot', { 'aria-hidden': 'true' }));
            const date = it.dataset.date;
            if (date && !it.querySelector(':scope > .usa-ms-date')) it.querySelector(':scope > .usa-ms-dot')!.after(part('span', 'usa-ms-date', {}, ''));
            const d = it.querySelector<HTMLElement>(':scope > .usa-ms-date');
            if (d && date) d.textContent = date;
          });
          this._reached = -1;
          if (this.reduced) {
            this._fill.style.transform = 'scaleY(1)';
            this._items.forEach((it) => it.setAttribute('data-reached', ''));
            this._reached = this._items.length - 1;
            return;
          }
          const on = () => {
            if (!this._raf) this._raf = typeof requestAnimationFrame === 'function' ? requestAnimationFrame(() => this.update()) : (this.update(), 0);
          };
          this.listen(window, 'scroll', on, { passive: true });
          this.listen(window, 'resize', on);
          this.onCleanup(() => {
            if (this._raf && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(this._raf);
          });
          this.update();
        }

        /** Fill the rail up to the viewport's 60 % line and reveal the milestones it passed. */
        update(): void {
          this._raf = 0;
          const r = this.getBoundingClientRect();
          const vh = (typeof window !== 'undefined' && window.innerHeight) || 800;
          const line = vh * 0.6;
          const p = r.height ? Math.min(1, Math.max(0, (line - r.top) / r.height)) : 0;
          if (this._fill) this._fill.style.transform = `scaleY(${p.toFixed(4)})`;
          this._items.forEach((it, i) => {
            if (it.hasAttribute('data-reached')) return;
            const top = it.getBoundingClientRect().top;
            if (top < line || p >= 1) {
              it.setAttribute('data-reached', '');
              const card = Array.from(it.children).filter((c) => !c.matches('.usa-ms-dot,.usa-ms-date')) as HTMLElement[];
              const dot = it.querySelector(':scope > .usa-ms-dot');
              if (dot) this.motion(dot, [{ transform: 'scale(0)' }, { transform: 'scale(1.5)', offset: 0.6 }, { transform: 'scale(1)' }], { duration: 420, easing: 'cubic-bezier(.3,1.4,.5,1)' });
              const dx = it.dataset.side === 'left' ? -28 : 28;
              card.forEach((c, k) => this.motion(c, [{ opacity: 0, transform: `translateX(${dx}px)` }, { opacity: 1, transform: 'none' }], { duration: 520, delay: 80 + k * 60, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' }));
              if (i > this._reached) this._reached = i;
              this.emit('reach', { index: i });
            }
          });
        }
      }
      return UsaMilestones as unknown as CustomElementConstructor;
    },
    { id: 'milestones', text: css }
  );
}
