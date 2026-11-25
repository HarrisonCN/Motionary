import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { hostSprings } from './micro-kit-16';
import { alignDigits, counterText } from './spring-kit-17';
import css from './spring-kit-17.css?raw';

/**
 * A number whose digits roll on springs: each digit column spins up or down to its new digit with a soft overshoot
 * (the ones digit bounciest), and new columns grow in. Screen readers get the plain number. Set `value` (or the
 * property) to roll; it rolls from its old value, and from 0 the first time it scrolls into view with `from-zero`.
 *
 * Attributes: `value` (0), `decimals` (0), `group` (thousands separator, e.g. "," ; none), `prefix`, `suffix`,
 * `from-zero`, `label` (read before the number), `feel`.
 * Events: `usa:change` ({ value }) when the value changes after the first render.
 */
export interface UsaSpringCounterElement extends UsaElement {
  value: number;
}

export function defineSpringCounter(tag = 'usa-spring-counter'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, (Base) => class SpringCounter extends Base {
    static get observedAttributes(): string[] {
      return ['value', 'decimals', 'group', 'prefix', 'suffix', 'from-zero', 'label', 'feel'];
    }
    private _value = 0;
    private _shown: string | null = null;
    private _played = false;
    private _seen?: string | null;
    private _set: ((v: number) => void) | null = null;
    get value(): number {
      return this._value;
    }
    set value(v: number) {
      const n = Number(v);
      if (!Number.isFinite(n)) return;
      if (this._set) this._set(n);
      else this._value = n;
    }
    mount(): void {
      const attr = this.getAttribute('value');
      const first = this._seen === undefined;
      if (attr !== this._seen) {
        this._seen = attr;
        this._value = this.num('value', 0);
      }
      const decimals = this.num('decimals', 0);
      const sep = this.str('group');
      const root = make('span', 'usa-skit usa-scount');
      root.setAttribute('role', 'status');
      const sr = make('span', 'usa-skit-sr');
      const show = make('span', 'usa-scount-digits');
      show.setAttribute('aria-hidden', 'true');
      const pre = this.str('prefix') ? make('span', 'usa-scount-affix', this.str('prefix')) : null;
      const suf = this.str('suffix') ? make('span', 'usa-scount-affix', this.str('suffix')) : null;
      if (pre) pre.setAttribute('aria-hidden', 'true');
      if (suf) suf.setAttribute('aria-hidden', 'true');
      root.append(sr, ...(pre ? [pre] : []), show, ...(suf ? [suf] : []));
      this.append(root);
      type Col = { el: HTMLElement; reel: HTMLElement; key: string; digit: boolean };
      let cols: Col[] = [];
      let seq = 0;
      const group = hostSprings(this, {}, (v) => {
        for (const c of cols) {
          const p = v[c.key] ?? 0;
          if (c.digit) c.reel.style.transform = `translateY(${Math.round(-p * 1000) / 100}%)`;
          const w = v[`${c.key}w`];
          if (w !== undefined) {
            c.el.style.width = w >= 0.999 ? '' : `${Math.round(Math.max(0, w) * 100) / 100}ch`;
            c.el.style.opacity = String(Math.round(Math.min(1, Math.max(0, w)) * 100) / 100);
          }
        }
      });
      const reel = () => {
        const r = make('span', 'usa-scount-reel');
        for (let d = 0; d <= 9; d++) r.append(make('span', '', String(d)));
        return r;
      };
      const build = (text: string) => {
        show.textContent = '';
        cols = text.split('').map((ch) => {
          const digit = /\d/.test(ch);
          const el = make('span', 'usa-scount-col');
          const key = `c${++seq}`;
          let r: HTMLElement;
          if (digit) {
            el.dataset.digit = '';
            r = reel();
          } else r = make('span', 'usa-scount-reel', ch);
          el.append(r);
          show.append(el);
          group.jump({ [key]: digit ? Number(ch) : 0 });
          return { el, reel: r, key, digit };
        });
      };
      const say = (text: string) => {
        sr.textContent = `${this.str('label') ? `${this.str('label')} ` : ''}${this.str('prefix')}${text}${this.str('suffix')}`;
      };
      const roll = (from: string, to: string) => {
        const pairs = alignDigits(from, to);
        // rebuild the columns for the new text, starting every digit at its old digit
        show.textContent = '';
        const next: Col[] = [];
        pairs.forEach(([a, b], i) => {
          if (!b) return;
          const digit = /\d/.test(b);
          const el = make('span', 'usa-scount-col');
          const key = `c${++seq}`;
          const r = digit ? reel() : make('span', 'usa-scount-reel', b);
          if (digit) el.dataset.digit = '';
          el.append(r);
          show.append(el);
          const col = { el, reel: r, key, digit };
          next.push(col);
          const delay = pairs.length - 1 - i;
          if (digit) {
            const start = /\d/.test(a) ? Number(a) : 0;
            group.jump({ [key]: start });
            group.set({ [key]: Number(b) }, { spring: delay ? 'smooth' : 'bouncy' });
          }
          if (!a) {
            group.jump({ [`${key}w`]: 0 });
            group.set({ [`${key}w`]: 1 }, { spring: 'smooth' });
          }
        });
        cols = next;
      };
      const text = () => counterText(this._value, decimals, sep);
      const set = (n: number) => {
        const before = this._shown ?? counterText(0, decimals, sep);
        const changed = n !== this._value;
        this._value = n;
        this._played = true;
        const after = text();
        this._shown = after;
        say(after);
        roll(before, after);
        if (changed) this.emit('change', { value: n });
      };
      this._set = set;
      if (this.flag('from-zero') && !this._played) {
        // the intro roll from zero plays once, the first time the counter is seen
        const zero = counterText(0, decimals, sep);
        build(zero);
        this._shown = zero;
        say(text());
        this.inView((visible) => {
          if (!visible || this._played) return;
          this._played = true;
          const after = text();
          this._shown = after;
          roll(zero, after);
        });
      } else if (this._shown && this._shown !== text()) {
        const before = this._shown;
        this._shown = text();
        say(this._shown);
        roll(before, this._shown);
        if (!first) this.emit('change', { value: this._value });
      } else {
        this._shown = text();
        build(this._shown);
        say(this._shown);
      }
      this.onCleanup(() => {
        group.stop();
        root.remove();
        this._set = null;
      });
    }
  }, { id: 'spring-kit-17', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
