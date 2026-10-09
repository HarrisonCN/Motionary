// CDN build: load runtime.iife.js first, then this file → registers motionary/runtime/gl and adds its API to window.MotionaryRuntime.
import { register } from '../registry';
import { gl } from '../gl';
export * from '../gl';
register(gl);
