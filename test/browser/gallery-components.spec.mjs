import { expect, test } from '@playwright/test';
import { openFixture } from './helpers.mjs';

test('public gallery tags work after late registration with reduced motion', async ({ page }) => {
  await openFixture(page, { reducedMotion: 'reduce' });
  await page.evaluate(async () => {
    const { defineWidgets } = await import('motionary/components/widgets');
    defineWidgets('17.3');
    (await import('motionary/components/mo')).defineMoAliases();
    document.querySelector('#stage').innerHTML = `
      <mo-file-tree><details><summary>Files</summary><a href="#still">Still</a></details></mo-file-tree>
      <mo-download-menu><details><summary>Download</summary><a href="#file" download>PDF</a></details></mo-download-menu>
      <mo-title-sequence><details open><summary>Intro</summary><p>Day</p></details><details><summary>Credits</summary><p>Night</p></details></mo-title-sequence>`;
  });
  await page.getByText('Files', { exact: true }).press('ArrowRight');
  await page.getByText('Files', { exact: true }).press('ArrowRight');
  await expect(page.getByRole('link', { name: 'Still' })).toBeFocused();
  await page.getByText('Download', { exact: true }).click();
  const link = page.getByRole('link', { name: 'PDF' });
  await link.press('Escape');
  await expect(link).toBeHidden();
  await expect(page.getByText('Download', { exact: true })).toBeFocused();
  await page.getByText('Credits', { exact: true }).click();
  await expect(page.getByText('Night', { exact: true })).toBeVisible();
  await expect(page.getByText('Day', { exact: true })).toBeHidden();
});
