import { R as RUNTIME_VERSION } from '../chunks/registry-D87dP_aR.js';

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
const mat4 = {
    identity: () => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
    multiply(a, b, out = new Float32Array(16)) {
        for (let c = 0; c < 4; c++)
            for (let r = 0; r < 4; r++)
                out[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
        return out;
    },
    perspective(fovy, aspect, near, far) {
        const f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
        return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0]);
    },
    lookAt(eye, target, up = [0, 1, 0]) {
        let z = sub(eye, target);
        z = norm(z.some((v) => v) ? z : [0, 0, 1]);
        let x = cross(up, z);
        if (!x.some((v) => Math.abs(v) > 1e-9))
            x = cross([0, 0, 1], z);
        x = norm(x);
        const y = cross(z, x);
        return new Float32Array([x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, eye), -dot(y, eye), -dot(z, eye), 1]);
    },
    /** Translation · rotation (quaternion) · scale. */
    compose(t, q, s) {
        const [x, y, z, w] = q, x2 = x + x, y2 = y + y, z2 = z + z;
        const xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2, wx = w * x2, wy = w * y2, wz = w * z2;
        return new Float32Array([(1 - (yy + zz)) * s[0], (xy + wz) * s[0], (xz - wy) * s[0], 0, (xy - wz) * s[1], (1 - (xx + zz)) * s[1], (yz + wx) * s[1], 0, (xz + wy) * s[2], (yz - wx) * s[2], (1 - (xx + yy)) * s[2], 0, t[0], t[1], t[2], 1]);
    },
    invert(m) {
        const o = new Float32Array(16);
        const [a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, a30, a31, a32, a33] = m;
        const b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12;
        const b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;
        let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
        if (!det)
            return null;
        det = 1 / det;
        o[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
        o[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
        o[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
        o[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
        o[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
        o[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
        o[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
        o[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
        o[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
        o[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
        o[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
        o[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
        o[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
        o[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
        o[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
        o[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
        return o;
    },
    /** Inverse-transpose of the upper 3×3 (normal matrix), as a mat3. */
    normal(m) {
        const i = mat4.invert(m) || mat4.identity();
        return new Float32Array([i[0], i[4], i[8], i[1], i[5], i[9], i[2], i[6], i[10]]);
    },
    transformPoint(m, p) {
        const w = m[3] * p[0] + m[7] * p[1] + m[11] * p[2] + m[15] || 1;
        return [(m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12]) / w, (m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13]) / w, (m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]) / w];
    },
};
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => {
    const l = Math.hypot(a[0], a[1], a[2]) || 1;
    return [a[0] / l, a[1] / l, a[2] / l];
};
/** Quaternion from Euler angles (radians, XYZ order). */
function quatFromEuler(x, y, z) {
    const cx = Math.cos(x / 2), sx = Math.sin(x / 2), cy = Math.cos(y / 2), sy = Math.sin(y / 2), cz = Math.cos(z / 2), sz = Math.sin(z / 2);
    return [sx * cy * cz + cx * sy * sz, cx * sy * cz - sx * cy * sz, cx * cy * sz + sx * sy * cz, cx * cy * cz - sx * sy * sz];
}
/** Hamilton product a·b. */
function quatMultiply(a, b) {
    return [a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1], a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0], a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3], a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]];
}
/** Spherical interpolation. */
function quatSlerp(a, b, t) {
    let d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
    const bb = d < 0 ? b.map((v) => -v) : b;
    d = Math.abs(d);
    if (d > 0.9995) {
        const r = a.map((v, i) => v + (bb[i] - v) * t);
        const l = Math.hypot(...r) || 1;
        return r.map((v) => v / l);
    }
    const th = Math.acos(d), s = Math.sin(th), wa = Math.sin((1 - t) * th) / s, wb = Math.sin(t * th) / s;
    return a.map((v, i) => v * wa + bb[i] * wb);
}
const geo = (p, n, uv, idx) => ({ positions: new Float32Array(p), normals: new Float32Array(n), uvs: new Float32Array(uv), indices: p.length / 3 > 65535 ? new Uint32Array(idx) : new Uint16Array(idx) });
/** Axis-aligned box centred on the origin. */
function box(w = 1, h = 1, d = 1) {
    const p = [], n = [], uv = [], idx = [];
    const faces = [[[1, 0, 0], [0, 0, -1], [0, 1, 0]], [[-1, 0, 0], [0, 0, 1], [0, 1, 0]], [[0, 1, 0], [1, 0, 0], [0, 0, -1]], [[0, -1, 0], [1, 0, 0], [0, 0, 1]], [[0, 0, 1], [1, 0, 0], [0, 1, 0]], [[0, 0, -1], [-1, 0, 0], [0, 1, 0]]];
    const half = [w / 2, h / 2, d / 2];
    for (const [nn, u, v] of faces) {
        const b = p.length / 3;
        for (const [su, sv] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
            for (let k = 0; k < 3; k++)
                p.push((nn[k] + u[k] * su + v[k] * sv) * half[k]);
            n.push(...nn);
            uv.push((su + 1) / 2, (1 - sv) / 2);
        }
        idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
    }
    return geo(p, n, uv, idx);
}
/** XY plane facing +Z. */
function plane(w = 1, h = 1, sx = 1, sy = 1) {
    const p = [], n = [], uv = [], idx = [];
    for (let j = 0; j <= sy; j++)
        for (let i = 0; i <= sx; i++) {
            p.push((i / sx - 0.5) * w, (j / sy - 0.5) * h, 0);
            n.push(0, 0, 1);
            uv.push(i / sx, 1 - j / sy);
        }
    for (let j = 0; j < sy; j++)
        for (let i = 0; i < sx; i++) {
            const a = j * (sx + 1) + i, b = a + 1, c = a + sx + 1, d = c + 1;
            idx.push(a, b, d, a, d, c);
        }
    return geo(p, n, uv, idx);
}
/** UV sphere. */
function sphere(r = 0.5, ws = 32, hs = 16) {
    const p = [], n = [], uv = [], idx = [];
    for (let j = 0; j <= hs; j++) {
        const v = j / hs, th = v * Math.PI;
        for (let i = 0; i <= ws; i++) {
            const u = i / ws, ph = u * Math.PI * 2;
            const x = -Math.cos(ph) * Math.sin(th), y = Math.cos(th), z = Math.sin(ph) * Math.sin(th);
            p.push(x * r, y * r, z * r);
            n.push(x, y, z);
            uv.push(u, v);
        }
    }
    for (let j = 0; j < hs; j++)
        for (let i = 0; i < ws; i++) {
            const a = j * (ws + 1) + i, b = a + ws + 1;
            if (j)
                idx.push(a, b, a + 1);
            if (j < hs - 1)
                idx.push(a + 1, b, b + 1);
        }
    return geo(p, n, uv, idx);
}
/** Torus in the XY plane. */
function torus(R = 0.5, r = 0.18, rs = 48, ts = 16) {
    const p = [], n = [], uv = [], idx = [];
    for (let j = 0; j <= ts; j++)
        for (let i = 0; i <= rs; i++) {
            const u = (i / rs) * Math.PI * 2, v = (j / ts) * Math.PI * 2;
            const cx = R * Math.cos(u), cy = R * Math.sin(u);
            const x = (R + r * Math.cos(v)) * Math.cos(u), y = (R + r * Math.cos(v)) * Math.sin(u), z = r * Math.sin(v);
            p.push(x, y, z);
            const nn = norm([x - cx, y - cy, z]);
            n.push(...nn);
            uv.push(i / rs, j / ts);
        }
    for (let j = 1; j <= ts; j++)
        for (let i = 1; i <= rs; i++) {
            const a = (rs + 1) * j + i - 1, b = (rs + 1) * (j - 1) + i - 1, c = (rs + 1) * (j - 1) + i, d = (rs + 1) * j + i;
            idx.push(a, b, d, b, c, d);
        }
    return geo(p, n, uv, idx);
}
/** Flat normals for a geometry without them (per triangle; un-indexes the mesh). */
function computeNormals(g) {
    const P = g.positions, I = g.indices;
    const count = I ? I.length : P.length / 3;
    const pos = new Float32Array(count * 3), nrm = new Float32Array(count * 3), uvs = g.uvs ? new Float32Array(count * 2) : undefined;
    for (let t = 0; t < count; t += 3) {
        const v = [0, 1, 2].map((k) => (I ? I[t + k] : t + k));
        const a = [P[v[0] * 3], P[v[0] * 3 + 1], P[v[0] * 3 + 2]], b = [P[v[1] * 3], P[v[1] * 3 + 1], P[v[1] * 3 + 2]], c = [P[v[2] * 3], P[v[2] * 3 + 1], P[v[2] * 3 + 2]];
        const nn = norm(cross(sub(b, a), sub(c, a)));
        v.forEach((vi, k) => {
            pos.set(P.subarray(vi * 3, vi * 3 + 3), (t + k) * 3);
            nrm.set(nn, (t + k) * 3);
            if (uvs && g.uvs)
                uvs.set(g.uvs.subarray(vi * 2, vi * 2 + 2), (t + k) * 2);
        });
    }
    return { positions: pos, normals: nrm, uvs, mode: g.mode };
}
function standardMaterial(o = {}) {
    return { type: 'standard', color: [1, 1, 1, 1], metallic: 0, roughness: 0.6, emissive: [0, 0, 0], ...o };
}
function unlitMaterial(o = {}) {
    return { ...standardMaterial(o), type: 'unlit' };
}
/**
 * Custom fragment shader: `fragment` is GLSL ES 3.00 code defining
 * `vec4 shade()`; available: `v_pos` (world), `v_nrm`, `v_uv`, `u_time`,
 * `u_camPos`, `u_res` and your `uniforms` (float, vec2–4, sampler2D).
 */
function shaderMaterial(fragment, uniforms = {}, o = {}) {
    return { ...standardMaterial(o), type: 'shader', fragment, uniforms };
}
/** '#ff8800' / 'rgb(…)' / [r, g, b] → linear-ready [r, g, b, a] (sRGB values 0–1; the shader linearises). */
function color(c, a = 1) {
    if (Array.isArray(c))
        return [c[0], c[1], c[2], c[3] ?? a];
    const h = /^#([0-9a-f]{3,8})$/i.exec(c.trim());
    if (h) {
        let s = h[1];
        if (s.length <= 4)
            s = s.split('').map((x) => x + x).join('');
        const v = parseInt(s.slice(0, 6), 16);
        return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255, s.length === 8 ? parseInt(s.slice(6), 16) / 255 : a];
    }
    const m = /rgba?\(([^)]+)\)/.exec(c);
    if (m) {
        const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
        return [p[0] / 255, p[1] / 255, p[2] / 255, p[3] ?? a];
    }
    return [1, 1, 1, a];
}
function texture(source, o = {}) {
    const isVideo = typeof HTMLVideoElement !== 'undefined' && source instanceof HTMLVideoElement;
    return { source, srgb: true, repeat: true, flipY: false, video: isVideo, needsUpdate: true, ...o };
}
class GlNode {
    constructor(name = '', mesh = null) {
        this.name = '';
        this.position = [0, 0, 0];
        this.rotation = [0, 0, 0, 1];
        this.scale = [1, 1, 1];
        /** Set to use a fixed local matrix instead of position / rotation / scale (glTF `matrix`). */
        this.matrix = null;
        this.children = [];
        this.parent = null;
        this.mesh = null;
        this.visible = true;
        /** Free-form data (loaders put source info here). */
        this.extras = {};
        this.world = mat4.identity();
        this.name = name;
        this.mesh = mesh;
    }
    add(...nodes) {
        for (const n of nodes) {
            n.parent?.remove(n);
            n.parent = this;
            this.children.push(n);
        }
        return this;
    }
    remove(n) {
        const i = this.children.indexOf(n);
        if (i >= 0)
            this.children.splice(i, 1);
        n.parent = null;
    }
    setEuler(x, y, z) {
        this.rotation = quatFromEuler(x, y, z);
        return this;
    }
    local() {
        return this.matrix || mat4.compose(this.position, this.rotation, this.scale);
    }
    /** Recompute world matrices of this subtree. */
    updateWorld(parent) {
        const m = parent ? mat4.multiply(parent, this.local()) : this.local();
        this.world.set(m);
        for (const c of this.children)
            c.updateWorld(this.world);
    }
    traverse(fn) {
        fn(this);
        for (const c of this.children)
            c.traverse(fn);
    }
    find(name) {
        let hit = null;
        this.traverse((n) => {
            if (!hit && n.name === name)
                hit = n;
        });
        return hit;
    }
}
class Camera extends GlNode {
    constructor(o = {}) {
        super('camera');
        this.fov = (45 * Math.PI) / 180;
        this.near = 0.05;
        this.far = 500;
        this.aspect = 1;
        this.target = [0, 0, 0];
        this.up = [0, 1, 0];
        if (o.fov)
            this.fov = (o.fov * Math.PI) / 180;
        if (o.near)
            this.near = o.near;
        if (o.far)
            this.far = o.far;
        if (o.position)
            this.position = [...o.position];
        if (o.target)
            this.target = [...o.target];
    }
    view() {
        return mat4.lookAt(this.position, this.target, this.up);
    }
    projection() {
        return mat4.perspective(this.fov, this.aspect, this.near, this.far);
    }
}
class Scene {
    constructor() {
        this.root = new GlNode('scene');
        this.ambient = [0.35, 0.35, 0.4];
        this.lights = [{ type: 'directional', vector: [-0.4, -1, -0.6], color: [1, 1, 1], intensity: 2.2 }];
        /** Clear colour (sRGB, 0–1) or null for transparent. */
        this.background = null;
        this.exposure = 1;
    }
    add(...n) {
        this.root.add(...n);
        return this;
    }
}
/** World-space bounding box of a subtree's meshes. */
function bounds(node) {
    node.updateWorld(node.parent ? node.parent.world : undefined);
    const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
    node.traverse((n) => {
        const meshes = n.mesh ? (Array.isArray(n.mesh) ? n.mesh : [n.mesh]) : [];
        for (const m of meshes) {
            const P = m.geometry.positions;
            for (let i = 0; i < P.length; i += 3) {
                const q = mat4.transformPoint(n.world, [P[i], P[i + 1], P[i + 2]]);
                for (let k = 0; k < 3; k++) {
                    if (q[k] < min[k])
                        min[k] = q[k];
                    if (q[k] > max[k])
                        max[k] = q[k];
                }
            }
        }
    });
    if (min[0] === Infinity)
        return { min: [0, 0, 0], max: [0, 0, 0], center: [0, 0, 0], radius: 0 };
    const center = [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2];
    return { min, max, center, radius: Math.hypot(max[0] - center[0], max[1] - center[1], max[2] - center[2]) };
}
/** Point the camera at a subtree so it fills the view. */
function frameNode(camera, node, padding = 1.25) {
    const b = bounds(node);
    const dist = ((b.radius || 1) * padding) / Math.sin(camera.fov / 2);
    const dir = norm(sub(camera.position, camera.target).some((v) => v) ? sub(camera.position, camera.target) : [0.6, 0.4, 1]);
    camera.target = b.center;
    camera.position = [b.center[0] + dir[0] * dist, b.center[1] + dir[1] * dist, b.center[2] + dir[2] * dist];
    camera.near = Math.max(0.01, dist / 100);
    camera.far = dist * 10 + b.radius * 2;
}
// ------------------------------------------------------------------ video
/** Seek a video from a 0–1 progress (scroll-scrubbed video). Pauses it. */
function scrubVideo(video, progress) {
    if (!video.duration || !isFinite(video.duration))
        return;
    video.pause();
    const t = Math.min(video.duration - 0.001, Math.max(0, progress * video.duration));
    if ('fastSeek' in video && Math.abs(video.currentTime - t) > 1)
        video.fastSeek(t);
    else
        video.currentTime = t;
}
// ------------------------------------------------------------------ renderer
const VS = `#version 300 es
layout(location=0) in vec3 a_pos;layout(location=1) in vec3 a_nrm;layout(location=2) in vec2 a_uv;
uniform mat4 u_model,u_view,u_proj;uniform mat3 u_nmat;out vec3 v_pos,v_nrm;out vec2 v_uv;
void main(){vec4 w=u_model*vec4(a_pos,1.0);v_pos=w.xyz;v_nrm=normalize(u_nmat*a_nrm);v_uv=a_uv;gl_Position=u_proj*u_view*w;gl_PointSize=2.0;}`;
const FS_HEAD = `#version 300 es
precision highp float;in vec3 v_pos,v_nrm;in vec2 v_uv;out vec4 o;
uniform vec4 u_color;uniform vec3 u_emissive,u_camPos,u_ambient;uniform float u_metal,u_rough,u_exposure,u_time;uniform vec2 u_res;
uniform sampler2D u_map;uniform int u_hasMap,u_nl,u_unlit;uniform vec4 u_lvec[4];uniform vec3 u_lcol[4];
vec3 lin(vec3 c){return pow(c,vec3(2.2));}vec3 srgb(vec3 c){return pow(c,vec3(1.0/2.2));}
`;
const FS_STD = `${FS_HEAD}void main(){vec4 base=vec4(lin(u_color.rgb),u_color.a);if(u_hasMap==1){vec4 t=texture(u_map,v_uv);base*=vec4(lin(t.rgb),t.a);}
if(u_unlit==1){o=vec4(srgb(base.rgb),base.a);return;}
vec3 N=normalize(v_nrm);if(!gl_FrontFacing)N=-N;vec3 V=normalize(u_camPos-v_pos);float r=clamp(u_rough,0.04,1.0),m=clamp(u_metal,0.0,1.0);
vec3 F0=mix(vec3(0.04),base.rgb,m);vec3 c=u_ambient*base.rgb*(1.0-0.6*m)+u_ambient*F0*0.4;
for(int i=0;i<4;i++){if(i>=u_nl)break;vec3 L;float at=1.0;if(u_lvec[i].w>0.5){vec3 d=u_lvec[i].xyz-v_pos;float l=length(d);L=d/l;at=1.0/(1.0+0.09*l*l);}else L=normalize(-u_lvec[i].xyz);
vec3 H=normalize(L+V);float NL=max(dot(N,L),0.0),NH=max(dot(N,H),0.0),NV=max(dot(N,V),1e-3),a=r*r,a2=a*a,dd=NH*NH*(a2-1.0)+1.0,D=a2/(3.14159*dd*dd),k=(r+1.0)*(r+1.0)/8.0;
float G=NL/(NL*(1.0-k)+k)*NV/(NV*(1.0-k)+k);vec3 F=F0+(1.0-F0)*pow(1.0-max(dot(H,V),0.0),5.0);vec3 S=D*G*F/(4.0*NL*NV+1e-3);
c+=((1.0-F)*(1.0-m)*base.rgb/3.14159+S)*u_lcol[i]*NL*at;}
c=(c+u_emissive)*u_exposure;c=c/(c+1.0);o=vec4(srgb(c),base.a);}`;
/** Create a WebGL2 renderer on a canvas (throws a clear error when WebGL2 is unavailable). */
function createRenderer(canvas, o = {}) {
    const gl = canvas.getContext('webgl2', { alpha: o.alpha ?? true, antialias: o.antialias ?? true, premultipliedAlpha: false, preserveDrawingBuffer: !!o.preserveDrawingBuffer });
    if (!gl)
        throw new Error('[motionary] runtime/gl: WebGL2 is not available in this browser / context');
    const programs = new Map();
    const owned = [];
    let draws = 0;
    const compile = (key, fs) => {
        let pr = programs.get(key);
        if (pr)
            return pr;
        const sh = (type, src) => {
            const s = gl.createShader(type);
            gl.shaderSource(s, src);
            gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
                throw new Error('[motionary] runtime/gl shader: ' + gl.getShaderInfoLog(s));
            return s;
        };
        const p = gl.createProgram();
        gl.attachShader(p, sh(gl.VERTEX_SHADER, VS));
        gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
        gl.linkProgram(p);
        if (!gl.getProgramParameter(p, gl.LINK_STATUS))
            throw new Error('[motionary] runtime/gl link: ' + gl.getProgramInfoLog(p));
        pr = { p, u: new Map() };
        programs.set(key, pr);
        owned.push({ del: () => gl.deleteProgram(p) });
        return pr;
    };
    const loc = (pr, n) => {
        if (!pr.u.has(n))
            pr.u.set(n, gl.getUniformLocation(pr.p, n));
        return pr.u.get(n);
    };
    const uploadGeo = (g) => {
        if (g._gpu)
            return g._gpu;
        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        const attr = (i, data, size, fallback) => {
            if (!data) {
                gl.disableVertexAttribArray(i);
                if (size === 3)
                    gl.vertexAttrib3f(i, fallback[0], fallback[1], fallback[2]);
                else
                    gl.vertexAttrib2f(i, fallback[0], fallback[1]);
                return;
            }
            const b = gl.createBuffer();
            owned.push({ del: () => gl.deleteBuffer(b) });
            gl.bindBuffer(gl.ARRAY_BUFFER, b);
            gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
            gl.enableVertexAttribArray(i);
            gl.vertexAttribPointer(i, size, gl.FLOAT, false, 0, 0);
        };
        attr(0, g.positions, 3, [0, 0, 0]);
        attr(1, g.normals, 3, [0, 0, 1]);
        attr(2, g.uvs, 2, [0, 0]);
        let count = g.positions.length / 3, type = 0;
        if (g.indices) {
            const b = gl.createBuffer();
            owned.push({ del: () => gl.deleteBuffer(b) });
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, b);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, g.indices, gl.STATIC_DRAW);
            count = g.indices.length;
            type = g.indices instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;
        }
        gl.bindVertexArray(null);
        owned.push({ del: () => gl.deleteVertexArray(vao) });
        return (g._gpu = { vao, count, type, indexed: !!g.indices });
    };
    const uploadTex = (t, unit) => {
        let tex = t._gpu;
        gl.activeTexture(gl.TEXTURE0 + unit);
        if (!tex) {
            tex = gl.createTexture();
            t._gpu = tex;
            owned.push({ del: () => gl.deleteTexture(tex) });
            t.needsUpdate = true;
            if (t.video) {
                const v = t.source;
                const mark = () => {
                    t.needsUpdate = true;
                    v.requestVideoFrameCallback?.(mark);
                };
                if (v.requestVideoFrameCallback)
                    v.requestVideoFrameCallback(mark);
            }
        }
        gl.bindTexture(gl.TEXTURE_2D, tex);
        const v = t.video ? t.source : null;
        const videoReady = !v || v.readyState >= 2;
        if ((t.needsUpdate || (v && !v.requestVideoFrameCallback && !v.paused)) && videoReady) {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, !!t.flipY);
            const s = t.source;
            if (s && s.data && !(s instanceof ImageData))
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, s.width, s.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(s.data.buffer, s.data.byteOffset, s.data.byteLength));
            else
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, s);
            const pot = (n) => (n & (n - 1)) === 0;
            const w = s.videoWidth || s.naturalWidth || s.width, h = s.videoHeight || s.naturalHeight || s.height;
            const mip = !v && pot(w) && pot(h);
            if (mip)
                gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mip ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            const wrap = t.repeat && pot(w) && pot(h) ? gl.REPEAT : gl.CLAMP_TO_EDGE;
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
            t.needsUpdate = false;
        }
    };
    const r = {
        gl,
        canvas,
        get drawCalls() {
            return draws;
        },
        resize(w, h) {
            const c = canvas;
            const dpr = Math.min(o.maxDpr ?? 2, (typeof devicePixelRatio === 'number' && devicePixelRatio) || 1);
            const W = Math.max(1, Math.round((w ?? c.clientWidth ?? c.width) * dpr)), H = Math.max(1, Math.round((h ?? c.clientHeight ?? c.height) * dpr));
            if (c.width === W && c.height === H)
                return false;
            c.width = W;
            c.height = H;
            return true;
        },
        render(scene, camera, time = 0) {
            draws = 0;
            const W = gl.drawingBufferWidth, H = gl.drawingBufferHeight;
            gl.viewport(0, 0, W, H);
            camera.aspect = W / H || 1;
            const bg = scene.background;
            gl.clearColor(bg ? bg[0] : 0, bg ? bg[1] : 0, bg ? bg[2] : 0, bg ? bg[3] : 0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.enable(gl.DEPTH_TEST);
            scene.root.updateWorld();
            const view = camera.view(), proj = camera.projection();
            const lv = new Float32Array(16), lc = new Float32Array(12);
            scene.lights.slice(0, 4).forEach((l, i) => {
                lv.set([...l.vector, l.type === 'point' ? 1 : 0], i * 4);
                lc.set(l.color.map((c) => c * l.intensity), i * 3);
            });
            const opaque = [], blend = [];
            scene.root.traverse((n) => {
                if (!n.visible || !n.mesh)
                    return;
                for (const m of Array.isArray(n.mesh) ? n.mesh : [n.mesh])
                    (m.material.transparent || m.material.color[3] < 1 ? blend : opaque).push([n, m]);
            });
            for (const [n, m] of [...opaque, ...blend]) {
                const mat = m.material;
                const key = mat.type === 'shader' ? 'shader:' + mat.fragment : 'std';
                const pr = compile(key, mat.type === 'shader' ? `${FS_HEAD}${Object.entries(mat.uniforms || {}).map(([k, v]) => `uniform ${typeof v === 'number' ? 'float' : v.source ? 'sampler2D' : `vec${v.length}`} ${k};`).join('')}\n${mat.fragment}\nvoid main(){o=shade();}` : FS_STD);
                gl.useProgram(pr.p);
                const U = (nm) => loc(pr, nm);
                gl.uniformMatrix4fv(U('u_model'), false, n.world);
                gl.uniformMatrix4fv(U('u_view'), false, view);
                gl.uniformMatrix4fv(U('u_proj'), false, proj);
                gl.uniformMatrix3fv(U('u_nmat'), false, mat4.normal(n.world));
                gl.uniform4fv(U('u_color'), mat.color);
                gl.uniform3fv(U('u_emissive'), mat.emissive);
                gl.uniform3fv(U('u_camPos'), camera.position);
                gl.uniform3fv(U('u_ambient'), scene.ambient);
                gl.uniform1f(U('u_metal'), mat.metallic);
                gl.uniform1f(U('u_rough'), mat.roughness);
                gl.uniform1f(U('u_exposure'), scene.exposure);
                gl.uniform1f(U('u_time'), time / 1000);
                gl.uniform2f(U('u_res'), W, H);
                gl.uniform1i(U('u_unlit'), mat.type === 'unlit' ? 1 : 0);
                gl.uniform1i(U('u_nl'), Math.min(4, scene.lights.length));
                gl.uniform4fv(U('u_lvec'), lv);
                gl.uniform3fv(U('u_lcol'), lc);
                let unit = 0;
                if (mat.map) {
                    uploadTex(mat.map, unit);
                    gl.uniform1i(U('u_map'), unit++);
                }
                gl.uniform1i(U('u_hasMap'), mat.map ? 1 : 0);
                for (const [k, v] of Object.entries(mat.uniforms || {})) {
                    if (typeof v === 'number')
                        gl.uniform1f(U(k), v);
                    else if (v.source) {
                        uploadTex(v, unit);
                        gl.uniform1i(U(k), unit++);
                    }
                    else {
                        const a = v;
                        (a.length === 2 ? gl.uniform2fv : a.length === 3 ? gl.uniform3fv : gl.uniform4fv).call(gl, U(k), a);
                    }
                }
                if (mat.doubleSided)
                    gl.disable(gl.CULL_FACE);
                else
                    gl.enable(gl.CULL_FACE);
                if (mat.transparent || mat.color[3] < 1) {
                    gl.enable(gl.BLEND);
                    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                    gl.depthMask(false);
                }
                else {
                    gl.disable(gl.BLEND);
                    gl.depthMask(true);
                }
                const g = uploadGeo(m.geometry);
                gl.bindVertexArray(g.vao);
                const mode = m.geometry.mode === 'lines' || mat.wireframe ? gl.LINES : m.geometry.mode === 'points' ? gl.POINTS : gl.TRIANGLES;
                if (g.indexed)
                    gl.drawElements(mode, g.count, g.type, 0);
                else
                    gl.drawArrays(mode, 0, g.count);
                draws++;
            }
            gl.bindVertexArray(null);
            gl.depthMask(true);
        },
        dispose() {
            owned.splice(0).forEach((x) => x.del());
            programs.clear();
        },
    };
    return r;
}
/** Drag to orbit, wheel / pinch to zoom, arrow keys (when the element has focus). Call `update(dt)` per frame. */
function orbitControls(camera, el, o = {}) {
    const off = sub(camera.position, camera.target);
    let dist = Math.hypot(...off), theta = Math.atan2(off[0], off[2]), phi = Math.acos(Math.min(1, Math.max(-1, off[1] / (dist || 1))));
    let vt = 0, vp = 0, vz = 0, drag = false, lx = 0, ly = 0;
    const pts = new Map();
    let pinch = 0;
    const damp = o.damping ?? 0.12;
    const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctl = { autoRotate: reduce ? 0 : o.autoRotate ?? 0, update, dispose };
    const on = (t, ty, f, opt) => {
        t.addEventListener(ty, f, opt);
        return () => t.removeEventListener(ty, f, opt);
    };
    const offs = [
        on(el, 'pointerdown', (e) => {
            pts.set(e.pointerId, [e.clientX, e.clientY]);
            drag = true;
            lx = e.clientX;
            ly = e.clientY;
            el.setPointerCapture?.(e.pointerId);
        }),
        on(el, 'pointermove', (e) => {
            if (!pts.has(e.pointerId))
                return;
            pts.set(e.pointerId, [e.clientX, e.clientY]);
            if (pts.size === 2 && o.zoom !== false) {
                const [a, b] = Array.from(pts.values());
                const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
                if (pinch)
                    vz += (pinch - d) * 0.004;
                pinch = d;
                return;
            }
            if (!drag)
                return;
            vt -= (e.clientX - lx) * 0.005;
            vp -= (e.clientY - ly) * 0.005;
            lx = e.clientX;
            ly = e.clientY;
        }),
        on(el, 'pointerup', (e) => {
            pts.delete(e.pointerId);
            pinch = 0;
            drag = pts.size > 0;
        }),
        on(el, 'pointercancel', (e) => {
            pts.delete(e.pointerId);
            drag = false;
        }),
        on(el, 'wheel', (e) => {
            if (o.zoom === false)
                return;
            e.preventDefault();
            vz += Math.sign(e.deltaY) * 0.08;
        }, { passive: false }),
        on(el, 'keydown', (e) => {
            const k = { ArrowLeft: [0.1, 0, 0], ArrowRight: [-0.1, 0, 0], ArrowUp: [0, 0.1, 0], ArrowDown: [0, -0.1, 0], '+': [0, 0, -0.1], '-': [0, 0, 0.1] }[e.key];
            if (!k)
                return;
            e.preventDefault();
            vt += k[0];
            vp += k[1];
            vz += k[2];
        }),
    ];
    function update(dt) {
        const moving = Math.abs(vt) + Math.abs(vp) + Math.abs(vz) > 1e-5 || ctl.autoRotate;
        theta += vt + (ctl.autoRotate && !drag ? (ctl.autoRotate * dt) / 1000 : 0);
        phi = Math.min(Math.PI - 0.05, Math.max(0.05, phi + vp));
        dist = Math.min(o.maxDistance ?? Infinity, Math.max(o.minDistance ?? 0.01, dist * (1 + vz)));
        const k = Math.pow(1 - damp, dt / 16.7);
        vt *= k;
        vp *= k;
        vz *= k;
        const t = camera.target;
        camera.position = [t[0] + dist * Math.sin(phi) * Math.sin(theta), t[1] + dist * Math.cos(phi), t[2] + dist * Math.sin(phi) * Math.cos(theta)];
        return !!moving;
    }
    function dispose() {
        offs.forEach((f) => f());
    }
    return ctl;
}
/** The module object for `use(gl)`. */
const gl = {
    id: 'gl',
    version: RUNTIME_VERSION,
    requires: ['core'],
    api: { mat4, quatFromEuler, quatMultiply, quatSlerp, box, plane, sphere, torus, computeNormals, standardMaterial, unlitMaterial, shaderMaterial, color, texture, GlNode, Camera, Scene, bounds, frameNode, scrubVideo, createRenderer, orbitControls },
};

export { Camera, GlNode, Scene, bounds, box, color, computeNormals, createRenderer, frameNode, gl, mat4, orbitControls, plane, quatFromEuler, quatMultiply, quatSlerp, scrubVideo, shaderMaterial, sphere, standardMaterial, texture, torus, unlitMaterial };
//# sourceMappingURL=gl.js.map
