import { expect, test } from '@playwright/test';

test('moments and tactile widgets work by keyboard and pointer without page errors', async ({ page }, info) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/showcase/moments.html');

  const eclipse = page.locator('mo-eclipse-toggle').getByRole('switch');
  await eclipse.focus();
  await page.keyboard.press('Space');
  await expect(eclipse).toHaveAttribute('aria-checked', 'true');

  const stepper = page.locator('mo-squish-stepper');
  await stepper.getByRole('button', { name: 'Increase' }).click();
  await expect(stepper.locator('output')).toHaveText('3');

  const stick = page.locator('mo-analog-stick').getByRole('button');
  const box = await stick.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 120, box.y + box.height / 2, { steps: 6 });
  await expect.poll(() => page.locator('mo-analog-stick').evaluate((el) => el.x)).toBeGreaterThan(0.5);
  await page.mouse.up();
  await expect.poll(() => page.locator('mo-analog-stick').evaluate((el) => el.x)).toBe(0);

  const notch = page.locator('mo-notch-slider').getByRole('slider');
  await notch.focus();
  await page.keyboard.press('End');
  await expect.poll(() => page.locator('mo-notch-slider').evaluate((el) => el.value)).toBe(2);

  await page.locator('mo-transfer-button').first().getByRole('button').click();
  await expect(page.locator('mo-transfer-button').first().locator('.usa-transfer')).toHaveAttribute('data-state', /busy|done/);

  await page.screenshot({ path: info.outputPath('moments-tactile.png'), fullPage: true });
  expect(errors).toEqual([]);
});

test('style compare shows one component in six variants', async ({ page }) => {
  await page.goto('/showcase/styles.html');
  await expect(page.locator('#grid .panel')).toHaveCount(6);
  await page.getByRole('button', { name: '弹性步进器' }).click();
  await expect(page.locator('#grid mo-squish-stepper')).toHaveCount(6);
  await expect(page.locator('#grid .panel[data-usa-variant="neon"] pre')).toContainText('variant="neon"');
});
