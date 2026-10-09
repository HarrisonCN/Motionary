// CDN build: load runtime.iife.js first, then this file → registers motionary/runtime/gltf-anim and adds its API to window.MotionaryRuntime.
import { register } from '../registry';
import { gltfAnim } from '../gltf-anim';
export * from '../gltf-anim';
register(gltfAnim);
