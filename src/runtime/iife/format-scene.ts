// CDN build: load runtime.iife.js first, then this file → registers motionary/runtime/format-scene and adds its API to window.MotionaryRuntime.
import { register } from '../registry';
import { formatScene } from '../format-scene';
export * from '../format-scene';
register(formatScene);
