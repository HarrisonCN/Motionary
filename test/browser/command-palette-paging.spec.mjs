import { test, expect } from '@playwright/test';
import { define, openFixture, mount, expectNoErrors } from './helpers.mjs';

test('an inline palette measures its first highlight without scrolling the page, then pages through results', async ({ page }) => {
  await openFixture(page, { reducedMotion: 'reduce' });
  await define(page, 'usa-command-palette');
  const options = Array.from({ length: 40 }, (_, i) => '<option>Command ' + i + '</option>').join('');
  await mount(page, '<div style="height:200vh"></div><usa-command-palette inline hotkey="none">' + options + '</usa-command-palette>');
  expect(await page.evaluate(() => scrollY)).toBe(0);
  const selected = page.locator('[role=option][aria-selected=true]');
  const input = page.getByRole('combobox');
  const row = await selected.boundingBox();
  const highlight = await page.locator('.usa-cp-hl').boundingBox();
  expect(highlight.y).toBeCloseTo(row.y, 0);
  expect(highlight.height).toBeCloseTo(row.height, 0);
  await input.press('PageDown');
  const index = Number(await selected.getAttribute('data-i'));
  expect(index).toBeGreaterThan(1);
  expect(index).toBeLessThan(39);
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute('aria-activedescendant', await selected.getAttribute('id'));
  await input.press('PageUp');
  await expect(selected).toHaveAttribute('data-i', '0');
  expectNoErrors(page);
});

test('reversing a native dialog exit preserves focus and composition does not activate a command', async ({ page }) => {
  await openFixture(page);
  await define(page, 'usa-command-palette');
  await mount(page, '<button id="opener">Open</button><usa-command-palette><option>摄影</option></usa-command-palette>');
  const opener = page.locator('#opener');
  await opener.focus();
  await page.evaluate(async () => {
    const p = document.querySelector('usa-command-palette');
    window.paletteEvents = [];
    for (const type of ['usa:close', 'usa:run']) p.addEventListener(type, () => window.paletteEvents.push(type));
    p.show();
    const input = p.querySelector('input');
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', isComposing: true, bubbles: true }));
    p.close();
    p.toggle();
    await Promise.allSettled(p.getAnimations({ subtree: true }).map((a) => a.finished));
  });
  await expect(page.getByRole('combobox')).toBeFocused();
  expect(await page.evaluate(() => window.paletteEvents)).toEqual([]);
  await page.getByRole('combobox').press('Enter');
  await expect(opener).toBeFocused();
  expect(await page.evaluate(() => window.paletteEvents)).toEqual(['usa:run', 'usa:close']);
  expectNoErrors(page);
});
