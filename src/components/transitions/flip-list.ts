import { defineElement, deprecate, FLUENT_DECELERATE, type UsaElement } from '../base';
import css from './flip-list.css?raw';

/**
 * `<usa-flip-list>` — animates its children to their new places whenever
 * they are added, removed or reordered (FLIP: transforms only). Works with
 * any rendering: plain DOM, React keyed lists, Vue `v-for`, Svelte `{#each}`.
 *
 * Attributes: `duration` (ms, 420), `easing`, `disabled`.
 * Method: `flip(mutate)` for explicit changes (also measures resizes).
 * Reduced motion: no animation.
 */
export interface UsaFlipListElement extends UsaElement {
  flip(mutate: () => void | Promise<void>): Promise<void>;
}

export function defineFlipList(tag = 'usa-flip-list'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaFlipList extends Base {
        static get observedAttributes(): string[] {
          return [];
        }

        /** Child positions relative to the host, from the last layout we saw. */
        private _pos = new WeakMap<Element, { x: number; y: number }>();
        private _manual = false;

        private snapshot(): void {
          const host = this.getBoundingClientRect();
          for (const el of Array.from(this.children)) {
            const r = el.getBoundingClientRect();
            this._pos.set(el, { x: r.left - host.left, y: r.top - host.top });
          }
        }

        mount(): void {
          deprecate('usa-flip-list', '<usa-flip-list> is deprecated and will be removed in 4.0 — use <usa-auto-animate> (components/layout), which also animates additions and removals. See docs/upgrading-4.md.');
          this.snapshot();
          if (typeof MutationObserver !== 'undefined') {
            const mo = new MutationObserver(() => {
              if (!this._manual) this.animateFrom(this._pos);
            });
            mo.observe(this, { childList: true });
            this.onCleanup(() => mo.disconnect());
          }
          if (typeof ResizeObserver !== 'undefined') {
            const ro = new ResizeObserver(() => this.snapshot());
            ro.observe(this);
            this.onCleanup(() => ro.disconnect());
          }
        }

        private animateFrom(prev: WeakMap<Element, { x: number; y: number }>): Promise<void> {
          const off = this.reduced || this.flag('disabled');
          const host = this.getBoundingClientRect();
          const kids = Array.from(this.children) as HTMLElement[];
          const now = kids.map((el) => {
            const r = el.getBoundingClientRect();
            return { x: r.left - host.left, y: r.top - host.top };
          });
          const anims: Promise<unknown>[] = [];
          const duration = this.num('duration', 420);
          const easing = this.str('easing', FLUENT_DECELERATE);
          kids.forEach((el, i) => {
            const before = prev.get(el);
            this._pos.set(el, now[i]);
            if (off || typeof el.animate !== 'function') return;
            if (!before) {
              anims.push(el.animate([{ opacity: 0, transform: 'scale(0.92)' }, { opacity: 1, transform: 'none' }], { duration, easing }).finished.catch(() => 0));
              return;
            }
            const dx = before.x - now[i].x;
            const dy = before.y - now[i].y;
            if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
            anims.push(el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration, easing, composite: 'add' } as KeyframeAnimationOptions).finished.catch(() => 0));
          });
          return Promise.all(anims).then(() => undefined);
        }

        async flip(mutate: () => void | Promise<void>): Promise<void> {
          this.snapshot();
          const prev = this._pos;
          this._pos = new WeakMap();
          // Copy the snapshot so the observer does not overwrite it mid-mutation
          for (const el of Array.from(this.children)) {
            const p = prev.get(el);
            if (p) this._pos.set(el, p);
          }
          this._manual = true;
          try {
            await mutate();
          } finally {
            this._manual = false;
          }
          await this.animateFrom(prev);
        }
      },
    { id: 'flip-list', text: css }
  );
}
