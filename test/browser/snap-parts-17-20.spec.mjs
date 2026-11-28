import { expect, test } from '@playwright/test';

test('17.20 snap parts work by keyboard and pointer without page errors', async ({ page, browserName }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/showcase/snap.html');
  const logOf = (name) => page.locator(`[data-log="${name}"]`);

  // ruler: a slider whose value and unit are read out; arrows move one step, Page Up ten
  const pick = page.locator('section[aria-label="刻度尺与拨盘"]');
  const ruler = pick.getByRole('slider', { name: '体重', exact: true });
  await expect(ruler).toHaveAttribute('aria-valuetext', '62.5 kg');
  await ruler.focus();
  await page.keyboard.press('ArrowRight');
  await expect(logOf('ruler')).toHaveText('选中 63 kg');
  await page.keyboard.press('PageUp');
  await expect(logOf('ruler')).toHaveText('选中 68 kg');
  await expect(ruler).toHaveAttribute('aria-valuetext', '68.0 kg');

  // dial: one detent per arrow key, End to the last option
  const dial = pick.getByRole('slider', { name: '尺码', exact: true });
  await dial.focus();
  await page.keyboard.press('ArrowRight');
  await expect(logOf('dial')).toHaveText('尺码 L');
  await page.keyboard.press('End');
  await expect(logOf('dial')).toHaveText('尺码 XXL');
  await expect(dial).toHaveAttribute('aria-valuetext', 'XXL');
  const lock = pick.getByRole('slider', { name: '密码第一位', exact: true });
  await lock.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(logOf('lock')).toHaveText('第一位：6');

  // grid: Space picks the first tile up, an arrow moves it and Space drops it
  const arrange = page.locator('section[aria-label="拖拽网格与悬浮头像"]');
  const grid = arrange.getByRole('list', { name: '应用', exact: true });
  await expect(grid.getByRole('listitem')).toHaveCount(8);
  await grid.getByRole('listitem').first().focus();
  await page.keyboard.press('Space');
  await expect(grid.locator('[role="status"]')).toHaveText('邮件 picked up, position 1 of 8.');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Space');
  await expect(logOf('grid')).toHaveText('第 1 个移到第 2 位：maps · mail · music · photos · notes · clock · camera · games');
  await expect(grid.getByRole('listitem').nth(1)).toHaveAttribute('data-item', '0');

  // chat head: a button that the arrow keys move between the sides and Delete dismisses
  const head = arrange.getByRole('button', { name: '和 Ada 聊天, 3 new', exact: true });
  await head.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(logOf('head')).toHaveText('停靠在左边');
  await page.keyboard.press('Delete');
  await expect(logOf('head')).toHaveText('已关闭');
  await arrange.getByRole('button', { name: '找回头像', exact: true }).click();
  await expect(logOf('head')).toHaveText('已找回');

  // tabs: a tab list with roving focus
  const swipe = page.locator('section[aria-label="滑动标签与挂牌"]');
  const tablist = swipe.getByRole('tablist', { name: '商品详情', exact: true });
  const specs = tablist.getByRole('tab', { name: '参数', exact: true });
  await specs.click();
  await expect(logOf('tabs')).toHaveText('当前：参数');
  // WebKit does not focus a button on click
  await specs.focus();
  await page.keyboard.press('ArrowRight');
  await expect(logOf('tabs')).toHaveText('当前：评价');
  await expect(tablist.getByRole('tab', { name: '评价', exact: true })).toBeFocused();
  await page.keyboard.press('End');
  await expect(logOf('tabs')).toHaveText('当前：问答');
  await expect(swipe.getByRole('tabpanel')).toHaveCount(1);

  // sign: a toggle button that turns over to its back face
  const sign = swipe.getByRole('button', { name: '店门挂牌', exact: true });
  await sign.focus();
  await page.keyboard.press('Enter');
  await expect(logOf('sign')).toHaveText('翻到背面：休息中');
  await expect(sign).toHaveAttribute('aria-pressed', 'true');
  // a push sets it swinging; Space (the sign may still be moving) turns it back
  await swipe.getByRole('button', { name: '推一下', exact: true }).click();
  await sign.focus();
  await page.keyboard.press('Space');
  await expect(logOf('sign')).toHaveText('翻到正面：营业中');
  await expect(sign).toHaveAttribute('aria-pressed', 'false');

  if (browserName === 'chromium') {
    // a drag to the left moves the ruler on to larger values
    await ruler.scrollIntoViewIfNeeded();
    const before = Number(await ruler.getAttribute('aria-valuenow'));
    const r = await ruler.boundingBox();
    await page.mouse.move(r.x + r.width / 2, r.y + r.height / 2);
    await page.mouse.down();
    await page.mouse.move(r.x + r.width / 2 - 120, r.y + r.height / 2, { steps: 8 });
    await page.mouse.up();
    await expect.poll(async () => Number(await ruler.getAttribute('aria-valuenow')), { timeout: 4000 }).toBeGreaterThan(before);

    // a chat head dragged to the right half docks on the right
    await head.scrollIntoViewIfNeeded();
    const frame = await arrange.locator('mo-chat-head .usa-chead').boundingBox();
    const h = await head.boundingBox();
    await page.mouse.move(h.x + h.width / 2, h.y + h.height / 2);
    await page.mouse.down();
    await page.mouse.move(frame.x + frame.width - 40, h.y + h.height / 2, { steps: 10 });
    await page.waitForTimeout(150);
    await page.mouse.up();
    await expect(logOf('head')).toHaveText('停靠在右边');
  }

  // every demo has a code drawer
  await expect(page.locator('details.mo-code[data-mo-code="chat-head"]')).toHaveCount(1);

  expect(errors).toEqual([]);
});
