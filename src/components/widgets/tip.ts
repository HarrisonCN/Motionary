import { defineElement, type UsaElement } from '../base';
import { part, nextId } from './shared';
import css from './tip.css?raw';

/**
 * `<usa-tip>` (6.6) — tooltip / popover 2.0. Wrap the trigger; the tip
 * content is the `text` attribute or a child with `[slot="tip"]` / `[data-tip]`
 * (rich content). It springs out of the trigger with its arrow,
 * auto-flips to stay inside the viewport and shifts along the edge.
 * `placement="top | bottom | left | right"`, `trigger="hover | click"`
 * (`click` = popover: toggles, Esc / outside click close), `delay` (ms).
 * Hover tips also open on keyboard focus and close on Esc (WCAG 1.4.13).
 * Events `usa:open`, `usa:close`. Reduced motion: a short fade.
 */
export interface UsaTipElement extends UsaElement {
  readonly opened: boolean;
  show(): void;
  hide(): void;
}

export const TIP_PLACEMENTS = ['top', 'bottom', 'left', 'right'] as const;
const FLIP: Record<string, string> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };

export function defineTip(tag = 'usa-tip'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaTip extends Base {
        static get observedAttributes(): string[] {
          return ['text', 'placement', 'trigger', 'delay'];
        }
        private _bubble: HTMLElement | null = null;
        private _trigger: HTMLElement | null = null;
        private _open = false;
        private _t: ReturnType<typeof setTimeout> | 0 = 0;

        get opened(): boolean {
          return this._open;
        }

        mount(): void {
          this.querySelectorAll(':scope > .usa-tip-bubble[data-usa-part]').forEach((n) => n.remove());
          const rich = this.querySelector<HTMLElement>(':scope > [slot="tip"], :scope > [data-tip]');
          this._trigger = Array.from(this.children).find((c) => c !== rich && !c.matches('.usa-tip-bubble')) as HTMLElement | null;
          const b = rich || part('span', 'usa-tip-bubble');
          b.classList.add('usa-tip-bubble');
          if (!rich) b.textContent = this.str('text', '');
          b.id ||= nextId('usa-tipb');
          b.hidden = true;
          if (!b.querySelector(':scope > .usa-tip-arrow')) b.append(part('span', 'usa-tip-arrow', { 'aria-hidden': 'true' }));
          if (!b.isConnected) this.append(b);
          this._bubble = b;
          const click = this.str('trigger', 'hover') === 'click';
          b.setAttribute('role', click ? 'dialog' : 'tooltip');
          const t = this._trigger;
          if (t) {
            if (click) {
              t.setAttribute('aria-expanded', 'false');
              t.setAttribute('aria-controls', b.id);
              t.setAttribute('aria-haspopup', 'dialog');
              this.listen(t, 'click', () => (this._open ? this.hide() : this.show()));
              this.listen(document, 'pointerdown', (e: PointerEvent) => this._open && !this.contains(e.target as Node) && this.hide());
            } else {
              t.setAttribute('aria-describedby', b.id);
              const delay = this.num('delay', 120);
              const later = (fn: () => void, ms: number) => {
                if (this._t) clearTimeout(this._t);
                this._t = setTimeout(fn, ms);
              };
              this.listen(this, 'pointerenter', () => later(() => this.show(), delay));
              this.listen(this, 'pointerleave', () => later(() => this.hide(), 80));
              this.listen(t, 'focusin', () => this.show());
              this.listen(t, 'focusout', () => this.hide());
              this.onCleanup(() => this._t && clearTimeout(this._t));
            }
          }
          this.listen(document, 'keydown', (e: KeyboardEvent) => {
            if (e.key === 'Escape' && this._open) {
              this.hide();
              if (click) t?.focus();
            }
          });
        }

        private position(): string {
          const b = this._bubble!;
          const t = this._trigger || this;
          const want = (TIP_PLACEMENTS as readonly string[]).includes(this.str('placement', 'top')) ? this.str('placement', 'top') : 'top';
          const tr = t.getBoundingClientRect();
          const br = b.getBoundingClientRect();
          const vw = document.documentElement.clientWidth || window.innerWidth || 1024;
          const vh = window.innerHeight || 768;
          const gap = 10;
          const fits = (p: string) => (p === 'top' ? tr.top - br.height - gap >= 4 : p === 'bottom' ? tr.bottom + br.height + gap <= vh - 4 : p === 'left' ? tr.left - br.width - gap >= 4 : tr.right + br.width + gap <= vw - 4);
          const place = fits(want) || !fits(FLIP[want]) ? want : FLIP[want];
          const host = this.getBoundingClientRect();
          let x: number;
          let y: number;
          if (place === 'top' || place === 'bottom') {
            x = tr.left + tr.width / 2 - br.width / 2;
            y = place === 'top' ? tr.top - br.height - gap : tr.bottom + gap;
          } else {
            x = place === 'left' ? tr.left - br.width - gap : tr.right + gap;
            y = tr.top + tr.height / 2 - br.height / 2;
          }
          const cx = Math.min(Math.max(4, x), Math.max(4, vw - br.width - 4)); // shift inside the viewport
          b.style.left = `${(cx - host.left).toFixed(1)}px`;
          b.style.top = `${(y - host.top).toFixed(1)}px`;
          b.style.setProperty('--usa-tip-shift', `${(x - cx).toFixed(1)}px`);
          b.dataset.placement = place;
          return place;
        }

        show(): void {
          const b = this._bubble;
          if (!b || this._open) return;
          this._open = true;
          b.hidden = false;
          const place = this.position();
          this._trigger?.setAttribute('aria-expanded', this._trigger.hasAttribute('aria-expanded') ? 'true' : '');
          if (this._trigger?.getAttribute('aria-expanded') === '') this._trigger.removeAttribute('aria-expanded');
          const off = place === 'top' ? '0 6px' : place === 'bottom' ? '0 -6px' : place === 'left' ? '6px 0' : '-6px 0';
          this.motion(b, this.reduced ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, translate: off, scale: '0.6' }, { opacity: 1, translate: '0 0', scale: '1.04', offset: 0.65 }, { opacity: 1, translate: '0 0', scale: '1' }], { duration: this.reduced ? 120 : 340, easing: 'cubic-bezier(.3,1.3,.5,1)' });
          this.emit('open');
        }

        hide(): void {
          const b = this._bubble;
          if (!b || !this._open) return;
          this._open = false;
          if (this._trigger?.hasAttribute('aria-expanded')) this._trigger.setAttribute('aria-expanded', 'false');
          const a = this.motion(b, [{ opacity: 1 }, { opacity: 0, scale: this.reduced ? '1' : '0.9' }], { duration: 120, easing: 'ease-in' });
          const done = () => {
            if (!this._open) b.hidden = true;
          };
          if (a) a.finished.then(done, done);
          else done();
          this.emit('close');
        }
      }
      return UsaTip as unknown as CustomElementConstructor;
    },
    { id: 'tip', text: css }
  );
}
