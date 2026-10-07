// IIFE/UMD build (dist/components.umd.js): registers every <usa-*> element
// as soon as the script loads. Exposes the full API as `window.UsaComponents`.
import { defineComponents } from './index';

defineComponents();
export * from './index';
