import { expect, test } from '@playwright/test';

test('17.18 damped parts work by pointer and keyboard without page errors', async ({ page, browserName }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/showcase/damped.html');

  // collapse: a real button, opens on a spring and settles with no inline height left
  const expand = page.locator('section[aria-label="展开"]');
  const ask = expand.getByRole('button', { name: '连点会怎样？', exact: true });
  await expect(ask).toHaveAttribute('aria-expanded', 'false');
  await ask.click();
  await expect(ask).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('[data-log="collapse"]')).toHaveText('连点会怎样？：展开');
  const panel = page.locator(`#${await ask.getAttribute('aria-controls')}`);
  await expect(panel).toBeVisible();
  await expect(panel).not.toHaveAttribute('data-mo-expanding', '', { timeout: 4000 });
  expect(await panel.evaluate((el) => el.style.height)).toBe('');
  // a quick double toggle ends where the last click asked
  await ask.click();
  await ask.click();
  await expect(ask).toHaveAttribute('aria-expanded', 'true');
  await expect(panel).not.toHaveAttribute('data-mo-expanding', '', { timeout: 4000 });
  await expect(panel).toBeVisible();

  // read more: unfolds, then the clamp's inline height is gone
  const more = expand.getByRole('button', { name: '展开全文', exact: true });
  await more.click();
  await expect(page.locator('[data-log="more"]')).toHaveText('已展开全文');
  await expect(expand.getByRole('button', { name: '收起', exact: true })).toHaveAttribute('aria-expanded', 'true');
  await expect.poll(() => expand.locator('mo-read-more .usa-rmore-clip').evaluate((el) => el.style.height), { timeout: 4000 }).toBe('');

  // sheet: opens from its trigger, grabber steps and arrow keys, Escape returns focus
  const slide = page.locator('section[aria-label="抽屉与分页"]');
  const trigger = slide.getByRole('button', { name: '打开筛选', exact: true });
  await trigger.click();
  await expect(page.locator('[data-log="sheet"]')).toHaveText('停在第 1 个吸附点');
  const grab = slide.getByRole('button', { name: 'Resize sheet', exact: true });
  await expect(grab).toBeFocused();
  await page.keyboard.press('ArrowUp');
  await expect(page.locator('[data-log="sheet"]')).toHaveText('停在第 2 个吸附点');
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-log="sheet"]')).toHaveText('已关闭');
  await expect(trigger).toBeFocused();

  // pager: buttons and keys
  const pager = slide.getByRole('region', { name: '使用提示', exact: true });
  await pager.getByRole('button', { name: 'Next page', exact: true }).click();
  await expect(page.locator('[data-log="pager"]')).toHaveText('第 2 页');
  await pager.getByRole('button', { name: 'Page 4', exact: true }).click();
  await expect(page.locator('[data-log="pager"]')).toHaveText('第 4 页');
  await page.keyboard.press('Home');
  await expect(page.locator('[data-log="pager"]')).toHaveText('第 1 页');

  if (browserName === 'chromium') {
    // a drag of a little over a third of a page, released quickly, turns one page
    const view = pager.locator('.usa-dpager-view');
    await view.scrollIntoViewIfNeeded();
    const b = (await view.boundingBox());
    await page.mouse.move(b.x + b.width * 0.7, b.y + b.height / 2);
    await page.mouse.down();
    await page.mouse.move(b.x + b.width * 0.5, b.y + b.height / 2, { steps: 4 });
    await page.mouse.move(b.x + b.width * 0.3, b.y + b.height / 2, { steps: 4 });
    await page.mouse.up();
    await expect(page.locator('[data-log="pager"]')).toHaveText('第 2 页');
    // pulling the first page right only stretches, then springs back to page 1 of the drag
    await page.locator('mo-spring-pager').evaluate((el) => (el.index = 0));
    // the track slides back to page 1 first: a grab mid-slide would carry on from where it is
    const trackX = () => pager.locator('.usa-dpager-track').evaluate((el) => Math.round(new DOMMatrix(getComputedStyle(el).transform).m41));
    await expect.poll(trackX, { timeout: 4000 }).toBe(0);
    await page.mouse.move(b.x + b.width * 0.2, b.y + b.height / 2);
    await page.mouse.down();
    await page.mouse.move(b.x + b.width * 0.9, b.y + b.height / 2, { steps: 8 });
    const pulled = await pager.locator('.usa-dpager-track').evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41);
    expect(pulled).toBeGreaterThan(0);
    expect(pulled).toBeLessThan(b.width * 0.7);
    await page.mouse.up();
    await expect.poll(() => pager.locator('.usa-dpager-track').evaluate((el) => Math.round(new DOMMatrix(getComputedStyle(el).transform).m41)), { timeout: 4000 }).toBe(0);

    // the sheet follows a drag up to its top snap, and a flick down closes it
    await trigger.click();
    await expect(page.locator('[data-log="sheet"]')).toHaveText('停在第 1 个吸附点');
    await page.waitForTimeout(700);
    const g = await grab.boundingBox();
    await page.mouse.move(g.x + g.width / 2, g.y + g.height / 2);
    await page.mouse.down();
    await page.mouse.move(g.x + g.width / 2, g.y - 160, { steps: 10 });
    await page.mouse.up();
    await expect(page.locator('[data-log="sheet"]')).toHaveText('停在第 2 个吸附点');
    await page.waitForTimeout(700);
    const g2 = await grab.boundingBox();
    await page.mouse.move(g2.x + g2.width / 2, g2.y + g2.height / 2);
    await page.mouse.down();
    await page.mouse.move(g2.x + g2.width / 2, g2.y + 260, { steps: 3 });
    await page.mouse.up();
    await expect(page.locator('[data-log="sheet"]')).toHaveText('已关闭');
  }

  // elastic scroll: a wheel past the top stretches it and reports the edge
  const scroll = page.locator('section[aria-label="滚动与堆叠"]');
  const area = scroll.getByRole('region', { name: '弹性滚动示例', exact: true });
  await area.scrollIntoViewIfNeeded();
  await area.hover();
  await page.mouse.wheel(0, -600);
  await expect(page.locator('[data-log="edge"]')).toHaveText('拉过顶部：可以刷新了');

  // stack: the pile opens into a list and Escape gathers it back
  const toggle = scroll.getByRole('button', { name: '查看全部 (4)', exact: true });
  await toggle.click();
  await expect(page.locator('[data-log="stack"]')).toHaveText('已展开');
  await expect(scroll.locator('mo-spring-stack [role="listitem"][inert]')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-log="stack"]')).toHaveText('已收起');

  // every card has a code drawer
  await expect(page.locator('details.mo-code[data-mo-code="spring-sheet"]')).toHaveCount(1);

  expect(errors).toEqual([]);
});
