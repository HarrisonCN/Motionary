'use strict';

var registry = require('../chunks/registry-U0scTJZr.cjs');

/**
 * `motionary/runtime/gltf-decoders` (10.9) — hooks that let
 * `motionary/runtime/format-gltf` load compressed glTF through the **official
 * decoders**, lazy-loaded as optional peers (we do not reimplement them):
 *
 * - `KHR_draco_mesh_compression` → Google's **`draco3d`** decoder
 *   (`npm i draco3d`; WASM/JS, Apache-2.0);
 * - `KHR_texture_basisu` (KTX2 / Basis Universal textures) → Binomial's
 *   **Basis Universal transcoder** (`basis_transcoder.js` + `.wasm` from
 *   github.com/BinomialLLC/basis_universal, Apache-2.0), transcoded to RGBA8.
 *
 * `provideGltfDecoder('draco', () => import('draco3d'))` /
 * `provideGltfDecoder('ktx2', () => import('/vendor/basis_transcoder.js'))`
 * register a loader; nothing is fetched until a file needs it. A file that
 * requires an extension without a provided decoder fails with the exact
 * install / provide instructions. `prepareGltf()` is what format-gltf calls.
 */
const loaders = {};
const ready = {};
const DECODER_EXTENSIONS = { KHR_draco_mesh_compression: 'draco', KHR_texture_basisu: 'ktx2' };
const DECODER_HELP = {
    draco: "npm i draco3d — then provideGltfDecoder('draco', () => import('draco3d')) (CDN: https://www.gstatic.com/draco/versioned/decoders/1.5.7/draco_decoder.js)",
    ktx2: "copy basis_transcoder.js + basis_transcoder.wasm from https://github.com/BinomialLLC/basis_universal (webgl/transcoder/build) — then provideGltfDecoder('ktx2', () => import('/vendor/basis_transcoder.js'))",
};
/** Register the lazy loader of an official decoder. */
function provideGltfDecoder(kind, loader) {
    loaders[kind] = loader;
    delete ready[kind];
}
/** Which decoders have a loader. */
const providedDecoders = () => Object.keys(loaders);
const need = (kind, ext) => {
    const l = loaders[kind];
    if (!l)
        throw new Error(`[motionary] gltf-decoders: this file uses ${ext}, which needs the official decoder — ${DECODER_HELP[kind]}`);
    return (ready[kind] || (ready[kind] = Promise.resolve(l()).then(async (m) => {
        const x = m?.default ?? m;
        if (kind === 'draco')
            return x.createDecoderModule ? x.createDecoderModule({}) : typeof x === 'function' ? x({}) : x;
        const b = typeof x === 'function' ? await x() : x; // BASIS() factory
        b.initializeBasis?.();
        return b;
    })));
};
/** Decode one Draco buffer into float attributes (by unique id) + uint32 indices. */
function decodeDraco(D, bytes, attributes) {
    const dec = new D.Decoder(), buf = new D.DecoderBuffer(), mesh = new D.Mesh();
    try {
        buf.Init(new Int8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength), bytes.byteLength);
        const st = dec.DecodeBufferToMesh(buf, mesh);
        if (!st.ok() || !mesh.ptr)
            throw new Error('[motionary] gltf-decoders: Draco decode failed — ' + st.error_msg());
        const n = mesh.num_points(), f = mesh.num_faces();
        const out = {};
        for (const [name, uid] of Object.entries(attributes)) {
            const att = dec.GetAttributeByUniqueId(mesh, uid);
            const size = att.num_components(), bytesN = n * size * 4, p = D._malloc(bytesN);
            dec.GetAttributeDataArrayForAllPoints(mesh, att, D.DT_FLOAT32, bytesN, p);
            out[name] = { data: new Float32Array(D.HEAPF32.buffer, p, n * size).slice(), size };
            D._free(p);
        }
        const ib = f * 12, ip = D._malloc(ib);
        dec.GetTrianglesUInt32Array(mesh, ib, ip);
        const indices = new Uint32Array(D.HEAPU32.buffer, ip, f * 3).slice();
        D._free(ip);
        return { attributes: out, indices, count: n };
    }
    finally {
        D.destroy(mesh);
        D.destroy(buf);
        D.destroy(dec);
    }
}
/** Transcode a KTX2 (Basis Universal) image to RGBA8 with the official transcoder. */
function transcodeKtx2(B, bytes) {
    const f = new B.KTX2File(new Uint8Array(bytes));
    try {
        if (!f.isValid())
            throw new Error('[motionary] gltf-decoders: not a valid KTX2 file');
        const width = f.getWidth(), height = f.getHeight();
        if (!f.startTranscoding())
            throw new Error('[motionary] gltf-decoders: KTX2 startTranscoding failed');
        const fmt = B.transcoder_texture_format?.cTFRGBA32?.value ?? B.transcoder_texture_format?.cTFRGBA32 ?? 13;
        const data = new Uint8Array(f.getImageTranscodedSizeInBytes(0, 0, 0, fmt));
        if (!f.transcodeImage(data, 0, 0, 0, fmt, 0, -1, -1))
            throw new Error('[motionary] gltf-decoders: KTX2 transcode failed');
        return { width, height, data };
    }
    finally {
        f.close?.();
        f.delete?.();
    }
}
/**
 * Rewrite a parsed glTF so format-gltf can read it: Draco primitives become
 * plain float accessors over new buffers, KHR_texture_basisu textures point
 * at decoded images. Returns the new json, buffers and decoded images.
 */
async function prepareGltf(json, buffers) {
    const used = [...(json.extensionsUsed || []), ...(json.extensionsRequired || [])];
    if (!used.some((e) => e in DECODER_EXTENSIONS))
        return { json, buffers, images: {} };
    const j = JSON.parse(JSON.stringify(json));
    const bufs = buffers.slice();
    const images = {};
    const addAccessor = (data, type, count) => {
        bufs.push(new Uint8Array(data.buffer, data.byteOffset, data.byteLength));
        (j.bufferViews || (j.bufferViews = [])).push({ buffer: bufs.length - 1, byteLength: data.byteLength });
        (j.accessors || (j.accessors = [])).push({ bufferView: j.bufferViews.length - 1, componentType: data instanceof Uint32Array ? 5125 : 5126, count, type });
        return j.accessors.length - 1;
    };
    const bvBytes = (i) => {
        const bv = j.bufferViews[i];
        return bufs[bv.buffer].subarray(bv.byteOffset || 0, (bv.byteOffset || 0) + bv.byteLength);
    };
    for (const m of j.meshes || [])
        for (const p of m.primitives || []) {
            const ext = p.extensions?.KHR_draco_mesh_compression;
            if (!ext)
                continue;
            const D = await need('draco', 'KHR_draco_mesh_compression');
            const r = decodeDraco(D, bvBytes(ext.bufferView), ext.attributes);
            for (const [name, a] of Object.entries(r.attributes))
                p.attributes[name] = addAccessor(a.data, ['SCALAR', 'VEC2', 'VEC3', 'VEC4'][a.size - 1], r.count);
            p.indices = addAccessor(r.indices, 'SCALAR', r.indices.length);
            delete p.extensions.KHR_draco_mesh_compression;
        }
    for (const t of j.textures || []) {
        const src = t.extensions?.KHR_texture_basisu?.source;
        if (src === undefined)
            continue;
        const B = await need('ktx2', 'KHR_texture_basisu');
        const im = j.images[src];
        const bytes = im.bufferView !== undefined ? bvBytes(im.bufferView) : new Uint8Array(await (await fetch(im.uri)).arrayBuffer());
        const { width, height, data } = transcodeKtx2(B, bytes);
        images[src] = typeof ImageData !== 'undefined' ? new ImageData(new Uint8ClampedArray(data), width, height) : { width, height, data };
        t.source = src;
        delete t.extensions.KHR_texture_basisu;
    }
    const strip = (l) => l?.filter((e) => !(e in DECODER_EXTENSIONS));
    j.extensionsRequired = strip(j.extensionsRequired);
    j.extensionsUsed = strip(j.extensionsUsed);
    return { json: j, buffers: bufs, images };
}
const gltfDecoders = { id: 'gltf-decoders', version: registry.RUNTIME_VERSION, tier: 'advanced', requires: ['core', 'gl', 'format-gltf'], api: { provideGltfDecoder, providedDecoders, prepareGltf, decodeDraco, transcodeKtx2, DECODER_EXTENSIONS } };

exports.DECODER_EXTENSIONS = DECODER_EXTENSIONS;
exports.DECODER_HELP = DECODER_HELP;
exports.decodeDraco = decodeDraco;
exports.gltfDecoders = gltfDecoders;
exports.prepareGltf = prepareGltf;
exports.provideGltfDecoder = provideGltfDecoder;
exports.providedDecoders = providedDecoders;
exports.transcodeKtx2 = transcodeKtx2;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.5.0/dist/runtime/gltf-decoders.cjs.map