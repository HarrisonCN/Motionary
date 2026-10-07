/**
 * use-scroll-animate - Sequence / timeline helper
 * Chain animations on several targets, one after another (or overlapping).
 */
import type { AnimateOptions, ScrollAnimateInstance } from './types';
export interface SequenceStep extends AnimateOptions {
    /** Selector, Element, NodeList or Element[] to animate in this step */
    target: string | Element | NodeList | Element[];
    /** Pause (ms) after the previous step ends before this one starts. Negative values overlap. (default: 0) */
    gap?: number;
    /** Absolute start time (ms) on the timeline; overrides `gap` */
    at?: number;
}
export interface SequenceOptions extends AnimateOptions {
    /** Play automatically (once) when this element/selector enters the viewport */
    trigger?: string | Element;
    /** Instance whose global config (easing, classes, `disabled`) is used */
    instance?: ScrollAnimateInstance;
}
export interface SequenceController {
    /** Play (or replay) the timeline. Resolves when every step has completed, or on `cancel()`. */
    play(): Promise<void>;
    /** Stop the trigger and running animations; elements are left visible. */
    cancel(): void;
    /** Total duration of the timeline in ms (computed for the current DOM). */
    duration(): number;
}
/**
 * Build a timeline of animations.
 *
 * @example
 * sequence([
 *   { target: '.title', animation: 'fade-in-up' },
 *   { target: '.subtitle', animation: 'blur-in', gap: -300 },   // overlap by 300ms
 *   { target: '.card', animation: 'scale-up', stagger: 80 },
 * ], { trigger: '.hero' });
 */
export declare function sequence(steps: SequenceStep[], options?: SequenceOptions): SequenceController;
