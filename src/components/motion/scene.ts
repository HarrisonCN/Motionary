/**
 * `motionary/motion/scene` (= `motionary/components/motion-scene`, 14.0) — `playScene()`: play a
 * Scene Format v2 document with Motion Engine v2 as one standard controller. Its own entry so that
 * `motionary/motion` stays small: this one adds the scene loader `<usa-player>` uses
 * (`src/components/scene/play.ts`: token references, mute / solo, seeded `random()`).
 */
import { animate } from './index';
import { control, group } from './controls';
import { sceneToAnimation } from '../scene/play';
import type { Ctl, MotionControls, ControlOptions } from './controls';

export type { MotionControls, MotionPlayState, ControlOptions } from './controls';

export interface PlaySceneOptions extends ControlOptions {
  /** Called when the playhead first passes an effect track (`<usa-player>` fires registered effects; the engine leaves that to you). */
  onEffect?: (el: Element, effect: string, options: Record<string, unknown>) => void;
}

/**
 * Play a Scene Format v2 document (or `motionary-timeline` v1 / animation JSON v1) inside `root` with
 * Motion Engine v2: one standard controller for the whole scene. Token references, mute / solo and
 * seeded `random()` are resolved like `<usa-player>` does (same loader).
 */
export function playScene(root: Element, doc: any, options: PlaySceneOptions = {}): MotionControls {
  const d = typeof doc === 'string' ? JSON.parse(doc) : doc;
  // animation JSON v1 plays its tracks as they are; anything else goes through the scene loader (which throws on what it cannot read)
  const a = d?.format === 'use-scroll-animate/animation' ? { tracks: d.tracks || [], loop: d.loop, duration: d.duration } : sceneToAnimation(d || {});
  const pick = (sel?: string): Element[] => (!sel || sel === ':scope' ? [root] : Array.from(root.querySelectorAll(sel)));
  const items: [Ctl, number][] = [];
  for (const t of a.tracks) {
    const list = pick(t.target);
    if (!list.length) continue;
    const at = Math.max(0, Number(t.start) || 0);
    let fired = false;
    const c = t.effect
      ? animate((p: number) => { if (p >= 1 && !fired) { fired = true; list.forEach((el) => options.onEffect?.(el, t.effect!, (t.options as any) || {})); } }, { duration: 1, autoplay: false })
      : animate(list, (t.keyframes as Keyframe[]) || t.preset || 'fade', { duration: Math.max(1, Number(t.duration) || 600), easing: t.easing || 'cubic-bezier(0.22, 1, 0.36, 1)', autoplay: false });
    items.push([c as Ctl, at]);
  }
  if (a.duration) items.push([control({ d: a.duration, r() {} }, { autoplay: false }), 0]);
  return group(items, { ...options, repeat: a.loop ? Infinity : 0 });
}
