import { defineElement, type UsaElement } from '../base';
import { ownChildren, part, nextId, arrowIndex } from './shared';
import css from './tab-bar.css?raw';

/**
 * `<usa-tab-bar>` (6.2) — tabs with an animated indicator that stretches
 * from the old tab to the new one (leading edge first, then the trailing edge
 * catches up). Children: `<button>` tabs, and optional panels marked
 * `data-panel` (in the same order). Attributes: `indicator` (`pill` ·
 * `underline` · `glow` · `gooey`), `selected` (index), `label`. Arrow keys,
 * Home/End. API: `select(i)`, `selected`. Events: `usa:change` (`{ index, from }`).
 * Panels slide in from the side of travel. Reduced motion: no stretch / slide.
 */
export interface UsaTabBarElement extends UsaElement {
  selected: number;
  select(i: number): void;
}

export const TAB_INDICATORS = ['pill', 'underline', 'glow', 'gooey'] as const;

export function defineTabBar(tag = 'usa-tab-bar'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaTabBar extends Base {
        static get observedAttributes(): string[] {
          return ['indicator', 'label', 'selected'];
        }
        private _tabs: HTMLElement[] = [];
        private _panels: HTMLElement[] = [];
        private _ink: HTMLElement | null = null;
        private _i = 0;

        get selected(): number {
          return this._i;
        }
        set selected(v: number) {
          this.select(v);
        }

        mount(): void {
          const ind = this.str('indicator', 'pill');
          this.dataset.indicator = (TAB_INDICATORS as readonly string[]).includes(ind) ? ind : 'pill';
          let list = this.querySelector<HTMLElement>(':scope > .usa-tab-bar-list');
          if (!list) {
            list = part('div', 'usa-tab-bar-list');
            this.prepend(list);
          }
          list.setAttribute('role', 'tablist');
          list.setAttribute('aria-label', this.str('label', 'Tabs'));
          const kids = ownChildren(this);
          this._panels = kids.filter((k) => k.hasAttribute('data-panel'));
          for (const k of kids) if (!k.hasAttribute('data-panel') && k.matches('button,[data-tab]')) list.append(k);
          this._tabs = Array.from(list.children).filter((c): c is HTMLElement => c instanceof HTMLElement && !c.classList.contains('usa-tab-bar-ink'));
          this._ink = list.querySelector('.usa-tab-bar-ink') || part('span', 'usa-tab-bar-ink', { 'aria-hidden': 'true' });
          list.prepend(this._ink);
          this._tabs.forEach((t, i) => {
            t.setAttribute('role', 'tab');
            if (t.localName === 'button' && !t.hasAttribute('type')) t.setAttribute('type', 'button');
            t.id ||= nextId('usa-tab');
            const p = this._panels[i];
            if (p) {
              p.id ||= nextId('usa-tabpanel');
              p.classList.add('usa-tab-bar-panel');
              p.setAttribute('role', 'tabpanel');
              p.setAttribute('aria-labelledby', t.id);
              p.tabIndex = 0;
              t.setAttribute('aria-controls', p.id);
            }
            this.listen(t, 'click', () => this.select(i));
          });
          this.listen(list, 'keydown', (e: KeyboardEvent) => {
            const n = arrowIndex(e, this._i, this._tabs.length);
            if (n < 0) return;
            e.preventDefault();
            this.select(n);
            this._tabs[n].focus();
          });
          this._i = Math.min(Math.max(0, Math.round(this.num('selected', 0))), Math.max(0, this._tabs.length - 1));
          this.sync(-1);
          if (typeof ResizeObserver === 'function') {
            const ro = new ResizeObserver(() => this.place());
            ro.observe(list);
            this.onCleanup(() => ro.disconnect());
          }
        }

        private rect(i: number): [number, number] {
          const t = this._tabs[i];
          return t ? [t.offsetLeft, t.offsetWidth] : [0, 0];
        }
        private place(): void {
          if (!this._ink) return;
          const [x, w] = this.rect(this._i);
          this._ink.style.transform = `translateX(${x}px)`;
          this._ink.style.width = `${w}px`;
        }

        private sync(from: number): void {
          this._tabs.forEach((t, k) => {
            t.setAttribute('aria-selected', String(k === this._i));
            t.tabIndex = k === this._i ? 0 : -1;
          });
          this._panels.forEach((p, k) => (p.hidden = k !== this._i));
          this.place();
          if (from < 0 || from === this._i || !this._ink || this.reduced) return;
          // stretchy travel: the leading edge arrives first, the trailing edge follows
          const [x0, w0] = this.rect(from);
          const [x1, w1] = this.rect(this._i);
          const right = x1 > x0;
          const mid = right ? { transform: `translateX(${x0}px)`, width: `${x1 + w1 - x0}px` } : { transform: `translateX(${x1}px)`, width: `${x0 + w0 - x1}px` };
          this.motion(this._ink, [{ transform: `translateX(${x0}px)`, width: `${w0}px` }, { ...mid, offset: 0.45 }, { transform: `translateX(${x1}px)`, width: `${w1}px` }], { duration: 480, easing: 'cubic-bezier(.22,1,.36,1)' });
          const p = this._panels[this._i];
          if (p) this.motion(p, [{ opacity: 0, transform: `translateX(${right ? 24 : -24}px)` }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.22,1,.36,1)' });
        }

        select(i: number): void {
          const n = Math.min(Math.max(0, Math.round(i)), this._tabs.length - 1);
          if (n === this._i || n < 0) return;
          const from = this._i;
          this._i = n;
          this.sync(from);
          this.emit('change', { index: n, from });
        }
      }
      return UsaTabBar as unknown as CustomElementConstructor;
    },
    { id: 'tab-bar', text: css }
  );
}
