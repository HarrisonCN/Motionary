/**
 * use-scroll-animate - Vue 3 Integration
 * Provides useScrollAnimate composable for Vue 3 applications.
 *
 * A thin wrapper around the core engine, so it shares its behaviour: `once`,
 * `offset`, custom easing functions, parallax, `prefers-reduced-motion`
 * support, and cleanup on unmount.
 */
import type { AnimateOptions } from './types';
export declare function createVueComposables(Vue: {
    ref: <T>(value: T | null) => {
        value: T | null;
    };
    onMounted: (fn: () => void) => void;
    onUnmounted: (fn: () => void) => void;
}): {
    useScrollAnimate: (options?: AnimateOptions) => {
        animateRef: {
            value: Element | null;
        };
    };
};
