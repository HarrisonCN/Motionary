import { R as RUNTIME_VERSION, r as requireModule } from '../chunks/registry-CMjteilk.js';

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
const v = (x = 0, y = 0) => ({ x, y });
const dot = (a, b) => a.x * b.x + a.y * b.y;
const cross = (a, b) => a.x * b.y - a.y * b.x;
const sub = (a, b) => v(a.x - b.x, a.y - b.y);
const add = (a, b) => v(a.x + b.x, a.y + b.y);
const mul = (a, s) => v(a.x * s, a.y * s);
const len = (a) => Math.hypot(a.x, a.y);
const crossSV = (s, a) => v(-s * a.y, s * a.x);
const rot = (a, c, s) => v(a.x * c - a.y * s, a.x * s + a.y * c);
let nextId = 1;
class Body {
    constructor(o = {}) {
        this.id = nextId++;
        this.force = v();
        this.torque = 0;
        this.radius = 0;
        /** Local convex vertices (counter-clockwise) for boxes / polygons. */
        this.verts = [];
        this.normals = [];
        this.mass = 0;
        this.invMass = 0;
        this.inertia = 0;
        this.invInertia = 0;
        this.sleeping = false;
        this.sleepTime = 0;
        /** Bounding box, refreshed every step. */
        this.aabb = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
        this.wv = [];
        this.wvAngle = NaN;
        this.wvPos = v(NaN, NaN);
        this.shape = o.shape || (o.vertices ? 'polygon' : o.radius != null && o.width == null ? 'circle' : 'box');
        this.type = o.type || 'dynamic';
        this.label = o.label || this.shape;
        this.position = v(o.x || 0, o.y || 0);
        this.velocity = v(o.vx || 0, o.vy || 0);
        this.angle = o.angle || 0;
        this.angularVelocity = o.angularVelocity || 0;
        this.restitution = o.restitution ?? 0.2;
        this.friction = o.friction ?? 0.4;
        this.damping = o.damping ?? 0;
        this.angularDamping = o.angularDamping ?? 0.01;
        this.sensor = !!o.sensor;
        this.category = o.category ?? 1;
        this.mask = o.mask ?? 0xffffffff;
        this.data = o.data;
        const density = o.density ?? 0.001;
        let area = 0, I = 0;
        if (this.shape === 'circle') {
            this.radius = o.radius ?? 20;
            area = Math.PI * this.radius ** 2;
            I = 0.5 * this.radius ** 2; // per unit mass
        }
        else {
            const pts = this.shape === 'box' ? boxVerts(o.width ?? 40, o.height ?? 40) : hull((o.vertices || []).map(([x, y]) => v(x, y)));
            if (pts.length < 3)
                throw new Error('[motionary] physics: a polygon needs at least 3 non-collinear vertices');
            // centre the polygon on its centroid
            const { c, a, i } = polyMass(pts);
            this.verts = pts.map((p) => sub(p, c));
            area = a;
            I = i;
            this.radius = Math.max(...this.verts.map(len));
            this.normals = this.verts.map((p, k) => {
                const q = this.verts[(k + 1) % this.verts.length];
                const e = sub(q, p);
                const n = v(e.y, -e.x);
                return mul(n, 1 / len(n));
            });
        }
        if (this.type === 'dynamic') {
            this.mass = o.mass ?? density * area;
            this.invMass = this.mass > 0 ? 1 / this.mass : 0;
            this.inertia = o.fixedRotation ? Infinity : this.mass * I;
            this.invInertia = o.fixedRotation || !this.inertia ? 0 : 1 / this.inertia;
        }
    }
    get isStatic() {
        return this.type === 'static';
    }
    /** Vertices in world space (cached per pose). */
    worldVerts() {
        if (this.wvAngle !== this.angle || this.wvPos.x !== this.position.x || this.wvPos.y !== this.position.y) {
            const c = Math.cos(this.angle), s = Math.sin(this.angle);
            this.wv = this.verts.map((p) => add(rot(p, c, s), this.position));
            this.wvAngle = this.angle;
            this.wvPos = v(this.position.x, this.position.y);
        }
        return this.wv;
    }
    worldNormal(i) {
        return rot(this.normals[i], Math.cos(this.angle), Math.sin(this.angle));
    }
    updateAabb() {
        if (this.shape === 'circle') {
            const r = this.radius, p = this.position;
            this.aabb = { minX: p.x - r, minY: p.y - r, maxX: p.x + r, maxY: p.y + r };
            return;
        }
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const p of this.worldVerts()) {
            if (p.x < minX)
                minX = p.x;
            if (p.y < minY)
                minY = p.y;
            if (p.x > maxX)
                maxX = p.x;
            if (p.y > maxY)
                maxY = p.y;
        }
        this.aabb = { minX, minY, maxX, maxY };
    }
    applyImpulse(j, at) {
        if (this.type !== 'dynamic')
            return;
        this.wake();
        this.velocity = add(this.velocity, mul(j, this.invMass));
        if (at)
            this.angularVelocity += cross(sub(at, this.position), j) * this.invInertia;
    }
    applyForce(f, at) {
        if (this.type !== 'dynamic')
            return;
        this.wake();
        this.force = add(this.force, f);
        if (at)
            this.torque += cross(sub(at, this.position), f);
    }
    wake() {
        this.sleeping = false;
        this.sleepTime = 0;
    }
    /** Is the world point inside this body? */
    contains(x, y) {
        const p = v(x, y);
        if (this.shape === 'circle')
            return len(sub(p, this.position)) <= this.radius;
        const w = this.worldVerts();
        for (let i = 0; i < w.length; i++)
            if (dot(this.worldNormal(i), sub(p, w[i])) > 0)
                return false;
        return true;
    }
}
function boxVerts(w, h) {
    return [v(-w / 2, -h / 2), v(w / 2, -h / 2), v(w / 2, h / 2), v(-w / 2, h / 2)];
}
/** Convex hull (monotone chain), counter-clockwise in a y-down screen space = clockwise maths; we keep "outward normals" consistent. */
function hull(pts) {
    const p = pts.slice().sort((a, b) => a.x - b.x || a.y - b.y);
    if (p.length < 3)
        return p;
    const lower = [], upper = [];
    const turn = (o, a, b) => cross(sub(a, o), sub(b, o));
    for (const q of p) {
        while (lower.length >= 2 && turn(lower[lower.length - 2], lower[lower.length - 1], q) <= 0)
            lower.pop();
        lower.push(q);
    }
    for (let i = p.length - 1; i >= 0; i--) {
        const q = p[i];
        while (upper.length >= 2 && turn(upper[upper.length - 2], upper[upper.length - 1], q) <= 0)
            upper.pop();
        upper.push(q);
    }
    return lower.slice(0, -1).concat(upper.slice(0, -1));
}
/** Area, centroid and polar moment per unit mass of a convex polygon. */
function polyMass(p) {
    let A = 0, cx = 0, cy = 0, I = 0;
    for (let k = 0; k < p.length; k++) {
        const a = p[k], b = p[(k + 1) % p.length];
        const cr = cross(a, b);
        A += cr;
        cx += (a.x + b.x) * cr;
        cy += (a.y + b.y) * cr;
        I += cr * (dot(a, a) + dot(a, b) + dot(b, b));
    }
    A /= 2;
    const c = v(cx / (6 * A), cy / (6 * A));
    const Io = I / 12; // about the origin, times density
    const iC = Io / A - dot(c, c); // per unit mass, about the centroid
    return { a: Math.abs(A), c, i: Math.abs(iC) };
}
// ------------------------------------------------------------------ narrow phase
const SPECULATIVE = 1;
/** Squared speed (px²/s², incl. the rim speed of rotation) under which a body may fall asleep. */
const SLEEP_MOTION = 36;
/** Inverse mass / inertia as the solver sees them: static, kinematic and sleeping bodies do not move. */
const iM = (b) => (b.type === 'dynamic' && !b.sleeping ? b.invMass : 0);
const iI = (b) => (b.type === 'dynamic' && !b.sleeping ? b.invInertia : 0);
const motion = (b) => dot(b.velocity, b.velocity) + (b.angularVelocity * b.radius) ** 2;
function circleCircle(a, b) {
    const d = sub(b.position, a.position), dist = len(d), r = a.radius + b.radius;
    if (dist >= r)
        return null;
    const n = dist > 1e-9 ? mul(d, 1 / dist) : v(0, 1);
    return { a, b, normal: n, contacts: [{ point: add(a.position, mul(n, a.radius - (r - dist) / 2)), depth: r - dist }] };
}
function polyCircle(p, c) {
    // normal from the polygon to the circle
    const w = p.worldVerts();
    let best = -Infinity, bi = 0;
    for (let i = 0; i < w.length; i++) {
        const s = dot(p.worldNormal(i), sub(c.position, w[i]));
        if (s > c.radius)
            return null;
        if (s > best)
            (best = s), (bi = i);
    }
    if (best < 1e-9) {
        // centre inside the polygon
        const n = p.worldNormal(bi);
        return { a: p, b: c, normal: n, contacts: [{ point: sub(c.position, mul(n, c.radius)), depth: c.radius - best }] };
    }
    // closest point on the polygon outline
    let cp = w[0], cd = Infinity;
    for (let i = 0; i < w.length; i++) {
        const a = w[i], b = w[(i + 1) % w.length], e = sub(b, a);
        const t = Math.max(0, Math.min(1, dot(sub(c.position, a), e) / dot(e, e)));
        const q = add(a, mul(e, t)), d = len(sub(c.position, q));
        if (d < cd)
            (cd = d), (cp = q);
    }
    if (cd >= c.radius)
        return null;
    const n = cd > 1e-9 ? mul(sub(c.position, cp), 1 / cd) : p.worldNormal(bi);
    return { a: p, b: c, normal: n, contacts: [{ point: cp, depth: c.radius - cd }] };
}
function maxSeparation(a, b) {
    const wa = a.worldVerts(), wb = b.worldVerts();
    let best = -Infinity, bi = 0;
    for (let i = 0; i < wa.length; i++) {
        const n = a.worldNormal(i);
        let m = Infinity;
        for (const q of wb)
            m = Math.min(m, dot(n, sub(q, wa[i])));
        if (m > best)
            (best = m), (bi = i);
    }
    return { s: best, i: bi };
}
function polyPoly(a, b) {
    const A = maxSeparation(a, b);
    if (A.s > 0)
        return null;
    const B = maxSeparation(b, a);
    if (B.s > 0)
        return null;
    let ref = a, inc = b, fi = A.i, flip = false;
    if (B.s > A.s * 0.95 + 0.01)
        (ref = b), (inc = a), (fi = B.i), (flip = true);
    const rw = ref.worldVerts(), iw = inc.worldVerts();
    const n = ref.worldNormal(fi);
    // incident edge: the one whose normal is most anti-parallel to n
    let ii = 0, md = Infinity;
    for (let i = 0; i < iw.length; i++) {
        const d = dot(inc.worldNormal(i), n);
        if (d < md)
            (md = d), (ii = i);
    }
    let pts = [iw[ii], iw[(ii + 1) % iw.length]];
    const r1 = rw[fi], r2 = rw[(fi + 1) % rw.length];
    const t = mul(sub(r2, r1), 1 / len(sub(r2, r1)));
    // clip against the side planes of the reference edge
    const clip = (ps, dir, off) => {
        const out = [];
        const d0 = dot(dir, ps[0]) - off, d1 = dot(dir, ps[1]) - off;
        if (d0 <= 0)
            out.push(ps[0]);
        if (d1 <= 0)
            out.push(ps[1]);
        if (d0 * d1 < 0)
            out.push(add(ps[0], mul(sub(ps[1], ps[0]), d0 / (d0 - d1))));
        return out;
    };
    pts = clip(pts, mul(t, -1), -dot(t, r1));
    if (pts.length < 2)
        return null;
    pts = clip(pts, t, dot(t, r2));
    if (pts.length < 2)
        return null;
    const contacts = [];
    for (const p of pts) {
        const sep = dot(n, sub(p, r1));
        // keep points that are just apart too (speculative): resting stacks keep two contacts instead of rocking on one
        if (sep <= SPECULATIVE)
            contacts.push({ point: p, depth: -sep });
    }
    if (!contacts.some((c) => c.depth >= 0))
        return null;
    return flip ? { a, b, normal: mul(n, -1), contacts } : { a, b, normal: n, contacts };
}
/** Contact manifold between two bodies (normal points from a to b), or null. */
function collide(a, b) {
    if (a.shape === 'circle' && b.shape === 'circle')
        return circleCircle(a, b);
    if (a.shape !== 'circle' && b.shape === 'circle')
        return polyCircle(a, b);
    if (a.shape === 'circle' && b.shape !== 'circle') {
        const m = polyCircle(b, a);
        return m && { a, b, normal: mul(m.normal, -1), contacts: m.contacts };
    }
    return polyPoly(a, b);
}
class Constraint {
    constructor(o) {
        this.type = o.type;
        this.a = o.a;
        this.b = o.b || null;
        this.anchorA = v(...(o.anchorA || [0, 0]));
        this.anchorB = v(...(o.anchorB || [0, 0]));
        this.point = v(...(o.point || [o.a.position.x, o.a.position.y]));
        this.stiffness = o.stiffness ?? 1;
        this.damping = o.damping ?? 0.1;
        this.label = o.label || o.type;
        this.length = o.length ?? len(sub(this.worldB(), this.worldA()));
    }
    worldA() {
        return add(this.a.position, rot(this.anchorA, Math.cos(this.a.angle), Math.sin(this.a.angle)));
    }
    worldB() {
        return this.b ? add(this.b.position, rot(this.anchorB, Math.cos(this.b.angle), Math.sin(this.b.angle))) : this.point;
    }
    /** One velocity iteration (impulse along the constraint axis, with a position bias). */
    solve(h) {
        const a = this.a, b = this.b;
        const pa = this.worldA(), pb = this.worldB();
        const d = sub(pb, pa), dist = len(d);
        if (dist < 1e-9 && this.length < 1e-9 && this.type === 'distance')
            return;
        const n = dist > 1e-9 ? mul(d, 1 / dist) : v(1, 0);
        const ra = sub(pa, a.position), rb = b ? sub(pb, b.position) : v();
        const va = add(a.velocity, crossSV(a.angularVelocity, ra));
        const vb = b ? add(b.velocity, crossSV(b.angularVelocity, rb)) : v();
        const vn = dot(sub(vb, va), n);
        const C = dist - this.length;
        const k = a.invMass + (b ? b.invMass : 0) + cross(ra, n) ** 2 * a.invInertia + (b ? cross(rb, n) ** 2 * b.invInertia : 0);
        if (k <= 0)
            return;
        const beta = this.stiffness >= 1 ? 0.2 : this.stiffness * 0.2;
        let lambda = -(vn * (this.stiffness >= 1 ? 1 : this.damping + this.stiffness) + (beta / h) * C) / k;
        if (this.stiffness < 1)
            lambda *= this.stiffness;
        const j = mul(n, lambda);
        a.applyImpulse(mul(j, -1), pa);
        b?.applyImpulse(j, pb);
    }
}
class World {
    constructor(o = {}) {
        this.bodies = [];
        this.constraints = [];
        /** Manifolds of the last step (incl. sensor overlaps, which have no response). */
        this.contacts = [];
        this.time = 0;
        this.steps = 0;
        this.acc = 0;
        this.warm = new Map();
        this.listeners = new Set();
        this.stop = null;
        this.gravity = v(...(o.gravity || [0, 980]));
        this.iterations = o.iterations ?? 10;
        this.fixedStep = o.step ?? 1 / 60;
        this.sleeping = o.sleeping ?? true;
    }
    add(...items) {
        for (const it of items)
            it instanceof Body ? this.bodies.push(it) : this.constraints.push(it);
        return items[0];
    }
    body(o) {
        return this.add(new Body(o));
    }
    constraint(o) {
        return this.add(new Constraint(o));
    }
    remove(...items) {
        for (const it of items) {
            if (it instanceof Body) {
                this.bodies = this.bodies.filter((b) => b !== it);
                this.constraints = this.constraints.filter((c) => c.a !== it && c.b !== it);
            }
            else
                this.constraints = this.constraints.filter((c) => c !== it);
        }
    }
    clear() {
        this.bodies = [];
        this.constraints = [];
        this.contacts = [];
    }
    /** Static walls around a w × h box (thickness t outside it). */
    bounds(w, h, t = 50, o = {}) {
        const walls = [
            new Body({ type: 'static', x: w / 2, y: h + t / 2, width: w + 2 * t, height: t, label: 'floor' }),
            new Body({ type: 'static', x: -t / 2, y: h / 2, width: t, height: h + 2 * t, label: 'wall-left' }),
            new Body({ type: 'static', x: w + t / 2, y: h / 2, width: t, height: h + 2 * t, label: 'wall-right' }),
        ];
        if (o.top !== false)
            walls.push(new Body({ type: 'static', x: w / 2, y: -t / 2, width: w + 2 * t, height: t, label: 'ceiling' }));
        for (const b of walls)
            this.add(b);
        return walls;
    }
    onCollision(fn) {
        this.listeners.add(fn);
        return () => this.listeners.delete(fn);
    }
    /** Bodies under a world point (topmost = last added first). */
    query(x, y) {
        return this.bodies.filter((b) => b.contains(x, y)).reverse();
    }
    /** Advance by `seconds` of real time in fixed steps (max 8 steps per call). */
    update(seconds) {
        this.acc = Math.min(this.acc + seconds, this.fixedStep * 8);
        let n = 0;
        while (this.acc >= this.fixedStep) {
            this.step(this.fixedStep);
            this.acc -= this.fixedStep;
            n++;
        }
        return n;
    }
    /** One fixed step of h seconds. */
    step(h = this.fixedStep) {
        const bodies = this.bodies;
        // integrate forces
        for (const b of bodies) {
            if (b.type !== 'dynamic' || b.sleeping)
                continue;
            b.velocity = add(b.velocity, mul(add(this.gravity, mul(b.force, b.invMass)), h));
            b.angularVelocity += b.torque * b.invInertia * h;
            if (b.damping)
                b.velocity = mul(b.velocity, Math.max(0, 1 - b.damping * h));
            if (b.angularDamping)
                b.angularVelocity *= Math.max(0, 1 - b.angularDamping * h);
        }
        // broad phase: sort and sweep on x
        for (const b of bodies)
            b.updateAabb();
        const sorted = bodies.slice().sort((p, q) => p.aabb.minX - q.aabb.minX);
        const manifolds = [];
        for (let i = 0; i < sorted.length; i++) {
            const a = sorted[i];
            for (let j = i + 1; j < sorted.length; j++) {
                const b = sorted[j];
                if (b.aabb.minX > a.aabb.maxX)
                    break;
                if (b.aabb.minY > a.aabb.maxY || b.aabb.maxY < a.aabb.minY)
                    continue;
                if (a.type !== 'dynamic' && b.type !== 'dynamic')
                    continue;
                if (!(a.category & b.mask) || !(b.category & a.mask))
                    continue;
                if ((a.sleeping || a.type !== 'dynamic') && (b.sleeping || b.type !== 'dynamic'))
                    continue;
                const m = a.id < b.id ? collide(a, b) : collide(b, a);
                if (!m)
                    continue;
                manifolds.push(m);
            }
        }
        this.contacts = manifolds;
        const solid = manifolds.filter((m) => !m.a.sensor && !m.b.sensor);
        for (const m of solid) {
            // wake a sleeper hit by a moving body
            // wake a sleeper only when something hits it with some speed (resting neighbours do not keep a pile awake)
            if (m.a.sleeping && !m.b.sleeping && m.b.type === 'dynamic' && motion(m.b) > SLEEP_MOTION * 4)
                m.a.wake();
            if (m.b.sleeping && !m.a.sleeping && m.a.type === 'dynamic' && motion(m.a) > SLEEP_MOTION * 4)
                m.b.wake();
        }
        // velocity iterations
        const key = (m) => m.a.id + ':' + m.b.id;
        for (const m of solid)
            prepare(m, h, this.warm.get(key(m)));
        for (let it = 0; it < this.iterations; it++) {
            for (const m of solid)
                resolve(m);
            for (const c of this.constraints)
                c.solve(h);
        }
        this.warm = new Map(solid.map((m) => [key(m), { pts: m.contacts.map((c) => c.point), pn: m.contacts.map((c) => c.pn), pt: m.contacts.map((c) => c.pt) }]));
        // integrate positions
        for (const b of bodies) {
            if (b.type === 'static' || b.sleeping)
                continue;
            b.position = add(b.position, mul(b.velocity, h));
            b.angle += b.angularVelocity * h;
            b.force = v();
            b.torque = 0;
        }
        // sleeping, per island (bodies linked by contacts / constraints sleep and wake together)
        if (this.sleeping) {
            const parent = new Map();
            const find = (x) => {
                let r = x;
                while (parent.get(r) !== r)
                    r = parent.get(r);
                parent.set(x, r);
                return r;
            };
            const dyn = (x) => !!x && x.type === 'dynamic';
            for (const b of bodies)
                if (dyn(b))
                    parent.set(b, b);
            const link = (x, y) => {
                if (dyn(x) && dyn(y))
                    parent.set(find(x), find(y));
            };
            for (const m of solid)
                link(m.a, m.b);
            for (const c of this.constraints)
                link(c.a, c.b);
            const dragged = new Set(this.constraints.filter((c) => c.label === 'drag').map((c) => c.a));
            for (const b of parent.keys()) {
                if (b.sleeping)
                    continue;
                if (motion(b) < SLEEP_MOTION && !dragged.has(b))
                    b.sleepTime += h;
                else
                    b.sleepTime = 0;
            }
            const islands = new Map();
            for (const b of parent.keys()) {
                const r = find(b);
                islands.set(r, [...(islands.get(r) || []), b]);
            }
            for (const isl of islands.values()) {
                if (isl.some((b) => !b.sleeping && b.sleepTime <= 0.6)) {
                    // anything awake and moving keeps (or makes) the whole island awake
                    if (isl.some((b) => b.sleeping) && isl.some((b) => !b.sleeping && b.sleepTime === 0))
                        for (const b of isl)
                            b.wake();
                    continue;
                }
                for (const b of isl) {
                    b.sleeping = true;
                    b.velocity = v();
                    b.angularVelocity = 0;
                }
            }
        }
        this.time += h;
        this.steps++;
        if (this.listeners.size)
            for (const m of manifolds)
                for (const fn of this.listeners)
                    fn(m);
    }
    /** Drive the world from the shared runtime ticker (needs the core). Returns a stopper. */
    run() {
        if (this.stop)
            return this.stop;
        const off = requireModule('core', 'motionary/runtime/physics').getTicker().add((_, dt) => this.update(Math.min(dt, 100) / 1000));
        this.stop = () => {
            off();
            this.stop = null;
        };
        return this.stop;
    }
    get running() {
        return !!this.stop;
    }
    /** Total kinetic energy (handy for tests / "settled" checks). */
    energy() {
        return this.bodies.reduce((e, b) => e + (b.type === 'dynamic' ? 0.5 * b.mass * dot(b.velocity, b.velocity) + 0.5 * (isFinite(b.inertia) ? b.inertia : 0) * b.angularVelocity ** 2 : 0), 0);
    }
}
function prepare(m, h, warm) {
    const { a, b, normal: n } = m;
    const t = v(n.y, -n.x);
    const e = Math.max(a.restitution, b.restitution);
    for (const c of m.contacts) {
        c.ra = sub(c.point, a.position);
        c.rb = sub(c.point, b.position);
        const kn = iM(a) + iM(b) + cross(c.ra, n) ** 2 * iI(a) + cross(c.rb, n) ** 2 * iI(b);
        const kt = iM(a) + iM(b) + cross(c.ra, t) ** 2 * iI(a) + cross(c.rb, t) ** 2 * iI(b);
        c.mn = kn > 0 ? 1 / kn : 0;
        c.mt = kt > 0 ? 1 / kt : 0;
        const rv = sub(add(b.velocity, crossSV(b.angularVelocity, c.rb)), add(a.velocity, crossSV(a.angularVelocity, c.ra)));
        const vn = dot(rv, n);
        // penetrating: push out (Baumgarte); just apart: allow closing the gap this step but not more
        c.bias = c.depth < 0 ? c.depth / h : Math.max((0.2 / h) * Math.max(0, c.depth - 0.25), vn < -150 ? -e * vn : 0);
        c.pn = 0;
        c.pt = 0;
    }
    // warm start: reuse last step's impulses for contacts that stayed put (stacks settle instead of creeping)
    if (warm) {
        m.contacts.forEach((c) => {
            if (c.depth < 0)
                return;
            // match by position (the clipper may list the two points in either order)
            let i = -1, best = 2;
            warm.pts.forEach((q, k) => {
                const d = len(sub(c.point, q));
                if (d < best)
                    (best = d), (i = k);
            });
            if (i < 0)
                return;
            c.pn = warm.pn[i];
            c.pt = warm.pt[i];
            applyPair(a, b, add(mul(n, c.pn), mul(t, c.pt)), c.ra, c.rb);
        });
    }
}
/** One velocity iteration with accumulated, clamped impulses: friction first (|friction| ≤ μ·normal), then the
 * normal impulses (≥ 0) — two-point manifolds are solved as one 2 × 2 block (a tiny LCP), which keeps boxes resting
 * on boxes from rocking from corner to corner. */
function resolve(m) {
    const { a, b, normal: n } = m;
    const t = v(n.y, -n.x);
    const mu = Math.sqrt(a.friction * b.friction);
    const cs = m.contacts;
    const rel = (c) => sub(add(b.velocity, crossSV(b.angularVelocity, c.rb)), add(a.velocity, crossSV(a.angularVelocity, c.ra)));
    for (const c of cs) {
        let dt = -c.mt * dot(rel(c), t);
        const t0 = c.pt, max = mu * c.pn;
        c.pt = Math.max(-max, Math.min(max, t0 + dt));
        dt = c.pt - t0;
        applyPair(a, b, mul(t, dt), c.ra, c.rb);
    }
    if (cs.length === 2) {
        const [c1, c2] = cs;
        const im = iM, ii = iI;
        const rn1a = cross(c1.ra, n), rn1b = cross(c1.rb, n), rn2a = cross(c2.ra, n), rn2b = cross(c2.rb, n);
        const k11 = im(a) + im(b) + ii(a) * rn1a * rn1a + ii(b) * rn1b * rn1b;
        const k22 = im(a) + im(b) + ii(a) * rn2a * rn2a + ii(b) * rn2b * rn2b;
        const k12 = im(a) + im(b) + ii(a) * rn1a * rn2a + ii(b) * rn1b * rn2b;
        const det = k11 * k22 - k12 * k12;
        if (k11 * k11 < 1000 * det) {
            const a1 = c1.pn, a2 = c2.pn;
            const b1 = dot(rel(c1), n) - c1.bias - (k11 * a1 + k12 * a2);
            const b2 = dot(rel(c2), n) - c2.bias - (k12 * a1 + k22 * a2);
            let x1 = 0, x2 = 0;
            const sol = () => {
                // 1. both active
                x1 = -(k22 * b1 - k12 * b2) / det;
                x2 = -(k11 * b2 - k12 * b1) / det;
                if (x1 >= 0 && x2 >= 0)
                    return true;
                // 2. only the first
                x1 = -b1 / k11;
                x2 = 0;
                if (x1 >= 0 && k12 * x1 + b2 >= 0)
                    return true;
                // 3. only the second
                x1 = 0;
                x2 = -b2 / k22;
                if (x2 >= 0 && k12 * x2 + b1 >= 0)
                    return true;
                // 4. none
                x1 = x2 = 0;
                return b1 >= 0 && b2 >= 0;
            };
            if (sol()) {
                applyPair(a, b, mul(n, x1 - a1), c1.ra, c1.rb);
                applyPair(a, b, mul(n, x2 - a2), c2.ra, c2.rb);
                c1.pn = x1;
                c2.pn = x2;
                return;
            }
        }
    }
    for (const c of cs) {
        let d = c.mn * (-dot(rel(c), n) + c.bias);
        const p0 = c.pn;
        c.pn = Math.max(p0 + d, 0);
        d = c.pn - p0;
        applyPair(a, b, mul(n, d), c.ra, c.rb);
    }
}
function applyPair(a, b, J, ra, rb) {
    if (a.type === 'dynamic' && !a.sleeping) {
        a.velocity = sub(a.velocity, mul(J, a.invMass));
        a.angularVelocity -= cross(ra, J) * a.invInertia;
    }
    if (b.type === 'dynamic' && !b.sleeping) {
        b.velocity = add(b.velocity, mul(J, b.invMass));
        b.angularVelocity += cross(rb, J) * b.invInertia;
    }
}
/** A world (also registers nothing — pure). */
function createWorld(o = {}) {
    return new World(o);
}
/** Pointer dragging: a soft pin from a body point to a moving world point. */
function dragConstraint(world, body, x, y, stiffness = 0.6) {
    const c = body.angle;
    const local = rot(sub(v(x, y), body.position), Math.cos(-c), Math.sin(-c));
    const k = world.constraint({ type: 'pin', a: body, anchorA: [local.x, local.y], point: [x, y], length: 0, stiffness, damping: 0.3, label: 'drag' });
    body.wake();
    return {
        constraint: k,
        move(px, py) {
            k.point = v(px, py);
            body.wake();
        },
        release() {
            world.remove(k);
        },
    };
}
/** The module object for `use(physics)`. */
const physics = { id: 'physics', version: RUNTIME_VERSION, tier: 'advanced', requires: ['core'], api: { createWorld, World, Body, Constraint, collide, dragConstraint } };

export { Body, Constraint, World, collide, createWorld, dragConstraint, physics };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.6.0/dist/runtime/physics.js.map