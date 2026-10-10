/**
 * motionary/components — the phone viewport (13.3.0): one shared watcher for the soft keyboard
 * (`visualViewport`) and screen rotation, used by `<usa-bottom-sheet>`, `<usa-drawer>`, `<usa-modal>`, `<usa-sheet>`,
 * `<usa-toast-stack>` and `<usa-pagination>`. Public from `motionary/components/widgets`.
 */
import type { Cleanup } from './base';

// While anything watches, <html> carries --usa-vvh (visible height) and --usa-kb (the height the keyboard covers at
// the bottom of the layout viewport).
let vpSubs: Set<() => void> | null = null;
const vpSet = (k: string, v?: number): void => {
  const s = document.documentElement.style;
  v === undefined ? s.removeProperty(k) : s.setProperty(k, v + 'px');
};
const vpUpdate = (e?: Event): void => {
  const v = window.visualViewport, h = viewportHeight();
  vpSet('--usa-vvh', h);
  // a pinch-zoom (scale > 1) shrinks the visual viewport too: that is not a keyboard
  vpSet('--usa-kb', v && v.scale < 1.01 ? Math.max(0, Math.round(innerHeight - h - v.offsetTop)) : 0);
  if (e) vpSubs?.forEach((f) => f());
};
const vpOn = (m: 'addEventListener' | 'removeEventListener', v = window.visualViewport): void => {
  window[m]('resize', vpUpdate);
  window[m]('orientationchange', vpUpdate);
  v?.[m]('resize', vpUpdate);
  v?.[m]('scroll', vpUpdate);
};

/** The visible viewport height: the layout height minus what the soft keyboard covers (13.3.0). */
export const viewportHeight = (): number => window.visualViewport?.height || innerHeight;

/**
 * Watch the visible viewport on phones (13.3.0): `fn` runs when the soft keyboard opens or closes
 * (`visualViewport` resize / scroll), on window resize and on `orientationchange`. While at least one
 * watcher is active, `<html>` has `--usa-vvh` and `--usa-kb` (px). Returns the unsubscribe function;
 * the last one removes every listener and both variables.
 */
export function watchViewport(fn?: () => void): Cleanup {
  const f = () => fn?.();
  if (!vpSubs) vpOn('addEventListener'), (vpSubs = new Set());
  vpSubs.add(f);
  vpUpdate();
  return () => {
    if (!vpSubs?.delete(f) || vpSubs.size) return;
    vpOn('removeEventListener');
    vpSubs = null;
    vpSet('--usa-vvh');
    vpSet('--usa-kb');
  };
}

/** Internal (13.3.0): what an open `<usa-bottom-sheet>` / `<usa-drawer>` does on phones. */
interface Panel extends HTMLElement {
  open: boolean;
  _drag: unknown;
  _si: number;
  _pos: { jump(v: number): void };
  stops(): number[];
}
/**
 * Keep an open panel on its snap point through rotation and the soft keyboard, and let long content scroll with a
 * finger (`data-scrollable` → `touch-action: pan-y`; short content keeps drag-anywhere). Returns the unsubscribe.
 */
export function followPanel(p: Panel): Cleanup {
  const fit = () => p.toggleAttribute('data-scrollable', p.scrollHeight > p.clientHeight + 1);
  fit();
  return watchViewport(() => {
    if (p._drag || !p.open) return;
    p._pos.jump(p.stops()[p._si] ?? 0);
    fit();
  });
}
