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

test('17.9 UI moments respond by keyboard and pointer without page errors', async ({ page }, info) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/showcase/moments.html');

  await expect(page.locator('mo-six-dot-orbit .usa-loader-part')).toHaveCount(6);
  await expect(page.locator('mo-infinity-loop svg')).toHaveCount(1);

  const chips = page.locator('mo-chip-input');
  const field = chips.locator('input.usa-chips-input');
  await field.fill('新标签');
  await field.press('Enter');
  await expect(chips.locator('.usa-chip')).toHaveCount(3);
  await field.press('Backspace');
  await expect(chips.locator('.usa-chip')).toHaveCount(2);

  await page.locator('mo-cart-badge').getByRole('button', { name: '加入购物车' }).click();
  await expect(page.locator('mo-cart-badge .usa-cart-count')).toHaveText('3');

  const tada = page.locator('mo-tada-button button');
  await tada.click();
  await expect(tada).toHaveAttribute('aria-pressed', 'true');

  await page.locator('mo-plan-picker').getByText('团队').click();
  await expect.poll(() => page.locator('mo-plan-picker').evaluate((el) => el.value)).toBe('团队');

  await page.locator('mo-align-switch').getByRole('radio', { name: 'Align right' }).check();
  await expect(page.locator('mo-align-switch .usa-align')).toHaveAttribute('data-align', 'right');

  const slider = page.locator('mo-elastic-slider').getByRole('slider');
  await slider.focus();
  await page.keyboard.press('End');
  await expect(page.locator('mo-elastic-slider output')).toHaveText('32px');

  const code = page.locator('mo-code-shake .usa-code-box');
  await code.first().focus();
  await page.keyboard.type('1299');
  await expect(page.locator('mo-code-shake .usa-code')).toHaveAttribute('data-state', 'error');
  await expect.poll(() => page.locator('mo-code-shake').evaluate((el) => el.value)).toBe('');
  await page.keyboard.type('1234');
  await expect(page.locator('mo-code-shake .usa-code')).toHaveAttribute('data-state', 'ok');

  const pass = page.locator('mo-strength-meter input');
  await pass.fill('Tr0ub4dor&3xyz');
  await expect(page.locator('mo-strength-meter .usa-strength')).toHaveAttribute('data-score', '4');

  await page.locator('mo-step-track').getByRole('button', { name: 'Next step' }).click();
  await expect.poll(() => page.locator('mo-step-track').evaluate((el) => el.value)).toBe(3);

  const accord = page.locator('mo-elastic-accordion button');
  await accord.click();
  await expect(accord).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('mo-elastic-accordion .usa-accord-body')).toBeVisible();

  await page.locator('mo-squish-indicator .usa-pick-key').nth(2).click();
  await expect.poll(() => page.locator('mo-squish-indicator').evaluate((el) => el.value)).toBe('C');

  await page.screenshot({ path: info.outputPath('moments-ui.png'), fullPage: true });
  expect(errors).toEqual([]);
});

test('style compare shows one component in six variants', async ({ page }) => {
  await page.goto('/showcase/styles.html');
  await expect(page.locator('#grid .panel')).toHaveCount(6);
  await page.getByRole('button', { name: '弹性步进器' }).click();
  await expect(page.locator('#grid mo-squish-stepper')).toHaveCount(6);
  await expect(page.locator('#grid .panel[data-usa-variant="neon"] pre')).toContainText('variant="neon"');
});
