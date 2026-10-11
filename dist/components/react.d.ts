/**
 * Framework-neutral binding for `<usa-*>` elements (v3.8): set DOM
 * **properties** and listen to `usa:*` events, with update / destroy — the
 * shape Svelte actions, Solid directives and Angular directives all share.
 */
interface UsaBinding {
    /** DOM properties to set (`checked`, `value`, `open`, `index`…). */
    props?: Record<string, unknown>;
    /** Event handlers by name; `change` is shorthand for `usa:change`. */
    on?: Record<string, (e: CustomEvent) => void>;
}
/** Normalise an event key: `change` → `usa:change`, `usa:change` stays. */
declare const usaEventName: (k: string) => string;
/** Bind properties and `usa:*` listeners to an element; returns `{ update, destroy }`. */
declare function bindUsa(el: HTMLElement, binding?: UsaBinding): {
    update(b: UsaBinding): void;
    destroy(): void;
};

interface ReactLike {
    createElement: (type: any, props?: any, ...children: any[]) => any;
    forwardRef: (render: (props: any, ref: any) => any) => any;
    useRef: <T>(v: T) => {
        current: T;
    };
    useEffect: (fn: () => void | (() => void), deps?: unknown[]) => void;
    useLayoutEffect?: (fn: () => void | (() => void), deps?: unknown[]) => void;
}
/** `usa-auto-animate` → `UsaAutoAnimate` */
declare const pascal: (tag: string) => string;
/** `onUsaChange` → `usa:change`, `onUsaDragEnd` → `usa:drag-end`; `onChange` → `change`. */
declare function eventName(prop: string): string | null;
/** All `<usa-*>` tags shipped by the package. */
declare const USA_TAGS: string[];
declare function createUsaComponents(React: ReactLike): Record<string, any>;
/** `UsaAutoAnimate` → `usa-auto-animate`, `UsaCarousel3d` → `usa-carousel-3d` (inverse of {@link pascal} for the shipped tags). */
declare const kebab: (name: string) => string;

export { USA_TAGS, bindUsa, createUsaComponents, eventName, kebab, pascal, usaEventName };
export type { UsaBinding };
