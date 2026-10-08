import { timeline, type Timeline } from '../timeline/core';

/**
 * `splitText()` (4.3) — split an element's text into characters, words and / or
 * lines, ready for per-unit choreography with `timeline()`.
 *
 * - Grapheme- and word-aware via `Intl.Segmenter` when available: emoji and
 *   combining marks stay whole; Chinese / Japanese / Korean text is split into
 *   real words (or one unit per character without `Segmenter`).
 * - RTL aware: Arabic-script text (cursive, letters join) is never split
 *   below the word, so shaping is preserved; Hebrew and other RTL scripts
 *   split per character. Units stay in logical (reading) order.
 * - Nested inline markup (`<em>`, `<a>`, `<br>`) is preserved.
 * - Accessible: the original text stays available to assistive tech via a
 *   visually hidden copy; the split spans are `aria-hidden`.
 */
export type SplitBy = 'char' | 'word' | 'line';

export interface SplitTextOptions {
  /** What to split into: `'char'`, `'word'`, `'line'` or several, e.g. `['word', 'line']`. Default `'char'` (words are always wrapped too). */
  by?: SplitBy | SplitBy[] | string;
  /** Locale for `Intl.Segmenter` (default: the element's `lang`, else the document's). */
  locale?: string;
  /** Class prefix (default `usa-split`): units get `usa-split-char` / `-word` / `-line`. */
  className?: string;
}

export interface SplitResult {
  chars: HTMLElement[];
  words: HTMLElement[];
  lines: HTMLElement[];
  /** `'rtl'` or `'ltr'` — the direction the split ran in. */
  direction: 'ltr' | 'rtl';
  /** Re-measure lines (call after a resize or font load). */
  relayout(): HTMLElement[];
  /** Restore the original markup. */
  revert(): void;
}

const CJK = /[\u2E80-\u2FFF\u3000-\u303F\u3040-\u30FF\u3100-\u312F\u3130-\u318F\u31A0-\u31FF\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF\uFF00-\uFFEF]/;
/** Scripts whose letters join (splitting them would break shaping). */
export const JOINING_SCRIPT = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
const RTL = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/;
const SR = 'position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;border:0';

function segmenter(locale: string | undefined, granularity: 'grapheme' | 'word'): { segment(s: string): Iterable<{ segment: string; isWordLike?: boolean }> } | null {
  const S = (globalThis as any).Intl?.Segmenter;
  if (typeof S !== 'function') return null;
  try {
    return new S(locale || undefined, { granularity });
  } catch {
    return null;
  }
}

/** Grapheme clusters of `s` (emoji / combining marks stay whole). */
export function graphemes(s: string, locale?: string): string[] {
  const seg = segmenter(locale, 'grapheme');
  if (seg) return Array.from(seg.segment(s), (x) => x.segment);
  return Array.from(s);
}

/**
 * Word-ish tokens of `s`, whitespace kept as separate tokens. CJK text is
 * segmented into words with `Intl.Segmenter`, or per character without it.
 */
export function words(s: string, locale?: string): string[] {
  const seg = segmenter(locale, 'word');
  const out: string[] = [];
  if (seg) {
    for (const x of seg.segment(s)) {
      const last = out[out.length - 1];
      // glue punctuation onto the previous word so it never starts a line alone
      if (!x.isWordLike && !/^\s+$/.test(x.segment) && last && !/^\s+$/.test(last)) out[out.length - 1] = last + x.segment;
      else out.push(x.segment);
    }
    return out;
  }
  for (const part of s.split(/(\s+)/)) {
    if (!part) continue;
    if (/^\s+$/.test(part) || !CJK.test(part)) out.push(part);
    else {
      let buf = '';
      for (const ch of Array.from(part)) {
        if (CJK.test(ch)) {
          if (buf) out.push(buf), (buf = '');
          out.push(ch);
        } else if (/[\p{P}]/u.test(ch) && out.length) out[out.length - 1] += ch;
        else buf += ch;
      }
      if (buf) out.push(buf);
    }
  }
  return out;
}

function dirOf(el: HTMLElement, text: string): 'ltr' | 'rtl' {
  const attr = el.closest?.('[dir]')?.getAttribute('dir');
  if (attr === 'rtl' || attr === 'ltr') return attr;
  try {
    const d = getComputedStyle(el).direction;
    if (d === 'rtl') return 'rtl';
  } catch {
    /* no layout */
  }
  return RTL.test(text) && !/[A-Za-z]/.test(text.replace(RTL, '')) ? 'rtl' : 'ltr';
}

export function splitText(el: HTMLElement, options: SplitTextOptions = {}): SplitResult {
  const by = new Set<string>((Array.isArray(options.by) ? options.by : String(options.by ?? 'char').split(/[\s,]+/)).filter(Boolean));
  const cls = options.className || 'usa-split';
  const locale = options.locale || el.closest?.('[lang]')?.getAttribute('lang') || undefined;
  const original = Array.from(el.childNodes).map((n) => n.cloneNode(true));
  const text = el.textContent || '';
  const direction = dirOf(el, text);
  const chars: HTMLElement[] = [];
  const wordEls: HTMLElement[] = [];
  let lines: HTMLElement[] = [];
  const doc = el.ownerDocument;

  const span = (c: string, t?: string) => {
    const s = doc.createElement('span');
    s.className = c;
    if (t !== undefined) s.textContent = t;
    return s;
  };

  const splitNode = (node: Node) => {
    if (node.nodeType === 3) {
      const frag = doc.createDocumentFragment();
      for (const w of words(node.nodeValue || '', locale)) {
        if (/^\s+$/.test(w)) {
          frag.append(doc.createTextNode(w));
          continue;
        }
        const wordEl = span(`${cls}-word`);
        wordEl.style.display = 'inline-block';
        wordEl.style.whiteSpace = 'nowrap';
        wordEl.dataset.index = String(wordEls.length);
        wordEls.push(wordEl);
        // Arabic script joins its letters: keep the word whole (shaping), even in char mode.
        if (by.has('char') && !JOINING_SCRIPT.test(w)) {
          for (const g of graphemes(w, locale)) {
            const c = span(`${cls}-char`, g);
            c.style.display = 'inline-block';
            c.dataset.index = String(chars.length);
            chars.push(c);
            wordEl.append(c);
          }
        } else {
          wordEl.textContent = w;
          if (by.has('char')) {
            wordEl.dataset.whole = '';
            chars.push(wordEl);
          }
        }
        frag.append(wordEl);
      }
      node.parentNode!.replaceChild(frag, node);
    } else if (node.nodeType === 1 && !/^(BR|SCRIPT|STYLE|SVG|IMG)$/i.test((node as Element).tagName)) {
      Array.from(node.childNodes).forEach(splitNode);
    }
  };

  const wrap = doc.createElement('span');
  wrap.setAttribute('aria-hidden', 'true');
  wrap.className = `${cls}-body`;
  original.forEach((n) => wrap.append(n.cloneNode(true)));
  Array.from(wrap.childNodes).forEach(splitNode);
  const sr = span(`${cls}-sr`, text.replace(/\s+/g, ' ').trim());
  sr.setAttribute('style', SR);
  el.replaceChildren(sr, wrap);
  el.setAttribute('data-split', [...by].join(' '));
  if (direction === 'rtl') el.setAttribute('data-split-dir', 'rtl');

  const relayout = (): HTMLElement[] => {
    // unwrap old lines
    for (const l of lines) l.replaceWith(...Array.from(l.childNodes));
    lines = [];
    if (!by.has('line') || !wordEls.length) return lines;
    const groups: HTMLElement[][] = [];
    let lastTop: number | null = null;
    for (const w of wordEls) {
      const top = Math.round(w.offsetTop);
      if (lastTop === null || Math.abs(top - lastTop) > 2) groups.push([]);
      groups[groups.length - 1].push(w);
      lastTop = top;
    }
    groups.forEach((g, i) => {
      // only group words that share a parent (inline markup keeps its words)
      const parent = g[0].parentNode!;
      const same = g.filter((w) => w.parentNode === parent);
      const line = span(`${cls}-line`);
      line.style.display = 'inline-block';
      line.dataset.index = String(i);
      parent.insertBefore(line, same[0]);
      let n: ChildNode | null = same[0];
      const end = same[same.length - 1];
      while (n) {
        const next: ChildNode | null = n.nextSibling;
        line.append(n);
        if (n === end) break;
        n = next;
      }
      // keep the space between lines outside the line box
      lines.push(line);
    });
    return lines;
  };
  relayout();

  return {
    chars,
    words: wordEls,
    get lines() {
      return lines;
    },
    direction,
    relayout,
    revert() {
      el.replaceChildren(...original.map((n) => n.cloneNode(true)));
      el.removeAttribute('data-split');
      el.removeAttribute('data-split-dir');
    },
  } as SplitResult;
}

export type SplitFrom = 'start' | 'end' | 'center' | 'edges' | 'random';

/** Order indices `0…n-1` by choreography: from the start, end, center outwards, edges inwards, or random (seeded). */
export function splitOrder(n: number, from: SplitFrom = 'start', seed = 1): number[] {
  const idx = Array.from({ length: n }, (_, i) => i);
  const mid = (n - 1) / 2;
  if (from === 'end') return idx.map((i) => n - 1 - i);
  if (from === 'center') return idx.map((i) => Math.round(Math.abs(i - mid) * 2) / 2);
  if (from === 'edges') return idx.map((i) => Math.round((mid - Math.abs(i - mid)) * 2) / 2);
  if (from === 'random') {
    let s = seed;
    const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const shuffled = idx.slice().sort(() => r() - 0.5);
    const rank: number[] = [];
    shuffled.forEach((v, i) => (rank[v] = i));
    return rank;
  }
  return idx;
}

export interface SplitTimelineOptions extends SplitTextOptions {
  /** Which units to animate (default: the finest in `by`). */
  unit?: 'char' | 'word' | 'line';
  /** Timeline preset name or keyframes (default `'fade-up'`). */
  preset?: string | Keyframe[];
  /** ms between units (default 30 for chars, 80 for words, 140 for lines). */
  stagger?: number;
  /** Duration per unit in ms or a motion token name (default 500). */
  duration?: number | string;
  easing?: string;
  /** Choreography order (default `'start'` — reading order, also for RTL). */
  from?: SplitFrom;
}

/**
 * Split `el` and build a `timeline()` with one step per unit — play it,
 * `scrub()` it with scroll, `reverse()` or `seek()` it.
 *
 * ```ts
 * const { timeline: tl } = splitTimeline(h1, { by: 'char', preset: 'blur', from: 'center' });
 * tl.play();
 * ```
 */
export function splitTimeline(el: HTMLElement, options: SplitTimelineOptions = {}): { split: SplitResult; timeline: Timeline } {
  const split = splitText(el, options);
  const by = Array.isArray(options.by) ? options.by : String(options.by ?? 'char').split(/[\s,]+/);
  const unit = options.unit || (by.includes('char') ? 'char' : by.includes('word') ? 'word' : 'line');
  const units = unit === 'char' ? split.chars : unit === 'word' ? split.words : split.lines;
  const stagger = options.stagger ?? (unit === 'char' ? 30 : unit === 'word' ? 80 : 140);
  const order = splitOrder(units.length, options.from);
  const tl = timeline({ defaults: { duration: options.duration ?? 500, easing: options.easing } });
  units.forEach((u, i) => tl.to(u, (options.preset as any) || 'fade-up', { at: order[i] * stagger }));
  tl.seek(0);
  return { split, timeline: tl };
}
