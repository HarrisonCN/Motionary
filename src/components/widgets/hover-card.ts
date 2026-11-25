import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { uniqueId } from './moments';
import css from './ui-kit-15.css?raw';

/**
 * A preview card that opens when the pointer rests on a trigger or the trigger takes keyboard focus, and closes a
 * moment after both leave, so the pointer can move onto the card (to follow a link in it) without it vanishing. The
 * child with `data-trigger` is the trigger and the child with `data-card` the card; the card describes the trigger
 * (`aria-describedby`) and Escape closes it. Nothing opens on touch alone, so the trigger's own link still works.
 *
 * Attributes: `open-delay` (ms; 300), `close-delay` (ms; 200), `placement` (bottom | top | start | end; bottom),
 * `open`.
 * Event `usa:toggle` ({ open }).
 */
export interface UsaHoverCardElement extends UsaElement {
  readonly open: boolean;
  show(): void;
  hide(): void;
}

export function defineHoverCard(tag = 'usa-hover-card'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class HoverCard extends Base {
    static get observedAttributes(): string[] { return ['open-delay', 'close-delay', 'placement', 'open']; }
    private _open = false;
    private _set?: (open: boolean) => void;
    get open(): boolean { return this._open; }
    show(): void { this._set?.(true); }
    hide(): void { this._set?.(false); }
    mount(): void {
      const trigger = this.querySelector<HTMLElement>(':scope > [data-trigger]');
      const card = this.querySelector<HTMLElement>(':scope > [data-card]');
      if (!trigger || !card) return;
      this.classList.add('usa-hcard');
      this.toggleAttribute('data-static', this.reduced);
      const place = this.str('placement', 'bottom');
      this.dataset.placement = ['top', 'start', 'end'].includes(place) ? place : 'bottom';
      const hadId = card.id;
      if (!card.id) card.id = uniqueId('usa-hcard');
      const before = trigger.getAttribute('aria-describedby');
      trigger.setAttribute('aria-describedby', [before, card.id].filter(Boolean).join(' '));
      const hadClass = card.hasAttribute('class');
      card.classList.add('usa-hcard-card');
      const wasHidden = card.hidden;
      card.hidden = true;
      const openDelay = Math.max(0, Math.min(5000, this.num('open-delay', 300)));
      const closeDelay = Math.max(0, Math.min(5000, this.num('close-delay', 200)));
      let timer = 0;
      const clear = () => { if (timer) clearTimeout(timer), (timer = 0); };
      const set = (open: boolean) => {
        clear();
        if (open === this._open) return;
        this._open = open;
        card.hidden = !open;
        this.toggleAttribute('data-open', open);
        this.emit('toggle', { open });
      };
      this._set = set;
      const later = (open: boolean) => {
        clear();
        if (open === this._open) return;
        timer = window.setTimeout(() => set(open), open ? openDelay : closeDelay);
      };
      for (const el of [trigger, card]) {
        this.listen(el, 'pointerenter', (e: PointerEvent) => { if (e.pointerType !== 'touch') later(true); });
        this.listen(el, 'pointerleave', (e: PointerEvent) => { if (e.pointerType !== 'touch') later(false); });
      }
      this.listen(this, 'focusin', () => later(true));
      this.listen(this, 'focusout', (e: FocusEvent) => { if (!this.contains(e.relatedTarget as Node)) later(false); });
      // Escape closes it wherever focus is, since a card opened by hover has none inside it
      this.listen(document, 'keydown', (e: KeyboardEvent) => {
        if (e.key === 'Escape' && this._open) set(false);
      });
      if (this.flag('open')) set(true);
      this.onCleanup(() => {
        clear();
        this._set = undefined;
        this._open = false;
        card.hidden = wasHidden;
        card.classList.remove('usa-hcard-card');
        if (!hadClass) card.removeAttribute('class');
        if (!hadId) card.removeAttribute('id');
        if (before === null) trigger.removeAttribute('aria-describedby');
        else trigger.setAttribute('aria-describedby', before);
        this.classList.remove('usa-hcard');
        if (!this.className) this.removeAttribute('class');
        this.removeAttribute('data-open');
        this.removeAttribute('data-static');
        delete this.dataset.placement;
      });
    }
  }, { id: 'ui-kit-15', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
