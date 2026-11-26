import { expect, test } from '@playwright/test';

test('17.17 code drawers: the new pages and the home Collections open into code tabs and copy', async ({ page, context, browserName }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  if (browserName === 'chromium') await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  await page.goto('/showcase/springs.html');
  const drawers = page.locator('main article > details.mo-code');
  await expect(drawers).toHaveCount(10);
  const like = page.locator('details.mo-code[data-mo-code="spring-like"]');
  await like.locator('summary').click();
  await expect(like).toHaveAttribute('open', '');
  await like.getByRole('button', { name: 'React', exact: true }).click();
  await expect(like.locator('pre')).toContainText('export function Demo()');
  await expect(like.locator('pre')).toContainText('<mo-spring-like count="128" label="点赞"></mo-spring-like>');
  await like.getByRole('button', { name: 'HTML（免构建）', exact: true }).click();
  await expect(like.locator('pre')).toContainText('widgets.umd.js');
  await like.getByRole('button', { name: '复制代码', exact: true }).click();
  await expect(like.locator('.mo-code-copy')).toHaveAttribute('data-state', /ok|fail/);
  if (browserName === 'chromium') expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('<mo-spring-like count="128"');

  await page.goto('/showcase/micro.html');
  await expect(page.locator('main article > details.mo-code[data-mo-code="micro-switch"]')).toHaveCount(1);
  expect(await page.locator('main article > details.mo-code').count()).toBeGreaterThanOrEqual(15);

  await page.goto('/showcase/icons.html');
  await expect(page.locator('details.mo-code[data-mo-code="icon-picker"]')).toHaveCount(1);
  const icon = page.locator('details.mo-code[data-mo-code="icon"]');
  await icon.locator('summary').click();
  await page.locator('mo-icon-picker').getByRole('button', { name: '时间', exact: true }).click();
  await page.locator('mo-icon-picker').getByRole('button', { name: 'alarm', exact: true }).click();
  await expect(icon.locator('pre')).toContainText('<mo-icon name="alarm"');

  await page.goto('/showcase/looks.html');
  const look = page.locator('#stage > details.mo-code');
  await look.locator('summary').click();
  await look.getByRole('button', { name: 'CSS 变量', exact: true }).click();
  await expect(look.locator('pre')).toContainText('[data-mo-look="solid-indigo"]');
  await page.getByRole('button', { name: '试用 neon-ocean' }).click();
  await expect(look.locator('pre')).toContainText('[data-mo-look="neon-ocean"]');

  await page.goto('/showcase/index.html#collections-springs');
  const card = page.locator('#collections .col-panel:not([hidden]) .col-card[data-item="spring-like"]');
  const drawer = card.locator('details.mo-code');
  await drawer.locator('summary').click();
  await expect(drawer.locator('pre')).toContainText('mo-spring-like');
  await expect(drawer.getByRole('button', { name: /Vue/ })).toBeVisible();

  expect(errors).toEqual([]);
});
