/**
 * Members shared by every `<usa-*>` element. Attribute helpers, a cleanup
 * bag that is emptied on disconnect, and motion helpers that degrade to the
 * final state without WAAPI or under reduced motion.
 */
interface UsaElement extends HTMLElement {
    /** `true` while reduced motion applies to this element. */
    readonly reduced: boolean;
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
declare class Camera extends GlNode {
    fov: number;
    near: number;
    far: number;
    aspect: number;
    target: Vec3;
    up: Vec3;
    constructor(o?: {
        fov?: number;
        near?: number;
        far?: number;
        position?: Vec3;
        target?: Vec3;
    });
    view(): Mat4;
    projection(): Mat4;
}
interface Light {
    type: 'directional' | 'point';
    /** Direction the light travels (directional) or position (point). */
    vector: Vec3;
    color: Vec3;
    intensity: number;
}
declare class Scene {
    root: GlNode;
    ambient: Vec3;
    lights: Light[];
    /** Clear colour (sRGB, 0–1) or null for transparent. */
    background: [number, number, number, number] | null;
    exposure: number;
    add(...n: GlNode[]): this;
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

/**
 * `<usa-gl-scene src="model.glb" controls auto-rotate></usa-gl-scene>` (10.5)
 * — a WebGL2 3D viewer on **`motionary/runtime/gl`** (requires `use(gl)`;
 * `.gltf` / `.glb` models also need `motionary/runtime/format-gltf`, `.obj`
 * needs `motionary/runtime/format-obj`). Without `src` it shows a built-in
 * `shape` (torus · box · sphere · plane). `color`, `metallic`, `roughness`,
 * `background`, `exposure`, `controls` (drag / wheel / pinch / arrow keys),
 * `auto-rotate` (deg/s; off under reduced motion), `video` (a video URL
 * mapped onto the shape as a texture; `video-scrub` ties its time to the
 * element's scroll position instead of playing), `label` (accessible name).
 * 10.8: `animation` (clip name or index; empty = the first) plays a glTF
 * animation with skinning and morph targets (requires
 * `motionary/runtime/gltf-anim`), `animation-speed`; reduced motion shows
 * the first pose. Renders only while visible. `scene`, `camera`, `root`,
 * `animator`, `reload()`; `usa:load` { meshes, animations }, `usa:error`.
 * (The 10.5 alias `<usa-three-scene>` was removed in 11.0.)
 */
interface UsaGlSceneElement extends UsaElement {
    readonly scene: Scene | null;
    readonly camera: Camera | null;
    readonly root: GlNode | null;
    readonly animator: GltfAnimator | null;
    reload(): Promise<void>;
}

/**
 * `<usa-gl-model src="model.glb" controls></usa-gl-model>` (10.9) —
 * `<usa-gl-scene>` for **compressed glTF**: Draco meshes
 * (`KHR_draco_mesh_compression`) and KTX2 / Basis Universal textures
 * (`KHR_texture_basisu`) are decoded by the **official decoders** through
 * `motionary/runtime/gltf-decoders` (requires `use(gl, formatGltf,
 * gltfDecoders)` and `provideGltfDecoder('draco', () => import('draco3d'))`
 * / `provideGltfDecoder('ktx2', …)`; only the decoder a file needs is
 * fetched). Same attributes, methods and events as `<usa-gl-scene>`
 * (incl. `animation`, which also needs `motionary/runtime/gltf-anim`).
 * Its own entry point: `motionary/components/gl-model`.
 */
type UsaGlModelElement = UsaGlSceneElement;
declare function defineGlModel(tag?: string): CustomElementConstructor | undefined;
declare global {
    interface HTMLElementTagNameMap {
        'usa-gl-model': UsaGlModelElement;
    }
}

export { defineGlModel };
export type { UsaGlModelElement };
