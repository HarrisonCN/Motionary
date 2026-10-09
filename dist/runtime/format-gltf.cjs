'use strict';

var registry = require('../chunks/registry-VhfPSI0v.cjs');
var runtime_gl = require('./gl.cjs');

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
 * Skins, morph targets and animations arrive in 10.8. `parseGlb()` /
 * `gltfToNode()` with an `images` override are pure (SSR / workers).
 */
/** Extensions this loader understands (others that a file *requires* make it fail clearly). */
const SUPPORTED_EXTENSIONS = ['KHR_materials_emissive_strength', 'KHR_materials_unlit'];
/** Split a GLB container into its JSON and BIN chunk (pure). */
function parseGlb(input) {
    const b = input instanceof Uint8Array ? input : new Uint8Array(input);
    const v = new DataView(b.buffer, b.byteOffset, b.byteLength);
    if (v.getUint32(0, true) !== 0x46546c67)
        throw new Error('[motionary] format-gltf: not a GLB file');
    if (v.getUint32(4, true) !== 2)
        throw new Error('[motionary] format-gltf: only glTF 2.0 GLB is supported');
    const len = Math.min(v.getUint32(8, true), b.byteLength);
    let p = 12, json = null, bin = null;
    while (p + 8 <= len) {
        const cl = v.getUint32(p, true), ct = v.getUint32(p + 4, true);
        const data = b.subarray(p + 8, p + 8 + cl);
        if (ct === 0x4e4f534a)
            json = JSON.parse(new TextDecoder().decode(data));
        else if (ct === 0x004e4942 && !bin)
            bin = data;
        p += 8 + cl;
    }
    if (!json)
        throw new Error('[motionary] format-gltf: GLB without a JSON chunk');
    return { json, bin };
}
const COMP = {
    5120: [1, Int8Array, 127], 5121: [1, Uint8Array, 255], 5122: [2, Int16Array, 32767], 5123: [2, Uint16Array, 65535], 5125: [4, Uint32Array, 0], 5126: [4, Float32Array, 0],
};
const SIZE = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT2: 4, MAT3: 9, MAT4: 16 };
/** Read an accessor into a flat typed array (floats are de-interleaved; normalised ints become floats). */
function readAccessor(json, buffers, index, asFloat = true) {
    const a = json.accessors?.[index];
    if (!a)
        throw new Error(`[motionary] format-gltf: accessor ${index} missing`);
    const [bytes, Ctor, max] = COMP[a.componentType] || [];
    if (!Ctor)
        throw new Error(`[motionary] format-gltf: component type ${a.componentType} unsupported`);
    const n = SIZE[a.type], count = a.count * n;
    const isFloat = Ctor === Float32Array;
    const out = asFloat || isFloat ? new Float32Array(count) : new Ctor(count);
    if (a.bufferView === undefined)
        return out; // all zeros (sparse-only accessors)
    const bv = json.bufferViews[a.bufferView];
    const buf = buffers[bv.buffer];
    const base = (bv.byteOffset || 0) + (a.byteOffset || 0);
    const stride = bv.byteStride || bytes * n;
    const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    const get = (o) => (bytes === 4 ? (isFloat ? dv.getFloat32(o, true) : dv.getUint32(o, true)) : bytes === 2 ? (Ctor === Int16Array ? dv.getInt16(o, true) : dv.getUint16(o, true)) : Ctor === Int8Array ? dv.getInt8(o) : dv.getUint8(o));
    for (let i = 0; i < a.count; i++)
        for (let k = 0; k < n; k++) {
            let x = get(base + i * stride + k * bytes);
            if (a.normalized && max)
                x = Math.max(x / max, -1);
            out[i * n + k] = x;
        }
    return out;
}
function toTriangles(idx, mode) {
    const out = [];
    if (mode === 5)
        for (let i = 0; i + 2 < idx.length; i++)
            out.push(...(i % 2 ? [idx[i + 1], idx[i], idx[i + 2]] : [idx[i], idx[i + 1], idx[i + 2]]));
    else
        for (let i = 1; i + 1 < idx.length; i++)
            out.push(idx[0], idx[i], idx[i + 1]);
    return new Uint32Array(out);
}
/** Build a runtime/gl node tree from parsed glTF (pure, given buffers and decoded images). */
function gltfToNode(json, buffers, images = {}, sceneIndex) {
    if (!json.asset || !/^2\./.test(json.asset.version))
        throw new Error('[motionary] format-gltf: only glTF 2.0 is supported');
    const missing = (json.extensionsRequired || []).filter((e) => !SUPPORTED_EXTENSIONS.includes(e));
    if (missing.length)
        throw new Error(`[motionary] format-gltf: this file requires ${missing.join(', ')}, which motionary/runtime/format-gltf does not implement${missing.some((e) => /draco|KHR_texture_basisu|meshopt/i.test(e)) ? ' (compressed geometry / textures need the official decoders — re-export the model without compression, or use the decoder hooks planned for 10.9)' : ''}`);
    const mats = (json.materials || []).map((m) => {
        const pbr = m.pbrMetallicRoughness || {};
        const cf = pbr.baseColorFactor || [1, 1, 1, 1];
        // glTF factors are linear; the shader linearises colour input → convert the factor to sRGB space
        const toS = (x) => Math.pow(Math.max(0, x), 1 / 2.2);
        const strength = m.extensions?.KHR_materials_emissive_strength?.emissiveStrength ?? 1;
        const mat = runtime_gl.standardMaterial({ color: [toS(cf[0]), toS(cf[1]), toS(cf[2]), cf[3] ?? 1], metallic: pbr.metallicFactor ?? 1, roughness: pbr.roughnessFactor ?? 1, emissive: (m.emissiveFactor || [0, 0, 0]).map((x) => x * strength), doubleSided: !!m.doubleSided, transparent: m.alphaMode === 'BLEND' });
        if (m.extensions?.KHR_materials_unlit)
            mat.type = 'unlit';
        const ti = pbr.baseColorTexture?.index;
        const src = ti !== undefined ? json.textures?.[ti]?.source : undefined;
        if (src !== undefined && images[src])
            mat.map = runtime_gl.texture(images[src]);
        return mat;
    });
    const meshes = (json.meshes || []).map((m) => m.primitives.map((p) => {
        const mode = p.mode ?? 4;
        let g = {
            positions: readAccessor(json, buffers, p.attributes.POSITION),
            normals: p.attributes.NORMAL !== undefined ? readAccessor(json, buffers, p.attributes.NORMAL) : undefined,
            uvs: p.attributes.TEXCOORD_0 !== undefined ? readAccessor(json, buffers, p.attributes.TEXCOORD_0) : undefined,
            mode: mode === 0 ? 'points' : mode >= 1 && mode <= 3 ? 'lines' : 'triangles',
        };
        if (p.indices !== undefined) {
            let idx = readAccessor(json, buffers, p.indices, false);
            if (mode === 5 || mode === 6)
                idx = toTriangles(Uint32Array.from(idx), mode);
            g.indices = idx instanceof Uint8Array || (idx instanceof Uint32Array && g.positions.length / 3 <= 65535) ? Uint16Array.from(idx) : idx;
        }
        else if (mode === 5 || mode === 6)
            g.indices = toTriangles(Uint32Array.from({ length: g.positions.length / 3 }, (_, i) => i), mode);
        if (!g.normals && g.mode === 'triangles')
            g = runtime_gl.computeNormals(g);
        return { geometry: g, material: p.material !== undefined ? mats[p.material] : runtime_gl.standardMaterial({ metallic: 0, roughness: 0.6 }) };
    }));
    const nodes = (json.nodes || []).map((n, i) => {
        const node = new runtime_gl.GlNode(n.name || `node${i}`, n.mesh !== undefined ? meshes[n.mesh] : null);
        if (n.matrix)
            node.matrix = new Float32Array(n.matrix);
        if (n.translation)
            node.position = n.translation.slice(0, 3);
        if (n.rotation)
            node.rotation = n.rotation.slice(0, 4);
        if (n.scale)
            node.scale = n.scale.slice(0, 3);
        node.extras.gltfIndex = i;
        return node;
    });
    (json.nodes || []).forEach((n, i) => (n.children || []).forEach((c) => nodes[i].add(nodes[c])));
    const root = new runtime_gl.GlNode('gltf');
    const sc = json.scenes?.[sceneIndex ?? json.scene ?? 0];
    const tops = sc?.nodes ?? nodes.map((_, i) => i).filter((i) => !nodes[i].parent);
    tops.forEach((i) => root.add(nodes[i]));
    root.extras = { gltf: json, nodes };
    return root;
}
const dataUri = (u) => {
    const [, meta, data] = /^data:([^,]*),(.*)$/s.exec(u) || [];
    if (meta === undefined)
        throw new Error('[motionary] format-gltf: bad data URI');
    if (/;base64/.test(meta)) {
        const s = atob(data);
        return Uint8Array.from(s, (c) => c.charCodeAt(0));
    }
    return new TextEncoder().encode(decodeURIComponent(data));
};
/** Load a `.gltf` / `.glb` (URL or bytes) with its buffers and images and build a node tree. */
async function loadGltf(src, o = {}) {
    const base = o.baseUrl || (typeof src === 'string' ? new URL(src, typeof location !== 'undefined' ? location.href : 'file:///').href : typeof location !== 'undefined' ? location.href : 'file:///');
    const get = async (u) => {
        if (u.startsWith('data:'))
            return dataUri(u);
        const r = await fetch(new URL(u, base).href);
        if (!r.ok)
            throw new Error(`[motionary] format-gltf: could not load ${u} (${r.status})`);
        return new Uint8Array(await r.arrayBuffer());
    };
    const bytes = typeof src === 'string' ? await get(src) : src instanceof Uint8Array ? src : new Uint8Array(src);
    let json, bin = null;
    if (bytes[0] === 0x67 && bytes[1] === 0x6c && bytes[2] === 0x54 && bytes[3] === 0x46)
        ({ json, bin } = parseGlb(bytes));
    else
        json = JSON.parse(new TextDecoder().decode(bytes));
    const buffers = await Promise.all((json.buffers || []).map((b, i) => (b.uri ? get(b.uri) : i === 0 && bin ? Promise.resolve(bin) : Promise.reject(new Error('[motionary] format-gltf: buffer without data')))));
    const images = {};
    await Promise.all((json.images || []).map(async (im, i) => {
        let data;
        if (im.bufferView !== undefined) {
            const bv = json.bufferViews[im.bufferView];
            data = buffers[bv.buffer].subarray(bv.byteOffset || 0, (bv.byteOffset || 0) + bv.byteLength);
        }
        else if (im.uri)
            data = await get(im.uri);
        else
            return;
        images[i] = await createImageBitmap(new Blob([data], { type: im.mimeType || (im.uri && /\.jpe?g$/i.test(im.uri) ? 'image/jpeg' : 'image/png') }));
    }));
    return gltfToNode(json, buffers, images, o.scene);
}
/** The module object for `use(formatGltf)` (needs `gl`). */
const formatGltf = { id: 'format-gltf', version: registry.RUNTIME_VERSION, requires: ['core', 'gl'], api: { parseGlb, readAccessor, gltfToNode, loadGltf, SUPPORTED_EXTENSIONS } };

exports.SUPPORTED_EXTENSIONS = SUPPORTED_EXTENSIONS;
exports.formatGltf = formatGltf;
exports.gltfToNode = gltfToNode;
exports.loadGltf = loadGltf;
exports.parseGlb = parseGlb;
exports.readAccessor = readAccessor;
//# sourceMappingURL=format-gltf.cjs.map
