// motionary 15.2 — HarmonyOS ArkTS export of "Card intro" (motionary/studio/native). Generated; edit the scene, not this file.
// API 11+ (UIContext.keyframeAnimateTo). Usage: playCardIntroTitle(this.getUIContext(), (f) => this.frame = f, reduceMotion)
import { curves } from '@kit.ArkUI';

export const CARD_INTRO_DURATION: number = 600;

/** Layer "title" (#title): bind these fields to the component's attributes. */
export interface CardIntroTitleFrame { opacity: number; translateY: number; scaleX: number; scaleY: number }
export const CARD_INTRO_TITLE_START: CardIntroTitleFrame = { opacity: 0, translateY: 20, scaleX: 0.9, scaleY: 0.9 };
export const CARD_INTRO_TITLE_END: CardIntroTitleFrame = { opacity: 1, translateY: 0, scaleX: 1, scaleY: 1 };

export function playCardIntroTitle(ctx: UIContext, apply: (f: CardIntroTitleFrame) => void, reduceMotion: boolean = false): void {
  apply(CARD_INTRO_TITLE_START);
  if (reduceMotion) { apply(CARD_INTRO_TITLE_END); return; }
  ctx.keyframeAnimateTo({ iterations: 1 }, [
    { duration: 400, curve: curves.cubicBezierCurve(0.2, 0, 0, 1), event: () => apply({ opacity: 1, translateY: 0, scaleX: 1, scaleY: 1 }) },
  ]);
}

/** Layer "card" (.card): bind these fields to the component's attributes. */
export interface CardIntroCardFrame { backgroundColor: string }
export const CARD_INTRO_CARD_START: CardIntroCardFrame = { backgroundColor: '#ffffff' };
export const CARD_INTRO_CARD_END: CardIntroCardFrame = { backgroundColor: '#0f172a' };

export function playCardIntroCard(ctx: UIContext, apply: (f: CardIntroCardFrame) => void, reduceMotion: boolean = false): void {
  apply(CARD_INTRO_CARD_START);
  if (reduceMotion) { apply(CARD_INTRO_CARD_END); return; }
  ctx.keyframeAnimateTo({ iterations: 1 }, [
    { duration: 100, curve: Curve.Linear, event: () => apply({ backgroundColor: '#ffffff' }) },
    { duration: 500, curve: curves.cubicBezierCurve(0, 0, 0.58, 1), event: () => apply({ backgroundColor: '#0f172a' }) },
  ]);
}
