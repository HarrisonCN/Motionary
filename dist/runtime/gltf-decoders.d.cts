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

type Any = any;
type DecoderKind = 'draco' | 'ktx2';
type Loader = () => Promise<Any> | Any;
declare const DECODER_EXTENSIONS: Record<string, DecoderKind>;
declare const DECODER_HELP: Record<DecoderKind, string>;
/** Register the lazy loader of an official decoder. */
declare function provideGltfDecoder(kind: DecoderKind, loader: Loader): void;
/** Which decoders have a loader. */
declare const providedDecoders: () => DecoderKind[];
/** Decode one Draco buffer into float attributes (by unique id) + uint32 indices. */
declare function decodeDraco(D: Any, bytes: Uint8Array, attributes: Record<string, number>): {
    attributes: Record<string, {
        data: Float32Array;
        size: number;
    }>;
    indices: Uint32Array;
    count: number;
};
/** Transcode a KTX2 (Basis Universal) image to RGBA8 with the official transcoder. */
declare function transcodeKtx2(B: Any, bytes: Uint8Array): {
    width: number;
    height: number;
    data: Uint8Array;
};
/**
 * Rewrite a parsed glTF so format-gltf can read it: Draco primitives become
 * plain float accessors over new buffers, KHR_texture_basisu textures point
 * at decoded images. Returns the new json, buffers and decoded images.
 */
declare function prepareGltf(json: Any, buffers: Uint8Array[]): Promise<{
    json: Any;
    buffers: Uint8Array[];
    images: Record<number, Any>;
}>;
interface GltfDecodersApi {
    provideGltfDecoder: typeof provideGltfDecoder;
    providedDecoders: typeof providedDecoders;
    prepareGltf: typeof prepareGltf;
    decodeDraco: typeof decodeDraco;
    transcodeKtx2: typeof transcodeKtx2;
    DECODER_EXTENSIONS: typeof DECODER_EXTENSIONS;
}
declare const gltfDecoders: RuntimeModule<GltfDecodersApi>;

export { DECODER_EXTENSIONS, DECODER_HELP, decodeDraco, gltfDecoders, prepareGltf, provideGltfDecoder, providedDecoders, transcodeKtx2 };
export type { DecoderKind, GltfDecodersApi };
