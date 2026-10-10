import { defineElement, type UsaElement } from '../base';
import css from './otp.css?raw';

/**
 * `<usa-otp>` (7.7) — a one-time-code input: `length` boxes (default 6; an initial `value` is typed in) that
 * auto-advance as you type, step back on Backspace, move with the arrow keys
 * and take a pasted code in one go (`autocomplete="one-time-code"` on the
 * first box for SMS autofill). Each digit pops in; when all boxes are filled
 * `usa:complete` fires with the code. `error()` shakes the row red and clears
 * it, `success()` turns it green with a wave; `fillCode(code)`, `clear()`. `mode="alnum"` allows
 * letters. A labelled `role="group"`; reduced motion: no pop, shake or wave.
 */
export interface UsaOtpElement extends UsaElement {
  readonly value: string;
  fillCode(code: string): void;
  clear(): void;
  error(message?: string): void;
  success(): void;
}

/** Keep only the characters an OTP accepts (7.7). */
export function sanitizeCode(s: string, mode: 'numeric' | 'alnum' = 'numeric'): string {
  return (mode === 'alnum' ? s.replace(/[^0-9a-z]/gi, '').toUpperCase() : s.replace(/\D/g, ''));
}

export function defineOtp(tag = 'usa-otp'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaOtp extends Base {
        static get observedAttributes(): string[] {
          return ['length', 'mode', 'label', 'value'];
        }
        private boxes(): HTMLInputElement[] {
          return Array.from(this.querySelectorAll<HTMLInputElement>('.usa-otp-box'));
        }
        get value(): string {
          return this.boxes()
            .map((b) => b.value)
            .join('');
        }
        private get mode(): 'numeric' | 'alnum' {
          return this.str('mode') === 'alnum' ? 'alnum' : 'numeric';
        }
        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          const n = Math.max(3, Math.min(10, Math.round(this.num('length', 6))));
          const label = this.str('label', 'Verification code');
          const im = this.mode === 'alnum' ? 'text' : 'numeric';
          let html = `<div class="usa-otp" role="group" aria-label="${label.replace(/"/g, '&quot;')}" data-usa-part>`;
          for (let i = 0; i < n; i++) html += `<input class="usa-otp-box" maxlength="1" inputmode="${im}" aria-label="Digit ${i + 1} of ${n}"${i === 0 ? ' autocomplete="one-time-code"' : ' autocomplete="off"'}>`;
          html += '</div>';
          this.insertAdjacentHTML('beforeend', html);
          const boxes = this.boxes();
          boxes.forEach((b, i) => {
            this.listen(b, 'input', () => {
              const v = sanitizeCode(b.value, this.mode);
              if (v.length > 1) return this.fill(v, i);
              b.value = v;
              if (v) {
                this.pop(b);
                boxes[i + 1]?.focus();
              }
              this.check();
            });
            this.listen(b, 'keydown', (e: KeyboardEvent) => {
              if (e.key === 'Backspace' && !b.value && i > 0) {
                e.preventDefault();
                boxes[i - 1].value = '';
                boxes[i - 1].focus();
                this.check();
              } else if (e.key === 'ArrowLeft' && i > 0) boxes[i - 1].focus();
              else if (e.key === 'ArrowRight' && i < boxes.length - 1) boxes[i + 1].focus();
            });
            this.listen(b, 'paste', (e: ClipboardEvent) => {
              const t = e.clipboardData?.getData('text') || '';
              if (!t) return;
              e.preventDefault();
              this.fill(sanitizeCode(t, this.mode), i);
            });
            this.listen(b, 'focus', () => b.select?.());
          });
          const init = sanitizeCode(this.str('value'), this.mode);
          if (init) this.fill(init, 0, false);
        }
        /** Types `code` into the boxes (no focus move), e.g. from an SMS autofill or a demo. */
        fillCode(code: string): void {
          this.boxes().forEach((b) => (b.value = ''));
          this.fill(sanitizeCode(code, this.mode), 0, false);
        }
        private fill(code: string, from = 0, focus = true): void {
          const boxes = this.boxes();
          const chars = code.split('');
          let last = from;
          for (let i = from; i < boxes.length && chars.length; i++) {
            boxes[i].value = chars.shift() as string;
            this.pop(boxes[i], (i - from) * 40);
            last = i;
          }
          if (focus) boxes[Math.min(boxes.length - 1, last + 1)]?.focus();
          this.check();
        }
        private pop(b: HTMLElement, delay = 0): void {
          if (!this.reduced) this.motion(b, [{ transform: 'scale(.7)' }, { transform: 'scale(1.12)' }, { transform: 'none' }], { duration: 240, delay, easing: 'ease-out' });
        }
        private check(): void {
          this.removeAttribute('data-state');
          const boxes = this.boxes();
          boxes.forEach((b) => b.toggleAttribute('data-filled', !!b.value));
          if (boxes.every((b) => b.value)) this.emit('complete', { code: this.value });
        }
        clear(): void {
          const boxes = this.boxes();
          boxes.forEach((b) => {
            b.value = '';
            b.removeAttribute('data-filled');
          });
        }
        error(message = 'Wrong code'): void {
          this.setAttribute('data-state', 'error');
          const row = this.querySelector('.usa-otp');
          row?.setAttribute('aria-description', message);
          const done = () => {
            if (this.getAttribute('data-state') === 'error') {
              this.clear();
              this.setAttribute('data-state', 'error');
            }
          };
          const a = this.reduced || !row ? null : this.motion(row, [{ transform: 'none' }, { transform: 'translateX(-10px)' }, { transform: 'translateX(9px)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(4px)' }, { transform: 'none' }], { duration: 450, easing: 'ease-out' });
          if (a) a.finished.then(done, () => undefined);
          else done();
        }
        success(): void {
          this.setAttribute('data-state', 'success');
          if (this.reduced) return;
          this.boxes().forEach((b, i) => this.motion(b, [{ transform: 'none' }, { transform: 'translateY(-8px)' }, { transform: 'none' }], { duration: 360, delay: i * 55, easing: 'ease-out' }));
        }
      }
      return UsaOtp as unknown as CustomElementConstructor;
    },
    { id: 'otp', text: css }
  );
}
