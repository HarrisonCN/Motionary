/**
 * use-scroll-animate/components/timeline — choreography (v3.1).
 * `timeline()` chains, overlaps, labels, seeks, reverses and scroll-scrubs
 * WAAPI animations on one playhead; `<usa-timeline>` builds one from
 * `data-tl` children.
 */
import { defineTimeline, type UsaTimelineElement } from './timeline-el';

export { defineTimeline };
export { timeline, resolvePosition, TIMELINE_PRESETS } from './core';
export type { Timeline, TimelineOptions, TimelineStepOptions, TimelinePosition, ScrubOptions } from './core';
export type { UsaTimelineElement };
export { configureComponents, prefersReducedMotion } from '../base';
export type { ComponentsConfig, UsaElement } from '../base';

/** Register every component of this category under its default tag. */
export function defineTimelineComponents(): void {
  defineTimeline();
}

declare global {
  interface HTMLElementTagNameMap {
    'usa-timeline': UsaTimelineElement;
  }
}
