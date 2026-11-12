import { expect, test } from '@playwright/test';
import { openFixture, expectNoErrors } from './helpers.mjs';
async function setup(page, html, reducedMotion = 'no-preference') {
  await openFixture(page, { reducedMotion });
  await page.evaluate(async html => { const { defineWidgets } = await import('motionary/components/widgets'); defineWidgets('17.6'); document.getElementById('stage').innerHTML = html; }, html);
}
test('matter renders real pixels and offers keyboard activation, exit and live reduced motion', async ({ page }) => {
  await setup(page, '<mo-gravity-well animated style="width:480px"></mo-gravity-well>');
  const host = page.locator('mo-gravity-well'), canvas = host.locator('canvas');
  await expect.poll(() => canvas.evaluate(c => c.getContext('2d').getImageData(0, 0, c.width, c.height).data.filter((v, i) => i % 4 === 3 && v > 0).length)).toBeGreaterThan(500);
  await page.getByRole('button', { name: 'Interact', exact: true }).press('Enter'); await expect(canvas).toBeFocused();
  await canvas.press('ArrowRight'); await canvas.press('Space'); await canvas.press('Escape'); await expect(page.getByRole('button', { name: 'Interact', exact: true })).toBeFocused();
  await page.emulateMedia({ reducedMotion: 'reduce' }); await expect(host).toHaveAttribute('data-matter-calm', '');
  await page.waitForTimeout(80); // drain the shared scheduler's already queued final frame
  await page.evaluate(() => window.__probe.resetRaf()); await page.waitForTimeout(300); expect(await page.evaluate(() => window.__probe.rafCount())).toBe(0);
  await host.evaluate(el => el.remove()); await page.waitForTimeout(100); expectNoErrors(page);
});
test('reaction dots and contours stay finite, reset and tear down cleanly', async ({ page }) => {
  await setup(page, '<mo-reaction-field style="width:440px"></mo-reaction-field>');
  const host = page.locator('mo-reaction-field'), canvas = host.locator('canvas');
  await expect.poll(() => canvas.evaluate(c => c.getContext('2d').getImageData(0, 0, c.width, c.height).data.some((v, i) => i % 4 === 3 && v > 30))).toBe(true);
  await host.evaluate(el => { el.update({ mode: 'contour', shape: 'disc', feed: 'NaN', kill: 'Infinity' }); el.reset(); });
  await expect(canvas).toBeVisible(); await host.evaluate(el => el.remove()); await page.waitForTimeout(300);
  expect(await page.evaluate(() => window.__probe.snapshot().observersOnDetached)).toEqual([]); expectNoErrors(page);
});
test('hold action cancels early, confirms once and preserves native keyboard focus', async ({ page }) => {
  await setup(page, '<mo-hold-action duration="500"></mo-hold-action>');
  await page.locator('mo-hold-action').evaluate(el => { window.confirms = 0; window.cancels = 0; el.addEventListener('usa:confirm', () => window.confirms++); el.addEventListener('usa:cancel', () => window.cancels++); });
  const button = page.getByRole('button', { name: 'Hold to confirm', exact: true }); await button.focus();
  await page.keyboard.down('Space'); await page.waitForTimeout(100); await page.keyboard.up('Space'); expect(await page.evaluate(() => window.confirms)).toBe(0); expect(await page.evaluate(() => window.cancels)).toBe(1);
  await page.keyboard.down('Enter'); await expect.poll(() => page.locator('mo-hold-action').evaluate(el => el.confirmed)).toBe(true); await page.keyboard.up('Enter');
  await expect(page.getByRole('button', { name: 'Confirmed', exact: true })).toBeFocused(); expect(await page.evaluate(() => window.confirms)).toBe(1);
  await page.locator('mo-hold-action').evaluate(el => { el.reset(); el.setAttribute('disabled', ''); }); await expect(page.getByRole('button', { name: 'Hold to confirm', exact: true })).toBeDisabled(); expectNoErrors(page);
});
test('number stepping, curve edits and revision reveal keep the focused native control', async ({ page }) => {
  await setup(page, '<mo-scrub-number value="1.1" min="1" max="2" step=".1"></mo-scrub-number><mo-bezier-lab></mo-bezier-lab><mo-revision-reveal></mo-revision-reveal>');
  const number = page.getByRole('spinbutton', { name: 'Value', exact: true }); await number.focus(); await number.press('ArrowUp'); await expect(number).toHaveValue('1.2'); await number.press('End'); await expect(number).toHaveValue('2');
  const curve = page.getByRole('slider', { name: 'Control 1 X', exact: true }); await curve.focus(); await curve.press('ArrowRight'); await expect(curve).toBeFocused(); await expect(curve).toHaveValue('0.33');
  const reveal = page.getByRole('slider', { name: 'Revision reveal', exact: true }); await reveal.focus(); await reveal.press('End'); await expect(reveal).toHaveValue('100'); expectNoErrors(page);
});
test('standalone matter effects clear overlays and keep target focus on unbind', async ({ page }) => {
  await setup(page, '<button id="target">Original target</button>');
  await page.locator('#target').focus();
  await page.evaluate(async () => { const { registerMatterPack } = await import('motionary/components/fx-matter'); const { bindEffect } = await import('motionary/components/fx'); registerMatterPack(); window.stopMatter = bindEffect(document.getElementById('target'), 'mercury-morph', { trigger: 'load' }); });
  await expect(page.locator('[data-matter-effect]')).toHaveCount(1); await page.evaluate(() => window.stopMatter()); await expect(page.locator('[data-matter-effect]')).toHaveCount(0); await expect(page.locator('#target')).toBeFocused();
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.evaluate(async () => { const { playEffect } = await import('motionary/components/fx'); await playEffect(document.getElementById('target'), 'chemical-bloom'); }); await expect(page.locator('canvas')).toHaveCount(0); expectNoErrors(page);
});
