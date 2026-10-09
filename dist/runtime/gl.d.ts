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
declare const mat4: {
    identity: () => Mat4;
    multiply(a: Mat4, b: Mat4, out?: Mat4): Mat4;
    perspective(fovy: number, aspect: number, near: number, far: number): Mat4;
    lookAt(eye: Vec3, target: Vec3, up?: Vec3): Mat4;
    /** Translation · rotation (quaternion) · scale. */
    compose(t: Vec3, q: Quat, s: Vec3): Mat4;
    invert(m: Mat4): Mat4 | null;
    /** Inverse-transpose of the upper 3×3 (normal matrix), as a mat3. */
    normal(m: Mat4): Float32Array;
    transformPoint(m: Mat4, p: Vec3): Vec3;
};
/** Quaternion from Euler angles (radians, XYZ order). */
declare function quatFromEuler(x: number, y: number, z: number): Quat;
/** Hamilton product a·b. */
declare function quatMultiply(a: Quat, b: Quat): Quat;
/** Spherical interpolation. */
declare function quatSlerp(a: Quat, b: Quat, t: number): Quat;
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
/** Axis-aligned box centred on the origin. */
declare function box(w?: number, h?: number, d?: number): Geometry;
/** XY plane facing +Z. */
declare function plane(w?: number, h?: number, sx?: number, sy?: number): Geometry;
/** UV sphere. */
declare function sphere(r?: number, ws?: number, hs?: number): Geometry;
/** Torus in the XY plane. */
declare function torus(R?: number, r?: number, rs?: number, ts?: number): Geometry;
/** Flat normals for a geometry without them (per triangle; un-indexes the mesh). */
declare function computeNormals(g: Geometry): Geometry;
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
declare function standardMaterial(o?: Partial<Material>): Material;
declare function unlitMaterial(o?: Partial<Material>): Material;
/**
 * Custom fragment shader: `fragment` is GLSL ES 3.00 code defining
 * `vec4 shade()`; available: `v_pos` (world), `v_nrm`, `v_uv`, `u_time`,
 * `u_camPos`, `u_res` and your `uniforms` (float, vec2–4, sampler2D).
 */
declare function shaderMaterial(fragment: string, uniforms?: Material['uniforms'], o?: Partial<Material>): Material;
/** '#ff8800' / 'rgb(…)' / [r, g, b] → linear-ready [r, g, b, a] (sRGB values 0–1; the shader linearises). */
declare function color(c: string | number[], a?: number): [number, number, number, number];
declare function texture(source: GlTexture['source'], o?: Partial<GlTexture>): GlTexture;
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
/** World-space bounding box of a subtree's meshes. */
declare function bounds(node: GlNode): {
    min: Vec3;
    max: Vec3;
    center: Vec3;
    radius: number;
};
/** Point the camera at a subtree so it fills the view. */
declare function frameNode(camera: Camera, node: GlNode, padding?: number): void;
/** Seek a video from a 0–1 progress (scroll-scrubbed video). Pauses it. */
declare function scrubVideo(video: HTMLVideoElement, progress: number): void;
interface RendererOptions {
    alpha?: boolean;
    antialias?: boolean;
    /** Device-pixel-ratio cap (default 2). */
    maxDpr?: number;
    preserveDrawingBuffer?: boolean;
}
interface Renderer {
    gl: WebGL2RenderingContext;
    canvas: HTMLCanvasElement | OffscreenCanvas;
    /** Match the canvas backing store to its CSS size × DPR (returns true when it changed). */
    resize(width?: number, height?: number): boolean;
    render(scene: Scene, camera: Camera, time?: number): void;
    /** Draw calls of the last frame. */
    readonly drawCalls: number;
    dispose(): void;
}
/** Create a WebGL2 renderer on a canvas (throws a clear error when WebGL2 is unavailable). */
declare function createRenderer(canvas: HTMLCanvasElement | OffscreenCanvas, o?: RendererOptions): Renderer;
interface OrbitOptions {
    autoRotate?: number;
    damping?: number;
    minDistance?: number;
    maxDistance?: number;
    zoom?: boolean;
}
/** Drag to orbit, wheel / pinch to zoom, arrow keys (when the element has focus). Call `update(dt)` per frame. */
declare function orbitControls(camera: Camera, el: HTMLElement, o?: OrbitOptions): {
    update(dt: number): boolean;
    dispose(): void;
    autoRotate: number;
};
interface GlApi {
    mat4: typeof mat4;
    quatFromEuler: typeof quatFromEuler;
    quatMultiply: typeof quatMultiply;
    quatSlerp: typeof quatSlerp;
    box: typeof box;
    plane: typeof plane;
    sphere: typeof sphere;
    torus: typeof torus;
    computeNormals: typeof computeNormals;
    standardMaterial: typeof standardMaterial;
    unlitMaterial: typeof unlitMaterial;
    shaderMaterial: typeof shaderMaterial;
    color: typeof color;
    texture: typeof texture;
    GlNode: typeof GlNode;
    Camera: typeof Camera;
    Scene: typeof Scene;
    bounds: typeof bounds;
    frameNode: typeof frameNode;
    scrubVideo: typeof scrubVideo;
    createRenderer: typeof createRenderer;
    orbitControls: typeof orbitControls;
}
/** The module object for `use(gl)`. */
declare const gl: RuntimeModule<GlApi>;

export { Camera, GlNode, Scene, bounds, box, color, computeNormals, createRenderer, frameNode, gl, mat4, orbitControls, plane, quatFromEuler, quatMultiply, quatSlerp, scrubVideo, shaderMaterial, sphere, standardMaterial, texture, torus, unlitMaterial };
export type { Geometry, GlApi, GlTexture, Light, Mat4, Material, Mesh, OrbitOptions, Quat, Renderer, RendererOptions, Vec3 };
