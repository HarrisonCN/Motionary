'use strict';

var registry = require('../chunks/registry-IdH145NL.cjs');

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
const SCENE_FORMAT = 'motionary-scene@1';
const isNum = (x) => typeof x === 'number' && isFinite(x);
const isVec = (x) => Array.isArray(x) && x.length === 2 && x.every(isNum);
/** Upgrade older scene shapes to `motionary-scene@1`. Returns the scene and what changed. */
function migrateScene(input) {
    const changes = [];
    const s = typeof input === 'string' ? JSON.parse(input) : JSON.parse(JSON.stringify(input ?? {}));
    if (s.format === SCENE_FORMAT)
        return { scene: s, changes };
    if (s.format && s.format !== 'motionary-scene@0')
        throw new Error(`[motionary] scene: unknown format "${s.format}" (this build reads ${SCENE_FORMAT} and migrates motionary-scene@0 / unversioned scenes)`);
    changes.push(`${s.format || 'unversioned'} → ${SCENE_FORMAT}`);
    s.format = SCENE_FORMAT;
    // @0 / unversioned: { width, height, gravity: number } at the top level, bodies with x / y / w / h / type
    if (!s.world) {
        s.world = { width: s.width ?? 600, height: s.height ?? 400 };
        if (s.gravity != null)
            s.world.gravity = isNum(s.gravity) ? [0, s.gravity] : s.gravity;
        if (s.walls != null)
            s.world.walls = s.walls;
        delete s.width, delete s.height, delete s.gravity, delete s.walls;
        changes.push('top-level width / height / gravity moved into "world"');
    }
    if (isNum(s.world.gravity)) {
        s.world.gravity = [0, s.world.gravity];
        changes.push('world.gravity number → [0, g]');
    }
    s.bodies = (s.bodies || []).map((b, i) => {
        const o = { ...b };
        if (!o.id)
            (o.id = `body-${i + 1}`), changes.push(`bodies[${i}]: id "${o.id}" added`);
        if (o.position == null && (isNum(o.x) || isNum(o.y))) {
            o.position = [o.x ?? 0, o.y ?? 0];
            delete o.x, delete o.y;
            changes.push(`bodies[${i}]: x / y → position`);
        }
        if (o.size == null && (isNum(o.w) || isNum(o.h))) {
            o.size = [o.w ?? 40, o.h ?? 40];
            delete o.w, delete o.h;
            changes.push(`bodies[${i}]: w / h → size`);
        }
        if (o.type === 'static' || o.type === 'kinematic') {
            o[o.type] = true;
            delete o.type;
            changes.push(`bodies[${i}]: type → ${o.static ? 'static' : 'kinematic'}: true`);
        }
        else if (o.type === 'dynamic')
            delete o.type;
        if (!o.shape)
            o.shape = o.radius != null ? 'circle' : o.vertices ? 'polygon' : 'box';
        return o;
    });
    return { scene: s, changes };
}
/** Problems in a `motionary-scene@1` document (after migration). Never throws. */
function validateScene(input) {
    const out = [];
    let s;
    try {
        s = migrateScene(input).scene;
    }
    catch (e) {
        return [String(e.message).replace('[motionary] scene: ', '')];
    }
    if (!s.world || !isNum(s.world.width) || !isNum(s.world.height) || s.world.width <= 0 || s.world.height <= 0)
        out.push('world: width and height must be positive numbers');
    if (s.world?.gravity != null && !isVec(s.world.gravity))
        out.push('world.gravity must be [x, y]');
    const mats = s.materials || {};
    for (const [k, m] of Object.entries(mats))
        for (const p of ['restitution', 'friction', 'density'])
            if (m[p] != null && (!isNum(m[p]) || m[p] < 0))
                out.push(`materials.${k}.${p} must be a number ≥ 0`);
    if (!Array.isArray(s.bodies))
        out.push('bodies must be an array');
    const ids = new Set();
    (s.bodies || []).forEach((b, i) => {
        const w = `bodies[${i}]${b.id ? ` ("${b.id}")` : ''}`;
        if (ids.has(b.id))
            out.push(`${w}: duplicate id`);
        ids.add(b.id);
        if (!['circle', 'box', 'polygon'].includes(b.shape))
            out.push(`${w}: shape must be circle, box or polygon`);
        if (!isVec(b.position))
            out.push(`${w}: position must be [x, y]`);
        if (b.shape === 'circle' && !(isNum(b.radius) && b.radius > 0))
            out.push(`${w}: circle needs radius > 0`);
        if (b.shape === 'box' && !(isVec(b.size) && b.size[0] > 0 && b.size[1] > 0))
            out.push(`${w}: box needs size [w, h] > 0`);
        if (b.shape === 'polygon' && !(Array.isArray(b.vertices) && b.vertices.length >= 3 && b.vertices.every(isVec)))
            out.push(`${w}: polygon needs ≥ 3 vertices [x, y]`);
        if (b.material && !mats[b.material])
            out.push(`${w}: unknown material "${b.material}"`);
        if (b.static && b.kinematic)
            out.push(`${w}: static and kinematic are exclusive`);
    });
    (s.constraints || []).forEach((c, i) => {
        const w = `constraints[${i}]`;
        if (!['distance', 'pin'].includes(c.type))
            out.push(`${w}: type must be distance or pin`);
        if (!ids.has(c.a))
            out.push(`${w}: unknown body "${c.a}"`);
        if (c.type === 'distance' && !ids.has(c.b))
            out.push(`${w}: distance needs body b (unknown "${c.b}")`);
        if (c.type === 'pin' && c.point != null && !isVec(c.point))
            out.push(`${w}: point must be [x, y]`);
        if (c.stiffness != null && !(isNum(c.stiffness) && c.stiffness > 0 && c.stiffness <= 1))
            out.push(`${w}: stiffness must be in (0, 1]`);
    });
    return out;
}
/** Migrate + validate; throws one error listing every problem. */
function parseScene(input) {
    const { scene } = migrateScene(input);
    const problems = validateScene(scene);
    if (problems.length)
        throw new Error(`[motionary] scene: ${problems.length} problem(s): ${problems.join('; ')}`);
    return scene;
}
/** Build a physics world from a scene (needs `use(physics)`). */
function sceneToWorld(input) {
    const scene = parseScene(input);
    const P = registry.requireModule('physics', 'motionary/runtime/format-scene');
    const w = scene.world;
    const world = P.createWorld({ gravity: w.gravity || [0, 980], iterations: w.iterations });
    if (w.walls)
        world.bounds(w.width, w.height, 50, typeof w.walls === 'object' ? w.walls : {});
    const bodies = {};
    for (const b of scene.bodies) {
        const m = (b.material && scene.materials?.[b.material]) || {};
        const o = {
            shape: b.shape,
            x: b.position[0],
            y: b.position[1],
            angle: b.angle,
            radius: b.radius,
            width: b.size?.[0],
            height: b.size?.[1],
            vertices: b.vertices,
            type: b.static ? 'static' : b.kinematic ? 'kinematic' : 'dynamic',
            restitution: b.restitution ?? m.restitution,
            friction: b.friction ?? m.friction,
            density: b.density ?? m.density,
            vx: b.velocity?.[0],
            vy: b.velocity?.[1],
            angularVelocity: b.angularVelocity,
            sensor: b.sensor,
            label: b.id,
            data: { id: b.id, style: b.style || {}, material: b.material },
        };
        bodies[b.id] = world.body(o);
    }
    for (const c of scene.constraints || [])
        world.constraint({ type: c.type, a: bodies[c.a], b: c.b ? bodies[c.b] : undefined, point: c.point, anchorA: c.anchorA, anchorB: c.anchorB, length: c.length, stiffness: c.stiffness, damping: c.damping });
    return { world, bodies, scene };
}
/** Save the current state of a world as a scene (walls made by `bounds()` are left out; `w` / `h` give the world size). */
function worldToScene(world, o = { width: 600, height: 400 }) {
    const r = (x) => Math.round(x * 1000) / 1000;
    const wallLabels = new Set(['floor', 'wall-left', 'wall-right', 'ceiling']);
    const kept = world.bodies.filter((b) => !(b.isStatic && wallLabels.has(b.label)));
    const id = (b) => b.data?.id || b.label + '-' + b.id;
    const bodies = kept.map((b) => {
        const sb = { id: id(b), shape: b.shape, position: [r(b.position.x), r(b.position.y)] };
        if (b.angle)
            sb.angle = r(b.angle);
        if (b.shape === 'circle')
            sb.radius = r(b.radius);
        else {
            const xs = b.verts.map((p) => p.x), ys = b.verts.map((p) => p.y);
            const isBox = b.shape === 'box';
            if (isBox)
                sb.size = [r(Math.max(...xs) - Math.min(...xs)), r(Math.max(...ys) - Math.min(...ys))];
            else
                sb.vertices = b.verts.map((p) => [r(p.x), r(p.y)]);
        }
        if (b.type === 'static')
            sb.static = true;
        if (b.type === 'kinematic')
            sb.kinematic = true;
        sb.restitution = b.restitution;
        sb.friction = b.friction;
        if (b.type === 'dynamic' && (b.velocity.x || b.velocity.y))
            sb.velocity = [r(b.velocity.x), r(b.velocity.y)];
        if (b.angularVelocity)
            sb.angularVelocity = r(b.angularVelocity);
        if (b.sensor)
            sb.sensor = true;
        const st = b.data?.style;
        if (st && Object.keys(st).length)
            sb.style = st;
        return sb;
    });
    const constraints = world.constraints
        .filter((c) => c.label !== 'drag' && kept.includes(c.a) && (!c.b || kept.includes(c.b)))
        .map((c) => ({ type: c.type, a: id(c.a), ...(c.b ? { b: id(c.b) } : { point: [r(c.point.x), r(c.point.y)] }), anchorA: [r(c.anchorA.x), r(c.anchorA.y)], ...(c.b ? { anchorB: [r(c.anchorB.x), r(c.anchorB.y)] } : {}), length: r(c.length), stiffness: c.stiffness, damping: c.damping }));
    return { format: SCENE_FORMAT, ...(o.name ? { name: o.name } : {}), world: { width: o.width, height: o.height, gravity: [world.gravity.x, world.gravity.y], walls: o.walls ?? world.bodies.some((b) => wallLabels.has(b.label)) }, bodies, constraints };
}
/** The module object for `use(formatScene)` (needs `physics`). */
const formatScene = { id: 'format-scene', version: registry.RUNTIME_VERSION, tier: 'advanced', requires: ['core', 'physics'], api: { SCENE_FORMAT, migrateScene, validateScene, parseScene, sceneToWorld, worldToScene } };

exports.SCENE_FORMAT = SCENE_FORMAT;
exports.formatScene = formatScene;
exports.migrateScene = migrateScene;
exports.parseScene = parseScene;
exports.sceneToWorld = sceneToWorld;
exports.validateScene = validateScene;
exports.worldToScene = worldToScene;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.2.0/dist/runtime/format-scene.cjs.map