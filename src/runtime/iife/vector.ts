// CDN build: load runtime.iife.js first, then this file → registers motionary/runtime/vector and adds its API to window.MotionaryRuntime.
import { register } from '../registry';
import { vector } from '../vector';
export * from '../vector';
register(vector);
