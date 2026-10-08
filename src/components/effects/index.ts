/**
 * use-scroll-animate/components/effects — the 5.x effect packs, all
 * registered through `registerEffect()` (5.0) and playable with
 * `playEffect()`, `bindEffect()` or `<usa-fx>`. Kept out of
 * `use-scroll-animate/components` / `components/lite` so their size budgets
 * hold; the UMD bundle registers everything.
 *
 * ```ts
 * import { registerAllEffects } from 'use-scroll-animate/components/effects';
 * registerAllEffects();
 * ```
 */
import { registerEffects, registerBuiltinEffects } from '../fx/index';
import type { EffectDefinition } from '../fx/registry';
import { CARD_FX, CLICK_FX } from './cards-click';
import { PHYSICS_FX } from './physics';
import { PAGE_FX } from './page';
import { defineStory } from './story';
import { GENERATIVE_FX } from './generative';
import { AUDIO_FX, defineAudio } from './audio';
import { CURSOR_FX, defineGestureFx } from './cursor';
import { MICRO_FX } from './micro';
import { THEME_FX, defineTheme } from './themes';
import { definePlayer } from './player';

export { CARD_FX, CLICK_FX, PHYSICS_FX, PAGE_FX, GENERATIVE_FX, AUDIO_FX, CURSOR_FX, MICRO_FX, THEME_FX };
export { togglePressed, swapLabel, bumpCount } from './micro';
export { THEMES, THEME_NAMES, THEME_ROLES, themeVars, themeCss, applyTheme, themePreset, playThemeEffect, defineTheme } from './themes';
export type { ThemePack, ThemeRole, UsaThemeElement } from './themes';
export { createPlayer, normalizeAnimation, definePlayer, ANIMATION_FORMAT } from './player';
export type { AnimationJSON, AnimationTrack, Player, UsaPlayerElement } from './player';
export { bindGesture, flingVelocity, angleDelta, GESTURES, defineGestureFx } from './cursor';
export type { GestureName, GestureFxOptions, GestureDetail, UsaGestureFxElement } from './cursor';
export { enableAudio, disableAudio, getAudio, createBeatDetector, onBeat, bindBeat, defineAudio } from './audio';
export type { AudioInput, AudioSample, AudioReactive, BeatOptions, UsaAudioElement } from './audio';
export { canvasBackground, noise2, hexRgb } from './generative';
export type { GenFrame, GenerativeSpec } from './generative';
export { solveSpring, springKeyframes, bounceKeyframes } from './physics';
export type { SpringOptions } from './physics';
export { defineStory, STORY_TEMPLATES, storyProgress, formatCount } from './story';
export type { StoryTemplate, UsaStoryElement } from './story';
export { fxLayer } from './shared';

/** The effect packs by version, in release order. */
export const EFFECT_PACKS: Record<string, EffectDefinition[]> = {
  'cards-click': [...CARD_FX, ...CLICK_FX],
  physics: PHYSICS_FX,
  page: PAGE_FX,
  generative: GENERATIVE_FX,
  audio: AUDIO_FX,
  cursor: CURSOR_FX,
  micro: MICRO_FX,
  themes: THEME_FX,
};

/** 5.1: card & click effects 2.0. */
export function registerCardClickEffects(): void {
  registerEffects(EFFECT_PACKS['cards-click']);
}

/** 5.2: bounce & physics micro-interactions. */
export function registerPhysicsEffects(): void {
  registerEffects(EFFECT_PACKS.physics);
}

/** 5.3: page-wide transitions and effects. */
export function registerPageEffects(): void {
  registerEffects(EFFECT_PACKS.page);
}

/** 5.5: generative Canvas 2D backgrounds. */
export function registerGenerativeEffects(): void {
  registerEffects(EFFECT_PACKS.generative);
}

/** 5.6: sound-reactive (Web Audio) backgrounds. */
export function registerAudioEffects(): void {
  registerEffects(EFFECT_PACKS.audio);
}

/** 5.7: cursor trails, magnetic dots, spotlight cursor. */
export function registerCursorEffects(): void {
  registerEffects(EFFECT_PACKS.cursor);
}

/** 5.8: micro-interactions + theme-pack effects. */
export function registerMicroEffects(): void {
  registerEffects(EFFECT_PACKS.micro);
  registerEffects(EFFECT_PACKS.themes);
}

/** Define the 5.x elements of this entry (`<usa-story>`, …) under their default tags. */
export function defineEffectElements(): void {
  defineStory();
  defineAudio();
  defineGestureFx();
  defineTheme();
  definePlayer();
}

/** Register the built-ins and every pack (idempotent). */
export function registerAllEffects(): void {
  registerBuiltinEffects();
  for (const defs of Object.values(EFFECT_PACKS)) registerEffects(defs);
}
