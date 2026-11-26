import { expect, test } from '@playwright/test';

// Three pages, one test each: the components gallery is heavy, and in WebKit one test for all three ran past the timeout.
const watchErrors = (page) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  return errors;
};

test('17.18 damped motion: code drawers spring open and closed and a quick double toggle ends where the last click asked', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('/showcase/springs.html');
  await expect(page.locator('html[data-mo-damped]')).toHaveCount(1);
  const like = page.locator('details.mo-code[data-mo-code="spring-like"]');
  const summary = like.locator('summary');
  await summary.click();
  await expect(like).toHaveAttribute('open', '');
  await expect(like).toHaveAttribute('data-mo-expanding', '');
  await expect(like).not.toHaveAttribute('data-mo-expanding', '', { timeout: 4000 });
  await expect(like.locator('pre')).toContainText('mo-spring-like');
  expect(await like.evaluate((el) => el.style.height)).toBe('');
  // closing keeps it open until the motion has settled
  await summary.click();
  await expect(like).toHaveAttribute('open', '');
  await expect(like).not.toHaveAttribute('open', '', { timeout: 4000 });
  // a quick double toggle ends where the last click asked
  await summary.click();
  await summary.click();
  await summary.click();
  await expect(like).not.toHaveAttribute('data-mo-expanding', '', { timeout: 4000 });
  await expect(like).toHaveAttribute('open', '');
  expect(errors).toEqual([]);
});

test('17.18 damped motion: the gallery code box opens and closes on the spring', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('/showcase/components.html');
  const card = page.locator('article.ccard').first();
  await card.scrollIntoViewIfNeeded();
  const btn = card.locator('.code-btn');
  const box = card.locator('.ccard-code');
  await btn.click();
  await expect(btn).toHaveAttribute('aria-expanded', 'true');
  await expect(box, errors.join('\n')).toBeVisible();
  await expect(box.locator('pre')).not.toBeEmpty();
  await btn.click();
  await expect(btn).toHaveAttribute('aria-expanded', 'false');
  await expect(box).toBeHidden({ timeout: 4000 });
  expect(errors).toEqual([]);
});

test('17.18 damped motion: the detail sheet springs back from a short pull and closes on a long one', async ({ page, browserName }) => {
  const errors = watchErrors(page);
  // pointer drags on the sheet are checked in Chromium, as before
  if (browserName === 'chromium') {
    await page.goto('/showcase/index.html#stagger');
    const sheet = page.locator('#detail-sheet');
    await expect(page.locator('#detail')).toBeVisible();
    const head = sheet.locator('.detail-head');
    await expect(head).toBeVisible();
    const b = await head.boundingBox();
    // a short pull springs back
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
    await page.mouse.down();
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2 + 40, { steps: 6 });
    await page.mouse.up();
    await page.waitForTimeout(900);
    await expect(page.locator('#detail')).toBeVisible();
    // a long pull closes it
    const b2 = await head.boundingBox();
    await page.mouse.move(b2.x + b2.width / 2, b2.y + b2.height / 2);
    await page.mouse.down();
    await page.mouse.move(b2.x + b2.width / 2, b2.y + b2.height / 2 + 520, { steps: 12 });
    await page.mouse.up();
    await expect(page.locator('#detail')).toBeHidden({ timeout: 4000 });
  }

  expect(errors).toEqual([]);
});
