/**
 * use-scroll-animate/components/text — text effects.
 * `<usa-typewriter>`, `<usa-split-text>`, `<usa-scramble>`, `<usa-counter>`,
 * `<usa-shimmer-text>`, `<usa-text-rotate>`.
 */
import { defineTypewriter, type UsaTypewriterElement } from './typewriter';
import { defineSplitText, type UsaSplitTextElement } from './split-text';
import { defineScramble, type UsaScrambleElement } from './scramble';
import { defineCounter, type UsaCounterElement } from './counter';
import { defineShimmerText, type UsaShimmerTextElement } from './shimmer-text';
import { defineTextRotate, type UsaTextRotateElement } from './text-rotate';

export { defineTypewriter, defineSplitText, defineScramble, defineCounter, defineShimmerText, defineTextRotate };
export { scrambleFrame } from './scramble';
export { easeOutExpo } from './counter';
export type { UsaTypewriterElement, UsaSplitTextElement, UsaScrambleElement, UsaCounterElement, UsaShimmerTextElement, UsaTextRotateElement };
export { configureComponents, prefersReducedMotion } from '../base';
export type { ComponentsConfig, UsaElement } from '../base';

/** Register every component of this category under its default tag. */
export function defineTextComponents(): void {
  defineTypewriter();
  defineSplitText();
  defineScramble();
  defineCounter();
  defineShimmerText();
  defineTextRotate();
}

declare global {
  interface HTMLElementTagNameMap {
    'usa-typewriter': UsaTypewriterElement;
    'usa-split-text': UsaSplitTextElement;
    'usa-scramble': UsaScrambleElement;
    'usa-counter': UsaCounterElement;
    'usa-shimmer-text': UsaShimmerTextElement;
    'usa-text-rotate': UsaTextRotateElement;
  }
}
