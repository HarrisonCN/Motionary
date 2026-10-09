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
 * `motionary/runtime/gltf-anim` (10.8) — glTF 2.0 animation, skinning and
 * morph targets for models loaded by `motionary/runtime/format-gltf`
 * (own implementation; requires `use(gl, formatGltf, gltfAnim)`).
 *
 * - animation channels on node `translation` / `rotation` / `scale` /
 *   `weights` with `LINEAR` (quaternions slerped), `STEP` and
 *   `CUBICSPLINE` (Hermite with in / out tangents) samplers;
 * - morph targets (POSITION + NORMAL deltas) with mesh default weights,
 *   node weights and animated weights;
 * - skins: joint hierarchy, inverse bind matrices, 4 joints / vertex
 *   (JOINTS_0 / WEIGHTS_0), skinned on the CPU and re-uploaded each frame
 *   (`geometry.version`), so it works with every runtime/gl material;
 * - `gltfAnimator(model)` plays a clip (by name or index) with loop / speed
 *   / seek, `update(dt)` from your loop or `play()` on the shared ticker.
 *
 * Sampling and deformation are pure (SSR / workers / tests).
 */

type Num = number;
type ChannelPath = 'translation' | 'rotation' | 'scale' | 'weights';
type Interpolation = 'LINEAR' | 'STEP' | 'CUBICSPLINE';
interface GltfChannel {
    node: GlNode;
    path: ChannelPath;
    interpolation: Interpolation;
    times: Float32Array;
    values: Float32Array;
    /** Components per key (3, 4 or the morph target count). */
    size: Num;
}
interface GltfClip {
    name: string;
    duration: Num;
    channels: GltfChannel[];
}
/** Morph / skin source data kept on a geometry by format-gltf (10.8). */
interface DeformSource {
    positions: Float32Array;
    normals?: Float32Array;
    joints?: Float32Array;
    weights?: Float32Array;
    targets?: {
        positions?: Float32Array;
        normals?: Float32Array;
    }[];
}
/** The animation clips of a loaded model. */
declare function gltfClips(root: GlNode): GltfClip[];
/** Value of a channel at time `t` (seconds; clamped to the key range). */
declare function sampleChannel(ch: GltfChannel, t: Num): Num[];
/** Pose the model at time `t` of a clip (sets node TRS and morph weights). */
declare function applyClip(clip: GltfClip, t: Num): void;
/**
 * Apply morph weights and skins to every deformable mesh of the model
 * (call after posing; updates world matrices). Returns how many meshes changed.
 */
declare function deformModel(root: GlNode): Num;
/** Morph + skin one geometry from its source data (pure). */
declare function deformGeometry(g: Geometry, src: DeformSource, weights: Num[], joints: Mat4[] | null): void;
interface GltfAnimatorOptions {
    /** Clip name or index (default 0). */
    clip?: string | Num;
    loop?: boolean;
    speed?: Num;
}
interface GltfAnimator {
    readonly clips: GltfClip[];
    readonly clip: GltfClip | null;
    time: Num;
    speed: Num;
    loop: boolean;
    readonly playing: boolean;
    /** Switch clip (name or index); keeps playing state. */
    use(clip: string | Num): void;
    seek(t: Num): void;
    /** Advance by `dt` seconds and pose + deform. */
    update(dt: Num): void;
    /** Run on the shared ticker. */
    play(): void;
    pause(): void;
    dispose(): void;
}
/** A clip player for a loaded model. */
declare function gltfAnimator(root: GlNode, o?: GltfAnimatorOptions): GltfAnimator;
interface GltfAnimApi {
    gltfClips: typeof gltfClips;
    sampleChannel: typeof sampleChannel;
    applyClip: typeof applyClip;
    deformModel: typeof deformModel;
    deformGeometry: typeof deformGeometry;
    gltfAnimator: typeof gltfAnimator;
}
declare const gltfAnim: RuntimeModule<GltfAnimApi>;

export { applyClip, deformGeometry, deformModel, gltfAnim, gltfAnimator, gltfClips, sampleChannel };
export type { ChannelPath, DeformSource, GltfAnimApi, GltfAnimator, GltfAnimatorOptions, GltfChannel, GltfClip, Interpolation };
