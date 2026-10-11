/**
 * motionary/tokens (= motionary/components/motion-tokens) — Motion Tokens 2.0 (14.1).
 *
 * Easing curves, durations, springs, spatial distances and motion semantics (enter / exit / emphasis /
 * transition) as one token set with modes (reduced motion built in, compact, your own); W3C Design Tokens
 * (DTCG 2025.10) import / export; CSS custom properties; Motion Engine v2 and Scene Format v2 integration;
 * a Figma Variables (REST API shapes) adapter. Zero dependencies, no network calls. docs/motion-tokens.md
 *
 * ```ts
 * import { defineMotionTokens, applyMotionTokenSet, motionOptions, motionKeyframes } from 'motionary/tokens';
 * import { animate } from 'motionary/motion';
 * const tokens = defineMotionTokens({ duration: { fast: 120 }, distance: { md: 20 } });
 * applyMotionTokenSet(tokens, { mode: 'auto' }); // CSS vars + '{duration.fast}' refs; reduced motion when asked for
 * animate('.card', motionKeyframes(tokens, 'enter'), motionOptions(tokens, 'enter'));
 * ```
 */
export * from './set';
export * from './figma';
