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

type Num = number;
interface Vec2 {
    x: Num;
    y: Num;
}
type ShapeKind = 'circle' | 'box' | 'polygon';
interface BodyOptions {
    shape?: ShapeKind;
    x?: Num;
    y?: Num;
    angle?: Num;
    /** circle */
    radius?: Num;
    /** box */
    width?: Num;
    height?: Num;
    /** polygon: local vertices (any winding; made convex-ccw) */
    vertices?: [Num, Num][];
    /** 'dynamic' (default), 'static' (never moves) or 'kinematic' (moves by its velocity, ignores forces / collisions). */
    type?: 'dynamic' | 'static' | 'kinematic';
    /** Mass per unit area (default 0.001 → a 40 px box weighs 1.6). */
    density?: Num;
    /** Overrides density. */
    mass?: Num;
    restitution?: Num;
    friction?: Num;
    vx?: Num;
    vy?: Num;
    angularVelocity?: Num;
    /** Linear / angular damping per second (0–1). */
    damping?: Num;
    angularDamping?: Num;
    /** Collides with nothing, reports overlaps only. */
    sensor?: boolean;
    /** Collision filtering: bodies collide when (a.category & b.mask) && (b.category & a.mask). */
    category?: Num;
    mask?: Num;
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
    angle: Num;
    angularVelocity: Num;
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
    restitution: Num;
    friction: Num;
    damping: Num;
    angularDamping: Num;
    sensor: boolean;
    category: Num;
    mask: Num;
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
    worldNormal(i: Num): Vec2;
    updateAabb(): void;
    applyImpulse(j: Vec2, at?: Vec2): void;
    applyForce(f: Vec2, at?: Vec2): void;
    wake(): void;
    /** Is the world point inside this body? */
    contains(x: Num, y: Num): boolean;
}
interface Contact {
    point: Vec2;
    depth: Num;
}
interface Manifold {
    a: Body;
    b: Body;
    normal: Vec2;
    contacts: Contact[];
}
/** Contact manifold between two bodies (normal points from a to b), or null. */
declare function collide(a: Body, b: Body): Manifold | null;
interface ConstraintOptions {
    type: 'distance' | 'pin';
    a: Body;
    /** distance: the other body; pin: omitted. */
    b?: Body;
    /** Anchor on a / b in body-local coordinates (default the centre). */
    anchorA?: [Num, Num];
    anchorB?: [Num, Num];
    /** pin: the world point. */
    point?: [Num, Num];
    /** Rest length (default: the current distance). */
    length?: Num;
    /** 1 = rigid; < 1 = spring (fraction of the error corrected per step). */
    stiffness?: Num;
    /** Spring damping (0–1). */
    damping?: Num;
    label?: string;
}
declare class Constraint {
    type: 'distance' | 'pin';
    a: Body;
    b: Body | null;
    anchorA: Vec2;
    anchorB: Vec2;
    point: Vec2;
    length: Num;
    stiffness: Num;
    damping: Num;
    label: string;
    constructor(o: ConstraintOptions);
    worldA(): Vec2;
    worldB(): Vec2;
    /** One velocity iteration (impulse along the constraint axis, with a position bias). */
    solve(h: Num): void;
}
interface WorldOptions {
    gravity?: [Num, Num];
    /** Velocity iterations per step (default 10). */
    iterations?: Num;
    /** Fixed step in seconds (default 1/60). */
    step?: Num;
    /** Let resting bodies sleep (default true). */
    sleeping?: boolean;
}
type CollisionListener = (m: Manifold) => void;
declare class World {
    gravity: Vec2;
    iterations: Num;
    fixedStep: Num;
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
    bounds(w: Num, h: Num, t?: number, o?: {
        top?: boolean;
    }): Body[];
    onCollision(fn: CollisionListener): () => void;
    /** Bodies under a world point (topmost = last added first). */
    query(x: Num, y: Num): Body[];
    /** Advance by `seconds` of real time in fixed steps (max 8 steps per call). */
    update(seconds: Num): Num;
    /** One fixed step of h seconds. */
    step(h?: Num): void;
    /** Drive the world from the shared runtime ticker (needs the core). Returns a stopper. */
    run(): () => void;
    get running(): boolean;
    /** Total kinetic energy (handy for tests / "settled" checks). */
    energy(): Num;
}
/** A world (also registers nothing — pure). */
declare function createWorld(o?: WorldOptions): World;
/** Pointer dragging: a soft pin from a body point to a moving world point. */
declare function dragConstraint(world: World, body: Body, x: Num, y: Num, stiffness?: number): {
    move(x: Num, y: Num): void;
    release(): void;
    constraint: Constraint;
};
interface PhysicsApi {
    createWorld: typeof createWorld;
    World: typeof World;
    Body: typeof Body;
    Constraint: typeof Constraint;
    collide: typeof collide;
    dragConstraint: typeof dragConstraint;
}
/** The module object for `use(physics)`. */
declare const physics: RuntimeModule<PhysicsApi>;

export { Body, Constraint, World, collide, createWorld, dragConstraint, physics };
export type { BodyOptions, CollisionListener, ConstraintOptions, Contact, Manifold, PhysicsApi, ShapeKind, Vec2, WorldOptions };
