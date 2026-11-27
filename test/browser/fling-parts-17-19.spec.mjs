import { expect, test } from '@playwright/test';

test('17.19 fling parts work by pointer and keyboard without page errors', async ({ page, browserName }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/showcase/fling.html');
  const logOf = (name) => page.locator(`[data-log="${name}"]`);

  // pip: the window is focusable and the arrow keys send it round the corners
  const float = page.locator('section[aria-label="小窗与灵动岛"]');
  const win = float.getByRole('group', { name: '正在播放', exact: true });
  await win.focus();
  await page.keyboard.press('ArrowUp');
  await expect(logOf('pip')).toHaveText('停靠在右上角');
  await page.keyboard.press('ArrowLeft');
  await expect(logOf('pip')).toHaveText('停靠在左上角');
  await expect(win).toHaveAttribute('data-corner', 'top-left');

  // island: the pill is a real button; Escape folds it back and returns focus to it
  const pill = float.getByRole('button', { name: '● 录音中 02:14', exact: true });
  await expect(pill).toHaveAttribute('aria-expanded', 'false');
  await pill.click();
  await expect(logOf('island')).toHaveText('已展开');
  await expect(float.locator('mo-spring-island .usa-island-close')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(logOf('island')).toHaveText('已收起');
  await expect(pill).toBeFocused();
  await float.getByRole('button', { name: '来一条消息', exact: true }).click();
  await expect(logOf('island')).toHaveText('来消息了');

  // peek: Enter lifts the preview into a modal dialog, Escape puts it back on the card
  const press = page.locator('section[aria-label="按住与滑动"]');
  const card = press.locator('mo-spring-peek .usa-peek-card');
  await card.focus();
  await page.keyboard.press('Enter');
  await expect(logOf('peek')).toHaveText('预览已打开');
  await expect(card).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('dialog', { name: '文章预览' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(logOf('peek')).toHaveText('预览已收起');
  await expect(card).toBeFocused();
  await expect(page.locator('mo-spring-peek dialog[open]')).toHaveCount(0, { timeout: 4000 });

  // slide to confirm: Enter on the knob confirms, the reset button brings it back
  const knob = press.getByRole('button', { name: '滑动支付 ¥128', exact: true });
  await knob.focus();
  await page.keyboard.press('Enter');
  await expect(logOf('slide')).toHaveText('已确认');
  await expect(press.locator('#pay [role="status"]')).toHaveText('已支付');
  await press.getByRole('button', { name: '重来', exact: true }).click();
  await expect(logOf('slide')).toHaveText('已重置');

  if (browserName === 'chromium') {
    // a short, slow drag springs back; a drag to the end confirms
    await knob.scrollIntoViewIfNeeded();
    const track = await press.locator('#pay .usa-slide').boundingBox();
    const k = await knob.boundingBox();
    await page.mouse.move(k.x + k.width / 2, k.y + k.height / 2);
    await page.mouse.down();
    await page.mouse.move(k.x + k.width / 2 + 40, k.y + k.height / 2, { steps: 6 });
    // a few slow moves let the release speed die down
    for (let i = 1; i <= 4; i++) {
      await page.waitForTimeout(200);
      await page.mouse.move(k.x + k.width / 2 + 40 + i, k.y + k.height / 2);
    }
    await page.mouse.up();
    await expect(logOf('slide')).toHaveText('已重置');
    await expect.poll(() => knob.evaluate((el) => Math.round(new DOMMatrix(getComputedStyle(el).transform).m41)), { timeout: 4000 }).toBe(0);
    await page.mouse.move(k.x + k.width / 2, k.y + k.height / 2);
    await page.mouse.down();
    await page.mouse.move(track.x + track.width - 4, k.y + k.height / 2, { steps: 12 });
    await page.mouse.up();
    await expect(logOf('slide')).toHaveText('已确认');
  }

  // scrollbar: scrolling to the end names the last section
  const scroll = page.locator('section[aria-label="滚动、跑马灯与弹簧链"]');
  const area = scroll.getByRole('region', { name: '阻尼滚动条示例', exact: true });
  await area.evaluate((el) => (el.scrollTop = el.scrollHeight));
  await expect(logOf('sbar')).toHaveText('当前小节：结尾');
  await area.evaluate((el) => (el.scrollTop = 0));
  await expect(logOf('sbar')).toHaveText('当前小节：开始');

  // marquee: a pause button, and copies that screen readers skip
  const marquee = scroll.locator('mo-fling-marquee');
  await marquee.getByRole('button', { name: 'Pause', exact: true }).click();
  await expect(logOf('marquee')).toHaveText('已暂停');
  await marquee.getByRole('button', { name: 'Play', exact: true }).click();
  await expect(logOf('marquee')).toHaveText('继续滚动');
  expect(await marquee.locator('.usa-fmq-run:not([aria-hidden])').count()).toBe(1);

  // chain: one circle per link, labelled as a picture
  await expect(scroll.getByRole('img', { name: '追着指针的弹簧链', exact: true }).locator('circle')).toHaveCount(16);

  // every demo has a code drawer
  await expect(page.locator('details.mo-code[data-mo-code="spring-pip"]')).toHaveCount(1);

  expect(errors).toEqual([]);
});
