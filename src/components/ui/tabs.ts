import { defineElement, type UsaElement } from '../base';
import { springEasing } from '../physics/spring';
import { adoptVariants } from './variants';
import { nextId } from './position';
import css from './tabs.css?raw';

/**
 * `<usa-tabs>` — accessible tabs with a sliding (spring) indicator.
 * Tabs: `[data-tab]` children (buttons); panels: `[data-panel]` children, in
 * the same order. Arrow keys / Home / End move between tabs (roving tabindex).
 *
 * Attributes: `selected` (index, 0), `indicator` (`line` default, `pill`),
 * `variant`. Events: `usa:change` (`{ index }`). Panels fade/slide in;
 * reduced motion: the indicator jumps and panels switch instantly.
 */
export interface UsaTabsElement extends UsaElement {
  selected: number;
  select(i: number, focus?: boolean): void;
}

export function defineTabs(tag = 'usa-tabs'): CustomElementConstructor | undefined {
  adoptVariants();
  return defineElement(
    tag,
    (Base) =>
      class UsaTabs extends Base {
        static get observedAttributes(): string[] {
          return ['indicator'];
        }

        private _i = 0;
        private _bar: HTMLElement | null = null;

        get selected(): number {
          return this._i;
        }
        set selected(v: number) {
          this.select(v);
        }

        private tabs(): HTMLElement[] {
          return Array.from(this.querySelectorAll<HTMLElement>('[data-tab]')).filter((t) => t.closest(this.localName) === this);
        }
        private panels(): HTMLElement[] {
          return Array.from(this.querySelectorAll<HTMLElement>('[data-panel]')).filter((t) => t.closest(this.localName) === this);
        }

        mount(): void {
          const tabs = this.tabs();
          const panels = this.panels();
          const list = tabs[0]?.parentElement;
          if (!list) return;
          list.setAttribute('role', 'tablist');
          list.classList.add('usa-tabs-list');
          if (!list.querySelector(':scope > .usa-tabs-indicator')) {
            this._bar = document.createElement('span');
            this._bar.className = 'usa-tabs-indicator';
            this._bar.setAttribute('aria-hidden', 'true');
            list.append(this._bar);
          } else this._bar = list.querySelector(':scope > .usa-tabs-indicator');
          tabs.forEach((t, i) => {
            t.id ||= nextId('usa-tab');
            t.setAttribute('role', 'tab');
            const p = panels[i];
            if (p) {
              p.id ||= nextId('usa-panel');
              p.setAttribute('role', 'tabpanel');
              p.setAttribute('aria-labelledby', t.id);
              t.setAttribute('aria-controls', p.id);
              if (!p.hasAttribute('tabindex')) p.tabIndex = 0;
            }
            this.listen(t, 'click', () => this.select(i));
          });
          this.listen(list, 'keydown', (e: KeyboardEvent) => {
            const n = tabs.length;
            const map: Record<string, number> = { ArrowRight: this._i + 1, ArrowDown: this._i + 1, ArrowLeft: this._i - 1, ArrowUp: this._i - 1, Home: 0, End: n - 1 };
            if (!(e.key in map)) return;
            e.preventDefault();
            this.select((map[e.key] + n) % n, true);
          });
          const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => this.moveBar(false)) : null;
          ro?.observe(list);
          this.onCleanup(() => ro?.disconnect());
          this.select(Math.max(0, Math.min(tabs.length - 1, this.num('selected', 0))), false, true);
        }

        private moveBar(animate: boolean): void {
          const t = this.tabs()[this._i];
          const bar = this._bar;
          if (!t || !bar) return;
          const from = bar.style.transform;
          const fromW = bar.style.width;
          bar.style.width = `${t.offsetWidth}px`;
          bar.style.transform = `translateX(${t.offsetLeft}px)`;
          if (animate && from && !this.reduced) this.motion(bar, [{ transform: from, width: fromW }, { transform: bar.style.transform, width: bar.style.width }], springEasing('stiff'));
        }

        select(i: number, focus = false, initial = false): void {
          const tabs = this.tabs();
          const panels = this.panels();
          if (!tabs[i]) return;
          const prev = this._i;
          this._i = i;
          this.setAttribute('selected', String(i));
          tabs.forEach((t, j) => {
            t.setAttribute('aria-selected', String(j === i));
            t.tabIndex = j === i ? 0 : -1;
          });
          panels.forEach((p, j) => (p.hidden = j !== i));
          if (focus) tabs[i].focus();
          this.moveBar(!initial);
          if (initial || prev === i) return;
          const p = panels[i];
          if (p && !this.reduced) this.motion(p, [{ opacity: 0, transform: `translateX(${i > prev ? 16 : -16}px)` }, { opacity: 1, transform: 'none' }], { duration: 280, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
          this.emit('change', { index: i });
        }
      },
    { id: 'tabs', text: css }
  );
}
