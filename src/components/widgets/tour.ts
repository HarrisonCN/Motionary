import { defineElement, raf, caf, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make, uniqueId } from './moments';
import { tourPlace } from './kit-13';
import css from './ui-kit-13.css?raw';

/**
 * A guided product tour. Each child with `data-step` is one step: its `data-target` (a CSS selector) names the part of
 * the page to point at, `data-title` its heading and its content the text. A child button with `data-start` starts the
 * tour (so does `start()` or the `open` attribute). The page dims except for a soft cut-out around the target, and a
 * card with Back / Next / Done and Skip sits next to it, scrolling the target into view first. The card is a labelled
 * non-modal dialog that takes focus; Escape ends the tour and focus goes back to where it was.
 *
 * Attributes: `open`, `label` (Tour), `next-label` (Next), `back-label` (Back), `done-label` (Done), `skip-label` (Skip),
 * `count-label` ("{n} of {total}"), `padding` (cut-out padding in px; 8).
 * Events `usa:step` ({ index }), `usa:end` ({ completed }).
 */
export interface UsaTourElement extends UsaElement {
  readonly index: number;
  start(index?: number): void;
  next(): void;
  back(): void;
  end(): void;
}

export function defineTour(tag = 'usa-tour'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class Tour extends Base {
    static get observedAttributes(): string[] { return ['open', 'label', 'next-label', 'back-label', 'done-label', 'skip-label', 'count-label', 'padding']; }
    private _i = -1;
    private _go?: (i: number) => void;
    private _stop?: (completed: boolean) => void;
    get index(): number { return this._i; }
    start(index = 0): void { this._go?.(index); }
    next(): void { if (this._i >= 0) this._go?.(this._i + 1); }
    back(): void { if (this._i > 0) this._go?.(this._i - 1); }
    end(): void { this._stop?.(false); }
    mount(): void {
      const steps = Array.from(this.querySelectorAll<HTMLElement>(':scope > [data-step]'));
      const hidden = steps.map((s) => s.hidden);
      for (const s of steps) s.hidden = true;
      const root = make('div', 'usa-kit usa-tour');
      root.hidden = true;
      const shade = make('div', 'usa-tour-shade');
      shade.setAttribute('aria-hidden', 'true');
      const card = make('div', 'usa-tour-card');
      const id = uniqueId('usa-tour');
      card.setAttribute('role', 'dialog');
      card.setAttribute('aria-labelledby', `${id}-t`);
      card.setAttribute('aria-describedby', `${id}-b`);
      card.tabIndex = -1;
      const count = make('p', 'usa-tour-count');
      const title = make('h2', 'usa-tour-title');
      title.id = `${id}-t`;
      const body = make('div', 'usa-tour-body');
      body.id = `${id}-b`;
      const bar = make('div', 'usa-tour-bar');
      const skip = make('button', 'usa-tour-skip', this.str('skip-label', 'Skip'));
      const back = make('button', 'usa-tour-back', this.str('back-label', 'Back'));
      const next = make('button', 'usa-tour-next');
      for (const b of [skip, back, next]) b.type = 'button';
      const dots = make('span', 'usa-tour-dots');
      dots.setAttribute('aria-hidden', 'true');
      steps.forEach(() => dots.append(make('i')));
      bar.append(skip, dots, back, next);
      const arrow = make('span', 'usa-tour-arrow');
      arrow.setAttribute('aria-hidden', 'true');
      card.append(arrow, count, title, body, bar);
      root.append(shade, card);
      root.toggleAttribute('data-static', this.reduced);
      this.append(root);
      const pad = Math.max(0, Math.min(40, this.num('padding', 8)));
      let returnTo: HTMLElement | null = null;
      let target: Element | null = null;
      let frame = 0;
      const find = (sel: string | null): Element | null => {
        if (!sel) return null;
        try { return document.querySelector(sel); } catch { return null; }
      };
      const place = () => {
        frame = 0;
        if (this._i < 0) return;
        const vw = document.documentElement.clientWidth || window.innerWidth;
        const vh = window.innerHeight;
        const r = target?.getBoundingClientRect();
        const box = r && (r.width || r.height)
          ? { top: r.top - pad, left: r.left - pad, width: r.width + pad * 2, height: r.height + pad * 2 }
          : { top: vh / 2, left: vw / 2, width: 0, height: 0 };
        shade.style.cssText = `top:${box.top}px;left:${box.left}px;width:${box.width}px;height:${box.height}px`;
        shade.toggleAttribute('data-none', !(r && (r.width || r.height)));
        const p = tourPlace(box, { width: card.offsetWidth || 300, height: card.offsetHeight || 160 }, { width: vw, height: vh });
        card.style.top = `${Math.max(8, p.top)}px`;
        card.style.left = `${p.left}px`;
        card.dataset.side = p.side;
        card.style.setProperty('--arrow', `${Math.max(16, Math.min((card.offsetWidth || 300) - 16, box.left + box.width / 2 - p.left))}px`);
      };
      const later = () => { if (!frame) frame = raf(place, this); };
      const label = (k: string, d: string) => this.str(k, d);
      const go = (i: number) => {
        if (!steps.length) return;
        if (i >= steps.length) { stop(true); return; }
        const first = this._i < 0;
        if (first) returnTo = document.activeElement as HTMLElement | null;
        this._i = Math.max(0, i);
        const s = steps[this._i];
        target = find(s.getAttribute('data-target'));
        title.textContent = s.getAttribute('data-title') || label('label', 'Tour');
        body.replaceChildren(...Array.from(s.cloneNode(true).childNodes));
        count.textContent = label('count-label', '{n} of {total}').replace('{n}', String(this._i + 1)).replace('{total}', String(steps.length));
        back.hidden = this._i === 0;
        next.textContent = this._i === steps.length - 1 ? label('done-label', 'Done') : label('next-label', 'Next');
        Array.from(dots.children).forEach((d, j) => d.toggleAttribute('data-on', j === this._i));
        root.hidden = false;
        root.setAttribute('data-open', '');
        card.removeAttribute('data-in');
        void card.offsetWidth;
        card.setAttribute('data-in', '');
        (target as HTMLElement | null)?.scrollIntoView?.({ block: 'center', inline: 'nearest', behavior: this.reduced ? 'auto' : 'smooth' });
        place();
        later();
        card.focus({ preventScroll: true });
        this.emit('step', { index: this._i });
      };
      const stop = (completed: boolean) => {
        if (this._i < 0) return;
        this._i = -1;
        root.hidden = true;
        root.removeAttribute('data-open');
        target = null;
        if (frame) caf(frame), (frame = 0);
        this.emit('end', { completed });
        if (this.hasAttribute('open')) this.removeAttribute('open');
        returnTo?.focus?.();
      };
      this._go = go;
      this._stop = stop;
      this.listen(next, 'click', () => go(this._i + 1));
      this.listen(back, 'click', () => go(this._i - 1));
      this.listen(skip, 'click', () => stop(false));
      this.listen(card, 'keydown', (e: KeyboardEvent) => {
        if (e.key === 'Escape') { e.preventDefault(); stop(false); }
      });
      this.listen(window, 'resize', later);
      this.listen(window, 'scroll', later, { passive: true, capture: true } as AddEventListenerOptions);
      for (const b of Array.from(this.querySelectorAll<HTMLElement>(':scope > [data-start], :scope [data-start]')))
        if (!root.contains(b)) this.listen(b, 'click', () => go(0));
      if (this.flag('open')) go(0);
      this.onCleanup(() => {
        if (frame) caf(frame);
        const was = this._i;
        this._i = -1;
        root.remove();
        steps.forEach((s, j) => (s.hidden = hidden[j]));
        this._go = undefined;
        this._stop = undefined;
        if (was >= 0) returnTo?.focus?.();
      });
    }
  }, { id: 'ui-kit-13', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
