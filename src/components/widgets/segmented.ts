import { defineElement, type UsaElement } from '../base';
import { ownChildren, arrowIndex, clampN } from './shared';
import css from './segmented.css?raw';

/**
 * `<usa-segmented>` (6.7) — a segmented control (iOS style): a thumb slides
 * under the chosen segment with a spring and stretches while it travels;
 * the chosen label scales up slightly. Children are the segments (buttons
 * or any element). It is a radio group (`role="radiogroup"`, arrow keys,
 * Home / End, roving tabindex). `value` is the selected index; `usa:change`
 * (`{ value, label }`). `variant="ios | pill | outline"`. Reduced motion:
 * the thumb jumps.
 */
export interface UsaSegmentedElement extends UsaElement {
  value: number;
  readonly segments: HTMLElement[];
}

export const SEGMENTED_VARIANTS = ['ios', 'pill', 'outline'] as const;

export function defineSegmented(tag = 'usa-segmented'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaSegmented extends Base {
        static get observedAttributes(): string[] {
          return ['variant', 'label', 'value'];
        }
        private _segs: HTMLElement[] = [];
        private _v = 0;
        private _thumb: HTMLElement | null = null;

        get segments(): HTMLElement[] {
          return this._segs;
        }
        get value(): number {
          return this._v;
        }
        set value(v: number) {
          this.select(v, false);
        }

        mount(): void {
          const v = this.str('variant', 'ios');
          this.dataset.variant = (SEGMENTED_VARIANTS as readonly string[]).includes(v) ? v : 'ios';
          this.setAttribute('role', 'radiogroup');
          if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', this.str('label', 'Options'));
          this._segs = ownChildren(this);
          if (!this.querySelector(':scope > .usa-seg-thumb')) {
            const t = document.createElement('span');
            t.className = 'usa-seg-thumb';
            t.setAttribute('aria-hidden', 'true');
            t.setAttribute('data-usa-part', '');
            this.prepend(t);
          }
          this._thumb = this.querySelector('.usa-seg-thumb');
          const pre = this._segs.findIndex((s) => s.hasAttribute('selected') || s.getAttribute('aria-checked') === 'true');
          this._v = clampN(pre >= 0 ? pre : this.num('value', 0) | 0, 0, Math.max(0, this._segs.length - 1));
          this._segs.forEach((s, i) => {
            s.classList.add('usa-seg-item');
            s.setAttribute('role', 'radio');
            this.listen(s, 'click', () => this.select(i, true));
            this.listen(s, 'keydown', (e: KeyboardEvent) => {
              const j = arrowIndex(e, i, this._segs.length);
              if (j < 0) return;
              e.preventDefault();
              this.select(j, true);
              this._segs[j].focus();
            });
          });
          this.sync(false);
          if (typeof ResizeObserver === 'function') {
            const ro = new ResizeObserver(() => this.place(false));
            ro.observe(this);
            this.onCleanup(() => ro.disconnect());
          }
        }

        private sync(animate: boolean): void {
          this._segs.forEach((s, i) => {
            s.setAttribute('aria-checked', String(i === this._v));
            s.tabIndex = i === this._v ? 0 : -1;
            s.toggleAttribute('data-selected', i === this._v);
          });
          this.place(animate);
        }

        private place(animate: boolean): void {
          const s = this._segs[this._v];
          const t = this._thumb;
          if (!s || !t) return;
          const from = { x: t.offsetLeft, w: t.offsetWidth };
          t.style.left = s.offsetLeft + 'px';
          t.style.width = s.offsetWidth + 'px';
          if (!animate || this.reduced || !from.w) return;
          const dx = from.x - s.offsetLeft;
          const sx = from.w / (s.offsetWidth || 1);
          this.motion(t, [{ transform: `translateX(${dx}px) scaleX(${sx})` }, { transform: `translateX(${dx * 0.35}px) scaleX(${Math.max(sx, 1) * 1.18}) scaleY(.88)`, offset: 0.45 }, { transform: 'none' }], { duration: 430, easing: 'cubic-bezier(.3,1.25,.5,1)' });
        }

        changed(name: string): void {
          // 13.1.0: `value` is observed — setting it selects that segment (a re-mount kept the previous selection)
          if (name === 'value') this.select(this.num('value', 0), false);
          else super.changed(name);
        }

        select(i: number, user: boolean): void {
          const v = clampN(i | 0, 0, Math.max(0, this._segs.length - 1));
          if (v === this._v) return;
          this._v = v;
          this.sync(true);
          if (user) this.emit('change', { value: v, label: this._segs[v]?.textContent?.trim() || '' });
        }
      }
      return UsaSegmented as unknown as CustomElementConstructor;
    },
    { id: 'segmented', text: css }
  );
}
