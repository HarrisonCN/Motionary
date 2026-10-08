// IIFE/UMD build (dist/components.umd.js): registers every <usa-*> element
// as soon as the script loads. Exposes the full API as `window.UsaComponents`.
import { defineComponents } from './index';
import { registerAllEffects, defineEffectElements } from './effects/index';

defineComponents();
registerAllEffects();
defineEffectElements();
export * from './index';
export * from './effects/index';
