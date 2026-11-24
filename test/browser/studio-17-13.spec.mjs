import { expect, test } from '@playwright/test';

test('17.13 collaboration and input widgets work by keyboard and pointer', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/showcase/studio.html');

  // product tour: a dialog walks the steps, Escape ends it
  await page.getByRole('button', { name: '开始导览' }).click();
  const card = page.getByRole('dialog', { name: '搜索' });
  await expect(card).toBeVisible();
  await expect(card.locator('.usa-tour-count')).toHaveText('1 / 3');
  await card.getByRole('button', { name: '下一步' }).click();
  await expect(page.getByRole('dialog', { name: '外观' })).toBeVisible();
  await expect(page.locator('[data-log="tour"]')).toHaveText('step 2');
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-log="tour"]')).toHaveText('skipped');
  await expect(page.locator('.usa-tour-card')).toBeHidden();

  // signature pad: a drawn stroke counts
  const canvas = page.locator('mo-signature-pad canvas');
  await canvas.scrollIntoViewIfNeeded();
  const box = await canvas.boundingBox();
  await page.mouse.move(box.x + 30, box.y + box.height / 2);
  await page.mouse.down();
  for (let i = 1; i <= 8; i++) await page.mouse.move(box.x + 30 + i * 20, box.y + box.height / 2 + (i % 2 ? 12 : -12));
  await page.mouse.up();
  await expect(page.locator('[data-log="sign"]')).toHaveText('1 strokes');
  await page.locator('mo-signature-pad').getByRole('button', { name: '撤销' }).click();
  await expect(page.locator('[data-log="sign"]')).toHaveText('empty');

  // wheel picker: arrow keys move the wheel and the select follows
  const hour = page.getByRole('spinbutton', { name: '小时' });
  await hour.focus();
  await page.keyboard.press('ArrowDown');
  await expect(hour).toHaveAttribute('aria-valuetext', '09');
  await expect(page.locator('[data-log="wheel"]')).toHaveText('09:20');
  await expect(page.locator('mo-wheel-picker select').first()).toHaveValue('09');

  // mention input: @ opens matching people
  const ta = page.locator('mo-mention-input textarea');
  await ta.click();
  await ta.pressSequentially('你好 @林');
  await expect(page.locator('mo-mention-input [role="option"]')).toHaveCount(2);
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(ta).toHaveValue('你好 @林子轩 ');
  await expect(page.locator('[data-log="mention"]')).toHaveText('@林子轩');

  // emoji picker: search and pick into the field
  const emoji = page.locator('mo-emoji-picker');
  await emoji.locator('.usa-emoji-search').fill('pizza');
  await expect(emoji.locator('.usa-emoji-cell')).toHaveCount(1);
  await emoji.locator('.usa-emoji-cell').click();
  await expect(page.locator('#emoji-field')).toHaveValue('🍕');
  await expect(page.locator('[data-log="emoji"]')).toHaveText('🍕 pizza');

  // comment thread: like, fold and reply
  const thread = page.locator('mo-comment-thread');
  await thread.locator('.usa-cthread-like').first().click();
  await expect(page.locator('[data-log="thread"]')).toHaveText('like 1: 7');
  await thread.getByRole('button', { name: '收起回复' }).click();
  await expect(page.locator('[data-log="thread"]')).toHaveText('hide 1');
  await thread.getByRole('button', { name: '2 条回复' }).click();
  await thread.locator('.usa-cthread-reply').last().click();
  await thread.locator('.usa-cthread-field').fill('同意！');
  await thread.getByRole('button', { name: '发送' }).click();
  await expect(page.locator('[data-log="thread"]')).toHaveText('reply 4 (3 chars)');

  // diff viewer: switch to split
  const diff = page.locator('mo-diff-viewer');
  await expect(diff.locator('.usa-diff-line.del')).toHaveCount(3);
  await diff.getByRole('radio', { name: '并排' }).click();
  await expect(page.locator('[data-log="diff"]')).toHaveText('mode split');
  await expect(diff.locator('.usa-diff-table.split')).toBeVisible();

  expect(errors).toEqual([]);
});

test('17.13 charts and motion run without page errors', async ({ page }, info) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/showcase/studio.html');

  const plot = page.locator('mo-line-chart .usa-lchart-plot');
  await plot.scrollIntoViewIfNeeded();
  await expect(page.locator('mo-line-chart .usa-lchart-line')).toHaveCount(2);
  await plot.focus();
  await expect(page.locator('[data-log="line"]')).toHaveText('point 7');
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('[data-log="line"]')).toHaveText('point 6');
  await expect(page.locator('mo-line-chart .usa-lchart-tip')).toContainText('周六');
  await page.locator('mo-line-chart').getByRole('button', { name: '注册' }).click();
  await expect(page.locator('[data-log="line"]')).toHaveText('series 2 off');

  await page.locator('mo-funnel-chart .usa-funnel-bar').nth(1).click();
  await expect(page.locator('[data-log="funnel"]')).toHaveText('stage 2: 2600');

  const tile = page.locator('mo-treemap .usa-tmap-tile').first();
  await tile.focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-log="tmap"]')).toHaveText(/^tile \d: \d+$/);

  await page.locator('mo-gantt .usa-gantt-bar').first().click();
  await expect(page.locator('[data-log="gantt"]')).toHaveText('task 1');
  await expect(page.locator('mo-gantt .usa-gantt-today')).toBeAttached();

  await page.locator('mo-waffle-chart .usa-waffle-key').nth(1).click();
  await expect(page.locator('[data-log="waffle"]')).toHaveText('2: 33 cells');

  const flap = page.locator('mo-split-flap');
  await flap.scrollIntoViewIfNeeded();
  await expect(flap.locator('[aria-live]')).toHaveText('BOARDING');

  await page.locator('mo-scratch-card').getByRole('button', { name: '直接揭晓' }).click();
  await expect(page.locator('[data-log="scratch"]')).toHaveText('reveal by button');

  const book = page.locator('mo-page-flip');
  await book.getByRole('button', { name: '下一页' }).click();
  await expect(page.locator('[data-log="book"]')).toHaveText('page 2');
  await expect(book.getByRole('status')).toHaveText('第 2 页，共 3 页');

  const pixel = page.locator('mo-pixel-transition');
  await pixel.scrollIntoViewIfNeeded();
  await pixel.hover();
  await expect(page.locator('[data-log="pixel"]')).toHaveText('back', { timeout: 5000 });

  const lines = page.locator('mo-magnet-lines');
  await lines.scrollIntoViewIfNeeded();
  await lines.hover();
  await expect(lines.locator('.usa-mlines')).toHaveAttribute('data-live', '');

  await expect(page.locator('mo-circular-text textPath')).toContainText('向下滚动');
  await expect(page.locator('mo-text-pressure .usa-press-ch')).toHaveCount(6);

  const shuffle = page.locator('mo-shuffle-grid');
  await shuffle.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await expect(page.locator('[data-log="shuffle"]')).toHaveText(/^\d( \d){7}$/, { timeout: 10000 });

  await page.screenshot({ path: info.outputPath('studio-17-13.png'), fullPage: true });
  expect(errors).toEqual([]);
});
