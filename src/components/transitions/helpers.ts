import { prefersReducedMotion, EASE_OUT, FLUENT_DECELERATE } from '../base';

export interface ViewTransitionOptions {
  /**
   * Element to cross-fade when the View Transitions API is missing (default:
   * none — the update is applied without animation).
   */
  fallback?: HTMLElement | null;
  /** Fallback fade duration in ms (default 180 out + 220 in). */
  duration?: number;
  /** View transition types (`document.startViewTransition({ types })`, where supported). */
  types?: string[];
}

/**
 * Run `update()` (which changes the DOM) inside a view transition:
 * `document.startViewTransition()` where available (Chrome/Edge 111+, so
 * Electron, WebView2 and Tauri on Windows), otherwise a short cross-fade of
 * `options.fallback`. Instant under reduced motion. Resolves when finished.
 *
 * Give elements a `view-transition-name` in CSS for shared-element morphs.
 */
export async function viewTransition(update: () => void | Promise<void>, options: ViewTransitionOptions = {}): Promise<void> {
  const doc: any = typeof document !== 'undefined' ? document : null;
  if (!doc || prefersReducedMotion()) {
    await update();
    return;
  }
  if (typeof doc.startViewTransition === 'function') {
    let vt: any;
    try {
      vt = options.types ? doc.startViewTransition({ update, types: options.types }) : doc.startViewTransition(update);
    } catch {
      vt = doc.startViewTransition(update);
    }
    await vt.finished.catch(() => undefined);
    return;
  }
  const el = options.fallback;
  const d = options.duration ?? 200;
  if (!el || typeof el.animate !== 'function') {
    await update();
    return;
  }
  await el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: d * 0.8, easing: 'ease-in', fill: 'forwards' }).finished.catch(() => undefined);
  await update();
  const a = el.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: d * 1.1, easing: EASE_OUT });
  // remove the forwards fill of the fade-out
  el.getAnimations?.().forEach((x) => x !== a && x.cancel());
  await a.finished.catch(() => undefined);
}

export interface FlipOptions {
  duration?: number;
  easing?: string;
  /** Fade/scale in elements that did not exist before (default true). */
  animateEnter?: boolean;
}

type Targets = Element | Iterable<Element> | ArrayLike<Element>;
const list = (t: Targets): HTMLElement[] =>
  (t instanceof Element ? Array.from(t.children) : Array.from(t as ArrayLike<Element>)) as HTMLElement[];

/**
 * FLIP animation for layout changes (list reorder, filter, grid resize):
 * measures `targets` (an element's children, or a list), runs `mutate()`,
 * then animates each element from its old position to its new one with
 * transforms only. Elements added by `mutate()` fade in.
 *
 * ```js
 * await flip(list, () => list.append(...shuffled));
 * ```
 */
export async function flip(targets: Targets, mutate: () => void | Promise<void>, options: FlipOptions = {}): Promise<void> {
  const before = new Map(list(targets).map((el) => [el, el.getBoundingClientRect()]));
  await mutate();
  if (prefersReducedMotion()) return;
  const after = list(targets);
  const duration = options.duration ?? 420;
  const easing = options.easing ?? FLUENT_DECELERATE;
  const anims: Animation[] = [];
  // Read all, then write all
  const rects = after.map((el) => el.getBoundingClientRect());
  after.forEach((el, i) => {
    if (typeof el.animate !== 'function') return;
    const first = before.get(el);
    const last = rects[i];
    if (!first) {
      if (options.animateEnter !== false) anims.push(el.animate([{ opacity: 0, transform: 'scale(0.9)' }, { opacity: 1, transform: 'none' }], { duration, easing }));
      return;
    }
    const dx = first.left - last.left;
    const dy = first.top - last.top;
    const sx = last.width ? first.width / last.width : 1;
    const sy = last.height ? first.height / last.height : 1;
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5 && Math.abs(sx - 1) < 0.01 && Math.abs(sy - 1) < 0.01) return;
    anims.push(
      el.animate(
        [{ transformOrigin: '0 0', transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` }, { transformOrigin: '0 0', transform: 'none' }],
        { duration, easing }
      )
    );
  });
  await Promise.all(anims.map((a) => a.finished.catch(() => undefined)));
}

export interface ConnectedOptions {
  duration?: number;
  easing?: string;
  /** Hide `from` while the animation runs (default true). */
  hideSource?: boolean;
}

/**
 * Connected (shared-element) animation, like WinUI's
 * `ConnectedAnimationService`: `to` flies from the position and size of
 * `from` into its own place (e.g. a thumbnail opening into a detail view).
 * Call it right after `to` is shown. Transforms only.
 */
export async function connectedAnimation(from: Element, to: HTMLElement, options: ConnectedOptions = {}): Promise<void> {
  if (prefersReducedMotion() || typeof to.animate !== 'function') return;
  const a = from.getBoundingClientRect();
  const b = to.getBoundingClientRect();
  if (!b.width || !b.height) return;
  const hide = options.hideSource !== false && from instanceof HTMLElement;
  const prev = hide ? (from as HTMLElement).style.visibility : '';
  if (hide) (from as HTMLElement).style.visibility = 'hidden';
  const anim = to.animate(
    [
      { transformOrigin: '0 0', transform: `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.width / b.width}, ${a.height / b.height})` },
      { transformOrigin: '0 0', transform: 'none' },
    ],
    { duration: options.duration ?? 480, easing: options.easing ?? FLUENT_DECELERATE }
  );
  await anim.finished.catch(() => undefined);
  if (hide) (from as HTMLElement).style.visibility = prev;
}
