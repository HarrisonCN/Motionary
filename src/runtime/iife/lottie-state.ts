// CDN build: load runtime.iife.js first, then this file → registers motionary/runtime/lottie-state and adds its API to window.MotionaryRuntime.
import { register } from '../registry';
import { lottieState } from '../lottie-state';
export * from '../lottie-state';
register(lottieState);
