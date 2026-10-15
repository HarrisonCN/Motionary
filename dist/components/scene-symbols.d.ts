interface SymbolOverride {
    target?: string;
    muted?: boolean;
    props?: Record<string, number | string>;
}
interface SymbolProblem {
    path: string;
    message: string;
}
interface SymbolUsage {
    instances: string[];
    overrides: number;
}
interface SymbolsCssReport {
    symbols: number;
    instances: number;
    keyframeBlocks: number;
    rules: number;
    lost: SymbolProblem[];
}
type Doc = any;
type Layer = any;
interface CreateSymbolOptions {
    /** The symbol id (key in `components`). */
    id: string;
    name?: string;
    /** The instance left in place (default: the symbol id). */
    instanceId?: string;
    /** The instance target; layer targets under it become relative (`#card .face` → `.face`, `#card` → `:scope`). */
    target?: string;
}
/**
 * Turn layers into a symbol and leave one instance where they were. One group selected → the group becomes the
 * instance and its descendants the symbol; otherwise the selected layers (with their group descendants) move in.
 * Keyframe times become content time (the earliest keyframe is 0; the instance `start` keeps the timing).
 */
declare function createSymbol(doc: Doc, layerIds: string[], o: CreateSymbolOptions): Doc;
interface AddInstanceOptions {
    id: string;
    target?: string;
    start?: number;
    parent?: string;
    overrides?: Record<string, SymbolOverride>;
}
/** Add an instance of a symbol at the end of the top-level layer list. */
declare function addInstance(doc: Doc, symbolId: string, o: AddInstanceOptions): Doc;
/** Override one symbol layer for one instance (`target`, `muted`, `props` set on every keyframe); merges with an existing override. */
declare function setOverride(doc: Doc, instanceId: string, layerId: string, ov: SymbolOverride): Doc;
/** Remove one override (or every override of the instance when `layerId` is omitted). */
declare function clearOverride(doc: Doc, instanceId: string, layerId?: string): Doc;
/** Edit a symbol's master layers once; every instance follows (overrides are kept). Refuses a symbol that would contain itself. */
declare function updateSymbol(doc: Doc, symbolId: string, edit: (layers: Layer[]) => Layer[]): Doc;
/** Rename a symbol and every reference to it. */
declare function renameSymbol(doc: Doc, from: string, to: string): Doc;
/** Replace one instance by plain layers (a group named after the instance + its expanded layers, as `sceneV3ToV2` reads them). */
declare function detachInstance(doc: Doc, instanceId: string): {
    doc: Doc;
    lost: SymbolProblem[];
};
/** Which instances use each symbol, and how many overrides they carry. */
declare function symbolUsage(doc: Doc): Record<string, SymbolUsage>;
/** Symbol-level problems `validateSceneV3` does not judge as errors: missing refs, stray override keys, cycles, unused symbols. */
declare function validateSymbols(doc: Doc): SymbolProblem[];
/**
 * CSS for a Scene v3 document with symbols: one `@keyframes <prefix>-<symbol>-<layer>` per symbol track (emitted
 * once however many instances use it); each instance adds one rule per layer (its selector, duration, delay). An
 * instance with `props` overrides gets its own block (`…--<instance>`); muted layers are skipped; plain top-level
 * tracks export as `<prefix>-<layer>`. Instances inside compositions and symbols inside symbols are listed in `lost`.
 */
declare function symbolsToCss(doc: Doc, o?: {
    prefix?: string;
}): {
    css: string;
    report: SymbolsCssReport;
};

export { addInstance, clearOverride, createSymbol, detachInstance, renameSymbol, setOverride, symbolUsage, symbolsToCss, updateSymbol, validateSymbols };
export type { AddInstanceOptions, CreateSymbolOptions, SymbolOverride, SymbolProblem, SymbolUsage, SymbolsCssReport };
