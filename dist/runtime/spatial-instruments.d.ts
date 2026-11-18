/**
 * 11.4: runtime tiers. **basic** — ticker, tween, timeline, scroll, text, CSS / WAAPI keyframes; **standard** — smooth
 * scrolling, drag-snap, SVG, sprites, GIF / APNG / WebP, Lottie; **advanced** — WebGL, 3D file parsing and decoders,
 * physics. A page that only uses basic modules never downloads standard or advanced code.
 */
type RuntimeTier = 'basic' | 'standard' | 'advanced';
/** A runtime module: `{ id, version, api }`, registered with `use()`. */
interface RuntimeModule<A = unknown> {
    /** Module id: 'core', 'format-css', 'scroll', … (import path `motionary/runtime/<id>`). */
    id: string;
    version: string;
    /** Other modules this one needs (registered first by `use()` callers). */
    requires?: string[];
    /** 11.4: runtime tier — basic · standard · advanced (docs/runtime-tiers.md). */
    tier?: RuntimeTier;
    /** The module's public API (what `requireModule(id)` returns). */
    api: A;
    /** Optional one-time setup, called on first registration. */
    setup?(registry: RuntimeRegistry): void;
}
interface RuntimeRegistry {
    version: string;
    modules: Map<string, RuntimeModule>;
    /** Shared per-page state slots (the ticker lives here). */
    slots: Record<string, unknown>;
}

type InstrumentKind = 'lens' | 'iris' | 'relief';
interface InstrumentView {
    resize(width: number, height: number): void;
    render(progress: number, tilt: number): void;
    dispose(): void;
}
/** A demand-rendered Three.js scene. The caller owns input, visibility and canvas lifetime. */
declare function createInstrument(canvas: HTMLCanvasElement, kind: InstrumentKind): InstrumentView;
interface SpatialInstrumentsApi {
    createInstrument: typeof createInstrument;
}
declare const spatialInstruments: RuntimeModule<SpatialInstrumentsApi>;

export { createInstrument, spatialInstruments };
export type { InstrumentKind, InstrumentView, SpatialInstrumentsApi };
