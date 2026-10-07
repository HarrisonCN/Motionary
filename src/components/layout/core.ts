import { prefersReducedMotion, motionScale, EASE_OUT } from '../base';

type Box = { left: number; top: number; width: number; height: number };

/** FLIP keyframes from a previous box to the current one (pure). */
export function flipFrames(from: Box, to: Box, scale = true): Keyframe[] {
  const dx = from.left - to.left;
  const dy = from.top - to.top;
  const sx = scale && to.width ? from.width / to.width : 1;
  const sy = scale && to.height ? from.height / to.height : 1;
  return [
    { transformOrigin: '0 0', transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
    { transformOrigin: '0 0', transform: 'none' },
  ];
}

export interface AutoAnimateOptions {
  duration?: number;
  easing?: string;
  /** Also animate size changes (default true). */
  scale?: boolean;
}

/**
 * Auto-animate a container: children that are added fade / scale in, removed
 * ones fade out in place, and moved ones (re-sort, filter, reflow, resize)
 * glide to their new spot — no extra code at the call site. Returns
 * `{ disable, enable, stop }`. Reduced motion: changes apply instantly.
 *
 * @example
 * const ctl = autoAnimate(document.querySelector('ul'));
 * list.append(item); // animates
 */
export function autoAnimate(parent: HTMLElement, o: AutoAnimateOptions = {}): { enable(): void; disable(): void; stop(): void } {
  let on = true;
  const boxes = new WeakMap<Element, Box>();
  const rel = (el: Element): Box => {
    const r = el.getBoundingClientRect();
    const p = parent.getBoundingClientRect();
    return { left: r.left - p.left, top: r.top - p.top, width: r.width, height: r.height };
  };
  const snap = () => Array.from(parent.children).forEach((c) => boxes.set(c, rel(c)));
  const dur = () => (o.duration ?? 300) * motionScale();
  const timing = (): KeyframeAnimationOptions => ({ duration: dur(), easing: o.easing ?? EASE_OUT });
  const animate = (el: Element, frames: Keyframe[], t = timing()) => (typeof (el as HTMLElement).animate === 'function' ? (el as HTMLElement).animate(frames, t) : null);

  const mo =
    typeof MutationObserver === 'function'
      ? new MutationObserver((records) => {
          if (!on || prefersReducedMotion() || dur() <= 0) return snap();
          const added = new Set<Element>();
          for (const r of records) {
            r.addedNodes.forEach((n) => n instanceof Element && n.parentElement === parent && added.add(n));
            r.removedNodes.forEach((n) => {
              if (!(n instanceof HTMLElement) || n.isConnected) return;
              const b = boxes.get(n);
              if (!b) return;
              // put a ghost back at its old place and fade it out
              n.style.position = 'absolute';
              n.style.left = `${b.left}px`;
              n.style.top = `${b.top}px`;
              n.style.width = `${b.width}px`;
              n.style.height = `${b.height}px`;
              n.style.margin = '0';
              n.style.pointerEvents = 'none';
              if (getComputedStyle(parent).position === 'static') parent.style.position = 'relative';
              parent.appendChild(n);
              (n as any).__usaGhost = true;
              const a = animate(n, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(0.96)' }]);
              const drop = () => {
                n.remove();
                for (const k of ['position', 'left', 'top', 'width', 'height', 'margin', 'pointerEvents'] as const) n.style[k] = '';
              };
              if (a) a.finished.then(drop, drop);
              else drop();
            });
          }
          Array.from(parent.children).forEach((c) => {
            if ((c as any).__usaGhost) return;
            if (added.has(c)) return void animate(c, [{ opacity: 0, transform: 'scale(0.96)' }, { opacity: 1, transform: 'none' }]);
            const prev = boxes.get(c);
            if (!prev) return;
            const now = rel(c);
            if (Math.abs(prev.left - now.left) + Math.abs(prev.top - now.top) + Math.abs(prev.width - now.width) + Math.abs(prev.height - now.height) < 1) return;
            animate(c, flipFrames(prev, now, o.scale !== false));
          });
          snap();
        })
      : null;
  mo?.observe(parent, { childList: true });
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => snap()) : null;
  ro?.observe(parent);
  snap();
  // capture boxes right before any change in the same task (events, timers)
  const capture = () => snap();
  parent.addEventListener('pointerdown', capture, true);
  return {
    enable: () => ((on = true), snap()),
    disable: () => (on = false),
    stop: () => {
      mo?.disconnect();
      ro?.disconnect();
      parent.removeEventListener('pointerdown', capture, true);
    },
  };
}

/** Masonry placement: shortest-column-first positions for item heights (pure). */
export function masonryLayout(heights: number[], columns: number, columnWidth: number, gap: number): { x: number; y: number }[] & { height?: number } {
  const cols = Array(Math.max(1, columns)).fill(0);
  const out = heights.map((h) => {
    const c = cols.indexOf(Math.min(...cols));
    const pos = { x: c * (columnWidth + gap), y: cols[c] };
    cols[c] += h + gap;
    return pos;
  }) as { x: number; y: number }[] & { height?: number };
  out.height = Math.max(0, Math.max(...cols) - gap);
  return out;
}

export interface SharedOptions {
  duration?: number;
  easing?: string;
}

/**
 * Shared-element transition between two states of the page: every element
 * with `data-shared="id"` before `update()` flies to the element with the
 * same id afterwards (size and position), the rest cross-fades. Uses the
 * View Transitions API when present (with `view-transition-name` per id),
 * otherwise a FLIP fallback. Reduced motion: just runs `update()`.
 */
export async function sharedTransition(update: () => void | Promise<void>, root: ParentNode = document, o: SharedOptions = {}): Promise<void> {
  if (prefersReducedMotion() || typeof document === 'undefined') return void (await update());
  const collect = () => new Map(Array.from(root.querySelectorAll<HTMLElement>('[data-shared]')).map((el) => [el.dataset.shared!, el]));
  const doc = document as any;
  if (typeof doc.startViewTransition === 'function') {
    const named = (m: Map<string, HTMLElement>) => m.forEach((el, id) => (el.style.viewTransitionName = `usa-${id.replace(/[^\w-]/g, '_')}`));
    const clear = (m: Map<string, HTMLElement>) => m.forEach((el) => (el.style.viewTransitionName = ''));
    const before = collect();
    named(before);
    let after = new Map<string, HTMLElement>();
    const vt = doc.startViewTransition(async () => {
      clear(before);
      await update();
      after = collect();
      named(after);
    });
    await vt.finished.catch(() => undefined);
    clear(after);
    return;
  }
  const before = new Map(Array.from(collect()).map(([id, el]) => [id, el.getBoundingClientRect()]));
  await update();
  const anims: Promise<unknown>[] = [];
  collect().forEach((el, id) => {
    const a = before.get(id);
    if (!a || typeof el.animate !== 'function') return;
    const b = el.getBoundingClientRect();
    if (!b.width || !b.height) return;
    anims.push(el.animate(flipFrames(a, b), { duration: (o.duration ?? 450) * motionScale(), easing: o.easing ?? EASE_OUT }).finished.catch(() => undefined));
  });
  await Promise.all(anims);
}
