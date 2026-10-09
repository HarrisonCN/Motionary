// CDN build: load runtime.iife.js first, then this file → registers motionary/runtime/format-webp and adds its API to window.MotionaryRuntime.
import { register } from '../registry';
import { formatWebp } from '../format-webp';
export * from '../format-webp';
register(formatWebp);
