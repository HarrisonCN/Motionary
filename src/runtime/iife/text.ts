// CDN build: load runtime.iife.js first, then this file → registers motionary/runtime/text and adds its API to window.MotionaryRuntime.
import { register } from '../registry';
import { text } from '../text';
export * from '../text';
register(text);
