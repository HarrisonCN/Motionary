import { defineElement, type UsaElement } from '../base';
import css from './red-envelope.css?raw';

/**
 * `<usa-red-envelope amount="88.88" from="Grandma">` (8.1) — a Lunar New
 * Year red envelope (红包): tap / Enter / Space and the flap swings open, the
 * card slides out with the `amount` (counting up, `currency`, default ¥)
 * and gold coins pop out. `message` (default 恭喜发财), `from`, `opened`
 * (initial state); `open()`, `close()`; `usa:open` { amount }. A real
 * `<button aria-expanded>`; reduced motion: opens without the swing, slide,
 * count or coins.
 */
export interface UsaRedEnvelopeElement extends UsaElement {
  readonly opened: boolean;
  open(): void;
  close(): void;
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);

export function defineRedEnvelope(tag = 'usa-red-envelope'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaRedEnvelope extends Base {
        static get observedAttributes(): string[] {
          return ['amount', 'currency', 'message', 'from', 'opened'];
        }
        get opened(): boolean {
          return this.hasAttribute('data-open');
        }
        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          const msg = this.str('message', '恭喜发财');
          this.insertAdjacentHTML(
            'beforeend',
            `<button type="button" class="usa-re" aria-expanded="false" aria-label="${esc(`Open red envelope${this.str('from') ? ` from ${this.str('from')}` : ''}`)}" data-usa-part><span class="usa-re-card" aria-hidden="true"><span class="usa-re-amt"></span><span class="usa-re-from">${esc(this.str('from'))}</span></span><span class="usa-re-body"><span class="usa-re-msg">${esc(msg)}</span></span><span class="usa-re-flap"><span class="usa-re-seal">福</span></span><span class="usa-re-coins" aria-hidden="true"></span><span class="usa-re-live" aria-live="polite"></span></button>`
          );
          this.listen(this.querySelector('.usa-re') as Element, 'click', () => (this.opened ? this.close() : this.open()));
          if (this.flag('opened')) this.open(true);
        }
        open(quiet = false): void {
          if (this.opened) return;
          this.setAttribute('data-open', '');
          const btn = this.querySelector('.usa-re') as HTMLElement;
          btn.setAttribute('aria-expanded', 'true');
          const amount = this.num('amount', 8.88);
          const cur = this.str('currency', '¥');
          const amt = this.querySelector('.usa-re-amt') as HTMLElement;
          const fmt = (v: number) => `${cur}${v.toFixed(Number.isInteger(amount) ? 0 : 2)}`;
          amt.textContent = fmt(amount);
          (this.querySelector('.usa-re-live') as HTMLElement).textContent = `${fmt(amount)}${this.str('from') ? ` from ${this.str('from')}` : ''}`;
          if (!quiet && !this.reduced) {
            this.motion(this.querySelector('.usa-re-flap') as Element, [{ transform: 'rotateX(0)' }, { transform: 'rotateX(180deg)' }], { duration: 450, easing: 'ease-in-out' });
            this.motion(this.querySelector('.usa-re-card') as Element, [{ transform: 'translateY(0)' }, { transform: 'translateY(-46%)' }], { duration: 520, delay: 300, easing: 'cubic-bezier(.3,1.4,.5,1)', fill: 'backwards' });
            const t0 = performance.now();
            const step = () => {
              const k = Math.min(1, (performance.now() - t0 - 350) / 700);
              amt.textContent = fmt(amount * Math.max(0, 1 - Math.pow(1 - Math.max(0, k), 3)));
              if (k < 1 && this.isConnected) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
            const coins = this.querySelector('.usa-re-coins') as HTMLElement;
            for (let i = 0; i < 7; i++) {
              const c = document.createElement('i');
              coins.appendChild(c);
              const x = (i - 3) * 22;
              const a = this.motion(c, [{ transform: 'translate(-50%,0) scale(.3)', opacity: 0 }, { transform: `translate(calc(-50% + ${x}px), -${70 + (i % 3) * 18}px) scale(1) rotateY(360deg)`, opacity: 1, offset: 0.5 }, { transform: `translate(calc(-50% + ${x * 1.3}px), 10px) scale(.8) rotateY(720deg)`, opacity: 0 }], { duration: 1100, delay: 450 + i * 40, easing: 'ease-out', fill: 'backwards' });
              const rm = () => c.remove();
              if (a) a.finished.then(rm, rm);
              else rm();
            }
          }
          this.emit('open', { amount });
        }
        close(): void {
          this.removeAttribute('data-open');
          this.querySelector('.usa-re')?.setAttribute('aria-expanded', 'false');
        }
      }
      return UsaRedEnvelope as unknown as CustomElementConstructor;
    },
    { id: 'red-envelope', text: css }
  );
}
