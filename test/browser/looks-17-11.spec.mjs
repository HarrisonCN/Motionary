import { expect, test } from '@playwright/test';

test('17.11 looks page shows 510 looks per family (17.15) and restyles the real widgets', async ({ page }, info) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/showcase/looks.html');

  const tiles = page.locator('[data-grid] .tile');
  const stage = page.locator('#stage');
  await expect(tiles).toHaveCount(510);
  await expect(page.locator('[data-count="ui"]')).toHaveText('(510)');
  await expect(stage).toHaveAttribute('data-mo-look', 'solid-indigo');

  const sub = stage.locator('mo-subscribe .usa-sub-btn');
  const before = await sub.evaluate((el) => getComputedStyle(el).backgroundColor);
  await page.getByRole('button', { name: '试用 neon-ocean' }).click();
  await expect(stage).toHaveAttribute('data-mo-look', 'neon-ocean');
  await expect.poll(() => sub.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(before);
  await expect.poll(() => stage.locator('mo-search-bar .usa-sbar').evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe('none');

  await page.getByRole('button', { name: '试用 brutal-amber' }).click();
  await expect.poll(() => stage.locator('mo-search-bar .usa-sbar').evaluate((el) => getComputedStyle(el).borderTopWidth)).toBe('3px');

  await page.getByRole('tab', { name: /组件/ }).click();
  await expect(tiles).toHaveCount(510);
  await expect(stage).toHaveAttribute('data-mo-look', 'flat-indigo');
  await expect(stage.locator('mo-split-pane')).toBeVisible();
  await page.getByRole('button', { name: '试用 cyber-grape' }).click();
  await expect.poll(() => stage.locator('mo-split-pane .usa-split').evaluate((el) => getComputedStyle(el).borderTopLeftRadius)).toBe('2px');

  await page.getByRole('tab', { name: /动效/ }).click();
  await page.getByRole('button', { name: '琥珀' }).click();
  await expect(tiles).toHaveCount(17);
  await page.getByRole('button', { name: '试用 noir-amber' }).click();
  await expect.poll(() => stage.locator('mo-clothesline img').first().evaluate((el) => getComputedStyle(el).filter)).toContain('grayscale');

  await page.screenshot({ path: info.outputPath('looks-17-11.png'), fullPage: true });
  expect(errors).toEqual([]);
});
