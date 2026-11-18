import { expect, test } from '@playwright/test';

test('instrument cards render, respond to mouse and keyboard, and survive reconnection', async ({ page }, info) => {
  await page.goto('/showcase/instruments.html');
  const card = page.locator('mo-lens-stack');
  const stage = card.locator('.mo-instrument-stage');
  const panel = card.locator('.mo-instrument');
  await expect(panel).toHaveAttribute('data-renderer', /^(webgl|diagram)$/);
  const box = await stage.boundingBox();
  await page.mouse.move(box.x + box.width * .25, box.y + box.height * .5);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * .50, box.y + box.height * .5, { steps: 6 });
  await page.mouse.up();
  await expect.poll(() => card.evaluate(el => el.value)).toBeGreaterThan(65);
  const range = card.getByRole('slider');
  await range.focus();
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowRight');
  await expect(range).toHaveValue('1');
  await card.evaluate(el => { const box = el.parentElement; el.remove(); box.prepend(el); });
  await expect(range).toHaveCount(1);
  await expect(range).toHaveValue('1');
  await range.press('End');
  await expect(range).toHaveValue('100');
  await page.screenshot({ path: info.outputPath('spatial-instruments.png'), fullPage: true });
});

test('with a WebGL2 context the three real scenes produce different frames', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/showcase/instruments.html');
  const supported = await page.evaluate(() => {
    const probe = document.createElement('canvas').getContext('webgl2');
    probe?.getExtension('WEBGL_lose_context')?.loseContext();
    return Boolean(probe);
  });
  test.skip(!supported, 'Runner exposes no WebGL2 context');
  for (const tag of ['mo-lens-stack', 'mo-iris-diaphragm', 'mo-contour-relief']) {
    const card = page.locator(tag);
    await card.scrollIntoViewIfNeeded();
    await expect(card.locator('.mo-instrument')).toHaveAttribute('data-renderer', 'webgl');
    const slider = card.getByRole('slider');
    await slider.press('Home');
    const first = await card.locator('canvas').screenshot();
    await slider.press('End');
    await expect.poll(async () => Buffer.compare(first, await card.locator('canvas').screenshot())).not.toBe(0);
  }
});

test('schematics and values stay interactive without WebGL2', async ({ page }) => {
  await page.addInitScript(() => {
    const get = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, ...args) {
      return type === 'webgl2' ? null : get.call(this, type, ...args);
    };
  });
  await page.goto('/showcase/instruments.html');
  const card = page.locator('mo-iris-diaphragm');
  await expect(card.locator('.mo-instrument')).toHaveAttribute('data-renderer', 'diagram');
  await card.getByRole('slider').press('End');
  await expect(card.locator('header span')).toHaveText('100%');
});
