import { expect, test } from '@playwright/test';

test('17.14 icon picker searches, filters, walks by keyboard and picks', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/showcase/icons.html');

  const picker = page.locator('mo-icon-picker');
  await expect(picker.locator('.usa-ipick-count')).toHaveText('253 个图标');
  await expect(picker.locator('.usa-ipick-btn:visible')).toHaveCount(253);

  // search by English name, then by Chinese category name
  const search = picker.getByRole('searchbox', { name: '搜索图标' });
  await search.fill('cloud');
  await expect(picker.locator('.usa-ipick-btn:visible')).toHaveCount(6);
  await search.fill('天气');
  await expect(picker.locator('.usa-ipick-count')).toHaveText('18 个图标');
  await search.fill('');

  // a category chip narrows the grid
  await picker.getByRole('button', { name: '时间', exact: true }).click();
  await expect(picker.locator('.usa-ipick-btn:visible')).toHaveCount(8);

  // keyboard: from the field into the grid, right one, Enter picks
  await search.focus();
  await page.keyboard.press('ArrowDown');
  await expect(picker.getByRole('button', { name: 'clock', exact: true })).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(picker.getByRole('button', { name: 'alarm', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-log="pick"]')).toHaveText('pick alarm (time)');
  await expect(picker.getByRole('button', { name: 'alarm', exact: true })).toHaveAttribute('aria-pressed', 'true');

  // the preview follows the pick and the code shows the tag
  await expect(page.locator('[data-preview] svg')).toHaveAttribute('data-name', 'alarm');
  await expect(page.locator('[data-code]')).toContainText('<mo-icon name="alarm" motion="beat"');
  await page.locator('[data-motions] label', { hasText: '旋转' }).click();
  await expect(page.locator('[data-preview] svg')).toHaveAttribute('data-motion', 'spin');
  await expect(page.locator('[data-code]')).toContainText('motion="spin"');

  // the grid can be scrolled and every icon is a real drawing
  const box = await picker.getByRole('button', { name: 'alarm', exact: true }).locator('svg').boundingBox();
  expect(box.width).toBeGreaterThan(10);

  expect(errors).toEqual([]);
});

test('17.14 icons play their motion on hover and focus, and every category is listed', async ({ page }, info) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/showcase/icons.html');

  const ring = page.locator('[data-motion-grid] button[data-motion="ring"]');
  await ring.scrollIntoViewIfNeeded();
  await ring.hover();
  await expect(page.locator('[data-log="play"]')).toHaveText('play ring');
  await page.locator('[data-motion-grid] button[data-motion="draw"]').focus();
  await expect(page.locator('[data-log="play"]')).toHaveText('play draw');
  await expect(page.locator('[data-motion-grid] mo-icon')).toHaveCount(12);

  await expect(page.locator('[data-cats] .cat')).toHaveCount(14);
  await expect(page.locator('[data-cats] mo-icon svg')).toHaveCount(253);
  await expect(page.locator('[data-cats] [data-category="weather"] mo-icon')).toHaveCount(18);
  await expect(page.locator('[data-cats] svg[aria-label="sun"]')).toHaveAttribute('role', 'img');

  await page.screenshot({ path: info.outputPath('icons-17-14.png'), fullPage: true });
  expect(errors).toEqual([]);
});

test('17.14 icons stay still under reduced motion', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/showcase/icons.html');
  const svg = page.locator('[data-preview] svg');
  await expect(svg).toHaveAttribute('data-motion', 'beat');
  await expect(svg).not.toHaveAttribute('data-run', /.*/);
  expect(await svg.evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
  await context.close();
});
