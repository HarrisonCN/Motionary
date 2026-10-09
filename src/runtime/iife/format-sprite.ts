// CDN build: load runtime.iife.js first, then this file → registers motionary/runtime/format-sprite and adds its API to window.MotionaryRuntime.
import { register } from '../registry';
import { formatSprite } from '../format-sprite';
export * from '../format-sprite';
register(formatSprite);
