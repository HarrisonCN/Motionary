/**
 * use-scroll-animate - React Integration
 * Provides useScrollAnimate and useScrollStagger hooks for React applications.
 * `useScrollStagger({ observeChildren: true })` also animates children added later.
 *
 * Both hooks are thin wrappers around the core engine, so they share its
 * behaviour: `once`, `offset`, custom easing functions, parallax,
 * `prefers-reduced-motion` support, and proper cleanup on unmount.
 */
import type { AnimateOptions } from './types';
import { type StaggerOptions } from './stagger';
type ReactRef<T> = {
    current: T | null;
};
/**
 * Wrap the callbacks that exist at mount so they always call the latest
 * version from the most recent render (avoids stale closures without
 * re-creating observers on every render).
 * @internal
 */
export declare function withLatestCallbacks(latest: ReactRef<AnimateOptions>): AnimateOptions;
export declare function createReactHooks(React: {
    useRef: <T>(initial: T | null) => ReactRef<T>;
    useEffect: (effect: () => (() => void) | void, deps?: unknown[]) => void;
}): {
    useScrollAnimate: (options?: AnimateOptions) => ReactRef<Element>;
    useScrollStagger: (options?: StaggerOptions) => ReactRef<Element>;
};
export {};
