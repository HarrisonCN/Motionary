/**
 * use-scroll-animate/components/a11y — accessibility toolkit (4.4).
 *
 * - Motion-sensitivity levels: `setMotionSensitivity('full' | 'gentle' | 'minimal' | 'static')`.
 * - Static alternatives: what every component shows when motion is off, and
 *   `staticAlternative(root)` to freeze any subtree at its final state.
 * - `aria-live` conventions: one shared polite and one assertive region,
 *   `announce(message, { politeness })`.
 * - `auditMotionA11y(root)`: the rules the automated regression tests run
 *   over every `<usa-*>` element — usable in your own tests too.
 *
 * ```ts
 * import { setMotionSensitivity, announce, auditMotionA11y } from 'use-scroll-animate/components/a11y';
 * setMotionSensitivity('gentle', true);           // no spins / zooms / parallax, remembered
 * announce('3 items added to cart');               // polite live region
 * expect(auditMotionA11y(document.body).errors).toEqual([]);
 * ```
 */
import {
  configureComponents,
  getMotionSensitivity,
  adaptKeyframes,
  adoptStyles,
  MOTION_SENSITIVITY_LEVELS,
  type MotionSensitivity,
} from '../base';
import { COMPONENT_CATEGORIES, type ComponentCategory } from '../index-tags';

export { getMotionSensitivity, adaptKeyframes, MOTION_SENSITIVITY_LEVELS };
export { baselineReport, warnBaseline } from './baseline';
export type { BaselineFeature } from './baseline';
export type { MotionSensitivity };

const KEY = 'usa:sensitivity';

/** What each level allows, for docs and settings UIs. */
export const MOTION_SENSITIVITY: Record<MotionSensitivity, { en: string; zh: string; allows: string[] }> = {
  full: { en: 'All motion', zh: '全部动效', allows: ['fade', 'translate', 'scale', 'rotate', 'parallax', 'loop', 'flash'] },
  gentle: { en: 'Gentle — no spins, zooms or parallax', zh: '温和 —— 无旋转、缩放与视差', allows: ['fade', 'translate', 'loop'] },
  minimal: { en: 'Minimal — fades only', zh: '最少 —— 仅淡入淡出', allows: ['fade'] },
  static: { en: 'Static — no animation', zh: '静态 —— 无动画', allows: [] },
};

/** CSS applied at the `static` / `minimal` / `gentle` levels (also stops your own CSS animations under `static`). */
export const SENSITIVITY_CSS =
  'html[data-usa-sensitivity="static"] *,html[data-usa-sensitivity="static"] *::before,html[data-usa-sensitivity="static"] *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}' +
  'html[data-usa-sensitivity="minimal"] *,html[data-usa-sensitivity="minimal"] *::before,html[data-usa-sensitivity="minimal"] *::after{animation-duration:1ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important}' +
  'html[data-usa-sensitivity="gentle"]{--usa-parallax:0;--usa-tilt:0}';

/**
 * Set the motion-sensitivity level for every `<usa-*>` component and the page:
 * sets `data-usa-sensitivity` on `<html>`, adapts component keyframes, and
 * with `persist` remembers the choice (`restoreMotionSensitivity()`).
 * Dispatches `usa:sensitivity` on `document`.
 */
export function setMotionSensitivity(level: MotionSensitivity, persist = false): void {
  if (!MOTION_SENSITIVITY_LEVELS.includes(level)) return;
  configureComponents({ motionSensitivity: level });
  adoptStyles('a11y-sensitivity', SENSITIVITY_CSS);
  if (persist) {
    try {
      localStorage.setItem(KEY, level);
    } catch {
      /* private mode */
    }
  }
  if (level === 'static' && typeof document !== 'undefined') staticAlternative(document.documentElement);
  if (typeof document !== 'undefined') document.dispatchEvent(new CustomEvent('usa:sensitivity', { detail: { level } }));
}

/** Re-apply a persisted level (call early on page load). Returns the active level. */
export function restoreMotionSensitivity(): MotionSensitivity {
  try {
    const v = localStorage.getItem(KEY) as MotionSensitivity | null;
    if (v && MOTION_SENSITIVITY_LEVELS.includes(v)) setMotionSensitivity(v);
  } catch {
    /* ignore */
  }
  return getMotionSensitivity();
}

/** `true` when the current level allows a kind of motion (`'rotate'`, `'parallax'`, `'loop'`…). */
export function motionAllowed(kind: string, level: MotionSensitivity = getMotionSensitivity()): boolean {
  return MOTION_SENSITIVITY[level].allows.includes(kind);
}

/** The static alternative of each category: what its elements show without motion. */
export const STATIC_ALTERNATIVES: Record<ComponentCategory, string> = {
  reveal: 'Content visible in place; progress bars show the current value.',
  text: 'Full final text (screen readers always get a plain copy).',
  interaction: 'Normal hover / focus styles; no tilt, magnet or ripple.',
  feedback: 'Spinners become a static busy indicator; progress shows its value; toasts appear without sliding.',
  background: 'A still frame of the background (gradient / pattern); particles and marquees stop.',
  transitions: 'Dialogs, accordions and views switch instantly.',
  physics: 'Values jump to their target; drag still works, without inertia.',
  cards: 'Cards are shown flat and fully readable; stacks become lists.',
  click: 'Clicks work and states are announced; no bursts, confetti or deformation.',
  ui: 'Tabs, drawers, sheets and popovers open instantly with focus management intact.',
  page: 'Page transitions are instant; cursors and ambient layers are hidden.',
  timeline: 'Every step is shown at its final state.',
  gesture: 'Buttons / keys provide the same actions as swipes and pinches.',
  svg: 'Drawings and icons are shown complete.',
  webgl: 'A static poster image or CSS gradient instead of the shader.',
  depth: 'Flat, front-facing layout.',
  layout: 'Items reflow instantly.',
  packs: 'Roles are styled but not animated.',
  fx: 'Effects are skipped or reduced to a short fade; the content is unchanged.',
};

/**
 * Freeze a subtree at its static alternative: finishes running animations
 * (`finish()`, so content lands on its final state), marks the root with
 * `data-usa-static` and returns an undo that removes the mark.
 */
export function staticAlternative(root: Element): () => void {
  const getAll = (root as any).getAnimations as undefined | ((o: { subtree: boolean }) => Animation[]);
  if (typeof getAll === 'function') {
    for (const a of getAll.call(root, { subtree: true })) {
      try {
        const it = a.effect?.getComputedTiming().iterations;
        if (it === Infinity) a.cancel();
        else a.finish();
      } catch {
        /* finished already */
      }
    }
  }
  root.setAttribute('data-usa-static', '');
  return () => root.removeAttribute('data-usa-static');
}

// --- aria-live conventions ---------------------------------------------------

export type Politeness = 'polite' | 'assertive';
/** The ids of the shared live regions. */
export const LIVE_REGION_IDS: Record<Politeness, string> = { polite: 'usa-live-polite', assertive: 'usa-live-assertive' };

/** The shared live region (created once, visually hidden, `role="status"` / `role="alert"`). */
export function liveRegion(politeness: Politeness = 'polite'): HTMLElement | null {
  if (typeof document === 'undefined' || !document.body) return null;
  const id = LIVE_REGION_IDS[politeness];
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('div');
    el.id = id;
    el.className = 'usa-sr';
    el.setAttribute('role', politeness === 'assertive' ? 'alert' : 'status');
    el.setAttribute('aria-live', politeness);
    el.setAttribute('aria-atomic', 'true');
    document.body.appendChild(el);
  }
  return el;
}

let lastMsg = '';
let lastAt = 0;
/**
 * Announce a message through the shared live region. Conventions: `polite`
 * for results of the user's own actions (added, saved, copied), `assertive`
 * only for errors that block them. Identical messages within `dedupe` ms
 * (default 500) are dropped; the region is cleared first so repeats are read.
 */
export function announce(message: string, options: { politeness?: Politeness; dedupe?: number } = {}): boolean {
  const { politeness = 'polite', dedupe = 500 } = options;
  const t = Date.now();
  if (!message || (message === lastMsg && t - lastAt < dedupe)) return false;
  lastMsg = message;
  lastAt = t;
  const el = liveRegion(politeness);
  if (!el) return false;
  el.textContent = '';
  el.textContent = message;
  return true;
}

// --- audit ---------------------------------------------------------------------

export interface A11yIssue {
  rule: string;
  level: 'error' | 'warning';
  element: Element;
  message: string;
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
const NAMED_ROLES = ['button', 'switch', 'checkbox', 'slider', 'tab', 'progressbar', 'radiogroup', 'dialog'];

function accessibleName(el: Element): string {
  const label = el.getAttribute('aria-label');
  if (label) return label;
  const by = el.getAttribute('aria-labelledby');
  if (by) return by.split(/\s+/).map((id) => el.ownerDocument.getElementById(id)?.textContent || '').join(' ').trim();
  return (el.textContent || el.getAttribute('title') || '').trim();
}

/**
 * Check a subtree against the library's motion-a11y rules:
 * - `aria-hidden-focusable` (error): focusable content inside `aria-hidden`.
 * - `role-name` (error): a widget role without an accessible name.
 * - `range-value` (error): a slider / determinate progressbar without `aria-valuenow`.
 * - `img-alt` (error): an `<img>` without `alt`.
 * - `assertive-live` (warning): `aria-live="assertive"` outside `role="alert"`.
 * - `infinite-no-control` (warning, WCAG 2.2.2): an endless animation on a
 *   page with no way to pause motion (`<usa-motion-switch>` or `[data-usa-pause]`).
 */
export function auditMotionA11y(root: Element | Document): { errors: A11yIssue[]; warnings: A11yIssue[] } {
  const issues: A11yIssue[] = [];
  const add = (rule: string, level: A11yIssue['level'], element: Element, message: string) => issues.push({ rule, level, element, message });
  const scope = root as ParentNode;
  scope.querySelectorAll('[aria-hidden="true"]').forEach((h) => {
    const f = (h.matches(FOCUSABLE) ? [h] : Array.from(h.querySelectorAll(FOCUSABLE))).filter((x) => !x.closest('[inert]'));
    f.forEach((x) => add('aria-hidden-focusable', 'error', x, `focusable <${x.tagName.toLowerCase()}> inside aria-hidden`));
  });
  scope.querySelectorAll('[role]').forEach((el) => {
    const role = el.getAttribute('role')!;
    if (NAMED_ROLES.includes(role) && !accessibleName(el)) add('role-name', 'error', el, `role="${role}" has no accessible name`);
    if (role === 'slider' && !el.hasAttribute('aria-valuenow'))
      add('range-value', 'error', el, 'slider without aria-valuenow');
  });
  scope.querySelectorAll('img:not([alt])').forEach((el) => add('img-alt', 'error', el, '<img> without alt'));
  scope.querySelectorAll('[aria-live="assertive"]').forEach((el) => {
    if (el.getAttribute('role') !== 'alert') add('assertive-live', 'warning', el, 'assertive live region outside role="alert"');
  });
  const doc = (root as Node).ownerDocument || (root as Document);
  const anims = typeof (root as any).getAnimations === 'function' ? ((root as any).getAnimations({ subtree: true }) as Animation[]) : [];
  const control = doc && (doc.querySelector('usa-motion-switch, [data-usa-pause]') || doc.documentElement.hasAttribute('data-usa-sensitivity'));
  if (!control)
    anims.forEach((a) => {
      try {
        if (a.effect?.getComputedTiming().iterations === Infinity) {
          const t = (a.effect as KeyframeEffect).target;
          if (t) add('infinite-no-control', 'warning', t, 'endless animation and no motion control on the page');
        }
      } catch {
        /* ignore */
      }
    });
  return { errors: issues.filter((i) => i.level === 'error'), warnings: issues.filter((i) => i.level === 'warning') };
}

/** Every `<usa-*>` tag, for sweeping audits. */
export const ALL_TAGS: string[] = (Object.values(COMPONENT_CATEGORIES) as readonly (readonly string[])[]).flat();
