/**
 * `motionary/runtime/text` (10.3) — split text into characters, words and
 * lines for animation, keeping it accessible (original implementation).
 *
 * - `segment(text, 'chars' | 'words')` — pure, works anywhere (SSR, workers):
 *   grapheme clusters via `Intl.Segmenter` when available (emoji, combining
 *   marks, CJK stay whole), whitespace-aware words.
 * - `splitText(el, { type: 'chars,words,lines' })` — wraps the element's text
 *   in spans (nested elements such as `<a>`, `<em>` keep their markup), groups
 *   words into lines by their rendered position, sets `aria-label` on the
 *   element with the original text and hides the pieces from assistive tech.
 *   `revert()` restores the original markup; `resplit()` re-measures lines
 *   (e.g. after a resize).
 */
import { RUNTIME_VERSION, type RuntimeModule } from './registry';

export type SplitType = 'chars' | 'words' | 'lines';

/** Split a string into graphemes ('chars') or words + whitespace runs ('words'). */
export function segment(text: string, by: 'chars' | 'words' = 'chars'): string[] {
  const Seg = (Intl as any).Segmenter;
  if (by === 'chars') {
    if (Seg) return Array.from(new Seg(undefined, { granularity: 'grapheme' }).segment(text), (s: any) => s.segment as string);
    return Array.from(text);
  }
  return text.split(/(\s+)/).filter((s) => s !== '');
}

export interface SplitOptions {
  /** Any of chars, words, lines (comma / space separated). Default 'chars,words'. */
  type?: string;
  /** Class prefix (default 'usa-split'): pieces get `<prefix>-char`, `-word`, `-line`. */
  className?: string;
  /** Set a `--i` custom property (index) on each piece for CSS staggering (default true). */
  indexVar?: boolean;
}

export interface SplitResult {
  chars: HTMLElement[];
  words: HTMLElement[];
  lines: HTMLElement[];
  /** Restore the original markup. */
  revert(): void;
  /** Revert and split again (re-measures lines). */
  resplit(): SplitResult;
}

const types = (t?: string): Set<SplitType> => new Set((t || 'chars,words').split(/[\s,]+/).filter(Boolean) as SplitType[]);

/** Split an element's text (see module docs). Needs a DOM. */
export function splitText(el: HTMLElement, o: SplitOptions = {}): SplitResult {
  if (typeof document === 'undefined') throw new Error('[motionary] splitText needs a DOM — use segment() on the server');
  const want = types(o.type);
  const pre = o.className || 'usa-split';
  const original = el.innerHTML;
  const hadLabel = el.getAttribute('aria-label');
  const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
  const chars: HTMLElement[] = [], words: HTMLElement[] = [];
  const mk = (cls: string, txt?: string) => {
    const s = document.createElement('span');
    s.className = cls;
    s.setAttribute('aria-hidden', 'true');
    s.style.display = 'inline-block';
    if (txt !== undefined) s.textContent = txt;
    return s;
  };
  const wantWords = want.has('words') || want.has('lines');
  const walk = (node: Node) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        for (const part of segment(child.textContent || '', 'words')) {
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(' '));
            continue;
          }
          const w = wantWords ? mk(`${pre}-word`) : null;
          if (want.has('chars')) {
            for (const g of segment(part, 'chars')) {
              const c = mk(`${pre}-char`, g);
              chars.push(c);
              (w || frag).appendChild(c);
            }
          } else if (w) w.textContent = part;
          else frag.appendChild(document.createTextNode(part));
          if (w) {
            words.push(w);
            frag.appendChild(w);
          }
        }
        child.replaceWith(frag);
      } else if (child.nodeType === 1 && !(child as Element).classList.contains(`${pre}-word`)) walk(child);
    }
  };
  walk(el);
  if (text && hadLabel === null) el.setAttribute('aria-label', text);
  el.setAttribute('data-split', Array.from(want).join(' '));
  const lines: HTMLElement[] = [];
  if (want.has('lines') && words.length) {
    // group words by their rendered top; wrap each group in a line span (flat text only)
    let top = NaN, cur: HTMLElement[] = [];
    const groups: HTMLElement[][] = [];
    for (const w of words) {
      const t = Math.round(w.offsetTop);
      if (cur.length && Math.abs(t - top) > 2) {
        groups.push(cur);
        cur = [];
      }
      if (!cur.length) top = t;
      cur.push(w);
    }
    if (cur.length) groups.push(cur);
    const flat = words.every((w) => w.parentElement === el);
    if (flat) {
      el.textContent = '';
      for (const g of groups) {
        const line = mk(`${pre}-line`);
        line.style.display = 'block';
        g.forEach((w, i) => {
          if (i) line.appendChild(document.createTextNode(' '));
          line.appendChild(w);
        });
        lines.push(line);
        el.appendChild(line);
      }
    } else groups.forEach((g, i) => g.forEach((w) => w.setAttribute('data-line', String(i))));
  }
  if (o.indexVar !== false) for (const list of [chars, words, lines]) list.forEach((s, i) => s.style.setProperty('--i', String(i)));
  const result: SplitResult = {
    chars,
    words: want.has('words') ? words : [],
    lines,
    revert() {
      el.innerHTML = original;
      el.removeAttribute('data-split');
      if (hadLabel === null) el.removeAttribute('aria-label');
    },
    resplit() {
      result.revert();
      return splitText(el, o);
    },
  };
  return result;
}

export interface TextApi {
  segment: typeof segment;
  splitText: typeof splitText;
}

/** The module object for `use(text)`. */
export const text: RuntimeModule<TextApi> = { id: 'text', version: RUNTIME_VERSION, tier: 'basic', requires: ['core'], api: { segment, splitText } };
