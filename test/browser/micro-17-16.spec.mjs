import { expect, test } from '@playwright/test';

test('17.16 micro controls work by pointer and keyboard without page errors', async ({ page }, info) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/showcase/micro.html');
  const wifi = page.getByRole('switch', { name: '无线网络' });
  await expect(wifi).toHaveAttribute('aria-checked', 'true');
  await wifi.click();
  await expect(wifi).toHaveAttribute('aria-checked', 'false');
  await expect(page.locator('[data-log="switch"]')).toHaveText('无线网络: 关');
  await page.keyboard.press('Space');
  await expect(wifi).toHaveAttribute('aria-checked', 'true');

  const mixed = page.getByRole('checkbox', { name: '全选（部分已选）' });
  await expect(mixed).toHaveAttribute('aria-checked', 'mixed');
  await mixed.click();
  await expect(mixed).toHaveAttribute('aria-checked', 'true');

  const email = page.getByLabel('邮箱');
  await email.fill('not-an-email');
  await email.blur();
  await expect(email).toHaveAttribute('aria-invalid', 'true');
  await email.fill('me@example.com');
  await email.blur();
  await expect(email).toHaveAttribute('aria-invalid', 'false');

  const volume = page.getByRole('slider', { name: '音量' });
  await volume.focus();
  await page.keyboard.press('ArrowRight');
  await expect(volume).toHaveAttribute('aria-valuenow', '45');
  await page.keyboard.press('End');
  await expect(volume).toHaveAttribute('aria-valuenow', '100');

  const view = page.locator('mo-micro-segmented[label="视图"]');
  await view.getByRole('radio', { name: '日历' }).click();
  await expect(view.getByRole('radio', { name: '日历' })).toHaveAttribute('aria-checked', 'true');
  await page.keyboard.press('ArrowLeft');
  await expect(view.getByRole('radio', { name: '看板' })).toHaveAttribute('aria-checked', 'true');

  const guests = page.locator('mo-micro-stepper[label="人数"]');
  await guests.getByRole('button', { name: 'Increase 人数' }).click();
  await expect(guests.getByRole('spinbutton')).toHaveAttribute('aria-valuenow', '3');

  const save = page.locator('#save button');
  await save.click();
  await expect(save).toHaveAttribute('data-state', 'loading');
  await expect(save).toHaveAttribute('data-state', 'success', { timeout: 5000 });
  const fail = page.locator('#fail button');
  await fail.click();
  await expect(fail).toHaveAttribute('data-state', 'error', { timeout: 5000 });

  await page.screenshot({ path: info.outputPath('micro-17-16.png'), fullPage: true });
  expect(errors).toEqual([]);
});

test('17.16 springs press, drag and settle in a real browser', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/showcase/micro.html');

  const press = page.locator('mo-micro[fx="press"]');
  await press.scrollIntoViewIfNeeded();
  const box = await press.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await expect.poll(() => press.evaluate((el) => el.style.transform)).toContain('scale');
  await page.mouse.up();
  await expect(page.locator('[data-log="press"]')).toContainText('released');
  await expect.poll(() => press.evaluate((el) => el.style.transform), { timeout: 4000 }).toBe('');

  const chip = page.locator('.arena mo-micro');
  await chip.scrollIntoViewIfNeeded();
  await chip.focus();
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => chip.evaluate((el) => el.position.x), { timeout: 4000 }).toBe(40);
  const c = await chip.boundingBox();
  await page.mouse.move(c.x + c.width / 2, c.y + c.height / 2);
  await page.mouse.down();
  await page.mouse.move(c.x + c.width / 2 + 60, c.y + c.height / 2 + 10, { steps: 6 });
  await page.mouse.up();
  await expect(page.locator('[data-log="drag"]')).toContainText('x');

  await page.locator('#kinds button[data-kind="shake"]').click();
  await expect.poll(() => page.locator('#target').evaluate((el) => el.style.transform)).not.toBe('');
  await expect.poll(() => page.locator('#target').evaluate((el) => el.style.transform), { timeout: 4000 }).toBe('');

  await page.locator('#track').click();
  await expect.poll(() => page.locator('#ball').evaluate((el) => el.style.transform)).not.toBe('translateX(0.00px)');

  await expect(page.locator('#looksRow mo-micro-switch')).toHaveCount(3);
  expect(errors).toEqual([]);
});

test('17.16 reduced motion jumps instead of animating', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/showcase/micro.html');
  const wifi = page.getByRole('switch', { name: '无线网络' });
  await wifi.click();
  await expect(wifi).toHaveAttribute('aria-checked', 'false');
  await page.locator('#kinds button[data-kind="shake"]').click();
  await expect(page.locator('#target')).toHaveAttribute('data-mo-micro-flash', 'error');
  expect(await page.locator('#target').evaluate((el) => el.style.transform)).toBe('');
  expect(errors).toEqual([]);
  await context.close();
});
