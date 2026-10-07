import { prefersReducedMotion, applyFrame } from '../base';

/**
 * Click-effect helpers (v2.5): `burst()`, `confetti()`, `shake()`, `haptic()`.
 * Particles live in one fixed, pointer-transparent layer and are removed when
 * their animation ends. Under reduced motion particles are skipped and
 * `shake()` only flashes an outline.
 */

let layer: HTMLElement | null = null;
function fxLayer(): HTMLElement {
  if (layer && layer.isConnected) return layer;
  layer = document.createElement('div');
  layer.className = 'usa-fx-layer';
  layer.setAttribute('aria-hidden', 'true');
  layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483000;overflow:hidden;contain:strict';
  document.body.appendChild(layer);
  return layer;
}

export interface BurstOptions {
  /** Number of particles (default 12). */
  count?: number;
  /** Colours to pick from (default: accent palette). */
  colors?: string[];
  /** Travel distance in px (default 48). */
  distance?: number;
  /** Particle size in px (default 6). */
  size?: number;
  /** `circle` (default), `square`, `star`, `heart` or any text / emoji. */
  shape?: 'circle' | 'square' | 'star' | 'heart' | string;
  /** Duration in ms (default 600). */
  duration?: number;
}

const PALETTE = ['#7c5cff', '#22d3ee', '#f472b6', '#facc15', '#34d399', '#fb923c'];
const GLYPH: Record<string, string> = { star: '★', heart: '♥' };

function particle(x: number, y: number, size: number, color: string, shape: string): HTMLElement {
  const p = document.createElement('span');
  const glyph = GLYPH[shape] || (shape !== 'circle' && shape !== 'square' ? shape : '');
  p.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;margin:${-size / 2}px 0 0 ${-size / 2}px;will-change:transform,opacity;` +
    (glyph ? `font-size:${size * 2}px;line-height:${size}px;text-align:center;color:${color}` : `background:${color};border-radius:${shape === 'square' ? '2px' : '50%'}`);
  if (glyph) p.textContent = glyph;
  fxLayer().appendChild(p);
  return p;
}

const done = (a: Animation | null, el: Element) => {
  if (a) a.onfinish = () => el.remove();
  else el.remove();
};

/** Particles radiating from client point (x, y). Returns the number spawned. */
export function burst(x: number, y: number, options: BurstOptions = {}): number {
  if (typeof document === 'undefined' || prefersReducedMotion()) return 0;
  const { count = 12, colors = PALETTE, distance = 48, size = 6, shape = 'circle', duration = 600 } = options;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
    const d = distance * (0.7 + Math.random() * 0.5);
    const p = particle(x, y, size, colors[i % colors.length], shape);
    const a = typeof p.animate === 'function'
      ? p.animate(
          [
            { transform: 'translate(0,0) scale(1)', opacity: 1 },
            { transform: `translate(${Math.cos(angle) * d}px, ${Math.sin(angle) * d}px) scale(0.2)`, opacity: 0 },
          ],
          { duration: duration * (0.8 + Math.random() * 0.4), easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' }
        )
      : null;
    done(a, p);
  }
  return count;
}

export interface ConfettiOptions {
  /** Origin in client px (default: centre-bottom third of the viewport). */
  x?: number;
  y?: number;
  /** Pieces (default 80). */
  count?: number;
  /** Spread angle in degrees (default 70). */
  spread?: number;
  /** Launch speed multiplier (default 1). */
  velocity?: number;
  colors?: string[];
  /** Duration in ms (default 1600). */
  duration?: number;
}

/** A confetti cannon (paper pieces with gravity, drift and spin). */
export function confetti(options: ConfettiOptions = {}): number {
  if (typeof document === 'undefined' || prefersReducedMotion()) return 0;
  const W = window.innerWidth || 800;
  const H = window.innerHeight || 600;
  const { x = W / 2, y = H * 0.66, count = 80, spread = 70, velocity = 1, colors = PALETTE, duration = 1600 } = options;
  for (let i = 0; i < count; i++) {
    const angle = ((-90 + (Math.random() - 0.5) * spread) * Math.PI) / 180;
    const speed = (260 + Math.random() * 320) * velocity;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    const p = particle(x, y, 6 + Math.random() * 5, colors[i % colors.length], Math.random() > 0.5 ? 'square' : 'circle');
    p.style.height = `${4 + Math.random() * 3}px`;
    const frames: Keyframe[] = [];
    const steps = 8;
    const T = duration / 1000;
    const spin = (Math.random() - 0.5) * 1440;
    for (let s = 0; s <= steps; s++) {
      const t = (s / steps) * T;
      const g = 900;
      frames.push({
        transform: `translate(${(vx * t * 0.8).toFixed(1)}px, ${(vy * t + 0.5 * g * t * t).toFixed(1)}px) rotate(${((spin * s) / steps).toFixed(0)}deg) rotateX(${s * 120}deg)`,
        opacity: s === steps ? 0 : 1,
      });
    }
    const a = typeof p.animate === 'function' ? p.animate(frames, { duration: duration * (0.85 + Math.random() * 0.3), easing: 'linear', fill: 'forwards' }) : null;
    done(a, p);
  }
  return count;
}

/** Horizontal error shake (`intensity` px, default 8). Reduced motion: a red outline flash. */
export function shake(el: Element, intensity = 8, duration = 480): Animation | null {
  const t = el as HTMLElement;
  if (typeof t.animate !== 'function') return null;
  if (prefersReducedMotion()) return t.animate([{ outline: '2px solid #e5484d' }, { outline: '2px solid transparent' }], { duration: 600 });
  const k = intensity;
  return t.animate(
    [0, -k, k, -k * 0.75, k * 0.75, -k * 0.4, k * 0.4, 0].map((v) => ({ transform: `translateX(${v}px)` })),
    { duration, easing: 'ease-in-out' }
  );
}

/** `navigator.vibrate()` where supported (Android Chrome, some WebViews). Returns whether it ran. */
export function haptic(pattern: number | number[] = 10): boolean {
  try {
    return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function' ? navigator.vibrate(pattern) : false;
  } catch {
    return false;
  }
}

export { applyFrame };
