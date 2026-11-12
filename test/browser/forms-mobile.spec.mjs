import { expect, test } from '@playwright/test';
import { openFixture, expectNoErrors } from './helpers.mjs';
test('form controls stay inside phone width, accept touch choices and return dialog focus', async ({ page }) => {
  await openFixture(page);
  await page.evaluate(async () => { const { defineWidgets } = await import('motionary/components/widgets'); defineWidgets('17.7'); document.getElementById('stage').innerHTML = '<form style="max-width:100%"><mo-number-stepper label="Quantity" value="2"></mo-number-stepper><mo-combobox label="Collection"></mo-combobox><mo-cta-popup label="Review" action-label="Confirm"></mo-cta-popup></form>'; document.querySelector('mo-combobox').options = [{ value: 'photo', label: 'Photography' }, { value: 'film', label: 'Film' }]; });
  await page.getByRole('button', { name: 'Increase', exact: true }).tap(); await expect(page.getByRole('spinbutton')).toHaveValue('3');
  await page.getByRole('combobox', { name: 'Collection' }).tap(); await page.getByRole('option', { name: 'Film', exact: true }).tap(); await expect(page.getByRole('combobox')).toHaveValue('Film');
  const trigger = page.getByRole('button', { name: 'Review', exact: true }); await trigger.tap(); await expect(page.getByRole('dialog')).toBeVisible(); await page.getByRole('button', { name: 'Not now' }).tap(); await expect(page.getByRole('dialog')).not.toBeVisible(); await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true); expectNoErrors(page);
});
