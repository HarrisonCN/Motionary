import { defineElement, raf, caf, clamp, EASE_OUT, type UsaElement } from '../base';
import { springEasing } from '../physics/spring';
import css from './card.css?raw';

export const CARD_EFFECTS = ['flip', 'holo', 'glass', 'border-glow', 'conic-border', 'lift', 'spotlight', 'sheen', 'parallax-layers', 'expand'] as const;
export type CardEffect = (typeof CARD_EFFECTS)[number];

/** Effects that follow the pointer (they share one rAF-throttled tracker). */
const TRACKING = /*#__PURE__*/ new Set(['holo', 'border-glow', 'spotlight', 'parallax-layers', 'lift']);

/**
 * `<usa-card>` — card effects, combinable: `effect="lift sheen"`.
 *
 * - `flip` — front/back (`[data-front]` / `[data-back]` children) flip on
 *   hover or `trigger="click"`, `axis="y"` (default, horizontal flip) or `x`.
 * - `holo` — holographic foil that shifts with the pointer.
 * - `glass` — frosted glass surface (backdrop blur).
 * - `border-glow` — a glow on the border that follows the pointer.
 * - `conic-border` — a rotating conic-gradient border.
 * - `lift` — rises with a deeper shadow and a slight pointer tilt.
 * - `spotlight` — a soft light that follows the pointer.
 * - `sheen` — a light sweep across the card on hover / focus.
 * - `parallax-layers` — children with `data-depth="0.2…1"` move at different depths.
 * - `expand` — click to grow into a full detail view (`[data-detail]`
 *   content is shown), FLIP + spring; Esc, `[data-close]` or the backdrop closes.
 *
 * Attributes: `effect`, `axis`, `trigger`, `depth` (parallax px, 16),
 * `color` (glow / spotlight colour), `flipped`, `expanded`, `disabled`.
 * CSS variables: `--usa-card-x/-y` (pointer %, 0–100), `--usa-card-nx/-ny` (−1…1).
 * Methods: `flip(force?)`, `expand()`, `collapse()`. Events: `usa:flip`,
 * `usa:expand`, `usa:collapse`. Reduced motion: no tilt / parallax / sweep;
 * flips and expansions cross-fade.
 */
export interface UsaCardElement extends UsaElement {
  readonly effects: string[];
  flipped: boolean;
  readonly expanded: boolean;
  flip(force?: boolean): void;
  expand(): Promise<void>;
  collapse(): Promise<void>;
}

export function defineCard(tag = 'usa-card'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaCard extends Base {
        static get observedAttributes(): string[] {
          return ['effect', 'trigger', 'disabled', 'color', 'depth'];
        }

        private _frame = 0;
        private _spacer: HTMLElement | null = null;
        private _backdrop: HTMLElement | null = null;
        private _busy = false;

        get effects(): string[] {
          return this.str('effect', 'lift').split(/[\s,]+/).filter(Boolean);
        }
        private has(e: string): boolean {
          return this.effects.includes(e);
        }
        get flipped(): boolean {
          return this.flag('flipped');
        }
        set flipped(v: boolean) {
          this.setFlag('flipped', v);
        }
        get expanded(): boolean {
          return this.flag('expanded');
        }

        mount(): void {
          if (this.flag('disabled')) return;
          const color = this.str('color');
          if (color) this.style.setProperty('--usa-card-glow', color);
          if (this.has('sheen') && !this.querySelector(':scope > .usa-card-sheen')) this.append(deco('usa-card-sheen'));
          if (this.has('holo') && !this.querySelector(':scope > .usa-card-holo')) this.append(deco('usa-card-holo'));
          if (this.has('flip')) {
            const click = this.str('trigger', 'hover') === 'click';
            if (click) {
              if (!this.hasAttribute('tabindex')) this.tabIndex = 0;
              this.setAttribute('role', this.getAttribute('role') || 'button');
              this.setAttribute('aria-pressed', String(this.flipped));
              this.listen(this, 'click', (e: MouseEvent) => !interactive(e.target, this) && this.flip());
              this.listen(this, 'keydown', (e: KeyboardEvent) => {
                if ((e.key === 'Enter' || e.key === ' ') && e.target === this) {
                  e.preventDefault();
                  this.flip();
                }
              });
            }
            this.setBackHidden();
          }
          if (this.has('expand')) {
            if (!this.hasAttribute('tabindex')) this.tabIndex = 0;
            this.setAttribute('aria-expanded', String(this.expanded));
            this.listen(this, 'click', (e: MouseEvent) => {
              const t = e.target as Element;
              if (t.closest?.('[data-close]')) {
                e.stopPropagation();
                this.collapse();
              } else if (!this.expanded && !interactive(t, this)) this.expand();
            });
            this.listen(this, 'keydown', (e: KeyboardEvent) => {
              if (e.key === 'Escape' && this.expanded) this.collapse();
              else if ((e.key === 'Enter' || e.key === ' ') && e.target === this && !this.expanded) {
                e.preventDefault();
                this.expand();
              }
            });
          }
          if (!this.effects.some((e) => TRACKING.has(e)) || this.reduced) return;
          let rect: DOMRect | null = null;
          let px = 0.5;
          let py = 0.5;
          const apply = () => {
            this._frame = 0;
            const nx = clamp(px * 2 - 1, -1, 1);
            const ny = clamp(py * 2 - 1, -1, 1);
            this.style.setProperty('--usa-card-x', `${(px * 100).toFixed(1)}%`);
            this.style.setProperty('--usa-card-y', `${(py * 100).toFixed(1)}%`);
            this.style.setProperty('--usa-card-nx', nx.toFixed(3));
            this.style.setProperty('--usa-card-ny', ny.toFixed(3));
            if (this.has('parallax-layers')) {
              const depth = this.num('depth', 16);
              this.querySelectorAll<HTMLElement>('[data-depth]').forEach((l) => {
                const d = Number(l.dataset.depth) || 0.5;
                l.style.transform = `translate3d(${(nx * depth * d).toFixed(1)}px, ${(ny * depth * d).toFixed(1)}px, 0)`;
              });
            }
          };
          this.listen(this, 'pointerenter', () => {
            rect = this.getBoundingClientRect();
            this.setAttribute('data-hover', '');
          });
          this.listen(this, 'pointermove', (e: PointerEvent) => {
            if (this.expanded) return;
            rect = rect || this.getBoundingClientRect();
            px = (e.clientX - rect.left) / (rect.width || 1);
            py = (e.clientY - rect.top) / (rect.height || 1);
            if (!this._frame) this._frame = raf(apply);
          });
          this.listen(this, 'pointerleave', () => {
            rect = null;
            px = py = 0.5;
            this.removeAttribute('data-hover');
            if (!this._frame) this._frame = raf(apply);
          });
        }

        unmount(): void {
          caf(this._frame);
          this._frame = 0;
          if (this.expanded) this.finishCollapse();
        }

        private setBackHidden(): void {
          const front = this.querySelector<HTMLElement>(':scope > [data-front]');
          const back = this.querySelector<HTMLElement>(':scope > [data-back]');
          front?.setAttribute('aria-hidden', String(this.flipped));
          back?.setAttribute('aria-hidden', String(!this.flipped));
        }

        flip(force?: boolean): void {
          const next = force === undefined ? !this.flipped : force;
          if (next === this.flipped) return;
          this.flipped = next;
          if (this.hasAttribute('aria-pressed')) this.setAttribute('aria-pressed', String(next));
          this.setBackHidden();
          this.emit('flip', { flipped: next });
        }

        async expand(): Promise<void> {
          if (this.expanded || this._busy) return;
          this._busy = true;
          const first = this.getBoundingClientRect();
          const spacer = document.createElement('div');
          spacer.className = 'usa-card-spacer';
          spacer.style.cssText = `width:${first.width}px;height:${first.height}px`;
          spacer.setAttribute('aria-hidden', 'true');
          this.before(spacer);
          this._spacer = spacer;
          const backdrop = document.createElement('div');
          backdrop.className = 'usa-card-backdrop';
          backdrop.addEventListener('click', () => this.collapse());
          this.before(backdrop);
          this._backdrop = backdrop;
          this.setFlag('expanded', true);
          this.setAttribute('aria-expanded', 'true');
          this.emit('expand');
          const last = this.getBoundingClientRect();
          await this.flipFrom(first, last);
          this.motion(backdrop, [{ opacity: 0 }, { opacity: 1 }], { duration: 250, easing: 'ease-out' });
          this.focus({ preventScroll: true });
          this._busy = false;
        }

        async collapse(): Promise<void> {
          if (!this.expanded || this._busy) return;
          this._busy = true;
          const first = this.getBoundingClientRect();
          const b = this._backdrop;
          if (b) this.motion(b, [{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: 'ease-in', fill: 'forwards' });
          this.finishCollapse();
          this.emit('collapse');
          const last = this.getBoundingClientRect();
          await this.flipFrom(first, last);
          this._busy = false;
        }

        private finishCollapse(): void {
          this.setFlag('expanded', false);
          this.setAttribute('aria-expanded', 'false');
          this._spacer?.remove();
          this._backdrop?.remove();
          this._spacer = this._backdrop = null;
        }

        private async flipFrom(first: DOMRect, last: DOMRect): Promise<void> {
          if (this.reduced) {
            const a = this.motion(this, [{ opacity: 0.4 }, { opacity: 1 }], { duration: 200 });
            await a?.finished.catch(() => undefined);
            return;
          }
          const sx = first.width / (last.width || 1);
          const sy = first.height / (last.height || 1);
          const dx = first.left - last.left;
          const dy = first.top - last.top;
          const { easing, duration } = springEasing('stiff');
          const a = this.motion(
            this,
            [{ transformOrigin: '0 0', transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` }, { transformOrigin: '0 0', transform: 'none' }],
            { duration: Math.min(duration, 900), easing: easing || EASE_OUT }
          );
          await a?.finished.catch(() => undefined);
        }
      },
    { id: 'card', text: css }
  );
}

function deco(cls: string): HTMLSpanElement {
  const s = document.createElement('span');
  s.className = cls;
  s.setAttribute('aria-hidden', 'true');
  return s;
}

/** Clicks on links, buttons and form fields inside the card keep their own behaviour. */
function interactive(t: EventTarget | null, host: Element): boolean {
  const el = (t as Element)?.closest?.('a, button, input, select, textarea, label, [contenteditable]');
  return !!el && el !== host && host.contains(el);
}
