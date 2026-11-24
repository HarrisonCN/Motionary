import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make, uniqueId } from './moments';
import css from './page-kit.css?raw';

/** A plain, permissive email check: something@something.tld, no spaces, at most 254 characters. */
export function isEmail(text: string): boolean {
  const s = String(text ?? '').trim();
  return s.length <= 254 && /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(s);
}

const CHECK = '<svg class="usa-sub-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

/**
 * A newsletter sign-up: an email field and a button in one pill. A bad address shakes the field and says why; a good
 * one emits `usa:subscribe` with the address. The element never sends anything itself: if no listener calls
 * `preventDefault()` it shows the thank-you state at once; a listener that does can call `done()` or `error(message)`
 * when its own request finishes (the button shows a spinner meanwhile). The button then shrinks to a drawn tick.
 * Messages go to a polite live region. Any element children are kept above the form as its intro.
 *
 * Attributes: `label` (Email address), `placeholder` (you@example.com), `button-label` (Subscribe),
 * `success` (Thanks! Check your inbox.), `invalid` (Enter a valid email address).
 * Events `usa:subscribe` ({ email }, cancelable), `usa:done`, `usa:error` ({ message }).
 */
export interface UsaSubscribeElement extends UsaElement {
  readonly state: 'idle' | 'sending' | 'done' | 'error';
  done(): void;
  error(message?: string): void;
  reset(): void;
}

export function defineSubscribe(tag = 'usa-subscribe'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class Subscribe extends Base {
    static get observedAttributes(): string[] { return ['label', 'placeholder', 'button-label', 'success', 'invalid']; }
    private _state: 'idle' | 'sending' | 'done' | 'error' = 'idle';
    private _set?: (s: 'idle' | 'sending' | 'done' | 'error', msg?: string) => void;
    get state(): 'idle' | 'sending' | 'done' | 'error' { return this._state; }
    done(): void { if (this._state === 'sending') { this._set?.('done'); this.emit('done'); } }
    error(message?: string): void { if (this._state === 'sending') { const m = String(message || 'Something went wrong. Try again.'); this._set?.('error', m); this.emit('error', { message: m }); } }
    reset(): void { this._set?.('idle'); }
    mount(): void {
      const form = make('form', 'usa-kit usa-sub');
      form.noValidate = true;
      const row = make('div', 'usa-sub-row');
      const input = make('input', 'usa-sub-input');
      input.type = 'email';
      input.name = 'email';
      input.autocomplete = 'email';
      input.required = true;
      input.placeholder = this.str('placeholder', 'you@example.com');
      input.setAttribute('aria-label', this.str('label', 'Email address'));
      const btn = make('button', 'usa-sub-btn');
      btn.type = 'submit';
      const text = make('span', 'usa-sub-text', this.str('button-label', 'Subscribe'));
      btn.append(text);
      btn.insertAdjacentHTML('beforeend', CHECK);
      const check = btn.lastElementChild as SVGElement;
      const msg = make('p', 'usa-sub-msg');
      msg.id = uniqueId('usa-sub');
      msg.setAttribute('role', 'status');
      input.setAttribute('aria-describedby', msg.id);
      row.append(input, btn);
      form.append(row, msg);
      this.append(form);
      const set = (s: 'idle' | 'sending' | 'done' | 'error', m = '') => {
        this._state = s;
        form.dataset.state = s;
        form.toggleAttribute('data-static', this.reduced);
        const sending = s === 'sending', done = s === 'done';
        btn.disabled = sending || done;
        input.readOnly = sending || done;
        input.setAttribute('aria-invalid', String(s === 'error'));
        text.hidden = done;
        check.style.display = done ? '' : 'none';
        btn.setAttribute('aria-label', done ? this.str('success', 'Thanks! Check your inbox.') : this.str('button-label', 'Subscribe'));
        msg.textContent = done ? this.str('success', 'Thanks! Check your inbox.') : m;
      };
      this._set = set;
      this.listen(form, 'submit', (e: Event) => {
        e.preventDefault();
        if (this._state === 'sending' || this._state === 'done') return;
        const email = input.value.trim();
        if (!isEmail(email)) {
          set('error', this.str('invalid', 'Enter a valid email address'));
          void form.offsetWidth;
          input.focus();
          return;
        }
        set('sending');
        const free = this.emit('subscribe', { email });
        if (free) { set('done'); this.emit('done'); }
      });
      this.listen(input, 'input', () => { if (this._state === 'error') set('idle'); });
      this.onCleanup(() => {
        form.remove();
        this._set = undefined;
        this._state = 'idle';
      });
      set('idle');
    }
  }, { id: 'page-kit', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
