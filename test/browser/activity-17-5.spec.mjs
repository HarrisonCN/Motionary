import { expect, test } from '@playwright/test';
import { openFixture, expectNoErrors } from './helpers.mjs';

async function mount(page, reducedMotion = 'no-preference') {
  await openFixture(page, { reducedMotion });
  await page.evaluate(async () => {
    const { defineWidgets } = await import('motionary/components/widgets'); defineWidgets('17.5');
    document.querySelector('#stage').innerHTML = '<mo-activity-wall style="height:400px"><div data-column><mo-coffee-timer value="18" duration="60"></mo-coffee-timer><mo-workout-player></mo-workout-player></div><div data-column><mo-vital-wave animated></mo-vital-wave><mo-delivery-tracker></mo-delivery-tracker><mo-meter-countdown value="2"></mo-meter-countdown></div></mo-activity-wall>';
  });
}
test('activity actions work with keyboard, preserve focus on clock updates and honour disabled', async ({ page }) => {
  await mount(page);
  const start = page.getByRole('button', { name: 'Start timer', exact: true }); await start.focus(); await start.press('Space');
  const stop = page.getByRole('button', { name: 'Stop timer', exact: true }); await expect(stop).toBeFocused();
  await expect.poll(() => page.locator('mo-coffee-timer').evaluate(el => el.value)).toBeGreaterThan(18); await expect(stop).toBeFocused();
  await stop.press('Enter'); await expect(page.getByRole('button', { name: 'Start timer', exact: true })).toBeFocused();
  await page.locator('mo-delivery-tracker').evaluate(el => el.setAttribute('disabled', ''));
  await expect(page.getByRole('button', { name: 'Call driver', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Resume workout' }).press('Space'); await expect(page.getByRole('button', { name: 'Pause workout' })).toBeFocused();
  await page.getByRole('button', { name: 'Reset workout' }).press('Enter'); await expect(page.getByRole('button', { name: 'Resume workout' })).toBeVisible();
  expectNoErrors(page);
});
test('reduced motion removes CSS loops and disconnected clocks stop', async ({ page }) => {
  await mount(page, 'reduce');
  expect(await page.locator('#stage').evaluate(el => el.getAnimations({ subtree: true }).filter(a => a.playState === 'running').length)).toBe(0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('mo-vital-wave')).toHaveAttribute('data-activity-animate', '');
  expect(await page.locator('mo-vital-wave .usa-ac-dot-column circle').evaluateAll(nodes => nodes.every(el => { const m = new DOMMatrix(getComputedStyle(el).transform); return Math.abs(m.a - 1) < .001 && Math.abs(m.d - 1) < .001; }))).toBe(true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => page.locator('#stage').evaluate(el => el.getAnimations({ subtree: true }).filter(a => a.playState === 'running').length)).toBe(0);
  await page.locator('mo-meter-countdown').evaluate(el => { el.play(); window.detachedMeter = el; el.remove(); });
  await page.waitForTimeout(1100); expect(await page.evaluate(() => window.detachedMeter.value)).toBe(2);
  expectNoErrors(page);
});
