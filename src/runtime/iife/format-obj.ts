// CDN build: load runtime.iife.js first, then this file → registers motionary/runtime/format-obj and adds its API to window.MotionaryRuntime.
import { register } from '../registry';
import { formatObj } from '../format-obj';
export * from '../format-obj';
register(formatObj);
