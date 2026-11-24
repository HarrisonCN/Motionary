import { expect, test } from '@playwright/test';

test('17.11 page blocks and interface parts work by keyboard and pointer without page errors', async ({ page }, info) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/showcase/blocks.html');

  const search = page.locator('nav mo-search-bar');
  await page.keyboard.press('/');
  await expect(search).toHaveAttribute('expanded', '');
  const field = search.locator('input');
  await expect(field).toBeFocused();
  await field.fill('分栏');
  await expect(search.getByRole('option')).toHaveText(['可调分栏']);
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(search).toHaveJSProperty('value', '可调分栏');

  const sub = page.locator('mo-subscribe');
  const email = sub.getByRole('textbox', { name: '邮箱地址' });
  await email.fill('not an address');
  await sub.getByRole('button', { name: '订阅' }).click();
  await expect(email).toHaveAttribute('aria-invalid', 'true');
  await email.fill('reader@example.com');
  await sub.getByRole('button', { name: '订阅' }).click();
  await expect(sub.getByRole('status')).toHaveText('已订阅，请查收邮件。');

  await page.locator('mo-download-button button').click();
  await expect(page.locator('[data-log="download"]')).toHaveText('done', { timeout: 8000 });

  const vlist = page.locator('mo-virtual-list');
  await expect.poll(() => vlist.locator('[role="list"] > li').count()).toBeLessThan(40);
  await expect(vlist.locator('[role="list"] > li').first()).toHaveAttribute('aria-posinset', '1');
  await vlist.getByRole('region', { name: '一万行' }).focus();
  await page.keyboard.press('End');
  await expect(vlist.locator('[role="list"] > li[aria-posinset="10000"]')).toHaveCount(1);

  const ctx = page.locator('mo-context-menu');
  await ctx.locator('.area').click({ button: 'right' });
  await expect(ctx.getByRole('menu')).toBeVisible();
  await ctx.getByRole('menuitem', { name: '删除' }).click();
  await expect(page.locator('[data-log="ctx"]')).toHaveText('select 删除');
  await expect(ctx.getByRole('menu')).toBeHidden();

  const bar = page.getByRole('separator', { name: '调整分栏' });
  await bar.focus();
  await page.keyboard.press('ArrowRight');
  await expect(bar).toHaveAttribute('aria-valuenow', '43');

  // Closing a window hands focus to the next one, so the log ends on that focus; check the window itself.
  const desk = page.locator('mo-desktop-windows');
  await desk.getByRole('button', { name: '关闭 便签' }).click();
  await expect(desk.locator('.usa-win').first()).toBeHidden();
  await expect(desk.locator('.usa-desk-task').first()).toHaveAttribute('aria-pressed', 'false');

  await page.locator('mo-stack-slider').getByRole('button', { name: '下一张' }).click();
  await expect(page.locator('[data-log="stack"]')).toHaveText('card 2');

  const morph = page.locator('mo-morph-card');
  await morph.locator('.usa-morph-open').click();
  await expect(morph.locator('dialog')).toHaveAttribute('open', '');
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-log="morph"]')).toHaveText('close', { timeout: 4000 });
  await expect(morph.locator('dialog')).not.toHaveAttribute('open', '');

  await page.screenshot({ path: info.outputPath('blocks-17-11.png'), fullPage: true });
  expect(errors).toEqual([]);
});

test('17.11 motion and depth surfaces run without page errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/showcase/blocks.html');

  // Near the viewport the list loads by itself and hides its button while loading, so press it only if it is there.
  const inf = page.locator('mo-infinite-scroll');
  await inf.scrollIntoViewIfNeeded();
  const more = inf.locator('.usa-inf-more');
  if (await more.isVisible()) await more.click({ timeout: 3000 }).catch(() => {});
  await expect(page.locator('[data-log="inf"]')).toHaveText(/load page \d/);

  const orbit = page.locator('mo-orbit-gallery');
  await orbit.scrollIntoViewIfNeeded();
  const pause = orbit.locator('.usa-kit-pause');
  if (await pause.isVisible()) {
    await pause.click();
    await expect(pause).toHaveAttribute('aria-pressed', 'true');
  }
  await orbit.locator('.usa-orbit-item[data-front]').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-log="orbit"]')).toHaveText(/front \d/);

  await page.locator('mo-scroll-bg section').nth(1).evaluate((el) => el.scrollIntoView({ block: 'start' }));
  await page.mouse.wheel(0, 40);
  await expect.poll(() => page.locator('mo-scroll-bg').evaluate((el) => el.index)).toBeGreaterThan(0);

  await page.locator('mo-image-tunnel').scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 600);
  await expect(page.locator('mo-image-tunnel .usa-tunnel-item')).toHaveCount(6);

  await page.locator('mo-reveal-footer').scrollIntoViewIfNeeded();
  await expect(page.locator('mo-reveal-footer footer')).toBeVisible();

  expect(errors).toEqual([]);
});
