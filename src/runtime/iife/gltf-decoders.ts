// CDN build: load runtime.iife.js first, then this file → registers motionary/runtime/gltf-decoders and adds its API to window.MotionaryRuntime.
import { register } from '../registry';
import { gltfDecoders } from '../gltf-decoders';
export * from '../gltf-decoders';
register(gltfDecoders);
