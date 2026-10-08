/** Entrance effects shared by `<usa-reveal>` and `<usa-stagger>` (transform / opacity / filter only). */

export const REVEAL_EFFECTS = [
  'fade',
  'fade-up',
  'fade-down',
  'fade-left',
  'fade-right',
  'zoom-in',
  'zoom-out',
  'blur',
  'blur-up',
  'flip-up',
  'flip-left',
  'rise',
] as const;

export type RevealEffect = (typeof REVEAL_EFFECTS)[number];

/** The "from" keyframe of an effect; the "to" keyframe is the element's natural state. */
export function revealFrom(effect: string, distance = 32): Keyframe {
  const d = `${distance}px`;
  switch (effect) {
    case 'fade':
      return { opacity: 0 };
    case 'fade-down':
      return { opacity: 0, transform: `translate3d(0,-${d},0)` };
    case 'fade-left':
      return { opacity: 0, transform: `translate3d(-${d},0,0)` };
    case 'fade-right':
      return { opacity: 0, transform: `translate3d(${d},0,0)` };
    case 'zoom-in':
      return { opacity: 0, transform: 'scale(0.86)' };
    case 'zoom-out':
      return { opacity: 0, transform: 'scale(1.14)' };
    case 'blur':
      return { opacity: 0, filter: 'blur(12px)' };
    case 'blur-up':
      return { opacity: 0, filter: 'blur(10px)', transform: `translate3d(0,${d},0)` };
    case 'flip-up':
      return { opacity: 0, transform: 'perspective(800px) rotateX(-55deg)', transformOrigin: '50% 100%' };
    case 'flip-left':
      return { opacity: 0, transform: 'perspective(800px) rotateY(55deg)', transformOrigin: '0% 50%' };
    case 'rise':
      return { opacity: 0, transform: `translate3d(0,${distance * 1.5}px,0) scale(0.96)` };
    case 'fade-up':
    default:
      return { opacity: 0, transform: `translate3d(0,${d},0)` };
  }
}

/** Keyframes from the effect to the natural state. */
export function revealKeyframes(effect: string, distance?: number): Keyframe[] {
  // Any preset registered with the scroll library (core, `presets/extended`, your own)
  const p = (REVEAL_EFFECTS as readonly string[]).includes(effect) ? null : (globalThis as any)[Symbol.for('use-scroll-animate.presets')]?.[effect];
  if (p) return [p.from, ...(p.frames || []), p.to];
  const from = revealFrom(effect, distance);
  const to: Keyframe = {};
  for (const k of Object.keys(from)) {
    if (k === 'opacity') to.opacity = 1;
    else if (k === 'transform') to.transform = 'none';
    else if (k === 'filter') to.filter = 'none';
    else if (k === 'transformOrigin') to.transformOrigin = from.transformOrigin;
  }
  return [from, to];
}
