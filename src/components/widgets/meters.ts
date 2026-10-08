import { defineElement, type UsaElement } from '../base';
import { clampN, part } from './shared';
import css from './meters.css?raw';

/**
 * 6.4 meters: `<usa-progress-ring>` and `<usa-odometer>`.
 *
 * `<usa-progress-ring value="64" max="100">` — a ring, `bar` or `semi`
 * (semicircle gauge) `variant`; the arc eases (with a little overshoot) to
 * each new value while the centre label counts; `gradient="#a,#b"`;
 * no `value` = indeterminate (spinning arc). `role="progressbar"`.
 * Event `usa:complete` when it reaches max.
 *
 * `<usa-odometer value="1234">` — rolling digit wheels: every digit column
 * spins to its new digit (lower digits travel further), columns slide in /
 * out when the length changes; `locale` grouping via Intl.NumberFormat,
 * `decimals`, `prefix` / `suffix`, `duration`. The accessible name is the
 * formatted number.
 *
 * Reduced motion: values switch without animation.
 */
export interface UsaProgressRingElement extends UsaElement {
  value: number | null;
  max: number;
}
export interface UsaOdometerElement extends UsaElement {
  value: number;
  readonly text: string;
}

export const PROGRESS_VARIANTS = ['ring', 'bar', 'semi'] as const;
const NS = 'http://www.w3.org/2000/svg';

export function defineProgressRing(tag = 'usa-progress-ring'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaProgressRing extends Base {
        static get observedAttributes(): string[] {
          return ['variant', 'value', 'max', 'gradient'];
        }
        private _shown = 0;
        private _arc: SVGPathElement | SVGCircleElement | HTMLElement | null = null;
        private _label: HTMLElement | null = null;
        private _len = 1;
        private _raf = 0;

        get value(): number | null {
          return this.hasAttribute('value') ? this.num('value', 0) : null;
        }
        set value(v: number | null) {
          if (v === null) this.removeAttribute('value');
          else this.setAttribute('value', String(v));
        }
        get max(): number {
          return Math.max(1e-9, this.num('max', 100));
        }
        set max(v: number) {
          this.setAttribute('max', String(v));
        }

        changed(name: string): void {
          if (name === 'value' && this._arc) return this.update();
          super.changed(name);
        }

        mount(): void {
          const v = this.str('variant', 'ring');
          const variant = (PROGRESS_VARIANTS as readonly string[]).includes(v) ? v : 'ring';
          this.dataset.variant = variant;
          this.setAttribute('role', 'progressbar');
          this.setAttribute('aria-valuemin', '0');
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          const stops = this.str('gradient', '').split(',').map((s) => s.trim()).filter(Boolean);
          const gid = `usa-pr-${Math.random().toString(36).slice(2, 8)}`;
          if (variant === 'bar') {
            const track = part('div', 'usa-pr-track');
            const fill = part('div', 'usa-pr-fill');
            if (stops.length) fill.style.background = `linear-gradient(90deg,${stops.join(',')})`;
            track.append(fill);
            this.append(track);
            this._arc = fill;
          } else {
            const svg = document.createElementNS(NS, 'svg');
            svg.setAttribute('data-usa-part', '');
            svg.setAttribute('aria-hidden', 'true');
            svg.setAttribute('class', 'usa-pr-svg');
            const semi = variant === 'semi';
            svg.setAttribute('viewBox', semi ? '0 0 100 56' : '0 0 100 100');
            const d = semi ? 'M 8 50 A 42 42 0 0 1 92 50' : 'M 50 8 A 42 42 0 1 1 49.99 8';
            const grad = stops.length ? `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">${stops.map((c, i) => `<stop offset="${stops.length > 1 ? i / (stops.length - 1) : 0}" stop-color="${c}"/>`).join('')}</linearGradient></defs>` : '';
            svg.innerHTML = `${grad}<path class="usa-pr-track" d="${d}"/><path class="usa-pr-arc" d="${d}"${stops.length ? ` stroke="url(#${gid})"` : ''}/>`;
            this.append(svg);
            this._arc = svg.querySelector('.usa-pr-arc');
            this._len = semi ? Math.PI * 42 : Math.PI * 2 * 42;
            (this._arc as SVGPathElement).style.strokeDasharray = `${this._len}`;
            (this._arc as SVGPathElement).style.strokeDashoffset = `${this._len}`;
          }
          this._label = part('span', 'usa-pr-label', { 'aria-hidden': 'true' });
          if (this.flag('no-label')) this._label.hidden = true;
          this.append(this._label);
          this._shown = 0;
          this.onCleanup(() => {
            if (this._raf && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(this._raf);
          });
          this.update();
        }

        private paint(frac: number): void {
          const f = clampN(frac, 0, 1.08);
          if (this._arc instanceof HTMLElement) this._arc.style.transform = `scaleX(${Math.min(1, f)})`;
          else if (this._arc) (this._arc as SVGPathElement).style.strokeDashoffset = `${(this._len * (1 - Math.min(1, f))).toFixed(2)}`;
        }

        private update(): void {
          const v = this.value;
          const max = this.max;
          this.setAttribute('aria-valuemax', String(max));
          this.toggleAttribute('data-indeterminate', v === null);
          if (v === null) {
            this.removeAttribute('aria-valuenow');
            if (this._label) this._label.textContent = '';
            this.paint(0.28);
            return;
          }
          const target = clampN(v, 0, max) / max;
          this.setAttribute('aria-valuenow', String(clampN(v, 0, max)));
          const from = this._shown;
          this._shown = target;
          const label = (f: number) => {
            if (this._label) this._label.textContent = `${Math.round(f * 100)}%`;
          };
          if (this._raf && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(this._raf);
          if (this.reduced || typeof requestAnimationFrame !== 'function') {
            this.paint(target);
            label(target);
          } else {
            const t0 = performance.now();
            const dur = this.num('duration', 900);
            const step = (now: number) => {
              const k = Math.min(1, (now - t0) / dur);
              // ease-out-back: a little overshoot, then settle
              const c = 1.4;
              const e = 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2);
              const f = from + (target - from) * e;
              this.paint(f);
              label(from + (target - from) * Math.min(1, k * 1.15));
              this._raf = k < 1 ? requestAnimationFrame(step) : 0;
              if (k >= 1) this.paint(target);
            };
            this._raf = requestAnimationFrame(step);
          }
          if (target >= 1 && from < 1) this.emit('complete', { value: v });
        }
      }
      return UsaProgressRing as unknown as CustomElementConstructor;
    },
    { id: 'meters', text: css }
  );
}

export function defineOdometer(tag = 'usa-odometer'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaOdometer extends Base {
        static get observedAttributes(): string[] {
          return ['value', 'locale', 'decimals', 'prefix', 'suffix'];
        }
        private _row: HTMLElement | null = null;
        private _text = '';

        get value(): number {
          return this.num('value', 0);
        }
        set value(v: number) {
          this.setAttribute('value', String(v));
        }
        get text(): string {
          return this._text;
        }

        changed(name: string): void {
          if (name === 'value' && this._row) return this.render(true);
          super.changed(name);
        }

        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          this._row = part('span', 'usa-odo-row', { 'aria-hidden': 'true' });
          this.append(this._row);
          this.setAttribute('role', 'img');
          this._text = '';
          this.render(false);
        }

        private format(): string {
          const d = Math.max(0, Math.min(6, Math.round(this.num('decimals', 0))));
          let s: string;
          try {
            s = new Intl.NumberFormat(this.str('locale', '') || undefined, { minimumFractionDigits: d, maximumFractionDigits: d }).format(this.value);
          } catch {
            s = this.value.toFixed(d);
          }
          return `${this.str('prefix', '')}${s}${this.str('suffix', '')}`;
        }

        private column(ch: string): HTMLElement {
          const isDigit = /\d/.test(ch);
          const col = part('span', isDigit ? 'usa-odo-col' : 'usa-odo-sym');
          if (isDigit) {
            const strip = document.createElement('span');
            strip.className = 'usa-odo-strip';
            strip.textContent = '01234567890123456789'.split('').join('\n');
            col.append(strip);
            col.dataset.d = ch;
            strip.style.transform = `translateY(${-Number(ch) * 5}%)`;
          } else col.textContent = ch;
          return col;
        }

        private render(animate: boolean): void {
          const row = this._row;
          if (!row) return;
          const next = this.format();
          this._text = next;
          this.setAttribute('aria-label', next);
          const anim = animate && !this.reduced;
          const dur = this.num('duration', 1100);
          const chars = next.split('');
          const old = Array.from(row.children) as HTMLElement[];
          const off = chars.length - old.length; // right-aligned: digits keep their place value
          const fresh = new Set<HTMLElement>();
          const cols = chars.map((ch, i) => {
            const o = old[i - off];
            const digit = /\d/.test(ch);
            if (o && digit && o.dataset.d !== undefined) return o;
            if (o && !digit && o.dataset.d === undefined) {
              o.textContent = ch;
              return o;
            }
            const c = this.column(ch);
            fresh.add(c);
            return c;
          });
          row.replaceChildren(...cols);
          cols.forEach((c, i) => {
            if (fresh.has(c)) {
              if (anim) this.motion(c, [{ opacity: 0, transform: 'translateY(-60%)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.22,1,.36,1)' });
              return;
            }
            if (c.dataset.d === undefined) return;
            const to = Number(chars[i]);
            const from = Number(c.dataset.d);
            c.dataset.d = String(to);
            const strip = c.firstElementChild as HTMLElement;
            strip.style.transform = `translateY(${-to * 5}%)`;
            if (!anim || from === to) return;
            const end = to >= from ? -to * 5 : -(to + 10) * 5; // always roll forward
            const place = cols.length - i;
            this.motion(strip, [{ transform: `translateY(${-from * 5}%)` }, { transform: `translateY(${end}%)` }], { duration: Math.max(400, dur - place * 60), easing: 'cubic-bezier(.2,.9,.25,1.04)' });
          });
        }
      }
      return UsaOdometer as unknown as CustomElementConstructor;
    },
    { id: 'meters', text: css }
  );
}
