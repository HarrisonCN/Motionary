/**
 * motionary/components/perf — performance toolkit (4.5).
 *
 * - One shared rAF scheduler for every component loop (`onFrame()`, `schedulerStats()`).
 * - Animation budget: `setAnimationBudget(n)` caps concurrent component
 *   animations; extra ones land on their final frame.
 * - `autoDegrade()`: watches frame rate and animation count and steps motion
 *   down (`low`, then a tighter budget) while the device struggles, restoring
 *   it when frames recover.
 * - On-demand CSS: `loadCategoryStyles()` / `onDemandStyles()` — used by
 *   `motionary/components/lite`, the build without inlined CSS.
 */
import {
  onFrame,
  schedulerStats,
  activeAnimations,
  setAnimationBudget,
  animationBudget,
  setFrameBudget,
  setStyleLoader,
  configureComponents,
  getMotionIntensity,
  type MotionIntensity,
} from '../base';
import type { ComponentCategory } from '../index-tags';
import { categoryForTag } from '../category-for-tag';

export { onFrame, schedulerStats, activeAnimations, setAnimationBudget, animationBudget, setFrameBudget };

export interface AutoDegradeOptions {
  /** Frame rate below which motion is degraded (default 45). */
  minFps?: number;
  /** Concurrent animations above which motion is degraded (default 40). */
  maxActive?: number;
  /** Sample window in ms (default 1000). */
  sample?: number;
  /** Bad samples in a row before degrading (default 2). */
  patience?: number;
  /** Good samples in a row before restoring (default 3). */
  recovery?: number;
  /** Called on every change. */
  onChange?: (state: DegradeState) => void;
}

export interface DegradeState {
  degraded: boolean;
  fps: number;
  active: number;
  reason: '' | 'fps' | 'count';
}

/**
 * Watch frame rate and animation count; while the device struggles, set
 * motion intensity to `low` and cap concurrent animations at `maxActive / 2`,
 * then restore the previous settings once frames recover. Dispatches
 * `usa:degrade` on `document`. Returns a stop function (restores settings).
 */
export function autoDegrade(options: AutoDegradeOptions = {}): () => void {
  const { minFps = 45, maxActive = 40, sample = 1000, patience = 2, recovery = 3, onChange } = options;
  let frames = 0;
  let elapsed = 0;
  let bad = 0;
  let good = 0;
  let prev: { intensity: MotionIntensity; budget: number } | null = null;
  const state: DegradeState = { degraded: false, fps: 60, active: 0, reason: '' };
  const set = (degraded: boolean, reason: DegradeState['reason']) => {
    if (degraded === state.degraded) return;
    state.degraded = degraded;
    state.reason = reason;
    if (degraded) {
      prev = { intensity: getMotionIntensity(), budget: animationBudget() };
      configureComponents({ motionIntensity: 'low' });
      setAnimationBudget(Math.max(4, Math.floor(maxActive / 2)));
    } else if (prev) {
      configureComponents({ motionIntensity: prev.intensity });
      setAnimationBudget(prev.budget);
      prev = null;
    }
    onChange?.({ ...state });
    if (typeof document !== 'undefined') document.dispatchEvent(new CustomEvent('usa:degrade', { detail: { ...state } }));
  };
  const stop = onFrame((_t, dt) => {
    frames++;
    elapsed += Math.min(dt, 250);
    if (elapsed < sample) return;
    state.fps = Math.round((frames * 1000) / elapsed);
    state.active = activeAnimations();
    frames = 0;
    elapsed = 0;
    const reason = state.fps < minFps ? 'fps' : state.active > maxActive ? 'count' : '';
    if (reason) {
      good = 0;
      if (++bad >= patience) set(true, reason);
    } else {
      bad = 0;
      if (++good >= recovery) set(false, '');
    }
  });
  return () => {
    stop();
    set(false, '');
  };
}

export { categoryForTag as categoryOf };

const loaded = /*#__PURE__*/ new Set<string>();

/** Categories with a pending or loaded Motionary stylesheet. */
export function loadedStyles(): string[] {
  return [...loaded];
}

/**
 * Add `<link rel="stylesheet" href="{base}components/{category}.css">` once.
 * `base` is the URL of the package's `dist/` folder.
 */
export function loadCategoryStyles(category: ComponentCategory | 'all', base: string): HTMLLinkElement | null {
  if (typeof document === 'undefined' || loaded.has(category)) return null;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `${base.replace(/\/?$/, '/')}components${category === 'all' ? '' : '/' + category}.css`;
  link.dataset.usaCss = category;
  loaded.add(category);
  link.addEventListener('error', () => {
    loaded.delete(category);
    link.remove();
  }, { once: true });
  document.head.append(link);
  return link;
}

/**
 * Load each category's CSS the first time one of its elements connects
 * (custom tags fall back to the full stylesheet). Returns an undo.
 */
export function onDemandStyles(base: string): () => void {
  setStyleLoader((tag) => loadCategoryStyles(categoryForTag(tag) || 'all', base));
  return () => setStyleLoader(null);
}
