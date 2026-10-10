// motionary 12.1 — HarmonyOS ArkTS export. Generated: npx motionary export --target arkts
// Usage: this.frame = USA_PRESETS['fade-in-up'].from; usaAnimate(USA_PRESETS['fade-in-up'], (f) => this.frame = f, { reduceMotion })
import { curves } from '@kit.ArkUI';

export interface UsaFrame { opacity?: number; tx?: number | string; ty?: number | string; sx?: number; sy?: number; rx?: number; ry?: number; rz?: number; blur?: number; brightness?: number }
export interface UsaPreset { from: UsaFrame; to: UsaFrame }
export interface UsaAnimateOptions { duration?: string; curve?: string; reduceMotion?: boolean }

export const USA_DURATION: Record<string, number> = { 'instant': 0, 'fast': 150, 'normal': 300, 'slow': 600, 'slower': 900, 'slowest': 1400 };
export const USA_CURVE: Record<string, ICurve> = { 'linear': curves.initCurve(Curve.Linear), 'standard': curves.cubicBezierCurve(0.2, 0, 0, 1), 'emphasized': curves.cubicBezierCurve(0.22, 1, 0.36, 1), 'decelerate': curves.cubicBezierCurve(0, 0, 0, 1), 'accelerate': curves.cubicBezierCurve(0.3, 0, 1, 1), 'spring': curves.cubicBezierCurve(0.34, 1.56, 0.64, 1), 'bounce': curves.cubicBezierCurve(0.68, -0.55, 0.265, 1.55) };

export const USA_PRESETS: Record<string, UsaPreset> = {
  'fade-in-up': { from: { opacity: 0, ty: 40 }, to: { opacity: 1, ty: 0 } },
  'zoom-in': { from: { opacity: 0, sx: 0.8, sy: 0.8 }, to: { opacity: 1, sx: 1, sy: 1 } },
  'rotate-in': { from: { opacity: 0, rz: -180, sx: 0.5, sy: 0.5 }, to: { opacity: 1, rz: 0, sx: 1, sy: 1 } },
};

/** Animate a preset with animateTo(); reduceMotion = true jumps straight to the end state (honour your own setting). */
export function usaAnimate(p: UsaPreset, apply: (f: UsaFrame) => void, opts: UsaAnimateOptions = {}): void {
  apply(p.from);
  if (opts.reduceMotion) { apply(p.to); return; }
  animateTo({ duration: USA_DURATION[opts.duration ?? 'normal'], curve: USA_CURVE[opts.curve ?? 'standard'] }, () => apply(p.to));
}
