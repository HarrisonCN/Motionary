// @vitest-environment node
import { describe, it, expect } from 'vitest';

describe('SSR', () => {
  it('imports and calls the API without window/document', async () => {
    const mod = await import('../src/index');
    expect(typeof window).toBe('undefined');
    const sa = mod.default;
    expect(() => {
      sa.init();
      sa.observe('.x');
      sa.animate('.x');
      sa.refresh();
      sa.watch()();
      sa.destroy();
      mod.staggerChildren(null, { observeChildren: true })();
      const tl = mod.sequence([{ target: '.x' }], { trigger: '.y' });
      tl.play();
      tl.cancel();
    }).not.toThrow();
  });
});
