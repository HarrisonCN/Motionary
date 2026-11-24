/**
 * 17.9 "Moments" loaders: shared mount for the small CSS-only activity indicators (`mo-six-dot-orbit`, `mo-center-bars`,
 * `mo-quarter-ring`, `mo-triple-pulse`, `mo-breath-orb`, `mo-three-dot-bounce`, `mo-infinity-loop`, `mo-sweep-lines`).
 * Each observes `label`, `paused` and `duration`. Each one is a `role="status"` region whose label is read once; the drawing is `aria-hidden`. The animation is pure CSS,
 * pauses while the element is off screen or `paused`, and stands still under reduced motion.
 */
import type { UsaBase } from '../base';
import { bound, make } from './moments';

export interface LoaderParts {
  /** Class of the drawing (`usa-loader-<kind>`). */
  kind: string;
  /** Number of `<i>` parts inside the drawing, each with `--i`. */
  parts: number;
  /** Default lap length in ms. */
  lap: number;
  /** Optional extra markup for the drawing (an SVG), added after the parts. */
  extra?: () => Element;
}

/** Build the loader inside `host`; returns the function that re-reads its attributes. */
export function mountLoader(host: UsaBase, spec: LoaderParts): () => void {
  const root = make('span', `usa-moment usa-loader usa-loader-${spec.kind}`);
  root.setAttribute('role', 'status');
  const art = make('span', 'usa-loader-art');
  art.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < spec.parts; i++) {
    const part = make('i', 'usa-loader-part');
    part.style.setProperty('--i', String(i));
    art.append(part);
  }
  if (spec.extra) art.append(spec.extra());
  art.style.setProperty('--count', String(spec.parts));
  const label = make('span', 'usa-sr');
  root.append(art, label);
  host.append(root);
  const sync = () => {
    label.textContent = host.str('label', 'Loading');
    root.style.setProperty('--lap', `${bound(host.num('duration', spec.lap), 300, 8000, spec.lap)}ms`);
    root.toggleAttribute('data-paused', host.flag('paused'));
    root.toggleAttribute('data-static', host.reduced);
  };
  host.inView((visible) => root.toggleAttribute('data-offscreen', !visible));
  host.onCleanup(() => root.remove());
  sync();
  return sync;
}
