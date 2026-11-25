import { expect, test } from '@playwright/test';

const NEW = ['animals', 'music', 'gaming', 'transport', 'office', 'science', 'buildings', 'celebration', 'clothing', 'gestures'];

test('17.17 icons: ten new categories, searchable in Chinese, with a row on spring micro-interactions', async ({ page }, info) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/showcase/icons.html');

  for (const id of NEW) await expect(page.locator(`[data-cats] [data-category="${id}"] mo-icon`)).toHaveCount(25);

  const picker = page.locator('mo-icon-picker');
  const search = picker.getByRole('searchbox', { name: '搜索图标' });
  await search.fill('手势');
  await expect(picker.locator('.usa-ipick-count')).toHaveText('25 个图标');
  await search.fill('chess');
  await expect(picker.locator('.usa-ipick-btn:visible')).toHaveCount(4);
  await search.fill('');
  await picker.getByRole('button', { name: '动物', exact: true }).click();
  await expect(picker.locator('.usa-ipick-btn:visible')).toHaveCount(25);

  const row = page.locator('[data-spring-row]');
  await expect(row.locator('mo-micro')).toHaveCount(10);
  await expect(row.locator('mo-micro[feel="heavy"] mo-icon svg')).toHaveAttribute('data-name', 'castle');
  const cat = row.locator('button[data-spring="cat"]');
  await cat.scrollIntoViewIfNeeded();
  await cat.click();
  await expect(page.locator('[data-log="spring"]')).toHaveText('pop cat');
  await row.locator('button[data-spring="hand-wave"]').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-log="spring"]')).toHaveText('pop hand-wave');

  await page.screenshot({ path: info.outputPath('icons-17-17.png'), fullPage: true });
  expect(errors).toEqual([]);
});

test('17.17 the spring icon row still works under reduced motion', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/showcase/icons.html');
  await page.locator('[data-spring-row] button[data-spring="dice"]').click();
  await expect(page.locator('[data-log="spring"]')).toHaveText('pop dice');
  expect(errors).toEqual([]);
  await context.close();
});
