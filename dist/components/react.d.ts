interface ReactLike {
    createElement: (type: any, props?: any, ...children: any[]) => any;
    forwardRef: (render: (props: any, ref: any) => any) => any;
    useRef: <T>(v: T) => {
        current: T;
    };
    useEffect: (fn: () => void | (() => void), deps?: unknown[]) => void;
    useLayoutEffect?: (fn: () => void | (() => void), deps?: unknown[]) => void;
}
/** `usa-flip-list` → `UsaFlipList` */
declare const pascal: (tag: string) => string;
/** `onUsaChange` → `usa:change`, `onUsaDragEnd` → `usa:drag-end`; `onChange` → `change`. */
declare function eventName(prop: string): string | null;
/** All `<usa-*>` tags shipped by the package. */
declare const USA_TAGS: string[];
declare function createUsaComponents(React: ReactLike): Record<string, any>;

export { USA_TAGS, createUsaComponents, eventName, pascal };
