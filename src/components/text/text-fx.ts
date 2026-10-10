import { defineElement, srText, raf, caf, clamp, type UsaElement } from '../base';
import css from './text-fx.css?raw';

/** Split `text` into per-character spans (words never break). The animated copy is aria-hidden. */
function splitChars(host: HTMLElement, text: string): HTMLElement[] {
  const vis = document.createElement('span');
  vis.setAttribute('aria-hidden', 'true');
  const chars: HTMLElement[] = [];
  text.split(/(\s+)/).forEach((w) => {
    if (/^\s+$/.test(w)) {
      vis.append(document.createTextNode(w));
      return;
    }
    const word = document.createElement('span');
    word.className = 'usa-word';
    for (const c of Array.from(w)) {
      const s = document.createElement('span');
      s.className = 'usa-char';
      s.textContent = c;
      s.style.setProperty('--i', String(chars.length));
      word.append(s);
      chars.push(s);
    }
    vis.append(word);
  });
  host.replaceChildren(srText(text), vis);
  return chars;
}

const textOf = (el: HTMLElement): string => (el.getAttribute('text') ?? el.dataset.usaText ?? (el.dataset.usaText = (el.textContent || '').trim()));

/**
 * `<usa-wave-text>` — letters bob in a travelling wave.
 * Attributes: `amplitude` (em, 0.25), `speed` (s per cycle, 1.6), `stagger`
 * (s between letters, 0.06). Reduced motion: still text.
 */
export interface UsaWaveTextElement extends UsaElement {}
export function defineWaveText(tag = 'usa-wave-text'): CustomElementConstructor | undefined {
  return defineElement(tag, (Base) => class extends Base {
    static get observedAttributes(): string[] { return ['text', 'amplitude', 'speed', 'stagger']; }
    mount(): void {
      splitChars(this, textOf(this));
      this.style.setProperty('--usa-wave-a', `${this.num('amplitude', 0.25)}em`);
      this.style.setProperty('--usa-wave-s', `${this.num('speed', 1.6)}s`);
      this.style.setProperty('--usa-wave-d', `${this.num('stagger', 0.06)}s`);
    }
  }, { id: 'text-fx', text: css });
}

/**
 * `<usa-glitch>` — an RGB-split glitch on its text (`trigger="always"`
 * default, or `hover`). Attributes: `intensity` (px, 3), `trigger`.
 * Reduced motion: no animation (plain text).
 */
export interface UsaGlitchElement extends UsaElement {}
export function defineGlitch(tag = 'usa-glitch'): CustomElementConstructor | undefined {
  return defineElement(tag, (Base) => class extends Base {
    static get observedAttributes(): string[] { return ['text', 'intensity']; }
    mount(): void {
      const t = textOf(this);
      this.setAttribute('data-text', t);
      this.style.setProperty('--usa-glitch-i', `${this.num('intensity', 3)}px`);
      if (!this.firstChild) this.textContent = t;
    }
  }, { id: 'text-fx', text: css });
}

/**
 * `<usa-gradient-text>` — text filled with a flowing multi-colour gradient.
 * Attributes: `colors` (comma list), `speed` (s, 6), `angle` (deg, 90).
 * Reduced motion: a static gradient.
 */
export interface UsaGradientTextElement extends UsaElement {}
export function defineGradientText(tag = 'usa-gradient-text'): CustomElementConstructor | undefined {
  return defineElement(tag, (Base) => class extends Base {
    static get observedAttributes(): string[] { return ['colors', 'speed', 'angle']; }
    mount(): void {
      const c = this.str('colors', '#7c5cff,#22d3ee,#f472b6,#facc15').split(',').map((s) => s.trim());
      this.style.setProperty('--usa-grad', `linear-gradient(${this.num('angle', 90)}deg, ${[...c, c[0]].join(', ')})`);
      this.style.setProperty('--usa-grad-s', `${this.num('speed', 6)}s`);
    }
  }, { id: 'text-fx', text: css });
}

/**
 * `<usa-handwriting>` — the text draws itself stroke by stroke (SVG text
 * outline), then fills in, when it scrolls into view.
 * Attributes: `text`, `duration` (ms, 2400), `stroke` (colour), `size` (px,
 * 64), `font` (family; a script font looks best). Events: `usa:complete`.
 * Reduced motion: the filled text appears at once.
 */
export interface UsaHandwritingElement extends UsaElement {
  play(): void;
}
export function defineHandwriting(tag = 'usa-handwriting'): CustomElementConstructor | undefined {
  return defineElement(tag, (Base) => class extends Base {
    static get observedAttributes(): string[] { return ['text', 'size', 'font', 'stroke', 'duration']; }
    mount(): void {
      const t = textOf(this);
      const size = this.num('size', 64);
      const w = Math.ceil(t.length * size * 0.62) + 8;
      this.replaceChildren(srText(t));
      this.insertAdjacentHTML('beforeend', `<svg aria-hidden="true" viewBox="0 0 ${w} ${Math.ceil(size * 1.3)}" width="${w}" height="${Math.ceil(size * 1.3)}"><text x="4" y="${Math.round(size)}" font-size="${size}"></text></svg>`);
      const text = this.querySelector('text')!;
      text.textContent = t;
      if (this.str('font')) text.setAttribute('font-family', this.str('font'));
      if (this.str('stroke')) this.style.setProperty('--usa-hw-stroke', this.str('stroke'));
      this.style.setProperty('--usa-hw-d', `${this.num('duration', 2400)}ms`);
      if (this.reduced) {
        this.setAttribute('data-state', 'done');
        return;
      }
      this.inView((v) => v && this.play(), { threshold: 0.3 });
    }
    play(): void {
      this.removeAttribute('data-state');
      void this.offsetWidth;
      this.setAttribute('data-state', 'drawing');
      setTimeout(() => {
        this.setAttribute('data-state', 'done');
        this.emit('complete');
      }, this.reduced ? 0 : this.num('duration', 2400));
    }
  }, { id: 'text-fx', text: css });
}

/**
 * `<usa-scroll-highlight>` — reading highlight: words light up one by one
 * as the paragraph scrolls through the viewport (`mode="words"`, default),
 * or a highlighter marker sweeps behind the text on enter (`mode="marker"`).
 * Attributes: `mode`, `color` (marker), `dim` (opacity of unread words,
 * 0.2). Reduced motion: fully highlighted text.
 */
export interface UsaScrollHighlightElement extends UsaElement {
  readonly progress: number;
}
export function defineScrollHighlight(tag = 'usa-scroll-highlight'): CustomElementConstructor | undefined {
  return defineElement(tag, (Base) => class extends Base {
    static get observedAttributes(): string[] { return ['mode', 'text', 'color', 'dim']; }
    private _f = 0;
    private _p = 0;
    get progress(): number { return this._p; }
    mount(): void {
      const mode = this.str('mode', 'words');
      if (this.str('color')) this.style.setProperty('--usa-hl-color', this.str('color'));
      this.style.setProperty('--usa-hl-dim', String(this.num('dim', 0.2)));
      if (mode === 'marker') {
        if (this.reduced) this.setAttribute('data-lit', '');
        else this.inView((v) => v && this.setAttribute('data-lit', ''), { threshold: 0.6 });
        return;
      }
      const t = textOf(this);
      const vis = document.createElement('span');
      vis.setAttribute('aria-hidden', 'true');
      const words = t.split(/\s+/).filter(Boolean).map((w) => {
        const s = document.createElement('span');
        s.className = 'usa-hl-word';
        s.textContent = w;
        vis.append(s, ' ');
        return s;
      });
      this.replaceChildren(srText(t), vis);
      if (this.reduced) {
        words.forEach((w) => w.setAttribute('data-on', ''));
        return;
      }
      const update = () => {
        this._f = 0;
        const r = this.getBoundingClientRect();
        const H = window.innerHeight || 800;
        this._p = clamp((H * 0.85 - r.top) / (r.height + H * 0.35), 0, 1);
        const lit = Math.round(this._p * words.length);
        words.forEach((w, i) => w.toggleAttribute('data-on', i < lit));
      };
      const on = () => !this._f && (this._f = raf(update));
      let active = false;
      this.inView((v) => {
        if (v === active) return;
        active = v;
        if (v) window.addEventListener('scroll', on, { passive: true });
        else window.removeEventListener('scroll', on);
        on();
      });
      this.onCleanup(() => window.removeEventListener('scroll', on));
    }
    unmount(): void {
      caf(this._f);
      this._f = 0;
    }
  }, { id: 'text-fx', text: css });
}
