// CDN build: load runtime.iife.js first, then this file → registers motionary/runtime/format-motion and adds its API to window.MotionaryRuntime.
import { register } from '../registry';
import { formatMotion } from '../format-motion';
export * from '../format-motion';
register(formatMotion);
