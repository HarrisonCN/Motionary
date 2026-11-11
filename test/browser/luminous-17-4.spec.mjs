import { expect, test } from '@playwright/test';
import { openFixture, expectNoErrors } from './helpers.mjs';

async function mount(page, reducedMotion = 'no-preference') {
  await openFixture(page, { reducedMotion });
  await page.evaluate(async () => {
    const { defineWidgets } = await import('motionary/components/widgets'); defineWidgets('17.4');
    document.querySelector('#stage').innerHTML = `<form>
      <mo-luminous-switch name="theme" label="Light theme"></mo-luminous-switch>
      <mo-particle-button toggle label="Favorite" active-icon="heart"></mo-particle-button>
      <mo-halo-segmented options="One,Two,Three" label="Mode"></mo-halo-segmented>
      <mo-halo-slider name="brightness" value="40" label="Brightness"></mo-halo-slider>
      <mo-orbit-progress value="65" label="Export progress"></mo-orbit-progress>
      <mo-particle-icon icon="moon" label="Night"></mo-particle-icon></form>`;
  });
}
test('luminous controls work with keyboard, rapid reversal, forms and RTL', async ({ page }) => {
  await mount(page);
  const sw = page.getByRole('switch', { name: 'Light theme' }); await sw.focus(); await sw.press('Space'); await expect(sw).toBeChecked();
  await sw.press('Enter'); await expect(sw).not.toBeChecked(); await sw.click(); await sw.click(); await sw.click(); await expect(sw).toBeChecked();
  await page.getByRole('button', { name: 'Favorite' }).press('Space'); await expect(page.getByRole('button', { name: 'Favorite' })).toHaveAttribute('aria-pressed', 'true');
  const one = page.getByRole('radio', { name: 'One', exact: true }); await one.press('ArrowRight'); await expect(page.getByRole('radio', { name: 'Two', exact: true })).toBeChecked();
  await page.locator('mo-halo-segmented').evaluate(el => el.dir = 'rtl'); await page.getByRole('radio', { name: 'Two', exact: true }).press('ArrowRight'); await expect(one).toBeChecked();
  await page.getByRole('slider', { name: 'Brightness' }).press('ArrowRight'); await expect(page.getByRole('slider')).toHaveValue('41');
  expect(await page.locator('form').evaluate(form => Object.fromEntries(new FormData(form)))).toEqual({ theme: 'on', brightness: '41' });
  await page.locator('form').evaluate(form => form.reset()); await expect(sw).not.toBeChecked(); await expect(page.getByRole('slider')).toHaveValue('40');
  await page.waitForTimeout(900);
  expect(await page.locator('#stage').evaluate(el => el.getAnimations({ subtree: true }).filter(a => a.playState === 'running').length)).toBe(0);
  expectNoErrors(page);
});
test('reduced motion has no particle flights and disconnect cancels flights', async ({ page }) => {
  await mount(page, 'reduce'); await page.getByRole('switch').click();
  expect(await page.locator('.usa-ls-thumb').evaluate(el => getComputedStyle(el, '::after').transitionDuration)).toBe('0s');
  expect(await page.locator('#stage').evaluate(el => el.getAnimations({ subtree: true }).length)).toBe(0);
  await page.emulateMedia({ reducedMotion: 'no-preference' }); await page.getByRole('switch').click();
  expect(await page.locator('mo-luminous-switch').evaluate(el => el.getAnimations({ subtree: true }).length)).toBeGreaterThan(0);
  expect(await page.locator('mo-luminous-switch').evaluate(el => { const all = el.getAnimations({ subtree: true }); el.remove(); return all.every(a => a.playState === 'idle'); })).toBe(true);
  expectNoErrors(page);
});
