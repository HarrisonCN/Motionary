import { R as RUNTIME_VERSION } from '../chunks/registry-DUAt7GXU.js';
import { GlNode, texture, standardMaterial, computeNormals } from './gl.js';

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
const nums = (p, from, n) => Array.from({ length: n }, (_, i) => parseFloat(p[from + i]) || 0);
/** Parse OBJ text into groups (one geometry per object / group × material). */
function parseObj(text) {
    const v = [], vt = [], vn = [];
    const mtllibs = [];
    const groups = [];
    let cur = null;
    let obj = 'default', mat = '', tris = 0;
    const flush = () => {
        if (cur && cur.p.length) {
            const g = { positions: new Float32Array(cur.p), uvs: cur.hasT ? new Float32Array(cur.t) : undefined };
            groups.push({ name: cur.name, material: cur.material, geometry: cur.hasN ? { ...g, normals: new Float32Array(cur.n) } : computeNormals(g) });
        }
        cur = null;
    };
    const start = () => {
        if (!cur || cur.name !== obj || cur.material !== mat) {
            flush();
            cur = { name: obj, material: mat, p: [], n: [], t: [], hasN: true, hasT: true };
        }
        return cur;
    };
    for (const raw of text.split(/\r?\n/)) {
        const line = raw.trim();
        if (!line || line[0] === '#')
            continue;
        const p = line.split(/\s+/);
        switch (p[0]) {
            case 'v':
                v.push(...nums(p, 1, 3));
                break;
            case 'vt':
                vt.push(...nums(p, 1, 2));
                break;
            case 'vn':
                vn.push(...nums(p, 1, 3));
                break;
            case 'o':
            case 'g':
                flush();
                obj = p.slice(1).join(' ') || 'default';
                break;
            case 'usemtl':
                mat = p.slice(1).join(' ');
                break;
            case 'mtllib':
                mtllibs.push(...p.slice(1));
                break;
            case 'f': {
                const c = start();
                const verts = p.slice(1).map((s) => {
                    const [a, b, n] = s.split('/');
                    const ix = (x, len) => (x ? (+x < 0 ? len + +x : +x - 1) : -1);
                    return [ix(a, v.length / 3), ix(b, vt.length / 2), ix(n, vn.length / 3)];
                });
                for (let i = 1; i + 1 < verts.length; i++) {
                    for (const k of [verts[0], verts[i], verts[i + 1]]) {
                        c.p.push(v[k[0] * 3], v[k[0] * 3 + 1], v[k[0] * 3 + 2]);
                        if (k[1] >= 0)
                            c.t.push(vt[k[1] * 2], 1 - vt[k[1] * 2 + 1]);
                        else {
                            c.hasT = false;
                            c.t.push(0, 0);
                        }
                        if (k[2] >= 0)
                            c.n.push(vn[k[2] * 3], vn[k[2] * 3 + 1], vn[k[2] * 3 + 2]);
                        else {
                            c.hasN = false;
                            c.n.push(0, 0, 1);
                        }
                    }
                    tris++;
                }
                break;
            }
        }
    }
    flush();
    return { groups, mtllibs, vertexCount: v.length / 3, triangleCount: tris };
}
/** Parse MTL text. */
function parseMtl(text) {
    const out = {};
    let m = null;
    for (const raw of text.split(/\r?\n/)) {
        const line = raw.trim();
        if (!line || line[0] === '#')
            continue;
        const p = line.split(/\s+/);
        const k = p[0];
        if (k === 'newmtl') {
            m = out[p.slice(1).join(' ')] = { name: p.slice(1).join(' '), Kd: [0.8, 0.8, 0.8], Ks: [0, 0, 0], Ke: [0, 0, 0], Ns: 10, d: 1 };
            continue;
        }
        if (!m)
            continue;
        if (k === 'Kd' || k === 'Ks' || k === 'Ke')
            m[k] = nums(p, 1, 3);
        else if (k === 'Ns')
            m.Ns = parseFloat(p[1]) || 0;
        else if (k === 'd')
            m.d = parseFloat(p[1]);
        else if (k === 'Tr')
            m.d = 1 - parseFloat(p[1]);
        else if (k === 'map_Kd')
            m.map_Kd = p[p.length - 1]; // options (-s, -o, -bm …) precede the file name
    }
    return out;
}
/** OBJ material → runtime/gl standard material (Ns 0–1000 → roughness). */
function objMaterial(m) {
    if (!m)
        return standardMaterial({ color: [0.8, 0.8, 0.8, 1] });
    const spec = Math.max(...m.Ks);
    return standardMaterial({ color: [m.Kd[0], m.Kd[1], m.Kd[2], m.d], roughness: Math.min(1, Math.max(0.05, 1 - Math.sqrt(Math.min(m.Ns, 1000) / 1000) * (spec > 0 ? 1 : 0.4))), metallic: 0, emissive: m.Ke, transparent: m.d < 1 });
}
/** Build a node tree (one child per OBJ object, one mesh per material). */
function objToNode(data, materials = {}, textures = {}) {
    const root = new GlNode('obj');
    const byName = new Map();
    for (const g of data.groups) {
        let n = byName.get(g.name);
        if (!n) {
            n = new GlNode(g.name, []);
            byName.set(g.name, n);
            root.add(n);
        }
        const om = materials[g.material];
        const mat = objMaterial(om);
        if (om?.map_Kd && textures[om.map_Kd])
            mat.map = texture(textures[om.map_Kd]);
        n.mesh.push({ geometry: g.geometry, material: mat });
    }
    return root;
}
/** Fetch an OBJ (+ its MTL files and diffuse textures, relative to the OBJ URL) and build a node. */
async function loadObj(url) {
    const get = async (u) => {
        const r = await fetch(u);
        if (!r.ok)
            throw new Error(`[motionary] format-obj: could not load ${u} (${r.status})`);
        return r;
    };
    const data = parseObj(await (await get(url)).text());
    const materials = {};
    for (const lib of data.mtllibs)
        Object.assign(materials, parseMtl(await (await get(new URL(lib, new URL(url, location.href)).href)).text()));
    const textures = {};
    await Promise.all(Object.values(materials).filter((m) => m.map_Kd).map(async (m) => {
        const blob = await (await get(new URL(m.map_Kd, new URL(url, location.href)).href)).blob();
        textures[m.map_Kd] = await createImageBitmap(blob);
    }));
    const node = objToNode(data, materials, textures);
    node.extras = { obj: data, materials };
    return node;
}
/** The module object for `use(formatObj)` (needs `gl`). */
const formatObj = { id: 'format-obj', version: RUNTIME_VERSION, requires: ['core', 'gl'], api: { parseObj, parseMtl, objMaterial, objToNode, loadObj } };

export { formatObj, loadObj, objMaterial, objToNode, parseMtl, parseObj };
//# sourceMappingURL=format-obj.js.map
