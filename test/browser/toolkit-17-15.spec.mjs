import { expect, test } from '@playwright/test';

test('17.15 UI parts work by keyboard and pointer', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/showcase/toolkit.html');

  // radial menu: the toggle fans the buttons out, a pick closes it, Escape returns focus
  const menu = page.locator('mo-radial-menu');
  const toggle = menu.getByRole('button', { name: '分享' });
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(menu.getByRole('button', { name: '邮件' })).toBeVisible();
  await menu.getByRole('button', { name: '邮件' }).click();
  await expect(page.locator('[data-log="rmenu"]')).toHaveText('pick 2: 邮件');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.focus();
  await page.keyboard.press('ArrowUp');
  await expect(menu.getByRole('button', { name: '复制链接' })).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(menu.getByRole('button', { name: '邮件' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();

  // hover card: opens on hover, stays while the pointer is on the card
  const trigger = page.locator('mo-hover-card [data-trigger]');
  const card = page.locator('mo-hover-card [data-card]');
  await trigger.hover();
  await expect(card).toBeVisible();
  await card.hover();
  await page.waitForTimeout(400);
  await expect(card).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(card).toBeHidden();
  await page.mouse.move(0, 0);

  // toggle group: one pressed at a time
  const range = page.getByRole('group', { name: '时间范围' });
  await range.getByRole('button', { name: '月' }).click();
  await expect(range.getByRole('button', { name: '月' })).toHaveAttribute('aria-pressed', 'true');
  await expect(range.getByRole('button', { name: '周' })).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('[data-log="tgroup"]')).toHaveText('[month]');

  // time picker: arrows step by 15 minutes
  const remind = page.getByRole('group', { name: '提醒时间' });
  const minutes = remind.getByRole('spinbutton', { name: '分钟' });
  await minutes.focus();
  await page.keyboard.press('ArrowUp');
  await expect(minutes).toHaveText('45');
  await expect(page.locator('[data-log="time"]')).toHaveText('09:45');

  // colour swatches: a radio group
  const swatches = page.getByRole('radiogroup', { name: '颜色' });
  await swatches.getByRole('radio', { name: '海蓝' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(swatches.getByRole('radio', { name: '森林' })).toHaveAttribute('aria-checked', 'true');
  await expect(page.locator('[data-log="swatch"]')).toHaveText('森林 #16a34a');

  // calendar strip: pick a day, page to the next week
  const strip = page.locator('mo-calendar-strip');
  await strip.locator('[data-day="2026-03-13"]').click();
  await expect(page.locator('[data-log="cstrip"]')).toHaveText('2026-03-13');
  await strip.getByRole('button', { name: '下一周' }).click();
  await expect(strip.locator('.usa-cstrip-day').first()).toHaveAttribute('data-day', '2026-03-16');

  // comparison table: marks, a highlighted column, and only the rows that differ
  const table = page.locator('mo-comparison-table');
  await expect(table.locator('td[data-mark=yes]')).toHaveCount(9);
  await expect(table.locator('.usa-ctable-badge')).toHaveText('最受欢迎');
  await table.getByRole('button', { name: '只看差异' }).click();
  await expect(table.locator('tbody tr:visible')).toHaveCount(3);
  await expect(page.locator('[data-log="ctable"]')).toHaveText('hid 2 rows');

  expect(errors).toEqual([]);
});

test('17.15 charts draw in and report picks', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/showcase/toolkit.html#data');

  const bars = page.locator('mo-radial-bars');
  await bars.scrollIntoViewIfNeeded();
  await expect(bars.locator('.usa-rbars-arc')).toHaveCount(3);
  await bars.getByRole('button', { name: /^锻炼/ }).click();
  await expect(page.locator('[data-log="rbars"]')).toHaveText('ring 2: 38 / 30');

  const bullet = page.locator('mo-bullet-chart');
  await bullet.getByRole('button', { name: /^利润/ }).click();
  await expect(page.locator('[data-log="bullet"]')).toHaveText('2: 54 vs 70 ✗');

  const race = page.locator('mo-bar-race');
  await race.scrollIntoViewIfNeeded();
  const slider = race.getByRole('slider', { name: '年份' });
  await slider.fill('5');
  await expect(race.locator('.usa-race-frame')).toHaveText('2025');
  await expect(page.locator('[data-log="race"]')).toHaveText('2025: 重庆');
  await expect(race.locator('.usa-kit-sr')).toContainText('1. 重庆');

  const slope = page.locator('mo-slope-chart');
  await slope.getByRole('button', { name: /^Safari/ }).click();
  await expect(page.locator('[data-log="slope"]')).toHaveText('2: 25.7%');
  await expect(slope.locator('.usa-slope')).toHaveAttribute('data-focus', '');

  const dots = page.locator('mo-dot-plot');
  await dots.getByRole('button', { name: /^华北/ }).click();
  await expect(page.locator('[data-log="dots"]')).toHaveText('3: 58 → 69');

  expect(errors).toEqual([]);
});
