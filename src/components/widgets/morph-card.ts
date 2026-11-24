import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make, uniqueId } from './moments';
import css from './parts-kit.css?raw';

/** The transform that makes a box at `to` look like it sits at `from` (FLIP "invert" step). */
export function invertRect(from: { left: number; top: number; width: number; height: number }, to: { left: number; top: number; width: number; height: number }): string {
  const sx = to.width ? from.width / to.width : 1;
  const sy = to.height ? from.height / to.height : 1;
  const r = (n: number) => Math.round(n * 1000) / 1000;
  return `translate(${r(from.left - to.left)}px, ${r(from.top - to.top)}px) scale(${r(sx)}, ${r(sy)})`;
}

/**
 * A card that grows into its detail view. The first element child is the card (wrapped in a real button); the child
 * marked `data-detail` is what opens. Pressing the card opens a native modal `<dialog>` whose panel morphs out of the
 * card's own box (one shared-element FLIP) while the backdrop fades in; closing, Escape or a click on the backdrop
 * shrinks it back into the card and returns focus. Under reduced motion it simply opens and closes.
 *
 * Attributes: `label` (accessible name of the card button; the card's text otherwise), `close-label` (Close).
 * Events `usa:open`, `usa:close`.
 */
export interface UsaMorphCardElement extends UsaElement {
  readonly open: boolean;
  show(): void;
  close(): void;
}

export function defineMorphCard(tag = 'usa-morph-card'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class MorphCard extends Base {
    static get observedAttributes(): string[] { return ['label', 'close-label']; }
    private _api?: { show(): void; close(): void; isOpen(): boolean };
    get open(): boolean { return !!this._api?.isOpen(); }
    show(): void { this._api?.show(); }
    close(): void { this._api?.close(); }
    mount(): void {
      const detail = this.querySelector(':scope > [data-detail]') as HTMLElement | null;
      const card = (Array.from(this.children) as HTMLElement[]).find((c) => c !== detail && !c.className.toString().startsWith('usa-'));
      if (!card || !detail) return;
      const trigger = make('button', 'usa-kit usa-morph-open');
      trigger.type = 'button';
      const label = this.str('label');
      if (label) trigger.setAttribute('aria-label', label);
      trigger.setAttribute('aria-haspopup', 'dialog');
      this.insertBefore(trigger, card);
      trigger.append(card);
      const dialog = make('dialog', 'usa-kit usa-morph-dialog');
      dialog.id = uniqueId('usa-morph');
      trigger.setAttribute('aria-controls', dialog.id);
      const closeBtn = make('button', 'usa-morph-close', '×');
      closeBtn.type = 'button';
      closeBtn.setAttribute('aria-label', this.str('close-label', 'Close'));
      const body = make('div', 'usa-morph-body');
      const wasHidden = detail.hidden;
      detail.hidden = false;
      body.append(detail);
      dialog.append(closeBtn, body);
      const heading = detail.querySelector('h1, h2, h3, h4');
      if (heading) { if (!heading.id) heading.id = `${dialog.id}-h`; dialog.setAttribute('aria-labelledby', heading.id); }
      else dialog.setAttribute('aria-label', label || (card.textContent || '').trim().slice(0, 80));
      this.append(dialog);
      let busy: Animation | null = null;
      const morph = (opening: boolean): Animation | null => {
        if (this.reduced) return null;
        const from = trigger.getBoundingClientRect(), to = dialog.getBoundingClientRect();
        if (!to.width || !from.width) return null;
        const small = { transform: invertRect(from, to), borderRadius: '14px', opacity: 0.6 };
        const big = { transform: 'none', borderRadius: '22px', opacity: 1 };
        dialog.style.transformOrigin = '0 0';
        return this.motion(dialog, opening ? [small, big] : [big, small], { duration: opening ? 460 : 340, easing: 'cubic-bezier(.22,1,.36,1)' });
      };
      const show = () => {
        if (dialog.open) return;
        busy?.cancel();
        if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
        dialog.toggleAttribute('data-anim', !this.reduced);
        trigger.setAttribute('aria-expanded', 'true');
        busy = morph(true);
        closeBtn.focus();
        this.emit('open');
      };
      const close = () => {
        if (!dialog.open) return;
        const done = () => {
          busy = null;
          if (typeof dialog.close === 'function') dialog.close();
          else { dialog.removeAttribute('open'); dialog.dispatchEvent(new Event('close')); }
        };
        trigger.setAttribute('aria-expanded', 'false');
        busy = morph(false);
        if (busy) busy.finished.then(done, done); else done();
      };
      this._api = { show, close, isOpen: () => dialog.open };
      trigger.setAttribute('aria-expanded', 'false');
      this.listen(trigger, 'click', show);
      this.listen(closeBtn, 'click', close);
      this.listen(dialog, 'cancel', (e: Event) => { e.preventDefault(); close(); });
      this.listen(dialog, 'click', (e: MouseEvent) => { if (e.target === dialog) close(); });
      this.listen(dialog, 'close', () => { trigger.setAttribute('aria-expanded', 'false'); trigger.focus(); this.emit('close'); });
      this.onCleanup(() => {
        busy?.cancel();
        if (dialog.open) { if (typeof dialog.close === 'function') dialog.close(); else dialog.removeAttribute('open'); }
        detail.hidden = wasHidden;
        if (heading?.id === `${dialog.id}-h`) heading.removeAttribute('id');
        this.insertBefore(card, trigger);
        this.append(detail);
        trigger.remove();
        dialog.remove();
        this._api = undefined;
      });
    }
  }, { id: 'parts-kit', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
