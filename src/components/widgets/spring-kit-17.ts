/**
 * 17.17 helpers shared by the spring parts (like-button, star-rating, copy-button, tag-input, pin-input, reorder-list,
 * swipe-item, toast-stack, spring-accordion, spring-counter). Pure functions with no DOM access, so they are easy to
 * test. The motion itself comes from the 17.16 spring core (`createSpringGroup`, `micro()`, `feedback()`).
 * Original implementations; see docs/spring-parts-17-17.md.
 */

/**
 * Where the `n` dots of a burst fly to: evenly round a circle of `radius` px, the first one straight up, each with a
 * small alternating inward step so the ring looks hand-thrown rather than ruled. Offsets from the centre, 0.1 px.
 */
export function burstPoints(n: number, radius = 22): { x: number; y: number }[] {
  const count = Math.max(0, Math.min(24, Math.floor(Number.isFinite(n) ? n : 0)));
  const r = Number.isFinite(radius) ? Math.max(0, radius) : 22;
  const round = (v: number) => Math.round(v * 10) / 10 || 0;
  return Array.from({ length: count }, (_, i) => {
    const a = ((-90 + (360 / count) * i) * Math.PI) / 180;
    const k = i % 2 ? 0.82 : 1;
    return { x: round(Math.cos(a) * r * k), y: round(Math.sin(a) * r * k) };
  });
}

/** A count shown compactly: 999, 1.2k, 12k, 1.2M (`locale` digits are left to the caller). */
export function compactCount(n: number): string {
  const v = Math.max(0, Math.floor(Number.isFinite(n) ? n : 0));
  if (v < 1000) return String(v);
  const [d, s] = v < 1e6 ? [1e3, 'k'] : [1e6, 'M'];
  const x = v / d;
  return `${x < 10 ? Math.floor(x * 10) / 10 : Math.floor(x)}${s}`;
}

/**
 * The rating under a pointer at `x` px across a row `width` px wide with `max` stars: 1…max, or in halves with
 * `half`. Positions left of the row give the lowest step, right of it `max`.
 */
export function ratingAt(x: number, width: number, max = 5, half = false): number {
  const m = Math.max(1, Math.floor(max) || 1);
  if (!(width > 0)) return half ? 0.5 : 1;
  const f = Math.min(1, Math.max(0, x / width)) * m;
  const v = half ? Math.ceil(f * 2) / 2 : Math.ceil(f);
  return Math.min(m, Math.max(half ? 0.5 : 1, v));
}

/** How full star `i` (0-based) is for a rating: 0, 0.5 or 1. */
export const starFill = (value: number, i: number): number => Math.min(1, Math.max(0, Math.round((value - i) * 2) / 2));

/** Tags from text: split on commas or new lines, trimmed, inner spaces collapsed, empties dropped. */
export function parseTags(text: string): string[] {
  return String(text ?? '')
    .split(/[,\n，]/)
    .map((t) => t.trim().replace(/\s+/g, ' '))
    .filter(Boolean);
}

/**
 * Add the tags in `raw` to `tags`: case-insensitive duplicates are refused (their index is reported), each tag is cut
 * to `maxLength` characters and nothing is added past `max` tags.
 */
export function addTags(tags: readonly string[], raw: string, max = Infinity, maxLength = 40): { tags: string[]; added: string[]; duplicate: number; full: boolean } {
  const out = tags.slice();
  const added: string[] = [];
  let duplicate = -1;
  let full = false;
  const lim = Number.isFinite(max) && max > 0 ? Math.floor(max) : Infinity;
  const len = Math.max(1, Math.floor(maxLength) || 40);
  for (const t of parseTags(raw)) {
    const tag = t.slice(0, len);
    const at = out.findIndex((o) => o.toLowerCase() === tag.toLowerCase());
    if (at >= 0) {
      duplicate = at;
      continue;
    }
    if (out.length >= lim) {
      full = true;
      break;
    }
    out.push(tag);
    added.push(tag);
  }
  return { tags: out, added, duplicate, full };
}

/** The characters a one-time-code field keeps from typed or pasted text: digits, or letters and digits upper-cased. */
export function codeChars(text: string, mode: 'numeric' | 'alphanumeric' = 'numeric', length = 6): string[] {
  const s = String(text ?? '');
  const keep = mode === 'alphanumeric' ? s.toUpperCase().replace(/[^0-9A-Z]/g, '') : s.replace(/\D/g, '');
  return keep.slice(0, Math.max(1, Math.min(12, Math.floor(length) || 6))).split('');
}

/** `order` with the item at `from` moved to `to` (both clamped to the list). */
export function moveItem<T>(order: readonly T[], from: number, to: number): T[] {
  const out = order.slice();
  if (!out.length) return out;
  const f = Math.max(0, Math.min(out.length - 1, Math.round(from)));
  const t = Math.max(0, Math.min(out.length - 1, Math.round(to)));
  const [x] = out.splice(f, 1);
  out.splice(t, 0, x);
  return out;
}

/**
 * The slot a dragged item belongs in: `tops` are the slot tops in px (in order), `y` is the dragged item's centre.
 * The item takes the last slot whose middle it has passed.
 */
export function slotAt(y: number, tops: readonly number[], heights: readonly number[]): number {
  if (!tops.length) return 0;
  let slot = 0;
  for (let i = 0; i < tops.length; i++) if (y >= tops[i] + (heights[i] ?? 0) / 2) slot = i;
  if (y < tops[0] + (heights[0] ?? 0) / 2) slot = 0;
  return slot;
}

/** Offsets that make room for an item being moved from `from` to `to`: the items between shift by `size` px. */
export function shiftFor(i: number, from: number, to: number, size: number): number {
  if (i === from) return 0;
  if (from < to && i > from && i <= to) return -size;
  if (from > to && i >= to && i < from) return size;
  return 0;
}

/**
 * Whether a swiped row should end open: past half the actions' `width`, or flicked open at more than `fling` px/s;
 * a flick the other way closes it. `offset` and `velocity` are positive toward open.
 */
export function swipeOpen(offset: number, width: number, velocity = 0, fling = 500): boolean {
  if (velocity > fling) return true;
  if (velocity < -fling) return false;
  return width > 0 && offset >= width / 2;
}

/**
 * Where toast `i` (0 = newest) of `count` sits in a stack: collapsed, the older ones peek out `peek` px behind the
 * newest and shrink; expanded, they spread out with `gap` px between them. `heights` are the toasts' heights.
 */
export function stackLayout(i: number, heights: readonly number[], expanded: boolean, gap = 10, peek = 10): { y: number; scale: number; opacity: number } {
  if (expanded) {
    let y = 0;
    for (let k = 0; k < i; k++) y += (heights[k] ?? 0) + gap;
    return { y, scale: 1, opacity: 1 };
  }
  const depth = Math.max(0, i);
  return { y: depth * peek, scale: Math.max(0.7, 1 - depth * 0.05), opacity: depth > 2 ? 0 : 1 - depth * 0.15 };
}

/** A number as the characters a rolling counter shows: fixed `decimals`, optional thousands `group` separator. */
export function counterText(value: number, decimals = 0, group = ''): string {
  const d = Math.max(0, Math.min(6, Math.floor(decimals) || 0));
  const v = Number.isFinite(value) ? value : 0;
  const [int, frac] = Math.abs(v).toFixed(d).split('.');
  const g = group ? int.replace(/\B(?=(\d{3})+(?!\d))/g, group) : int;
  return `${v < 0 && Number(Math.abs(v).toFixed(d)) !== 0 ? '-' : ''}${g}${frac ? `.${frac}` : ''}`;
}

/**
 * Line up two counter texts from the right so each digit column keeps its place value: shorter texts are padded
 * with '' on the left. Returns the columns as [before, after] pairs.
 */
export function alignDigits(before: string, after: string): [string, string][] {
  const a = before.split('');
  const b = after.split('');
  const n = Math.max(a.length, b.length);
  return Array.from({ length: n }, (_, i) => [a[i - (n - a.length)] ?? '', b[i - (n - b.length)] ?? '']);
}

/** Open panel indexes from an attribute like "0, 2"; with `multiple` false only the first one is kept. */
export function openSet(text: string, count: number, multiple = false): number[] {
  const out: number[] = [];
  for (const s of String(text ?? '').split(/[\s,]+/)) {
    if (!s) continue;
    const n = Number(s);
    if (Number.isInteger(n) && n >= 0 && n < count && !out.includes(n)) out.push(n);
  }
  return multiple ? out : out.slice(0, 1);
}
