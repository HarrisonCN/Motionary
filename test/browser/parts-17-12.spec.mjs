import { expect, test } from '@playwright/test';

test('17.12 parts work by keyboard and pointer without page errors', async ({ page }, info) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/showcase/parts.html');

  const ptabs = page.locator('mo-progress-tabs');
  const first = ptabs.getByRole('tab').first();
  await first.focus();
  await page.keyboard.press('ArrowRight');
  await expect(ptabs.getByRole('tab').nth(1)).toHaveAttribute('aria-selected', 'true');
  await expect(ptabs.getByRole('tab').nth(1)).toBeFocused();
  await expect(page.locator('[data-log="ptabs"]')).toHaveText('tab 2');

  const code = page.locator('mo-code-tabs');
  await code.first().getByRole('tab', { name: 'pnpm' }).click();
  await expect(code.nth(1).getByRole('tab', { name: 'pnpm' })).toHaveAttribute('aria-selected', 'true');

  const vote = page.locator('mo-helpful-vote');
  await vote.getByRole('button', { name: '没有' }).click();
  await vote.getByRole('textbox').fill('更多例子');
  await vote.getByRole('button', { name: '发送' }).click();
  await expect(vote.getByRole('status')).toHaveText('谢谢反馈！');
  await expect(page.locator('[data-log="vote"]')).toHaveText('feedback no (4 chars)');

  const share = page.locator('mo-share-button');
  await share.getByRole('button', { name: '分享' }).click();
  await expect(share.locator('.usa-share-main')).toHaveAttribute('aria-expanded', 'true');
  await expect(share.getByRole('link', { name: 'X' })).toHaveAttribute('href', /x\.com\/intent\/post/);
  await page.keyboard.press('Escape');
  await expect(share.locator('.usa-share-main')).toHaveAttribute('aria-expanded', 'false');

  const edit = page.locator('mo-inline-edit');
  await edit.locator('.usa-iedit-show').click();
  const field = edit.getByRole('textbox', { name: '项目名称' });
  await expect(field).toBeFocused();
  await field.fill('新项目');
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-log="edit"]')).toHaveText('“未命名项目” → “新项目”');

  const sort = page.locator('mo-sortable-list');
  await sort.locator('.usa-sort-grip').first().focus();
  await page.keyboard.press('Space');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Space');
  await expect(page.locator('[data-log="sort"]')).toHaveText('1 → 2');
  await expect(sort.locator('li').first()).toHaveText('开发');

  const check = page.locator('mo-checklist');
  for (const box of await check.getByRole('checkbox').all()) await box.check();
  await expect(page.locator('[data-log="check"]')).toHaveText('complete');
  await expect(check.locator('.usa-check-title')).toHaveText('全部完成！');

  const heat = page.locator('mo-heatmap');
  await heat.scrollIntoViewIfNeeded();
  await heat.locator('[role="gridcell"][tabindex="0"]').focus();
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-log="heat"]')).toHaveText(/^day \d+: \d+$/);

  const donut = page.locator('mo-donut-chart');
  await donut.getByRole('button', { name: /搜索/ }).click();
  await expect(page.locator('[data-log="donut"]')).toHaveText('slice 2: 28');

  const lens = page.locator('mo-zoom-lens .usa-lens');
  await lens.focus();
  await page.keyboard.press('+');
  await expect(page.locator('[data-log="zoom"]')).toHaveText('zoom ×3.5');

  await page.screenshot({ path: info.outputPath('parts-17-12.png'), fullPage: true });
  expect(errors).toEqual([]);
});

test('17.12 motion surfaces run without page errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/showcase/parts.html');

  const beam = page.locator('mo-connect-beam');
  await beam.scrollIntoViewIfNeeded();
  await expect(beam.locator('.usa-beam-line')).toHaveCount(4);
  await expect.poll(() => beam.locator('.usa-beam-line').first().getAttribute('d')).toMatch(/^M[\d.]+,[\d.]+ Q/);

  await expect(page.locator('mo-meteors .usa-meteor')).toHaveCount(18);
  await expect(page.locator('mo-orbit-rings .usa-rings-orbit')).toHaveCount(2);
  await expect(page.locator('mo-letter-swap .usa-swap-cell').first()).toBeAttached();

  const ripple = page.locator('mo-ripple-grid .usa-ripple');
  await ripple.scrollIntoViewIfNeeded();
  await ripple.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-log="ripple"]')).toHaveText(/^ripple \d+, \d+$/);
  expect(errors).toEqual([]);
});

test('the home page shows the release pages as live collections', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/showcase/index.html');

  const section = page.locator('#collections');
  await section.scrollIntoViewIfNeeded();
  // only the section's own tabs: the demos inside the panels have tablists too
  const tabs = section.locator('.col-tabs').getByRole('tab');
  await expect(tabs).toHaveCount(16);
  await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');
  // 17.19: the newest tab (fling parts) comes first
  await expect(section.locator('.col-panel:not([hidden]) .col-open')).toHaveAttribute('href', './fling.html');
  await expect(section.locator('.col-panel:not([hidden]) mo-slide-confirm .usa-slide-knob').first()).toBeAttached({ timeout: 15000 });

  await tabs.nth(1).click();
  await expect(section.locator('.col-panel:not([hidden]) .col-open')).toHaveAttribute('href', './damped.html');
  await expect(section.locator('.col-panel:not([hidden]) mo-spring-collapse .usa-dcol-head').first()).toBeAttached({ timeout: 15000 });

  await tabs.nth(2).click();
  await expect(section.locator('.col-panel:not([hidden]) .col-open')).toHaveAttribute('href', './springs.html');
  await expect(section.locator('.col-panel:not([hidden]) mo-spring-rating [role="slider"]').first()).toBeAttached({ timeout: 15000 });

  await tabs.nth(3).click();
  await expect(section.locator('.col-panel:not([hidden]) .col-open')).toHaveAttribute('href', './micro.html');
  await expect(section.locator('.col-panel:not([hidden]) mo-micro-switch [role="switch"]').first()).toBeAttached({ timeout: 15000 });

  await tabs.nth(4).click();
  await expect(section.locator('.col-panel:not([hidden]) .col-open')).toHaveAttribute('href', './toolkit.html');
  await expect(section.locator('.col-panel:not([hidden]) mo-bar-race .usa-race-row').first()).toBeAttached({ timeout: 15000 });

  await tabs.nth(5).click();
  await expect(section.locator('.col-panel:not([hidden]) .col-open')).toHaveAttribute('href', './icons.html');
  await expect(section.locator('.col-panel:not([hidden]) mo-icon-picker .usa-ipick-btn').first()).toBeAttached({ timeout: 15000 });

  await tabs.nth(6).click();
  await expect(section.locator('.col-panel:not([hidden]) .col-open')).toHaveAttribute('href', './studio.html');
  await expect(section.locator('.col-panel:not([hidden]) mo-line-chart .usa-lchart-svg')).toBeAttached({ timeout: 15000 });

  await tabs.nth(7).click();
  const open = section.locator('.col-panel:not([hidden])');
  await expect(open.locator('mo-progress-tabs [role="tablist"]')).toBeAttached({ timeout: 15000 });
  await expect(open.locator('.col-open')).toHaveAttribute('href', './parts.html');

  await tabs.nth(7).focus();
  await page.keyboard.press('ArrowRight');
  await expect(tabs.nth(8)).toHaveAttribute('aria-selected', 'true');
  await expect(section.locator('.col-panel:not([hidden]) mo-download-button button')).toBeVisible({ timeout: 15000 });
  // the store's own "/" search keeps its key: demo search bars on this page have no shortcut
  await expect(section.locator('.col-panel:not([hidden]) mo-search-bar')).toHaveAttribute('shortcut', 'none');

  await tabs.nth(9).click();
  await expect(section.locator('.col-panel:not([hidden]) .col-look')).toHaveCount(16, { timeout: 15000 });

  await page.locator('#lang-toggle').click();
  await expect(tabs.first()).toContainText('甩动回弹');
  await expect(tabs.nth(1)).toContainText('阻尼部件');
  await expect(tabs.nth(2)).toContainText('弹簧部件');
  await expect(tabs.nth(3)).toContainText('微交互');
  await expect(tabs.nth(4)).toContainText('17.15 新品');
  await expect(tabs.nth(5)).toContainText('753 个图标');

  await page.goto('/showcase/index.html#collections-luminous');
  await expect(page.locator('#collections .col-tabs').getByRole('tab', { name: /Luminous|发光控件/ })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#collections .col-panel:not([hidden]) mo-luminous-switch')).toBeAttached({ timeout: 15000 });

  expect(errors).toEqual([]);
});
