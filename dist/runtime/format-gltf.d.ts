/** A runtime module: `{ id, version, api }`, registered with `use()`. */
interface RuntimeModule<A = unknown> {
    /** Module id: 'core', 'format-css', 'scroll', … (import path `motionary/runtime/<id>`). */
    id: string;
    version: string;
    /** Other modules this one needs (registered first by `use()` callers). */
    requires?: string[];
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
 * `motionary/runtime/format-gltf` (10.5) — glTF 2.0 / GLB loader for
 * `motionary/runtime/gl` (own implementation):
 *
 * - `.gltf` (JSON + external or `data:` buffers / images) and `.glb`
 *   (binary container: JSON + BIN chunks);
 * - scenes and the node hierarchy (TRS or `matrix`), meshes with several
 *   primitives (POSITION, NORMAL, TEXCOORD_0, indices; any component type,
 *   normalised integers, interleaved `byteStride`; modes points, lines,
 *   triangles, strips, fans);
 * - PBR metallic-roughness materials (base colour factor + texture,
 *   metallic / roughness factors, emissive factor, alpha modes, double-sided);
 *   images from buffer views or URIs (decoded with `createImageBitmap`);
 * - files that *require* an extension we do not implement (e.g. Draco /
 *   KTX2 compression) fail with a clear error naming it.
 *
 * 10.8: sparse accessors; skin (JOINTS_0 / WEIGHTS_0) and morph-target data
 * is kept on each geometry (`geometry.deform`) and played by
 * `motionary/runtime/gltf-anim` (animations, skinning, morph weights). `parseGlb()` /
 * `gltfToNode()` with an `images` override are pure (SSR / workers).
 */

interface GltfJson {
    asset: {
        version: string;
        generator?: string;
    };
    scene?: number;
    scenes?: {
        nodes?: number[];
        name?: string;
    }[];
    nodes?: {
        name?: string;
        children?: number[];
        mesh?: number;
        matrix?: number[];
        translation?: number[];
        rotation?: number[];
        scale?: number[];
        skin?: number;
        camera?: number;
        weights?: number[];
    }[];
    meshes?: {
        name?: string;
        primitives: {
            attributes: Record<string, number>;
            indices?: number;
            material?: number;
            mode?: number;
            targets?: Record<string, number>[];
        }[];
        weights?: number[];
    }[];
    accessors?: {
        bufferView?: number;
        byteOffset?: number;
        componentType: number;
        normalized?: boolean;
        count: number;
        type: string;
        min?: number[];
        max?: number[];
        sparse?: {
            count: number;
            indices: {
                bufferView: number;
                byteOffset?: number;
                componentType: number;
            };
            values: {
                bufferView: number;
                byteOffset?: number;
            };
        };
    }[];
    bufferViews?: {
        buffer: number;
        byteOffset?: number;
        byteLength: number;
        byteStride?: number;
    }[];
    buffers?: {
        uri?: string;
        byteLength: number;
    }[];
    materials?: {
        name?: string;
        pbrMetallicRoughness?: {
            baseColorFactor?: number[];
            baseColorTexture?: {
                index: number;
            };
            metallicFactor?: number;
            roughnessFactor?: number;
        };
        emissiveFactor?: number[];
        alphaMode?: string;
        doubleSided?: boolean;
        extensions?: Record<string, any>;
    }[];
    textures?: {
        source?: number;
        sampler?: number;
    }[];
    images?: {
        uri?: string;
        bufferView?: number;
        mimeType?: string;
    }[];
    extensionsUsed?: string[];
    extensionsRequired?: string[];
    animations?: unknown[];
    skins?: unknown[];
}
/** Extensions this loader understands (others that a file *requires* make it fail clearly). */
declare const SUPPORTED_EXTENSIONS: string[];
/** Split a GLB container into its JSON and BIN chunk (pure). */
declare function parseGlb(input: ArrayBuffer | Uint8Array): {
    json: GltfJson;
    bin: Uint8Array | null;
};
/** Read an accessor into a flat typed array (floats are de-interleaved; normalised ints become floats). */
declare function readAccessor(json: GltfJson, buffers: Uint8Array[], index: number, asFloat?: boolean): Float32Array | Uint16Array | Uint32Array | Uint8Array;
interface GltfImages {
    /** Decoded images by glTF image index (pass your own for SSR / tests). */
    [index: number]: TexImageSource | undefined;
}
/** Build a runtime/gl node tree from parsed glTF (pure, given buffers and decoded images). */
declare function gltfToNode(json: GltfJson, buffers: Uint8Array[], images?: GltfImages, sceneIndex?: number): GlNode;
/** Load a `.gltf` / `.glb` (URL or bytes) with its buffers and images and build a node tree. */
declare function loadGltf(src: string | ArrayBuffer | Uint8Array, o?: {
    baseUrl?: string;
    scene?: number;
    prepare?: (json: GltfJson, buffers: Uint8Array[]) => Promise<{
        json: GltfJson;
        buffers: Uint8Array[];
        images: GltfImages;
    }>;
}): Promise<GlNode>;
interface FormatGltfApi {
    parseGlb: typeof parseGlb;
    readAccessor: typeof readAccessor;
    gltfToNode: typeof gltfToNode;
    loadGltf: typeof loadGltf;
    SUPPORTED_EXTENSIONS: typeof SUPPORTED_EXTENSIONS;
}
/** The module object for `use(formatGltf)` (needs `gl`). */
declare const formatGltf: RuntimeModule<FormatGltfApi>;

export { SUPPORTED_EXTENSIONS, formatGltf, gltfToNode, loadGltf, parseGlb, readAccessor };
export type { FormatGltfApi, GltfImages, GltfJson };
