import { adoptStyles, raf, caf, prefersReducedMotion } from '../base';
import { setVariant } from '../ui/variants';
import css from './fluent.css?raw';

export interface FluentPresetOptions {
  /** Root to apply to (default `document.documentElement`). */
  root?: HTMLElement;
  /** Reveal highlight on interactive elements (default `true`). */
  reveal?: boolean;
  /** Reveal targets (default buttons, links, `[data-fluent-reveal]`). */
  selector?: string;
  /** Mica-style tinted window background on `<body>` (default `true`). */
  mica?: boolean;
}

/**
 * Windows 11 **Fluent preset** (v2.8): applies the `fluent` variant
 * (Segoe UI Variable, Windows accent, 8 px radii), a Mica-style tinted
 * window background, Acrylic on `.usa-acrylic` / `[data-acrylic]`, and
 * Reveal highlight (a light following the pointer on borders and
 * backgrounds of interactive elements). Ideal for WebView2 / Electron /
 * Tauri apps on Windows. Returns a function that removes it.
 * Respects reduced motion / transparency (no Reveal tracking; solid materials).
 */
export function fluentPreset(options: FluentPresetOptions = {}): () => void {
  if (typeof document === 'undefined') return () => undefined;
  const root = options.root || document.documentElement;
  adoptStyles('fluent-preset', css);
  setVariant('fluent', root);
  root.classList.add('usa-fluent');
  if (options.mica !== false) root.classList.add('usa-fluent-mica');
  const sel = options.selector || 'button, [role="button"], a.usa-fluent-item, [data-fluent-reveal], .usa-fluent-item';
  let frame = 0;
  let last: HTMLElement | null = null;
  let ev: PointerEvent | null = null;
  const apply = () => {
    frame = 0;
    if (!ev) return;
    const t = (ev.target as Element)?.closest?.(sel) as HTMLElement | null;
    if (last && last !== t) last.removeAttribute('data-reveal');
    last = t;
    if (!t) return;
    const r = t.getBoundingClientRect();
    t.style.setProperty('--usa-reveal-x', `${ev.clientX - r.left}px`);
    t.style.setProperty('--usa-reveal-y', `${ev.clientY - r.top}px`);
    t.setAttribute('data-reveal', '');
  };
  const move = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return;
    ev = e;
    if (!frame) frame = raf(apply);
  };
  const reveal = options.reveal !== false && !prefersReducedMotion();
  if (reveal) document.addEventListener('pointermove', move, { passive: true });
  return () => {
    document.removeEventListener('pointermove', move);
    caf(frame);
    last?.removeAttribute('data-reveal');
    root.classList.remove('usa-fluent', 'usa-fluent-mica');
    setVariant(null, root);
  };
}
