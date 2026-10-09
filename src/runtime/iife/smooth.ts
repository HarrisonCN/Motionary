// CDN build: load runtime.iife.js first, then this file → registers motionary/runtime/smooth and adds its API to window.MotionaryRuntime.
import { register } from '../registry';
import { smooth } from '../smooth';
export * from '../smooth';
register(smooth);
