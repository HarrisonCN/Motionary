// CDN build: load runtime.iife.js first, then this file → registers motionary/runtime/scroll and adds its API to window.MotionaryRuntime.
import { register } from '../registry';
import { scroll } from '../scroll';
export * from '../scroll';
register(scroll);
