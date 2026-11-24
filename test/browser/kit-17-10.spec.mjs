import { expect, test } from '@playwright/test';

test('17.10 UI blocks and components work by keyboard and pointer without page errors', async ({ page }, info) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/showcase/kit.html');

  const side = page.locator('mo-sidebar');
  await side.getByRole('button', { name: '收起侧栏' }).click();
  await expect(side.locator('nav')).toHaveAttribute('data-collapsed', '');
  await side.getByRole('button', { name: '展开侧栏' }).click();
  await side.getByRole('link', { name: '收件箱' }).click();
  await expect(side.getByRole('link', { name: '收件箱' })).toHaveAttribute('aria-current', 'page');

  const pricing = page.locator('mo-pricing').first();
  await pricing.getByLabel('年付').check();
  await expect(pricing.locator('.usa-price-num').nth(1)).toHaveText('680');

  const table = page.locator('mo-data-table');
  await table.getByRole('button', { name: '大小 (KB)' }).click();
  await expect(table.locator('tbody tr').first().locator('td').first()).toHaveText('切片转场');
  await table.getByRole('searchbox').fill('灯箱');
  await expect(table.locator('tbody tr:visible')).toHaveCount(1);

  const chips = page.locator('mo-filter-chips');
  await chips.getByRole('button', { name: '动效' }).click();
  await expect(page.locator('.chip-list li:visible')).toHaveCount(2);

  const spot = page.locator('mo-hotspots .usa-hot-dot').first();
  await spot.click();
  await expect(spot).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(spot).toHaveAttribute('aria-expanded', 'false');

  const fan = page.locator('mo-fan-carousel');
  await fan.evaluate((el) => el.next());
  await expect.poll(() => fan.evaluate((el) => el.index)).toBe(3);

  const tree = page.locator('mo-json-viewer [role="tree"]');
  await expect(tree).toHaveCount(1);
  await expect(page.locator('mo-json-viewer [role="treeitem"]').first()).toHaveAttribute('aria-expanded', 'true');

  await page.locator('mo-lightbox .usa-lb-thumb').first().click();
  await expect(page.locator('mo-lightbox dialog')).toHaveAttribute('open', '');
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => page.locator('mo-lightbox').evaluate((el) => el.index)).toBe(1);
  await page.keyboard.press('Escape');
  await expect(page.locator('mo-lightbox dialog')).not.toHaveAttribute('open', '');

  await page.screenshot({ path: info.outputPath('kit-17-10.png'), fullPage: true });
  expect(errors).toEqual([]);
});

test('17.10 motion surfaces run and settle without page errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/showcase/kit.html');

  const cut = page.locator('mo-cut-reveal');
  await cut.scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: '对半' }).click();
  await expect(page.locator('[data-log="cut"]')).toHaveText('done in', { timeout: 8000 });
  await expect(cut.locator('.usa-cut-piece')).toHaveCount(0);

  const loop = page.locator('mo-path-motion[trigger="loop"]');
  await loop.scrollIntoViewIfNeeded();
  const pause = loop.locator('.usa-path-pause');
  await pause.click();
  await expect(pause).toHaveAttribute('aria-pressed', 'true');

  await page.locator('mo-horizontal-scroll').scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 900);
  await expect(page.locator('mo-horizontal-scroll .usa-hscroll')).toHaveCount(1);

  expect(errors).toEqual([]);
});
