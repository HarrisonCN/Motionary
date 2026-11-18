import { expect, test } from '@playwright/test';

test('touch drag commits once, cancellation rolls back, and idle page scroll stays available', async ({ page }, info) => {
  await page.goto('/showcase/instruments.html');
  const card = page.locator('mo-lens-stack');
  const stage = card.locator('.mo-instrument-stage');
  await expect(stage).toBeVisible();
  expect(await stage.evaluate(el => getComputedStyle(el).touchAction)).toContain('pan-y');
  // Synthetic touch PointerEvents have no native active pointer ID. Exercise the same capture
  // lifecycle with explicit lostpointercapture, including engines without Chrome's input protocol.
  const outcome = await stage.evaluate(stage => {
    stage.setPointerCapture = () => {};
    stage.hasPointerCapture = () => false;
    const card = stage.closest('mo-lens-stack');
    const commits = [];
    card.addEventListener('usa:change', e => commits.push(e.detail.value));
    const emit = (type, x, y) => stage.dispatchEvent(new PointerEvent(type, {
      pointerId: 11, pointerType: 'touch', isPrimary: true, button: 0, clientX: x, clientY: y,
    }));
    const initial = card.value;
    emit('pointerdown', 30, 40); emit('pointermove', 32, 110); emit('pointercancel', 32, 110);
    const vertical = card.value;
    emit('pointerdown', 30, 40); emit('pointermove', 140, 41); emit('pointerup', 140, 41);
    const committed = card.value;
    emit('pointerdown', 140, 41); emit('pointermove', 70, 42); emit('lostpointercapture', 70, 42);
    return { initial, vertical, committed, afterCancel: card.value, commits };
  });
  expect(outcome.vertical).toBe(outcome.initial);
  expect(outcome.committed).toBeGreaterThan(outcome.initial);
  expect(outcome.afterCancel).toBe(outcome.committed);
  expect(outcome.commits).toEqual([outcome.committed]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: info.outputPath('spatial-mobile.png'), fullPage: true });
});

test('Chromium arbitrates native horizontal and vertical touch gestures on the same canvas', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Native touch sequences use Chromium input events');
  await page.goto('/showcase/instruments.html');
  const stage = page.locator('mo-lens-stack .mo-instrument-stage');
  await stage.scrollIntoViewIfNeeded();
  const rect = await stage.boundingBox();
  const cdp = await page.context().newCDPSession(page);
  async function swipe(dx, dy) {
    const x = rect.x + rect.width * .35, y = rect.y + rect.height * .65;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (let i = 1; i <= 8; i++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + dx * i / 8, y: y + dy * i / 8 }] });
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  }
  const value = () => page.locator('mo-lens-stack').evaluate(el => el.value);
  const before = await value();
  await swipe(90, 0);
  expect(await value()).toBeGreaterThan(before);
  const committed = await value(), scroll = await page.evaluate(() => scrollY);
  await swipe(0, -85);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(scroll);
  expect(await value()).toBe(committed);
});
