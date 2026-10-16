// IIFE/UMD build (dist/components.umd.js): registers every <usa-*> element
// as soon as the script loads. Exposes the full API as `window.UsaComponents`.
import { defineComponents } from './index';
import { defineMoAliases } from './mo';
import { registerAllEffects, defineEffectElements } from './effects/index';

defineMoAliases(); // 17.0: <mo-*> names for every <usa-*> element (window.MotionaryComponents = window.UsaComponents)
defineComponents();
registerAllEffects();
defineEffectElements();
export * from './index';
export { defineMoAliases, aliasTag, aliasCss } from './mo';
export * from './effects/index';
