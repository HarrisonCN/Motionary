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

import { defineWaveText, defineGlitch, defineGradientText, defineHandwriting, defineScrollHighlight } from './text-fx';
import type { UsaWaveTextElement, UsaGlitchElement, UsaGradientTextElement, UsaHandwritingElement, UsaScrollHighlightElement } from './text-fx';
export { defineTypewriter, defineSplitText, defineScramble, defineCounter, defineShimmerText, defineTextRotate };
export { scrambleFrame } from './scramble';
export { splitText, splitTimeline, splitOrder, graphemes, words as splitWords, JOINING_SCRIPT } from './split';
export type { SplitBy, SplitTextOptions, SplitResult, SplitFrom, SplitTimelineOptions } from './split';
export { easeOutExpo } from './counter';
export type { UsaTypewriterElement, UsaSplitTextElement, UsaScrambleElement, UsaCounterElement, UsaShimmerTextElement, UsaTextRotateElement };
export { defineWaveText, defineGlitch, defineGradientText, defineHandwriting, defineScrollHighlight };
export type { UsaWaveTextElement, UsaGlitchElement, UsaGradientTextElement, UsaHandwritingElement, UsaScrollHighlightElement };

/** Register every component of this category under its default tag. */
export function defineTextComponents(): void {
  defineTypewriter();
  defineSplitText();
  defineScramble();
  defineCounter();
  defineShimmerText();
  defineTextRotate();
  defineWaveText();
  defineGlitch();
  defineGradientText();
  defineHandwriting();
  defineScrollHighlight();
}

declare global {
  interface HTMLElementTagNameMap {
    'usa-wave-text': UsaWaveTextElement;
    'usa-glitch': UsaGlitchElement;
    'usa-gradient-text': UsaGradientTextElement;
    'usa-handwriting': UsaHandwritingElement;
    'usa-scroll-highlight': UsaScrollHighlightElement;
    'usa-typewriter': UsaTypewriterElement;
    'usa-split-text': UsaSplitTextElement;
    'usa-scramble': UsaScrambleElement;
    'usa-counter': UsaCounterElement;
    'usa-shimmer-text': UsaShimmerTextElement;
    'usa-text-rotate': UsaTextRotateElement;
  }
}
