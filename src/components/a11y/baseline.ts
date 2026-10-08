/**
 * 4.9 — the 5.0 modern-browser baseline. `baselineReport()` lists which
 * required / progressive features this browser has; `warnBaseline()` logs
 * once in development when a required one is missing.
 */
import { deprecate } from '../base';

export interface BaselineFeature {
  id: string;
  required: boolean;
  supported: boolean;
}

/** Required in 5.0: Custom Elements, WAAPI, IntersectionObserver, ResizeObserver, adoptedStyleSheets. Progressive: View Transitions, scroll-driven animations, WebGL. */
export function baselineReport(): BaselineFeature[] {
  const w = (typeof window !== 'undefined' ? window : {}) as any;
  const d = (typeof document !== 'undefined' ? document : {}) as any;
  const css = (q: string) => typeof w.CSS?.supports === 'function' && w.CSS.supports(q);
  return [
    { id: 'custom-elements', required: true, supported: !!w.customElements },
    { id: 'web-animations', required: true, supported: typeof w.Element?.prototype?.animate === 'function' },
    { id: 'intersection-observer', required: true, supported: typeof w.IntersectionObserver === 'function' },
    { id: 'resize-observer', required: true, supported: typeof w.ResizeObserver === 'function' },
    { id: 'adopted-stylesheets', required: true, supported: 'adoptedStyleSheets' in d },
    { id: 'view-transitions', required: false, supported: typeof d.startViewTransition === 'function' },
    { id: 'scroll-driven-animations', required: false, supported: css('animation-timeline: view()') },
    { id: 'webgl', required: false, supported: !!(d.createElement && (() => { try { return d.createElement('canvas').getContext('webgl'); } catch { return null; } })()) },
  ];
}

/** Log (once) which required 5.0 features are missing here. Returns the missing ids. */
export function warnBaseline(): string[] {
  const missing = baselineReport().filter((f) => f.required && !f.supported).map((f) => f.id);
  if (missing.length) deprecate('baseline', `this browser lacks ${missing.join(', ')}; use-scroll-animate 5.0 requires them (modern-browser baseline, see docs/upgrading-5.md).`);
  return missing;
}
