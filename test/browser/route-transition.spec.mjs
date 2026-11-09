import { expect, test } from '@playwright/test';
import { define, openFixture } from './helpers.mjs';

test('a failed route fetch falls back to the clicked link with history disabled', async ({ page }) => {
  await openFixture(page);
  await define(page, 'usa-route-transition');
  await page.route('**/fallback-page', route => route.request().isNavigationRequest()
    ? route.fulfill({ contentType: 'text/html', body: '<h1>Destination</h1>' })
    : route.abort('failed'));
  await page.evaluate(() => {
    document.querySelector('#stage').innerHTML = '<usa-route-transition history="off"><a href="/fallback-page">Continue</a></usa-route-transition>';
  });
  await page.getByRole('link', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: 'Destination' })).toBeVisible();
});
