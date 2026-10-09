// CDN build: load runtime.iife.js first, then this file → registers motionary/runtime/format-svg and adds its API to window.MotionaryRuntime.
import { register } from '../registry';
import { formatSvg } from '../format-svg';
export * from '../format-svg';
register(formatSvg);
