import { expect, test } from '@playwright/test';

test('17.14 looks: the new palettes filter and the new treatments restyle the real widgets', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/showcase/looks.html');
  const tiles = page.locator('[data-grid] .tile');
  const stage = page.locator('#stage');
  const bar = stage.locator('mo-search-bar .usa-sbar');

  // a new palette: one look per treatment
  await page.getByRole('button', { name: '钴蓝' }).click();
  await expect(tiles).toHaveCount(17);
  await page.getByRole('button', { name: '试用 retro-cobalt' }).click();
  await expect(stage).toHaveAttribute('data-mo-look', 'retro-cobalt');
  await expect.poll(() => bar.evaluate((el) => getComputedStyle(el).borderTopStyle)).toBe('outset');
  await page.getByRole('button', { name: '试用 pill-cobalt' }).click();
  await expect.poll(() => bar.evaluate((el) => getComputedStyle(el).borderTopStyle)).toBe('solid');
  // Firefox snaps a 1.5px border to whole device pixels, so check the width token the look sets
  await expect.poll(() => bar.evaluate((el) => getComputedStyle(el).getPropertyValue('--mo-kit-border-width').trim())).toBe('1.5px');

  await page.getByRole('tab', { name: /组件/ }).click();
  await page.getByRole('button', { name: '极光' }).click();
  await expect(tiles).toHaveCount(17);
  await page.getByRole('button', { name: '试用 compact-aurora' }).click();
  await expect.poll(() => stage.locator('mo-split-pane .usa-split').evaluate((el) => getComputedStyle(el).borderTopLeftRadius)).toBe('4px');

  await page.getByRole('tab', { name: /动效/ }).click();
  await page.getByRole('button', { name: '全部配色' }).click();
  await page.getByRole('button', { name: '试用 nightvision-indigo' }).click();
  await expect.poll(() => stage.locator('mo-clothesline img').first().evaluate((el) => getComputedStyle(el).filter)).toContain('hue-rotate');
  expect(errors).toEqual([]);
});
