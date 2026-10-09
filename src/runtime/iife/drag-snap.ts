// CDN build: load runtime.iife.js first, then this file → registers motionary/runtime/drag-snap and adds its API to window.MotionaryRuntime.
import { register } from '../registry';
import { dragSnap } from '../drag-snap';
export * from '../drag-snap';
register(dragSnap);
