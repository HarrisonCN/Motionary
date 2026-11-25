import { expect, test } from '@playwright/test';

test('17.17 spring parts work by pointer and keyboard without page errors', async ({ page }, info) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/showcase/springs.html');
  const taps = page.locator('section[aria-label="点按反馈"]');

  const like = taps.getByRole('button', { name: '点赞', exact: true });
  await expect(like).toHaveAttribute('aria-pressed', 'false');
  await like.click();
  await expect(like).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-log="like"]')).toHaveText('点赞: 已点亮 · 129');

  const rating = taps.getByRole('slider', { name: '评分', exact: true });
  await rating.focus();
  await page.keyboard.press('ArrowRight');
  await expect(rating).toHaveAttribute('aria-valuenow', '4');
  await page.keyboard.press('End');
  await expect(rating).toHaveAttribute('aria-valuenow', '5');
  await expect(taps.getByRole('img', { name: '平均评分: 4 of 5', exact: true })).toBeVisible();

  await taps.getByRole('button', { name: '空内容', exact: true }).click();
  await expect(page.locator('[data-log="copy"]')).toHaveText('复制失败');

  await page.locator('#countBtns button[data-d="37"]').click();
  await expect(page.locator('#count [role="status"] .usa-skit-sr')).toHaveText('销售额 ¥1,317');

  const tags = page.getByRole('textbox', { name: '标签', exact: true });
  await tags.fill('性能');
  await tags.press('Enter');
  await expect(page.locator('[data-log="tags"]')).toHaveText('设计 · 动效 · 无障碍 · 性能');
  await tags.fill('设计');
  await tags.press('Enter');
  await expect(page.locator('[data-log="tags"]')).toHaveText('重复：设计');
  await tags.fill('');
  await tags.press('Backspace');
  await tags.press('Backspace');
  await expect(page.locator('[data-log="tags"]')).toHaveText('设计 · 动效 · 无障碍');

  await page.locator('#codeFill').click();
  await expect(page.locator('#code [role="group"]')).toHaveAttribute('data-state', 'ok', { timeout: 4000 });
  await expect(page.locator('[data-log="code"]')).toHaveText('提交 246810');

  const list = page.locator('#list');
  const first = list.locator('.usa-slist-handle').first();
  await first.focus();
  await page.keyboard.press('Space');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Space');
  await expect(page.locator('[data-log="list"]')).toHaveText('第 1 项 → 第 2 位');
  await expect(list.locator('.usa-slist-text').first()).toHaveText('整理发布说明');
  await expect(list.locator('li[data-grabbed]')).toHaveCount(0);

  const swipe = page.locator('mo-spring-swipe').first();
  const more = swipe.getByRole('button', { name: 'More actions', exact: true });
  await more.click();
  await expect(more).toHaveAttribute('aria-expanded', 'true');
  await swipe.getByRole('button', { name: '归档', exact: true }).click();
  await expect(page.locator('[data-log="swipe"]')).toHaveText('点了：归档');
  await expect(more).toHaveAttribute('aria-expanded', 'false');

  const acc = page.locator('mo-spring-accordion');
  const second = acc.getByRole('button', { name: '减少动态效果时会怎样？', exact: true });
  await second.click();
  await expect(second).toHaveAttribute('aria-expanded', 'true');
  await expect(acc.getByRole('button', { name: '弹簧和缓动有什么区别？', exact: true })).toHaveAttribute('aria-expanded', 'false');
  await expect(acc.locator('.usa-sacc-panel[data-open]')).toHaveAttribute('data-rest', '', { timeout: 4000 });

  await page.locator('#toastBtns button[data-tone="success"]').click();
  await page.locator('#toastBtns button[data-tone="error"]').click();
  const items = page.locator('#toaster .usa-stoasts-item:not([aria-hidden])');
  await expect(items).toHaveCount(2);
  await expect(page.locator('#toaster [aria-live="assertive"]')).toHaveText('网络连接失败，请重试');
  await page.locator('#toastBtns button[data-clear]').click();
  await expect(items).toHaveCount(0);
  await expect(page.locator('[data-log="toast"]')).toContainText('clear');

  await expect(page.locator('#looksRow mo-spring-like')).toHaveCount(3);
  await page.screenshot({ path: info.outputPath('spring-parts-17-17.png'), fullPage: true });
  expect(errors).toEqual([]);
});

test('17.17 reduced motion jumps the spring parts to their end state', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/showcase/springs.html');
  const like = page.locator('section[aria-label="点按反馈"]').getByRole('button', { name: '点赞', exact: true });
  await like.click();
  await expect(like).toHaveAttribute('aria-pressed', 'true');
  expect(await like.locator('svg').first().evaluate((el) => el.style.transform)).toBe('scale(1)');
  const acc = page.locator('mo-spring-accordion');
  await acc.getByRole('button', { name: '减少动态效果时会怎样？', exact: true }).click();
  await expect(acc.locator('.usa-sacc-panel[data-open]')).toHaveAttribute('data-rest', '');
  expect(errors).toEqual([]);
  await context.close();
});
