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

/**
 * `motionary/runtime/gl` (10.5) — a small WebGL2 scene renderer written for
 * Motionary (not a Three.js clone; own API, own shaders):
 *
 * - **math** (`mat4`, quaternions — column-major `Float32Array`s), pure;
 * - **scene graph**: `GlNode` (position / rotation quaternion / scale,
 *   children, optional mesh), `Camera` (perspective, `lookAt`), lights
 *   (`ambient`, up to 4 directional / point), `bounds()` + `frameNode()`;
 * - **geometry** builders (`box`, `plane`, `sphere`, `torus`) and custom
 *   geometry from typed arrays (indexed 16 / 32-bit or not);
 * - **materials**: `standard` (metallic-roughness PBR approximation, base
 *   colour texture, emissive, ACES-free Reinhard tone mapping, sRGB),
 *   `unlit`, and `shader` (your GLSL ES 3.00 fragment with the standard
 *   varyings + your uniforms);
 * - **textures** from images, canvases, bitmaps and **videos** (updated per
 *   decoded frame with `requestVideoFrameCallback`; `scrubVideo()` seeks a
 *   video from a 0–1 progress, e.g. a scroll scene);
 * - `orbitControls()` — drag / wheel / pinch / arrow keys, damping, optional
 *   auto-rotate (off under reduced motion).
 *
 * Math, geometry and the scene graph are pure (SSR / workers); rendering
 * needs WebGL2 (`createRenderer()` throws a clear error without it). Model
 * loaders live in `motionary/runtime/format-gltf` and `format-obj`.
 */

type Vec3 = [number, number, number];
type Quat = [number, number, number, number];
type Mat4 = Float32Array;
interface Geometry {
    positions: Float32Array;
    normals?: Float32Array;
    uvs?: Float32Array;
    indices?: Uint16Array | Uint32Array;
    /** 'triangles' (default), 'lines', 'points'. */
    mode?: 'triangles' | 'lines' | 'points';
    /** Bump after changing positions / normals in place (10.8: skinning, morph targets) — the renderer re-uploads them. */
    version?: number;
    /** Renderer cache. */
    _gpu?: unknown;
}
interface GlTexture {
    source: TexImageSource | {
        width: number;
        height: number;
        data: Uint8Array | Uint8ClampedArray;
    };
    /** sRGB colour data (default true for colour maps). */
    srgb?: boolean;
    repeat?: boolean;
    flipY?: boolean;
    /** Re-upload every frame a new video frame is ready. */
    video?: boolean;
    needsUpdate?: boolean;
    _gpu?: unknown;
}
interface Material {
    type: 'standard' | 'unlit' | 'shader';
    /** Linear RGBA multiplier (sRGB input converted by the shader). */
    color: [number, number, number, number];
    map?: GlTexture | null;
    metallic: number;
    roughness: number;
    emissive: Vec3;
    doubleSided?: boolean;
    transparent?: boolean;
    wireframe?: boolean;
    /** 'shader' materials: GLSL ES 3.00 fragment body + uniforms. */
    fragment?: string;
    uniforms?: Record<string, number | number[] | Float32Array | GlTexture>;
    _gpu?: unknown;
}
interface Mesh {
    geometry: Geometry;
    material: Material;
}
declare class GlNode {
    name: string;
    position: Vec3;
    rotation: Quat;
    scale: Vec3;
    /** Set to use a fixed local matrix instead of position / rotation / scale (glTF `matrix`). */
    matrix: Mat4 | null;
    children: GlNode[];
    parent: GlNode | null;
    mesh: Mesh | Mesh[] | null;
    visible: boolean;
    /** Free-form data (loaders put source info here). */
    extras: Record<string, unknown>;
    readonly world: Mat4;
    constructor(name?: string, mesh?: Mesh | Mesh[] | null);
    add(...nodes: GlNode[]): this;
    remove(n: GlNode): void;
    setEuler(x: number, y: number, z: number): this;
    local(): Mat4;
    /** Recompute world matrices of this subtree. */
    updateWorld(parent?: Mat4): void;
    traverse(fn: (n: GlNode) => void): void;
    find(name: string): GlNode | null;
}

/**
 * `motionary/runtime/format-obj` (10.5) — Wavefront OBJ + MTL loader for
 * `motionary/runtime/gl` (own parser): `v` / `vt` / `vn`, faces with any
 * number of vertices (fan-triangulated) and negative indices, `o` / `g`
 * groups, `usemtl` material switches (one mesh per material), `s` ignored;
 * MTL `Kd`, `Ks` + `Ns` (→ roughness), `Ke`, `d` / `Tr` (opacity), `map_Kd`
 * (with options stripped), `illum` ignored. Missing normals are computed
 * (flat). Parsing is pure (SSR / workers); `loadObj()` fetches the OBJ, its
 * `mtllib` files and textures relative to the OBJ URL.
 */

interface ObjMaterial {
    name: string;
    Kd: [number, number, number];
    Ks: [number, number, number];
    Ke: [number, number, number];
    Ns: number;
    d: number;
    map_Kd?: string;
}
interface ObjGroup {
    name: string;
    material: string;
    geometry: Geometry;
}
interface ObjData {
    groups: ObjGroup[];
    mtllibs: string[];
    /** Vertex count read (before de-indexing). */
    vertexCount: number;
    triangleCount: number;
}
/** Parse OBJ text into groups (one geometry per object / group × material). */
declare function parseObj(text: string): ObjData;
/** Parse MTL text. */
declare function parseMtl(text: string): Record<string, ObjMaterial>;
/** OBJ material → runtime/gl standard material (Ns 0–1000 → roughness). */
declare function objMaterial(m?: ObjMaterial): Material;
/** Build a node tree (one child per OBJ object, one mesh per material). */
declare function objToNode(data: ObjData, materials?: Record<string, ObjMaterial>, textures?: Record<string, TexImageSource>): GlNode;
/** Fetch an OBJ (+ its MTL files and diffuse textures, relative to the OBJ URL) and build a node. */
declare function loadObj(url: string): Promise<GlNode & {
    extras: {
        obj: ObjData;
        materials: Record<string, ObjMaterial>;
    };
}>;
interface FormatObjApi {
    parseObj: typeof parseObj;
    parseMtl: typeof parseMtl;
    objMaterial: typeof objMaterial;
    objToNode: typeof objToNode;
    loadObj: typeof loadObj;
}
/** The module object for `use(formatObj)` (needs `gl`). */
declare const formatObj: RuntimeModule<FormatObjApi>;

export { formatObj, loadObj, objMaterial, objToNode, parseMtl, parseObj };
export type { FormatObjApi, ObjData, ObjGroup, ObjMaterial };
