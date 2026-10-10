import { defineElement, type UsaElement } from '../base';
import css from './reactions.css?raw';

/**
 * `<usa-reactions>` (7.4) — an emoji reaction bar (Slack / iMessage style).
 * `emojis` ("👍,❤️,😂,🎉") with optional `counts` ("3,1,0,0"). Clicking a pill
 * toggles your reaction: the count rolls up / down, the emoji pops and a few
 * copies float up. A ＋ button opens a small picker that springs open. Each
 * pill is a `button` with `aria-pressed` and a label ("❤️ 2 reactions").
 * `usa:react` (`{ emoji, on, count }`). Reduced motion: no pop, roll or float.
 */
export interface UsaReactionsElement extends UsaElement {
  /** emoji → count */
  readonly counts: Record<string, number>;
  /** Your active reactions. */
  readonly mine: string[];
  toggle(emoji: string, on?: boolean): void;
}

/** Parse "👍,❤️" + "3,1" into ordered [emoji, count] pairs (7.4). */
export function parseReactions(emojis: string, counts = ''): [string, number][] {
  const c = counts.split(',').map((n) => Math.max(0, parseInt(n, 10) || 0));
  return emojis.split(',').map((e) => e.trim()).filter(Boolean).map((e, i) => [e, c[i] || 0]);
}

export function defineReactions(tag = 'usa-reactions'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaReactions extends Base {
        static get observedAttributes(): string[] {
          return ['emojis', 'counts', 'picker'];
        }
        private _c = new Map<string, number>();
        private _mine = new Set<string>();
        get counts(): Record<string, number> {
          return Object.fromEntries(this._c);
        }
        get mine(): string[] {
          return Array.from(this._mine);
        }

        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          this.setAttribute('role', 'group');
          if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', 'Reactions');
          this._c = new Map(parseReactions(this.str('emojis', '👍,❤️,😂,🎉'), this.str('counts', '')));
          this.insertAdjacentHTML('beforeend', '<span class="usa-rx-row" data-usa-part></span><button type="button" class="usa-rx-add" data-usa-part aria-label="Add reaction" aria-expanded="false">＋</button><span class="usa-rx-picker" data-usa-part hidden></span>');
          const picker = this.querySelector('.usa-rx-picker') as HTMLElement;
          for (const e of this.str('picker', '👍,❤️,😂,🎉,😮,😢,🔥,👀').split(',').map((s) => s.trim()).filter(Boolean)) {
            const b = document.createElement('button');
            b.type = 'button';
            b.textContent = e;
            b.setAttribute('aria-label', `React ${e}`);
            this.listen(b, 'click', () => (this.toggle(e, true), this.pick(false)));
            picker.appendChild(b);
          }
          this.listen(this.querySelector('.usa-rx-add')!, 'click', () => this.pick(picker.hidden === true));
          this.listen(this, 'keydown', (e: KeyboardEvent) => e.key === 'Escape' && this.pick(false));
          this.render(null);
        }

        private pick(open: boolean): void {
          const p = this.querySelector('.usa-rx-picker') as HTMLElement;
          p.hidden = !open;
          this.querySelector('.usa-rx-add')!.setAttribute('aria-expanded', String(open));
          if (open && !this.reduced) this.motion(p, [{ transform: 'scale(.4) translateY(8px)', opacity: 0 }, { transform: 'scale(1.05)', opacity: 1, offset: 0.7 }, { transform: 'none', opacity: 1 }], { duration: 300, easing: 'ease-out' });
        }

        toggle(emoji: string, on?: boolean): void {
          const has = this._mine.has(emoji);
          const want = on ?? !has;
          if (want === has) return;
          const n = Math.max(0, (this._c.get(emoji) || 0) + (want ? 1 : -1));
          this._c.set(emoji, n);
          want ? this._mine.add(emoji) : this._mine.delete(emoji);
          this.render(emoji, want);
          this.emit('react', { emoji, on: want, count: n });
        }

        private render(changed: string | null, up = true): void {
          const row = this.querySelector('.usa-rx-row') as HTMLElement;
          for (const [e, n] of this._c) {
            let b = Array.from(row.children).find((x) => (x as HTMLElement).dataset.e === e) as HTMLElement | undefined;
            if (!b) {
              b = document.createElement('button');
              b.setAttribute('type', 'button');
              b.className = 'usa-rx-pill';
              b.dataset.e = e;
              b.innerHTML = '<span class="usa-rx-emo" aria-hidden="true"></span><span class="usa-rx-n" aria-hidden="true"></span>';
              (b.querySelector('.usa-rx-emo') as HTMLElement).textContent = e;
              this.listen(b, 'click', () => this.toggle(e));
              row.appendChild(b);
            }
            b.hidden = n === 0 && !this._mine.has(e);
            b.setAttribute('aria-pressed', String(this._mine.has(e)));
            b.setAttribute('aria-label', `${e} ${n} reaction${n === 1 ? '' : 's'}`);
            const num = b.querySelector('.usa-rx-n') as HTMLElement;
            num.textContent = String(n);
            if (changed === e && !this.reduced) {
              this.motion(b.querySelector('.usa-rx-emo')!, [{ transform: 'scale(1)' }, { transform: 'scale(1.6) rotate(-12deg)', offset: 0.35 }, { transform: 'scale(1)' }], { duration: 420, easing: 'ease-out' });
              this.motion(num, [{ transform: `translateY(${up ? 10 : -10}px)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 260, easing: 'ease-out' });
              if (up) this.float(b, e);
            }
          }
        }

        private float(b: HTMLElement, e: string): void {
          for (let i = 0; i < 3; i++) {
            const s = document.createElement('span');
            s.className = 'usa-rx-float';
            s.setAttribute('aria-hidden', 'true');
            s.textContent = e;
            b.appendChild(s);
            const a = this.motion(s, [{ transform: 'translate(-50%,0) scale(.5)', opacity: 1 }, { transform: `translate(${-50 + (i - 1) * 60}%,-42px) scale(1)`, opacity: 0 }], { duration: 700, delay: i * 70, easing: 'ease-out' });
            if (a) a.finished.then(() => s.remove(), () => s.remove());
            else s.remove();
          }
        }
      }
      return UsaReactions as unknown as CustomElementConstructor;
    },
    { id: 'reactions', text: css }
  );
}
