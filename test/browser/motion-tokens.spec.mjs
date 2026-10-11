// 14.1.0: Motion Tokens 2.0 (motionary/tokens) in real browsers: the generated stylesheet resolves semantic vars to
// primitives, the reduced-motion media block and data-usa-motion-mode switch values, applyMotionTokenSet drives
// Motion Engine v2 token references, and mode 'auto' follows the emulated prefers-reduced-motion.
import { test, expect } from '@playwright/test';
import { openFixture, expectNoErrors } from './helpers.mjs';

test.describe('14.1 Motion Tokens 2.0', () => {
  test('CSS: semantic vars resolve, reduced media + data mode switch values', async ({ page }) => {
    await openFixture(page);
    const read = () => page.evaluate(() => {
      const cs = getComputedStyle(document.getElementById('probe'));
      return { d: cs.getPropertyValue('--usa-motion-enter-default-duration').trim(), dist: cs.marginLeft, fast: cs.getPropertyValue('--usa-duration-normal').trim() };
    });
    await page.evaluate(async () => {
      const T = await import('motionary/tokens');
      const st = document.createElement('style');
      st.textContent = T.motionTokenSetToCss(T.MOTION_TOKENS_2) + '#probe { margin-left: var(--usa-motion-enter-default-distance); }';
      document.head.append(st);
      document.getElementById('stage').innerHTML = '<div id="probe"></div>';
    });
    const base = await read();
    expect(base.d).toBe('300ms');
    expect(base.dist).toBe('16px');
    expect(base.fast).toBe('300ms');
    await page.evaluate(() => document.documentElement.setAttribute('data-usa-motion-mode', 'compact'));
    expect((await read()).dist).toBe('8px');
    expect((await read()).fast).toBe('240ms');
    await page.evaluate(() => document.documentElement.removeAttribute('data-usa-motion-mode'));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    expect((await read()).dist).toBe('0px');
    expect((await read()).fast).toBe('150ms');
    await expectNoErrors(page);
  });

  test('applyMotionTokenSet drives motionary/motion; mode auto follows prefers-reduced-motion', async ({ page }) => {
    await openFixture(page);
    const r = await page.evaluate(async () => {
      const T = await import('motionary/tokens');
      const M = await import('motionary/motion');
      const out = {};
      const set = T.defineMotionTokens({ duration: { normal: 420 } });
      const undo = T.applyMotionTokenSet(set);
      out.applied = M.animate(() => {}, { duration: '{duration.normal}', autoplay: false }).duration;
      out.var = getComputedStyle(document.documentElement).getPropertyValue('--usa-distance-md').trim();
      undo();
      out.undone = M.animate(() => {}, { duration: '{duration.normal}', autoplay: false }).duration;
      return out;
    });
    expect(r).toEqual({ applied: 420, var: '16px', undone: 300 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const auto = await page.evaluate(async () => {
      const T = await import('motionary/tokens');
      const M = await import('motionary/motion');
      const undo = T.applyMotionTokenSet(T.MOTION_TOKENS_2, { mode: 'auto' });
      const d = M.animate(() => {}, { duration: '{duration.slow}', autoplay: false }).duration;
      const dist = getComputedStyle(document.documentElement).getPropertyValue('--usa-distance-md').trim();
      undo();
      return { d, dist };
    });
    expect(auto).toEqual({ d: 150, dist: '0px' });
    await expectNoErrors(page);
  });
});
