// CDN build: load runtime.iife.js first, then this file → registers motionary/runtime/format-css and adds its API to window.MotionaryRuntime.
import { register } from '../registry';
import { formatCss } from '../format-css';
export * from '../format-css';
register(formatCss);
