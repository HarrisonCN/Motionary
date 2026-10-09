// CDN build: load runtime.iife.js first, then this file → registers motionary/runtime/physics and adds its API to window.MotionaryRuntime.
import { register } from '../registry';
import { physics } from '../physics';
export * from '../physics';
register(physics);
