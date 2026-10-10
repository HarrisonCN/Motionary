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
 * `motionary/runtime/physics` (10.7) — a small 2D rigid-body engine written
 * for Motionary (own implementation and API; no Matter.js / Box2D code):
 *
 * - bodies: circles, boxes and convex polygons (static, dynamic or
 *   kinematic), density → mass + moment of inertia, restitution, friction,
 *   sensors, collision groups / masks, sleeping;
 * - collisions: sort-and-sweep broad phase, separating-axis narrow phase
 *   with clipped contact manifolds (up to 2 points), sequential, accumulated and
 *   clamped impulses (normal + Coulomb friction) with a Baumgarte position bias;
 * - constraints: `distance` (rigid or a spring with `stiffness` /
 *   `damping`), `pin` (a body point to a world point — also the pointer
 *   drag constraint) and `weld`-like stiff distance pairs;
 * - a fixed time step (default 1/60 s) with an accumulator, so results are
 *   the same at any frame rate; `world.run()` drives it from the shared
 *   runtime ticker (pauses while the ticker sleeps).
 *
 * Pure maths — no DOM: safe in SSR and workers. Units are up to you (the
 * defaults assume pixels: gravity 980 px/s²).
 */

type Num$1 = number;
interface Vec2 {
    x: Num$1;
    y: Num$1;
}
type ShapeKind = 'circle' | 'box' | 'polygon';
interface BodyOptions {
    shape?: ShapeKind;
    x?: Num$1;
    y?: Num$1;
    angle?: Num$1;
    /** circle */
    radius?: Num$1;
    /** box */
    width?: Num$1;
    height?: Num$1;
    /** polygon: local vertices (any winding; made convex-ccw) */
    vertices?: [Num$1, Num$1][];
    /** 'dynamic' (default), 'static' (never moves) or 'kinematic' (moves by its velocity, ignores forces / collisions). */
    type?: 'dynamic' | 'static' | 'kinematic';
    /** Mass per unit area (default 0.001 → a 40 px box weighs 1.6). */
    density?: Num$1;
    /** Overrides density. */
    mass?: Num$1;
    restitution?: Num$1;
    friction?: Num$1;
    vx?: Num$1;
    vy?: Num$1;
    angularVelocity?: Num$1;
    /** Linear / angular damping per second (0–1). */
    damping?: Num$1;
    angularDamping?: Num$1;
    /** Collides with nothing, reports overlaps only. */
    sensor?: boolean;
    /** Collision filtering: bodies collide when (a.category & b.mask) && (b.category & a.mask). */
    category?: Num$1;
    mask?: Num$1;
    /** No rotation (infinite inertia). */
    fixedRotation?: boolean;
    label?: string;
    /** Anything (e.g. a fill colour for your renderer). */
    data?: unknown;
}
declare class Body {
    readonly id: number;
    label: string;
    shape: ShapeKind;
    type: 'dynamic' | 'static' | 'kinematic';
    position: Vec2;
    velocity: Vec2;
    angle: Num$1;
    angularVelocity: Num$1;
    force: Vec2;
    torque: number;
    radius: number;
    /** Local convex vertices (counter-clockwise) for boxes / polygons. */
    verts: Vec2[];
    normals: Vec2[];
    mass: number;
    invMass: number;
    inertia: number;
    invInertia: number;
    restitution: Num$1;
    friction: Num$1;
    damping: Num$1;
    angularDamping: Num$1;
    sensor: boolean;
    category: Num$1;
    mask: Num$1;
    sleeping: boolean;
    sleepTime: number;
    data: unknown;
    /** Bounding box, refreshed every step. */
    aabb: {
        minX: number;
        minY: number;
        maxX: number;
        maxY: number;
    };
    private wv;
    private wvAngle;
    private wvPos;
    constructor(o?: BodyOptions);
    get isStatic(): boolean;
    /** Vertices in world space (cached per pose). */
    worldVerts(): Vec2[];
    worldNormal(i: Num$1): Vec2;
    updateAabb(): void;
    applyImpulse(j: Vec2, at?: Vec2): void;
    applyForce(f: Vec2, at?: Vec2): void;
    wake(): void;
    /** Is the world point inside this body? */
    contains(x: Num$1, y: Num$1): boolean;
}
interface Contact {
    point: Vec2;
    depth: Num$1;
}
interface Manifold {
    a: Body;
    b: Body;
    normal: Vec2;
    contacts: Contact[];
}
interface ConstraintOptions {
    type: 'distance' | 'pin';
    a: Body;
    /** distance: the other body; pin: omitted. */
    b?: Body;
    /** Anchor on a / b in body-local coordinates (default the centre). */
    anchorA?: [Num$1, Num$1];
    anchorB?: [Num$1, Num$1];
    /** pin: the world point. */
    point?: [Num$1, Num$1];
    /** Rest length (default: the current distance). */
    length?: Num$1;
    /** 1 = rigid; < 1 = spring (fraction of the error corrected per step). */
    stiffness?: Num$1;
    /** Spring damping (0–1). */
    damping?: Num$1;
    label?: string;
}
declare class Constraint {
    type: 'distance' | 'pin';
    a: Body;
    b: Body | null;
    anchorA: Vec2;
    anchorB: Vec2;
    point: Vec2;
    length: Num$1;
    stiffness: Num$1;
    damping: Num$1;
    label: string;
    constructor(o: ConstraintOptions);
    worldA(): Vec2;
    worldB(): Vec2;
    /** One velocity iteration (impulse along the constraint axis, with a position bias). */
    solve(h: Num$1): void;
}
interface WorldOptions {
    gravity?: [Num$1, Num$1];
    /** Velocity iterations per step (default 10). */
    iterations?: Num$1;
    /** Fixed step in seconds (default 1/60). */
    step?: Num$1;
    /** Let resting bodies sleep (default true). */
    sleeping?: boolean;
}
type CollisionListener = (m: Manifold) => void;
declare class World {
    gravity: Vec2;
    iterations: Num$1;
    fixedStep: Num$1;
    sleeping: boolean;
    bodies: Body[];
    constraints: Constraint[];
    /** Manifolds of the last step (incl. sensor overlaps, which have no response). */
    contacts: Manifold[];
    time: number;
    steps: number;
    private acc;
    private warm;
    private listeners;
    private stop;
    constructor(o?: WorldOptions);
    add<T extends Body | Constraint>(...items: T[]): T;
    body(o: BodyOptions): Body;
    constraint(o: ConstraintOptions): Constraint;
    remove(...items: (Body | Constraint)[]): void;
    clear(): void;
    /** Static walls around a w × h box (thickness t outside it). */
    bounds(w: Num$1, h: Num$1, t?: number, o?: {
        top?: boolean;
    }): Body[];
    onCollision(fn: CollisionListener): () => void;
    /** Bodies under a world point (topmost = last added first). */
    query(x: Num$1, y: Num$1): Body[];
    /** Advance by `seconds` of real time in fixed steps (max 8 steps per call). */
    update(seconds: Num$1): Num$1;
    /** One fixed step of h seconds. */
    step(h?: Num$1): void;
    /** Drive the world from the shared runtime ticker (needs the core). Returns a stopper. */
    run(): () => void;
    get running(): boolean;
    /** Total kinetic energy (handy for tests / "settled" checks). */
    energy(): Num$1;
}

/**
 * `motionary/runtime/format-scene` (10.7) — the versioned scene format
 * `motionary-scene@1`: a JSON description of a 2D physics scene (world,
 * named materials, bodies, constraints, per-body style) that
 * `<usa-physics-playground>` and your own code can load, validate,
 * migrate and save.
 *
 * ```json
 * { "format": "motionary-scene@1",
 *   "world": { "width": 600, "height": 360, "gravity": [0, 980], "walls": true },
 *   "materials": { "rubber": { "restitution": 0.8, "friction": 0.6, "density": 0.001 } },
 *   "bodies": [
 *     { "id": "ball", "shape": "circle", "radius": 20, "position": [120, 40], "material": "rubber", "style": { "fill": "#f472b6" } },
 *     { "id": "floor-plank", "shape": "box", "size": [300, 16], "position": [300, 300], "angle": 0.1, "static": true }
 *   ],
 *   "constraints": [ { "type": "distance", "a": "ball", "b": "floor-plank", "length": 120, "stiffness": 0.3 } ] }
 * ```
 *
 * - `validateScene(json)` lists problems (never throws);
 * - `migrateScene(json)` upgrades older shapes (an unversioned scene, the
 *   `motionary-scene@0` draft) to `@1` and reports what it changed;
 * - `parseScene(json)` = migrate + validate, throws on errors;
 * - `sceneToWorld(scene)` builds a `motionary/runtime/physics` world
 *   (bodies by id); `worldToScene(world)` saves one back.
 *
 * Needs `motionary/runtime/physics` registered for `sceneToWorld` /
 * `worldToScene`; validation and migration are pure.
 */

type Num = number;
declare const SCENE_FORMAT = "motionary-scene@1";
interface SceneMaterial {
    restitution?: Num;
    friction?: Num;
    density?: Num;
}
interface SceneBody {
    id: string;
    shape: 'circle' | 'box' | 'polygon';
    position: [Num, Num];
    angle?: Num;
    radius?: Num;
    size?: [Num, Num];
    vertices?: [Num, Num][];
    static?: boolean;
    kinematic?: boolean;
    material?: string;
    restitution?: Num;
    friction?: Num;
    density?: Num;
    velocity?: [Num, Num];
    angularVelocity?: Num;
    sensor?: boolean;
    style?: {
        fill?: string;
        stroke?: string;
        label?: string;
    };
}
interface SceneConstraint {
    type: 'distance' | 'pin';
    a: string;
    b?: string;
    point?: [Num, Num];
    anchorA?: [Num, Num];
    anchorB?: [Num, Num];
    length?: Num;
    stiffness?: Num;
    damping?: Num;
}
interface Scene {
    format: typeof SCENE_FORMAT;
    name?: string;
    world: {
        width: Num;
        height: Num;
        gravity?: [Num, Num];
        walls?: boolean | {
            top?: boolean;
        };
        iterations?: Num;
    };
    materials?: Record<string, SceneMaterial>;
    bodies: SceneBody[];
    constraints?: SceneConstraint[];
}
/** Upgrade older scene shapes to `motionary-scene@1`. Returns the scene and what changed. */
declare function migrateScene(input: unknown): {
    scene: any;
    changes: string[];
};
/** Problems in a `motionary-scene@1` document (after migration). Never throws. */
declare function validateScene(input: unknown): string[];
/** Migrate + validate; throws one error listing every problem. */
declare function parseScene(input: unknown): Scene;
/** Build a physics world from a scene (needs `use(physics)`). */
declare function sceneToWorld(input: Scene | unknown): {
    world: World;
    bodies: Record<string, Body>;
    scene: Scene;
};
/** Save the current state of a world as a scene (walls made by `bounds()` are left out; `w` / `h` give the world size). */
declare function worldToScene(world: World, o?: {
    width: Num;
    height: Num;
    name?: string;
    walls?: boolean;
}): Scene;
interface FormatSceneApi {
    SCENE_FORMAT: typeof SCENE_FORMAT;
    migrateScene: typeof migrateScene;
    validateScene: typeof validateScene;
    parseScene: typeof parseScene;
    sceneToWorld: typeof sceneToWorld;
    worldToScene: typeof worldToScene;
}
/** The module object for `use(formatScene)` (needs `physics`). */
declare const formatScene: RuntimeModule<FormatSceneApi>;

export { SCENE_FORMAT, formatScene, migrateScene, parseScene, sceneToWorld, validateScene, worldToScene };
export type { FormatSceneApi, Scene, SceneBody, SceneConstraint, SceneMaterial };
