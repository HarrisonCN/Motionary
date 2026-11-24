/**
 * 17.9 "Tactile": shared press physics for the soft, springy controls (`mo-squish-key`, `mo-squish-stepper`,
 * `mo-analog-stick`, `mo-transfer-button`). A key sinks while held and, when let go, overshoots past its rest height
 * and wobbles back. One spring per key writes `--press` (1 = fully down, negative = stretched above rest).
 */
import type { UsaBase } from '../base';
import { createSpring, type SpringValue } from '../physics/spring';

export const PRESS_SPRING = { stiffness: 520, damping: 17, mass: 1 };

/** Wire `key` (a native button) so pointer, Enter and Space drive a press spring. Returns the spring. */
export function pressSpring(host: UsaBase, key: HTMLElement, depth = 1): SpringValue {
  const press = createSpring({ spring: PRESS_SPRING, onUpdate: (p) => key.style.setProperty('--press', p.toFixed(4)) });
  let held = false;
  const down = () => {
    if ((key as HTMLButtonElement).disabled || held) return;
    held = true;
    press.set(depth);
  };
  const up = () => {
    if (!held) return;
    held = false;
    // let go with an upward kick so the key springs past rest and settles
    press.set(0, -9 * depth);
  };
  host.listen(key, 'pointerdown', (e: PointerEvent) => { if (e.pointerType !== 'mouse' || e.button === 0) down(); });
  host.listen(key, 'pointerup', up);
  host.listen(key, 'pointerleave', up);
  host.listen(key, 'pointercancel', up);
  host.listen(key, 'keydown', (e: KeyboardEvent) => { if (!e.repeat && (e.key === ' ' || e.key === 'Enter')) down(); });
  host.listen(key, 'keyup', (e: KeyboardEvent) => { if (e.key === ' ' || e.key === 'Enter') up(); });
  host.listen(key, 'blur', up);
  host.onCleanup(() => press.stop());
  return press;
}

/** A quick tap for programmatic presses (a click from assistive tech, `press()` from script): down and back up. */
export function tap(press: SpringValue): void {
  // no hold to follow: a downward kick from rest dips the key and lets it spring back up
  if (!press.animating) press.set(0, 14);
}
