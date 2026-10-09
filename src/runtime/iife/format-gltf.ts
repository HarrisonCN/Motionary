// CDN build: load runtime.iife.js first, then this file → registers motionary/runtime/format-gltf and adds its API to window.MotionaryRuntime.
import { register } from '../registry';
import { formatGltf } from '../format-gltf';
export * from '../format-gltf';
register(formatGltf);
