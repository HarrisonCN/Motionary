import { clamp } from '../base';

export interface TiltReading {
  /** Left/right tilt, -1…1. */
  x: number;
  /** Front/back tilt, -1…1. */
  y: number;
}

/** Map a DeviceOrientation reading (beta/gamma degrees) to -1…1 tilt around a resting pose (pure). */
export function orientationToTilt(beta: number | null, gamma: number | null, range = 30, rest = 45): TiltReading {
  return {
    x: clamp((gamma ?? 0) / range, -1, 1),
    y: clamp(((beta ?? rest) - rest) / range, -1, 1),
  };
}

/** `true` when DeviceOrientation events exist. */
export const supportsOrientation = (): boolean => typeof window !== 'undefined' && 'DeviceOrientationEvent' in window;

/**
 * Ask for motion-sensor permission where required (iOS 13+; must run inside
 * a user gesture). Resolves `true` when tilt events can be used.
 */
export async function requestOrientationPermission(): Promise<boolean> {
  if (!supportsOrientation()) return false;
  const D = (window as any).DeviceOrientationEvent;
  if (typeof D.requestPermission !== 'function') return true;
  try {
    return (await D.requestPermission()) === 'granted';
  } catch {
    return false;
  }
}

/**
 * Listen to device tilt (smoothed); falls back to nothing on desktops.
 * Returns a stop function.
 */
export function deviceTilt(cb: (t: TiltReading) => void, o: { range?: number; smooth?: number } = {}): () => void {
  if (!supportsOrientation()) return () => {};
  let cur: TiltReading = { x: 0, y: 0 };
  const k = 1 - clamp(o.smooth ?? 0.2, 0, 0.95);
  const on = (e: DeviceOrientationEvent) => {
    const t = orientationToTilt(e.beta, e.gamma, o.range ?? 30);
    cur = { x: cur.x + (t.x - cur.x) * k, y: cur.y + (t.y - cur.y) * k };
    cb(cur);
  };
  window.addEventListener('deviceorientation', on);
  return () => window.removeEventListener('deviceorientation', on);
}
