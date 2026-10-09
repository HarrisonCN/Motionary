// CDN build: load runtime.iife.js first, then this file → registers motionary/runtime/format-gif and adds its API to window.MotionaryRuntime.
import { register } from '../registry';
import { formatGif } from '../format-gif';
export * from '../format-gif';
register(formatGif);
