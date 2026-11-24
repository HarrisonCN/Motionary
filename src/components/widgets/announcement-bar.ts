import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { ownChildren } from './kit';
import css from './ui-blocks.css?raw';

/**
 * A slim bar for one or more announcements. With several element children it rolls from one message to the next
 * every `interval` ms; rolling pauses while the bar is hovered or focused, and a pause button stops it for good
 * (WCAG 2.2.2). The close button folds the bar away and the element becomes `hidden`. Nothing is stored: whether a
 * dismissed bar stays dismissed on the next visit is up to the page (listen for `usa:dismiss`).
 *
 * Attributes: `interval` (ms, 2500–20000; 5000), `dismissible` (adds a close button), `label`
 * (Announcements), `close-label` (Dismiss), `tone` (neutral | accent | warning).
 * Methods `dismiss()`, `next()`, `previous()`. Events `usa:change` ({ index }), `usa:dismiss`.
 */
export interface UsaAnnouncementBarElement extends UsaElement {
  readonly index: number;
  dismiss(): void;
  next(): void;
  previous(): void;
}

export function defineAnnouncementBar(tag = 'usa-announcement-bar'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class AnnouncementBar extends Base {
    static get observedAttributes(): string[] { return ['interval', 'dismissible', 'label', 'close-label', 'tone']; }
    private _index = 0;
    private _go?: (i: number) => void;
    private _dismiss?: () => void;
    get index(): number { return this._index; }
    dismiss(): void { this._dismiss?.(); }
    next(): void { this._go?.(this._index + 1); }
    previous(): void { this._go?.(this._index - 1); }
    mount(): void {
      const msgs = ownChildren(this);
      const root = make('section', 'usa-kit usa-ann');
      root.setAttribute('aria-label', this.str('label', 'Announcements'));
      root.dataset.tone = ['accent', 'warning'].includes(this.str('tone')) ? this.str('tone') : 'neutral';
      const track = make('div', 'usa-ann-track');
      const slides = msgs.map((m, i) => {
        const s = make('div', 'usa-ann-msg');
        s.append(m);
        s.hidden = i !== 0;
        track.append(s);
        return s;
      });
      root.append(track);
      const rotating = msgs.length > 1;
      let paused = false, hold = false, timer = 0;
      const pauseBtn = make('button', 'usa-ann-btn usa-ann-pause');
      pauseBtn.type = 'button';
      if (rotating) root.append(pauseBtn);
      const close = make('button', 'usa-ann-btn usa-ann-close');
      close.type = 'button';
      close.setAttribute('aria-label', this.str('close-label', 'Dismiss'));
      close.append(make('span', 'usa-ann-x'));
      if (this.flag('dismissible')) root.append(close);
      this.append(root);
      root.toggleAttribute('data-static', this.reduced);
      const show = (i: number) => {
        if (!slides.length) return;
        const n = slides.length, to = ((i % n) + n) % n, from = this._index;
        if (to === from) return;
        this._index = to;
        const dir = i > from ? 1 : -1;
        const a = slides[from], b = slides[to];
        b.hidden = false;
        if (this.reduced) a.hidden = true;
        else {
          this.motion(b, [{ transform: `translateY(${dir * 100}%)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.22,1,.36,1)' });
          const out = this.motion(a, [{ transform: 'none', opacity: 1 }, { transform: `translateY(${-dir * 100}%)`, opacity: 0 }], { duration: 420, easing: 'cubic-bezier(.22,1,.36,1)' });
          if (out) out.finished.then(() => (a.hidden = this._index !== from), () => {}); else a.hidden = true;
        }
        this.emit('change', { index: to });
      };
      this._go = show;
      const schedule = () => {
        clearTimeout(timer);
        if (!rotating || paused || hold) return;
        const ms = Math.min(20000, Math.max(2500, this.num('interval', 5000)));
        timer = window.setTimeout(() => { show(this._index + 1); schedule(); }, ms);
      };
      const syncPause = () => {
        pauseBtn.setAttribute('aria-label', paused ? 'Play announcements' : 'Pause announcements');
        pauseBtn.setAttribute('aria-pressed', String(paused));
        root.toggleAttribute('data-paused', paused);
      };
      this.listen(pauseBtn, 'click', () => { paused = !paused; syncPause(); schedule(); });
      const holdOn = () => { hold = true; clearTimeout(timer); };
      const holdOff = () => { hold = root.matches(':hover') || root.contains(document.activeElement); schedule(); };
      this.listen(root, 'pointerenter', holdOn);
      this.listen(root, 'pointerleave', holdOff);
      this.listen(root, 'focusin', holdOn);
      this.listen(root, 'focusout', () => setTimeout(holdOff));
      this._dismiss = () => {
        clearTimeout(timer);
        const done = () => { this.hidden = true; this.emit('dismiss'); };
        const h = root.offsetHeight;
        const a = this.reduced ? null : this.motion(root, [{ height: `${h}px`, opacity: 1 }, { height: '0px', opacity: 0, paddingTop: '0px', paddingBottom: '0px' }], { duration: 320, easing: 'cubic-bezier(.4,0,.2,1)' });
        if (a) a.finished.then(done, done); else done();
      };
      this.listen(close, 'click', () => this._dismiss?.());
      this.inView((visible) => { hold = !visible || root.matches(':hover'); schedule(); });
      this.onCleanup(() => {
        clearTimeout(timer);
        this.append(...msgs);
        root.remove();
        this._go = this._dismiss = undefined;
        this._index = 0;
      });
      syncPause();
      schedule();
    }
  }, { id: 'ui-blocks', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
