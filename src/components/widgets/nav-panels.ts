import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import css from './nav-panels.css?raw';

/**
 * 17.3 — the shared core of `<mo-mega-menu>` and `<mo-nav-flyout>`: a row of top-level items, each either a plain link
 * or an item element holding a trigger `<button>` and a `[data-panel]`. Panels follow the disclosure navigation pattern
 * (`aria-expanded` / `aria-controls` on a real button, no `role="menu"`), open with hover intent, click or keyboard,
 * and sit on one shared surface (`.usa-np-bg`) that morphs between the panels instead of each panel fading on its own.
 */
export interface UsaNavPanelsElement extends UsaElement {
  /** Index of the open item (`-1` when every panel is closed). */
  readonly openIndex: number;
  /** Open the item at `index` (a plain link item is ignored); `focus` moves focus to its first focusable control. */
  openItem(index: number, focus?: boolean): void;
  /** Close the open panel; `focusTrigger` returns focus to its trigger. */
  close(focusTrigger?: boolean): void;
}

type Item = { el: HTMLElement; trigger: HTMLElement; panel: HTMLElement | null };
type Rect = { x: number; y: number; w: number; h: number };

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
let seq = 0;

/** Register `tag` for `mode` (`mega`: full-width panels; `flyout`: panels anchored under their trigger), plus its mo-* name. */
function navPanels(tag: string, mode: 'mega' | 'flyout'): CustomElementConstructor | undefined {
  const C = defineElement(
    tag,
    (Base) => {
      class UsaNavPanels extends Base {
        static get observedAttributes(): string[] {
          return ['label', 'delay', 'close-delay'];
        }
        private _i = -1;
        private _t: ReturnType<typeof setTimeout> | 0 = 0;
        private _rect: Rect | null = null;
        private _bg: HTMLElement | null = null;

        get openIndex(): number {
          return this._i;
        }

        get items(): Item[] {
          const out: Item[] = [];
          for (const el of Array.from(this.children) as HTMLElement[]) {
            if (el.hasAttribute('data-usa-part')) continue;
            const panel = el.querySelector<HTMLElement>(':scope > [data-panel]');
            const trigger = panel ? el.querySelector<HTMLElement>(':scope > button, :scope > a') : el.matches('a,button') ? el : el.querySelector<HTMLElement>('a,button');
            if (trigger) out.push({ el, trigger, panel });
          }
          return out;
        }

        mount(): void {
          this.setAttribute('role', 'navigation');
          this.setAttribute('aria-label', this.str('label', 'Main'));
          let bg = this.querySelector<HTMLElement>(':scope > .usa-np-bg');
          if (!bg) {
            bg = document.createElement('span');
            bg.className = 'usa-np-bg';
            bg.setAttribute('aria-hidden', 'true');
            bg.setAttribute('data-usa-part', '');
            this.append(bg);
          }
          this._bg = bg;
          const id = 'usa-np-' + ++seq;
          this.items.forEach((it, i) => {
            if (!it.panel) return;
            it.panel.id ||= `${id}-${i}`;
            it.trigger.setAttribute('aria-controls', it.panel.id);
            it.trigger.setAttribute('aria-expanded', String(i === this._i));
            it.panel.hidden = i !== this._i;
          });
          const at = (t: EventTarget | null) => this.items.findIndex((it) => it.el.contains(t as Node));
          this.listen(this, 'pointerover', (e: PointerEvent) => {
            if (e.pointerType === 'touch') return;
            const i = at(e.target);
            if (i < 0) return;
            if (this.items[i].panel) this.later(() => this.openItem(i), this._i >= 0 ? 0 : this.num('delay', 120));
            else if (this._i >= 0) this.later(() => this.close(), this.num('close-delay', 220));
          });
          this.listen(this, 'pointerleave', (e: PointerEvent) => {
            if (e.pointerType !== 'touch' && this._i >= 0) this.later(() => this.close(), this.num('close-delay', 220));
            else this.later(() => undefined, 0);
          });
          this.listen(this, 'click', (e: MouseEvent) => {
            const i = this.items.findIndex((it) => it.panel && it.trigger.contains(e.target as Node));
            if (i < 0) return;
            this.later(() => undefined, 0);
            if (this._i === i) this.close();
            else this.openItem(i);
          });
          this.listen(this, 'keydown', (e: KeyboardEvent) => this.key(e));
          this.listen(this, 'focusout', (e: FocusEvent) => {
            if (this._i < 0 || this.contains(e.relatedTarget as Node)) return;
            if (e.relatedTarget) { this.close(); return; }
            // Firefox may report a null relatedTarget on Tab-out: settle on the real active element.
            setTimeout(() => {
              if (this._i >= 0 && !this.contains(document.activeElement)) this.close();
            }, 0);
          });
          this.listen(document, 'pointerdown', (e: PointerEvent) => {
            if (this._i >= 0 && !this.contains(e.target as Node)) this.close();
          });
          this.onCleanup(() => this.later(() => undefined, 0));
        }

        unmount(): void {
          if (this._i >= 0) this.close();
        }

        private later(fn: () => void, ms: number): void {
          if (this._t) clearTimeout(this._t);
          this._t = 0;
          if (ms <= 0) fn();
          else this._t = setTimeout(() => ((this._t = 0), fn()), ms);
        }

        private key(e: KeyboardEvent): void {
          const items = this.items;
          const ti = items.findIndex((it) => it.trigger === e.target);
          if (e.key === 'Escape' && this._i >= 0) {
            e.preventDefault();
            this.close(true);
            return;
          }
          if (ti < 0) return;
          const move = (d: number) => {
            e.preventDefault();
            const n = items.length;
            const j = d === Infinity ? n - 1 : d === -Infinity ? 0 : (ti + d + n) % n;
            items[j].trigger.focus();
            if (this._i >= 0 && items[j].panel) this.openItem(j);
            else if (this._i >= 0) this.close();
          };
          const rtl = getComputedStyle(this).direction === 'rtl';
          if (e.key === 'ArrowRight') move(rtl ? -1 : 1);
          else if (e.key === 'ArrowLeft') move(rtl ? 1 : -1);
          else if (e.key === 'Home') move(-Infinity);
          else if (e.key === 'End') move(Infinity);
          else if (e.key === 'ArrowDown' && items[ti].panel) {
            e.preventDefault();
            this.openItem(ti, true);
          }
        }

        private rectOf(panel: HTMLElement): Rect {
          const h = this.getBoundingClientRect();
          const r = panel.getBoundingClientRect();
          return { x: r.left - h.left, y: r.top - h.top, w: r.width, h: r.height };
        }

        openItem(index: number, focus = false): void {
          const items = this.items;
          const next = items[index];
          if (!next?.panel) return;
          if (index !== this._i) {
            const prev = items[this._i];
            const dir = this._i < 0 ? 0 : Math.sign(index - this._i);
            if (prev?.panel) {
              prev.trigger.setAttribute('aria-expanded', 'false');
              prev.panel.hidden = true;
              prev.el.removeAttribute('data-open');
            }
            this._i = index;
            next.trigger.setAttribute('aria-expanded', 'true');
            next.panel.hidden = false;
            next.el.setAttribute('data-open', '');
            if (mode === 'flyout') {
              const host = this.getBoundingClientRect();
              const t = next.trigger.getBoundingClientRect();
              const w = next.panel.offsetWidth;
              next.panel.style.left = `${Math.round(Math.max(0, Math.min(host.width - w, t.left - host.left + t.width / 2 - w / 2)))}px`;
            }
            const to = this.rectOf(next.panel);
            const from = this._rect;
            this._rect = to;
            const bg = this._bg!;
            const box = (r: Rect) => ({ transform: `translate(${r.x}px,${r.y}px)`, width: `${r.w}px`, height: `${r.h}px` });
            Object.assign(bg.style, box(to));
            bg.setAttribute('data-on', '');
            if (!this.reduced) {
              const ease = { duration: 280, easing: 'cubic-bezier(.2,.8,.2,1)' };
              if (from) this.motion(bg, [box(from), box(to)], ease);
              else this.motion(bg, [{ ...box(to), opacity: 0, transform: `translate(${to.x}px,${to.y - 8}px)` }, { ...box(to), opacity: 1 }], ease);
              this.motion(next.panel, [{ opacity: 0, transform: dir ? `translateX(${dir * 24}px)` : 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { ...ease, delay: from ? 40 : 0, fill: 'backwards' });
            }
            this.emit('open', { index });
          }
          if (focus) next.panel.querySelector<HTMLElement>(FOCUSABLE)?.focus();
        }

        close(focusTrigger = false): void {
          const it = this.items[this._i];
          const index = this._i;
          if (index < 0) return;
          this._i = -1;
          this._rect = null;
          this.later(() => undefined, 0);
          if (it?.panel) {
            it.trigger.setAttribute('aria-expanded', 'false');
            it.panel.hidden = true;
            it.el.removeAttribute('data-open');
            if (focusTrigger) it.trigger.focus();
          }
          const bg = this._bg;
          if (bg) {
            bg.removeAttribute('data-on');
            if (!this.reduced) this.motion(bg, [{ opacity: 1 }, { opacity: 0 }], { duration: 160, easing: 'ease-out' });
          }
          this.emit('close', { index });
        }
      }
      return UsaNavPanels as unknown as CustomElementConstructor;
    },
    { id: 'nav-panels', text: css }
  );
  defineMoName(tag, C);
  return C;
}

/**
 * `<mo-mega-menu>` (17.3; legacy name `<usa-mega-menu>`) — a navigation bar whose items open full-width mega panels
 * (columns, a featured card, anything) on one shared surface that morphs its height from panel to panel.
 * Children: plain links, or an item element holding a trigger `<button>` and a `[data-panel]` element:
 * `<div><button>Products</button><div data-panel>…</div></div>`. Hover intent (`delay`, default 120 ms; once a panel
 * is open, moving to another trigger switches at once), click / tap toggles, `close-delay` (default 220 ms) after the
 * pointer leaves. Keyboard: ←/→ / Home / End move between triggers, ↓ opens and focuses the panel, Esc closes and
 * returns focus, Tab out closes. Disclosure pattern (`aria-expanded`, `aria-controls`); the host is a
 * `navigation` landmark named by `label` (default "Main"). Events `usa:open` / `usa:close` (`{ index }`); methods
 * `openItem(i, focus?)`, `close(focusTrigger?)`. Reduced motion: panels switch without the morph.
 */
export const defineMegaMenu = (tag = 'usa-mega-menu'): CustomElementConstructor | undefined => navPanels(tag, 'mega');

/**
 * `<mo-nav-flyout>` (17.3; legacy name `<usa-nav-flyout>`) — nav links with dropdown flyouts anchored under their
 * trigger. One shared background slides and resizes from flyout to flyout (position, width and height), so moving
 * along the bar feels like one surface. Same markup, keyboard, hover intent and events as `<mo-mega-menu>`:
 * `<div><button>Docs</button><div data-panel>…</div></div>` items or plain links; `label`, `delay`, `close-delay`;
 * `openItem(i, focus?)`, `close(focusTrigger?)`; `usa:open` / `usa:close` (`{ index }`). Flyouts stay inside the bar's
 * width. Reduced motion: the background jumps.
 */
export const defineNavFlyout = (tag = 'usa-nav-flyout'): CustomElementConstructor | undefined => navPanels(tag, 'flyout');

export type UsaMegaMenuElement = UsaNavPanelsElement;
export type UsaNavFlyoutElement = UsaNavPanelsElement;
