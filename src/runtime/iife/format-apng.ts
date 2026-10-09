// CDN build: load runtime.iife.js first, then this file → registers motionary/runtime/format-apng and adds its API to window.MotionaryRuntime.
import { register } from '../registry';
import { formatApng } from '../format-apng';
export * from '../format-apng';
register(formatApng);
